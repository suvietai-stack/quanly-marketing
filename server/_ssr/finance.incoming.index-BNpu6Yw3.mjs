import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c1 as Route$h, u as useCurrentUser, F as useAuth, P as PageHeader, B as Button, I as Input, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, T as Switch, L as Label, a as useServerFn } from "./router-CkmTURa-.mjs";
import { c as confirmationFilter, s as searchAmount, a as safeQ, v as vnStart, b as vnEndExcl, r as remindersQuery, M as ManualEntry, d as vnd, T as TX_STATUS, e as receiver, f as TX_VARIANT, g as fmtTime, R as RemindButton, h as autoCount, i as gmfStatus, j as gmfListGroups, k as gmfSave, l as gmfSendTest, m as gmfRetry } from "./ManualEntry-D51XSuMW.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { f as fmtWait, D as DEFAULT_REMINDER } from "./reminder-p6KbmApG.mjs";
import { R as RolePermissionMatrix, d as FIN_PERM_CATEGORIES } from "./FunctionSettings-CX6UiV0J.mjs";
import { A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, f as AlertDialogCancel } from "./alert-dialog-CW0Q8d6x.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import "../_libs/seroval.mjs";
import { a6 as Plus, aj as Settings2, aC as RefreshCw, f as Search, X, ap as Trash2, af as Download } from "../_libs/lucide-react.mjs";
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
import "./textarea-BGZgnbbj.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
const DAYS = [[1, "T2"], [2, "T3"], [3, "T4"], [4, "T5"], [5, "T6"], [6, "T7"], [0, "CN"]];
const reminderConfigQuery = {
  queryKey: ["fin_reminder_config"],
  queryFn: async () => {
    const { data } = await supabase.from("fin_reminder_config").select("enabled, interval_min, start_hour, end_hour, workdays, max_auto").eq("id", 1).maybeSingle();
    return data ?? DEFAULT_REMINDER;
  }
};
function ReminderSettings({ groupName }) {
  const qc = useQueryClient();
  const { data } = useQuery(reminderConfigQuery);
  const [f, setF] = reactExports.useState(DEFAULT_REMINDER);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (data) setF(data);
  }, [data]);
  const num = (k) => (e) => setF({ ...f, [k]: Number(e.target.value) });
  const err = f.interval_min < 5 || f.interval_min > 240 ? "Chu kỳ từ 5 đến 240 phút" : f.start_hour < 0 || f.end_hour > 24 || f.end_hour <= f.start_hour ? "Giờ kết thúc phải sau giờ bắt đầu" : f.max_auto < 1 || f.max_auto > 10 ? "Số lần nhắc từ 1 đến 10" : !f.workdays.length ? "Chọn ít nhất một ngày" : "";
  const save = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("fin_reminder_config_save", { _enabled: f.enabled, _interval: f.interval_min, _start: f.start_hour, _end: f.end_hour, _days: f.workdays, _max: f.max_auto });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Đã lưu cài đặt nhắc nhở");
    qc.invalidateQueries({ queryKey: ["fin_reminder_config"] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t pt-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Nhắc nhở xác nhận" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.enabled, onCheckedChange: (v) => setF({ ...f, enabled: v }) }),
      "Tự động nhắc khoản chưa xác nhận vào nhóm",
      groupName ? ` “${groupName}”` : " Tiền Về"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chu kỳ (phút)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 5, max: 240, value: f.interval_min, onChange: num("interval_min") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Từ giờ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 23, value: f.start_hour, onChange: num("start_hour") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đến giờ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 24, value: f.end_hour, onChange: num("end_hour") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tối đa (lần)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 10, value: f.max_auto, onChange: num("max_auto") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: DAYS.map(([d, l]) => {
      const on = f.workdays.includes(d);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setF({ ...f, workdays: on ? f.workdays.filter((x) => x !== d) : [...f.workdays, d] }),
          className: `h-9 min-w-11 px-3 rounded-full border text-sm ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`,
          children: l
        },
        d
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Giờ Việt Nam. Chỉ tính thời gian làm việc; thông báo gốc không tính là lượt nhắc. Nhắc thủ công không giới hạn khung giờ và không tính vào số lần tự động." }),
    err && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: err }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy || !!err, onClick: save, children: "Lưu nhắc nhở" })
  ] });
}
function FinancePermissions() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RolePermissionMatrix, { categories: FIN_PERM_CATEGORIES, personal: [] }) });
}
function ResetData({ userId, onDone }) {
  const [open, setOpen] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [confirm, setConfirm] = reactExports.useState("");
  const qc = useQueryClient();
  const preview = useQuery({
    queryKey: ["fin_reset_preview", userId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fin_reset_preview");
      if (error) throw new Error(error.message);
      return data;
    }
  });
  const backups = useQuery({
    queryKey: ["fin_reset_backups", userId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fin_reset_backups");
      if (error) throw new Error(error.message);
      return data ?? [];
    }
  });
  const download = async (id) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("fin_reset_backup_get", { _id: id });
      if (error) throw new Error(error.message);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `tien-ve-reset-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tải được bản sao");
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("fin_reset_execute", { _confirm: confirm });
      if (error) throw new Error(error.message);
      qc.removeQueries({ queryKey: ["bank_tx"] });
      qc.removeQueries({ queryKey: ["bank_tx_events"] });
      await Promise.all(["bank_transactions", "notifications", "fin_operation_status", "fin_reset_preview", "fin_reset_backups"].map((key) => qc.invalidateQueries({ queryKey: [key] })));
      setOpen(false);
      setConfirm("");
      onDone();
      toast.success("Đã reset Tiền Về; bản sao được lưu riêng cho Super Admin.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể reset Tiền Về");
    } finally {
      setBusy(false);
    }
  };
  const p = preview.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => {
      setConfirm("");
      setOpen(true);
      preview.refetch();
      backups.refetch();
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
      "Reset dữ liệu Tiền Về"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open, onOpenChange: (v) => {
      if (!busy) setOpen(v);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { className: "max-w-lg max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Reset dữ liệu Tiền Về?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Xóa toàn bộ giao dịch hiện có khỏi Base, kể cả lịch sử kiểm thử. Không xóa dữ liệu tại Casso hoặc ngân hàng. Không thể hoàn tác trực tiếp." })
      ] }),
      preview.isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang xem trước…" }) : preview.error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-destructive", children: [
        preview.error.message,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => preview.refetch(), children: "Thử lại" })
      ] }) : p && /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-2 gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Giao dịch ngân hàng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-right", children: p.bank }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Khoản nhập thủ công" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-right", children: p.manual }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Nhật ký giao dịch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-right", children: p.events }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Thông báo nội bộ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-right", children: p.notifications }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Bản ghi gửi thông báo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-right", children: p.push })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Bản sao giao dịch và dữ liệu phụ thuộc được lưu riêng, chỉ Super Admin tải được. Khôi phục cần xử lý riêng, không tự gửi lại thông báo. Ngân hàng, Zalo, quyền và luồng xử lý giữ nguyên." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mốc reset lấy từ máy chủ khi xác nhận; giao dịch ngân hàng trước hoặc bằng mốc sẽ bị bỏ qua. Số lượng được tính lại khi thực hiện, có thể thay đổi nếu vừa có giao dịch mới." }),
      p?.reset_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "Reset gần nhất: ",
        fmtTime(p.reset_at)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Nhập ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "RESET TIEN VE" }),
          " để xác nhận xóa"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Xác nhận reset", value: confirm, onChange: (e) => setConfirm(e.target.value), disabled: busy, autoComplete: "off" })
      ] }),
      backups.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-destructive", children: [
        "Không tải được danh sách bản sao: ",
        backups.error.message
      ] }),
      !!backups.data?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Bản sao riêng Super Admin" }),
        backups.data.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtTime(b.reset_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: busy, onClick: () => download(b.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-1 h-4 w-4" }),
            "Tải bản sao"
          ] })
        ] }, b.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: busy, children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: busy || confirm !== "RESET TIEN VE" || !p || preview.isFetching || !!preview.error, onClick: reset, children: busy ? "Đang thực hiện…" : "Xóa dữ liệu & bắt đầu vận hành" })
      ] })
    ] }) })
  ] });
}
const TYPES = { personal: "Cá nhân", household: "Hộ kinh doanh", company: "Công ty" };
const EMPTY = { id: "", bank_name: "", account_number: "", label: "", account_type: "personal" };
function BankSettings({ open, onOpenChange, canBank = true, canGmf = true, onResetDone }) {
  const { user, isSuperAdmin } = useCurrentUser();
  const qc = useQueryClient();
  const [f, setF] = reactExports.useState(EMPTY);
  const [saving, setSaving] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["bank_accounts"],
    enabled: open && canBank,
    queryFn: async () => {
      const { data: data2, error } = await supabase.from("bank_accounts").select("id, bank_name, account_number, label, account_type, active, share_sale, gmf_notify").order("created_at");
      if (error) throw error;
      return data2;
    }
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["bank_accounts"] });
  const save = async () => {
    const no = f.account_number.replace(/\D/g, "");
    if (!f.bank_name.trim() || no.length < 4) return toast.error("Nhập ngân hàng và số tài khoản hợp lệ.");
    setSaving(true);
    const row = { bank_name: f.bank_name.trim(), account_number: no, label: f.label.trim() || null, account_type: f.account_type };
    const { error } = f.id ? await supabase.from("bank_accounts").update(row).eq("id", f.id) : await supabase.from("bank_accounts").insert(row);
    setSaving(false);
    if (error) return toast.error(error.code === "23505" ? "Số tài khoản đã tồn tại." : "Không lưu được. Vui lòng thử lại.");
    toast.success("Đã lưu tài khoản.");
    setF(EMPTY);
    refresh();
  };
  const toggle = async (a, k = "active") => {
    const { error } = await supabase.from("bank_accounts").update({ [k]: !a[k] }).eq("id", a.id);
    if (error) toast.error("Không cập nhật được.");
    refresh();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cài đặt Tiền Về" }) }),
    canBank && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chỉ giao dịch của tài khoản đã đăng ký và đang bật mới được ghi nhận vào Tiền Về." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Đang tải…" }) : !data?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Chưa có tài khoản nào." }) : data.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-md border p-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium truncate", children: [
            a.label || a.bank_name,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
              "· ",
              TYPES[a.account_type]
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
            a.bank_name,
            " · ****",
            a.account_number.slice(-4)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col items-center text-[11px] text-muted-foreground gap-1", children: [
          a.active ? "Bật" : "Tạm ngừng",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: a.active, onCheckedChange: () => toggle(a) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col items-center text-[11px] text-muted-foreground gap-1", children: [
          "Sale xem",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: a.share_sale, onCheckedChange: () => toggle(a, "share_sale") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col items-center text-[11px] text-muted-foreground gap-1", children: [
          "Báo GMF",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: a.gmf_notify, onCheckedChange: () => toggle(a, "gmf_notify") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setF({ id: a.id, bank_name: a.bank_name, account_number: a.account_number, label: a.label ?? "", account_type: a.account_type }), children: "Sửa" })
      ] }, a.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngân hàng *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.bank_name, placeholder: "VietinBank", onChange: (e) => setF({ ...f, bank_name: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số tài khoản *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.account_number, inputMode: "numeric", onChange: (e) => setF({ ...f, account_number: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên gợi nhớ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.label, onChange: (e) => setF({ ...f, label: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại tài khoản" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm", value: f.account_type, onChange: (e) => setF({ ...f, account_type: e.target.value }), children: Object.entries(TYPES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex justify-end gap-2", children: [
          f.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setF(EMPTY), children: "Hủy sửa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saving, children: f.id ? "Lưu thay đổi" : "Thêm tài khoản" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "“Sale xem”: cho Sale thấy giao dịch của tài khoản này để xác nhận. “Báo GMF”: Bật thông báo tiền về cho nhóm GMF. Cả hai mặc định tắt." })
    ] }),
    canGmf && /* @__PURE__ */ jsxRuntimeExports.jsx(GmfSettings, { enabled: open }),
    canGmf && /* @__PURE__ */ jsxRuntimeExports.jsx(ReminderSettings, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FinancePermissions, {}),
    isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t pt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Quản trị nâng cao" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Cảnh báo: Reset sẽ xóa dữ liệu tài chính Tiền Về trong Base. Chỉ thực hiện khi đã kiểm tra số lượng giao dịch và xác nhận rõ ràng." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResetData, { userId: user?.id, onDone: () => {
        onOpenChange(false);
        onResetDone?.();
      } })
    ] })
  ] }) });
}
function GmfSettings({ enabled }) {
  const status = useServerFn(gmfStatus), list = useServerFn(gmfListGroups), save = useServerFn(gmfSave), test = useServerFn(gmfSendTest), retry = useServerFn(gmfRetry);
  const [s, setS] = reactExports.useState(null);
  const [groups, setGroups] = reactExports.useState([]);
  const [g, setG] = reactExports.useState({ groupId: "", groupName: "", enabled: false });
  const [busy, setBusy] = reactExports.useState(false);
  const load = () => status().then((r) => {
    setS(r);
    setG({ groupId: r.groupId, groupName: r.groupName, enabled: r.enabled });
  }).catch((e) => setS({ error: e.message }));
  reactExports.useEffect(() => {
    if (enabled) load();
  }, [enabled]);
  const run = async (fn) => {
    setBusy(true);
    try {
      const r = await fn();
      if (r?.message) (r.ok === false ? toast.error : toast.success)(r.message);
    } catch (e) {
      toast.error(e.message);
    }
    setBusy(false);
    load();
  };
  if (!s) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Cài đặt Zalo GMF" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải…" })
  ] });
  if (s.error) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Cài đặt Zalo GMF" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: s.error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
      setS(null);
      load();
    }, children: "Thử lại" })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Cài đặt Zalo GMF" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      s.oaConnected ? `Zalo OA: ${s.oaName ?? "đã kết nối"}` : "Zalo OA chưa kết nối — kết nối trong Cài đặt → Zalo OA trước.",
      " Link nhóm (zalo.me/g/…) không dùng thay cho mã nhóm; bấm “Lấy danh sách nhóm” để lấy mã nhóm từ Zalo."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy || !s.oaConnected, onClick: () => run(async () => {
        const r = await list();
        setGroups(r.groups);
        return r.ok ? { ok: true, message: `Tìm thấy ${r.groups.length} nhóm` } : r;
      }), children: "Lấy danh sách nhóm" }),
      groups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 rounded-md border border-input bg-background px-2 text-sm", value: g.groupId, onChange: (e) => setG({ ...g, groupId: e.target.value, groupName: groups.find((x) => x.id === e.target.value)?.name ?? "" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Chọn nhóm —" }),
        groups.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: x.id, children: x.name }, x.id))
      ] }),
      !groups.length && g.groupId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
        "Nhóm: ",
        g.groupName || g.groupId
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: g.enabled, onCheckedChange: (v) => setG({ ...g, enabled: v }) }),
      "Gửi thông báo tiền về vào nhóm"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy, onClick: () => run(() => save({ data: g })), children: "Lưu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy || !s.groupId, onClick: () => run(() => test()), children: "Gửi thử (không chứa dữ liệu thật)" }),
      s.failed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => run(async () => {
        const r = await retry();
        return { ok: !r.failed, message: `Gửi lại: ${r.sent} thành công, ${r.failed} lỗi${r.message ? ` (${r.message})` : ""}` };
      }), children: [
        "Gửi lại ",
        s.failed,
        " thông báo lỗi"
      ] })
    ] })
  ] });
}
function OperationStart({ userId }) {
  const [open, setOpen] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ["fin_operation_status", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("fin_operation_status");
      if (error) throw new Error(error.message);
      return data;
    }
  });
  const begin = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("fin_operation_begin", { _confirm: true });
      if (error) throw new Error(error.message);
      await qc.invalidateQueries({ queryKey: ["fin_operation_status"] });
      await qc.invalidateQueries({ queryKey: ["bank_transactions"] });
      qc.removeQueries({ queryKey: ["bank_tx"] });
      qc.removeQueries({ queryKey: ["bank_tx_events"] });
      await qc.invalidateQueries({ queryKey: ["notifications"] });
      setOpen(false);
      toast.success("Đã bắt đầu vận hành Tiền Về; giao dịch cũ được giữ trong lịch sử kiểm thử.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể bắt đầu vận hành");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    status.error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-destructive", children: [
      status.error.message,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => status.refetch(), children: "Thử lại" })
    ] }) : status.data?.started_at ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
      "Vận hành từ ",
      fmtTime(status.data.started_at)
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open, onOpenChange: (value) => {
      if (!busy) setOpen(value);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { className: "max-w-lg w-[calc(100%-2rem)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Bắt đầu vận hành Tiền Về?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Mốc bắt đầu là thời gian máy chủ ngay khi bạn xác nhận. Giao dịch phát sinh trước mốc được giữ trong “Lịch sử kiểm thử”, chỉ Super Admin xem được; không còn tính vào danh sách, số lượng và tổng tiền vận hành." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Không xóa giao dịch hay mã chống trùng, không gửi lại tin Zalo. Cài đặt ngân hàng, Zalo và quyền giữ nguyên. Chỉ thực hiện một lần, không thể đặt lại mốc." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: busy, children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: begin, children: busy ? "Đang thực hiện…" : "Xác nhận bắt đầu vận hành" })
      ] })
    ] }) })
  ] });
}
const PAGE = 50;
const isUuid = (s) => /^[0-9a-f-]{36}$/i.test(s);
const chip = (on) => `shrink-0 h-9 px-3 rounded-full border text-sm whitespace-nowrap transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"}`;
function Incoming() {
  const sp = Route$h.useSearch();
  const s = {
    acc: sp.acc ?? "",
    st: confirmationFilter(sp.st ?? ""),
    q: sp.q ?? "",
    from: sp.from ?? "",
    to: sp.to ?? "",
    sale: sp.sale ?? "",
    history: sp.history ?? "",
    rem: sp.rem === "max" ? "max" : ""
  };
  const navigate = useNavigate({
    from: "/finance/incoming/"
  });
  const set = (p) => navigate({
    search: (prev) => {
      const n = {
        ...prev,
        ...p
      };
      for (const k in n) if (!n[k]) delete n[k];
      return n;
    },
    replace: true
  });
  const [qText, setQText] = reactExports.useState(s.q);
  reactExports.useEffect(() => {
    const h = setTimeout(() => {
      if (qText !== s.q) set({
        q: qText
      });
    }, 350);
    return () => clearTimeout(h);
  }, [qText]);
  const [limit, setLimit] = reactExports.useState(PAGE);
  reactExports.useEffect(() => setLimit(PAGE), [s.acc, s.st, s.q, s.from, s.to, s.sale, s.history, s.rem]);
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const {
    user,
    can,
    isSuperAdmin
  } = useCurrentUser();
  const history = isSuperAdmin && s.history === "test";
  const canBank = can("finance.incoming.bank_config"), canGmf = can("finance.incoming.gmf_config") || can("finance.incoming.manage");
  const canTotals = can("finance.incoming.view_totals");
  const canAll = can("finance.incoming.manage") || can("finance.incoming.reconcile");
  const canManual = can("finance.incoming.manual_view") || canAll || can("finance.incoming.manual_manage") || can("finance.incoming.manual_create");
  const canAdd = can("finance.incoming.manual_create");
  const nav = useNavigate();
  const qc = useQueryClient();
  const users = useAuth((st) => st.users);
  const nameOf = (u) => u && users.find((x) => x.id === u)?.fullName || "—";
  const {
    data: labels
  } = useQuery({
    queryKey: ["fin_bank_labels"],
    queryFn: async () => (await supabase.rpc("fin_bank_labels")).data ?? []
  });
  const src = s.acc === "cash" || s.acc === "other_account" ? s.acc : "";
  const acc = isUuid(s.acc) ? s.acc : "";
  const amount = searchAmount(s.q);
  const q = amount === null ? safeQ(s.q) : s.q.trim();
  const sale = isUuid(s.sale) ? s.sale : "";
  const fromTs = vnStart(s.from), toTs = vnEndExcl(s.to);
  const filt = {
    src,
    acc,
    q,
    sale,
    fromTs,
    toTs,
    history
  };
  const stats = useQuery({
    queryKey: ["bank_transactions", "stats", user?.id, filt, canTotals],
    queryFn: async () => {
      const {
        data: data2,
        error: error2
      } = await supabase.rpc(history ? "fin_incoming_history_stats" : "fin_incoming_stats", {
        _src: src || void 0,
        _acc: acc || void 0,
        _from: fromTs ?? void 0,
        _to: toTs ?? void 0,
        _q: q || void 0,
        _sale: sale || void 0
      });
      if (error2) throw error2;
      return data2 ?? [];
    }
  });
  const count = (st) => (stats.data ?? []).filter((r) => !st || r.status === st).reduce((a, r) => a + Number(r.n), 0);
  const sum = (st, kind) => (stats.data ?? []).filter((r) => (!st || r.status === st) && (!kind || r.source === kind)).reduce((a, r) => a + Number(r.total ?? 0), 0);
  const {
    data: rcfg
  } = useQuery(reminderConfigQuery);
  const maxAuto = rcfg?.max_auto ?? 5;
  const canRemind = can("finance.incoming.remind");
  const summary = useQuery({
    queryKey: ["fin_reminders", "summary", user?.id, maxAuto],
    enabled: canAll && !history,
    queryFn: async () => {
      const [oldest, maxed] = await Promise.all([supabase.from("bank_transactions").select("id, amount, transaction_at, created_at").eq("confirmation_status", "unclaimed").is("cancelled_at", null).eq("operation_test", false).gt("amount", 0).order("transaction_at", {
        ascending: true
      }).limit(1), supabase.from("fin_reminders").select("tx_id, bank_transactions!inner(confirmation_status, cancelled_at)").eq("kind", "auto").eq("seq", maxAuto).neq("status", "failed").eq("bank_transactions.confirmation_status", "unclaimed").is("bank_transactions.cancelled_at", null).limit(500)]);
      return {
        oldest: oldest.data?.[0] ?? null,
        maxedIds: [...new Set((maxed.data ?? []).map((r) => r.tx_id))]
      };
    }
  });
  const maxedIds = summary.data?.maxedIds ?? [];
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["bank_transactions", "list", user?.id, filt, s.st, limit, s.rem, maxedIds.length],
    queryFn: async () => {
      let x = supabase.from("bank_transactions").select("id, source, bank_account_id, bank_name, transaction_at, transaction_date, amount, description, note, reference_number, confirmation_status, created_at, claimed_by, info_reason").gt("amount", 0).is("cancelled_at", null).eq("operation_test", history);
      if (src) x = x.eq("source", src);
      if (acc) x = x.eq("bank_account_id", acc);
      if (s.st) x = x.eq("confirmation_status", s.st);
      if (sale) x = x.eq("claimed_by", sale);
      if (fromTs) x = x.gte("transaction_at", fromTs);
      if (toTs) x = x.lt("transaction_at", toTs);
      if (s.rem === "max") x = x.in("id", maxedIds.length ? maxedIds : ["00000000-0000-0000-0000-000000000000"]);
      if (amount !== null) x = x.eq("amount", amount);
      else if (q) x = x.or(["description", "reference_number", "note", "customer"].map((c) => `${c}.ilike.*${q}*`).join(","));
      const oldestFirst = s.st === "unclaimed" || s.rem === "max";
      const {
        data: data2,
        error: error2
      } = await x.order("transaction_at", {
        ascending: oldestFirst
      }).order("created_at", {
        ascending: false
      }).range(0, limit - 1);
      if (error2) throw error2;
      return data2;
    }
  });
  const rows = data ?? [];
  const {
    data: rems
  } = useQuery(remindersQuery(rows.filter((r) => r.confirmation_status === "unclaimed").map((r) => r.id)));
  const now = Date.now();
  const waitInfo = (r) => {
    if (r.confirmation_status !== "unclaimed") return null;
    const from = Date.parse(r.transaction_at ?? r.created_at);
    const n = autoCount(rems, r.id);
    return {
      wait: Number.isFinite(from) ? fmtWait(Math.max(0, Math.floor((now - from) / 6e4))) : "",
      n,
      label: n >= maxAuto ? `Đã nhắc tối đa ${maxAuto} lần` : n ? `Đã nhắc ${n}/${maxAuto}` : "Chờ xác nhận"
    };
  };
  const total = count(s.st);
  const active = (labels ?? []).filter((l) => l.active), inactive = (labels ?? []).filter((l) => !l.active);
  const saleUsers = reactExports.useMemo(() => [...users].filter((u) => u.fullName).sort((a, b) => a.fullName.localeCompare(b.fullName)), [users]);
  const hasFilter = !!(s.q || s.from || s.to || s.sale);
  const open = (id) => nav({
    to: "/finance/incoming/$id",
    params: {
      id
    }
  });
  const who = (r) => nameOf(r.claimed_by);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: history ? "Tiền Về — Lịch sử kiểm thử" : "Tiền Về", description: "Giao dịch tiền vào đồng bộ tự động từ ngân hàng và khoản Kế toán nhập thủ công.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(OperationStart, { userId: user?.id }),
      canAdd && !history && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowAdd(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Thêm khoản tiền"
      ] }),
      (canBank || canGmf || isSuperAdmin) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setShowSettings(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4 mr-2" }),
        "Cài đặt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", "aria-label": "Làm mới", onClick: () => {
        refetch();
        stats.refetch();
      }, disabled: isFetching, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${isFetching ? "animate-spin" : ""}` }) })
    ] }) }),
    (canBank || canGmf || isSuperAdmin) && /* @__PURE__ */ jsxRuntimeExports.jsx(BankSettings, { open: showSettings, onOpenChange: setShowSettings, canBank, canGmf, onResetDone: () => {
      setQText("");
      set({
        history: "",
        acc: "",
        st: "",
        q: "",
        from: "",
        to: "",
        sale: "",
        rem: ""
      });
    } }),
    canAdd && /* @__PURE__ */ jsxRuntimeExports.jsx(ManualEntry, { open: showAdd, onOpenChange: setShowAdd, canReconcile: can("finance.incoming.reconcile"), onDone: (id) => {
      qc.invalidateQueries({
        queryKey: ["bank_transactions"]
      });
      if (id) open(id);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(!s.acc), onClick: () => set({
        acc: ""
      }), children: "Tất cả tài khoản" }),
      active.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(s.acc === l.id), onClick: () => set({
        acc: l.id
      }), title: `${l.bank_name} · ****${l.last4}`, children: l.label }, l.id)),
      canManual && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(s.acc === "cash"), onClick: () => set({
          acc: "cash"
        }), children: "Tiền mặt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: chip(s.acc === "other_account"), onClick: () => set({
          acc: "other_account"
        }), children: "TK khác" })
      ] }),
      inactive.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `${chip(s.acc === l.id)} opacity-70`, onClick: () => set({
        acc: l.id
      }), children: [
        l.label,
        " · ngừng"
      ] }, l.id))
    ] }) }),
    canAll && !history && stats.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "rounded-xl border bg-card p-2.5 sm:p-3 text-left hover:bg-accent", onClick: () => set({
        st: "unclaimed",
        rem: ""
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Đang chờ xác nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-primary", children: count("unclaimed") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "rounded-xl border bg-card p-3 text-left hover:bg-accent disabled:opacity-60", disabled: !summary.data?.oldest, onClick: () => summary.data?.oldest && open(summary.data.oldest.id), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Chờ lâu nhất" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs sm:text-sm font-semibold", children: summary.data?.oldest ? `${vnd(Number(summary.data.oldest.amount))} · ${fmtWait(Math.max(0, Math.floor((now - Date.parse(summary.data.oldest.transaction_at ?? summary.data.oldest.created_at)) / 6e4)))}` : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `rounded-xl border p-3 text-left hover:bg-accent ${s.rem === "max" ? "border-primary bg-primary/5" : "bg-card"}`, onClick: () => set({
        rem: s.rem === "max" ? "" : "max",
        st: ""
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Đã nhắc tối đa ",
          maxAuto,
          " lần"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-warning", children: maxedIds.length })
      ] })
    ] }),
    s.rem === "max" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-sm", children: [
      "Đang xem khoản đã nhắc tối đa ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", size: "sm", className: "px-1", onClick: () => set({
        rem: ""
      }), children: "Bỏ lọc" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 border-b", children: [["", "Tất cả"], ...Object.entries(TX_STATUS)].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => set({
      st: k
    }), className: `shrink-0 px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${s.st === k ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"}`, children: [
      v,
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded bg-muted px-1.5 text-xs", children: stats.data ? count(k) : "…" })
    ] }, k)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-8", placeholder: "Tìm số tiền, nội dung CK, mã GD, ghi chú...", value: qText, onChange: (e) => setQText(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-auto", value: s.from, onChange: (e) => set({
        from: e.target.value
      }), "aria-label": "Từ ngày" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-auto", value: s.to, onChange: (e) => set({
        to: e.target.value
      }), "aria-label": "Đến ngày" }),
      canAll && /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 rounded-md border border-input bg-background px-2 text-sm max-w-[180px]", value: s.sale, onChange: (e) => set({
        sale: e.target.value
      }), "aria-label": "Sale xác nhận", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Sale xác nhận: tất cả" }),
        saleUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.fullName }, u.id))
      ] }),
      hasFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => {
        setQText("");
        set({
          q: "",
          from: "",
          to: "",
          sale: ""
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
        "Xóa lọc"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mb-3", children: stats.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "Không tải được số đếm và tổng tiền." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      stats.data ? total : "…",
      " giao dịch · ",
      canTotals ? "Tổng" : "Tổng của tôi",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-foreground", children: stats.data ? vnd(sum(s.st)) : "…" }),
      canTotals && sum(s.st, "manual") > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " (ngân hàng ",
        vnd(sum(s.st, "bank")),
        " · thủ công ",
        vnd(sum(s.st, "manual")),
        ")"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-muted-foreground", children: "Đang tải dữ liệu…" }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-destructive", children: "Không tải được danh sách." }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-muted-foreground", children: "Không có giao dịch phù hợp." }) : rows.map((r) => {
      const rc = receiver(r, labels);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "button", tabIndex: 0, onClick: () => open(r.id), onKeyDown: (e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open(r.id);
        }
      }, className: "w-full text-left rounded-lg border bg-card p-3 active:bg-accent cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-primary", children: vnd(Number(r.amount)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: TX_VARIANT[r.confirmation_status] ?? "secondary", children: TX_STATUS[r.confirmation_status] ?? r.confirmation_status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-semibold uppercase", children: rc.main }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm mt-0.5 line-clamp-2 text-muted-foreground", children: (r.source === "bank" ? r.description : r.description || r.note) || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
          fmtTime(r.transaction_at, r.transaction_date),
          who(r) !== "—" ? ` · ${who(r)}` : ""
        ] }),
        (() => {
          const w = waitInfo(r);
          return w && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: w.n >= maxAuto ? "text-warning font-medium" : "font-medium", children: w.label }),
              w.wait && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " · chờ ",
                w.wait
              ] })
            ] }),
            canRemind && /* @__PURE__ */ jsxRuntimeExports.jsx(RemindButton, { txId: r.id, className: "h-10" })
          ] });
        })()
      ] }, r.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block rounded-lg border bg-card overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Thời gian", "TK nhận / nguồn", "Số tiền", "Nội dung CK / ghi chú", "Sale xác nhận", "Trạng thái"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-3 py-8 text-center text-muted-foreground", children: "Đang tải dữ liệu…" }) }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-3 py-8 text-center text-destructive", children: "Không tải được danh sách. Vui lòng thử lại." }) }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-3 py-8 text-center text-muted-foreground", children: "Không có giao dịch phù hợp." }) }) : rows.map((r) => {
        const rc = receiver(r, labels);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t cursor-pointer hover:bg-accent/50", onClick: () => open(r.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtTime(r.transaction_at, r.transaction_date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold uppercase", children: rc.main }),
            rc.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: rc.sub })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium text-primary whitespace-nowrap", children: vnd(Number(r.amount)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 min-w-[220px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-2 break-words", children: (r.source === "bank" ? r.description : r.description || r.note) || "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: who(r) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 min-w-[150px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "whitespace-nowrap", variant: TX_VARIANT[r.confirmation_status] ?? "secondary", children: TX_STATUS[r.confirmation_status] ?? r.confirmation_status }),
            r.info_reason && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-destructive mt-0.5", children: "Cần chỉnh sửa" }),
            (() => {
              const w = waitInfo(r);
              return w && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 space-y-1 text-xs whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: w.n >= maxAuto ? "text-warning font-medium" : "font-medium", children: w.label }),
                w.wait && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                  "chờ ",
                  w.wait
                ] }),
                canRemind && /* @__PURE__ */ jsxRuntimeExports.jsx(RemindButton, { txId: r.id, className: "h-8 px-2" })
              ] });
            })()
          ] })
        ] }, r.id);
      }) })
    ] }) }),
    rows.length < total && rows.length >= limit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", disabled: isFetching, onClick: () => setLimit(limit + PAGE), children: [
      "Tải thêm (",
      rows.length,
      "/",
      total,
      ")"
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: ["finance.incoming.view", "finance.incoming.claim", "finance.incoming.reconcile", "finance.incoming.manage", "finance.incoming.manual_view"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Incoming, {}) });
export {
  SplitComponent as component
};
