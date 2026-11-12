-- PENDING stage 4: apply ONLY with the tested source/RPC stage, after scoped acceptance.
-- Nine keys; no Marketing task readiness, personal supplement, global admin or published-dashboard activation.
DO $$ BEGIN IF md5(pg_get_functiondef('private.org_role_permission_ready(text)'::regprocedure)) <> 'dc24adec9021ac7b73f987c8659c8b4b' THEN RAISE EXCEPTION 'Readiness changed: org_role_permission_ready'; END IF; END $$;
DO $$ BEGIN IF md5(pg_get_functiondef('private.permission_editor_policy()'::regprocedure)) <> 'c11f9a01d1b9b2a56b990e365d9fd7af' THEN RAISE EXCEPTION 'Readiness changed: permission_editor_policy'; END IF; END $$;
CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$
SELECT private.biz_v2_ready(p) OR p = ANY (ARRAY[
  'leave.create','leave.view_own','leave.edit_own','leave.recall',
  'leave.view_assigned','leave.view_all','leave.view_unit','leave.approve','leave.create_for','leave.edit_others','leave.cancel_handle','leave.exception','leave.reassign','leave.report','leave.export','leave.settings',
  'att.create','att.view_own','att.edit_own','att.witness',
  'att.manage','att.reconcile','att.report','att.view_all','att.settings',
  'order.view','order.view_mine','order.create','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery',
  'order.approve','order.assign','order.edit','order.complete','order.cancel','order.edit_reviewer','order.report_view','order.request_changes','order.send_request','order.view_all',
  'order.marketing_design.view','order.marketing_design.view_all','order.marketing_design.create','order.marketing_design.send_request','order.marketing_design.submit','order.marketing_design.take','order.marketing_design.update_draft','order.marketing_design.resubmit','order.marketing_design.deliver','order.marketing_design.approve','order.marketing_design.assign','order.marketing_design.edit','order.marketing_design.complete','order.marketing_design.cancel','order.marketing_design.edit_reviewer','order.marketing_design.report_view','order.marketing_design.request_changes',
  'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own',
  'oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export',
  'ot.view_own','ot.view_unit','ot.task_view','ot.task_update','ot.stage_update',
  'ot.accept','ot.assign','ot.create','ot.manage','ot.report','ot.report_export','ot.reschedule_propose','ot.reschedule_reply','ot.supplier','ot.view_all',
  'finance.incoming.view','finance.incoming.view_unit','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.reconcile','finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.manage','finance.incoming.remind',
  'signal.sale','signal.report','signal.reassign','signal.view_all','signal.assign',
  'signal.create','signal.edit','signal.manage','signal.delete','signal.catalog',
  'biz.crm_use','biz.crm_access','biz.crm_view_scope','biz.crm_edit_other',
  'biz.crm_transfer','biz.crm_archive','biz.crm_export','biz.crm_settings',
  'kpi.view_own','overview.view','overview.own_only','settings.view'
])
$function$
;
CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal FROM (VALUES ('biz.view_own','own',false),('biz.goal_submit','own',false),('biz.plan_submit','own',false),('biz.report_submit','own',false),('biz.view_dept','unit',false),('biz.goal_approve','unit',false),('biz.report_approve','unit',false),('biz.plan_request_revision','unit',false),('biz.approval_view','unit',false),('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key) $function$
;
