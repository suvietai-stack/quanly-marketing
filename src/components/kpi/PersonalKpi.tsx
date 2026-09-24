/** KPI V2 — thẻ KPI cá nhân, bảng nhân sự, tiến độ theo Brand/kênh. Chỉ giao diện: dùng lại buildEmployeeReport/buildOverview. */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Target, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { createKpiService, isKpiV2Enabled, type KpiDb } from "@/lib/kpi/service";
import { cloudRepository, hydrateKpi, onCloudSync } from "@/lib/kpi/cloudRepository";
import { buildEmployeeReport, type ItemReport, type WorkRow } from "@/lib/kpi/report";
import { buildOverview, type MetricRow } from "@/lib/kpi/overview";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SourceLink } from "@/components/kpi/ReportV2";
import { cn } from "@/lib/utils";

const svc = createKpiService(cloudRepository);
export const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
const CAT: Record<string, string> = { web: "Content Web", social: "Social", video: "Video", design: "Thiết kế", task: "Task", "?": "KPI" };
const unitWord = (u: string, cat: string) => (u === "point" ? "điểm" : cat === "web" || cat === "social" ? "bài" : cat === "video" ? "video" : cat === "design" ? "order" : "việc");

/** Dữ liệu KPI theo quyền người đăng nhập (RLS: Admin thấy tất cả, nhân viên chỉ thấy của mình). */
export function useKpiView() {
  const me = useAuth((s) => s.users.find((x) => x.id === s.currentUserId));
  const [ready, setReady] = useState<boolean | string>(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isKpiV2Enabled()) return;
    hydrateKpi().then(() => setReady(true)).catch((e) => setReady(String(e?.message ?? e)));
    return onCloudSync(() => setTick((t) => t + 1));
  }, []);
  const isAdmin = !!me && (me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin");
  const db: KpiDb | null = useMemo(() => (ready === true && me ? svc.listForActor({ id: me.id, isAdmin }) : null), [ready, me, isAdmin, tick]);
  return { db, error: typeof ready === "string" ? ready : null, isAdmin, me };
}

export function periodKeysOf(db: KpiDb, userId?: string) {
  return [...new Set(db.periods.filter((p) => !userId || p.userId === userId).map((p) => `${p.periodStart}|${p.periodEnd}`))].sort().reverse();
}
export function currentKey(keys: string[], today = todayVN()) {
  return keys.find((k) => { const [a, b] = k.split("|"); return a <= today && today <= b; }) ?? keys[0] ?? "";
}
export const periodLabel = (k: string) => {
  const [a, b] = k.split("|");
  if (!a) return "—";
  const [y, m, d] = a.split("-");
  const [y2, m2] = b.split("-");
  const last = new Date(Number(y2), Number(m2), 0).getDate();
  if (d === "01" && y === y2 && m === m2 && b.endsWith(String(last))) return `Tháng ${Number(m)}/${y}`;
  return `${a.split("-").reverse().join("/")} → ${b.split("-").reverse().join("/")}`;
};

/** Màu theo nhịp độ so với thời gian đã trôi qua (không chỉ theo tỷ lệ hoàn thành). */
export type Tone = "good" | "warn" | "bad" | "none";
export function paceTone(actual: number | null, target: number, start: string, end: string, today = todayVN()): Tone {
  if (actual === null || target <= 0) return "none";
  if (actual >= target) return "good";
  const s = Date.parse(start), e = Date.parse(end) + 86400000, t = Date.parse(today) + 86400000;
  const elapsed = Math.min(1, Math.max(0, (t - s) / (e - s)));
  if (elapsed >= 1) return "bad";
  const ratio = actual / target / Math.max(elapsed, 0.05);
  if (elapsed < 0.25 || ratio >= 0.9) return "good";
  return ratio >= 0.6 ? "warn" : "bad";
}
const toneBar: Record<Tone, string> = { good: "bg-success", warn: "bg-warning", bad: "bg-destructive", none: "bg-muted-foreground/40" };
const toneText: Record<Tone, string> = { good: "text-success", warn: "text-warning-foreground", bad: "text-destructive", none: "text-muted-foreground" };

export function Bar({ value, tone }: { value: number; tone: Tone }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", toneBar[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function scopeText(it: { brandId: string | null; websiteId: string | null; socialId: string | null }, s: ReturnType<typeof useStore.getState>) {
  if (it.websiteId) return s.websites.find((w) => w.id === it.websiteId)?.name ?? "Website";
  if (it.socialId) return s.socials.find((x) => x.id === it.socialId)?.name ?? "Page";
  if (it.brandId) return s.brands.find((b) => b.id === it.brandId)?.name ?? "Thương hiệu";
  return "Tất cả thương hiệu";
}

