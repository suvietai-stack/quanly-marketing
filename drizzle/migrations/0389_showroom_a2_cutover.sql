-- A2 cutover: move the existing Bán Lẻ tree under a dedicated Showroom block.
-- Precondition: 0388_showroom_position_roles.sql applied.
-- One transaction; original identifiers, documents and appointment history stay intact.
-- A private audit snapshot is recorded before changing any live assignment.
BEGIN;
SET LOCAL lock_timeout = '8s';
SET LOCAL statement_timeout = '90s';
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
SELECT pg_advisory_xact_lock(hashtext('base_org'));
SELECT pg_advisory_xact_lock(hashtext('biz_org_structure'));
LOCK TABLE public.org_units, public.org_titles, public.org_assignments,
  public.org_position_roles, public.base_org_state, public.biz_appointments,
  public.biz_department_members, public.biz_systems, public.biz_departments,
  private.org_control IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE IF NOT EXISTS private.showroom_a2_cutover_audit (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL,
  before_data jsonb NOT NULL,
  after_data jsonb
);
REVOKE ALL ON private.showroom_a2_cutover_audit FROM PUBLIC, anon, authenticated;

DO $cutover$
DECLARE
  retail constant text := '76fcf3a9-8561-4e2a-be3c-c6724a6310fb';
  store constant text := 'd970fba4-4b4c-48e4-9b15-89e05312afc1';
  cutover_id constant text := 'showroom-a2-2026-11-16';
  title_staff constant text := 'showroom-hanoi-staff';
  title_manager constant text := 'showroom-hanoi-manager';
  at_time timestamptz := clock_timestamp();
  staff_ids uuid[];
  old_revision bigint;
  n integer;
  original jsonb;
