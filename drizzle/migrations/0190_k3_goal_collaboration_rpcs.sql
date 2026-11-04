-- Bước 2: RPC nghiệp vụ KG/KF xuyên thời gian — lời mời, phân công, KPI đa dòng, trạng thái, đọc danh sách/chi tiết.
ALTER TABLE public.k3_kpis ADD COLUMN request_key uuid;
CREATE UNIQUE INDEX k3_kpis_request_key ON public.k3_kpis(request_key) WHERE request_key IS NOT NULL;

-- Chủ trì KG hoặc Admin được quản lý cấu trúc KG/KF.
CREATE FUNCTION private.k3_goal_manage_ok(_actor uuid, _goal uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT _actor IS NOT NULL AND (public.biz_admin(_actor) OR EXISTS(SELECT 1 FROM public.k3_goals g WHERE g.id=_goal AND g.user_id=_actor))
$$;
REVOKE ALL ON FUNCTION private.k3_goal_manage_ok(uuid,uuid) FROM PUBLIC, anon, authenticated;

-- Người thực thi KF: chủ trì KG, người phụ trách chính hoặc người phối hợp.
CREATE FUNCTION private.k3_action_worker_ok(_user uuid, _action uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id
    WHERE a.id=_action AND a.status<>'cancelled' AND g.status NOT IN ('done','ended_missed','cancelled') AND (
      g.user_id=_user OR a.assignee_id=_user
      OR EXISTS(SELECT 1 FROM public.k3_action_collaborators c WHERE c.action_id=a.id AND c.user_id=_user)
    )
  )
$$;
REVOKE ALL ON FUNCTION private.k3_action_worker_ok(uuid,uuid) FROM PUBLIC, anon, authenticated;

-- Thực tế KPI cộng dồn của một KF: tổng kết quả hợp lệ theo ngày, cùng đơn vị đo, mỗi bản ghi tính một lần.
CREATE FUNCTION private.k3_action_kpi_actual(_action uuid, _unit text) RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(sum(t.kpi_actual),0) FROM public.k3_tasks t
  WHERE t.action_id=_action AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL
    AND nullif(btrim(coalesce(t.kpi_unit,'')),'') IS NOT DISTINCT FROM nullif(btrim(coalesce(_unit,'')),'')
$$;
REVOKE ALL ON FUNCTION private.k3_action_kpi_actual(uuid,text) FROM PUBLIC, anon, authenticated;

-- Lưu KG: hỗ trợ khoảng thời gian tùy chỉnh (custom), giữ nguyên lối tuần/tháng cũ.
CREATE OR REPLACE FUNCTION public.k3_goal_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.k3_goals; old public.k3_goals; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; typ text:=coalesce(nullif(p->>'period_type',''),'custom'); dt date:=nullif(p->>'period_start','')::date; de date:=nullif(p->>'period_end','')::date; key uuid:=nullif(p->>'request_key','')::uuid; st text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
  IF _id IS NOT NULL THEN
    SELECT * INTO old FROM public.k3_goals WHERE id=_id FOR UPDATE;
    IF old.id IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), old.id) THEN RAISE EXCEPTION 'Bạn không được sửa mục tiêu này.'; END IF;
    IF (p->>'revision')::bigint IS DISTINCT FROM old.revision THEN RAISE EXCEPTION 'Mục tiêu đã thay đổi. Vui lòng tải lại.'; END IF;
    typ:=old.period_type; dt:=old.period_start; de:=old.period_end;
  ELSE
    IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu lưu mục tiêu.'; END IF;
    SELECT * INTO g FROM public.k3_goals WHERE user_id=auth.uid() AND request_key=key;
    IF g.id IS NOT NULL THEN RETURN to_jsonb(g); END IF;
    IF NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
    IF NOT coalesce((SELECT allow_personal_goal FROM public.k3_settings WHERE id),true) AND NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Quyền tạo KG đang tắt trong Cài đặt 3K.'; END IF;
  END IF;
  IF typ='custom' THEN
    IF dt IS NULL OR de IS NULL OR de < dt THEN RAISE EXCEPTION 'Cần chọn ngày bắt đầu và hạn hoàn thành hợp lệ.'; END IF;
    PERFORM private.k3_write_guard(greatest(dt, coalesce((SELECT effective_from FROM public.k3_settings WHERE id), dt)));
  ELSE
    dt:=public.k3_period_start(typ,dt);
    IF dt IS NULL THEN RAISE EXCEPTION 'Cần chọn kỳ.'; END IF;
    de:=public.k3_period_end(typ,dt);
    PERFORM private.k3_period_write_guard(typ,dt);
  END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên mục tiêu không được trống.'; END IF;
  st:=coalesce(nullif(p->>'status',''),'draft');
  IF st NOT IN ('draft','not_started','in_progress') THEN RAISE EXCEPTION 'Trạng thái khởi tạo không hợp lệ.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.k3_goals(user_id,period_type,period_start,period_end,name,description,expected_result,due_date,department_id,request_key,status,is_key)
    VALUES(auth.uid(),typ,dt,de,btrim(p->>'name'),nullif(btrim(p->>'description'),''),nullif(btrim(p->>'expected_result'),''),coalesce(nullif(p->>'due_date','')::date,de),public.biz_department_at(auth.uid(),greatest(dt,coalesce((SELECT period_effective_from FROM public.k3_settings WHERE id),dt))),key,st,coalesce((p->>'is_key')::boolean,false))
    RETURNING * INTO g;
  ELSE
    UPDATE public.k3_goals SET name=btrim(p->>'name'),description=nullif(btrim(p->>'description'),''),expected_result=nullif(btrim(p->>'expected_result'),''),due_date=nullif(p->>'due_date','')::date,is_key=coalesce((p->>'is_key')::boolean,old.is_key),
      period_start=CASE WHEN old.period_type='custom' THEN dt ELSE old.period_start END,
      period_end=CASE WHEN old.period_type='custom' THEN de ELSE old.period_end END,
      revision=revision+1,updated_at=now()
    WHERE id=_id RETURNING * INTO g;
  END IF;
  INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),'goal_save',jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(g)));
  RETURN to_jsonb(g);
