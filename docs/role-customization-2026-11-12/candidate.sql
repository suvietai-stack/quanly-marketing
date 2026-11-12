-- STAGED ONLY. Requires separate owner exact-SHA approval. NO role/data/grant changes.
BEGIN;
DO $preflight$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.role_editor_validate(text, text[], text[])'::regprocedure AND md5(pg_get_functiondef(oid))='9e5fa1a93890aaa486fe9d1674a4c1c2' AND pg_get_userbyid(proowner)='postgres' AND proacl::text='{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: role_editor_validate'; END IF;
END $preflight$;
CREATE OR REPLACE FUNCTION private.role_editor_validate(kind text, next_permissions text[], previous_permissions text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF kind='common' AND EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT private.common_permission_ready(p)) THEN RAISE EXCEPTION 'Quyền chung chỉ hỗ trợ quyền cá nhân cơ bản đã kiểm chứng.' USING ERRCODE='42501'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT p=ANY(coalesce(previous_permissions,'{}')) AND NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND ((p=ANY(ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','order.view','order.view_mine','order.take','order.update_draft','order.submit','order.history']) AND s.personal AND s.scope='own' AND private.org_role_permission_ready(p) AND private.mkt_specialty_permission_ready(p)) OR (CASE WHEN kind='marketing_task' THEN private.mkt_specialty_permission_ready(p) AND s.scope<>'unit' ELSE private.org_role_permission_ready(p) END)))) THEN RAISE EXCEPTION 'Quyền mới chưa có phạm vi an toàn; giữ cấu hình hiện tại hoặc chọn quyền đã kiểm chứng.' USING ERRCODE='42501'; END IF; END $function$
;
COMMIT;
