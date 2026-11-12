-- PENDING ONLY: apply through lov_database--migration after acceptance, not directly.
DO $$ BEGIN
 IF md5(pg_get_functiondef('public.biz_step_scope_ok(jsonb,integer,uuid,uuid,uuid,timestamp with time zone)'::regprocedure)) <> '3cf0e08a182a337ae25359cbef120be8' THEN RAISE EXCEPTION 'Gate changed: public.biz_step_scope_ok; refresh backup before apply.'; END IF;
 IF md5(pg_get_functiondef('public.biz_can(uuid,text)'::regprocedure)) <> 'f6eda4b5951bc99ff315f7d2862c9559' THEN RAISE EXCEPTION 'Gate changed: public.biz_can; refresh backup before apply.'; END IF;
 IF md5(pg_get_functiondef('public.biz_goal_can_read(uuid)'::regprocedure)) <> '751d9be4706b91a4f26b1829afb33633' THEN RAISE EXCEPTION 'Gate changed: public.biz_goal_can_read; refresh backup before apply.'; END IF;
 IF md5(pg_get_functiondef('public.biz_department_access(uuid)'::regprocedure)) <> 'a19fe009ee1cd36f3e5d7b63a8c05c73' THEN RAISE EXCEPTION 'Gate changed: public.biz_department_access; refresh backup before apply.'; END IF;
 IF md5(pg_get_functiondef('public.biz_member_access(uuid,uuid)'::regprocedure)) <> '3bbdb20a410430b8ec4bae31f3e74e80' THEN RAISE EXCEPTION 'Gate changed: public.biz_member_access; refresh backup before apply.'; END IF;
 IF md5(pg_get_functiondef('public.biz_doc_access(uuid,uuid,text,boolean)'::regprocedure)) <> '57e6a3d9757111a17d57c27e8c86534b' THEN RAISE EXCEPTION 'Gate changed: public.biz_doc_access; refresh backup before apply.'; END IF;