END$$;

-- Đổi trạng thái KG: bắt đầu thực hiện cần ít nhất một KF; kết thúc lưu người xác nhận; không tự suy từ KF.
CREATE FUNCTION public.k3_goal_status(_id uuid, _status text, _note text, _revision bigint) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.k3_goals;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_id FOR UPDATE;
  IF g.id IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền đổi trạng thái mục tiêu này.'; END IF;
  IF _revision IS NULL OR _revision <> g.revision THEN RAISE EXCEPTION 'Mục tiêu đã thay đổi. Vui lòng tải lại.'; END IF;
  IF _status NOT IN ('draft','not_started','in_progress','paused','done','ended_missed','cancelled') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  IF _status='in_progress' AND NOT EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled') THEN RAISE EXCEPTION 'KG bắt đầu thực hiện cần ít nhất một KF.'; END IF;
  UPDATE public.k3_goals SET status=_status,
    closed_at=CASE WHEN _status IN ('done','ended_missed','cancelled') THEN now() ELSE NULL END,
    closed_by=CASE WHEN _status IN ('done','ended_missed','cancelled') THEN auth.uid() ELSE NULL END,
    close_note=CASE WHEN _status IN ('done','ended_missed','cancelled') THEN nullif(btrim(coalesce(_note,'')),'') ELSE close_note END,
    revision=revision+1, updated_at=now()
  WHERE id=g.id RETURNING * INTO g;
  INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),'goal_status',jsonb_build_object('status',_status,'note',nullif(btrim(coalesce(_note,'')),'')));
  RETURN to_jsonb(g);
END$$;

-- Mời thành viên tham gia KG (idempotent theo người; mời lại được sau từ chối/thu hồi).
CREATE FUNCTION public.k3_member_invite(_goal_id uuid, _user_ids uuid[]) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
END$$;

-- Người được mời chấp nhận hoặc từ chối.
CREATE FUNCTION public.k3_member_respond(_goal_id uuid, _accept boolean) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m public.k3_goal_members; g public.k3_goals;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO m FROM public.k3_goal_members WHERE goal_id=_goal_id AND user_id=auth.uid() FOR UPDATE;
  IF m.id IS NULL OR m.status<>'invited' THEN RAISE EXCEPTION 'Không có lời mời đang chờ bạn xác nhận.'; END IF;
  UPDATE public.k3_goal_members SET status=CASE WHEN _accept THEN 'accepted' ELSE 'declined' END, responded_at=now() WHERE id=m.id RETURNING * INTO m;
  SELECT * INTO g FROM public.k3_goals WHERE id=_goal_id;
  INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),CASE WHEN _accept THEN 'member_accept' ELSE 'member_decline' END,jsonb_build_object('member',auth.uid()));
  RETURN to_jsonb(m);
