-- Exact captured definitions; DDL only, does not undo later Role edits.
BEGIN;
CREATE OR REPLACE FUNCTION private.mkt_specialty_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT p = ANY (ARRAY[
    'overview.view','overview.alerts','overview.own_only',
    'task.view','task.view_mine','task.view_created_by_me','task.create','task.accept','task.start','task.update_result','task.update_status','task.submit_completion','task.resubmit_completion','task.view_history','task.add_note',
    'brand.view',
    'web.view','web.open_detail','web.keyword_view','web.keyword_open_sheet','web.content_view','web.content_view_mine','web.content_history','web.content_note','web.outline_start','web.outline_submit','web.outline_resubmit','web.post_write_start','web.post_submit','web.post_resubmit','web.view_web_draft_url','web.edit_web_draft_url','web.start_web_draft_layout','web.submit_web_draft_review','web.resubmit_web_draft_review','web.view_web_draft_revision_note','web.index_view','web.open_published_url',
    'social.view','social.view_mine','social.post_view','social.post_view_mine','social.post_create','social.post_edit','social.post_submit','social.post_start','social.post_resubmit','social.post_history','social.growth_view','social.growth_create','social.growth_edit','social.growth_open',
    'video.view','video.view_mine','video.create','video.script_start','video.script_submit','video.script_resubmit','video.submit','video.resubmit','video.deliver','video.history','video.edit_cut','video.move_editing','video.move_shooting','video.footage','video.create_design_order',
    'local.view','local.view_mine','local.create','local.edit','local.post_create','local.post_edit','local.photo','local.products','local.review','local.review_reply','local.review_status','local.growth_view','local.growth_create','local.growth_edit',
    'order.take','order.create','order.view','order.view_mine','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery',
    'leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','settings.view'
  ])
$function$
;
CREATE OR REPLACE FUNCTION private.role_editor_validate(kind text, next_permissions text[], previous_permissions text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF kind='common' AND EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT private.common_permission_ready(p)) THEN RAISE EXCEPTION 'Quyền chung chỉ hỗ trợ quyền cá nhân cơ bản đã kiểm chứng.' USING ERRCODE='42501'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT p=ANY(coalesce(previous_permissions,'{}')) AND NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND CASE WHEN kind='marketing_task' THEN private.mkt_specialty_permission_ready(p) AND s.scope<>'unit' ELSE private.org_role_permission_ready(p) END)) THEN RAISE EXCEPTION 'Quyền mới chưa có phạm vi an toàn; giữ cấu hình hiện tại hoặc chọn quyền đã kiểm chứng.' USING ERRCODE='42501'; END IF; END $function$
;
COMMIT;
