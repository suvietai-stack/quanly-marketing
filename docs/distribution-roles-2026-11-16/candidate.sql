-- STAGED ONLY. Requires owner approval of exact SHA before production apply.
-- Four independent catalog Roles; ZERO assignment/title/slot/binding writes.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
LOCK TABLE public.app_roles IN SHARE ROW EXCLUSIVE MODE;
DO $seed$
DECLARE r record; existing public.app_roles%ROWTYPE; perms text[];
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.org_units WHERE id='3df93c75-8a46-4c2f-bc09-7583aa672b52' AND active AND kind='system') THEN
    RAISE EXCEPTION 'Distribution source changed; audit again';
  END IF;
  FOR r IN SELECT * FROM (VALUES
    ('role-v2-distribution-director','Giám đốc Trung tâm Kinh doanh Phân Phối',true),
    ('role-v2-distribution-head','Trưởng phòng Kinh doanh Phân Phối',true),
    ('role-v2-distribution-team','Trưởng nhóm Kinh doanh Phân Phối',true),
    ('role-v2-distribution-staff','Nhân viên Kinh doanh Phân Phối',false)
  ) v(id,name,manager) LOOP
    perms:=ARRAY['att.create','att.view_own','k3.use','k3hub.use','leave.create','leave.recall','leave.view_own'];
    IF r.manager THEN perms:=perms||ARRAY['k3hub.center']; END IF;
    SELECT * INTO existing FROM public.app_roles WHERE id=r.id;
    IF FOUND THEN
      -- An administrator may customize an existing Role; never overwrite it.
      IF existing.name IS DISTINCT FROM r.name OR existing.role_kind IS DISTINCT FROM 'position'
        OR existing.catalog_generation IS DISTINCT FROM 2 OR existing.is_system
        OR existing.catalog_state IS DISTINCT FROM 'standard' THEN
        RAISE EXCEPTION 'Conflicting Role identity: %',r.id;
      END IF;
      CONTINUE;
    END IF;
    IF EXISTS(SELECT 1 FROM public.app_roles WHERE lower(btrim(name))=lower(btrim(r.name))) THEN
      RAISE EXCEPTION 'Duplicate Role name: %',r.name;
    END IF;
    IF EXISTS(SELECT 1 FROM unnest(perms) p WHERE NOT EXISTS(SELECT 1 FROM public.base_permission_catalog c WHERE c.key=p)
      OR NOT private.grant_source_ready('position',p)) THEN
      RAISE EXCEPTION 'Unsupported Distribution permission';
    END IF;
    PERFORM private.role_editor_validate('position',perms,'{}'::text[]);
    PERFORM set_config('app.role_reason','Bốn Role vị trí Phân Phối độc lập; không thay bổ nhiệm',true);
    INSERT INTO public.app_roles(id,name,description,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,signal_scope_all,signal_scope,catalog_generation)
    VALUES(r.id,r.name,'Phân Phối; quyền 3K theo bổ nhiệm và cây đơn vị hiện hành; không quyền Sale đơn hàng.',perms,false,'standard','Phân Phối','position',r.id,false,'{}'::text[],2);
  END LOOP;
END $seed$;
COMMIT;