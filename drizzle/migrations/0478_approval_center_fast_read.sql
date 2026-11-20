-- Trung tâm Phê duyệt: tăng tốc approval_center_read, không đổi quy tắc duyệt.
-- Nút thắt chính (đọc từ 0304 + biz_approvals_read):
--   1. Nhánh Kinh doanh gọi biz_approvals_read(): trả MỌI run (mọi trạng thái, mọi năm) mà người
--      dùng đọc được, kèm toàn bộ snapshot + events; với Ban điều hành đó là toàn bộ lịch sử công ty.
--      biz_approval_events không có index run_id nên mỗi run quét lại cả bảng events (N+1).
--   2. Các nhánh "Đã xử lý" của Thiết kế/Video/Content Web/Social/Task bung history JSON của
--      MỌI bản ghi trong bảng rồi mới lọc byId → chi phí tăng theo toàn bộ dữ liệu lịch sử.
--   3. Điều kiện eligible gọi has_permission() cho từng dòng fr_steps.
--   4. NOT EXISTS k3_kpi_acceptances / lọc decided_by, actor_id không có index.
--   5. Lỗi: make_interval(hours => numeric) khiến cả nhánh Kinh doanh lỗi khi có hồ sơ chờ duyệt.
-- Cách sửa:
--   * Bản sao riêng private.approval_center_biz_read() của biz_approvals_read() chỉ khác ở bộ lọc
--     run: đang chờ (todo/mine) hoặc có sự kiện do chính người dùng thực hiện (done). can_act,
--     biz_run_can_read, legacy và has_assigned giữ nguyên văn bản đang chạy (pg_get_functiondef).
--     /biz/approvals vẫn dùng biz_approvals_read() gốc, không bị ảnh hưởng.
--   * Lọc trước history bằng @> qua GIN index (data->'history') jsonb_path_ops — cùng kết quả
--     với h->>'byId'=_uid, đồng thời bỏ qua history không phải mảng (trước đây làm lỗi cả nhánh).
--   * Gom has_permission theo DISTINCT perm cho eligible.
--   * Thêm index cho các cột lọc theo người duyệt / trạng thái JSON.
-- Mọi phép thay thế đều kiểm tra đúng hình dạng hàm đang chạy; khác hình dạng → dừng (fail closed).
BEGIN;
SET LOCAL lock_timeout='5s';

-- Index cho các nhánh đọc (IF NOT EXISTS để chạy lại an toàn).
CREATE INDEX IF NOT EXISTS biz_approval_events_run_idx ON public.biz_approval_events(run_id, created_at);
CREATE INDEX IF NOT EXISTS biz_approval_events_actor_idx ON public.biz_approval_events(actor_id);
CREATE INDEX IF NOT EXISTS k3_kpi_acceptances_result_idx ON public.k3_kpi_acceptances(result_id, result_revision);
CREATE INDEX IF NOT EXISTS k3_kpi_acceptances_actor_idx ON public.k3_kpi_acceptances(actor_id);
CREATE INDEX IF NOT EXISTS fr_steps_decided_by_idx ON public.fr_steps(decided_by) WHERE decided_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS fr_steps_approver_idx ON public.fr_steps(approver_id) WHERE approver_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS leave_requests_decided_by_idx ON public.leave_requests(decided_by) WHERE decided_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS leave_request_events_actor_idx ON public.leave_request_events(actor_id, action);
CREATE INDEX IF NOT EXISTS orders_history_gin ON public.orders USING gin ((data->'history') jsonb_path_ops);
CREATE INDEX IF NOT EXISTS videos_history_gin ON public.videos USING gin ((data->'history') jsonb_path_ops);
CREATE INDEX IF NOT EXISTS web_contents_history_gin ON public.web_contents USING gin ((data->'history') jsonb_path_ops);
CREATE INDEX IF NOT EXISTS social_posts_history_gin ON public.social_posts USING gin ((data->'history') jsonb_path_ops);
CREATE INDEX IF NOT EXISTS tasks_history_gin ON public.tasks USING gin ((data->'history') jsonb_path_ops);
-- Lọc "Chờ duyệt…" không phải giải nén toàn bộ cột data của mọi bản ghi.
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders((data->>'status'));
CREATE INDEX IF NOT EXISTS videos_status_idx ON public.videos((data->>'status'));
CREATE INDEX IF NOT EXISTS web_contents_status_idx ON public.web_contents((data->>'status'));
CREATE INDEX IF NOT EXISTS social_posts_status_idx ON public.social_posts((data->>'status'));
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks((data->>'status'));

DO $patch$
DECLARE
  f text;
  n int;
  old_ text;
  new_ text;
  pair text[];
  pairs text[][];
