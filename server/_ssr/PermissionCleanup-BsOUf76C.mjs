import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, cg as titleRolesApi, ch as auditReasonLabel, B as Button, N as Checkbox, l as Badge, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, I as Input, E as DialogFooter, F as useAuth } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
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
import "../_libs/lucide-react.mjs";
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
const CLEANUP_STATUS_LABELS = {
  ready: "Sẵn sàng",
  review: "Cần xử lý",
  protected: "Được bảo vệ"
};
const CLEANUP_GROUP_LABELS = {
  A: "Quản trị",
  B: "Kinh doanh",
  C: "Ngoài Kinh doanh",
  D: "Kiêm nhiệm"
};
function selectableAccounts(accounts) {
  return accounts.filter((a) => a.status === "ready");
}
function cleanupStatusTone(status) {
  if (status === "ready") return "default";
  if (status === "review") return "destructive";
  return "secondary";
}
const CONFIRM_TEXT = "CHUYỂN ĐỔI QUYỀN";
function PermissionCleanup() {
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const audits = useQuery({ queryKey: ["title-role-links", user?.id], queryFn: titleRolesApi.read, retry: false });
  const [filter, setFilter] = reactExports.useState("all");
  const [picked, setPicked] = reactExports.useState(/* @__PURE__ */ new Set());
  const [detail, setDetail] = reactExports.useState(null);
  const [confirming, setConfirming] = reactExports.useState(false);
  const [confirmText, setConfirmText] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const preview = useQuery({
    queryKey: ["perm-cleanup-preview", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("base_perm_final_preview");
      if (error) throw error;
      return data;
    }
  });
  const runs = useQuery({
    queryKey: ["perm-cleanup-runs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("base_perm_cleanup_runs").select("id,actor,fingerprint,removed,restored,created_at,restored_at,final_transition,result").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data ?? [];
    }
  });
  const accounts = reactExports.useMemo(() => preview.data?.accounts ?? [], [preview.data]);
  const shown = reactExports.useMemo(() => filter === "all" ? accounts : accounts.filter((a) => a.status === filter), [accounts, filter]);
  const selectable = reactExports.useMemo(() => selectableAccounts(accounts), [accounts]);
  const refresh = () => {
    setPicked(/* @__PURE__ */ new Set());
    qc.invalidateQueries({ queryKey: ["perm-cleanup-preview", user?.id] });
    qc.invalidateQueries({ queryKey: ["perm-cleanup-runs", user?.id] });
  };
  const execute = async () => {
    if (!preview.data || confirmText !== CONFIRM_TEXT) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("base_perm_final_execute", {
        _users: [...picked],
        _fingerprint: preview.data.fingerprint,
        _confirmation: confirmText
      });
      if (error) throw error;
      const r = data;
      toast.success(`Đã gỡ ${r.removed.length} Role trực tiếp${r.skipped.length ? `, bỏ qua ${r.skipped.length} tài khoản` : ""}.`);
      setConfirming(false);
      setConfirmText("");
      refresh();
      await qc.invalidateQueries();
      await useAuth.getState().reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const restore = async (runId, finalTransition, standardReset) => {
    if (!window.confirm("Khôi phục nguồn Role cũ đã ngừng hiệu lực? Quyền bổ sung mới sẽ được giữ nguyên.")) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc(standardReset ? "base_perm_standard_reset_restore" : finalTransition ? "base_perm_final_restore" : "base_perm_cleanup_restore", { _run: runId });
      if (error) throw error;
      const r = data;
      toast.success(`Đã khôi phục ${r.restored_rows} Role đã gỡ.${r.conflicts.length ? ` Lưu ý: ${r.conflicts.length} quyền mới phát sinh sau chuyển đổi được giữ nguyên, cần đối chiếu thủ công.` : ""}`);
      refresh();
      await qc.invalidateQueries();
      await useAuth.getState().reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (preview.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-muted-foreground", children: "Đang kiểm kê quyền…" });
  if (preview.error) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-sm text-destructive", children: preview.error.message });
  if (!preview.data) return null;
  const t = preview.data.totals;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đã ngừng nguồn quyền legacy của toàn bộ nhân sự thông thường, bao gồm Kinh doanh. Hai Super Admin được bảo vệ. Bổ nhiệm và lịch sử được giữ nguyên; chỉ nguồn Role chuẩn đã kiểm chứng tiếp tục cấp quyền. Quyền Kinh doanh theo bổ nhiệm mới và phạm vi quản lý còn chờ hỗ trợ an toàn. Các lần chuyển đổi cũ bên dưới chỉ để đối chiếu và khôi phục." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "border-b pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer font-medium text-sm", children: "Role theo chức vụ — kiểm chứng Giai đoạn 3A" }),
      audits.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive text-sm", children: audits.error.message }),
      audits.data?.link_audits?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
          a.title_name,
          " · ",
          a.role_name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          a.enabled.length,
          " quyền đã bật · ",
          a.eligible.length - a.enabled.length,
          " quyền an toàn chưa bật · ",
          a.blocked.length,
          " quyền còn chờ"
        ] }),
        !a.signature_valid && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Role đã thay đổi; quyền theo liên kết tạm ngừng." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer", children: "Quyền còn chờ" }),
          a.blocked.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "py-1 text-xs", children: [
            p.key,
            " — ",
            auditReasonLabel(p.reason)
          ] }, p.key))
        ] })
      ] }, `${a.title_id}-${a.role_id}`))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: [["all", `Tất cả · ${t.accounts}`], ["ready", `Sẵn sàng · ${t.ready}`], ["review", `Cần xử lý · ${t.review}`], ["protected", `Được bảo vệ · ${t.protected}`]].map(([f, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: filter === f ? "default" : "outline", onClick: () => setFilter(f), children: label }, f)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Nhân sự" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Đơn vị / Chức vụ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Nhóm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Role trực tiếp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Sẽ gỡ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Mất quyền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 text-left font-medium", children: "Trạng thái" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        shown.map((a) => {
          const canPick = a.status === "ready";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b align-top", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: canPick && /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { "aria-label": `Chọn ${a.name}`, checked: picked.has(a.user_id), onCheckedChange: (v) => {
              const n = new Set(picked);
              if (v) n.add(a.user_id);
              else n.delete(a.user_id);
              setPicked(n);
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-left font-medium hover:underline", onClick: () => setDetail(a), children: a.name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2 text-muted-foreground", children: [a.unit, a.title].filter(Boolean).join(" · ") || "Chưa phân công vị trí" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: CLEANUP_GROUP_LABELS[a.group] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: a.roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: r.protected ? "text-muted-foreground" : "", children: [
              r.name,
              r.protected ? " (giữ)" : ""
            ] }, r.role_id)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: a.removable.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: a.lost.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: a.lost.length }) : 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: cleanupStatusTone(a.status), children: CLEANUP_STATUS_LABELS[a.status] }),
              a.status !== "ready" && a.reasons.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-xs text-xs text-muted-foreground", children: a.reasons[0] })
            ] })
          ] }, a.user_id);
        }),
        !shown.length && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-2 py-6 text-center text-muted-foreground", children: "Không có tài khoản nào trong nhóm này." }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: busy || picked.size === 0, onClick: () => setConfirming(true), children: [
        "Chuyển đổi ",
        picked.size,
        " tài khoản đã chọn"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: refresh, children: "Xem trước lại" }),
      selectable.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setPicked(new Set(selectable.map((a) => a.user_id))), children: [
        "Chọn tất cả (",
        selectable.length,
        ")"
      ] })
    ] }),
    runs.data && runs.data.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Lịch sử chuyển đổi" }),
      runs.data.map((run) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: new Date(run.created_at).toLocaleString("vi-VN") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Đã gỡ ",
          run.removed.length,
          " Role"
        ] }),
        run.result?.standard_only_reset && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          run.result.accounts,
          " nhân sự · ",
          run.result.protected_accounts,
          " Super Admin giữ nguyên · legacy đã ngừng"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs break-all", children: [
          "Mã phục hồi: ",
          run.id
        ] }),
        run.restored ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Đã khôi phục" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => restore(run.id, run.final_transition, run.result?.standard_only_reset), children: "Khôi phục" })
      ] }, run.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!detail, onOpenChange: () => setDetail(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: detail?.name }) }),
      detail && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          [detail.unit, detail.title].filter(Boolean).join(" · ") || "Chưa phân công vị trí",
          " · Nhóm ",
          CLEANUP_GROUP_LABELS[detail.group]
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            "Trạng thái: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: cleanupStatusTone(detail.status), children: CLEANUP_STATUS_LABELS[detail.status] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 list-disc space-y-1 pl-5 text-muted-foreground", children: detail.reasons.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: r }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Role trực tiếp" }),
          detail.roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            r.name,
            " — ",
            detail.removable.includes(r.role_id) ? "sẽ ngừng nguồn cũ" : "giữ nguyên"
          ] }, r.role_id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Nguồn quyền tự động sau chuyển đổi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            detail.appointment_sources,
            " quyền từ chức vụ · ",
            detail.specialty_sources,
            " quyền từ nhiệm vụ Marketing"
          ] })
        ] }),
        detail.lost.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-destructive", children: [
            "Quyền sẽ mất (",
            detail.lost.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground break-words", children: detail.lost.join(", ") })
        ] }),
        detail.pending_work > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-destructive", children: [
          "Có ",
          detail.pending_work,
          " hồ sơ đang chờ trong kiểm kê Nghỉ phép/3K/Tài chính. Admin cần cấp bổ sung quyền xử lý; không tự thay người nhận hay người duyệt."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: confirming, onOpenChange: () => setConfirming(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Xác nhận chuyển đổi quyền" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Bạn sắp ngừng nguồn Role cũ của ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            picked.size,
            " tài khoản"
          ] }),
          ". Nhân sự chưa bổ nhiệm có thể mất quyền xử lý công việc; không tự bổ nhiệm hay thay người duyệt. Kinh doanh, quản trị và nguồn không rõ được giữ nguyên. Hệ thống lưu bản sao đầy đủ, kiểm tra lại dữ liệu trước khi chuyển đổi và hỗ trợ khôi phục."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Nhập ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: CONFIRM_TEXT }),
          " để xác nhận:"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Xác nhận chuyển đổi", value: confirmText, onChange: (e) => setConfirmText(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setConfirming(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || confirmText !== CONFIRM_TEXT, onClick: execute, children: busy ? "Đang thực hiện…" : "Thực hiện chuyển đổi" })
      ] })
    ] }) })
  ] });
}
export {
  PermissionCleanup
};
