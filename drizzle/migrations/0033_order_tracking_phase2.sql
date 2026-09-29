CREATE TABLE public.ot_reschedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.ot_orders(id),
  parent_id uuid REFERENCES public.ot_reschedules(id),
  from_date date NOT NULL,
  proposed_date date NOT NULL,
  reason text NOT NULL CHECK (length(trim(reason)) BETWEEN 1 AND 1000),
  side text NOT NULL CHECK (side IN ('sale','supply')),
  proposer_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','countered','withdrawn')),
  responder_id uuid,
  response_note text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ot_resch_order_idx ON public.ot_reschedules(order_id);
CREATE UNIQUE INDEX ot_resch_one_pending ON public.ot_reschedules(order_id) WHERE status = 'pending';
GRANT SELECT ON public.ot_reschedules TO authenticated;
GRANT ALL ON public.ot_reschedules TO service_role;
ALTER TABLE public.ot_reschedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY ot_resch_read ON public.ot_reschedules FOR SELECT TO authenticated USING (private.ot_can_view(auth.uid(), order_id));

ALTER TABLE public.ot_tasks ADD COLUMN IF NOT EXISTS contact_date date;

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS ot_order_id uuid REFERENCES public.ot_orders(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY[
  'signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc',
  'att_witness','att_new','att_result','att_changed','att_submitted',
  'content_assigned','content_review','content_revise','content_approved','content_published','content_remind',
  'order_new','order_assigned','order_taken','order_review','order_revise','order_approved','order_delivered','order_remind',
  'oq_new','oq_accepted','oq_info','oq_answered','oq_published','oq_done','oq_reask','oq_assigned',
  'ot_reschedule','ot_reschedule_result'
]::text[]));

