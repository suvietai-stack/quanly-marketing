/** KPI V2 — UI ẩn (feature flag OFF mặc định, không có trong menu). Dữ liệu MOCK, không ghi production. */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { KPI_METRIC_LIST, KR_GROUPS, AVAILABILITY_LABEL, DIRECTION_LABEL, getKpiMetric, isAssignable } from "@/lib/kpi/metrics";
import { calculateKrItem, KR_ENGINE_KEYS } from "@/lib/kpi/calculateKr";
import { createKpiService, isKpiV2Enabled, KpiError, ROLE_KPI_TEMPLATES, scopeOf, type KpiDb, type NewItem } from "@/lib/kpi/service";
import { cloudRepository, hydrateKpi, onCloudSync, flushKpi } from "@/lib/kpi/cloudRepository";
import { calculateKpiItem } from "@/lib/kpi/calculateKpi";
import { calculateVideoDesignItem } from "@/lib/kpi/calculateVideoDesign";
import { findNestedItems } from "@/lib/kpi/overview";
import { GoalsBoard, useKrActual } from "./GoalsOkr";
import { isAchieved, directionOf } from "@/lib/kpi/evaluate";
import type { EmployeeKpiItem, GoalStatus, KpiPeriodType } from "@/lib/kpi/types";

const svc = createKpiService(cloudRepository);
const inp = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const btn = "h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50";
const btn2 = "h-8 rounded-md border border-input px-2 text-xs";

export function useKpiDb() {
  const [db, setDb] = useState<KpiDb | null>(null);
  const refresh = () => setDb(svc.list());
  useEffect(() => { refresh(); return onCloudSync(() => refresh()); }, []);
  return { db, refresh };
}

/** Chỉ báo "thành công" sau khi cơ sở dữ liệu xác nhận; lỗi hiển thị rõ ràng. */
async function run(fn: () => void, ok: string, after: () => void): Promise<boolean> {
  try { fn(); await flushKpi(); toast.success(ok); after(); return true; }
  catch (e) { toast.error(e instanceof KpiError ? e.message : `Không lưu được: ${(e as Error).message ?? e}`); after(); return false; }
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

/* ---------------- Tiện ích kỳ ---------------- */
function monthOptions() {
  const out: { key: string; label: string }[] = [];
  const d = new Date();
  for (let k = -3; k <= 3; k++) {
    const x = new Date(d.getFullYear(), d.getMonth() + k, 1);
    const [a, b] = monthRange(x);
    out.push({ key: `${a}|${b}`, label: `Tháng ${x.getMonth() + 1}/${x.getFullYear()}` });
  }
  return out.reverse();
}
const GOAL_STATUS: Record<string, string> = { draft: "Nháp", active: "Đang thực hiện", closed: "Đã đóng", cancelled: "Đã hủy" };
const PERIOD_STATUS: Record<string, string> = { draft: "Nháp", active: "Đang áp dụng", locked: "Đã khóa", closed: "Đã đóng" };
const NEXT_LABEL: Record<string, string> = { active: "Áp dụng", locked: "Khóa kỳ", closed: "Đóng kỳ" };

/* ---------------- Mục tiêu ---------------- */
export function GoalsV2({ actor, periodKey, brandFilter }: { actor: { id: string; isAdmin: boolean }; periodKey?: string; brandFilter?: string }) {
  const { db, refresh } = useKpiDb();
  if (!db) return null;
  return <GoalsBoard actor={actor} db={db} refresh={refresh} periodKey={periodKey} brandFilter={brandFilter} />;
}

/* ---------------- Giao KPI ---------------- */
function useActual() {
  const f = useKrActual();
  return (userId: string, it: EmployeeKpiItem, ps: string, pe: string, locked = false) => f(userId, it, ps, pe, locked);
}

export function AssignKpiV2({ actor }: { actor: { id: string; isAdmin: boolean } }) {
  const [tab, setTab] = useState<"kpi" | "goals" | "library">("goals");
  const months = useMemo(monthOptions, []);
  const [m0, m1] = monthRange();
  const [pk, setPk] = useState(`${m0}|${m1}`);
  const [brandF, setBrandF] = useState("");
  const brands = useStore((s) => s.brands);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {actor.isAdmin && (
          <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
            {(["goals", "kpi", "library"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 ${tab === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}>{t === "kpi" ? "KR đã giao" : t === "goals" ? "Mục tiêu" : "Thư viện KR"}</button>
            ))}
          </div>
        )}
        <select className={inp} value={pk} onChange={(e) => setPk(e.target.value)}>{months.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}</select>
        <select className={inp} value={brandF} onChange={(e) => setBrandF(e.target.value)}>
          <option value="">Tất cả thương hiệu</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      {tab === "library" ? <KrLibrary /> : tab === "kpi" ? <KpiList actor={actor} periodKey={pk} brandFilter={brandF} /> : <GoalsV2 actor={actor} periodKey={pk} brandFilter={brandF} />}
    </div>
  );
}

