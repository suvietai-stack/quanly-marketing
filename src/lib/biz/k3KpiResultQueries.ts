import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { K3DailyValue, K3Measurement } from './k3KpiResults';
import type { K3TypedMetric } from './k3Measurement';

export interface K3SavedResult extends K3DailyValue {
  id: string; user_id: string; work_date: string; revision: number; full_name?: string;
  note?: string; problem?: string; cause?: string; solution?: string; is_confirmed?: boolean;
}
export interface K3ResultData {
  kpi: K3Measurement & { id: string; name: string; unit: string | null };
  can_update: boolean;
  day_closed?: boolean;
  metric: K3TypedMetric;
  official_metric: K3TypedMetric;
  daily_metric?: K3TypedMetric;
  daily_plan?: number | null;
  can_accept?: boolean;
  acceptances?: { id: string; result_id: string; result_revision: number; decision: string; reason: string }[];
  daily: K3SavedResult | null;
  results: K3SavedResult[];
  history: { id: string; revision: number; snapshot: K3SavedResult; created_at: string }[];
}
export const k3KpiResultQuery = (uid: string, kpi: string, date: string) => queryOptions({
  queryKey: ['k3_kpi_result', uid, kpi, date], staleTime: 30_000, refetchOnWindowFocus: false, retry: 1,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_kpi_result_read', { _kpi: kpi, _date: date });
    if (error) throw error;
    return data as unknown as K3ResultData;
  },
});
export function useK3KpiResultSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await supabase.rpc('k3_kpi_result_save', { _payload: payload as never });
      if (error) throw error;
      return data as unknown as K3ResultData;
    },
    onSuccess: () => { void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') && q.queryKey[0] !== 'k3_preview' }); },
  });
}