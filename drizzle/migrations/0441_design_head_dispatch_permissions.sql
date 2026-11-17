-- Restore job dispatch and forced-state permissions for the canonical Design Head role.
-- The Design Staff role already has these rights. The Head previously had none,
-- even though it owns the active Design department in the organization tree.
-- The Head role includes all Design actions from the canonical Design Staff role.
-- Additive only: no employee assignments, legacy jobs or existing grants change.
DO $$
DECLARE
  required text[] := ARRAY[
    'order.assign', 'order.force_status',
    'order.photo.assign', 'order.photo.force_status',
    'order.marketing_design.assign', 'order.marketing_design.force_status',
    'order.order_mockup.assign', 'order.order_mockup.force_status'
  ];
  staff_permissions text[];
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.app_roles
    WHERE id = 'role-v2-design-head'
      AND role_kind = 'position'
      AND catalog_generation >= 2
      AND NOT is_system
  ) THEN
    RAISE EXCEPTION 'Canonical Design Head role is missing or no longer a position role';
  END IF;

  SELECT ARRAY(
    SELECT DISTINCT perm
    FROM unnest(coalesce(permissions,'{}'::text[])) AS perm
    WHERE perm LIKE 'order.%'
    ORDER BY perm
  ) INTO staff_permissions
  FROM public.app_roles
  WHERE id='role-v2-design-staff' AND catalog_generation>=2 AND role_kind='position';

  IF staff_permissions IS NULL OR cardinality(staff_permissions)<20 THEN
    RAISE EXCEPTION 'Canonical Design Staff permissions missing or incomplete';
  END IF;

  -- Head can perform every staff Design operation, plus full flow dispatch.
  -- Other departments and all existing role grants remain unchanged.
  required := required || staff_permissions;

  PERFORM set_config('app.role_reason',
    'Khôi phục quyền phân công và ép trạng thái Job theo vị trí Trưởng phòng Thiết kế',
    true);

  UPDATE public.app_roles r
  SET permissions = ARRAY(
    SELECT DISTINCT key
    FROM unnest(coalesce(r.permissions, '{}'::text[]) || required) AS key
    ORDER BY key
  )
  WHERE r.id = 'role-v2-design-head'
    AND NOT (r.permissions @> required);

  IF EXISTS (
    SELECT 1 FROM public.app_roles
    WHERE id = 'role-v2-design-head' AND NOT (permissions @> required)
  ) THEN
    RAISE EXCEPTION 'Design Head dispatch rights not applied';
  END IF;
END
$$;
