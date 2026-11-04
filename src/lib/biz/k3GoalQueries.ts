import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { K3GoalDetail, K3GoalRow, K3MemberSearchRow } from './k3Goals';

export const k3GoalListQuery = (uid: string, filter: string, q: string) => queryOptions({
  queryKey: ['k3_goals', uid, filter, q],
  staleTime: 0,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_goal_list', { _filter: filter, _q: q } as never);
    if (error) throw error;
    return data as unknown as K3GoalRow[];
  },
});

export const k3GoalDetailQuery = (uid: string, id: string) => queryOptions({
  queryKey: ['k3_goal', uid, id],
  staleTime: 0,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_goal_detail', { _id: id } as never);
    if (error) throw error;
    return data as unknown as K3GoalDetail;
  },
});

export const k3MemberSearchQuery = (uid: string, q: string) => queryOptions({
  queryKey: ['k3_member_search', uid, q],
  staleTime: 30000,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_member_search', { _q: q } as never);
    if (error) throw error;
    return data as unknown as K3MemberSearchRow[];
  },
});

type K3GoalMutationInput =
  | { kind: 'quick_create'; payload: Record<string, unknown> }
  | { kind: 'goal'; payload: Record<string, unknown> }
  | { kind: 'goal_status'; id: string; status: string; note?: string; revision: number }
  | { kind: 'invite'; goal_id: string; user_ids: string[] }
  | { kind: 'respond'; goal_id: string; accept: boolean }
  | { kind: 'revoke'; goal_id: string; user_id: string }
  | { kind: 'action'; payload: Record<string, unknown> }
  | { kind: 'action_status'; id: string; status: string; problem?: string; cause?: string; solution?: string; revision: number }
  | { kind: 'kpi'; payload: Record<string, unknown> }
  | { kind: 'kpi_delete'; id: string }
  | { kind: 'module_settings'; payload: Record<string, unknown> };

export function useK3GoalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: K3GoalMutationInput) => {
      let result;
      if (input.kind === 'quick_create') result = await supabase.rpc('k3_quick_create', { _payload: input.payload as never });
      else if (input.kind === 'goal') result = await supabase.rpc('k3_goal_save', { _payload: input.payload as never });
      else if (input.kind === 'goal_status') result = await supabase.rpc('k3_goal_status', { _id: input.id, _status: input.status, _note: input.note ?? null, _revision: input.revision } as never);
      else if (input.kind === 'invite') result = await supabase.rpc('k3_member_invite', { _goal_id: input.goal_id, _user_ids: input.user_ids } as never);
      else if (input.kind === 'respond') result = await supabase.rpc('k3_member_respond', { _goal_id: input.goal_id, _accept: input.accept } as never);
      else if (input.kind === 'revoke') result = await supabase.rpc('k3_member_revoke', { _goal_id: input.goal_id, _user_id: input.user_id } as never);
      else if (input.kind === 'action') result = await supabase.rpc('k3_action_save', { _payload: input.payload as never });
      else if (input.kind === 'action_status') result = await supabase.rpc('k3_action_status', { _id: input.id, _status: input.status, _problem: input.problem ?? null, _cause: input.cause ?? null, _solution: input.solution ?? null, _revision: input.revision } as never);
      else if (input.kind === 'kpi') result = await supabase.rpc('k3_kpi_save', { _payload: input.payload as never });
      else if (input.kind === 'kpi_delete') result = await supabase.rpc('k3_kpi_delete', { _id: input.id } as never);
      else result = await supabase.rpc('k3_module_settings_save', { _payload: input.payload as never });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') }),
  });
}
