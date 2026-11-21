import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useServerFn, C as Card, o as CardContent, c as createSsrRpc, l as Badge, B as Button, T as Switch, I as Input, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, N as Checkbox, E as DialogFooter } from "./router-CkmTURa-.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CHuMrfap.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { validateMapping, FIELDS, suggestMapping } from "./mapping-DJG8XEt0.mjs";
import { bh as Facebook, aC as RefreshCw, b7 as Copy, bi as Link2, b9 as RotateCw, bj as Unlink, aj as Settings2 } from "../_libs/lucide-react.mjs";
import { o as objectType, b as booleanType, s as stringType, e as enumType, r as recordType, a as arrayType, u as unionType, l as literalType } from "../_libs/zod.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
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
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
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
import "node:stream";
import "../_libs/isbot.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
const id = stringType().regex(/^\d{1,40}$/);
const fblOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("e7d55f66a5107ba7e1d3b8d32abe7f547587f7286cf17f139134a3bb33285301"));
const fblConnectUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  messaging: booleanType().optional()
}).optional().parse(d)).handler(createSsrRpc("131b0a4b0abf3b73f8dd79b796c48614b49ec5a392c5e2b994a397344cecbe55"));
const fblPendingPages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  state: stringType().max(100)
}).parse(d)).handler(createSsrRpc("575f8e9cf35b1ba370cba87bc13367912675146ef02636b0293298e44cf164e9"));
const fblConnectPages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  state: stringType().max(100),
  pageIds: arrayType(id).min(1).max(50),
  choices: arrayType(objectType({
    pageId: id,
    lead: booleanType(),
    messaging: booleanType()
  })).max(50).optional()
}).parse(d)).handler(createSsrRpc("5da6be177cacc9ebd2ee25941c5698310a2f140dc3b64e1120bff4a8e59ccdca"));
const fblPageAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: id,
  action: enumType(["check", "refresh", "disconnect", "source"]),
  source: stringType().max(200).nullable().optional()
}).parse(d)).handler(createSsrRpc("7d21e629d39e0be676db8b01fe888283db8946f80c51bfc050a68dd039293b2a"));
const rule = unionType([objectType({
  mode: literalType("facebook"),
  key: stringType().max(200),
  valueMap: recordType(stringType().max(200), stringType().max(200)).optional()
}), objectType({
  mode: literalType("default"),
  value: unionType([stringType().max(3e3), arrayType(stringType().max(200)).max(50)])
}), objectType({
  mode: literalType("empty")
})]);
const fblSaveForm = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  formId: id,
  mapping: recordType(stringType(), rule).optional(),
  enabled: booleanType().optional()
}).parse(d)).handler(createSsrRpc("a9897e29da9dbd258b768d7c310b213960337aaf301f5ca3554cd154fee1addc"));
const fblEvents = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: stringType().max(40).optional(),
  formId: stringType().max(40).optional(),
  status: stringType().max(20).optional(),
  from: stringType().max(30).optional(),
  to: stringType().max(30).optional()
}).parse(d)).handler(createSsrRpc("2457f5b28011522a725a25f2560a17be6d90c45631296e05e17229ec9bfe1735"));
const fblRetry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e4e0298a8fbaca62f929b46543eff5b6e0b8baaa44217a31c95ae11288fc8b14"));
const fblBackfill = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  formId: id,
  from: stringType().datetime(),
  to: stringType().datetime(),
  apply: booleanType()
}).parse(d)).handler(createSsrRpc("8e9bf063149694a0dd7f68755b2305c6d6a6a674ba6aed9eaa8c14b26248717a"));
const fblMaintainNow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b03ef1627952dca145d4489c9db35c6b837043b81f8a2408ed710045dabf96b4"));
const fblWebhookDiagnostic = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("e308716a992afcbcddc20c5061849c1a64edfd606eba580c431d095b1647663c"));
const fblPageFeatures = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: id,
  lead: booleanType(),
  messaging: booleanType()
}).parse(d)).handler(createSsrRpc("1545822d234fc398f8ce7f7d948aa060c23ad567823532f5338a7449698764d2"));
function useVisibleRefresh(refresh, interval = 1e4) {
  const current = reactExports.useRef(refresh);
  current.current = refresh;
  reactExports.useEffect(() => {
    let stopped = false;
    let running = false;
    const run = async () => {
      if (stopped || running || document.visibilityState !== "visible") return;
      running = true;
      try {
        await current.current();
      } catch {
      } finally {
        running = false;
      }
    };
    const timer = window.setInterval(run, interval);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("focus", run);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("focus", run);
    };
  }, [interval]);
}
function secondsBetween(from, to) {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Number.isFinite(ms) && ms >= 0 ? ms / 1e3 : null;
}
function eventLatency(e) {
  return {
    webhookSeconds: e.receipt_method === "webhook" ? secondsBetween(e.lead_created_at, e.webhook_received_at) : null,
    processingSeconds: secondsBetween(e.received_at, e.signal_created_at)
  };
}
const STATUS = { pending: "Chờ xử lý", success: "Thành công", failed: "Thất bại", skipped: "Bỏ qua", duplicate: "Trùng", needs_action: "Cần xử lý" };
const fmt = (s) => s ? new Date(s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
const METHOD = { webhook: "Webhook", reconciliation: "Quét bù tự động", backfill: "Đồng bộ bù", legacy_unknown: "Chưa xác định (lịch sử cũ)" };
const duration = (seconds) => seconds === null ? "—" : `${seconds.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giây`;
function FbLeadsSettings() {
  const overview = useServerFn(fblOverview);
  const [ov, setOv] = reactExports.useState(null);
  const [err, setErr] = reactExports.useState(null);
  const [pendingState, setPendingState] = reactExports.useState(null);
  const [editForm, setEditForm] = reactExports.useState(null);
  const load = () => overview().then((r) => {
    setOv(r);
    setErr(null);
  }).catch((e) => setErr(e.message));
  useVisibleRefresh(load, 3e4);
  reactExports.useEffect(() => {
    load();
    const q = new URLSearchParams(window.location.search);
    if (q.get("fbl_state")) setPendingState(q.get("fbl_state"));
    if (q.get("fbl_error")) toast.error(`Kết nối Facebook thất bại: ${q.get("fbl_error")}`);
  }, []);
  if (err) return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5 text-sm text-destructive", children: err }) });
  if (!ov) return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5 text-sm text-muted-foreground", children: "Đang tải…" }) });
  const form = ov.forms.find((f) => f.form_id === editForm);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusCard, { ov }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "pages", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "pages", children: "Page & Form" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: "Lịch sử đồng bộ" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "pages", className: "mt-3 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectButton, { disabled: !ov.secrets.appSecret, messaging: ov.inboxAvailable }),
        ov.pages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có Page nào được kết nối." }),
        ov.pages.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PageCard, { page: p, ov, onChange: load, onEdit: setEditForm }, p.page_id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { ov }) })
    ] }),
    pendingState && /* @__PURE__ */ jsxRuntimeExports.jsx(PickPages, { state: pendingState, onDone: () => {
      setPendingState(null);
      window.history.replaceState(null, "", "/settings?tab=fbleads");
      load();
    } }),
    form && /* @__PURE__ */ jsxRuntimeExports.jsx(MappingDialog, { form, ov, onClose: () => setEditForm(null), onSaved: load })
  ] });
}
function StatusCard({ ov }) {
  const check = useServerFn(fblWebhookDiagnostic);
  const [diagnostic, setDiagnostic] = reactExports.useState(null);
  const [checking, setChecking] = reactExports.useState(false);
  const copy = (v) => {
    navigator.clipboard.writeText(v);
    toast.success("Đã sao chép");
  };
  const s = ov.stats;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Facebook, { className: "h-4 w-4" }),
      "Meta App Sứ Việt · ID ",
      ov.appId
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: ov.secrets.appSecret ? "secondary" : "destructive", children: [
        "App Secret: ",
        ov.secrets.appSecret ? "đã nhập" : "chưa nhập"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: ov.secrets.verifyToken ? "secondary" : "destructive", children: [
        "Verify Token: ",
        ov.secrets.verifyToken ? "đã nhập" : "chưa nhập"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: ov.state?.webhook_verified_at ? "secondary" : "outline", children: [
        "Webhook: ",
        ov.state?.webhook_verified_at ? `đã xác minh ${fmt(ov.state.webhook_verified_at)}` : "chưa xác minh"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        "Webhook POST gần nhất: ",
        fmt(ov.state?.last_webhook_at)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
        "Quét dự phòng gần nhất: ",
        fmt(ov.state?.last_maintain_at)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: checking, onClick: async () => {
      setChecking(true);
      try {
        setDiagnostic(await check());
      } catch (e) {
        toast.error(e.message);
      } finally {
        setChecking(false);
      }
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1" }),
      checking ? "Đang kiểm tra Meta…" : "Kiểm tra Webhook trên Meta"
    ] }),
    diagnostic && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm break-words", role: "status", children: [
      diagnostic.message,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-xs text-muted-foreground", children: [
        "Kiểm tra: ",
        fmt(diagnostic.checkedAt)
      ] })
    ] }),
    [["Callback URL (Webhook)", ov.webhookUrl], ["OAuth Redirect URI", ov.redirectUri]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground w-44", children: l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-2 py-1 rounded break-all", children: v }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => copy(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }) })
    ] }, l)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1", children: [
      ["Page đang kết nối", ov.pages.filter((p) => p.status === "connected").length],
      ["Form đang bật", ov.forms.filter((f) => f.enabled).length],
      ["Lead thành công", s.success ?? 0],
      ["Lead lỗi cần xử lý", (s.failed ?? 0) + (s.needs_action ?? 0)]
    ].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: v })
    ] }, l)) })
  ] }) });
}
function ConnectButton({ disabled, messaging = false }) {
  const connect = useServerFn(fblConnectUrl);
  const [busy, setBusy] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: disabled || busy, onClick: async () => {
    setBusy(true);
    try {
      const r = await connect({ data: { messaging } });
      window.location.href = r.url;
    } catch (e) {
      toast.error(e.message);
      setBusy(false);
    }
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 mr-1.5" }),
    "Kết nối Page Facebook"
  ] });
}
function PickPages({ state, onDone }) {
  const list = useServerFn(fblPendingPages);
  const connect = useServerFn(fblConnectPages);
  const [discovery, setDiscovery] = reactExports.useState(null);
  const [choices, setChoices] = reactExports.useState({});
  const [touched, setTouched] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  reactExports.useEffect(() => {
    let active = true;
    list({ data: { state } }).then((r) => {
      if (!active) return;
      setDiscovery(r);
      setChoices(Object.fromEntries(r.pages.map((p) => [p.id, { lead: p.selectedLead, messaging: p.selectedMessaging }])));
    }).catch((e) => {
      if (active) setError(e.message);
    });
    return () => {
      active = false;
    };
  }, [state, list]);
  const selected = Object.entries(choices).filter(([id2, c]) => c.lead || c.messaging || touched.includes(id2));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && !busy && onDone(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[85dvh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Kết nối Page · Chọn nội dung muốn nhận" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mỗi Page có thể nhận Lead, nhận tin nhắn hoặc cả hai. Form Lead vẫn có cấu hình riêng." }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: error }),
    !discovery && !error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", children: "Đang xác minh các Page với Meta…" }),
    discovery && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      !discovery.inboxAvailable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Hộp thư đang chờ kích hoạt dữ liệu. Kết nối Lead hiện tại vẫn sử dụng được." }),
      discovery.diagnostics.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground break-words", children: d }, i)),
      !discovery.pages.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Meta chưa trả về Page nào. Kiểm tra quyền quản lý Page hoặc kết nối lại." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: discovery.pages.map((p) => {
        const value = choices[p.id] ?? { lead: false, messaging: false };
        const change = (key, enabled) => {
          setChoices((old) => ({ ...old, [p.id]: { ...value, [key]: enabled } }));
          setTouched((old) => [.../* @__PURE__ */ new Set([...old, p.id])]);
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium break-words", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Page ID ",
              p.id
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "min-h-11 flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: value.lead, disabled: busy || !p.eligible && !value.lead, onCheckedChange: (v) => change("lead", v === true) }),
              "Nhận Lead"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "min-h-11 flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: value.messaging, disabled: busy || !discovery.inboxAvailable || !p.messaging?.eligible && !value.messaging, onCheckedChange: (v) => change("messaging", v === true) }),
              "Nhận tin nhắn"
            ] })
          ] }),
          !p.eligible && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Lead: ",
            p.message
          ] }),
          !p.messaging?.eligible && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Messenger: ",
            p.messaging?.message ?? "Chưa xác minh quyền nhắn tin"
          ] })
        ] }, p.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", disabled: busy, onClick: onDone, children: "Đóng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !selected.length || busy, onClick: async () => {
        setBusy(true);
        setError("");
        try {
          const result = await connect({ data: { state, pageIds: selected.map(([id2]) => id2), ...discovery?.inboxAvailable ? { choices: selected.map(([pageId, c]) => ({ pageId, ...c })) } : {} } });
          result.forEach((r) => (r.ok ? toast.success : toast.error)(`${r.name}: ${r.message}`));
          onDone();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Không lưu được kết nối");
        } finally {
          setBusy(false);
        }
      }, children: busy ? "Đang kết nối…" : "Lưu kết nối Page" })
    ] })
  ] }) });
}
function PageFeatureSwitches({ page, available, onChange }) {
  const save = useServerFn(fblPageFeatures);
  const [busy, setBusy] = reactExports.useState(false);
  const update = async (lead, messaging) => {
    setBusy(true);
    try {
      await save({ data: { pageId: page.page_id, lead, messaging } });
      toast.success("Đã lưu lựa chọn của Page");
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chưa lưu được lựa chọn");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 p-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-h-11 items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { disabled: busy || !available, checked: page.lead_enabled, onCheckedChange: (v) => update(v === true, page.messaging_enabled) }),
        "Nhận Lead"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-h-11 items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { disabled: busy || !available, checked: page.messaging_enabled, onCheckedChange: (v) => update(page.lead_enabled, v === true) }),
        "Nhận tin nhắn"
      ] })
    ] }),
    !available && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hộp thư đang chờ kích hoạt dữ liệu; Lead hiện tại được giữ nguyên." }),
    page.messaging_reason && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: page.messaging_reason }),
    page.messaging_enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Messenger: ",
      page.messaging_ready ? "Đã xác minh kết nối" : "Cần kiểm tra quyền hoặc kết nối lại"
    ] })
  ] });
}
function PageCard({ page, ov, onChange, onEdit }) {
  const act = useServerFn(fblPageAction);
  const save = useServerFn(fblSaveForm);
  const [busy, setBusy] = reactExports.useState("");
  const run = async (action, source) => {
    if (action === "disconnect" && !confirm(`Ngắt kết nối Page ${page.name}? Các Form của Page sẽ tắt đồng bộ, lịch sử được giữ.`)) return;
    setBusy(action);
    try {
      const r = await act({ data: { pageId: page.page_id, action, source } });
      (r.ok ? toast.success : toast.error)(r.message);
      onChange();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy("");
    }
  };
  const forms = ov.forms.filter((f) => f.page_id === page.page_id);
  const srcOpts = ov.catalogs.sources.includes(page.source) || !page.source ? ov.catalogs.sources : [page.source, ...ov.catalogs.sources];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: page.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Page ID ",
          page.page_id,
          " · kiểm tra ",
          fmt(page.checked_at)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: page.status === "connected" ? "secondary" : "destructive", children: page.status === "connected" ? "Đã kết nối" : "Lỗi kết nối" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: page.subscribed ? "secondary" : "outline", children: page.subscribed ? "Đã đăng ký nhận lead" : "Chưa đăng ký nhận lead" })
        ] }),
        page.status_detail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive mt-1", children: page.status_detail })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: !!busy, onClick: () => run("check"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1" }),
          "Kiểm tra"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MaintainButton, { onDone: onChange }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", disabled: !!busy, onClick: () => run("refresh"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-3.5 w-3.5 mr-1" }),
          "Làm mới danh sách Form"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: !!busy, onClick: () => run("disconnect"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Unlink, { className: "h-3.5 w-3.5 mr-1" }),
          "Ngắt"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageFeatureSwitches, { page, available: ov.inboxAvailable, onChange }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Nguồn tín hiệu:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: page.source ?? "__none", onValueChange: (v) => run("source", v === "__none" ? null : v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-64 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none", children: "— Chưa chọn —" }),
          srcOpts.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/settings?tab=sigcat", className: "text-xs underline text-muted-foreground", children: "Quản lý Kho nguồn" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y border rounded-md", children: [
      forms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-3 text-sm text-muted-foreground", children: "Chưa có Form — bấm “Làm mới danh sách Form”." }),
      forms.map((f) => {
        const errs = validateMapping(f.mapping, f.questions, ov.catalogs, page.source);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 flex items-center justify-between gap-2 flex-wrap text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: f.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              f.mapping ? errs.length ? "Cấu hình chưa hợp lệ" : "Đã cấu hình" : "Chưa cấu hình",
              " · ",
              f.enabled ? `Đang đồng bộ từ ${fmt(f.enabled_at)}` : "Tắt",
              f.meta_status && f.meta_status !== "ACTIVE" ? ` · Meta: ${f.meta_status === "ARCHIVED_OR_GONE" ? "không còn truy cập" : f.meta_status}` : ""
            ] }),
            f.needs_review && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-destructive", children: "Form đã thay đổi câu hỏi — cần kiểm tra lại cấu hình" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BackfillButton, { form: f }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => onEdit(f.form_id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-3.5 w-3.5 mr-1" }),
              "Cấu hình Form"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: f.enabled, disabled: !f.enabled && errs.length > 0, title: errs.join("; "), onCheckedChange: async (v) => {
              try {
                const r = await save({ data: { formId: f.form_id, enabled: v } });
                (r.ok ? toast.success : toast.error)(r.message);
                onChange();
              } catch (e) {
                toast.error(e.message);
              }
            } })
          ] })
        ] }, f.form_id);
      })
    ] })
  ] }) });
}
function MappingDialog({ form, ov, onClose, onSaved }) {
  const save = useServerFn(fblSaveForm);
  const questions = form.questions ?? [];
  const page = ov.pages.find((p) => p.page_id === form.page_id);
  const [m, setM] = reactExports.useState(form.mapping ?? {});
  const errs = reactExports.useMemo(() => validateMapping(m, questions, ov.catalogs, page?.source ?? null), [m]);
  const set = (k, r) => setM({ ...m, [k]: r });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      "Cấu hình Form — ",
      form.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Tự động: Ngày phát hiện (ngày lead, giờ Việt Nam) · Nguồn: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: page?.source ?? "chưa chọn" }),
      " · Sale phụ trách: chưa phân công."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: FIELDS.map((f) => {
      const r = m[f.key] ?? { mode: "empty" };
      const opts = f.catalog ? ov.catalogs[f.catalog] : [];
      const q = r.mode === "facebook" ? questions.find((x) => x.key === r.key) : void 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-sm w-44", children: [
            f.label,
            f.required && " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: r.mode, onValueChange: (v) => set(f.key, v === "facebook" ? { mode: "facebook", key: questions[0]?.key ?? "" } : v === "default" ? { mode: "default", value: f.kind === "multi" ? [] : "" } : { mode: "empty" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "facebook", children: "Lấy từ Facebook" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "default", children: "Giá trị mặc định" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "empty", children: "Để trống" })
            ] })
          ] }),
          r.mode === "facebook" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: r.key, onValueChange: (v) => set(f.key, { mode: "facebook", key: v }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-64 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Chọn câu hỏi" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: questions.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: x.key, children: [
              x.label,
              " (",
              x.key,
              ")"
            ] }, x.key)) })
          ] })
        ] }),
        r.mode === "default" && (f.kind === "multi" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3", children: opts.map((o) => {
          const vals = r.value ?? [];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: vals.includes(o), onCheckedChange: (c) => set(f.key, { mode: "default", value: c ? [...vals, o] : vals.filter((x) => x !== o) }) }),
            o
          ] }, o);
        }) }) : f.max > 500 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: r.value, onChange: (e) => set(f.key, { mode: "default", value: e.target.value }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.value, onChange: (e) => set(f.key, { mode: "default", value: e.target.value }) })),
        r.mode === "facebook" && f.catalog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ánh xạ đáp án Facebook sang danh mục Base (đáp án trùng tên danh mục tự khớp; đáp án không khớp sẽ bỏ qua)." }),
          (q?.options ?? []).map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-56 truncate", children: o.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: r.valueMap?.[o.value] ?? "__auto", onValueChange: (v) => {
              const vm = { ...r.valueMap ?? {} };
              if (v === "__auto") delete vm[o.value];
              else vm[o.value] = v;
              set(f.key, { ...r, valueMap: vm });
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-56 h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__auto", children: "Tự khớp theo tên" }),
                opts.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: x }, x))
              ] })
            ] })
          ] }, o.value)),
          q && !(q.options ?? []).length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Câu hỏi tự do: chỉ giữ câu trả lời trùng đúng tên trong danh mục." })
        ] })
      ] }, f.key);
    }) }),
    errs.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs text-destructive list-disc pl-5", children: errs.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: e }, e)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-emerald-600", children: "Cấu hình hợp lệ — có thể bật đồng bộ." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Đóng" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        const n = suggestMapping(m, questions);
        const c = Object.keys(n).filter((k) => n[k] !== m[k]).length;
        setM(n);
        toast(c ? `Đã gợi ý ${c} trường — kiểm tra trước khi lưu` : "Không có gợi ý mới");
      }, children: "Gợi ý tự động" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: async () => {
        try {
          const r = await save({ data: { formId: form.form_id, mapping: m } });
          (r.ok ? toast.success : toast.error)(r.message);
          onSaved();
          onClose();
        } catch (e) {
          toast.error(e.message);
        }
      }, children: "Lưu cấu hình" })
    ] })
  ] }) });
}
function History({ ov }) {
  const list = useServerFn(fblEvents);
  const retry = useServerFn(fblRetry);
  const [f, setF] = reactExports.useState({ pageId: "", formId: "", status: "", from: "", to: "" });
  const [rows, setRows] = reactExports.useState(null);
  const load = () => list({ data: { pageId: f.pageId || void 0, formId: f.formId || void 0, status: f.status || void 0, from: f.from ? (/* @__PURE__ */ new Date(f.from + "T00:00:00+07:00")).toISOString() : void 0, to: f.to ? (/* @__PURE__ */ new Date(f.to + "T23:59:59+07:00")).toISOString() : void 0 } }).then(setRows).catch((e) => toast.error(e.message));
  reactExports.useEffect(() => {
    load();
  }, [f]);
  useVisibleRefresh(load);
  const pageName = (id2) => ov.pages.find((p) => p.page_id === id2)?.name ?? id2;
  const formName = (id2) => ov.forms.find((x) => x.form_id === id2)?.name ?? id2 ?? "—";
  const sel = (k, v) => setF({ ...f, [k]: v === "__all" ? "" : v });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.pageId || "__all", onValueChange: (v) => sel("pageId", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all", children: "Tất cả Page" }),
          ov.pages.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.page_id, children: p.name }, p.page_id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.formId || "__all", onValueChange: (v) => sel("formId", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all", children: "Tất cả Form" }),
          ov.forms.filter((x) => !f.pageId || x.page_id === f.pageId).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x.form_id, children: x.name }, x.form_id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.status || "__all", onValueChange: (v) => sel("status", v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40 h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all", children: "Tất cả trạng thái" }),
          Object.entries(STATUS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-40 h-9", value: f.from, onChange: (e) => setF({ ...f, from: e.target.value }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "w-40 h-9", value: f.to, onChange: (e) => setF({ ...f, to: e.target.value }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-3", children: "Ba thời điểm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Phương thức nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Độ trễ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Page" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Form" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Nguồn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Tín hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pr-3", children: "Nguyên nhân" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y", children: [
        (rows ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3 whitespace-nowrap text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Meta tạo: ",
              fmt(r.lead_created_at)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Base nhận: ",
              fmt(r.received_at)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Tạo tín hiệu: ",
              fmt(r.signal_created_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3 whitespace-nowrap text-xs", children: METHOD[r.receipt_method] ?? METHOD.legacy_unknown }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pr-3 whitespace-nowrap text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Nhận Webhook: ",
              duration(eventLatency(r).webhookSeconds)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Xử lý: ",
              duration(eventLatency(r).processingSeconds)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3", children: pageName(r.page_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3", children: formName(r.form_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "success" ? "secondary" : r.status === "failed" || r.status === "needs_action" ? "destructive" : "outline", children: STATUS[r.status] ?? r.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3", children: r.source ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3", children: r.signal_id ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signals", className: "underline", children: "Mở tín hiệu" }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-3 text-xs text-muted-foreground max-w-xs", children: r.error ?? "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: ["failed", "needs_action", "pending"].includes(r.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: async () => {
            try {
              const x = await retry({ data: { id: r.id } });
              toast.message(`Kết quả: ${STATUS[x.status] ?? x.status}`);
              load();
            } catch (e) {
              toast.error(e.message);
            }
          }, children: "Thử đồng bộ lại" }) })
        ] }, r.id)),
        rows && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, className: "py-8 text-center text-muted-foreground", children: "Chưa có sự kiện." }) })
      ] })
    ] }) })
  ] }) });
}
function MaintainButton({ onDone }) {
  const run = useServerFn(fblMaintainNow);
  const [busy, setBusy] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, title: "Quét Form mới, thử lại lead lỗi đến hạn, đối chiếu 48 giờ gần nhất", onClick: async () => {
    setBusy(true);
    try {
      const r = await run();
      toast.success(`Kiểm tra xong: ${r.newForms} Form mới · thử lại ${r.retried} · bổ sung ${r.recovered} lead`);
      if (r.errors.length) toast.error(r.errors.slice(0, 3).join("; "));
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }, children: busy ? "Đang kiểm tra…" : "Kiểm tra ngay" });
}
function BackfillButton({ form }) {
  const run = useServerFn(fblBackfill);
  const today = new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
  const [open, setOpen] = reactExports.useState(false);
  const [from, setFrom] = reactExports.useState(today);
  const [to, setTo] = reactExports.useState(today);
  const [preview, setPreview] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const range = () => ({ formId: form.form_id, from: (/* @__PURE__ */ new Date(from + "T00:00:00+07:00")).toISOString(), to: (/* @__PURE__ */ new Date(to + "T23:59:59+07:00")).toISOString() });
  const go = async (apply) => {
    setBusy(true);
    try {
      const r = await run({ data: { ...range(), apply } });
      if (apply) {
        toast.success(`Đồng bộ bù xong: tạo ${r.created} tín hiệu${r.failed ? ` · ${r.failed} lead cần xử lý (xem Lịch sử)` : ""}`);
        setOpen(false);
        setPreview(null);
      } else setPreview(r);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: !form.mapping, title: form.mapping ? "" : "Cần cấu hình Form trước", onClick: () => setOpen(true), children: "Đồng bộ bù" }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setPreview(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Đồng bộ bù — ",
        form.name
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Lấy lại các lead trong khoảng ngày (giờ Việt Nam, tối đa 90 ngày) chưa có trong Base. Lead đã có sẽ không bị tạo trùng." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => {
          setFrom(e.target.value);
          setPreview(null);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "→" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => {
          setTo(e.target.value);
          setPreview(null);
        } })
      ] }),
      preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm border rounded-md p-3", children: [
        "Tìm thấy ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: preview.total }),
        " lead · đã có ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: preview.existing }),
        " · sẽ tạo mới tối đa ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: Math.min(preview.missing, 300) }),
        " tín hiệu",
        preview.missing > 300 ? " (lần này 300, chạy lại để tiếp tục)" : "",
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => {
          setOpen(false);
          setPreview(null);
        }, children: "Hủy" }),
        !preview ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, onClick: () => go(false), children: busy ? "Đang kiểm tra…" : "Xem trước" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy || preview.missing === 0, onClick: () => go(true), children: busy ? "Đang đồng bộ…" : `Xác nhận tạo ${Math.min(preview.missing, 300)} tín hiệu` })
      ] })
    ] }) })
  ] });
}
const FbLeadsSettings$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ConnectButton,
  FbLeadsSettings,
  PageFeatureSwitches,
  PickPages
}, Symbol.toStringTag, { value: "Module" }));
export {
  FbLeadsSettings as F,
  FbLeadsSettings$1 as a,
  useVisibleRefresh as u
};
