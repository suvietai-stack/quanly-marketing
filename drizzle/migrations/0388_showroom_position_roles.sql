-- 2026-11-16: two narrowly scoped V2 position roles for the future Showroom block.
-- NO personnel reassignment here. Existing showroom staff still hold legacy Sales
-- appointments; changing those before an audited transition would drop live rights.
-- POS/stock/payment rights are intentionally absent until those modules exist.
DO $seed$
DECLARE
  staff_perms text[] := ARRAY[
    'att.create','att.edit_own','att.view_own',
    'leave.create','leave.edit_own','leave.recall','leave.view_own',
    'overview.own_only','overview.view','signal.sale'
  ];
  manager_perms text[] := ARRAY[
    'att.create','att.edit_own','att.view_own','att.witness',
    'leave.approve','leave.create','leave.edit_own','leave.recall',
    'leave.view_assigned','leave.view_own','leave.view_unit',
    'overview.own_only','overview.view','signal.sale'
  ];
  candidate record;
  existing_role public.app_roles%ROWTYPE;
BEGIN
  -- Mua Lẻ is the existing bounded Zalo/signal group; do not expand to all groups.
  FOR candidate IN SELECT * FROM (VALUES
    ('role-v2-showroom-staff', 'Nhân viên Showroom',
     'Nhân viên bán lẻ showroom; chưa bao gồm POS/kho/thu ngân.',
     staff_perms),
    ('role-v2-showroom-manager', 'Cửa hàng trưởng',
     'Quản lý showroom; xem đơn nghỉ phép của đơn vị và duyệt đơn được giao; chưa bao gồm quyền tài chính/POS.',
     manager_perms)
  ) AS v(role_id, role_name, description, permissions)
  LOOP
    IF EXISTS (
      SELECT 1 FROM unnest(candidate.permissions) perm
      WHERE NOT EXISTS (SELECT 1 FROM public.base_permission_catalog c WHERE c.key=perm)
         OR NOT private.grant_source_ready('position',perm)
         OR NOT private.org_role_permission_ready(perm)
    ) THEN RAISE EXCEPTION 'Unsafe showroom role permission in %', candidate.role_id; END IF;
    SELECT * INTO existing_role FROM public.app_roles WHERE id=candidate.role_id;
    IF FOUND THEN
      IF existing_role.name IS DISTINCT FROM candidate.role_name
         OR existing_role.role_kind IS DISTINCT FROM 'position'
         OR existing_role.catalog_generation IS DISTINCT FROM 2
         OR existing_role.catalog_state IS DISTINCT FROM 'standard'
         OR existing_role.permissions IS DISTINCT FROM candidate.permissions
         OR existing_role.signal_scope_all IS DISTINCT FROM false
         OR existing_role.signal_scope IS DISTINCT FROM ARRAY['Mua Lẻ']::text[]
      THEN RAISE EXCEPTION 'Role % already exists with different data; review instead of overwrite', candidate.role_id; END IF;
    ELSE
      IF EXISTS(SELECT 1 FROM public.app_roles
                WHERE lower(btrim(name))=lower(btrim(candidate.role_name))
                  AND catalog_generation=2 AND catalog_state='standard') THEN
        RAISE EXCEPTION 'An existing V2 role has the same name as %', candidate.role_name;
      END IF;
      PERFORM set_config('app.role_reason','Thiết lập Role vị trí Khối Showroom theo yêu cầu quản trị',true);
      INSERT INTO public.app_roles
        (id,name,description,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,
         signal_scope_all,signal_scope,catalog_generation)
      VALUES
        (candidate.role_id,candidate.role_name,candidate.description,candidate.permissions,
         false,'standard','Showroom','position',candidate.role_id,false,ARRAY['Mua Lẻ']::text[],2);
    END IF;
  END LOOP;
END
$seed$;
