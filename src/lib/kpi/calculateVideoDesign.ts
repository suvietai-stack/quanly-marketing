/**
 * KPI V2 — DAY 3: adapters Video + Design (PURE).
 * Nguyên tắc: chỉ credit khi xác định được (1) đúng nhân sự thực hiện tại thời điểm đó,
 * (2) sự kiện nộp/duyệt, (3) ngày credit. Không dùng owner/assignee HIỆN TẠI làm bằng chứng quá khứ.
 */
import type { Video, DesignOrder, SocialPost } from "@/lib/store";
import { isWithinPeriod, timeOf, toDateKey } from "./date";
import { matchesEmployee, type KpiEmployee } from "./identity";
import type { KpiStageEvent, KpiStage } from "./stageEvents";

export type VDSourceType = "video" | "design_order";

export interface VDEvidence {
  sourceType: VDSourceType;
  sourceId: string;
  title: string;
  stage: KpiStage;
  creditedAt: string;
  brandId: string | null;
  deadline: string | null;
  onTime: boolean | null; // null = N/A
  revisions: number | null;
  firstPass: boolean | null;
  points?: number;
  basis: "history_submit" | "history_publish" | "linked_social_publish" | "stage_event";
}

export type VDWarningCode =
  | "no_stage_event"            // workflow không ghi sự kiện/người cho công đoạn
  | "unverified_no_history"     // đã qua duyệt nhưng thiếu lịch sử nộp
  | "submitter_unknown"         // có event nhưng không biết ai nộp
  | "missing_points";           // order verified nhưng chưa cấu hình điểm

export interface VDWarning { sourceType: VDSourceType; sourceId: string; title: string; code: VDWarningCode; message: string }

export interface VDResult {
  metricKey: string;
  /** null = "Chưa đủ dữ liệu" (không trá hình thành 0). */
  actualValue: number | null;
  dataStatus: "verified" | "insufficient_data";
  evidence: VDEvidence[];
  warnings: VDWarning[];
  supported: boolean;
}

export interface VDItem { metricKey: string; brandId?: string | null; socialId?: string | null }
export interface VDPeriod { periodStart: string; periodEnd: string }
export interface VDData {
  videos: Video[];
  designOrders: DesignOrder[];
  socialPosts: SocialPost[];
  /** Sidecar đề xuất — rỗng cho tới khi được phê duyệt. */
  stageEvents?: KpiStageEvent[];
  /** Điểm thiết kế cấu hình rõ ràng theo orderId (snapshot). */
  designPoints?: Record<string, number>;
}

type H = { at: string; byId?: string; byName?: string; toStatus?: string };

/** Lần nộp CUỐI trước lần duyệt CUỐI (theo history). */
function lastSubmitBeforeApproval(history: H[] | undefined, submit: string, approved: string) {
  const h = (history ?? []).filter((e) => e?.at && !Number.isNaN(timeOf(e.at))).slice().sort((a, b) => timeOf(a.at) - timeOf(b.at));
  let ai = -1;
  for (let i = h.length - 1; i >= 0; i--) if (h[i].toStatus === approved) { ai = i; break; }
  if (ai < 0) return { found: "none" as const };
  for (let i = ai - 1; i >= 0; i--) if (h[i].toStatus === submit) return { found: "ok" as const, entry: h[i] };
  return { found: "approved_no_submit" as const };
}

function firstTransition(history: H[] | undefined, to: string): H | null {
  const h = (history ?? []).filter((e) => e?.at && e.toStatus === to && !Number.isNaN(timeOf(e.at)))
    .sort((a, b) => timeOf(a.at) - timeOf(b.at));
  return h[0] ?? null;
}

function byMatches(e: H, emp: KpiEmployee): boolean {
  return matchesEmployee(e.byId, emp) || matchesEmployee(e.byName, emp);
}

function onTime(deadline: string | null | undefined, credited: string): boolean | null {
  const d = toDateKey(deadline ?? null);
  return d ? credited <= d : null;
}

