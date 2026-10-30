ALTER TABLE public.app_roles ADD COLUMN biz_scope text NOT NULL DEFAULT 'assigned' CHECK(biz_scope IN ('assigned','individual','team','department','system','all'));
CREATE FUNCTION public.biz_role_scope_allows(_actor uuid,_kind text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT public.is_super_admin(_actor) OR EXISTS(SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id=ur.role_id WHERE ur.user_id=_actor AND EXISTS(SELECT 1 FROM unnest(r.permissions) p WHERE p LIKE 'biz.%') AND (r.biz_scope IN ('assigned','all') OR r.biz_scope=_kind OR (r.biz_scope='system' AND _kind IN ('department','team')) OR (r.biz_scope='department' AND _kind='team')))$$;
CREATE FUNCTION public.biz_all_scope(_actor uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT private.sig_can(_actor,'biz.view_all') AND public.biz_role_scope_allows(_actor,'all')$$;
CREATE FUNCTION public.biz_role_scope_save(_role text,_scope text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE old_ text;BEGIN
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') OR NOT (public.is_super_admin(auth.uid()) OR private.sig_can(auth.uid(),'settings.role')) THEN RAISE EXCEPTION 'Không có quyền quản lý phân quyền.';END IF;
IF _role='super_admin' THEN RAISE EXCEPTION 'Không giảm phạm vi Super Admin.';END IF;
SELECT biz_scope INTO old_ FROM public.app_roles WHERE id=_role FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy Role.';END IF;
UPDATE public.app_roles SET biz_scope=_scope,updated_at=now() WHERE id=_role;
INSERT INTO public.biz_org_events(actor_id,action,payload) VALUES(auth.uid(),'role_scope',jsonb_build_object('role_id',_role,'old',old_,'new',_scope));END $$;
CREATE FUNCTION public.biz_role_scopes_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$BEGIN
IF NOT public.is_super_admin(auth.uid()) AND NOT private.sig_can(auth.uid(),'settings.role') THEN RAISE EXCEPTION 'Không có quyền xem phân quyền.';END IF;
RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('id',id,'scope',biz_scope)) FROM public.app_roles),'[]');END $$;
DO $$DECLARE f record;def text;BEGIN
FOR f IN SELECT oid FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname LIKE 'biz_%' AND proname NOT IN ('biz_all_scope','biz_role_scope_allows') LOOP
SELECT pg_get_functiondef(f.oid) INTO def;
def:=replace(def,'private.sig_can(auth.uid(),''biz.view_all'')','public.biz_all_scope(auth.uid())');
def:=replace(def,'private.sig_can(a,''biz.view_all'')','public.biz_all_scope(a)');
def:=replace(def,'private.sig_can(_actor,''biz.view_all'')','public.biz_all_scope(_actor)');
IF position('FUNCTION public.biz_scope_ok(' IN def)>0 THEN
 def:=replace(def,'a.user_id=_actor AND public.biz_appointment_scope','a.user_id=_actor AND public.biz_role_scope_allows(_actor,a.scope_kind) AND public.biz_appointment_scope');
 def:=replace(def,'a.position=''director'' AND EXISTS','a.position=''director'' AND public.biz_role_scope_allows(_actor,''system'') AND EXISTS');
 def:=replace(def,'a.position=''department_head'' AND a.department_id','a.position=''department_head'' AND public.biz_role_scope_allows(_actor,''department'') AND a.department_id');
 def:=replace(def,'a.position=''team_lead'' AND EXISTS','a.position=''team_lead'' AND public.biz_role_scope_allows(_actor,''team'') AND EXISTS');
 def:=replace(def,'AND EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor','AND public.biz_role_scope_allows(_actor,''department'') AND EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor');
END IF;EXECUTE def;END LOOP;END $$;
CREATE FUNCTION public.biz_step_scope_ok(_steps jsonb,_index int,_actor uuid,_owner uuid,_dept uuid,_at timestamptz) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT public.is_super_admin(_actor) OR public.biz_scope_ok(_actor,_owner,_dept,_at) OR (public.biz_role_scope_allows(_actor,'individual') AND (_steps->_index->>'type'='user' OR _steps->_index->>'substitute_id'=_actor::text) AND (_steps->_index->>'user_id'=_actor::text OR _steps->_index->>'substitute_id'=_actor::text))$$;
DO $$DECLARE def text;BEGIN
SELECT pg_get_functiondef('public.biz_approval_step(uuid,boolean,text)'::regprocedure) INTO def;
def:=replace(def,'IF r.owner_id=auth.uid() OR NOT public.biz_run_assigned','IF NOT public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at) OR r.owner_id=auth.uid() OR NOT public.biz_run_assigned');EXECUTE def;
SELECT pg_get_functiondef('public.biz_approval_start(uuid,text,uuid,uuid,jsonb)'::regprocedure) INTO def;
def:=replace(def,'IF approver IS NULL THEN RAISE EXCEPTION ''Thiếu người duyệt có quyền tại cấp: %'',x->>''label''; END IF;','IF approver IS NULL THEN RAISE EXCEPTION ''Thiếu người duyệt có quyền tại cấp: %'',x->>''label''; END IF; IF x->>''type''=''position'' AND NOT public.biz_scope_ok(approver,_owner,_dept) AND NOT public.is_super_admin(approver) THEN RAISE EXCEPTION ''Người duyệt chức vụ không có phạm vi phù hợp: %'',x->>''label''; END IF;');EXECUTE def;
END $$;
REVOKE ALL ON FUNCTION public.biz_role_scope_allows(uuid,text),public.biz_all_scope(uuid),public.biz_role_scope_save(text,text),public.biz_role_scopes_read(),public.biz_step_scope_ok(jsonb,integer,uuid,uuid,uuid,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_role_scope_allows(uuid,text),public.biz_all_scope(uuid),public.biz_role_scope_save(text,text),public.biz_role_scopes_read(),public.biz_step_scope_ok(jsonb,integer,uuid,uuid,uuid,timestamptz) TO authenticated;