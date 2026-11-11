DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.standard_role_catalog_consolidate()'::regprocedure) INTO d;
IF d NOT LIKE '%Có bổ nhiệm mới: cần xem trước riêng%' THEN RAISE EXCEPTION 'Unexpected catalog guard'; END IF;
d:=replace(d,$s$IF EXISTS(SELECT 1 FROM org_assignments WHERE source='canonical' AND status='active' AND (ends_at IS NULL OR ends_at>now())) THEN$s$,$s$IF EXISTS(SELECT 1 FROM org_assignments a JOIN base_title_role_links l ON l.title_id=a.title_id WHERE a.source='canonical' AND a.status='active' AND (a.ends_at IS NULL OR a.ends_at>now()) AND l.role_id IN (SELECT value->>'from' FROM jsonb_array_elements(mapping_))) THEN$s$);
EXECUTE d;
END $$;
COMMENT ON FUNCTION public.standard_role_catalog_consolidate() IS 'Merge equivalent unassigned team Role definitions only; existing direct grants and unrelated live appointments are preserved, affected live sources block consolidation.';