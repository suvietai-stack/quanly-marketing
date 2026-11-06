import { Bar,BarChart,XAxis,YAxis,CartesianGrid } from 'recharts';
import { ChartContainer,ChartTooltip,ChartTooltipContent } from '@/components/ui/chart';
import { POTENTIAL_LABEL,potentialOf,STAGES,stageOf,workState } from '@/lib/signals/potential';
import { summarize } from '@/lib/signals/report';
import type { Signal } from '@/lib/signals/catalog';
import type { DeadlineRow } from '@/lib/signals/deadlines';
export function SignalPotentialReport({list,deadlines}:{list:Signal[];deadlines:Record<string,DeadlineRow>}) {
  const rows=Object.entries(POTENTIAL_LABEL).map(([key,label])=>{const s=summarize(list.filter(s=>potentialOf(s)===key));return {key,label,n:s.total,won:s.won,rate:s.closeRate};});
  const high=list.filter(s=>potentialOf(s)==='high');
  const stages=Object.entries(STAGES).map(([key,label])=>({label,n:high.filter(s=>stageOf(s)===key).length}));
  const chart={n:{label:'Số tín hiệu',color:'var(--primary)'}};
  const rateChart={rate:{label:'Tỷ lệ chốt (%)',color:'var(--success)'}};
  return <section className="space-y-4 min-w-0"><h2 className="font-semibold">Mức độ tiềm năng</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{rows.map(r=><div key={r.key} className="rounded-lg border bg-card p-3"><p className="text-xs text-muted-foreground">{r.label}</p><p className="text-2xl font-semibold mt-1">{r.n}</p><p className="text-xs text-muted-foreground mt-1">Chốt {r.won}/{r.n} · {r.rate==null?'Chưa có dữ liệu':`${r.rate.toLocaleString('vi-VN',{maximumFractionDigits:1})}%`}</p></div>)}</div>
    <div className="grid md:grid-cols-2 gap-4"><div className="min-w-0"><h3 className="text-sm font-medium mb-2">Cơ cấu tiềm năng</h3><ChartContainer config={chart} className="h-56 w-full"><BarChart data={rows} layout="vertical" margin={{left:0,right:12}}><CartesianGrid horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="label" width={108} tick={{fontSize:11}}/><ChartTooltip content={<ChartTooltipContent/>}/><Bar dataKey="n" fill="var(--color-n)" radius={4}/></BarChart></ChartContainer></div><div className="min-w-0"><h3 className="text-sm font-medium mb-2">Tiềm năng cao theo giai đoạn</h3><ChartContainer config={chart} className="h-56 w-full"><BarChart data={stages} layout="vertical"><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="label" width={90} tick={{fontSize:11}}/><ChartTooltip content={<ChartTooltipContent/>}/><Bar dataKey="n" fill="var(--color-n)" radius={4}/></BarChart></ChartContainer></div></div>
    <div className="min-w-0"><h3 className="text-sm font-medium mb-2">Tỷ lệ chốt theo tiềm năng</h3><ChartContainer config={rateChart} className="h-56 w-full"><BarChart data={rows} layout="vertical"><XAxis type="number" domain={[0,100]} unit="%"/><YAxis type="category" dataKey="label" width={108} tick={{fontSize:11}}/><ChartTooltip content={<ChartTooltipContent/>}/><Bar dataKey="rate" fill="var(--color-rate)" radius={4}/></BarChart></ChartContainer></div>
    <p className="border-l-2 border-warning pl-3 text-sm">Tiềm năng cao quá hạn: <b>{high.filter(s=>workState(s,deadlines[s.id])==='overdue').length}</b></p>
  </section>;
}