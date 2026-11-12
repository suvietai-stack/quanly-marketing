-- STAGED ONLY. Full catalog metadata; no expansion of grant eligibility.
CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('common_ready',private.common_permission_ready(p.key),'position_ready',EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p.key) AND private.org_role_permission_ready(p.key),'task_ready',EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p.key) AND private.mkt_specialty_permission_ready(p.key) AND p.scope<>'unit','reason',CASE WHEN EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p.key) THEN NULL ELSE 'Chưa có hợp đồng nguồn cấp/phạm vi đã kiểm chứng; không cho phép cấp.' END)),'[]') FROM (SELECT b.key,coalesce(s.scope,'own') scope,coalesce(s.personal,false) personal FROM base_permission_catalog b LEFT JOIN private.permission_editor_policy() s ON s.key=b.key) p); END $function$;
