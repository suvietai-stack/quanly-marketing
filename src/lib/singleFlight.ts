/**
 * Gộp các lần tải trùng nhau theo khóa (thường là user id).
 * - join(): nếu đang tải cho cùng khóa thì dùng chung lần tải đó (khởi động/sự kiện đăng nhập).
 * - refresh(): sau khi thay đổi dữ liệu cần số liệu mới; nếu đang tải thì xếp đúng MỘT lần tải tiếp theo.
 */
export function createCoalescer<K>(run: (key: K) => Promise<void>) {
  let current: { key: K; promise: Promise<void> } | null = null;
  let trailing: { key: K; promise: Promise<void> } | null = null;
  const start = (key: K): Promise<void> => {
    const promise = run(key).finally(() => { if (current?.promise === promise) current = null; });
    current = { key, promise };
    return promise;
  };
  return {
    join(key: K): Promise<void> {
      if (current && current.key === key) return current.promise;
      return start(key);
    },
    refresh(key: K): Promise<void> {
      if (!current || current.key !== key) return start(key);
      if (trailing && trailing.key === key) return trailing.promise;
      const prev = current.promise;
      const promise = prev.catch(() => undefined).then(() => { trailing = null; return start(key); });
      trailing = { key, promise };
      return promise;
    },
  };
}