function finish(metricKey: string, evidence: VDEvidence[], warnings: VDWarning[], forceInsufficient = false): VDResult {
  const insufficient = forceInsufficient || (evidence.length === 0 && warnings.length > 0);
  return {
    metricKey, evidence, warnings, supported: true,
    dataStatus: insufficient ? "insufficient_data" : "verified",
    actualValue: insufficient ? null : evidence.length,
  };
}

/** Credit từ sidecar event (approved của đúng version đã submit). */
function fromStageEvents(emp: KpiEmployee, stage: KpiStage, events: KpiStageEvent[] | undefined, period: VDPeriod,
  lookup: (sourceId: string) => { title: string; brandId: string | null; deadline: string | null } | null): VDEvidence[] {
  const out: VDEvidence[] = [];
  const bySrc = new Map<string, KpiStageEvent[]>();
  for (const e of events ?? []) if (e.stage === stage) bySrc.set(e.sourceId, [...(bySrc.get(e.sourceId) ?? []), e]);
  for (const [sid, evs] of bySrc) {
    const approved = evs.filter((e) => e.eventType === "approved" || e.eventType === "published").sort((a, b) => timeOf(b.occurredAt) - timeOf(a.occurredAt))[0];
    if (!approved) continue;
    const submit = stage === "video_publish" || stage === "video_shoot"
      ? approved
      : evs.filter((e) => e.eventType === "submitted" && e.version === approved.version).sort((a, b) => timeOf(b.occurredAt) - timeOf(a.occurredAt))[0];
    if (!submit || !matchesEmployee(submit.userId, emp)) continue;
    const credited = toDateKey(submit.occurredAt);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const meta = lookup(sid);
    const revisions = evs.filter((e) => e.eventType === "revision_requested").length;
    out.push({ sourceType: stage === "design_order" ? "design_order" : "video", sourceId: sid, title: meta?.title ?? sid, stage,
      creditedAt: credited, brandId: meta?.brandId ?? null, deadline: meta?.deadline ?? null,
      onTime: onTime(meta?.deadline, credited), revisions, firstPass: revisions === 0, basis: "stage_event" });
  }
  return out;
}

const videoMeta = (data: VDData, dl: (v: Video) => string | null) => (id: string) => {
  const v = data.videos.find((x) => x.id === id);
  return v ? { title: v.title, brandId: v.brandId ?? null, deadline: dl(v) } : null;
};

/* ---------- Video: script / edit (history nộp → duyệt) ---------- */
function calcVideoReviewedStage(
  metricKey: string, stage: "video_script" | "video_edit", submit: string, approved: string,
  deadlineOf: (v: Video) => string | null, passedStatuses: Set<string>,
  emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData,
): VDResult {
  const evidence: VDEvidence[] = [];
  const warnings: VDWarning[] = [];
  const sidecarIds = new Set((data.stageEvents ?? []).filter((e) => e.stage === stage).map((e) => e.sourceId));
  evidence.push(...fromStageEvents(emp, stage, data.stageEvents, period, videoMeta(data, deadlineOf))
    .filter((e) => !item.brandId || e.brandId === item.brandId));
  for (const v of data.videos) {
    if (v.status === "Đã hủy" || sidecarIds.has(v.id)) continue;
    if (item.brandId && v.brandId !== item.brandId) continue;
    const r = lastSubmitBeforeApproval(v.history, submit, approved);
    if (r.found !== "ok") {
      if (passedStatuses.has(v.status) && (matchesEmployee(v.owner, emp))) {
        warnings.push({ sourceType: "video", sourceId: v.id, title: v.title, code: "unverified_no_history",
          message: "Đã qua duyệt nhưng thiếu lịch sử nộp — không tính, không dùng owner hiện tại." });
      }
      continue;
    }
    const e = r.entry;
    if (!e.byId && !e.byName) {
      if (matchesEmployee(v.owner, emp)) warnings.push({ sourceType: "video", sourceId: v.id, title: v.title, code: "submitter_unknown",
        message: "Không xác định được người nộp bản được duyệt." });
      continue;
    }
    if (!byMatches(e, emp)) continue; // người nộp bản được duyệt mới được credit (đổi người giữa phiên bản → người nộp bản cuối)
    const credited = toDateKey(e.at);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const dl = deadlineOf(v);
    evidence.push({ sourceType: "video", sourceId: v.id, title: v.title, stage, creditedAt: credited, brandId: v.brandId ?? null,
      deadline: dl, onTime: onTime(dl, credited), revisions: null, firstPass: null, basis: "history_submit" });
  }
  return finish(metricKey, evidence, warnings);
}

