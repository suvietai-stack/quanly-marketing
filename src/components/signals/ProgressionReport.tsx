import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { listProgression, errMsg } from '@/lib/signals/api';
import { filterSignals, type ReportFilter } from '@/lib/signals/report';
import { progressionMetrics, type ProgressionMetrics } from '@/lib/signals/progression';
import type { Signal } from '@/lib/signals/catalog';

const columns: { key: keyof ProgressionMetrics; label: string; hint: string }[] = [
  { key:'open',label:'Tín hiệu đang chăm sóc',hint:'Tín hiệu đang mở, chưa hủy trong tập tín hiệu theo bộ lọc báo cáo; dùng trạng thái hiện tại.' },
  { key:'recent',label:'Đã cập nhật trong 7 ngày',hint:'Tín hiệu đang mở có ít nhất một diễn biến hợp lệ trong 7 × 24 giờ tính đến hiện tại, không phải toàn bộ kỳ báo cáo.' },
  { key:'rate',label:'Tỷ lệ cập nhật gần đây',hint:'Đã cập nhật trong 7 ngày / Tín hiệu đang chăm sóc × 100%. Không có tín hiệu mở: —.' },
  { key:'stale',label:'Lâu chưa cập nhật',hint:'Tín hiệu đang mở quá 7 × 24 giờ từ diễn biến gần nhất hoặc mốc giao Sale mới hơn. Thiếu cả hai mốc thì không tự cảnh báo.' },
  { key:'below',label:'Dưới mốc 5 lần',hint:'Tín hiệu đang mở có dưới 5 diễn biến hợp lệ trong toàn lịch sử. Đây là tiến độ ghi nhận ban đầu, không phải vi phạm.' },
  { key:'updates',label:'Lượt cập nhật trong kỳ',hint:'Diễn biến hợp lệ tạo trong khoảng ngày chọn (giờ Việt Nam), độc lập với ngày tạo tín hiệu. Bảng Sale tính theo người thực sự cập nhật, không chuyển lượt cũ sang Sale mới.' },
];
const value = (m: ProgressionMetrics, key: keyof ProgressionMetrics) => key==='rate' ? m.rate==null ? '—' : `${m.rate.toLocaleString('vi-VN',{maximumFractionDigits:1})}%` : m[key];
export function ProgressionReport({ data, f, userId, name, onSale }: { data: Signal[]; f: ReportFilter; userId: string | null; name:(id:string|null)=>string; onSale:(id:string)=>void }) {
  const query=useQuery({queryKey:['sig:progression-period',userId,f.from,f.to],queryFn:()=>listProgression(f.from,f.to),enabled:!!userId,refetchInterval:10000,refetchOnWindowFocus:'always'});
  const [sort,setSort]=useState<{key:keyof ProgressionMetrics;desc:boolean}>({key:'stale',desc:true});
  const analysis=useMemo(()=>{
    const rows=query.data ?? {};
    const cohort=filterSignals(data,f);
    const period=filterSignals(data,{...f,from:undefined,to:undefined});
    const ids=new Set(cohort.map(s=>s.assigned_to).filter((id):id is string=>!!id));
    for(const s of period) for(const id of Object.keys(rows[s.id]?.authors ?? {})) if(!f.saleId || id===f.saleId) ids.add(id);
    const now=Date.now();
    return { total:progressionMetrics(cohort,period,rows,now), sales:[...ids].map(id=>({id,metrics:progressionMetrics(cohort.filter(s=>s.assigned_to===id),period,rows,now,id)})) };
  },[data,f,query.data]);
  const sorted=[...analysis.sales].sort((a,b)=>((a.metrics[sort.key]??-1)-(b.metrics[sort.key]??-1))*(sort.desc ? -1 : 1));
  return <section className="space-y-3 pb-32 md:pb-0" aria-label="Hiệu suất cập nhật diễn biến">
    <h2 className="text-xs font-semibold uppercase text-muted-foreground">Hiệu suất cập nhật diễn biến</h2>
    <p className="text-xs text-muted-foreground">Trạng thái hiện tại trong tập tín hiệu đã lọc · Cửa sổ 7 ngày đến hiện tại · Lượt trong kỳ theo ngày ghi diễn biến.</p>
    {query.error ? <p className="text-sm text-destructive">Không tải được diễn biến: {errMsg(query.error)}</p> : query.isPending ? <p className="text-sm text-muted-foreground">Đang tải diễn biến…</p> : <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">{columns.map(c=><div key={c.key} className="min-w-0 rounded-lg border bg-card p-3 space-y-2"><div className="flex items-start justify-between gap-2"><span className="text-xs text-muted-foreground">{c.label}</span><TooltipProvider><Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" aria-label={`Định nghĩa ${c.label}`}>?</Button></TooltipTrigger><TooltipContent className="max-w-xs whitespace-normal">{c.hint}</TooltipContent></Tooltip></TooltipProvider></div><p className="text-2xl font-semibold">{value(analysis.total,c.key)}</p></div>)}</div>
      <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">Sắp xếp</span><select aria-label="Sắp xếp hiệu suất diễn biến" className="h-10 max-w-full rounded-md border bg-background px-2 text-sm" value={sort.key} onChange={e=>setSort({...sort,key:e.target.value as keyof ProgressionMetrics})}>{columns.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select><Button variant="outline" size="icon" aria-label={sort.desc?'Đổi sang tăng dần':'Đổi sang giảm dần'} onClick={()=>setSort({...sort,desc:!sort.desc})}><ArrowDownUp className="h-4 w-4" /></Button></div>
      {!sorted.length && <p className="text-sm text-muted-foreground">Chưa có dữ liệu Sale trong phạm vi lọc.</p>}
      <div className="hidden md:block overflow-x-auto border rounded-lg"><table className="w-full text-sm"><thead className="bg-muted text-muted-foreground"><tr><th className="text-left p-3">Sale</th>{columns.map(c=><th key={c.key} title={c.hint} className="p-3 text-right min-w-28 font-medium">{c.label}</th>)}</tr></thead><tbody>{sorted.map(r=><tr key={r.id} className="border-t"><td className="p-3"><Button variant="link" className="p-0 h-auto text-left whitespace-normal" onClick={()=>onSale(r.id)}>{name(r.id)}</Button></td>{columns.map(c=><td key={c.key} className="p-3 text-right">{value(r.metrics,c.key)}</td>)}</tr>)}</tbody></table></div>
      <div className="md:hidden space-y-3">{sorted.map(r=><article key={r.id} className="rounded-lg border bg-card p-3 space-y-2"><Button variant="link" className="p-0 h-auto whitespace-normal text-left" onClick={()=>onSale(r.id)}>{name(r.id)}</Button><dl className="grid grid-cols-2 gap-3">{columns.map(c=><div key={c.key} className="min-w-0"><dt className="text-xs text-muted-foreground">{c.label}</dt><dd className="text-base font-semibold">{value(r.metrics,c.key)}</dd></div>)}</dl></article>)}</div>
      <p className="text-xs text-muted-foreground">5 lần là mốc ghi nhận ban đầu, không phải đích đến. Lượt ghi nhận không dùng để chấm điểm Sale. Lịch sử trước nâng cấp chưa xác minh được các lượt retry.</p>
    </>}
  </section>;
}