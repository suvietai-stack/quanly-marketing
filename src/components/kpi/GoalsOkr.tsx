/** Trang Mục tiêu (OKR gọn): Mục tiêu → chọn KR từ thư viện 19 KR → đặt chỉ tiêu → theo dõi. Dùng chung engine KPI hiện có. */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { isDivisible, allocationSummary, checkAllocationScope, aggregateKr, canHardDelete } from "@/lib/kpi/allocation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BASIC_KR_LIST, BASIC_KR_GROUPS, AVAILABILITY_LABEL, getKpiMetric, isAssignable, isManualKr } from "@/lib/kpi/metrics";
import { calculateKrItem, KR_ENGINE_KEYS, krAchieved, type KrEntry, type KrEvidence } from "@/lib/kpi/calculateKr";
import { calculateKpiItem } from "@/lib/kpi/calculateKpi";
import { calculateVideoDesignItem } from "@/lib/kpi/calculateVideoDesign";
import { createKpiService, KpiError, type KpiDb, type NewItem } from "@/lib/kpi/service";
import { cloudRepository, flushKpi } from "@/lib/kpi/cloudRepository";
import { evaluateKr, directionOf, krDeadline, krsOfGoal, lockedResultOf, entryStatus, KR_STATE_TONE } from "@/lib/kpi/evaluate";
import { monthsIn } from "@/lib/kpi/calculateKr";
import { MONTHLY_SOURCE } from "@/lib/kpi/service";
import type { EmployeeKpiItem, Goal, GoalKr, GoalScope, GoalStatus, KpiMetricDefinition, KpiPeriodType } from "@/lib/kpi/types";

const svc = createKpiService(cloudRepository);
const inp = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
const btn = "inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50";
const btn2 = "inline-flex h-8 items-center gap-1 rounded-md border border-input px-2.5 text-xs hover:bg-muted";
const lbl = "space-y-1 text-xs font-medium text-muted-foreground";
type Actor = { id: string; isAdmin: boolean };

async function run(fn: () => void, ok: string, after: () => void) {
  try { fn(); await flushKpi(); toast.success(ok); after(); return true; }
  catch (e) { toast.error(e instanceof KpiError ? e.message : `Không lưu được: ${(e as Error).message ?? e}`); after(); return false; }
}
const fmtD = (d?: string | null) => (d ? d.split("-").reverse().join("/") : "—");
const f2 = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
function rangeOf(t: KpiPeriodType, d = new Date()): [string, string] {
  if (t === "week") { const day = (d.getDay() + 6) % 7; const s = new Date(d); s.setDate(d.getDate() - day); const e = new Date(s); e.setDate(s.getDate() + 6); return [f2(s), f2(e)]; }
  if (t === "quarter") { const q = Math.floor(d.getMonth() / 3); return [f2(new Date(d.getFullYear(), q * 3, 1)), f2(new Date(d.getFullYear(), q * 3 + 3, 0))]; }
  return [f2(new Date(d.getFullYear(), d.getMonth(), 1)), f2(new Date(d.getFullYear(), d.getMonth() + 1, 0))];
}
const PERIOD_T: [KpiPeriodType, string][] = [["week", "Tuần"], ["month", "Tháng"], ["quarter", "Quý"], ["custom", "Tùy chỉnh"]];
const GOAL_STATUS: Record<string, string> = { draft: "Nháp", active: "Đang thực hiện", closed: "Đã đóng", cancelled: "Đã hủy" };
const AV_TONE: Record<string, string> = { linked: "bg-primary/10 text-primary", periodic: "bg-accent text-accent-foreground", manual: "bg-warning/15 text-warning-foreground", pending: "bg-muted text-muted-foreground", configure: "bg-muted text-muted-foreground", none: "bg-muted text-muted-foreground" };

/* ---------- Kết quả KR — một hàm dùng chung ---------- */
export type KrActual = { value: number | null; warnings: number; status?: string; evidence: { id: string; title: string; at: string; link?: string; type: string; websiteId?: string | null }[] };
export function useKrActual() {
  const s = useStore();
  const users = useAuth((x) => x.users);
  return (userId: string, it: EmployeeKpiItem, periodStart: string, periodEnd: string, locked = false): KrActual => {
    const snap = locked ? lockedResultOf(it) : null;
    if (snap) return { value: snap.actual, warnings: 0, status: `Kết quả đã chốt khi khóa kỳ${snap.lockedAt ? ` (${snap.lockedAt.slice(0, 10).split("-").reverse().join("/")})` : ""}`,
      evidence: snap.evidence.map((e) => ({ id: e.id, title: `${e.type} · ${e.id}`, at: e.at, type: e.type })) };
    const u = users.find((x) => x.id === userId);
    const emp = { id: userId, fullName: u?.fullName, username: u?.username };
    const period = { periodStart, periodEnd };
    const item = { metricKey: it.metricKey, targetValue: it.targetValue, brandId: it.brandId, websiteId: it.websiteId, socialId: it.socialId };
    const evK = (e: KrEvidence) => ({ id: e.sourceId, title: e.title, at: e.creditedAt, link: e.note?.startsWith("http") ? e.note : undefined, type: e.sourceType, websiteId: e.websiteId });
    if (KR_ENGINE_KEYS.has(it.metricKey)) {
      const r = calculateKrItem(emp, { ...item, metadata: it.metadata }, period, { tasks: s.tasks, keywords: s.keywords, mapPosts: s.mapPosts, websites: s.websites, webContents: s.webContents, socialPosts: s.socialPosts, growth: s.growth });
      return { value: r.actualValue, warnings: r.warnings.length, status: r.status, evidence: r.evidence.map(evK) };
    }
    if (["web_content_completed", "social_post_completed", "task_completed"].includes(it.metricKey)) {
      const r = calculateKpiItem(emp, item, period, { webContents: s.webContents, socialPosts: s.socialPosts, tasks: s.tasks });
      return { value: r.evidence.length === 0 && r.warnings.length ? null : r.actualValue, warnings: r.warnings.length, evidence: r.evidence.map((e) => ({ id: e.sourceId, title: e.title, at: e.creditedAt, type: e.sourceType, websiteId: e.websiteId })) };
    }
    const r = calculateVideoDesignItem(emp, item, period, { videos: s.videos, designOrders: s.orders, socialPosts: s.socialPosts });
    return { value: r.actualValue, warnings: r.warnings.length, evidence: r.evidence.map((e) => ({ id: e.sourceId, title: e.title, at: e.creditedAt, type: e.sourceType })) };
  };
}