END $$;
CREATE OR REPLACE FUNCTION private.biz_v2_previous_biz_can(_actor uuid, _permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
 IF NOT private.legacy_business_allowed(_actor) THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false;END IF;
 IF public.is_super_admin(_actor) THEN RETURN true;END IF;
 IF _permission NOT LIKE 'biz.%' THEN RETURN private.sig_can(_actor,_permission);END IF;
 IF public.biz_admin(_actor) THEN RETURN true;END IF;
 IF _permission='biz.access_manage' THEN RETURN false;END IF;
 IF _permission='biz.intervene' THEN RETURN EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'code' IN ('executive_director','deputy_executive_director') AND a.position_snapshot->>'business_policy'='executive' AND coalesce((a.position_snapshot->>'all_business')::boolean,false) AND private.biz_source_ok(a.user_id, a.started_at));END IF;
 IF public.biz_exception_ok(_actor,_permission) THEN RETURN true;END IF;
 IF _permission='biz.view_all' THEN RETURN public.biz_all_scope(_actor);END IF;
 IF _permission='biz.dashboard_public' THEN RETURN public.biz_participant(_actor) OR public.biz_all_scope(_actor);END IF;
 IF _permission IN ('biz.view_dept','biz.approval_view') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
 IF _permission IN ('biz.view_own','biz.plan_submit','biz.goal_submit','biz.report_submit') THEN RETURN public.biz_participant(_actor) AND (NOT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'business_policy'='executive' AND private.biz_source_ok(a.user_id, a.started_at)) OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy','personal')<>'executive' AND private.biz_source_ok(a.user_id, a.started_at)));END IF;
 IF _permission='biz.plan_request_revision' THEN RETURN public.biz_manager(_actor);END IF;
 IF _permission IN ('biz.goal_approve','biz.report_approve','biz.late_approve') THEN RETURN public.biz_manager(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
 IF _permission='biz.plan_approve' THEN RETURN false;END IF;
 RETURN false;
END $function$;

-- PENDING. Role actions only; existing source/source_id mapping, no new permission or organization tables.
CREATE OR REPLACE FUNCTION private.biz_v2_ready(p text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$ SELECT p=ANY(ARRAY['biz.view_own','biz.view_dept','biz.dashboard_public','biz.goal_submit','biz.goal_approve','biz.plan_submit','biz.plan_request_revision','biz.report_submit','biz.report_approve','biz.approval_view']) $$;

CREATE OR REPLACE FUNCTION private.biz_v2_denied(u uuid,p text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM jsonb_array_elements(private.base_rules(u,private.base_config())) r
 WHERE r->>'permission'=p AND r->>'effect'='DENY' AND private.base_valid_at(r))
$$;

-- Permissions AND scope come from the SAME reviewed appointment rule, never position_can(no target).
-- Uses the existing audited mapping. Matching names or UUID-looking strings is insufficient.
CREATE OR REPLACE FUNCTION private.biz_v2_sources(u uuid,p text)
RETURNS TABLE(assignment_id text,role_id text,unit_id text,kind text,source_id text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT DISTINCT a.id,ar.id,ou.id,ou.kind,ou.source_id
 FROM jsonb_array_elements(private.base_rules(u,private.base_config())) r
 JOIN org_assignments a ON a.id=r->>'source_id' AND a.user_id=u AND a.unit_id=r->>'unit_id'
 JOIN org_units ou ON ou.id=a.unit_id AND ou.active
 JOIN org_titles t ON t.id=a.title_id AND t.active
 JOIN org_position_roles b ON b.unit_id=a.unit_id AND b.title_id=a.title_id AND b.role_id=r->>'role_id'
 JOIN app_roles ar ON ar.id=b.role_id AND ar.catalog_generation=2 AND ar.role_kind='position' AND ar.catalog_state='standard' AND NOT ar.is_system
 WHERE private.is_active(u) AND private.legacy_business_allowed(u) AND private.biz_source_ok(u,a.starts_at)
 AND private.biz_v2_ready(p) AND NOT private.biz_v2_denied(u,p)
 AND r->>'permission'=p AND r->>'effect'='ALLOW' AND r->>'source_kind'='appointment_role'
 AND private.base_valid_at(r) AND p=ANY(ar.permissions)
 AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
 AND (
  (ou.kind='department' AND ou.source='biz_departments' AND EXISTS(SELECT 1 FROM biz_departments d WHERE d.id::text=ou.source_id AND d.active AND EXISTS(SELECT 1 FROM org_units s WHERE s.id=ou.parent_id AND s.active AND s.source='biz_systems' AND s.source_id=d.system_id::text)))
  OR (ou.kind='team' AND ou.source='biz_teams' AND EXISTS(SELECT 1 FROM biz_teams bt JOIN org_units d ON d.id=ou.parent_id AND d.active AND d.source='biz_departments' AND d.source_id=bt.department_id::text WHERE bt.id::text=ou.source_id AND bt.active))
  OR (ou.kind='system' AND ou.source='biz_systems' AND EXISTS(SELECT 1 FROM biz_systems s WHERE s.id::text=ou.source_id AND s.active))
  OR (ou.kind='block' AND ou.id='biz-block' AND ou.source='structural' AND ou.source_id='business')
 )
$$;

CREATE OR REPLACE FUNCTION private.biz_v2_can_at(u uuid,p text,owner_ uuid DEFAULT NULL,dept_ uuid DEFAULT NULL,at_ timestamptz DEFAULT now())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM private.biz_v2_sources(u,p) s WHERE
 -- No-target call is capability discovery, not row access.
 CASE WHEN owner_ IS NULL AND dept_ IS NULL THEN
   p NOT IN ('biz.view_own','biz.goal_submit','biz.plan_submit','biz.report_submit') OR public.biz_participant(u)
 WHEN p IN ('biz.view_own','biz.goal_submit','biz.plan_submit','biz.report_submit') THEN
   owner_=u AND public.biz_participant(u) AND (
    (s.kind='department' AND s.source_id=dept_::text) OR
    (s.kind='team' AND EXISTS(SELECT 1 FROM biz_teams t WHERE t.id::text=s.source_id AND t.department_id=dept_ AND EXISTS(
      SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM biz_member_affiliations WHERE team_id IS NOT NULL) m
      WHERE m.user_id=u AND m.team_id=t.id AND m.started_at<=at_ AND (m.ended_at IS NULL OR m.ended_at>at_))))
   )
 ELSE (
  (s.kind='department' AND s.source_id=dept_::text) OR
  (s.kind='system' AND EXISTS(SELECT 1 FROM biz_department_system_history h WHERE h.department_id=dept_ AND h.system_id::text=s.source_id AND h.started_at<=at_ AND (h.ended_at IS NULL OR h.ended_at>at_))) OR
  (s.kind='block' AND EXISTS(SELECT 1 FROM biz_departments d WHERE d.id=dept_)) OR
  (s.kind='team' AND owner_ IS NOT NULL AND EXISTS(SELECT 1 FROM biz_teams t WHERE t.id::text=s.source_id AND t.department_id=dept_ AND EXISTS(
   SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM biz_member_affiliations WHERE team_id IS NOT NULL) m
   WHERE m.user_id=owner_ AND m.team_id=t.id AND m.started_at<=at_ AND (m.ended_at IS NULL OR m.ended_at>at_))))
 ) END)
$$;