END$$;

-- Thu hồi thành viên: giữ lịch sử, thu hồi quyền tham gia.
CREATE FUNCTION public.k3_member_revoke(_goal_id uuid, _user_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m public.k3_goal_members; g public.k3_goals;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_goal_id FOR UPDATE;
  IF g.id IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền thu hồi thành viên của mục tiêu này.'; END IF;
  SELECT * INTO m FROM public.k3_goal_members WHERE goal_id=_goal_id AND user_id=_user_id FOR UPDATE;
  IF m.id IS NULL OR m.status NOT IN ('invited','accepted') THEN RAISE EXCEPTION 'Thành viên không còn tham gia mục tiêu này.'; END IF;
  UPDATE public.k3_goal_members SET status='revoked',revoked_at=now(),revoked_by=auth.uid() WHERE id=m.id RETURNING * INTO m;
  INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),'member_revoke',jsonb_build_object('member',_user_id));
  RETURN to_jsonb(m);
END$$;

-- Lưu KF: chủ trì KG/Admin tạo và phân công; người phụ trách được cập nhật nội dung/tiến độ thủ công.
CREATE OR REPLACE FUNCTION public.k3_action_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.k3_actions; old public.k3_actions; g public.k3_goals; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; key uuid:=nullif(p->>'request_key','')::uuid; _assignee uuid; _collab uuid; _collabs uuid[]:=coalesce((SELECT array_agg(value::uuid) FROM jsonb_array_elements_text(coalesce(p->'collaborators','[]'::jsonb))),'{}'::uuid[]);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
  IF _id IS NOT NULL THEN
    SELECT * INTO old FROM public.k3_actions WHERE id=_id FOR UPDATE;
    IF old.id IS NULL OR NOT (private.k3_goal_manage_ok(auth.uid(), old.goal_id) OR old.assignee_id=auth.uid()) THEN RAISE EXCEPTION 'Bạn không được sửa hành động này.'; END IF;
    IF (p->>'revision')::bigint IS DISTINCT FROM old.revision THEN RAISE EXCEPTION 'Hành động đã thay đổi. Vui lòng tải lại.'; END IF;
    IF (p ? 'assignee_id' OR p ? 'collaborators') AND NOT private.k3_goal_manage_ok(auth.uid(), old.goal_id) THEN RAISE EXCEPTION 'Chỉ người chủ trì KG được phân công lại KF.'; END IF;
  ELSE
    IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu lưu hành động.'; END IF;
    SELECT * INTO a FROM public.k3_actions WHERE user_id=auth.uid() AND request_key=key;
    IF a.id IS NOT NULL THEN RETURN to_jsonb(a); END IF;
  END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=coalesce(old.goal_id,nullif(p->>'goal_id','')::uuid) FOR UPDATE;
  IF g.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy mục tiêu.'; END IF;
  IF _id IS NULL AND NOT private.k3_goal_manage_ok(auth.uid(), g.id) THEN RAISE EXCEPTION 'Chỉ người chủ trì KG được thêm KF.'; END IF;
  IF g.status IN ('done','ended_missed','cancelled') THEN RAISE EXCEPTION 'Mục tiêu đã kết thúc.'; END IF;
  IF g.period_type='custom' THEN PERFORM private.k3_write_guard(greatest(g.period_start, coalesce((SELECT effective_from FROM public.k3_settings WHERE id), g.period_start)));
  ELSE PERFORM private.k3_period_write_guard(g.period_type,g.period_start); END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên hành động không được trống.'; END IF;
  IF nullif(p->>'manual_progress','') IS NOT NULL AND btrim(coalesce(p->>'progress_source',''))='' THEN RAISE EXCEPTION 'Xác nhận tiến độ thủ công cần ghi nguồn.'; END IF;
  IF nullif(p->>'start_date','')::date > nullif(p->>'due_date','')::date THEN RAISE EXCEPTION 'Ngày bắt đầu phải trước hạn hoàn thành.'; END IF;
  _assignee:=coalesce(nullif(p->>'assignee_id','')::uuid, old.assignee_id, g.user_id);
  IF _assignee<>g.user_id AND NOT EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=_assignee AND m.status='accepted') THEN RAISE EXCEPTION 'Người phụ trách KF phải là chủ trì hoặc thành viên đã chấp nhận tham gia KG.'; END IF;
  FOREACH _collab IN ARRAY _collabs LOOP
    IF _collab<>g.user_id AND NOT EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=_collab AND m.status='accepted') THEN RAISE EXCEPTION 'Người phối hợp phải là thành viên đã chấp nhận tham gia KG.'; END IF;
  END LOOP;
  IF _id IS NULL THEN
    INSERT INTO public.k3_actions(goal_id,user_id,name,start_date,due_date,note,manual_progress,progress_source,request_key,assignee_id,is_key)
    VALUES(g.id,g.user_id,btrim(p->>'name'),nullif(p->>'start_date','')::date,nullif(p->>'due_date','')::date,nullif(btrim(p->>'note'),''),nullif(p->>'manual_progress','')::smallint,nullif(btrim(p->>'progress_source'),''),key,_assignee,coalesce((p->>'is_key')::boolean,false))
    RETURNING * INTO a;
  ELSE
    UPDATE public.k3_actions SET name=btrim(p->>'name'),start_date=nullif(p->>'start_date','')::date,due_date=nullif(p->>'due_date','')::date,note=nullif(btrim(p->>'note'),''),manual_progress=nullif(p->>'manual_progress','')::smallint,progress_source=nullif(btrim(p->>'progress_source'),''),
      assignee_id=_assignee,is_key=coalesce((p->>'is_key')::boolean,old.is_key),revision=revision+1,updated_at=now()
    WHERE id=_id RETURNING * INTO a;
  END IF;
  IF p ? 'collaborators' THEN
    DELETE FROM public.k3_action_collaborators WHERE action_id=a.id AND user_id<>ALL(_collabs);
    INSERT INTO public.k3_action_collaborators(action_id,user_id,added_by) SELECT a.id,c,auth.uid() FROM unnest(_collabs) c ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(g.user_id,g.id,a.id,auth.uid(),'action_save',jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(a)));
  RETURN to_jsonb(a);
