/** Báo cáo đơn từ — hàm thuần. Chỉ tính đơn Đã duyệt (kể cả đơn có yêu cầu hủy bị từ chối). */
export interface ReportRow {
  userId: string; leaveCount: number; leaveDays: number; lateCount: number; lateMinutes: number;
  earlyCount: number; earlyMinutes: number; pending: number; rejected: number;
}
type R = { owner_id: string; type: string; status: string; payload: any; calc: any };

/** Ngày nghỉ chia theo từng ngày (calc.details) để đơn qua 2 tháng tính đúng tháng. */
export function monthOf(r: R): string[] {
  if (r.type === "leave") return [String(r.payload?.start_date ?? "").slice(0, 7)];
  return [String(r.payload?.date ?? "").slice(0, 7)];
}

export function buildReport(rows: R[], month: string): ReportRow[] {
  const by: Record<string, ReportRow> = {};
  const get = (u: string) => (by[u] ??= { userId: u, leaveCount: 0, leaveDays: 0, lateCount: 0, lateMinutes: 0, earlyCount: 0, earlyMinutes: 0, pending: 0, rejected: 0 });
  for (const r of rows) {
    if (r.type === "leave") {
      const details: { date: string; days: number }[] = Array.isArray(r.calc?.details) ? r.calc.details : [];
      const inMonth = details.length ? details.filter((d) => d.date?.startsWith(month)) : (monthOf(r)[0] === month ? [{ date: month, days: Number(r.calc?.days ?? 0) }] : []);
      if (!inMonth.length) continue;
      const g = get(r.owner_id);
      if (r.status === "approved") { g.leaveCount++; g.leaveDays += inMonth.reduce((s, d) => s + Number(d.days || 0), 0); }
      else if (r.status === "pending") g.pending++;
      else if (r.status === "rejected") g.rejected++;
      continue;
    }
    if (monthOf(r)[0] !== month) continue;
    const g = get(r.owner_id);
    const min = Number(r.payload?.minutes ?? 0);
    if (r.status === "approved") {
      if (r.type === "late") { g.lateCount++; g.lateMinutes += min; } else { g.earlyCount++; g.earlyMinutes += min; }
    } else if (r.status === "pending") g.pending++;
    else if (r.status === "rejected") g.rejected++;
  }
  for (const g of Object.values(by)) g.leaveDays = Math.round(g.leaveDays * 100) / 100;
  return Object.values(by);
}

export function toCsv(rows: ReportRow[], name: (id: string) => string, month: string): string {
  const head = ["Tháng", "Nhân viên", "Số đơn nghỉ phép", "Số ngày nghỉ", "Số lần đi muộn", "Phút đi muộn", "Số lần về sớm", "Phút về sớm", "Đơn chờ duyệt", "Đơn bị từ chối"];
  const esc = (v: unknown) => { const s = String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = rows.map((r) => [month, name(r.userId), r.leaveCount, String(r.leaveDays).replace(".", ","), r.lateCount, r.lateMinutes, r.earlyCount, r.earlyMinutes, r.pending, r.rejected].map(esc).join(","));
  return "\uFEFF" + [head.join(","), ...lines].join("\n");
}
