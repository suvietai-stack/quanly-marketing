import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { bD as Route$B, P as PageHeader, j as cn, C as Card, o as CardContent, L as Label, I as Input, B as Button, N as Checkbox } from "./router-CkmTURa-.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { R as Root2, I as Item2, a as Indicator } from "../_libs/radix-ui__react-radio-group.mjs";
import { o as oqApi, P as PRICE_CATS, a as vnDate } from "./logic-BXklg4nZ.mjs";
import { u as useUserName, P as ProductQuantity, I as ItemImages, U as UserPicker, M as MobileActionBar } from "./OqCommon-BFxbEy7S.mjs";
import "../_libs/seroval.mjs";
import { n as ChevronDown, ap as Trash2, a6 as Plus, t as Circle } from "../_libs/lucide-react.mjs";
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
import "./command-DR-zJx0h.mjs";
import "../_libs/cmdk.mjs";
import "./select-CHuMrfap.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
const RadioGroup = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { className: cn("grid gap-2", className), ...props, ref });
});
RadioGroup.displayName = Root2.displayName;
const RadioGroupItem = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Item2,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5 fill-primary" }) })
    }
  );
});
RadioGroupItem.displayName = Item2.displayName;
const newItem = () => ({
  key: crypto.randomUUID(),
  name: "",
  qty: "",
  unit: "bộ",
  detail: "",
  processing: "",
  note: ""
});
const empty = {
  title: "",
  delivery_place: "",
  delivery_date: "",
  note: "",
  items_mode: "option",
  want_price: false,
  want_progress: false,
  items: [newItem()],
  price: {
    items: {},
    shipping_mode: "per_item"
  },
  progress: {
    check_type: "capability"
  },
  price_assignee: "",
  progress_assignee: ""
};
const STEPS = ["Thông tin đơn hàng", "Sản phẩm", "Nội dung hỏi & Cung ứng", "Kiểm tra & gửi"];
function OqForm() {
  const {
    id: initialId
  } = Route$B.useSearch();
  const nav = useNavigate();
  const name = useUserName();
  const [id, setId] = reactExports.useState(initialId ?? null);
  const [f, setF] = reactExports.useState(empty);
  const [step, setStep] = reactExports.useState(0);
  const [busy, setBusy] = reactExports.useState(false);
  const [images, setImages] = reactExports.useState([]);
  const [loaded, setLoaded] = reactExports.useState(!initialId);
  const [collapsed, setCollapsed] = reactExports.useState(/* @__PURE__ */ new Set());
  const toggleItem = (k) => setCollapsed((c) => {
    const n = new Set(c);
    n.has(k) ? n.delete(k) : n.add(k);
    return n;
  });
  const priceUsers = useQuery({
    queryKey: ["oq-assignees", "price"],
    queryFn: () => oqApi.assignees("price")
  }).data ?? [];
  const progUsers = useQuery({
    queryKey: ["oq-assignees", "progress"],
    queryFn: () => oqApi.assignees("progress")
  }).data ?? [];
  const reload = async (rid, keepForm = false) => {
    const d = await oqApi.detail(rid);
    if (!d) {
      toast.error("Không tìm thấy bản nháp.");
      return;
    }
    if (d.req.status !== "draft") {
      nav({
        to: "/order-quotes/$id",
        params: {
          id: rid
        },
        search: {
          flow: void 0
        }
      });
      return;
    }
    setImages(d.images);
    const items = d.items.map((i) => ({
      id: i.id,
      key: i.id,
      name: i.name ?? "",
      qty: i.qty == null ? "" : String(i.qty),
      unit: i.unit ?? "",
      detail: i.detail ?? "",
      processing: i.processing ?? "",
      note: i.note ?? ""
    }));
    if (keepForm) {
      setF((p) => ({
        ...p,
        items: p.items.map((it, idx) => ({
          ...it,
          id: items[idx]?.id,
          key: items[idx]?.id ?? it.key
        }))
      }));
      return;
    }
    const c = d.req.draft_config ?? {};
    setF({
      title: d.req.title ?? "",
      delivery_place: d.req.delivery_place ?? "",
      delivery_date: d.req.delivery_date ?? "",
      note: d.req.note ?? "",
      items_mode: d.req.items_mode,
      want_price: d.req.want_price,
      want_progress: d.req.want_progress,
      items: items.length ? items : [newItem()],
      price: c.price ?? {
        items: {},
        shipping_mode: "per_item"
      },
      progress: c.progress ?? {
        check_type: "capability"
      },
      price_assignee: c.price_assignee ?? "",
      progress_assignee: c.progress_assignee ?? ""
    });
    setLoaded(true);
  };
  reactExports.useEffect(() => {
    if (initialId) reload(initialId);
  }, [initialId]);
  const payload = (forSubmit = false) => ({
    title: f.title,
    delivery_place: f.delivery_place,
    delivery_date: f.delivery_date,
    note: f.note,
    items_mode: f.items_mode,
    want_price: f.want_price,
    want_progress: f.want_progress,
    items: f.items.map(({
      id: id2,
      name: name2,
      qty,
      unit,
      detail,
      processing,
      note
    }) => ({
      id: id2,
      name: name2,
      qty,
      unit,
      detail,
      processing,
      note
    })),
    config: {
      price: f.price,
      progress: forSubmit ? {
        content: f.progress.content,
        per_item: f.progress.per_item,
        check_type: "capability"
      } : f.progress,
      price_assignee: f.want_price ? f.price_assignee : "",
      progress_assignee: f.want_progress ? f.progress_assignee : ""
    }
  });
  const save = async (quiet = false, forSubmit = false) => {
    const rid = await oqApi.save(id, payload(forSubmit));
    if (!id) {
      setId(rid);
      nav({
        to: "/order-quotes/new",
        search: {
          id: rid
        },
        replace: true
      });
    }
    await reload(rid, true);
    if (!quiet) toast.success("Đã lưu nháp.");
    return rid;
  };
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const setItem = (k, patch) => setF((p) => ({
    ...p,
    items: p.items.map((i) => i.key === k ? {
      ...i,
      ...patch
    } : i)
  }));
  const needPlace = f.want_price && (f.price.shipping_mode === "common" || f.items.some((i) => i.id && f.price.items?.[i.id]?.shipping?.on));
  const needDate = f.want_progress;
  const fieldErrs = (s) => {
    const e = {};
    if (s === 0) {
      if (!f.title.trim()) e.title = "Nhập tên yêu cầu.";
      if (needPlace && !f.delivery_place.trim()) e.delivery_place = "Vui lòng bổ sung địa điểm giao hàng để Cung ứng báo giá vận chuyển.";
      if (needDate && !f.delivery_date) e.delivery_date = "Vui lòng bổ sung ngày khách cần nhận hàng để Cung ứng kiểm tra khả năng đáp ứng.";
    }
    if (s === 1) {
      if (f.items.length === 0) e.items = "Cần ít nhất một sản phẩm.";
      for (const i of f.items) {
        if (!i.name.trim()) e[`${i.key}.name`] = "Nhập tên sản phẩm.";
        const q = Number(i.qty);
        if (i.qty.trim() === "" || !Number.isFinite(q) || q <= 0) e[`${i.key}.qty`] = "Số lượng phải lớn hơn 0.";
        if (!i.unit.trim()) e[`${i.key}.unit`] = "Nhập đơn vị tính.";
        if (!i.detail.trim()) e[`${i.key}.detail`] = "Nhập thông tin chi tiết sản phẩm.";
      }
    }
    if (s === 2) {
      if (!f.want_price && !f.want_progress) e.flows = "Chọn ít nhất Hỏi Giá hoặc Hỏi Tiến Độ.";
      if (f.want_price && !priceUsers.some((u) => u.id === f.price_assignee)) e.price_assignee = "Chọn người phụ trách Hỏi Giá.";
      if (f.want_price && f.price.shipping_mode !== "common" && !f.items.some((i) => i.id && Object.values(f.price.items?.[i.id] ?? {}).some((c) => c?.on))) e.price_cats = "Chọn ít nhất một hạng mục cần báo giá.";
      if (f.want_progress && !progUsers.some((u) => u.id === f.progress_assignee)) e.progress_assignee = "Chọn người phụ trách Hỏi Tiến Độ.";
      if (f.want_progress && !f.progress.content?.trim()) e.progress_content = "Nhập nội dung cần kiểm tra.";
    }
    return e;
  };
  const [tried, setTried] = reactExports.useState(/* @__PURE__ */ new Set());
  const err = (k) => tried.has(step) ? fieldErrs(step)[k] : void 0;
  const stepErr = (s) => {
    const e = fieldErrs(s);
    const n = Object.keys(e).length;
    return n ? `Còn ${n} mục cần bổ sung ở bước ${s + 1} (xem các ô báo đỏ).` : null;
  };
  const next = () => run(async () => {
    const e = stepErr(step);
    if (e) {
      setTried((t) => new Set(t).add(step));
      throw new Error(e);
    }
    if (step === 1) await save(true);
    setStep((s) => s + 1);
    window.scrollTo({
      top: 0
    });
  });
  const submit = () => run(async () => {
    for (let s = 0; s < 3; s++) {
      const fe = fieldErrs(s);
      const e = stepErr(s);
      if (e) {
        setTried((t) => new Set(t).add(s));
        setStep(s);
        const k = Object.keys(fe)[0];
        setTimeout(() => {
          const el = document.getElementById(`oq-f-${k}`);
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
            el.focus();
          } else window.scrollTo({
            top: 0
          });
        }, 80);
        throw new Error(fe.delivery_place || fe.delivery_date || e);
      }
    }
    const rid = await save(true, true);
    const code = await oqApi.submit(rid);
    toast.success(`Đã gửi yêu cầu ${code}.`);
    nav({
      to: "/order-quotes/$id",
      params: {
        id: rid
      },
      search: {
        flow: void 0
      }
    });
  });
  const togglePriceCat = (itemId, cat, on) => setF((p) => {
    const items = {
      ...p.price.items ?? {}
    };
    const cur = {
      ...items[itemId] ?? {}
    };
    cur[cat] = {
      ...cur[cat] ?? {},
      on
    };
    items[itemId] = cur;
    return {
      ...p,
      price: {
        ...p.price,
        items
      }
    };
  });
  const setPriceNote = (itemId, cat, note) => setF((p) => {
    const items = {
      ...p.price.items ?? {}
    };
    const cur = {
      ...items[itemId] ?? {}
    };
    cur[cat] = {
      ...cur[cat] ?? {},
      note
    };
    items[itemId] = cur;
    return {
      ...p,
      price: {
        ...p.price,
        items
      }
    };
  });
  if (!loaded) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang tải bản nháp…" });
  const itemImgs = (itemId) => images.filter((g) => g.item_id === itemId);
  const curErr = tried.has(step) ? stepErr(step) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "oq-mobile-create max-w-4xl mx-auto pb-32 md:pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: id ? "Bản nháp yêu cầu" : "Tạo yêu cầu", description: "Phân loại: Đơn Sứ Quà Tặng" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:hidden mb-2 text-sm font-semibold", children: [
      "Bước ",
      step + 1,
      "/4 — ",
      STEPS[step]
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "md:hidden mb-4 rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs leading-5 text-muted-foreground", children: ["Đặt tên yêu cầu và thông tin giao hàng.", "Thêm sản phẩm, số lượng và ảnh cần thiết.", "Chọn hỏi giá hoặc tiến độ, rồi chọn người trả lời.", "Kiểm tra lại thông tin trước khi gửi."][step] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid grid-cols-4 gap-1 mb-5", children: STEPS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": `Bước ${i + 1}: ${s}`, onClick: () => i < step && setStep(i), className: cn("w-full text-left rounded-md px-2 text-xs sm:text-sm border h-2 sm:h-auto sm:py-2", i === step ? "bg-primary text-primary-foreground border-primary" : i < step ? "bg-primary/40 sm:bg-accent border-primary/40 sm:border-border" : "bg-muted text-muted-foreground"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
        i + 1,
        "."
      ] }),
      " ",
      s
    ] }) }) }, s)) }),
    step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 sm:p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phân loại đơn hàng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: "Đơn Sứ Quà Tặng", disabled: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên yêu cầu *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.title, "aria-invalid": !!err("title"), onChange: (e) => setF({
          ...f,
          title: e.target.value
        }), maxLength: 300 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("title") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "oq-f-delivery_place", children: [
            "Địa điểm giao hàng",
            needPlace && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " *" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "oq-f-delivery_place", value: f.delivery_place, "aria-invalid": !!err("delivery_place"), onChange: (e) => setF({
            ...f,
            delivery_place: e.target.value
          }) }),
          needPlace && !err("delivery_place") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Bắt buộc vì bạn yêu cầu báo giá vận chuyển." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("delivery_place") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "oq-f-delivery_date", children: [
            "Ngày khách yêu cầu giao",
            needDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " *" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "oq-f-delivery_date", type: "date", className: "h-11", value: f.delivery_date, "aria-invalid": !!err("delivery_date"), onChange: (e) => setF({
            ...f,
            delivery_date: e.target.value
          }) }),
          needDate && !err("delivery_date") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Bắt buộc vì bạn chọn Hỏi Tiến Độ." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("delivery_date") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú chung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: f.note, onChange: (e) => setF({
          ...f,
          note: e.target.value
        }) })
      ] })
    ] }) }),
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Các sản phẩm trong yêu cầu là" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { value: f.items_mode, onValueChange: (v) => setF({
          ...f,
          items_mode: v
        }), className: "grid sm:grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded-md border p-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "option", className: "mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Phương án để khách lựa chọn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Không cộng số lượng giữa các phương án." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded-md border p-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "bundle", className: "mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Sản phẩm khách đặt đồng thời" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Khách cần tất cả các sản phẩm." })
            ] })
          ] })
        ] })
      ] }) }),
      f.items.map((it, idx) => {
        const hasErr = ["name", "qty", "unit", "detail"].some((k) => err(`${it.key}.${k}`));
        const isOpen = !collapsed.has(it.key) || hasErr;
        const imgs = itemImgs(it.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "flex min-w-0 flex-1 items-center gap-2 text-left", onClick: () => toggleItem(it.key), "aria-expanded": isOpen, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary", children: [
                "PA",
                String(idx + 1).padStart(2, "0")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("block truncate font-medium", !it.name && "text-muted-foreground"), children: it.name || "(chưa đặt tên)" }),
                !isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
                  imgs.length,
                  " ảnh"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180") })
            ] }),
            f.items.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Xóa sản phẩm", onClick: () => confirm(`Xóa PA${String(idx + 1).padStart(2, "0")}?`) && setF({
              ...f,
              items: f.items.filter((x) => x.key !== it.key)
            }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }),
          !isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ProductQuantity, { qty: it.qty, unit: it.unit }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-3", !isOpen && "hidden"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên sản phẩm *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.name, "aria-invalid": !!err(`${it.key}.name`), onChange: (e) => setItem(it.key, {
                  name: e.target.value
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err(`${it.key}.name`) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Số lượng *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", inputMode: "decimal", className: "font-medium", value: it.qty, "aria-invalid": !!err(`${it.key}.qty`), onChange: (e) => setItem(it.key, {
                  qty: e.target.value
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err(`${it.key}.qty`) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đơn vị tính *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: it.unit, "aria-invalid": !!err(`${it.key}.unit`), onChange: (e) => setItem(it.key, {
                  unit: e.target.value
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err(`${it.key}.unit`) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Thông tin chi tiết sản phẩm *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, className: "field-sizing-content min-h-20", value: it.detail, "aria-invalid": !!err(`${it.key}.detail`), onChange: (e) => setItem(it.key, {
                detail: e.target.value
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err(`${it.key}.detail`) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yêu cầu in ấn / gia công" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "field-sizing-content min-h-16", value: it.processing, onChange: (e) => setItem(it.key, {
                processing: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú riêng" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "field-sizing-content min-h-16", value: it.note, onChange: (e) => setItem(it.key, {
                note: e.target.value
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1 block", children: "Hình ảnh tham khảo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ItemImages, { images: imgs, editable: true, onChanged: () => id && oqApi.detail(id).then((d) => d && setImages(d.images)), onAdd: async (file, cat) => {
                if (!it.name.trim()) throw new Error("Nhập tên sản phẩm trước khi thêm ảnh.");
                let rid = id;
                let itemId = it.id;
                if (!rid || !itemId) {
                  rid = await save(true);
                  const d = await oqApi.detail(rid);
                  itemId = d?.items[idx]?.id;
                  if (!itemId) throw new Error("Chưa lưu được sản phẩm.");
                }
                await oqApi.uploadImage(rid, itemId, file, cat, "");
                if (!id) {
                  const d2 = await oqApi.detail(rid);
                  if (d2) setImages(d2.images);
                }
              } })
            ] })
          ] })
        ] }) }, it.key);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full h-11 border-dashed", onClick: () => {
        const n = newItem();
        setCollapsed(new Set(f.items.map((i) => i.key)));
        setF({
          ...f,
          items: [...f.items, n]
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Thêm sản phẩm"
      ] })
    ] }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [["want_price", "HỎI GIÁ", "Báo giá từng sản phẩm"], ["want_progress", "HỎI TIẾN ĐỘ", "Khả năng đáp ứng trước khi chốt đơn"]].map(([k, t, sub]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: cn("flex cursor-pointer flex-col gap-1 rounded-lg border-2 p-3 sm:p-4 transition-colors", f[k] ? "border-primary bg-primary/5" : "border-border"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: f[k], onCheckedChange: (v) => setF(k === "want_price" ? {
              ...f,
              want_price: !!v,
              price_assignee: f.price_assignee || f.progress_assignee
            } : {
              ...f,
              want_progress: !!v,
              progress_assignee: f.progress_assignee || f.price_assignee
            }) }),
            t
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: sub })
        ] }, k)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("flows") })
      ] }),
      f.want_price && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-l-4 border-l-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Hỏi Giá" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phụ trách Hỏi Giá *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPicker, { users: priceUsers, value: f.price_assignee, invalid: !!err("price_assignee"), onChange: (v) => setF({
            ...f,
            price_assignee: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("price_assignee") }),
          priceUsers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: 'Chưa có tài khoản nào được cấp quyền "Phản hồi Hỏi Giá".' })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1 block", children: "Giá vận chuyển" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { value: f.price.shipping_mode ?? "per_item", onValueChange: (v) => setF({
            ...f,
            price: {
              ...f.price,
              shipping_mode: v
            }
          }), className: "flex flex-wrap gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "per_item" }),
              "Hỏi riêng từng sản phẩm/phương án"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "common" }),
              "Hỏi chung cho cả đơn / tổ hợp sản phẩm"
            ] })
          ] }),
          needPlace && !f.delivery_place.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Cần nhập Địa điểm giao hàng ở bước 1 để Cung ứng báo giá vận chuyển." }),
          f.price.shipping_mode === "common" && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-2", rows: 2, placeholder: "Ghi rõ áp dụng cho sản phẩm nào, giao đi đâu…", value: f.price.shipping_note ?? "", onChange: (e) => setF({
            ...f,
            price: {
              ...f.price,
              shipping_note: e.target.value
            }
          }) })
        ] }),
        f.items.map((it, idx) => it.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm", children: [
            "PA",
            String(idx + 1).padStart(2, "0"),
            " — ",
            it.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ProductQuantity, { qty: it.qty, unit: it.unit }),
          PRICE_CATS.filter((c) => !(c.key === "shipping" && f.price.shipping_mode === "common")).map((c) => {
            const cur = f.price.items?.[it.id]?.[c.key];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!cur?.on, onCheckedChange: (v) => togglePriceCat(it.id, c.key, !!v) }),
                c.label
              ] }),
              cur?.on && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, placeholder: "Ghi chú yêu cầu", value: cur?.note ?? "", onChange: (e) => setPriceNote(it.id, c.key, e.target.value) })
            ] }, c.key);
          })
        ] }, it.key)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("price_cats") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú chung cho Hỏi Giá" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: f.price.note ?? "", onChange: (e) => setF({
            ...f,
            price: {
              ...f.price,
              note: e.target.value
            }
          }) })
        ] })
      ] }) }),
      f.want_progress && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-l-4 border-l-accent-foreground/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Hỏi Tiến Độ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Người phụ trách Hỏi Tiến Độ *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPicker, { users: progUsers, value: f.progress_assignee, invalid: !!err("progress_assignee"), onChange: (v) => setF({
            ...f,
            progress_assignee: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("progress_assignee") }),
          f.want_price && f.price_assignee && f.price_assignee !== f.progress_assignee && progUsers.some((u) => u.id === f.price_assignee) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "link", size: "sm", className: "h-auto px-0", onClick: () => setF({
            ...f,
            progress_assignee: f.price_assignee
          }), children: [
            "Dùng cùng người Hỏi Giá (",
            name(f.price_assignee),
            ")"
          ] }),
          progUsers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: 'Chưa có tài khoản nào được cấp quyền "Phản hồi Hỏi Tiến Độ".' })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Kiểm tra khả năng đáp ứng và thời gian giao hàng dự kiến trước khi chốt đơn." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nội dung cần kiểm tra *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: f.progress.content ?? "", onChange: (e) => setF({
            ...f,
            progress: {
              ...f.progress,
              content: e.target.value
            }
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldErr, { m: err("progress_content") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Ngày khách yêu cầu giao: ",
          f.delivery_date ? vnDate(f.delivery_date) : "chưa chọn — bắt buộc khi Hỏi Tiến Độ (bước 1)"
        ] }),
        f.items.map((it, idx) => it.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
            "Yêu cầu tiến độ riêng PA",
            String(idx + 1).padStart(2, "0"),
            " — ",
            it.name,
            " (tùy chọn)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f.progress.per_item?.[it.id] ?? "", onChange: (e) => setF({
            ...f,
            progress: {
              ...f.progress,
              per_item: {
                ...f.progress.per_item ?? {},
                [it.id]: e.target.value
              }
            }
          }) })
        ] }, it.key))
      ] }) })
    ] }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 sm:p-6 space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Phân loại", v: "Đơn Sứ Quà Tặng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Tên", v: f.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Giao tại", v: f.delivery_place || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Ngày giao", v: vnDate(f.delivery_date) }),
      f.note && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Ghi chú", v: f.note }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Loại sản phẩm", v: f.items_mode === "option" ? "Phương án để khách lựa chọn (không cộng số lượng)" : "Sản phẩm đặt đồng thời" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: f.items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border px-3 py-2 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium break-words", children: [
          "PA",
          String(i + 1).padStart(2, "0"),
          " — ",
          it.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProductQuantity, { qty: it.qty, unit: it.unit }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          itemImgs(it.id).length,
          " ảnh"
        ] })
      ] }, it.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Nội dung hỏi", v: [f.want_price && `Hỏi Giá → ${name(f.price_assignee)}`, f.want_progress && `Hỏi Tiến Độ → ${name(f.progress_assignee)}`].filter(Boolean).join(" · ") || "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sau khi gửi không đổi được phân loại đơn hàng. Mỗi nội dung hỏi thành một luồng xử lý riêng." })
    ] }) }),
    id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-destructive", disabled: busy, onClick: () => confirm("Xóa bản nháp này?") && run(async () => {
      await oqApi.deleteDraft(id);
      nav({
        to: "/order-quotes"
      });
    }), children: "Xóa bản nháp" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileActionBar, { children: [
      curErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs text-destructive md:text-right", children: curErr }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 md:flex md:justify-end", children: [
        id && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "hidden md:inline-flex mr-auto text-destructive", disabled: busy, onClick: () => confirm("Xóa bản nháp này?") && run(async () => {
          await oqApi.deleteDraft(id);
          nav({
            to: "/order-quotes"
          });
        }), children: "Xóa nháp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "h-11 md:h-10", disabled: busy || step === 0, onClick: () => {
          setStep(step - 1);
          window.scrollTo({
            top: 0
          });
        }, children: "Quay lại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "h-11 md:h-10", disabled: busy, onClick: () => run(() => save()), children: "Lưu nháp" }),
        step < 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-11 md:h-10", disabled: busy, onClick: next, children: "Tiếp tục" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-11 md:h-10", disabled: busy, onClick: submit, children: "Gửi yêu cầu" })
      ] })
    ] })
  ] });
}
const Row = ({
  k,
  v
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[110px_1fr] gap-2", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: k }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre-wrap", children: v })
] });
const FieldErr = ({
  m
}) => m ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive mt-1", children: m }) : null;
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "oq.create", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OqForm, {}) });
export {
  SplitComponent as component
};
