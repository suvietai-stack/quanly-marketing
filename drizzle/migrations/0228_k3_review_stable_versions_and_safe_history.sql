CREATE FUNCTION private.k3_review_fingerprint(_source jsonb) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $fn$
 SELECT md5((jsonb_set(_source,'{actions}',coalesce((SELECT jsonb_agg(a-'metric'-'overdue' ORDER BY a->>'id') FROM jsonb_array_elements(_source->'actions') a),'[]')))::text);
$fn$;
REVOKE ALL ON FUNCTION private.k3_review_fingerprint(jsonb) FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text;BEGIN
 def:=pg_get_functiondef('private.k3_employee_review_state(uuid,date)'::regprocedure);def:=replace(def,'ver:=md5(s::text);','ver:=private.k3_review_fingerprint(s);');EXECUTE def;
 def:=pg_get_functiondef('public.k3_employee_review_confirm(date,text,uuid,boolean)'::regprocedure);def:=replace(def,'md5(s::text)','private.k3_review_fingerprint(s)');EXECUTE def;
END $patch$;
ALTER POLICY k3_employee_review_read ON public.k3_employee_reviews USING(user_id=auth.uid() OR public.biz_admin(auth.uid()) OR (public.k3_can(auth.uid(),'k3.view_scope') AND public.biz_scope_ok(auth.uid(),user_id,coalesce((SELECT department_id FROM k3_daily_closes WHERE user_id=k3_employee_reviews.user_id AND work_date=k3_employee_reviews.work_date),public.biz_department_at(user_id,work_date)),work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')));
CREATE FUNCTION public.k3_zalo_report_preview(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE c k3_automation_config;data jsonb;
BEGIN
 IF NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Bạn không có quyền xem trước báo cáo.'; END IF;
 SELECT * INTO c FROM k3_automation_config WHERE id;
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'department_id',department_id,'data',snapshot) ORDER BY snapshot->>'name'),'[]') INTO data FROM k3_daily_closes WHERE work_date=_date AND (c.scope_kind='all' OR c.scope_kind='system' AND system_id=c.scope_id OR c.scope_kind='department' AND department_id=c.scope_id);
 RETURN data; END $fn$;
REVOKE ALL ON FUNCTION public.k3_zalo_report_preview(date) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.k3_zalo_report_preview(date) TO authenticated;
DO $patch$ DECLARE def text;BEGIN
 def:=pg_get_functiondef('public.k3_automation_save(jsonb)'::regprocedure);
 def:=replace(def,'SELECT to_jsonb(c) INTO old', $new$IF coalesce((_payload->>'review_reminders')::boolean,false) AND (coalesce((_payload->>'review_remind_time')::time,'17:00')>=ct OR extract(second FROM coalesce((_payload->>'review_remind_time')::time,'17:00'))<>0 OR coalesce((_payload->>'review_second_reminder')::boolean,false) AND (coalesce((_payload->>'review_second_time')::time,'17:30')>=ct OR coalesce((_payload->>'review_second_time')::time,'17:30')<=coalesce((_payload->>'review_remind_time')::time,'17:00'))) THEN RAISE EXCEPTION 'Giờ nhắc phải trước giờ chốt; lần hai phải sau lần đầu.'; END IF; SELECT to_jsonb(c) INTO old$new$);EXECUTE def;
END $patch$;