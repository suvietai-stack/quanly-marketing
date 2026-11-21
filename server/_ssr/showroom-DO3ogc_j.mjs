import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useCurrentUser, P as PageHeader, B as Button, C as Card, O as CardHeader, Q as CardTitle, o as CardContent, l as Badge } from "./router-CkmTURa-.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/sonner.mjs";
import { I as CalendarDays, p as ClipboardList, aC as RefreshCw, D as Store, w as Users, a7 as ShieldCheck, J as Building2 } from "../_libs/lucide-react.mjs";
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
async function showroomOverviewRead() {
  const { data, error } = await supabase.rpc("showroom_overview_read");
  if (error) throw new Error(error.message);
  return data;
}
function ShowroomPage() {
  const {
    user,
    can,
    isSuperAdmin
  } = useCurrentUser();
  const authorized = !!user && user.status === "Đang hoạt động" && (isSuperAdmin || can("showroom.view"));
  const query = useQuery({
    queryKey: ["showroom-overview", user?.id],
    queryFn: showroomOverviewRead,
    enabled: authorized,
    staleTime: 3e4,
    retry: 1
  });
  const overview = query.data;
  const canEditOrg = isSuperAdmin || can("org.assign_staff") || can("org.appoint_manager") || can("org.manage_structure");
  const canUseK3 = isSuperAdmin || can("showroom.k3.use");
  const canUseShifts = isSuperAdmin || can("showroom.shift.view");
  if (!authorized) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Khối Showroom", description: "Hệ thống quản lý bán lẻ Sứ Việt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "rounded-xl border bg-card p-6 text-sm text-muted-foreground", children: "Tài khoản chưa có quyền vào phân hệ Showroom. Quyền được cấp theo vị trí trong Cơ cấu tổ chức." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-6 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Khối Showroom", description: "Phân hệ bán lẻ độc lập với Khối Kinh doanh" }),
      canUseShifts && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/showroom/shifts", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "mr-2 h-4 w-4" }),
        "Lịch trực"
      ] }) }),
      canUseK3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/showroom/3k", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "mr-2 h-4 w-4" }),
        "Mở 3K Showroom"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => query.refetch(), disabled: query.isFetching, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `mr-2 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}` }),
        "Làm mới"
      ] })
    ] }),
    query.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "status", className: "rounded-xl border bg-card p-8 text-muted-foreground", children: "Đang tải dữ liệu Showroom từ Cơ cấu tổ chức…" }),
    query.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "alert", className: "rounded-xl border border-destructive/30 bg-card p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Chưa tải được dữ liệu Showroom" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: query.error.message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => query.refetch(), children: "Thử lại" })
    ] }),
    overview && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { className: "h-4 w-4" }),
            "Cửa hàng"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold tabular-nums", children: overview.store_count }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
            "Nhân sự"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold tabular-nums", children: overview.staff_count }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
            "Phạm vi xem"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-semibold", children: overview.scope === "company" ? "Toàn Khối Showroom" : overview.scope === "unit" ? "Cửa hàng phụ trách" : "Cửa hàng của tôi" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "showroom-list-heading", className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "showroom-list-heading", className: "text-lg font-semibold", children: "Hệ Bán Lẻ · Danh sách cửa hàng" }),
          canEditOrg && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/organization", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "mr-2 h-4 w-4" }),
            "Cơ cấu & bổ nhiệm"
          ] }) })
        ] }),
        overview.stores.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-6 text-sm text-muted-foreground", children: "Chưa tìm thấy cửa hàng thuộc phạm vi được phân công." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 lg:grid-cols-2", children: overview.stores.map((store) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { className: "h-5 w-5 text-primary" }),
                store.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Đang hoạt động" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              store.staff_count,
              " nhân sự · ",
              store.manager_count > 0 ? `${store.manager_count} cửa hàng trưởng` : "Chưa bổ nhiệm cửa hàng trưởng"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-sm font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
              overview.scope === "own" ? "Vị trí của tôi" : "Nhân sự cửa hàng"
            ] }),
            store.staff.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có nhân sự." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y rounded-lg border", children: store.staff.map((person) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-3 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 truncate text-sm font-medium", children: person.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-muted-foreground", children: person.position })
            ] }, person.id)) })
          ] })
        ] }, store.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl border bg-muted/30 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Giai đoạn 1 — Cơ cấu và nhân sự Showroom" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Dữ liệu cửa hàng, vị trí và nhân viên lấy trực tiếp từ cơ cấu tổ chức. Các nghiệp vụ bán lẻ chuyên biệt như POS, tồn kho và báo cáo doanh thu sẽ được triển khai ở giai đoạn tiếp theo; hiện chưa có dữ liệu bán hàng trong phân hệ này." })
      ] })
    ] })
  ] });
}
export {
  ShowroomPage as component
};
