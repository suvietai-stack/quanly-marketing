
CREATE TABLE public.leave_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leave_settings TO authenticated;
GRANT ALL ON public.leave_settings TO service_role;
ALTER TABLE public.leave_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_settings read" ON public.leave_settings FOR SELECT TO authenticated USING (true);

CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  created_by uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('leave','late','early')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','recalled','cancelled')),
  cancel_state text CHECK (cancel_state IN ('requested','rejected')),
  cancel_reason text,
  approver_id uuid NOT NULL,
  reason_id text NOT NULL,
  reason_name text NOT NULL,
  detail text,
  payload jsonb NOT NULL,
  calc jsonb NOT NULL,
  mark_at timestamptz NOT NULL,
  applied jsonb NOT NULL,
  submission_no int NOT NULL DEFAULT 1,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leave_requests_owner_idx ON public.leave_requests(owner_id);
CREATE INDEX leave_requests_approver_idx ON public.leave_requests(approver_id, status);
GRANT SELECT ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_requests read" ON public.leave_requests FOR SELECT TO authenticated USING (
  (owner_id = auth.uid() AND private.sig_can(auth.uid(),'leave.view_own'))
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'leave.create_for'))
  OR (approver_id = auth.uid() AND (private.sig_can(auth.uid(),'leave.view_assigned') OR private.sig_can(auth.uid(),'leave.approve')))
  OR private.sig_can(auth.uid(),'leave.view_all')
);

CREATE TABLE public.leave_request_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  no int NOT NULL,
  payload jsonb NOT NULL,
  calc jsonb NOT NULL,
  reason_id text NOT NULL,
  reason_name text NOT NULL,
  detail text,
  approver_id uuid NOT NULL,
  submitted_by uuid NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  result text,
  decided_by uuid,
  decided_at timestamptz,
  note text,
  UNIQUE (request_id, no)
);
GRANT SELECT ON public.leave_request_submissions TO authenticated;
GRANT ALL ON public.leave_request_submissions TO service_role;
ALTER TABLE public.leave_request_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_subs read" ON public.leave_request_submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leave_requests r WHERE r.id = request_id));

CREATE TABLE public.leave_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leave_events_req_idx ON public.leave_request_events(request_id, created_at);
GRANT SELECT ON public.leave_request_events TO authenticated;
GRANT ALL ON public.leave_request_events TO service_role;
ALTER TABLE public.leave_request_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_events read" ON public.leave_request_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.leave_requests r WHERE r.id = request_id));

-- ===== helpers =====
CREATE OR REPLACE FUNCTION private.leave_default_settings() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object(
    'schedule', jsonb_build_object(
      '1', jsonb_build_object('am',true,'pm',true), '2', jsonb_build_object('am',true,'pm',true),
      '3', jsonb_build_object('am',true,'pm',true), '4', jsonb_build_object('am',true,'pm',true),
      '5', jsonb_build_object('am',true,'pm',true), '6', jsonb_build_object('am',true,'pm',false),
      '7', jsonb_build_object('am',false,'pm',false)),
    'sessions', jsonb_build_object('am', jsonb_build_object('start',null,'end',null), 'pm', jsonb_build_object('start',null,'end',null)),
    'session_value', 0.5,
    'holidays', '[]'::jsonb,
    'deadlines', jsonb_build_object('leave_hours',12,'late_minutes',5,'early_minutes',5),
    'recall_minutes', jsonb_build_object('leave',0,'late',0,'early',0),
    'reasons', jsonb_build_array(
      jsonb_build_object('id','r1','name','Việc cá nhân','active',true),
      jsonb_build_object('id','r2','name','Việc gia đình','active',true),
      jsonb_build_object('id','r3','name','Có việc đột xuất','active',true),
      jsonb_build_object('id','r4','name','Bản thân bị ốm','active',true),
      jsonb_build_object('id','r5','name','Khám chữa bệnh','active',true),
      jsonb_build_object('id','r6','name','Chăm sóc người thân bị ốm','active',true),
      jsonb_build_object('id','r7','name','Hiếu, hỷ','active',true),
      jsonb_build_object('id','r8','name','Đưa đón con','active',true),
      jsonb_build_object('id','r9','name','Sự cố giao thông','active',true),
      jsonb_build_object('id','r10','name','Sự cố phương tiện','active',true),
      jsonb_build_object('id','r11','name','Ảnh hưởng thời tiết','active',true),
      jsonb_build_object('id','r12','name','Nghỉ ngơi, du lịch','active',true),
      jsonb_build_object('id','r13','name','Giải quyết thủ tục hành chính','active',true),
      jsonb_build_object('id','other','name','Lý do khác','active',true))
  );
