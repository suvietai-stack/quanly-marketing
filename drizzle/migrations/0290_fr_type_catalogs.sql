-- Danh mục động Loại thanh toán & Loại tạm ứng: một bảng dùng chung theo kind, mã hệ thống ổn định tách tên hiển thị.

ALTER TABLE public.fr_payment_types ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'payment';
ALTER TABLE public.fr_payment_types ADD COLUMN IF NOT EXISTS sys_code text;
ALTER TABLE public.fr_payment_types ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.fr_payment_types DROP CONSTRAINT IF EXISTS fr_payment_types_name_key;
ALTER TABLE public.fr_payment_types ADD CONSTRAINT fr_payment_types_kind_name_key UNIQUE (kind, name);
ALTER TABLE public.fr_payment_types ADD CONSTRAINT fr_payment_types_kind_check CHECK (kind IN ('payment','advance'));

-- Mã hệ thống cho các loại có nghiệp vụ đặc biệt (đổi tên không ảnh hưởng xử lý)
UPDATE public.fr_payment_types SET sys_code = 'settle' WHERE name = 'Quyết toán/hoàn ứng tạm ứng' AND kind = 'payment';
UPDATE public.fr_payment_types SET sys_code = 'other' WHERE name = 'Khác' AND kind = 'payment';
UPDATE public.fr_payment_types SET sys_code = 'supplier' WHERE name = 'Thanh toán nhà cung cấp/đối tác' AND kind = 'payment';

-- Danh mục ban đầu cho Loại tạm ứng
INSERT INTO public.fr_payment_types (kind, name, sort) VALUES
  ('advance', 'Tạm ứng mua hàng', 1),
  ('advance', 'Tạm ứng mua vật tư', 2),
  ('advance', 'Tạm ứng công tác', 3),
  ('advance', 'Tạm ứng chi phí Marketing', 4),
  ('advance', 'Tạm ứng sự kiện', 5),
  ('advance', 'Tạm ứng vận chuyển', 6),
  ('advance', 'Tạm ứng hoạt động công ty', 7)
ON CONFLICT (kind, name) DO NOTHING;
INSERT INTO public.fr_payment_types (kind, name, sort, sys_code) VALUES ('advance', 'Khác', 8, 'other')
ON CONFLICT (kind, name) DO NOTHING;

ALTER TABLE public.fr_requests ADD COLUMN IF NOT EXISTS advance_type_id uuid REFERENCES public.fr_payment_types(id);
ALTER TABLE public.fr_requests ADD COLUMN IF NOT EXISTS other_label text;

-- Lưu danh mục loại (thêm/đổi tên/mô tả/sắp xếp/ngừng dùng) theo quyền Cài đặt của từng chức năng
CREATE OR REPLACE FUNCTION public.fr_type_save(_id uuid, _kind text, _name text, _description text, _active boolean, _sort int) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _new uuid;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF _kind NOT IN ('payment','advance') THEN RAISE EXCEPTION 'Loại danh mục không hợp lệ.'; END IF;
  IF NOT private.sig_can(_uid, private.fr_perm(_kind, 'settings')) THEN
    RAISE EXCEPTION 'Bạn không có quyền cài đặt danh mục của chức năng này.' USING ERRCODE='42501';
  END IF;
  IF length(trim(coalesce(_name,''))) < 1 OR length(_name) > 200 THEN RAISE EXCEPTION 'Tên loại không hợp lệ.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.fr_payment_types(kind, name, description, active, sort, created_by)
    VALUES (_kind, trim(_name), nullif(btrim(coalesce(_description,'')), ''), coalesce(_active, true), coalesce(_sort, 0), _uid)
    RETURNING id INTO _new;
    RETURN _new;
  END IF;
  UPDATE public.fr_payment_types SET name = trim(_name), description = nullif(btrim(coalesce(_description,'')), ''),
    active = coalesce(_active, true), sort = coalesce(_sort, 0)
  WHERE id = _id AND kind = _kind
  RETURNING id INTO _new;
  IF _new IS NULL THEN RAISE EXCEPTION 'Không tìm thấy loại cần sửa.'; END IF;
  RETURN _new;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Đã có loại trùng tên trong chức năng này.';
