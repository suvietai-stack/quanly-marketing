import { ReportDiagnosis } from "./ReportDiagnosis";
/** KPI V2 — Báo cáo hiệu suất theo nhân sự (ẩn, flag OFF, chỉ đọc). */
import { getKpiMetric } from "@/lib/kpi/metrics";
import { Fragment, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { createKpiService } from "@/lib/kpi/service";
import { cloudRepository } from "@/lib/kpi/cloudRepository";
import type { V2Search } from "@/lib/kpi/overview";
import { buildEmployeeReport, type EvidenceRow, type WorkRow, type ItemReport, type Ratio } from "@/lib/kpi/report";

const svc = createKpiService(cloudRepository);
const inp = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const chip = "cursor-pointer underline-offset-2 hover:underline";
const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
const pctText = (r: Ratio) => (r.pct === null ? "N/A" : `${r.pct}%`);

type Drill = { title: string; kind: "evidence"; rows: EvidenceRow[] } | { title: string; kind: "work"; rows: WorkRow[] } | { title: string; kind: "breakdown"; item: ItemReport; period: { periodStart: string; periodEnd: string } } | { title: string; kind: "ratio"; r: Ratio; rows: EvidenceRow[]; field: "onTime" | "firstPass" };

export function SourceLink({ t, id, websiteId, socialId, children }: { t: string; id: string; websiteId: string | null; socialId: string | null; children: React.ReactNode }) {
  void id;
  if (t === "web_content" && websiteId) return <Link to="/websites/$id" params={{ id: websiteId }} className="text-primary hover:underline">{children}</Link>;
  if (t === "social_post" && socialId) return <Link to="/social/$id" params={{ id: socialId }} className="text-primary hover:underline">{children}</Link>;
  if (t === "keyword" && websiteId) return <Link to="/websites/$id" params={{ id: websiteId }} className="text-primary hover:underline">{children}</Link>;
  if (t === "map_post") return <Link to="/local" className="text-primary hover:underline">{children}</Link>;
  if (t === "task") return <Link to="/tasks" className="text-primary hover:underline">{children}</Link>;
  if (t === "video") return <Link to="/videos" className="text-primary hover:underline">{children}</Link>;
  if (t === "design_order") return <Link to="/orders" className="text-primary hover:underline">{children}</Link>;
  return <Link to="/web-contents" className="text-primary hover:underline">{children}</Link>;
}

export function ReportV2({ actor, search = {} }: { actor: { id: string; isAdmin: boolean }; search?: V2Search }) {
  const users = useAuth((s) => s.users);
  const store = useStore();
  const dbAll = useMemo(() => svc.listForActor(actor), [actor]); // quyền: Admin tất cả, còn lại chỉ bản thân
  const [history, setHistory] = useState(false);
  // Mặc định ẩn mục tiêu đã hủy/lưu trữ (và kỳ gắn với chúng); bật "lịch sử" để xem lại — không xóa dữ liệu đã chốt.
  const db = useMemo(() => {
    if (history) return dbAll;
    const inactive = new Set(dbAll.goals.filter((g) => g.status === "cancelled" || (g.metadata as { archived?: boolean })?.archived).map((g) => g.id));
    if (!inactive.size) return dbAll;
    return { ...dbAll, goals: dbAll.goals.filter((g) => !inactive.has(g.id)), periods: dbAll.periods.filter((p) => !(p.goalId && inactive.has(p.goalId))) };
  }, [dbAll, history]);
  const periodKeys = [...new Set(db.periods.map((p) => `${p.periodStart}|${p.periodEnd}`))].sort().reverse();
  const sk = search.from && search.to ? `${search.from}|${search.to}` : "";
  const [pk, setPk] = useState(periodKeys.includes(sk) ? sk : periodKeys[0] ?? "");
  const [metric, setMetric] = useState(search.metric ?? "");
  const [userId, setUserId] = useState(actor.isAdmin ? search.userId ?? "" : "");
  const [brandId, setBrandId] = useState(search.brandId ?? "");
  const [channel, setChannel] = useState(search.websiteId ? `w:${search.websiteId}` : search.socialId ? `s:${search.socialId}` : "");
  const [group, setGroup] = useState(search.group ?? "");
  const [open, setOpen] = useState<string | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const today = todayVN();

  const pkEff = periodKeys.includes(pk) ? pk : periodKeys[0] ?? "";
  const [ps, pe] = pkEff.split("|");
...
  const histToggle = <label className="flex items-center gap-1 self-center text-xs text-muted-foreground"><input type="checkbox" checked={history} onChange={(e) => setHistory(e.target.checked)} /> Xem lịch sử (mục tiêu đã hủy/lưu trữ)</label>;
  if (!periodKeys.length) return <div className="space-y-2"><p className="text-sm text-muted-foreground">Chưa có kỳ KPI nào đang hiệu lực {actor.isAdmin ? "(giao KPI tại /settings/kpi-v2)" : "được giao cho bạn"}.</p>{histToggle}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select className={inp} value={pkEff} onChange={(e) => setPk(e.target.value)}>{periodKeys.map((k) => <option key={k} value={k}>{k.replace("|", " → ")}</option>)}</select>
        {histToggle}
        {actor.isAdmin && <select className={inp} value={userId} onChange={(e) => setUserId(e.target.value)}><option value="">Tất cả nhân sự</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}</select>}
        <select className={inp} value={brandId} onChange={(e) => { setBrandId(e.target.value); setChannel(""); }}><option value="">Tất cả thương hiệu</option>{store.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select className={inp} value={channel} disabled={!brandId} onChange={(e) => setChannel(e.target.value)}>
          <option value="">Website/Page</option>
          {store.websites.filter((w) => w.brandId === brandId).map((w) => <option key={w.id} value={`w:${w.id}`}>Web: {w.name}</option>)}
          {store.socials.filter((s) => s.brandId === brandId).map((s) => <option key={s.id} value={`s:${s.id}`}>Page: {s.name}</option>)}
        </select>
        <select className={inp} value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">Mọi nhóm</option><option value="web">Web</option><option value="social">Social</option><option value="video">Video</option><option value="design">Thiết kế</option><option value="task">Task</option>
        </select>
        <Link to="/overview-v2" search={{ from: ps, to: pe, brandId: brandId || undefined, websiteId: channel.startsWith("w:") ? channel.slice(2) : undefined, socialId: channel.startsWith("s:") ? channel.slice(2) : undefined, metric: metric || undefined, userId: userId || undefined, group: group || undefined }} className="self-center text-xs text-primary hover:underline">→ Xem Tổng quan (giữ bộ lọc)</Link>
      </div>
      {metric && <p className="text-xs">Đang lọc chỉ tiêu: <b>{metric}</b> <button className="text-primary underline" onClick={() => setMetric("")}>bỏ lọc</button></p>}
      <ReportDiagnosis ps={ps} pe={pe} periods={periods} items={db.items} goals={db.goals} isAdmin={actor.isAdmin}
        shown={reports.reduce((n, x) => n + x.r.items.length, 0)} hasFilter={!!(brandId || channel || group || metric || userId)} />
      <p className="text-xs text-muted-foreground">Ngày tính theo giờ Việt Nam. Việc được credit theo ngày <b>nộp bản được duyệt</b> — bài nộp cuối kỳ nhưng duyệt sang kỳ sau vẫn thuộc kỳ nộp; bài đang chờ duyệt chưa tính vào hoàn thành và nằm ở cột “Chờ duyệt”.</p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr><th className="px-3 py-2">Nhân sự</th><th>Sản lượng / Chỉ tiêu</th><th>Đúng hạn</th><th>Duyệt lần đầu</th><th>Quá hạn</th></tr>
          </thead>
          <tbody>
            {reports.map(({ u, r }) => {
              const allEv = r.items.flatMap((i) => i.evidence);
              return (
                <Fragment key={u.id}>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2">
                      <button className="font-medium hover:underline" onClick={() => setOpen(open === u.id ? null : u.id)}>{open === u.id ? "▾" : "▸"} {u.fullName || u.username}</button>
                      {r.ambiguousName && <div className="text-xs text-muted-foreground">Trùng tên — chỉ khớp theo tài khoản</div>}
                    </td>
                    <td>
                      {r.items.filter((i) => !i.contributionOnly).map((i) => (
                        <div key={i.item.id} className="text-xs"><span className="text-muted-foreground">{i.label}:</span> <span className={chip} onClick={() => setDrill({ kind: "evidence", title: i.label, rows: i.evidence })}>{i.actual === null ? "Chưa đủ dữ liệu" : i.actual}</span> / {i.target}</div>
                      ))}
                      {!r.items.some((i) => !i.contributionOnly) && <span className={chip} onClick={() => setDrill({ kind: "evidence", title: `Sản lượng — ${u.fullName}`, rows: allEv })}>{r.output} <span className="text-xs text-muted-foreground">(không có chỉ tiêu trong phạm vi lọc)</span></span>}
                    </td>
                    <td><span className={chip} onClick={() => setDrill({ kind: "ratio", title: "Đúng hạn", r: r.onTime, rows: allEv, field: "onTime" })}>{pctText(r.onTime)}</span></td>
                    <td><span className={chip} onClick={() => setDrill({ kind: "ratio", title: "Duyệt lần đầu", r: r.quality, rows: allEv, field: "firstPass" })}>{pctText(r.quality)}</span></td>
                    <td><span className={chip} onClick={() => setDrill({ kind: "work", title: "Quá hạn", rows: r.overdue })}>{r.overdue.length}</span></td>
                  </tr>
                  {open === u.id && r.items.map((it) => {
                    const p = r.periods.find((x) => x.id === it.item.kpiPeriodId)!;
                    return (
                      <tr key={it.item.id} className="border-t border-border bg-muted/40 text-xs">
                        <td className="px-6 py-1.5"><span className={chip} onClick={() => setDrill({ kind: "breakdown", title: `Phân bổ — ${it.label}`, item: it, period: p })}>{it.label}</span> <span className="text-muted-foreground">({it.unit})</span></td>
                        <td>
                          <span className={chip} onClick={() => setDrill({ kind: "evidence", title: it.label, rows: it.evidence })}>{it.actual === null ? "Chưa đủ dữ liệu" : `${it.actual}${it.unit === "percent" ? "%" : ""}`}</span> / {it.evaluation.state !== "contribution" && getKpiMetric(it.item.metricKey)?.direction === "at_most" ? "≤ " : ""}{it.contributionOnly ? <span title="KPI toàn cục — đây chỉ là đóng góp trong phạm vi lọc">N/A (Đóng góp hiện tại · target toàn cục {it.target})</span> : it.target}
                          {it.lockedTarget !== null && <span className="ml-1 text-muted-foreground">(snapshot khi khóa)</span>}
                          {it.adjustments.length > 0 && <span className="ml-1 text-muted-foreground" title={it.adjustments.map((a) => `${a.at.slice(0, 10)}: ${a.from}→${a.to}`).join("\n")}>· {it.adjustments.length} điều chỉnh</span>}
                        </td>
                        <td colSpan={3} className="text-muted-foreground">{it.evaluation.label}{it.evaluation.state === "overdue" && it.achieved === null && it.warnings ? " (chưa kết luận — còn mục chưa xác minh)" : ""} · hạn {it.deadline.split("-").reverse().join("/")}{it.lockedSource === "snapshot" ? " · kết quả đã chốt" : it.lockedSource === "live" ? " · kỳ khóa chưa có bản chốt, đang tính lại" : ""}{it.warnings ? ` · ${it.warnings} mục chưa xác minh` : ""} · kỳ {p.status}</td>
                      </tr>
                    );
                  })}
                  {open === u.id && (
                    <tr className="border-t border-border bg-muted/40 text-xs"><td className="px-6 py-1.5 text-muted-foreground">Trạng thái chi tiết</td>
                      <td colSpan={4}>Tồn việc: <span className={chip} onClick={() => setDrill({ kind: "work", title: "Tồn việc", rows: r.backlog })}>{r.backlog.length}</span> · Đang chờ người duyệt: <span className={chip} onClick={() => setDrill({ kind: "work", title: "Đang chờ người duyệt", rows: r.waitingReview })}>{r.waitingReview.length}</span> · Chỉ tiêu đạt: {r.achievedCount}/{r.assignedCount}</td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {drill && (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between"><h3 className="font-medium">{drill.title}</h3><button className="text-xs text-muted-foreground" onClick={() => setDrill(null)}>Đóng</button></div>
          {drill.kind === "ratio" && <p className="mb-2 text-xs text-muted-foreground">Tử số {drill.r.num} / mẫu số {drill.r.den} (chỉ việc có {drill.field === "onTime" ? "deadline hợp lệ" : "lịch sử duyệt tin cậy"}). {drill.r.den === 0 && "Mẫu số 0 → N/A."}</p>}
          {drill.kind === "breakdown" ? (
            <ul className="space-y-1 text-sm">{drill.item.breakdown.map((b) => (
              <li key={b.key}>{bname(b.brandId)} · {cname(b.websiteId, b.socialId)}: <b>{b.count}</b> <Link to="/overview-v2" search={{ from: drill.period.periodStart, to: drill.period.periodEnd, brandId: b.brandId ?? undefined, websiteId: b.websiteId ?? undefined, socialId: b.socialId ?? undefined, metric: drill.item.item.metricKey }} className="text-xs text-primary hover:underline">→ Tổng quan V2</Link></li>
            ))}{!drill.item.breakdown.length && <li className="text-muted-foreground">Không có evidence.</li>}</ul>
          ) : (
            <table className="w-full text-sm"><tbody>
              {(drill.kind === "ratio" ? drill.rows.filter((e) => e[drill.field] !== null) : drill.rows).map((e) => (
                <tr key={`${e.sourceType}${e.sourceId}`} className="border-t border-border">
                  <td className="py-1"><SourceLink t={e.sourceType} id={e.sourceId} websiteId={e.websiteId} socialId={e.socialId}>{e.title}</SourceLink></td>
                  <td className="text-xs text-muted-foreground">{e.sourceType}</td>
                  <td className="text-xs">{"creditedAt" in e ? `nộp ${e.creditedAt}` : e.status}</td>
                  <td className="text-xs">hạn {e.deadline ? e.deadline.slice(0, 10) : "N/A"}</td>
                  <td className="text-xs">{drill.kind === "ratio" ? (e as EvidenceRow)[drill.field] ? "✓" : "✗" : "overdue" in e && e.overdue ? "Quá hạn" : ""}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>
      )}
    </div>
  );
}
