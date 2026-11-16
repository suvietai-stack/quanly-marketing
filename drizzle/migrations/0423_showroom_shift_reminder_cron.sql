-- Scheduled next-week registration reminders in a separate, per-recipient outbox.
BEGIN;
SET LOCAL lock_timeout='3s';
CREATE OR REPLACE FUNCTION private.showroom_shift_alert_send(
 _recipient uuid,_store text,_week date,_kind text,_dedup text,_message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF _recipient IS NULL THEN RETURN; END IF;
 INSERT INTO public.showroom_shift_alerts(recipient_id,store_id,week_start,kind,dedup_key,message)
 VALUES(_recipient,_store,_week,_kind,left(_dedup,220),left(_message,300))
 ON CONFLICT(dedup_key) DO NOTHING;
END $fn$;
CREATE OR REPLACE FUNCTION public.showroom_shift_reminder_run()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE st record; usr record; wk date; cfg jsonb; wnd jsonb;
 opens_ timestamptz; closes_ timestamptz; n int; counter int:=0;
BEGIN
 wk:=(date_trunc('week',now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+7);
 FOR st IN SELECT u.id FROM public.org_units u
 JOIN public.org_units parent ON parent.id=u.parent_id AND parent.active AND parent.kind='system'
 JOIN public.org_units block ON block.id=parent.parent_id AND block.id='showroom-block' AND block.active
 WHERE u.active AND u.kind='department'
 LOOP
  cfg:=private.showroom_shift_policy(st.id);
  IF NOT coalesce((cfg->>'remind')::boolean,true) THEN CONTINUE; END IF;
  wnd:=private.showroom_shift_window(wk,cfg);
  opens_:=(wnd->>'open_at')::timestamptz;closes_:=(wnd->>'close_at')::timestamptz;
  IF now()<opens_ OR now()>=closes_ OR EXISTS(SELECT 1 FROM showroom_shift_weeks
   WHERE store_id=st.id AND week_start=wk AND status='published') THEN CONTINUE; END IF;
  FOR usr IN SELECT DISTINCT a.user_id FROM public.org_assignments a
    JOIN public.org_titles t ON t.id=a.title_id AND t.active AND t.kind='staff'
    JOIN public.profiles p ON p.id=a.user_id AND p.status='Đang hoạt động'
    WHERE a.unit_id=st.id AND a.status='active' AND a.starts_at<=now()
     AND (a.ends_at IS NULL OR a.ends_at>now())
  LOOP
   SELECT count(*) INTO n FROM showroom_shift_entries
    WHERE store_id=st.id AND staff_id=usr.user_id
      AND work_date BETWEEN wk AND wk+6 AND requested_shift IS NOT NULL;
   IF n>=7 THEN CONTINUE; END IF;
   PERFORM private.showroom_shift_alert_send(usr.user_id,st.id,wk,'shift_open',
    'sr:open:'||st.id||':'||wk||':'||usr.user_id,
    'Đã mở đăng ký lịch trực tuần sau. Hãy chọn ca và ngày nghỉ.');
   counter:=counter+1;
   IF closes_-now()<=interval '24 hours' THEN
    PERFORM private.showroom_shift_alert_send(usr.user_id,st.id,wk,'shift_deadline',
     'sr:deadline:'||st.id||':'||wk||':'||usr.user_id,
     'Sắp khóa đăng ký lịch trực tuần sau. Hãy gửi lịch đúng hạn.');
   END IF;
  END LOOP;
 END LOOP;
 RETURN counter;
END $fn$;
REVOKE ALL ON FUNCTION public.showroom_shift_reminder_run() FROM PUBLIC,anon,authenticated;
DO $do$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='showroom-shift-reminder-hourly') THEN
   PERFORM cron.schedule('showroom-shift-reminder-hourly','7 * * * *',
     'SELECT public.showroom_shift_reminder_run();');
 END IF;
END $do$;
COMMIT;