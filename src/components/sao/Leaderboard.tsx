import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RefreshCw, Star, Trophy } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { leaderboardOptions, resolvePeriod, type LeaderboardMode } from '@/lib/sao/leaderboard';
import { cn } from '@/lib/utils';

const MODES: { key: LeaderboardMode; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'year', label: 'Năm' },
  { key: 'quarter', label: 'Quý' },
  { key: 'month', label: 'Tháng' },
  { key: 'week', label: 'Tuần' },
];

const fmt = (n: number) => n.toLocaleString('vi-VN');
const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<LeaderboardMode>('month');
  const [offset, setOffset] = useState(0);
  const q = useQuery(leaderboardOptions(mode, offset));
  const period = resolvePeriod(mode, offset, new Date());

  function switchMode(next: LeaderboardMode) {
    setMode(next);
    setOffset(0);
  }

  return (
    <TooltipProvider>
      <section aria-label="Bảng thành tích Sao Sứ Việt">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1" role="tablist" aria-label="Lọc theo thời gian">
            {MODES.map((m) => (
              <button
                key={m.key}
                role="tab"
                aria-selected={mode === m.key}
                onClick={() => switchMode(m.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  mode === m.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Làm mới bảng thành tích"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['sao-leaderboard'] })}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {mode !== 'all' && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button size="icon" variant="outline" aria-label="Kỳ trước" onClick={() => setOffset((o) => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="min-w-40 text-center font-semibold" aria-live="polite">{period.label}</p>
            <Button size="icon" variant="outline" aria-label="Kỳ sau" disabled={offset >= 0} onClick={() => setOffset((o) => o + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {q.isPending && <p className="text-muted-foreground py-8 text-center">Đang tải bảng thành tích…</p>}
        {q.isError && <p role="alert" className="text-destructive py-8 text-center">{q.error.message}</p>}
        {q.data && q.data.length === 0 && (
          <div className="py-10 text-center text-muted-foreground">
            <Trophy className="h-9 w-9 mx-auto mb-3 text-chipi-orange" />
            <p>Chưa có dữ liệu thành tích</p>
          </div>
        )}
        {q.data && q.data.length > 0 && (
          <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium w-16">Hạng</th>
                  <th className="px-4 py-3 font-medium">Nhân viên</th>
                  <th className="px-4 py-3 font-medium text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dotted underline-offset-4">Sao đã đạt</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64">
                        Tổng số Sao bạn đã kiếm được trong khoảng thời gian được chọn, bao gồm cả Sao thưởng tự động và cộng thủ công. Không trừ Sao đã sử dụng đổi quà.
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dotted underline-offset-4">Sao còn</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64">
                        Số Sao khả dụng hiện tại (số dư ví trừ Sao đang giữ đổi quà). Luôn là số liệu hôm nay, không đổi theo kỳ đang xem.
                      </TooltipContent>
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {q.data.map((row) => {
                  const mine = row.user_id === user?.id;
                  return (
                    <tr key={row.user_id} className={cn(mine && 'bg-primary/5 font-medium')}>
                      <td className="px-4 py-3 text-center">
                        {row.rank <= 3 ? <span aria-label={`Hạng ${row.rank}`}>{MEDALS[row.rank - 1]}</span> : row.rank}
                      </td>
                      <td className="px-4 py-3">
                        {row.full_name}
                        {mine && <span className="ml-2 text-xs text-primary">(Bạn)</span>}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          {fmt(row.earned)} <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap text-muted-foreground">{fmt(row.available)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
