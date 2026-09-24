/** KPI V2 — UI ẩn (feature flag OFF mặc định, không có trong menu). Dữ liệu MOCK, không ghi production. */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { KPI_METRIC_LIST, getKpiMetric } from "@/lib/kpi/metrics";
import { createKpiService, isKpiV2Enabled, KpiError, ROLE_KPI_TEMPLATES, scopeOf, type KpiDb, type NewItem } from "@/lib/kpi/service";
import { cloudRepository, hydrateKpi, onCloudSync } from "@/lib/kpi/cloudRepository";
import { calculateKpiItem } from "@/lib/kpi/calculateKpi";
import { calculateVideoDesignItem } from "@/lib/kpi/calculateVideoDesign";
import type { EmployeeKpiItem, GoalStatus, KpiPeriodType } from "@/lib/kpi/types";

const svc = createKpiService(cloudRepository);
const inp = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const btn = "h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50";
const btn2 = "h-8 rounded-md border border-input px-2 text-xs";

export function useKpiDb() {
  const [db, setDb] = useState<KpiDb | null>(null);
  const refresh = () => setDb(svc.list());
  useEffect(() => { refresh(); return onCloudSync((err) => { if (err) toast.error(err); refresh(); }); }, []);
  return { db, refresh };
}

function run(fn: () => void, ok: string, after: () => void) {
  try { fn(); toast.success(ok); after(); } catch (e) { toast.error(e instanceof KpiError ? e.message : String(e)); }
}

