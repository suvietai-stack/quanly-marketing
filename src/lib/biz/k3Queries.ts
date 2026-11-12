import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { K3DayData, K3Settings, K3TeamRow } from './k3';

export const k3SettingsQuery = (uid: string) => queryOptions({
  queryKey: ['k3_settings', uid],
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  retry: false,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_settings_read');
    if (error) throw error;
    return data as unknown as K3Settings;
  },
});

export const k3DayQuery = (uid: string, date: string) => queryOptions({
  queryKey: ['k3_day', uid, date],
  staleTime: 0,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_day_read', { _date: date });
    if (error) throw error;
    return data as unknown as K3DayData;
  },
});

export const k3TeamQuery = (uid: string, date: string) => queryOptions({
  queryKey: ['k3_team', uid, date],
  staleTime: 0,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_team_read', { _date: date });
    if (error) throw error;
    return data as unknown as K3TeamRow[];
  },
});

export const k3UserDayQuery = (uid: string, user: string, date: string) => queryOptions({
  queryKey: ['k3_user_day', uid, user, date],
  staleTime: 0,
  queryFn: async () => {
    const { data, error } = await supabase.rpc('k3_user_day_read', { _user: user, _date: date });
    if (error) throw error;
    return data as unknown as K3DayData & { user: { id: string; full_name: string } | null; can_comment: boolean };
  },
});

function useK3Invalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') });
}

export function useK3DaySave() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (a: { date: string; kg: string }) => {
      const { data, error } = await supabase.rpc('k3_day_save', { _date: a.date, _kg: a.kg });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useK3TaskSave() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await supabase.rpc('k3_task_save', { _payload: payload as never });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useK3TaskUpdate() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (a: { id: string; revision?:number; status: string; kpi_actual?: number | null; progress?: number | null; problem?: string; cause?: string; solution?: string; note?: string }) => {
      const { data, error } = await supabase.rpc('k3_task_save', { _payload: a as never });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useK3TaskDelete() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('k3_task_delete', { _id: id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useK3Summary() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (date: string) => {
      const { data, error } = await supabase.rpc('k3_summary_confirm', { _date: date });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useK3Comment() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (a: { day_id: string; task_id?: string | null; body: string }) => {
      const { data, error } = await supabase.rpc('k3_comment_save', { _day_id: a.day_id, _task_id: a.task_id ?? null, _body: a.body } as never);
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useK3SettingsSave() {
  const invalidate = useK3Invalidate();
  return useMutation({
    mutationFn: async (a: { enabled: boolean; effective_from: string | null; plan_by: string; summary_by: string; max_focus: number }) => {
      const { data, error } = await supabase.rpc('k3_settings_save', {
        _enabled: a.enabled, _effective_from: a.effective_from, _plan_by: a.plan_by, _summary_by: a.summary_by, _max_focus: a.max_focus,
      } as never);
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}
