import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth";
import { useBranding } from "@/lib/branding";
import { buildReport, toCsv } from "@/lib/leave/report";
import { fmtDays, todayVn } from "@/lib/leave/calc";
import type { LeaveRequest } from "@/lib/leave/api";

export function LeaveReport({ rows, name }: { rows: LeaveRequest[]; name: (id?: string | null) => string }) {
  const { can } = useCurrentUser();
  const brand = useBranding();
  const [month, setMonth] = useState(todayVn().slice(0, 7));
  const data = useMemo(() => buildReport(rows, month).sort((a, b) => name(a.userId).localeCompare(name(b.userId), "vi")), [rows, month, name]);
  const total = data.reduce((t, r) => ({ days: t.days + r.leaveDays, late: t.late + r.lateCount, early: t.early + r.earlyCount, pending: t.pending + r.pending }), { days: 0, late: 0, early: 0, pending: 0 });

  const exportCsv = () => {
    const blob = new Blob([toCsv(data, (id) => name(id), month, `${brand.app_name} — ${brand.org_name}`)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `${brand.short_name.replace(/[^\p{L}\p{N}]+/gu, "-")}-bao-cao-don-tu-${month}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div><div className="text-xs text-muted-foreground mb-1">Tháng</div><Input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} className="w-44" /></div>
        <div className="flex-1" />
        {can("leave.export") && <Button variant="outline" onClick={exportCsv} disabled={!data.length}><Download className="h-4 w-4 mr-1" />Xuất Excel</Button>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Ngày nghỉ đã duyệt", fmtDays(Math.round(total.days * 100) / 100)], ["Lần đi muộn", total.late], ["Lần về sớm", total.early], ["Đơn chờ duyệt", total.pending]].map(([l, v]) => (
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
              <tr key={r.userId} className="border-t">
                <td className="px-3 py-2 font-medium">{name(r.userId)}</td>
                <td className="px-3 py-2">{r.leaveCount}</td>
                <td className="px-3 py-2">{fmtDays(r.leaveDays)}</td>
                <td className="px-3 py-2">{r.lateCount} / {r.lateMinutes}</td>
                <td className="px-3 py-2">{r.earlyCount} / {r.earlyMinutes}</td>
                <td className="px-3 py-2">{r.pending}</td>
                <td className="px-3 py-2">{r.rejected}</td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">Không có đơn nào trong tháng này.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>
      <p className="text-xs text-muted-foreground">Chỉ tính đơn đã duyệt; đơn nghỉ qua hai tháng được chia theo từng ngày. Báo cáo gồm những đơn bạn được quyền xem.</p>
    </div>
  );
}