BEGIN
  -- 1) Bản sao Kinh doanh chỉ đọc các run Trung tâm cần.
  SELECT pg_get_functiondef('public.biz_approvals_read()'::regprocedure) INTO f;
  old_ := 'FROM public.biz_approval_runs a JOIN public.profiles p ON p.id=a.owner_id WHERE public.biz_run_can_read(a.id)';
  n := (length(f) - length(replace(f, old_, ''))) / length(old_);
  IF n <> 1 THEN RAISE EXCEPTION 'biz_approvals_read shape changed (run filter found % times)', n; END IF;
  f := replace(f, old_,
    'FROM public.biz_approval_runs a JOIN public.profiles p ON p.id=a.owner_id WHERE (a.status=''pending'' OR EXISTS(SELECT 1 FROM public.biz_approval_events me WHERE me.run_id=a.id AND me.actor_id=auth.uid())) AND public.biz_run_can_read(a.id)');
  old_ := 'FUNCTION public.biz_approvals_read()';
  IF position(old_ IN f) = 0 THEN RAISE EXCEPTION 'biz_approvals_read header not found'; END IF;
  f := replace(f, old_, 'FUNCTION private.approval_center_biz_read()');
  EXECUTE f;
  REVOKE ALL ON FUNCTION private.approval_center_biz_read() FROM PUBLIC, anon, authenticated;

  -- 2) approval_center_read: thay đúng từng đoạn, mỗi đoạn phải xuất hiện đúng 1 lần.
  SELECT pg_get_functiondef('public.approval_center_read()'::regprocedure) INTO f;
  pairs := ARRAY[
    ARRAY['_biz := public.biz_approvals_read();',
          '_biz := private.approval_center_biz_read();'],
    ARRAY['FROM public.orders o, jsonb_array_elements(coalesce(o.data->''history'',''[]''::jsonb)) h',
          'FROM (SELECT * FROM public.orders WHERE data->''history'' @> jsonb_build_array(jsonb_build_object(''byId'',_uid::text))) o, jsonb_array_elements(o.data->''history'') h'],
    ARRAY['FROM public.videos v, jsonb_array_elements(coalesce(v.data->''history'',''[]''::jsonb)) h',
          'FROM (SELECT * FROM public.videos WHERE data->''history'' @> jsonb_build_array(jsonb_build_object(''byId'',_uid::text))) v, jsonb_array_elements(v.data->''history'') h'],
    ARRAY['FROM public.web_contents c, jsonb_array_elements(coalesce(c.data->''history'',''[]''::jsonb)) h',
          'FROM (SELECT * FROM public.web_contents WHERE data->''history'' @> jsonb_build_array(jsonb_build_object(''byId'',_uid::text))) c, jsonb_array_elements(c.data->''history'') h'],
    ARRAY['FROM public.social_posts p, jsonb_array_elements(coalesce(p.data->''history'',''[]''::jsonb)) h',
          'FROM (SELECT * FROM public.social_posts WHERE data->''history'' @> jsonb_build_array(jsonb_build_object(''byId'',_uid::text))) p, jsonb_array_elements(p.data->''history'') h'],
    ARRAY['FROM public.tasks t, jsonb_array_elements(coalesce(t.data->''history'',''[]''::jsonb)) h',
          'FROM (SELECT * FROM public.tasks WHERE data->''history'' @> jsonb_build_array(jsonb_build_object(''byId'',_uid::text))) t, jsonb_array_elements(t.data->''history'') h'],
    ARRAY['OR EXISTS (SELECT 1 FROM public.fr_steps s WHERE s.approver_id=_uid OR (s.approver_id IS NULL AND s.perm IS NOT NULL AND coalesce(private.has_permission(_uid,s.perm),false)))',
          'OR EXISTS (SELECT 1 FROM public.fr_steps s WHERE s.approver_id=_uid) OR EXISTS (SELECT 1 FROM (SELECT DISTINCT s.perm FROM public.fr_steps s WHERE s.approver_id IS NULL AND s.perm IS NOT NULL) d WHERE coalesce(private.has_permission(_uid,d.perm),false))']
  ];
  FOREACH pair SLICE 1 IN ARRAY pairs LOOP
    old_ := pair[1]; new_ := pair[2];
    n := (length(f) - length(replace(f, old_, ''))) / length(old_);
    IF n <> 1 THEN RAISE EXCEPTION 'approval_center_read shape changed: "%" found % times', left(old_, 80), n; END IF;
    f := replace(f, old_, new_);
  END LOOP;
  -- Sửa lỗi: make_interval(hours => numeric) không tồn tại trong Postgres (hours là integer), nên
  -- nhánh Kinh doanh lỗi ngay khi có hồ sơ đang chờ người dùng duyệt → Trung tâm báo "chưa tải được
  -- Kinh doanh" và không hiện hồ sơ. Dùng phép nhân interval, giữ nguyên giá trị SLA (kể cả số lẻ giờ).
  old_ := 'make_interval(hours => coalesce((_run->''steps''->coalesce((_run->>''current_step'')::int,0)->>''sla_hours'')::numeric,0))';
  IF position(old_ IN f) > 0 THEN
    f := replace(f, old_, '(coalesce((_run->''steps''->coalesce((_run->>''current_step'')::int,0)->>''sla_hours'')::numeric,0) * interval ''1 hour'')');
  END IF;
  EXECUTE f;
END $patch$;

REVOKE ALL ON FUNCTION public.approval_center_read() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approval_center_read() TO authenticated;

ANALYZE public.biz_approval_events, public.k3_kpi_acceptances, public.fr_steps, public.leave_requests,
  public.leave_request_events, public.orders, public.videos, public.web_contents, public.social_posts, public.tasks;
COMMIT;
