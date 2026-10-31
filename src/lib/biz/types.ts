/** Kiểu dữ liệu module Quản trị Kinh doanh. */

export interface BizDepartment {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  sort_order: number;
}

export interface BizMember {
  id: string;
  department_id: string;
  user_id: string;
  is_manager: boolean;
  effective_from: string;
  effective_to: string | null;
  started_at: string;
  ended_at: string | null;
}

export type BizValueKind = "money" | "count";
export type BizAggregation = "sum" | "avg" | "ratio";
export type BizDirection = "higher" | "lower";

export interface BizKrMetric {
  id: string;
  department_id: string;
  name: string;
  description: string | null;
  unit: string;
  value_kind: BizValueKind;
  aggregation: BizAggregation;
  direction: BizDirection;
  sort_order: number;
  active: boolean;
  effective_from: string;
  effective_to: string | null;
  standard_code?: string | null;
  standard_label?: string | null;
}

export const VALUE_KIND_LABELS: Record<BizValueKind, string> = {
  money: "Tiền tệ (VNĐ)",
  count: "Số lượng",
};

export const AGGREGATION_LABELS: Record<BizAggregation, string> = {
  sum: "Cộng dồn",
  avg: "Bình quân",
  ratio: "Tỷ lệ",
};

export const DIRECTION_LABELS: Record<BizDirection, string> = {
  higher: "Càng cao càng tốt",
  lower: "Càng thấp càng tốt",
};

/** Các loại deadline cấu hình được — day = ngày trong tháng đầu của kỳ. */
export const DEADLINE_KINDS: { key: string; label: string }[] = [
  { key: "goal_year", label: "Mục tiêu KR năm" },
  { key: "plan_month", label: "Kế hoạch Tháng" },
  { key: "plan_quarter", label: "Kế hoạch Quý" },
  { key: "plan_year", label: "Kế hoạch Năm" },
  { key: "report_month", label: "Báo cáo Tháng" },
  { key: "report_quarter", label: "Báo cáo Quý" },
  { key: "report_year", label: "Báo cáo Năm" },
];

/** Một mốc thời gian tương đối với kỳ: offset = số tháng lệch so với tháng đầu kỳ (phase cũ vẫn được hiểu). */
export interface BizMilestoneRule { offset?: number; day?: number; hour?: number; minute?: number; phase?: "before" | "during" | "after" }
export interface BizDeadlineException { open?: string | null; due?: string | null; late_close?: string | null }
export interface BizDeadlineRule { open?: BizMilestoneRule | null; due?: BizMilestoneRule | null; late_close?: BizMilestoneRule | null; exceptions?: Record<string, BizDeadlineException | string> }
export type BizDeadlineData = Record<string, BizDeadlineRule>;

export type BizLateStatus = "pending" | "approved" | "rejected" | "used" | "expired";
export const LATE_STATUS_LABELS: Record<BizLateStatus, string> = { pending: "Chờ duyệt", approved: "Được duyệt nộp bù", rejected: "Bị từ chối", used: "Đã nộp bù", expired: "Hết hiệu lực" };
export interface BizLateRequest {
  legacy?: boolean; can_adopt?: boolean;
  id: string; user_id: string; employee_name: string; kind: "plan" | "report"; period_kind: "month" | "quarter" | "year";
  year: number; period: number; reason: string; status: BizLateStatus; decided_by: string | null; decider_name: string | null;
  decided_at: string | null; decision_comment: string | null; created_at: string; used_at: string | null;
  phase: string; milestones: { open: string | null; due: string | null; late_close: string | null }; can_decide: boolean;
}

/** Định dạng số tiền VNĐ gọn: 1,2 tỷ / 500 triệu / 50.000 đ. */
export function fmtVnd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
  return `${n.toLocaleString("vi-VN")} đ`;
}