END$$;

-- Đổi trạng thái KF: hoàn thành cần đạt KPI cộng dồn; kết thúc chưa đạt cần đủ VNGB.
CREATE FUNCTION public.k3_action_status(_id uuid, _status text, _problem text, _cause text, _solution text, _revision bigint) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.k3_actions; unmet text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO a FROM public.k3_actions WHERE id=_id FOR UPDATE;
  IF a.id IS NULL OR NOT (private.k3_goal_manage_ok(auth.uid(), a.goal_id) OR a.assignee_id=auth.uid()) THEN RAISE EXCEPTION 'Bạn không có quyền đổi trạng thái hành động này.'; END IF;
  IF _revision IS NULL OR _revision <> a.revision THEN RAISE EXCEPTION 'Hành động đã thay đổi. Vui lòng tải lại.'; END IF;
  IF _status NOT IN ('draft','not_started','in_progress','paused','done','ended_missed','cancelled') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  IF _status='done' THEN
    SELECT string_agg(k.name,'; ') INTO unmet FROM public.k3_kpis k WHERE k.action_id=a.id AND k.kind='cumulative' AND coalesce(k.target,0)>0 AND private.k3_action_kpi_actual(a.id,k.unit) < k.target;
    IF unmet IS NOT NULL THEN RAISE EXCEPTION 'Chưa đạt KPI: %. Hãy ghi nhận Kết thúc chưa đạt nếu dừng hành động này.', unmet; END IF;
  END IF;
  IF _status='ended_missed' AND (btrim(coalesce(_problem,''))='' OR btrim(coalesce(_cause,''))='' OR btrim(coalesce(_solution,''))='') THEN RAISE EXCEPTION 'Kết thúc chưa đạt cần đủ Vấn đề - Nguyên nhân - Giải pháp.'; END IF;
  UPDATE public.k3_actions SET status=_status,
    problem=CASE WHEN _status='ended_missed' THEN btrim(_problem) ELSE problem END,
    cause=CASE WHEN _status='ended_missed' THEN btrim(_cause) ELSE cause END,
    solution=CASE WHEN _status='ended_missed' THEN btrim(_solution) ELSE solution END,
    closed_at=CASE WHEN _status IN ('done','ended_missed','cancelled') THEN now() ELSE NULL END,
    closed_by=CASE WHEN _status IN ('done','ended_missed','cancelled') THEN auth.uid() ELSE NULL END,
    revision=revision+1, updated_at=now()
  WHERE id=a.id RETURNING * INTO a;
  INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(a.user_id,a.goal_id,a.id,auth.uid(),'action_status',jsonb_build_object('status',_status));
  RETURN to_jsonb(a);