BEGIN
  IF EXISTS (SELECT 1 FROM private.showroom_a2_cutover_audit WHERE id=cutover_id) THEN
    IF EXISTS(SELECT 1 FROM org_units WHERE id=retail AND parent_id='showroom-block')
       AND EXISTS(SELECT 1 FROM org_position_roles WHERE unit_id=store AND title_id=title_staff AND role_id='role-v2-showroom-staff')
       AND (SELECT count(*) FROM org_assignments WHERE unit_id=store AND title_id=title_staff AND source='canonical' AND ends_at IS NULL)=3
    THEN RETURN; END IF;
    RAISE EXCEPTION 'Showroom cutover audit exists, but current state differs; manual recovery required.';
  END IF;

  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id='role-v2-showroom-staff' AND role_kind='position' AND catalog_generation=2 AND catalog_state='standard')
    OR NOT EXISTS(SELECT 1 FROM app_roles WHERE id='role-v2-showroom-manager' AND role_kind='position' AND catalog_generation=2 AND catalog_state='standard')
  THEN RAISE EXCEPTION 'Missing approved Showroom V2 position roles.'; END IF;
  IF EXISTS(SELECT 1 FROM org_units WHERE id='showroom-block')
     OR NOT EXISTS(SELECT 1 FROM org_units WHERE id=retail AND kind='system' AND source='biz_systems' AND parent_id='biz-block' AND active)
     OR NOT EXISTS(SELECT 1 FROM org_units WHERE id=store AND kind='department' AND source='biz_departments' AND parent_id=retail AND active)
     OR EXISTS(SELECT 1 FROM org_units WHERE parent_id=retail AND id<>store)
     OR EXISTS(SELECT 1 FROM org_titles WHERE id IN (title_staff,title_manager) OR unit_id=store)
  THEN RAISE EXCEPTION 'Expected source topology or showroom titles changed; abort.'; END IF;

  SELECT array_agg(DISTINCT a.user_id ORDER BY a.user_id) INTO staff_ids
  FROM org_assignments a
  WHERE a.unit_id=store AND a.category='primary' AND a.source='biz_department_members'
    AND a.status='active' AND a.starts_at<=at_time AND a.ends_at IS NULL;
  IF coalesce(cardinality(staff_ids),0)<>3 THEN RAISE EXCEPTION 'Expected exactly three active showroom employees.'; END IF;
  IF (SELECT count(*) FROM org_assignments WHERE unit_id=store AND status='active' AND ends_at IS NULL)<>6
     OR (SELECT count(*) FROM org_assignments WHERE unit_id=store AND category='appointment'
           AND source='biz_appointments' AND status='active' AND ends_at IS NULL
           AND title_id='e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0'
           AND user_id=ANY(staff_ids))<>3
     OR (SELECT count(*) FROM biz_appointments WHERE department_id=store::uuid AND status='active' AND ended_at IS NULL AND user_id=ANY(staff_ids))<>3
     OR (SELECT count(*) FROM biz_department_members WHERE department_id=store::uuid AND ended_at IS NULL AND user_id=ANY(staff_ids))<>3
     OR EXISTS(SELECT 1 FROM org_assignments WHERE user_id=ANY(staff_ids) AND unit_id<>store AND status='active' AND ends_at IS NULL)
     OR EXISTS(SELECT 1 FROM org_assignments WHERE unit_id=store AND status='active' AND starts_at>at_time)
  THEN RAISE EXCEPTION 'Staff, appointment or future-assignment baseline changed; abort.'; END IF;

  SELECT revision INTO old_revision FROM private.org_control WHERE id=true FOR UPDATE;
  IF old_revision IS NULL OR old_revision IS DISTINCT FROM (SELECT revision FROM base_org_state WHERE id=true)
  THEN RAISE EXCEPTION 'Organization revisions diverged; abort.'; END IF;

  SELECT jsonb_build_object(
    'org_control_revision',old_revision,
    'staff_ids',to_jsonb(staff_ids),
    'units',(SELECT jsonb_agg(to_jsonb(u)) FROM org_units u WHERE id IN ('org-company','biz-block',retail,store)),
    'titles',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) FROM org_titles t WHERE unit_id=store),
    'assignments',(SELECT jsonb_agg(to_jsonb(a)) FROM org_assignments a WHERE user_id=ANY(staff_ids)),
    'biz_appointments',(SELECT jsonb_agg(to_jsonb(a)) FROM biz_appointments a WHERE a.department_id=store::uuid AND a.user_id=ANY(staff_ids)),
    'biz_department_members',(SELECT jsonb_agg(to_jsonb(m)) FROM biz_department_members m WHERE m.department_id=store::uuid AND m.user_id=ANY(staff_ids)),
    'position_roles',(SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) FROM org_position_roles r WHERE unit_id=store),
    'base_state',(SELECT to_jsonb(s) FROM base_org_state s WHERE id=true),
    'legacy_documents',(SELECT count(*) FROM biz_documents d WHERE d.department_id=store::uuid)
  ) INTO original;
  INSERT INTO private.showroom_a2_cutover_audit (id,reason,before_data)
    VALUES(cutover_id,'Tách Khối Showroom (A2), giữ toàn bộ lịch sử, chuyển 3 nhân viên từ Role Kinh doanh sang Nhân viên Showroom',original);

  -- Only the exact canonical/legacy projection fences are bypassed within this
  -- transaction. All FK, unique and interval/capacity checks remain active.
  ALTER TABLE public.org_units DISABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.org_assignments DISABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.base_org_state DISABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.biz_appointments DISABLE TRIGGER org_projection_fence;
  ALTER TABLE public.biz_appointments DISABLE TRIGGER org_projection_sync;
  ALTER TABLE public.biz_department_members DISABLE TRIGGER org_projection_fence;
  ALTER TABLE public.biz_department_members DISABLE TRIGGER org_projection_sync;

  INSERT INTO public.org_units (id,parent_id,kind,name,active,source,source_id,data)
    VALUES('showroom-block','org-company','block','Khối Showroom',true,'canonical','showroom-block',
      '{"id":"showroom-block","parent_id":"org-company","kind":"block","name":"Khối Showroom","active":true}'::jsonb);
  INSERT INTO public.org_parent_history(id,unit_id,parent_id,starts_at,source,data)
    SELECT gen_random_uuid()::text,id,parent_id,at_time,'showroom-a2-cutover',to_jsonb(u)
    FROM public.org_units u WHERE id=retail;
  UPDATE public.org_units SET parent_id='showroom-block',
    data=jsonb_set(coalesce(data,'{}'::jsonb),'{parent_id}',to_jsonb('showroom-block'::text),true),
    revision=revision+1 WHERE id=retail;

  -- Canonical title rows require the same authorization fence as org_units.
  ALTER TABLE public.org_titles DISABLE TRIGGER org_canonical_fence;
  INSERT INTO public.org_titles (id,unit_id,name,code,level,kind,capacity,active,source,source_id,data)
  VALUES
    (title_staff,store,'Nhân viên Showroom','showroom-staff',0,'staff',0,true,'canonical',title_staff,
      jsonb_build_object('id',title_staff,'unit_id',store,'name','Nhân viên Showroom','code','showroom-staff','level',0,'kind','staff','capacity',0,'active',true)),
    (title_manager,store,'Cửa hàng trưởng','showroom-manager',2,'manager',1,true,'canonical',title_manager,
      jsonb_build_object('id',title_manager,'unit_id',store,'name','Cửa hàng trưởng','code','showroom-manager','level',2,'kind','manager','capacity',1,'active',true));
  INSERT INTO public.org_position_roles(unit_id,title_id,role_id)
    VALUES (store,title_staff,'role-v2-showroom-staff'),(store,title_manager,'role-v2-showroom-manager');

  -- End, never delete, legacy B2B assignments and corresponding projections.
  UPDATE public.biz_appointments SET ended_at=at_time,status='ended'
    WHERE department_id=store::uuid AND status='active' AND ended_at IS NULL AND user_id=ANY(staff_ids);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n<>3 THEN RAISE EXCEPTION 'Expected three business appointments to end, got %',n; END IF;
  UPDATE public.biz_department_members SET ended_at=at_time,effective_to=(at_time AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    WHERE department_id=store::uuid AND ended_at IS NULL AND user_id=ANY(staff_ids);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n<>3 THEN RAISE EXCEPTION 'Expected three business memberships to end, got %',n; END IF;
  UPDATE public.org_assignments SET ends_at=at_time,revision=revision+1
    WHERE unit_id=store AND status='active' AND ends_at IS NULL AND source IN ('biz_appointments','biz_department_members') AND user_id=ANY(staff_ids);
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n<>6 THEN RAISE EXCEPTION 'Expected six source assignments to end, got %',n; END IF;

  -- One (and only one) primary canonical position per existing employee.
  INSERT INTO public.org_assignments(id,unit_id,title_id,user_id,category,starts_at,status,source,source_id,data)
    SELECT z.id,store,title_staff,z.user_id,'primary',at_time,'active','canonical',z.id,
      jsonb_build_object('id',z.id,'unit_id',store,'title_id',title_staff,'user_id',z.user_id,
        'kind','primary','starts_at',at_time,'active',true)
    FROM (SELECT gen_random_uuid()::text AS id,unnest(staff_ids) AS user_id) z;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n<>3 THEN RAISE EXCEPTION 'Expected three new canonical showroom assignments, got %',n; END IF;

  -- Refresh cached canonical org and permission revision after all source writes.
  UPDATE public.base_org_state SET config=private.org_config(),revision=old_revision+1,updated_at=clock_timestamp()
    WHERE id=true AND revision=old_revision;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'Could not update canonical organization state'; END IF;
  UPDATE private.org_control SET revision=old_revision+1 WHERE id=true AND revision=old_revision;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'Could not advance organization revision'; END IF;

  ALTER TABLE public.org_titles ENABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.biz_department_members ENABLE TRIGGER org_projection_sync;
  ALTER TABLE public.biz_department_members ENABLE TRIGGER org_projection_fence;
  ALTER TABLE public.biz_appointments ENABLE TRIGGER org_projection_sync;
  ALTER TABLE public.biz_appointments ENABLE TRIGGER org_projection_fence;
  ALTER TABLE public.base_org_state ENABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.org_assignments ENABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.org_units ENABLE TRIGGER org_canonical_fence;

  IF (SELECT count(*) FROM org_assignments WHERE unit_id=store AND source='canonical' AND title_id=title_staff AND status='active' AND ends_at IS NULL)<>3
     OR EXISTS(SELECT 1 FROM org_assignments WHERE unit_id=store AND source IN ('biz_appointments','biz_department_members') AND ends_at IS NULL)
     OR EXISTS(SELECT 1 FROM biz_appointments WHERE department_id=store::uuid AND status='active' AND ended_at IS NULL)
     OR EXISTS(SELECT 1 FROM biz_department_members WHERE department_id=store::uuid AND ended_at IS NULL)
     OR NOT EXISTS(SELECT 1 FROM org_units WHERE id=retail AND parent_id='showroom-block')
  THEN RAISE EXCEPTION 'Post-cutover invariants failed; transaction rolled back'; END IF;
  UPDATE private.showroom_a2_cutover_audit SET after_data=jsonb_build_object(
    'org_revision',old_revision+1,
    'staff_count',(SELECT count(*) FROM org_assignments WHERE unit_id=store AND title_id=title_staff AND ends_at IS NULL),
    'legacy_document_count',(SELECT count(*) FROM biz_documents WHERE department_id=store::uuid),
    'retail_parent',(SELECT parent_id FROM org_units WHERE id=retail)
  ) WHERE id=cutover_id;
END
$cutover$;
COMMIT;
