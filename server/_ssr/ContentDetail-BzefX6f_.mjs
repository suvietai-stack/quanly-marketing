import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useStore, u as useCurrentUser, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, C as Card, o as CardContent, f as fmtDate, B as Button, E as DialogFooter, bf as todayISO, L as Label, I as Input, bk as CONTENT_STATUSES, bc as DialogDescription, bq as ORDER_TYPES, aU as ORDER_PRIORITIES, aX as uid } from "./router-CkmTURa-.mjs";
import { e as designCan } from "./design-BrHT-rw4.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { C as ContentForm } from "./ContentForm-CYy7twsa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useDesignCatalogs, D as DesignAssigneePicker } from "./DesignAssigneePicker-DC39EkqM.mjs";
import { D as DesignReviewerPicker } from "./DesignReviewerPicker-Cn1Hqf7M.mjs";
import { saveDesignOrder } from "./api-Bf_55NQ7.mjs";
import { aR as History, ag as ExternalLink, W as Palette, ao as Pencil, q as Check, at as ArrowRight, X, b4 as ShieldAlert } from "../_libs/lucide-react.mjs";
function suggestDeadline(publishDate) {
  if (!publishDate) return "";
  const d = new Date(publishDate);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
function DesignOrderFormFromContent({
  content,
  open,
  onClose
}) {
  const s = useStore();
  const { user, can } = useCurrentUser();
  const brand = s.brands.find((b) => b.id === content.brandId);
  const designCatalogs = useDesignCatalogs();
  const defaultCreator = user?.fullName || user?.username || "";
  const [title, setTitle] = reactExports.useState(`Ảnh cho bài: ${content.title}`);
  const [type, setType] = reactExports.useState("Ảnh bài web");
  const [priority, setPriority] = reactExports.useState("Trung bình");
  const [deadline, setDeadline] = reactExports.useState(
    suggestDeadline(content.publishDate) || content.deadline || ""
  );
  const [assignee, setAssignee] = reactExports.useState("");
  const [assigneeId, setAssigneeId] = reactExports.useState("");
  const [reviewerOverride, setReviewerOverride] = reactExports.useState(null);
  const reviewerId = reviewerOverride?.id || user?.id || "";
  const reviewer = reviewerOverride?.name || defaultCreator;
  reactExports.useEffect(() => {
    if (open) setReviewerOverride(null);
  }, [open, content.id]);
  const [brief, setBrief] = reactExports.useState(
    `Thiết kế/chọn ảnh minh họa phục vụ bài content web "${content.title}".
Yêu cầu: ảnh phù hợp nội dung bài, đúng nhận diện thương hiệu${brand?.name ? ` "${brand.name}"` : ""}, có thể dùng để đăng lên website.
Từ khoá chính: ${content.mainKeyword || "—"}`
  );
  const [size, setSize] = reactExports.useState("");
  const [quantity, setQuantity] = reactExports.useState(1);
  const [styleNote, setStyleNote] = reactExports.useState("");
  const [textInImage, setTextInImage] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [refLink, setRefLink] = reactExports.useState("");
  const [draftLink, setDraftLink] = reactExports.useState(content.draftLink || "");
  const [outlineLinkRef, setOutlineLinkRef] = reactExports.useState(content.outlineLink || "");
  const [saving, setSaving] = reactExports.useState(false);
  const handleSubmit = async () => {
    if (saving) return;
    if (!designCan(can, "marketing_design", "create")) {
      toast.error("Bạn không có quyền tạo Order thiết kế");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên order");
      return;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const composedBrief = brief + (textInImage.trim() ? `

Chữ cần đưa vào ảnh:
${textInImage}` : "") + (outlineLinkRef ? `

Link outline: ${outlineLinkRef}` : "") + (draftLink ? `
Link bài viết: ${draftLink}` : "");
    if (!assignee || !assigneeId) {
      toast.error("Bắt buộc chọn nhân viên Thiết kế thực hiện.");
      return;
    }
    if (!reviewerId) {
      toast.error("Cần chọn tài khoản người duyệt hợp lệ.");
      return;
    }
    if (reviewerId === assigneeId) {
      toast.error("Người duyệt phải khác người thực hiện.");
      return;
    }
    const categoryName = { "Banner website": "Banner Website", "Ảnh bài web": "Ảnh bài Web", "Ảnh social": "Ảnh Social", "Thumbnail video": "Thumbnail Video", "Ảnh sản phẩm": "Ảnh sản phẩm", "Catalogue / profile": "Catalogue / Profile", "Ảnh Google Map": "Ảnh Google Map" };
    const cat = designCatalogs.data?.find((c) => c.workflow_kind === "marketing_design" && c.kind === "work" && c.active && c.name === (categoryName[type] || "Khác"));
    if (!cat) {
      toast.error("Không tải được loại ấn phẩm phù hợp.");
      return;
    }
    const finalAssignee = assignee;
    const status = "Chờ nhận việc";
    const order = {
      id: uid(),
      title: title.trim(),
      brandId: content.brandId,
      type,
      workCategoryId: cat.id,
      workCategoryName: cat.name,
      source: "Web",
      sourceModule: "Content Web",
      workflowKind: "marketing_design",
      refLinkObject: content.title,
      requester: defaultCreator,
      assignee: finalAssignee,
      assigneeId: finalAssignee && assigneeId ? assigneeId : void 0,
      reviewer,
      reviewerId,
      deadline: deadline || void 0,
      priority,
      brief: composedBrief,
      styleNote: styleNote || void 0,
      size: size || void 0,
      quantity: quantity || void 0,
      refLink: refLink || void 0,
      notes: notes || void 0,
      status,
      contentId: content.id,
      history: [{
        at: now,
        byId: user?.id,
        byName: defaultCreator || "—",
        action: "Tạo order từ Content Web",
        toStatus: status
      }]
    };
    setSaving(true);
    try {
      if (content.designOrderId && s.orders.some((o) => o.id === content.designOrderId)) {
        toast.error("Bài viết đã có Order thiết kế");
        return;
      }
      await saveDesignOrder(order.id, order);
      await s.reload();
      s.update("webContents", content.id, { designOrderId: order.id, needsDesign: true });
      toast.success("Đã tạo order thiết kế và liên kết với bài content.");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tạo được Order");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tạo Order Thiết Kế từ Content Web" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Form đã tự điền sẵn thông tin liên quan đến bài content. Bạn có thể chỉnh sửa trước khi tạo." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "1. Thông tin order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên order *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thương hiệu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: brand?.name || "—", disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nguồn yêu cầu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: "Web", disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Module liên quan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: "Content Web", disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bài content liên quan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: content.title, disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: (v) => setType(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ORDER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mức ưu tiên" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: priority, onValueChange: (v) => setPriority(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ORDER_PRIORITIES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "2. Nội dung yêu cầu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Brief thiết kế" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 5, value: brief, onChange: (e) => setBrief(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kích thước" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: size, onChange: (e) => setSize(e.target.value), placeholder: "VD: 1200x630" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số lượng ảnh/file" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 1,
                value: quantity,
                onChange: (e) => setQuantity(Number(e.target.value) || 1)
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-lg border p-3 sm:p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Phong cách, ghi chú và tài liệu tham khảo (tùy chọn)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yêu cầu phong cách" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: styleNote,
                onChange: (e) => setStyleNote(e.target.value),
                placeholder: "Có thể mô tả trong Brief"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chữ cần đưa vào ảnh" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: textInImage, onChange: (e) => setTextInImage(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú nội bộ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: notes, onChange: (e) => setNotes(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bài viết" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draftLink, onChange: (e) => setDraftLink(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link outline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: outlineLinkRef, onChange: (e) => setOutlineLinkRef(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link tài nguyên tham khảo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: refLink, onChange: (e) => setRefLink(e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "3. Phân công & deadline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người tạo order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: defaultCreator, disabled: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DesignReviewerPicker,
              {
                valueId: reviewerId,
                valueName: reviewer,
                onChange: (name, id) => setReviewerOverride({ name, id }),
                assigneeId,
                disabled: saving,
                required: true
              }
            ),
            !reviewerOverride && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Mặc định là người tạo Order." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesignAssigneePicker, { flow: "marketing_design", value: assignee, valueId: assigneeId, onChange: (v, id) => {
            setAssignee(v || "");
            setAssigneeId(id || "");
          }, required: true, disabled: saving }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value) }),
            content.publishDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
              "Gợi ý: trước ngày đăng (",
              content.publishDate,
              ")."
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saving || !assigneeId || !reviewerId || reviewerId === assigneeId, onClick: handleSubmit, children: saving ? "Đang lưu…" : "Tạo order" })
    ] })
  ] }) });
}
function ActionButton({ children, onClick, variant = "default", disabled }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant, onClick, disabled, children });
}
function WorkflowActions({
  c,
  apply,
  canAct,
  can
}) {
  const [outlineLink, setOutlineLink] = reactExports.useState(c.outlineLink || "");
  const [draftLink, setDraftLink] = reactExports.useState(c.draftLink || "");
  const [imageLink, setImageLink] = reactExports.useState(c.imageLink || "");
  const [publishedLink, setPublishedLink] = reactExports.useState(c.publishedLink || "");
  const [publishedAt, setPublishedAt] = reactExports.useState(c.publishedAt || todayISO());
  const [webDraftLink, setWebDraftLink] = reactExports.useState(c.webDraftLink || "");
  const [reviewNote, setReviewNote] = reactExports.useState("");
  const NoPerm = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground italic", children: "Bạn không có quyền thực hiện hành động ở trạng thái này." });
  switch (c.status) {
    case "Kế hoạch":
      return canAct("web.content_assign") ? /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({ to: "Đã giao", action: "Giao bài" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
        "Giao bài"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Đã giao":
      return canAct("web.outline_start", true) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({ to: "Đang làm outline", action: "Bắt đầu làm outline" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
        "Bắt đầu làm outline"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Đang làm outline":
      return canAct("web.outline_submit", true) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Link outline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: outlineLink, onChange: (e) => setOutlineLink(e.target.value), placeholder: "https://..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !outlineLink.trim(),
              onClick: () => apply({ to: "Chờ duyệt outline", action: "Gửi duyệt outline", extra: { outlineLink } }),
              children: "Gửi duyệt outline"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Chờ duyệt outline": {
      const canApprove = canAct("web.outline_approve");
      const canReject = canAct("web.outline_reject");
      if (!canApprove && !canReject) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({ to: "Outline đã duyệt", action: "Duyệt outline", extra: { outlineReviewNotes: void 0 } }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
            "Duyệt outline"
          ] }),
          canReject && /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { variant: "destructive", onClick: () => {
            if (!reviewNote.trim()) {
              toast.error("Vui lòng nhập ghi chú yêu cầu sửa.");
              return;
            }
            apply({
              to: "Cần sửa outline",
              action: "Yêu cầu sửa outline",
              note: reviewNote,
              extra: {
                outlineReviewNotes: reviewNote,
                outlineRevisions: (c.outlineRevisions || 0) + 1
              }
            });
            setReviewNote("");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
            "Yêu cầu sửa outline"
          ] })
        ] }),
        canReject && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Ghi chú yêu cầu sửa outline (bắt buộc nếu yêu cầu sửa)...", value: reviewNote, onChange: (e) => setReviewNote(e.target.value) })
      ] });
    }
    case "Cần sửa outline":
      return canAct("web.outline_resubmit", true) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        c.outlineReviewNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-destructive mb-1", children: [
            "Yêu cầu sửa outline (lần ",
            c.outlineRevisions,
            "):"
          ] }),
          c.outlineReviewNotes
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cập nhật link outline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: outlineLink, onChange: (e) => setOutlineLink(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => apply({ to: "Chờ duyệt outline", action: "Gửi duyệt lại outline", extra: { outlineLink } }), children: "Gửi duyệt lại outline" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Outline đã duyệt":
      return canAct("web.post_write_start", true) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({ to: "Đang viết bài", action: "Bắt đầu viết bài" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
        "Bắt đầu viết bài"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Đang viết bài":
      return canAct("web.post_submit", true) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Link bài viết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draftLink, onChange: (e) => setDraftLink(e.target.value), placeholder: "https://..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Link ảnh (nếu có)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: imageLink, onChange: (e) => setImageLink(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !draftLink.trim(), onClick: () => apply({ to: "Chờ duyệt bài", action: "Gửi duyệt bài", extra: { draftLink, imageLink } }), children: "Gửi duyệt bài" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Chờ duyệt bài": {
      const canApprove = canAct("web.post_approve");
      const canReject = canAct("web.post_reject");
      if (!canApprove && !canReject) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({ to: "Bài viết đã duyệt", action: "Duyệt bài", extra: { draftReviewNotes: void 0 } }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
            "Duyệt bài"
          ] }),
          canReject && /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { variant: "destructive", onClick: () => {
            if (!reviewNote.trim()) {
              toast.error("Vui lòng nhập ghi chú yêu cầu sửa.");
              return;
            }
            apply({
              to: "Cần sửa bài",
              action: "Yêu cầu sửa bài",
              note: reviewNote,
              extra: {
                draftReviewNotes: reviewNote,
                draftRevisions: (c.draftRevisions || 0) + 1
              }
            });
            setReviewNote("");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
            "Yêu cầu sửa bài"
          ] })
        ] }),
        canReject && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Ghi chú yêu cầu sửa bài...", value: reviewNote, onChange: (e) => setReviewNote(e.target.value) })
      ] });
    }
    case "Cần sửa bài":
      return canAct("web.post_resubmit", true) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        c.draftReviewNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-destructive mb-1", children: [
            "Yêu cầu sửa bài (lần ",
            c.draftRevisions,
            "):"
          ] }),
          c.draftReviewNotes
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cập nhật link bài viết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draftLink, onChange: (e) => setDraftLink(e.target.value) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => apply({ to: "Chờ duyệt bài", action: "Gửi duyệt lại bài", extra: { draftLink } }), children: "Gửi duyệt lại bài" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Bài viết đã duyệt":
      return canAct("web.start_web_draft_layout") ? /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({ to: "Đang trình bày nháp web", action: "Bắt đầu trình bày nháp web" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
        "Bắt đầu trình bày nháp web"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Đang trình bày nháp web": {
      const canEditUrl = can("web.edit_web_draft_url");
      const canSubmit = canAct("web.submit_web_draft_review");
      if (!canSubmit && !canEditUrl) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Link bản nháp web" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: webDraftLink,
            onChange: (e) => setWebDraftLink(e.target.value),
            placeholder: "https://... (URL preview/draft)",
            readOnly: !canEditUrl,
            disabled: !canEditUrl
          }
        ),
        canSubmit && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !webDraftLink.trim(),
            onClick: () => apply({
              to: "Chờ duyệt bản nháp web",
              action: "Gửi duyệt bản nháp web",
              extra: { webDraftLink, webDraftSubmittedAt: (/* @__PURE__ */ new Date()).toISOString() }
            }),
            children: "Gửi duyệt bản nháp web"
          }
        )
      ] });
    }
    case "Chờ duyệt bản nháp web": {
      const canApprove = canAct("web.approve_web_draft");
      const canReject = canAct("web.request_web_draft_revision");
      if (!canApprove && !canReject) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        c.webDraftLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
          "Bản nháp:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.webDraftLink, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1", children: [
            c.webDraftLink,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({
            to: "Bản nháp web đã duyệt",
            action: "Duyệt bản nháp web",
            extra: { webDraftReviewNotes: void 0, webDraftApprovedAt: (/* @__PURE__ */ new Date()).toISOString() }
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
            "Duyệt bản nháp web"
          ] }),
          canReject && /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { variant: "destructive", onClick: () => {
            if (!reviewNote.trim()) {
              toast.error("Vui lòng nhập ghi chú yêu cầu sửa.");
              return;
            }
            apply({
              to: "Cần sửa bản nháp web",
              action: "Yêu cầu sửa bản nháp web",
              note: reviewNote,
              extra: {
                webDraftReviewNotes: reviewNote,
                webDraftRevisions: (c.webDraftRevisions || 0) + 1
              }
            });
            setReviewNote("");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
            "Yêu cầu sửa bản nháp web"
          ] })
        ] }),
        canReject && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Ghi chú yêu cầu sửa bản nháp web (bắt buộc)...", value: reviewNote, onChange: (e) => setReviewNote(e.target.value) })
      ] });
    }
    case "Cần sửa bản nháp web":
      return canAct("web.resubmit_web_draft_review") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        c.webDraftReviewNotes && can("web.view_web_draft_revision_note") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-destructive mb-1", children: [
            "Yêu cầu sửa bản nháp web (lần ",
            c.webDraftRevisions,
            "):"
          ] }),
          c.webDraftReviewNotes
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cập nhật link bản nháp web" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: webDraftLink,
            onChange: (e) => setWebDraftLink(e.target.value),
            readOnly: !can("web.edit_web_draft_url"),
            disabled: !can("web.edit_web_draft_url")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !webDraftLink.trim(),
            onClick: () => apply({
              to: "Chờ duyệt bản nháp web",
              action: "Gửi duyệt lại bản nháp web",
              extra: { webDraftLink, webDraftSubmittedAt: (/* @__PURE__ */ new Date()).toISOString() }
            }),
            children: "Gửi duyệt lại bản nháp web"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Bản nháp web đã duyệt":
      return canAct("web.move_pending_publish") ? /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: () => apply({ to: "Chờ đăng web", action: "Chuyển sang chờ đăng" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
        "Chuyển sang chờ đăng"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Chờ đăng web":
      return canAct("web.publish") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Link bài đã đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: publishedLink, onChange: (e) => setPublishedLink(e.target.value), placeholder: "https://..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Ngày đăng thực tế" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: publishedAt, onChange: (e) => setPublishedAt(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !publishedLink.trim(), onClick: () => apply({ to: "Đã đăng web", action: "Xác nhận đã đăng web", extra: { publishedLink, publishedAt } }), children: "Xác nhận đã đăng" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Đã đăng web":
      return canAct("web.update_index") ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Trạng thái index" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.indexStatus, onValueChange: (v) => apply({ to: c.status, action: `Cập nhật index: ${v}`, extra: { indexStatus: v } }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => apply({ to: "Kiểm tra index", action: "Chuyển sang kiểm tra index" }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
          "Chuyển sang kiểm tra index"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
    case "Kiểm tra index": {
      const canIndex = canAct("web.update_index");
      const canComplete = canAct("web.complete");
      if (!canIndex && !canComplete) return /* @__PURE__ */ jsxRuntimeExports.jsx(NoPerm, {});
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        canIndex && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Trạng thái index" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.indexStatus, onValueChange: (v) => apply({ to: c.status, action: `Cập nhật index: ${v}`, extra: { indexStatus: v } }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Ghi chú index...", defaultValue: c.indexNotes || "", onBlur: (e) => {
            if (e.target.value !== (c.indexNotes || "")) apply({ to: c.status, action: "Cập nhật ghi chú index", note: e.target.value, extra: { indexNotes: e.target.value } });
          } })
        ] }),
        canComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => apply({ to: "Hoàn thành", action: "Hoàn thành content web", extra: { completedAt: todayISO() } }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
          "Hoàn thành"
        ] })
      ] });
    }
    case "Hoàn thành":
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-success/10 border border-success/30 p-3 text-sm text-success font-medium", children: [
        "Bài đã hoàn thành",
        c.completedAt ? ` ngày ${fmtDate(c.completedAt)}` : "",
        "."
      ] });
  }
}
function ForceStatusPanel({
  c,
  apply
}) {
  const [target, setTarget] = reactExports.useState(c.status);
  const [reason, setReason] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-warning/40 bg-warning/5 p-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-warning-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-warning" }),
      "Ép chuyển trạng thái (Admin)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Trạng thái mới" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: target, onValueChange: (v) => setTarget(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONTENT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Lý do (bắt buộc)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Lý do ép chuyển..." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        size: "sm",
        variant: "outline",
        onClick: () => {
          if (!reason.trim()) {
            toast.error("Vui lòng nhập lý do ép chuyển.");
            return;
          }
          if (target === c.status) {
            toast.error("Trạng thái mới phải khác trạng thái hiện tại.");
            return;
          }
          apply({ to: target, action: "Ép chuyển trạng thái", note: reason, forced: true });
          setReason("");
        },
        children: "Ép chuyển"
      }
    )
  ] });
}
function HistoryList({ history }) {
  if (!history || history.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Chưa có lịch sử xử lý." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [...history].reverse().map((h, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-card p-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium flex items-center gap-2", children: [
        h.forced && /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5 text-warning" }),
        h.byName || "—",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
          "· ",
          h.action
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(h.at).toLocaleString("vi-VN") })
    ] }),
    (h.fromStatus || h.toStatus) && h.fromStatus !== h.toStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: h.fromStatus || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: h.toStatus || "—" })
    ] }),
    h.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded bg-muted/50 px-2 py-1 text-xs whitespace-pre-wrap", children: h.note })
  ] }, idx)) });
}
function isWriterOwned(c, currentName) {
  if (!currentName) return false;
  return !!c.writer && c.writer.trim() === currentName.trim();
}
function ContentDetail({
  content,
  open,
  onClose
}) {
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const [editing, setEditing] = reactExports.useState(false);
  const [orderFormOpen, setOrderFormOpen] = reactExports.useState(false);
  if (!content) return null;
  const c = s.webContents.find((x) => x.id === content.id) || content;
  const website = s.websites.find((w) => w.id === c.websiteId);
  const brand = s.brands.find((b) => b.id === c.brandId);
  const linkedOrders = s.orders.filter((o) => o.contentId === c.id || c.designOrderId && o.id === c.designOrderId);
  const writerOwned = isWriterOwned(c, user?.fullName) || isWriterOwned(c, user?.username);
  const canAct = (perm, writerDefault = false) => {
    if (isAdmin) return true;
    if (can(perm)) return true;
    if (writerDefault && writerOwned) return true;
    return false;
  };
  const apply = (t) => {
    const fromStatus = c.status;
    const entry = {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      byId: user?.id,
      byName: user?.fullName || user?.username || "—",
      action: t.action,
      fromStatus,
      toStatus: t.to,
      note: t.note,
      forced: t.forced
    };
    const history = [...c.history || [], entry];
    s.update("webContents", c.id, {
      status: t.to,
      ...t.extra || {},
      history
    });
  };
  const cancelContent = () => {
    if (!can("web.content_cancel")) {
      toast.error("Bạn không có quyền hủy Content Web");
      return;
    }
    if (!confirm(`Hủy bài "${c.title}"? Hành động này sẽ xóa bài khỏi danh sách.`)) return;
    s.remove("webContents", c.id);
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => !o && (setEditing(false), onClose()), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "content-mobile-dialog max-w-4xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: c.indexStatus })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          website?.name,
          " · ",
          brand?.name,
          " · ",
          c.type
        ] })
      ] }),
      editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        ContentForm,
        {
          initial: c,
          websiteId: c.websiteId,
          brandId: c.brandId,
          onSubmit: (updated) => s.update("webContents", c.id, updated),
          onClose: () => setEditing(false)
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "workflow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "workflow", children: "Workflow" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", children: "Thông tin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "links", children: "Tài liệu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "history", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5 mr-1" }),
            "Lịch sử"
          ] }),
          c.type === "Bài tối ưu lại" && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "optimize", children: "Tối ưu" }),
          (c.optimizeHistory?.length || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "opt-history", children: "Lịch sử tối ưu" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "workflow", className: "mt-3 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2", children: "Hành động tiếp theo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowActions, { c, apply, canAct, can }) }) })
          ] }),
          can("web.force_status") && c.status !== "Hoàn thành" && /* @__PURE__ */ jsxRuntimeExports.jsx(ForceStatusPanel, { c, apply }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người viết", v: c.writer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người duyệt outline", v: c.outlineReviewer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người duyệt bài", v: c.draftReviewer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người đăng", v: c.publisher }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người trình bày nháp web", v: c.webDraftLayoutBy || c.publisher }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người duyệt bản nháp web", v: c.webDraftReviewer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Deadline outline", v: fmtDate(c.outlineDeadline) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Deadline bài viết", v: fmtDate(c.deadline) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Số lần sửa outline", v: c.outlineRevisions || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Số lần sửa bài", v: c.draftRevisions || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Số lần sửa nháp web", v: c.webDraftRevisions || 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Ngày gửi duyệt nháp web", v: c.webDraftSubmittedAt ? new Date(c.webDraftSubmittedAt).toLocaleString("vi-VN") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Ngày duyệt nháp web", v: c.webDraftApprovedAt ? new Date(c.webDraftApprovedAt).toLocaleString("vi-VN") : "—" })
          ] }),
          c.outlineReviewNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-warning/30 bg-warning/5 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold mb-1", children: "Ghi chú sửa outline gần nhất" }),
            c.outlineReviewNotes
          ] }),
          c.draftReviewNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-warning/30 bg-warning/5 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold mb-1", children: "Ghi chú sửa bài gần nhất" }),
            c.draftReviewNotes
          ] }),
          c.webDraftReviewNotes && can("web.view_web_draft_revision_note") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-warning/30 bg-warning/5 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold mb-1", children: "Ghi chú sửa bản nháp web gần nhất" }),
            c.webDraftReviewNotes
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Loại bài", v: c.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Search intent", v: c.searchIntent }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Cụm chủ đề", v: c.cluster }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "URL dự kiến", v: c.url }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Từ khóa chính", v: c.mainKeyword }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Từ khóa phụ", v: c.subKeywords }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Ngày dự kiến đăng", v: fmtDate(c.publishDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Ngày đăng thực tế", v: fmtDate(c.publishedAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Plan", v: c.plan }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Topic", v: c.topic }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Người giao việc", v: c.assigner }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Hoàn thành", v: fmtDate(c.completedAt) })
          ] }),
          c.brief && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground mb-1", children: "Brief" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap", children: c.brief })
          ] }),
          c.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground mb-1", children: "Ghi chú" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap", children: c.notes })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "links", className: "mt-3 space-y-3", children: [
          [
            { label: "Outline", v: c.outlineLink },
            { label: "Bài viết", v: c.draftLink },
            { label: "Ảnh", v: c.imageLink },
            { label: "Bản nháp web", v: can("web.view_web_draft_url") ? c.webDraftLink : void 0 },
            { label: "Bài đã đăng", v: c.publishedLink },
            { label: "Bài cũ (tối ưu)", v: c.oldLink }
          ].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border bg-card px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: l.label }),
            l.v ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: l.v, target: "_blank", rel: "noreferrer", className: "text-sm text-primary inline-flex items-center gap-1 hover:underline", children: [
              "Mở ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Chưa có" })
          ] }, l.label)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-card px-3 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Order thiết kế" }),
              designCan(can, "marketing_design", "create") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setOrderFormOpen(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4" }),
                "Tạo Order Thiết Kế"
              ] })
            ] }),
            linkedOrders.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: linkedOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: o.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex flex-wrap gap-2 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: o.status }),
                  o.assignee && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "· PT: ",
                    o.assignee
                  ] }),
                  o.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "· DL: ",
                    fmtDate(o.deadline)
                  ] }),
                  o.deliverLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: o.deliverLink, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1", children: [
                    "File bàn giao ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/orders?open=${o.id}`, children: "Mở order" }) })
            ] }, o.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: designCan(can, "marketing_design", "create") ? "Chưa có order thiết kế nào liên kết." : "Chưa có order thiết kế và bạn không được cấp quyền tạo order." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryList, { history: c.history }) }),
        c.type === "Bài tối ưu lại" && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "optimize", className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Lý do tối ưu", v: c.optimizeReason }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Mục tiêu tối ưu", v: c.optimizeGoal }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRow, { k: "Link bài cũ", v: c.oldLink ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: c.oldLink, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline", children: "Mở" }) : "—" })
          ] }),
          c.optimizeNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap", children: c.optimizeNotes })
        ] }),
        (c.optimizeHistory?.length || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "opt-history", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: (c.optimizeHistory || []).slice().reverse().map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-card px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
              h.optimizeTitle || "Bài tối ưu",
              h.optimizeReason ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-2", children: [
                "· ",
                h.optimizeReason
              ] }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Hoàn thành: ",
              fmtDate(h.completedAt)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground", children: [
            h.writer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Người phụ trách: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: h.writer })
            ] }),
            h.optimizeReviewer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Người duyệt: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: h.optimizeReviewer })
            ] }),
            h.optimizeSource && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Nguồn: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: h.optimizeSource })
            ] }),
            h.recurringPeriod && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Chu kỳ: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: h.recurringPeriod })
            ] }),
            h.nextOptimizeAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Lần tối ưu kế tiếp: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: fmtDate(h.nextOptimizeAt) })
            ] }),
            typeof h.continueTracking === "boolean" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Tiếp tục theo dõi: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: h.continueTracking ? "Có" : "Tạm dừng" })
            ] })
          ] }),
          h.optimizeTargetsActual && h.optimizeTargetsActual.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hạng mục đã tối ưu: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: h.optimizeTargetsActual.join(", ") })
          ] }),
          h.resultLink && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: h.resultLink, target: "_blank", rel: "noreferrer", className: "text-primary inline-flex items-center gap-1 hover:underline", children: [
            "Mở bài sau cập nhật ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
          ] }) }),
          h.resultNote && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded bg-muted/50 px-2 py-1 text-xs whitespace-pre-wrap", children: h.resultNote })
        ] }, i)) }) })
      ] }),
      !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        can("web.content_cancel") && c.status !== "Hoàn thành" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: cancelContent, children: "Hủy bài" }),
        can("web.content_delete") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => s.remove("webContents", c.id), children: "Xoá" }),
        can("web.content_edit") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setEditing(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
          "Chỉnh sửa"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Đóng" })
      ] })
    ] }),
    orderFormOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DesignOrderFormFromContent,
      {
        content: c,
        open: orderFormOpen,
        onClose: () => setOrderFormOpen(false)
      }
    )
  ] });
}
function FieldRow({ k, v }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right text-sm", children: v ?? "—" })
  ] });
}
export {
  ContentDetail as C
};
