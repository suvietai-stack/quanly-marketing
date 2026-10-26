-- Website Forms Integration — giai đoạn 1: bảng, quyền, RPC xử lý submission.

CREATE TABLE public.wf_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  source text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_by uuid,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wf_websites TO authenticated;
GRANT ALL ON public.wf_websites TO service_role;
ALTER TABLE public.wf_websites ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wf_keys (
  website_id uuid PRIMARY KEY REFERENCES public.wf_websites(id) ON DELETE CASCADE,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
GRANT ALL ON public.wf_keys TO service_role;
ALTER TABLE public.wf_keys ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wf_forms (
  website_id uuid NOT NULL REFERENCES public.wf_websites(id) ON DELETE CASCADE,
  form_id text NOT NULL,
  variant text NOT NULL DEFAULT '',
  name text NOT NULL,
  schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  schema_hash text,
  mapping jsonb,
  enabled boolean NOT NULL DEFAULT false,
  enabled_at timestamptz,
  needs_review boolean NOT NULL DEFAULT false,
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (website_id, form_id, variant)
);
GRANT SELECT ON public.wf_forms TO authenticated;
GRANT ALL ON public.wf_forms TO service_role;
ALTER TABLE public.wf_forms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wf_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES public.wf_websites(id) ON DELETE CASCADE,
  form_id text NOT NULL,
  variant text NOT NULL DEFAULT '',
  submission_id text NOT NULL,
  payload jsonb,
  page_url text,
  sent_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','skipped','duplicate','needs_action')),
  error text,
  attempts integer NOT NULL DEFAULT 0,
  signal_id uuid,
  source text,
  processed_at timestamptz,
  next_retry_at timestamptz,
  lease_token uuid,
  lease_until timestamptz,
  UNIQUE (website_id, submission_id)
);
CREATE INDEX wf_events_status_idx ON public.wf_events (status, received_at DESC);
CREATE INDEX wf_events_website_idx ON public.wf_events (website_id, received_at DESC);
GRANT SELECT ON public.wf_events TO authenticated;
GRANT ALL ON public.wf_events TO service_role;
ALTER TABLE public.wf_events ENABLE ROW LEVEL SECURITY;

-- Quyền quản lý tích hợp Website Forms (Super Admin luôn có qua sig_can).
CREATE OR REPLACE FUNCTION public.wf_can_manage()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$ SELECT COALESCE(private.sig_can(auth.uid(), 'integration.website_forms'), false); $$;
REVOKE ALL ON FUNCTION public.wf_can_manage() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wf_can_manage() TO authenticated;

CREATE POLICY wf_websites_select ON public.wf_websites FOR SELECT TO authenticated USING (public.wf_can_manage());
CREATE POLICY wf_forms_select ON public.wf_forms FOR SELECT TO authenticated USING (public.wf_can_manage());
CREATE POLICY wf_events_select ON public.wf_events FOR SELECT TO authenticated USING (public.wf_can_manage());

