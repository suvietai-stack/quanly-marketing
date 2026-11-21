import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, L as Label, B as Button, I as Input, a as useServerFn, u as useCurrentUser, F as useAuth, c as createSsrRpc } from "./router-CkmTURa-.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel, g as AlertDialogAction } from "./alert-dialog-CW0Q8d6x.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { a9 as LoaderCircle, bN as BellRing } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, b as booleanType } from "../_libs/zod.mjs";
const gmfStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8ab9fbd99c194937ab7d267fa0a1b7eca0c96c4124f23e7eb82401e25c875fd5"));
const gmfListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6d4fe17eb079327ce7e7e229905a07f31eb28f3d9e667b05266a475177064e07"));
const gmfSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType()
}).parse(d)).handler(createSsrRpc("fdc833ecb4cfc79641bf8b3a39bd04225a35472e9c78dc9ab0557a7c7e4ffe43"));
const gmfSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3bed5df2270a40545d8d6ad6a35bd41a99acc9beac8c4f862a6932c0b03677f0"));
const gmfRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("199dee88cf0bf496bc4d50ede94b8f59553c2652ba210d7a3a6e647bf693bdf5"));
const finManualNotify = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("483ebddcdcb56717e3f0eb2a012a33da583984f8f0935a431f89a64df40bf814"));
const finRemindManual = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e243f0caa08b25912376e4e7fd591a6f911bff7df0507d2d4f1dfad1034c9e3d"));
const TX_STATUS = {
  unclaimed: "Chưa xác nhận",
  confirmed: "Đã xác nhận"
};
const TX_VARIANT = {
  unclaimed: "secondary",
  confirmed: "outline"
};
const MONEY_TYPES = {
  deposit: "Tiền cọc",
  payment: "Thanh toán",
  extra_payment: "Thanh toán bổ sung",
  refund: "Hoàn tiền",
  other: "Khác"
};
const SOURCES = { cash: "Tiền mặt", other_account: "TK khác" };
const EVENT_LABEL = {
  claim: "Sale xác nhận",
  edit: "Sale sửa thông tin",
  resubmit: "Sale cập nhật theo yêu cầu",
  request_info: "Kế toán yêu cầu chỉnh sửa",
  confirm_other: "Kế toán xác nhận loại Khác",
  note_edit: "Điều chỉnh ghi chú",
  reconcile: "Kế toán đối soát (lịch sử)",
  reset: "Điều chỉnh: đưa về chưa xác nhận",
  manual_create: "Tạo khoản thủ công",
  manual_edit: "Sửa khoản thủ công",
  manual_cancel: "Hủy khoản thủ công"
};
const vnd = (n) => "+" + Number(n).toLocaleString("vi-VN") + "đ";
function checkNoteError(f) {
  if (!f.type) return "Vui lòng chọn Loại tiền";
  if (f.type !== "other" && !f.customer.trim()) return "Vui lòng nhập Khách hàng";
  if (!f.note.trim()) return f.type === "other" ? "Vui lòng nhập Ghi chú khoản tiền" : "Vui lòng nhập Ghi chú chi tiết";
  return null;
}
const fmtTime = (iso, raw) => iso ? new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : raw || "—";
const fmtDate = (d) => d ? d.split("-").reverse().join("/") : "—";
function receiver(t, labels) {
  if (t.source && t.source !== "bank") return { main: SOURCES[t.source] ?? t.source, sub: "" };
  const l = labels?.find((x) => x.id === t.bank_account_id);
  return { main: l?.label || t.bank_name || "—", sub: l ? `${l.bank_name} · ****${l.last4}` : t.bank_name || "" };
}
const safeQ = (q) => q.replace(/[,()*%\\:"']/g, " ").trim().slice(0, 100);
function searchAmount(q) {
  const text = q.trim();
  if (!/^[0-9]+([.,][0-9]{3})*$/.test(text)) return null;
  const digits = text.replace(/[.,]/g, "");
  if (digits.length > 16) return null;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? amount : null;
}
const vnStart = (d) => d ? (/* @__PURE__ */ new Date(`${d}T00:00:00+07:00`)).toISOString() : null;
const vnEndExcl = (d) => d ? new Date((/* @__PURE__ */ new Date(`${d}T00:00:00+07:00`)).getTime() + 864e5).toISOString() : null;
function confirmationFilter(status) {
  if (["confirmed", "pending_reconciliation", "reconciled"].includes(status)) return "confirmed";
  return status === "unclaimed" ? "unclaimed" : "";
}
function confirmationActions(t, userId, claim, accounting, manage) {
  const active = !t.operation_test && !t.cancelled_at;
  const unowned = t.confirmation_status === "unclaimed" && !t.claimed_by;
  return { sale: active && claim && unowned, other: active && accounting && unowned, note: active && (accounting || manage || claim && !!userId && t.claimed_by === userId) };
}
function RemindButton({ txId, size = "sm", className }) {
  const remind = useServerFn(finRemindManual);
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const send = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await remind({ data: { id: txId } });
      (r.ok ? toast.success : toast.error)(r.message);
    } catch (e) {
      toast.error(e?.message || "Không gửi được nhắc");
    }
    setBusy(false);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["fin_reminders"] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { onClick: (e) => e.stopPropagation(), "data-signal-interactive": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size, variant: "outline", className, disabled: busy, onClick: () => setOpen(true), children: [
      busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "h-4 w-4 mr-1" }),
      "Nhắc xác nhận"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open, onOpenChange: (o) => !busy && setOpen(o), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Nhắc xác nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Gửi lại thông báo nhắc xác nhận khoản tiền này vào nhóm?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: busy, children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogAction, { disabled: busy, onClick: (e) => {
          e.preventDefault();
          send();
        }, children: [
          busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
          "Gửi nhắc"
        ] })
      ] })
    ] }) })
  ] });
}
const remindersQuery = (ids) => ({
  queryKey: ["fin_reminders", ids],
  enabled: ids.length > 0,
  queryFn: async () => {
    const { data, error } = await supabase.from("fin_reminders").select("tx_id, kind, seq, status, sent_by, created_at, error").in("tx_id", ids).order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
});
const autoCount = (rows, id) => (rows ?? []).filter((r) => r.tx_id === id && r.kind === "auto" && r.status !== "failed").length;
const ST = { sent: "Đã gửi", failed: "Lỗi", unknown: "Không rõ kết quả", sending: "Đang gửi" };
function ReminderPanel({ txId, pending, max = 5 }) {
  const { can } = useCurrentUser();
  const users = useAuth((s) => s.users);
  const { data } = useQuery(remindersQuery([txId]));
  const n = autoCount(data, txId);
  if (!pending && !data?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
        "Nhắc xác nhận ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal text-muted-foreground", children: [
          "· tự động ",
          n,
          "/",
          max
        ] })
      ] }),
      pending && can("finance.incoming.remind") && /* @__PURE__ */ jsxRuntimeExports.jsx(RemindButton, { txId, className: "h-11 md:h-9" })
    ] }),
    data?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm space-y-1", children: data.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap gap-x-2 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: r.kind === "auto" ? `Tự động lần ${r.seq}` : `Thủ công — ${users.find((u) => u.id === r.sent_by)?.fullName ?? "—"}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtTime(r.created_at) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: r.status === "failed" ? "text-destructive" : "", children: ST[r.status] ?? r.status })
    ] }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lượt nhắc nào." })
  ] });
}
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(/* @__PURE__ */ new Date());
const fmtNum = (s) => {
  const d = s.replace(/\D/g, "").replace(/^0+/, "");
  return d ? Number(d).toLocaleString("vi-VN") : "";
};
function ManualEntry({ open, onOpenChange, canReconcile, edit, onDone }) {
  const [f, setF] = reactExports.useState({ source: "", amount: "", date: today(), note: "", reason: "" });
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!open) return;
    setF(edit ? { source: edit.source, amount: Number(edit.amount).toLocaleString("vi-VN"), date: edit.received_date ?? today(), note: edit.note ?? "", reason: "" } : { source: "", amount: "", date: today(), note: "", reason: "" });
  }, [open, edit?.id]);
  const submit = async () => {
    const amount = Number(f.amount.replace(/\D/g, ""));
    if (!f.source) return toast.error("Vui lòng chọn Nguồn tiền");
    if (!amount) return toast.error("Số tiền phải lớn hơn 0");
    if (!f.date) return toast.error("Vui lòng chọn Ngày nhận tiền");
    if (!f.note.trim()) return toast.error("Vui lòng nhập Ghi chú");
    if (edit?.reconciled && !f.reason.trim()) return toast.error("Vui lòng nhập lý do sửa khoản đã xác nhận");
    setBusy(true);
    const res = edit ? await supabase.rpc("fin_manual_update", { _tx: edit.id, _source: f.source, _amount: amount, _date: f.date, _note: f.note, _reason: f.reason || void 0 }) : await supabase.rpc("fin_manual_create", { _source: f.source, _amount: amount, _date: f.date, _note: f.note });
    setBusy(false);
    if (res.error) return toast.error(res.error.message || "Không lưu được");
    if (!edit && res.data) finManualNotify({ data: { id: res.data } }).catch(() => {
    });
    toast.success(edit ? "Đã lưu thay đổi" : "Đã lưu khoản tiền — Chưa xác nhận");
    onOpenChange(false);
    onDone(edit ? edit.id : res.data);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: edit ? "Sửa khoản thủ công" : "Thêm khoản tiền" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nguồn tiền *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.entries(SOURCES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: f.source === k ? "default" : "outline", className: "h-11", onClick: () => setF({ ...f, source: k }), children: v }, k)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "“TK khác”: tiền vào tài khoản ngân hàng chưa cấu hình / không đồng bộ Casso." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số tiền (VNĐ) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-11 text-base md:text-sm", inputMode: "numeric", value: f.amount, placeholder: "5.000.000", onChange: (e) => setF({ ...f, amount: fmtNum(e.target.value) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày nhận tiền *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-11 text-base md:text-sm", type: "date", max: today(), value: f.date, onChange: (e) => setF({ ...f, date: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "min-h-28 text-base md:text-sm", maxLength: 2e3, value: f.note, placeholder: "VD: Khách Nguyễn Văn A đưa 5 triệu tiền mặt đặt cọc lô ly sứ.", onChange: (e) => setF({ ...f, note: e.target.value }) })
      ] }),
      edit?.reconciled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do sửa *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.reason, onChange: (e) => setF({ ...f, reason: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row justify-end gap-2", children: edit ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: busy, onClick: () => submit(), children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
        "Lưu thay đổi"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: busy, onClick: () => submit(), children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
        "Lưu khoản tiền"
      ] }) })
    ] })
  ] }) });
}
export {
  EVENT_LABEL as E,
  ManualEntry as M,
  RemindButton as R,
  TX_STATUS as T,
  safeQ as a,
  vnEndExcl as b,
  confirmationFilter as c,
  vnd as d,
  receiver as e,
  TX_VARIANT as f,
  fmtTime as g,
  autoCount as h,
  gmfStatus as i,
  gmfListGroups as j,
  gmfSave as k,
  gmfSendTest as l,
  gmfRetry as m,
  confirmationActions as n,
  fmtDate as o,
  MONEY_TYPES as p,
  ReminderPanel as q,
  remindersQuery as r,
  searchAmount as s,
  checkNoteError as t,
  vnStart as v
};
