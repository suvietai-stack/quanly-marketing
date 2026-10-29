import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type LeaderboardMode = 'all' | 'year' | 'quarter' | 'month' | 'week';

export interface LeaderboardRow {
  user_id: string;
  full_name: string;
  earned: number;
  available: number;
  rank: number;
}

export interface Period {
  from: Date | null;
  to: Date | null;
  label: string;
}

const VN_TZ = 'Asia/Ho_Chi_Minh';

/** Current date parts in Vietnam time. */
function vnParts(now: Date): { y: number; m: number; d: number; dow: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: VN_TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  const parts = fmt.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const dowMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return { y: Number(get('year')), m: Number(get('month')), d: Number(get('day')), dow: dowMap[get('weekday')] ?? 1 };
}

/** Convert a Vietnam wall-clock time to a UTC Date (VN is always UTC+7). */
function vnToUtc(y: number, m: number, d: number, h = 0, min = 0): Date {
  return new Date(Date.UTC(y, m - 1, d, h - 7, min));
}

export function currentStep(mode: LeaderboardMode, now: Date): number {
  const { y, m, d, dow } = vnParts(now);
  switch (mode) {
    case 'year': return y;
    case 'quarter': return y * 4 + Math.floor((m - 1) / 3);
    case 'month': return y * 12 + (m - 1);
    case 'week': {
      // ISO-like week counter: days since epoch of the VN Monday of this week
      const monday = vnToUtc(y, m, d - (dow - 1));
      return Math.floor(monday.getTime() / (7 * 24 * 3600 * 1000));
    }
    default: return 0;
  }
}

/**
 * Resolve a leaderboard period for a mode and a step offset from the current
 * period (0 = current, -1 = previous, ...). All boundaries use Vietnam time.
 * 'all' has no bounds.
 */
export function resolvePeriod(mode: LeaderboardMode, offset: number, now: Date): Period {
  if (mode === 'all') return { from: null, to: null, label: 'Tất cả thời gian' };
  const step = currentStep(mode, now) + offset;
  if (mode === 'year') {
    const y = step;
    return { from: vnToUtc(y, 1, 1), to: vnToUtc(y + 1, 1, 1), label: `Năm ${y}` };
  }
  if (mode === 'quarter') {
    const y = Math.floor(step / 4);
    const q = ((step % 4) + 4) % 4; // 0..3
    return { from: vnToUtc(y, q * 3 + 1, 1), to: vnToUtc(y, q * 3 + 4, 1), label: `Quý ${q + 1}/${y}` };
  }
  if (mode === 'month') {
    const y = Math.floor(step / 12);
    const m = ((step % 12) + 12) % 12; // 0..11
    return { from: vnToUtc(y, m + 1, 1), to: vnToUtc(y, m + 2, 1), label: `Tháng ${m + 1}/${y}` };
  }
  // week: Monday 00:00 VN to next Monday 00:00 VN
  const monday = new Date(step * 7 * 24 * 3600 * 1000);
  const sundayEnd = new Date(monday.getTime() + 7 * 24 * 3600 * 1000);
  const fmtDay = (dt: Date) => {
    const p = vnParts(new Date(dt.getTime() + 7 * 3600 * 1000)); // shift back to VN wall clock
    return `${String(p.d).padStart(2, '0')}/${String(p.m).padStart(2, '0')}/${p.y}`;
  };
  return { from: monday, to: sundayEnd, label: `${fmtDay(monday)} – ${fmtDay(new Date(sundayEnd.getTime() - 86400000))}` };
}

export async function loadLeaderboard(mode: LeaderboardMode, offset: number): Promise<LeaderboardRow[]> {
  const period = resolvePeriod(mode, offset, new Date());
  const { data, error } = await supabase.rpc('sao_leaderboard', {
    _from: period.from ? period.from.toISOString() : null,
    _to: period.to ? period.to.toISOString() : null,
  });
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

export const leaderboardOptions = (mode: LeaderboardMode, offset: number) =>
  queryOptions({
    queryKey: ['sao-leaderboard', mode, offset],
    queryFn: () => loadLeaderboard(mode, offset),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
