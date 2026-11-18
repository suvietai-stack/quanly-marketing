import { supabase } from '@/integrations/supabase/client';

export type K3WriteCheck = { status: 'saved'; id: string } | { status: 'missing' } | { status: 'unknown' };

/** A missing HTTP response is not proof that a transaction rolled back. Never rotate the request key on these errors. */
export function isK3AmbiguousWrite(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: unknown; status?: unknown; message?: unknown; name?: unknown };
  const code = String(e.code ?? '');
  const message = String(e.message ?? '');
  const status = Number(e.status);
  return code === '57014'
    || code === 'PGRST000'
    || /^08[0-9A-Z]{3}$/.test(code)
    || [408, 502, 503, 504, 520, 522, 524].includes(status)
    || /timeout|timed out|network|failed to fetch|fetch failed|connection (?:closed|lost|reset)|abort/i.test(message)
    || e.name === 'AbortError';
}

/** Read-only, owner-scoped reconciliation. Do not infer success from a matching name or KPI value. */
export async function checkK3QuickCreate(uid: string, requestKey: string): Promise<K3WriteCheck> {
  if (!uid || !requestKey) return { status: 'unknown' };
  try {
    const { data, error } = await supabase.from('k3_goals')
      .select('id').eq('user_id', uid).eq('request_key', requestKey).maybeSingle();
    if (error) return { status: 'unknown' };
    return data?.id ? { status: 'saved', id: data.id } : { status: 'missing' };
  } catch {
    return { status: 'unknown' };
  }
}

/** The immutable result version has a UNIQUE(actor_id, request_key) fence on the server. */
export async function checkK3ResultSave(uid: string, requestKey: string): Promise<K3WriteCheck> {
  if (!uid || !requestKey) return { status: 'unknown' };
  try {
    const { data, error } = await supabase.from('k3_kpi_result_versions')
      .select('result_id').eq('actor_id', uid).eq('request_key', requestKey).maybeSingle();
    if (error) return { status: 'unknown' };
    return data?.result_id ? { status: 'saved', id: data.result_id } : { status: 'missing' };
  } catch {
    return { status: 'unknown' };
  }
}

/** Daily execution writes have an owner-scoped UNIQUE(user_id, request_key) constraint. */
export async function checkK3TaskSave(uid: string, requestKey: string): Promise<K3WriteCheck> {
  if (!uid || !requestKey) return { status: 'unknown' };
  try {
    const { data, error } = await supabase.from('k3_tasks')
      .select('id').eq('user_id', uid).eq('request_key', requestKey).maybeSingle();
    if (error) return { status: 'unknown' };
    return data?.id ? { status: 'saved', id: data.id } : { status: 'missing' };
  } catch {
    return { status: 'unknown' };
  }
}
