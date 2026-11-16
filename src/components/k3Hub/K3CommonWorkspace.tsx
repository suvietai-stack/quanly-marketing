import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, CheckCircle2, ClipboardList, MessageSquareText, RefreshCw, Settings2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth';
import { Biz3K } from '@/components/biz/Biz3K';
import { K3HubTimingDashboard } from '@/components/k3Hub/K3HubTimingDashboard';
import { PageHeader } from '@/components/AppShell';
import {
  K3_HUB_STATES, k3HubAccess, k3HubReport, k3HubDetails, k3HubFeedbackSave,
  k3HubPolicyRead, k3HubPolicySave, k3HubTotals,
  type K3HubPerson, type K3HubPolicy, type K3HubState,
} from '@/lib/k3Hub/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const vietnamToday = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (part: string) => parts.find(p => p.type===part)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const statusBadge = (s: K3HubState): 'secondary' | 'outline' | 'default' =>
  s === 'confirmed' ? 'default' : s === 'none' ? 'outline' : 'secondary';

export function K3CommonWorkspace({ title, initialUnit, central = false, areaBlock }: {
  title: string;
  initialUnit: string;
  central?: boolean;
  /** Limits this area's monitor to the configured block; keeps the shared 3K source. */
  areaBlock?: string;
}) {
  const { user } = useCurrentUser();
  const [tab, setTab] = useState<'mine' | 'report' | 'policy'>(central ? 'report' : 'mine');
  const [unitOverride, setUnitOverride] = useState<string | null>(null);
  const access = useQuery({
    queryKey: ['k3hub-access', user?.id],
    queryFn: k3HubAccess,
    enabled: !!user?.id && user.status === 'Đang hoạt động',
    staleTime: 30_000,
    retry: 1,
  });
  const data = access.data;
  const options = areaBlock ? (data?.units ?? []).filter(u => u.block_id===areaBlock || u.id===areaBlock) : (data?.units ?? []);
  const canReport = !!(data?.can_manage || data?.can_company) && (!areaBlock || options.length>0);
  const initial = central
    ? (data?.can_company ? 'org-company' : options[0]?.id ?? '')
    : (data?.can_company && !areaBlock ? initialUnit
      : options.find(x => x.id===initialUnit)?.id
        ?? options.find(x => x.block_id===initialUnit)?.id ?? '');
  const selectedUnit = unitOverride !== null &&
      (unitOverride==='org-company' && data?.can_company || options.some(x => x.id===unitOverride))
    ? unitOverride : initial;
  const visibleTab = tab === 'policy' && !data?.can_config ? 'report'
    : tab === 'mine' && !data?.can_personal && canReport ? 'report'
    : tab === 'report' && !canReport ? 'mine' : tab;
  const hasArea = central ? canReport : (!!data?.can_personal || canReport);

  if (user?.status !== 'Đang hoạt động') return <p className="p-6 text-sm text-muted-foreground">Cần đăng nhập tài khoản đang hoạt động.</p>;

  return <div className="min-w-0 space-y-5 pb-10">
    <PageHeader title={title} description={central
      ? 'Dashboard phân tích giờ lập · giờ tổng kết · đúng hạn / trễ hạn theo cơ cấu tổ chức'
      : '3K theo phạm vi vị trí · Dùng chung dữ liệu với Trung tâm 3K'} />
    {access.isPending && <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Đang xác minh phạm vi 3K theo sơ đồ tổ chức…</div>}
    {access.error && <div role="alert" className="space-y-2 rounded-xl border p-4 text-sm text-destructive">
      Không tải được quyền 3K: {access.error.message}
      <Button variant="outline" onClick={() => access.refetch()}>Tải lại</Button>
    </div>}
    {data && !hasArea && <div role="alert" className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
      Chưa được phân công vào khu vực đang áp dụng 3K. Khối Marketing không nằm trong phạm vi áp dụng mặc định; dữ liệu 3K lịch sử không bị xóa.
    </div>}
    {data && hasArea && <>
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {!central && data.can_personal && <Button variant={visibleTab==='mine'?'default':'outline'}
          onClick={() => setTab('mine')}><ClipboardList className="mr-2 h-4 w-4"/>3K của tôi</Button>}
        {canReport && <Button variant={visibleTab==='report'?'default':'outline'}
          onClick={() => setTab('report')}><Users className="mr-2 h-4 w-4"/>Theo dõi {central?'toàn hệ thống':'khu vực'}</Button>}
        {central && data.can_config && <Button variant={visibleTab==='policy'?'default':'outline'}
          onClick={() => setTab('policy')}><Settings2 className="mr-2 h-4 w-4"/>Phạm vi áp dụng</Button>}
      </div>
      {visibleTab === 'mine' && data.can_personal && <div className="space-y-3">
        <div className="rounded-xl border bg-muted/25 p-4 text-sm text-muted-foreground">
          Lập KG, KF và cập nhật KPI cá nhân tại đây. Dữ liệu được ghi vào 3K chung;
          không có bản sao theo từng khối. Quy tắc hạn chốt vẫn lấy từ cấu hình 3K hiện hành.
        </div>
        <Biz3K personalOnly />
      </div>}
      {visibleTab === 'report' && canReport && (central
        ? <K3HubTimingDashboard unit={selectedUnit} units={options}
            canCompany={data.can_company && !areaBlock} onUnitChange={setUnitOverride} />
        : <K3HubReportPanel unit={selectedUnit} units={options}
            canCompany={data.can_company && !areaBlock} onUnitChange={setUnitOverride} />
      )}
      {visibleTab === 'policy' && data.can_config && <K3HubPolicyPanel />}
      {central && <p className="text-xs text-muted-foreground">
        Trung tâm 3K dành cho quản lý xem số liệu, giờ lập, giờ tổng kết và phân tích theo cây tổ chức.
        Nhân viên làm 3K trong khu vực của mình; dữ liệu chỉ được lập một lần và tổng hợp lên cấp quản lý.
      </p>}
    </>}
  </div>;
}

