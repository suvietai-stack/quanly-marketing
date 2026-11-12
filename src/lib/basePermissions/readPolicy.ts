// One retry only for transient transport/database failures. Permission errors never retry.
export function retryOrganizationRead(failures: number, error: unknown): boolean {
  if (failures >= 1) return false;
  const e = error as { code?: string; message?: string; status?: number };
  if (e?.code === '42501' || e?.status === 401 || e?.status === 403) return false;
  return e?.code === '57014' || /timeout|timed out|fetch|network/i.test(e?.message ?? '') || (e?.status ?? 0) >= 500;
}

export const organizationRetryDelay = (attempt: number) => Math.min(1000 * 2 ** attempt, 4000);

export function organizationReadKey(userId: string | undefined, revision: number | undefined) {
  return ['base-org', userId, revision] as const;
}