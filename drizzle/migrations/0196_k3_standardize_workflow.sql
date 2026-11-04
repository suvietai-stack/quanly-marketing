-- CHUẨN HÓA QUY TRÌNH 3K: Tạo công việc = tạo KG + KF + KPI trong một lần lưu nguyên tử; tab Nhóm/Phòng Ban chỉ liệt kê KG có phối hợp; theo dõi nhân viên dùng trạng thái cập nhật/chốt sổ thay cho "Chưa lập 3K".

-- 1. Tạo công việc nhanh: KG + các KF + KPI trong một giao dịch, chống tạo trùng bằng request_key.
CREATE FUNCTION public.k3_quick_create(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  p jsonb:=_payload; key uuid:=nullif(p->>'request_key','')::uuid;
  g jsonb; gid uuid; kf jsonb; kpi jsonb; kid uuid; created_kf int:=0;
  start_now boolean:=coalesce((p->>'start_now')::boolean,false);
  members uuid[]:=coalesce((SELECT array_agg(value::uuid) FROM jsonb_array_elements_text(coalesce(p->'member_ids','[]'::jsonb))),'{}'::uuid[]);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu tạo công việc.'; END IF;
  SELECT id INTO gid FROM public.k3_goals WHERE user_id=auth.uid() AND request_key=key;
  IF gid IS NOT NULL THEN RETURN jsonb_build_object('goal_id',gid,'kf_count',(SELECT count(*) FROM public.k3_actions a WHERE a.goal_id=gid AND a.status<>'cancelled'),'duplicated',true); END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên công việc không được trống.'; END IF;
  IF start_now AND coalesce(jsonb_array_length(coalesce(p->'kfs','[]'::jsonb)),0)=0 THEN
    RAISE EXCEPTION 'Công việc bắt đầu thực hiện cần ít nhất một bước KF.';
  END IF;
  g:=public.k3_goal_save(jsonb_build_object(
    'request_key',key,'period_type','custom',
    'period_start',p->>'period_start','period_end',p->>'period_end',
    'name',p->>'name','description',coalesce(p->>'description',''),
    'expected_result',coalesce(p->>'expected_result',''),
    'due_date',coalesce(p->>'due_date',''),'is_key',coalesce((p->>'is_key')::boolean,false),
    'status',CASE WHEN start_now THEN 'in_progress' ELSE 'draft' END));
  gid:=(g->>'id')::uuid;
  FOR kf IN SELECT * FROM jsonb_array_elements(coalesce(p->'kfs','[]'::jsonb)) LOOP
    IF btrim(coalesce(kf->>'name',''))='' THEN RAISE EXCEPTION 'Tên bước thực hiện (KF) không được trống.'; END IF;
    kid:=(public.k3_action_save(jsonb_build_object(
      'request_key',coalesce(nullif(kf->>'request_key','')::uuid,gen_random_uuid()),
      'goal_id',gid,'name',kf->>'name',
      'start_date',coalesce(kf->>'start_date',''),'due_date',coalesce(kf->>'due_date',''),
      'assignee_id',coalesce(nullif(kf->>'assignee_id',''),auth.uid()::text),
      'collaborators',coalesce(kf->'collaborators','[]'::jsonb)))->>'id')::uuid;
    FOR kpi IN SELECT * FROM jsonb_array_elements(coalesce(kf->'kpis','[]'::jsonb)) LOOP
      IF btrim(coalesce(kpi->>'name',''))='' THEN RAISE EXCEPTION 'Tên chỉ tiêu KPI không được trống.'; END IF;
      PERFORM public.k3_kpi_save(jsonb_build_object(
        'request_key',coalesce(nullif(kpi->>'request_key','')::uuid,gen_random_uuid()),
        'action_id',kid,'name',kpi->>'name',
        'kind',coalesce(nullif(kpi->>'kind',''),'cumulative'),
        'target',coalesce(kpi->>'target',''),'unit',coalesce(kpi->>'unit','')));
    END LOOP;
    created_kf:=created_kf+1;
  END LOOP;
  IF coalesce(array_length(members,1),0)>0 THEN PERFORM public.k3_member_invite(gid, members); END IF;
  INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(auth.uid(),gid,auth.uid(),'quick_create',jsonb_build_object('kf_count',created_kf,'start_now',start_now));
  RETURN jsonb_build_object('goal_id',gid,'kf_count',created_kf,'duplicated',false);
END$$;
REVOKE ALL ON FUNCTION public.k3_quick_create(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.k3_quick_create(jsonb) TO authenticated;

-- 2. Danh sách KG: thêm lọc 'collab' — chỉ các KG có thành viên phối hợp (đã mời/đã tham gia), phục vụ tab Nhóm/Phòng Ban.
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
          OR (_filter='assigned' AND g.user_id<>auth.uid() AND m.status='accepted' AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.goal_id=g.id AND a.assignee_id=auth.uid() AND a.status<>'cancelled'))
          OR (_filter='collab' AND public.k3_goal_visible(auth.uid(),g.id) AND EXISTS(SELECT 1 FROM public.k3_goal_members x WHERE x.goal_id=g.id AND x.status IN ('invited','accepted')))
          OR (_filter='scope' AND public.k3_can(auth.uid(),'k3.view_scope') AND g.user_id<>auth.uid() AND public.biz_scope_ok(auth.uid(),g.user_id,g.department_id,(g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))
          OR (_filter IN ('all','active','overdue','done') AND public.k3_goal_visible(auth.uid(),g.id))
        )
        AND (_filter<>'active' OR g.status IN ('not_started','in_progress','paused'))
        AND (_filter<>'overdue' OR (g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today))
        AND (_filter<>'done' OR g.status IN ('done','ended_missed'))
    ) unsorted ORDER BY (row->>'is_key')::boolean DESC, row->>'period_end'
  ) sorted),'[]'::jsonb);
END$$;

-- 3. Theo dõi nhân viên: trạng thái ngày theo cập nhật/chốt sổ + bộ đếm KG/KF đang thực hiện và KF quá hạn.
CREATE OR REPLACE FUNCTION public.k3_team_read(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
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
 LEFT JOIN LATERAL(SELECT count(*) n FROM public.k3_goals g WHERE g.status IN ('not_started','in_progress','paused') AND (g.user_id=p.id OR EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=p.id AND m.status='accepted'))) ga ON true
 LEFT JOIN LATERAL(SELECT count(*) n,count(*) FILTER(WHERE a.due_date IS NOT NULL AND a.due_date<today) od FROM public.k3_actions a JOIN public.k3_goals g2 ON g2.id=a.goal_id WHERE a.status IN ('not_started','in_progress','paused') AND g2.status IN ('not_started','in_progress','paused') AND (a.assignee_id=p.id OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c2 WHERE c2.action_id=a.id AND c2.user_id=p.id))) kf ON true
 WHERE p.id<>auth.uid() AND CASE WHEN d.id IS NOT NULL THEN public.k3_day_scope_ok(auth.uid(),d.id) ELSE p.status='Đang hoạt động' AND dep.id IS NOT NULL AND public.biz_scope_ok(auth.uid(),p.id,dep.id,(_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) END),'[]'::jsonb); END$$;