function krState(m: KpiMetricDefinition | undefined, a: KrActual, it: EmployeeKpiItem, end: string) {
  const dir = directionOf(it.metricKey);
  const ev = evaluateKr({ actual: a.value, target: it.targetValue, direction: dir, deadline: krDeadline(it, end), today: new Date().toISOString().slice(0, 10),
    unit: m?.unit ?? it.unit, evidenceDates: a.evidence.map((x) => x.at), warnings: a.warnings });
  const t = KR_STATE_TONE[ev.state];
  const tone = t === "good" ? "text-success" : t === "warn" ? "text-warning-foreground" : t === "bad" ? "text-destructive" : t === "info" ? "text-primary" : "text-muted-foreground";
  return { pct: ev.pct, label: ev.label, tone, dir, state: ev.state, deadline: ev.deadline, completedAt: ev.completedAt };
}
const unitTxt = (u: string) => (u === "percent" ? "%" : u === "currency" ? " đ" : u === "point" ? " điểm" : "");

/* ---------- Ưu tiên KR theo kênh ---------- */
function priorityKeys(kind: "web" | "facebook" | "tiktok" | "") {
  if (kind === "web") return ["seo_keyword_top", "seo_organic_clicks", "web_post_published", "web_content_completed", "task_on_time_rate", "task_first_pass_rate"];
  if (kind === "facebook") return ["social_post_published", "social_views", "task_on_time_rate", "task_first_pass_rate"];
  if (kind === "tiktok") return ["video_edit_completed", "video_view_threshold", "social_views", "task_on_time_rate", "task_first_pass_rate"];
  return [];
}

/* ---------- Bản nháp KR ---------- */
type Alloc = { key: string; userId: string; target: number; channel: string };
type Draft = { allocs: Alloc[]; key: string; deadline: string; metricKey: string; ownerId: string; channel: string; target: number; label: string; keywordIds: string[]; threshold: number; taskIds: string[]; viewThreshold: number; mode: "value" | "growth" };
const rid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
const newDraft = (metricKey: string, ownerId: string, channel = "", deadline = ""): Draft => {
  const m = getKpiMetric(metricKey);
  const tgt = metricKey === "task_on_time_rate" ? 95 : metricKey === "task_first_pass_rate" ? 90 : m?.direction === "at_most" ? 1 : m?.needs === "keyword" ? 1 : 10;
  return { allocs: [{ key: rid(), userId: ownerId, target: tgt, channel: "" }], key: rid(), deadline, metricKey, ownerId, channel: m && (m.scopes.includes("website") || m.scopes.includes("social")) ? channel : "",
    target: metricKey === "task_on_time_rate" ? 95 : metricKey === "task_first_pass_rate" ? 90 : m?.direction === "at_most" ? 1 : m?.needs === "keyword" ? 1 : 10, label: "", keywordIds: [], threshold: 3, taskIds: [], viewThreshold: 10000, mode: "value" };
};
/** Dòng phân bổ → chỉ tiêu nhân sự (dùng chung engine hiện có). */
function allocItem(d: Draft, a: Alloc, brandId: string, krId: string | null): NewItem {
  const base = draftToItem(d, brandId);
  const ch = a.channel || d.channel;
  const [t, id] = ch.split(":");
  return { ...base, krId, targetValue: isDivisible(d.metricKey) ? a.target : d.target, websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null,
    metadata: { ...base.metadata, clientKey: `${d.key}:${a.key}` } };
}
function draftToItem(d: Draft, brandId: string): NewItem {
  const m = getKpiMetric(d.metricKey)!;
  const [t, id] = d.channel.split(":");
  const meta: Record<string, unknown> = {};
  if (m.needs === "keyword") Object.assign(meta, { keywordIds: d.keywordIds, threshold: d.threshold });
  if (m.needs === "tasks") meta.taskIds = d.taskIds;
  if (m.needs === "views") meta.viewThreshold = d.viewThreshold;
  if (["seo_organic_clicks", "social_views"].includes(d.metricKey)) meta.mode = d.mode;
  if (d.deadline) meta.deadline = d.deadline;
  meta.clientKey = d.key;
  return { metricKey: d.metricKey, targetValue: d.target, brandId: brandId || null, websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null, label: d.label.trim() || null, metadata: meta };
}

/* ---------- Bước 2: thư viện ---------- */
function KrPicker({ onPick, kind }: { onPick: (key: string) => void; kind: "web" | "facebook" | "tiktok" | "" }) {
  const [q, setQ] = useState("");
  const pri = priorityKeys(kind);
  const list = BASIC_KR_LIST.filter((m) => !q || m.label.toLowerCase().includes(q.toLowerCase()));
  const Card = (m: KpiMetricDefinition) => {
    const ok = isAssignable(m);
    return (
      <button key={m.key} disabled={!ok} onClick={() => onPick(m.key)} title={m.rule ?? m.source}
        className="flex items-start justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50">
        <span className="min-w-0"><span className="block font-medium">{m.basic ? `${m.basic}. ` : ""}{m.label}</span><span className="block truncate text-[11px] text-muted-foreground">{m.source}</span></span>
        <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px]", AV_TONE[m.availability!])}>{AVAILABILITY_LABEL[m.availability!]}</span>
      </button>
    );
  };
  return (
    <div className="space-y-3">
      <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><input className={`${inp} pl-8`} placeholder="Tìm KR…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {!q && pri.length > 0 && (
        <div><div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">Gợi ý cho kênh đã chọn</div>
          <div className="grid gap-2 sm:grid-cols-2">{pri.map((k) => Card(getKpiMetric(k)!))}</div></div>
      )}
      {BASIC_KR_GROUPS.map((g) => {
        const ms = list.filter((m) => m.krGroup === g);
        if (!ms.length) return null;
        return (
          <div key={g}><div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g === "Tùy chỉnh" ? "+ KR tùy chỉnh" : `KR ${g}`}</div>
            <div className="grid gap-2 sm:grid-cols-2">{ms.map(Card)}</div></div>
        );
      })}
    </div>
  );
}

