-- STAGED ONLY. Backend DELETE guard for 9 legacy JSONB tables, 515-key catalog.
-- Restrictive RLS is ANDed with existing permissive active-account policies.
-- No rows are modified; service_role table maintenance retains standard RLS bypass.
BEGIN;
DO $preflight$
DECLARE v record;
BEGIN
 IF (SELECT count(*) FROM public.base_permission_catalog)<>515
 OR to_regprocedure('private.has_permission(uuid,text)') IS NULL
 OR to_regprocedure('private.grant_source_ready(text,text)') IS NULL
 THEN RAISE EXCEPTION 'STOP: permission policy not at 515'; END IF;
 FOR v IN SELECT * FROM (VALUES
  ('brands','brand.delete'),
  ('map_posts','local.post_delete'),
  ('social_posts','social.post_delete'),
  ('socials','social.delete'),
  ('tasks','task.delete'),
  ('videos','video.delete'),
  ('web_contents','web.content_delete'),
  ('web_topics','web.keyword_topic_delete'),
  ('websites','web.delete')
 ) AS x(tbl,permission_key)
 LOOP
  IF NOT EXISTS (SELECT 1 FROM public.base_permission_catalog
      WHERE key=v.permission_key)
  OR NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace=n.oid
      WHERE n.nspname='public' AND c.relname=v.tbl AND c.relkind='r' AND c.relrowsecurity)
  THEN RAISE EXCEPTION 'STOP: catalog or RLS missing for %',v.tbl; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies
     WHERE schemaname='public' AND tablename=v.tbl
     AND policyname='role_515_delete_permission')
  THEN RAISE EXCEPTION 'STOP: policy already installed on %',v.tbl; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename=v.tbl
      AND cmd IN ('ALL','DELETE') AND 'authenticated'=ANY(roles))
  THEN RAISE EXCEPTION 'STOP: authenticated DELETE path differs for %',v.tbl; END IF;
 END LOOP;
END; $preflight$;

CREATE POLICY role_515_delete_permission ON public.brands
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'brand.delete'));

CREATE POLICY role_515_delete_permission ON public.map_posts
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'local.post_delete'));

CREATE POLICY role_515_delete_permission ON public.social_posts
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'social.post_delete'));

CREATE POLICY role_515_delete_permission ON public.socials
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'social.delete'));

CREATE POLICY role_515_delete_permission ON public.tasks
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'task.delete'));

CREATE POLICY role_515_delete_permission ON public.videos
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'video.delete'));

CREATE POLICY role_515_delete_permission ON public.web_contents
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'web.content_delete'));

CREATE POLICY role_515_delete_permission ON public.web_topics
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'web.keyword_topic_delete'));

CREATE POLICY role_515_delete_permission ON public.websites
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'web.delete'));

DO $post$
BEGIN
 IF (SELECT count(*) FROM pg_policies WHERE schemaname='public'
     AND policyname='role_515_delete_permission')<>9
 THEN RAISE EXCEPTION 'STOP: not all 9 DELETE policies installed'; END IF;
END; $post$;
COMMIT;
