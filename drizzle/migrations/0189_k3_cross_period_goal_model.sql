-- Bước 1: KG/KF xuyên thời gian, thành viên, KPI đa dòng. Bảo toàn dữ liệu cũ.
-- KG: thêm trạng thái, trọng tâm, kết thúc; cho phép khoảng thời gian tùy chỉnh.
ALTER TABLE public.k3_goals
  ADD COLUMN status text NOT NULL DEFAULT 'in_progress',
  ADD COLUMN is_key boolean NOT NULL DEFAULT false,
  ADD COLUMN closed_at timestamptz,
  ADD COLUMN closed_by uuid,
  ADD COLUMN close_note text;
ALTER TABLE public.k3_goals DROP CONSTRAINT IF EXISTS k3_goals_period_type_check;
ALTER TABLE public.k3_goals ADD CONSTRAINT k3_goals_period_type_check CHECK (period_type IN ('week','month','custom'));
ALTER TABLE public.k3_goals DROP CONSTRAINT IF EXISTS k3_goals_status_check;
ALTER TABLE public.k3_goals ADD CONSTRAINT k3_goals_status_check CHECK (status IN ('draft','not_started','in_progress','paused','done','ended_missed','cancelled'));
COMMENT ON COLUMN public.k3_goals.kpi_target IS 'DEPRECATED: dùng public.k3_kpis (một KG nhiều KPI).';
COMMENT ON COLUMN public.k3_goals.kpi_unit IS 'DEPRECATED: dùng public.k3_kpis (một KG nhiều KPI).';

-- KF: người phụ trách chính, trạng thái, trọng tâm, VNGB khi kết thúc chưa đạt.
ALTER TABLE public.k3_actions
  ADD COLUMN assignee_id uuid,
  ADD COLUMN status text NOT NULL DEFAULT 'in_progress',
  ADD COLUMN is_key boolean NOT NULL DEFAULT false,
  ADD COLUMN problem text,
  ADD COLUMN cause text,
  ADD COLUMN solution text,
  ADD COLUMN closed_at timestamptz,
  ADD COLUMN closed_by uuid;
UPDATE public.k3_actions SET assignee_id = user_id WHERE assignee_id IS NULL;
ALTER TABLE public.k3_actions ALTER COLUMN assignee_id SET NOT NULL;
ALTER TABLE public.k3_actions DROP CONSTRAINT IF EXISTS k3_actions_status_check;
ALTER TABLE public.k3_actions ADD CONSTRAINT k3_actions_status_check CHECK (status IN ('draft','not_started','in_progress','paused','done','ended_missed','cancelled'));
COMMENT ON COLUMN public.k3_actions.kpi_target IS 'DEPRECATED: dùng public.k3_kpis (một KF nhiều KPI).';
COMMENT ON COLUMN public.k3_actions.kpi_unit IS 'DEPRECATED: dùng public.k3_kpis (một KF nhiều KPI).';

-- Thành viên tham gia KG (lời mời chấp nhận/từ chối/thu hồi; chủ trì nằm ở k3_goals.user_id, không nhân bản).
CREATE TABLE public.k3_goal_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.k3_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','accepted','declined','revoked')),
  invited_by uuid,
  invited_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid,
  UNIQUE (goal_id, user_id)
);
CREATE INDEX k3_goal_members_user ON public.k3_goal_members(user_id, status);

-- Người phối hợp KF (người phụ trách chính nằm ở k3_actions.assignee_id).
CREATE TABLE public.k3_action_collaborators (
  action_id uuid NOT NULL REFERENCES public.k3_actions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (action_id, user_id)
);

-- KPI đa dòng cho KG và KF: cumulative cộng dồn theo ngày, ratio xác nhận thủ công (không cộng %), milestone theo mốc.
CREATE TABLE public.k3_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES public.k3_goals(id) ON DELETE CASCADE,
  action_id uuid REFERENCES public.k3_actions(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'cumulative' CHECK (kind IN ('cumulative','ratio','milestone')),
  target numeric CHECK (target >= 0),
  unit text,
  manual_actual numeric CHECK (manual_actual >= 0),
  manual_source text,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(goal_id, action_id) = 1)
);
CREATE INDEX k3_kpis_goal ON public.k3_kpis(goal_id);
CREATE INDEX k3_kpis_action ON public.k3_kpis(action_id);
-- Chuyển KPI đơn hiện có sang bảng mới (backfill thuộc thay đổi schema cộng thêm).
INSERT INTO public.k3_kpis (goal_id, name, kind, target, unit)
  SELECT id, 'KPI kết quả', 'cumulative', kpi_target, kpi_unit FROM public.k3_goals WHERE kpi_target IS NOT NULL;
