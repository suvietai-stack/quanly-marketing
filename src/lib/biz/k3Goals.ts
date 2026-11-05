// Quản lý 3K — KG/KF xuyên thời gian: kiểu dữ liệu và quy tắc trình bày (không chứa dữ liệu giả).

export type K3GoalStatus = 'draft' | 'not_started' | 'in_progress' | 'paused' | 'done' | 'ended_missed' | 'cancelled';

export interface K3EntityMetric { status: K3GoalStatus; overdue: boolean; overdue_seconds: number; kpi_total: number; kpi_met: number; kf_total: number; kf_done: number; completion_basis: 'own_kpis' | 'actions'; result_count: number; review_required: boolean; }

export const K3_GOAL_STATUS: Record<K3GoalStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = {
  draft: { label: 'Nháp', tone: 'neutral' },
  not_started: { label: 'Chưa bắt đầu', tone: 'neutral' },
  in_progress: { label: 'Đang thực hiện', tone: 'info' },
  paused: { label: 'Tạm dừng', tone: 'warning' },
  done: { label: 'Hoàn thành', tone: 'success' },
  ended_missed: { label: 'Kết thúc chưa đạt', tone: 'danger' },
  cancelled: { label: 'Đã hủy', tone: 'neutral' },
};

export type K3KpiKind = 'cumulative' | 'ratio' | 'milestone';

export const K3_KPI_KIND: Record<K3KpiKind, string> = {
  cumulative: 'Số lượng cộng dồn',
  ratio: 'Tỷ lệ phần trăm',
  milestone: 'Theo mốc hoàn thành',
};

export interface K3GoalRow {
  id: string;
  name: string;
  status: K3GoalStatus;
  metric?: K3EntityMetric;
  period_type: 'week' | 'month' | 'custom';
  period_start: string;
  period_end: string;
  due_date: string | null;
  start_time?: string | null;
  due_time?: string | null;
  is_key: boolean;
  owner_id: string;
  owner_name: string;
  revision: number;
  my_role: 'owner' | 'invited' | 'accepted' | null;
  member_count: number;
  kf_total: number;
  kf_done: number;
  overdue_days: number;
}

export interface K3Kpi {
  id: string;
  name: string;
  kind: K3KpiKind;
  target: number | null;
  unit: string | null;
  manual_actual: number | null;
  manual_source: string | null;
  actual: number | null;
}

export interface K3GoalAction {
  action: {
    id: string; goal_id: string; name: string; status: K3GoalStatus; is_key: boolean;
    start_date: string | null; due_date: string | null; note: string | null;
    start_time?: string | null; due_time?: string | null; inherit_timeline?: boolean;
    execution_schedule?: import('./k3Creation').K3CreationKf['execution_schedule'];
    kpi_summary?: K3EntityMetric;
    required?: boolean;
    assignee_id: string; manual_progress: number | null; progress_source: string | null;
    problem: string | null; cause: string | null; solution: string | null; revision: number;
  };
  assignee_name: string | null;
  collaborators: { user_id: string; full_name: string }[];
  kpis: K3Kpi[];
  member_actuals: { user_id: string; full_name: string; actual: number; days: number }[];
  task_total: number;
  task_done: number;
  overdue_days: number;
}

export interface K3GoalMember {
  user_id: string;
  full_name: string;
  status: 'invited' | 'accepted' | 'declined' | 'revoked';
  invited_at: string;
  responded_at: string | null;
  departments: string[];
}

export interface K3GoalDetail {
  goal: K3GoalRow & { description: string | null; expected_result: string | null; close_note: string | null; closed_at: string | null };
  kpis: K3Kpi[];
  actions: K3GoalAction[];
  members: K3GoalMember[];
  executions: { id: string; work_date: string; name: string; status: string; kpi_actual: number | null; kpi_unit: string | null; progress: number; action_id: string; user_id: string; full_name: string; problem: string | null; solution: string | null }[];
  events: { id: number; action: string; detail: Record<string, unknown>; created_at: string; actor_name: string | null }[];
  can_manage: boolean;
  my_member_status: K3GoalMember['status'] | null;
  today: string;
}

export interface K3MemberSearchRow { id: string; full_name: string; departments: string[] }

/** Tiến độ KPI: cộng dồn lấy từ thực thi ngày, tỷ lệ/mốc lấy giá trị xác nhận; có thể vượt 100%. */
export function k3KpiActual(k: Pick<K3Kpi, 'actual' | 'manual_actual' | 'kind'>): number | null {
  return k.kind === 'cumulative' ? (k.actual ?? 0) : k.manual_actual;
}

export function k3KpiLabel(k: Pick<K3Kpi, 'target' | 'unit' | 'kind'> & { actual?: number | null; manual_actual?: number | null }): string {
  const actual = k3KpiActual(k as K3Kpi);
  const unit = k.unit ? ` ${k.unit}` : '';
  if (k.target != null && k.target > 0) return `${actual ?? 0}/${k.target}${unit}`;
  return actual != null ? `${actual}${unit}` : 'Chưa có số liệu';
}

export function k3KpiPercent(k: Pick<K3Kpi, 'target' | 'kind'> & { actual?: number | null; manual_actual?: number | null }): number | null {
  if (k.target == null || k.target <= 0) return null;
  const actual = k3KpiActual(k as K3Kpi) ?? 0;
  return Math.round((actual / k.target) * 100);
}

export const K3_MEMBER_STATUS: Record<K3GoalMember['status'], string> = {
  invited: 'Chờ xác nhận',
  accepted: 'Đang tham gia',
  declined: 'Đã từ chối',
  revoked: 'Đã thu hồi',
};

export const K3_GOAL_EVENT: Record<string, string> = {
  goal_save: 'Lưu mục tiêu KG',
  goal_status: 'Đổi trạng thái KG',
  action_save: 'Lưu hành động KF',
  action_status: 'Đổi trạng thái KF',
  member_invite: 'Mời thành viên',
  member_accept: 'Chấp nhận tham gia',
  member_decline: 'Từ chối tham gia',
  member_revoke: 'Thu hồi thành viên',
};
