CREATE TABLE IF NOT EXISTS public.org_position_roles(
  unit_id text NOT NULL REFERENCES public.org_units(id),
  title_id text NOT NULL REFERENCES public.org_titles(id),
  role_id text NOT NULL REFERENCES public.app_roles(id),
  revision int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  PRIMARY KEY(unit_id,title_id)
);
GRANT SELECT ON public.org_position_roles TO authenticated;
GRANT ALL ON public.org_position_roles TO service_role;
ALTER TABLE public.org_position_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_position_roles_read ON public.org_position_roles FOR SELECT TO authenticated USING (private.is_active(auth.uid()));

CREATE OR REPLACE FUNCTION private.org_manager_capacity_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cap int;
BEGIN
  SELECT capacity INTO cap FROM org_titles WHERE id=NEW.title_id AND kind='manager';
  IF cap IS NULL OR NEW.status='cancelled' THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('org_manager_'||NEW.unit_id||'/'||NEW.title_id));
  IF (SELECT count(*) FROM org_assignments a WHERE a.id<>NEW.id AND a.unit_id=NEW.unit_id AND a.title_id=NEW.title_id AND a.status<>'cancelled'
      AND tstzrange(a.starts_at,a.ends_at,'[)') && tstzrange(NEW.starts_at,NEW.ends_at,'[)')) >= cap
  THEN RAISE EXCEPTION 'Chức vụ quản lý đã đủ người trong khoảng thời gian này.'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER org_manager_capacity_guard BEFORE INSERT OR UPDATE OF unit_id,title_id,starts_at,ends_at,status ON public.org_assignments
  FOR EACH ROW EXECUTE FUNCTION private.org_manager_capacity_guard();

CREATE OR REPLACE FUNCTION private.position_role_sources(_user uuid, _at timestamptz DEFAULT now())
RETURNS TABLE(assignment_id text, role_id text, unit_id text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT a.id, b.role_id, a.unit_id FROM org_assignments a JOIN org_position_roles b ON b.unit_id=a.unit_id AND b.title_id=a.title_id
  WHERE a.user_id=_user AND a.status='active' AND a.starts_at<=_at AND (a.ends_at IS NULL OR a.ends_at>_at)
$$;
CREATE OR REPLACE FUNCTION private.org_unit_subtree(_root text) RETURNS TABLE(id text) LANGUAGE sql STABLE SET search_path=public AS $$
  WITH RECURSIVE t(id) AS (SELECT _root UNION SELECT u.id FROM org_units u JOIN t ON u.parent_id=t.id WHERE u.active) SELECT id FROM t
$$;
CREATE OR REPLACE FUNCTION private.position_can(_user uuid, _perm text, _target_unit text DEFAULT NULL)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM private.position_role_sources(_user) s JOIN app_roles r ON r.id=s.role_id
    WHERE _perm=ANY(r.permissions) AND (_target_unit IS NULL OR _target_unit IN (SELECT id FROM private.org_unit_subtree(s.unit_id))))
$$;
REVOKE ALL ON FUNCTION private.position_role_sources(uuid,timestamptz), private.position_can(uuid,text,text), private.org_unit_subtree(text) FROM PUBLIC, anon, authenticated;

INSERT INTO public.org_position_roles(unit_id,title_id,role_id)
SELECT unit_id,title_id,min(role_id) FROM public.org_position_slots WHERE active GROUP BY 1,2 HAVING count(DISTINCT role_id)=1
ON CONFLICT DO NOTHING;