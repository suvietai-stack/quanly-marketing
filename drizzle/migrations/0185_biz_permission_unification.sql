-- 1. biz_participant: bỏ nhánh Role tổng (quyền biz.% trong app_roles) — chỉ còn Cơ cấu tổ chức
CREATE OR REPLACE FUNCTION public.biz_participant(_actor uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=_actor AND p.status='Đang hoạt động') AND (
  EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now()))
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()))
  OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now())));
$function$;

-- 2. biz_all_scope: bỏ nhánh cờ biz_detail_exception trên Role tổng
CREATE OR REPLACE FUNCTION public.biz_all_scope(_actor uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
  public.biz_admin(_actor)
  OR public.biz_exception_ok(_actor,'biz.view_all','all')
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce((a.position_snapshot->>'all_business')::boolean,false) AND a.position_snapshot->>'business_policy'='executive'));
$function$;

-- 3. biz_can: quyền cài đặt không còn đòi quyền Role tổng (chỉ Admin/Super Admin hoặc ngoại lệ biz_access_exceptions)
CREATE OR REPLACE FUNCTION public.biz_can(_actor uuid, _permission text)
 RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false;END IF;
IF public.is_super_admin(_actor) THEN RETURN true;END IF;
IF _permission NOT LIKE 'biz.%' THEN RETURN private.sig_can(_actor,_permission);END IF;
IF public.biz_admin(_actor) THEN RETURN true;END IF;
IF _permission='biz.access_manage' THEN RETURN false;END IF;
IF _permission='biz.intervene' THEN RETURN EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'code'='executive_director' AND a.position_snapshot->>'business_policy'='executive' AND coalesce((a.position_snapshot->>'all_business')::boolean,false));END IF;
IF public.biz_exception_ok(_actor,_permission) THEN RETURN true;END IF;
IF _permission='biz.view_all' THEN RETURN public.biz_all_scope(_actor);END IF;
IF _permission='biz.dashboard_public' THEN RETURN public.biz_participant(_actor) OR public.biz_all_scope(_actor);END IF;
IF _permission IN ('biz.view_dept','biz.approval_view') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
IF _permission IN ('biz.view_own','biz.plan_submit','biz.goal_submit','biz.report_submit') THEN RETURN public.biz_participant(_actor) AND (NOT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'business_policy'='executive') OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy','personal')<>'executive'));END IF;
IF _permission='biz.plan_request_revision' THEN RETURN public.biz_manager(_actor);END IF;
IF _permission IN ('biz.goal_approve','biz.report_approve','biz.late_approve') THEN RETURN public.biz_manager(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
IF _permission='biz.plan_approve' THEN RETURN false;END IF;
RETURN false;
END $function$;

-- 4. k3_can: bỏ hoàn toàn kiểm tra Role tổng — quyền 3K theo Cơ cấu tổ chức
CREATE OR REPLACE FUNCTION public.k3_can(_actor uuid, _permission text)
 RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF _actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false; END IF;
  IF public.is_super_admin(_actor) OR public.biz_admin(_actor) THEN RETURN true; END IF;
  IF _permission='k3.use' THEN RETURN public.biz_participant(_actor); END IF;
  IF _permission IN ('k3.view_scope','k3.comment') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor); END IF;
  RETURN false;
END $function$;

-- 5. biz_effective_access: bổ sung quyền k3.* vào quyền hiệu lực; bỏ mục ngoại lệ theo Role tổng (không còn hiệu lực)
CREATE OR REPLACE FUNCTION public.biz_effective_access(_user uuid DEFAULT NULL::uuid)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE u uuid:=coalesce(_user,auth.uid());perms jsonb;
BEGIN
IF auth.uid() IS NULL OR (u<>auth.uid() AND NOT public.biz_org_can_manage() AND NOT private.sig_can(auth.uid(),'settings.role')) THEN RAISE EXCEPTION 'Không có quyền xem quyền nhân sự.';END IF;
SELECT coalesce(jsonb_agg(p),'[]') INTO perms FROM (
  SELECT p FROM unnest(ARRAY['biz.intervene','biz.access_manage','biz.dashboard_public','biz.view_own','biz.view_dept','biz.view_all','biz.plan_submit','biz.goal_submit','biz.report_submit','biz.plan_request_revision','biz.goal_approve','biz.report_approve','biz.late_approve','biz.approval_view','biz.org_manage','biz.dept_manage','biz.kr_manage','biz.deadline_manage','biz.workflow_manage']) p WHERE public.biz_can(u,p)
  UNION ALL
  SELECT p FROM unnest(ARRAY['k3.use','k3.view_scope','k3.comment','k3.settings']) p WHERE public.k3_can(u,p)
) q;
RETURN jsonb_build_object('user_id',u,'permissions',perms,'server_now',now(),'super_admin',public.is_super_admin(u),'appointments',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'position',a.position_snapshot->>'name','scope',a.scope_kind,'unit_name',CASE a.scope_kind WHEN 'system' THEN CASE WHEN coalesce((a.position_snapshot->>'all_business')::boolean,false) THEN 'Toàn Khối Kinh doanh Sứ Việt' ELSE (SELECT name FROM public.biz_systems WHERE id=a.system_id) END WHEN 'department' THEN (SELECT name FROM public.biz_departments WHERE id=a.department_id) WHEN 'team' THEN (SELECT name FROM public.biz_teams WHERE id=a.team_id) ELSE 'Cá nhân' END,'started_at',a.started_at,'ended_at',a.ended_at)),'[]') FROM public.biz_appointments a WHERE a.user_id=u AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now())),'legacy_assignments',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'position',coalesce(p.name,a.position),'scope',p.unit_kind,'unit_name',coalesce(s.name,d.name,t.name),'started_at',a.started_at,'ended_at',a.ended_at)),'[]') FROM public.biz_management_assignments a LEFT JOIN public.biz_positions p ON p.code=a.position LEFT JOIN public.biz_systems s ON s.id=a.system_id LEFT JOIN public.biz_departments d ON d.id=a.department_id LEFT JOIN public.biz_teams t ON t.id=a.team_id WHERE a.user_id=u AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now())),'exceptions',(SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]') FROM public.biz_access_exceptions e WHERE (e.user_id=u OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u AND r.role_id=e.role_id)) AND e.revoked_at IS NULL AND e.started_at<=now() AND (e.ended_at IS NULL OR e.ended_at>now())),'next_change',(SELECT min(at_) FROM (SELECT a.started_at at_ FROM public.biz_appointments a WHERE a.user_id=u AND a.status<>'cancelled' UNION ALL SELECT a.ended_at FROM public.biz_appointments a WHERE a.user_id=u AND a.status<>'cancelled' UNION ALL SELECT a.started_at FROM public.biz_management_assignments a WHERE a.user_id=u UNION ALL SELECT a.ended_at FROM public.biz_management_assignments a WHERE a.user_id=u UNION ALL SELECT e.started_at FROM public.biz_access_exceptions e WHERE e.user_id=u OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u AND r.role_id=e.role_id) UNION ALL SELECT e.ended_at FROM public.biz_access_exceptions e WHERE e.user_id=u OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u AND r.role_id=e.role_id)) q WHERE at_>now()));
END $function$;