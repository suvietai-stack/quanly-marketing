import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Loader2, Plus, Star, Target, UserPlus, Users, X, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3Error, type K3Settings } from '@/lib/biz/k3';
import { K3_GOAL_EVENT, K3_GOAL_STATUS, K3_KPI_KIND, K3_MEMBER_STATUS, k3KpiLabel, k3KpiPercent, type K3GoalDetail, type K3GoalMember, type K3GoalRow, type K3GoalStatus, type K3KpiKind, type K3MemberSearchRow } from '@/lib/biz/k3Goals';
import { k3GoalDetailQuery, k3GoalListQuery, useK3GoalMutation } from '@/lib/biz/k3GoalQueries';
import { MemberPicker } from './Biz3KMemberPicker';
import { Biz3KQuickCreate } from './Biz3KQuickCreate';
import { Biz3KKpiResult } from './Biz3KKpiResult';
import { Biz3KKpiConfig } from './Biz3KKpiConfig';
import { newK3KpiDraft, k3KpiPayload } from '@/lib/biz/k3Measurement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Biz3KTimeline, Biz3KSchedule } from './Biz3KTimeline';
import { timelineLabel, type K3CreationKf } from '@/lib/biz/k3Creation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const toneClass: Record<string, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  info: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
};

export function GoalStatusBadge({ status, overdueDays }: { status: K3GoalStatus; overdueDays?: number }) {
  const meta = K3_GOAL_STATUS[status] ?? K3_GOAL_STATUS.draft;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge className={cn('border-0', toneClass[meta.tone])}>{meta.label}</Badge>
      {!!overdueDays && overdueDays > 0 && <Badge variant="destructive">Quá hạn {overdueDays} ngày</Badge>}
    </span>
  );
}

const FILTERS: { value: string; label: string; scope?: boolean }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'mine', label: 'Của tôi' },
  { value: 'joined', label: 'Tôi tham gia' },
  { value: 'assigned', label: 'Tôi phụ trách KF' },
  { value: 'active', label: 'Đang thực hiện' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'done', label: 'Đã kết thúc' },
  { value: 'scope', label: 'Trong phạm vi quản lý', scope: true },
];

const COLLAB_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'lead', label: 'Tôi chủ trì' },
  { value: 'join', label: 'Tôi tham gia' },
  { value: 'active', label: 'Đang thực hiện' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'done', label: 'Hoàn thành' },
];

