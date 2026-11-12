-- STAGED ONLY. Rollback requires separate owner approval: it removes 9 DELETE guards.
BEGIN;
DO $guard$
BEGIN
 IF (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
     JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE NOT t.tgisinternal AND t.tgname='role_510_delete_guard' AND n.nspname='public')<>9
 THEN RAISE EXCEPTION 'STOP: expected 9 existing guards before rollback'; END IF;
END;
$guard$;
DROP TRIGGER role_510_delete_guard ON public.brands;
DROP TRIGGER role_510_delete_guard ON public.map_posts;
DROP TRIGGER role_510_delete_guard ON public.social_posts;
DROP TRIGGER role_510_delete_guard ON public.socials;
DROP TRIGGER role_510_delete_guard ON public.tasks;
DROP TRIGGER role_510_delete_guard ON public.videos;
DROP TRIGGER role_510_delete_guard ON public.web_contents;
DROP TRIGGER role_510_delete_guard ON public.web_topics;
DROP TRIGGER role_510_delete_guard ON public.websites;
DROP FUNCTION private.legacy_delete_permission_guard();
COMMIT;
