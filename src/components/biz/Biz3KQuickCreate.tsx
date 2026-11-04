import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { k3Error } from '@/lib/biz/k3';
import { K3_KPI_KIND, type K3KpiKind, type K3MemberSearchRow } from '@/lib/biz/k3Goals';
import { useK3GoalMutation } from '@/lib/biz/k3GoalQueries';
import { MemberPicker } from './Biz3KMemberPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KfDraft {
  key: string;
  name: string;
  kpiName: string;
  kpiTarget: string;
  kpiUnit: string;
  kpiKind: K3KpiKind;
  start_date: string;
  due_date: string;
}

const newKf = (): KfDraft => ({ key: crypto.randomUUID(), name: '', kpiName: '', kpiTarget: '', kpiUnit: '', kpiKind: 'cumulative', start_date: '', due_date: '' });

/** Form "Tạo công việc" thống nhất: tạo KG + các KF kèm KPI trong một lần lưu nguyên tử (k3_quick_create). */
export function Biz3KQuickCreate({ variant, defaultDate, onClose, onCreated }: {
  variant: 'personal' | 'team';
  defaultDate: string;
  onClose: () => void;
  onCreated?: (goalId: string) => void;
}) {
  const mutation = useK3GoalMutation();
  const [requestKey] = useState(() => crypto.randomUUID());
  const [f, setF] = useState({ name: '', period_start: defaultDate, period_end: '', expected_result: '', description: '', is_key: false });
  const [kfs, setKfs] = useState<KfDraft[]>([newKf()]);
  const [members, setMembers] = useState<K3MemberSearchRow[]>([]);
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const setKf = (key: string, k: keyof KfDraft, v: string) => setKfs((p) => p.map((x) => (x.key === key ? { ...x, [k]: v } : x)));

  const validKfs = kfs.filter((k) => k.name.trim());
  const canDraft = !!f.name.trim() && !!f.period_start && !!f.period_end;
  const canStart = canDraft && validKfs.length > 0;

  const submit = async (startNow: boolean) => {
    try {
      const res = await mutation.mutateAsync({
        kind: 'quick_create',
        payload: {
          request_key: requestKey,
          name: f.name, period_start: f.period_start, period_end: f.period_end,
          due_date: f.period_end, expected_result: f.expected_result, description: f.description,
          is_key: f.is_key, start_now: startNow,
          member_ids: variant === 'team' ? members.map((m) => m.id) : [],
          kfs: validKfs.map((k) => ({
            request_key: k.key, name: k.name, start_date: k.start_date, due_date: k.due_date,
            kpis: k.kpiName.trim()
              ? [{ name: k.kpiName, kind: k.kpiKind, target: k.kpiTarget, unit: k.kpiUnit }]
              : [],
          })),
        },
      }) as { goal_id: string; duplicated?: boolean };
      toast.success(res?.duplicated
        ? 'Công việc đã được tạo trước đó (không tạo trùng).'
        : startNow ? 'Đã tạo công việc và bắt đầu thực hiện.' : 'Đã lưu nháp công việc. Thêm KF rồi bắt đầu khi sẵn sàng.');
      onCreated?.(res?.goal_id);
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{variant === 'team' ? 'Tạo công việc nhóm' : 'Tạo công việc'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Thông tin công việc (KG)</p>
            <div className="space-y-1">
              <Label htmlFor="k3q-name">Tên công việc / mục tiêu *</Label>
              <Input id="k3q-name" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ví dụ: Lập danh sách 100 đại lý tiềm năng khu vực miền Nam" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label htmlFor="k3q-start">Ngày bắt đầu *</Label><Input id="k3q-start" type="date" value={f.period_start} onChange={(e) => set('period_start', e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="k3q-end">Hạn hoàn thành *</Label><Input id="k3q-end" type="date" value={f.period_end} onChange={(e) => set('period_end', e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label htmlFor="k3q-result">Kết quả cần đạt</Label><Textarea id="k3q-result" rows={2} value={f.expected_result} onChange={(e) => set('expected_result', e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="k3q-desc">Mô tả ngắn</Label><Textarea id="k3q-desc" rows={2} value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.is_key} onChange={(e) => set('is_key', e.target.checked)} className="h-4 w-4" />
              Đánh dấu công việc trọng tâm
            </label>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Các bước thực hiện (KF)</p>
              <Button type="button" size="sm" variant="outline" onClick={() => setKfs((p) => [...p, newKf()])}><Plus className="mr-1 h-3.5 w-3.5" />Thêm KF</Button>
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Ngày bắt đầu</Label><Input type="date" value={k.start_date} onChange={(e) => setKf(k.key, 'start_date', e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Hạn KF</Label><Input type="date" value={k.due_date} onChange={(e) => setKf(k.key, 'due_date', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Tên chỉ tiêu KPI</Label><Input placeholder="Ví dụ: 100 đại lý hợp lệ" value={k.kpiName} onChange={(e) => setKf(k.key, 'kpiName', e.target.value)} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cách đo</Label>
                    <Select value={k.kpiKind} onValueChange={(v) => setKf(k.key, 'kpiKind', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                      {(Object.keys(K3_KPI_KIND) as K3KpiKind[]).map((kind) => <SelectItem key={kind} value={kind}>{K3_KPI_KIND[kind]}</SelectItem>)}
                    </SelectContent></Select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Chỉ tiêu (số)</Label><Input type="number" min={0} value={k.kpiTarget} onChange={(e) => setKf(k.key, 'kpiTarget', e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Đơn vị đo</Label><Input placeholder="đại lý, cuộc gọi…" value={k.kpiUnit} onChange={(e) => setKf(k.key, 'kpiUnit', e.target.value)} /></div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Có thể lưu nháp chưa có KF; khi bắt đầu thực hiện chính thức cần ít nhất một KF.</p>
          </div>

          {variant === 'team' && (
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">Thành viên tham gia</p>
              <MemberPicker selected={members} onChange={setMembers} />
              <p className="text-xs text-muted-foreground">Thành viên được mời cần chấp nhận trước khi được phân công KF.</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="button" variant="secondary" disabled={mutation.isPending || !canDraft} onClick={() => submit(false)}>
            {mutation.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Lưu nháp
          </Button>
          <Button type="button" disabled={mutation.isPending || !canStart} onClick={() => submit(true)}>
            {mutation.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}Lưu và bắt đầu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