CREATE OR REPLACE FUNCTION private.ot_notify(_rcpt uuid, _kind text, _order uuid, _key text, _payload jsonb) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications(recipient_id, kind, ot_order_id, dedup_key, payload, zalo_status, push_status)
  SELECT _rcpt, _kind, _order, _key, _payload, 'ineligible', 'none'
  WHERE _rcpt IS NOT NULL AND _rcpt IS DISTINCT FROM auth.uid()
  ON CONFLICT (dedup_key) DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION public.ot_reschedule_propose(_order uuid, _date date, _reason text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o public.ot_orders; _uid uuid := auth.uid(); _side text; _id uuid; _today date := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  SELECT * INTO _o FROM public.ot_orders WHERE id = _order FOR UPDATE;
  IF _o.id IS NULL OR NOT private.ot_can_view(_uid, _order) THEN RAISE EXCEPTION 'Không tìm thấy đơn hàng.'; END IF;
  IF NOT private.sig_can(_uid,'ot.reschedule_propose') THEN RAISE EXCEPTION 'Bạn không có quyền đề xuất điều chỉnh lịch.'; END IF;
  IF _uid = _o.sale_id THEN _side := 'sale'; ELSIF _uid = _o.supply_id THEN _side := 'supply';
  ELSE RAISE EXCEPTION 'Chỉ Kinh doanh hoặc Cung ứng phụ trách đơn mới được đề xuất điều chỉnh lịch.'; END IF;
  IF _o.sale_id IS NULL OR _o.supply_id IS NULL THEN RAISE EXCEPTION 'Đơn cần có đủ Kinh doanh và Cung ứng phụ trách.'; END IF;
  IF _o.status NOT IN ('new','in_progress') THEN RAISE EXCEPTION 'Đơn đã kết thúc, không thể điều chỉnh lịch.'; END IF;
  IF _date IS NULL OR _date < _today THEN RAISE EXCEPTION 'Ngày đề xuất không được trước hôm nay.'; END IF;
  IF _date = _o.due_date THEN RAISE EXCEPTION 'Ngày đề xuất trùng ngày khách nhận hiện tại.'; END IF;
  IF length(trim(coalesce(_reason,''))) = 0 THEN RAISE EXCEPTION 'Vui lòng nhập lý do điều chỉnh.'; END IF;
  IF EXISTS (SELECT 1 FROM public.ot_reschedules WHERE order_id = _order AND status = 'pending') THEN
    RAISE EXCEPTION 'Đơn đang có một đề xuất chờ phản hồi.'; END IF;
  INSERT INTO public.ot_reschedules(order_id, from_date, proposed_date, reason, side, proposer_id)
    VALUES (_order, _o.due_date, _date, trim(_reason), _side, _uid) RETURNING id INTO _id;
  PERFORM private.ot_log(_order, NULL, 'reschedule_propose', jsonb_build_object('due_date', _o.due_date), jsonb_build_object('due_date', _date), trim(_reason));
  PERFORM private.ot_notify(CASE WHEN _side = 'sale' THEN _o.supply_id ELSE _o.sale_id END, 'ot_reschedule', _order, 'ot_resch:'||_id,
    jsonb_build_object('code', _o.code, 'title', _o.title, 'from', _o.due_date, 'to', _date));
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.ot_reschedule_reply(_id uuid, _decision text, _counter date, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _r public.ot_reschedules; _o public.ot_orders; _uid uuid := auth.uid(); _other uuid; _nid uuid;
  _today date := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
  SELECT * INTO _r FROM public.ot_reschedules WHERE id = _id FOR UPDATE;
  IF _r.id IS NULL OR NOT private.ot_can_view(_uid, _r.order_id) THEN RAISE EXCEPTION 'Không tìm thấy đề xuất.'; END IF;
  SELECT * INTO _o FROM public.ot_orders WHERE id = _r.order_id FOR UPDATE;
  IF _r.status <> 'pending' THEN RAISE EXCEPTION 'Đề xuất đã được xử lý.'; END IF;
  IF NOT private.sig_can(_uid,'ot.reschedule_reply') THEN RAISE EXCEPTION 'Bạn không có quyền phản hồi điều chỉnh lịch.'; END IF;
  _other := CASE WHEN _r.side = 'sale' THEN _o.supply_id ELSE _o.sale_id END;
  IF _uid IS DISTINCT FROM _other THEN RAISE EXCEPTION 'Chỉ bên còn lại của đơn mới được phản hồi đề xuất này.'; END IF;
  IF _o.status NOT IN ('new','in_progress') THEN RAISE EXCEPTION 'Đơn đã kết thúc.'; END IF;
  IF _o.due_date <> _r.from_date THEN RAISE EXCEPTION 'Ngày khách nhận đã thay đổi sau khi đề xuất, vui lòng đề xuất lại.'; END IF;
  IF _decision = 'accept' THEN
    UPDATE public.ot_reschedules SET status='accepted', responder_id=_uid, response_note=nullif(trim(coalesce(_note,'')),''), responded_at=now() WHERE id=_id;
    UPDATE public.ot_orders SET due_date = _r.proposed_date, updated_at = now() WHERE id = _o.id;
    PERFORM private.ot_log(_o.id, NULL, 'reschedule_accept', jsonb_build_object('due_date', _o.due_date), jsonb_build_object('due_date', _r.proposed_date), _note);
  ELSIF _decision = 'reject' THEN
    IF length(trim(coalesce(_note,''))) = 0 THEN RAISE EXCEPTION 'Vui lòng nhập lý do từ chối.'; END IF;
    UPDATE public.ot_reschedules SET status='rejected', responder_id=_uid, response_note=trim(_note), responded_at=now() WHERE id=_id;
    PERFORM private.ot_log(_o.id, NULL, 'reschedule_reject', NULL, jsonb_build_object('proposed', _r.proposed_date), _note);
  ELSIF _decision = 'counter' THEN
    IF _counter IS NULL OR _counter < _today OR _counter = _r.proposed_date OR _counter = _o.due_date THEN
      RAISE EXCEPTION 'Ngày đề xuất lại không hợp lệ.'; END IF;
    IF length(trim(coalesce(_note,''))) = 0 THEN RAISE EXCEPTION 'Vui lòng nhập lý do đề xuất ngày khác.'; END IF;
    UPDATE public.ot_reschedules SET status='countered', responder_id=_uid, response_note=trim(_note), responded_at=now() WHERE id=_id;
    INSERT INTO public.ot_reschedules(order_id, parent_id, from_date, proposed_date, reason, side, proposer_id)
      VALUES (_o.id, _id, _o.due_date, _counter, trim(_note), CASE WHEN _r.side='sale' THEN 'supply' ELSE 'sale' END, _uid) RETURNING id INTO _nid;
    PERFORM private.ot_log(_o.id, NULL, 'reschedule_counter', jsonb_build_object('proposed', _r.proposed_date), jsonb_build_object('proposed', _counter), _note);
    PERFORM private.ot_notify(_r.proposer_id, 'ot_reschedule', _o.id, 'ot_resch:'||_nid,
      jsonb_build_object('code', _o.code, 'title', _o.title, 'from', _o.due_date, 'to', _counter));
    RETURN;
  ELSE RAISE EXCEPTION 'Phản hồi không hợp lệ.'; END IF;
  PERFORM private.ot_notify(_r.proposer_id, 'ot_reschedule_result', _o.id, 'ot_resch_res:'||_id,
    jsonb_build_object('code', _o.code, 'title', _o.title, 'decision', _decision, 'to', _r.proposed_date));
END $$;

CREATE OR REPLACE FUNCTION public.ot_reschedule_withdraw(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _r public.ot_reschedules;
BEGIN
  SELECT * INTO _r FROM public.ot_reschedules WHERE id = _id FOR UPDATE;
  IF _r.id IS NULL OR _r.proposer_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Không tìm thấy đề xuất của bạn.'; END IF;
  IF _r.status <> 'pending' THEN RAISE EXCEPTION 'Đề xuất đã được xử lý.'; END IF;
  UPDATE public.ot_reschedules SET status='withdrawn', responded_at=now() WHERE id=_id;
  PERFORM private.ot_log(_r.order_id, NULL, 'reschedule_withdraw', NULL, jsonb_build_object('proposed', _r.proposed_date), NULL);
END $$;

CREATE OR REPLACE FUNCTION public.ot_set_contact(_task uuid, _date date) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t public.ot_tasks; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _t FROM public.ot_tasks WHERE id = _task FOR UPDATE;
  IF _t.id IS NULL OR NOT private.ot_can_view(_uid, _t.order_id) THEN RAISE EXCEPTION 'Không tìm thấy công việc.'; END IF;
  IF NOT (private.ot_can_stage(_uid, _t.order_id) OR (_t.assignee_id = _uid AND private.sig_can(_uid,'ot.task_update'))) THEN
    RAISE EXCEPTION 'Bạn không có quyền cập nhật công việc này.'; END IF;
  IF _t.status IN ('done','skipped') THEN RAISE EXCEPTION 'Công việc đã kết thúc.'; END IF;
  IF _t.contact_date IS NOT DISTINCT FROM _date THEN RETURN; END IF;
  UPDATE public.ot_tasks SET contact_date = _date, updated_at = now() WHERE id = _task;
  PERFORM private.ot_log(_t.order_id, _task, 'task_update', jsonb_build_object('contact_date', _t.contact_date), jsonb_build_object('contact_date', _date), NULL);
END $$;

REVOKE ALL ON FUNCTION public.ot_reschedule_propose(uuid,date,text), public.ot_reschedule_reply(uuid,text,date,text),
  public.ot_reschedule_withdraw(uuid), public.ot_set_contact(uuid,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ot_reschedule_propose(uuid,date,text), public.ot_reschedule_reply(uuid,text,date,text),
  public.ot_reschedule_withdraw(uuid), public.ot_set_contact(uuid,date) TO authenticated;