import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CalendarDays, Plus, MoreHorizontal, Pencil, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { k3Error, type K3Settings } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GoalDetailSheet, GoalStatusBadge } from './Biz3KGoals';
import type { K3EntityMetric } from '@/lib/biz/k3Goals';
import { Biz3KKpiResult } from './Biz3KKpiResult';
import { Biz3KQuickCreate } from './Biz3KQuickCreate';
import { K3DeleteMenuItem } from './Biz3KDelete';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Biz3KDayReview, employeeReviewQuery, manualReviewLabels } from './Biz3KDayReview';
interface DayAction { id: string; goal_id?: string; name: string; goal_name: string; due_date: string | null; due_time?: string | null; metric: K3EntityMetric; kpis: { id: string; name: string }[] }
interface DayData { actions: DayAction[] }
export function Biz3KKpiDay({ settings, date, today, onDateChange }: { settings: K3Settings; date: string; today: string; onDateChange: (date: string) => void }) {
  const uid = useAuth(s => s.currentUserId) ?? '';
  const [reviewOpen, setReviewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [history, setHistory] = useState<DayAction | null>(null);
  const review = useQuery(employeeReviewQuery(uid,date));
  const query = useQuery({ queryKey: ['k3_kpi_day',uid,date], refetchInterval:30000, enabled:!!uid, queryFn:async()=>{ const {data,error}=await supabase.rpc('k3_kpi_day_read',{_date:date}); if(error) throw error; return data as unknown as DayData; } });
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-2"><div><Label htmlFor="k3-kpi-day">Ngày thực hiện</Label><Input id="k3-kpi-day" type="date" value={date} onChange={e=>onDateChange(e.target.value)} className="w-40" /></div><Button variant="outline" size="sm" onClick={()=>onDateChange(today)}><CalendarDays className="mr-1 h-4 w-4" />Hôm nay</Button><div className="flex-1" /><Button size="sm" disabled={!settings.enabled} onClick={()=>setCreating(true)}><Plus className="mr-1 h-4 w-4" />Tạo công việc</Button><Button variant="secondary" size="sm" disabled={date>today || !settings.enabled} onClick={()=>setReviewOpen(true)}><CheckCircle2 className="mr-1 h-4 w-4" />{date===today?'Tổng kết hôm nay':'Xem tổng kết ngày'}</Button></div>
    <div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold">{date===today?'Công việc hôm nay':'Công việc trong ngày'}</h2>{review.data && <Badge variant={review.data.manual_status==='reconfirm'?'destructive':'secondary'}>{manualReviewLabels[review.data.manual_status]}</Badge>}</div>
    {creating && <Biz3KQuickCreate variant="personal" defaultDate={today} onClose={()=>setCreating(false)} />}
    {detail && <GoalDetailSheet id={detail} settings={settings} onClose={()=>setDetail(null)} />}
    {reviewOpen && <Biz3KDayReview date={date} today={today} onClose={()=>setReviewOpen(false)} />}
    {query.isLoading && <p className="text-sm text-muted-foreground">Đang tải công việc…</p>}
    {query.error && <div className="text-sm text-destructive">{k3Error(query.error)} <Button variant="ghost" onClick={()=>query.refetch()}>Thử lại</Button></div>}
    {query.data?.actions.filter(a=>a.metric.status!=='cancelled').map(a=><div key={a.id} className="space-y-2 rounded-lg border border-border bg-card p-3"><div className="flex flex-wrap items-start gap-2"><div className="min-w-0 flex-1"><p className="break-words font-medium">{a.name}</p><p className="mt-1 text-xs text-muted-foreground">Hạn {a.due_date ?? '—'}{a.due_time ? ` · ${a.due_time.slice(0,5)}` : ''}</p></div><GoalStatusBadge status={a.metric.status} metric={a.metric} /><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`Thao tác khác cho ${a.name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{a.goal_id && <DropdownMenuItem onSelect={()=>setDetail(a.goal_id ?? null)}><Pencil className="mr-2 h-4 w-4" />Sửa công việc / Xem chi tiết</DropdownMenuItem>}<DropdownMenuItem onSelect={()=>setHistory(a)}><History className="mr-2 h-4 w-4" />Lịch sử kết quả</DropdownMenuItem><K3DeleteMenuItem kind="action" id={a.id} name={a.name} /></DropdownMenuContent></DropdownMenu></div>
      {a.kpis.length===1 ? a.kpis.map(k=><Biz3KKpiResult key={k.id} kpiId={k.id} date={date} compact hideName showStatus={false} />) : <details><summary className="cursor-pointer py-2 text-sm">{a.kpis.length} chỉ số · Cập nhật kết quả</summary>{a.kpis.map(k=><Biz3KKpiResult key={k.id} kpiId={k.id} date={date} compact showStatus={false} />)}</details>}
      {!a.kpis.length && <p className="text-sm text-muted-foreground">Chưa có chỉ số đo kết quả.</p>}
    </div>)}
    {query.data && !query.data.actions.filter(a=>a.metric.status!=='cancelled').length && <p className="py-4 text-sm text-muted-foreground">Chưa có công việc trong ngày này.</p>}
    {history && <Dialog open onOpenChange={o=>!o&&setHistory(null)}><DialogContent><DialogHeader><DialogTitle>Lịch sử · {history.name}</DialogTitle></DialogHeader>{history.kpis.map(k=><Biz3KKpiResult key={k.id} kpiId={k.id} date={date} historyOnly />)}</DialogContent></Dialog>}
  </div>;
}