$$;

CREATE OR REPLACE FUNCTION private.leave_settings_current() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce((SELECT data FROM public.leave_settings WHERE id = 1), private.leave_default_settings());
$$;

CREATE OR REPLACE FUNCTION private.leave_err(_m text) RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('ok', false, 'error', _m);
$$;

CREATE OR REPLACE FUNCTION private.leave_eval(_type text, _p jsonb, _s jsonb) RETURNS jsonb
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  tz text := 'Asia/Ho_Chi_Minh';
  d date; d1 date; d2 date; h1 text; h2 text; dw text;
  am boolean; pm boolean; hol boolean;
  cnt int := 0; details jsonb := '[]'::jsonb; first_mark timestamptz;
  sv numeric := coalesce((_s->>'session_value')::numeric, 0.5);
  s_start time; s_end time; mins int; half text; mark timestamptz; ex timestamptz;
BEGIN
  IF _type = 'leave' THEN
    BEGIN
      d1 := (_p->>'start_date')::date; d2 := (_p->>'end_date')::date;
    EXCEPTION WHEN others THEN RETURN private.leave_err('Ngày không hợp lệ.');
    END;
    h1 := _p->>'start_half'; h2 := _p->>'end_half';
    IF d1 IS NULL OR d2 IS NULL OR coalesce(h1,'') NOT IN ('am','pm') OR coalesce(h2,'') NOT IN ('am','pm') THEN
      RETURN private.leave_err('Vui lòng chọn đủ ngày và buổi bắt đầu/kết thúc.');
    END IF;
    IF d2 < d1 OR (d2 = d1 AND h1 = 'pm' AND h2 = 'am') THEN
      RETURN private.leave_err('Thời điểm kết thúc phải sau thời điểm bắt đầu.');
    END IF;
    IF d2 - d1 > 92 THEN RETURN private.leave_err('Một đơn nghỉ tối đa 92 ngày.'); END IF;
    d := d1;
    WHILE d <= d2 LOOP
      dw := extract(isodow FROM d)::int::text;
      hol := EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(_s->'holidays','[]'::jsonb)) x WHERE x->>'date' = d::text);
      am := NOT hol AND coalesce((_s->'schedule'->dw->>'am')::boolean, false) AND (d > d1 OR h1 = 'am');
      pm := NOT hol AND coalesce((_s->'schedule'->dw->>'pm')::boolean, false) AND (d < d2 OR h2 = 'pm');
      IF am OR pm THEN
        cnt := cnt + am::int + pm::int;
        details := details || jsonb_build_array(jsonb_build_object('date', d, 'am', am, 'pm', pm, 'days', (am::int + pm::int) * sv));
        IF first_mark IS NULL THEN
          s_start := nullif(_s->'sessions'->(CASE WHEN am THEN 'am' ELSE 'pm' END)->>'start','')::time;
          IF s_start IS NULL THEN
            RETURN private.leave_err('Chưa cấu hình giờ bắt đầu buổi ' || CASE WHEN am THEN 'sáng' ELSE 'chiều' END || ' trong Cài đặt → Đơn từ & Phê duyệt. Vui lòng liên hệ Hành chính.');
          END IF;
          first_mark := (d + s_start) AT TIME ZONE tz;
        END IF;
      END IF;
      d := d + 1;
    END LOOP;
    IF cnt = 0 THEN
      RETURN private.leave_err('Khoảng thời gian đã chọn không có buổi làm việc nào theo lịch của công ty.');
    END IF;
    RETURN jsonb_build_object('ok', true, 'mark_at', first_mark, 'days', cnt * sv, 'sessions', cnt, 'details', details);
  ELSIF _type IN ('late','early') THEN
    BEGIN
      d := (_p->>'date')::date; mins := (_p->>'minutes')::int;
    EXCEPTION WHEN others THEN RETURN private.leave_err('Ngày hoặc số phút không hợp lệ.');
    END;
    half := _p->>'half';
    IF d IS NULL OR coalesce(half,'') NOT IN ('am','pm') THEN RETURN private.leave_err('Vui lòng chọn ngày và buổi làm việc.'); END IF;
    IF mins IS NULL OR mins < 1 OR mins > 480 THEN RETURN private.leave_err('Số phút phải từ 1 đến 480.'); END IF;
    dw := extract(isodow FROM d)::int::text;
    hol := EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(_s->'holidays','[]'::jsonb)) x WHERE x->>'date' = d::text);
    IF hol OR NOT coalesce((_s->'schedule'->dw->>half)::boolean, false) THEN
      RETURN private.leave_err('Buổi đã chọn không phải buổi làm việc theo lịch của công ty.');
    END IF;
    s_start := nullif(_s->'sessions'->half->>'start','')::time;
    s_end := nullif(_s->'sessions'->half->>'end','')::time;
    IF s_start IS NULL OR s_end IS NULL THEN
      RETURN private.leave_err('Chưa cấu hình giờ bắt đầu/kết thúc buổi ' || CASE WHEN half='am' THEN 'sáng' ELSE 'chiều' END || ' trong Cài đặt. Vui lòng liên hệ Hành chính.');
    END IF;
    IF _type = 'late' THEN
      mark := (d + s_start) AT TIME ZONE tz;
      ex := mark + make_interval(mins => mins);
      IF ex >= (d + s_end) AT TIME ZONE tz THEN
        RETURN private.leave_err('Thời gian đi muộn vượt quá giờ kết thúc buổi (' || to_char(s_end,'HH24:MI') || '). Hãy tạo đơn nghỉ phép.');
      END IF;
    ELSE
      ex := (d + s_end) AT TIME ZONE tz - make_interval(mins => mins);
      IF ex <= (d + s_start) AT TIME ZONE tz THEN
        RETURN private.leave_err('Thời gian về sớm vượt quá giờ bắt đầu buổi (' || to_char(s_start,'HH24:MI') || '). Hãy tạo đơn nghỉ phép.');
      END IF;
      mark := ex;
    END IF;
    RETURN jsonb_build_object('ok', true, 'mark_at', mark, 'minutes', mins, 'expected_at', ex,
      'session_start', to_char(s_start,'HH24:MI'), 'session_end', to_char(s_end,'HH24:MI'));
  END IF;
  RETURN private.leave_err('Loại đơn không hợp lệ.');