/* ---------------- Thẻ KPI cá nhân ---------------- */
export function PersonalKpi({ userId, periodKey, compact }: { userId: string; periodKey?: string; compact?: boolean }) {
  const { db, error } = useKpiView();
  const users = useAuth((s) => s.users);
  const store = useStore();
  const [open, setOpen] = useState<ItemReport | null>(null);
  const [workOpen, setWorkOpen] = useState(false);
  if (!isKpiV2Enabled()) return null;
  if (error) return <p className="text-sm text-destructive">Không tải được KPI: {error}</p>;
  if (!db) return <p className="text-sm text-muted-foreground">Đang tải KPI…</p>;
  const keys = periodKeysOf(db, userId);
  const key = periodKey && keys.includes(periodKey) ? periodKey : currentKey(keys);
  const user = users.find((u) => u.id === userId);
  if (!key || !user) return <EmptyBox text="Chưa có KPI nào được giao trong kỳ này." />;
  const [ps, pe] = key.split("|");
  const today = todayVN();
  const periods = db.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
  const data = { tasks: store.tasks, webContents: store.webContents, socialPosts: store.socialPosts, videos: store.videos, orders: store.orders };
  const r = buildEmployeeReport({ user, allUsers: users, periods, items: db.items, adjustments: db.adjustments, data, filters: {}, today });
  if (!r.items.length) return <EmptyBox text="Chưa có KPI nào được giao trong kỳ này." />;

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
        {r.items.map((it) => {
          const unit = unitWord(it.unit, it.category);
          const pct = it.actual !== null && it.target > 0 ? Math.round((it.actual / it.target) * 100) : null;
          const tone = paceTone(it.actual, it.target, ps, pe, today);
          const left = it.actual !== null ? Math.max(0, it.target - it.actual) : null;
          return (
            <button key={it.item.id} onClick={() => setOpen(it)} className="group rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{CAT[it.category] ?? "KPI"}</div>
                  <div className="truncate text-sm font-medium">{scopeText(it.item as never, store)}</div>
                  <div className="truncate text-xs text-muted-foreground">{it.label}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tabular-nums">{it.actual ?? "—"}</span>
                <span className="text-sm text-muted-foreground">/ {it.target} {unit}</span>
                {pct !== null && <span className={cn("ml-auto text-sm font-semibold", toneText[tone])}>{pct}%</span>}
              </div>
              <div className="mt-2"><Bar value={pct ?? 0} tone={tone} /></div>
              <div className="mt-2 text-xs text-muted-foreground">
                {it.actual === null ? "Chưa đủ dữ liệu để xác minh." : left === 0 ? "Đã đạt chỉ tiêu." : `Còn ${left} ${unit} để hoàn thành chỉ tiêu.`}
                {it.warnings > 0 && it.actual !== null && ` · ${it.warnings} mục chưa xác minh`}
              </div>
            </button>
          );
        })}
      </div>
      {(r.overdue.length > 0 || r.backlog.length > 0) && (
        <button onClick={() => setWorkOpen(true)} className="text-xs text-primary hover:underline">
          Việc chưa hoàn thành: {r.backlog.length} · Quá hạn: {r.overdue.length} →
        </button>
      )}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.label}</SheetTitle>
                <SheetDescription>{scopeText(open.item as never, store)} · {periodLabel(key)} · {open.actual ?? "—"}/{open.target} {unitWord(open.unit, open.category)}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                {open.evidence.length === 0 && <p className="text-sm text-muted-foreground">Chưa có công việc nào được ghi nhận hoàn thành trong kỳ.</p>}
                {open.evidence.map((e) => (
                  <div key={`${e.sourceType}${e.sourceId}`} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
                    <SourceLink t={e.sourceType} id={e.sourceId} websiteId={e.websiteId} socialId={e.socialId}>{e.title}</SourceLink>
                    <span className="shrink-0 text-xs text-muted-foreground">{e.creditedAt?.split("-").reverse().join("/")}</span>
                  </div>
                ))}
                {open.warnings > 0 && <p className="pt-2 text-xs text-muted-foreground">{open.warnings} công việc thiếu lịch sử nộp/duyệt nên chưa được tính.</p>}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <WorkSheet open={workOpen} onOpenChange={setWorkOpen} title={`Việc chưa hoàn thành — ${user.fullName || user.username}`} rows={[...r.overdue, ...r.backlog.filter((b) => !b.overdue), ...r.waitingReview]} />
    </div>
  );
}

