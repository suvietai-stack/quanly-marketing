import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { bE as Route$y, u as useCurrentUser, l as Badge, j as cn, B as Button, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, E as DialogFooter, I as Input, N as Checkbox } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { o as otApi, f as fmtDate, a as fmtDateTime } from "./api-CEBEc05Q.mjs";
import { u as usePeople } from "./hooks-3AszRTQI.mjs";
import { t as todayVN, d as daysLeft, j as journey, O as ORDER_TYPE, b as ORDER_STATUS, K as KIND_LABEL, c as received, p as packBlocker, a as taskDue, i as isOverdue, T as TASK_STATUS, s as sendable, P as PROC_TYPE } from "./logic-DPbhOOeg.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, aO as CalendarClock, ag as ExternalLink, q as Check, aR as History, ao as Pencil, aV as TriangleAlert, a6 as Plus } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./client-DfPXH9B8.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./server-DpZ_OgFb.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./auth-middleware-B14nd7Va.mjs";
import "./auth-errors-CN_iHaBn.mjs";
import "./branding-Bpuupoin.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "./navigation-BcdDdvEu.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "./config-DnDqLpRb.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-popover.mjs";
import "./notifyMessage-DnoA8PJG.mjs";
import "./notifyMessage-CLuxtttz.mjs";
import "./notify-CzSXyhJl.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "./storeRead-Ci9Vlcxx.mjs";
import "../_libs/radix-ui__react-progress.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const STATUS = { pending: "Chờ phản hồi", accepted: "Đã đồng ý", rejected: "Đã từ chối", countered: "Đã đề xuất ngày khác", withdrawn: "Đã rút" };
const SIDE = { sale: "Kinh doanh", supply: "Cung ứng" };
function ReschedulePanel({ o, name }) {
  const { can, user } = useCurrentUser();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["ot", "resch", o.id], queryFn: () => otApi.reschedules(o.id) });
  const [mode, setMode] = reactExports.useState(null);
  const [date, setDate] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const rows = list.data ?? [];
  const pending = rows.find((r) => r.status === "pending");
  const open = ["new", "in_progress"].includes(o.status);
  const mySide = user?.id === o.sale_id ? "sale" : user?.id === o.supply_id ? "supply" : null;
  const canPropose = open && !pending && !!mySide && can("ot.reschedule_propose") && !!o.sale_id && !!o.supply_id;
  const canReply = open && !!pending && !!mySide && pending.side !== mySide && can("ot.reschedule_reply");
  const canWithdraw = !!pending && pending.proposer_id === user?.id;
  if (!rows.length && !canPropose) return null;
  const go = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      await qc.invalidateQueries({ queryKey: ["ot"] });
      toast.success(ok);
      setMode(null);
      setDate("");
      setNote("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const submit = () => {
    if (mode === "propose") return go(() => otApi.propose(o.id, date, note), "Đã gửi đề xuất điều chỉnh lịch.");
    if (mode === "reject" && pending) return go(() => otApi.reply(pending.id, "reject", null, note), "Đã từ chối đề xuất.");
    if (mode === "counter" && pending) return go(() => otApi.reply(pending.id, "counter", date, note), "Đã đề xuất ngày khác.");
  };
  const needDate = mode === "propose" || mode === "counter";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Điều chỉnh ngày khách nhận" }),
      canPropose && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "ml-auto", onClick: () => setMode("propose"), children: "Đề xuất điều chỉnh" })
    ] }),
    pending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-primary/40 bg-primary/5 p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: name(pending.proposer_id) }),
        " (",
        SIDE[pending.side],
        ") đề xuất đổi từ ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmtDate(pending.from_date) }),
        " sang ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-primary", children: fmtDate(pending.proposed_date) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-muted-foreground", children: [
        "Lý do: ",
        pending.reason
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
        canReply && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy, onClick: () => go(() => otApi.reply(pending.id, "accept", null, ""), "Đã đồng ý, ngày khách nhận đã cập nhật."), children: "Đồng ý" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setMode("counter"), children: "Đề xuất ngày khác" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setMode("reject"), children: "Từ chối" })
        ] }),
        canWithdraw && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", disabled: busy, onClick: () => go(() => otApi.withdraw(pending.id), "Đã rút đề xuất."), children: "Rút đề xuất" }),
        !canReply && !canWithdraw && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "Đang chờ ",
          pending.side === "sale" ? "Cung ứng" : "Kinh doanh",
          " phản hồi."
        ] })
      ] })
    ] }),
    rows.filter((r) => r.status !== "pending").length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2 text-sm", children: rows.filter((r) => r.status !== "pending").map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "border-l-2 pl-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          fmtDate(r.from_date),
          " → ",
          fmtDate(r.proposed_date)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "accepted" ? "default" : "outline", children: STATUS[r.status] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          name(r.proposer_id),
          " (",
          SIDE[r.side],
          ") · ",
          fmtDateTime(r.created_at)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Lý do: ",
        r.reason,
        r.response_note ? ` · Phản hồi: ${r.response_note}` : ""
      ] })
    ] }, r.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!mode, onOpenChange: (v) => !v && setMode(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "propose" ? "Đề xuất điều chỉnh ngày khách nhận" : mode === "counter" ? "Đề xuất ngày khác" : "Từ chối đề xuất" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Ngày khách nhận hiện tại: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: fmtDate(o.due_date) })
        ] }),
        needDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ot-rs-date", children: "Ngày đề xuất *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "ot-rs-date", type: "date", min: todayVN(), value: date, onChange: (e) => setDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ot-rs-note", children: "Lý do *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "ot-rs-note", rows: 3, value: note, onChange: (e) => setNote(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMode(null), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !note.trim() || needDate && !date, onClick: submit, children: "Gửi" })
      ] })
    ] }) })
  ] });
}
const ACTION_LABEL = {
  create: "Tạo đơn",
  accept: "Tiếp nhận đơn",
  update_order: "Sửa thông tin đơn",
  plan: "Lập kế hoạch",
  proc_add: "Thêm lượt gia công",
  task_update: "Cập nhật công việc",
  ordered: "Xác nhận đã đặt",
  receive: "Ghi nhận hàng về",
  mail_sent: "Xác nhận đã gửi mail sản xuất",
  sent: "Gửi phôi đi gia công",
  pack_done: "Hoàn thành đóng gói",
  shipped: "Xuất hàng",
  delivered: "Khách đã nhận hàng",
  fix_time: "Điều chỉnh thời gian thực tế",
  cancel: "Hủy đơn",
  reschedule_propose: "Đề xuất điều chỉnh ngày khách nhận",
  reschedule_accept: "Đồng ý điều chỉnh ngày khách nhận",
  reschedule_reject: "Từ chối điều chỉnh lịch",
  reschedule_counter: "Đề xuất ngày khác",
  reschedule_withdraw: "Rút đề xuất điều chỉnh"
};
const FIELD_LABEL = {
  supplier_id: "Nhà cung cấp",
  assignee_id: "Người phụ trách",
  qty: "Số lượng",
  planned_date: "Hạn dự kiến",
  planned_arrival: "Dự kiến hàng về",
  mail_due: "Hạn gửi mail",
  send_planned: "Dự kiến gửi phôi",
  note: "Ghi chú",
  status: "Trạng thái",
  proc_type: "Loại gia công",
  ordered_at: "Thời điểm đặt",
  mail_sent_at: "Thời điểm gửi mail",
  sent_at: "Thời điểm gửi phôi",
  shipped_at: "Thời điểm xuất hàng",
  done_at: "Thời điểm hoàn thành",
  sale_id: "Kinh doanh",
  supply_id: "Cung ứng",
  has_box: "Có đặt hộp",
  has_processing: "Có in ấn/gia công",
  title: "Tên đơn",
  address: "Địa chỉ",
  crm_url: "Link CRM",
  due_time: "Giờ nhận",
  due_date: "Ngày khách nhận",
  proposed: "Ngày đề xuất",
  contact_date: "Ngày liên hệ lại NCC"
};
function useErr() {
  const qc = useQueryClient();
  return async (fn, ok) => {
    try {
      await fn();
      await qc.invalidateQueries({
        queryKey: ["ot"]
      });
      if (ok) toast.success(ok);
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  };
}
function Detail() {
  const {
    id
  } = Route$y.useParams();
  const {
    can,
    user
  } = useCurrentUser();
  const people = usePeople();
  const order = useQuery({
    queryKey: ["ot", "order", id],
    queryFn: () => otApi.order(id)
  });
  const tasks = useQuery({
    queryKey: ["ot", "tasks", id],
    queryFn: () => otApi.tasks(id)
  });
  const ids = (tasks.data ?? []).map((t) => t.id);
  const receipts = useQuery({
    queryKey: ["ot", "receipts", id, ids.join()],
    queryFn: () => otApi.receipts(ids),
    enabled: !!tasks.data
  });
  const suppliers = useQuery({
    queryKey: ["ot", "suppliers"],
    queryFn: otApi.suppliers
  });
  const logs = useQuery({
    queryKey: ["ot", "logs", id],
    queryFn: () => otApi.logs(id)
  });
  const run = useErr();
  if (order.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" });
  const o = order.data;
  if (!o) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Không tìm thấy đơn hàng hoặc bạn không có quyền xem." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/order-tracking", className: "text-primary text-sm", children: "Về danh sách" })
  ] });
  const ts = tasks.data ?? [];
  const rs = receipts.data ?? [];
  const active = o.status === "in_progress";
  const canStage = can("ot.manage") || can("ot.stage_update");
  const canTask = (t) => canStage || t.assignee_id === user?.id && can("ot.task_update");
  const today = todayVN();
  const dl = daysLeft(o.due_date, today);
  const j = journey(o, ts);
  const sup = suppliers.data ?? [];
  const ctx = {
    o,
    ts,
    rs,
    sup,
    people,
    run,
    active,
    canStage,
    canTask,
    today
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-tracking", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Danh sách đơn"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4 sm:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: o.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: o.order_type === "sample" ? "outline" : "secondary", children: ORDER_TYPE[o.order_type] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: ORDER_STATUS[o.status] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-semibold sm:text-2xl", children: o.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mt-3 flex flex-wrap items-center gap-2 rounded-md px-3 py-2", o.status !== "done" && dl < 0 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base", children: [
          "Ngày khách nhận: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-lg", children: fmtDate(o.due_date) }),
          o.due_time ? ` lúc ${o.due_time}` : ""
        ] }),
        ["new", "in_progress"].includes(o.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
          "· ",
          dl < 0 ? `quá ${-dl} ngày` : dl === 0 ? "hôm nay" : `còn ${dl} ngày`
        ] }),
        o.original_due !== o.due_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
          "(ban đầu ",
          fmtDate(o.original_due),
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Kinh doanh", children: people.name(o.sale_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Cung ứng", children: people.name(o.supply_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Địa chỉ giao", children: o.address || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Tạo lúc", children: fmtDateTime(o.created_at) }),
        o.note && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Ghi chú", children: o.note })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        o.crm_url && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: o.crm_url, target: "_blank", rel: "noreferrer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-1" }),
          "Xem trên CRM"
        ] }) }),
        o.status === "new" && (can("ot.accept") || can("ot.manage")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => run(() => otApi.accept(o.id), "Đã tiếp nhận đơn."), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1" }),
          "Tiếp nhận đơn"
        ] }),
        (can("ot.assign") || can("ot.manage")) && ["new", "in_progress"].includes(o.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(AssignButton, { o, people: people.list, run }),
        can("ot.manage") && ["new", "in_progress"].includes(o.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(CancelButton, { id: o.id, run })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Hành trình" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "flex flex-wrap items-center gap-2", children: j.steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm", s.done ? "border-primary bg-primary text-primary-foreground" : s.key === j.current && o.status !== "cancelled" ? "border-primary text-primary font-medium" : "text-muted-foreground"), children: [
          s.done && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
          s.label
        ] }),
        i < j.steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "→" })
      ] }, s.key)) }),
      o.has_box && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Đặt hộp được triển khai song song với đặt phôi." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ReschedulePanel, { o, name: people.name }),
    active && canStage && /* @__PURE__ */ jsxRuntimeExports.jsx(PlanCard, { o, run }),
    o.status === "new" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-md bg-muted p-3 text-sm text-muted-foreground", children: "Cung ứng cần tiếp nhận đơn trước khi lập kế hoạch các công đoạn." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      ts.filter((t) => (t.kind === "blank" || t.kind === "box") && t.status !== "skipped").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { t, ctx }, t.id)),
      o.has_processing && /* @__PURE__ */ jsxRuntimeExports.jsx(ProcSection, { ctx }),
      ts.filter((t) => t.kind === "packing" || t.kind === "delivery").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { t, ctx }, t.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
        "Nhật ký cập nhật"
      ] }),
      (logs.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: (logs.data ?? []).map((l) => {
        const t = ts.find((x) => x.id === l.task_id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "border-l-2 pl-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: people.name(l.actor_id) }),
            " · ",
            ACTION_LABEL[l.action] ?? l.action,
            t ? ` — ${KIND_LABEL[t.kind]}` : "",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: fmtDateTime(l.created_at) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogDiff, { l, sup, name: people.name }),
          l.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Lý do: ",
            l.reason
          ] })
        ] }, l.id);
      }) })
    ] })
  ] });
}
function fmtVal(k, v, sup, name) {
  if (v == null || v === "") return "—";
  if (k === "supplier_id") return sup.find((s) => s.id === v)?.name ?? "—";
  if (["assignee_id", "sale_id", "supply_id"].includes(k)) return name(v);
  if (k === "status") return TASK_STATUS[v] ?? v;
  if (typeof v === "boolean") return v ? "Có" : "Không";
  if (k.endsWith("_at")) return fmtDateTime(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return fmtDate(v);
  return String(v);
}
function LogDiff({
  l,
  sup,
  name
}) {
  if (!l.new || typeof l.new !== "object") return null;
  const keys = Object.keys(l.new).filter((k) => k !== "code");
  if (!keys.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: keys.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    FIELD_LABEL[k] ?? (k === "qty" ? "Số lượng" : k),
    ": ",
    l.old ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      fmtVal(k, l.old[k], sup, name),
      " → "
    ] }) : null,
    fmtVal(k, l.new[k], sup, name)
  ] }, k)) });
}
function Row({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[100px_minmax(0,1fr)] gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
      label,
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children })
  ] });
}
function PlanCard({
  o,
  run
}) {
  const [box, setBox] = reactExports.useState(o.has_box);
  const [proc, setProc] = reactExports.useState(o.has_processing);
  const [qty, setQty] = reactExports.useState(o.qty ? String(o.qty) : "");
  const [open, setOpen] = reactExports.useState(!o.planned);
  if (!open) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setOpen(true), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4 mr-1" }),
    "Sửa kế hoạch công đoạn"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-primary/40 bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Lập kế hoạch công đoạn" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số lượng sản phẩm *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, className: "w-36", value: qty, onChange: (e) => setQty(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: box, onCheckedChange: (v) => setBox(!!v) }),
        "Có đặt hộp"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: proc, onCheckedChange: (v) => setProc(!!v) }),
        "Có in ấn / gia công"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: async () => {
        if (await run(() => otApi.plan(o.id, box, proc, Number(qty)), "Đã lưu kế hoạch.")) setOpen(false);
      }, children: "Lưu kế hoạch" }),
      o.planned && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpen(false), children: "Đóng" })
    ] })
  ] });
}
function SupplierSelect({
  value,
  onChange,
  sup,
  disabled
}) {
  const list = sup.filter((s) => s.active || s.id === value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value ?? "", onValueChange: onChange, disabled, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn nhà cung cấp" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 text-sm text-muted-foreground", children: "Chưa có nhà cung cấp." }) : list.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: s.name }, s.id)) })
  ] });
}
function DateField({
  label,
  value,
  onSave,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", defaultValue: value ?? "", disabled, onBlur: (e) => e.target.value !== (value ?? "") && onSave(e.target.value) })
  ] });
}
function TaskShell({
  t,
  ctx,
  title,
  children
}) {
  const due = taskDue(t);
  const late = !["done", "skipped"].includes(t.status) && isOverdue(due, false, ctx.today);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-lg border bg-card p-4", late && "border-destructive/60"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: t.status === "done" ? "default" : "outline", children: TASK_STATUS[t.status] }),
      late && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
        "Quá hạn ",
        fmtDate(due)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        "Phụ trách: ",
        ctx.people.name(t.assignee_id)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-3", children })
  ] });
}
function CommonFields({
  t,
  ctx,
  dates
}) {
  const edit = ctx.canTask(t) && ctx.active;
  const up = (d) => ctx.run(() => otApi.updateTask(t.id, d), "Đã cập nhật.");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
    ["blank", "box", "proc"].includes(t.kind) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Nhà cung cấp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierSelect, { value: t.supplier_id, sup: ctx.sup, disabled: !edit, onChange: (v) => up({
        supplier_id: v
      }) })
    ] }),
    ctx.canStage && ctx.active && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Người phụ trách" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.assignee_id ?? "", onValueChange: (v) => up({
        assignee_id: v
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ctx.people.list.filter((p) => p.supply).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.full_name }, p.id)) })
      ] })
    ] }),
    dates.map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(DateField, { label: l, value: t[k], disabled: !(ctx.canStage || k === "planned_arrival" && edit) || !ctx.active, onSave: (v) => up({
      [k]: v
    }) }, k)),
    edit && t.status !== "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Trạng thái" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.status, onValueChange: (v) => up({
        status: v
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["todo", "doing", "waiting"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: TASK_STATUS[s] }, s)) })
      ] })
    ] })
  ] });
}
function QtyBar({
  t,
  ctx,
  sentLabel
}) {
  const got = received(t.id, ctx.rs);
  const qty = Number(t.qty ?? 0);
  const list = ctx.rs.filter((r) => r.task_id === t.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/50 p-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-5 gap-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Số lượng: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: qty })
      ] }),
      sentLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Đã gửi: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: t.sent_qty })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Đã nhận: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: got })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: qty - got > 0 ? "text-destructive" : "text-primary", children: [
        "Còn thiếu: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: Math.max(0, qty - got) })
      ] })
    ] }),
    list.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-0.5 text-xs text-muted-foreground", children: list.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      "Lần ",
      i + 1,
      ": ",
      r.qty,
      " · ",
      fmtDateTime(r.received_at),
      " · ",
      ctx.people.name(r.actor_id)
    ] }, r.id)) })
  ] });
}
function QtyAction({
  label,
  max,
  onDo,
  disabled
}) {
  const [n, setN] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max, placeholder: `Tối đa ${max}`, className: "w-32", value: n, onChange: (e) => setN(e.target.value), disabled: disabled || max <= 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: disabled || max <= 0 || !n, onClick: async () => {
      if (await onDo(Number(n))) setN("");
    }, children: label })
  ] });
}
function TimeLine({
  t,
  ctx,
  field,
  label
}) {
  const v = t[field];
  if (!v) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-primary" }),
    label,
    ": ",
    fmtDateTime(v),
    ctx.canStage && /* @__PURE__ */ jsxRuntimeExports.jsx(FixTime, { t, field: String(field), value: v, run: ctx.run })
  ] });
}
function TaskCard({
  t,
  ctx
}) {
  const edit = ctx.canTask(t) && ctx.active;
  const act = (a, n, ok) => ctx.run(() => otApi.action(t.id, a, n), ok ?? "Đã cập nhật.");
  const got = received(t.id, ctx.rs);
  if (t.kind === "blank" || t.kind === "box") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(TaskShell, { t, ctx, title: KIND_LABEL[t.kind], children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommonFields, { t, ctx, dates: [["planned_date", "Dự kiến đặt"], ["planned_arrival", "Dự kiến hàng về"]] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QtyBar, { t, ctx }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLine, { t, ctx, field: "ordered_at", label: "Đã đặt" }),
      edit && !t.ordered_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !t.supplier_id, onClick: () => act("ordered", void 0, "Đã xác nhận đặt hàng."), children: "Xác nhận đã đặt" }),
        !t.supplier_id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Chọn nhà cung cấp trước khi xác nhận đã đặt." })
      ] }),
      edit && t.ordered_at && t.status !== "done" && /* @__PURE__ */ jsxRuntimeExports.jsx(QtyAction, { label: "Ghi nhận hàng về", max: Number(t.qty ?? 0) - got, onDo: (n) => act("receive", n, "Đã ghi nhận hàng về.") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NoteField, { t, ctx })
    ] });
  }
  if (t.kind === "packing") {
    const block = packBlocker(ctx.ts, ctx.rs);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(TaskShell, { t, ctx, title: KIND_LABEL.packing, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommonFields, { t, ctx, dates: [["planned_date", "Hạn đóng gói"]] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLine, { t, ctx, field: "done_at", label: "Hoàn thành" }),
      edit && t.status !== "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !!block, onClick: () => act("pack_done", void 0, "Đã hoàn thành đóng gói."), children: "Xác nhận đã đóng gói" }),
        block && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          block
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NoteField, { t, ctx })
    ] });
  }
  if (t.kind === "delivery") {
    const packed = ctx.ts.some((x) => x.kind === "packing" && x.status === "done");
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(TaskShell, { t, ctx, title: KIND_LABEL.delivery, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommonFields, { t, ctx, dates: [["planned_date", "Dự kiến xuất hàng"]] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLine, { t, ctx, field: "shipped_at", label: "Đã xuất hàng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLine, { t, ctx, field: "done_at", label: "Khách đã nhận" }),
      edit && !t.shipped_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !packed, onClick: () => act("shipped", void 0, "Đã xác nhận xuất hàng."), children: "Xác nhận xuất hàng" }),
        !packed && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Cần hoàn thành đóng gói trước khi xuất hàng." })
      ] }),
      edit && t.shipped_at && t.status !== "done" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => act("delivered", void 0, "Đơn hàng đã hoàn tất."), children: "Xác nhận khách đã nhận hàng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NoteField, { t, ctx })
    ] });
  }
  return null;
}
function NoteField({
  t,
  ctx
}) {
  const edit = ctx.canTask(t) && ctx.active;
  if (!edit) return t.note ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
    "Ghi chú: ",
    t.note
  ] }) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 1, placeholder: "Ghi chú", defaultValue: t.note ?? "", onBlur: (e) => e.target.value !== (t.note ?? "") && ctx.run(() => otApi.updateTask(t.id, {
    note: e.target.value
  }), "Đã lưu ghi chú.") });
}
function ProcSection({
  ctx
}) {
  const procs = ctx.ts.filter((t) => t.kind === "proc" && t.status !== "skipped");
  const [adding, setAdding] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-lg border border-dashed p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: KIND_LABEL.proc }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        procs.length,
        " lượt"
      ] }),
      ctx.canStage && ctx.active && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "ml-auto", onClick: () => setAdding(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Thêm lượt gia công"
      ] })
    ] }),
    procs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lượt gia công." }),
    procs.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProcCard, { t, i: i + 1, ctx }, t.id)),
    adding && /* @__PURE__ */ jsxRuntimeExports.jsx(AddProc, { ctx, onClose: () => setAdding(false) })
  ] });
}
function ProcCard({
  t,
  i,
  ctx
}) {
  const edit = ctx.canTask(t) && ctx.active;
  const act = (a, n, ok) => ctx.run(() => otApi.action(t.id, a, n), ok ?? "Đã cập nhật.");
  const got = received(t.id, ctx.rs);
  const canSend = sendable(t, ctx.ts, ctx.rs);
  const supName = ctx.sup.find((s) => s.id === t.supplier_id)?.name;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TaskShell, { t, ctx, title: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    "Lượt ",
    i,
    ": ",
    PROC_TYPE[t.proc_type ?? "other"] ?? t.proc_type,
    supName ? ` · ${supName}` : ""
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CommonFields, { t, ctx, dates: [["mail_due", "Hạn gửi mail"], ["send_planned", "Dự kiến gửi phôi"], ["planned_arrival", "Dự kiến nhận"]] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QtyBar, { t, ctx, sentLabel: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "1. Mail sản xuất" }),
        t.mail_sent_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLine, { t, ctx, field: "mail_sent_at", label: "Đã gửi" }) : edit ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !t.supplier_id, onClick: () => act("mail_sent", void 0, "Đã xác nhận gửi mail sản xuất."), children: "Xác nhận đã gửi mail sản xuất" }),
          !t.supplier_id && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chọn xưởng trước." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa gửi" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "2. Gửi phôi gia công" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLine, { t, ctx, field: "sent_at", label: "Lần gửi đầu" }),
        edit && t.sent_qty < Number(t.qty ?? 0) && (!t.mail_sent_at ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Cần xác nhận gửi mail sản xuất trước." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QtyAction, { label: "Gửi phôi", max: canSend, onDo: (n) => act("sent", n, "Đã ghi nhận gửi phôi.") }),
          canSend <= 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Chưa có phôi về để gửi thêm." })
        ] }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "3. Nhận hàng gia công" }),
        edit && t.status !== "done" && (t.sent_qty - got > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(QtyAction, { label: "Ghi nhận hàng về", max: t.sent_qty - got, onDo: (n) => act("receive", n, "Đã ghi nhận hàng gia công.") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chưa có phôi đang ở xưởng." })),
        t.status === "done" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-primary", children: "Đã nhận đủ." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NoteField, { t, ctx })
  ] });
}
function AddProc({
  ctx,
  onClose
}) {
  const [f, setF] = reactExports.useState({
    proc_type: "print",
    qty: String(ctx.o.qty ?? "")
  });
  const set = (k, v) => setF((p) => ({
    ...p,
    [k]: v
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Thêm lượt gia công" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Xưởng / nhà cung cấp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierSelect, { value: f.supplier_id ?? null, sup: ctx.sup, onChange: (v) => set("supplier_id", v) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại gia công" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.proc_type, onValueChange: (v) => set("proc_type", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(PROC_TYPE).map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: l }, k)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số lượng *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: f.qty, onChange: (e) => set("qty", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hạn gửi mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.mail_due ?? "", onChange: (e) => set("mail_due", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dự kiến gửi phôi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.send_planned ?? "", onChange: (e) => set("send_planned", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dự kiến nhận" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f.planned_arrival ?? "", onChange: (e) => set("planned_arrival", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.note ?? "", onChange: (e) => set("note", e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: async () => {
        if (await ctx.run(() => otApi.addProc(ctx.o.id, f), "Đã thêm lượt gia công.")) onClose();
      }, children: "Thêm" })
    ] })
  ] }) });
}
function FixTime({
  t,
  field,
  value,
  run
}) {
  const [open, setOpen] = reactExports.useState(false);
  const local = new Date(new Date(value).getTime() + 7 * 36e5).toISOString().slice(0, 16);
  const [v, setV] = reactExports.useState(local);
  const [reason, setReason] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-muted-foreground underline hover:text-foreground", onClick: () => setOpen(true), children: "Sửa" }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Điều chỉnh thời gian thực tế" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            FIELD_LABEL[field],
            " (giờ Việt Nam)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: v, onChange: (e) => setV(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do điều chỉnh *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: reason, onChange: (e) => setReason(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: reason.trim().length < 3, onClick: async () => {
          if (await run(() => otApi.fixTime(t.id, field, `${v}:00+07:00`, reason), "Đã điều chỉnh.")) setOpen(false);
        }, children: "Lưu" })
      ] })
    ] }) })
  ] });
}
function AssignButton({
  o,
  people,
  run
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [sale, setSale] = reactExports.useState(o.sale_id ?? "");
  const [supply, setSupply] = reactExports.useState(o.supply_id ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setOpen(true), children: "Phân công" }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Phân công người phụ trách" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kinh doanh" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sale, onValueChange: setSale, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: people.filter((p) => p.sale).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.full_name }, p.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cung ứng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: supply, onValueChange: setSupply, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: people.filter((p) => p.supply).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.id, children: p.full_name }, p.id)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: async () => {
        if (await run(() => otApi.updateOrder(o.id, {
          sale_id: sale,
          supply_id: supply
        }), "Đã phân công.")) setOpen(false);
      }, children: "Lưu" }) })
    ] }) })
  ] });
}
function CancelButton({
  id,
  run
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-destructive", onClick: () => setOpen(true), children: "Hủy đơn" }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Hủy đơn hàng" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: reason, onChange: (e) => setReason(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: reason.trim().length < 3, onClick: async () => {
        if (await run(() => otApi.cancel(id, reason), "Đã hủy đơn.")) setOpen(false);
      }, children: "Xác nhận hủy" }) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["ot.view_own", "ot.view_all", "ot.task_view", "ot.create", "ot.manage"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, {}) });
export {
  SplitComponent as component
};
