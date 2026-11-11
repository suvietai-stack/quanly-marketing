SET LOCAL lock_timeout = '8s';
ALTER TABLE public.app_roles ADD COLUMN IF NOT EXISTS catalog_generation smallint NOT NULL DEFAULT 1;
COMMENT ON COLUMN public.app_roles.catalog_generation IS '1 = legacy catalog; 2 = canonical default Role set created via audited role_catalog_change';