-- Restore job dispatch and forced-state permissions for the canonical Design Head role.
-- The Design Staff role already has these rights. The Head previously had none,
-- even though it owns the active Design department in the organization tree.
-- Additive only: no employee assignments, legacy jobs or existing grants change.
DO $$
DECLARE
  required text[] := ARRAY[
    'order.assign',
    'order.force_status',
    'order.photo.assign',
    'order.photo.force_status',
    'order.marketing_design.assign',
    'order.marketing_design.force_status',
    'order.order_mockup.assign',
    'order.order_mockup.force_status'
  ];
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