-- Nhận công việc xử lý (lease 2 phút), mirror fbl_claim_event.
CREATE OR REPLACE FUNCTION public.wf_claim_event(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $fn$
DECLARE e public.wf_events; tok uuid := gen_random_uuid();
BEGIN
  SELECT * INTO e FROM public.wf_events WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR e.signal_id IS NOT NULL OR e.status NOT IN ('pending','failed') OR e.attempts >= 10
     OR e.lease_until > now() OR (e.status = 'failed' AND e.next_retry_at > now()) THEN RETURN NULL; END IF;
  UPDATE public.wf_events SET attempts = attempts + 1, lease_token = tok, lease_until = now() + interval '2 minutes' WHERE id = p_id RETURNING * INTO e;
  RETURN to_jsonb(e);
END
$fn$;
REVOKE ALL ON FUNCTION public.wf_claim_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wf_claim_event(uuid) TO service_role;

-- Kết thúc xử lý với trạng thái lỗi/bỏ qua/cần xử lý, mirror fbl_finish_event.
CREATE OR REPLACE FUNCTION public.wf_finish_event(p_id uuid, p_lease uuid, p_patch jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $fn$
BEGIN
  IF p_patch->>'status' NOT IN ('failed','skipped','needs_action') THEN RAISE EXCEPTION 'Invalid finish status'; END IF;
  UPDATE public.wf_events
  SET status = p_patch->>'status', error = left(p_patch->>'error', 2000), processed_at = now(),
      lease_token = NULL, lease_until = NULL,
      next_retry_at = CASE WHEN p_patch->>'status' = 'failed'
        THEN now() + make_interval(secs => least(power(2, greatest(attempts,1)), 360)::int * 60) ELSE NULL END
  WHERE id = p_id AND lease_token = p_lease AND signal_id IS NULL;
  RETURN FOUND;
END
$fn$;
REVOKE ALL ON FUNCTION public.wf_finish_event(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wf_finish_event(uuid, uuid, jsonb) TO service_role;

-- Tạo tín hiệu + hoàn tất event trong một giao dịch khóa dòng, mirror fbl_complete_event.
CREATE OR REPLACE FUNCTION public.wf_complete_event(p_id uuid, p_lease uuid, p_draft jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $fn$
DECLARE e public.wf_events; f public.wf_forms; w public.wf_websites; sid uuid; made timestamptz;
BEGIN
  SELECT * INTO e FROM public.wf_events WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'missing'; END IF;
  IF e.signal_id IS NOT NULL THEN RETURN 'success'; END IF;
  IF e.lease_token IS DISTINCT FROM p_lease OR e.lease_until <= now() THEN RETURN 'busy'; END IF;
  SELECT * INTO f FROM public.wf_forms WHERE website_id = e.website_id AND form_id = e.form_id AND variant = e.variant FOR SHARE;
  SELECT * INTO w FROM public.wf_websites WHERE id = e.website_id FOR SHARE;
  IF f.form_id IS NULL OR w.id IS NULL OR w.status <> 'active' OR NOT f.enabled THEN
    PERFORM public.wf_finish_event(p_id, p_lease, '{"status":"skipped","error":"Form đang tắt đồng bộ hoặc Website bị thu hồi"}'::jsonb);
    RETURN 'skipped';
  END IF;
  IF f.needs_review OR w.source IS NULL OR w.source IS DISTINCT FROM p_draft->>'source' THEN
    PERFORM public.wf_finish_event(p_id, p_lease, '{"status":"needs_action","error":"Cấu hình Website/Form đã thay đổi, cần kiểm tra"}'::jsonb);
    RETURN 'needs_action';
  END IF;
  INSERT INTO public.opportunity_signals(customer_name, phone, address, products, need_groups, need_group, need_detail, marketing_note, source, detected_on, created_by)
  VALUES (p_draft->>'customer_name', p_draft->>'phone', p_draft->>'address',
    ARRAY(SELECT jsonb_array_elements_text(p_draft->'products')),
    ARRAY(SELECT jsonb_array_elements_text(p_draft->'need_groups')),
    p_draft->>'need_group', p_draft->>'need_detail', p_draft->>'marketing_note',
    w.source, (p_draft->>'detected_on')::date, '00000000-0000-0000-0000-00000000eb01')
  RETURNING id, created_at INTO sid, made;
  UPDATE public.wf_events
  SET signal_id = sid, status = 'success', error = NULL, source = w.source,
      processed_at = now(), next_retry_at = NULL, lease_token = NULL, lease_until = NULL
  WHERE id = p_id;
  PERFORM net.http_post(
    url := 'https://base.suviet.vn/api/public/zalo/dispatch-cron',
    headers := jsonb_build_object('Content-Type','application/json','x-care-token',(SELECT care_cron_token FROM public.zalo_oa_config WHERE id = 1)),
    body := '{}'::jsonb);
  RETURN 'success';
END
$fn$;
REVOKE ALL ON FUNCTION public.wf_complete_event(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wf_complete_event(uuid, uuid, jsonb) TO service_role;