-- STAGED ONLY. This migration does not run automatically.
-- Must be independently reviewed and approved after the 510-permission resolver is applied.
BEGIN;
DO $preflight$
DECLARE missing_table text;
BEGIN
 IF to_regprocedure('private.universal_permission_ready(text)') IS NULL
    OR to_regprocedure('private.has_permission(uuid,text)') IS NULL
 THEN RAISE EXCEPTION 'STOP: 510-permission effective resolver is not available'; END IF;
 IF (SELECT count(*) FROM public.base_permission_catalog WHERE key IN ('brand.delete','local.post_delete','social.post_delete','social.delete','task.delete','video.delete','web.content_delete','web.keyword_topic_delete','web.delete')) <> 9
 THEN RAISE EXCEPTION 'STOP: one or more delete permissions are absent from the catalog'; END IF;
 SELECT t.tbl INTO missing_table FROM (VALUES ('brands'),('map_posts'),('social_posts'),('socials'),('tasks'),('videos'),('web_contents'),('web_topics'),('websites')) t(tbl)
 WHERE NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relname=t.tbl AND c.relkind='r' AND c.relrowsecurity) LIMIT 1;
 IF missing_table IS NOT NULL THEN RAISE EXCEPTION 'STOP: table % missing or RLS disabled',missing_table; END IF;
 IF to_regprocedure('private.legacy_delete_permission_guard()') IS NOT NULL
 THEN RAISE EXCEPTION 'STOP: legacy DELETE guard already installed'; END IF;
 IF EXISTS(SELECT 1 FROM pg_trigger t WHERE t.tgname='role_510_delete_guard' AND NOT t.tgisinternal)
 THEN RAISE EXCEPTION 'STOP: role_510_delete_guard trigger name already in use'; END IF;
END;
$preflight$;

-- ===== STAGED DELETE ENFORCEMENT (these are additive triggers) =====
CREATE OR REPLACE FUNCTION private.legacy_delete_permission_guard()
 RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'public','private'
AS $function$
DECLARE permission_key text;
BEGIN
 permission_key := CASE TG_TABLE_NAME
   WHEN 'brands' THEN 'brand.delete'
   WHEN 'map_posts' THEN 'local.post_delete'
   WHEN 'social_posts' THEN 'social.post_delete'
   WHEN 'socials' THEN 'social.delete'
   WHEN 'tasks' THEN 'task.delete'
   WHEN 'videos' THEN 'video.delete'
   WHEN 'web_contents' THEN 'web.content_delete'
   WHEN 'web_topics' THEN 'web.keyword_topic_delete'
   WHEN 'websites' THEN 'web.delete'
   ELSE NULL END;
 IF permission_key IS NULL THEN
   RAISE EXCEPTION 'Unsupported table for Role 510 delete guard' USING ERRCODE='42501';
 END IF;
 -- Authenticated users must pass the effective resolver; personal DENY wins over all Roles.
 -- Only the signed service_role token may perform maintenance without a user identity.
 IF current_setting('request.jwt.claim.role',true)='service_role' THEN RETURN OLD; END IF;
 IF auth.uid() IS NULL OR NOT private.is_active(auth.uid())
    OR NOT private.has_permission(auth.uid(),permission_key) THEN
   RAISE EXCEPTION 'Không có quyền xóa dữ liệu (%).',permission_key USING ERRCODE='42501';
 END IF;
 RETURN OLD;
END;
$function$;
REVOKE ALL ON FUNCTION private.legacy_delete_permission_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.brands
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.map_posts
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.social_posts
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.socials
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.tasks
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.videos
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.web_contents
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.web_topics
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
CREATE TRIGGER role_510_delete_guard BEFORE DELETE ON public.websites
 FOR EACH ROW EXECUTE FUNCTION private.legacy_delete_permission_guard();
DO $post$
BEGIN
 IF (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
     JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE NOT t.tgisinternal AND t.tgname='role_510_delete_guard' AND n.nspname='public')<>9
 THEN RAISE EXCEPTION 'STOP: expected 9 DELETE guard triggers'; END IF;
END;
$post$;
COMMIT;
