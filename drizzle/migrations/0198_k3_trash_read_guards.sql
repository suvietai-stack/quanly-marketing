-- 0198: Loại trừ bản ghi đã xóa mềm khỏi các RPC đọc 3K (danh sách KG, theo dõi nhân viên, ngày của tôi, chi tiết KG).

CREATE OR REPLACE FUNCTION public.k3_goal_list(_filter text DEFAULT 'all', _q text DEFAULT '') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF NOT public.k3_can(auth.uid(),'k3.use') AND NOT public.k3_can(auth.uid(),'k3.view_scope') THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K.'; END IF;
  RETURN coalesce((SELECT jsonb_agg(row) FROM (
    SELECT row FROM (
      SELECT jsonb_build_object(
        'id',g.id,'name',g.name,'status',g.status,'period_type',g.period_type,'period_start',g.period_start,'period_end',g.period_end,'due_date',g.due_date,'is_key',g.is_key,
        'owner_id',g.user_id,'owner_name',p.full_name,'revision',g.revision,
        'my_role',CASE WHEN g.user_id=auth.uid() THEN 'owner' ELSE m.status END,
        'member_count',(SELECT count(*) FROM public.k3_goal_members x WHERE x.goal_id=g.id AND x.status='accepted'),
        'kf_total',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled' AND a.deleted_at IS NULL),
        'kf_done',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status='done' AND a.deleted_at IS NULL),
        'overdue_days',CASE WHEN g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end)) ELSE 0 END
      ) row
      FROM public.k3_goals g
      JOIN public.profiles p ON p.id=g.user_id
      LEFT JOIN public.k3_goal_members m ON m.goal_id=g.id AND m.user_id=auth.uid()
      WHERE g.deleted_at IS NULL
        AND (coalesce(_q,'')='' OR g.name ILIKE '%'||_q||'%')
        AND (
          (_filter='mine' AND g.user_id=auth.uid())
          OR (_filter='joined' AND m.status='accepted' AND g.user_id<>auth.uid())
          OR (_filter='invited' AND m.status='invited')
          OR (_filter='assigned' AND g.user_id<>auth.uid() AND m.status='accepted' AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.goal_id=g.id AND a.assignee_id=auth.uid() AND a.status<>'cancelled' AND a.deleted_at IS NULL))
          OR (_filter='collab' AND public.k3_goal_visible(auth.uid(),g.id) AND EXISTS(SELECT 1 FROM public.k3_goal_members x WHERE x.goal_id=g.id AND x.status IN ('invited','accepted')))
          OR (_filter='scope' AND public.k3_can(auth.uid(),'k3.view_scope') AND g.user_id<>auth.uid() AND public.biz_scope_ok(auth.uid(),g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))
          OR (_filter IN ('all','active','overdue','done') AND public.k3_goal_visible(auth.uid(),g.id))
        )
        AND (_filter<>'active' OR g.status IN ('not_started','in_progress','paused'))
        AND (_filter<>'overdue' OR (g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today))
        AND (_filter<>'done' OR g.status IN ('done','ended_missed'))
    ) unsorted ORDER BY (row->>'is_key')::boolean DESC, row->>'period_end'
  ) sorted),'[]'::jsonb);
END$fn$;

