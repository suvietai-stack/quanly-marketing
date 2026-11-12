-- SINGLE PENDING company scope extension after applied 0383/0384.
-- Do not apply until all writer/reminder/report call sites below are integrated and scoped E2E passes.
-- Existing company schema columns were added by 0383: do not resubmit that schema candidate.
ALTER TABLE public.k3_settings ADD COLUMN IF NOT EXISTS applies_all_blocks boolean NOT NULL DEFAULT true;
ALTER TABLE public.k3_settings ADD COLUMN IF NOT EXISTS applied_block_ids text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.k3_settings ADD COLUMN IF NOT EXISTS applies_unassigned boolean NOT NULL DEFAULT true;
ALTER TABLE public.k3_settings ADD COLUMN IF NOT EXISTS application_revision bigint NOT NULL DEFAULT 0;
CREATE TABLE public.k3_application_versions (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 revision bigint NOT NULL UNIQUE,
 effective_from date NOT NULL,
 applies_all_blocks boolean NOT NULL,
 applied_block_ids text[] NOT NULL DEFAULT '{}',
 applies_unassigned boolean NOT NULL,
 actor_id uuid NOT NULL,
 reason text NOT NULL,
 before_data jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.k3_application_versions TO authenticated;
GRANT ALL ON public.k3_application_versions TO service_role;
ALTER TABLE public.k3_application_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_application_config_read ON public.k3_application_versions FOR SELECT TO authenticated
 USING (private.is_active(auth.uid()) AND public.k3_can(auth.uid(),'k3.settings'));

-- Evaluate the same configuration for a supplied work date, not today's assignments.
-- Recursive ancestor walk is cycle-bounded; IDs, not display names, decide membership.
CREATE OR REPLACE FUNCTION private.k3_application_matches(u uuid,d date,all_ boolean,ids_ text[],unassigned_ boolean)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 WITH RECURSIVE ancestors AS (
 SELECT ou.id,ou.parent_id,ou.kind,ARRAY[ou.id] path FROM org_assignments a JOIN org_units ou ON ou.id=a.unit_id AND ou.active
 WHERE a.user_id=u AND a.status IN ('active','ended')
 AND a.starts_at <= CASE WHEN d=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN now() ELSE ((d+1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')-interval '1 microsecond' END
 AND (a.ends_at IS NULL OR a.ends_at > CASE WHEN d=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN now() ELSE ((d+1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')-interval '1 microsecond' END)
 UNION ALL
 SELECT ou.id,ou.parent_id,ou.kind,a.path||ou.id FROM ancestors a JOIN org_units ou ON ou.id=a.parent_id AND ou.active
 WHERE NOT ou.id=ANY(a.path) AND cardinality(a.path)<64
 ), blocks AS (SELECT DISTINCT id FROM ancestors WHERE kind='block')
 SELECT private.is_active(u) AND (all_ OR EXISTS(SELECT 1 FROM blocks WHERE id=ANY(ids_)) OR (unassigned_ AND NOT EXISTS(SELECT 1 FROM blocks)))
$$;
CREATE OR REPLACE FUNCTION private.k3_application_in_scope(u uuid,d date) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.k3_application_matches(u,d,coalesce(v.applies_all_blocks,true),coalesce(v.applied_block_ids,'{}'),coalesce(v.applies_unassigned,true))
 FROM (SELECT 1) seed LEFT JOIN LATERAL (
 SELECT * FROM k3_application_versions WHERE effective_from<=d ORDER BY effective_from DESC,revision DESC LIMIT 1
 ) v ON true
$$;
-- Current official use AND requested work-date eligibility: cannot backdate to bypass a removal.
CREATE OR REPLACE FUNCTION private.k3_application_can_write(u uuid,d date) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.k3_can(u,'k3.use') AND private.k3_application_in_scope(u,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)
 AND private.k3_application_in_scope(u,d)
$$;
CREATE OR REPLACE FUNCTION public.k3_application_scope_read() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE s k3_settings; blocks_ jsonb; count_ int;
BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Không có quyền cài đặt 3K.' USING ERRCODE='42501'; END IF;
 SELECT * INTO s FROM k3_settings WHERE id;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name) ORDER BY name),'[]') INTO blocks_ FROM org_units WHERE kind='block' AND active;
 SELECT count(*) INTO count_ FROM profiles p WHERE private.k3_application_matches(p.id,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,s.applies_all_blocks,s.applied_block_ids,s.applies_unassigned);
 RETURN jsonb_build_object('revision',s.application_revision,'applies_all_blocks',s.applies_all_blocks,'applied_block_ids',s.applied_block_ids,'applies_unassigned',s.applies_unassigned,'blocks',blocks_,'employee_count',count_,
 'effective_from',(SELECT effective_from FROM k3_application_versions ORDER BY revision DESC LIMIT 1),'today',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date);
END $$;
CREATE OR REPLACE FUNCTION public.k3_application_scope_preview(_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE count_ int; ids_ text[]; all_ boolean:=coalesce((_payload->>'applies_all_blocks')::boolean,true); unassigned_ boolean:=coalesce((_payload->>'applies_unassigned')::boolean,false); d date:=(_payload->>'effective_from')::date;
BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Không có quyền cài đặt 3K.' USING ERRCODE='42501'; END IF;
 SELECT coalesce(array_agg(DISTINCT value ORDER BY value),'{}') INTO ids_ FROM jsonb_array_elements_text(coalesce(_payload->'applied_block_ids','[]'));
 IF d IS NULL OR d<(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN RAISE EXCEPTION 'Ngày hiệu lực không được nằm trong quá khứ.'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(ids_) id_ WHERE NOT EXISTS(SELECT 1 FROM org_units WHERE id=id_ AND kind='block' AND active)) THEN RAISE EXCEPTION 'Khối đã ngừng hoạt động hoặc không hợp lệ.'; END IF;
 SELECT count(*) INTO count_ FROM profiles p WHERE private.k3_application_matches(p.id,d,all_,ids_,all_ OR unassigned_);
 RETURN jsonb_build_object('employee_count',count_,'effective_from',d,'revision',(SELECT application_revision FROM k3_settings WHERE id));
END $$;
CREATE OR REPLACE FUNCTION public.k3_application_scope_save(_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s k3_settings; ids_ text[]; preview_ jsonb; d date:=(_payload->>'effective_from')::date; all_ boolean:=coalesce((_payload->>'applies_all_blocks')::boolean,true); unassigned_ boolean:=coalesce((_payload->>'applies_unassigned')::boolean,false);
BEGIN
 preview_:=public.k3_application_scope_preview(_payload);
 SELECT * INTO s FROM k3_settings WHERE id FOR UPDATE;
 IF s.application_revision IS DISTINCT FROM (_payload->>'revision')::bigint THEN RAISE EXCEPTION 'Cấu hình đã thay đổi; tải lại trước khi lưu.' USING ERRCODE='40001'; END IF;
 IF length(btrim(coalesce(_payload->>'reason','')))=0 THEN RAISE EXCEPTION 'Cần lý do thay đổi phạm vi.'; END IF;
 IF EXISTS(SELECT 1 FROM k3_application_versions WHERE effective_from>d) THEN RAISE EXCEPTION 'Đã có lịch áp dụng sau ngày này; cần rà soát trước khi thay thế.'; END IF;
 SELECT coalesce(array_agg(DISTINCT value ORDER BY value),'{}') INTO ids_ FROM jsonb_array_elements_text(coalesce(_payload->'applied_block_ids','[]'));
 INSERT INTO k3_application_versions(revision,effective_from,applies_all_blocks,applied_block_ids,applies_unassigned,actor_id,reason,before_data)
 VALUES(s.application_revision+1,d,all_,ids_,all_ OR unassigned_,auth.uid(),btrim(_payload->>'reason'),to_jsonb(s));
 UPDATE k3_settings SET applies_all_blocks=all_,applied_block_ids=ids_,applies_unassigned=all_ OR unassigned_,application_revision=application_revision+1,updated_at=now(),updated_by=auth.uid() WHERE id;
 RETURN public.k3_application_scope_read();
END $$;
REVOKE ALL ON FUNCTION private.k3_application_matches(uuid,date,boolean,text[],boolean),private.k3_application_in_scope(uuid,date),private.k3_application_can_write(uuid,date) FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.k3_application_scope_read(),public.k3_application_scope_preview(jsonb),public.k3_application_scope_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_application_scope_read(),public.k3_application_scope_preview(jsonb),public.k3_application_scope_save(jsonb) TO authenticated;
-- CUTOVER BLOCKER: use can_write in ALL owner writer/trigger paths; retain k3_can for historical reads.
-- Combine in_scope + contiguous eligibility start + existing leave/schedule logic for obligations,
-- reminders/close/report/Zalo; never grant view_scope or mutate Role rows from these settings.
-- Do not enable company obligations by setting company_effective_from during this migration.