import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as Card, O as CardHeader, Q as CardTitle, o as CardContent, I as Input, T as Switch, L as Label, B as Button, F as useAuth, U as getUserPermissions, c as createSsrRpc, z as zaloDispatch, n as pushDispatch } from "./router-CkmTURa-.mjs";
import { D as DOW_LABEL, a as fmtDate } from "./calc-BK6sHnP3.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { G as GROUP_EVENT_LABEL } from "./zaloGroupMessage-kyI4Tfnt.mjs";
import { a6 as Plus, ap as Trash2, j as ArrowUp, k as ArrowDown, ad as Send, aC as RefreshCw } from "../_libs/lucide-react.mjs";
import { o as objectType, b as booleanType, s as stringType } from "../_libs/zod.mjs";
const leaveGroupStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("7bd2ca0bbbf3348b612b6a32411fc4d40279e35506a40761f88f1eb0e4682bfe"));
const leaveGroupListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("290871761ddd013f2f7d9d8aa23a14427c54aece80c97845d581691122aac8b4"));
const leaveGroupSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType(),
  onNew: booleanType(),
  onReassign: booleanType(),
  onApproved: booleanType(),
  onRejected: booleanType()
}).parse(d)).handler(createSsrRpc("1b506d2c3f2bbc9564de17807445bce0f0371dc2d15afdfae05b2ee1d5ec5139"));
const leaveGroupSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("64e901a69723b9f9a7efa79f583a839ca9957e3f553efe224bfcf2d6fdf1b544"));
const leaveGroupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("93b3160c4359f888826ceb0911776aab491868237c51062421d151d27e93d57b"));
const leaveGroupRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b98faef28b729ce34b107ebdd970e19fc39a05a86fbd8c90c1ef7220b065b7e7"));
const leaveGroupDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("79d07fba37371d06860825b6bcb8207c70dc6da6855dc7595d08badc5840e441"));
const LEAVE_READ_TIMEOUT_MS = 12e3;
class LeaveTimeoutError extends Error {
  code = "LEAVE_TIMEOUT";
  constructor() {
    super("Máy chủ phản hồi quá lâu. Vui lòng thử lại.");
  }
}
class LeaveReadError extends Error {
  constructor(operation, durationMs, error, status) {
    const e = error;
    super(e?.message || "Không tải được dữ liệu.");
    this.operation = operation;
    this.durationMs = durationMs;
    this.code = e?.code;
    this.status = status;
  }
  operation;
  durationMs;
  code;
  status;
}
async function readLeave(operation, run, outer) {
  const started = Date.now();
  try {
    const result = await withDeadline(run, outer);
    if (result.error) throw new LeaveReadError(operation, Date.now() - started, result.error, result.status);
    return result.data;
  } catch (error) {
    if (error instanceof LeaveReadError || error?.name === "AbortError") throw error;
    throw new LeaveReadError(operation, Date.now() - started, error);
  }
}
async function withDeadline(run, outer, ms = LEAVE_READ_TIMEOUT_MS) {
  const ctl = new AbortController();
  let timedOut = false;
  let rejectAbort;
  const aborted = new Promise((_, reject) => {
    rejectAbort = reject;
  });
  const onAbort = () => {
    ctl.abort();
    rejectAbort?.(new DOMException("Request cancelled", "AbortError"));
  };
  if (outer?.aborted) throw new DOMException("Request cancelled", "AbortError");
  outer?.addEventListener("abort", onAbort, { once: true });
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      ctl.abort();
      reject(new LeaveTimeoutError());
    }, ms);
  });
  try {
    return await Promise.race([Promise.resolve(run(ctl.signal)), deadline, aborted]);
  } catch (e) {
    if (timedOut) throw new LeaveTimeoutError();
    throw e;
  } finally {
    clearTimeout(timer);
    outer?.removeEventListener("abort", onAbort);
  }
}
function retryLeaveRead(failures, error) {
  if (failures >= 2) return false;
  const e = error;
  if (error?.name === "AbortError" || e?.code === "42501" || e?.code === "PGRST301" || e?.status === 401 || e?.status === 403) return false;
  if (e?.code === "LEAVE_TIMEOUT") return false;
  return e?.code === "57014" || /timeout|timed out|fetch|network/i.test(e?.message ?? "") || (e?.status ?? 0) >= 500;
}
const leaveRetryDelay = (attempt) => Math.min(1e3 * 2 ** attempt, 4e3);
function leaveReadMessage(error) {
  const e = error;
  const message = e?.status === 401 || e?.code === "PGRST301" ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại." : e?.code === "42501" || e?.status === 403 ? "Máy chủ từ chối quyền xem dữ liệu này. Vui lòng liên hệ Admin." : e?.code === "LEAVE_TIMEOUT" || e?.code === "57014" ? "Máy chủ phản hồi quá lâu. Vui lòng thử lại." : e?.message || "Không tải được dữ liệu.";
  return error instanceof LeaveReadError ? `${message} (${error.operation} · ${error.status ? `HTTP ${error.status} · ` : ""}${error.code ?? "NETWORK"} · ${(error.durationMs / 1e3).toFixed(1)} giây)` : message;
}
const LEAVE_LIST_LIMIT = 1e3;
function leaveListScope(tab, permissions) {
  if (tab === "mine" && permissions.mine) return "mine";
  if (tab === "approve" && permissions.approve) return "approve";
  if (tab === "manage" && permissions.manage || tab === "report" && permissions.report) return "manage";
  return null;
}
function leaveListKey(uid, scope) {
  return ["leave", "list", uid, scope];
}
function leaveActorQuery(key, uid) {
  return !!uid && key[0] === "leave" && key[2] === uid;
}
function filterLeaveList(query, scope, uid) {
  if (!uid) throw new Error("Cần đăng nhập để tải đơn.");
  if (scope === "mine") return query.eq("owner_id", uid);
  if (scope === "approve") return query.eq("approver_id", uid);
  if (scope === "manage") return query;
  throw new Error("Phạm vi tải đơn không hợp lệ.");
}
const db = supabase;
const leaveErr = (e) => e?.message || "Có lỗi xảy ra";
const STATUS_LABEL = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  recalled: "Đã thu hồi",
  cancelled: "Đã hủy"
};
const ACTION_LABEL = {
  submit: "Gửi đơn",
  edit: "Sửa nội dung",
  resubmit: "Sửa và gửi lại",
  approve: "Phê duyệt",
  reject: "Từ chối",
  recall: "Thu hồi",
  cancel_request: "Yêu cầu hủy",
  cancel_approve: "Chấp thuận hủy",
  cancel_reject: "Từ chối yêu cầu hủy",
  reassign: "Chuyển người duyệt",
  exception: "Xử lý ngoại lệ"
};
async function rpc(fn, args) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw error;
  if (WRITE_RPC.has(fn)) {
    zaloDispatch().catch(() => {
    });
    pushDispatch().catch(() => {
    });
    leaveGroupDispatch().catch(() => {
    });
  }
  return data;
}
const WRITE_RPC = /* @__PURE__ */ new Set(["leave_submit", "leave_resubmit", "leave_decide", "leave_cancel_request", "leave_cancel_decide", "leave_reassign", "leave_exception_cancel"]);
async function getSettings(opts) {
  return readLeave("Cài đặt", (signal) => db.rpc("leave_settings_get").abortSignal(signal), opts?.signal);
}
const saveSettings = (data) => rpc("leave_settings_save", { _data: data });
const reasonUsage = (id) => rpc("leave_reason_usage", { _id: id });
async function listApprovers(opts) {
  return readLeave("Người duyệt", (signal) => db.rpc("leave_approvers").abortSignal(signal), opts?.signal);
}
async function listRequests(opts) {
  if (!opts.uid) throw new Error("Cần đăng nhập để tải đơn.");
  const data = await readLeave("Danh sách đơn", (signal) => filterLeaveList(db.from("leave_requests").select("*"), opts.scope, opts.uid).order("created_at", { ascending: false }).limit(LEAVE_LIST_LIMIT).abortSignal(signal), opts.signal);
  return data || [];
}
async function getRequest(id, opts) {
  return readLeave("Chi tiết đơn", (signal) => db.from("leave_requests").select("*").eq("id", id).maybeSingle().abortSignal(signal), opts?.signal);
}
async function getHistory(id, opts) {
  const [subs, events] = await Promise.all([
    readLeave("Phiên bản đơn", (signal) => db.from("leave_request_submissions").select("*").eq("request_id", id).order("no").abortSignal(signal), opts?.signal),
    readLeave("Lịch sử đơn", (signal) => db.from("leave_request_events").select("*").eq("request_id", id).order("created_at").abortSignal(signal), opts?.signal)
  ]);
  return { subs: subs || [], events: events || [] };
}
const submitRequest = (f) => rpc("leave_submit", {
  _owner: f.owner || null,
  _type: f.type,
  _payload: f.payload,
  _reason_id: f.reasonId,
  _detail: f.detail,
  _approver: f.approver,
  _exception: f.exception || null
});
const updateRequest = (id, f) => rpc("leave_update", { _id: id, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver, _exception: f.exception || null });
const resubmitRequest = (id, f) => rpc("leave_resubmit", { _id: id, _payload: f.payload, _reason_id: f.reasonId, _detail: f.detail, _approver: f.approver, _exception: f.exception || null });
const decide = (id, approve, note) => rpc("leave_decide", { _id: id, _approve: approve, _note: note });
const recall = (id) => rpc("leave_recall", { _id: id });
const cancelRequest = (id, reason) => rpc("leave_cancel_request", { _id: id, _reason: reason });
const cancelDecide = (id, approve, note) => rpc("leave_cancel_decide", { _id: id, _approve: approve, _note: note });
const reassign = (id, approver, note) => rpc("leave_reassign", { _id: id, _approver: approver, _note: note });
const exceptionCancel = (id, reason) => rpc("leave_exception_cancel", { _id: id, _reason: reason });
const fmtTime = (iso) => iso ? new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hourCycle: "h23", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "—";
const STATUS = {
  sent: { label: "Thành công", cls: "text-emerald-600" },
  sending: { label: "Đang gửi", cls: "text-amber-600" },
  pending: { label: "Chờ gửi", cls: "text-amber-600" },
  failed: { label: "Thất bại", cls: "text-destructive" },
  unknown: { label: "Chưa rõ đã gửi — kiểm tra nhóm", cls: "text-destructive" },
  skipped: { label: "Bỏ qua", cls: "text-muted-foreground" }
};
function LeaveZaloGroup() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["leave", "zalo-group"], queryFn: () => leaveGroupStatus() });
  const hist = useQuery({ queryKey: ["leave", "zalo-group-history"], queryFn: () => leaveGroupHistory() });
  const [s, setS] = reactExports.useState(null);
  const [groups, setGroups] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (q.data) setS({ groupId: q.data.groupId, groupName: q.data.groupName, enabled: q.data.enabled, onNew: q.data.onNew, onReassign: q.data.onReassign, onApproved: q.data.onApproved, onRejected: q.data.onRejected });
  }, [q.data]);
  const loadGroups = async () => {
    setBusy(true);
    try {
      const r = await leaveGroupListGroups();
      if (!r.ok) {
        setGroups([]);
        toast.error(r.message || "Không lấy được danh sách nhóm — nhập mã nhóm thủ công.");
      } else setGroups(r.groups);
    } finally {
      setBusy(false);
    }
  };
  if (q.isLoading || !s) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông báo Zalo nhóm Nhân sự" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" }) })
  ] });
  if (q.isError) return null;
  const save = async () => {
    setBusy(true);
    try {
      const r = await leaveGroupSave({ data: { ...s } });
      if (!r.ok) return toast.error(r.message);
      toast.success(r.message);
      qc.invalidateQueries({ queryKey: ["leave", "zalo-group"] });
    } finally {
      setBusy(false);
    }
  };
  const test = async () => {
    setBusy(true);
    try {
      const r = await leaveGroupSendTest();
      r.ok ? toast.success(r.message) : toast.error(r.message);
    } finally {
      setBusy(false);
    }
  };
  const retry = async (id) => {
    const event = hist.data?.events?.find((e) => e.id === id);
    if (event?.status === "unknown" && !window.confirm("Zalo có thể đã nhận tin này. Hãy kiểm tra nhóm trước khi gửi lại để tránh trùng. Bạn chắc chắn muốn gửi lại?")) return;
    const r = await leaveGroupRetry({ data: { id } });
    r.ok ? toast.success(r.message) : toast.error(r.message);
    qc.invalidateQueries({ queryKey: ["leave", "zalo-group-history"] });
    qc.invalidateQueries({ queryKey: ["leave", "zalo-group"] });
  };
  const d = q.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông báo Zalo nhóm Nhân sự" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Kết nối Zalo OA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: d.oaConnected ? "text-emerald-600" : "text-destructive", children: d.oaConnected ? `Đang kết nối: ${d.oaName ?? "OA"}` : "OA chưa kết nối hoặc đã mất kết nối — kiểm tra tại Cài đặt → Thông báo Zalo." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Dùng chung kết nối Zalo OA hiện có của Base; không cần kết nối lại." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nhóm nhận thông báo (Zalo GMF)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          groups === null ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: loadGroups, disabled: busy || !d.oaConnected, children: "Tải danh sách nhóm" }) : groups.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: s.groupId || void 0, onValueChange: (v) => setS({ ...s, groupId: v, groupName: groups.find((g) => g.id === v)?.name ?? "" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn nhóm Zalo" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.id, children: g.name }, g.id)) })
          ] }) : null,
          groups !== null && !groups.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-64", placeholder: "Nhập mã nhóm (Group ID)", value: s.groupId, onChange: (e) => setS({ ...s, groupId: e.target.value.trim(), groupName: s.groupName }) })
        ] }),
        s.groupId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Nhóm đang chọn: ",
          s.groupName || s.groupId
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Nhóm này độc lập với nhóm Tiền Về — thay đổi ở đây không ảnh hưởng module khác." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sự kiện gửi thông báo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.onNew, onCheckedChange: (v) => setS({ ...s, onNew: v }) }),
            "Đơn mới gửi"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.onReassign, onCheckedChange: (v) => setS({ ...s, onReassign: v }) }),
            "Chuyển người duyệt"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.onApproved, onCheckedChange: (v) => setS({ ...s, onApproved: v }) }),
            "Đơn được duyệt"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.onRejected, onCheckedChange: (v) => setS({ ...s, onRejected: v }) }),
            "Đơn bị từ chối"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.enabled, onCheckedChange: (v) => setS({ ...s, enabled: v }) }),
          "Bật thông báo nhóm Nhân sự"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: test, disabled: busy || !s.groupId || !d.oaConnected, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-1" }),
          "Gửi thử"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: save, disabled: busy, children: busy ? "Đang lưu…" : "Lưu cài đặt" })
      ] }),
      d.failed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive", children: [
        "Có ",
        d.failed,
        " thông báo lỗi/chưa rõ — xem lịch sử bên dưới để gửi lại."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lịch sử gửi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Tải lại", onClick: () => qc.invalidateQueries({ queryKey: ["leave", "zalo-group-history"] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border divide-y max-h-72 overflow-auto", children: [
          (hist.data?.events ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 text-xs space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: fmtTime(e.created_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: e.summary || `Đơn ${String(e.request_id).slice(0, 8)}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: GROUP_EVENT_LABEL[e.event] ?? e.event }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: STATUS[e.status]?.cls ?? "", children: STATUS[e.status]?.label ?? e.status }),
              (e.status === "failed" || e.status === "unknown") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "h-6 px-2 text-xs", onClick: () => retry(e.id), children: "Gửi lại" })
            ] }),
            e.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: e.error })
          ] }, e.id)),
          !hist.data?.events?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-3 py-4 text-xs text-muted-foreground", children: "Chưa có thông báo nào được gửi." })
        ] })
      ] })
    ] })
  ] });
}
const norm = (v) => v.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
function LeaveSettings({ mode = "all" } = {}) {
  const showLeave = mode !== "att";
  const showAtt = mode !== "leave";
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["leave", "settings"], queryFn: getSettings });
  const [s, setS] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [newReason, setNewReason] = reactExports.useState("");
  const [hol, setHol] = reactExports.useState({ date: "", name: "" });
  reactExports.useEffect(() => {
    if (q.data) setS(structuredClone(q.data));
  }, [q.data]);
  if (!s) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" });
  const save = async (next = s) => {
    setBusy(true);
    try {
      await saveSettings(next);
      toast.success("Đã lưu cài đặt đơn từ");
      qc.invalidateQueries({ queryKey: ["leave"] });
    } catch (e) {
      toast.error(leaveErr(e));
    } finally {
      setBusy(false);
    }
  };
  const up = (f) => setS((prev) => {
    const n = structuredClone(prev);
    f(n);
    return n;
  });
  const addReason = () => {
    const n = newReason.trim();
    if (!n) return;
    if (s.reasons.some((r) => norm(r.name) === norm(n))) return toast.error("Tên lý do đã tồn tại.");
    up((x) => {
      x.reasons.push({ id: "r" + Date.now().toString(36), name: n, active: true });
    });
    setNewReason("");
  };
  const renameReason = (i, name) => up((x) => {
    x.reasons[i].name = name;
  });
  const move = (i, d) => up((x) => {
    const j = i + d;
    if (j < 0 || j >= x.reasons.length) return;
    [x.reasons[i], x.reasons[j]] = [x.reasons[j], x.reasons[i]];
  });
  const removeReason = async (i) => {
    const r = s.reasons[i];
    if (r.id === "other") return toast.error('"Lý do khác" là lý do hệ thống, chỉ có thể đổi tên.');
    try {
      const n = await reasonUsage(r.id);
      if (n > 0) return toast.error(`"${r.name}" đã được dùng trong ${n} đơn — chỉ có thể Ngừng sử dụng.`);
    } catch (e) {
      return toast.error("Không kiểm tra được dữ liệu đã dùng: " + leaveErr(e));
    }
    if (!confirm(`Xóa lý do "${r.name}"?`)) return;
    up((x) => {
      x.reasons.splice(i, 1);
    });
  };
  const dupName = /* @__PURE__ */ new Set();
  let hasDup = false;
  s.reasons.forEach((r) => {
    const k = norm(r.name);
    if (!k || dupName.has(k)) hasDup = true;
    dupName.add(k);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    showLeave && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Lịch làm việc" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: ["am", "pm"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm", children: [
            "Buổi ",
            h === "am" ? "sáng" : "chiều"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: s.sessions[h].start || "", onChange: (e) => up((x) => {
              x.sessions[h].start = e.target.value || null;
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "–" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: s.sessions[h].end || "", onChange: (e) => up((x) => {
              x.sessions[h].end = e.target.value || null;
            }) })
          ] })
        ] }, h)) }),
        (!s.sessions.am.start || !s.sessions.am.end || !s.sessions.pm.start || !s.sessions.pm.end) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Chưa cấu hình đủ giờ làm việc — nhân viên chưa thể gửi đơn cho buổi chưa có giờ." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border divide-y", children: [1, 2, 3, 4, 5, 6, 7].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-24", children: DOW_LABEL[d] }),
          ["am", "pm"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!s.schedule[String(d)]?.[h], onCheckedChange: (v) => up((x) => {
              x.schedule[String(d)] = { ...x.schedule[String(d)] || { am: false, pm: false }, [h]: v };
            }) }),
            h === "am" ? "Sáng" : "Chiều"
          ] }, h))
        ] }, d)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mỗi buổi tương đương" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "0.1", className: "w-24", value: s.session_value, onChange: (e) => up((x) => {
            x.session_value = Number(e.target.value);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ngày" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày nghỉ lễ / nghỉ riêng của công ty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-44", value: hol.date, onChange: (e) => setHol({ ...hol, date: e.target.value }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tên ngày nghỉ", className: "w-56", value: hol.name, onChange: (e) => setHol({ ...hol, name: e.target.value }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: !hol.date, onClick: () => {
              if (s.holidays.some((x) => x.date === hol.date)) return toast.error("Ngày này đã có.");
              up((x) => {
                x.holidays.push({ ...hol });
                x.holidays.sort((a, b) => a.date.localeCompare(b.date));
              });
              setHol({ date: "", name: "" });
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
              "Thêm"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
            s.holidays.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs", children: [
              fmtDate(h.date),
              h.name ? ` — ${h.name}` : "",
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => up((x) => {
                x.holidays.splice(i, 1);
              }), "aria-label": "Xóa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
            ] }, h.date)),
            !s.holidays.length && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Chưa có ngày nghỉ riêng." })
          ] })
        ] })
      ] })
    ] }),
    showLeave && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông báo" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 sm:grid-cols-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!s.notify?.zalo, onChange: (e) => up((x) => {
            x.notify = { ...x.notify ?? {}, zalo: e.target.checked };
          }) }),
          "Gửi tin Zalo cho đơn từ (người duyệt và người đứng tên)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { label: "Nhắc người duyệt khi đơn chờ quá (giờ)", v: s.notify?.remind_hours ?? 4, on: (n) => up((x) => {
          x.notify = { ...x.notify ?? {}, remind_hours: Math.max(1, n) };
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sm:col-span-2 text-xs text-muted-foreground", children: 'Thông báo trong Base luôn bật. Nhắc duyệt gửi tối đa 1 lần/ngày, trong giờ 08:00–18:00; đơn sắp tới giờ bắt đầu (còn ≤ 2 giờ) được nhắc sớm. Cần bật "Gửi tự động" và đã lưu cài đặt nhắc trong Thông báo Zalo.' })
      ] })
    ] }),
    showLeave && /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveZaloGroup, {}),
    showLeave && /* @__PURE__ */ jsxRuntimeExports.jsx(CcCard, { s, up }),
    showAtt && /* @__PURE__ */ jsxRuntimeExports.jsx(AttNotifyCard, { s, up }),
    showLeave && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Quy định thời hạn" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 sm:grid-cols-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { label: "Nghỉ phép: gửi trước giờ bắt đầu nghỉ (giờ)", v: s.deadlines.leave_hours, on: (n) => up((x) => {
          x.deadlines.leave_hours = n;
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { label: "Đi muộn: gửi trước giờ bắt đầu ca (phút)", v: s.deadlines.late_minutes, on: (n) => up((x) => {
          x.deadlines.late_minutes = n;
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { label: "Về sớm: gửi trước giờ dự kiến ra về (phút)", v: s.deadlines.early_minutes, on: (n) => up((x) => {
          x.deadlines.early_minutes = n;
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { label: "Thu hồi nghỉ phép: trước giờ bắt đầu nghỉ (phút)", v: s.recall_minutes.leave, on: (n) => up((x) => {
          x.recall_minutes.leave = n;
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { label: "Thu hồi đi muộn: trước giờ bắt đầu ca (phút)", v: s.recall_minutes.late, on: (n) => up((x) => {
          x.recall_minutes.late = n;
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Num, { label: "Thu hồi về sớm: trước giờ dự kiến ra về (phút)", v: s.recall_minutes.early, on: (n) => up((x) => {
          x.recall_minutes.early = n;
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sm:col-span-3 text-xs text-muted-foreground", children: "Thay đổi chỉ áp dụng cho đơn gửi sau này; đơn đã gửi giữ quy định tại thời điểm gửi." })
      ] })
    ] }),
    showLeave && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Danh mục lý do" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        s.reasons.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.name, onChange: (e) => renameReason(i, e.target.value), className: r.active ? "" : "line-through text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => move(i, -1), "aria-label": "Lên", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => move(i, 1), "aria-label": "Xuống", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "w-28 shrink-0", onClick: () => up((x) => {
            x.reasons[i].active = !x.reasons[i].active;
          }), children: r.active ? "Ngừng dùng" : "Kích hoạt lại" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeReason(i), "aria-label": "Xóa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, r.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Thêm lý do mới", value: newReason, onChange: (e) => setNewReason(e.target.value), onKeyDown: (e) => e.key === "Enter" && addReason() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: addReason, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Thêm"
          ] })
        ] }),
        hasDup && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Có lý do trống hoặc trùng tên." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 sticky bottom-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => q.data && setS(structuredClone(q.data)), children: "Hoàn tác" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save(), disabled: busy || hasDup, children: busy ? "Đang lưu…" : "Lưu cài đặt" })
    ] })
  ] });
}
function Num({ label, v, on }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: v, onChange: (e) => on(Math.max(0, Number(e.target.value) || 0)) })
  ] });
}
function CcCard({ s, up }) {
  const users = useAuth((a) => a.users);
  const roles = useAuth((a) => a.roles);
  const cc = s.notify?.cc ?? {};
  const set = (patch) => up((x) => {
    x.notify = { ...x.notify ?? {}, cc: { ...x.notify?.cc ?? {}, ...patch } };
  });
  const toggle = (key, id) => {
    const cur = cc[key] ?? [];
    set({ [key]: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  };
  const active = users.filter((u) => u.status === "Đang hoạt động");
  const rec = /* @__PURE__ */ new Map();
  active.forEach((u) => {
    if (u.roleId && cc.role_ids?.includes(u.roleId) || cc.user_ids?.includes(u.id)) rec.set(u.id, u);
  });
  const missing = [...rec.values()].filter((u) => !getUserPermissions(u, roles).has("leave.view_all"));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông báo sau khi phê duyệt" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!cc.enabled, onCheckedChange: (v) => set({ enabled: v }) }),
        "Bật thông báo CC"
      ] }),
      cc.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!cc.on_approve, onChange: (e) => set({ on_approve: e.target.checked }) }),
            "Đơn được phê duyệt"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!cc.on_cancel, onChange: (e) => set({ on_cancel: e.target.checked }) }),
            "Đơn đã duyệt được chấp thuận hủy"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Theo vai trò (người đang hoạt động tại thời điểm gửi)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-56 overflow-auto rounded-md border p-2 space-y-1", children: roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!cc.role_ids?.includes(r.id), onChange: () => toggle("role_ids", r.id) }),
              r.name
            ] }, r.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Theo cá nhân" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-56 overflow-auto rounded-md border p-2 space-y-1", children: active.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!cc.user_ids?.includes(u.id), onChange: () => toggle("user_ids", u.id) }),
              u.fullName || u.username
            ] }, u.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Hiện có ",
          rec.size,
          " người nhận (đã bỏ trùng). Chủ đơn và người vừa duyệt không nhận CC. Chỉ áp dụng cho đơn duyệt/hủy từ nay, không gửi bù đơn cũ. Zalo gửi kèm nếu đã bật Zalo đơn từ và người nhận đã liên kết."
        ] }),
        missing.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive", children: [
          missing.length,
          ' người nhận chưa có quyền "Xem toàn bộ" đơn từ nên sẽ không mở được chi tiết đơn: ',
          missing.map((u) => u.fullName || u.username).join(", "),
          ". Nhận thông báo không tự cấp quyền xem."
        ] })
      ] })
    ] })
  ] });
}
function AttNotifyCard({ s, up }) {
  const users = useAuth((a) => a.users);
  const roles = useAuth((a) => a.roles);
  const cfg = s.attendance?.notify ?? {};
  const set = (patch) => up((x) => {
    x.attendance = { ...x.attendance ?? {}, notify: { ...x.attendance?.notify ?? {}, ...patch } };
  });
  const toggle = (key, id) => {
    const cur = cfg[key] ?? [];
    set({ [key]: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  };
  const active = users.filter((u) => u.status === "Đang hoạt động");
  const rec = /* @__PURE__ */ new Map();
  active.forEach((u) => {
    if (u.roleId && cfg.role_ids?.includes(u.roleId) || cfg.user_ids?.includes(u.id)) rec.set(u.id, u);
  });
  const missing = [...rec.values()].filter((u) => {
    const p = getUserPermissions(u, roles);
    return !["att.view_all", "att.reconcile", "att.manage"].some((k) => p.has(k));
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Người nhận giải trình chấm công" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!cfg.enabled, onCheckedChange: (v) => set({ enabled: v }) }),
        "Bật thông báo giải trình chấm công"
      ] }),
      cfg.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Theo vai trò (người đang hoạt động tại thời điểm gửi)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-56 overflow-auto rounded-md border p-2 space-y-1", children: roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!cfg.role_ids?.includes(r.id), onChange: () => toggle("role_ids", r.id) }),
              r.name
            ] }, r.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Theo cá nhân" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-56 overflow-auto rounded-md border p-2 space-y-1", children: active.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!cfg.user_ids?.includes(u.id), onChange: () => toggle("user_ids", u.id) }),
              u.fullName || u.username
            ] }, u.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Hiện có ",
          rec.size,
          " người nhận (đã bỏ trùng). Người nhận được báo khi có giải trình mới và khi nhân viên sửa ngày/giờ. Thông báo trong Base luôn được tạo; Zalo gửi kèm nếu đã bật Zalo đơn từ và người nhận đã liên kết. Không gửi bù giải trình cũ."
        ] }),
        missing.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive", children: [
          missing.length,
          " người nhận chưa có quyền xem giải trình (Xem toàn bộ / Đối chiếu / Quản lý giải trình) nên sẽ không mở được chi tiết: ",
          missing.map((u) => u.fullName || u.username).join(", "),
          "."
        ] })
      ] })
    ] })
  ] });
}
export {
  ACTION_LABEL as A,
  LeaveSettings as L,
  STATUS_LABEL as S,
  leaveReadMessage as a,
  leaveRetryDelay as b,
  listRequests as c,
  leaveListKey as d,
  leaveListScope as e,
  getRequest as f,
  getSettings as g,
  getHistory as h,
  listApprovers as i,
  leaveActorQuery as j,
  decide as k,
  leaveErr as l,
  recall as m,
  cancelRequest as n,
  cancelDecide as o,
  reassign as p,
  exceptionCancel as q,
  retryLeaveRead as r,
  submitRequest as s,
  resubmitRequest as t,
  updateRequest as u,
  withDeadline as w
};
