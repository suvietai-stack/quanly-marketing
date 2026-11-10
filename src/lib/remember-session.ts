// Ghi nhớ đăng nhập tối đa 90 ngày.
// Cơ chế: phiên vẫn do Supabase Auth quản lý (refresh token, tự làm mới).
// App chỉ ghi cờ lựa chọn của người dùng và hủy phiên đã lưu khi:
//  - người dùng KHÔNG chọn ghi nhớ và trình duyệt đã đóng hẳn (sessionStorage mất), hoặc
//  - phiên ghi nhớ đã quá 90 ngày.
// Không lưu mật khẩu, không tự tạo token.

export const REMEMBER_KEY = 'sv_remember';
export const REMEMBER_SINCE_KEY = 'sv_remember_since';
export const TAB_ALIVE_KEY = 'sv_tab_alive';
export const REMEMBER_MAX_MS = 90 * 24 * 60 * 60 * 1000; // 90 ngày

export type SessionPolicy = 'keep' | 'drop' | 'grandfather';

/**
 * Quyết định xử lý phiên đã lưu khi app khởi động.
 * - tabAlive: trình duyệt còn cùng phiên làm việc (reload/mở tab mới) → giữ.
 * - remember '1': giữ, trừ khi quá 90 ngày → drop.
 * - remember '0': phiên mới của trình duyệt → drop (không duy trì sau khi đóng).
 * - chưa có cờ (phiên tạo trước tính năng này) → grandfather: giữ, cờ sẽ được ghi ở lần đăng nhập tới.
 */
export function sessionPolicy(input: {
  tabAlive: boolean;
  remember: string | null;
  since: number;
  now: number;
}): SessionPolicy {
  if (input.tabAlive) return 'keep';
  if (input.remember === '1') {
    return input.since > 0 && input.now - input.since > REMEMBER_MAX_MS ? 'drop' : 'keep';
  }
  if (input.remember === '0') return 'drop';
  return 'grandfather';
}

/** Ghi lựa chọn ghi nhớ sau khi đăng nhập thành công. */
export function writeRememberChoice(remember: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1');
      localStorage.setItem(REMEMBER_SINCE_KEY, String(Date.now()));
    } else {
      localStorage.setItem(REMEMBER_KEY, '0');
      localStorage.removeItem(REMEMBER_SINCE_KEY);
    }
    sessionStorage.setItem(TAB_ALIVE_KEY, '1');
  } catch { /* bộ nhớ bị chặn: bỏ qua, phiên vẫn hoạt động trong tab hiện tại */ }
}

/** Đọc lựa chọn ghi nhớ đã lưu (mặc định bật — giữ hành vi hiện tại của Base). */
export function readRememberChoice(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(REMEMBER_KEY) !== '0';
  } catch {
    return true;
  }
}
