-- lovable-cron-fallback-reviewed: wake on enqueue; two-minute lease recovery only while queue exists; unschedule after drain
ALTER TABLE public.fbl_events ADD COLUMN receipt_method text NOT NULL DEFAULT 'legacy_unknown' CHECK (receipt_method IN ('webhook','reconciliation','backfill','legacy_unknown'));
ALTER TABLE public.fbl_events ADD COLUMN webhook_received_at timestamptz;
ALTER TABLE public.fbl_events ADD COLUMN signal_created_at timestamptz;
ALTER TABLE public.fbl_events ADD COLUMN lease_token uuid;
ALTER TABLE public.fbl_events ADD COLUMN lease_until timestamptz;
ALTER TABLE public.fbl_state ADD COLUMN last_webhook_at timestamptz;
UPDATE public.fbl_events SET receipt_method='backfill' WHERE backfill;
UPDATE public.fbl_events e SET signal_created_at=s.created_at FROM public.opportunity_signals s WHERE e.signal_id=s.id;
CREATE INDEX fbl_pending_lease_idx ON public.fbl_events(lease_until,received_at) WHERE status IN ('pending','failed');
CREATE OR REPLACE FUNCTION public.fbl_dispatch_wake() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE tok text;
BEGIN
 SELECT care_cron_token INTO tok FROM public.zalo_oa_config WHERE id=1;
 IF tok IS NULL OR tok='' THEN RETURN; END IF;
 PERFORM net.http_post(url:='https://base.suviet.vn/api/public/meta/dispatch',headers:=jsonb_build_object('Content-Type','application/json','x-care-token',tok),body:='{}'::jsonb,timeout_milliseconds:=60000);
END $$;
CREATE OR REPLACE FUNCTION public.fbl_retry_tick() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(621062);
 IF EXISTS (SELECT 1 FROM public.fbl_events WHERE signal_id IS NULL AND status IN ('pending','failed') AND attempts<10) THEN
  IF EXISTS (SELECT 1 FROM public.fbl_events WHERE signal_id IS NULL AND attempts<10 AND (lease_until IS NULL OR lease_until<=now()) AND (status='pending' OR (status='failed' AND next_retry_at<=now()))) THEN PERFORM public.fbl_dispatch_wake(); END IF;
 ELSE
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='fbl-queue-retry';
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.fbl_event_wake() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(621062);
 IF NEW.signal_id IS NULL AND NEW.status IN ('pending','failed') AND NEW.attempts<10 THEN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname='fbl-queue-retry') THEN PERFORM cron.schedule('fbl-queue-retry','*/2 * * * *','select public.fbl_retry_tick()'); END IF;
  IF NEW.status='pending' AND (NEW.lease_until IS NULL OR NEW.lease_until<=now()) THEN PERFORM public.fbl_dispatch_wake(); END IF;
 ELSIF NOT EXISTS (SELECT 1 FROM public.fbl_events WHERE signal_id IS NULL AND status IN ('pending','failed') AND attempts<10) THEN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='fbl-queue-retry';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER fbl_event_wake AFTER INSERT OR UPDATE OF status ON public.fbl_events FOR EACH ROW EXECUTE FUNCTION public.fbl_event_wake();
