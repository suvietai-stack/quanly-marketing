BEGIN;
CREATE OR REPLACE FUNCTION public.wf_complete_event(p_id uuid, p_lease uuid, p_draft jsonb)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
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
    w.source, (p_draft->>'detected_on')::date, CASE WHEN e.form_id='base-web-chat' AND EXISTS(SELECT 1 FROM public.wc_sites WHERE id=e.website_id) THEN '00000000-0000-0000-0000-00000000dc01'::uuid ELSE '00000000-0000-0000-0000-00000000eb01'::uuid END)
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
$function$
;
CREATE OR REPLACE FUNCTION public.wc_finish(p_conversation uuid, p_request uuid, p_lease uuid, p_revision integer, p_answer text, p_contact jsonb, p_summary text, p_draft jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE c public.wc_conversations; e public.wf_events; work jsonb; result text; closing text; sid uuid;
BEGIN
 SELECT * INTO c FROM public.wc_conversations WHERE id=p_conversation FOR UPDATE;
 IF NOT FOUND OR c.mode='human' OR c.lease IS DISTINCT FROM p_lease OR c.lease_until<=now() OR c.revision<>p_revision THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.wc_sites WHERE id=c.site_id AND enabled) THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.wc_messages WHERE conversation_id=c.id AND request_id=p_request AND role='user' AND state IN('pending','error')) THEN RETURN false; END IF;
 IF c.signal_id IS NULL AND p_draft IS NOT NULL THEN
  IF p_draft->>'phone' !~ '^0[35789][0-9]{8}$' OR length(coalesce(p_draft->>'need_detail',''))<3 THEN RAISE EXCEPTION 'Invalid lead'; END IF;
  INSERT INTO public.wf_events(website_id,form_id,submission_id,payload,page_url)
   VALUES(c.site_id,'base-web-chat','wc:'||c.id::text,p_contact,c.page_url) ON CONFLICT(website_id,submission_id) DO NOTHING;
  SELECT * INTO e FROM public.wf_events WHERE website_id=c.site_id AND submission_id='wc:'||c.id::text FOR UPDATE;
  IF e.signal_id IS NULL THEN
   work:=public.wf_claim_event(e.id);
   IF work IS NULL THEN RAISE EXCEPTION 'Lead busy'; END IF;
   result:=public.wf_complete_event(e.id,(work->>'lease_token')::uuid,p_draft);
   IF result<>'success' THEN RAISE EXCEPTION 'Lead not saved'; END IF;
  END IF;
  SELECT signal_id INTO sid FROM public.wf_events WHERE id=e.id;
  -- Distinct system attribution; never create an employee/Auth account or reassign an existing signal.
  SELECT settings->>'closing' INTO closing FROM public.wc_sites WHERE id=c.site_id;
  p_answer:=left('Em ghi nhận nhu cầu: '||coalesce(p_contact->>'need','')||E'\n'||coalesce(closing,'Bộ phận tư vấn sẽ liên hệ anh chị.'),2500);
 END IF;
 INSERT INTO public.wc_messages(conversation_id,request_id,role,body) VALUES(c.id,p_request,'assistant',left(p_answer,2500)) ON CONFLICT DO NOTHING;
 UPDATE public.wc_messages SET state='done' WHERE conversation_id=c.id AND request_id=p_request AND role='user';
 UPDATE public.wc_conversations SET lease=NULL,lease_until=NULL,contact=p_contact,summary=left(p_summary,2500),
  signal_id=coalesce(c.signal_id,sid),mode=CASE WHEN coalesce(c.signal_id,sid) IS NOT NULL THEN 'captured' ELSE 'ai' END,error=NULL,updated_at=now() WHERE id=c.id;
 RETURN true;
END $function$
;
COMMIT;