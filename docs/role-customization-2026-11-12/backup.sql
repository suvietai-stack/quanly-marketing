-- Read-only backup. Save output before approval/apply.
SELECT n.nspname,p.proname,pg_get_function_identity_arguments(p.oid),pg_get_functiondef(p.oid),md5(pg_get_functiondef(p.oid)),pg_get_userbyid(p.proowner),p.proacl::text FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='private' AND p.proname IN ('mkt_specialty_permission_ready','role_editor_validate');
SELECT id,permissions,role_kind,catalog_generation FROM app_roles ORDER BY id;
SELECT user_id,permissions,mode,source_kind FROM user_permission_overrides ORDER BY user_id;
