import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as useAuth, b as useStore, b0 as buildOverview, a$ as buildEmployeeReport, ab as getKpiMetric, aF as createKpiService, aG as cloudRepository } from "./router-CkmTURa-.mjs";
function monthEnd(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${key.slice(0, 7)}-${String(d).padStart(2, "0")}`;
}
function shortMonth(ps, pe) {
  if (!ps || !pe || !ps.endsWith("-01") || ps.slice(0, 7) !== pe.slice(0, 7)) return null;
  const end = monthEnd(ps);
  return pe !== end && pe >= monthEnd(ps).slice(0, 8) + "28" ? end : null;
}
const fmt = (k) => k.split("-").reverse().join("/");
function ReportDiagnosis({ ps, pe, periods, items, goals, shown, hasFilter, isAdmin }) {
  const ids = new Set(periods.map((p) => p.id));
  const assigned = items.filter((i) => ids.has(i.kpiPeriodId)).length;
  const overlapGoals = goals.filter((g) => g.periodStart <= pe && g.periodEnd >= ps);
  const goalItems = (g) => items.filter((i) => periods.some((p) => p.id === i.kpiPeriodId && p.goalId === g.id)).length;
  const unallocated = overlapGoals.filter((g) => goalItems(g) === 0);
  const short = shortMonth(ps, pe);
  const locked = periods.some((p) => p.status === "locked" || p.status === "closed");
  const link = /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/kpi-v2", className: "font-medium text-primary hover:underline", children: "Mở Giao KPI →" });
  const msgs = [];
  if (short) msgs.push(/* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    "Kỳ đang chọn kết thúc ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmt(pe) }),
    ", không phải ngày cuối tháng ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmt(short) }),
    ". Kết quả ngày cuối tháng sẽ không được tính vào kỳ này.",
    locked ? " Kỳ đã khóa nên hệ thống không tự sửa." : " Kiểm tra lại ngày kết thúc kỳ trong Giao KPI."
  ] }));
  if (assigned === 0) {
    msgs.push(/* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Chưa được giao KPI:" }),
      " kỳ ",
      fmt(ps),
      " → ",
      fmt(pe),
      " có ",
      periods.length,
      " kỳ nhân sự nhưng chưa có chỉ tiêu nào.",
      " ",
      unallocated.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Mục tiêu chưa phân bổ: ",
        unallocated.map((g) => `“${g.title}”`).join(", "),
        ". "
      ] }),
      isAdmin && link
    ] }));
  } else if (shown === 0 && hasFilter) {
    msgs.push(/* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Có dữ liệu nhưng bị lọc mất:" }),
      " kỳ này có ",
      assigned,
      " chỉ tiêu đã giao nhưng không chỉ tiêu nào khớp bộ lọc thương hiệu/kênh/nhóm chỉ số. Hãy bỏ bớt bộ lọc."
    ] }));
  } else if (unallocated.length > 0) {
    msgs.push(/* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      "Mục tiêu chưa phân bổ cho nhân sự: ",
      unallocated.map((g) => `“${g.title}”`).join(", "),
      ". ",
      isAdmin && link
    ] }));
  }
  if (assigned > 0 && shown > 0) msgs.push(/* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
    "Chỉ tiêu hiển thị 0 nghĩa là ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "đã giao nhưng chưa có kết quả" }),
    " được ghi nhận trong kỳ."
  ] }));
  if (!msgs.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-sm", children: msgs.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: m }, i)) });
}
const svc$1 = createKpiService(cloudRepository);
const inp$1 = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const chip$1 = "cursor-pointer underline-offset-2 hover:underline";
const todayVN$1 = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(/* @__PURE__ */ new Date());
const pctText = (r) => r.pct === null ? "N/A" : `${r.pct}%`;
function SourceLink({ t, id, websiteId, socialId, children }) {
  if (t === "web_content" && websiteId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/websites/$id", params: { id: websiteId }, className: "text-primary hover:underline", children });
  if (t === "social_post" && socialId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/social/$id", params: { id: socialId }, className: "text-primary hover:underline", children });
  if (t === "keyword" && websiteId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/websites/$id", params: { id: websiteId }, className: "text-primary hover:underline", children });
  if (t === "map_post") return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/local", className: "text-primary hover:underline", children });
  if (t === "task") return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tasks", className: "text-primary hover:underline", children });
  if (t === "video") return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/videos", className: "text-primary hover:underline", children });
  if (t === "design_order") return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/orders", className: "text-primary hover:underline", children });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/web-contents", className: "text-primary hover:underline", children });
}
function ReportV2({ actor, search = {} }) {
  const users = useAuth((s) => s.users);
  const store = useStore();
  const dbAll = reactExports.useMemo(() => svc$1.listForActor(actor), [actor]);
  const [history, setHistory] = reactExports.useState(false);
  const db = reactExports.useMemo(() => {
    if (history) return dbAll;
    const inactive = new Set(dbAll.goals.filter((g) => g.status === "cancelled" || g.metadata?.archived).map((g) => g.id));
    if (!inactive.size) return dbAll;
    return { ...dbAll, goals: dbAll.goals.filter((g) => !inactive.has(g.id)), periods: dbAll.periods.filter((p) => !(p.goalId && inactive.has(p.goalId))) };
  }, [dbAll, history]);
  const periodKeys = [...new Set(db.periods.map((p) => `${p.periodStart}|${p.periodEnd}`))].sort().reverse();
  const sk = search.from && search.to ? `${search.from}|${search.to}` : "";
  const [pk, setPk] = reactExports.useState(periodKeys.includes(sk) ? sk : periodKeys[0] ?? "");
  const [metric, setMetric] = reactExports.useState(search.metric ?? "");
  const [userId, setUserId] = reactExports.useState(actor.isAdmin ? search.userId ?? "" : "");
  const [brandId, setBrandId] = reactExports.useState(search.brandId ?? "");
  const [channel, setChannel] = reactExports.useState(search.websiteId ? `w:${search.websiteId}` : search.socialId ? `s:${search.socialId}` : "");
  const [group, setGroup] = reactExports.useState(search.group ?? "");
  const [open, setOpen] = reactExports.useState(null);
  const [drill, setDrill] = reactExports.useState(null);
  const today = todayVN$1();
  const pkEff = periodKeys.includes(pk) ? pk : periodKeys[0] ?? "";
  const [ps, pe] = pkEff.split("|");
  const periods = db.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
  const visibleUsers = users.filter((u) => periods.some((p) => p.userId === u.id) && (!userId || u.id === userId));
  const filters = { brandId: brandId || void 0, websiteId: channel.startsWith("w:") ? channel.slice(2) : void 0, socialId: channel.startsWith("s:") ? channel.slice(2) : void 0, group };
  const data = { tasks: store.tasks, webContents: store.webContents, socialPosts: store.socialPosts, videos: store.videos, orders: store.orders, keywords: store.keywords, mapPosts: store.mapPosts, websites: store.websites, growth: store.growth };
  const reports = visibleUsers.map((u) => ({ u, r: buildEmployeeReport({ user: u, allUsers: users, periods, items: metric ? db.items.filter((i) => i.metricKey === metric) : db.items, adjustments: db.adjustments, data, filters, today }) }));
  const bname = (id) => store.brands.find((b) => b.id === id)?.name ?? "—";
  const cname = (w, s) => w ? `Web: ${store.websites.find((x) => x.id === w)?.name ?? w}` : s ? `Page: ${store.socials.find((x) => x.id === s)?.name ?? s}` : "—";
  const histToggle = /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 self-center text-xs text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: history, onChange: (e) => setHistory(e.target.checked) }),
    " Xem lịch sử (mục tiêu đã hủy/lưu trữ)"
  ] });
  if (!periodKeys.length) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Chưa có kỳ KPI nào đang hiệu lực ",
      actor.isAdmin ? "(giao KPI tại /settings/kpi-v2)" : "được giao cho bạn",
      "."
    ] }),
    histToggle
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: inp$1, value: pkEff, onChange: (e) => setPk(e.target.value), children: periodKeys.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: k.replace("|", " → ") }, k)) }),
      histToggle,
      actor.isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: userId, onChange: (e) => setUserId(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả nhân sự" }),
        users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.fullName || u.username }, u.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: brandId, onChange: (e) => {
        setBrandId(e.target.value);
        setChannel("");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả thương hiệu" }),
        store.brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.id, children: b.name }, b.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: channel, disabled: !brandId, onChange: (e) => setChannel(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Website/Page" }),
        store.websites.filter((w) => w.brandId === brandId).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `w:${w.id}`, children: [
          "Web: ",
          w.name
        ] }, w.id)),
        store.socials.filter((s) => s.brandId === brandId).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `s:${s.id}`, children: [
          "Page: ",
          s.name
        ] }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp$1, value: group, onChange: (e) => setGroup(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Mọi nhóm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "web", children: "Web" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "social", children: "Social" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "video", children: "Video" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "design", children: "Thiết kế" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "task", children: "Task" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/overview-v2", search: { from: ps, to: pe, brandId: brandId || void 0, websiteId: channel.startsWith("w:") ? channel.slice(2) : void 0, socialId: channel.startsWith("s:") ? channel.slice(2) : void 0, metric: metric || void 0, userId: userId || void 0, group: group || void 0 }, className: "self-center text-xs text-primary hover:underline", children: "→ Xem Tổng quan (giữ bộ lọc)" })
    ] }),
    metric && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
      "Đang lọc chỉ tiêu: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: metric }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-primary underline", onClick: () => setMetric(""), children: "bỏ lọc" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReportDiagnosis,
      {
        ps,
        pe,
        periods,
        items: db.items,
        goals: db.goals,
        isAdmin: actor.isAdmin,
        shown: reports.reduce((n, x) => n + x.r.items.length, 0),
        hasFilter: !!(brandId || channel || group || metric || userId)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Ngày tính theo giờ Việt Nam. Việc được credit theo ngày ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "nộp bản được duyệt" }),
      " — bài nộp cuối kỳ nhưng duyệt sang kỳ sau vẫn thuộc kỳ nộp; bài đang chờ duyệt chưa tính vào hoàn thành và nằm ở cột “Chờ duyệt”."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[720px] text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Nhân sự" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Sản lượng / Chỉ tiêu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Đúng hạn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Duyệt lần đầu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Quá hạn" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: reports.map(({ u, r }) => {
        const allEv = r.items.flatMap((i) => i.evidence);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "font-medium hover:underline", onClick: () => setOpen(open === u.id ? null : u.id), children: [
                open === u.id ? "▾" : "▸",
                " ",
                u.fullName || u.username
              ] }),
              r.ambiguousName && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Trùng tên — chỉ khớp theo tài khoản" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
              r.items.filter((i) => !i.contributionOnly).map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  i.label,
                  ":"
                ] }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "evidence", title: i.label, rows: i.evidence }), children: i.actual === null ? "Chưa đủ dữ liệu" : i.actual }),
                " / ",
                i.target
              ] }, i.item.id)),
              !r.items.some((i) => !i.contributionOnly) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: chip$1, onClick: () => setDrill({ kind: "evidence", title: `Sản lượng — ${u.fullName}`, rows: allEv }), children: [
                r.output,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(không có chỉ tiêu trong phạm vi lọc)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "ratio", title: "Đúng hạn", r: r.onTime, rows: allEv, field: "onTime" }), children: pctText(r.onTime) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "ratio", title: "Duyệt lần đầu", r: r.quality, rows: allEv, field: "firstPass" }), children: pctText(r.quality) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "work", title: "Quá hạn", rows: r.overdue }), children: r.overdue.length }) })
          ] }),
          open === u.id && r.items.map((it) => {
            const p = r.periods.find((x) => x.id === it.item.kpiPeriodId);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border bg-muted/40 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "breakdown", title: `Phân bổ — ${it.label}`, item: it, period: p }), children: it.label }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "(",
                  it.unit,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "evidence", title: it.label, rows: it.evidence }), children: it.actual === null ? "Chưa đủ dữ liệu" : `${it.actual}${it.unit === "percent" ? "%" : ""}` }),
                " / ",
                it.evaluation.state !== "contribution" && getKpiMetric(it.item.metricKey)?.direction === "at_most" ? "≤ " : "",
                it.contributionOnly ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: "KPI toàn cục — đây chỉ là đóng góp trong phạm vi lọc", children: [
                  "N/A (Đóng góp hiện tại · target toàn cục ",
                  it.target,
                  ")"
                ] }) : it.target,
                it.lockedTarget !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-muted-foreground", children: "(snapshot khi khóa)" }),
                it.adjustments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-muted-foreground", title: it.adjustments.map((a) => `${a.at.slice(0, 10)}: ${a.from}→${a.to}`).join("\n"), children: [
                  "· ",
                  it.adjustments.length,
                  " điều chỉnh"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 3, className: "text-muted-foreground", children: [
                it.evaluation.label,
                it.evaluation.state === "overdue" && it.achieved === null && it.warnings ? " (chưa kết luận — còn mục chưa xác minh)" : "",
                " · hạn ",
                it.deadline.split("-").reverse().join("/"),
                it.lockedSource === "snapshot" ? " · kết quả đã chốt" : it.lockedSource === "live" ? " · kỳ khóa chưa có bản chốt, đang tính lại" : "",
                it.warnings ? ` · ${it.warnings} mục chưa xác minh` : "",
                " · kỳ ",
                p.status
              ] })
            ] }, it.item.id);
          }),
          open === u.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border bg-muted/40 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-1.5 text-muted-foreground", children: "Trạng thái chi tiết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 4, children: [
              "Tồn việc: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "work", title: "Tồn việc", rows: r.backlog }), children: r.backlog.length }),
              " · Đang chờ người duyệt: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip$1, onClick: () => setDrill({ kind: "work", title: "Đang chờ người duyệt", rows: r.waitingReview }), children: r.waitingReview.length }),
              " · Chỉ tiêu đạt: ",
              r.achievedCount,
              "/",
              r.assignedCount
            ] })
          ] })
        ] }, u.id);
      }) })
    ] }) }),
    drill && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: drill.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-muted-foreground", onClick: () => setDrill(null), children: "Đóng" })
      ] }),
      drill.kind === "ratio" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 text-xs text-muted-foreground", children: [
        "Tử số ",
        drill.r.num,
        " / mẫu số ",
        drill.r.den,
        " (chỉ việc có ",
        drill.field === "onTime" ? "deadline hợp lệ" : "lịch sử duyệt tin cậy",
        "). ",
        drill.r.den === 0 && "Mẫu số 0 → N/A."
      ] }),
      drill.kind === "breakdown" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
        drill.item.breakdown.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          bname(b.brandId),
          " · ",
          cname(b.websiteId, b.socialId),
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: b.count }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/overview-v2", search: { from: drill.period.periodStart, to: drill.period.periodEnd, brandId: b.brandId ?? void 0, websiteId: b.websiteId ?? void 0, socialId: b.socialId ?? void 0, metric: drill.item.item.metricKey }, className: "text-xs text-primary hover:underline", children: "→ Tổng quan V2" })
        ] }, b.key)),
        !drill.item.breakdown.length && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-muted-foreground", children: "Không có evidence." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (drill.kind === "ratio" ? drill.rows.filter((e) => e[drill.field] !== null) : drill.rows).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SourceLink, { t: e.sourceType, id: e.sourceId, websiteId: e.websiteId, socialId: e.socialId, children: e.title }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs text-muted-foreground", children: e.sourceType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs", children: "creditedAt" in e ? `nộp ${e.creditedAt}` : e.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-xs", children: [
          "hạn ",
          e.deadline ? e.deadline.slice(0, 10) : "N/A"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs", children: drill.kind === "ratio" ? e[drill.field] ? "✓" : "✗" : "overdue" in e && e.overdue ? "Quá hạn" : "" })
      ] }, `${e.sourceType}${e.sourceId}`)) }) })
    ] })
  ] });
}
const svc = createKpiService(cloudRepository);
const inp = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const chip = "cursor-pointer underline-offset-2 hover:underline";
const todayVN = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(/* @__PURE__ */ new Date());
function OverviewV2({ actor, search = {} }) {
  const users = useAuth((s) => s.users);
  const store = useStore();
  const db = reactExports.useMemo(() => svc.listForActor(actor), [actor]);
  const periodKeys = [...new Set(db.periods.map((p) => `${p.periodStart}|${p.periodEnd}`))].sort().reverse();
  const sk = search.from && search.to ? `${search.from}|${search.to}` : "";
  const [pk, setPk] = reactExports.useState(periodKeys.includes(sk) ? sk : periodKeys[0] ?? "");
  const [brandId, setBrandId] = reactExports.useState(search.brandId ?? "");
  const [channel, setChannel] = reactExports.useState(search.websiteId ? `w:${search.websiteId}` : search.socialId ? `s:${search.socialId}` : "");
  const [metric, setMetric] = reactExports.useState(search.metric ?? "");
  const [group, setGroup] = reactExports.useState(search.group ?? "");
  const userCtx = actor.isAdmin ? search.userId : void 0;
  const [drill, setDrill] = reactExports.useState(null);
  const [ps, pe] = pk.split("|");
  const periods = db.periods.filter((p) => p.periodStart === ps && p.periodEnd === pe);
  const websiteId = channel.startsWith("w:") ? channel.slice(2) : void 0;
  const socialId = channel.startsWith("s:") ? channel.slice(2) : void 0;
  const ov = buildOverview({
    users,
    goals: db.goals.filter((g) => g.periodStart <= pe && g.periodEnd >= ps),
    periods,
    items: db.items,
    adjustments: db.adjustments,
    data: { tasks: store.tasks, webContents: store.webContents, socialPosts: store.socialPosts, videos: store.videos, orders: store.orders, keywords: store.keywords, mapPosts: store.mapPosts, websites: store.websites, growth: store.growth },
    filters: { brandId: brandId || void 0, websiteId, socialId, metricKey: metric || void 0, userId: userCtx, group: group || void 0 },
    today: todayVN()
  });
  const bname = (id) => store.brands.find((b) => b.id === id)?.name ?? "—";
  const aname = (w, s) => w ? `Web: ${store.websites.find((x) => x.id === w)?.name ?? w}` : s ? `Page: ${store.socials.find((x) => x.id === s)?.name ?? s}` : "—";
  const repSearch = (userId, metricKey, asset) => ({ from: ps, to: pe, brandId: (asset?.brandId ?? brandId) || void 0, websiteId: asset ? asset.websiteId ?? void 0 : websiteId, socialId: asset ? asset.socialId ?? void 0 : socialId, metric: metricKey, userId, group: group || void 0 });
  if (!periodKeys.length) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có kỳ KPI nào." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: inp, value: pk, onChange: (e) => setPk(e.target.value), children: periodKeys.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: k.replace("|", " → ") }, k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp, value: brandId, onChange: (e) => {
        setBrandId(e.target.value);
        setChannel("");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả thương hiệu" }),
        store.brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.id, children: b.name }, b.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp, value: channel, disabled: !brandId, onChange: (e) => setChannel(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Website/Page" }),
        store.websites.filter((w) => w.brandId === brandId).map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `w:${w.id}`, children: [
          "Web: ",
          w.name
        ] }, w.id)),
        store.socials.filter((s) => s.brandId === brandId).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: `s:${s.id}`, children: [
          "Page: ",
          s.name
        ] }, s.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inp, value: group, onChange: (e) => setGroup(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả nhóm chỉ số" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "web", children: "Website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "social", children: "Social" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "video", children: "Video" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "design", children: "Thiết kế" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "task", children: "Công việc" })
      ] }),
      metric && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `${inp} text-xs`, onClick: () => setMetric(""), children: [
        "Chỉ tiêu: ",
        metric,
        " ✕"
      ] }),
      userCtx && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "self-center text-xs text-muted-foreground", children: [
        "Ngữ cảnh nhân sự: ",
        users.find((u) => u.id === userCtx)?.fullName ?? userCtx
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/reports-v2", search: repSearch(userCtx, metric || void 0), className: "self-center text-xs text-primary hover:underline", children: "→ Báo cáo nhân sự V2 (giữ bộ lọc)" })
    ] }),
    !actor.isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Bạn chỉ thấy phần KPI được giao cho chính mình." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReportDiagnosis,
      {
        ps,
        pe,
        periods,
        items: db.items,
        goals: db.goals,
        isAdmin: actor.isAdmin,
        shown: ov.metrics.length,
        hasFilter: !!(brandId || channel || group || metric || userCtx)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-semibold", children: "Tiến độ theo chỉ tiêu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs text-muted-foreground", children: "Tổng thực hiện / tổng mục tiêu của các nhân sự cùng chỉ tiêu (không lấy trung bình %). Các chỉ tiêu khác đơn vị không cộng chung." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[640px] text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Chỉ tiêu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Thực hiện / Mục tiêu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Sản phẩm duy nhất" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Nhân sự" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Chưa phân bổ" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          ov.metrics.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip, onClick: () => setDrill({ title: m.label, metric: m }), children: m.label }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                m.unit,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
              m.target > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                m.actual,
                m.status !== "ok" ? " (đã xác minh, một phần)" : "",
                " / ",
                m.target
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: "KPI toàn cục chưa phân bổ cho phạm vi đang lọc", children: [
                m.contributionActual,
                " / N/A (đóng góp)"
              ] }),
              m.unverifiedAssignments > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs text-muted-foreground", children: [
                "· ",
                m.unverifiedAssignments,
                " phần chưa đủ dữ liệu"
              ] }),
              m.target > 0 && m.contributionItems > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs text-muted-foreground", children: [
                "· +",
                m.contributionActual,
                " đóng góp từ KPI toàn cục"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: m.status === "reconciling" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `${m.overlapItems} KPI phạm vi hẹp nằm trong KPI rộng hơn của cùng người — coi là breakdown, không cộng lại`, children: "Đang đối soát" }) : m.status === "insufficient" ? "Chưa đủ dữ liệu" : m.pct === null ? m.achieved === null ? "N/A" : m.achieved ? "Đạt" : "Không đạt" : `${m.pct}%` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip, onClick: () => setDrill({ title: `Sản phẩm — ${m.label}`, rows: m.evidence }), children: m.uniqueAssets }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs", children: m.contributions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/reports-v2", search: repSearch(c.userId, m.metricKey), className: "mr-2 text-primary hover:underline", children: [
              c.userName,
              " ",
              c.actual ?? "N/A",
              "/",
              c.contributionOnly ? "N/A" : c.target
            ] }, c.itemId)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs", children: m.unallocatedTarget > 0 ? `${m.unallocatedTarget} chưa phân bổ xuống Web/Page` : "—" })
          ] }, m.key)),
          !ov.metrics.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-3 py-3 text-muted-foreground", children: "Không có chỉ tiêu trong phạm vi lọc." }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "grid gap-3 sm:grid-cols-3", children: [["Tồn việc", ov.backlog], ["Quá hạn", ov.overdue], ["Chờ người duyệt", ov.waitingReview]].map(([t, rows]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "rounded-lg border border-border p-3 text-left hover:bg-muted", onClick: () => setDrill({ title: t, rows: [...rows] }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold", children: rows.length })
    ] }, t)) }),
    (ov.videoTouched > 0 || ov.videoDelivered > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-sm", children: "Video (chẩn đoán công đoạn)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        "Video bàn giao: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: ov.videoDelivered }),
        " · Video có người tham gia ở ít nhất một công đoạn: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: ov.videoTouched }),
        ". Nhiều công đoạn trên cùng một video KHÔNG cộng thành nhiều sản phẩm bàn giao."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-semibold", children: "Mục tiêu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm", children: [
        ov.goals.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-lg border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: g.goal.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              bname(g.goal.brandId),
              " · ",
              g.people,
              " nhân sự · ",
              g.achieved === null ? "N/A" : g.achieved ? "Đạt" : "Chưa đạt"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs", children: g.metrics.length ? g.metrics.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mr-3", children: [
            m.label,
            ": ",
            m.actual,
            "/",
            m.target,
            " ",
            m.unit,
            m.unverified ? " (thiếu dữ liệu)" : ""
          ] }, m.key)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa phân bổ KPI" }) })
        ] }, g.goal.id)),
        !ov.goals.length && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-muted-foreground", children: "Không có mục tiêu trong kỳ." })
      ] })
    ] }),
    ov.unmet.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-semibold", children: "Chưa đạt / chưa phân bổ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm", children: ov.unmet.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        m.label,
        ": ",
        m.direction === "at_most" ? `vượt ${m.actual - m.target}` : `thiếu ${Math.max(0, m.target - m.actual)}`,
        " ",
        m.unit,
        m.unallocatedTarget ? ` · ${m.unallocatedTarget} chưa phân bổ` : ""
      ] }, m.key)) })
    ] }),
    drill && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: drill.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-muted-foreground", onClick: () => setDrill(null), children: "Đóng" })
      ] }),
      "metric" in drill ? /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
        drill.metric.assets.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          bname(a.brandId),
          " · ",
          aname(a.websiteId, a.socialId),
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: chip, onClick: () => setDrill({ title: aname(a.websiteId, a.socialId), rows: a.evidence }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: a.actual }) }),
          " / ",
          a.target ?? "Chưa phân bổ",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/reports-v2", search: repSearch(userCtx, drill.metric.metricKey, a), className: "text-xs text-primary hover:underline", children: "→ Báo cáo V2" })
        ] }, a.key)),
        drill.metric.contributionItems > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-muted-foreground", children: [
          "Đóng góp từ KPI toàn cục (không có mục tiêu riêng ở phạm vi này): ",
          drill.metric.contributionActual
        ] }),
        drill.metric.unallocatedTarget > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-muted-foreground", children: [
          "Chưa phân bổ xuống Web/Page: ",
          drill.metric.unallocatedTarget
        ] }),
        !drill.metric.assets.length && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-muted-foreground", children: "Chưa có dữ liệu theo kênh." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        drill.rows.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SourceLink, { t: e.sourceType, id: e.sourceId, websiteId: e.websiteId, socialId: e.socialId, children: e.title }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs text-muted-foreground", children: bname(e.brandId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-xs", children: "creditedAt" in e ? `nộp ${e.creditedAt}` : e.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-xs", children: [
            "hạn ",
            e.deadline ? e.deadline.slice(0, 10) : "N/A"
          ] })
        ] }, `${e.sourceType}${e.sourceId}`)),
        !drill.rows.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-muted-foreground", children: "Không có mục nào." }) })
      ] }) })
    ] })
  ] });
}
export {
  OverviewV2 as O,
  ReportV2 as R
};
