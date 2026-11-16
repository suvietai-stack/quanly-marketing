-- STAGED ONLY. Requires owner approval of exact SHA before production apply.
-- Five independent B2B/BTC catalog Roles; ZERO assignment/title/slot/binding writes.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
LOCK TABLE public.app_roles IN SHARE ROW EXCLUSIVE MODE;
DO $seed$
DECLARE r record; existing public.app_roles%ROWTYPE; perms text[];
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.org_units WHERE id='624e6e56-eeab-42d5-85af-6af284e72f34' AND active AND kind='system') THEN
    RAISE EXCEPTION 'B2B source changed; audit again';
  END IF;
  FOR r IN SELECT * FROM (VALUES
    ('role-v2-b2b-director','Giám đốc Trung tâm Kinh doanh B2B',true),
    ('role-v2-b2b-head','Trưởng phòng Kinh doanh B2B',true),
    ('role-v2-b2b-team','Trưởng nhóm Kinh doanh B2B',true),
    ('role-v2-b2b-staff','Nhân viên Kinh doanh B2B',false),
    ('role-v2-btc-director','Giám đốc Trung tâm Kinh doanh BTC',true)
  ) v(id,name,manager) LOOP
    perms:=ARRAY['att.create','att.view_own','k3.use','k3hub.use','leave.create','leave.recall','leave.view_own'];
    IF r.manager THEN perms:=perms||ARRAY['k3hub.center']; END IF;
    IF r.id LIKE 'role-v2-b2b-%' THEN perms:=perms||ARRAY['k3hub.biz','order.view_mine','order.create','oq.view_own','oq.create','signal.sale','biz.crm_use']; END IF;
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
      RAISE EXCEPTION 'Unsupported B2B/BTC permission';
    END IF;
    PERFORM private.role_editor_validate('position',perms,'{}'::text[]);
    PERFORM set_config('app.role_reason','Năm Role vị trí B2B/BTC độc lập; không thay bổ nhiệm',true);
    INSERT INTO public.app_roles(id,name,description,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,signal_scope_all,signal_scope,catalog_generation)
    VALUES(r.id,r.name,'B2B/BTC; quyền theo bổ nhiệm và cây đơn vị hiện hành; chưa chuyển nguồn nhân sự.',perms,false,'standard',CASE WHEN r.id='role-v2-btc-director' THEN 'BTC' ELSE 'B2B' END,'position',r.id,false,'{}'::text[],2);
  END LOOP;
END $seed$;
COMMIT;