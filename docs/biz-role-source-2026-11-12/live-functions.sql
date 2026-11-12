CREATE OR REPLACE FUNCTION public.biz_step_scope_ok(_steps jsonb, _index integer, _actor uuid, _owner uuid, _dept uuid, _at timestamp with time zone)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$SELECT public.is_super_admin(_actor) OR public.biz_scope_ok(_actor,_owner,_dept,_at) OR ((_steps->_index->>'type'='user' OR _steps->_index->>'substitute_id'=_actor::text) AND (_steps->_index->>'user_id'=_actor::text OR _steps->_index->>'substitute_id'=_actor::text) AND EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động'))$function$;

CREATE OR REPLACE FUNCTION public.biz_participant(_actor uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=_actor AND p.status='Đang hoạt động') AND (
  EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor AND m.started_at<=now() AND (m.ended_at IS NULL OR m.ended_at>now()) AND private.biz_source_ok(m.user_id, m.started_at))
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at))
  OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at))));
$function$;

CREATE OR REPLACE FUNCTION public.biz_can(_actor uuid, _permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
 IF NOT private.legacy_business_allowed(_actor) THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false;END IF;
 IF public.is_super_admin(_actor) THEN RETURN true;END IF;
 IF _permission NOT LIKE 'biz.%' THEN RETURN private.sig_can(_actor,_permission);END IF;
 IF public.biz_admin(_actor) THEN RETURN true;END IF;
 IF _permission='biz.access_manage' THEN RETURN false;END IF;
 IF _permission='biz.intervene' THEN RETURN EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'code' IN ('executive_director','deputy_executive_director') AND a.position_snapshot->>'business_policy'='executive' AND coalesce((a.position_snapshot->>'all_business')::boolean,false) AND private.biz_source_ok(a.user_id, a.started_at));END IF;
 IF public.biz_exception_ok(_actor,_permission) THEN RETURN true;END IF;
 IF _permission='biz.view_all' THEN RETURN public.biz_all_scope(_actor);END IF;
 IF _permission='biz.dashboard_public' THEN RETURN public.biz_participant(_actor) OR public.biz_all_scope(_actor);END IF;
 IF _permission IN ('biz.view_dept','biz.approval_view') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
 IF _permission IN ('biz.view_own','biz.plan_submit','biz.goal_submit','biz.report_submit') THEN RETURN public.biz_participant(_actor) AND (NOT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'business_policy'='executive' AND private.biz_source_ok(a.user_id, a.started_at)) OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy','personal')<>'executive' AND private.biz_source_ok(a.user_id, a.started_at)));END IF;
 IF _permission='biz.plan_request_revision' THEN RETURN public.biz_manager(_actor);END IF;
 IF _permission IN ('biz.goal_approve','biz.report_approve','biz.late_approve') THEN RETURN public.biz_manager(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
 IF _permission='biz.plan_approve' THEN RETURN false;END IF;
 RETURN false;
END $function$;

CREATE OR REPLACE FUNCTION public.biz_all_scope(_actor uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
  public.biz_admin(_actor)
  OR public.biz_exception_ok(_actor,'biz.view_all','all')
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce((a.position_snapshot->>'all_business')::boolean,false) AND a.position_snapshot->>'business_policy'='executive' AND private.biz_source_ok(a.user_id, a.started_at))));
$function$;

