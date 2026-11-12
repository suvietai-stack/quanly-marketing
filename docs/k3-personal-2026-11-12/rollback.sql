-- Restore gates atomically; leave additive columns/history in place, no data deletion.
BEGIN;
CREATE OR REPLACE FUNCTION public.k3_can(_actor uuid, _permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NOT private.legacy_business_allowed(_actor) THEN RETURN false; END IF;
  IF _actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false; END IF;
  IF public.is_super_admin(_actor) OR public.biz_admin(_actor) THEN RETURN true; END IF;
  IF _permission='k3.use' THEN RETURN public.biz_participant(_actor); END IF;
  IF _permission IN ('k3.view_scope','k3.comment') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor); END IF;
  RETURN false;
END $function$
;

CREATE OR REPLACE FUNCTION private.k3_day_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE s public.k3_settings; BEGIN
 IF TG_OP='INSERT' THEN SELECT * INTO s FROM public.k3_settings WHERE id; NEW.department_id:=public.biz_department_at(NEW.user_id,NEW.work_date); NEW.plan_deadline:=(NEW.work_date+coalesce(s.plan_by,'08:45'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh'; NEW.summary_deadline:=(NEW.work_date+coalesce(s.summary_by,'18:00'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh';
 ELSIF NEW.kg IS DISTINCT FROM OLD.kg THEN NEW.data_revision:=OLD.data_revision+1; END IF;
 RETURN NEW; END$function$
;

CREATE OR REPLACE FUNCTION private.k3_goal_manage_ok(_actor uuid, _goal uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT _actor IS NOT NULL AND (public.biz_admin(_actor) OR EXISTS(SELECT 1 FROM public.k3_goals g WHERE g.id=_goal AND g.user_id=_actor))
$function$
;

CREATE OR REPLACE FUNCTION public.k3_scope_ok(_actor uuid, _user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.legacy_business_allowed(_actor) AND (
  SELECT _actor IS NOT NULL AND _user IS NOT NULL AND (
    public.biz_all_scope(_actor)
    OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_user AND public.biz_scope_ok(_actor, _user, m.department_id))
  )); $function$
;

CREATE OR REPLACE FUNCTION public.k3_settings_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE s public.k3_settings;BEGIN
  IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản không còn hoạt động.' USING ERRCODE='42501'; END IF;
  SELECT * INTO s FROM public.k3_settings WHERE id=true;
  RETURN jsonb_build_object(
    'enabled', coalesce(s.enabled,false),
    'effective_from', s.effective_from,
    'plan_by', coalesce(s.plan_by,'08:45'::time),
    'summary_by', coalesce(s.summary_by,'18:00'::time),
    'max_focus', coalesce(s.max_focus,3),
    'allow_personal_goal', coalesce(s.allow_personal_goal,true),
    'allow_team_goal', coalesce(s.allow_team_goal,true),
    'allow_invite', coalesce(s.allow_invite,true),
    'allow_assign', coalesce(s.allow_assign,true),
    'updated_at', s.updated_at,
    'can_use', public.k3_can(auth.uid(),'k3.use'),
    'can_view_scope', public.k3_can(auth.uid(),'k3.view_scope'),
    'can_comment', public.k3_can(auth.uid(),'k3.comment'),
    'can_settings', public.k3_can(auth.uid(),'k3.settings'),
    'today', (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  );
END$function$
;
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
$function$
;
CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal FROM (VALUES ('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key) $function$
;
CREATE OR REPLACE FUNCTION public.k3_zalo_report_preview(_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE c k3_automation_config;data jsonb;
BEGIN
 IF NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Bạn không có quyền xem trước báo cáo.'; END IF;
 SELECT * INTO c FROM k3_automation_config WHERE id;
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'department_id',department_id,'data',snapshot) ORDER BY snapshot->>'name'),'[]') INTO data FROM k3_daily_closes WHERE work_date=_date AND (c.scope_kind='all' OR c.scope_kind='system' AND system_id=c.scope_id OR c.scope_kind='department' AND department_id=c.scope_id);
 RETURN data; END $function$
;
CREATE OR REPLACE FUNCTION public.k3_zalo_report_queue()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE c k3_automation_config; d date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date; n int;
BEGIN
 SELECT * INTO c FROM k3_automation_config WHERE id;
 IF NOT coalesce(c.zalo_enabled,false) OR c.group_id IS NULL OR (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::time<c.send_time OR d<c.enabled_from THEN RETURN 0; END IF;
 INSERT INTO k3_zalo_reports(work_date,group_id,scope_kind,scope_id,snapshot) SELECT d,c.group_id,c.scope_kind,c.scope_id,coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'department_id',department_id,'data',snapshot) ORDER BY snapshot->>'name'),'[]') FROM k3_daily_closes WHERE work_date=d AND (c.scope_kind='all' OR c.scope_kind='system' AND system_id=c.scope_id OR c.scope_kind='department' AND department_id=c.scope_id) HAVING count(*)>0 ON CONFLICT(work_date,group_id) DO NOTHING;
 GET DIAGNOSTICS n=ROW_COUNT; RETURN n;
END$function$
;
CREATE OR REPLACE FUNCTION public.k3_member_invite(_goal_id uuid, _user_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE g public.k3_goals; u uuid; invited int:=0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_goal_id FOR UPDATE;
  IF g.id IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền mời thành viên vào mục tiêu này.'; END IF;
  IF g.status IN ('done','ended_missed','cancelled') THEN RAISE EXCEPTION 'Mục tiêu đã kết thúc, không thể mời thành viên.'; END IF;
  IF NOT coalesce((SELECT (allow_invite AND allow_team_goal) FROM public.k3_settings WHERE id),true) AND NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Quyền mời thành viên đang tắt trong Cài đặt 3K.'; END IF;
  FOREACH u IN ARRAY coalesce(_user_ids,'{}'::uuid[]) LOOP
    IF u IS NULL OR u=g.user_id THEN CONTINUE; END IF;
    IF NOT public.k3_can(u,'k3.use') THEN RAISE EXCEPTION 'Nhân sự được mời phải đang hoạt động và thuộc Cơ cấu tổ chức Kinh doanh.'; END IF;
    INSERT INTO public.k3_goal_members(goal_id,user_id,status,invited_by,invited_at)
    VALUES(g.id,u,'invited',auth.uid(),now())
    ON CONFLICT (goal_id,user_id) DO UPDATE SET status='invited',invited_by=auth.uid(),invited_at=now(),responded_at=NULL,revoked_at=NULL,revoked_by=NULL
      WHERE public.k3_goal_members.status IN ('declined','revoked');
    invited:=invited+1;
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),'member_invite',jsonb_build_object('member',u));
  END LOOP;
  RETURN jsonb_build_object('invited',invited);
END$function$
;
CREATE OR REPLACE FUNCTION public.k3_member_search(_q text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('id',x.id,'full_name',x.full_name,'departments',x.departments) ORDER BY x.full_name) FROM (
    SELECT p.id, p.full_name, coalesce(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}'::text[]) departments
    FROM public.profiles p
    LEFT JOIN public.biz_department_members m ON m.user_id=p.id
    LEFT JOIN public.biz_departments d ON d.id=m.department_id
    WHERE p.status='Đang hoạt động' AND (coalesce(_q,'')='' OR p.full_name ILIKE '%'||_q||'%')
    GROUP BY p.id, p.full_name ORDER BY p.full_name LIMIT 20) x),'[]'::jsonb);
END$function$
;
ALTER TABLE public.k3_goals DISABLE TRIGGER k3_personal_goal_attribution;
ALTER TABLE public.k3_period_summaries DISABLE TRIGGER k3_personal_period_attribution;
ALTER TABLE public.k3_daily_closes DISABLE TRIGGER k3_personal_close_attribution;
COMMIT;
