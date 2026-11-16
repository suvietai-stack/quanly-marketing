import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, CalendarDays, MessageSquareText, RefreshCw, Store, Users, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth';
import { Biz3K } from '@/components/biz/Biz3K';
import { PageHeader } from '@/components/AppShell';
import {
  SHOWROOM_K3_LABELS, readShowroomK3Team, readShowroomK3Member,
  sendShowroomK3Feedback, showroomK3Summary, type ShowroomK3Member, type ShowroomK3State,
} from '@/lib/showroom/k3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

type Tab = 'personal' | 'team';
const todayInVietnam = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const stateVariant = (state: ShowroomK3State): 'secondary' | 'outline' | 'default' =>
  state === 'confirmed' ? 'default' : state === 'none' ? 'outline' : 'secondary';

export function Showroom3K() {
  const { user, can, isSuperAdmin } = useCurrentUser();
  const [tab, setTab] = useState<Tab>('personal');
  const authorized = !!user && user.status === 'Đang hoạt động'
    && (isSuperAdmin || (can('showroom.view') && can('showroom.k3.use')));
  const canMonitor = isSuperAdmin || can('showroom.k3.view_team') || can('showroom.k3.view_all');

  if (!authorized) return <div className="space-y-4">
    <PageHeader title="3K Showroom" description="Khối Showroom" />
    <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
      Chưa được cấp quyền 3K Showroom theo vị trí tổ chức.
    </div>
  </div>;

  return <div className="min-w-0 space-y-5 pb-10">
    <PageHeader title="3K Showroom" description="KG · KF · KPI — Công việc và kết quả của Khối Showroom" />
    <div className="flex flex-wrap gap-2 border-b pb-3">
      <Button type="button" variant={tab === 'personal' ? 'default' : 'outline'}
        onClick={() => setTab('personal')}><ClipboardList className="mr-2 h-4 w-4" />3K của tôi</Button>
      {canMonitor && <Button type="button" variant={tab === 'team' ? 'default' : 'outline'}
        onClick={() => setTab('team')}><Users className="mr-2 h-4 w-4" />Theo dõi nhân viên</Button>}
    </div>
    {tab === 'personal' || !canMonitor
      ? <div className="space-y-3">
          <div className="rounded-xl border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
            KG (mục tiêu), KF (việc thực thi) và KPI dùng chung dữ liệu 3K của Base. Khi lập công việc tại đây, quyền lưu và lịch sử vẫn do hệ thống 3K kiểm soát.
          </div>
          <Biz3K personalOnly />
        </div>
      : <ShowroomK3Team />}
  </div>;
}

