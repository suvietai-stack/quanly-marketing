-- Read-only pre-apply metadata snapshot; save output privately before approved apply. No business rows exported.
SELECT jsonb_build_object(
'policies',(SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE schemaname='public' AND tablename IN ('tasks','socials','social_posts','websites')),
'triggers',(SELECT jsonb_agg(pg_get_triggerdef(oid)) FROM pg_trigger WHERE tgrelid IN ('public.tasks'::regclass,'public.socials'::regclass,'public.social_posts'::regclass,'public.websites'::regclass) AND NOT tgisinternal),
'role_fingerprint',md5(coalesce((SELECT string_agg(id||':'||coalesce(permissions::text,''),'|' ORDER BY id) FROM app_roles),'')));
