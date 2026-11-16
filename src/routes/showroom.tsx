import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Building2, ClipboardList, RefreshCw, ShieldCheck, Store, Users } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showroomOverviewRead } from '@/lib/showroom/api';

export const Route = createFileRoute('/showroom')({
  head: () => ({ meta: [
    { title: 'Showroom — Base Sứ Việt' },
    { name: 'description', content: 'Khối Showroom độc lập: cửa hàng, nhân sự, vai trò và cơ cấu bán lẻ.' },
  ] }),
  component: ShowroomPage,
});

function ShowroomPage() {
  const { user, can, isSuperAdmin } = useCurrentUser();
  const authorized = !!user && user.status === 'Đang hoạt động' && (isSuperAdmin || can('showroom.view'));
  const query = useQuery({
    queryKey: ['showroom-overview', user?.id],
    queryFn: showroomOverviewRead,
    enabled: authorized,
    staleTime: 30_000,
    retry: 1,
  });
  const overview = query.data;
  const canEditOrg = isSuperAdmin || can('org.assign_staff') || can('org.appoint_manager') || can('org.manage_structure');

  if (!authorized) {
    return <div className="space-y-5">
      <PageHeader title="Khối Showroom" description="Hệ thống quản lý bán lẻ Sứ Việt" />
      <div role="alert" className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Tài khoản chưa có quyền vào phân hệ Showroom. Quyền được cấp theo vị trí trong Cơ cấu tổ chức.
      </div>
    </div>;
  }

  return <div className="min-w-0 space-y-6 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageHeader title="Khối Showroom" description="Phân hệ bán lẻ độc lập với Khối Kinh doanh" />
      <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
        <RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />Làm mới
      </Button>
    </div>

    {query.isPending && <div role="status" className="rounded-xl border bg-card p-8 text-muted-foreground">
      Đang tải dữ liệu Showroom từ Cơ cấu tổ chức…
    </div>}
    {query.error && <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6 space-y-3">
      <p className="font-semibold">Chưa tải được dữ liệu Showroom</p>
      <p className="text-sm text-muted-foreground">{query.error.message}</p>
      <Button variant="outline" size="sm" onClick={() => query.refetch()}>Thử lại</Button>
    </div>}

    {overview && <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Store className="h-4 w-4"/>Cửa hàng</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">{overview.store_count}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Users className="h-4 w-4"/>Nhân sự</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">{overview.staff_count}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><ShieldCheck className="h-4 w-4"/>Phạm vi xem</CardTitle></CardHeader><CardContent><div className="text-base font-semibold">{overview.scope === 'company' ? 'Toàn Khối Showroom' : overview.scope === 'unit' ? 'Cửa hàng phụ trách' : 'Cửa hàng của tôi'}</div></CardContent></Card>
      </div>

      <section aria-labelledby="showroom-list-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="showroom-list-heading" className="text-lg font-semibold">Hệ Bán Lẻ · Danh sách cửa hàng</h2>
          {canEditOrg && <Button asChild variant="outline" size="sm"><Link to="/organization"><Building2 className="mr-2 h-4 w-4"/>Cơ cấu & bổ nhiệm</Link></Button>}
        </div>
        {overview.stores.length === 0 && <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Chưa tìm thấy cửa hàng thuộc phạm vi được phân công.</div>}
        <div className="grid gap-4 lg:grid-cols-2">
          {overview.stores.map(store => <Card key={store.id} className="min-w-0">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg"><Store className="h-5 w-5 text-primary"/>{store.name}</CardTitle>
                <Badge variant="secondary">Đang hoạt động</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{store.staff_count} nhân sự · {store.manager_count > 0 ? `${store.manager_count} cửa hàng trưởng` : 'Chưa bổ nhiệm cửa hàng trưởng'}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4" />{overview.scope === 'own' ? 'Vị trí của tôi' : 'Nhân sự cửa hàng'}</h3>
              {store.staff.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có nhân sự.</p> :
                <div className="divide-y rounded-lg border">
                  {store.staff.map(person => <div key={person.id} className="flex items-center justify-between gap-3 px-3 py-3">
                    <span className="min-w-0 truncate text-sm font-medium">{person.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{person.position}</span>
                  </div>)}
                </div>}
            </CardContent>
          </Card>)}
        </div>
      </section>
    </>}

    <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
      <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="space-y-1 text-sm">
        <p className="font-semibold">Giai đoạn 1 — Cơ cấu và nhân sự Showroom</p>
        <p className="text-muted-foreground">Dữ liệu cửa hàng, vị trí và nhân viên lấy trực tiếp từ cơ cấu tổ chức. Các nghiệp vụ bán lẻ chuyên biệt như POS, tồn kho và báo cáo doanh thu sẽ được triển khai ở giai đoạn tiếp theo; hiện chưa có dữ liệu bán hàng trong phân hệ này.</p>
      </div>
    </div>
  </div>;
}
