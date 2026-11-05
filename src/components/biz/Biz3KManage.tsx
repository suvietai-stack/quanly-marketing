import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CalendarDays, Loader2, MessageSquarePlus, Star, Target } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { k3TeamQuery, k3UserDayQuery, useK3Comment } from '@/lib/biz/k3Queries';
import { K3_STATUS, K3_TRACK_STATUS, hasText, k3DisplayStatus, k3Error, k3ProgressLabel, k3TrackStatus, type K3Settings, type K3TeamRow, type K3TrackStatus } from '@/lib/biz/k3';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Biz3KDayReview } from './Biz3KDayReview';

type Filter = 'all' | K3TrackStatus | 'issues' | 'done';

const toneClass: Record<string, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  info: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
};

/** Tab Theo Dõi Nhân Viên — chỉ dành cho cấp quản lý theo Cơ cấu tổ chức (quyền kiểm tra tại máy chủ). */
export function Biz3KManage({ settings, selectedDate, onDateChange }: { settings: K3Settings; selectedDate?: string; onDateChange?: (date: string) => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const [localDate, setLocalDate] = useState(settings.today);
  const date = selectedDate ?? localDate; const setDate = onDateChange ?? setLocalDate;
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [selected, setSelected] = useState<K3TeamRow | null>(null);
  const { data, isLoading, error, refetch } = useQuery({ ...k3TeamQuery(uid, date), enabled: !!uid && !!date });

  const departments = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of data ?? []) if (r.department_id) map.set(r.department_id, r.departments[0] ?? 'Đơn vị');
    return Array.from(map.entries());
  }, [data]);

  const rows = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) list = list.filter((r) => r.full_name.toLowerCase().includes(search.trim().toLowerCase()));
    if (department !== 'all') list = list.filter((r) => r.department_id === department);
    if (filter === 'issues') list = list.filter((r) => r.issues > 0);
    else if (filter === 'done') list = list.filter((r) => r.total > 0 && r.done === r.total);
    else if (filter !== 'all') list = list.filter((r) => k3TrackStatus(r) === filter);
    return list;
  }, [data, filter, search, department]);

  const overview = useMemo(() => {
    const list = data ?? [];
    const by = (s: K3TrackStatus) => list.filter((r) => k3TrackStatus(r) === s).length;
    return {
      members: list.length,
      updated: by('planned') + by('updated') + by('summarized') + by('reconfirm'),
      summarized: by('summarized'),
      none: by('none'),
      goals: list.reduce((s, r) => s + (r.goals_active ?? 0), 0),
      kfs: list.reduce((s, r) => s + (r.kf_active ?? 0), 0),
      overdue: list.reduce((s, r) => s + (r.kf_overdue ?? 0), 0),
      issues: list.reduce((s, r) => s + r.issues, 0),
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="k3m-date" className="text-xs">Ngày</Label>
          <Input id="k3m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setDate(settings.today)} disabled={date === settings.today}>
          <CalendarDays className="mr-1 h-4 w-4" /> Hôm nay
        </Button>
        <div className="space-y-1">
          <Label className="text-xs">Đơn vị</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn vị</SelectItem>
              {departments.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Trạng thái</Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="none">Chưa cập nhật hôm nay</SelectItem>
              <SelectItem value="planned">Đã lập nội dung thực thi</SelectItem>
              <SelectItem value="updated">Đã cập nhật kết quả</SelectItem>
              <SelectItem value="summarized">Đã chốt sổ</SelectItem>
              <SelectItem value="reconfirm">Cần xác nhận lại</SelectItem>
              <SelectItem value="issues">Có việc vướng mắc</SelectItem>
              <SelectItem value="done">Đã hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input placeholder="Tìm nhân viên…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Nhân viên" value={overview.members} />
        <Stat label="Đã cập nhật hôm nay" value={overview.updated} />
        <Stat label="Đã chốt sổ" value={overview.summarized} />
        <Stat label="Chưa cập nhật" value={overview.none} />
        <Stat label="KG đang thực hiện" value={overview.goals} />
        <Stat label="KF đang thực hiện" value={overview.kfs} />
        <Stat label="KF quá hạn" value={overview.overdue} />
        <Stat label="VNGB cần xử lý" value={overview.issues} />
      </div>

      {isLoading && <p className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Đang tải…</p>}
      {error && (
        <div className="rounded-lg border border-destructive/40 p-4 text-center text-sm">
          <p className="text-destructive">{k3Error(error)}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Thử lại</Button>
        </div>
      )}
      {data && rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Không có nhân viên nào trong phạm vi phù hợp bộ lọc.</p>}

      <div className="space-y-2">
        {rows.map((r) => {
          const track = k3TrackStatus(r);
          const meta = K3_TRACK_STATUS[track];
          return (
            <button
              key={r.user_id}
              type="button"
              onClick={() => setSelected(r)}
              className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.departments.join(' · ')}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <Badge className={cn('border-0', toneClass[meta.tone])}>{meta.label}</Badge>
                  {r.total > 0 && <Badge variant="outline">{r.done}/{r.total} hoàn thành</Badge>}
                  {(r.goals_active ?? 0) > 0 && <Badge variant="outline">{r.goals_active} KG</Badge>}
                  {(r.kf_overdue ?? 0) > 0 && <Badge variant="destructive">{r.kf_overdue} KF quá hạn</Badge>}
                  {r.focus > 0 && <Badge variant="outline" className="border-primary text-primary"><Star className="mr-1 h-3 w-3" />{r.focus}</Badge>}
                  {r.issues > 0 && <Badge variant="outline" className="border-amber-500 text-amber-600"><AlertTriangle className="mr-1 h-3 w-3" />{r.issues} vướng</Badge>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <MemberSheet row={selected} date={date} settings={settings} onClose={() => setSelected(null)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MemberSheet({ row, date, settings, onClose }: { row: K3TeamRow | null; date: string; settings: K3Settings; onClose: () => void }) {
  const uid = useAuth((s) => s.currentUserId) ?? '';
  const { data, isLoading, error, refetch } = useQuery({ ...k3UserDayQuery(uid, row?.user_id ?? '', date), enabled: !!uid && !!row });
  const comment = useK3Comment();
  const [body, setBody] = useState('');
  const [taskId, setTaskId] = useState('day');
  const [review, setReview] = useState(false);
  const send = async () => {
    if (!data?.day) return;
    try {
      await comment.mutateAsync({ day_id: data.day.id, task_id: taskId === 'day' ? null : taskId, body });
      setBody('');
      toast.success('Đã gửi nhận xét.');
    } catch (e) {
      toast.error(k3Error(e));
    }
  };
  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader><SheetTitle>3K ngày {date} — {row?.full_name}</SheetTitle></SheetHeader>
        {isLoading && <p className="py-6 text-center text-sm text-muted-foreground">Đang tải…</p>}
        {error && <div><p className="text-destructive">{k3Error(error)}</p><Button variant="outline" onClick={() => refetch()}>Thử lại</Button></div>}
        {data && (
          <div className="mt-4 space-y-4">
            <Button variant="outline" onClick={() => setReview(true)}>Xem KG/KF/KPI và tổng kết</Button>
            {review && row && <Biz3KDayReview date={date} today={settings.today} user={row.user_id} onClose={() => setReview(false)} />}
            {(data.active_goals?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground"><Target className="mr-1 inline h-3.5 w-3.5" />KG đang thực hiện</p>
                {data.active_goals?.map((g) => (
                  <div key={g.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm">
                    <span className="min-w-0 flex-1">
                      {g.is_key && <Star className="mr-1 inline h-3.5 w-3.5 fill-primary text-primary" />}
                      {g.name}
                      <span className="block text-xs text-muted-foreground">Chủ trì {g.owner_name ?? '—'} · hạn {g.due_date ?? g.period_end}{g.my_role === 'owner' ? '' : ' · KG nhóm'}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
            {(data.assigned_actions?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">KF được giao / phối hợp</p>
                {data.assigned_actions?.map((a) => (
                  <div key={a.id} className="rounded-md border border-border p-2 text-sm">
                    {a.name}
                    <span className="block text-xs text-muted-foreground">KG: {a.goal_name}{a.due_date ? ` · Hạn ${a.due_date}` : ''}{a.my_part === 'collaborator' ? ' · Phối hợp' : ''}{a.already_today ? ' · Đã ghi hôm nay' : ''}</span>
                  </div>
                ))}
              </div>
            )}
            {!data.day && <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Nhân viên chưa cập nhật 3K cho ngày này.</p>}
            {data.day && (
              <div className="space-y-3">
                {hasText(data.day.kg) && (
                  <div className="rounded-lg border border-border bg-card p-3">
                    <p className="text-xs font-medium text-muted-foreground">Ghi chú mục tiêu ngày (dữ liệu cũ)</p>
                    <p className="text-sm">{data.day.kg}</p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {data.day.planned_at && <span>Lập lúc {new Date(data.day.planned_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</span>}
                  {data.day.summarized_at && <span> · Chốt sổ lúc {new Date(data.day.summarized_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</span>}
                </div>
                <div className="space-y-2">
                  {data.tasks.map((t) => (
                    <div key={t.id} className={cn('rounded-lg border bg-card p-3 space-y-1', t.is_focus ? 'border-primary/60' : 'border-border')}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-snug">{t.is_focus && <Star className="mr-1 inline h-3.5 w-3.5 fill-primary text-primary" />}{t.name}</p>
                        <Badge className="border-0" variant={k3DisplayStatus(t) === 'done' ? 'default' : 'secondary'}>{K3_STATUS[k3DisplayStatus(t)].label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(t.start_time || t.end_time) && `${t.start_time?.slice(0, 5) ?? '…'}–${t.end_time?.slice(0, 5) ?? '…'} · `}
                        {t.kpi_target != null && `Chỉ tiêu ${t.kpi_target}${t.kpi_unit ? ` ${t.kpi_unit}` : ''} · Thực tế ${t.kpi_actual ?? 0} · `}
                        Tiến độ {k3ProgressLabel(t)}
                      </p>
                      {t.status !== 'done' && (hasText(t.problem) || hasText(t.cause) || hasText(t.solution)) && (
                        <div className="rounded-md bg-secondary/60 p-2 text-xs space-y-0.5">
                          {hasText(t.problem) && <p><span className="font-medium">Vấn đề:</span> {t.problem}</p>}
                          {hasText(t.cause) && <p><span className="font-medium">Nguyên nhân:</span> {t.cause}</p>}
                          {hasText(t.solution) && <p><span className="font-medium">Giải pháp:</span> {t.solution}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {data.comments.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Nhận xét</p>
                    {data.comments.map((c) => (
                      <div key={c.id} className="rounded-md border border-border p-2 text-xs">
                        <p>{c.body}</p>
                        <p className="text-muted-foreground">{c.author_name} · {new Date(c.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
                      </div>
                    ))}
                  </div>
                )}
                {data.can_comment && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <Label htmlFor="k3c-body" className="text-xs">Nhận xét / hướng dẫn của quản lý</Label>
                    <Select value={taskId} onValueChange={setTaskId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="day">Tổng kết ngày</SelectItem>{data.tasks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
                    <Textarea id="k3c-body" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Nhập nhận xét cho nhân viên…" />
                    <Button type="button" size="sm" disabled={comment.isPending || !body.trim()} onClick={send}>
                      <MessageSquarePlus className="mr-1 h-4 w-4" /> Gửi nhận xét
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
