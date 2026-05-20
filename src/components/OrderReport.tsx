import { useMemo, useState } from "react";
import { useStore, ORDER_TYPES, ORDER_PRIORITIES, type DesignOrder } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/Common";

type RangeKey = "all" | "week" | "month" | "quarter" | "custom";

const dayMs = 86400000;
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const parse = (s?: string) => (s ? new Date(s) : undefined);
const diffDays = (a?: Date, b?: Date) => (a && b ? Math.max(0, Math.round((+a - +b) / dayMs)) : undefined);

function computeRange(key: RangeKey, customFrom?: string, customTo?: string): { from?: Date; to?: Date } {
  const now = new Date();
  if (key === "all") return {};
  if (key === "custom") return { from: customFrom ? startOfDay(new Date(customFrom)) : undefined, to: customTo ? new Date(customTo + "T23:59:59") : undefined };
  if (key === "week") {
    const d = startOfDay(now); const dow = (d.getDay() + 6) % 7; // Mon=0
    const from = new Date(+d - dow * dayMs); return { from, to: now };
  }
  if (key === "month") return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  if (key === "quarter") { const q = Math.floor(now.getMonth() / 3); return { from: new Date(now.getFullYear(), q * 3, 1), to: now }; }
  return {};
}

function inRange(o: DesignOrder, from?: Date, to?: Date) {
  // Use completedAt for completed orders, otherwise takenAt/deliveredAt/submittedAt, fallback to history[0].at
  const refStr = o.completedAt || o.deliveredAt || o.submittedAt || o.takenAt || o.history?.[0]?.at;
  const ref = parse(refStr);
  if (!ref) return !from && !to;
  if (from && ref < from) return false;
  if (to && ref > to) return false;
  return true;
}

