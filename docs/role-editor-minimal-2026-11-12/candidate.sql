-- STAGED ONLY: no new grants, no resolver changes, no data writes. Separate owner approval required.
BEGIN;
DO $guard$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.role_editor_validate(text,text[],text[])'::regprocedure AND md5(pg_get_functiondef(oid))='9e5fa1a93890aaa486fe9d1674a4c1c2' AND pg_get_userbyid(proowner)='postgres' AND proacl::text='{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: role_editor_validate'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.permission_editor_read()'::regprocedure AND md5(pg_get_functiondef(oid))='4d070d87c9511db3f49e448b58dea40d' AND pg_get_userbyid(proowner)='postgres' AND proacl::text='{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: permission_editor_read'; END IF;
END $guard$;
CREATE OR REPLACE FUNCTION private.role_editor_validate(kind text, next_permissions text[], previous_permissions text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF kind='common' AND EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT private.common_permission_ready(p)) THEN RAISE EXCEPTION 'Quyền chung chỉ hỗ trợ quyền cá nhân cơ bản đã kiểm chứng.' USING ERRCODE='42501'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT p=ANY(coalesce(previous_permissions,'{}')) AND NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND ((s.personal AND s.scope='own' AND private.common_permission_ready(p) AND private.org_role_permission_ready(p) AND private.mkt_specialty_permission_ready(p)) OR (CASE WHEN kind='marketing_task' THEN private.mkt_specialty_permission_ready(p) AND s.scope<>'unit' ELSE private.org_role_permission_ready(p) END)))) THEN RAISE EXCEPTION 'Quyền mới chưa có phạm vi an toàn; giữ cấu hình hiện tại hoặc chọn quyền đã kiểm chứng.' USING ERRCODE='42501'; END IF; END $function$
;
CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('grantable',p.personal AND p.scope='own' AND private.common_permission_ready(p.key) AND private.org_role_permission_ready(p.key) AND private.mkt_specialty_permission_ready(p.key),'common_ready',private.common_permission_ready(p.key),'position_ready',private.org_role_permission_ready(p.key),'task_ready',private.mkt_specialty_permission_ready(p.key) AND p.scope<>'unit')),'[]') FROM private.permission_editor_policy() p); END $function$
;
COMMIT;
