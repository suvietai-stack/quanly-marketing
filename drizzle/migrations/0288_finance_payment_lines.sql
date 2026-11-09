-- Bảng kê khoản chi có cấu trúc cho Đề Nghị Thanh Toán (dùng chung được cho Tạm Ứng sau này)
CREATE TABLE public.fr_line_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (length(trim(name)) BETWEEN 1 AND 200),
  active boolean NOT NULL DEFAULT true,
  sort int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.fr_line_catalog (name, sort) VALUES
  ('Vận chuyển', 1), ('Mua vật tư', 2), ('In ấn', 3), ('Công tác phí', 4),
  ('Thuê dịch vụ', 5), ('Chi phí sự kiện', 6), ('Chi phí văn phòng', 7), ('Khác', 8)
ON CONFLICT DO NOTHING;

CREATE TABLE public.fr_request_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.fr_requests(id) ON DELETE CASCADE,
  line_no int NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 300),
  catalog_id uuid REFERENCES public.fr_line_catalog(id),
  unit text,
  qty numeric NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price numeric NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  line_total numeric NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, line_no)
);
CREATE INDEX fr_request_lines_request_idx ON public.fr_request_lines(request_id);

GRANT SELECT ON public.fr_line_catalog, public.fr_request_lines TO authenticated;
GRANT ALL ON public.fr_line_catalog, public.fr_request_lines TO service_role;
ALTER TABLE public.fr_line_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fr_request_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY fr_line_catalog_read ON public.fr_line_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY fr_request_lines_read ON public.fr_request_lines FOR SELECT TO authenticated USING (private.fr_can_view(auth.uid(), request_id));

-- Quản lý danh mục khoản chi (quyền Cài đặt Đề Nghị Thanh Toán)
CREATE OR REPLACE FUNCTION public.fr_line_catalog_save(_id uuid, _name text, _active boolean, _sort int) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _new uuid;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid, 'fr.payment.settings') THEN RAISE EXCEPTION 'Bạn không có quyền cài đặt danh mục khoản chi.' USING ERRCODE='42501'; END IF;
  IF length(trim(coalesce(_name,''))) < 1 OR length(_name) > 200 THEN RAISE EXCEPTION 'Tên khoản chi không hợp lệ.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.fr_line_catalog(name, active, sort, created_by) VALUES (trim(_name), coalesce(_active, true), coalesce(_sort, 0), _uid)
    ON CONFLICT (name) DO UPDATE SET active = EXCLUDED.active, sort = EXCLUDED.sort
    RETURNING id INTO _new;
    RETURN _new;
  END IF;
  UPDATE public.fr_line_catalog SET name = trim(_name), active = coalesce(_active, true), sort = coalesce(_sort, 0) WHERE id = _id RETURNING id INTO _new;
  IF _new IS NULL THEN RAISE EXCEPTION 'Không tìm thấy khoản chi danh mục.'; END IF;
  RETURN _new;
END $$;