CREATE OR REPLACE FUNCTION public.k3_team_read(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
 IF NOT public.k3_can(auth.uid(),'k3.view_scope') THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K trong phạm vi quản lý.'; END IF;
 RETURN coalesce((SELECT jsonb_agg(jsonb_build_object(
   'user_id',p.id,'full_name',p.full_name,'departments',jsonb_build_array(dep.name),'department_id',dep.id,
   'day',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
   'total',c.total,'done',c.done,'open',c.total-c.done,'issues',c.issues,'focus',c.focus,
   'status_key',CASE
     WHEN d.id IS NULL THEN 'none'
     WHEN d.summarized_at IS NOT NULL AND d.data_revision IS DISTINCT FROM d.confirmed_revision THEN 'reconfirm'
     WHEN d.summarized_at IS NOT NULL THEN 'summarized'
     WHEN upd.n>0 THEN 'updated'
     ELSE 'planned' END,
   'goals_active',coalesce(ga.n,0),'kf_active',coalesce(kf.n,0),'kf_overdue',coalesce(kf.od,0)
 ) ORDER BY p.full_name)
 FROM public.profiles p
 LEFT JOIN public.k3_days d ON d.user_id=p.id AND d.work_date=_date
 LEFT JOIN public.biz_departments dep ON dep.id=coalesce(d.department_id,public.biz_department_at(p.id,_date))
 LEFT JOIN LATERAL(SELECT count(*) total,count(*) FILTER(WHERE private.k3_task_complete(kpi_target,kpi_actual,progress,status)) done,count(*) FILTER(WHERE NOT private.k3_task_complete(kpi_target,kpi_actual,progress,status) AND (btrim(coalesce(problem,''))<>'' OR btrim(coalesce(solution,''))<>'')) issues,count(*) FILTER(WHERE is_focus) focus FROM public.k3_tasks WHERE day_id=d.id AND deleted_at IS NULL AND NOT is_unscheduled) c ON true
 LEFT JOIN LATERAL(SELECT count(*) n FROM public.k3_tasks t WHERE t.day_id=d.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND (t.status<>'todo' OR t.kpi_actual IS NOT NULL OR t.progress>0)) upd ON true
 LEFT JOIN LATERAL(SELECT count(*) n FROM public.k3_goals g WHERE g.deleted_at IS NULL AND g.status IN ('not_started','in_progress','paused') AND (g.user_id=p.id OR EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=p.id AND m.status='accepted'))) ga ON true
 LEFT JOIN LATERAL(SELECT count(*) n,count(*) FILTER(WHERE a.due_date IS NOT NULL AND a.due_date<today) od FROM public.k3_actions a JOIN public.k3_goals g2 ON g2.id=a.goal_id WHERE a.deleted_at IS NULL AND g2.deleted_at IS NULL AND a.status IN ('not_started','in_progress','paused') AND g2.status IN ('not_started','in_progress','paused') AND (a.assignee_id=p.id OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c2 WHERE c2.action_id=a.id AND c2.user_id=p.id))) kf ON true
 WHERE p.id<>auth.uid() AND CASE WHEN d.id IS NOT NULL THEN public.k3_day_scope_ok(auth.uid(),d.id) ELSE p.status='Đang hoạt động' AND dep.id IS NOT NULL AND public.biz_scope_ok(auth.uid(),p.id,dep.id,(_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) END),'[]'::jsonb); END$fn$;

