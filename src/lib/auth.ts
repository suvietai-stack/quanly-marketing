import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { EffectiveBizAccess } from '@/lib/biz/access';
import {
  adminResetPassword,
  adminDeleteUser,
  usernameSignIn,
} from "@/lib/accounts.functions";
import { passwordIssues, isFakeEmail } from '@/lib/password';
import { authErrorMessage, accountAccess } from '@/lib/auth-errors';
import '@/lib/recovery-session';

export type ID = string;

// ============ Permissions registry ============
export type PermissionKey = string;

export type PermissionGroup =
  | "Tổng Quan"
  | "Task"
  | "Thương Hiệu"
  | "Dự Án Web"
  | "Social"
  | "Local"
  | "Video"
  | "Thiết Kế"
  | "Báo Cáo"
  | "Cài Đặt"
  | "Tín Hiệu Cơ Hội"
  | "Đơn Từ & Phê Duyệt"
  | "Đơn Hàng — Hỏi Giá & Tiến Độ"
  | "Theo Dõi Đơn Hàng"
  | "KPI / Giao KPI"
  | "Tài Chính Kế Toán"
  | "Tích hợp Marketing"
  | "Tài khoản"
  | "Sao Sứ Việt"
  | "Quản trị Kinh doanh"
  | "Quản lý 3K";

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  group: PermissionGroup;
  subGroup?: string;
  description?: string;
}

const P = (
  key: string,
  label: string,
  group: PermissionGroup,
  subGroup?: string,
): PermissionDef => ({ key, label, group, subGroup });