const SCRIPT_PASSED = new Set(["Kịch bản đã duyệt", "Đang quay / thu tư liệu", "Đang dựng", "Chờ duyệt video", "Cần sửa video", "Video đã duyệt", "Đã bàn giao", "Đã đăng", "Hoàn thành"]);
const EDIT_PASSED = new Set(["Video đã duyệt", "Đã bàn giao", "Đã đăng", "Hoàn thành"]);

export const calcVideoScriptCompleted = (emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData) =>
  calcVideoReviewedStage("video_script_completed", "video_script", "Chờ duyệt kịch bản", "Kịch bản đã duyệt",
    (v) => v.scriptDeadline ?? null, SCRIPT_PASSED, emp, item, period, data);

/** Edit: không có deadline riêng cho dựng → N/A (không dùng deadline tổng của video). */
export const calcVideoEditCompleted = (emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData) =>
  calcVideoReviewedStage("video_edit_completed", "video_edit", "Chờ duyệt video", "Video đã duyệt",
    () => null, EDIT_PASSED, emp, item, period, data);

/* ---------- Video: shoot — workflow hiện tại KHÔNG ghi event/người quay ---------- */
export function calcVideoShootCompleted(emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData): VDResult {
  const hasSidecar = (data.stageEvents ?? []).some((e) => e.stage === "video_shoot");
  const evidence = fromStageEvents(emp, "video_shoot", data.stageEvents, period, videoMeta(data, () => null))
    .filter((e) => !item.brandId || e.brandId === item.brandId);
  const warnings: VDWarning[] = [];
  if (!hasSidecar) {
    for (const v of data.videos) {
      if (v.status === "Đã hủy" || (item.brandId && v.brandId !== item.brandId)) continue;
      if (firstTransition(v.history, "Đang dựng") || v.footageLink) {
        warnings.push({ sourceType: "video", sourceId: v.id, title: v.title, code: "no_stage_event",
          message: "Workflow không ghi người quay & sự kiện hoàn thành quay — không suy từ trạng thái Đang dựng." });
      }
    }
  }
  return finish("video_shoot_completed", evidence, warnings, !hasSidecar);
}

/* ---------- Video: published — canonical 1 video = 1 credit ---------- */
export function calcVideoPublished(emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData): VDResult {
  const evidence: VDEvidence[] = [];
  const warnings: VDWarning[] = [];
  const posts = new Map(data.socialPosts.map((p) => [p.id, p]));
  for (const v of data.videos) {
    if (v.status === "Đã hủy") continue;
    if (item.brandId && v.brandId !== item.brandId) continue;
    const linked = v.socialPostId ? posts.get(v.socialPostId) : undefined;
    if (item.socialId && linked?.channelId !== item.socialId) continue;
    // Canonical: nếu có SocialPost liên kết thì sự kiện "Đã đăng" của post là nguồn chuẩn (người đăng thật);
    // ngược lại dùng sự kiện "Đã đăng" trong history video. Không cộng cả hai.
    let ev: H | null = null;
    let basis: VDEvidence["basis"] = "history_publish";
    if (linked && linked.status !== "Đã hủy") {
      ev = firstTransition(linked.history as H[] | undefined, "Đã đăng");
      basis = "linked_social_publish";
    }
    if (!ev) { ev = firstTransition(v.history, "Đã đăng"); basis = "history_publish"; }
    if (!ev) {
      if ((v.status === "Đã đăng" || v.status === "Hoàn thành") && matchesEmployee(v.owner, emp)) {
        warnings.push({ sourceType: "video", sourceId: v.id, title: v.title, code: "unverified_no_history",
          message: "Đã đăng nhưng không có sự kiện đăng — không xác định người đăng." });
      }
      continue;
    }
    if (!ev.byId && !ev.byName) continue;
    if (!byMatches(ev, emp)) continue;
    const credited = toDateKey(ev.at);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const dl = v.scheduledPublishDate ?? null;
    evidence.push({ sourceType: "video", sourceId: v.id, title: v.title, stage: "video_publish", creditedAt: credited,
      brandId: v.brandId ?? null, deadline: dl, onTime: onTime(dl, credited), revisions: null, firstPass: null, basis });
  }
  return finish("video_published", evidence, warnings);
}

