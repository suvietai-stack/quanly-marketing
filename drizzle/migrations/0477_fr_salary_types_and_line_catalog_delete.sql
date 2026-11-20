-- 2026-11-20: Kế toán (quyền Cài đặt) tự quản lý danh mục.
-- 1) Phân loại Tạm Ứng Lương: dùng chung fr_payment_types với kind='salary_advance', lưu vào fr_requests.advance_type_id;
--    quản lý bằng fr_type_save/fr_type_delete/fr_types_with_usage theo fr.salary.settings (xóa chỉ khi chưa dùng, sys_code chỉ ngừng dùng).
-- 2) Xóa khoản chi mẫu (fr_line_catalog) khi chưa có dòng bảng kê nào tham chiếu; đã dùng thì chỉ Ẩn.
-- Không đổi dữ liệu đề nghị hiện có; đề nghị Tạm Ứng Lương cũ không có phân loại vẫn hiển thị/sửa/gửi được.
BEGIN;
ALTER TABLE public.fr_payment_types DROP CONSTRAINT IF EXISTS fr_payment_types_kind_check;
ALTER TABLE public.fr_payment_types ADD CONSTRAINT fr_payment_types_kind_check CHECK (kind IN ('payment','advance','salary_advance'));

INSERT INTO public.fr_payment_types (kind, name, sort) VALUES
  ('salary_advance', 'Chi tiêu cá nhân/gia đình', 1),
  ('salary_advance', 'Y tế, ốm đau', 2),
  ('salary_advance', 'Học tập', 3)
ON CONFLICT (kind, name) DO NOTHING;
INSERT INTO public.fr_payment_types (kind, name, sort, sys_code) VALUES ('salary_advance', 'Khác', 4, 'other')
ON CONFLICT (kind, name) DO NOTHING;

CREATE OR REPLACE FUNCTION public.fr_type_save(_id uuid, _kind text, _name text, _description text, _active boolean, _sort int) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _new uuid;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF _kind NOT IN ('payment','advance','salary_advance') THEN RAISE EXCEPTION 'Loại danh mục không hợp lệ.'; END IF;
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

  IF _kind = 'salary_advance' THEN
    IF length(trim(coalesce(_payload->>'salary_period',''))) = 0 THEN
      RAISE EXCEPTION 'Vui lòng chọn kỳ lương dự kiến khấu trừ.';
    END IF;
    -- Phân loại Tạm Ứng Lương dùng cột advance_type_id với danh mục kind='salary_advance'.
    IF _adv_type_id IS NOT NULL THEN
      SELECT * INTO _type FROM public.fr_payment_types WHERE id = _adv_type_id AND kind = 'salary_advance';
      IF _type.id IS NULL THEN RAISE EXCEPTION 'Phân loại tạm ứng lương không hợp lệ.'; END IF;
      IF NOT _type.active AND (_id IS NULL OR _adv_type_id IS DISTINCT FROM (SELECT advance_type_id FROM public.fr_requests WHERE id = _id)) THEN
        RAISE EXCEPTION 'Phân loại tạm ứng lương đã ngừng sử dụng — chọn loại khác.';
      END IF;
      IF _type.sys_code = 'other' AND length(trim(coalesce(_payload->>'other_label',''))) = 0 THEN
        RAISE EXCEPTION 'Vui lòng nhập loại cụ thể khi chọn Khác.';
      END IF;
    END IF;
    -- Không bắt buộc ở máy chủ: giao diện cũ (chưa tải bản mới) vẫn gửi được; giao diện mới bắt buộc chọn khi có loại đang dùng.
  END IF;
  -- Đề nghị không thuộc loại có danh mục thì không giữ phân loại tạm ứng.
  IF _kind = 'payment' THEN _adv_type_id := NULL; END IF;

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
      LEFT JOIN public.fr_payment_types t ON t.id = (CASE WHEN _kind IN ('advance','salary_advance') THEN r5.advance_type_id ELSE r5.payment_type_id END)
      WHERE r5.kind = _kind AND (_from IS NULL OR r5.created_at::date >= _from) AND (_to IS NULL OR r5.created_at::date <= _to)
      GROUP BY coalesce(t.name, 'Chưa phân loại')) t), '[]'::jsonb)
  ) INTO _result
  FROM public.fr_requests r
  WHERE r.kind = _kind AND (_from IS NULL OR r.created_at::date >= _from) AND (_to IS NULL OR r.created_at::date <= _to);
  RETURN _result;
END $$;

CREATE OR REPLACE FUNCTION public.fr_line_catalog_delete(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _c public.fr_line_catalog;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid, 'fr.payment.settings') THEN RAISE EXCEPTION 'Bạn không có quyền cài đặt danh mục khoản chi.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _c FROM public.fr_line_catalog WHERE id = _id FOR UPDATE;
  IF _c.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy khoản chi mẫu.'; END IF;
  IF EXISTS (SELECT 1 FROM public.fr_request_lines l WHERE l.catalog_id = _id) THEN
    RAISE EXCEPTION 'Khoản chi mẫu đã được dùng trong bảng kê — chỉ có thể ẩn, không xóa.';
  END IF;
  DELETE FROM public.fr_line_catalog WHERE id = _id;
END $$;
REVOKE ALL ON FUNCTION public.fr_line_catalog_delete(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_line_catalog_delete(uuid) TO authenticated;

-- Số dòng bảng kê đang dùng từng khoản chi mẫu (chỉ người có quyền Cài đặt Thanh toán).
CREATE OR REPLACE FUNCTION public.fr_line_catalog_usage() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid, 'fr.payment.settings') THEN RAISE EXCEPTION 'Bạn không có quyền cài đặt danh mục khoản chi.' USING ERRCODE='42501'; END IF;
  RETURN coalesce((SELECT jsonb_object_agg(c.id, (SELECT count(*) FROM public.fr_request_lines l WHERE l.catalog_id = c.id)) FROM public.fr_line_catalog c), '{}'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.fr_line_catalog_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_line_catalog_usage() TO authenticated;
COMMIT;