-- fr_save: hỗ trợ bảng kê khoản chi; backend tự tính thành tiền và tổng tiền, không tin số từ client
CREATE OR REPLACE FUNCTION public.fr_save(_id uuid, _kind text, _payload jsonb, _request_key text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _req public.fr_requests; _new uuid;
  _amount numeric := nullif(_payload->>'amount','')::numeric;
  _title text := trim(coalesce(_payload->>'title',''));
  _type_name text;
  _lines jsonb := _payload->'lines';
  _line jsonb; _no int := 0; _sum numeric := 0;
  _lname text; _lqty numeric; _lprice numeric;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  PERFORM private.fr_kind_check(_kind);

  -- Chế độ bảng kê: chỉ khi client gửi khóa lines (áp dụng cho Đề Nghị Thanh Toán)
  IF _lines IS NOT NULL AND jsonb_typeof(_lines) = 'array' THEN
    FOR _line IN SELECT value FROM jsonb_array_elements(_lines) LOOP
      _lname := trim(coalesce(_line->>'name',''));
      _lqty := coalesce(nullif(_line->>'qty','')::numeric, 1);
      _lprice := coalesce(nullif(_line->>'unit_price','')::numeric, 0);
      -- Bỏ qua dòng hoàn toàn trống; dòng có tên mà thiếu giá thì báo lỗi
      IF _lname = '' AND _lprice <= 0 THEN CONTINUE; END IF;
      IF _lname = '' OR length(_lname) > 300 THEN RAISE EXCEPTION 'Tên khoản chi không hợp lệ.'; END IF;
      IF _lqty <= 0 THEN RAISE EXCEPTION 'Số lượng phải lớn hơn 0.'; END IF;
      IF _lprice <= 0 THEN RAISE EXCEPTION 'Đơn giá của "%" phải lớn hơn 0.', _lname; END IF;
      _no := _no + 1;
      _sum := _sum + round(_lqty * _lprice);
    END LOOP;
    IF _no = 0 THEN RAISE EXCEPTION 'Vui lòng nhập ít nhất một khoản chi hợp lệ.'; END IF;
    _amount := _sum;
  END IF;

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
    IF _lines IS NOT NULL AND jsonb_typeof(_lines) = 'array' THEN
      PERFORM public.fr_lines_replace(_new, _lines);
    END IF;
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
  IF _lines IS NOT NULL AND jsonb_typeof(_lines) = 'array' THEN
    PERFORM public.fr_lines_replace(_id, _lines);
  END IF;
  PERFORM private.fr_event(_id, _uid, 'update', _payload);
  RETURN _id;
END $$;

-- Thay toàn bộ dòng khoản chi của một đề nghị (chỉ được gọi từ fr_save, đã khóa dòng đề nghị)
CREATE OR REPLACE FUNCTION public.fr_lines_replace(_request_id uuid, _lines jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _line jsonb; _no int := 0; _lname text; _lqty numeric; _lprice numeric; _lcat uuid;
BEGIN
  DELETE FROM public.fr_request_lines WHERE request_id = _request_id;
  FOR _line IN SELECT value FROM jsonb_array_elements(_lines) LOOP
    _lname := trim(coalesce(_line->>'name',''));
    _lqty := coalesce(nullif(_line->>'qty','')::numeric, 1);
    _lprice := coalesce(nullif(_line->>'unit_price','')::numeric, 0);
    IF _lname = '' AND _lprice <= 0 THEN CONTINUE; END IF;
    _no := _no + 1;
    _lcat := nullif(_line->>'catalog_id','')::uuid;
    IF _lcat IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.fr_line_catalog WHERE id = _lcat) THEN _lcat := NULL; END IF;
    INSERT INTO public.fr_request_lines(request_id, line_no, name, catalog_id, unit, qty, unit_price, line_total)
    VALUES (_request_id, _no, _lname, _lcat, nullif(trim(coalesce(_line->>'unit','')),''), _lqty, _lprice, round(_lqty * _lprice));
  END LOOP;
END $$;

-- fr_submit: Đề Nghị Thanh Toán mới phải có bảng kê; đề nghị cũ (chưa có dòng) vẫn gửi được nhờ nội dung chi tiết
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

  IF _req.kind = 'payment'
     AND NOT EXISTS (SELECT 1 FROM public.fr_request_lines l WHERE l.request_id = _req.id)
     AND length(trim(coalesce(_req.detail,''))) = 0 THEN
    RAISE EXCEPTION 'Vui lòng nhập ít nhất một khoản chi hợp lệ.';
  END IF;

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

-- fr_report: thêm thống kê theo khoản chi (không nhân trùng tổng đề nghị)
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
    'by_requester', coalesce((SELECT jsonb_agg(jsonb_build_object('requester_id', requester_id, 'count', c, 'amount', amt)) FROM (SELECT requester_id, count(*) c, sum(amount) amt FROM public.fr_requests r3 WHERE r3.kind = _kind AND (_from IS NULL OR r3.created_at::date >= _from) AND (_to IS NULL OR r3.created_at::date <= _to) GROUP BY requester_id) t), '[]'::jsonb),
    'by_line', coalesce((SELECT jsonb_agg(jsonb_build_object('name', nm, 'count', c, 'amount', amt) ORDER BY amt DESC) FROM (
      SELECT coalesce(c.name, l.name) nm, count(*) c, sum(l.line_total) amt
      FROM public.fr_request_lines l
      LEFT JOIN public.fr_line_catalog c ON c.id = l.catalog_id
      JOIN public.fr_requests r4 ON r4.id = l.request_id
      WHERE r4.kind = _kind AND (_from IS NULL OR r4.created_at::date >= _from) AND (_to IS NULL OR r4.created_at::date <= _to)
      GROUP BY coalesce(c.name, l.name)) t), '[]'::jsonb)
  ) INTO _result
  FROM public.fr_requests r
  WHERE r.kind = _kind AND (_from IS NULL OR r.created_at::date >= _from) AND (_to IS NULL OR r.created_at::date <= _to);
  RETURN _result;
END $$;