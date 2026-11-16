import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Target, ClipboardCheck, ClipboardList, FileText, ArrowUpRight, CalendarDays, RefreshCw } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import { commercialOverviewQuery } from '@/lib/distribution/api';
import { PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DistributionOverview() {
  const { user } = useCurrentUser();
  const [year, setYear] = useState(new Date().getFullYear());
  const query = useQuery(commercialOverviewQuery(user?.id ?? '', 'distribution', year));
  const data = query.data;
  const metrics = [
    { name: 'Phòng Phân Phối', value: data?.departments, icon: Building2 },
    { name: 'Nhân sự hiện tại', value: data?.staff, icon: Users },
    { name: 'Hồ sơ KR năm', value: data?.goals, icon: Target },
    { name: 'Báo cáo chính thức', value: data?.official_reports, icon: ClipboardCheck },
  ];
  const functions = [
    { title: '3K Phân Phối', desc: 'Công việc, mục tiêu ngày và tiến độ theo đúng nhân sự Phân Phối', to: '/distribution/3k' as const, icon: ClipboardList },
    { title: 'Mục tiêu KR', desc: 'Thiết lập và theo dõi mục tiêu được giao', to: '/distribution/goals' as const, icon: Target },
    { title: 'Kế hoạch', desc: 'Kế hoạch kinh doanh theo kỳ', to: '/distribution/plans' as const, icon: CalendarDays },
    { title: 'Báo cáo', desc: 'Nộp và xem báo cáo Phân Phối', to: '/distribution/reports' as const, icon: FileText },
  ];
  return <div className="min-w-0 space-y-5 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageHeader title="Phân Phối" description="Phân hệ độc lập · Cùng một nguồn dữ liệu và lịch sử với Base" />
      <div className="flex items-center gap-2">
        <Input className="h-11 w-24" aria-label="Năm thống kê Phân Phối" type="number" min={2020} max={2200}
          value={year} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=2020&&n<=2200)setYear(n);}} />
        <Button variant="outline" size="icon" className="size-11" onClick={()=>query.refetch()}
          disabled={query.isFetching} aria-label="Làm mới tổng quan Phân Phối"><RefreshCw className="size-4"/></Button>
      </div>
    </div>
    {query.isPending && <p role="status" className="rounded-xl border p-5 text-sm">Đang tải dữ liệu Phân Phối…</p>}
    {query.isError && <p role="alert" className="rounded-xl border p-4 text-sm text-destructive">
      Chưa tải được dữ liệu: {query.error.message}
    </p>}
    {data && <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Tổng quan Phân Phối">
      {metrics.map(m=><article key={m.name} className="min-w-0 space-y-2 rounded-xl border bg-card p-3 sm:p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><m.icon className="size-4 shrink-0"/><span>{m.name}</span></div>
        <p className="text-2xl font-semibold tabular-nums">{m.value ?? '—'}</p>
      </article>)}
    </section>}
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Chức năng Phân Phối</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {functions.map(f=><Link key={f.to} to={f.to} className="flex min-h-24 min-w-0 items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-primary">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><f.icon className="size-5"/></span>
          <span className="min-w-0 flex-1"><strong className="block text-base">{f.title}</strong>
            <span className="block break-words text-sm leading-5 text-muted-foreground">{f.desc}</span></span>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground"/>
        </Link>)}
      </div>
    </section>
    <p className="text-sm text-muted-foreground">Phân hệ giữ nguyên nhân sự, phòng ban, 3K, KR và báo cáo từ hệ thống cũ. Không tạo hồ sơ mới để thay thế.</p>
  </div>;
}
