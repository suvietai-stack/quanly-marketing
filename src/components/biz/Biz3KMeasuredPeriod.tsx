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
  const bounds=type==='day'?{start:date,end:date}:k3PeriodBounds(type,date);
  const query=useQuery({queryKey:['k3_measured_period',uid,bounds.start,bounds.end,manage],queryFn:async()=>{const {data,error}=await supabase.rpc('k3_measured_period_read',{_start:bounds.start,_end:bounds.end,_manage:manage});if(error)throw error;return data as unknown as Person[];}});
  const people=query.data??[];
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-3"><div><Label htmlFor="k3-measured-date">Ngày trong kỳ</Label><Input id="k3-measured-date" type="date" value={date} onChange={(e)=>e.target.value&&onDateChange(e.target.value)} className="w-40" /></div><span className="text-sm text-muted-foreground">{bounds.start} – {bounds.end}</span>{manage&&<Input aria-label="Tìm nhân viên" placeholder="Tìm nhân viên…" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-48" />}</div>
    <Biz3KDiscipline start={bounds.start} end={bounds.end} manage={manage} />
    {query.isLoading&&<p className="text-sm text-muted-foreground">Đang tải kết quả…</p>}
    {query.error&&<div><p className="text-sm text-destructive">{k3Error(query.error)}</p><Button variant="outline" onClick={()=>query.refetch()}>Thử lại</Button></div>}
    {manage && <div className="flex flex-wrap gap-1"><Button variant={!department ? 'default' : 'outline'} size="sm" onClick={() => setDepartment('')}>Tất cả phòng</Button>{[...new Set(people.map((p) => p.department).filter((d): d is string => !!d))].map((d) => <Button key={d} variant={department === d ? 'default' : 'outline'} size="sm" onClick={() => setDepartment(d)}>{d}</Button>)}</div>}
    {people.filter((p)=>p.name.toLowerCase().includes(search.toLowerCase()) && (!department || p.department === department)).map((p)=><section key={p.user_id} className="space-y-3 border-b border-border pb-4">
      {manage&&<div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-medium">{p.name}</h3><p className="text-xs text-muted-foreground">{p.department??'Chưa có phòng'} · {p.closes} ngày đã chốt</p></div><Badge variant="outline">{p.updated?'Đã cập nhật':'Chưa cập nhật'}</Badge></div>}
      {manage && <Button size="sm" variant="outline" onClick={() => setSelected(p.user_id)}>Xem 3K</Button>}
      {p.kpis.map((k)=><div key={k.id} className="border-l-2 border-border pl-3"><p className="break-words font-medium">{k.name}</p><p className="text-xs text-muted-foreground">{k.goal_name}{k.action_name&&` · ${k.action_name}`}</p><p className="text-sm tabular-nums">Trong kỳ: {k3MetricDisplay(k.measure,k.metric,k.target,k.unit??'')}</p><p className="text-xs text-muted-foreground">Đã chốt: {k3MetricDisplay(k.measure,k.official_metric,k.target,k.unit??'')}</p></div>)}
      {!p.kpis.length&&<p className="text-sm text-muted-foreground">Chưa có kết quả KPI trong kỳ.</p>}
    </section>)}
    {!query.isLoading&&!query.error&&!people.length&&<p className="text-sm text-muted-foreground">Chưa có nhân viên phù hợp phạm vi.</p>}
    {selected && <Biz3KDayReview date={date} today={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())} user={selected} onClose={() => setSelected(null)} />}
  </div>;
}