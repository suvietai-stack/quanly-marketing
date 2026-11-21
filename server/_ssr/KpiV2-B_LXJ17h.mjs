import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { ac as hydrateKpi, aq as kpiCan, b as useStore, F as useAuth, u as useCurrentUser, a9 as KPI_ALL, aa as KPI_PERM_KEYS, aI as isKpiV2Enabled, aP as onCloudSync, ab as getKpiMetric, ad as goalCaps, ae as goalLocked, j as cn, af as DropdownMenu, ag as DropdownMenuTrigger, ah as DropdownMenuContent, ai as DropdownMenuItem, aj as DropdownMenuSeparator, ak as AVAILABILITY_LABEL, aJ as KPI_METRIC_LIST, aK as KR_GROUPS, aL as DIRECTION_LABEL, aM as findNestedItems, aN as ROLE_KPI_TEMPLATES, aH as isAssignable, aO as isAchieved, at as directionOf, al as lockedResultOf, am as KR_ENGINE_KEYS, an as calculateKrItem, ao as calculateKpiItem, ap as calculateVideoDesignItem, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, ar as SheetDescription, as as krsOfGoal, au as evaluateKr, av as krDeadline, aw as KR_STATE_TONE, ax as flushKpi, ay as KpiError, az as isManualKr, aA as entryStatus, aF as createKpiService, aG as cloudRepository, aB as BASIC_KR_LIST, aC as BASIC_KR_GROUPS, aD as MONTHLY_SOURCE, aE as monthsIn } from "./router-CkmTURa-.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-CW0Q8d6x.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { r as rangeOf, b as rangeOptions, T as TIMEFRAMES, c as rangeLabel, o as overlaps, d as validateGoalDates } from "./timeframe-CYUNchQ5.mjs";
import { a6 as Plus, aK as Ellipsis, s as ChevronRight, n as ChevronDown, f as Search, X, q as Check } from "../_libs/lucide-react.mjs";
function useKpiActor() {
  const me = useAuth((s) => s.users.find((x) => x.id === s.currentUserId));
  const { can: can2 } = useCurrentUser();
  if (!me) return null;
  const full = !!me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin";
  const p = full ? KPI_ALL : Object.fromEntries(KPI_PERM_KEYS.map((k) => [k, can2(k)]));
  return { id: me.id, isAdmin: p["kpi.view_all"], p };
}
function isDivisible(metricKey) {
  const m = getKpiMetric(metricKey);
  if (!m) return false;
  if (m.direction === "at_most" || m.unit === "percent" || m.unit === "currency" || m.ratio) return false;
  if (m.needs === "keyword" || m.needs === "views" || m.needs === "label" || m.needs === "tasks") return false;
  if (m.krGroup === "Kết quả Marketing" || m.krGroup === "Chuyển đổi") return false;
  return m.unit === "count" || m.unit === "point";
}
function allocationSummary(kr, allocs) {
  const allocated = allocs.reduce((s, a) => s + a.targetValue, 0);
  const target = kr.targetValue;
  if (!isDivisible(kr.metricKey)) {
    const ok = allocs.length === 1;
    return { allocated, target, diff: 0, balanced: ok, message: ok ? null : allocs.length ? "KR này không phân bổ theo nhân sự — chỉ giữ 1 người chịu trách nhiệm." : "Chưa có người chịu trách nhiệm." };
  }
  const diff = allocated - target;
  return {
    allocated,
    target,
    diff,
    balanced: diff === 0 && allocs.length > 0,
    message: diff < 0 ? `Còn ${-diff} chưa phân bổ` : diff > 0 ? `Vượt chỉ tiêu KR ${diff}` : null
  };
}
function checkAllocationScope(kr, a, brandOfAsset) {
  if (kr.websiteId && a.websiteId !== kr.websiteId) return "Dòng phân bổ phải thuộc đúng Website của KR.";
  if (kr.socialId && a.socialId !== kr.socialId) return "Dòng phân bổ phải thuộc đúng tài khoản Social của KR.";
  if (kr.websiteId && a.socialId) return "KR Website không nhận dòng phân bổ Social.";
  if (kr.socialId && a.websiteId) return "KR Social không nhận dòng phân bổ Website.";
  if (kr.brandId) {
    if (a.websiteId && brandOfAsset("website", a.websiteId) !== kr.brandId) return "Website không thuộc dự án của KR.";
    if (a.socialId && brandOfAsset("social", a.socialId) !== kr.brandId) return "Tài khoản Social không thuộc dự án của KR.";
  }
  return null;
}
function aggregateKr(metricKey, results) {
  if (!results.length) return null;
  if (!isDivisible(metricKey)) return results.length === 1 ? results[0].value : null;
  const m = getKpiMetric(metricKey);
  if (m?.unit === "point") {
    const vals = results.map((r) => r.value);
    return vals.some((v) => v === null) ? null : vals.reduce((s, v) => s + v, 0);
  }
  const seen = /* @__PURE__ */ new Set();
  let loose = 0;
  let any = false;
  for (const r of results) {
    if (r.evidence.length) {
      any = true;
      r.evidence.forEach((e) => seen.add(`${e.type}:${e.id}`));
    } else if (r.value !== null) {
      any = true;
      loose += r.value;
    }
  }
  return any ? seen.size + loose : null;
}
const canHardDelete = (hasResult, locked2) => !hasResult && !locked2;
const svc$1 = createKpiService(cloudRepository);
const inp$1 = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
const btn$1 = "inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50";
const btn2$1 = "inline-flex h-8 items-center gap-1 rounded-md border border-input px-2.5 text-xs hover:bg-muted";
const lbl = "space-y-1 text-xs font-medium text-muted-foreground";
const can = (a, k) => kpiCan(a, k);
async function run$1(fn, ok, after) {
  try {
    fn();
    await flushKpi();
    toast.success(ok);
    after();
    return true;
  } catch (e) {
    toast.error(e instanceof KpiError ? e.message : `Không lưu được: ${e.message ?? e}`);
    after();
    return false;
  }
}
const fmtD = (d) => d ? d.split("-").reverse().join("/") : "—";
function TimeframeFields({ ptype, setType, start, end, deadline, setRange, setDates, errs }) {
  const opts = ptype === "custom" ? [] : rangeOptions(ptype, start || void 0);
  const key = `${start}|${end}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${lbl} sm:col-span-2`, children: [
      "Khung thời gian",
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 rounded-md bg-muted p-0.5", children: TIMEFRAMES.map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setType(k), className: cn("whitespace-nowrap rounded px-1 py-1.5 text-xs", ptype === k ? "bg-background font-medium text-foreground shadow-sm" : ""), children: v }, k)) })
    ] }),
    ptype === "custom" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
      "Từ ngày – đến ngày",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp$1, value: start, onChange: (e) => setDates({ start: e.target.value }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp$1, min: start, value: end, onChange: (e) => setDates({ end: e.target.value }) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
      "Kỳ thực hiện",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: key, onChange: (e) => {
        const [s, x] = e.target.value.split("|");
        setRange(s, x);
      }, children: [
        !opts.some((o) => o.key === key) && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: rangeLabel(ptype, start, end) }),
        opts.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.key, children: o.label }, o.key))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-[11px] font-normal", children: [
        fmtD(start),
        " → ",
        fmtD(end)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
      "Deadline mục tiêu",
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp$1, min: start, max: end, value: deadline, onChange: (e) => setDates({ deadline: e.target.value }) })
    ] }),
    errs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-full text-[11px] text-destructive", children: errs.join(" ") })
  ] });
}
const GOAL_STATUS = { draft: "Nháp", active: "Đang thực hiện", closed: "Hoàn thành", cancelled: "Đã hủy" };
const AV_TONE = { linked: "bg-primary/10 text-primary", periodic: "bg-accent text-accent-foreground", manual: "bg-warning/15 text-warning-foreground", pending: "bg-muted text-muted-foreground", configure: "bg-muted text-muted-foreground", none: "bg-muted text-muted-foreground" };
function useKrActual() {
  const s = useStore();
  const users = useAuth((x) => x.users);
  return (userId, it, periodStart, periodEnd, locked2 = false) => {
    const snap = locked2 ? lockedResultOf(it) : null;
    if (snap) return {
      value: snap.actual,
      warnings: 0,
      status: `Kết quả đã chốt khi khóa kỳ${snap.lockedAt ? ` (${snap.lockedAt.slice(0, 10).split("-").reverse().join("/")})` : ""}`,
      evidence: snap.evidence.map((e) => ({ id: e.id, title: `${e.type} · ${e.id}`, at: e.at, type: e.type }))
    };
    const u = users.find((x) => x.id === userId);
    const emp = { id: userId, fullName: u?.fullName, username: u?.username };
    const period = { periodStart, periodEnd };
    const item = { metricKey: it.metricKey, targetValue: it.targetValue, brandId: it.brandId, websiteId: it.websiteId, socialId: it.socialId };
    const evK = (e) => ({ id: e.sourceId, title: e.title, at: e.creditedAt, link: e.note?.startsWith("http") ? e.note : void 0, type: e.sourceType, websiteId: e.websiteId });
    if (KR_ENGINE_KEYS.has(it.metricKey)) {
      const r2 = calculateKrItem(emp, { ...item, metadata: it.metadata }, period, { tasks: s.tasks, keywords: s.keywords, mapPosts: s.mapPosts, websites: s.websites, webContents: s.webContents, socialPosts: s.socialPosts, growth: s.growth });
      return { value: r2.actualValue, warnings: r2.warnings.length, status: r2.status, evidence: r2.evidence.map(evK) };
    }
    if (["web_content_completed", "social_post_completed", "task_completed"].includes(it.metricKey)) {
      const r2 = calculateKpiItem(emp, item, period, { webContents: s.webContents, socialPosts: s.socialPosts, tasks: s.tasks });
      return { value: r2.evidence.length === 0 && r2.warnings.length ? null : r2.actualValue, warnings: r2.warnings.length, evidence: r2.evidence.map((e) => ({ id: e.sourceId, title: e.title, at: e.creditedAt, type: e.sourceType, websiteId: e.websiteId })) };
    }
    const r = calculateVideoDesignItem(emp, item, period, { videos: s.videos, designOrders: s.orders, socialPosts: s.socialPosts });
    return { value: r.actualValue, warnings: r.warnings.length, evidence: r.evidence.map((e) => ({ id: e.sourceId, title: e.title, at: e.creditedAt, type: e.sourceType })) };
  };
}
function krState(m, a, it, end) {
  const dir = directionOf(it.metricKey);
  const ev = evaluateKr({
    actual: a.value,
    target: it.targetValue,
    direction: dir,
    deadline: krDeadline(it, end),
    today: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    unit: m?.unit ?? it.unit,
    evidenceDates: a.evidence.map((x) => x.at),
    warnings: a.warnings
  });
  const t = KR_STATE_TONE[ev.state];
  const tone = t === "good" ? "text-success" : t === "warn" ? "text-warning-foreground" : t === "bad" ? "text-destructive" : t === "info" ? "text-primary" : "text-muted-foreground";
  return { pct: ev.pct, label: ev.label, tone, dir, state: ev.state, deadline: ev.deadline, completedAt: ev.completedAt };
}
const unitTxt = (u) => u === "percent" ? "%" : u === "currency" ? " đ" : u === "point" ? " điểm" : "";
function priorityKeys(kind) {
  if (kind === "web") return ["seo_keyword_top", "seo_organic_clicks", "web_post_published", "web_content_completed", "task_on_time_rate", "task_first_pass_rate"];
  if (kind === "facebook") return ["social_post_published", "social_views", "task_on_time_rate", "task_first_pass_rate"];
  if (kind === "tiktok") return ["video_edit_completed", "video_view_threshold", "social_views", "task_on_time_rate", "task_first_pass_rate"];
  return [];
}
const rid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
const newDraft = (metricKey, ownerId, channel = "", deadline = "") => {
  const m = getKpiMetric(metricKey);
  const tgt = metricKey === "task_on_time_rate" ? 95 : metricKey === "task_first_pass_rate" ? 90 : m?.direction === "at_most" ? 1 : m?.needs === "keyword" ? 1 : 10;
  return {
    allocs: [{ key: rid(), userId: ownerId, target: tgt, channel: "" }],
    key: rid(),
    deadline,
    metricKey,
    ownerId,
    channel: m && (m.scopes.includes("website") || m.scopes.includes("social")) ? channel : "",
    target: metricKey === "task_on_time_rate" ? 95 : metricKey === "task_first_pass_rate" ? 90 : m?.direction === "at_most" ? 1 : m?.needs === "keyword" ? 1 : 10,
    label: "",
    keywordIds: [],
    threshold: 3,
    taskIds: [],
    viewThreshold: 1e4,
    mode: "value"
  };
};
function allocItem(d, a, brandId, krId) {
  const base = draftToItem(d, brandId);
  const ch = a.channel || d.channel;
  const [t, id] = ch.split(":");
  return {
    ...base,
    krId,
    targetValue: isDivisible(d.metricKey) ? a.target : d.target,
    websiteId: t === "w" ? id : null,
    socialId: t === "s" ? id : null,
    metadata: { ...base.metadata, clientKey: `${d.key}:${a.key}` }
  };
}
function draftToItem(d, brandId) {
  const m = getKpiMetric(d.metricKey);
  const [t, id] = d.channel.split(":");
  const meta = {};
  if (m.needs === "keyword") Object.assign(meta, { keywordIds: d.keywordIds, threshold: d.threshold });
  if (m.needs === "tasks") meta.taskIds = d.taskIds;
  if (m.needs === "views") meta.viewThreshold = d.viewThreshold;
  if (["seo_organic_clicks", "social_views"].includes(d.metricKey)) meta.mode = d.mode;
  if (d.deadline) meta.deadline = d.deadline;
  meta.clientKey = d.key;
  return { metricKey: d.metricKey, targetValue: d.target, brandId: brandId || null, websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null, label: d.label.trim() || null, metadata: meta };
}
function KrPicker({ onPick, kind, selected }) {
  const [q, setQ] = reactExports.useState("");
  const pri = priorityKeys(kind);
  const list = BASIC_KR_LIST.filter((m) => !q || m.label.toLowerCase().includes(q.toLowerCase()));
  const multi = !!selected;
  const Card = (m) => {
    const ok = isAssignable(m);
    const on = !!selected?.includes(m.key);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        disabled: !ok,
        onClick: () => onPick(m.key),
        title: m.rule ?? m.source,
        role: multi ? "checkbox" : void 0,
        "aria-checked": multi ? on : void 0,
        className: cn("flex items-start justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-left text-sm transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50", on ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"),
        children: [
          multi && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"), children: on && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block font-medium", children: [
              m.basic ? `${m.basic}. ` : "",
              m.label
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate text-[11px] text-muted-foreground", children: m.source })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("shrink-0 rounded px-1.5 py-0.5 text-[10px]", AV_TONE[m.availability]), children: AVAILABILITY_LABEL[m.availability] })
        ]
      },
      m.key
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: `${inp$1} pl-8`, placeholder: "Tìm KR…", value: q, onChange: (e) => setQ(e.target.value) })
    ] }),
    !q && pri.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary", children: "Gợi ý cho kênh đã chọn" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: pri.map((k) => Card(getKpiMetric(k))) })
    ] }),
    BASIC_KR_GROUPS.map((g) => {
      const ms = list.filter((m) => m.krGroup === g);
      if (!ms.length) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: g === "Tùy chỉnh" ? "+ KR tùy chỉnh" : `KR ${g}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: ms.map(Card) })
      ] }, g);
    })
  ] });
}
function AllocEditor({ d, set, webOpts, socOpts }) {
  const users = useAuth((s) => s.users);
  const div = isDivisible(d.metricKey);
  const sum = allocationSummary({ targetValue: d.target, metricKey: d.metricKey }, d.allocs.map((x) => ({ targetValue: x.target })));
  const upd = (allocs) => set({ ...d, allocs, ownerId: allocs[0]?.userId ?? "" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 rounded-md border border-border p-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-medium text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: div ? "Phân bổ chỉ tiêu cho nhân sự" : "Người chịu trách nhiệm (KR này không chia theo nhân sự)" }),
      div && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("font-semibold", sum.diff === 0 ? "text-success" : "text-warning-foreground"), children: [
        "Đã phân bổ ",
        sum.allocated,
        "/",
        d.target,
        sum.message ? ` · ${sum.message}` : ""
      ] })
    ] }),
    d.allocs.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto] gap-1.5 sm:grid-cols-[1.4fr_1.4fr_90px_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: a.userId, onChange: (e) => upd(d.allocs.map((x, j) => j === i ? { ...x, userId: e.target.value } : x)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Nhân sự —" }),
        users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.fullName || u.username }, u.id))
      ] }),
      webOpts.length > 0 || socOpts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: a.channel, onChange: (e) => upd(d.allocs.map((x, j) => j === i ? { ...x, channel: e.target.value } : x)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Toàn phạm vi KR" }),
        webOpts.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `w:${w.id}`, children: [
          "Web: ",
          w.name
        ] }, w.id)),
        socOpts.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `s:${s.id}`, children: [
          s.platform,
          ": ",
          s.name
        ] }, s.id))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden text-xs text-muted-foreground sm:flex sm:items-center", children: "Theo phạm vi KR" }),
      div ? /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, className: inp$1, value: a.target, onChange: (e) => upd(d.allocs.map((x, j) => j === i ? { ...x, target: Number(e.target.value) } : x)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:block" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30", disabled: d.allocs.length === 1, onClick: () => upd(d.allocs.filter((_, j) => j !== i)), "aria-label": "Bỏ dòng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }, a.key)),
    div && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: btn2$1, onClick: () => upd([...d.allocs, { key: rid(), userId: "", target: Math.max(1, -sum.diff || 1), channel: "" }]), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      "Thêm nhân sự"
    ] })
  ] });
}
async function saveDraftKr(actor, goalId, d, brandId, ptype, start, end) {
  let krId = (svc$1.list().krs ?? []).find((k) => k.metadata.clientKey === d.key)?.id;
  if (!krId) {
    const [t, id] = d.channel.split(":");
    const base = draftToItem(d, brandId);
    krId = svc$1.saveKr(actor, {
      goalId,
      metricKey: d.metricKey,
      targetValue: d.target,
      label: base.label,
      brandId: brandId || null,
      websiteId: t === "w" ? id : null,
      socialId: t === "s" ? id : null,
      deadline: d.deadline || null,
      metadata: { ...base.metadata, clientKey: d.key }
    }).id;
    await flushKpi();
  }
  for (const a of d.allocs) {
    svc$1.assign(actor, { userId: a.userId, periodType: ptype, periodStart: start, periodEnd: end, goalId, items: [allocItem(d, a, brandId, krId)] });
    await flushKpi();
  }
  return krId;
}
function validateDraft(actor, d, brandId, ptype, start, end, brandOf) {
  const errs = [];
  const probe = createKpiService({ load: () => ({ goals: [], periods: [], items: [], adjustments: [] }), save: () => {
  } });
  const [t, id] = d.channel.split(":");
  const kr = { brandId: brandId || null, websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null };
  const users = /* @__PURE__ */ new Set();
  for (const a of d.allocs) {
    if (!a.userId) {
      errs.push("Có dòng phân bổ chưa chọn nhân sự.");
      continue;
    }
    const it = allocItem(d, a, brandId, null);
    const sc = checkAllocationScope(kr, it, brandOf);
    if (sc) errs.push(sc);
    const k = `${a.userId}|${a.channel}`;
    if (users.has(k)) errs.push("Một nhân sự bị phân bổ 2 lần cùng phạm vi — hãy gộp lại.");
    users.add(k);
    try {
      probe.assign({ id: actor.id, isAdmin: true }, { userId: a.userId, periodType: ptype, periodStart: start, periodEnd: end, items: [it] });
    } catch (e) {
      errs.push(e.message);
    }
  }
  return [...new Set(errs)];
}
function KrFields({ d, set, brandId, onRemove, start, end }) {
  const users = useAuth((s) => s.users);
  const { websites, socials, keywords, tasks } = useStore();
  const m = getKpiMetric(d.metricKey);
  const owner = users.find((u) => u.id === d.ownerId);
  const webOpts = m.scopes.includes("website") ? websites.filter((w) => !brandId || w.brandId === brandId) : [];
  const socOpts = m.scopes.includes("social") ? socials.filter((s) => !brandId || s.brandId === brandId) : [];
  const channelRequired = m.needs === "website" || m.needs === "social" || m.needs === "views";
  const kws = keywords.filter((k) => d.channel.startsWith("w:") ? k.websiteId === d.channel.slice(2) : !brandId || websites.find((w) => w.id === k.websiteId)?.brandId === brandId);
  const ts = tasks.filter((t) => t.status !== "Đã hủy" && (!brandId || t.brandId === brandId) && (!owner || !t.assignee || t.assignee === owner.fullName || t.assignee === owner.username));
  const toggle = (arr, v) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const growthOk = ["seo_organic_clicks", "social_views"].includes(d.metricKey);
  const pctTarget = m.unit === "percent" || growthOk && d.mode === "growth";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: d.label || m.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
          m.source,
          m.rule ? ` · ${m.rule}` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRemove, className: "rounded p-1 text-muted-foreground hover:bg-muted", "aria-label": "Bỏ KR", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      (webOpts.length > 0 || socOpts.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        m.needs === "views" ? "Tài khoản video" : socOpts.length && !webOpts.length ? "Tài khoản Social" : webOpts.length && !socOpts.length ? "Website" : "Website / Tài khoản",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: d.channel, onChange: (e) => set({ ...d, channel: e.target.value, keywordIds: [] }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: channelRequired ? "— Chọn —" : "Toàn dự án" }),
          webOpts.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `w:${w.id}`, children: [
            "Web: ",
            w.name
          ] }, w.id)),
          socOpts.filter((s) => m.needs !== "views" || ["TikTok", "YouTube", "Facebook Page", "Instagram"].includes(s.platform)).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `s:${s.id}`, children: [
            s.platform,
            ": ",
            s.name
          ] }, s.id))
        ] })
      ] }),
      growthOk && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Cách đặt chỉ tiêu",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: d.mode, onChange: (e) => set({ ...d, mode: e.target.value }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "value", children: "Số lượng cần đạt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "growth", children: "% tăng so với kỳ gốc liền trước" })
        ] })
      ] }),
      m.needs === "views" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Ngưỡng lượt xem / video",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, className: inp$1, value: d.viewThreshold, onChange: (e) => set({ ...d, viewThreshold: Number(e.target.value) }) })
      ] }),
      m.needs === "keyword" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Top cần đạt",
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: inp$1, value: d.threshold, onChange: (e) => set({ ...d, threshold: Number(e.target.value) }), children: [1, 3, 5, 10, 20].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: n, children: [
          "Top ",
          n
        ] }, n)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        m.needs === "keyword" ? "Số từ khóa đạt Top" : m.needs === "views" ? "Số video đạt ngưỡng" : m.direction === "at_most" ? "Không vượt quá" : "Chỉ tiêu",
        pctTarget ? " (%)" : m.unit === "currency" ? " (đ)" : "",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, max: m.needs === "keyword" && d.keywordIds.length ? d.keywordIds.length : void 0, className: inp$1, value: d.target, onChange: (e) => {
          const v = Number(e.target.value);
          set({ ...d, target: v, allocs: isDivisible(d.metricKey) ? d.allocs : d.allocs.map((x) => ({ ...x, target: v })) });
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Deadline KR",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp$1, min: start, max: end, value: d.deadline || end, onChange: (e) => set({ ...d, deadline: e.target.value }) })
      ] })
    ] }),
    m.needs === "keyword" && d.keywordIds.length > 0 && d.target > d.keywordIds.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-destructive", children: [
      "Chỉ tiêu không được vượt quá ",
      d.keywordIds.length,
      " từ khóa đã chọn."
    ] }),
    MONTHLY_SOURCE.has(d.metricKey) && !monthsIn(start, end) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-destructive", children: "Chỉ số này lấy số liệu theo tháng. Kỳ hiện tại không trọn tháng — hãy chọn kỳ Tháng hoặc Quý." }),
    (d.deadline || end) > end || d.deadline && d.deadline < start ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-destructive", children: "Deadline phải nằm trong kỳ thực hiện." }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(AllocEditor, { d, set, webOpts: d.channel ? [] : webOpts, socOpts: d.channel ? [] : socOpts }),
    (m.needs === "tasks" || m.needs === "label") && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
      "Tên kết quả cần đạt",
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, placeholder: "VD: Nghiên cứu 3 bộ từ khóa", value: d.label, onChange: (e) => set({ ...d, label: e.target.value }) })
    ] }),
    m.needs === "keyword" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: lbl, children: [
      "Từ khóa từ Check Top (",
      d.keywordIds.length,
      " đã chọn)",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2", children: [
        kws.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-normal text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: d.keywordIds.includes(k.id), onChange: () => {
            const ids = toggle(d.keywordIds, k.id);
            set({ ...d, keywordIds: ids, target: Math.max(1, Math.min(d.target, ids.length || 1)) });
          } }),
          k.keyword,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: k.currentTop ? `hiện Top ${k.currentTop}` : "chưa kiểm tra" })
        ] }, k.id)),
        !kws.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Chưa có từ khóa trong Check Top của phạm vi này." })
      ] })
    ] }),
    m.needs === "tasks" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: lbl, children: [
      "Liên kết Task có sẵn (",
      d.taskIds.length,
      ") — tạo Task mới ở trang Task",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-40 space-y-1 overflow-y-auto rounded-md border border-input p-2", children: [
        ts.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm font-normal text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: d.taskIds.includes(t.id), onChange: () => set({ ...d, taskIds: toggle(d.taskIds, t.id) }) }),
          t.title,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: t.status })
        ] }, t.id)),
        !ts.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Không có Task phù hợp." })
      ] })
    ] }),
    isManualKr(m) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
      m.availability === "pending" ? "Chờ kết nối nguồn dữ liệu. " : "",
      "Kết quả được ghi nhận kèm bằng chứng và chỉ tính sau khi quản lý xác nhận."
    ] }),
    m.availability === "periodic" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Lấy từ báo cáo tăng trưởng nhập theo tháng — không phải tích hợp tự động." })
  ] });
}
const SCOPE_LABEL = { department: "Phòng ban", team: "Nhóm", project: "Dự án", personal: "Cá nhân" };
function useBrandOf() {
  const { websites, socials } = useStore();
  return (k, id) => k === "website" ? websites.find((w) => w.id === id)?.brandId : socials.find((s) => s.id === id)?.brandId;
}
function ScopeFields({ v, set }) {
  const users = useAuth((s) => s.users);
  const { brands } = useStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
      "Phạm vi mục tiêu",
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: inp$1, value: v.scope, onChange: (e) => {
        const sc = e.target.value;
        set({ scope: sc, scopeRef: sc === "department" ? "Phòng Marketing" : "" });
      }, children: Object.entries(SCOPE_LABEL).map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: l }, k)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
      v.scope === "department" ? "Phòng ban" : v.scope === "team" ? "Tên nhóm" : v.scope === "project" ? "Dự án" : "Nhân viên",
      v.scope === "project" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: v.scopeRef, onChange: (e) => set({ scopeRef: e.target.value }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn —" }),
        brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.id, children: b.name }, b.id))
      ] }) : v.scope === "personal" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: v.scopeRef, onChange: (e) => set({ scopeRef: e.target.value }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn —" }),
        users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.fullName || u.username }, u.id))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, value: v.scopeRef, placeholder: v.scope === "team" ? "VD: Nhóm SEO" : "", onChange: (e) => set({ scopeRef: e.target.value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
      "Người điều phối (tùy chọn)",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: v.coordinatorId, onChange: (e) => set({ coordinatorId: e.target.value }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Không —" }),
        users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.fullName || u.username }, u.id))
      ] })
    ] })
  ] });
}
function GoalWizard({ actor, onDone }) {
  const { brands, websites, socials } = useStore();
  const brandOf = useBrandOf();
  const [step, setStep] = reactExports.useState(1);
  const [ptype, setPtype] = reactExports.useState("month");
  const [g, setG] = reactExports.useState(() => {
    const [s, e] = rangeOf("month");
    return { title: "", brandId: "", channel: "", scope: "department", scopeRef: "Phòng Marketing", coordinatorId: "", start: s, end: e, deadline: e };
  });
  const [drafts, setDrafts] = reactExports.useState([]);
  const [initialOf, setInitialOf] = reactExports.useState({});
  const [pendingRemove, setPendingRemove] = reactExports.useState(null);
  const snap = (d) => JSON.stringify({ ...d, allocs: d.allocs.map(({ key: _k, ...r }) => r) });
  const removeDraft = (key) => setDrafts((ds) => ds.filter((x) => x.key !== key));
  const askRemove = (d) => {
    if (savedKeys.has(d.key)) {
      toast.error("KR này đã được lưu vào mục tiêu, không bỏ chọn ở đây được.");
      return;
    }
    if (initialOf[d.key] !== snap(d)) setPendingRemove(d);
    else removeDraft(d.key);
  };
  const toggleKr = (k) => {
    const ex = drafts.find((d) => d.metricKey === k);
    if (ex) {
      askRemove(ex);
      return;
    }
    const nd = newDraft(k, g.scope === "personal" ? g.scopeRef : "", g.channel, g.deadline);
    setInitialOf((m) => ({ ...m, [nd.key]: snap(nd) }));
    setDrafts((ds) => [...ds, nd]);
  };
  const [saving, setSaving] = reactExports.useState(false);
  const kind = g.channel.startsWith("w:") ? "web" : g.channel.startsWith("s:") ? socials.find((s) => s.id === g.channel.slice(2))?.platform === "TikTok" ? "tiktok" : "facebook" : "";
  const setRange = (s, e) => {
    setG({ ...g, start: s, end: e, deadline: e });
    setDrafts(drafts.map((d) => ({ ...d, deadline: e })));
  };
  const setType = (t) => {
    setPtype(t);
    if (t !== "custom") {
      const [s, e] = rangeOf(t, g.start || void 0);
      setRange(s, e);
    }
  };
  const dateErrs = validateGoalDates(g.start, g.end, g.deadline);
  const info = g.title.trim() && !dateErrs.length && (g.scope === "department" || g.scope === "team" ? true : !!g.scopeRef);
  const [savedGoalId, setSavedGoalId] = reactExports.useState(null);
  const [savedKeys, setSavedKeys] = reactExports.useState(/* @__PURE__ */ new Set());
  const [result, setResult] = reactExports.useState(null);
  const draftName = (d) => d.label || getKpiMetric(d.metricKey)?.label || d.metricKey;
  const validateAll = () => {
    const errs = [...dateErrs];
    for (const d of drafts) validateDraft(actor, d, g.brandId, ptype, g.start, g.end, brandOf).forEach((e) => errs.push(`${draftName(d)}: ${e}`));
    return errs;
  };
  const save = async () => {
    const errs = validateAll();
    if (errs.length) {
      toast.error(`Chưa lưu gì — cần sửa ${errs.length} lỗi`, { description: errs.join("\n") });
      return;
    }
    setSaving(true);
    const unbalanced = drafts.filter((d) => !allocationSummary({ targetValue: d.target, metricKey: d.metricKey }, d.allocs.map((x) => ({ targetValue: x.target }))).balanced);
    let goalId = savedGoalId;
    const [t, id] = g.channel.split(":");
    if (!goalId) {
      try {
        goalId = svc$1.saveGoal(actor, {
          title: g.title,
          periodStart: g.start,
          periodEnd: g.end,
          status: unbalanced.length ? "draft" : "active",
          brandId: g.brandId || null,
          websiteId: t === "w" ? id : null,
          socialId: t === "s" ? id : null,
          metadata: { scope: g.scope, scopeRef: g.scopeRef, coordinatorId: g.coordinatorId || null, deadline: g.deadline, periodType: ptype }
        }).id;
        await flushKpi();
        setSavedGoalId(goalId);
      } catch (e) {
        toast.error(`Chưa tạo được mục tiêu: ${e.message}`);
        setSaving(false);
        return;
      }
    }
    const okNames = [];
    const failed = [];
    const done = new Set(savedKeys);
    for (const d of drafts.filter((x) => !done.has(x.key))) {
      try {
        await saveDraftKr(actor, goalId, d, g.brandId, ptype, g.start, g.end);
        done.add(d.key);
        okNames.push(draftName(d));
      } catch (e) {
        failed.push(`${draftName(d)}: ${e instanceof KpiError ? e.message : e.message}`);
      }
    }
    setSavedKeys(done);
    setSaving(false);
    if (failed.length) {
      setResult({ ok: okNames, failed });
      toast.error(`Mục tiêu đã lưu, còn ${failed.length} KR chưa lưu được`, { description: 'Bấm "Lưu lại KR lỗi" sau khi sửa — phần đã lưu sẽ không bị tạo trùng.' });
      return;
    }
    if (unbalanced.length) toast.warning(`Đã lưu dạng Nháp: ${unbalanced.length} KR chưa phân bổ khớp chỉ tiêu. Hoàn tất phân bổ rồi chuyển sang "Đang thực hiện".`);
    else toast.success(`Đã lưu mục tiêu${drafts.length ? ` và ${drafts.length} KR` : ""}`);
    onDone();
  };
  const Steps = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 text-xs", children: ["Mục tiêu", "Chọn KR", "Chỉ tiêu & phân bổ"].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: i + 1 > step && !info, onClick: () => setStep(i + 1), className: cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: i + 1 }),
    s,
    i === 2 && drafts.length ? ` (${drafts.length})` : ""
  ] }, s)) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-primary/30 bg-card p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Tạo mục tiêu" }),
      Steps
    ] }),
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `${lbl} sm:col-span-2`, children: [
        "Tên mục tiêu",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, autoFocus: true, placeholder: "VD: Hoàn thành kế hoạch Marketing tháng 10", value: g.title, onChange: (e) => setG({ ...g, title: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScopeFields, { v: g, set: (p) => setG({ ...g, ...p }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Dự án đo lường KR (mặc định)",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: g.brandId, onChange: (e) => setG({ ...g, brandId: e.target.value, channel: "" }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Nhiều dự án" }),
          brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.id, children: b.name }, b.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Kênh chính (tùy chọn)",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: g.channel, disabled: !g.brandId, onChange: (e) => setG({ ...g, channel: e.target.value }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Toàn dự án" }),
          websites.filter((w) => w.brandId === g.brandId).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `w:${w.id}`, children: [
            "Web: ",
            w.name
          ] }, w.id)),
          socials.filter((s) => s.brandId === g.brandId).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `s:${s.id}`, children: [
            s.platform,
            ": ",
            s.name
          ] }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TimeframeFields,
        {
          ptype,
          setType,
          start: g.start,
          end: g.end,
          deadline: g.deadline,
          setRange,
          setDates: (p) => setG({ ...g, ...p }),
          errs: dateErrs
        }
      )
    ] }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(KrPicker, { kind, selected: drafts.map((d) => d.metricKey), onPick: toggleKr }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      drafts.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(KrFields, { d, brandId: g.brandId, start: g.start, end: g.end, set: (nd) => setDrafts(drafts.map((x, j) => j === i ? nd : x)), onRemove: () => askRemove(d) }, d.key)),
      !drafts.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa chọn KR nào." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: btn2$1, onClick: () => setStep(2), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        "Chọn thêm / bỏ KR"
      ] })
    ] }),
    result && result.failed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-destructive", children: [
        "Mục tiêu đã lưu. ",
        savedKeys.size,
        "/",
        drafts.length,
        " KR đã lưu, ",
        result.failed.length,
        " KR chưa lưu được:"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 list-disc pl-4", children: result.failed.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: f }, f)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3", children: [
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mr-auto text-sm font-medium", children: [
        "Đã chọn: ",
        drafts.length,
        " KR"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn2$1, onClick: onDone, children: savedGoalId ? "Đóng" : "Hủy" }),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn$1, disabled: !info, onClick: () => setStep(2), children: "Tiếp: chọn KR" }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn$1, disabled: !drafts.length, onClick: () => setStep(3), children: "Tiếp tục: Thiết lập chỉ tiêu" }),
      step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn$1, disabled: saving || !info || drafts.some((d) => d.allocs.some((a) => !a.userId) || !(d.target > 0)), onClick: save, children: saving ? "Đang lưu…" : savedGoalId ? "Lưu lại KR lỗi" : `Lưu mục tiêu${drafts.length ? ` + ${drafts.length} KR` : ""}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!pendingRemove, onOpenChange: (o) => {
      if (!o) setPendingRemove(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Bỏ KR đã thiết lập?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'KR "',
          pendingRemove ? draftName(pendingRemove) : "",
          '" đã có chỉ tiêu hoặc phân bổ ở bước 3. Bỏ chọn sẽ xóa toàn bộ thiết lập này.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Giữ lại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => {
          if (pendingRemove) removeDraft(pendingRemove.key);
          setPendingRemove(null);
        }, children: "Bỏ KR" })
      ] })
    ] }) })
  ] });
}
function AddKrSheet({ actor, goal, onClose, db }) {
  const { socials } = useStore();
  const meta = goal.metadata;
  const ch = goal.websiteId ? `w:${goal.websiteId}` : goal.socialId ? `s:${goal.socialId}` : "";
  const kind = goal.websiteId ? "web" : goal.socialId ? socials.find((s) => s.id === goal.socialId)?.platform === "TikTok" ? "tiktok" : "facebook" : "";
  const [d, setD] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const brandOf = useBrandOf();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "w-full overflow-y-auto sm:max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Thêm KR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetDescription, { children: [
        goal.title,
        " · ",
        fmtD(goal.periodStart),
        " → ",
        fmtD(goal.periodEnd)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: !d ? /* @__PURE__ */ jsxRuntimeExports.jsx(KrPicker, { kind, onPick: (k) => setD(newDraft(k, meta.scope === "personal" ? meta.scopeRef ?? "" : meta.ownerId ?? "", ch, meta.deadline ?? goal.periodEnd)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KrFields, { d, set: setD, brandId: goal.brandId ?? "", start: goal.periodStart, end: goal.periodEnd, onRemove: () => setD(null) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn$1, disabled: saving || d.allocs.some((x) => !x.userId) || !(d.target > 0), onClick: async () => {
        const errs = validateDraft(actor, d, goal.brandId ?? "", meta.periodType ?? "custom", goal.periodStart, goal.periodEnd, brandOf);
        if (errs.length) {
          toast.error("Chưa lưu — cần sửa", { description: errs.join("\n") });
          return;
        }
        setSaving(true);
        try {
          await saveDraftKr(actor, goal.id, d, goal.brandId ?? "", meta.periodType ?? "custom", goal.periodStart, goal.periodEnd);
          toast.success("Đã thêm KR");
          onClose();
        } catch (e) {
          toast.error(e instanceof KpiError ? e.message : `Không lưu được: ${e.message}`);
        }
        setSaving(false);
      }, children: saving ? "Đang lưu…" : "Lưu KR" }) })
    ] }) })
  ] }) });
}
function KrDetail({ actor, it, userId, start, end, onClose, onSaved }) {
  const actualOf = useKrActual();
  const users = useAuth((s) => s.users);
  const m = getKpiMetric(it.metricKey);
  const a = actualOf(userId, it, start, end);
  const st = krState(m, a, it, end);
  const entries = it.metadata.entries ?? [];
  const [e, setE] = reactExports.useState({ value: "", numerator: "", denominator: "", link: "", note: "", date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
  const nameOf = (id) => users.find((u) => u.id === id)?.fullName ?? "—";
  const save = (list, msg) => run$1(() => svc$1.updateItemMetadata(actor, it.id, { entries: list }), msg, onSaved);
  const ratio = m?.ratio;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "w-full overflow-y-auto sm:max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: it.label || m?.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetDescription, { children: [
        nameOf(userId),
        " · ",
        fmtD(start),
        " → ",
        fmtD(end),
        " · Nguồn: ",
        m?.source
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-semibold tabular-nums", children: [
            a.value ?? "—",
            a.value !== null ? unitTxt(it.unit) : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "/ ",
            st.dir === "at_most" ? "≤ " : "",
            it.targetValue,
            unitTxt(it.unit)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("ml-auto text-xs font-semibold", st.tone), children: st.label })
        ] }),
        a.status && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: a.status }),
        m?.rule && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          "Quy tắc: ",
          m.rule
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
          "Dữ liệu nguồn (",
          a.evidence.length,
          ")"
        ] }),
        !a.evidence.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chưa có kết quả được ghi nhận." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: a.evidence.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5", children: [
          x.link ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: x.link, target: "_blank", rel: "noreferrer", className: "truncate text-primary hover:underline", children: x.title }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: x.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: fmtD(x.at?.slice(0, 10)) })
        ] }, x.type + x.id)) }),
        a.warnings > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          a.warnings,
          " mục chưa xác minh nên không được tính."
        ] })
      ] }),
      isManualKr(m) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
          "Ghi nhận kết quả (",
          entries.length,
          ")"
        ] }),
        entries.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ratio ? `${ratio.numerator}: ${x.numerator ?? 0} · ${ratio.denominator}: ${x.denominator ?? 0}` : `${(x.value ?? 0).toLocaleString("vi-VN")}${it.metricKey === "video_view_threshold" ? " lượt xem" : ""}` }),
            (() => {
              const stt = entryStatus(x);
              if (stt === "confirmed") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-success", children: [
                "Đã xác nhận · ",
                nameOf(x.confirmedBy)
              ] });
              if (stt === "rejected") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "Đã từ chối" });
              const canReview = can(actor, "kpi.kr_adjust") && x.recordedBy !== userId;
              const review = (status, msg) => {
                const note = status === "confirmed" ? void 0 : prompt(status === "rejected" ? "Lý do từ chối" : "Cần bổ sung gì?") ?? void 0;
                if (status !== "confirmed" && note === void 0) return;
                save(entries.map((y) => y.id === x.id ? { ...y, status, reviewNote: note, ...status === "confirmed" ? { confirmedBy: actor.id, confirmedAt: (/* @__PURE__ */ new Date()).toISOString() } : {} } : y), msg);
              };
              return canReview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-primary hover:underline", onClick: () => review("confirmed", "Đã xác nhận kết quả"), children: "Xác nhận" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-warning-foreground hover:underline", onClick: () => review("needs_info", "Đã yêu cầu bổ sung"), children: "Yêu cầu bổ sung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-destructive hover:underline", onClick: () => review("rejected", "Đã từ chối"), children: "Từ chối" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: stt === "needs_info" ? "Cần bổ sung" : "Chờ xác nhận" });
            })()
          ] }),
          x.reviewNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-warning-foreground", children: [
            "Phản hồi: ",
            x.reviewNote
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
            fmtD(x.recordedAt.slice(0, 10)),
            " · ",
            nameOf(x.recordedBy),
            x.note ? ` · ${x.note}` : ""
          ] }),
          x.link && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: x.link, target: "_blank", rel: "noreferrer", className: "break-all text-primary hover:underline", children: x.link }),
          can(actor, "kpi.kr_adjust") && entryStatus(x) !== "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-1 text-muted-foreground hover:text-destructive", onClick: () => confirm("Xóa ghi nhận này?") && save(entries.filter((y) => y.id !== x.id), "Đã xóa ghi nhận"), children: "Xóa" })
        ] }, x.id)),
        can(actor, "kpi.kr_adjust") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 rounded-md border border-dashed border-border p-3 sm:grid-cols-2", children: [
          ratio ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, type: "number", placeholder: ratio.numerator, value: e.numerator, onChange: (v) => setE({ ...e, numerator: v.target.value }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, type: "number", placeholder: ratio.denominator, value: e.denominator, onChange: (v) => setE({ ...e, denominator: v.target.value }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, type: "number", placeholder: it.metricKey === "video_view_threshold" ? "Lượt xem của video" : "Giá trị", value: e.value, onChange: (v) => setE({ ...e, value: v.target.value }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, type: "date", value: e.date, onChange: (v) => setE({ ...e, date: v.target.value }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: `${inp$1} sm:col-span-2`, placeholder: it.metricKey === "video_view_threshold" ? "Đường dẫn video (bắt buộc)" : "Đường dẫn bằng chứng (ảnh chụp, tài liệu…)", value: e.link, onChange: (v) => setE({ ...e, link: v.target.value }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: `${inp$1} sm:col-span-2`, placeholder: "Ghi chú", value: e.note, onChange: (v) => setE({ ...e, note: v.target.value }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `${btn$1} sm:col-span-2 justify-center`, disabled: !e.link.trim() || (ratio ? !e.denominator : !e.value), onClick: async () => {
            const entry = {
              id: Math.random().toString(36).slice(2),
              recordedAt: `${e.date}T12:00:00`,
              recordedBy: actor.id,
              link: e.link.trim(),
              note: e.note.trim() || void 0,
              ...ratio ? { numerator: Number(e.numerator || 0), denominator: Number(e.denominator) } : { value: Number(e.value) }
            };
            if (await save([...entries, entry], "Đã ghi nhận — chờ xác nhận")) setE({ ...e, value: "", numerator: "", denominator: "", link: "", note: "" });
          }, children: "Ghi nhận kết quả" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground sm:col-span-2", children: 'Kết quả chỉ được tính sau khi bấm "Xác nhận". Cần có bằng chứng.' })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chức năng tự gửi kết quả cho nhân viên đang chờ mở quyền trên hệ thống. Tạm thời gửi bằng chứng cho quản lý để ghi nhận." })
      ] })
    ] })
  ] }) });
}
function GoalEditSheet({ actor, goal, onClose, onDuplicate }) {
  const meta = goal.metadata;
  const dup = !!onDuplicate;
  const [ptype, setPtype] = reactExports.useState(meta.periodType ?? "custom");
  const [v, setV] = reactExports.useState({
    title: dup ? `${goal.title} (bản sao)` : goal.title,
    description: goal.description ?? "",
    scope: meta.scope ?? (meta.ownerId ? "personal" : "department"),
    scopeRef: meta.scopeRef ?? meta.ownerId ?? "Phòng Marketing",
    coordinatorId: meta.coordinatorId ?? "",
    start: goal.periodStart,
    end: goal.periodEnd,
    deadline: meta.deadline ?? goal.periodEnd
  });
  const [saving, setSaving] = reactExports.useState(false);
  const errs = validateGoalDates(v.start, v.end, v.deadline);
  const setRange = (s, e) => setV({ ...v, start: s, end: e, deadline: e });
  const setType = (t) => {
    setPtype(t);
    if (t !== "custom") {
      const [s, e] = rangeOf(t, v.start);
      setRange(s, e);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "w-full overflow-y-auto sm:max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: dup ? "Nhân bản mục tiêu" : "Sửa mục tiêu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: dup ? "Bản sao ở dạng Nháp, sao chép KR đang dùng, chưa phân bổ nhân sự. Kỳ KPI cũ giữ nguyên." : "Thay đổi thời gian không làm thay đổi kỳ của các chỉ tiêu đã giao hay kỳ đã khóa." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `${lbl} sm:col-span-2`, children: [
        "Tên mục tiêu",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, value: v.title, onChange: (e) => setV({ ...v, title: e.target.value }) })
      ] }),
      !dup && /* @__PURE__ */ jsxRuntimeExports.jsx(ScopeFields, { v, set: (p) => setV({ ...v, ...p }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeframeFields, { ptype, setType, start: v.start, end: v.end, deadline: v.deadline, setRange, setDates: (p) => setV({ ...v, ...p }), errs }),
      !dup && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `${lbl} sm:col-span-2`, children: [
        "Nội dung liên quan",
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: `${inp$1} h-20 py-1.5`, value: v.description, onChange: (e) => setV({ ...v, description: e.target.value }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn$1, disabled: saving || !v.title.trim() || errs.length > 0, onClick: async () => {
      setSaving(true);
      const ok = dup ? await onDuplicate({ title: v.title.trim(), start: v.start, end: v.end, deadline: v.deadline, ptype }) : await run$1(() => svc$1.saveGoal(actor, {
        ...goal,
        title: v.title,
        description: v.description || null,
        periodStart: v.start,
        periodEnd: v.end,
        metadata: { ...meta, scope: v.scope, scopeRef: v.scopeRef, coordinatorId: v.coordinatorId || null, deadline: v.deadline, periodType: ptype }
      }), "Đã lưu mục tiêu", () => {
      });
      setSaving(false);
      if (ok) onClose();
    }, children: saving ? "Đang lưu…" : dup ? "Nhân bản" : "Lưu" }) })
  ] }) });
}
function KrEditSheet({ actor, kr, goal, onClose }) {
  const [v, setV] = reactExports.useState({ label: kr.label ?? "", target: kr.targetValue, deadline: kr.deadline ?? "", reason: "" });
  const [saving, setSaving] = reactExports.useState(false);
  const history = kr.metadata.history ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "w-full overflow-y-auto sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Sửa KR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetDescription, { children: [
        getKpiMetric(kr.metricKey)?.label,
        " · Sửa chỉ tiêu chung không tự đổi phân bổ của nhân viên."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Tên hiển thị",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, value: v.label, placeholder: getKpiMetric(kr.metricKey)?.label, onChange: (e) => setV({ ...v, label: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Chỉ tiêu chung",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, className: inp$1, value: v.target, onChange: (e) => setV({ ...v, target: Number(e.target.value) }) })
      ] }),
      v.target !== kr.targetValue && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Lý do thay đổi",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp$1, value: v.reason, onChange: (e) => setV({ ...v, reason: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: lbl, children: [
        "Deadline KR",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp$1, min: goal.periodStart, max: goal.periodEnd, value: v.deadline || goal.periodEnd, onChange: (e) => setV({ ...v, deadline: e.target.value }) })
      ] }),
      history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Lịch sử chỉ tiêu" }),
        history.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          fmtD(h.at.slice(0, 10)),
          ": ",
          h.from,
          " → ",
          h.to,
          h.reason ? ` · ${h.reason}` : ""
        ] }, i))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn$1, disabled: saving || !(v.target > 0) || v.target !== kr.targetValue && !v.reason.trim(), onClick: async () => {
      setSaving(true);
      const ok = await run$1(() => svc$1.saveKr(actor, { ...kr, label: v.label.trim() || null, targetValue: v.target, deadline: v.deadline || null }, v.reason), "Đã lưu KR", () => {
      });
      setSaving(false);
      if (ok) onClose();
    }, children: saving ? "Đang lưu…" : "Lưu" }) })
  ] }) });
}
const locked = (p) => p?.status === "locked" || p?.status === "closed";
function KrCard({ actor, kr, goal, db, refresh, onOpen, onEdit, readOnly }) {
  const users = useAuth((s) => s.users);
  const { brands, websites, socials } = useStore();
  const brandOf = useBrandOf();
  const actualOf = useKrActual();
  const [open, setOpen] = reactExports.useState(false);
  const [add, setAdd] = reactExports.useState(null);
  const m = getKpiMetric(kr.metricKey);
  const div = isDivisible(kr.metricKey);
  const rows = db.items.filter((i) => i.krId === kr.id).map((it) => {
    const p = db.periods.find((x) => x.id === it.kpiPeriodId);
    const a = p ? actualOf(p.userId, it, p.periodStart, p.periodEnd, locked(p)) : { value: null, warnings: 0, evidence: [] };
    return { it, p, a, st: krState(m, a, it, p?.periodEnd ?? goal.periodEnd) };
  });
  const sum = allocationSummary(kr, rows.map((r) => r.it));
  const total = aggregateKr(kr.metricKey, rows.map((r) => ({ value: r.a.value, evidence: r.a.evidence.map((e) => ({ type: e.type, id: e.id })) })));
  const pseudo = { ...rows[0]?.it, metricKey: kr.metricKey, targetValue: kr.targetValue, unit: m?.unit ?? "count", metadata: { deadline: kr.deadline ?? void 0 } };
  const st = krState(m, { value: total, warnings: 0, evidence: rows.flatMap((r) => r.a.evidence) }, pseudo, goal.periodEnd);
  const where = kr.websiteId ? websites.find((w) => w.id === kr.websiteId)?.name ?? "Website" : kr.socialId ? socials.find((s) => s.id === kr.socialId)?.name ?? "Kênh" : kr.brandId ? brands.find((b) => b.id === kr.brandId)?.name ?? "Dự án" : "Nhiều dự án";
  const chName = (it) => it.websiteId ? websites.find((w) => w.id === it.websiteId)?.name ?? "Website" : it.socialId ? socials.find((s) => s.id === it.socialId)?.name ?? "Kênh" : "Toàn phạm vi KR";
  const hasResult = rows.some((r) => r.a.evidence.length > 0 || (r.a.value ?? 0) > 0);
  const anyLocked = rows.some((r) => locked(r.p));
  const webOpts = kr.websiteId || kr.socialId || !m?.scopes.includes("website") ? [] : websites.filter((w) => !kr.brandId || w.brandId === kr.brandId);
  const socOpts = kr.websiteId || kr.socialId || !m?.scopes.includes("social") ? [] : socials.filter((s) => !kr.brandId || s.brandId === kr.brandId);
  const inactive = kr.status !== "active" || readOnly;
  const krLocked = readOnly;
  const saveAlloc = async () => {
    if (!add) return;
    const ch = add.channel || (kr.websiteId ? `w:${kr.websiteId}` : kr.socialId ? `s:${kr.socialId}` : "");
    const [t, id] = ch.split(":");
    const item = {
      krId: kr.id,
      metricKey: kr.metricKey,
      targetValue: div ? add.target : kr.targetValue,
      brandId: kr.brandId,
      websiteId: t === "w" ? id : null,
      socialId: t === "s" ? id : null,
      label: kr.label,
      metadata: { ...Object.fromEntries(Object.entries(kr.metadata).filter(([k]) => !["history", "clientKey"].includes(k))), ...add.deadline ? { deadline: add.deadline } : {}, clientKey: rid() }
    };
    const sc = checkAllocationScope(kr, item, brandOf);
    if (sc) {
      toast.error(sc);
      return;
    }
    if (!div && rows.length) {
      toast.error("KR này không chia theo nhân sự — đã có người chịu trách nhiệm.");
      return;
    }
    const ok = await run$1(() => svc$1.assign(actor, { userId: add.userId, periodType: goal.metadata.periodType ?? "custom", periodStart: goal.periodStart, periodEnd: goal.periodEnd, goalId: goal.id, items: [item] }), "Đã phân bổ", refresh);
    if (ok) setAdd(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("px-4 py-2.5", inactive && "opacity-60"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex min-w-0 flex-1 items-center gap-2 text-left", onClick: () => setOpen(!open), children: [
        open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium", children: kr.label || m?.label }),
            m && m.availability !== "linked" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("shrink-0 rounded px-1 py-0.5 text-[10px]", AV_TONE[m.availability]), children: AVAILABILITY_LABEL[m.availability] }),
            inactive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded bg-muted px-1 py-0.5 text-[10px]", children: kr.status === "cancelled" ? "Đã hủy" : "Lưu trữ" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-[11px] text-muted-foreground", children: [
            where,
            " · ",
            rows.length,
            " nhân sự",
            sum.message ? ` · ${sum.message}` : "",
            !div ? " · Không phân bổ theo nhân sự" : ""
          ] }),
          st.pct !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-full rounded-full", st.state === "achieved" ? "bg-success" : st.state === "overdue" ? "bg-destructive" : "bg-primary"), style: { width: `${st.pct}%` } }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold tabular-nums", children: [
          total ?? "—",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-muted-foreground", children: [
            " / ",
            st.dir === "at_most" ? "≤" : "",
            kr.targetValue,
            unitTxt(m?.unit ?? "count")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("text-[11px] font-medium", st.tone), children: st.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          "hạn ",
          fmtD(kr.deadline ?? goal.periodEnd)
        ] })
      ] }),
      (can(actor, "kpi.kr_adjust") || can(actor, "kpi.kr_assign")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { className: "rounded p-1 text-muted-foreground hover:bg-muted", "aria-label": "Thao tác KR", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
          !krLocked && can(actor, "kpi.kr_adjust") && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: onEdit, children: "Sửa KR / chỉ tiêu / deadline" }),
          !inactive && can(actor, "kpi.kr_assign") && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => {
            setOpen(true);
            setAdd({ userId: "", channel: "", target: Math.max(1, -sum.diff || 1), deadline: "" });
          }, children: "Phân bổ nhân sự" }),
          !krLocked && can(actor, "kpi.kr_adjust") && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
          !can(actor, "kpi.kr_adjust") ? null : krLocked ? kr.status !== "archived" ? /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => run$1(() => svc$1.setKrStatus(actor, kr.id, "archived"), "Đã lưu trữ KR", refresh), children: "Lưu trữ" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { disabled: true, children: "Chỉ xem (mục tiêu không còn hoạt động)" }) : kr.status === "active" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => confirm("Hủy KR này? Kết quả đã có vẫn được giữ.") && run$1(() => svc$1.setKrStatus(actor, kr.id, "cancelled"), "Đã hủy KR", refresh), children: "Hủy KR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => run$1(() => svc$1.setKrStatus(actor, kr.id, "archived"), "Đã lưu trữ KR", refresh), children: "Lưu trữ" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => run$1(() => svc$1.setKrStatus(actor, kr.id, "active"), "Đã mở lại KR", refresh), children: "Khôi phục" }),
          !krLocked && can(actor, "kpi.kr_adjust") && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { className: "text-destructive", disabled: !canHardDelete(hasResult, anyLocked), onClick: () => confirm("Xóa KR và các dòng phân bổ chưa có kết quả?") && run$1(() => {
            rows.forEach((r) => svc$1.removeItem(actor, r.it.id));
            svc$1.deleteKr(actor, kr.id);
          }, "Đã xóa KR", refresh), children: [
            "Xóa",
            !canHardDelete(hasResult, anyLocked) ? " (đã có kết quả/khóa kỳ)" : ""
          ] })
        ] })
      ] })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 overflow-x-auto rounded-md border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1.5 text-left font-medium", children: "Nhân sự" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 text-left font-medium", children: "Website / Kênh" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 text-right font-medium", children: "Hoàn thành" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 text-left font-medium", children: "Deadline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
          rows.map(({ it, p, a, st: rs }) => {
            const res = a.evidence.length > 0 || (a.value ?? 0) > 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-left hover:text-primary hover:underline", onClick: () => p && onOpen({ it, userId: p.userId, start: p.periodStart, end: p.periodEnd }), children: users.find((u) => u.id === p?.userId)?.fullName ?? "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2", children: chName(it) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 text-right tabular-nums", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: a.value ?? "—" }),
                "/",
                div ? it.targetValue : kr.targetValue,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: rs.tone, children: [
                  "· ",
                  rs.label
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2", children: fmtD(krDeadline(it, p?.periodEnd ?? goal.periodEnd)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "whitespace-nowrap px-2 text-right", children: [
                can(actor, "kpi.kr_adjust") && !krLocked && div && !locked(p) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mr-2 text-primary hover:underline", onClick: () => {
                  const v = prompt("Chỉ tiêu mới cho dòng này", String(it.targetValue));
                  if (!v) return;
                  const reason = prompt("Lý do thay đổi") ?? "";
                  run$1(() => svc$1.updateTarget(actor, it.id, Number(v), reason), "Đã sửa phân bổ", refresh);
                }, children: "Sửa" }),
                can(actor, "kpi.kr_adjust") && !krLocked && canHardDelete(res, locked(p)) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-muted-foreground hover:text-destructive", onClick: () => confirm("Xóa dòng phân bổ này?") && run$1(() => svc$1.removeItem(actor, it.id), "Đã xóa dòng phân bổ", refresh), children: "Xóa" })
              ] })
            ] }, it.id);
          }),
          !rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-2 py-2 text-muted-foreground", children: "Chưa phân bổ cho nhân sự nào." }) })
        ] })
      ] }),
      add ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 border-t border-border p-2 sm:grid-cols-[1.3fr_1.3fr_80px_130px_auto]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: add.userId, onChange: (e) => setAdd({ ...add, userId: e.target.value }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Nhân sự —" }),
          users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.fullName || u.username }, u.id))
        ] }),
        webOpts.length || socOpts.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: add.channel, onChange: (e) => setAdd({ ...add, channel: e.target.value }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Toàn phạm vi KR" }),
          webOpts.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `w:${w.id}`, children: [
            "Web: ",
            w.name
          ] }, w.id)),
          socOpts.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `s:${x.id}`, children: [
            x.platform,
            ": ",
            x.name
          ] }, x.id))
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center text-muted-foreground", children: where }),
        div ? /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, className: inp$1, value: add.target, onChange: (e) => setAdd({ ...add, target: Number(e.target.value) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp$1, title: "Deadline riêng (tùy chọn)", min: goal.periodStart, max: goal.periodEnd, value: add.deadline, onChange: (e) => setAdd({ ...add, deadline: e.target.value }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn$1, disabled: !add.userId || div && !(add.target > 0), onClick: saveAlloc, children: "Lưu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn2$1, onClick: () => setAdd(null), children: "Hủy" })
        ] })
      ] }) : can(actor, "kpi.kr_assign") && !inactive && (div || !rows.length) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full border-t border-border px-2 py-1.5 text-left text-xs font-medium text-primary hover:bg-muted/40", onClick: () => setAdd({ userId: "", channel: "", target: Math.max(1, -sum.diff || 1), deadline: "" }), children: "+ Phân bổ chỉ tiêu" })
    ] })
  ] });
}
function GoalsBoard({ actor, db, refresh, periodKey, brandFilter }) {
  const users = useAuth((s) => s.users);
  const { brands, websites, socials } = useStore();
  const actualOf = useKrActual();
  const [creating, setCreating] = reactExports.useState(false);
  const [adding, setAdding] = reactExports.useState(null);
  const [editGoal, setEditGoal] = reactExports.useState(null);
  const [editKr, setEditKr] = reactExports.useState(null);
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [links, setLinks] = reactExports.useState(null);
  const [detail, setDetail] = reactExports.useState(null);
  const [ps, pe] = (periodKey ?? "|").split("|");
  const goals = reactExports.useMemo(() => db.goals.filter((g) => (!periodKey || g.periodStart <= pe && g.periodEnd >= ps) && (!brandFilter || g.brandId === brandFilter) && (showArchived || !g.metadata.archived)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [db, periodKey, brandFilter, ps, pe, showArchived]);
  const legacyOf = (gid) => krsOfGoal(gid, db.items, db.periods).filter((i) => !i.krId);
  const krsOfG = (gid) => (db.krs ?? []).filter((k) => k.goalId === gid && (showArchived || k.status !== "archived"));
  const scope = (x) => x.websiteId ? websites.find((w) => w.id === x.websiteId)?.name ?? "Website" : x.socialId ? socials.find((s) => s.id === x.socialId)?.name ?? "Kênh" : x.brandId ? brands.find((b) => b.id === x.brandId)?.name ?? "Dự án" : "Toàn phạm vi mục tiêu";
  const nameOf = (id) => users.find((u) => u.id === id)?.fullName ?? users.find((u) => u.id === id)?.username;
  const scopeText = (g) => {
    const m = g.metadata;
    if (!m.scope) return `Chưa đặt phạm vi (dữ liệu cũ)${g.brandId ? ` · ${scope(g)}` : ""}${m.ownerId ? ` · Phụ trách: ${nameOf(m.ownerId) ?? "—"}` : ""}`;
    const ref = m.scope === "project" ? brands.find((b) => b.id === m.scopeRef)?.name : m.scope === "personal" ? nameOf(m.scopeRef) : m.scopeRef;
    return `${SCOPE_LABEL[m.scope]}${ref ? `: ${ref}` : ""}`;
  };
  const goalAdd = adding ? db.goals.find((g) => g.id === adding) : null;
  const goalEdit = editGoal ? db.goals.find((g) => g.id === editGoal) : null;
  const krEdit = editKr ? (db.krs ?? []).find((k) => k.id === editKr) : null;
  const [dupGoal, setDupGoal] = reactExports.useState(null);
  const setGoalStatus = (g, status) => {
    if (status === "active") {
      const bad = krsOfG(g.id).filter((k) => k.status === "active" && !allocationSummary(k, db.items.filter((i) => i.krId === k.id)).balanced);
      if (bad.length) {
        toast.error(`Chưa thể giao chính thức: ${bad.length} KR phân bổ chưa khớp chỉ tiêu`, { description: bad.map((k) => `${k.label || getKpiMetric(k.metricKey)?.label}: ${allocationSummary(k, db.items.filter((i) => i.krId === k.id)).message}`).join("\n") });
        return;
      }
    }
    if (status === "cancelled" && !confirm(`Hủy mục tiêu "${g.title}"? Mục tiêu chuyển sang chỉ xem, KR và kết quả cũ vẫn được giữ.`)) return;
    run$1(() => svc$1.saveGoal(actor, { ...g, status }), "Đã cập nhật trạng thái", refresh);
  };
  const restore = (g) => {
    if (!confirm(`Khôi phục mục tiêu "${g.title}"? Kỳ đã khóa sẽ không được mở lại.`)) return;
    const ok = krsOfG(g.id).filter((k) => k.status === "active").every((k) => allocationSummary(k, db.items.filter((i) => i.krId === k.id)).balanced);
    run$1(() => svc$1.saveGoal(actor, { ...g, status: ok ? "active" : "draft" }), ok ? "Đã khôi phục — Đang thực hiện" : "Đã khôi phục về Nháp (phân bổ chưa khớp)", refresh);
  };
  const toggleArchive = (g, archived) => run$1(() => svc$1.saveGoal(actor, { ...g, metadata: { ...g.metadata, archived: !archived } }), archived ? "Đã bỏ lưu trữ (trạng thái giữ nguyên)" : "Đã lưu trữ (trạng thái giữ nguyên)", refresh);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      can(actor, "kpi.goal_create") && !creating && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: btn$1, onClick: () => setCreating(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Tạo mục tiêu"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "ml-auto flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: showArchived, onChange: (e) => setShowArchived(e.target.checked) }),
        "Hiện mục đã lưu trữ"
      ] })
    ] }),
    can(actor, "kpi.goal_create") && creating && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalWizard, { actor, onDone: () => {
      setCreating(false);
      refresh();
    } }),
    !goals.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground", children: "Chưa có mục tiêu trong kỳ này." }),
    links && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalLinksSheet, { goal: links, onClose: () => setLinks(null), onDeleted: async () => {
      setLinks(null);
      await hydrateKpi();
      refresh();
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-2", children: goals.map((g) => {
      const meta = g.metadata;
      const krs = krsOfG(g.id);
      const legacy = legacyOf(g.id);
      const states = legacy.map((it) => {
        const p = db.periods.find((x) => x.id === it.kpiPeriodId);
        if (!p) return null;
        const a = actualOf(p.userId, it, p.periodStart, p.periodEnd, locked(p));
        return { it, p, a, st: krState(getKpiMetric(it.metricKey), a, it, p.periodEnd) };
      }).filter(Boolean);
      const caps = goalCaps(g, db, actor.p ?? actor.isAdmin);
      const gLocked = goalLocked(g.id, db);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-xl border border-border bg-card", meta.archived && "opacity-60"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 border-b border-border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
              g.title,
              meta.archived && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal", children: "Lưu trữ" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-xs text-muted-foreground", children: [
              scopeText(g),
              meta.coordinatorId ? ` · Điều phối: ${nameOf(meta.coordinatorId) ?? "—"}` : "",
              " · Thực hiện",
              meta.periodType && meta.periodType !== "custom" ? ` (${rangeLabel(meta.periodType, g.periodStart, g.periodEnd)})` : "",
              ": ",
              fmtD(g.periodStart),
              " → ",
              fmtD(g.periodEnd),
              " · Deadline ",
              fmtD(meta.deadline ?? g.periodEnd)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-start gap-1 text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              caps.edit && can(actor, "kpi.goal_archive") ? /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-7 rounded-md border border-input bg-background px-1.5 text-xs", value: g.status, onChange: (e) => setGoalStatus(g, e.target.value), children: Object.entries(GOAL_STATUS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("rounded px-1.5 py-0.5 text-xs", g.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted"), children: [
                GOAL_STATUS[g.status],
                gLocked ? " · Kỳ đã khóa" : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
                krs.length + states.length,
                " KR"
              ] })
            ] }),
            (caps.edit || caps.addKr || caps.duplicate || caps.archive || can(actor, "kpi.goal_delete") || actor.isAdmin) && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { className: "rounded p-1 text-muted-foreground hover:bg-muted", "aria-label": "Thao tác mục tiêu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
                caps.readOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { disabled: true, children: caps.reason ?? "Chỉ xem" }),
                caps.edit && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => setEditGoal(g.id), children: "Sửa mục tiêu" }),
                caps.addKr && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => setAdding(g.id), children: "Thêm KR" }),
                caps.duplicate && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => setDupGoal(g), children: gLocked ? "Nhân bản sang kỳ mới" : "Nhân bản" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
                caps.cancel && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => setGoalStatus(g, "cancelled"), children: "Hủy mục tiêu" }),
                caps.restore && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => restore(g), children: "Khôi phục" }),
                caps.archive && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => toggleArchive(g, !!meta.archived), children: meta.archived ? "Bỏ lưu trữ" : "Lưu trữ" }),
                can(actor, "kpi.goal_delete") && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { className: "text-destructive", disabled: !caps.delete, title: caps.deleteBlockers.join("\n"), onClick: () => confirm(`Xóa vĩnh viễn mục tiêu "${g.title}"? Thao tác này không thể hoàn tác.`) && run$1(() => svc$1.deleteGoal(actor, g.id), "Đã xóa mục tiêu", refresh), children: "Xóa vĩnh viễn" }),
                actor.isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => setLinks(g), children: "Xem dữ liệu liên kết" }),
                can(actor, "kpi.goal_delete") && caps.deleteBlockers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-64 px-2 pb-1.5 text-[11px] leading-snug text-muted-foreground", children: [
                  "Không xóa được: ",
                  caps.deleteBlockers.join("; "),
                  '. Bấm "Xem dữ liệu liên kết" để kiểm tra.'
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-border", children: [
          krs.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(KrCard, { actor, kr: k, goal: g, db, refresh, onOpen: setDetail, onEdit: () => setEditKr(k.id), readOnly: caps.readOnly }, k.id)),
          states.map(({ it, p, a, st }) => {
            const m = getKpiMetric(it.metricKey);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDetail({ it, userId: p.userId, start: p.periodStart, end: p.periodEnd }), className: "group flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium", children: it.label || m?.label }),
                  m && m.availability !== "linked" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("shrink-0 rounded px-1 py-0.5 text-[10px]", AV_TONE[m.availability]), children: AVAILABILITY_LABEL[m.availability] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate text-[11px] text-muted-foreground", children: [
                  nameOf(p.userId) ?? "—",
                  " · ",
                  scope(it),
                  a.status ? ` · ${a.status}` : ""
                ] }),
                st.pct !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-full rounded-full", st.state === "achieved" ? "bg-success" : st.state === "late" ? "bg-warning" : st.state === "overdue" ? "bg-destructive" : "bg-primary"), style: { width: `${st.pct}%` } }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold tabular-nums", children: [
                  a.value ?? "—",
                  a.value !== null ? unitTxt(it.unit) : "",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-muted-foreground", children: [
                    " / ",
                    st.dir === "at_most" ? "≤" : "",
                    it.targetValue,
                    unitTxt(it.unit)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("text-[11px] font-medium", st.tone), children: st.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                  "hạn ",
                  fmtD(st.deadline)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" })
            ] }, it.id);
          }),
          !krs.length && !states.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-3 text-xs text-muted-foreground", children: "Chưa có KR." })
        ] }),
        caps.readOnly && caps.reason && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border px-4 py-2 text-[11px] text-muted-foreground", children: caps.reason }),
        caps.addKr && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline", onClick: () => setAdding(g.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          "Thêm KR"
        ] }) })
      ] }, g.id);
    }) }),
    goalAdd && /* @__PURE__ */ jsxRuntimeExports.jsx(AddKrSheet, { actor, goal: goalAdd, db, onClose: () => {
      setAdding(null);
      refresh();
    } }),
    goalEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalEditSheet, { actor, goal: goalEdit, onClose: () => {
      setEditGoal(null);
      refresh();
    } }),
    krEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(KrEditSheet, { actor, kr: krEdit, goal: db.goals.find((g) => g.id === krEdit.goalId), onClose: () => {
      setEditKr(null);
      refresh();
    } }),
    detail && /* @__PURE__ */ jsxRuntimeExports.jsx(KrDetail, { actor, ...detail, it: db.items.find((i) => i.id === detail.it.id) ?? detail.it, onSaved: refresh, onClose: () => {
      setDetail(null);
      refresh();
    } })
  ] });
}
const PERIOD_ST = { draft: "Nháp", active: "Đang chạy", locked: "Đã khóa", closed: "Đã đóng" };
const KR_ST = { active: "Đang hoạt động", archived: "Đã lưu trữ", cancelled: "Đã hủy" };
function periodBlock(p) {
  if (p.status === "locked" || p.status === "closed") return "Kỳ đã khóa/đóng";
  if (p.snapshots) return "Đã chốt kết quả";
  if (p.items) return `Có ${p.items} chỉ tiêu phân bổ`;
  return null;
}
function GoalLinksSheet({ goal, onClose, onDeleted }) {
  const [d, setD] = reactExports.useState(null);
  const [err, setErr] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.rpc("goal_links", { _goal: goal.id }).then(({ data, error }) => error ? setErr(error.message) : setD(data));
  }, [goal.id]);
  const blocked = d ? [
    ...d.krs.map((k) => `KR "${k.label}" (${KR_ST[k.status] ?? k.status})`),
    ...d.items ? [`${d.items} dòng chỉ tiêu gắn trực tiếp`] : [],
    ...d.periods.filter(periodBlock).map((p) => `Kỳ của ${p.user}: ${periodBlock(p)}`)
  ] : [];
  const empties = d ? d.periods.filter((p) => !periodBlock(p)) : [];
  const del = async () => {
    if (!confirm(`Xóa ${empties.length} kỳ KPI trống và xóa vĩnh viễn mục tiêu "${goal.title}"? Không thể hoàn tác.`)) return;
    setBusy(true);
    const { error } = await supabase.rpc("goal_delete_empty", { _goal: goal.id });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Đã xóa mục tiêu");
    onDeleted();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "w-full overflow-y-auto sm:max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Dữ liệu liên kết" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: goal.title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4 text-sm", children: [
      err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-destructive", children: err }),
      !d && !err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Đang kiểm tra…" }),
      d && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 font-medium", children: [
            "KR (",
            d.krs.length,
            ")"
          ] }),
          d.krs.length ? d.krs.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
            "• ",
            k.label,
            " — ",
            KR_ST[k.status] ?? k.status,
            " · ",
            k.allocs,
            " phân bổ"
          ] }, k.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Không có KR nào, kể cả đã lưu trữ/hủy." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 font-medium", children: [
            "Kỳ KPI nhân sự (",
            d.periods.length,
            ")"
          ] }),
          d.periods.length ? d.periods.map((p) => {
            const b = periodBlock(p);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 rounded border border-border p-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
                p.user,
                " · ",
                fmtD(p.start),
                " → ",
                fmtD(p.end),
                " · ",
                PERIOD_ST[p.status] ?? p.status
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                p.items,
                " chỉ tiêu · ",
                p.adjustments,
                " điều chỉnh · ",
                p.snapshots,
                " bản chốt"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: b ? "text-destructive" : "text-muted-foreground", children: b ? `Ngăn xóa: ${b}` : "Kỳ trống — chưa có dữ liệu nghiệp vụ" })
            ] }, p.id);
          }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Không có kỳ nào." })
        ] }),
        blocked.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded bg-destructive/10 p-2 text-xs text-destructive", children: [
            "Không thể xóa vĩnh viễn: ",
            blocked.join("; "),
            ". Hãy dùng Hủy hoặc Lưu trữ."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PurgeTest, { goal, onDeleted })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, onClick: del, className: "w-full rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50", children: empties.length ? `Xóa ${empties.length} kỳ trống và xóa mục tiêu` : "Xóa vĩnh viễn mục tiêu" })
      ] })
    ] })
  ] }) });
}
function PurgeTest({ goal, onDeleted }) {
  const [pv, setPv] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const call = async (execute) => {
    setBusy(true);
    const { data, error } = await supabase.rpc("goal_purge_test", { _goal: goal.id, _execute: execute });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return null;
    }
    return data;
  };
  const run2 = async () => {
    if (!confirm(`Xóa triệt để "${goal.title}" cùng ${pv.periods.length} kỳ, ${pv.items.length} chỉ tiêu, ${pv.snapshots.length} bản chốt? Không thể hoàn tác.`)) return;
    if (await call(true)) {
      toast.success("Đã dọn mục tiêu thử nghiệm");
      onDeleted();
    }
  };
  if (!pv) return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, onClick: async () => setPv(await call(false)), className: "w-full rounded-md border border-border px-3 py-2 text-xs", children: "Kiểm tra dọn dẹp dữ liệu thử nghiệm" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded border border-border p-2 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Bản ghi sẽ bị xóa" }),
    pv.periods.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      "• Kỳ KPI: ",
      p.user,
      " · ",
      fmtD(p.start),
      " → ",
      fmtD(p.end),
      " · ",
      PERIOD_ST[p.status] ?? p.status
    ] }, p.id)),
    pv.items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      "• Chỉ tiêu: ",
      getKpiMetric(i.metric)?.label ?? i.metric,
      " · mục tiêu ",
      i.target
    ] }, i.id)),
    pv.snapshots.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      "• Bản chốt kỳ lập ",
      new Date(x.at).toLocaleString("vi-VN")
    ] }, x.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      "• Mục tiêu: ",
      goal.title
    ] }),
    pv.blockers.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-destructive", children: [
      "Không thể dọn: ",
      pv.blockers.join("; "),
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, onClick: run2, className: "w-full rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50", children: "Xác nhận xóa triệt để" })
  ] });
}
const svc = createKpiService(cloudRepository);
const inp = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const btn = "h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50";
const btn2 = "h-8 rounded-md border border-input px-2 text-xs";
function useKpiDb() {
  const [db, setDb] = reactExports.useState(null);
  const refresh = () => setDb(svc.list());
  reactExports.useEffect(() => {
    refresh();
    return onCloudSync(() => refresh());
  }, []);
  return { db, refresh };
}
async function run(fn, ok, after) {
  try {
    fn();
    await flushKpi();
    toast.success(ok);
    after();
    return true;
  } catch (e) {
    toast.error(e instanceof KpiError ? e.message : `Không lưu được: ${e.message ?? e}`);
    after();
    return false;
  }
}
function KpiV2Gate({ title, children, perm }) {
  const actor = useKpiActor();
  const [state, setState] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const on = isKpiV2Enabled();
    (async () => {
      try {
        await hydrateKpi();
        setState({ on, ready: true });
      } catch (e) {
        setState({ on, ready: false, error: String(e.message ?? e) });
      }
    })();
  }, []);
  if (!state) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-sm text-muted-foreground", children: "Đang tải…" });
  if (!state.on || !actor) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-sm text-muted-foreground", children: "Trang không khả dụng." });
  if (perm && !(Array.isArray(perm) ? perm : [perm]).some((k) => kpiCan(actor, k))) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-sm text-muted-foreground", children: "Bạn không có quyền truy cập trang này." });
  if (state.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-sm text-destructive", children: [
    "Không tải được KPI: ",
    state.error
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: title }),
    children(actor)
  ] });
}
const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const PERIOD_STATUS = { draft: "Nháp", active: "Đang áp dụng", locked: "Đã khóa", closed: "Đã đóng" };
const NEXT_LABEL = { active: "Áp dụng", locked: "Khóa kỳ", closed: "Đóng kỳ" };
function GoalsV2({ actor, periodKey, brandFilter }) {
  const { db, refresh } = useKpiDb();
  if (!db) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GoalsBoard, { actor, db, refresh, periodKey, brandFilter });
}
function useActual() {
  const f = useKrActual();
  return (userId, it, ps, pe, locked2 = false) => f(userId, it, ps, pe, locked2);
}
function AssignKpiV2({ actor }) {
  const [tab, setTab] = reactExports.useState("goals");
  const [tf, setTf] = reactExports.useState("month");
  const [pk, setPk] = reactExports.useState(() => rangeOf("month").join("|"));
  const opts = reactExports.useMemo(() => tf === "custom" ? [] : rangeOptions(tf), [tf]);
  const [cs, ce] = pk.split("|");
  const pickTf = (t) => {
    setTf(t);
    setPk(rangeOf(t === "custom" ? "month" : t, cs).join("|"));
  };
  const [brandF, setBrandF] = reactExports.useState("");
  const brands = useStore((s) => s.brands);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      (actor.isAdmin || kpiCan(actor, "kpi.kr_assign") || kpiCan(actor, "kpi.kr_adjust") || kpiCan(actor, "kpi.goal_create")) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex rounded-lg bg-muted p-1 text-xs sm:text-sm max-w-full overflow-x-auto", children: ["goals", "kpi", "library"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: `whitespace-nowrap rounded-md px-2.5 py-1.5 sm:px-3 ${tab === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`, children: t === "kpi" ? "KR đã giao" : t === "goals" ? "Quản trị Mục tiêu" : "Thư viện KR" }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: inp, "aria-label": "Khung thời gian", value: tf, onChange: (e) => pickTf(e.target.value), children: TIMEFRAMES.map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) }),
      tf === "custom" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp, value: cs, onChange: (e) => e.target.value && setPk(`${e.target.value}|${e.target.value > ce ? e.target.value : ce}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "→" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: inp, min: cs, value: ce, onChange: (e) => e.target.value && setPk(`${cs}|${e.target.value < cs ? cs : e.target.value}`) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: inp, "aria-label": "Kỳ", value: pk, onChange: (e) => setPk(e.target.value), children: opts.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m.key, children: m.label }, m.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp, value: brandF, onChange: (e) => setBrandF(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả thương hiệu" }),
        brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.id, children: b.name }, b.id))
      ] })
    ] }),
    tab !== "library" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
      "Hiển thị mục tiêu và KR có thời gian thực hiện giao với kỳ ",
      cs.split("-").reverse().join("/"),
      " → ",
      ce.split("-").reverse().join("/"),
      ". Mục tiêu kéo dài nhiều kỳ chỉ là một mục tiêu; kết quả luôn tính theo đúng kỳ KPI của từng KR, không cộng trùng."
    ] }),
    tab === "library" ? /* @__PURE__ */ jsxRuntimeExports.jsx(KrLibrary, {}) : tab === "kpi" ? /* @__PURE__ */ jsxRuntimeExports.jsx(KpiList, { actor, periodKey: pk, periodType: tf, brandFilter: brandF }) : /* @__PURE__ */ jsxRuntimeExports.jsx(GoalsV2, { actor, periodKey: pk, brandFilter: brandF })
  ] });
}
function KpiList({ actor, periodKey, periodType, brandFilter }) {
  const { db, refresh } = useKpiDb();
  const users = useAuth((s) => s.users);
  const roles = useAuth((s) => s.roles);
  const brands = useStore((s) => s.brands);
  const websites = useStore((s) => s.websites);
  const socials = useStore((s) => s.socials);
  const actual = useActual();
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const empty = { userId: "", brandId: "", channel: "", metricKey: KPI_METRIC_LIST[0].key, target: 10, goalId: "", label: "", keywordIds: [], threshold: 3, taskIds: [] };
  const keywords = useStore((s) => s.keywords);
  const tasks = useStore((s) => s.tasks);
  const [f, setF] = reactExports.useState(empty);
  const [saving, setSaving] = reactExports.useState(false);
  const view = reactExports.useMemo(() => db ? svc.listForActor(actor) : null, [db, actor]);
  if (!db || !view) return null;
  const [ps, pe] = periodKey.split("|");
  const periods = view.periods.filter((p) => overlaps(p.periodStart, p.periodEnd, ps, pe));
  const pmap = new Map(periods.map((p) => [p.id, p]));
  const rows = view.items.filter((i) => pmap.has(i.kpiPeriodId) && (!brandFilter || i.brandId === brandFilter)).map((it) => ({ it, p: pmap.get(it.kpiPeriodId) })).sort((a, b) => (users.find((u) => u.id === a.p.userId)?.fullName ?? "").localeCompare(users.find((u) => u.id === b.p.userId)?.fullName ?? ""));
  const nested = /* @__PURE__ */ new Set();
  for (const p of periods) for (const id of findNestedItems(view.items.filter((i) => i.kpiPeriodId === p.id), pmap)) nested.add(id);
  const m = getKpiMetric(f.metricKey);
  const chOpts = [
    ...m?.scopes.includes("website") ? websites.filter((w) => w.brandId === f.brandId).map((w) => ({ v: `w:${w.id}`, l: `Web: ${w.name}` })) : [],
    ...m?.scopes.includes("social") ? socials.filter((s) => s.brandId === f.brandId).map((s) => ({ v: `s:${s.id}`, l: `Page: ${s.name}` })) : []
  ];
  const chName = (it) => it.websiteId ? websites.find((w) => w.id === it.websiteId)?.name ?? "Website" : it.socialId ? socials.find((s) => s.id === it.socialId)?.name ?? "Page" : it.brandId ? `${brands.find((b) => b.id === it.brandId)?.name ?? "?"} (toàn thương hiệu)` : "Tất cả thương hiệu";
  const selUser = users.find((u) => u.id === f.userId);
  const template = ROLE_KPI_TEMPLATES[roles.find((r) => r.id === selUser?.roleId)?.name ?? ""];
  const goals = db.goals.filter((g) => g.periodStart <= pe && g.periodEnd >= ps);
  const submit = async () => {
    const [t, id] = f.channel.split(":");
    setSaving(true);
    const ok = await run(() => svc.assign(actor, {
      userId: f.userId,
      periodType,
      periodStart: ps,
      periodEnd: pe,
      goalId: f.goalId || null,
      items: [{
        metricKey: f.metricKey,
        targetValue: f.target,
        brandId: f.brandId || null,
        websiteId: t === "w" ? id : null,
        socialId: t === "s" ? id : null,
        label: f.label.trim() || null,
        metadata: m?.needs === "keyword" ? { keywordIds: f.keywordIds, threshold: f.threshold } : m?.needs === "tasks" ? { taskIds: f.taskIds } : {}
      }]
    }), "Đã giao KPI", refresh);
    setSaving(false);
    if (ok) setF({ ...empty, userId: f.userId, brandId: f.brandId });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    kpiCan(actor, "kpi.kr_assign") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFormOpen(!formOpen), className: "flex w-full items-center justify-between px-4 py-3 text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "+ Giao KPI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formOpen ? "Thu gọn" : "Mở biểu mẫu" })
      ] }),
      formOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t border-border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
            "1. Nhân sự",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: `${inp} w-full`, value: f.userId, onChange: (e) => setF({ ...f, userId: e.target.value }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn —" }),
              users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.fullName || u.username }, u.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
            "2. Thương hiệu",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: `${inp} w-full`, value: f.brandId, onChange: (e) => setF({ ...f, brandId: e.target.value, channel: "" }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả" }),
              brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.id, children: b.name }, b.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
            "4. Loại công việc",
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: `${inp} w-full`, value: f.metricKey, onChange: (e) => setF({ ...f, metricKey: e.target.value, channel: "" }), children: KR_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: g, children: KPI_METRIC_LIST.filter((x) => x.group === g).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: x.key, disabled: !isAssignable(x), title: x.notReady ?? x.rule, children: [
              x.label,
              isAssignable(x) ? "" : ` (${AVAILABILITY_LABEL[x.availability]})`
            ] }, x.key)) }, g)) })
          ] }),
          f.brandId && chOpts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
            "3. Website / Page",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: `${inp} w-full`, value: f.channel, onChange: (e) => setF({ ...f, channel: e.target.value }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Toàn thương hiệu" }),
              chOpts.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.v, children: o.l }, o.v))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
            "5. Số lượng (",
            m?.unit === "point" ? "điểm" : "sản phẩm",
            ")",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, className: `${inp} w-full`, value: f.target, onChange: (e) => setF({ ...f, target: Number(e.target.value) }) })
          ] })
        ] }),
        m?.rule && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Quy tắc: ",
          m.rule,
          " · Nguồn: ",
          m.source,
          " · ",
          DIRECTION_LABEL[m.direction ?? "at_least"]
        ] }),
        m?.needs === "keyword" && (() => {
          const kws = keywords.filter((k) => (!f.channel.startsWith("w:") || k.websiteId === f.channel.slice(2)) && (!f.brandId || websites.find((w) => w.id === k.websiteId)?.brandId === f.brandId));
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-[1fr_auto]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
              "Từ khóa (giữ Ctrl để chọn nhiều) — ",
              kws.length,
              " từ khóa",
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { multiple: true, className: `${inp} h-28 w-full`, value: f.keywordIds, onChange: (e) => setF({ ...f, keywordIds: Array.from(e.target.selectedOptions).map((o) => o.value) }), children: kws.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: k.id, children: [
                k.keyword,
                k.currentTop ? ` — hiện Top ${k.currentTop}` : " — chưa kiểm tra"
              ] }, k.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
              "Ngưỡng Top",
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: `${inp} w-full`, value: f.threshold, onChange: (e) => setF({ ...f, threshold: Number(e.target.value) }), children: [1, 3, 5, 10, 20].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: n, children: [
                "Top ",
                n
              ] }, n)) })
            ] })
          ] });
        })(),
        m?.needs === "tasks" && (() => {
          const ts = tasks.filter((t) => t.status !== "Đã hủy" && (!f.brandId || t.brandId === f.brandId) && (!selUser || !t.assignee || t.assignee === selUser.fullName || t.assignee === selUser.username));
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
              "Tên kết quả cần đạt",
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: `${inp} w-full`, placeholder: "VD: Nghiên cứu 3 bộ từ khóa", value: f.label, onChange: (e) => setF({ ...f, label: e.target.value }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-1 text-xs text-muted-foreground", children: [
              "Liên kết Task có sẵn (giữ Ctrl để chọn nhiều) — tạo Task mới ở trang Task",
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { multiple: true, className: `${inp} h-28 w-full`, value: f.taskIds, onChange: (e) => setF({ ...f, taskIds: Array.from(e.target.selectedOptions).map((o) => o.value) }), children: ts.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: t.id, children: [
                t.title,
                " · ",
                t.status
              ] }, t.id)) })
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp, value: f.goalId, onChange: (e) => setF({ ...f, goalId: e.target.value }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Mục tiêu: không gắn (tùy chọn)" }),
            goals.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g.id, children: g.title }, g.id))
          ] }),
          template && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn2, disabled: saving, onClick: async () => {
            setSaving(true);
            await run(() => svc.assign(actor, { userId: f.userId, periodType, periodStart: ps, periodEnd: pe, goalId: f.goalId || null, items: template }), `Đã giao ${template.length} KPI gợi ý`, refresh);
            setSaving(false);
          }, children: "Giao nhanh theo vai trò" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `${btn} ml-auto`, disabled: saving || !f.userId || !(f.target > 0), onClick: submit, children: saving ? "Đang lưu…" : "Giao KPI" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Kỳ KPI lấy theo bộ lọc thời gian phía trên. Một người có thể nhận nhiều KPI; hệ thống chặn KPI trùng cùng loại và cùng phạm vi." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[680px] text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border text-left text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium", children: "Nhân sự" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Kênh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "KPI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Chỉ tiêu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Kết quả" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "font-medium", children: "Kỳ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        rows.map(({ it, p }) => {
          const u = users.find((x) => x.id === p.userId);
          const locked2 = p.status === "locked" || p.status === "closed";
          const a = actual(p.userId, it, p.periodStart, p.periodEnd, locked2);
          const next = { draft: "active", active: "locked", locked: "closed" }[p.status];
          const first = rows.find((r) => r.p.id === p.id)?.it.id === it.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: u?.fullName || u?.username || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: chName(it) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
              it.label || getKpiMetric(it.metricKey)?.label || it.metricKey,
              a.status && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: a.status }),
              nested.has(it.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-warning-foreground", children: "Nằm trong KPI rộng hơn — không cộng trùng" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: kpiCan(actor, "kpi.kr_adjust") && !locked2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: 1,
                className: `${inp} h-8 w-20`,
                defaultValue: it.targetValue,
                onBlur: (e) => {
                  const v = Number(e.target.value);
                  if (v !== it.targetValue) run(() => svc.updateTarget(actor, it.id, v), "Đã cập nhật chỉ tiêu", refresh);
                }
              },
              `${it.id}${it.targetValue}`
            ) : it.targetValue }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "tabular-nums", children: a.value === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa đủ dữ liệu" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
              a.value,
              it.unit === "percent" ? "%" : "",
              " / ",
              getKpiMetric(it.metricKey)?.direction === "at_most" ? "≤ " : "",
              it.targetValue,
              it.unit === "percent" ? "%" : ""
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded px-1.5 py-0.5 ${locked2 ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`, children: PERIOD_STATUS[p.status] ?? p.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 whitespace-nowrap text-[11px] text-muted-foreground", children: [
                p.periodStart.split("-").reverse().join("/"),
                " → ",
                p.periodEnd.split("-").reverse().join("/")
              ] }),
              kpiCan(actor, "kpi.period_manage") && first && next && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "ml-2 text-primary hover:underline", onClick: () => {
                if (next === "locked" && !confirm(`Khóa kỳ KPI của ${u?.fullName}? Sau khi khóa không thể sửa chỉ tiêu.`)) return;
                const results = next === "locked" ? Object.fromEntries(db.items.filter((x) => x.kpiPeriodId === p.id).map((x) => {
                  const r = actual(p.userId, x, p.periodStart, p.periodEnd);
                  return [x.id, { actual: r.value, achieved: isAchieved(r.value, x.targetValue, directionOf(x.metricKey)), evidence: r.evidence.map((e) => ({ type: e.type, id: e.id, at: e.at })) }];
                })) : void 0;
                run(() => svc.setStatus(actor, p.id, next, results), `Đã chuyển: ${PERIOD_STATUS[next]}`, refresh);
              }, children: NEXT_LABEL[next] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3 text-right", children: kpiCan(actor, "kpi.kr_adjust") && !locked2 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: btn2, onClick: () => confirm("Xóa KPI này?") && run(() => svc.removeItem(actor, it.id), "Đã xóa KPI", refresh), children: "Xóa" }) })
          ] }, it.id);
        }),
        !rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "py-8 text-center text-muted-foreground", children: kpiCan(actor, "kpi.kr_assign") ? "Chưa có KPI trong kỳ này. Nhấn “+ Giao KPI” để bắt đầu." : "Bạn chưa được giao KPI trong kỳ này." }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Hôm nay: ",
      today().split("-").reverse().join("/"),
      " · Kết quả tự động cập nhật khi công việc được duyệt trong các module."
    ] })
  ] });
}
function KrLibrary() {
  const [q, setQ] = reactExports.useState("");
  const [g, setG] = reactExports.useState("");
  const list = KPI_METRIC_LIST.filter((m) => (!g || m.group === g) && (!q || m.label.toLowerCase().includes(q.toLowerCase())));
  const tone = { linked: "bg-primary/10 text-primary", periodic: "bg-accent text-accent-foreground", manual: "bg-warning/15 text-warning-foreground", pending: "bg-muted text-muted-foreground", configure: "bg-muted text-muted-foreground", none: "bg-muted text-muted-foreground" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp, placeholder: "Tìm chỉ số…", value: q, onChange: (e) => setQ(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp, value: g, onChange: (e) => setG(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả nhóm" }),
        KR_GROUPS.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: x }, x))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 md:grid-cols-2", children: list.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: m.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 rounded px-1.5 py-0.5 text-[11px] ${tone[m.availability]}`, children: AVAILABILITY_LABEL[m.availability] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
        m.group,
        " · ",
        DIRECTION_LABEL[m.direction ?? "at_least"],
        " · Nguồn: ",
        m.source ?? "—"
      ] }),
      (m.rule || m.notReady) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: m.notReady ?? m.rule }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-mono text-[10px] text-muted-foreground", children: m.key })
    ] }, m.key)) })
  ] });
}
export {
  AssignKpiV2 as A,
  GoalsV2 as G,
  KpiV2Gate as K
};
