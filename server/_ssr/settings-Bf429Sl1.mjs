import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useStore, F as useAuth, u as useCurrentUser, P as PageHeader, b5 as ZaloSettingsTab, B as Button, C as Card, o as CardContent, l as Badge, a as useServerFn, O as CardHeader, Q as CardTitle, T as Switch, I as Input, L as Label, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, E as DialogFooter, c as createSsrRpc, N as Checkbox, j as cn } from "./router-CkmTURa-.mjs";
import { o as otApi } from "./api-CEBEc05Q.mjs";
import { R as RequirePermission } from "./PermissionGate-J1cGk1QH.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { AccountsSettings } from "./AccountsSettings-PdPb4l63.mjs";
import { a as addOption, m as moveOption, r as renameOption, t as toggleOption, b as removeOption } from "./catalog-BGi2Ua05.mjs";
import { u as useSignalPerms, S as SignalLabelManager, a as useOptions, e as errMsg, r as renameOptionEverywhere, o as optionUsage, s as saveOptions } from "./SignalsUi-CuFEaOXb.mjs";
import { L as LeaveSettings } from "./LeaveSettings-DoiRb7lN.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { u as useBranding, A as ALLOWED_IMG, D as DEFAULT_BRANDING, a as BrandMark, M as MAX_IMG } from "./branding-Bpuupoin.mjs";
import { F as FbLeadsSettings, u as useVisibleRefresh } from "./FbLeadsSettings-DZvlXC_v.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { suggestMapping, validateMapping, copyMapping, FIELDS } from "./mapping-qtQs_k5t.mjs";
import "../_libs/seroval.mjs";
import { aU as UserPlus, a7 as ShieldCheck, ao as Pencil, a6 as Plus, ap as Trash2, G as Globe, b7 as Copy, aC as RefreshCw, b8 as Ban, b9 as RotateCw, b6 as KeyRound, j as ArrowUp, k as ArrowDown, aj as Settings2 } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, e as enumType, b as booleanType, r as recordType, u as unionType, l as literalType, a as arrayType } from "../_libs/zod.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "./auth-errors-CN_iHaBn.mjs";
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
import "tslib";
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
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "./StaffPermissionEditor-9olmztnR.mjs";
import "./design-BrHT-rw4.mjs";
import "./ChangePasswordForm-da5YiEvA.mjs";
import "./model-B_rsOxUC.mjs";
import "./useRecordContext-MOIepqyQ.mjs";
import "./calc-BK6sHnP3.mjs";
import "./zaloGroupMessage-kyI4Tfnt.mjs";
import "./mapping-DJG8XEt0.mjs";
function OtSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["ot", "settings"], queryFn: otApi.settings });
  const toggle = async (v) => {
    try {
      await otApi.saveSettings(v);
      await qc.invalidateQueries({ queryKey: ["ot", "settings"] });
      toast.success("Đã lưu cài đặt.");
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Theo dõi đơn hàng" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Cho phép tạo đơn thủ công" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Tắt khi đã đồng bộ đơn từ CRM. Việc tắt không ảnh hưởng những đơn đã tạo." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !!data?.allow_manual, onCheckedChange: toggle, disabled: !data })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Nhắc việc, kênh thông báo và lý do điều chỉnh lịch sẽ có ở giai đoạn tiếp theo." })
    ] })
  ] });
}
const SIG = "sig:";
const LISTS = [
  { scope: "signal_sources", title: "Nguồn tín hiệu", hint: "Chọn một khi tạo tín hiệu" },
  { scope: "signal_products", title: "Loại sản phẩm", hint: "Cho phép chọn nhiều" },
  { scope: "signal_need_groups", title: "Nhóm nhu cầu", hint: "Cho phép chọn nhiều" }
];
function SignalCatalogSettings() {
  const p = useSignalPerms();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-3", children: LISTS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(CatalogCard, { ...l }, l.scope)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignalLabelManager, { uid: p.userId, catalog: p.catalog, sale: p.sale })
  ] });
}
function CatalogCard({ scope, title, hint }) {
  const qc = useQueryClient();
  const o = useOptions(scope);
  const [name, setName] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const refresh = () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith(SIG) });
  const run = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      await refresh();
      if (ok) toast.success(ok);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const persist = (items) => saveOptions(scope, items);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: hint })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex gap-2", onSubmit: (e) => {
      e.preventDefault();
      run(async () => {
        await persist(addOption(o.all, name));
        setName("");
      }, "Đã thêm");
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Tên lựa chọn mới", maxLength: 100, className: "h-9" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", disabled: busy || !name.trim(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y text-sm", children: o.all.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1 py-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("flex-1 min-w-0 truncate", !it.active && "line-through text-muted-foreground"), children: it.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", disabled: busy || i === 0, "aria-label": "Lên", onClick: () => run(() => persist(moveOption(o.all, it.name, -1))), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", disabled: busy || i === o.all.length - 1, "aria-label": "Xuống", onClick: () => run(() => persist(moveOption(o.all, it.name, 1))), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs underline px-1", disabled: busy, onClick: () => {
        const to = window.prompt("Tên mới", it.name);
        if (!to || to.trim() === it.name) return;
        run(async () => {
          const items = renameOption(o.all, it.name, to);
          await renameOptionEverywhere(scope, it.name, items[i].name, items);
        }, "Đã đổi tên, tín hiệu cũ cập nhật theo");
      }, children: "Sửa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs underline px-1", disabled: busy, onClick: () => run(() => persist(toggleOption(o.all, it.name))), children: it.active ? "Ngừng dùng" : "Dùng lại" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs underline px-1 text-destructive", disabled: busy, onClick: () => run(async () => {
        const n = await optionUsage(scope, it.name);
        if (n > 0) throw new Error(`Đang có ${n} tín hiệu dùng lựa chọn này — chỉ được "Ngừng dùng".`);
        if (!window.confirm(`Xóa vĩnh viễn "${it.name}"?`)) return;
        await persist(removeOption(o.all, it.name));
      }), children: "Xóa" })
    ] }, it.name)) })
  ] }) });
}
const readImg = (f) => new Promise((ok, bad) => {
  if (!ALLOWED_IMG.includes(f.type)) return bad(new Error("Chỉ nhận ảnh PNG, JPG, WEBP hoặc ICO."));
  if (f.size > MAX_IMG) return bad(new Error("Ảnh tối đa 500 KB."));
  const r = new FileReader();
  r.onload = () => ok(String(r.result));
  r.onerror = () => bad(new Error("Không đọc được tệp."));
  r.readAsDataURL(f);
});
function SystemInfoSettings() {
  const { can } = useCurrentUser();
  const canEdit = can("system.branding");
  const cur = useBranding();
  const qc = useQueryClient();
  const [d, setD] = reactExports.useState(cur);
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => setD(cur), [cur]);
  const hist = useQuery({
    queryKey: ["branding-history"],
    enabled: canEdit,
    queryFn: async () => (await supabase.from("app_branding_history").select("*").order("created_at", { ascending: false }).limit(10)).data ?? []
  });
  const set = (p) => setD((x) => ({ ...x, ...p }));
  const pick = (key) => async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      set({ [key]: await readImg(f) });
    } catch (err) {
      toast.error(err.message);
    }
  };
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.rpc("branding_save", {
      _app_name: d.app_name,
      _short_name: d.short_name,
      _org_name: d.org_name,
      _description: d.description,
      _logo_url: d.logo_url ?? "",
      _favicon_url: d.favicon_url ?? ""
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Đã lưu thông tin hệ thống");
    qc.invalidateQueries({ queryKey: ["branding"] });
    qc.invalidateQueries({ queryKey: ["branding-history"] });
  };
  const dirty = JSON.stringify({ ...d, updated_at: 0 }) !== JSON.stringify({ ...cur, updated_at: 0 });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[1fr_320px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên ứng dụng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.app_name, maxLength: 60, disabled: !canEdit, onChange: (e) => set({ app_name: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên viết tắt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.short_name, maxLength: 20, disabled: !canEdit, onChange: (e) => set({ short_name: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên đơn vị sử dụng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.org_name, maxLength: 120, disabled: !canEdit, onChange: (e) => set({ org_name: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mô tả ứng dụng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: d.description, maxLength: 200, disabled: !canEdit, onChange: (e) => set({ description: e.target.value }) })
        ] })
      ] }),
      ["logo_url", "favicon_url"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-lg border flex items-center justify-center overflow-hidden bg-muted", children: d[k] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d[k], alt: "", className: "h-full w-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Trống" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: k === "logo_url" ? "Logo" : "Favicon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "PNG, JPG, WEBP",
            k === "favicon_url" ? ", ICO" : "",
            " — tối đa 500 KB"
          ] })
        ] }),
        canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer", children: [
            "Chọn ảnh",
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ALLOWED_IMG.join(","), className: "hidden", onChange: pick(k) })
          ] }) }),
          d[k] && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => set({ [k]: null }), children: "Xóa" })
        ] })
      ] }, k)),
      canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setD({ ...DEFAULT_BRANDING }), children: "Về mặc định" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: !dirty, onClick: () => setD(cur), children: "Hoàn tác" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !dirty || saving, onClick: save, children: saving ? "Đang lưu…" : "Lưu thay đổi" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Bạn chỉ có quyền xem. Cần quyền "Quản lý thông tin hệ thống" để chỉnh sửa.' })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground", children: "XEM TRƯỚC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-sidebar text-sidebar-foreground p-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { b: d, className: "h-9 w-9 rounded-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: d.app_name || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-60", children: d.description })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border px-3 py-2 text-xs flex items-center gap-2", children: [
          d.favicon_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.favicon_url, alt: "", className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/favicon.ico", alt: "", className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
            "Tổng quan — ",
            d.app_name
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border px-3 py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { children: [
            "🔔 ",
            (d.app_name || "").toUpperCase()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Đầu tin Zalo gửi sau khi lưu" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Đơn vị: ",
          d.org_name || "—"
        ] })
      ] }) }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground mb-2", children: "LỊCH SỬ THAY ĐỔI" }),
        (hist.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Chưa có thay đổi." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-xs", children: (hist.data ?? []).map((h) => {
          const ch = Object.keys(h.after).filter((k) => JSON.stringify(h.after[k]) !== JSON.stringify(h.before[k]));
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HistName, { id: h.actor_id }),
              " · ",
              new Date(h.created_at).toLocaleString("vi-VN")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
              "Đổi: ",
              ch.join(", ") || "không đổi"
            ] })
          ] }, h.id);
        }) })
      ] }) })
    ] })
  ] });
}
function HistName({ id }) {
  const q = useQuery({ queryKey: ["profiles-dir"], queryFn: async () => (await supabase.rpc("get_profiles_directory")).data ?? [], staleTime: 6e4 });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: (q.data ?? []).find((p) => p.id === id)?.full_name ?? "—" });
}
const wid = stringType().uuid();
const wfOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("30ff5f0927f0ea26babdd9eaa2a29613b5ae42445486eff3b35c27adb9c41b68"));
const wfAddWebsite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  name: stringType().trim().min(1).max(200),
  domain: stringType().trim().min(3).max(200).regex(/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i, "Domain không hợp lệ"),
  source: stringType().max(200)
}).parse(d)).handler(createSsrRpc("92c37464a4fff0c25f79887c18b9ffc3852c074e53c810666f38d8ef65c592cd"));
const wfWebsiteAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  websiteId: wid,
  action: enumType(["rotate_key", "revoke_key", "set_source", "rename"]),
  source: stringType().max(200).nullable().optional(),
  name: stringType().trim().min(1).max(200).optional()
}).parse(d)).handler(createSsrRpc("eff8e81716b2b5f6815cad9a1ddeb2d590e855c41f31fb1a7b5ef7c72d3a71c6"));
const rule = unionType([objectType({
  mode: literalType("website"),
  key: stringType().max(100),
  valueMap: recordType(stringType().max(500), stringType().max(200)).optional()
}), objectType({
  mode: literalType("default"),
  value: unionType([stringType().max(3e3), arrayType(stringType().max(200)).max(50)])
}), objectType({
  mode: literalType("compose"),
  keys: arrayType(stringType().max(100)).min(1).max(30)
}), objectType({
  mode: literalType("empty")
})]);
const wfSaveForm = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  websiteId: wid,
  formId: stringType().min(1).max(100),
  variant: stringType().max(100).default(""),
  mapping: recordType(stringType(), rule).optional(),
  enabled: booleanType().optional()
}).parse(d)).handler(createSsrRpc("3002c612923103f9023be94a38ef97ad2828bc1497cd878c69adf016265fe5cf"));
const wfEvents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  websiteId: stringType().max(40).optional(),
  formId: stringType().max(100).optional(),
  status: stringType().max(20).optional(),
  from: stringType().max(30).optional(),
  to: stringType().max(30).optional()
}).parse(d)).handler(createSsrRpc("884590a2d512ae6560f76a5ec7ffb987d6aff38e8362f1e306ceddfeb15cc78f"));
const wfRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e673070006620209c01601f62906ad4d237be476d9c9c32a036e48484bb4ee1a"));
const STATUS = { pending: "Chờ xử lý", success: "Thành công", failed: "Thất bại", skipped: "Bỏ qua", duplicate: "Trùng", needs_action: "Cần xử lý" };
const STATE = { processing: "Đang xử lý", stuck: "Quá hạn xử lý", retry_wait: "Chờ thử lại", needs_action: "Lỗi cần can thiệp", success: "Thành công", skipped: "Bỏ qua", duplicate: "Trùng" };
const fmt = (s) => s ? new Date(s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
const copyText = (v) => {
  navigator.clipboard.writeText(v);
  toast.success("Đã sao chép");
};
function WebFormsSettings() {
  const overview = useServerFn(wfOverview);
  const [ov, setOv] = reactExports.useState(null);
  const [err, setErr] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const [newKey, setNewKey] = reactExports.useState(null);
  const [editForm, setEditForm] = reactExports.useState(null);
  const load = () => overview().then((r) => {
    setOv(r);
    setErr(null);
  }).catch((e) => setErr(e.message));
  useVisibleRefresh(load, 3e4);
  reactExports.useEffect(() => {
    load();
  }, []);
  if (err) return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5 text-sm text-destructive", children: err }) });
  if (!ov) return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5 text-sm text-muted-foreground", children: "Đang tải…" }) });
  const form = editForm ? ov.forms.find((f) => f.website_id === editForm.websiteId && f.form_id === editForm.formId && f.variant === editForm.variant) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCard, { ov }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "websites", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "websites", children: "Website & Form" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: "Lịch sử đồng bộ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "websites", className: "mt-3 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setAdding(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
          "Thêm Website"
        ] }),
        ov.websites.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có Website nào. Thêm Website để nhận tín hiệu từ Form WordPress." }),
        ov.websites.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          WebsiteCard,
          {
            website: w,
            ov,
            onChange: load,
            onKey: (k) => setNewKey(k),
            onEdit: (f) => setEditForm(f)
          },
          w.id
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { ov }) })
    ] }),
    adding && /* @__PURE__ */ jsxRuntimeExports.jsx(AddWebsiteDialog, { ov, onClose: () => setAdding(false), onCreated: (r) => {
      setAdding(false);
      setNewKey(r);
      load();
    } }),
    newKey && /* @__PURE__ */ jsxRuntimeExports.jsx(KeyDialog, { data: newKey, ov, onClose: () => setNewKey(null) }),
    form && /* @__PURE__ */ jsxRuntimeExports.jsx(MappingDialog, { form, ov, onClose: () => setEditForm(null), onSaved: load })
  ] });
}
function StatusCard({ ov }) {
  const s = ov.stats;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4" }),
      "Website Forms — nhận tín hiệu từ Form WordPress"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        "Website đang kết nối: ",
        ov.websites.filter((w) => w.status === "active").length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        "Form đang bật: ",
        ov.forms.filter((f) => f.enabled).length
      ] })
    ] }),
    [["Kiểm tra kết nối (Ping)", ov.endpoints.ping], ["Đăng ký Form", ov.endpoints.register], ["Gửi submission", ov.endpoints.submit]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground w-44", children: l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-2 py-1 rounded break-all", children: v }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => copyText(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }) })
    ] }, l)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1", children: [["Submission thành công", s.success ?? 0], ["Đang chờ xử lý", s.pending ?? 0], ["Lỗi cần xử lý", (s.failed ?? 0) + (s.needs_action ?? 0)], ["Bỏ qua / trùng", (s.skipped ?? 0) + (s.duplicate ?? 0)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: v })
    ] }, l)) })
  ] }) });
}
function AddWebsiteDialog({ ov, onClose, onCreated }) {
  const add = useServerFn(wfAddWebsite);
  const [name, setName] = reactExports.useState("");
  const [domain, setDomain] = reactExports.useState("");
  const [source, setSource] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Thêm Website" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tên Website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Xưởng Gốm Sứ Việt" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Domain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: domain, onChange: (e) => setDomain(e.target.value), placeholder: "xuonggomsuviet.vn" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nguồn tín hiệu (từ Kho nguồn)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: source, onValueChange: setSource, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn nguồn…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ov.catalogs.sources.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sau khi tạo, Base cấp Website ID và khóa kết nối riêng — khóa chỉ hiển thị đúng một lần." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Hủy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !name.trim() || !domain.trim() || !source || busy, onClick: async () => {
        setBusy(true);
        try {
          onCreated(await add({ data: { name: name.trim(), domain: domain.trim(), source } }));
        } catch (e) {
          toast.error(e.message);
          setBusy(false);
        }
      }, children: "Tạo Website" })
    ] })
  ] }) });
}
function KeyDialog({ data, ov, onClose }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4" }),
      "Khóa kết nối — chỉ hiển thị một lần"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive font-medium", children: "Sao chép và lưu khóa ngay. Sau khi đóng, Base không thể hiển thị lại khóa này." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Website ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-2 py-1 rounded break-all", children: data.websiteId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => copyText(data.websiteId), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Khóa kết nối" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-2 py-1 rounded break-all", children: data.key }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => copyText(data.key), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Cấu hình trong plugin WordPress (backend PHP, không đưa khóa ra JavaScript):" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "· Endpoint gửi dữ liệu: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "break-all", children: ov.endpoints.submit })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          '· Mỗi request ký HMAC-SHA256: chữ ký = HMAC(khóa, timestamp + "." + thân request), gửi kèm header ',
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "x-wf-website" }),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "x-wf-timestamp" }),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "x-wf-signature" }),
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Đã lưu khóa" }) })
  ] }) });
}
function WebsiteCard({ website: w, ov, onChange, onKey, onEdit }) {
  const act = useServerFn(wfWebsiteAction);
  const [busy, setBusy] = reactExports.useState(false);
  const [renaming, setRenaming] = reactExports.useState(false);
  const [newName, setNewName] = reactExports.useState(w.name);
  const forms = ov.forms.filter((f) => f.website_id === w.id);
  const key = ov.keys.find((k) => k.website_id === w.id);
  const run = async (payload, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    try {
      const r = await act({ data: { websiteId: w.id, ...payload } });
      if (r?.key) onKey({ websiteId: w.id, key: r.key });
      toast.success(r?.message ?? "Đã lưu");
      onChange();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
          w.name,
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: w.status === "active" ? "secondary" : "destructive", children: w.status === "active" ? "Đang kết nối" : "Đã thu hồi" }),
          key && !key.revoked_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            "Khóa: ",
            key.key_prefix,
            "…"
          ] }),
          (!key || key.revoked_at) && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Khóa đã thu hồi" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 break-all", children: [
          w.domain,
          " · ID ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: w.id }),
          " · Kết nối gần nhất: ",
          fmt(w.last_seen_at)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setRenaming(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
          "Đổi tên"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => run({ action: "rotate_key" }, "Cấp khóa mới? Khóa cũ sẽ hết hiệu lực ngay, plugin WordPress phải cập nhật khóa mới."), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1" }),
          "Đổi khóa"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => run({ action: "revoke_key" }, "Thu hồi khóa? Website sẽ ngắt kết nối và mọi Form tắt đồng bộ. Lịch sử được giữ lại."), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5 mr-1" }),
          "Thu hồi khóa"
        ] })
      ] })
    ] }),
    renaming && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newName, onChange: (e) => setNewName(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy, onClick: () => {
        setRenaming(false);
        run({ action: "rename", name: newName });
      }, children: "Lưu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setRenaming(false), children: "Hủy" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nguồn tín hiệu:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: w.source ?? "", onValueChange: (v) => run({ action: "set_source", source: v || null }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-64 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chưa chọn nguồn" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ov.catalogs.sources.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
      ] }),
      !w.source && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Chưa chọn nguồn — Form chưa thể bật" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        forms.length,
        " Form đã phát hiện · ",
        forms.filter((f) => f.enabled).length,
        " đang bật · Cập nhật cấu trúc: ",
        fmt(forms[0]?.checked_at)
      ] }),
      forms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có Form nào — plugin WordPress gọi API Đăng ký Form để Base nhận diện trường." }),
      forms.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(FormRow, { form: f, website: w, ov, onChange, onEdit: () => onEdit({ websiteId: w.id, formId: f.form_id, variant: f.variant }) }, `${f.form_id}|${f.variant}`))
    ] })
  ] }) });
}
function FormRow({ form: f, website: w, ov, onChange, onEdit }) {
  const save = useServerFn(wfSaveForm);
  const [busy, setBusy] = reactExports.useState(false);
  validateMapping(f.mapping, f.schema ?? [], ov.catalogs, w.source);
  const toggle = async (enabled) => {
    setBusy(true);
    try {
      const r = await save({ data: { websiteId: w.id, formId: f.form_id, variant: f.variant, enabled } });
      r.ok ? toast.success(r.message) : toast.error(r.message);
      onChange();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
        f.name,
        f.variant && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
          "Nhóm: ",
          f.variant
        ] }),
        f.needs_review && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Cần kiểm tra lại" }),
        f.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
          "Đang đồng bộ từ ",
          fmt(f.enabled_at)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
        f.form_id,
        " · ",
        (f.schema ?? []).length,
        " trường",
        f.mapping ? "" : " · chưa cấu hình ánh xạ"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: onEdit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-3.5 w-3.5 mr-1" }),
        "Cấu hình"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.enabled, disabled: busy, onCheckedChange: toggle, "aria-label": `Đồng bộ ${f.name}` })
    ] })
  ] });
}
const MODES = [
  { value: "website", label: "Lấy từ Website" },
  { value: "default", label: "Giá trị mặc định" },
  { value: "compose", label: "Ghép nhiều trường" },
  { value: "empty", label: "Để trống" }
];
function MappingDialog({ form, ov, onClose, onSaved }) {
  const save = useServerFn(wfSaveForm);
  const fields = form.schema ?? [];
  const [mapping, setMapping] = reactExports.useState(form.mapping ?? suggestMapping({}, fields));
  const [busy, setBusy] = reactExports.useState(false);
  const website = ov.websites.find((w) => w.id === form.website_id);
  const errs = validateMapping(mapping, fields, ov.catalogs, website?.source ?? null);
  const siblings = ov.forms.filter((x) => x.website_id === form.website_id && (x.form_id !== form.form_id || x.variant !== form.variant) && x.mapping);
  const set = (k, r) => setMapping({ ...mapping, [k]: r });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Ánh xạ dữ liệu — ",
      form.name,
      form.variant ? ` · Nhóm ${form.variant}` : ""
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setMapping(suggestMapping(mapping, fields)), children: "Tự gợi ý mapping" }),
      siblings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: (v) => {
        const src = siblings.find((x) => `${x.form_id}|${x.variant}` === v);
        if (!src) return;
        const { mapping: m, dropped } = copyMapping(src.mapping, fields);
        setMapping(m);
        if (dropped.length) toast.warning(`Bỏ qua ${dropped.length} trường không có ở Form này: ${dropped.join(", ")}`);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-56 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sao chép mapping từ Form khác…" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: siblings.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: `${x.form_id}|${x.variant}`, children: [
          x.name,
          x.variant ? ` · ${x.variant}` : ""
        ] }, `${x.form_id}|${x.variant}`)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: FIELDS.map((f) => {
      const r = mapping[f.key];
      const mode = r?.mode ?? "empty";
      const catValues = f.catalog ? ov.catalogs[f.catalog] : [];
      const srcField = r?.mode === "website" ? fields.find((x) => x.key === r.key) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
            f.label,
            f.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: " *" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mode, onValueChange: (v) => {
            const m = v;
            set(f.key, m === "website" ? { mode: "website", key: "" } : m === "default" ? { mode: "default", value: f.catalog ? [] : "" } : m === "compose" ? { mode: "compose", keys: [] } : { mode: "empty" });
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MODES.filter((m) => m.value !== "compose" || f.kind === "text").map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value)) })
          ] })
        ] }),
        r?.mode === "website" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: r.key, onValueChange: (v) => set(f.key, { ...r, key: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn trường của Form…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: fields.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: x.key, children: [
              x.label,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                "(",
                x.key,
                ")"
              ] })
            ] }, x.key)) })
          ] }),
          f.catalog && srcField?.options?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ánh xạ đáp án → giá trị danh mục Base:" }),
            srcField.options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-48 truncate", children: o.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: r.valueMap?.[o.value] ?? "", onValueChange: (v) => set(f.key, { ...r, valueMap: { ...r.valueMap ?? {}, [o.value]: v } }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Bỏ qua" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: catValues.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
              ] })
            ] }, o.key ?? o.value))
          ] }) : null
        ] }),
        r?.mode === "default" && (f.catalog ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: catValues.map((c) => {
          const vals = Array.isArray(r.value) ? r.value : [];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 text-xs border rounded px-2 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: vals.includes(c), onCheckedChange: (ck) => set(f.key, { mode: "default", value: ck ? [...vals, c] : vals.filter((x) => x !== c) }) }),
            c
          ] }, c);
        }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(r.value ?? ""), onChange: (e) => set(f.key, { mode: "default", value: e.target.value }), placeholder: "Giá trị cố định…" })),
        r?.mode === "compose" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Chọn các trường ghép lại — mỗi trường một dòng "Nhãn: trả lời", tự bỏ trường rỗng.' }),
          fields.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: r.keys.includes(x.key), onCheckedChange: (ck) => set(f.key, { mode: "compose", keys: ck ? [...r.keys, x.key] : r.keys.filter((k) => k !== x.key) }) }),
            x.label,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "(",
              x.key,
              ")"
            ] })
          ] }, x.key))
        ] })
      ] }, f.key);
    }) }),
    errs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive space-y-1", children: errs.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "· ",
      e
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Đóng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: busy, onClick: async () => {
        setBusy(true);
        try {
          const r = await save({ data: { websiteId: form.website_id, formId: form.form_id, variant: form.variant, mapping } });
          r.ok ? toast.success(r.message) : toast.error(r.message);
          onSaved();
        } catch (e) {
          toast.error(e.message);
        } finally {
          setBusy(false);
        }
      }, children: "Lưu cấu hình" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || errs.length > 0, onClick: async () => {
        setBusy(true);
        try {
          const r = await save({ data: { websiteId: form.website_id, formId: form.form_id, variant: form.variant, mapping, enabled: true } });
          r.ok ? toast.success(r.message) : toast.error(r.message);
          onSaved();
          onClose();
        } catch (e) {
          toast.error(e.message);
        } finally {
          setBusy(false);
        }
      }, children: "Lưu & Bật đồng bộ" })
    ] })
  ] }) });
}
function History({ ov }) {
  const list = useServerFn(wfEvents);
  const retry = useServerFn(wfRetry);
  const [rows, setRows] = reactExports.useState([]);
  const [fWebsite, setFWebsite] = reactExports.useState("");
  const [fStatus, setFStatus] = reactExports.useState("");
  const load = () => list({ data: { websiteId: fWebsite || void 0, status: fStatus || void 0 } }).then(setRows).catch((e) => toast.error(e.message));
  reactExports.useEffect(() => {
    load();
  }, [fWebsite, fStatus]);
  const nameOf = (id) => ov.websites.find((w) => w.id === id)?.name ?? id;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fWebsite, onValueChange: setFWebsite, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-56 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Tất cả Website" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ov.websites.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.name }, w.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fStatus, onValueChange: setFStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mọi trạng thái" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(STATUS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
        setFWebsite("");
        setFStatus("");
      }, children: "Xóa lọc" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: load, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1" }),
        "Làm mới"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Thời gian nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Form / Nhóm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Tín hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-3 py-2", children: "Lỗi / Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmt(r.received_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: nameOf(r.website_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
            r.form_id,
            r.variant ? ` · ${r.variant}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.state === "success" ? "secondary" : ["processing", "retry_wait"].includes(r.state) ? "outline" : "destructive", children: STATE[r.state] ?? STATUS[r.status] ?? r.status }),
            r.state === "retry_wait" && r.next_retry_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
              "lần ",
              r.attempts,
              " · thử lại lúc ",
              fmt(r.next_retry_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
            r.signal_id ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signals", className: "text-primary underline text-xs", children: "Mở tín hiệu" }) : "—",
            r.page_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: r.page_url, target: "_blank", rel: "noreferrer", className: "block text-xs text-muted-foreground underline truncate max-w-40", children: "Trang nguồn" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs text-muted-foreground max-w-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2", title: r.error ?? "", children: r.error ?? (r.state === "stuck" ? "Quá hạn xử lý — hệ thống tự phục hồi trong vài phút" : "—") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: !r.signal_id && r.has_payload && ["failed", "needs_action", "skipped", "stuck", "retry_wait"].includes(r.state) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: async () => {
            try {
              const x = await retry({ data: { id: r.id } });
              toast.success(x.status === "busy" ? "Submission đang được xử lý, vui lòng đợi" : `Đã thử lại: ${STATUS[x.status] ?? x.status}`);
              load();
            } catch (e) {
              toast.error(e.message);
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-3.5 w-3.5 mr-1" }),
            "Thử lại"
          ] }) })
        ] }, r.id)),
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-3 py-10 text-center text-muted-foreground text-sm", children: "Chưa có submission nào." }) })
      ] })
    ] }) })
  ] }) });
}
const EVENTS = [
  ["content_assigned", "Giao bài mới"],
  ["content_review", "Gửi bài chờ duyệt"],
  ["content_revise", "Yêu cầu chỉnh sửa"],
  ["content_approved", "Bài được duyệt"],
  ["content_published", "Bài đã đăng"]
];
const ORDER_EVENTS = [
  ["order_new", "Order mới chưa phân công"],
  ["order_assigned", "Phân công thiết kế"],
  ["order_taken", "Nhân viên nhận việc"],
  ["order_review", "Thiết kế gửi duyệt"],
  ["order_revise", "Yêu cầu chỉnh sửa"],
  ["order_approved", "Thiết kế được duyệt"],
  ["order_delivered", "Bàn giao thiết kế"]
];
function OrderNotifySettings({ canEdit }) {
  const [cfg, setCfg] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.from("content_notify_settings").select("data").eq("id", 1).maybeSingle().then(({ data }) => {
      const d = data?.data?.order ?? {};
      setCfg({ zalo: d.zalo ?? {}, remind: { enabled: !!d.remind?.enabled, hours: Number(d.remind?.hours) || 24 } });
    });
  }, []);
  if (!cfg) return null;
  const save = async () => {
    setBusy(true);
    const order = { zalo: { ...cfg.zalo, order_remind: cfg.remind.enabled }, remind: cfg.remind };
    const { error } = await supabase.rpc("content_notify_save", { _data: { order } });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Đã lưu cài đặt thông báo Order Thiết kế");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông báo Order Thiết kế" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Thông báo trong Base và trên thiết bị luôn được gửi. Các công tắc dưới đây chỉ bật/tắt gửi qua Zalo." }),
      ORDER_EVENTS.map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { disabled: !canEdit, checked: !!cfg.zalo[k], onCheckedChange: (v) => setCfg({ ...cfg, zalo: { ...cfg.zalo, [k]: v } }) })
      ] }, k)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nhắc việc tự động" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { disabled: !canEdit, checked: cfg.remind.enabled, onCheckedChange: (v) => setCfg({ ...cfg, remind: { ...cfg.remind, enabled: v } }) })
        ] }),
        cfg.remind.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [
          "Nhắc sau",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 1,
              max: 168,
              className: "w-20 h-8",
              disabled: !canEdit,
              value: cfg.remind.hours,
              onChange: (e) => setCfg({ ...cfg, remind: { ...cfg.remind, hours: Math.max(1, Math.min(168, Number(e.target.value) || 24)) } })
            }
          ),
          "giờ: chưa nhận việc (nhắc người được giao), chờ duyệt (nhắc người duyệt), đã bàn giao chưa xác nhận (nhắc người xác nhận). Tối đa 1 lần/ngày/order, 08:00–17:59."
        ] })
      ] }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy, onClick: save, children: "Lưu" })
    ] })
  ] });
}
function ContentNotifySettings({ canEdit }) {
  const [cfg, setCfg] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.from("content_notify_settings").select("data").eq("id", 1).maybeSingle().then(({ data }) => {
      const d = data?.data ?? {};
      setCfg({ zalo: d.zalo ?? {}, remind: { enabled: !!d.remind?.enabled, hours: Number(d.remind?.hours) || 24 } });
    });
  }, []);
  if (!cfg) return null;
  const save = async () => {
    setBusy(true);
    const data = { zalo: { ...cfg.zalo, content_remind: cfg.remind.enabled }, remind: cfg.remind };
    const { error } = await supabase.rpc("content_notify_save", { _data: data });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Đã lưu cài đặt thông báo Content Web");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Thông báo Content Web" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Thông báo trong Base và trên thiết bị luôn được gửi. Các công tắc dưới đây chỉ bật/tắt gửi qua Zalo." }),
      EVENTS.map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { disabled: !canEdit, checked: !!cfg.zalo[k], onCheckedChange: (v) => setCfg({ ...cfg, zalo: { ...cfg.zalo, [k]: v } }) })
      ] }, k)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nhắc bài viết chưa được duyệt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { disabled: !canEdit, checked: cfg.remind.enabled, onCheckedChange: (v) => setCfg({ ...cfg, remind: { ...cfg.remind, enabled: v } }) })
        ] }),
        cfg.remind.enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
          "Nhắc người duyệt sau",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 1,
              max: 168,
              className: "w-20 h-8",
              disabled: !canEdit,
              value: cfg.remind.hours,
              onChange: (e) => setCfg({ ...cfg, remind: { ...cfg.remind, hours: Math.max(1, Math.min(168, Number(e.target.value) || 24)) } })
            }
          ),
          "giờ kể từ lần gửi duyệt gần nhất (tối đa 1 lần/ngày/bài, 08:00–17:59)."
        ] })
      ] }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy, onClick: save, children: "Lưu" })
    ] })
  ] });
}
function ListEditor({
  items,
  onAdd,
  onRemove
}) {
  const [val, setVal] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val, onChange: (e) => setVal(e.target.value), placeholder: "Thêm mới..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        if (val.trim()) {
          onAdd(val.trim());
          setVal("");
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm", children: [
        i,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRemove(i), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
      ] }, i)),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Trống." })
    ] })
  ] });
}
const STATUS_COLOR = {
  "Đang hoạt động": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "Chờ duyệt": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "Tạm khóa": "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  "Từ chối": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  "Lưu trữ": "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
};
const ONLINE_WINDOW_MS = 5 * 60 * 1e3;
function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}
function timeAgo(iso) {
  if (!iso) return "chưa đăng nhập";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 6e4);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}
function PresenceCell({
  lastSeenAt
}) {
  const online = isOnline(lastSeenAt);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-zinc-400"}`, "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium ${online ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`, children: online ? "Online" : "Offline" })
    ] }),
    !online && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
      "Hoạt động lần cuối: ",
      timeAgo(lastSeenAt)
    ] })
  ] });
}
function PersonEditDialog({
  edit,
  onClose
}) {
  const auth = useAuth();
  const user = auth.users.find((u) => u.id === edit.id);
  const [form, setForm] = reactExports.useState(edit);
  const isSystem = !!user?.system;
  const save = async () => {
    await auth.updateUser(edit.id, {
      fullName: form.fullName,
      phone: form.phone || void 0,
      notes: form.notes || void 0
    });
    if (!isSystem && form.status !== edit.status) {
      await auth.setStatus(edit.id, form.status);
    }
    toast.success("Đã lưu hồ sơ nhân sự");
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Hồ sơ nhân sự — ",
      edit.fullName
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Họ tên" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fullName, onChange: (e) => setForm({
          ...form,
          fullName: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SĐT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => setForm({
          ...form,
          phone: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vị trí mong muốn (khi đăng ký)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.position || "—", readOnly: true, disabled: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trạng thái làm việc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm({
          ...form,
          status: v
        }), disabled: isSystem, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Đang hoạt động", "Tạm khóa", "Lưu trữ"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
        ] }),
        isSystem && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Tài khoản hệ thống không thể đổi trạng thái." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ghi chú" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes, onChange: (e) => setForm({
          ...form,
          notes: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Huỷ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Lưu" })
    ] })
  ] }) });
}
function SettingsPage() {
  const s = useStore();
  const auth = useAuth();
  const [editing, setEditing] = reactExports.useState(null);
  const {
    can
  } = useCurrentUser();
  const showAccounts = can("settings.user_view") || can("settings.role") || can("settings.permission");
  const showPeople = can("settings.people");
  const showCatalog = can("settings.catalog") || can("settings.plan_topic");
  const showInfo = can("settings.system_view") || can("system.branding");
  const showSigCat = can("signal.catalog") || can("signal.manage");
  const showLeave = can("leave.settings");
  const canPresence = can("settings.view_presence");
  const initialTab = showAccounts ? "accounts" : showPeople ? "people" : showCatalog ? "plans" : "info";
  const me = auth.users.find((u) => u.id === auth.currentUserId);
  const zaloAdmin = !!me && (me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin");
  const showFbl = can("integration.facebook_leads");
  const showWf = can("integration.website_forms");
  const [tab, setTab] = reactExports.useState(() => {
    if (typeof window === "undefined") return initialTab;
    const q = new URLSearchParams(window.location.search);
    return q.get("zalo") ? "zalo" : q.get("tab") || initialTab;
  });
  const [presenceFilter, setPresenceFilter] = reactExports.useState("all");
  const setPlans = (next) => s.setCatalog("plans", next);
  const setTopics = (next) => s.setCatalog("topics", next);
  const [, setTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const iv = setInterval(() => setTick((n) => n + 1), 3e4);
    return () => clearInterval(iv);
  }, []);
  const filteredUsers = auth.users.filter((u) => {
    if (!canPresence || presenceFilter === "all") return true;
    const online = isOnline(u.lastSeenAt);
    return presenceFilter === "online" ? online : !online;
  });
  const colSpan = canPresence ? 8 : 7;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Cài Đặt", description: "Tài khoản, phân quyền, hồ sơ nhân sự và danh mục dùng chung." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        showAccounts && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "accounts", children: "Tài khoản & Phân quyền" }),
        showPeople && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "people", children: "Nhân sự" }),
        showCatalog && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "plans", children: "Plan" }),
        showCatalog && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "topics", children: "Topic" }),
        showInfo && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "info", children: "Thông tin hệ thống" }),
        showSigCat && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "sigcat", children: "Danh mục tín hiệu" }),
        showLeave && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "leave", children: "Đơn từ & Phê duyệt" }),
        can("ot.settings") && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ot", children: "Theo dõi đơn hàng" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "zalo", children: "Thông báo Zalo" }),
        showFbl && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "fbleads", children: "Tích hợp Marketing · Facebook Lead Ads" }),
        showWf && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "webforms", children: "Tích hợp Marketing · Website Forms" })
      ] }),
      showFbl && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "fbleads", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FbLeadsSettings, {}) }),
      showWf && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "webforms", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WebFormsSettings, {}) }),
      showSigCat && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sigcat", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SignalCatalogSettings, {}) }),
      showLeave && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "leave", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LeaveSettings, {}) }),
      can("ot.settings") && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ot", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OtSettings, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "zalo", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ZaloSettingsTab, { isAdmin: zaloAdmin }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ContentNotifySettings, { canEdit: zaloAdmin || can("settings.system_edit") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OrderNotifySettings, { canEdit: zaloAdmin || can("settings.system_edit") })
      ] }),
      showAccounts && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "accounts", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountsSettings, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "people", className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Mỗi tài khoản đã duyệt là một nhân sự. Tạo mới hoặc duyệt tài khoản tại tab ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tài khoản & Phân quyền" }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            canPresence && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: presenceFilter, onValueChange: (v) => setPresenceFilter(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px] h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Tất cả" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "online", children: "Đang online" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "offline", children: "Đang offline" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setTab("accounts"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 mr-1.5" }),
              "Tạo tài khoản mới"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Họ tên" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Vị trí" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "SĐT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Trạng thái" }),
            canPresence && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-4 py-2.5", children: "Hoạt động" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium px-4 py-2.5" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
            filteredUsers.map((u) => {
              const role = auth.roles.find((r) => r.id === u.roleId);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  u.fullName || u.username,
                  u.system && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
                    "Tài khoản hệ thống"
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.desiredPosition || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.email || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: u.phone || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-muted-foreground", children: role?.name || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[u.status] || ""}`, children: u.status }) }),
                canPresence && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PresenceCell, { lastSeenAt: u.lastSeenAt }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing({
                  id: u.id,
                  fullName: u.fullName,
                  phone: u.phone || "",
                  position: u.desiredPosition || "",
                  notes: u.notes || "",
                  status: u.status
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }) })
              ] }, u.id);
            }),
            filteredUsers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan, className: "px-4 py-10 text-center text-muted-foreground text-sm", children: "Không có nhân sự phù hợp." }) })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "plans", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListEditor, { items: s.plans, onAdd: (v) => setPlans([...s.plans, v]), onRemove: (v) => setPlans(s.plans.filter((x) => x !== v)) }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "topics", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListEditor, { items: s.topics, onAdd: (v) => setTopics([...s.topics, v]), onRemove: (v) => setTopics(s.topics.filter((x) => x !== v)) }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "info", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SystemInfoSettings, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 text-sm text-muted-foreground space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Dữ liệu được lưu trên Lovable Cloud — chia sẻ giữa tất cả người dùng và thiết bị." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Tài khoản đang hoạt động sẽ tự động xuất hiện trong các dropdown chọn người phụ trách trong toàn app." })
        ] }) })
      ] })
    ] }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(PersonEditDialog, { edit: editing, onClose: () => setEditing(null) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(RequirePermission, { perm: "settings.view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsPage, {}) });
export {
  SplitComponent as component
};
