-- Online stage 4/8. Only short DDL locks on a bounded group of source tables.
-- The live base_tier1 resolver stays uncached until stage 0475 completes.
DO $stage$
DECLARE source text;
BEGIN
  FOREACH source IN ARRAY ARRAY['public.mkt_specialties','public.mkt_staff_specialties','public.biz_appointments','public.biz_department_members']
  LOOP
    IF to_regclass(source) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS base_role_cache_mark ON %s',source);
      EXECUTE format('CREATE TRIGGER base_role_cache_mark AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark()',source);
    END IF;
  END LOOP;
END $stage$;