function KpiList({ actor, periodKey, brandFilter }: { actor: { id: string; isAdmin: boolean }; periodKey: string; brandFilter: string }) {
  const { db, refresh } = useKpiDb();
  const users = useAuth((s) => s.users);
  const roles = useAuth((s) => s.roles);
  const brands = useStore((s) => s.brands);
  const websites = useStore((s) => s.websites);
  const socials = useStore((s) => s.socials);
  const actual = useActual();
  const [formOpen, setFormOpen] = useState(false);
  const empty = { userId: "", brandId: "", channel: "", metricKey: KPI_METRIC_LIST[0].key as string, target: 10, goalId: "", label: "", keywordIds: [] as string[], threshold: 3, taskIds: [] as string[] };
  const keywords = useStore((s) => s.keywords);
  const tasks = useStore((s) => s.tasks);
  const [f, setF] = useState(empty);
  const [saving, setSaving] = useState(false);
  const view = useMemo(() => (db ? svc.listForActor(actor) : null), [db, actor]);
  if (!db || !view) return null;
  const [ps, pe] = periodKey.split("|");
  const periods = view.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
  const pmap = new Map(periods.map((p) => [p.id, p]));
  const rows = view.items.filter((i) => pmap.has(i.kpiPeriodId) && (!brandFilter || i.brandId === brandFilter))
    .map((it) => ({ it, p: pmap.get(it.kpiPeriodId)! }))
    .sort((a, b) => (users.find((u) => u.id === a.p.userId)?.fullName ?? "").localeCompare(users.find((u) => u.id === b.p.userId)?.fullName ?? ""));
  const nested = new Set<string>();
  for (const p of periods) for (const id of findNestedItems(view.items.filter((i) => i.kpiPeriodId === p.id), pmap)) nested.add(id);
  const m = getKpiMetric(f.metricKey);
  const chOpts = [
    ...(m?.scopes.includes("website") ? websites.filter((w) => w.brandId === f.brandId).map((w) => ({ v: `w:${w.id}`, l: `Web: ${w.name}` })) : []),
    ...(m?.scopes.includes("social") ? socials.filter((s) => s.brandId === f.brandId).map((s) => ({ v: `s:${s.id}`, l: `Page: ${s.name}` })) : []),
  ];
  const chName = (it: EmployeeKpiItem) => it.websiteId ? websites.find((w) => w.id === it.websiteId)?.name ?? "Website" : it.socialId ? socials.find((s) => s.id === it.socialId)?.name ?? "Page" : it.brandId ? `${brands.find((b) => b.id === it.brandId)?.name ?? "?"} (toàn thương hiệu)` : "Tất cả thương hiệu";
  const selUser = users.find((u) => u.id === f.userId);
  const template = ROLE_KPI_TEMPLATES[roles.find((r) => r.id === selUser?.roleId)?.name ?? ""];
  const goals = db.goals.filter((g) => g.periodStart <= pe && g.periodEnd >= ps);

  const submit = async () => {
    const [t, id] = f.channel.split(":");
    setSaving(true);
    const ok = await run(() => svc.assign(actor, { userId: f.userId, periodType: "month", periodStart: ps, periodEnd: pe, goalId: f.goalId || null,
      items: [{ metricKey: f.metricKey, targetValue: f.target, brandId: f.brandId || null, websiteId: t === "w" ? id : null, socialId: t === "s" ? id : null,
        label: f.label.trim() || null,
        metadata: m?.needs === "keyword" ? { keywordIds: f.keywordIds, threshold: f.threshold } : m?.needs === "tasks" ? { taskIds: f.taskIds } : {} }] }), "Đã giao KPI", refresh);
    setSaving(false);
    if (ok) setF({ ...empty, userId: f.userId, brandId: f.brandId });
  };

  return (
    <div className="space-y-4">
      {actor.isAdmin && (
        <div className="rounded-xl border border-border bg-card">
          <button onClick={() => setFormOpen(!formOpen)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
            <span className="text-primary">+ Giao KPI</span><span className="text-xs text-muted-foreground">{formOpen ? "Thu gọn" : "Mở biểu mẫu"}</span>
          </button>
          {formOpen && (
            <div className="space-y-3 border-t border-border p-4">
              <div className="grid gap-2 md:grid-cols-5">
                <label className="space-y-1 text-xs text-muted-foreground">1. Nhân sự
                  <select className={`${inp} w-full`} value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })}>
                    <option value="">— Chọn —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
                  </select></label>
                <label className="space-y-1 text-xs text-muted-foreground">2. Thương hiệu
                  <select className={`${inp} w-full`} value={f.brandId} onChange={(e) => setF({ ...f, brandId: e.target.value, channel: "" })}>
                    <option value="">Tất cả</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select></label>
                <label className="space-y-1 text-xs text-muted-foreground">4. Loại công việc
                  <select className={`${inp} w-full`} value={f.metricKey} onChange={(e) => setF({ ...f, metricKey: e.target.value, channel: "" })}>
                    {KR_GROUPS.map((g) => <optgroup key={g} label={g}>{KPI_METRIC_LIST.filter((x) => x.group === g).map((x) => <option key={x.key} value={x.key} disabled={!isAssignable(x)} title={x.notReady ?? x.rule}>{x.label}{isAssignable(x) ? "" : ` (${AVAILABILITY_LABEL[x.availability!]})`}</option>)}</optgroup>)}
                  </select></label>
                {f.brandId && chOpts.length > 0 ? (
                  <label className="space-y-1 text-xs text-muted-foreground">3. Website / Page
                    <select className={`${inp} w-full`} value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}>
                      <option value="">Toàn thương hiệu</option>{chOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select></label>
                ) : <div className="hidden md:block" />}
                <label className="space-y-1 text-xs text-muted-foreground">5. Số lượng ({m?.unit === "point" ? "điểm" : "sản phẩm"})
                  <input type="number" min={1} className={`${inp} w-full`} value={f.target} onChange={(e) => setF({ ...f, target: Number(e.target.value) })} /></label>
              </div>
              {m?.rule && <p className="text-xs text-muted-foreground">Quy tắc: {m.rule} · Nguồn: {m.source} · {DIRECTION_LABEL[m.direction ?? "at_least"]}</p>}
              {m?.needs === "keyword" && (() => {
                const kws = keywords.filter((k) => (!f.channel.startsWith("w:") || k.websiteId === f.channel.slice(2)) && (!f.brandId || websites.find((w) => w.id === k.websiteId)?.brandId === f.brandId));
                return (
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                    <label className="space-y-1 text-xs text-muted-foreground">Từ khóa (giữ Ctrl để chọn nhiều) — {kws.length} từ khóa
                      <select multiple className={`${inp} h-28 w-full`} value={f.keywordIds} onChange={(e) => setF({ ...f, keywordIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
                        {kws.map((k) => <option key={k.id} value={k.id}>{k.keyword}{k.currentTop ? ` — hiện Top ${k.currentTop}` : " — chưa kiểm tra"}</option>)}
                      </select></label>
                    <label className="space-y-1 text-xs text-muted-foreground">Ngưỡng Top
                      <select className={`${inp} w-full`} value={f.threshold} onChange={(e) => setF({ ...f, threshold: Number(e.target.value) })}>
                        {[1, 3, 5, 10, 20].map((n) => <option key={n} value={n}>Top {n}</option>)}
                      </select></label>
                  </div>
                );
              })()}
              {m?.needs === "tasks" && (() => {
                const ts = tasks.filter((t) => t.status !== "Đã hủy" && (!f.brandId || t.brandId === f.brandId) && (!selUser || !t.assignee || t.assignee === selUser.fullName || t.assignee === selUser.username));
                return (
                  <div className="grid gap-2 md:grid-cols-2">
                    <label className="space-y-1 text-xs text-muted-foreground">Tên kết quả cần đạt
                      <input className={`${inp} w-full`} placeholder="VD: Nghiên cứu 3 bộ từ khóa" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></label>
                    <label className="space-y-1 text-xs text-muted-foreground">Liên kết Task có sẵn (giữ Ctrl để chọn nhiều) — tạo Task mới ở trang Task
                      <select multiple className={`${inp} h-28 w-full`} value={f.taskIds} onChange={(e) => setF({ ...f, taskIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
                        {ts.map((t) => <option key={t.id} value={t.id}>{t.title} · {t.status}</option>)}
                      </select></label>
                  </div>
                );
              })()}
              <div className="flex flex-wrap items-center gap-2">
                <select className={inp} value={f.goalId} onChange={(e) => setF({ ...f, goalId: e.target.value })}>
                  <option value="">Mục tiêu: không gắn (tùy chọn)</option>{goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
                {template && <button className={btn2} disabled={saving} onClick={async () => {
                  setSaving(true);
                  await run(() => svc.assign(actor, { userId: f.userId, periodType: "month", periodStart: ps, periodEnd: pe, goalId: f.goalId || null, items: template }), `Đã giao ${template.length} KPI gợi ý`, refresh);
                  setSaving(false);
                }}>Giao nhanh theo vai trò</button>}
                <button className={`${btn} ml-auto`} disabled={saving || !f.userId || !(f.target > 0)} onClick={submit}>{saving ? "Đang lưu…" : "Giao KPI"}</button>
              </div>
              <p className="text-xs text-muted-foreground">Kỳ KPI lấy theo bộ lọc tháng phía trên. Một người có thể nhận nhiều KPI; hệ thống chặn KPI trùng cùng loại và cùng phạm vi.</p>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2.5 font-medium">Nhân sự</th><th className="font-medium">Kênh</th><th className="font-medium">KPI</th><th className="font-medium">Chỉ tiêu</th><th className="font-medium">Kết quả</th><th className="font-medium">Kỳ</th><th /></tr>
          </thead>
          <tbody>
            {rows.map(({ it, p }) => {
              const u = users.find((x) => x.id === p.userId);
              const locked = p.status === "locked" || p.status === "closed";
              const a = actual(p.userId, it, p.periodStart, p.periodEnd, locked);
              const next = ({ draft: "active", active: "locked", locked: "closed" } as Record<string, "active" | "locked" | "closed">)[p.status];
              const first = rows.find((r) => r.p.id === p.id)?.it.id === it.id;
              return (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium">{u?.fullName || u?.username || "—"}</td>
                  <td>{chName(it)}</td>
                  <td>{it.label || getKpiMetric(it.metricKey)?.label || it.metricKey}{a.status && <div className="text-[11px] text-muted-foreground">{a.status}</div>}{nested.has(it.id) && <div className="text-[11px] text-warning-foreground">Nằm trong KPI rộng hơn — không cộng trùng</div>}</td>
                  <td>{actor.isAdmin && !locked
                    ? <input type="number" min={1} className={`${inp} h-8 w-20`} defaultValue={it.targetValue} key={`${it.id}${it.targetValue}`}
                        onBlur={(e) => { const v = Number(e.target.value); if (v !== it.targetValue) run(() => svc.updateTarget(actor, it.id, v), "Đã cập nhật chỉ tiêu", refresh); }} />
                    : it.targetValue}</td>
                  <td className="tabular-nums">{a.value === null ? <span className="text-muted-foreground">Chưa đủ dữ liệu</span> : <b>{a.value}{it.unit === "percent" ? "%" : ""} / {getKpiMetric(it.metricKey)?.direction === "at_most" ? "≤ " : ""}{it.targetValue}{it.unit === "percent" ? "%" : ""}</b>}</td>
                  <td className="text-xs">
                    <span className={`rounded px-1.5 py-0.5 ${locked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{PERIOD_STATUS[p.status] ?? p.status}</span>
                    {actor.isAdmin && first && next && <button className="ml-2 text-primary hover:underline" onClick={() => {
                      if (next === "locked" && !confirm(`Khóa kỳ KPI của ${u?.fullName}? Sau khi khóa không thể sửa chỉ tiêu.`)) return;
                      // Khóa kỳ: chốt kết quả thực tế của từng KR vào snapshot để báo cáo lịch sử không đổi theo dữ liệu nguồn sau này.
                      const results = next === "locked" ? Object.fromEntries(db.items.filter((x) => x.kpiPeriodId === p.id).map((x) => {
                        const r = actual(p.userId, x, p.periodStart, p.periodEnd);
                        return [x.id, { actual: r.value, achieved: isAchieved(r.value, x.targetValue, directionOf(x.metricKey)), evidence: r.evidence.map((e) => ({ type: e.type, id: e.id, at: e.at })) }];
                      })) : undefined;
                      run(() => svc.setStatus(actor, p.id, next, results), `Đã chuyển: ${PERIOD_STATUS[next]}`, refresh);
                    }}>{NEXT_LABEL[next]}</button>}
                  </td>
                  <td className="pr-3 text-right">{actor.isAdmin && !locked && <button className={btn2} onClick={() => confirm("Xóa KPI này?") && run(() => svc.removeItem(actor, it.id), "Đã xóa KPI", refresh)}>Xóa</button>}</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">{actor.isAdmin ? "Chưa có KPI trong kỳ này. Nhấn “+ Giao KPI” để bắt đầu." : "Bạn chưa được giao KPI trong kỳ này."}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Hôm nay: {today().split("-").reverse().join("/")} · Kết quả tự động cập nhật khi công việc được duyệt trong các module.</p>
    </div>
  );
}

/* ---------------- KR dưới mỗi Mục tiêu ---------------- */
function GoalKrs({ items, db }: { items: EmployeeKpiItem[]; db: KpiDb }) {
  const users = useAuth((s) => s.users);
  const actual = useActual();
  if (!items.length) return <span className="text-xs text-muted-foreground">Chưa có KR</span>;
  return (
    <ul className="space-y-1 py-2 text-xs">
      {items.map((it) => {
        const p = db.periods.find((x) => x.id === it.kpiPeriodId);
        if (!p) return null;
        const u = users.find((x) => x.id === p.userId);
        const a = actual(p.userId, it, p.periodStart, p.periodEnd, p.status === "locked" || p.status === "closed");
        return (
          <li key={it.id} className="flex flex-wrap gap-x-2">
            <span className="font-medium">{it.label || getKpiMetric(it.metricKey)?.label}</span>
            <span className="text-muted-foreground">· {u?.fullName || u?.username || "—"} · đến {p.periodEnd.split("-").reverse().join("/")}</span>
            <span className="tabular-nums">{a.value === null ? "Chưa đủ dữ liệu" : `${a.value}/${it.targetValue}`}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Thư viện KR ---------------- */
export function KrLibrary() {
  const [q, setQ] = useState("");
  const [g, setG] = useState("");
  const list = KPI_METRIC_LIST.filter((m) => (!g || m.group === g) && (!q || m.label.toLowerCase().includes(q.toLowerCase())));
  const tone: Record<string, string> = { linked: "bg-primary/10 text-primary", periodic: "bg-accent text-accent-foreground", manual: "bg-warning/15 text-warning-foreground", pending: "bg-muted text-muted-foreground", configure: "bg-muted text-muted-foreground", none: "bg-muted text-muted-foreground" };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input className={inp} placeholder="Tìm chỉ số…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inp} value={g} onChange={(e) => setG(e.target.value)}><option value="">Tất cả nhóm</option>{KR_GROUPS.map((x) => <option key={x}>{x}</option>)}</select>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {list.map((m) => (
          <div key={m.key} className="rounded-lg border border-border bg-card p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium">{m.label}</div>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] ${tone[m.availability!]}`}>{AVAILABILITY_LABEL[m.availability!]}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{m.group} · {DIRECTION_LABEL[m.direction ?? "at_least"]} · Nguồn: {m.source ?? "—"}</div>
            {(m.rule || m.notReady) && <div className="mt-1 text-xs text-muted-foreground">{m.notReady ?? m.rule}</div>}
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">{m.key}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
