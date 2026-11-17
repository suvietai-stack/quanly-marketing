-- Canonical Role V2 reconciliation for the existing Sứ Việt organization.
-- Migrates only business-relevant, non-dormant legacy permissions. 
-- Never copies legacy Super Admin/Admin permissions to a position.
-- Every change is additive except the exact per-unit mappings from generic
-- sales roles to the matching independent B2B/Distribution/BTC/Showroom roles.
DO $$
DECLARE pair record; current_perms text[]; append_perms text[]; target_id text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.app_roles WHERE id='role-v2-b2b-director' AND catalog_generation=2)
    OR NOT EXISTS (SELECT 1 FROM public.app_roles WHERE id='role-v2-distribution-director' AND catalog_generation=2)
    OR NOT EXISTS (SELECT 1 FROM public.app_roles WHERE id='role-v2-btc-director' AND catalog_generation=2) THEN
    RAISE EXCEPTION 'Missing canonical business center Role V2; refuse remapping';
  END IF;
  PERFORM set_config('app.role_reason','Đồng bộ đầy đủ quyền nghiệp vụ và liên kết vị trí Role V2 theo cơ cấu mới',true);

  -- Old operational grants may be inherited only when they are still listed
  -- in the permission catalog and NOT dormant/forbidden by the old role fence.
  FOR pair IN
    SELECT * FROM (VALUES
      ('role-content-web','role-v2-task-content-web','task-web'),
      ('role-local-seo','role-v2-task-local-seo','task-local'),
      ('role-seo','role-v2-task-seo','task-seo'),
      ('role-social','role-v2-task-social','task-social'),
      ('role-video','role-v2-task-video','task-video'),
      ('role-designer','role-v2-design-staff','design'),
      ('role-standard-design-staff','role-v2-design-staff','design'),
      ('role-standard-design-head','role-v2-design-head','design'),
      ('role-leader-marketing','role-v2-mkt-head','marketing'),
      ('role-standard-mkt-director','role-v2-mkt-director','marketing'),
      ('role-standard-mkt-head','role-v2-mkt-head','marketing'),
      ('role-standard-mkt-staff','role-v2-mkt-staff','marketing-staff'),
      ('role-kinh-doanh','role-v2-sales-staff','sales'),
      ('role-standard-sales-staff','role-v2-sales-staff','sales'),
      ('role-standard-sales-head','role-v2-sales-head','sales'),
      ('role-u0fzsvsp','role-v2-sales-head','sales'),
      ('role-9h328b84','role-v2-distribution-staff','distribution'),
      ('role-xwbmhg3b','role-v2-sales-director','sales'),
      ('role-g8qc3q2s','role-v2-showroom-staff','showroom'),
      ('role-standard-account-chief','role-v2-account-chief','finance'),
      ('role-standard-account-stock','role-v2-account-stock','finance'),
      ('role-0k2hmw8r','role-v2-accountant','finance'),
      ('role-wupj68a6','role-v2-hr','hr'),
      ('role-xim870m3','role-v2-supply-chain','supply'),
      ('role-standard-proc-head','role-v2-proc-head','supply'),
      ('role-standard-buyer','role-v2-purchasing','supply')
    ) v(old_id,new_id,domain)
  LOOP
    SELECT ARRAY(
      SELECT DISTINCT old_perm
      FROM public.app_roles old_role
      CROSS JOIN LATERAL unnest(old_role.permissions) AS old_perm
      JOIN public.base_permission_catalog catalog ON catalog.key=old_perm
      WHERE old_role.id=pair.old_id
        AND NOT private.universal_dormant_fence(pair.old_id,old_perm)
        AND CASE pair.domain
          WHEN 'task-web' THEN old_perm LIKE 'web.%' OR old_perm LIKE 'task.%' OR old_perm IN ('order.view','order.view_mine','order.create','brand.view','kpi.view_own')
          WHEN 'task-local' THEN old_perm LIKE 'local.%' OR old_perm LIKE 'task.%' OR old_perm IN ('order.view','order.view_mine','order.create','brand.view','kpi.view_own')
          WHEN 'task-seo' THEN old_perm LIKE 'web.%' OR old_perm LIKE 'task.%' OR old_perm IN ('order.view','order.view_mine','order.create','brand.view','kpi.view_own')
          WHEN 'task-social' THEN old_perm LIKE 'social.%' OR old_perm LIKE 'task.%' OR old_perm IN ('order.view','order.view_mine','order.create','brand.view','kpi.view_own')
          WHEN 'task-video' THEN old_perm LIKE 'video.%' OR old_perm LIKE 'task.%' OR old_perm IN ('order.view','order.view_mine','order.create','brand.view','kpi.view_own')
          WHEN 'design' THEN old_perm LIKE 'order.%' OR old_perm LIKE 'task.%'
          WHEN 'marketing' THEN old_perm LIKE ANY(ARRAY['order.%','task.%','web.%','social.%','video.%','local.%','brand.%','kpi.%','report.%'])
          WHEN 'marketing-staff' THEN old_perm LIKE ANY(ARRAY['order.%','task.%','web.%','social.%','video.%','local.%']) OR old_perm='kpi.view_own'
          WHEN 'sales' THEN old_perm LIKE ANY(ARRAY['biz.%','signal.%','oq.%','ot.%']) OR old_perm IN ('kpi.view_own','finance.incoming.view','finance.incoming.view_totals','supplier.master.view')
          WHEN 'distribution' THEN old_perm LIKE ANY(ARRAY['biz.%','signal.%']) OR old_perm='kpi.view_own'
          WHEN 'showroom' THEN old_perm LIKE 'showroom.%' OR old_perm='signal.sale'
          WHEN 'finance' THEN old_perm LIKE 'finance.incoming.%'
          WHEN 'hr' THEN old_perm LIKE 'leave.%' OR old_perm LIKE 'att.%' OR old_perm IN ('settings.people','settings.user_view','settings.account_approve','settings.account_reject','settings.account_lock','settings.login_history')
          WHEN 'supply' THEN old_perm LIKE ANY(ARRAY['oq.%','ot.%','supplier.master.%'])
          ELSE false END
      ORDER BY old_perm
    ) INTO append_perms;
    UPDATE public.app_roles target
       SET permissions=(SELECT ARRAY(SELECT DISTINCT x FROM unnest(target.permissions || coalesce(append_perms,'{}'::text[])) AS x ORDER BY x))
     WHERE target.id=pair.new_id
       AND cardinality(coalesce(append_perms,'{}'::text[]))>0
       AND NOT (target.permissions @> append_perms);
  END LOOP;

  -- Operational hierarchy: supervisors must retain the actual everyday
  -- business rights of their staff in their own center.
  FOR pair IN SELECT * FROM (VALUES
    ('role-v2-b2b-staff','role-v2-b2b-team'),
    ('role-v2-b2b-team','role-v2-b2b-head'),
    ('role-v2-b2b-head','role-v2-b2b-director'),
    ('role-v2-b2b-staff','role-v2-distribution-staff'),
    ('role-v2-b2b-team','role-v2-distribution-team'),
    ('role-v2-b2b-head','role-v2-distribution-head'),
    ('role-v2-b2b-director','role-v2-distribution-director'),
    ('role-v2-distribution-staff','role-v2-distribution-team'),
    ('role-v2-distribution-team','role-v2-distribution-head'),
    ('role-v2-distribution-head','role-v2-distribution-director'),
    ('role-v2-showroom-staff','role-v2-showroom-manager'),
    ('role-v2-showroom-manager','role-v2-btc-director'),
    ('role-v2-mkt-staff','role-v2-mkt-head'),
    ('role-v2-mkt-head','role-v2-mkt-director'),
    ('role-v2-accountant','role-v2-account-chief'),
    ('role-v2-purchasing','role-v2-proc-head')
  ) v(child_id,parent_id)
  LOOP
    SELECT permissions INTO current_perms FROM public.app_roles WHERE id=pair.child_id AND catalog_generation=2;
    IF current_perms IS NULL THEN RAISE EXCEPTION 'Missing source Role V2: %',pair.child_id; END IF;
    UPDATE public.app_roles p SET permissions=ARRAY(SELECT DISTINCT x FROM unnest(p.permissions || current_perms) AS x ORDER BY x)
    WHERE p.id=pair.parent_id AND NOT (p.permissions @> current_perms);
  END LOOP;

  -- Distribution staff did not get signal.sale in the first split. Fix all
  -- four roles and use the former distribution role's narrow retail scope.
  UPDATE public.app_roles r SET
    permissions=ARRAY(
      SELECT DISTINCT k FROM unnest(r.permissions || ARRAY['signal.sale','biz.crm_use','biz.view_own']) AS k ORDER BY k
    ),
    signal_scope_all=false,
    signal_scope=ARRAY['Mua Lẻ']::text[]
  WHERE r.id IN ('role-v2-distribution-staff','role-v2-distribution-team','role-v2-distribution-head','role-v2-distribution-director')
    AND (NOT r.permissions @> ARRAY['signal.sale','biz.crm_use','biz.view_own']::text[]
         OR r.signal_scope_all OR r.signal_scope IS DISTINCT FROM ARRAY['Mua Lẻ']::text[]);

  UPDATE public.app_roles r SET
    signal_scope_all=false,
    signal_scope=ARRAY['Sứ quà tặng','Sản xuất theo yêu cầu','Nhập sỉ','Xuất khẩu','Bát đĩa nhà hàng','Khác']::text[]
  WHERE r.id IN ('role-v2-b2b-staff','role-v2-b2b-team','role-v2-b2b-head','role-v2-b2b-director')
    AND (r.signal_scope_all OR r.signal_scope IS DISTINCT FROM ARRAY['Sứ quà tặng','Sản xuất theo yêu cầu','Nhập sỉ','Xuất khẩu','Bát đĩa nhà hàng','Khác']::text[]);

  -- Management rights are explicit; never give assignment to ordinary staff.
  UPDATE public.app_roles r SET
    permissions=ARRAY(
      SELECT DISTINCT k FROM unnest(r.permissions || ARRAY['signal.sale','signal.assign','signal.reassign','signal.report']) AS k ORDER BY k
    )
  WHERE r.id IN (
    'role-v2-b2b-head','role-v2-b2b-director','role-v2-distribution-head',
    'role-v2-distribution-director','role-v2-btc-director','role-v2-sales-head','role-v2-sales-director'
  ) AND NOT (r.permissions @> ARRAY['signal.sale','signal.assign','signal.reassign','signal.report']::text[]);
  UPDATE public.app_roles r SET permissions=ARRAY(
    SELECT DISTINCT k FROM unnest(r.permissions || ARRAY['signal.sale','signal.assign']) AS k ORDER BY k)
  WHERE r.id IN ('role-v2-b2b-team','role-v2-distribution-team','role-v2-sales-team')
    AND NOT (r.permissions @> ARRAY['signal.sale','signal.assign']::text[]);

  -- Overall Sales Director oversees all three centers; do not copy
  -- account administration rights or Super Admin Role.
  SELECT permissions INTO current_perms FROM public.app_roles WHERE id='role-v2-b2b-director';
  UPDATE public.app_roles r SET permissions=ARRAY(
    SELECT DISTINCT x FROM unnest(r.permissions || current_perms) AS x ORDER BY x)
  WHERE r.id='role-v2-sales-director' AND NOT (r.permissions @> current_perms);

  -- Exact existing business appointments are preserved: only their Role ID
  -- mapping is corrected by unit; no employee appointment is added/removed.
  FOR pair IN SELECT * FROM (VALUES
    ('624e6e56-eeab-42d5-85af-6af284e72f34','60dc2983-c41c-42dc-bcf6-14010beaa3dd','role-v2-b2b-director'),
    ('28239f0c-0657-4b88-8287-5b715a2387dd','e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','role-v2-b2b-staff'),
    ('61efa9bf-0de8-43d5-95c8-f0578627a40e','3fac501b-ebb5-4262-8c87-d376a2c18ad8','role-v2-b2b-head'),
    ('61efa9bf-0de8-43d5-95c8-f0578627a40e','e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','role-v2-b2b-staff'),
    ('3df93c75-8a46-4c2f-bc09-7583aa672b52','60dc2983-c41c-42dc-bcf6-14010beaa3dd','role-v2-distribution-director'),
    ('cef13ee0-73a8-43c4-bfe5-6bef393248fc','3fac501b-ebb5-4262-8c87-d376a2c18ad8','role-v2-distribution-head'),
    ('cef13ee0-73a8-43c4-bfe5-6bef393248fc','e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','role-v2-distribution-staff'),
    ('76fcf3a9-8561-4e2a-be3c-c6724a6310fb','60dc2983-c41c-42dc-bcf6-14010beaa3dd','role-v2-btc-director'),
    ('d970fba4-4b4c-48e4-9b15-89e05312afc1','e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','role-v2-showroom-staff')
  ) v(unit_id,title_id,new_role)
  LOOP
    IF NOT EXISTS(SELECT 1 FROM public.org_assignments WHERE unit_id=pair.unit_id AND title_id=pair.title_id AND status='active') THEN CONTINUE; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id=pair.new_role AND catalog_generation=2) THEN
      RAISE EXCEPTION 'Missing desired business Role V2 %',pair.new_role;
    END IF;
    INSERT INTO public.org_position_roles(unit_id,title_id,role_id)
      VALUES (pair.unit_id,pair.title_id,pair.new_role)
      ON CONFLICT (unit_id,title_id) DO UPDATE SET role_id=excluded.role_id,
          revision=public.org_position_roles.revision+1,updated_at=now()
      WHERE public.org_position_roles.role_id IS DISTINCT FROM excluded.role_id;
  END LOOP;

  IF EXISTS (SELECT 1 FROM public.app_roles WHERE id='role-v2-distribution-staff' AND NOT ('signal.sale'=ANY(permissions))) THEN
    RAISE EXCEPTION 'Distribution staff lost signal.sale';
  END IF;
END
$$;