/* ---------- Phân bổ chỉ tiêu (trong form KR) ---------- */
function AllocEditor({ d, set, webOpts, socOpts }: { d: Draft; set: (d: Draft) => void; webOpts: { id: string; name: string }[]; socOpts: { id: string; name: string; platform: string }[] }) {
  const users = useAuth((s) => s.users);
  const div = isDivisible(d.metricKey);
  const sum = allocationSummary({ targetValue: d.target, metricKey: d.metricKey }, d.allocs);
  const upd = (allocs: Alloc[]) => set({ ...d, allocs, ownerId: allocs[0]?.userId ?? "" });
  return (
    <div className="space-y-1.5 rounded-md border border-border p-2.5">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{div ? "Phân bổ chỉ tiêu cho nhân sự" : "Người chịu trách nhiệm (KR này không chia theo nhân sự)"}</span>
        {div && <span className={cn("font-semibold", sum.diff === 0 ? "text-success" : "text-warning-foreground")}>Đã phân bổ {sum.allocated}/{d.target}{sum.message ? ` · ${sum.message}` : ""}</span>}
      </div>
      {d.allocs.map((a, i) => (
        <div key={a.key} className="grid grid-cols-[1fr_auto] gap-1.5 sm:grid-cols-[1.4fr_1.4fr_90px_auto]">
          <select className={inp} value={a.userId} onChange={(e) => upd(d.allocs.map((x, j) => (j === i ? { ...x, userId: e.target.value } : x)))}>
            <option value="">— Nhân sự —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
          </select>
          {(webOpts.length > 0 || socOpts.length > 0) ? (
            <select className={inp} value={a.channel} onChange={(e) => upd(d.allocs.map((x, j) => (j === i ? { ...x, channel: e.target.value } : x)))}>
              <option value="">Toàn phạm vi KR</option>
              {webOpts.map((w) => <option key={w.id} value={`w:${w.id}`}>Web: {w.name}</option>)}
              {socOpts.map((s) => <option key={s.id} value={`s:${s.id}`}>{s.platform}: {s.name}</option>)}
            </select>) : <span className="hidden text-xs text-muted-foreground sm:flex sm:items-center">Theo phạm vi KR</span>}
          {div ? <input type="number" min={1} className={inp} value={a.target} onChange={(e) => upd(d.allocs.map((x, j) => (j === i ? { ...x, target: Number(e.target.value) } : x)))} /> : <span className="hidden sm:block" />}
          <button className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30" disabled={d.allocs.length === 1} onClick={() => upd(d.allocs.filter((_, j) => j !== i))} aria-label="Bỏ dòng"><X className="h-4 w-4" /></button>
        </div>
      ))}
      {div && <button className={btn2} onClick={() => upd([...d.allocs, { key: rid(), userId: "", target: Math.max(1, -sum.diff || 1), channel: "" }])}><Plus className="h-3.5 w-3.5" />Thêm nhân sự</button>}
    </div>
  );
}

/** Lưu 1 KR chung + các dòng phân bổ. Thử lại không tạo trùng (clientKey). */
async function saveDraftKr(actor: Actor, goalId: string, d: Draft, brandId: string, ptype: KpiPeriodType, start: string, end: string) {
  let krId = (svc.list().krs ?? []).find((k) => (k.metadata as { clientKey?: string }).clientKey === d.key)?.id;
  if (!krId) {
    const [t, id] = d.channel.split(":");
    const base = draftToItem(d, brandId);
    krId = svc.saveKr(actor, { goalId, metricKey: d.metricKey, targetValue: d.target, label: base.label, brandId: brandId || null, websiteId: t === "w" ? id : null,
      socialId: t === "s" ? id : null, deadline: d.deadline || null, metadata: { ...base.metadata, clientKey: d.key } }).id;
    await flushKpi();
  }
  for (const a of d.allocs) {
    svc.assign(actor, { userId: a.userId, periodType: ptype, periodStart: start, periodEnd: end, goalId, items: [allocItem(d, a, brandId, krId)] });
    await flushKpi();
  }
  return krId;
}

/** Kiểm tra 1 KR nháp (không ghi gì). */
function validateDraft(actor: Actor, d: Draft, brandId: string, ptype: KpiPeriodType, start: string, end: string, brandOf: (k: "website" | "social", id: string) => string | null | undefined): string[] {
  const errs: string[] = [];
  const probe = createKpiService({ load: () => ({ goals: [], periods: [], items: [], adjustments: [] }), save: () => {} });
  const [t, id] = d.channel.split(":");
  const kr = { brandId: brandId || null, websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null };
  const users = new Set<string>();
  for (const a of d.allocs) {
    if (!a.userId) { errs.push("Có dòng phân bổ chưa chọn nhân sự."); continue; }
    const it = allocItem(d, a, brandId, null);
    const sc = checkAllocationScope(kr, it, brandOf); if (sc) errs.push(sc);
    const k = `${a.userId}|${a.channel}`; if (users.has(k)) errs.push("Một nhân sự bị phân bổ 2 lần cùng phạm vi — hãy gộp lại."); users.add(k);
    try { probe.assign({ id: actor.id, isAdmin: true }, { userId: a.userId, periodType: ptype, periodStart: start, periodEnd: end, items: [it] }); }
    catch (e) { errs.push((e as Error).message); }
  }
  return [...new Set(errs)];
}

