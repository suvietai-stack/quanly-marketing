import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CalendarDays, CheckCircle2, CircleDashed, Loader2, Play, Plus, Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3DayQuery, useK3DaySave, useK3Summary, useK3TaskDelete, useK3TaskSave, useK3TaskUpdate } from '@/lib/biz/k3Queries';
import { K3_STATUS, K3_TIME_HINT, hasText, k3Counts, k3Error, k3LateFlags, k3ProgressLabel, k3VngbComplete, type K3DayData, type K3Settings, type K3Status, type K3Task } from '@/lib/biz/k3';
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
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-destructive text-destructive-foreground',
};

function StatusBadge({ status }: { status: K3Status }) {
  const meta = K3_STATUS[status];
  return <Badge className={cn('gap-1 border-0', toneClass[meta.tone])}>{meta.label}</Badge>;
}

export function Biz3KMyDay({ settings }: { settings: K3Settings }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const [date, setDate] = useState(settings.today);
  const { data, isLoading, error, refetch } = useQuery({ ...k3DayQuery(uid, date), enabled: !!uid && !!date });
  const [editing, setEditing] = useState<K3Task | null | 'new'>(null);
  const [updating, setUpdating] = useState<K3Task | null>(null);
  const [deleting, setDeleting] = useState<K3Task | null>(null);
  const [confirmSummary, setConfirmSummary] = useState(false);
  const summary = useK3Summary();

  const tasks = data?.tasks ?? [];
  const counts = useMemo(() => k3Counts(tasks), [tasks]);
  const late = data ? k3LateFlags(data.day, settings, date) : null;
  const summarized = !!data?.day?.summarized_at;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="k3-date" className="text-xs">Ngày thực hiện</Label>
          <Input id="k3-date" type="date" value={date} max={settings.today} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setDate(settings.today)} disabled={date === settings.today}>
          <CalendarDays className="mr-1 h-4 w-4" /> Hôm nay
        </Button>
        <div className="flex-1" />
        <Button type="button" size="sm" onClick={() => setEditing('new')}>
          <Plus className="mr-1 h-4 w-4" /> Thêm công việc
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmSummary(true)} disabled={!data?.day || tasks.length === 0}>
          <CheckCircle2 className="mr-1 h-4 w-4" /> {summarized ? 'Cập nhật tổng kết' : 'Tổng kết 3K hôm nay'}
        </Button>
      </div>

      {data?.day && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {data.day.planned_at && <span>Lập lúc {new Date(data.day.planned_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}{late?.planLate ? ' (trễ hạn lập)' : ''}</span>}
          {summarized && <span>· Đã tổng kết lúc {new Date(data.day.summarized_at!).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}{late?.summaryLate ? ' (trễ hạn)' : ''}</span>}
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

      <KgBox date={date} data={data} />

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
          <p className="text-sm text-muted-foreground">Chưa có công việc nào cho ngày này. Bấm <strong>Thêm công việc</strong> để lập 3K đầu ngày.</p>
          <p className="text-xs text-muted-foreground">{K3_TIME_HINT}</p>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} settings={settings} onEdit={() => setEditing(t)} onUpdate={() => setUpdating(t)} onDelete={() => setDeleting(t)} />
        ))}
      </div>

      {editing && (
        <TaskDialog
          date={date}
          task={editing === 'new' ? null : editing}
          focusCount={counts.focus}
          maxFocus={settings.max_focus}
          onClose={() => setEditing(null)}
        />
      )}
      {updating && <UpdateDialog task={updating} onClose={() => setUpdating(null)} />}
      {deleting && <DeleteDialog task={deleting} onClose={() => setDeleting(null)} />}

      <AlertDialog open={confirmSummary} onOpenChange={setConfirmSummary}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tổng kết 3K ngày {date}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-sm">
                <p>Tổng {counts.total} công việc · Hoàn thành {counts.done} · Chưa hoàn thành {counts.open} · Mũi khoan hoàn thành {tasks.filter((t) => t.is_focus && t.status === 'done').length}/{counts.focus}</p>
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

function KgBox({ date, data }: { date: string; data?: K3DayData }) {
  const save = useK3DaySave();
  const [kg, setKg] = useState<string | null>(null);
  const value = kg ?? data?.day?.kg ?? '';
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1">
      <Label htmlFor="k3-kg" className="text-xs font-medium">Mục tiêu / trọng tâm hôm nay (KG)</Label>
      <div className="flex gap-2">
        <Input id="k3-kg" value={value} placeholder="Ví dụ: Phát triển khách hàng mới" onChange={(e) => setKg(e.target.value)} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={save.isPending || kg === null}
          onClick={async () => {
            try {
              await save.mutateAsync({ date, kg: value });
              setKg(null);
              toast.success('Đã lưu mục tiêu ngày.');
            } catch (e) {
              toast.error(k3Error(e));
            }
          }}
        >
          Lưu
        </Button>
      </div>
    </div>
  );
}

