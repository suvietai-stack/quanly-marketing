// Quy tắc mật khẩu & email khôi phục — hàm thuần, dùng chung cho UI và kiểm thử.

/** Email nội bộ/giả không thể nhận thư khôi phục. */
export function isFakeEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!e || !e.includes("@")) return true;
  const domain = e.split("@")[1] ?? "";
  return domain === "user.local" || domain === "local" || domain.endsWith(".local");
}

/** Danh sách lỗi của mật khẩu mới; mảng rỗng = hợp lệ. */
export function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 8) issues.push("Mật khẩu mới tối thiểu 8 ký tự.");
  if (pw.length > 200) issues.push("Mật khẩu tối đa 200 ký tự.");
  if (!/[a-zA-Z]/.test(pw)) issues.push("Mật khẩu mới cần có ít nhất một chữ cái.");
  if (!/[0-9]/.test(pw)) issues.push("Mật khẩu mới cần có ít nhất một chữ số.");
  return issues;
}

/** Kiểm tra form đổi mật khẩu; trả về thông báo lỗi đầu tiên hoặc null. */
export function changePasswordError(oldPwd: string, n1: string, n2: string): string | null {
  if (!oldPwd) return "Vui lòng nhập mật khẩu hiện tại.";
  const issues = passwordIssues(n1);
  if (issues.length) return issues[0];
  if (n1 === oldPwd) return "Mật khẩu mới phải khác mật khẩu hiện tại.";
  if (n1 !== n2) return "Mật khẩu xác nhận không khớp.";
  return null;
}

export interface ResetActor {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasResetPermission: boolean;
}

export interface ResetTarget {
  isSystemAdmin: boolean;
  isSuperAdmin: boolean;
}

/** Ai được reset mật khẩu tài khoản khác. */
export function canResetPassword(actor: ResetActor): boolean {
  return actor.isSuperAdmin || actor.isAdmin || actor.hasResetPermission;
}

/**
 * Phân cấp reset: tài khoản hệ thống / Super Admin chỉ Super Admin mới được reset.
 */
export function canResetTarget(actor: ResetActor, target: ResetTarget): boolean {
  if (!canResetPassword(actor)) return false;
  if (target.isSystemAdmin || target.isSuperAdmin) return actor.isSuperAdmin;
  return true;
}

/** Số lần reset tối đa mỗi giờ của một người quản trị. */
export const RESET_RATE_LIMIT_PER_HOUR = 10;
