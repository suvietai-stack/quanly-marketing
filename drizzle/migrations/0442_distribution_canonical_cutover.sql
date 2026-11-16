-- Distribution A1: audited, non-destructive canonical block extraction.
-- Never replace member, position, appointment, KR, 3K or document IDs.
-- Existing biz_* is retained as the authoritative business workflow backend.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='100s';
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
SELECT pg_advisory_xact_lock(hashtext('base_org'));
SELECT pg_advisory_xact_lock(hashtext('biz_org_structure'));
SELECT pg_advisory_xact_lock(hashtext('k3hub_policy'),0);
LOCK TABLE public.org_units,public.base_org_state,private.org_control,
 public.k3hub_policy_versions IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE IF NOT EXISTS private.distribution_cutover_audit(
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL,
  before_data jsonb NOT NULL,
  after_data jsonb
);
REVOKE ALL ON private.distribution_cutover_audit FROM PUBLIC,anon,authenticated;

DO $cutover$
DECLARE
  dist_system constant text := '3df93c75-8a46-4c2f-bc09-7583aa672b52';
  dept_id constant text := 'cef13ee0-73a8-43c4-bfe5-6bef393248fc';
  distribution_block constant text := 'distribution-block';
  cutoff_id constant text := 'distribution-a1-20261116';
  at_time timestamptz := clock_timestamp();
  current_date_vn date := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  rev bigint;
  policy_revision bigint;
  old_blocks text[];
  before_snapshot jsonb;
  after_snapshot jsonb;
  n int;
