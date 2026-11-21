import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, C as Card, o as CardContent, F as useAuth, I as Input, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, E as DialogFooter, l as Badge, L as Label, j as cn, z as zaloDispatch, n as pushDispatch } from "./router-CkmTURa-.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { g as getSettings, L as LeaveSettings, l as leaveErr } from "./LeaveSettings-DoiRb7lN.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { a as fmtDate, f as fmtVn, t as todayVn } from "./calc-BK6sHnP3.mjs";
import { ATT_TYPE_LABEL, KIND_LABEL, declaredTime, WITNESS_LABEL, validateAtt, ATT_NOTE, DEFAULT_ATT_REASONS } from "./attendance-Br4iDv6M.mjs";
import { L as LeaveReport } from "./LeaveReport-wYBmfLxZ.mjs";
import { F as FunctionSettingsButton, a as FunctionSettingsDialog, A as ATT_PERSONAL_PERMS, b as ATT_PERM_CATEGORIES } from "./FunctionSettings-CX6UiV0J.mjs";
import "../_libs/seroval.mjs";
import { a6 as Plus, a1 as FingerprintPattern, s as ChevronRight } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "./zaloGroupMessage-kyI4Tfnt.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const db = supabase;
const ATT_ACTION_LABEL = {
  submit: "Gửi giải trình",
  edit: "Sửa giải trình",
  recall: "Thu hồi",
  witness_confirm: "Người làm chứng xác nhận",
  witness_unable: "Người làm chứng không thể xác nhận",
  reconcile: "Đánh dấu đã đối chiếu",
  note: "Cập nhật ghi chú đối chiếu"
};
async function rpc(fn, args2, wake = false) {
  const { data, error } = await db.rpc(fn, args2);
  if (error) throw error;
  if (wake) {
    zaloDispatch().catch(() => {
    });
    pushDispatch().catch(() => {
    });
  }
  return data;
}
async function listAtt() {
  const { data, error } = await db.from("attendance_explanations").select("*").order("work_date", { ascending: false }).limit(2e3);
  if (error) throw error;
  return data || [];
}
async function getAtt(id) {
  const { data, error } = await db.from("attendance_explanations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
async function getAttEvents(id) {
  const { data, error } = await db.from("attendance_explanation_events").select("*").eq("explanation_id", id).order("created_at");
  if (error) throw error;
  return data || [];
}
const args = (f) => ({ _date: f.work_date, _kind: f.kind, _in: f.time_in || null, _out: f.time_out || null, _reason_id: f.reason_id, _detail: f.detail, _witness: f.witness_id });
const listWitnesses = () => rpc("att_witnesses");
const submitAtt = (f) => rpc("att_submit", args(f), true);
const updateAtt = (id, f) => rpc("att_update", { _id: id, ...args(f) }, true);
const recallAtt = (id) => rpc("att_recall", { _id: id });
const witnessAtt = (id, confirm, note) => rpc("att_witness", { _id: id, _confirm: confirm, _note: note });
const reconcileAtt = (id, note) => rpc("att_reconcile", { _id: id, _note: note });
const noteAtt = (id, note) => rpc("att_note", { _id: id, _note: note });
const W_CLS = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  confirmed: "bg-success/15 text-success border-success/30",
  unable: "bg-destructive/10 text-destructive border-destructive/30"
};
function attReasons(s) {
  const r = s?.attendance?.reasons;
  return Array.isArray(r) && r.length ? r : DEFAULT_ATT_REASONS;
}
function AttBadges({ a }) {
  if (a.recalled) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-muted text-muted-foreground", children: "Đã thu hồi" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: W_CLS[a.witness_status], children: [
      "Làm chứng: ",
      WITNESS_LABEL[a.witness_status]
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: a.reconciled ? "bg-success/15 text-success border-success/30" : "", children: a.reconciled ? "Đã đối chiếu" : "Chưa đối chiếu" })
  ] });
}
function AttCard({ a, name, showOwner, onOpen }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onOpen(a.id), className: "w-full text-left rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FingerprintPattern, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
        ATT_TYPE_LABEL,
        showOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
          " · ",
          name(a.owner_id)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        fmtDate(a.work_date),
        " · ",
        KIND_LABEL[a.kind],
        " · ",
        declaredTime(a)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
        "Người làm chứng: ",
        name(a.witness_id)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AttBadges, { a }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground mt-1 shrink-0" })
  ] }) });
}
function AttManage({ rows, loading, name, onOpen }) {
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [emp, setEmp] = reactExports.useState("all");
  const [kind, setKind] = reactExports.useState("all");
  const [ws, setWs] = reactExports.useState("all");
  const [rc, setRc] = reactExports.useState("all");
  const emps = [...new Set(rows.map((r) => r.owner_id))].sort((a, b) => name(a).localeCompare(name(b), "vi"));
  const shown = rows.filter((a) => (!from || a.work_date >= from) && (!to || a.work_date <= to) && (emp === "all" || a.owner_id === emp) && (kind === "all" || a.kind === kind) && (ws === "all" || (ws === "recalled" ? a.recalled : !a.recalled && a.witness_status === ws)) && (rc === "all" || rc === "yes" === a.reconciled));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value), className: "sm:w-40", "aria-label": "Từ ngày" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value), className: "sm:w-40", "aria-label": "Đến ngày" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: emp, onValueChange: setEmp, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "sm:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi nhân viên" }),
          emps.map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: id, children: name(id) }, id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: setKind, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi nội dung" }),
          Object.keys(KIND_LABEL).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: KIND_LABEL[k] }, k))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ws, onValueChange: setWs, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi trạng thái làm chứng" }),
          Object.keys(WITNESS_LABEL).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: WITNESS_LABEL[k] }, k)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "recalled", children: "Đã thu hồi" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rc, onValueChange: setRc, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "sm:w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi trạng thái đối chiếu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "Chưa đối chiếu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Đã đối chiếu" })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6", children: "Đang tải…" }) : !shown.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-sm text-muted-foreground", children: "Không có giải trình phù hợp." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: shown.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(AttCard, { a, name, showOwner: true, onOpen }, a.id)) })
  ] });
}
function AttForm({ settings, edit, onClose, onDone }) {
  const { user } = useCurrentUser();
  const owner = edit?.owner_id || user?.id || "";
  const [f, setF] = reactExports.useState(() => edit ? { work_date: edit.work_date, kind: edit.kind, time_in: edit.time_in || "", time_out: edit.time_out || "", reason_id: edit.reason_id, detail: edit.detail || "", witness_id: edit.witness_id } : { work_date: todayVn(), kind: "in", time_in: "", time_out: "", reason_id: "", detail: "", witness_id: "" });
  const [busy, setBusy] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  const wq = useQuery({ queryKey: ["leave", "att-witnesses"], queryFn: listWitnesses });
  const witnesses = (wq.data || []).filter((w) => w.id !== owner);
  const reasons = attReasons(settings).filter((r) => r.active || r.id === edit?.reason_id);
  const invalid = validateAtt(f, owner);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const witnessReset = edit && edit.witness_status !== "pending" && (edit.work_date !== f.work_date || edit.kind !== f.kind || (edit.time_in || "") !== (f.kind === "out" ? "" : f.time_in) || (edit.time_out || "") !== (f.kind === "in" ? "" : f.time_out) || edit.witness_id !== f.witness_id);
  const submit = async () => {
    setBusy(true);
    setErr(null);
    const clean = { ...f, time_in: f.kind === "out" ? "" : f.time_in, time_out: f.kind === "in" ? "" : f.time_out };
    try {
      let id;
      if (edit) await updateAtt(edit.id, clean);
      else id = await submitAtt(clean);
      toast.success(edit ? "Đã lưu thay đổi" : "Đã gửi giải trình");
      onDone(id || edit?.id);
    } catch (e) {
      setErr(leaveErr(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: edit ? "Sửa giải trình chấm công" : ATT_TYPE_LABEL }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AttFields, { f, set, reasons, witnesses, wLoading: wq.isLoading }),
    witnessReset && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-warning/40 bg-warning/10 p-3 text-sm", children: "Bạn đang sửa ngày, giờ hoặc người làm chứng. Người làm chứng sẽ phải xác nhận lại." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground rounded-md bg-muted/50 p-3", children: ATT_NOTE }),
    err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive", children: err }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: !!invalid || busy, title: invalid || void 0, children: busy ? "Đang gửi…" : edit ? "Lưu thay đổi" : "GỬI GIẢI TRÌNH" })
    ] })
  ] }) });
}
function AttFields({ f, set, reasons, witnesses, wLoading }) {
  const { user } = useCurrentUser();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhân viên" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: user?.fullName || "", disabled: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày quên chấm công" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: todayVn(), value: f.work_date, onChange: (e) => set({ work_date: e.target.value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nội dung giải trình" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1.5", children: Object.keys(KIND_LABEL).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => set({ kind: k }), className: cn("rounded-md border px-2 py-2 text-sm", f.kind === k ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"), children: KIND_LABEL[k] }, k)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      f.kind !== "out" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Giờ vào" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: f.time_in, onChange: (e) => set({ time_in: e.target.value }) })
      ] }),
      f.kind !== "in" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Giờ ra" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: f.time_out, onChange: (e) => set({ time_out: e.target.value }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.reason_id, onValueChange: (v) => set({ reason_id: v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn lý do" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: reasons.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: r.name }, r.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
        "Chi tiết giải trình",
        f.reason_id === "other" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " *" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: f.detail, onChange: (e) => set({ detail: e.target.value }), placeholder: "Diễn giải ngắn gọn" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người làm chứng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: witnesses.some((w) => w.id === f.witness_id) ? f.witness_id : "", onValueChange: (v) => set({ witness_id: v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: wLoading ? "Đang tải…" : "Chọn người làm chứng" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: witnesses.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.full_name }, w.id)) })
      ] })
    ] })
  ] });
}
function AttDetail({ id, name, onClose, onChanged, onEdit }) {
  const { user, can } = useCurrentUser();
  const q = useQuery({ queryKey: ["leave", "att-one", id], queryFn: () => getAtt(id) });
  const ev = useQuery({ queryKey: ["leave", "att-ev", id], queryFn: () => getAttEvents(id), enabled: !!q.data });
  const [act, setAct] = reactExports.useState(null);
  const [note, setNote] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const a = q.data;
  const uid = user?.id;
  const isOwner = a?.owner_id === uid;
  const manage = can("att.manage");
  const acts = a && !a.recalled ? {
    witness: a.witness_id === uid && !isOwner && a.witness_status === "pending" && can("att.witness"),
    reconcile: !a.reconciled && (can("att.reconcile") || manage),
    note: a.reconciled && (can("att.reconcile") || manage),
    edit: isOwner && can("att.edit_own") && !a.reconciled || manage,
    recall: isOwner && can("att.edit_own") && !a.reconciled || manage
  } : null;
  const run = async () => {
    if (!a || !act) return;
    setBusy(true);
    try {
      if (act === "confirm") await witnessAtt(a.id, true, note);
      if (act === "unable") await witnessAtt(a.id, false, note);
      if (act === "reconcile") await reconcileAtt(a.id, note);
      if (act === "note") await noteAtt(a.id, note);
      if (act === "recall") await recallAtt(a.id);
      toast.success("Đã cập nhật giải trình");
      setAct(null);
      setNote("");
      q.refetch();
      ev.refetch();
      onChanged();
    } catch (e) {
      toast.error(leaveErr(e));
      q.refetch();
    } finally {
      setBusy(false);
    }
  };
  const title = { confirm: "Xác nhận làm chứng?", unable: "Không thể xác nhận — ghi chú (không bắt buộc)", reconcile: "Đánh dấu đã đối chiếu", note: "Cập nhật ghi chú đối chiếu", recall: "Thu hồi giải trình này?" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: true, onOpenChange: (o) => !o && onClose(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "w-full h-full max-w-none sm:max-w-xl overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: ATT_TYPE_LABEL }) }),
      q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-6", children: "Đang tải…" }) : !a ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Không thể mở giải trình" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Giải trình không tồn tại hoặc bạn không có quyền xem." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AttBadges, { a }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-[130px_1fr] gap-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Nhân viên" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: name(a.owner_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Ngày quên" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: fmtDate(a.work_date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Nội dung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: KIND_LABEL[a.kind] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Giờ tự khai báo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: declaredTime(a) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Lý do" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: a.reason_name }),
          a.detail && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Chi tiết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "whitespace-pre-line", children: a.detail })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Gửi lúc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: fmtVn(a.submitted_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Người làm chứng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
            name(a.witness_id),
            " · ",
            WITNESS_LABEL[a.witness_status],
            a.witness_at ? ` · ${fmtVn(a.witness_at)}` : ""
          ] }),
          a.witness_note && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Ghi chú làm chứng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "whitespace-pre-line", children: a.witness_note })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Đối chiếu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: a.reconciled ? `Đã đối chiếu · ${name(a.reconciled_by)} · ${fmtVn(a.reconciled_at)}` : "Chưa đối chiếu" }),
          a.reconcile_note && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Ghi chú đối chiếu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "whitespace-pre-line", children: a.reconcile_note })
          ] }),
          a.recalled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Thu hồi lúc" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: a.recalled_at ? fmtVn(a.recalled_at) : "—" })
          ] })
        ] }),
        acts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          acts.witness && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAct("confirm"), children: "XÁC NHẬN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct("unable"), children: "KHÔNG THỂ XÁC NHẬN" })
          ] }),
          acts.reconcile && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAct("reconcile"), children: "ĐÁNH DẤU ĐÃ ĐỐI CHIẾU" }),
          acts.note && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setNote(a.reconcile_note || "");
            setAct("note");
          }, children: "Sửa ghi chú đối chiếu" }),
          acts.edit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onEdit(a), children: "Sửa giải trình" }),
          acts.recall && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct("recall"), children: "Thu hồi" })
        ] }),
        isOwner && a.reconciled && !a.recalled && !manage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Giải trình đã được đối chiếu. Nếu cần điều chỉnh, vui lòng liên hệ người quản lý giải trình." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold mb-2", children: "Lịch sử" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-2 border-l pl-3", children: (ev.data || []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: ATT_ACTION_LABEL[e.action] || e.action }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              name(e.actor_id),
              " · ",
              fmtVn(e.created_at)
            ] }),
            e.action === "edit" && e.detail?.old && /* @__PURE__ */ jsxRuntimeExports.jsx(EditDiff, { d: e.detail, name }),
            e.action === "note" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-0.5", children: [
              "“",
              e.detail?.old || "—",
              "” → “",
              e.detail?.new || "—",
              "”"
            ] }),
            ["witness_unable", "witness_confirm", "reconcile"].includes(e.action) && e.detail?.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-0.5", children: [
              "Ghi chú: ",
              e.detail.note
            ] })
          ] }, e.id)) })
        ] })
      ] })
    ] }),
    act && a && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && setAct(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title[act] }) }),
      act !== "recall" && act !== "confirm" && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: note, onChange: (e) => setNote(e.target.value), placeholder: "Ghi chú (không bắt buộc)" }),
      act === "confirm" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Xác nhận làm chứng không đồng nghĩa với phê duyệt hay công nhận công." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAct(null), children: "Đóng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: run, disabled: busy, children: busy ? "Đang xử lý…" : "Xác nhận" })
      ] })
    ] }) })
  ] });
}
function EditDiff({ d, name }) {
  const F = [["work_date", "Ngày"], ["kind", "Nội dung"], ["time_in", "Giờ vào"], ["time_out", "Giờ ra"], ["reason_name", "Lý do"], ["detail", "Chi tiết"], ["witness_id", "Người làm chứng"]];
  const fmt = (k, v) => v == null || v === "" ? "—" : k === "work_date" ? fmtDate(v) : k === "kind" ? KIND_LABEL[v] : k === "witness_id" ? name(v) : String(v);
  const changed = F.filter(([k]) => JSON.stringify(d.old?.[k] ?? null) !== JSON.stringify(d.new?.[k] ?? null));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-0.5 space-y-0.5", children: [
    changed.map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      l,
      ": ",
      fmt(k, d.old?.[k]),
      " → ",
      fmt(k, d.new?.[k])
    ] }, k)),
    d.witness_reset && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-warning-foreground", children: "Yêu cầu người làm chứng xác nhận lại" })
  ] });
}
function useNames() {
  const users = useAuth((s) => s.users);
  return reactExports.useMemo(() => {
    const m = new Map(users.map((u) => [u.id, u.fullName || u.username]));
    return (id) => id ? m.get(id) || "—" : "—";
  }, [users]);
}
function AttendancePage() {
  const { user, can } = useCurrentUser();
  const qc = useQueryClient();
  const name = useNames();
  const settingsQ = useQuery({ queryKey: ["leave", "settings"], queryFn: getSettings });
  const attQ = useQuery({ queryKey: ["leave", "att-list"], queryFn: listAtt, enabled: !!user });
  const atts = attQ.data || [];
  const uid = user?.id;
  const canCreate = can("att.create");
  const showMine = can("att.view_own") || canCreate;
  const showManage = can("att.view_all") || can("att.reconcile") || can("att.manage");
  const showReport = can("att.report");
  const initial = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [attOpen, setAttOpen] = reactExports.useState(() => initial?.get("att") || null);
  const [attForm, setAttForm] = reactExports.useState(null);
  const setAttO = (id) => {
    setAttOpen(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("att", id);
    else u.searchParams.delete("att");
    window.history.replaceState(null, "", u.toString());
  };
  const myAtts = atts.filter((a) => a.owner_id === uid);
  const witnessTodo = atts.filter((a) => a.witness_id === uid && a.owner_id !== uid && !a.recalled && a.witness_status === "pending");
  const showWitness = can("att.witness") || witnessTodo.length > 0;
  const [tab, setTab] = reactExports.useState(() => initial?.get("tab") || (showMine ? "mine" : showWitness ? "witness" : showManage ? "manage" : "report"));
  const [settingsOpen, setSettingsOpen] = reactExports.useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["leave"] });
  const settings = settingsQ.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: "Giải trình chấm công",
        description: "Giải trình quên chấm công — gửi, làm chứng và đối chiếu.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          can("att.settings") && /* @__PURE__ */ jsxRuntimeExports.jsx(FunctionSettingsButton, { onClick: () => setSettingsOpen(true) }),
          canCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAttForm({}), disabled: !settings, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Tạo giải trình"
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        showMine && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "mine", children: "Giải trình của tôi" }),
        showWitness && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "witness", children: [
          "Chờ tôi duyệt",
          witnessTodo.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5", children: witnessTodo.length })
        ] }),
        showManage && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "manage", children: "Quản lý giải trình" }),
        showReport && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "report", children: "Báo cáo" })
      ] }),
      showMine && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "mine", className: "mt-4", children: attQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6", children: "Đang tải…" }) : !myAtts.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-sm text-muted-foreground", children: "Bạn chưa có giải trình nào." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: myAtts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(AttCard, { a, name, showOwner: false, onOpen: setAttO }, a.id)) }) }),
      showWitness && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "witness", className: "mt-4", children: attQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6", children: "Đang tải…" }) : !witnessTodo.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-sm text-muted-foreground", children: "Không có giải trình nào chờ bạn xác nhận làm chứng." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: witnessTodo.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(AttCard, { a, name, showOwner: true, onOpen: setAttO }, a.id)) }) }),
      showManage && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "manage", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AttManage, { rows: atts, loading: attQ.isLoading, name, onOpen: setAttO }) }),
      showReport && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "report", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveReport, { rows: [], atts, name, onOpenAtt: setAttO, mode: "att" }) })
    ] }),
    attOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(AttDetail, { id: attOpen, name, onClose: () => setAttO(null), onChanged: refresh, onEdit: (a) => setAttForm({ edit: a }) }),
    attForm && settings && /* @__PURE__ */ jsxRuntimeExports.jsx(AttForm, { settings, edit: attForm.edit, onClose: () => setAttForm(null), onDone: (id) => {
      setAttForm(null);
      refresh();
      if (id) setAttO(id);
    } }),
    settingsOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FunctionSettingsDialog,
      {
        open: true,
        title: "Cài đặt — Giải trình chấm công",
        categories: ATT_PERM_CATEGORIES,
        personal: ATT_PERSONAL_PERMS,
        rules: /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveSettings, { mode: "att" }),
        onClose: () => setSettingsOpen(false)
      }
    )
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["att.create", "att.view_own", "att.witness", "att.view_all", "att.reconcile", "att.report", "att.manage"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(AttendancePage, {}) });
export {
  SplitComponent as component
};
