CREATE OR REPLACE FUNCTION private.staff_permission_validate(u uuid, permissions_ text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN PERFORM private.supplement_permission_guard(u); IF EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=u AND use_custom AND (mode='replace' OR source_kind='legacy')) THEN RAISE EXCEPTION 'Quyền riêng cũ đang bật; cần đối chiếu và xác nhận chuyển đổi trước, không ghi đè.'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(permissions_,'{}')) p WHERE NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND s.personal) AND NOT EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=u AND o.source_kind='supplemental' AND o.mode='additive' AND p=ANY(o.permissions))) THEN RAISE EXCEPTION 'Không cấp quyền quản trị hoặc quyền chưa có phạm vi cá nhân an toàn.' USING ERRCODE='42501'; END IF; END $function$;
