// Báo cáo Hỏi Giá & Tiến Độ — hàm thuần. Thời lượng (giây) do máy chủ tính (private.oq_round_metrics);
// ở đây chỉ lọc/tổng hợp/hiển thị, KHÔNG tự tính lại công thức thời gian.
import { addDays, rangeOf, shiftRange, vnToday } from "@/lib/kpi/timeframe";

export type Row = {
  round_id: string; flow_id: string; request_id: string; round_no: number; kind: "price" | "progress"; flow_code: string; title: string;
  creator_id: string; creator_name: string | null; assignee_id: string; assignee_name: string | null; items: number;
  status: "pending" | "processing" | "waiting_sale" | "answered" | "cancelled";
  sent_at: string; accepted_at: string | null; final_accepted_at: string | null; first_published_at: string | null; completed_at: string | null;
  wait_sale_sec: number; info_count: number; handover: boolean; response_sec: number | null; process_sec: number | null;
  accept_wait_sec: number | null; first_pub_sec: number | null; data_ok: boolean; scope: "all" | "own";
};

export const STATUS_LABEL: Record<Row["status"], string> = {
  pending: "Chờ xác nhận", processing: "Đang xử lý", waiting_sale: "Đang chờ Sale bổ sung", answered: "Đã trả lời", cancelled: "Đã hủy",
};
export const KIND_LABEL = { price: "Hỏi Giá", progress: "Hỏi Tiến Độ" } as const;

export type Measure = "response" | "process";
export const MEASURE_LABEL: Record<Measure, string> = {
  response: "Thời gian phản hồi (Sale gửi → hoàn thành)",
  process: "Thời gian Cung ứng xử lý (tiếp nhận → hoàn thành, trừ chờ Sale)",
};
export const measureOf = (r: Row, m: Measure) => (m === "response" ? r.response_sec : r.process_sec);

// ---------- Khoảng thời gian (giờ Việt Nam) ----------
export const PRESETS = [
  ["today", "Hôm nay"], ["yesterday", "Hôm qua"], ["week", "Tuần này"], ["last_week", "Tuần trước"],
  ["month", "Tháng này"], ["last_month", "Tháng trước"], ["quarter", "Quý này"], ["last_quarter", "Quý trước"],
  ["year", "Năm nay"], ["custom", "Tùy chỉnh"],
] as const;
export type Preset = (typeof PRESETS)[number][0];
export const PRESET_LABEL = Object.fromEntries(PRESETS) as Record<Preset, string>;

/** Trả về [ngày đầu, ngày cuối] (YYYY-MM-DD, bao gồm cả hai đầu). */
export function presetRange(p: Preset, today = vnToday(), custom?: [string, string]): [string, string] {
  switch (p) {
    case "today": return [today, today];
    case "yesterday": { const y = addDays(today, -1); return [y, y]; }
    case "week": return rangeOf("week", today);
    case "last_week": { const [s] = rangeOf("week", today); return shiftRange("week", s, -1); }
    case "month": return rangeOf("month", today);
    case "last_month": { const [s] = rangeOf("month", today); return shiftRange("month", s, -1); }
    case "quarter": return rangeOf("quarter", today);
    case "last_quarter": { const [s] = rangeOf("quarter", today); return shiftRange("quarter", s, -1); }
    case "year": return rangeOf("year", today);
    default: return custom && custom[0] && custom[1] ? (custom[0] <= custom[1] ? custom : [custom[1], custom[0]]) : rangeOf("month", today);
  }
}
/** Mốc truy vấn: [00:00 ngày đầu, 00:00 ngày sau ngày cuối) theo giờ Việt Nam. */
export const toBounds = ([s, e]: [string, string]) => ({ from: `${s}T00:00:00+07:00`, to: `${addDays(e, 1)}T00:00:00+07:00` });

