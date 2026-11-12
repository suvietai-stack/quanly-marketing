-- READ ONLY; compare definitions, owner and ACL with backup before approval/application.
SELECT n.nspname,p.proname,md5(pg_get_functiondef(p.oid)) definition_md5,pg_get_userbyid(p.proowner) owner,p.proacl FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE p.proname IN ('permission_editor_read','org_workspace_read','org_commands','biz_appointment_guard','org_effect_signature');
SELECT tablename,policyname,roles,qual FROM pg_policies WHERE tablename='leave_requests';
SELECT (SELECT count(*) FROM app_roles) roles,(SELECT count(*) FROM org_assignments) assignments,(SELECT count(*) FROM org_position_slots) slots,(SELECT count(*) FROM user_permission_overrides) overrides;
