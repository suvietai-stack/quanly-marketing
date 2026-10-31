import {useMemo,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Bar,BarChart,CartesianGrid,Cell,Legend,Line,LineChart,Pie,PieChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {ChevronLeft,ChevronRight,Building2,Layers,Users,User,ClipboardCheck,ArrowUpRight} from 'lucide-react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {numberText} from '@/lib/biz/documents';
import {discipline,shortNumber,type DashboardData} from '@/lib/biz/dashboard';
import {aggregate,children,inPath,level,obligationsIn,rankChildren,tone,toneLabel,type HFact,type HMetric,type HObligation,type HPath,type Tone} from '@/lib/biz/hierarchy';

const TONE_TEXT:Record<Tone,string>={success:'text-success',warning:'text-warning',destructive:'text-destructive',muted:'text-muted-foreground'};
const TONE_BG:Record<Tone,string>={success:'bg-success',warning:'bg-warning',destructive:'bg-destructive',muted:'bg-muted-foreground/40'};
const TONE_FILL:Record<Tone,string>={success:'var(--success)',warning:'var(--warning)',destructive:'var(--destructive)',muted:'var(--muted-foreground)'};
const SHARE=['var(--primary)','var(--biz-secondary)','var(--success)','var(--warning)','var(--muted-foreground)'];
const AXIS_LABEL={system:'Hệ kinh doanh',department:'Phòng',team:'Nhóm',employee:'Nhân viên',all:''} as const;
const pct=(v:number|null)=>v===null?'—':`${v.toLocaleString('vi-VN',{maximumFractionDigits:1})}%`;

function systemsQuery(enabled:boolean){return {queryKey:['biz_dashboard_systems'],enabled,staleTime:60000,queryFn:async()=>{const {data,error}=await supabase.rpc('biz_dashboard_systems');if(error)throw error;return (data??[]) as unknown as {id:string;name:string}[];}};}

function Progress({m,t}:{m?:HMetric;t:Tone}){const w=m?.percent==null?0:Math.min(100,Math.max(0,m.percent));return <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={Math.round(w)} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${TONE_BG[t]}`} style={{width:`${w}%`}}/></div>;}

function KpiCard({m,eval:e,ongoing}:{m:HMetric;eval?:HMetric;ongoing:boolean}){const t=tone(e);return <article className="rounded-xl border bg-card p-4 shadow-soft space-y-3 min-w-0">
 <div className="flex items-start justify-between gap-2"><h3 className="text-sm font-medium">{m.name}</h3><Badge variant="outline" className={`${TONE_TEXT[t]} shrink-0`}>{toneLabel(t,ongoing)}</Badge></div>
 <div><strong className="block text-2xl tabular-nums truncate" title={numberText(m.actual)}>{m.actual===null?'—':numberText(m.actual)}</strong><p className="text-xs text-muted-foreground truncate">/ {numberText(m.target)} {m.unit} mục tiêu</p></div>
 <Progress m={m} t={t}/>
 <div className="grid grid-cols-2 gap-2 text-xs"><p>Hoàn thành <strong className="block text-sm">{pct(m.percent)}</strong></p><p>Chênh lệch <strong className="block text-sm tabular-nums truncate">{numberText(m.difference)}</strong></p>{ongoing&&e&&<p className="col-span-2 text-muted-foreground">Lũy kế đến nay: {pct(e.percent)} so với mục tiêu lũy kế</p>}{!m.complete&&<p className="col-span-2 text-warning">Đã có {m.received}/{m.expected} tháng báo cáo</p>}</div>
</article>;}

function ChartTip({active,payload,label,unit}:{active?:boolean;payload?:{name:string;value:number|null;color:string}[];label?:string;unit:string}){if(!active||!payload?.length)return null;return <div className="rounded-lg border bg-popover p-3 text-xs shadow-card space-y-1"><strong>{label}</strong>{payload.map(p=><p key={p.name} style={{color:p.color}}>{p.name}: {p.value===null||p.value===undefined?'Chưa có':`${p.value.toLocaleString('vi-VN',{maximumFractionDigits:2})}${unit==='%'?'%':` ${unit}`}`}</p>)}</div>;}

export function BizHierarchyDashboard({data,ongoingMonth,onOpenEmployee}:{data:DashboardData;ongoingMonth:number|null;onOpenEmployee:(id:string)=>void}){
 const facts=data.facts as HFact[];const obligations=data.obligations as HObligation[];
 const sys=useQuery(systemsQuery(true));
 const allSystems=sys.data??[];
 const [path,setPath]=useState<HPath>({});const [metricPick,setMetricPick]=useState<string>('');
 const tabs=useMemo(()=>{const m=new Map<string,string>();for(const s of allSystems)m.set(s.id,s.name);for(const f of facts)if(f.system_id&&!m.has(f.system_id))m.set(f.system_id,f.system_name??'Hệ');for(const o of obligations)if(o.system_id&&!m.has(o.system_id))m.set(o.system_id,'Hệ');return [...m.entries()];},[allSystems,facts,obligations]);
 const showAll=allSystems.length>0||tabs.length!==1;
 const effPath:HPath=!showAll&&tabs.length===1&&!path.system?{system:tabs[0][0]}:path;
 const lv=level(effPath);const scoped=facts.filter(f=>inPath(f,effPath));
 const lo=data.lo,hi=data.hi;const evalHi=ongoingMonth===null?hi:Math.min(hi,ongoingMonth);
 const totals=aggregate(scoped,lo,hi);const evalTotals=evalHi>=lo?aggregate(scoped,lo,evalHi):[];
 const metricKey=totals.some(t=>t.key===metricPick)?metricPick:(totals[0]?.key??'');const metric=totals.find(t=>t.key===metricKey);
 const ongoing=ongoingMonth!==null&&ongoingMonth<hi;
 const ch=children(facts,effPath,lv==='all'?allSystems:[]);
 const childRows=ch.items.map(c=>({id:c.id,name:c.name,path:c.path,m:aggregate(c.facts,lo,hi).find(x=>x.key===metricKey),e:evalHi>=lo?aggregate(c.facts,lo,evalHi).find(x=>x.key===metricKey):undefined,all:aggregate(c.facts,lo,hi),obl:discipline(obligationsIn(obligations,c.path).filter(o=>o.kind==='report'))}));
 const ranked=rankChildren(childRows.map(r=>({id:r.id,name:r.name,m:r.e??r.m})));
 const monthly=Array.from({length:12},(_,i)=>{const mm=aggregate(scoped,i+1,i+1).find(x=>x.key===metricKey);const cum=aggregate(scoped,1,i+1).find(x=>x.key===metricKey);return {name:`T${i+1}`,target:mm?.target==null?null:Number(mm.target),actual:mm?.actual==null?null:Number(mm.actual),cumTarget:cum?.target==null?null:Number(cum.target),cumActual:cum?.actual==null||(ongoingMonth!==null&&i+1>ongoingMonth)?null:Number(cum.actual)};});
 const reports=discipline(obligationsIn(obligations,effPath).filter(o=>o.kind==='report'));const plans=discipline(obligationsIn(obligations,effPath).filter(o=>o.kind==='plan'));
 const crumbs:{label:string;path:HPath}[]=[];if(showAll)crumbs.push({label:'Toàn Khối',path:{}});
 const nameOf=(k:'system'|'department'|'team'|'employee',id?:string)=>{if(!id)return '';const f=facts.find(x=>(k==='system'?x.system_id:k==='department'?x.department_id:k==='team'?(x.team_id??'__no_team__'):x.user_id)===id);return k==='system'?(tabs.find(t=>t[0]===id)?.[1]??f?.system_name??'Hệ'):k==='department'?f?.department_name??'Phòng':k==='team'?f?.team_name??'Chưa thuộc Nhóm':f?.employee_name??'Nhân viên';};
 if(effPath.system)crumbs.push({label:nameOf('system',effPath.system),path:{system:effPath.system}});
 if(effPath.department)crumbs.push({label:nameOf('department',effPath.department),path:{system:effPath.system,department:effPath.department}});
 if(effPath.team)crumbs.push({label:nameOf('team',effPath.team),path:{system:effPath.system,department:effPath.department,team:effPath.team}});
 if(effPath.employee)crumbs.push({label:nameOf('employee',effPath.employee),path:effPath});
 const up=crumbs.length>1?crumbs[crumbs.length-2].path:null;
 const share=metric?.value_kind==='money'&&(lv==='all'||lv==='system')?childRows.filter(r=>r.m?.actual&&Number(r.m.actual)>0).map(r=>({name:r.name,value:Number(r.m?.actual??0)})):[];
 const LevelIcon=lv==='employee'?User:lv==='team'||lv==='department'?Users:lv==='system'?Layers:Building2;
 const childIcon=ch.axis==='employee'?User:ch.axis==='system'?Layers:Users;const ChildIcon=childIcon;
 const empty=!scoped.length;

 return <div className="space-y-6 min-w-0">
  {/* Khu vực 1 – Điều hướng */}
  <nav aria-label="Chọn Hệ kinh doanh" className="-mx-1 overflow-x-auto"><div role="tablist" className="inline-flex min-w-full sm:min-w-0 gap-1 rounded-xl border bg-muted/50 p-1">
   {showAll&&<button role="tab" aria-selected={!effPath.system} onClick={()=>setPath({})} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!effPath.system?'bg-card text-primary shadow-soft':'text-muted-foreground hover:text-foreground'}`}>Toàn Khối</button>}
   {tabs.map(([id,name])=><button key={id} role="tab" aria-selected={effPath.system===id} onClick={()=>setPath({system:id})} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${effPath.system===id?'bg-card text-primary shadow-soft':'text-muted-foreground hover:text-foreground'}`}>{name.replace(/^Kinh Doanh\s+/i,'').replace(/^Hệ\s+/i,'')}</button>)}
  </div></nav>
  <div className="flex flex-wrap items-center gap-2 min-w-0">
   {up&&<Button variant="outline" size="sm" onClick={()=>setPath(up)} aria-label="Quay về cấp trên"><ChevronLeft className="h-4 w-4"/>Quay lại</Button>}
   <ol className="flex flex-wrap items-center gap-1 text-sm min-w-0" aria-label="Vị trí đang xem">{crumbs.map((c,i)=><li key={i} className="flex items-center gap-1 min-w-0">{i>0&&<ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0"/>}{i<crumbs.length-1?<button className="text-primary hover:underline truncate max-w-[10rem]" onClick={()=>setPath(c.path)}>{c.label}</button>:<span className="font-semibold truncate max-w-[14rem]">{c.label}</span>}</li>)}</ol>
   <Badge variant="outline" className="ml-auto">Chính thức</Badge>
  </div>
  {totals.length>1&&<div className="flex gap-2 overflow-x-auto pb-1" aria-label="Chọn KR cho biểu đồ">{totals.map(t=><button key={t.key} onClick={()=>setMetricPick(t.key)} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${t.key===metricKey?'border-primary bg-primary/10 text-primary':'text-muted-foreground'}`}>{t.name}</button>)}</div>}

  {/* Khu vực 2 – Tổng quan */}
  {empty?<div className="rounded-xl border border-dashed p-8 text-center"><LevelIcon className="mx-auto h-8 w-8 text-muted-foreground"/><h2 className="mt-3 font-semibold">Chưa có dữ liệu</h2><p className="text-sm text-muted-foreground mt-1">Đơn vị này chưa có nhân sự hoặc mục tiêu KR đã duyệt trong kỳ. Không hiển thị số liệu giả.</p></div>:
  <div className="grid grid-cols-1 min-[390px]:grid-cols-2 xl:grid-cols-4 gap-3">
   {totals.map(m=><KpiCard key={m.key} m={m} eval={evalTotals.find(e=>e.key===m.key)} ongoing={ongoing}/>)}
   <article className="rounded-xl border bg-card p-4 shadow-soft space-y-2"><div className="flex justify-between text-sm font-medium"><span>Báo cáo kỳ</span><ClipboardCheck className="h-4 w-4 text-primary"/></div><strong className="block text-2xl">{reports.submitted}<span className="text-sm text-muted-foreground"> / {reports.required}</span></strong><p className="text-xs text-success">{reports.ontime} đúng hạn</p><p className="text-xs text-warning">{reports.late} nộp muộn</p><p className="text-xs text-destructive">{reports.overdue} quá hạn chưa nộp</p><p className="text-xs text-muted-foreground">Kế hoạch: {plans.submitted}/{plans.required} đã nộp</p></article>
  </div>}

  {/* Khu vực 3 – Phân tích */}
  {!empty&&metric&&<div className="grid lg:grid-cols-2 gap-4">
   <section className="rounded-xl border bg-card p-4 min-w-0"><h2 className="font-semibold">Mục tiêu & thực tế theo tháng</h2><p className="text-xs text-muted-foreground mb-3">{metric.name} · {metric.unit} · tháng thiếu báo cáo để trống</p><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} margin={{top:8,right:8,left:0,bottom:0}}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize:11,fill:'var(--muted-foreground)'}} tickLine={false} axisLine={false} interval={0} minTickGap={0}/><YAxis width={48} tickFormatter={shortNumber} tick={{fontSize:11,fill:'var(--muted-foreground)'}} tickLine={false} axisLine={false}/><Tooltip content={<ChartTip unit={metric.unit}/>}/><Legend wrapperStyle={{fontSize:12}}/><Bar dataKey="target" name="Mục tiêu" fill="var(--primary)" radius={[3,3,0,0]} maxBarSize={18} isAnimationActive={false}/><Bar dataKey="actual" name="Thực tế" fill="var(--success)" radius={[3,3,0,0]} maxBarSize={18} isAnimationActive={false}/></BarChart></ResponsiveContainer></div></section>
   <section className="rounded-xl border bg-card p-4 min-w-0"><h2 className="font-semibold">Tiến độ lũy kế năm {data.year}</h2><p className="text-xs text-muted-foreground mb-3">So thực tế lũy kế với mục tiêu lũy kế, không so với mục tiêu cả năm</p><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthly} margin={{top:8,right:8,left:0,bottom:0}}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize:11,fill:'var(--muted-foreground)'}} tickLine={false} axisLine={false} interval={0}/><YAxis width={48} tickFormatter={shortNumber} tick={{fontSize:11,fill:'var(--muted-foreground)'}} tickLine={false} axisLine={false}/><Tooltip content={<ChartTip unit={metric.unit}/>}/><Legend wrapperStyle={{fontSize:12}}/><Line dataKey="cumTarget" name="Mục tiêu lũy kế" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false}/><Line dataKey="cumActual" name="Thực tế lũy kế" stroke="var(--success)" strokeWidth={2} dot={{r:3}} connectNulls={false} isAnimationActive={false}/></LineChart></ResponsiveContainer></div></section>
  </div>}

  {/* Khu vực 4 – So sánh */}
  {lv!=='employee'&&childRows.length>0&&<section className="space-y-4">
   <div className="flex items-end justify-between gap-2"><div><h2 className="text-lg font-semibold">So sánh {AXIS_LABEL[ch.axis].toLowerCase()}</h2><p className="text-xs text-muted-foreground">{metric?.name??'KR'} · {ongoing?'màu theo tiến độ lũy kế đến nay':'màu theo kết quả kỳ'} · bấm để xem chi tiết</p></div></div>
   <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{childRows.map(r=>{const t=tone(r.e);return <button key={r.id} onClick={()=>setPath(r.path)} className="text-left rounded-xl border bg-card p-4 shadow-soft hover:border-primary/60 transition-colors space-y-3 min-w-0">
    <div className="flex items-center gap-2 min-w-0"><ChildIcon className="h-4 w-4 text-primary shrink-0"/><span className="font-medium truncate">{r.name}</span><ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground shrink-0"/></div>
    {r.m?<><div className="flex items-baseline justify-between gap-2 text-sm"><strong className="tabular-nums truncate">{numberText(r.m.actual)}</strong><span className="text-xs text-muted-foreground truncate">/ {numberText(r.m.target)} {r.m.unit}</span></div><Progress m={r.m} t={t}/><div className="flex justify-between text-xs"><span className={TONE_TEXT[t]}>{toneLabel(t,ongoing)}</span><strong>{pct(r.m.percent)}</strong></div></>:<p className="text-sm text-muted-foreground">Chưa có dữ liệu{metric?` cho ${metric.name}`:''}</p>}
    {r.all.filter(x=>x.key!==metricKey).map(x=><p key={x.key} className="text-xs text-muted-foreground flex justify-between gap-2"><span className="truncate">{x.name}</span><span className="tabular-nums shrink-0">{numberText(x.actual)} / {numberText(x.target)} · {pct(x.percent)}</span></p>)}
    <p className="text-xs text-muted-foreground">{r.obl.required?`Báo cáo ${r.obl.submitted}/${r.obl.required} · ${r.obl.overdue} quá hạn`:'Không có nghĩa vụ báo cáo trong kỳ'}</p>
   </button>;})}</div>
   {childRows.filter(r=>r.m).length>1&&<div className="grid lg:grid-cols-2 gap-4">
    <section className="rounded-xl border bg-card p-4 min-w-0"><h3 className="font-semibold">Tỷ lệ hoàn thành</h3><p className="text-xs text-muted-foreground mb-3">Tổng thực tế / tổng mục tiêu của từng đơn vị</p><div style={{height:Math.max(160,childRows.length*44)}}><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={childRows.map(r=>({name:r.name,value:r.m?.percent??null,t:tone(r.e)}))} margin={{top:0,right:24,left:0,bottom:0}}><CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3"/><XAxis type="number" tickFormatter={v=>`${v}%`} tick={{fontSize:11,fill:'var(--muted-foreground)'}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="name" width={110} tick={{fontSize:11,fill:'var(--foreground)'}} axisLine={false} tickLine={false}/><Tooltip content={<ChartTip unit="%"/>}/><Bar dataKey="value" name="Hoàn thành" radius={[0,4,4,0]} maxBarSize={22} isAnimationActive={false}>{childRows.map(r=><Cell key={r.id} fill={TONE_FILL[tone(r.e)]}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
    {share.length>1?<section className="rounded-xl border bg-card p-4 min-w-0"><h3 className="font-semibold">Tỷ trọng {metric?.name.toLowerCase()}</h3><p className="text-xs text-muted-foreground mb-3">Đóng góp thực tế đã ghi nhận, không phải tỷ lệ đạt</p><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={share} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} isAnimationActive={false}>{share.map((_,i)=><Cell key={i} fill={SHARE[i%SHARE.length]}/>)}</Pie><Tooltip formatter={(v:number)=>`${v.toLocaleString('vi-VN')} ${metric?.unit}`}/><Legend wrapperStyle={{fontSize:12}}/></PieChart></ResponsiveContainer></div></section>:
    <section className="rounded-xl border bg-card p-4 min-w-0"><h3 className="font-semibold">Xếp hạng</h3><ol className="mt-3 divide-y">{ranked.map(r=><li key={r.id} className="py-2 flex items-center gap-3 text-sm"><span className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${r.rank<=3?'bg-accent text-primary':'bg-muted text-muted-foreground'}`}>{r.rank}</span><span className="truncate">{r.name}</span><strong className="ml-auto">{pct(r.m?.percent??null)}</strong></li>)}{!ranked.length&&<li className="py-2 text-sm text-muted-foreground">Chưa đủ dữ liệu để xếp hạng</li>}</ol></section>}
   </div>}
  </section>}

  {/* Khu vực 5 – Chi tiết nhân viên */}
  {lv==='employee'&&effPath.employee&&<section className="space-y-3">
   <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Chi tiết theo tháng</h2><Button variant="outline" size="sm" onClick={()=>onOpenEmployee(effPath.employee??'')}><ArrowUpRight className="h-4 w-4"/>Hồ sơ đầy đủ & Kế hoạch/Báo cáo</Button></div>
   <div className="grid gap-2 sm:hidden">{Array.from({length:12},(_,i)=>i+1).filter(m=>m>=lo&&m<=hi).map(m=><div key={m} className="rounded-lg border p-3 text-sm"><strong>Tháng {m}</strong>{aggregate(scoped,m,m).map(x=><p key={x.key} className="flex justify-between gap-2 text-xs mt-1"><span>{x.name}</span><span className="tabular-nums">{x.actual===null?'Chưa có báo cáo':numberText(x.actual)} / {numberText(x.target)}</span></p>)}</div>)}</div>
   <div className="hidden sm:block overflow-x-auto rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="text-left p-2">Tháng</th><th className="text-left p-2">KR</th><th className="text-right p-2">Mục tiêu</th><th className="text-right p-2">Thực tế</th><th className="text-right p-2">Hoàn thành</th></tr></thead><tbody>{Array.from({length:12},(_,i)=>i+1).filter(m=>m>=lo&&m<=hi).flatMap(m=>aggregate(scoped,m,m).map(x=><tr key={`${m}-${x.key}`} className="border-t"><td className="p-2">Tháng {m}</td><td className="p-2">{x.name}</td><td className="p-2 text-right tabular-nums">{numberText(x.target)}</td><td className="p-2 text-right tabular-nums">{x.actual===null?<span className="text-muted-foreground">Chưa có</span>:numberText(x.actual)}</td><td className={`p-2 text-right ${TONE_TEXT[tone(x)]}`}>{pct(x.percent)}</td></tr>))}</tbody></table></div>
   <p className="text-xs text-muted-foreground">Kế hoạch: {plans.submitted?'Đã nộp':'Chưa nộp'} · Báo cáo: {reports.submitted?'Đã nộp':'Chưa nộp'}{obligationsIn(obligations,effPath).some(o=>o.kind==='report'&&o.official)?' · Đã duyệt chính thức':''}</p>
  </section>}
 </div>;}
