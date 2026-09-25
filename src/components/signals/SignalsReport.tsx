import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SIGNAL_NEED_GROUPS, SIGNAL_PRODUCTS, SIGNAL_SOURCES, STATUS_LABEL, fmtVnd, todayKey } from "@/lib/signals/catalog";
import { filterSignals, groupBy, summarize, type ReportFilter, type Summary } from "@/lib/signals/report";
import { errMsg } from "@/lib/signals/api";
import { useSignalPerms, useSignals, useUserName } from "./SignalsUi";

const pct = (s: Summary) => (s.closeRate == null ? "Chưa có dữ liệu" : `${s.closeRate.toFixed(1)}%`);

export function SignalsReport() {
  const p = useSignalPerms();
  const name = useUserName();
  const { data = [], isLoading, error } = useSignals(!!p.userId);
  const t = todayKey();
  const [f, setF] = useState<ReportFilter>({ basis: "created", from: `${t.slice(0, 7)}-01`, to: t });
  const set = (k: keyof ReportFilter, v: string) => setF((x) => ({ ...x, [k]: v || undefined }));
  const list = useMemo(() => filterSignals(data, f), [data, f]);
  const sum = summarize(list);
  const bySource = groupBy(list, (s) => s.source);
  const byCreator = groupBy(list, (s) => s.created_by);
  const bySale = groupBy(list, (s) => s.assigned_to);
  const people = (ids: (string | null)[]) => [...new Set(ids.filter(Boolean) as string[])].map((id) => ({ id, n: name(id) }));

  if (!p.report) return <p className="py-16 text-center text-muted-foreground">Bạn không có quyền xem báo cáo tín hiệu.</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Báo cáo tín hiệu</h1>
        <p className="text-sm text-muted-foreground">Doanh số là số Sale khai báo khi Chốt, chưa phải doanh thu kế toán xác nhận.</p>
      </div>

      <div className="rounded-lg border bg-card p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 text-sm">
        <Sel label="Tính theo" value={f.basis} onChange={(v) => setF((x) => ({ ...x, basis: (v || "created") as any }))} opts={[["created", "Ngày tạo tín hiệu"], ["closed", "Ngày chốt / trượt"]]} noEmpty />
        <label className="space-y-1"><span className="text-xs text-muted-foreground">Từ ngày</span><Input type="date" value={f.from ?? ""} onChange={(e) => set("from", e.target.value)} /></label>
        <label className="space-y-1"><span className="text-xs text-muted-foreground">Đến ngày</span><Input type="date" value={f.to ?? ""} onChange={(e) => set("to", e.target.value)} /></label>
        <Sel label="Nguồn" value={f.source} onChange={(v) => set("source", v)} opts={SIGNAL_SOURCES.map((x) => [x, x])} />
        <Sel label="Sản phẩm" value={f.product} onChange={(v) => set("product", v)} opts={SIGNAL_PRODUCTS.map((x) => [x, x])} />
        <Sel label="Nhóm nhu cầu" value={f.needGroup} onChange={(v) => set("needGroup", v)} opts={SIGNAL_NEED_GROUPS.map((x) => [x, x])} />
        <Sel label="Sale phụ trách" value={f.saleId} onChange={(v) => set("saleId", v)} opts={people(data.map((s) => s.assigned_to)).map((x) => [x.id, x.n])} />
        <Sel label="Người tạo" value={f.creatorId} onChange={(v) => set("creatorId", v)} opts={people(data.map((s) => s.created_by)).map((x) => [x.id, x.n])} />
        <Sel label="Trạng thái" value={f.status} onChange={(v) => set("status", v)} opts={[["unassigned", "Chưa phân công"], ...Object.entries(STATUS_LABEL)]} />
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : error ? <p className="text-sm text-destructive">{errMsg(error)}</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card k="Tổng tín hiệu" v={sum.total} />
            <Card k="Chưa phân công" v={sum.unassigned} />
            <Card k="Chờ nhận" v={sum.waiting} />
            <Card k="Đang tư vấn" v={sum.consulting} />
            <Card k="Đã chốt" v={sum.won} />
            <Card k="Trượt" v={sum.lost} />
            <Card k="Tỷ lệ chốt" v={pct(sum)} hint="Chốt / (Chốt + Trượt)" />
            <Card k="Doanh số chốt" v={fmtVnd(sum.revenue)} />
          </div>

          <Tbl title="Hiệu quả Marketing — theo nguồn" first="Nguồn" rows={bySource.map((r) => [r.key, r.s])} cols="mkt" />
          <Tbl title="Hiệu quả Marketing — theo người tạo" first="Nhân viên tạo" rows={byCreator.map((r) => [name(r.key), r.s])} cols="mkt" />
          <Tbl title="Hiệu quả Sale" first="Sale" rows={bySale.map((r) => [name(r.key), r.s])} cols="sale" />
        </>
      )}
    </div>
  );
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
  const head = cols === "mkt" ? ["Tín hiệu", "Chốt", "Tỷ lệ chốt", "Doanh số"] : ["Được giao", "Đã nhận", "Đang tư vấn", "Chốt", "Trượt", "Tỷ lệ chốt", "Doanh số", "Quá lịch"];
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
                  ? [s.total, s.won, pct(s), fmtVnd(s.revenue)]
                  : [s.total, s.consulting + s.won + s.lost, s.consulting, s.won, s.lost, pct(s), fmtVnd(s.revenue), s.overdue]
                ).map((v, i) => <td key={i} className="px-3 py-2 text-right whitespace-nowrap">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
