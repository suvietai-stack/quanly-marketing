import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCurrentUser, P as PageHeader, L as Label, B as Button, l as Badge, C as Card, O as CardHeader, Q as CardTitle, o as CardContent, D as Dialog, x as DialogContent, y as DialogHeader, A as DialogTitle, bc as DialogDescription, I as Input, N as Checkbox } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/seroval.mjs";
import { I as CalendarDays, w as Users, bB as ArrowLeftRight, C as ClipboardCheck, aj as Settings2, a9 as LoaderCircle, aD as Clock3, aT as ChevronLeft, s as ChevronRight, b7 as Copy, ar as CircleCheck, bC as CircleQuestionMark, aV as TriangleAlert } from "../_libs/lucide-react.mjs";
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
const SHIFT_LABELS = {
  early: "Ca 1 · Sớm",
  late: "Ca 2 · Muộn",
  full: "Ca Full",
  off: "Nghỉ"
};
const SHIFT_OPTIONS = [
  { value: "early", label: "Ca 1 · Sớm" },
  { value: "late", label: "Ca 2 · Muộn" },
  { value: "full", label: "Ca Full" },
  { value: "off", label: "Nghỉ" }
];
const db = supabase;
async function readShowroomRosterStores() {
  const { data, error } = await db.rpc("showroom_roster_stores_read", {});
  if (error) throw new Error(error.message);
  return data;
}
async function readShowroomRoster(store, week) {
  const { data, error } = await db.rpc("showroom_roster_read", { _store: store, _week: week });
  if (error) throw new Error(error.message);
  return data;
}
async function showroomRosterAction(store, week, action, payload = {}) {
  const { data, error } = await db.rpc("showroom_roster_action", { _store: store, _week: week, _action: action, _data: payload });
  if (error) throw new Error(error.message);
  return data;
}
function vnToday() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
}
function dateAdd(day, days) {
  const d = /* @__PURE__ */ new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function mondayOf(day) {
  const dow = (/* @__PURE__ */ new Date(day + "T12:00:00Z")).getUTCDay();
  return dateAdd(day, -((dow + 6) % 7));
}
function upcomingWeek() {
  return dateAdd(mondayOf(vnToday()), 7);
}
function weekLabel(week) {
  const fmt = (x) => x.slice(8, 10) + "/" + x.slice(5, 7);
  return fmt(week) + " – " + fmt(dateAdd(week, 6));
}
function restCount(shifts, week, holidays) {
  return shifts.filter((s, i) => s === "off" && !holidays.includes(dateAdd(week, i))).length;
}
function shiftDateLabel(date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(/* @__PURE__ */ new Date(date + "T12:00:00Z"));
}
const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const weekdayFull = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];
const classSelect = "h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const statusLabel = {
  pending_peer: "Chờ đồng nghiệp",
  pending_manager: "Chờ quản lý",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã thu hồi"
};
const codeColor = {
  early: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
  late: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200",
  full: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  off: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
};
const HelpButton = ({ question }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", className: "gap-1.5", onClick: () => {
  window.dispatchEvent(new CustomEvent("suviet-ai-open", { detail: { question } }));
}, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-4 w-4" }),
  "Hỏi Đốm"
] });
function ShiftTag({ code }) {
  if (!code) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Chưa chọn" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex rounded-lg border px-2 py-1 text-xs font-semibold ${codeColor[code]}`, children: SHIFT_LABELS[code] });
}
function DayAlert({ item, policy }) {
  if (item.holiday) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Nghỉ lễ" });
  const ok = item.missing_early === 0 && item.missing_late === 0;
  return ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-emerald-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
    "Đủ ca"
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-amber-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
    item.full > 0 ? "Ca Full · ngoại lệ" : `Thiếu ${item.missing_early ? "Ca 1" + (item.missing_late ? " + " : "") : ""}${item.missing_late ? "Ca 2" : ""}`
  ] });
}
function WeekButtons({ week, setWeek }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-11 items-center justify-between gap-2 rounded-xl border bg-card px-2 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", "aria-label": "Tuần trước", onClick: () => setWeek(dateAdd(week, -7)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
        "Tuần ",
        weekLabel(week)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: week === upcomingWeek() ? "Tuần kế tiếp" : week === mondayOf(vnToday()) ? "Tuần hiện tại" : "Lịch theo tuần" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", "aria-label": "Tuần sau", onClick: () => setWeek(dateAdd(week, 7)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" }) })
  ] });
}
function Registration({ roster, week, mutate, loading, onChange }) {
  const mine = roster.entries.filter((e) => e.staff_id === roster.actor_id);
  const [draft, setDraft] = reactExports.useState(Array(7).fill("early"));
  const saved = Array.from({ length: 7 }, (_, i) => mine.find((e) => e.date === dateAdd(week, i)));
  reactExports.useEffect(() => {
    setDraft(Array.from({ length: 7 }, (_, i) => roster.entries.find((e) => e.date === dateAdd(week, i) && e.staff_id === roster.actor_id)?.requested ?? (roster.policy.holidays.includes(dateAdd(week, i)) ? "off" : "early")));
  }, [roster, week]);
  const now = new Date(roster.server_now).getTime();
  const open = now >= new Date(roster.window.open_at).getTime() && now < new Date(roster.window.close_at).getTime() && roster.week_status === "draft";
  const canEdit = roster.can_register && open;
  const rest = restCount(draft, week, roster.policy.holidays);
  const submitted = saved.every(Boolean);
  const closeText = new Date(roster.window.close_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  const openText = new Date(roster.window.open_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  const reset = async () => {
    try {
      const previous = await readShowroomRoster(roster.store_id, dateAdd(week, -7));
      const codes = Array.from({ length: 7 }, (_, i) => previous.entries.find((e) => e.staff_id === roster.actor_id && e.date === dateAdd(week, -7 + i))?.requested ?? "early");
      setDraft(codes);
      toast.success("Đã sao chép. Kiểm tra lại trước khi gửi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chưa sao chép được lịch.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 rounded-xl border bg-card p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: roster.week_status === "published" ? "Lịch đã công bố" : open ? "Đang mở đăng ký" : "Đăng ký chưa mở / đã khóa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs leading-5 text-muted-foreground", children: [
          "Mở: ",
          openText,
          " · Khóa: ",
          closeText
        ] }),
        submitted && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-emerald-700", children: "Đã có đăng ký của bạn trong tuần này." })
      ] }),
      canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "shrink-0 gap-1", onClick: () => void reset(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
        "Tuần trước"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: weekdays.map((day, i) => {
      const date = dateAdd(week, i), e = saved[i], current = roster.week_status === "published" ? e?.shift ?? null : draft[i];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-16 shrink-0 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold", children: day }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: shiftDateLabel(date) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsx("select", { "aria-label": `Ca ${day}`, className: classSelect, value: draft[i], onChange: (e2) => setDraft((x) => x.map((v, j) => j === i ? e2.target.value : v)), children: SHIFT_OPTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.value, children: s.label }, s.value)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-11 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShiftTag, { code: current }) }),
          roster.policy.holidays.includes(date) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Ngày nghỉ lễ" })
        ] }),
        roster.week_status === "published" && roster.can_swap && e && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", className: "min-h-10 shrink-0", onClick: () => onChange(true, date), children: "Đổi" })
      ] }, date);
    }) }),
    canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-xl px-3 py-2 text-sm ${rest === roster.policy.rest_days ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100" : "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100"}`, children: rest === roster.policy.rest_days ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
        "Đã chọn ",
        rest,
        " ngày nghỉ/tuần."
      ] }) : `Cần chọn đúng ${roster.policy.rest_days} ngày nghỉ/tuần (không tính ngày lễ). Hiện có ${rest}.` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "h-12 w-full text-base", disabled: loading || rest !== roster.policy.rest_days, onClick: () => void mutate("register", { shifts: draft }), children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        submitted ? "Cập nhật đăng ký" : "Gửi đăng ký tuần"
      ] })
    ] }),
    !open && roster.week_status !== "published" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100", children: "Đã ngoài thời gian đăng ký trực tiếp. Bạn có thể liên hệ quản lý để xử lý thay đổi." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs leading-5 text-muted-foreground", children: [
      "Ca 1: ",
      roster.policy.early_start,
      "–",
      roster.policy.noon_break_start,
      ", ",
      roster.policy.noon_break_end,
      "–",
      roster.policy.early_end,
      " · Ca 2: ",
      roster.policy.late_start,
      "–",
      roster.policy.noon_break_start,
      ", ",
      roster.policy.noon_break_end,
      "–",
      roster.policy.late_end,
      ". Ca Full phải được quản lý kiểm tra thời giờ làm việc và nghỉ giữa giờ."
    ] })
  ] });
}
function TeamSchedule({ roster, week }) {
  const [day, setDay] = reactExports.useState(0);
  reactExports.useEffect(() => setDay(0), [week, roster.store_id]);
  const date = dateAdd(week, day), summary = roster.days[day];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nhân viên tự phối hợp để mỗi ngày đủ ít nhất 1 Ca 1 và 1 Ca 2. Base không tự xếp ca." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1.5", children: weekdays.map((d, i) => {
      const s = roster.days[i];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setDay(i),
          "aria-pressed": day === i,
          className: `min-h-14 rounded-xl border px-1 py-2 text-center ${day === i ? "border-primary bg-primary/10 ring-1 ring-primary" : "bg-card"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: d }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: dateAdd(week, i).slice(-2) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${s.holiday ? "bg-slate-400" : s.missing_early || s.missing_late ? "bg-amber-500" : "bg-emerald-500"}` })
          ]
        },
        d
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
            weekdayFull[day],
            ", ",
            shiftDateLabel(date)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            summary?.working ?? 0,
            " người đi làm"
          ] })
        ] }),
        summary && /* @__PURE__ */ jsxRuntimeExports.jsx(DayAlert, { item: summary, policy: roster.policy })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
        roster.staff.map((person) => {
          const e = roster.entries.find((x) => x.staff_id === person.id && x.date === date);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-12 items-center justify-between gap-2 border-b py-2 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: person.name }),
              e?.assigned && e?.assigned !== e?.requested && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Quản lý đã điều chỉnh" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShiftTag, { code: e?.shift })
          ] }, person.id);
        }),
        summary && !summary.holiday && summary.lunch_needs_confirmation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:bg-amber-950 dark:text-amber-100", children: "Giờ nghỉ trưa 12:00–13:15 cần được bố trí nghỉ lệch hoặc có người trực thay. Đủ Ca 1/Ca 2 chưa có nghĩa là đã phủ trọn giờ mở cửa." })
      ] })
    ] })
  ] });
}
function ChangePanel({ roster, week, mutate, loading, open, onOpenChange, pickDate }) {
  const [date, setDate] = reactExports.useState(pickDate);
  const [kind, setKind] = reactExports.useState("swap");
  const [partner, setPartner] = reactExports.useState("");
  const [partnerDate, setPartnerDate] = reactExports.useState(pickDate);
  const [reason, setReason] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (open) {
      const mine = roster.entries.find((e) => e.date === pickDate && e.staff_id === roster.actor_id);
      setDate(pickDate);
      setPartnerDate(pickDate);
      setKind(mine?.shift === "off" ? "rest_exchange" : "swap");
      setReason("");
      setPartner("");
    }
  }, [open, pickDate, roster]);
  const personName = (id) => roster.staff.find((p) => p.id === id)?.name ?? "Nhân viên";
  const currentChanges = roster.changes;
  const send = async () => {
    if (kind !== "emergency" && !partner) {
      toast.error("Hãy chọn đồng nghiệp nhận ca.");
      return;
    }
    if (kind === "rest_exchange" && date === partnerDate) {
      toast.error("Hai người phải nghỉ vào hai ngày khác nhau.");
      return;
    }
    if (kind === "emergency" && !reason.trim()) {
      toast.error("Cần ghi lý do nghỉ khẩn cấp.");
      return;
    }
    if (await mutate("change_create", { date, kind, partner_id: partner, partner_date: partnerDate, reason })) onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đổi ca sau chốt: đồng nghiệp xác nhận, quản lý duyệt thì lịch mới có hiệu lực." }),
      roster.can_swap && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => onOpenChange(true), children: "+ Đề nghị" })
    ] }),
    currentChanges.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-5 text-center text-sm text-muted-foreground", children: "Chưa có yêu cầu đổi ca trong tuần." }),
    currentChanges.map((change) => {
      const mine = change.requester_id === roster.actor_id;
      const isPeer = change.partner_id === roster.actor_id && change.status === "pending_peer";
      const canApprove = roster.can_approve && change.status === "pending_manager";
      const pending = change.status === "pending_peer" || change.status === "pending_manager";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-xl border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: change.kind === "emergency" ? "Báo nghỉ khẩn cấp" : change.kind === "rest_exchange" ? "Đổi ngày nghỉ" : "Yêu cầu đổi ca" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              personName(change.requester_id),
              " · ",
              shiftDateLabel(change.work_date)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: change.status === "approved" ? "default" : "secondary", children: statusLabel[change.status] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          change.kind === "rest_exchange" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Hoán đổi ngày nghỉ" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShiftTag, { code: change.original_shift }),
          change.partner_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-muted-foreground", children: [
            "↔ ",
            personName(change.partner_id),
            " · ",
            change.partner_date && shiftDateLabel(change.partner_date),
            " (",
            change.partner_shift && SHIFT_LABELS[change.partner_shift],
            ")"
          ] })
        ] }),
        change.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Lý do: ",
          change.reason
        ] }),
        change.decision_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Phản hồi: ",
          change.decision_note
        ] }),
        (isPeer || canApprove || mine && pending) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-1", children: [
          isPeer && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: loading, onClick: () => void mutate("change_reply", { id: change.id, accept: true }), children: "Đồng ý nhận ca" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: loading, onClick: () => void mutate("change_reply", { id: change.id, accept: false }), children: "Từ chối" })
          ] }),
          canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: loading, onClick: () => void mutate("change_review", { id: change.id, accept: true, reason: change.kind === "emergency" ? "Quản lý tiếp nhận báo nghỉ khẩn và điều phối người thay." : "Đồng ý đổi ca" }), children: "Duyệt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", disabled: loading, onClick: () => void mutate("change_review", { id: change.id, accept: false, reason: "Yêu cầu chưa phù hợp lịch trực" }), children: "Từ chối" })
          ] }),
          mine && pending && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", disabled: loading, onClick: () => void mutate("change_cancel", { id: change.id }), children: "Thu hồi" })
        ] })
      ] }, change.id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85dvh] max-w-[min(95vw,440px)] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Đề nghị đổi ca" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Sau khi được duyệt, lịch mới mới có hiệu lực." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-12 whitespace-normal px-1 text-xs", variant: kind === "swap" ? "default" : "outline", onClick: () => setKind("swap"), children: "Đổi ca" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-12 whitespace-normal px-1 text-xs", variant: kind === "rest_exchange" ? "default" : "outline", onClick: () => setKind("rest_exchange"), children: "Đổi ngày nghỉ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-12 whitespace-normal px-1 text-xs", variant: kind === "emergency" ? "default" : "outline", onClick: () => setKind("emergency"), children: "Báo khẩn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: kind === "rest_exchange" ? "Ngày bạn đang nghỉ" : "Ngày của bạn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1 min-h-11", type: "date", value: date, onChange: (e) => setDate(e.target.value) })
        ] }),
        kind !== "emergency" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Đồng nghiệp nhận / đổi ca" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: classSelect + " mt-1", value: partner, onChange: (e) => setPartner(e.target.value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Chọn đồng nghiệp" }),
              roster.staff.filter((p) => p.id !== roster.actor_id).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.name }, p.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: kind === "rest_exchange" ? "Ngày đồng nghiệp đang nghỉ" : "Ngày ca của đồng nghiệp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1 min-h-11", type: "date", value: partnerDate, onChange: (e) => setPartnerDate(e.target.value) })
          ] })
        ] }),
        kind === "rest_exchange" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-900 dark:bg-sky-950 dark:text-sky-100", children: [
          "Đổi hai ngày nghỉ khác nhau ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "trong cùng một tuần" }),
          ". Hai người giữ đủ số ngày nghỉ; đồng nghiệp xác nhận, quản lý duyệt."
        ] }),
        kind === "emergency" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900", children: "Báo khẩn không cần người nhận trước. Quản lý phải xử lý thiếu ca; nếu xin nghỉ phép, vẫn làm đơn nghỉ theo quy định." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Lý do ",
            kind === "emergency" ? "(bắt buộc)" : "(tùy chọn)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1 min-h-11", value: reason, maxLength: 400, onChange: (e) => setReason(e.target.value), placeholder: "Nhập ngắn gọn..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-12 w-full", disabled: loading, onClick: () => void send(), children: "Gửi yêu cầu" })
      ] })
    ] }) })
  ] });
}
function Approvals({ roster, week, mutate, loading }) {
  const [day, setDay] = reactExports.useState(0);
  const [reason, setReason] = reactExports.useState("");
  const [lunchConfirmed, setLunchConfirmed] = reactExports.useState(false);
  const [lunchPlan, setLunchPlan] = reactExports.useState("staggered");
  const date = dateAdd(week, day);
  reactExports.useEffect(() => {
    setDay(0);
    setLunchConfirmed(false);
    setLunchPlan("staggered");
  }, [week, roster.store_id]);
  const pending = roster.changes.filter((c) => c.status === "pending_manager");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900", children: [
      pending.length,
      " yêu cầu đổi ca đang chờ duyệt. Mở mục ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Đổi ca" }),
      " để xử lý."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1.5", children: weekdays.map((dayName, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        "aria-pressed": i === day,
        onClick: () => setDay(i),
        className: `min-h-12 rounded-lg border text-xs font-semibold ${i === day ? "border-primary bg-primary/10" : "bg-card"}`,
        children: [
          dayName,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-muted-foreground", children: dateAdd(week, i).slice(-2) })
        ]
      },
      dayName
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
          weekdayFull[day],
          " · ",
          shiftDateLabel(date)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DayAlert, { item: roster.days[day], policy: roster.policy })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-3", children: roster.staff.map((person) => {
        const e = roster.entries.find((x) => x.date === date && x.staff_id === person.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate text-sm font-medium", children: person.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: classSelect + " max-w-[175px]",
              "aria-label": `Phân ca ${person.name}`,
              value: e?.assigned ?? e?.requested ?? "",
              disabled: loading || roster.week_status === "published",
              onChange: (ev) => void mutate("assign", { staff_id: person.id, date, shift: ev.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Chưa có" }),
                SHIFT_OPTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.value, children: s.label }, s.value))
              ]
            }
          )
        ] }, person.id);
      }) })
    ] }),
    roster.week_status === "published" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900", children: "Lịch đã công bố. Điều chỉnh tiếp theo phải qua yêu cầu đổi ca." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "roster-publish-note", children: "Lý do nếu có ngày phải dùng Ca Full / ngoại lệ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "roster-publish-note", value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Ghi rõ phương án xử lý thiếu ca...", maxLength: 500 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-semibold", children: [
          "Bố trí trực trưa ",
          roster.policy.noon_break_start,
          "–",
          roster.policy.noon_break_end
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: classSelect, value: lunchPlan, onChange: (e) => {
          setLunchPlan(e.target.value);
          setLunchConfirmed(false);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "staggered", children: "Hai người nghỉ trưa luân phiên" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "backup", children: "Có người hỗ trợ trực thay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mixed", children: "Kết hợp luân phiên và người hỗ trợ" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 text-sm leading-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: lunchConfirmed, onCheckedChange: (v) => setLunchConfirmed(v === true), className: "mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tôi xác nhận đã bố trí người trực giờ trưa cho mọi ngày mở cửa trong tuần." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-5 text-muted-foreground", children: "Nếu có ngày chỉ một người làm Ca Full, phải bố trí người hỗ trợ lúc nghỉ, không chọn nghỉ luân phiên. Hệ thống lưu xác nhận của quản lý." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-12 w-full", disabled: loading || !lunchConfirmed, onClick: () => void mutate("publish", { reason, lunch_confirmed: lunchConfirmed, lunch_plan: lunchPlan }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "mr-2 h-4 w-4" }),
        "Chốt & công bố lịch tuần"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-5 text-muted-foreground", children: "Cần đủ lịch 7 ngày của mọi nhân viên, đúng định mức nghỉ và người trực giờ trưa. Nếu thiếu Ca 1/Ca 2 phải xử lý hoặc ghi rõ lý do ngoại lệ Ca Full." })
    ] })
  ] });
}
function PolicySettings({ roster, mutate, loading }) {
  const [form, setForm] = reactExports.useState(roster.policy);
  const [holidays, setHolidays] = reactExports.useState(roster.policy.holidays.join(", "));
  const [reason, setReason] = reactExports.useState("Điều chỉnh chính sách lịch trực");
  reactExports.useEffect(() => {
    setForm(roster.policy);
    setHolidays(roster.policy.holidays.join(", "));
  }, [roster.policy, roster.store_id]);
  const update = (key, value) => setForm((x) => ({ ...x, [key]: value }));
  const weekdaysOptions = weekdays.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: i + 1, children: weekdayFull[i] }, i));
  const field = (title, dayKey, timeKey) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: classSelect, value: form[dayKey], onChange: (e) => update(dayKey, Number(e.target.value)), children: weekdaysOptions }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", className: "h-11", value: form[timeKey], onChange: (e) => update(timeKey, e.target.value) })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3 text-xs text-muted-foreground", children: [
      "Chính sách phiên bản ",
      roster.policy_version,
      ". Thời hạn đăng ký áp dụng cho ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "tuần kế tiếp" }),
      ", giờ Việt Nam. Lịch đã công bố không tự thay đổi."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold", children: "Đăng ký lịch tuần" }),
      field("Bắt đầu mở đăng ký", "open_day", "open_time"),
      field("Khóa đăng ký", "close_day", "close_time"),
      field("Hạn công bố lịch", "publish_day", "publish_time")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold", children: "Định mức và ngày nghỉ" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [{ key: "min_early", label: "Tối thiểu Ca 1", max: 10 }, { key: "min_late", label: "Tối thiểu Ca 2", max: 10 }, { key: "rest_days", label: "Nghỉ / tuần", max: 3 }].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: x.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-11", type: "number", min: x.key === "rest_days" ? 0 : 1, max: x.max, value: form[x.key], onChange: (e) => update(x.key, Number(e.target.value)) })
      ] }, x.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 rounded-lg border p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.allow_full_exception, onCheckedChange: (v) => update("allow_full_exception", v === true) }),
        "Cho xét ngoại lệ Ca Full khi thiếu người (phải ghi lý do)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 rounded-lg border p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.remind, onCheckedChange: (v) => update("remind", v === true) }),
        "Đốm nhắc đăng ký ca khi mở và trước hạn khóa"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold", children: "Khung giờ ca (24 giờ)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [{ key: "early_start", label: "Ca 1 bắt đầu" }, { key: "early_end", label: "Ca 1 kết thúc" }, { key: "late_start", label: "Ca 2 bắt đầu" }, { key: "late_end", label: "Ca 2 kết thúc" }, { key: "noon_break_start", label: "Nghỉ trưa từ" }, { key: "noon_break_end", label: "Nghỉ trưa đến" }, { key: "open_store", label: "Showroom mở" }, { key: "close_store", label: "Showroom đóng" }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-11", type: "time", value: form[f.key], onChange: (e) => update(f.key, e.target.value) })
      ] }, f.key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ngày nghỉ lễ (YYYY-MM-DD, ngăn bởi dấu phẩy)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: holidays, onChange: (e) => setHolidays(e.target.value), placeholder: "2027-01-01, 2027-..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cần cập nhật theo lịch nghỉ lễ, nghỉ bù thực tế từng năm. Không tự suy đoán ngày nghỉ." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lý do thay đổi chính sách" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: reason, onChange: (e) => setReason(e.target.value), maxLength: 300 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "h-12 w-full", disabled: loading || reason.trim().length < 4, onClick: () => void mutate("save_policy", { config: { ...form, holidays: holidays.split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean) }, reason }), children: "Lưu chính sách" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mọi thay đổi có phiên bản, thời điểm và người sửa. Chỉ người được cấp Role cài đặt mới lưu được." })
    ] })
  ] });
}
function ShiftRosterPage() {
  const { user, can, isSuperAdmin } = useCurrentUser();
  const queryClient = useQueryClient();
  const [week, setWeek] = reactExports.useState(upcomingWeek);
  const [store, setStore] = reactExports.useState("");
  const [view, setView] = reactExports.useState("mine");
  const [dialog, setDialog] = reactExports.useState(false);
  const [pickDate, setPickDate] = reactExports.useState(dateAdd(upcomingWeek(), 0));
  const active = !!user && user.status === "Đang hoạt động" && (isSuperAdmin || can("showroom.shift.view") || can("showroom.shift.view_all"));
  const overview = useQuery({ queryKey: ["showroom-roster-stores", user?.id], queryFn: readShowroomRosterStores, enabled: active, staleTime: 6e4, retry: 1 });
  reactExports.useEffect(() => {
    const stores = overview.data?.stores ?? [];
    if (stores.length && !stores.some((s) => s.id === store)) setStore(stores[0].id);
  }, [overview.data, store]);
  const data = useQuery({ queryKey: ["showroom-roster", user?.id, store, week], queryFn: () => readShowroomRoster(store, week), enabled: active && !!store, staleTime: 1e4, retry: 1, refetchOnWindowFocus: true });
  const mutation = useMutation({ mutationFn: ({ action, payload }) => showroomRosterAction(store, week, action, payload) });
  const doAction = async (action, payload) => {
    try {
      const result = await mutation.mutateAsync({ action, payload });
      toast.success(result.message || "Đã cập nhật.");
      await queryClient.invalidateQueries({ queryKey: ["showroom-roster", user?.id, store] });
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chưa cập nhật được lịch.");
      return false;
    }
  };
  const roster = data.data;
  const sections = reactExports.useMemo(() => {
    const base = [
      { id: "mine", label: "Lịch của tôi", icon: CalendarDays },
      { id: "team", label: "Lịch cửa hàng", icon: Users },
      { id: "changes", label: "Đổi ca", icon: ArrowLeftRight }
    ];
    if (roster?.can_approve) base.push({ id: "approve", label: "Duyệt lịch", icon: ClipboardCheck });
    if (roster?.can_settings) base.push({ id: "settings", label: "Cài đặt", icon: Settings2 });
    return base;
  }, [roster?.can_approve, roster?.can_settings]);
  const currentView = sections.some((s) => s.id === view) ? view : "mine";
  const showSwap = (o, date) => {
    if (date) setPickDate(date);
    setDialog(o);
    if (o) setView("changes");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto min-w-0 max-w-5xl space-y-4 pb-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Lịch trực Showroom", description: "Tự đăng ký · Cùng cân ca · Quản lý chốt lịch" }),
    !active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-xl border p-5 text-sm", children: "Tài khoản chưa được cấp quyền Lịch trực Showroom. Kiểm tra Role vị trí trong Cơ cấu tổ chức." }),
    active && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        overview.data && overview.data.stores.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[210px] flex-1 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cửa hàng" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: classSelect, value: store, onChange: (e) => {
            setStore(e.target.value);
            setView("mine");
          }, children: overview.data.stores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.name }, s.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-[205px] flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WeekButtons, { week, setWeek }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "h-11", disabled: data.isFetching, onClick: () => void data.refetch(), children: [
          data.isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Clock3, { className: "mr-2 h-4 w-4" }),
          "Làm mới"
        ] })
      ] }),
      overview.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border p-6 text-sm text-muted-foreground", children: "Đang tải cửa hàng của bạn..." }),
      overview.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-xl border border-destructive p-4 text-sm", children: overview.error.message }),
      data.isPending && store && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl border bg-card p-5 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        "Đang tải lịch tuần..."
      ] }),
      data.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "space-y-2 rounded-xl border border-destructive/50 p-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Không tải được lịch: ",
          data.error.message
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => void data.refetch(), children: "Thử lại" })
      ] }),
      roster && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: overview.data?.stores.find((s) => s.id === store)?.name ?? "Showroom" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: roster.week_status === "published" ? "default" : "secondary", children: roster.week_status === "published" ? "Đã công bố" : "Chưa chốt" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", role: "tablist", "aria-label": "Chức năng lịch trực", children: sections.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": currentView === x.id,
            onClick: () => setView(x.id),
            className: `inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium ${currentView === x.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(x.icon, { className: "h-4 w-4" }),
              x.label
            ]
          },
          x.id
        )) }),
        currentView === "mine" && /* @__PURE__ */ jsxRuntimeExports.jsx(Registration, { roster, week, mutate: doAction, loading: mutation.isPending, onChange: showSwap }),
        currentView === "team" && /* @__PURE__ */ jsxRuntimeExports.jsx(TeamSchedule, { roster, week }),
        currentView === "changes" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePanel, { roster, week, mutate: doAction, loading: mutation.isPending, open: dialog, onOpenChange: setDialog, pickDate }),
        currentView === "approve" && roster.can_approve && /* @__PURE__ */ jsxRuntimeExports.jsx(Approvals, { roster, week, mutate: doAction, loading: mutation.isPending }),
        currentView === "settings" && roster.can_settings && /* @__PURE__ */ jsxRuntimeExports.jsx(PolicySettings, { roster, mutate: doAction, loading: mutation.isPending }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Cần hướng dẫn đăng ký, đổi ca hay duyệt lịch?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HelpButton, { question: currentView === "settings" ? "Hướng dẫn cài đặt chính sách lịch trực Showroom" : currentView === "changes" ? "Hướng dẫn đổi ca trực Showroom khi đã chốt lịch" : currentView === "approve" ? "Hướng dẫn quản lý duyệt và công bố lịch trực Showroom" : "Hướng dẫn đăng ký lịch trực Showroom tuần sau trên điện thoại" })
        ] })
      ] })
    ] })
  ] });
}
const SplitComponent = ShiftRosterPage;
export {
  SplitComponent as component
};
