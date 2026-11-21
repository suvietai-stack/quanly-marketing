import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, F as useAuth, B as Button, D as Dialog, x as DialogContent, A as DialogTitle, bc as DialogDescription, L as Label, I as Input, T as Switch } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { c as chipiAssets } from "./states-C0pL4afS.mjs";
import { s as saoOptions, g as giftAvailable, a as availableStars, b as mayRedeem, d as decide, p as programActive, e as saveProgram, h as redeem, u as uploadGift, i as saveGift, j as grant } from "./logic-CUzbxsuC.mjs";
import { aC as RefreshCw, a6 as Plus, a4 as Star, ao as Pencil, a3 as Gift, bz as Upload, a0 as Wallet, a2 as Trophy, S as Sparkles, z as Settings, T as Target, u as ListChecks, bA as Signal, aR as History$1 } from "../_libs/lucide-react.mjs";
const programSources = { signal: "Tín hiệu", kpi: "KPI", task: "Công việc" };
const programFields = {
  signal: { field: "status", label: "Trạng thái", condition: "transition", conditionLabel: "Chuyển sang", value: "Chốt" },
  kpi: { field: "verified_task_rate", label: "Tỷ lệ hoàn thành KR liên kết Task", condition: "gte", conditionLabel: "Đạt từ", value: "%" },
  task: { field: "approved_completion", label: "Hoàn thành được xác nhận", condition: "event", conditionLabel: "Theo sự kiện", value: "Xác nhận hoàn thành" }
};
function newProgram(source = "signal") {
  return { id: crypto.randomUUID(), name: "", source, field: programFields[source].field, condition: programFields[source].condition, threshold: 100, stars: 30, enabled: false, enabled_at: null, starts_at: null, ends_at: null };
}
function programDescription(p) {
  if (p.source === "signal") return `Tín hiệu chuyển sang Chốt hợp lệ → Sale phụ trách nhận ${p.stars} Sao.`;
  if (p.source === "task") return `Công việc được xác nhận hoàn thành đúng quy trình → người phụ trách nhận ${p.stars} Sao.`;
  return `KR liên kết Task đạt từ ${p.threshold}% theo số Task đã xác nhận, khi kỳ được khóa → nhân viên nhận ${p.stars} Sao cho mỗi KR đạt.`;
}
function validProgram(p) {
  const f = programFields[p.source];
  return Boolean(p.name.trim()) && p.name.trim().length <= 150 && p.field === f.field && p.condition === f.condition && Number.isInteger(p.stars) && p.stars > 0 && p.stars <= 1e5 && Number.isFinite(p.threshold) && (p.source !== "kpi" || p.threshold >= 100 && p.threshold <= 1e3) && (!p.starts_at || Number.isFinite(Date.parse(p.starts_at))) && (!p.ends_at || Number.isFinite(Date.parse(p.ends_at))) && (!p.starts_at || !p.ends_at || Date.parse(p.ends_at) > Date.parse(p.starts_at));
}
function toVietnamInput(iso) {
  return iso ? new Date(Date.parse(iso) + 7 * 36e5).toISOString().slice(0, 16) : "";
}
function fromVietnamInput(value) {
  return value ? (/* @__PURE__ */ new Date(`${value}:00+07:00`)).toISOString() : null;
}
const when$2 = (v) => new Date(v).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
function Programs({ programs, ledger, busy, run }) {
  const [editing, setEditing] = reactExports.useState(null);
  const [history, setHistory] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Chương trình thưởng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setEditing(newProgram()), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Tạo chương trình"
      ] })
    ] }),
    programs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-muted-foreground", children: "Chưa có chương trình thưởng" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y border-y", children: programs.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "py-5 flex flex-col sm:flex-row justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold break-words", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: programSources[p.source] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 break-words", children: programDescription(p) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [
          p.starts_at ? `Từ ${when$2(p.starts_at)}` : "Không giới hạn ngày bắt đầu",
          " · ",
          p.ends_at ? `Đến ${when$2(p.ends_at)}` : "Không giới hạn ngày kết thúc"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-warning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: p.stars }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { "aria-label": `Bật chương trình ${p.name}`, checked: p.enabled, disabled: busy, onCheckedChange: (enabled) => void run(() => saveProgram({ ...p, enabled }), enabled ? "Đã bật chương trình, chỉ xét thành tích mới" : "Đã tắt chương trình") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: p.enabled ? "Đang bật" : "Đang tắt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", "aria-label": `Sửa ${p.name}`, title: "Sửa chương trình", onClick: () => setEditing(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": `Lịch sử ${p.name}`, title: "Lịch sử thưởng", onClick: () => setHistory(p), children: /* @__PURE__ */ jsxRuntimeExports.jsx(History$1, { className: "h-4 w-4" }) })
      ] })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: Boolean(editing), onOpenChange: (open) => {
      if (!open && !busy) setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "w-[calc(100%-32px)] max-h-[90dvh] overflow-y-auto block [&>form]:mt-4 [&>h2]:mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: programs.some((p) => p.id === editing?.id) ? "Chỉnh sửa chương trình" : "Tạo chương trình thưởng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Chỉ áp dụng cho thành tích mới; không cộng Sao cho lịch sử trước khi bật." }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: (e) => {
        e.preventDefault();
        if (!validProgram(editing)) return;
        void run(async () => {
          await saveProgram(editing);
          setEditing(null);
        }, "Đã lưu chương trình");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-name", children: "Tên chương trình" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "program-name", required: true, maxLength: 150, value: editing.name, onChange: (e) => setEditing({ ...editing, name: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-source", children: "Nguồn dữ liệu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.source, onValueChange: (v) => setEditing({ ...editing, source: v, field: programFields[v].field, condition: programFields[v].condition, threshold: 100 }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "program-source", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(programSources).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: programSources[s] }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-field", children: "Trường / chỉ số" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.field, onValueChange: (field) => setEditing({ ...editing, field }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "program-field", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: programFields[editing.source].field, children: programFields[editing.source].label }) })
          ] }, `field-${editing.source}`)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-condition", children: "Điều kiện kích hoạt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editing.condition, onValueChange: (condition) => setEditing({ ...editing, condition }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "program-condition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: programFields[editing.source].condition, children: programFields[editing.source].conditionLabel }) })
          ] }, `condition-${editing.source}`)
        ] }),
        editing.source === "kpi" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-threshold", children: "Tỷ lệ từ (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "program-threshold", type: "number", required: true, min: 100, max: 1e3, step: "0.01", value: editing.threshold, onChange: (e) => setEditing({ ...editing, threshold: Number(e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chỉ KR đếm Task hoặc kết quả Task cụ thể, không gắn Website/Social. Kỳ phải được khóa bởi người có quyền; số Task được xác minh tại thời điểm khóa." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Giá trị" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-medium", children: programFields[editing.source].value })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-stars", children: "Số Sao thưởng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "program-stars", type: "number", required: true, min: 1, max: 1e5, value: editing.stars, onChange: (e) => setEditing({ ...editing, stars: Number(e.target.value) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-sm font-medium mb-2", children: "Thời gian áp dụng (giờ Việt Nam)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-start", children: "Bắt đầu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "program-start", className: "min-w-0 w-full", type: "datetime-local", value: toVietnamInput(editing.starts_at), onChange: (e) => setEditing({ ...editing, starts_at: fromVietnamInput(e.target.value) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-end", children: "Kết thúc" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "program-end", className: "min-w-0 w-full", type: "datetime-local", value: toVietnamInput(editing.ends_at), onChange: (e) => setEditing({ ...editing, ends_at: fromVietnamInput(e.target.value) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "program-enabled", checked: editing.enabled, onCheckedChange: (enabled) => setEditing({ ...editing, enabled }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "program-enabled", children: "Bật chương trình" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-primary border-l-2 border-primary pl-3", children: programDescription(editing) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", type: "submit", disabled: busy || !validProgram(editing), children: "Lưu chương trình" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: Boolean(history), onOpenChange: (open) => {
      if (!open) setHistory(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "w-[calc(100%-32px)] max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Lịch sử thưởng · ",
        history?.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Các lần cộng Sao thành công trong chương trình này." }),
      ledger.filter((l) => l.program_id === history?.id).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4", children: "Chưa có lượt thưởng" }) : ledger.filter((l) => l.program_id === history?.id).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm break-words", children: l.reason }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: when$2(l.created_at) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-success", children: [
          "+",
          l.amount,
          " Sao"
        ] })
      ] }, l.id))
    ] }) })
  ] });
}
const icons = { signal: Signal, task: ListChecks, kpi: Target };
const when$1 = (v) => new Date(v).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
function EarnPrograms({ programs }) {
  const active = programs.filter((p) => programActive(p));
  if (active.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-10 w-10 mx-auto mb-3 text-chipi-orange" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "Chưa có chương trình nào đang áp dụng" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Khi Admin bật chương trình thưởng, cách kiếm Sao sẽ hiện tại đây." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: active.map((p) => {
    const Icon = icons[p.source];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-xl border bg-card shadow-card p-5 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-secondary p-2.5 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-primary", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold break-words", children: p.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-success whitespace-nowrap mt-1", children: "Đang áp dụng" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground break-words", children: programDescription(p) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-chipi-orange font-bold mt-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5 text-warning fill-warning", "aria-hidden": true }),
        "+",
        p.stars.toLocaleString("vi-VN"),
        " Sao"
      ] }),
      (p.starts_at || p.ends_at) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        p.starts_at ? `Từ ${when$1(p.starts_at)}` : "Không giới hạn bắt đầu",
        " · ",
        p.ends_at ? `Đến ${when$1(p.ends_at)}` : "Không giới hạn kết thúc"
      ] })
    ] }, p.id);
  }) });
}
const fmt = (n) => n.toLocaleString("vi-VN");
const when = (d) => new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
const statusLabel = { pending: "Đang giữ Sao", fulfilled: "Đã phát quà", cancelled: "Đã hủy" };
function SaoNav() {
  const { can } = useCurrentUser();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex flex-wrap gap-2 mb-6", "aria-label": "Sao Sứ Việt", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sao", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }),
      "Ví Sao của tôi"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sao/leaderboard", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }),
      "Bảng thành tích"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sao/shop", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4" }),
      "Gian hàng đổi quà"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sao/earn", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
      "Cách kiếm Sao"
    ] }) }),
    ["sao.program_manage", "sao.shop_manage", "sao.manual_grant"].some(can) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/sao/admin", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
      "Quản lý thưởng Sao"
    ] }) })
  ] });
}
function Balance({ data }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "sao-wallet-band flex items-center justify-between gap-4 p-5 sm:p-8 mb-6 rounded-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Sao Sứ Việt của bạn" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-4xl font-bold text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-9 w-9 text-warning fill-warning" }),
        fmt(data.balance)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Khả dụng ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(availableStars(data.balance, data.held)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Đang giữ ",
          fmt(data.held)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: chipiAssets.thankyou.url, className: "w-24 h-28 sm:w-36 sm:h-40 object-contain shrink-0", alt: "Đốm và Sao Sứ Việt" })
  ] });
}
function Empty({ text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-9 w-9 mx-auto mb-3 text-chipi-orange" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: text })
  ] });
}
function History({ data, admin }) {
  const users = useAuth((s) => s.users);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: data.ledger.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "Chưa có giao dịch Sao" }) : data.ledger.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 flex gap-3 justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm break-words", children: l.reason }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
        when(l.created_at),
        admin && ` · ${users.find((u) => u.id === l.user_id)?.fullName ?? l.user_id}`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
        "Số dư sau giao dịch: ",
        fmt(l.balance_after)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold whitespace-nowrap ${l.amount > 0 ? "text-success" : "text-chipi-orange"}`, children: [
      l.amount > 0 ? "+" : "",
      fmt(l.amount),
      " Sao"
    ] })
  ] }, l.id)) });
}
function Requests({ data, admin, run, busy }) {
  const users = useAuth((s) => s.users);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: data.requests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "Chưa có yêu cầu đổi quà" }) : data.requests.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 flex flex-wrap items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
        r.gift_name,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-chipi-orange", children: [
          "· ",
          fmt(r.price),
          " Sao"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        statusLabel[r.status],
        " · ",
        when(r.created_at)
      ] }),
      admin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: users.find((u) => u.id === r.user_id)?.fullName ?? r.user_id }),
      r.reason && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: r.reason })
    ] }),
    r.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      admin && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: () => {
        if (window.confirm(`Xác nhận đã phát “${r.gift_name}”? Trừ ${r.price} Sao đang giữ.`)) void run(() => decide(r.id, "fulfilled"), "Đã xác nhận phát quà");
      }, children: "Đã phát quà" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: busy, onClick: () => {
        if (window.confirm("Hủy yêu cầu và giải phóng Sao?")) void run(() => decide(r.id, "cancelled"), "Đã hủy và giải phóng Sao");
      }, children: "Hủy yêu cầu" })
    ] })
  ] }, r.id)) });
}
function SaoPage({ mode }) {
  const { user, can } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const queryClient = useQueryClient();
  const admin = mode === "admin";
  const allowed = !admin || ["sao.program_manage", "sao.shop_manage", "sao.manual_grant"].some(can);
  const q = useQuery({ ...saoOptions(user?.id ?? "", admin), enabled: Boolean(user) && allowed });
  const [busy, setBusy] = reactExports.useState(false);
  const [gift, setGift] = reactExports.useState(null);
  const [selected, setSelected] = reactExports.useState(null);
  const [requestId, setRequestId] = reactExports.useState("");
  const [manualOpen, setManualOpen] = reactExports.useState(false);
  const [recipient, setRecipient] = reactExports.useState("");
  const [stars, setStars] = reactExports.useState("");
  const [reason, setReason] = reactExports.useState("");
  const [manualId, setManualId] = reactExports.useState("");
  async function run(fn, message) {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: ["sao", user?.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : e?.message ?? "Không thực hiện được thao tác");
    } finally {
      setBusy(false);
    }
  }
  if (!allowed) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Bạn không có quyền quản lý Sao." });
  const title = mode === "wallet" ? "Ví Sao của tôi" : mode === "shop" ? "Gian hàng đổi quà" : mode === "earn" ? "Cách kiếm Sao" : "Quản lý thưởng Sao";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-44 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-chipi-orange font-medium mb-1", children: "Sao Sứ Việt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", "aria-label": "Tải lại Sao", onClick: () => q.refetch(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SaoNav, {}),
    q.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Đang tải Sao…" }),
    q.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: q.error.message }),
    q.data && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      !admin && /* @__PURE__ */ jsxRuntimeExports.jsx(Balance, { data: q.data }),
      mode === "wallet" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Lịch sử Sao" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { data: q.data }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mt-8", children: "Quà của tôi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Requests, { data: q.data, busy, run })
      ] }),
      mode === "earn" && /* @__PURE__ */ jsxRuntimeExports.jsx(EarnPrograms, { programs: q.data.rules }),
      (mode === "shop" || admin && can("sao.shop_manage")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Quà tặng Sứ Việt" }),
          admin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setGift({ id: crypto.randomUUID(), name: "", image_url: "", price: 1, stock: 0, reserved: 0, enabled: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Thêm quà"
          ] })
        ] }),
        q.data.gifts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "Gian hàng đang chuẩn bị những món quà đầu tiên" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: q.data.gifts.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "overflow-hidden rounded-xl border bg-card shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: g.image_url, alt: g.name, className: "w-full aspect-[4/3] object-contain bg-secondary p-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg break-words", children: g.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 mt-2 text-chipi-orange font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5 text-warning fill-warning" }),
              fmt(g.price),
              " Sao"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2 mb-4", children: [
              !g.enabled ? "Tạm ngừng" : `Còn ${giftAvailable(g.stock, g.reserved)} quà`,
              admin && ` · Đang giữ ${g.reserved}`
            ] }),
            admin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full min-h-11", onClick: () => setGift(g), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
              "Sửa quà"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full min-h-11", disabled: !mayRedeem(q.data.balance, q.data.held, g.price, g.stock, g.reserved, g.enabled), onClick: () => {
              setSelected(g);
              setRequestId(crypto.randomUUID());
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4" }),
              giftAvailable(g.stock, g.reserved) === 0 ? "Hết quà" : availableStars(q.data.balance, q.data.held) < g.price ? "Chưa đủ Sao" : "Đổi quà"
            ] })
          ] })
        ] }, g.id)) })
      ] }),
      mode === "shop" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Yêu cầu đổi quà của tôi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Requests, { data: q.data, busy, run })
      ] }),
      admin && can("sao.program_manage") && /* @__PURE__ */ jsxRuntimeExports.jsx(Programs, { programs: q.data.rules, ledger: q.data.ledger, busy, run }),
      admin && can("sao.manual_grant") && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setManualId(crypto.randomUUID());
        setManualOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Cộng Sao thủ công"
      ] }) }),
      admin && can("sao.shop_manage") && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Yêu cầu đổi quà" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Requests, { data: q.data, admin: true, busy, run })
      ] }),
      admin && (can("sao.program_manage") || can("sao.manual_grant")) && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Lịch sử thưởng và sử dụng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { data: q.data, admin: true })
      ] }),
      admin && q.data.events.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Lịch sử quản lý" }),
        q.data.events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm py-2 border-b", children: [
          e.kind === "rule" ? "Cập nhật quy tắc thưởng" : "Cập nhật quà",
          " · ",
          when(e.created_at)
        ] }, e.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: Boolean(selected), onOpenChange: (open) => {
      if (!open && !busy) setSelected(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "w-[calc(100%-32px)] rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Đổi ",
        selected?.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Giữ ",
        selected?.price,
        " Sao cho yêu cầu này. Sao chỉ được trừ khi Admin xác nhận đã phát quà."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: () => {
        if (!selected) return;
        void run(async () => {
          await redeem(selected.id, requestId);
          setSelected(null);
        }, "Đã gửi yêu cầu đổi quà");
      }, children: "Gửi yêu cầu đổi quà" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: Boolean(gift), onOpenChange: (open) => {
      if (!open && !busy) setGift(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "w-[calc(100%-32px)] rounded-xl max-h-[90dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: gift?.name || "Quà tặng mới" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Thông tin quà tặng" }),
      gift && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: (e) => {
        e.preventDefault();
        void run(async () => {
          await saveGift({ ...gift, image_url: gift.image_ref ?? gift.image_url });
          setGift(null);
        }, "Đã lưu quà");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "gift-name", children: "Tên quà" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "gift-name", required: true, maxLength: 150, value: gift.name, onChange: (e) => setGift({ ...gift, name: e.target.value }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "gift-price", children: "Giá Sao" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "gift-price", type: "number", min: 1, max: 1e6, required: true, value: gift.price, onChange: (e) => setGift({ ...gift, price: Number(e.target.value) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "gift-stock", children: "Tổng số lượng còn lại" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "gift-stock", type: "number", min: gift.reserved, required: true, value: gift.stock, onChange: (e) => setGift({ ...gift, stock: Number(e.target.value) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "gift-image", className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
          "Ảnh quà"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "gift-image", type: "file", accept: "image/jpeg,image/png,image/webp", disabled: busy, onChange: (e) => {
          const file = e.target.files?.[0];
          if (!file || !user) return;
          void run(async () => {
            const ref = await uploadGift(file, user.id);
            setGift({ ...gift, image_ref: ref });
          }, "Đã tải ảnh");
        } }),
        (gift.image_ref || gift.image_url) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-success", children: "Đã có ảnh quà" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "gift-enabled", checked: gift.enabled, onCheckedChange: (enabled) => setGift({ ...gift, enabled }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "gift-enabled", children: "Mở đổi quà" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !(gift.image_ref || gift.image_url), type: "submit", className: "w-full", children: "Lưu quà" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: manualOpen, onOpenChange: (open) => {
      if (!busy) setManualOpen(open);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "w-[calc(100%-32px)] rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cộng Sao thủ công" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Sao chỉ cộng sau khi xác nhận thành công." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: (e) => {
        e.preventDefault();
        void run(async () => {
          await grant(recipient, Number(stars), reason, manualId);
          setManualOpen(false);
          setRecipient("");
          setStars("");
          setReason("");
        }, "Đã cộng Sao");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhân viên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recipient, onValueChange: setRecipient, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn nhân viên" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: users.filter((u) => u.status === "Đang hoạt động").map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.fullName }, u.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "grant-stars", children: "Số Sao" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "grant-stars", type: "number", min: 1, max: 1e5, required: true, value: stars, onChange: (e) => setStars(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "grant-reason", children: "Lý do" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "grant-reason", required: true, minLength: 3, value: reason, onChange: (e) => setReason(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", type: "submit", disabled: busy || !recipient, children: "Xác nhận cộng Sao" })
      ] })
    ] }) })
  ] });
}
export {
  SaoPage as S,
  SaoNav as a
};
