import { supabase } from '@/integrations/supabase/client';

export type CrmSaveReceipt =
  | { status: 'saved'; id: string }
  | { status: 'missing' }
  | { status: 'unknown' };

/** A transport failure does not prove that a PostgreSQL write was rolled back. */
export function isAmbiguousCrmWrite(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: unknown; status?: unknown; message?: unknown; name?: unknown };
  const code = String(e.code ?? '');
  const status = Number(e.status);
  const message = String(e.message ?? '');
  return code === '57014'
    || code === 'PGRST000'
    || /^08[0-9A-Z]{3}$/.test(code)
    || [408, 502, 503, 504, 520, 522, 524].includes(status)
    || /timeout|timed out|failed to fetch|network|fetch failed|connection (?:closed|reset|lost)|abort/i.test(message)
    || e.name === 'AbortError';
}

/**
 * CRM has UNIQUE(created_by, request_key). A verified match proves this request
 * committed, whereas absence does NOT prove the in-flight request rolled back.
 * Customer RLS limits this lookup to the current actor's visible records.
 */
export async function checkCrmCustomerCreated(actorId: string, requestKey: string): Promise<CrmSaveReceipt> {
  if (!actorId || !requestKey) return { status: 'unknown' };
  try {
    const { data, error } = await supabase.from('crm_customers')
      .select('id')
      .eq('created_by', actorId)
      .eq('request_key', requestKey)
      .maybeSingle();
    if (error) return { status: 'unknown' };
    return data?.id ? { status: 'saved', id: data.id } : { status: 'missing' };
  } catch {
    return { status: 'unknown' };
  }
}