export function Biz3KGoals({ settings, variant = 'personal' }: { settings: K3Settings; variant?: 'personal' | 'scope' | 'collab' }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const [filter, setFilter] = useState(variant === 'scope' ? 'scope' : variant === 'collab' ? 'collab' : 'all');
  const [sub, setSub] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({ ...k3GoalListQuery(uid, filter, search.trim()), enabled: !!uid });
  const invited = useQuery({ ...k3GoalListQuery(uid, 'invited', ''), enabled: !!uid });
  const mutation = useK3GoalMutation();

  const shown = useMemo(() => {
    const list = data ?? [];
    if (variant !== 'collab') return list;
    switch (sub) {
      case 'lead': return list.filter((g) => g.my_role === 'owner');
      case 'join': return list.filter((g) => g.my_role === 'accepted');
      case 'active': return list.filter((g) => ['not_started', 'in_progress', 'paused'].includes(g.status));
      case 'overdue': return list.filter((g) => g.overdue_days > 0);
      case 'done': return list.filter((g) => ['done', 'ended_missed'].includes(g.status));
      default: return list;
    }
  }, [data, sub, variant]);

  const respond = async (goalId: string, accept: boolean) => {
    try {
      await mutation.mutateAsync({ kind: 'respond', goal_id: goalId, accept });
      toast.success(accept ? 'Đã chấp nhận tham gia mục tiêu.' : 'Đã từ chối lời mời.');
    } catch (e) {
      toast.error(k3Error(e));
    }
  };

  return (
    <div className="space-y-4">
      {(invited.data?.length ?? 0) > 0 && (
        <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
          <p className="text-sm font-medium">Lời mời tham gia mục tiêu</p>
          {(invited.data ?? []).map((g) => (
            <div key={g.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="min-w-0 flex-1 text-sm"><strong>{g.name}</strong> · chủ trì {g.owner_name}</span>
              <Button size="sm" onClick={() => respond(g.id, true)} disabled={mutation.isPending}><Check className="mr-1 h-4 w-4" />Chấp nhận</Button>
              <Button size="sm" variant="outline" onClick={() => respond(g.id, false)} disabled={mutation.isPending}><X className="mr-1 h-4 w-4" />Từ chối</Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Tìm công việc…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        {variant === 'personal' && (
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FILTERS.filter((f) => !f.scope).map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {variant === 'collab' && (
          <div className="flex flex-wrap gap-1">
            {COLLAB_FILTERS.map((f) => (
              <Button key={f.value} type="button" size="sm" variant={sub === f.value ? 'default' : 'outline'} onClick={() => setSub(f.value)}>{f.label}</Button>
            ))}
          </div>
        )}
        <div className="flex-1" />
        <Button size="sm" onClick={() => setCreating(true)} disabled={!settings.enabled || (variant !== 'personal' && !settings.allow_team_goal)}>
          <Plus className="mr-1 h-4 w-4" /> {variant === 'personal' ? 'Tạo công việc' : 'Tạo công việc nhóm'}
        </Button>
      </div>

      {isLoading && <p className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Đang tải…</p>}
      {error && (
        <div className="rounded-lg border border-destructive/40 p-4 text-center text-sm">
          <p className="text-destructive">{k3Error(error)}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Thử lại</Button>
        </div>
      )}
      {data && shown.length === 0 && !isLoading && (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {variant === 'collab'
            ? <>Chưa có công việc nhóm nào phù hợp. Bấm <strong>Tạo công việc nhóm</strong> để lập KG có nhiều người phối hợp.</>
            : <>Chưa có công việc nào phù hợp. Bấm <strong>Tạo công việc</strong> để lập mục tiêu (KG) cùng các bước thực hiện (KF).</>}
        </div>
      )}

      <div className="space-y-2">
        {shown.map((g) => (
          <button key={g.id} type="button" onClick={() => setSelected(g.id)}
            className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium leading-snug">
                  {g.is_key && <Star className="mr-1 inline h-4 w-4 fill-primary text-primary" />}
                  {g.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Chủ trì {g.owner_name} · {timelineLabel(g.period_start, g.start_time)} → {timelineLabel(g.due_date ?? g.period_end, g.due_time)} · {g.kf_done}/{g.kf_total} KF hoàn thành
                  {g.member_count > 0 && ` · ${g.member_count + 1} người tham gia`}
                </p>
              </div>
              <GoalStatusBadge status={g.status} overdueDays={g.overdue_days} />
            </div>
          </button>
        ))}
      </div>

      {creating && <Biz3KQuickCreate variant={variant === 'personal' ? 'personal' : 'team'} defaultDate={settings.today} onClose={() => setCreating(false)} onCreated={(id) => setSelected(id)} />}
      {selected && <GoalDetailSheet id={selected} settings={settings} onClose={() => setSelected(null)} />}
    </div>
  );
}

function GoalDialog({ goal, onClose }: { goal?: K3GoalDetail['goal']; onClose: () => void }) {
  const mutation = useK3GoalMutation();
  const [key] = useState(() => crypto.randomUUID());
  const [f, setF] = useState({
    name: goal?.name ?? '',
    description: goal?.description ?? '',
    expected_result: goal?.expected_result ?? '',
    period_start: goal?.period_start ?? '',
    period_end: goal?.period_end ?? '',
    due_date: goal?.due_date ?? '',
    is_key: goal?.is_key ?? false, start_time: goal?.start_time?.slice(0, 5) ?? '', due_time: goal?.due_time?.slice(0, 5) ?? '',
  });
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        kind: 'goal',
        payload: {
          id: goal?.id, revision: goal?.revision, request_key: goal ? undefined : key,
          period_type: 'custom', period_start: f.period_start, period_end: f.period_end,
          name: f.name, description: f.description, expected_result: f.expected_result,
          due_date: f.period_end, is_key: f.is_key, start_time: f.start_time, due_time: f.due_time,
        },
      });
      toast.success(goal ? 'Đã lưu mục tiêu.' : 'Đã tạo mục tiêu KG (bản nháp). Thêm KF rồi bắt đầu thực hiện.');
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{goal ? 'Sửa mục tiêu KG' : 'Tạo mục tiêu KG'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="k3g-name">Tên mục tiêu *</Label>
            <Input id="k3g-name" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ví dụ: Phát triển 30 khách hàng tiềm năng đủ điều kiện" />
          </div>
          <Biz3KTimeline id="k3g" start={f.period_start} end={f.period_end} startTime={f.start_time} endTime={f.due_time} onChange={(field, value) => set(({ start: 'period_start', end: 'period_end', startTime: 'start_time', endTime: 'due_time' })[field], value)} />
          <div className="space-y-1"><Label htmlFor="k3g-result">Kết quả cần đạt / tiêu chí hoàn thành</Label><Textarea id="k3g-result" rows={2} value={f.expected_result} onChange={(e) => set('expected_result', e.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="k3g-desc">Mô tả ngắn</Label><Textarea id="k3g-desc" rows={2} value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.is_key} onChange={(e) => set('is_key', e.target.checked)} className="h-4 w-4" />
            Đánh dấu KG trọng tâm (ưu tiên hiển thị)
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy soạn</Button>
          <Button type="button" disabled={mutation.isPending || !f.name.trim() || !f.period_start || !f.period_end} onClick={submit}>
            {mutation.isPending ? 'Đang lưu…' : 'Lưu mục tiêu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function GoalDetailSheet({ id, settings, onClose }: { id: string; settings: K3Settings; onClose: () => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const { data, isLoading, error, refetch } = useQuery({ ...k3GoalDetailQuery(uid, id), enabled: !!uid && !!id });
  const mutation = useK3GoalMutation();
  const [editGoal, setEditGoal] = useState(false);
  const [addAction, setAddAction] = useState(false);
  const [editAction, setEditAction] = useState<K3GoalDetail['actions'][number] | null>(null);
  const [kpiFor, setKpiFor] = useState<{ goalId?: string; actionId?: string } | null>(null);
  const [inviting, setInviting] = useState(false);
  const [invitees, setInvitees] = useState<K3MemberSearchRow[]>([]);
  const [statusTo, setStatusTo] = useState<K3GoalStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [tab, setTab] = useState<'kf' | 'log' | 'history'>('kf');

  const g = data?.goal;
  const canManage = !!data?.can_manage;
  const closed = g ? ['done', 'ended_missed', 'cancelled'].includes(g.status) : false;

  const changeStatus = async () => {
    if (!g || !statusTo) return;
    try {
      await mutation.mutateAsync({ kind: 'goal_status', id: g.id, status: statusTo, note: statusNote, revision: g.revision });
      toast.success('Đã đổi trạng thái mục tiêu.');
      setStatusTo(null); setStatusNote('');
    } catch (e) {
      toast.error(k3Error(e));
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader><SheetTitle className="pr-6">{g?.name ?? 'Mục tiêu KG'}</SheetTitle></SheetHeader>
        {isLoading && <p className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Đang tải…</p>}
        {error && (
          <div className="py-6 text-center text-sm">
            <p className="text-destructive">{k3Error(error)}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Thử lại</Button>
          </div>
        )}
        {data && g && (
          <div className="mt-3 space-y-4">
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <GoalStatusBadge status={g.status} overdueDays={g.overdue_days} />
                {g.is_key && <Badge variant="outline" className="border-primary text-primary"><Star className="mr-1 h-3 w-3" />Trọng tâm</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {timelineLabel(g.period_start, g.start_time)} → {timelineLabel(g.due_date ?? g.period_end, g.due_time)} · Chủ trì <strong>{g.owner_name}</strong>
              </p>
              {g.expected_result && <p className="text-sm"><span className="font-medium">Kết quả cần đạt:</span> {g.expected_result}</p>}
              {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
              {data.kpis.length > 0 && (
                <div className="space-y-1.5 border-t border-border pt-2">
                  <p className="text-xs font-medium text-muted-foreground">KPI kết quả KG</p>
                  {data.kpis.map((k) => <Biz3KKpiResult key={k.id} kpiId={k.id} date={data.today} showStatus={false} />)}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
                {canManage && !closed && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditGoal(true)}>Sửa KG</Button>
                    <Button size="sm" variant="outline" onClick={() => setKpiFor({ goalId: g.id })}><Plus className="mr-1 h-3.5 w-3.5" />KPI kết quả</Button>
                    <Button size="sm" variant="outline" onClick={() => setInviting(true)}><UserPlus className="mr-1 h-3.5 w-3.5" />Mời thành viên</Button>
                    {g.status === 'draft' && <DraftDelete kind="goal" id={g.id} name={g.name} onDeleted={onClose} />}
                    {g.status === 'draft' && <Button size="sm" variant="outline" onClick={() => setStatusTo('not_started')}>Sẵn sàng</Button>}
                    {(g.status === 'draft' || g.status === 'not_started' || g.status === 'paused') && <Button size="sm" onClick={() => setStatusTo('in_progress')}>Bắt đầu thực hiện</Button>}
                    {g.status === 'in_progress' && <Button size="sm" variant="outline" onClick={() => setStatusTo('paused')}>Tạm dừng</Button>}
                    {g.status === 'in_progress' && <Button size="sm" variant="outline" className="text-destructive" onClick={() => setStatusTo('ended_missed')}>Kết thúc chưa đạt</Button>}
                  </>
                )}
                {canManage && closed && <Button size="sm" variant="outline" onClick={() => setStatusTo('in_progress')}>Mở lại thực hiện</Button>}
              </div>
            </div>

            {data.members.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground"><Users className="mr-1 inline h-3.5 w-3.5" />Thành viên tham gia</p>
                {data.members.map((m) => (
                  <div key={m.user_id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm">
                    <span className="min-w-0 flex-1">{m.full_name} <span className="text-xs text-muted-foreground">{m.departments.join(' · ')}</span></span>
                    <Badge variant={m.status === 'accepted' ? 'default' : 'secondary'}>{K3_MEMBER_STATUS[m.status]}</Badge>
                    {canManage && (m.status === 'accepted' || m.status === 'invited') && !closed && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                        try { await mutation.mutateAsync({ kind: 'revoke', goal_id: g.id, user_id: m.user_id }); toast.success('Đã thu hồi thành viên.'); }
                        catch (e) { toast.error(k3Error(e)); }
                      }}>Thu hồi</Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-1 border-b border-border">
              {([['kf', 'Hành động KF'], ['log', 'Nhật ký thực thi'], ['history', 'Hoạt động']] as const).map(([v, l]) => (
                <Button key={v} variant={tab === v ? 'default' : 'ghost'} size="sm" onClick={() => setTab(v)}>{l}</Button>
              ))}
            </div>

            {tab === 'kf' && (
              <div className="space-y-2">
                {canManage && !closed && (
                  <Button size="sm" onClick={() => setAddAction(true)}><Plus className="mr-1 h-4 w-4" />Thêm KF</Button>
                )}
                {data.actions.length === 0 && <p className="text-sm text-muted-foreground">Chưa có hành động KF. KG bắt đầu thực hiện cần ít nhất một KF.</p>}
                {data.actions.map((a) => (
                  <div key={a.action.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-medium leading-snug">
                          {a.action.is_key && <Star className="mr-1 inline h-3.5 w-3.5 fill-primary text-primary" />}
                          {a.action.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Phụ trách: {a.assignee_name ?? '—'}
                          {a.collaborators.length > 0 && ` · Phối hợp: ${a.collaborators.map((c) => c.full_name).join(', ')}`}
                          {` · Hạn ${timelineLabel(a.action.inherit_timeline ? g.due_date ?? g.period_end : a.action.due_date ?? g.period_end, a.action.inherit_timeline ? g.due_time : a.action.due_time)}`}
                          {a.action.execution_schedule?.start_time && ` · Lịch ${a.action.execution_schedule.start_time}–${a.action.execution_schedule.end_time ?? '…'}`}
                          {` · ${a.task_done}/${a.task_total} việc hoàn thành`}
                        </p>
                      </div>
                      <GoalStatusBadge status={a.action.status} overdueDays={a.overdue_days} />
                    </div>
                    {a.kpis.map((k) => <Biz3KKpiResult key={k.id} kpiId={k.id} date={data.today} showStatus={false} />)}
                    {a.member_actuals.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Đóng góp: {a.member_actuals.map((m) => `${m.full_name} ${m.actual}`).join(' · ')}
                      </p>
                    )}
                    {a.action.status === 'ended_missed' && a.action.problem && (
                      <div className="rounded-md bg-secondary/60 p-2 text-xs">
                        <p><span className="font-medium">Vấn đề:</span> {a.action.problem}</p>
                        <p><span className="font-medium">Nguyên nhân:</span> {a.action.cause}</p>
                        <p><span className="font-medium">Giải pháp:</span> {a.action.solution}</p>
                      </div>
                    )}
                    {canManage && (g.status === 'draft' || a.action.status === 'draft') && <DraftDelete kind="action" id={a.action.id} name={a.action.name} />}
                    {!closed && (
                      <ActionButtons a={a} canManage={canManage} settings={settings}
                        onEdit={() => setEditAction(a)} onKpi={() => setKpiFor({ actionId: a.action.id })} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'log' && (
              <div className="space-y-1.5">
                {data.executions.length === 0 && <p className="text-sm text-muted-foreground">Chưa có kết quả thực thi theo ngày.</p>}
                {data.executions.map((e) => (
                  <div key={e.id} className="rounded-md border border-border p-2 text-sm">
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.work_date} · {e.full_name} · {K3_GOAL_STATUS[e.status as K3GoalStatus]?.label ?? e.status}
                      {e.kpi_actual != null && ` · Kết quả ${e.kpi_actual}${e.kpi_unit ? ` ${e.kpi_unit}` : ''}`} · Tiến độ {e.progress}%
                    </p>
                    {e.problem && <p className="text-xs">Vấn đề: {e.problem}{e.solution ? ` · Giải pháp: ${e.solution}` : ''}</p>}
                  </div>
                ))}
              </div>
            )}

            {tab === 'history' && (
              <div className="space-y-1.5">
                {data.events.length === 0 && <p className="text-sm text-muted-foreground">Chưa có hoạt động.</p>}
                {data.events.map((e) => (
                  <div key={e.id} className="border-b border-border py-1.5 text-sm">
                    <p>{K3_GOAL_EVENT[e.action] ?? e.action}{typeof e.detail?.status === 'string' ? `: ${K3_GOAL_STATUS[e.detail.status as K3GoalStatus]?.label ?? e.detail.status}` : ''}</p>
                    <p className="text-xs text-muted-foreground">{e.actor_name ?? '—'} · {new Date(e.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {editGoal && g && <GoalDialog goal={g} onClose={() => setEditGoal(false)} />}
        {data && g && (addAction || editAction) && (
          <ActionDialog goal={g} members={data.members} action={editAction ?? undefined} onClose={() => { setAddAction(false); setEditAction(null); }} />
        )}
        {data && kpiFor && <KpiDialog goalId={kpiFor.goalId} actionId={kpiFor.actionId} onClose={() => setKpiFor(null)} />}
        {inviting && g && (
          <Dialog open onOpenChange={(o) => !o && setInviting(false)}>
            <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
              <DialogHeader><DialogTitle>Mời thành viên tham gia KG</DialogTitle></DialogHeader>
              <p className="text-xs text-muted-foreground">Người được mời cần Chấp nhận trước khi trở thành thành viên và được phân công KF.</p>
              <MemberPicker selected={invitees} onChange={setInvitees} exclude={[g.owner_id, ...(data?.members.filter((m) => m.status === 'accepted' || m.status === 'invited').map((m) => m.user_id) ?? [])]} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviting(false)}>Hủy</Button>
                <Button disabled={mutation.isPending || invitees.length === 0} onClick={async () => {
                  try {
                    await mutation.mutateAsync({ kind: 'invite', goal_id: g.id, user_ids: invitees.map((i) => i.id) });
                    toast.success('Đã gửi lời mời.');
                    setInviting(false); setInvitees([]);
                  } catch (e) { toast.error(k3Error(e)); }
                }}>Gửi lời mời</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {statusTo && g && (
          <Dialog open onOpenChange={(o) => !o && setStatusTo(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Chuyển sang "{K3_GOAL_STATUS[statusTo].label}"?</DialogTitle></DialogHeader>
              {(statusTo === 'done' || statusTo === 'ended_missed' || statusTo === 'cancelled') && (
                <div className="space-y-1">
                  <Label htmlFor="k3g-note">Ghi chú kết thúc</Label>
                  <Textarea id="k3g-note" rows={2} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusTo(null)}>Hủy</Button>
                <Button disabled={mutation.isPending} onClick={changeStatus}>Xác nhận</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ActionButtons({ a, canManage, settings, onEdit, onKpi }: { a: K3GoalDetail['actions'][number]; canManage: boolean; settings: K3Settings; onEdit: () => void; onKpi: () => void }) {
  const mutation = useK3GoalMutation();
  const [ending, setEnding] = useState(false);
  const [vngb, setVngb] = useState({ problem: '', cause: '', solution: '' });
  const st = a.action.status;
  const setStatus = async (status: string, extra?: Record<string, string>) => {
    try {
      await mutation.mutateAsync({ kind: 'action_status', id: a.action.id, status, revision: a.action.revision, ...extra });
      toast.success('Đã đổi trạng thái KF.');
      setEnding(false);
    } catch (e) { toast.error(k3Error(e)); }
  };
  return (
    <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
      {(canManage || settings.can_use) && <Button size="sm" variant="ghost" onClick={onEdit}>Sửa</Button>}
      {canManage && <Button size="sm" variant="ghost" onClick={onKpi}><Plus className="mr-1 h-3.5 w-3.5" />KPI</Button>}
      {st === 'not_started' && <Button size="sm" variant="outline" onClick={() => setStatus('in_progress')}>Bắt đầu</Button>}
      {st === 'in_progress' && <Button size="sm" variant="outline" className="text-destructive" onClick={() => setEnding(true)}>Kết thúc chưa đạt</Button>}
      {(st === 'done' || st === 'ended_missed') && <Button size="sm" variant="outline" onClick={() => setStatus('in_progress')}>Mở lại</Button>}
      {ending && (
        <Dialog open onOpenChange={(o) => !o && setEnding(false)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Kết thúc chưa đạt: {a.action.name}</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Textarea rows={2} placeholder="Vấn đề gặp phải *" value={vngb.problem} onChange={(e) => setVngb({ ...vngb, problem: e.target.value })} />
              <Textarea rows={2} placeholder="Nguyên nhân *" value={vngb.cause} onChange={(e) => setVngb({ ...vngb, cause: e.target.value })} />
              <Textarea rows={2} placeholder="Giải pháp / hướng xử lý *" value={vngb.solution} onChange={(e) => setVngb({ ...vngb, solution: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEnding(false)}>Hủy</Button>
              <Button disabled={mutation.isPending || !vngb.problem.trim() || !vngb.cause.trim() || !vngb.solution.trim()}
                onClick={() => setStatus('ended_missed', vngb)}>Xác nhận</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function KpiLine({ kpi }: { kpi: K3GoalDetail['kpis'][number] }) {
  const pct = k3KpiPercent(kpi);
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>{kpi.name} <span className="text-xs text-muted-foreground">({K3_KPI_KIND[kpi.kind]})</span></span>
        <span className="tabular-nums">{k3KpiLabel(kpi)}{pct != null && ` · ${pct}%`}</span>
      </div>
      {pct != null && <Progress className="h-1.5" value={Math.min(100, pct)} />}
      {kpi.kind !== 'cumulative' && kpi.manual_source && <p className="text-xs text-muted-foreground">Nguồn: {kpi.manual_source}</p>}
    </div>
  );
}

function ActionDialog({ goal, members, action, onClose }: { goal: K3GoalDetail['goal']; members: K3GoalMember[]; action?: K3GoalDetail['actions'][number]; onClose: () => void }) {
  const mutation = useK3GoalMutation();
  const [key] = useState(() => crypto.randomUUID());
  const candidates = useMemo(() => [
    { id: goal.owner_id, full_name: goal.owner_name, departments: [] as string[] },
    ...members.filter((m) => m.status === 'accepted').map((m) => ({ id: m.user_id, full_name: m.full_name, departments: m.departments })),
  ], [goal, members]);
  const [f, setF] = useState({
    name: action?.action.name ?? '',
    start_date: action?.action.start_date ?? '',
    due_date: action?.action.due_date ?? '',
    note: action?.action.note ?? '',
    assignee_id: action?.action.assignee_id ?? goal.owner_id,
    is_key: action?.action.is_key ?? false, start_time: action?.action.start_time?.slice(0, 5) ?? '', due_time: action?.action.due_time?.slice(0, 5) ?? '', inherit_timeline: action?.action.inherit_timeline ?? !action,
  });
  const [schedule, setSchedule] = useState<K3CreationKf['execution_schedule']>(action?.action.execution_schedule ?? { mode: 'daily' });
  const [collabs, setCollabs] = useState<K3MemberSearchRow[]>(action?.collaborators.map((c) => ({ id: c.user_id, full_name: c.full_name, departments: [] })) ?? []);
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        kind: 'action',
        payload: {
          id: action?.action.id, revision: action?.action.revision, request_key: action ? undefined : key,
          goal_id: goal.id, name: f.name, start_date: f.start_date || null, due_date: f.due_date || null,
          note: f.note, assignee_id: f.assignee_id, is_key: f.is_key, start_time: f.start_time, due_time: f.due_time, inherit_timeline: f.inherit_timeline, execution_schedule: schedule, collaborators: collabs.map((c) => c.id),
        },
      });
      toast.success(action ? 'Đã lưu hành động KF.' : 'Đã thêm hành động KF.');
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{action ? 'Sửa hành động KF' : 'Thêm hành động KF'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="k3a-name">Tên hành động *</Label>
            <Input id="k3a-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ví dụ: Liên hệ và tư vấn 100 khách hàng" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.inherit_timeline} onChange={(e) => setF({ ...f, inherit_timeline: e.target.checked })} />Kế thừa thời gian KG</label>
          {f.inherit_timeline ? <p className="text-sm text-muted-foreground">{timelineLabel(goal.period_start, goal.start_time)} → {timelineLabel(goal.due_date ?? goal.period_end, goal.due_time)}</p> : <Biz3KTimeline id="k3a" start={f.start_date || goal.period_start} end={f.due_date || goal.due_date || goal.period_end} startTime={f.start_time} endTime={f.due_time} onChange={(field, value) => setF({ ...f, [({ start: 'start_date', end: 'due_date', startTime: 'start_time', endTime: 'due_time' })[field]]: value })} />}
          <Biz3KSchedule value={schedule} onChange={setSchedule} />
          <div className="space-y-1">
            <Label>Người phụ trách chính</Label>
            <Select value={f.assignee_id} onValueChange={(v) => setF({ ...f, assignee_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}{c.id === goal.owner_id ? ' (chủ trì)' : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Người phối hợp (tùy chọn)</Label>
            <MemberPicker selected={collabs} onChange={setCollabs} exclude={[f.assignee_id]} />
          </div>
          <div className="space-y-1"><Label htmlFor="k3a-note">Ghi chú</Label><Textarea id="k3a-note" rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.is_key} onChange={(e) => setF({ ...f, is_key: e.target.checked })} className="h-4 w-4" />
            Đánh dấu KF trọng tâm
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy soạn</Button>
          <Button type="button" disabled={mutation.isPending || !f.name.trim()} onClick={submit}>{mutation.isPending ? 'Đang lưu…' : 'Lưu hành động'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KpiDialog({ goalId, actionId, onClose }: { goalId?: string; actionId?: string; onClose: () => void }) {
  const mutation = useK3GoalMutation();
  const [f, setF] = useState(newK3KpiDraft);
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        kind: 'kpi',
        payload: {
          ...k3KpiPayload(f), goal_id: goalId, action_id: actionId,
        },
      });
      toast.success('Đã thêm KPI.');
      onClose();
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>Thêm KPI {actionId ? 'thực thi KF' : 'kết quả KG'}</DialogTitle></DialogHeader>
        <Biz3KKpiConfig value={f} onChange={setF} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Hủy soạn</Button>
          <Button type="button" disabled={mutation.isPending || !f.name.trim()} onClick={submit}>{mutation.isPending ? 'Đang lưu…' : 'Lưu KPI'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DraftDelete({ kind, id, name, onDeleted }: { kind: 'goal' | 'action'; id: string; name: string; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const qc = useQueryClient();
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Thao tác bản nháp ${name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="text-destructive" onSelect={() => setOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Xóa bản nháp</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Xóa bản nháp “{name}”?</DialogTitle></DialogHeader><p className="text-sm">Chuyển bản nháp cùng cấu trúc con vào Thùng rác. Có thể khôi phục trong 15 ngày.</p><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Giữ bản nháp</Button><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { const { error } = await supabase.rpc('k3_draft_delete', { _kind: kind, _id: id }); if (error) throw error; await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('k3_') }); setOpen(false); onDeleted?.(); toast.success('Đã chuyển bản nháp vào Thùng rác 15 ngày.'); } catch (e) { toast.error(k3Error(e)); } finally { setBusy(false); } }}>Xác nhận xóa</Button></DialogFooter></DialogContent></Dialog></>;
}
