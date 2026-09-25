/**
 * KR engine (PURE) — các chỉ số mới của thư viện KR, cùng định dạng kết quả với calculateKpi.
 * seo_keyword_top · custom_task_result · task_on_time_rate · task_first_pass_rate · task_overdue · map_post_published
 */
import type { Task, KeywordTrack, MapPost, Website, WebContent, SocialPost, GrowthMetric } from "@/lib/store";
import { getKpiMetric } from "./metrics";
import { isWithinPeriod, toDateKey } from "./date";
import { matchesEmployee, type KpiEmployee } from "./identity";

export const KR_ENGINE_KEYS = new Set(["seo_keyword_top", "custom_task_result", "task_on_time_rate", "task_first_pass_rate", "task_overdue", "map_post_published",
  "web_post_published", "social_post_published", "seo_organic_clicks", "social_views", "mkt_leads",
  "video_view_threshold", "mkt_quality_leads", "mkt_conversion_rate", "mkt_orders", "mkt_revenue", "mkt_cpl", "custom_confirmed"]);

/** Một lần ghi nhận kết quả thủ công. Chỉ lần có confirmedBy mới được tính. */
export interface KrEntry { id: string; value?: number; numerator?: number; denominator?: number; link?: string; note?: string;
  recordedAt: string; recordedBy: string; confirmedBy?: string | null; confirmedAt?: string | null }

export interface KrMeta { keywordIds?: string[]; threshold?: number; taskIds?: string[]; viewThreshold?: number; mode?: "value" | "growth"; entries?: KrEntry[] }
export interface KrItem { metricKey: string; brandId?: string | null; websiteId?: string | null; socialId?: string | null; metadata?: Record<string, unknown> | null }
export interface KrData { tasks: Task[]; keywords?: KeywordTrack[]; mapPosts?: MapPost[]; websites?: Website[]; webContents?: WebContent[]; socialPosts?: SocialPost[]; growth?: GrowthMetric[] }
export interface KrEvidence {
  sourceType: "task" | "keyword" | "map_post" | "web_content" | "social_post" | "growth" | "entry"; sourceId: string; title: string; creditedAt: string;
  brandId: string | null; websiteId: string | null; deadline: string | null; onTime: boolean | null; firstPass: boolean | null; note?: string;
}
export interface KrResult {
  metricKey: string; actualValue: number | null; evidence: KrEvidence[]; warnings: { sourceId: string; title: string; message: string }[];
  supported: boolean; /** Ghi chú trạng thái hiển thị cho người dùng */ status?: string; denominator?: number;
}

const brandOk = (item: KrItem, b?: string | null) => !item.brandId || item.brandId === b;

function completedTasks(emp: KpiEmployee, item: KrItem, period: { periodStart: string; periodEnd: string }, tasks: Task[]) {
  return tasks.filter((t) => t.status === "Hoàn thành" && matchesEmployee(t.assignee, emp) && brandOk(item, t.brandId)
    && isWithinPeriod(toDateKey(t.submittedAt), period.periodStart, period.periodEnd));
}
const taskEv = (t: Task, note?: string): KrEvidence => {
  const c = toDateKey(t.submittedAt) ?? "";
  const dl = t.deadline ? toDateKey(t.deadline) : null;
  return { sourceType: "task", sourceId: t.id, title: t.title, creditedAt: c, brandId: t.brandId ?? null, websiteId: null,
    deadline: dl, onTime: dl && c ? c <= dl : null, firstPass: (t.revisions ?? 0) === 0, note };
};

