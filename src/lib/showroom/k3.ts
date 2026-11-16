import { supabase } from '@/integrations/supabase/client';

export type ShowroomK3State = 'none' | 'planned' | 'updated' | 'confirmed';

export type ShowroomK3Member = {
  user_id: string;
  full_name: string;
  store_id: string;
  store_name: string;
  position: string;
  state: ShowroomK3State;
  goals_count: number;
  actions_count: number;
  results_count: number;
  planned_at: string | null;
  summarized_at: string | null;
  confirmed_at: string | null;
  can_comment: boolean;
};
export type ShowroomK3Team = {
  date: string;
  scope: 'own' | 'store' | 'company';
  member_count: number;
  people: ShowroomK3Member[];
  server_now: string;
};
export type ShowroomK3Feedback = {
  id: string;
  body: string;
  created_at: string;
  author_name: string;
};
export type ShowroomK3Detail = {
  person: { id: string; name: string };
  date: string;
  scope: 'own' | 'store' | 'company';
  day: {
    kg: string | null;
    summary_note: string | null;
    planned_at: string | null;
    summarized_at: string | null;
  } | null;
  goals: { id: string; name: string; status: string; due_date: string | null; expected_result: string | null }[];
  actions: { id: string; name: string; status: string; goal_name: string; kpi_target: number | null; kpi_unit: string | null }[];
  results: { kpi_id: string; value: number | null; note: string | null; kpi_name: string; unit: string | null; target: number | null }[];
  feedback: ShowroomK3Feedback[];
  can_comment: boolean;
};

export async function readShowroomK3Team(date: string): Promise<ShowroomK3Team> {
  const { data, error } = await supabase.rpc('showroom_k3_team_read' as never, { _date: date } as never);
  if (error) throw new Error(error.message);
  return data as unknown as ShowroomK3Team;
}
export async function readShowroomK3Member(user: string, date: string): Promise<ShowroomK3Detail> {
  const { data, error } = await supabase.rpc('showroom_k3_member_read' as never,
    { _user: user, _date: date } as never);
  if (error) throw new Error(error.message);
  return data as unknown as ShowroomK3Detail;
}
export async function sendShowroomK3Feedback(user: string, date: string, body: string): Promise<void> {
  const { error } = await supabase.rpc('showroom_k3_comment_save' as never,
    { _user: user, _date: date, _body: body } as never);
  if (error) throw new Error(error.message);
}

export const SHOWROOM_K3_LABELS: Record<ShowroomK3State, string> = {
  none: 'Chưa cập nhật',
  planned: 'Đã có KG',
  updated: 'Đang thực hiện',
  confirmed: 'Đã xác nhận',
};

export function showroomK3Summary(people: ShowroomK3Member[]) {
  return {
    total: people.length,
    none: people.filter(p => p.state === 'none').length,
    active: people.filter(p => p.state === 'planned' || p.state === 'updated').length,
    confirmed: people.filter(p => p.state === 'confirmed').length,
    goals: people.reduce((sum,p) => sum + p.goals_count, 0),
    results: people.reduce((sum,p) => sum + p.results_count, 0),
  };
}
