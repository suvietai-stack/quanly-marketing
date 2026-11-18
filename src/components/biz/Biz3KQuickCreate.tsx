import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { k3Error } from '@/lib/biz/k3';
import { useAuth } from '@/lib/auth';
import { checkK3QuickCreate, isK3AmbiguousWrite } from '@/lib/biz/k3SaveRecovery';
import { type K3MemberSearchRow } from '@/lib/biz/k3Goals';
import { useK3GoalMutation } from '@/lib/biz/k3GoalQueries';
import { MemberPicker } from './Biz3KMemberPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Biz3KKpiConfig } from './Biz3KKpiConfig';
import { newK3KpiDraft, k3KpiPayload } from '@/lib/biz/k3Measurement';
import { K3_MEASURE_LABELS, type K3Measure } from '@/lib/biz/k3KpiResults';
import { canUseBasicCreation, newCreationKf, creationKfPayload, inheritKpi, creationError, type K3CreationKf, type K3CreationMode } from '@/lib/biz/k3Creation';
import { Biz3KTimeline, Biz3KSchedule } from './Biz3KTimeline';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Biz3KQuickCreate({ variant, defaultDate, onClose, onCreated }: {
  variant: 'personal' | 'team'; defaultDate: string; onClose: () => void; onCreated?: (goalId: string) => void;
}) {
  const mutation = useK3GoalMutation();
  const uid = useAuth(s => s.currentUserId) ?? '';
  const [requestKey] = useState(() => crypto.randomUUID());
  const [discarding, setDiscarding] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<K3CreationMode>('basic');
  const submitting = useRef(false);
  const attemptedPayload = useRef<Record<string,unknown> | null>(null);
  const [f, setF] = useState({ name: '', period_start: defaultDate, period_end: '', start_time: '', due_time: '', expected_result: '', description: '', is_key: false });
  const [kfs, setKfs] = useState<K3CreationKf[]>([newCreationKf()]);
  const [members, setMembers] = useState<K3MemberSearchRow[]>([]);
  const set = (k: string, v: string | boolean) => setF(p => ({ ...p, [k]: v }));
  const setKf = (key: string, k: keyof K3CreationKf, v: string | boolean) => setKfs(p => p.map(x => x.key === key ? { ...x, [k]: v } : x));
  const first = kfs[0];
  const kpi = first?.kpis[0] ?? newK3KpiDraft();
  const simple = mode === 'basic';
  const switchMode = (next: string) => {
    if (next === 'basic' && !canUseBasicCreation(kfs,f.name,members.length)) {
      setError('Giữ chế độ Nâng cao để không mất các bước, chỉ số hoặc lịch đã nhập.'); return;
    }
    setMode(next === 'advanced' ? 'advanced' : 'basic'); setError('');
  };
  const choose = (measure: K3Measure) => setKfs(prev => prev.map((k,i) => i === 0 ? { ...k, kpis: k.kpis.map((p,j) => j === 0 ? { ...p, measure, condition: 'gte', config: { ...p.config, ...(measure === 'frequency' || measure === 'streak' ? { cycle: measure === 'streak' ? 'day' as const : 'week' as const } : {}), ...(measure === 'duration' ? { duration_unit: 'minutes' as const, duration_method: 'total' as const } : {}) } } : p) } : k));
  const changeFirst = (field: 'target' | 'unit', value: string) => setKfs(prev => prev.map((k,i) => i === 0 ? { ...k, kpis: k.kpis.map((p,j) => j === 0 ? { ...p, [field]: value } : p) } : k));
  const close = () => { if (submitting.current) return; if (retrying || f.name || f.expected_result || f.description || kfs.some(k => k.name)) setDiscarding(true); else onClose(); };
  const submit = async (valid: boolean) => {
    if (submitting.current) return;
    setAttempted(true);
    const validation = creationError(f.name, f.period_start, f.period_end, kfs, f.expected_result, f.start_time, f.due_time);
    if (validation) { setError(validation); return; }
    setError('');
    submitting.current = true;
    try {
      const payload = attemptedPayload.current ?? {
        request_key: requestKey, creation_mode: mode,
        ...(simple ? { kpi: k3KpiPayload(inheritKpi(kpi, f.name, f.expected_result, f.period_start, f.period_end)) } : {}),
        ...f, due_date: f.period_end, expected_result: f.expected_result.trim() || f.name,
        save_valid: valid, member_ids: members.map(m => m.id),
        kfs: kfs.map(k => creationKfPayload(k, f.name, f.expected_result, f.period_start, f.period_end)),
      };
      attemptedPayload.current = payload;
      const res = await mutation.mutateAsync({ kind: 'quick_create', payload }) as { goal_id: string; duplicated?: boolean };
      toast.success(res.duplicated ? 'Công việc đã được lưu trước đó.' : valid ? 'Đã lưu công việc.' : 'Đã lưu nháp công việc.');
      onCreated?.(res.goal_id); onClose();
    } catch (e) {
      if (isK3AmbiguousWrite(e)) {
        setChecking(true);
        const check = await checkK3QuickCreate(uid, requestKey);
        setChecking(false);
        if (check.status === 'saved') {
          toast.success('Công việc đã được lưu.'); onCreated?.(check.id); onClose(); return;
        }
        // Preserve the original payload and key: an in-flight request may still commit.
        setRetrying(true);
        setError(check.status === 'missing'
          ? 'Chưa thấy công việc được lưu. Có thể thử lưu lại an toàn bằng cùng yêu cầu, không tạo trùng.'
          : 'Chưa kiểm tra được trạng thái lưu. Hãy thử lưu lại an toàn; hệ thống sẽ giữ nguyên mã yêu cầu để tránh tạo trùng.');
      } else {
        attemptedPayload.current = null; setRetrying(false); setError(k3Error(e));
      }
    } finally { submitting.current = false; }
  };
  return <Dialog open onOpenChange={o => !o && close()}><DialogContent className="k3-mobile-dialog k3-quick-create flex max-h-[90dvh] max-w-2xl flex-col overflow-hidden">
    <DialogHeader><DialogTitle>Tạo công việc</DialogTitle></DialogHeader>
    <Tabs value={mode} onValueChange={switchMode}><TabsList className="grid w-full grid-cols-2"><TabsTrigger disabled={mutation.isPending || checking || retrying} value="basic">Cơ bản</TabsTrigger><TabsTrigger disabled={mutation.isPending || checking || retrying} value="advanced">Nâng cao</TabsTrigger></TabsList></Tabs>
    <div className="min-h-0 space-y-4 overflow-y-auto px-1 pb-2">
      <fieldset disabled={mutation.isPending || checking || retrying} className="min-w-0 space-y-4">
      <div className="space-y-1"><Label htmlFor="k3q-name">Tên công việc *</Label><Input id="k3q-name" value={f.name} onChange={e => set('name', e.target.value)} aria-invalid={attempted && !f.name.trim()} placeholder="Soạn báo giá khách sạn Vinh Nghệ An" /></div>
      <div className="space-y-1"><Label htmlFor="k3q-end">Hạn hoàn thành *</Label><Input id="k3q-end" type="date" value={f.period_end} onChange={e => set('period_end', e.target.value)} aria-invalid={attempted && !f.period_end} />{attempted && !f.period_end && <p role="alert" className="text-sm text-destructive">Chưa chọn hạn hoàn thành.</p>}</div>
      {simple && <div className="space-y-2"><Label htmlFor="k3q-measure">Đo kết quả bằng cách nào? *</Label><Select value={['binary','cumulative'].includes(kpi.measure) ? kpi.measure : 'other'} onValueChange={v => { if(v==='other') setMode('advanced'); else choose(v as K3Measure); }}><SelectTrigger id="k3q-measure"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="binary">Có / Chưa</SelectItem><SelectItem value="cumulative">Số lượng</SelectItem><SelectItem value="other">Cách đo khác</SelectItem></SelectContent></Select>
        {kpi.measure === 'cumulative' && <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><div className="space-y-1"><Label htmlFor="k3q-target">Số lượng mục tiêu *</Label><Input id="k3q-target" type="number" inputMode="decimal" min={0} step="any" value={kpi.target} onChange={e => changeFirst('target',e.target.value)} /></div><div className="space-y-1"><Label htmlFor="k3q-unit">Đơn vị đo *</Label><Input id="k3q-unit" value={kpi.unit} onChange={e => changeFirst('unit',e.target.value)} /></div></div>}
        {!['binary','cumulative'].includes(kpi.measure) && <><Select value={kpi.measure} onValueChange={v => choose(v as K3Measure)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(K3_MEASURE_LABELS).filter(([v]) => !['binary','cumulative'].includes(v)).map(([v,label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent></Select><Biz3KKpiConfig compact fieldsOnly value={kpi} expectedResult={f.expected_result || f.name} suggestedName={f.name} onChange={next => setKfs(prev => prev.map((k,i) => i===0 ? {...k,kpis:k.kpis.map((p,j)=>j===0?next:p)} : k))} /></>}
      </div>}
      {!simple && <div className="space-y-4 border-t border-border pt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="space-y-1"><Label htmlFor="k3q-start">Ngày bắt đầu</Label><Input id="k3q-start" type="date" value={f.period_start} onChange={e => set('period_start',e.target.value)} /></div><div className="space-y-1"><Label htmlFor="k3q-start-time">Giờ bắt đầu (tùy chọn)</Label><Input id="k3q-start-time" type="time" value={f.start_time} onChange={e => set('start_time',e.target.value)} /></div><div className="space-y-1"><Label htmlFor="k3q-due-time">Giờ hoàn thành (tùy chọn)</Label><Input id="k3q-due-time" type="time" value={f.due_time} onChange={e => set('due_time',e.target.value)} /></div></div>
        <div className="space-y-1"><Label htmlFor="k3q-result">Tiêu chí hoàn thành riêng (tùy chọn)</Label><Textarea id="k3q-result" value={f.expected_result} onChange={e => set('expected_result',e.target.value)} rows={2} /></div>
        <div className="space-y-1"><Label htmlFor="k3q-desc">Mô tả chi tiết</Label><Textarea id="k3q-desc" value={f.description} onChange={e => set('description',e.target.value)} rows={2} /></div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={f.is_key} onCheckedChange={v => set('is_key',v===true)} />Công việc trọng tâm</label>
        {kfs.map((k,i) => <div key={k.key} className="space-y-3 border-t border-border pt-3">
          {kfs.length > 1 && <div className="flex items-center gap-2"><Input aria-label={`Tên bước ${i+1}`} placeholder={`Tên bước ${i+1}`} value={k.name} onChange={e => setKf(k.key,'name',e.target.value)} /><Button variant="ghost" size="icon" aria-label={`Xóa bước ${i+1}`} onClick={() => setKfs(prev => prev.filter(x => x.key!==k.key))}><Trash2 className="h-4 w-4" /></Button></div>}
          <div className="mt-3 space-y-3"><Label>Lộ trình và thời gian{ kfs.length > 1 ? ` bước ${i+1}` : ''}</Label><label className="flex items-center gap-2 text-sm"><Checkbox checked={k.inherit_timeline} onCheckedChange={v=>setKf(k.key,'inherit_timeline',v===true)} />Dùng thời gian công việc</label>{!k.inherit_timeline && <Biz3KTimeline id={k.key} start={k.start_date||f.period_start} end={k.due_date||f.period_end} startTime={k.start_time} endTime={k.due_time} onChange={(field,value)=>setKf(k.key,({start:'start_date',end:'due_date',startTime:'start_time',endTime:'due_time'} as const)[field],value)} />}<Biz3KSchedule value={k.execution_schedule} onChange={value => setKfs(prev=>prev.map(x=>x.key===k.key?{...x,execution_schedule:value}:x))} /></div>
          {k.kpis.map((p,j)=><div key={p.request_key} className="space-y-2 border-t border-border pt-3"><div className="flex items-center justify-between"><Label>Chỉ số {j+1}</Label>{k.kpis.length > 1 && <Button variant="ghost" size="icon" aria-label={`Xóa chỉ số ${j+1} bước ${i+1}`} onClick={()=>setKfs(prev=>prev.map(x=>x.key===k.key?{...x,kpis:x.kpis.filter(v=>v.request_key!==p.request_key)}:x))}><Trash2 className="h-4 w-4" /></Button>}</div><Biz3KKpiConfig expanded compact value={p} suggestedName={k.name||f.name} expectedResult={f.expected_result||k.name||f.name} onChange={next=>setKfs(prev=>prev.map(x=>x.key===k.key?{...x,kpis:x.kpis.map(v=>v.request_key===next.request_key?next:v)}:x))} /></div>)}
          <Button variant="outline" size="sm" onClick={()=>setKfs(prev=>prev.map(x=>x.key===k.key?{...x,kpis:[...x.kpis,newK3KpiDraft()]}:x))}><Plus className="mr-1 h-4 w-4" />Thêm chỉ số</Button>
        </div>)}
        <Button variant="outline" size="sm" onClick={()=>setKfs(prev=>[...prev,newCreationKf()])}><Plus className="mr-1 h-4 w-4" />Thêm bước thực hiện</Button>
        <div className="space-y-2"><Label>Chọn người phối hợp</Label><MemberPicker selected={members} onChange={setMembers} /></div>
        <Button variant="secondary" disabled={mutation.isPending} onClick={()=>submit(false)}>Lưu nháp</Button>
      </div>}
      </fieldset>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
    <DialogFooter className="shrink-0 border-t border-border pt-3"><Button variant="outline" onClick={close}>Bỏ thay đổi</Button><Button disabled={mutation.isPending || checking} onClick={()=>submit(true)}>{mutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{checking ? "Đang xác minh…" : retrying ? "Thử lưu lại an toàn" : "Lưu công việc"}</Button></DialogFooter>
    {discarding && <Dialog open onOpenChange={setDiscarding}><DialogContent><DialogHeader><DialogTitle>Bỏ thay đổi chưa lưu?</DialogTitle></DialogHeader><DialogFooter><Button variant="outline" onClick={()=>setDiscarding(false)}>Tiếp tục soạn</Button><Button variant="destructive" onClick={onClose}>Bỏ thay đổi</Button></DialogFooter></DialogContent></Dialog>}
  </DialogContent></Dialog>;
}

