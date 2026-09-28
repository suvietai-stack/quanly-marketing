-- Báo cáo Hỏi Giá & Tiến Độ: chỉ thêm hàm đọc; không đổi bảng/dữ liệu.
-- Một công thức duy nhất cho mọi màn hình (danh sách, chi tiết, báo cáo, Excel).
CREATE OR REPLACE FUNCTION private.oq_round_metrics()
RETURNS TABLE(
  round_id uuid, flow_id uuid, request_id uuid, round_no int, kind text, flow_code text, title text,
  creator_id uuid, assignee_id uuid, items int, status text,
  sent_at timestamptz, accepted_at timestamptz, final_accepted_at timestamptz, first_published_at timestamptz, completed_at timestamptz,
  wait_sale_sec numeric, info_count int, handover boolean,
  response_sec numeric, process_sec numeric, accept_wait_sec numeric, first_pub_sec numeric, data_ok boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH base AS (
    SELECT rd.id rid, f.id fid, f.request_id, rd.no, f.kind, f.code, q.title, q.creator_id, rd.assignee_id,
      CASE WHEN jsonb_typeof(rd.items_snapshot)='array' THEN jsonb_array_length(rd.items_snapshot) ELSE 0 END items,
      CASE WHEN rd.completed_at IS NOT NULL THEN 'answered'
           WHEN f.status = 'cancelled' OR q.status = 'cancelled' OR rd.no < f.current_round THEN 'cancelled'
           WHEN f.waiting_info THEN 'waiting_sale'
           ELSE f.status END st,
      rd.created_at sent, rd.accepted_at acc, rd.first_published_at fpub, rd.completed_at done,
      EXISTS (SELECT 1 FROM oq_events e WHERE e.flow_id = f.id AND e.round_no = rd.no AND e.kind = 'reassigned') ho,
      (SELECT max(e.created_at) FROM oq_events e WHERE e.flow_id = f.id AND e.round_no = rd.no AND e.kind = 'accepted'
         AND (rd.completed_at IS NULL OR e.created_at <= rd.completed_at)) last_acc,
      (SELECT max(e.created_at) FROM oq_events e WHERE e.flow_id = f.id AND e.round_no = rd.no AND e.kind = 'reassigned'
         AND (rd.completed_at IS NULL OR e.created_at <= rd.completed_at)) last_re
    FROM oq_rounds rd JOIN oq_flows f ON f.id = rd.flow_id JOIN oq_requests q ON q.id = f.request_id
    WHERE q.status <> 'draft'
  ), m AS (
    SELECT b.*,
      -- mốc bắt đầu phụ trách của người hiện tại: không chuyển giao → tiếp nhận đầu; có chuyển giao → lần tiếp nhận sau lần chuyển cuối
      CASE WHEN NOT b.ho THEN b.acc WHEN b.last_acc > b.last_re THEN b.last_acc END own_start,
      (SELECT coalesce(sum(extract(epoch FROM (i.answered_at - i.asked_at))),0) FROM oq_info_requests i
         WHERE i.flow_id = b.fid AND i.round_no = b.no AND i.answered_at IS NOT NULL) wait_all,
      (SELECT count(*) FROM oq_info_requests i WHERE i.flow_id = b.fid AND i.round_no = b.no)::int n_info
    FROM base b
  )
  SELECT m.rid, m.fid, m.request_id, m.no, m.kind, m.code, m.title, m.creator_id, m.assignee_id, m.items, m.st,
    m.sent, m.acc, m.own_start, m.fpub, m.done, m.wait_all, m.n_info, m.ho,
    CASE WHEN m.done IS NOT NULL THEN extract(epoch FROM (m.done - m.sent)) END,
    CASE WHEN m.done IS NOT NULL AND m.own_start IS NOT NULL THEN
      extract(epoch FROM (m.done - m.own_start)) - (SELECT coalesce(sum(extract(epoch FROM (least(i.answered_at, m.done) - greatest(i.asked_at, m.own_start)))),0)
        FROM oq_info_requests i WHERE i.flow_id = m.fid AND i.round_no = m.no AND i.answered_at IS NOT NULL
          AND i.answered_at > m.own_start AND i.asked_at < m.done) END,
    CASE WHEN m.acc IS NOT NULL THEN extract(epoch FROM (m.acc - m.sent)) END,
    CASE WHEN m.fpub IS NOT NULL THEN extract(epoch FROM (m.fpub - m.sent)) END,
    (m.done IS NULL OR m.own_start IS NOT NULL)
  FROM m;
$$;
REVOKE ALL ON FUNCTION private.oq_round_metrics() FROM PUBLIC, anon, authenticated;

-- Thời gian trên job: chỉ trả về lượt thuộc yêu cầu người gọi được xem.
CREATE OR REPLACE FUNCTION public.oq_job_times(_flows uuid[])
RETURNS SETOF record LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT NULL::record WHERE false $$;
DROP FUNCTION public.oq_job_times(uuid[]);
CREATE FUNCTION public.oq_job_times(_flows uuid[])
RETURNS TABLE(round_id uuid, flow_id uuid, round_no int, status text, sent_at timestamptz, accepted_at timestamptz,
  final_accepted_at timestamptz, first_published_at timestamptz, completed_at timestamptz, wait_sale_sec numeric, handover boolean,
  response_sec numeric, process_sec numeric, accept_wait_sec numeric, first_pub_sec numeric, data_ok boolean, server_now timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.round_id, m.flow_id, m.round_no, m.status, m.sent_at, m.accepted_at, m.final_accepted_at, m.first_published_at, m.completed_at,
    m.wait_sale_sec, m.handover, m.response_sec, m.process_sec, m.accept_wait_sec, m.first_pub_sec, m.data_ok, now()
  FROM private.oq_round_metrics() m
  WHERE m.flow_id = ANY(_flows) AND private.oq_can_view(m.request_id, auth.uid());
$$;

-- Báo cáo: kiểm quyền ở backend. report_all → toàn bộ; report_own → lượt mình tạo hoặc mình phụ trách.
CREATE OR REPLACE FUNCTION public.oq_report_rows(_from timestamptz, _to timestamptz, _basis text, _export boolean DEFAULT false)
RETURNS TABLE(round_id uuid, flow_id uuid, request_id uuid, round_no int, kind text, flow_code text, title text,
  creator_id uuid, creator_name text, assignee_id uuid, assignee_name text, items int, status text,
  sent_at timestamptz, accepted_at timestamptz, final_accepted_at timestamptz, first_published_at timestamptz, completed_at timestamptz,
  wait_sale_sec numeric, info_count int, handover boolean, response_sec numeric, process_sec numeric, accept_wait_sec numeric,
  first_pub_sec numeric, data_ok boolean, scope text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
  LEFT JOIN profiles pc ON pc.id = m.creator_id LEFT JOIN profiles pa ON pa.id = m.assignee_id
  WHERE (CASE WHEN _basis = 'sent' THEN m.sent_at ELSE m.completed_at END) >= _from
    AND (CASE WHEN _basis = 'sent' THEN m.sent_at ELSE m.completed_at END) < _to
    AND (_all OR m.creator_id = _uid OR m.assignee_id = _uid);
END $$;

REVOKE ALL ON FUNCTION public.oq_job_times(uuid[]), public.oq_report_rows(timestamptz,timestamptz,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.oq_job_times(uuid[]), public.oq_report_rows(timestamptz,timestamptz,text,boolean) TO authenticated;