/* ---------- Bước 3: trường nhập theo loại KR ---------- */
function KrFields({ d, set, brandId, onRemove, start, end }: { d: Draft; set: (d: Draft) => void; brandId: string; onRemove: () => void; start: string; end: string }) {
  const users = useAuth((s) => s.users);
  const { websites, socials, keywords, tasks } = useStore();
  const m = getKpiMetric(d.metricKey)!;
  const owner = users.find((u) => u.id === d.ownerId);
  const webOpts = m.scopes.includes("website") ? websites.filter((w) => !brandId || w.brandId === brandId) : [];
  const socOpts = m.scopes.includes("social") ? socials.filter((s) => !brandId || s.brandId === brandId) : [];
  const channelRequired = m.needs === "website" || m.needs === "social" || m.needs === "views";
  const kws = keywords.filter((k) => (d.channel.startsWith("w:") ? k.websiteId === d.channel.slice(2) : !brandId || websites.find((w) => w.id === k.websiteId)?.brandId === brandId));
  const ts = tasks.filter((t) => t.status !== "Đã hủy" && (!brandId || t.brandId === brandId) && (!owner || !t.assignee || t.assignee === owner.fullName || t.assignee === owner.username));
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const growthOk = ["seo_organic_clicks", "social_views"].includes(d.metricKey);
  const pctTarget = m.unit === "percent" || (growthOk && d.mode === "growth");
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div><div className="text-sm font-semibold">{d.label || m.label}</div><div className="text-[11px] text-muted-foreground">{m.source}{m.rule ? ` · ${m.rule}` : ""}</div></div>
        <button onClick={onRemove} className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Bỏ KR"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(webOpts.length > 0 || socOpts.length > 0) && (
          <label className={lbl}>{m.needs === "views" ? "Tài khoản video" : socOpts.length && !webOpts.length ? "Tài khoản Social" : webOpts.length && !socOpts.length ? "Website" : "Website / Tài khoản"}
            <select className={inp} value={d.channel} onChange={(e) => set({ ...d, channel: e.target.value, keywordIds: [] })}>
              <option value="">{channelRequired ? "— Chọn —" : "Toàn dự án"}</option>
              {webOpts.map((w) => <option key={w.id} value={`w:${w.id}`}>Web: {w.name}</option>)}
              {socOpts.filter((s) => m.needs !== "views" || ["TikTok", "YouTube", "Facebook Page", "Instagram"].includes(s.platform)).map((s) => <option key={s.id} value={`s:${s.id}`}>{s.platform}: {s.name}</option>)}
            </select></label>
        )}
        {growthOk && (
          <label className={lbl}>Cách đặt chỉ tiêu
            <select className={inp} value={d.mode} onChange={(e) => set({ ...d, mode: e.target.value as Draft["mode"] })}>
              <option value="value">Số lượng cần đạt</option><option value="growth">% tăng so với kỳ gốc liền trước</option>
            </select></label>
        )}
        {m.needs === "views" && (
          <label className={lbl}>Ngưỡng lượt xem / video
            <input type="number" min={1} className={inp} value={d.viewThreshold} onChange={(e) => set({ ...d, viewThreshold: Number(e.target.value) })} /></label>
        )}
        {m.needs === "keyword" && (
          <label className={lbl}>Top cần đạt
            <select className={inp} value={d.threshold} onChange={(e) => set({ ...d, threshold: Number(e.target.value) })}>{[1, 3, 5, 10, 20].map((n) => <option key={n} value={n}>Top {n}</option>)}</select></label>
        )}
        <label className={lbl}>{m.needs === "keyword" ? "Số từ khóa đạt Top" : m.needs === "views" ? "Số video đạt ngưỡng" : m.direction === "at_most" ? "Không vượt quá" : "Chỉ tiêu"}{pctTarget ? " (%)" : m.unit === "currency" ? " (đ)" : ""}
          <input type="number" min={1} max={m.needs === "keyword" && d.keywordIds.length ? d.keywordIds.length : undefined} className={inp} value={d.target} onChange={(e) => { const v = Number(e.target.value); set({ ...d, target: v, allocs: isDivisible(d.metricKey) ? d.allocs : d.allocs.map((x) => ({ ...x, target: v })) }); }} /></label>
        <label className={lbl}>Deadline KR
          <input type="date" className={inp} min={start} max={end} value={d.deadline || end} onChange={(e) => set({ ...d, deadline: e.target.value })} /></label>
      </div>
      {m.needs === "keyword" && d.keywordIds.length > 0 && d.target > d.keywordIds.length && <p className="text-[11px] text-destructive">Chỉ tiêu không được vượt quá {d.keywordIds.length} từ khóa đã chọn.</p>}
      {MONTHLY_SOURCE.has(d.metricKey) && !monthsIn(start, end) && <p className="text-[11px] text-destructive">Chỉ số này lấy số liệu theo tháng. Kỳ hiện tại không trọn tháng — hãy chọn kỳ Tháng hoặc Quý.</p>}
      {(d.deadline || end) > end || (d.deadline && d.deadline < start) ? <p className="text-[11px] text-destructive">Deadline phải nằm trong kỳ thực hiện.</p> : null}
      <AllocEditor d={d} set={set} webOpts={d.channel ? [] : webOpts} socOpts={d.channel ? [] : socOpts} />
      {(m.needs === "tasks" || m.needs === "label") && (
        <label className={lbl}>Tên kết quả cần đạt
          <input className={inp} placeholder="VD: Nghiên cứu 3 bộ từ khóa" value={d.label} onChange={(e) => set({ ...d, label: e.target.value })} /></label>
      )}
      {m.needs === "keyword" && (
        <div className={lbl}>Từ khóa từ Check Top ({d.keywordIds.length} đã chọn)
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2">
            {kws.map((k) => <label key={k.id} className="flex items-center gap-2 text-sm font-normal text-foreground"><input type="checkbox" checked={d.keywordIds.includes(k.id)} onChange={() => { const ids = toggle(d.keywordIds, k.id); set({ ...d, keywordIds: ids, target: Math.max(1, Math.min(d.target, ids.length || 1)) }); }} />{k.keyword}<span className="text-xs text-muted-foreground">{k.currentTop ? `hiện Top ${k.currentTop}` : "chưa kiểm tra"}</span></label>)}
            {!kws.length && <p className="text-xs">Chưa có từ khóa trong Check Top của phạm vi này.</p>}
          </div></div>
      )}
      {m.needs === "tasks" && (
        <div className={lbl}>Liên kết Task có sẵn ({d.taskIds.length}) — tạo Task mới ở trang Task
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2">
            {ts.map((t) => <label key={t.id} className="flex items-center gap-2 text-sm font-normal text-foreground"><input type="checkbox" checked={d.taskIds.includes(t.id)} onChange={() => set({ ...d, taskIds: toggle(d.taskIds, t.id) })} />{t.title}<span className="text-xs text-muted-foreground">{t.status}</span></label>)}
            {!ts.length && <p className="text-xs">Không có Task phù hợp.</p>}
          </div></div>
      )}
      {isManualKr(m) && <p className="text-[11px] text-muted-foreground">{m.availability === "pending" ? "Chờ kết nối nguồn dữ liệu. " : ""}Kết quả được ghi nhận kèm bằng chứng và chỉ tính sau khi quản lý xác nhận.</p>}
      {m.availability === "periodic" && <p className="text-[11px] text-muted-foreground">Lấy từ báo cáo tăng trưởng nhập theo tháng — không phải tích hợp tự động.</p>}
    </div>
  );
}

