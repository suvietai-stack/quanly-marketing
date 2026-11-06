import type { Catalog, Customer, Schedule, ReportData } from "./types";
export const vnDay = (iso: string | number = Date.now()) =>
  new Date(new Date(iso).getTime() + 7 * 3600000).toISOString().slice(0, 10);
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
export function ratio(n: number, d: number): number | null {
  return d === 0 ? null : (n / d) * 100;
}
export function formatRatio(v: number | null) {
  return v === null
    ? "Chưa có dữ liệu"
    : `${v.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;
}
export function scheduleStatus(s: Schedule, now: string) {
  return s.status === "paused"
    ? "Tạm ngừng"
    : s.status === "processed"
      ? "Đã xử lý"
      : Date.parse(s.due_at) < Date.parse(now)
        ? "Quá hạn"
        : "Đến lịch";
}
export function descendant(id: string, root: string, catalogs: Catalog[]): boolean {
  const seen = new Set<string>();
  let current: string | null = id;
  while (current && !seen.has(current)) {
    if (current === root) return true;
    seen.add(current);
    current = catalogs.find((c) => c.id === current)?.parent_id ?? null;
  }
  return false;
}
export function reportRatios(t: Record<string, number>) {
  return {
    processed: ratio(t.processed, t.due),
    on_time: ratio(t.on_time, t.due),
    connected: ratio(t.connected, t.attempts),
    scheduled: ratio(t.scheduled_customers, t.customers),
    priority_overdue: ratio(t.priority_overdue, t.priority_customers),
  };
}
export function customerSubset(data: ReportData, kind: string, catalogs: Catalog[]): Customer[] {
  const schedules = data.schedules;
  return data.customers.filter((c) => {
    const own = schedules.filter((s) => s.customer_id === c.id);
    const pending = own.filter((s) => s.status === "pending");
    if (kind === "scheduled") return pending.length > 0;
    if (kind === "unscheduled") return pending.length === 0;
    if (kind === "overdue") return pending.some((s) => s.original_due_at < data.as_of);
    if (kind === "priority")
      return catalogs.some((x) => x.id === c.priority_id && x.config.key_customer === true);
    return true;
  });
}
export function periodRange(kind: string, date: string): [string, string] {
  const d = new Date(`${date}T00:00:00Z`);
  let start = new Date(d),
    end = new Date(d);
  if (kind === "week") {
    start.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
  }
  if (kind === "month") {
    start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  }
  if (kind === "quarter") {
    const m = Math.floor(d.getUTCMonth() / 3) * 3;
    start = new Date(Date.UTC(d.getUTCFullYear(), m, 1));
    end = new Date(Date.UTC(d.getUTCFullYear(), m + 3, 0));
  }
  if (kind === "year") {
    start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    end = new Date(Date.UTC(d.getUTCFullYear(), 11, 31));
  }
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}
export function previousRange(start: string, end: string): [string, string] {
  const days = (Date.parse(end) - Date.parse(start)) / 86400000 + 1;
  return [
    new Date(Date.parse(start) - days * 86400000).toISOString().slice(0, 10),
    new Date(Date.parse(start) - 86400000).toISOString().slice(0, 10),
  ];
}
