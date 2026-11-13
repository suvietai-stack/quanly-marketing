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
import { Biz3KDiscipline } from './Biz3KDiscipline';
import { K3DateControl } from './K3DateControl';
interface DayAction { id: string; goal_id?: string; delete_kind?: 'goal' | 'action'; name: string; goal_name: string; due_date: string | null; due_time?: string | null; metric: K3EntityMetric; kpis: { id: string; name: string }[] }
interface DayData { actions: DayAction[] }
export function Biz3KKpiDay({ settings, date, today, onDateChange }: { settings: K3Settings; date: string; today: string; onDateChange: (date: string) => void }) {
  const uid = useAuth(s => s.currentUserId) ?? '';
  const [reviewOpen, setReviewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [history, setHistory] = useState<DayAction | null>(null);
  const [choosing, setChoosing] = useState<DayAction | null>(null);
  const review = useQuery(employeeReviewQuery(uid,date));
  const query = useQuery({ queryKey: ['k3_kpi_day',uid,date], refetchInterval:30000, enabled:!!uid, queryFn:async()=>{ const {data,error}=await supabase.rpc('k3_kpi_day_read',{_date:date}); if(error) throw error; return data as unknown as DayData; } });
  const actions = query.data?.actions.filter(a => a.metric.status !== 'cancelled') ?? [];
  return <div className="space-y-4 min-w-0">
    <div className="flex flex-col gap-3 md:flex-row md:items-end"><K3DateControl date={date} today={today} onChange={onDateChange} /><div className="hidden md:block flex-1" />
      <div className="k3-day-summary md:hidden space-y-1 rounded-2xl border border-primary/15 bg-primary/5 p-4"><h2 className="text-sm font-semibold">{date === today ? 'Công việc hôm nay' : 'Công việc trong ngày'}</h2>{query.data && <><p className="text-sm">{review.data ? `${review.data.action_count - review.data.missing}/${review.data.action_count} đã cập nhật kết quả` : `${actions.length} công việc`}</p><p className="text-xs text-muted-foreground">{actions.filter(a => a.metric.status === 'done').length} hoàn thành · {actions.filter(a => a.metric.status === 'in_progress').length} đang thực hiện</p></>}{review.data && <p className={review.data.manual_status === 'reconfirm' ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>{manualReviewLabels[review.data.manual_status]}</p>}</div>
      <div className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 md:flex"><Button size="sm" className="max-md:min-h-11" disabled={!settings.enabled} onClick={()=>setCreating(true)}><Plus className="mr-1 h-4 w-4 shrink-0" />Tạo công việc</Button><Button variant="secondary" size="sm" className="max-md:min-h-11" disabled={date>today || !settings.enabled} onClick={()=>setReviewOpen(true)}><CheckCircle2 className="mr-1 h-4 w-4 shrink-0" />{date===today?'Tổng kết hôm nay':'Xem tổng kết ngày'}</Button></div></div>
    <div className="hidden md:flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold">{date===today?'Công việc hôm nay':'Công việc trong ngày'}</h2>{review.data && <Badge variant={review.data.manual_status==='reconfirm'?'destructive':'secondary'}>{manualReviewLabels[review.data.manual_status]}</Badge>}</div>
    {creating && <Biz3KQuickCreate variant="personal" defaultDate={today} onClose={()=>setCreating(false)} />}
    {detail && <GoalDetailSheet id={detail} settings={settings} onClose={()=>setDetail(null)} />}
    {reviewOpen && <Biz3KDayReview date={date} today={today} onClose={()=>setReviewOpen(false)} />}
    {query.isLoading && <p className="text-sm text-muted-foreground">Đang tải công việc…</p>}
    {query.error && <div className="text-sm text-destructive">{k3Error(query.error)} <Button variant="ghost" onClick={()=>query.refetch()}>Thử lại</Button></div>}
    {actions.map(a=><div key={a.id} className="k3-work-card space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 md:flex"><div className="min-w-0 flex-1"><p className="break-words font-medium">{a.name}</p><p className="mt-1 text-xs text-muted-foreground">Hạn {a.due_date ?? '—'}{a.due_time ? ` · ${a.due_time.slice(0,5)}` : ''}</p></div><span className="max-md:col-start-1 max-md:row-start-2"><GoalStatusBadge status={a.metric.status} metric={a.metric} /></span><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="shrink-0 max-md:h-11 max-md:w-11 max-md:col-start-2 max-md:row-start-1" aria-label={`Thao tác khác cho ${a.name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{a.goal_id && <DropdownMenuItem onSelect={()=>setDetail(a.goal_id ?? null)}><Pencil className="mr-2 h-4 w-4" />Sửa công việc / Xem chi tiết</DropdownMenuItem>}<DropdownMenuItem onSelect={()=>setHistory(a)}><History className="mr-2 h-4 w-4" />Lịch sử kết quả</DropdownMenuItem><K3DeleteMenuItem kind={a.delete_kind==='goal' && a.goal_id ? 'goal':'action'} id={a.delete_kind==='goal' && a.goal_id ? a.goal_id:a.id} name={a.name} /></DropdownMenuContent></DropdownMenu></div>
      {a.kpis.length===1 ? a.kpis.map(k=><Biz3KKpiResult key={k.id} kpiId={k.id} date={date} compact hideName showStatus={false} />) : a.kpis.length > 1 ? <><div className="md:hidden"><p className="text-sm">{a.metric.kpi_met}/{a.metric.kpi_total} chỉ số đạt</p><Button variant="outline" className="mt-2 min-h-11 w-full" onClick={() => setChoosing(a)}>Cập nhật kết quả</Button></div><details className="hidden md:block"><summary className="cursor-pointer py-2 text-sm">{a.kpis.length} chỉ số · Cập nhật kết quả</summary>{a.kpis.map(k=><Biz3KKpiResult key={k.id} kpiId={k.id} date={date} compact showStatus={false} />)}</details></> : null}
      {!a.kpis.length && <p className="text-sm text-muted-foreground">Chưa có chỉ số đo kết quả.</p>}
    </div>)}
    {query.data && !query.data.actions.filter(a=>a.metric.status!=='cancelled').length && <p className="py-4 text-sm text-muted-foreground">Chưa có công việc trong ngày này.</p>}
    <details className="border-t border-border pt-3"><summary className="cursor-pointer text-sm">Kỷ luật ngày của tôi</summary><Biz3KDiscipline start={date} end={date} /></details>
    {choosing && <Dialog open onOpenChange={o=>!o&&setChoosing(null)}><DialogContent className="k3-mobile-dialog max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{choosing.name}</DialogTitle></DialogHeader>{choosing.kpis.map(k=><Biz3KKpiResult key={k.id} kpiId={k.id} date={date} compact showStatus={false} />)}</DialogContent></Dialog>}
    {history && <Dialog open onOpenChange={o=>!o&&setHistory(null)}><DialogContent className="k3-mobile-dialog max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Lịch sử · {history.name}</DialogTitle></DialogHeader>{history.kpis.map(k=><Biz3KKpiResult key={k.id} kpiId={k.id} date={date} historyOnly />)}</DialogContent></Dialog>}
  </div>;
}