/* ---------- Form tạo Mục tiêu (3 bước) ---------- */
export const SCOPE_LABEL: Record<GoalScope, string> = { department: "Phòng ban", team: "Nhóm", project: "Dự án", personal: "Cá nhân" };
type GoalMeta = { scope?: GoalScope; scopeRef?: string; coordinatorId?: string; ownerId?: string; deadline?: string; periodType?: KpiPeriodType; archived?: boolean };
function useBrandOf() {
  const { websites, socials } = useStore();
  return (k: "website" | "social", id: string) => (k === "website" ? websites.find((w) => w.id === id)?.brandId : socials.find((s) => s.id === id)?.brandId);
}
function ScopeFields({ v, set }: { v: { scope: GoalScope; scopeRef: string; coordinatorId: string }; set: (p: Partial<{ scope: GoalScope; scopeRef: string; coordinatorId: string }>) => void }) {
  const users = useAuth((s) => s.users);
  const { brands } = useStore();
  return (<>
    <label className={lbl}>Phạm vi mục tiêu
      <select className={inp} value={v.scope} onChange={(e) => { const sc = e.target.value as GoalScope; set({ scope: sc, scopeRef: sc === "department" ? "Phòng Marketing" : "" }); }}>
        {Object.entries(SCOPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
    <label className={lbl}>{v.scope === "department" ? "Phòng ban" : v.scope === "team" ? "Tên nhóm" : v.scope === "project" ? "Dự án" : "Nhân viên"}
      {v.scope === "project" ? <select className={inp} value={v.scopeRef} onChange={(e) => set({ scopeRef: e.target.value })}><option value="">— Chọn —</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        : v.scope === "personal" ? <select className={inp} value={v.scopeRef} onChange={(e) => set({ scopeRef: e.target.value })}><option value="">— Chọn —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}</select>
        : <input className={inp} value={v.scopeRef} placeholder={v.scope === "team" ? "VD: Nhóm SEO" : ""} onChange={(e) => set({ scopeRef: e.target.value })} />}</label>
    <label className={lbl}>Người điều phối (tùy chọn)
      <select className={inp} value={v.coordinatorId} onChange={(e) => set({ coordinatorId: e.target.value })}><option value="">— Không —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}</select></label>
  </>);
}

