-- V2 staff should access their own department without a lingering
-- legacy biz_department_members row. Preserve historical read semantics.
CREATE OR REPLACE FUNCTION public.biz_department_access(_department_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT private.legacy_business_allowed(auth.uid()) AND (
  SELECT public.is_super_admin(auth.uid()) OR public.biz_org_can_manage() OR public.biz_can(auth.uid(),'biz.workflow_manage') OR public.biz_all_scope(auth.uid()) OR public.biz_can(auth.uid(),'biz.dept_manage') OR public.biz_can(auth.uid(),'biz.kr_manage') OR EXISTS(
     SELECT 1 FROM public.org_assignments a
     JOIN public.org_position_roles pr ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
     WHERE a.user_id=auth.uid()
       AND a.unit_id=_department_id::text
       AND a.source='canonical'
       AND a.status='active' AND a.starts_at<=now()
       AND (a.ends_at IS NULL OR a.ends_at>now())
       AND pr.role_id IN (
         'role-v2-b2b-staff','role-v2-b2b-team','role-v2-b2b-head',
         'role-v2-distribution-staff','role-v2-distribution-team','role-v2-distribution-head'
       )
       AND public.biz_can(auth.uid(),'biz.view_own')
   ) OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND ((m.user_id=auth.uid() AND m.ended_at IS NULL AND private.biz_source_ok(m.user_id, m.started_at) AND (public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.goal_submit'))) OR ((public.biz_can(auth.uid(),'biz.view_dept') OR public.biz_can(auth.uid(),'biz.goal_approve')) AND public.biz_scope_ok(auth.uid(),m.user_id,_department_id)))));
$function$
;