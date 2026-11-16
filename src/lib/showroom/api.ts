import { supabase } from '@/integrations/supabase/client';

export type ShowroomEmployee = {
  id: string;
  name: string;
  position: string;
  is_manager: boolean;
};
export type ShowroomStore = {
  id: string;
  name: string;
  staff_count: number;
  manager_count: number;
  staff: ShowroomEmployee[];
};
export type ShowroomOverview = {
  scope: 'company' | 'unit' | 'own';
  store_count: number;
  staff_count: number;
  server_now: string;
  stores: ShowroomStore[];
};

/** Read-only, server-scoped data from the canonical organization. */
export async function showroomOverviewRead(): Promise<ShowroomOverview> {
  const { data, error } = await supabase.rpc('showroom_overview_read' as never);
  if (error) throw new Error(error.message);
  return data as unknown as ShowroomOverview;
}
