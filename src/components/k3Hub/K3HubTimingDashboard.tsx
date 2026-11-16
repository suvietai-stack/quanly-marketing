import { useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarClock, CheckCircle2, Clock3, RefreshCw, Users, AlertCircle, ClipboardList } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  k3TimingRead, timingDaily, timingTotals, uniqueEmployeeDays,
  timeInVietnam, dateInVietnam, type K3TimingEntry,
} from '@/lib/k3Hub/timing';

const vnToday = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (p:string) => parts.find(part=>part.type===p)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};
function shift(date: string, days: number) {
  const stamp = new Date(`${date}T12:00:00Z`);
  stamp.setUTCDate(stamp.getUTCDate() + days);
  return stamp.toISOString().slice(0,10);
}
type Window = 'today' | 'seven' | 'thirty';
type Filter = 'all' | 'late_plan' | 'late_summary' | 'no_plan' | 'no_summary' | 'work_only';
function timingStatus(item: K3TimingEntry, kind: 'plan' | 'summary') {
  const status = kind==='plan' ? item.plan_status : item.summary_status;
  const recorded = kind==='plan' ? item.planned_at : item.summarized_at;
  if (status==='on_time') return {label:'Đúng hạn',tone:'secondary' as const};
  if (status==='late') return {label:'Sau mốc giờ',tone:'destructive' as const};
  if (kind==='plan' && status==='work_only') return {label:'Có việc, chưa ghi mốc lập',tone:'outline' as const};
  if (!recorded) return {label:'Chưa ghi nhận',tone:'outline' as const};
  return {label:'Chưa có dữ liệu',tone:'outline' as const};
}

