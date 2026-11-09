CREATE OR REPLACE FUNCTION public.fr_decide(_id uuid, _action text, _comment text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _req public.fr_requests; _s public.fr_steps; _allow_self boolean;
  _eligible boolean;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF _action NOT IN ('approve','reject','info') THEN RAISE EXCEPTION 'Hành động không hợp lệ.'; END IF;
  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy đề nghị.'; END IF;
  IF _req.status <> 'pending' THEN RAISE EXCEPTION 'Đề nghị không ở trạng thái chờ duyệt.'; END IF;
  SELECT * INTO _s FROM public.fr_steps WHERE request_id = _id AND step_no = _req.current_step FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy bước duyệt hiện tại.'; END IF;
  _eligible := coalesce(_s.approver_id = _uid, false)
    OR (_s.approver_id IS NULL AND _s.perm IS NOT NULL AND coalesce(private.has_permission(_uid, _s.perm), false));
  IF NOT _eligible THEN RAISE EXCEPTION 'Bạn không phải người duyệt ở bước này.' USING ERRCODE='42501'; END IF;
  SELECT coalesce((limits->>'allow_self_approve')::boolean, false) INTO _allow_self FROM public.fr_settings WHERE kind = _req.kind;
  IF _uid = _req.requester_id AND NOT coalesce(_allow_self, false) THEN
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