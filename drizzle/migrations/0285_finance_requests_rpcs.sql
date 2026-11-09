CREATE OR REPLACE FUNCTION private.fr_kind_check(_kind text) RETURNS void
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF _kind NOT IN ('advance','payment','salary_advance') THEN RAISE EXCEPTION 'Loại đề nghị không hợp lệ.'; END IF;
END $$;

CREATE OR REPLACE FUNCTION private.fr_perm(_kind text, _action text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT 'fr.' || CASE _kind WHEN 'advance' THEN 'advance' WHEN 'payment' THEN 'payment' ELSE 'salary' END || '.' || _action;
$$;

CREATE OR REPLACE FUNCTION private.fr_event(_req uuid, _actor uuid, _action text, _payload jsonb) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.fr_events(request_id, actor_id, action, payload) VALUES (_req, _actor, _action, _payload);
$$;

CREATE OR REPLACE FUNCTION private.fr_notify_perm(_perm text, _kind text, _req uuid, _key text, _payload jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid;
BEGIN
  FOR _u IN SELECT p.id FROM public.profiles p WHERE private.has_permission(p.id, _perm) LOOP
    PERFORM private.fr_notify(_u, _kind, _req, _key || ':' || _u::text, _payload);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION private.fr_notify_step(_req uuid, _step_no int, _kind text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s public.fr_steps; _r public.fr_requests; _u uuid;
BEGIN
  SELECT * INTO _s FROM public.fr_steps WHERE request_id = _req AND step_no = _step_no;
  IF _s.id IS NULL THEN RETURN; END IF;
  SELECT * INTO _r FROM public.fr_requests WHERE id = _req;
  IF _s.approver_id IS NOT NULL THEN
    PERFORM private.fr_notify(_s.approver_id, _kind, _req, _kind || ':' || _req::text || ':' || _step_no || ':' || _s.approver_id::text,
      jsonb_build_object('code', _r.code, 'title', _r.title, 'amount', _r.amount, 'kind', _r.kind));
  ELSIF _s.perm IS NOT NULL THEN
    FOR _u IN SELECT p.id FROM public.profiles p WHERE private.has_permission(p.id, _s.perm) LOOP
      PERFORM private.fr_notify(_u, _kind, _req, _kind || ':' || _req::text || ':' || _step_no || ':' || _u::text,
        jsonb_build_object('code', _r.code, 'title', _r.title, 'amount', _r.amount, 'kind', _r.kind));
    END LOOP;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fr_save(_id uuid, _kind text, _payload jsonb, _request_key text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _req public.fr_requests; _new uuid;
  _amount numeric := nullif(_payload->>'amount','')::numeric;
  _title text := trim(coalesce(_payload->>'title',''));
  _type_name text;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  PERFORM private.fr_kind_check(_kind);
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Số tiền phải lớn hơn 0.'; END IF;
  IF length(_title) < 1 OR length(_title) > 300 THEN RAISE EXCEPTION 'Vui lòng nhập mục đích/nội dung (tối đa 300 ký tự).'; END IF;
  IF _kind = 'payment' THEN
    IF nullif(_payload->>'payment_type_id','') IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn loại thanh toán.'; END IF;
    IF length(trim(coalesce(_payload->>'payee_name',''))) = 0 THEN RAISE EXCEPTION 'Vui lòng nhập đối tượng nhận tiền.'; END IF;
    SELECT name INTO _type_name FROM public.fr_payment_types WHERE id = (_payload->>'payment_type_id')::uuid AND active;
    IF _type_name IS NULL THEN RAISE EXCEPTION 'Loại thanh toán không hợp lệ.'; END IF;
    IF _type_name = 'Quyết toán/hoàn ứng tạm ứng' THEN
      IF nullif(_payload->>'advance_id','') IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn khoản tạm ứng cần quyết toán.'; END IF;
      IF NOT EXISTS (SELECT 1 FROM public.fr_requests a WHERE a.id = (_payload->>'advance_id')::uuid AND a.kind = 'advance' AND a.status = 'settling' AND a.paid_amount > a.settled_amount AND (a.requester_id = _uid OR private.sig_can(_uid,'fr.advance.view_scope'))) THEN
        RAISE EXCEPTION 'Khoản tạm ứng không hợp lệ hoặc đã quyết toán xong.';
      END IF;
    END IF;
  END IF;
  IF _kind = 'salary_advance' AND length(trim(coalesce(_payload->>'salary_period',''))) = 0 THEN
    RAISE EXCEPTION 'Vui lòng chọn kỳ lương dự kiến khấu trừ.';
  END IF;

  IF _id IS NULL THEN
    IF _request_key IS NOT NULL THEN
      SELECT id INTO _new FROM public.fr_requests WHERE request_key = _request_key;
      IF _new IS NOT NULL THEN RETURN _new; END IF;
    END IF;
    INSERT INTO public.fr_requests(code, kind, requester_id, department_id, amount, title, detail, desired_date, payee_name, payee_info, attachments, note, payment_type_id, advance_id, supplier_name, supplier_tax, supplier_bank, invoice_no, salary_period, request_key)
    VALUES (
      (CASE _kind WHEN 'advance' THEN 'TU' WHEN 'payment' THEN 'TT' ELSE 'UL' END) || '-' || lpad(nextval('public.fr_code_seq')::text, 5, '0'),
      _kind, _uid, nullif(_payload->>'department_id','')::uuid, _amount, _title,
      nullif(_payload->>'detail',''), nullif(_payload->>'desired_date','')::date,
      nullif(_payload->>'payee_name',''), nullif(_payload->>'payee_info',''),
      coalesce(_payload->'attachments','[]'::jsonb), nullif(_payload->>'note',''),
      nullif(_payload->>'payment_type_id','')::uuid, nullif(_payload->>'advance_id','')::uuid,
      nullif(_payload->>'supplier_name',''), nullif(_payload->>'supplier_tax',''), nullif(_payload->>'supplier_bank',''),
      nullif(_payload->>'invoice_no',''), nullif(_payload->>'salary_period',''), _request_key)
    RETURNING id INTO _new;
    PERFORM private.fr_event(_new, _uid, 'create', _payload);
    RETURN _new;
  END IF;

  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL OR _req.requester_id <> _uid THEN RAISE EXCEPTION 'Không tìm thấy đề nghị của bạn.'; END IF;
  IF _req.status NOT IN ('draft','info_requested','needs_config') THEN RAISE EXCEPTION 'Đề nghị đã gửi, không thể sửa. Hãy hủy và tạo lại nếu cần.'; END IF;
  UPDATE public.fr_requests SET
    amount = _amount, title = _title, detail = nullif(_payload->>'detail',''),
    desired_date = nullif(_payload->>'desired_date','')::date,
    payee_name = nullif(_payload->>'payee_name',''), payee_info = nullif(_payload->>'payee_info',''),
    attachments = coalesce(_payload->'attachments','[]'::jsonb), note = nullif(_payload->>'note',''),
    payment_type_id = nullif(_payload->>'payment_type_id','')::uuid, advance_id = nullif(_payload->>'advance_id','')::uuid,
    supplier_name = nullif(_payload->>'supplier_name',''), supplier_tax = nullif(_payload->>'supplier_tax',''),
    supplier_bank = nullif(_payload->>'supplier_bank',''), invoice_no = nullif(_payload->>'invoice_no',''),
    salary_period = nullif(_payload->>'salary_period',''), updated_at = now()
  WHERE id = _id;
  PERFORM private.fr_event(_id, _uid, 'update', _payload);
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.fr_submit(_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _req public.fr_requests; _cfg public.fr_settings;
  _step jsonb; _n int := 0; _open int;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL OR _req.requester_id <> _uid THEN RAISE EXCEPTION 'Không tìm thấy đề nghị của bạn.'; END IF;
  IF _req.status NOT IN ('draft','info_requested','needs_config') THEN RAISE EXCEPTION 'Đề nghị đã được gửi hoặc đã xử lý.'; END IF;
  SELECT * INTO _cfg FROM public.fr_settings WHERE kind = _req.kind;

  IF _req.kind = 'salary_advance' THEN
    IF coalesce((_cfg.limits->>'require_reason')::boolean, false) AND length(trim(_req.title)) = 0 THEN
      RAISE EXCEPTION 'Vui lòng nhập lý do tạm ứng.'; END IF;
    IF nullif(_cfg.limits->>'max_amount','') IS NOT NULL AND _req.amount > (_cfg.limits->>'max_amount')::numeric THEN
      RAISE EXCEPTION 'Số tiền vượt mức tối đa mỗi lần cho phép.'; END IF;
    IF nullif(_cfg.limits->>'max_per_period','') IS NOT NULL THEN
      SELECT count(*) INTO _open FROM public.fr_requests
      WHERE kind = 'salary_advance' AND requester_id = _uid AND salary_period = _req.salary_period
        AND status NOT IN ('draft','cancelled','rejected') AND id <> _req.id;
      IF _open >= (_cfg.limits->>'max_per_period')::int THEN
        RAISE EXCEPTION 'Bạn đã đạt số lượt đề nghị tối đa trong kỳ lương này.'; END IF;
    END IF;
    IF coalesce((_cfg.limits->>'block_open')::boolean, false) AND EXISTS (
      SELECT 1 FROM public.fr_requests WHERE kind = 'salary_advance' AND requester_id = _uid
        AND status IN ('pending','info_requested','approved','awaiting_payment','paid') AND id <> _req.id) THEN
      RAISE EXCEPTION 'Bạn còn đề nghị tạm ứng lương chưa tất toán.';
    END IF;
  END IF;

  DELETE FROM public.fr_steps WHERE request_id = _id;
  FOR _step IN SELECT value FROM jsonb_array_elements(coalesce(_cfg.flow,'[]'::jsonb)) LOOP
    IF nullif(_step->>'user_id','') IS NOT NULL OR nullif(_step->>'perm','') IS NOT NULL THEN
      _n := _n + 1;
      INSERT INTO public.fr_steps(request_id, step_no, label, approver_id, perm)
      VALUES (_id, _n, coalesce(nullif(_step->>'label',''), 'Cấp duyệt ' || _n), nullif(_step->>'user_id','')::uuid, nullif(_step->>'perm',''));
    END IF;
  END LOOP;

  IF _n = 0 THEN
    UPDATE public.fr_requests SET status = 'needs_config', current_step = 0, updated_at = now() WHERE id = _id;
    PERFORM private.fr_event(_id, _uid, 'needs_config', NULL);
    PERFORM private.fr_notify_perm(private.fr_perm(_req.kind,'settings'), 'fr_pending', _id, 'fr_needcfg:' || _id::text,
      jsonb_build_object('code', _req.code, 'title', _req.title, 'amount', _req.amount, 'kind', _req.kind));
    RETURN 'needs_config';
  END IF;

  UPDATE public.fr_requests SET status = 'pending', current_step = 1, submitted_at = now(), updated_at = now() WHERE id = _id;
  PERFORM private.fr_event(_id, _uid, 'submit', jsonb_build_object('steps', _n));
  PERFORM private.fr_notify_step(_id, 1, 'fr_pending');
  RETURN 'pending';
END $$;

CREATE OR REPLACE FUNCTION public.fr_decide(_id uuid, _action text, _comment text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _req public.fr_requests; _s public.fr_steps; _allow_self boolean;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF _action NOT IN ('approve','reject','info') THEN RAISE EXCEPTION 'Hành động không hợp lệ.'; END IF;
  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đề nghị.'; END IF;
  IF _req.status <> 'pending' THEN RAISE EXCEPTION 'Đề nghị không ở trạng thái chờ duyệt.'; END IF;
  SELECT * INTO _s FROM public.fr_steps WHERE request_id = _id AND step_no = _req.current_step FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy bước duyệt hiện tại.'; END IF;
  IF NOT (_s.approver_id = _uid OR (_s.approver_id IS NULL AND _s.perm IS NOT NULL AND private.has_permission(_uid, _s.perm))) THEN
    RAISE EXCEPTION 'Bạn không phải người duyệt ở bước này.' USING ERRCODE='42501'; END IF;
  SELECT coalesce((limits->>'allow_self_approve')::boolean, false) INTO _allow_self FROM public.fr_settings WHERE kind = _req.kind;
  IF _uid = _req.requester_id AND NOT _allow_self THEN
    RAISE EXCEPTION 'Người tạo không được tự phê duyệt đề nghị của mình.'; END IF;
  IF _action IN ('reject','info') AND length(trim(coalesce(_comment,''))) = 0 THEN
    RAISE EXCEPTION 'Vui lòng nhập lý do/nội dung cần bổ sung.'; END IF;

  UPDATE public.fr_steps SET status = CASE _action WHEN 'approve' THEN 'approved' WHEN 'reject' THEN 'rejected' ELSE 'info_requested' END,
    comment = nullif(_comment,''), decided_by = _uid, decided_at = now() WHERE id = _s.id;

  IF _action = 'reject' THEN
    UPDATE public.fr_requests SET status = 'rejected', updated_at = now() WHERE id = _id;
    PERFORM private.fr_event(_id, _uid, 'reject', jsonb_build_object('step', _s.step_no, 'comment', _comment));
    PERFORM private.fr_notify(_req.requester_id, 'fr_rejected', _id, 'fr_rejected:' || _id::text || ':' || _s.step_no,
      jsonb_build_object('code', _req.code, 'title', _req.title, 'comment', _comment));
  ELSIF _action = 'info' THEN
    UPDATE public.fr_requests SET status = 'info_requested', updated_at = now() WHERE id = _id;
    PERFORM private.fr_event(_id, _uid, 'info', jsonb_build_object('step', _s.step_no, 'comment', _comment));
    PERFORM private.fr_notify(_req.requester_id, 'fr_info', _id, 'fr_info:' || _id::text || ':' || _s.step_no,
      jsonb_build_object('code', _req.code, 'title', _req.title, 'comment', _comment));
  ELSE
    IF EXISTS (SELECT 1 FROM public.fr_steps WHERE request_id = _id AND step_no = _req.current_step + 1) THEN
      UPDATE public.fr_requests SET current_step = current_step + 1, updated_at = now() WHERE id = _id;
      PERFORM private.fr_event(_id, _uid, 'approve_step', jsonb_build_object('step', _s.step_no, 'comment', _comment));
      PERFORM private.fr_notify_step(_id, _req.current_step + 1, 'fr_pending');
    ELSE
      UPDATE public.fr_requests SET status = 'awaiting_payment', approved_at = now(), updated_at = now() WHERE id = _id;
      PERFORM private.fr_event(_id, _uid, 'approved', jsonb_build_object('comment', _comment));
      PERFORM private.fr_notify(_req.requester_id, 'fr_approved', _id, 'fr_approved:' || _id::text,
        jsonb_build_object('code', _req.code, 'title', _req.title, 'amount', _req.amount));
      PERFORM private.fr_notify_perm(private.fr_perm(_req.kind,'pay'), 'fr_awaiting_pay', _id, 'fr_awaiting_pay:' || _id::text,
        jsonb_build_object('code', _req.code, 'title', _req.title, 'amount', _req.amount, 'kind', _req.kind));
    END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fr_cancel(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _req public.fr_requests;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL OR _req.requester_id <> _uid THEN RAISE EXCEPTION 'Không tìm thấy đề nghị của bạn.'; END IF;
  IF _req.status NOT IN ('draft','needs_config','pending','info_requested') THEN RAISE EXCEPTION 'Đề nghị đã được xử lý, không thể hủy.'; END IF;
  UPDATE public.fr_requests SET status = 'cancelled', updated_at = now() WHERE id = _id;
  PERFORM private.fr_event(_id, _uid, 'cancel', NULL);
END $$;

CREATE OR REPLACE FUNCTION public.fr_pay(_id uuid, _amount numeric, _method text, _ref text, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _req public.fr_requests; _adv public.fr_requests; _new_paid numeric;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đề nghị.'; END IF;
  IF NOT private.sig_can(_uid, private.fr_perm(_req.kind,'pay')) THEN RAISE EXCEPTION 'Bạn không có quyền xác nhận chi tiền.' USING ERRCODE='42501'; END IF;
  IF _req.status <> 'awaiting_payment' AND NOT (_req.status = 'paid' AND _req.paid_amount < _req.amount) THEN
    RAISE EXCEPTION 'Đề nghị không ở trạng thái chờ chi tiền.'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Số tiền chi phải lớn hơn 0.'; END IF;
  _new_paid := _req.paid_amount + _amount;
  IF _new_paid > _req.amount THEN RAISE EXCEPTION 'Tổng tiền chi vượt số tiền đã duyệt.'; END IF;

  UPDATE public.fr_requests SET
    paid_amount = _new_paid, paid_at = now(), paid_by = _uid,
    pay_method = nullif(_method,''), pay_ref = nullif(_ref,''),
    status = CASE WHEN _new_paid >= amount THEN
        CASE kind WHEN 'advance' THEN 'settling' WHEN 'payment' THEN 'done' ELSE 'paid' END
      ELSE status END,
    updated_at = now()
  WHERE id = _id;
  PERFORM private.fr_event(_id, _uid, 'pay', jsonb_build_object('amount', _amount, 'paid_total', _new_paid, 'method', _method, 'ref', _ref, 'note', _note));
  PERFORM private.fr_notify(_req.requester_id, 'fr_paid', _id, 'fr_paid:' || _id::text || ':' || _new_paid::text,
    jsonb_build_object('code', _req.code, 'title', _req.title, 'paid', _new_paid, 'amount', _req.amount));

  IF _req.kind = 'payment' AND _req.advance_id IS NOT NULL AND _new_paid >= _req.amount THEN
    SELECT * INTO _adv FROM public.fr_requests WHERE id = _req.advance_id FOR UPDATE;
    IF _adv.id IS NOT NULL AND _adv.status = 'settling' THEN
      UPDATE public.fr_requests SET settled_amount = settled_amount + _req.amount,
        status = CASE WHEN settled_amount + _req.amount >= paid_amount THEN 'done' ELSE status END,
        updated_at = now()
      WHERE id = _adv.id;
      PERFORM private.fr_event(_adv.id, _uid, 'settle', jsonb_build_object('payment_code', _req.code, 'amount', _req.amount));
      PERFORM private.fr_notify(_adv.requester_id, 'fr_settle', _adv.id, 'fr_settle:' || _adv.id::text || ':' || _req.id::text,
        jsonb_build_object('code', _adv.code, 'title', _adv.title, 'settled', _adv.settled_amount + _req.amount, 'paid', _adv.paid_amount));
    END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fr_deduct(_id uuid, _amount numeric, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _req public.fr_requests; _new numeric;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL OR _req.kind <> 'salary_advance' THEN RAISE EXCEPTION 'Không tìm thấy đề nghị tạm ứng lương.'; END IF;
  IF NOT private.sig_can(_uid, 'fr.salary.deduct') THEN RAISE EXCEPTION 'Bạn không có quyền xác nhận khấu trừ.' USING ERRCODE='42501'; END IF;
  IF _req.status <> 'paid' THEN RAISE EXCEPTION 'Đề nghị chưa được chi hoặc đã tất toán.'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Số tiền khấu trừ phải lớn hơn 0.'; END IF;
  _new := _req.deducted_amount + _amount;
  IF _new > _req.paid_amount THEN RAISE EXCEPTION 'Tổng khấu trừ vượt số tiền đã ứng.'; END IF;
  UPDATE public.fr_requests SET deducted_amount = _new,
    status = CASE WHEN _new >= paid_amount THEN 'done' ELSE status END, updated_at = now()
  WHERE id = _id;
  PERFORM private.fr_event(_id, _uid, 'deduct', jsonb_build_object('amount', _amount, 'deducted_total', _new, 'note', _note));
  PERFORM private.fr_notify(_req.requester_id, 'fr_deducted', _id, 'fr_deducted:' || _id::text || ':' || _new::text,
    jsonb_build_object('code', _req.code, 'deducted', _new, 'paid', _req.paid_amount));
END $$;

CREATE OR REPLACE FUNCTION public.fr_settings_save(_kind text, _flow jsonb, _limits jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  PERFORM private.fr_kind_check(_kind);
  IF NOT private.sig_can(_uid, private.fr_perm(_kind,'settings')) THEN RAISE EXCEPTION 'Bạn không có quyền cài đặt chức năng này.' USING ERRCODE='42501'; END IF;
  IF _flow IS NOT NULL AND jsonb_typeof(_flow) <> 'array' THEN RAISE EXCEPTION 'Quy trình duyệt không hợp lệ.'; END IF;
  UPDATE public.fr_settings SET flow = coalesce(_flow, flow), limits = coalesce(_limits, limits), updated_by = _uid, updated_at = now()
  WHERE kind = _kind;
END $$;

CREATE OR REPLACE FUNCTION public.fr_payment_type_save(_id uuid, _name text, _active boolean, _sort int) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _out uuid;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid, 'fr.payment.settings') THEN RAISE EXCEPTION 'Bạn không có quyền cài đặt.' USING ERRCODE='42501'; END IF;
  IF length(trim(coalesce(_name,''))) < 1 THEN RAISE EXCEPTION 'Vui lòng nhập tên loại thanh toán.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.fr_payment_types(name, active, sort, created_by) VALUES (trim(_name), coalesce(_active,true), coalesce(_sort,0), _uid) RETURNING id INTO _out;
  ELSE
    UPDATE public.fr_payment_types SET name = trim(_name), active = coalesce(_active,true), sort = coalesce(_sort,0) WHERE id = _id RETURNING id INTO _out;
    IF _out IS NULL THEN RAISE EXCEPTION 'Loại thanh toán không tồn tại.'; END IF;
  END IF;
  RETURN _out;
END $$;

CREATE OR REPLACE FUNCTION public.fr_settle_options() RETURNS TABLE(id uuid, code text, title text, paid_amount numeric, settled_amount numeric, remaining numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, a.code, a.title, a.paid_amount, a.settled_amount, a.paid_amount - a.settled_amount
  FROM public.fr_requests a
  WHERE a.kind = 'advance' AND a.status = 'settling' AND a.paid_amount > a.settled_amount
    AND (a.requester_id = auth.uid() OR private.sig_can(auth.uid(), 'fr.advance.view_scope'))
  ORDER BY a.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.fr_report(_kind text, _from date, _to date) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _result jsonb;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  PERFORM private.fr_kind_check(_kind);
  IF NOT private.sig_can(_uid, private.fr_perm(_kind,'report')) THEN RAISE EXCEPTION 'Bạn không có quyền xem báo cáo chức năng này.' USING ERRCODE='42501'; END IF;
  SELECT jsonb_build_object(
    'total', count(*),
    'amount', coalesce(sum(amount),0),
    'approved_amount', coalesce(sum(amount) FILTER (WHERE status IN ('awaiting_payment','paid','settling','done')),0),
    'paid_amount', coalesce(sum(paid_amount),0),
    'settled_amount', coalesce(sum(settled_amount),0),
    'deducted_amount', coalesce(sum(deducted_amount),0),
    'pending_count', count(*) FILTER (WHERE status = 'pending'),
    'awaiting_pay_count', count(*) FILTER (WHERE status = 'awaiting_payment'),
    'open_settle_count', count(*) FILTER (WHERE status = 'settling'),
    'open_deduct_count', count(*) FILTER (WHERE kind = 'salary_advance' AND status = 'paid'),
    'by_status', coalesce((SELECT jsonb_object_agg(status, c) FROM (SELECT status, count(*) c FROM public.fr_requests r2 WHERE r2.kind = _kind AND (_from IS NULL OR r2.created_at::date >= _from) AND (_to IS NULL OR r2.created_at::date <= _to) GROUP BY status) s), '{}'::jsonb),
    'by_requester', coalesce((SELECT jsonb_agg(jsonb_build_object('requester_id', requester_id, 'count', c, 'amount', amt)) FROM (SELECT requester_id, count(*) c, sum(amount) amt FROM public.fr_requests r3 WHERE r3.kind = _kind AND (_from IS NULL OR r3.created_at::date >= _from) AND (_to IS NULL OR r3.created_at::date <= _to) GROUP BY requester_id) t), '[]'::jsonb)
  ) INTO _result
  FROM public.fr_requests r
  WHERE r.kind = _kind AND (_from IS NULL OR r.created_at::date >= _from) AND (_to IS NULL OR r.created_at::date <= _to);
  RETURN _result;
END $$;