END$$;

-- KPI đa dòng cho KG/KF.
CREATE FUNCTION public.k3_kpi_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k public.k3_kpis; old public.k3_kpis; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; _goal uuid:=nullif(p->>'goal_id','')::uuid; _action uuid:=nullif(p->>'action_id','')::uuid; key uuid:=nullif(p->>'request_key','')::uuid; _kind text:=coalesce(nullif(p->>'kind',''),'cumulative');
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
  IF _action IS NOT NULL THEN SELECT goal_id INTO _goal FROM public.k3_actions WHERE id=_action; END IF;
  IF _goal IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), _goal) THEN RAISE EXCEPTION 'Bạn không có quyền quản lý KPI của mục tiêu này.'; END IF;
  IF btrim(coalesce(p->>'name',''))='' THEN RAISE EXCEPTION 'Tên KPI không được trống.'; END IF;
  IF _kind NOT IN ('cumulative','ratio','milestone') THEN RAISE EXCEPTION 'Loại KPI không hợp lệ.'; END IF;
  IF nullif(p->>'target','') IS NOT NULL AND (p->>'target')::numeric < 0 THEN RAISE EXCEPTION 'Mục tiêu KPI không được âm.'; END IF;
  IF _kind IN ('ratio','milestone') AND nullif(p->>'manual_actual','') IS NOT NULL AND btrim(coalesce(p->>'manual_source',''))='' THEN RAISE EXCEPTION 'KPI tỷ lệ/mốc cần ghi nguồn xác nhận giá trị.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.k3_kpis(goal_id,action_id,name,kind,target,unit,manual_actual,manual_source,sort_order,created_by,request_key)
    VALUES(_goal,_action,btrim(p->>'name'),_kind,nullif(p->>'target','')::numeric,nullif(btrim(coalesce(p->>'unit','')),''),nullif(p->>'manual_actual','')::numeric,nullif(btrim(coalesce(p->>'manual_source','')),''),coalesce((p->>'sort_order')::int,0),auth.uid(),key)
    RETURNING * INTO k;
  ELSE
    UPDATE public.k3_kpis SET name=btrim(p->>'name'),kind=_kind,target=nullif(p->>'target','')::numeric,unit=nullif(btrim(coalesce(p->>'unit','')),''),manual_actual=nullif(p->>'manual_actual','')::numeric,manual_source=nullif(btrim(coalesce(p->>'manual_source','')),''),sort_order=coalesce((p->>'sort_order')::int,old.sort_order),updated_at=now()
    WHERE id=_id RETURNING * INTO k;
  END IF;
  RETURN to_jsonb(k);
END$$;
CREATE FUNCTION public.k3_kpi_delete(_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k public.k3_kpis; _goal uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO k FROM public.k3_kpis WHERE id=_id;
  IF k.id IS NULL THEN RETURN true; END IF;
  _goal:=coalesce(k.goal_id,(SELECT goal_id FROM public.k3_actions WHERE id=k.action_id));
  IF NOT private.k3_goal_manage_ok(auth.uid(), _goal) THEN RAISE EXCEPTION 'Bạn không có quyền xóa KPI của mục tiêu này.'; END IF;
  DELETE FROM public.k3_kpis WHERE id=_id;
  RETURN true;
END$$;

-- Tìm nhân sự để tag thành viên: dùng dữ liệu nhân sự/cơ cấu hiện có.
CREATE FUNCTION public.k3_member_search(_q text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('id',x.id,'full_name',x.full_name,'departments',x.departments) ORDER BY x.full_name) FROM (
    SELECT p.id, p.full_name, coalesce(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}'::text[]) departments
    FROM public.profiles p
    LEFT JOIN public.biz_department_members m ON m.user_id=p.id
    LEFT JOIN public.biz_departments d ON d.id=m.department_id
    WHERE p.status='Đang hoạt động' AND (coalesce(_q,'')='' OR p.full_name ILIKE '%'||_q||'%')
    GROUP BY p.id, p.full_name ORDER BY p.full_name LIMIT 20) x),'[]'::jsonb);
