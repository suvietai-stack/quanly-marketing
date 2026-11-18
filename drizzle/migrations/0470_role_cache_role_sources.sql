-- Online stage 3/8. Only short DDL locks on a bounded group of source tables.
-- The live base_tier1 resolver stays uncached until stage 0475 completes.
DO $stage$
DECLARE source text;
BEGIN
  FOREACH source IN ARRAY ARRAY['public.app_roles','public.user_roles','public.user_permission_overrides','public.base_org_state','public.base_title_role_links']
  LOOP
    IF to_regclass(source) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS base_role_cache_mark ON %s',source);
      EXECUTE format('CREATE TRIGGER base_role_cache_mark AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark()',source);
    END IF;
  END LOOP;
END $stage$;
