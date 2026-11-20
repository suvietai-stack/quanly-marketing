-- Cho phép hoàn ứng không liên kết tạm ứng trước đó.
-- Giữ nguyên ràng buộc hợp lệ nếu người dùng chủ động chọn tạm ứng.
-- fr_pay đã chỉ đối trừ khi advance_id IS NOT NULL.
BEGIN;
CREATE OR REPLACE FUNCTION public.fr_save(_id uuid, _kind text, _payload jsonb, _request_key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    IF _type.sys_code = 'settle' AND nullif(_payload->>'advance_id','') IS NOT NULL THEN
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
END $function$
;
NOTIFY pgrst, 'reload schema';
COMMIT;