END $$;
REVOKE ALL ON FUNCTION public.fr_type_save(uuid, text, text, text, boolean, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_type_save(uuid, text, text, text, boolean, int) TO authenticated;

-- Xóa loại: chỉ khi chưa có đề nghị nào sử dụng
CREATE OR REPLACE FUNCTION public.fr_type_delete(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _t public.fr_payment_types;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _t FROM public.fr_payment_types WHERE id = _id;
  IF _t.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy loại cần xóa.'; END IF;
  IF NOT private.sig_can(_uid, private.fr_perm(_t.kind, 'settings')) THEN
    RAISE EXCEPTION 'Bạn không có quyền cài đặt danh mục của chức năng này.' USING ERRCODE='42501';
  END IF;
  IF _t.sys_code IS NOT NULL THEN RAISE EXCEPTION 'Loại này gắn nghiệp vụ hệ thống, chỉ có thể ngừng sử dụng.'; END IF;
  IF EXISTS (SELECT 1 FROM public.fr_requests r WHERE r.payment_type_id = _id OR r.advance_type_id = _id) THEN
    RAISE EXCEPTION 'Loại đã có đề nghị sử dụng — chỉ có thể ngừng sử dụng, không xóa.';
  END IF;
  DELETE FROM public.fr_payment_types WHERE id = _id;
END $$;
REVOKE ALL ON FUNCTION public.fr_type_delete(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_type_delete(uuid) TO authenticated;

-- Danh mục kèm số đề nghị đang dùng (cho màn Cài đặt)
CREATE OR REPLACE FUNCTION public.fr_types_with_usage(_kind text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid, private.fr_perm(_kind, 'settings')) THEN
    RAISE EXCEPTION 'Bạn không có quyền cài đặt danh mục của chức năng này.' USING ERRCODE='42501';
  END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', t.id, 'name', t.name, 'description', t.description, 'active', t.active,
      'sort', t.sort, 'sys_code', t.sys_code,
      'usage', (SELECT count(*) FROM public.fr_requests r WHERE r.payment_type_id = t.id OR r.advance_type_id = t.id)
    ) ORDER BY t.sort, t.name)
    FROM public.fr_payment_types t WHERE t.kind = _kind
  ), '[]'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.fr_types_with_usage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_types_with_usage(text) TO authenticated;

