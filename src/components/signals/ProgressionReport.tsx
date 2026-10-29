import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownUp, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/lib/auth';
import { deadlineReport, activateDeadlines, errMsg } from '@/lib/signals/api';
import { deadlineLink, type DeadlineMetrics } from '@/lib/signals/deadlines';
import type { ReportFilter } from '@/lib/signals/report';
import type { Signal } from '@/lib/signals/catalog';

const columns: {key:keyof DeadlineMetrics;label:string;hint:string}[]=[
  {key:'rate',label:'Tỷ lệ đúng hạn',hint:'Kỳ có note đúng hạn / kỳ đã đến hạn trong khoảng báo cáo. Loại kỳ được miễn; note muộn không sửa lịch sử trễ.'},
  {key:'overdue',label:'Tín hiệu đang quá hạn',hint:'Khách đang mở còn tồn đọng cập nhật hiện tại; mỗi khách chỉ tính một lần.'},
  {key:'today',label:'Cần cập nhật hôm nay',hint:'Kỳ chưa có note, hôm nay là ngày hạn cuối theo giờ Việt Nam.'},
  {key:'tracking',label:'Tín hiệu đang theo dõi',hint:'Khách đang mở có Sale và đã bắt đầu chu kỳ theo dõi.'},
];
const value=(m:DeadlineMetrics,key:keyof DeadlineMetrics)=>key==='rate' ? m.rate==null ? 'Chưa có dữ liệu' : `${m.rate.toLocaleString('vi-VN',{maximumFractionDigits:1})}%` : m[key];
export function ProgressionReport({ f,userId,name }: {data:Signal[];f:ReportFilter;userId:string|null;name:(id:string|null)=>string;onSale:(id:string)=>void}) {
  const {can,isAdmin}=useCurrentUser();
  const qc=useQueryClient();
  const query=useQuery({queryKey:['sig:deadline-report',userId,f.from,f.to,f.saleId,f.needGroup,f.source],queryFn:()=>deadlineReport(f.from,f.to,f.saleId,f.needGroup,f.source),enabled:!!userId,refetchInterval:10000,refetchOnWindowFocus:'always'});
  const [sort,setSort]=useState<'rate'|'overdue'>('overdue');
  const [desc,setDesc]=useState(true);
  const [busy,setBusy]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const activate=async()=>{
    setBusy(true);
    try {await activateDeadlines();await qc.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith('sig:')});toast.success('Đã kích hoạt từ thời điểm hiện tại');setConfirm(false);}
    catch(e){toast.error(errMsg(e));}finally{setBusy(false);}
  };
  const open=(state:string,sale?:string)=>{window.location.href=deadlineLink(state,sale,f.needGroup,f.source);};
  const sorted=[...(query.data?.sales??[])].sort((a,b)=>((a[sort]??-1)-(b[sort]??-1))*(desc?-1:1));
  return <section className="space-y-4 pb-40 md:pb-0" aria-label="Hiệu suất ghi nhận diễn biến Sale">
    <h2 className="text-sm font-semibold uppercase">Hiệu suất ghi nhận diễn biến Sale</h2>
    {query.error ? <p className="text-sm text-destructive">{errMsg(query.error)}</p> : !query.data ? <p className="text-sm text-muted-foreground">Đang tải…</p> : <>
      {!query.data.activated_at && <div className="border-l-2 border-primary pl-3 space-y-2"><p className="text-sm">Quy định cập nhật chưa kích hoạt. Chưa tính trễ hoặc gửi nhắc.</p>{isAdmin && can('signal.manage') && (confirm ? <div className="space-y-2"><p className="text-sm">Bắt đầu theo dõi tất cả tín hiệu đang mở từ thời điểm hiện tại và bật nhắc Base hằng ngày lúc 08:00? Không chấm trễ dữ liệu cũ.</p><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={activate}>Xác nhận kích hoạt</Button><Button variant="outline" disabled={busy} onClick={()=>setConfirm(false)}>Hủy</Button></div></div> : <Button variant="outline" onClick={()=>setConfirm(true)}><Power className="h-4 w-4 mr-2"/>Kích hoạt quy định cập nhật</Button>)}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{columns.map(c=><article key={c.key} className="min-w-0 border rounded-lg bg-card p-3 space-y-2" title={c.hint}><p className="text-xs text-muted-foreground">{c.label}</p>{c.key==='overdue'||c.key==='today' ? <Button variant="link" className="p-0 h-auto text-2xl" onClick={()=>open(c.key,f.saleId)}>{value(query.data.total,c.key)}</Button> : <p className={c.key==='rate'&&query.data.total.rate==null?'text-sm font-semibold':'text-2xl font-semibold'}>{value(query.data.total,c.key)}</p>}</article>)}</div>
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground"><span>Kỳ đúng hạn / đến hạn: {query.data.total.on_time} / {query.data.total.due}</span><span>Kỳ trễ: {query.data.total.due-query.data.total.on_time}</span><span>Sắp đến hạn: {query.data.total.soon}</span></div>
      <p className="text-sm">KR tham chiếu ≥90% · {query.data.total.rate==null?'Chưa có dữ liệu':`${query.data.total.rate>=90?'Đạt':'Chưa đạt'} · Mức đạt ${(query.data.total.rate/90*100).toLocaleString('vi-VN',{maximumFractionDigits:1})}%`}</p>
      <p className="text-xs text-muted-foreground">Lịch sử lọc theo ngày đến hạn. Khách cần cập nhật là tình trạng hiện tại, không lọc theo ngày tạo. Áp dụng Sale, nhóm nhu cầu và nguồn đang chọn.</p>
      <div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-muted-foreground">Sắp xếp</span><Button variant={sort==='rate'?'secondary':'outline'} onClick={()=>setSort('rate')}>Tỷ lệ đúng hạn</Button><Button variant={sort==='overdue'?'secondary':'outline'} onClick={()=>setSort('overdue')}>Khách quá hạn</Button><Button variant="outline" size="icon" aria-label="Đảo chiều sắp xếp" onClick={()=>setDesc(x=>!x)}><ArrowDownUp/></Button></div>
      <div className="hidden md:block overflow-x-auto border rounded-lg"><table className="w-full text-sm"><thead className="bg-muted"><tr>{['Sale','Đang theo dõi','Đúng hạn / đến hạn','Tỷ lệ đúng hạn','Quá hạn hiện tại','Hôm nay'].map(x=><th key={x} className="p-3 text-left">{x}</th>)}</tr></thead><tbody>{sorted.map(r=><tr key={r.sale_id} className="border-t"><td className="p-3">{name(r.sale_id)}</td><td className="p-3">{r.tracking}</td><td className="p-3">{r.on_time} / {r.due}</td><td className="p-3">{value(r,'rate')}</td><td className="p-3"><Button variant="link" onClick={()=>open('overdue',r.sale_id)}>{r.overdue}</Button></td><td className="p-3"><Button variant="link" onClick={()=>open('today',r.sale_id)}>{r.today}</Button></td></tr>)}</tbody></table></div>
      <div className="md:hidden space-y-3">{sorted.map(r=><article key={r.sale_id} className="border rounded-lg bg-card p-3"><h3 className="font-semibold">{name(r.sale_id)}</h3><p className="text-sm mt-2">Đúng hạn / đến hạn: {r.on_time} / {r.due} · {value(r,'rate')}</p><div className="grid grid-cols-2 gap-2 mt-2"><p className="text-sm">Đang theo dõi: {r.tracking}</p><Button variant="link" onClick={()=>open('overdue',r.sale_id)}>Quá hạn: {r.overdue}</Button><Button variant="link" onClick={()=>open('today',r.sale_id)}>Hôm nay: {r.today}</Button></div></article>)}</div>
      {!sorted.length && <p className="text-sm text-muted-foreground">Chưa có kỳ theo dõi trong phạm vi báo cáo.</p>}
    </>}
  </section>;
}