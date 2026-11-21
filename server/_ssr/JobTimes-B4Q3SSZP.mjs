import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { bt as Popover, bu as PopoverTrigger, bv as PopoverContent } from "./router-CkmTURa-.mjs";
import { o as oqApi, v as vnDateTime } from "./logic-BXklg4nZ.mjs";
import { r as rangeOf, s as shiftRange, a as addDays, v as vnToday } from "./timeframe-CYUNchQ5.mjs";
import { aN as Info } from "../_libs/lucide-react.mjs";
const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  waiting_sale: "Đang chờ Sale bổ sung",
  answered: "Đã trả lời",
  cancelled: "Đã hủy"
};
const KIND_LABEL = { price: "Hỏi Giá", progress: "Hỏi Tiến Độ" };
const MEASURE_LABEL = {
  response: "Thời gian phản hồi (Sale gửi → hoàn thành)",
  process: "Thời gian Cung ứng xử lý (tiếp nhận → hoàn thành, trừ chờ Sale)"
};
const measureOf = (r, m) => m === "response" ? r.response_sec : r.process_sec;
const PRESETS = [
  ["today", "Hôm nay"],
  ["yesterday", "Hôm qua"],
  ["week", "Tuần này"],
  ["last_week", "Tuần trước"],
  ["month", "Tháng này"],
  ["last_month", "Tháng trước"],
  ["quarter", "Quý này"],
  ["last_quarter", "Quý trước"],
  ["year", "Năm nay"],
  ["custom", "Tùy chỉnh"]
];
const PRESET_LABEL = Object.fromEntries(PRESETS);
function presetRange(p, today = vnToday(), custom) {
  switch (p) {
    case "today":
      return [today, today];
    case "yesterday": {
      const y = addDays(today, -1);
      return [y, y];
    }
    case "week":
      return rangeOf("week", today);
    case "last_week": {
      const [s] = rangeOf("week", today);
      return shiftRange("week", s, -1);
    }
    case "month":
      return rangeOf("month", today);
    case "last_month": {
      const [s] = rangeOf("month", today);
      return shiftRange("month", s, -1);
    }
    case "quarter":
      return rangeOf("quarter", today);
    case "last_quarter": {
      const [s] = rangeOf("quarter", today);
      return shiftRange("quarter", s, -1);
    }
    case "year":
      return rangeOf("year", today);
    default:
      return custom && custom[0] && custom[1] ? custom[0] <= custom[1] ? custom : [custom[1], custom[0]] : rangeOf("month", today);
  }
}
const toBounds = ([s, e]) => ({ from: `${s}T00:00:00+07:00`, to: `${addDays(e, 1)}T00:00:00+07:00` });
const THRESHOLDS = [[15, "Trong 15 phút"], [30, "Trong 30 phút"], [60, "Trong 1 giờ"], [120, "Trong 2 giờ"], [240, "Trong 4 giờ"], [480, "Trong 8 giờ"], [1440, "Trong 24 giờ"]];
function inSpeed(sec, s) {
  if (!s) return true;
  if (sec == null) return false;
  if (s.min != null && sec < s.min * 60) return false;
  if (s.max != null && sec > s.max * 60) return false;
  return true;
}
const speedLabel = (s) => !s ? "" : s.min != null && s.max != null ? `${s.min}–${s.max} phút` : s.max != null ? `≤ ${fmtMin(s.max)}` : s.min != null ? `≥ ${fmtMin(s.min)}` : "";
const fmtMin = (m) => m % 60 === 0 ? `${m / 60} giờ` : `${m} phút`;
const BUCKETS = [
  { key: "b15", label: "0–15 phút", lo: -1, hi: 900 },
  { key: "b30", label: ">15–30 phút", lo: 900, hi: 1800 },
  { key: "b60", label: ">30–60 phút", lo: 1800, hi: 3600 },
  { key: "b2h", label: ">1–2 giờ", lo: 3600, hi: 7200 },
  { key: "b4h", label: ">2–4 giờ", lo: 7200, hi: 14400 },
  { key: "b8h", label: ">4–8 giờ", lo: 14400, hi: 28800 },
  { key: "b24h", label: ">8–24 giờ", lo: 28800, hi: 86400 },
  { key: "bmax", label: ">24 giờ", lo: 86400, hi: Infinity }
];
function distribution(rows, m) {
  const vals = rows.filter((r) => r.status === "answered").map((r) => measureOf(r, m)).filter((v) => v != null);
  return BUCKETS.map((b) => {
    const n = vals.filter((v) => v > b.lo && v <= b.hi).length;
    return { ...b, n, pct: vals.length ? n / vals.length : 0 };
  });
}
const DEFAULT_FILTERS = { kind: "all", statuses: [], sales: [], suppliers: [], rounds: "all", speed: null, measure: "process" };
function baseFilter(rows, f) {
  return rows.filter((r) => (f.kind === "all" || r.kind === f.kind) && (!f.statuses.length || f.statuses.includes(r.status)) && (!f.sales.length || f.sales.includes(r.creator_id)) && (!f.suppliers.length || f.suppliers.includes(r.assignee_id)) && (f.rounds === "all" || (f.rounds === "first" ? r.round_no === 1 : r.round_no > 1)));
}
const avg = (v) => v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
function median(v) {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b), k = s.length >> 1;
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
}
function aggregate(rows, f) {
  const done = rows.filter((r) => r.status === "answered");
  const num = (xs) => xs.filter((x) => x != null);
  const resp = num(done.map((r) => r.response_sec)), proc = num(done.map((r) => r.process_sec));
  return {
    total: rows.length,
    accepted: rows.filter((r) => r.accepted_at).length,
    done: done.length,
    donePrice: done.filter((r) => r.kind === "price").length,
    doneProgress: done.filter((r) => r.kind === "progress").length,
    open: rows.filter((r) => ["pending", "processing", "waiting_sale"].includes(r.status)).length,
    cancelled: rows.filter((r) => r.status === "cancelled").length,
    pending: rows.filter((r) => r.status === "pending").length,
    processing: rows.filter((r) => r.status === "processing").length,
    waiting: rows.filter((r) => r.status === "waiting_sale").length,
    infoRounds: rows.filter((r) => r.info_count > 0).length,
    handovers: rows.filter((r) => r.handover).length,
    avgResponse: avg(resp),
    medResponse: median(resp),
    avgProcess: avg(proc),
    medProcess: median(proc),
    avgAcceptWait: avg(num(rows.map((r) => r.accept_wait_sec))),
    inSpeed: done.filter((r) => inSpeed(measureOf(r, f.measure), f.speed ?? { max: Infinity })).length,
    missingProcess: done.filter((r) => r.process_sec == null).length
  };
}
const speedDenominator = (a, m) => m === "process" ? a.done - a.missingProcess : a.done;
function groupBy(rows, key) {
  const map = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const k = r[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return [...map.entries()].map(([id, rs]) => ({ id, name: (key === "assignee_id" ? rs[0].assignee_name : rs[0].creator_name) || "(không rõ)", rows: rs }));
}
function timeSeries(rows, range, basis) {
  const days = Math.round((Date.parse(range[1]) - Date.parse(range[0])) / 864e5) + 1;
  const unit = days <= 31 ? "day" : days <= 120 ? "week" : "month";
  const keyOf = (iso) => {
    const d = vnToday(new Date(iso));
    return unit === "day" ? d : unit === "week" ? rangeOf("week", d)[0] : d.slice(0, 7);
  };
  const keys = [];
  for (let d = unit === "week" ? rangeOf("week", range[0])[0] : range[0]; d <= range[1]; d = addDays(d, unit === "day" ? 1 : 7)) {
    const k = unit === "month" ? d.slice(0, 7) : d;
    if (!keys.includes(k)) keys.push(k);
  }
  const pts = keys.map((k) => ({ key: k, label: unit === "month" ? `${k.slice(5)}/${k.slice(0, 4)}` : `${k.slice(8)}/${k.slice(5, 7)}`, price: 0, progress: 0 }));
  for (const r of rows) {
    const t = basis === "sent" ? r.sent_at : r.completed_at;
    if (!t || basis === "completed" && r.status !== "answered") continue;
    const p = pts.find((x) => x.key === keyOf(t));
    if (p) p[r.kind]++;
  }
  return { unit, pts };
}
function fmtDur(sec, empty = "—", compact = false) {
  if (sec == null || !Number.isFinite(sec)) return empty;
  const s = Math.max(0, Math.round(sec));
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  const U = compact ? { d: "ng", h: "h", m: "m", s: "s" } : { d: " ngày", h: " giờ", m: " phút", s: " giây" };
  const parts = [];
  if (d) parts.push(`${d}${U.d}`);
  if (d || h) parts.push(`${d ? p(h) : h}${U.h}`);
  if (d || h || m) parts.push(`${d || h ? p(m) : m}${U.m}`);
  parts.push(`${d || h || m ? p(ss) : ss}${U.s}`);
  return parts.join(" ");
}
const toMin = (sec) => sec == null ? null : Math.round(sec / 60 * 100) / 100;
const pct = (n, d) => d ? `${Math.round(n / d * 1e3) / 10}%` : "—";
function useJobTimes(flowIds) {
  const key = [...flowIds].sort();
  const q = useQuery({ queryKey: ["oq-times", key], queryFn: () => oqApi.jobTimes(key), refetchInterval: 6e4, staleTime: 3e4, enabled: key.length > 0 });
  const all = q.data ?? [];
  const current = (flowId, round) => {
    const rs = all.filter((t) => t.flow_id === flowId);
    return round ? rs.find((t) => t.round_no === round) : rs.sort((a, b) => b.round_no - a.round_no)[0];
  };
  return { all, current, isLoading: q.isLoading };
}
const since = (t, iso) => iso ? (Date.parse(t.server_now) - Date.parse(iso)) / 1e3 : null;
function timeLines(t, kind) {
  if (!t) return null;
  if (t.status === "answered") return {
    head: kind === "price" ? "Đã báo giá" : "Đã phản hồi",
    running: false,
    resp: `Phản hồi: ${fmtDur(t.response_sec)}`,
    proc: `Cung ứng xử lý: ${t.data_ok ? fmtDur(t.process_sec) : "Chưa đủ dữ liệu"}`
  };
  if (t.status === "cancelled") return { head: "Đã hủy", running: false, resp: "Phản hồi: —", proc: "Cung ứng xử lý: —" };
  const head = t.status === "pending" ? "Đang chờ" : t.status === "waiting_sale" ? "Chờ Sale bổ sung" : "Đang xử lý";
  return {
    head,
    running: true,
    resp: `${head} — đã trôi qua ${fmtDur(since(t, t.sent_at))}`,
    proc: t.status === "pending" || !t.final_accepted_at ? "Chưa tiếp nhận" : `Cung ứng đang xử lý: ${fmtDur(since(t, t.final_accepted_at))}`
  };
}
function ListTimeCell({ t, kind, part }) {
  const l = timeLines(t, kind);
  if (!l) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: l.running ? "text-muted-foreground" : "", children: [
    l[part].replace(/^(Phản hồi|Cung ứng xử lý): /, ""),
    l.running && part === "resp" ? " (tạm tính)" : ""
  ] });
}
function shortTimeLines(t, kind) {
  const l = timeLines(t, kind);
  if (!l || !t) return l;
  const c = (v) => fmtDur(v, "—", true);
  if (t.status === "answered") return { ...l, resp: `Phản hồi: ${c(t.response_sec)}`, proc: `Cung ứng xử lý: ${t.data_ok ? c(t.process_sec) : "Chưa đủ dữ liệu"}` };
  if (!l.running) return l;
  return { ...l, resp: `${l.head} — ${c(since(t, t.sent_at))}`, proc: t.status === "pending" || !t.final_accepted_at ? "Chưa tiếp nhận" : `Cung ứng đang xử lý: ${c(since(t, t.final_accepted_at))}` };
}
function Explain({ text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Giải thích", className: "inline-flex text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "text-xs max-w-72", children: text })
  ] });
}
const EXPLAIN = {
  response: "Từ lúc Sale gửi (hoặc gửi hỏi lại) đến lúc lượt hoàn thành đầy đủ. Gồm cả thời gian chờ tiếp nhận và chờ Sale bổ sung.",
  process: "Từ lúc Cung ứng hiện tại xác nhận tiếp nhận đến lúc hoàn thành, trừ các khoảng chờ Sale bổ sung ghi nhận trong hệ thống. Nếu có chuyển giao, chỉ tính thời gian của người hoàn thành.",
  waitSale: "Tổng các khoảng từ lúc Cung ứng yêu cầu bổ sung đến lúc Sale gửi phản hồi.",
  accept: "Từ lúc Sale gửi đến lần xác nhận tiếp nhận đầu tiên của lượt.",
  firstPub: "Từ lúc Sale gửi đến lần công bố chính thức đầu tiên (lưu nháp không tính)."
};
function FlowTimeSummary({ t, kind, assignee }) {
  if (!t) return null;
  const l = timeLines(t, kind);
  const done = t.status === "answered";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/30 p-3 space-y-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người phụ trách" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "sm:col-span-3 font-medium", children: [
        assignee,
        t.handover ? " · Có chuyển giao" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sale gửi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: vnDateTime(t.sent_at) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tiếp nhận" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.final_accepted_at ? vnDateTime(t.final_accepted_at) : "Chưa tiếp nhận" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hoàn thành" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.completed_at ? vnDateTime(t.completed_at) : "Chưa hoàn thành" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          "Thời gian phản hồi ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Explain, { text: EXPLAIN.response })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: done ? fmtDur(t.response_sec) : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          "Thời gian Cung ứng xử lý ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Explain, { text: EXPLAIN.process })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: done ? t.data_ok ? fmtDur(t.process_sec) : "Chưa đủ dữ liệu" : "—" })
      ] })
    ] }),
    !done && t.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      l.resp,
      " · ",
      l.proc,
      " (số liệu tạm tính, chưa phải thời gian hoàn thành)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "Chờ Sale: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-foreground", children: fmtDur(t.wait_sale_sec, "0") }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Explain, { text: EXPLAIN.waitSale })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "Chờ tiếp nhận: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-foreground", children: fmtDur(t.accept_wait_sec, "Chưa tiếp nhận") }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Explain, { text: EXPLAIN.accept })
      ] }),
      t.first_pub_sec != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        "Công bố đầu tiên: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-foreground", children: fmtDur(t.first_pub_sec) }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Explain, { text: EXPLAIN.firstPub })
      ] })
    ] })
  ] });
}
export {
  BUCKETS as B,
  DEFAULT_FILTERS as D,
  EXPLAIN as E,
  FlowTimeSummary as F,
  KIND_LABEL as K,
  ListTimeCell as L,
  MEASURE_LABEL as M,
  PRESET_LABEL as P,
  STATUS_LABEL as S,
  THRESHOLDS as T,
  speedLabel as a,
  baseFilter as b,
  PRESETS as c,
  aggregate as d,
  timeSeries as e,
  fmtDur as f,
  groupBy as g,
  speedDenominator as h,
  inSpeed as i,
  pct as j,
  toMin as k,
  Explain as l,
  measureOf as m,
  distribution as n,
  presetRange as p,
  shortTimeLines as s,
  toBounds as t,
  useJobTimes as u
};