// ---------- Ngưỡng tốc độ ----------
export const THRESHOLDS = [[15, "Trong 15 phút"], [30, "Trong 30 phút"], [60, "Trong 1 giờ"], [120, "Trong 2 giờ"], [240, "Trong 4 giờ"], [480, "Trong 8 giờ"], [1440, "Trong 24 giờ"]] as const;
export type Speed = { min?: number | null; max?: number | null } | null; // phút; null = không lọc
/** So sánh trên số giây chính xác — không làm tròn. 15:00 thuộc "≤15 phút", 15:01 không thuộc. */
export function inSpeed(sec: number | null, s: Speed): boolean {
  if (!s) return true;
  if (sec == null) return false;
  if (s.min != null && sec < s.min * 60) return false;
  if (s.max != null && sec > s.max * 60) return false;
  return true;
}
export const speedLabel = (s: Speed) => !s ? "" : s.min != null && s.max != null ? `${s.min}–${s.max} phút` : s.max != null ? `≤ ${fmtMin(s.max)}` : s.min != null ? `≥ ${fmtMin(s.min)}` : "";
const fmtMin = (m: number) => m % 60 === 0 ? `${m / 60} giờ` : `${m} phút`;

// ---------- Phân bố ----------
export const BUCKETS: { key: string; label: string; lo: number; hi: number }[] = [
  { key: "b15", label: "0–15 phút", lo: -1, hi: 900 },
  { key: "b30", label: ">15–30 phút", lo: 900, hi: 1800 },
  { key: "b60", label: ">30–60 phút", lo: 1800, hi: 3600 },
  { key: "b2h", label: ">1–2 giờ", lo: 3600, hi: 7200 },
  { key: "b4h", label: ">2–4 giờ", lo: 7200, hi: 14400 },
  { key: "b8h", label: ">4–8 giờ", lo: 14400, hi: 28800 },
  { key: "b24h", label: ">8–24 giờ", lo: 28800, hi: 86400 },
  { key: "bmax", label: ">24 giờ", lo: 86400, hi: Infinity },
];
/** Khoảng (lo, hi] — không chồng lấn. */
export const bucketOf = (sec: number) => BUCKETS.find((b) => sec > b.lo && sec <= b.hi)!;
export function distribution(rows: Row[], m: Measure) {
  const vals = rows.filter((r) => r.status === "answered").map((r) => measureOf(r, m)).filter((v): v is number => v != null);
  return BUCKETS.map((b) => { const n = vals.filter((v) => v > b.lo && v <= b.hi).length; return { ...b, n, pct: vals.length ? n / vals.length : 0 }; });
}

// ---------- Bộ lọc chung ----------
export type Filters = {
  kind: "all" | "price" | "progress"; statuses: Row["status"][]; sales: string[]; suppliers: string[];
  rounds: "all" | "first" | "reask"; speed: Speed; measure: Measure;
};
export const DEFAULT_FILTERS: Filters = { kind: "all", statuses: [], sales: [], suppliers: [], rounds: "all", speed: null, measure: "process" };
/** Lọc không gồm tốc độ (tốc độ chỉ áp lên lượt đã hoàn thành, để giữ mẫu số). */
export function baseFilter(rows: Row[], f: Filters) {
  return rows.filter((r) =>
    (f.kind === "all" || r.kind === f.kind) &&
    (!f.statuses.length || f.statuses.includes(r.status)) &&
    (!f.sales.length || f.sales.includes(r.creator_id)) &&
    (!f.suppliers.length || f.suppliers.includes(r.assignee_id)) &&
    (f.rounds === "all" || (f.rounds === "first" ? r.round_no === 1 : r.round_no > 1)));
}

