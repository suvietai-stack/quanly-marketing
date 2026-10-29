ALTER TABLE public.leave_requests ADD COLUMN is_late boolean NOT NULL DEFAULT false;
ALTER TABLE public.leave_requests ADD COLUMN late_reason text;
ALTER TABLE public.leave_request_submissions ADD COLUMN is_late boolean NOT NULL DEFAULT false;
ALTER TABLE public.leave_request_submissions ADD COLUMN late_reason text;

-- Quá hạn: cho phép mọi nhân viên gửi đơn bổ sung kèm lý do bắt buộc (không cần quyền ngoại lệ).
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
    IF coalesce(btrim(_exception),'') = '' THEN
      RAISE EXCEPTION 'Đơn đã quá thời hạn đăng ký (hạn cuối gửi: %). Vui lòng nhập "Lý do gửi đơn bổ sung" để người phê duyệt xem xét.', private.leave_fmt(dl);
    END IF;
    late_ok := true;
  END IF;
  RETURN jsonb_build_object('calc', c, 'reason_name', r->>'name', 'deadline', dl, 'exception', late_ok,
    'applied', jsonb_build_object('deadlines', s->'deadlines', 'recall_minutes', s->'recall_minutes',
      'sessions', s->'sessions', 'schedule', s->'schedule', 'session_value', s->'session_value', 'deadline_at', dl));
END $$;

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
  IF EXISTS (SELECT 1 FROM public.leave_requests q WHERE q.owner_id = own AND q.type = _type AND q.status = 'pending' AND q.payload = _payload) THEN
    RAISE EXCEPTION 'Đã có đơn % cùng thời gian đang chờ duyệt. Vui lòng không gửi trùng.', private.leave_type_label(_type);
  END IF;
  p := private.leave_prepare(own, _type, _payload, _reason_id, _detail, _approver, _exception);
  INSERT INTO public.leave_requests(owner_id, created_by, type, approver_id, reason_id, reason_name, detail, payload, calc, mark_at, applied, is_late, late_reason)
  VALUES (own, uid, _type, _approver, _reason_id, p->>'reason_name', nullif(btrim(_detail),''), _payload, p->'calc', (p->'calc'->>'mark_at')::timestamptz, p->'applied',
    (p->>'exception')::boolean, CASE WHEN (p->>'exception')::boolean THEN btrim(_exception) END)
  RETURNING id INTO rid;
  INSERT INTO public.leave_request_submissions(request_id, no, payload, calc, reason_id, reason_name, detail, approver_id, submitted_by, is_late, late_reason)
  VALUES (rid, 1, _payload, p->'calc', _reason_id, p->>'reason_name', nullif(btrim(_detail),''), _approver, uid,
    (p->>'exception')::boolean, CASE WHEN (p->>'exception')::boolean THEN btrim(_exception) END);
  PERFORM private.leave_log(rid, 'submit', jsonb_build_object('approver', _approver, 'on_behalf', own <> uid));
  IF (p->>'exception')::boolean THEN PERFORM private.leave_log(rid, 'exception', jsonb_build_object('kind','late_submit','reason', btrim(_exception))); END IF;
  RETURN rid;
END $$;

