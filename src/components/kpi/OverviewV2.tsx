/** KPI V2 — Tổng quan theo Brand / Asset (ẩn, flag OFF, chỉ đọc). */
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { createKpiService } from "@/lib/kpi/service";
import { cloudRepository } from "@/lib/kpi/cloudRepository";
import { buildOverview, type MetricRow, type V2Search } from "@/lib/kpi/overview";
import type { EvidenceRow, WorkRow } from "@/lib/kpi/report";
import { SourceLink } from "./ReportV2";

const svc = createKpiService(cloudRepository);
const inp = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const chip = "cursor-pointer underline-offset-2 hover:underline";
const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

type Drill = { title: string; rows: (EvidenceRow | WorkRow)[] } | { title: string; metric: MetricRow };

export function OverviewV2({ actor, search = {} }: { actor: { id: string; isAdmin: boolean }; search?: V2Search }) {
  const users = useAuth((s) => s.users);
  const store = useStore();
  const db = useMemo(() => svc.listForActor(actor), [actor]); // non-admin: chỉ KPI của chính mình
  const periodKeys = [...new Set(db.periods.map((p) => `${p.periodStart}|${p.periodEnd}`))].sort().reverse();
  const sk = search.from && search.to ? `${search.from}|${search.to}` : "";
  const [pk, setPk] = useState(periodKeys.includes(sk) ? sk : periodKeys[0] ?? "");
  const [brandId, setBrandId] = useState(search.brandId ?? "");
  const [channel, setChannel] = useState(search.websiteId ? `w:${search.websiteId}` : search.socialId ? `s:${search.socialId}` : "");
  const [metric, setMetric] = useState(search.metric ?? "");
  const [group, setGroup] = useState(search.group ?? "");
  const userCtx = actor.isAdmin ? search.userId : undefined;
  const [drill, setDrill] = useState<Drill | null>(null);

  const [ps, pe] = pk.split("|");
  const periods = db.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
  const websiteId = channel.startsWith("w:") ? channel.slice(2) : undefined;
  const socialId = channel.startsWith("s:") ? channel.slice(2) : undefined;
  const ov = buildOverview({
    users, goals: db.goals.filter((g) => g.periodStart <= pe && g.periodEnd >= ps), periods, items: db.items, adjustments: db.adjustments,
    data: { tasks: store.tasks, webContents: store.webContents, socialPosts: store.socialPosts, videos: store.videos, orders: store.orders },
    filters: { brandId: brandId || undefined, websiteId, socialId, metricKey: metric || undefined, userId: userCtx, group: group || undefined }, today: todayVN(),
  });
  const bname = (id: string | null) => store.brands.find((b) => b.id === id)?.name ?? "—";
  const aname = (w: string | null, s: string | null) => (w ? `Web: ${store.websites.find((x) => x.id === w)?.name ?? w}` : s ? `Page: ${store.socials.find((x) => x.id === s)?.name ?? s}` : "—");
  const repSearch = (userId?: string, metricKey?: string, asset?: { websiteId: string | null; socialId: string | null; brandId: string | null }) =>
    ({ from: ps, to: pe, brandId: (asset?.brandId ?? brandId) || undefined, websiteId: asset ? asset.websiteId ?? undefined : websiteId, socialId: asset ? asset.socialId ?? undefined : socialId, metric: metricKey, userId, group: group || undefined });

  if (!periodKeys.length) return <p className="text-sm text-muted-foreground">Chưa có kỳ KPI nào.</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <select className={inp} value={pk} onChange={(e) => setPk(e.target.value)}>{periodKeys.map((k) => <option key={k} value={k}>{k.replace("|", " → ")}</option>)}</select>
        <select className={inp} value={brandId} onChange={(e) => { setBrandId(e.target.value); setChannel(""); }}><option value="">Tất cả thương hiệu</option>{store.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select className={inp} value={channel} disabled={!brandId} onChange={(e) => setChannel(e.target.value)}>
          <option value="">Website/Page</option>
          {store.websites.filter((w) => w.brandId === brandId).map((w) => <option key={w.id} value={`w:${w.id}`}>Web: {w.name}</option>)}
          {store.socials.filter((s) => s.brandId === brandId).map((s) => <option key={s.id} value={`s:${s.id}`}>Page: {s.name}</option>)}
        </select>
        <select className={inp} value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">Tất cả nhóm chỉ số</option>
          <option value="web">Website</option><option value="social">Social</option><option value="video">Video</option><option value="design">Thiết kế</option><option value="task">Công việc</option>
        </select>
        {metric && <button className={`${inp} text-xs`} onClick={() => setMetric("")}>Chỉ tiêu: {metric} ✕</button>}
        {userCtx && <span className="self-center text-xs text-muted-foreground">Ngữ cảnh nhân sự: {users.find((u) => u.id === userCtx)?.fullName ?? userCtx}</span>}
        <Link to="/reports-v2" search={repSearch(userCtx, metric || undefined)} className="self-center text-xs text-primary hover:underline">→ Báo cáo nhân sự V2 (giữ bộ lọc)</Link>
      </div>
      {!actor.isAdmin && <p className="text-xs text-muted-foreground">Bạn chỉ thấy phần KPI được giao cho chính mình.</p>}

      <section>
        <h2 className="mb-2 text-sm font-semibold">Tiến độ theo chỉ tiêu</h2>
        <p className="mb-2 text-xs text-muted-foreground">Tổng thực hiện / tổng mục tiêu của các nhân sự cùng chỉ tiêu (không lấy trung bình %). Các chỉ tiêu khác đơn vị không cộng chung.</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="px-3 py-2">Chỉ tiêu</th><th>Thực hiện / Mục tiêu</th><th>%</th><th>Sản phẩm duy nhất</th><th>Nhân sự</th><th>Chưa phân bổ</th></tr></thead>
            <tbody>{ov.metrics.map((m) => (
              <tr key={m.metricKey} className="border-t border-border">
                <td className="px-3 py-2"><span className={chip} onClick={() => setDrill({ title: m.label, metric: m })}>{m.label}</span> <span className="text-xs text-muted-foreground">({m.unit})</span></td>
                <td>{m.target > 0 ? <>{m.actual}{m.status !== "ok" ? " (đã xác minh, một phần)" : ""} / {m.target}</> : <span title="KPI toàn cục chưa phân bổ cho phạm vi đang lọc">{m.contributionActual} / N/A (đóng góp)</span>}
                  {m.unverifiedAssignments > 0 && <span className="ml-1 text-xs text-muted-foreground">· {m.unverifiedAssignments} phần chưa đủ dữ liệu</span>}
                  {m.target > 0 && m.contributionItems > 0 && <span className="ml-1 text-xs text-muted-foreground">· +{m.contributionActual} đóng góp từ KPI toàn cục</span>}</td>
                <td>{m.status === "reconciling" ? <span title={`${m.overlapItems} KPI phạm vi hẹp nằm trong KPI rộng hơn của cùng người — coi là breakdown, không cộng lại`}>Đang đối soát</span>
                  : m.status === "insufficient" ? "Chưa đủ dữ liệu" : m.pct === null ? "N/A" : `${m.pct}%`}</td>
                <td><span className={chip} onClick={() => setDrill({ title: `Sản phẩm — ${m.label}`, rows: m.evidence })}>{m.uniqueAssets}</span></td>
                <td className="text-xs">{m.contributions.map((c) => (
                  <Link key={c.itemId} to="/reports-v2" search={repSearch(c.userId, m.metricKey)} className="mr-2 text-primary hover:underline">{c.userName} {c.actual ?? "N/A"}/{c.contributionOnly ? "N/A" : c.target}</Link>
                ))}</td>
                <td className="text-xs">{m.unallocatedTarget > 0 ? `${m.unallocatedTarget} chưa phân bổ xuống Web/Page` : "—"}</td>
              </tr>
            ))}{!ov.metrics.length && <tr><td colSpan={6} className="px-3 py-3 text-muted-foreground">Không có chỉ tiêu trong phạm vi lọc.</td></tr>}</tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {([["Tồn việc", ov.backlog], ["Quá hạn", ov.overdue], ["Chờ người duyệt", ov.waitingReview]] as const).map(([t, rows]) => (
          <button key={t} className="rounded-lg border border-border p-3 text-left hover:bg-muted" onClick={() => setDrill({ title: t, rows: [...rows] })}>
            <div className="text-xs text-muted-foreground">{t}</div><div className="text-2xl font-semibold">{rows.length}</div>
          </button>
        ))}
      </section>

      {(ov.videoTouched > 0 || ov.videoDelivered > 0) && (
        <section className="rounded-lg border border-border p-3 text-sm">
          <b className="text-sm">Video (chẩn đoán công đoạn)</b>
          <p className="mt-1 text-xs text-muted-foreground">Video bàn giao: <b>{ov.videoDelivered}</b> · Video có người tham gia ở ít nhất một công đoạn: <b>{ov.videoTouched}</b>. Nhiều công đoạn trên cùng một video KHÔNG cộng thành nhiều sản phẩm bàn giao.</p>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold">Mục tiêu</h2>
        <ul className="space-y-2 text-sm">{ov.goals.map((g) => (
          <li key={g.goal.id} className="rounded-lg border border-border p-3">
            <div className="flex justify-between"><b>{g.goal.title}</b><span className="text-xs text-muted-foreground">{bname(g.goal.brandId)} · {g.people} nhân sự · {g.achieved === null ? "N/A" : g.achieved ? "Đạt" : "Chưa đạt"}</span></div>
            <div className="mt-1 text-xs">{g.metrics.length ? g.metrics.map((m) => <span key={m.metricKey} className="mr-3">{m.label}: {m.actual}/{m.target} {m.unit}{m.unverified ? " (thiếu dữ liệu)" : ""}</span>) : <span className="text-muted-foreground">Chưa phân bổ KPI</span>}</div>
          </li>
        ))}{!ov.goals.length && <li className="text-muted-foreground">Không có mục tiêu trong kỳ.</li>}</ul>
      </section>

      {ov.unmet.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Chưa đạt / chưa phân bổ</h2>
          <ul className="text-sm">{ov.unmet.map((m) => <li key={m.metricKey}>{m.label}: thiếu {Math.max(0, m.target - m.actual)} {m.unit}{m.unallocatedTarget ? ` · ${m.unallocatedTarget} chưa phân bổ` : ""}</li>)}</ul>
        </section>
      )}

      {drill && (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between"><h3 className="font-medium">{drill.title}</h3><button className="text-xs text-muted-foreground" onClick={() => setDrill(null)}>Đóng</button></div>
          {"metric" in drill ? (
            <ul className="space-y-1 text-sm">
              {drill.metric.assets.map((a) => <li key={a.key}>{bname(a.brandId)} · {aname(a.websiteId, a.socialId)}: <span className={chip} onClick={() => setDrill({ title: aname(a.websiteId, a.socialId), rows: a.evidence })}><b>{a.actual}</b></span> / {a.target ?? "Chưa phân bổ"}{" "}
                <Link to="/reports-v2" search={repSearch(userCtx, drill.metric.metricKey, a)} className="text-xs text-primary hover:underline">→ Báo cáo V2</Link></li>)}
              {drill.metric.contributionItems > 0 && <li className="text-muted-foreground">Đóng góp từ KPI toàn cục (không có mục tiêu riêng ở phạm vi này): {drill.metric.contributionActual}</li>}
              {drill.metric.unallocatedTarget > 0 && <li className="text-muted-foreground">Chưa phân bổ xuống Web/Page: {drill.metric.unallocatedTarget}</li>}
              {!drill.metric.assets.length && <li className="text-muted-foreground">Chưa có dữ liệu theo kênh.</li>}
            </ul>
          ) : (
            <table className="w-full text-sm"><tbody>{drill.rows.map((e) => (
              <tr key={`${e.sourceType}${e.sourceId}`} className="border-t border-border">
                <td className="py-1"><SourceLink t={e.sourceType} id={e.sourceId} websiteId={e.websiteId} socialId={e.socialId}>{e.title}</SourceLink></td>
                <td className="text-xs text-muted-foreground">{bname(e.brandId)}</td>
                <td className="text-xs">{"creditedAt" in e ? `nộp ${e.creditedAt}` : e.status}</td>
                <td className="text-xs">hạn {e.deadline ? e.deadline.slice(0, 10) : "N/A"}</td>
              </tr>
            ))}{!drill.rows.length && <tr><td className="text-muted-foreground">Không có mục nào.</td></tr>}</tbody></table>
          )}
        </div>
      )}
    </div>
  );
}
