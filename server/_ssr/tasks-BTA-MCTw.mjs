import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { b as useStore, u as useCurrentUser, i as isOverdue, P as PageHeader, D as Dialog, be as DialogTrigger, B as Button, x as DialogContent, y as DialogHeader, A as DialogTitle, I as Input, C as Card, o as CardContent, f as fmtDate, bf as todayISO, aX as uid, L as Label, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { r as readOpenParam, s as syncOpenParam } from "./deep-link-CfE7_DgM.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { F as FilterBar, E as EmptyState } from "./Common-D50TzqoQ.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { a6 as Plus, bk as Table, i as LayoutGrid, r as Eye, ao as Pencil, ap as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
const PRIORITIES = ["Thấp", "Trung bình", "Cao", "Gấp"];
const STATUSES = ["Mới tạo", "Đã giao", "Đang làm", "Chờ xác nhận", "Cần sửa", "Hoàn thành", "Đã hủy"];
function appendHistory(t, entry) {
  return {
    ...t,
    history: [...t.history ?? [], entry]
  };
}
function denyToast() {
  toast.error("Bạn không có quyền thực hiện hành động này.");
}
function TaskForm({
  initial,
  onSubmit,
  onClose,
  mode
}) {
  const {
    brands,
    people,
    plans,
    topics
  } = useStore();
  const {
    can
  } = useCurrentUser();
  const canEditAssignee = mode === "create" ? can("task.create") : can("task.edit_assignee") || can("task.edit");
  const canEditDeadline = mode === "create" ? can("task.create") : can("task.edit_deadline") || can("task.edit");
  const canEditPriority = mode === "create" ? can("task.create") : can("task.edit_priority") || can("task.edit");
  const canEditCore = mode === "create" ? can("task.create") : can("task.edit");
  const [t, setT] = reactExports.useState({
    id: initial?.id || uid(),
    title: initial?.title || "",
    description: initial?.description || "",
    brandId: initial?.brandId,
    module: initial?.module,
    relatedLink: initial?.relatedLink,
    assignee: initial?.assignee,
    reporter: initial?.reporter,
    approver: initial?.approver,
    relatedPeople: initial?.relatedPeople ?? [],
    deadline: initial?.deadline,
    priority: initial?.priority || "Trung bình",
    status: initial?.status || "Mới tạo",
    notes: initial?.notes,
    link: initial?.link,
    plan: initial?.plan,
    topic: initial?.topic,
    inputLink: initial?.inputLink,
    resultLink: initial?.resultLink,
    handoverLink: initial?.handoverLink,
    processNote: initial?.processNote,
    revisionNote: initial?.revisionNote,
    revisions: initial?.revisions ?? 0,
    createdAt: initial?.createdAt ?? todayISO(),
    acceptedAt: initial?.acceptedAt,
    submittedAt: initial?.submittedAt,
    completedAt: initial?.completedAt,
    cancelledAt: initial?.cancelledAt,
    history: initial?.history ?? []
  });
  const set = (p) => setT({
    ...t,
    ...p
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên task *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: t.title, onChange: (e) => set({
          title: e.target.value
        }), placeholder: "VD: Sửa banner trang chủ", disabled: !canEditCore })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mô tả / Yêu cầu công việc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: t.description || "", onChange: (e) => set({
          description: e.target.value
        }), rows: 3, disabled: !canEditCore })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thương hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.brandId || "_", onValueChange: (v) => set({
          brandId: v === "_" ? void 0 : v
        }), disabled: !canEditCore, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "— Không —" }),
            brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Module liên quan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.module || "_", onValueChange: (v) => set({
          module: v === "_" ? void 0 : v
        }), disabled: !canEditCore, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "— Không —" }),
            ["Dự án Web", "Social", "Local", "Video", "Thiết kế", "Khác"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: t.deadline || "", onChange: (e) => set({
          deadline: e.target.value
        }), disabled: !canEditDeadline })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mức ưu tiên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.priority, onValueChange: (v) => set({
          priority: v
        }), disabled: !canEditPriority, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phụ trách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.assignee || "_", onValueChange: (v) => set({
          assignee: v === "_" ? void 0 : v
        }), disabled: !canEditAssignee, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "— Không —" }),
            people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người giao việc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.reporter || "_", onValueChange: (v) => set({
          reporter: v === "_" ? void 0 : v
        }), disabled: !canEditCore, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "— Không —" }),
            people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người xác nhận / duyệt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.approver || "_", onValueChange: (v) => set({
          approver: v === "_" ? void 0 : v
        }), disabled: !canEditCore, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "— Không —" }),
            people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan liên quan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.plan || "_", onValueChange: (v) => set({
          plan: v === "_" ? void 0 : v
        }), disabled: !canEditCore, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
            plans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Topic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: t.topic || "_", onValueChange: (v) => set({
          topic: v === "_" ? void 0 : v
        }), disabled: !canEditCore, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
            topics.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link tài liệu đầu vào" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: t.inputLink || "", onChange: (e) => set({
          inputLink: e.target.value
        }), placeholder: "https://...", disabled: !canEditCore })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link kết quả" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: t.resultLink || "", onChange: (e) => set({
          resultLink: e.target.value
        }), placeholder: "https://...", disabled: !canEditCore })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bàn giao" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: t.handoverLink || "", onChange: (e) => set({
          handoverLink: e.target.value
        }), placeholder: "https://...", disabled: !canEditCore })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: t.notes || "", onChange: (e) => set({
          notes: e.target.value
        }), rows: 2, disabled: !canEditCore })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (!canEditCore) {
          denyToast();
          return;
        }
        if (t.title.trim()) {
          onSubmit(t);
          onClose();
        }
      }, children: "Lưu" })
    ] })
  ] });
}
function WorkflowButtons({
  task,
  onChange,
  onClose
}) {
  const {
    user,
    can,
    isSuperAdmin
  } = useCurrentUser();
  const meName = user?.fullName || user?.username || "";
  const [revOpen, setRevOpen] = reactExports.useState(false);
  const [revNote, setRevNote] = reactExports.useState("");
  const [submitOpen, setSubmitOpen] = reactExports.useState(false);
  const [sNote, setSNote] = reactExports.useState("");
  const [sResultLink, setSResultLink] = reactExports.useState("");
  const [sRelatedDoc, setSRelatedDoc] = reactExports.useState("");
  const [sExtraNote, setSExtraNote] = reactExports.useState("");
  const [sFiles, setSFiles] = reactExports.useState([]);
  const [sFileName, setSFileName] = reactExports.useState("");
  const [sFileUrl, setSFileUrl] = reactExports.useState("");
  const openSubmit = (mode) => {
    const permKey = mode === "submit" ? "task.submit_completion" : "task.resubmit_completion";
    if (!isSuperAdmin && !can(permKey)) {
      denyToast();
      return;
    }
    setSNote(task.completionNote ?? "");
    setSResultLink(task.resultLink ?? "");
    setSRelatedDoc(task.relatedDocumentLink ?? "");
    setSExtraNote("");
    setSFiles(task.completionFiles?.map((f) => ({
      name: f.name ?? "",
      url: f.url
    })) ?? []);
    setSFileName("");
    setSFileUrl("");
    setSubmitOpen(mode);
  };
  const confirmSubmit = () => {
    const mode = submitOpen;
    if (!mode) return;
    const permKey = mode === "submit" ? "task.submit_completion" : "task.resubmit_completion";
    const action = mode === "submit" ? "Gửi hoàn thành" : "Gửi lại hoàn thành";
    const nowISO = (/* @__PURE__ */ new Date()).toISOString();
    const noteParts = [];
    if (sNote.trim()) noteParts.push(`Ghi chú: ${sNote.trim()}`);
    if (sResultLink.trim()) noteParts.push(`Kết quả: ${sResultLink.trim()}`);
    if (sExtraNote.trim()) noteParts.push(`Ghi chú thêm: ${sExtraNote.trim()}`);
    transition(permKey, "Chờ xác nhận", action, {
      submittedAt: nowISO,
      submittedBy: meName,
      completionNote: sNote.trim() || void 0,
      resultLink: sResultLink.trim() || task.resultLink,
      relatedDocumentLink: sRelatedDoc.trim() || void 0,
      completionFiles: sFiles.length ? sFiles.map((f) => ({
        name: f.name || void 0,
        url: f.url
      })) : void 0
    }, noteParts.join(" • ") || void 0);
    setSubmitOpen(false);
  };
  const transition = (permKey, toStatus, action, extra = {}, note, forced) => {
    if (!isSuperAdmin && !can(permKey)) {
      denyToast();
      return;
    }
    const entry = {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      byId: user?.id,
      byName: meName,
      action,
      fromStatus: task.status,
      toStatus,
      note,
      forced
    };
    const next = appendHistory({
      ...task,
      status: toStatus,
      ...extra
    }, entry);
    onChange(next);
  };
  const s = task.status;
  const canForce = isSuperAdmin || can("task.force_status") || can("task.force_change_status");
  const buttons = [];
  if (s === "Mới tạo") {
    buttons.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
      if (!task.assignee) {
        toast.error("Cần chọn người phụ trách trước khi giao.");
        return;
      }
      transition("task.assign", "Đã giao", "Giao task");
    }, children: "Giao task" }, "assign"), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => transition("task.cancel", "Đã hủy", "Hủy task", {
      cancelledAt: todayISO()
    }), children: "Hủy" }, "cancel"));
  }
  if (s === "Đã giao") {
    buttons.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => transition("task.start", "Đang làm", "Bắt đầu làm", {
      acceptedAt: todayISO()
    }), children: "Bắt đầu làm" }, "start"), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => transition("task.cancel", "Đã hủy", "Hủy task", {
      cancelledAt: todayISO()
    }), children: "Hủy" }, "cancel"));
  }
  if (s === "Đang làm") {
    buttons.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => openSubmit("submit"), children: "Gửi hoàn thành" }, "submit"));
  }
  if (s === "Chờ xác nhận") {
    buttons.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => transition("task.approve_completion", "Hoàn thành", "Xác nhận hoàn thành", {
      completedAt: todayISO()
    }), children: "Xác nhận hoàn thành" }, "approve"), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
      if (!isSuperAdmin && !can("task.request_revision")) {
        denyToast();
        return;
      }
      setRevOpen(true);
    }, children: "Yêu cầu sửa" }, "reject"));
  }
  if (s === "Cần sửa") {
    buttons.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => openSubmit("resubmit"), children: "Gửi lại hoàn thành" }, "resubmit"));
  }
  if (s === "Hoàn thành") {
    if (can("task.reopen_completed") || isSuperAdmin) {
      buttons.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => transition("task.reopen_completed", "Đang làm", "Mở lại task hoàn thành", {
        completedAt: void 0
      }), children: "Mở lại task" }, "reopen"));
    }
  }
  if (s === "Đã hủy") {
    if (can("task.restore") || isSuperAdmin) {
      buttons.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => transition("task.restore", "Mới tạo", "Khôi phục task", {
        cancelledAt: void 0
      }), children: "Khôi phục" }, "restore"));
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      buttons,
      canForce && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: (v) => transition("task.force_status", v, `Ép trạng thái → ${v}`, {}, void 0, true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[180px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Ép chuyển trạng thái…" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.filter((x) => x !== s).map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: st, children: st }, st)) })
      ] }),
      onClose && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: onClose, children: "Đóng" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: revOpen, onOpenChange: setRevOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Yêu cầu sửa task" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú yêu cầu sửa *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: revNote, onChange: (e) => setRevNote(e.target.value), rows: 4 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setRevOpen(false), children: "Huỷ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          if (!revNote.trim()) {
            toast.error("Vui lòng nhập ghi chú sửa.");
            return;
          }
          transition("task.request_revision", "Cần sửa", "Yêu cầu sửa", {
            revisionNote: revNote.trim(),
            revisions: (task.revisions ?? 0) + 1
          }, revNote.trim());
          setRevNote("");
          setRevOpen(false);
        }, children: "Gửi yêu cầu sửa" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!submitOpen, onOpenChange: (o) => !o && setSubmitOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: submitOpen === "resubmit" ? "Gửi lại hoàn thành task" : "Gửi hoàn thành task" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-2", children: "Bạn có thể gửi kèm ghi chú, link kết quả hoặc ảnh/file minh chứng nếu cần. Tất cả các trường đều không bắt buộc." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 max-h-[60vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú hoàn thành" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: sNote, onChange: (e) => setSNote(e.target.value), placeholder: "Tóm tắt kết quả, lưu ý khi bàn giao…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link kết quả" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: sResultLink, onChange: (e) => setSResultLink(e.target.value), placeholder: "https://…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link tài liệu liên quan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: sRelatedDoc, onChange: (e) => setSRelatedDoc(e.target.value), placeholder: "https://drive.google.com/…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "File/ảnh minh chứng (dán link)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: sFileName, onChange: (e) => setSFileName(e.target.value), placeholder: "Tên (tuỳ chọn)", className: "w-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: sFileUrl, onChange: (e) => setSFileUrl(e.target.value), placeholder: "https://…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => {
              if (!sFileUrl.trim()) return;
              setSFiles([...sFiles, {
                name: sFileName.trim(),
                url: sFileUrl.trim()
              }]);
              setSFileName("");
              setSFileUrl("");
            }, children: "Thêm" })
          ] }),
          sFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs space-y-1 mt-1", children: sFiles.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 rounded border px-2 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: f.url, target: "_blank", rel: "noreferrer", className: "text-primary underline truncate flex-1", children: f.name || f.url }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-destructive", onClick: () => setSFiles(sFiles.filter((_, j) => j !== i)), children: "Xoá" })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú thêm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: sExtraNote, onChange: (e) => setSExtraNote(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setSubmitOpen(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirmSubmit, children: "Xác nhận gửi hoàn thành" })
      ] })
    ] }) })
  ] });
}
function TaskDetailDialog({
  task,
  open,
  onOpenChange
}) {
  const {
    update
  } = useStore();
  const {
    can,
    isSuperAdmin
  } = useCurrentUser();
  const {
    brands
  } = useStore();
  if (!task) return null;
  const canHistory = isSuperAdmin || can("task.view_history");
  const brand = brands.find((b) => b.id === task.brandId);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: task.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: task.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: task.priority })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", children: "Thông tin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "docs", children: "Tài liệu" }),
        canHistory && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: "Lịch sử xử lý" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "space-y-3 text-sm", children: [
        task.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Mô tả" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: task.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thương hiệu", value: brand?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Module", value: task.module }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người giao", value: task.reporter }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người phụ trách", value: task.assignee }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người xác nhận", value: task.approver }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Deadline", value: fmtDate(task.deadline) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Plan", value: task.plan }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Topic", value: task.topic }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Số lần sửa", value: String(task.revisions ?? 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày tạo", value: fmtDate(task.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nhận việc", value: fmtDate(task.acceptedAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ngày gửi hoàn thành", value: fmtDate(task.submittedAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Người gửi hoàn thành", value: task.submittedBy }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Hoàn thành", value: fmtDate(task.completedAt) })
        ] }),
        task.status === "Chờ xác nhận" && (task.completionNote || task.resultLink || (task.completionFiles?.length ?? 0) > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-primary/30 bg-primary/5 p-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-primary", children: "Thông tin gửi hoàn thành" }),
          task.completionNote && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm whitespace-pre-wrap", children: task.completionNote }),
          task.resultLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
            "Kết quả: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: task.resultLink, target: "_blank", rel: "noreferrer", className: "text-primary underline break-all", children: task.resultLink })
          ] })
        ] }),
        task.revisionNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/30 bg-destructive/5 p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-destructive", children: "Ghi chú yêu cầu sửa gần nhất" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap text-sm mt-1", children: task.revisionNote })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowButtons, { task, onChange: (t) => update("tasks", t.id, t) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "docs", className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocRow, { label: "Tài liệu đầu vào", url: task.inputLink }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocRow, { label: "Link kết quả", url: task.resultLink }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilesRow, { label: "File/ảnh minh chứng", files: task.completionFiles }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocRow, { label: "File bàn giao", url: task.handoverLink }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocRow, { label: "Link tài liệu liên quan", url: task.relatedDocumentLink }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocRow, { label: "Link liên quan", url: task.link || task.relatedLink }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Ghi chú hoàn thành" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm whitespace-pre-wrap rounded border p-2 bg-muted/30", children: task.completionNote || "Chưa có" })
        ] })
      ] }),
      canHistory && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-h-[60vh] overflow-y-auto", children: [
        (task.history ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Chưa có lịch sử." }),
        (task.history ?? []).slice().reverse().map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: h.byName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: h.action }),
            h.fromStatus && h.toStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              h.fromStatus,
              " → ",
              h.toStatus
            ] }),
            h.forced && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: "(ép)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-muted-foreground", children: new Date(h.at).toLocaleString("vi-VN") })
          ] }),
          h.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-1 whitespace-pre-wrap", children: h.note })
        ] }, i))
      ] }) })
    ] })
  ] }) });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: value || "—" })
  ] });
}
function DocRow({
  label,
  url
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-40 shrink-0", children: label }),
    url ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noreferrer", className: "text-primary underline break-all flex-1", children: url }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noreferrer", children: "Mở link" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa có" })
  ] });
}
function FilesRow({
  label,
  files
}) {
  if (!files || files.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-40 shrink-0", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa có" })
    ] });
  }
  const isImg = (u) => /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(u);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-40 shrink-0 pt-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 flex-1", children: files.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 rounded border px-2 py-1", children: [
      isImg(f.url) && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: f.url, alt: f.name || "", className: "h-10 w-10 object-cover rounded", loading: "lazy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: f.url, target: "_blank", rel: "noreferrer", className: "text-primary underline truncate flex-1", children: f.name || f.url }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: f.url, target: "_blank", rel: "noreferrer", children: "Xem" }) })
    ] }, i)) })
  ] });
}
function TasksPage() {
  const {
    tasks,
    brands,
    add,
    update,
    remove
  } = useStore();
  const {
    user,
    can,
    scopeList,
    isSuperAdmin
  } = useCurrentUser();
  const canCreate = can("task.create");
  const canEdit = can("task.edit");
  const canDelete = can("task.delete");
  const canViewAll = isSuperAdmin || can("task.view_all");
  const [search, setSearch] = reactExports.useState("");
  const [fBrand, setFBrand] = reactExports.useState("all");
  const [fAssignee, setFAssignee] = reactExports.useState("all");
  const [fStatus, setFStatus] = reactExports.useState("all");
  const [fPriority, setFPriority] = reactExports.useState("all");
  const [fScope, setFScope] = reactExports.useState(canViewAll ? "all" : "mine");
  const [view, setView] = reactExports.useState("table");
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const [detailId, setDetailId] = reactExports.useState(() => readOpenParam("open"));
  const setDetail = (t) => {
    setDetailId(t?.id ?? null);
    syncOpenParam("open", t?.id ?? null);
  };
  const detail = detailId ? tasks.find((t) => t.id === detailId) ?? null : null;
  const ME = user?.fullName || user?.username || "";
  const isInvolved = (t) => !!ME && (t.assignee === ME || t.reporter === ME || t.approver === ME || (t.relatedPeople ?? []).includes(ME));
  const isCreatedByMe = (t) => !!ME && t.reporter === ME;
  const scopedTasks = reactExports.useMemo(() => scopeList(tasks, "task.view_all", "task.view_mine", isInvolved), [tasks, scopeList, ME]);
  const currentDetail = detail ? tasks.find((t) => t.id === detail.id) ?? detail : null;
  const filtered = reactExports.useMemo(() => {
    return scopedTasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (fBrand !== "all" && t.brandId !== fBrand) return false;
      if (fAssignee !== "all" && t.assignee !== fAssignee) return false;
      if (fStatus !== "all" && t.status !== fStatus) return false;
      if (fPriority !== "all" && t.priority !== fPriority) return false;
      if (fScope === "mine" && !isInvolved(t)) return false;
      if (fScope === "assigned" && !isCreatedByMe(t)) return false;
      if (fScope === "overdue" && !isOverdue(t.deadline, t.status)) return false;
      if (fScope === "done" && t.status !== "Hoàn thành") return false;
      return true;
    });
  }, [scopedTasks, search, fBrand, fAssignee, fStatus, fPriority, fScope, ME]);
  const assignees = reactExports.useMemo(() => Array.from(new Set(scopedTasks.map((t) => t.assignee).filter(Boolean))), [scopedTasks]);
  const guardedAdd = (t) => {
    if (!canCreate && !isSuperAdmin) {
      denyToast();
      return;
    }
    const created = appendHistory({
      ...t,
      createdAt: t.createdAt ?? todayISO()
    }, {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      byId: user?.id,
      byName: ME,
      action: "Tạo task",
      toStatus: t.status
    });
    add("tasks", created);
  };
  const guardedUpdate = (t) => {
    if (!canEdit && !isSuperAdmin) {
      denyToast();
      return;
    }
    update("tasks", t.id, t);
  };
  const guardedDelete = (id) => {
    if (!canDelete && !isSuperAdmin) {
      denyToast();
      return;
    }
    remove("tasks", id);
  };
  const scopeButtons = [{
    v: "all",
    l: "Tất cả task",
    show: canViewAll
  }, {
    v: "mine",
    l: "Việc của tôi",
    show: true
  }, {
    v: "assigned",
    l: "Việc tôi giao",
    show: true
  }, {
    v: "overdue",
    l: "Quá hạn",
    show: true
  }, {
    v: "done",
    l: "Hoàn thành",
    show: true
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Task To-do List", description: "Việc lẻ, việc nhanh, việc phát sinh hằng ngày — có workflow & phân quyền.", actions: canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: adding, onOpenChange: setAdding, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        "Thêm task"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo task mới" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TaskForm, { mode: "create", initial: {
          reporter: ME
        }, onSubmit: guardedAdd, onClose: () => setAdding(false) })
      ] })
    ] }) : void 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-4", children: [
      scopeButtons.filter((s) => s.show).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: fScope === s.v ? "default" : "outline", size: "sm", onClick: () => setFScope(s.v), children: s.l }, s.v)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto inline-flex rounded-md border bg-card p-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "table" ? "secondary" : "ghost", onClick: () => setView("table"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "h-4 w-4 mr-1" }),
          "Table"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: view === "kanban" ? "secondary" : "ghost", onClick: () => setView("kanban"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4 mr-1" }),
          "Kanban"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm kiếm...", value: search, onChange: (e) => setSearch(e.target.value), className: "max-w-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fBrand, onValueChange: setFBrand, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Thương hiệu" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả thương hiệu" }),
          brands.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.id, children: b.name }, b.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fAssignee, onValueChange: setFAssignee, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Người phụ trách" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả người" }),
          assignees.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: a }, a))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
          STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fPriority, onValueChange: setFPriority, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Ưu tiên" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả ưu tiên" }),
          PRIORITIES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] })
    ] }),
    view === "table" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Tên task" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Thương hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Phụ trách" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Deadline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Ưu tiên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-4 py-2.5", children: "Hành động" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }), title: tasks.length === 0 ? "Chưa có task" : "Không có task phù hợp bộ lọc", hint: tasks.length === 0 ? "Tạo task đầu tiên để bắt đầu quản lý công việc." : void 0, action: tasks.length === 0 && canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAdding(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
          "Tạo task đầu tiên"
        ] }) : void 0 }) }) }),
        filtered.map((t) => {
          const brand = brands.find((b) => b.id === t.brandId);
          const overdue = isOverdue(t.deadline, t.status);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-left hover:underline", onClick: () => setDetail(t), children: t.title }),
              (t.plan || t.topic || t.module) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                t.module && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  "Module: ",
                  t.module
                ] }),
                t.module && (t.plan || t.topic) && " · ",
                t.plan && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  "Plan: ",
                  t.plan
                ] }),
                t.plan && t.topic && " · ",
                t.topic && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  "Topic: ",
                  t.topic
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: brand?.name || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: t.assignee || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2.5 whitespace-nowrap ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`, children: fmtDate(t.deadline) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: t.priority }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: t.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDetail(t), title: "Xem", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(t), title: "Sửa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => guardedDelete(t.id), title: "Xóa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] }) })
          ] }, t.id);
        })
      ] })
    ] }) }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-4", children: STATUSES.map((status) => {
      const items = filtered.filter((t) => t.status === status);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/40 p-3 min-h-[120px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-3 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: items.length })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          items.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDetail(t), className: "block w-full text-left rounded-lg bg-card border p-3 hover:border-primary/40 transition-colors shadow-soft", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: t.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
              brands.find((b) => b.id === t.brandId)?.name || "—",
              " · ",
              t.assignee || "—"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: t.priority }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${isOverdue(t.deadline, t.status) ? "text-destructive font-medium" : "text-muted-foreground"}`, children: fmtDate(t.deadline) })
            ] })
          ] }, t.id)),
          items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center py-6", children: "Trống" })
        ] })
      ] }, status);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Chỉnh sửa task" }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx(TaskForm, { mode: "edit", initial: editing, onSubmit: guardedUpdate, onClose: () => setEditing(null) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TaskDetailDialog, { task: currentDetail, open: !!detail, onOpenChange: (o) => !o && setDetail(null) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "task.view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TasksPage, {}) });
export {
  SplitComponent as component
};