export function K3HubTimingDashboard({unit,units,canCompany,onUnitChange}: {
  unit: string;
  units: {id:string;name:string;block_name:string;kind:string}[];
  canCompany: boolean;
  onUnitChange: (unit:string)=>void;
}) {
  const {user} = useCurrentUser();
  const [window,setWindow] = useState<Window>('seven');
  const [endDate,setEndDate] = useState(vnToday);
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState<Filter>('all');
  const startDate = shift(endDate,window==='thirty'?-29:window==='seven'?-6:0);
  const query = useQuery({
    queryKey:['k3hub-timing',user?.id,unit,startDate,endDate],
    queryFn:()=>k3TimingRead(startDate,endDate,unit),
    enabled:!!user?.id && !!unit,
    staleTime:30_000,retry:1,
  });
  const rows = query.data?.rows ?? [];
  const totals = useMemo(()=>timingTotals(rows),[rows]);
  const days = useMemo(()=>timingDaily(rows),[rows]);
  const selected = useMemo(()=>rows.filter(item =>
    item.full_name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')) &&
    (filter==='all'
      || filter==='late_plan' && item.plan_status==='late'
      || filter==='late_summary' && item.summary_status==='late'
      || filter==='no_plan' && item.plan_status==='no_record'
      || filter==='no_summary' && item.summary_status==='no_record'
      || filter==='work_only' && item.plan_status==='work_only')
  ),[rows,search,filter]);
  const visible = useMemo(()=>uniqueEmployeeDays(selected),[selected]);

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-52 flex-1 space-y-1">
        <Label htmlFor="k3-timing-unit">Phạm vi báo cáo theo sơ đồ tổ chức</Label>
        <select id="k3-timing-unit" className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          value={unit} onChange={e=>onUnitChange(e.target.value)}>
          {canCompany && <option value="org-company">Toàn công ty (các khối áp dụng 3K)</option>}
          {units.map(x=><option key={x.id} value={x.id}>{x.block_name} · {x.name}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="k3-timing-end-date">Ngày kết thúc</Label>
        <Input id="k3-timing-end-date" type="date" max={vnToday()} value={endDate}
          onChange={e=>setEndDate(e.target.value || vnToday())} className="w-44" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="k3-timing-window">Khoảng thống kê</Label>
        <select id="k3-timing-window" className="h-10 rounded-md border bg-background px-3 text-sm"
          value={window} onChange={e=>setWindow(e.target.value as Window)}>
          <option value="today">1 ngày</option>
          <option value="seven">7 ngày</option>
          <option value="thirty">30 ngày</option>
        </select>
      </div>
      <Button variant="outline" size="sm" onClick={()=>query.refetch()} disabled={!unit || query.isFetching}>
        <RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching?'animate-spin':''}`} />Làm mới
      </Button>
    </div>
    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <CalendarClock className="h-4 w-4" />
      Kỳ {dateInVietnam(startDate)} – {dateInVietnam(endDate)} · Giờ Việt Nam (UTC+7)
      {query.data && <span>· Mốc tham chiếu lập {query.data.plan_by.slice(0,5)}, tổng kết {query.data.summary_by.slice(0,5)}</span>}
    </p>
    {query.isPending && <div role="status" className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">Đang đọc thống kê thời gian thực hiện 3K theo phạm vi quản lý…</div>}
    {query.error && <div role="alert" className="space-y-2 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
      <p>Không tải được bảng thống kê giờ 3K: {query.error.message}</p>
      <Button variant="outline" size="sm" onClick={()=>query.refetch()}>Thử lại</Button>
    </div>}
    {query.data && <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric icon={<Users className="h-4 w-4"/>} label="Lượt nhân sự / ngày" value={totals.peopleDays} note="Không đếm trùng kiêm nhiệm"/>
        <Metric icon={<ClipboardList className="h-4 w-4"/>} label="Có giờ lập 3K" value={totals.planned} note={`${totals.planOnTime} đúng mốc`}/>
        <Metric icon={<Clock3 className="h-4 w-4"/>} label="Lập sau mốc" value={totals.planLate} note="Theo giờ lập được lưu"/>
        <Metric icon={<CheckCircle2 className="h-4 w-4"/>} label="Đã tổng kết" value={totals.summarized} note={`${totals.summaryOnTime} đúng mốc`}/>
        <Metric icon={<AlertCircle className="h-4 w-4"/>} label="Tổng kết sau mốc" value={totals.summaryLate} note="Theo xác nhận hoặc lịch sử"/>
        <Metric icon={<BarChart3 className="h-4 w-4"/>} label="Có KG/KF, thiếu giờ lập" value={totals.hasWorkOnly} note="Không quy thành trễ"/>
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-4">
        <div>
          <h3 className="font-semibold">Xu hướng lập và tổng kết 3K theo ngày</h3>
          <p className="mt-1 text-xs text-muted-foreground">Mỗi lượt nhân viên chỉ tính một lần trong ngày; màu thể hiện số lượt có dấu thời gian thực tế.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />Có giờ lập</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />Đã tổng kết</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />Có KG/KF nhưng thiếu giờ lập</span>
        </div>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {days.length===0 && <p className="py-6 text-center text-sm text-muted-foreground">Không có nhân sự thuộc phạm vi hoặc chưa có dữ liệu trong kỳ.</p>}
          {days.map(d=><div key={d.date} className="grid grid-cols-[4.6rem_minmax(0,1fr)_2.4rem] items-center gap-3 text-xs">
            <span className="tabular-nums text-muted-foreground">{dateInVietnam(d.date).slice(0,5)}</span>
            <div className="space-y-1.5" aria-label={`${d.date}: ${d.planned} lập, ${d.summarized} tổng kết, ${d.hasWorkOnly} chỉ có công việc`}>
              <div className="h-2.5 w-full rounded bg-muted"><div className="h-2.5 rounded bg-primary" style={{width:`${d.peopleDays?100*d.planned/d.peopleDays:0}%`}} /></div>
              <div className="h-2.5 w-full rounded bg-muted"><div className="h-2.5 rounded bg-emerald-600" style={{width:`${d.peopleDays?100*d.summarized/d.peopleDays:0}%`}} /></div>
              {d.hasWorkOnly>0 && <div className="h-1.5 w-full rounded bg-muted"><div className="h-1.5 rounded bg-amber-500" style={{width:`${d.peopleDays?100*d.hasWorkOnly/d.peopleDays:0}%`}} /></div>}
            </div>
            <span className="text-right tabular-nums text-muted-foreground">{d.peopleDays}</span>
          </div>)}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Bảng giờ lập / giờ tổng kết của nhân viên</h3>
            <p className="mt-1 text-xs text-muted-foreground">Xem đúng đơn vị được phân công trong sơ đồ tổ chức.</p>
          </div>
          <Badge variant="outline">{visible.length} lượt nhân sự · {selected.length} dòng vị trí</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input value={search} onChange={e=>setSearch(e.target.value)}
            aria-label="Tìm nhân viên thống kê 3K" placeholder="Tìm tên nhân viên…" className="min-w-40 flex-1 sm:max-w-72"/>
          <select aria-label="Lọc theo tình trạng giờ 3K" value={filter}
            onChange={e=>setFilter(e.target.value as Filter)}
            className="h-10 max-w-full rounded-md border bg-background px-3 text-sm">
            <option value="all">Tất cả ghi nhận</option>
            <option value="late_plan">Lập sau mốc giờ</option>
            <option value="late_summary">Tổng kết sau mốc giờ</option>
            <option value="work_only">Có công việc, chưa ghi giờ lập</option>
            <option value="no_plan">Chưa ghi nhận lập 3K</option>
            <option value="no_summary">Chưa ghi nhận tổng kết</option>
          </select>
        </div>
        <div className="max-h-[640px] overflow-auto rounded-xl border">
          <table className="w-full min-w-[970px] text-sm">
            <thead className="sticky top-0 z-10 bg-muted/95 text-left text-xs">
              <tr>
                <th className="px-3 py-3 font-medium">Ngày</th>
                <th className="min-w-44 px-3 py-3 font-medium">Nhân viên / đơn vị</th>
                <th className="px-3 py-3 font-medium">Giờ lập 3K</th>
                <th className="px-3 py-3 font-medium">Mốc lập</th>
                <th className="px-3 py-3 font-medium">Đánh giá mốc lập</th>
                <th className="px-3 py-3 font-medium">Giờ tổng kết</th>
                <th className="px-3 py-3 font-medium">Mốc tổng kết</th>
                <th className="px-3 py-3 font-medium">Đánh giá tổng kết</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {selected.map(x=><tr key={`${x.date}:${x.user_id}:${x.unit_id}`} className="align-top hover:bg-muted/30">
                <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums">{dateInVietnam(x.date)}</td>
                <td className="px-3 py-3">
                  <p className="font-medium">{x.full_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{x.block_name} · {x.unit_name}</p>
                  {x.multi_unit && <p className="mt-1 text-[11px] text-muted-foreground">Kiêm nhiệm</p>}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  <p className="font-semibold">{timeInVietnam(x.planned_at)}</p>
                  {!x.planned_at && x.work_created_at && <p className="mt-1 max-w-32 text-xs text-muted-foreground">KG/KF tạo lúc {timeInVietnam(x.work_created_at)} (không phải giờ xác nhận lập)</p>}
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{timeInVietnam(x.plan_deadline)}</td>
                <td className="px-3 py-3"><TimingBadge item={x} kind="plan"/></td>
                <td className="px-3 py-3 tabular-nums">
                  <p className="font-semibold">{timeInVietnam(x.summarized_at)}</p>
                  {x.summary_source==='employee_review' && <p className="mt-1 text-[11px] text-muted-foreground">Xác nhận tổng kết</p>}
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{timeInVietnam(x.summary_deadline)}</td>
                <td className="px-3 py-3"><TimingBadge item={x} kind="summary"/></td>
              </tr>)}
              {selected.length===0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">Không có bản ghi phù hợp với bộ lọc.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <p className="rounded-lg border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
        <strong>Lưu ý:</strong> Giờ lập chỉ được xác nhận khi có dấu thời gian <code>planned_at</code>.
        Giờ tạo KG/KF là dữ liệu tham khảo, không thay thế xác nhận lập.
        Giờ tổng kết lấy từ xác nhận tổng kết mới hoặc lịch sử chốt ngày.
        Mốc giờ căn cứ quy định 3K và thời hạn lưu trong bản ghi (nếu có).
        Dòng chưa có dữ liệu không tự đồng nghĩa với vi phạm; không phát sinh phạt hoặc nhắc hạn hồi tố.
      </p>
    </>}
  </div>;
}

function Metric({icon,label,value,note}:{icon:ReactNode;label:string;value:number;note:string}) {
  return <Card>
    <CardContent className="space-y-2 p-3 sm:p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{note}</p>
    </CardContent>
  </Card>;
}
function TimingBadge({item,kind}:{item:K3TimingEntry;kind:'plan'|'summary'}) {
  const s=timingStatus(item,kind);
  return <Badge variant={s.tone} className="max-w-40 whitespace-normal text-left leading-4">{s.label}</Badge>;
}
