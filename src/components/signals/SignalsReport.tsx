import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SIGNAL_LOST_REASONS, SIGNAL_NEED_GROUPS, SIGNAL_PRODUCTS, SIGNAL_SOURCES, STATUS_LABEL, fmtVnd, todayKey } from "@/lib/signals/catalog";
import { filterSignals, groupBy, lostReasons, summarize, type ReportFilter, type Summary } from "@/lib/signals/report";
import { errMsg } from "@/lib/signals/api";
import { useLastNotes, useOptions, useSignalPerms, useSignals, useUserName } from "./SignalsUi";
import { needGroupsOf } from "@/lib/signals/catalog";

const pct = (s: Summary) => (s.closeRate == null ? "Chưa có dữ liệu" : `${s.closeRate.toFixed(1)}%`);

export function SignalsReport() {
  const p = useSignalPerms();
  const name = useUserName();
  const { data = [], isLoading, error } = useSignals();
  const { data: last = {} } = useLastNotes();
  const t = todayKey();
  const [f, setF] = useState<ReportFilter>({ basis: "created", from: `${t.slice(0, 7)}-01`, to: t });
  const set = (k: keyof ReportFilter, v: string) => setF((x) => ({ ...x, [k]: v || undefined }));
  const list = useMemo(() => filterSignals(data, f), [data, f]);
  const sum = summarize(list, t, last);
  const bySource = groupBy(list, (s) => s.source);
  const prodOpts = useOptions("signal_products");
  const needOpts = useOptions("signal_need_groups");
  const multi = (get: (s: (typeof list)[number]) => string[]) => {
    const keys = [...new Set(list.flatMap((s) => get(s).map((k) => (k.startsWith("Khác") ? "Khác" : k))))];
    return keys.map((k) => ({ key: k, s: summarize(list.filter((s) => get(s).some((x) => (x.startsWith("Khác") ? "Khác" : x) === k))) })).sort((a, b) => b.s.total - a.s.total);
  };
  const byProduct = multi((s) => s.products);
  const byNeed = multi(needGroupsOf);
  const bySale = groupBy(list, (s) => s.assigned_to);
  const lost = lostReasons(list);
  const people = (ids: (string | null)[]) => [...new Set(ids.filter(Boolean) as string[])].map((id) => ({ id, n: name(id) }));

  if (!p.report) return <p className="py-16 text-center text-muted-foreground">Bạn không có quyền xem báo cáo tín hiệu.</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Báo cáo tín hiệu</h1>
        <p className="text-sm text-muted-foreground">
          Đang tính theo <b>{f.basis === "created" ? "ngày tạo tín hiệu" : "ngày Chốt / Trượt"}</b>. Doanh số là số Sale khai báo khi Chốt, chưa phải doanh thu kế toán xác nhận. Dữ liệu tải đủ, không giới hạn số dòng.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 text-sm">
        <Sel label="Tính theo" value={f.basis} onChange={(v) => setF((x) => ({ ...x, basis: (v || "created") as any }))} opts={[["created", "Ngày tạo tín hiệu"], ["closed", "Ngày chốt / trượt"]]} noEmpty />
        <label className="space-y-1"><span className="text-xs text-muted-foreground">Từ ngày</span><Input type="date" value={f.from ?? ""} onChange={(e) => set("from", e.target.value)} /></label>
        <label className="space-y-1"><span className="text-xs text-muted-foreground">Đến ngày</span><Input type="date" value={f.to ?? ""} onChange={(e) => set("to", e.target.value)} /></label>
        <Sel label="Nguồn" value={f.source} onChange={(v) => set("source", v)} opts={SIGNAL_SOURCES.map((x) => [x, x])} />
        <Sel label="Sản phẩm" value={f.product} onChange={(v) => set("product", v)} opts={prodOpts.names.map((x) => [x, x])} />
        <Sel label="Nhóm nhu cầu" value={f.needGroup} onChange={(v) => set("needGroup", v)} opts={needOpts.names.map((x) => [x, x])} />
        <Sel label="Sale phụ trách" value={f.saleId} onChange={(v) => set("saleId", v)} opts={people(data.map((s) => s.assigned_to)).map((x) => [x.id, x.n])} />
        <Sel label="Người tạo" value={f.creatorId} onChange={(v) => set("creatorId", v)} opts={people(data.map((s) => s.created_by)).map((x) => [x.id, x.n])} />
        <Sel label="Trạng thái" value={f.status} onChange={(v) => set("status", v)} opts={[["unassigned", "Chưa phân công"], ...Object.entries(STATUS_LABEL)]} />
        <Sel label="Lý do trượt" value={f.lostReason} onChange={(v) => set("lostReason", v)} opts={SIGNAL_LOST_REASONS.map((x) => [x, x])} />
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : error ? <p className="text-sm text-destructive">{errMsg(error)}</p> : (
        <>
          <H>Tổng quan</H>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Card k="Tổng tín hiệu" v={sum.total} />
            <Card k="Chưa phân công" v={sum.unassigned} />
            <Card k="Chờ nhận" v={sum.waiting} />
            <Card k="Đang liên hệ" v={sum.contacting} />
            <Card k="Đang tư vấn" v={sum.consulting} />
            <Card k="Đã báo giá" v={sum.quoted} />
            <Card k="Chờ xác nhận / cọc" v={sum.deposit} />
            <Card k="Chốt" v={sum.won} />
            <Card k="Trượt" v={sum.lost} />
            <Card k="Doanh số chốt" v={fmtVnd(sum.revenue)} hint={`Tỷ lệ chốt: ${pct(sum)}`} />
          </div>


          <H>Hiệu quả Sale</H>
          <Tbl title="Theo Sale được phân công" first="Sale" rows={bySale.map((r) => [name(r.key), r.s])} cols="sale" />
          <CareTable data={data} name={name} userId={p.userId} all={p.viewAll || p.assign} />

          <H>Phân tích tín hiệu</H>
          <Tbl title="Theo nguồn tín hiệu" first="Nguồn" rows={bySource.map((r) => [r.key, r.s])} cols="mkt" />
          <Tbl title="Theo nhóm sản phẩm" first="Sản phẩm" rows={byProduct.map((r) => [r.key, r.s])} cols="mkt" />
          <p className="text-xs text-muted-foreground -mt-3">Một tín hiệu chọn nhiều sản phẩm / nhóm nhu cầu được đếm ở mỗi dòng tương ứng, nên cộng các dòng có thể lớn hơn tổng tín hiệu. Tổng số ở phần Tổng quan luôn đếm mỗi tín hiệu một lần.</p>
          <Tbl title="Theo nhóm nhu cầu" first="Nhóm nhu cầu" rows={byNeed.map((r) => [r.key, r.s])} cols="mkt" />
          <div className="rounded-lg border bg-card overflow-x-auto">
            <div className="px-3 py-2 font-medium text-sm border-b">Theo lý do trượt</div>
            {lost.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Chưa có tín hiệu trượt.</p> : (
              <table className="w-full text-sm"><tbody>
                {lost.map((r) => <tr key={r.key} className="border-t first:border-t-0"><td className="px-3 py-2">{r.key}</td><td className="px-3 py-2 text-right">{r.n}</td></tr>)}
              </tbody></table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</div>;
}
function Sel({ label, value, onChange, opts, noEmpty }: { label: string; value?: string; onChange: (v: string) => void; opts: string[][]; noEmpty?: boolean }) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select className="h-10 w-full rounded-md border bg-background px-2 text-sm" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {!noEmpty && <option value="">Tất cả</option>}
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
function Card({ k, v, hint }: { k: string; v: string | number; hint?: string }) {
  return <div className="rounded-xl border bg-card p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="text-xl font-semibold mt-0.5">{v}</div>{hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}</div>;
}
function Tbl({ title, first, rows, cols }: { title: string; first: string; rows: [string, Summary][]; cols: "mkt" | "sale" }) {
  const head = cols === "mkt"
    ? ["Tín hiệu", "Chốt", "Trượt", "Tỷ lệ chốt", "Doanh số"]
    : ["Được giao", "Đã tiếp nhận", "Đang liên hệ", "Đang tư vấn", "Đã báo giá", "Chờ xác nhận / cọc", "Chốt", "Trượt", "Doanh số"];
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <div className="px-3 py-2 font-medium text-sm border-b">{title}</div>
      {rows.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Chưa có dữ liệu.</p> : (
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr><th className="px-3 py-2 text-left font-medium">{first}</th>{head.map((h) => <th key={h} className="px-3 py-2 text-right font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(([k, s]) => (
              <tr key={k} className="border-t">
                <td className="px-3 py-2">{k}</td>
                {(cols === "mkt"
                  ? [s.total, s.won, s.lost, pct(s), fmtVnd(s.revenue)]
                  : [s.total - s.unassigned, s.accepted, s.contacting, s.consulting, s.quoted, s.deposit, s.won, s.lost, fmtVnd(s.revenue)]
                ).map((v, i) => <td key={i} className="px-3 py-2 text-right whitespace-nowrap">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/** Theo dõi chăm sóc — tình trạng hiện tại (không theo bộ lọc thời gian), trong phạm vi dữ liệu được xem. */
function CareTable({ data, name, userId, all }: { data: any[]; name: (id: string | null) => string; userId: string | null; all: boolean }) {
  const { data: notes = {} } = useQuery({ queryKey: ["sig:care", userId], queryFn: listCareNotes, enabled: !!userId });
  const careFn = useServerFn(zaloCareCounts);
  const { data: cfg } = useQuery({ queryKey: ["sig:carecfg"], queryFn: () => careFn(), staleTime: 600000 });
  const rows = useMemo(() => {
    const m: Record<string, { u: number; s: number }> = {}; const now = Date.now();
    for (const s of data) {
      if (!all && s.assigned_to !== userId) continue;
      const f = careFlag(s, notes[s.id] ?? [], now, cfg ?? DEFAULT_CARE);
      if (!f) continue;
      const r = (m[s.assigned_to] ??= { u: 0, s: 0 });
      if (f === "unaccepted") r.u++; else r.s++;
    }
    return Object.entries(m).sort((a, b) => b[1].u + b[1].s - a[1].u - a[1].s);
  }, [data, notes, cfg, all, userId]);
  const link = (id: string, kind: string, n: number) => n ? <a className="text-primary underline" href={`/signals?care=1&sale=${id}&kind=${kind}`}>{n}</a> : <span className="text-muted-foreground">0</span>;
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <div className="px-3 py-2 text-sm font-medium border-b">Theo dõi chăm sóc <span className="text-xs font-normal text-muted-foreground">— tình trạng hiện tại, chỉ để nhắc việc</span></div>
      {rows.length === 0 ? <p className="p-3 text-sm text-muted-foreground">Không có tín hiệu cần kiểm tra.</p> : (
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-3 py-2">Nhân viên</th><th className="px-3 py-2">Chưa tiếp nhận</th><th className="px-3 py-2">Lâu chưa cập nhật</th></tr></thead>
          <tbody>{rows.map(([id, r]) => (
            <tr key={id} className="border-t"><td className="px-3 py-2">{name(id)}</td><td className="px-3 py-2">{link(id, "unaccepted", r.u)}</td><td className="px-3 py-2">{link(id, "stale", r.s)}</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