CREATE OR REPLACE FUNCTION public.fbl_claim_event(p_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE e public.fbl_events; tok uuid:=gen_random_uuid();
BEGIN
 SELECT * INTO e FROM public.fbl_events WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR e.signal_id IS NOT NULL OR e.status NOT IN ('pending','failed') OR e.attempts>=10 OR e.lease_until>now() OR (e.status='failed' AND e.next_retry_at>now()) THEN RETURN NULL; END IF;
 UPDATE public.fbl_events SET attempts=attempts+1,lease_token=tok,lease_until=now()+interval '2 minutes' WHERE id=p_id RETURNING * INTO e;
 RETURN to_jsonb(e);
END $$;
CREATE OR REPLACE FUNCTION public.fbl_finish_event(p_id uuid,p_lease uuid,p_patch jsonb) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 IF p_patch->>'status' NOT IN ('failed','skipped','needs_action') THEN RAISE EXCEPTION 'Invalid finish status'; END IF;
 UPDATE public.fbl_events SET status=p_patch->>'status',error=left(p_patch->>'error',2000),processed_at=now(),lease_token=NULL,lease_until=NULL,next_retry_at=CASE WHEN p_patch->>'status'='failed' THEN now()+make_interval(secs=>least(power(2,greatest(attempts,1)),360)::int*60) ELSE NULL END WHERE id=p_id AND lease_token=p_lease AND signal_id IS NULL;
 RETURN FOUND;
END $$;
CREATE OR REPLACE FUNCTION public.fbl_complete_event(p_id uuid,p_lease uuid,p_draft jsonb,p_lead jsonb) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE e public.fbl_events; f public.fbl_forms; p public.fbl_pages; sid uuid; made timestamptz;
BEGIN
 SELECT * INTO e FROM public.fbl_events WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RETURN 'missing'; END IF;
 IF e.signal_id IS NOT NULL THEN RETURN 'success'; END IF;
 IF e.lease_token IS DISTINCT FROM p_lease OR e.lease_until<=now() THEN RETURN 'busy'; END IF;
 SELECT * INTO f FROM public.fbl_forms WHERE form_id=e.form_id FOR SHARE;
 SELECT * INTO p FROM public.fbl_pages WHERE page_id=e.page_id FOR SHARE;
 IF f.form_id IS NULL OR p.page_id IS NULL OR p.status='disconnected' OR NOT f.enabled OR (NOT e.backfill AND (f.enabled_at IS NULL OR coalesce(e.lead_created_at,e.received_at)<f.enabled_at)) THEN
  PERFORM public.fbl_finish_event(p_id,p_lease,'{"status":"skipped","error":"Form đang tắt hoặc lead trước thời điểm bật đồng bộ"}'::jsonb); RETURN 'skipped';
 END IF;
 IF f.needs_review OR p.source IS NULL OR p.source IS DISTINCT FROM p_draft->>'source' THEN
  PERFORM public.fbl_finish_event(p_id,p_lease,'{"status":"needs_action","error":"Cấu hình Page/Form đã thay đổi, cần kiểm tra"}'::jsonb); RETURN 'needs_action';
 END IF;
 INSERT INTO public.opportunity_signals(customer_name,phone,address,products,need_groups,need_group,need_detail,marketing_note,source,detected_on,created_by)
 VALUES(p_draft->>'customer_name',p_draft->>'phone',p_draft->>'address',ARRAY(SELECT jsonb_array_elements_text(p_draft->'products')),ARRAY(SELECT jsonb_array_elements_text(p_draft->'need_groups')),p_draft->>'need_group',p_draft->>'need_detail',p_draft->>'marketing_note',p.source,(p_draft->>'detected_on')::date,'00000000-0000-0000-0000-00000000fb01') RETURNING id,created_at INTO sid,made;
 UPDATE public.fbl_events SET signal_id=sid,signal_created_at=made,status='success',error=NULL,source=p.source,ad_id=coalesce(p_lead->>'ad_id',e.ad_id),campaign_id=p_lead->>'campaign_id',lead_created_at=coalesce((p_lead->>'created_time')::timestamptz,e.lead_created_at),processed_at=now(),next_retry_at=NULL,lease_token=NULL,lease_until=NULL WHERE id=p_id;
 PERFORM net.http_post(url:='https://base.suviet.vn/api/public/zalo/dispatch-cron',headers:=jsonb_build_object('Content-Type','application/json','x-care-token',(SELECT care_cron_token FROM public.zalo_oa_config WHERE id=1)),body:='{}'::jsonb);
 RETURN 'success';
END $$;
REVOKE ALL ON FUNCTION public.fbl_dispatch_wake(),public.fbl_retry_tick(),public.fbl_event_wake(),public.fbl_claim_event(uuid),public.fbl_finish_event(uuid,uuid,jsonb),public.fbl_complete_event(uuid,uuid,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fbl_dispatch_wake(),public.fbl_retry_tick(),public.fbl_claim_event(uuid),public.fbl_finish_event(uuid,uuid,jsonb),public.fbl_complete_event(uuid,uuid,jsonb,jsonb) TO service_role;