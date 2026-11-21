import { r as rangeOf, v as vnToday, a as addDays } from "./timeframe-CYUNchQ5.mjs";
import { r as readAllPages } from "./storeRead-Ci9Vlcxx.mjs";
function instant(value, end = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return null;
  const day = value.slice(0, 10), dateOnly = value.length === 10;
  const text = dateOnly ? `${value}T${end ? "23:59:59.999" : "00:00:00"}+07:00` : /[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value + "+07:00";
  const n = Date.parse(text);
  if (!Number.isFinite(n)) return null;
  if (dateOnly && vnToday(new Date(n)) !== day) return null;
  return n;
}
function stateFor(module, status) {
  if (["Đã hủy", "Đã huỷ", "cancelled"].includes(status)) return "cancelled";
  if (status === "Hoàn thành" || ["social", "video"].includes(module) && status === "Đã đăng") return "done";
  const waiting = { tasks: ["Chờ xác nhận"], web: ["Chờ duyệt outline", "Chờ duyệt bài", "Bài đã duyệt", "Bài viết đã duyệt", "Đang trình bày nháp web", "Chờ duyệt bản nháp web", "Cần sửa bản nháp web", "Bản nháp web đã duyệt", "Chờ đăng web", "Đã đăng web", "Kiểm tra index", "Chờ duyệt tối ưu", "Đã duyệt tối ưu"], social: ["Chờ duyệt", "Chờ đăng", "Đã lên lịch"], video: ["Chờ duyệt kịch bản", "Chờ duyệt video", "Chờ duyệt", "Đã bàn giao"], design: ["Chờ duyệt", "Đã bàn giao"] };
  if (waiting[module]?.includes(status)) return "waiting";
  const working = { tasks: ["Mới tạo", "Chưa làm", "Đã giao", "Đang làm", "Cần sửa"], web: ["Kế hoạch", "Đã tạo", "Đang tối ưu", "Cần sửa tối ưu", "Đã giao", "Đang làm outline", "Cần sửa outline", "Outline đã duyệt", "Đang viết bài", "Cần sửa bài"], social: ["Kế hoạch", "Ý tưởng", "Đang làm", "Cần sửa"], video: ["Kế hoạch", "Ý tưởng", "Đã giao", "Đang làm kịch bản", "Cần sửa kịch bản", "Kịch bản đã duyệt", "Video đã duyệt", "Đang quay / thu tư liệu", "Đang dựng", "Đang sản xuất", "Cần sửa video", "Cần sửa"], design: ["Chờ phân công", "Chờ nhận việc", "Đang thực hiện", "Đang làm", "Cần sửa", "Đã duyệt"] };
  return working[module]?.includes(status) ? "working" : "other";
}
function summarize(modules, period, now = /* @__PURE__ */ new Date(), extras) {
  const [start, end] = rangeOf(period, vnToday(now));
  const lo = instant(start), hi = Math.min(instant(end, true), now.getTime());
  const all = modules.filter((m) => m.state === "ok").flatMap((m) => m.items);
  const active = all.filter((w) => ["working", "waiting", "other"].includes(w.state));
  const working = active.filter((w) => w.state === "working"), waiting = active.filter((w) => w.state === "waiting");
  const late = (w) => {
    const due = instant(w.due, true);
    return due !== null && due < now.getTime();
  };
  const done = all.filter((w) => w.state === "done" && instant(w.completed) !== null && instant(w.completed) >= lo && instant(w.completed) <= hi);
  const comparable = done.filter((w) => instant(w.due, true) !== null && !(w.completed?.length === 10 && w.due?.length !== 10));
  const ontime = comparable.filter((w) => instant(w.completed) <= instant(w.due, true));
  const overdue = working.filter(late), waitingLate = waiting.filter(late);
  const daily = [];
  for (let day = start; day <= vnToday(now) && day <= end; day = addDays(day, 1)) daily.push({ day, label: day.slice(8) + "/" + day.slice(5, 7), done: done.filter((w) => vnToday(new Date(instant(w.completed))) === day).length });
  const byModule = modules.map((m) => ({ key: m.key, label: m.label, href: m.href, state: m.state, owned: m.items.length, active: active.filter((w) => w.module === m.key).length, working: working.filter((w) => w.module === m.key).length, waiting: waiting.filter((w) => w.module === m.key).length, done: done.filter((w) => w.module === m.key).length, overdue: overdue.filter((w) => w.module === m.key).length }));
  const priorities = [...working.filter((w) => instant(w.due, true) !== null).sort((a, b) => instant(a.due, true) - instant(b.due, true)), ...waitingLate].slice(0, 3).map((w) => ({ ...w, reason: w.state === "waiting" ? "Đã qua hạn hồ sơ; cần theo dõi phản hồi, chưa kết luận lỗi của bạn." : late(w) ? "Đã quá hạn xử lý; kiểm tra và cập nhật hướng giải quyết." : "Ưu tiên theo deadline gần nhất." }));
  const result = { period, start, end, asOf: now.toISOString(), complete: modules.every((m) => m.state !== "error") && (!extras || [extras.signal, extras.k3].every((x) => x.state !== "error")), coverage: modules.filter((m) => m.state === "ok").length, modules: byModule, summary: { active: active.length, working: working.length, waiting: waiting.length, other: active.length - working.length - waiting.length, done: done.length, overdue: overdue.length, waitingLate: waitingLate.length, ontime: ontime.length, comparable: comparable.length, ontimeRate: comparable.length ? Math.round(ontime.length / comparable.length * 100) : null, undatedDone: all.filter((w) => w.state === "done" && instant(w.completed) === null).length, ambiguous: modules.reduce((n, m) => n + m.ambiguous, 0) }, daily, priorities, extras };
  return { ...result, key: JSON.stringify({ period, start, end, modules: byModule, summary: result.summary, priorities: priorities.map((p) => [p.id, p.title, p.status, p.due, p.reason]), extras }) };
}
function uniqueActorNames(people, uid) {
  const actor = people.find((p) => p.id === uid);
  if (!actor) throw new Error("Chưa xác định được tài khoản báo cáo.");
  const normalize = (s) => (s ?? "").trim().toLocaleLowerCase("vi");
  return [uid, ...[actor.full_name, actor.username].filter((v) => !!v && !!normalize(v) && people.filter((p) => [p.full_name, p.username].some((x) => normalize(x) === normalize(v))).length === 1)];
}
function ownItem(data, fields, uid, names) {
  return fields.some(([id, name]) => data[id] ? data[id] === uid : typeof data[name] === "string" && names.some((n) => n.trim().toLocaleLowerCase("vi") === data[name].trim().toLocaleLowerCase("vi")));
}
function ownerFilter(fields, uid, names) {
  return fields.flatMap(([id, name]) => [`data->>${id}.eq.${JSON.stringify(uid)}`, ...names.map((n) => `data->>${name}.eq.${JSON.stringify(n)}`)]).join(",");
}
const managementAllowed = (c) => c.canManage && Object.values(c.capabilities).some(Boolean);
function managedTargets(c) {
  if (!c.capabilities.work) return [];
  const units = new Set(c.units.map((u) => u.id));
  return [...new Set(c.people.filter((p) => p.units.some((u) => units.has(u))).map((p) => p.id))];
}
const sources = [
  { key: "tasks", label: "Task", table: "tasks", href: "/tasks", perms: ["task.view", "task.view_mine", "task.view_all", "task.view_created_by_me"], owners: [["assigneeId", "assignee"]], due: ["deadline"], completed: ["completedAt"] },
  { key: "web", label: "Content Web", table: "web_contents", href: "/web-contents", perms: ["web.content_view"], owners: [["writerId", "writer"]], due: ["deadline", "outlineDeadline"], completed: ["completedAt"] },
  { key: "social", label: "Social", table: "social_posts", href: "/social", perms: ["social.post_view"], owners: [["writerId", "writer"], ["designerId", "designer"]], due: ["scheduledDate"], completed: ["publishedDate"] },
  { key: "video", label: "Video", table: "videos", href: "/videos", perms: ["video.view"], owners: [["ownerId", "owner"]], due: ["deadline", "scriptDeadline"], completed: ["completedAt"] },
  { key: "design", label: "Thiết kế", table: "orders", href: "/orders", perms: ["order.view", "order.photo.view", "order.marketing_design.view", "order.order_mockup.view"], owners: [["assigneeId", "assignee"]], due: ["deadline"], completed: ["completedAt"] }
];
const empty = (state) => ({ state, total: 0, done: 0, active: 0, overdue: 0, waiting: 0 });
async function buildMyPerformance(db, uid, period, now = /* @__PURE__ */ new Date(), options = {}) {
  const [{ data: active, error: activeError }, { data: nav, error: navError }, { data: people, error: peopleError }] = options.access ? [{ data: options.access.context.userId === uid, error: null }, { data: options.access.nav, error: null }, { data: options.access.people, error: null }] : await Promise.all([db.rpc("community_active"), db.rpc("base_permissions_navigation"), db.rpc("get_profiles_directory")]);
  if (activeError || !active) throw new Error("Chỉ tài khoản đang hoạt động được xem báo cáo cá nhân.");
  if (navError || !nav) throw new Error("Chưa kiểm tra được quyền báo cáo.");
  const allowed = new Set((nav.permissions ?? []).filter((p) => p.allowed).map((p) => p.key));
  if (!allowed.has("overview.view")) throw new Error("Bạn chưa có quyền xem Dashboard.");
  if (peopleError) throw new Error("Chưa đọc được định danh nhân viên.");
  let targets = [uid];
  if (options.manage) {
    const { data: c, error } = options.access ? { data: options.access.context, error: null } : await db.rpc("dashboard_scope_context");
    if (error || !c || c.userId !== uid || !c.canManage) throw new Error("Bạn không có phạm vi quản lý hợp lệ.");
    targets = managedTargets(c);
  }
  const aliases = targets.map((id) => ({ id, names: uniqueActorNames(people ?? [], id) }));
  const names = aliases.flatMap((a) => a.names);
  const actor = (people ?? []).find((p) => p.id === uid);
  const ambiguous = actor?.full_name && !names.includes(actor.full_name) ? 1 : 0;
  const read = (query) => readAllPages((from, to, signal2) => {
    if (from >= 5e3) throw new Error("Nguồn vượt giới hạn đọc của báo cáo cá nhân.");
    return query(from, to, signal2);
  }, 250, 12e3);
  const modules = await Promise.all(sources.map(async (s) => {
    const base = { key: s.key, label: s.label, href: s.href, state: "unavailable", items: [], ambiguous };
    if (!s.perms.some((p) => allowed.has(p))) return base;
    try {
      if (!targets.length) return { ...base, state: "ok" };
      const batches = [];
      for (let i = 0; i < aliases.length; i += 8) batches.push(aliases.slice(i, i + 8));
      const pages = await Promise.all(batches.map((batch) => read((from, to, signal2) => db.from(s.table).select("id,data").eq("is_demo", false).or(batch.map((a) => ownerFilter(s.owners, a.id, a.names)).join(",")).order("id").range(from, to).abortSignal(signal2))));
      const rows = [...new Map(pages.flat().map((r) => [r.id, r])).values()];
      if (rows.length > 5e3) throw new Error("Nguồn vượt giới hạn đọc.");
      const str = (d, keys) => keys.map((k) => d[k]).find((v) => typeof v === "string" && v.length > 0);
      const due = (d) => {
        const status = String(d.status || "");
        if (stateFor(s.key, status) === "done" && s.key !== "social") return str(d, ["deadline"]);
        if (s.key === "web" && status.toLowerCase().includes("outline")) return str(d, ["outlineDeadline", "deadline"]);
        if (s.key === "video" && status.toLowerCase().includes("kịch bản")) return str(d, ["scriptDeadline", "deadline"]);
        return str(d, s.due);
      };
      return { ...base, state: "ok", items: rows.filter((r) => aliases.some((a) => ownItem(r.data, s.owners, a.id, a.names))).map((r) => ({ id: s.key + ":" + r.id, module: s.key, title: String(r.data.title || "Chưa có tên"), status: String(r.data.status || "Chưa có trạng thái"), state: stateFor(s.key, String(r.data.status || "")), due: due(r.data), completed: str(r.data, s.completed), href: s.href + (["design", "web"].includes(s.key) ? "?open=" + encodeURIComponent(r.id) : "") })) };
    } catch {
      return { ...base, state: "error" };
    }
  }));
  const [start, end] = rangeOf(period, vnToday(now));
  const lo = instant(start), hi = Math.min(now.getTime(), instant(end, true));
  const [signal, k3] = options.withoutExtras || options.manage ? [empty("unavailable"), empty("unavailable")] : await Promise.all([
    (async () => {
      if (!["signal.create", "signal.view_all", "signal.manage", "signal.sale", "signal.assign"].some((p) => allowed.has(p))) return empty("unavailable");
      try {
        const rows = await read((from, to, signal2) => db.from("opportunity_signals").select("status,closed_at,next_contact_at,next_contact_on").eq("assigned_to", uid).is("cancelled_at", null).order("id").range(from, to).abortSignal(signal2));
        const open = rows.filter((r) => !["won", "lost"].includes(r.status));
        return { ...empty("ok"), total: open.length + rows.filter((r) => ["won", "lost"].includes(r.status) && instant(r.closed_at ?? void 0) !== null && instant(r.closed_at ?? void 0) >= lo && instant(r.closed_at ?? void 0) <= hi).length, active: open.length, waiting: open.filter((r) => r.status === "waiting").length, done: rows.filter((r) => ["won", "lost"].includes(r.status) && instant(r.closed_at ?? void 0) !== null && instant(r.closed_at ?? void 0) >= lo && instant(r.closed_at ?? void 0) <= hi).length, overdue: open.filter((r) => {
          const due = instant(r.next_contact_at || r.next_contact_on || void 0, true);
          return due !== null && due < now.getTime();
        }).length };
      } catch {
        return empty("error");
      }
    })(),
    (async () => {
      try {
        const { data: settings, error } = await db.rpc("k3_settings_read");
        if (error) return empty("error");
        if (!settings?.enabled || !settings?.can_use) return empty("unavailable");
        const rows = await read((from, to, signal2) => db.from("k3_tasks").select("status").eq("user_id", uid).is("deleted_at", null).gte("work_date", start).lte("work_date", vnToday(now)).order("id").range(from, to).abortSignal(signal2));
        return { ...empty("ok"), total: rows.length, done: rows.filter((r) => r.status === "done").length, active: rows.filter((r) => ["todo", "doing"].includes(r.status)).length };
      } catch {
        return empty("error");
      }
    })()
  ]);
  return summarize(modules, period, now, { signal, k3 });
}
async function dashboardContext(db, uid) {
  const { data, error } = await db.rpc("dashboard_scope_context");
  if (error || !data || data.userId !== uid) throw new Error("Chưa đọc được vị trí và phạm vi Dashboard.");
  return data;
}
async function dashboardData(db, uid, period, mode) {
  const [context, navRead, peopleRead] = await Promise.all([dashboardContext(db, uid), db.rpc("base_permissions_navigation"), db.rpc("get_profiles_directory")]);
  if (mode === "manage" && !managementAllowed(context)) throw new Error("Bạn không có quyền xem phạm vi quản lý.");
  const { data: nav, error: navError } = navRead;
  if (peopleRead.error) throw new Error("Chưa xác định được nhân sự cho Dashboard.");
  if (navError || !nav?.permissions?.some((p) => p.key === "overview.view" && p.allowed)) throw new Error("Bạn chưa có quyền xem Dashboard.");
  const allowed = new Set(nav.permissions.filter((p) => p.allowed).map((p) => p.key));
  const access = { context, nav, people: peopleRead.data ?? [] };
  const now = /* @__PURE__ */ new Date(), [start, end] = rangeOf(period, vnToday(now));
  const lo = instant(start), hi = Math.min(now.getTime(), instant(end, true));
  const [work, signal, k3, business] = await Promise.all([
    mode === "personal" || context.capabilities.work ? buildMyPerformance(db, uid, period, now, { manage: mode === "manage", withoutExtras: true, access }) : Promise.resolve(null),
    (async () => {
      const eligible = mode === "manage" ? context.capabilities.signals : ["signal.create", "signal.sale", "signal.manage", "signal.view_all", "signal.assign"].some((p) => allowed.has(p));
      if (!eligible) return { state: "unavailable" };
      try {
        const rows = await readAllPages((from, to, signal2) => {
          if (from >= 5e3) throw new Error("Phạm vi tín hiệu vượt giới hạn.");
          let q = db.from("opportunity_signals").select("id,status,closed_at,next_contact_at,next_contact_on").is("cancelled_at", null).order("id").range(from, to);
          if (mode === "personal") q = q.eq("assigned_to", uid);
          return q.abortSignal(signal2);
        }, 250, 12e3);
        const unique = [...new Map(rows.map((r) => [r.id, r])).values()];
        const open = unique.filter((r) => !["won", "lost"].includes(r.status));
        const closed = unique.filter((r) => ["won", "lost"].includes(r.status) && instant(r.closed_at ?? void 0) !== null && instant(r.closed_at ?? void 0) >= lo && instant(r.closed_at ?? void 0) <= hi);
        return { state: "ok", active: open.length, won: closed.filter((r) => r.status === "won").length, lost: closed.filter((r) => r.status === "lost").length, overdue: open.filter((r) => {
          const d = instant(r.next_contact_at || r.next_contact_on || void 0, true);
          return d !== null && d < now.getTime();
        }).length, stages: ["waiting", "contacting", "consulting", "quoted", "deposit"].map((status) => ({ status, count: open.filter((r) => r.status === status).length })), hasData: open.length + closed.length > 0 };
      } catch {
        return { state: "error" };
      }
    })(),
    (async () => {
      const { data: settings, error } = await db.rpc("k3_settings_read");
      if (error) return { state: "error" };
      if (!settings?.enabled || !(mode === "manage" ? settings.can_view_scope : settings.can_use)) return { state: "unavailable" };
      const { data, error: readError } = await db.rpc("k3_measured_period_read", { _start: start, _end: vnToday(now), _manage: mode === "manage" });
      if (readError) return { state: "error" };
      const people = data ?? [];
      const withData = people.filter((p) => p.updated || p.closes > 0 || p.kpis.length > 0);
      return { state: "ok", people: withData.length, kpis: withData.reduce((n, p) => n + p.kpis.length, 0), entered: withData.reduce((n, p) => n + p.kpis.filter((k) => k.metric?.actual != null).length, 0), official: withData.reduce((n, p) => n + p.kpis.filter((k) => k.official_metric?.actual != null).length, 0), closes: withData.reduce((n, p) => n + p.closes, 0), hasData: withData.length > 0 };
    })().catch(() => ({ state: "error" })),
    (async () => {
      const eligible = mode === "manage" ? context.capabilities.business : !!context.canUseBusiness;
      if (!eligible) return { state: "unavailable" };
      const today = vnToday(now), year = Number(today.slice(0, 4)), month = Number(today.slice(5, 7));
      const args = { _year: year, _period_kind: "month", _period: month, _mode: "official" };
      if (mode === "personal") args._user_id = uid;
      const { data, error } = await db.rpc("biz_dashboard_data", args);
      if (error) return { state: "error" };
      const metrics = data?.totals ?? [];
      return { state: "ok", year, month, metrics: metrics.map((m) => ({ key: m.metric_key, name: m.definition.name, unit: m.definition.unit, target: m.target, actual: m.actual, percent: m.percent, complete: m.complete })), hasData: metrics.some((m) => m.target !== null || m.actual !== null) };
    })().catch(() => ({ state: "error" }))
  ]);
  const hasWork = !!work && work.summary.active + work.summary.done > 0;
  const complete = (!work || work.complete) && [signal, k3, business].every((s) => s.state !== "error");
  const result = { context, mode, period, start, end, asOf: now.toISOString(), work, signal, k3, business, hasWork, complete };
  return { ...result, key: JSON.stringify({ mode, period, start, end, scope: context.units.map((u) => u.id), people: mode === "manage" ? context.people.map((p) => p.id) : [uid], work: work?.key, signal, k3, business }) };
}
export {
  dashboardContext,
  dashboardData
};