CREATE OR REPLACE FUNCTION public.biz_can(_actor uuid,_permission text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT private.is_active(_actor) OR NOT private.legacy_business_allowed(_actor) THEN RETURN false; END IF;
 IF public.biz_admin(_actor) THEN RETURN true; END IF;
 IF private.biz_v2_ready(_permission) THEN
  IF private.biz_v2_denied(_actor,_permission) THEN RETURN false; END IF;
  RETURN private.biz_v2_can_at(_actor,_permission) OR public.biz_exception_ok(_actor,_permission);
 END IF;
 -- CRM/3K/unsupported administration keep their existing independent gates.
 RETURN private.biz_v2_previous_biz_can(_actor,_permission);
END $$;

CREATE OR REPLACE FUNCTION private.biz_v2_read(u uuid,owner_ uuid,dept_ uuid,at_ timestamptz DEFAULT now()) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(u) AND private.legacy_business_allowed(u) AND (
 public.biz_admin(u)
 OR private.biz_v2_can_at(u,'biz.view_own',owner_,dept_,at_)
 OR private.biz_v2_can_at(u,'biz.view_dept',owner_,dept_,at_)
 -- Explicit audited legacy exceptions stay native-scoped; they cannot borrow a Role source.
 OR (NOT private.biz_v2_denied(u,'biz.view_all') AND public.biz_exception_ok(u,'biz.view_all','all'))
 OR (NOT private.biz_v2_denied(u,'biz.view_dept') AND public.biz_exception_ok(u,'biz.view_dept') AND public.biz_scope_ok(u,owner_,dept_,at_))
 )
$$;

CREATE OR REPLACE FUNCTION public.biz_goal_can_read(_goal_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM biz_annual_goals g WHERE g.id=_goal_id AND (
 private.biz_v2_read(auth.uid(),g.user_id,g.department_id)
 OR (private.biz_v2_can_at(auth.uid(),'biz.approval_view',g.user_id,g.department_id) AND EXISTS(SELECT 1 FROM biz_goal_versions v WHERE v.goal_id=g.id AND public.biz_run_assigned(v.id)))))
$$;

CREATE OR REPLACE FUNCTION public.biz_doc_access(_user uuid,_dept uuid,_kind text,_review boolean DEFAULT false) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(auth.uid()) AND private.legacy_business_allowed(auth.uid()) AND _kind IN ('plan','report') AND
 CASE WHEN NOT _review THEN private.biz_v2_read(auth.uid(),_user,_dept)
  OR (_kind='report' AND private.biz_v2_can_at(auth.uid(),'biz.approval_view',_user,_dept) AND EXISTS(SELECT 1 FROM biz_document_versions v JOIN biz_documents d ON d.id=v.document_id WHERE d.user_id=_user AND d.department_id=_dept AND d.kind='report' AND public.biz_run_assigned(v.id)))
 ELSE _user<>auth.uid() AND (public.biz_admin(auth.uid()) OR
  (_kind='plan' AND private.biz_v2_can_at(auth.uid(),'biz.plan_request_revision',_user,_dept)) OR
  (_kind='report' AND private.biz_v2_can_at(auth.uid(),'biz.report_approve',_user,_dept) AND EXISTS(SELECT 1 FROM biz_document_versions v JOIN biz_documents d ON d.id=v.document_id JOIN biz_approval_runs r ON r.version_id=v.id WHERE d.user_id=_user AND d.department_id=_dept AND d.kind='report' AND r.status='pending' AND public.biz_run_assigned(v.id,true) AND public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at)))) END
$$;

CREATE OR REPLACE FUNCTION public.biz_step_scope_ok(_steps jsonb,_index integer,_actor uuid,_owner uuid,_dept uuid,_at timestamptz) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(_actor) AND private.legacy_business_allowed(_actor) AND (
 public.biz_admin(_actor) OR (
 _actor<>_owner AND (_steps->_index->>'user_id'=_actor::text OR _steps->_index->>'substitute_id'=_actor::text)
 AND EXISTS(SELECT 1 FROM biz_approval_runs r WHERE r.steps=_steps AND r.current_step=_index AND r.owner_id=_owner AND r.department_id=_dept AND r.status='pending'
 AND private.biz_v2_can_at(_actor,CASE WHEN r.kind='goal_year' THEN 'biz.goal_approve' ELSE 'biz.report_approve' END,_owner,_dept,_at))))
$$;

CREATE OR REPLACE FUNCTION public.biz_department_access(_department_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(auth.uid()) AND private.legacy_business_allowed(auth.uid()) AND (public.biz_admin(auth.uid())
 OR private.biz_v2_can_at(auth.uid(),'biz.view_dept',NULL,_department_id)
 OR EXISTS(SELECT 1 FROM biz_department_members m WHERE m.department_id=_department_id AND m.user_id=auth.uid() AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now()) AND private.biz_v2_can_at(auth.uid(),'biz.view_own',m.user_id,_department_id))
 OR (NOT private.biz_v2_denied(auth.uid(),'biz.view_all') AND public.biz_exception_ok(auth.uid(),'biz.view_all','all')))
$$;
CREATE OR REPLACE FUNCTION public.biz_member_access(_user_id uuid,_department_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.biz_v2_read(auth.uid(),_user_id,_department_id) $$;
-- Shared biz_scope_ok/participant/all_scope are deliberately NOT rewritten: CRM and 3K consume them.
-- org_role_permission_ready/editor policy are NOT opened until real RPC integration and live-scoped E2E pass.
REVOKE ALL ON FUNCTION private.biz_v2_ready(text),private.biz_v2_denied(uuid,text),private.biz_v2_sources(uuid,text),private.biz_v2_can_at(uuid,text,uuid,uuid,timestamptz),private.biz_v2_read(uuid,uuid,uuid,timestamptz) FROM PUBLIC,anon,authenticated,service_role;

REVOKE ALL ON FUNCTION private.biz_v2_previous_biz_can(uuid,text) FROM PUBLIC,anon,authenticated,service_role;
