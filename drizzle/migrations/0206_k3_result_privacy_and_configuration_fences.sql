CREATE FUNCTION private.k3_result_detail_ok(_actor uuid,_owner uuid,_goal uuid,_date date) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT _actor IS NOT NULL AND EXISTS(SELECT 1 FROM k3_goals g WHERE g.id=_goal AND (public.biz_admin(_actor) OR (_actor=_owner AND public.k3_goal_visible(_actor,g.id)) OR (g.user_id=_actor AND public.k3_can(_actor,'k3.use')) OR (public.k3_can(_actor,'k3.view_scope') AND public.biz_scope_ok(_actor,_owner,g.department_id,(_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))))
$fn$;
REVOKE ALL ON FUNCTION private.k3_result_detail_ok(uuid,uuid,uuid,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.k3_result_detail_ok(uuid,uuid,uuid,date) TO authenticated;
DROP POLICY k3_result_read ON public.k3_kpi_results;
CREATE POLICY k3_result_read ON public.k3_kpi_results FOR SELECT TO authenticated USING(private.k3_result_detail_ok(auth.uid(),user_id,goal_id,work_date));
DROP POLICY k3_result_version_read ON public.k3_kpi_result_versions;
CREATE POLICY k3_result_version_read ON public.k3_kpi_result_versions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM k3_kpi_results r WHERE r.id=result_id AND private.k3_result_detail_ok(auth.uid(),r.user_id,r.goal_id,r.work_date)));
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_result_read(uuid,date)'::regprocedure);
 def:=replace(def,'to_jsonb(r)||jsonb_build_object', '(CASE WHEN private.k3_result_detail_ok(auth.uid(),r.user_id,r.goal_id,r.work_date) THEN to_jsonb(r) ELSE to_jsonb(r)-ARRAY[''note'',''evidence'',''problem'',''cause'',''solution''] END)||jsonb_build_object');
 def:=replace(def,'WHERE r.kpi_id=k.id),''[]''::jsonb)', 'WHERE r.kpi_id=k.id AND private.k3_result_detail_ok(auth.uid(),r.user_id,r.goal_id,r.work_date)),''[]''::jsonb)');
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_configure(jsonb)'::regprocedure);
 def:=replace(def,'AS $function$','AS $function$'||chr(10)||'#variable_conflict use_variable');
 def:=replace(def,'IF kid IS NOT NULL THEN SELECT','IF kid IS NOT NULL THEN PERFORM pg_advisory_xact_lock(hashtext(''k3result''),hashtext(kid::text)); SELECT');
 def:=replace(def,'RETURN to_jsonb(k);','INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) SELECT g.user_id,perm,aid,auth.uid(),''kpi_configure'',jsonb_build_object(''kpi_id'',k.id) FROM k3_goals g WHERE g.id=perm; RETURN to_jsonb(k);');
 EXECUTE def;
END$patch$;
-- Keep the older endpoint compatible, but prohibit manual actuals and share the guarded configuration writer.
CREATE OR REPLACE FUNCTION public.k3_kpi_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF nullif(_payload->>'manual_actual','') IS NOT NULL THEN RAISE EXCEPTION 'Ghi kết quả qua Cập nhật KPI theo ngày, không nhập giá trị xác nhận thủ công.'; END IF;
 RETURN public.k3_kpi_configure(_payload||jsonb_build_object('measure',coalesce(_payload->>'measure',_payload->>'kind','cumulative')));
END$fn$;
COMMENT ON COLUMN public.k3_kpis.manual_actual IS 'DEPRECATED: new measured results are stored by KPI/performer/date; legacy value retained for audit.';