import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { k3Error } from '@/lib/biz/k3';
import { type K3MemberSearchRow } from '@/lib/biz/k3Goals';
import { useK3GoalMutation } from '@/lib/biz/k3GoalQueries';
import { MemberPicker } from './Biz3KMemberPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Biz3KKpiConfig } from './Biz3KKpiConfig';
import { newK3KpiDraft, k3KpiPayload } from '@/lib/biz/k3Measurement';
import { newCreationKf, creationKfPayload, inheritKpi, timelineError, type K3CreationKf } from '@/lib/biz/k3Creation';
import { Biz3KTimeline, Biz3KSchedule } from './Biz3KTimeline';

/** Form "Tạo công việc" thống nhất: tạo KG + các KF kèm KPI trong một lần lưu nguyên tử (k3_quick_create). */
export function Biz3KQuickCreate({ variant, defaultDate, onClose, onCreated }: {
  variant: 'personal' | 'team';
  defaultDate: string;
  onClose: () => void;
  onCreated?: (goalId: string) => void;
}) {
  const mutation = useK3GoalMutation();
  const [requestKey] = useState(() => crypto.randomUUID());
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  const [discarding, setDiscarding] = useState(false);
  const [f, setF] = useState({ name: '', period_start: defaultDate, period_end: '', start_time: '', due_time: '', expected_result: '', description: '', is_key: false });
  const [kfs, setKfs] = useState<K3CreationKf[]>([newCreationKf()]);
  const [members, setMembers] = useState<K3MemberSearchRow[]>([]);
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const setKf = (key: string, k: keyof K3CreationKf, v: string | boolean) => setKfs((p) => p.map((x) => (x.key === key ? { ...x, [k]: v } : x)));

  const validKfs = kfs;
  const timeError = timelineError(f.period_start, f.period_end, f.start_time, f.due_time);
  const close = () => { if (f.name || f.expected_result || f.description || kfs.some((k) => k.name)) setDiscarding(true); else onClose(); };
  const basicCompatible = kfs.length === 1 && kfs[0]?.kpis.length === 1 && kfs[0]?.inherit_timeline && kfs[0]?.execution_schedule.mode === 'daily' && (!kfs[0]?.name || kfs[0]?.name === f.name);
  const canDraft = !!f.name.trim() && !!f.period_start && !!f.period_end;
  const canStart = canDraft && !timeError && validKfs.length > 0 && validKfs.every((kf) => kf.kpis.length > 0);
  const first = kfs[0];

  const submit = async (startNow: boolean) => {
    try {
      if (timeError) throw new Error(timeError);
      const res = await mutation.mutateAsync({
        kind: 'quick_create',
        payload: {
          request_key: requestKey, creation_mode: mode, start_time: f.start_time, due_time: f.due_time,
          ...(mode === 'basic' && first ? { kpi: k3KpiPayload(inheritKpi(first.kpis[0] ?? newK3KpiDraft(), f.name, f.expected_result, f.period_start, f.period_end)) } : {}),
          name: f.name, period_start: f.period_start, period_end: f.period_end,
          due_date: f.period_end, expected_result: f.expected_result, description: f.description,
          is_key: f.is_key, save_valid: startNow,
          member_ids: variant === 'team' ? members.map((m) => m.id) : [],
          kfs: validKfs.map((k) => creationKfPayload(k, f.name, f.expected_result, f.period_start, f.period_end)),
        },
      }) as { goal_id: string; duplicated?: boolean };
      toast.success(res?.duplicated
        ? 'Công việc đã được tạo trước đó (không tạo trùng).'
        : startNow ? 'Đã lưu công việc.' : 'Đã lưu nháp công việc.');
      onCreated?.(res?.goal_id);
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{variant === 'team' ? 'Tạo công việc nhóm' : 'Tạo công việc'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-1 border-b border-border pb-2" role="group" aria-label="Chế độ tạo công việc"><Button type="button" aria-pressed={mode === 'basic'} variant={mode === 'basic' ? 'default' : 'ghost'} disabled={!basicCompatible} onClick={() => setMode('basic')}>Cơ bản</Button><Button type="button" aria-pressed={mode === 'advanced'} variant={mode === 'advanced' ? 'default' : 'ghost'} onClick={() => setMode('advanced')}>Nâng cao</Button></div>
          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            {mode === 'advanced' && <p className="text-xs font-medium text-muted-foreground">Thông tin công việc (KG)</p>}
            <div className="space-y-1">
              <Label htmlFor="k3q-name">Tên công việc / mục tiêu *</Label>
              <Input id="k3q-name" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ví dụ: Lập danh sách 100 đại lý tiềm năng khu vực miền Nam" />
            </div>
            <Biz3KTimeline id="k3q" start={f.period_start} end={f.period_end} startTime={f.start_time} endTime={f.due_time} onChange={(field, value) => set(({ start: 'period_start', end: 'period_end', startTime: 'start_time', endTime: 'due_time' })[field], value)} />
            {canDraft && timeError && <p role="alert" className="text-sm text-destructive">{timeError}</p>}
            <div className="space-y-1"><Label htmlFor="k3q-result">Kết quả cần đạt *</Label><Textarea id="k3q-result" rows={2} value={f.expected_result} onChange={(e) => set('expected_result', e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="k3q-desc">Mô tả ngắn</Label><Textarea id="k3q-desc" rows={2} value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.is_key} onChange={(e) => set('is_key', e.target.checked)} className="h-4 w-4" />
              Đánh dấu công việc trọng tâm
            </label>
          </div>

          {mode === 'basic' && first && <Biz3KKpiConfig compact value={first.kpis[0] ?? newK3KpiDraft()} suggestedName={f.name} expectedResult={f.expected_result} onChange={(next) => setKfs((prev) => prev.map((k, i) => i === 0 ? { ...k, kpis: [next] } : k))} />}
          {mode === 'advanced' && <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Các bước thực hiện (KF)</p>
              <Button type="button" size="sm" variant="outline" onClick={() => setKfs((p) => [...p, newCreationKf()])}><Plus className="mr-1 h-3.5 w-3.5" />Thêm KF</Button>
            </div>
            {kfs.map((k, i) => (
              <div key={k.key} className="space-y-2 rounded-md border border-border p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">KF {i + 1}</span>
                  <Input className="flex-1" placeholder="Tên bước thực hiện *" value={k.name} onChange={(e) => setKf(k.key, 'name', e.target.value)} />
                  {kfs.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" aria-label={`Xóa KF ${i + 1}`} onClick={() => setKfs((p) => p.filter((x) => x.key !== k.key))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={k.inherit_timeline} onChange={(e) => setKf(k.key, 'inherit_timeline', e.target.checked)} />Kế thừa thời gian KG</label>
                {!k.inherit_timeline && <Biz3KTimeline id={k.key} start={k.start_date || f.period_start} end={k.due_date || f.period_end} startTime={k.start_time} endTime={k.due_time} onChange={(field, value) => setKf(k.key, ({ start: 'start_date', end: 'due_date', startTime: 'start_time', endTime: 'due_time' } as const)[field], value)} />}
                <details><summary className="cursor-pointer text-sm">Lộ trình thực hiện</summary><div className="mt-2"><Biz3KSchedule value={k.execution_schedule} onChange={(value) => setKfs((prev) => prev.map((v) => v.key === k.key ? { ...v, execution_schedule: value } : v))} /></div></details>
                {k.kpis.map((kpi, j) => <div key={kpi.request_key} className="space-y-2 border-t border-border py-3">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium">KPI {j + 1}</p><Button type="button" size="icon" variant="ghost" aria-label={`Xóa KPI ${j + 1}`} onClick={() => setKfs((prev) => prev.map((x) => x.key === k.key ? { ...x, kpis: x.kpis.filter((v) => v.request_key !== kpi.request_key) } : x))}><Trash2 className="h-4 w-4" /></Button></div>
                  <Biz3KKpiConfig suggestedName={k.name || f.name} expectedResult={f.expected_result} value={kpi} onChange={(next) => setKfs((prev) => prev.map((x) => x.key === k.key ? { ...x, kpis: x.kpis.map((v) => v.request_key === next.request_key ? next : v) } : x))} />
                </div>)}
                <Button type="button" variant="outline" size="sm" onClick={() => setKfs((prev) => prev.map((x) => x.key === k.key ? { ...x, kpis: [...x.kpis, newK3KpiDraft()] } : x))}><Plus className="mr-1 h-4 w-4" />Thêm KPI</Button>
              </div>
            ))}
          </div>}

          {variant === 'team' && (
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">Thành viên tham gia</p>
              <MemberPicker selected={members} onChange={setMembers} />
              <p className="text-xs text-muted-foreground">Thành viên được mời cần chấp nhận trước khi được phân công KF.</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={close}>Hủy soạn</Button>
          <Button type="button" variant="secondary" disabled={mutation.isPending || !canDraft} onClick={() => submit(false)}>
            {mutation.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Lưu nháp
          </Button>
          <Button type="button" disabled={mutation.isPending || !canStart} onClick={() => submit(true)}>
            {mutation.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Lưu công việc
          </Button>
        </DialogFooter>
        {discarding && <Dialog open onOpenChange={setDiscarding}><DialogContent><DialogHeader><DialogTitle>Bỏ thay đổi chưa lưu?</DialogTitle></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDiscarding(false)}>Tiếp tục soạn</Button><Button variant="destructive" onClick={onClose}>Bỏ thay đổi</Button></DialogFooter></DialogContent></Dialog>}
      </DialogContent>
    </Dialog>
  );
}
