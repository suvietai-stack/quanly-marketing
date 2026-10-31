-- Bước 1 — Chu kỳ báo cáo linh hoạt: cấu hình theo Khối/Hệ/Phòng có ngày hiệu lực, deadline Ngày/Tuần, ranh giới kỳ chính xác.
-- Chưa đổi nghĩa vụ nộp hiện tại; chưa cấu hình thì mặc định Báo cáo Tháng.

-- ===== Cấu hình chu kỳ theo đơn vị (có phiên bản qua effective_from) =====
CREATE TABLE public.biz_report_cycle_configs(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('block','system','department')),
  system_id uuid REFERENCES public.biz_systems(id),
  department_id uuid REFERENCES public.biz_departments(id),
  cycle text NOT NULL CHECK (cycle IN ('day','week','month','quarter')),
  effective_from date NOT NULL,
  workdays jsonb, -- chế độ Ngày: {"1":true,...,"7":false} theo ISO dow; NULL = mọi ngày đều là kỳ
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((scope='block' AND system_id IS NULL AND department_id IS NULL)
      OR (scope='system' AND system_id IS NOT NULL AND department_id IS NULL)
      OR (scope='department' AND department_id IS NOT NULL))
);
CREATE UNIQUE INDEX biz_report_cycle_configs_uq ON public.biz_report_cycle_configs(
  scope, coalesce(system_id,'00000000-0000-0000-0000-000000000000'::uuid), coalesce(department_id,'00000000-0000-0000-0000-000000000000'::uuid), effective_from);
