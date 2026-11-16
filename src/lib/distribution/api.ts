import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CommercialAreaAccess = {
  orders: boolean;
  distribution: boolean;
  distribution_units: string[];
};
export type CommercialOverview = {
  area: 'orders' | 'distribution';
  system_id: string;
  system_name: string;
  year: number;
  departments: number;
  staff: number;
  goals: number;
  submitted_plans: number;
  official_reports: number;
  server_now: string;
};

/** Read-only area boundaries; user-specific cache never confers backend permissions. */
export const commercialAreaAccessQuery = (userId: string) => queryOptions({
  queryKey: ['commercial-area-access', userId],
  enabled: Boolean(userId),
  queryFn: async (): Promise<CommercialAreaAccess> => {
    const { data, error } = await (supabase as any).rpc('biz_area_access');
    if (error) throw new Error(error.message);
    return data as CommercialAreaAccess;
  },
  staleTime: 60_000,
  retry: 1,
});
export const commercialOverviewQuery = (userId: string, area: CommercialOverview['area'], year: number) => queryOptions({
  queryKey: ['commercial-overview', userId, area, year],
  enabled: Boolean(userId),
  queryFn: async (): Promise<CommercialOverview> => {
    const { data, error } = await (supabase as any).rpc('biz_area_overview_read', { _area: area, _year: year });
    if (error) throw new Error(error.message);
    return data as CommercialOverview;
  },
  staleTime: 30_000,
  retry: 1,
});
