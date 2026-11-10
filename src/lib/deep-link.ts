/** Đọc tham số mở hồ sơ từ URL hiện tại (deep link từ Trung tâm Phê duyệt). */
export function readOpenParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return new URLSearchParams(window.location.search).get(key);
  } catch {
    return null;
  }
}

/** Đồng bộ tham số mở hồ sơ lên URL mà không tải lại trang. */
export function syncOpenParam(key: string, id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const u = new URL(window.location.href);
    if (id) u.searchParams.set(key, id);
    else u.searchParams.delete(key);
    window.history.replaceState(null, '', u);
  } catch { /* bỏ qua */ }
}
