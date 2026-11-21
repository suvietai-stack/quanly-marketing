import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useStore, u as useCurrentUser, L as Label, aW as ORDER_STATUSES, I as Input, B as Button, f as fmtDate, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, aU as ORDER_PRIORITIES, aV as ORDER_SOURCES, C as Card, o as CardContent, T as Switch, aX as uid, N as Checkbox, a as useServerFn, l as Badge, c as createSsrRpc } from "./router-CkmTURa-.mjs";
import { b as designAny, e as designCan, f as designLabel, d as designOverdue, D as DESIGN_FLOWS, g as designRange, s as statusAt, h as designStats, c as createdTime, i as completionTime, j as formatSeconds } from "./design-BrHT-rw4.mjs";
import { a as designQueueMatches, s as sortDesignOrders, b as designStage, c as designClosed, D as DESIGN_STAGES, d as designNextStep } from "./workboard-Cs1jrgCJ.mjs";
import { a as useRegisterAiRecord, o as openRecordAi } from "./useRecordContext-MOIepqyQ.mjs";
import { a as useQuery, u as useQueryClient, c as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { S as StatusBadge } from "./StatusBadge-CgSm-WTS.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { saveDesignOrder } from "./api-Bf_55NQ7.mjs";
import { u as useDesignCatalogs, w as workLabel, D as DesignAssigneePicker, v as validDocumentUrl, p as productBreakdown, F as FILE_EXTENSIONS, n as normalizeProducts, f as fileError } from "./DesignAssigneePicker-DC39EkqM.mjs";
import { r as reviewerIsAssignee, D as DesignReviewerPicker } from "./DesignReviewerPicker-Cn1Hqf7M.mjs";
import { l as listCommunityMemberNames } from "./api-DcMIOSaq.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { aD as Clock3, ar as CircleCheck, aw as CircleAlert, aq as Inbox, z as Settings, a6 as Plus, f as Search, g as SlidersHorizontal, b1 as List, i as LayoutGrid, X, e as ArrowUpRight, S as Sparkles, a8 as UserRound, I as CalendarDays, q as Check, ao as Pencil, j as ArrowUp, k as ArrowDown, A as ArrowLeft, at as ArrowRight, n as ChevronDown, aI as MessageCircle, ac as Paperclip, Q as Camera, b2 as Link, ab as RotateCcw, ag as ExternalLink, ap as Trash2, a9 as LoaderCircle, ah as ChevronUp, ad as Send, ae as Image, F as FileText, af as Download } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, P as PieChart, a as Pie, C as Cell, T as Tooltip, B as BarChart, X as XAxis, Y as YAxis, b as Bar } from "../_libs/recharts.mjs";
import { o as objectType, b as booleanType, s as stringType, e as enumType } from "../_libs/zod.mjs";
function DesignWorkflowSummary({ order }) {
  const stage = designStage(order.status);
  const stages = DESIGN_STAGES.filter((s) => s.key !== "cancelled");
  const current = stages.findIndex((s) => s.key === stage);
  const index = Math.max(0, current);
  const cancelled = order.status === "Đã hủy";
  const overdue = designOverdue(order);
  const currentLabel = cancelled ? "Đã hủy" : stages[index]?.label ?? "Nhận việc";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: "relative min-w-0 rounded-lg border border-border/75 px-3 py-2.5 sm:px-4 sm:py-3",
      "aria-label": "Tiến trình công việc",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pr-24 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tiến độ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: cancelled ? "Job đã hủy" : `Bước ${index + 1}/${stages.length} · ${currentLabel}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "group absolute right-3 top-2 z-20 text-xs text-muted-foreground sm:right-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "flex cursor-pointer select-none items-center gap-1 rounded px-1 py-2 hover:text-foreground", children: [
              "Các bước ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3.5 transition-transform group-open:rotate-180" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "absolute right-0 top-full grid w-[min(80vw,36rem)] grid-cols-2 gap-1.5 rounded-lg border bg-background p-2 shadow-lg sm:grid-cols-5", children: stages.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                "aria-current": s.key === stage ? "step" : void 0,
                className: `flex min-w-0 items-center gap-1.5 rounded px-1 py-1 ${!cancelled && s.key === stage ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex size-4 shrink-0 items-center justify-center rounded-full border border-current/30 text-[10px]", children: !cancelled && (i < index || order.status === "Hoàn thành") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }) : i + 1 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-words", children: s.label })
                ]
              },
              s.key
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "mt-1.5 flex gap-1",
            role: "img",
            "aria-label": cancelled ? "Job đã hủy" : `Tiến độ: bước ${index + 1} trong ${stages.length}`,
            children: stages.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `h-1.5 min-w-0 flex-1 rounded-full ${!cancelled && i <= index ? "bg-primary" : "bg-border"}`
              },
              s.key
            ))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs leading-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "size-3.5 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Thực hiện:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "min-w-0 break-words font-medium", children: order.assignee || "Cần giao người" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Duyệt:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "break-words font-medium", children: order.reviewer || order.requester || "Chưa chọn" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-1.5 ${overdue ? "text-destructive" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "size-3.5 shrink-0" }),
            order.deadline ? fmtDate(order.deadline) : "Chưa đặt hạn",
            overdue && /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium", children: "· Quá hạn" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1.5 text-xs leading-5 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: order.status === "Hoàn thành" || cancelled ? "Kết quả:" : "Tiếp theo:" }),
          " ",
          designNextStep(order)
        ] })
      ]
    }
  );
}
function DesignClassification({
  flow,
  value: value2,
  onChange,
  disabled = false
}) {
  const query = useDesignCatalogs();
  const catalogs = query.data || [];
  const work = catalogs.filter((c) => c.workflow_kind === flow && c.kind === "work" && (c.active || c.id === value2.workCategoryId));
  const products = catalogs.filter((c) => c.workflow_kind === flow && c.kind === "product" && (c.active || value2.productIds?.includes(c.id)));
  const selected = value2.productIds || [];
  const other = products.some((c) => c.is_other && selected.includes(c.id));
  const workLabel2 = flow === "photo" ? "Loại công việc chụp ảnh" : flow === "marketing_design" ? "Loại ấn phẩm" : "Loại yêu cầu ma-két";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-3", children: [
    query.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-sm text-destructive", children: [
      "Không tải được danh mục.",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "underline", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: workLabel2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            disabled: disabled || query.isPending,
            value: value2.workCategoryId || "_legacy",
            onValueChange: (id) => {
              const c = work.find((x) => x.id === id);
              if (c) onChange({ workCategoryId: id, workCategoryName: c.name, workOther: "" });
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "min-h-10 w-full min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn loại công việc" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_legacy", children: value2.type || "Chọn loại công việc" }),
                work.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
                  c.name,
                  !c.active ? " (Ngừng sử dụng)" : ""
                ] }, c.id))
              ] })
            ]
          }
        )
      ] }),
      work.some((c) => c.id === value2.workCategoryId && c.is_other) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mô tả loại công việc khác" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            disabled,
            value: value2.workOther || "",
            onChange: (e) => onChange({ workOther: e.target.value })
          }
        )
      ] })
    ] }),
    flow === "order_mockup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("legend", { className: "text-sm font-medium", children: [
        "Sản phẩm áp dụng",
        selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 font-normal text-muted-foreground", children: [
          "· ",
          selected.length,
          " đã chọn"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5 sm:grid-cols-3", children: products.map((c) => {
        const checked = selected.includes(c.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            className: `flex min-h-11 min-w-0 cursor-pointer items-center sm:min-h-10 gap-2 rounded-md border px-2.5 py-2 text-xs leading-4 transition-colors sm:text-sm ${checked ? "border-primary/40 bg-primary/5" : "border-border/70 hover:bg-muted/30"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  disabled,
                  checked,
                  onCheckedChange: (next) => {
                    const ids = next ? [...selected, c.id] : selected.filter((id) => id !== c.id);
                    onChange({
                      productIds: ids,
                      productNames: { ...value2.productNames, [c.id]: c.name },
                      ...!next && c.is_other ? { otherProducts: [] } : {}
                    });
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 break-words", children: c.name })
            ]
          },
          c.id
        );
      }) }),
      other && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên sản phẩm khác" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            disabled,
            placeholder: "Nhập tên sản phẩm cần thiết kế…",
            value: (value2.otherProducts || []).join("; "),
            onChange: (e) => onChange({ otherProducts: e.target.value.split(";") })
          }
        )
      ] })
    ] })
  ] });
}
function DesignAttachments({ orderId, flow, value: value2, onChange, disabled = false, onBusy }) {
  const { user } = useCurrentUser();
  const fileInput = reactExports.useRef(null);
  const camera = reactExports.useRef(null);
  const current = reactExports.useRef(value2);
  current.current = value2;
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [failed, setFailed] = reactExports.useState([]);
  const [linking, setLinking] = reactExports.useState(false);
  const [url, setUrl] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [urls, setUrls] = reactExports.useState({});
  const [remove, setRemove] = reactExports.useState();
  const [progress, setProgress] = reactExports.useState("");
  reactExports.useEffect(() => {
    let cancelled = false;
    async function thumbnails() {
      const result = {};
      for (const a of value2) {
        if (a.path && /\.(jpg|jpeg|png|webp|gif)$/i.test(a.path)) {
          const r = await supabase.storage.from("design-inputs").createSignedUrl(a.path, 60);
          if (r.data) result[a.id] = r.data.signedUrl;
        }
      }
      if (!cancelled) setUrls(result);
    }
    void thumbnails();
    return () => {
      cancelled = true;
    };
  }, [value2]);
  async function upload(files) {
    if (busy || !user || !flow) return;
    setBusy(true);
    onBusy?.(true);
    setError("");
    const failures = [];
    try {
      for (const [i, file] of files.entries()) {
        setProgress(`Đang tải ${i + 1}/${files.length}: ${file.name}`);
        const validation = fileError(file);
        if (validation) {
          setError(`${file.name}: ${validation}`);
          failures.push(file);
          continue;
        }
        if (current.current.reduce((n, a) => n + (a.size || 0), 0) + file.size > 100 * 1024 * 1024) {
          setError("Tổng tệp của Order vượt quá 100 MB.");
          failures.push(file);
          continue;
        }
        if (current.current.length >= 30) {
          setError("Tối đa 30 tài liệu.");
          break;
        }
        const id = crypto.randomUUID();
        const ext = file.name.split(".").at(-1)?.toLowerCase();
        const path = `${user.id}/${orderId}/${flow}/${id}.${ext}`;
        const r = await supabase.storage.from("design-inputs").upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" });
        if (r.error) {
          setError(`${file.name}: Không tải được tệp. Thử lại.`);
          failures.push(file);
          continue;
        }
        const next = [...current.current, { id, kind: "file", name: file.name, path, size: file.size, mime: file.type }];
        current.current = next;
        onChange(next);
      }
    } finally {
      setFailed(failures);
      setBusy(false);
      onBusy?.(false);
      setProgress("");
    }
  }
  async function open(a) {
    if (a.url && validDocumentUrl(a.url)) {
      window.open(a.url, "_blank", "noopener,noreferrer");
      return;
    }
    if (a.path) {
      const r = await supabase.storage.from("design-inputs").createSignedUrl(a.path, 60, { download: a.name });
      if (r.error) setError("Không mở được tệp hoặc quyền đã thay đổi.");
      else window.open(r.data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-t pt-3 sm:col-span-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Tài liệu & Hình ảnh đính kèm" }),
    !disabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: busy || !flow, onClick: () => fileInput.current?.click(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "size-4 mr-1" }),
        "Tải file / Ảnh"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: busy || !flow, onClick: () => camera.current?.click(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "size-4 mr-1" }),
        "Chụp ảnh"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: busy, onClick: () => setLinking(!linking), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "size-4 mr-1" }),
        "Thêm link"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInput, type: "file", className: "hidden", multiple: true, accept: FILE_EXTENSIONS.map((e) => `.${e}`).join(","), onChange: (e) => {
        void upload(Array.from(e.target.files || []));
        e.target.value = "";
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: camera, type: "file", className: "hidden", accept: "image/*", capture: "environment", onChange: (e) => {
        void upload(Array.from(e.target.files || []));
        e.target.value = "";
      } })
    ] }),
    linking && !disabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên tài liệu", placeholder: "Tên tài liệu", value: name, onChange: (e) => setName(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Đường dẫn tài liệu", type: "url", placeholder: "https://", value: url, onChange: (e) => setUrl(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Ghi chú tài liệu", placeholder: "Ghi chú", value: note, onChange: (e) => setNote(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
        if (!validDocumentUrl(url)) {
          setError("Nhập đường dẫn http hoặc https hợp lệ.");
          return;
        }
        if (value2.length >= 30) {
          setError("Tối đa 30 tài liệu.");
          return;
        }
        onChange([...value2, { id: crypto.randomUUID(), kind: "link", name: name.trim() || new URL(url).hostname, url, note }]);
        setUrl("");
        setName("");
        setNote("");
        setLinking(false);
        setError("");
      }, children: "Thêm tài liệu" })
    ] }),
    busy && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-sm text-muted-foreground break-all", children: progress }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
    failed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => upload(failed), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "size-4 mr-1" }),
      "Tải lại"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: value2.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center py-2 min-w-0", children: [
      urls[a.id] && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: urls[a.id], target: "_blank", rel: "noopener noreferrer", className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: urls[a.id], alt: a.name, className: "size-14 object-cover rounded-md" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "link", className: "h-auto p-0 whitespace-normal text-left break-all", onClick: () => open(a), children: [
          a.name,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3 ml-1 shrink-0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: a.kind === "link" ? "Link tài liệu" : `${a.name.split(".").at(-1)?.toUpperCase()} · ${((a.size || 0) / 1024 / 1024).toFixed(1)} MB` }),
        a.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs break-words", children: a.note })
      ] }),
      !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", disabled: busy, title: "Gỡ tài liệu", onClick: () => setRemove(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
    ] }, a.id)) }),
    remove && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "border-t pt-2 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Gỡ tài liệu khỏi Order?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setRemove(void 0), children: "Giữ lại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", onClick: () => {
          onChange(value2.filter((a) => a.id !== remove));
          setRemove(void 0);
        }, children: "Gỡ tài liệu" })
      ] })
    ] })
  ] });
}
const db = supabase;
const JOB_CHAT_BUCKET = "suviet-design-job-chat";
const PAGE_SIZE$1 = 30;
function value(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
async function listJobChatMessages(jobId, page = 0) {
  return value(await db.from("sv_design_job_chat_messages").select("id,job_id,sender_id,body,attachment_path,attachment_name,attachment_mime,created_at").eq("job_id", jobId).order("created_at", { ascending: false }).order("id", { ascending: false }).range(page * PAGE_SIZE$1, page * PAGE_SIZE$1 + PAGE_SIZE$1 - 1));
}
function nextJobChatPage(last, pages) {
  return last.length === PAGE_SIZE$1 ? pages.length : void 0;
}
async function canAccessJobChat(jobId) {
  return !!value(await db.rpc("sv_design_job_chat_access", { p_job_id: jobId }));
}
async function jobChatUnreadCount(jobId) {
  return Number(value(await db.rpc("sv_design_job_chat_unread", { p_job_id: jobId }))) || 0;
}
async function markJobChatRead(jobId) {
  value(await db.rpc("sv_design_job_chat_mark_read", { p_job_id: jobId }));
}
const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx"
};
function checkJobChatFile(file) {
  if (!MIME_EXT[file.type]) throw new Error("Chỉ hỗ trợ ảnh, PDF, Word hoặc Excel.");
  if (file.size < 1 || file.size > 15 * 1024 * 1024) throw new Error("Tệp tối đa 15 MB.");
  if (!file.name.trim() || file.name.length > 180) throw new Error("Tên tệp phải có 1–180 ký tự.");
}
async function sendJobChatMessage(jobId, userId, body, file) {
  const text = body.trim();
  if (!text && !file) throw new Error("Hãy viết tin nhắn hoặc chọn tệp.");
  if (text.length > 3e3) throw new Error("Tối đa 3.000 ký tự.");
  let path;
  if (file) {
    checkJobChatFile(file);
    path = `${jobId}/${userId}/${crypto.randomUUID()}.${MIME_EXT[file.type]}`;
    const { error } = await supabase.storage.from(JOB_CHAT_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false
    });
    if (error) throw new Error(error.message);
  }
  try {
    value(await db.from("sv_design_job_chat_messages").insert({
      job_id: jobId,
      body: text,
      ...path && file ? { attachment_path: path, attachment_name: file.name, attachment_mime: file.type } : {}
    }));
  } catch (err) {
    if (path) await supabase.storage.from(JOB_CHAT_BUCKET).remove([path]);
    throw err;
  }
}
async function jobChatDownload(path) {
  const { data, error } = await supabase.storage.from(JOB_CHAT_BUCKET).download(path);
  if (error || !data) throw new Error(error?.message || "Không tải được tệp.");
  return data;
}
const textError = (e) => e instanceof Error ? e.message : "Không gửi được tin. Hãy thử lại.";
const clock = (s) => new Date(s).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
function JobChatFile({ msg }) {
  const path = msg.attachment_path;
  const [imageUrl, setImageUrl] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [near, setNear] = reactExports.useState(false);
  const element = reactExports.useRef(null);
  const image = !!msg.attachment_mime?.startsWith("image/");
  reactExports.useEffect(() => {
    if (!image) return;
    const node = element.current;
    if (!node || !("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: "120px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [image, path]);
  reactExports.useEffect(() => {
    if (!image || !path || !near) return;
    let cancelled = false;
    let objectUrl = "";
    void jobChatDownload(path).then((blob) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setImageUrl("");
    };
  }, [path, image, near]);
  if (!path) return null;
  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const file = await jobChatDownload(path);
      const href = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = href;
      a.download = msg.attachment_name || "tep-thiet-ke";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(href), 3e4);
    } catch (e) {
      toast.error(textError(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: element, className: "mt-2 max-w-full rounded-xl border bg-background/95 p-2 text-foreground", children: [
    image && imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void download(), "aria-label": "Tải ảnh", className: "block max-w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: imageUrl, alt: msg.attachment_name || "Ảnh trao đổi", className: "max-h-52 max-w-full rounded-lg object-contain" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", className: "min-h-10 max-w-full gap-2 px-1 text-xs", onClick: () => void download(), disabled: busy, children: [
      image ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 break-all text-left", children: msg.attachment_name || "Tệp đính kèm" }),
      busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 shrink-0 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 shrink-0" })
    ] })
  ] });
}
function DesignJobChatTab({ jobId, active }) {
  const { user } = useCurrentUser();
  const uid2 = user?.id || "";
  const access = useQuery({
    queryKey: ["design-job-chat", "access", uid2, jobId],
    queryFn: () => canAccessJobChat(jobId),
    enabled: active && !!uid2 && user?.status === "Đang hoạt động",
    staleTime: 15e3,
    retry: 1
  });
  if (!access.data) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "job-chat", className: "min-h-10 gap-1 text-xs sm:text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 shrink-0" }),
    "Trao đổi",
    /* @__PURE__ */ jsxRuntimeExports.jsx(JobChatUnreadBadge, { jobId, active })
  ] });
}
function JobChatUnreadBadge({ jobId, active }) {
  const { user } = useCurrentUser();
  const uid2 = user?.id || "";
  const { data } = useQuery({
    queryKey: ["design-job-chat", "unread", uid2, jobId],
    queryFn: () => jobChatUnreadCount(jobId),
    enabled: active && !!uid2 && user?.status === "Đang hoạt động",
    staleTime: 15e3,
    refetchInterval: 3e4,
    retry: 1
  });
  return data && data > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-label": `${data} tin chưa đọc`, className: "rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white", children: data > 99 ? "99+" : data }) : null;
}
function DesignJobChat({ jobId }) {
  const { user } = useCurrentUser();
  const uid2 = user?.id || "";
  const client = useQueryClient();
  const [body, setBody] = reactExports.useState("");
  const [file, setFile] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const chooseFile = reactExports.useRef(null);
  const latestRead = reactExports.useRef("");
  const scrollEnd = reactExports.useRef(null);
  const people = useQuery({
    queryKey: ["community", "names", uid2],
    queryFn: listCommunityMemberNames,
    enabled: !!uid2,
    staleTime: 5 * 6e4,
    retry: 1
  });
  const names = reactExports.useMemo(() => new Map((people.data ?? []).map((p) => [p.id, p.full_name])), [people.data]);
  const messages = useInfiniteQuery({
    queryKey: ["design-job-chat", "messages", uid2, jobId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listJobChatMessages(jobId, pageParam),
    getNextPageParam: nextJobChatPage,
    enabled: !!uid2 && user?.status === "Đang hoạt động",
    staleTime: 4e3,
    refetchInterval: 1e4,
    retry: 1
  });
  const all = messages.data?.pages.flat().reverse() ?? [];
  const latest = messages.data?.pages[0]?.[0]?.id;
  reactExports.useEffect(() => {
    if (!uid2 || !latest || document.visibilityState !== "visible" || latestRead.current === latest) return;
    latestRead.current = latest;
    void markJobChatRead(jobId).then(() => {
      void client.invalidateQueries({ queryKey: ["design-job-chat", "unread", uid2, jobId] });
    }).catch(() => {
      latestRead.current = "";
    });
  }, [latest, jobId, uid2, client]);
  reactExports.useEffect(() => {
    scrollEnd.current?.scrollIntoView({ block: "end" });
  }, [jobId, latest]);
  const send = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await sendJobChatMessage(jobId, uid2, body, file ?? void 0);
      setBody("");
      setFile(null);
      if (chooseFile.current) chooseFile.current.value = "";
      await client.invalidateQueries({ queryKey: ["design-job-chat", "messages", uid2, jobId] });
      void client.invalidateQueries({ queryKey: ["design-job-chat", "unread", uid2, jobId] });
    } catch (err) {
      toast.error(textError(err));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border bg-card", "aria-label": "Trao đổi riêng theo Job", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b bg-sky-50/60 px-3 py-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 text-blue-600" }),
      "Trao đổi về Job này · Chỉ người liên quan được xem"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[min(43dvh,340px)] min-h-48 space-y-3 overflow-y-auto bg-slate-50/60 p-3 dark:bg-slate-950/50", role: "log", "aria-label": "Lịch sử trao đổi Job", children: [
      messages.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-3/5 animate-pulse rounded-xl bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto h-12 w-3/5 animate-pulse rounded-xl bg-muted" })
      ] }),
      messages.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-2 text-center text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Chưa tải được trao đổi của Job. Có thể bạn không có quyền truy cập." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => void messages.refetch(), children: "Thử lại" })
      ] }),
      messages.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", className: "mx-auto flex h-9 text-xs", disabled: messages.isFetchingNextPage, onClick: () => void messages.fetchNextPage(), children: [
        messages.isFetchingNextPage ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }),
        "Xem tin cũ hơn"
      ] }),
      messages.isSuccess && all.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-sm text-muted-foreground", children: "Chưa có trao đổi. Hãy gửi tin nhắn đầu tiên." }),
      all.map((msg) => {
        const mine = msg.sender_id === uid2;
        const name = mine ? "Bạn" : names.get(msg.sender_id) || "Đồng nghiệp";
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${mine ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[90%] sm:max-w-[75%] ${mine ? "text-right" : "text-left"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mb-1 block px-1 text-[10px] text-muted-foreground", children: [
            name,
            " · ",
            clock(msg.created_at)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl p-3 text-left text-[13px] leading-5 ${mine ? "rounded-br-md bg-blue-700 text-white" : "rounded-bl-md border bg-white dark:bg-slate-800"}`, children: [
            !!msg.body && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words", children: msg.body }),
            !!msg.attachment_path && /* @__PURE__ */ jsxRuntimeExports.jsx(JobChatFile, { msg })
          ] })
        ] }) }, msg.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollEnd })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => void send(e), className: "space-y-2 border-t p-3", children: [
      file && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-xs dark:bg-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate", children: file.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFile(null), "aria-label": "Bỏ tệp", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: chooseFile,
            className: "hidden",
            type: "file",
            accept: "image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx",
            "aria-label": "Chọn ảnh hoặc tài liệu",
            onChange: (e) => {
              const chosen = e.target.files?.[0];
              if (!chosen) return;
              try {
                checkJobChatFile(chosen);
                setFile(chosen);
              } catch (err) {
                toast.error(textError(err));
              }
              if (chooseFile.current) chooseFile.current.value = "";
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "icon", className: "h-11 w-11 shrink-0 rounded-xl", disabled: busy, onClick: () => chooseFile.current?.click(), "aria-label": "Đính kèm ảnh hoặc tài liệu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            rows: 1,
            maxLength: 3e3,
            className: "min-h-11 max-h-28 flex-1 resize-none rounded-xl text-base",
            value: body,
            onChange: (e) => setBody(e.target.value),
            placeholder: "Trao đổi về công việc này…",
            onKeyDown: (e) => {
              if (e.key === "Enter" && !e.shiftKey && window.innerWidth >= 768) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "h-11 w-11 shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800", disabled: busy || !body.trim() && !file, "aria-label": "Gửi tin nhắn", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Gửi một ảnh/tài liệu tối đa 15 MB. Trao đổi này không thay đổi trạng thái Job." })
    ] })
  ] });
}
function OrderDetailDialog({ orderId, open, onOpenChange }) {
  useRegisterAiRecord("design", open ? orderId : null);
  const s = useStore();
  const { user, can, isAdmin } = useCurrentUser();
  const found = orderId ? s.orders.find((o2) => o2.id === orderId) : null;
  const [draft, setDraft] = reactExports.useState({});
  const [reviewNote, setReviewNote] = reactExports.useState("");
  const [forceTarget, setForceTarget] = reactExports.useState("");
  const [forceReason, setForceReason] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [saveError, setSaveError] = reactExports.useState("");
  const [uploading, setUploading] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("workflow");
  reactExports.useEffect(() => {
    setDraft({});
    setForceTarget("");
    setForceReason("");
    setSaveError("");
    setActiveTab("workflow");
  }, [orderId]);
  const team = useQuery({
    queryKey: ["design-team-access", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("design_team_access");
      if (error) throw error;
      return !!data;
    },
    staleTime: 6e4,
    retry: 1
  });
  if (!found) return null;
  const order = found;
  const o = { ...order, ...draft };
  const setField = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const userName = user?.fullName || user?.username || "—";
  const isOwner = !!user && (o.assigneeId ? o.assigneeId === user.id : o.assignee === userName || o.assignee === user.username);
  const isReviewer = !!user && (o.reviewerId ? o.reviewerId === user.id : o.reviewer === userName || o.reviewer === user.username);
  const isRequester = !!user && (o.requester === userName || o.requester === user.username);
  const isApprover = isReviewer || !o.reviewer && isRequester;
  const allow = (perm, defaultRoleOk = false) => {
    if (isAdmin) return true;
    const action = perm.replace("order.", "");
    const scoped = designCan(can, order.workflowKind, action);
    return scoped && defaultRoleOk;
  };
  function pushHistory(action, fromStatus, toStatus, note, forced) {
    const entry = {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      byId: user?.id,
      byName: userName,
      action,
      fromStatus,
      toStatus,
      note,
      forced
    };
    return [...order.history || [], entry];
  }
  async function persist(patch) {
    if (saving) return false;
    setSaving(true);
    setSaveError("");
    try {
      await saveDesignOrder(order.id, patch, order);
      await s.reload();
      setDraft({});
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không lưu được Job";
      setSaveError(message);
      toast.error("Không lưu được Job", { description: message });
      return false;
    } finally {
      setSaving(false);
    }
  }
  async function transition(toStatus, action, extra = {}, note, forced) {
    const history = pushHistory(action, order.status, toStatus, note, forced);
    if (!await persist({ ...forced ? {} : draft, status: toStatus, history, ...extra })) return false;
    setDraft({});
    setReviewNote("");
    toast.success(action);
    return true;
  }
  async function saveOnly() {
    if (Object.keys(draft).length === 0) {
      toast.info("Không có thay đổi");
      return;
    }
    if (!await persist(draft)) return;
    setDraft({});
    toast.success("Đã lưu");
  }
  function requestChanges() {
    if (!reviewNote.trim()) {
      toast.error("Vui lòng nhập ghi chú sửa");
      return;
    }
    transition(
      "Cần sửa",
      "Yêu cầu sửa",
      { reviewNotes: reviewNote, revisions: (order.revisions || 0) + 1 },
      reviewNote
    );
  }
  const status = order.status;
  const actions = [];
  if (status === "Cần giao người") {
    actions.push({
      label: "Chọn người thực hiện để tiếp tục",
      onClick: () => setActiveTab("info"),
      show: isRequester || !!team.data || isAdmin
    });
  }
  if (status === "Chờ nhận việc") {
    actions.push({
      label: "Nhận việc",
      onClick: () => transition("Đang thực hiện", "Nhận việc", { takenAt: (/* @__PURE__ */ new Date()).toISOString(), assignee: o.assignee || userName }),
      show: allow("order.take", isOwner || !o.assignee)
    });
  }
  const effectiveReviewer = o.reviewer || o.requester;
  const selfApproval = reviewerIsAssignee(
    o.reviewerId || (!o.reviewer ? order.recordCreatedBy : void 0),
    o.assigneeId,
    effectiveReviewer,
    o.assignee
  );
  if (status === "Đang thực hiện") {
    actions.push({
      label: "Gửi duyệt",
      onClick: () => {
        if (selfApproval) {
          toast.error("Người phụ trách không thể đồng thời là người duyệt Order. Vui lòng chọn người duyệt khác.");
          return;
        }
        transition("Chờ duyệt", "Gửi duyệt", { submittedAt: (/* @__PURE__ */ new Date()).toISOString() });
      },
      show: allow("order.submit", isOwner)
    });
  }
  if (status === "Chờ duyệt") {
    actions.push({
      label: "Duyệt",
      onClick: () => {
        if (selfApproval) {
          toast.error("Người phụ trách không thể đồng thời duyệt Order của chính mình.");
          return;
        }
        transition("Đã duyệt", "Duyệt order");
      },
      show: allow("order.approve", isApprover) && !selfApproval
    });
    actions.push({
      label: "Yêu cầu sửa",
      variant: "outline",
      onClick: requestChanges,
      show: allow("order.request_changes", isApprover) && !selfApproval
    });
  }
  if (status === "Cần sửa") {
    actions.push({
      label: "Gửi duyệt lại",
      onClick: () => transition("Chờ duyệt", "Gửi duyệt lại", { submittedAt: (/* @__PURE__ */ new Date()).toISOString() }),
      show: allow("order.resubmit", isOwner)
    });
  }
  if (status === "Đã duyệt") {
    actions.push({
      label: "Bàn giao file",
      onClick: () => transition("Đã bàn giao", "Bàn giao file", { deliveredAt: (/* @__PURE__ */ new Date()).toISOString() }),
      show: allow("order.deliver", isOwner)
    });
  }
  if (status === "Đã bàn giao") {
    actions.push({
      label: "Xác nhận hoàn thành",
      onClick: () => transition("Hoàn thành", "Xác nhận hoàn thành", { completedAt: (/* @__PURE__ */ new Date()).toISOString() }),
      show: allow("order.complete", isApprover || isRequester)
    });
    actions.push({
      label: "Yêu cầu sửa lại",
      variant: "outline",
      onClick: requestChanges,
      show: allow("order.request_changes", isApprover || isRequester)
    });
  }
  if (status !== "Đã hủy" && status !== "Hoàn thành") {
    actions.push({
      label: "Hủy order",
      variant: "destructive",
      onClick: () => {
        const earlyStages = status === "Cần giao người" || status === "Chờ nhận việc";
        if (!earlyStages && !reviewNote.trim()) {
          toast.error("Nhập lý do hủy ở ô ghi chú trước");
          return;
        }
        transition("Đã hủy", "Hủy order", { cancelReason: reviewNote }, reviewNote);
      },
      show: allow("order.cancel", isRequester)
    });
  }
  if (status === "Đã hủy") {
    actions.push({
      label: "Khôi phục",
      onClick: () => {
        if (!order.assignee) {
          toast.error("Cần người thực hiện trước khi khôi phục Job");
          return;
        }
        transition("Chờ nhận việc", "Khôi phục Job");
      },
      show: allow("order.restore", isRequester || designCan(can, order.workflowKind, "assign"))
    });
  }
  const canEdit = isAdmin || designCan(can, order.workflowKind, "edit") && (isRequester || isOwner || designCan(can, order.workflowKind, "assign"));
  const canForce = isAdmin || designCan(can, order.workflowKind, "force_status") && designCan(can, order.workflowKind, "assign");
  const canTransfer = isAdmin || designCan(can, order.workflowKind, "assign") || !!team.data && isOwner || !order.assignee && isRequester;
  const extraInfoCount = [o.styleNote, o.notes, o.refLink, o.draftLink, o.deliverLink, o.reviseLink, o.usedLink, o.refLinkObject].filter((v) => typeof v === "string" && v.trim()).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "design-mobile-dialog max-h-[94dvh] w-[calc(100vw-1rem)] max-w-4xl gap-3 overflow-x-hidden overflow-y-auto p-3 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "space-y-1.5 border-b pb-3 pr-7 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "design-dialog-title min-w-0 break-words text-left text-lg font-semibold leading-6 sm:text-xl", children: order.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: order.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "design-dialog-meta min-w-0 text-xs leading-5 text-muted-foreground", children: [
          designLabel(order.workflowKind),
          s.brands.find((b) => b.id === order.brandId)?.name,
          order.workCategoryName || order.type,
          order.priority && order.priority !== "Trung bình" ? `Ưu tiên ${order.priority}` : void 0
        ].filter(Boolean).join(" · ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", className: "min-h-10 shrink-0 gap-1.5 px-2 text-xs text-muted-foreground sm:min-h-8", onClick: openRecordAi, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5" }),
          " Hỏi Đốm"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DesignWorkflowSummary, { order }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "design-job-tabs sticky top-0 z-10 flex h-auto w-full items-center gap-1 rounded-lg bg-background/95 p-1 shadow-sm backdrop-blur [&>[role=tab]]:min-w-0 [&>[role=tab]]:flex-1 [&>[role=tab]]:px-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", className: "min-h-9 text-xs sm:text-sm", children: "Thông tin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "workflow", className: "min-h-9 text-xs sm:text-sm", children: "Xử lý" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DesignJobChatTab, { jobId: order.id, active: open }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "history", className: "min-h-9 text-xs sm:text-sm", children: [
          "Lịch sử (",
          order.history?.length || 0,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "mt-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên Job" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: o.title, disabled: !canEdit, onChange: (e) => setField({ title: e.target.value }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hệ Thiết kế" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: o.workflowKind || "unknown",
                disabled: saving || !(isAdmin || designCan(can, order.workflowKind, "assign")),
                onValueChange: (v) => setField({ workflowKind: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    !o.workflowKind && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unknown", children: "Chưa phân loại luồng" }),
                    DESIGN_FLOWS.filter((f) => isAdmin || designCan(can, f.key, "assign")).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.key, children: f.label }, f.key))
                  ] })
                ]
              }
            )
          ] }),
          o.workflowKind ? /* @__PURE__ */ jsxRuntimeExports.jsx(DesignClassification, { flow: o.workflowKind, value: o, onChange: setField, disabled: !canEdit }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            "Loại lịch sử: ",
            o.type
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hạn hoàn thành" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: o.deadline || "",
                disabled: !canEdit,
                onChange: (e) => setField({ deadline: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mức ưu tiên" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: o.priority || "Trung bình",
                disabled: !canEdit,
                onValueChange: (v) => setField({ priority: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ORDER_PRIORITIES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 border-t pt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm font-semibold", children: "Phân công" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DesignAssigneePicker,
                {
                  flow: o.workflowKind,
                  value: order.assignee,
                  valueId: order.assigneeId,
                  onChange: (name, id) => {
                    if (!name || !id) return;
                    if (reviewerIsAssignee(
                      o.reviewerId || (!o.reviewer ? order.recordCreatedBy : void 0),
                      id,
                      o.reviewer || o.requester,
                      name
                    )) {
                      toast.error("Người thực hiện trùng người duyệt. Hãy chọn người duyệt khác trước khi phân công.");
                      return;
                    }
                    if (name === order.assignee && id === order.assigneeId) return;
                    const now = (/* @__PURE__ */ new Date()).toISOString();
                    const action = order.assignee ? "Chuyển Job: " + order.assignee + " → " + name : "Bổ sung người thực hiện: " + name;
                    const next = "Chờ nhận việc";
                    const history = pushHistory(action, order.status, next);
                    void persist({
                      ...draft.reviewer !== void 0 ? { reviewer: draft.reviewer, reviewerId: draft.reviewerId } : {},
                      assignee: name,
                      assigneeId: id,
                      assignedBy: userName,
                      assignedAt: now,
                      status: next,
                      history
                    }).then((ok) => {
                      if (ok) toast.success("Đã phân công người thực hiện");
                    });
                  },
                  required: true,
                  disabled: saving || uploading || !canTransfer,
                  label: order.assignee ? "Chuyển người thực hiện" : "Chọn người thực hiện"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DesignReviewerPicker,
                {
                  valueId: o.reviewerId || (!o.reviewer ? order.recordCreatedBy : void 0),
                  valueName: o.reviewer || o.requester,
                  assigneeId: o.assigneeId,
                  onChange: (name, id) => setField({ reviewer: name, reviewerId: id }),
                  disabled: saving || !(isAdmin || designCan(can, order.workflowKind, "edit_reviewer") || isRequester && (order.status === "Cần giao người" || order.status === "Chờ nhận việc")),
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs text-muted-foreground", children: "Chuyển người thực hiện sẽ được ghi vào lịch sử Job." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Brief · Nội dung yêu cầu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                rows: 3,
                value: o.brief || "",
                disabled: !canEdit,
                onChange: (e) => setField({ brief: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DesignAttachments,
            {
              orderId: order.id,
              flow: o.workflowKind,
              value: o.inputAttachments || [],
              onChange: (inputAttachments) => setField({ inputAttachments }),
              disabled: !canEdit,
              onBusy: setUploading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "sm:col-span-2 overflow-hidden rounded-lg border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer select-none px-3 py-3 text-sm font-medium sm:px-4", children: [
              "Thông tin bổ sung (tùy chọn)",
              extraInfoCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 font-normal text-muted-foreground", children: [
                "· ",
                extraInfoCount,
                " mục đã lưu"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 border-t bg-muted/10 p-3 sm:grid-cols-2 sm:p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nguồn yêu cầu" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: o.source, onValueChange: (v) => setField({ source: v }), disabled: !canEdit, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ORDER_SOURCES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kích thước" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: o.size || "",
                    disabled: !canEdit,
                    onChange: (e) => setField({ size: e.target.value }),
                    placeholder: "VD: 1920x1080"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số lượng" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    value: o.quantity ?? "",
                    disabled: !canEdit,
                    onChange: (e) => setField({ quantity: e.target.value ? Number(e.target.value) : void 0 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PersonSelect,
                {
                  label: "Người yêu cầu",
                  value: o.requester,
                  onChange: (v) => setField({ requester: v }),
                  disabled: !canEdit
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yêu cầu phong cách" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    rows: 2,
                    value: o.styleNote || "",
                    disabled: !canEdit,
                    onChange: (e) => setField({ styleNote: e.target.value }),
                    placeholder: "Có thể ghi chung trong Brief"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú nội bộ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    rows: 2,
                    value: o.notes || "",
                    disabled: !canEdit,
                    onChange: (e) => setField({ notes: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 border-t pt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Liên kết riêng của Job cũ" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Job mới thêm tài liệu, ảnh hoặc link ở mục đính kèm phía trên. Link cũ vẫn được giữ và chỉnh sửa tại đây." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link tư liệu đầu vào" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: o.refLink || "", disabled: !canEdit, onChange: (e) => setField({ refLink: e.target.value }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link file nháp" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: o.draftLink || "",
                    disabled: !(isAdmin || designCan(can, order.workflowKind, "update_draft") || isOwner),
                    onChange: (e) => setField({ draftLink: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link file bàn giao" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: o.deliverLink || "",
                    disabled: !(isAdmin || designCan(can, order.workflowKind, "deliver") || isOwner),
                    onChange: (e) => setField({ deliverLink: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link file chỉnh sửa" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: o.reviseLink || "",
                    disabled: !(isAdmin || designCan(can, order.workflowKind, "update_draft") || isOwner),
                    onChange: (e) => setField({ reviseLink: e.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link sản phẩm đã dùng" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: o.usedLink || "", disabled: !canEdit, onChange: (e) => setField({ usedLink: e.target.value }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link đối tượng liên quan" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: o.refLinkObject || "", disabled: !canEdit, onChange: (e) => setField({ refLinkObject: e.target.value }) })
              ] })
            ] })
          ] }, order.id)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-stretch justify-between gap-2 border-t pt-3 sm:flex-row sm:items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            order.takenAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Nhận: ",
              fmtDate(order.takenAt),
              " · "
            ] }),
            order.submittedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Gửi duyệt: ",
              fmtDate(order.submittedAt),
              " · "
            ] }),
            order.deliveredAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Bàn giao: ",
              fmtDate(order.deliveredAt),
              " · "
            ] }),
            order.completedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Hoàn thành: ",
              fmtDate(order.completedAt)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveOnly, disabled: saving || uploading || Object.keys(draft).length === 0, children: saving ? "Đang lưu…" : "Lưu thay đổi" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "workflow", className: "space-y-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-3 sm:p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Trạng thái hiện tại: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: order.status })
        ] }),
        !order.assignee && (isAdmin || isRequester || !!team.data) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Công việc chưa có người thực hiện." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setActiveTab("info"), children: "Phân công công việc" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: [{ label: "Mở bản nháp", url: order.draftLink }, { label: "Mở bản chỉnh sửa", url: order.reviseLink }, { label: "Mở file bàn giao", url: order.deliverLink }].filter((item) => item.url && validDocumentUrl(item.url)).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "rounded-md border px-3 py-2 text-sm font-medium text-primary hover:bg-muted", children: [
          item.label,
          " ↗"
        ] }, item.label)) }),
        order.reviewNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Ghi chú sửa gần nhất:" }),
          " ",
          order.reviewNotes
        ] }),
        (status === "Chờ duyệt" || status === "Đã bàn giao") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú sửa (bắt buộc khi yêu cầu sửa)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: reviewNote, onChange: (e) => setReviewNote(e.target.value), placeholder: "Mô tả phần cần chỉnh sửa..." })
        ] }),
        (status === "Cần giao người" || status === "Chờ nhận việc") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do hủy (nếu hủy)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: reviewNote, onChange: (e) => setReviewNote(e.target.value), placeholder: "Lý do..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:flex sm:flex-wrap", children: [
          actions.filter((a) => a.show).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-h-11 w-full sm:w-auto", disabled: saving || uploading, variant: a.variant || "default", onClick: a.onClick, children: a.label }, a.label)),
          actions.filter((a) => a.show).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Không có hành động khả dụng cho trạng thái này (hoặc bạn không có quyền)." })
        ] }),
        canForce && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "design-force-status", className: "text-xs", children: "Ép chuyển trạng thái (có ghi lịch sử)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: forceTarget, onValueChange: (v) => setForceTarget(v), disabled: saving || uploading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "design-force-status", "aria-label": "Trạng thái muốn chuyển", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn trạng thái đích" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ORDER_STATUSES.filter((st) => st !== order.status).map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: st, children: st }, st)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: forceReason,
              onChange: (e) => setForceReason(e.target.value),
              placeholder: "Lý do ép trạng thái (bắt buộc)",
              "aria-label": "Lý do ép chuyển trạng thái",
              disabled: saving || uploading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "min-h-11 w-full sm:w-auto",
              variant: "destructive",
              disabled: saving || uploading || !forceTarget || forceTarget === order.status || forceReason.trim().length < 3,
              onClick: async () => {
                if (!forceTarget || forceReason.trim().length < 3) return;
                if (await transition(forceTarget, "Ép chuyển trạng thái", {}, forceReason.trim(), true)) {
                  setForceTarget("");
                  setForceReason("");
                }
              },
              children: "Xác nhận ép chuyển trạng thái"
            }
          )
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "job-chat", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DesignJobChat, { jobId: order.id }, order.id) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        !order.history?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lịch sử." }),
        (order.history || []).slice().reverse().map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 rounded-md border p-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: h.byName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 break-words text-muted-foreground", children: h.action }),
              h.forced && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: "(ép)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: new Date(h.at).toLocaleString("vi-VN") })
          ] }),
          h.fromStatus && h.toStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: h.fromStatus }),
            " → ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: h.toStatus })
          ] }),
          h.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs", children: h.note })
        ] }, i))
      ] }) })
    ] }),
    Object.keys(o.specialty || {}).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Yêu cầu chuyên môn" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 mt-3", children: Object.entries(o.specialty || {}).map(([key, value2]) => key === "Logo khách hàng" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm break-words", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          key,
          " (lịch sử): "
        ] }),
        validDocumentUrl(value2) ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: value2, target: "_blank", rel: "noopener noreferrer", className: "text-primary underline", children: value2 }) : value2 || "—"
      ] }, key) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: key }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { disabled: !canEdit, value: value2 || "", onChange: (e) => setField({ specialty: { ...o.specialty, [key]: e.target.value } }) })
      ] }, key)) })
    ] }),
    saveError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: saveError })
  ] }) });
}
function PersonSelect({ label, value: value2, onChange, disabled }) {
  const { people } = useStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value2 || "_", onValueChange: (v) => onChange(v === "_" ? void 0 : v), disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "_", children: "—" }),
        people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.name, children: p.name }, p.id))
      ] })
    ] })
  ] });
}
const tones = ["var(--primary)", "var(--success)", "var(--warning)", "var(--muted-foreground)"];
function OrderReport({ flow }) {
  const s = useStore();
  const { can } = useCurrentUser();
  const [period, setPeriod] = reactExports.useState("month");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [kind, setKind] = reactExports.useState("all");
  const [person, setPerson] = reactExports.useState("all");
  const [requester, setRequester] = reactExports.useState("all");
  const [status, setStatus] = reactExports.useState("all");
  const [type, setType] = reactExports.useState("all");
  const [drill, setDrill] = reactExports.useState(null);
  const [open, setOpen] = reactExports.useState(null);
  const catalogs = useDesignCatalogs();
  const [product, setProduct] = reactExports.useState("all");
  const range = designRange(period, from, to);
  const orders = s.orders.filter((o) => designCan(can, o.workflowKind, "report_view") && (!flow || o.workflowKind === flow) && (kind === "all" || (kind === "unknown" ? !o.workflowKind : o.workflowKind === kind)) && (person === "all" || o.assignee === person) && (requester === "all" || o.requester === requester) && (status === "all" || statusAt(o, range.to) === status) && (type === "all" || workLabel(o, catalogs.data || []) === type) && (product === "all" || o.productIds?.includes(product)));
  const stats = designStats(orders, range);
  const states = ORDER_STATUSES.map((st) => ({ name: st, value: stats.existing.filter((o) => statusAt(o, range.to) === st).length, rows: stats.existing.filter((o) => statusAt(o, range.to) === st) }));
  const flows = [...DESIGN_FLOWS.map((f) => ({ name: f.label, value: stats.existing.filter((o) => o.workflowKind === f.key).length, rows: stats.existing.filter((o) => o.workflowKind === f.key) })), { name: "Chưa phân loại luồng", value: stats.existing.filter((o) => !o.workflowKind).length, rows: stats.existing.filter((o) => !o.workflowKind) }];
  const months = [...new Set([...stats.created.map(createdTime), ...stats.completed.map(completionTime)].filter((n) => n !== void 0).map((n) => new Date(n + 7 * 36e5).toISOString().slice(0, 7)))].sort();
  const trends = months.map((month) => ({ name: month, created: stats.created.filter((o) => new Date((createdTime(o) ?? 0) + 7 * 36e5).toISOString().startsWith(month)).length, done: stats.completed.filter((o) => new Date((completionTime(o) ?? 0) + 7 * 36e5).toISOString().startsWith(month)).length }));
  const staff = [...new Set(stats.existing.map((o) => o.assignee || "Chưa phân công"))].map((n) => ({ name: n, value: stats.existing.filter((o) => (o.assignee || "Chưa phân công") === n).length, rows: stats.existing.filter((o) => (o.assignee || "Chưa phân công") === n) }));
  const onTime = DESIGN_FLOWS.map((f) => {
    const st = designStats(orders.filter((o) => o.workflowKind === f.key), range);
    return { name: f.label, value: st.onTimeRate, rows: st.completed };
  });
  const types = [.../* @__PURE__ */ new Set([...(catalogs.data || []).filter((c) => c.kind === "work" && (!flow || c.workflow_kind === flow)).map((c) => c.name), ...stats.existing.map((o) => workLabel(o, catalogs.data || []))])].map((t) => ({ name: t, value: stats.existing.filter((o) => workLabel(o, catalogs.data || []) === t).length, rows: stats.existing.filter((o) => workLabel(o, catalogs.data || []) === t) }));
  const products = productBreakdown(stats.existing, catalogs.data || []);
  const chart = (title, data, pct = false) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-w-0 border-t pt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-3", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data, layout: "vertical", margin: { left: 0, right: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", domain: pct ? [0, 100] : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { dataKey: "name", type: "category", width: 115, tick: { fontSize: 11 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { isAnimationActive: false, dataKey: "value", fill: "var(--primary)", onClick: (_, i) => {
        const row = data[i];
        if (row) setDrill({ title: row.name, rows: row.rows });
      } })
    ] }) }) })
  ] });
  const selector = (value2, set, label, values) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value2, onValueChange: set, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: label }),
      values.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v))
    ] })
  ] });
  const metrics = [{ label: "Tổng công việc tại thời điểm xét", value: stats.existing.length, rows: stats.existing }, { label: "Tạo mới trong kỳ", value: stats.created.length, rows: stats.created }, { label: "Hoàn thành trong kỳ", value: stats.completed.length, rows: stats.completed }, { label: "Quá hạn tại thời điểm xét", value: stats.overdue.length, rows: stats.overdue }, ...states.filter((x) => ["Đang thực hiện", "Chờ nhận việc", "Chờ duyệt", "Cần sửa"].includes(x.name)).map((x) => ({ label: x.name, value: x.value, rows: x.rows }))];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 grid-cols-2 sm:flex sm:flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: period, onValueChange: (v) => setPeriod(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [["all", "Tất cả thời gian"], ["day", "Hôm nay"], ["week", "Tuần này"], ["month", "Tháng này"], ["quarter", "Quý này"], ["year", "Năm nay"], ["custom", "Tùy chọn"]].map(([v, n]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: n }, v)) })
      ] }),
      !flow && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kind, onValueChange: setKind, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả luồng" }),
          DESIGN_FLOWS.filter((f) => designCan(can, f.key, "report_view")).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.key, children: f.label }, f.key)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unknown", children: "Chưa phân loại luồng" })
        ] })
      ] }),
      selector(person, setPerson, "Mọi người thực hiện", [...new Set(s.orders.map((o) => o.assignee).filter((n) => !!n))]),
      selector(requester, setRequester, "Mọi người yêu cầu", [...new Set(s.orders.map((o) => o.requester).filter((n) => !!n))]),
      selector(status, setStatus, "Mọi trạng thái", [...ORDER_STATUSES]),
      selector(type, setType, "Mọi loại công việc", [.../* @__PURE__ */ new Set([...(catalogs.data || []).filter((c) => c.kind === "work" && (!flow || c.workflow_kind === flow)).map((c) => c.name), ...s.orders.map((o) => workLabel(o, catalogs.data || []))])]),
      (!flow || flow === "order_mockup") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: product, onValueChange: setProduct, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Mọi sản phẩm áp dụng" }),
          (catalogs.data || []).filter((c) => c.kind === "product").map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id))
        ] })
      ] }),
      period === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Từ ngày", type: "date", value: from, onChange: (e) => setFrom(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Đến ngày", type: "date", value: to, onChange: (e) => setTo(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: metrics.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "h-auto w-full p-0 items-start text-left flex-col whitespace-normal", onClick: () => setDrill({ title: m.label, rows: m.rows }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: m.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-2xl mt-1", children: m.value })
    ] }) }) }, m.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 border-y py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hoàn thành đúng hạn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-xl", children: stats.onTimeRate === void 0 ? "—" : `${stats.onTimeRate.toFixed(1)}%` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          stats.onTime.length,
          "/",
          stats.eligible.length,
          " hoàn thành có deadline hợp lệ"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Thời gian thực hiện trung bình" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-lg", children: formatSeconds(stats.averageSeconds) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          stats.durationCount,
          " công việc đủ mốc nhận và hoàn thành"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Số vòng chỉnh sửa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-xl", children: stats.completed.reduce((a, o) => a + (o.revisions || 0), 0) })
      ] })
    ] }),
    stats.missingCreated > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      stats.missingCreated,
      " công việc thiếu mốc tạo; không đưa vào xu hướng phát sinh."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-w-0 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Tỷ trọng công việc theo luồng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { isAnimationActive: false, data: flows, dataKey: "value", nameKey: "name", innerRadius: 50, outerRadius: 90, onClick: (_, i) => {
            const row = flows[i];
            if (row) setDrill({ title: row.name, rows: row.rows });
          }, children: flows.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: tones[i % tones.length] }, f.name)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: flows.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setDrill({ title: f.name, rows: f.rows }), children: [
          f.name,
          " · ",
          f.value
        ] }, f.name)) })
      ] }),
      chart("Công việc theo trạng thái", states),
      chart("Tỷ lệ đúng hạn giữa các luồng", onTime, true),
      chart("Khối lượng theo nhân viên", staff),
      chart("Loại công việc", types),
      (!flow || flow === "order_mockup") && chart("Sản phẩm áp dụng", products),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-w-0 border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Xu hướng phát sinh và hoàn thành theo tháng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: trends, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { isAnimationActive: false, dataKey: "created", name: "Tạo mới", fill: "var(--primary)", onClick: (_, i) => {
            const m = months[i];
            setDrill({ title: `Tạo mới ${m}`, rows: stats.created.filter((o) => new Date((createdTime(o) ?? 0) + 7 * 36e5).toISOString().startsWith(m)) });
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { isAnimationActive: false, dataKey: "done", name: "Hoàn thành", fill: "var(--success)", onClick: (_, i) => {
            const m = months[i];
            setDrill({ title: `Hoàn thành ${m}`, rows: stats.completed.filter((o) => new Date((completionTime(o) ?? 0) + 7 * 36e5).toISOString().startsWith(m)) });
          } })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t pt-4 overflow-x-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-3", children: "Hiệu quả theo loại công việc" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Loại", "Số Order", "Tỷ trọng", "Hoàn thành trong kỳ", "Đúng hạn", "Quá hạn"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-2", children: x }, x)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: types.map((t) => {
          const st = designStats(t.rows, range);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", className: "p-0 h-auto whitespace-normal text-left", onClick: () => setDrill({ title: t.name, rows: t.rows }), children: t.name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: t.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
              stats.existing.length ? (t.value / stats.existing.length * 100).toFixed(1) : "0",
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: st.completed.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
              st.onTime.length,
              "/",
              st.eligible.length
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: st.overdue.length })
          ] }, t.name);
        }) })
      ] })
    ] }),
    products.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      new Set(products.flatMap((p) => p.rows.map((o) => o.id))).size,
      " Order duy nhất · ",
      products.reduce((n, p) => n + p.value, 0),
      " lượt gắn sản phẩm"
    ] }),
    drill && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold", children: [
          drill.title,
          " · ",
          drill.rows.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setDrill(null), children: "Đóng" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: drill.rows.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 flex justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "link", className: "p-0 h-auto text-left whitespace-normal", onClick: () => setOpen(o.id), children: o.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            designLabel(o.workflowKind),
            " · ",
            o.assignee || "Chưa phân công"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs shrink-0", children: statusAt(o, range.to) || "Thiếu mốc" })
      ] }, o.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OrderDetailDialog, { orderId: open, open: !!open, onOpenChange: (v) => {
      if (!v) setOpen(null);
    } }, open)
  ] });
}
function DesignCatalogSettings() {
  const { can, isAdmin, user } = useCurrentUser();
  const query = useDesignCatalogs();
  const qc = useQueryClient();
  const [flow, setFlow] = reactExports.useState("photo");
  const [kind, setKind] = reactExports.useState("work");
  const [edit, setEdit] = reactExports.useState();
  const [name, setName] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const usage = useQuery({ queryKey: ["design-catalog-usage", user?.id], queryFn: async () => {
    const r = await supabase.rpc("design_catalog_usage");
    if (r.error) throw new Error(r.error.message);
    return r.data;
  } });
  if (!isAdmin && !can("settings.role")) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Không có quyền Cài đặt." });
  const rows = (query.data || []).filter((c) => c.workflow_kind === flow && c.kind === kind);
  async function save(c, patch) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await supabase.rpc("design_catalog_save", { _id: c?.id ?? null, _flow: flow, _kind: kind, _name: patch?.name ?? c?.name ?? name, _active: patch?.active ?? c?.active ?? true, _position: patch?.position ?? c?.position ?? rows.length + 1 });
      if (r.error) throw new Error(r.error.message);
      await qc.invalidateQueries({ queryKey: ["design-catalogs"] });
      setEdit(void 0);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được danh mục.");
    } finally {
      setBusy(false);
    }
  }
  async function move(c, direction) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await supabase.rpc("design_catalog_move", { _id: c.id, _direction: direction });
      if (r.error) throw new Error(r.error.message);
      await qc.invalidateQueries({ queryKey: ["design-catalogs"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không sắp xếp được.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: DESIGN_FLOWS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: flow === f.key ? "secondary" : "ghost", onClick: () => {
      setFlow(f.key);
      setKind("work");
      setEdit(void 0);
    }, children: f.label }, f.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: kind === "work" ? "secondary" : "ghost", onClick: () => setKind("work"), children: "Loại công việc" }),
      flow === "order_mockup" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: kind === "product" ? "secondary" : "ghost", onClick: () => setKind("product"), children: "Sản phẩm áp dụng" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tên danh mục mới", placeholder: "Tên danh mục mới", value: edit ? "" : name, disabled: !!edit, onChange: (e) => setName(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", title: "Thêm danh mục", disabled: busy || !name.trim() || !!edit, onClick: () => save(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }) })
    ] }),
    query.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: "Tải lại danh mục" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: rows.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-3 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        edit === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Sửa tên danh mục", value: name, onChange: (e) => setName(e.target.value) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm break-words", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          usage.data?.find((u) => u.catalog_id === c.id)?.orders_count ?? "—",
          " Order trong phạm vi xem"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: edit === c.id ? "Lưu tên" : "Sửa tên", disabled: busy, onClick: () => edit === c.id ? save(c, { name }) : (setEdit(c.id), setName(c.name)), children: edit === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Đưa lên", disabled: busy, onClick: () => move(c, -1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "size-3" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Đưa xuống", disabled: busy, onClick: () => move(c, 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "size-3" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { "aria-label": `Kích hoạt ${c.name}`, checked: c.active, disabled: busy, onCheckedChange: (active) => save(c, { active }) })
    ] }, c.id)) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error })
  ] });
}
const flowSchema = enumType(["photo", "marketing_design", "order_mockup"]);
const designGroupStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema
}).parse(data)).handler(createSsrRpc("7ae3c5e5f7e3eec5aebbffec85923e4327a2485cbfc84b0aa6c8f97652d76eb4"));
const designGroupListGroups = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0ed236a9ba66a1e2f9a4222d5a41568408815d48f9a175cf18ee0706ccf208ef"));
const designGroupSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema,
  groupId: stringType().trim().max(100),
  groupName: stringType().trim().max(200),
  enabled: booleanType()
}).parse(data)).handler(createSsrRpc("129b708f6dfc9435972772129a5b5c1bd085bc63e4521ca4c9beb7ab336d1053"));
const designGroupSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema
}).parse(data)).handler(createSsrRpc("b14b5d53da9d7f184ab7d3ccdb7b9c188fe63d57c5935c8aa58ff37982b4fe1e"));
const designGroupHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema
}).parse(data)).handler(createSsrRpc("0b2cbaddbab67da314f73654234222290becd59c1e05d1c6cbce3788f63e3641"));
const designGroupRetryEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
  flow: flowSchema,
  id: stringType().uuid()
}).parse(data)).handler(createSsrRpc("e242f45ad4f754d7b255df768ebf8b0489c3a237f31a49327ded2df8270c48e7"));
function DesignZaloSettings() {
  const [flow, setFlow] = reactExports.useState("photo");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Ba hệ Thiết kế dùng chung OA của Base; mỗi hệ bật/tắt và chọn Group riêng. Mặc định tắt, không gửi khi chưa liên kết." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2 sm:flex sm:flex-wrap", children: DESIGN_FLOWS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-h-11 justify-start sm:justify-center", size: "sm", variant: flow === f.key ? "secondary" : "outline", onClick: () => setFlow(f.key), children: f.label }, f.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DesignGroupPanel, { flow }, flow)
  ] });
}
function DesignGroupPanel({ flow }) {
  const qc = useQueryClient();
  const fnStatus = useServerFn(designGroupStatus), fnGroups = useServerFn(designGroupListGroups), fnSave = useServerFn(designGroupSave), fnTest = useServerFn(designGroupSendTest), fnHistory = useServerFn(designGroupHistory), fnRetry = useServerFn(designGroupRetryEvent);
  const status = useQuery({ queryKey: ["design-zalo", flow, "status"], queryFn: () => fnStatus({ data: { flow } }) });
  const history = useQuery({ queryKey: ["design-zalo", flow, "history"], queryFn: () => fnHistory({ data: { flow } }) });
  const [enabled, setEnabled] = reactExports.useState(false), [groupId, setGroupId] = reactExports.useState(""), [groupName, setGroupName] = reactExports.useState("");
  const [groups, setGroups] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState(""), [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (status.data) {
      setEnabled(status.data.enabled);
      setGroupId(status.data.groupId);
      setGroupName(status.data.groupName);
    }
  }, [status.data]);
  async function load() {
    setBusy(true);
    try {
      const r = await fnGroups();
      if (r.ok) setGroups(r.groups);
      else toast.error(r.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không tải được nhóm");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      const r = await fnSave({ data: { flow, enabled, groupId, groupName } });
      if (r.ok) {
        toast.success("Đã lưu");
        void qc.invalidateQueries({ queryKey: ["design-zalo", flow] });
      } else toast.error(r.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi lưu cấu hình");
    } finally {
      setBusy(false);
    }
  }
  async function test() {
    setBusy(true);
    try {
      const r = await fnTest({ data: { flow } });
      r.ok ? toast.success(r.message) : toast.error(r.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không gửi được");
    } finally {
      setBusy(false);
    }
  }
  if (status.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Đang tải cấu hình Zalo…" });
  if (status.isError) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Không tải được cấu hình. Kiểm tra quyền hoặc cập nhật database." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 sm:p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Thông báo Group Zalo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cấu hình độc lập cho từng hệ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: status.data?.oaConnected ? "default" : "secondary", children: status.data?.oaConnected ? "OA đã kết nối" : "OA chưa kết nối" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 text-sm font-medium", children: [
      "Bật gửi thông báo Group",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: enabled, onCheckedChange: setEnabled, "aria-label": "Bật thông báo Zalo của hệ này" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Group Zalo nhận thông báo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col gap-2 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "min-h-11 min-w-0 flex-1", value: groupId, placeholder: "Chưa chọn Group — liên kết sau", onChange: (e) => {
          setGroupId(e.target.value);
          setGroupName("");
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-h-11", variant: "outline", disabled: busy, onClick: load, children: "Chọn Group" })
      ] }),
      groupName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Đã chọn: ",
        groupName
      ] }),
      groups && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border max-h-48 overflow-auto p-2 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tìm Group…", value: search, onChange: (e) => setSearch(e.target.value) }),
        groups.filter((g) => (g.name + " " + g.id).toLowerCase().includes(search.toLowerCase())).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "block w-full text-left text-sm rounded-md p-2 hover:bg-accent", onClick: () => {
          setGroupId(g.id);
          setGroupName(g.name);
          setGroups(null);
        }, children: g.name }, g.id)),
        !groups.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "OA chưa thấy Group. Có thể nhập Group ID thủ công." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 sm:flex sm:flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-h-11", disabled: busy || enabled && !groupId.trim(), onClick: save, children: "Lưu cài đặt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-h-11", variant: "outline", disabled: busy || !groupId.trim(), onClick: test, children: "Gửi tin thử" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
        "Lịch sử gửi gần đây (",
        status.data?.failed ?? 0,
        " cần kiểm tra)"
      ] }),
      (history.data?.events ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có lượt gửi nào." }),
      (history.data?.events ?? []).map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-2 border-b text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: ev.status === "failed" ? "destructive" : "secondary", children: ev.status === "sent" ? "Đã gửi" : ev.status === "unknown" ? "Cần kiểm tra" : ev.status === "failed" ? "Lỗi" : ev.status === "skipped" ? "Bỏ qua" : "Đang chờ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate", children: ev.snapshot?.title ?? ev.event }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            new Date(ev.created_at).toLocaleString("vi-VN"),
            " ",
            ev.error ?? ""
          ] })
        ] }),
        (ev.status === "failed" || ev.status === "unknown") && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: async () => {
          if (ev.status === "unknown" && !window.confirm("Chưa xác minh Zalo có nhận tin hay chưa. Bạn đã kiểm tra Group để tránh gửi trùng?")) return;
          setBusy(true);
          try {
            const r = await fnRetry({ data: { flow, id: ev.id } });
            r.ok ? toast.success(r.message) : toast.error(r.message);
            void qc.invalidateQueries({ queryKey: ["design-zalo", flow] });
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Không gửi lại được");
          } finally {
            setBusy(false);
          }
        }, children: "Gửi lại" })
      ] }, ev.id))
    ] })
  ] });
}
const STEPS = ["Loại công việc", "Giao người thực hiện", "Tài liệu & xác nhận"];
function DesignWorkForm({ flow, onClose }) {
  const store = useStore();
  const { user, can } = useCurrentUser();
  const [step, setStep] = reactExports.useState(0);
  const [kind, setKind] = reactExports.useState(flow);
  const [id] = reactExports.useState(uid);
  const [title, setTitle] = reactExports.useState("");
  const [classification, setClassification] = reactExports.useState({});
  const [uploading, setUploading] = reactExports.useState(false);
  const catalogs = useDesignCatalogs();
  const [brief, setBrief] = reactExports.useState("");
  const [deadline, setDeadline] = reactExports.useState("");
  const [assignee, setAssignee] = reactExports.useState("");
  const [assigneeId, setAssigneeId] = reactExports.useState("");
  const [reviewerOverride, setReviewerOverride] = reactExports.useState(null);
  const reviewerId = reviewerOverride?.id || user?.id || "";
  const reviewer = reviewerOverride?.name || user?.fullName || user?.username || "";
  const [specialty, setSpecialty] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const fields = kind === "photo" ? ["Sản phẩm / Đối tượng", "Mục đích sử dụng", "Concept", "Địa điểm", "Thời gian dự kiến"] : kind === "order_mockup" ? ["Khách hàng / Đơn vị", "Mã đơn hàng", "Nội dung in", "Vị trí in / trang trí", "Yêu cầu kỹ thuật"] : ["Mục đích sử dụng", "Kênh sử dụng", "Nội dung thiết kế", "Kích thước / Định dạng"];
  const firstReady = !!kind && !!title.trim() && !!classification.workCategoryId && designCan(can, kind, "create");
  const reviewerReady = !!assigneeId && !!assignee && !!reviewerId && reviewerId !== assigneeId;
  function goNext() {
    setError("");
    if (step === 0) {
      if (!firstReady) {
        setError("Chọn loại thiết kế, loại công việc và nhập tên Job.");
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!reviewerReady) {
        setError("Chọn nhân viên thực hiện và người duyệt khác nhau.");
        return;
      }
      setStep(2);
    }
  }
  async function save() {
    if (!firstReady) {
      setStep(0);
      setError("Chọn loại, danh mục và tên Job.");
      return;
    }
    if (!reviewerReady) {
      setStep(1);
      setError("Cần chọn người thực hiện và người duyệt khác nhau.");
      return;
    }
    if (!kind || busy || uploading) return;
    const other = normalizeProducts(classification.productIds || [], classification.otherProducts || [], catalogs.data || []);
    if ((catalogs.data || []).some((c) => c.is_other && c.kind === "product" && classification.productIds?.includes(c.id)) && !other.length) {
      setError("Nhập ít nhất một tên sản phẩm khác.");
      return;
    }
    const name = user?.fullName || user?.username || "";
    setBusy(true);
    setError("");
    try {
      await saveDesignOrder(id, {
        id,
        title: title.trim(),
        brandId: "",
        workflowKind: kind,
        type: "Khác",
        ...classification,
        otherProducts: other,
        source: "Task lẻ",
        requester: name,
        reviewer: reviewer.trim(),
        reviewerId,
        assignee,
        assigneeId,
        status: "Chờ nhận việc",
        brief,
        deadline: deadline || void 0,
        specialty,
        revisions: 0,
        history: [{ at: (/* @__PURE__ */ new Date()).toISOString(), byId: user?.id, byName: name, action: "Tạo Job và giao trực tiếp", toStatus: "Chờ nhận việc" }]
      });
      await store.reload();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được Job.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "design-create-form min-w-0 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Các bước tạo Job", className: "shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 text-sm font-semibold sm:hidden", children: [
        "Bước ",
        step + 1,
        "/3 · ",
        STEPS[step]
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid grid-cols-3 gap-1.5 sm:gap-3", children: STEPS.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          disabled: busy || uploading || i > step,
          onClick: () => {
            setError("");
            setStep(i);
          },
          "aria-current": i === step ? "step" : void 0,
          "aria-label": `Bước ${i + 1}: ${label}`,
          className: `flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border p-2 text-left text-sm sm:justify-start ${i === step ? "border-primary bg-primary/10 font-semibold" : i < step ? "border-primary/40 text-foreground" : "text-muted-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex size-6 shrink-0 items-center justify-center rounded-full border border-current/30", children: i < step ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) : i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden min-w-0 leading-tight sm:inline", children: label })
          ]
        }
      ) }, label)) })
    ] }),
    step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "design-step-body space-y-4", "aria-label": "Bước 1: Loại công việc", children: [
      !flow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hệ Thiết kế *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            disabled: uploading || !!classification.inputAttachments?.length,
            value: kind || "",
            onValueChange: (v) => {
              setKind(v);
              setSpecialty({});
              setClassification({});
              setAssignee("");
              setAssigneeId("");
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "min-h-11", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn Chụp ảnh, Marketing hoặc Ma-két" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DESIGN_FLOWS.filter((f) => designCan(can, f.key, "create")).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.key, children: f.label }, f.key)) })
            ]
          }
        )
      ] }),
      kind && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên Job *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Ví dụ: Bộ ảnh sản phẩm tháng 11", className: "min-h-11" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DesignClassification, { flow: kind, value: classification, onChange: (p) => setClassification((c) => ({ ...c, ...p })) })
      ] })
    ] }),
    step === 1 && kind && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "design-step-body space-y-4", "aria-label": "Bước 2: Giao người thực hiện", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chọn người làm ngay khi tạo Job. Nhân viên Thiết kế có thể chuyển việc cho nhau sau đó." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DesignAssigneePicker,
        {
          flow: kind,
          value: assignee,
          valueId: assigneeId,
          onChange: (name, id2) => {
            setAssignee(name || "");
            setAssigneeId(id2 || "");
          },
          required: true,
          disabled: busy || uploading
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DesignReviewerPicker,
        {
          valueId: reviewerId,
          valueName: reviewer,
          onChange: (name, id2) => setReviewerOverride({ name, id: id2 }),
          assigneeId,
          disabled: busy || uploading,
          required: true
        }
      ),
      !reviewerOverride && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mặc định người duyệt là tài khoản tạo Job; muốn đổi hãy chọn từ danh sách." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hạn hoàn thành" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "min-h-11", type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nội dung yêu cầu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: brief,
            onChange: (e) => setBrief(e.target.value),
            rows: 4,
            placeholder: "Mô tả yêu cầu, mong muốn và kết quả cần bàn giao"
          }
        )
      ] })
    ] }),
    step === 2 && kind && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "design-step-body space-y-4", "aria-label": "Bước 3: Tài liệu và xác nhận", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/20 p-3 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Kiểm tra trước khi tạo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hệ:" }),
          " ",
          designLabel(kind)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Loại công việc:" }),
          " ",
          classification.workCategoryName || "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tên:" }),
          " ",
          title.trim()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người thực hiện:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: assignee })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Người duyệt:" }),
          " ",
          reviewer
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Deadline:" }),
          " ",
          deadline || "Chưa đặt"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tài liệu đầu vào (không bắt buộc)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DesignAttachments,
          {
            orderId: id,
            flow: kind,
            value: classification.inputAttachments || [],
            onChange: (inputAttachments) => setClassification((c) => ({ ...c, inputAttachments })),
            onBusy: setUploading
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-lg border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium", children: "Thông tin bổ sung (tùy chọn)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-3 sm:grid-cols-2", children: [
          fields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: field }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: specialty[field] || "", onChange: (e) => setSpecialty({ ...specialty, [field]: e.target.value }) })
          ] }, field)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số lượng / Khối lượng" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                value: specialty["Khối lượng"] || "",
                onChange: (e) => setSpecialty({ ...specialty, "Khối lượng": e.target.value })
              }
            )
          ] })
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "rounded-md bg-destructive/10 p-3 text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "design-create-footer sticky bottom-0 z-10 flex shrink-0 items-center justify-between gap-2 border-t bg-background pt-3 pb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-h-11 flex-1 sm:flex-none", variant: "outline", disabled: busy || uploading, onClick: () => step === 0 ? onClose() : (setStep(step - 1), setError("")), children: step === 0 ? "Hủy" : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 size-4" }),
        "Quay lại"
      ] }) }),
      step < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "min-h-11 flex-1 sm:flex-none", disabled: busy || uploading || (step === 0 ? !firstReady : !reviewerReady), onClick: goNext, children: [
        "Tiếp tục ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 size-4" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "min-h-11 flex-1 sm:flex-none", disabled: busy || uploading || !firstReady || !reviewerReady, onClick: save, children: busy ? "Đang lưu…" : "Tạo Job & giao việc" })
    ] })
  ] });
}
const PAGE_SIZE = 40;
const queues = [
  { key: "all", label: "Tất cả" },
  { key: "assigned", label: "Tôi phụ trách" },
  { key: "review", label: "Chờ tôi duyệt" },
  { key: "mine", label: "Tôi yêu cầu" }
];
function DesignWork({
  flow,
  reportOnly = false,
  openId,
  onCloseDeepLink
}) {
  const s = useStore();
  const { user, can } = useCurrentUser();
  const [report, setReport] = reactExports.useState(reportOnly);
  const [search, setSearch] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("all");
  const [stage, setStage] = reactExports.useState("all");
  const [queue, setQueue] = reactExports.useState("all");
  const [selectedFlow, setFlow] = reactExports.useState("all");
  const [person, setPerson] = reactExports.useState("all");
  const [deadline, setDeadline] = reactExports.useState("");
  const [filters, setFilters] = reactExports.useState(false);
  const [adding, setAdding] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(null);
  const [kanban, setKanban] = reactExports.useState(false);
  const [sort, setSort] = reactExports.useState("attention");
  const [limit, setLimit] = reactExports.useState(PAGE_SIZE);
  const catalogs = useDesignCatalogs();
  const [catalogOpen, setCatalogOpen] = reactExports.useState(false);
  const [settingsTab, setSettingsTab] = reactExports.useState("catalogs");
  const designTeam = useQuery({
    queryKey: ["design-team-access", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("design_team_access");
      if (error) throw error;
      return !!data;
    },
    staleTime: 6e4,
    retry: 1
  });
  const [category, setCategory] = reactExports.useState("all");
  const [product, setProduct] = reactExports.useState("all");
  const actor = user ?? {};
  const update = (change) => {
    change();
    setLimit(PAGE_SIZE);
  };
  const chooseQueue = (value2) => update(() => {
    setQueue(value2);
    setStage("all");
    setStatus("all");
  });
  const clearFilters = () => update(() => {
    setCategory("all");
    setProduct("all");
    setFlow("all");
    setPerson("all");
    setDeadline("");
    setStatus("all");
    setStage("all");
    setQueue("all");
    setSearch("");
  });
  if (!flow && !designTeam.data) return openId ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrderDetailDialog, { orderId: openId, open: true, onOpenChange: (v) => {
    if (!v) onCloseDeepLink?.();
  } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-muted-foreground", children: "Trang Tất cả thiết kế dành riêng cho bộ phận Thiết kế." });
  if (!designAny(can, "view") && !designAny(can, "report_view") && !designAny(can, "create"))
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Bạn không có quyền truy cập Thiết Kế." });
  if (flow && !designCan(can, flow, "view") && !designCan(can, flow, "report_view") && !designCan(can, flow, "create"))
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Bạn không có quyền truy cập luồng này." });
  const source = s.orders.filter((o) => !flow || o.workflowKind === flow);
  const query = search.trim().toLocaleLowerCase("vi");
  const base = source.filter(
    (o) => (category === "all" || o.workCategoryId === category) && (product === "all" || o.productIds?.includes(product)) && (selectedFlow === "all" || (selectedFlow === "unknown" ? !o.workflowKind : o.workflowKind === selectedFlow)) && (!query || `${o.title} ${o.id} ${o.assignee ?? ""} ${o.requester ?? ""}`.toLocaleLowerCase("vi").includes(query)) && (person === "all" || o.assignee === person) && (!deadline || o.deadline === deadline)
  );
  const scoped = base.filter((o) => designQueueMatches(o, queue, actor));
  const rows = sortDesignOrders(
    scoped.filter(
      (o) => (stage === "all" || designStage(o.status) === stage) && (status === "all" || o.status === status)
    ),
    sort
  );
  const visible = rows.slice(0, limit);
  const target = selected || openId || null;
  const advancedCount = [category, product, selectedFlow, person].filter((v) => v !== "all").length + Number(!!deadline) + Number(status !== "all");
  const hasFilters = advancedCount > 0 || stage !== "all" || queue !== "all" || !!query;
  const title = reportOnly ? "Báo cáo & Phân tích" : flow ? designLabel(flow) : "Tất cả thiết kế";
  const metrics = [
    {
      key: "open",
      label: "Đang mở",
      count: base.filter((o) => !designClosed(o)).length,
      icon: Clock3,
      note: "Công việc chưa kết thúc"
    },
    {
      key: "review",
      label: "Chờ tôi duyệt",
      count: base.filter((o) => designQueueMatches(o, "review", actor)).length,
      icon: CircleCheck,
      note: "Đúng người được chỉ định"
    },
    {
      key: "overdue",
      label: "Quá hạn",
      count: base.filter((o) => designOverdue(o)).length,
      icon: CircleAlert,
      note: "Cần ưu tiên xử lý"
    },
    {
      key: "unassigned",
      label: "Cần giao người",
      count: base.filter((o) => designQueueMatches(o, "unassigned", actor)).length,
      icon: Inbox,
      note: "Job cũ cần bổ sung nhân viên Thiết kế"
    }
  ];
  const controls = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Loại công việc" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: category,
          onValueChange: (v) => update(() => setCategory(v)),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả loại" }),
              (catalogs.data || []).filter(
                (c) => c.kind === "work" && (!flow || c.workflow_kind === flow)
              ).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id))
            ] })
          ]
        }
      )
    ] }),
    (!flow || flow === "order_mockup") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sản phẩm áp dụng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: product,
          onValueChange: (v) => update(() => setProduct(v)),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả sản phẩm" }),
              (catalogs.data || []).filter((c) => c.kind === "product").map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id))
            ] })
          ]
        }
      )
    ] }),
    !flow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Luồng công việc" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: selectedFlow,
          onValueChange: (v) => update(() => setFlow(v)),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả luồng" }),
              DESIGN_FLOWS.filter((f) => designCan(can, f.key, "view")).map(
                (f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.key, children: f.label }, f.key)
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unknown", children: "Chưa phân loại luồng" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người thực hiện" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: person,
          onValueChange: (v) => update(() => setPerson(v)),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả" }),
              [
                ...new Set(
                  source.map((o) => o.assignee).filter((n) => !!n)
                )
              ].sort().map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái chi tiết" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: status,
          onValueChange: (v) => update(() => {
            setStatus(v);
            setStage("all");
          }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả trạng thái" }),
              ORDER_STATUSES.map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: st, children: st }, st))
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "date",
          value: deadline,
          onChange: (e) => update(() => setDeadline(e.target.value))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: clearFilters, children: "Xóa bộ lọc" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1", onClick: () => setFilters(false), children: [
        "Xem ",
        rows.length,
        " công việc"
      ] })
    ] })
  ] });
  const card = (o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: `design-work-card min-w-0 rounded-xl border bg-card p-3 shadow-sm sm:p-4 ${designOverdue(o) ? "border-l-4 border-l-destructive" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: o.status }),
          (o.priority === "Gấp" || o.priority === "Cao") && /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: o.priority })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "design-work-card-title mb-1 block min-h-11 w-full break-words text-left text-base font-semibold leading-6 hover:text-primary focus-visible:outline-primary",
            onClick: () => setSelected(o.id),
            children: o.title || "Công việc chưa đặt tên"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 break-words text-[13px] leading-5 text-muted-foreground sm:mb-4", children: flow ? workLabel(o, catalogs.data || []) : designLabel(o.workflowKind) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "size-4 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 break-words", children: o.assignee || "Cần giao người" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: `flex items-center gap-2 ${designOverdue(o) ? "font-medium text-destructive" : "text-muted-foreground"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "size-4 shrink-0" }),
                o.deadline ? fmtDate(o.deadline) : "Chưa có deadline",
                designOverdue(o) && " · Quá hạn"
              ]
            }
          )
        ] }),
        o.status === "Cần sửa" && o.reviewNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 line-clamp-2 rounded-md bg-destructive/5 p-2 text-xs text-destructive", children: o.reviewNotes }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 truncate text-[13px] text-muted-foreground", children: [
            "Yêu cầu: ",
            o.requester || "—"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "min-h-11 shrink-0 px-3 text-sm font-medium text-primary",
              onClick: () => setSelected(o.id),
              children: [
                "Mở Job",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "ml-1 size-3.5" })
              ]
            }
          )
        ] })
      ]
    },
    o.id
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "design-workspace min-w-0 w-full max-w-full space-y-5 pb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex min-w-0 items-start justify-between gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Không gian Thiết kế" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold leading-snug tracking-tight md:text-2xl", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 hidden text-sm text-muted-foreground sm:block", children: "Theo dõi đầu việc, phản hồi và bàn giao trên cùng một luồng." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
        can("settings.role") && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            "aria-label": "Cài đặt Thiết kế",
            onClick: () => setCatalogOpen(true),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "size-4" })
          }
        ),
        !reportOnly && (flow ? designCan(can, flow, "create") : designAny(can, "create")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "min-h-11 gap-1.5 px-3 sm:px-4", onClick: () => setAdding(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tạo Job" })
        ] })
      ] })
    ] }),
    flow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 border-b pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: !report ? "secondary" : "ghost",
          onClick: () => setReport(false),
          children: "Công việc"
        }
      ),
      designCan(can, flow, "report_view") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: report ? "secondary" : "ghost",
          onClick: () => setReport(true),
          children: "Báo cáo"
        }
      )
    ] }),
    report ? designAny(can, "report_view") && /* @__PURE__ */ jsxRuntimeExports.jsx(OrderReport, { flow }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 xl:grid-cols-4", children: metrics.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          "aria-pressed": queue === m.key,
          onClick: () => chooseQueue(m.key),
          className: `min-w-0 rounded-xl border bg-card p-3 text-left transition-colors sm:p-4 hover:border-primary/50 focus-visible:outline-primary ${queue === m.key ? "border-primary/60 ring-1 ring-primary/10" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 text-sm font-medium leading-5 text-foreground/85", children: m.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                m.icon,
                {
                  className: `size-4 ${m.key === "overdue" && m.count ? "text-destructive" : "text-muted-foreground"}`
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: `my-1.5 text-2xl font-semibold tabular-nums ${m.key === "overdue" && m.count ? "text-destructive" : ""}`,
                children: s.loaded ? m.count : "—"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hidden text-xs text-muted-foreground sm:block", children: m.note })
          ]
        },
        m.key
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-w-0 rounded-xl border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex gap-1 overflow-x-auto border-b px-3 pt-2",
            "aria-label": "Phạm vi công việc",
            children: queues.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "aria-pressed": queue === q.key,
                onClick: () => chooseQueue(q.key),
                className: `shrink-0 border-b-2 px-3 py-3 text-sm font-medium ${queue === q.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
                children: [
                  q.label,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded bg-muted px-1.5 py-0.5 text-xs tabular-nums", children: base.filter((o) => designQueueMatches(o, q.key, actor)).length })
                ]
              },
              q.key
            ))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-3 md:p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 basis-full flex-1 sm:basis-48", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "aria-label": "Tìm công việc thiết kế",
                  className: "min-h-11 pl-9 text-base sm:text-sm",
                  placeholder: "Tìm Job, người thực hiện…",
                  value: search,
                  onChange: (e) => update(() => setSearch(e.target.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "min-h-11", variant: "outline", onClick: () => setFilters(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "mr-1 size-4" }),
              "Bộ lọc",
              advancedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded bg-primary px-1.5 text-xs text-primary-foreground", children: advancedCount })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "ml-auto hidden shrink-0 rounded-lg border p-0.5 md:flex",
                "aria-label": "Cách hiển thị",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: !kanban ? "secondary" : "ghost",
                      size: "icon",
                      className: "size-9",
                      "aria-label": "Danh sách",
                      "aria-pressed": !kanban,
                      onClick: () => setKanban(false),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "size-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: kanban ? "secondary" : "ghost",
                      size: "icon",
                      className: "size-9",
                      "aria-label": "Kanban",
                      "aria-pressed": kanban,
                      onClick: () => setKanban(true),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "size-4" })
                    }
                  )
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex gap-1 overflow-x-auto pb-1",
              "aria-label": "Chặng xử lý",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: stage === "all" ? "secondary" : "ghost",
                    onClick: () => update(() => {
                      setStage("all");
                      setStatus("all");
                    }),
                    children: [
                      "Mọi chặng",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 tabular-nums", children: scoped.length })
                    ]
                  }
                ),
                DESIGN_STAGES.map((st) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: stage === st.key ? "secondary" : "ghost",
                    className: "shrink-0",
                    onClick: () => update(() => {
                      setStage(st.key);
                      setStatus("all");
                    }),
                    children: [
                      st.label,
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs tabular-nums", children: scoped.filter((o) => designStage(o.status) === st.key).length })
                    ]
                  },
                  st.key
                ))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                rows.length,
                " công việc"
              ] }),
              (queue === "open" || queue === "overdue" || queue === "unassigned") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-muted px-2 py-1", children: queue === "open" ? "Đang mở" : queue === "overdue" ? "Quá hạn" : "Cần giao người" }),
              hasFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: clearFilters,
                  className: "flex items-center gap-1 text-primary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }),
                    "Xóa lọc"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: sort,
                onValueChange: (v) => update(() => setSort(v)),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "h-8 w-44 text-xs",
                      "aria-label": "Sắp xếp công việc",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "attention", children: "Ưu tiên xử lý" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "deadline", children: "Deadline gần nhất" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "newest", children: "Mới tạo gần nhất" })
                  ] })
                ]
              }
            )
          ] })
        ] })
      ] }),
      !s.loaded ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "rounded-xl border p-10 text-center text-sm text-muted-foreground",
          role: "status",
          children: "Đang tải công việc…"
        }
      ) : !rows.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed bg-card px-5 py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "mx-auto mb-3 size-8 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium", children: hasFilters ? "Không có công việc phù hợp" : "Chưa có công việc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: hasFilters ? "Thử đổi phạm vi hoặc bỏ bộ lọc để xem thêm." : "Tạo yêu cầu đầu tiên để bắt đầu theo dõi." }),
        hasFilters && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "mt-4",
            variant: "outline",
            onClick: clearFilters,
            children: "Xóa bộ lọc"
          }
        )
      ] }) : kanban ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex snap-x gap-3 overflow-x-auto pb-4",
          "aria-label": "Bảng tiến độ thiết kế",
          children: DESIGN_STAGES.filter(
            (st) => stage === "all" || stage === st.key
          ).map((st) => {
            const items = rows.filter(
              (o) => designStage(o.status) === st.key
            );
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "section",
              {
                className: "w-[min(80vw,320px)] shrink-0 snap-start rounded-xl bg-muted/50 p-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between gap-2 px-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: st.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-background px-2 py-1 text-xs tabular-nums", children: items.length })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                    items.slice(0, limit).map(card),
                    !items.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground", children: "Chưa có công việc" }),
                    items.length > limit && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        className: "w-full",
                        onClick: () => setLimit((v) => v + PAGE_SIZE),
                        children: [
                          "Xem thêm ",
                          Math.min(PAGE_SIZE, items.length - limit),
                          " ",
                          "việc"
                        ]
                      }
                    )
                  ] })
                ]
              },
              st.key
            );
          })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-w-0 gap-3 md:hidden", children: visible.map(card) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden overflow-x-auto rounded-xl border bg-card md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[780px] text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
            "Công việc",
            "Thực hiện / Người duyệt",
            "Tiến độ",
            "Deadline",
            ""
          ].map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium", children: t }, i)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: visible.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/25", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "max-w-80 px-4 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "break-words text-left font-medium hover:text-primary",
                  onClick: () => setSelected(o.id),
                  children: o.title
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                !flow && `${designLabel(o.workflowKind)} · `,
                workLabel(o, catalogs.data || []),
                o.priority === "Gấp" && " · Ưu tiên gấp"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: o.assignee || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chưa phân công" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                "Duyệt: ",
                o.reviewer || o.requester || "Chưa chọn"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: o.status }),
              !!o.revisions && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                o.revisions,
                " lần sửa"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "td",
              {
                className: `whitespace-nowrap px-4 py-4 ${designOverdue(o) ? "text-destructive" : "text-muted-foreground"}`,
                children: [
                  o.deadline ? fmtDate(o.deadline) : "Chưa đặt",
                  designOverdue(o) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs", children: "Quá hạn" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                "aria-label": `Mở ${o.title}`,
                onClick: () => setSelected(o.id),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4" })
              }
            ) })
          ] }, o.id)) })
        ] }) }),
        rows.length > limit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => setLimit((v) => v + PAGE_SIZE),
              children: [
                "Xem thêm ",
                Math.min(PAGE_SIZE, rows.length - limit),
                " công việc"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
            "Đang hiển thị ",
            visible.length,
            " / ",
            rows.length
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: catalogOpen, onOpenChange: setCatalogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "design-mobile-dialog max-h-[85dvh] max-w-2xl overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cài đặt Thiết kế" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-b pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: settingsTab === "catalogs" ? "secondary" : "outline", onClick: () => setSettingsTab("catalogs"), children: "Danh mục" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: settingsTab === "zalo" ? "secondary" : "outline", onClick: () => setSettingsTab("zalo"), children: "Thông báo Zalo Group" })
      ] }),
      settingsTab === "catalogs" ? /* @__PURE__ */ jsxRuntimeExports.jsx(DesignCatalogSettings, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(DesignZaloSettings, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: filters, onOpenChange: setFilters, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { className: "design-mobile-sheet overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Bộ lọc công việc" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: controls })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adding, onOpenChange: setAdding, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "design-mobile-dialog design-create-dialog max-h-[85dvh] max-w-2xl overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Tạo ",
        flow ? designLabel(flow) : "công việc"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DesignWorkForm,
        {
          flow,
          onClose: () => setAdding(false)
        },
        `${flow}-${adding}`
      )
    ] }) }),
    target && s.loaded && !s.orders.some((o) => o.id === target) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-destructive", children: "Order không tồn tại hoặc bạn không có quyền xem." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      OrderDetailDialog,
      {
        orderId: target,
        open: !!target,
        onOpenChange: (v) => {
          if (!v) {
            setSelected(null);
            onCloseDeepLink?.();
          }
        }
      },
      target
    )
  ] });
}
export {
  DesignWork as D
};