export function OrderReport() {
  const s = useStore();
  const [rangeKey, setRangeKey] = useState<RangeKey>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fAssignee, setFAssignee] = useState("all");
  const [fBrand, setFBrand] = useState("all");
  const [fType, setFType] = useState("all");
  const [fPriority, setFPriority] = useState("all");

  const range = computeRange(rangeKey, from, to);

  const orders = useMemo(() => s.orders.filter((o) =>
    inRange(o, range.from, range.to) &&
    (fAssignee === "all" || o.assignee === fAssignee) &&
    (fBrand === "all" || o.brandId === fBrand) &&
    (fType === "all" || o.type === fType) &&
    (fPriority === "all" || o.priority === fPriority)
  ), [s.orders, range.from, range.to, fAssignee, fBrand, fType, fPriority]);

  const completed = orders.filter((o) => o.status === "Hoàn thành");
  const onTime = completed.filter((o) => {
    if (!o.deadline || !o.completedAt) return false;
    return new Date(o.completedAt) <= new Date(o.deadline + "T23:59:59");
  });
  const totalRevisions = completed.reduce((sum, o) => sum + (o.revisions || 0), 0);
  const firstApprove = completed.filter((o) => (o.revisions || 0) === 0).length;
  const processDays = completed
    .map((o) => diffDays(parse(o.completedAt), parse(o.takenAt)))
    .filter((x): x is number => x !== undefined);
  const avgProcess = processDays.length ? (processDays.reduce((a, b) => a + b, 0) / processDays.length) : 0;

  const onTimeRate = completed.length ? (onTime.length / completed.length) * 100 : 0;
  const avgRevisions = completed.length ? totalRevisions / completed.length : 0;
  const firstApproveRate = completed.length ? (firstApprove / completed.length) * 100 : 0;

  // ===== By type =====
  const byType = ORDER_TYPES.map((t) => {
    const items = orders.filter((o) => o.type === t);
    return { type: t, count: items.length, pct: orders.length ? (items.length / orders.length) * 100 : 0 };
  }).filter((x) => x.count > 0).sort((a, b) => b.count - a.count);

  // ===== By assignee =====
  const assignees = Array.from(new Set(orders.map((o) => o.assignee).filter(Boolean) as string[]));
  const rows = assignees.map((name) => {
    const mine = orders.filter((o) => o.assignee === name);
    const mineDone = mine.filter((o) => o.status === "Hoàn thành");
    const mineOnTime = mineDone.filter((o) => o.deadline && o.completedAt && new Date(o.completedAt) <= new Date(o.deadline + "T23:59:59"));
    const mineFirst = mineDone.filter((o) => (o.revisions || 0) === 0).length;
    const mineRev = mineDone.reduce((sum, o) => sum + (o.revisions || 0), 0);
    const mineProc = mineDone
      .map((o) => diffDays(parse(o.completedAt), parse(o.takenAt)))
      .filter((x): x is number => x !== undefined);
    return {
      name,
      assigned: mine.length,
      done: mineDone.length,
      onTime: mineOnTime.length,
      onTimeRate: mineDone.length ? (mineOnTime.length / mineDone.length) * 100 : 0,
      avgProcess: mineProc.length ? mineProc.reduce((a, b) => a + b, 0) / mineProc.length : 0,
      avgRevisions: mineDone.length ? mineRev / mineDone.length : 0,
      firstApprove: mineFirst,
      firstApproveRate: mineDone.length ? (mineFirst / mineDone.length) * 100 : 0,
    };
  }).sort((a, b) => b.done - a.done);

  const empty = orders.length === 0;

  return (
    <div className="space-y-4">
      <FilterBar>
        <Select value={rangeKey} onValueChange={(v) => setRangeKey(v as RangeKey)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thời gian</SelectItem>
            <SelectItem value="week">Tuần này</SelectItem>
            <SelectItem value="month">Tháng này</SelectItem>
            <SelectItem value="quarter">Quý này</SelectItem>
            <SelectItem value="custom">Tùy chọn</SelectItem>
          </SelectContent>
        </Select>
        {rangeKey === "custom" && (
          <>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
          </>
        )}
        <Select value={fAssignee} onValueChange={setFAssignee}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi NV phụ trách</SelectItem>{s.people.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fBrand} onValueChange={setFBrand}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi thương hiệu</SelectItem>{s.brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fType} onValueChange={setFType}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi loại</SelectItem>{ORDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={fPriority} onValueChange={setFPriority}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Mọi ưu tiên</SelectItem>{ORDER_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>

      {empty ? (
        <Card><CardContent className="py-16 text-center space-y-3">
          <div className="text-muted-foreground">Chưa có dữ liệu báo cáo trong khoảng thời gian này.</div>
          <Button variant="outline" onClick={() => setRangeKey("all")}>Xem tất cả thời gian</Button>
        </CardContent></Card>
      ) : (
        <>
          {/* ===== Main cards ===== */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Metric label="Tổng jobs / order" value={String(orders.length)} />
            <Metric label="Jobs hoàn thành" value={String(completed.length)} />
            <Metric
              label="Tỷ lệ đúng hạn"
              value={`${onTimeRate.toFixed(0)}%`}
              tone={onTimeRate >= 80 ? "good" : onTimeRate >= 50 ? "warn" : "bad"}
              sub={`${onTime.length}/${completed.length}`}
            />
            <Metric label="Thời gian xử lý TB" value={`${avgProcess.toFixed(1)} ngày`} />
            <Metric
              label="Số lần sửa TB"
              value={avgRevisions.toFixed(1)}
              tone={avgRevisions <= 1 ? "good" : avgRevisions <= 2 ? "warn" : "bad"}
            />
            <Metric
              label="Tỷ lệ duyệt lần đầu"
              value={`${firstApproveRate.toFixed(0)}%`}
              tone={firstApproveRate >= 60 ? "good" : firstApproveRate >= 30 ? "warn" : "bad"}
              sub={`${firstApprove}/${completed.length}`}
            />
          </div>

          {/* ===== Type breakdown ===== */}
          <Card><CardContent className="p-5">
            <div className="font-semibold mb-4">Tỷ trọng jobs theo phân loại</div>
            {byType.length === 0 ? (
              <div className="text-sm text-muted-foreground">Không có dữ liệu.</div>
            ) : (
              <div className="space-y-2.5">
                {byType.map((t) => (
                  <div key={t.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t.type}</span>
                      <span className="text-muted-foreground tabular-nums">{t.count} jobs · {t.pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/70" style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>

          {/* ===== Staff performance ===== */}
          <Card><CardContent className="p-0">
            <div className="px-5 pt-5 pb-3 font-semibold">Hiệu suất theo nhân viên</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Nhân viên</th>
                    <th className="text-right font-medium px-4 py-2.5">Được giao</th>
                    <th className="text-right font-medium px-4 py-2.5">Hoàn thành</th>
                    <th className="text-right font-medium px-4 py-2.5">Đúng hạn</th>
                    <th className="text-right font-medium px-4 py-2.5">Tỷ lệ đúng hạn</th>
                    <th className="text-right font-medium px-4 py-2.5">Xử lý TB (ngày)</th>
                    <th className="text-right font-medium px-4 py-2.5">Lần sửa TB</th>
                    <th className="text-right font-medium px-4 py-2.5">Duyệt lần đầu</th>
                    <th className="text-right font-medium px-4 py-2.5">Tỷ lệ duyệt lần đầu</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Không có nhân viên phụ trách trong kỳ.</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.name} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{r.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.assigned}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.done}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.onTime}</td>
                      <td className="px-4 py-2.5 text-right"><Pct value={r.onTimeRate} good={80} warn={50} /></td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.avgProcess.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.avgRevisions.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.firstApprove}</td>
                      <td className="px-4 py-2.5 text-right"><Pct value={r.firstApproveRate} good={60} warn={30} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "warn" | "bad" }) {
  const toneCls = tone === "good" ? "text-emerald-600 dark:text-emerald-400"
    : tone === "warn" ? "text-amber-600 dark:text-amber-400"
    : tone === "bad" ? "text-rose-600 dark:text-rose-400"
    : "";
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${toneCls}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </CardContent></Card>
  );
}

function Pct({ value, good, warn }: { value: number; good: number; warn: number }) {
  const cls = value >= good ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    : value >= warn ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    : "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  return <span className={`inline-block px-2 py-0.5 rounded text-xs tabular-nums ${cls}`}>{value.toFixed(0)}%</span>;
}