CREATE OR REPLACE FUNCTION private.legacy_business_allowed(u uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT NOT private.legacy_reset_applies(u)
     OR EXISTS(SELECT 1 FROM public.biz_appointments a
               WHERE a.user_id=u AND a.status<>'cancelled' AND a.started_at<=now()
                 AND (a.ended_at IS NULL OR a.ended_at>now())
                 AND a.started_at > (SELECT max(reset_at) FROM private.legacy_reset_accounts WHERE user_id=u AND active))
$function$;

CREATE OR REPLACE FUNCTION public.biz_goal_can_read(_goal_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.legacy_business_allowed(auth.uid()) AND (SELECT EXISTS(SELECT 1 FROM public.biz_annual_goals g WHERE g.id=_goal_id AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') AND (public.biz_all_scope(auth.uid()) OR (g.user_id=auth.uid() AND public.biz_participant(auth.uid())) OR public.biz_scope_ok(auth.uid(),g.user_id,g.department_id) OR EXISTS(SELECT 1 FROM public.biz_goal_versions v WHERE v.goal_id=g.id AND public.biz_run_assigned(v.id))))); $function$;

CREATE OR REPLACE FUNCTION public.biz_department_access(_department_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT private.legacy_business_allowed(auth.uid()) AND (
  SELECT public.is_super_admin(auth.uid()) OR public.biz_org_can_manage() OR public.biz_can(auth.uid(),'biz.workflow_manage') OR public.biz_all_scope(auth.uid()) OR public.biz_can(auth.uid(),'biz.dept_manage') OR public.biz_can(auth.uid(),'biz.kr_manage') OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND ((m.user_id=auth.uid() AND m.ended_at IS NULL AND private.biz_source_ok(m.user_id, m.started_at) AND (public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.goal_submit'))) OR ((public.biz_can(auth.uid(),'biz.view_dept') OR public.biz_can(auth.uid(),'biz.goal_approve')) AND public.biz_scope_ok(auth.uid(),m.user_id,_department_id)))));
$function$;

CREATE OR REPLACE FUNCTION public.biz_member_access(_user_id uuid, _department_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT public.biz_org_can_manage() OR public.biz_can(auth.uid(),'biz.dept_manage') OR public.biz_all_scope(auth.uid()) OR (_user_id=auth.uid() AND (public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.goal_submit'))) OR ((public.biz_can(auth.uid(),'biz.view_dept') OR public.biz_can(auth.uid(),'biz.goal_approve')) AND public.biz_scope_ok(auth.uid(),_user_id,_department_id)) $function$;

CREATE OR REPLACE FUNCTION public.biz_goal_can_review(_user_id uuid, _department_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.legacy_business_allowed(auth.uid()) AND (SELECT _user_id<>auth.uid() AND (public.is_super_admin(auth.uid()) OR EXISTS(SELECT 1 FROM public.biz_goal_versions v JOIN public.biz_annual_goals g ON g.id=v.goal_id JOIN public.biz_approval_runs r ON r.version_id=v.id WHERE g.user_id=_user_id AND g.department_id=_department_id AND r.status='pending' AND public.biz_run_assigned(v.id,true) AND public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at)))); $function$;

CREATE OR REPLACE FUNCTION public.biz_doc_access(_user uuid, _dept uuid, _kind text, _review boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.legacy_business_allowed(auth.uid()) AND (SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') AND CASE WHEN _kind NOT IN ('plan','report') THEN false WHEN _review THEN _user<>auth.uid() AND (public.is_super_admin(auth.uid()) OR (_kind='plan' AND public.biz_can(auth.uid(),'biz.plan_request_revision') AND public.biz_scope_ok(auth.uid(),_user,_dept)) OR (_kind='report' AND EXISTS(SELECT 1 FROM public.biz_document_versions v JOIN public.biz_documents d ON d.id=v.document_id JOIN public.biz_approval_runs r ON r.version_id=v.id WHERE d.user_id=_user AND d.department_id=_dept AND d.kind='report' AND r.status='pending' AND public.biz_run_assigned(v.id,true) AND public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at)))) ELSE public.biz_all_scope(auth.uid()) OR (_user=auth.uid() AND public.biz_participant(auth.uid())) OR public.biz_scope_ok(auth.uid(),_user,_dept) OR (_kind='report' AND EXISTS(SELECT 1 FROM public.biz_document_versions v JOIN public.biz_documents d ON d.id=v.document_id WHERE d.user_id=_user AND d.department_id=_dept AND d.kind='report' AND public.biz_run_assigned(v.id))) END); $function$;

CREATE OR REPLACE FUNCTION public.biz_scope_ok(_actor uuid, _user uuid, _dept uuid, _at timestamp with time zone DEFAULT now())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT private.legacy_business_allowed(_actor) AND (
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') AND (
  public.biz_all_scope(_actor)
  OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND coalesce(a.position_snapshot->>'business_policy',CASE WHEN a.scope_kind='individual' THEN 'personal' ELSE 'manager' END) IN ('manager','executive') AND private.biz_source_ok(a.user_id, a.started_at) AND public.biz_appointment_scope(a.id,_user,_dept,_at))
  OR EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND private.biz_source_ok(a.user_id, a.started_at) AND ((a.position='director' AND EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.system_id=a.system_id AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at))) OR (a.position='department_head' AND a.department_id=_dept) OR (a.position='team_lead' AND EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL) m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND m.team_id=a.team_id AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at)))))
  OR public.biz_exception_ok(_actor,'biz.view_dept','department',_dept)
  OR EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at) AND public.biz_exception_ok(_actor,'biz.view_dept','system',h.system_id))
  OR EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL) m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at) AND public.biz_exception_ok(_actor,'biz.view_dept','team',m.team_id))));
$function$;

CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal FROM (VALUES ('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key) $function$;

CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('position_ready',private.org_role_permission_ready(p.key),'task_ready',private.mkt_specialty_permission_ready(p.key) AND p.scope<>'unit')),'[]') FROM private.permission_editor_policy() p); END $function$;

CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$
SELECT p = ANY (ARRAY[
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
$function$;
