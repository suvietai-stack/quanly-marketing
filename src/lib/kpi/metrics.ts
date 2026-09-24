/**
 * Thư viện KR chuẩn — dùng chung toàn Base Marketing.
 * availability: linked = Đã liên kết (tính tự động) · configure = Cần cấu hình · none = Chưa tích hợp.
 * Chỉ chỉ số "linked" mới được giao; các chỉ số còn lại hiển thị đúng trạng thái, không tạo số liệu giả.
 */
import type { KpiMetricDefinition, KpiMetricKey, KrAvailability } from "./types";

const def = (d: KpiMetricDefinition): KpiMetricDefinition => {
  const availability: KrAvailability = d.availability ?? (d.notReady ? "none" : "linked");
  return { direction: "at_least", ...d, availability };
};

export const KPI_METRICS: Record<KpiMetricKey, KpiMetricDefinition> = {
  web_content_completed: def({ key: "web_content_completed", label: "Content Web được duyệt", unit: "count", category: "web", group: "Website & Content",
    scopes: ["global", "brand", "website"], source: "Content Web", rule: "Bài được duyệt lần đầu trong kỳ; ghi nhận cho người gửi duyệt bản được duyệt." }),
  web_product_published: def({ key: "web_product_published", label: "Sản phẩm Website đã đăng / cập nhật", unit: "count", category: "web", group: "Website & Content",
    scopes: ["global", "brand", "website"], availability: "none", source: "Chưa có module sản phẩm", rule: "Dùng KR tùy chỉnh liên kết Task." }),
  seo_keyword_top: def({ key: "seo_keyword_top", label: "Từ khóa đạt Top N", unit: "count", category: "seo", group: "SEO", direction: "threshold", needs: "keyword",
    scopes: ["global", "brand", "website"], source: "SEO / Check Top", rule: "Đạt khi thứ hạng mới nhất ≤ ngưỡng. Chỉ có thứ hạng hiện tại, chưa có lịch sử từng ngày." }),
  seo_organic_clicks: def({ key: "seo_organic_clicks", label: "Organic Clicks", unit: "count", category: "seo", group: "SEO", direction: "growth",
    scopes: ["global", "brand", "website"], availability: "configure", source: "Số liệu tăng trưởng (nhập tay)", rule: "Cần kết nối Search Console để tự động." }),
  seo_organic_traffic: def({ key: "seo_organic_traffic", label: "Organic Traffic", unit: "count", category: "seo", group: "SEO", direction: "growth",
    scopes: ["global", "brand", "website"], availability: "configure", source: "Số liệu tăng trưởng (nhập tay)", rule: "Cần kết nối Analytics để tự động." }),
  social_post_completed: def({ key: "social_post_completed", label: "Bài Social được duyệt", unit: "count", category: "social", group: "Social",
    scopes: ["global", "brand", "social"], source: "Social", rule: "Bài được duyệt lần đầu trong kỳ; gắn đúng Thương hiệu → Kênh." }),
  social_reach: def({ key: "social_reach", label: "Lượt tiếp cận / lượt xem", unit: "count", category: "social", group: "Social",
    scopes: ["global", "brand", "social"], availability: "configure", source: "Số liệu tăng trưởng kênh (nhập tay)" }),
  social_engagement: def({ key: "social_engagement", label: "Lượt tương tác", unit: "count", category: "social", group: "Social",
    scopes: ["global", "brand", "social"], availability: "configure", source: "Số liệu tăng trưởng kênh (nhập tay)" }),
  social_followers_growth: def({ key: "social_followers_growth", label: "Người theo dõi mới", unit: "count", category: "social", group: "Social", direction: "growth",
    scopes: ["global", "brand", "social"], availability: "configure", source: "Số liệu tăng trưởng kênh (nhập tay)" }),
  video_script_completed: def({ key: "video_script_completed", label: "Kịch bản video được duyệt", unit: "count", category: "video", group: "Video",
    scopes: ["global", "brand"], source: "Video" }),
  video_shoot_completed: def({ key: "video_shoot_completed", label: "Video hoàn thành quay", unit: "count", category: "video", group: "Video",
    scopes: ["global", "brand"], source: "Video", notReady: "Chưa sẵn sàng: cần ghi nhận người quay — chưa có dữ liệu." }),
  video_edit_completed: def({ key: "video_edit_completed", label: "Video hoàn thành dựng", unit: "count", category: "video", group: "Video",
    scopes: ["global", "brand"], source: "Video" }),
  video_published: def({ key: "video_published", label: "Video đã đăng", unit: "count", category: "video", group: "Video",
    scopes: ["global", "brand", "social"], source: "Video", rule: "Một video đăng nhiều nền tảng vẫn là một video sản xuất." }),
  design_order_completed: def({ key: "design_order_completed", label: "Order thiết kế / chụp ảnh hoàn thành", unit: "count", category: "design", group: "Thiết kế",
    scopes: ["global", "brand"], source: "Order", rule: "Theo nghiệm thu của module Order, không đếm số file." }),
  design_points_completed: def({ key: "design_points_completed", label: "Điểm thiết kế hoàn thành", unit: "point", category: "design", group: "Thiết kế",
    scopes: ["global", "brand"], source: "Order", notReady: "Chưa sẵn sàng: cần điểm order đã được Admin duyệt — chưa có dữ liệu." }),
  map_post_published: def({ key: "map_post_published", label: "Bài Google Business đã đăng", unit: "count", category: "local", group: "Local SEO",
    scopes: ["global", "brand"], source: "Local SEO (bài đăng Map)", rule: "Bài có trạng thái Đã đăng và ngày đăng trong kỳ, người phụ trách là nhân sự." }),
  local_profile_interactions: def({ key: "local_profile_interactions", label: "Tương tác hồ sơ / cuộc gọi", unit: "count", category: "local", group: "Local SEO",
    scopes: ["global", "brand"], availability: "none", source: "Chưa có nguồn dữ liệu" }),
  task_completed: def({ key: "task_completed", label: "Task hoàn thành", unit: "count", category: "task", group: "Hiệu suất",
    scopes: ["global", "brand"], source: "Task", rule: "Task Hoàn thành, ngày gửi hoàn thành trong kỳ." }),
  custom_task_result: def({ key: "custom_task_result", label: "KR tùy chỉnh (liên kết Task)", unit: "count", category: "task", group: "Hiệu suất", needs: "tasks",
    scopes: ["global", "brand"], source: "Task đã liên kết", rule: "Đếm Task đã liên kết ở trạng thái Hoàn thành. Không mặc định 1 Task = cả chỉ tiêu." }),
  task_on_time_rate: def({ key: "task_on_time_rate", label: "Tỷ lệ hoàn thành đúng hạn", unit: "percent", category: "task", group: "Hiệu suất",
    scopes: ["global", "brand"], source: "Task + lịch sử", rule: "Mẫu số: Task hoàn thành trong kỳ có deadline. Đúng hạn: ngày gửi ≤ deadline (không tính thời gian chờ duyệt)." }),
  task_first_pass_rate: def({ key: "task_first_pass_rate", label: "Tỷ lệ duyệt ngay lần đầu", unit: "percent", category: "task", group: "Hiệu suất",
    scopes: ["global", "brand"], source: "Task + lịch sử", rule: "Mẫu số: Task hoàn thành trong kỳ. Đạt: không có lần phải sửa." }),
  task_overdue: def({ key: "task_overdue", label: "Số Task quá hạn", unit: "count", category: "task", group: "Hiệu suất", direction: "at_most",
    scopes: ["global", "brand"], source: "Task", rule: "Task chưa gửi hoàn thành, deadline trong kỳ và đã qua. Task đang chờ duyệt không tính." }),
  mkt_leads: def({ key: "mkt_leads", label: "Khách hàng tiềm năng", unit: "count", category: "marketing", group: "Marketing",
    scopes: ["global", "brand", "website"], availability: "configure", source: "Số liệu tăng trưởng web (nhập tay)" }),
  mkt_conversions: def({ key: "mkt_conversions", label: "Lượt chuyển đổi", unit: "count", category: "marketing", group: "Marketing",
    scopes: ["global", "brand"], availability: "none", source: "Chưa có nguồn dữ liệu" }),
  mkt_cpl: def({ key: "mkt_cpl", label: "Chi phí / khách hàng tiềm năng", unit: "currency", category: "marketing", group: "Marketing", direction: "at_most",
    scopes: ["global", "brand"], availability: "none", source: "Chưa có nguồn dữ liệu" }),
};

export const KPI_METRIC_LIST: KpiMetricDefinition[] = Object.values(KPI_METRICS);
export const KR_GROUPS = [...new Set(KPI_METRIC_LIST.map((m) => m.group!))];
export const AVAILABILITY_LABEL: Record<KrAvailability, string> = { linked: "Đã liên kết", configure: "Cần cấu hình", none: "Chưa tích hợp" };
export const DIRECTION_LABEL = { at_least: "Đạt ít nhất", at_most: "Không vượt quá", threshold: "Đạt ngưỡng", growth: "Tăng so với kỳ gốc" } as const;

export function getKpiMetric(key: string): KpiMetricDefinition | undefined {
  return KPI_METRICS[key as KpiMetricKey];
}
/** Chỉ số có thể giao (có nguồn dữ liệu tự động). */
export const isAssignable = (m?: KpiMetricDefinition) => !!m && m.availability === "linked" && !m.notReady;
