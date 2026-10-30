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
    const { data, error } = await supabase.from("biz_department_members").select("id, department_id, user_id, is_manager, effective_from, effective_to").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as BizMember[];
  },
});

export const bizKrMetricsQuery = queryOptions({
  queryKey: ["biz_kr_metrics"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_kr_metrics").select("id, department_id, name, description, unit, value_kind, aggregation, direction, sort_order, active, effective_from, effective_to").order("sort_order").order("name");
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
    onSuccess: () => keys.forEach((queryKey) => qc.invalidateQueries({ queryKey })),
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

export const useBizDeadlineSave = () =>
  useBizMutation<{ _data: BizDeadlineData }>("biz_deadline_save", [["biz_deadline_config"]]);
