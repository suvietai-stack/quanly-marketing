import {Link} from '@tanstack/react-router';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Badge} from '@/components/ui/badge';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {useAuth,useCurrentUser} from '@/lib/auth';
import {discipline,type DashboardData} from '@/lib/biz/dashboard';
import {plansUnviewedQuery} from '@/lib/biz/documentQueries';
import {TIME_STATUS,docStatusLabel} from '@/lib/biz/documents';
import {DistributionChart} from './BizDashboardCharts';
export function BizDashboardDiscipline({data}:{data:DashboardData}){
 const [kind,setKind]=useState<'plan'|'report'>('report');const [filter,setFilter]=useState('all');
 const rows=data.obligations.filter(r=>r.kind===kind);const s=discipline(rows);
 const shown=rows.filter(r=>filter==='all'||r.time_status===filter||r.approval_status===filter);
 const uid=useAuth(st=>st.currentUserId)??'';const {can}=useCurrentUser();
 const canManage=can('biz.view_all')||can('biz.view_dept')||can('biz.plan_approve')||can('biz.plan_request_revision');
 const unviewed=useQuery({...plansUnviewedQuery(uid,data.year,data.period_kind,data.period),enabled:kind==='plan'&&canManage&&!!uid});
 const stats:[string,string|number][]=kind==='plan'?[['Phải nộp',s.required],['Đã nộp',s.submitted],['Chưa nộp',s.required-s.submitted],['Nộp đúng hạn',s.ontime],['Nộp muộn',s.late],['Quá hạn chưa nộp',s.overdue],['Đang yêu cầu chỉnh sửa',s.changes],['Đã nộp lại',s.resubmitted]]:[['Cần nộp',s.required],['Đã nộp',s.submitted],['Đúng hạn',s.ontime],['Nộp muộn',s.late],['Quá hạn chưa nộp',s.overdue],['Tỷ lệ đúng hạn',s.required?`${(s.ontime/s.required*100).toLocaleString('vi-VN',{maximumFractionDigits:1})}%`:'—']];
 return <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><Tabs value={kind} onValueChange={v=>setKind(v as typeof kind)}><TabsList><TabsTrigger value="report">Báo cáo</TabsTrigger><TabsTrigger value="plan">Kế hoạch</TabsTrigger></TabsList></Tabs><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-full sm:w-52" aria-label="Tình trạng hồ sơ"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tất cả tình trạng</SelectItem>{Object.entries(TIME_STATUS).map(([v,label])=><SelectItem value={v} key={v}>{label}</SelectItem>)}{kind==='plan'?<><SelectItem value="changes">Đang có yêu cầu chỉnh sửa</SelectItem><SelectItem value="resubmitted">Đã nộp lại</SelectItem></>:<><SelectItem value="pending">Đang đề nghị điều chỉnh</SelectItem><SelectItem value="changes">Điều chỉnh cần bổ sung</SelectItem></>}</SelectContent></Select></div>
 <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">{stats.map(([label,value])=><div key={label} className="border rounded-lg bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><strong className="text-2xl tabular-nums">{value}</strong></div>)}{kind==='plan'&&canManage&&<Link to="/biz/plans" search={{year:data.year,period_kind:data.period_kind,period:data.period,view:'unviewed'} as never} className="border rounded-lg bg-card p-4 block hover:border-primary/40 transition-colors"><p className="text-xs text-muted-foreground">Kế hoạch chưa mở của tôi</p><strong className="text-2xl tabular-nums">{unviewed.data??'…'}</strong></Link>}</div>
 <DistributionChart rows={[{name:'Đúng hạn',value:s.ontime},{name:'Nộp muộn',value:s.late},{name:'Quá hạn chưa nộp',value:s.overdue},{name:'Sắp đến hạn',value:s.soon},{name:'Chưa đến hạn',value:s.upcoming},{name:'Chưa cấu hình hạn',value:s.none}]}/>
 <div className="border-t divide-y">{shown.map(r=><div key={r.user_id} className="py-4 flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><strong className="text-sm break-words">{r.employee_name}</strong><p className="text-xs text-muted-foreground mt-1">{r.department_name}</p></div><div className="flex flex-wrap gap-2 items-center"><Badge variant="outline" className={r.time_status==='overdue'?'text-destructive':r.time_status==='ontime'?'text-success':r.time_status==='late'?'text-warning':'text-muted-foreground'}>{TIME_STATUS[r.time_status as keyof typeof TIME_STATUS]}</Badge><Badge variant="secondary">{r.first_submitted_at||r.approval_status==='draft'?docStatusLabel(kind,r.approval_status):'Chưa nộp'}</Badge><Button asChild size="icon" variant="ghost" aria-label={`Mở hồ sơ ${r.employee_name}`}><Link to={kind==='plan'?'/biz/plans':'/biz/reports'} search={{year:data.year,period_kind:data.period_kind,period:data.period,user:r.user_id} as never}><ArrowUpRight className="h-4 w-4"/></Link></Button></div></div>)}</div>
 {!shown.length&&<p className="text-sm text-muted-foreground py-8">Không có nhân viên thuộc diện nộp trong bộ lọc này.</p>}</section>;
}
