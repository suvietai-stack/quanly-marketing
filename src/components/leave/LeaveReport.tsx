import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth";
import { useBranding } from "@/lib/branding";
import { buildDetails, buildReport, isoWeekOf, rangeOf, weeksInYear, type PeriodKind, type ReportRow, type DetailRow } from "@/lib/leave/report";
import { fmtDate, fmtDays, fmtVn, todayVn, TYPE_LABEL, type LeaveType } from "@/lib/leave/calc";
import { attInRange, attSummary, declaredTime, KIND_LABEL, WITNESS_LABEL, type AttExplanation } from "@/lib/leave/attendance";
import { STATUS_LABEL, type LeaveRequest, type LeaveStatus } from "@/lib/leave/api";

const KINDS: [PeriodKind, string][] = [["week", "Tuần"], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"], ["custom", "Tùy chỉnh"]];
const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";

export function LeaveReport({ rows, atts, name, onOpenAtt, mode = "leave" }: { rows: LeaveRequest[]; atts?: AttExplanation[] | null; name: (id?: string | null) => string; onOpenAtt?: (id: string) => void; mode?: "leave" | "att" }) {
  const attOnly = mode === "att";
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
  const attRows = useMemo(() => atts ? attInRange(atts, range.start, range.end).sort((a, b) => a.work_date.localeCompare(b.work_date)) : [], [atts, range]);
  const attSum = useMemo(() => attSummary(attRows).sort((a, b) => name(a.owner_id).localeCompare(name(b.owner_id), "vi")), [attRows, name]);
  const years = Array.from({ length: 7 }, (_, i) => cy - 5 + i);

  const exportXlsx = async () => {
    const XLSX = await import("xlsx");
    const title = `${brand.app_name} — ${brand.org_name} — ${attOnly ? "Báo cáo giải trình chấm công" : "Báo cáo đơn từ"} — ${periodLabel}`;
    const wb = XLSX.utils.book_new();
    if (!attOnly) {
      const sumHead = ["Nhân viên", "Số đơn nghỉ phép", "Số ngày nghỉ", "Số lần đi muộn", "Phút đi muộn", "Số lần về sớm", "Phút về sớm", "Đơn chờ duyệt", "Đơn bị từ chối"];
      const sumRows = data.map((r: ReportRow) => [name(r.userId), r.leaveCount, r.leaveDays, r.lateCount, r.lateMinutes, r.earlyCount, r.earlyMinutes, r.pending, r.rejected]);
      const tot = ["TỔNG", data.reduce((s, r) => s + r.leaveCount, 0), Math.round(total.days * 100) / 100, total.late, data.reduce((s, r) => s + r.lateMinutes, 0), total.early, data.reduce((s, r) => s + r.earlyMinutes, 0), total.pending, total.rejected];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], [], sumHead, ...sumRows, tot]), "Tổng hợp");
      const dHead = ["Nhân viên", "Loại đơn", "Thời gian đăng ký", "Ngày nghỉ trong kỳ", "Số phút", "Trạng thái", "Tính vào tổng"];
      const dRows = [...details].sort((a, b) => name(a.userId).localeCompare(name(b.userId), "vi")).map((d) => [name(d.userId), TYPE_LABEL[d.type as LeaveType] ?? d.type, whenText(d), d.type === "leave" ? d.days : "", d.type === "leave" ? "" : d.minutes, STATUS_LABEL[d.status as LeaveStatus] ?? d.status, d.counted ? "Có" : "Không"]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], ["Chỉ đơn Đã duyệt được tính vào bảng Tổng hợp."], dHead, ...dRows]), "Chi tiết");
    }
    if (atts) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], ["Tính theo ngày quên chấm công. Giải trình đã thu hồi không tính."],
        ["Nhân viên", "Tổng số lần", "Quên chấm công vào", "Quên chấm công ra", "Quên cả hai", "Chưa đối chiếu", "Đã đối chiếu"],
        ...attSum.map((r) => [name(r.owner_id), r.total, r.in, r.out, r.both, r.unreconciled, r.reconciled])]), "Giải trình - Tổng hợp");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], [],
        ["Nhân viên", "Ngày quên chấm công", "Gửi lúc", "Nội dung", "Giờ tự khai báo", "Lý do", "Chi tiết", "Người làm chứng", "Kết quả làm chứng", "Trạng thái đối chiếu", "Người đối chiếu", "Thời điểm đối chiếu", "Ghi chú đối chiếu"],
        ...attRows.map((a) => [name(a.owner_id), fmtDate(a.work_date), fmtVn(a.submitted_at), KIND_LABEL[a.kind], declaredTime(a), a.reason_name, a.detail ?? "", name(a.witness_id), WITNESS_LABEL[a.witness_status], a.reconciled ? "Đã đối chiếu" : "Chưa đối chiếu", a.reconciled ? name(a.reconciled_by) : "", a.reconciled_at ? fmtVn(a.reconciled_at) : "", a.reconcile_note ?? ""])]), "Giải trình - Chi tiết");
    }
    XLSX.writeFile(wb, `${brand.short_name.replace(/[^\p{L}\p{N}]+/gu, "-")}-${attOnly ? "bao-cao-giai-trinh" : "bao-cao-don-tu"}-${range.start}_${range.end}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="inline-flex max-w-full overflow-x-auto rounded-lg bg-muted p-1 text-sm">
          {KINDS.map(([k, l]) => (
            <Button variant={kind === k ? 'secondary' : 'ghost'} key={k} onClick={() => setKind(k)} className="shrink-0 max-md:min-h-11">{l}</Button>
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
        {can("leave.export") && <Button variant="outline" onClick={exportXlsx} disabled={!details.length && !attRows.length}><Download className="h-4 w-4 mr-1" />Xuất Excel</Button>}
      </div>
      <div className="text-sm text-muted-foreground">Đang thống kê: <span className="font-medium text-foreground">{periodLabel}</span></div>
      {!attOnly && <>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[["Ngày nghỉ đã duyệt", fmtDays(Math.round(total.days * 100) / 100)], ["Lần đi muộn", total.late], ["Lần về sớm", total.early], ["Đơn chờ duyệt", total.pending], ["Đơn bị từ chối", total.rejected]].map(([l, v]) => (
            <Card key={l as string}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="text-2xl font-semibold mt-1">{v}</div></CardContent></Card>
          ))}
        </div>
        <div className={cnReportMobile(attOnly)}>{data.map(r => <article key={r.userId} className="rounded-lg border bg-card p-3 space-y-2"><Button variant="ghost" className="h-auto w-full justify-between px-0 whitespace-normal text-left" onClick={() => setOpenUser(openUser === r.userId ? null : r.userId)}><span className="min-w-0 font-medium">{name(r.userId)}</span>{openUser === r.userId ? <ChevronDown className="shrink-0" /> : <ChevronRight className="shrink-0" />}</Button><p className="text-sm">{fmtDays(r.leaveDays)} ngày nghỉ · {r.lateCount} lần đi muộn · {r.earlyCount} lần về sớm</p><p className="text-xs text-muted-foreground">{r.pending} chờ duyệt · {r.rejected} từ chối</p>{openUser === r.userId && <div className="border-t pt-2 space-y-2">{details.filter(d => d.userId === r.userId).map((d,i) => <div key={d.id ?? i} className="text-sm"><p>{TYPE_LABEL[d.type as LeaveType]} · {whenText(d)}</p><p className="text-xs text-muted-foreground">{d.type === 'leave' ? `${fmtDays(d.days)} ngày` : `${d.minutes} phút`} · {STATUS_LABEL[d.status as LeaveStatus]}</p></div>)}</div>}</article>)}</div>
        <Card className={attOnly ? '' : 'hidden md:block'}><CardContent className="p-0 overflow-x-auto">
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
      </>}
      {atts && <AttSection sum={attSum} rows={attRows} name={name} onOpen={onOpenAtt} />}
      {!attOnly && <p className="text-xs text-muted-foreground">Tính theo ngày đăng ký nghỉ/đi muộn/về sớm, không theo ngày gửi đơn. Chỉ đơn đã duyệt được cộng vào tổng; đơn nghỉ qua nhiều kỳ được chia theo từng ngày làm việc. Bấm vào tên nhân viên để xem chi tiết từng đơn. Báo cáo gồm những đơn bạn được quyền xem.</p>}
    </div>
  );
}

const cnReportMobile = (attOnly: boolean) => attOnly ? 'hidden' : 'md:hidden space-y-2';

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

function AttSection({ sum, rows, name, onOpen }: { sum: ReturnType<typeof attSummary>; rows: AttExplanation[]; name: (id?: string | null) => string; onOpen?: (id: string) => void }) {
  const th = "text-left font-medium px-3 py-2 whitespace-nowrap";
  return (
    <div className="space-y-3 pt-2">
      <h3 className="font-semibold">Giải trình Chấm Công</h3>
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground"><tr>{["Nhân viên", "Tổng", "Quên vào", "Quên ra", "Quên cả hai", "Chưa đối chiếu", "Đã đối chiếu"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>
            {sum.map((r) => <tr key={r.owner_id} className="border-t"><td className="px-3 py-2 font-medium">{name(r.owner_id)}</td><td className="px-3 py-2">{r.total}</td><td className="px-3 py-2">{r.in}</td><td className="px-3 py-2">{r.out}</td><td className="px-3 py-2">{r.both}</td><td className="px-3 py-2">{r.unreconciled}</td><td className="px-3 py-2">{r.reconciled}</td></tr>)}
            {!sum.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Không có giải trình nào trong khoảng thời gian này.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
      {rows.length > 0 && <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 text-muted-foreground"><tr>{["Nhân viên", "Ngày quên", "Gửi lúc", "Nội dung", "Giờ tự khai", "Lý do", "Người làm chứng", "Làm chứng", "Đối chiếu"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t cursor-pointer hover:bg-muted/40" onClick={() => onOpen?.(a.id)}>
                <td className="px-3 py-1.5">{name(a.owner_id)}</td><td className="px-3 py-1.5">{fmtDate(a.work_date)}</td><td className="px-3 py-1.5 whitespace-nowrap">{fmtVn(a.submitted_at)}</td>
                <td className="px-3 py-1.5">{KIND_LABEL[a.kind]}</td><td className="px-3 py-1.5 whitespace-nowrap">{declaredTime(a)}</td><td className="px-3 py-1.5">{a.reason_name}</td>
                <td className="px-3 py-1.5">{name(a.witness_id)}</td><td className="px-3 py-1.5">{WITNESS_LABEL[a.witness_status]}</td>
                <td className="px-3 py-1.5 whitespace-nowrap">{a.reconciled ? `Đã · ${name(a.reconciled_by)} · ${fmtVn(a.reconciled_at!)}` : "Chưa"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>}
      <p className="text-xs text-muted-foreground">Giải trình tính theo ngày quên chấm công, không cộng vào thống kê nghỉ phép, đi muộn, về sớm. Giải trình đã thu hồi không tính. Bấm một dòng để xem đầy đủ và lịch sử.</p>
    </div>
  );
}