// ---------- Thống kê ----------
export const avg = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
export function median(v: number[]) {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b), k = s.length >> 1;
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
}
export type Agg = {
  total: number; accepted: number; done: number; donePrice: number; doneProgress: number; open: number; cancelled: number;
  pending: number; processing: number; waiting: number; infoRounds: number; handovers: number;
  avgResponse: number | null; avgProcess: number | null; medProcess: number | null; medResponse: number | null; avgAcceptWait: number | null;
  inSpeed: number; missingProcess: number;
};
/** Mẫu số tỷ lệ trong ngưỡng = số lượt đã hoàn thành có giá trị theo cách đo (không bị ngưỡng làm mất). */
export function aggregate(rows: Row[], f: Pick<Filters, "speed" | "measure">): Agg {
  const done = rows.filter((r) => r.status === "answered");
  const num = (xs: (number | null)[]) => xs.filter((x): x is number => x != null);
  const resp = num(done.map((r) => r.response_sec)), proc = num(done.map((r) => r.process_sec));
  return {
    total: rows.length,
    accepted: rows.filter((r) => r.accepted_at).length,
    done: done.length, donePrice: done.filter((r) => r.kind === "price").length, doneProgress: done.filter((r) => r.kind === "progress").length,
    open: rows.filter((r) => ["pending", "processing", "waiting_sale"].includes(r.status)).length,
    cancelled: rows.filter((r) => r.status === "cancelled").length,
    pending: rows.filter((r) => r.status === "pending").length,
    processing: rows.filter((r) => r.status === "processing").length,
    waiting: rows.filter((r) => r.status === "waiting_sale").length,
    infoRounds: rows.filter((r) => r.info_count > 0).length,
    handovers: rows.filter((r) => r.handover).length,
    avgResponse: avg(resp), medResponse: median(resp), avgProcess: avg(proc), medProcess: median(proc),
    avgAcceptWait: avg(num(rows.map((r) => r.accept_wait_sec))),
    inSpeed: done.filter((r) => inSpeed(measureOf(r, f.measure), f.speed ?? { max: Infinity })).length,
    missingProcess: done.filter((r) => r.process_sec == null).length,
  };
}
export const speedDenominator = (a: Agg, m: Measure) => (m === "process" ? a.done - a.missingProcess : a.done);

export function groupBy(rows: Row[], key: "assignee_id" | "creator_id") {
  const map = new Map<string, Row[]>();
  for (const r of rows) { const k = r[key]; if (!map.has(k)) map.set(k, []); map.get(k)!.push(r); }
  return [...map.entries()].map(([id, rs]) => ({ id, name: (key === "assignee_id" ? rs[0].assignee_name : rs[0].creator_name) || "(không rõ)", rows: rs }));
}

/** Chuỗi theo thời gian: tự chọn ngày/tuần/tháng theo độ dài khoảng. */
export function timeSeries(rows: Row[], range: [string, string], basis: "sent" | "completed") {
  const days = Math.round((Date.parse(range[1]) - Date.parse(range[0])) / 864e5) + 1;
  const unit: "day" | "week" | "month" = days <= 31 ? "day" : days <= 120 ? "week" : "month";
  const keyOf = (iso: string) => {
    const d = vnToday(new Date(iso));
    return unit === "day" ? d : unit === "week" ? rangeOf("week", d)[0] : d.slice(0, 7);
  };
  const keys: string[] = [];
  for (let d = unit === "week" ? rangeOf("week", range[0])[0] : range[0]; d <= range[1]; d = addDays(d, unit === "day" ? 1 : 7)) {
    const k = unit === "month" ? d.slice(0, 7) : d; if (!keys.includes(k)) keys.push(k);
  }
  const pts = keys.map((k) => ({ key: k, label: unit === "month" ? `${k.slice(5)}/${k.slice(0, 4)}` : `${k.slice(8)}/${k.slice(5, 7)}`, price: 0, progress: 0 }));
  for (const r of rows) {
    const t = basis === "sent" ? r.sent_at : r.completed_at;
    if (!t || (basis === "completed" && r.status !== "answered")) continue;
    const p = pts.find((x) => x.key === keyOf(t)); if (p) p[r.kind]++;
  }
  return { unit, pts };
}

// ---------- Hiển thị ----------
/** Làm tròn chỉ khi hiển thị. */
export function fmtDur(sec: number | null | undefined, empty = "—"): string {
  if (sec == null || !Number.isFinite(sec)) return empty;
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s} giây`;
  const m = Math.floor(s / 60), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  if (d) return `${d} ngày${h ? ` ${h} giờ` : ""}`;
  if (h) return `${h} giờ${mm ? ` ${mm} phút` : ""}`;
  return `${mm} phút`;
}
export const toMin = (sec: number | null) => (sec == null ? null : Math.round((sec / 60) * 100) / 100);
export const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 1000) / 10}%` : "—");
