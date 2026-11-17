-- 2026-11-17: make V2 org appointments first-class sources for the
-- operational business permissions (CRM, participation, management and scope).
-- This is additive to existing legacy evaluators; no current access is dropped.
-- Require real, current *canonical* org appointments and per-unit Role V2
-- mappings; never infer authorization from display names or free-form fields.
CREATE OR REPLACE FUNCTION private.biz_v2_member(_actor uuid,_manager boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $fn$
  SELECT private.is_active(_actor) AND EXISTS(
    SELECT 1 FROM public.org_assignments a
    JOIN public.org_position_roles pr ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
    JOIN public.app_roles r ON r.id=pr.role_id
    WHERE a.user_id=_actor
      AND a.source='canonical'
      AND a.status='active' AND a.starts_at<=now()
      AND (a.ends_at IS NULL OR a.ends_at>now())
      AND private.org_contains('biz-block',a.unit_id)
      AND r.catalog_generation>=2 AND r.catalog_state='standard'
      AND (
        (pr.role_id IN ('role-v2-b2b-staff','role-v2-distribution-staff') AND NOT _manager)
        OR pr.role_id IN (
          'role-v2-b2b-team','role-v2-b2b-head','role-v2-b2b-director',
          'role-v2-distribution-team','role-v2-distribution-head','role-v2-distribution-director'
        )
      )
  );
$fn$;

CREATE OR REPLACE FUNCTION private.biz_v2_scope(_actor uuid,_user uuid,_dept uuid,_at timestamptz DEFAULT now())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $fn$
  SELECT private.is_active(_actor) AND EXISTS(
    SELECT 1 FROM public.org_assignments a
    JOIN public.org_position_roles pr ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
    JOIN public.app_roles r ON r.id=pr.role_id
    WHERE a.user_id=_actor AND a.source='canonical'
      AND a.status='active' AND a.starts_at<=now()
      AND (a.ends_at IS NULL OR a.ends_at>now())
      AND r.catalog_generation>=2 AND r.catalog_state='standard'
      AND private.org_contains('biz-block',a.unit_id)
      AND (
        (pr.role_id IN ('role-v2-b2b-director','role-v2-distribution-director')
          AND private.org_contains(a.unit_id,_dept::text))
        OR (pr.role_id IN ('role-v2-b2b-head','role-v2-distribution-head')
          AND a.unit_id=_dept::text)
        OR (pr.role_id IN ('role-v2-b2b-team','role-v2-distribution-team')
          AND EXISTS(SELECT 1 FROM public.biz_team_members m
            JOIN public.biz_teams t ON t.id=m.team_id
            WHERE m.user_id=_user AND t.department_id=_dept
              AND t.id::text=a.unit_id
              AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at)))
      )
  );
$fn$;

CREATE OR REPLACE FUNCTION public.biz_participant(_actor uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT (private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=_actor AND p.status='Đang hoạt động') AND (
  EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now()) AND private.biz_source_ok(m.user_id, m.started_at))
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at))
  OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at))))) OR private.biz_v2_member(_actor,false);
$function$;

CREATE OR REPLACE FUNCTION public.biz_manager(_actor uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT (private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy',CASE WHEN a.scope_kind='individual' THEN 'personal' ELSE 'manager' END) IN ('manager','executive') AND private.biz_source_ok(a.user_id, a.started_at))
 OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at)))) OR private.biz_v2_member(_actor,true);
$function$;

CREATE OR REPLACE FUNCTION public.biz_scope_ok(_actor uuid, _user uuid, _dept uuid, _at timestamp with time zone DEFAULT now())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT (private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
  public.biz_all_scope(_actor)
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND coalesce(a.position_snapshot->>'business_policy',CASE WHEN a.scope_kind='individual' THEN 'personal' ELSE 'manager' END) IN ('manager','executive') AND private.biz_source_ok(a.user_id, a.started_at) AND public.biz_appointment_scope(a.id,_user,_dept,_at))
  OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at) AND ((a.position='director' AND EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.system_id=a.system_id AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at))) OR (a.position='department_head' AND a.department_id=_dept) OR (a.position='team_lead' AND EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL) m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND m.team_id=a.team_id AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at)))))
  OR public.biz_exception_ok(_actor,'biz.view_dept','department',_dept)
  OR EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at) AND public.biz_exception_ok(_actor,'biz.view_dept','system',h.system_id))
  OR EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL) m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at) AND public.biz_exception_ok(_actor,'biz.view_dept','team',m.team_id))))) OR private.biz_v2_scope(_actor,_user,_dept,_at);
$function$;
