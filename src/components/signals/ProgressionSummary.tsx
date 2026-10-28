import { Progress } from '@/components/ui/progress';
import { progressionState, INITIAL_PROGRESS, type ProgressionRow } from '@/lib/signals/progression';
import type { Signal } from '@/lib/signals/catalog';

export function ProgressionSummary({ s, row, compact = false }: { s: Signal; row?: ProgressionRow; compact?: boolean }) {
  const state = progressionState(s,row);
  const last = row?.last_at ? new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(row.last_at)) : 'Chưa có diễn biến';
  if (compact) return <div className="mt-1 whitespace-normal text-xs text-muted-foreground space-y-1"><div>Đã cập nhật {state.total} lần · {last}</div>{state.stale && <span className="inline-flex rounded-md bg-accent px-2 py-0.5 text-accent-foreground">Lâu chưa cập nhật</span>}</div>;
  const closed = s.status==='won' || s.status==='lost';
  return <section className="space-y-2" aria-label="Theo dõi diễn biến">
    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Theo dõi diễn biến</h3>
    <p className="font-semibold">{closed ? `${s.status==='won' ? 'Đã chốt' : 'Đã trượt'} · Ghi nhận ${state.total} lần tư vấn` : `Đã ghi nhận ${state.total} lần${state.total<INITIAL_PROGRESS ? ' · Mốc ban đầu 5 lần' : ''}`}</p>
    {state.open && state.total<INITIAL_PROGRESS && <Progress value={state.total/INITIAL_PROGRESS*100} aria-label={`${state.total} trên mốc ban đầu ${INITIAL_PROGRESS}`} />}
    {state.open && <p className="text-xs text-muted-foreground">{state.total>=INITIAL_PROGRESS ? 'Đã đạt mốc ghi nhận ban đầu. Khách vẫn đang tư vấn, cần tiếp tục theo dõi.' : '5 lần là mốc ghi nhận ban đầu. Hãy tiếp tục cập nhật diễn biến cho đến khi khách có kết quả.'}</p>}
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground"><span>Gần nhất: {last}</span>{state.stale && <span className="rounded-md bg-accent px-2 py-0.5 text-accent-foreground">Lâu chưa cập nhật</span>}</div>
  </section>;
}