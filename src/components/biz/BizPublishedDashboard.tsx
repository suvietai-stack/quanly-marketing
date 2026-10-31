import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useCurrentUser } from '@/lib/auth';
import { vnYear, type DashboardMetric } from '@/lib/biz/dashboard';
import { numberText } from '@/lib/biz/documents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { BizDashboard } from './BizDashboard';
type Published = { groups: { id: string; name: string; metrics: DashboardMetric[] }[]; server_now: string };
export function BizDashboardViews() {
  const { can } = useCurrentUser();
  const [view, setView] = useState('published');
  const detail = can('biz.view_own') || can('biz.view_dept') || can('biz.view_all');
  return <div className="space-y-5">{detail && <Tabs value={view} onValueChange={setView}><TabsList><TabsTrigger value="published">Tổng hợp toàn Khối</TabsTrigger><TabsTrigger value="detail">Chi tiết trong phạm vi</TabsTrigger></TabsList></Tabs>}{view === 'detail' && detail ? <BizDashboard /> : <BizPublishedDashboard />}</div>;
}
function BizPublishedDashboard() {
  const uid = useAuth(s => s.currentUserId) ?? '';
  const [year, setYear] = useState(vnYear());
  const [kind, setKind] = useState('year');
  const [period, setPeriod] = useState(1);
  const [group, setGroup] = useState('all');
  const query = useQuery({ queryKey: ['biz_dashboard_published', uid, year, kind, period], queryFn: async () => { const { data, error } = await supabase.rpc('biz_dashboard_published', { _year: year, _period_kind: kind, _period: period }); if (error) throw error; return data as unknown as Published; }, staleTime: 15000 });
  const selected = query.data?.groups.find(g => g.id === group) ?? query.data?.groups[0];
  return <div className="space-y-5 pb-32 min-w-0"><header className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">Tổng quan kinh doanh</h1><Button variant="outline" size="icon" aria-label="Làm mới Dashboard tổng hợp" onClick={() => query.refetch()}><RefreshCw className="h-4 w-4" /></Button></header>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-y py-4"><Select value={kind} onValueChange={v => { setKind(v); setPeriod(1); }}><SelectTrigger aria-label="Loại kỳ tổng hợp"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="year">Năm</SelectItem><SelectItem value="quarter">Quý</SelectItem><SelectItem value="month">Tháng</SelectItem></SelectContent></Select><Input type="number" aria-label="Năm tổng hợp" min={2000} max={2200} value={year} onChange={e => { const v = Number(e.target.value); if (v >= 2000 && v <= 2200) setYear(v); }} /><Select value={String(period)} onValueChange={v => setPeriod(Number(v))}><SelectTrigger aria-label="Kỳ tổng hợp"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: kind === 'month' ? 12 : kind === 'quarter' ? 4 : 1 }, (_, i) => <SelectItem key={i} value={String(i + 1)}>{kind === 'year' ? 'Cả năm' : `${kind === 'quarter' ? 'Quý' : 'Tháng'} ${i + 1}`}</SelectItem>)}</SelectContent></Select></div>
    <Tabs value={selected?.id ?? group} onValueChange={setGroup}><TabsList className="flex flex-wrap h-auto justify-start">{query.data?.groups.map(g => <TabsTrigger key={g.id} value={g.id} className="whitespace-normal">{g.name}</TabsTrigger>)}</TabsList></Tabs>
    {query.error && <p role="alert" className="text-destructive">{query.error.message}</p>}{query.isPending && <p className="text-muted-foreground">Đang tổng hợp dữ liệu…</p>}
    {selected && <section className="space-y-4"><h2 className="text-lg font-semibold">{selected.name} · Số liệu chính thức</h2><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{selected.metrics.map(m => <article key={m.metric_key} className="border rounded-lg p-4 space-y-3 min-w-0"><h3 className="font-medium">{m.definition.name}</h3><p className="text-2xl font-semibold break-all tabular-nums">{numberText(m.actual)} <span className="text-sm text-muted-foreground">{m.definition.unit}</span></p><dl className="text-sm space-y-2"><div className="flex justify-between gap-3"><dt>Mục tiêu</dt><dd className="break-all text-right">{numberText(m.target)}</dd></div><div className="flex justify-between gap-3"><dt>Hoàn thành</dt><dd>{numberText(m.percent)}{m.percent !== null ? '%' : ''}</dd></div></dl><p className={`text-xs ${m.complete ? 'text-muted-foreground' : 'text-warning'}`}>{m.complete ? 'Đủ dữ liệu' : 'Chưa đủ dữ liệu'}</p></article>)}</div>{!selected.metrics.length && <p className="text-muted-foreground border-y py-8">Chưa có dữ liệu KR.</p>}</section>}
  </div>;
}