BEGIN
  IF EXISTS(SELECT 1 FROM private.distribution_cutover_audit WHERE id=cutoff_id) THEN
    IF EXISTS(SELECT 1 FROM public.org_units WHERE id=dist_system AND parent_id=distribution_block)
      AND EXISTS(SELECT 1 FROM public.org_units WHERE id=distribution_block AND parent_id='org-company')
      AND private.biz_owned_system(dist_system::uuid)
      AND distribution_block=ANY(private.k3hub_policy_at(current_date_vn))
    THEN RETURN; END IF;
    RAISE EXCEPTION 'Found incomplete Distribution cutover; manual recovery is required.';
  END IF;
  IF EXISTS(SELECT 1 FROM public.org_units WHERE id=distribution_block)
    OR NOT EXISTS(SELECT 1 FROM public.org_units WHERE id=dist_system AND parent_id='biz-block'
      AND source='biz_systems' AND kind='system' AND active)
    OR NOT EXISTS(SELECT 1 FROM public.org_units WHERE id=dept_id AND parent_id=dist_system
      AND source='biz_departments' AND kind='department' AND active)
    OR NOT EXISTS(SELECT 1 FROM public.biz_departments WHERE id=dept_id::uuid AND system_id=dist_system::uuid AND active)
    OR NOT EXISTS(SELECT 1 FROM public.biz_systems WHERE id=dist_system::uuid AND active)
    OR EXISTS(SELECT 1 FROM public.org_units WHERE parent_id=dist_system AND id<>dept_id)
  THEN RAISE EXCEPTION 'Unexpected Distribution hierarchy; cutover aborted without changes.'; END IF;

  SELECT revision INTO rev FROM private.org_control WHERE id=true FOR UPDATE;
  IF rev IS NULL OR rev IS DISTINCT FROM (SELECT revision FROM public.base_org_state WHERE id=true)
    THEN RAISE EXCEPTION 'Organization revisions diverged.'; END IF;
  SELECT revision,applied_block_ids INTO policy_revision,old_blocks
    FROM public.k3hub_policy_versions ORDER BY revision DESC LIMIT 1 FOR UPDATE;
  IF policy_revision IS NULL OR NOT ('biz-block'=ANY(old_blocks))
    OR current_date_vn < (SELECT max(effective_from) FROM public.k3hub_policy_versions)
  THEN RAISE EXCEPTION 'Unexpected 3K policy baseline.'; END IF;

  before_snapshot := jsonb_build_object(
    'org_revision',rev,'k3_policy_revision',policy_revision,'k3_policy_blocks',to_jsonb(old_blocks),
    'system',(SELECT to_jsonb(u) FROM public.org_units u WHERE u.id=dist_system),
    'department',(SELECT to_jsonb(u) FROM public.org_units u WHERE u.id=dept_id),
    'org_assignments',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb)
       FROM public.org_assignments a WHERE a.unit_id IN (dist_system,dept_id)),
    'biz_members',(SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]'::jsonb)
       FROM public.biz_department_members m WHERE m.department_id=dept_id::uuid),
    'biz_appointments',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb)
       FROM public.biz_appointments a WHERE a.system_id=dist_system::uuid OR a.department_id=dept_id::uuid),
    'kr_goals',(SELECT count(*) FROM public.biz_annual_goals WHERE department_id=dept_id::uuid),
    'biz_documents',(SELECT count(*) FROM public.biz_documents WHERE department_id=dept_id::uuid),
    'k3_goals',(SELECT count(*) FROM public.k3_goals WHERE org_unit_id=dept_id OR department_id=dept_id::uuid)
  );
  INSERT INTO private.distribution_cutover_audit(id,reason,before_data)
    VALUES(cutoff_id,'Tách Khối Phân Phối ngang Khối Kinh Doanh, bảo toàn toàn bộ nguồn dữ liệu',before_snapshot);

  -- Bypass canonical direct-write guard only within one locked migration transaction.
  ALTER TABLE public.org_units DISABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.base_org_state DISABLE TRIGGER org_canonical_fence;
  INSERT INTO public.org_units (id,parent_id,kind,name,active,source,source_id,data)
  VALUES (distribution_block,'org-company','block','Khối Phân Phối',true,'canonical',distribution_block,
    jsonb_build_object('id',distribution_block,'parent_id','org-company','kind','block','name','Khối Phân Phối','active',true));
  INSERT INTO public.org_parent_history (id,unit_id,parent_id,starts_at,source,data)
    SELECT gen_random_uuid()::text,u.id,u.parent_id,at_time,'distribution-a1-cutover',to_jsonb(u)
    FROM public.org_units u WHERE u.id=dist_system;
  UPDATE public.org_units SET parent_id=distribution_block,
    data=jsonb_set(coalesce(data,'{}'::jsonb),'{parent_id}',to_jsonb(distribution_block),true),
    revision=revision+1 WHERE id=dist_system;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'Distribution system move failed'; END IF;
  UPDATE public.base_org_state SET config=private.org_config(),
    revision=rev+1,updated_at=clock_timestamp() WHERE id=true AND revision=rev;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'Canonical config update failed'; END IF;
  UPDATE private.org_control SET revision=rev+1 WHERE id=true AND revision=rev;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'Canonical revision update failed'; END IF;
  ALTER TABLE public.base_org_state ENABLE TRIGGER org_canonical_fence;
  ALTER TABLE public.org_units ENABLE TRIGGER org_canonical_fence;

  -- The 3K policy is append-only, effective today: preserve all older policy versions.
  INSERT INTO public.k3hub_policy_versions(
    effective_from,applied_block_ids,include_unassigned,actor_id,reason)
  VALUES(current_date_vn,array_append(old_blocks,distribution_block),
    false,NULL,'Phân Phối tách thành Khối riêng, tiếp tục 3K hiện có và giữ lịch sử');

  after_snapshot := jsonb_build_object(
    'org_revision',(SELECT revision FROM public.base_org_state WHERE id=true),
    'system_parent',(SELECT parent_id FROM public.org_units WHERE id=dist_system),
    'distribution_block',(SELECT to_jsonb(u) FROM public.org_units u WHERE id=distribution_block),
    'org_assignments',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb)
       FROM public.org_assignments a WHERE a.unit_id IN (dist_system,dept_id)),
    'biz_members',(SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]'::jsonb)
       FROM public.biz_department_members m WHERE m.department_id=dept_id::uuid),
    'biz_appointments',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb)
       FROM public.biz_appointments a WHERE a.system_id=dist_system::uuid OR a.department_id=dept_id::uuid),
    'kr_goals',(SELECT count(*) FROM public.biz_annual_goals WHERE department_id=dept_id::uuid),
    'biz_documents',(SELECT count(*) FROM public.biz_documents WHERE department_id=dept_id::uuid),
    'k3_goals',(SELECT count(*) FROM public.k3_goals WHERE org_unit_id=dept_id OR department_id=dept_id::uuid)
  );
  IF before_snapshot->'org_assignments' IS DISTINCT FROM after_snapshot->'org_assignments'
     OR before_snapshot->'biz_members' IS DISTINCT FROM after_snapshot->'biz_members'
     OR before_snapshot->'biz_appointments' IS DISTINCT FROM after_snapshot->'biz_appointments'
     OR before_snapshot->'kr_goals' IS DISTINCT FROM after_snapshot->'kr_goals'
     OR before_snapshot->'biz_documents' IS DISTINCT FROM after_snapshot->'biz_documents'
     OR before_snapshot->'k3_goals' IS DISTINCT FROM after_snapshot->'k3_goals'
     OR NOT distribution_block=ANY(private.k3hub_policy_at(current_date_vn))
  THEN RAISE EXCEPTION 'Distribution data/policy parity failed, entire cutover rolled back'; END IF;
  UPDATE private.distribution_cutover_audit SET after_data=after_snapshot WHERE id=cutoff_id;
END
$cutover$;

-- The legacy biz_* tables remain the unique business workflow source for BOTH
-- independent Sales and Distribution areas, so historical appointment, KR, and
-- report RPCs continue to work without reenrolling staff or moving records.
CREATE OR REPLACE FUNCTION private.biz_owned_system(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  SELECT EXISTS(SELECT 1 FROM public.org_units u WHERE u.id=_id::text AND
    u.kind='system' AND u.parent_id IN ('biz-block','distribution-block') AND u.active)
$fn$;
REVOKE ALL ON FUNCTION private.biz_owned_system(uuid) FROM PUBLIC,anon,authenticated;
COMMIT;
