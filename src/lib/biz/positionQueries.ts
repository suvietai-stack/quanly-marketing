import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import type { PositionsData, PreviewReviewer } from './positions';
export const positionsQuery = (uid: string) => queryOptions({ queryKey: ['biz_positions', uid], staleTime: 0, queryFn: async () => { const { data, error } = await supabase.rpc('biz_positions_read'); if (error) throw error; return data as unknown as PositionsData; } });
export const roleScopesQuery = (uid: string) => queryOptions({ queryKey: ['biz_role_scopes', uid], staleTime: 0, queryFn: async () => { const { data, error } = await supabase.rpc('biz_role_scopes_read'); if (error) throw error; return data as unknown as { id: string; scope: string }[]; } });
export async function previewWorkflow(data: Record<string, unknown>) { const result = await supabase.rpc('biz_workflow_preview', { _data: data as never }); if (result.error) throw result.error; return result.data as unknown as PreviewReviewer[]; }
export function usePositionAction() { const qc = useQueryClient(); return useMutation({ mutationFn: async (a: { kind: 'position' | 'appointment'; data: Record<string, unknown> } | { kind: 'role'; role: string; scope: string }) => {
 const result = a.kind === 'role' ? await supabase.rpc('biz_role_scope_save', { _role: a.role, _scope: a.scope }) : a.kind === 'position' ? await supabase.rpc('biz_position_save', { _data: a.data as never }) : await supabase.rpc('biz_appointment_save', { _data: a.data as never });
 if (result.error) throw result.error; return result.data;
 }, onSuccess: async () => { await useAuth.getState().refreshBizAccess(true); await qc.invalidateQueries({ predicate: q => String(q.queryKey[0]).startsWith('biz_') }); } }); }