import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useStore, aX as uid, L as Label, I as Input, bl as CONTENT_TYPES, bn as SEARCH_INTENTS, bk as CONTENT_STATUSES, T as Switch, bo as INDEX_STATUSES, bp as OPTIMIZE_REASONS, E as DialogFooter, B as Button, bf as todayISO, u as useCurrentUser, C as Card, o as CardContent, f as fmtDate, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as SpecialtyStaffPicker } from "./SpecialtyStaffPicker-Bm4W_zzR.mjs";
import { a6 as Plus, f as Search, ag as ExternalLink, bb as Lock, ao as Pencil, ap as Trash2 } from "../_libs/lucide-react.mjs";
function KeywordResearchTab({ websiteId }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreate = can("web.keyword_topic_create");
  const canEdit = can("web.keyword_topic_edit");
  const canDelete = can("web.keyword_topic_delete");
  const canOpenSheet = can("web.keyword_open_sheet");
  const list = s.webTopics.filter((t) => t.websiteId === websiteId);
  const [editing, setEditing] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const filtered = list.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.mainKeyword || "").toLowerCase().includes(q);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        "Tab nguồn quản lý ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Topic" }),
        " cho dự án web. Các tab khác (Sản xuất Content, Bài đã đăng, Backlink, Check TOP, Tối ưu lại) sẽ chọn Topic từ danh sách này."
      ] }),
      canCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAdding(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Thêm Topic"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          className: "pl-8",
          placeholder: "Tìm Topic / từ khóa chủ đề...",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5 w-[28%]", children: "Topic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5 w-[28%]", children: "Từ khóa chủ đề" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5", children: "Link Sheet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2.5 whitespace-nowrap", children: "Ngày cập nhật" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2.5 w-[100px]", children: "Thao tác" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-12 text-center text-muted-foreground", children: canCreate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Chưa có Topic nào. Bấm ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Thêm Topic" }),
          " để tạo Topic đầu tiên cho dự án web này."
        ] }) : "Chưa có Topic nào và bạn không được cấp quyền tạo Topic." }) }),
        filtered.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 font-medium", children: t.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-muted-foreground", children: t.mainKeyword || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: t.sheetLink ? canOpenSheet ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: t.sheetLink, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1 text-xs", children: [
            "Mở Sheet ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", title: "Không có quyền mở Sheet", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
            " Có Sheet"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-muted-foreground text-xs", children: fmtDate(t.updatedAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 text-right whitespace-nowrap", children: [
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(t), title: "Sửa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => {
                  if (confirm(`Xóa Topic "${t.name}"?
Lưu ý: các bài content / backlink đang dùng topic này sẽ vẫn giữ tên topic cũ.`))
                    s.remove("webTopics", t.id);
                },
                title: "Xóa",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
              }
            ),
            !canEdit && !canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: "Chỉ xem" })
          ] })
        ] }, t.id))
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TopicDialog,
      {
        open: adding || !!editing,
        initial: editing,
        websiteId,
        onClose: () => {
          setAdding(false);
          setEditing(null);
        },
        onSave: (t) => {
          if (editing) {
            if (!canEdit) {
              toast.error("Bạn không có quyền sửa Topic");
              return;
            }
            s.update("webTopics", editing.id, t);
          } else {
            if (!canCreate) {
              toast.error("Bạn không có quyền tạo Topic");
              return;
            }
            s.add("webTopics", { ...t, id: uid(), websiteId });
          }
          setAdding(false);
          setEditing(null);
        }
      }
    )
  ] });
}
function TopicDialog({
  open,
  initial,
  websiteId,
  onClose,
  onSave
}) {
  const empty = {
    id: "",
    websiteId,
    name: "",
    mainKeyword: "",
    sheetLink: "",
    updatedAt: todayISO()
  };
  const [form, setForm] = reactExports.useState(initial || empty);
  reactExports.useEffect(() => {
    if (open) setForm(initial || { ...empty, updatedAt: todayISO() });
  }, [open, initial?.id]);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (o) => {
        if (!o) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Sửa Topic" : "Thêm Topic mới" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Topic *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => set("name", e.target.value), placeholder: "vd: Tượng Phật gốm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Từ khóa chủ đề" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.mainKeyword || "", onChange: (e) => set("mainKeyword", e.target.value), placeholder: "vd: tượng Phật gốm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Link Sheet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sheetLink || "", onChange: (e) => set("sheetLink", e.target.value), placeholder: "https://docs.google.com/spreadsheets/..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Ngày cập nhật" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.updatedAt || "", onChange: (e) => set("updatedAt", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Ghi chú" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Hủy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !form.name.trim(),
              onClick: () => onSave({ ...form, updatedAt: form.updatedAt || todayISO() }),
              children: initial ? "Lưu thay đổi" : "Thêm Topic"
            }
          )
        ] })
      ] })
    }
  );
}
function ContentForm({
  initial,
  websiteId,
  brandId,
  onSubmit,
  onClose,
  lockWebsite = true
}) {
  const { people, plans, websites, brands, webTopics } = useStore();
  const [c, setC] = reactExports.useState({
    id: initial?.id || uid(),
    websiteId: initial?.websiteId || websiteId || websites[0]?.id || "",
    brandId: initial?.brandId || brandId || websites.find((w) => w.id === (initial?.websiteId || websiteId))?.brandId || brands[0]?.id || "",
    type: initial?.type || "Bài SEO",
    cluster: initial?.cluster,
    mainKeyword: initial?.mainKeyword,
    subKeywords: initial?.subKeywords,
    searchIntent: initial?.searchIntent,
    title: initial?.title || "",
    url: initial?.url,
    brief: initial?.brief,
    assigner: initial?.assigner,
    writer: initial?.writer,
    outlineReviewer: initial?.outlineReviewer,
    draftReviewer: initial?.draftReviewer,
    publisher: initial?.publisher,
    outlineDeadline: initial?.outlineDeadline,
    deadline: initial?.deadline,
    publishDate: initial?.publishDate,
    publishedAt: initial?.publishedAt,
    completedAt: initial?.completedAt,
    outlineLink: initial?.outlineLink,
    draftLink: initial?.draftLink,
    imageLink: initial?.imageLink,
    designOrderId: initial?.designOrderId,
    publishedLink: initial?.publishedLink,
    status: initial?.status || "Kế hoạch",
    outlineReviewNotes: initial?.outlineReviewNotes,
    draftReviewNotes: initial?.draftReviewNotes,
    outlineRevisions: initial?.outlineRevisions || 0,
    draftRevisions: initial?.draftRevisions || 0,
    indexStatus: initial?.indexStatus || "Chưa kiểm tra",
    indexNotes: initial?.indexNotes,
    plan: initial?.plan,
    topic: initial?.topic,
    notes: initial?.notes,
    needsDesign: initial?.needsDesign || false,
    optimizeReason: initial?.optimizeReason,
    optimizeGoal: initial?.optimizeGoal,
    oldLink: initial?.oldLink,
    optimizeNotes: initial?.optimizeNotes
  });
  const set = (p) => setC({ ...c, ...p });
  const ps = (val, on) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: val || "_", onValueChange: (v) => on(v === "_" ? void 0 : v), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
      people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
    ] })
  ] });
  const isOptimize = c.type === "Bài tối ưu lại";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "content-form-fields grid gap-3 sm:grid-cols-2 max-h-[65vh] overflow-y-auto pr-1", children: [
      !lockWebsite && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Website *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: c.websiteId,
            onValueChange: (v) => {
              const w = websites.find((x) => x.id === v);
              set({ websiteId: v, brandId: w?.brandId || c.brandId });
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: websites.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.name }, w.id)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tiêu đề dự kiến *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.title, onChange: (e) => set({ title: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại bài" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.type, onValueChange: (v) => set({ type: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONTENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Search intent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.searchIntent || "_", onValueChange: (v) => set({ searchIntent: v === "_" ? void 0 : v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
            SEARCH_INTENTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cụm chủ đề" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.cluster || "", onChange: (e) => set({ cluster: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "URL dự kiến" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.url || "", onChange: (e) => set({ url: e.target.value }), placeholder: "/duong-dan-bai-viet" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Từ khóa chính" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.mainKeyword || "", onChange: (e) => set({ mainKeyword: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Từ khóa phụ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.subKeywords || "", onChange: (e) => set({ subKeywords: e.target.value }), placeholder: "Cách nhau bằng dấu phẩy" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider", children: "Phân công" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người giao việc" }),
        ps(c.assigner, (v) => set({ assigner: v }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người viết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SpecialtyStaffPicker, { specialty: isOptimize ? "seo" : "content_web", value: c.writer, valueId: c.writerId, onChange: (v, id) => set({ writer: v, writerId: id }), people })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người duyệt outline" }),
        ps(c.outlineReviewer, (v) => set({ outlineReviewer: v }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người duyệt bài" }),
        ps(c.draftReviewer, (v) => set({ draftReviewer: v }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người đăng web" }),
        ps(c.publisher, (v) => set({ publisher: v }))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.status, onValueChange: (v) => set({ status: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONTENT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider", children: "Deadline" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline outline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: c.outlineDeadline || "", onChange: (e) => set({ outlineDeadline: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline bài viết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: c.deadline || "", onChange: (e) => set({ deadline: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày dự kiến đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: c.publishDate || "", onChange: (e) => set({ publishDate: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày đăng thực tế" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: c.publishedAt || "", onChange: (e) => set({ publishedAt: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider", children: "Tài liệu & link" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link outline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.outlineLink || "", onChange: (e) => set({ outlineLink: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bài viết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.draftLink || "", onChange: (e) => set({ draftLink: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link ảnh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.imageLink || "", onChange: (e) => set({ imageLink: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bài đã đăng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.publishedLink || "", onChange: (e) => set({ publishedLink: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex items-center gap-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!c.needsDesign, onCheckedChange: (v) => set({ needsDesign: v }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "!mt-0", children: "Cần thiết kế ảnh" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider", children: "SEO sau đăng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái index" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.indexStatus, onValueChange: (v) => set({ indexStatus: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INDEX_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú index" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.indexNotes || "", onChange: (e) => set({ indexNotes: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider", children: "Liên kết" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.plan || "_", onValueChange: (v) => set({ plan: v === "_" ? void 0 : v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
            plans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Topic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TopicPicker,
          {
            websiteId: c.websiteId,
            value: c.topic,
            onChange: (v) => set({ topic: v }),
            webTopics
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Brief" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: c.brief || "", onChange: (e) => set({ brief: e.target.value }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: c.notes || "", onChange: (e) => set({ notes: e.target.value }) })
      ] }),
      isOptimize && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 mt-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider", children: "Tối ưu lại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do tối ưu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.optimizeReason || "_", onValueChange: (v) => set({ optimizeReason: v === "_" ? void 0 : v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
              OPTIMIZE_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link bài cũ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.oldLink || "", onChange: (e) => set({ oldLink: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mục tiêu tối ưu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: c.optimizeGoal || "", onChange: (e) => set({ optimizeGoal: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú cần sửa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: c.optimizeNotes || "", onChange: (e) => set({ optimizeNotes: e.target.value }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "content-form-footer mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (!c.title.trim() || !c.websiteId) return;
        if (c.status === "Hoàn thành" && !c.completedAt) c.completedAt = todayISO();
        if (c.status === "Đã đăng web" && !c.publishedAt) c.publishedAt = todayISO();
        onSubmit(c);
        onClose();
      }, children: "Lưu" })
    ] })
  ] });
}
function TopicPicker({
  websiteId,
  value,
  onChange,
  webTopics
}) {
  const list = webTopics.filter((t) => t.websiteId === websiteId);
  const selected = list.find((t) => t.name === value);
  const [adding, setAdding] = reactExports.useState(false);
  const s = useStore();
  const { can } = useCurrentUser();
  const canCreateTopic = can("web.keyword_topic_create");
  const canOpenSheet = can("web.keyword_open_sheet");
  if (list.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-dashed p-2.5 text-xs text-muted-foreground space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Chưa có Topic.",
          " ",
          canCreateTopic ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Hãy tạo Topic tại tab ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Nghiên Cứu Keyword" }),
            " trước."
          ] }) : "Bạn không có quyền tạo Topic — hãy liên hệ người phụ trách."
        ] }),
        canCreateTopic && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => setAdding(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Tạo Topic mới"
        ] })
      ] }),
      canCreateTopic && /* @__PURE__ */ jsxRuntimeExports.jsx(
        TopicDialog,
        {
          open: adding,
          initial: null,
          websiteId,
          onClose: () => setAdding(false),
          onSave: (t) => {
            const newId = uid();
            s.add("webTopics", { ...t, id: newId, websiteId });
            onChange(t.name);
            setAdding(false);
          }
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "_", onValueChange: (v) => onChange(v === "_" ? void 0 : v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
          list.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.name, children: t.name }, t.id))
        ] })
      ] }),
      canCreateTopic && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "outline", onClick: () => setAdding(true), title: "Tạo Topic mới", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
    ] }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5 space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "Từ khóa chủ đề: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: selected.mainKeyword || "—" })
      ] }),
      selected.sheetLink && canOpenSheet && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: selected.sheetLink, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline inline-flex items-center gap-1", children: [
        "Mở Sheet keyword ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
      ] })
    ] }),
    canCreateTopic && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TopicDialog,
      {
        open: adding,
        initial: null,
        websiteId,
        onClose: () => setAdding(false),
        onSave: (t) => {
          s.add("webTopics", { ...t, id: uid(), websiteId });
          onChange(t.name);
          setAdding(false);
        }
      }
    )
  ] });
}
export {
  ContentForm as C,
  KeywordResearchTab as K
};
