import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CalendarDays, CheckCircle2, CircleDashed, ClipboardCheck, History, Loader2, Play, Plus, Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3DayQuery, useK3Summary, useK3TaskDelete, useK3TaskSave, useK3TaskUpdate } from '@/lib/biz/k3Queries';
import { Biz3KQuickCreate } from './Biz3KQuickCreate';
import { useK3PeriodMutation } from '@/lib/biz/k3PeriodQueries';
import { K3_STATUS, K3_TIME_HINT, hasText, k3Counts, k3DisplayStatus, k3IsComplete, k3Error, k3LateFlags, k3NeedsConfirmation, k3ProgressLabel, type K3AssignedAction, type K3DayData, type K3Settings, type K3Status, type K3Task } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const toneClass: Record<string, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  info: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
};

function StatusBadge({ status }: { status: K3Status }) {
  const meta = K3_STATUS[status];
  return <Badge className={cn('gap-1 border-0', toneClass[meta.tone])}>{meta.label}</Badge>;
}

export function Biz3KMyDay({ settings, selectedDate, onDateChange }: { settings: K3Settings; selectedDate?: string; onDateChange?: (date: string) => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const [localDate, setLocalDate] = useState(settings.today);
  const date = selectedDate ?? localDate;
  const setDate = onDateChange ?? setLocalDate;
  const { data, isLoading, error, refetch } = useQuery({ ...k3DayQuery(uid, date), enabled: !!uid && !!date });
  const [editing, setEditing] = useState<K3Task | null | 'new'>(null);
  const [quickCreate, setQuickCreate] = useState(false);
  const [logging, setLogging] = useState(false);
  const [updating, setUpdating] = useState<K3Task | null>(null);
  const [deleting, setDeleting] = useState<K3Task | null>(null);
  const [confirmSummary, setConfirmSummary] = useState(false);
  const [history, setHistory] = useState(false);
  const summary = useK3Summary();

  const tasks = data?.tasks ?? [];
  const counts = useMemo(() => k3Counts(tasks), [tasks]);
  const late = data ? k3LateFlags(data.day, settings, date) : null;
  const summarized = !!data?.day?.summarized_at;
  const needsConfirmation = k3NeedsConfirmation(data?.day);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="k3-date" className="text-xs">Ngày thực hiện</Label>
          <Input id="k3-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setDate(settings.today)} disabled={date === settings.today}>
          <CalendarDays className="mr-1 h-4 w-4" /> Hôm nay
        </Button>
        <div className="flex-1" />
        <Button type="button" size="sm" disabled={!settings.enabled} onClick={() => setQuickCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> Tạo công việc
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!settings.enabled} onClick={() => setLogging(true)}>
          <ClipboardCheck className="mr-1 h-4 w-4" /> Ghi nhận thực hiện
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmSummary(true)} disabled={!settings.enabled || date > settings.today || !data?.day || tasks.length === 0}>
          <CheckCircle2 className="mr-1 h-4 w-4" /> {needsConfirmation ? 'Xác nhận lại tổng kết' : summarized ? 'Xem lại tổng kết' : 'Tổng kết 3K ngày'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setHistory(true)}><History className="mr-1 h-4 w-4" />Lịch sử</Button>
      </div>

      {data?.day && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {data.day.planned_at && <span>Lập lúc {new Date(data.day.planned_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}{late?.planLate ? ` (muộn ${late.planLateMinutes} phút)` : ' (đúng hạn)'}</span>}
          {data.day.summarized_at && <span>· Tổng kết lần đầu {new Date(data.day.summarized_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}{late?.summaryLate ? ' (trễ hạn)' : ''}</span>}
          {needsConfirmation && <Badge variant="destructive">Cần xác nhận lại tổng kết</Badge>}
          {data.day.confirmed_at && <span>· Xác nhận gần nhất {new Date(data.day.confirmed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</span>}
          {late?.summaryOverdue && <Badge variant="destructive">Chưa tổng kết (quá {settings.summary_by.slice(0, 5)})</Badge>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <StatCard label="Tổng công việc" value={counts.total} />
        <StatCard label="Đã hoàn thành" value={counts.done} />
        <StatCard label="Đang thực hiện" value={counts.doing} />
        <StatCard label="Chưa hoàn thành" value={counts.open} />
        <StatCard label="Mũi khoan" value={counts.focus} />
      </div>

      <GoalSection key={date} date={date} data={data} enabled={settings.enabled} />

      {isLoading && <p className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Đang tải…</p>}
      {error && (
        <div className="rounded-lg border border-destructive/40 p-4 text-center text-sm">
          <p className="text-destructive">{k3Error(error)}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Thử lại</Button>
        </div>
      )}
      {data && tasks.length === 0 && !isLoading && (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center space-y-3">
          <CircleDashed className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chưa có công việc nào cho ngày này. Bấm <strong>Tạo công việc</strong> để lập mục tiêu mới, hoặc <strong>Ghi nhận thực hiện</strong> để cập nhật KF đang theo đuổi.</p>
          <p className="text-xs text-muted-foreground">{K3_TIME_HINT}</p>
        </div>
      )}

      <div className="space-y-2">
        {[...tasks].sort((a,b) => Number(b.is_focus)-Number(a.is_focus)).map((t) => (
          <TaskCard key={t.id} task={t} settings={settings} onEdit={() => setEditing(t)} onUpdate={() => setUpdating(t)} onDelete={() => setDeleting(t)} />
        ))}
      </div>

      {editing && (
        <TaskDialog
          date={date}
          task={editing === 'new' ? null : editing}
          focusCount={counts.focus}
          maxFocus={settings.max_focus}
          actions={data?.assigned_actions}
          onClose={() => setEditing(null)}
        />
      )}
      {updating && <UpdateDialog task={updating} onClose={() => setUpdating(null)} />}
      {deleting && <DeleteDialog task={deleting} onClose={() => setDeleting(null)} />}
      {quickCreate && <Biz3KQuickCreate variant="personal" defaultDate={date} onClose={() => setQuickCreate(false)} />}
      {logging && <LogExecutionDialog date={date} actions={data?.assigned_actions ?? []} onClose={() => setLogging(false)} onCreateNew={() => { setLogging(false); setQuickCreate(true); }} />}
      <Dialog open={history} onOpenChange={setHistory}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Lịch sử 3K ngày {date}</DialogTitle></DialogHeader>
        {data?.summaries?.map((v) => <div key={v.id} className="border-b border-border py-2 text-sm"><p className="font-medium">Tổng kết phiên bản {v.revision}</p><p className="text-xs text-muted-foreground">{new Date(v.confirmed_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>{v.snapshot.tasks.map((t) => <p key={t.id}>{t.name} · {k3ProgressLabel(t)}</p>)}</div>)}
        {data?.events?.map((e) => <div key={e.id} className="border-b border-border py-2 text-sm"><p>{({ create:'Thêm công việc', update:'Cập nhật công việc', delete:'Xóa công việc', plan:'Lưu mục tiêu', summary:'Xác nhận tổng kết', progress:'Cập nhật kết quả' } as Record<string,string>)[e.action] ?? 'Thay đổi công việc'}</p><p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p></div>)}
        {!data?.events?.length && <p className="text-sm text-muted-foreground">Chưa có lịch sử.</p>}
      </DialogContent></Dialog>

      <AlertDialog open={confirmSummary} onOpenChange={setConfirmSummary}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tổng kết 3K ngày {date}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-sm">
                <p>Tổng {counts.total} công việc · Hoàn thành {counts.done} · Chưa hoàn thành {counts.open} · Mũi khoan hoàn thành {tasks.filter((t) => t.is_focus && k3IsComplete(t)).length}/{counts.focus}</p>
                {counts.open > 0 && <p className="text-amber-600">Các công việc chưa hoàn thành phải có đủ Vấn đề – Nguyên nhân – Giải pháp trước khi tổng kết.</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await summary.mutateAsync(date);
                  toast.success('Đã tổng kết 3K trong ngày.');
                } catch (e) {
                  toast.error(k3Error(e));
                }
              }}
            >
              Xác nhận tổng kết
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

/** KG đang thực hiện + KF cần làm hôm nay. Ô KG văn bản tự do đã bỏ; dữ liệu KG ngày cũ chỉ hiển thị như ghi chú lịch sử. */
function GoalSection({ date, data, enabled }: { date: string; data?: K3DayData; enabled: boolean }) {
  const planSave = useK3PeriodMutation();
  const goals = data?.active_goals ?? [];
  const actions = data?.assigned_actions ?? [];
  const legacyKg = data?.day?.kg;
  if (!goals.length && !actions.length && !hasText(legacyKg)) return null;
  const addToday = async (a: K3AssignedAction) => {
    try {
      await planSave.mutateAsync({ kind: 'task', payload: { name: a.name, action_id: a.id, work_date: date, request_key: crypto.randomUUID() } });
      toast.success('Đã thêm KF vào công việc hôm nay.');
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3">
      {goals.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">KG đang thực hiện</p>
          <div className="flex flex-wrap gap-1.5">
            {goals.map((g) => (
              <Badge key={g.id} variant="outline" className={cn('gap-1 whitespace-normal text-left', g.is_key && 'border-primary text-primary')}>
                {g.is_key && <Star className="h-3 w-3 fill-primary" />}
                {g.name}
                <span className="text-xs text-muted-foreground">· hạn {g.due_date ?? g.period_end}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
      {actions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">KF cần thực hiện hôm nay</p>
          {actions.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm">
              <span className="min-w-0 flex-1">
                {a.is_key && <Star className="mr-1 inline h-3.5 w-3.5 fill-primary text-primary" />}
                {a.name}
                <span className="block text-xs text-muted-foreground">KG: {a.goal_name}{a.due_date ? ` · Hạn ${a.due_date}` : ''}{a.my_part === 'collaborator' ? ' · Bạn phối hợp' : ''}</span>
              </span>
              {a.already_today
                ? <Badge variant="secondary">Đã có trong hôm nay</Badge>
                : <Button type="button" size="sm" variant="outline" disabled={!enabled || planSave.isPending} onClick={() => addToday(a)}>Thêm vào hôm nay</Button>}
            </div>
          ))}
        </div>
      )}
      {hasText(legacyKg) && (
        <p className="text-xs text-muted-foreground">Ghi chú mục tiêu ngày cũ: {legacyKg}</p>
      )}
    </div>
  );
}

/** Ghi nhận thực hiện: chọn KF đang tồn tại để thêm bản ghi thực thi vào ngày — không tạo KG/KF mới. */
function LogExecutionDialog({ date, actions, onClose, onCreateNew }: { date: string; actions: K3AssignedAction[]; onClose: () => void; onCreateNew: () => void }) {
  const planSave = useK3PeriodMutation();
  const add = async (a: K3AssignedAction) => {
    try {
      await planSave.mutateAsync({ kind: 'task', payload: { name: a.name, action_id: a.id, work_date: date, request_key: crypto.randomUUID() } });
      toast.success('Đã thêm KF vào công việc hôm nay. Cập nhật kết quả ngay trên thẻ công việc.');
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>Ghi nhận thực hiện ngày {date}</DialogTitle></DialogHeader>
        {actions.length === 0 && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Bạn chưa có KF nào đang thực hiện. Nếu phát sinh việc chưa có KG, hãy tạo công việc mới ngay tại đây.</p>
            <Button type="button" size="sm" onClick={onCreateNew}><Plus className="mr-1 h-4 w-4" />Tạo công việc</Button>
          </div>
        )}
        <div className="space-y-2">
          {actions.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm">
              <span className="min-w-0 flex-1">
                {a.is_key && <Star className="mr-1 inline h-3.5 w-3.5 fill-primary text-primary" />}
                {a.name}
                <span className="block text-xs text-muted-foreground">KG: {a.goal_name}{a.due_date ? ` · Hạn ${a.due_date}` : ''}{a.my_part === 'collaborator' ? ' · Bạn phối hợp' : ''}</span>
              </span>
              {a.already_today
                ? <Badge variant="secondary">Đã có trong hôm nay</Badge>
                : <Button type="button" size="sm" variant="outline" disabled={planSave.isPending} onClick={() => add(a)}>Thêm vào hôm nay</Button>}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TaskCard({ task, settings, onEdit, onUpdate, onDelete }: { task: K3Task; settings: K3Settings; onEdit: () => void; onUpdate: () => void; onDelete: () => void }) {
  const update = useK3TaskUpdate();
  const save = useK3TaskSave();
  const hasIssue = !k3IsComplete(task) && (hasText(task.problem) || hasText(task.solution));
  const quick = async (status: K3Status) => {
    try {
      await update.mutateAsync({ id: task.id, revision:task.revision, status, problem: task.problem ?? '', cause: task.cause ?? '', solution: task.solution ?? '' });
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  const toggleFocus = async () => {
    try {
      await save.mutateAsync({ ...task, is_focus: !task.is_focus });
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <div className={cn('rounded-lg border bg-card p-3 space-y-2', task.is_focus ? 'border-primary/60' : 'border-border')}>
      <div className="flex items-start gap-2">
        <Button variant="ghost" size="icon" disabled={!settings.enabled}
          type="button"
          onClick={toggleFocus}
          title={task.is_focus ? 'Bỏ mũi khoan trọng tâm' : `Đánh dấu mũi khoan trọng tâm (tối đa ${settings.max_focus})`}
          className={cn('mt-0.5 rounded-full p-1 transition-colors', task.is_focus ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
        >
          <Star className={cn('h-4 w-4', task.is_focus && 'fill-primary')} />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="break-words font-medium leading-snug">{task.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {(task.start_time || task.end_time) && <span>{task.start_time?.slice(0, 5) ?? '…'}–{task.end_time?.slice(0, 5) ?? '…'}</span>}
            {task.kpi_target != null && (
              <span>Chỉ tiêu: {task.kpi_target}{task.kpi_unit ? ` ${task.kpi_unit}` : ''} · Thực tế: {task.kpi_actual ?? 0}</span>
            )}
            <span>Tiến độ: {k3ProgressLabel(task)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="max-w-36 whitespace-normal text-right"><StatusBadge status={k3DisplayStatus(task)} /></span>
          {task.status==='done'&&k3DisplayStatus(task)!=='done'&&<span className="max-w-36 text-right text-xs text-muted-foreground">Trạng thái cũ: Hoàn thành</span>}
          {task.is_focus && <Badge variant="outline" className="border-primary text-primary">Mũi khoan</Badge>}
          {hasIssue && (
            <Badge variant="outline" className="border-amber-500 text-amber-600"><AlertTriangle className="mr-1 h-3 w-3" />Có vấn đề</Badge>
          )}
        </div>
      </div>
      {!k3IsComplete(task) && (hasText(task.problem) || hasText(task.cause) || hasText(task.solution)) && (
        <div className="rounded-md bg-secondary/60 p-2 text-xs space-y-0.5">
          {hasText(task.problem) && <p><span className="font-medium">Vấn đề:</span> {task.problem}</p>}
          {hasText(task.cause) && <p><span className="font-medium">Nguyên nhân:</span> {task.cause}</p>}
          {hasText(task.solution) && <p><span className="font-medium">Giải pháp:</span> {task.solution}</p>}
        </div>
      )}
      {settings.enabled && <div className="flex flex-wrap gap-1.5">
        {task.status === 'todo' && <Button type="button" size="sm" variant="outline" onClick={() => quick('doing')}><Play className="mr-1 h-3.5 w-3.5" />Bắt đầu</Button>}
        {task.status !== 'done' && <Button type="button" size="sm" variant="outline" onClick={onUpdate}>Cập nhật kết quả</Button>}
        {task.status !== 'done' && <Button type="button" size="sm" variant="outline" onClick={onUpdate}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Hoàn thành</Button>}
        {task.status === 'done' && <Button type="button" size="sm" variant="ghost" onClick={onUpdate}>Điều chỉnh</Button>}
        <Button type="button" size="sm" variant="ghost" onClick={onEdit}>Sửa</Button>
        <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>}
    </div>
  );
}

export function TaskDialog({ date, task, focusCount, maxFocus, onClose, actions }: { date: string; task: K3Task | null; focusCount: number; maxFocus: number; onClose: () => void; actions?: { id: string; name: string }[] }) {
  const save = useK3TaskSave();
  const planSave=useK3PeriodMutation();
  const [actionId,setActionId]=useState((task as K3Task & { action_id?:string } | null)?.action_id??'none');
  const [requestKey]=useState(()=>crypto.randomUUID());
  const [f, setF] = useState({
    name: task?.name ?? '',
    start_time: task?.start_time?.slice(0, 5) ?? '',
    end_time: task?.end_time?.slice(0, 5) ?? '',
    kpi_target: task?.kpi_target?.toString() ?? '',
    kpi_unit: task?.kpi_unit ?? '',
    is_focus: task?.is_focus ?? false,
    how: task?.how ?? '',
    place: task?.place ?? '',
    note: task?.note ?? '',
    link: task?.links?.[0]?.url ?? '',
  });
  const [more, setMore] = useState(!!task && (!!task.how || !!task.place || !!task.note));
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const focusBlocked = f.is_focus && !task?.is_focus && focusCount >= maxFocus;
  const submit = async () => {
    try {
      const payload={
        id: task?.id, revision: task?.revision, request_key: task ? undefined : requestKey, work_date: task?.work_date ?? date, name: f.name, start_time: f.start_time, end_time: f.end_time,
        kpi_target: f.kpi_target === '' ? null : Number(f.kpi_target), kpi_unit: f.kpi_unit,
        is_focus: f.is_focus, status: task?.status ?? 'todo', progress: task?.progress ?? 0,
        kpi_actual: task?.kpi_actual ?? null, how: f.how, place: f.place, note: f.note,
        problem: task?.problem ?? '', cause: task?.cause ?? '', solution: task?.solution ?? '',
        links: f.link ? [{ ...(task?.links?.[0]??{}), url: f.link },...(task?.links?.slice(1)??[])] : task?.links?.slice(1)??[],
        action_id:actionId==='none'?null:actionId,
      };
      if(actionId!=='none') await planSave.mutateAsync({kind:'task',payload:{...payload,action_id:actionId}});
      else await save.mutateAsync(payload);
      toast.success(task ? 'Đã lưu công việc.' : 'Đã thêm công việc.');
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{task ? 'Sửa công việc' : 'Thêm công việc'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="k3t-name">Tên công việc *</Label>
            <Input id="k3t-name" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Gọi 10 khách hàng tiềm năng khu vực Hà Nội" />
            <p className="text-xs text-muted-foreground">{K3_TIME_HINT}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label htmlFor="k3t-start">Giờ bắt đầu dự kiến</Label><Input id="k3t-start" type="time" value={f.start_time} onChange={(e) => set('start_time', e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="k3t-end">Giờ kết thúc dự kiến</Label><Input id="k3t-end" type="time" value={f.end_time} onChange={(e) => set('end_time', e.target.value)} /></div>
          </div>
          {!!actions?.length&&<div className="space-y-1"><Label>Liên kết KF (tùy chọn)</Label><Select value={actionId} onValueChange={setActionId}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">Không liên kết</SelectItem>{actions.map(a=><SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label htmlFor="k3t-target">Chỉ tiêu / KPI (số lượng)</Label><Input id="k3t-target" type="number" min={0} value={f.kpi_target} onChange={(e) => set('kpi_target', e.target.value)} placeholder="Để trống nếu đánh giá theo %" /></div>
            <div className="space-y-1"><Label htmlFor="k3t-unit">Đơn vị đo</Label><Input id="k3t-unit" value={f.kpi_unit} onChange={(e) => set('kpi_unit', e.target.value)} placeholder="khách, cuộc gọi…" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.is_focus} disabled={focusBlocked} onChange={(e) => set('is_focus', e.target.checked)} className="h-4 w-4" />
            Mũi khoan trọng tâm {focusBlocked ? `(đã đủ ${maxFocus} việc)` : `(tối đa ${maxFocus}/ngày)`}
          </label>
          <button type="button" className="text-xs text-primary underline" onClick={() => setMore((v) => !v)}>{more ? 'Ẩn thông tin mở rộng' : 'Thêm cách thực hiện, địa điểm, ghi chú'}</button>
          {more && (
            <div className="space-y-2">
              <div className="space-y-1"><Label htmlFor="k3t-how">Cách thực hiện (How)</Label><Textarea id="k3t-how" rows={2} value={f.how} onChange={(e) => set('how', e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="k3t-place">Địa điểm (Where)</Label><Input id="k3t-place" value={f.place} onChange={(e) => set('place', e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="k3t-note">Ghi chú</Label><Textarea id="k3t-note" rows={2} value={f.note} onChange={(e) => set('note', e.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="k3t-link">Link tài liệu</Label><Input id="k3t-link" type="url" value={f.link} onChange={(e) => set('link',e.target.value)} /></div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="button" disabled={save.isPending || planSave.isPending || !f.name.trim()} onClick={submit}>{save.isPending || planSave.isPending ? 'Đang lưu…' : 'Lưu công việc'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateDialog({ task, onClose }: { task: K3Task; onClose: () => void }) {
  const update = useK3TaskUpdate();
  const quantified = task.kpi_target != null && task.kpi_target > 0;
  const [f, setF] = useState({
    status: k3DisplayStatus(task),
    kpi_actual: task.kpi_actual?.toString() ?? '',
    progress: task.progress.toString(),
    problem: task.problem ?? '',
    cause: task.cause ?? '',
    solution: task.solution ?? '',
    note: task.note ?? '',
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const needsVngb = f.status !== 'done';
  const submit = async () => {
    try {
      await update.mutateAsync({
        id: task.id, revision:task.revision, status: f.status,
        kpi_actual: f.kpi_actual === '' ? null : Number(f.kpi_actual),
        progress: f.progress === '' ? null : Number(f.progress),
        problem: f.problem, cause: f.cause, solution: f.solution, note: f.note,
      });
      toast.success('Đã cập nhật kết quả.');
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>Cập nhật: {task.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Trạng thái</Label>
            <Select value={f.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(K3_STATUS) as K3Status[]).map((s) => <SelectItem key={s} value={s}>{K3_STATUS[s].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {quantified ? (
            <div className="space-y-1">
              <Label htmlFor="k3u-actual">Kết quả thực tế (kế hoạch {task.kpi_target}{task.kpi_unit ? ` ${task.kpi_unit}` : ''})</Label>
              <Input id="k3u-actual" type="number" min={0} value={f.kpi_actual} onChange={(e) => set('kpi_actual', e.target.value)} />
              <p className="text-sm font-medium">Tiến độ: {k3ProgressLabel({ kpi_target:task.kpi_target,kpi_actual:f.kpi_actual === '' ? 0 : Number(f.kpi_actual),progress:Number(f.progress) })}</p>
              <p className="text-xs text-muted-foreground">Hệ thống tự tính tỷ lệ; kết quả vượt kế hoạch vẫn được ghi nhận.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="k3u-progress">Tiến độ (%)</Label>
              <Input id="k3u-progress" type="number" min={0} max={100} value={f.progress} onChange={(e) => set('progress', e.target.value)} />
            </div>
          )}
          {needsVngb && (
            <div className="space-y-2 rounded-md border border-amber-300 p-2">
              <p className="text-xs font-medium text-amber-700">Vấn đề – Nguyên nhân – Giải pháp (bắt buộc khi tổng kết nếu chưa hoàn thành)</p>
              <Textarea rows={2} placeholder="Vấn đề gặp phải" value={f.problem} onChange={(e) => set('problem', e.target.value)} />
              <Textarea rows={2} placeholder="Nguyên nhân" value={f.cause} onChange={(e) => set('cause', e.target.value)} />
              <Textarea rows={2} placeholder="Giải pháp / hướng xử lý" value={f.solution} onChange={(e) => set('solution', e.target.value)} />
            </div>
          )}
          <div className="space-y-1"><Label htmlFor="k3u-note">Ghi chú</Label><Textarea id="k3u-note" rows={2} value={f.note} onChange={(e) => set('note', e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="button" disabled={update.isPending} onClick={submit}>{update.isPending ? 'Đang lưu…' : 'Lưu cập nhật'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({ task, onClose }: { task: K3Task; onClose: () => void }) {
  const del = useK3TaskDelete();
  return (
    <AlertDialog open onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa công việc?</AlertDialogTitle>
          <AlertDialogDescription>Công việc "{task.name}" sẽ bị xóa khỏi 3K ngày {task.work_date}. Lịch sử thay đổi vẫn được lưu lại.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground"
            onClick={async () => {
              try {
                await del.mutateAsync(task.id);
                toast.success('Đã xóa công việc.');
                onClose();
              } catch (e) {
                toast.error(k3Error(e));
              }
            }}
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