-- fr_save: kiểm tra loại theo mã hệ thống ổn định; hỗ trợ Loại tạm ứng và ô nhập khi chọn Khác
CREATE OR REPLACE FUNCTION public.fr_save(_id uuid, _kind text, _payload jsonb, _request_key text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _req public.fr_requests; _new uuid;
  _amount numeric := nullif(_payload->>'amount','')::numeric;
  _title text := trim(coalesce(_payload->>'title',''));
  _type public.fr_payment_types;
  _lines jsonb := _payload->'lines';
  _line jsonb; _no int := 0; _sum numeric := 0;
  _lname text; _lqty numeric; _lprice numeric;
  _type_id uuid := nullif(_payload->>'payment_type_id','')::uuid;
  _adv_type_id uuid := nullif(_payload->>'advance_type_id','')::uuid;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  PERFORM private.fr_kind_check(_kind);

  IF _lines IS NOT NULL AND jsonb_typeof(_lines) = 'array' THEN
    FOR _line IN SELECT value FROM jsonb_array_elements(_lines) LOOP
      _lname := trim(coalesce(_line->>'name',''));
      _lqty := coalesce(nullif(_line->>'qty','')::numeric, 1);
      _lprice := coalesce(nullif(_line->>'unit_price','')::numeric, 0);
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
    IF _type_id IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn loại thanh toán.'; END IF;
    SELECT * INTO _type FROM public.fr_payment_types WHERE id = _type_id AND kind = 'payment';
    IF _type.id IS NULL THEN RAISE EXCEPTION 'Loại thanh toán không hợp lệ.'; END IF;
    IF NOT _type.active AND (_id IS NULL OR _type_id IS DISTINCT FROM (SELECT payment_type_id FROM public.fr_requests WHERE id = _id)) THEN
      RAISE EXCEPTION 'Loại thanh toán đã ngừng sử dụng — chọn loại khác.';
    END IF;
    IF _type.sys_code = 'other' AND length(trim(coalesce(_payload->>'other_label',''))) = 0 THEN
      RAISE EXCEPTION 'Vui lòng nhập loại cụ thể khi chọn Khác.';
    END IF;
    IF _type.sys_code = 'settle' THEN
      IF nullif(_payload->>'advance_id','') IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn khoản tạm ứng cần quyết toán.'; END IF;
      IF NOT EXISTS (SELECT 1 FROM public.fr_requests a WHERE a.id = (_payload->>'advance_id')::uuid AND a.kind = 'advance' AND a.status = 'settling' AND a.paid_amount > a.settled_amount AND (a.requester_id = _uid OR private.sig_can(_uid,'fr.advance.view_scope'))) THEN
        RAISE EXCEPTION 'Khoản tạm ứng không hợp lệ hoặc đã quyết toán xong.';
      END IF;
    END IF;
  END IF;

  IF _kind = 'advance' THEN
    IF _adv_type_id IS NOT NULL THEN
      SELECT * INTO _type FROM public.fr_payment_types WHERE id = _adv_type_id AND kind = 'advance';
      IF _type.id IS NULL THEN RAISE EXCEPTION 'Loại tạm ứng không hợp lệ.'; END IF;
      IF NOT _type.active AND (_id IS NULL OR _adv_type_id IS DISTINCT FROM (SELECT advance_type_id FROM public.fr_requests WHERE id = _id)) THEN
        RAISE EXCEPTION 'Loại tạm ứng đã ngừng sử dụng — chọn loại khác.';
      END IF;
      IF _type.sys_code = 'other' AND length(trim(coalesce(_payload->>'other_label',''))) = 0 THEN
        RAISE EXCEPTION 'Vui lòng nhập loại cụ thể khi chọn Khác.';
      END IF;
    ELSIF _id IS NULL THEN
      RAISE EXCEPTION 'Vui lòng chọn loại tạm ứng.';
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
    INSERT INTO public.fr_requests(code, kind, requester_id, department_id, amount, title, detail, desired_date, payee_name, payee_info, attachments, note, payment_type_id, advance_id, advance_type_id, other_label, supplier_name, supplier_tax, supplier_bank, invoice_no, salary_period, request_key)
    VALUES (
      (CASE _kind WHEN 'advance' THEN 'TU' WHEN 'payment' THEN 'TT' ELSE 'UL' END) || '-' || lpad(nextval('public.fr_code_seq')::text, 5, '0'),
      _kind, _uid, nullif(_payload->>'department_id','')::uuid, _amount, _title,
      nullif(_payload->>'detail',''), nullif(_payload->>'desired_date','')::date,
      nullif(_payload->>'payee_name',''), nullif(_payload->>'payee_info',''),
      coalesce(_payload->'attachments','[]'::jsonb), nullif(_payload->>'note',''),
      _type_id, nullif(_payload->>'advance_id','')::uuid, _adv_type_id, nullif(_payload->>'other_label',''),
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
    payment_type_id = _type_id, advance_id = nullif(_payload->>'advance_id','')::uuid,
    advance_type_id = _adv_type_id, other_label = nullif(_payload->>'other_label',''),
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

-- fr_report: thêm thống kê theo loại (đếm theo đề nghị, không cộng trùng)
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
      GROUP BY coalesce(c.name, l.name)) t), '[]'::jsonb),
    'by_type', coalesce((SELECT jsonb_agg(jsonb_build_object('name', nm, 'count', c, 'amount', amt, 'approved', apv, 'paid', pd) ORDER BY amt DESC) FROM (
      SELECT coalesce(t.name, 'Chưa phân loại') nm, count(*) c, sum(r5.amount) amt,
        sum(r5.amount) FILTER (WHERE r5.status IN ('awaiting_payment','paid','settling','done')) apv,
        sum(r5.paid_amount) pd
      FROM public.fr_requests r5
      LEFT JOIN public.fr_payment_types t ON t.id = (CASE WHEN _kind = 'advance' THEN r5.advance_type_id ELSE r5.payment_type_id END)
      WHERE r5.kind = _kind AND (_from IS NULL OR r5.created_at::date >= _from) AND (_to IS NULL OR r5.created_at::date <= _to)
      GROUP BY coalesce(t.name, 'Chưa phân loại')) t), '[]'::jsonb)
  ) INTO _result
  FROM public.fr_requests r
  WHERE r.kind = _kind AND (_from IS NULL OR r.created_at::date >= _from) AND (_to IS NULL OR r.created_at::date <= _to);
  RETURN _result;
END $$;