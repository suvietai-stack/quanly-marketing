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

export type BizDeadlineData = Record<string, { day?: number }>;

/** Định dạng số tiền VNĐ gọn: 1,2 tỷ / 500 triệu / 50.000 đ. */
export function fmtVnd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
  return `${n.toLocaleString("vi-VN")} đ`;
}
