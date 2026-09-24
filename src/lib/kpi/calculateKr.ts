/**
 * KR engine (PURE) — các chỉ số mới của thư viện KR, cùng định dạng kết quả với calculateKpi.
 * seo_keyword_top · custom_task_result · task_on_time_rate · task_first_pass_rate · task_overdue · map_post_published
 */
import type { Task, KeywordTrack, MapPost, Website } from "@/lib/store";
import { isWithinPeriod, toDateKey } from "./date";
import { matchesEmployee, type KpiEmployee } from "./identity";

export const KR_ENGINE_KEYS = new Set(["seo_keyword_top", "custom_task_result", "task_on_time_rate", "task_first_pass_rate", "task_overdue", "map_post_published"]);

export interface KrMeta { keywordIds?: string[]; threshold?: number; taskIds?: string[] }
export interface KrItem { metricKey: string; brandId?: string | null; websiteId?: string | null; socialId?: string | null; metadata?: Record<string, unknown> | null }
export interface KrData { tasks: Task[]; keywords?: KeywordTrack[]; mapPosts?: MapPost[]; websites?: Website[] }
export interface KrEvidence {
  sourceType: "task" | "keyword" | "map_post"; sourceId: string; title: string; creditedAt: string;
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
    default: return { ...base, actualValue: null, evidence: [], supported: false };
  }
}

/** Đạt/chưa theo hướng mục tiêu. */
export function krAchieved(actual: number | null, target: number, direction: string = "at_least"): boolean | null {
  if (actual === null) return null;
  return direction === "at_most" ? actual <= target : actual >= target;
}
