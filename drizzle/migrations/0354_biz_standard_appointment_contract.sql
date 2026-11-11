-- Hợp đồng Kinh doanh chuẩn sau reset legacy (bổ sung 0347):
-- Chỉ bổ nhiệm Kinh doanh tạo SAU thời điểm reset (qua luồng canonical org_change) mới là nguồn quyền;
-- bổ nhiệm/thành viên legacy giữ nguyên làm lịch sử, không tự phục hồi quyền.
-- Miễn nhiệm (kết thúc bổ nhiệm mới) thì quyền Kinh doanh tự hết; kiêm nhiệm tính theo từng bổ nhiệm riêng.
-- Không đổi dữ liệu, không phục hồi bổ nhiệm cũ, không cấp quyền toàn hệ thống.

-- 1) Một dòng dữ liệu tổ chức chỉ là nguồn quyền hợp lệ nếu tài khoản chưa reset
--    hoặc dòng đó bắt đầu SAU lần reset gần nhất của tài khoản.
CREATE OR REPLACE FUNCTION private.biz_source_ok(_user uuid, _started_at timestamptz) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT NOT private.legacy_reset_applies(_user)
     OR _started_at > (SELECT max(reset_at) FROM private.legacy_reset_accounts WHERE user_id=_user AND active)
$$;

-- 2) Cổng tài khoản: tài khoản reset chỉ dùng được nghiệp vụ Kinh doanh khi có
--    bổ nhiệm chuẩn còn hiệu lực tạo sau reset.
CREATE OR REPLACE FUNCTION private.legacy_business_allowed(u uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT NOT private.legacy_reset_applies(u)
     OR EXISTS(SELECT 1 FROM public.biz_appointments a
               WHERE a.user_id=u AND a.status<>'cancelled' AND a.started_at<=now()
                 AND (a.ended_at IS NULL OR a.ended_at>now())
                 AND a.started_at > (SELECT max(reset_at) FROM private.legacy_reset_accounts WHERE user_id=u AND active))
$$;
COMMENT ON FUNCTION private.legacy_business_allowed(uuid) IS 'Tài khoản reset chỉ dùng được nghiệp vụ Kinh doanh khi có bổ nhiệm chuẩn tạo sau reset; bổ nhiệm legacy không tự phục hồi.';

-- 3) Các resolver trung tâm: lọc nguồn theo mốc reset cho CHÍNH người được cấp quyền.
CREATE OR REPLACE FUNCTION public.biz_participant(_actor uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=_actor AND p.status='Đang hoạt động') AND (
  EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now()) AND private.biz_source_ok(m.user_id, m.started_at))
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at))
  OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at))));
$$;

CREATE OR REPLACE FUNCTION public.biz_manager(_actor uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy',CASE WHEN a.scope_kind='individual' THEN 'personal' ELSE 'manager' END) IN ('manager','executive') AND private.biz_source_ok(a.user_id, a.started_at))
 OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at)));
$$;

CREATE OR REPLACE FUNCTION public.biz_all_scope(_actor uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
  public.biz_admin(_actor)
  OR public.biz_exception_ok(_actor,'biz.view_all','all')
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce((a.position_snapshot->>'all_business')::boolean,false) AND a.position_snapshot->>'business_policy'='executive' AND private.biz_source_ok(a.user_id, a.started_at))));
$$;

CREATE OR REPLACE FUNCTION public.biz_appointment_scope(_id uuid, _user uuid, _dept uuid, _at timestamptz DEFAULT now()) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.id=_id AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at) AND ((a.scope_kind='individual' AND a.user_id=_user) OR (a.scope_kind='department' AND a.department_id=_dept) OR (a.scope_kind='system' AND EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.system_id=a.system_id AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at))) OR (a.scope_kind='team' AND EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL) m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND m.team_id=a.team_id AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at)))))
$$;

CREATE OR REPLACE FUNCTION public.biz_scope_ok(_actor uuid, _user uuid, _dept uuid, _at timestamptz DEFAULT now()) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
  public.biz_all_scope(_actor)
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND coalesce(a.position_snapshot->>'business_policy',CASE WHEN a.scope_kind='individual' THEN 'personal' ELSE 'manager' END) IN ('manager','executive') AND private.biz_source_ok(a.user_id, a.started_at) AND public.biz_appointment_scope(a.id,_user,_dept,_at))
  OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at) AND ((a.position='director' AND EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.system_id=a.system_id AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at))) OR (a.position='department_head' AND a.department_id=_dept) OR (a.position='team_lead' AND EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL) m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND m.team_id=a.team_id AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at)))))
  OR public.biz_exception_ok(_actor,'biz.view_dept','department',_dept)
  OR EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at) AND public.biz_exception_ok(_actor,'biz.view_dept','system',h.system_id))
  OR EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL) m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at) AND public.biz_exception_ok(_actor,'biz.view_dept','team',m.team_id))));
$$;

CREATE OR REPLACE FUNCTION public.biz_can(_actor uuid, _permission text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
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
END $$;

CREATE OR REPLACE FUNCTION public.biz_executive_holder(_actor uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.biz_appointments a JOIN public.profiles p ON p.id=a.user_id AND p.status='Đang hoạt động'
  WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now())
    AND a.position_snapshot->>'code' IN ('executive_director','deputy_executive_director')
    AND a.position_snapshot->>'business_policy'='executive'
    AND coalesce((a.position_snapshot->>'all_business')::boolean,false)
    AND private.biz_source_ok(a.user_id, a.started_at)));
$$;

CREATE OR REPLACE FUNCTION public.biz_department_access(_department_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.legacy_business_allowed(auth.uid()) AND (
  SELECT public.is_super_admin(auth.uid()) OR public.biz_org_can_manage() OR public.biz_can(auth.uid(),'biz.workflow_manage') OR public.biz_all_scope(auth.uid()) OR public.biz_can(auth.uid(),'biz.dept_manage') OR public.biz_can(auth.uid(),'biz.kr_manage') OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND ((m.user_id=auth.uid() AND m.ended_at IS NULL AND private.biz_source_ok(m.user_id, m.started_at) AND (public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.goal_submit'))) OR ((public.biz_can(auth.uid(),'biz.view_dept') OR public.biz_can(auth.uid(),'biz.goal_approve')) AND public.biz_scope_ok(auth.uid(),m.user_id,_department_id)))));
$$;