import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { k3Error } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GoalStatusBadge } from './Biz3KGoals';
import type { K3EntityMetric } from '@/lib/biz/k3Goals';
import { Biz3KKpiResult } from './Biz3KKpiResult';
import { Biz3KDayReview, employeeReviewQuery, manualReviewLabels, systemCloseLabels } from './Biz3KDayReview';
interface DayData { result_count: number; confirmed_at: string | null; needs_confirmation: boolean; closed_at?: string | null; close_source?: string; auto_close_time?: string; actions: { id: string; name: string; goal_name: string; due_date: string | null; metric: K3EntityMetric; kpis: { id: string; name: string }[] }[] }
export function Biz3KKpiDay({ date, today, onDateChange }: { date: string; today: string; onDateChange: (date: string) => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const [reviewOpen, setReviewOpen] = useState(false);
  const review = useQuery(employeeReviewQuery(uid, date));
  const query = useQuery({ queryKey: ['k3_kpi_day', uid, date], refetchInterval: 30000, enabled: !!uid, queryFn: async () => { const { data, error } = await supabase.rpc('k3_kpi_day_read', { _date: date }); if (error) throw error; return data as unknown as DayData; } });
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-2"><div><Label htmlFor="k3-kpi-day">Ngày thực hiện</Label><Input id="k3-kpi-day" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="w-40" /></div><Button variant="outline" size="sm" onClick={() => onDateChange(today)}><CalendarDays className="mr-1 h-4 w-4" />Hôm nay</Button>
    <Button size="sm" disabled={date > today} onClick={() => setReviewOpen(true)}><CheckCircle2 className="mr-1 h-4 w-4" />{date === today ? 'Tổng kết hôm nay' : 'Xem tổng kết ngày'}</Button></div>
    {review.data && <div className="flex flex-wrap gap-2"><Badge variant={review.data.manual_status === 'reconfirm' ? 'destructive' : 'secondary'}>{manualReviewLabels[review.data.manual_status]}</Badge><Badge variant="outline">{systemCloseLabels[review.data.system_status]}</Badge></div>}
    {reviewOpen && <Biz3KDayReview date={date} today={today} onClose={() => setReviewOpen(false)} />}
    {review.data?.confirmed_at && <p className="text-xs text-muted-foreground">Xác nhận Sale gần nhất {new Date(review.data.confirmed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>}
    {review.data?.closed_at ? <p className="text-xs text-muted-foreground">Chốt hệ thống · {new Date(review.data.closed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p> : query.data?.auto_close_time && <p className="text-xs text-muted-foreground">Tự chốt lúc {query.data.auto_close_time.slice(0, 5)} (giờ Việt Nam)</p>}
    {query.isLoading && <p className="text-sm text-muted-foreground">Đang tải KF…</p>}
    {query.error && <div className="text-sm text-destructive">{k3Error(query.error)} <Button variant="ghost" onClick={() => query.refetch()}>Thử lại</Button></div>}
    {query.data?.actions.map((a) => <div key={a.id} className="rounded-lg border border-border p-3"><div className="flex flex-wrap justify-between gap-2"><div className="min-w-0"><p className="break-words font-medium">{a.name}</p><p className="text-xs text-muted-foreground">KG: {a.goal_name} · Hạn {a.due_date ?? '—'} · {a.metric.kpi_met}/{a.metric.kpi_total} KPI đạt</p></div><GoalStatusBadge status={a.metric.status} metric={a.metric} /></div>{a.kpis.map((k) => <Biz3KKpiResult key={k.id} kpiId={k.id} date={date} showStatus={false} />)}{!a.kpis.length && <p className="mt-2 text-sm text-muted-foreground">KF chưa có KPI đo lường.</p>}</div>)}
    {query.data && !query.data.actions.length && <p className="py-4 text-sm text-muted-foreground">Chưa có KF được giao trong ngày này.</p>}
  </div>;
}