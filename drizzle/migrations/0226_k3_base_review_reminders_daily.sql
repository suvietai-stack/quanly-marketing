CREATE FUNCTION public.k3_review_reminder_run() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE c k3_automation_config;d date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;tm time:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::time;u record;s jsonb;slot text;n int:=0;affected int;
BEGIN
 SELECT * INTO c FROM k3_automation_config WHERE id;
 IF NOT c.review_reminders OR NOT c.employee_review_enabled OR d<c.enabled_from OR tm>=c.close_time OR NOT EXISTS(SELECT 1 FROM k3_settings WHERE id AND enabled AND effective_from<=d) THEN RETURN 0; END IF;
 slot:=CASE WHEN c.review_second_reminder AND tm>=c.review_second_time THEN 'second' WHEN tm>=c.review_remind_time THEN 'first' END; IF slot IS NULL THEN RETURN 0; END IF;
 FOR u IN SELECT id FROM profiles WHERE status='Đang hoạt động' AND public.k3_can(id,'k3.use') LOOP
 IF EXISTS(SELECT 1 FROM leave_requests l WHERE l.owner_id=u.id AND l.type='leave' AND l.status='approved' AND d BETWEEN (l.payload->>'start_date')::date AND (l.payload->>'end_date')::date) THEN CONTINUE; END IF;
 s:=private.k3_employee_review_state(u.id,d);
 IF s->>'manual_status'='reviewed' OR ((s->>'action_count')::int=0 AND (s->>'result_count')::int=0) THEN CONTINUE; END IF;
 INSERT INTO notifications(recipient_id,kind,dedup_key,zalo_status,push_status,payload) VALUES(u.id,'biz_deadline','k3-review:'||d||':'||u.id||':'||slot,'ineligible','none',jsonb_build_object('module','k3','title','Tổng kết 3K hôm nay','body',CASE WHEN s->>'manual_status'='reconfirm' THEN 'Bạn đã cập nhật KPI sau khi tổng kết. Vui lòng kiểm tra và xác nhận lại.' ELSE 'Bạn chưa tổng kết 3K hôm nay. Vui lòng rà soát công việc và xác nhận trước giờ chốt tự động.' END,'url','/biz/3k')) ON CONFLICT(dedup_key) DO NOTHING;
 GET DIAGNOSTICS affected=ROW_COUNT;n:=n+affected;
 END LOOP; RETURN n;
END $fn$;
REVOKE ALL ON FUNCTION public.k3_review_reminder_run() FROM PUBLIC,anon,authenticated;GRANT EXECUTE ON FUNCTION public.k3_review_reminder_run() TO service_role;
CREATE FUNCTION private.k3_review_schedule() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE c k3_automation_config;utc time;job record;
BEGIN
 SELECT * INTO c FROM k3_automation_config WHERE id;
 FOR job IN SELECT jobid FROM cron.job WHERE jobname IN('k3-review-reminder-first','k3-review-reminder-second') LOOP PERFORM cron.unschedule(job.jobid); END LOOP;
 IF c.review_reminders AND c.employee_review_enabled THEN
 utc:=(c.review_remind_time-interval '7 hours')::time;
 PERFORM cron.schedule('k3-review-reminder-first',extract(minute FROM utc)::int||' '||extract(hour FROM utc)::int||' * * *','SELECT public.k3_review_reminder_run();');
 IF c.review_second_reminder THEN utc:=(c.review_second_time-interval '7 hours')::time; PERFORM cron.schedule('k3-review-reminder-second',extract(minute FROM utc)::int||' '||extract(hour FROM utc)::int||' * * *','SELECT public.k3_review_reminder_run();'); END IF;
 END IF;
END $fn$;
REVOKE ALL ON FUNCTION private.k3_review_schedule() FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text;BEGIN def:=pg_get_functiondef('public.k3_automation_save(jsonb)'::regprocedure);def:=replace(def,'RETURN public.k3_automation_read();','PERFORM private.k3_review_schedule(); RETURN public.k3_automation_read();');EXECUTE def;END $patch$;
SELECT private.k3_review_schedule();