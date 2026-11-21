import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, c as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, a as useServerFn, B as Button, j as cn, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, c as createSsrRpc } from "./router-CkmTURa-.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { safeAttachmentUrl } from "./model-JxC_wwt9.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { S as Skeleton } from "./skeleton-DaUJxWW7.mjs";
import "../_libs/seroval.mjs";
import { aI as MessageCircle, aC as RefreshCw, aj as Settings2, aL as Wifi, aM as WifiOff, aq as Inbox, A as ArrowLeft, ar as CircleCheck, aN as Info, ad as Send, a8 as UserRound, a7 as ShieldCheck, d as CheckCheck, q as Check } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, e as enumType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
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
const page = stringType().regex(/^\d{1,40}$/);
const inboxOverview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("92fe34a4eeb5154d8eacd2a74c4ea47cd2a42ba89a2246ab7f8a950f15813de5"));
const inboxRead = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  kind: enumType(["list", "thread", "staff"]),
  pageId: page.optional(),
  conversationId: stringType().uuid().optional(),
  filter: enumType(["all", "unread", "reply", "resolved"]).default("all"),
  before: stringType().datetime().optional(),
  beforeId: stringType().uuid().optional()
}).parse(d)).handler(createSsrRpc("f516f56a666c34695e0bc440b7cd8c573e0c087f5526d574ec10e8a85be015e6"));
const inboxChange = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  conversationId: stringType().uuid(),
  action: enumType(["read", "assign", "resolve", "reopen"]),
  userId: stringType().uuid().nullable().optional(),
  version: numberType().int().positive().optional()
}).parse(d)).handler(createSsrRpc("929887aff1d5968d9366740b4512a36216d8e8e941124c10e2e5881da8ce6b89"));
const inboxAccessSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  pageId: page,
  userId: stringType().uuid(),
  enabled: booleanType()
}).parse(d)).handler(createSsrRpc("5fb18e233e158f8adeabcf0ac2ac94e81daa50889ac496906724f09ef482320b"));
const inboxSend = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  conversationId: stringType().uuid(),
  requestId: stringType().uuid(),
  text: stringType().trim().min(1).max(2e3)
}).parse(d)).handler(createSsrRpc("a0af737182f5ae592286b064ad942f1d5dfc8c2f512d324c9ace1bbe077706b7"));
const ConnectButton = reactExports.lazy(() => import("./FbLeadsSettings-DZvlXC_v.mjs").then((n) => n.a).then((m) => ({ default: m.ConnectButton })));
const FbLeadsSettings = reactExports.lazy(() => import("./FbLeadsSettings-DZvlXC_v.mjs").then((n) => n.a).then((m) => ({ default: m.FbLeadsSettings })));
const date = (s) => new Date(s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
const initials = (name) => name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toLocaleUpperCase("vi");
const stateLabel = { received: "Đã nhận", sending: "Đang gửi", accepted: "Meta đã nhận", delivered: "Đã giao", read: "Đã xem", failed: "Gửi thất bại", unknown: "Chưa xác định kết quả gửi" };
function InboxWorkspace() {
  const { user } = useCurrentUser();
  if (!user || user.status !== "Đang hoạt động") return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", children: "Vui lòng đăng nhập bằng tài khoản đang hoạt động." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Workspace, { userId: user.id }, user.id);
}
function Workspace({ userId }) {
  const { can, isSuperAdmin } = useCurrentUser();
  const qc = useQueryClient();
  const overview = useServerFn(inboxOverview), read = useServerFn(inboxRead), change = useServerFn(inboxChange), send = useServerFn(inboxSend), accessSave = useServerFn(inboxAccessSave);
  const [pageId, setPageId] = reactExports.useState("all");
  const [filter, setFilter] = reactExports.useState("all");
  const [selected, setSelected] = reactExports.useState(null);
  const [details, setDetails] = reactExports.useState(false);
  const [connections, setConnections] = reactExports.useState(false);
  const [managePage, setManagePage] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [pending, setPending] = reactExports.useState(null);
  const [live, setLive] = reactExports.useState("connecting");
  const listRef = reactExports.useRef(null);
  const active = true;
  const canConnect = isSuperAdmin || can("integration.facebook_leads");
  const baseKey = reactExports.useMemo(() => ["inbox", userId], [userId]);
  const ov = useQuery({ queryKey: [...baseKey, "overview"], queryFn: () => overview(), retry: false, staleTime: 3e4, refetchInterval: 3e4, refetchIntervalInBackground: false });
  const available = !!ov.data?.available && !!ov.data?.can_view;
  const reload = () => qc.invalidateQueries({ queryKey: baseKey });
  const list = useInfiniteQuery({
    queryKey: [...baseKey, "list", pageId, filter],
    initialPageParam: void 0,
    queryFn: async ({ pageParam }) => await read({ data: { kind: "list", pageId: pageId === "all" ? void 0 : pageId, filter, ...pageParam } }),
    getNextPageParam: (rows) => rows.length === 50 ? { before: rows[rows.length - 1].last_at, beforeId: rows[rows.length - 1].id } : void 0,
    enabled: available,
    retry: false,
    refetchInterval: available ? 3e4 : false,
    refetchIntervalInBackground: false
  });
  const thread = useInfiniteQuery({
    queryKey: [...baseKey, "thread", selected],
    initialPageParam: void 0,
    queryFn: async ({ pageParam }) => await read({ data: { kind: "thread", conversationId: selected, ...pageParam } }),
    getNextPageParam: (data) => data.messages.length === 50 ? { before: data.messages[0].event_at, beforeId: data.messages[0].id } : void 0,
    enabled: available && !!selected,
    retry: false,
    refetchInterval: selected && available ? 3e4 : false,
    refetchIntervalInBackground: false
  });
  const current = thread.data?.pages[0];
  const messages = [...new Map((thread.data?.pages ?? []).flatMap((p) => p.messages).map((m) => [m.id, m])).values()].sort((a, b) => a.event_at.localeCompare(b.event_at) || a.id.localeCompare(b.id));
  const conversations = [...new Map((list.data?.pages ?? []).flat().map((c) => [c.id, c])).values()];
  const staffPage = managePage ?? current?.conversation.page_id;
  const staff = useQuery({ queryKey: [...baseKey, "staff", staffPage], queryFn: async () => await read({ data: { kind: "staff", pageId: staffPage } }), enabled: !!staffPage && (!!managePage || !!current?.can_assign), retry: false });
  reactExports.useEffect(() => {
    if (!available) return;
    let timer;
    let mounted = true;
    const update = () => {
      if (!timer) timer = setTimeout(() => {
        timer = void 0;
        if (mounted) void qc.invalidateQueries({ queryKey: baseKey });
      }, 200);
    };
    const channel = supabase.channel(`inbox:${userId}:${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "inbox_conversations", ...pageId !== "all" ? { filter: `page_id=eq.${pageId}` } : {} }, update).on("postgres_changes", { event: "*", schema: "public", table: "inbox_page_access", filter: `user_id=eq.${userId}` }, update);
    channel.on("postgres_changes", { event: "*", schema: "public", table: "inbox_page_capabilities", ...pageId !== "all" ? { filter: `page_id=eq.${pageId}` } : {} }, update);
    if (selected) channel.on("postgres_changes", { event: "*", schema: "public", table: "inbox_messages", filter: `conversation_id=eq.${selected}` }, update);
    setLive("connecting");
    channel.subscribe((status) => {
      if (!mounted) return;
      setLive(status === "SUBSCRIBED" ? "live" : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED" ? "offline" : "connecting");
      if (status === "SUBSCRIBED") update();
    });
    const wake = () => {
      if (document.visibilityState === "visible") update();
    };
    window.addEventListener("online", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", wake);
      document.removeEventListener("visibilitychange", wake);
      void supabase.removeChannel(channel);
    };
  }, [active, available, userId, pageId, selected, qc, baseKey]);
  reactExports.useEffect(() => {
    if (ov.data && !ov.data.can_view) {
      setSelected(null);
      setManagePage(null);
    }
  }, [ov.data]);
  const lastIncoming = current?.conversation.last_incoming_at;
  const threadReady = !!current;
  const lastMessageId = messages.at(-1)?.id;
  reactExports.useEffect(() => {
    if (!selected || !threadReady || thread.isError || !active) return;
    let live2 = true;
    change({ data: { conversationId: selected, action: "read" } }).then(() => {
      if (live2) void qc.invalidateQueries({ queryKey: [...baseKey, "list"] });
    }).catch(() => {
    });
    return () => {
      live2 = false;
    };
  }, [selected, lastIncoming, threadReady, active, thread.isError, change, qc, baseKey]);
  reactExports.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [selected, lastMessageId]);
  const select = (id) => {
    setSelected(id);
    setDetails(false);
    setDraft("");
  };
  const mutate = async (action, user) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      await change({ data: { conversationId: current.conversation.id, action, userId: user || null, version: current.conversation.version } });
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chưa cập nhật được");
    } finally {
      setBusy(false);
    }
  };
  const sendNow = async (existing = false) => {
    if (!current || busy) return;
    const request = existing ? pending : { requestId: crypto.randomUUID(), conversationId: current.conversation.id, text: draft.trim() };
    if (!request || !request.text) return;
    setPending(request);
    setBusy(true);
    try {
      const result = await send({ data: request });
      if (["accepted", "delivered", "read"].includes(result.state)) {
        setPending(null);
        setDraft("");
      } else if (result.state === "failed") {
        setPending(null);
        toast.error("Meta từ chối gửi. Kiểm tra kết nối Page và cửa sổ trả lời.");
      } else toast.info("Chưa xác định kết quả gửi. Không gửi lại nội dung; hãy kiểm tra hội thoại.");
      await reload();
    } catch {
      toast.error("Chưa xác định yêu cầu đã được xử lý hay chưa. Bấm kiểm tra kết quả; hệ thống không tự gửi lại.");
    } finally {
      setBusy(false);
    }
  };
  reactExports.useEffect(() => {
    if (!pending) return;
    const confirmed = messages.find((m) => m.request_id === pending.requestId && ["accepted", "delivered", "read"].includes(m.state));
    if (confirmed) {
      setPending(null);
      setDraft((old) => old.trim() === pending.text ? "" : old);
    }
  }, [pending, messages]);
  const pageName = (id) => ov.data?.pages.find((p) => p.page_id === id)?.name ?? "Facebook Page";
  const page2 = current ? ov.data?.pages.find((p) => p.page_id === current.conversation.page_id) : void 0;
  const pageReady = !!page2?.ready && !!page2.checked_at && Date.now() - Date.parse(page2.checked_at) < 864e5;
  const expired = current && (!current.window_open || Date.now() - thread.dataUpdatedAt + Date.parse(current.server_now) - Date.parse(current.conversation.last_incoming_at ?? "") >= 864e5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 w-full space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-primary/10 p-2.5 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-2xl font-semibold", children: "Messenger Fanpage" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Các Page cùng một nơi, mỗi cuộc trò chuyện đều có người theo sát." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", "aria-label": "Làm mới Messenger Fanpage", onClick: () => void reload(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("size-4", ov.isFetching && "animate-spin") }) }),
        canConnect && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setConnections(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "mr-2 size-4" }),
            "Quản lý Page"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: true, children: "Kết nối Page" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectButton, { disabled: ov.isPending || ov.isError, messaging: ov.data?.available ?? false }) })
        ] })
      ] })
    ] }),
    ov.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-busy": "true", className: "grid gap-4 sm:grid-cols-[300px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96" })
    ] }) : ov.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBox, { message: "Chưa tải được Hộp thư. Kiểm tra kết nối và thử lại.", onRetry: () => void ov.refetch() }) : !ov.data?.available ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: "setup", title: "Hộp thư đang chờ kích hoạt", text: "Khu vực Hộp thư đã sẵn sàng về giao diện. Phần dữ liệu và quyền truy cập cần được kích hoạt trước khi nhận tin nhắn thật." }) : !ov.data.can_view ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: "setup", title: "Chưa có quyền Hộp thư", text: "Nhờ quản trị cấp quyền Hộp thư và phân các Page anh/chị phụ trách." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          live === "live" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "size-3.5 text-emerald-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "size-3.5" }),
          live === "live" ? "Đang nhận cập nhật trực tiếp" : live === "connecting" ? "Đang kết nối cập nhật trực tiếp…" : "Kết nối trực tiếp gián đoạn · đang đối chiếu định kỳ"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          ov.data.pages.length,
          " Page được cấp quyền"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_260px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: cn("min-w-0 border-r", selected && "hidden lg:block"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-b p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", htmlFor: "inbox-page", children: "Page phụ trách" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "inbox-page", className: "h-11 w-full rounded-lg border bg-background px-3 text-sm", value: pageId, onChange: (e) => {
              setPageId(e.target.value);
              setSelected(null);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Tất cả Page" }),
              ov.data.pages.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.page_id, children: [
                p.name,
                !p.enabled ? " · Đang tắt" : !p.ready ? " · Cần kết nối lại" : ""
              ] }, p.page_id))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: [["all", "Đang mở"], ["unread", "Chưa đọc"], ["reply", "Cần trả lời"], ["resolved", "Đã đóng"]].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-9 px-2.5 text-xs", variant: filter === key ? "secondary" : "ghost", "aria-pressed": filter === key, onClick: () => {
              setFilter(key);
              setSelected(null);
            }, children: label }, key)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[360px] max-h-[65dvh] overflow-y-auto lg:h-[580px]", children: [
            list.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "p-5 text-sm text-muted-foreground", children: "Đang tải hội thoại…" }) : list.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBox, { message: "Không đọc được danh sách hội thoại.", onRetry: () => void list.refetch() }) : !conversations.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "mx-auto size-9 text-muted-foreground/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium", children: "Chưa có hội thoại phù hợp" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs leading-5 text-muted-foreground", children: "Tin nhắn mới của Page đã bật nhận sẽ xuất hiện tại đây." })
            ] }) : conversations.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => select(c.id), className: cn("flex w-full gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50", selected === c.id && "bg-primary/5"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary", children: initials(c.customer_name ?? "Khách hàng") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("truncate text-sm", c.unread ? "font-bold" : "font-medium"), children: c.customer_name ?? `Khách ${c.customer_id.slice(-6)}` }),
                  c.unread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 shrink-0 rounded-full bg-primary", "aria-label": "Chưa đọc" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block truncate text-xs text-primary/80", children: pageName(c.page_id) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 block truncate text-sm text-muted-foreground", children: c.last_text || "Tệp đính kèm / tin nhắn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-2 flex items-center justify-between text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: date(c.last_at) }),
                  c.needs_reply && !c.resolved && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300", children: "Cần trả lời" })
                ] })
              ] })
            ] }, c.id)),
            list.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "m-3", variant: "outline", disabled: list.isFetchingNextPage, onClick: () => void list.fetchNextPage(), children: "Tải thêm hội thoại" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: cn("min-w-0 flex flex-col", !selected && "hidden lg:flex"), children: !selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { icon: "chat", title: "Chọn một cuộc trò chuyện", text: "Tin nhắn và thông tin khách sẽ hiển thị ở đây. Chọn Page hoặc lọc các cuộc trò chuyện cần trả lời ở cột bên trái." }) : thread.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96" }) }) : thread.isError || !current ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBox, { message: "Không đọc được hội thoại hoặc quyền truy cập đã thay đổi.", onRetry: () => void thread.refetch() }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b p-3 sm:p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "lg:hidden shrink-0", variant: "ghost", size: "icon", "aria-label": "Quay lại danh sách", onClick: () => setSelected(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-semibold text-sm", children: current.conversation.customer_name ?? `Khách ${current.conversation.customer_id.slice(-6)}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: pageName(current.conversation.page_id) })
            ] }),
            current.can_resolve && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: busy, onClick: () => void mutate(current.conversation.resolved ? "reopen" : "resolve"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-1.5 size-4" }),
              current.conversation.resolved ? "Mở lại" : "Đóng"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Thông tin khách hàng", onClick: () => setDetails(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "size-4" }) })
          ] }),
          thread.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", disabled: thread.isFetchingNextPage, onClick: () => void thread.fetchNextPage(), children: "Xem tin nhắn trước" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: listRef, className: "flex h-[48dvh] min-h-[260px] flex-col gap-4 overflow-y-auto bg-muted/15 p-4 lg:h-[440px]", "aria-label": "Nội dung hội thoại", children: [
            messages.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Message, { message: m }, m.id)),
            !messages.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "m-auto text-sm text-muted-foreground", children: "Hội thoại chưa có nội dung tin nhắn." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t p-3 sm:p-4 space-y-2", children: [
            (!current.can_send || expired || !page2?.enabled || !pageReady) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-5 text-muted-foreground", children: !current.can_send ? "Anh/chị chưa được cấp quyền trả lời Page này." : !page2?.enabled ? "Page đang tắt nhận tin nhắn." : !pageReady ? "Page cần kiểm tra quyền hoặc kết nối lại." : "Đã ngoài cửa sổ trả lời 24 giờ. Khách cần nhắn lại trước khi trả lời." }),
            pending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5", children: [
              "Có một yêu cầu gửi đang chờ xác nhận. Không gửi lại nội dung để tránh trùng.",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "link", disabled: busy, onClick: () => void sendNow(true), children: "Kiểm tra kết quả" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": "Nội dung trả lời", placeholder: "Nhập lời nhắn cho khách…", value: draft, maxLength: 2e3, disabled: busy || !!pending || !current.can_send || !!expired || !page2?.enabled || !pageReady, onChange: (e) => setDraft(e.target.value), className: "min-h-20 resize-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { "aria-label": "Gửi tin nhắn", className: "h-11 w-11 shrink-0", disabled: !draft.trim() || busy || !!pending || !current.can_send || !!expired || !page2?.enabled || !pageReady, onClick: () => void sendNow(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
              draft.length,
              "/2000 · Tin nhắn được gửi dưới tên Page."
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden xl:block border-l p-5", children: [
          current && !thread.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerDetails, { conversation: current.conversation, pageName: pageName(current.conversation.page_id), staff: staff.data, canAssign: current.can_assign, busy, onAssign: (id) => void mutate("assign", id) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-12 text-center text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "mx-auto mb-3 size-8 opacity-30" }),
            "Thông tin khách hàng"
          ] }),
          ov.data.can_manage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Quyền truy cập Page" }),
            ov.data.pages.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "h-auto min-h-11 w-full justify-start text-left whitespace-normal", onClick: () => setManagePage(p.page_id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "mr-2 size-4 shrink-0" }),
              p.name
            ] }, p.page_id))
          ] })
        ] })
      ] }),
      ov.data.can_manage && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "xl:hidden", onClick: () => setManagePage(pageId === "all" ? ov.data.pages[0]?.page_id ?? null : pageId), disabled: !ov.data.pages.length, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mr-2 size-4" }),
        "Phân quyền Page"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: connections, onOpenChange: setConnections, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[88dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Page Facebook dùng chung" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FbLeadsSettings, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: details, onOpenChange: setDetails, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Thông tin hội thoại" }) }),
      current && !thread.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerDetails, { conversation: current.conversation, pageName: pageName(current.conversation.page_id), staff: staff.data, canAssign: current.can_assign, busy, onAssign: (id) => void mutate("assign", id) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!managePage, onOpenChange: (open) => !open && setManagePage(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md max-h-[85dvh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Quyền truy cập · ",
        pageName(managePage ?? "")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nhân sự cần cả quyền Hộp thư trong Role và quyền truy cập Page này." }),
      staff.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Đang tải nhân sự…" }) : staff.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBox, { message: "Không đọc được nhân sự Page.", onRetry: () => void staff.refetch() }) : staff.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-b py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: s.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: s.access ? "secondary" : "outline", disabled: busy, onClick: async () => {
          if (!managePage) return;
          setBusy(true);
          try {
            await accessSave({ data: { pageId: managePage, userId: s.id, enabled: !s.access } });
            await reload();
          } catch {
            toast.error("Không cập nhật được quyền Page");
          } finally {
            setBusy(false);
          }
        }, children: s.access ? "Thu hồi" : "Cấp quyền" })
      ] }, s.id))
    ] }) })
  ] });
}
function Message({ message: m }) {
  const outgoing = m.direction === "out";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-col max-w-[88%] sm:max-w-[80%]", outgoing ? "self-end items-end" : "self-start items-start"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-2xl p-3 text-sm leading-6", outgoing ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border bg-card"), children: [
      m.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words [overflow-wrap:anywhere]", children: m.text }),
      m.attachments.map((a, i) => {
        const url = safeAttachmentUrl(a.url);
        if (!url) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs italic", children: "Tệp đính kèm không hỗ trợ hoặc liên kết đã hết hạn." }, i);
        return a.type === "image" ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: "Ảnh khách gửi", className: "max-h-64 max-w-full rounded-lg", loading: "lazy", referrerPolicy: "no-referrer" }) }, i) : /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "block underline break-all", href: url, target: "_blank", rel: "noopener noreferrer", children: [
          "Mở tệp ",
          a.type
        ] }, i);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("mt-1 flex items-center gap-1 text-[10px] text-muted-foreground", m.state === "failed" && "text-destructive"), children: [
      date(m.event_at),
      outgoing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " · ",
        m.state === "read" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "size-3" }) : m.state === "accepted" || m.state === "delivered" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }) : null,
        stateLabel[m.state] ?? m.state
      ] })
    ] }),
    m.failure && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-destructive", children: m.failure })
  ] });
}
function CustomerDetails({ conversation: c, pageName, staff, canAssign, busy, onAssign }) {
  const selectId = reactExports.useId();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary", children: initials(c.customer_name ?? "Khách hàng") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 font-semibold", children: c.customer_name ?? `Khách ${c.customer_id.slice(-6)}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: pageName })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Trạng thái" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.resolved ? "Đã đóng" : "Đang mở" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground break-all", children: [
        "Mã khách theo Page: ",
        c.customer_id
      ] }),
      c.last_incoming_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Khách nhắn gần nhất: ",
        date(c.last_incoming_at)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: selectId, className: "text-xs font-medium text-muted-foreground", children: "Người phụ trách" }),
      canAssign ? /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: selectId, className: "mt-2 h-11 w-full rounded-lg border bg-background px-2 text-sm", value: c.assignee_id ?? "", disabled: busy || !staff, onChange: (e) => onAssign(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Chưa phân công" }),
        staff?.filter((s) => s.access).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.name }, s.id))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm", children: staff?.find((s) => s.id === c.assignee_id)?.name ?? (c.assignee_id ? "Đã phân công" : "Chưa phân công") })
    ] })
  ] });
}
function Empty({ title, text, icon }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-2xl border-dashed p-7 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-primary/5 p-5 text-primary/50", children: icon === "setup" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-12" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-12" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-sm text-sm leading-6 text-muted-foreground", children: text })
  ] });
}
function ErrorBox({ message, onRetry }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-3 p-5 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onRetry, children: "Thử lại" })
  ] });
}
const SplitComponent = InboxWorkspace;
export {
  SplitComponent as component
};
