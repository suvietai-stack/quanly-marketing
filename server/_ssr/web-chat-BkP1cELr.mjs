import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, B as Button, I as Input, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, c as createSsrRpc } from "./router-CkmTURa-.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { s as settingsSchema } from "./model-B_rsOxUC.mjs";
import "../_libs/seroval.mjs";
import { o as objectType, s as stringType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
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
import "./auth-errors-CN_iHaBn.mjs";
import "./branding-Bpuupoin.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "./navigation-BcdDdvEu.mjs";
import "../_libs/lucide-react.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
const chatOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ee75ed25866f6199664756a7b2dda7ca8277034b6ea6741604c2f818badf379e"));
const chatSaveSite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(150),
  domain: stringType().trim().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/),
  source: stringType().min(1).max(200),
  enabled: booleanType(),
  settings: settingsSchema
}).parse(v)).handler(createSsrRpc("1e3417caefaba9ee5e6e4f307982ad98cab530e1586988ce3e116ea7a04a1064"));
const chatRotateKey = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid()
}).parse(v)).handler(createSsrRpc("e68df4c2e93e0538e8766aef46f554039e59cb2f62b520bb8cebe6e556c91ace"));
const chatAccess = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  user: stringType().uuid().optional(),
  enabled: booleanType().optional()
}).parse(v)).handler(createSsrRpc("be840c6545bf12606064a9864263d17959e106da3249c6965920a558b53c22fb"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  before: stringType().datetime().optional()
}).parse(v)).handler(createSsrRpc("f2e7036af4d84b075f6716556e8f2c61e0eabfb815addffd6413b27aca0facc9"));
const chatThreadsFeed = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid().optional()
}).parse(v)).handler(createSsrRpc("8eb7f1b144331d3855ecc2551e3b84e8e5409f0f4543d586d083fd16b58b9342"));
const chatLocate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  id: stringType().uuid()
}).parse(v)).handler(createSsrRpc("17bfdffe40cedefe0ad429ae903ee7cd69d0e3ad80f99498390ca7ab41b73078"));
const chatThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  id: stringType().uuid()
}).parse(v)).handler(createSsrRpc("ab0531e7959561f631bb6f407f866610cf4f6378a64d8af8e21339c67ce1efda"));
const chatControl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((v) => objectType({
  site: stringType().uuid(),
  id: stringType().uuid(),
  action: enumType(["takeover", "resume", "send", "read"]),
  request: stringType().uuid(),
  text: stringType().trim().max(2e3).default("")
}).parse(v)).handler(createSsrRpc("64054c2f8a017f40740cd3693aa04575e5df7e6079232eb4626b1ab0acf0d820"));
const labels = { ai: "AI tiếp nhận", human: "Sale can thiệp", captured: "Đã chuyển tín hiệu" };
const presenceLabels = { chat: "Đang chat", website: "Đang xem website", offline: "Đã rời" };
const defaults = () => ({ name: "", domain: "", source: "", enabled: false, settings: settingsSchema.parse({}) });
function WebChatWorkspace() {
  const { user } = useCurrentUser();
  const uid = user?.id;
  const qc = useQueryClient();
  const [site, setSite] = reactExports.useState(""), [selected, setSelected] = reactExports.useState(""), [siteFilter, setSiteFilter] = reactExports.useState("all"), [filter, setFilter] = reactExports.useState("all"), [presenceFilter, setPresenceFilter] = reactExports.useState("all"), [search, setSearch] = reactExports.useState("");
  const [view, setView] = reactExports.useState("overview"), [adminTab, setAdminTab] = reactExports.useState("sites"), [accessBusy, setAccessBusy] = reactExports.useState("");
  const [config, setConfig] = reactExports.useState(null), [key, setKey] = reactExports.useState(""), [keySite, setKeySite] = reactExports.useState(""), [busy, setBusy] = reactExports.useState(false), [text, setText] = reactExports.useState(""), [accessSite, setAccessSite] = reactExports.useState("");
  const overview = useQuery({ queryKey: ["wc", uid, "overview"], queryFn: () => chatOverview(), enabled: !!uid, retry: 1 });
  const sites = overview.data?.sites ?? [];
  reactExports.useEffect(() => {
    if (!uid) return;
    const id = new URLSearchParams(window.location.search).get("conversation");
    if (!id) return;
    let live = true;
    void chatLocate({ data: { id } }).then((r) => {
      if (live) {
        setSite(r.site);
        setSelected(id);
      }
    }).catch(() => toast.error("Không có quyền mở cuộc chat này"));
    return () => {
      live = false;
    };
  }, [uid]);
  const list = useQuery({ queryKey: ["wc", uid, "feed", siteFilter], queryFn: () => chatThreadsFeed({ data: siteFilter === "all" ? {} : { site: siteFilter } }), enabled: !!uid && !!overview.data?.installed && sites.length > 0, retry: 1, refetchInterval: 1e4, refetchIntervalInBackground: false });
  const thread = useQuery({ queryKey: ["wc", uid, "thread", site, selected], queryFn: () => chatThread({ data: { site, id: selected } }), enabled: !!uid && !!site && !!selected, retry: 1, refetchInterval: 5e3, refetchIntervalInBackground: false });
  const staff = useQuery({ queryKey: ["wc", uid, "access", accessSite], queryFn: () => chatAccess({ data: { site: accessSite } }), enabled: !!accessSite && !!overview.data?.canManage, retry: 1 });
  const reload = () => qc.invalidateQueries({ queryKey: ["wc", uid] });
  async function control(action) {
    if (busy) return;
    setBusy(true);
    try {
      await chatControl({ data: { site, id: selected, action, request: crypto.randomUUID(), text } });
      if (action === "send") setText("");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không cập nhật được");
    } finally {
      setBusy(false);
    }
  }
  reactExports.useEffect(() => {
    if (selected && site) void chatControl({ data: { site, id: selected, action: "read", request: crypto.randomUUID() } }).catch(() => {
    });
  }, [selected, site]);
  const rows = list.data ?? [];
  const shown = rows.filter((c2) => (filter === "all" || c2.mode === filter) && (presenceFilter === "all" || (presenceFilter === "active" ? c2.presence === "chat" || c2.presence === "website" : c2.presence === presenceFilter)) && ((c2.summary || "") + " " + JSON.stringify(c2.contact || {})).toLowerCase().includes(search.trim().toLowerCase()));
  const c = thread.data;
  const siteName = (id) => sites.find((s) => s.id === id)?.name || "Website";
  async function save() {
    setBusy(true);
    try {
      const data = { ...config, settings: { ...config.settings, starters: config.settings.starters.map((x) => x.trim()).filter(Boolean).slice(0, 6) } };
      const r = await chatSaveSite({ data });
      setConfig(null);
      if (r.key) {
        setKey(r.key);
        setKeySite(r.id);
      }
      await reload();
      toast.success("Đã lưu");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không lưu được");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `wc-workspace min-w-0 ${selected && view === "overview" ? "wc-thread-open" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "wc-page-head", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-page-heading", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-eyebrow", children: "TRUNG TÂM TƯ VẤN WEBSITE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Tư vấn Website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đốm AI tiếp nhận nhu cầu · Sale theo dõi và hỗ trợ khách" })
      ] }),
      overview.data?.canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "wc-head-action", variant: "outline", onClick: () => {
        setView(view === "overview" ? "manage" : "overview");
        setSelected("");
        setSite("");
      }, children: view === "overview" ? "Quản trị website" : "← Về hội thoại" })
    ] }),
    (overview.error || overview.data?.installed === false) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "rounded-lg border p-4 text-sm text-destructive", children: overview.error instanceof Error ? overview.error.message : "Chat Web chưa được kích hoạt dữ liệu. Cần áp dụng migration phiên bản này." }),
    view === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "wc-overview-controls", "aria-label": "Tổng hợp và bộ lọc", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-overview-filter", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-filter-label", htmlFor: "wc-site-filter", children: [
            "Theo dõi website",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "wc-site-filter", value: siteFilter, onChange: (e) => {
              setSiteFilter(e.target.value);
              setSelected("");
              setSite("");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Tất cả website" }),
              sites.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.name }, s.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "wc-filter-summary", children: [
            siteFilter === "all" ? `${sites.length} website được theo dõi` : siteName(siteFilter),
            " · Tự cập nhật"
          ] })
        ] }),
        !sites.length && !overview.isPending && !overview.error && overview.data?.installed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border p-8 text-center text-sm", children: overview.data.canManage ? "Chưa có website. Vào Quản trị website để thêm và cấu hình." : "Anh chị chưa được cấp website. Nhờ quản trị viên thêm quyền Chat Web." }),
        !!sites.length && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wc-stats", "aria-label": "Thống kê hội thoại gần đây", children: [
            { key: "all", label: "Hội thoại", value: rows.length, kind: "all" },
            { key: "active", label: "Đang online", value: rows.filter((r) => r.presence === "chat" || r.presence === "website").length, kind: "presence" },
            { key: "chat", label: "Đang chat", value: rows.filter((r) => r.presence === "chat").length, kind: "presence" }
          ].map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `wc-stat wc-stat-${stat.key}`, "aria-pressed": stat.kind === "all" ? filter === "all" && presenceFilter === "all" : filter === "all" && presenceFilter === stat.key, onClick: () => {
            setFilter("all");
            setPresenceFilter(stat.kind === "all" ? "all" : stat.key);
            setSelected("");
            setSite("");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stat.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: stat.label })
          ] }, stat.key)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-queue-toolbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wc-queue-filters", role: "group", "aria-label": "Lọc theo người phụ trách", children: [
              { key: "all", label: "Tất cả", value: rows.length },
              { key: "ai", label: "Đốm AI", value: rows.filter((r) => r.mode === "ai").length },
              { key: "captured", label: "Đã có tín hiệu", value: rows.filter((r) => r.mode === "captured").length },
              { key: "human", label: "Sale can thiệp", value: rows.filter((r) => r.mode === "human").length }
            ].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", "aria-pressed": filter === m.key, onClick: () => {
              setFilter(m.key);
              setSelected("");
              setSite("");
            }, children: [
              m.label,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m.value })
            ] }, m.key)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-search-tools", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "wc-search", "aria-label": "Tìm hội thoại", placeholder: "Tên, SĐT hoặc nhu cầu…", value: search, onChange: (e) => setSearch(e.target.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { "aria-label": "Tình trạng khách trực tuyến", value: presenceFilter, onChange: (e) => {
                setPresenceFilter(e.target.value);
                setSelected("");
                setSite("");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Mọi khách" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "active", children: "Đang online" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "chat", children: "Đang chat" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "website", children: "Đang xem web" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "offline", children: "Đã rời" })
              ] }),
              (search || filter !== "all" || presenceFilter !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "wc-clear", onClick: () => {
                setSearch("");
                setFilter("all");
                setPresenceFilter("all");
              }, children: "Xóa lọc" })
            ] })
          ] })
        ] })
      ] }),
      !!sites.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-columns", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `wc-list ${selected ? "wc-mobile-list-hidden" : ""}`, "aria-label": "Danh sách hội thoại", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-section-heading", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cuộc trò chuyện" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              shown.length,
              " hiển thị"
            ] })
          ] }),
          list.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "wc-list-note text-destructive", children: [
            "Không tải được hội thoại. ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "underline", onClick: () => list.refetch(), children: "Thử lại" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-conversation-list", children: [
            shown.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", "aria-current": selected === r.id, onClick: () => {
              setSite(r.site_id);
              setSelected(r.id);
            }, className: "wc-contact", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-contact-main", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-contact-avatar", "aria-hidden": "true", children: (r.contact?.name || "K").slice(0, 1).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "wc-contact-body", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "wc-contact-first", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.contact?.name || r.contact?.phone || "Khách website" }),
                    (!r.read_at || r.read_at < r.updated_at) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-unread", "aria-label": "Tin chưa đọc" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-contact-preview", children: r.summary || "Khách đang trao đổi nhu cầu" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "wc-contact-tags", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-site-tag", children: siteName(r.site_id) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `wc-presence wc-presence-${r.presence || "offline"}`, children: presenceLabels[r.presence] || "Đã rời" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `wc-mode wc-mode-${r.mode}`, children: r.mode === "human" ? "Sale" : r.mode === "captured" ? "Đã chuyển" : "AI" })
                  ] })
                ] })
              ] }),
              r.error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-warning", children: "AI cần kiểm tra" })
            ] }, r.id)),
            !shown.length && !list.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "wc-list-note", children: "Không có hội thoại phù hợp với bộ lọc." }),
            list.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "wc-list-note", children: "Đang tải hội thoại…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "wc-list-footnote", children: "100 hội thoại gần nhất · Cập nhật khi mở trang" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: `wc-thread ${!selected ? "wc-mobile-thread-hidden" : ""}`, "aria-label": "Chi tiết hội thoại", children: !selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-empty", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "✦" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Chọn một cuộc trò chuyện" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Quan sát Đốm AI tư vấn, xem nhu cầu hoặc tiếp nhận để phản hồi khách ngay." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-thread-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "wc-back", variant: "ghost", onClick: () => {
              setSelected("");
              setSite("");
            }, children: "← Hội thoại" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-thread-identity", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: c?.contact?.name || c?.contact?.phone || "Khách website" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-thread-labels", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-site-tag", children: siteName(site) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `wc-presence wc-presence-${c?.presence || "offline"}`, children: c ? presenceLabels[c.presence] || "Đã rời" : "Đang tải…" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `wc-mode wc-mode-${c?.mode}`, children: labels[c?.mode] || "Đang tải…" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "wc-takeover", variant: "outline", disabled: busy || !c, onClick: () => control(c?.mode === "human" ? "resume" : "takeover"), children: c?.mode === "human" ? "Bật lại AI" : "Can thiệp chat" })
          ] }),
          thread.error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "wc-list-note text-destructive", children: "Không tải được nội dung cuộc trò chuyện." }),
          !!c && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "wc-thread-info", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Thông tin khách và nhu cầu" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-info-hint", children: c.contact?.phone ? "Đã có SĐT" : "Xem chi tiết" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-info-body", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Nhu cầu:" }),
                " ",
                c.summary || "Chưa ghi nhận"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SĐT:" }),
                " ",
                c.contact?.phone || "Chưa có",
                " · ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Zalo:" }),
                " ",
                c.contact?.zalo === "confirmed" ? "Khách xác nhận" : "Chưa xác nhận"
              ] }),
              c.page_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "underline break-all", href: c.page_url, target: "_blank", rel: "noreferrer", children: "Trang khách đang xem" }),
              c.signal_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Đã chuyển tín hiệu · Đốm AI · Mã ",
                c.signal_id
              ] }),
              c.presence === "offline" && c.last_seen_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Hoạt động cuối: ",
                new Date(c.last_seen_at).toLocaleString("vi-VN")
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-messages", children: [
            thread.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "wc-list-note", children: "Đang tải tin nhắn…" }),
            c?.messages?.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `wc-bubble wc-bubble-${m.role}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "wc-bubble-meta", children: [
                m.role === "user" ? "Khách" : m.role === "staff" ? "Nhân viên" : "Đốm AI",
                " · ",
                new Date(m.created_at).toLocaleString("vi-VN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words", children: m.body }),
              m.state === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-destructive", children: "AI chưa xử lý được tin này." })
            ] }, m.id))
          ] }),
          c?.mode === "human" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "wc-compose", onSubmit: (e) => {
            e.preventDefault();
            void control("send");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": "Trả lời khách", maxLength: 2e3, value: text, onChange: (e) => setText(e.target.value), placeholder: c.taken_by === c.userId ? "Nhập lời nhắn cho khách…" : "Nhân viên khác đang can thiệp", disabled: c.taken_by !== c.userId }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy || !text.trim() || c.taken_by !== c.userId, children: "Gửi" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wc-ai-notice", children: "Đốm AI đang phụ trách · Bấm “Can thiệp chat” để trả lời khách." })
        ] }) })
      ] })
    ] }) : overview.data?.canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "wc-admin rounded-xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-top", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Quản trị website" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Thêm website, cài đặt AI và cấp quyền nhân viên tại một nơi." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setConfig(defaults()), children: "Thêm website" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-tabs", role: "group", "aria-label": "Quản trị website", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-pressed": adminTab === "sites", onClick: () => setAdminTab("sites"), children: "Danh sách website" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-pressed": adminTab === "permissions", onClick: () => setAdminTab("permissions"), children: "Phân quyền nhân viên" })
      ] }),
      adminTab === "sites" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        sites.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Chưa có website. Chọn “Thêm website” để bắt đầu." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wc-admin-sites", children: sites.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-site", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-name", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `wc-site-status ${s.enabled ? "wc-on" : "wc-off"}`, children: s.enabled ? "Đang bật" : "Đang tắt" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-admin-field-label", children: "Tên miền" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-all", children: s.domain })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-meta", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "wc-admin-field-label", children: "Nguồn tín hiệu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.source })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-actions", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfig({ ...s, settings: settingsSchema.parse(s.settings) }), children: "Cài đặt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
              setAdminTab("permissions");
              setAccessSite(s.id);
            }, children: "Phân quyền" })
          ] })
        ] }, s.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-admin-footer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/downloads/suviet-base-chat.zip", download: true, className: "underline underline-offset-4", children: "Tải plugin WordPress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cài plugin ở WordPress → Cài đặt → Base Chat, sau đó nhập ID và mã kết nối." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-permissions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-filter-label", htmlFor: "wc-access-site", children: [
          "Chọn website để phân quyền",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "wc-access-site", value: accessSite, onChange: (e) => setAccessSite(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Chọn website" }),
            sites.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.name }, s.id))
          ] })
        ] }),
        !accessSite ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-sm text-muted-foreground", children: "Chọn một website để xem và tích nhân viên được theo dõi." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Nhân viên được tích chọn có quyền ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "xem hội thoại và can thiệp chat" }),
            " của website này. Quản trị tích hợp có quyền quản lý toàn bộ website."
          ] }),
          staff.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-3 text-sm", children: "Đang tải danh sách nhân viên…" }),
          staff.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { role: "alert", className: "text-sm text-destructive", children: [
            "Không đọc được quyền nhân viên. ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "underline", onClick: () => staff.refetch(), children: "Thử lại" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wc-permission-list", children: staff.data?.staff.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-permission-item", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", disabled: !!accessBusy, checked: staff.data.allowed.includes(p.id), onChange: async (e) => {
              if (accessBusy) return;
              setAccessBusy(p.id);
              try {
                await chatAccess({ data: { site: accessSite, user: p.id, enabled: e.target.checked } });
                await staff.refetch();
              } catch {
                toast.error("Không cập nhật được quyền");
              } finally {
                setAccessBusy("");
              }
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.full_name })
          ] }, p.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!config, onOpenChange: (v) => !v && setConfig(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "wc-settings sm:max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: config?.id ? "Cài đặt website" : "Thêm website" }) }),
      config && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "wc-settings-form", onSubmit: (e) => {
        e.preventDefault();
        void save();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "wc-settings-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Website & kết nối" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-settings-fields", children: [
            ["name", "domain"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-settings-field", children: [
              k === "name" ? "Tên website" : "Tên miền (không có https://)",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: config[k], onChange: (e) => setConfig({ ...config, [k]: e.target.value }) })
            ] }, k)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-settings-field", children: [
              "Nguồn tín hiệu",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, className: "w-full rounded-md border bg-background p-2", value: config.source, onChange: (e) => setConfig({ ...config, source: e.target.value }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Chọn trong Kho nguồn" }),
                overview.data?.sources.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: s }, s))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-switch", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: config.enabled, onChange: (e) => setConfig({ ...config, enabled: e.target.checked }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Bật Chat Web" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: "Khách có thể trò chuyện và gửi nhu cầu về Base" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "wc-settings-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { children: [
            "Giao diện và lời chào ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nhân vật, màu sắc, hình ảnh" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-settings-fields", children: [
            Object.entries({ character: "Tên nhân vật", greeting: "Lời chào", invitation: "Câu mời trên bong bóng", color: "Màu giao diện (#RRGGBB)", avatar: "URL ảnh đại diện HTTPS" }).map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-settings-field", children: [
              label,
              k === "greeting" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: config.settings[k], onChange: (e) => setConfig({ ...config, settings: { ...config.settings, [k]: e.target.value } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: config.settings[k], onChange: (e) => setConfig({ ...config, settings: { ...config.settings, [k]: e.target.value } }) })
            ] }, k)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-settings-field", children: [
              "Câu hỏi bấm nhanh (mỗi dòng một câu, tối đa 6)",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: config.settings.starters.join("\n"), onChange: (e) => setConfig({ ...config, settings: { ...config.settings, starters: e.target.value.split("\n") } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-switch", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: config.settings.showGreeting, onChange: (e) => setConfig({ ...config, settings: { ...config.settings, showGreeting: e.target.checked } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hiện lời chào bên ngoài biểu tượng chat" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-settings-field", children: [
              "Hiện sau bao nhiêu giây (3–60)",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 3, max: 60, value: config.settings.greetingDelay, onChange: (e) => setConfig({ ...config, settings: { ...config.settings, greetingDelay: Number(e.target.value) } }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-settings-field", children: [
              "Tải ảnh đại diện PNG/JPG/WebP (dưới 70 KB)",
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "wc-file-input", type: "file", accept: "image/png,image/jpeg,image/webp", onChange: (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 7e4 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                  toast.error("Chọn PNG/JPG/WebP dưới 70 KB");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setConfig((current) => current ? { ...current, settings: { ...current.settings, avatar: String(reader.result) } } : current);
                reader.readAsDataURL(file);
              } })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "wc-settings-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { children: [
            "Hướng dẫn Đốm AI ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Văn phong, mục tiêu và kiến thức" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-settings-fields", children: [
            Object.entries({ tone: "Văn phong, xưng hô", goals: "Mục tiêu tiếp nhận nhu cầu", knowledge: "Kiến thức được phép tư vấn", closing: "Lời nhắn sau khi chuyển tín hiệu" }).map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "wc-settings-field", children: [
              label,
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: k === "knowledge" ? 6 : 3, value: config.settings[k], onChange: (e) => setConfig({ ...config, settings: { ...config.settings, [k]: e.target.value } }) })
            ] }, k)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chỉ nhập kiến thức công khai, được phép trả lời khách. Đốm AI không đọc dữ liệu nội bộ Base." })
          ] })
        ] }),
        config.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "wc-settings-group wc-settings-key", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { children: [
            "Mã kết nối WordPress ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Chỉ đổi khi cần thiết" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "wc-settings-fields", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "break-all text-xs", children: [
              "ID website: ",
              config.id
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", disabled: busy, onClick: async () => {
              setBusy(true);
              try {
                const r = await chatRotateKey({ data: { site: config.id } });
                setKey(r.key);
                setKeySite(config.id);
                setConfig(null);
              } catch {
                toast.error("Không cấp được mã");
              } finally {
                setBusy(false);
              }
            }, children: "Cấp mã mới (mã cũ sẽ hết hiệu lực)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "wc-settings-save", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: busy, type: "submit", children: busy ? "Đang lưu…" : "Lưu cấu hình" }) })
      ] })
    ] }) }),
    "  ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!key, onOpenChange: (v) => !v && setKey(""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Kết nối plugin WordPress" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Tải, cài và kích hoạt plugin. Vào WordPress → Cài đặt → Base Chat, nhập hai giá trị rồi bật chat." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
        "ID website",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: keySite })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
        "Mã kết nối — chỉ hiện lần này",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: key })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Không chèn mã vào JavaScript hoặc bài viết. Mất mã: cấp mã mới trong cài đặt website." })
    ] }) })
  ] });
}
const SplitComponent = WebChatWorkspace;
export {
  SplitComponent as component
};
