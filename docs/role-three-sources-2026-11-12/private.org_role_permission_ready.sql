CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$
SELECT p='k3.use' OR p = ANY (ARRAY[
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
