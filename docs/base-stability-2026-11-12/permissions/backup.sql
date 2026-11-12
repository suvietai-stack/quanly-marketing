CREATE OR REPLACE FUNCTION private.common_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 -- k3.use stays unavailable from Common until the single block-application gate is activated and verified.
 SELECT p<>'k3.use' AND EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND s.scope='own' AND s.personal AND private.org_role_permission_ready(p));
$function$;
CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal FROM (VALUES ('k3.use','own',true),('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key) $function$;
CREATE OR REPLACE FUNCTION private.staff_permission_validate(u uuid, permissions_ text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN PERFORM private.supplement_permission_guard(u); IF EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=u AND use_custom AND (mode='replace' OR source_kind='legacy')) THEN RAISE EXCEPTION 'Quyền riêng cũ đang bật; cần đối chiếu và xác nhận chuyển đổi trước, không ghi đè.'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(permissions_,'{}')) p WHERE NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND s.personal) AND NOT EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=u AND o.source_kind='supplemental' AND o.mode='additive' AND p=ANY(o.permissions))) THEN RAISE EXCEPTION 'Không cấp quyền quản trị hoặc quyền chưa có phạm vi cá nhân an toàn.' USING ERRCODE='42501'; END IF; END $function$;
CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('common_ready',private.common_permission_ready(p.key),'position_ready',private.org_role_permission_ready(p.key),'task_ready',private.mkt_specialty_permission_ready(p.key) AND p.scope<>'unit')),'[]') FROM private.permission_editor_policy() p); END $function$;
