-- Retire legacy V1 role-setup RPC endpoints after the full V2 migration.
-- These procedures could recreate the old role catalog if invoked again.
-- Keep runtime permission resolution and protected admin identities intact.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM public.app_roles
    WHERE catalog_generation<2 AND role_kind<>'system') THEN
    RAISE EXCEPTION 'V1 business roles remain; cannot retire setup functions';
  END IF;
  IF EXISTS(SELECT 1 FROM public.org_position_roles pr
    JOIN public.app_roles r ON r.id=pr.role_id
    WHERE r.catalog_generation<2) THEN
    RAISE EXCEPTION 'An organization position still uses V1';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.app_roles
    WHERE id='role-v2-common' AND catalog_generation>=2) THEN
    RAISE EXCEPTION 'Common V2 role not ready';
  END IF;
END $$;
DROP FUNCTION IF EXISTS public.standard_role_catalog_setup() RESTRICT;
DROP FUNCTION IF EXISTS public.standard_role_catalog_consolidate() RESTRICT;
