-- 2026-11-17: canonical names + archive only provably unused confusing legacy labels.
-- Never change permissions, app role IDs, assignments, position links or source units.
-- Exact-ID, exact-prior-name, reference-fenced, idempotent and transactional.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
LOCK TABLE public.app_roles IN SHARE ROW EXCLUSIVE MODE;
DO $cleanup$
DECLARE r record; existing public.app_roles%ROWTYPE;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('role-v2-distribution-director','Giám đốc Kinh doanh Phân Phối','Giám đốc Trung tâm Kinh doanh Phân Phối'),
    ('role-v2-distribution-head','Trưởng phòng Phân phối','Trưởng phòng Kinh doanh Phân Phối'),
    ('role-v2-distribution-team','Trưởng nhóm Phân phối','Trưởng nhóm Kinh doanh Phân Phối'),
    ('role-v2-distribution-staff','Nhân viên phân phối','Nhân viên Kinh doanh Phân Phối')
  ) AS v(id,old_name,new_name) LOOP
    SELECT * INTO existing FROM public.app_roles WHERE id=r.id FOR UPDATE;
    IF NOT FOUND OR existing.catalog_state<>'standard' OR existing.role_kind<>'position' OR existing.is_system
      OR existing.name NOT IN (r.old_name,r.new_name) THEN
      RAISE EXCEPTION 'Distribution Role identity changed: %',r.id;
    END IF;
    IF existing.name=r.new_name THEN CONTINUE; END IF;
    IF EXISTS(SELECT 1 FROM public.org_position_roles WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.org_position_slots WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.base_title_role_links WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.user_roles WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.mkt_specialties WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.biz_access_exceptions WHERE role_id=r.id) THEN
      RAISE EXCEPTION 'Distribution Role is already attached; use audited catalog edit: %',r.id;
    END IF;
    IF EXISTS (SELECT 1 FROM public.app_roles a WHERE a.id<>r.id AND lower(btrim(a.name))=lower(btrim(r.new_name))) THEN
      RAISE EXCEPTION 'Duplicate proposed Role name: %',r.new_name;
    END IF;
    UPDATE public.app_roles SET name=r.new_name,updated_at=now() WHERE id=r.id;
  END LOOP;
  FOR r IN SELECT * FROM (VALUES
    ('role-9h328b84','Kinh Doanh Phân Phối'),
    ('role-g8qc3q2s','Showroom'),
    ('role-kinh-doanh','Kinh doanh Đơn Hàng'),
    ('role-u0fzsvsp','Lead Kinh Doanh ĐH'),
    ('role-xwbmhg3b','Giám Đốc Kinh Doanh')
  ) AS v(id,expected_name) LOOP
    SELECT * INTO existing FROM public.app_roles WHERE id=r.id FOR UPDATE;
    IF NOT FOUND THEN CONTINUE; END IF;
    IF existing.name<>r.expected_name OR existing.is_system OR existing.role_kind<>'position'
      OR existing.catalog_state NOT IN ('standard','archived') THEN
      RAISE EXCEPTION 'Unrecognized legacy Role: %',r.id;
    END IF;
    IF EXISTS(SELECT 1 FROM public.org_position_roles WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.org_position_slots WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.base_title_role_links WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.user_roles WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.mkt_specialties WHERE role_id=r.id)
      OR EXISTS(SELECT 1 FROM public.biz_access_exceptions WHERE role_id=r.id) THEN
      RAISE EXCEPTION 'Cannot archive referenced legacy Role %',r.id;
    END IF;
    IF existing.catalog_state='standard' THEN
      UPDATE public.app_roles SET catalog_state='archived',updated_at=now() WHERE id=r.id;
    END IF;
  END LOOP;
END $cleanup$;
COMMIT;