-- ĐỀ XUẤT — CHƯA APPLY. Không đặt trong supabase/migrations. Chỉ để review.
-- Ghi nhận người thực hiện từng công đoạn video/design + sự kiện nộp/duyệt, có audit.

CREATE TABLE public.kpi_stage_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('video','design_order')),
  source_id text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('video_script','video_shoot','video_edit','video_publish','design_order')),
  user_id uuid NOT NULL,
  deadline date,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.kpi_stage_assignments (source_type, source_id, stage);
CREATE INDEX ON public.kpi_stage_assignments (user_id);

CREATE TABLE public.kpi_stage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('video','design_order')),
  source_id text NOT NULL,
  stage text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('assigned','started','submitted','approved','revision_requested','published')),
  user_id uuid NOT NULL,          -- người được credit
  author_id uuid NOT NULL DEFAULT auth.uid(), -- người ghi event
  version int NOT NULL DEFAULT 1,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  evidence_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.kpi_stage_events (source_type, source_id, stage, occurred_at);
CREATE INDEX ON public.kpi_stage_events (user_id);

-- Điểm thiết kế cấu hình rõ ràng, snapshot theo order (không suy từ tên loại).
CREATE TABLE public.kpi_design_points (
  order_id text PRIMARY KEY,
  points numeric NOT NULL CHECK (points >= 0),
  configured_by uuid NOT NULL DEFAULT auth.uid(),
  configured_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.kpi_stage_assignments, public.kpi_stage_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.kpi_design_points TO authenticated;
GRANT ALL ON public.kpi_stage_assignments, public.kpi_stage_events, public.kpi_design_points TO service_role;

ALTER TABLE public.kpi_stage_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_stage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_design_points ENABLE ROW LEVEL SECURITY;

-- Events append-only (audit): không có UPDATE/DELETE policy.
CREATE POLICY "own or admin read assignments" ON public.kpi_stage_assignments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_admin(auth.uid()));
CREATE POLICY "admin insert assignments" ON public.kpi_stage_assignments FOR INSERT TO authenticated
  WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "own or admin read events" ON public.kpi_stage_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_admin(auth.uid()));
CREATE POLICY "author inserts events" ON public.kpi_stage_events FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND (user_id = auth.uid() OR private.is_admin(auth.uid())));
CREATE POLICY "read points" ON public.kpi_design_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write points" ON public.kpi_design_points FOR INSERT TO authenticated
  WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "admin update points" ON public.kpi_design_points FOR UPDATE TO authenticated
  USING (private.is_admin(auth.uid()));