CREATE OR REPLACE FUNCTION public.k3_user_day_read(_user uuid,_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$DECLARE d public.k3_days; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF; SELECT * INTO d FROM public.k3_days WHERE user_id=_user AND work_date=_date;
 IF (_user=auth.uid() AND NOT public.k3_can(auth.uid(),'k3.use')) OR (_user<>auth.uid() AND NOT (public.k3_can(auth.uid(),'k3.view_scope') AND CASE WHEN d.id IS NOT NULL THEN public.k3_day_scope_ok(auth.uid(),d.id) ELSE public.biz_scope_ok(auth.uid(),_user,public.biz_department_at(_user,_date),(_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) END)) THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K của nhân viên này.'; END IF;
 RETURN jsonb_build_object('settings',public.k3_settings_read(),'user',(SELECT jsonb_build_object('id',id,'full_name',full_name) FROM public.profiles WHERE id=_user),'day',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d) END,
 'tasks',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY is_focus DESC,sort_order,start_time NULLS LAST,created_at) FROM public.k3_tasks t WHERE day_id=d.id AND deleted_at IS NULL AND NOT is_unscheduled),'[]'::jsonb),
 'comments',coalesce((SELECT jsonb_agg(to_jsonb(c)||jsonb_build_object('author_name',p.full_name) ORDER BY c.created_at) FROM public.k3_comments c LEFT JOIN public.profiles p ON p.id=c.author_id WHERE c.day_id=d.id),'[]'::jsonb),
 'events',coalesce((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC) FROM (SELECT * FROM public.k3_task_events WHERE day_id=d.id ORDER BY created_at DESC LIMIT 100) e),'[]'::jsonb),
 'summaries',coalesce((SELECT jsonb_agg(to_jsonb(v) ORDER BY confirmed_at DESC) FROM public.k3_summary_versions v WHERE day_id=d.id),'[]'::jsonb),'can_comment',d.id IS NOT NULL AND public.k3_can(auth.uid(),'k3.comment') AND public.k3_day_scope_ok(auth.uid(),d.id),
 'active_goals',coalesce((SELECT jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'status',g.status,'period_start',g.period_start,'period_end',g.period_end,'due_date',g.due_date,'is_key',g.is_key,'owner_name',(SELECT full_name FROM public.profiles WHERE id=g.user_id),'my_role',CASE WHEN g.user_id=_user THEN 'owner' ELSE m.status END) ORDER BY g.is_key DESC, g.period_end)
   FROM public.k3_goals g LEFT JOIN public.k3_goal_members m ON m.goal_id=g.id AND m.user_id=_user
   WHERE g.deleted_at IS NULL AND g.status IN ('not_started','in_progress','paused') AND g.period_start<=_date AND g.period_end>=_date
     AND (g.user_id=_user OR m.status='accepted')),'[]'::jsonb),
 'assigned_actions',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'goal_id',a.goal_id,'goal_name',g.name,'name',a.name,'status',a.status,'due_date',a.due_date,'is_key',a.is_key,'my_part',CASE WHEN a.assignee_id=_user THEN 'assignee' ELSE 'collaborator' END,'already_today',EXISTS(SELECT 1 FROM public.k3_tasks t WHERE t.action_id=a.id AND t.user_id=_user AND t.work_date=_date AND t.deleted_at IS NULL)) ORDER BY a.is_key DESC, a.due_date NULLS LAST)
   FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id
   WHERE a.deleted_at IS NULL AND g.deleted_at IS NULL AND a.status IN ('not_started','in_progress','paused') AND g.status IN ('not_started','in_progress','paused')
     AND coalesce(a.start_date, g.period_start) <= _date
     AND (g.user_id=_user OR EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=_user AND m.status='accepted'))
     AND (a.assignee_id=_user OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id AND c.user_id=_user))),'[]'::jsonb)); END$fn$;

