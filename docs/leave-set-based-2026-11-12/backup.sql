-- READ ONLY: capture these rows before separately approved application.
SELECT * FROM pg_policies WHERE schemaname='public' AND tablename='leave_requests';
SELECT p.oid::regprocedure::text signature,pg_get_functiondef(p.oid) definition,
 md5(pg_get_functiondef(p.oid)) md5,pg_get_userbyid(p.proowner) owner,p.proacl::text acl
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='private'
AND p.proname IN ('leave_unit_visible','org_permission_unit_member','base_role_unit_contains','base_config','org_role_rules','org_slot_rules','has_permission','sig_can');
SELECT count(*) leave_requests FROM public.leave_requests;
