DO $preflight$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.mkt_specialty_permission_ready(text)'::regprocedure AND md5(pg_get_functiondef(oid))='318e90477714f4b34efaf9e7efd3aa6a' AND pg_get_userbyid(proowner)='postgres' AND proacl::text='{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: mkt_specialty_permission_ready'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.role_editor_validate(text, text[], text[])'::regprocedure AND md5(pg_get_functiondef(oid))='9e5fa1a93890aaa486fe9d1674a4c1c2' AND pg_get_userbyid(proowner)='postgres' AND proacl::text='{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: role_editor_validate'; END IF;
END $preflight$;