function K3HubReportPanel({ unit, units, canCompany, onUnitChange }: {
  unit: string;
  units: { id: string; name: string; block_name: string; kind: string }[];
  canCompany: boolean;
  onUnitChange: (unit: string) => void;
}) {
  const { user } = useCurrentUser();
  const [date, setDate] = useState(vietnamToday);
  const [status, setStatus] = useState<'all' | K3HubState>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<K3HubPerson | null>(null);
  const report = useQuery({
    queryKey: ['k3hub-report', user?.id, date, unit],
    queryFn: () => k3HubReport(date,unit),
    enabled: !!user?.id && !!unit,
    retry: 1, staleTime: 20_000,
  });
  const filtered = useMemo(() => (report.data?.people ?? []).filter(p =>
    (status==='all' || p.state===status) &&
    p.full_name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))
  ), [report.data, status, search]);
  const totals = k3HubTotals(report.data?.people ?? []);
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1"><Label htmlFor="k3hub-date">Ngày xem</Label>
        <Input id="k3hub-date" type="date" value={date} max={vietnamToday()}
          onChange={e=>setDate(e.target.value)} className="w-44"/></div>
      <div className="min-w-44 flex-1 space-y-1"><Label htmlFor="k3hub-unit">Phạm vi tổ chức</Label>
        <select id="k3hub-unit" value={unit} onChange={e=>{onUnitChange(e.target.value);setSelected(null);}}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          {canCompany && <option value="org-company">Toàn công ty (trừ khối chưa áp dụng)</option>}
          {units.map(u=><option key={u.id} value={u.id}>{u.block_name} · {u.name}</option>)}
        </select>
      </div>
      <Button variant="outline" size="sm" disabled={report.isFetching} onClick={()=>report.refetch()}>
        <RefreshCw className={`mr-2 h-4 w-4 ${report.isFetching?'animate-spin':''}`} />Làm mới
      </Button>
    </div>
    {report.data && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <Stat label="Nhân sự" value={totals.people} />
      <Stat label="Chưa cập nhật" value={totals.pending} />
      <Stat label="Đã xác nhận" value={totals.confirmed} />
      <Stat label="KG" value={totals.goals} />
      <Stat label="KF" value={totals.actions} />
      <Stat label="Kết quả KPI" value={totals.results} />
    </div>}
    <div className="flex flex-wrap gap-2">
      <Input value={search} onChange={e=>setSearch(e.target.value)}
        aria-label="Tìm nhân sự 3K" placeholder="Tìm nhân viên…" className="min-w-40 flex-1 sm:max-w-72" />
      <select aria-label="Lọc trạng thái" value={status}
        onChange={e=>setStatus(e.target.value as typeof status)}
        className="h-10 rounded-md border bg-background px-3 text-sm">
        <option value="all">Tất cả trạng thái</option>
        {Object.entries(K3_HUB_STATES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
      </select>
    </div>
    {report.isPending && <p className="py-6 text-sm text-muted-foreground">Đang tổng hợp dữ liệu 3K…</p>}
    {report.error && <div role="alert" className="rounded-xl border p-4 text-sm text-destructive">
      {report.error.message} <Button variant="outline" onClick={()=>report.refetch()}>Thử lại</Button>
    </div>}
    {report.data && <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{filtered.length} dòng phân công thuộc phạm vi được xem.
        Người có nhiều vị trí chỉ được tính một lần ở chỉ số nhân sự.</p>
      {!filtered.length && <p className="rounded-xl border px-4 py-7 text-center text-sm text-muted-foreground">Chưa có nhân sự hoặc kết quả phù hợp.</p>}
      {filtered.map(p=><button key={`${p.unit_id}:${p.user_id}`} type="button" onClick={()=>setSelected(p)}
          className="w-full rounded-xl border bg-card p-4 text-left hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0"><p className="font-semibold">{p.full_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.block_name} · {p.unit_name} · {p.position}</p></div>
          <Badge variant={statusBadge(p.state)}>{K3_HUB_STATES[p.state]}</Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{p.goals_count} KG · {p.actions_count} KF · {p.results_count} kết quả KPI</p>
      </button>)}
    </div>}
    <p className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
      Trung tâm 3K chỉ tổng hợp dữ liệu đã lưu có nguồn tổ chức xác định.
      Các công việc cũ không đủ thông tin đơn vị không tự bị gán sang phòng khác.
      Không phát sinh chấm lỗi hoặc kỷ luật hồi tố.
    </p>
    <K3HubMemberDialog person={selected} unit={unit} date={date} onClose={()=>setSelected(null)} />
  </div>;
}

function Stat({label,value}:{label:string;value:number}) {
  return <Card><CardContent className="space-y-2 p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold tabular-nums">{value}</p>
  </CardContent></Card>;
}

function K3HubMemberDialog({person,unit,date,onClose}:{
  person: K3HubPerson | null;
  unit: string; date:string; onClose:()=>void;
}) {
  const {user} = useCurrentUser();
  const qc = useQueryClient();
  const [body,setBody] = useState('');
  const details = useQuery({
    queryKey:['k3hub-member',user?.id,person?.user_id,date,unit],
    queryFn:()=>k3HubDetails(person!.user_id,date,unit),
    enabled:!!person, retry:1, staleTime:15_000,
  });
  const save = useMutation({
    mutationFn:()=>k3HubFeedbackSave(person!.user_id,date,unit,body),
    onSuccess:async()=>{setBody('');toast.success('Đã ghi nhận nhận xét.');await qc.invalidateQueries({queryKey:['k3hub-member']});},
    onError:e=>toast.error(e instanceof Error?e.message:'Không thể lưu nhận xét.'),
  });
  return <Dialog open={!!person} onOpenChange={open=>{if(!open){setBody('');onClose();}}}>
    <DialogContent className="max-h-[88dvh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto">
      <DialogHeader><DialogTitle>3K {person?.full_name} · {date.split('-').reverse().join('/')}</DialogTitle></DialogHeader>
      {details.isPending && <p className="py-6 text-sm text-muted-foreground">Đang đọc KG/KF/KPI…</p>}
      {details.error && <p className="text-sm text-destructive">{details.error.message}</p>}
      {details.data && <div className="space-y-5 text-sm">
        <section className="space-y-2"><h3 className="font-semibold">KG · Mục tiêu ({details.data.goals.length})</h3>
          {!details.data.goals.length && <p className="text-muted-foreground">Chưa có KG thuộc phạm vi này.</p>}
          {details.data.goals.map(g=><div className="rounded-lg border p-3" key={g.id}>
            <p className="font-medium">{g.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{g.status} · Hạn {g.due_date??'—'}</p>
            {g.expected_result && <p className="mt-1">{g.expected_result}</p>}
          </div>)}
        </section>
        <section className="space-y-2"><h3 className="font-semibold">KF · Việc thực thi ({details.data.actions.length})</h3>
          {!details.data.actions.length && <p className="text-muted-foreground">Chưa có KF thuộc phạm vi này.</p>}
          {details.data.actions.map(a=><div className="rounded-lg border p-3" key={a.id}>
            <p className="font-medium">{a.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{a.goal_name} · {a.status}</p>
          </div>)}
        </section>
        <section className="space-y-2"><h3 className="font-semibold">KPI · Kết quả thực tế ({details.data.results.length})</h3>
          {!details.data.results.length && <p className="text-muted-foreground">Chưa có kết quả KPI thuộc phạm vi này.</p>}
          {details.data.results.map((r,i)=><div key={i} className="rounded-lg border p-3">
            <p className="font-medium">{r.name}</p>
            <p>Thực tế: <strong>{r.value??'Chưa có'} {r.unit??''}</strong>
              {r.target==null?'':` / Mục tiêu: ${r.target} ${r.unit??''}`}</p>
            {r.note && <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>}
          </div>)}
        </section>
        {details.data.day?.summary_note && <section className="rounded-lg border p-3">
          <h3 className="mb-1 font-semibold">Tổng kết ngày</h3>
          <p className="whitespace-pre-wrap">{details.data.day.summary_note}</p>
        </section>}
        <section className="space-y-2 border-t pt-3">
          <h3 className="flex items-center gap-2 font-semibold"><MessageSquareText className="h-4 w-4" />Nhận xét quản lý</h3>
          {details.data.feedback.map(f=><div className="rounded-lg border p-3" key={f.id}>
            <p className="whitespace-pre-wrap">{f.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.author_name} · {new Date(f.created_at).toLocaleString('vi-VN')}</p>
          </div>)}
          {!details.data.feedback.length && <p className="text-muted-foreground">Chưa có nhận xét.</p>}
          {details.data.can_comment && <div className="space-y-2">
            <Label htmlFor="k3hub-comment">Nhận xét (tối đa 2.000 ký tự)</Label>
            <Textarea id="k3hub-comment" value={body} onChange={e=>setBody(e.target.value)}
              maxLength={2000} rows={3} placeholder="Nhận xét kết quả và hướng dẫn cải thiện…" />
            <Button disabled={!body.trim()||save.isPending} onClick={()=>save.mutate()}>
              {save.isPending?'Đang lưu…':'Lưu nhận xét'}
            </Button>
          </div>}
        </section>
      </div>}
    </DialogContent>
  </Dialog>;
}

function K3HubPolicyPanel() {
  const qc = useQueryClient();
  const query = useQuery({queryKey:['k3hub-policy'],queryFn:k3HubPolicyRead,retry:1});
  if(query.isPending)return <p className="py-6 text-sm text-muted-foreground">Đang tải phạm vi áp dụng 3K…</p>;
  if(query.error)return <div className="text-sm text-destructive">{query.error.message}<Button onClick={()=>query.refetch()}>Thử lại</Button></div>;
  return <PolicyEditor key={String(query.data.revision)} policy={query.data} onSaved={async()=>{
    await qc.invalidateQueries({queryKey:['k3hub-policy']});
    await qc.invalidateQueries({queryKey:['k3hub-access']});
    await qc.invalidateQueries({queryKey:['k3hub-report']});
  }}/>;
}

function PolicyEditor({policy,onSaved}:{policy:K3HubPolicy;onSaved:()=>Promise<void>}) {
  const [blocks,setBlocks]=useState<string[]>(policy.applied_block_ids);
  const [date,setDate]=useState(policy.effective_from>=policy.today?policy.effective_from:policy.today);
  const [reason,setReason]=useState('');
  const save=useMutation({
    mutationFn:()=>k3HubPolicySave(policy.revision,date,blocks,reason),
    onSuccess:async()=>{toast.success('Đã lưu phiên bản chính sách 3K.');await onSaved();},
    onError:e=>toast.error(e instanceof Error?e.message:'Không lưu được chính sách.'),
  });
  return <section className="max-w-2xl space-y-4">
    <div className="rounded-xl border bg-muted/20 p-4 text-sm">
      <p className="font-semibold">Áp dụng 3K theo Khối</p>
      <p className="mt-1 text-muted-foreground">Các Khối được chọn sẽ xuất hiện trong báo cáo chung và khu vực.
        Marketing mặc định không chọn. Đây là chính sách phạm vi hiển thị, chưa tự kích hoạt
        chế tài, nhắc hạn hoặc áp nghĩa vụ hồi tố trong hệ thống 3K cũ.</p>
    </div>
    <div className="space-y-2">{policy.blocks.map(block=><label key={block.id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card p-3 text-sm">
      <span className="flex items-center gap-2"><Building2 className="h-4 w-4"/>{block.name}</span>
      <input type="checkbox" className="size-4 accent-primary"
        checked={blocks.includes(block.id)} onChange={e=>setBlocks(curr=>e.target.checked?
          [...curr,block.id]:curr.filter(x=>x!==block.id))}/>
    </label>)}</div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1"><Label htmlFor="k3hub-effective">Ngày bắt đầu hiệu lực</Label>
        <Input id="k3hub-effective" type="date" min={policy.today} value={date}
          onChange={e=>setDate(e.target.value)}/></div>
      <div className="space-y-1"><Label htmlFor="k3hub-reason">Lý do thay đổi</Label>
        <Input id="k3hub-reason" value={reason} onChange={e=>setReason(e.target.value)}
          placeholder="Ví dụ: Kích hoạt 3K cho Khối Vận hành"/></div>
    </div>
    <p className="text-xs text-muted-foreground">Phiên bản #{policy.revision} · Lịch sử các phiên bản không bị xóa.
      Việc chọn Khối mới không tự động cấp quyền nhân sự và không sửa lịch sử 3K.</p>
    <Button disabled={save.isPending||reason.trim().length<5||!date}
      onClick={()=>save.mutate()}><CheckCircle2 className="mr-2 h-4 w-4"/>
      {save.isPending?'Đang lưu…':'Lưu phạm vi áp dụng'}
    </Button>
  </section>;
}
