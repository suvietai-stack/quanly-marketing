ALTER TABLE public.app_roles ADD COLUMN biz_settings_disabled boolean NOT NULL DEFAULT false;
UPDATE public.app_roles SET biz_settings_disabled=true WHERE id='role-xwbmhg3b';
DO $$DECLARE d text;BEGIN
SELECT pg_get_functiondef('public.biz_can(uuid,text)'::regprocedure) INTO d;
d:=replace(d,'RETURN private.sig_can(_actor,_permission) AND NOT EXISTS(SELECT 1 FROM public.user_roles u WHERE u.user_id=_actor AND u.role_id=''role-xwbmhg3b'' AND NOT EXISTS(SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id=ur.role_id WHERE ur.user_id=_actor AND ur.role_id<>u.role_id AND _permission=ANY(r.permissions)));','RETURN _permission IN (''biz.org_manage'',''biz.dept_manage'',''biz.kr_manage'',''biz.deadline_manage'',''biz.workflow_manage'') AND private.sig_can(_actor,_permission) AND EXISTS(SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id=ur.role_id WHERE ur.user_id=_actor AND NOT r.biz_settings_disabled AND _permission=ANY(r.permissions));');EXECUTE d;
SELECT pg_get_functiondef('public.biz_participant(uuid)'::regprocedure) INTO d;d:=replace(d,'m WHERE m.user_id=_actor)','m WHERE m.user_id=_actor AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now()))');EXECUTE d;
END$$;
ALTER TABLE public.biz_positions ADD CONSTRAINT biz_position_executive_scope CHECK(NOT all_business OR (business_policy='executive' AND unit_kind='system'));
CREATE FUNCTION public.biz_my_work_access_guard(_kind text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT public.biz_can(auth.uid(),'biz.'||_kind||'_submit')$$;
DO $$DECLARE d text;BEGIN
SELECT pg_get_functiondef('public.biz_my_work(text)'::regprocedure) INTO d;d:=regexp_replace(d,'BEGIN','BEGIN IF NOT public.biz_my_work_access_guard(_kind) THEN RETURN jsonb_build_object(''items'',''[]''::jsonb,''server_now'',now());END IF;');EXECUTE d;
END$$;
REVOKE ALL ON FUNCTION public.biz_my_work_access_guard(text) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.biz_my_work_access_guard(text) TO authenticated;