DROP FUNCTION public.leave_update(uuid,jsonb,text,text,uuid);
CREATE FUNCTION public.leave_update(_id uuid, _payload jsonb, _reason_id text, _detail text, _approver uuid, _exception text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests; p jsonb;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF NOT ((q.owner_id = uid AND private.sig_can(uid,'leave.edit_own')) OR private.sig_can(uid,'leave.edit_others')) THEN RAISE EXCEPTION 'Bạn không có quyền sửa đơn này.'; END IF;
  IF q.status <> 'pending' THEN RAISE EXCEPTION 'Chỉ sửa được đơn đang Chờ duyệt.'; END IF;
  p := private.leave_prepare(q.owner_id, q.type, _payload, _reason_id, _detail, _approver, _exception);
  PERFORM private.leave_log(_id, 'edit', jsonb_build_object('before', jsonb_build_object('payload', q.payload, 'reason', q.reason_name, 'detail', q.detail, 'approver', q.approver_id, 'calc', q.calc, 'is_late', q.is_late, 'late_reason', q.late_reason)));
  UPDATE public.leave_requests SET payload = _payload, calc = p->'calc', mark_at = (p->'calc'->>'mark_at')::timestamptz, applied = p->'applied',
    reason_id = _reason_id, reason_name = p->>'reason_name', detail = nullif(btrim(_detail),''), approver_id = _approver,
    is_late = (p->>'exception')::boolean, late_reason = CASE WHEN (p->>'exception')::boolean THEN btrim(_exception) END, updated_at = now() WHERE id = _id;
  UPDATE public.leave_request_submissions SET payload = _payload, calc = p->'calc', reason_id = _reason_id, reason_name = p->>'reason_name',
    detail = nullif(btrim(_detail),''), approver_id = _approver,
    is_late = (p->>'exception')::boolean, late_reason = CASE WHEN (p->>'exception')::boolean THEN btrim(_exception) END WHERE request_id = _id AND no = q.submission_no;
END $$;

DROP FUNCTION public.leave_resubmit(uuid,jsonb,text,text,uuid);
CREATE FUNCTION public.leave_resubmit(_id uuid, _payload jsonb, _reason_id text, _detail text, _approver uuid, _exception text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); q public.leave_requests; p jsonb; n int;
BEGIN
  SELECT * INTO q FROM public.leave_requests WHERE id = _id FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đơn.'; END IF;
  IF NOT ((q.owner_id = uid AND private.sig_can(uid,'leave.edit_own')) OR private.sig_can(uid,'leave.edit_others')) THEN RAISE EXCEPTION 'Bạn không có quyền sửa và gửi lại đơn này.'; END IF;
  IF q.status <> 'rejected' THEN RAISE EXCEPTION 'Chỉ gửi lại được đơn đã bị Từ chối.'; END IF;
  p := private.leave_prepare(q.owner_id, q.type, _payload, _reason_id, _detail, _approver, _exception);
  n := q.submission_no + 1;
  INSERT INTO public.leave_request_submissions(request_id, no, payload, calc, reason_id, reason_name, detail, approver_id, submitted_by, is_late, late_reason)
  VALUES (_id, n, _payload, p->'calc', _reason_id, p->>'reason_name', nullif(btrim(_detail),''), _approver, uid,
    (p->>'exception')::boolean, CASE WHEN (p->>'exception')::boolean THEN btrim(_exception) END);
  UPDATE public.leave_requests SET status = 'pending', payload = _payload, calc = p->'calc', mark_at = (p->'calc'->>'mark_at')::timestamptz, applied = p->'applied',
    reason_id = _reason_id, reason_name = p->>'reason_name', detail = nullif(btrim(_detail),''), approver_id = _approver,
    is_late = (p->>'exception')::boolean, late_reason = CASE WHEN (p->>'exception')::boolean THEN btrim(_exception) END,
    submission_no = n, submitted_at = now(), decided_by = NULL, decided_at = NULL, decision_note = NULL, updated_at = now() WHERE id = _id;
  PERFORM private.leave_log(_id, 'resubmit', jsonb_build_object('no', n, 'approver', _approver));
  IF (p->>'exception')::boolean THEN PERFORM private.leave_log(_id, 'exception', jsonb_build_object('kind','late_submit','reason', btrim(_exception))); END IF;
END $$;

REVOKE ALL ON FUNCTION public.leave_update(uuid,jsonb,text,text,uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_resubmit(uuid,jsonb,text,text,uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_update(uuid,jsonb,text,text,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_resubmit(uuid,jsonb,text,text,uuid,text) TO authenticated;