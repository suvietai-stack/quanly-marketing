import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, I as Input, l as Badge, C as Card, O as CardHeader, Q as CardTitle, o as CardContent, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, bc as DialogDescription, L as Label, N as Checkbox } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { S as SUPPLIER_GROUPS } from "./logic-DPbhOOeg.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import "../_libs/seroval.mjs";
import { aC as RefreshCw, a6 as Plus, _ as Truck, w as Users, f as Search, y as Package, aO as CalendarClock, by as PenLine, a9 as LoaderCircle, m as Save } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
const supplierServiceGroups = Object.entries(SUPPLIER_GROUPS).map(([code, name]) => ({ code, name }));
async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}
const supplierListRead = (search, status, category, service) => rpc("supplier_master_list_read", {
  _search: search || null,
  _status: status || null,
  _category: category || null,
  _service: service || null
});
const supplierProductGroupAdd = (name) => rpc("supplier_product_group_add", { _name: name });
const supplierDetailRead = (id) => rpc("supplier_master_detail_read", { _id: id });
const supplierSave = (id, data) => rpc("supplier_master_save", { _id: id, _data: data });
const supplierProductSave = (supplierId, id, data) => rpc("supplier_master_product_save", { _supplier_id: supplierId, _id: id, _data: data });
const supplierContactAdd = (supplierId, channel, summary, date) => rpc("supplier_master_contact_add", {
  _supplier_id: supplierId,
  _channel: channel,
  _summary: summary,
  _next_follow_up: date || null
});
const supplierGroupNames = (codes, groups) => codes.map((code) => groups.find((g) => g.code === code)?.name ?? code);
const supplierServiceNames = (codes) => codes.map((code) => SUPPLIER_GROUPS[code] ?? code);
const supplierStatusLabels = {
  potential: "Đang tìm hiểu",
  active: "Đang hợp tác",
  paused: "Tạm dừng",
  archived: "Đã lưu trữ"
};
const supplierChannelLabels = {
  call: "Điện thoại",
  zalo: "Zalo",
  email: "Email",
  meeting: "Gặp trực tiếp",
  other: "Khác"
};
const supplierStatusTone = (s) => s === "active" ? "default" : s === "archived" ? "outline" : "secondary";
function vietnamDateToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(/* @__PURE__ */ new Date());
  const v = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return `${v("year")}-${v("month")}-${v("day")}`;
}
const supplierFollowUpOverdue = (s, today = vietnamDateToday()) => s.status !== "archived" && !!s.next_follow_up && s.next_follow_up < today;
const supplierStats = (items, today = vietnamDateToday()) => ({
  total: items.length,
  active: items.filter((x) => x.status === "active").length,
  potential: items.filter((x) => x.status === "potential").length,
  overdue: items.filter((x) => supplierFollowUpOverdue(x, today)).length,
  products: items.reduce((n, x) => n + x.product_count, 0)
});
const formatSupplierPrice = (value, currency) => value == null ? "—" : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value) + " " + (currency || "VND");
function FormField({ id, label, children, description }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: id, children: label }),
    children,
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: description })
  ] });
}
function SupplierEditDialog({
  open,
  onOpenChange,
  supplier,
  canManage,
  groups,
  canManageGroups,
  onGroupsChanged,
  onSaved
}) {
  const [state, setState] = reactExports.useState(() => ({
    name: supplier?.name ?? "",
    status: supplier?.status ?? "potential",
    category: supplier?.category ?? [],
    service_groups: supplier?.service_groups ?? [],
    contact_name: supplier?.contact_name ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    website: supplier?.website ?? "",
    address: supplier?.address ?? "",
    tax_code: supplier?.tax_code ?? "",
    notes: supplier?.notes ?? "",
    next_follow_up: supplier?.next_follow_up ?? "",
    revision: supplier?.revision
  }));
  const [categories, setCategories] = reactExports.useState(supplier?.category ?? []);
  const [services, setServices] = reactExports.useState(supplier?.service_groups ?? []);
  const [groupSearch, setGroupSearch] = reactExports.useState("");
  const selectService = (code, checked) => setServices((current) => checked ? [.../* @__PURE__ */ new Set([...current, code])] : current.filter((x) => x !== code));
  const [newGroupName, setNewGroupName] = reactExports.useState("");
  const [addedGroups, setAddedGroups] = reactExports.useState([]);
  const allGroups = [...groups, ...addedGroups.filter((g) => !groups.some((item) => item.code === g.code))];
  const visibleGroups = allGroups.filter((g) => g.name.toLocaleLowerCase("vi").includes(groupSearch.trim().toLocaleLowerCase("vi")));
  const addGroup = useMutation({
    mutationFn: () => supplierProductGroupAdd(newGroupName.trim()),
    onSuccess: (group) => {
      setAddedGroups((current) => [...current, group]);
      setCategories((current) => [.../* @__PURE__ */ new Set([...current, group.code])]);
      setNewGroupName("");
      toast.success("Đã thêm nhóm sản phẩm vào danh mục chung.");
      onGroupsChanged();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Không thêm được nhóm sản phẩm.")
  });
  const toggleGroup = (code, checked) => setCategories((current) => checked ? [.../* @__PURE__ */ new Set([...current, code])] : current.filter((x) => x !== code));
  const update = (field, value) => setState((current) => ({ ...current, [field]: value }));
  const save = useMutation({
    mutationFn: () => supplierSave(supplier?.id ?? null, {
      ...state,
      category: categories,
      service_groups: services
    }),
    onSuccess: (id) => {
      toast.success(supplier ? "Đã cập nhật nhà cung cấp." : "Đã tạo hồ sơ nhà cung cấp.");
      onSaved(id);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Không lưu được nhà cung cấp.")
  });
  const submit = (e) => {
    e.preventDefault();
    if (!save.isPending) save.mutate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Quản lý hồ sơ dùng chung cho toàn bộ các hệ kinh doanh Sứ Việt." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-name", label: "Tên nhà cung cấp *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-name",
            required: true,
            minLength: 2,
            maxLength: 180,
            value: state.name,
            onChange: (e) => update("name", e.target.value),
            placeholder: "Ví dụ: Xưởng gốm, nhà nhập khẩu…"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "1. Loại hình cung ứng (6 nghiệp vụ, tích chọn nhiều)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 rounded-lg border bg-muted/15 p-3 sm:grid-cols-3", children: supplierServiceGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "label",
            {
              className: "flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted/60",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: services.includes(group.code),
                    "aria-label": `Loại hình: ${group.name}`,
                    onCheckedChange: (checked) => selectService(group.code, checked === true)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: group.name })
              ]
            },
            group.code
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            services.length,
            " loại đã chọn.",
            services.length > 0 && ` ${supplierServiceNames(services).join(" · ")}`,
            " ",
            "Dữ liệu này cũng dùng trong Theo Dõi Đơn Hàng."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "supplier-group-search", children: "2. Nhóm sản phẩm (danh mục mở rộng)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "supplier-group-search",
              value: groupSearch,
              onChange: (e) => setGroupSearch(e.target.value),
              placeholder: `Tìm trong ${allGroups.length} nhóm sản phẩm…`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid max-h-56 grid-cols-2 gap-2 overflow-y-auto rounded-lg border bg-muted/15 p-3 sm:grid-cols-3", children: [
            visibleGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                className: "flex cursor-pointer items-start gap-2 rounded-md p-1.5 text-sm hover:bg-muted/60",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      checked: categories.includes(group.code),
                      onCheckedChange: (checked) => toggleGroup(group.code, checked === true),
                      "aria-label": `Sản phẩm: ${group.name}`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: group.name })
                ]
              },
              group.code
            )),
            !visibleGroups.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-full text-xs text-muted-foreground", children: "Không có nhóm sản phẩm khớp tìm kiếm. Quản lý Mua hàng có thể thêm nhóm mới." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Đã chọn ",
            categories.length,
            " nhóm sản phẩm.",
            categories.length > 0 && ` ${supplierGroupNames(categories, allGroups).join(" · ")}`
          ] }),
          canManageGroups && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: newGroupName,
                maxLength: 80,
                className: "min-w-40 flex-1",
                "aria-label": "Tên nhóm sản phẩm mới",
                onChange: (e) => setNewGroupName(e.target.value),
                placeholder: "Thêm nhóm mới vào danh mục dùng chung"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                size: "sm",
                variant: "outline",
                disabled: newGroupName.trim().length < 2 || addGroup.isPending,
                onClick: () => addGroup.mutate(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
                  "Thêm nhóm"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-contact", label: "Người liên hệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-contact",
            maxLength: 160,
            value: state.contact_name,
            onChange: (e) => update("contact_name", e.target.value),
            placeholder: "Họ tên người liên hệ"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-phone", label: "Số điện thoại", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-phone",
            type: "tel",
            maxLength: 60,
            value: state.phone,
            onChange: (e) => update("phone", e.target.value),
            placeholder: "Số điện thoại / Zalo"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-email", label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-email",
            type: "email",
            maxLength: 254,
            value: state.email,
            onChange: (e) => update("email", e.target.value),
            placeholder: "diachi@nhacungcap.vn"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-website", label: "Website", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-website",
            maxLength: 500,
            value: state.website,
            onChange: (e) => update("website", e.target.value),
            placeholder: "https://..."
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-tax-code", label: "Mã số thuế (nếu có)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-tax-code",
            maxLength: 40,
            value: state.tax_code,
            onChange: (e) => update("tax_code", e.target.value)
          }
        ) }),
        supplier && canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-status", label: "Trạng thái hợp tác", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            id: "supplier-status",
            value: state.status,
            onChange: (e) => update("status", e.target.value),
            className: "h-10 w-full rounded-md border bg-background px-3 text-sm",
            children: Object.entries(supplierStatusLabels).map(([value, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: label }, value))
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-followup", label: "Ngày dự kiến liên hệ lại", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-followup",
            type: "date",
            value: state.next_follow_up,
            onChange: (e) => update("next_follow_up", e.target.value)
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-address", label: "Địa chỉ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "supplier-address",
          rows: 2,
          maxLength: 800,
          value: state.address,
          onChange: (e) => update("address", e.target.value)
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-notes", label: "Ghi chú về năng lực, hợp tác", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "supplier-notes",
          rows: 3,
          maxLength: 5e3,
          value: state.notes,
          onChange: (e) => update("notes", e.target.value),
          placeholder: "Năng lực cung ứng, chính sách, đầu mối, lưu ý…"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hồ sơ lưu vào danh mục Nhà cung cấp chung. Bộ phận Mua hàng quản lý trạng thái hợp tác." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: save.isPending || !state.name.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
          "Lưu hồ sơ"
        ] })
      ] })
    ] })
  ] }) });
}
function SupplierProductDialog({ open, onOpenChange, supplierId, product, canManage, canViewCost, groups, onSaved }) {
  const [state, setState] = reactExports.useState(() => ({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? "",
    specification: product?.specification ?? "",
    unit: product?.unit ?? "cái",
    origin: product?.origin ?? "",
    min_order_qty: product?.min_order_qty?.toString() ?? "",
    lead_days: product?.lead_days?.toString() ?? "",
    note: product?.note ?? "",
    ...canManage ? { active: product?.active ?? true } : {},
    ...canViewCost ? {
      purchase_price: product?.purchase_price?.toString() ?? "",
      currency: product?.currency ?? "VND"
    } : {},
    revision: product?.revision
  }));
  const set = (key, value) => setState((current) => ({ ...current, [key]: value }));
  const save = useMutation({
    mutationFn: () => supplierProductSave(supplierId, product?.id ?? null, state),
    onSuccess: () => {
      toast.success(product ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm cung ứng.");
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Không lưu được sản phẩm.")
  });
  const submit = (e) => {
    e.preventDefault();
    if (!save.isPending) save.mutate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: product ? "Sửa sản phẩm cung ứng" : "Thêm sản phẩm của nhà cung cấp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Danh mục nguồn hàng dùng chung; chưa phải tồn kho hay đơn đặt mua." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-name", label: "Tên sản phẩm *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-product-name",
            required: true,
            maxLength: 200,
            value: state.name,
            onChange: (e) => set("name", e.target.value),
            placeholder: "Tên sản phẩm / dòng sản phẩm"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-sku", label: "Mã sản phẩm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-product-sku",
            maxLength: 80,
            value: state.sku,
            onChange: (e) => set("sku", e.target.value),
            placeholder: "SKU nhà cung cấp"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-category", label: "Nhóm sản phẩm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "supplier-product-category",
            value: state.category,
            onChange: (e) => set("category", e.target.value),
            className: "h-10 w-full rounded-md border bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Chưa phân nhóm" }),
              groups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: group.code, children: group.name }, group.code)),
              state.category && !groups.some((g) => g.code === state.category) && /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: state.category, children: [
                state.category,
                " (nhóm cũ)"
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-unit", label: "Đơn vị tính *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-product-unit",
            required: true,
            maxLength: 40,
            value: state.unit,
            onChange: (e) => set("unit", e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-origin", label: "Xuất xứ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-product-origin",
            maxLength: 160,
            value: state.origin,
            onChange: (e) => set("origin", e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-moq", label: "Số lượng đặt tối thiểu (MOQ)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-product-moq",
            type: "number",
            min: 0,
            step: "0.01",
            value: state.min_order_qty,
            onChange: (e) => set("min_order_qty", e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-lead", label: "Thời gian cung ứng (ngày)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "supplier-product-lead",
            type: "number",
            min: 0,
            max: 3650,
            step: "1",
            value: state.lead_days,
            onChange: (e) => set("lead_days", e.target.value)
          }
        ) }),
        canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-price", label: "Giá nhập tham khảo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "supplier-product-price",
              type: "number",
              min: 0,
              step: "0.01",
              value: state.purchase_price ?? "",
              onChange: (e) => set("purchase_price", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-currency", label: "Đơn vị tiền tệ", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "supplier-product-currency",
              value: state.currency ?? "VND",
              onChange: (e) => set("currency", e.target.value),
              className: "h-10 w-full rounded-md border bg-background px-3 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "VND", children: "VND" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "USD", children: "USD" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CNY", children: "CNY" })
              ]
            }
          ) })
        ] }),
        canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-active", label: "Trạng thái sản phẩm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            id: "supplier-product-active",
            value: state.active === false ? "false" : "true",
            onChange: (e) => set("active", e.target.value === "true"),
            className: "h-10 w-full rounded-md border bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "true", children: "Đang cung ứng" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "false", children: "Ngừng cung ứng" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-spec", label: "Quy cách / chất liệu / kích thước", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "supplier-product-spec",
          maxLength: 2e3,
          rows: 2,
          value: state.specification,
          onChange: (e) => set("specification", e.target.value)
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-product-note", label: "Ghi chú sản phẩm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "supplier-product-note",
          maxLength: 3e3,
          rows: 2,
          value: state.note,
          onChange: (e) => set("note", e.target.value)
        }
      ) }),
      !canViewCost && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Giá nhập được bảo vệ bằng quyền riêng; hồ sơ này chỉ cập nhật thông số hàng hóa." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: save.isPending || !state.name.trim() || !state.unit.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
          "Lưu sản phẩm"
        ] })
      ] })
    ] })
  ] }) });
}
function SupplierContactDialog({ open, onOpenChange, supplierId, onSaved }) {
  const [channel, setChannel] = reactExports.useState("call");
  const [summary, setSummary] = reactExports.useState("");
  const [next, setNext] = reactExports.useState("");
  const save = useMutation({
    mutationFn: () => supplierContactAdd(supplierId, channel, summary, next),
    onSuccess: () => {
      toast.success("Đã ghi lịch sử liên hệ.");
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Không thể ghi lịch sử.")
  });
  const submit = (e) => {
    e.preventDefault();
    if (!save.isPending) save.mutate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Ghi lịch sử liên hệ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Lịch sử được lưu cùng nhà cung cấp, không ghi đè các lần trao đổi cũ." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-4", onSubmit: submit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-contact-channel", label: "Kênh liên hệ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          id: "supplier-contact-channel",
          value: channel,
          onChange: (e) => setChannel(e.target.value),
          className: "h-10 w-full rounded-md border bg-background px-3 text-sm",
          children: Object.entries(supplierChannelLabels).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k))
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-contact-summary", label: "Nội dung trao đổi *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "supplier-contact-summary",
          required: true,
          maxLength: 2e3,
          rows: 5,
          value: summary,
          onChange: (e) => setSummary(e.target.value),
          placeholder: "Đã trao đổi về mặt hàng, báo giá, mẫu thử, điều khoản…"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, { id: "supplier-contact-next", label: "Ngày cần liên hệ lại", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "supplier-contact-next",
          type: "date",
          value: next,
          onChange: (e) => setNext(e.target.value)
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: save.isPending || !summary.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-2 h-4 w-4" }),
          "Lưu lịch sử"
        ] })
      ] })
    ] })
  ] }) });
}
const dateLabel = (value) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};
const dateTimeLabel = (value) => value ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
const safeWebsite = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
function SupplierDetail({ id, onClose, onEdit, groups }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [section, setSection] = reactExports.useState("info");
  const [product, setProduct] = reactExports.useState(null);
  const [productOpen, setProductOpen] = reactExports.useState(false);
  const [contactOpen, setContactOpen] = reactExports.useState(false);
  const query = useQuery({
    queryKey: ["supplier-detail", user?.id, id],
    queryFn: () => supplierDetailRead(id),
    enabled: !!id && user?.status === "Đang hoạt động",
    retry: 1,
    staleTime: 2e4
  });
  const detail = query.data;
  const s = detail?.supplier;
  const archived = s?.status === "archived";
  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["supplier-detail"] }),
      qc.invalidateQueries({ queryKey: ["supplier-master"] })
    ]);
  };
  const onProductSaved = () => {
    setProductOpen(false);
    setProduct(null);
    void invalidate();
  };
  const onContactSaved = () => {
    setContactOpen(false);
    void invalidate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!id, onOpenChange: (open) => {
      if (!open) {
        setSection("info");
        onClose();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "flex max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-4xl flex-col overflow-hidden p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "shrink-0 border-b px-5 pb-4 pt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex flex-wrap items-center gap-2 pr-7", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-5 w-5 text-primary" }),
          s?.name ?? "Hồ sơ nhà cung cấp",
          s && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: supplierStatusTone(s.status), children: supplierStatusLabels[s.status] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: s ? `${s.code} · Danh mục chung Sứ Việt` : "Đang tải hồ sơ nhà cung cấp…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 space-y-4 overflow-y-auto px-5 pb-6", children: [
        query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "py-8 text-center text-sm text-muted-foreground", children: "Đang tải hồ sơ, sản phẩm và lịch sử liên hệ…" }),
        query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-3 rounded-lg border border-destructive/30 p-4 text-sm text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: query.error.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => query.refetch(), children: "Thử lại" })
        ] }),
        detail && s && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", role: "tablist", "aria-label": "Nội dung nhà cung cấp", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  role: "tab",
                  "aria-selected": section === "info",
                  size: "sm",
                  variant: section === "info" ? "default" : "outline",
                  onClick: () => setSection("info"),
                  children: "Thông tin"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  role: "tab",
                  "aria-selected": section === "products",
                  size: "sm",
                  variant: section === "products" ? "default" : "outline",
                  onClick: () => setSection("products"),
                  children: [
                    "Sản phẩm (",
                    detail.products.filter((p) => p.active).length,
                    ")"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  role: "tab",
                  "aria-selected": section === "contacts",
                  size: "sm",
                  variant: section === "contacts" ? "default" : "outline",
                  onClick: () => setSection("contacts"),
                  children: [
                    "Lịch sử liên hệ (",
                    detail.contacts.length,
                    ")"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              section === "info" && detail.can_edit && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => onEdit(s, detail.can_manage),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "mr-1.5 h-4 w-4" }),
                    "Sửa hồ sơ"
                  ]
                }
              ),
              section === "products" && detail.can_product_edit && !archived && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  onClick: () => {
                    setProduct(null);
                    setProductOpen(true);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-4 w-4" }),
                    "Thêm sản phẩm"
                  ]
                }
              ),
              section === "contacts" && detail.can_contact_log && !archived && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  onClick: () => setContactOpen(true),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-4 w-4" }),
                    "Ghi liên hệ"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => query.refetch(), "aria-label": "Làm mới hồ sơ", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
            ] })
          ] }),
          section === "info" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid gap-5 text-sm sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Thông tin liên hệ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Người phụ trách", value: s.contact_name || "Chưa có" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Số điện thoại", value: s.phone ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${encodeURIComponent(s.phone)}`, className: "text-primary underline underline-offset-2", children: s.phone }) : "Chưa có" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Email", value: s.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${encodeURIComponent(s.email)}`, className: "break-all text-primary underline underline-offset-2", children: s.email }) : "Chưa có" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Website", value: safeWebsite(s.website) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: safeWebsite(s.website),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "break-all text-primary underline underline-offset-2",
                  children: s.website
                }
              ) : s.website || "Chưa có" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Mã số thuế", value: s.tax_code || "Chưa có" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Địa chỉ", value: s.address || "Chưa có" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Năng lực & hợp tác" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Hồ sơ", value: "Nhà cung cấp dùng chung cho các hệ kinh doanh" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Loại hình cung ứng", value: s.service_groups?.length ? supplierServiceNames(s.service_groups).join(" · ") : "Chưa chọn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Nhóm sản phẩm", value: s.category.length ? supplierGroupNames(s.category, groups).join(" · ") : "Chưa chọn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Trạng thái", value: supplierStatusLabels[s.status] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Liên hệ gần nhất", value: dateTimeLabel(s.last_contact_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Liên hệ tiếp", value: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: supplierFollowUpOverdue(s) ? "font-medium text-amber-600" : "", children: [
                dateLabel(s.next_follow_up),
                " ",
                supplierFollowUpOverdue(s) ? "(Cần theo dõi)" : ""
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Cập nhật hồ sơ", value: dateTimeLabel(s.updated_at) }),
              s.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 border-t pt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ghi chú" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: s.notes })
              ] })
            ] })
          ] }),
          section === "products" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
            !detail.can_view_cost && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground", children: "Giá nhập được giới hạn theo quyền quản lý và không hiển thị ở tài khoản này." }),
            detail.products.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mx-auto mb-2 h-7 w-7" }),
              "Chưa nhập danh mục sản phẩm cung ứng."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: detail.products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-2 rounded-xl border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words font-semibold", children: p.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                    p.sku || "Chưa có SKU",
                    " · ",
                    p.category ? supplierGroupNames([p.category], groups)[0] : "Chưa phân nhóm"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: p.active ? "secondary" : "outline", children: p.active ? "Đang cung ứng" : "Ngừng cung ứng" })
              ] }),
              p.specification && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: p.specification }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Đơn vị", value: p.unit }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Xuất xứ", value: p.origin || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "MOQ", value: p.min_order_qty == null ? "—" : `${p.min_order_qty} ${p.unit}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Thời gian cấp hàng", value: p.lead_days == null ? "—" : `${p.lead_days} ngày` })
              ] }),
              detail.can_view_cost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Giá nhập tham khảo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: formatSupplierPrice(p.purchase_price, p.currency) })
              ] }),
              p.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap border-t pt-2 text-xs text-muted-foreground", children: p.note }),
              p.can_edit && !archived && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => {
                    setProduct(p);
                    setProductOpen(true);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "mr-1 h-3.5 w-3.5" }),
                    "Sửa sản phẩm"
                  ]
                }
              )
            ] }, p.id)) })
          ] }),
          section === "contacts" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
            detail.contacts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "mx-auto mb-2 h-7 w-7" }),
              "Chưa có lịch sử liên hệ. Có thể ghi lần trao đổi đầu tiên."
            ] }),
            detail.contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: supplierChannelLabels[c.channel] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: dateTimeLabel(c.created_at) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 whitespace-pre-wrap text-sm", children: c.summary }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
                  c.actor_name
                ] }),
                c.next_follow_up && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3.5 w-3.5" }),
                  "Liên hệ lại ",
                  dateLabel(c.next_follow_up)
                ] })
              ] })
            ] }, c.id))
          ] })
        ] })
      ] })
    ] }) }),
    s && productOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SupplierProductDialog,
      {
        open: productOpen,
        onOpenChange: setProductOpen,
        supplierId: s.id,
        product,
        canManage: !!detail?.can_manage,
        canViewCost: !!detail?.can_view_cost,
        groups,
        onSaved: onProductSaved
      },
      product?.id ?? "new-product"
    ),
    s && contactOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SupplierContactDialog,
      {
        open: contactOpen,
        onOpenChange: setContactOpen,
        supplierId: s.id,
        onSaved: onContactSaved
      },
      s.id
    )
  ] });
}
function Info({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-words text-sm", children: value })
  ] });
}
function SupplierMaster() {
  const { user, can, isSuperAdmin } = useCurrentUser();
  const authorized = !!user && user.status === "Đang hoạt động" && (isSuperAdmin || can("supplier.master.view"));
  const [search, setSearch] = reactExports.useState("");
  const deferredSearch = reactExports.useDeferredValue(search);
  const [status, setStatus] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("");
  const [service, setService] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState(null);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editSupplier, setEditSupplier] = reactExports.useState(null);
  const [editCanManage, setEditCanManage] = reactExports.useState(false);
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["supplier-master", user?.id, deferredSearch, status, category, service],
    queryFn: () => supplierListRead(deferredSearch, status, category, service),
    enabled: authorized,
    retry: 1,
    staleTime: 2e4
  });
  const suppliers = query.data?.suppliers ?? [];
  const totals = reactExports.useMemo(() => supplierStats(suppliers), [suppliers]);
  const canCreate = authorized && !!query.data?.can_create;
  const newSupplier = () => {
    setEditSupplier(null);
    setEditCanManage(false);
    setEditOpen(true);
  };
  const editExisting = (supplier, canManage) => {
    setSelected(null);
    setEditSupplier(supplier);
    setEditCanManage(canManage);
    setEditOpen(true);
  };
  const saved = (id) => {
    setEditOpen(false);
    setEditSupplier(null);
    void Promise.all([
      qc.invalidateQueries({ queryKey: ["supplier-master"] }),
      qc.invalidateQueries({ queryKey: ["supplier-detail"] }),
      qc.invalidateQueries({ queryKey: ["ot", "suppliers"] })
    ]);
    setSelected(id);
  };
  if (!authorized) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Nhà cung cấp", description: "Trung tâm dữ liệu nguồn cung chung của Sứ Việt" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "rounded-xl border bg-card p-6 text-sm text-muted-foreground", children: "Chưa có quyền vào danh mục Nhà cung cấp chung. Quyền được cấp theo vai trò trên sơ đồ tổ chức hoặc quyền bổ sung." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-5 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PageHeader,
        {
          title: "Nhà cung cấp",
          description: "Mua Hàng & Giao Vận · Một danh mục dùng chung cho Kinh doanh, Showroom và các hệ được cấp quyền"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            disabled: query.isFetching,
            onClick: () => query.refetch(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `mr-2 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}` }),
              "Làm mới"
            ]
          }
        ),
        canCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: newSupplier, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "Thêm nhà cung cấp"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Nhà cung cấp", value: totals.total, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đang hợp tác", value: totals.active, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Đang tìm hiểu", value: totals.potential, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Sản phẩm cung ứng", value: totals.products, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Cần liên hệ lại", value: totals.overdue, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-56 flex-1 sm:max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "aria-label": "Tìm nhà cung cấp",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-9",
              placeholder: "Tìm tên, mã NCC, liên hệ, số điện thoại…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            "aria-label": "Lọc loại hình cung ứng",
            value: service,
            onChange: (e) => setService(e.target.value),
            className: "h-10 max-w-full rounded-md border bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả loại hình cung ứng" }),
              supplierServiceGroups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g.code, children: g.name }, g.code))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            "aria-label": "Lọc nhóm sản phẩm nhà cung cấp",
            value: category,
            onChange: (e) => setCategory(e.target.value),
            className: "h-10 max-w-full rounded-md border bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Tất cả nhóm sản phẩm" }),
              (query.data?.groups ?? []).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g.code, children: g.name }, g.code))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            "aria-label": "Lọc trạng thái nhà cung cấp",
            value: status,
            onChange: (e) => setStatus(e.target.value),
            className: "h-10 max-w-full rounded-md border bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Mọi trạng thái" }),
              Object.entries(supplierStatusLabels).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          suppliers.length,
          " nhà cung cấp trong kết quả tìm kiếm. Danh mục dùng chung, không nhân bản theo bộ phận."
        ] }),
        query.data && suppliers.length >= query.data.limit && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Hiển thị tối đa ",
          query.data.limit,
          " hồ sơ; hãy thu hẹp bộ lọc."
        ] })
      ] })
    ] }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", className: "rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground", children: "Đang tải hồ sơ nhà cung cấp chung…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-3 rounded-xl border border-destructive/30 p-5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-destructive", children: [
        "Không tải được dữ liệu: ",
        query.error.message
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    query.data && suppliers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-dashed bg-card px-5 py-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: search || status || category || service ? "Không tìm thấy nhà cung cấp phù hợp." : "Danh mục nhà cung cấp đang trống." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: search || status || category || service ? "Thử thay đổi bộ lọc." : "Nhập thông tin nhà cung cấp, sau đó thêm sản phẩm và nhật ký làm việc." }),
      canCreate && !search && !status && !category && !service && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mx-auto", size: "sm", onClick: newSupplier, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Thêm nhà cung cấp đầu tiên"
      ] })
    ] }),
    query.data && suppliers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setSelected(s.id),
        className: "min-w-0 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words font-semibold", children: s.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-xs text-muted-foreground", children: s.code })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: supplierStatusTone(s.status), className: "shrink-0", children: supplierStatusLabels[s.status] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5 shrink-0" }),
              s.product_count,
              " sản phẩm đang cung ứng"
            ] }),
            (s.contact_name || s.phone) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 shrink-0" }),
              [s.contact_name, s.phone].filter(Boolean).join(" · ")
            ] }),
            !!s.service_groups?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-2", children: [
              "Cung ứng: ",
              supplierServiceNames(s.service_groups).join(", ")
            ] }),
            !!s.category.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-2", children: [
              "Sản phẩm: ",
              supplierGroupNames(s.category, query.data?.groups ?? []).join(", ")
            ] }),
            s.next_follow_up && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `flex items-center gap-1 ${supplierFollowUpOverdue(s) ? "font-semibold text-amber-600" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3.5 w-3.5 shrink-0" }),
              "Liên hệ tiếp: ",
              s.next_follow_up.split("-").reverse().join("/"),
              supplierFollowUpOverdue(s) ? " · Cần theo dõi" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 border-t pt-3 text-xs font-medium text-primary", children: "Xem hồ sơ, sản phẩm và lịch sử hợp tác" })
        ]
      },
      s.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/20 p-4 text-xs leading-5 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Dữ liệu gốc thống nhất:" }),
      " Nhà cung cấp tại đây là dữ liệu đang được hệ Theo Dõi Đơn Hàng sử dụng, không tạo bản sao cho Showroom. Đơn hàng, tồn kho và giá bán được quản lý bởi các nghiệp vụ riêng. Giá nhập được phân quyền độc lập phía máy chủ."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SupplierDetail,
      {
        id: selected,
        onClose: () => setSelected(null),
        onEdit: editExisting,
        groups: query.data?.groups ?? []
      }
    ),
    editOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SupplierEditDialog,
      {
        open: editOpen,
        onOpenChange: setEditOpen,
        supplier: editSupplier,
        canManage: editCanManage,
        groups: query.data?.groups ?? [],
        canManageGroups: !!query.data?.can_manage_groups,
        onGroupsChanged: () => {
          void qc.invalidateQueries({ queryKey: ["supplier-master"] });
        },
        onSaved: saved
      },
      editSupplier?.id ?? "new"
    )
  ] });
}
function Stat({ label, value, icon }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-xs font-medium text-muted-foreground", children: [
      icon,
      label
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold tabular-nums", children: value }) })
  ] });
}
const SplitComponent = SupplierMaster;
export {
  SplitComponent as component
};
