import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c7 as chipiState, c8 as CHIPI_PLAY_DURATION_MS, c9 as CHIPI_PLAY_INTERVAL_MS, ca as newChipiNotice, cb as currentChipiNotice, B as Button, cc as ChipiNoticeIcon, cd as notificationText, ce as NotificationBell, bt as Popover, bu as PopoverTrigger, bv as PopoverContent, T as Switch, bA as useIsMobile, a as useServerFn, u as useCurrentUser, S as Sheet, q as SheetContent, r as SheetHeader, t as SheetTitle, ar as SheetDescription, cf as chipiDisplayState } from "./router-CkmTURa-.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { T as Textarea } from "./textarea-BGZgnbbj.mjs";
import { a as askAiSuviet, g as getAiPersonalMemory, b as getAiSuvietAvailability, e as editAiPersonalMemory, f as forgetAiPersonalMemory } from "./assistant.functions-B6_3tk2k.mjs";
import { u as useAiRecordContext } from "./useRecordContext-MOIepqyQ.mjs";
import { R as RECORD_LABELS } from "./recordContext-DHoEIBB_.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as chipiAssets } from "./states-C0pL4afS.mjs";
import "../_libs/seroval.mjs";
import { ah as ChevronUp, ai as Smile, X, aj as Settings2, n as ChevronDown, E as EyeOff, ak as Bot, S as Sparkles, al as Database, am as BookOpen, e as ArrowUpRight, F as FileText, a9 as LoaderCircle, ad as Send, a7 as ShieldCheck, an as Brain, ao as Pencil, ap as Trash2 } from "../_libs/lucide-react.mjs";
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
const CHIPI_SIZES = [90, 120, 150, 180];
function validChipiSize(value) {
  return CHIPI_SIZES.find((size) => size === value) ?? 150;
}
function chipiGreeting(date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "numeric", hourCycle: "h23" }).format(date));
  if (hour < 11 && hour >= 5) return "Chào ngày mới! Đốm chúc bạn một buổi sáng nhiều năng lượng.";
  if (hour >= 11 && hour < 14) return "Đến giờ ăn trưa rồi, nhớ ăn ngon và nghỉ một chút nhé!";
  if (hour >= 14 && hour < 18) return "Buổi chiều rồi! Cứ từng việc một, Đốm cổ vũ bạn.";
  return "Buổi tối rồi, nhớ dành thời gian nghỉ ngơi nhé!";
}
function chipiGreetingPose(date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "numeric", hourCycle: "h23" }).format(date));
  if (hour >= 5 && hour < 11) return "hello";
  if (hour >= 11 && hour < 14) return "thankyou";
  if (hour >= 14 && hour < 18) return "celebrate";
  return "quiet";
}
const CHIPI_CHAT_LINES = [
  "Uống một ngụm nước nhé, Đốm cũng đang tiếp năng lượng đây!",
  "Từng bước nhỏ cũng đưa mình đến đích. Cố lên nhé!",
  "Thả lỏng vai một chút, bạn đã làm việc chăm chỉ rồi.",
  "Đốm gửi bạn một chút năng lượng tích cực!",
  "Nhìn ra xa vài giây để đôi mắt được nghỉ nhé.",
  "Một ngày tốt lành bắt đầu từ những việc nhỏ xinh.",
  "Bạn không cần làm mọi thứ cùng lúc đâu.",
  "Đốm tin bạn sẽ tìm được cách giải quyết phù hợp.",
  "Nhớ giữ cốc nước ở gần mình nhé!",
  "Hít thở chậm một chút, rồi mình tiếp tục nào.",
  "Hôm nay bạn đã cố gắng rồi, đừng quên ghi nhận điều đó.",
  "Một nụ cười nhỏ cũng làm buổi làm việc dễ chịu hơn.",
  "Đốm đang âm thầm cổ vũ bạn đây!",
  "Đứng dậy duỗi chân một chút khi thuận tiện nhé.",
  "Làm chậm mà chắc cũng rất đáng tự hào.",
  "Chúc bạn gặp nhiều điều dễ thương hôm nay!",
  "Nghỉ một nhịp rồi quay lại, ý tưởng có thể sáng hơn đấy.",
  "Đừng quên ăn đúng bữa nhé, người bạn chăm chỉ!",
  "Mỗi việc hoàn thành đều là một bước tiến.",
  "Giữ nhịp riêng của bạn, Đốm luôn ở đây.",
  "Một chút kiên nhẫn có thể làm nên điều hay.",
  "Bạn xứng đáng có một phút nghỉ thoải mái.",
  "Đốm chúc bạn một buổi làm việc suôn sẻ!",
  "Nhẹ nhàng với chính mình một chút nhé.",
  "Chúng mình cứ làm tốt từng việc nhỏ thôi.",
  "Một ý tưởng hay đôi khi đến sau một ngụm nước.",
  "Thả lỏng bàn tay một lát nếu bạn gõ nhiều nhé.",
  "Đốm gửi một lời chúc bình an đến bạn.",
  "Nhớ chăm sóc mình như cách bạn chăm chút công việc.",
  "Hôm nay có thể chưa hoàn hảo, nhưng vẫn có điều đáng vui.",
  "Một chút tập trung, một chút nghỉ ngơi — thật vừa vặn!",
  "Chúc những việc khó dần trở nên dễ hơn với bạn.",
  "Bạn đang tiến lên, dù có lúc bước thật chậm.",
  "Đốm mong bạn có một ngày thật dễ chịu.",
  "Đổi tư thế ngồi một chút cho thoải mái nhé.",
  "Cảm ơn bạn đã cố gắng hôm nay!"
];
function chipiChatDelay(random) {
  return (60 + Math.min(1, Math.max(0, random)) * 60) * 6e4;
}
function nextChipiLine(previous, random) {
  const choices = CHIPI_CHAT_LINES.map((_, index) => index).filter((index) => index !== previous);
  return choices[Math.min(choices.length - 1, Math.floor(Math.max(0, random) * choices.length))] ?? 0;
}
function ChipiMemory({ memories, onChanged, onForgot, disabled }) {
  const edit = useServerFn(editAiPersonalMemory), forget = useServerFn(forgetAiPersonalMemory);
  const [editing, setEditing] = reactExports.useState(null), [draft, setDraft] = reactExports.useState(""), [busy, setBusy] = reactExports.useState(false);
  const [confirm, setConfirm] = reactExports.useState(null);
  const fail = (e) => toast.error(e instanceof Error ? e.message : "Chưa cập nhật được bộ nhớ.");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "shrink-0 border-b bg-card px-4 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-4 w-4" }),
      "Đốm nhớ về bạn · ",
      memories.length
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[35dvh] space-y-3 overflow-y-auto pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-5 text-muted-foreground", children: "Riêng tài khoản của bạn. Đốm nhớ sở thích và chủ đề đã trao đổi; chức vụ, phòng ban luôn đọc lại từ Base. Trò chuyện được lưu từ bản cập nhật này." }),
      !memories.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Chưa có ký ức cá nhân. Bạn có thể chia sẻ cách muốn Đốm hỗ trợ." }),
      memories.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border p-3", children: editing === m.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: draft, maxLength: 600, onChange: (e) => setDraft(e.target.value), className: "text-base", "aria-label": "Nội dung ký ức" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: busy || disabled || !draft.trim(), onClick: async () => {
            setBusy(true);
            try {
              await edit({ data: { id: m.id, content: draft } });
              setEditing(null);
              onChanged();
            } catch (e) {
              fail(e);
            } finally {
              setBusy(false);
            }
          }, children: "Lưu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditing(null), children: "Hủy" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words text-xs leading-5", children: m.content }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: busy || disabled, onClick: () => {
            setEditing(m.id);
            setDraft(m.content);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
            "Sửa"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", disabled: busy || disabled, onClick: () => setConfirm({ id: m.id }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }),
            "Quên"
          ] })
        ] })
      ] }) }, m.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: busy || disabled, onClick: () => setConfirm({ id: null }), children: "Quên toàn bộ và xóa cuộc trò chuyện" }),
      confirm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-950 dark:bg-rose-950 dark:text-rose-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-5", children: confirm.id ? "Quên ký ức này và xóa toàn bộ cuộc trò chuyện đã lưu để Đốm không học lại từ tin nhắn cũ. Các ký ức khác vẫn giữ nguyên." : "Xóa toàn bộ ký ức và cuộc trò chuyện của bạn. Không thể hoàn tác." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", disabled: busy || disabled, onClick: async () => {
            setBusy(true);
            try {
              await forget({ data: { id: confirm.id, confirmation: "QUEN" } });
              setConfirm(null);
              setEditing(null);
              onForgot();
              toast.success("Đốm đã quên theo yêu cầu.");
            } catch (e) {
              fail(e);
            } finally {
              setBusy(false);
            }
          }, children: "Xác nhận quên" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: busy, onClick: () => setConfirm(null), children: "Giữ lại" })
        ] })
      ] })
    ] })
  ] });
}
const sampleQuestions = [
  "Cách tạo Job thiết kế trên Base?",
  "Gửi duyệt Job ở đâu?",
  "Phân công tín hiệu cho Sale thế nào?",
  "Hướng dẫn lập 3K của tôi",
  "Cách đăng ký lịch trực Showroom tuần sau?"
];
function errorText(e) {
  return e instanceof Error ? e.message : "AI chưa trả lời được. Hãy thử lại.";
}
function ChipiAiPanel({ open, onOpenChange }) {
  const recordContext = useAiRecordContext();
  const contextKey = recordContext ? `${recordContext.kind}:${recordContext.id}` : "";
  const generation = reactExports.useRef(0);
  const mobile = useIsMobile();
  const ask = useServerFn(askAiSuviet);
  const readPersonal = useServerFn(getAiPersonalMemory);
  const scope = recordContext ? `${recordContext.kind}:${recordContext.id}` : "general";
  const hydrated = reactExports.useRef(false);
  const sending = reactExports.useRef(false);
  const checkAvailability = useServerFn(getAiSuvietAvailability);
  const { user } = useCurrentUser();
  const availability = useQuery({
    queryKey: ["ai-suviet", "availability", user?.id],
    queryFn: () => checkAvailability(),
    enabled: open && !!user?.id && user?.status === "Đang hoạt động",
    staleTime: 6e4,
    refetchOnWindowFocus: true,
    retry: 1
  });
  const personal = useQuery({ queryKey: ["ai-suviet", "personal", user?.id, scope], queryFn: () => readPersonal({ data: { scope } }), enabled: open && !!user?.id && user?.status === "Đang hoạt động", staleTime: 0, gcTime: 0, retry: 1 });
  const [input, setInput] = reactExports.useState("");
  reactExports.useEffect(() => {
    const onGuide = (event) => {
      const question = event.detail?.question;
      if (typeof question === "string" && question.trim()) setInput(question.slice(0, 900));
    };
    window.addEventListener("suviet-ai-open", onGuide);
    return () => window.removeEventListener("suviet-ai-open", onGuide);
  }, []);
  const [messages, setMessages] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const bottom = reactExports.useRef(null);
  const nextId = reactExports.useRef(1);
  reactExports.useEffect(() => {
    generation.current++;
    hydrated.current = false;
    sending.current = false;
    setMessages([]);
    setInput("");
    setBusy(false);
  }, [user?.id, contextKey]);
  reactExports.useEffect(() => {
    if (personal.data && !hydrated.current && !sending.current) {
      hydrated.current = true;
      setMessages(personal.data.turns.flatMap((t) => [{ id: nextId.current++, role: "user", text: t.question }, { id: nextId.current++, role: "assistant", text: t.answer, mode: t.mode, sources: t.sources }]));
    }
  }, [personal.data]);
  reactExports.useEffect(() => {
    if (open) bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length, busy, open]);
  const send = async (text) => {
    const message = text.trim();
    if (!message || sending.current || personal.isPending || personal.isError) return;
    if (message.length > 900) {
      toast.error("Câu hỏi tối đa 900 ký tự.");
      return;
    }
    const gen = generation.current;
    sending.current = true;
    setMessages((old) => [...old, { id: nextId.current++, role: "user", text: message }]);
    setInput("");
    setBusy(true);
    try {
      const answer = await ask({ data: { requestId: crypto.randomUUID(), question: message, context: recordContext ?? void 0 } });
      if (gen !== generation.current) return;
      setMessages((old) => [...old, {
        id: nextId.current++,
        role: "assistant",
        text: answer.answer,
        sources: answer.sources,
        mode: answer.mode
      }]);
      void personal.refetch();
    } catch (error) {
      if (gen !== generation.current) return;
      setMessages((old) => [...old, { id: nextId.current++, role: "assistant", text: errorText(error) }]);
      toast.error(errorText(error));
    } finally {
      if (gen === generation.current) {
        sending.current = false;
        setBusy(false);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SheetContent,
    {
      side: mobile ? "bottom" : "right",
      className: `flex flex-col gap-0 overflow-hidden rounded-t-3xl p-0 ${mobile ? "h-[min(86dvh,780px)] w-full" : "h-full w-[min(96vw,480px)] sm:max-w-[480px]"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "shrink-0 border-b bg-gradient-to-r from-[#123a67] via-[#21547f] to-[#157985] px-5 py-4 pr-12 text-left text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-xl bg-white/15 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "text-base font-bold text-white", children: "Đốm · AI Sứ Việt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { className: "mt-1 text-xs text-blue-100", children: "Giải đáp Base, hướng dẫn quy trình và trò chuyện vui 🧡" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChipiMemory, { memories: personal.data?.memories ?? [], disabled: busy || personal.isPending || personal.isError, onChanged: () => void personal.refetch(), onForgot: () => {
          generation.current++;
          setMessages([]);
          hydrated.current = true;
          void personal.refetch();
        } }, `${user?.id}:${scope}`),
        personal.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-2 text-xs text-muted-foreground", children: "Đang mở lại cuộc trò chuyện…" }),
        personal.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "px-4 py-2 text-xs text-rose-600", children: [
          "Chưa tải được bộ nhớ riêng. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => void personal.refetch(), children: "Thử lại" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/75 p-4 dark:bg-slate-950/70", "aria-label": "Lịch sử hỏi đáp AI", role: "log", children: [
          recordContext && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-950 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold", children: [
              "Đang hỗ trợ: ",
              RECORD_LABELS[recordContext.kind],
              " đang mở"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-5", children: "Đốm đọc lại hồ sơ theo quyền của bạn. Trò chuyện được lưu riêng; dữ liệu hồ sơ luôn được đọc lại theo quyền hiện tại." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid gap-2", children: ["Hồ sơ này đang chờ ai?", "Tiếp theo tôi cần làm gì?", "Tóm tắt hồ sơ đang mở"].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "min-h-11 justify-start whitespace-normal text-left text-xs", disabled: busy || personal.isPending || personal.isError, onClick: () => void send(q), children: q }, q)) })
          ] }),
          messages.length === 0 && !recordContext && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            availability.data?.available === false && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100", children: "Đốm đang ở chế độ hướng dẫn có sẵn. Bạn vẫn có thể hỏi cách dùng Base; phần hỏi đáp AI tự nhiên và đọc tài liệu chuyên sâu sẽ hoạt động sau khi quản trị viên kết nối OpenAI." }),
            availability.data?.available === true && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100", children: "Máy chủ đã nhận cấu hình OpenAI. Đốm sẽ thử trả lời từ dữ liệu mà bạn được phép xem; quản trị viên có thể kiểm tra kết nối trong Kho kiến thức AI." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-amber-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-sm", children: "Xin chào! Đốm đây!" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6", children: "Bạn muốn biết cách dùng Base, tìm thông tin công việc hay chỉ muốn tâm sự một chút? Cứ hỏi mình nhé. 🌼" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-full bg-muted px-2 py-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-3 w-3" }),
                  "Dữ liệu Base"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-full bg-muted px-2 py-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-3 w-3" }),
                  "Kho tài liệu AI"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 text-xs font-semibold text-muted-foreground", children: "Thử hỏi Đốm" }),
              sampleQuestions.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => void send(q),
                  className: "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-left text-sm hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: q }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 shrink-0 text-blue-600" })
                  ]
                },
                q
              ))
            ] })
          ] }),
          messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] text-muted-foreground", children: "Tin nhắn cũ là nội dung đã trao đổi; hỏi lại để kiểm tra trạng thái hiện tại." }),
          messages.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${m.role === "user" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[94%] space-y-2 rounded-2xl px-3.5 py-3 text-[13px] leading-6 shadow-sm ${m.role === "user" ? "rounded-br-md bg-blue-700 text-white" : "rounded-bl-md border bg-card text-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words", children: m.text }),
            m.role === "assistant" && !!m.sources?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 border-t pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-[11px] font-semibold text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                "Căn cứ tham khảo"
              ] }),
              m.sources.slice(0, 5).map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: s.href.startsWith("/") ? s.href : "#",
                  className: "flex items-center gap-1.5 break-words text-xs font-medium text-blue-700 hover:underline dark:text-sky-300",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 shrink-0" }),
                    s.title
                  ]
                },
                `${s.kind}-${i}`
              ))
            ] })
          ] }) }, m.id)),
          busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            "Đốm đang tìm thông tin…"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottom })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          void send(input);
        }, className: "shrink-0 space-y-2 border-t bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                rows: 1,
                maxLength: 900,
                value: input,
                onChange: (e) => setInput(e.target.value),
                className: "min-h-12 max-h-28 flex-1 resize-none rounded-xl text-base",
                placeholder: "Hỏi Đốm điều gì đó…",
                onKeyDown: (e) => {
                  if (e.key === "Enter" && !e.shiftKey && window.innerWidth >= 768) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "h-12 w-12 shrink-0 rounded-xl bg-blue-700 hover:bg-blue-800", disabled: !input.trim() || busy || personal.isPending || personal.isError, "aria-label": "Gửi câu hỏi", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
            "Đốm chỉ xem dữ liệu trong quyền của bạn; không tự sửa Base."
          ] })
        ] })
      ]
    }
  ) });
}
function ChipiAssistant({ userId }) {
  const [mode, setMode] = reactExports.useState("full");
  const [ready, setReady] = reactExports.useState(false);
  const [hello, setHello] = reactExports.useState(true);
  const [notice, setNotice] = reactExports.useState();
  const [bubble, setBubble] = reactExports.useState(false);
  const [decoration, setDecoration] = reactExports.useState();
  const [motionAllowed, setMotionAllowed] = reactExports.useState(false);
  const [size, setSize] = reactExports.useState(150);
  const [chatEnabled, setChatEnabled] = reactExports.useState(true);
  const [chat, setChat] = reactExports.useState();
  const [chatPose, setChatPose] = reactExports.useState("thankyou");
  const [settingsOpen, setSettingsOpen] = reactExports.useState(false);
  const [aiOpen, setAiOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const show = () => setAiOpen(true);
    window.addEventListener("suviet-ai-open", show);
    return () => window.removeEventListener("suviet-ai-open", show);
  }, []);
  const lastLine = reactExports.useRef(-1);
  const lastActive = reactExports.useRef(0);
  const chatTimer = reactExports.useRef(void 0);
  const preferencesKey = `chipi-preferences:${userId}`;
  const seen = reactExports.useRef(/* @__PURE__ */ new Set());
  const lastBubble = reactExports.useRef(0);
  const timer = reactExports.useRef(void 0);
  const key = `chipi:${userId}`;
  const business = chipiState(notice);
  const canChat = reactExports.useCallback(() => document.visibilityState === "visible" && !document.querySelector('[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]') && !document.activeElement?.closest('form, input, textarea, select, [contenteditable="true"]'), []);
  const say = reactExports.useCallback((text, pose = "thankyou") => {
    setChatPose(pose);
    setChat(text);
    clearTimeout(chatTimer.current);
    chatTimer.current = setTimeout(() => setChat(void 0), 7e3);
  }, []);
  reactExports.useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(preferencesKey, JSON.stringify({ size, chatEnabled }));
    } catch {
    }
  }, [ready, preferencesKey, size, chatEnabled]);
  reactExports.useEffect(() => {
    if (business !== "idle" || !chatEnabled || mode !== "full") setChat(void 0);
  }, [business, chatEnabled, mode]);
  reactExports.useEffect(() => {
    const active = () => {
      lastActive.current = Date.now();
    };
    active();
    window.addEventListener("pointerdown", active, { passive: true });
    window.addEventListener("keydown", active);
    return () => {
      window.removeEventListener("pointerdown", active);
      window.removeEventListener("keydown", active);
      clearTimeout(chatTimer.current);
    };
  }, []);
  reactExports.useEffect(() => {
    if (!ready || !chatEnabled || mode !== "full" || business !== "idle") return;
    let next;
    const schedule = () => {
      next = setTimeout(() => {
        if (Date.now() - lastActive.current < 5 * 6e4 && canChat()) {
          lastLine.current = nextChipiLine(lastLine.current, Math.random());
          say(CHIPI_CHAT_LINES[lastLine.current] ?? CHIPI_CHAT_LINES[0]);
        }
        schedule();
      }, chipiChatDelay(Math.random()));
    };
    schedule();
    return () => clearTimeout(next);
  }, [ready, chatEnabled, mode, business, canChat, say]);
  reactExports.useEffect(() => {
    if (!ready || !hello || !chatEnabled || mode !== "full" || business !== "idle") return;
    const greet = setTimeout(() => {
      if (canChat()) {
        const now = /* @__PURE__ */ new Date();
        say(chipiGreeting(now), chipiGreetingPose(now));
      }
    }, 700);
    return () => clearTimeout(greet);
  }, [ready, hello, chatEnabled, mode, business, canChat, say]);
  reactExports.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  reactExports.useEffect(() => {
    if (!ready || !motionAllowed || mode !== "full" || business !== "idle") {
      setDecoration(void 0);
      return;
    }
    let count = 0;
    let end;
    const play = setInterval(() => {
      if (!canChat()) return;
      setDecoration(count++ % 2 === 0 ? "hello" : "thinking");
      clearTimeout(end);
      end = setTimeout(() => setDecoration(void 0), CHIPI_PLAY_DURATION_MS);
    }, CHIPI_PLAY_INTERVAL_MS);
    return () => {
      clearInterval(play);
      clearTimeout(end);
    };
  }, [ready, motionAllowed, mode, business, canChat]);
  reactExports.useEffect(() => {
    try {
      const preferences = JSON.parse(localStorage.getItem(preferencesKey) ?? "{}");
      setSize(validChipiSize(preferences.size));
      setChatEnabled(preferences.chatEnabled !== false);
      const saved = JSON.parse(sessionStorage.getItem(key) ?? "{}");
      if (["full", "small", "hidden"].includes(saved.mode)) setMode(saved.mode);
      seen.current = new Set(Array.isArray(saved.seen) ? saved.seen : []);
      lastBubble.current = typeof saved.lastBubble === "number" ? saved.lastBubble : 0;
      setHello(!saved.visited);
    } catch {
    }
    setReady(true);
    const greeting = setTimeout(() => setHello(false), 4500);
    return () => {
      clearTimeout(greeting);
      clearTimeout(timer.current);
    };
  }, [key, preferencesKey]);
  reactExports.useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({ mode, visited: true, lastBubble: lastBubble.current, seen: [...seen.current].slice(-100) }));
    } catch {
    }
  }, [key, mode, ready, notice]);
  const onNotifications = reactExports.useCallback((data) => {
    const fresh = newChipiNotice(data, seen.current);
    seen.current = new Set([...seen.current, ...data.map((n) => n.id)].slice(-100));
    if (!fresh) {
      setNotice((old) => currentChipiNotice(data, old?.id));
      return;
    }
    setNotice(fresh);
    setChat(void 0);
    if (Date.now() - lastBubble.current < 6e4) return;
    lastBubble.current = Date.now();
    setHello(false);
    setBubble(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(false), 7e3);
  }, []);
  if (!ready) return null;
  if (mode === "hidden") return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChipiAiPanel, { open: aiOpen, onOpenChange: setAiOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chipi-assistant chipi-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", title: "Hiện Đốm", "aria-label": "Hiện Đốm", onClick: () => setMode("small"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, {}) }) })
  ] });
  const state = chipiDisplayState(business, chat ? chatPose : !chatEnabled ? "quiet" : decoration);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `chipi-assistant chipi-size-${size} ${mode === "small" ? "chipi-small" : ""}`, "data-state": state, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChipiAiPanel, { open: aiOpen, onOpenChange: setAiOpen }),
    chat && business === "idle" && mode === "full" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chipi-bubble p-4", role: "status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-4 w-4 text-chipi-orange shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm flex-1", children: chat }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6 shrink-0", "aria-label": "Đóng lời chào Đốm", onClick: () => setChat(void 0), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, {}) })
    ] }) }),
    bubble && mode === "full" && notice && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chipi-bubble p-4", role: "status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chipi-notice-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipiNoticeIcon, { kind: notice.kind, className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold break-words", children: notificationText(notice) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1.5", children: "Đốm nhắc bạn kiểm tra nhé!" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6 shrink-0 -mr-1 -mt-1", "aria-label": "Đóng lời nhắc Đốm", onClick: () => setBubble(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chipi-tools flex justify-end gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, { onNotifications }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: settingsOpen, onOpenChange: setSettingsOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 bg-background/90", title: "Cài đặt Đốm", "aria-label": "Cài đặt Đốm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "end", collisionPadding: 12, className: "w-72 max-w-[calc(100vw-24px)] space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Cài đặt Đốm · AI Sứ Việt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Kích thước máy tính" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: CHIPI_SIZES.map((value, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: size === value ? "default" : "outline", onClick: () => setSize(value), "aria-pressed": size === value, children: [
              ["Nhỏ", "Vừa", "Lớn", "Rất lớn"][index],
              " · ",
              value,
              "px"
            ] }, value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `chipi-chat-${userId}`, className: "text-sm", children: "Lời chào vui tự động" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: `chipi-chat-${userId}`, checked: chatEnabled, onCheckedChange: setChatEnabled })
          ] }),
          !chatEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Yên tĩnh · chỉ thông báo công việc" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 bg-background/90", title: mode === "small" ? "Mở rộng Đốm" : "Thu nhỏ Đốm", "aria-label": mode === "small" ? "Mở rộng Đốm" : "Thu nhỏ Đốm", onClick: () => {
        setMode(mode === "small" ? "full" : "small");
        setBubble(false);
      }, children: mode === "small" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 bg-background/90", title: "Ẩn Đốm trong phiên này", "aria-label": "Ẩn Đốm", onClick: () => {
        setMode("hidden");
        setBubble(false);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "chipi-trigger relative h-auto border-0 bg-transparent p-0 hover:bg-transparent", title: "Hỏi AI Sứ Việt", "aria-label": "Mở trợ lý AI Sứ Việt", onClick: () => {
      setBubble(false);
      setAiOpen(true);
      setChat(void 0);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: bubble ? "chipi-art chipi-bounce" : "chipi-art", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: decoration ? "chipi-pose chipi-play" : "chipi-pose", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: chipiAssets[state].url, alt: "Đốm · AI Sứ Việt", width: size, height: size, draggable: false }, state) }) }) })
  ] });
}
export {
  ChipiAssistant
};
