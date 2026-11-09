-- Thông báo Zalo nhóm GMF cho 3 chức năng tài chính: một OA chung, ba cấu hình độc lập.
-- Đồng thời siết RLS danh mục dùng chung (chỉ tài khoản đang hoạt động đọc được).

DROP POLICY IF EXISTS fr_types_read ON public.fr_payment_types;
CREATE POLICY fr_types_read ON public.fr_payment_types FOR SELECT TO authenticated USING (private.is_active(auth.uid()));
DROP POLICY IF EXISTS fr_line_catalog_read ON public.fr_line_catalog;
CREATE POLICY fr_line_catalog_read ON public.fr_line_catalog FOR SELECT TO authenticated USING (private.is_active(auth.uid()));

CREATE TABLE public.fr_zalo_group_config (
  kind text PRIMARY KEY CHECK (kind IN ('advance','payment','salary_advance')),
  group_id text,
  group_name text,
  enabled boolean NOT NULL DEFAULT false,
  on_submitted boolean NOT NULL DEFAULT true,
  on_info boolean NOT NULL DEFAULT true,
  on_approved boolean NOT NULL DEFAULT true,
  on_rejected boolean NOT NULL DEFAULT true,
  on_paid boolean NOT NULL DEFAULT true,
  on_settled boolean NOT NULL DEFAULT true,
  on_deducted boolean NOT NULL DEFAULT true,
  on_done boolean NOT NULL DEFAULT true,
  intro text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.fr_zalo_group_config (kind) VALUES ('advance'), ('payment'), ('salary_advance') ON CONFLICT DO NOTHING;

CREATE TABLE public.fr_zalo_group_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.fr_requests(id) ON DELETE CASCADE,
  kind text NOT NULL,
  event text NOT NULL CHECK (event IN ('submitted','info','approved','rejected','paid','settled','deducted','done')),
  dedup_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','unknown','skipped')),
  error text,
  attempts int NOT NULL DEFAULT 0,
  group_id text,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX fr_zalo_group_events_status_idx ON public.fr_zalo_group_events(status, created_at);

GRANT SELECT ON public.fr_zalo_group_config, public.fr_zalo_group_events TO authenticated;
GRANT ALL ON public.fr_zalo_group_config, public.fr_zalo_group_events TO service_role;
ALTER TABLE public.fr_zalo_group_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fr_zalo_group_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY fr_zalo_group_config_read ON public.fr_zalo_group_config FOR SELECT TO authenticated
  USING (private.sig_can(auth.uid(), private.fr_perm(kind, 'settings')));
CREATE POLICY fr_zalo_group_events_read ON public.fr_zalo_group_events FOR SELECT TO authenticated
  USING (private.sig_can(auth.uid(), private.fr_perm(kind, 'settings')));

CREATE OR REPLACE FUNCTION public.fr_zalo_can_manage(_kind text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.sig_can(auth.uid(), private.fr_perm(_kind, 'settings'));
$$;
REVOKE ALL ON FUNCTION public.fr_zalo_can_manage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_zalo_can_manage(text) TO authenticated;

-- Hàng đợi sự kiện: chỉ xếp khi cấu hình bật, có nhóm và sự kiện được bật; dedup_key chống trùng.
CREATE OR REPLACE FUNCTION private.fr_zalo_enqueue(_request_id uuid, _event text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.fr_zalo_group_config%ROWTYPE; _kind text; _seq int; _on boolean;
BEGIN
  SELECT r.kind INTO _kind FROM public.fr_requests r WHERE r.id = _request_id;
  IF _kind IS NULL THEN RETURN; END IF;
  SELECT * INTO c FROM public.fr_zalo_group_config WHERE kind = _kind;
  IF NOT FOUND OR NOT c.enabled OR coalesce(btrim(c.group_id), '') = '' THEN RETURN; END IF;
  _on := CASE _event
    WHEN 'submitted' THEN c.on_submitted WHEN 'info' THEN c.on_info
    WHEN 'approved' THEN c.on_approved WHEN 'rejected' THEN c.on_rejected
    WHEN 'paid' THEN c.on_paid WHEN 'settled' THEN c.on_settled
    WHEN 'deducted' THEN c.on_deducted WHEN 'done' THEN c.on_done ELSE false END;
  IF NOT _on THEN RETURN; END IF;
  SELECT count(*) INTO _seq FROM public.fr_zalo_group_events e WHERE e.request_id = _request_id AND e.event = _event;
  INSERT INTO public.fr_zalo_group_events(request_id, kind, event, dedup_key, group_id)
  VALUES (_request_id, _kind, _event, _event || ':' || _request_id::text || ':' || _seq, c.group_id)
  ON CONFLICT (dedup_key) DO NOTHING;
END $$;

-- Nguồn sự kiện 1: fr_events (submit/info/approved/reject/pay/settle/deduct). Lưu nháp (create/update) không gửi.
CREATE OR REPLACE FUNCTION private.fr_zalo_queue_event() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _evt text;
BEGIN
  _evt := CASE NEW.action
    WHEN 'submit' THEN 'submitted' WHEN 'info' THEN 'info' WHEN 'approved' THEN 'approved'
    WHEN 'reject' THEN 'rejected' WHEN 'pay' THEN 'paid' WHEN 'settle' THEN 'settled'
    WHEN 'deduct' THEN 'deducted' ELSE NULL END;
  IF _evt IS NOT NULL THEN PERFORM private.fr_zalo_enqueue(NEW.request_id, _evt); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER fr_zalo_queue_event_trg AFTER INSERT ON public.fr_events
  FOR EACH ROW EXECUTE FUNCTION private.fr_zalo_queue_event();

-- Nguồn sự kiện 2: chuyển sang Hoàn tất.
CREATE OR REPLACE FUNCTION private.fr_zalo_queue_done() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status IS DISTINCT FROM 'done' THEN
    PERFORM private.fr_zalo_enqueue(NEW.id, 'done');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER fr_zalo_queue_done_trg AFTER UPDATE OF status ON public.fr_requests
  FOR EACH ROW EXECUTE FUNCTION private.fr_zalo_queue_done();

-- Lưu cấu hình theo từng chức năng (quyền Cài đặt của chức năng đó).
CREATE OR REPLACE FUNCTION public.fr_zalo_group_save(
  _kind text, _group_id text, _group_name text, _enabled boolean, _toggles jsonb, _intro text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  PERFORM private.fr_kind_check(_kind);
  IF NOT private.sig_can(auth.uid(), private.fr_perm(_kind, 'settings')) THEN
    RAISE EXCEPTION 'Bạn không có quyền cài đặt thông báo của chức năng này.' USING ERRCODE='42501';
  END IF;
  IF _enabled AND coalesce(btrim(_group_id), '') = '' THEN
    RAISE EXCEPTION 'Chọn nhóm Zalo trước khi bật thông báo.';
  END IF;
  UPDATE public.fr_zalo_group_config SET
    group_id = nullif(btrim(_group_id), ''), group_name = nullif(btrim(_group_name), ''),
    enabled = coalesce(_enabled, false),
    on_submitted = coalesce((_toggles->>'submitted')::boolean, true),
    on_info = coalesce((_toggles->>'info')::boolean, true),
    on_approved = coalesce((_toggles->>'approved')::boolean, true),
    on_rejected = coalesce((_toggles->>'rejected')::boolean, true),
    on_paid = coalesce((_toggles->>'paid')::boolean, true),
    on_settled = coalesce((_toggles->>'settled')::boolean, true),
    on_deducted = coalesce((_toggles->>'deducted')::boolean, true),
    on_done = coalesce((_toggles->>'done')::boolean, true),
    intro = nullif(btrim(left(coalesce(_intro, ''), 300)), ''),
    updated_by = auth.uid(), updated_at = now()
  WHERE kind = _kind;
END $$;
REVOKE ALL ON FUNCTION public.fr_zalo_group_save(text, text, text, boolean, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_zalo_group_save(text, text, text, boolean, jsonb, text) TO authenticated;