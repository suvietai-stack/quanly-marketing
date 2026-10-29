import { Star, Signal, ListChecks, Target, Sparkles } from 'lucide-react';
import { programDescription, type Program } from '@/lib/sao/programs';
import { programActive } from '@/lib/sao/logic';

const icons = { signal: Signal, task: ListChecks, kpi: Target } as const;
const when = (v: string) => new Date(v).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
export function EarnPrograms({ programs }: { programs: Program[] }) {
  const active = programs.filter((p) => programActive(p));
  if (active.length === 0) return <div className="py-12 text-center text-muted-foreground"><Sparkles className="h-10 w-10 mx-auto mb-3 text-chipi-orange" /><p className="font-medium text-foreground">Chưa có chương trình nào đang áp dụng</p><p className="text-sm mt-1">Khi Admin bật chương trình thưởng, cách kiếm Sao sẽ hiện tại đây.</p></div>;
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{active.map((p) => {
    const Icon = icons[p.source];
    return <article key={p.id} className="rounded-xl border bg-card shadow-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><span className="rounded-full bg-secondary p-2.5 shrink-0"><Icon className="h-5 w-5 text-primary" aria-hidden /></span><h3 className="font-semibold break-words">{p.name}</h3></div><span className="text-xs font-medium text-success whitespace-nowrap mt-1">Đang áp dụng</span></div>
      <p className="text-sm text-muted-foreground break-words">{programDescription(p)}</p>
      <p className="flex items-center gap-2 text-chipi-orange font-bold mt-auto"><Star className="h-5 w-5 text-warning fill-warning" aria-hidden />+{p.stars.toLocaleString('vi-VN')} Sao</p>
      {(p.starts_at || p.ends_at) && <p className="text-xs text-muted-foreground">{p.starts_at ? `Từ ${when(p.starts_at)}` : 'Không giới hạn bắt đầu'} · {p.ends_at ? `Đến ${when(p.ends_at)}` : 'Không giới hạn kết thúc'}</p>}
    </article>;
  })}</div>;
}
