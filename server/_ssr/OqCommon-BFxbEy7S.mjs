import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as useAuth, B as Button, aR as Progress, D as Dialog, x as DialogContent, A as DialogTitle, bt as Popover, bu as PopoverTrigger, j as cn, bv as PopoverContent, l as Badge, I as Input } from "./router-CkmTURa-.mjs";
import { C as Command, a as CommandInput, b as CommandList, c as CommandEmpty, d as CommandGroup, e as CommandItem } from "./command-DR-zJx0h.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { I as IMG_CAT, f as flowStatusLabel, o as oqApi } from "./logic-BXklg4nZ.mjs";
import { aG as ImagePlus, Q as Camera, b9 as RotateCw, bp as ChevronsUpDown, q as Check, ap as Trash2 } from "../_libs/lucide-react.mjs";
function useUserName() {
  const users = useAuth((s) => s.users);
  return (id) => id ? users.find((u) => u.id === id)?.fullName ?? "—" : "—";
}
function FlowBadge({ kind, status, waiting }) {
  const tone = status === "answered" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : status === "processing" ? waiting ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200" : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" : status === "cancelled" ? "bg-muted text-muted-foreground line-through" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex flex-wrap gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: cn("border-0 font-medium", tone), children: [
      kind === "price" ? "Giá" : "Tiến độ",
      ": ",
      flowStatusLabel(kind, status)
    ] }),
    waiting && status === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-dashed", children: "Đang chờ Sale bổ sung" })
  ] });
}
function ProductQuantity({ qty, unit }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[110px_minmax(0,1fr)] gap-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Số lượng:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 break-words font-medium", children: qty === null || qty === void 0 || qty === "" ? "—" : `${qty}${unit ? ` ${unit}` : ""}` })
  ] });
}
function useSignedUrls(paths) {
  return useQuery({ queryKey: ["oq-img", paths.join("|")], queryFn: () => oqApi.signedUrls(paths), enabled: paths.length > 0, staleTime: 30 * 60 * 1e3 }).data ?? {};
}
function useKeyboardOpen() {
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const h = () => setOpen(window.innerHeight - vv.height > 150);
    vv.addEventListener("resize", h);
    h();
    return () => vv.removeEventListener("resize", h);
  }, []);
  return open;
}
function MobileActionBar({ children, className }) {
  const kb = useKeyboardOpen();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
    "z-20 md:static md:mt-6 md:border-0 md:bg-transparent md:p-0",
    kb ? "static mt-4" : "fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-lg md:shadow-none",
    className
  ), children });
}
function UserPicker({ users, value, onChange, placeholder = "Chọn nhân viên Cung ứng", invalid }) {
  const [open, setOpen] = reactExports.useState(false);
  const cur = users.find((u) => u.id === value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", "aria-invalid": invalid, className: cn("w-full justify-between h-11 font-normal", invalid && "border-destructive"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
        cur && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary", children: initials(cur.full_name) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("truncate", !cur && "text-muted-foreground"), children: cur?.full_name ?? placeholder })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "h-4 w-4 shrink-0 opacity-50" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[--radix-popover-trigger-width] max-w-[calc(100vw-1.5rem)] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Tìm theo tên…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { className: "max-h-64", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "Không tìm thấy." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandItem, { value: `${u.full_name} ${u.id}`, onSelect: () => {
          onChange(u.id);
          setOpen(false);
        }, className: "py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary", children: initials(u.full_name) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: u.full_name }),
          u.id === value && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" })
        ] }, u.id)) })
      ] })
    ] }) })
  ] });
}
const initials = (n) => n.trim().split(/\s+/).slice(-2).map((w) => w[0]?.toUpperCase() ?? "").join("");
function ItemImages({ images, editable, onAdd, onChanged }) {
  const urls = useSignedUrls(images.map((i) => i.path));
  const [zoom, setZoom] = reactExports.useState(null);
  const [cat, setCat] = reactExports.useState("product");
  const [prog, setProg] = reactExports.useState(null);
  const [failed, setFailed] = reactExports.useState([]);
  const upload = async (list) => {
    if (!list.length || !onAdd) return;
    const bad = [];
    setProg({ done: 0, total: list.length });
    for (let i = 0; i < list.length; i++) {
      try {
        await onAdd(list[i].file, list[i].cat);
      } catch (e) {
        bad.push({ ...list[i], msg: e.message });
      }
      setProg({ done: i + 1, total: list.length });
    }
    setProg(null);
    setFailed(bad);
    if (bad.length) toast.error(`${bad.length} ảnh chưa tải được — bấm Thử lại.`);
    if (bad.length < list.length) onChanged?.();
  };
  const pick = (fl) => fl?.length && upload(Array.from(fl).map((file) => ({ file, cat })));
  const busy = !!prog;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    images.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2", children: images.map((im) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setZoom(im), className: "block aspect-square w-full overflow-hidden rounded-md border bg-muted", children: urls[im.path] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: urls[im.path] ?? void 0, alt: im.caption ?? IMG_CAT[im.category], loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: IMG_CAT[im.category] }),
      editable ? /* @__PURE__ */ jsxRuntimeExports.jsx(CaptionEdit, { im, onChanged }) : im.caption && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs line-clamp-2", children: im.caption })
    ] }, im.id)) }),
    editable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cat, onValueChange: setCat, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "col-span-2 h-10 sm:h-9 sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(IMG_CAT).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "h-10 sm:h-9", disabled: busy, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-4 w-4 mr-1" }),
        "Thư viện",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", multiple: true, hidden: true, disabled: busy, onChange: (e) => {
          pick(e.target.files);
          e.target.value = "";
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "h-10 sm:h-9", disabled: busy, asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 mr-1" }),
        "Chụp ảnh",
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", capture: "environment", hidden: true, disabled: busy, onChange: (e) => {
          pick(e.target.files);
          e.target.value = "";
        } })
      ] }) })
    ] }),
    prog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: prog.done / prog.total * 100, className: "h-1.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Đang tải ảnh ",
        Math.min(prog.done + 1, prog.total),
        "/",
        prog.total,
        "…"
      ] })
    ] }),
    failed.length > 0 && !busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-destructive/40 p-2 text-xs space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        failed.length,
        " ảnh chưa tải được: ",
        failed[0].msg
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "h-8", onClick: () => upload(failed.map(({ file, cat: cat2 }) => ({ file, cat: cat2 }))), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-3.5 w-3.5 mr-1" }),
          "Thử lại"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "ghost", className: "h-8", onClick: () => setFailed([]), children: "Bỏ qua" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!zoom, onOpenChange: (o) => !o && setZoom(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl w-[calc(100vw-1rem)] p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "sr-only", children: "Xem ảnh" }),
      zoom && urls[zoom.path] && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: urls[zoom.path] ?? void 0, alt: zoom.caption ?? void 0, className: "max-h-[80dvh] w-full object-contain" }),
      zoom?.caption && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 pb-2 text-sm", children: zoom.caption })
    ] }) })
  ] });
}
function CaptionEdit({ im, onChanged }) {
  const [v, setV] = reactExports.useState(im.caption ?? "");
  reactExports.useEffect(() => setV(im.caption ?? ""), [im.caption]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value: v,
        onChange: (e) => setV(e.target.value),
        placeholder: "Chú thích",
        className: "h-8 text-xs px-2",
        onBlur: () => v !== (im.caption ?? "") && oqApi.updateImage(im.id, im.category, v).then(onChanged).catch((e) => toast.error(e.message))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Xóa ảnh", className: "p-1.5 text-destructive", onClick: () => confirm("Xóa ảnh này?") && oqApi.deleteImage(im.id).then(onChanged).catch((e) => toast.error(e.message)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
  ] });
}
export {
  FlowBadge as F,
  ItemImages as I,
  MobileActionBar as M,
  ProductQuantity as P,
  UserPicker as U,
  useUserName as u
};
