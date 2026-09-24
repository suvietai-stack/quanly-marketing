/**
 * KPI V2 — metric registry (metadata only, chưa có logic tính toán).
 */
import type { KpiMetricDefinition, KpiMetricKey } from "./types";

export const KPI_METRICS: Record<KpiMetricKey, KpiMetricDefinition> = {
  web_content_completed: {
    key: "web_content_completed",
    label: "Content Web hoàn thành",
    unit: "count",
    category: "web",
    scopes: ["global", "brand", "website"],
  },
  social_post_completed: {
    key: "social_post_completed",
    label: "Bài Social hoàn thành",
    unit: "count",
    category: "social",
    scopes: ["global", "brand", "social"],
  },
  video_script_completed: {
    key: "video_script_completed",
    label: "Kịch bản video hoàn thành",
    unit: "count",
    category: "video",
    scopes: ["global", "brand"],
  },
  video_shoot_completed: {
    key: "video_shoot_completed",
    label: "Quay video hoàn thành",
    unit: "count",
    category: "video",
    scopes: ["global", "brand"],
    notReady: "Chưa sẵn sàng: cần sự kiện ghi nhận người quay (stage event) — chưa có dữ liệu.",
  },
  video_edit_completed: {
    key: "video_edit_completed",
    label: "Dựng video hoàn thành",
    unit: "count",
    category: "video",
    scopes: ["global", "brand"],
  },
  video_published: {
    key: "video_published",
    label: "Video đã đăng",
    unit: "count",
    category: "video",
    scopes: ["global", "brand", "social"],
  },
  design_order_completed: {
    key: "design_order_completed",
    label: "Order thiết kế hoàn thành",
    unit: "count",
    category: "design",
    scopes: ["global", "brand"],
  },
  design_points_completed: {
    key: "design_points_completed",
    label: "Điểm thiết kế hoàn thành",
    unit: "point",
    category: "design",
    scopes: ["global", "brand"],
    notReady: "Chưa sẵn sàng: cần điểm order đã được Admin duyệt (snapshot) — chưa có dữ liệu.",
  },
  task_completed: {
    key: "task_completed",
    label: "Task hoàn thành",
    unit: "count",
    category: "task",
    scopes: ["global", "brand"],
  },
};

export const KPI_METRIC_LIST: KpiMetricDefinition[] = Object.values(KPI_METRICS);

export function getKpiMetric(key: string): KpiMetricDefinition | undefined {
  return KPI_METRICS[key as KpiMetricKey];
}
