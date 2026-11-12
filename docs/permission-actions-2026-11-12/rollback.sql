-- STAGED rollback. Removes only this package; never drops business data.
BEGIN;
LOCK TABLE public.tasks,public.socials,public.social_posts,public.websites IN SHARE ROW EXCLUSIVE MODE;
DO $rb$ BEGIN
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.content_action_can(uuid,text)') AND md5(prosrc)='7de0bdfc0886a277c3a28f5e012792b6' AND pg_get_userbyid(proowner)='postgres') THEN RAISE EXCEPTION 'Rollback helper drift: content_action_can'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.content_actor(uuid,jsonb,text)') AND md5(prosrc)='20ad87a5450320a5d56ffe3548f1f060' AND pg_get_userbyid(proowner)='postgres') THEN RAISE EXCEPTION 'Rollback helper drift: content_actor'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.content_related(uuid,text,uuid,jsonb)') AND md5(prosrc)='d22b68ea2e835e72592a8622a436c1f7' AND pg_get_userbyid(proowner)='postgres') THEN RAISE EXCEPTION 'Rollback helper drift: content_related'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.content_read(uuid,text,uuid,jsonb)') AND md5(prosrc)='a148be281793df7eb554b29a1571500b' AND pg_get_userbyid(proowner)='postgres') THEN RAISE EXCEPTION 'Rollback helper drift: content_read'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.content_require(uuid,text)') AND md5(prosrc)='c17a98b50351c36e6a0da5017695b4b1' AND pg_get_userbyid(proowner)='postgres') THEN RAISE EXCEPTION 'Rollback helper drift: content_require'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.content_write_guard()') AND md5(prosrc)='a48ef27c829bb7eaa6194335ebe543d7' AND pg_get_userbyid(proowner)='postgres') THEN RAISE EXCEPTION 'Rollback helper drift: content_write_guard'; END IF;
END $rb$;
DROP TRIGGER content_action_write ON public.tasks;
DROP POLICY content_action_read ON public.tasks;
DROP TRIGGER content_action_write ON public.socials;
DROP POLICY content_action_read ON public.socials;
DROP TRIGGER content_action_write ON public.social_posts;
DROP POLICY content_action_read ON public.social_posts;
DROP TRIGGER content_action_write ON public.websites;
DROP POLICY content_action_read ON public.websites;
DROP FUNCTION private.content_write_guard();
DROP FUNCTION private.content_read(uuid,text,uuid,jsonb);
DROP FUNCTION private.content_related(uuid,text,uuid,jsonb);
DROP FUNCTION private.content_actor(uuid,jsonb,text);
DROP FUNCTION private.content_require(uuid,text);
DROP FUNCTION private.content_action_can(uuid,text);
COMMIT;
