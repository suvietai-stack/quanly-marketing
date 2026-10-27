import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Line, XAxis, YAxis,
} from "recharts";
import {
  Banknote, CheckCircle2, ClipboardList, Flame, Lightbulb, Loader2, Percent,
  RotateCcw, Signal as SignalIcon, SlidersHorizontal, Timer, UserX, XCircle,
} from "lucide-react";
import { careFlag, DEFAULT_CARE } from "@/lib/signals/care";
import { zaloCareCounts } from "@/lib/zalo.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { SIGNAL_LOST_REASONS, STATUS_LABEL, fmtVnd, todayKey } from "@/lib/signals/catalog";
import {
  filterSignals, groupBy, lostReasons, reportInsights, summarize, trendSeries,
  type ReportFilter, type Summary, type TrendGranularity,
} from "@/lib/signals/report";
import { errMsg, listAcceptNotes, listAssignEvents, listCareNotes } from "@/lib/signals/api";
import { acceptStat, fmtMinutes, type AcceptNoteRow, type AssignEventRow } from "@/lib/signals/acceptTime";
import type { Signal, SignalStatus } from "@/lib/signals/catalog";
import { useLastNotes, useOptions, useSignalPerms, useSignals, useUserName } from "./SignalsUi";
import { needGroupsOf } from "@/lib/signals/catalog";
import { cn } from "@/lib/utils";

const pct = (s: Summary) => (s.closeRate == null ? "Chưa có dữ liệu" : `${s.closeRate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`);

/* Màu biểu đồ bám bảng Soft Modern: navy / xanh thương hiệu / cam Sứ Việt / xanh lá / đỏ. */
const C = {
  navy: "oklch(0.29 0.08 260)",
  brand: "oklch(0.49 0.13 262)",
  orange: "oklch(0.72 0.17 55)",
  green: "oklch(0.62 0.15 155)",
  red: "oklch(0.58 0.2 27)",
  muted: "oklch(0.75 0.03 262)",
};

const TREND_CONFIG: ChartConfig = {
  created: { label: "Tín hiệu tạo trong kỳ", color: C.brand },
  won: { label: "Trong đó hiện đã Chốt", color: C.orange },
};
const STATUS_CONFIG: ChartConfig = { n: { label: "Số tín hiệu", color: C.brand } };
const SOURCE_CONFIG: ChartConfig = { v: { label: "Giá trị", color: C.brand } };