function ShowroomK3Team() {
  const { user } = useCurrentUser();
  const [date, setDate] = useState(todayInVietnam);
  const [selected, setSelected] = useState<ShowroomK3Member | null>(null);
  const [search, setSearch] = useState('');
  const [store, setStore] = useState('all');
  const [state, setState] = useState<'all' | ShowroomK3State>('all');

  const query = useQuery({
    queryKey: ['showroom-k3-team', user?.id, date],
    queryFn: () => readShowroomK3Team(date),
    enabled: !!user?.id && !!date,
    staleTime: 20_000,
    retry: 1,
  });
  const stores = useMemo(() => [...new Map((query.data?.people ?? [])
    .map(p => [p.store_id, p.store_name] as const)).entries()], [query.data]);
  const people = useMemo(() => (query.data?.people ?? []).filter(p =>
    (store === 'all' || p.store_id === store) &&
    (state === 'all' || p.state === state) &&
    p.full_name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))
  ), [query.data, store, state, search]);
  const sum = showroomK3Summary(query.data?.people ?? []);

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1"><Label htmlFor="showroom-k3-date">Ngày theo dõi</Label>
        <Input id="showroom-k3-date" type="date" value={date} max={todayInVietnam()}
          onChange={e => setDate(e.target.value)} className="w-44" /></div>
      <Button variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.refetch()}>
        <RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />Làm mới
      </Button>
    </div>
    {query.data && <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <K3Stat icon={<Users className="h-4 w-4" />} label="Nhân sự" value={sum.total} />
      <K3Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Đã xác nhận" value={sum.confirmed} />
      <K3Stat icon={<ClipboardList className="h-4 w-4" />} label="Chưa cập nhật" value={sum.none} />
      <K3Stat icon={<Target className="h-4 w-4" />} label="KG đang có" value={sum.goals} />
    </div>}
    <div className="flex flex-wrap items-center gap-2">
      <Input aria-label="Tìm nhân viên Showroom" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Tìm nhân viên…" className="min-w-36 flex-1 sm:max-w-64" />
      <select aria-label="Lọc cửa hàng" value={store} onChange={e => setStore(e.target.value)}
        className="h-10 min-w-32 max-w-full rounded-md border bg-background px-3 text-sm">
        <option value="all">Tất cả cửa hàng</option>
        {stores.map(([id,name]) => <option key={id} value={id}>{name}</option>)}
      </select>
      <select aria-label="Lọc trạng thái 3K" value={state} onChange={e => setState(e.target.value as typeof state)}
        className="h-10 rounded-md border bg-background px-3 text-sm">
        <option value="all">Mọi trạng thái</option>
        {Object.entries(SHOWROOM_K3_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
    {query.isPending && <div className="py-8 text-center text-sm text-muted-foreground">Đang tải 3K của nhân viên Showroom…</div>}
    {query.error && <div role="alert" className="rounded-xl border border-destructive/40 p-4 text-sm">
      <p>Không tải được dữ liệu: {query.error.message}</p>
      <Button variant="outline" size="sm" className="mt-2" onClick={() => query.refetch()}>Thử lại</Button>
    </div>}
    {query.data && <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{people.length} nhân viên trong phạm vi hiển thị · Không tự tính vi phạm hay trừ điểm cho giai đoạn trước.</p>
      {people.length === 0 && <p className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">Chưa có nhân sự phù hợp.</p>}
      {people.map(p => <button type="button" key={`${p.store_id}:${p.user_id}`}
          onClick={() => setSelected(p)}
          className="w-full rounded-xl border bg-card p-4 text-left transition hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">{p.full_name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Store className="h-3 w-3" />{p.store_name} · {p.position}</p>
          </div>
          <Badge variant={stateVariant(p.state)}>{SHOWROOM_K3_LABELS[p.state]}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{p.goals_count} KG</span><span>{p.actions_count} KF</span>
          <span>{p.results_count} kết quả KPI</span>
        </div>
      </button>)}
    </div>}
    <div className="rounded-xl border bg-muted/25 p-4 text-xs text-muted-foreground">
      Theo dõi chỉ phản ánh dữ liệu 3K đã được nhân sự nhập và xác nhận; không tạo nghĩa vụ hay đánh giá kỷ luật hồi tố.
    </div>
    <MemberDialog person={selected} date={date} onClose={() => setSelected(null)} />
  </div>;
}

function K3Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <Card><CardContent className="space-y-2 p-3 sm:p-4">
    <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
    <p className="text-2xl font-semibold tabular-nums">{value}</p>
  </CardContent></Card>;
}

function MemberDialog({ person, date, onClose }: {
  person: ShowroomK3Member | null; date: string; onClose: () => void;
}) {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');
  const detail = useQuery({
    queryKey: ['showroom-k3-member', user?.id, person?.user_id, date],
    queryFn: () => readShowroomK3Member(person!.user_id, date),
    enabled: !!person,
    staleTime: 15_000,
    retry: 1,
  });
  const submit = useMutation({
    mutationFn: () => sendShowroomK3Feedback(person!.user_id, date, feedback),
    onSuccess: async () => {
      toast.success('Đã lưu nhận xét 3K Showroom.');
      setFeedback('');
      await queryClient.invalidateQueries({queryKey: ['showroom-k3-member']});
    },
    onError: e => toast.error(e instanceof Error ? e.message : 'Không lưu được nhận xét.'),
  });
  const data = detail.data;
  return <Dialog open={!!person} onOpenChange={v => {if(!v) {setFeedback('');onClose();}}}>
    <DialogContent className="max-h-[88dvh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>{person?.full_name} — 3K ngày {date.split('-').reverse().join('/')}</DialogTitle></DialogHeader>
      {detail.isPending && <p className="py-6 text-sm text-muted-foreground">Đang tải kết quả…</p>}
      {detail.error && <p className="text-sm text-destructive">{detail.error.message}</p>}
      {data && <div className="space-y-5 text-sm">
        <section className="space-y-2">
          <h3 className="font-semibold">KG · Mục tiêu ({data.goals.length})</h3>
          {data.goals.length ? data.goals.map(g => <div className="rounded-lg border p-3" key={g.id}>
            <p className="font-medium">{g.name}</p><p className="mt-1 text-xs text-muted-foreground">Trạng thái: {g.status} · Hạn: {g.due_date ?? '—'}</p>
            {g.expected_result && <p className="mt-1 text-xs">{g.expected_result}</p>}
          </div>) : <p className="text-muted-foreground">Chưa có KG trong kỳ.</p>}
        </section>
        <section className="space-y-2">
          <h3 className="font-semibold">KF · Việc thực thi ({data.actions.length})</h3>
          {data.actions.length ? data.actions.map(a => <div className="rounded-lg border p-3" key={a.id}>
            <p className="font-medium">{a.name}</p><p className="mt-1 text-xs text-muted-foreground">{a.goal_name} · {a.status}{a.kpi_target == null ? '' : ` · Mục tiêu ${a.kpi_target} ${a.kpi_unit ?? ''}`}</p>
          </div>) : <p className="text-muted-foreground">Chưa có KF trong ngày.</p>}
        </section>
        <section className="space-y-2">
          <h3 className="font-semibold">KPI · Kết quả thực tế ({data.results.length})</h3>
          {data.results.length ? data.results.map((k,i) => <div className="rounded-lg border p-3" key={`${k.kpi_id}:${i}`}>
            <p className="font-medium">{k.kpi_name}</p>
            <p className="mt-1">Thực tế: <strong>{k.value ?? 'Chưa nhập'} {k.unit ?? ''}</strong>
            {k.target == null ? '' : ` / Mục tiêu: ${k.target} ${k.unit ?? ''}`}</p>
            {k.note && <p className="mt-1 text-xs text-muted-foreground">{k.note}</p>}
          </div>) : <p className="text-muted-foreground">Chưa có kết quả KPI.</p>}
        </section>
        {data.day?.summary_note && <section className="rounded-lg border p-3">
          <h3 className="mb-1 font-semibold">Tổng kết của nhân viên</h3>
          <p className="whitespace-pre-wrap">{data.day.summary_note}</p>
        </section>}
        <section className="space-y-3 border-t pt-3">
          <h3 className="flex items-center gap-2 font-semibold"><MessageSquareText className="h-4 w-4" />Nhận xét quản lý</h3>
          {data.feedback.map(f => <div className="rounded-lg border p-3" key={f.id}>
            <p className="whitespace-pre-wrap">{f.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.author_name} · {new Date(f.created_at).toLocaleString('vi-VN')}</p>
          </div>)}
          {!data.feedback.length && <p className="text-muted-foreground">Chưa có nhận xét.</p>}
          {data.can_comment && <div className="space-y-2">
            <Label htmlFor="showroom-k3-feedback">Gửi nhận xét (tối đa 2.000 ký tự)</Label>
            <Textarea id="showroom-k3-feedback" value={feedback} onChange={e => setFeedback(e.target.value)}
              maxLength={2000} placeholder="Nhận xét kết quả, hướng dẫn cải thiện…" rows={3} />
            <Button disabled={!feedback.trim() || submit.isPending} onClick={() => submit.mutate()}>
              {submit.isPending ? 'Đang lưu…' : 'Lưu nhận xét'}
            </Button>
          </div>}
        </section>
      </div>}
    </DialogContent>
  </Dialog>;
}
