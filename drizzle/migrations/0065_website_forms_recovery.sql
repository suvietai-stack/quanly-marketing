CREATE OR REPLACE FUNCTION public.wf_complete_event(p_id uuid, p_lease uuid, p_draft jsonb)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE e public.wf_events; f public.wf_forms; w public.wf_websites; sid uuid; made timestamptz;
BEGIN
  SELECT * INTO e FROM public.wf_events WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'missing'; END IF;
  IF e.signal_id IS NOT NULL THEN RETURN 'success'; END IF;
  IF e.lease_token IS DISTINCT FROM p_lease OR e.lease_until <= now() THEN RETURN 'busy'; END IF;
  SELECT * INTO f FROM public.wf_forms WHERE website_id = e.website_id AND form_id = e.form_id AND variant = e.variant FOR SHARE;
  IF f.form_id IS NULL THEN
    SELECT * INTO f FROM public.wf_forms WHERE website_id = e.website_id AND form_id = e.form_id AND variant = '' FOR SHARE;
  END IF;
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
  -- Đánh thức Zalo là phụ: lỗi ở đây không được hủy tín hiệu vừa tạo.
  BEGIN
    PERFORM net.http_post(
      url := 'https://base.suviet.vn/api/public/zalo/dispatch-cron',
      headers := jsonb_build_object('Content-Type','application/json','x-care-token',coalesce((SELECT care_cron_token FROM public.zalo_oa_config WHERE id = 1),'')),
      body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN 'success';
END
$function$;

CREATE UNIQUE INDEX IF NOT EXISTS wf_events_signal_uniq ON public.wf_events(signal_id) WHERE signal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS wf_events_recover_idx ON public.wf_events(status, received_at) WHERE signal_id IS NULL;