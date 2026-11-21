import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, E as DialogFooter, B as Button, b as useStore, u as useCurrentUser, L as Label, bL as SOCIAL_STATUSES, I as Input, f as fmtDate, aX as uid, bM as SOCIAL_CONTENT_TYPES } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { S as SpecialtyStaffPicker } from "./SpecialtyStaffPicker-Bm4W_zzR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { aR as History, aJ as Play, ad as Send, q as Check, ab as RotateCcw, d as CheckCheck, bf as Undo2, X, aV as TriangleAlert } from "../_libs/lucide-react.mjs";
function makeEmptyPost(channel) {
  return {
    id: uid(),
    title: "",
    brandId: channel.brandId,
    channelId: channel.id,
    platform: channel.platform,
    contentType: "Bài ảnh đơn",
    status: "Kế hoạch",
    revisions: 0,
    history: []
  };
}
function InfoFields({ value, onChange }) {
  const { people, plans, topics } = useStore();
  const set = (x) => onChange({ ...value, ...x });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên bài đăng *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.title, onChange: (e) => set({ title: e.target.value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại nội dung" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.contentType, onValueChange: (v) => set({ contentType: v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SOCIAL_CONTENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chủ đề triển khai" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.topic || "_", onValueChange: (v) => set({ topic: v === "_" ? void 0 : v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
          topics.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan liên quan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.plan || "_", onValueChange: (v) => set({ plan: v === "_" ? void 0 : v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
          plans.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người viết" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SpecialtyStaffPicker, { specialty: "social", value: value.writer, valueId: value.writerId, onChange: (v, id) => set({ writer: v, writerId: id }), people })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người duyệt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.reviewer || "_", onValueChange: (v) => set({ reviewer: v === "_" ? void 0 : v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
          people.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x.name, children: x.name }, x.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người đăng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value.publisher || "_", onValueChange: (v) => set({ publisher: v === "_" ? void 0 : v }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
          people.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x.name, children: x.name }, x.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thiết kế / Video" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SpecialtyStaffPicker, { specialty: "design", value: value.designer, valueId: value.designerId, onChange: (v, id) => set({ designer: v, designerId: id }), people })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày dự kiến đăng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: value.scheduledDate || "", onChange: (e) => set({ scheduledDate: e.target.value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày đăng thực tế" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: value.publishedDate || "", onChange: (e) => set({ publishedDate: e.target.value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Caption / Nội dung" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: value.caption || "", onChange: (e) => set({ caption: e.target.value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: value.notes || "", onChange: (e) => set({ notes: e.target.value }) })
    ] })
  ] });
}
function DocsFields({ value, onChange }) {
  const set = (x) => onChange({ ...value, ...x });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link ảnh / video" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.mediaLink || "", onChange: (e) => set({ mediaLink: e.target.value }), placeholder: "https://drive.google.com/..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bài đã đăng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value.publishedLink || "", onChange: (e) => set({ publishedLink: e.target.value }), placeholder: "https://facebook.com/..." })
    ] })
  ] });
}
function PostFormFields({ value, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[60vh] overflow-y-auto pr-1 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(InfoFields, { value, onChange }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DocsFields, { value, onChange })
  ] });
}
function PostFormDialog({
  open,
  onOpenChange,
  channel,
  initial,
  onSubmit
}) {
  const [p, setP] = reactExports.useState(initial ?? makeEmptyPost(channel));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Chỉnh sửa bài social" : `Tạo bài cho ${channel.name}` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PostFormFields, { value: p, onChange: setP }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (!p.title) {
          toast.error("Nhập tên bài đăng");
          return;
        }
        onSubmit({ ...p, channelId: channel.id, brandId: channel.brandId, platform: channel.platform });
        onOpenChange(false);
      }, children: "Lưu" })
    ] })
  ] }) });
}
function PostDetailDialog({
  open,
  onOpenChange,
  channel,
  post
}) {
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const [draft, setDraft] = reactExports.useState(post);
  const [reviewNote, setReviewNote] = reactExports.useState("");
  const [forceTo, setForceTo] = reactExports.useState(post.status);
  const [forceReason, setForceReason] = reactExports.useState("");
  const userName = user?.fullName || user?.username || "Hệ thống";
  const isWriter = !!user && post.writer === userName;
  const canAct = (perm, byWriter = false) => isAdmin || can(perm) || byWriter && isWriter;
  function pushHistory(entry) {
    const history = [...post.history || [], {
      ...entry,
      at: (/* @__PURE__ */ new Date()).toISOString(),
      byId: user?.id,
      byName: userName
    }];
    return history;
  }
  function transition(toStatus, action, opts) {
    const history = pushHistory({
      action,
      fromStatus: post.status,
      toStatus,
      note: opts?.note,
      forced: opts?.forced
    });
    const patch = {
      status: toStatus,
      history,
      reviewNotes: opts?.note ?? post.reviewNotes,
      ...opts?.bumpRevisions ? { revisions: (post.revisions || 0) + 1 } : {},
      ...opts?.extra || {}
    };
    s.update("socialPosts", post.id, patch);
    toast.success(action);
    onOpenChange(false);
  }
  function saveDraft() {
    s.update("socialPosts", post.id, {
      title: draft.title,
      contentType: draft.contentType,
      topic: draft.topic,
      plan: draft.plan,
      writer: draft.writer,
      reviewer: draft.reviewer,
      publisher: draft.publisher,
      designer: draft.designer,
      scheduledDate: draft.scheduledDate,
      publishedDate: draft.publishedDate,
      caption: draft.caption,
      mediaLink: draft.mediaLink,
      publishedLink: draft.publishedLink,
      notes: draft.notes
    });
    toast.success("Đã lưu thay đổi");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: post.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: post.status }),
      !!post.revisions && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Sửa ",
        post.revisions,
        " lần"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "workflow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "workflow", children: "Workflow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", children: "Thông tin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "docs", children: "Tài liệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "history", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5 mr-1" }),
          "Lịch sử xử lý"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[60vh] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoFields, { value: draft, onChange: setDraft }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveDraft, variant: "outline", children: "Lưu thay đổi" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "docs", className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DocsFields, { value: draft, onChange: setDraft }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveDraft, variant: "outline", children: "Lưu tài liệu" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "workflow", className: "mt-3 space-y-4", children: [
        (post.status === "Chờ duyệt" || post.status === "Đang làm" || post.status === "Cần sửa") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú duyệt / sửa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: reviewNote, onChange: (e) => setReviewNote(e.target.value), placeholder: "Ghi chú gửi cho người liên quan..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          post.status === "Kế hoạch" && canAct("social.post_start", true) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => transition("Đang làm", "Bắt đầu làm bài"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 mr-1" }),
            "Bắt đầu làm"
          ] }),
          post.status === "Đang làm" && canAct("social.post_submit", true) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => transition("Chờ duyệt", "Gửi duyệt", { note: reviewNote }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-1" }),
            "Gửi duyệt"
          ] }),
          post.status === "Chờ duyệt" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            canAct("social.post_approve") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => transition("Đã duyệt", "Duyệt bài", { note: reviewNote }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1" }),
              "Duyệt bài"
            ] }),
            canAct("social.post_request_changes") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
              if (!reviewNote.trim()) {
                toast.error("Nhập ghi chú yêu cầu sửa");
                return;
              }
              transition("Cần sửa", "Yêu cầu sửa bài", { note: reviewNote });
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 mr-1" }),
              "Yêu cầu sửa"
            ] })
          ] }),
          post.status === "Cần sửa" && canAct("social.post_resubmit", true) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => transition("Chờ duyệt", "Gửi duyệt lại", { note: reviewNote, bumpRevisions: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-1" }),
            "Gửi duyệt lại"
          ] }),
          post.status === "Đã duyệt" && canAct("social.post_move_pending_publish") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => transition("Chờ đăng", "Chuyển sang chờ đăng"), children: "Chuyển sang chờ đăng" }),
          post.status === "Chờ đăng" && canAct("social.post_confirm_published") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
            if (!draft.publishedLink) {
              toast.error("Nhập link bài đã đăng trước");
              return;
            }
            saveDraft();
            transition("Đã đăng", "Xác nhận đã đăng", {
              extra: {
                publishedDate: draft.publishedDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                publishedLink: draft.publishedLink
              }
            });
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-4 w-4 mr-1" }),
            "Xác nhận đã đăng"
          ] }),
          post.status === "Đã đăng" && canAct("social.post_complete") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => transition("Hoàn thành", "Hoàn thành bài"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1" }),
            "Hoàn thành"
          ] }),
          post.status === "Đã hủy" && canAct("social.post_restore") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => transition("Kế hoạch", "Khôi phục bài đã hủy"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4 mr-1" }),
            "Khôi phục"
          ] }),
          post.status !== "Đã hủy" && post.status !== "Hoàn thành" && canAct("social.post_cancel") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => {
            const earlyStages = post.status === "Kế hoạch" || post.status === "Đang làm";
            if (!earlyStages && !reviewNote.trim()) {
              toast.error("Nhập lý do hủy");
              return;
            }
            transition("Đã hủy", "Hủy bài", { note: reviewNote });
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
            "Hủy bài"
          ] })
        ] }),
        canAct("social.post_force_status") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
            "Ép chuyển trạng thái (chỉ dùng khi cần)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: forceTo, onValueChange: (v) => setForceTo(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SOCIAL_STATUSES.map((s2) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s2, children: s2 }, s2)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "flex-1 min-w-[200px]", placeholder: "Lý do bắt buộc...", value: forceReason, onChange: (e) => setForceReason(e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => {
              if (!forceReason.trim()) {
                toast.error("Nhập lý do ép trạng thái");
                return;
              }
              if (forceTo === post.status) {
                toast.error("Trạng thái không thay đổi");
                return;
              }
              transition(forceTo, `Ép chuyển sang "${forceTo}"`, { note: forceReason, forced: true });
            }, children: "Ép chuyển" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "mt-3", children: (post.history || []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-8", children: "Chưa có lịch sử xử lý." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-[60vh] overflow-y-auto", children: [...post.history || []].reverse().map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: h.byName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "— ",
            h.action
          ] }),
          h.forced && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-destructive/15 text-destructive", children: "Ép" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-muted-foreground", children: fmtDate(h.at) })
        ] }),
        (h.fromStatus || h.toStatus) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
          h.fromStatus || "—",
          " → ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: h.toStatus || "—" })
        ] }),
        h.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm", children: h.note })
      ] }, i)) }) })
    ] })
  ] }) });
}
export {
  PostFormDialog as P,
  PostDetailDialog as a
};
