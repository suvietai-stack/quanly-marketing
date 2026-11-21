import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { u as useCurrentUser, B as Button, I as Input, $ as markChatRead, a2 as validateChatAttachment, a3 as openDirectChat, a4 as createChatGroup, a5 as downloadChatAttachment, a6 as recallChatMessage, a7 as deleteChatAttachment, a8 as sendChatMessage, a0 as chatMessages, a1 as chatParticipants, Z as CHAT_REFRESH_MS, _ as chatInbox } from "./router-CkmTURa-.mjs";
import { l as listCommunityMemberNames } from "./api-DcMIOSaq.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import "../_libs/seroval.mjs";
import { a6 as Plus, f as Search, o as MessagesSquare, a7 as ShieldCheck, X, a8 as UserRound, w as Users, q as Check, a9 as LoaderCircle, A as ArrowLeft, aa as HeartHandshake, n as ChevronDown, d as CheckCheck, ab as RotateCcw, ac as Paperclip, ad as Send, ae as Image, F as FileText, af as Download } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
function errorText(e) {
  return e instanceof Error ? e.message : "Không kết nối được, hãy thử lại.";
}
function initials(s) {
  return s.trim().split(/\s+/).slice(-2).map((p) => p.charAt(0).toUpperCase()).join("") || "SV";
}
function when(s) {
  if (!s) return "";
  return new Date(s).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}
