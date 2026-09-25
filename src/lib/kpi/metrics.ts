/**
 * Thư viện KR chuẩn — dùng chung toàn Base Marketing.
 * availability: linked = Đã liên kết (tính tự động) · configure = Cần cấu hình · none = Chưa tích hợp.
 * Chỉ chỉ số "linked" mới được giao; các chỉ số còn lại hiển thị đúng trạng thái, không tạo số liệu giả.
 */
import type { KpiMetricDefinition, KpiMetricKey, KrAvailability, KrBasicGroup } from "./types";

const def = (d: KpiMetricDefinition): KpiMetricDefinition => {
  const availability: KrAvailability = d.availability ?? (d.notReady ? "none" : "linked");
  return { direction: "at_least", ...d, availability };
};

export const KPI_METRICS: Record<KpiMetricKey, KpiMetricDefinition> = {
  web_content_completed: def({ key: "web_content_completed", label: "Content được duyệt", unit: "count", category: "web", group: "Website & Content",
    scopes: ["global", "brand", "website"], source: "Content Web", rule: "Bài được duyệt lần đầu trong kỳ; ghi nhận cho người gửi duyệt bản được duyệt." }),
  web_product_published: def({ key: "web_product_published", label: "Sản phẩm Website đã đăng / cập nhật", unit: "count", category: "web", group: "Website & Content",
    scopes: ["global", "brand", "website"], availability: "none", source: "Chưa có module sản phẩm", rule: "Dùng KR tùy chỉnh liên kết Task." }),
  seo_keyword_top: def({ key: "seo_keyword_top", label: "Từ khóa đạt Top N", unit: "count", category: "seo", group: "SEO", direction: "threshold", needs: "keyword",
    scopes: ["global", "brand", "website"], source: "SEO / Check Top", rule: "Đạt khi thứ hạng mới nhất ≤ ngưỡng. Chỉ có thứ hạng hiện tại, chưa có lịch sử từng ngày." }),
  seo_organic_clicks: def({ key: "seo_organic_clicks", label: "Organic Clicks", unit: "count", category: "seo", group: "SEO", needs: "website",
    scopes: ["website"], availability: "periodic", source: "Báo cáo tăng trưởng Website (nhập theo kỳ)", rule: "Tổng Clicks các kỳ Tháng trong thời gian KR, hoặc % tăng so với kỳ gốc liền trước. Chưa nối Search Console." }),
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
  video_edit_completed: def({ key: "video_edit_completed", label: "Video được duyệt", unit: "count", category: "video", group: "Video",
    scopes: ["global", "brand"], source: "Video", rule: "Bản dựng được duyệt lần đầu (Chờ duyệt video → Video đã duyệt); ghi nhận cho người dựng." }),
  video_published: def({ key: "video_published", label: "Video đã đăng", unit: "count", category: "video", group: "Video",
    scopes: ["global", "brand", "social"], source: "Video", rule: "Một video đăng nhiều nền tảng vẫn là một video sản xuất." }),
  design_order_completed: def({ key: "design_order_completed", label: "Thiết kế hoàn thành", unit: "count", category: "design", group: "Thiết kế",
    scopes: ["global", "brand"], source: "Order", rule: "Theo nghiệm thu của module Order, không đếm số file." }),
  design_points_completed: def({ key: "design_points_completed", label: "Điểm thiết kế hoàn thành", unit: "point", category: "design", group: "Thiết kế",
    scopes: ["global", "brand"], source: "Order", notReady: "Chưa sẵn sàng: cần điểm order đã được Admin duyệt — chưa có dữ liệu." }),
  map_post_published: def({ key: "map_post_published", label: "Bài đăng Local", unit: "count", category: "local", group: "Local SEO",
    scopes: ["global", "brand"], source: "Local SEO (bài đăng Map)", rule: "Bài có trạng thái Đã đăng và ngày đăng trong kỳ, người phụ trách là nhân sự." }),
  local_profile_interactions: def({ key: "local_profile_interactions", label: "Tương tác hồ sơ / cuộc gọi", unit: "count", category: "local", group: "Local SEO",
    scopes: ["global", "brand"], availability: "none", source: "Chưa có nguồn dữ liệu" }),
  task_completed: def({ key: "task_completed", label: "Task hoàn thành", unit: "count", category: "task", group: "Hiệu suất",
    scopes: ["global", "brand"], source: "Task", rule: "Task Hoàn thành, ngày gửi hoàn thành trong kỳ." }),
  custom_task_result: def({ key: "custom_task_result", label: "KR tùy chỉnh (liên kết Task)", unit: "count", category: "task", group: "Hiệu suất", needs: "tasks",
    scopes: ["global", "brand"], source: "Task đã liên kết", rule: "Đếm Task đã liên kết ở trạng thái Hoàn thành. Không mặc định 1 Task = cả chỉ tiêu." }),
  task_on_time_rate: def({ key: "task_on_time_rate", label: "Tỷ lệ hoàn thành đúng hạn", unit: "percent", category: "task", group: "Hiệu suất",
    scopes: ["global", "brand"], source: "Task + lịch sử", rule: "Mẫu số: Task hoàn thành trong kỳ có deadline. Đúng hạn: ngày gửi ≤ deadline (không tính thời gian chờ duyệt)." }),
  task_first_pass_rate: def({ key: "task_first_pass_rate", label: "Tỷ lệ duyệt lần đầu", unit: "percent", category: "task", group: "Hiệu suất",
    scopes: ["global", "brand"], source: "Task + lịch sử", rule: "Mẫu số: Task hoàn thành trong kỳ. Đạt: không có lần phải sửa." }),
  task_overdue: def({ key: "task_overdue", label: "Số Task quá hạn", unit: "count", category: "task", group: "Hiệu suất", direction: "at_most",
    scopes: ["global", "brand"], source: "Task", rule: "Task chưa gửi hoàn thành, deadline trong kỳ và đã qua. Task đang chờ duyệt không tính." }),
  mkt_leads: def({ key: "mkt_leads", label: "Khách hàng tiềm năng (Lead)", unit: "count", category: "marketing", group: "Marketing", needs: "website",
    scopes: ["website"], availability: "periodic", source: "Báo cáo tăng trưởng Website (nhập theo kỳ)", rule: "Tổng Lead của các kỳ Tháng nằm trong thời gian KR. Không phải tích hợp tự động." }),
  mkt_conversions: def({ key: "mkt_conversions", label: "Lượt chuyển đổi", unit: "count", category: "marketing", group: "Marketing",
    scopes: ["global", "brand"], availability: "none", source: "Chưa có nguồn dữ liệu" }),
  mkt_cpl: def({ key: "mkt_cpl", label: "Chi phí trên mỗi Lead (CPL)", unit: "currency", category: "marketing", group: "Marketing", direction: "at_most",
    scopes: ["global", "brand", "website", "social"], availability: "pending", source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng",
    ratio: { numerator: "Chi phí (đ)", denominator: "Số Lead hợp lệ" }, rule: "CPL = tổng chi phí / tổng Lead hợp lệ của các lần ghi nhận đã xác nhận." }),
  web_post_published: def({ key: "web_post_published", label: "Bài đăng Website", unit: "count", category: "web", group: "Website & Content",
    scopes: ["global", "brand", "website"], source: "Content Web (bước Đăng web)", rule: "Bài đã Đăng web, ngày đăng trong kỳ, ghi nhận cho người đăng. Content được duyệt không đồng nghĩa đã đăng." }),
  social_post_published: def({ key: "social_post_published", label: "Bài đăng Social", unit: "count", category: "social", group: "Social",
    scopes: ["global", "brand", "social"], source: "Social (đúng tài khoản)", rule: "Bài trạng thái Đã đăng, ngày đăng trong kỳ, ghi nhận cho người đăng." }),
  social_views: def({ key: "social_views", label: "Lượt xem Social", unit: "count", category: "social", group: "Social", needs: "social",
    scopes: ["social"], availability: "periodic", source: "Báo cáo tăng trưởng kênh (nhập theo kỳ)", rule: "Tổng lượt xem của đúng một tài khoản; không gộp nhiều nền tảng." }),
  video_view_threshold: def({ key: "video_view_threshold", label: "Số video đạt ngưỡng lượt xem", unit: "count", category: "video", group: "Video", needs: "views",
    scopes: ["social"], availability: "manual", source: "Bằng chứng từng video, quản lý xác nhận",
    rule: "Mỗi đường dẫn video chỉ tính 1 lần khi lượt xem ≥ ngưỡng. Không dùng tổng lượt xem của kênh." }),
  mkt_quality_leads: def({ key: "mkt_quality_leads", label: "Lead chất lượng", unit: "count", category: "marketing", group: "Marketing",
    scopes: ["global", "brand", "website", "social"], availability: "pending", source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng", rule: "Lead đạt tiêu chí chất lượng đã thống nhất; không cộng trùng một Lead." }),
  mkt_conversion_rate: def({ key: "mkt_conversion_rate", label: "Tỷ lệ chuyển đổi", unit: "percent", category: "marketing", group: "Marketing",
    scopes: ["global", "brand", "website", "social"], availability: "pending", source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng",
    ratio: { numerator: "Số đơn/khách chuyển đổi", denominator: "Số Lead hợp lệ", multiplier: 100 }, rule: "Tỷ lệ = tổng chuyển đổi / tổng Lead hợp lệ × 100." }),
  mkt_orders: def({ key: "mkt_orders", label: "Số đơn hàng", unit: "count", category: "marketing", group: "Marketing",
    scopes: ["global", "brand", "website", "social"], availability: "pending", source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng" }),
  mkt_revenue: def({ key: "mkt_revenue", label: "Doanh thu chuyển đổi", unit: "currency", category: "marketing", group: "Marketing",
    scopes: ["global", "brand", "website", "social"], availability: "pending", source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng",
    rule: "Chỉ doanh thu được quy cho Marketing theo quy tắc nguồn đã thống nhất." }),
  custom_confirmed: def({ key: "custom_confirmed", label: "KR tùy chỉnh (xác nhận kết quả)", unit: "count", category: "task", group: "Hiệu suất", needs: "label",
    scopes: ["global", "brand", "website", "social"], availability: "manual", source: "Kết quả gửi kèm bằng chứng, quản lý xác nhận" }),
};

const BASIC: [KpiMetricKey, KrBasicGroup][] = [
  ["web_post_published", "Sản lượng"], ["social_post_published", "Sản lượng"], ["map_post_published", "Sản lượng"], ["web_content_completed", "Sản lượng"],
  ["video_edit_completed", "Sản lượng"], ["design_order_completed", "Sản lượng"], ["task_completed", "Sản lượng"],
  ["task_on_time_rate", "Hiệu suất"], ["task_first_pass_rate", "Hiệu suất"],
  ["seo_keyword_top", "Kết quả Marketing"], ["seo_organic_clicks", "Kết quả Marketing"], ["social_views", "Kết quả Marketing"], ["video_view_threshold", "Kết quả Marketing"],
  ["mkt_leads", "Chuyển đổi"], ["mkt_quality_leads", "Chuyển đổi"], ["mkt_conversion_rate", "Chuyển đổi"], ["mkt_orders", "Chuyển đổi"], ["mkt_revenue", "Chuyển đổi"], ["mkt_cpl", "Chuyển đổi"],
  ["custom_task_result", "Tùy chỉnh"], ["custom_confirmed", "Tùy chỉnh"],
];
BASIC.forEach(([k, g], i) => { KPI_METRICS[k].krGroup = g; if (g !== "Tùy chỉnh") KPI_METRICS[k].basic = i + 1; });

export const KPI_METRIC_LIST: KpiMetricDefinition[] = Object.values(KPI_METRICS);
/** Thư viện 19 KR cơ bản + 2 dạng KR tùy chỉnh, theo đúng thứ tự. */
export const BASIC_KR_LIST: KpiMetricDefinition[] = BASIC.map(([k]) => KPI_METRICS[k]);
export const BASIC_KR_GROUPS: KrBasicGroup[] = ["Sản lượng", "Hiệu suất", "Kết quả Marketing", "Chuyển đổi", "Tùy chỉnh"];
/** Chỉ số cần nhập/ xác nhận kết quả thủ công (không phải tự động). */
export const isManualKr = (m?: KpiMetricDefinition) => !!m && (m.availability === "manual" || m.availability === "pending");
export const KR_GROUPS = [...new Set(KPI_METRIC_LIST.map((m) => m.group!))];
export const AVAILABILITY_LABEL: Record<KrAvailability, string> = { linked: "Tự động", periodic: "Số liệu nhập theo kỳ", manual: "Xác nhận thủ công", pending: "Chờ kết nối", configure: "Cần cấu hình", none: "Chưa tích hợp" };
export const DIRECTION_LABEL = { at_least: "Đạt ít nhất", at_most: "Không vượt quá", threshold: "Đạt ngưỡng", growth: "Tăng so với kỳ gốc" } as const;

export function getKpiMetric(key: string): KpiMetricDefinition | undefined {
  return KPI_METRICS[key as KpiMetricKey];
}
/** Chỉ số có thể giao (có nguồn dữ liệu tự động). */
export const isAssignable = (m?: KpiMetricDefinition) => !!m && !m.notReady && ["linked", "periodic", "manual", "pending"].includes(m.availability!);
