import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth";
import { useBranding } from "@/lib/branding";
import { buildDetails, buildReport, isoWeekOf, rangeOf, weeksInYear, type PeriodKind, type ReportRow, type DetailRow } from "@/lib/leave/report";
import { fmtDate, fmtDays, todayVn, TYPE_LABEL, type LeaveType } from "@/lib/leave/calc";
import { STATUS_LABEL, type LeaveRequest, type LeaveStatus } from "@/lib/leave/api";

const KINDS: [PeriodKind, string][] = [["week", "Tuần"], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"], ["custom", "Tùy chỉnh"]];
const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";

export function LeaveReport({ rows, name }: { rows: LeaveRequest[]; name: (id?: string | null) => string }) {
  const { can } = useCurrentUser();
  const brand = useBranding();
  const today = todayVn();
  const cy = Number(today.slice(0, 4));
  const [kind, setKind] = useState<PeriodKind>("month");
  const [year, setYear] = useState(cy);
  const [week, setWeek] = useState(isoWeekOf(today).week);
  const [month, setMonth] = useState(Number(today.slice(5, 7)));
  const [quarter, setQuarter] = useState(Math.ceil(Number(today.slice(5, 7)) / 3));
  const [cs, setCs] = useState(today.slice(0, 8) + "01");
  const [ce, setCe] = useState(today);
  const [openUser, setOpenUser] = useState<string | null>(null);

  const range = useMemo(() => rangeOf(kind, { year, week, month, quarter, start: cs, end: ce }), [kind, year, week, month, quarter, cs, ce]);
  const periodLabel = `${KINDS.find((k) => k[0] === kind)![1]}${kind === "week" ? ` ${week}/${year}` : kind === "month" ? ` ${month}/${year}` : kind === "quarter" ? ` ${quarter}/${year}` : kind === "year" ? ` ${year}` : ""}: ${fmtDate(range.start)} – ${fmtDate(range.end)}`;
  const data = useMemo(() => buildReport(rows, range).sort((a, b) => name(a.userId).localeCompare(name(b.userId), "vi")), [rows, range, name]);
  const details = useMemo(() => buildDetails(rows, range), [rows, range]);
  const total = data.reduce((t, r) => ({ days: t.days + r.leaveDays, late: t.late + r.lateCount, early: t.early + r.earlyCount, pending: t.pending + r.pending, rejected: t.rejected + r.rejected }), { days: 0, late: 0, early: 0, pending: 0, rejected: 0 });
  const years = Array.from({ length: 7 }, (_, i) => cy - 5 + i);

  const exportXlsx = async () => {
    const XLSX = await import("xlsx");
    const title = `${brand.app_name} — ${brand.org_name} — Báo cáo đơn từ — ${periodLabel}`;
    const sumHead = ["Nhân viên", "Số đơn nghỉ phép", "Số ngày nghỉ", "Số lần đi muộn", "Phút đi muộn", "Số lần về sớm", "Phút về sớm", "Đơn chờ duyệt", "Đơn bị từ chối"];
    const sumRows = data.map((r: ReportRow) => [name(r.userId), r.leaveCount, r.leaveDays, r.lateCount, r.lateMinutes, r.earlyCount, r.earlyMinutes, r.pending, r.rejected]);
    const tot = ["TỔNG", data.reduce((s, r) => s + r.leaveCount, 0), Math.round(total.days * 100) / 100, total.late, data.reduce((s, r) => s + r.lateMinutes, 0), total.early, data.reduce((s, r) => s + r.earlyMinutes, 0), total.pending, total.rejected];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], [], sumHead, ...sumRows, tot]), "Tổng hợp");
    const dHead = ["Nhân viên", "Loại đơn", "Thời gian đăng ký", "Ngày nghỉ trong kỳ", "Số phút", "Trạng thái", "Tính vào tổng"];
    const dRows = [...details].sort((a, b) => name(a.userId).localeCompare(name(b.userId), "vi")).map((d) => [name(d.userId), TYPE_LABEL[d.type as LeaveType] ?? d.type, whenText(d), d.type === "leave" ? d.days : "", d.type === "leave" ? "" : d.minutes, STATUS_LABEL[d.status as LeaveStatus] ?? d.status, d.counted ? "Có" : "Không"]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], ["Chỉ đơn Đã duyệt được tính vào bảng Tổng hợp."], dHead, ...dRows]), "Chi tiết");
    XLSX.writeFile(wb, `${brand.short_name.replace(/[^\p{L}\p{N}]+/gu, "-")}-bao-cao-don-tu-${range.start}_${range.end}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
          {KINDS.map(([k, l]) => (
            <button key={k} onClick={() => setKind(k)} className={`rounded-md px-3 py-1.5 ${kind === k ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        {kind === "week" && <select className={sel} value={week} onChange={(e) => setWeek(+e.target.value)}>{Array.from({ length: weeksInYear(year) }, (_, i) => <option key={i} value={i + 1}>Tuần {i + 1}</option>)}</select>}
        {kind === "month" && <select className={sel} value={month} onChange={(e) => setMonth(+e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>Tháng {i + 1}</option>)}</select>}
        {kind === "quarter" && <select className={sel} value={quarter} onChange={(e) => setQuarter(+e.target.value)}>{[1, 2, 3, 4].map((q) => <option key={q} value={q}>Quý {q}</option>)}</select>}
        {kind !== "custom" && <select className={sel} value={year} onChange={(e) => { const y = +e.target.value; setYear(y); if (week > weeksInYear(y)) setWeek(weeksInYear(y)); }}>{years.map((y) => <option key={y} value={y}>Năm {y}</option>)}</select>}
        {kind === "custom" && <>
          <Input type="date" value={cs} onChange={(e) => e.target.value && setCs(e.target.value)} className="w-40" />
          <span className="text-muted-foreground self-center">đến</span>
          <Input type="date" value={ce} onChange={(e) => e.target.value && setCe(e.target.value)} className="w-40" />
        </>}
        <div className="flex-1" />
        {can("leave.export") && <Button variant="outline" onClick={exportXlsx} disabled={!details.length}><Download className="h-4 w-4 mr-1" />Xuất Excel</Button>}
      </div>
      <div className="text-sm text-muted-foreground">Đang thống kê: <span className="font-medium text-foreground">{periodLabel}</span></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[["Ngày nghỉ đã duyệt", fmtDays(Math.round(total.days * 100) / 100)], ["Lần đi muộn", total.late], ["Lần về sớm", total.early], ["Đơn chờ duyệt", total.pending], ["Đơn bị từ chối", total.rejected]].map(([l, v]) => (
          <Card key={l as string}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground"><tr>
            {["Nhân viên", "Đơn nghỉ", "Ngày nghỉ", "Đi muộn (lần/phút)", "Về sớm (lần/phút)", "Chờ duyệt", "Từ chối"].map((h) => <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {data.map((r) => (
              <Fragment key={r.userId}>
                <tr className="border-t cursor-pointer hover:bg-muted/40" onClick={() => setOpenUser(openUser === r.userId ? null : r.userId)}>
                  <td className="px-3 py-2 font-medium"><span className="inline-flex items-center gap-1">{openUser === r.userId ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}{name(r.userId)}</span></td>
                  <td className="px-3 py-2">{r.leaveCount}</td>
                  <td className="px-3 py-2">{fmtDays(r.leaveDays)}</td>
                  <td className="px-3 py-2">{r.lateCount} / {r.lateMinutes}</td>
                  <td className="px-3 py-2">{r.earlyCount} / {r.earlyMinutes}</td>
                  <td className="px-3 py-2">{r.pending}</td>
                  <td className="px-3 py-2">{r.rejected}</td>
                </tr>
                {openUser === r.userId && <tr><td colSpan={7} className="bg-muted/20 px-3 py-2"><DetailTable rows={details.filter((d) => d.userId === r.userId)} /></td></tr>}
              </Fragment>
            ))}
            {!data.length && <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">Không có đơn nào trong khoảng thời gian này.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
      <p className="text-xs text-muted-foreground">Tính theo ngày đăng ký nghỉ/đi muộn/về sớm, không theo ngày gửi đơn. Chỉ đơn đã duyệt được cộng vào tổng; đơn nghỉ qua nhiều kỳ được chia theo từng ngày làm việc. Bấm vào tên nhân viên để xem chi tiết từng đơn. Báo cáo gồm những đơn bạn được quyền xem.</p>
    </div>
  );
}

function whenText(d: DetailRow) {
  if (d.type !== "leave") return fmtDate(d.when);
  const [a, b] = d.when.split(" → ");
  return a === b ? fmtDate(a) : `${fmtDate(a)} – ${fmtDate(b)}`;
}

function DetailTable({ rows }: { rows: DetailRow[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="text-muted-foreground"><tr>{["Loại đơn", "Thời gian đăng ký", "Trong kỳ", "Trạng thái", "Tính vào tổng"].map((h) => <th key={h} className="text-left font-medium px-2 py-1">{h}</th>)}</tr></thead>
      <tbody>
        {rows.map((d, i) => (
          <tr key={d.id ?? i} className={`border-t ${d.counted ? "" : "text-muted-foreground"}`}>
            <td className="px-2 py-1">{TYPE_LABEL[d.type as LeaveType] ?? d.type}</td>
            <td className="px-2 py-1">{whenText(d)}</td>
            <td className="px-2 py-1">{d.type === "leave" ? `${fmtDays(d.days)} ngày` : `${d.minutes} phút`}</td>
            <td className="px-2 py-1">{STATUS_LABEL[d.status as LeaveStatus] ?? d.status}</td>
            <td className="px-2 py-1">{d.counted ? "Có" : "Không"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
