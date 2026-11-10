import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { BaseOrganization } from '@/components/BaseOrganization';
import { OrgChart } from '@/components/OrgChart';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/lib/auth';
import type { OrgConfig } from '@/lib/basePermissions/types';
import { orgQuery } from '@/lib/biz/organizationQueries';
import { positionsQuery } from '@/lib/biz/positionQueries';

export const Route = createFileRoute('/organization')({
  head: () => ({ meta: [
    { title: 'Cơ cấu tổ chức & Phân quyền — Base Sứ Việt' },
    { name: 'description', content: 'Quản lý cơ cấu, quyền mặc định và quyền bổ sung của nhân sự Sứ Việt.' },
    { property: 'og:title', content: 'Cơ cấu tổ chức & Phân quyền — Base Sứ Việt' },
    { property: 'og:description', content: 'Quyền nhân sự theo nguồn cấp, phạm vi và hiệu lực.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: OrganizationRoute,
});

interface ChartReadMember { user_id: string; name: string; unit_id: string; title_id?: string | null; duties?: string | null; active: boolean; starts_at?: string | null; ends_at?: string | null }
interface ChartRead { server_now: string; units: OrgConfig['units']; titles: OrgConfig['titles']; members: ChartReadMember[] }

/** Sơ đồ chỉ xem cho nhân sự đang hoạt động — không gồm quyền, bộ quyền hay dữ liệu nhạy cảm. */
function OrgChartView() {
  const { user } = useCurrentUser();
  const chart = useQuery({
    queryKey: ['base-org-chart', user?.id],
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('base_org_chart_read');
      if (error) throw error;
      return data as unknown as ChartRead;
    },
  });
  const bizOrg = useQuery({ ...orgQuery(user?.id ?? ''), enabled: !!user?.id, retry: false });
  const bizPositions = useQuery({ ...positionsQuery(user?.id ?? ''), enabled: !!user?.id, retry: false });
  if (chart.isPending) return <p className="p-6 text-muted-foreground">Đang tải sơ đồ tổ chức…</p>;
  if (chart.error) return <p className="py-12 text-center text-muted-foreground">{chart.error.message}</p>;
  const data = chart.data!;
  const config: OrgConfig = {
    units: data.units,
    titles: data.titles,
    memberships: data.members.map(m => ({ id: `${m.user_id}:${m.unit_id}:${m.title_id ?? ''}`, user_id: m.user_id, unit_id: m.unit_id, title_id: m.title_id ?? undefined, duties: m.duties ?? undefined, active: m.active, starts_at: m.starts_at ?? undefined, ends_at: m.ends_at ?? undefined })),
    defaults: [], bundles: [], grants: [], bindings: [],
  };
  const staff = [...new Map(data.members.map(m => [m.user_id, { id: m.user_id, name: m.name }])).values()];
  return (
    <div className="space-y-5 max-w-6xl">
      <h1 className="text-xl font-bold">Cơ cấu tổ chức</h1>
      <OrgChart config={config} staff={staff} biz={bizOrg.data} positions={bizPositions.data} bizUnavailable={!!bizOrg.error || !!bizPositions.error} />
    </div>
  );
}

function OrganizationRoute() { const { isSuperAdmin } = useCurrentUser(); return isSuperAdmin ? <BaseOrganization /> : <OrgChartView />; }
