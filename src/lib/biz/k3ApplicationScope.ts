import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface K3ApplicationDraft {
  revision: number;
  applies_all_blocks: boolean;
  applied_block_ids: string[];
  applies_unassigned: boolean;
  effective_from: string;
  reason: string;
}
export interface K3ApplicationScope extends Omit<K3ApplicationDraft, 'reason' | 'effective_from'> {
  effective_from: string | null;
  today: string;
  blocks: { id: string; name: string }[];
  employee_count: number;
}
// Staged RPC names remain isolated until generated types include the approved migration.
const stagedRpc = supabase.rpc.bind(supabase) as unknown as (
  name: string, args?: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }>;
export async function applicationScopeRpc(name: 'read' | 'preview' | 'save', payload?: K3ApplicationDraft) {
  const result = await stagedRpc(`k3_application_scope_${name}`, payload ? { _payload: payload } : undefined);
  if (result.error) throw result.error;
  return result.data;
}
export const k3ApplicationScopeQuery = (uid: string) => queryOptions({
  queryKey: ['k3_application_scope', uid],
  staleTime: 60_000,
  retry: false,
  refetchOnWindowFocus: false,
  queryFn: async () => await applicationScopeRpc('read') as K3ApplicationScope,
});