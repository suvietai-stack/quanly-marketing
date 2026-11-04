import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { k3Error } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Biz3KKpiResult } from './Biz3KKpiResult';
interface DayData { result_count: number; confirmed_at: string | null; needs_confirmation: boolean; actions: { id: string; name: string; goal_name: string; due_date: string | null; metric: { status: string; kpi_total: number; kpi_met: number }; kpis: { id: string; name: string }[] }[] }
export function Biz3KKpiDay({ date, today, onDateChange }: { date: string; today: string; onDateChange: (date: string) => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const query = useQuery({ queryKey: ['k3_kpi_day', uid, date], enabled: !!uid, queryFn: async () => { const { data, error } = await supabase.rpc('k3_kpi_day_read', { _date: date }); if (error) throw error; return data as unknown as DayData; } });
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-2"><div><Label htmlFor="k3-kpi-day">Ngày thực hiện</Label><Input id="k3-kpi-day" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="w-40" /></div><Button variant="outline" size="sm" onClick={() => onDateChange(today)}><CalendarDays className="mr-1 h-4 w-4" />Hôm nay</Button>
    <Button size="sm" disabled={saving || date > today || !query.data?.result_count} onClick={async () => { setSaving(true); try { const { error } = await supabase.rpc('k3_kpi_day_confirm', { _date: date }); if (error) throw error; await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') }); toast.success('Đã chốt sổ kết quả KPI ngày.'); } catch (e) { toast.error(k3Error(e)); } finally { setSaving(false); } }}><CheckCircle2 className="mr-1 h-4 w-4" />{query.data?.needs_confirmation ? 'Xác nhận lại kết quả ngày' : 'Tổng kết & Chốt sổ ngày'}</Button></div>
    {query.data?.confirmed_at && <p className="text-xs text-muted-foreground">Chốt gần nhất {new Date(query.data.confirmed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} {query.data.needs_confirmation && <Badge variant="destructive">Cần xác nhận lại</Badge>}</p>}
    {query.isLoading && <p className="text-sm text-muted-foreground">Đang tải KF…</p>}
    {query.error && <div className="text-sm text-destructive">{k3Error(query.error)} <Button variant="ghost" onClick={() => query.refetch()}>Thử lại</Button></div>}
    {query.data?.actions.map((a) => <div key={a.id} className="rounded-lg border border-border p-3"><div className="flex flex-wrap justify-between gap-2"><div className="min-w-0"><p className="break-words font-medium">{a.name}</p><p className="text-xs text-muted-foreground">KG: {a.goal_name} · Hạn {a.due_date ?? '—'} · {a.metric.kpi_met}/{a.metric.kpi_total} KPI đạt</p></div><Badge variant="secondary">{a.metric.status === 'done' ? 'Hoàn thành' : a.metric.status === 'in_progress' ? 'Đang thực hiện' : 'Chưa bắt đầu'}</Badge></div>{a.kpis.map((k) => <Biz3KKpiResult key={k.id} kpiId={k.id} date={date} />)}{!a.kpis.length && <p className="mt-2 text-sm text-muted-foreground">KF chưa có KPI đo lường.</p>}</div>)}
    {query.data && !query.data.actions.length && <p className="py-4 text-sm text-muted-foreground">Chưa có KF được giao trong ngày này.</p>}
  </div>;
}