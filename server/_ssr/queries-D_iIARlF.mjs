import { q as queryOptions, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
const bizDepartmentsQuery = queryOptions({
  queryKey: ["biz_departments"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_departments").select("id, name, description, active, sort_order").order("sort_order").order("name");
    if (error) throw error;
    return data ?? [];
  }
});
const bizMembersQuery = queryOptions({
  queryKey: ["biz_department_members"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_department_members").select("id, department_id, user_id, is_manager, effective_from, effective_to, started_at, ended_at").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
});
const bizKrMetricsQuery = queryOptions({
  queryKey: ["biz_kr_metrics"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_kr_metrics").select("id, department_id, name, description, unit, value_kind, aggregation, direction, sort_order, active, effective_from, effective_to, standard_code, standard_label").order("sort_order").order("name");
    if (error) throw error;
    return data ?? [];
  }
});
const bizDeadlineQuery = queryOptions({
  queryKey: ["biz_deadline_config"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_deadline_config").select("data").eq("id", true).maybeSingle();
    if (error) throw error;
    return data?.data ?? {};
  }
});
function useBizMutation(fn, keys) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args) => {
      const { data, error } = await supabase.rpc(fn, args);
      if (error) throw error;
      return data;
    },
    onSuccess: () => [...keys, ["biz_dashboard"], ["biz_dashboard_published"]].forEach((queryKey) => qc.invalidateQueries({ queryKey }))
  });
}
const useBizKrSave = () => useBizMutation("biz_kr_save", [["biz_kr_metrics"]]);
const useBizKrStandardSave = () => useBizMutation("biz_kr_standard_save", [["biz_kr_metrics"], ["biz_dashboard"]]);
const useBizDeadlineSave = () => useBizMutation("biz_deadline_save", [["biz_deadline_config"], ["biz_deadline_config_log"], ["biz_my_work"], ["biz_docs"], ["biz_deadline_milestones"]]);
const bizDeadlineLogQuery = queryOptions({
  queryKey: ["biz_deadline_config_log"],
  queryFn: async () => {
    const { data, error } = await supabase.from("biz_deadline_config_log").select("id, actor_id, old_data, new_data, created_at").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return data ?? [];
  }
});
const bizMilestonesQuery = (kind, year, period) => queryOptions({
  queryKey: ["biz_deadline_milestones", kind, year, period],
  queryFn: async () => {
    const pk = kind.replace(/^(plan|report)_/, "");
    const { data, error } = await supabase.rpc("biz_any_milestones", { _kind: kind.startsWith("plan_") ? "plan" : "report", _pk: pk, _y: year, _p: period });
    if (error) throw error;
    return data;
  }
});
const bizLateRequestsQuery = (kind, periodKind, year, period) => queryOptions({
  queryKey: ["biz_late_requests", kind ?? null, periodKind ?? null, year ?? null, period ?? null],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("biz_late_requests_read", { _kind: kind ?? null, _period_kind: periodKind ?? null, _year: year ?? null, _period: period ?? null });
    if (error) throw error;
    return data;
  }
});
const useBizLateRequestCreate = () => useBizMutation("biz_late_request_create", [["biz_late_requests"]]);
const useBizLateRequestDecide = () => useBizMutation("biz_late_request_decide", [["biz_late_requests"]]);
export {
  useBizLateRequestCreate as a,
  bizLateRequestsQuery as b,
  bizMilestonesQuery as c,
  bizMembersQuery as d,
  bizDepartmentsQuery as e,
  bizDeadlineQuery as f,
  useBizDeadlineSave as g,
  bizDeadlineLogQuery as h,
  bizKrMetricsQuery as i,
  useBizKrStandardSave as j,
  useBizKrSave as k,
  useBizLateRequestDecide as u
};
