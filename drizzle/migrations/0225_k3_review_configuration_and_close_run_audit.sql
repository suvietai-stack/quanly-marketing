ALTER TABLE public.k3_automation_config ADD COLUMN employee_review_enabled boolean NOT NULL DEFAULT true,ADD COLUMN review_reminders boolean NOT NULL DEFAULT true,ADD COLUMN review_remind_time time NOT NULL DEFAULT '17:00',ADD COLUMN review_second_reminder boolean NOT NULL DEFAULT false,ADD COLUMN review_second_time time NOT NULL DEFAULT '17:30';
CREATE TABLE public.k3_close_runs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),work_date date NOT NULL,user_id uuid NOT NULL,status text NOT NULL,error text,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.k3_close_runs TO authenticated; GRANT ALL ON public.k3_close_runs TO service_role; ALTER TABLE public.k3_close_runs ENABLE ROW LEVEL SECURITY; CREATE POLICY k3_close_run_admin ON public.k3_close_runs FOR SELECT TO authenticated USING(public.biz_admin(auth.uid()));
CREATE OR REPLACE FUNCTION public.k3_auto_close_run() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE d date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;c k3_automation_config;u record;s jsonb;n int:=0; failures int:=0;
BEGIN
 SELECT * INTO c FROM k3_automation_config WHERE id;
 IF NOT c.auto_close OR (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::time<c.close_time OR d<c.enabled_from OR NOT EXISTS(SELECT 1 FROM k3_settings WHERE id AND enabled AND effective_from<=d) THEN RETURN jsonb_build_object('closed',0); END IF;
 FOR u IN SELECT p.id FROM profiles p WHERE p.status='Đang hoạt động' AND public.k3_can(p.id,'k3.use') LOOP
 s:=private.k3_employee_day_source(u.id,d);
 IF ((s->>'action_count')::int=0 AND (s->>'result_count')::int=0) OR EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=u.id AND work_date=d) THEN CONTINUE; END IF;
 BEGIN PERFORM private.k3_close_one(u.id,d,'auto'); INSERT INTO k3_close_runs(work_date,user_id,status) VALUES(d,u.id,'closed'); n:=n+1;
 EXCEPTION WHEN OTHERS THEN INSERT INTO k3_close_runs(work_date,user_id,status,error) VALUES(d,u.id,'failed',left(SQLERRM,300));failures:=failures+1; END;
 END LOOP;
 RETURN jsonb_build_object('closed',n,'failed',failures);
END $fn$;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_automation_save(jsonb)'::regprocedure);
 def:=replace(def,'RETURN public.k3_automation_read();',$new$UPDATE k3_automation_config SET employee_review_enabled=coalesce((_payload->>'employee_review_enabled')::boolean,employee_review_enabled),review_reminders=coalesce((_payload->>'review_reminders')::boolean,review_reminders),review_remind_time=coalesce((_payload->>'review_remind_time')::time,review_remind_time),review_second_reminder=coalesce((_payload->>'review_second_reminder')::boolean,review_second_reminder),review_second_time=coalesce((_payload->>'review_second_time')::time,review_second_time) WHERE id; RETURN public.k3_automation_read();$new$);
 EXECUTE def;
END $patch$;