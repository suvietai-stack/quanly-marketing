import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { D as Dialog, x as DialogContent, A as DialogTitle, bc as DialogDescription, B as Button } from "./router-CkmTURa-.mjs";
import { c as chipiAssets } from "./states-C0pL4afS.mjs";
import { R as REWARD_CHECK_INTERVAL_MS, f as friendlyReward, m as mayCelebrate, r as rewardCheckDue, c as claimCelebration } from "./logic-CUzbxsuC.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { a4 as Star, S as Sparkles, a3 as Gift } from "../_libs/lucide-react.mjs";
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
function RewardPopup({ userId }) {
  const [reward, setReward] = reactExports.useState(null);
  const busy = reactExports.useRef(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    let live = true;
    let lastAttempt = 0;
    const check = async () => {
      const editing = Boolean(document.activeElement?.matches('input,textarea,[contenteditable="true"]'));
      const modal = Boolean(document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"]'));
      const now = Date.now();
      if (busy.current || !mayCelebrate(document.visibilityState === "visible", editing, modal) || !rewardCheckDue(lastAttempt, now)) return;
      lastAttempt = now;
      busy.current = true;
      try {
        const result = await claimCelebration();
        if (live && result.stars > 0) {
          setReward(result);
          void queryClient.invalidateQueries({ queryKey: ["sao", userId] });
        }
      } catch {
      } finally {
        busy.current = false;
      }
    };
    const timer = window.setInterval(check, REWARD_CHECK_INTERVAL_MS);
    const initial = window.setTimeout(check, 1800);
    const onVisible = () => {
      void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      live = false;
      clearInterval(timer);
      clearTimeout(initial);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, queryClient]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: Boolean(reward), onOpenChange: (open) => {
    if (!open) setReward(null);
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sao-reward-popup w-[calc(100%-32px)] max-w-md rounded-2xl bg-card text-center max-h-[calc(100dvh-32px)] overflow-y-auto gap-3 p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto h-52 w-52 sm:h-60 sm:w-60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: chipiAssets.celebrate.url, alt: "Đốm chúc mừng", className: "sao-celebrate h-full w-full object-contain" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "sao-spark sao-spark-one absolute left-0 top-9 h-7 w-7 text-warning fill-warning", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "sao-spark sao-spark-two absolute right-0 top-20 h-5 w-5 text-warning fill-warning", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "sao-spark absolute right-5 top-3 h-7 w-7 text-chipi-orange", "aria-hidden": true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-2xl", children: "Chúc mừng bạn! 🎉" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center items-center gap-2 text-4xl font-bold text-chipi-orange", children: [
      "+",
      reward?.stars.toLocaleString("vi-VN"),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-8 w-8 text-warning fill-warning", "aria-label": "Sao" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-center", children: reward?.rewards.length === 1 ? friendlyReward(reward.rewards[0]?.source ?? "") : `Bạn vừa nhận thưởng từ ${reward?.rewards.length ?? 0} thành tích!` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Cảm ơn bạn vì những nỗ lực và sự đóng góp cho Sứ Việt. Mỗi thành tích của bạn đều rất đáng trân trọng! 💙" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Sao hiện có: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-primary", children: reward?.balance.toLocaleString("vi-VN") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "min-h-11 mt-2", onClick: () => {
      setReward(null);
      void navigate({ to: "/sao/shop" });
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4" }),
      "Khám phá gian hàng"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "min-h-11", onClick: () => setReward(null), children: "Để sau" })
  ] }) });
}
export {
  RewardPopup
};