function TaskCard({ task, settings, onEdit, onUpdate, onDelete }: { task: K3Task; settings: K3Settings; onEdit: () => void; onUpdate: () => void; onDelete: () => void }) {
  const update = useK3TaskUpdate();
  const save = useK3TaskSave();
  const hasIssue = task.status !== 'done' && (hasText(task.problem) || hasText(task.solution));
  const quick = async (status: K3Status) => {
    try {
      await update.mutateAsync({ id: task.id, status, problem: task.problem ?? '', cause: task.cause ?? '', solution: task.solution ?? '' });
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
        <button
          type="button"
          onClick={toggleFocus}
          title={task.is_focus ? 'Bỏ mũi khoan trọng tâm' : `Đánh dấu mũi khoan trọng tâm (tối đa ${settings.max_focus})`}
          className={cn('mt-0.5 rounded-full p-1 transition-colors', task.is_focus ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
        >
          <Star className={cn('h-4 w-4', task.is_focus && 'fill-primary')} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{task.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {(task.start_time || task.end_time) && <span>{task.start_time?.slice(0, 5) ?? '…'}–{task.end_time?.slice(0, 5) ?? '…'}</span>}
            {task.kpi_target != null && (
              <span>Chỉ tiêu: {task.kpi_target}{task.kpi_unit ? ` ${task.kpi_unit}` : ''} · Thực tế: {task.kpi_actual ?? 0}</span>
            )}
            <span>Tiến độ: {k3ProgressLabel(task)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={task.status} />
          {task.is_focus && <Badge variant="outline" className="border-primary text-primary">Mũi khoan</Badge>}
          {hasIssue && (
            <Badge variant="outline" className="border-amber-500 text-amber-600"><AlertTriangle className="mr-1 h-3 w-3" />Có vấn đề</Badge>
          )}
        </div>
      </div>
      {task.status !== 'done' && (hasText(task.problem) || hasText(task.cause) || hasText(task.solution)) && (
        <div className="rounded-md bg-secondary/60 p-2 text-xs space-y-0.5">
          {hasText(task.problem) && <p><span className="font-medium">Vấn đề:</span> {task.problem}</p>}
          {hasText(task.cause) && <p><span className="font-medium">Nguyên nhân:</span> {task.cause}</p>}
          {hasText(task.solution) && <p><span className="font-medium">Giải pháp:</span> {task.solution}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {task.status === 'todo' && <Button type="button" size="sm" variant="outline" onClick={() => quick('doing')}><Play className="mr-1 h-3.5 w-3.5" />Bắt đầu</Button>}
        {task.status !== 'done' && <Button type="button" size="sm" variant="outline" onClick={onUpdate}>Cập nhật kết quả</Button>}
        {task.status !== 'done' && <Button type="button" size="sm" variant="outline" onClick={() => quick('done')}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Hoàn thành</Button>}
        {task.status === 'done' && <Button type="button" size="sm" variant="ghost" onClick={onUpdate}>Điều chỉnh</Button>}
        <Button type="button" size="sm" variant="ghost" onClick={onEdit}>Sửa</Button>
        <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

function TaskDialog({ date, task, focusCount, maxFocus, onClose }: { date: string; task: K3Task | null; focusCount: number; maxFocus: number; onClose: () => void }) {
  const save = useK3TaskSave();
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
  });
  const [more, setMore] = useState(!!task && (!!task.how || !!task.place || !!task.note));
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const focusBlocked = f.is_focus && !task?.is_focus && focusCount >= maxFocus;
  const submit = async () => {
    try {
      await save.mutateAsync({
        id: task?.id, work_date: date, name: f.name, start_time: f.start_time, end_time: f.end_time,
        kpi_target: f.kpi_target === '' ? null : Number(f.kpi_target), kpi_unit: f.kpi_unit,
        is_focus: f.is_focus, status: task?.status ?? 'todo', progress: task?.progress ?? 0,
        kpi_actual: task?.kpi_actual ?? null, how: f.how, place: f.place, note: f.note,
        problem: task?.problem ?? '', cause: task?.cause ?? '', solution: task?.solution ?? '',
      });
      toast.success(task ? 'Đã lưu công việc.' : 'Đã thêm công việc.');
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
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
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
          <Button type="button" disabled={save.isPending || !f.name.trim()} onClick={submit}>{save.isPending ? 'Đang lưu…' : 'Lưu công việc'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UpdateDialog({ task, onClose }: { task: K3Task; onClose: () => void }) {
  const update = useK3TaskUpdate();
  const quantified = task.kpi_target != null && task.kpi_target > 0;
  const [f, setF] = useState({
    status: task.status as K3Status,
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
        id: task.id, status: f.status,
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
      <DialogContent className="max-w-lg">
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

function DeleteDialog({ task, onClose }: { task: K3Task; onClose: () => void }) {
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
