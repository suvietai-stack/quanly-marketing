import { supabase } from '@/integrations/supabase/client';

/** A timeout/network failure does not prove that a write rolled back. Never use a fresh request key in this state. */
export function isAmbiguousK3WriteFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: unknown; status?: unknown; statusCode?: unknown; message?: unknown; name?: unknown };
  const code = String(e.code ?? '').toUpperCase();
  const status = Number(e.status ?? e.statusCode);
  const message = String(e.message ?? '');
  return code === '57014' || status === 502 || status === 503 || status === 504
    || String(e.name ?? '') === 'AbortError'
    || /statement timeout|timed? out|timeout|gateway timeout|failed to fetch|network (?:error|request)|load failed|connection (?:lost|closed|terminated)|fetch failed/i.test(message);
}

export type K3WriteStatus = { state: 'saved'; id: string } | { state: 'not_found' } | { state: 'unknown' };

/** Read-only, bounded reconciliation; "not found" is not proof an in-flight write will never commit. */
export async function reconcileK3Write(lookup: () => Promise<string | null>, retryDelayMs = 700): Promise<K3WriteStatus> {
  try {
    const first = await lookup();
    if (first) return { state: 'saved', id: first };
    if (retryDelayMs > 0) await new Promise<void>((resolve) => setTimeout(resolve, retryDelayMs));
    const second = await lookup();
    return second ? { state: 'saved', id: second } : { state: 'not_found' };
  } catch {
    return { state: 'unknown' };
  }
}

/** Owner-filtered and still protected by k3_goals RLS. */
export function findK3CreatedGoal(actorId: string, requestKey: string): Promise<K3WriteStatus> {
  if (!actorId || !requestKey) return Promise.resolve({ state: 'unknown' });
  return reconcileK3Write(async () => {
    const { data, error } = await supabase.from('k3_goals')
      .select('id').eq('user_id', actorId).eq('request_key', requestKey).maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  });
}

/** Version read uses the existing owner/goal-scoped RLS and unique (actor_id, request_key). */
export function findK3SavedResult(actorId: string, requestKey: string): Promise<K3WriteStatus> {
  if (!actorId || !requestKey) return Promise.resolve({ state: 'unknown' });
  return reconcileK3Write(async () => {
    const { data, error } = await supabase.from('k3_kpi_result_versions')
      .select('result_id').eq('actor_id', actorId).eq('request_key', requestKey).maybeSingle();
    if (error) throw error;
    return data?.result_id ?? null;
  });
}
