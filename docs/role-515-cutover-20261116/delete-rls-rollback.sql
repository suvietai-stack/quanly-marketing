-- STAGED rollback; reverts only the 9 restrictive DELETE policies.
BEGIN;
DO $guard$
BEGIN
 IF (SELECT count(*) FROM pg_policies WHERE schemaname='public'
   AND policyname='role_515_delete_permission')<>9
 THEN RAISE EXCEPTION 'STOP: expected nine policies; review drift'; END IF;
END; $guard$;
DROP POLICY role_515_delete_permission ON public.brands;
DROP POLICY role_515_delete_permission ON public.map_posts;
DROP POLICY role_515_delete_permission ON public.social_posts;
DROP POLICY role_515_delete_permission ON public.socials;
DROP POLICY role_515_delete_permission ON public.tasks;
DROP POLICY role_515_delete_permission ON public.videos;
DROP POLICY role_515_delete_permission ON public.web_contents;
DROP POLICY role_515_delete_permission ON public.web_topics;
DROP POLICY role_515_delete_permission ON public.websites;
COMMIT;
