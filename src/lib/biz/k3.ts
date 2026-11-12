// Quản lý 3K — kiểu dữ liệu và quy tắc trình bày dùng chung (không chứa dữ liệu giả).
export type K3Status = 'todo' | 'doing' | 'done' | 'paused' | 'incomplete';

export const K3_STATUS: Record<K3Status, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = {
  todo: { label: 'Chưa làm', tone: 'neutral' },
  doing: { label: 'Đang thực hiện', tone: 'info' },
  done: { label: 'Hoàn thành', tone: 'success' },
  paused: { label: 'Tạm dừng', tone: 'warning' },
  incomplete: { label: 'Kết thúc – Chưa đạt chỉ tiêu', tone: 'danger' },
};

export interface K3Settings {
  enabled: boolean;
  effective_from: string | null;
  discipline_from?: string;
  plan_by: string;
  summary_by: string;
  max_focus: number;
  allow_personal_goal?: boolean;
  allow_team_goal?: boolean;
  allow_invite?: boolean;
  allow_assign?: boolean;
  updated_at: string | null;
  can_use: boolean;
  can_view_scope: boolean;
  can_comment: boolean;
  can_settings: boolean;
  today: string;
}

/** KG đang thực hiện có liên quan đến nhân viên trong ngày. */
export interface K3ActiveGoal {
  id: string;
  name: string;
  status: string;
  period_start: string;
  period_end: string;
  due_date: string | null;
  is_key: boolean;
  owner_name: string | null;
  my_role: string | null;
}

/** KF nhân viên được phân công/phối hợp và còn đang thực hiện. */
export interface K3AssignedAction {
  id: string;
  goal_id: string;
  goal_name: string;
  name: string;
  status: string;
  due_date: string | null;
  is_key: boolean;
  my_part: 'assignee' | 'collaborator';
  already_today: boolean;
}

export interface K3Task {
  id: string;
  day_id: string;
  user_id: string;
  work_date: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  kpi_target: number | null;
  kpi_unit: string | null;
  kpi_actual: number | null;
  progress: number;
  status: K3Status;
  is_focus: boolean;
  how: string | null;
  place: string | null;
  links: { label?: string; url: string }[] | null;
  note: string | null;
  problem: string | null;
  cause: string | null;
  solution: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  revision?: number;
  deleted_at?: string | null;
}

export interface K3Day {
  id: string;
  user_id: string;
  work_date: string;
  kg: string | null;
  planned_at: string | null;
  summarized_at: string | null;
  summary_note: string | null;
  data_revision?: number;
  confirmed_revision?: number | null;
  confirmed_at?: string | null;
  plan_deadline?: string | null;
  summary_deadline?: string | null;
}

export interface K3Comment {
  id: string;
  day_id: string;
  task_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  author_name?: string;
}

export interface K3DayData {
  settings: K3Settings;
  day: K3Day | null;
  tasks: K3Task[];
  comments: K3Comment[];
  events?: { id: number; task_id: string | null; action: string; detail: Record<string, unknown>; created_at: string }[];
  summaries?: { id: string; revision: number; confirmed_at: string; snapshot: { kg: string | null; tasks: K3Task[] } }[];
  active_goals?: K3ActiveGoal[];
  assigned_actions?: K3AssignedAction[];
}

export interface K3TeamRow {
  user_id: string;
  full_name: string;
  departments: string[];
  department_id?: string | null;
  day: K3Day | null;
  total: number;
  done: number;
  open: number;
  issues: number;
  focus: number;
  status_key?: K3TrackStatus;
  goals_active?: number;
  kf_active?: number;
  kf_overdue?: number;
}

/** Trạng thái theo dõi ngày của nhân viên (thay cho "Chưa lập 3K"). */
export type K3TrackStatus = 'none' | 'planned' | 'updated' | 'summarized' | 'reconfirm';

export const K3_TRACK_STATUS: Record<K3TrackStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = {
  none: { label: 'Chưa cập nhật hôm nay', tone: 'neutral' },
  planned: { label: 'Đã lập nội dung thực thi', tone: 'info' },
  updated: { label: 'Đã cập nhật kết quả', tone: 'info' },
  summarized: { label: 'Đã chốt sổ', tone: 'success' },
  reconfirm: { label: 'Cần xác nhận lại', tone: 'danger' },
};

export function k3TrackStatus(r: Pick<K3TeamRow, 'status_key' | 'day'>): K3TrackStatus {
  if (r.status_key) return r.status_key;
  if (!r.day) return 'none';
  if (k3NeedsConfirmation(r.day)) return 'reconfirm';
  if (r.day.summarized_at) return 'summarized';
  return 'planned';
}

