CREATE OR REPLACE FUNCTION public.k3_kpi_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
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
  IF EXISTS(SELECT 1 FROM public.k3_goals g WHERE g.id=_perm_goal AND g.deleted_at IS NOT NULL) OR (_action IS NOT NULL AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.id=_action AND a.deleted_at IS NOT NULL)) THEN RAISE EXCEPTION 'KG/KF đang nằm trong Thùng lưu trữ. Hãy khôi phục trước khi chỉnh sửa KPI.'; END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên KPI không được trống.'; END IF;
  IF _kind NOT IN ('cumulative','ratio','milestone') THEN RAISE EXCEPTION 'Loại KPI không hợp lệ.'; END IF;
  IF nullif(p->>'target','') IS NOT NULL AND (p->>'target')::numeric < 0 THEN RAISE EXCEPTION 'Mục tiêu KPI không được âm.'; END IF;
  IF _kind IN ('ratio','milestone') AND nullif(p->>'manual_actual','') IS NOT NULL AND btrim(coalesce(p->>'manual_source',''))='' THEN RAISE EXCEPTION 'KPI tỷ lệ/mốc cần ghi nguồn xác nhận giá trị.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.k3_kpis(goal_id,action_id,name,kind,target,unit,manual_actual,manual_source,sort_order,created_by,request_key)
    VALUES(CASE WHEN _action IS NOT NULL THEN NULL ELSE _goal END,_action,btrim(p->>'name'),_kind,nullif(p->>'target','')::numeric,nullif(btrim(coalesce(p->>'unit','')),''),nullif(p->>'manual_actual','')::numeric,nullif(btrim(p->>'manual_source'),''),coalesce((p->>'sort_order')::int,0),auth.uid(),key)
    RETURNING * INTO k;
  ELSE
    UPDATE public.k3_kpis SET name=btrim(p->>'name'),kind=_kind,target=nullif(p->>'target','')::numeric,unit=nullif(btrim(coalesce(p->>'unit','')),''),manual_actual=nullif(p->>'manual_actual','')::numeric,manual_source=nullif(btrim(p->>'manual_source'),''),sort_order=coalesce((p->>'sort_order')::int,old.sort_order),updated_at=now()
    WHERE id=_id RETURNING * INTO k;
  END IF;
  RETURN to_jsonb(k);
END$fn$;

CREATE OR REPLACE FUNCTION public.k3_task_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$DECLARE s public.k3_settings; d public.k3_days; old public.k3_tasks; t public.k3_tasks; _id uuid:=nullif(_payload->>'id','')::uuid; _date date:=nullif(_payload->>'work_date','')::date; _key uuid:=nullif(_payload->>'request_key','')::uuid; p jsonb:=_payload; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 IF _id IS NOT NULL THEN SELECT * INTO old FROM public.k3_tasks WHERE id=_id FOR UPDATE;
  IF old.id IS NULL OR old.user_id<>auth.uid() OR old.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Bạn không được chỉnh sửa công việc của người khác.'; END IF;
  IF old.action_id IS NOT NULL AND EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.id=old.action_id AND a.deleted_at IS NOT NULL) THEN RAISE EXCEPTION 'KF của công việc này đang nằm trong Thùng lưu trữ.'; END IF;
  IF _date IS NOT NULL AND _date<>old.work_date THEN RAISE EXCEPTION 'Công việc phải được cập nhật đúng ngày gốc.'; END IF;
  IF p ? 'revision' AND (p->>'revision')::bigint<>old.revision THEN RAISE EXCEPTION 'Công việc đã được cập nhật ở nơi khác. Vui lòng tải lại.'; END IF;
  _date:=old.work_date; p:=to_jsonb(old)||p;
 ELSE IF _key IS NOT NULL THEN SELECT * INTO t FROM public.k3_tasks WHERE user_id=auth.uid() AND request_key=_key; IF t.id IS NOT NULL THEN RETURN to_jsonb(t); END IF; END IF; END IF;
 PERFORM private.k3_write_guard(_date);
 SELECT * INTO s FROM public.k3_settings WHERE id;
 IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên công việc không được trống.'; END IF;
 INSERT INTO public.k3_days(user_id,work_date,planned_at) VALUES(auth.uid(),_date,now()) ON CONFLICT(user_id,work_date) DO NOTHING;
 SELECT * INTO d FROM public.k3_days WHERE user_id=auth.uid() AND work_date=_date FOR UPDATE;
 IF coalesce((p->>'is_focus')::boolean,false) AND (SELECT count(*) FROM public.k3_tasks WHERE day_id=d.id AND is_focus AND deleted_at IS NULL AND id IS DISTINCT FROM _id)>=coalesce(s.max_focus,3) THEN RAISE EXCEPTION 'Mỗi ngày chỉ chọn tối đa % công việc trọng tâm.',coalesce(s.max_focus,3); END IF;
 IF _id IS NULL THEN
 INSERT INTO public.k3_tasks(day_id,user_id,work_date,name,start_time,end_time,kpi_target,kpi_unit,kpi_actual,progress,status,is_focus,how,place,links,note,problem,cause,solution,sort_order,created_by,updated_by,request_key)
 VALUES(d.id,auth.uid(),_date,btrim(p->>'name'),nullif(p->>'start_time','')::time,nullif(p->>'end_time','')::time,nullif(p->>'kpi_target','')::numeric,nullif(btrim(p->>'kpi_unit'),''),nullif(p->>'kpi_actual','')::numeric,coalesce(nullif(p->>'progress','')::int,0),coalesce(p->>'status','todo'),coalesce((p->>'is_focus')::boolean,false),nullif(btrim(p->>'how'),''),nullif(btrim(p->>'place'),''),p->'links',nullif(btrim(p->>'note'),''),nullif(btrim(p->>'problem'),''),nullif(btrim(p->>'cause'),''),nullif(btrim(p->>'solution'),''),coalesce((p->>'sort_order')::int,0),auth.uid(),auth.uid(),_key) RETURNING * INTO t;
 ELSE UPDATE public.k3_tasks SET name=btrim(p->>'name'),start_time=nullif(p->>'start_time','')::time,end_time=nullif(p->>'end_time','')::time,kpi_target=nullif(p->>'kpi_target','')::numeric,kpi_unit=nullif(btrim(p->>'kpi_unit'),''),kpi_actual=nullif(p->>'kpi_actual','')::numeric,progress=coalesce(nullif(p->>'progress','')::int,0),status=p->>'status',is_focus=coalesce((p->>'is_focus')::boolean,false),how=nullif(btrim(p->>'how'),''),place=nullif(btrim(p->>'place'),''),links=p->'links',note=nullif(btrim(p->>'note'),''),problem=nullif(btrim(p->>'problem'),''),cause=nullif(btrim(p->>'cause'),''),solution=nullif(btrim(p->>'solution'),''),updated_at=now(),updated_by=auth.uid() WHERE id=_id RETURNING * INTO t; END IF;
 INSERT INTO public.k3_task_events(day_id,task_id,actor_id,action,detail) VALUES(d.id,t.id,auth.uid(),CASE WHEN _id IS NULL THEN 'create' ELSE 'update' END,jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(t))); RETURN to_jsonb(t); END$fn$;