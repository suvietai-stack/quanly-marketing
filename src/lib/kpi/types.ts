/**
 * KPI V2 — types (độc lập, chưa được import vào module production nào).
 * Nguyên tắc: Role KHÔNG quyết định KPI. KPI giao trực tiếp cho nhân sự theo kỳ.
 */

export type GoalStatus = "draft" | "active" | "closed" | "cancelled";
export type KpiPeriodStatus = "draft" | "active" | "locked" | "closed";
export type KpiPeriodType = "week" | "month" | "quarter" | "year" | "custom";
export type KpiUnit = "count" | "point" | "percent" | "hour" | "currency";
export type KpiOperator = ">=" | "<=" | "=";

/** Phạm vi có thể gắn cho một chỉ tiêu KPI */
export type KpiScope = "global" | "brand" | "website" | "social";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;
  status: GoalStatus;
  brandId: string | null;
  websiteId: string | null;
  socialId: string | null;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeKpiPeriod {
  id: string;
  userId: string;
  periodType: KpiPeriodType;
  periodStart: string;
  periodEnd: string;
  goalId: string | null;
  status: KpiPeriodStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeKpiItem {
  id: string;
  kpiPeriodId: string;
  metricKey: KpiMetricKey | string;
  label: string | null;
  targetValue: number;
  unit: KpiUnit;
  targetOperator: KpiOperator;
  brandId: string | null;
  websiteId: string | null;
  socialId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type KpiMetricCategory = "web" | "social" | "video" | "design" | "task";

export interface KpiMetricDefinition {
  key: KpiMetricKey;
  label: string;
  unit: KpiUnit;
  category: KpiMetricCategory;
  /** Các phạm vi được phép gắn cho chỉ tiêu này */
  scopes: KpiScope[];
  description?: string;
  /** Có giá trị = metric chưa có nguồn dữ liệu tin cậy → không cho giao KPI demo. */
  notReady?: string;
}

export type KpiMetricKey =
  | "web_content_completed"
  | "social_post_completed"
  | "video_script_completed"
  | "video_shoot_completed"
  | "video_edit_completed"
  | "video_published"
  | "design_order_completed"
  | "design_points_completed"
  | "task_completed";
