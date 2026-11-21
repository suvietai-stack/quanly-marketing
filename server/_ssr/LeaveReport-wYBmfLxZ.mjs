import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useCurrentUser, B as Button, I as Input, C as Card, o as CardContent } from "./router-CkmTURa-.mjs";
import { u as useBranding } from "./branding-Bpuupoin.mjs";
import { t as todayVn, a as fmtDate, b as fmtDays, T as TYPE_LABEL, c as addDays, i as isoDow, f as fmtVn } from "./calc-BK6sHnP3.mjs";
import { attInRange, attSummary, KIND_LABEL, WITNESS_LABEL, declaredTime } from "./attendance-Br4iDv6M.mjs";
import { S as STATUS_LABEL } from "./LeaveSettings-DoiRb7lN.mjs";
import { af as Download, n as ChevronDown, s as ChevronRight } from "../_libs/lucide-react.mjs";
const p2 = (n) => String(n).padStart(2, "0");
const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
function isoWeekStart(y, w) {
  const jan4 = `${y}-01-04`;
  return addDays(addDays(jan4, 1 - isoDow(jan4)), (w - 1) * 7);
}
function isoWeekOf(date) {
  const thu = addDays(date, 4 - isoDow(date));
  const y = Number(thu.slice(0, 4));
  const w = Math.round((Date.parse(thu) - Date.parse(isoWeekStart(y, 1))) / 864e5 / 7) + 1;
  return { year: y, week: w };
}
function weeksInYear(y) {
  return isoWeekOf(`${y}-12-28`).week;
}
function rangeOf(kind, o) {
  const y = o.year;
  if (kind === "week") {
    const s2 = isoWeekStart(y, o.week ?? 1);
    return { start: s2, end: addDays(s2, 6) };
  }
  if (kind === "month") {
    const m = o.month ?? 1;
    return { start: `${y}-${p2(m)}-01`, end: `${y}-${p2(m)}-${p2(lastDay(y, m))}` };
  }
  if (kind === "quarter") {
    const q = o.quarter ?? 1;
    const m1 = (q - 1) * 3 + 1, m3 = m1 + 2;
    return { start: `${y}-${p2(m1)}-01`, end: `${y}-${p2(m3)}-${p2(lastDay(y, m3))}` };
  }
  if (kind === "year") return { start: `${y}-01-01`, end: `${y}-12-31` };
  const s = o.start || `${y}-01-01`, e = o.end || s;
  return s <= e ? { start: s, end: e } : { start: e, end: s };
}
const inR = (d, r) => !!d && d >= r.start && d <= r.end;
function portion(r, range) {
  if (r.type === "leave") {
    const details = Array.isArray(r.calc?.details) ? r.calc.details : [];
    if (details.length) {
      const hit = details.filter((d) => inR(d.date, range));
      return hit.length ? { days: Math.round(hit.reduce((s, d) => s + Number(d.days || 0), 0) * 100) / 100, minutes: 0 } : null;
    }
    return inR(r.payload?.start_date, range) ? { days: Number(r.calc?.days ?? 0), minutes: 0 } : null;
  }
  return inR(r.payload?.date, range) ? { days: 0, minutes: Number(r.payload?.minutes ?? 0) } : null;
}
function buildReport(rows, range) {
  const rg = typeof range === "string" ? rangeOf("month", { year: +range.slice(0, 4), month: +range.slice(5, 7) }) : range;
  const by = {};
  const get = (u) => by[u] ??= { userId: u, leaveCount: 0, leaveDays: 0, lateCount: 0, lateMinutes: 0, earlyCount: 0, earlyMinutes: 0, pending: 0, rejected: 0 };
  for (const r of rows) {
    const part = portion(r, rg);
    if (!part) continue;
    const g = get(r.owner_id);
    if (r.status === "approved") {
      if (r.type === "leave") {
        g.leaveCount++;
        g.leaveDays += part.days;
      } else if (r.type === "late") {
        g.lateCount++;
        g.lateMinutes += part.minutes;
      } else {
        g.earlyCount++;
        g.earlyMinutes += part.minutes;
      }
    } else if (r.status === "pending") g.pending++;
    else if (r.status === "rejected") g.rejected++;
  }
  for (const g of Object.values(by)) g.leaveDays = Math.round(g.leaveDays * 100) / 100;
  return Object.values(by);
}
function buildDetails(rows, range, userId) {
  const out = [];
  for (const r of rows) {
    const part = portion(r, range);
    if (!part) continue;
    const when = r.type === "leave" ? `${r.payload?.start_date ?? ""} → ${r.payload?.end_date ?? ""}` : String(r.payload?.date ?? "");
    out.push({ id: r.id, userId: r.owner_id, type: r.type, status: r.status, when, days: part.days, minutes: part.minutes, counted: r.status === "approved", submittedAt: r.submitted_at });
  }
  return out.sort((a, b) => a.when.localeCompare(b.when));
}
const KINDS = [["week", "Tuần"], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"], ["custom", "Tùy chỉnh"]];
const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";
function LeaveReport({ rows, atts, name, onOpenAtt, mode = "leave" }) {
  const attOnly = mode === "att";
  const { can } = useCurrentUser();
  const brand = useBranding();
  const today = todayVn();
  const cy = Number(today.slice(0, 4));
  const [kind, setKind] = reactExports.useState("month");
  const [year, setYear] = reactExports.useState(cy);
  const [week, setWeek] = reactExports.useState(isoWeekOf(today).week);
  const [month, setMonth] = reactExports.useState(Number(today.slice(5, 7)));
  const [quarter, setQuarter] = reactExports.useState(Math.ceil(Number(today.slice(5, 7)) / 3));
  const [cs, setCs] = reactExports.useState(today.slice(0, 8) + "01");
  const [ce, setCe] = reactExports.useState(today);
  const [openUser, setOpenUser] = reactExports.useState(null);
  const range = reactExports.useMemo(() => rangeOf(kind, { year, week, month, quarter, start: cs, end: ce }), [kind, year, week, month, quarter, cs, ce]);
  const periodLabel = `${KINDS.find((k) => k[0] === kind)[1]}${kind === "week" ? ` ${week}/${year}` : kind === "month" ? ` ${month}/${year}` : kind === "quarter" ? ` ${quarter}/${year}` : kind === "year" ? ` ${year}` : ""}: ${fmtDate(range.start)} – ${fmtDate(range.end)}`;
  const data = reactExports.useMemo(() => buildReport(rows, range).sort((a, b) => name(a.userId).localeCompare(name(b.userId), "vi")), [rows, range, name]);
  const details = reactExports.useMemo(() => buildDetails(rows, range), [rows, range]);
  const total = data.reduce((t, r) => ({ days: t.days + r.leaveDays, late: t.late + r.lateCount, early: t.early + r.earlyCount, pending: t.pending + r.pending, rejected: t.rejected + r.rejected }), { days: 0, late: 0, early: 0, pending: 0, rejected: 0 });
  const attRows = reactExports.useMemo(() => atts ? attInRange(atts, range.start, range.end).sort((a, b) => a.work_date.localeCompare(b.work_date)) : [], [atts, range]);
  const attSum = reactExports.useMemo(() => attSummary(attRows).sort((a, b) => name(a.owner_id).localeCompare(name(b.owner_id), "vi")), [attRows, name]);
  const years = Array.from({ length: 7 }, (_, i) => cy - 5 + i);
  const exportXlsx = async () => {
    const XLSX = await import("../_libs/xlsx.mjs");
    const title = `${brand.app_name} — ${brand.org_name} — ${attOnly ? "Báo cáo giải trình chấm công" : "Báo cáo đơn từ"} — ${periodLabel}`;
    const wb = XLSX.utils.book_new();
    if (!attOnly) {
      const sumHead = ["Nhân viên", "Số đơn nghỉ phép", "Số ngày nghỉ", "Số lần đi muộn", "Phút đi muộn", "Số lần về sớm", "Phút về sớm", "Đơn chờ duyệt", "Đơn bị từ chối"];
      const sumRows = data.map((r) => [name(r.userId), r.leaveCount, r.leaveDays, r.lateCount, r.lateMinutes, r.earlyCount, r.earlyMinutes, r.pending, r.rejected]);
      const tot = ["TỔNG", data.reduce((s, r) => s + r.leaveCount, 0), Math.round(total.days * 100) / 100, total.late, data.reduce((s, r) => s + r.lateMinutes, 0), total.early, data.reduce((s, r) => s + r.earlyMinutes, 0), total.pending, total.rejected];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], [], sumHead, ...sumRows, tot]), "Tổng hợp");
      const dHead = ["Nhân viên", "Loại đơn", "Thời gian đăng ký", "Ngày nghỉ trong kỳ", "Số phút", "Trạng thái", "Tính vào tổng"];
      const dRows = [...details].sort((a, b) => name(a.userId).localeCompare(name(b.userId), "vi")).map((d) => [name(d.userId), TYPE_LABEL[d.type] ?? d.type, whenText(d), d.type === "leave" ? d.days : "", d.type === "leave" ? "" : d.minutes, STATUS_LABEL[d.status] ?? d.status, d.counted ? "Có" : "Không"]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[title], ["Chỉ đơn Đã duyệt được tính vào bảng Tổng hợp."], dHead, ...dRows]), "Chi tiết");
    }
    if (atts) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        [title],
        ["Tính theo ngày quên chấm công. Giải trình đã thu hồi không tính."],
        ["Nhân viên", "Tổng số lần", "Quên chấm công vào", "Quên chấm công ra", "Quên cả hai", "Chưa đối chiếu", "Đã đối chiếu"],
        ...attSum.map((r) => [name(r.owner_id), r.total, r.in, r.out, r.both, r.unreconciled, r.reconciled])
      ]), "Giải trình - Tổng hợp");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        [title],
        [],
        ["Nhân viên", "Ngày quên chấm công", "Gửi lúc", "Nội dung", "Giờ tự khai báo", "Lý do", "Chi tiết", "Người làm chứng", "Kết quả làm chứng", "Trạng thái đối chiếu", "Người đối chiếu", "Thời điểm đối chiếu", "Ghi chú đối chiếu"],
        ...attRows.map((a) => [name(a.owner_id), fmtDate(a.work_date), fmtVn(a.submitted_at), KIND_LABEL[a.kind], declaredTime(a), a.reason_name, a.detail ?? "", name(a.witness_id), WITNESS_LABEL[a.witness_status], a.reconciled ? "Đã đối chiếu" : "Chưa đối chiếu", a.reconciled ? name(a.reconciled_by) : "", a.reconciled_at ? fmtVn(a.reconciled_at) : "", a.reconcile_note ?? ""])
      ]), "Giải trình - Chi tiết");
    }
    XLSX.writeFile(wb, `${brand.short_name.replace(/[^\p{L}\p{N}]+/gu, "-")}-${attOnly ? "bao-cao-giai-trinh" : "bao-cao-don-tu"}-${range.start}_${range.end}.xlsx`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex max-w-full overflow-x-auto rounded-lg bg-muted p-1 text-sm", children: KINDS.map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: kind === k ? "secondary" : "ghost", onClick: () => setKind(k), className: "shrink-0 max-md:min-h-11", children: l }, k)) }),
      kind === "week" && /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: sel, value: week, onChange: (e) => setWeek(+e.target.value), children: Array.from({ length: weeksInYear(year) }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: i + 1, children: [
        "Tuần ",
        i + 1
      ] }, i)) }),
      kind === "month" && /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: sel, value: month, onChange: (e) => setMonth(+e.target.value), children: Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: i + 1, children: [
        "Tháng ",
        i + 1
      ] }, i)) }),
      kind === "quarter" && /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: sel, value: quarter, onChange: (e) => setQuarter(+e.target.value), children: [1, 2, 3, 4].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: q, children: [
        "Quý ",
        q
      ] }, q)) }),
      kind !== "custom" && /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: sel, value: year, onChange: (e) => {
        const y = +e.target.value;
        setYear(y);
        if (week > weeksInYear(y)) setWeek(weeksInYear(y));
      }, children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: y, children: [
        "Năm ",
        y
      ] }, y)) }),
      kind === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: cs, onChange: (e) => e.target.value && setCs(e.target.value), className: "w-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground self-center", children: "đến" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: ce, onChange: (e) => e.target.value && setCe(e.target.value), className: "w-40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      can("leave.export") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: exportXlsx, disabled: !details.length && !attRows.length, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
        "Xuất Excel"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
      "Đang thống kê: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: periodLabel })
    ] }),
    !attOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-3", children: [["Ngày nghỉ đã duyệt", fmtDays(Math.round(total.days * 100) / 100)], ["Lần đi muộn", total.late], ["Lần về sớm", total.early], ["Đơn chờ duyệt", total.pending], ["Đơn bị từ chối", total.rejected]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: l }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold mt-1", children: v })
      ] }) }, l)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cnReportMobile(attOnly), children: data.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-lg border bg-card p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "h-auto w-full justify-between px-0 whitespace-normal text-left", onClick: () => setOpenUser(openUser === r.userId ? null : r.userId), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 font-medium", children: name(r.userId) }),
          openUser === r.userId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "shrink-0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          fmtDays(r.leaveDays),
          " ngày nghỉ · ",
          r.lateCount,
          " lần đi muộn · ",
          r.earlyCount,
          " lần về sớm"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          r.pending,
          " chờ duyệt · ",
          r.rejected,
          " từ chối"
        ] }),
        openUser === r.userId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-2 space-y-2", children: details.filter((d) => d.userId === r.userId).map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            TYPE_LABEL[d.type],
            " · ",
            whenText(d)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            d.type === "leave" ? `${fmtDays(d.days)} ngày` : `${d.minutes} phút`,
            " · ",
            STATUS_LABEL[d.status]
          ] })
        ] }, d.id ?? i)) })
      ] }, r.userId)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: attOnly ? "" : "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Nhân viên", "Đơn nghỉ", "Ngày nghỉ", "Đi muộn (lần/phút)", "Về sớm (lần/phút)", "Chờ duyệt", "Từ chối"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2 whitespace-nowrap", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          data.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t cursor-pointer hover:bg-muted/40", onClick: () => setOpenUser(openUser === r.userId ? null : r.userId), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                openUser === r.userId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
                name(r.userId)
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.leaveCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDays(r.leaveDays) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
                r.lateCount,
                " / ",
                r.lateMinutes
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
                r.earlyCount,
                " / ",
                r.earlyMinutes
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.pending }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.rejected })
            ] }),
            openUser === r.userId && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "bg-muted/20 px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DetailTable, { rows: details.filter((d) => d.userId === r.userId) }) }) })
          ] }, r.userId)),
          !data.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-3 py-10 text-center text-muted-foreground", children: "Không có đơn nào trong khoảng thời gian này." }) })
        ] })
      ] }) }) })
    ] }),
    atts && /* @__PURE__ */ jsxRuntimeExports.jsx(AttSection, { sum: attSum, rows: attRows, name, onOpen: onOpenAtt }),
    !attOnly && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tính theo ngày đăng ký nghỉ/đi muộn/về sớm, không theo ngày gửi đơn. Chỉ đơn đã duyệt được cộng vào tổng; đơn nghỉ qua nhiều kỳ được chia theo từng ngày làm việc. Bấm vào tên nhân viên để xem chi tiết từng đơn. Báo cáo gồm những đơn bạn được quyền xem." })
  ] });
}
const cnReportMobile = (attOnly) => attOnly ? "hidden" : "md:hidden space-y-2";
function whenText(d) {
  if (d.type !== "leave") return fmtDate(d.when);
  const [a, b] = d.when.split(" → ");
  return a === b ? fmtDate(a) : `${fmtDate(a)} – ${fmtDate(b)}`;
}
function DetailTable({ rows }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Loại đơn", "Thời gian đăng ký", "Trong kỳ", "Trạng thái", "Tính vào tổng"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-2 py-1", children: h }, h)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${d.counted ? "" : "text-muted-foreground"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1", children: TYPE_LABEL[d.type] ?? d.type }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1", children: whenText(d) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1", children: d.type === "leave" ? `${fmtDays(d.days)} ngày` : `${d.minutes} phút` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1", children: STATUS_LABEL[d.status] ?? d.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1", children: d.counted ? "Có" : "Không" })
    ] }, d.id ?? i)) })
  ] });
}
function AttSection({ sum, rows, name, onOpen }) {
  const th = "text-left font-medium px-3 py-2 whitespace-nowrap";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Giải trình Chấm Công" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Nhân viên", "Tổng", "Quên vào", "Quên ra", "Quên cả hai", "Chưa đối chiếu", "Đã đối chiếu"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: th, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        sum.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: name(r.owner_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.total }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.in }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.out }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.both }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.unreconciled }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.reconciled })
        ] }, r.owner_id)),
        !sum.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-3 py-8 text-center text-muted-foreground", children: "Không có giải trình nào trong khoảng thời gian này." }) })
      ] })
    ] }) }) }),
    rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Nhân viên", "Ngày quên", "Gửi lúc", "Nội dung", "Giờ tự khai", "Lý do", "Người làm chứng", "Làm chứng", "Đối chiếu"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: th, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t cursor-pointer hover:bg-muted/40", onClick: () => onOpen?.(a.id), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: name(a.owner_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: fmtDate(a.work_date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 whitespace-nowrap", children: fmtVn(a.submitted_at) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: KIND_LABEL[a.kind] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 whitespace-nowrap", children: declaredTime(a) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: a.reason_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: name(a.witness_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: WITNESS_LABEL[a.witness_status] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 whitespace-nowrap", children: a.reconciled ? `Đã · ${name(a.reconciled_by)} · ${fmtVn(a.reconciled_at)}` : "Chưa" })
      ] }, a.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Giải trình tính theo ngày quên chấm công, không cộng vào thống kê nghỉ phép, đi muộn, về sớm. Giải trình đã thu hồi không tính. Bấm một dòng để xem đầy đủ và lịch sử." })
  ] });
}
export {
  LeaveReport as L
};