END$$;

-- Danh sách KG của tôi / trong phạm vi quản lý, kèm tiến độ KF và cảnh báo hạn.
CREATE FUNCTION public.k3_goal_list(_filter text DEFAULT 'all', _q text DEFAULT '') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  IF NOT public.k3_can(auth.uid(),'k3.use') AND NOT public.k3_can(auth.uid(),'k3.view_scope') THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K.'; END IF;
  RETURN coalesce((SELECT jsonb_agg(row ORDER BY (row->>'is_key')::boolean DESC, row->>'period_end') FROM (
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
  ) rows),'[]'::jsonb);
END$$;

-- Chi tiết KG: KPI kết quả, KF kèm KPI thực thi, thành viên, nhật ký thực thi, lịch sử hoạt động.
CREATE FUNCTION public.k3_goal_detail(_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.k3_goals; today date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_id;
  IF g.id IS NULL OR NOT public.k3_goal_visible(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền xem mục tiêu này.'; END IF;
  RETURN jsonb_build_object(
    'goal', to_jsonb(g) || jsonb_build_object('owner_name',(SELECT full_name FROM public.profiles WHERE id=g.user_id),'overdue_days',CASE WHEN g.status IN ('not_started','in_progress','paused') AND coalesce(g.due_date,g.period_end) < today THEN (today - coalesce(g.due_date,g.period_end)) ELSE 0 END),
    'kpis', coalesce((SELECT jsonb_agg(jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
        'actual',CASE WHEN k.kind='cumulative' THEN (SELECT coalesce(sum(t.kpi_actual),0) FROM public.k3_tasks t JOIN public.k3_actions a ON a.id=t.action_id WHERE a.goal_id=g.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL AND nullif(btrim(coalesce(t.kpi_unit,'')),'') IS NOT DISTINCT FROM nullif(btrim(coalesce(k.unit,'')),'')) ELSE k.manual_actual END)
      ORDER BY k.sort_order,k.created_at) FROM public.k3_kpis k WHERE k.goal_id=g.id),'[]'::jsonb),
    'actions', coalesce((SELECT jsonb_agg(jsonb_build_object('action',to_jsonb(a),'assignee_name',(SELECT full_name FROM public.profiles WHERE id=a.assignee_id),
        'collaborators',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',c.user_id,'full_name',pr.full_name)) FROM public.k3_action_collaborators c JOIN public.profiles pr ON pr.id=c.user_id WHERE c.action_id=a.id),'[]'::jsonb),
        'kpis',coalesce((SELECT jsonb_agg(jsonb_build_object('id',k.id,'name',k.name,'kind',k.kind,'target',k.target,'unit',k.unit,'manual_actual',k.manual_actual,'manual_source',k.manual_source,
            'actual',CASE WHEN k.kind='cumulative' THEN private.k3_action_kpi_actual(a.id,k.unit) ELSE k.manual_actual END) ORDER BY k.sort_order,k.created_at) FROM public.k3_kpis k WHERE k.action_id=a.id),'[]'::jsonb),
        'member_actuals',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',t.user_id,'full_name',pr.full_name,'actual',sum(t.kpi_actual),'days',count(DISTINCT t.work_date))) FROM public.k3_tasks t JOIN public.profiles pr ON pr.id=t.user_id WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND t.kpi_actual IS NOT NULL GROUP BY t.user_id,pr.full_name),'[]'::jsonb),
        'task_total',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled),
        'task_done',(SELECT count(*) FROM public.k3_tasks t WHERE t.action_id=a.id AND t.deleted_at IS NULL AND NOT t.is_unscheduled AND private.k3_task_complete(t.kpi_target,t.kpi_actual,t.progress,t.status)),
        'overdue_days',CASE WHEN a.status IN ('not_started','in_progress','paused') AND a.due_date IS NOT NULL AND a.due_date < today THEN (today - a.due_date) ELSE 0 END)
      ORDER BY a.is_key DESC, a.created_at) FROM public.k3_actions a WHERE a.goal_id=g.id AND a.status<>'cancelled'),'[]'::jsonb),
    'members', coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',m.user_id,'full_name',p.full_name,'status',m.status,'invited_at',m.invited_at,'responded_at',m.responded_at,
        'departments',coalesce((SELECT array_agg(DISTINCT d.name) FROM public.biz_department_members mm JOIN public.biz_departments d ON d.id=mm.department_id WHERE mm.user_id=m.user_id),'{}'::text[]))
      ORDER BY m.invited_at) FROM public.k3_goal_members m JOIN public.profiles p ON p.id=m.user_id WHERE m.goal_id=g.id),'[]'::jsonb),
    'executions', coalesce((SELECT jsonb_agg(row ORDER BY row->>'work_date' DESC) FROM (
      SELECT jsonb_build_object('id',t.id,'work_date',t.work_date,'name',t.name,'status',t.status,'kpi_actual',t.kpi_actual,'kpi_unit',t.kpi_unit,'progress',t.progress,'action_id',t.action_id,'user_id',t.user_id,'full_name',p.full_name,'problem',t.problem,'solution',t.solution) row
      FROM public.k3_tasks t JOIN public.profiles p ON p.id=t.user_id
      WHERE t.action_id IN (SELECT a.id FROM public.k3_actions a WHERE a.goal_id=g.id) AND t.deleted_at IS NULL AND NOT t.is_unscheduled
      ORDER BY t.work_date DESC, t.id LIMIT 200) rows),'[]'::jsonb),
    'events', coalesce((SELECT jsonb_agg(row ORDER BY row->>'created_at' DESC) FROM (
      SELECT jsonb_build_object('id',e.id,'action',e.action,'detail',e.detail,'created_at',e.created_at,'actor_name',(SELECT full_name FROM public.profiles WHERE id=e.actor_id)) row
      FROM public.k3_plan_events e WHERE e.goal_id=g.id ORDER BY e.created_at DESC LIMIT 100) rows),'[]'::jsonb),
    'can_manage', private.k3_goal_manage_ok(auth.uid(), g.id),
    'my_member_status', (SELECT status FROM public.k3_goal_members WHERE goal_id=g.id AND user_id=auth.uid()),
    'today', today
  );
