import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpDown, Download, Search, SlidersHorizontal, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useCurrentUser } from "@/lib/auth";
import { oqApi } from "@/lib/orderQuotes/api";
import { vnDateTime } from "@/lib/orderQuotes/logic";
import { vnToday } from "@/lib/kpi/timeframe";
import { Explain, EXPLAIN } from "@/components/orderQuotes/JobTimes";
import {
  aggregate, baseFilter, BUCKETS, DEFAULT_FILTERS, distribution, fmtDur, groupBy, inSpeed, KIND_LABEL, measureOf, MEASURE_LABEL, pct,
  PRESET_LABEL, PRESETS, presetRange, speedDenominator, speedLabel, STATUS_LABEL, THRESHOLDS, timeSeries, toBounds, toMin,
  type Agg, type Filters, type Measure, type Preset, type Row, type Speed,
} from "@/lib/orderQuotes/report";

export const Route = createFileRoute("/order-quotes/report")({
  head: () => ({ meta: [
    { title: "Báo cáo Hỏi Giá & Tiến Độ — Đơn hàng" },
    { name: "description", content: "Thống kê số lượng, tốc độ báo giá và hiệu suất Cung ứng, theo Sale cho Hỏi Giá & Tiến Độ." },
    { property: "og:title", content: "Báo cáo Hỏi Giá & Tiến Độ" },
    { property: "og:description", content: "Khối lượng công việc và tốc độ xử lý báo giá của từng nhân viên Cung ứng." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequirePermission perm={["oq.report_own", "oq.report_all"]}><Report /></RequirePermission>,
});

type Basis = "sent" | "completed";
type Applied = Filters & { preset: Preset; custom: [string, string]; basis: Basis };
type Mode = "overview" | "supplier" | "sale";
type Drill = { title: string; rows: Row[] } | null;
const BASIS_LABEL: Record<Basis, string> = { sent: "Theo ngày Sale gửi", completed: "Theo ngày hoàn thành" };
const STATUSES = Object.keys(STATUS_LABEL) as Row["status"][];

function Report() {
  const { can } = useCurrentUser();
  const [mode, setMode] = useState<Mode>("overview");
  const init: Applied = { ...DEFAULT_FILTERS, measure: "response", preset: "month", custom: ["", ""], basis: "sent" };
  const [applied, setApplied] = useState<Applied>(init);
  const [basisTouched, setBasisTouched] = useState(false);
  const [drill, setDrill] = useState<Drill>(null);
  const [staff, setStaff] = useState<{ id: string; name: string; key: "assignee_id" | "creator_id" } | null>(null);

  const range = presetRange(applied.preset, vnToday(), applied.custom);
  const bounds = toBounds(range);
  const q = useQuery({ queryKey: ["oq-report", bounds, applied.basis], queryFn: () => oqApi.report(bounds.from, bounds.to, applied.basis), staleTime: 60_000 });
  const all = q.data ?? [];
  const rows = useMemo(() => baseFilter(all, applied), [all, applied]);
  const scope = all[0]?.scope ?? (can("oq.report_all") ? "all" : "own");

  const switchMode = (m: Mode) => {
    setMode(m); setDrill(null);
    // Tốc độ mặc định theo ngày hoàn thành + cách đo B; số lượng mặc định theo ngày gửi + cách đo A.
    if (!basisTouched) setApplied((a) => ({ ...a, basis: m === "supplier" ? "completed" : "sent", measure: m === "supplier" ? "process" : "response" }));
  };
  const people = useMemo(() => ({
    sales: groupBy(all, "creator_id").map((g) => ({ id: g.id, name: g.name })),
    sups: groupBy(all, "assignee_id").map((g) => ({ id: g.id, name: g.name })),
  }), [all]);

  const exportXlsx = async () => {
    try {
      const data = baseFilter(await oqApi.report(bounds.from, bounds.to, applied.basis, true), applied);
      doExport(data, applied, range, mode);
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="min-w-0">
      <PageHeader title="Báo cáo thống kê" description="Hỏi Giá & Tiến Độ — khối lượng công việc và tốc độ xử lý."
        actions={<div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/order-quotes"><ArrowLeft className="h-4 w-4 mr-1" />Danh sách</Link></Button>
          {can("oq.report_export") && <Button variant="outline" onClick={exportXlsx} disabled={!all.length}><Download className="h-4 w-4 mr-1" />Xuất Excel</Button>}
        </div>} />
      <Tabs value={mode} onValueChange={(v) => switchMode(v as Mode)} className="mb-3">
        <TabsList className="grid w-full grid-cols-3 h-11 sm:inline-flex sm:w-auto sm:h-10">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger><TabsTrigger value="supplier">Hiệu suất Cung ứng</TabsTrigger><TabsTrigger value="sale">Theo Sale</TabsTrigger>
        </TabsList>
      </Tabs>
      <FilterBar applied={applied} people={people} onApply={(a) => { if (a.basis !== applied.basis) setBasisTouched(true); setApplied(a); setDrill(null); }} onClear={() => { setApplied({ ...init, basis: applied.basis, measure: applied.measure }); setDrill(null); }} />
      <p className="text-xs text-muted-foreground mb-3">
        Phạm vi: {scope === "all" ? "toàn bộ" : "cá nhân (yêu cầu bạn tạo hoặc phụ trách)"} · Đơn vị đếm: <b>lượt xử lý</b>{applied.rounds === "all" ? " (gồm lượt hỏi lại — không phải số yêu cầu gốc)" : applied.rounds === "first" ? " (chỉ lần hỏi đầu)" : " (chỉ lượt hỏi lại)"}
      </p>

      {q.error ? (
        <div className="rounded-lg border border-destructive/40 p-6 text-center text-sm space-y-2"><p>{(q.error as Error).message}</p><Button size="sm" variant="outline" onClick={() => q.refetch()}>Thử lại</Button></div>
      ) : q.isLoading ? <p className="text-sm text-muted-foreground">Đang tải…</p> : drill ? (
        <DetailList drill={drill} measure={applied.measure} onBack={() => setDrill(null)} />
      ) : mode === "overview" ? (
        <Overview rows={rows} f={applied} range={range} onDrill={setDrill} />
      ) : mode === "supplier" ? (
        <Supplier rows={rows} f={applied} onDrill={setDrill} onStaff={(id, name) => setStaff({ id, name, key: "assignee_id" })} />
      ) : (
        <Sales rows={rows} onStaff={(id, name) => setStaff({ id, name, key: "creator_id" })} />
      )}

      <Sheet open={!!staff} onOpenChange={(o) => !o && setStaff(null)}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          {staff && <StaffDetail title={staff.name} isSale={staff.key === "creator_id"} rows={rows.filter((r) => r[staff.key] === staff.id)} f={applied}
            onDrill={(d) => { setStaff(null); setDrill(d); }} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ================= Bộ lọc =================
function FilterBar({ applied, people, onApply, onClear }: { applied: Applied; people: { sales: { id: string; name: string }[]; sups: { id: string; name: string }[] }; onApply: (a: Applied) => void; onClear: () => void }) {
  const [d, setD] = useState<Applied>(applied);
  const [open, setOpen] = useState(false);
  const sync = (o: boolean) => { if (o) setD(applied); setOpen(o); };
  const set = <K extends keyof Applied>(k: K, v: Applied[K]) => setD((x) => ({ ...x, [k]: v }));
  const range = presetRange(applied.preset, vnToday(), applied.custom);
  const f2 = (s: string) => s.split("-").reverse().join("/");
  const chips: string[] = [
    `${PRESET_LABEL[applied.preset]} (${f2(range[0])} – ${f2(range[1])})`, BASIS_LABEL[applied.basis],
    applied.kind !== "all" ? KIND_LABEL[applied.kind] : "", applied.statuses.map((s) => STATUS_LABEL[s]).join(", "),
    applied.sales.length ? `Sale: ${applied.sales.map((id) => people.sales.find((p) => p.id === id)?.name ?? "?").join(", ")}` : "",
    applied.suppliers.length ? `Cung ứng: ${applied.suppliers.map((id) => people.sups.find((p) => p.id === id)?.name ?? "?").join(", ")}` : "",
    applied.rounds === "first" ? "Chỉ lần hỏi đầu" : applied.rounds === "reask" ? "Chỉ lượt hỏi lại" : "",
    applied.speed ? `Hoàn thành ${speedLabel(applied.speed)}` : "",
  ].filter(Boolean);

  const body = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_button[role=combobox]]:h-11 lg:[&_button[role=combobox]]:h-10">
      <Field label="Thời gian">
        <Select value={d.preset} onValueChange={(v) => set("preset", v as Preset)}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PRESETS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
        {d.preset === "custom" && <div className="grid grid-cols-2 gap-1 mt-1">
          <Input type="date" value={d.custom[0]} onChange={(e) => set("custom", [e.target.value, d.custom[1]])} aria-label="Từ ngày" className="px-2" />
          <Input type="date" value={d.custom[1]} onChange={(e) => set("custom", [d.custom[0], e.target.value])} aria-label="Đến ngày" className="px-2" />
        </div>}
      </Field>
      <Field label="Mốc thời gian">
        <Select value={d.basis} onValueChange={(v) => set("basis", v as Basis)}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="sent">{BASIS_LABEL.sent}</SelectItem><SelectItem value="completed">{BASIS_LABEL.completed}</SelectItem></SelectContent></Select>
      </Field>
      <Field label="Nghiệp vụ">
        <Select value={d.kind} onValueChange={(v) => set("kind", v as Filters["kind"])}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="price">Hỏi Giá</SelectItem><SelectItem value="progress">Hỏi Tiến Độ</SelectItem></SelectContent></Select>
      </Field>
      <Field label="Lượt xử lý">
        <Select value={d.rounds} onValueChange={(v) => set("rounds", v as Filters["rounds"])}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tất cả lượt xử lý</SelectItem><SelectItem value="first">Chỉ lần hỏi đầu tiên</SelectItem><SelectItem value="reask">Chỉ các lượt hỏi lại</SelectItem></SelectContent></Select>
      </Field>
      <Field label="Trạng thái"><Multi options={STATUSES.map((s) => ({ id: s, name: STATUS_LABEL[s] }))} value={d.statuses} onChange={(v) => set("statuses", v as Row["status"][])} all="Mọi trạng thái" /></Field>
      <Field label="Sale"><Multi options={people.sales} value={d.sales} onChange={(v) => set("sales", v)} all="Mọi Sale" /></Field>
      <Field label="Cung ứng"><Multi options={people.sups} value={d.suppliers} onChange={(v) => set("suppliers", v)} all="Mọi Cung ứng" /></Field>
      <Field label="Thời gian hoàn thành báo giá"><SpeedPicker value={d.speed} onChange={(v) => set("speed", v)} /></Field>
      <Field label="Cách đo thời gian" className="sm:col-span-2">
        <Select value={d.measure} onValueChange={(v) => set("measure", v as Measure)}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="response">A. {MEASURE_LABEL.response}</SelectItem><SelectItem value="process">B. {MEASURE_LABEL.process}</SelectItem></SelectContent></Select>
      </Field>
    </div>
  );
  const actions = (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
      <Button variant="outline" className="h-11 sm:h-10" onClick={() => { onClear(); setOpen(false); }}>Xóa bộ lọc</Button>
      <Button className="h-11 sm:h-10" onClick={() => { onApply(d); setOpen(false); }}>Áp dụng</Button>
    </div>
  );
  return (
    <div className="mb-2">
      <Card className="hidden lg:block mb-2"><CardContent className="p-4 space-y-3">{body}{actions}</CardContent></Card>
      <Sheet open={open} onOpenChange={sync}>
        <Button variant="outline" className="lg:hidden w-full h-11 mb-2" onClick={() => sync(true)}><SlidersHorizontal className="h-4 w-4 mr-1" />Bộ lọc</Button>
        <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto rounded-t-xl pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader><SheetTitle>Bộ lọc báo cáo</SheetTitle></SheetHeader>
          <div className="py-4">{body}</div>{actions}
        </SheetContent>
      </Sheet>
      <div className="flex flex-wrap gap-1">{chips.map((c) => <Badge key={c} variant="secondary" className="font-normal">{c}</Badge>)}</div>
      <p className="text-xs text-muted-foreground mt-1">Cách đo: <b>{applied.measure === "response" ? "A. " : "B. "}{MEASURE_LABEL[applied.measure]}</b></p>
    </div>
  );
}
const Field = ({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) => (
  <div className={`space-y-1 min-w-0 ${className}`}><div className="text-xs font-medium text-muted-foreground">{label}</div>{children}</div>
);
function Multi({ options, value, onChange, all }: { options: { id: string; name: string }[]; value: string[]; onChange: (v: string[]) => void; all: string }) {
  const label = value.length === 0 ? all : value.length === 1 ? options.find((o) => o.id === value[0])?.name ?? "1 mục" : `${value.length} đã chọn`;
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between font-normal"><span className="truncate">{label}</span>{value.length > 0 && <X className="h-3.5 w-3.5 opacity-60" onClick={(e) => { e.stopPropagation(); onChange([]); }} />}</Button></PopoverTrigger>
      <PopoverContent className="w-64 p-2 max-h-72 overflow-y-auto">
        {options.length === 0 && <p className="text-xs text-muted-foreground p-2">Chưa có dữ liệu trong kỳ.</p>}
        {options.map((o) => (
          <label key={o.id} className="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-accent cursor-pointer">
            <Checkbox checked={value.includes(o.id)} onCheckedChange={(c) => onChange(c ? [...value, o.id] : value.filter((x) => x !== o.id))} />{o.name}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
function SpeedPicker({ value, onChange }: { value: Speed; onChange: (v: Speed) => void }) {
  const preset = !value ? "none" : value.min == null && THRESHOLDS.some(([m]) => m === value.max) ? String(value.max) : "custom";
  return (
    <div className="space-y-1">
      <Select value={preset} onValueChange={(v) => onChange(v === "none" ? null : v === "custom" ? { min: null, max: null } : { max: Number(v) })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="none">Không lọc</SelectItem>{THRESHOLDS.map(([m, l]) => <SelectItem key={m} value={String(m)}>{l}</SelectItem>)}<SelectItem value="custom">Tùy chỉnh</SelectItem></SelectContent>
      </Select>
      {preset === "custom" && <div className="grid grid-cols-2 gap-1">
        <Input type="number" min={0} inputMode="numeric" placeholder="Tối thiểu (phút)" value={value?.min ?? ""} onChange={(e) => onChange({ ...value, min: e.target.value === "" ? null : Number(e.target.value) })} />
        <Input type="number" min={0} inputMode="numeric" placeholder="Tối đa (phút)" value={value?.max ?? ""} onChange={(e) => onChange({ ...value, max: e.target.value === "" ? null : Number(e.target.value) })} />
      </div>}
    </div>
  );
}

// ================= Thẻ chỉ số =================
function Stat({ label, value, hint, onClick, sub }: { label: string; value: ReactNode; hint?: string; onClick?: () => void; sub?: string }) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className={`rounded-lg border bg-card p-3 text-left min-w-0 ${onClick ? "hover:border-primary/60 hover:bg-accent/40 transition-colors" : ""}`}>
      <div className="text-xs text-muted-foreground flex items-center gap-1">{label}{hint && <span onClick={(e) => e.stopPropagation()}><Explain text={hint} /></span>}</div>
      <div className="text-xl font-semibold mt-1 truncate">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Comp>
  );
}
const dur = (v: number | null, n: number) => (n === 0 ? <span className="text-sm font-normal text-muted-foreground">Không có dữ liệu</span> : v == null ? <span className="text-sm font-normal text-muted-foreground">Chưa đủ dữ liệu</span> : fmtDur(v));

function SpeedStat({ a, f, onClick }: { a: Agg; f: Filters; onClick: () => void }) {
  const den = speedDenominator(a, f.measure);
  return f.speed
    ? <Stat label={`Hoàn thành ${speedLabel(f.speed)}`} value={den ? `${a.inSpeed}/${den} · ${pct(a.inSpeed, den)}` : <span className="text-sm font-normal text-muted-foreground">Không có dữ liệu</span>} sub={f.measure === "response" ? "Cách đo A" : "Cách đo B"} onClick={onClick} />
    : <Stat label="Tỷ lệ trong ngưỡng" value={<span className="text-sm font-normal text-muted-foreground">Chọn ngưỡng trong bộ lọc</span>} />;
}

// ================= Tổng quan =================
function Overview({ rows, f, range, onDrill }: { rows: Row[]; f: Applied; range: [string, string]; onDrill: (d: Drill) => void }) {
  const a = aggregate(rows, f);
  const done = rows.filter((r) => r.status === "answered");
  const [series, setSeries] = useState<Basis>("sent");
  const ts = timeSeries(rows, range, series);
  const reqCount = (k: "price" | "progress") => new Set(rows.filter((r) => r.kind === k).map((r) => r.request_id)).size;
  return (
    <div className="space-y-4">
      <Section title="Số lượng">
        <Stat label="Hỏi Giá" value={rows.filter((r) => r.kind === "price").length} sub={`lượt · ${reqCount("price")} yêu cầu gốc`} onClick={() => onDrill({ title: "Lượt Hỏi Giá", rows: rows.filter((r) => r.kind === "price") })} />
        <Stat label="Hỏi Tiến Độ" value={rows.filter((r) => r.kind === "progress").length} sub={`lượt · ${reqCount("progress")} yêu cầu gốc`} onClick={() => onDrill({ title: "Lượt Hỏi Tiến Độ", rows: rows.filter((r) => r.kind === "progress") })} />
        <Stat label="Báo giá hoàn thành" value={a.donePrice} sub="lượt" onClick={() => onDrill({ title: "Báo giá hoàn thành", rows: done.filter((r) => r.kind === "price") })} />
        <Stat label="Tiến độ hoàn thành" value={a.doneProgress} sub="lượt" onClick={() => onDrill({ title: "Tiến độ hoàn thành", rows: done.filter((r) => r.kind === "progress") })} />
      </Section>
      <Section title="Công việc tồn">
        <Stat label="Chờ xác nhận" value={a.pending} onClick={() => onDrill({ title: "Chờ xác nhận", rows: rows.filter((r) => r.status === "pending") })} />
        <Stat label="Đang xử lý" value={a.processing} onClick={() => onDrill({ title: "Đang xử lý", rows: rows.filter((r) => r.status === "processing") })} />
        <Stat label="Đang chờ Sale bổ sung" value={a.waiting} onClick={() => onDrill({ title: "Đang chờ Sale bổ sung", rows: rows.filter((r) => r.status === "waiting_sale") })} />
      </Section>
      <Section title="Tốc độ (chỉ lượt đã hoàn thành)">
        <Stat label="Phản hồi trung bình" hint={EXPLAIN.response} value={dur(a.avgResponse, a.done)} />
        <Stat label="Cung ứng xử lý trung bình" hint={EXPLAIN.process} value={dur(a.avgProcess, a.done)} />
        <Stat label="Cung ứng xử lý trung vị" hint="Giá trị ở giữa khi xếp các lượt theo thời gian Cung ứng xử lý — ít bị ảnh hưởng bởi lượt quá dài." value={dur(a.medProcess, a.done)} />
        <SpeedStat a={a} f={f} onClick={() => onDrill({ title: `Hoàn thành ${speedLabel(f.speed)}`, rows: done.filter((r) => inSpeed(measureOf(r, f.measure), f.speed)) })} />
      </Section>
      <Card>
        <CardHeader className="pb-2 flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Số lượng theo {ts.unit === "day" ? "ngày" : ts.unit === "week" ? "tuần" : "tháng"}</CardTitle>
          <Tabs value={series} onValueChange={(v) => setSeries(v as Basis)}><TabsList className="h-9"><TabsTrigger value="sent">Lượt gửi</TabsTrigger><TabsTrigger value="completed">Lượt hoàn thành</TabsTrigger></TabsList></Tabs>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">{series === "sent" ? "Đếm theo thời điểm Sale gửi (giờ Việt Nam)" : "Đếm theo thời điểm hoàn thành (giờ Việt Nam)"}{f.basis !== series ? ` · dữ liệu được lấy ${BASIS_LABEL[f.basis].toLowerCase()} trong kỳ` : ""}.</p>
          <ChartContainer config={KIND_CHART} className="h-56 w-full aspect-auto">
            <BarChart data={ts.pts}><CartesianGrid vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} fontSize={11} /><YAxis allowDecimals={false} width={28} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="price" fill="var(--color-price)" radius={3} /><Bar dataKey="progress" fill="var(--color-progress)" radius={3} /></BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <DistributionCard rows={rows} measure={f.measure} onDrill={onDrill} />
    </div>
  );
}
const KIND_CHART = { price: { label: "Hỏi Giá", color: "hsl(var(--primary))" }, progress: { label: "Hỏi Tiến Độ", color: "hsl(var(--muted-foreground))" } } satisfies ChartConfig;
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div><h3 className="text-sm font-semibold mb-2">{title}</h3><div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{children}</div></div>
);

function DistributionCard({ rows, measure, onDrill }: { rows: Row[]; measure: Measure; onDrill: (d: Drill) => void }) {
  const dist = distribution(rows, measure);
  const total = dist.reduce((s, b) => s + b.n, 0);
  const cfg = { n: { label: "Số lượt", color: "hsl(var(--primary))" } } satisfies ChartConfig;
  const open = (key: string) => { const b = BUCKETS.find((x) => x.key === key)!; onDrill({ title: `Hoàn thành ${b.label} (${measure === "response" ? "cách đo A" : "cách đo B"})`, rows: rows.filter((r) => { const v = measureOf(r, measure); return r.status === "answered" && v != null && v > b.lo && v <= b.hi; }) }); };
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Phân bố tốc độ hoàn thành</CardTitle>
        <p className="text-xs text-muted-foreground">{MEASURE_LABEL[measure]} · {total} lượt đã hoàn thành · bấm cột hoặc dòng để xem chi tiết.</p></CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? <p className="text-sm text-muted-foreground">Không có lượt hoàn thành trong kỳ.</p> : <>
          <ChartContainer config={cfg} className="h-52 w-full aspect-auto">
            <BarChart data={dist.map((b) => ({ ...b, short: b.label.replace(" phút", "p").replace(" giờ", "h") }))}>
              <CartesianGrid vertical={false} /><XAxis dataKey="short" tickLine={false} axisLine={false} interval={0} fontSize={10} /><YAxis allowDecimals={false} width={28} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent labelKey="label" />} />
              <Bar dataKey="n" fill="var(--color-n)" radius={3} className="cursor-pointer" onClick={(d: any) => open(d.key)} />
            </BarChart>
          </ChartContainer>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs">{dist.map((b) => (
            <button key={b.key} disabled={!b.n} onClick={() => open(b.key)} className="flex justify-between rounded border px-2 py-1.5 enabled:hover:bg-accent disabled:opacity-50">
              <span>{b.label}</span><span className="font-medium">{b.n} · {pct(b.n, total)}</span></button>))}</div>
        </>}
      </CardContent>
    </Card>
  );
}

// ================= Hiệu suất Cung ứng =================
type SupRow = { id: string; name: string; rows: Row[]; a: Agg; den: number };
function Supplier({ rows, f, onDrill, onStaff }: { rows: Row[]; f: Applied; onDrill: (d: Drill) => void; onStaff: (id: string, name: string) => void }) {
  const a = aggregate(rows, f);
  const list: SupRow[] = groupBy(rows, "assignee_id").map((g) => { const ag = aggregate(g.rows, f); return { ...g, a: ag, den: speedDenominator(ag, f.measure) }; });
  const [sort, setSort] = useState<{ k: string; asc: boolean }>({ k: "done", asc: false });
  const val = (r: SupRow): number => ({ done: r.a.done, resp: r.a.avgResponse ?? Infinity, proc: r.a.avgProcess ?? Infinity, inS: r.a.inSpeed, rate: r.den ? r.a.inSpeed / r.den : -1 } as any)[sort.k] ?? r.name;
  const sorted = [...list].sort((x, y) => sort.k === "name" ? x.name.localeCompare(y.name, "vi") * (sort.asc ? 1 : -1) : (val(x) - val(y)) * (sort.asc ? 1 : -1));
  const H = ({ k, children }: { k: string; children: ReactNode }) => (
    <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setSort({ k, asc: sort.k === k ? !sort.asc : k === "resp" || k === "proc" })}>{children}<ArrowUpDown className="h-3 w-3" /></button>
  );
  const done = (r: Row[]) => r.filter((x) => x.status === "answered");
  const inS = (r: Row[]) => done(r).filter((x) => inSpeed(measureOf(x, f.measure), f.speed));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Stat label="Lượt hoàn thành" value={a.done} onClick={() => onDrill({ title: "Lượt hoàn thành", rows: done(rows) })} />
        <Stat label="Cung ứng xử lý trung bình" hint={EXPLAIN.process} value={dur(a.avgProcess, a.done)} />
        <Stat label="Phản hồi trung bình" hint={EXPLAIN.response} value={dur(a.avgResponse, a.done)} />
        <SpeedStat a={a} f={f} onClick={() => onDrill({ title: `Hoàn thành ${speedLabel(f.speed)}`, rows: inS(rows) })} />
      </div>
      <DistributionCard rows={rows} measure={f.measure} onDrill={onDrill} />
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Hiệu suất nhân viên Cung ứng</CardTitle>
          <p className="text-xs text-muted-foreground">Ghi nhận theo người phụ trách khi hoàn tất lượt. Số liệu tham khảo, không phải đánh giá. Bấm tên để xem chi tiết, bấm số để xem danh sách lượt.</p></CardHeader>
        <CardContent className="p-0 sm:p-0">
          {list.length === 0 ? <p className="p-6 text-sm text-muted-foreground">Không có dữ liệu trong kỳ.</p> : <>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="text-xs">
                  <TableHead><H k="name">Nhân viên</H></TableHead><TableHead className="text-right">Được giao</TableHead><TableHead className="text-right">Đã tiếp nhận</TableHead>
                  <TableHead className="text-right"><H k="done">Báo giá HT</H></TableHead><TableHead className="text-right">Tiến độ HT</TableHead><TableHead className="text-right">Chưa HT</TableHead>
                  <TableHead className="text-right"><H k="resp">Phản hồi TB</H></TableHead><TableHead className="text-right"><H k="proc">Xử lý TB</H></TableHead><TableHead className="text-right">Xử lý trung vị</TableHead>
                  <TableHead className="text-right"><H k="inS">Trong ngưỡng</H></TableHead><TableHead className="text-right"><H k="rate">Tỷ lệ</H></TableHead>
                </TableRow></TableHeader>
                <TableBody>{sorted.map((s) => (
                  <TableRow key={s.id} className="text-sm">
                    <TableCell><button className="font-medium hover:underline text-left" onClick={() => onStaff(s.id, s.name)}>{s.name}</button>{s.a.handovers > 0 && <div className="text-[11px] text-muted-foreground">{s.a.handovers} lượt có chuyển giao</div>}</TableCell>
                    <Num n={s.a.total} onClick={() => onDrill({ title: `${s.name} — lượt được giao`, rows: s.rows })} />
                    <Num n={s.a.accepted} onClick={() => onDrill({ title: `${s.name} — đã tiếp nhận`, rows: s.rows.filter((r) => r.accepted_at) })} />
                    <Num n={s.a.donePrice} onClick={() => onDrill({ title: `${s.name} — báo giá hoàn thành`, rows: done(s.rows).filter((r) => r.kind === "price") })} />
                    <Num n={s.a.doneProgress} onClick={() => onDrill({ title: `${s.name} — tiến độ hoàn thành`, rows: done(s.rows).filter((r) => r.kind === "progress") })} />
                    <Num n={s.a.open} onClick={() => onDrill({ title: `${s.name} — chưa hoàn thành`, rows: s.rows.filter((r) => !["answered", "cancelled"].includes(r.status)) })} />
                    <TableCell className="text-right whitespace-nowrap">{dur(s.a.avgResponse, s.a.done)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{dur(s.a.avgProcess, s.a.done)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{dur(s.a.medProcess, s.a.done)}</TableCell>
                    {f.speed ? <Num n={s.a.inSpeed} suffix={`/${s.den}`} onClick={() => onDrill({ title: `${s.name} — hoàn thành ${speedLabel(f.speed)}`, rows: inS(s.rows) })} /> : <TableCell className="text-right text-muted-foreground">—</TableCell>}
                    <TableCell className="text-right">{f.speed ? pct(s.a.inSpeed, s.den) : "—"}</TableCell>
                  </TableRow>))}</TableBody>
              </Table>
            </div>
            <div className="md:hidden divide-y">{sorted.map((s) => (
              <button key={s.id} className="w-full text-left p-3 active:bg-accent" onClick={() => onStaff(s.id, s.name)}>
                <div className="font-semibold">{s.name}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-1">
                  <span className="text-muted-foreground">Báo giá hoàn thành</span><span className="font-medium">{s.a.donePrice}</span>
                  <span className="text-muted-foreground">Xử lý TB</span><span className="font-medium">{dur(s.a.avgProcess, s.a.done)}</span>
                  {f.speed && <><span className="text-muted-foreground">Trong ngưỡng</span><span className="font-medium">{s.a.inSpeed}/{s.den} · {pct(s.a.inSpeed, s.den)}</span></>}
                  <span className="text-muted-foreground">Chưa hoàn thành</span><span>{s.a.open}</span>
                </div>
              </button>))}</div>
          </>}
        </CardContent>
      </Card>
    </div>
  );
}
function Num({ n, onClick, suffix = "" }: { n: number; onClick: () => void; suffix?: string }) {
  return <TableCell className="text-right">{n ? <button onClick={onClick} className="text-primary underline-offset-2 hover:underline font-medium">{n}{suffix}</button> : <span className="text-muted-foreground">0{suffix}</span>}</TableCell>;
}

// ================= Theo Sale =================
function Sales({ rows, onStaff }: { rows: Row[]; onStaff: (id: string, name: string) => void }) {
  const list = groupBy(rows, "creator_id").map((g) => {
    const done = g.rows.filter((r) => r.status === "answered");
    const resp = done.map((r) => r.response_sec).filter((v): v is number => v != null);
    return { ...g, price: new Set(g.rows.filter((r) => r.kind === "price").map((r) => r.request_id)).size, progress: new Set(g.rows.filter((r) => r.kind === "progress").map((r) => r.request_id)).size,
      done: done.length, open: g.rows.filter((r) => !["answered", "cancelled"].includes(r.status)).length, info: g.rows.filter((r) => r.info_count > 0).length,
      wait: resp.length ? resp.reduce((a, b) => a + b, 0) / resp.length : null };
  }).sort((a, b) => b.rows.length - a.rows.length);
  if (!list.length) return <p className="text-sm text-muted-foreground">Không có dữ liệu trong kỳ.</p>;
  return (
    <Card><CardContent className="p-0">
      <div className="hidden md:block overflow-x-auto"><Table>
        <TableHeader><TableRow className="text-xs"><TableHead>Nhân viên Sale</TableHead><TableHead className="text-right">Yêu cầu Hỏi Giá</TableHead><TableHead className="text-right">Yêu cầu Hỏi Tiến Độ</TableHead>
          <TableHead className="text-right">Lượt hoàn thành</TableHead><TableHead className="text-right">Lượt chưa HT</TableHead><TableHead className="text-right">Lượt phải bổ sung</TableHead><TableHead className="text-right">Chờ báo giá TB</TableHead></TableRow></TableHeader>
        <TableBody>{list.map((s) => (
          <TableRow key={s.id} className="cursor-pointer" onClick={() => onStaff(s.id, s.name)}>
            <TableCell className="font-medium">{s.name}</TableCell><TableCell className="text-right">{s.price}</TableCell><TableCell className="text-right">{s.progress}</TableCell>
            <TableCell className="text-right">{s.done}</TableCell><TableCell className="text-right">{s.open}</TableCell><TableCell className="text-right">{s.info}</TableCell>
            <TableCell className="text-right whitespace-nowrap">{dur(s.wait, s.done)}</TableCell>
          </TableRow>))}</TableBody>
      </Table></div>
      <div className="md:hidden divide-y">{list.map((s) => (
        <button key={s.id} className="w-full text-left p-3 active:bg-accent" onClick={() => onStaff(s.id, s.name)}>
          <div className="font-semibold">{s.name}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-1">
            <span className="text-muted-foreground">Hỏi Giá / Tiến Độ</span><span>{s.price} / {s.progress} yêu cầu</span>
            <span className="text-muted-foreground">Hoàn thành / chưa</span><span>{s.done} / {s.open} lượt</span>
            <span className="text-muted-foreground">Chờ báo giá TB</span><span>{dur(s.wait, s.done)}</span>
          </div>
        </button>))}</div>
      <p className="text-xs text-muted-foreground p-3">Yêu cầu Hỏi Giá/Tiến Độ đếm theo yêu cầu gốc; hoàn thành/chưa/bổ sung đếm theo lượt xử lý. "Chờ báo giá TB" = thời gian phản hồi trung bình của lượt đã hoàn thành.</p>
    </CardContent></Card>
  );
}

// ================= Chi tiết nhân viên =================
function StaffDetail({ title, rows, f, isSale, onDrill }: { title: string; rows: Row[]; f: Applied; isSale: boolean; onDrill: (d: Drill) => void }) {
  const a = aggregate(rows, f);
  const den = speedDenominator(a, f.measure);
  return (
    <div className="space-y-4">
      <SheetHeader><SheetTitle>{title}</SheetTitle><p className="text-xs text-muted-foreground">{isSale ? "Các yêu cầu đã gửi" : "Hiệu suất Cung ứng"} trong bộ lọc hiện tại.</p></SheetHeader>
      <div className="grid grid-cols-2 gap-2">
        <Stat label={isSale ? "Lượt đã gửi" : "Lượt được giao"} value={a.total} />
        {!isSale && <Stat label="Đã tiếp nhận" value={a.accepted} />}
        <Stat label="Đã hoàn thành" value={a.done} /><Stat label="Chưa hoàn thành" value={a.open} />
        {!isSale && <Stat label="Chờ tiếp nhận TB" hint={EXPLAIN.accept} value={dur(a.avgAcceptWait, a.accepted)} />}
        <Stat label="Phản hồi TB" hint={EXPLAIN.response} value={dur(a.avgResponse, a.done)} />
        <Stat label="Cung ứng xử lý TB" hint={EXPLAIN.process} value={dur(a.avgProcess, a.done)} />
        <Stat label="Cung ứng xử lý trung vị" value={dur(a.medProcess, a.done)} />
        {f.speed && <Stat label={`Trong ngưỡng ${speedLabel(f.speed)}`} value={den ? `${a.inSpeed}/${den} · ${pct(a.inSpeed, den)}` : "—"} />}
        {!isSale && <Stat label="Lượt có chuyển giao" value={a.handovers} onClick={a.handovers ? () => onDrill({ title: `${title} — có chuyển giao`, rows: rows.filter((r) => r.handover) }) : undefined} />}
      </div>
      {!isSale && <DistributionCard rows={rows} measure={f.measure} onDrill={onDrill} />}
      <Button className="w-full" variant="outline" onClick={() => onDrill({ title: `${title} — tất cả lượt`, rows })}>Xem danh sách {rows.length} lượt</Button>
    </div>
  );
}

// ================= Danh sách chi tiết =================
function DetailList({ drill, measure, onBack }: { drill: NonNullable<Drill>; measure: Measure; onBack: () => void }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ k: "sent" | "resp" | "proc"; asc: boolean }>({ k: "sent", asc: false });
  const SIZE = 20;
  const s = q.trim().toLowerCase();
  const list = drill.rows.filter((r) => !s || [r.flow_code, r.title, r.creator_name, r.assignee_name].some((x) => x?.toLowerCase().includes(s)))
    .sort((x, y) => {
      const v = (r: Row) => sort.k === "sent" ? Date.parse(r.sent_at) : (sort.k === "resp" ? r.response_sec : r.process_sec) ?? Infinity;
      return (v(x) - v(y)) * (sort.asc ? 1 : -1);
    });
  const pages = Math.max(1, Math.ceil(list.length / SIZE));
  const view = list.slice(page * SIZE, page * SIZE + SIZE);
  const proc = (r: Row) => r.status !== "answered" ? "—" : r.data_ok ? fmtDur(r.process_sec) : "Chưa đủ dữ liệu";
  const link = (r: Row, c: ReactNode) => <Link to="/order-quotes/$id" params={{ id: r.request_id }} search={{ flow: r.flow_id }} className="hover:underline">{c}</Link>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" />Quay lại báo cáo</Button>
        <h3 className="font-semibold">{drill.title}</h3><Badge variant="secondary">{drill.rows.length} lượt</Badge>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1"><Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Mã, tên yêu cầu, Sale, Cung ứng" className="pl-8 h-10" /></div>
        <Select value={`${sort.k}:${sort.asc}`} onValueChange={(v) => { const [k, a] = v.split(":"); setSort({ k: k as any, asc: a === "true" }); }}>
          <SelectTrigger className="sm:w-56 h-10"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="sent:false">Mới gửi trước</SelectItem><SelectItem value="sent:true">Cũ trước</SelectItem>
            <SelectItem value="resp:true">Phản hồi nhanh nhất</SelectItem><SelectItem value="resp:false">Phản hồi chậm nhất</SelectItem>
            <SelectItem value="proc:true">Xử lý nhanh nhất</SelectItem><SelectItem value="proc:false">Xử lý chậm nhất</SelectItem></SelectContent>
        </Select>
      </div>
      {list.length === 0 ? <p className="text-sm text-muted-foreground">Không có lượt phù hợp.</p> : <>
        <div className="hidden lg:block rounded-lg border bg-card overflow-x-auto"><Table>
          <TableHeader><TableRow className="text-xs">
            <TableHead>Mã</TableHead><TableHead>Tên yêu cầu</TableHead><TableHead>Sale</TableHead><TableHead>Cung ứng</TableHead><TableHead className="text-center">SP/PA</TableHead><TableHead className="text-center">Lượt</TableHead>
            <TableHead>Sale gửi</TableHead><TableHead>Tiếp nhận</TableHead><TableHead>Hoàn thành</TableHead><TableHead>Phản hồi</TableHead><TableHead>Cung ứng xử lý</TableHead><TableHead>Chờ Sale</TableHead><TableHead>Trạng thái</TableHead>
          </TableRow></TableHeader>
          <TableBody>{view.map((r) => (
            <TableRow key={r.round_id} className="text-xs">
              <TableCell className="font-mono whitespace-nowrap">{link(r, r.flow_code)}</TableCell>
              <TableCell className="max-w-[200px] truncate font-medium">{link(r, r.title)}</TableCell>
              <TableCell>{r.creator_name}</TableCell><TableCell>{r.assignee_name}{r.handover && <div className="text-[10px] text-muted-foreground">Có chuyển giao</div>}</TableCell>
              <TableCell className="text-center">{r.items}</TableCell><TableCell className="text-center">{r.round_no}</TableCell>
              <TableCell className="whitespace-nowrap">{vnDateTime(r.sent_at)}</TableCell><TableCell className="whitespace-nowrap">{r.final_accepted_at ? vnDateTime(r.final_accepted_at) : "—"}</TableCell>
              <TableCell className="whitespace-nowrap">{r.completed_at && r.status === "answered" ? vnDateTime(r.completed_at) : "—"}</TableCell>
              <TableCell className="whitespace-nowrap">{r.status === "answered" ? fmtDur(r.response_sec) : "—"}</TableCell>
              <TableCell className="whitespace-nowrap">{proc(r)}</TableCell><TableCell className="whitespace-nowrap">{fmtDur(r.wait_sale_sec, "0")}</TableCell>
              <TableCell className="whitespace-nowrap">{STATUS_LABEL[r.status]}</TableCell>
            </TableRow>))}</TableBody>
        </Table></div>
        <div className="lg:hidden space-y-2">{view.map((r) => (
          <Link key={r.round_id} to="/order-quotes/$id" params={{ id: r.request_id }} search={{ flow: r.flow_id }} className="block rounded-lg border bg-card p-3 active:bg-accent">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><span className="font-semibold line-clamp-2">{r.title}</span><span className="font-mono text-xs text-muted-foreground">{r.flow_code}</span></div>
            <div className="text-xs text-muted-foreground mt-0.5">{KIND_LABEL[r.kind]} · Lượt {r.round_no} · {STATUS_LABEL[r.status]}{r.handover ? " · Có chuyển giao" : ""}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs mt-2">
              <span className="text-muted-foreground">Phản hồi</span><span className="font-medium">{r.status === "answered" ? fmtDur(r.response_sec) : "—"}</span>
              <span className="text-muted-foreground">Cung ứng xử lý</span><span className="font-medium">{proc(r)}</span>
              <span className="text-muted-foreground">Sale / Cung ứng</span><span className="truncate">{r.creator_name} / {r.assignee_name}</span>
              <span className="text-muted-foreground">Sale gửi</span><span>{vnDateTime(r.sent_at)}</span>
            </div>
          </Link>))}</div>
        {pages > 1 && <div className="flex items-center justify-center gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</Button><span>Trang {page + 1}/{pages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sau</Button></div>}
      </>}
      <p className="text-xs text-muted-foreground">Cách đo đang chọn: {MEASURE_LABEL[measure]}.</p>
    </div>
  );
}

// ================= Excel =================
function doExport(rows: Row[], f: Applied, range: [string, string], mode: Mode) {
  const f2 = (s: string) => s.split("-").reverse().join("/");
  const vn = (iso: string | null) => (iso ? vnDateTime(iso) : "");
  const title = `Báo cáo Hỏi Giá & Tiến Độ · ${f2(range[0])} – ${f2(range[1])} · ${BASIS_LABEL[f.basis]}`;
  const cond = [`Nghiệp vụ: ${f.kind === "all" ? "Tất cả" : KIND_LABEL[f.kind]}`, `Lượt: ${f.rounds === "all" ? "Tất cả lượt xử lý" : f.rounds === "first" ? "Lần hỏi đầu" : "Lượt hỏi lại"}`,
    `Trạng thái: ${f.statuses.length ? f.statuses.map((s) => STATUS_LABEL[s]).join(", ") : "Tất cả"}`, `Ngưỡng: ${f.speed ? speedLabel(f.speed) : "Không lọc"}`, `Cách đo: ${MEASURE_LABEL[f.measure]}`,
    `Xuất lúc ${vnDateTime(new Date().toISOString())} (giờ Việt Nam, UTC+7)`].join(" · ");
  const a = aggregate(rows, f);
  const wb = XLSX.utils.book_new();
  const add = (name: string, aoa: any[][]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], [cond], [], ...aoa]), name);
  add("Tổng quan", [["Chỉ số", "Giá trị", "Ghi chú"],
    ["Lượt Hỏi Giá", rows.filter((r) => r.kind === "price").length, "lượt xử lý"], ["Lượt Hỏi Tiến Độ", rows.filter((r) => r.kind === "progress").length, "lượt xử lý"],
    ["Báo giá hoàn thành", a.donePrice, ""], ["Tiến độ hoàn thành", a.doneProgress, ""], ["Chờ xác nhận", a.pending, ""], ["Đang xử lý", a.processing, ""], ["Chờ Sale bổ sung", a.waiting, ""],
    ["Phản hồi TB (phút)", toMin(a.avgResponse) ?? "Không có dữ liệu", "chỉ lượt hoàn thành"], ["Cung ứng xử lý TB (phút)", toMin(a.avgProcess) ?? "Không có dữ liệu", ""], ["Cung ứng xử lý trung vị (phút)", toMin(a.medProcess) ?? "Không có dữ liệu", ""],
    ...(f.speed ? [[`Trong ngưỡng ${speedLabel(f.speed)}`, `${a.inSpeed}/${speedDenominator(a, f.measure)}`, pct(a.inSpeed, speedDenominator(a, f.measure))]] : [])]);
  if (mode !== "sale") add("Hiệu suất Cung ứng", [["Nhân viên", "Được giao", "Đã tiếp nhận", "Báo giá HT", "Tiến độ HT", "Chưa HT", "Phản hồi TB (phút)", "Xử lý TB (phút)", "Xử lý trung vị (phút)", "Trong ngưỡng", "Tỷ lệ"],
    ...groupBy(rows, "assignee_id").map((g) => { const x = aggregate(g.rows, f), d = speedDenominator(x, f.measure);
      return [g.name, x.total, x.accepted, x.donePrice, x.doneProgress, x.open, toMin(x.avgResponse) ?? "", toMin(x.avgProcess) ?? "", toMin(x.medProcess) ?? "", f.speed ? `${x.inSpeed}/${d}` : "", f.speed ? pct(x.inSpeed, d) : ""]; })]);
  if (mode === "sale" || mode === "overview") add("Theo Sale", [["Nhân viên Sale", "Lượt gửi", "Lượt hoàn thành", "Lượt chưa HT", "Lượt phải bổ sung", "Phản hồi TB (phút)"],
    ...groupBy(rows, "creator_id").map((g) => { const x = aggregate(g.rows, f); return [g.name, x.total, x.done, x.open, x.infoRounds, toMin(x.avgResponse) ?? ""]; })]);
  add("Chi tiết lượt", [["Mã", "Tên yêu cầu", "Nghiệp vụ", "Sale", "Cung ứng", "Có chuyển giao", "SP/PA", "Lượt", "Sale gửi", "Tiếp nhận", "Hoàn thành", "Phản hồi", "Phản hồi (phút)", "Cung ứng xử lý", "Cung ứng xử lý (phút)", "Chờ Sale (phút)", "Trạng thái"],
    ...rows.map((r) => [r.flow_code, r.title, KIND_LABEL[r.kind], r.creator_name, r.assignee_name, r.handover ? "Có" : "", r.items, r.round_no, vn(r.sent_at), vn(r.final_accepted_at), r.status === "answered" ? vn(r.completed_at) : "",
      r.status === "answered" ? fmtDur(r.response_sec) : "", r.status === "answered" ? toMin(r.response_sec) : "", r.status === "answered" ? (r.data_ok ? fmtDur(r.process_sec) : "Chưa đủ dữ liệu") : "",
      r.status === "answered" ? toMin(r.process_sec) : "", toMin(r.wait_sale_sec), STATUS_LABEL[r.status]])]);
  XLSX.writeFile(wb, `bao-cao-hoi-gia-tien-do_${range[0]}_${range[1]}.xlsx`);
}