export function KpiV2Gate({ title, children }: { title: string; children: (actor: { id: string; isAdmin: boolean }) => ReactNode }) {
  const me = useAuth((s) => s.users.find((x) => x.id === s.currentUserId));
  const [state, setState] = useState<{ on: boolean; ready: boolean; error?: string } | null>(null);
  useEffect(() => {
    const on = isKpiV2Enabled();
    if (!on) { setState({ on, ready: false }); return; }
    (async () => {
      try {
        await hydrateKpi();
        setState({ on, ready: true });
      } catch (e) { setState({ on, ready: false, error: String((e as Error).message ?? e) }); }
    })();
  }, []);
  // Quyền hiển thị lấy từ role đã tải trong useAuth (role-super-admin / role-admin / tài khoản hệ thống).
  // Quyền GHI dữ liệu vẫn do RLS phía database kiểm soát — giao diện chỉ quyết định hiện/ẩn biểu mẫu.
  const isAdmin = !!me && (me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin");
  if (!state) return <div className="p-8 text-sm text-muted-foreground">Đang tải…</div>;
  if (!state.on || !me) return <div className="p-8 text-sm text-muted-foreground">Trang không khả dụng.</div>;
  if (state.error) return <div className="p-8 text-sm text-destructive">Không tải được KPI: {state.error}</div>;
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      {children({ id: me.id, isAdmin })}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
function monthRange(d = new Date()) {
  const s = new Date(d.getFullYear(), d.getMonth(), 1), e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const f = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return [f(s), f(e)] as const;
}
function quarterRange(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3);
  const s = new Date(d.getFullYear(), q * 3, 1), e = new Date(d.getFullYear(), q * 3 + 3, 0);
  const f = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return [f(s), f(e)] as const;
}

/* ---------------- Goals ---------------- */
export function GoalsV2({ actor }: { actor: { id: string; isAdmin: boolean } }) {
  const { db, refresh } = useKpiDb();
  const brands = useStore((s) => s.brands);
  const websites = useStore((s) => s.websites);
  const socials = useStore((s) => s.socials);
  const users = useAuth((s) => s.users);
  const [m0, m1] = monthRange();
  const [f, setF] = useState({ title: "", description: "", periodStart: m0, periodEnd: m1, brandId: "", websiteId: "", socialId: "", ownerId: "", status: "draft" as GoalStatus });
  if (!db) return null;
  return (
    <div className="space-y-6">
      {actor.isAdmin && (
        <div className="grid gap-2 rounded-lg border border-border p-4 md:grid-cols-4">
          <input className={`${inp} md:col-span-2`} placeholder="Tiêu đề mục tiêu" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <input className={`${inp} md:col-span-2`} placeholder="Mô tả ngắn" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <input type="date" className={inp} value={f.periodStart} onChange={(e) => setF({ ...f, periodStart: e.target.value })} />
          <input type="date" className={inp} value={f.periodEnd} onChange={(e) => setF({ ...f, periodEnd: e.target.value })} />
          <select className={inp} value={f.brandId} onChange={(e) => setF({ ...f, brandId: e.target.value, websiteId: "", socialId: "" })}>
            <option value="">— Thương hiệu —</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className={inp} value={f.websiteId || f.socialId ? (f.websiteId ? `w:${f.websiteId}` : `s:${f.socialId}`) : ""}
            onChange={(e) => { const [t, id] = e.target.value.split(":"); setF({ ...f, websiteId: t === "w" ? id : "", socialId: t === "s" ? id : "" }); }} disabled={!f.brandId}>
            <option value="">— Website/Page (tùy chọn) —</option>
            {websites.filter((w) => w.brandId === f.brandId).map((w) => <option key={w.id} value={`w:${w.id}`}>Web: {w.name}</option>)}
            {socials.filter((s) => s.brandId === f.brandId).map((s) => <option key={s.id} value={`s:${s.id}`}>Page: {s.name}</option>)}
          </select>
          <select className={inp} value={f.ownerId} onChange={(e) => setF({ ...f, ownerId: e.target.value })}>
            <option value="">— Người phụ trách —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
          </select>
          <select className={inp} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as GoalStatus })}>
            {["draft", "active", "closed", "cancelled"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className={btn} onClick={() => run(() => svc.saveGoal(actor, {
            title: f.title, description: f.description || null, periodStart: f.periodStart, periodEnd: f.periodEnd, status: f.status,
            brandId: f.brandId || null, websiteId: f.websiteId || null, socialId: f.socialId || null, metadata: { ownerId: f.ownerId || null },
          }), "Đã lưu mục tiêu", () => { refresh(); setF({ ...f, title: "", description: "" }); })}>Tạo mục tiêu</button>
        </div>
      )}
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Mục tiêu</th><th>Kỳ</th><th>Thương hiệu</th><th>Phụ trách</th><th>Trạng thái</th><th>Nhân sự có KPI</th></tr></thead>
        <tbody>
          {db.goals.map((g) => {
            const people = new Set(db.periods.filter((p) => p.goalId === g.id).map((p) => p.userId));
            const owner = users.find((u) => u.id === (g.metadata as { ownerId?: string }).ownerId);
            return (
              <tr key={g.id} className="border-t border-border">
                <td className="py-2"><div className="font-medium">{g.title}</div><div className="text-xs text-muted-foreground">{g.description}</div></td>
                <td>{g.periodStart} → {g.periodEnd}</td>
                <td>{brands.find((b) => b.id === g.brandId)?.name ?? "—"}</td>
                <td>{owner?.fullName ?? "—"}</td><td>{g.status}</td><td>{people.size}</td>
              </tr>
            );
          })}
          {!db.goals.length && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Chưa có mục tiêu.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Assign KPI ---------------- */
function useActual() {
  const s = useStore();
  const users = useAuth((x) => x.users);
  return (userId: string, it: EmployeeKpiItem, periodStart: string, periodEnd: string): { value: number | null; warnings: number } => {
    const u = users.find((x) => x.id === userId);
    const emp = { id: userId, fullName: u?.fullName, username: u?.username };
    const period = { periodStart, periodEnd };
    const item = { metricKey: it.metricKey, targetValue: it.targetValue, brandId: it.brandId, websiteId: it.websiteId, socialId: it.socialId };
    if (["web_content_completed", "social_post_completed", "task_completed"].includes(it.metricKey)) {
      const r = calculateKpiItem(emp, item, period, { webContents: s.webContents, socialPosts: s.socialPosts, tasks: s.tasks });
      return { value: r.evidence.length === 0 && r.warnings.length ? null : r.actualValue, warnings: r.warnings.length };
    }
    const r = calculateVideoDesignItem(emp, item, period, { videos: s.videos, designOrders: s.orders, socialPosts: s.socialPosts });
    return { value: r.actualValue, warnings: r.warnings.length };
  };
}

export function AssignKpiV2({ actor }: { actor: { id: string; isAdmin: boolean } }) {
  const { db, refresh } = useKpiDb();
  const users = useAuth((s) => s.users);
  const roles = useAuth((s) => s.roles);
  const brands = useStore((s) => s.brands);
  const websites = useStore((s) => s.websites);
  const socials = useStore((s) => s.socials);
  const actual = useActual();
  const [userId, setUserId] = useState("");
  const [ptype, setPtype] = useState<KpiPeriodType>("month");
  const [range, setRange] = useState<readonly [string, string]>(monthRange());
  const [goalId, setGoalId] = useState("");
  const [rows, setRows] = useState<NewItem[]>([]);
  const selUser = users.find((u) => u.id === userId);
  const roleName = roles.find((r) => r.id === selUser?.roleId)?.name ?? "";
  const template = ROLE_KPI_TEMPLATES[roleName];

  const view = useMemo(() => (db ? svc.listForActor(actor) : null), [db, actor]);
  if (!db || !view) return null;
  const setRow = (i: number, p: Partial<NewItem>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));

  return (
    <div className="space-y-6">
      {actor.isAdmin && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="grid gap-2 md:grid-cols-5">
            <select className={inp} value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">— Nhân sự —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
            </select>
            <select className={inp} value={ptype} onChange={(e) => { const t = e.target.value as KpiPeriodType; setPtype(t); if (t === "month") setRange(monthRange()); if (t === "quarter") setRange(quarterRange()); }}>
              <option value="month">Tháng</option><option value="quarter">Quý</option><option value="custom">Tùy chỉnh</option>
            </select>
            <input type="date" className={inp} value={range[0]} disabled={ptype !== "custom"} onChange={(e) => setRange([e.target.value, range[1]])} />
            <input type="date" className={inp} value={range[1]} disabled={ptype !== "custom"} onChange={(e) => setRange([range[0], e.target.value])} />
            <select className={inp} value={goalId} onChange={(e) => setGoalId(e.target.value)}>
              <option value="">— Mục tiêu (tùy chọn) —</option>{db.goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          {template && <button className={btn2} onClick={() => setRows([...rows, ...template])}>Gợi ý theo role “{roleName}” (chỉ gợi ý)</button>}
          {rows.map((r, i) => {
            const m = getKpiMetric(r.metricKey);
            return (
              <div key={i} className="grid gap-2 md:grid-cols-6">
                <select className={`${inp} md:col-span-2`} value={r.metricKey} onChange={(e) => setRow(i, { metricKey: e.target.value })}>
                  {KPI_METRIC_LIST.map((x) => <option key={x.key} value={x.key} disabled={!!x.notReady} title={x.notReady}>{x.label}{x.notReady ? " (chưa sẵn sàng)" : ""}</option>)}
                </select>
                <input type="number" min={1} className={inp} value={r.targetValue} onChange={(e) => setRow(i, { targetValue: Number(e.target.value) })} />
                <select className={inp} value={r.brandId ?? ""} onChange={(e) => setRow(i, { brandId: e.target.value || null, websiteId: null, socialId: null })}>
                  <option value="">Toàn bộ</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <select className={inp} disabled={!r.brandId} value={r.websiteId ? `w:${r.websiteId}` : r.socialId ? `s:${r.socialId}` : ""}
                  onChange={(e) => { const [t, id] = e.target.value.split(":"); setRow(i, { websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null }); }}>
                  <option value="">— Kênh —</option>
                  {m?.scopes.includes("website") && websites.filter((w) => w.brandId === r.brandId).map((w) => <option key={w.id} value={`w:${w.id}`}>Web: {w.name}</option>)}
                  {m?.scopes.includes("social") && socials.filter((s) => s.brandId === r.brandId).map((s) => <option key={s.id} value={`s:${s.id}`}>Page: {s.name}</option>)}
                </select>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">{m?.unit}
                  <button className={btn2} onClick={() => setRows(rows.filter((_, j) => j !== i))}>Xóa</button></div>
              </div>
            );
          })}
          <div className="flex gap-2">
            <button className={btn2} onClick={() => setRows([...rows, { metricKey: KPI_METRIC_LIST[0].key, targetValue: 10 }])}>+ Thêm chỉ tiêu</button>
            <button className={btn} disabled={!userId || !rows.length} onClick={() => run(() => svc.assign(actor, {
              userId, periodType: ptype, periodStart: range[0], periodEnd: range[1], goalId: goalId || null, items: rows,
            }), "Đã giao KPI", () => { refresh(); setRows([]); })}>Giao KPI</button>
          </div>
        </div>
      )}

      {view.periods.map((p) => {
        const u = users.find((x) => x.id === p.userId);
        const items = view.items.filter((i) => i.kpiPeriodId === p.id);
        const locked = p.status === "locked" || p.status === "closed";
        const next = ({ draft: "active", active: "locked", locked: "closed" } as const)[p.status as "draft"];
        return (
          <div key={p.id} className="rounded-lg border border-border">
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2 text-sm">
              <span className="font-medium">{u?.fullName ?? p.userId}</span>
              <span className="text-muted-foreground">{p.periodStart} → {p.periodEnd}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs">{p.status}</span>
              {p.goalId && <span className="text-xs text-muted-foreground">Mục tiêu: {db.goals.find((g) => g.id === p.goalId)?.title}</span>}
              {actor.isAdmin && next && <button className={`${btn2} ml-auto`} onClick={() => run(() => svc.setStatus(actor, p.id, next), `Chuyển ${next}`, refresh)}>→ {next}</button>}
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2">Chỉ tiêu</th><th>Phạm vi</th><th>Target</th><th>Thực tế</th><th>Cần kiểm tra</th><th /></tr></thead>
              <tbody>
                {items.map((it) => {
                  const a = actual(p.userId, it, p.periodStart, p.periodEnd);
                  return (
                    <tr key={it.id} className="border-t border-border">
                      <td className="px-4 py-2">{getKpiMetric(it.metricKey)?.label ?? it.metricKey}</td>
                      <td>{scopeOf(it)}</td>
                      <td>{actor.isAdmin && !locked
                        ? <input type="number" className={`${inp} w-20`} defaultValue={it.targetValue}
                            onBlur={(e) => { const v = Number(e.target.value); if (v !== it.targetValue) run(() => svc.updateTarget(actor, it.id, v), "Đã đổi target", refresh); }} />
                        : it.targetValue}</td>
                      <td>{a.value === null ? <span className="text-muted-foreground">Chưa đủ dữ liệu</span> : a.value}</td>
                      <td className="text-xs text-muted-foreground">{a.warnings || "—"}</td>
                      <td>{actor.isAdmin && !locked && <button className={btn2} onClick={() => run(() => svc.removeItem(actor, it.id), "Đã xóa", refresh)}>Xóa</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
      {!view.periods.length && <p className="text-sm text-muted-foreground">Chưa có KPI nào{actor.isAdmin ? "" : " được giao cho bạn"}. Hôm nay: {today()}</p>}
    </div>
  );
}
