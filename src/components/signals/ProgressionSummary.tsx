import { Button } from '@/components/ui/button';
import { type ProgressionRow } from '@/lib/signals/progression';
import { DEADLINE_LABEL, type DeadlineRow } from '@/lib/signals/deadlines';
import type { Signal } from '@/lib/signals/catalog';

export function ProgressionSummary({ s, row, deadline, onUpdate, compact = false }: { s: Signal; row?: ProgressionRow; deadline?: DeadlineRow; onUpdate?:()=>void; compact?: boolean }) {
  const last = row?.last_at ? new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(row.last_at)) : 'Chưa có diễn biến';
  const closed = s.status==='won' || s.status==='lost';
  const label=closed ? 'Đã kết thúc' : deadline ? DEADLINE_LABEL[deadline.deadline_state] : s.cancelled_at ? 'Đã hủy' : 'Chưa kích hoạt theo dõi';
  const date=(d:string)=>d.split('-').reverse().join('/');
  const badge=<span className={`inline-flex rounded-md px-2 py-0.5 ${deadline?.deadline_state==='overdue' ? 'bg-destructive/10 text-destructive' : 'bg-accent text-accent-foreground'}`}>{label}{deadline?.deadline_state==='overdue' ? ` ${deadline.overdue_days} ngày` : ''}</span>;
  if(compact) return <div className="mt-1 whitespace-normal text-xs text-muted-foreground space-y-1"><div>Gần nhất: {last}</div>{badge}{deadline && <div>{deadline.deadline_state==='updated' ? `Hạn kỳ tiếp theo: ${date(deadline.next_due_on)}` : `Cần cập nhật trước ${date(deadline.due_on)}`}</div>}</div>;
  return <section className="space-y-2" aria-label="Theo dõi diễn biến">
    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Theo dõi diễn biến</h3>
    {deadline && <p className="font-semibold">{deadline.sequence===1 ? '5 ngày đầu' : deadline.sequence<=4 ? 'Giai đoạn theo tuần' : 'Giai đoạn theo 30 ngày'} · Kỳ {deadline.sequence}</p>}
    <div className="text-sm">{badge}</div>
    {deadline && <p className="text-sm">{deadline.deadline_state==='updated' ? `Hạn kỳ tiếp theo: ${date(deadline.next_due_on)}` : `Hạn cập nhật: ${date(deadline.due_on)}`}</p>}
    <p className="text-xs text-muted-foreground">Gần nhất: {last}</p>
    {onUpdate && <Button variant="outline" onClick={onUpdate}>Cập nhật diễn biến</Button>}
  </section>;
}