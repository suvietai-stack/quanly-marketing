import type { PermCategory } from "@/lib/leave/permCategories";

/**
 * Nhóm quyền đơn giản của module Quản trị Kinh doanh — lớp trình bày trên
 * hệ quyền chi tiết dùng chung (Cài đặt → Tài khoản & Phân quyền).
 */
export const BIZ_PERM_CATEGORIES: PermCategory[] = [
  { key: "view_own", label: "Xem dữ liệu cá nhân", perms: ["biz.view_own"] },
  { key: "submit", label: "Nộp kế hoạch / mục tiêu / báo cáo", perms: ["biz.plan_submit", "biz.goal_submit", "biz.report_submit"] },
  { key: "view_dept", label: "Xem dữ liệu phòng ban", perms: ["biz.view_dept"] },
  { key: "approve", label: "Yêu cầu sửa kế hoạch · duyệt mục tiêu / báo cáo", perms: ["biz.plan_request_revision", "biz.plan_approve", "biz.goal_approve", "biz.report_approve"] },
  { key: "view_all", label: "Xem dashboard toàn bộ", perms: ["biz.view_all"] },
  { key: "settings", label: "Quản lý cấu hình module", perms: ["biz.kr_manage", "biz.dept_manage", "biz.deadline_manage"] },
];
