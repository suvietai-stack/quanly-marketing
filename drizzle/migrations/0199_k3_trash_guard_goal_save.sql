CREATE OR REPLACE FUNCTION public.k3_goal_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE g public.k3_goals; old public.k3_goals; p jsonb:=_payload; _id uuid:=nullif(p->>'id','')::uuid; typ text:=coalesce(nullif(p->>'period_type',''),'custom'); dt date:=nullif(p->>'period_start','')::date; de date:=nullif(p->>'period_end','')::date; key uuid:=nullif(p->>'request_key','')::uuid; st text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
  IF _id IS NOT NULL THEN
    SELECT * INTO old FROM public.k3_goals WHERE id=_id FOR UPDATE;
    IF old.id IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), old.id) THEN RAISE EXCEPTION 'Bạn không được sửa mục tiêu này.'; END IF;
    IF old.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Mục tiêu đang nằm trong Thùng lưu trữ. Hãy khôi phục trước khi chỉnh sửa.'; END IF;
    IF (p->>'revision')::bigint IS DISTINCT FROM old.revision THEN RAISE EXCEPTION 'Mục tiêu đã thay đổi. Vui lòng tải lại.'; END IF;
    typ:=old.period_type;
    IF typ='custom' THEN
      dt:=coalesce(dt, old.period_start);
      de:=coalesce(de, old.period_end);
    ELSE
      dt:=old.period_start; de:=old.period_end;
    END IF;
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
END$fn$;