-- STAGED ONLY: non-destructive retirement of unused seeded Roles.
-- FAIL CLOSED if any assignment source references a Role. Restore mappings first
-- through org_change, never silently remove live permissions.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
LOCK TABLE public.app_roles,public.org_position_roles,public.org_position_slots,
 public.base_title_role_links,public.user_roles,public.mkt_specialties IN SHARE ROW EXCLUSIVE MODE;
DO $rollback$
BEGIN
 IF EXISTS(SELECT 1 FROM public.org_position_roles WHERE role_id LIKE 'role-v2-distribution-%')
 OR EXISTS(SELECT 1 FROM public.org_position_slots WHERE role_id LIKE 'role-v2-distribution-%')
 OR EXISTS(SELECT 1 FROM public.base_title_role_links WHERE role_id LIKE 'role-v2-distribution-%')
 OR EXISTS(SELECT 1 FROM public.user_roles WHERE role_id LIKE 'role-v2-distribution-%')
 OR EXISTS(SELECT 1 FROM public.mkt_specialties WHERE role_id LIKE 'role-v2-distribution-%') THEN
   RAISE EXCEPTION 'Distribution Roles are referenced; audited mapping restore required';
 END IF;
 IF EXISTS(SELECT 1 FROM public.app_roles r WHERE r.id IN ('role-v2-distribution-director','role-v2-distribution-head','role-v2-distribution-team','role-v2-distribution-staff')
   AND (r.catalog_generation IS DISTINCT FROM 2 OR r.role_kind IS DISTINCT FROM 'position' OR r.is_system
     OR r.catalog_group IS DISTINCT FROM 'Phân Phối' OR r.signal_scope_all IS DISTINCT FROM false
     OR r.signal_scope IS DISTINCT FROM '{}'::text[]
     OR r.name IS DISTINCT FROM CASE r.id
       WHEN 'role-v2-distribution-director' THEN 'Giám đốc Kinh doanh Phân Phối'
       WHEN 'role-v2-distribution-head' THEN 'Trưởng phòng Phân phối'
       WHEN 'role-v2-distribution-team' THEN 'Trưởng nhóm Phân phối'
       ELSE 'Nhân viên phân phối' END
     OR ARRAY(SELECT p FROM unnest(r.permissions) p ORDER BY p) IS DISTINCT FROM
        ARRAY(SELECT p FROM unnest(ARRAY['att.create','att.view_own','k3.use','k3hub.use','leave.create','leave.recall','leave.view_own'] ||
          CASE WHEN r.id='role-v2-distribution-staff' THEN '{}'::text[] ELSE ARRAY['k3hub.center'] END) p ORDER BY p))) THEN
   RAISE EXCEPTION 'Customized Distribution Role; compare private snapshot before rollback';
 END IF;
 PERFORM set_config('app.role_reason','Rollback seed Phân Phối chưa dùng; giữ audit và lịch sử',true);
 UPDATE public.app_roles SET catalog_state='archived'
 WHERE id IN ('role-v2-distribution-director','role-v2-distribution-head','role-v2-distribution-team','role-v2-distribution-staff')
   AND catalog_generation=2 AND role_kind='position' AND NOT is_system;
END $rollback$;
COMMIT;