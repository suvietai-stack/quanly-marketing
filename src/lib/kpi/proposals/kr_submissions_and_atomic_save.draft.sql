-- ĐỀ XUẤT — CHƯA ÁP DỤNG. Chỉ chạy sau khi được phê duyệt.
-- Mục đích: (1) nhân viên tự gửi bằng chứng KR, quản lý duyệt; (2) lưu Mục tiêu + KR nguyên tử.
-- Không sửa bảng nghiệp vụ, không đổi dữ liệu hiện có.

-- (1) Bảng gửi kết quả KR
CREATE TABLE public.kr_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.employee_kpi_items(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  value numeric, numerator numeric, denominator numeric,
  link text, note text,
  achieved_on date NOT NULL,                 -- ngày nhân viên hoàn thành (không dùng ngày duyệt)
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','needs_info','rejected')),
  reviewed_by uuid REFERENCES auth.users(id), reviewed_at timestamptz, review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, submitted_by, link, value, numerator, denominator)  -- gửi lại cùng kết quả không cộng trùng
);
GRANT SELECT, INSERT, UPDATE ON public.kr_submissions TO authenticated;
GRANT ALL ON public.kr_submissions TO service_role;
ALTER TABLE public.kr_submissions ENABLE ROW LEVEL SECURITY;

-- Người được giao KR đọc/gửi của mình; Admin đọc tất cả
CREATE POLICY krs_select ON public.kr_submissions FOR SELECT TO authenticated USING (
  submitted_by = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY krs_insert ON public.kr_submissions FOR INSERT TO authenticated WITH CHECK (
  submitted_by = auth.uid() AND status = 'pending' AND EXISTS (
    SELECT 1 FROM public.employee_kpi_items i JOIN public.employee_kpi_periods p ON p.id = i.kpi_period_id
    WHERE i.id = item_id AND p.user_id = auth.uid() AND p.status NOT IN ('locked','closed')));
-- Chỉ Admin duyệt, không tự duyệt kết quả của chính mình
CREATE POLICY krs_review ON public.kr_submissions FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) AND submitted_by <> auth.uid() AND status <> 'confirmed')
  WITH CHECK (public.is_admin(auth.uid()) AND submitted_by <> auth.uid());

-- Rollback (1):  DROP TABLE public.kr_submissions;

-- (2) RPC lưu Mục tiêu + KR trong một transaction (tùy chọn, thay cho lưu từng phần hiện tại)
-- CREATE FUNCTION public.save_goal_with_krs(_goal jsonb, _periods jsonb, _items jsonb) RETURNS uuid
--   LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$ ... $$;
-- Rollback (2): DROP FUNCTION public.save_goal_with_krs(jsonb, jsonb, jsonb);
