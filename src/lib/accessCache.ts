/** Bộ nhớ quyền cho giao diện (chỉ trong bộ nhớ tab, theo từng người dùng). Máy chủ vẫn kiểm tra mọi thao tác. */
export const ACCESS_MIN_GAP_MS = 60_000;      // lần tự làm mới (focus/chuyển tab/định kỳ) cách nhau tối thiểu
export const ACCESS_MAX_STALE_MS = 10 * 60_000; // lỗi mạng tạm thời: giữ quyền đã xác minh tối đa 10 phút

export interface Verified { user_id: string; server_now?: string; next_transition_at?: string | null; next_change?: string | null }
const body = (v: Verified) => JSON.stringify({ ...v, server_now: undefined });

/** Tự làm mới chỉ khi đã quá khoảng nghỉ; yêu cầu bắt buộc (sau khi lưu thay đổi) luôn chạy. */
export function shouldRefresh(lastVerifiedAt: number | null, now: number, force = false): boolean {
  return force || lastVerifiedAt === null || now - lastVerifiedAt >= ACCESS_MIN_GAP_MS;
}

/**
 * Kết hợp kết quả mới với quyền đã xác minh.
 * - Thành công: trả về dữ liệu mới; nếu giống hệt thì giữ nguyên đối tượng cũ (không vẽ lại menu).
 * - Lỗi: chỉ giữ quyền cũ nếu cùng người dùng, chưa quá hạn và chưa tới mốc thay đổi quyền; ngược lại trả null (đóng).
 */
export function mergeAccess<T extends Verified>(prev: T | null, prevAt: number | null, uid: string, result: { data: T | null; error: unknown }, now: number): { value: T | null; verifiedAt: number | null; failed: boolean } {
  if (!result.error && result.data && result.data.user_id === uid) {
    const same = prev && prev.user_id === uid && body(prev) === body(result.data);
    return { value: same ? prev : result.data, verifiedAt: now, failed: false };
  }
  const edge = prev?.next_transition_at ?? prev?.next_change;
  const boundary = edge ? Date.parse(edge) : Infinity;
  const keep = !isFatalAccessError(result.error) && !!prev && prev.user_id === uid && prevAt !== null && now - prevAt < ACCESS_MAX_STALE_MS && now < boundary;
  return { value: keep ? prev : null, verifiedAt: keep ? prevAt : null, failed: true };
}

/** Lỗi từ chối thực sự (bị khóa, hết phiên, không có quyền): không giữ quyền cũ, đóng ngay. */
export function isFatalAccessError(e: unknown): boolean {
  const x = (e ?? {}) as { code?: string; status?: number; message?: string };
  return ['42501', 'PGRST301', 'PGRST302', '28000'].includes(String(x.code)) || x.status === 401 || x.status === 403
    || /không có quyền|tạm khóa|not active|jwt expired/i.test(String(x.message ?? ''));
}

export type AuthEventAction = 'ignore' | 'clear' | 'load' | 'reload';
/**
 * Quyết định xử lý một sự kiện đăng nhập.
 * SIGNED_IN/INITIAL_SESSION phát lại cho cùng người đã tải xong (focus, tab khác, làm mới token) → bỏ qua, không tải lại quyền.
 * USER_UPDATED luôn làm mới. Đổi người dùng/đăng xuất → xóa sạch rồi tải lại.
 */
export function authEventAction(event: string, prevUid: string | null, nextUid: string | null, ready: boolean): AuthEventAction {
  if (!['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'PASSWORD_RECOVERY'].includes(event)) return 'ignore';
  if (!nextUid) return 'clear';
  if (nextUid !== prevUid) return 'load';
  if (event === 'USER_UPDATED') return 'reload';
  return ready ? 'ignore' : 'load';
}
