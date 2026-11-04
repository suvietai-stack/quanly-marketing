-- Sửa k3_kpi_save (KPI của KF không ghi goal_id) và tránh ORDER BY biểu thức trong jsonb_agg.
CREATE OR REPLACE FUNCTION public.k3_kpi_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k public.k3_kpis; old public.k3_kpis; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; _goal uuid:=nullif(p->>'goal_id','')::uuid; _action uuid:=nullif(p->>'action_id','')::uuid; _perm_goal uuid; key uuid:=nullif(p->>'request_key','')::uuid; _kind text:=coalesce(nullif(p->>'kind',''),'cumulative');
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF _id IS NOT NULL THEN
    SELECT * INTO old FROM public.k3_kpis WHERE id=_id FOR UPDATE;
    IF old.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy KPI.'; END IF;
    _goal:=old.goal_id; _action:=old.action_id;
  ELSE
    IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu lưu KPI.'; END IF;
    SELECT * INTO k FROM public.k3_kpis WHERE request_key=key;
    IF k.id IS NOT NULL THEN RETURN to_jsonb(k); END IF;
  END IF;
  IF _action IS NOT NULL THEN SELECT goal_id INTO _perm_goal FROM public.k3_actions WHERE id=_action; ELSE _perm_goal:=_goal; END IF;
  IF _perm_goal IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), _perm_goal) THEN RAISE EXCEPTION 'Bạn không có quyền quản lý KPI của mục tiêu này.'; END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên KPI không được trống.'; END IF;
  IF _kind NOT IN ('cumulative','ratio','milestone') THEN RAISE EXCEPTION 'Loại KPI không hợp lệ.'; END IF;
  IF nullif(p->>'target','') IS NOT NULL AND (p->>'target')::numeric < 0 THEN RAISE EXCEPTION 'Mục tiêu KPI không được âm.'; END IF;
  IF _kind IN ('ratio','milestone') AND nullif(p->>'manual_actual','') IS NOT NULL AND btrim(coalesce(p->>'manual_source',''))='' THEN RAISE EXCEPTION 'KPI tỷ lệ/mốc cần ghi nguồn xác nhận giá trị.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.k3_kpis(goal_id,action_id,name,kind,target,unit,manual_actual,manual_source,sort_order,created_by,request_key)
    VALUES(CASE WHEN _action IS NOT NULL THEN NULL ELSE _goal END,_action,btrim(p->>'name'),_kind,nullif(p->>'target','')::numeric,nullif(btrim(coalesce(p->>'unit','')),''),nullif(p->>'manual_actual','')::numeric,nullif(btrim(coalesce(p->>'manual_source','')),''),coalesce((p->>'sort_order')::int,0),auth.uid(),key)
    RETURNING * INTO k;
  ELSE
    UPDATE public.k3_kpis SET name=btrim(p->>'name'),kind=_kind,target=nullif(p->>'target','')::numeric,unit=nullif(btrim(coalesce(p->>'unit','')),''),manual_actual=nullif(p->>'manual_actual','')::numeric,manual_source=nullif(btrim(coalesce(p->>'manual_source','')),''),sort_order=coalesce((p->>'sort_order')::int,old.sort_order),updated_at=now()
    WHERE id=_id RETURNING * INTO k;
  END IF;
  RETURN to_jsonb(k);
END$$;

CREATE OR REPLACE FUNCTION public.k3_goal_list(_filter text DEFAULT 'all', _q text DEFAULT '') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
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
        'kf_total',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled'),
        'kf_done',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status='done'),
        'overdue_days',CASE WHEN g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end)) ELSE 0 END
      ) row
      FROM public.k3_goals g
      JOIN public.profiles p ON p.id=g.user_id
      LEFT JOIN public.k3_goal_members m ON m.goal_id=g.id AND m.user_id=auth.uid()
      WHERE (coalesce(_q,'')='' OR g.name ILIKE '%'||_q||'%')
        AND (
          (_filter='mine' AND g.user_id=auth.uid())
          OR (_filter='joined' AND m.status='accepted' AND g.user_id<>auth.uid())
          OR (_filter='invited' AND m.status='invited')
          OR (_filter='assigned' AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.goal_id=g.id AND a.assignee_id=auth.uid() AND a.status<>'cancelled'))
          OR (_filter='scope' AND public.k3_can(auth.uid(),'k3.view_scope') AND g.user_id<>auth.uid() AND public.biz_scope_ok(auth.uid(),g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))
          OR (_filter IN ('all','active','overdue','done') AND public.k3_goal_visible(auth.uid(),g.id))
        )
        AND (_filter<>'active' OR g.status IN ('not_started','in_progress','paused'))
        AND (_filter<>'overdue' OR (g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today))
        AND (_filter<>'done' OR g.status IN ('done','ended_missed'))
    ) unsorted ORDER BY (row->>'is_key')::boolean DESC, row->>'period_end'
  ) sorted),'[]'::jsonb);
