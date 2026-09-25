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

export type KpiMetricCategory = "web" | "social" | "video" | "design" | "task" | "seo" | "local" | "marketing";

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
  /** Thư viện KR */
  group?: KrGroup;
  direction?: KrDirection;
  availability?: KrAvailability;
  source?: string;
  rule?: string;
  /** Cấu hình bắt buộc khi giao */
  needs?: "keyword" | "tasks" | "website" | "social" | "views" | "label";
  /** Thứ tự trong thư viện 19 KR cơ bản (không có = chỉ số mở rộng, vẫn dùng trong báo cáo nghiệp vụ). */
  basic?: number;
  krGroup?: KrBasicGroup;
  /** Định nghĩa rõ tử số / mẫu số cho chỉ số tỷ lệ hoặc chi phí. */
  ratio?: { numerator: string; denominator: string; multiplier?: number };
}

export type KrGroup = "Website & Content" | "SEO" | "Social" | "Video" | "Thiết kế" | "Local SEO" | "Hiệu suất" | "Marketing";
/** at_least: đạt ít nhất · at_most: không vượt quá · threshold: đạt ngưỡng · growth: tăng so với kỳ gốc */
export type KrDirection = "at_least" | "at_most" | "threshold" | "growth";
/** linked: Đã liên kết · periodic: số liệu nhập theo kỳ · manual: xác nhận thủ công · pending: chờ kết nối (cho phép xác nhận thủ công) · configure: Cần cấu hình · none: Chưa tích hợp */
export type KrAvailability = "linked" | "periodic" | "manual" | "pending" | "configure" | "none";
export type KrBasicGroup = "Sản lượng" | "Hiệu suất" | "Kết quả Marketing" | "Chuyển đổi" | "Tùy chỉnh";

export type KpiMetricKey =
  | "web_content_completed"
  | "social_post_completed"
  | "video_script_completed"
  | "video_shoot_completed"
  | "video_edit_completed"
  | "video_published"
  | "design_order_completed"
  | "design_points_completed"
  | "task_completed"
  | "seo_keyword_top"
  | "custom_task_result"
  | "task_on_time_rate"
  | "task_first_pass_rate"
  | "task_overdue"
  | "map_post_published"
  | "web_product_published"
  | "seo_organic_clicks"
  | "seo_organic_traffic"
  | "social_reach"
  | "social_engagement"
  | "social_followers_growth"
  | "local_profile_interactions"
  | "mkt_leads"
  | "mkt_conversions"
  | "mkt_cpl"
  | "web_post_published"
  | "social_post_published"
  | "social_views"
  | "video_view_threshold"
  | "mkt_quality_leads"
  | "mkt_conversion_rate"
  | "mkt_orders"
  | "mkt_revenue"
  | "custom_confirmed";
