CREATE TABLE public.mkt_specialties (
  id text PRIMARY KEY,
  name text NOT NULL,
  role_id text REFERENCES public.app_roles(id),
  active boolean NOT NULL DEFAULT true,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mkt_specialties TO authenticated;
GRANT ALL ON public.mkt_specialties TO service_role;
ALTER TABLE public.mkt_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY mkt_spec_read ON public.mkt_specialties FOR SELECT TO authenticated USING (true);

CREATE TABLE public.mkt_staff_specialties (
  user_id uuid NOT NULL,
  specialty_id text NOT NULL REFERENCES public.mkt_specialties(id),
  state text NOT NULL CHECK (state IN ('active','needs_review','removed')),
  origin text NOT NULL CHECK (origin IN ('auto','manual')),
  is_primary boolean NOT NULL DEFAULT false,
  source jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, specialty_id)
);
GRANT SELECT ON public.mkt_staff_specialties TO authenticated;
GRANT ALL ON public.mkt_staff_specialties TO service_role;
ALTER TABLE public.mkt_staff_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY mkt_staff_spec_read ON public.mkt_staff_specialties FOR SELECT TO authenticated USING (true);

CREATE TABLE public.mkt_specialty_events (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  specialty_id text NOT NULL,
  action text NOT NULL,
  before_state text,
  after_state text,
  actor uuid,
  note text,
  at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mkt_specialty_events TO authenticated;
GRANT ALL ON public.mkt_specialty_events TO service_role;
ALTER TABLE public.mkt_specialty_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY mkt_spec_events_read ON public.mkt_specialty_events FOR SELECT TO authenticated USING (private.is_super_admin(auth.uid()) OR user_id = auth.uid());

INSERT INTO public.mkt_specialties(id,name,role_id,sort) VALUES
 ('content_web','Content Web','role-content-web',1),
 ('seo','SEO','role-seo',2),
 ('local_seo','Local SEO','role-local-seo',3),
 ('social','Social','role-social',4),
 ('video','Video','role-video',5),
 ('design','Thiết kế','role-designer',6),
 ('photography','Chụp ảnh','role-designer',7)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.mkt_specialty_sync() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE added_ int := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được đồng bộ chuyên môn.'; END IF;
  WITH cand AS (
    SELECT DISTINCT ON (ur.user_id, s.id) ur.user_id, s.id specialty_id, ur.role_id
    FROM user_roles ur JOIN mkt_specialties s ON s.role_id = ur.role_id AND s.active
    JOIN profiles p ON p.id = ur.user_id AND p.status = 'Đang hoạt động'
  ), ins AS (
    INSERT INTO mkt_staff_specialties(user_id,specialty_id,state,origin,source,synced_at)
    SELECT user_id, specialty_id, 'active','auto', jsonb_build_object('kind','role','role_id',role_id), now() FROM cand
    ON CONFLICT (user_id,specialty_id) DO NOTHING
    RETURNING user_id, specialty_id
  ), ev AS (
    INSERT INTO mkt_specialty_events(user_id,specialty_id,action,after_state,actor,note)
    SELECT user_id, specialty_id,'auto_add','active',auth.uid(),'Đồng bộ từ Role hiện có' FROM ins RETURNING 1
  ) SELECT count(*) INTO added_ FROM ev;
  RETURN jsonb_build_object('added', added_, 'at', now());
END $$;
REVOKE ALL ON FUNCTION public.mkt_specialty_sync() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mkt_specialty_sync() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.mkt_specialty_save(_users uuid[], _add text[], _remove text[], _primary text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid; sp text; prev text; n int := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được sửa chuyên môn.'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(coalesce(_add,'{}')||coalesce(_remove,'{}')) x WHERE x NOT IN (SELECT id FROM mkt_specialties)) THEN RAISE EXCEPTION 'Chuyên môn không hợp lệ.'; END IF;
  FOREACH u IN ARRAY _users LOOP
    PERFORM 1 FROM mkt_staff_specialties WHERE user_id=u FOR UPDATE;
    FOREACH sp IN ARRAY coalesce(_add,'{}') LOOP
      prev := NULL; SELECT state INTO prev FROM mkt_staff_specialties WHERE user_id=u AND specialty_id=sp;
      IF prev IS DISTINCT FROM 'active' THEN
        INSERT INTO mkt_staff_specialties(user_id,specialty_id,state,origin,updated_by,source) VALUES (u,sp,'active','manual',auth.uid(),'{"kind":"manual"}')
        ON CONFLICT (user_id,specialty_id) DO UPDATE SET state='active',origin='manual',updated_by=auth.uid(),updated_at=now();
        INSERT INTO mkt_specialty_events(user_id,specialty_id,action,before_state,after_state,actor) VALUES (u,sp,'add',prev,'active',auth.uid()); n:=n+1;
      END IF;
    END LOOP;
    FOREACH sp IN ARRAY coalesce(_remove,'{}') LOOP
      prev := NULL; SELECT state INTO prev FROM mkt_staff_specialties WHERE user_id=u AND specialty_id=sp;
      IF prev IS DISTINCT FROM 'removed' THEN
        INSERT INTO mkt_staff_specialties(user_id,specialty_id,state,origin,updated_by,source) VALUES (u,sp,'removed','manual',auth.uid(),'{"kind":"manual"}')
        ON CONFLICT (user_id,specialty_id) DO UPDATE SET state='removed',origin='manual',is_primary=false,updated_by=auth.uid(),updated_at=now();
        INSERT INTO mkt_specialty_events(user_id,specialty_id,action,before_state,after_state,actor) VALUES (u,sp,'remove',prev,'removed',auth.uid()); n:=n+1;
      END IF;
    END LOOP;
    IF _primary IS NOT NULL THEN
      UPDATE mkt_staff_specialties SET is_primary = (specialty_id=_primary AND state='active') WHERE user_id=u;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('changed', n);
END $$;
REVOKE ALL ON FUNCTION public.mkt_specialty_save(uuid[],text[],text[],text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mkt_specialty_save(uuid[],text[],text[],text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.mkt_specialty_candidates(_specialty text) RETURNS TABLE(user_id uuid, name text, is_primary boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT p.id, p.full_name, m.is_primary FROM mkt_staff_specialties m JOIN profiles p ON p.id=m.user_id
  WHERE auth.uid() IS NOT NULL AND m.specialty_id=_specialty AND m.state='active' AND p.status='Đang hoạt động' ORDER BY m.is_primary DESC, p.full_name
$$;
REVOKE ALL ON FUNCTION public.mkt_specialty_candidates(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mkt_specialty_candidates(text) TO authenticated, service_role;

SELECT public.mkt_specialty_sync();