import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { History, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { k3Error } from '@/lib/biz/k3';
import { k3KpiResultQuery, useK3KpiResultSave, type K3ResultData } from '@/lib/biz/k3KpiResultQueries';
import { K3_MEASURE_LABELS } from '@/lib/biz/k3KpiResults';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { k3MetricDisplay, type K3TypedMetric } from '@/lib/biz/k3Measurement';

const metricText = (data: { actual: number | null; progress: number | null; attained: boolean | null }) =>
  `${data.actual == null ? 'Chưa có số liệu' : data.actual.toLocaleString('vi-VN')}${data.progress == null ? '' : ` · ${data.progress}%`} · ${data.attained == null ? 'Chưa đủ dữ liệu' : data.attained ? 'Đạt' : 'Chưa đạt'}`;

export function Biz3KKpiResult({ kpiId, date, showStatus = true }: { kpiId: string; date: string; showStatus?: boolean }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const query = useQuery({ ...k3KpiResultQuery(uid, kpiId, date), enabled: !!uid });
  const [open, setOpen] = useState<'edit' | 'history' | null>(null);
  const qc = useQueryClient();
  const [acceptanceReason, setAcceptanceReason] = useState('');
  const [acceptanceBusy, setAcceptanceBusy] = useState(false);
  if (query.isLoading) return <p className="text-xs text-muted-foreground">Đang tải kết quả KPI…</p>;
  if (query.error || !query.data) return <div className="text-xs text-destructive">{k3Error(query.error)} <Button size="sm" variant="ghost" onClick={() => query.refetch()}>Thử lại</Button></div>;
  const data = query.data;
  return <div className="space-y-2 border-b border-border py-2">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{data.kpi.name}</p><p className="text-xs text-muted-foreground">{K3_MEASURE_LABELS[data.kpi.measure]} · Chỉ tiêu {data.kpi.target ?? data.kpi.milestones?.length ?? '—'} {data.kpi.unit}</p></div>
      {showStatus && <Badge variant={data.metric.attained ? 'default' : 'secondary'}>{data.metric.status === 'not_started' ? 'Chưa bắt đầu' : data.metric.attained ? 'Hoàn thành' : 'Đang thực hiện'}</Badge>}
    </div>
    <div className="grid gap-1 text-sm tabular-nums sm:grid-cols-2">
      <p>Ngày {date}: {data.daily_metric ? k3MetricDisplay(data.kpi.measure, data.daily_metric, null, data.kpi.unit ?? '') : data.daily ? data.daily.value ?? 'Đã cập nhật' : 'Chưa cập nhật'}</p>
      <p>{data.kpi.measure === 'current' ? 'Giá trị mới nhất' : 'Kết quả chung'}: {k3MetricDisplay(data.kpi.measure, data.metric, data.kpi.target, data.kpi.unit ?? '')}</p>
    </div>
    {data.daily_plan != null && <p className="text-xs">Kế hoạch ngày: {data.daily?.value ?? '—'}/{data.daily_plan} {data.kpi.unit}{data.daily?.value != null && data.daily_plan > 0 ? ` · ${Math.round(data.daily.value / data.daily_plan * 100)}%` : ''}</p>}
    <p className="text-xs text-muted-foreground">Đã chốt: {metricText(data.official_metric)}</p>
    <div className="flex flex-wrap gap-2">
      {data.can_update && <Button size="sm" variant="outline" onClick={() => setOpen('edit')}><Plus className="mr-1 h-3.5 w-3.5" />Cập nhật KPI</Button>}
      <Button size="sm" variant="ghost" onClick={() => setOpen('history')}><History className="mr-1 h-3.5 w-3.5" />Nhật ký kết quả</Button>
    </div>
    {open === 'edit' && <KpiResultDialog key={data.daily?.revision ?? 0} data={data} date={date} onClose={() => setOpen(null)} />}
    {open === 'history' && <Dialog open onOpenChange={(o) => !o && setOpen(null)}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Nhật ký KPI · {data.kpi.name}</DialogTitle></DialogHeader>
      {!data.results.length && <p className="text-sm text-muted-foreground">Chưa có kết quả.</p>}
      {data.can_accept && <Textarea aria-label="Lý do nghiệm thu" value={acceptanceReason} onChange={(e) => setAcceptanceReason(e.target.value)} />}
      {data.results.map((r) => <div key={r.id} className="space-y-2 border-b border-border py-2 text-sm"><p>{r.work_date} · {r.full_name ?? '—'}</p><p>Kết quả ngày: {r.value ?? (r.numerator != null ? `${r.numerator}/${r.denominator}` : (data.kpi.measure === 'milestone' ? r.completed : r.objects)?.join(', '))}</p><Badge variant="outline">{r.is_confirmed ? 'Đã chốt' : 'Chưa chốt / Cần xác nhận lại'}</Badge>{data.can_accept && <div className="flex gap-2">{(['accepted', 'rejected'] as const).map((decision) => <Button key={decision} size="sm" variant="outline" disabled={acceptanceBusy || !acceptanceReason.trim()} onClick={async () => { setAcceptanceBusy(true); try { const { error } = await supabase.rpc('k3_kpi_accept', { _result: r.id, _revision: r.revision, _decision: decision, _reason: acceptanceReason }); if (error) throw error; await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') }); toast.success('Đã lưu quyết định nghiệm thu.'); } catch (e) { toast.error(k3Error(e)); } finally { setAcceptanceBusy(false); } }}>{decision === 'accepted' ? 'Nghiệm thu' : 'Từ chối'}</Button>)}</div>}{data.acceptances?.filter((a) => a.result_id === r.id).map((a) => <p key={a.id} className="text-xs text-muted-foreground">{a.decision === 'accepted' ? 'Đã nghiệm thu' : 'Từ chối'} · Phiên bản {a.result_revision} · {a.reason}</p>)}</div>)}
      {data.history.map((v) => <p key={v.id} className="text-xs text-muted-foreground">Phiên bản {v.revision} · {v.snapshot.work_date} · {new Date(v.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · Kết quả {v.snapshot.value ?? `${v.snapshot.numerator ?? '—'}/${v.snapshot.denominator ?? '—'}`}</p>)}
    </DialogContent></Dialog>}
  </div>;
}

function KpiResultDialog({ data, date, onClose }: { data: K3ResultData; date: string; onClose: () => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const save = useK3KpiResultSave();
  const [key] = useState(() => crypto.randomUUID());
  const [correctionReason, setCorrectionReason] = useState('');
  const [f, setF] = useState({ value: data.daily?.value == null ? '' : String(data.kpi.measure === 'duration' && data.kpi.config?.duration_unit === 'hours' ? data.daily.value / 60 : data.daily.value), numerator: data.daily?.numerator?.toString() ?? '', denominator: data.daily?.denominator?.toString() ?? '', objects: data.daily?.objects?.join('\n') ?? '', completed: data.daily?.completed ?? [], evidence: data.daily?.evidence ?? '', note: data.daily?.note ?? '', problem: data.daily?.problem ?? '', cause: data.daily?.cause ?? '', solution: data.daily?.solution ?? '' });
  const [intervals, setIntervals] = useState(data.daily?.intervals ?? []);
  const measure = data.kpi.measure;
  const daily = { ...f, intervals, id: data.daily?.id ?? '', revision: data.daily?.revision ?? 0, value: f.value === '' ? null : Number(f.value), numerator: f.numerator === '' ? null : Number(f.numerator), denominator: f.denominator === '' ? null : Number(f.denominator), objects: f.objects.split('\n').filter((s) => s.trim()), user_id: uid, work_date: date };
  const previewQuery = useQuery({ queryKey: ['k3_preview', uid, data.kpi.id, date, daily], retry: false, queryFn: async () => { const { data: result, error } = await supabase.rpc('k3_kpi_result_preview', { _kpi: data.kpi.id, _date: date, _payload: daily as never }); if (error) throw error; return result as unknown as K3TypedMetric; } });
  const set = (name: keyof typeof f, value: string) => setF((p) => ({ ...p, [name]: value }));
  return <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle>Cập nhật KPI · {data.kpi.name}</DialogTitle></DialogHeader>
    <p className="text-sm">Ngày {date} · Chỉ tiêu {data.kpi.target ?? data.kpi.milestones?.length} {data.kpi.unit}</p>
    {['cumulative', 'current', 'duration', 'frequency'].includes(measure) && !(measure === 'duration' && data.kpi.config?.duration_method === 'intervals') && <div className="space-y-1"><Label htmlFor="k3-result-value">{measure === 'current' ? 'Giá trị hiện tại' : measure === 'duration' ? `Thời lượng trong ngày (${data.kpi.config?.duration_unit === 'hours' ? 'giờ' : 'phút'})` : measure === 'frequency' ? 'Số lần hợp lệ trong ngày' : 'Tổng số lượng thực hiện trong ngày'}</Label><Input id="k3-result-value" type="number" inputMode="decimal" min={0} value={f.value} onChange={(e) => set('value', e.target.value)} /></div>}
    {['binary', 'streak'].includes(measure) && <div className="space-y-2"><p className="text-sm">{data.kpi.config?.valid_condition}</p><label className="flex items-center gap-2 text-sm"><Checkbox checked={f.value === '1'} onCheckedChange={(v) => set('value', v === true ? '1' : '0')} />Đã đáp ứng điều kiện trong ngày</label></div>}
    {measure === 'duration' && data.kpi.config?.duration_method === 'intervals' && <div className="space-y-2">{intervals.map((item, i) => <div className="grid grid-cols-2 gap-2" key={i}>{(['start', 'end'] as const).map((field) => <Input key={field} aria-label={`${field === 'start' ? 'Bắt đầu' : 'Kết thúc'} khoảng ${i + 1}`} type="datetime-local" value={item[field].slice(0, 16)} onChange={(e) => setIntervals((prev) => prev.map((x, j) => j === i ? { ...x, [field]: `${e.target.value}:00+07:00` } : x))} />)}</div>)}<Button size="sm" variant="outline" onClick={() => setIntervals((prev) => [...prev, { start: `${date}T08:00:00+07:00`, end: `${date}T09:00:00+07:00` }])}><Plus className="mr-1 h-4 w-4" />Thêm khoảng thời gian</Button></div>}
    {(measure === 'ratio' || measure === 'average') && <div className="grid grid-cols-2 gap-2"><div><Label htmlFor="k3-result-num">{measure === 'ratio' ? 'Tử số' : 'Tổng giá trị quan sát'}</Label><Input id="k3-result-num" type="number" inputMode="decimal" min={0} value={f.numerator} onChange={(e) => set('numerator', e.target.value)} /></div><div><Label htmlFor="k3-result-den">{measure === 'ratio' ? 'Mẫu số' : 'Số lượng quan sát'}</Label><Input id="k3-result-den" type="number" inputMode="decimal" min={0} value={f.denominator} onChange={(e) => set('denominator', e.target.value)} /></div></div>}
    {measure === 'distinct' && <div><Label htmlFor="k3-result-objects">Định danh đối tượng (mỗi dòng một mã)</Label><Textarea id="k3-result-objects" rows={4} value={f.objects} onChange={(e) => set('objects', e.target.value)} /></div>}
    {measure === 'milestone' && <div className="space-y-2">{data.kpi.milestones?.map((m) => <label key={m} className="flex items-center gap-2 text-sm"><Checkbox checked={f.completed.includes(m)} onCheckedChange={(v) => setF((p) => ({ ...p, completed: v === true ? [...p.completed, m] : p.completed.filter((x) => x !== m) }))} />{data.kpi.config?.milestones?.find((x) => x.id === m)?.name ?? m}</label>)}</div>}
    <div className="space-y-1"><Label htmlFor="k3-result-evidence">Bằng chứng / nguồn{measure === 'milestone' ? ' *' : ''}</Label><Input id="k3-result-evidence" value={f.evidence} onChange={(e) => set('evidence', e.target.value)} /></div>
    <div className="border-y border-border py-2"><p className="text-sm font-medium">Kết quả mới: {previewQuery.data ? k3MetricDisplay(measure, previewQuery.data, data.kpi.target, data.kpi.unit ?? '') : previewQuery.error ? 'Chưa đủ dữ liệu hợp lệ' : 'Đang tính…'}</p><p className="text-xs text-muted-foreground">{data.daily ? 'Thay thế tổng kết quả ngày đã ghi.' : 'Kết quả ngày chưa chốt.'}</p></div>
    <Label htmlFor="k3-result-note">Ghi chú</Label><Textarea id="k3-result-note" rows={2} value={f.note} onChange={(e) => set('note', e.target.value)} />
    <details><summary className="text-sm">Vấn đề – Nguyên nhân – Giải pháp</summary><div className="mt-2 space-y-2">{(['problem', 'cause', 'solution'] as const).map((name, i) => <Textarea key={name} aria-label={['Vấn đề', 'Nguyên nhân', 'Giải pháp'][i]} rows={2} value={f[name]} onChange={(e) => set(name, e.target.value)} />)}</div></details>
    {data.day_closed && <div className="space-y-1"><Label htmlFor="k3-correction">Lý do bổ sung / sửa sau chốt *</Label><Textarea id="k3-correction" value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} /><p className="text-xs text-muted-foreground">Giữ bản chốt cũ, ghi lịch sử điều chỉnh và yêu cầu xác nhận lại.</p></div>}
    <DialogFooter><Button variant="outline" onClick={onClose}>Hủy</Button><Button disabled={save.isPending || (data.day_closed && !correctionReason.trim())} onClick={async () => { try { await save.mutateAsync({ ...daily, kpi_id: data.kpi.id, revision: data.daily?.revision ?? 0, request_key: key, correction_reason: correctionReason }); toast.success('Đã lưu kết quả KPI.'); onClose(); } catch (e) { toast.error(k3Error(e)); } }}>{save.isPending ? 'Đang lưu…' : 'Lưu kết quả'}</Button></DialogFooter>
  </DialogContent></Dialog>;
}