END $$;

CREATE OR REPLACE FUNCTION private.leave_deadline(_type text, _mark timestamptz, _s jsonb) RETURNS timestamptz
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _type
    WHEN 'leave' THEN _mark - make_interval(hours => coalesce((_s->'deadlines'->>'leave_hours')::int, 12))
    WHEN 'late' THEN _mark - make_interval(mins => coalesce((_s->'deadlines'->>'late_minutes')::int, 5))
    ELSE _mark - make_interval(mins => coalesce((_s->'deadlines'->>'early_minutes')::int, 5)) END;
$$;

CREATE OR REPLACE FUNCTION private.leave_fmt(_t timestamptz) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT to_char(_t AT TIME ZONE 'Asia/Ho_Chi_Minh', 'HH24:MI "ngày" DD/MM/YYYY');
$$;

CREATE OR REPLACE FUNCTION private.leave_type_label(_t text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _t WHEN 'leave' THEN 'NGHỈ PHÉP' WHEN 'late' THEN 'ĐI MUỘN' ELSE 'VỀ SỚM' END;
$$;

-- Validate everything; raises on error; returns {calc, reason_name, applied}
CREATE OR REPLACE FUNCTION private.leave_prepare(_owner uuid, _type text, _payload jsonb, _reason_id text, _detail text, _approver uuid, _exception text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s jsonb := private.leave_settings_current();
  r jsonb; c jsonb; dl timestamptz; late_ok boolean := false;
BEGIN
  SELECT x INTO r FROM jsonb_array_elements(s->'reasons') x WHERE x->>'id' = _reason_id;
  IF r IS NULL OR NOT coalesce((r->>'active')::boolean, true) THEN RAISE EXCEPTION 'Vui lòng chọn lý do hợp lệ.'; END IF;
  IF _reason_id = 'other' AND coalesce(btrim(_detail),'') = '' THEN RAISE EXCEPTION 'Đã chọn "Lý do khác" thì phải nhập chi tiết lý do.'; END IF;
  IF _approver IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn người phê duyệt.'; END IF;
  IF _approver = _owner THEN RAISE EXCEPTION 'Không thể chọn chính người đứng tên đơn làm người phê duyệt.'; END IF;
  IF NOT private.sig_can(_approver, 'leave.approve') THEN RAISE EXCEPTION 'Người được chọn không có quyền Phê duyệt đơn hoặc tài khoản không hoạt động.'; END IF;
  c := private.leave_eval(_type, _payload, s);
  IF NOT (c->>'ok')::boolean THEN RAISE EXCEPTION '%', c->>'error'; END IF;
  dl := private.leave_deadline(_type, (c->>'mark_at')::timestamptz, s);
  IF now() > dl THEN
    IF coalesce(btrim(_exception),'') <> '' AND private.sig_can(auth.uid(), 'leave.exception') THEN
      late_ok := true;
    ELSE
      RAISE EXCEPTION 'KHÔNG THỂ GỬI ĐƠN %. Theo quy định, đơn phải gửi trước %. Thời điểm mốc: %. Hạn cuối gửi: %. Đơn đã quá thời hạn đăng ký, vui lòng liên hệ người quản lý nếu có trường hợp đặc biệt.',
        private.leave_type_label(_type),
        CASE _type WHEN 'leave' THEN 'ít nhất ' || (s->'deadlines'->>'leave_hours') || ' giờ'
          WHEN 'late' THEN 'giờ bắt đầu ca ít nhất ' || (s->'deadlines'->>'late_minutes') || ' phút'
          ELSE 'giờ dự kiến ra về ít nhất ' || (s->'deadlines'->>'early_minutes') || ' phút' END,
        private.leave_fmt((c->>'mark_at')::timestamptz), private.leave_fmt(dl);
    END IF;
  END IF;
  RETURN jsonb_build_object('calc', c, 'reason_name', r->>'name', 'deadline', dl, 'exception', late_ok,
    'applied', jsonb_build_object('deadlines', s->'deadlines', 'recall_minutes', s->'recall_minutes',
      'sessions', s->'sessions', 'schedule', s->'schedule', 'session_value', s->'session_value', 'deadline_at', dl));
END $$;

CREATE OR REPLACE FUNCTION private.leave_log(_id uuid, _action text, _detail jsonb) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.leave_request_events(request_id, actor_id, action, detail) VALUES (_id, auth.uid(), _action, coalesce(_detail,'{}'::jsonb));
$$;

-- ===== public RPCs =====
CREATE OR REPLACE FUNCTION public.leave_settings_get() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN auth.uid() IS NULL THEN NULL ELSE private.leave_settings_current() END;
$$;

CREATE OR REPLACE FUNCTION public.leave_settings_save(_data jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE names text[];
BEGIN
  IF NOT private.sig_can(auth.uid(), 'leave.settings') THEN RAISE EXCEPTION 'Bạn không có quyền Quản lý cài đặt đơn từ.'; END IF;
  IF jsonb_typeof(_data->'reasons') <> 'array' OR jsonb_typeof(_data->'schedule') <> 'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  SELECT array_agg(lower(btrim(x->>'name'))) INTO names FROM jsonb_array_elements(_data->'reasons') x;
  IF EXISTS (SELECT 1 FROM unnest(names) n WHERE coalesce(n,'') = '') THEN RAISE EXCEPTION 'Tên lý do không được để trống.'; END IF;
  IF (SELECT count(DISTINCT n) FROM unnest(names) n) <> coalesce(array_length(names,1),0) THEN RAISE EXCEPTION 'Danh mục lý do có tên trùng nhau.'; END IF;
  -- used reasons cannot disappear
  IF EXISTS (SELECT 1 FROM public.leave_requests q WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_data->'reasons') x WHERE x->>'id' = q.reason_id)
             UNION ALL SELECT 1 FROM public.leave_request_submissions q WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_data->'reasons') x WHERE x->>'id' = q.reason_id)) THEN
    RAISE EXCEPTION 'Không thể xóa lý do đã được dùng trong đơn — hãy chọn Ngừng sử dụng.';
  END IF;
  INSERT INTO public.leave_settings(id, data, updated_by, updated_at) VALUES (1, _data, auth.uid(), now())
  ON CONFLICT (id) DO UPDATE SET data = excluded.data, updated_by = excluded.updated_by, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.leave_reason_usage(_id text) RETURNS int LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.sig_can(auth.uid(), 'leave.settings') THEN RAISE EXCEPTION 'Bạn không có quyền Quản lý cài đặt đơn từ.'; END IF;
  RETURN (SELECT count(*) FROM public.leave_request_submissions WHERE reason_id = _id)
       + (SELECT count(*) FROM public.leave_requests WHERE reason_id = _id);