export function WorkSheet({ open, onOpenChange, title, rows }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; rows: WorkRow[] }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader><SheetTitle>{title}</SheetTitle><SheetDescription>{rows.length} công việc</SheetDescription></SheetHeader>
        <div className="mt-4 space-y-1">
          {rows.map((w) => (
            <div key={`${w.sourceType}${w.sourceId}`} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
              <SourceLink t={w.sourceType} id={w.sourceId} websiteId={w.websiteId} socialId={w.socialId}>{w.title}</SourceLink>
              <span className={cn("shrink-0 text-xs", w.overdue ? "text-destructive" : "text-muted-foreground")}>{w.overdue ? "Quá hạn" : w.status}</span>
            </div>
          ))}
          {!rows.length && <p className="text-sm text-muted-foreground">Không có công việc.</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EmptyBox({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{text}</div>;
}

/* ---------------- Chế độ NHÂN SỰ ---------------- */
export function StaffTable() {
  const { db, error } = useKpiView();
  const users = useAuth((s) => s.users);
  const store = useStore();
  const [pk, setPk] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  if (!isKpiV2Enabled()) return null;
  if (error) return <p className="text-sm text-destructive">Không tải được KPI: {error}</p>;
  if (!db) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  const keys = periodKeysOf(db);
  const key = pk || currentKey(keys);
  if (!key) return <EmptyBox text="Chưa có KPI nào được giao." />;
  const [ps, pe] = key.split("|");
  const today = todayVN();
  const periods = db.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
  const data = { tasks: store.tasks, webContents: store.webContents, socialPosts: store.socialPosts, videos: store.videos, orders: store.orders };
  const rows = users.filter((u) => periods.some((p) => p.userId === u.id)).map((u) => ({ u, r: buildEmployeeReport({ user: u, allUsers: users, periods, items: db.items, adjustments: db.adjustments, data, filters: {}, today }) }));
  const selUser = users.find((u) => u.id === sel);

  return (
    <div className="space-y-3">
      <PeriodSelect keys={keys} value={key} onChange={setPk} />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2.5 font-medium">Nhân sự</th><th className="font-medium">KPI được giao</th><th className="font-medium">Tiến độ</th><th className="font-medium">Quá hạn</th><th /></tr>
          </thead>
          <tbody>
            {rows.map(({ u, r }) => {
              const own = r.items.filter((i) => !i.contributionOnly);
              return (
                <tr key={u.id} onClick={() => setSel(u.id)} className="cursor-pointer border-t border-border hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{u.fullName || u.username}</td>
                  <td>{own.length} chỉ tiêu</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {own.slice(0, 3).map((i) => {
                        const tone = paceTone(i.actual, i.target, ps, pe, today);
                        return <span key={i.item.id} className={cn("rounded-md bg-muted px-2 py-0.5 text-xs", toneText[tone])} title={i.label}>{CAT[i.category]}: {i.actual ?? "—"}/{i.target}</span>;
                      })}
                      {own.length > 3 && <span className="text-xs text-muted-foreground">+{own.length - 3}</span>}
                    </div>
                  </td>
                  <td className={r.overdue.length ? "font-medium text-destructive" : "text-muted-foreground"}>{r.overdue.length}</td>
                  <td className="pr-3 text-right text-xs text-primary">Chi tiết →</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Kỳ này chưa có nhân sự được giao KPI.</td></tr>}
          </tbody>
        </table>
      </div>
      <Sheet open={!!sel} onOpenChange={(v) => !v && setSel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader><SheetTitle>{selUser?.fullName || selUser?.username}</SheetTitle><SheetDescription>{periodLabel(key)} · Tổng quan cá nhân</SheetDescription></SheetHeader>
          <div className="mt-4">{sel && <PersonalKpi userId={sel} periodKey={key} compact />}</div>
          {sel && <Link to="/reports-v2" search={{ from: ps, to: pe, userId: sel }} className="mt-4 inline-block text-xs text-primary hover:underline">Xem báo cáo đầy đủ →</Link>}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function PeriodSelect({ keys, value, onChange }: { keys: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {keys.map((k) => <option key={k} value={k}>{periodLabel(k)}</option>)}
    </select>
  );
}

/* ---------------- Tiến độ theo Brand / kênh + chỉ tiêu nguy cơ chậm ---------------- */
export function useChannelProgress(key: string, brandId: string) {
  const { db } = useKpiView();
  const users = useAuth((s) => s.users);
  const store = useStore();
  return useMemo(() => {
    if (!db || !key) return null;
    const [ps, pe] = key.split("|");
    const today = todayVN();
    const periods = db.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
    const pIds = new Set(periods.map((p) => p.id));
    const scopes = new Map<string, { brandId: string | null; websiteId: string | null; socialId: string | null }>();
    for (const it of db.items) if (pIds.has(it.kpiPeriodId) && (!brandId || it.brandId === brandId)) scopes.set(`${it.brandId}|${it.websiteId}|${it.socialId}`, { brandId: it.brandId ?? null, websiteId: it.websiteId ?? null, socialId: it.socialId ?? null });
    const data = { tasks: store.tasks, webContents: store.webContents, socialPosts: store.socialPosts, videos: store.videos, orders: store.orders };
    const rows = [...scopes.values()].flatMap((sc) => {
      const ov = buildOverview({ users, goals: [], periods, items: db.items, adjustments: db.adjustments, data, today,
        filters: { brandId: sc.brandId ?? undefined, websiteId: sc.websiteId ?? undefined, socialId: sc.socialId ?? undefined } });
      return ov.metrics.filter((m) => m.target > 0).map((m) => ({ sc, m, tone: m.status === "ok" ? paceTone(m.actual, m.target, ps, pe, today) : ("none" as Tone) }));
    });
    return { rows, ps, pe };
  }, [db, key, brandId, users, store]);
}

export function ChannelProgress({ periodKey, brandId }: { periodKey: string; brandId: string }) {
  const store = useStore();
  const res = useChannelProgress(periodKey, brandId);
  const [sel, setSel] = useState<{ title: string; m: MetricRow } | null>(null);
  if (!res) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  if (!res.rows.length) return <EmptyBox text="Chưa có chỉ tiêu nào trong kỳ này." />;
  const groups = new Map<string, typeof res.rows>();
  for (const r of res.rows) { const k = r.sc.brandId ?? ""; groups.set(k, [...(groups.get(k) ?? []), r]); }
  const cname = (w: string | null, s: string | null) => (w ? store.websites.find((x) => x.id === w)?.name ?? "Website" : s ? store.socials.find((x) => x.id === s)?.name ?? "Page" : "Toàn thương hiệu");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[...groups.entries()].map(([bid, rows]) => (
        <div key={bid} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide">{bid ? store.brands.find((b) => b.id === bid)?.name ?? "Thương hiệu" : "Toàn bộ"}</div>
          <div className="space-y-3">
            {rows.map(({ sc, m, tone }) => {
              const title = `${cname(sc.websiteId, sc.socialId)} — ${m.label}`;
              return (
                <button key={`${sc.websiteId}|${sc.socialId}|${m.metricKey}`} onClick={() => setSel({ title, m })} className="block w-full rounded-lg p-2 text-left hover:bg-muted/50">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate"><span className="font-medium">{cname(sc.websiteId, sc.socialId)}</span> <span className="text-muted-foreground">· {m.label}</span></span>
                    <span className="shrink-0 tabular-nums">{m.actual} / {m.target} {m.status === "ok" ? <b className={toneText[tone]}>{m.pct}%</b> : <span className="text-xs text-muted-foreground">{m.status === "reconciling" ? "Đang đối soát" : "Chưa đủ dữ liệu"}</span>}</span>
                  </div>
                  <div className="mt-1.5"><Bar value={m.target ? (m.actual / m.target) * 100 : 0} tone={tone} /></div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Sheet open={!!sel} onOpenChange={(v) => !v && setSel(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {sel && (
            <>
              <SheetHeader><SheetTitle>{sel.title}</SheetTitle><SheetDescription>{sel.m.actual}/{sel.m.target} · {periodLabel(`${res.ps}|${res.pe}`)}</SheetDescription></SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground"><Users className="h-3.5 w-3.5" />Nhân sự tham gia</div>
                  {sel.m.contributions.map((c) => (
                    <div key={c.itemId} className="flex justify-between border-b border-border py-1.5 text-sm">
                      <Link to="/reports-v2" search={{ from: res.ps, to: res.pe, userId: c.userId }} className="text-primary hover:underline">{c.userName}</Link>
                      <span className="tabular-nums">{c.actual ?? "Chưa đủ dữ liệu"} / {c.contributionOnly ? "—" : c.target}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground"><Target className="h-3.5 w-3.5" />Kết quả thực tế</div>
                  {sel.m.evidence.map((e) => (
                    <div key={`${e.sourceType}${e.sourceId}`} className="flex justify-between gap-3 border-b border-border py-1.5 text-sm">
                      <SourceLink t={e.sourceType} id={e.sourceId} websiteId={e.websiteId} socialId={e.socialId}>{e.title}</SourceLink>
                      <span className="shrink-0 text-xs text-muted-foreground">{e.creditedAt?.split("-").reverse().join("/")}</span>
                    </div>
                  ))}
                  {!sel.m.evidence.length && <p className="text-sm text-muted-foreground">Chưa có kết quả.</p>}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