export function SignalsReport() {
  const p = useSignalPerms();
  const name = useUserName();
  const { data = [], isLoading, error } = useSignals();
  const { data: last = {} } = useLastNotes();
  const t = todayKey();
  const [f, setF] = useState<ReportFilter>({ basis: "created", from: `${t.slice(0, 7)}-01`, to: t });
  const [filterOpen, setFilterOpen] = useState(false);
  const [gran, setGran] = useState<TrendGranularity>("day");
  const [srcMetric, setSrcMetric] = useState<"total" | "won" | "rate">("total");
  const set = (k: keyof ReportFilter, v: string) => setF((x) => ({ ...x, [k]: v || undefined }));
  const reset = () => setF({ basis: "created", from: `${t.slice(0, 7)}-01`, to: t });

  const list = useMemo(() => filterSignals(data, f), [data, f]);
  const sum = summarize(list, t, last);
  // KPI tỷ lệ chốt: giữ tập gốc theo bộ lọc nghiệp vụ, không bị bộ lọc trạng thái làm sai lệch
  const kpiList = useMemo(() => filterSignals(data, { ...f, status: undefined }), [data, f]);
  const kpi = useMemo(() => summarize(kpiList, t), [kpiList, t]);
  // Tỷ lệ chốt theo Sale: cùng tập không lọc trạng thái, mẫu số = tổng tín hiệu được giao
  const rateBySale = useMemo(() => new Map(groupBy(kpiList, (s) => s.assigned_to).map((r) => [r.key, r.s])), [kpiList]);
  const signalsBySale = useMemo(() => {
    const m = new Map<string, Signal[]>();
    for (const s of list) if (s.assigned_to) (m.get(s.assigned_to) ?? m.set(s.assigned_to, []).get(s.assigned_to)!).push(s);
    return m;
  }, [list]);
  // Cache only source timestamps, never calculated KPI; refresh at the same cadence as signals.
  const historyRefresh = {
    enabled: !!p.userId && p.report,
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: "always" as const,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  };
  const assignments = useQuery({ ...historyRefresh, queryKey: ["sig:assignEvents", p.userId], queryFn: listAssignEvents });
  const acceptances = useQuery({ ...historyRefresh, queryKey: ["sig:acceptNotes", p.userId], queryFn: listAcceptNotes });
  const assignEvents = assignments.data ?? [];
  const acceptNotes = acceptances.data ?? [];

  const bySource = groupBy(list, (s) => s.source);
  const prodOpts = useOptions("signal_products");
  const needOpts = useOptions("signal_need_groups");
  const srcOpts = useOptions("signal_sources");
  const multi = (get: (s: (typeof list)[number]) => string[]) => {
    const keys = [...new Set(list.flatMap((s) => get(s).map((k) => (k.startsWith("Khác") ? "Khác" : k))))];
    return keys.map((k) => ({ key: k, s: summarize(list.filter((s) => get(s).some((x) => (x.startsWith("Khác") ? "Khác" : x) === k))) })).sort((a, b) => b.s.total - a.s.total);
  };
  const byProduct = multi((s) => s.products);
  const byNeed = multi(needGroupsOf);
  const bySale = groupBy(list, (s) => s.assigned_to);
  const lost = lostReasons(list);
  const people = (ids: (string | null)[]) => [...new Set(ids.filter(Boolean) as string[])].map((id) => ({ id, n: name(id) }));

  /* ---- Dữ liệu cho các khu vực mới (tất cả đều theo bộ lọc chung) ---- */
  const insights = useMemo(() => reportInsights({ sum, bySource, byNeed }), [sum, bySource, byNeed]);
  const trend = useMemo(() => trendSeries(kpiList, gran), [kpiList, gran]);
  const statusDist = useMemo(() => {
    const rows: { key: string; label: string; n: number; fill: string }[] = [];
    if (sum.unassigned) rows.push({ key: "unassigned", label: "Chưa phân công", n: sum.unassigned, fill: C.muted });
    const tone: Record<SignalStatus, string> = {
      waiting: C.orange, contacting: C.brand, consulting: C.navy, quoted: "oklch(0.55 0.12 300)",
      deposit: "oklch(0.6 0.14 330)", won: C.green, lost: C.red,
    };
    for (const st of Object.keys(STATUS_LABEL) as SignalStatus[]) {
      const n = sum[st];
      if (n) rows.push({ key: st, label: STATUS_LABEL[st], n, fill: tone[st] });
    }
    return rows;
  }, [sum]);
  const srcChart = useMemo(() => bySource.map((r) => ({
    key: r.key,
    v: srcMetric === "total" ? r.s.total : srcMetric === "won" ? r.s.won : Math.round((r.s.closeRate ?? 0) * 10) / 10,
  })).sort((a, b) => b.v - a.v), [bySource, srcMetric]);
  const acceptAll = useMemo(
    () => acceptStat(kpiList.filter((s) => s.assigned_to), assignEvents, acceptNotes),
    [kpiList, assignEvents, acceptNotes],
  );
  const processing = sum.contacting + sum.consulting + sum.quoted + sum.deposit;
  const activeCount = [f.source, f.product, f.needGroup, f.saleId, f.creatorId, f.status, f.lostReason].filter(Boolean).length;

  if (!p.report) return <p className="py-16 text-center text-muted-foreground">Bạn không có quyền xem báo cáo tín hiệu.</p>;

  const filterFields = (
    <ReportFilterFields
      f={f} set={set} setF={setF}
      sources={[...new Set([...srcOpts.names, ...data.map((x) => x.source)])]}
      products={prodOpts.names} needs={needOpts.names}
      sales={people(data.map((s) => s.assigned_to))} creators={people(data.map((s) => s.created_by))}
    />
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* 1. Tiêu đề + bộ lọc báo cáo */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Báo cáo tín hiệu</h1>
          <p className="text-sm text-muted-foreground">
            Đang phân tích <b>{f.from ?? "…"} → {f.to ?? "…"}</b> theo <b>{f.basis === "created" ? "ngày tạo tín hiệu" : "ngày Chốt / Trượt"}</b>. Doanh số là số Sale khai báo khi Chốt, chưa phải doanh thu kế toán xác nhận.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="md:hidden" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" />Bộ lọc{activeCount ? ` (${activeCount})` : ""}
          </Button>
          <Button variant="ghost" onClick={reset}><RotateCcw className="h-4 w-4 mr-1" />Đặt lại</Button>
        </div>
      </div>

      <div className="hidden md:block rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-4 lg:grid-cols-5 gap-3 text-sm">{filterFields}</div>
      </div>
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-0 sm:max-w-xl sm:mx-auto sm:rounded-t-xl">
          <SheetHeader className="p-4 pb-2"><SheetTitle>Bộ lọc báo cáo</SheetTitle></SheetHeader>
          <div className="px-4 grid grid-cols-2 gap-3 pb-4 text-sm">{filterFields}</div>
          <div className="sticky bottom-0 bg-background border-t p-3 grid grid-cols-2 gap-2">
            <Button variant="outline" size="lg" onClick={() => { reset(); }}>Đặt lại</Button>
            <Button size="lg" onClick={() => setFilterOpen(false)}>Áp dụng</Button>
          </div>
        </SheetContent>
      </Sheet>

      {isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : error ? <p className="text-sm text-destructive">{errMsg(error)}</p> : (
        <>
          {/* 2. Điểm đáng chú ý — tính từ dữ liệu thật theo bộ lọc */}
          {insights.length > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary"><Lightbulb className="h-4 w-4" />Điểm đáng chú ý</div>
              <ul className="space-y-1 text-sm">
                {insights.map((i, idx) => (
                  <li key={idx}>
                    {i.text}
                    {i.note && <span className="block text-xs text-muted-foreground">{i.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. KPI tổng quan */}
          <section className="space-y-2">
            <H>KPI tổng quan</H>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <Kpi icon={<SignalIcon className="h-4 w-4" />} k="Tổng tín hiệu" v={sum.total} hint="Mọi tín hiệu hợp lệ trong bộ lọc (không tính tín hiệu đã hủy)." />
              <Kpi icon={<CheckCircle2 className="h-4 w-4" />} tone="green" k="Đã chốt" v={sum.won} hint="Tín hiệu có trạng thái Chốt trong bộ lọc." />
              <Kpi icon={<Percent className="h-4 w-4" />} tone="orange" k="Tỷ lệ chốt" v={pct(kpi)} hint={`Chốt / Tổng tín hiệu hợp lệ = ${kpi.won}/${kpi.total}. Không phụ thuộc bộ lọc Trạng thái.`} />
              <Kpi icon={<Loader2 className="h-4 w-4" />} tone="brand" k="Đang xử lý" v={processing} hint="Đang liên hệ + Đang tư vấn + Đã báo giá + Chờ xác nhận/cọc." />
              <Kpi icon={<XCircle className="h-4 w-4" />} tone="red" k="Trượt" v={sum.lost} hint="Tín hiệu có trạng thái Trượt trong bộ lọc." />
              <Kpi icon={<UserX className="h-4 w-4" />} k="Chưa phân công / Chờ nhận" v={`${sum.unassigned} / ${sum.waiting}`} hint="Chưa có Sale phụ trách / đã giao nhưng Sale chưa tiếp nhận." />
              <Kpi icon={<Banknote className="h-4 w-4" />} tone="green" k="Doanh số chốt" v={fmtVnd(sum.revenue)} hint="Tổng doanh số Sale khai báo khi Chốt, chưa phải doanh thu kế toán." />
              <Kpi
                icon={<Timer className="h-4 w-4" />} tone="brand" k="TG tiếp nhận TB" v={fmtMinutes(acceptAll.avg)}
                hint={`${acceptAll.valid} tín hiệu hợp lệ. Chỉ tính 08:00–17:00 Thứ Hai–Thứ Bảy (giờ VN), Chủ nhật nghỉ; tín hiệu không có phút làm việc bị loại khỏi trung bình.`}
              />
            </div>
          </section>

          {/* 4. Xu hướng theo thời gian */}
          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <H>Xu hướng tín hiệu</H>
              <div className="flex gap-1">
                {([["day", "Ngày"], ["week", "Tuần"], ["month", "Tháng"]] as [TrendGranularity, string][]).map(([g, l]) => (
                  <button key={g} onClick={() => setGran(g)}
                    className={cn("rounded-full border px-3 py-1 text-xs font-medium", gran === g ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>{l}</button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-3 shadow-sm">
              {trend.length === 0 ? <p className="p-6 text-sm text-muted-foreground text-center">Không có dữ liệu trong khoảng thời gian đang chọn.</p> : (
                <>
                  <ChartContainer config={TREND_CONFIG} className="h-[260px] w-full">
                    <ComposedChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="created" fill="var(--color-created)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                      <Line dataKey="won" stroke="var(--color-won)" strokeWidth={2} dot={{ r: 2.5 }} />
                    </ComposedChart>
                  </ChartContainer>
                  <div className="flex flex-wrap gap-4 px-1 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: C.brand }} />Tín hiệu tạo trong kỳ</span>
                    <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: C.orange }} />Trong đó hiện đã Chốt</span>
                  </div>
                  <p className="px-1 pt-1 text-[11px] text-muted-foreground">
                    Cột = số tín hiệu <b>tạo</b> trong từng {gran === "day" ? "ngày" : gran === "week" ? "tuần" : "tháng"}; đường = số tín hiệu thuộc nhóm đó <b>hiện đã Chốt</b> (không phải số chốt phát sinh trong kỳ).
                  </p>
                </>
              )}
            </div>
          </section>

          {/* 5. Phân bố trạng thái (trạng thái hiện tại, loại trừ nhau — không phải phễu lịch sử) */}
          <section className="space-y-2">
            <H>Phân bố trạng thái</H>
            <div className="rounded-2xl border bg-card p-3 shadow-sm">
              {statusDist.length === 0 ? <p className="p-6 text-sm text-muted-foreground text-center">Không có dữ liệu.</p> : (
                <>
                  <ChartContainer config={STATUS_CONFIG} className="w-full" style={{ height: Math.max(180, statusDist.length * 36) }}>
                    <BarChart data={statusDist} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="label" width={120} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="n" radius={[0, 4, 4, 0]} maxBarSize={22} label={{ position: "right", fill: "currentColor", fontSize: 12 }} />
                    </BarChart>
                  </ChartContainer>
                  <p className="px-1 pt-1 text-[11px] text-muted-foreground">
                    Đây là <b>trạng thái hiện tại</b> của từng tín hiệu (mỗi tín hiệu chỉ ở một trạng thái), không phải tỷ lệ chuyển đổi qua từng bước của phễu.
                  </p>
                </>
              )}
            </div>
          </section>

          {/* 6. Hiệu quả nguồn tín hiệu */}
          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <H>Hiệu quả nguồn tín hiệu</H>
              <div className="flex gap-1">
                {([["total", "Tổng tín hiệu"], ["won", "Đã chốt"], ["rate", "Tỷ lệ chốt"]] as const).map(([m, l]) => (
                  <button key={m} onClick={() => setSrcMetric(m)}
                    className={cn("rounded-full border px-3 py-1 text-xs font-medium", srcMetric === m ? "bg-primary text-primary-foreground border-primary" : "bg-card")}>{l}</button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-3 shadow-sm">
              {srcChart.length === 0 ? <p className="p-6 text-sm text-muted-foreground text-center">Không có dữ liệu.</p> : (
                <ChartContainer config={SOURCE_CONFIG} className="w-full" style={{ height: Math.max(160, srcChart.length * 36) }}>
                  <BarChart data={srcChart} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" allowDecimals={srcMetric === "rate"} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="key" width={110} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="v" fill="var(--color-v)" radius={[0, 4, 4, 0]} maxBarSize={22}
                      label={{ position: "right", fill: "currentColor", fontSize: 12, formatter: (v: number) => (srcMetric === "rate" ? `${v}%` : v) }} />
                  </BarChart>
                </ChartContainer>
              )}
              <p className="px-1 pt-1 text-[11px] text-muted-foreground">Tỷ lệ chốt từng nguồn = Chốt của nguồn / Tổng tín hiệu của nguồn trong bộ lọc.</p>
            </div>
            <Tbl title="Bảng so sánh nguồn" first="Nguồn" rows={bySource.map((r) => [r.key, r.s])} cols="mkt" />
          </section>

          {/* 7. Hiệu suất Sale */}
          <section className="space-y-2">
            <H>Hiệu suất Sale</H>
            {assignments.error || acceptances.error ? (
              <p className="text-sm text-destructive">Không tải được lịch sử tiếp nhận: {errMsg(assignments.error || acceptances.error)}</p>
            ) : assignments.isPending || acceptances.isPending ? (
              <p className="text-sm text-muted-foreground">Đang tải lịch sử tiếp nhận…</p>
            ) : (
              <SaleTable rows={bySale} name={name} rates={rateBySale} signalsBySale={signalsBySale} events={assignEvents} notes={acceptNotes} />
            )}
            <CareTable data={data} name={name} userId={p.userId} all={p.viewAll || p.assign} />
          </section>

          {/* 8. Phân tích chi tiết khác */}
          <section className="space-y-2">
            <H>Phân tích chi tiết</H>
            <Tbl title="Theo nhóm sản phẩm" first="Sản phẩm" rows={byProduct.map((r) => [r.key, r.s])} cols="mkt" />
            <Tbl title="Theo nhóm nhu cầu" first="Nhóm nhu cầu" rows={byNeed.map((r) => [r.key, r.s])} cols="mkt" />
            <p className="text-xs text-muted-foreground -mt-1">Một tín hiệu chọn nhiều sản phẩm / nhóm nhu cầu được đếm ở mỗi dòng tương ứng, nên cộng các dòng có thể lớn hơn tổng tín hiệu. Tổng số ở phần KPI luôn đếm mỗi tín hiệu một lần.</p>
            <div className="rounded-2xl border bg-card overflow-x-auto shadow-sm">
              <div className="px-4 py-2.5 font-medium text-sm border-b">Theo lý do trượt</div>
              {lost.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Chưa có tín hiệu trượt.</p> : (
                <table className="w-full text-sm"><tbody>
                  {lost.map((r) => <tr key={r.key} className="border-t first:border-t-0"><td className="px-4 py-2">{r.key}</td><td className="px-4 py-2 text-right">{r.n}</td></tr>)}
                </tbody></table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ---------- Thành phần dùng chung ---------- */

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

function ReportFilterFields({ f, set, setF, sources, products, needs, sales, creators }: {
  f: ReportFilter; set: (k: keyof ReportFilter, v: string) => void; setF: React.Dispatch<React.SetStateAction<ReportFilter>>;
  sources: string[]; products: string[]; needs: string[]; sales: { id: string; n: string }[]; creators: { id: string; n: string }[];
}) {
  return (
    <>
      <Sel label="Tính theo" value={f.basis} onChange={(v) => setF((x) => ({ ...x, basis: (v || "created") as any }))} opts={[["created", "Ngày tạo tín hiệu"], ["closed", "Ngày chốt / trượt"]]} noEmpty />
      <label className="space-y-1"><span className="text-xs text-muted-foreground">Từ ngày</span><Input type="date" value={f.from ?? ""} onChange={(e) => set("from", e.target.value)} /></label>
      <label className="space-y-1"><span className="text-xs text-muted-foreground">Đến ngày</span><Input type="date" value={f.to ?? ""} onChange={(e) => set("to", e.target.value)} /></label>
      <Sel label="Nguồn" value={f.source} onChange={(v) => set("source", v)} opts={sources.map((x) => [x, x])} />
      <Sel label="Sản phẩm" value={f.product} onChange={(v) => set("product", v)} opts={products.map((x) => [x, x])} />
      <Sel label="Nhóm nhu cầu" value={f.needGroup} onChange={(v) => set("needGroup", v)} opts={needs.map((x) => [x, x])} />
      <Sel label="Sale phụ trách" value={f.saleId} onChange={(v) => set("saleId", v)} opts={sales.map((x) => [x.id, x.n])} />
      <Sel label="Người tạo" value={f.creatorId} onChange={(v) => set("creatorId", v)} opts={creators.map((x) => [x.id, x.n])} />
      <Sel label="Trạng thái" value={f.status} onChange={(v) => set("status", v)} opts={[["unassigned", "Chưa phân công"], ...Object.entries(STATUS_LABEL)]} />
      <Sel label="Lý do trượt" value={f.lostReason} onChange={(v) => set("lostReason", v)} opts={SIGNAL_LOST_REASONS.map((x) => [x, x])} />
    </>
  );
}

const KPI_TONE: Record<string, string> = {
  brand: "text-primary bg-primary/10",
  green: "text-emerald-600 bg-emerald-500/10",
  red: "text-destructive bg-destructive/10",
  orange: "text-[oklch(0.62_0.17_55)] bg-[oklch(0.72_0.17_55)]/10",
};

function Kpi({ icon, k, v, hint, tone }: { icon: React.ReactNode; k: string; v: string | number; hint?: string; tone?: keyof typeof KPI_TONE }) {
  return (
    <div className="rounded-2xl border bg-card p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl", tone ? KPI_TONE[tone] : "bg-muted text-muted-foreground")}>{icon}</span>
        {hint && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild><span tabIndex={0} className="cursor-help text-xs text-muted-foreground">?</span></TooltipTrigger>
              <TooltipContent className="max-w-xs whitespace-normal">{hint}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold leading-tight">{v}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{k}</div>
    </div>
  );
}

function Tbl({ title, first, rows, cols }: { title: string; first: string; rows: [string, Summary][]; cols: "mkt" | "sale" }) {
  const head = cols === "mkt"
    ? ["Tín hiệu", "Chốt", "Trượt", "Tỷ lệ chốt", "Doanh số"]
    : ["Được giao", "Đã tiếp nhận", "Đang liên hệ", "Đang tư vấn", "Đã báo giá", "Chờ xác nhận / cọc", "Chốt", "Trượt", "Doanh số"];
  return (
    <div className="rounded-2xl border bg-card overflow-x-auto shadow-sm">
      <div className="px-4 py-2.5 font-medium text-sm border-b">{title}</div>
      {rows.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Chưa có dữ liệu.</p> : (
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40"><tr><th className="px-4 py-2 text-left font-medium">{first}</th>{head.map((h) => <th key={h} className="px-4 py-2 text-right font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(([k, s]) => (
              <tr key={k} className="border-t">
                <td className="px-4 py-2">{k}</td>
                {(cols === "mkt"
                  ? [s.total, s.won, s.lost, pct(s), fmtVnd(s.revenue)]
                  : [s.total - s.unassigned, s.accepted, s.contacting, s.consulting, s.quoted, s.deposit, s.won, s.lost, fmtVnd(s.revenue)]
                ).map((v, i) => <td key={i} className="px-4 py-2 text-right whitespace-nowrap">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const ACCEPT_HINT = "Chỉ tính thời gian 08:00–17:00 từ Thứ Hai đến Thứ Bảy, theo giờ Việt Nam; Chủ nhật nghỉ hoàn toàn. Tín hiệu không có phút làm việc giữa lúc giao và tiếp nhận không tham gia tính trung bình.";

/** Bảng Hiệu quả Sale: giữ nguyên các cột hiện có, thêm Tỷ lệ chốt và TG tiếp nhận TB (có sắp xếp). */
function SaleTable({ rows, name, rates, signalsBySale, events, notes }: {
  rows: { key: string; s: Summary }[];
  name: (id: string | null) => string;
  rates: Map<string, Summary>;
  signalsBySale: Map<string, Signal[]>;
  events: AssignEventRow[];
  notes: AcceptNoteRow[];
}) {
  const [sort, setSort] = useState<"default" | "rate" | "accept">("default");
  const data = useMemo(() => rows.map((r) => {
    const k = rates.get(r.key);
    const rate = k && k.total > 0 ? (k.won / k.total) * 100 : null;
    const acc = acceptStat(signalsBySale.get(r.key) ?? [], events, notes);
    return { ...r, rate, acc };
  }), [rows, rates, signalsBySale, events, notes]);
  const sorted = useMemo(() => {
    if (sort === "rate") return [...data].sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
    if (sort === "accept") return [...data].sort((a, b) => (a.acc.avg ?? Infinity) - (b.acc.avg ?? Infinity));
    return data;
  }, [data, sort]);
  const head = ["Được giao", "Đã tiếp nhận", "Đang liên hệ", "Đang tư vấn", "Đã báo giá", "Chờ xác nhận / cọc", "Chốt", "Trượt", "Doanh số"];
  const sortBtn = (key: "rate" | "accept", label: string) => (
    <button type="button" onClick={() => setSort((s) => (s === key ? "default" : key))}
      className={`whitespace-nowrap font-medium ${sort === key ? "text-foreground underline" : ""}`} title="Bấm để sắp xếp">
      {label}{sort === key ? (key === "rate" ? " ↓" : " ↑") : ""}
    </button>
  );
  return (
    <div className="rounded-2xl border bg-card overflow-x-auto shadow-sm">
      <div className="px-4 py-2.5 font-medium text-sm border-b">Theo Sale được phân công</div>
      {rows.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Chưa có dữ liệu.</p> : (
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/40">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Sale</th>
              {head.map((h) => <th key={h} className="px-4 py-2 text-right font-medium whitespace-nowrap">{h}</th>)}
              <th className="px-4 py-2 text-right">{sortBtn("rate", "Tỷ lệ chốt")}</th>
              <th className="px-4 py-2 text-right" title={ACCEPT_HINT}>{sortBtn("accept", "TG tiếp nhận TB")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.key} className="border-t">
                <td className="px-4 py-2">{name(r.key)}</td>
                {[r.s.total - r.s.unassigned, r.s.accepted, r.s.contacting, r.s.consulting, r.s.quoted, r.s.deposit, r.s.won, r.s.lost, fmtVnd(r.s.revenue)]
                  .map((v, i) => <td key={i} className="px-4 py-2 text-right whitespace-nowrap">{v}</td>)}
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  {r.rate == null ? "—" : `${r.rate.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`}
                  {r.rate != null && <span className="block text-[11px] text-muted-foreground">{r.s.won}/{rates.get(r.key)?.total ?? 0} tín hiệu</span>}
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="cursor-help">{fmtMinutes(r.acc.avg)}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm whitespace-normal space-y-1">
                        <p>{r.acc.avg == null ? "Không có tín hiệu đủ điều kiện tính trung bình." : `Trung bình trước làm tròn: ${(r.acc.avg * 60).toLocaleString("vi-VN", { maximumFractionDigits: 12 })} giây (${r.acc.avg.toLocaleString("vi-VN", { maximumFractionDigits: 12 })} phút).`}</p>
                        <p>{r.acc.valid}/{r.s.accepted} tín hiệu hợp lệ / đã tiếp nhận.</p>
                        <p>{r.acc.accepted - r.acc.valid} tín hiệu có 0 phút làm việc; {Math.max(0, r.s.accepted - r.acc.accepted)} tín hiệu đã tiếp nhận thiếu hoặc sai mốc giao/nhận.</p>
                        <p>{ACCEPT_HINT}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
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
    <div className="rounded-2xl border bg-card overflow-x-auto shadow-sm">
      <div className="px-4 py-2.5 text-sm font-medium border-b">Theo dõi chăm sóc <span className="text-xs font-normal text-muted-foreground">— tình trạng hiện tại, chỉ để nhắc việc</span></div>
      {rows.length === 0 ? <p className="p-3 text-sm text-muted-foreground">Không có tín hiệu cần kiểm tra.</p> : (
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2">Nhân viên</th><th className="px-4 py-2">Chưa tiếp nhận</th><th className="px-4 py-2">Lâu chưa cập nhật</th></tr></thead>
          <tbody>{rows.map(([id, r]) => (
            <tr key={id} className="border-t"><td className="px-4 py-2">{name(id)}</td><td className="px-4 py-2">{link(id, "unaccepted", r.u)}</td><td className="px-4 py-2">{link(id, "stale", r.s)}</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