/* ---------- Design ---------- */
const ORDER_PASSED = new Set(["Đã duyệt", "Đã bàn giao", "Hoàn thành"]);

function designEvidence(emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData) {
  const evidence: VDEvidence[] = [];
  const warnings: VDWarning[] = [];
  const seen = new Set<string>(); // 1 order = 1 credit, không đếm từng file
  for (const o of data.designOrders) {
    if (o.status === "Đã hủy" || seen.has(o.id)) continue;
    if (item.brandId && o.brandId !== item.brandId) continue;
    const r = lastSubmitBeforeApproval(o.history, "Chờ duyệt", "Đã duyệt");
    if (r.found !== "ok") {
      if (ORDER_PASSED.has(o.status) && matchesEmployee(o.assignee, emp)) {
        warnings.push({ sourceType: "design_order", sourceId: o.id, title: o.title, code: "unverified_no_history",
          message: "Order đã duyệt nhưng thiếu lịch sử nộp bản được duyệt — không tính." });
      }
      continue;
    }
    const e = r.entry;
    if (!e.byId && !e.byName) continue;
    if (!byMatches(e, emp)) continue;
    const credited = toDateKey(e.at); // ngày designer nộp bản được duyệt, KHÔNG phải ngày duyệt
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    seen.add(o.id);
    const revisions = o.revisions ?? 0;
    const pts = data.designPoints?.[o.id];
    evidence.push({ sourceType: "design_order", sourceId: o.id, title: o.title, stage: "design_order", creditedAt: credited,
      brandId: o.brandId ?? null, deadline: o.deadline ?? null, onTime: onTime(o.deadline, credited),
      revisions, firstPass: revisions === 0, points: typeof pts === "number" && Number.isFinite(pts) ? pts : undefined, basis: "history_submit" });
  }
  return { evidence, warnings };
}

export function calcDesignOrderCompleted(emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData): VDResult {
  const { evidence, warnings } = designEvidence(emp, item, period, data);
  return finish("design_order_completed", evidence, warnings);
}

export function calcDesignPointsCompleted(emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData): VDResult {
  const { evidence, warnings } = designEvidence(emp, item, period, data);
  for (const e of evidence) if (e.points === undefined) {
    warnings.push({ sourceType: "design_order", sourceId: e.sourceId, title: e.title, code: "missing_points",
      message: "Order verified nhưng chưa cấu hình điểm — không tự gán theo loại order." });
  }
  const missing = evidence.some((e) => e.points === undefined);
  const total = evidence.reduce((s, e) => s + (e.points ?? 0), 0);
  return {
    metricKey: "design_points_completed", evidence, warnings, supported: true,
    dataStatus: missing ? "insufficient_data" : "verified",
    actualValue: missing ? null : Math.round(total * 100) / 100,
  };
}

export function calculateVideoDesignItem(emp: KpiEmployee, item: VDItem, period: VDPeriod, data: VDData): VDResult {
  switch (item.metricKey) {
    case "video_script_completed": return calcVideoScriptCompleted(emp, item, period, data);
    case "video_shoot_completed": return calcVideoShootCompleted(emp, item, period, data);
    case "video_edit_completed": return calcVideoEditCompleted(emp, item, period, data);
    case "video_published": return calcVideoPublished(emp, item, period, data);
    case "design_order_completed": return calcDesignOrderCompleted(emp, item, period, data);
    case "design_points_completed": return calcDesignPointsCompleted(emp, item, period, data);
    default: return { metricKey: item.metricKey, actualValue: null, dataStatus: "insufficient_data", evidence: [], warnings: [], supported: false };
  }
}
