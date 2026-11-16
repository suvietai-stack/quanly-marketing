import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/lib/auth';

export const DISTRIBUTION_SYSTEM_ID = '3df93c75-8a46-4c2f-bc09-7583aa672b52' as const;
export type BizAreaAccess = {
  orders: boolean;
  distribution: boolean;
  distribution_units: string[];
};

/** Server-computed from active canonical appointments; not from browser-stored Roles. */
export function useBizAreaAccess() {
  const { user } = useCurrentUser();
  return useQuery({
    queryKey: ['biz-area-access', user?.id],
    enabled: !!user?.id && user.status === 'Đang hoạt động',
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('biz_area_access');
      if (error) throw new Error(error.message);
      const raw = data as Partial<BizAreaAccess> | null;
      return {
        orders: raw?.orders === true,
        distribution: raw?.distribution === true,
        distribution_units: Array.isArray(raw?.distribution_units) ? raw.distribution_units.filter(x => typeof x === 'string') : [],
      } satisfies BizAreaAccess;
    },
    retry: 1, staleTime: 60_000, refetchOnWindowFocus: true,
  });
}