END $$;

CREATE OR REPLACE FUNCTION public.leave_approvers() RETURNS TABLE(id uuid, full_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND private.is_active(auth.uid())
    AND private.sig_can(p.id, 'leave.approve') ORDER BY p.full_name;
$$;

CREATE OR REPLACE FUNCTION public.leave_submit(_owner uuid, _type text, _payload jsonb, _reason_id text, _detail text, _approver uuid, _exception text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); own uuid := coalesce(_owner, auth.uid()); p jsonb; rid uuid;
BEGIN
  IF own = uid THEN
    IF NOT private.sig_can(uid, 'leave.create') THEN RAISE EXCEPTION 'Bạn không có quyền Tạo đơn cá nhân.'; END IF;
  ELSE
    IF NOT private.sig_can(uid, 'leave.create_for') THEN RAISE EXCEPTION 'Bạn không có quyền Tạo đơn hộ.'; END IF;
    IF NOT private.is_active(own) THEN RAISE EXCEPTION 'Nhân viên đứng tên không còn hoạt động.'; END IF;
  END IF;
  p := private.leave_prepare(own, _type, _payload, _reason_id, _detail, _approver, _exception);
  INSERT INTO public.leave_requests(owner_id, created_by, type, approver_id, reason_id, reason_name, detail, payload, calc, mark_at, applied)
  VALUES (own, uid, _type, _approver, _reason_id, p->>'reason_name', nullif(btrim(_detail),''), _payload, p->'calc', (p->'calc'->>'mark_at')::timestamptz, p->'applied')
  RETURNING id INTO rid;
  INSERT INTO public.leave_request_submissions(request_id, no, payload, calc, reason_id, reason_name, detail, approver_id, submitted_by)
  VALUES (rid, 1, _payload, p->'calc', _reason_id, p->>'reason_name', nullif(btrim(_detail),''), _approver, uid);
  PERFORM private.leave_log(rid, 'submit', jsonb_build_object('approver', _approver, 'on_behalf', own <> uid));
  IF (p->>'exception')::boolean THEN PERFORM private.leave_log(rid, 'exception', jsonb_build_object('kind','late_submit','reason', _exception)); END IF;
  RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.leave_update(_id uuid, _payload jsonb, _reason_id text, _detail text, _approver uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests; p jsonb;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF NOT ((q.owner_id = uid AND private.sig_can(uid,'leave.edit_own')) OR private.sig_can(uid,'leave.edit_others')) THEN RAISE EXCEPTION 'Bạn không có quyền sửa đơn này.'; END IF;
  IF q.status <> 'pending' THEN RAISE EXCEPTION 'Chỉ sửa được đơn đang Chờ duyệt.'; END IF;
  p := private.leave_prepare(q.owner_id, q.type, _payload, _reason_id, _detail, _approver, NULL);
  PERFORM private.leave_log(_id, 'edit', jsonb_build_object('before', jsonb_build_object('payload', q.payload, 'reason', q.reason_name, 'detail', q.detail, 'approver', q.approver_id, 'calc', q.calc)));
  UPDATE public.leave_requests SET payload = _payload, calc = p->'calc', mark_at = (p->'calc'->>'mark_at')::timestamptz, applied = p->'applied',
    reason_id = _reason_id, reason_name = p->>'reason_name', detail = nullif(btrim(_detail),''), approver_id = _approver, updated_at = now() WHERE id = _id;
  UPDATE public.leave_request_submissions SET payload = _payload, calc = p->'calc', reason_id = _reason_id, reason_name = p->>'reason_name',
    detail = nullif(btrim(_detail),''), approver_id = _approver WHERE request_id = _id AND no = q.submission_no;
END $$;

CREATE OR REPLACE FUNCTION public.leave_resubmit(_id uuid, _payload jsonb, _reason_id text, _detail text, _approver uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests; p jsonb; n int;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF NOT ((q.owner_id = uid AND private.sig_can(uid,'leave.edit_own')) OR private.sig_can(uid,'leave.edit_others')) THEN RAISE EXCEPTION 'Bạn không có quyền sửa và gửi lại đơn này.'; END IF;
  IF q.status <> 'rejected' THEN RAISE EXCEPTION 'Chỉ gửi lại được đơn đã bị Từ chối.'; END IF;
  p := private.leave_prepare(q.owner_id, q.type, _payload, _reason_id, _detail, _approver, NULL);
  n := q.submission_no + 1;
  INSERT INTO public.leave_request_submissions(request_id, no, payload, calc, reason_id, reason_name, detail, approver_id, submitted_by)
  VALUES (_id, n, _payload, p->'calc', _reason_id, p->>'reason_name', nullif(btrim(_detail),''), _approver, uid);
  UPDATE public.leave_requests SET status = 'pending', payload = _payload, calc = p->'calc', mark_at = (p->'calc'->>'mark_at')::timestamptz, applied = p->'applied',
    reason_id = _reason_id, reason_name = p->>'reason_name', detail = nullif(btrim(_detail),''), approver_id = _approver,
    submission_no = n, submitted_at = now(), decided_by = NULL, decided_at = NULL, decision_note = NULL, updated_at = now() WHERE id = _id;
  PERFORM private.leave_log(_id, 'resubmit', jsonb_build_object('no', n, 'approver', _approver));
END $$;

CREATE OR REPLACE FUNCTION public.leave_decide(_id uuid, _approve boolean, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF NOT private.sig_can(uid, 'leave.approve') THEN RAISE EXCEPTION 'Bạn không có quyền Phê duyệt đơn.'; END IF;
  IF q.owner_id = uid THEN RAISE EXCEPTION 'Không thể tự phê duyệt đơn đứng tên chính mình.'; END IF;
  IF q.approver_id <> uid THEN RAISE EXCEPTION 'Bạn không phải người đang được chỉ định duyệt đơn này.'; END IF;
  IF q.status <> 'pending' THEN RAISE EXCEPTION 'Đơn không còn ở trạng thái Chờ duyệt (đã xử lý, thu hồi hoặc hủy).'; END IF;
  IF NOT _approve AND coalesce(btrim(_note),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do từ chối.'; END IF;
  UPDATE public.leave_requests SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
    decided_by = uid, decided_at = now(), decision_note = nullif(btrim(_note),''), updated_at = now() WHERE id = _id;
  UPDATE public.leave_request_submissions SET result = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
    decided_by = uid, decided_at = now(), note = nullif(btrim(_note),'') WHERE request_id = _id AND no = q.submission_no;
  PERFORM private.leave_log(_id, CASE WHEN _approve THEN 'approve' ELSE 'reject' END, jsonb_build_object('note', nullif(btrim(_note),'')));
END $$;

CREATE OR REPLACE FUNCTION public.leave_recall(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests; lim timestamptz;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF q.owner_id <> uid OR NOT private.sig_can(uid, 'leave.recall') THEN RAISE EXCEPTION 'Bạn không có quyền thu hồi đơn này.'; END IF;
  IF q.status <> 'pending' THEN RAISE EXCEPTION 'Chỉ thu hồi được đơn đang Chờ duyệt.'; END IF;
  lim := q.mark_at - make_interval(mins => coalesce((private.leave_settings_current()->'recall_minutes'->>q.type)::int, 0));
  IF now() >= lim THEN RAISE EXCEPTION 'Đã quá thời hạn thu hồi (%).', private.leave_fmt(lim); END IF;
  UPDATE public.leave_requests SET status = 'recalled', updated_at = now() WHERE id = _id;
  UPDATE public.leave_request_submissions SET result = 'recalled', decided_by = uid, decided_at = now() WHERE request_id = _id AND no = q.submission_no;
  PERFORM private.leave_log(_id, 'recall', '{}'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.leave_cancel_request(_id uuid, _reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF q.owner_id <> uid OR NOT private.sig_can(uid, 'leave.view_own') THEN RAISE EXCEPTION 'Chỉ chủ đơn mới được yêu cầu hủy.'; END IF;
  IF q.status <> 'approved' THEN RAISE EXCEPTION 'Chỉ yêu cầu hủy được đơn Đã duyệt.'; END IF;
  IF q.cancel_state = 'requested' THEN RAISE EXCEPTION 'Đơn đang có yêu cầu hủy chờ xử lý.'; END IF;
  IF now() >= q.mark_at THEN RAISE EXCEPTION 'Đã qua thời điểm đăng ký, không thể yêu cầu hủy theo quy trình thông thường. Vui lòng liên hệ Hành chính.'; END IF;
  IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do yêu cầu hủy.'; END IF;
  UPDATE public.leave_requests SET cancel_state = 'requested', cancel_reason = btrim(_reason), updated_at = now() WHERE id = _id;
  PERFORM private.leave_log(_id, 'cancel_request', jsonb_build_object('reason', btrim(_reason)));
END $$;

CREATE OR REPLACE FUNCTION public.leave_cancel_decide(_id uuid, _approve boolean, _note text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF q.owner_id = uid THEN RAISE EXCEPTION 'Không thể tự xử lý yêu cầu hủy đơn của chính mình.'; END IF;
  IF NOT private.sig_can(uid, 'leave.cancel_handle') OR NOT (q.approver_id = uid OR private.sig_can(uid, 'leave.view_all')) THEN
    RAISE EXCEPTION 'Bạn không có quyền xử lý yêu cầu hủy đơn này.'; END IF;
  IF q.status <> 'approved' OR q.cancel_state IS DISTINCT FROM 'requested' THEN RAISE EXCEPTION 'Đơn không có yêu cầu hủy đang chờ.'; END IF;
  IF NOT _approve AND coalesce(btrim(_note),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do từ chối yêu cầu hủy.'; END IF;
  IF _approve THEN
    UPDATE public.leave_requests SET status = 'cancelled', cancel_state = NULL, updated_at = now() WHERE id = _id;
  ELSE
    UPDATE public.leave_requests SET cancel_state = 'rejected', updated_at = now() WHERE id = _id;
  END IF;
  PERFORM private.leave_log(_id, CASE WHEN _approve THEN 'cancel_approve' ELSE 'cancel_reject' END, jsonb_build_object('note', nullif(btrim(_note),'')));
END $$;

CREATE OR REPLACE FUNCTION public.leave_reassign(_id uuid, _approver uuid, _note text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF NOT private.sig_can(uid, 'leave.reassign') THEN RAISE EXCEPTION 'Bạn không có quyền Chuyển người duyệt.'; END IF;
  IF q.status <> 'pending' THEN RAISE EXCEPTION 'Chỉ chuyển người duyệt cho đơn đang Chờ duyệt.'; END IF;
  IF _approver = q.owner_id THEN RAISE EXCEPTION 'Không thể giao cho chính người đứng tên đơn.'; END IF;
  IF _approver = q.approver_id THEN RAISE EXCEPTION 'Người này đang là người duyệt.'; END IF;
  IF NOT private.sig_can(_approver, 'leave.approve') THEN RAISE EXCEPTION 'Người được chọn không có quyền Phê duyệt đơn.'; END IF;
  UPDATE public.leave_requests SET approver_id = _approver, updated_at = now() WHERE id = _id;
  UPDATE public.leave_request_submissions SET approver_id = _approver WHERE request_id = _id AND no = q.submission_no;
  PERFORM private.leave_log(_id, 'reassign', jsonb_build_object('from', q.approver_id, 'to', _approver, 'note', nullif(btrim(_note),'')));
END $$;

CREATE OR REPLACE FUNCTION public.leave_exception_cancel(_id uuid, _reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF NOT private.sig_can(uid, 'leave.exception') THEN RAISE EXCEPTION 'Bạn không có quyền Xử lý ngoại lệ đơn từ.'; END IF;
  IF q.owner_id = uid THEN RAISE EXCEPTION 'Không thể tự xử lý ngoại lệ cho đơn của chính mình.'; END IF;
  IF q.status NOT IN ('approved','pending') THEN RAISE EXCEPTION 'Chỉ hủy ngoại lệ được đơn Chờ duyệt hoặc Đã duyệt.'; END IF;
  IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Bắt buộc ghi rõ lý do xử lý ngoại lệ.'; END IF;
  UPDATE public.leave_requests SET status = 'cancelled', cancel_state = NULL, updated_at = now() WHERE id = _id;
  IF q.status = 'pending' THEN
    UPDATE public.leave_request_submissions SET result = 'cancelled', decided_by = uid, decided_at = now(), note = btrim(_reason) WHERE request_id = _id AND no = q.submission_no;
  END IF;
  PERFORM private.leave_log(_id, 'exception', jsonb_build_object('kind','cancel','reason', btrim(_reason), 'from_status', q.status));
END $$;

REVOKE ALL ON FUNCTION public.leave_settings_get() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_settings_save(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_reason_usage(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_approvers() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_submit(uuid,text,jsonb,text,text,uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_update(uuid,jsonb,text,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_resubmit(uuid,jsonb,text,text,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_decide(uuid,boolean,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_recall(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_cancel_request(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_cancel_decide(uuid,boolean,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_reassign(uuid,uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_exception_cancel(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_settings_get(), public.leave_settings_save(jsonb), public.leave_reason_usage(text), public.leave_approvers(),
  public.leave_submit(uuid,text,jsonb,text,text,uuid,text), public.leave_update(uuid,jsonb,text,text,uuid), public.leave_resubmit(uuid,jsonb,text,text,uuid),
  public.leave_decide(uuid,boolean,text), public.leave_recall(uuid), public.leave_cancel_request(uuid,text), public.leave_cancel_decide(uuid,boolean,text),
  public.leave_reassign(uuid,uuid,text), public.leave_exception_cancel(uuid,text) TO authenticated;
