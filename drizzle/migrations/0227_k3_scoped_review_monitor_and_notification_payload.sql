CREATE FUNCTION public.k3_employee_review_team(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid();rows jsonb;
BEGIN
 IF uid IS NULL OR NOT public.k3_can(uid,'k3.view_scope') THEN RAISE EXCEPTION 'Bạn không có quyền theo dõi tổng kết.'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',p.id,'name',p.full_name,'department',dep.name,'data',private.k3_employee_review_state(p.id,_date)) ORDER BY p.full_name),'[]') INTO rows FROM profiles p LEFT JOIN biz_departments dep ON dep.id=public.biz_department_at(p.id,_date) WHERE public.k3_can(p.id,'k3.use') AND (public.biz_admin(uid) OR public.biz_scope_ok(uid,p.id,coalesce((SELECT department_id FROM k3_daily_closes WHERE user_id=p.id AND work_date=_date),dep.id),_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) AND (NOT public.biz_admin(p.id) OR public.biz_participant(p.id));
 RETURN rows; END $fn$;
REVOKE ALL ON FUNCTION public.k3_employee_review_team(date) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.k3_employee_review_team(date) TO authenticated;
DO $patch$ DECLARE def text;BEGIN
 def:=pg_get_functiondef('public.k3_review_reminder_run()'::regprocedure);def:=replace(def,$old$'body',CASE$old$,$new$'message',CASE$new$);EXECUTE def;
 def:=pg_get_functiondef('private.k3_employee_day_source(uuid,date)'::regprocedure);
 def:=replace(def,$old$'revision',to_jsonb(a)->'revision'$old$,$new$'metric',private.k3_entity_metric('action',a.id),'overdue',a.due_date<_date,'revision',to_jsonb(a)->'revision'$new$);EXECUTE def;
 def:=pg_get_functiondef('public.k3_employee_review_confirm(date,text,uuid,boolean)'::regprocedure);def:=replace(def,'PERFORM private.k3_write_guard(_date);',$new$IF NOT coalesce((SELECT employee_review_enabled FROM k3_automation_config WHERE id),true) THEN RAISE EXCEPTION 'Tổng kết thủ công đang tắt.'; END IF; PERFORM private.k3_write_guard(_date);$new$);EXECUTE def;
END $patch$;