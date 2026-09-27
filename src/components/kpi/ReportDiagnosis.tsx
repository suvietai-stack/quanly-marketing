/** Chẩn đoán vì sao báo cáo KPI V2 trống/0 — chỉ đọc, không đổi dữ liệu. */
import { Link } from "@tanstack/react-router";

type P = { id: string; periodStart: string; periodEnd: string; goalId?: string | null; status?: string };
type I = { kpiPeriodId: string };
type G = { id: string; title: string; periodStart: string; periodEnd: string; status?: string };

/** Ngày cuối tháng của khóa YYYY-MM-DD (lịch, không phụ thuộc múi giờ). */
export function monthEnd(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${key.slice(0, 7)}-${String(d).padStart(2, "0")}`;
}

/** Kỳ bắt đầu ngày 1 và kết thúc trong cùng tháng nhưng không phải ngày cuối tháng (vd 01/10 → 30/10). */
export function shortMonth(ps: string, pe: string): string | null {
  if (!ps || !pe || !ps.endsWith("-01") || ps.slice(0, 7) !== pe.slice(0, 7)) return null;
  const end = monthEnd(ps);
  return pe !== end && pe >= monthEnd(ps).slice(0, 8) + "28" ? end : null;
}

const fmt = (k: string) => k.split("-").reverse().join("/");

export function ReportDiagnosis({ ps, pe, periods, items, goals, shown, hasFilter, isAdmin }: {
  ps: string; pe: string; periods: P[]; items: I[]; goals: G[]; shown: number; hasFilter: boolean; isAdmin: boolean;
}) {
  const ids = new Set(periods.map((p) => p.id));
  const assigned = items.filter((i) => ids.has(i.kpiPeriodId)).length;
  const overlapGoals = goals.filter((g) => g.periodStart <= pe && g.periodEnd >= ps);
  const goalItems = (g: G) => items.filter((i) => periods.some((p) => p.id === i.kpiPeriodId && p.goalId === g.id)).length;
  const unallocated = overlapGoals.filter((g) => goalItems(g) === 0);
  const short = shortMonth(ps, pe);
  const locked = periods.some((p) => p.status === "locked" || p.status === "closed");
  const link = <Link to="/settings/kpi-v2" className="font-medium text-primary hover:underline">Mở Giao KPI →</Link>;
  const msgs: React.ReactNode[] = [];

  if (short) msgs.push(<>Kỳ đang chọn kết thúc <b>{fmt(pe)}</b>, không phải ngày cuối tháng <b>{fmt(short)}</b>. Kết quả ngày cuối tháng sẽ không được tính vào kỳ này.{locked ? " Kỳ đã khóa nên hệ thống không tự sửa." : " Kiểm tra lại ngày kết thúc kỳ trong Giao KPI."}</>);
  if (assigned === 0) {
    msgs.push(<><b>Chưa được giao KPI:</b> kỳ {fmt(ps)} → {fmt(pe)} có {periods.length} kỳ nhân sự nhưng chưa có chỉ tiêu nào.{" "}
      {unallocated.length > 0 && <>Mục tiêu chưa phân bổ: {unallocated.map((g) => `“${g.title}”`).join(", ")}. </>}{isAdmin && link}</>);
  } else if (shown === 0 && hasFilter) {
    msgs.push(<><b>Có dữ liệu nhưng bị lọc mất:</b> kỳ này có {assigned} chỉ tiêu đã giao nhưng không chỉ tiêu nào khớp bộ lọc thương hiệu/kênh/nhóm chỉ số. Hãy bỏ bớt bộ lọc.</>);
  } else if (unallocated.length > 0) {
    msgs.push(<>Mục tiêu chưa phân bổ cho nhân sự: {unallocated.map((g) => `“${g.title}”`).join(", ")}. {isAdmin && link}</>);
  }
  if (assigned > 0 && shown > 0) msgs.push(<span className="text-muted-foreground">Chỉ tiêu hiển thị 0 nghĩa là <b>đã giao nhưng chưa có kết quả</b> được ghi nhận trong kỳ.</span>);
  if (!msgs.length) return null;
  return (
    <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-sm">
      {msgs.map((m, i) => <p key={i}>{m}</p>)}
    </div>
  );
}
