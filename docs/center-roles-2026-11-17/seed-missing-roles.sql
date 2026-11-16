-- Insert missing B2B, Distribution, BTC and Showroom catalog Roles only.
-- Preserve existing Roles (including customized rights), appointments, slots and source hierarchy.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
LOCK TABLE public.app_roles IN SHARE ROW EXCLUSIVE MODE;
DO $seed$
DECLARE r record; existing public.app_roles%ROWTYPE;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.org_units WHERE id='624e6e56-eeab-42d5-85af-6af284e72f34' AND active AND kind='system') OR
     NOT EXISTS(SELECT 1 FROM public.org_units WHERE id='3df93c75-8a46-4c2f-bc09-7583aa672b52' AND active AND kind='system') OR
     NOT EXISTS(SELECT 1 FROM public.org_units WHERE id='showroom-block' AND active AND kind='block') THEN
    RAISE EXCEPTION 'Center source drift: stop and audit';
  END IF;
  FOR r IN SELECT * FROM (VALUES
    ('role-v2-b2b-director','Giám đốc Trung tâm Kinh doanh B2B','B2B',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','biz.dashboard_public','biz.view_own','biz.crm_use','order.view_mine','order.create','oq.view_own','oq.create','oq.report_own','signal.sale','biz.plan_submit','biz.goal_submit','biz.report_submit','k3hub.center','leave.view_unit','biz.view_dept','biz.crm_view_scope','signal.assign','att.witness','signal.reassign','biz.plan_approve','biz.goal_approve','biz.report_approve','biz.plan_request_revision','oq.manage','biz.approval_view']::text[]),
    ('role-v2-b2b-head','Trưởng phòng Kinh doanh B2B','B2B',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','biz.dashboard_public','biz.view_own','biz.crm_use','order.view_mine','order.create','oq.view_own','oq.create','oq.report_own','signal.sale','biz.plan_submit','biz.goal_submit','biz.report_submit','k3hub.center','leave.view_unit','biz.view_dept','biz.crm_view_scope','signal.assign','att.witness','signal.reassign','biz.plan_approve','biz.goal_approve','biz.report_approve','biz.plan_request_revision','oq.manage']::text[]),
    ('role-v2-b2b-team','Trưởng nhóm Kinh doanh B2B','B2B',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','biz.dashboard_public','biz.view_own','biz.crm_use','order.view_mine','order.create','oq.view_own','oq.create','oq.report_own','signal.sale','biz.plan_submit','biz.goal_submit','biz.report_submit','k3hub.center','leave.view_unit','biz.view_dept','biz.crm_view_scope','signal.assign']::text[]),
    ('role-v2-b2b-staff','Nhân viên Kinh doanh B2B','B2B',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','biz.dashboard_public','biz.view_own','biz.crm_use','order.view_mine','order.create','oq.view_own','oq.create','oq.report_own','signal.sale','biz.plan_submit','biz.goal_submit','biz.report_submit']::text[]),
    ('role-v2-distribution-director','Giám đốc Kinh doanh Phân Phối','Phân Phối',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','kpi.view_own','k3hub.center','leave.view_unit','att.witness','leave.approve']::text[]),
    ('role-v2-distribution-head','Trưởng phòng Phân phối','Phân Phối',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','kpi.view_own','k3hub.center','leave.view_unit','att.witness','leave.approve']::text[]),
    ('role-v2-distribution-team','Trưởng nhóm Phân phối','Phân Phối',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','kpi.view_own','k3hub.center','leave.view_unit']::text[]),
    ('role-v2-distribution-staff','Nhân viên phân phối','Phân Phối',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.biz','kpi.view_own']::text[]),
    ('role-v2-btc-director','Giám đốc Trung tâm Kinh doanh BTC','BTC',ARRAY['att.create','att.view_own','leave.create','leave.recall','leave.view_own','k3.use','k3hub.use','overview.view','k3hub.center','att.witness','leave.view_unit','leave.approve','showroom.view','showroom.view_unit','showroom.view_all','showroom.k3.use','showroom.k3.view_team','showroom.k3.view_all','showroom.k3.comment','showroom.shift.view','showroom.shift.view_all','showroom.shift.approve','showroom.shift.swap','showroom.shift.register','signal.sale']::text[]),
    ('role-v2-showroom-manager','Cửa hàng trưởng','Showroom',ARRAY['att.create','att.edit_own','att.view_own','att.witness','k3.use','k3hub.center','k3hub.use','leave.approve','leave.create','leave.edit_own','leave.recall','leave.view_assigned','leave.view_own','leave.view_unit','overview.own_only','overview.view','showroom.k3.comment','showroom.k3.use','showroom.k3.view_team','showroom.shift.approve','showroom.shift.register','showroom.shift.settings','showroom.shift.swap','showroom.shift.view','showroom.view','showroom.view_unit','signal.sale','supplier.master.view']::text[]),
    ('role-v2-showroom-staff','Nhân viên Showroom','Showroom',ARRAY['att.create','att.edit_own','att.view_own','k3.use','k3hub.use','leave.create','leave.edit_own','leave.recall','leave.view_own','overview.own_only','overview.view','showroom.k3.use','showroom.shift.register','showroom.shift.swap','showroom.shift.view','showroom.view','signal.sale','supplier.master.view']::text[])
  ) AS v(id,name,grp,perms) LOOP
    SELECT * INTO existing FROM public.app_roles WHERE id=r.id FOR UPDATE;
    IF FOUND THEN
      IF existing.name IS DISTINCT FROM r.name OR existing.role_kind IS DISTINCT FROM 'position'
         OR existing.catalog_generation IS DISTINCT FROM 2 OR existing.catalog_state IS DISTINCT FROM 'standard'
         OR existing.is_system THEN
        RAISE EXCEPTION 'Role ID conflicts with approved identity: %',r.id;
      END IF;
      CONTINUE; -- Do not overwrite rights or other settings on existing Roles.
    END IF;
    IF EXISTS(SELECT 1 FROM public.app_roles a WHERE lower(btrim(a.name))=lower(btrim(r.name))) THEN
      RAISE EXCEPTION 'Duplicate Role title with another ID: %',r.name;
    END IF;
    IF EXISTS(SELECT 1 FROM unnest(r.perms) AS required(key)
      WHERE NOT EXISTS(SELECT 1 FROM public.base_permission_catalog c WHERE c.key=required.key)
        OR NOT private.grant_source_ready('position',required.key)) THEN
      RAISE EXCEPTION 'Unready permission in Role %',r.id;
    END IF;
    PERFORM private.role_editor_validate('position',r.perms,'{}'::text[]);
    PERFORM set_config('app.role_reason','Bổ sung Role trung tâm còn thiếu với quyền chuẩn; giữ nguyên Role đã có',true);
    INSERT INTO public.app_roles(id,name,description,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,signal_scope_all,signal_scope,catalog_generation)
    VALUES(r.id,r.name,'Role chức danh theo đơn vị và bổ nhiệm; quyền mẫu có sẵn, kiểm soát phạm vi vẫn do backend xác nhận.',
           r.perms,false,'standard',r.grp,'position',r.id,false,'{}'::text[],2);
  END LOOP;
END $seed$;
COMMIT;