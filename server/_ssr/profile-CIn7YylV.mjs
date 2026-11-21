import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { F as useAuth, P as PageHeader, B as Button, L as Label, I as Input, C as Card, o as CardContent } from "./router-CkmTURa-.mjs";
import { i as isFakeEmail } from "./auth-errors-CN_iHaBn.mjs";
import { u as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { C as CommunityFeed } from "./CommunityFeed-BfVnEziG.mjs";
import { C as ChangePasswordForm } from "./ChangePasswordForm-da5YiEvA.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CeCgkx-c.mjs";
import "../_libs/seroval.mjs";
import { a8 as UserRound, o as MessagesSquare, a9 as LoaderCircle, Q as Camera, ao as Pencil, a7 as ShieldCheck, m as Save, b5 as Mail } from "../_libs/lucide-react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "./states-C0pL4afS.mjs";
import "./textarea-BGZgnbbj.mjs";
import "./api-DcMIOSaq.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
const sections = [
  { title: "Về bản thân", fields: [["displayName", "Tên hiển thị"], ["headline", "Một câu về bạn"], ["bio", "Giới thiệu bản thân", "textarea"], ["birthday", "Ngày sinh", "date"], ["gender", "Giới tính"], ["hometown", "Quê quán"], ["city", "Nơi đang sống"]] },
  { title: "Thông tin liên hệ", fields: [["phone", "Số điện thoại", "tel"], ["contactEmail", "Email liên hệ", "email"], ["address", "Địa chỉ"], ["emergencyName", "Người liên hệ khẩn cấp"], ["emergencyPhone", "Số điện thoại khẩn cấp", "tel"]] },
  { title: "Kỹ năng & sở thích", fields: [["skills", "Kỹ năng chuyên môn", "textarea"], ["education", "Học vấn"], ["interests", "Sở thích"], ["goals", "Mục tiêu cá nhân", "textarea"]] },
  { title: "Kết nối với bạn", fields: [["facebook", "Facebook", "url"], ["zalo", "Zalo (số điện thoại hoặc liên kết)"], ["linkedin", "LinkedIn", "url"], ["website", "Website cá nhân", "url"]] }
];
function parseDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, val]) => sections.some((s) => s.fields.some((f) => f[0] === key)) && typeof val === "string"));
}
async function prepareAvatar(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error("Chọn ảnh JPG, PNG hoặc WebP dưới 8 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 384;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Thiết bị chưa xử lý được ảnh này.");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 384, 384);
    const side = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 384, 384);
    const result = canvas.toDataURL("image/jpeg", 0.8);
    if (result.length > 3e5) throw new Error("Ảnh quá lớn. Vui lòng chọn ảnh khác.");
    return result;
  } finally {
    URL.revokeObjectURL(url);
  }
}
function PersonalProfile({ userId, fullName }) {
  const cache = useQueryClient();
  const [draft, setDraft] = reactExports.useState();
  const [saving, setSaving] = reactExports.useState(false);
  const [processing, setProcessing] = reactExports.useState(false);
  const fileInput = reactExports.useRef(null);
  const profile = useQuery({ queryKey: ["personal-profile", userId], queryFn: async ({ signal }) => {
    const { data, error } = await supabase.from("personal_profiles").select("details,avatar").eq("user_id", userId).abortSignal(signal).maybeSingle();
    if (error) throw error;
    return { details: parseDetails(data?.details), avatar: data?.avatar ?? "" };
  }, retry: 1 });
  const current = draft ?? profile.data ?? { details: {}, avatar: "" };
  const title = current.details.displayName || fullName;
  const save = async (e) => {
    e.preventDefault();
    if (!draft || saving || processing) return;
    setSaving(true);
    try {
      const details = Object.fromEntries(Object.entries(draft.details).map(([k, v]) => [k, v.trim()]));
      const { data, error } = await supabase.from("personal_profiles").upsert({ user_id: userId, details, avatar: draft.avatar }).select("details,avatar").single();
      if (error) throw error;
      cache.setQueryData(["personal-profile", userId], { details: parseDetails(data.details), avatar: data.avatar });
      setDraft(void 0);
      toast.success("Đã lưu hồ sơ cá nhân");
    } catch {
      toast.error("Chưa lưu được hồ sơ. Thông tin đang nhập vẫn được giữ lại, hãy thử lại.");
    } finally {
      setSaving(false);
    }
  };
  if (profile.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", className: "p-8 text-center text-muted-foreground", children: "Đang tải hồ sơ…" });
  if (profile.isError) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "rounded-2xl border p-5", children: [
    "Chưa tải được hồ sơ. ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => profile.refetch(), children: "Thử lại" })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "space-y-5 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-3xl border bg-card shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 bg-gradient-to-br from-[#102d54] via-[#184d77] to-[#197580]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative -mt-11 h-24 w-24 shrink-0 rounded-3xl border-4 border-card bg-muted shadow-sm", children: [
            current.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: current.avatar, alt: `Ảnh đại diện ${title}`, className: "h-full w-full rounded-[20px] object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-full w-full p-5 text-primary" }),
            draft && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", className: "absolute -bottom-2 -right-2 h-10 w-10 rounded-full", disabled: processing || saving, "aria-label": "Đổi ảnh đại diện", onClick: () => fileInput.current?.click(), children: processing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }) })
          ] }),
          !draft && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "min-h-11 rounded-xl", onClick: () => setDraft({ details: { ...current.details }, avatar: current.avatar }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
            "Chỉnh sửa"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-2xl font-bold break-words", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground break-words", children: current.details.headline || "Chia sẻ đôi điều về bạn với Base Sứ Việt" }),
        current.details.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 whitespace-pre-wrap break-words text-sm leading-6", children: current.details.bio }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 shrink-0 mt-0.5" }),
          "Hồ sơ riêng tư — hiện chỉ bạn xem và chỉnh sửa. Tên hiển thị tại đây không đổi tên trong hồ sơ nhân sự."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInput, type: "file", accept: "image/jpeg,image/png,image/webp", className: "hidden", "aria-label": "Chọn ảnh đại diện", onChange: async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file || !draft) return;
          setProcessing(true);
          try {
            const avatar = await prepareAvatar(file);
            setDraft((prev) => prev ? { ...prev, avatar } : prev);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Không xử lý được ảnh.");
          } finally {
            setProcessing(false);
          }
        } }),
        draft && current.avatar && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", disabled: saving || processing, className: "mt-2 min-h-11", onClick: () => setDraft((prev) => prev ? { ...prev, avatar: "" } : prev), children: "Gỡ ảnh đại diện" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("fieldset", { disabled: saving, className: "space-y-5 min-w-0", children: sections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 font-semibold", children: section.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: section.fields.map(([key, label, type = "text"]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `min-w-0 space-y-2 ${type === "textarea" ? "sm:col-span-2" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `personal-${key}`, className: "text-xs text-muted-foreground", children: label }),
        draft ? type === "textarea" ? /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { id: `personal-${key}`, maxLength: 2e3, rows: 3, className: "w-full rounded-xl border bg-background p-3 text-base", value: current.details[key] ?? "", onChange: (e) => setDraft({ ...draft, details: { ...draft.details, [key]: e.target.value } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `personal-${key}`, type, maxLength: 300, className: "min-h-11 rounded-xl text-base", value: current.details[key] ?? "", onChange: (e) => setDraft({ ...draft, details: { ...draft.details, [key]: e.target.value } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-words whitespace-pre-wrap text-sm leading-6", children: current.details[key] || "Chưa cập nhật" })
      ] }, key)) })
    ] }, section.title)) }),
    draft && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-end gap-3 rounded-2xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "min-h-11 rounded-xl", disabled: saving || processing, onClick: () => setDraft(void 0), children: "Hủy thay đổi" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "min-h-11 rounded-xl", disabled: saving || processing, children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        saving ? "Đang lưu…" : "Lưu hồ sơ"
      ] })
    ] })
  ] });
}
function RecoveryEmailCard() {
  const me = useAuth((s) => s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) : null);
  const reload = useAuth((s) => s.reload);
  const [email, setEmail] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const next = email.trim().toLowerCase();
    if (isFakeEmail(next)) {
      toast.error("Địa chỉ email nội bộ không nhận được thư. Vui lòng dùng email thật.");
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        email: next
      });
      if (error) {
        toast.error("Không gửi được thư xác minh. Vui lòng thử lại sau.");
        return;
      }
      toast.success("Đã gửi thư xác minh tới địa chỉ mới. Vui lòng mở hộp thư và bấm liên kết xác nhận.");
      setEmail("");
      await reload();
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "max-w-md space-y-4 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Email khôi phục" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs leading-relaxed text-muted-foreground", children: [
        "Email hiện tại: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: me?.email || "—" }),
        ". Email này dùng để nhận liên kết khôi phục mật khẩu. Khi đổi, hệ thống gửi thư xác minh tới địa chỉ mới — email chỉ đổi sau khi bạn xác nhận."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "recovery-email", children: "Email mới" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "recovery-email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "ban@congty.vn", required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", variant: "outline", disabled: loading, children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { "aria-hidden": "true", className: "mr-1.5 h-4 w-4 motion-safe:animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mr-1.5 h-4 w-4" }),
        loading ? "Đang gửi xác minh..." : "Gửi xác minh đổi email"
      ] })
    ] })
  ] }) });
}
function ProfilePage() {
  const me = useAuth((s) => s.users.find((u) => u.id === s.currentUserId));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Hồ sơ cá nhân", description: "Không gian của bạn: cập nhật hồ sơ, thông tin liên hệ và bảo mật tài khoản." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-4 grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "profile", className: "min-h-12 gap-2 rounded-xl border bg-card text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4" }),
          "Hồ sơ & bảo mật"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "posts", className: "min-h-12 gap-2 rounded-xl border bg-card text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesSquare, { className: "h-4 w-4" }),
          "Bài viết của tôi"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "profile", className: "space-y-6", children: [
        me && /* @__PURE__ */ jsxRuntimeExports.jsx(PersonalProfile, { userId: me.id, fullName: me.fullName }, me.id),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Bảo mật — Đổi mật khẩu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordForm, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Khôi phục tài khoản" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecoveryEmailCard, {})
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "posts", children: me && /* @__PURE__ */ jsxRuntimeExports.jsx(CommunityFeed, { mineOnly: true }) })
    ] }) })
  ] });
}
export {
  ProfilePage as component
};