export function calculateKrItem(emp: KpiEmployee, item: KrItem, period: { periodStart: string; periodEnd: string }, data: KrData, today = new Date().toISOString().slice(0, 10)): KrResult {
  const meta = (item.metadata ?? {}) as KrMeta;
  const base = { metricKey: item.metricKey, warnings: [] as KrResult["warnings"], supported: true };
  switch (item.metricKey) {
    case "seo_keyword_top": {
      const n = meta.threshold ?? 3;
      const ids = meta.keywordIds ?? [];
      const kws = (data.keywords ?? []).filter((k) => ids.includes(k.id));
      if (!ids.length) return { ...base, actualValue: null, evidence: [], status: "Chưa chọn từ khóa" };
      const siteBrand = (wid: string) => data.websites?.find((w) => w.id === wid)?.brandId ?? null;
      const warnings = ids.filter((id) => !kws.some((k) => k.id === id)).map((id) => ({ sourceId: id, title: id, message: "Từ khóa không còn trong Check Top." }));
      const evidence: KrEvidence[] = [];
      let valid = 0;
      for (const k of kws) {
        if (item.websiteId && k.websiteId !== item.websiteId) { warnings.push({ sourceId: k.id, title: k.keyword, message: "Từ khóa thuộc Website khác — không tính." }); continue; }
        if (item.brandId && siteBrand(k.websiteId) !== item.brandId) { warnings.push({ sourceId: k.id, title: k.keyword, message: "Từ khóa thuộc thương hiệu khác — không tính." }); continue; }
        const checked = toDateKey(k.lastCheckDate);
        if (!k.currentTop || !checked) { warnings.push({ sourceId: k.id, title: k.keyword, message: "Chưa có thứ hạng đã kiểm tra." }); continue; }
        if (!isWithinPeriod(checked, period.periodStart, period.periodEnd)) { warnings.push({ sourceId: k.id, title: k.keyword, message: `Lần kiểm tra ${checked} nằm ngoài thời gian KR — dữ liệu cũ, không tính.` }); continue; }
        valid++;
        if (k.currentTop <= n) evidence.push({ sourceType: "keyword", sourceId: k.id, title: `${k.keyword} — Top ${k.currentTop}`, creditedAt: toDateKey(k.lastCheckDate) ?? "",
          brandId: siteBrand(k.websiteId), websiteId: k.websiteId, deadline: null, onTime: null, firstPass: null, note: `Kiểm tra ${k.lastCheckDate}` });
      }
      const ended = today > period.periodEnd;
      if (!valid) return { ...base, actualValue: null, evidence: [], warnings, status: "Chưa đủ dữ liệu: chưa có lần Check Top hợp lệ trong thời gian KR" };
      return { ...base, actualValue: evidence.length, evidence, warnings,
        status: ended ? undefined : `Thứ hạng hiện tại — đạt Top ${n} chưa đồng nghĩa hoàn thành khi kỳ chưa kết thúc` };
    }
    case "custom_task_result": {
      const ids = meta.taskIds ?? [];
      if (!ids.length) return { ...base, actualValue: null, evidence: [], status: "Chưa liên kết Task" };
      const linked = data.tasks.filter((t) => ids.includes(t.id));
      const warnings: KrResult["warnings"] = [];
      const ok = linked.filter((t) => {
        if (!matchesEmployee(t.assignee, emp)) { warnings.push({ sourceId: t.id, title: t.title, message: "Task giao cho người khác — không tính." }); return false; }
        if (!brandOk(item, t.brandId)) { warnings.push({ sourceId: t.id, title: t.title, message: "Task thuộc dự án khác — không tính." }); return false; }
        return true;
      });
      const evidence = ok.filter((t) => t.status === "Hoàn thành" && isWithinPeriod(toDateKey(t.submittedAt), period.periodStart, period.periodEnd)).map((t) => taskEv(t));
      return { ...base, actualValue: evidence.length, evidence, warnings, status: `${evidence.length}/${ok.length} Task liên kết đã hoàn thành trong kỳ` };
    }
    case "task_on_time_rate": {
      const done = completedTasks(emp, item, period, data.tasks).filter((t) => t.deadline).map((t) => taskEv(t));
      if (!done.length) return { ...base, actualValue: null, evidence: [], denominator: 0, status: "Chưa có Task hoàn thành có deadline" };
      const ok = done.filter((e) => e.onTime).length;
      return { ...base, actualValue: Math.round((ok / done.length) * 1000) / 10, evidence: done, denominator: done.length };
    }
    case "task_first_pass_rate": {
      const done = completedTasks(emp, item, period, data.tasks).map((t) => taskEv(t));
      if (!done.length) return { ...base, actualValue: null, evidence: [], denominator: 0, status: "Chưa có Task hoàn thành" };
      const ok = done.filter((e) => e.firstPass).length;
      return { ...base, actualValue: Math.round((ok / done.length) * 1000) / 10, evidence: done, denominator: done.length };
    }
    case "task_overdue": {
      const evidence = data.tasks.filter((t) => {
        if (!matchesEmployee(t.assignee, emp) || !brandOk(item, t.brandId)) return false;
        if (["Hoàn thành", "Đã hủy", "Chờ xác nhận"].includes(t.status)) return false; // chờ duyệt: không phải lỗi nhân viên
        const dl = toDateKey(t.deadline);
        return !!dl && isWithinPeriod(dl, period.periodStart, period.periodEnd) && dl < today;
      }).map((t) => ({ ...taskEv(t), creditedAt: toDateKey(t.deadline) ?? "", onTime: false }));
      return { ...base, actualValue: evidence.length, evidence };
    }
    case "map_post_published": {
      const evidence = (data.mapPosts ?? []).filter((p) => (p.status === "Đã đăng" || p.status === "Hoàn thành") && matchesEmployee(p.owner, emp) && brandOk(item, p.brandId)
        && isWithinPeriod(toDateKey(p.publishedDate), period.periodStart, period.periodEnd))
        .map((p): KrEvidence => ({ sourceType: "map_post", sourceId: p.id, title: p.title, creditedAt: toDateKey(p.publishedDate)!, brandId: p.brandId,
          websiteId: null, deadline: null, onTime: null, firstPass: null }));
      return { ...base, actualValue: evidence.length, evidence };
    }
    case "web_post_published": {
      const warnings: KrResult["warnings"] = [];
      const evidence: KrEvidence[] = [];
      for (const c of data.webContents ?? []) {
        if (!["Đã đăng web", "Kiểm tra index", "Hoàn thành"].includes(c.status)) continue;
        const d = toDateKey(c.publishedAt || c.publishDate);
        if (!d || !isWithinPeriod(d, period.periodStart, period.periodEnd)) continue;
        if (!brandOk(item, c.brandId) || (item.websiteId && c.websiteId !== item.websiteId)) continue;
        if (!c.publisher) { if (matchesEmployee(c.writer, emp)) warnings.push({ sourceId: c.id, title: c.title, message: "Bài đã đăng nhưng chưa ghi người đăng — chưa xác minh, không tính." }); continue; }
        if (!matchesEmployee(c.publisher, emp)) continue;
        evidence.push({ sourceType: "web_content", sourceId: c.id, title: c.title, creditedAt: d, brandId: c.brandId, websiteId: c.websiteId, deadline: null, onTime: null, firstPass: null, note: c.publishedLink || c.url });
      }
      return { ...base, actualValue: evidence.length, evidence, warnings };
    }
    case "social_post_published": {
      const warnings: KrResult["warnings"] = [];
      const evidence: KrEvidence[] = [];
      for (const p of data.socialPosts ?? []) {
        if (p.status !== "Đã đăng" && p.status !== "Hoàn thành") continue;
        const d = toDateKey(p.publishedDate);
        if (!d || !isWithinPeriod(d, period.periodStart, period.periodEnd)) continue;
        if (!brandOk(item, p.brandId) || (item.socialId && p.channelId !== item.socialId)) continue;
        if (!p.publisher) { warnings.push({ sourceId: p.id, title: p.title, message: "Bài đã đăng nhưng chưa ghi người đăng — chưa xác minh, không tính." }); continue; }
        if (!matchesEmployee(p.publisher, emp)) continue;
        evidence.push({ sourceType: "social_post", sourceId: p.id, title: p.title, creditedAt: d, brandId: p.brandId, websiteId: null, deadline: null, onTime: null, firstPass: null, note: p.publishedLink });
      }
      return { ...base, actualValue: evidence.length, evidence, warnings: warnings.length && !evidence.length ? warnings : warnings.slice(0, 20) };
    }
    case "seo_organic_clicks": case "social_views": case "mkt_leads": {
      const isSocial = item.metricKey === "social_views";
      const target = isSocial ? item.socialId : item.websiteId;
      if (!target) return { ...base, actualValue: null, evidence: [], status: isSocial ? "Chưa chọn tài khoản Social" : "Chưa chọn Website" };
      const field = item.metricKey === "seo_organic_clicks" ? "clicks" : item.metricKey === "mkt_leads" ? "leads" : "totalViews";
      const rows = (data.growth ?? []).filter((g) => (isSocial ? g.channelId : g.websiteId) === target && g.periodType === "Tháng" && /^\d{4}-\d{2}$/.test(g.periodKey ?? ""));
      const months = monthsIn(period.periodStart, period.periodEnd);
      if (!months) return { ...base, actualValue: null, evidence: [], status: "Số liệu nhập theo Tháng — thời gian KR cần trọn tháng/quý" };
      const sum = (ms: string[]) => {
        const got = ms.map((m) => rows.find((r) => r.periodKey === m));
        if (got.some((r) => !r || typeof r[field] !== "number")) return null;
        return { total: got.reduce((a, r) => a + (r![field] as number), 0), rows: got as GrowthMetric[] };
      };
      const cur = sum(months);
      if (!cur) return { ...base, actualValue: null, evidence: [], status: `Chưa đủ dữ liệu: thiếu số liệu tháng ${months.join(", ")} trong báo cáo tăng trưởng` };
      const evidence = cur.rows.map((r): KrEvidence => ({ sourceType: "growth", sourceId: r.id, title: `${r.period}: ${(r[field] as number).toLocaleString("vi-VN")}`, creditedAt: r.updatedAt ?? r.periodKey ?? "",
        brandId: item.brandId ?? null, websiteId: item.websiteId ?? null, deadline: null, onTime: null, firstPass: null, note: r.reportLink }));
      if (meta.mode === "growth") {
        const prev = shiftMonths(months, -months.length);
        const b = sum(prev);
        if (!b || b.total <= 0) return { ...base, actualValue: null, evidence, status: `Chưa đủ dữ liệu kỳ gốc (${prev.join(", ")})` };
        return { ...base, actualValue: Math.round(((cur.total - b.total) / b.total) * 1000) / 10, evidence, status: `Kỳ gốc ${prev.join(", ")}: ${b.total.toLocaleString("vi-VN")} → ${cur.total.toLocaleString("vi-VN")} · số liệu nhập theo kỳ` };
      }
      return { ...base, actualValue: cur.total, evidence, status: "Số liệu nhập theo kỳ (không phải tích hợp tự động)" };
    }
    case "video_view_threshold": case "mkt_quality_leads": case "mkt_conversion_rate": case "mkt_orders": case "mkt_revenue": case "mkt_cpl": case "custom_confirmed": {
      const all = meta.entries ?? [];
      const ok = all.filter((e) => e.confirmedBy && isWithinPeriod(toDateKey(e.recordedAt), period.periodStart, period.periodEnd));
      const waiting = all.filter((e) => !e.confirmedBy).length;
      const wait = waiting ? ` · ${waiting} ghi nhận chờ xác nhận` : "";
      const ev = (e: KrEntry, title: string): KrEvidence => ({ sourceType: "entry", sourceId: e.id, title, creditedAt: toDateKey(e.recordedAt) ?? "", brandId: item.brandId ?? null,
        websiteId: item.websiteId ?? null, deadline: null, onTime: null, firstPass: null, note: e.link });
      if (!ok.length) return { ...base, actualValue: null, evidence: [], status: `Chưa có kết quả được xác nhận${wait}` };
      if (item.metricKey === "video_view_threshold") {
        const th = meta.viewThreshold ?? 0;
        const seen = new Map<string, KrEntry>();
        for (const e of ok) { const k = (e.link ?? e.id).trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, ""); if ((e.value ?? 0) >= th && !seen.has(k)) seen.set(k, e); }
        const evidence = [...seen.values()].map((e) => ev(e, `${(e.value ?? 0).toLocaleString("vi-VN")} lượt xem`));
        return { ...base, actualValue: evidence.length, evidence, status: `Mỗi video tính 1 lần khi ≥ ${th.toLocaleString("vi-VN")} lượt xem${wait}` };
      }
      const r = getKpiMetric(item.metricKey)?.ratio;
      if (r) {
        const num = ok.reduce((a, e) => a + (e.numerator ?? 0), 0), den = ok.reduce((a, e) => a + (e.denominator ?? 0), 0);
        if (den <= 0) return { ...base, actualValue: null, evidence: [], status: `Thiếu ${r.denominator}${wait}` };
        const v = (num / den) * (r.multiplier ?? 1);
        return { ...base, actualValue: Math.round(v * 10) / 10, denominator: den, evidence: ok.map((e) => ev(e, `${r.numerator}: ${e.numerator ?? 0} · ${r.denominator}: ${e.denominator ?? 0}`)),
          status: `${r.numerator} ${num.toLocaleString("vi-VN")} / ${r.denominator} ${den.toLocaleString("vi-VN")} · xác nhận thủ công${wait}` };
      }
      const total = ok.reduce((a, e) => a + (e.value ?? 0), 0);
      return { ...base, actualValue: total, evidence: ok.map((e) => ev(e, `${(e.value ?? 0).toLocaleString("vi-VN")}${e.note ? ` — ${e.note}` : ""}`)), status: `Xác nhận thủ công${wait}` };
    }
    default: return { ...base, actualValue: null, evidence: [], supported: false };
  }
}

/** Đạt/chưa theo hướng mục tiêu. */
export function krAchieved(actual: number | null, target: number, direction: string = "at_least"): boolean | null {
  if (actual === null) return null;
  return direction === "at_most" ? actual <= target : actual >= target;
}

/** Danh sách YYYY-MM nếu thời gian là trọn các tháng liên tiếp; ngược lại null. */
export function monthsIn(start: string, end: string): string[] | null {
  const [y0, m0, d0] = start.split("-").map(Number), [y1, m1, d1] = end.split("-").map(Number);
  if (d0 !== 1 || d1 !== new Date(y1, m1, 0).getDate()) return null;
  const out: string[] = [];
  for (let y = y0, m = m0; y < y1 || (y === y1 && m <= m1); m === 12 ? (y++, m = 1) : m++) out.push(`${y}-${String(m).padStart(2, "0")}`);
  return out.length ? out : null;
}
function shiftMonths(ms: string[], by: number) {
  return ms.map((k) => { const [y, m] = k.split("-").map(Number); const d = new Date(y, m - 1 + by, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });
}
