DO $guard$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.role_editor_validate(text,text[],text[])'::regprocedure AND md5(pg_get_functiondef(oid))='9e5fa1a93890aaa486fe9d1674a4c1c2' AND pg_get_userbyid(proowner)='postgres' AND proacl::text='{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: role_editor_validate'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.permission_editor_read()'::regprocedure AND md5(pg_get_functiondef(oid))='4d070d87c9511db3f49e448b58dea40d' AND pg_get_userbyid(proowner)='postgres' AND proacl::text='{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: permission_editor_read'; END IF;
END $guard$;
