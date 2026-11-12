/** Read every server page; reject the complete read if any page fails. */
export async function readAllPages<T>(read: (from: number, to: number, signal: AbortSignal) => PromiseLike<{ data: T[] | null; error: unknown }>, pageSize = 500, timeoutMs = 20000): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject({ code: '57014', message: 'Read deadline exceeded' });
        controller.abort();
      }, timeoutMs);
    });
    const { data, error } = await Promise.race([Promise.resolve().then(() => read(from, from + pageSize - 1, controller.signal)), deadline])
      .finally(() => clearTimeout(timer));
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

/** Only temporary transport/server failures may retain the same actor's last good data. */
export function isTransientStoreRead(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; status?: number };
  return e.code === '57014' || e.code === 'PGRST000' || e.code === 'PGRST001' || e.code === 'PGRST002' || e.code === 'PGRST003'
    || (typeof e.status === 'number' && e.status >= 500)
    || /failed to fetch|networkerror|network request failed|load failed|statement timeout|fetch failed/i.test(e.message ?? '');
}
