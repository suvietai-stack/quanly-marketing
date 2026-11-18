import { supabase } from '@/integrations/supabase/client';
import type { AreaMember, AreaUnit } from './area';

export type K3HubState = 'none' | 'planned' | 'updated' | 'confirmed';
export type K3HubBlock = { id: string; name: string; enabled: boolean };
export type K3HubUnit = { id: string; name: string; kind: string; block_id: string; block_name: string };
export type K3HubAccess = {
  can_company: boolean;
  can_config: boolean;
  can_manage: boolean;
  can_personal: boolean;
  units: K3HubUnit[];
};
export type K3HubPerson = {
  user_id: string;
  full_name: string;
  unit_id: string;
  unit_name: string;
  block_id: string;
  block_name: string;
  position: string;
  state: K3HubState;
  goals_count: number;
  actions_count: number;
  results_count: number;
};
export type K3HubReport = {
  date: string;
  unit_id: string;
  server_now: string;
  can_config: boolean;
  blocks: K3HubBlock[];
  people: K3HubPerson[];
};
export type K3HubDetails = {
  name: string;
  user_id: string;
  date: string;
  unit_id: string;
  goals: { id: string; name: string; status: string; due_date: string | null; expected_result: string | null }[];
  actions: { id: string; name: string; status: string; due_date: string | null; goal_name: string }[];
  results: { name: string; value: number | null; target: number | null; unit: string | null; note: string | null }[];
  day: { kg: string | null; summary_note: string | null; planned_at: string | null; summarized_at: string | null } | null;
  feedback: { id: string; body: string; author_name: string; created_at: string }[];
  can_comment: boolean;
};
export type K3HubPolicy = {
  revision: number;
  effective_from: string;
  applied_block_ids: string[];
  include_unassigned: boolean;
  today: string;
  blocks: { id: string; name: string }[];
};

async function rpc<T>(name: string, args?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const query = args ? supabase.rpc(name as never, args as never) : supabase.rpc(name as never);
  const { data, error } = await (signal ? query.abortSignal(signal) : query);
  if (error) throw new Error(error.message);
  return data as unknown as T;
}

export const k3HubAccess = () => rpc<K3HubAccess>('k3hub_access_read');
export const k3HubAccessWithSignal = (signal: AbortSignal) => rpc<K3HubAccess>('k3hub_access_read', undefined, signal);
export const k3HubAreaChart = () => rpc<{ server_now: string; units: AreaUnit[]; members: AreaMember[] }>('base_org_chart_read');
export const k3HubAreaChartWithSignal = (signal: AbortSignal) => rpc<{ server_now: string; units: AreaUnit[]; members: AreaMember[] }>('base_org_chart_read', undefined, signal);
export const k3HubReport = (date: string, unit: string) =>
  rpc<K3HubReport>('k3hub_read', { _date: date, _unit: unit });
export const k3HubDetails = (user: string, date: string, unit: string) =>
  rpc<K3HubDetails>('k3hub_member_read', { _user: user, _date: date, _unit: unit });
export const k3HubFeedbackSave = (user: string, date: string, unit: string, body: string) =>
  rpc<{ id: string; created_at: string }>('k3hub_feedback_save',
    { _user: user, _date: date, _unit: unit, _body: body });
export const k3HubPolicyRead = () => rpc<K3HubPolicy>('k3hub_policy_read');
export const k3HubPolicySave = (revision: number, date: string, blocks: string[], reason: string) =>
  rpc<K3HubPolicy>('k3hub_policy_save', {
    _revision: revision, _date: date, _blocks: blocks, _reason: reason,
  });

export const K3_HUB_STATES: Record<K3HubState,string> = {
  none: 'Chưa cập nhật',
  planned: 'Có mục tiêu KG',
  updated: 'Đang cập nhật',
  confirmed: 'Đã xác nhận',
};

export function k3HubTotals(people: K3HubPerson[]) {
  // One employee can hold concurrent appointments in multiple units.
  // Count people and completion once in the company summary.
  const unique = new Map(people.map(p => [p.user_id,p]));
  return {
    people: unique.size,
    pending: [...unique.values()].filter(p => p.state==='none').length,
    confirmed: [...unique.values()].filter(p => p.state==='confirmed').length,
    goals: people.reduce((sum,p) => sum + p.goals_count, 0),
    actions: people.reduce((sum,p) => sum + p.actions_count, 0),
    results: people.reduce((sum,p) => sum + p.results_count, 0),
  };
}
