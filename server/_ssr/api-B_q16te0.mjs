import { s as supabase } from "./client-DfPXH9B8.mjs";
async function rpc(name, args, signal) {
  const query = args ? supabase.rpc(name, args) : supabase.rpc(name);
  const { data, error } = await (signal ? query.abortSignal(signal) : query);
  if (error) throw new Error(error.message);
  return data;
}
const k3HubAccess = () => rpc("k3hub_access_read");
const k3HubAccessWithSignal = (signal) => rpc("k3hub_access_read", void 0, signal);
const k3HubAreaChartWithSignal = (signal) => rpc("base_org_chart_read", void 0, signal);
const k3HubReport = (date, unit) => rpc("k3hub_read", { _date: date, _unit: unit });
const k3HubDetails = (user, date, unit) => rpc("k3hub_member_read", { _user: user, _date: date, _unit: unit });
const k3HubFeedbackSave = (user, date, unit, body) => rpc(
  "k3hub_feedback_save",
  { _user: user, _date: date, _unit: unit, _body: body }
);
const k3HubPolicyRead = () => rpc("k3hub_policy_read");
const k3HubPolicySave = (revision, date, blocks, reason) => rpc("k3hub_policy_save", {
  _revision: revision,
  _date: date,
  _blocks: blocks,
  _reason: reason
});
const K3_HUB_STATES = {
  none: "Chưa cập nhật",
  planned: "Có mục tiêu KG",
  updated: "Đang cập nhật",
  confirmed: "Đã xác nhận"
};
function k3HubTotals(people) {
  const unique = new Map(people.map((p) => [p.user_id, p]));
  return {
    people: unique.size,
    pending: [...unique.values()].filter((p) => p.state === "none").length,
    confirmed: [...unique.values()].filter((p) => p.state === "confirmed").length,
    goals: people.reduce((sum, p) => sum + p.goals_count, 0),
    actions: people.reduce((sum, p) => sum + p.actions_count, 0),
    results: people.reduce((sum, p) => sum + p.results_count, 0)
  };
}
export {
  K3_HUB_STATES as K,
  k3HubAreaChartWithSignal as a,
  k3HubReport as b,
  k3HubTotals as c,
  k3HubPolicyRead as d,
  k3HubDetails as e,
  k3HubFeedbackSave as f,
  k3HubPolicySave as g,
  k3HubAccess as h,
  k3HubAccessWithSignal as k
};
