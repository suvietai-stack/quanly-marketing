import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useRouter, f as useCanGoBack, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { c2 as Route$g, u as useCurrentUser, F as useAuth, l as Badge, L as Label, I as Input, B as Button } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { e as receiver, n as confirmationActions, d as vnd, T as TX_STATUS, f as TX_VARIANT, g as fmtTime, o as fmtDate, p as MONEY_TYPES, q as ReminderPanel, M as ManualEntry, E as EVENT_LABEL, t as checkNoteError } from "./ManualEntry-D51XSuMW.mjs";
import "../_libs/seroval.mjs";
import { A as ArrowLeft, a9 as LoaderCircle } from "../_libs/lucide-react.mjs";
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
import "./alert-dialog-CW0Q8d6x.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
const field = "text-base md:text-sm";
function Detail() {
  const {
    id
  } = Route$g.useParams();
  const qc = useQueryClient();
  const {
    user,
    can
  } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const nameOf = (u) => u && users.find((x) => x.id === u)?.fullName || "—";
  const canClaim = can("finance.incoming.claim");
  const canRec = can("finance.incoming.reconcile");
  const canManage = can("finance.incoming.manage");
  const canManual = can("finance.incoming.manual_manage");
  const router = useRouter();
  const canBack = useCanGoBack();
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const {
    data: t,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["bank_tx", user?.id, id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("bank_transactions").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: labels
  } = useQuery({
    queryKey: ["fin_bank_labels"],
    queryFn: async () => (await supabase.rpc("fin_bank_labels")).data ?? []
  });
  const {
    data: dups
  } = useQuery({
    queryKey: ["bank_tx_dups", user?.id, id, t?.amount, t?.received_date],
    enabled: !!t && t.source !== "bank" && !t.cancelled_at,
    queryFn: async () => {
      if (!t) return [];
      const base = (/* @__PURE__ */ new Date(`${t.received_date ?? t.transaction_at?.slice(0, 10)}T00:00:00+07:00`)).getTime();
      const {
        data
      } = await supabase.from("bank_transactions").select("id, transaction_at, description").eq("source", "bank").eq("amount", t.amount).gte("transaction_at", new Date(base - 3 * 864e5).toISOString()).lt("transaction_at", new Date(base + 4 * 864e5).toISOString()).limit(5);
      return data ?? [];
    }
  });
  const {
    data: events
  } = useQuery({
    queryKey: ["bank_tx_events", id, user?.id],
    queryFn: async () => (await supabase.from("bank_transaction_events").select("id, actor_id, action, reason, created_at").eq("tx_id", id).order("created_at")).data ?? []
  });
  const [f, setF] = reactExports.useState({
    customer: "",
    type: "",
    ref: "",
    note: ""
  });
  const [reason, setReason] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (t) setF({
      customer: t.customer ?? "",
      type: t.money_type ?? "",
      ref: t.ref_code ?? "",
      note: t.note ?? ""
    });
  }, [t?.id, t?.confirmation_status, t?.note]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-muted-foreground", children: "Đang tải…" });
  if (!t) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-muted-foreground", children: "Không tìm thấy giao dịch hoặc bạn không có quyền xem." });
  const isBank = t.source === "bank";
  const cancelled = !!t.cancelled_at;
  const rc = receiver(t, labels);
  const lb = labels?.find((l) => l.id === t.bank_account_id);
  const actions = confirmationActions(t, user?.id, canClaim, canRec, canManage);
  const saleEditable = actions.sale;
  const manualEditable = !t.operation_test && !isBank && !cancelled && canManual && (t.confirmation_status !== "confirmed" || canManage);
  const directEligible = actions.other;
  const isOther = f.type === "other";
  const directOther = directEligible && isOther;
  const showForm = saleEditable || directEligible;
  const done = async (p, ok) => {
    if (busy) return;
    setBusy(true);
    const {
      error
    } = await p;
    setBusy(false);
    if (error) {
      toast.error(error.message || "Không thực hiện được");
      refetch();
      return;
    }
    toast.success(ok);
    setReason("");
    qc.invalidateQueries({
      queryKey: ["bank_transactions"]
    });
    qc.invalidateQueries({
      queryKey: ["bank_tx_events", id]
    });
    qc.invalidateQueries({
      queryKey: ["bank_tx", user?.id, id]
    });
    refetch();
  };
  const check = () => {
    const error = checkNoteError(f);
    if (error) return toast.error(error), false;
    return true;
  };
  const args = {
    _tx: id,
    _customer: f.customer,
    _type: f.type,
    _ref: f.ref,
    _note: f.note
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto pb-28 md:pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/finance/incoming", onClick: (e) => {
      if (canBack) {
        e.preventDefault();
        router.history.back();
      }
    }, className: "inline-flex items-center text-sm text-muted-foreground mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
      "Tiền Về"
    ] }),
    t.operation_test && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-sm text-muted-foreground", children: "Lịch sử kiểm thử — trước mốc vận hành" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-primary", children: vnd(Number(t.amount)) }),
        cancelled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Đã hủy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: TX_VARIANT[t.confirmation_status] ?? "secondary", children: TX_STATUS[t.confirmation_status] ?? t.confirmation_status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-semibold uppercase", children: [
        isBank ? "TK nhận" : "Nguồn tiền",
        ": ",
        rc.main
      ] }),
      isBank ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm grid grid-cols-[130px_1fr] gap-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ngân hàng nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lb ? `${lb.bank_name} · ****${lb.last4}` : t.bank_name || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thời gian" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtTime(t.transaction_at, t.transaction_date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nội dung CK" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap break-words", children: t.description || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Mã giao dịch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-all", children: t.reference_number || "—" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm grid grid-cols-[130px_1fr] gap-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ngày nhận tiền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtDate(t.received_date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người tạo khoản tiền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: nameOf(t.created_by) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thời gian tạo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtTime(t.created_at) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sale xác nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: nameOf(t.claimed_by) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thời gian xác nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtTime(t.claimed_at) }),
        !t.claimed_by && t.confirmed_by && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người xác nhận" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            nameOf(t.confirmed_by),
            " · ",
            fmtTime(t.confirmed_at)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ghi chú Kế toán" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap break-words", children: t.description || "—" }),
        cancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hủy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            nameOf(t.cancelled_by),
            " · ",
            fmtTime(t.cancelled_at),
            ": ",
            t.cancel_reason
          ] })
        ] })
      ] }),
      !isBank && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Khoản nhập thủ công — chưa được ngân hàng xác thực." })
    ] }),
    !!dups?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Có khả năng trùng" }),
      " với giao dịch ngân hàng cùng số tiền:",
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 list-disc pl-5", children: dups.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/finance/incoming/$id", params: {
        id: d.id
      }, className: "underline", children: [
        fmtTime(d.transaction_at),
        " · ",
        (d.description ?? "").slice(0, 60)
      ] }) }, d.id)) }),
      canManual && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-muted-foreground", children: "Nếu đúng là trùng, hãy hủy khoản thủ công này và ghi lý do." })
    ] }),
    t.info_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Yêu cầu chỉnh sửa trước đây:" }),
      " ",
      t.info_reason
    ] }),
    t.confirmed_by || t.claimed_by || t.reconciled_by || isBank && t.customer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-lg border bg-card p-4 text-sm grid grid-cols-[130px_1fr] gap-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sale xác nhận" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        nameOf(t.claimed_by),
        t.claimed_at ? ` · ${fmtTime(t.claimed_at)}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Khách hàng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.customer || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Loại tiền" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: MONEY_TYPES[t.money_type ?? ""] ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Mã đơn / tham chiếu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.ref_code || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Ghi chú" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap", children: t.note || "—" }),
      t.reconciled_by && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Đối soát trước đây" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          nameOf(t.reconciled_by),
          " · ",
          fmtTime(t.reconciled_at)
        ] })
      ] })
    ] }) : null,
    !t.operation_test && /* @__PURE__ */ jsxRuntimeExports.jsx(ReminderPanel, { txId: t.id, pending: t.confirmation_status === "unclaimed" && !t.cancelled_at }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border bg-card p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Xác nhận tiền về" }),
      !isOther && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Khách hàng *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: `h-11 ${field}`, value: f.customer, maxLength: 200, placeholder: "Tên khách hàng hoặc công ty", onChange: (e) => setF({
          ...f,
          customer: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại tiền *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: `h-11 w-full rounded-md border border-input bg-background px-3 ${field}`, value: f.type, onChange: (e) => setF({
          ...f,
          type: e.target.value
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn loại tiền —" }),
          Object.entries(MONEY_TYPES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k))
        ] })
      ] }),
      !isOther && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mã đơn / Mã tham chiếu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: `h-11 ${field}`, value: f.ref, maxLength: 100, placeholder: "Có thể bỏ trống", onChange: (e) => setF({
          ...f,
          ref: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: isOther ? "Ghi chú khoản tiền *" : "Ghi chú chi tiết *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: `min-h-28 ${field}`, value: f.note, maxLength: 2e3, placeholder: isOther ? "VD: Tiền hoàn ứng nội bộ." : "VD: Khách Công ty ABC cọc 50 bộ ly sứ in logo, Sale Nguyễn A phụ trách.", onChange: (e) => setF({
          ...f,
          note: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed md:static bottom-0 inset-x-0 p-3 md:p-0 bg-background border-t md:border-0 flex flex-col md:flex-row gap-2 z-20", children: directOther ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-12 md:h-10 w-full md:w-auto", disabled: busy, onClick: () => check() && done(supabase.rpc("fin_reconcile", {
        _tx: id,
        _type: "other",
        _note: f.note
      }), "Đã xác nhận giao dịch"), children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
        "Ghi chú & xác nhận giao dịch"
      ] }) : saleEditable && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-12 md:h-10 w-full md:w-auto", disabled: busy, onClick: () => check() && done(supabase.rpc("fin_claim", args), "Đã xác nhận giao dịch"), children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
        "Xác nhận giao dịch"
      ] }) })
    ] }),
    actions.note && (!showForm || canRec || canManage) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Điều chỉnh ghi chú" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: field, value: f.note, maxLength: 2e3, onChange: (e) => setF({
        ...f,
        note: e.target.value
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do điều chỉnh *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: field, value: reason, maxLength: 2e3, onChange: (e) => setReason(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || !f.note.trim() || !reason.trim(), onClick: () => done(supabase.rpc("fin_note_update", {
        _tx: id,
        _note: f.note,
        _reason: reason
      }), "Đã lưu ghi chú và lịch sử"), children: "Lưu ghi chú" })
    ] }),
    manualEditable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Quản lý khoản thủ công" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditOpen(true), children: "Sửa khoản tiền" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ManualEntry, { open: editOpen, onOpenChange: setEditOpen, canReconcile: false, edit: {
        id: t.id,
        source: t.source,
        amount: Number(t.amount),
        received_date: t.received_date,
        note: t.description ?? t.note,
        reconciled: t.confirmation_status === "confirmed"
      }, onDone: () => {
        qc.invalidateQueries({
          queryKey: ["bank_transactions"]
        });
        qc.invalidateQueries({
          queryKey: ["bank_tx_events", id]
        });
        refetch();
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 pt-2 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: field, value: reason, onChange: (e) => setReason(e.target.value), placeholder: "VD: Nhập nhầm / trùng với giao dịch ngân hàng" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: busy || !reason.trim(), onClick: () => confirm("Hủy khoản tiền này? Khoản hủy không được tính vào tổng.") && done(supabase.rpc("fin_manual_cancel", {
        _tx: id,
        _reason: reason
      }), "Đã hủy khoản tiền"), children: "Hủy khoản tiền" })
    ] }),
    !t.operation_test && !cancelled && (canRec || canManage) && t.claimed_by && (t.confirmation_status !== "confirmed" || canManage) && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-4 rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Điều chỉnh nhận nhầm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gỡ Sale đã nhận và đưa giao dịch về “Chưa xác nhận”. Thao tác được lưu lịch sử." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: field, placeholder: "Lý do điều chỉnh", value: reason, onChange: (e) => setReason(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: busy || !reason.trim(), onClick: () => done(supabase.rpc("fin_reset", {
          _tx: id,
          _reason: reason
        }), "Đã đưa về chưa xác nhận"), children: "Đưa về chưa xác nhận" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-2 text-sm", children: "Lịch sử xử lý" }),
      !events?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Chưa có thao tác." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-sm", children: events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: fmtTime(e.created_at) }),
        " · ",
        EVENT_LABEL[e.action] ?? e.action,
        " — ",
        nameOf(e.actor_id),
        e.reason ? `: ${e.reason}` : ""
      ] }, e.id)) })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["finance.incoming.view", "finance.incoming.claim", "finance.incoming.reconcile", "finance.incoming.manage", "finance.incoming.manual_view"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, {}) });
export {
  SplitComponent as component
};
