import {useEffect,useMemo,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {toast} from 'sonner';
import {ExternalLink,Eye,FileText,RefreshCw,Search} from 'lucide-react';
import {useAuth,useCurrentUser} from '@/lib/auth';
import {documentsQuery,useDocumentOpen} from '@/lib/biz/documentQueries';
import {deadlineStatus,docStatusLabel,manageRank,myPlanRank,periodLabel,TIME_STATUS,VIEW_STATUS,viewTone,type DocRow,type PeriodKind,type ViewStatus} from '@/lib/biz/documents';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {DocumentDialog} from './BizDocuments';

const dateText=(v:string|null)=>v?new Date(v).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'Chưa quy định';
type Quick='all'|'submitted'|'unsubmitted'|'ontime'|'late'|'overdue'|'changes'|'unviewed';
const QUICK_LABEL:Record<Quick,string>={all:'Tổng cần nộp',submitted:'Đã nộp',unsubmitted:'Chưa nộp',ontime:'Đúng hạn',late:'Nộp muộn',overdue:'Quá hạn chưa nộp',changes:'Cần chỉnh sửa',unviewed:'Mới chưa xem'};
function quickMatch(row:DocRow,quick:Quick){const time=deadlineStatus(row.deadline,row.document?.first_submitted_at??null,row.server_now);const status=row.document?.versions.at(-1)?.status;switch(quick){case 'all':return true;case 'submitted':return !!row.document?.first_submitted_at;case 'unsubmitted':return !row.document?.first_submitted_at;case 'ontime':return time==='ontime';case 'late':return time==='late';case 'overdue':return time==='overdue';case 'changes':return status==='changes';case 'unviewed':return !!row.document?.first_submitted_at&&(row.my_view==='unopened'||row.my_view==='new_version');}}

export function BizPlans(){
 const uid=useAuth(s=>s.currentUserId)??'';const {can}=useCurrentUser();
 const [periodKind,setPeriodKind]=useState<PeriodKind>('month');const [year,setYear]=useState(new Date().getFullYear());const [period,setPeriod]=useState(new Date().getMonth()+1);
 const [quick,setQuick]=useState<Quick>('all');const [dept,setDept]=useState('all');const [employee,setEmployee]=useState('all');const [status,setStatus]=useState('all');const [view,setView]=useState('all');const [search,setSearch]=useState('');const [selected,setSelected]=useState<string|null>(null);
 const query=useQuery({...documentsQuery(uid,'plan',periodKind,year,period),enabled:!!uid});const rows=useMemo(()=>query.data??[],[query.data]);
 const myRow=rows.find(r=>r.user_id===uid);const teamRows=useMemo(()=>rows.filter(r=>r.user_id!==uid),[rows,uid]);
 const canManage=can('biz.view_all')||can('biz.view_dept')||can('biz.plan_approve')||can('biz.plan_request_revision');
 const showTeam=canManage&&teamRows.length>0;
 const max=periodKind==='month'?12:periodKind==='quarter'?4:1;
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const pk=params.get('period_kind'),y=Number(params.get('year')),p=Number(params.get('period'));if(pk==='month'||pk==='quarter'||pk==='year'){setPeriodKind(pk);if(y>=2000&&y<=2200)setYear(y);if(p>=1&&p<=(pk==='month'?12:pk==='quarter'?4:1))setPeriod(p);}const user=params.get('user');if(user)setSelected(user);if(params.get('view')==='unviewed')setQuick('unviewed');},[uid]);
 const departments=useMemo(()=>[...new Map(teamRows.map(r=>[r.department_id,r.department_name])).entries()],[teamRows]);
 const shown=useMemo(()=>teamRows.filter(r=>quickMatch(r,quick)&&(dept==='all'||r.department_id===dept)&&(employee==='all'||r.user_id===employee)&&(status==='all'||(r.document?.versions.at(-1)?.status??'missing')===status)&&(view==='all'||r.my_view===view)&&(!search.trim()||r.employee_name.toLowerCase().includes(search.trim().toLowerCase()))).sort((a,b)=>manageRank(a)-manageRank(b)||a.employee_name.localeCompare(b.employee_name,'vi')),[teamRows,quick,dept,employee,status,view,search]);
 const selectedRow=rows.find(r=>r.user_id===selected);
 return <div className="space-y-6 pb-32 sm:pb-8">
  <div className="flex flex-wrap gap-3 items-center border-b pb-4"><Tabs value={periodKind} onValueChange={v=>{setPeriodKind(v as PeriodKind);setPeriod(1);setSelected(null);}}><TabsList><TabsTrigger value="month">Tháng</TabsTrigger><TabsTrigger value="quarter">Quý</TabsTrigger><TabsTrigger value="year">Năm</TabsTrigger></TabsList></Tabs><Input aria-label="Năm" className="w-28" type="number" min={2000} max={2200} value={year} onChange={e=>{const n=Number(e.target.value);if(n>=2000&&n<=2200){setYear(n);setSelected(null);}}}/>{max>1&&<Select value={String(period)} onValueChange={v=>{setPeriod(Number(v));setSelected(null);}}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent>{Array.from({length:max},(_,i)=><SelectItem key={i} value={String(i+1)}>{periodKind==='month'?'Tháng':'Quý'} {i+1}</SelectItem>)}</SelectContent></Select>}<Button variant="ghost" size="icon" aria-label="Làm mới" onClick={()=>query.refetch()}><RefreshCw className="h-4 w-4"/></Button></div>
  {query.isPending&&<p>Đang tải…</p>}{query.error&&<p role="alert" className="text-destructive">Không tải được: {query.error.message}</p>}
  {!query.isPending&&myRow&&<MyPlanCard row={myRow} periodKind={periodKind} year={year} period={period} onOpen={()=>setSelected(uid)}/>}
  {!query.isPending&&!myRow&&!showTeam&&<div className="py-10 border-y space-y-3"><FileText className="h-8 w-8 text-muted-foreground"/><p>Bạn không thuộc diện nộp kế hoạch trong kỳ đang chọn.</p></div>}
  {showTeam&&<section className="space-y-4">
   <h2 className="text-lg font-semibold">Kế hoạch trong phạm vi quản lý</h2>
   <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">{(Object.keys(QUICK_LABEL) as Quick[]).map(key=>{const count=teamRows.filter(r=>quickMatch(r,key)).length;return <button key={key} type="button" onClick={()=>setQuick(quick===key?'all':key)} className={`border rounded-lg p-3 text-left transition-colors ${quick===key?'border-primary bg-primary/5':'bg-card hover:border-primary/40'}`}><p className="text-xs text-muted-foreground">{QUICK_LABEL[key]}</p><strong className="text-xl tabular-nums">{count}</strong></button>;})}</div>
   <div className="flex flex-wrap gap-2 items-center">
    <div className="relative"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Tìm nhân sự" placeholder="Tìm theo tên…" className="pl-9 w-52" value={search} onChange={e=>setSearch(e.target.value)}/></div>
    {departments.length>1&&<Select value={dept} onValueChange={setDept}><SelectTrigger aria-label="Phòng ban" className="w-44"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tất cả phòng ban</SelectItem>{departments.map(([id,name])=><SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>}
    <Select value={employee} onValueChange={setEmployee}><SelectTrigger aria-label="Nhân viên" className="w-44"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tất cả nhân viên</SelectItem>{teamRows.map(r=><SelectItem key={r.user_id} value={r.user_id}>{r.employee_name}</SelectItem>)}</SelectContent></Select>
    <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Trạng thái nộp" className="w-44"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Mọi trạng thái nộp</SelectItem><SelectItem value="missing">Chưa nộp</SelectItem><SelectItem value="draft">Bản nháp</SelectItem><SelectItem value="pending">Đã nộp</SelectItem><SelectItem value="changes">Cần chỉnh sửa</SelectItem><SelectItem value="resubmitted">Đã nộp lại</SelectItem></SelectContent></Select>
    <Select value={view} onValueChange={setView}><SelectTrigger aria-label="Trạng thái xem" className="w-44"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Mọi trạng thái xem</SelectItem>{(Object.entries(VIEW_STATUS) as [ViewStatus,string][]).map(([id,name])=><SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>
   </div>
   {!shown.length&&<p className="text-sm text-muted-foreground py-6">Không có kế hoạch khớp bộ lọc.</p>}
   <div className="hidden md:block overflow-x-auto border rounded-lg"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground border-b"><th className="py-2 px-3">Nhân sự</th><th className="py-2 px-3">Đơn vị</th><th className="py-2 px-3">Kỳ</th><th className="py-2 px-3">Hạn nộp</th><th className="py-2 px-3">Trạng thái nộp</th><th className="py-2 px-3">Trạng thái xem</th><th className="py-2 px-3">Thao tác</th></tr></thead><tbody>{shown.map(r=><PlanRow key={r.user_id} row={r} periodKind={periodKind} year={year} period={period} onOpen={()=>setSelected(r.user_id)}/>)}</tbody></table></div>
   <div className="md:hidden grid gap-3">{shown.map(r=><PlanCard key={r.user_id} row={r} periodKind={periodKind} year={year} period={period} onOpen={()=>setSelected(r.user_id)}/>)}</div>
  </section>}
  {selectedRow&&<DocumentDialog key={`${selectedRow.user_id}-plan-${periodKind}-${year}-${period}`} row={selectedRow} uid={uid} kind="plan" periodKind={periodKind} year={year} period={period} onClose={()=>setSelected(null)}/>}
 </div>;
}

function useOpenDocument(){const open=useDocumentOpen();return async(versionId:string)=>{const win=window.open('','_blank');try{const url=await open.mutateAsync(versionId);if(win){win.location.href=url;}else{window.location.href=url;}}catch(e){win?.close();toast.error(e instanceof Error?e.message:String(e));}};}

function StatusBadges({row}:{row:DocRow}){const time=deadlineStatus(row.deadline,row.document?.first_submitted_at??null,row.server_now);const version=row.document?.versions.at(-1);return <div className="flex flex-wrap gap-2"><Badge variant="outline" className={['late','overdue'].includes(time)?'text-destructive border-destructive/40':time==='ontime'?'text-success border-success/40':time==='soon'?'text-warning border-warning/40':''}>{TIME_STATUS[time]}</Badge><Badge variant="secondary">{version?docStatusLabel('plan',version.status):'Chưa nộp'}</Badge><Badge variant="outline" className={viewTone(row.my_view)}>{VIEW_STATUS[row.my_view]}</Badge></div>;}

function MyPlanCard({row,periodKind,year,period,onOpen}:{row:DocRow;periodKind:PeriodKind;year:number;period:number;onOpen:()=>void}){
 const version=row.document?.versions.at(-1);const openDoc=useOpenDocument();const rank=myPlanRank(row);
 return <section className="space-y-3"><h2 className="text-lg font-semibold">Kế hoạch của tôi</h2>
  <div className={`border rounded-lg bg-card p-4 space-y-3 max-w-xl ${rank<=1?'border-warning/60':''}`}>
   <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Kế hoạch {periodLabel(periodKind,year,period)}</h3><StatusBadges row={row}/></div>
   <p className="text-sm text-muted-foreground">Hạn nộp: {dateText(row.deadline)} (giờ Việt Nam)</p>
   {row.document?.last_submitted_at&&<p className="text-xs text-muted-foreground">Nộp gần nhất: {dateText(row.document.last_submitted_at)}</p>}
   <div className="flex flex-wrap gap-2"><Button size="sm" onClick={onOpen}>{version?'Xem / cập nhật hồ sơ':'Nộp kế hoạch'}</Button>{version?.url&&<Button size="sm" variant="outline" onClick={()=>openDoc(version.id)}><ExternalLink className="h-4 w-4 mr-2"/>Mở tài liệu</Button>}</div>
  </div></section>;
}

function PlanActions({row,onOpen}:{row:DocRow;onOpen:()=>void}){
 const version=row.document?.versions.at(-1);const openDoc=useOpenDocument();
 return <div className="flex flex-wrap gap-2">{version?.url&&<Button size="sm" variant="outline" onClick={()=>openDoc(version.id)}><ExternalLink className="h-4 w-4 mr-2"/>Xem tài liệu</Button>}<Button size="sm" variant="ghost" onClick={onOpen}><Eye className="h-4 w-4 mr-2"/>Hồ sơ</Button></div>;
}

function PlanRow({row,periodKind,year,period,onOpen}:{row:DocRow;periodKind:PeriodKind;year:number;period:number;onOpen:()=>void}){
 return <tr className="border-t align-top"><td className="py-2 px-3 font-medium">{row.employee_name}</td><td className="py-2 px-3">{row.department_name}</td><td className="py-2 px-3 whitespace-nowrap">{periodLabel(periodKind,year,period)}</td><td className="py-2 px-3 whitespace-nowrap">{dateText(row.deadline)}</td><td className="py-2 px-3"><StatusBadges row={row}/></td><td className="py-2 px-3"><Badge variant="outline" className={viewTone(row.my_view)}>{VIEW_STATUS[row.my_view]}</Badge></td><td className="py-2 px-3"><PlanActions row={row} onOpen={onOpen}/></td></tr>;
}

function PlanCard({row,periodKind,year,period,onOpen}:{row:DocRow;periodKind:PeriodKind;year:number;period:number;onOpen:()=>void}){
 return <div className="border rounded-lg bg-card p-4 space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold break-words">{row.employee_name}</h3><p className="text-xs text-muted-foreground">{row.department_name} · {periodLabel(periodKind,year,period)}</p></div><StatusBadges row={row}/></div><p className="text-xs text-muted-foreground">Hạn: {dateText(row.deadline)}</p><PlanActions row={row} onOpen={onOpen}/></div>;
}