/** Tỷ lệ hoàn thành theo số lượng; có thể vượt 100% khi thực tế vượt kế hoạch. */
export function k3Ratio(t: Pick<K3Task, 'kpi_target' | 'kpi_actual'>): number | null {
  if (t.kpi_target == null || t.kpi_target <= 0 || t.kpi_actual == null) return null;
  return Math.round((t.kpi_actual / t.kpi_target) * 100);
}

/** Tiến độ hiển thị: công việc có số lượng dùng tỷ lệ thực tế/kế hoạch, còn lại dùng % tự nhập. */
export function k3ProgressLabel(t: Pick<K3Task, 'kpi_target' | 'kpi_actual' | 'progress'>): string {
  const ratio = k3Ratio(t);
  return `${ratio ?? t.progress}%`;
}

export function k3Counts(tasks: K3Task[]) {
  const done = tasks.filter(k3IsComplete).length;
  const doing = tasks.filter((t) => t.status === 'doing').length;
  const open = tasks.length - done;
  const focus = tasks.filter((t) => t.is_focus).length;
  const issues = tasks.filter((t) => !k3IsComplete(t) && (hasText(t.problem) || hasText(t.solution))).length;
  return { total: tasks.length, done, doing, open, focus, issues };
}

export function k3IsComplete(t: Pick<K3Task,'status'|'kpi_target'|'kpi_actual'|'progress'>): boolean {
  if(t.status!=='done') return false;
  return t.kpi_target!=null && t.kpi_target>0 ? Number(t.kpi_actual??0)>=Number(t.kpi_target) : t.progress==null || t.progress>=100;
}

export function k3DisplayStatus(t: Pick<K3Task,'status'|'kpi_target'|'kpi_actual'|'progress'>): K3Status {
  return t.status==='done'&&!k3IsComplete(t)?'incomplete':t.status;
}

export function hasText(v: string | null | undefined): boolean {
  return !!v && v.trim().length > 0;
}

/** Công việc chưa hoàn thành đã đủ VNGB chưa (bắt buộc khi tổng kết). */
export function k3VngbComplete(t: Pick<K3Task, 'problem' | 'cause' | 'solution'>): boolean {
  return hasText(t.problem) && hasText(t.cause) && hasText(t.solution);
}

/** Đúng hạn/trễ hạn theo mốc cài đặt; trả null khi chưa có dữ liệu để so. */
export function k3NeedsConfirmation(day: K3Day | null | undefined): boolean {
  return !!day?.summarized_at && day.data_revision != null && day.confirmed_revision !== day.data_revision;
}

export function k3LateFlags(day: K3Day | null, s: K3Settings, workDate: string, now = new Date()) {
  const deadline = (value: string) => Date.parse(`${workDate}T${value.length === 5 ? `${value}:00` : value}+07:00`);
  const instant = (value: string) => Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+07:00`);
  const planDue = day?.plan_deadline ? instant(day.plan_deadline) : deadline(s.plan_by);
  const summaryDue = day?.summary_deadline ? instant(day.summary_deadline) : deadline(s.summary_by);
  const planLate = day?.planned_at ? instant(day.planned_at) > planDue : null;
  const summaryLate = day?.summarized_at ? instant(day.summarized_at) > summaryDue : null;
  const summaryOverdue = (!day?.summarized_at || k3NeedsConfirmation(day)) && !!s.effective_from && workDate >= s.effective_from && now.getTime() > summaryDue;
  const planLateMinutes = day?.planned_at ? Math.max(0, Math.floor((instant(day.planned_at) - planDue) / 60000)) : null;
  return { planLate, summaryLate, summaryOverdue, planLateMinutes };
}

/** Chuẩn hóa thông báo lỗi từ RPC — không bao giờ hiển thị [object Object]. */
export function k3Error(e: unknown): string {
  const message = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e && typeof e.message === 'string' ? e.message : '';
  const code = typeof e === 'object' && e && 'code' in e ? String(e.code) : '';
  if (code === '57014' || /statement timeout/i.test(message)) return 'Hết thời gian chờ lưu công việc. Vui lòng thử lại; yêu cầu cũ được giữ để tránh tạo trùng.';
  if (/^(?:42|22|23|XX|PGRST)/.test(code) || /column .* does not exist|relation .* does not exist|syntax error|permission denied|violates .*constraint|invalid input syntax|SQLSTATE/i.test(message)) {
    console.error('[3K] RPC failure', { code, message });
    return 'Chưa thể xử lý công việc lúc này. Vui lòng thử lại; nếu vẫn lỗi, báo quản trị viên.';
  }
  if (message) return message;
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}

export const K3_TIME_HINT = 'Ví dụ tên công việc tốt: "Gọi 10 khách hàng tiềm năng khu vực Hà Nội" thay vì "Gọi khách".';
