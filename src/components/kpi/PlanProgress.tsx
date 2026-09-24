/** Dashboard — Tiến độ kế hoạch theo Brand/Website/Page. Tái sử dụng buildOverview (không viết lại công thức). */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { createKpiService, isKpiV2Enabled } from "@/lib/kpi/service";
import { cloudRepository, hydrateKpi, onCloudSync } from "@/lib/kpi/cloudRepository";
import { buildOverview } from "@/lib/kpi/overview";

const svc = createKpiService(cloudRepository);
const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

export function PlanProgress() {
  const me = useAuth((s) => s.users.find((x) => x.id === s.currentUserId));
  const users = useAuth((s) => s.users);
  const store = useStore();
  const [ready, setReady] = useState<boolean | string>(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isKpiV2Enabled()) return;
    hydrateKpi().then(() => setReady(true)).catch((e) => setReady(String(e?.message ?? e)));
    return onCloudSync(() => setTick((t) => t + 1));
  }, []);
  const isAdmin = !!me && (me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin");
  const db = useMemo(() => (ready === true && me ? svc.listForActor({ id: me.id, isAdmin }) : null), [ready, me, isAdmin, tick]);
  const today = todayVN();
  const periodKeys = db ? [...new Set(db.periods.map((p) => `${p.periodStart}|${p.periodEnd}`))].sort().reverse() : [];
  const current = periodKeys.find((k) => { const [a, b] = k.split("|"); return a <= today && today <= b; }) ?? periodKeys[0] ?? "";
  const [pk, setPk] = useState("");
  const key = pk || current;

  if (!isKpiV2Enabled()) return null;
  if (typeof ready === "string") return <p className="text-sm text-destructive">Không tải được kế hoạch: {ready}</p>;
  if (!db) return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  if (!periodKeys.length) return <p className="text-sm text-muted-foreground">Chưa có chỉ tiêu nào được giao. {isAdmin && <Link to="/settings/kpi-v2" className="text-primary hover:underline">Giao chỉ tiêu →</Link>}</p>;

  const [ps, pe] = key.split("|");
  const periods = db.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
  const pIds = new Set(periods.map((p) => p.id));
  const scopes = new Map<string, { brandId: string | null; websiteId: string | null; socialId: string | null }>();
  for (const it of db.items) if (pIds.has(it.kpiPeriodId)) scopes.set(`${it.brandId}|${it.websiteId}|${it.socialId}`, { brandId: it.brandId ?? null, websiteId: it.websiteId ?? null, socialId: it.socialId ?? null });
  const data = { tasks: store.tasks, webContents: store.webContents, socialPosts: store.socialPosts, videos: store.videos, orders: store.orders, keywords: store.keywords, mapPosts: store.mapPosts, websites: store.websites };
  const sorted = [...scopes.values()].sort((a, b) => `${a.brandId ?? ""}${a.websiteId ?? ""}${a.socialId ?? ""}`.localeCompare(`${b.brandId ?? ""}${b.websiteId ?? ""}${b.socialId ?? ""}`));
  const rows = sorted.flatMap((sc) => {
    const ov = buildOverview({ users, goals: [], periods, items: db.items, adjustments: db.adjustments, data, today,
      filters: { brandId: sc.brandId ?? undefined, websiteId: sc.websiteId ?? undefined, socialId: sc.socialId ?? undefined } });
    return ov.metrics.filter((m) => m.target > 0).map((m) => ({ sc, m }));
  });
  const bname = (id: string | null) => (id ? store.brands.find((b) => b.id === id)?.name ?? "?" : "Toàn bộ");
  const cname = (w: string | null, s: string | null) => (w ? `Web: ${store.websites.find((x) => x.id === w)?.name ?? "?"}` : s ? `Page: ${store.socials.find((x) => x.id === s)?.name ?? "?"}` : "—");

  return (
    <div className="space-y-3">
      <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={key} onChange={(e) => setPk(e.target.value)}>
        {periodKeys.map((k) => <option key={k} value={k}>Kỳ {k.replace("|", " → ")}</option>)}
      </select>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="px-3 py-2">Thương hiệu</th><th>Website/Page</th><th>Loại công việc</th><th>Đã làm / Kế hoạch</th><th>Tiến độ</th><th>Nhân sự</th><th /></tr></thead>
          <tbody>
            {rows.map(({ sc, m }) => (
              <tr key={`${sc.brandId}|${sc.websiteId}|${sc.socialId}|${m.key}`} className="border-t border-border">
                <td className="px-3 py-2">{bname(sc.brandId)}</td><td>{cname(sc.websiteId, sc.socialId)}</td><td>{m.label}</td>
                <td className="font-medium">{m.actual} / {m.target}</td>
                <td>{m.status === "ok" ? (m.pct === null ? (m.achieved ? "Đạt" : "Không đạt") : `${m.pct}%`) : m.status === "reconciling" ? <span className="text-muted-foreground">Đang đối soát (chồng phạm vi)</span> : <span className="text-muted-foreground">Chưa đủ dữ liệu</span>}</td>
                <td>{new Set(m.contributions.map((c) => c.userId)).size}</td>
                <td className="text-xs">
                  <Link to="/overview-v2" search={{ from: ps, to: pe, brandId: sc.brandId ?? undefined, websiteId: sc.websiteId ?? undefined, socialId: sc.socialId ?? undefined, metric: m.metricKey }} className="text-primary hover:underline">Công việc</Link>
                  {" · "}
                  <Link to="/reports-v2" search={{ from: ps, to: pe, brandId: sc.brandId ?? undefined, websiteId: sc.websiteId ?? undefined, socialId: sc.socialId ?? undefined, metric: m.metricKey }} className="text-primary hover:underline">Nhân sự</Link>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">Kỳ này chưa có chỉ tiêu.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