INSERT INTO public.k3_kpis (action_id, name, kind, target, unit)
  SELECT id, 'KPI thực thi', 'cumulative', kpi_target, kpi_unit FROM public.k3_actions WHERE kpi_target IS NOT NULL;

-- Cài đặt quyền nghiệp vụ trong chính module 3K.
ALTER TABLE public.k3_settings
  ADD COLUMN allow_personal_goal boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_team_goal boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_invite boolean NOT NULL DEFAULT true,
  ADD COLUMN allow_assign boolean NOT NULL DEFAULT true;

GRANT SELECT ON public.k3_goal_members, public.k3_action_collaborators, public.k3_kpis TO authenticated;
GRANT ALL ON public.k3_goal_members, public.k3_action_collaborators, public.k3_kpis TO service_role;
ALTER TABLE public.k3_goal_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k3_action_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.k3_kpis ENABLE ROW LEVEL SECURITY;

-- Quyền xem KG: chủ trì, thành viên (kể cả đang chờ chấp nhận), quản lý đúng phạm vi, Admin.
CREATE FUNCTION public.k3_goal_visible(_actor uuid, _goal uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.k3_goals g
    WHERE g.id = _goal AND _actor IS NOT NULL AND (
      public.biz_admin(_actor)
      OR (g.user_id = _actor AND public.k3_can(_actor, 'k3.use'))
      OR EXISTS(SELECT 1 FROM public.k3_goal_members m WHERE m.goal_id = g.id AND m.user_id = _actor AND m.status IN ('invited','accepted') AND public.k3_can(_actor, 'k3.use'))
      OR (public.k3_can(_actor, 'k3.view_scope') AND public.biz_scope_ok(_actor, g.user_id, g.department_id, (g.period_start::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')))
    )
  )
$$;
CREATE FUNCTION public.k3_action_visible(_actor uuid, _action uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.k3_actions a WHERE a.id = _action AND public.k3_goal_visible(_actor, a.goal_id))
$$;
REVOKE ALL ON FUNCTION public.k3_goal_visible(uuid,uuid), public.k3_action_visible(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.k3_goal_visible(uuid,uuid), public.k3_action_visible(uuid,uuid) TO authenticated;

DROP POLICY k3_goal_own ON public.k3_goals;
CREATE POLICY k3_goal_own ON public.k3_goals FOR SELECT TO authenticated USING (public.k3_goal_visible(auth.uid(), id));
DROP POLICY k3_action_own ON public.k3_actions;
CREATE POLICY k3_action_own ON public.k3_actions FOR SELECT TO authenticated USING (public.k3_action_visible(auth.uid(), id));
CREATE POLICY k3_goal_members_select ON public.k3_goal_members FOR SELECT TO authenticated USING (public.k3_goal_visible(auth.uid(), goal_id));
CREATE POLICY k3_action_collaborators_select ON public.k3_action_collaborators FOR SELECT TO authenticated USING (public.k3_action_visible(auth.uid(), action_id));
CREATE POLICY k3_kpis_select ON public.k3_kpis FOR SELECT TO authenticated USING (
  (goal_id IS NOT NULL AND public.k3_goal_visible(auth.uid(), goal_id))
  OR (action_id IS NOT NULL AND public.k3_action_visible(auth.uid(), action_id))
);

-- KG tùy chỉnh: chỉ cần khoảng hợp lệ; KG tuần/tháng cũ giữ kiểm tra chuẩn kỳ.
CREATE OR REPLACE FUNCTION private.k3_goal_consistency() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
  IF NEW.period_type = 'custom' THEN
    IF NEW.period_start IS NULL OR NEW.period_end IS NULL OR NEW.period_end < NEW.period_start THEN RAISE EXCEPTION 'Khoảng thời gian mục tiêu không hợp lệ.'; END IF;
  ELSIF NEW.period_start <> public.k3_period_start(NEW.period_type, NEW.period_start) OR NEW.period_end <> public.k3_period_end(NEW.period_type, NEW.period_start) THEN
    RAISE EXCEPTION 'Khoảng kỳ mục tiêu không hợp lệ.';
  END IF;
  RETURN NEW;
END$$;