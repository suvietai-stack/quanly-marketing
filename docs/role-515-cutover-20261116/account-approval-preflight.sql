-- READ ONLY snapshot check for proposed account approval migration.
SELECT
 (SELECT count(*) FROM public.base_permission_catalog) AS catalog,
 (SELECT count(*) FROM private.permission_editor_policy()) AS policy,
 (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2) AS v2_roles,
 (SELECT count(*) FROM public.user_roles) AS direct_roles,
 (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin') AS direct_super_admin,
 md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure)) AS account_approve_md5,
 to_regclass('private.role_515_approval_backup') IS NOT NULL AS installed;