GRANT SELECT ON public.biz_report_cycle_configs TO authenticated;
GRANT ALL ON public.biz_report_cycle_configs TO service_role;
ALTER TABLE public.biz_report_cycle_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY biz_report_cycle_configs_read ON public.biz_report_cycle_configs FOR SELECT TO authenticated
  USING (private.sig_can(auth.uid(),'biz.deadline_manage') OR private.sig_can(auth.uid(),'biz.report_submit')
    OR private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.view_all'));

CREATE TABLE public.biz_report_cycle_config_log(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL CHECK (action IN ('save','delete')),
  config_id uuid,
  old_row jsonb,
  new_row jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.biz_report_cycle_config_log TO authenticated;
GRANT ALL ON public.biz_report_cycle_config_log TO service_role;
ALTER TABLE public.biz_report_cycle_config_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY biz_report_cycle_config_log_read ON public.biz_report_cycle_config_log FOR SELECT TO authenticated
  USING (private.sig_can(auth.uid(),'biz.deadline_manage'));

-- Phòng của nhân viên tại một ngày (mirror biz_period_department theo khoảng ngày).
CREATE FUNCTION public.biz_department_at(_user uuid, _at date) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT m.department_id FROM public.biz_department_members m
  WHERE m.user_id=_user
    AND m.started_at < (((_at + 1)::timestamp) AT TIME ZONE 'Asia/Ho_Chi_Minh')
    AND (m.ended_at IS NULL OR m.ended_at > ((_at::timestamp) AT TIME ZONE 'Asia/Ho_Chi_Minh'))
    AND (m.ended_at IS NULL OR m.ended_at > m.started_at)
  ORDER BY m.started_at DESC, m.id DESC LIMIT 1
$$;

-- Chu kỳ bắt buộc của nhân viên tại một ngày: Phòng → Hệ → Toàn Khối → mặc định Tháng.
CREATE FUNCTION public.biz_report_cycle_of(_user uuid, _at date) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE dep uuid; sys uuid; c text;
BEGIN
  dep:=public.biz_department_at(_user,_at);
  IF dep IS NOT NULL THEN
    SELECT cycle INTO c FROM public.biz_report_cycle_configs
      WHERE scope='department' AND department_id=dep AND effective_from<=_at
      ORDER BY effective_from DESC, created_at DESC LIMIT 1;
    IF c IS NOT NULL THEN RETURN c; END IF;
    SELECT system_id INTO sys FROM public.biz_departments WHERE id=dep;
    IF sys IS NOT NULL THEN
      SELECT cycle INTO c FROM public.biz_report_cycle_configs
        WHERE scope='system' AND system_id=sys AND effective_from<=_at
        ORDER BY effective_from DESC, created_at DESC LIMIT 1;
      IF c IS NOT NULL THEN RETURN c; END IF;
    END IF;
  END IF;
  SELECT cycle INTO c FROM public.biz_report_cycle_configs
    WHERE scope='block' AND effective_from<=_at
    ORDER BY effective_from DESC, created_at DESC LIMIT 1;
  RETURN coalesce(c,'month');
END $$;

-- Lưu cấu hình chu kỳ (ghi đè cùng phạm vi + ngày hiệu lực), có nhật ký.
CREATE FUNCTION public.biz_report_cycle_save(_scope text, _system_id uuid, _department_id uuid, _cycle text, _effective_from date, _workdays jsonb DEFAULT NULL) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE ex public.biz_report_cycle_configs%ROWTYPE; rid uuid;
BEGIN
  IF NOT private.sig_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình chu kỳ báo cáo.'; END IF;
  IF _scope NOT IN ('block','system','department') OR _cycle NOT IN ('day','week','month','quarter') THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  IF (_scope='block' AND (_system_id IS NOT NULL OR _department_id IS NOT NULL))
    OR (_scope='system' AND (_system_id IS NULL OR _department_id IS NOT NULL))
    OR (_scope='department' AND _department_id IS NULL) THEN RAISE EXCEPTION 'Đơn vị áp dụng không khớp phạm vi.'; END IF;
  IF _effective_from IS NULL OR _effective_from < '2020-01-01' THEN RAISE EXCEPTION 'Ngày hiệu lực không hợp lệ.'; END IF;
  IF _workdays IS NOT NULL AND (jsonb_typeof(_workdays)<>'object' OR EXISTS(SELECT 1 FROM jsonb_each(_workdays) e(k,v) WHERE k NOT IN ('1','2','3','4','5','6','7') OR jsonb_typeof(v)<>'boolean')) THEN RAISE EXCEPTION 'Lịch ngày làm việc không hợp lệ.'; END IF;
  SELECT * INTO ex FROM public.biz_report_cycle_configs
    WHERE scope=_scope AND system_id IS NOT DISTINCT FROM _system_id AND department_id IS NOT DISTINCT FROM _department_id AND effective_from=_effective_from;
  IF ex.id IS NOT NULL THEN
    UPDATE public.biz_report_cycle_configs SET cycle=_cycle, workdays=_workdays, updated_at=now() WHERE id=ex.id;
    rid:=ex.id;
    INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,old_row,new_row) VALUES(auth.uid(),'save',ex.id,to_jsonb(ex),to_jsonb((SELECT c FROM public.biz_report_cycle_configs c WHERE c.id=ex.id)));
  ELSE
    INSERT INTO public.biz_report_cycle_configs(scope,system_id,department_id,cycle,effective_from,workdays,created_by)
    VALUES(_scope,_system_id,_department_id,_cycle,_effective_from,_workdays,auth.uid()) RETURNING id INTO rid;
    INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,new_row) VALUES(auth.uid(),'save',rid,to_jsonb((SELECT c FROM public.biz_report_cycle_configs c WHERE c.id=rid)));
  END IF;
  RETURN rid;
END $$;

-- Bỏ cấu hình riêng (quay về kế thừa cấp trên), có nhật ký.
CREATE FUNCTION public.biz_report_cycle_delete(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE ex public.biz_report_cycle_configs%ROWTYPE;
BEGIN
  IF NOT private.sig_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình chu kỳ báo cáo.'; END IF;
  SELECT * INTO ex FROM public.biz_report_cycle_configs WHERE id=_id;
  IF ex.id IS NULL THEN RAISE EXCEPTION 'Cấu hình không tồn tại.'; END IF;
  DELETE FROM public.biz_report_cycle_configs WHERE id=_id;
  INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,old_row) VALUES(auth.uid(),'delete',_id,to_jsonb(ex));