CREATE OR REPLACE FUNCTION public.k3_goal_detail(_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE g public.k3_goals; today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_id;
  IF g.id IS NULL OR NOT public.k3_goal_visible(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền xem mục tiêu này.'; END IF;
  IF g.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Mục tiêu đang nằm trong Thùng lưu trữ.'; END IF;
  RETURN jsonb_build_object(
    'goal', to_jsonb(g) || jsonb_build_object('owner_name',(SELECT full_name FROM public.profiles WHERE id=g.user_id),'overdue_days',CASE WHEN g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end)) ELSE 0 END),
    'kpis', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
        'actual',CASE WHEN k.kind='cumulative' THEN (SELECT coalesce(sum(t.kpi_actual),0) FROM public.k3_tasks t JOIN public.k3_actions a ON a.id=t.action_id WHERE a.goal_id=g.id AND a.deleted_at IS NULL AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL AND (t.kpi_id=k.id OR (t.kpi_id IS NULL AND nullif(btrim(coalesce(t.kpi_unit,'')),'') IS NOT DISTINCT FROM nullif(btrim(coalesce(k.unit,'')),'')))) ELSE k.manual_actual END) row
      FROM public.k3_kpis k WHERE k.goal_id=g.id ORDER BY k.sort_order,k.created_at) sorted),'[]'::jsonb),
    'actions', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('action',to_jsonb(a),'assignee_name',(SELECT full_name FROM public.profiles WHERE id=a.assignee_id),
        'collaborators',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',c.user_id,'full_name',pr.full_name)) FROM public.k3_action_collaborators c JOIN public.profiles pr ON pr.id=c.user_id WHERE c.action_id=a.id),'[]'::jsonb),
        'kpis',coalesce((SELECT jsonb_agg(krow) FROM (SELECT jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
            'actual',CASE WHEN k.kind='cumulative' THEN private.k3_action_kpi_actual(a.id,k.id,k.unit) ELSE k.manual_actual END) krow FROM public.k3_kpis k WHERE k.action_id=a.id ORDER BY k.sort_order,k.created_at) ksorted),'[]'::jsonb),
        'member_actuals',coalesce((SELECT jsonb_agg(mrow) FROM (SELECT jsonb_build_object('user_id',t.user_id,'full_name',pr.full_name,'actual',sum(t.kpi_actual),'days',count(DISTINCT t.work_date)) mrow FROM public.k3_tasks t JOIN public.profiles pr ON pr.id=t.user_id WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL GROUP BY t.user_id,pr.full_name) msorted),'[]'::jsonb),
        'task_total',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled),
        'task_done',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND private.k3_task_complete(t.kpi_target,t.kpi_actual,t.progress,t.status)),
        'overdue_days',CASE WHEN a.status IN ('not_started','in_progress','paused') AND a.due_date IS NOT NULL AND a.due_date < today THEN (today - a.due_date) ELSE 0 END) row
      FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled' AND a.deleted_at IS NULL ORDER BY a.is_key DESC, a.created_at) sorted),'[]'::jsonb),
    'members', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('user_id',m.user_id,'full_name',p.full_name,'status',m.status,'invited_at',m.invited_at,'responded_at',m.responded_at,
        'departments',coalesce((SELECT array_agg(DISTINCT d.name) FROM public.biz_department_members mm JOIN public.biz_departments d ON d.id=mm.department_id WHERE mm.user_id=m.user_id),'{}'::text[])) row
      FROM public.k3_goal_members m JOIN public.profiles p ON p.id=m.user_id WHERE m.goal_id=g.id ORDER BY m.invited_at) sorted),'[]'::jsonb),
    'executions', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',t.id,'work_date',t.work_date,'name',t.name,'status',t.status,'kpi_actual',t.kpi_actual,'kpi_unit',t.kpi_unit,'kpi_id',t.kpi_id,'progress',t.progress,'action_id',t.action_id,'user_id',t.user_id,'full_name',p.full_name,'problem',t.problem,'solution',t.solution) row
      FROM public.k3_tasks t JOIN public.profiles p ON p.id=t.user_id
      WHERE t.action_id IN (SELECT a.id FROM public.k3_actions a WHERE a.goal_id=g.id AND a.deleted_at IS NULL) AND t.deleted_at IS NULL AND NOT t.is_unscheduled
      ORDER BY t.work_date DESC, t.id LIMIT 200) sorted),'[]'::jsonb),
    'events', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',e.id,'action',e.action,'detail',e.detail,'created_at',e.created_at,'actor_name',(SELECT full_name FROM public.profiles WHERE id=e.actor_id)) row
      FROM public.k3_plan_events e WHERE e.goal_id=g.id ORDER BY e.created_at DESC LIMIT 100) sorted),'[]'::jsonb),
    'can_manage', private.k3_goal_manage_ok(auth.uid(), g.id),
    'my_member_status', (SELECT status FROM public.k3_goal_members WHERE goal_id=g.id AND user_id=auth.uid()),
    'today', today
  );
END$fn$;

REVOKE ALL ON FUNCTION public.k3_goal_list(text,text),public.k3_team_read(date),public.k3_user_day_read(uuid,date),public.k3_goal_detail(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.k3_goal_list(text,text),public.k3_team_read(date),public.k3_user_day_read(uuid,date),public.k3_goal_detail(uuid) TO authenticated;