function GoalWizard({ actor, onDone }: { actor: Actor; onDone: () => void }) {
  const { brands, websites, socials } = useStore();
  const brandOf = useBrandOf();
  const [step, setStep] = useState(1);
  const [ptype, setPtype] = useState<KpiPeriodType>("month");
  const [g, setG] = useState(() => { const [s, e] = rangeOf("month"); return { title: "", brandId: "", channel: "", scope: "department" as GoalScope, scopeRef: "Phòng Marketing", coordinatorId: "", start: s, end: e, deadline: e }; });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const kind = g.channel.startsWith("w:") ? "web" : g.channel.startsWith("s:") ? (socials.find((s) => s.id === g.channel.slice(2))?.platform === "TikTok" ? "tiktok" : "facebook") : "";
  const setType = (t: KpiPeriodType) => { setPtype(t); if (t !== "custom") { const [s, e] = rangeOf(t); setG({ ...g, start: s, end: e, deadline: e }); setDrafts(drafts.map((d) => ({ ...d, deadline: e }))); } };
  const info = g.title.trim() && g.start && g.end && g.end >= g.start && (g.scope === "department" || g.scope === "team" ? true : !!g.scopeRef);

  const [savedGoalId, setSavedGoalId] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ ok: string[]; failed: string[] } | null>(null);
  const draftName = (d: Draft) => d.label || getKpiMetric(d.metricKey)?.label || d.metricKey;
  const validateAll = (): string[] => {
    const errs: string[] = [];
    if (g.deadline < g.start || g.deadline > g.end) errs.push("Deadline mục tiêu phải nằm trong kỳ.");
    for (const d of drafts) validateDraft(actor, d, g.brandId, ptype, g.start, g.end, brandOf).forEach((e) => errs.push(`${draftName(d)}: ${e}`));
    return errs;
  };
  const save = async () => {
    const errs = validateAll();
    if (errs.length) { toast.error(`Chưa lưu gì — cần sửa ${errs.length} lỗi`, { description: errs.join("\n") }); return; }
    setSaving(true);
    const unbalanced = drafts.filter((d) => !allocationSummary({ targetValue: d.target, metricKey: d.metricKey }, d.allocs).balanced);
    let goalId = savedGoalId;
    const [t, id] = g.channel.split(":");
    if (!goalId) {
      try {
        goalId = svc.saveGoal(actor, { title: g.title, periodStart: g.start, periodEnd: g.end, status: unbalanced.length ? "draft" : "active", brandId: g.brandId || null,
          websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null,
          metadata: { scope: g.scope, scopeRef: g.scopeRef, coordinatorId: g.coordinatorId || null, deadline: g.deadline, periodType: ptype } }).id;
        await flushKpi();
        setSavedGoalId(goalId);
      } catch (e) { toast.error(`Chưa tạo được mục tiêu: ${(e as Error).message}`); setSaving(false); return; }
    }
    const okNames: string[] = []; const failed: string[] = []; const done = new Set(savedKeys);
    for (const d of drafts.filter((x) => !done.has(x.key))) {
      try { await saveDraftKr(actor, goalId, d, g.brandId, ptype, g.start, g.end); done.add(d.key); okNames.push(draftName(d)); }
      catch (e) { failed.push(`${draftName(d)}: ${e instanceof KpiError ? e.message : (e as Error).message}`); }
    }
    setSavedKeys(done); setSaving(false);
    if (failed.length) { setResult({ ok: okNames, failed }); toast.error(`Mục tiêu đã lưu, còn ${failed.length} KR chưa lưu được`, { description: "Bấm \"Lưu lại KR lỗi\" sau khi sửa — phần đã lưu sẽ không bị tạo trùng." }); return; }
    if (unbalanced.length) toast.warning(`Đã lưu dạng Nháp: ${unbalanced.length} KR chưa phân bổ khớp chỉ tiêu. Hoàn tất phân bổ rồi chuyển sang "Đang thực hiện".`);
    else toast.success(`Đã lưu mục tiêu${drafts.length ? ` và ${drafts.length} KR` : ""}`);
    onDone();
  };

  const Steps = (
    <div className="flex items-center gap-2 text-xs">
      {["Mục tiêu", "Chọn KR", "Chỉ tiêu & phân bổ"].map((s, i) => (
        <button key={s} disabled={i + 1 > step && !info} onClick={() => setStep(i + 1)} className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
          <span className="font-semibold">{i + 1}</span>{s}{i === 2 && drafts.length ? ` (${drafts.length})` : ""}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 rounded-xl border border-primary/30 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Tạo mục tiêu</h2>{Steps}</div>
      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className={`${lbl} sm:col-span-2`}>Tên mục tiêu
            <input className={inp} autoFocus placeholder="VD: Hoàn thành kế hoạch Marketing tháng 10" value={g.title} onChange={(e) => setG({ ...g, title: e.target.value })} /></label>
          <ScopeFields v={g} set={(p) => setG({ ...g, ...p })} />
          <label className={lbl}>Dự án đo lường KR (mặc định)
            <select className={inp} value={g.brandId} onChange={(e) => setG({ ...g, brandId: e.target.value, channel: "" })}><option value="">Nhiều dự án</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label className={lbl}>Kênh chính (tùy chọn)
            <select className={inp} value={g.channel} disabled={!g.brandId} onChange={(e) => setG({ ...g, channel: e.target.value })}>
              <option value="">Toàn dự án</option>
              {websites.filter((w) => w.brandId === g.brandId).map((w) => <option key={w.id} value={`w:${w.id}`}>Web: {w.name}</option>)}
              {socials.filter((s) => s.brandId === g.brandId).map((s) => <option key={s.id} value={`s:${s.id}`}>{s.platform}: {s.name}</option>)}
            </select></label>
          <div className={lbl}>Thời gian
            <div className="flex rounded-md bg-muted p-0.5">{PERIOD_T.map(([k, v]) => <button key={k} onClick={() => setType(k)} className={cn("flex-1 rounded px-2 py-1.5 text-xs", ptype === k ? "bg-background font-medium text-foreground shadow-sm" : "")}>{v}</button>)}</div></div>
          <label className={lbl}>Từ ngày – đến ngày
            <div className="flex gap-1"><input type="date" className={inp} value={g.start} disabled={ptype !== "custom"} onChange={(e) => setG({ ...g, start: e.target.value })} /><input type="date" className={inp} value={g.end} disabled={ptype !== "custom"} onChange={(e) => setG({ ...g, end: e.target.value })} /></div></label>
          <label className={lbl}>Deadline
            <input type="date" className={inp} value={g.deadline} onChange={(e) => setG({ ...g, deadline: e.target.value })} /></label>
        </div>
      )}
      {step === 2 && <KrPicker kind={kind} onPick={(k) => { setDrafts([...drafts, newDraft(k, g.scope === "personal" ? g.scopeRef : "", g.channel, g.deadline)]); setStep(3); }} />}
      {step === 3 && (
        <div className="space-y-3">
          {drafts.map((d, i) => <KrFields key={d.key} d={d} brandId={g.brandId} start={g.start} end={g.end} set={(nd) => setDrafts(drafts.map((x, j) => (j === i ? nd : x)))} onRemove={() => setDrafts(drafts.filter((_, j) => j !== i))} />)}
          {!drafts.length && <p className="text-sm text-muted-foreground">Chưa chọn KR nào.</p>}
          <button className={btn2} onClick={() => setStep(2)}><Plus className="h-3.5 w-3.5" />Chọn thêm KR</button>
        </div>
      )}
      {result && result.failed.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
          <div className="font-semibold text-destructive">Mục tiêu đã lưu. {savedKeys.size}/{drafts.length} KR đã lưu, {result.failed.length} KR chưa lưu được:</div>
          <ul className="mt-1 list-disc pl-4">{result.failed.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
        <button className={btn2} onClick={onDone}>{savedGoalId ? "Đóng" : "Hủy"}</button>
        {step === 1 && <button className={btn} disabled={!info} onClick={() => setStep(2)}>Tiếp: chọn KR</button>}
        {step === 3 && <button className={btn} disabled={saving || !info || drafts.some((d) => d.allocs.some((a) => !a.userId) || !(d.target > 0))} onClick={save}>{saving ? "Đang lưu…" : savedGoalId ? "Lưu lại KR lỗi" : `Lưu mục tiêu${drafts.length ? ` + ${drafts.length} KR` : ""}`}</button>}
      </div>
    </div>
  );
}

/* ---------- Thêm KR vào mục tiêu có sẵn ---------- */
function AddKrSheet({ actor, goal, onClose, db }: { actor: Actor; goal: KpiDb["goals"][number]; onClose: () => void; db: KpiDb }) {
  const { socials } = useStore();
  const meta = goal.metadata as GoalMeta;
  const ch = goal.websiteId ? `w:${goal.websiteId}` : goal.socialId ? `s:${goal.socialId}` : "";
  const kind = goal.websiteId ? "web" : goal.socialId ? (socials.find((s) => s.id === goal.socialId)?.platform === "TikTok" ? "tiktok" : "facebook") : "";
  const [d, setD] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const brandOf = useBrandOf();
  void db;
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader><SheetTitle>Thêm KR</SheetTitle><SheetDescription>{goal.title} · {fmtD(goal.periodStart)} → {fmtD(goal.periodEnd)}</SheetDescription></SheetHeader>
        <div className="mt-4 space-y-3">
          {!d ? <KrPicker kind={kind} onPick={(k) => setD(newDraft(k, meta.scope === "personal" ? meta.scopeRef ?? "" : meta.ownerId ?? "", ch, meta.deadline ?? goal.periodEnd))} />
            : <>
              <KrFields d={d} set={setD} brandId={goal.brandId ?? ""} start={goal.periodStart} end={goal.periodEnd} onRemove={() => setD(null)} />
              <div className="flex justify-end"><button className={btn} disabled={saving || d.allocs.some((x) => !x.userId) || !(d.target > 0)} onClick={async () => {
                const errs = validateDraft(actor, d, goal.brandId ?? "", meta.periodType ?? "custom", goal.periodStart, goal.periodEnd, brandOf);
                if (errs.length) { toast.error("Chưa lưu — cần sửa", { description: errs.join("\n") }); return; }
                setSaving(true);
                try { await saveDraftKr(actor, goal.id, d, goal.brandId ?? "", meta.periodType ?? "custom", goal.periodStart, goal.periodEnd); toast.success("Đã thêm KR"); onClose(); }
                catch (e) { toast.error(e instanceof KpiError ? e.message : `Không lưu được: ${(e as Error).message}`); }
                setSaving(false);
              }}>{saving ? "Đang lưu…" : "Lưu KR"}</button></div>
            </>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Chi tiết KR + ghi nhận thủ công ---------- */
function KrDetail({ actor, it, userId, start, end, onClose, onSaved }: { actor: Actor; it: EmployeeKpiItem; userId: string; start: string; end: string; onClose: () => void; onSaved: () => void }) {
  const actualOf = useKrActual();
  const users = useAuth((s) => s.users);
  const m = getKpiMetric(it.metricKey);
  const a = actualOf(userId, it, start, end);
  const st = krState(m, a, it, end);
  const entries = ((it.metadata as { entries?: KrEntry[] }).entries ?? []);
  const [e, setE] = useState({ value: "", numerator: "", denominator: "", link: "", note: "", date: new Date().toISOString().slice(0, 10) });
  const nameOf = (id?: string | null) => users.find((u) => u.id === id)?.fullName ?? "—";
  const save = (list: KrEntry[], msg: string) => run(() => svc.updateItemMetadata(actor, it.id, { entries: list }), msg, onSaved);
  const ratio = m?.ratio;
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{it.label || m?.label}</SheetTitle>
          <SheetDescription>{nameOf(userId)} · {fmtD(start)} → {fmtD(end)} · Nguồn: {m?.source}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 text-sm">
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-baseline gap-1"><span className="text-2xl font-semibold tabular-nums">{a.value ?? "—"}{a.value !== null ? unitTxt(it.unit) : ""}</span><span className="text-muted-foreground">/ {st.dir === "at_most" ? "≤ " : ""}{it.targetValue}{unitTxt(it.unit)}</span><span className={cn("ml-auto text-xs font-semibold", st.tone)}>{st.label}</span></div>
            {a.status && <p className="mt-1 text-xs text-muted-foreground">{a.status}</p>}
            {m?.rule && <p className="mt-1 text-xs text-muted-foreground">Quy tắc: {m.rule}</p>}
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dữ liệu nguồn ({a.evidence.length})</div>
            {!a.evidence.length && <p className="text-xs text-muted-foreground">Chưa có kết quả được ghi nhận.</p>}
            <div className="space-y-1">{a.evidence.map((x) => (
              <div key={x.type + x.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5">
                {x.link ? <a href={x.link} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline">{x.title}</a> : <span className="truncate">{x.title}</span>}
                <span className="shrink-0 text-xs text-muted-foreground">{fmtD(x.at?.slice(0, 10))}</span>
              </div>))}</div>
            {a.warnings > 0 && <p className="mt-1 text-xs text-muted-foreground">{a.warnings} mục chưa xác minh nên không được tính.</p>}
          </div>
          {isManualKr(m) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ghi nhận kết quả ({entries.length})</div>
              {entries.map((x) => (
                <div key={x.id} className="rounded-md border border-border px-3 py-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{ratio ? `${ratio.numerator}: ${x.numerator ?? 0} · ${ratio.denominator}: ${x.denominator ?? 0}` : `${(x.value ?? 0).toLocaleString("vi-VN")}${it.metricKey === "video_view_threshold" ? " lượt xem" : ""}`}</span>
                    {(() => {
                      const stt = entryStatus(x);
                      if (stt === "confirmed") return <span className="text-success">Đã xác nhận · {nameOf(x.confirmedBy)}</span>;
                      if (stt === "rejected") return <span className="text-destructive">Đã từ chối</span>;
                      const canReview = actor.isAdmin && x.recordedBy !== userId;
                      const review = (status: "confirmed" | "needs_info" | "rejected", msg: string) => {
                        const note = status === "confirmed" ? undefined : prompt(status === "rejected" ? "Lý do từ chối" : "Cần bổ sung gì?") ?? undefined;
                        if (status !== "confirmed" && note === undefined) return;
                        save(entries.map((y) => (y.id === x.id ? { ...y, status, reviewNote: note, ...(status === "confirmed" ? { confirmedBy: actor.id, confirmedAt: new Date().toISOString() } : {}) } : y)), msg);
                      };
                      return canReview ? (
                        <span className="flex gap-2">
                          <button className="text-primary hover:underline" onClick={() => review("confirmed", "Đã xác nhận kết quả")}>Xác nhận</button>
                          <button className="text-warning-foreground hover:underline" onClick={() => review("needs_info", "Đã yêu cầu bổ sung")}>Yêu cầu bổ sung</button>
                          <button className="text-destructive hover:underline" onClick={() => review("rejected", "Đã từ chối")}>Từ chối</button>
                        </span>
                      ) : <span className="text-muted-foreground">{stt === "needs_info" ? "Cần bổ sung" : "Chờ xác nhận"}</span>;
                    })()}
                  </div>
                  {x.reviewNote && <div className="text-warning-foreground">Phản hồi: {x.reviewNote}</div>}
                  <div className="text-muted-foreground">{fmtD(x.recordedAt.slice(0, 10))} · {nameOf(x.recordedBy)}{x.note ? ` · ${x.note}` : ""}</div>
                  {x.link && <a href={x.link} target="_blank" rel="noreferrer" className="break-all text-primary hover:underline">{x.link}</a>}
                  {actor.isAdmin && entryStatus(x) !== "confirmed" && <button className="mt-1 text-muted-foreground hover:text-destructive" onClick={() => confirm("Xóa ghi nhận này?") && save(entries.filter((y) => y.id !== x.id), "Đã xóa ghi nhận")}>Xóa</button>}
                </div>
              ))}
              {actor.isAdmin ? (
                <div className="grid gap-2 rounded-md border border-dashed border-border p-3 sm:grid-cols-2">
                  {ratio ? <>
                    <input className={inp} type="number" placeholder={ratio.numerator} value={e.numerator} onChange={(v) => setE({ ...e, numerator: v.target.value })} />
                    <input className={inp} type="number" placeholder={ratio.denominator} value={e.denominator} onChange={(v) => setE({ ...e, denominator: v.target.value })} />
                  </> : <input className={inp} type="number" placeholder={it.metricKey === "video_view_threshold" ? "Lượt xem của video" : "Giá trị"} value={e.value} onChange={(v) => setE({ ...e, value: v.target.value })} />}
                  <input className={inp} type="date" value={e.date} onChange={(v) => setE({ ...e, date: v.target.value })} />
                  <input className={`${inp} sm:col-span-2`} placeholder={it.metricKey === "video_view_threshold" ? "Đường dẫn video (bắt buộc)" : "Đường dẫn bằng chứng (ảnh chụp, tài liệu…)"} value={e.link} onChange={(v) => setE({ ...e, link: v.target.value })} />
                  <input className={`${inp} sm:col-span-2`} placeholder="Ghi chú" value={e.note} onChange={(v) => setE({ ...e, note: v.target.value })} />
                  <button className={`${btn} sm:col-span-2 justify-center`} disabled={!e.link.trim() || (ratio ? !e.denominator : !e.value)} onClick={async () => {
                    const entry: KrEntry = { id: Math.random().toString(36).slice(2), recordedAt: `${e.date}T12:00:00`, recordedBy: actor.id, link: e.link.trim(), note: e.note.trim() || undefined,
                      ...(ratio ? { numerator: Number(e.numerator || 0), denominator: Number(e.denominator) } : { value: Number(e.value) }) };
                    if (await save([...entries, entry], "Đã ghi nhận — chờ xác nhận")) setE({ ...e, value: "", numerator: "", denominator: "", link: "", note: "" });
                  }}>Ghi nhận kết quả</button>
                  <p className="text-[11px] text-muted-foreground sm:col-span-2">Kết quả chỉ được tính sau khi bấm "Xác nhận". Cần có bằng chứng.</p>
                </div>
              ) : <p className="text-xs text-muted-foreground">Chức năng tự gửi kết quả cho nhân viên đang chờ mở quyền trên hệ thống. Tạm thời gửi bằng chứng cho quản lý để ghi nhận.</p>}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- Danh sách mục tiêu ---------- */
export function GoalsBoard({ actor, db, refresh, periodKey, brandFilter }: { actor: Actor; db: KpiDb; refresh: () => void; periodKey?: string; brandFilter?: string }) {
  const users = useAuth((s) => s.users);
  const { brands, websites, socials } = useStore();
  const actualOf = useKrActual();
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ it: EmployeeKpiItem; userId: string; start: string; end: string } | null>(null);
  const [ps, pe] = (periodKey ?? "|").split("|");
  const goals = useMemo(() => db.goals.filter((g) => (!periodKey || (g.periodStart <= pe && g.periodEnd >= ps)) && (!brandFilter || g.brandId === brandFilter))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [db, periodKey, brandFilter, ps, pe]);
  // Quan hệ Goal–KR trực tiếp; không dùng điều kiện OR theo kỳ (tránh lẫn KR giữa các mục tiêu cùng người, cùng kỳ).
  const krsOf = (gid: string) => krsOfGoal(gid, db.items, db.periods);
  const scope = (x: { websiteId: string | null; socialId: string | null; brandId: string | null }) =>
    x.websiteId ? websites.find((w) => w.id === x.websiteId)?.name ?? "Website" : x.socialId ? socials.find((s) => s.id === x.socialId)?.name ?? "Kênh" : x.brandId ? brands.find((b) => b.id === x.brandId)?.name ?? "Dự án" : "Toàn phòng";
  const goalAdd = adding ? db.goals.find((g) => g.id === adding) : null;

  return (
    <div className="space-y-4">
      {actor.isAdmin && (creating ? <GoalWizard actor={actor} onDone={() => { setCreating(false); refresh(); }} />
        : <button className={btn} onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Tạo mục tiêu</button>)}
      {!goals.length && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Chưa có mục tiêu trong kỳ này.</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        {goals.map((g) => {
          const meta = g.metadata as { ownerId?: string; deadline?: string };
          const krs = krsOf(g.id);
          const states = krs.map((it) => { const p = db.periods.find((x) => x.id === it.kpiPeriodId); if (!p) return null; const a = actualOf(p.userId, it, p.periodStart, p.periodEnd, p.status === "locked" || p.status === "closed"); return { it, p, a, st: krState(getKpiMetric(it.metricKey), a, it, p.periodEnd) }; }).filter(Boolean) as { it: EmployeeKpiItem; p: KpiDb["periods"][number]; a: KrActual; st: ReturnType<typeof krState> }[];
          const done = states.filter((s) => s.st.state === "achieved" || s.st.state === "late").length;
          return (
            <div key={g.id} className="rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                <div className="min-w-0">
                  <div className="font-semibold">{g.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{scope(g)} · {users.find((u) => u.id === meta.ownerId)?.fullName ?? "—"} · {fmtD(g.periodStart)} → {fmtD(g.periodEnd)} · Deadline {fmtD(meta.deadline ?? g.periodEnd)}</div>
                </div>
                <div className="shrink-0 text-right">
                  {actor.isAdmin ? <select className="h-7 rounded-md border border-input bg-background px-1.5 text-xs" value={g.status} onChange={(e) => run(() => svc.saveGoal(actor, { ...g, status: e.target.value as GoalStatus }), "Đã cập nhật trạng thái", refresh)}>
                    {Object.entries(GOAL_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    : <span className="text-xs">{GOAL_STATUS[g.status]}</span>}
                  <div className="mt-1 text-xs text-muted-foreground">{done}/{states.length} KR đạt</div>
                </div>
              </div>
              <div className="divide-y divide-border">
                {states.map(({ it, p, a, st }) => {
                  const m = getKpiMetric(it.metricKey);
                  return (
                    <button key={it.id} onClick={() => setDetail({ it, userId: p.userId, start: p.periodStart, end: p.periodEnd })} className="group flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><span className="truncate text-sm font-medium">{it.label || m?.label}</span>
                          {m && m.availability !== "linked" && <span className={cn("shrink-0 rounded px-1 py-0.5 text-[10px]", AV_TONE[m.availability!])}>{AVAILABILITY_LABEL[m.availability!]}</span>}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{users.find((u) => u.id === p.userId)?.fullName ?? "—"} · {scope(it)}{a.status ? ` · ${a.status}` : ""}</div>
                        {st.pct !== null && <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", st.state === "achieved" ? "bg-success" : st.state === "late" ? "bg-warning" : st.state === "overdue" ? "bg-destructive" : "bg-primary")} style={{ width: `${st.pct}%` }} /></div>}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold tabular-nums">{a.value ?? "—"}{a.value !== null ? unitTxt(it.unit) : ""}<span className="font-normal text-muted-foreground"> / {st.dir === "at_most" ? "≤" : ""}{it.targetValue}{unitTxt(it.unit)}</span></div>
                        <div className={cn("text-[11px] font-medium", st.tone)}>{st.label}</div>
                        <div className="text-[10px] text-muted-foreground">hạn {fmtD(st.deadline)}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </button>
                  );
                })}
                {!states.length && <p className="px-4 py-3 text-xs text-muted-foreground">Chưa có KR.</p>}
              </div>
              {actor.isAdmin && <div className="border-t border-border px-4 py-2"><button className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => setAdding(g.id)}><Plus className="h-3.5 w-3.5" />Thêm KR</button></div>}
            </div>
          );
        })}
      </div>
      {goalAdd && <AddKrSheet actor={actor} goal={goalAdd} db={db} onClose={() => { setAdding(null); refresh(); }} />}
      {detail && <KrDetail actor={actor} {...detail} it={db.items.find((i) => i.id === detail.it.id) ?? detail.it} onSaved={refresh} onClose={() => { setDetail(null); refresh(); }} />}
    </div>
  );
}