export const PERMISSIONS: PermissionDef[] = [
  P('sao.program_manage', 'Quản lý chương trình thưởng Sao', 'Sao Sứ Việt'),
  P('sao.shop_manage', 'Quản lý quà và xác nhận phát quà', 'Sao Sứ Việt'),
  P('sao.manual_grant', 'Cộng Sao thủ công có lý do', 'Sao Sứ Việt'),
  // ===== Quản trị Kinh doanh =====
  P('biz.view_own', 'Xem dữ liệu cá nhân', 'Quản trị Kinh doanh', 'Xem'),
  P('biz.view_dept', 'Xem dữ liệu phòng ban mình', 'Quản trị Kinh doanh', 'Xem'),
  P('biz.view_all', 'Ngoại lệ xem hồ sơ chi tiết toàn Khối', 'Quản trị Kinh doanh', 'Xem'),
  P('biz.dashboard_public', 'Xem Dashboard tổng hợp toàn Khối', 'Quản trị Kinh doanh', 'Xem'),
  P('biz.plan_submit', 'Nộp kế hoạch kinh doanh', 'Quản trị Kinh doanh', 'Nộp'),
  P('biz.goal_submit', 'Lập và gửi mục tiêu KR', 'Quản trị Kinh doanh', 'Nộp'),
  P('biz.report_submit', 'Nộp báo cáo kinh doanh', 'Quản trị Kinh doanh', 'Nộp'),
  P('biz.plan_request_revision', 'Yêu cầu chỉnh sửa kế hoạch', 'Quản trị Kinh doanh', 'Duyệt'),
  P('biz.plan_approve', 'Duyệt kế hoạch (quy trình cũ)', 'Quản trị Kinh doanh', 'Duyệt'),
  P('biz.goal_approve', 'Duyệt mục tiêu KR', 'Quản trị Kinh doanh', 'Duyệt'),
  P('biz.report_approve', 'Duyệt báo cáo', 'Quản trị Kinh doanh', 'Duyệt'),
  P('biz.kr_manage', 'Quản lý chỉ số KR', 'Quản trị Kinh doanh', 'Cài đặt'),
  P('biz.dept_manage', 'Quản lý phòng ban kinh doanh', 'Quản trị Kinh doanh', 'Cài đặt'),
  P('biz.deadline_manage', 'Quản lý deadline nộp', 'Quản trị Kinh doanh', 'Cài đặt'),
  P('biz.org_manage', 'Quản lý cơ cấu tổ chức và phân công', 'Quản trị Kinh doanh', 'Cài đặt'),
  P('biz.workflow_manage', 'Cấu hình quy trình phê duyệt', 'Quản trị Kinh doanh', 'Cài đặt'),
  P('biz.approval_view', 'Xem Trung tâm Phê duyệt trong phạm vi', 'Quản trị Kinh doanh', 'Duyệt'),
  // ===== Quản lý 3K =====
  P('k3.use', 'Lập và cập nhật 3K cá nhân', 'Quản lý 3K', 'Sử dụng'),
  P('k3.view_scope', 'Xem 3K trong phạm vi quản lý', 'Quản lý 3K', 'Xem'),
  P('k3.comment', 'Nhận xét 3K nhân viên', 'Quản lý 3K', 'Xem'),
  P('k3.settings', 'Cấu hình module 3K', 'Quản lý 3K', 'Cài đặt'),
  // ===== A. Tổng Quan =====
  P("overview.view", "Xem Tổng Quan", "Tổng Quan", "Tổng quan"),
  P("overview.alerts", "Xem việc cần chú ý", "Tổng Quan", "Tổng quan"),
  P("overview.all_dept", "Xem việc của toàn phòng", "Tổng Quan", "Tổng quan"),
  P("overview.own_only", "Chỉ xem việc liên quan đến mình", "Tổng Quan", "Tổng quan"),
  P("overview.brand_summary", "Thống kê theo thương hiệu", "Tổng Quan", "Thống kê"),
  P("overview.module_summary", "Thống kê theo module", "Tổng Quan", "Thống kê"),
  P("overview.staff_summary", "Thống kê theo người phụ trách", "Tổng Quan", "Thống kê"),

  // ===== B. Task =====
  P("task.view", "Xem task", "Task", "Dữ liệu"),
  P("task.view_all", "Xem tất cả task", "Task", "Dữ liệu"),
  P("task.view_mine", "Chỉ xem task liên quan đến mình", "Task", "Dữ liệu"),
  P("task.view_created_by_me", "Xem task tôi giao", "Task", "Dữ liệu"),
  P("task.create", "Tạo task", "Task", "CRUD"),
  P("task.edit", "Sửa task", "Task", "CRUD"),
  P("task.delete", "Xóa task", "Task", "CRUD"),
  P("task.assign", "Giao task", "Task", "CRUD"),
  P("task.edit_assignee", "Sửa người phụ trách task", "Task", "CRUD"),
  P("task.edit_deadline", "Sửa deadline task", "Task", "CRUD"),
  P("task.edit_priority", "Sửa mức ưu tiên task", "Task", "CRUD"),
  // Legacy keys kept for backward compatibility
  P("task.accept", "Nhận task (legacy)", "Task", "Workflow"),
  P("task.update_status", "Cập nhật trạng thái task (legacy)", "Task", "Workflow"),
  P("task.complete", "Hoàn thành task (legacy)", "Task", "Workflow"),
  // New workflow keys
  P("task.start", "Bắt đầu làm task", "Task", "Workflow"),
  P("task.update_result", "Cập nhật kết quả task", "Task", "Workflow"),
  P("task.submit_completion", "Gửi hoàn thành task", "Task", "Workflow"),
  P("task.resubmit_completion", "Gửi lại hoàn thành task", "Task", "Workflow"),
  P("task.approve_completion", "Xác nhận hoàn thành task", "Task", "Workflow"),
  P("task.request_revision", "Yêu cầu sửa task", "Task", "Workflow"),
  P("task.cancel", "Hủy task", "Task", "Workflow"),
  P("task.restore", "Khôi phục task đã hủy", "Task", "Workflow"),
  P("task.reopen_completed", "Mở lại task đã hoàn thành", "Task", "Workflow"),
  P("task.force_status", "Ép chuyển trạng thái task", "Task", "Workflow"),
  P("task.force_change_status", "Ép chuyển trạng thái task (alias)", "Task", "Workflow"),
  P("task.view_history", "Xem lịch sử xử lý task", "Task", "Lịch sử"),
  P("task.add_note", "Ghi chú xử lý task", "Task", "Lịch sử"),

  // ===== C. Thương Hiệu =====
  P("brand.view", "Xem thương hiệu", "Thương Hiệu", "Dữ liệu"),
  P("brand.view_all", "Xem tất cả thương hiệu", "Thương Hiệu", "Dữ liệu"),
  P("brand.create", "Tạo thương hiệu", "Thương Hiệu", "CRUD"),
  P("brand.edit", "Sửa thương hiệu", "Thương Hiệu", "CRUD"),
  P("brand.delete", "Xóa thương hiệu", "Thương Hiệu", "CRUD"),
  P("brand.profile", "Quản lý hồ sơ thương hiệu", "Thương Hiệu", "Quản lý"),
  P("brand.identity", "Quản lý nhận diện thương hiệu", "Thương Hiệu", "Quản lý"),
  P("brand.view_channels", "Quản lý kênh liên kết", "Thương Hiệu", "Quản lý"),
  P("brand.docs", "Quản lý tài liệu/guideline", "Thương Hiệu", "Quản lý"),
  P("brand.staff", "Quản lý nhân sự phụ trách", "Thương Hiệu", "Quản lý"),
  P("brand.contact", "Quản lý thông tin liên hệ", "Thương Hiệu", "Quản lý"),
  P("brand.notes", "Quản lý ghi chú vận hành", "Thương Hiệu", "Quản lý"),

  // ===== D. Dự Án Web =====
  // D1. Chung
  P("web.view", "Xem dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.view_all", "Xem tất cả dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.view_mine", "Chỉ xem dự án web liên quan đến mình", "Dự Án Web", "D1. Dự án chung"),
  P("web.create", "Tạo dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.edit", "Sửa dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.delete", "Xóa dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.open_detail", "Mở chi tiết dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.manage_info", "Quản lý thông tin dự án", "Dự Án Web", "D1. Dự án chung"),
  P("web.assign_seo", "Gán người phụ trách SEO", "Dự Án Web", "D1. Dự án chung"),
  P("web.assign_content", "Gán người phụ trách Content", "Dự Án Web", "D1. Dự án chung"),
  P("web.assign_tech", "Gán người phụ trách kỹ thuật", "Dự Án Web", "D1. Dự án chung"),
  // D2. Technical SEO
  P("web.tech_view", "Xem Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_check", "Tích checklist Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_edit_desc", "Sửa diễn giải checklist", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_reset", "Reset checklist Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_template", "Quản lý template checklist Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  // D3. Entity / Social SEO
  P("web.entity_view", "Xem Entity / Social SEO", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_create", "Thêm Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_edit", "Sửa Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_delete", "Xóa Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_open_link", "Mở link Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_view_account", "Xem thông tin tài khoản Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_reveal_password", "Xem mật khẩu Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  // D4. Keyword research
  P("web.keyword_view", "Xem Nghiên Cứu Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_topic_create", "Tạo Topic Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_topic_edit", "Sửa Topic Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_topic_delete", "Xóa Topic Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_open_sheet", "Mở Link Sheet Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_manage_sheet", "Quản lý Link Sheet Keyword", "Dự Án Web", "D4. Keyword"),
  // D5. Content Web — dữ liệu
  P("web.content_view", "Xem Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_view_all", "Xem tất cả Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_view_mine", "Chỉ xem Content Web liên quan", "Dự Án Web", "D5. Content Web"),
  P("web.content_create", "Tạo content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit", "Sửa content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_delete", "Xóa content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_assign", "Giao content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_brief", "Sửa brief Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_deadline", "Sửa deadline Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_writer", "Sửa người viết", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_outline_reviewer", "Sửa người duyệt outline", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_article_reviewer", "Sửa người duyệt bài", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_publisher", "Sửa người đăng web", "Dự Án Web", "D5. Content Web"),
  // D5. Content Web — workflow
  P("web.outline_start", "Bắt đầu làm outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_submit", "Gửi duyệt outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_approve", "Duyệt outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_reject", "Yêu cầu sửa outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_resubmit", "Gửi duyệt lại outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.post_write_start", "Bắt đầu viết bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_submit", "Gửi duyệt bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_approve", "Duyệt bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_reject", "Yêu cầu sửa bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_resubmit", "Gửi duyệt lại bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.move_pending_publish", "Chuyển sang chờ đăng", "Dự Án Web", "D5. Workflow Bài"),
  // D5. Duyệt bản nháp web
  P("web.view_web_draft_url", "Xem link bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.edit_web_draft_url", "Chỉnh link bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.start_web_draft_layout", "Bắt đầu trình bày nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.submit_web_draft_review", "Gửi duyệt bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.resubmit_web_draft_review", "Gửi duyệt lại bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.approve_web_draft", "Duyệt bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.request_web_draft_revision", "Yêu cầu sửa bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.view_web_draft_revision_note", "Xem ghi chú sửa bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.edit_web_draft_note", "Sửa ghi chú bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.force_change_web_draft_status", "Ép chuyển trạng thái bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.publish", "Xác nhận đã đăng web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.complete", "Hoàn thành Content Web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.content_cancel", "Hủy Content Web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.content_restore", "Khôi phục Content Web đã hủy", "Dự Án Web", "D5. Workflow Bài"),
  P("web.force_status", "Ép chuyển trạng thái Content Web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.content_history", "Xem lịch sử xử lý Content Web", "Dự Án Web", "D5. Lịch sử"),
  P("web.content_note", "Ghi chú xử lý Content Web", "Dự Án Web", "D5. Lịch sử"),
  // D6. Index / Share Social
  P("web.index_view", "Xem Bài đã đăng / Index", "Dự Án Web", "D6. Index"),
  P("web.update_index", "Cập nhật trạng thái index", "Dự Án Web", "D6. Index"),
  P("web.update_share", "Cập nhật Share Social", "Dự Án Web", "D6. Index"),
  P("web.update_share_date", "Cập nhật ngày share social", "Dự Án Web", "D6. Index"),
  P("web.select_shared_entity", "Chọn Entity đã share", "Dự Án Web", "D6. Index"),
  P("web.edit_published_url", "Sửa link bài đã đăng", "Dự Án Web", "D6. Index"),
  P("web.open_published_url", "Mở link bài đã đăng", "Dự Án Web", "D6. Index"),
  // D7. Backlink / PR
  P("web.backlink_view", "Xem Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_create", "Thêm Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_edit", "Sửa Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_delete", "Xóa Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_status", "Cập nhật trạng thái Backlink", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_open", "Mở link bài PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_cost", "Quản lý chi phí Backlink", "Dự Án Web", "D7. Backlink"),
  // D8. Check TOP
  P("web.checktop_view", "Xem Check TOP", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_primary", "Cập nhật TOP từ khóa chính", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_secondary", "Cập nhật TOP từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_kw_create", "Thêm từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_kw_edit", "Sửa từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_kw_delete", "Xóa từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_open_url", "Mở URL đích", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_filter_topic", "Lọc/check theo Topic", "Dự Án Web", "D8. Check TOP"),
  // D9. Tối ưu lại Content
  P("web.reopt_view", "Xem Tối ưu lại Content", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_create", "Tạo đầu việc tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_edit", "Sửa đầu việc tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_delete", "Xóa đầu việc tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_assign", "Giao tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_status", "Cập nhật trạng thái tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_complete", "Hoàn thành tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("set_content_optimization_schedule", "Thiết lập lịch tối ưu từ Bài đã đăng", "Dự Án Web", "D9. Tối ưu lại"),
  P("pause_content_optimization_schedule", "Tạm dừng/khôi phục lịch tối ưu", "Dự Án Web", "D9. Tối ưu lại"),
  P("create_content_optimization", "Tạo việc tối ưu từ Bài đã đăng", "Dự Án Web", "D9. Tối ưu lại"),
  P("create_scheduled_content_optimization", "Kiểm tra & tạo việc tối ưu theo lịch", "Dự Án Web", "D9. Tối ưu lại"),
  // D10. Tăng trưởng
  P("web.growth_view", "Xem Tăng Trưởng Website", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_create", "Thêm kỳ báo cáo tăng trưởng", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_edit", "Sửa kỳ báo cáo tăng trưởng", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_delete", "Xóa kỳ báo cáo tăng trưởng", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_open", "Mở link báo cáo GA/GSC", "Dự Án Web", "D10. Tăng trưởng"),
  // D11. Báo cáo Web
  P("web.report_view", "Xem Báo Cáo Web", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_alerts", "Xem Việc cần chú ý web", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_alerts_all", "Xem tất cả Việc cần chú ý", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_action", "Mở cảnh báo nhanh", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_by_topic", "Báo cáo theo Topic", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_by_staff", "Báo cáo theo người phụ trách", "Dự Án Web", "D11. Báo cáo"),

  // ===== E. Social =====
  // E1. Kênh
  P("social.view", "Xem kênh social", "Social", "E1. Kênh"),
  P("social.view_all", "Xem tất cả kênh social", "Social", "E1. Kênh"),
  P("social.view_mine", "Chỉ xem kênh liên quan", "Social", "E1. Kênh"),
  P("social.create", "Tạo kênh social", "Social", "E1. Kênh"),
  P("social.edit", "Sửa kênh social", "Social", "E1. Kênh"),
  P("social.delete", "Xóa kênh social", "Social", "E1. Kênh"),
  P("social.manage_info", "Quản lý thông tin kênh", "Social", "E1. Kênh"),
  P("social.assign_owner", "Gán người phụ trách kênh", "Social", "E1. Kênh"),
  // E2. Sản xuất
  P("social.post_view", "Xem bài social", "Social", "E2. Sản xuất"),
  P("social.post_view_all", "Xem tất cả bài social", "Social", "E2. Sản xuất"),
  P("social.post_view_mine", "Chỉ xem bài liên quan", "Social", "E2. Sản xuất"),
  P("social.post_create", "Tạo bài social", "Social", "E2. Sản xuất"),
  P("social.post_edit", "Sửa bài social", "Social", "E2. Sản xuất"),
  P("social.post_delete", "Xóa bài social", "Social", "E2. Sản xuất"),
  P("social.post_assign", "Giao bài social", "Social", "E2. Sản xuất"),
  P("social.post_start", "Bắt đầu làm bài social", "Social", "E2. Sản xuất"),
  P("social.post_submit", "Gửi duyệt bài social", "Social", "E2. Sản xuất"),
  P("social.post_resubmit", "Gửi duyệt lại bài social", "Social", "E2. Sản xuất"),
  P("social.post_approve", "Duyệt bài social", "Social", "E2. Sản xuất"),
  P("social.post_request_changes", "Yêu cầu sửa bài social", "Social", "E2. Sản xuất"),
  P("social.post_move_pending_publish", "Chuyển bài sang chờ đăng", "Social", "E2. Sản xuất"),
  P("social.post_confirm_published", "Xác nhận đã đăng bài social", "Social", "E2. Sản xuất"),
  P("social.post_complete", "Hoàn thành bài social", "Social", "E2. Sản xuất"),
  P("social.post_cancel", "Hủy bài social", "Social", "E2. Sản xuất"),
  P("social.post_restore", "Khôi phục bài social đã hủy", "Social", "E2. Sản xuất"),
  P("social.post_force_status", "Ép chuyển trạng thái bài social", "Social", "E2. Sản xuất"),
  P("social.post_history", "Xem lịch sử xử lý bài social", "Social", "E2. Sản xuất"),
  // E3. Tăng trưởng
  P("social.growth_view", "Xem tăng trưởng social", "Social", "E3. Tăng trưởng"),
  P("social.growth_create", "Thêm kỳ báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.growth_edit", "Sửa kỳ báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.growth_delete", "Xóa kỳ báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.growth_update", "Cập nhật tăng trưởng social", "Social", "E3. Tăng trưởng"),
  P("social.growth_open", "Mở link báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.report", "Xem báo cáo social", "Social", "E3. Tăng trưởng"),

  // ===== F. Local =====
  P("local.view", "Xem local map", "Local", "Địa điểm"),
  P("local.view_all", "Xem tất cả Local Map", "Local", "Địa điểm"),
  P("local.view_mine", "Chỉ xem Local liên quan", "Local", "Địa điểm"),
  P("local.create", "Tạo địa điểm", "Local", "Địa điểm"),
  P("local.edit", "Sửa địa điểm", "Local", "Địa điểm"),
  P("local.delete", "Xóa địa điểm", "Local", "Địa điểm"),
  P("local.assign_owner", "Gán người phụ trách Local", "Local", "Địa điểm"),
  P("local.post_create", "Tạo bài đăng Map", "Local", "Bài đăng"),
  P("local.post_edit", "Sửa bài đăng Map", "Local", "Bài đăng"),
  P("local.post_delete", "Xóa bài đăng Map", "Local", "Bài đăng"),
  P("local.photo", "Cập nhật ảnh địa điểm", "Local", "Bài đăng"),
  P("local.products", "Quản lý sản phẩm/dịch vụ Map", "Local", "Bài đăng"),
  P("local.review", "Xem review", "Local", "Review"),
  P("local.review_create", "Thêm review thủ công", "Local", "Review"),
  P("local.review_reply", "Phản hồi review", "Local", "Review"),
  P("local.review_status", "Cập nhật trạng thái phản hồi", "Local", "Review"),
  P("local.growth_view", "Xem tăng trưởng Local", "Local", "Tăng trưởng"),
  P("local.growth_create", "Thêm kỳ báo cáo Local", "Local", "Tăng trưởng"),
  P("local.growth_edit", "Sửa kỳ báo cáo Local", "Local", "Tăng trưởng"),
  P("local.growth_delete", "Xóa kỳ báo cáo Local", "Local", "Tăng trưởng"),
  P("local.report", "Xem báo cáo local", "Local", "Tăng trưởng"),

  // ===== G. Video =====
  P("video.view", "Xem video", "Video", "Dữ liệu"),
  P("video.view_all", "Xem tất cả video", "Video", "Dữ liệu"),
  P("video.view_mine", "Chỉ xem video liên quan", "Video", "Dữ liệu"),
  P("video.create", "Tạo video", "Video", "CRUD"),
  P("video.edit", "Sửa video", "Video", "CRUD"),
  P("video.delete", "Xóa video", "Video", "CRUD"),
  P("video.assign", "Giao video", "Video", "Workflow"),
  P("video.script_start", "Bắt đầu làm kịch bản", "Video", "Workflow"),
  P("video.script_submit", "Gửi duyệt kịch bản", "Video", "Workflow"),
  P("video.script_resubmit", "Gửi duyệt lại kịch bản", "Video", "Workflow"),
  P("video.script_approve", "Duyệt kịch bản", "Video", "Workflow"),
  P("video.script_reject", "Yêu cầu sửa kịch bản", "Video", "Workflow"),
  P("video.move_shooting", "Chuyển sang quay / thu tư liệu", "Video", "Workflow"),
  P("video.footage", "Cập nhật footage", "Video", "Workflow"),
  P("video.move_editing", "Chuyển sang đang dựng", "Video", "Workflow"),
  P("video.edit_cut", "Cập nhật bản dựng", "Video", "Workflow"),
  P("video.submit", "Gửi duyệt video", "Video", "Workflow"),
  P("video.resubmit", "Gửi duyệt lại video", "Video", "Workflow"),
  P("video.approve", "Duyệt video", "Video", "Workflow"),
  P("video.reject", "Yêu cầu sửa video", "Video", "Workflow"),
  P("video.deliver", "Bàn giao video", "Video", "Workflow"),
  P("video.confirm_published", "Xác nhận đã đăng video", "Video", "Workflow"),
  P("video.complete", "Hoàn thành video", "Video", "Workflow"),
  P("video.cancel", "Hủy video", "Video", "Workflow"),
  P("video.restore", "Khôi phục video đã hủy", "Video", "Workflow"),
  P("video.force_status", "Ép chuyển trạng thái video", "Video", "Workflow"),
  P("video.history", "Xem lịch sử xử lý video", "Video", "Lịch sử"),
  P("video.create_design_order", "Tạo order thiết kế từ video", "Video", "Tích hợp"),

  // ===== H. Order Thiết Kế =====
  P("order.view", "Xem order thiết kế", "Thiết Kế", "Dữ liệu"),
  P("order.view_all", "Xem tất cả order", "Thiết Kế", "Dữ liệu"),
  P("order.view_mine", "Chỉ xem order liên quan", "Thiết Kế", "Dữ liệu"),
  P("order.create", "Tạo order thiết kế", "Thiết Kế", "CRUD"),
  P("order.edit", "Sửa order thiết kế", "Thiết Kế", "CRUD"),
  P("order.edit_reviewer", "Chỉnh Người duyệt order", "Thiết Kế", "CRUD"),
  P("order.delete", "Xóa order thiết kế", "Thiết Kế", "CRUD"),
  P("order.send_request", "Gửi yêu cầu order", "Thiết Kế", "Workflow"),
  P("order.assign", "Gán người phụ trách order", "Thiết Kế", "Workflow"),
  P("order.take", "Nhận order", "Thiết Kế", "Workflow"),
  P("order.update_draft", "Cập nhật file nháp", "Thiết Kế", "Workflow"),
  P("order.submit", "Gửi duyệt order", "Thiết Kế", "Workflow"),
  P("order.resubmit", "Gửi duyệt lại order", "Thiết Kế", "Workflow"),
  P("order.approve", "Duyệt order", "Thiết Kế", "Workflow"),
  P("order.request_changes", "Yêu cầu sửa order", "Thiết Kế", "Workflow"),
  P("order.deliver", "Bàn giao file", "Thiết Kế", "Workflow"),
  P("order.complete", "Xác nhận hoàn thành order", "Thiết Kế", "Workflow"),
  P("order.cancel", "Hủy order", "Thiết Kế", "Workflow"),
  P("order.restore", "Khôi phục order đã hủy", "Thiết Kế", "Workflow"),
  P("order.force_status", "Ép chuyển trạng thái order", "Thiết Kế", "Workflow"),
  P("order.history", "Xem lịch sử xử lý order", "Thiết Kế", "Lịch sử"),
  P("order.open_delivery", "Mở link file bàn giao", "Thiết Kế", "Lịch sử"),
  P("order.report_view", "Xem báo cáo Order Thiết Kế", "Thiết Kế", "Báo cáo"),

  // ===== I. Báo Cáo =====
  P("report.view", "Xem báo cáo tổng quan", "Báo Cáo", "Báo cáo"),
  P("report.by_brand", "Báo cáo theo thương hiệu", "Báo Cáo", "Báo cáo"),
  P("report.by_module", "Báo cáo theo module", "Báo Cáo", "Báo cáo"),
  P("report.by_staff", "Báo cáo theo người phụ trách", "Báo Cáo", "Báo cáo"),
  P("report.attention", "Xem việc cần chú ý toàn app", "Báo Cáo", "Cảnh báo"),
  P("report.attention_all", "Xem tất cả cảnh báo", "Báo Cáo", "Cảnh báo"),
  P("report.export", "Xuất báo cáo", "Báo Cáo", "Báo cáo"),
  P("report.growth", "Xem dữ liệu tăng trưởng", "Báo Cáo", "Báo cáo"),

  // ===== J. Cài Đặt =====
  P("settings.view", "Xem cài đặt", "Cài Đặt", "Hệ thống"),
  P("settings.people", "Quản lý nhân sự", "Cài Đặt", "Danh mục"),
  P("settings.catalog", "Quản lý danh mục trạng thái", "Cài Đặt", "Danh mục"),
  P("settings.brand_types", "Quản lý loại thương hiệu", "Cài Đặt", "Danh mục"),
  P("settings.web_types", "Quản lý loại website", "Cài Đặt", "Danh mục"),
  P("settings.social_types", "Quản lý loại kênh social", "Cài Đặt", "Danh mục"),
  P("settings.task_types", "Quản lý loại task", "Cài Đặt", "Danh mục"),
  P("settings.video_types", "Quản lý loại video", "Cài Đặt", "Danh mục"),
  P("settings.design_types", "Quản lý loại thiết kế", "Cài Đặt", "Danh mục"),
  P("settings.priority", "Quản lý mức ưu tiên", "Cài Đặt", "Danh mục"),
  P("settings.plan_topic", "Quản lý Plan / Topic", "Cài Đặt", "Danh mục"),
  P("settings.template", "Quản lý template checklist", "Cài Đặt", "Danh mục"),
  P("settings.system_view", "Xem thông tin hệ thống", "Cài Đặt", "Hệ thống"),
  P("system.branding", "Quản lý thông tin hệ thống", "Cài Đặt", "Hệ thống"),
  P("settings.system_edit", "Chỉnh thông tin hệ thống", "Cài Đặt", "Hệ thống"),
  P("settings.view_presence", "Xem trạng thái online nhân sự", "Cài Đặt", "Nhân sự"),

  // ===== Tín hiệu cơ hội =====
  P("signal.create", "Tạo tín hiệu (Marketing)", "Tín Hiệu Cơ Hội", "Marketing"),
  P("signal.view_all", "Xem toàn bộ tín hiệu", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.assign", "Phân công Sale", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.reassign", "Đổi Sale", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.manage", "Quản lý tín hiệu (sửa, xóa, hủy, mở lại)", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.edit", "Sửa thông tin tín hiệu", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.delete", "Xóa tín hiệu (chưa có nhật ký)", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.sale", "Kinh doanh — nhận tín hiệu được giao", "Tín Hiệu Cơ Hội", "Kinh doanh"),
  P("signal.report", "Xem báo cáo tín hiệu", "Tín Hiệu Cơ Hội", "Báo cáo"),
  P("signal.catalog", "Quản lý danh mục tín hiệu (Nguồn, Loại sản phẩm, Nhóm nhu cầu)", "Tín Hiệu Cơ Hội", "Quản lý"),

  // ===== KPI / Giao KPI =====
  P("kpi.view_own", "Xem KPI cá nhân", "KPI / Giao KPI", "Xem"),
  P("kpi.view_all", "Xem toàn bộ KPI", "KPI / Giao KPI", "Xem"),
  P("kpi.goal_create", "Tạo mục tiêu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.goal_edit", "Sửa mục tiêu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.goal_archive", "Hủy / Lưu trữ mục tiêu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.goal_delete", "Xóa mục tiêu chưa phát sinh dữ liệu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.kr_assign", "Thêm / Giao KR", "KPI / Giao KPI", "KR & Chỉ tiêu"),
  P("kpi.kr_adjust", "Điều chỉnh KR đã giao", "KPI / Giao KPI", "KR & Chỉ tiêu"),
  P("kpi.period_manage", "Quản lý kỳ KPI", "KPI / Giao KPI", "Kỳ KPI"),
  P("kpi.report", "Xem báo cáo KPI", "KPI / Giao KPI", "Báo cáo"),
  P("kpi.report_export", "Xuất báo cáo KPI", "KPI / Giao KPI", "Báo cáo"),

  // ===== Đơn từ & Phê duyệt =====
  P("leave.view_own", "Xem đơn cá nhân", "Đơn Từ & Phê Duyệt", "Xem"),
  P("leave.view_assigned", "Xem đơn được giao duyệt", "Đơn Từ & Phê Duyệt", "Xem"),
  P("leave.view_all", "Xem toàn bộ đơn", "Đơn Từ & Phê Duyệt", "Xem"),
  P("leave.create", "Tạo đơn cá nhân", "Đơn Từ & Phê Duyệt", "Tạo"),
  P("leave.create_for", "Tạo đơn hộ", "Đơn Từ & Phê Duyệt", "Tạo"),
  P("leave.edit_own", "Sửa đơn cá nhân", "Đơn Từ & Phê Duyệt", "Sửa"),
  P("leave.edit_others", "Sửa đơn nhân viên", "Đơn Từ & Phê Duyệt", "Sửa"),
  P("leave.recall", "Thu hồi đơn cá nhân", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.approve", "Phê duyệt đơn (chỉ đơn được chỉ định)", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.reassign", "Chuyển người duyệt", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.cancel_handle", "Xử lý hủy đơn", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.exception", "Xử lý ngoại lệ đơn từ", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.report", "Xem báo cáo đơn từ", "Đơn Từ & Phê Duyệt", "Báo cáo"),
  P("leave.export", "Xuất báo cáo", "Đơn Từ & Phê Duyệt", "Báo cáo"),
  P("leave.settings", "Quản lý cài đặt đơn từ", "Đơn Từ & Phê Duyệt", "Cài đặt"),
  P("att.create", "Tạo giải trình chấm công cá nhân", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.view_own", "Xem giải trình cá nhân", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.edit_own", "Sửa / thu hồi giải trình cá nhân", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.witness", "Xác nhận làm chứng (chỉ giải trình được chọn)", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.view_all", "Xem toàn bộ giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.reconcile", "Đối chiếu giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.report", "Xem báo cáo giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.manage", "Quản lý giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.settings", "Quản lý cài đặt giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),

  // ===== Đơn hàng — Hỏi Giá & Tiến Độ =====
  P("oq.create", "Tạo yêu cầu", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Kinh doanh"),
  P("oq.view_own", "Xem yêu cầu cá nhân", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Xem"),
  P("oq.view_all", "Xem toàn bộ yêu cầu", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Xem"),
  P("oq.accept", "Tiếp nhận yêu cầu được giao", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Cung ứng"),
  P("oq.reply_price", "Phản hồi Hỏi Giá", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Cung ứng"),
  P("oq.reply_progress", "Phản hồi Hỏi Tiến Độ", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Cung ứng"),
  P("oq.manage", "Quản lý yêu cầu (can thiệp trường hợp đặc biệt)", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Quản lý"),
  P("oq.delete_cancelled", "Xóa yêu cầu đã hủy", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Quản lý"),
  P("oq.report_own", "Xem báo cáo cá nhân", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Báo cáo"),
  P("oq.report_all", "Xem báo cáo toàn bộ Hỏi Giá & Tiến Độ", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Báo cáo"),
  P("oq.report_export", "Xuất báo cáo Excel", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Báo cáo"),

  // ===== Theo Dõi Đơn Hàng =====
  P("ot.view_own", "Xem đơn phụ trách", "Theo Dõi Đơn Hàng", "Xem"),
  P("ot.view_all", "Xem toàn bộ đơn", "Theo Dõi Đơn Hàng", "Xem"),
  P("ot.create", "Tạo đơn thủ công", "Theo Dõi Đơn Hàng", "Đơn hàng"),
  P("ot.accept", "Tiếp nhận đơn", "Theo Dõi Đơn Hàng", "Đơn hàng"),
  P("ot.assign", "Phân công người phụ trách", "Theo Dõi Đơn Hàng", "Đơn hàng"),
  P("ot.task_view", "Xem công việc được giao", "Theo Dõi Đơn Hàng", "Công việc"),
  P("ot.task_update", "Cập nhật công việc được giao", "Theo Dõi Đơn Hàng", "Công việc"),
  P("ot.stage_update", "Cập nhật tiến độ công đoạn", "Theo Dõi Đơn Hàng", "Công việc"),
  P("ot.reschedule_propose", "Đề xuất điều chỉnh lịch", "Theo Dõi Đơn Hàng", "Điều chỉnh lịch"),
  P("ot.reschedule_reply", "Phản hồi điều chỉnh lịch", "Theo Dõi Đơn Hàng", "Điều chỉnh lịch"),
  P("ot.supplier", "Quản lý nhà cung cấp", "Theo Dõi Đơn Hàng", "Quản lý"),
  P("ot.manage", "Quản lý đơn hàng", "Theo Dõi Đơn Hàng", "Quản lý"),
  P("ot.report", "Xem báo cáo", "Theo Dõi Đơn Hàng", "Báo cáo"),
  P("ot.report_export", "Xuất báo cáo", "Theo Dõi Đơn Hàng", "Báo cáo"),
  P("ot.settings", "Quản lý cài đặt đơn hàng", "Theo Dõi Đơn Hàng", "Quản lý"),

  // ===== Tài Chính Kế Toán =====
  P("finance.incoming.view", "Xem Tiền Về", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  P("finance.incoming.claim", "Sale xác nhận giao dịch", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  P("finance.incoming.reconcile", "Xem toàn bộ / sửa ghi chú / xác nhận loại Khác", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manual_view", "Xem khoản thủ công (Tiền mặt / TK khác)", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  P("finance.incoming.view_totals", "Xem tổng tiền và thống kê tài chính", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manual_create", "Thêm khoản thủ công", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manual_manage", "Quản lý (sửa / hủy) khoản thủ công", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manage", "Quản lý / điều chỉnh giao dịch", "Tài Chính Kế Toán", "Tiền Về — Quản trị"),
  P("finance.incoming.bank_config", "Cài đặt ngân hàng", "Tài Chính Kế Toán", "Tiền Về — Quản trị"),
  P("finance.incoming.gmf_config", "Cài đặt thông báo Zalo GMF", "Tài Chính Kế Toán", "Tiền Về — Quản trị"),
  P("finance.incoming.remind", "Nhắc xác nhận thủ công", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),

  // ===== Tích hợp Marketing =====
  P("integration.facebook_leads", "Quản lý Facebook Lead Ads (kết nối Page, cấu hình Form, xem lỗi, thử lại)", "Tích hợp Marketing", "Facebook Lead Ads"),
  P("integration.website_forms", "Quản lý Website Forms (thêm Website, cấp/thu hồi khóa, cấu hình Form, xem lỗi, thử lại)", "Tích hợp Marketing", "Website Forms"),

  // ===== K. Tài khoản / Role / Phân quyền =====
  P("settings.user_view", "Xem tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_create", "Tạo tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_edit", "Sửa tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_delete", "Xóa tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.account_lock", "Khóa/mở khóa tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_reset_password", "Reset mật khẩu", "Tài khoản", "Tài khoản"),
  P("settings.account_approve", "Duyệt tài khoản mới", "Tài khoản", "Tài khoản"),
  P("settings.account_reject", "Từ chối tài khoản mới", "Tài khoản", "Tài khoản"),
  P("settings.assign_role", "Gán role", "Tài khoản", "Role"),
  P("settings.role", "Tạo / sửa / xóa role", "Tài khoản", "Role"),
  P("settings.permission", "Quản lý ma trận phân quyền", "Tài khoản", "Role"),
  P("settings.user_custom_perm", "Tùy chỉnh quyền riêng theo user", "Tài khoản", "Role"),
  P("settings.login_history", "Xem lịch sử đăng nhập", "Tài khoản", "Audit"),
  P("settings.activity_log", "Xem log thao tác", "Tài khoản", "Audit"),
];

export const ALL_PERMS = PERMISSIONS.map((p) => p.key);
export const PERMISSION_BY_KEY: Record<string, PermissionDef> = Object.fromEntries(
  PERMISSIONS.map((p) => [p.key, p]),
);

/**
 * Parent → required parent permissions. A user only effectively HAS the child
 * permission if they also have every parent listed here.
 * This is the single source of truth for the auto-tick/untick logic in the
 * permission matrix UI, the strict `can()` check, and the audit report.
 */
export const PERMISSION_DEPENDS: Record<string, PermissionKey[]> = (() => {
  const m: Record<string, PermissionKey[]> = {};
  // ------- Dự Án Web -------
  // Most web.* sub-permissions require web.view (module access)
  const webViewKey = "web.view";
  // D2 Technical SEO
  ["web.tech_check", "web.tech_edit_desc", "web.tech_reset", "web.tech_template"].forEach((k) => {
    m[k] = ["web.tech_view", webViewKey];
  });
  m["web.tech_view"] = [webViewKey];
  // D3 Entity / Social SEO
  ["web.entity_create", "web.entity_edit", "web.entity_delete", "web.entity_open_link",
   "web.entity_view_account", "web.entity_reveal_password"].forEach((k) => {
    m[k] = ["web.entity_view", webViewKey];
  });
  m["web.entity_view"] = [webViewKey];
  m["web.entity_reveal_password"] = ["web.entity_view_account", "web.entity_view", webViewKey];
  // D4 Keyword research
  ["web.keyword_topic_create", "web.keyword_topic_edit", "web.keyword_topic_delete",
   "web.keyword_open_sheet", "web.keyword_manage_sheet"].forEach((k) => {
    m[k] = ["web.keyword_view", webViewKey];
  });
  m["web.keyword_view"] = [webViewKey];
  // D5 Content web
  ["web.content_create", "web.content_edit", "web.content_delete", "web.content_assign",
   "web.content_edit_brief", "web.content_edit_deadline", "web.content_edit_writer",
   "web.content_edit_outline_reviewer", "web.content_edit_article_reviewer", "web.content_edit_publisher",
   "web.outline_start", "web.outline_submit", "web.outline_approve", "web.outline_reject", "web.outline_resubmit",
   "web.post_write_start", "web.post_submit", "web.post_approve", "web.post_reject", "web.post_resubmit",
   "web.move_pending_publish", "web.publish", "web.complete",
   "web.content_cancel", "web.content_restore", "web.force_status",
   "web.content_history", "web.content_note",
   "web.view_web_draft_url", "web.edit_web_draft_url", "web.start_web_draft_layout",
   "web.submit_web_draft_review", "web.resubmit_web_draft_review",
   "web.approve_web_draft", "web.request_web_draft_revision",
   "web.view_web_draft_revision_note", "web.edit_web_draft_note",
   "web.force_change_web_draft_status"].forEach((k) => {
    m[k] = ["web.content_view", webViewKey];
  });
  m["web.content_view"] = [webViewKey];
  // D6 Index / share
  ["web.update_index", "web.update_share", "web.update_share_date",
   "web.select_shared_entity", "web.edit_published_url", "web.open_published_url"].forEach((k) => {
    m[k] = ["web.index_view", webViewKey];
  });
  m["web.index_view"] = [webViewKey];
  // D7 Backlink
  ["web.backlink_create", "web.backlink_edit", "web.backlink_delete",
   "web.backlink_status", "web.backlink_open", "web.backlink_cost"].forEach((k) => {
    m[k] = ["web.backlink_view", webViewKey];
  });
  m["web.backlink_view"] = [webViewKey];
  // D8 Check TOP
  ["web.checktop_primary", "web.checktop_secondary",
   "web.checktop_kw_create", "web.checktop_kw_edit", "web.checktop_kw_delete",
   "web.checktop_open_url", "web.checktop_filter_topic"].forEach((k) => {
    m[k] = ["web.checktop_view", webViewKey];
  });
  m["web.checktop_view"] = [webViewKey];
  // D9 Reoptimize
  ["web.reopt_create", "web.reopt_edit", "web.reopt_delete",
   "web.reopt_assign", "web.reopt_status", "web.reopt_complete",
   "set_content_optimization_schedule", "pause_content_optimization_schedule",
   "create_content_optimization", "create_scheduled_content_optimization"].forEach((k) => {
    m[k] = ["web.reopt_view", webViewKey];
  });
  m["web.reopt_view"] = [webViewKey];
  // D10 Growth
  ["web.growth_create", "web.growth_edit", "web.growth_delete", "web.growth_open"].forEach((k) => {
    m[k] = ["web.growth_view", webViewKey];
  });
  m["web.growth_view"] = [webViewKey];
  // D11 Report
  ["web.report_alerts", "web.report_alerts_all", "web.report_action",
   "web.report_by_topic", "web.report_by_staff"].forEach((k) => {
    m[k] = ["web.report_view", webViewKey];
  });
  m["web.report_view"] = [webViewKey];

  // ------- Task -------
  ["task.create", "task.edit", "task.delete", "task.assign",
   "task.edit_assignee", "task.edit_deadline", "task.edit_priority",
   "task.accept", "task.update_status", "task.complete", "task.restore", "task.force_status",
   "task.start", "task.update_result", "task.submit_completion", "task.resubmit_completion",
   "task.approve_completion", "task.request_revision", "task.cancel",
   "task.reopen_completed", "task.force_change_status",
   "task.view_history", "task.add_note",
   "task.view_all", "task.view_mine", "task.view_created_by_me"].forEach((k) => {
    m[k] = ["task.view"];
  });

  // ------- Brand -------
  ["brand.create", "brand.edit", "brand.delete", "brand.profile", "brand.identity",
   "brand.view_channels", "brand.docs", "brand.staff", "brand.contact", "brand.notes"].forEach((k) => {
    m[k] = ["brand.view"];
  });

  // ------- Social -------
  ["social.create", "social.edit", "social.delete", "social.manage_info", "social.assign_owner"].forEach((k) => {
    m[k] = ["social.view"];
  });
  ["social.post_create", "social.post_edit", "social.post_delete", "social.post_assign",
   "social.post_start", "social.post_submit", "social.post_resubmit", "social.post_approve",
   "social.post_request_changes", "social.post_move_pending_publish", "social.post_confirm_published",
   "social.post_complete", "social.post_cancel", "social.post_restore", "social.post_force_status",
   "social.post_history"].forEach((k) => {
    m[k] = ["social.post_view"];
  });
  ["social.growth_create", "social.growth_edit", "social.growth_delete",
   "social.growth_update", "social.growth_open"].forEach((k) => {
    m[k] = ["social.growth_view"];
  });

  // ------- Local -------
  ["local.create", "local.edit", "local.delete", "local.assign_owner",
   "local.post_create", "local.post_edit", "local.post_delete", "local.photo", "local.products"].forEach((k) => {
    m[k] = ["local.view"];
  });
  ["local.review_create", "local.review_reply", "local.review_status"].forEach((k) => {
    m[k] = ["local.review", "local.view"];
  });
  ["local.growth_create", "local.growth_edit", "local.growth_delete"].forEach((k) => {
    m[k] = ["local.growth_view", "local.view"];
  });

  // ------- Video -------
  ["video.create", "video.edit", "video.delete", "video.assign",
   "video.script_start", "video.script_submit", "video.script_resubmit", "video.script_approve",
   "video.script_reject", "video.move_shooting", "video.footage", "video.move_editing",
   "video.edit_cut", "video.submit", "video.resubmit", "video.approve", "video.reject",
   "video.deliver", "video.confirm_published", "video.complete", "video.cancel",
   "video.restore", "video.force_status", "video.history", "video.create_design_order"].forEach((k) => {
    m[k] = ["video.view"];
  });

  // ------- Order -------
  ["order.create", "order.edit", "order.edit_reviewer", "order.delete", "order.send_request", "order.assign",
   "order.take", "order.update_draft", "order.submit", "order.resubmit", "order.approve",
   "order.request_changes", "order.deliver", "order.complete", "order.cancel",
   "order.restore", "order.force_status", "order.history", "order.open_delivery"].forEach((k) => {
    m[k] = ["order.view"];
  });

  // ------- Settings & accounts -------
  ["settings.people", "settings.catalog", "settings.brand_types", "settings.web_types",
   "settings.social_types", "settings.task_types", "settings.video_types", "settings.design_types",
   "settings.priority", "settings.plan_topic", "settings.template",
   "settings.system_view", "settings.system_edit", "settings.view_presence"].forEach((k) => {
    m[k] = ["settings.view"];
  });
  ["settings.user_create", "settings.user_edit", "settings.user_delete",
   "settings.account_lock", "settings.user_reset_password",
   "settings.account_approve", "settings.account_reject",
   "settings.assign_role"].forEach((k) => {
    m[k] = ["settings.user_view"];
  });
  m["settings.permission"] = ["settings.role"];
  m["settings.user_custom_perm"] = ["settings.user_view"];

  return m;
})();

/** Compute the transitive closure of dependencies for a key (used by UI auto-tick). */
export function allDependencies(key: PermissionKey): PermissionKey[] {
  const out = new Set<PermissionKey>();
  const walk = (k: PermissionKey) => {
    for (const parent of PERMISSION_DEPENDS[k] ?? []) {
      if (!out.has(parent)) { out.add(parent); walk(parent); }
    }
  };
  walk(key);
  return [...out];
}

/** Return all keys that transitively depend on the given parent (used by UI auto-untick). */
export function allDependents(parentKey: PermissionKey): PermissionKey[] {
  const direct = new Set<PermissionKey>();
  for (const [child, parents] of Object.entries(PERMISSION_DEPENDS)) {
    if (parents.includes(parentKey)) direct.add(child);
  }
  // recurse
  const out = new Set(direct);
  for (const c of direct) {
    for (const d of allDependents(c)) out.add(d);
  }
  return [...out];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  "Tổng Quan", "Task", "Thương Hiệu", "Dự Án Web", "Social", "Local",
  "Video", "Thiết Kế", "Báo Cáo", "Tín Hiệu Cơ Hội", "KPI / Giao KPI", "Đơn Từ & Phê Duyệt", "Tài Chính Kế Toán", "Quản trị Kinh doanh", "Quản lý 3K", "Cài Đặt", "Tài khoản",
];

// ============ Default permissions per role ============
const overviewMine = ["overview.view", "overview.alerts", "overview.own_only"];
// Default Task perms for "doer" roles (Content/Social/Designer/Video/Local SEO).
const taskMine = [
  "task.view", "task.view_mine",
  "task.start", "task.update_result",
  "task.submit_completion", "task.resubmit_completion",
  "task.view_history", "task.add_note",
];
// Default Task perms for SEO (có tạo + có thể tự sửa task của mình).
const taskSeo = [
  "task.view", "task.view_mine", "task.view_created_by_me",
  "task.create", "task.edit",
  "task.start", "task.update_result",
  "task.submit_completion", "task.resubmit_completion",
  "task.view_history", "task.add_note",
];
// Leader Marketing inherits all task.* via filter in role definition below.

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  // Super Admin handled at runtime (returns true for any key) — also gets ALL_PERMS persisted.
  "role-super-admin": ALL_PERMS.slice(),
  // Admin: gần như toàn quyền, NHƯNG không quản lý role/ma trận/quyền riêng — chỉ Super Admin.
  "role-admin": ALL_PERMS.filter((k) => ![
    "settings.role",
    "settings.permission",
    "settings.user_custom_perm",
  ].includes(k)),
  "role-leader-marketing": [
    ...ALL_PERMS.filter((k) =>
      k.startsWith("overview.") ||
      k.startsWith("task.") ||
      k.startsWith("brand.") ||
      k.startsWith("web.") ||
      k.startsWith("social.") ||
      k.startsWith("local.") ||
      k.startsWith("video.") ||
      k.startsWith("order.") ||
      k.startsWith("report.")
    ),
    "settings.view", "settings.view_presence",
    "set_content_optimization_schedule", "pause_content_optimization_schedule",
    "create_content_optimization", "create_scheduled_content_optimization",
  ].filter((k) =>
    !["web.force_status", "social.post_force_status", "video.force_status", "order.force_status",
      "task.force_status", "task.force_change_status",
      "settings.user_delete", "settings.user_create", "settings.role", "settings.permission",
      "settings.user_custom_perm", "settings.assign_role", "settings.account_approve",
      "settings.user_reset_password",
    ].includes(k)
  ),
  "role-seo": [
    ...overviewMine,
    ...taskSeo,
    "brand.view",
    "web.view", "web.view_all", "web.open_detail", "web.manage_info",
    "web.tech_view", "web.tech_check", "web.tech_edit_desc",
    "web.entity_view", "web.entity_create", "web.entity_edit", "web.entity_delete",
    "web.entity_open_link", "web.entity_view_account",
    "web.keyword_view", "web.keyword_topic_create", "web.keyword_topic_edit", "web.keyword_topic_delete",
    "web.keyword_open_sheet", "web.keyword_manage_sheet",
    "web.content_view", "web.content_view_all", "web.content_history",
    // SEO mặc định có thể duyệt / yêu cầu sửa outline (theo spec)
    "web.outline_approve", "web.outline_reject",
    // SEO kiểm tra onpage trước đăng
    "web.view_web_draft_url", "web.approve_web_draft", "web.request_web_draft_revision",
    "web.view_web_draft_revision_note",
    "web.index_view", "web.update_index", "web.update_share", "web.update_share_date",
    "web.select_shared_entity", "web.edit_published_url", "web.open_published_url",
    "web.backlink_view", "web.backlink_create", "web.backlink_edit", "web.backlink_delete",
    "web.backlink_status", "web.backlink_open", "web.backlink_cost",
    "web.checktop_view", "web.checktop_primary", "web.checktop_secondary",
    "web.checktop_kw_create", "web.checktop_kw_edit", "web.checktop_kw_delete",
    "web.checktop_open_url", "web.checktop_filter_topic",
    "web.reopt_view", "web.reopt_create", "web.reopt_edit", "web.reopt_assign", "web.reopt_status",
    "set_content_optimization_schedule", "pause_content_optimization_schedule", "create_content_optimization", "create_scheduled_content_optimization",
    "web.growth_view", "web.growth_create", "web.growth_edit", "web.growth_open",
    "web.report_view", "web.report_alerts", "web.report_action", "web.report_by_topic", "web.report_by_staff",
  ],
  "role-content-web": [
    ...overviewMine,
    ...taskMine,
    "brand.view",
    "web.view", "web.open_detail",
    "web.keyword_view", "web.keyword_open_sheet",
    "web.content_view", "web.content_view_mine", "web.content_create", "web.content_edit",
    "web.content_history", "web.content_note",
    "web.outline_start", "web.outline_submit", "web.outline_resubmit",
    "web.post_write_start", "web.post_submit", "web.post_resubmit",
    "web.move_pending_publish", "web.publish",
    "web.view_web_draft_url", "web.edit_web_draft_url", "web.start_web_draft_layout",
    "web.submit_web_draft_review", "web.resubmit_web_draft_review",
    "web.view_web_draft_revision_note",
    "web.index_view", "web.open_published_url",
  ],
  "role-social": [
    ...overviewMine,
    ...taskMine,
    "brand.view",
    "social.view", "social.view_mine", "social.manage_info",
    "social.post_view", "social.post_view_mine", "social.post_create", "social.post_edit",
    "social.post_start", "social.post_submit", "social.post_resubmit",
    // Chuyển chờ đăng / xác nhận đã đăng / hoàn thành — theo spec
    "social.post_move_pending_publish", "social.post_confirm_published", "social.post_complete",
    "social.post_history",
    "social.growth_view", "social.growth_create", "social.growth_edit", "social.growth_update", "social.growth_open",
  ],
  "role-local-seo": [
    ...overviewMine,
    ...taskMine,
    "brand.view",
    "local.view", "local.view_mine",
    // Tạo/sửa địa điểm nếu được giao — theo spec
    "local.create", "local.edit",
    "local.post_create", "local.post_edit", "local.photo", "local.products",
    "local.review", "local.review_reply", "local.review_status",
    "local.growth_view", "local.growth_create", "local.growth_edit",
    "local.report",
  ],
  "role-designer": [
    ...overviewMine,
    ...taskMine,
    "brand.view",
    "order.view", "order.view_mine",
    "order.take", "order.update_draft", "order.submit", "order.resubmit",
    "order.deliver", "order.history", "order.open_delivery",
  ],
  "role-video": [
    ...overviewMine,
    ...taskMine,
    "brand.view",
    "video.view", "video.view_mine", "video.edit",
    "video.script_start", "video.script_submit", "video.script_resubmit",
    "video.move_shooting", "video.footage", "video.move_editing", "video.edit_cut",
    "video.submit", "video.resubmit", "video.deliver",
    "video.history", "video.create_design_order",
  ],
  "role-viewer": [
    "overview.view", "overview.alerts", "overview.brand_summary", "overview.module_summary", "overview.staff_summary",
    "brand.view", "brand.view_all",
    "report.view", "report.by_brand", "report.by_module", "report.by_staff", "report.attention", "report.growth",
    "web.view", "web.view_all", "web.open_detail",
    "social.view", "social.view_all",
    "local.view", "local.view_all",
    "video.view", "video.view_all",
    "order.view", "order.view_all", "order.report_view",
    "biz.view_all",
  ],
};

/**
 * 10 role mặc định của hệ thống — id ổn định, dùng cho seed + nút "Khôi phục quyền mặc định".
 * is_system = true → không cho phép xóa/đổi tên ở UI (chỉ Super Admin & Admin).
 */
export interface DefaultRoleMeta {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
}
export const DEFAULT_ROLES_META: DefaultRoleMeta[] = [
  { id: "role-super-admin",      name: "Super Admin",           description: "Toàn quyền hệ thống, không thể bị hạn chế.", is_system: true },
  { id: "role-admin",            name: "Admin",                 description: "Quản trị app hằng ngày — gần như toàn quyền, không quản lý role/phân quyền.", is_system: true },
  { id: "role-leader-marketing", name: "Leader Marketing",      description: "Điều phối, giao việc, duyệt workflow toàn phòng marketing.", is_system: false },
  { id: "role-seo",              name: "SEO",                   description: "Phụ trách SEO website (technical, entity, keyword, backlink, check top, tăng trưởng).", is_system: false },
  { id: "role-content-web",      name: "Content Web",           description: "Viết & gửi duyệt content website.", is_system: false },
  { id: "role-social",           name: "Social",                description: "Sản xuất & vận hành nội dung social.", is_system: false },
  { id: "role-local-seo",        name: "Local SEO",             description: "Quản lý Google Map / Local Map.", is_system: false },
  { id: "role-designer",         name: "Designer / Chụp ảnh",   description: "Xử lý order thiết kế, chụp ảnh, retouch.", is_system: false },
  { id: "role-video",            name: "Video",                 description: "Sản xuất video.", is_system: false },
  { id: "role-viewer",           name: "Viewer / Ban Giám Đốc", description: "Chỉ xem tổng quan, báo cáo, tình hình vận hành.", is_system: false },
];

/** Payload dùng khi gọi restoreDefaultRoles — client gửi nguồn TS cho server upsert. */
export function buildDefaultRolesPayload() {
  return DEFAULT_ROLES_META.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    is_system: r.is_system,
    permissions: DEFAULT_ROLE_PERMISSIONS[r.id] ?? [],
  }));
}

// Map legacy permission keys → new keys, so old code keeps working.
export const PERMISSION_ALIAS: Record<string, string> = {
  "task.view_own": "task.view_mine",
  "web.entity": "web.entity_view",
  "web.keyword": "web.keyword_view",
  "web.tech": "web.tech_view",
  "web.backlink": "web.backlink_view",
  "web.checktop": "web.checktop_view",
  "web.reoptimize": "web.reopt_view",
  "web.growth_edit": "web.growth_edit",
};

export function resolvePermKey(key: string): string {
  return PERMISSION_ALIAS[key] ?? key;
}

export const SUPER_ADMIN_ID = "role-super-admin";
export const ADMIN_ROLE_ID = "role-admin";
export const SYSTEM_ADMIN_USERNAME = "Admin";

// ============ Types ============
export interface Role {
  id: ID;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  system?: boolean;
}

export type AccountStatus = "Chờ duyệt" | "Đang hoạt động" | "Tạm khóa" | "Từ chối" | "Lưu trữ";

export interface User {
  id: ID;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  desiredPosition?: string;
  notes?: string;
  // Legacy fields kept for type compatibility (no longer used — Supabase Auth manages passwords)
  passwordHash: string;
  passwordSalt: string;
  roleId?: ID;
  customPermissions?: PermissionKey[];
  useCustom?: boolean;
  status: AccountStatus;
  createdAt: string;
  system?: boolean;
  mustChangePassword?: boolean;
  lastSeenAt?: string;
}

// ============ Store ============
interface AuthState {
  bizAccess: EffectiveBizAccess | null;
  refreshBizAccess: () => Promise<void>;
  users: User[];
  roles: Role[];
  currentUserId: ID | null;
  loaded: boolean;
  initialized: boolean;

  init: () => Promise<void>;
  reload: () => Promise<void>;

  login: (usernameOrEmail: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (input: {
    username: string; fullName: string; email?: string; phone?: string;
    desiredPosition?: string; notes?: string; password: string;
  }) => Promise<{ ok: boolean; error?: string }>;

  approve: (id: ID, roleId?: ID) => Promise<{ emailConfirmed: boolean; ready: boolean }>;
  reject: (id: ID) => Promise<void>;
  setStatus: (id: ID, status: AccountStatus) => Promise<void>;
  setRole: (id: ID, roleId: ID) => Promise<void>;
  setUseCustom: (id: ID, useCustom: boolean) => Promise<void>;
  setCustomPerms: (id: ID, perms: PermissionKey[]) => Promise<void>;
  updateUser: (id: ID, patch: Partial<User>) => Promise<void>;
  resetPassword: (id: ID, newPassword: string) => Promise<{ emailConfirmed: boolean; ready: boolean }>;
  changeOwnPassword: (oldPwd: string, newPwd: string) => Promise<{ ok: boolean; error?: string }>;
  removeUser: (id: ID) => Promise<void>;

  addRole: (r: Omit<Role, "id">) => Promise<void>;
  updateRole: (id: ID, patch: Partial<Role>) => Promise<void>;
  removeRole: (id: ID) => Promise<void>;
  restoreDefaultRoles: () => Promise<{ ok: boolean; count: number }>;

  // Compatibility no-op (used by existing code paths)
  ensureSeed: () => Promise<void>;

  // Presence (Online/Offline)
  touchPresence: () => Promise<void>;
}

function genRoleId() {
  return "role-" + Math.random().toString(36).slice(2, 10);
}

function mapProfileToUser(
  p: any,
  userRoles: { user_id: string; role_id: string }[],
  overrides: { user_id: string; use_custom: boolean; permissions: string[] }[],
): User {
  const ur = userRoles.find((x) => x.user_id === p.id);
  const ov = overrides.find((x) => x.user_id === p.id);
  return {
    id: p.id,
    username: p.username || "",
    fullName: p.full_name || "",
    email: p.email || undefined,
    phone: p.phone || undefined,
    desiredPosition: p.desired_position || undefined,
    notes: p.notes || undefined,
    passwordHash: "",
    passwordSalt: "",
    roleId: ur?.role_id,
    useCustom: ov?.use_custom ?? false,
    customPermissions: ov?.permissions ?? [],
    status: p.status,
    createdAt: p.created_at,
    system: !!p.is_system_admin,
    mustChangePassword: !!p.must_change_password,
    lastSeenAt: p.last_seen_at || undefined,
  };
}

export const useAuth = create<AuthState>((set, get) => ({
  bizAccess: null,
  refreshBizAccess: async () => {
    const uid = get().currentUserId;
    if (!uid) { set({ bizAccess: null }); return; }
    const { data, error } = await supabase.rpc('biz_effective_access');
    if (get().currentUserId !== uid) return;
    set({ bizAccess: error ? null : data as unknown as EffectiveBizAccess });
  },
  users: [],
  roles: [],
  currentUserId: null,
  loaded: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    supabase.auth.onAuthStateChange((event, session) => {
      if (!['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'PASSWORD_RECOVERY'].includes(event)) return;
      const nextId = session?.user?.id ?? null;
      if (nextId !== get().currentUserId) set({ users: [], roles: [], loaded: false });
      set({ currentUserId: nextId, bizAccess: null });
      if (session) {
        // Do not make Auth calls inside the SDK's locked callback.
        setTimeout(() => void get().reload(), 0);
      } else {
        set({ users: [], roles: [], loaded: false });
      }
    });
    const { data: { user } } = await supabase.auth.getUser();
    set({ currentUserId: user?.id ?? null });
    if (user) await get().reload();
  },

  reload: async () => {
    const requestedUser = get().currentUserId;
    if (!requestedUser) return;
    const [dirRes, fullProfRes, rolesRes, urRes, ovRes] = await Promise.all([
      supabase.rpc("get_profiles_directory"),
      // RLS limits this to self + (admins see all). Sensitive fields are merged in for those rows.
      supabase.from("profiles").select("*"),
      supabase.from("app_roles").select("*").order("name"),
      supabase.from("user_roles").select("*"),
      supabase.from("user_permission_overrides").select("*"),
    ]);
    if (get().currentUserId !== requestedUser) return;
    if (fullProfRes.error) { set({ users: [], roles: [], loaded: true, bizAccess: null }); return; }
    const directory = (dirRes.data ?? fullProfRes.data ?? []) as any[];
    const fullProfiles = (fullProfRes.data ?? []) as any[];
    const fullById = new Map(fullProfiles.map((p) => [p.id, p]));
    // Merge: prefer full row (with email/phone/notes/etc.) when accessible; otherwise use directory entry.
    const merged = directory
      .map((d) => fullById.get(d.id) ?? d)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const userRoles = (urRes.data ?? []) as { user_id: string; role_id: string }[];
    const overrides = (ovRes.data ?? []) as { user_id: string; use_custom: boolean; permissions: string[] }[];
    const users = merged.map((p) => mapProfileToUser(p, userRoles, overrides));
    const roles: Role[] = (rolesRes.data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      permissions: r.permissions ?? [],
      system: !!r.is_system,
    }));
    set({ users, roles, loaded: true });
    await get().refreshBizAccess();


    // Auto-bootstrap: nếu Super Admin / tài khoản hệ thống đăng nhập mà các role
    // mặc định chưa có permissions → tự nạp một lần.
    const me = users.find((u) => u.id === get().currentUserId);
    const iAmSuper = me?.system || me?.roleId === SUPER_ADMIN_ID;
    const needsSeed = roles.some(
      (r) => DEFAULT_ROLES_META.some((d) => d.id === r.id) && r.permissions.length === 0,
    );
    if (iAmSuper && needsSeed) {
      try {
        await get().restoreDefaultRoles();
      } catch (e) {
        console.warn("Auto bootstrap roles failed:", e);
      }
    }
  },

  ensureSeed: async () => { /* Database is pre-seeded by migration. */ },

  touchPresence: async () => {
    const uid = get().currentUserId;
    if (!uid) return;
    const nowIso = new Date().toISOString();
    try {
      await supabase.from("profiles").update({ last_seen_at: nowIso }).eq("id", uid);
      // Optimistic local update (avoid full reload)
      set((s) => ({
        users: s.users.map((u) => (u.id === uid ? { ...u, lastSeenAt: nowIso } : u)),
      }));
    } catch (e) {
      // silent
    }
  },

  login: async (usernameOrEmail, password) => {
    try {
    const input = usernameOrEmail.trim();
    const result = input.includes('@')
      ? await supabase.auth.signInWithPassword({ email: input.toLowerCase(), password })
      : await (async () => {
          const signed = await usernameSignIn({ data: { username: input, password } });
          if (!signed.ok) return { data: { user: null }, error: null, loginError: signed.error };
          return supabase.auth.setSession(signed.session);
        })();
    if ('loginError' in result) return { ok: false, error: result.loginError };
    const { data, error } = result;
    if (error || !data.user) return { ok: false, error: authErrorMessage(error) };
    const { data: prof, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", data.user.id)
      .maybeSingle();
    const status = prof?.status as AccountStatus | undefined;
    // Cho phép "Chờ duyệt" đăng nhập để hiển thị màn chờ duyệt.
    // Các trạng thái còn lại (Tạm khóa / Từ chối / Lưu trữ) vẫn chặn đăng nhập.
    if (profileError || accountAccess(status) === 'missing') {
      await supabase.auth.signOut({ scope: 'local' });
      return { ok: false, error: 'Không kiểm tra được hồ sơ tài khoản. Vui lòng thử lại hoặc liên hệ quản trị viên.' };
    }
    if (accountAccess(status) === 'blocked') {
      await supabase.auth.signOut();
      const msg =
        status === "Tạm khóa" ? "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin." :
        status === "Từ chối" ? "Tài khoản của bạn đã bị từ chối." :
        status === "Lưu trữ" ? "Tài khoản đã được lưu trữ." :
        "Tài khoản không khả dụng.";
      return { ok: false, error: msg };
    }
    await get().reload();
    return { ok: true };
    } catch { return { ok: false, error: authErrorMessage(null) }; }
  },

  logout: async () => {
    // Ngừng gửi thông báo của tài khoản này tới thiết bị trước khi thoát
    await import("@/lib/push/client").then((m) => m.disablePush()).catch(() => {});
    await supabase.auth.signOut();
  },

  register: async (input) => {
    try {
    const issues = passwordIssues(input.password);
    if (issues.length) return { ok: false, error: issues[0] };
    const username = input.username.trim();
    if (!username) return { ok: false, error: "Vui lòng nhập tên đăng nhập." };
    if (username.toLowerCase() === "admin") return { ok: false, error: "Tên đăng nhập 'Admin' đã được hệ thống sử dụng." };
    const email = input.email?.trim().toLowerCase() ?? '';
    if (isFakeEmail(email)) return { ok: false, error: 'Vui lòng nhập email thật để nhận liên kết xác nhận tài khoản.' };
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          full_name: input.fullName,
          phone: input.phone,
          desired_position: input.desiredPosition,
          notes: input.notes,
        },
      },
    });
    if (error) {
      const msg = ['user_already_exists','unexpected_failure'].includes(error.code ?? '') ? 'Không thể đăng ký với thông tin này. Vui lòng kiểm tra tên đăng nhập/email hoặc yêu cầu xác nhận email nếu đã đăng ký.' : authErrorMessage(error, 'password');
      return { ok: false, error: msg };
    }
    if (!data.user) return { ok: false, error: 'Không tạo được tài khoản. Vui lòng thử lại.' };
    // Confirmation and business approval are independent; never auto-confirm.
    await supabase.auth.signOut();
    return { ok: true };
    } catch { return { ok: false, error: 'Không đăng ký được lúc này. Vui lòng thử lại.' }; }
  },

  approve: async (id, roleId) => {
    const { data, error } = await supabase.rpc('account_approve', { _target: id, ...roleId ? { _role: roleId } : {} });
    if (error) throw new Error(error.message);
    await get().reload();
    return data as { emailConfirmed: boolean; ready: boolean };
  },

  reject: async (id) => {
    const { error } = await supabase.from("profiles").update({ status: "Từ chối" }).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setStatus: async (id, status) => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setRole: async (id, roleId) => {
    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", id);
    if (deleteError) throw new Error(deleteError.message);
    const { error } = await supabase.from("user_roles").insert({ user_id: id, role_id: roleId });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setUseCustom: async (id, useCustom) => {
    const existing = get().users.find((u) => u.id === id);
    const perms = existing?.customPermissions ?? [];
    const { error } = await supabase
      .from("user_permission_overrides")
      .upsert({ user_id: id, use_custom: useCustom, permissions: perms });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setCustomPerms: async (id, perms) => {
    const { error } = await supabase
      .from("user_permission_overrides")
      .upsert({ user_id: id, use_custom: true, permissions: perms });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  updateUser: async (id, patch) => {
    const dbPatch: {
      full_name?: string;
      phone?: string | null;
      desired_position?: string | null;
      notes?: string | null;
      must_change_password?: boolean;
    } = {};
    if (patch.fullName !== undefined) dbPatch.full_name = patch.fullName;
    if (patch.email !== undefined && patch.email !== get().users.find(u => u.id === id)?.email) throw new Error('Email đăng nhập phải được thay đổi qua xác thực email.');
    if (patch.phone !== undefined) dbPatch.phone = patch.phone || null;
    if (patch.desiredPosition !== undefined) dbPatch.desired_position = patch.desiredPosition || null;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes || null;
    if (patch.mustChangePassword !== undefined) dbPatch.must_change_password = patch.mustChangePassword;
    if (Object.keys(dbPatch).length === 0) return;
    const { error } = await supabase.from("profiles").update(dbPatch).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  resetPassword: async (id, newPassword) => {
    return adminResetPassword({ data: { userId: id, newPassword } });
  },

  changeOwnPassword: async (oldPwd, newPwd) => {
    const issues = passwordIssues(newPwd);
    if (issues.length) return { ok: false, error: issues[0] };
    const { data: identity } = await supabase.auth.getUser();
    const email = identity.user?.email;
    const userId = identity.user?.id;
    if (!email || !userId) return { ok: false, error: "Chưa đăng nhập." };
    // Bước 1: xác minh mật khẩu hiện tại bằng một client tạm KHÔNG lưu phiên,
    // để phiên đăng nhập hiện tại không bị thay đổi.
    const { createClient } = await import("@supabase/supabase-js");
    const probe = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false, storage: undefined } },
    );
    const { error: verifyErr } = await probe.auth.signInWithPassword({ email, password: oldPwd });
    if (verifyErr) return { ok: false, error: verifyErr.code === 'invalid_credentials' ? 'Mật khẩu hiện tại không đúng.' : authErrorMessage(verifyErr) };
    // Bước 2: đổi mật khẩu trên phiên hiện tại; server vẫn kiểm tra current_password
    // (require_current_password) như lớp bảo vệ thứ hai.
    const { error } = await supabase.auth.updateUser({ password: newPwd, current_password: oldPwd });
    if (error) {
      return { ok: false, error: authErrorMessage(error, 'password') };
    }
    await supabase.from("profiles").update({ must_change_password: false }).eq("id", userId);
    await get().reload();
    return { ok: true };
  },

  removeUser: async (id) => {
    await adminDeleteUser({ data: { userId: id } });
    await get().reload();
  },

  addRole: async (r) => {
    const { error } = await supabase.from("app_roles").insert({
      id: genRoleId(),
      name: r.name,
      description: r.description ?? null,
      permissions: r.permissions ?? [],
      is_system: false,
    });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  updateRole: async (id, patch) => {
    const dbPatch: {
      name?: string;
      description?: string | null;
      permissions?: string[];
    } = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.permissions !== undefined) dbPatch.permissions = patch.permissions;
    if (Object.keys(dbPatch).length === 0) return;
    const { error } = await supabase.from("app_roles").update(dbPatch).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  removeRole: async (id) => {
    const { error } = await supabase.from("app_roles").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  restoreDefaultRoles: async () => {
    const { restoreDefaultRoles: callRestore } = await import("@/lib/roles.functions");
    const res = await callRestore({ data: { roles: buildDefaultRolesPayload() } });
    await get().reload();
    return res;
  },
}));

// ============ Helpers ============
export function getUserPermissions(user: User | null | undefined, roles: Role[]): Set<PermissionKey> {
  if (!user) return new Set();
  if (user.useCustom && user.customPermissions) return new Set(user.customPermissions);
  const role = roles.find((r) => r.id === user.roleId);
  if (!role) return new Set();
  return new Set(role.permissions);
}

/** Returns true if a record is "owned" by the user — used for *.view_mine scoping. */
export function isOwnRecord(record: any, userId: string | null | undefined): boolean {
  if (!record || !userId) return false;
  const fields = [
    "createdBy", "created_by", "ownerId", "owner",
    "assignee", "assigneeId", "assignedTo", "assigned_to",
    "writer", "writerId", "reviewer", "reviewerId",
    "scriptReviewer", "videoReviewer",
    "requester", "requesterId",
    "publisher", "publisherId",
  ];
  for (const f of fields) {
    const v = record[f];
    if (typeof v === "string" && v === userId) return true;
    if (Array.isArray(v) && v.includes(userId)) return true;
  }
  return false;
}

export type PermissionExplain = {
  ok: boolean;
  reason: string;
  source: "super_admin" | "system" | "role" | "custom" | "missing" | "dep_missing" | "inactive";
  missingDeps?: PermissionKey[];
  roleName?: string;
};

/**
 * Explain WHY a given user has / does not have a permission.
 * Used by the Super Admin "Dò quyền" tool to make permission troubleshooting trivial.
 */
export function explainPermission(
  user: User | null | undefined,
  roles: Role[],
  key: PermissionKey,
): PermissionExplain {
  if (!user) return { ok: false, reason: "Chưa đăng nhập", source: "missing" };
  if (user.status !== "Đang hoạt động") {
    return { ok: false, reason: `Tài khoản trạng thái "${user.status}" — không có quyền nào hoạt động`, source: "inactive" };
  }
  if (user.system || user.roleId === SUPER_ADMIN_ID) {
    return { ok: true, reason: "Super Admin / Tài khoản hệ thống — bypass mọi check quyền", source: "super_admin" };
  }
  const resolved = resolvePermKey(key);
  const role = roles.find((r) => r.id === user.roleId);
  const source: "role" | "custom" = user.useCustom ? "custom" : "role";
  const granted = user.useCustom
    ? new Set(user.customPermissions ?? [])
    : new Set(role?.permissions ?? []);
  if (!granted.has(resolved)) {
    return {
      ok: false,
      reason: source === "custom"
        ? `Không có trong quyền riêng của user`
        : `Không có trong role "${role?.name ?? "(chưa gán)"}"`,
      source: "missing",
      roleName: role?.name,
    };
  }
  // Check deps
  const missing: PermissionKey[] = [];
  for (const parent of PERMISSION_DEPENDS[resolved] ?? []) {
    if (!granted.has(parent)) missing.push(parent);
  }
  if (missing.length > 0) {
    return {
      ok: false,
      reason: `Thiếu quyền cha: ${missing.join(", ")}`,
      source: "dep_missing",
      missingDeps: missing,
      roleName: role?.name,
    };
  }
  return {
    ok: true,
    reason: source === "custom"
      ? "Cấp qua quyền riêng (ghi đè role)"
      : `Cấp qua role "${role?.name ?? ""}"`,
    source,
    roleName: role?.name,
  };
}

/**
 * Run a dependency audit on a permission set: list every key that is "on"
 * but is missing one or more parents.
 */
export function auditDependencies(perms: PermissionKey[]): { key: PermissionKey; missing: PermissionKey[] }[] {
  const set = new Set(perms);
  const out: { key: PermissionKey; missing: PermissionKey[] }[] = [];
  for (const k of perms) {
    const parents = PERMISSION_DEPENDS[k] ?? [];
    const missing = parents.filter((p) => !set.has(p));
    if (missing.length > 0) out.push({ key: k, missing });
  }
  return out;
}

export function useCurrentUser() {
  const u = useAuth((s) => s.users.find((x) => x.id === s.currentUserId) || null);
  const roles = useAuth((s) => s.roles);
  const bizAccess = useAuth((s) => s.bizAccess);
  const perms = getUserPermissions(u, roles);
  // Only Super Admin (and the system-marked Admin account) bypasses permission checks.
  // Role "Admin" is just a default permission bundle — it must still grant perms explicitly.
  const isSuperAdmin = u?.roleId === SUPER_ADMIN_ID || !!u?.system;
  // NOTE: `isAdmin` is kept for API compatibility but no longer grants a blanket bypass.
  // It is now an alias of `isSuperAdmin` so legacy `isAdmin || can(...)` checks behave correctly.
  const isAdmin = isSuperAdmin;
  const hasRaw = (key: PermissionKey) =>
    perms.has(key) || perms.has(resolvePermKey(key));
  const can = (key: PermissionKey): boolean => {
    if (isSuperAdmin) return true;
    if (key.startsWith('biz.')) return u?.status === 'Đang hoạt động' && bizAccess?.user_id === u.id && bizAccess.permissions.includes(key) || false;
    const resolved = resolvePermKey(key);
    if (!hasRaw(resolved)) return false;
    // Dependency check — every parent must also be granted.
    for (const parent of PERMISSION_DEPENDS[resolved] ?? []) {
      if (!hasRaw(parent)) return false;
    }
    return true;
  };
  const canAny = (...keys: PermissionKey[]) => keys.some(can);
  const canAll = (...keys: PermissionKey[]) => keys.every(can);
  const canSee = (record: any, viewAllKey: PermissionKey, viewMineKey: PermissionKey) => {
    if (isSuperAdmin) return true;
    if (can(viewAllKey)) return true;
    if (can(viewMineKey)) return isOwnRecord(record, u?.id);
    return false;
  };
  /**
   * Filter a record list by data scope:
   *   - Super Admin / view_all → return all
   *   - view_mine → only records where the user is creator/assignee/writer/reviewer/etc
   *   - matchOwn(item) — extra owner predicate to handle name-based matches (when records store
   *     "owner" as a person *name* string instead of user id)
   */
  const scopeList = <T,>(
    list: T[],
    viewAllKey: PermissionKey,
    viewMineKey: PermissionKey,
    matchOwn?: (item: T) => boolean,
  ): T[] => {
    if (isSuperAdmin || can(viewAllKey)) return list;
    if (!can(viewMineKey)) return [];
    return list.filter((it) => isOwnRecord(it as any, u?.id) || (matchOwn ? matchOwn(it) : false));
  };
  return {
    user: u,
    role: u ? roles.find((r) => r.id === u.roleId) : undefined,
    perms,
    can,
    canAny,
    canAll,
    canSee,
    scopeList,
    isSuperAdmin,
    isAdmin,
  };
}
