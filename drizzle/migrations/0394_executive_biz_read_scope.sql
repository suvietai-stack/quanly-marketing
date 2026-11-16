-- CEO V2 has read-only business visibility even when old Biz assignments
-- were deliberately reset. Never turn on legacy_business_allowed or biz_admin:
-- both would reopen mutation/approval privileges beyond the Role.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='60s';

CREATE OR REPLACE FUNCTION private.executive_v2_read_scope(u uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT private.is_active(u) AND private.has_permission(u,'biz.view_all')
   AND EXISTS (
     SELECT 1 FROM public.org_assignments a
     JOIN public.org_position_roles b ON b.unit_id=a.unit_id AND b.title_id=a.title_id
     WHERE a.user_id=u AND a.unit_id='org-company'
       AND b.role_id='role-v2-executive'
       AND a.status='active' AND a.starts_at<=now()
       AND (a.ends_at IS NULL OR a.ends_at>now())
   )
$fn$;
REVOKE ALL ON FUNCTION private.executive_v2_read_scope(uuid) FROM PUBLIC,anon,authenticated;

-- The read-only dashboard path uses the V2 exception; its write APIs do not.
DO $patch$
DECLARE def text;
BEGIN
  SELECT pg_get_functiondef('public.biz_dashboard_read(integer,text,integer,uuid,uuid,text)'::regprocedure) INTO def;
  IF position('private.executive_v2_read_scope(a)' IN def)=0 THEN
    IF position('all_ok:=public.is_super_admin(a) OR public.biz_all_scope(a);' IN def)=0 THEN
      RAISE EXCEPTION 'Dashboard scope expression changed; manual review required';
    END IF;
    def:=replace(def,
      'all_ok:=public.is_super_admin(a) OR public.biz_all_scope(a);',
      'all_ok:=public.is_super_admin(a) OR public.biz_all_scope(a) OR private.executive_v2_read_scope(a);');
    EXECUTE def;
  END IF;
END
$patch$;

CREATE OR REPLACE FUNCTION public.biz_dashboard_systems()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT CASE WHEN auth.uid() IS NOT NULL
   AND (public.is_super_admin(auth.uid()) OR public.biz_all_scope(auth.uid())
     OR private.executive_v2_read_scope(auth.uid()))
 THEN coalesce((
   SELECT jsonb_agg(jsonb_build_object('id',s.id,'name',s.name)
     ORDER BY (SELECT count(*) FROM public.biz_departments d WHERE d.system_id=s.id AND d.active) DESC,s.created_at,s.name)
   FROM public.biz_systems s
   WHERE s.active AND private.biz_owned_system(s.id)
 ),'[]'::jsonb) ELSE '[]'::jsonb END
$fn$;

CREATE OR REPLACE FUNCTION public.biz_run_can_read(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT (private.legacy_business_allowed(auth.uid()) OR private.executive_v2_read_scope(auth.uid()))
   AND EXISTS(
     SELECT 1 FROM public.biz_approval_runs r WHERE r.id=_id
       AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động')
       AND (private.executive_v2_read_scope(auth.uid())
         OR public.biz_all_scope(auth.uid()) OR r.owner_id=auth.uid()
         OR public.biz_scope_ok(auth.uid(),r.owner_id,r.department_id,r.submitted_at)
         OR EXISTS(SELECT 1 FROM jsonb_array_elements(r.steps) s
            WHERE s->>'user_id'=auth.uid()::text OR s->>'substitute_id'=auth.uid()::text))
   )
$fn$;

CREATE OR REPLACE FUNCTION public.biz_goal_can_read(_goal_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT (private.legacy_business_allowed(auth.uid()) OR private.executive_v2_read_scope(auth.uid()))
   AND EXISTS(
     SELECT 1 FROM public.biz_annual_goals g WHERE g.id=_goal_id
       AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động')
       AND (private.executive_v2_read_scope(auth.uid())
         OR public.biz_all_scope(auth.uid())
         OR (g.user_id=auth.uid() AND public.biz_participant(auth.uid()))
         OR public.biz_scope_ok(auth.uid(),g.user_id,g.department_id)
         OR EXISTS(SELECT 1 FROM public.biz_goal_versions v
             WHERE v.goal_id=g.id AND public.biz_run_assigned(v.id)))
   )
$fn$;
COMMIT;
