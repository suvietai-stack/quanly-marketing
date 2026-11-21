import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { bC as Route$C, u as useCurrentUser, B as Button, l as Badge, j as cn, C as Card, o as CardContent, L as Label, I as Input } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { R as Root, a as CollapsibleTrigger$1, b as CollapsibleContent$1 } from "../_libs/radix-ui__react-collapsible.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { o as oqApi, f as flowStatusLabel, v as vnDateTime, a as vnDate, q as qtySummary, C as CHOICE_LABEL, m as missing, p as progressCount, l as latestPublished, r as requestedCats, c as copyText, I as IMG_CAT, b as catLabel, E as EVENT_LABEL } from "./logic-BXklg4nZ.mjs";
import { u as useJobTimes, F as FlowTimeSummary, f as fmtDur } from "./JobTimes-B4Q3SSZP.mjs";
import { u as useUserName, P as ProductQuantity, I as ItemImages, F as FlowBadge } from "./OqCommon-BFxbEy7S.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, n as ChevronDown, b7 as Copy, aG as ImagePlus, ap as Trash2 } from "../_libs/lucide-react.mjs";
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
import "./timeframe-CYUNchQ5.mjs";
import "./command-DR-zJx0h.mjs";
import "../_libs/cmdk.mjs";
const Collapsible = Root;
const CollapsibleTrigger = CollapsibleTrigger$1;
const CollapsibleContent = CollapsibleContent$1;
function OqDetail() {
  const {
    id
  } = Route$C.useParams();
  const {
    flow: flowParam
  } = Route$C.useSearch();
  const nav = useNavigate();
  const qc = useQueryClient();
  const {
    user
  } = useCurrentUser();
  const {
    data: d,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["oq", id],
    queryFn: () => oqApi.detail(id),
    refetchInterval: 6e4
  });
  const refresh = () => {
    qc.invalidateQueries({
      queryKey: ["oq", id]
    });
    qc.invalidateQueries({
      queryKey: ["oq-list"]
    });
    qc.invalidateQueries({
      queryKey: ["oq-times"]
    });
  };
  const mine = d?.flows.find((f) => f.assignee_id === user?.id && f.status === "pending") ?? d?.flows.find((f) => f.assignee_id === user?.id && f.status === "processing");
  const flowId = flowParam && d?.flows.some((f) => f.id === flowParam) ? flowParam : (mine ?? d?.flows[0])?.id;
  reactExports.useEffect(() => {
    if (d?.req.status === "draft") nav({
      to: "/order-quotes/new",
      search: {
        id
      },
      replace: true
    });
  }, [d?.req.status]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" });
  if (error && !d) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 text-center space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
      "Không tải được yêu cầu: ",
      error.message
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => refetch(), children: "Thử lại" })
  ] });
  if (!d) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-20 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Không tìm thấy yêu cầu" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Yêu cầu không tồn tại hoặc bạn không có quyền xem." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/order-quotes", children: "Về danh sách" }) })
  ] });
  const flow = d.flows.find((f) => f.id === flowId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "oq-mobile-detail pb-10 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 mb-4 sm:flex sm:gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/order-quotes", "aria-label": "Về danh sách", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-muted-foreground", children: [
          d.req.code,
          " · Đơn Sứ Quà Tặng"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg sm:text-2xl font-semibold tracking-tight break-words", children: d.req.title }),
        d.req.status === "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mt-1", children: [
          "Đã hủy — ",
          d.req.cancel_reason
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CancelButton, { d, flow, onDone: refresh })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-md border border-destructive/40 p-2 text-sm flex items-center gap-2", children: [
      "Không cập nhật được dữ liệu mới nhất: ",
      error.message,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "ml-auto", onClick: () => refetch(), children: "Thử lại" })
    ] }),
    d.flows.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 mb-4 sm:flex", children: d.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/order-quotes/$id", params: {
      id
    }, search: {
      flow: f.id
    }, replace: true, className: cn("min-w-0 rounded-md border px-3 py-2 text-sm", f.id === flowId ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
        f.kind === "price" ? "Hỏi Giá" : "Hỏi Tiến Độ",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: f.code })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
        flowStatusLabel(f.kind, f.status),
        f.waiting_info && f.status === "processing" ? " · chờ Sale" : ""
      ] })
    ] }, f.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "oq-request-info min-w-0 rounded-2xl border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "min-h-11 cursor-pointer text-sm font-semibold", children: "Thông tin yêu cầu & sản phẩm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrderInfo, { d, onChanged: refresh }) })
      ] }),
      flow ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: d.flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: f.id === flowId ? "" : "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FlowPanel, { d, flow: f, onChanged: refresh }) }, f.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4 text-sm text-muted-foreground", children: "Chưa có luồng xử lý." }) })
    ] })
  ] });
}
function OrderInfo({
  d,
  onChanged
}) {
  const {
    user,
    can
  } = useCurrentUser();
  const name = useUserName();
  const isOwner = d.req.creator_id === user?.id || can("oq.manage");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-1.5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Người tạo", v: name(d.req.creator_id) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Gửi lúc", v: vnDateTime(d.req.submitted_at) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Giao tại", v: d.req.delivery_place || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Ngày khách cần", v: vnDate(d.req.delivery_date) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Sản phẩm", v: qtySummary(d.req.items_mode, d.items) }),
      d.req.note && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Ghi chú", v: d.req.note })
    ] }) }),
    d.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { defaultOpen: d.items.length <= 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsibleTrigger, { className: "w-full flex items-center gap-2 p-3 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: it.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium truncate", children: it.name }),
        it.customer_choice && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: CHOICE_LABEL[it.customer_choice] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-3 pb-3 pt-0 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProductQuantity, { qty: it.qty, unit: it.unit }),
        it.detail && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Chi tiết", v: it.detail }),
        it.processing && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "In ấn / gia công", v: it.processing }),
        it.note && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Ghi chú", v: it.note }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ItemImages, { images: d.images.filter((g) => g.item_id === it.id && !g.info_request_id) }),
        d.images.some((g) => g.item_id === it.id && g.info_request_id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Ảnh Sale bổ sung sau khi gửi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ItemImages, { images: d.images.filter((g) => g.item_id === it.id && g.info_request_id) })
        ] }),
        isOwner && d.req.status === "submitted" && d.items.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: it.customer_choice ?? "none", onValueChange: (v) => oqApi.setChoice(it.id, v === "none" ? null : v).then(onChanged).catch((e) => toast.error(e.message)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Chưa ghi nhận lựa chọn" }),
            Object.entries(CHOICE_LABEL).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k))
          ] })
        ] })
      ] }) })
    ] }) }, it.id))
  ] });
}
function FlowPanel({
  d,
  flow,
  onChanged
}) {
  const {
    user,
    can
  } = useCurrentUser();
  const name = useUserName();
  const rounds = d.rounds.filter((r) => r.flow_id === flow.id);
  const times = useJobTimes([flow.id]);
  const [roundNo, setRoundNo] = reactExports.useState(flow.current_round);
  reactExports.useEffect(() => setRoundNo(flow.current_round), [flow.id, flow.current_round]);
  const round = rounds.find((r) => r.no === roundNo) ?? rounds[rounds.length - 1];
  const resps = d.resps.filter((r) => r.round_id === round?.id);
  const items = round?.items_snapshot ?? [];
  const cfg = flow.kind === "price" ? round?.config ?? {} : {};
  const isCurrent = round?.no === flow.current_round;
  const canReply = can(flow.kind === "price" ? "oq.reply_price" : "oq.reply_progress");
  const isHandler = flow.assignee_id === user?.id && canReply || can("oq.manage");
  const canAccept = flow.assignee_id === user?.id && canReply && can("oq.accept") || can("oq.manage");
  const isOwner = d.req.creator_id === user?.id || can("oq.manage");
  const editable = isHandler && isCurrent && flow.status === "processing";
  const miss = missing(flow.kind, items, cfg, resps);
  const pc = progressCount(flow.kind, items, cfg, resps);
  const infos = d.infos.filter((i) => i.flow_id === flow.id);
  const events = d.events.filter((e) => e.flow_id === flow.id || !e.flow_id);
  const [busy, setBusy] = reactExports.useState(false);
  const run = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      if (ok) toast.success(ok);
      onChanged();
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const conclusion = latestPublished(resps, "conclusion")?.content?.text;
  const targetsList = flow.kind === "price" ? items.filter((i) => requestedCats(cfg, i.id).length > 0) : items;
  const active = d.req.status === "submitted" && flow.status !== "cancelled";
  const navTargets = [...targetsList, ...flow.kind === "price" && cfg.shipping_mode === "common" ? [{
    id: "shipping",
    code: "VC",
    name: "Vận chuyển chung"
  }] : []];
  const [sel, setSel] = reactExports.useState("");
  const selId = navTargets.some((t) => t.id === sel) ? sel : navTargets[0]?.id;
  const tStatus = (tid) => resps.some((r) => r.target === tid && r.is_published) ? "pub" : resps.some((r) => r.target === tid && !r.is_published) ? "draft" : "none";
  const isLastFor = (it) => miss.length > 0 && miss.every((m) => m.startsWith(`${it.code} ${it.name}:`));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm", children: flow.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlowBadge, { kind: flow.kind, status: flow.status, waiting: flow.waiting_info }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground ml-auto", children: [
          "Phụ trách: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-foreground", children: name(flow.assignee_id) })
        ] })
      ] }),
      (flow.status !== "pending" || resps.some((r) => r.is_published)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex flex-wrap gap-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          flow.kind === "price" ? "Đã báo giá" : "Đã phản hồi",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
            pc.done,
            "/",
            pc.total
          ] }),
          " sản phẩm"
        ] }),
        pc.shipping !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Vận chuyển chung: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: pc.shipping ? "Đã phản hồi" : "Chưa phản hồi" })
        ] }),
        rounds.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Lượt ",
          round?.no,
          "/",
          rounds.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "oq-next-step rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm leading-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Việc tiếp theo: " }),
        !active ? "Yêu cầu đã dừng xử lý." : flow.status === "pending" ? canAccept ? "Bấm “Xác nhận tiếp nhận” để bắt đầu." : `Chờ ${name(flow.assignee_id)} tiếp nhận.` : flow.status === "answered" ? "Sale xem kết quả đã công bố bên dưới." : flow.waiting_info ? "Sale bổ sung thông tin để Cung ứng tiếp tục." : editable ? "Chọn sản phẩm, nhập phản hồi và công bố kết quả." : `Chờ ${name(flow.assignee_id)} trả lời.`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "oq-timing-details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "min-h-11 cursor-pointer text-xs text-muted-foreground flex items-center", children: "Xem thời gian xử lý" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlowTimeSummary, { t: times.current(flow.id, round?.no), kind: flow.kind, assignee: name(round?.assignee_id ?? flow.assignee_id) })
      ] }),
      rounds.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-muted-foreground", children: "Thời gian các lượt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 space-y-0.5", children: times.all.filter((t) => t.flow_id === flow.id).sort((a, b) => a.round_no - b.round_no).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Lượt ",
          t.round_no,
          ": phản hồi ",
          t.completed_at ? fmtDur(t.response_sec) : "chưa hoàn thành",
          " · Cung ứng xử lý ",
          t.completed_at ? t.data_ok ? fmtDur(t.process_sec) : "Chưa đủ dữ liệu" : "—",
          t.handover ? " · Có chuyển giao" : ""
        ] }, t.round_id)) })
      ] }),
      flow.status === "pending" && round?.accepted_at && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Luồng vừa được chuyển người phụ trách — người mới cần Xác nhận tiếp nhận để tiếp tục. Nháp và kết quả đã công bố được giữ nguyên." }),
      rounds.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: rounds.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: r.no === round?.no ? "default" : "outline", onClick: () => setRoundNo(r.no), children: [
        "Lượt ",
        r.no
      ] }, r.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        active && canAccept && flow.status === "pending" && isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: () => run(() => oqApi.accept(flow.id), "Đã xác nhận tiếp nhận."), children: "Xác nhận tiếp nhận" }),
        active && editable && /* @__PURE__ */ jsxRuntimeExports.jsx(AskInfo, { disabled: busy || flow.waiting_info, onSend: (q) => run(() => oqApi.requestInfo(flow.id, q), "Đã gửi yêu cầu bổ sung.") }),
        active && isOwner && flow.status !== "answered" && /* @__PURE__ */ jsxRuntimeExports.jsx(Reassign, { flow, disabled: busy, onPick: (u) => run(() => oqApi.reassign(flow.id, u), "Đã đổi người phụ trách — người mới sẽ nhận thông báo và cần xác nhận tiếp nhận.") }),
        active && isOwner && flow.status === "answered" && /* @__PURE__ */ jsxRuntimeExports.jsx(Reask, { round, disabled: busy, onSend: (note, snap) => run(() => oqApi.reask(flow.id, note, null, snap), "Đã gửi yêu cầu hỏi lại.") }),
        resps.some((r) => r.is_published) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigator.clipboard.writeText(copyText(flow.kind, items, cfg, resps, conclusion)).then(() => toast.success("Đã sao chép kết quả đã công bố.")), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4 mr-1" }),
          "Sao chép kết quả"
        ] })
      ] }),
      editable && flow.waiting_info && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed p-2 text-xs", children: "Đang chờ Sale bổ sung thông tin — bạn vẫn lưu nháp được, nút Công bố tạm khóa đến khi Sale trả lời." }),
      editable && miss.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted p-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Còn thiếu (luồng tự hoàn tất khi công bố đủ):" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc ml-4", children: miss.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: m }, m)) })
      ] })
    ] }) }),
    flow.waiting_info && isOwner && active && (() => {
      const open = infos.filter((i) => !i.answered_at).pop();
      return open ? /* @__PURE__ */ jsxRuntimeExports.jsx(AnswerInfo, { info: open, requestId: d.req.id, items: d.items, images: d.images.filter((g) => g.info_request_id === open.id), disabled: busy, onChanged, onSend: (a) => run(() => oqApi.answerInfo(flow.id, a), "Đã gửi bổ sung.") }) : null;
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-sm space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold mb-1", children: [
        "Sale yêu cầu (lượt ",
        round?.no,
        ")"
      ] }),
      round?.request_note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: round.request_note }),
      flow.kind === "price" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        cfg.shipping_mode === "common" && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Vận chuyển", v: `Hỏi chung${cfg.shipping_note ? `: ${cfg.shipping_note}` : ""}` }),
        cfg.note && round?.request_note !== cfg.note && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Ghi chú", v: cfg.note })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Loại kiểm tra", v: round?.config?.check_type === "in_progress" ? "Tiến độ đơn đang thực hiện" : "Khả năng đáp ứng" }),
        round?.config?.existing_code && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Mã đơn hiện có", v: round.config.existing_code }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { k: "Ngày khách cần", v: vnDate(d.req.delivery_date) })
      ] })
    ] }) }),
    navTargets.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden sticky top-14 z-10 -mx-1 bg-background/95 px-1 py-2 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold mb-1.5", children: [
        flow.kind === "price" ? "BÁO GIÁ" : "PHẢN HỒI",
        " — ",
        Math.max(1, navTargets.findIndex((t) => t.id === selId) + 1),
        "/",
        navTargets.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 overflow-x-auto pb-1", children: navTargets.map((t) => {
        const st = tStatus(t.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSel(t.id), className: cn("shrink-0 rounded-full border px-3 py-1.5 text-xs", t.id === selId ? "border-primary bg-primary text-primary-foreground" : st === "pub" ? "border-primary/40 bg-primary/10" : st === "draft" ? "border-dashed border-foreground/40" : ""), children: [
          t.code || t.name.slice(0, 12),
          " · ",
          st === "pub" ? "Đã công bố" : st === "draft" ? "Nháp" : "Chưa"
        ] }, t.id);
      }) })
    ] }),
    targetsList.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(navTargets.length > 1 && it.id !== selId && "hidden lg:block"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponseCard, { isLast: isLastFor(it), images: d.images.filter((g) => g.item_id === it.id), kind: flow.kind, item: it, cfg, round, resps: resps.filter((r) => r.target === it.id), editable, busy, locked: flow.waiting_info, onSave: (c) => run(() => oqApi.saveResponse(flow.id, it.id, c), "Đã lưu nháp phản hồi."), onPublish: (c) => run(() => oqApi.publish(flow.id, it.id, c), "Đã công bố kết quả."), name }) }, `${round?.id}-${it.id}`)),
    flow.kind === "price" && cfg.shipping_mode === "common" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(navTargets.length > 1 && selId !== "shipping" && "hidden lg:block"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponseCard, { isLast: miss.every((m) => m === "Giá vận chuyển chung"), kind: "price", item: {
      id: "shipping",
      code: "VC",
      name: "Vận chuyển chung"
    }, cfg, round, shippingOnly: true, resps: resps.filter((r) => r.target === "shipping"), editable, busy, locked: flow.waiting_info, onSave: (c) => run(() => oqApi.saveResponse(flow.id, "shipping", c), "Đã lưu nháp."), onPublish: (c) => run(() => oqApi.publish(flow.id, "shipping", c), "Đã công bố."), name }) }),
    flow.kind === "progress" && (editable || conclusion) && /* @__PURE__ */ jsxRuntimeExports.jsx(ResponseCard, { kind: "conclusion", item: {
      id: "conclusion",
      code: "",
      name: "Kết luận chung cho toàn bộ đơn hàng"
    }, cfg, round, resps: resps.filter((r) => r.target === "conclusion"), editable, busy, locked: flow.waiting_info, onSave: (c) => run(() => oqApi.saveResponse(flow.id, "conclusion", c), "Đã lưu nháp."), onPublish: (c) => run(() => oqApi.publish(flow.id, "conclusion", c), "Đã công bố."), name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Timeline, { events, infos, flow, name, canComment: active && (isOwner || flow.assignee_id === user?.id), onComment: (t) => run(() => oqApi.comment(flow.id, t)) })
  ] });
}
function ResponseCard({
  kind,
  item,
  cfg,
  round,
  resps,
  editable,
  busy,
  locked,
  onSave,
  onPublish,
  name,
  shippingOnly,
  isLast,
  images
}) {
  const draft = resps.find((r) => !r.is_published);
  const published = resps.filter((r) => r.is_published).sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  const latest = published[0];
  const server = draft?.content ?? latest?.content ?? {};
  const serverKey = JSON.stringify(server);
  const [c, setC] = reactExports.useState(server);
  const [dirty, setDirty] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!dirty) setC(server);
  }, [serverKey]);
  reactExports.useEffect(() => {
    if (!dirty) return;
    const h = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  const edit = (k, v) => {
    setC((p) => ({
      ...p,
      [k]: v
    }));
    setDirty(true);
  };
  const [hist, setHist] = reactExports.useState(false);
  const cats = shippingOnly ? ["shipping"] : kind === "price" ? requestedCats(cfg, item.id) : [];
  const fields = kind === "price" ? [...cats.map((k) => ({
    key: k,
    label: catLabel(k),
    hint: shippingOnly ? cfg.shipping_note : cfg.items?.[item.id]?.[k]?.note
  })), ...shippingOnly ? [] : [{
    key: "note",
    label: "Ghi chú chung của Cung ứng"
  }]] : kind === "progress" ? [{
    key: "reply",
    label: "Nội dung phản hồi tiến độ",
    hint: round?.config?.per_item?.[item.id]
  }, {
    key: "capability",
    label: "Khả năng đáp ứng"
  }, {
    key: "eta",
    label: "Ngày dự kiến giao",
    type: "date"
  }, {
    key: "note",
    label: "Ghi chú & điều kiện"
  }] : [{
    key: "text",
    label: "Kết luận"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      item.code && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: item.code }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 break-words font-medium flex-1", children: item.name }),
      latest ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { children: [
        "Đã công bố v",
        latest.version
      ] }) : editable && draft ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Chưa phản hồi" }),
      editable && draft && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "border-dashed", children: "Đã lưu nháp" })
    ] }),
    !shippingOnly && kind !== "conclusion" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProductQuantity, { qty: item.qty, unit: item.unit }),
    editable && images && images.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Ảnh Sale gửi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ItemImages, { images })
    ] }),
    editable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      fields.map((fd) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: fd.label }),
        fd.hint && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-1", children: [
          "Sale yêu cầu: ",
          fd.hint
        ] }),
        fd.type === "date" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: c[fd.key] ?? "", onChange: (e) => edit(fd.key, e.target.value), className: "w-48" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: fd.key === "note" || fd.key === "capability" ? 2 : 3, className: "field-sizing-content min-h-16 max-h-[50dvh]", value: c[fd.key] ?? "", onChange: (e) => edit(fd.key, e.target.value) })
      ] }, fd.key)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 -mx-4 -mb-4 flex flex-wrap gap-2 justify-end border-t bg-card/95 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur md:static md:m-0 md:border-0 md:bg-transparent md:p-0", children: [
        dirty && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full text-xs text-muted-foreground md:w-auto md:mr-auto md:self-center", children: "Có thay đổi chưa lưu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1 h-11 md:flex-none md:h-9", disabled: busy, onClick: async () => {
          if (await onSave(c)) setDirty(false);
        }, children: "Lưu nháp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "flex-1 h-11 md:flex-none md:h-9", disabled: busy || locked, title: locked ? "Đang chờ Sale bổ sung thông tin" : void 0, onClick: async () => {
          if (confirm((latest ? `Công bố phiên bản mới v${(latest.version ?? 0) + 1}? Bản cũ vẫn được giữ.` : kind === "price" ? "Công bố báo giá sản phẩm này?" : "Công bố kết quả này cho Sale?") + (isLast ? "\n\nĐây là phần cuối cùng còn thiếu — luồng sẽ tự hoàn tất sau khi công bố." : "")) && await onPublish(c)) setDirty(false);
        }, children: kind === "price" ? latest ? "Công bố báo giá mới" : "Công bố báo giá" : kind === "progress" ? latest ? "Công bố phản hồi mới" : "Công bố phản hồi tiến độ" : "Công bố kết luận" })
      ] })
    ] }) : latest ? /* @__PURE__ */ jsxRuntimeExports.jsx(PublishedView, { content: latest.content, fields }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      !shippingOnly && kind === "price" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Hạng mục yêu cầu: ",
        cats.map(catLabel).join(", ")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có kết quả được công bố." })
    ] }),
    latest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
      "Công bố bởi ",
      name(latest.published_by),
      " lúc ",
      vnDateTime(latest.published_at)
    ] }),
    published.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs text-primary", onClick: () => setHist(!hist), children: [
        hist ? "Ẩn" : "Xem",
        " ",
        published.length - 1,
        " phiên bản trước"
      ] }),
      hist && published.slice(1).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded border border-dashed p-2 text-xs opacity-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium mb-1", children: [
          "v",
          p.version,
          " · ",
          vnDateTime(p.published_at)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PublishedView, { content: p.content, fields })
      ] }, p.version))
    ] })
  ] }) });
}
function PublishedView({
  content,
  fields
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 text-sm", children: fields.filter((f) => content[f.key]).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: f.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: f.type === "date" ? vnDate(content[f.key]) : content[f.key] })
  ] }, f.key)) });
}
function Timeline({
  events,
  infos,
  flow,
  name,
  canComment,
  onComment
}) {
  const [t, setT] = reactExports.useState("");
  const list = reactExports.useMemo(() => [...events].reverse(), [events]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Trao đổi & lịch sử" }),
    canComment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: t, onChange: (e) => setT(e.target.value), placeholder: "Nhập trao đổi…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !t.trim(), onClick: () => {
        onComment(t);
        setT("");
      }, children: "Gửi" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-2 text-sm", children: list.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: cn("border-l-2 pl-3", e.kind === "message" || e.kind.startsWith("info_") ? "border-primary" : "border-muted"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        vnDateTime(e.created_at),
        " · ",
        name(e.actor_id),
        e.round_no ? ` · lượt ${e.round_no}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
        EVENT_LABEL[e.kind] ?? e.kind,
        e.kind === "reassigned" && `: ${name(e.detail?.from)} → ${name(e.detail?.to)}`,
        e.kind === "assigned" && `: ${name(e.detail?.to)}`,
        e.kind === "published" && e.detail?.version ? ` (v${e.detail.version})` : ""
      ] }),
      (e.detail?.text || e.detail?.question || e.detail?.answer || e.detail?.note || e.detail?.reason) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: e.detail.text ?? e.detail.question ?? e.detail.answer ?? e.detail.note ?? e.detail.reason })
    ] }, e.id)) }),
    infos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Đã yêu cầu bổ sung ",
      infos.length,
      " lần",
      flow.waiting_info ? " · đang chờ Sale" : "",
      "."
    ] })
  ] }) });
}
function AskInfo({
  disabled,
  onSend
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [q, setQ] = reactExports.useState("");
  if (!open) return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled, onClick: () => setOpen(true), children: "Yêu cầu bổ sung thông tin" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: q, onChange: (e) => setQ(e.target.value), placeholder: "Nội dung cần Sale làm rõ" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !q.trim(), onClick: () => {
        onSend(q);
        setOpen(false);
        setQ("");
      }, children: "Gửi yêu cầu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpen(false), children: "Hủy" })
    ] })
  ] });
}
function AnswerInfo({
  info,
  requestId,
  items,
  images,
  disabled,
  onSend,
  onChanged
}) {
  const [a, setA] = reactExports.useState("");
  const [item, setItem] = reactExports.useState(items[0]?.id ?? "");
  const [cat, setCat] = reactExports.useState("logo");
  const [cap, setCap] = reactExports.useState("");
  const [up, setUp] = reactExports.useState(false);
  const add = async (fl) => {
    if (!fl?.length || !item) return;
    setUp(true);
    try {
      for (const file of Array.from(fl)) await oqApi.uploadInfoImage(requestId, info.id, item, file, cat, cap);
      setCap("");
      toast.success("Đã tải ảnh bổ sung.");
      onChanged();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUp(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: "Cung ứng cần bạn bổ sung" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-wrap", children: info.question }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: a, onChange: (e) => setA(e.target.value), placeholder: "Nội dung bổ sung" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Ảnh bổ sung (tùy chọn)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: item, onValueChange: setItem, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn sản phẩm" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: it.id, children: [
            it.code,
            " ",
            it.name
          ] }, it.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cat, onValueChange: setCat, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(IMG_CAT).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", value: cap, onChange: (e) => setCap(e.target.value), placeholder: "Chú thích ảnh", maxLength: 1e3 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: up || !item, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-4 w-4 mr-1" }),
        up ? "Đang tải…" : "Chọn / chụp ảnh",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", multiple: true, hidden: true, onChange: (e) => {
          add(e.target.files);
          e.target.value = "";
        } })
      ] }) }),
      images.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.filter((it) => images.some((g) => g.item_id === it.id)).map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mb-1", children: [
          it.code,
          " ",
          it.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ItemImages, { images: images.filter((g) => g.item_id === it.id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: images.filter((g) => g.item_id === it.id).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", onClick: () => oqApi.deleteInfoImage(g.id).then(onChanged).catch((e) => toast.error(e.message)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3 mr-1" }),
          "Bỏ ảnh ",
          g.caption ?? IMG_CAT[g.category]
        ] }, g.id)) })
      ] }, it.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: disabled || up || !a.trim(), onClick: async () => {
      if (await onSend(a)) setA("");
    }, children: "Gửi bổ sung" })
  ] }) });
}
function Reassign({
  flow,
  disabled,
  onPick
}) {
  const users = useQuery({
    queryKey: ["oq-assignees", flow.kind],
    queryFn: () => oqApi.assignees(flow.kind)
  }).data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: "", onValueChange: (v) => v !== flow.assignee_id && confirm("Đổi người phụ trách luồng này?") && onPick(v), disabled, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Đổi người phụ trách" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: users.filter((u) => u.id !== flow.assignee_id).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.id, children: u.full_name }, u.id)) })
  ] });
}
function Reask({
  round,
  disabled,
  onSend
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [note, setNote] = reactExports.useState("");
  const [snap, setSnap] = reactExports.useState(round?.items_snapshot ?? []);
  reactExports.useEffect(() => setSnap(round?.items_snapshot ?? []), [round?.id]);
  const badQty = snap.some((it) => !(Number(it.qty) > 0));
  if (!open) return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled, onClick: () => setOpen(true), children: "Hỏi lại" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-2 rounded-md border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nội dung hỏi lại *" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: note, onChange: (e) => setNote(e.target.value), placeholder: "Ví dụ: khách đổi thành 1.000 bộ" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Điều chỉnh số lượng áp dụng cho lượt mới (kết quả lượt cũ được giữ nguyên):" }),
    snap.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 truncate", children: [
        it.code,
        " ",
        it.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "w-28 h-8", value: it.qty ?? "", onChange: (e) => setSnap(snap.map((x, j) => j === i ? {
        ...x,
        qty: e.target.value === "" ? null : Number(e.target.value)
      } : x)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 text-xs", children: it.unit })
    ] }, it.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      badQty && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive self-center", children: "Số lượng phải lớn hơn 0." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: !note.trim() || badQty, onClick: () => {
        onSend(note, snap);
        setOpen(false);
        setNote("");
      }, children: "Gửi hỏi lại" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpen(false), children: "Hủy" })
    ] })
  ] });
}
function CancelButton({
  d,
  flow,
  onDone
}) {
  const {
    user,
    can
  } = useCurrentUser();
  if (d.req.status !== "submitted" || !(d.req.creator_id === user?.id || can("oq.manage"))) return null;
  const go = (flowId) => {
    const reason = prompt(flowId ? "Lý do dừng luồng này:" : "Lý do hủy toàn bộ yêu cầu:");
    if (reason?.trim()) oqApi.cancel(d.req.id, flowId, reason).then(() => {
      toast.success("Đã hủy.");
      onDone();
    }).catch((e) => toast.error(e.message));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex flex-wrap justify-end gap-2 sm:col-span-1", children: [
    flow && d.flows.length > 1 && flow.status !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => go(flow.id), children: "Dừng luồng này" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-destructive", onClick: () => go(null), children: "Hủy yêu cầu" })
  ] });
}
const Info = ({
  k,
  v
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[110px_minmax(0,1fr)] gap-2", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: k }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap break-words", children: v })
] });
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["oq.create", "oq.view_own", "oq.view_all", "oq.accept", "oq.reply_price", "oq.reply_progress", "oq.manage"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(OqDetail, {}) });
export {
  SplitComponent as component
};
