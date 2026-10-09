CREATE OR REPLACE FUNCTION public.oq_cancel(_id uuid, _flow uuid, _reason text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.oq_requests; f public.oq_flows;
BEGIN
  SELECT * INTO r FROM public.oq_requests WHERE id = _id FOR UPDATE;
  IF r.id IS NULL OR r.status <> 'submitted' THEN RAISE EXCEPTION 'Yêu cầu không hợp lệ hoặc đã hủy.'; END IF;
  IF NOT ((r.creator_id = auth.uid() AND private.sig_can(auth.uid(),'oq.create')) OR private.sig_can(auth.uid(),'oq.manage')) THEN RAISE EXCEPTION 'Không có quyền hủy.'; END IF;
  IF coalesce(trim(_reason),'') = '' THEN RAISE EXCEPTION 'Nhập lý do hủy.'; END IF;
  IF _flow IS NOT NULL THEN
    SELECT * INTO f FROM public.oq_flows WHERE id = _flow AND request_id = _id;
    IF f.id IS NULL OR f.status = 'cancelled' THEN RAISE EXCEPTION 'Luồng không hợp lệ.'; END IF;
    UPDATE public.oq_flows SET status = 'cancelled', cancelled_at = now(), cancel_reason = trim(_reason), waiting_info = false, updated_at = now() WHERE id = _flow;
    PERFORM private.oq_log(_id, _flow, NULL, f.current_round, 'flow_cancelled', f.status, 'cancelled', jsonb_build_object('reason',trim(_reason)));
    -- Luồng cuối cùng bị hủy => toàn bộ yêu cầu coi như đã hủy.
    IF NOT EXISTS (SELECT 1 FROM public.oq_flows WHERE request_id = _id AND status <> 'cancelled') THEN
      UPDATE public.oq_requests SET status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = trim(_reason), updated_at = now() WHERE id = _id;
      PERFORM private.oq_log(_id, NULL, NULL, NULL, 'cancelled', 'submitted', 'cancelled', jsonb_build_object('reason',trim(_reason),'last_flow',true));
    END IF;
  ELSE
    UPDATE public.oq_requests SET status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = trim(_reason), updated_at = now() WHERE id = _id;
    FOR f IN SELECT * FROM public.oq_flows WHERE request_id = _id AND status <> 'cancelled' LOOP
      UPDATE public.oq_flows SET status = 'cancelled', cancelled_at = now(), cancel_reason = trim(_reason), waiting_info = false, updated_at = now() WHERE id = f.id;
      PERFORM private.oq_log(_id, f.id, NULL, f.current_round, 'flow_cancelled', f.status, 'cancelled', jsonb_build_object('reason',trim(_reason)));
    END LOOP;
    PERFORM private.oq_log(_id, NULL, NULL, NULL, 'cancelled', 'submitted', 'cancelled', jsonb_build_object('reason',trim(_reason)));
  END IF;
END $function$;

-- Backfill: yêu cầu đã gửi nhưng mọi luồng đều đã hủy => hủy toàn bộ.
UPDATE public.oq_requests q SET status = 'cancelled', cancelled_at = coalesce(q.cancelled_at, (SELECT max(f.cancelled_at) FROM public.oq_flows f WHERE f.request_id = q.id)), updated_at = now()
WHERE q.status = 'submitted' AND EXISTS (SELECT 1 FROM public.oq_flows f WHERE f.request_id = q.id)
  AND NOT EXISTS (SELECT 1 FROM public.oq_flows f WHERE f.request_id = q.id AND f.status <> 'cancelled');

CREATE OR REPLACE FUNCTION public.oq_delete_cancelled(_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.oq_requests;
BEGIN
  IF NOT private.sig_can(auth.uid(), 'oq.delete_cancelled') THEN RAISE EXCEPTION 'Bạn không có quyền xóa yêu cầu đã hủy.'; END IF;
  SELECT * INTO r FROM public.oq_requests WHERE id = _id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy yêu cầu.'; END IF;
  IF r.status <> 'cancelled' OR EXISTS (SELECT 1 FROM public.oq_flows WHERE request_id = _id AND status <> 'cancelled') THEN
    RAISE EXCEPTION 'Chỉ xóa được yêu cầu đã hủy toàn bộ.';
  END IF;
  PERFORM 1 FROM public.oq_flows WHERE request_id = _id FOR UPDATE;
  -- Cascade xóa sản phẩm, ảnh (trigger đưa file vào hàng dọn), luồng, lượt, phản hồi, bổ sung, lịch sử, thông báo.
  DELETE FROM public.oq_requests WHERE id = _id;
END $function$;
REVOKE ALL ON FUNCTION public.oq_delete_cancelled(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.oq_delete_cancelled(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.oq_report_rows(_from timestamp with time zone, _to timestamp with time zone, _basis text, _export boolean DEFAULT false)
 RETURNS TABLE(round_id uuid, flow_id uuid, request_id uuid, round_no integer, kind text, flow_code text, title text, creator_id uuid, creator_name text, assignee_id uuid, assignee_name text, items integer, status text, sent_at timestamp with time zone, accepted_at timestamp with time zone, final_accepted_at timestamp with time zone, first_published_at timestamp with time zone, completed_at timestamp with time zone, wait_sale_sec numeric, info_count integer, handover boolean, response_sec numeric, process_sec numeric, accept_wait_sec numeric, first_pub_sec numeric, data_ok boolean, scope text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _all boolean; _own boolean;
BEGIN
  _all := private.sig_can(_uid, 'oq.report_all');
  _own := private.sig_can(_uid, 'oq.report_own');
  IF NOT (_all OR _own) THEN RAISE EXCEPTION 'Bạn không có quyền xem báo cáo Hỏi Giá & Tiến Độ.'; END IF;
  IF _export AND NOT private.sig_can(_uid, 'oq.report_export') THEN RAISE EXCEPTION 'Bạn không có quyền xuất báo cáo.'; END IF;
  IF _basis NOT IN ('sent','completed') THEN RAISE EXCEPTION 'Mốc thời gian không hợp lệ.'; END IF;
  IF _to <= _from OR _to - _from > interval '400 days' THEN RAISE EXCEPTION 'Khoảng thời gian không hợp lệ (tối đa 400 ngày).'; END IF;
  RETURN QUERY
  SELECT m.round_id, m.flow_id, m.request_id, m.round_no, m.kind, m.flow_code, m.title,
    m.creator_id, pc.full_name, m.assignee_id, pa.full_name, m.items, m.status,
    m.sent_at, m.accepted_at, m.final_accepted_at, m.first_published_at, m.completed_at,
    m.wait_sale_sec, m.info_count, m.handover, m.response_sec, m.process_sec, m.accept_wait_sec, m.first_pub_sec, m.data_ok,
    CASE WHEN _all THEN 'all' ELSE 'own' END
  FROM private.oq_round_metrics() m
  JOIN public.oq_requests rq ON rq.id = m.request_id AND rq.status <> 'cancelled'
  LEFT JOIN profiles pc ON pc.id = m.creator_id LEFT JOIN profiles pa ON pa.id = m.assignee_id
  WHERE (CASE WHEN _basis = 'sent' THEN m.sent_at ELSE m.completed_at END) >= _from
    AND (CASE WHEN _basis = 'sent' THEN m.sent_at ELSE m.completed_at END) < _to
    AND (_all OR m.creator_id = _uid OR m.assignee_id = _uid);
END $function$;

UPDATE public.app_roles SET permissions = array_append(permissions, 'oq.delete_cancelled'), updated_at = now()
WHERE id = 'role-admin' AND NOT ('oq.delete_cancelled' = ANY(permissions));