END $$;

REVOKE ALL ON FUNCTION public.biz_department_at(uuid,date),public.biz_report_cycle_of(uuid,date),public.biz_report_cycle_save(text,uuid,uuid,text,date,jsonb),public.biz_report_cycle_delete(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_department_at(uuid,date),public.biz_report_cycle_of(uuid,date),public.biz_report_cycle_save(text,uuid,uuid,text,date,jsonb),public.biz_report_cycle_delete(uuid) TO authenticated;

-- ===== biz_documents: chấp nhận kỳ Ngày/Tuần + ranh giới ngày chính xác =====
ALTER TABLE public.biz_documents ADD COLUMN period_start date, ADD COLUMN period_end date;
ALTER TABLE public.biz_documents DROP CONSTRAINT IF EXISTS biz_documents_period_kind_check;
ALTER TABLE public.biz_documents ADD CONSTRAINT biz_documents_period_kind_check CHECK(period_kind IN ('day','week','month','quarter','year')) NOT VALID;
ALTER TABLE public.biz_documents VALIDATE CONSTRAINT biz_documents_period_kind_check;
ALTER TABLE public.biz_documents DROP CONSTRAINT IF EXISTS biz_documents_period_check;
ALTER TABLE public.biz_documents ADD CONSTRAINT biz_documents_period_check CHECK(period BETWEEN 1 AND 366) NOT VALID;
ALTER TABLE public.biz_documents VALIDATE CONSTRAINT biz_documents_period_check;

-- ===== Deadline cho kỳ Ngày/Tuần: mốc tính theo offset từ ngày kết thúc kỳ =====
-- Ngày kết thúc kỳ: Ngày = chính ngày đó; Tuần = Chủ Nhật (start + 6).
CREATE FUNCTION public.biz_cycle_period_end(_kind text, _period_start date) RETURNS date LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
BEGIN
  IF _kind='report_day' THEN RETURN _period_start; END IF;
  IF _kind='report_week' THEN RETURN _period_start + 6; END IF;
  RAISE EXCEPTION 'Loại kỳ không hợp lệ.';
END $$;

-- Một mốc từ rule {offset_days,hour,minute} tính từ ngày kết thúc kỳ; rule NULL → NULL (không chặn).
CREATE FUNCTION public.biz_cycle_milestone_at(_rule jsonb, _kind text, _period_start date) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE pend date;
BEGIN
  IF _rule IS NULL OR jsonb_typeof(_rule) IS DISTINCT FROM 'object' OR _rule->>'offset_days' IS NULL THEN RETURN NULL; END IF;
  pend:=public.biz_cycle_period_end(_kind,_period_start);
  RETURN ((pend + (_rule->>'offset_days')::int)::timestamp + make_interval(hours=>coalesce((_rule->>'hour')::int,17), mins=>coalesce((_rule->>'minute')::int,0))) AT TIME ZONE 'Asia/Ho_Chi_Minh';
END $$;

-- 3 mốc cho kỳ Ngày/Tuần: {open,due,late_close}; ngoại lệ theo ngày bắt đầu kỳ 'YYYY-MM-DD'.
CREATE FUNCTION public.biz_cycle_milestones(_kind text, _period_start date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; ex jsonb; ek text;
BEGIN
  IF NOT (private.sig_can(auth.uid(),'biz.deadline_manage') OR private.sig_can(auth.uid(),'biz.goal_submit') OR private.sig_can(auth.uid(),'biz.plan_submit') OR private.sig_can(auth.uid(),'biz.report_submit') OR private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.goal_approve')) THEN RAISE EXCEPTION 'Không có quyền xem deadline.'; END IF;
  IF _kind NOT IN ('report_day','report_week') OR _period_start IS NULL OR _period_start < '2000-01-01' OR _period_start > '2200-01-01' THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
  IF _kind='report_week' AND extract(isodow FROM _period_start)<>1 THEN RAISE EXCEPTION 'Kỳ tuần phải bắt đầu từ Thứ Hai.'; END IF;
  ek:=to_char(_period_start,'YYYY-MM-DD');
  SELECT data->_kind INTO r FROM public.biz_deadline_config WHERE id=true;
  IF r IS NULL THEN RETURN jsonb_build_object('open',null,'due',null,'late_close',null); END IF;
  ex:=r->'exceptions'->ek;
  RETURN jsonb_build_object(
    'open', CASE WHEN ex->>'open' IS NOT NULL THEN ((ex->>'open')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_cycle_milestone_at(r->'open',_kind,_period_start) END,
    'due', CASE WHEN ex->>'due' IS NOT NULL THEN ((ex->>'due')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') WHEN jsonb_typeof(ex)='string' THEN ((ex#>>'{}')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_cycle_milestone_at(r->'due',_kind,_period_start) END,
    'late_close', CASE WHEN ex->>'late_close' IS NOT NULL THEN ((ex->>'late_close')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_cycle_milestone_at(r->'late_close',_kind,_period_start) END);
END $$;

-- Pha nộp kỳ Ngày/Tuần: not_open | open | overdue | closed (none khi chưa cấu hình hạn cuối).
CREATE FUNCTION public.biz_cycle_phase(_kind text, _period_start date, _now timestamptz DEFAULT now()) RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE m jsonb; v_open timestamptz; v_due timestamptz; v_close timestamptz;
BEGIN
  m:=public.biz_cycle_milestones(_kind,_period_start);
  v_open:=(m->>'open')::timestamptz; v_due:=(m->>'due')::timestamptz; v_close:=(m->>'late_close')::timestamptz;
  IF v_due IS NULL THEN RETURN 'none'; END IF;
  IF v_open IS NOT NULL AND _now < v_open THEN RETURN 'not_open'; END IF;
  IF v_close IS NOT NULL AND _now > v_close THEN RETURN 'closed'; END IF;
  IF _now > v_due THEN RETURN 'overdue'; END IF;
  RETURN 'open';
END $$;

REVOKE ALL ON FUNCTION public.biz_cycle_milestone_at(jsonb,text,date),public.biz_cycle_milestones(text,date),public.biz_cycle_phase(text,date,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_cycle_milestones(text,date),public.biz_cycle_phase(text,date,timestamptz) TO authenticated;

-- ===== biz_deadline_save: chấp nhận thêm report_day/report_week (rule offset, ngoại lệ theo ngày) =====
CREATE OR REPLACE FUNCTION public.biz_deadline_save(_data jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k text; r jsonb; ek text; ev jsonb; ms text; mr jsonb; y int; p int; pmax int; m jsonb; v_open timestamptz; v_due timestamptz; v_close timestamptz; old jsonb;
BEGIN
  IF NOT private.sig_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý deadline.'; END IF;
  IF jsonb_typeof(_data) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  FOR k,r IN SELECT * FROM jsonb_each(_data) LOOP
    IF k NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year','report_day','report_week') OR jsonb_typeof(r)<>'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
    IF k IN ('report_day','report_week') THEN
      -- Shape mốc theo offset từ ngày kết thúc kỳ: {offset_days 0..62, hour, minute}
      FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
        mr:=r->ms;
        IF mr IS NOT NULL AND mr<>'null'::jsonb THEN
          IF jsonb_typeof(mr)<>'object' THEN RAISE EXCEPTION 'Cấu hình mốc không hợp lệ.'; END IF;
          IF mr->>'offset_days' IS NOT NULL AND ((mr->>'offset_days')::numeric<>trunc((mr->>'offset_days')::numeric) OR (mr->>'offset_days')::int NOT BETWEEN 0 AND 62) THEN RAISE EXCEPTION 'Số ngày lùi phải từ 0 đến 62.'; END IF;
          IF coalesce((mr->>'hour')::int,17) NOT BETWEEN 0 AND 23 OR coalesce((mr->>'minute')::int,0) NOT BETWEEN 0 AND 59 THEN RAISE EXCEPTION 'Giờ không hợp lệ.'; END IF;
        END IF;
      END LOOP;
      IF r ? 'exceptions' THEN
        IF jsonb_typeof(r->'exceptions')<>'object' THEN RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        FOR ek,ev IN SELECT * FROM jsonb_each(r->'exceptions') LOOP
          IF ek !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RAISE EXCEPTION 'Kỳ ngoại lệ không hợp lệ.'; END IF;
          IF jsonb_typeof(ev)='string' THEN PERFORM (ev#>>'{}')::timestamp;
          ELSIF jsonb_typeof(ev)='object' THEN
            FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
              IF ev->>ms IS NOT NULL THEN PERFORM (ev->>ms)::timestamp; END IF;
            END LOOP;
          ELSE RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        END LOOP;
      END IF;
      -- Thứ tự mở < hạn cuối < đóng bù trên kỳ mẫu.
      m:=jsonb_build_object(
        'open', public.biz_cycle_milestone_at(r->'open',k,'2026-11-02'::date),
        'due', public.biz_cycle_milestone_at(r->'due',k,'2026-11-02'::date),
        'late_close', public.biz_cycle_milestone_at(r->'late_close',k,'2026-11-02'::date));
      v_open:=(m->>'open')::timestamptz; v_due:=(m->>'due')::timestamptz; v_close:=(m->>'late_close')::timestamptz;
      IF v_open IS NOT NULL AND v_due IS NOT NULL AND v_open >= v_due THEN RAISE EXCEPTION 'Ngày mở nộp phải trước hạn cuối.'; END IF;
      IF v_due IS NOT NULL AND v_close IS NOT NULL AND v_due >= v_close THEN RAISE EXCEPTION 'Hạn cuối phải trước ngày đóng nộp bù.'; END IF;
      IF v_open IS NOT NULL AND v_close IS NOT NULL AND v_open >= v_close THEN RAISE EXCEPTION 'Ngày mở nộp phải trước ngày đóng nộp bù.'; END IF;
    ELSIF r ? 'due' OR r ? 'open' OR r ? 'late_close' THEN
      FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
        mr:=r->ms;
        IF mr IS NOT NULL AND mr<>'null'::jsonb THEN
          IF jsonb_typeof(mr)<>'object' THEN RAISE EXCEPTION 'Cấu hình mốc không hợp lệ.'; END IF;
          IF mr->>'day' IS NOT NULL AND ((mr->>'day')::numeric<>trunc((mr->>'day')::numeric) OR (mr->>'day')::int NOT BETWEEN 1 AND 31) THEN RAISE EXCEPTION 'Ngày phải từ 1 đến 31.'; END IF;
          IF coalesce(mr->>'phase','during') NOT IN ('before','during','after') OR coalesce((mr->>'hour')::int,17) NOT BETWEEN 0 AND 23 OR coalesce((mr->>'minute')::int,0) NOT BETWEEN 0 AND 59 THEN RAISE EXCEPTION 'Giờ hoặc kiểu thời điểm không hợp lệ.'; END IF;
        END IF;
      END LOOP;
      IF r ? 'exceptions' THEN
        IF jsonb_typeof(r->'exceptions')<>'object' THEN RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        FOR ek,ev IN SELECT * FROM jsonb_each(r->'exceptions') LOOP
          IF ek !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' THEN RAISE EXCEPTION 'Kỳ ngoại lệ không hợp lệ.'; END IF;
          IF jsonb_typeof(ev)='string' THEN PERFORM (ev#>>'{}')::timestamp;
          ELSIF jsonb_typeof(ev)='object' THEN
            FOREACH ms IN ARRAY ARRAY['open','due','late_close'] LOOP
              IF ev->>ms IS NOT NULL THEN PERFORM (ev->>ms)::timestamp; END IF;
            END LOOP;
          ELSE RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        END LOOP;
      END IF;
      pmax:=CASE WHEN k LIKE '%month' THEN 12 WHEN k LIKE '%quarter' THEN 4 ELSE 1 END;
      FOR y IN 2024..2028 LOOP
        FOR p IN 1..pmax LOOP
          m:=jsonb_build_object(
            'open', public.biz_milestone_at(r->'open',k,y,p),
            'due', public.biz_milestone_at(r->'due',k,y,p),
            'late_close', public.biz_cycle_milestone_at(null,k,make_date(y,p,1))); -- placeholder không dùng
          m:=jsonb_build_object(
            'open', public.biz_milestone_at(r->'open',k,y,p),
            'due', public.biz_milestone_at(r->'due',k,y,p),
            'late_close', public.biz_milestone_at(r->'late_close',k,y,p));
          v_open:=(m->>'open')::timestamptz; v_due:=(m->>'due')::timestamptz; v_close:=(m->>'late_close')::timestamptz;
          IF v_open IS NOT NULL AND v_due IS NOT NULL AND v_open >= v_due THEN RAISE EXCEPTION 'Ngày mở nộp phải trước hạn cuối (kiểm tra kỳ %-%).', y, p; END IF;
          IF v_due IS NOT NULL AND v_close IS NOT NULL AND v_due >= v_close THEN RAISE EXCEPTION 'Hạn cuối phải trước ngày đóng nộp bù (kiểm tra kỳ %-%).', y, p; END IF;
          IF v_open IS NOT NULL AND v_close IS NOT NULL AND v_open >= v_close THEN RAISE EXCEPTION 'Ngày mở nộp phải trước ngày đóng nộp bù (kiểm tra kỳ %-%).', y, p; END IF;
        END LOOP;
      END LOOP;
    ELSE
      IF r->>'day' IS NOT NULL AND ((r->>'day')::numeric<>trunc((r->>'day')::numeric) OR (r->>'day')::int NOT BETWEEN 1 AND 31) THEN RAISE EXCEPTION 'Ngày phải từ 1 đến 31.'; END IF;
      IF coalesce(r->>'phase','during') NOT IN ('before','during','after') OR coalesce((r->>'hour')::int,17) NOT BETWEEN 0 AND 23 OR coalesce((r->>'minute')::int,0) NOT BETWEEN 0 AND 59 THEN RAISE EXCEPTION 'Giờ hoặc kiểu deadline không hợp lệ.'; END IF;
      IF r ? 'exceptions' THEN
        IF jsonb_typeof(r->'exceptions')<>'object' THEN RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
        FOR ek,ev IN SELECT * FROM jsonb_each(r->'exceptions') LOOP
          IF ek !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' OR jsonb_typeof(ev)<>'string' THEN RAISE EXCEPTION 'Kỳ ngoại lệ không hợp lệ.'; END IF;
          PERFORM (ev#>>'{}')::timestamp;
        END LOOP;
      END IF;
    END IF;
  END LOOP;
  SELECT data INTO old FROM public.biz_deadline_config WHERE id=true;
  INSERT INTO public.biz_deadline_config(id,data,updated_by,updated_at) VALUES(true,_data,auth.uid(),now()) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_by=excluded.updated_by,updated_at=now();
  INSERT INTO public.biz_deadline_config_log(actor_id,old_data,new_data) VALUES(auth.uid(),coalesce(old,'{}'::jsonb),_data);
END $$;