END$$;

-- Cài đặt quyền nghiệp vụ 3K (tạo KG/mời/phân công), ghi lịch sử.
CREATE FUNCTION public.k3_module_settings_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old public.k3_settings; s public.k3_settings;
BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình 3K.'; END IF;
  SELECT * INTO old FROM public.k3_settings WHERE id FOR UPDATE;
  UPDATE public.k3_settings SET
    allow_personal_goal=coalesce((_payload->>'allow_personal_goal')::boolean, allow_personal_goal),
    allow_team_goal=coalesce((_payload->>'allow_team_goal')::boolean, allow_team_goal),
    allow_invite=coalesce((_payload->>'allow_invite')::boolean, allow_invite),
    allow_assign=coalesce((_payload->>'allow_assign')::boolean, allow_assign),
    updated_at=now(), updated_by=auth.uid()
  WHERE id RETURNING * INTO s;
  INSERT INTO public.k3_settings_log(changed_by,snapshot) VALUES(auth.uid(),jsonb_build_object('old',to_jsonb(old),'new',to_jsonb(s)));
  RETURN to_jsonb(s);
END$$;

REVOKE ALL ON FUNCTION public.k3_goal_save(jsonb),public.k3_goal_status(uuid,text,text,bigint),public.k3_member_invite(uuid,uuid[]),public.k3_member_respond(uuid,boolean),public.k3_member_revoke(uuid,uuid),public.k3_action_save(jsonb),public.k3_action_status(uuid,text,text,text,text,bigint),public.k3_kpi_save(jsonb),public.k3_kpi_delete(uuid),public.k3_member_search(text),public.k3_goal_list(text,text),public.k3_goal_detail(uuid),public.k3_module_settings_save(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.k3_goal_save(jsonb),public.k3_goal_status(uuid,text,text,bigint),public.k3_member_invite(uuid,uuid[]),public.k3_member_respond(uuid,boolean),public.k3_member_revoke(uuid,uuid),public.k3_action_save(jsonb),public.k3_action_status(uuid,text,text,text,text,bigint),public.k3_kpi_save(jsonb),public.k3_kpi_delete(uuid),public.k3_member_search(text),public.k3_goal_list(text,text),public.k3_goal_detail(uuid),public.k3_module_settings_save(jsonb) TO authenticated;