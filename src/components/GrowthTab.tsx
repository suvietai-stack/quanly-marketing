import { useMemo, useState } from "react";
import {
  useStore, fmtDate, todayISO, uid,
  GROWTH_PERIOD_TYPES, type GrowthMetric, type GrowthPeriodType,
} from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, ExternalLink, TrendingUp, TrendingDown, Minus,
} from "lucide-react";

function sortMetrics(arr: GrowthMetric[]): GrowthMetric[] {
  // newest first by periodKey or updatedAt fallback
  return [...arr].sort((a, b) => {
    const ka = a.periodKey || a.updatedAt || "";
    const kb = b.periodKey || b.updatedAt || "";
    return kb.localeCompare(ka);
  });
}

function pct(curr?: number, prev?: number): number | null {
  if (curr == null || prev == null || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

function diff(curr?: number, prev?: number): number | null {
  if (curr == null || prev == null) return null;
  return Math.round((curr - prev) * 100) / 100;
}

function Delta({
  curr, prev, suffix = "", invert = false,
}: { curr?: number; prev?: number; suffix?: string; invert?: boolean }) {
  if (curr == null || prev == null) return <span className="text-xs text-muted-foreground">—</span>;
  const d = curr - prev;
  if (Math.abs(d) < 0.001) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
        <Minus className="h-3 w-3" />Không đổi
      </span>
    );
  }
  // when invert is true (e.g. avgPosition), going DOWN is good
  const goingUp = d > 0;
  const isGood = invert ? !goingUp : goingUp;
  const tone = isGood ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive";
  const Icon = goingUp ? TrendingUp : TrendingDown;
  const p = pct(curr, prev);
  const sign = goingUp ? "+" : "";
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${tone}`}>
      <Icon className="h-3 w-3" />
      {sign}{Math.round(d * 100) / 100}{suffix}
      {p != null && <span className="opacity-70">({sign}{p}%)</span>}
    </span>
  );
}

function fmtNum(n?: number, suffix = "") {
  if (n == null) return "—";
  return n.toLocaleString("vi-VN") + suffix;
}

function MetricCompareCard({
  label, curr, prev, suffix = "", invert = false,
}: { label: string; curr?: number; prev?: number; suffix?: string; invert?: boolean }) {
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold mt-0.5">{fmtNum(curr, suffix)}</div>
        <div className="mt-1.5"><Delta curr={curr} prev={prev} suffix={suffix} invert={invert} /></div>
      </CardContent>
    </Card>
  );
}

export function GrowthTab({ websiteId }: { websiteId: string }) {
  const s = useStore();
  const all = s.growth.filter((g) => g.websiteId === websiteId);

  const [filterType, setFilterType] = useState<"all" | GrowthPeriodType>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [editing, setEditing] = useState<GrowthMetric | null>(null);
  const [adding, setAdding] = useState(false);

  const years = useMemo(() => {
    const ys = new Set<string>();
    all.forEach((g) => {
      const y = (g.periodKey || g.updatedAt || "").slice(0, 4);
      if (y) ys.add(y);
    });
    return Array.from(ys).sort().reverse();
  }, [all]);

  const filtered = useMemo(() => {
    return sortMetrics(all.filter((g) => {
      if (filterType !== "all" && g.periodType !== filterType) return false;
      if (filterYear !== "all") {
        const y = (g.periodKey || g.updatedAt || "").slice(0, 4);
        if (y !== filterYear) return false;
      }
      return true;
    }));
  }, [all, filterType, filterYear]);

  const sorted = sortMetrics(all);
  const latest = sorted[0];
  const prev = sorted[1];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Loại kỳ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại kỳ</SelectItem>
              {GROWTH_PERIOD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Năm" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm</SelectItem>
              {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Thêm kỳ báo cáo</Button>
          </div>
        </CardContent>
      </Card>

      {/* Compare cards */}
      {latest ? (
        <Card>
          <CardContent className="p-3.5 space-y-3">
            <div className="text-sm">
              So sánh kỳ mới nhất <span className="font-semibold">{latest.period}</span>
              {prev ? <> với kỳ trước <span className="font-semibold">{prev.period}</span></> : <span className="text-muted-foreground"> — chưa có kỳ trước để so sánh</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCompareCard label="Traffic tổng" curr={latest.totalTraffic} prev={prev?.totalTraffic} />
              <MetricCompareCard label="Organic traffic" curr={latest.organicTraffic} prev={prev?.organicTraffic} />
              <MetricCompareCard label="Impression" curr={latest.impressions} prev={prev?.impressions} />
              <MetricCompareCard label="Click" curr={latest.clicks} prev={prev?.clicks} />
              <MetricCompareCard label="CTR" curr={latest.ctr} prev={prev?.ctr} suffix="%" />
              <MetricCompareCard label="Lead/Form/Inbox" curr={latest.leads} prev={prev?.leads} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu tăng trưởng. Hãy thêm kỳ báo cáo đầu tiên.
        </CardContent></Card>
      )}

      {/* Table */}
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-3 py-2 whitespace-nowrap">Kỳ báo cáo</th>
                <th className="text-right font-medium px-3 py-2">Traffic</th>
                <th className="text-right font-medium px-3 py-2">Organic</th>
                <th className="text-right font-medium px-3 py-2">Impression</th>
                <th className="text-right font-medium px-3 py-2">Click</th>
                <th className="text-right font-medium px-3 py-2">CTR</th>
                <th className="text-right font-medium px-3 py-2">Vị trí TB</th>
                <th className="text-right font-medium px-3 py-2">Trang index</th>
                <th className="text-right font-medium px-3 py-2">Lead</th>
                <th className="text-left font-medium px-3 py-2">Người cập nhật</th>
                <th className="text-left font-medium px-3 py-2">Ngày</th>
                <th className="text-left font-medium px-3 py-2">Ghi chú</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr><td colSpan={13} className="text-center text-muted-foreground py-8">Chưa có kỳ báo cáo nào</td></tr>
              )}
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">
                    {g.period}
                    <div className="text-[11px] text-muted-foreground">{g.periodType}</div>
                  </td>
                  <td className="px-3 py-2 text-right">{fmtNum(g.totalTraffic)}</td>
                  <td className="px-3 py-2 text-right">{fmtNum(g.organicTraffic)}</td>
                  <td className="px-3 py-2 text-right">{fmtNum(g.impressions)}</td>
                  <td className="px-3 py-2 text-right">{fmtNum(g.clicks)}</td>
                  <td className="px-3 py-2 text-right">{g.ctr != null ? g.ctr + "%" : "—"}</td>
                  <td className="px-3 py-2 text-right">{g.avgPosition ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{fmtNum(g.indexedPages)}</td>
                  <td className="px-3 py-2 text-right">{fmtNum(g.leads)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{g.updatedBy || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs whitespace-nowrap">{fmtDate(g.updatedAt)}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs max-w-[200px] truncate" title={g.notes}>{g.notes || "—"}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {g.reportLink && (
                      <Button asChild size="sm" variant="ghost"><a href={g.reportLink} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setEditing(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Xóa kỳ báo cáo này?")) s.remove("growth", g.id); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>

      <GrowthForm
        open={adding || !!editing}
        initial={editing}
        onClose={() => { setAdding(false); setEditing(null); }}
        onSubmit={(data) => {
          if (editing) s.update("growth", editing.id, data);
          else s.add("growth", { ...data, id: uid(), websiteId } as GrowthMetric);
          setAdding(false); setEditing(null);
        }}
      />
    </div>
  );
}

function GrowthForm({
  open, initial, onClose, onSubmit,
}: {
  open: boolean;
  initial: GrowthMetric | null;
  onClose: () => void;
  onSubmit: (data: Partial<GrowthMetric>) => void;
}) {
  const [form, setForm] = useState<Partial<GrowthMetric>>({});

  // reset whenever opened
  useMemo(() => {
    if (open) {
      setForm(initial ? { ...initial } : { periodType: "Tuần", updatedAt: todayISO() });
    }
  }, [open, initial]);

  const set = (k: keyof GrowthMetric, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v === "" ? undefined : Number(v));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{initial ? "Sửa kỳ báo cáo" : "Thêm kỳ báo cáo tăng trưởng"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Kỳ báo cáo *</Label>
            <Input placeholder="VD: Tuần 2 tháng 5/2026" value={form.period || ""} onChange={(e) => set("period", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Loại kỳ</Label>
            <Select value={form.periodType || "Tuần"} onValueChange={(v) => set("periodType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GROWTH_PERIOD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ngày cập nhật</Label>
            <Input type="date" value={form.updatedAt || ""} onChange={(e) => set("updatedAt", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Traffic tổng</Label>
            <Input type="number" value={form.totalTraffic ?? ""} onChange={(e) => set("totalTraffic", num(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Organic traffic</Label>
            <Input type="number" value={form.organicTraffic ?? ""} onChange={(e) => set("organicTraffic", num(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Impression</Label>
            <Input type="number" value={form.impressions ?? ""} onChange={(e) => set("impressions", num(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Click</Label>
            <Input type="number" value={form.clicks ?? ""} onChange={(e) => set("clicks", num(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>CTR (%)</Label>
            <Input type="number" step="0.1" value={form.ctr ?? ""} onChange={(e) => set("ctr", num(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Vị trí trung bình</Label>
            <Input type="number" step="0.1" value={form.avgPosition ?? ""} onChange={(e) => set("avgPosition", num(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Số trang đã index</Label>
            <Input type="number" value={form.indexedPages ?? ""} onChange={(e) => set("indexedPages", num(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Lead / Form / Inbox</Label>
            <Input type="number" value={form.leads ?? ""} onChange={(e) => set("leads", num(e.target.value))} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Link báo cáo GA / GSC</Label>
            <Input placeholder="https://..." value={form.reportLink || ""} onChange={(e) => set("reportLink", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Người cập nhật</Label>
            <Input value={form.updatedBy || ""} onChange={(e) => set("updatedBy", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Ghi chú</Label>
            <Textarea rows={2} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button disabled={!form.period} onClick={() => onSubmit(form)}>{initial ? "Lưu" : "Thêm"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper for the Báo Cáo tab
export function GrowthSummary({ websiteId, onJump }: { websiteId: string; onJump?: () => void }) {
  const s = useStore();
  const sorted = sortMetrics(s.growth.filter((g) => g.websiteId === websiteId));
  const latest = sorted[0];
  const prev = sorted[1];

  if (!latest) {
    return (
      <Card><CardContent className="p-5 text-sm text-muted-foreground flex items-center justify-between gap-3 flex-wrap">
        <span>Chưa có dữ liệu tăng trưởng. Hãy cập nhật tại tab Tăng Trưởng Website.</span>
        {onJump && <Button size="sm" variant="outline" onClick={onJump}>Mở tab Tăng Trưởng</Button>}
      </CardContent></Card>
    );
  }

  return (
    <Card><CardContent className="p-3.5 space-y-3">
      <div className="text-xs text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
        <span>Kỳ mới nhất: <span className="font-medium text-foreground">{latest.period}</span>{prev && <> · so với <span className="font-medium text-foreground">{prev.period}</span></>}</span>
        {onJump && <Button size="sm" variant="ghost" onClick={onJump}>Mở tab Tăng Trưởng</Button>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <MetricCompareCard label="Traffic tổng" curr={latest.totalTraffic} prev={prev?.totalTraffic} />
        <MetricCompareCard label="Organic" curr={latest.organicTraffic} prev={prev?.organicTraffic} />
        <MetricCompareCard label="Impression" curr={latest.impressions} prev={prev?.impressions} />
        <MetricCompareCard label="Click" curr={latest.clicks} prev={prev?.clicks} />
        <MetricCompareCard label="CTR" curr={latest.ctr} prev={prev?.ctr} suffix="%" />
        <MetricCompareCard label="Vị trí TB" curr={latest.avgPosition} prev={prev?.avgPosition} invert />
        <MetricCompareCard label="Trang index" curr={latest.indexedPages} prev={prev?.indexedPages} />
        <MetricCompareCard label="Lead/Form" curr={latest.leads} prev={prev?.leads} />
      </div>
    </CardContent></Card>
  );
}
