import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BizDeadlineData, BizDepartment, BizKrMetric, BizMember } from "./types";

export const bizDepartmentsQuery = queryOptions({
  queryKey: ["biz_departments"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_departments").select("id, name, description, active, sort_order").order("sort_order").order("name");
    if (error) throw error;
    return (data ?? []) as BizDepartment[];
  },
});

export const bizMembersQuery = queryOptions({
  queryKey: ["biz_department_members"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_department_members").select("id, department_id, user_id, is_manager, effective_from, effective_to, started_at, ended_at").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as BizMember[];
  },
});

export const bizKrMetricsQuery = queryOptions({
  queryKey: ["biz_kr_metrics"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_kr_metrics").select("id, department_id, name, description, unit, value_kind, aggregation, direction, sort_order, active, effective_from, effective_to, standard_code, standard_label").order("sort_order").order("name");
    if (error) throw error;
    return (data ?? []) as BizKrMetric[];
  },
});

export const bizDeadlineQuery = queryOptions({
  queryKey: ["biz_deadline_config"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_deadline_config").select("data").eq("id", true).maybeSingle();
    if (error) throw error;
    return (data?.data ?? {}) as BizDeadlineData;
  },
});

function useBizMutation<TArgs extends Record<string, unknown>>(fn: string, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: TArgs) => {
      const { data, error } = await supabase.rpc(fn as any, args as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => [...keys,["biz_dashboard"]].forEach((queryKey) => qc.invalidateQueries({ queryKey })),
  });
}

export const useBizDeptSave = () =>
  useBizMutation<{ _id: string | null; _name: string; _description: string; _active: boolean; _sort_order: number }>("biz_dept_save", [["biz_departments"]]);

export const useBizMemberSave = () =>
  useBizMutation<{ _department_id: string; _user_id: string; _is_manager: boolean }>("biz_member_save", [["biz_department_members"]]);

export const useBizMemberEnd = () =>
  useBizMutation<{ _id: string }>("biz_member_end", [["biz_department_members"]]);

export const useBizKrSave = () =>
  useBizMutation<{
    _id: string | null; _department_id: string; _name: string; _description: string; _unit: string;
    _value_kind: string; _aggregation: string; _direction: string; _sort_order: number; _active: boolean;
  }>("biz_kr_save", [["biz_kr_metrics"]]);

export const useBizKrStandardSave = () =>
  useBizMutation<{ _metric_id: string; _code: string; _label: string }>("biz_kr_standard_save", [["biz_kr_metrics"], ["biz_dashboard"]]);

export const useBizDeadlineSave = () =>
  useBizMutation<{ _data: BizDeadlineData }>("biz_deadline_save", [["biz_deadline_config"], ["biz_deadline_config_log"]]);

export interface BizDeadlineLogRow { id: string; actor_id: string | null; old_data: BizDeadlineData; new_data: BizDeadlineData; created_at: string }
export const bizDeadlineLogQuery = queryOptions({
  queryKey: ["biz_deadline_config_log"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_deadline_config_log").select("id, actor_id, old_data, new_data, created_at").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data ?? []) as BizDeadlineLogRow[];
  },
});

export interface BizMilestonesIso { open: string | null; due: string | null; late_close: string | null }
export const bizMilestonesQuery = (kind: string, year: number, period: number) =>
  queryOptions({
    queryKey: ["biz_deadline_milestones", kind, year, period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("biz_deadline_milestones", { _kind: kind, _year: year, _period: period });
      if (error) throw error;
      return data as BizMilestonesIso;
    },
  });

export const bizLateRequestsQuery = (kind?: string, periodKind?: string, year?: number, period?: number) =>
  queryOptions({
    queryKey: ["biz_late_requests", kind ?? null, periodKind ?? null, year ?? null, period ?? null],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("biz_late_requests_read", { _kind: kind ?? null, _period_kind: periodKind ?? null, _year: year ?? null, _period: period ?? null });
      if (error) throw error;
      return data as { requests: BizLateRequest[]; server_now: string };
    },
  });

export const useBizLateRequestCreate = () =>
  useBizMutation<{ _kind: string; _period_kind: string; _year: number; _period: number; _reason: string }>("biz_late_request_create", [["biz_late_requests"]]);

export const useBizLateRequestDecide = () =>
  useBizMutation<{ _id: string; _approve: boolean; _comment: string }>("biz_late_request_decide", [["biz_late_requests"]]);
