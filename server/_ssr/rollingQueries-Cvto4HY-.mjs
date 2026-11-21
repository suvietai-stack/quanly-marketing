import { q as queryOptions, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
const bizGoalsQuery = (uid, year) => queryOptions({ queryKey: ["biz_goals", uid, year], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_goals_read", { _year: year });
  if (error) throw error;
  return data;
} });
const bizGoalEventsQuery = (uid, goalId) => queryOptions({ queryKey: ["biz_goal_events", uid, goalId], queryFn: async () => {
  const { data, error } = await supabase.from("biz_goal_events").select("id,version_id,actor_id,action,comment,created_at,payload").eq("goal_id", goalId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
} });
const bizGoalDeadlineQuery = (uid, year) => queryOptions({ queryKey: ["biz_goal_deadline", uid, year], queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_deadline_at", { _kind: "goal_year", _year: year, _period: 1 });
  if (error) throw error;
  return data;
} });
function useGoalAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (action) => {
    const result = action.kind === "start" ? await supabase.rpc("biz_goal_start", { _year: action.year, _reason: action.reason ?? void 0 }) : action.kind === "save" ? await supabase.rpc("biz_goal_save", { _version_id: action.id, _revision: action.revision, _items: action.items, _submit: action.submit }) : action.kind === "delete" ? await supabase.rpc("biz_goal_draft_delete", { _version_id: action.id }) : await supabase.rpc("biz_goal_decide", { _version_id: action.id, _revision: action.revision, _approve: action.approve, _comment: action.comment });
    if (result.error) throw result.error;
    return result.data;
  }, onSuccess: async () => {
    await Promise.all([qc.invalidateQueries({ queryKey: ["biz_approvals"] }), qc.invalidateQueries({ queryKey: ["biz_dashboard"] }), qc.invalidateQueries({ queryKey: ["biz_dashboard_published"] }), qc.invalidateQueries({ queryKey: ["biz_goals"] }), qc.invalidateQueries({ queryKey: ["biz_goal_events"] })]);
  } });
}
const rollingQuery = (uid, goal) => queryOptions({ queryKey: ["biz_rolling", uid, goal], staleTime: 0, refetchInterval: 3e4, refetchOnWindowFocus: true, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_rolling_read", { _goal: goal });
  if (error) throw error;
  return data;
} });
function useRollingSave() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (a) => {
    const { data, error } = await supabase.rpc("biz_rolling_save", { _goal: a.goal, _items: a.items, _reason: a.reason, _revision: a.revision, _submit: a.submit });
    if (error) throw error;
    return data;
  }, onSuccess: () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("biz_") }) });
}
const openingActualsQuery = (uid, user) => queryOptions({ queryKey: ["biz_opening_actuals", uid, user], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_opening_actuals_read", { _user: user });
  if (error) throw error;
  return data;
} });
function useOpeningAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (a) => {
    const result = a.kind === "save" ? await supabase.rpc("biz_opening_actual_save", { _data: a.data }) : await supabase.rpc("biz_opening_actual_delete", { _id: a.id });
    if (result.error) throw result.error;
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("biz_") }) });
}
export {
  bizGoalDeadlineQuery as a,
  bizGoalsQuery as b,
  bizGoalEventsQuery as c,
  useRollingSave as d,
  useOpeningAction as e,
  openingActualsQuery as o,
  rollingQuery as r,
  useGoalAction as u
};