END$$;

CREATE OR REPLACE FUNCTION public.k3_goal_detail(_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.k3_goals; today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_id;
  IF g.id IS NULL OR NOT public.k3_goal_visible(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền xem mục tiêu này.'; END IF;
  RETURN jsonb_build_object(
    'goal', to_jsonb(g) || jsonb_build_object('owner_name',(SELECT full_name FROM public.profiles WHERE id=g.user_id),'overdue_days',CASE WHEN g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end)) ELSE 0 END),
    'kpis', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
        'actual',CASE WHEN k.kind='cumulative' THEN (SELECT coalesce(sum(t.kpi_actual),0) FROM public.k3_tasks t JOIN public.k3_actions a ON a.id=t.action_id WHERE a.goal_id=g.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL AND nullif(btrim(coalesce(t.kpi_unit,'')),'') IS NOT DISTINCT FROM nullif(btrim(coalesce(k.unit,'')),'')) ELSE k.manual_actual END) row
      FROM public.k3_kpis k WHERE k.goal_id=g.id ORDER BY k.sort_order,k.created_at) sorted),'[]'::jsonb),
    'actions', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('action',to_jsonb(a),'assignee_name',(SELECT full_name FROM public.profiles WHERE id=a.assignee_id),
        'collaborators',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',c.user_id,'full_name',pr.full_name)) FROM public.k3_action_collaborators c JOIN public.profiles pr ON pr.id=c.user_id WHERE c.action_id=a.id),'[]'::jsonb),
        'kpis',coalesce((SELECT jsonb_agg(krow) FROM (SELECT jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
            'actual',CASE WHEN k.kind='cumulative' THEN private.k3_action_kpi_actual(a.id,k.unit) ELSE k.manual_actual END) krow FROM public.k3_kpis k WHERE k.action_id=a.id ORDER BY k.sort_order,k.created_at) ksorted),'[]'::jsonb),
        'member_actuals',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',t.user_id,'full_name',pr.full_name,'actual',sum(t.kpi_actual),'days',count(DISTINCT t.work_date))) FROM public.k3_tasks t JOIN public.profiles pr ON pr.id=t.user_id WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL GROUP BY t.user_id,pr.full_name),'[]'::jsonb),
        'task_total',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled),
        'task_done',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND private.k3_task_complete(t.kpi_target,t.kpi_actual,t.progress,t.status)),
        'overdue_days',CASE WHEN a.status IN ('not_started','in_progress','paused') AND a.due_date IS NOT NULL AND a.due_date < today THEN (today - a.due_date) ELSE 0 END) row
      FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled' ORDER BY a.is_key DESC, a.created_at) sorted),'[]'::jsonb),
    'members', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('user_id',m.user_id,'full_name',p.full_name,'status',m.status,'invited_at',m.invited_at,'responded_at',m.responded_at,
        'departments',coalesce((SELECT array_agg(DISTINCT d.name) FROM public.biz_department_members mm JOIN public.biz_departments d ON d.id=mm.department_id WHERE mm.user_id=m.user_id),'{}'::text[])) row
      FROM public.k3_goal_members m JOIN public.profiles p ON p.id=m.user_id WHERE m.goal_id=g.id ORDER BY m.invited_at) sorted),'[]'::jsonb),
    'executions', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',t.id,'work_date',t.work_date,'name',t.name,'status',t.status,'kpi_actual',t.kpi_actual,'kpi_unit',t.kpi_unit,'progress',t.progress,'action_id',t.action_id,'user_id',t.user_id,'full_name',p.full_name,'problem',t.problem,'solution',t.solution) row
      FROM public.k3_tasks t JOIN public.profiles p ON p.id=t.user_id
      WHERE t.action_id IN (SELECT a.id FROM public.k3_actions a WHERE a.goal_id=g.id) AND t.deleted_at IS NULL AND NOT t.is_unscheduled
      ORDER BY t.work_date DESC, t.id LIMIT 200) sorted),'[]'::jsonb),
    'events', coalesce((SELECT jsonb_agg(row) FROM (
      SELECT jsonb_build_object('id',e.id,'action',e.action,'detail',e.detail,'created_at',e.created_at,'actor_name',(SELECT full_name FROM public.profiles WHERE id=e.actor_id)) row
      FROM public.k3_plan_events e WHERE e.goal_id=g.id ORDER BY e.created_at DESC LIMIT 100) sorted),'[]'::jsonb),
    'can_manage', private.k3_goal_manage_ok(auth.uid(), g.id),
    'my_member_status', (SELECT status FROM public.k3_goal_members WHERE goal_id=g.id AND user_id=auth.uid()),
    'today', today
  );
END$$;

REVOKE ALL ON FUNCTION public.k3_kpi_save(jsonb),public.k3_goal_list(text,text),public.k3_goal_detail(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.k3_kpi_save(jsonb),public.k3_goal_list(text,text),public.k3_goal_detail(uuid) TO authenticated;