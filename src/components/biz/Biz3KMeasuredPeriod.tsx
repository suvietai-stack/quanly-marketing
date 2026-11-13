import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { k3Error } from '@/lib/biz/k3';
import { k3PeriodBounds, type K3PeriodType } from '@/lib/biz/k3Periods';
import type { K3Measure } from '@/lib/biz/k3KpiResults';
import { k3MetricDisplay, type K3TypedMetric } from '@/lib/biz/k3Measurement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Biz3KDiscipline } from './Biz3KDiscipline';
import { Biz3KDayReview } from './Biz3KDayReview';

interface Person { user_id: string; name: string; department: string | null; updated: boolean; closes: number; kpis: { id:string;name:string;unit:string|null;measure:K3Measure;target:number|null;goal_name:string;action_name:string|null;metric:K3TypedMetric;official_metric:K3TypedMetric }[] }
export function Biz3KMeasuredPeriod({type,date,onDateChange,manage=false}:{type:'day'|K3PeriodType;date:string;onDateChange:(date:string)=>void;manage?:boolean}) {
  const uid=useAuth((s)=>s.currentUserId)??'';
  const [search,setSearch]=useState('');
  const [department, setDepartment] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [disciplineOpen, setDisciplineOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const bounds=type==='day'?{start:date,end:date}:k3PeriodBounds(type,date);
  const query=useQuery({queryKey:['k3_measured_period',uid,bounds.start,bounds.end,manage],enabled:!!uid,staleTime:45_000,refetchOnWindowFocus:false,retry:1,queryFn:async()=>{const {data,error}=await supabase.rpc('k3_measured_period_read',{_start:bounds.start,_end:bounds.end,_manage:manage});if(error)throw error;return data as unknown as Person[];}});
  const people=query.data??[];
  const filtered = people.filter(p => p.name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')) && (!department || p.department === department));
  const toggleMetrics = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev,id]);
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-3"><div><Label htmlFor="k3-measured-date">Ngày trong kỳ</Label><Input id="k3-measured-date" type="date" value={date} onChange={(e)=>e.target.value&&onDateChange(e.target.value)} className="w-40" /></div><span className="text-sm text-muted-foreground">{bounds.start} – {bounds.end}</span>{manage&&<Input aria-label="Tìm nhân viên" placeholder="Tìm nhân viên…" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full md:w-48" />}</div>
    <details className="rounded-xl border bg-card px-3" onToggle={e => setDisciplineOpen(e.currentTarget.open)}><summary className="cursor-pointer min-h-11 py-3 text-sm font-medium">Kỷ luật & lịch sử tổng kết</summary>{disciplineOpen && <Biz3KDiscipline start={bounds.start} end={bounds.end} manage={manage} />}</details>
    {query.isLoading&&<p className="text-sm text-muted-foreground">Đang tải kết quả…</p>}
    {query.error&&<div><p className="text-sm text-destructive">{k3Error(query.error)}</p><Button variant="outline" onClick={()=>query.refetch()}>Thử lại</Button></div>}
    {manage && <details><summary className="cursor-pointer py-2 text-sm">Bộ lọc đơn vị</summary><div className="flex flex-wrap gap-1"><Button variant={!department ? 'default' : 'outline'} size="sm" onClick={() => setDepartment('')}>Tất cả phòng</Button>{[...new Set(people.map((p) => p.department).filter((d): d is string => !!d))].map((d) => <Button key={d} variant={department === d ? 'default' : 'outline'} size="sm" onClick={() => setDepartment(d)}>{d}</Button>)}</div></details>}
    {filtered.map((p)=><section key={p.user_id} className="space-y-3 rounded-2xl border bg-card p-3 md:p-4">
      {manage&&<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:flex md:justify-between"><div className="min-w-0"><h3 className="break-words font-medium">{p.name}</h3><p className="text-xs text-muted-foreground">{p.department??'Chưa có phòng'} · {p.closes} ngày đã chốt</p></div><Badge variant={p.updated ? 'secondary' : 'outline'}>{p.updated?'Đã cập nhật':'Chưa cập nhật'}</Badge></div>}
      <div className="grid grid-cols-1 gap-2 sm:flex">
        {manage && <Button size="sm" className="min-h-11" variant="outline" onClick={() => setSelected(p.user_id)}>Xem 3K</Button>}
        {manage && <Button size="sm" className="min-h-11" variant={expanded.includes(p.user_id) ? 'secondary' : 'ghost'} aria-expanded={expanded.includes(p.user_id)} onClick={() => toggleMetrics(p.user_id)}>{expanded.includes(p.user_id) ? 'Ẩn KPI' : `Xem ${p.kpis.length} KPI`}</Button>}
      </div>
      {(!manage || expanded.includes(p.user_id)) && <div className="space-y-2">{p.kpis.map((k)=><div key={k.id} className="space-y-1 rounded-xl border-l-2 border-primary/30 bg-muted/40 p-3"><p className="break-words text-sm font-medium">{k.name}</p><p className="text-xs text-muted-foreground">{k.goal_name}{k.action_name&&` · ${k.action_name}`}</p><p className="text-sm tabular-nums">Trong kỳ: {k3MetricDisplay(k.measure,k.metric,k.target,k.unit??'')}</p><p className="text-xs text-muted-foreground">Đã chốt: {k3MetricDisplay(k.measure,k.official_metric,k.target,k.unit??'')}</p></div>)}
      {!p.kpis.length&&<p className="text-sm text-muted-foreground">Chưa có kết quả KPI trong kỳ.</p>}</div>}
    </section>)}
    {!query.isLoading&&!query.error&&!filtered.length&&<p role="status" className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">{people.length ? 'Không có nhân viên khớp bộ lọc.' : 'Chưa có nhân viên phù hợp phạm vi.'}</p>}
    {selected && <Biz3KDayReview date={date} today={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())} user={selected} onClose={() => setSelected(null)} />}
  </div>;
}