function ChatAvatar({ name, group = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": "true", className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100 text-sm font-bold text-blue-800 dark:from-slate-700 dark:to-teal-900 dark:text-blue-100", children: group ? /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }) : initials(name) });
}
function ChatAttachment({ msg }) {
  const [url, setUrl] = reactExports.useState("");
  const element = reactExports.useRef(null);
  const [visible, setVisible] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(false);
  const path = msg.attachment_path;
  const image = !!msg.attachment_mime?.startsWith("image/");
  reactExports.useEffect(() => {
    if (!image) return;
    const node = element.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [image, path]);
  reactExports.useEffect(() => {
    if (!path || !image || !visible) return;
    let cancelled = false;
    let created = "";
    setError(false);
    void downloadChatAttachment(path).then((blob) => {
      if (cancelled) return;
      created = URL.createObjectURL(blob);
      setUrl(created);
    }).catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
      setUrl("");
    };
  }, [path, image, visible]);
  if (!path) return null;
  const download = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const blob = await downloadChatAttachment(path);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = msg.attachment_name || "tep-noi-bo";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3e4);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: element, className: "mt-2 max-w-full rounded-xl border border-blue-100 bg-white/90 p-2 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white", children: [
    image && (url ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void download(), className: "block max-w-full", "aria-label": "Tải ảnh đính kèm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: msg.attachment_name || "Ảnh nội bộ", className: "max-h-60 max-w-full rounded-lg object-contain" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-20 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground", children: error ? "Không tải được ảnh" : "Đang tải ảnh…" })),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void download(), disabled: loading, className: "mt-1 flex min-h-10 max-w-full items-center gap-2 rounded-lg px-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-700", children: [
      image ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 shrink-0 text-blue-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 break-all", children: msg.attachment_name || "Tệp đính kèm" }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 shrink-0 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 shrink-0" })
    ] })
  ] });
}
function ChatCreate({ me, people, close, openThread }) {
  const [group, setGroup] = reactExports.useState(false);
  const [filter, setFilter] = reactExports.useState("");
  const [chosen, setChosen] = reactExports.useState([]);
  const [title, setTitle] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const filtered = people.filter((p) => p.id !== me && p.full_name.toLocaleLowerCase("vi").includes(filter.toLocaleLowerCase("vi"))).slice(0, 100);
  const openOne = async (id) => {
    if (busy) return;
    setBusy(true);
    try {
      const thread = await openDirectChat(id);
      openThread(thread);
      close();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  const openGroup = async () => {
    if (busy) return;
    if (chosen.length < 2) {
      toast.error("Hãy chọn ít nhất 2 đồng nghiệp để tạo nhóm.");
      return;
    }
    setBusy(true);
    try {
      const thread = await createChatGroup(title, chosen);
      openThread(thread);
      close();
      toast.success("Đã tạo nhóm chat.");
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-2xl border bg-card p-3 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: group ? "Tạo nhóm chat" : "Nhắn tin cho đồng nghiệp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "h-9 w-9", onClick: close, "aria-label": "Đóng", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: group ? "outline" : "default", className: "min-h-10 rounded-xl", onClick: () => setGroup(false), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4" }),
        "Cá nhân"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: group ? "default" : "outline", className: "min-h-10 rounded-xl", onClick: () => setGroup(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
        "Nhóm chat"
      ] })
    ] }),
    group && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, maxLength: 80, onChange: (e) => setTitle(e.target.value), placeholder: "Tên nhóm, ví dụ: Team Marketing", className: "min-h-11 text-base" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: filter, onChange: (e) => setFilter(e.target.value), className: "min-h-11 pl-9 text-base", placeholder: "Tìm tên đồng nghiệp…" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-56 space-y-1 overflow-y-auto", children: [
      filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", disabled: busy, onClick: () => {
        if (!group) {
          void openOne(p.id);
          return;
        }
        setChosen((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]);
      }, className: "flex min-h-12 w-full items-center gap-2.5 rounded-xl px-2 text-left hover:bg-muted", children: [
        group ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: `flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${chosen.includes(p.id) ? "border-blue-600 bg-blue-600 text-white" : "border-muted-foreground/30"}`, children: chosen.includes(p.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChatAvatar, { name: p.full_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-sm", children: p.full_name })
      ] }, p.id)),
      !filtered.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-center text-xs text-muted-foreground", children: "Không có đồng nghiệp phù hợp." })
    ] }),
    group && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "min-h-11 w-full rounded-xl", disabled: busy || chosen.length < 2 || title.trim().length < 2, onClick: () => void openGroup(), children: [
      busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " Tạo nhóm với ",
      chosen.length + 1,
      " thành viên"
    ] })
  ] });
}
function ChatConversation({ thread, me, names, onBack, onSent, compact = false }) {
  const client = useQueryClient();
  const [body, setBody] = reactExports.useState("");
  const [visibleLimit, setVisibleLimit] = reactExports.useState(60);
  const [attachment, setAttachment] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const fileInput = reactExports.useRef(null);
  const scrollBottom = reactExports.useRef(null);
  const nameOf = (id) => names.get(id) || "Thành viên Sứ Việt";
  const label = thread.kind === "group" ? thread.title || "Nhóm chat" : nameOf(thread.member_ids.find((x) => x !== me) || "");
  const messages = useQuery({
    queryKey: ["chat", "messages", me, thread.thread_id, visibleLimit],
    queryFn: () => chatMessages(thread.thread_id, visibleLimit),
    staleTime: 3e3,
    refetchInterval: 9e3,
    refetchOnWindowFocus: true,
    retry: 1
  });
  const participants = useQuery({
    queryKey: ["chat", "participants", me, thread.thread_id],
    queryFn: () => chatParticipants(thread.thread_id),
    staleTime: 1e4,
    refetchInterval: 15e3,
    retry: 1
  });
  reactExports.useEffect(() => {
    const channel = supabase.channel("sv-chat-thread-" + thread.thread_id).on("postgres_changes", { event: "*", schema: "public", table: "sv_chat_messages", filter: `thread_id=eq.${thread.thread_id}` }, () => {
      void client.invalidateQueries({ queryKey: ["chat", "messages", me, thread.thread_id] });
      void client.invalidateQueries({ queryKey: ["chat", "inbox", me] });
      void client.invalidateQueries({ queryKey: ["chat", "unread", me] });
    }).subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [thread.thread_id, me, client]);
  const lastReceived = messages.data?.filter((msg) => msg.sender_id !== me && !msg.recalled_at).at(-1);
  reactExports.useEffect(() => {
    if (!lastReceived || document.visibilityState !== "visible") return;
    const own = participants.data?.find((p) => p.user_id === me);
    if (!own || new Date(own.last_read_at).getTime() >= new Date(lastReceived.created_at).getTime()) return;
    void markChatRead(thread.thread_id).then(() => {
      void client.invalidateQueries({ queryKey: ["chat", "inbox", me] });
      void client.invalidateQueries({ queryKey: ["chat", "unread", me] });
      void client.invalidateQueries({ queryKey: ["chat", "participants", me, thread.thread_id] });
    }).catch(() => {
    });
  }, [thread.thread_id, lastReceived?.id, lastReceived?.created_at, participants.data, me, client]);
  reactExports.useEffect(() => {
    scrollBottom.current?.scrollIntoView({ block: "end", behavior: "instant" });
  }, [thread.thread_id, messages.data?.at(-1)?.id]);
  const send = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await sendChatMessage(thread.thread_id, me, body, attachment ?? void 0);
      setBody("");
      setAttachment(null);
      if (fileInput.current) fileInput.current.value = "";
      await Promise.all([
        client.invalidateQueries({ queryKey: ["chat", "messages", me, thread.thread_id] }),
        client.invalidateQueries({ queryKey: ["chat", "inbox", me] })
      ]);
      onSent();
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  const recall = async (msg) => {
    if (!window.confirm("Thu hồi tin nhắn này với mọi người?")) return;
    try {
      if (!await recallChatMessage(msg.id)) throw new Error("Không thể thu hồi tin nhắn.");
      if (msg.attachment_path) await deleteChatAttachment(msg.attachment_path).catch(() => {
      });
      await client.invalidateQueries({ queryKey: ["chat", "messages", me, thread.thread_id] });
      await client.invalidateQueries({ queryKey: ["chat", "inbox", me] });
    } catch (err) {
      toast.error(errorText(err));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `flex ${compact ? "h-[min(74dvh,700px)]" : "h-[calc(100dvh-var(--mobile-header-height,64px)-var(--mobile-nav-height,72px)-200px)] md:h-[min(78dvh,780px)]"} min-h-[285px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card ${compact ? "" : "md:min-h-[480px]"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex min-h-16 items-center gap-2 border-b bg-card px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: `h-11 w-10 shrink-0 ${compact ? "" : "md:hidden"}`, onClick: onBack, "aria-label": "Quay lại danh sách chat", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChatAvatar, { name: label, group: thread.kind === "group" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-sm font-bold", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: thread.kind === "group" ? `${thread.member_ids.length} thành viên` : "Nhắn tin riêng tư · Nội bộ Base" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 shrink-0 text-emerald-600", "aria-label": "Chỉ thành viên hội thoại" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-slate-50 to-sky-50/50 px-3 py-4 dark:from-slate-950 dark:to-slate-900", role: "log", "aria-label": "Tin nhắn", children: [
      messages.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", role: "status", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto h-14 w-3/5 animate-pulse rounded-xl bg-blue-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-2/3 animate-pulse rounded-xl bg-muted" })
      ] }),
      messages.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => void messages.refetch(), children: "Chưa tải được tin nhắn · Thử lại" }),
      messages.isSuccess && messages.data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xs py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "mx-auto h-9 w-9 text-sky-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-semibold", children: "Bắt đầu cuộc trò chuyện" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Lời chào đầu tiên có thể bắt đầu sự hợp tác tuyệt vời." })
      ] }),
      (messages.data?.length ?? 0) >= visibleLimit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "mx-auto flex min-h-9 rounded-xl text-xs", onClick: () => setVisibleLimit((n) => n + 60), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 rotate-180" }),
        "Xem tin nhắn cũ"
      ] }),
      messages.data?.map((msg) => {
        const mine = msg.sender_id === me;
        const readers = participants.data?.filter((p) => p.user_id !== me && new Date(p.last_read_at).getTime() >= new Date(msg.created_at).getTime()).length || 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${mine ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[88%] space-y-1 sm:max-w-[78%] ${mine ? "items-end" : "items-start"}`, children: [
          !mine && thread.kind === "group" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[10px] text-muted-foreground", children: nameOf(msg.sender_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl px-3 py-2 shadow-sm ${mine ? "rounded-br-md bg-blue-700 text-white" : "rounded-bl-md border bg-white text-foreground dark:bg-slate-800"}`, children: [
            msg.recalled_at ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs italic opacity-75", children: "Tin nhắn đã được thu hồi" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              msg.body && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words text-[13px] leading-6", children: msg.body }),
              msg.attachment_path && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatAttachment, { msg })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-blue-100" : "text-muted-foreground"}`, children: [
              when(msg.created_at),
              mine && readers > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3 w-3", "aria-label": `${readers} người đã xem` })
            ] })
          ] }),
          mine && !msg.recalled_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "mr-1 flex min-h-7 items-center gap-1 text-[10px] text-muted-foreground hover:text-primary", onClick: () => void recall(msg), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3" }),
            "Thu hồi"
          ] })
        ] }) }, msg.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollBottom })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => void send(e), className: "shrink-0 space-y-2 border-t bg-card px-3 py-3", children: [
      attachment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs text-blue-900 dark:bg-blue-950 dark:text-blue-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate", children: attachment.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Bỏ tệp", onClick: () => setAttachment(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            className: "hidden",
            ref: fileInput,
            accept: "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.pptx,.txt",
            "aria-label": "Chọn tệp đính kèm",
            onChange: (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                validateChatAttachment(f);
                setAttachment(f);
              } catch (err) {
                toast.error(errorText(err));
              }
              if (fileInput.current) fileInput.current.value = "";
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "outline", className: "h-11 w-11 shrink-0 rounded-xl", "aria-label": "Đính kèm tệp", onClick: () => fileInput.current?.click(), disabled: busy, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 1, maxLength: 4e3, placeholder: "Nhắn tin trong Base…", className: "max-h-28 min-h-11 flex-1 resize-none rounded-xl text-base", value: body, onChange: (e) => setBody(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey && window.innerWidth >= 768) {
            e.preventDefault();
            void send(e);
          }
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "h-11 w-11 shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800", disabled: busy || !body.trim() && !attachment, "aria-label": "Gửi tin nhắn", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-5 w-5" }) })
      ] })
    ] })
  ] });
}
function ChatPanel({ initialThreadId, onThreadChange, compact = false }) {
  const { user } = useCurrentUser();
  const uid = user?.id || "";
  const active = !!uid && user?.status === "Đang hoạt động";
  const [threadId, setThreadId] = reactExports.useState(initialThreadId);
  const [newOpen, setNewOpen] = reactExports.useState(false);
  const [filter, setFilter] = reactExports.useState("");
  const client = useQueryClient();
  reactExports.useEffect(() => {
    setThreadId(initialThreadId);
  }, [initialThreadId]);
  const members = useQuery({
    queryKey: ["community", "names", uid],
    queryFn: listCommunityMemberNames,
    staleTime: 5 * 6e4,
    enabled: active,
    retry: 1
  });
  const names = reactExports.useMemo(() => new Map((members.data ?? []).map((p) => [p.id, p.full_name])), [members.data]);
  const inbox = useQuery({
    queryKey: ["chat", "inbox", uid],
    queryFn: chatInbox,
    enabled: active,
    staleTime: 5e3,
    refetchInterval: CHAT_REFRESH_MS,
    retry: 1
  });
  reactExports.useEffect(() => {
    if (!active) return;
    const channel = supabase.channel("sv-chat-inbox-" + uid).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "sv_chat_threads"
    }, () => {
      void client.invalidateQueries({ queryKey: ["chat", "inbox", uid] });
      void client.invalidateQueries({ queryKey: ["chat", "unread", uid] });
    }).subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid, active, client]);
  const nameOf = (id) => names.get(id) || "Thành viên Sứ Việt";
  const titleOf = (t) => t.kind === "group" ? t.title || "Nhóm chat" : nameOf(t.member_ids.find((x) => x !== uid) || "");
  const choose = (id) => {
    setThreadId(id);
    setNewOpen(false);
    onThreadChange?.(id);
    if (id) void markChatRead(id).then(() => {
      void client.invalidateQueries({ queryKey: ["chat", "inbox", uid] });
      void client.invalidateQueries({ queryKey: ["chat", "unread", uid] });
    }).catch(() => {
    });
  };
  const threads = inbox.data ?? [];
  const selected = threads.find((x) => x.thread_id === threadId);
  const filtered = threads.filter((t) => titleOf(t).toLocaleLowerCase("vi").includes(filter.toLocaleLowerCase("vi")));
  if (!active) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "rounded-xl border bg-card p-6 text-sm text-muted-foreground", children: "Chat chỉ dành cho nhân viên Base đang hoạt động." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid min-w-0 grid-cols-1 gap-3 ${compact ? "" : "md:grid-cols-[minmax(240px,310px)_minmax(0,1fr)]"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: `${selected ? compact ? "hidden" : "hidden md:flex" : "flex"} min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-3 shadow-sm`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Tin nhắn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Trao đổi riêng trong Sứ Việt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", "aria-label": "Tạo cuộc trò chuyện", title: "Nhắn tin mới", className: "h-11 w-11 rounded-xl bg-blue-700 hover:bg-blue-800", onClick: () => setNewOpen((v) => !v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }) })
      ] }),
      newOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChatCreate, { me: uid, people: members.data ?? [], close: () => setNewOpen(false), openThread: (id) => {
        choose(id);
        void inbox.refetch();
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "min-h-11 pl-9 text-base", value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "Tìm cuộc trò chuyện…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[min(65dvh,640px)] space-y-1 overflow-y-auto", children: [
          inbox.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 animate-pulse rounded-xl bg-muted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 animate-pulse rounded-xl bg-muted" })
          ] }),
          inbox.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => void inbox.refetch(), children: "Không tải được Chat · Thử lại" }),
          inbox.isSuccess && filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesSquare, { className: "mx-auto h-8 w-8 text-sky-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium", children: filter ? "Không có cuộc trò chuyện phù hợp." : "Chưa có cuộc trò chuyện nào." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: filter ? "Hãy thử tìm tên khác." : "Bấm + để nhắn tin với đồng nghiệp." })
          ] }),
          filtered.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => choose(t.thread_id),
              className: `flex min-h-20 w-full items-center gap-2.5 rounded-xl px-2 text-left transition ${selected?.thread_id === t.thread_id ? "bg-sky-100 dark:bg-blue-950" : "hover:bg-muted"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChatAvatar, { name: titleOf(t), group: t.kind === "group" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate text-sm font-semibold", children: titleOf(t) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block truncate text-xs text-muted-foreground", children: t.last_message || "Bắt đầu trò chuyện" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-muted-foreground", children: when(t.last_at) })
                ] }),
                t.unread_count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white", children: t.unread_count > 99 ? "99+" : t.unread_count })
              ]
            },
            t.thread_id
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 border-t pt-3 text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-600" }),
        "Chỉ thành viên hội thoại được xem tin nhắn"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${selected ? "block" : compact ? "hidden" : "hidden md:block"} min-w-0`, children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChatConversation, { thread: selected, me: uid, names, compact, onBack: () => choose(void 0), onSent: () => void inbox.refetch() }, selected.thread_id) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[min(74dvh,760px)] flex-col items-center justify-center rounded-2xl border bg-gradient-to-br from-blue-50 to-teal-50 p-6 text-center dark:from-slate-900 dark:to-teal-950", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesSquare, { className: "h-12 w-12 text-blue-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-base font-bold", children: "Sứ Việt Chat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-xs text-sm text-muted-foreground", children: "Chọn một cuộc trò chuyện để trao đổi công việc và chia sẻ tài liệu với đồng nghiệp." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-emerald-700 dark:text-emerald-300", children: "Không công khai ra ngoài Base" })
    ] }) })
  ] });
}
export {
  ChatPanel
};
