import { c as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQueryClient, a as useQuery, q as queryOptions, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, b as useRouterState, O as Outlet, H as HeadContent, S as Scripts, d as createFileRoute, l as lazyRouteComponent, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { W as redirect, K as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { p as passwordIssues, a as authErrorMessage, i as isFakeEmail, b as accountAccess } from "./auth-errors-CN_iHaBn.mjs";
import { T as Toaster, t as toast } from "../_libs/sonner.mjs";
import { B as BrandingSync, u as useBranding, a as BrandMark } from "./branding-Bpuupoin.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { v as visibleNavigation, a as activeNavigationPath } from "./navigation-BcdDdvEu.mjs";
import { R as Root, P as Portal, C as Content, a as Close, T as Title, D as Description, O as Overlay, b as Trigger$3 } from "../_libs/radix-ui__react-dialog.mjs";
import { C as Checkbox$1, a as CheckboxIndicator } from "../_libs/radix-ui__react-checkbox.mjs";
import { V as VAPID_PUBLIC_KEY } from "./config-DnDqLpRb.mjs";
import { P as Portal$2, C as Content2$2, a as Provider, R as Root3, T as Trigger$2 } from "../_libs/radix-ui__react-tooltip.mjs";
import { R as Root$2 } from "../_libs/radix-ui__react-label.mjs";
import { R as Root$1, T as Thumb } from "../_libs/radix-ui__react-switch.mjs";
import { R as Root2$1, T as Trigger$1, P as Portal$1, C as Content2$1 } from "../_libs/radix-ui__react-popover.mjs";
import { CONTENT_LABEL, contentLink } from "./notifyMessage-DnoA8PJG.mjs";
import { ORDER_LABEL, orderLink } from "./notifyMessage-CLuxtttz.mjs";
import { OQ_LABEL, oqLink } from "./notify-CzSXyhJl.mjs";
import { R as Root2, T as Trigger, P as Portal2, C as Content2, L as Label2, S as Separator2, I as Item2, a as SubTrigger2, b as SubContent2, c as CheckboxItem2, d as ItemIndicator2, e as RadioItem2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { r as readAllPages, i as isTransientStoreRead } from "./storeRead-Ci9Vlcxx.mjs";
import { R as Root$3, I as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { timingSafeEqual } from "crypto";
import { U as User, L as LogOut, C as ClipboardCheck, P as PanelLeftOpen, a as PanelLeftClose, A as ArrowLeft, M as Menu, H as House, b as LayoutDashboard, c as MessageCircleHeart, B as Bell, d as CheckCheck, X, S as Sparkles, e as ArrowUpRight, f as Search, g as SlidersHorizontal, h as Pin, i as LayoutGrid, j as ArrowUp, k as ArrowDown, l as PinOff, m as Save, n as ChevronDown, o as MessagesSquare, R as Radar, p as ClipboardList, q as Check, E as EyeOff, r as Eye, s as ChevronRight, t as Circle } from "../_libs/lucide-react.mjs";
import { c as create } from "../_libs/zustand.mjs";
import { o as objectType, s as stringType, b as booleanType, n as numberType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/seroval.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/radix-ui__react-compose-refs.mjs";
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
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
function useServerFn(serverFn) {
  const router2 = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router2.stores.location.get();
        return router2.navigate(router2.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router2, serverFn]);
}
function createCoalescer(run) {
  let current = null;
  let trailing = null;
  const start = (key) => {
    const promise = run(key).finally(() => {
      if (current?.promise === promise) current = null;
    });
    current = { key, promise };
    return promise;
  };
  return {
    join(key) {
      if (current && current.key === key) return current.promise;
      return start(key);
    },
    refresh(key) {
      if (!current || current.key !== key) return start(key);
      if (trailing && trailing.key === key) return trailing.promise;
      const prev = current.promise;
      const promise = prev.catch(() => void 0).then(() => {
        trailing = null;
        return start(key);
      });
      trailing = { key, promise };
      return promise;
    }
  };
}
const ACCESS_MIN_GAP_MS = 6e4;
const ACCESS_MAX_STALE_MS = 10 * 6e4;
const body = (v) => JSON.stringify({ ...v, server_now: void 0 });
function shouldRefresh(lastVerifiedAt, now2, force = false) {
  return force || lastVerifiedAt === null || now2 - lastVerifiedAt >= ACCESS_MIN_GAP_MS;
}
function mergeAccess(prev, prevAt, uid2, result, now2) {
  if (!result.error && result.data && result.data.user_id === uid2) {
    const same = prev && prev.user_id === uid2 && body(prev) === body(result.data);
    return { value: same ? prev : result.data, verifiedAt: now2, failed: false };
  }
  const edge = prev?.next_transition_at ?? prev?.next_change;
  const boundary = edge ? Date.parse(edge) : Infinity;
  const keep = !isFatalAccessError(result.error) && !!prev && prev.user_id === uid2 && prevAt !== null && now2 - prevAt < ACCESS_MAX_STALE_MS && now2 < boundary;
  return { value: keep ? prev : null, verifiedAt: keep ? prevAt : null, failed: true };
}
function isFatalAccessError(e) {
  const x = e ?? {};
  return ["42501", "PGRST301", "PGRST302", "28000"].includes(String(x.code)) || x.status === 401 || x.status === 403 || /không có quyền|tạm khóa|not active|jwt expired/i.test(String(x.message ?? ""));
}
function authEventAction(event, prevUid, nextUid, ready) {
  if (!["INITIAL_SESSION", "SIGNED_IN", "SIGNED_OUT", "USER_UPDATED", "PASSWORD_RECOVERY"].includes(event)) return "ignore";
  if (!nextUid) return "clear";
  if (nextUid !== prevUid) return "load";
  if (event === "USER_UPDATED") return "reload";
  return ready ? "ignore" : "load";
}
const VERIFIED_APPOINTMENT_PERMISSIONS = [
  "leave.create",
  "leave.view_own",
  "leave.edit_own",
  "leave.recall",
  "leave.view_assigned",
  "leave.view_all",
  "leave.view_unit",
  "leave.approve",
  "leave.create_for",
  "leave.edit_others",
  "leave.cancel_handle",
  "leave.exception",
  "leave.reassign",
  "leave.report",
  "leave.export",
  "leave.settings",
  "att.create",
  "att.view_own",
  "att.edit_own",
  "att.witness",
  "att.manage",
  "att.reconcile",
  "att.report",
  "att.view_all",
  "att.settings",
  "order.view",
  "order.view_mine",
  "order.create",
  "order.take",
  "order.update_draft",
  "order.submit",
  "order.resubmit",
  "order.deliver",
  "order.history",
  "order.open_delivery",
  "order.approve",
  "order.assign",
  "order.edit",
  "order.complete",
  "order.cancel",
  "order.edit_reviewer",
  "order.report_view",
  "order.request_changes",
  "order.send_request",
  "order.view_all",
  "order.marketing_design.view",
  "order.marketing_design.view_all",
  "order.marketing_design.create",
  "order.marketing_design.send_request",
  "order.marketing_design.submit",
  "order.marketing_design.take",
  "order.marketing_design.update_draft",
  "order.marketing_design.resubmit",
  "order.marketing_design.deliver",
  "order.marketing_design.approve",
  "order.marketing_design.assign",
  "order.marketing_design.edit",
  "order.marketing_design.complete",
  "order.marketing_design.cancel",
  "order.marketing_design.edit_reviewer",
  "order.marketing_design.report_view",
  "order.marketing_design.request_changes",
  "oq.create",
  "oq.accept",
  "oq.reply_price",
  "oq.reply_progress",
  "oq.report_own",
  "oq.view_own",
  "oq.view_all",
  "oq.manage",
  "oq.report_all",
  "oq.report_export",
  "ot.view_own",
  "ot.view_unit",
  "ot.task_view",
  "ot.task_update",
  "ot.stage_update",
  "ot.accept",
  "ot.assign",
  "ot.create",
  "ot.manage",
  "ot.report",
  "ot.report_export",
  "ot.reschedule_propose",
  "ot.reschedule_reply",
  "ot.supplier",
  "ot.view_all",
  "finance.incoming.view",
  "finance.incoming.view_unit",
  "finance.incoming.view_totals",
  "finance.incoming.claim",
  "finance.incoming.reconcile",
  "finance.incoming.manual_view",
  "finance.incoming.manual_create",
  "finance.incoming.manual_manage",
  "finance.incoming.manage",
  "finance.incoming.remind",
  "signal.sale",
  "signal.report",
  "signal.reassign",
  "signal.view_all",
  "signal.assign",
  "signal.create",
  "signal.edit",
  "signal.manage",
  "signal.delete",
  "signal.catalog",
  "biz.crm_use",
  "biz.crm_access",
  "biz.crm_view_scope",
  "biz.crm_edit_other",
  "biz.crm_transfer",
  "biz.crm_archive",
  "biz.crm_export",
  "biz.crm_settings",
  "kpi.view_own",
  "overview.view",
  "overview.own_only",
  "settings.view"
];
function auditReasonLabel(reason) {
  const labels = { native_personal_verified: "Đã kiểm chứng điều kiện cá nhân/nghiệp vụ", appointment_only: "Giữ nguyên nguồn bổ nhiệm Kinh doanh", finance_unit_scope_missing: "Tài chính chưa giới hạn theo đơn vị bổ nhiệm", hr_unit_scope_missing: "Nhân sự chưa giới hạn quản lý/báo cáo/xuất theo đơn vị", order_unit_scope_missing: "Đơn hàng chưa giới hạn quản lý/xuất theo đơn vị", global_configuration: "Quyền quản trị toàn hệ thống — không tự cấp theo chức vụ", backend_scope_workflow_missing: "Chưa có rào phạm vi hoặc quy trình đầy đủ tại máy chủ" };
  return labels[reason] ?? "Chưa hoàn tất kiểm tra phạm vi";
}
const suggestions = {
  "Giám đốc Marketing": "Giám đốc Marketing",
  "Trưởng phòng Marketing": "Quản lý Marketing",
  "Trưởng nhóm Marketing": "Quản lý Marketing",
  "Trưởng phòng Thiết kế": "Quản lý Thiết kế",
  "Trưởng nhóm Thiết kế": "Quản lý Thiết kế",
  "Nhân viên Thiết kế": "Nhân viên Thiết kế",
  "Kế toán trưởng": "Kế toán trưởng",
  "Kế toán kho": "Kế toán kho",
  "Hành chính Nhân sự": "Hành Chính Nhân Sự",
  "Trưởng phòng Mua hàng & Giao vận": "Quản lý Mua hàng & Giao vận",
  "Nhân viên Thu mua": "Thu mua",
  "Nhân viên Đóng hàng": "Nhân viên Đóng hàng",
  "Nhân viên Kinh doanh": "Nhân viên Kinh doanh",
  "Trưởng Phòng": "Trưởng phòng Kinh doanh",
  "Trưởng Nhóm": "Nhân viên Kinh doanh",
  "Nhân viên Marketing": "Nhân viên Marketing",
  "Giám Đốc": "Viewer / Ban Giám Đốc",
  "Giám Đốc Điều hành": "Viewer / Ban Giám Đốc",
  "Phó Giám Đốc Điều hành": "Viewer / Ban Giám Đốc"
};
function suggestedRole(title, roles) {
  return roles.find((r) => !r.restricted && r.name === suggestions[title]);
}
const titleRolesApi = {
  async read() {
    const { data, error } = await supabase.rpc("base_title_roles_read");
    if (error) throw new Error(error.message);
    return data;
  },
  async save(source, title, roles, expected, reason) {
    throw new Error("Thiết lập Role đang chờ hoàn thiện xem trước tác động và xác nhận chung; quyền hiện tại giữ nguyên.");
  }
};
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const adminResetPassword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  userId: stringType().uuid(),
  newPassword: stringType().refine((v) => passwordIssues(v).length === 0, {
    message: "Mật khẩu cần 8–200 ký tự, gồm chữ cái và chữ số."
  })
}).parse(input)).handler(createSsrRpc("79601276ec2df3b2e9dcad47b4ed7ebfefbefcaa859d127fa88508231536995a"));
const adminDeleteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  userId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("31a227d85330f9572db4b774e1502fc43b2d31c80ce0c4b7e182ac4454c451ad"));
const usernameSignIn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  username: stringType().min(1).max(100),
  password: stringType().min(1).max(1e3)
}).parse(input)).handler(createSsrRpc("1c1631db9b5eddf142368f53bfce1e0be2764a4f225c30be7227d946837ee464"));
const accountAuthStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  userId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("0113de71819f21b546487ac041152e9ccd682d9020f7a79cc23481e9ead65686"));
const resendConfirmation = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: stringType().email().max(254),
  redirect: stringType().url()
}).parse(input)).handler(createSsrRpc("0c4a065752acd0ded8809738ee29ab185555dfe4bab2f41c61839887af1be525"));
const REMEMBER_KEY = "sv_remember";
const REMEMBER_SINCE_KEY = "sv_remember_since";
const TAB_ALIVE_KEY = "sv_tab_alive";
const REMEMBER_MAX_MS = 90 * 24 * 60 * 60 * 1e3;
function sessionPolicy(input) {
  if (input.tabAlive) return "keep";
  if (input.remember === "1") {
    return input.since > 0 && input.now - input.since > REMEMBER_MAX_MS ? "drop" : "keep";
  }
  if (input.remember === "0") return "drop";
  return "grandfather";
}
function writeRememberChoice(remember) {
  if (typeof window === "undefined") return;
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, "1");
      localStorage.setItem(REMEMBER_SINCE_KEY, String(Date.now()));
    } else {
      localStorage.setItem(REMEMBER_KEY, "0");
      localStorage.removeItem(REMEMBER_SINCE_KEY);
    }
    sessionStorage.setItem(TAB_ALIVE_KEY, "1");
  } catch {
  }
}
function readRememberChoice() {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(REMEMBER_KEY) !== "0";
  } catch {
    return true;
  }
}
let recoveryUserId = null;
const listeners$1 = /* @__PURE__ */ new Set();
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") recoveryUserId = session?.user.id ?? null;
  if (event === "SIGNED_OUT" || event === "SIGNED_IN") recoveryUserId = null;
  if (event === "PASSWORD_RECOVERY" || event === "SIGNED_OUT" || event === "SIGNED_IN") setTimeout(() => listeners$1.forEach((listener) => listener()), 0);
});
function onRecoveryChange(listener) {
  listeners$1.add(listener);
  return () => {
    listeners$1.delete(listener);
  };
}
async function hasRecoverySession() {
  if (!recoveryUserId) return false;
  const { data, error } = await supabase.auth.getUser();
  return !error && data.user?.id === recoveryUserId;
}
function clearRecoverySession() {
  recoveryUserId = null;
}
const P = (key, label, group, subGroup) => ({ key, label, group, subGroup });
const PERMISSIONS = [
  P("inbox.view", "Xem Hộp thư theo Page được cấp", "Hộp thư"),
  P("inbox.send", "Trả lời tin nhắn", "Hộp thư"),
  P("inbox.assign", "Phân công hội thoại", "Hộp thư"),
  P("inbox.resolve", "Đóng / mở lại hội thoại", "Hộp thư"),
  P("inbox.manage", "Quản lý quyền truy cập Page", "Hộp thư"),
  P("crm.database.view", "Xem toàn bộ database khách hàng CRM", "CRM Dữ liệu tổng"),
  P("biz.crm_use", "Sử dụng CRM cá nhân", "CRM Khách Hàng"),
  P("biz.crm_view_scope", "Xem CRM nhân viên trong phạm vi", "CRM Khách Hàng"),
  P("biz.crm_edit_other", "Sửa hộ khách trong phạm vi", "CRM Khách Hàng"),
  P("biz.crm_transfer", "Bàn giao khách trong phạm vi", "CRM Khách Hàng"),
  P("biz.crm_export", "Xuất dữ liệu CRM", "CRM Khách Hàng"),
  P("biz.crm_archive", "Lưu trữ và khôi phục khách", "CRM Khách Hàng"),
  P("crm.customer.delete", "Xóa khách chưa phát sinh nghiệp vụ", "CRM Khách Hàng"),
  P("biz.crm_settings", "Cài đặt danh mục CRM", "CRM Khách Hàng"),
  P("biz.crm_access", "Cấp quyền nghiệp vụ CRM", "CRM Khách Hàng"),
  P("sao.program_manage", "Quản lý chương trình thưởng Sao", "Sao Sứ Việt"),
  P("sao.shop_manage", "Quản lý quà và xác nhận phát quà", "Sao Sứ Việt"),
  P("sao.manual_grant", "Cộng Sao thủ công có lý do", "Sao Sứ Việt"),
  // ===== Quản trị Kinh doanh =====
  P("biz.view_own", "Xem dữ liệu cá nhân", "Quản trị Kinh doanh", "Xem"),
  P("biz.view_dept", "Xem dữ liệu phòng ban mình", "Quản trị Kinh doanh", "Xem"),
  P("biz.view_all", "Ngoại lệ xem hồ sơ chi tiết toàn Khối", "Quản trị Kinh doanh", "Xem"),
  P("biz.dashboard_public", "Xem Dashboard tổng hợp toàn Khối", "Quản trị Kinh doanh", "Xem"),
  P("biz.plan_submit", "Nộp kế hoạch kinh doanh", "Quản trị Kinh doanh", "Nộp"),
  P("biz.goal_submit", "Lập và gửi mục tiêu KR", "Quản trị Kinh doanh", "Nộp"),
  P("biz.report_submit", "Nộp báo cáo kinh doanh", "Quản trị Kinh doanh", "Nộp"),
  P("biz.plan_request_revision", "Yêu cầu chỉnh sửa kế hoạch", "Quản trị Kinh doanh", "Duyệt"),
  P("biz.plan_approve", "Duyệt kế hoạch (quy trình cũ)", "Quản trị Kinh doanh", "Duyệt"),
  P("biz.goal_approve", "Duyệt mục tiêu KR", "Quản trị Kinh doanh", "Duyệt"),
  P("biz.report_approve", "Duyệt báo cáo", "Quản trị Kinh doanh", "Duyệt"),
  P("biz.kr_manage", "Quản lý chỉ số KR", "Quản trị Kinh doanh", "Cài đặt"),
  P("biz.dept_manage", "Quản lý phòng ban kinh doanh", "Quản trị Kinh doanh", "Cài đặt"),
  P("biz.deadline_manage", "Quản lý deadline nộp", "Quản trị Kinh doanh", "Cài đặt"),
  P("biz.org_manage", "Quản lý cơ cấu tổ chức và phân công", "Quản trị Kinh doanh", "Cài đặt"),
  P("biz.workflow_manage", "Cấu hình quy trình phê duyệt", "Quản trị Kinh doanh", "Cài đặt"),
  P("biz.approval_view", "Xem Trung tâm Phê duyệt trong phạm vi", "Quản trị Kinh doanh", "Duyệt"),
  // ===== Quản lý 3K =====
  P("k3.use", "Lập và cập nhật 3K cá nhân", "Quản lý 3K", "Sử dụng"),
  P("k3.view_scope", "Xem 3K trong phạm vi quản lý", "Quản lý 3K", "Xem"),
  P("k3.comment", "Nhận xét 3K nhân viên", "Quản lý 3K", "Xem"),
  P("k3.settings", "Cấu hình module 3K", "Quản lý 3K", "Cài đặt"),
  // ===== A. Tổng Quan =====
  P("overview.view", "Xem Tổng Quan", "Tổng Quan", "Tổng quan"),
  P("overview.alerts", "Xem việc cần chú ý", "Tổng Quan", "Tổng quan"),
  P("overview.all_dept", "Xem việc của toàn phòng", "Tổng Quan", "Tổng quan"),
  P("overview.own_only", "Chỉ xem việc liên quan đến mình", "Tổng Quan", "Tổng quan"),
  P("overview.brand_summary", "Thống kê theo thương hiệu", "Tổng Quan", "Thống kê"),
  P("overview.module_summary", "Thống kê theo module", "Tổng Quan", "Thống kê"),
  P("overview.staff_summary", "Thống kê theo người phụ trách", "Tổng Quan", "Thống kê"),
  // ===== B. Task =====
  P("task.view", "Xem task", "Task", "Dữ liệu"),
  P("task.view_all", "Xem tất cả task", "Task", "Dữ liệu"),
  P("task.view_mine", "Chỉ xem task liên quan đến mình", "Task", "Dữ liệu"),
  P("task.view_created_by_me", "Xem task tôi giao", "Task", "Dữ liệu"),
  P("task.create", "Tạo task", "Task", "CRUD"),
  P("task.edit", "Sửa task", "Task", "CRUD"),
  P("task.delete", "Xóa task", "Task", "CRUD"),
  P("task.assign", "Giao task", "Task", "CRUD"),
  P("task.edit_assignee", "Sửa người phụ trách task", "Task", "CRUD"),
  P("task.edit_deadline", "Sửa deadline task", "Task", "CRUD"),
  P("task.edit_priority", "Sửa mức ưu tiên task", "Task", "CRUD"),
  // Legacy keys kept for backward compatibility
  P("task.accept", "Nhận task (legacy)", "Task", "Workflow"),
  P("task.update_status", "Cập nhật trạng thái task (legacy)", "Task", "Workflow"),
  P("task.complete", "Hoàn thành task (legacy)", "Task", "Workflow"),
  // New workflow keys
  P("task.start", "Bắt đầu làm task", "Task", "Workflow"),
  P("task.update_result", "Cập nhật kết quả task", "Task", "Workflow"),
  P("task.submit_completion", "Gửi hoàn thành task", "Task", "Workflow"),
  P("task.resubmit_completion", "Gửi lại hoàn thành task", "Task", "Workflow"),
  P("task.approve_completion", "Xác nhận hoàn thành task", "Task", "Workflow"),
  P("task.request_revision", "Yêu cầu sửa task", "Task", "Workflow"),
  P("task.cancel", "Hủy task", "Task", "Workflow"),
  P("task.restore", "Khôi phục task đã hủy", "Task", "Workflow"),
  P("task.reopen_completed", "Mở lại task đã hoàn thành", "Task", "Workflow"),
  P("task.force_status", "Ép chuyển trạng thái task", "Task", "Workflow"),
  P("task.force_change_status", "Ép chuyển trạng thái task (alias)", "Task", "Workflow"),
  P("task.view_history", "Xem lịch sử xử lý task", "Task", "Lịch sử"),
  P("task.add_note", "Ghi chú xử lý task", "Task", "Lịch sử"),
  // ===== C. Thương Hiệu =====
  P("brand.view", "Xem thương hiệu", "Thương Hiệu", "Dữ liệu"),
  P("brand.view_all", "Xem tất cả thương hiệu", "Thương Hiệu", "Dữ liệu"),
  P("brand.create", "Tạo thương hiệu", "Thương Hiệu", "CRUD"),
  P("brand.edit", "Sửa thương hiệu", "Thương Hiệu", "CRUD"),
  P("brand.delete", "Xóa thương hiệu", "Thương Hiệu", "CRUD"),
  P("brand.profile", "Quản lý hồ sơ thương hiệu", "Thương Hiệu", "Quản lý"),
  P("brand.identity", "Quản lý nhận diện thương hiệu", "Thương Hiệu", "Quản lý"),
  P("brand.view_channels", "Quản lý kênh liên kết", "Thương Hiệu", "Quản lý"),
  P("brand.docs", "Quản lý tài liệu/guideline", "Thương Hiệu", "Quản lý"),
  P("brand.staff", "Quản lý nhân sự phụ trách", "Thương Hiệu", "Quản lý"),
  P("brand.contact", "Quản lý thông tin liên hệ", "Thương Hiệu", "Quản lý"),
  P("brand.notes", "Quản lý ghi chú vận hành", "Thương Hiệu", "Quản lý"),
  // ===== D. Dự Án Web =====
  // D1. Chung
  P("web.view", "Xem dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.view_all", "Xem tất cả dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.view_mine", "Chỉ xem dự án web liên quan đến mình", "Dự Án Web", "D1. Dự án chung"),
  P("web.create", "Tạo dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.edit", "Sửa dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.delete", "Xóa dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.open_detail", "Mở chi tiết dự án web", "Dự Án Web", "D1. Dự án chung"),
  P("web.manage_info", "Quản lý thông tin dự án", "Dự Án Web", "D1. Dự án chung"),
  P("web.assign_seo", "Gán người phụ trách SEO", "Dự Án Web", "D1. Dự án chung"),
  P("web.assign_content", "Gán người phụ trách Content", "Dự Án Web", "D1. Dự án chung"),
  P("web.assign_tech", "Gán người phụ trách kỹ thuật", "Dự Án Web", "D1. Dự án chung"),
  // D2. Technical SEO
  P("web.tech_view", "Xem Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_check", "Tích checklist Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_edit_desc", "Sửa diễn giải checklist", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_reset", "Reset checklist Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  P("web.tech_template", "Quản lý template checklist Technical SEO", "Dự Án Web", "D2. Technical SEO"),
  // D3. Entity / Social SEO
  P("web.entity_view", "Xem Entity / Social SEO", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_create", "Thêm Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_edit", "Sửa Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_delete", "Xóa Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_open_link", "Mở link Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_view_account", "Xem thông tin tài khoản Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  P("web.entity_reveal_password", "Xem mật khẩu Entity", "Dự Án Web", "D3. Entity / Social SEO"),
  // D4. Keyword research
  P("web.keyword_view", "Xem Nghiên Cứu Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_topic_create", "Tạo Topic Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_topic_edit", "Sửa Topic Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_topic_delete", "Xóa Topic Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_open_sheet", "Mở Link Sheet Keyword", "Dự Án Web", "D4. Keyword"),
  P("web.keyword_manage_sheet", "Quản lý Link Sheet Keyword", "Dự Án Web", "D4. Keyword"),
  // D5. Content Web — dữ liệu
  P("web.content_view", "Xem Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_view_all", "Xem tất cả Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_view_mine", "Chỉ xem Content Web liên quan", "Dự Án Web", "D5. Content Web"),
  P("web.content_create", "Tạo content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit", "Sửa content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_delete", "Xóa content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_assign", "Giao content web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_brief", "Sửa brief Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_deadline", "Sửa deadline Content Web", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_writer", "Sửa người viết", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_outline_reviewer", "Sửa người duyệt outline", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_article_reviewer", "Sửa người duyệt bài", "Dự Án Web", "D5. Content Web"),
  P("web.content_edit_publisher", "Sửa người đăng web", "Dự Án Web", "D5. Content Web"),
  // D5. Content Web — workflow
  P("web.outline_start", "Bắt đầu làm outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_submit", "Gửi duyệt outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_approve", "Duyệt outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_reject", "Yêu cầu sửa outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.outline_resubmit", "Gửi duyệt lại outline", "Dự Án Web", "D5. Workflow Outline"),
  P("web.post_write_start", "Bắt đầu viết bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_submit", "Gửi duyệt bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_approve", "Duyệt bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_reject", "Yêu cầu sửa bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.post_resubmit", "Gửi duyệt lại bài", "Dự Án Web", "D5. Workflow Bài"),
  P("web.move_pending_publish", "Chuyển sang chờ đăng", "Dự Án Web", "D5. Workflow Bài"),
  // D5. Duyệt bản nháp web
  P("web.view_web_draft_url", "Xem link bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.edit_web_draft_url", "Chỉnh link bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.start_web_draft_layout", "Bắt đầu trình bày nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.submit_web_draft_review", "Gửi duyệt bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.resubmit_web_draft_review", "Gửi duyệt lại bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.approve_web_draft", "Duyệt bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.request_web_draft_revision", "Yêu cầu sửa bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.view_web_draft_revision_note", "Xem ghi chú sửa bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.edit_web_draft_note", "Sửa ghi chú bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.force_change_web_draft_status", "Ép chuyển trạng thái bản nháp web", "Dự Án Web", "D5. Duyệt bản nháp web"),
  P("web.publish", "Xác nhận đã đăng web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.complete", "Hoàn thành Content Web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.content_cancel", "Hủy Content Web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.content_restore", "Khôi phục Content Web đã hủy", "Dự Án Web", "D5. Workflow Bài"),
  P("web.force_status", "Ép chuyển trạng thái Content Web", "Dự Án Web", "D5. Workflow Bài"),
  P("web.content_history", "Xem lịch sử xử lý Content Web", "Dự Án Web", "D5. Lịch sử"),
  P("web.content_note", "Ghi chú xử lý Content Web", "Dự Án Web", "D5. Lịch sử"),
  // D6. Index / Share Social
  P("web.index_view", "Xem Bài đã đăng / Index", "Dự Án Web", "D6. Index"),
  P("web.update_index", "Cập nhật trạng thái index", "Dự Án Web", "D6. Index"),
  P("web.update_share", "Cập nhật Share Social", "Dự Án Web", "D6. Index"),
  P("web.update_share_date", "Cập nhật ngày share social", "Dự Án Web", "D6. Index"),
  P("web.select_shared_entity", "Chọn Entity đã share", "Dự Án Web", "D6. Index"),
  P("web.edit_published_url", "Sửa link bài đã đăng", "Dự Án Web", "D6. Index"),
  P("web.open_published_url", "Mở link bài đã đăng", "Dự Án Web", "D6. Index"),
  // D7. Backlink / PR
  P("web.backlink_view", "Xem Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_create", "Thêm Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_edit", "Sửa Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_delete", "Xóa Backlink / PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_status", "Cập nhật trạng thái Backlink", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_open", "Mở link bài PR", "Dự Án Web", "D7. Backlink"),
  P("web.backlink_cost", "Quản lý chi phí Backlink", "Dự Án Web", "D7. Backlink"),
  // D8. Check TOP
  P("web.checktop_view", "Xem Check TOP", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_primary", "Cập nhật TOP từ khóa chính", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_secondary", "Cập nhật TOP từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_kw_create", "Thêm từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_kw_edit", "Sửa từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_kw_delete", "Xóa từ khóa phụ", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_open_url", "Mở URL đích", "Dự Án Web", "D8. Check TOP"),
  P("web.checktop_filter_topic", "Lọc/check theo Topic", "Dự Án Web", "D8. Check TOP"),
  // D9. Tối ưu lại Content
  P("web.reopt_view", "Xem Tối ưu lại Content", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_create", "Tạo đầu việc tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_edit", "Sửa đầu việc tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_delete", "Xóa đầu việc tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_assign", "Giao tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_status", "Cập nhật trạng thái tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("web.reopt_complete", "Hoàn thành tối ưu lại", "Dự Án Web", "D9. Tối ưu lại"),
  P("set_content_optimization_schedule", "Thiết lập lịch tối ưu từ Bài đã đăng", "Dự Án Web", "D9. Tối ưu lại"),
  P("pause_content_optimization_schedule", "Tạm dừng/khôi phục lịch tối ưu", "Dự Án Web", "D9. Tối ưu lại"),
  P("create_content_optimization", "Tạo việc tối ưu từ Bài đã đăng", "Dự Án Web", "D9. Tối ưu lại"),
  P("create_scheduled_content_optimization", "Kiểm tra & tạo việc tối ưu theo lịch", "Dự Án Web", "D9. Tối ưu lại"),
  // D10. Tăng trưởng
  P("web.growth_view", "Xem Tăng Trưởng Website", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_create", "Thêm kỳ báo cáo tăng trưởng", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_edit", "Sửa kỳ báo cáo tăng trưởng", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_delete", "Xóa kỳ báo cáo tăng trưởng", "Dự Án Web", "D10. Tăng trưởng"),
  P("web.growth_open", "Mở link báo cáo GA/GSC", "Dự Án Web", "D10. Tăng trưởng"),
  // D11. Báo cáo Web
  P("web.report_view", "Xem Báo Cáo Web", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_alerts", "Xem Việc cần chú ý web", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_alerts_all", "Xem tất cả Việc cần chú ý", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_action", "Mở cảnh báo nhanh", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_by_topic", "Báo cáo theo Topic", "Dự Án Web", "D11. Báo cáo"),
  P("web.report_by_staff", "Báo cáo theo người phụ trách", "Dự Án Web", "D11. Báo cáo"),
  // ===== E. Social =====
  // E1. Kênh
  P("social.view", "Xem kênh social", "Social", "E1. Kênh"),
  P("social.view_all", "Xem tất cả kênh social", "Social", "E1. Kênh"),
  P("social.view_mine", "Chỉ xem kênh liên quan", "Social", "E1. Kênh"),
  P("social.create", "Tạo kênh social", "Social", "E1. Kênh"),
  P("social.edit", "Sửa kênh social", "Social", "E1. Kênh"),
  P("social.delete", "Xóa kênh social", "Social", "E1. Kênh"),
  P("social.manage_info", "Quản lý thông tin kênh", "Social", "E1. Kênh"),
  P("social.assign_owner", "Gán người phụ trách kênh", "Social", "E1. Kênh"),
  // E2. Sản xuất
  P("social.post_view", "Xem bài social", "Social", "E2. Sản xuất"),
  P("social.post_view_all", "Xem tất cả bài social", "Social", "E2. Sản xuất"),
  P("social.post_view_mine", "Chỉ xem bài liên quan", "Social", "E2. Sản xuất"),
  P("social.post_create", "Tạo bài social", "Social", "E2. Sản xuất"),
  P("social.post_edit", "Sửa bài social", "Social", "E2. Sản xuất"),
  P("social.post_delete", "Xóa bài social", "Social", "E2. Sản xuất"),
  P("social.post_assign", "Giao bài social", "Social", "E2. Sản xuất"),
  P("social.post_start", "Bắt đầu làm bài social", "Social", "E2. Sản xuất"),
  P("social.post_submit", "Gửi duyệt bài social", "Social", "E2. Sản xuất"),
  P("social.post_resubmit", "Gửi duyệt lại bài social", "Social", "E2. Sản xuất"),
  P("social.post_approve", "Duyệt bài social", "Social", "E2. Sản xuất"),
  P("social.post_request_changes", "Yêu cầu sửa bài social", "Social", "E2. Sản xuất"),
  P("social.post_move_pending_publish", "Chuyển bài sang chờ đăng", "Social", "E2. Sản xuất"),
  P("social.post_confirm_published", "Xác nhận đã đăng bài social", "Social", "E2. Sản xuất"),
  P("social.post_complete", "Hoàn thành bài social", "Social", "E2. Sản xuất"),
  P("social.post_cancel", "Hủy bài social", "Social", "E2. Sản xuất"),
  P("social.post_restore", "Khôi phục bài social đã hủy", "Social", "E2. Sản xuất"),
  P("social.post_force_status", "Ép chuyển trạng thái bài social", "Social", "E2. Sản xuất"),
  P("social.post_history", "Xem lịch sử xử lý bài social", "Social", "E2. Sản xuất"),
  // E3. Tăng trưởng
  P("social.growth_view", "Xem tăng trưởng social", "Social", "E3. Tăng trưởng"),
  P("social.growth_create", "Thêm kỳ báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.growth_edit", "Sửa kỳ báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.growth_delete", "Xóa kỳ báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.growth_update", "Cập nhật tăng trưởng social", "Social", "E3. Tăng trưởng"),
  P("social.growth_open", "Mở link báo cáo Social", "Social", "E3. Tăng trưởng"),
  P("social.report", "Xem báo cáo social", "Social", "E3. Tăng trưởng"),
  // ===== F. Local =====
  P("local.view", "Xem local map", "Local", "Địa điểm"),
  P("local.view_all", "Xem tất cả Local Map", "Local", "Địa điểm"),
  P("local.view_mine", "Chỉ xem Local liên quan", "Local", "Địa điểm"),
  P("local.create", "Tạo địa điểm", "Local", "Địa điểm"),
  P("local.edit", "Sửa địa điểm", "Local", "Địa điểm"),
  P("local.delete", "Xóa địa điểm", "Local", "Địa điểm"),
  P("local.assign_owner", "Gán người phụ trách Local", "Local", "Địa điểm"),
  P("local.post_create", "Tạo bài đăng Map", "Local", "Bài đăng"),
  P("local.post_edit", "Sửa bài đăng Map", "Local", "Bài đăng"),
  P("local.post_delete", "Xóa bài đăng Map", "Local", "Bài đăng"),
  P("local.photo", "Cập nhật ảnh địa điểm", "Local", "Bài đăng"),
  P("local.products", "Quản lý sản phẩm/dịch vụ Map", "Local", "Bài đăng"),
  P("local.review", "Xem review", "Local", "Review"),
  P("local.review_create", "Thêm review thủ công", "Local", "Review"),
  P("local.review_reply", "Phản hồi review", "Local", "Review"),
  P("local.review_status", "Cập nhật trạng thái phản hồi", "Local", "Review"),
  P("local.growth_view", "Xem tăng trưởng Local", "Local", "Tăng trưởng"),
  P("local.growth_create", "Thêm kỳ báo cáo Local", "Local", "Tăng trưởng"),
  P("local.growth_edit", "Sửa kỳ báo cáo Local", "Local", "Tăng trưởng"),
  P("local.growth_delete", "Xóa kỳ báo cáo Local", "Local", "Tăng trưởng"),
  P("local.report", "Xem báo cáo local", "Local", "Tăng trưởng"),
  // ===== G. Video =====
  P("video.view", "Xem video", "Video", "Dữ liệu"),
  P("video.view_all", "Xem tất cả video", "Video", "Dữ liệu"),
  P("video.view_mine", "Chỉ xem video liên quan", "Video", "Dữ liệu"),
  P("video.create", "Tạo video", "Video", "CRUD"),
  P("video.edit", "Sửa video", "Video", "CRUD"),
  P("video.delete", "Xóa video", "Video", "CRUD"),
  P("video.assign", "Giao video", "Video", "Workflow"),
  P("video.script_start", "Bắt đầu làm kịch bản", "Video", "Workflow"),
  P("video.script_submit", "Gửi duyệt kịch bản", "Video", "Workflow"),
  P("video.script_resubmit", "Gửi duyệt lại kịch bản", "Video", "Workflow"),
  P("video.script_approve", "Duyệt kịch bản", "Video", "Workflow"),
  P("video.script_reject", "Yêu cầu sửa kịch bản", "Video", "Workflow"),
  P("video.move_shooting", "Chuyển sang quay / thu tư liệu", "Video", "Workflow"),
  P("video.footage", "Cập nhật footage", "Video", "Workflow"),
  P("video.move_editing", "Chuyển sang đang dựng", "Video", "Workflow"),
  P("video.edit_cut", "Cập nhật bản dựng", "Video", "Workflow"),
  P("video.submit", "Gửi duyệt video", "Video", "Workflow"),
  P("video.resubmit", "Gửi duyệt lại video", "Video", "Workflow"),
  P("video.approve", "Duyệt video", "Video", "Workflow"),
  P("video.reject", "Yêu cầu sửa video", "Video", "Workflow"),
  P("video.deliver", "Bàn giao video", "Video", "Workflow"),
  P("video.confirm_published", "Xác nhận đã đăng video", "Video", "Workflow"),
  P("video.complete", "Hoàn thành video", "Video", "Workflow"),
  P("video.cancel", "Hủy video", "Video", "Workflow"),
  P("video.restore", "Khôi phục video đã hủy", "Video", "Workflow"),
  P("video.force_status", "Ép chuyển trạng thái video", "Video", "Workflow"),
  P("video.history", "Xem lịch sử xử lý video", "Video", "Lịch sử"),
  P("video.create_design_order", "Tạo order thiết kế từ video", "Video", "Tích hợp"),
  // ===== H. Order Thiết Kế =====
  ...["photo", "marketing_design", "order_mockup"].flatMap((flow) => {
    const label = flow === "photo" ? "Chụp ảnh" : flow === "marketing_design" ? "Ấn phẩm Marketing" : "Ma-két đơn hàng";
    return [["view", "Xem việc"], ["view_all", "Xem toàn bộ"], ["create", "Tạo yêu cầu"], ["edit", "Sửa thông tin"], ["assign", "Phân công"], ["take", "Nhận việc"], ["submit", "Gửi duyệt"], ["resubmit", "Gửi lại"], ["approve", "Duyệt"], ["request_changes", "Yêu cầu sửa"], ["deliver", "Bàn giao"], ["complete", "Xác nhận hoàn thành"], ["cancel", "Hủy"], ["restore", "Khôi phục"], ["report_view", "Xem báo cáo"], ["edit_reviewer", "Đổi người duyệt"], ["send_request", "Gửi yêu cầu"], ["update_draft", "Cập nhật file"], ["force_status", "Can thiệp trạng thái"], ["delete", "Xóa nháp"]].map(([action, text]) => P(`order.${flow}.${action}`, `${text} — ${label}`, "Thiết Kế", label));
  }),
  P("order.view", "Xem order thiết kế", "Thiết Kế", "Dữ liệu"),
  P("order.view_all", "Xem tất cả order", "Thiết Kế", "Dữ liệu"),
  P("order.view_mine", "Chỉ xem order liên quan", "Thiết Kế", "Dữ liệu"),
  P("order.create", "Tạo order thiết kế", "Thiết Kế", "CRUD"),
  P("order.edit", "Sửa order thiết kế", "Thiết Kế", "CRUD"),
  P("order.edit_reviewer", "Chỉnh Người duyệt order", "Thiết Kế", "CRUD"),
  P("order.delete", "Xóa order thiết kế", "Thiết Kế", "CRUD"),
  P("order.send_request", "Gửi yêu cầu order", "Thiết Kế", "Workflow"),
  P("order.assign", "Gán người phụ trách order", "Thiết Kế", "Workflow"),
  P("order.take", "Nhận order", "Thiết Kế", "Workflow"),
  P("order.update_draft", "Cập nhật file nháp", "Thiết Kế", "Workflow"),
  P("order.submit", "Gửi duyệt order", "Thiết Kế", "Workflow"),
  P("order.resubmit", "Gửi duyệt lại order", "Thiết Kế", "Workflow"),
  P("order.approve", "Duyệt order", "Thiết Kế", "Workflow"),
  P("order.request_changes", "Yêu cầu sửa order", "Thiết Kế", "Workflow"),
  P("order.deliver", "Bàn giao file", "Thiết Kế", "Workflow"),
  P("order.complete", "Xác nhận hoàn thành order", "Thiết Kế", "Workflow"),
  P("order.cancel", "Hủy order", "Thiết Kế", "Workflow"),
  P("order.restore", "Khôi phục order đã hủy", "Thiết Kế", "Workflow"),
  P("order.force_status", "Ép chuyển trạng thái order", "Thiết Kế", "Workflow"),
  P("order.history", "Xem lịch sử xử lý order", "Thiết Kế", "Lịch sử"),
  P("order.open_delivery", "Mở link file bàn giao", "Thiết Kế", "Lịch sử"),
  P("order.report_view", "Xem báo cáo Order Thiết Kế", "Thiết Kế", "Báo cáo"),
  // ===== I. Báo Cáo =====
  P("report.view", "Xem báo cáo tổng quan", "Báo Cáo", "Báo cáo"),
  P("report.by_brand", "Báo cáo theo thương hiệu", "Báo Cáo", "Báo cáo"),
  P("report.by_module", "Báo cáo theo module", "Báo Cáo", "Báo cáo"),
  P("report.by_staff", "Báo cáo theo người phụ trách", "Báo Cáo", "Báo cáo"),
  P("report.attention", "Xem việc cần chú ý toàn app", "Báo Cáo", "Cảnh báo"),
  P("report.attention_all", "Xem tất cả cảnh báo", "Báo Cáo", "Cảnh báo"),
  P("report.export", "Xuất báo cáo", "Báo Cáo", "Báo cáo"),
  P("report.growth", "Xem dữ liệu tăng trưởng", "Báo Cáo", "Báo cáo"),
  // ===== J. Cài Đặt =====
  P("settings.view", "Xem cài đặt", "Cài Đặt", "Hệ thống"),
  P("settings.people", "Quản lý nhân sự", "Cài Đặt", "Danh mục"),
  P("settings.catalog", "Quản lý danh mục trạng thái", "Cài Đặt", "Danh mục"),
  P("settings.brand_types", "Quản lý loại thương hiệu", "Cài Đặt", "Danh mục"),
  P("settings.web_types", "Quản lý loại website", "Cài Đặt", "Danh mục"),
  P("settings.social_types", "Quản lý loại kênh social", "Cài Đặt", "Danh mục"),
  P("settings.task_types", "Quản lý loại task", "Cài Đặt", "Danh mục"),
  P("settings.video_types", "Quản lý loại video", "Cài Đặt", "Danh mục"),
  P("settings.design_types", "Quản lý loại thiết kế", "Cài Đặt", "Danh mục"),
  P("settings.priority", "Quản lý mức ưu tiên", "Cài Đặt", "Danh mục"),
  P("settings.plan_topic", "Quản lý Plan / Topic", "Cài Đặt", "Danh mục"),
  P("settings.template", "Quản lý template checklist", "Cài Đặt", "Danh mục"),
  P("settings.system_view", "Xem thông tin hệ thống", "Cài Đặt", "Hệ thống"),
  P("system.branding", "Quản lý thông tin hệ thống", "Cài Đặt", "Hệ thống"),
  P("settings.system_edit", "Chỉnh thông tin hệ thống", "Cài Đặt", "Hệ thống"),
  P("settings.view_presence", "Xem trạng thái online nhân sự", "Cài Đặt", "Nhân sự"),
  // ===== Tín hiệu cơ hội =====
  P("signal.create", "Tạo tín hiệu (Marketing)", "Tín Hiệu Cơ Hội", "Marketing"),
  P("signal.view_all", "Xem toàn bộ tín hiệu", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.assign", "Phân công Sale", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.reassign", "Đổi Sale", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.manage", "Quản lý tín hiệu (sửa, xóa, hủy, mở lại)", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.edit", "Sửa thông tin tín hiệu", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.delete", "Xóa tín hiệu (chưa có nhật ký)", "Tín Hiệu Cơ Hội", "Quản lý"),
  P("signal.sale", "Kinh doanh — nhận tín hiệu được giao", "Tín Hiệu Cơ Hội", "Kinh doanh"),
  P("signal.report", "Xem báo cáo tín hiệu", "Tín Hiệu Cơ Hội", "Báo cáo"),
  P("signal.catalog", "Quản lý danh mục tín hiệu (Nguồn, Loại sản phẩm, Nhóm nhu cầu)", "Tín Hiệu Cơ Hội", "Quản lý"),
  // ===== KPI / Giao KPI =====
  P("kpi.view_own", "Xem KPI cá nhân", "KPI / Giao KPI", "Xem"),
  P("kpi.view_all", "Xem toàn bộ KPI", "KPI / Giao KPI", "Xem"),
  P("kpi.goal_create", "Tạo mục tiêu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.goal_edit", "Sửa mục tiêu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.goal_archive", "Hủy / Lưu trữ mục tiêu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.goal_delete", "Xóa mục tiêu chưa phát sinh dữ liệu", "KPI / Giao KPI", "Mục tiêu"),
  P("kpi.kr_assign", "Thêm / Giao KR", "KPI / Giao KPI", "KR & Chỉ tiêu"),
  P("kpi.kr_adjust", "Điều chỉnh KR đã giao", "KPI / Giao KPI", "KR & Chỉ tiêu"),
  P("kpi.period_manage", "Quản lý kỳ KPI", "KPI / Giao KPI", "Kỳ KPI"),
  P("kpi.report", "Xem báo cáo KPI", "KPI / Giao KPI", "Báo cáo"),
  P("kpi.report_export", "Xuất báo cáo KPI", "KPI / Giao KPI", "Báo cáo"),
  // ===== Đơn từ & Phê duyệt =====
  P("leave.view_own", "Xem đơn cá nhân", "Đơn Từ & Phê Duyệt", "Xem"),
  P("leave.view_assigned", "Xem đơn được giao duyệt", "Đơn Từ & Phê Duyệt", "Xem"),
  P("leave.view_all", "Xem toàn bộ đơn", "Đơn Từ & Phê Duyệt", "Xem"),
  P("leave.view_unit", "Xem đơn của thành viên đơn vị mình quản lý", "Đơn Từ & Phê Duyệt", "Xem"),
  P("leave.create", "Tạo đơn cá nhân", "Đơn Từ & Phê Duyệt", "Tạo"),
  P("leave.create_for", "Tạo đơn hộ", "Đơn Từ & Phê Duyệt", "Tạo"),
  P("leave.edit_own", "Sửa đơn cá nhân", "Đơn Từ & Phê Duyệt", "Sửa"),
  P("leave.edit_others", "Sửa đơn nhân viên", "Đơn Từ & Phê Duyệt", "Sửa"),
  P("leave.recall", "Thu hồi đơn cá nhân", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.approve", "Phê duyệt đơn (chỉ đơn được chỉ định)", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.reassign", "Chuyển người duyệt", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.cancel_handle", "Xử lý hủy đơn", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.exception", "Xử lý ngoại lệ đơn từ", "Đơn Từ & Phê Duyệt", "Xử lý"),
  P("leave.report", "Xem báo cáo đơn từ", "Đơn Từ & Phê Duyệt", "Báo cáo"),
  P("leave.export", "Xuất báo cáo", "Đơn Từ & Phê Duyệt", "Báo cáo"),
  P("leave.settings", "Quản lý cài đặt đơn từ", "Đơn Từ & Phê Duyệt", "Cài đặt"),
  P("att.create", "Tạo giải trình chấm công cá nhân", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.view_own", "Xem giải trình cá nhân", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.edit_own", "Sửa / thu hồi giải trình cá nhân", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.witness", "Xác nhận làm chứng (chỉ giải trình được chọn)", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.view_all", "Xem toàn bộ giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.reconcile", "Đối chiếu giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.report", "Xem báo cáo giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.manage", "Quản lý giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  P("att.settings", "Quản lý cài đặt giải trình", "Đơn Từ & Phê Duyệt", "Giải trình chấm công"),
  // ===== Đơn hàng — Hỏi Giá & Tiến Độ =====
  P("oq.create", "Tạo yêu cầu", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Kinh doanh"),
  P("oq.view_own", "Xem yêu cầu cá nhân", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Xem"),
  P("oq.view_all", "Xem toàn bộ yêu cầu", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Xem"),
  P("oq.accept", "Tiếp nhận yêu cầu được giao", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Cung ứng"),
  P("oq.reply_price", "Phản hồi Hỏi Giá", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Cung ứng"),
  P("oq.reply_progress", "Phản hồi Hỏi Tiến Độ", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Cung ứng"),
  P("oq.manage", "Quản lý yêu cầu (can thiệp trường hợp đặc biệt)", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Quản lý"),
  P("oq.delete_cancelled", "Xóa yêu cầu đã hủy", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Quản lý"),
  P("oq.report_own", "Xem báo cáo cá nhân", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Báo cáo"),
  P("oq.report_all", "Xem báo cáo toàn bộ Hỏi Giá & Tiến Độ", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Báo cáo"),
  P("oq.report_export", "Xuất báo cáo Excel", "Đơn Hàng — Hỏi Giá & Tiến Độ", "Báo cáo"),
  // ===== Theo Dõi Đơn Hàng =====
  P("ot.view_own", "Xem đơn phụ trách", "Theo Dõi Đơn Hàng", "Xem"),
  P("ot.view_all", "Xem toàn bộ đơn", "Theo Dõi Đơn Hàng", "Xem"),
  P("ot.view_unit", "Xem đơn hàng của thành viên đơn vị mình quản lý", "Theo Dõi Đơn Hàng", "Xem"),
  P("ot.create", "Tạo đơn thủ công", "Theo Dõi Đơn Hàng", "Đơn hàng"),
  P("ot.accept", "Tiếp nhận đơn", "Theo Dõi Đơn Hàng", "Đơn hàng"),
  P("ot.assign", "Phân công người phụ trách", "Theo Dõi Đơn Hàng", "Đơn hàng"),
  P("ot.task_view", "Xem công việc được giao", "Theo Dõi Đơn Hàng", "Công việc"),
  P("ot.task_update", "Cập nhật công việc được giao", "Theo Dõi Đơn Hàng", "Công việc"),
  P("ot.stage_update", "Cập nhật tiến độ công đoạn", "Theo Dõi Đơn Hàng", "Công việc"),
  P("ot.reschedule_propose", "Đề xuất điều chỉnh lịch", "Theo Dõi Đơn Hàng", "Điều chỉnh lịch"),
  P("ot.reschedule_reply", "Phản hồi điều chỉnh lịch", "Theo Dõi Đơn Hàng", "Điều chỉnh lịch"),
  P("ot.supplier", "Quản lý nhà cung cấp", "Theo Dõi Đơn Hàng", "Quản lý"),
  // Nhà cung cấp gốc toàn công ty, đặt tại Mua Hàng & Giao Vận.
  P("supplier.master.view", "Tra cứu Nhà cung cấp chung", "Nhà cung cấp", "Xem"),
  P("supplier.master.create", "Thêm Nhà cung cấp chung", "Nhà cung cấp", "Tạo"),
  P("supplier.master.edit", "Cập nhật hồ sơ Nhà cung cấp", "Nhà cung cấp", "Sửa"),
  P("supplier.master.product_edit", "Cập nhật sản phẩm cung ứng", "Nhà cung cấp", "Sản phẩm"),
  P("supplier.master.contact_log", "Ghi lịch sử liên hệ", "Nhà cung cấp", "Lịch sử"),
  P("supplier.master.view_cost", "Xem và cập nhật giá nhập", "Nhà cung cấp", "Giá vốn"),
  P("supplier.master.manage", "Quản lý trạng thái Nhà cung cấp", "Nhà cung cấp", "Quản lý"),
  P("ot.manage", "Quản lý đơn hàng", "Theo Dõi Đơn Hàng", "Quản lý"),
  P("ot.report", "Xem báo cáo", "Theo Dõi Đơn Hàng", "Báo cáo"),
  P("ot.report_export", "Xuất báo cáo", "Theo Dõi Đơn Hàng", "Báo cáo"),
  P("ot.settings", "Quản lý cài đặt đơn hàng", "Theo Dõi Đơn Hàng", "Quản lý"),
  // ===== Tài Chính Kế Toán =====
  P("finance.incoming.view", "Xem Tiền Về", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  P("finance.incoming.view_unit", "Xem Tiền Về của thành viên đơn vị mình quản lý", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  P("finance.incoming.claim", "Sale xác nhận giao dịch", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  P("finance.incoming.reconcile", "Xem toàn bộ / sửa ghi chú / xác nhận loại Khác", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manual_view", "Xem khoản thủ công (Tiền mặt / TK khác)", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  P("finance.incoming.view_totals", "Xem tổng tiền và thống kê tài chính", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manual_create", "Thêm khoản thủ công", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manual_manage", "Quản lý (sửa / hủy) khoản thủ công", "Tài Chính Kế Toán", "Tiền Về — Kế toán"),
  P("finance.incoming.manage", "Quản lý / điều chỉnh giao dịch", "Tài Chính Kế Toán", "Tiền Về — Quản trị"),
  P("finance.incoming.bank_config", "Cài đặt ngân hàng", "Tài Chính Kế Toán", "Tiền Về — Quản trị"),
  P("finance.incoming.gmf_config", "Cài đặt thông báo Zalo GMF", "Tài Chính Kế Toán", "Tiền Về — Quản trị"),
  P("finance.incoming.remind", "Nhắc xác nhận thủ công", "Tài Chính Kế Toán", "Tiền Về — Xem và xác nhận"),
  // ===== Đề Nghị Tài Chính (Tạm Ứng / Thanh Toán / Tạm Ứng Lương) =====
  P("fr.advance.view_scope", "Xem đề nghị tạm ứng thuộc phạm vi", "Tài Chính Kế Toán", "Đề Nghị Tạm Ứng"),
  P("fr.advance.approve", "Phê duyệt đề nghị tạm ứng", "Tài Chính Kế Toán", "Đề Nghị Tạm Ứng"),
  P("fr.advance.pay", "Xác nhận chi tiền tạm ứng", "Tài Chính Kế Toán", "Đề Nghị Tạm Ứng"),
  P("fr.advance.report", "Xem báo cáo tạm ứng", "Tài Chính Kế Toán", "Đề Nghị Tạm Ứng"),
  P("fr.advance.settings", "Cài đặt quy trình tạm ứng", "Tài Chính Kế Toán", "Đề Nghị Tạm Ứng"),
  P("fr.payment.view_scope", "Xem đề nghị thanh toán thuộc phạm vi", "Tài Chính Kế Toán", "Đề Nghị Thanh Toán"),
  P("fr.payment.approve", "Phê duyệt đề nghị thanh toán", "Tài Chính Kế Toán", "Đề Nghị Thanh Toán"),
  P("fr.payment.pay", "Xác nhận chi tiền thanh toán", "Tài Chính Kế Toán", "Đề Nghị Thanh Toán"),
  P("fr.payment.report", "Xem báo cáo thanh toán", "Tài Chính Kế Toán", "Đề Nghị Thanh Toán"),
  P("fr.payment.settings", "Cài đặt quy trình thanh toán", "Tài Chính Kế Toán", "Đề Nghị Thanh Toán"),
  P("fr.salary.view_scope", "Xem tạm ứng lương thuộc phạm vi", "Tài Chính Kế Toán", "Tạm Ứng Lương"),
  P("fr.salary.approve", "Phê duyệt tạm ứng lương", "Tài Chính Kế Toán", "Tạm Ứng Lương"),
  P("fr.salary.pay", "Xác nhận chi tạm ứng lương", "Tài Chính Kế Toán", "Tạm Ứng Lương"),
  P("fr.salary.deduct", "Xác nhận khấu trừ/hoàn trả", "Tài Chính Kế Toán", "Tạm Ứng Lương"),
  P("fr.salary.report", "Xem báo cáo tạm ứng lương", "Tài Chính Kế Toán", "Tạm Ứng Lương"),
  P("fr.salary.settings", "Cài đặt quy trình tạm ứng lương", "Tài Chính Kế Toán", "Tạm Ứng Lương"),
  // ===== Sale Work Zalo (liên kết phần mềm ngoài + kho tài khoản riêng) =====
  P("sale_work.access", "Truy cập Sale Work Zalo", "Sale Work Zalo", "Sử dụng"),
  P("sale_work.view_own", "Xem/sao chép thông tin đăng nhập của chính mình", "Sale Work Zalo", "Sử dụng"),
  P("sale_work.manage_settings", "Cấu hình URL và hiển thị Sale Work", "Sale Work Zalo", "Quản trị"),
  P("sale_work.manage_credentials", "Cấp/sửa/thu hồi tài khoản Sale Work của nhân sự", "Sale Work Zalo", "Quản trị"),
  P("sale_work.view_audit", "Xem nhật ký quản trị Sale Work (không gồm mật khẩu)", "Sale Work Zalo", "Quản trị"),
  // ===== Tích hợp Marketing =====
  P("integration.facebook_leads", "Quản lý Facebook Lead Ads (kết nối Page, cấu hình Form, xem lỗi, thử lại)", "Tích hợp Marketing", "Facebook Lead Ads"),
  P("integration.website_forms", "Quản lý Website Forms (thêm Website, cấp/thu hồi khóa, cấu hình Form, xem lỗi, thử lại)", "Tích hợp Marketing", "Website Forms"),
  // ===== K. Tài khoản / Role / Phân quyền =====
  P("settings.user_view", "Xem tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_create", "Tạo tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_edit", "Sửa tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_delete", "Xóa tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.account_lock", "Khóa/mở khóa tài khoản", "Tài khoản", "Tài khoản"),
  P("settings.user_reset_password", "Reset mật khẩu", "Tài khoản", "Tài khoản"),
  P("settings.account_approve", "Duyệt tài khoản mới", "Tài khoản", "Tài khoản"),
  P("settings.account_reject", "Từ chối tài khoản mới", "Tài khoản", "Tài khoản"),
  P("settings.assign_role", "Gán role", "Tài khoản", "Role"),
  P("settings.role", "Tạo / sửa / xóa role", "Tài khoản", "Role"),
  P("settings.permission", "Quản lý ma trận phân quyền", "Tài khoản", "Role"),
  P("settings.user_custom_perm", "Tùy chỉnh quyền riêng theo user", "Tài khoản", "Role"),
  P("settings.login_history", "Xem lịch sử đăng nhập", "Tài khoản", "Audit"),
  P("settings.activity_log", "Xem log thao tác", "Tài khoản", "Audit"),
  // ===== Showroom — phân hệ bán lẻ riêng, cấp quyền theo ô chức danh V2 =====
  P("showroom.view", "Xem phân hệ Showroom", "Showroom", "Xem"),
  P("showroom.view_unit", "Xem nhân sự cửa hàng mình phụ trách", "Showroom", "Xem"),
  P("showroom.view_all", "Xem toàn bộ hệ thống Showroom", "Showroom", "Xem"),
  P("showroom.shift.view", "Xem lịch trực cửa hàng của mình", "Showroom", "Lịch trực"),
  P("showroom.shift.register", "Đăng ký ca trực tuần của mình", "Showroom", "Lịch trực"),
  P("showroom.shift.swap", "Đề nghị đổi ca và nhận ca thay", "Showroom", "Lịch trực"),
  P("showroom.shift.approve", "Duyệt, điều chỉnh và công bố lịch trực", "Showroom", "Lịch trực"),
  P("showroom.shift.settings", "Cấu hình chính sách lịch trực", "Showroom", "Lịch trực"),
  P("showroom.shift.view_all", "Xem lịch trực toàn Khối Showroom", "Showroom", "Lịch trực"),
  P("showroom.k3.use", "Mở 3K Showroom cá nhân", "Showroom", "3K"),
  P("showroom.k3.view_team", "Theo dõi 3K nhân sự cửa hàng", "Showroom", "3K"),
  P("showroom.k3.view_all", "Xem 3K toàn Khối Showroom", "Showroom", "3K"),
  P("showroom.k3.comment", "Nhận xét 3K nhân viên Showroom", "Showroom", "3K"),
  // ===== Trung tâm 3K chung — hiển thị menu theo Role vị trí, phạm vi do server kiểm soát =====
  P("k3hub.use", "3K theo khu vực tổ chức", "Trung tâm 3K", "Sử dụng"),
  P("k3hub.center", "Theo dõi 3K theo cơ cấu quản lý", "Trung tâm 3K", "Quản lý"),
  P("k3hub.config", "Cấu hình phạm vi áp dụng 3K", "Trung tâm 3K", "Cấu hình"),
  P("k3hub.biz", "Mở 3K khu vực Kinh doanh", "Trung tâm 3K", "Khu vực"),
  P("k3hub.ops", "Mở 3K khu vực Vận hành", "Trung tâm 3K", "Khu vực"),
  P("k3hub.ops_accounting", "Mở 3K Kế toán", "Trung tâm 3K", "Khu vực"),
  P("k3hub.ops_hr", "Mở 3K Hành chính và Nhân sự", "Trung tâm 3K", "Khu vực"),
  // ===== Cơ cấu tổ chức (quản trị tại Hành chính & Nhân sự → Cơ cấu tổ chức) =====
  P("org.view", "Xem sơ đồ cơ cấu tổ chức", "Cơ cấu tổ chức", "Cơ cấu"),
  P("org.manage_structure", "Tạo/sửa đơn vị và chức danh", "Cơ cấu tổ chức", "Cơ cấu"),
  P("org.assign_staff", "Thêm, bỏ gán và điều chuyển nhân sự", "Cơ cấu tổ chức", "Nhân sự"),
  P("org.appoint_manager", "Bổ nhiệm/miễn nhiệm vị trí quản lý", "Cơ cấu tổ chức", "Nhân sự"),
  P("org.view_history", "Xem lịch sử phân công và bổ nhiệm", "Cơ cấu tổ chức", "Nhân sự"),
  P("org.manage_permissions", "Quản lý quy tắc phân quyền tổ chức", "Cơ cấu tổ chức", "Phân quyền")
];
const ALL_PERMS = PERMISSIONS.map((p) => p.key);
const BIZ_ORG_GROUPS = ["Quản trị Kinh doanh", "Quản lý 3K", "CRM Khách Hàng"];
const ROLE_PERMISSIONS = PERMISSIONS.filter((p) => !BIZ_ORG_GROUPS.includes(p.group));
ROLE_PERMISSIONS.map((p) => p.key);
const PERMISSION_BY_KEY = Object.fromEntries(
  PERMISSIONS.map((p) => [p.key, p])
);
const PERMISSION_DEPENDS = (() => {
  const m = {};
  m["sale_work.view_own"] = ["sale_work.access"];
  const webViewKey = "web.view";
  ["web.tech_check", "web.tech_edit_desc", "web.tech_reset", "web.tech_template"].forEach((k) => {
    m[k] = ["web.tech_view", webViewKey];
  });
  m["web.tech_view"] = [webViewKey];
  [
    "web.entity_create",
    "web.entity_edit",
    "web.entity_delete",
    "web.entity_open_link",
    "web.entity_view_account",
    "web.entity_reveal_password"
  ].forEach((k) => {
    m[k] = ["web.entity_view", webViewKey];
  });
  m["web.entity_view"] = [webViewKey];
  m["web.entity_reveal_password"] = ["web.entity_view_account", "web.entity_view", webViewKey];
  [
    "web.keyword_topic_create",
    "web.keyword_topic_edit",
    "web.keyword_topic_delete",
    "web.keyword_open_sheet",
    "web.keyword_manage_sheet"
  ].forEach((k) => {
    m[k] = ["web.keyword_view", webViewKey];
  });
  m["web.keyword_view"] = [webViewKey];
  [
    "web.content_create",
    "web.content_edit",
    "web.content_delete",
    "web.content_assign",
    "web.content_edit_brief",
    "web.content_edit_deadline",
    "web.content_edit_writer",
    "web.content_edit_outline_reviewer",
    "web.content_edit_article_reviewer",
    "web.content_edit_publisher",
    "web.outline_start",
    "web.outline_submit",
    "web.outline_approve",
    "web.outline_reject",
    "web.outline_resubmit",
    "web.post_write_start",
    "web.post_submit",
    "web.post_approve",
    "web.post_reject",
    "web.post_resubmit",
    "web.move_pending_publish",
    "web.publish",
    "web.complete",
    "web.content_cancel",
    "web.content_restore",
    "web.force_status",
    "web.content_history",
    "web.content_note",
    "web.view_web_draft_url",
    "web.edit_web_draft_url",
    "web.start_web_draft_layout",
    "web.submit_web_draft_review",
    "web.resubmit_web_draft_review",
    "web.approve_web_draft",
    "web.request_web_draft_revision",
    "web.view_web_draft_revision_note",
    "web.edit_web_draft_note",
    "web.force_change_web_draft_status"
  ].forEach((k) => {
    m[k] = ["web.content_view", webViewKey];
  });
  m["web.content_view"] = [webViewKey];
  [
    "web.update_index",
    "web.update_share",
    "web.update_share_date",
    "web.select_shared_entity",
    "web.edit_published_url",
    "web.open_published_url"
  ].forEach((k) => {
    m[k] = ["web.index_view", webViewKey];
  });
  m["web.index_view"] = [webViewKey];
  [
    "web.backlink_create",
    "web.backlink_edit",
    "web.backlink_delete",
    "web.backlink_status",
    "web.backlink_open",
    "web.backlink_cost"
  ].forEach((k) => {
    m[k] = ["web.backlink_view", webViewKey];
  });
  m["web.backlink_view"] = [webViewKey];
  [
    "web.checktop_primary",
    "web.checktop_secondary",
    "web.checktop_kw_create",
    "web.checktop_kw_edit",
    "web.checktop_kw_delete",
    "web.checktop_open_url",
    "web.checktop_filter_topic"
  ].forEach((k) => {
    m[k] = ["web.checktop_view", webViewKey];
  });
  m["web.checktop_view"] = [webViewKey];
  [
    "web.reopt_create",
    "web.reopt_edit",
    "web.reopt_delete",
    "web.reopt_assign",
    "web.reopt_status",
    "web.reopt_complete",
    "set_content_optimization_schedule",
    "pause_content_optimization_schedule",
    "create_content_optimization",
    "create_scheduled_content_optimization"
  ].forEach((k) => {
    m[k] = ["web.reopt_view", webViewKey];
  });
  m["web.reopt_view"] = [webViewKey];
  ["web.growth_create", "web.growth_edit", "web.growth_delete", "web.growth_open"].forEach((k) => {
    m[k] = ["web.growth_view", webViewKey];
  });
  m["web.growth_view"] = [webViewKey];
  [
    "web.report_alerts",
    "web.report_alerts_all",
    "web.report_action",
    "web.report_by_topic",
    "web.report_by_staff"
  ].forEach((k) => {
    m[k] = ["web.report_view", webViewKey];
  });
  m["web.report_view"] = [webViewKey];
  [
    "task.create",
    "task.edit",
    "task.delete",
    "task.assign",
    "task.edit_assignee",
    "task.edit_deadline",
    "task.edit_priority",
    "task.accept",
    "task.update_status",
    "task.complete",
    "task.restore",
    "task.force_status",
    "task.start",
    "task.update_result",
    "task.submit_completion",
    "task.resubmit_completion",
    "task.approve_completion",
    "task.request_revision",
    "task.cancel",
    "task.reopen_completed",
    "task.force_change_status",
    "task.view_history",
    "task.add_note",
    "task.view_all",
    "task.view_mine",
    "task.view_created_by_me"
  ].forEach((k) => {
    m[k] = ["task.view"];
  });
  [
    "brand.create",
    "brand.edit",
    "brand.delete",
    "brand.profile",
    "brand.identity",
    "brand.view_channels",
    "brand.docs",
    "brand.staff",
    "brand.contact",
    "brand.notes"
  ].forEach((k) => {
    m[k] = ["brand.view"];
  });
  ["social.create", "social.edit", "social.delete", "social.manage_info", "social.assign_owner"].forEach((k) => {
    m[k] = ["social.view"];
  });
  [
    "social.post_create",
    "social.post_edit",
    "social.post_delete",
    "social.post_assign",
    "social.post_start",
    "social.post_submit",
    "social.post_resubmit",
    "social.post_approve",
    "social.post_request_changes",
    "social.post_move_pending_publish",
    "social.post_confirm_published",
    "social.post_complete",
    "social.post_cancel",
    "social.post_restore",
    "social.post_force_status",
    "social.post_history"
  ].forEach((k) => {
    m[k] = ["social.post_view"];
  });
  [
    "social.growth_create",
    "social.growth_edit",
    "social.growth_delete",
    "social.growth_update",
    "social.growth_open"
  ].forEach((k) => {
    m[k] = ["social.growth_view"];
  });
  [
    "local.create",
    "local.edit",
    "local.delete",
    "local.assign_owner",
    "local.post_create",
    "local.post_edit",
    "local.post_delete",
    "local.photo",
    "local.products"
  ].forEach((k) => {
    m[k] = ["local.view"];
  });
  ["local.review_create", "local.review_reply", "local.review_status"].forEach((k) => {
    m[k] = ["local.review", "local.view"];
  });
  ["local.growth_create", "local.growth_edit", "local.growth_delete"].forEach((k) => {
    m[k] = ["local.growth_view", "local.view"];
  });
  [
    "video.create",
    "video.edit",
    "video.delete",
    "video.assign",
    "video.script_start",
    "video.script_submit",
    "video.script_resubmit",
    "video.script_approve",
    "video.script_reject",
    "video.move_shooting",
    "video.footage",
    "video.move_editing",
    "video.edit_cut",
    "video.submit",
    "video.resubmit",
    "video.approve",
    "video.reject",
    "video.deliver",
    "video.confirm_published",
    "video.complete",
    "video.cancel",
    "video.restore",
    "video.force_status",
    "video.history",
    "video.create_design_order"
  ].forEach((k) => {
    m[k] = ["video.view"];
  });
  [
    "order.create",
    "order.edit",
    "order.edit_reviewer",
    "order.delete",
    "order.send_request",
    "order.assign",
    "order.take",
    "order.update_draft",
    "order.submit",
    "order.resubmit",
    "order.approve",
    "order.request_changes",
    "order.deliver",
    "order.complete",
    "order.cancel",
    "order.restore",
    "order.force_status",
    "order.history",
    "order.open_delivery"
  ].forEach((k) => {
    m[k] = ["order.view"];
  });
  [
    "settings.people",
    "settings.catalog",
    "settings.brand_types",
    "settings.web_types",
    "settings.social_types",
    "settings.task_types",
    "settings.video_types",
    "settings.design_types",
    "settings.priority",
    "settings.plan_topic",
    "settings.template",
    "settings.system_view",
    "settings.system_edit",
    "settings.view_presence"
  ].forEach((k) => {
    m[k] = ["settings.view"];
  });
  [
    "settings.user_create",
    "settings.user_edit",
    "settings.user_delete",
    "settings.account_lock",
    "settings.user_reset_password",
    "settings.account_approve",
    "settings.account_reject",
    "settings.assign_role"
  ].forEach((k) => {
    m[k] = ["settings.user_view"];
  });
  m["settings.permission"] = ["settings.role"];
  m["settings.user_custom_perm"] = ["settings.user_view"];
  return m;
})();
function allDependencies(key) {
  const out = /* @__PURE__ */ new Set();
  const walk = (k) => {
    for (const parent of PERMISSION_DEPENDS[k] ?? []) {
      if (!out.has(parent)) {
        out.add(parent);
        walk(parent);
      }
    }
  };
  walk(key);
  return [...out];
}
function allDependents(parentKey) {
  const direct = /* @__PURE__ */ new Set();
  for (const [child, parents] of Object.entries(PERMISSION_DEPENDS)) {
    if (parents.includes(parentKey)) direct.add(child);
  }
  const out = new Set(direct);
  for (const c of direct) {
    for (const d of allDependents(c)) out.add(d);
  }
  return [...out];
}
const PERMISSION_GROUPS = [
  "Hộp thư",
  "Tổng Quan",
  "Task",
  "Thương Hiệu",
  "Dự Án Web",
  "Social",
  "Local",
  "Video",
  "Thiết Kế",
  "Báo Cáo",
  "Tín Hiệu Cơ Hội",
  "KPI / Giao KPI",
  "Đơn Từ & Phê Duyệt",
  "Tài Chính Kế Toán",
  "Quản trị Kinh doanh",
  "Quản lý 3K",
  "Cài Đặt",
  "Tài khoản",
  "Cơ cấu tổ chức"
];
const PERMISSION_ALIAS = {
  "task.view_own": "task.view_mine",
  "web.entity": "web.entity_view",
  "web.keyword": "web.keyword_view",
  "web.tech": "web.tech_view",
  "web.backlink": "web.backlink_view",
  "web.checktop": "web.checktop_view",
  "web.reoptimize": "web.reopt_view",
  "web.growth_edit": "web.growth_edit"
};
function resolvePermKey(key) {
  return PERMISSION_ALIAS[key] ?? key;
}
const SUPER_ADMIN_ID = "role-super-admin";
let initStarted = false;
const authLoads = createCoalescer(async () => {
  await useAuth.getState()._load();
});
const baseLoads = createCoalescer(async () => {
  await useAuth.getState()._loadBase();
});
const bizLoads = createCoalescer(async () => {
  await useAuth.getState()._loadBiz();
});
const accessAt = { base: null, biz: null };
const accessAttemptAt = { base: null, biz: null };
let orgRoleCacheUnavailable = false;
function warmOwnServerRoleCache(uid2) {
  if (!uid2 || orgRoleCacheUnavailable) return;
  void Promise.resolve(supabase.rpc("base_role_cache_sync")).then(({ error }) => {
    if (error?.code === "PGRST202") orgRoleCacheUnavailable = true;
  }).catch(() => void 0);
}
const effectivePermissionIndexes = /* @__PURE__ */ new WeakMap();
function verifiedPermission(access, key) {
  let index = effectivePermissionIndexes.get(access);
  if (!index) {
    index = new Map(access.permissions.filter((p) => p.supported).map((p) => [p.key, p.allowed]));
    effectivePermissionIndexes.set(access, index);
  }
  return index.get(key);
}
function mapProfileToUser(p, userRoles, overrides) {
  const ur = userRoles.find((x) => x.user_id === p.id);
  const urAll = userRoles.filter((x) => x.user_id === p.id).map((x) => x.role_id);
  const ov = overrides.find((x) => x.user_id === p.id);
  return {
    id: p.id,
    username: p.username || "",
    fullName: p.full_name || "",
    email: p.email || void 0,
    phone: p.phone || void 0,
    desiredPosition: p.desired_position || void 0,
    notes: p.notes || void 0,
    passwordHash: "",
    passwordSalt: "",
    roleId: ur?.role_id,
    roleIds: urAll.length > 0 ? urAll : void 0,
    useCustom: ov?.use_custom ?? false,
    customPermissions: ov?.permissions ?? [],
    overrideMode: ov?.mode === "additive" ? "additive" : "replace",
    status: p.status,
    createdAt: p.created_at,
    system: !!p.is_system_admin,
    mustChangePassword: !!p.must_change_password,
    lastSeenAt: p.last_seen_at || void 0
  };
}
const useAuth = create((set, get) => ({
  baseAccess: null,
  refreshBaseAccess: async (force = false) => {
    const uid2 = get().currentUserId;
    if (!uid2) {
      set({ baseAccess: null });
      return;
    }
    const now2 = Date.now();
    if (!shouldRefresh(accessAt.base, now2, force) || !shouldRefresh(accessAttemptAt.base, now2, force)) return;
    accessAttemptAt.base = now2;
    return force ? baseLoads.refresh(uid2) : baseLoads.join(uid2);
  },
  _loadBase: async () => {
    const uid2 = get().currentUserId;
    if (!uid2) {
      set({ baseAccess: null });
      return;
    }
    const quick = await supabase.rpc("base_permissions_navigation");
    const { data, error } = quick.error?.code === "PGRST202" ? await supabase.rpc("base_permissions_effective") : quick;
    if (get().currentUserId !== uid2) return;
    const r = mergeAccess(get().baseAccess, accessAt.base, uid2, { data, error }, Date.now());
    accessAt.base = r.verifiedAt;
    if (!r.failed) warmOwnServerRoleCache(uid2);
    const bizFailed = get().bizAccessFailed;
    if (r.value !== get().baseAccess || r.failed !== get().baseAccessFailed)
      set({ baseAccess: r.value, baseAccessFailed: r.failed, accessSyncFailed: r.failed || bizFailed });
  },
  bizAccess: null,
  accessSyncFailed: false,
  baseAccessFailed: false,
  bizAccessFailed: false,
  refreshBizAccess: async (force = false) => {
    const uid2 = get().currentUserId;
    if (!uid2) {
      set({ bizAccess: null });
      return;
    }
    const now2 = Date.now();
    if (!shouldRefresh(accessAt.biz, now2, force) || !shouldRefresh(accessAttemptAt.biz, now2, force)) return;
    accessAttemptAt.biz = now2;
    return force ? bizLoads.refresh(uid2) : bizLoads.join(uid2);
  },
  _loadBiz: async () => {
    const uid2 = get().currentUserId;
    if (!uid2) return;
    const { data, error } = await supabase.rpc("biz_effective_access");
    if (get().currentUserId !== uid2) return;
    const r = mergeAccess(get().bizAccess, accessAt.biz, uid2, { data, error }, Date.now());
    accessAt.biz = r.verifiedAt;
    const baseFailed = get().baseAccessFailed;
    if (r.value !== get().bizAccess || r.failed !== get().bizAccessFailed)
      set({ bizAccess: r.value, bizAccessFailed: r.failed, accessSyncFailed: r.failed || baseFailed });
  },
  users: [],
  roles: [],
  currentUserId: null,
  loaded: false,
  initialized: false,
  init: async () => {
    if (get().initialized || initStarted) return;
    initStarted = true;
    supabase.auth.onAuthStateChange((event, session) => {
      const nextId = session?.user?.id ?? null;
      const prevId = get().currentUserId;
      const action = authEventAction(event, prevId, nextId, get().initialized && get().loaded);
      if (action === "ignore") return;
      if (nextId !== prevId) {
        accessAt.base = null;
        accessAt.biz = null;
        accessAttemptAt.base = null;
        accessAttemptAt.biz = null;
        set({ users: [], roles: [], loaded: false, bizAccess: null, baseAccess: null, accessSyncFailed: false, baseAccessFailed: false, bizAccessFailed: false });
      }
      set({ currentUserId: nextId });
      if (action === "clear") {
        set({ users: [], roles: [], loaded: false });
        return;
      }
      setTimeout(() => {
        if (action === "reload") void get().reload();
        else if (nextId) void authLoads.join(nextId);
      }, 0);
    });
    try {
      if (typeof window !== "undefined") {
        const tabAlive = !!sessionStorage.getItem(TAB_ALIVE_KEY);
        const policy = sessionPolicy({
          tabAlive,
          remember: localStorage.getItem(REMEMBER_KEY),
          since: Number(localStorage.getItem(REMEMBER_SINCE_KEY) || 0),
          now: Date.now()
        });
        sessionStorage.setItem(TAB_ALIVE_KEY, "1");
        if (policy === "drop") {
          localStorage.removeItem(REMEMBER_KEY);
          localStorage.removeItem(REMEMBER_SINCE_KEY);
          await supabase.auth.signOut({ scope: "local" });
        }
      }
    } catch {
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ currentUserId: user?.id ?? null });
      set({ initialized: true });
      if (user) await authLoads.join(user.id);
    } finally {
      set({ initialized: true });
    }
  },
  reload: async () => {
    const uid2 = get().currentUserId;
    if (uid2) await authLoads.refresh(uid2);
  },
  _load: async () => {
    const requestedUser = get().currentUserId;
    if (!requestedUser) return;
    const accessReads = Promise.all([get().refreshBizAccess(true), get().refreshBaseAccess(true)]);
    const [dirRes, fullProfRes, rolesRes, urRes, ovRes] = await Promise.all([
      supabase.rpc("get_profiles_directory"),
      // RLS limits this to self + (admins see all). Sensitive fields are merged in for those rows.
      supabase.from("profiles").select("*"),
      supabase.from("app_roles").select("*").order("name"),
      supabase.from("user_roles").select("*"),
      supabase.from("user_permission_overrides").select("*")
    ]);
    if (get().currentUserId !== requestedUser) return;
    if (fullProfRes.error && dirRes.error) {
      set({ users: [], roles: [], loaded: true });
      await accessReads;
      return;
    }
    const directory = dirRes.data ?? fullProfRes.data ?? [];
    const fullProfiles = fullProfRes.data ?? [];
    const fullById = new Map(fullProfiles.map((p) => [p.id, p]));
    const merged = directory.map((d) => fullById.get(d.id) ?? d).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const userRoles = urRes.data ?? [];
    const overrides = ovRes.data ?? [];
    const users = merged.map((p) => mapProfileToUser(p, userRoles, overrides));
    const roles = (rolesRes.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? void 0,
      permissions: r.permissions ?? [],
      system: !!r.is_system,
      catalogState: r.catalog_state,
      catalogGroup: r.catalog_group ?? void 0,
      catalogPending: r.catalog_pending ?? []
    }));
    set({ users, roles, loaded: true });
    await accessReads;
  },
  ensureSeed: async () => {
  },
  touchPresence: async () => {
    const uid2 = get().currentUserId;
    if (!uid2) return;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    try {
      const { error } = await supabase.from("profiles").update({ last_seen_at: nowIso }).eq("id", uid2);
      if (error || get().currentUserId !== uid2) return;
      set((s) => ({
        users: s.users.map((u) => u.id === uid2 ? { ...u, lastSeenAt: nowIso } : u)
      }));
    } catch {
    }
  },
  login: async (usernameOrEmail, password, remember = true) => {
    try {
      const input = usernameOrEmail.trim();
      const result = input.includes("@") ? await supabase.auth.signInWithPassword({ email: input.toLowerCase(), password }) : await (async () => {
        const signed = await usernameSignIn({ data: { username: input, password } });
        if (!signed.ok) return { data: { user: null }, error: null, loginError: signed.error };
        return supabase.auth.setSession(signed.session);
      })();
      if ("loginError" in result) return { ok: false, error: result.loginError };
      const { data, error } = result;
      if (error || !data.user) return { ok: false, error: authErrorMessage(error) };
      const { data: prof, error: profileError } = await supabase.from("profiles").select("status").eq("id", data.user.id).maybeSingle();
      const status = prof?.status;
      if (profileError || accountAccess(status) === "missing") {
        await supabase.auth.signOut({ scope: "local" });
        return { ok: false, error: "Không kiểm tra được hồ sơ tài khoản. Vui lòng thử lại hoặc liên hệ quản trị viên." };
      }
      if (accountAccess(status) === "blocked") {
        await supabase.auth.signOut();
        const msg = status === "Tạm khóa" ? "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin." : status === "Từ chối" ? "Tài khoản của bạn đã bị từ chối." : status === "Lưu trữ" ? "Tài khoản đã được lưu trữ." : "Tài khoản không khả dụng.";
        return { ok: false, error: msg };
      }
      await get().reload();
      writeRememberChoice(remember);
      return { ok: true };
    } catch {
      return { ok: false, error: authErrorMessage(null) };
    }
  },
  logout: async () => {
    await Promise.resolve().then(() => client).then((m) => m.disablePush()).catch(() => {
    });
    await supabase.auth.signOut();
  },
  register: async (input) => {
    try {
      const issues = passwordIssues(input.password);
      if (issues.length) return { ok: false, error: issues[0] };
      const username = input.username.trim();
      if (!username) return { ok: false, error: "Vui lòng nhập tên đăng nhập." };
      if (username.toLowerCase() === "admin") return { ok: false, error: "Tên đăng nhập 'Admin' đã được hệ thống sử dụng." };
      const email = input.email?.trim().toLowerCase() ?? "";
      if (isFakeEmail(email)) return { ok: false, error: "Vui lòng nhập email thật để nhận liên kết xác nhận tài khoản." };
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : void 0;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            full_name: input.fullName,
            phone: input.phone,
            desired_position: input.desiredPosition,
            notes: input.notes
          }
        }
      });
      if (error) {
        const msg = ["user_already_exists", "unexpected_failure"].includes(error.code ?? "") ? "Không thể đăng ký với thông tin này. Vui lòng kiểm tra tên đăng nhập/email hoặc yêu cầu xác nhận email nếu đã đăng ký." : authErrorMessage(error, "password");
        return { ok: false, error: msg };
      }
      if (!data.user) return { ok: false, error: "Không tạo được tài khoản. Vui lòng thử lại." };
      await supabase.auth.signOut();
      return { ok: true };
    } catch {
      return { ok: false, error: "Không đăng ký được lúc này. Vui lòng thử lại." };
    }
  },
  approve: async (id, roleId) => {
    const { data, error } = await supabase.rpc("account_approve", { _target: id, ...roleId ? { _role: roleId } : {} });
    if (error) throw new Error(error.message);
    await get().reload();
    return data;
  },
  reject: async (id) => {
    const { data, error } = await supabase.from("profiles").update({ status: "Từ chối" }).eq("id", id).select("id");
    if (error || !data?.length) throw new Error(error?.message ?? "Không cập nhật được tài khoản. Vui lòng kiểm tra quyền.");
    await get().reload();
  },
  setStatus: async (id, status) => {
    const { data, error } = await supabase.from("profiles").update({ status }).eq("id", id).select("id");
    if (error || !data?.length) throw new Error(error?.message ?? "Không cập nhật được trạng thái tài khoản.");
    await get().reload();
  },
  setRole: async (id, roleId) => {
    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", id);
    if (deleteError) throw new Error(deleteError.message);
    const { error } = await supabase.from("user_roles").insert({ user_id: id, role_id: roleId });
    if (error) throw new Error(error.message);
    await get().reload();
  },
  setUseCustom: async (id, useCustom) => {
    const existing = get().users.find((u) => u.id === id);
    const perms = existing?.customPermissions ?? [];
    const { error } = await supabase.from("user_permission_overrides").upsert({ user_id: id, use_custom: useCustom, permissions: perms });
    if (error) throw new Error(error.message);
    await get().reload();
  },
  setCustomPerms: async (id, perms) => {
    const { error } = await supabase.from("user_permission_overrides").upsert({ user_id: id, use_custom: true, permissions: perms });
    if (error) throw new Error(error.message);
    await get().reload();
  },
  updateUser: async (id, patch) => {
    const dbPatch = {};
    if (patch.fullName !== void 0) dbPatch.full_name = patch.fullName;
    if (patch.email !== void 0 && patch.email !== get().users.find((u) => u.id === id)?.email) throw new Error("Email đăng nhập phải được thay đổi qua xác thực email.");
    if (patch.phone !== void 0) dbPatch.phone = patch.phone || null;
    if (patch.desiredPosition !== void 0) dbPatch.desired_position = patch.desiredPosition || null;
    if (patch.notes !== void 0) dbPatch.notes = patch.notes || null;
    if (patch.mustChangePassword !== void 0) dbPatch.must_change_password = patch.mustChangePassword;
    if (Object.keys(dbPatch).length === 0) return;
    const { data, error } = await supabase.from("profiles").update(dbPatch).eq("id", id).select("id");
    if (error || !data?.length) throw new Error(error?.message ?? "Không lưu được hồ sơ tài khoản.");
    await get().reload();
  },
  resetPassword: async (id, newPassword) => {
    return adminResetPassword({ data: { userId: id, newPassword } });
  },
  changeOwnPassword: async (oldPwd, newPwd) => {
    const issues = passwordIssues(newPwd);
    if (issues.length) return { ok: false, error: issues[0] };
    const { data: identity } = await supabase.auth.getUser();
    const email = identity.user?.email;
    const userId = identity.user?.id;
    if (!email || !userId) return { ok: false, error: "Chưa đăng nhập." };
    const { createClient } = await import("../_libs/supabase__supabase-js.mjs");
    const probe = createClient(
      "https://qhfziehibhmqkpknqxle.supabase.co",
      "sb_publishable_QDwzhN3bBCbmu15eYhDVzQ_QibcF_3q",
      { auth: { persistSession: false, autoRefreshToken: false, storage: void 0 } }
    );
    const { error: verifyErr } = await probe.auth.signInWithPassword({ email, password: oldPwd });
    if (verifyErr) return { ok: false, error: verifyErr.code === "invalid_credentials" ? "Mật khẩu hiện tại không đúng." : authErrorMessage(verifyErr) };
    const { error } = await supabase.auth.updateUser({ password: newPwd, current_password: oldPwd });
    if (error) {
      return { ok: false, error: authErrorMessage(error, "password") };
    }
    await supabase.from("profiles").update({ must_change_password: false }).eq("id", userId);
    await get().reload();
    return { ok: true };
  },
  removeUser: async (id) => {
    await adminDeleteUser({ data: { userId: id } });
    await get().reload();
  },
  updateRole: async (id, patch) => {
    const dbPatch = {};
    if (patch.name !== void 0) dbPatch.name = patch.name;
    if (patch.description !== void 0) dbPatch.description = patch.description;
    if (patch.permissions !== void 0) dbPatch.permissions = patch.permissions;
    if (Object.keys(dbPatch).length === 0) return;
    const { error } = await supabase.from("app_roles").update(dbPatch).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  }
}));
function getUserPermissions(user, roles) {
  if (!user) return /* @__PURE__ */ new Set();
  if (user.useCustom && user.overrideMode !== "additive") {
    return new Set(user.customPermissions ?? []);
  }
  const ids = user.roleIds && user.roleIds.length > 0 ? user.roleIds : user.roleId ? [user.roleId] : [];
  const perms = /* @__PURE__ */ new Set();
  for (const id of new Set(ids)) {
    const role = roles.find((r) => r.id === id);
    if (role) for (const p of role.permissions) perms.add(p);
  }
  if (user.useCustom && user.customPermissions) for (const p of user.customPermissions) perms.add(p);
  return perms;
}
function isOwnRecord(record, userId) {
  if (!record || !userId) return false;
  const fields = [
    "createdBy",
    "created_by",
    "ownerId",
    "owner",
    "assignee",
    "assigneeId",
    "assignedTo",
    "assigned_to",
    "writer",
    "writerId",
    "reviewer",
    "reviewerId",
    "scriptReviewer",
    "videoReviewer",
    "requester",
    "requesterId",
    "publisher",
    "publisherId"
  ];
  for (const f of fields) {
    const v = record[f];
    if (typeof v === "string" && v === userId) return true;
    if (Array.isArray(v) && v.includes(userId)) return true;
  }
  return false;
}
function auditDependencies(perms) {
  const set = new Set(perms);
  const out = [];
  for (const k of perms) {
    const parents = PERMISSION_DEPENDS[k] ?? [];
    const missing = parents.filter((p) => !set.has(p));
    if (missing.length > 0) out.push({ key: k, missing });
  }
  return out;
}
function useCurrentUser() {
  const u = useAuth((s) => s.users.find((x) => x.id === s.currentUserId) || null);
  const roles = useAuth((s) => s.roles);
  const bizAccess = useAuth((s) => s.bizAccess);
  const baseAccess = useAuth((s) => s.baseAccess);
  const perms = getUserPermissions(u, roles);
  const isSuperAdmin = u?.roleId === SUPER_ADMIN_ID || !!u?.system;
  const isAdmin = isSuperAdmin;
  const hasRaw = (key) => perms.has(key) || perms.has(resolvePermKey(key));
  const can = (key) => {
    if (!u || u.status !== "Đang hoạt động") return false;
    if (isSuperAdmin) return true;
    const effective = baseAccess?.user_id === u.id ? verifiedPermission(baseAccess, key) : void 0;
    if (effective !== void 0) return effective;
    if ([...VERIFIED_APPOINTMENT_PERMISSIONS, "sale_work.access", "sale_work.view_own", "sale_work.manage_settings", "sale_work.manage_credentials", "sale_work.view_audit", "biz.crm_use", "org.view", "org.assign_staff", "org.appoint_manager", "org.view_history"].includes(key) && baseAccess?.user_id !== u.id) return false;
    if (key.startsWith("biz.") || key.startsWith("k3.")) return bizAccess?.user_id === u.id && bizAccess.permissions.includes(key) || false;
    return hasRaw(resolvePermKey(key));
  };
  const canAny = (...keys) => keys.some(can);
  const canAll = (...keys) => keys.every(can);
  const canSee = (record, viewAllKey, viewMineKey) => {
    if (!u || u.status !== "Đang hoạt động") return false;
    if (isSuperAdmin) return true;
    if (can(viewAllKey)) return true;
    if (can(viewMineKey)) return isOwnRecord(record, u?.id);
    return false;
  };
  const scopeList = (list, viewAllKey, viewMineKey, matchOwn) => {
    if (!u || u.status !== "Đang hoạt động") return [];
    if (isSuperAdmin || can(viewAllKey)) return list;
    if (!can(viewMineKey)) return [];
    return list.filter((it) => isOwnRecord(it, u?.id) || (matchOwn ? matchOwn(it) : false));
  };
  return {
    user: u,
    role: u ? roles.find((r) => r.id === u.roleId) : void 0,
    perms,
    can,
    canAny,
    canAll,
    canSee,
    scopeList,
    isSuperAdmin,
    isAdmin
  };
}
function SignalCacheGuard() {
  const uid2 = useAuth((s) => s.currentUserId);
  const qc = useQueryClient();
  const previous = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    if (previous.current !== void 0 && previous.current !== uid2) {
      qc.removeQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("sig:") });
    }
    previous.current = uid2;
  }, [uid2, qc]);
  return null;
}
const appCss = "/assets/styles-aNeg4tiP.css";
const def = (d) => {
  const availability = d.availability ?? (d.notReady ? "none" : "linked");
  return { direction: "at_least", ...d, availability };
};
const KPI_METRICS = {
  web_content_completed: def({
    key: "web_content_completed",
    label: "Content được duyệt",
    unit: "count",
    category: "web",
    group: "Website & Content",
    scopes: ["global", "brand", "website"],
    source: "Content Web",
    rule: "Bài được duyệt lần đầu trong kỳ; ghi nhận cho người gửi duyệt bản được duyệt."
  }),
  web_product_published: def({
    key: "web_product_published",
    label: "Sản phẩm Website đã đăng / cập nhật",
    unit: "count",
    category: "web",
    group: "Website & Content",
    scopes: ["global", "brand", "website"],
    availability: "none",
    source: "Chưa có module sản phẩm",
    rule: "Dùng KR tùy chỉnh liên kết Task."
  }),
  seo_keyword_top: def({
    key: "seo_keyword_top",
    label: "Từ khóa đạt Top N",
    unit: "count",
    category: "seo",
    group: "SEO",
    direction: "threshold",
    needs: "keyword",
    scopes: ["global", "brand", "website"],
    source: "SEO / Check Top",
    rule: "Đạt khi thứ hạng mới nhất ≤ ngưỡng. Chỉ có thứ hạng hiện tại, chưa có lịch sử từng ngày."
  }),
  seo_organic_clicks: def({
    key: "seo_organic_clicks",
    label: "Organic Clicks",
    unit: "count",
    category: "seo",
    group: "SEO",
    needs: "website",
    scopes: ["website"],
    availability: "periodic",
    source: "Báo cáo tăng trưởng Website (nhập theo kỳ)",
    rule: "Tổng Clicks các kỳ Tháng trong thời gian KR, hoặc % tăng so với kỳ gốc liền trước. Chưa nối Search Console."
  }),
  seo_organic_traffic: def({
    key: "seo_organic_traffic",
    label: "Organic Traffic",
    unit: "count",
    category: "seo",
    group: "SEO",
    direction: "growth",
    scopes: ["global", "brand", "website"],
    availability: "configure",
    source: "Số liệu tăng trưởng (nhập tay)",
    rule: "Cần kết nối Analytics để tự động."
  }),
  social_post_completed: def({
    key: "social_post_completed",
    label: "Bài Social được duyệt",
    unit: "count",
    category: "social",
    group: "Social",
    scopes: ["global", "brand", "social"],
    source: "Social",
    rule: "Bài được duyệt lần đầu trong kỳ; gắn đúng Thương hiệu → Kênh."
  }),
  social_reach: def({
    key: "social_reach",
    label: "Lượt tiếp cận / lượt xem",
    unit: "count",
    category: "social",
    group: "Social",
    scopes: ["global", "brand", "social"],
    availability: "configure",
    source: "Số liệu tăng trưởng kênh (nhập tay)"
  }),
  social_engagement: def({
    key: "social_engagement",
    label: "Lượt tương tác",
    unit: "count",
    category: "social",
    group: "Social",
    scopes: ["global", "brand", "social"],
    availability: "configure",
    source: "Số liệu tăng trưởng kênh (nhập tay)"
  }),
  social_followers_growth: def({
    key: "social_followers_growth",
    label: "Người theo dõi mới",
    unit: "count",
    category: "social",
    group: "Social",
    direction: "growth",
    scopes: ["global", "brand", "social"],
    availability: "configure",
    source: "Số liệu tăng trưởng kênh (nhập tay)"
  }),
  video_script_completed: def({
    key: "video_script_completed",
    label: "Kịch bản video được duyệt",
    unit: "count",
    category: "video",
    group: "Video",
    scopes: ["global", "brand"],
    source: "Video"
  }),
  video_shoot_completed: def({
    key: "video_shoot_completed",
    label: "Video hoàn thành quay",
    unit: "count",
    category: "video",
    group: "Video",
    scopes: ["global", "brand"],
    source: "Video",
    notReady: "Chưa sẵn sàng: cần ghi nhận người quay — chưa có dữ liệu."
  }),
  video_edit_completed: def({
    key: "video_edit_completed",
    label: "Video được duyệt",
    unit: "count",
    category: "video",
    group: "Video",
    scopes: ["global", "brand"],
    source: "Video",
    rule: "Bản dựng được duyệt lần đầu (Chờ duyệt video → Video đã duyệt); ghi nhận cho người dựng."
  }),
  video_published: def({
    key: "video_published",
    label: "Video đã đăng",
    unit: "count",
    category: "video",
    group: "Video",
    scopes: ["global", "brand", "social"],
    source: "Video",
    rule: "Một video đăng nhiều nền tảng vẫn là một video sản xuất."
  }),
  design_order_completed: def({
    key: "design_order_completed",
    label: "Thiết kế hoàn thành",
    unit: "count",
    category: "design",
    group: "Thiết kế",
    scopes: ["global", "brand"],
    source: "Order",
    rule: "Theo nghiệm thu của module Order, không đếm số file."
  }),
  design_points_completed: def({
    key: "design_points_completed",
    label: "Điểm thiết kế hoàn thành",
    unit: "point",
    category: "design",
    group: "Thiết kế",
    scopes: ["global", "brand"],
    source: "Order",
    notReady: "Chưa sẵn sàng: cần điểm order đã được Admin duyệt — chưa có dữ liệu."
  }),
  map_post_published: def({
    key: "map_post_published",
    label: "Bài đăng Local",
    unit: "count",
    category: "local",
    group: "Local SEO",
    scopes: ["global", "brand"],
    source: "Local SEO (bài đăng Map)",
    rule: "Bài có trạng thái Đã đăng và ngày đăng trong kỳ, người phụ trách là nhân sự."
  }),
  local_profile_interactions: def({
    key: "local_profile_interactions",
    label: "Tương tác hồ sơ / cuộc gọi",
    unit: "count",
    category: "local",
    group: "Local SEO",
    scopes: ["global", "brand"],
    availability: "none",
    source: "Chưa có nguồn dữ liệu"
  }),
  task_completed: def({
    key: "task_completed",
    label: "Task hoàn thành",
    unit: "count",
    category: "task",
    group: "Hiệu suất",
    scopes: ["global", "brand"],
    source: "Task",
    rule: "Task Hoàn thành, ngày gửi hoàn thành trong kỳ."
  }),
  custom_task_result: def({
    key: "custom_task_result",
    label: "KR tùy chỉnh (liên kết Task)",
    unit: "count",
    category: "task",
    group: "Hiệu suất",
    needs: "tasks",
    scopes: ["global", "brand"],
    source: "Task đã liên kết",
    rule: "Đếm Task đã liên kết ở trạng thái Hoàn thành. Không mặc định 1 Task = cả chỉ tiêu."
  }),
  task_on_time_rate: def({
    key: "task_on_time_rate",
    label: "Tỷ lệ hoàn thành đúng hạn",
    unit: "percent",
    category: "task",
    group: "Hiệu suất",
    scopes: ["global", "brand"],
    source: "Task + lịch sử",
    rule: "Mẫu số: Task hoàn thành trong kỳ có deadline. Đúng hạn: ngày gửi ≤ deadline (không tính thời gian chờ duyệt)."
  }),
  task_first_pass_rate: def({
    key: "task_first_pass_rate",
    label: "Tỷ lệ duyệt lần đầu",
    unit: "percent",
    category: "task",
    group: "Hiệu suất",
    scopes: ["global", "brand"],
    source: "Task + lịch sử",
    rule: "Mẫu số: Task hoàn thành trong kỳ. Đạt: không có lần phải sửa."
  }),
  task_overdue: def({
    key: "task_overdue",
    label: "Số Task quá hạn",
    unit: "count",
    category: "task",
    group: "Hiệu suất",
    direction: "at_most",
    scopes: ["global", "brand"],
    source: "Task",
    rule: "Task chưa gửi hoàn thành, deadline trong kỳ và đã qua. Task đang chờ duyệt không tính."
  }),
  mkt_leads: def({
    key: "mkt_leads",
    label: "Khách hàng tiềm năng (Lead)",
    unit: "count",
    category: "marketing",
    group: "Marketing",
    needs: "website",
    scopes: ["website"],
    availability: "periodic",
    source: "Báo cáo tăng trưởng Website (nhập theo kỳ)",
    rule: "Tổng Lead của các kỳ Tháng nằm trong thời gian KR. Không phải tích hợp tự động."
  }),
  mkt_conversions: def({
    key: "mkt_conversions",
    label: "Lượt chuyển đổi",
    unit: "count",
    category: "marketing",
    group: "Marketing",
    scopes: ["global", "brand"],
    availability: "none",
    source: "Chưa có nguồn dữ liệu"
  }),
  mkt_cpl: def({
    key: "mkt_cpl",
    label: "Chi phí trên mỗi Lead (CPL)",
    unit: "currency",
    category: "marketing",
    group: "Marketing",
    direction: "at_most",
    scopes: ["global", "brand", "website", "social"],
    availability: "pending",
    source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng",
    ratio: { numerator: "Chi phí (đ)", denominator: "Số Lead hợp lệ" },
    rule: "CPL = tổng chi phí / tổng Lead hợp lệ của các lần ghi nhận đã xác nhận."
  }),
  web_post_published: def({
    key: "web_post_published",
    label: "Bài đăng Website",
    unit: "count",
    category: "web",
    group: "Website & Content",
    scopes: ["global", "brand", "website"],
    source: "Content Web (bước Đăng web)",
    rule: "Bài đã Đăng web, ngày đăng trong kỳ, ghi nhận cho người đăng. Content được duyệt không đồng nghĩa đã đăng."
  }),
  social_post_published: def({
    key: "social_post_published",
    label: "Bài đăng Social",
    unit: "count",
    category: "social",
    group: "Social",
    scopes: ["global", "brand", "social"],
    source: "Social (đúng tài khoản)",
    rule: "Bài trạng thái Đã đăng, ngày đăng trong kỳ, ghi nhận cho người đăng."
  }),
  social_views: def({
    key: "social_views",
    label: "Lượt xem Social",
    unit: "count",
    category: "social",
    group: "Social",
    needs: "social",
    scopes: ["social"],
    availability: "periodic",
    source: "Báo cáo tăng trưởng kênh (nhập theo kỳ)",
    rule: "Tổng lượt xem của đúng một tài khoản; không gộp nhiều nền tảng."
  }),
  video_view_threshold: def({
    key: "video_view_threshold",
    label: "Số video đạt ngưỡng lượt xem",
    unit: "count",
    category: "video",
    group: "Video",
    needs: "views",
    scopes: ["social"],
    availability: "manual",
    source: "Bằng chứng từng video, quản lý xác nhận",
    rule: "Mỗi đường dẫn video chỉ tính 1 lần khi lượt xem ≥ ngưỡng. Không dùng tổng lượt xem của kênh."
  }),
  mkt_quality_leads: def({
    key: "mkt_quality_leads",
    label: "Lead chất lượng",
    unit: "count",
    category: "marketing",
    group: "Marketing",
    scopes: ["global", "brand", "website", "social"],
    availability: "pending",
    source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng",
    rule: "Lead đạt tiêu chí chất lượng đã thống nhất; không cộng trùng một Lead."
  }),
  mkt_conversion_rate: def({
    key: "mkt_conversion_rate",
    label: "Tỷ lệ chuyển đổi",
    unit: "percent",
    category: "marketing",
    group: "Marketing",
    scopes: ["global", "brand", "website", "social"],
    availability: "pending",
    source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng",
    ratio: { numerator: "Số đơn/khách chuyển đổi", denominator: "Số Lead hợp lệ", multiplier: 100 },
    rule: "Tỷ lệ = tổng chuyển đổi / tổng Lead hợp lệ × 100."
  }),
  mkt_orders: def({
    key: "mkt_orders",
    label: "Số đơn hàng",
    unit: "count",
    category: "marketing",
    group: "Marketing",
    scopes: ["global", "brand", "website", "social"],
    availability: "pending",
    source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng"
  }),
  mkt_revenue: def({
    key: "mkt_revenue",
    label: "Doanh thu chuyển đổi",
    unit: "currency",
    category: "marketing",
    group: "Marketing",
    scopes: ["global", "brand", "website", "social"],
    availability: "pending",
    source: "Chờ kết nối — xác nhận thủ công kèm bằng chứng",
    rule: "Chỉ doanh thu được quy cho Marketing theo quy tắc nguồn đã thống nhất."
  }),
  custom_confirmed: def({
    key: "custom_confirmed",
    label: "KR tùy chỉnh (xác nhận kết quả)",
    unit: "count",
    category: "task",
    group: "Hiệu suất",
    needs: "label",
    scopes: ["global", "brand", "website", "social"],
    availability: "manual",
    source: "Kết quả gửi kèm bằng chứng, quản lý xác nhận"
  })
};
const BASIC = [
  ["web_post_published", "Sản lượng"],
  ["social_post_published", "Sản lượng"],
  ["map_post_published", "Sản lượng"],
  ["web_content_completed", "Sản lượng"],
  ["video_edit_completed", "Sản lượng"],
  ["design_order_completed", "Sản lượng"],
  ["task_completed", "Sản lượng"],
  ["task_on_time_rate", "Hiệu suất"],
  ["task_first_pass_rate", "Hiệu suất"],
  ["seo_keyword_top", "Kết quả Marketing"],
  ["seo_organic_clicks", "Kết quả Marketing"],
  ["social_views", "Kết quả Marketing"],
  ["video_view_threshold", "Kết quả Marketing"],
  ["mkt_leads", "Chuyển đổi"],
  ["mkt_quality_leads", "Chuyển đổi"],
  ["mkt_conversion_rate", "Chuyển đổi"],
  ["mkt_orders", "Chuyển đổi"],
  ["mkt_revenue", "Chuyển đổi"],
  ["mkt_cpl", "Chuyển đổi"],
  ["custom_task_result", "Tùy chỉnh"],
  ["custom_confirmed", "Tùy chỉnh"]
];
BASIC.forEach(([k, g], i) => {
  KPI_METRICS[k].krGroup = g;
  if (g !== "Tùy chỉnh") KPI_METRICS[k].basic = i + 1;
});
const KPI_METRIC_LIST = Object.values(KPI_METRICS);
const BASIC_KR_LIST = BASIC.map(([k]) => KPI_METRICS[k]);
const BASIC_KR_GROUPS = ["Sản lượng", "Hiệu suất", "Kết quả Marketing", "Chuyển đổi", "Tùy chỉnh"];
const isManualKr = (m) => !!m && (m.availability === "manual" || m.availability === "pending");
const KR_GROUPS = [...new Set(KPI_METRIC_LIST.map((m) => m.group))];
const AVAILABILITY_LABEL = { linked: "Tự động", periodic: "Số liệu nhập theo kỳ", manual: "Xác nhận thủ công", pending: "Chờ kết nối", configure: "Cần cấu hình", none: "Chưa tích hợp" };
const DIRECTION_LABEL = { at_least: "Đạt ít nhất", at_most: "Không vượt quá", threshold: "Đạt ngưỡng", growth: "Tăng so với kỳ gốc" };
function getKpiMetric(key) {
  return KPI_METRICS[key];
}
const isAssignable = (m) => !!m && !m.notReady && ["linked", "periodic", "manual", "pending"].includes(m.availability);
const VN_TZ = "Asia/Ho_Chi_Minh";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
function toDateKey(value) {
  if (!value) return null;
  const v = value.trim();
  if (DATE_ONLY.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}
function isWithinPeriod(value, periodStart, periodEnd) {
  const k = toDateKey(value);
  const s = toDateKey(periodStart);
  const e = toDateKey(periodEnd);
  if (!k || !s || !e) return false;
  return k >= s && k <= e;
}
function timeOf(value) {
  if (!value) return Number.NaN;
  const t = new Date(value).getTime();
  return t;
}
function krGoalId(item, periods) {
  const md = item.metadata ?? {};
  if ("goalId" in md) return typeof md.goalId === "string" && md.goalId ? md.goalId : null;
  return periods.find((p) => p.id === item.kpiPeriodId)?.goalId ?? null;
}
const krsOfGoal = (goalId, items, periods) => items.filter((i) => krGoalId(i, periods) === goalId);
const directionOf = (metricKey) => getKpiMetric(metricKey)?.direction === "at_most" ? "at_most" : "at_least";
function isAchieved(actual, target, direction) {
  if (actual === null) return null;
  return direction === "at_most" ? actual <= target : actual >= target;
}
const krDeadline = (item, periodEnd) => {
  const d = item.metadata?.deadline;
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : periodEnd;
};
function reachedAt(dates, target, direction, unit) {
  if (direction !== "at_least" || unit !== "count" || target <= 0 || !Number.isInteger(target)) return null;
  const s = dates.filter(Boolean).map((d) => d.slice(0, 10)).sort();
  return s.length >= target ? s[target - 1] : null;
}
const KR_STATE_LABEL = {
  achieved: "Đạt",
  late: "Hoàn thành muộn",
  overdue: "Quá hạn",
  failed: "Không đạt",
  in_progress: "Đang thực hiện",
  insufficient: "Chưa đủ dữ liệu",
  contribution: "Chỉ đóng góp"
};
const KR_STATE_TONE = {
  achieved: "good",
  late: "warn",
  overdue: "bad",
  failed: "bad",
  in_progress: "info",
  insufficient: "none",
  contribution: "none"
};
function evaluateKr(a) {
  const { actual, target, direction, deadline, today } = a;
  const base = { deadline, completedAt: null };
  if (a.contributionOnly) return { ...base, achieved: null, state: "contribution", label: KR_STATE_LABEL.contribution, pct: null };
  if (actual === null) return { ...base, achieved: null, state: "insufficient", label: KR_STATE_LABEL.insufficient, pct: null };
  const pastDeadline = today > deadline;
  if (direction === "at_most") {
    if (actual > target) return { ...base, achieved: false, state: "failed", label: KR_STATE_LABEL.failed, pct: null };
    if (!pastDeadline) return { ...base, achieved: null, state: "in_progress", label: "Đang trong ngưỡng", pct: null };
    return { ...base, achieved: true, state: "achieved", label: KR_STATE_LABEL.achieved, pct: null };
  }
  const pct2 = target > 0 ? Math.min(100, Math.round(actual / target * 100)) : null;
  if (actual >= target) {
    const done = reachedAt(a.evidenceDates ?? [], target, direction, a.unit ?? "");
    if (done && done > deadline) return { achieved: true, state: "late", label: KR_STATE_LABEL.late, pct: pct2, deadline, completedAt: done };
    return { achieved: true, state: "achieved", label: KR_STATE_LABEL.achieved, pct: pct2, deadline, completedAt: done };
  }
  if (pastDeadline) return { ...base, achieved: a.warnings ? null : false, state: "overdue", label: KR_STATE_LABEL.overdue, pct: pct2 };
  return { ...base, achieved: null, state: "in_progress", label: KR_STATE_LABEL.in_progress, pct: pct2 };
}
function lockedResultOf(item) {
  const md = item.metadata ?? {};
  if (!("lockedActual" in md)) return null;
  return {
    actual: typeof md.lockedActual === "number" ? md.lockedActual : null,
    achieved: typeof md.lockedAchieved === "boolean" ? md.lockedAchieved : null,
    lockedAt: typeof md.lockedAt === "string" ? md.lockedAt : "",
    evidence: Array.isArray(md.lockedEvidence) ? md.lockedEvidence : []
  };
}
const isLockedPeriod = (p) => p?.status === "locked" || p?.status === "closed";
const entryStatus = (e) => e.status ?? (e.confirmedBy ? "confirmed" : "pending");
const normLink = (s) => (s ?? "").trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, "");
function confirmedUniqueEntries(entries) {
  const ids = /* @__PURE__ */ new Set();
  const sig = /* @__PURE__ */ new Set();
  const out = [];
  for (const e of entries) {
    if (entryStatus(e) !== "confirmed" || !e.confirmedBy) continue;
    const s = `${normLink(e.link)}|${e.value ?? ""}|${e.numerator ?? ""}|${e.denominator ?? ""}`;
    if (ids.has(e.id) || normLink(e.link) && sig.has(s)) continue;
    ids.add(e.id);
    sig.add(s);
    out.push(e);
  }
  return out;
}
function norm(v) {
  return (v ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}
function matchesEmployee(value, employee) {
  const v = norm(value);
  if (!v) return false;
  if (employee.id && v === norm(employee.id)) return true;
  if (employee.fullName && v === norm(employee.fullName)) return true;
  if (employee.username && v === norm(employee.username)) return true;
  return false;
}
const KR_ENGINE_KEYS = /* @__PURE__ */ new Set([
  "seo_keyword_top",
  "custom_task_result",
  "task_on_time_rate",
  "task_first_pass_rate",
  "task_overdue",
  "map_post_published",
  "web_post_published",
  "social_post_published",
  "seo_organic_clicks",
  "social_views",
  "mkt_leads",
  "video_view_threshold",
  "mkt_quality_leads",
  "mkt_conversion_rate",
  "mkt_orders",
  "mkt_revenue",
  "mkt_cpl",
  "custom_confirmed"
]);
const brandOk = (item, b) => !item.brandId || item.brandId === b;
function completedTasks(emp, item, period, tasks) {
  return tasks.filter((t) => t.status === "Hoàn thành" && matchesEmployee(t.assignee, emp) && brandOk(item, t.brandId) && isWithinPeriod(toDateKey(t.submittedAt), period.periodStart, period.periodEnd));
}
const taskEv = (t, note) => {
  const c = toDateKey(t.submittedAt) ?? "";
  const dl = t.deadline ? toDateKey(t.deadline) : null;
  return {
    sourceType: "task",
    sourceId: t.id,
    title: t.title,
    creditedAt: c,
    brandId: t.brandId ?? null,
    websiteId: null,
    deadline: dl,
    onTime: dl && c ? c <= dl : null,
    firstPass: (t.revisions ?? 0) === 0,
    note
  };
};
function calculateKrItem(emp, item, period, data, today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
  const meta = item.metadata ?? {};
  const base = { metricKey: item.metricKey, warnings: [], supported: true };
  switch (item.metricKey) {
    case "seo_keyword_top": {
      const n = meta.threshold ?? 3;
      const ids = meta.keywordIds ?? [];
      const kws = (data.keywords ?? []).filter((k) => ids.includes(k.id));
      if (!ids.length) return { ...base, actualValue: null, evidence: [], status: "Chưa chọn từ khóa" };
      const siteBrand = (wid) => data.websites?.find((w) => w.id === wid)?.brandId ?? null;
      const warnings = ids.filter((id) => !kws.some((k) => k.id === id)).map((id) => ({ sourceId: id, title: id, message: "Từ khóa không còn trong Check Top." }));
      const evidence = [];
      let valid = 0;
      for (const k of kws) {
        if (item.websiteId && k.websiteId !== item.websiteId) {
          warnings.push({ sourceId: k.id, title: k.keyword, message: "Từ khóa thuộc Website khác — không tính." });
          continue;
        }
        if (item.brandId && siteBrand(k.websiteId) !== item.brandId) {
          warnings.push({ sourceId: k.id, title: k.keyword, message: "Từ khóa thuộc thương hiệu khác — không tính." });
          continue;
        }
        const checked = toDateKey(k.lastCheckDate);
        if (!k.currentTop || !checked) {
          warnings.push({ sourceId: k.id, title: k.keyword, message: "Chưa có thứ hạng đã kiểm tra." });
          continue;
        }
        if (!isWithinPeriod(checked, period.periodStart, period.periodEnd)) {
          warnings.push({ sourceId: k.id, title: k.keyword, message: `Lần kiểm tra ${checked} nằm ngoài thời gian KR — dữ liệu cũ, không tính.` });
          continue;
        }
        valid++;
        if (k.currentTop <= n) evidence.push({
          sourceType: "keyword",
          sourceId: k.id,
          title: `${k.keyword} — Top ${k.currentTop}`,
          creditedAt: toDateKey(k.lastCheckDate) ?? "",
          brandId: siteBrand(k.websiteId),
          websiteId: k.websiteId,
          deadline: null,
          onTime: null,
          firstPass: null,
          note: `Kiểm tra ${k.lastCheckDate}`
        });
      }
      const ended = today > period.periodEnd;
      if (!valid) return { ...base, actualValue: null, evidence: [], warnings, status: "Chưa đủ dữ liệu: chưa có lần Check Top hợp lệ trong thời gian KR" };
      return {
        ...base,
        actualValue: evidence.length,
        evidence,
        warnings,
        status: ended ? void 0 : `Thứ hạng hiện tại — đạt Top ${n} chưa đồng nghĩa hoàn thành khi kỳ chưa kết thúc`
      };
    }
    case "custom_task_result": {
      const ids = meta.taskIds ?? [];
      if (!ids.length) return { ...base, actualValue: null, evidence: [], status: "Chưa liên kết Task" };
      const linked = data.tasks.filter((t) => ids.includes(t.id));
      const warnings = [];
      const ok2 = linked.filter((t) => {
        if (!matchesEmployee(t.assignee, emp)) {
          warnings.push({ sourceId: t.id, title: t.title, message: "Task giao cho người khác — không tính." });
          return false;
        }
        if (!brandOk(item, t.brandId)) {
          warnings.push({ sourceId: t.id, title: t.title, message: "Task thuộc dự án khác — không tính." });
          return false;
        }
        return true;
      });
      const evidence = ok2.filter((t) => t.status === "Hoàn thành" && isWithinPeriod(toDateKey(t.submittedAt), period.periodStart, period.periodEnd)).map((t) => taskEv(t));
      return { ...base, actualValue: evidence.length, evidence, warnings, status: `${evidence.length}/${ok2.length} Task liên kết đã hoàn thành trong kỳ` };
    }
    case "task_on_time_rate": {
      const done = completedTasks(emp, item, period, data.tasks).filter((t) => t.deadline).map((t) => taskEv(t));
      if (!done.length) return { ...base, actualValue: null, evidence: [], denominator: 0, status: "Chưa có Task hoàn thành có deadline" };
      const ok2 = done.filter((e) => e.onTime).length;
      return { ...base, actualValue: Math.round(ok2 / done.length * 1e3) / 10, evidence: done, denominator: done.length };
    }
    case "task_first_pass_rate": {
      const done = completedTasks(emp, item, period, data.tasks).map((t) => taskEv(t));
      if (!done.length) return { ...base, actualValue: null, evidence: [], denominator: 0, status: "Chưa có Task hoàn thành" };
      const ok2 = done.filter((e) => e.firstPass).length;
      return { ...base, actualValue: Math.round(ok2 / done.length * 1e3) / 10, evidence: done, denominator: done.length };
    }
    case "task_overdue": {
      const evidence = data.tasks.filter((t) => {
        if (!matchesEmployee(t.assignee, emp) || !brandOk(item, t.brandId)) return false;
        if (["Hoàn thành", "Đã hủy", "Chờ xác nhận"].includes(t.status)) return false;
        const dl = toDateKey(t.deadline);
        return !!dl && isWithinPeriod(dl, period.periodStart, period.periodEnd) && dl < today;
      }).map((t) => ({ ...taskEv(t), creditedAt: toDateKey(t.deadline) ?? "", onTime: false }));
      return { ...base, actualValue: evidence.length, evidence };
    }
    case "map_post_published": {
      const evidence = (data.mapPosts ?? []).filter((p) => (p.status === "Đã đăng" || p.status === "Hoàn thành") && matchesEmployee(p.owner, emp) && brandOk(item, p.brandId) && isWithinPeriod(toDateKey(p.publishedDate), period.periodStart, period.periodEnd)).map((p) => ({
        sourceType: "map_post",
        sourceId: p.id,
        title: p.title,
        creditedAt: toDateKey(p.publishedDate),
        brandId: p.brandId,
        websiteId: null,
        deadline: null,
        onTime: null,
        firstPass: null
      }));
      return { ...base, actualValue: evidence.length, evidence };
    }
    case "web_post_published": {
      const warnings = [];
      const evidence = [];
      for (const c of data.webContents ?? []) {
        if (!["Đã đăng web", "Kiểm tra index", "Hoàn thành"].includes(c.status)) continue;
        const d = toDateKey(c.publishedAt || c.publishDate);
        if (!d || !isWithinPeriod(d, period.periodStart, period.periodEnd)) continue;
        if (!brandOk(item, c.brandId) || item.websiteId && c.websiteId !== item.websiteId) continue;
        if (!c.publisher) {
          if (matchesEmployee(c.writer, emp)) warnings.push({ sourceId: c.id, title: c.title, message: "Bài đã đăng nhưng chưa ghi người đăng — chưa xác minh, không tính." });
          continue;
        }
        if (!matchesEmployee(c.publisher, emp)) continue;
        evidence.push({ sourceType: "web_content", sourceId: c.id, title: c.title, creditedAt: d, brandId: c.brandId, websiteId: c.websiteId, deadline: null, onTime: null, firstPass: null, note: c.publishedLink || c.url });
      }
      return { ...base, actualValue: evidence.length, evidence, warnings };
    }
    case "social_post_published": {
      const warnings = [];
      const evidence = [];
      for (const p of data.socialPosts ?? []) {
        if (p.status !== "Đã đăng" && p.status !== "Hoàn thành") continue;
        const d = toDateKey(p.publishedDate);
        if (!d || !isWithinPeriod(d, period.periodStart, period.periodEnd)) continue;
        if (!brandOk(item, p.brandId) || item.socialId && p.channelId !== item.socialId) continue;
        if (!p.publisher) {
          warnings.push({ sourceId: p.id, title: p.title, message: "Bài đã đăng nhưng chưa ghi người đăng — chưa xác minh, không tính." });
          continue;
        }
        if (!matchesEmployee(p.publisher, emp)) continue;
        evidence.push({ sourceType: "social_post", sourceId: p.id, title: p.title, creditedAt: d, brandId: p.brandId, websiteId: null, deadline: null, onTime: null, firstPass: null, note: p.publishedLink });
      }
      return { ...base, actualValue: evidence.length, evidence, warnings: warnings.length && !evidence.length ? warnings : warnings.slice(0, 20) };
    }
    case "seo_organic_clicks":
    case "social_views":
    case "mkt_leads": {
      const isSocial = item.metricKey === "social_views";
      const target = isSocial ? item.socialId : item.websiteId;
      if (!target) return { ...base, actualValue: null, evidence: [], status: isSocial ? "Chưa chọn tài khoản Social" : "Chưa chọn Website" };
      const field = item.metricKey === "seo_organic_clicks" ? "clicks" : item.metricKey === "mkt_leads" ? "leads" : "totalViews";
      const rows = (data.growth ?? []).filter((g) => (isSocial ? g.channelId : g.websiteId) === target && g.periodType === "Tháng" && /^\d{4}-\d{2}$/.test(g.periodKey ?? ""));
      const months = monthsIn(period.periodStart, period.periodEnd);
      if (!months) return { ...base, actualValue: null, evidence: [], status: "Số liệu nhập theo Tháng — thời gian KR cần trọn tháng/quý" };
      const sum = (ms) => {
        const got = ms.map((m) => rows.find((r) => r.periodKey === m));
        if (got.some((r) => !r || typeof r[field] !== "number")) return null;
        return { total: got.reduce((a, r) => a + r[field], 0), rows: got };
      };
      const cur = sum(months);
      if (!cur) return { ...base, actualValue: null, evidence: [], status: `Chưa đủ dữ liệu: thiếu số liệu tháng ${months.join(", ")} trong báo cáo tăng trưởng` };
      const evidence = cur.rows.map((r) => ({
        sourceType: "growth",
        sourceId: r.id,
        title: `${r.period}: ${r[field].toLocaleString("vi-VN")}`,
        creditedAt: r.updatedAt ?? r.periodKey ?? "",
        brandId: item.brandId ?? null,
        websiteId: item.websiteId ?? null,
        deadline: null,
        onTime: null,
        firstPass: null,
        note: r.reportLink
      }));
      if (meta.mode === "growth") {
        const prev = shiftMonths(months, -months.length);
        const b = sum(prev);
        if (!b || b.total <= 0) return { ...base, actualValue: null, evidence, status: `Chưa đủ dữ liệu kỳ gốc (${prev.join(", ")})` };
        return { ...base, actualValue: Math.round((cur.total - b.total) / b.total * 1e3) / 10, evidence, status: `Kỳ gốc ${prev.join(", ")}: ${b.total.toLocaleString("vi-VN")} → ${cur.total.toLocaleString("vi-VN")} · số liệu nhập theo kỳ` };
      }
      return { ...base, actualValue: cur.total, evidence, status: "Số liệu nhập theo kỳ (không phải tích hợp tự động)" };
    }
    case "video_view_threshold":
    case "mkt_quality_leads":
    case "mkt_conversion_rate":
    case "mkt_orders":
    case "mkt_revenue":
    case "mkt_cpl":
    case "custom_confirmed": {
      const all = meta.entries ?? [];
      const ok2 = confirmedUniqueEntries(all).filter((e) => isWithinPeriod(toDateKey(e.recordedAt), period.periodStart, period.periodEnd));
      const waiting = all.filter((e) => entryStatus(e) === "pending").length;
      const wait = waiting ? ` · ${waiting} ghi nhận chờ xác nhận` : "";
      const ev = (e, title) => ({
        sourceType: "entry",
        sourceId: e.id,
        title,
        creditedAt: toDateKey(e.recordedAt) ?? "",
        brandId: item.brandId ?? null,
        websiteId: item.websiteId ?? null,
        deadline: null,
        onTime: null,
        firstPass: null,
        note: e.link
      });
      if (!ok2.length) return { ...base, actualValue: null, evidence: [], status: `Chưa có kết quả được xác nhận${wait}` };
      if (item.metricKey === "video_view_threshold") {
        const th = meta.viewThreshold ?? 0;
        const seen = /* @__PURE__ */ new Map();
        for (const e of ok2) {
          const k = (e.link ?? e.id).trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, "");
          if ((e.value ?? 0) >= th && !seen.has(k)) seen.set(k, e);
        }
        const evidence = [...seen.values()].map((e) => ev(e, `${(e.value ?? 0).toLocaleString("vi-VN")} lượt xem`));
        return { ...base, actualValue: evidence.length, evidence, status: `Mỗi video tính 1 lần khi ≥ ${th.toLocaleString("vi-VN")} lượt xem${wait}` };
      }
      const r = getKpiMetric(item.metricKey)?.ratio;
      if (r) {
        const num = ok2.reduce((a, e) => a + (e.numerator ?? 0), 0), den = ok2.reduce((a, e) => a + (e.denominator ?? 0), 0);
        if (den <= 0) return { ...base, actualValue: null, evidence: [], status: `Thiếu ${r.denominator}${wait}` };
        const v = num / den * (r.multiplier ?? 1);
        return {
          ...base,
          actualValue: Math.round(v * 10) / 10,
          denominator: den,
          evidence: ok2.map((e) => ev(e, `${r.numerator}: ${e.numerator ?? 0} · ${r.denominator}: ${e.denominator ?? 0}`)),
          status: `${r.numerator} ${num.toLocaleString("vi-VN")} / ${r.denominator} ${den.toLocaleString("vi-VN")} · xác nhận thủ công${wait}`
        };
      }
      const total = ok2.reduce((a, e) => a + (e.value ?? 0), 0);
      return { ...base, actualValue: total, evidence: ok2.map((e) => ev(e, `${(e.value ?? 0).toLocaleString("vi-VN")}${e.note ? ` — ${e.note}` : ""}`)), status: `Xác nhận thủ công${wait}` };
    }
    default:
      return { ...base, actualValue: null, evidence: [], supported: false };
  }
}
function krAchieved(actual, target, direction = "at_least") {
  return isAchieved(actual, target, direction === "at_most" ? "at_most" : "at_least");
}
function monthsIn(start, end) {
  const [y0, m0, d0] = start.split("-").map(Number), [y1, m1, d1] = end.split("-").map(Number);
  if (d0 !== 1 || d1 !== new Date(y1, m1, 0).getDate()) return null;
  const out = [];
  for (let y = y0, m = m0; y < y1 || y === y1 && m <= m1; m === 12 ? (y++, m = 1) : m++) out.push(`${y}-${String(m).padStart(2, "0")}`);
  return out.length ? out : null;
}
function shiftMonths(ms, by) {
  return ms.map((k) => {
    const [y, m] = k.split("-").map(Number);
    const d = new Date(y, m - 1 + by, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}
function goalLocked(goalId, db2) {
  const isLocked = (s) => s === "locked" || s === "closed";
  if (db2.periods.some((p) => p.goalId === goalId && isLocked(p.status))) return true;
  const krIds = new Set((db2.krs ?? []).filter((k) => k.goalId === goalId).map((k) => k.id));
  return db2.items.some((i) => {
    if (!(i.krId && krIds.has(i.krId)) && i.metadata?.goalId !== goalId) return false;
    const p = db2.periods.find((x) => x.id === i.kpiPeriodId);
    return !!p && isLocked(p.status);
  });
}
function goalDeleteBlockers(goalId, db2) {
  const out = [];
  if (goalLocked(goalId, db2)) out.push("Kỳ KPI liên kết đã khóa/đóng");
  const krs = (db2.krs ?? []).filter((k) => k.goalId === goalId);
  const act = krs.filter((k) => k.status !== "archived" && k.status !== "cancelled").length;
  const arc = krs.filter((k) => k.status === "archived").length;
  const can = krs.filter((k) => k.status === "cancelled").length;
  if (act) out.push(`Còn ${act} KR đang hoạt động`);
  if (arc) out.push(`Còn ${arc} KR đã lưu trữ (bật "Hiện mục đã lưu trữ" để xem)`);
  if (can) out.push(`Còn ${can} KR đã hủy`);
  const krIds = new Set(krs.map((k) => k.id));
  const alloc = db2.items.filter((i) => i.krId && krIds.has(i.krId) || i.metadata?.goalId === goalId).length;
  if (alloc) out.push(`Còn ${alloc} dòng phân bổ/chỉ tiêu KPI`);
  const per = db2.periods.filter((p) => p.goalId === goalId).length;
  if (per) out.push(`Còn ${per} kỳ KPI nhân sự liên kết`);
  return out;
}
function goalCaps(g, db2, perms) {
  const P2 = (k) => typeof perms === "boolean" ? perms : perms[k];
  const locked = goalLocked(g.id, db2);
  const open = g.status === "draft" || g.status === "active";
  const ok2 = open && !locked;
  const reason = locked ? "Kỳ đã khóa — chỉ xem. Nhân bản sang kỳ mới để tiếp tục." : g.status === "cancelled" ? "Mục tiêu đã hủy — chỉ xem." : g.status === "closed" ? "Mục tiêu đã hoàn thành — chỉ xem kết quả." : null;
  const deleteBlockers = goalDeleteBlockers(g.id, db2);
  const edit = ok2 && P2("kpi.goal_edit");
  return {
    edit,
    addKr: ok2 && P2("kpi.kr_assign"),
    allocate: ok2 && P2("kpi.kr_assign"),
    duplicate: P2("kpi.goal_create"),
    cancel: ok2 && P2("kpi.goal_archive"),
    restore: P2("kpi.goal_archive") && g.status === "cancelled" && !locked,
    archive: P2("kpi.goal_archive"),
    delete: P2("kpi.goal_delete") && deleteBlockers.length === 0,
    readOnly: !edit,
    reason,
    deleteBlockers
  };
}
function checkGoalTransition(from, to, locked) {
  if (from === to) return null;
  if (locked) return "Kỳ đã khóa — không đổi trạng thái mục tiêu. Hãy nhân bản sang kỳ mới.";
  if (from === "closed") return "Mục tiêu đã hoàn thành — không mở lại. Hãy nhân bản nếu cần tiếp tục.";
  if (from === "cancelled" && to === "closed") return "Mục tiêu đã hủy không thể chuyển thành Hoàn thành.";
  return null;
}
const KPI_PERM_KEYS = [
  "kpi.view_own",
  "kpi.view_all",
  "kpi.goal_create",
  "kpi.goal_edit",
  "kpi.goal_archive",
  "kpi.goal_delete",
  "kpi.kr_assign",
  "kpi.kr_adjust",
  "kpi.period_manage",
  "kpi.report",
  "kpi.report_export"
];
const KPI_ALL = Object.fromEntries(KPI_PERM_KEYS.map((k) => [k, true]));
Object.fromEntries(KPI_PERM_KEYS.map((k) => [k, false]));
function kpiCan(a, k) {
  return a.p ? a.p[k] : a.isAdmin;
}
const MONTHLY_SOURCE = /* @__PURE__ */ new Set(["seo_organic_clicks", "social_views", "mkt_leads"]);
const uid$1 = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
const now = () => (/* @__PURE__ */ new Date()).toISOString();
class KpiError extends Error {
}
function scopeOf(i) {
  if (i.websiteId) return "website";
  if (i.socialId) return "social";
  if (i.brandId) return "brand";
  return "global";
}
const scopeKey = (i) => `${i.krId ?? ""}|${i.brandId ?? ""}|${i.websiteId ?? ""}|${i.socialId ?? ""}|${i.label ?? ""}|${JSON.stringify(i.metadata?.keywordIds ?? "")}`;
function createKpiService(repo) {
  const MSG = {
    "kpi.goal_create": "Bạn không có quyền Tạo mục tiêu.",
    "kpi.goal_edit": "Bạn không có quyền Sửa mục tiêu.",
    "kpi.goal_archive": "Bạn không có quyền Hủy / Lưu trữ mục tiêu.",
    "kpi.goal_delete": "Bạn không có quyền Xóa mục tiêu.",
    "kpi.kr_assign": "Bạn không có quyền Thêm / Giao KR.",
    "kpi.kr_adjust": "Bạn không có quyền Điều chỉnh KR đã giao.",
    "kpi.period_manage": "Bạn không có quyền Quản lý kỳ KPI."
  };
  const need = (a, k) => {
    if (!kpiCan(a, k)) throw new KpiError(MSG[k] ?? "Bạn không có quyền thao tác KPI.");
  };
  const mutate = (fn) => {
    const db2 = repo.load();
    const r = fn(db2);
    repo.save(db2);
    return r;
  };
  function validateItem(it) {
    const m = getKpiMetric(it.metricKey);
    if (!m) throw new KpiError(`Metric không tồn tại: ${it.metricKey}`);
    if (!Number.isFinite(it.targetValue) || it.targetValue <= 0) throw new KpiError(`Target của "${m.label}" phải > 0.`);
    if (it.websiteId && it.socialId) throw new KpiError("Không gắn đồng thời Website và Social.");
    if ((it.websiteId || it.socialId) && !it.brandId) throw new KpiError("Website/Social phải thuộc một thương hiệu.");
    const sc = scopeOf(it);
    if (!m.scopes.includes(sc)) throw new KpiError(`"${m.label}" không hỗ trợ phạm vi ${sc}.`);
    if (!m.notReady && !isAssignable(m)) throw new KpiError(`"${m.label}" chưa có nguồn dữ liệu tự động — chưa thể giao.`);
    const md = it.metadata ?? {};
    if (m.needs === "keyword" && !md.keywordIds?.length) throw new KpiError("KR thứ hạng cần chọn ít nhất một từ khóa.");
    if (m.needs === "keyword" && md.keywordIds?.length && it.targetValue > md.keywordIds.length) throw new KpiError(`Chỉ tiêu (${it.targetValue}) vượt quá số từ khóa đã chọn (${md.keywordIds.length}).`);
    const dl = it.metadata?.deadline;
    if (dl !== void 0 && !/^\d{4}-\d{2}-\d{2}$/.test(String(dl))) throw new KpiError("Deadline KR không hợp lệ.");
    if (m.needs === "tasks" && !md.taskIds?.length) throw new KpiError("KR tùy chỉnh cần liên kết ít nhất một Task.");
    if (m.needs === "tasks" && !it.label?.trim()) throw new KpiError("KR tùy chỉnh cần tên kết quả.");
    if (m.needs === "label" && !it.label?.trim()) throw new KpiError("KR tùy chỉnh cần tên kết quả.");
    if (m.needs === "website" && !it.websiteId) throw new KpiError(`"${m.label}" cần chọn Website.`);
    if ((m.needs === "social" || m.needs === "views") && !it.socialId) throw new KpiError(`"${m.label}" cần chọn tài khoản Social.`);
    if (m.needs === "views" && !(it.metadata?.viewThreshold > 0)) throw new KpiError("Cần đặt ngưỡng lượt xem mỗi video.");
    return m;
  }
  return {
    list: () => repo.load(),
    listForActor(a) {
      const db2 = repo.load();
      if (a.isAdmin) return db2;
      const periods = db2.periods.filter((p) => p.userId === a.id);
      const ids = new Set(periods.map((p) => p.id));
      return { ...db2, periods, items: db2.items.filter((i) => ids.has(i.kpiPeriodId)), adjustments: [] };
    },
    saveGoal(a, g) {
      if (!g.id) need(a, "kpi.goal_create");
      if (!g.title.trim()) throw new KpiError("Thiếu tiêu đề mục tiêu.");
      if (g.periodEnd < g.periodStart) throw new KpiError("Kỳ không hợp lệ.");
      return mutate((db2) => {
        const existing = g.id ? db2.goals.find((x) => x.id === g.id) : void 0;
        if (existing) {
          const locked = goalLocked(existing.id, db2);
          const err = checkGoalTransition(existing.status, g.status ?? existing.status, locked);
          if (err) throw new KpiError(err);
          const onlyArchive = g.title.trim() === existing.title && g.periodStart === existing.periodStart && g.periodEnd === existing.periodEnd && (g.status ?? existing.status) === existing.status;
          const editable = (existing.status === "draft" || existing.status === "active") && !locked;
          if (!editable && !onlyArchive && (g.status ?? existing.status) === existing.status) throw new KpiError("Mục tiêu đang ở chế độ chỉ xem — không sửa được.");
          const statusChange = (g.status ?? existing.status) !== existing.status;
          const archToggle = !!(g.metadata && "archived" in g.metadata) && g.metadata.archived !== existing.metadata?.archived;
          const toCancelOrRestore = statusChange && (g.status === "cancelled" || existing.status === "cancelled");
          if (onlyArchive && archToggle || toCancelOrRestore) need(a, "kpi.goal_archive");
          else need(a, "kpi.goal_edit");
        }
        const rec = {
          id: existing?.id ?? uid$1(),
          title: g.title.trim(),
          description: g.description ?? null,
          periodStart: g.periodStart,
          periodEnd: g.periodEnd,
          status: g.status ?? "draft",
          brandId: g.brandId ?? null,
          websiteId: g.websiteId ?? null,
          socialId: g.socialId ?? null,
          metadata: { ...existing?.metadata ?? {}, ...g.metadata ?? {} },
          createdBy: existing?.createdBy ?? a.id,
          createdAt: existing?.createdAt ?? now(),
          updatedAt: now()
        };
        db2.goals = existing ? db2.goals.map((x) => x.id === rec.id ? rec : x) : [...db2.goals, rec];
        return rec;
      });
    },
    /** Giao KPI: 1 kỳ cho user + nhiều metric. Chống trùng user+kỳ+metric+scope. */
    assign(a, input) {
      need(a, "kpi.kr_assign");
      if (!input.userId) throw new KpiError("Chưa chọn nhân sự.");
      if (input.periodEnd < input.periodStart) throw new KpiError("Kỳ không hợp lệ.");
      if (!input.items.length) throw new KpiError("Chưa có chỉ tiêu nào.");
      input.items.forEach(validateItem);
      for (const it of input.items) {
        const dl = it.metadata?.deadline;
        if (dl && (dl < input.periodStart || dl > input.periodEnd)) throw new KpiError(`Deadline của "${getKpiMetric(it.metricKey).label}" phải nằm trong kỳ ${input.periodStart} → ${input.periodEnd}.`);
        if (MONTHLY_SOURCE.has(it.metricKey) && !monthsIn(input.periodStart, input.periodEnd))
          throw new KpiError(`"${getKpiMetric(it.metricKey).label}" lấy số liệu theo tháng — hãy chọn kỳ Tháng hoặc Quý (không tự chia ra tuần/ngày).`);
      }
      for (const it of input.items) {
        const nr = getKpiMetric(it.metricKey)?.notReady;
        if (nr) throw new KpiError(nr);
      }
      return mutate((db2) => {
        if (input.goalId) {
          const g = db2.goals.find((x) => x.id === input.goalId);
          if (g && (!(g.status === "draft" || g.status === "active") || goalLocked(g.id, db2))) throw new KpiError("Mục tiêu đã hủy/hoàn thành/khóa kỳ — không phân bổ thêm.");
        }
        let period = db2.periods.find((p) => p.userId === input.userId && p.periodStart === input.periodStart && p.periodEnd === input.periodEnd);
        if (period && (period.status === "locked" || period.status === "closed")) throw new KpiError("Kỳ đã khóa — không thêm chỉ tiêu.");
        const keyOf = (x) => x.metadata?.clientKey;
        const saved = new Set(db2.items.map(keyOf).filter(Boolean));
        input = { ...input, items: input.items.filter((it) => !keyOf(it) || !saved.has(keyOf(it))) };
        if (!input.items.length) return { period: period ?? null, items: [] };
        const seen = new Set(period ? db2.items.filter((i) => i.kpiPeriodId === period.id).map((i) => `${i.metricKey}#${scopeKey(i)}`) : []);
        for (const it of input.items) {
          const k = `${it.metricKey}#${scopeKey(it)}`;
          if (seen.has(k)) throw new KpiError(`KPI trùng: "${getKpiMetric(it.metricKey).label}" cùng phạm vi đã có trong kỳ.`);
          seen.add(k);
        }
        if (!period) {
          period = {
            id: uid$1(),
            userId: input.userId,
            periodType: input.periodType,
            periodStart: input.periodStart,
            periodEnd: input.periodEnd,
            goalId: input.goalId ?? null,
            status: "draft",
            createdBy: a.id,
            createdAt: now(),
            updatedAt: now()
          };
          db2.periods.push(period);
        }
        const pid = period.id;
        const created = input.items.map((it) => ({
          id: uid$1(),
          kpiPeriodId: pid,
          krId: it.krId ?? null,
          metricKey: it.metricKey,
          label: it.label ?? null,
          targetValue: it.targetValue,
          unit: getKpiMetric(it.metricKey).unit,
          targetOperator: ">=",
          brandId: it.brandId ?? null,
          websiteId: it.websiteId ?? null,
          socialId: it.socialId ?? null,
          metadata: { ...it.metadata ?? {}, goalId: input.goalId ?? null },
          createdAt: now(),
          updatedAt: now()
        }));
        db2.items.push(...created);
        return { period, items: created };
      });
    },
    /** Đổi target: chỉ Admin; kỳ locked/closed → chặn. Mọi thay đổi ghi audit. Actual không đổi (tính từ engine). */
    updateTarget(a, itemId, to, reason = "") {
      need(a, "kpi.kr_adjust");
      if (!Number.isFinite(to) || to <= 0) throw new KpiError("Target phải > 0.");
      return mutate((db2) => {
        const it = db2.items.find((i) => i.id === itemId);
        if (!it) throw new KpiError("Không tìm thấy chỉ tiêu.");
        const p = db2.periods.find((x) => x.id === it.kpiPeriodId);
        if (p.status === "locked" || p.status === "closed") throw new KpiError("Kỳ đã khóa — không sửa target.");
        db2.adjustments.push({ id: uid$1(), itemId, field: "targetValue", from: it.targetValue, to, by: a.id, at: now(), reason });
        it.targetValue = to;
        it.updatedAt = now();
        return it;
      });
    },
    /** Cập nhật metadata KR (ghi nhận/xác nhận kết quả thủ công). Chỉ Admin; kỳ khóa → chặn. */
    updateItemMetadata(a, itemId, patch) {
      need(a, "kpi.kr_adjust");
      return mutate((db2) => {
        const it = db2.items.find((i) => i.id === itemId);
        if (!it) throw new KpiError("Không tìm thấy KR.");
        const p = db2.periods.find((x) => x.id === it.kpiPeriodId);
        if (p.status === "locked" || p.status === "closed") throw new KpiError("Kỳ đã khóa — không cập nhật kết quả.");
        it.metadata = { ...it.metadata ?? {}, ...patch };
        it.updatedAt = now();
        return it;
      });
    },
    removeItem(a, itemId) {
      need(a, "kpi.kr_adjust");
      mutate((db2) => {
        const it = db2.items.find((i) => i.id === itemId);
        const p = it && db2.periods.find((x) => x.id === it.kpiPeriodId);
        if (p && (p.status === "locked" || p.status === "closed")) throw new KpiError("Kỳ đã khóa — không xóa chỉ tiêu.");
        db2.items = db2.items.filter((i) => i.id !== itemId);
      });
    },
    /** draft → active → locked → closed (một chiều). Khi khóa: snapshot target vào metadata. */
    setStatus(a, periodId, status, results) {
      need(a, "kpi.period_manage");
      const order = ["draft", "active", "locked", "closed"];
      return mutate((db2) => {
        const p = db2.periods.find((x) => x.id === periodId);
        if (!p) throw new KpiError("Không tìm thấy kỳ.");
        if (order.indexOf(status) < order.indexOf(p.status)) throw new KpiError("Không mở lại kỳ đã khóa — lịch sử không được viết lại.");
        if (status === "locked") {
          for (const it of db2.items.filter((i) => i.kpiPeriodId === p.id)) {
            const r = results?.[it.id];
            it.metadata = {
              ...it.metadata,
              lockedTarget: it.targetValue,
              lockedAt: now(),
              ...r ? { lockedActual: r.actual, lockedAchieved: r.achieved, lockedEvidence: r.evidence.slice(0, 500) } : {}
            };
          }
        }
        p.status = status;
        p.updatedAt = now();
        return p;
      });
    },
    /* ---------- KR chung + phân bổ ---------- */
    saveKr(a, k, reason = "") {
      need(a, k.id ? "kpi.kr_adjust" : "kpi.kr_assign");
      const m = getKpiMetric(k.metricKey);
      if (!m) throw new KpiError(`Metric không tồn tại: ${k.metricKey}`);
      if (!Number.isFinite(k.targetValue) || k.targetValue <= 0) throw new KpiError(`Chỉ tiêu của "${m.label}" phải > 0.`);
      if (k.websiteId && k.socialId) throw new KpiError("Không gắn đồng thời Website và Social.");
      return mutate((db2) => {
        db2.krs = db2.krs ?? [];
        const goal = db2.goals.find((g) => g.id === k.goalId);
        if (!goal) throw new KpiError("Không tìm thấy mục tiêu.");
        if (k.deadline && (k.deadline < goal.periodStart || k.deadline > goal.periodEnd)) throw new KpiError("Deadline KR phải nằm trong kỳ của mục tiêu.");
        const ex = k.id ? db2.krs.find((x) => x.id === k.id) : void 0;
        if (!(goal.status === "draft" || goal.status === "active") || goalLocked(goal.id, db2)) throw new KpiError("Mục tiêu đã hủy/hoàn thành/khóa kỳ — không thêm hoặc sửa KR.");
        if (ex && (ex.websiteId !== (k.websiteId ?? ex.websiteId) || ex.socialId !== (k.socialId ?? ex.socialId)) && db2.items.some((i) => i.krId === ex.id))
          throw new KpiError("KR đã có phân bổ — không đổi Website/Social. Hãy tạo KR mới.");
        const history = [...ex?.metadata?.history ?? []];
        if (ex && ex.targetValue !== k.targetValue) history.push({ from: ex.targetValue, to: k.targetValue, by: a.id, at: now(), reason });
        const rec = {
          id: ex?.id ?? k.id ?? uid$1(),
          goalId: k.goalId,
          metricKey: k.metricKey,
          label: k.label ?? ex?.label ?? null,
          targetValue: k.targetValue,
          brandId: k.brandId !== void 0 ? k.brandId : ex?.brandId ?? goal.brandId,
          websiteId: k.websiteId !== void 0 ? k.websiteId : ex?.websiteId ?? null,
          socialId: k.socialId !== void 0 ? k.socialId : ex?.socialId ?? null,
          deadline: k.deadline !== void 0 ? k.deadline : ex?.deadline ?? null,
          status: k.status ?? ex?.status ?? "active",
          metadata: { ...ex?.metadata ?? {}, ...k.metadata ?? {}, history },
          createdBy: ex?.createdBy ?? a.id,
          createdAt: ex?.createdAt ?? now(),
          updatedAt: now()
        };
        db2.krs = ex ? db2.krs.map((x) => x.id === rec.id ? rec : x) : [...db2.krs, rec];
        return rec;
      });
    },
    setKrStatus(a, krId, status) {
      need(a, "kpi.kr_adjust");
      return mutate((db2) => {
        const k = (db2.krs ?? []).find((x) => x.id === krId);
        if (!k) throw new KpiError("Không tìm thấy KR.");
        const g = db2.goals.find((x) => x.id === k.goalId);
        if (g && goalLocked(g.id, db2) && status !== "archived") throw new KpiError("Kỳ đã khóa — chỉ được lưu trữ KR.");
        if (g && status === "active" && !(g.status === "draft" || g.status === "active")) throw new KpiError("Mục tiêu đã hủy/hoàn thành — không khôi phục KR.");
        k.status = status;
        k.updatedAt = now();
        return k;
      });
    },
    /** Xóa KR: chỉ khi chưa có dòng phân bổ nào. */
    deleteKr(a, krId) {
      need(a, "kpi.kr_adjust");
      mutate((db2) => {
        const kr = (db2.krs ?? []).find((x) => x.id === krId);
        if (kr && goalLocked(kr.goalId, db2)) throw new KpiError("Kỳ đã khóa — không xóa KR.");
        if (db2.items.some((i) => i.krId === krId)) throw new KpiError("KR đã có phân bổ — hãy xóa các dòng chưa có kết quả hoặc chọn Hủy/Lưu trữ.");
        db2.krs = (db2.krs ?? []).filter((x) => x.id !== krId);
      });
    },
    /** Xóa mục tiêu: chỉ khi không còn KR hay chỉ tiêu nào liên kết. */
    deleteGoal(a, goalId) {
      need(a, "kpi.goal_delete");
      mutate((db2) => {
        const why = goalDeleteBlockers(goalId, db2);
        if (why.length) throw new KpiError(`Không thể xóa vĩnh viễn: ${why.join("; ")}. Hãy dùng Hủy hoặc Lưu trữ để giữ lịch sử.`);
        db2.goals = db2.goals.filter((g) => g.id !== goalId);
      });
    }
  };
}
const ROLE_KPI_TEMPLATES = {
  "Content Web": [
    { metricKey: "web_content_completed", targetValue: 20 },
    { metricKey: "social_post_completed", targetValue: 10 },
    { metricKey: "video_script_completed", targetValue: 5 }
  ],
  "Content Social": [{ metricKey: "social_post_completed", targetValue: 30 }],
  "Designer": [{ metricKey: "design_order_completed", targetValue: 40 }],
  "Video": [{ metricKey: "video_edit_completed", targetValue: 12 }, { metricKey: "video_published", targetValue: 12 }]
};
function isKpiV2Enabled() {
  return true;
}
const orgQuery = (uid2) => queryOptions({ queryKey: ["biz_org", uid2], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_org_read");
  if (error) throw error;
  return data;
} });
const workflowsQuery = (uid2) => queryOptions({ queryKey: ["biz_workflows", uid2], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_workflows_read");
  if (error) throw error;
  return data;
} });
const approvalsQuery = (uid2) => queryOptions({ queryKey: ["biz_approvals", uid2], staleTime: 0, refetchInterval: 3e4, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_approvals_read");
  if (error) throw error;
  return data;
} });
function useOrganizationAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (a) => {
    const result = a.kind === "decision" && a.run.content_snapshot.entity === "rolling_plan" ? await supabase.rpc("biz_rolling_decide", { _id: a.run.version_id, _revision: a.run.source_revision, _approve: a.approve, _comment: a.comment }) : a.kind === "org" ? await supabase.rpc("biz_org_save", { _action: a.action, _data: a.data }) : a.kind === "workflow" ? await supabase.rpc("biz_workflow_save", { _data: a.data }) : a.kind === "adopt" ? await supabase.rpc("biz_approval_adopt", { _version: a.run.version_id, _kind: a.run.kind, _confirmed: true }) : a.kind === "override" ? await supabase.rpc("biz_approval_override", { _id: a.run.id, _revision: a.run.revision, _action: a.action, _comment: a.comment, _user: a.user || void 0 }) : a.run.kind.startsWith("late_") ? await supabase.rpc("biz_late_request_decide", { _id: a.run.version_id, _approve: a.approve, _comment: a.comment }) : a.run.kind === "goal_year" ? await supabase.rpc("biz_goal_decide", { _version_id: a.run.version_id, _revision: a.run.source_revision, _approve: a.approve, _comment: a.comment }) : await supabase.rpc("biz_document_decide", { _id: a.run.version_id, _revision: a.run.source_revision, _approve: a.approve, _comment: a.comment });
    if (result.error) throw result.error;
    return result.data;
  }, onSuccess: async () => {
    await useAuth.getState().refreshBizAccess(true);
    await Promise.all([qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("biz_") }), qc.invalidateQueries({ queryKey: ["notifications"] })]);
  } });
}
const approvalCenterQuery = (uid2, executiveFallback = false) => queryOptions({
  queryKey: ["approval_center", uid2, executiveFallback],
  // The aggregate touches every module; keep it fresh without re-running it on
  // every remount/focus. Decisions on module pages invalidate via their own refetch.
  staleTime: 2e4,
  refetchInterval: 6e4,
  queryFn: async ({ signal }) => {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    const timeout = executiveFallback ? setTimeout(() => controller.abort(), 8e3) : null;
    try {
      let fullData = null;
      let fullError = null;
      try {
        const full = await supabase.rpc("approval_center_read").abortSignal(controller.signal);
        fullData = full.data;
        fullError = full.error;
      } catch (error) {
        fullError = error;
      }
      if (!fullError) return fullData;
      if (!executiveFallback || signal.aborted) throw fullError;
      const backup = await supabase.rpc("approval_center_executive_fallback").abortSignal(signal);
      if (backup.error) throw fullError;
      return backup.data;
    } finally {
      if (timeout !== null) clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
    }
  }
});
const GROUP_LABELS = {
  finance: "Tài chính",
  hr: "Nhân sự",
  biz: "Kinh doanh",
  design: "Thiết kế",
  order: "Đơn hàng",
  marketing: "Marketing",
  task: "Công việc",
  sao: "Sao Sứ Việt"
};
const groupLabel = (group) => GROUP_LABELS[group] ?? group;
const sourceGroup = (source) => source === "finance" ? "finance" : source === "leave" || source === "leave_cancel" || source === "attendance" || source === "account" ? "hr" : source === "biz" || source === "k3" ? "biz" : source === "design" ? "design" : source === "video" || source === "web_content" || source === "social_post" || source === "local_map" ? "marketing" : source === "task" ? "task" : source === "sao" ? "sao" : "order";
const time = (v) => {
  if (!v) return void 0;
  let s = v.trim();
  if (/^\d{4}-\d{2}-\d{2} \d/.test(s)) s = s.replace(" ", "T");
  if (/[+-]\d{2}$/.test(s)) s += ":00";
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : void 0;
};
function sortRecent(items, field) {
  return [...items].sort((a, b) => (time(b[field]) ?? -Infinity) - (time(a[field]) ?? -Infinity));
}
function sortTodo(items) {
  return [...items].sort((a, b) => {
    if (!!a.overdue !== !!b.overdue) return a.overdue ? -1 : 1;
    return (time(a.waiting_since) ?? Infinity) - (time(b.waiting_since) ?? Infinity);
  });
}
function filterItems(items, search, group) {
  const q = search.trim().toLocaleLowerCase("vi");
  return items.filter((i) => (group === "all" || sourceGroup(i.source) === group) && (!q || [i.title, i.requester, i.summary, i.code].filter(Boolean).join(" ").toLocaleLowerCase("vi").includes(q)));
}
function waitingText(since, now2) {
  const from = time(since);
  const to = typeof now2 === "string" ? time(now2) : now2 instanceof Date ? now2.getTime() : now2;
  if (!from || !to) return "";
  const minutes = Math.max(0, Math.floor((to - from) / 6e4));
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  return `${days} ngày`;
}
const vnd = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  return new Intl.NumberFormat("vi-VN").format(v) + "đ";
};
const badgeText = (count) => count <= 0 ? "" : count > 99 ? "99+" : String(count);
const dateText = (v) => {
  const t = time(v);
  if (!t) return "";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(t));
};
function parseApprovalUrl(url) {
  if (!url.startsWith("/") || url.startsWith("//")) return null;
  const q = url.indexOf("?");
  const to = q === -1 ? url : url.slice(0, q);
  const search = q === -1 ? {} : Object.fromEntries(new URLSearchParams(url.slice(q + 1)));
  return { to, search };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
function AppNavigation({ groups, path, userId, collapsed = false, onNavigate }) {
  const activePath = activeNavigationPath(groups, path);
  const activeGroup = groups.find((g) => g.items.some((it) => it.to === activePath))?.label;
  const [expanded, setExpanded] = reactExports.useState({});
  const [loadedKey, setLoadedKey] = reactExports.useState("");
  const storageKey = `base-navigation:${userId ?? "signed-out"}`;
  reactExports.useEffect(() => {
    let saved = {};
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        saved = Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === "boolean"));
      }
    } catch {
    }
    setExpanded(saved);
    setLoadedKey(storageKey);
  }, [storageKey]);
  reactExports.useEffect(() => {
    if (activeGroup) setExpanded((previous) => ({ ...previous, [activeGroup]: true }));
  }, [activeGroup, path, loadedKey]);
  reactExports.useEffect(() => {
    if (loadedKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(expanded));
    } catch {
    }
  }, [expanded, loadedKey, storageKey]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { "aria-label": "Điều hướng chính", className: "flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1", children: groups.map((group, index) => {
    const Icon = group.icon;
    const isOpen = !!expanded[group.label];
    const panelId = `base-nav-${index}`;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          type: "button",
          disabled: group.comingSoon,
          title: collapsed ? `${group.label}${group.comingSoon ? " — Sắp ra mắt" : ""}` : void 0,
          "aria-label": group.comingSoon ? `${group.label} — Sắp ra mắt` : group.label,
          "aria-expanded": group.comingSoon ? void 0 : isOpen,
          "aria-controls": group.comingSoon ? void 0 : panelId,
          onClick: () => setExpanded((previous) => ({ ...previous, [group.label]: !previous[group.label] })),
          className: cn("w-full h-auto min-h-11 px-2.5 py-2 text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed ? "justify-center" : "justify-start", activeGroup === group.label && "bg-sidebar-accent"),
          children: [
            Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
            !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 whitespace-normal leading-5 text-[13px]", children: group.label }),
              group.comingSoon ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-normal text-sidebar-foreground/70", children: "Sắp ra mắt" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("transition-transform motion-reduce:transition-none", isOpen && "rotate-180") })
            ] })
          ]
        }
      ),
      !group.comingSoon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: panelId, hidden: !isOpen, className: cn("space-y-0.5 py-1", !collapsed && "ml-3 border-l border-sidebar-border pl-2"), children: group.items.map((item) => {
        const ItemIcon = item.icon;
        const itemClass = cn("w-full h-auto min-h-11 rounded-md px-2 py-2 text-sm md:text-[13px] justify-start text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed && "justify-center", item.to === activePath && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground");
        return item.comingSoon ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", disabled: true, "aria-label": `${item.label} — Sắp ra mắt`, title: collapsed ? `${item.label} — Sắp ra mắt` : void 0, className: itemClass, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIcon, {}),
          !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 whitespace-normal leading-5", children: [
            item.label,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] font-normal", children: "Sắp ra mắt" })
          ] })
        ] }, item.label) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", asChild: true, className: itemClass, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: item.to, onClick: onNavigate, title: collapsed ? item.label : void 0, "aria-label": item.label, "aria-current": item.to === activePath ? "page" : void 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIcon, {}),
          !collapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 whitespace-normal leading-5", children: item.label }),
            item.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] rounded bg-sidebar-accent px-1 text-sidebar-foreground", children: item.badge })
          ] })
        ] }) }, item.to);
      }) })
    ] }, group.label);
  }) });
}
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Dialog = Root;
const DialogTrigger = Trigger$3;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
function launcherApps(groups) {
  return groups.flatMap((g) => g.items).filter((i) => !i.comingSoon && !!i.to);
}
function storedPins(value) {
  return Array.isArray(value) ? [...new Set(value.filter((p) => typeof p === "string" && p.length > 0))] : [];
}
function reconcilePins(value, groups, accessReady) {
  return accessReady ? allowedPins(value, groups) : storedPins(value);
}
function allowedPins(value, groups) {
  const allowed = new Set(launcherApps(groups).map((i) => i.to));
  return Array.isArray(value) ? [...new Set(value.filter((p) => typeof p === "string" && allowed.has(p)))] : [];
}
const pinStorageKey = (uid2) => `base-launcher-pins:${uid2}`;
const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
const aliases = { "/tasks": "cong viec todo", "/leave": "nghi phep don tu nhan su", "/orders": "order thiet ke", "/biz/3k": "3k kg kf cong viec", "/finance/incoming": "tien ve ke toan", "/signals": "tin hieu co hoi khach hang", "/attendance": "cham cong giai trinh" };
function searchLauncher(groups, query) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return groups.flatMap((g) => g.items.filter((i) => !i.comingSoon && !!i.to && words.every((w) => normalize(`${i.label} ${g.label} ${aliases[i.to] ?? ""}`).includes(w))));
}
function movePin(pins, path, direction) {
  const index = pins.indexOf(path), next = index + direction;
  if (index < 0 || next < 0 || next >= pins.length) return pins;
  const copy = [...pins];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}
function suggestedLauncherApps(groups, limit = 6) {
  const apps = launcherApps(groups).filter((item) => item.to !== "/");
  const preferred = ["/tasks", "/approvals", "/signals", "/leave", "/orders", "/finance/incoming"];
  const byRoute = new Map(apps.map((item) => [item.to, item]));
  const routes = [.../* @__PURE__ */ new Set([...preferred.filter((path) => byRoute.has(path)), ...apps.map((item) => item.to)])];
  return routes.slice(0, Math.max(0, limit)).map((path) => byRoute.get(path));
}
const MESSAGES = {
  morning: [
    { title: "Chào buổi sáng", subtitle: "Bắt đầu ngày mới với những việc quan trọng nhất nhé." },
    { title: "Buổi sáng tốt lành", subtitle: "Một ngày làm việc rõ mục tiêu, cùng Sứ Việt tiến bước." },
    { title: "Khởi đầu ngày mới", subtitle: "Xem nhanh kế hoạch hôm nay và sẵn sàng bắt đầu!" }
  ],
  midday: [
    { title: "Chào buổi trưa", subtitle: "Giữa ngày rồi, cùng nhìn lại tiến độ một chút nhé." },
    { title: "Buổi trưa nhẹ nhàng", subtitle: "Những việc ưu tiên đã tới đâu? Kiểm tra nhanh nào." },
    { title: "Giữa ngày rồi", subtitle: "Dành chút thời gian sắp xếp phần việc còn lại nhé." }
  ],
  afternoon: [
    { title: "Chào buổi chiều", subtitle: "Cùng tập trung vào những việc cần hoàn thành hôm nay." },
    { title: "Buổi chiều tốt lành", subtitle: "Kiểm tra tiến độ và xử lý các đầu việc quan trọng." },
    { title: "Tiếp nối một ngày hiệu quả", subtitle: "Mỗi việc hoàn tất là thêm một bước tiến của Sứ Việt." }
  ],
  evening: [
    { title: "Chào buổi tối", subtitle: "Cùng nhìn lại những việc đã hoàn thành hôm nay nhé." },
    { title: "Buổi tối tốt lành", subtitle: "Xem nhanh các đầu việc còn chờ bạn xử lý." },
    { title: "Khép lại ngày làm việc", subtitle: "Một ngày tại Sứ Việt, thêm nhiều điều đáng ghi nhận." }
  ],
  late: [
    { title: "Chào buổi khuya", subtitle: "Chỉ kiểm tra việc thật cần thiết, rồi nghỉ ngơi nhé." },
    { title: "Đêm đã muộn", subtitle: "Chúc bạn sớm khép lại công việc và có thời gian nghỉ ngơi." },
    { title: "Chúc một đêm an lành", subtitle: "Sứ Việt luôn ở đây khi bạn cần xem lại công việc." }
  ]
};
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
function launcherDayPeriod(hour) {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "midday";
  if (hour >= 14 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "late";
}
function launcherGreetingAt(now2, name, userId = "") {
  const period = launcherDayPeriod(now2.getHours());
  const choices = MESSAGES[period];
  const localDay = Math.floor(Date.UTC(now2.getFullYear(), now2.getMonth(), now2.getDate()) / 864e5);
  let userSeed = 0;
  for (const char of userId) userSeed = userSeed * 31 + char.charCodeAt(0) >>> 0;
  const choice = choices[(localDay + userSeed % choices.length) % choices.length];
  const displayName = name?.replace(/\s+/g, " ").trim().slice(0, 64);
  return {
    period,
    eyebrow: `${WEEKDAYS[now2.getDay()]} · ${String(now2.getDate()).padStart(2, "0")}/${String(now2.getMonth() + 1).padStart(2, "0")}`,
    title: `${choice.title}${displayName ? `, ${displayName}` : ""}!`,
    subtitle: choice.subtitle
  };
}
const tones = {
  "Điều hành": "launcher-tone-primary",
  "Kinh doanh": "launcher-tone-success",
  "Showroom": "launcher-tone-muted",
  "Marketing": "launcher-tone-info",
  "Thiết Kế": "launcher-tone-design",
  "Mua Hàng & Giao Vận": "launcher-tone-primary",
  "Kế Toán & Tài Chính": "launcher-tone-success",
  "Hành Chính & Nhân Sự": "launcher-tone-info",
  "Sao Sứ Việt": "launcher-tone-reward",
  "Hệ thống": "launcher-tone-muted"
};
function MobileLauncher({ groups, userId, area, accessReady = true, name }) {
  const [query, setQuery] = reactExports.useState("");
  const [localNow, setLocalNow] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const update = () => setLocalNow(/* @__PURE__ */ new Date());
    update();
    const timer = window.setInterval(update, 6e4);
    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  const greeting = localNow ? launcherGreetingAt(localNow, name, userId) : null;
  const [saved, setSaved] = reactExports.useState();
  const [showAll, setShowAll] = reactExports.useState(false);
  const [storageError, setStorageError] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState();
  const pins = allowedPins(saved?.uid === userId ? saved.pins : [], groups);
  const signature = launcherApps(groups).map((i) => i.to).join("|");
  reactExports.useEffect(() => {
    let value = [];
    try {
      value = JSON.parse(localStorage.getItem(pinStorageKey(userId)) ?? "[]");
    } catch {
    }
    setSaved({ uid: userId, pins: storedPins(value) });
    setQuery("");
  }, [userId]);
  reactExports.useEffect(() => {
    if (saved?.uid !== userId || !accessReady) return;
    const clean = reconcilePins(saved.pins, groups, accessReady);
    try {
      localStorage.setItem(pinStorageKey(userId), JSON.stringify(clean));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    if (clean.join("|") !== saved.pins.join("|")) setSaved({ uid: userId, pins: clean });
  }, [saved, userId, signature, accessReady]);
  reactExports.useEffect(() => {
    setQuery("");
  }, [area]);
  const draft = allowedPins(editing?.uid === userId ? editing.pins : [], groups);
  const updateDraft = (next) => {
    if (accessReady) setEditing({ uid: userId, pins: allowedPins(next, groups) });
  };
  const savePins = () => {
    if (editing?.uid !== userId || !accessReady) return;
    try {
      localStorage.setItem(pinStorageKey(userId), JSON.stringify(draft));
      setSaved({ uid: userId, pins: draft });
      setStorageError(false);
      setEditing(void 0);
    } catch {
      setStorageError(true);
    }
  };
  const apps = launcherApps(groups);
  const group = groups.find((g) => g.label === area);
  const results = searchLauncher(groups, query);
  const quickApps = pins.length ? pins.map((path) => apps.find((i) => i.to === path)).filter((i) => !!i) : suggestedLauncherApps(groups);
  const tile = (item) => {
    const parent = groups.find((g) => g.items.some((i) => i.to === item.to));
    const Icon = item.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "launcher-app relative min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", className: "launcher-tile h-full min-h-32 w-full flex-col justify-start gap-2 whitespace-normal rounded-2xl px-2 pb-3 pt-3 text-center", children: item.comingSoon ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { "aria-disabled": "true", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "launcher-icon launcher-tone-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block mt-3 text-sm leading-snug", children: item.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-muted-foreground mt-1", children: "Sắp ra mắt" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: item.to, search: item.to === "/" ? { view: "dashboard" } : {}, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `launcher-icon ${tones[parent?.label ?? ""] ?? "launcher-tone-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm leading-snug font-medium break-words", children: item.label })
    ] }) }) }, item.to || item.label);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mobile-launcher launcher-home space-y-5", "data-testid": "mobile-launcher", children: [
    !area && !query.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "launcher-welcome", "data-period": greeting?.period ?? "morning", "aria-label": "Lời chào theo thời điểm trong ngày", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "launcher-welcome-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "launcher-eyebrow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { "aria-hidden": "true", className: "h-3.5 w-3.5" }),
          " ",
          greeting?.eyebrow ?? "KHÔNG GIAN LÀM VIỆC"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: greeting?.title ?? `Xin chào${name?.trim() ? `, ${name.trim()}` : ""}!` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: greeting?.subtitle ?? "Mọi công việc, trong một không gian." }),
        apps.some((item) => item.to === "/") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", search: { view: "dashboard" }, className: "launcher-dashboard-link", children: [
          "Xem tổng quan ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { "aria-hidden": "true", className: "h-4 w-4" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "launcher-welcome-orbit", "aria-hidden": "true" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "launcher-search relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-4 top-5 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { "aria-label": "Tìm chức năng trong Base", placeholder: "Tìm chức năng trong Base...", className: "h-14 rounded-2xl bg-card pl-11 pr-12 text-base", value: query, onChange: (e) => setQuery(e.target.value) }),
      query && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "absolute right-1 top-2 h-10 w-10", onClick: () => setQuery(""), "aria-label": "Xóa tìm kiếm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, {}) })
    ] }),
    storageError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "status", className: "text-xs text-muted-foreground", children: "Chưa lưu được ghim trên thiết bị này." }),
    query.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "launcher-panel", "aria-label": "Kết quả tìm kiếm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "launcher-section-title", children: "Kết quả tìm kiếm" }),
      results.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "launcher-app-grid", children: results.map((i) => tile(i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Không tìm thấy chức năng." })
    ] }) : group ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "launcher-panel", "aria-label": `Chức năng ${group.label}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "launcher-section-title", children: group.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "launcher-app-grid", children: group.items.map((i) => tile(i)) }),
      group.comingSoon && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Sắp ra mắt" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "launcher-panel", "aria-label": "Truy cập nhanh", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "launcher-section-title mb-0", children: "Truy cập nhanh" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "launcher-section-caption", children: pins.length ? "Các chức năng bạn đã ghim" : "Gợi ý dành cho bạn" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "min-h-11 rounded-xl text-primary", disabled: saved?.uid !== userId || !accessReady, onClick: () => {
            setStorageError(false);
            setEditing({ uid: userId, pins: [...pins] });
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" }),
            "Tùy chỉnh"
          ] })
        ] }),
        quickApps.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "launcher-app-grid", children: (showAll ? quickApps : quickApps.slice(0, 6)).map((i) => tile(i)) }),
          quickApps.length > 6 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "mt-2 min-h-11 w-full rounded-xl text-primary", onClick: () => setShowAll((v) => !v), children: showAll ? "Thu gọn" : "Xem thêm" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border border-dashed rounded-2xl p-4 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-5 w-5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: accessReady ? "Chưa có chức năng ghim." : "Đang tải truy cập nhanh…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Các khu vực của bạn", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "launcher-section-title mb-1", children: "Khám phá Base" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "launcher-section-caption", children: "Mọi công việc, trong một không gian" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: groups.map((g) => {
          const Icon = g.icon ?? LayoutGrid;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: !g.comingSoon, variant: "outline", disabled: g.comingSoon, className: `launcher-area ${tones[g.label] ?? "launcher-tone-primary"} h-auto min-h-40 min-w-0 items-start justify-between flex-col gap-4 rounded-3xl bg-card p-4 whitespace-normal text-left shadow-soft`, children: g.comingSoon ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `launcher-icon ${tones[g.label]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm leading-relaxed", children: [
              g.label,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-muted-foreground mt-1", children: "Sắp ra mắt" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", search: { area: g.label }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `launcher-icon ${tones[g.label]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-full min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm leading-relaxed font-semibold break-words", children: g.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                g.items.filter((i) => !i.comingSoon && !!i.to).length,
                " chức năng",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 shrink-0", "aria-hidden": "true" })
              ] })
            ] })
          ] }) }, g.label);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editing?.uid === userId, onOpenChange: (open) => {
      if (!open) setEditing(void 0);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "aria-describedby": void 0, className: "launcher-customize w-[calc(100%-2rem)] min-w-0 max-h-[85dvh] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] rounded-3xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "pr-7 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "tracking-normal", children: "Tùy chỉnh truy cập nhanh" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 overflow-y-auto space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Ứng dụng đã ghim", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-2 text-sm font-semibold", children: [
            "Đã ghim (",
            draft.length,
            ")"
          ] }),
          draft.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "divide-y", children: draft.map((path, index) => {
            const item = apps.find((i) => i.to === path);
            if (!item) return null;
            const Icon = item.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 shrink-0 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 break-words text-sm", children: item.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-11 w-11", title: `Đưa ${item.label} lên trước`, "aria-label": `Đưa ${item.label} lên trước`, disabled: index === 0, onClick: () => updateDraft(movePin(draft, path, -1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-11 w-11", title: `Đưa ${item.label} ra sau`, "aria-label": `Đưa ${item.label} ra sau`, disabled: index === draft.length - 1, onClick: () => updateDraft(movePin(draft, path, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-11 w-11", title: `Bỏ ghim ${item.label}`, "aria-label": `Bỏ ghim ${item.label}`, onClick: () => updateDraft(draft.filter((p) => p !== path)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PinOff, { className: "h-4 w-4" }) })
              ] })
            ] }, path);
          }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Chưa có chức năng ghim." })
        ] }),
        groups.map((g) => {
          const items = g.items.filter((i) => !i.comingSoon && !!i.to);
          return items.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": `Chọn ứng dụng ${g.label}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: g.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: items.map((item) => {
              const Icon = item.icon;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-h-12 items-center gap-3 py-2 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { "aria-label": `Ghim ${item.label}`, checked: draft.includes(item.to), onCheckedChange: (checked) => updateDraft(checked === true ? [...draft, item.to] : draft.filter((p) => p !== item.to)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm break-words", children: item.label })
              ] }, item.to);
            }) })
          ] }, g.label) : null;
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 border-t pt-3", children: [
        storageError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-destructive", children: "Chưa lưu được. Vui lòng thử lại." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditing(void 0), children: "Hủy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !accessReady, onClick: savePins, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
          "Lưu thay đổi"
        ] })
      ] })
    ] }) })
  ] });
}
function mobilePage(groups, path, area, dashboard = false) {
  const selected = activeNavigationPath(groups, path);
  const group = groups.find((g) => g.items.some((i) => i.to === selected));
  const item = group?.items.find((i) => i.to === selected);
  return { title: path === "/profile" ? "Cá nhân" : path === "/" ? dashboard ? "Dashboard" : area ?? "Trang chủ" : item?.label ?? "Base Sứ Việt", area: group?.label };
}
function safeMobilePrevious(previous, expectedKey) {
  if (!previous || !expectedKey || previous.key !== expectedKey) return false;
  const path = previous.href.split(/[?#]/)[0];
  return path.startsWith("/") && !path.startsWith("//") && !["/login", "/register", "/pending", "/reset-password"].includes(path);
}
const db$1 = supabase;
const CHAT_BUCKET = "suviet-chat";
const CHAT_REFRESH_MS = 12e3;
function unwrap(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
async function chatInbox() {
  const data = unwrap(await db$1.rpc("sv_chat_inbox"));
  return data.map((t) => ({ ...t, unread_count: Number(t.unread_count) || 0, member_ids: t.member_ids ?? [] }));
}
async function chatUnreadTotal() {
  const data = unwrap(await db$1.rpc("sv_chat_unread_total"));
  return Number(data) || 0;
}
async function openDirectChat(otherId) {
  return unwrap(await db$1.rpc("sv_chat_open_direct", { p_other: otherId }));
}
async function createChatGroup(title, memberIds) {
  return unwrap(await db$1.rpc("sv_chat_create_group", { p_title: title.trim(), p_users: memberIds }));
}
async function chatMessages(threadId, limit = 60) {
  const result = await db$1.from("sv_chat_messages").select("id,thread_id,sender_id,body,attachment_path,attachment_name,attachment_mime,attachment_size,recalled_at,created_at").eq("thread_id", threadId).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(limit);
  const data = unwrap(result);
  return data.reverse();
}
async function chatParticipants(threadId) {
  return unwrap(await db$1.from("sv_chat_members").select("thread_id,user_id,last_read_at,role").eq("thread_id", threadId));
}
async function markChatRead(threadId) {
  unwrap(await db$1.rpc("sv_chat_mark_read", { p_thread: threadId }));
}
async function recallChatMessage(id) {
  return unwrap(await db$1.rpc("sv_chat_recall", { p_message: id }));
}
const CHAT_MIME = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);
const CHAT_MAX_BYTES = 20 * 1024 * 1024;
function validateChatAttachment(file) {
  if (!CHAT_MIME.has(file.type)) throw new Error("Định dạng tệp chưa hỗ trợ. Hãy chọn ảnh, PDF, Word, Excel hoặc PowerPoint.");
  if (!file.size || file.size > CHAT_MAX_BYTES) throw new Error("Tệp phải nhỏ hơn hoặc bằng 20 MB.");
  if (!file.name.trim() || file.name.length > 180) throw new Error("Tên tệp cần có 1–180 ký tự.");
}
function chatFileExtension(file) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
  };
  return map[file.type];
}
async function sendChatMessage(threadId, uid2, body2, attachment) {
  const trimmed = body2.trim();
  if (trimmed.length > 4e3) throw new Error("Tin nhắn tối đa 4.000 ký tự.");
  if (!trimmed && !attachment) throw new Error("Hãy nhập tin nhắn hoặc chọn tệp.");
  let uploadedPath = null;
  if (attachment) {
    validateChatAttachment(attachment);
    uploadedPath = `${threadId}/${uid2}/${crypto.randomUUID()}.${chatFileExtension(attachment)}`;
    const { error } = await supabase.storage.from(CHAT_BUCKET).upload(uploadedPath, attachment, {
      upsert: false,
      contentType: attachment.type
    });
    if (error) throw new Error(error.message);
  }
  try {
    unwrap(await db$1.from("sv_chat_messages").insert({
      thread_id: threadId,
      body: trimmed,
      ...attachment && uploadedPath ? {
        attachment_path: uploadedPath,
        attachment_name: attachment.name,
        attachment_mime: attachment.type,
        attachment_size: attachment.size
      } : {}
    }));
  } catch (err) {
    if (uploadedPath) await supabase.storage.from(CHAT_BUCKET).remove([uploadedPath]);
    throw err;
  }
}
async function downloadChatAttachment(path) {
  const { data, error } = await supabase.storage.from(CHAT_BUCKET).download(path);
  if (error || !data) throw new Error(error?.message ?? "Không tải được tệp.");
  return data;
}
async function deleteChatAttachment(path) {
  const { error } = await supabase.storage.from(CHAT_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}
function ChatUnreadBadge() {
  const uid2 = useAuth((s) => s.currentUserId);
  const active = useAuth((s) => s.users.some((u) => u.id === s.currentUserId && u.status === "Đang hoạt động"));
  const unread = useQuery({
    queryKey: ["chat", "unread", uid2],
    queryFn: chatUnreadTotal,
    enabled: !!uid2 && active,
    staleTime: 3e4,
    refetchInterval: 6e4,
    refetchOnWindowFocus: true,
    retry: 1
  });
  const count = unread.data || 0;
  return count > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-label": `${count} tin chưa đọc`, className: "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-semibold text-white", children: count > 99 ? "99+" : count }) : null;
}
function ChatShortcut({ onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "icon", onClick, className: "relative hidden shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:inline-flex", title: "Mở nhanh Sứ Việt Chat", "aria-label": "Mở Chat nội bộ", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesSquare, { className: "h-5 w-5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChatUnreadBadge, {})
  ] });
}
function MobileAppChrome({ groups, userId, name, brandName, logo, notifications, approvals, onMenu }) {
  const router2 = useRouter();
  const location2 = useRouterState({ select: (s) => s.location });
  const search = location2.search;
  const home = location2.pathname === "/" && !search.area && search.view !== "dashboard";
  const page = mobilePage(groups, location2.pathname, search.area, search.view === "dashboard");
  const header = reactExports.useRef(null), footer = reactExports.useRef(null);
  const history = reactExports.useRef(/* @__PURE__ */ new Map());
  const owner = reactExports.useRef(userId);
  const [previousKey, setPreviousKey] = reactExports.useState();
  const [keyboard, setKeyboard] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (owner.current !== userId) {
      history.current.clear();
      owner.current = userId;
    }
    const index = location2.state.__TSR_index;
    const key = location2.state.__TSR_key ?? location2.state.key;
    if (!key || typeof index !== "number") {
      setPreviousKey(void 0);
      return;
    }
    setPreviousKey(history.current.get(index - 1)?.key);
    history.current.set(index, { key, href: location2.href });
  }, [location2.href, location2.state.__TSR_key, location2.state.__TSR_index, userId]);
  reactExports.useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty("--mobile-header-height", `${header.current?.getBoundingClientRect().height ?? 64}px`);
      root.style.setProperty("--mobile-nav-height", `${footer.current?.getBoundingClientRect().height ?? 72}px`);
    };
    const observer = new ResizeObserver(update);
    if (header.current) observer.observe(header.current);
    if (footer.current) observer.observe(footer.current);
    update();
    return () => {
      observer.disconnect();
      root.style.removeProperty("--mobile-header-height");
      root.style.removeProperty("--mobile-nav-height");
    };
  }, []);
  reactExports.useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const editing = document.activeElement?.matches('input,textarea,[contenteditable="true"]');
      setKeyboard(!!editing && !!viewport && window.innerHeight - viewport.height > 150);
    };
    viewport?.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);
  const back = () => {
    const index = location2.state.__TSR_index;
    if (typeof index === "number" && safeMobilePrevious(history.current.get(index - 1), previousKey)) router2.history.back();
    else void router2.navigate({ to: "/", search: page.area ? { area: page.area } : {}, replace: true });
  };
  const dashboard = groups.some((g) => g.items.some((i) => i.to === "/" && !i.comingSoon));
  const dashboardActive = location2.pathname === "/" && search.view === "dashboard";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { ref: header, className: "mobile-app-header md:hidden fixed inset-x-0 top-0 z-30 border-b bg-card", "aria-label": "Đầu trang mobile", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-16 items-center gap-2 px-3 sm:px-4", children: [
      home ? logo : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: back, "aria-label": "Quay lại", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] font-medium tracking-normal text-muted-foreground", children: brandName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "break-words text-base font-semibold leading-snug tracking-normal", children: page.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mobile-header-notifications", children: notifications }),
      home ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", asChild: true, className: "rounded-full bg-accent text-accent-foreground text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/profile", "aria-label": "Hồ sơ cá nhân", children: name?.slice(0, 1).toUpperCase() ?? /* @__PURE__ */ jsxRuntimeExports.jsx(User, {}) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Mở menu", onClick: onMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { ref: footer, "aria-label": "Điều hướng mobile", className: cn("mobile-bottom-nav md:hidden fixed inset-x-0 bottom-0 z-30 grid auto-cols-fr grid-flow-col border-t bg-card px-2 pt-2", keyboard && "mobile-keyboard-open"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", className: cn("h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium", home && "text-primary bg-accent"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", search: {}, "aria-current": home ? "page" : void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-5 w-5" }),
        "Trang chủ"
      ] }) }),
      dashboard && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", className: cn("h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium", dashboardActive && "text-primary bg-accent"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", search: { view: "dashboard" }, "aria-current": dashboardActive ? "page" : void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-5 w-5" }),
        "Dashboard"
      ] }) }),
      approvals && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", className: cn("h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium", location2.pathname === "/approvals" && "text-primary bg-accent"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/approvals", "aria-current": location2.pathname === "/approvals" ? "page" : void 0, "aria-label": `Phê duyệt${approvals.count > 0 ? ` (${badgeText(approvals.count)} chờ)` : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-5 w-5" }),
          approvals.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1.5 -right-2.5 min-w-4 h-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-semibold flex items-center justify-center", children: badgeText(approvals.count) })
        ] }),
        "Phê duyệt"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", className: cn("h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium", location2.pathname.startsWith("/community") && "text-primary bg-accent"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/community", search: { tab: "feed", thread: void 0 }, "aria-current": location2.pathname.startsWith("/community") ? "page" : void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircleHeart, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChatUnreadBadge, {})
        ] }),
        "Cộng đồng"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", className: cn("h-14 min-w-0 flex-col gap-1 px-1 text-[11px] font-medium", location2.pathname === "/profile" && "text-primary bg-accent"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/profile", "aria-current": location2.pathname === "/profile" ? "page" : void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }),
        "Cá nhân"
      ] }) })
    ] })
  ] });
}
const Sheet = Root;
const SheetTrigger = Trigger$3;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const pushDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("9b259f675f826e1640acaf3508384b658e0efd4a6042648b4502c05f30626c04"));
const pushTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c82d2f943dc6173439c7274f8fc5c6d8899e3b9ace8e803a1fe3bb49ab885834"));
function isPreviewContext() {
  if (typeof window === "undefined") return true;
  const h = location.hostname;
  let framed = false;
  try {
    framed = window.self !== window.top;
  } catch {
    framed = true;
  }
  return framed || h === "localhost" || h.startsWith("id-preview--") || h.startsWith("preview--") || h.endsWith("lovableproject.com") || h.endsWith("lovableproject-dev.com");
}
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
const standalone = () => window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
function deviceName() {
  const ua = navigator.userAgent;
  const os = /Android/.test(ua) ? "Android" : isIOS() ? "iPhone/iPad" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Khác";
  const br = /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /Firefox|FxiOS/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Trình duyệt";
  return `${br} · ${os}`;
}
const keyBytes = (b64) => {
  const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - b64.length % 4) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};
async function registration() {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing?.active?.scriptURL.endsWith("/push-sw.js")) return existing;
  return navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
}
async function currentState() {
  if (isPreviewContext()) return "preview";
  if (isIOS() && !standalone()) return "ios_install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}
async function enablePush() {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm === "denied" ? "denied" : "off";
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription() ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) });
  const j = sub.toJSON();
  const { error } = await supabase.rpc("push_subscribe", { _endpoint: j.endpoint, _p256dh: j.keys.p256dh, _auth: j.keys.auth, _device: deviceName() });
  if (error) throw error;
  return "on";
}
async function disablePush() {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await supabase.rpc("push_unsubscribe", { _endpoint: sub.endpoint, _id: null });
    await sub.unsubscribe();
  } catch {
  }
}
async function listDevices() {
  const { data } = await supabase.from("push_subscriptions").select("id,device,created_at,last_used_at,endpoint").eq("status", "active").order("created_at", { ascending: false });
  return data ?? [];
}
async function revokeDevice(id) {
  const { error } = await supabase.rpc("push_unsubscribe", { _endpoint: null, _id: id });
  if (error) throw error;
}
async function currentEndpoint() {
  try {
    return (await (await navigator.serviceWorker.getRegistration("/"))?.pushManager.getSubscription())?.endpoint ?? null;
  } catch {
    return null;
  }
}
const client = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  currentEndpoint,
  currentState,
  disablePush,
  enablePush,
  isPreviewContext,
  listDevices,
  revokeDevice
}, Symbol.toStringTag, { value: "Module" }));
const LABEL = {
  on: "Đã bật",
  off: "Chưa bật",
  denied: "Trình duyệt đã chặn",
  unsupported: "Thiết bị chưa hỗ trợ",
  ios_install: "Cần thêm Base vào màn hình chính",
  preview: "Chỉ dùng được trên trang chính thức"
};
function PushSettings() {
  const [state, setState] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [devices, setDevices] = reactExports.useState([]);
  const [mine, setMine] = reactExports.useState(null);
  const test = useServerFn(pushTest);
  const refresh = async () => {
    setState(await currentState());
    setDevices(await listDevices());
    setMine(await currentEndpoint());
  };
  reactExports.useEffect(() => {
    refresh();
  }, []);
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error(e?.message || "Có lỗi xảy ra");
    } finally {
      setBusy(false);
      refresh();
    }
  };
  if (!state) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Thông báo trên thiết bị" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
      "Trạng thái: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: state === "on" ? "text-primary font-medium" : "text-muted-foreground", children: LABEL[state] })
    ] }),
    state === "off" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "w-full", disabled: busy, onClick: () => run(async () => {
      const s = await enablePush();
      if (s === "on") toast.success("Đã bật thông báo trên thiết bị này");
    }), children: "Bật thông báo trên thiết bị này" }),
    state === "on" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "flex-1", disabled: busy, onClick: () => run(async () => {
        const r = await test();
        toast.success(`Đã gửi thử tới ${r.sent}/${r.total} thiết bị`);
      }), children: "Gửi thử" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "flex-1", disabled: busy, onClick: () => run(disablePush), children: "Tắt trên thiết bị này" })
    ] }),
    state === "denied" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Bạn đã chặn thông báo. Mở cài đặt trang web của trình duyệt (biểu tượng ổ khóa cạnh địa chỉ) → cho phép Thông báo, rồi tải lại trang." }),
    state === "ios_install" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Trên iPhone/iPad (iOS 16.4 trở lên): mở Base bằng Safari → bấm nút Chia sẻ → "Thêm vào MH chính". Sau đó mở Base từ biểu tượng mới và bật thông báo tại đây.' }),
    state === "unsupported" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Trình duyệt này chưa hỗ trợ thông báo đẩy. Hãy dùng Chrome, Edge hoặc Safari mới." }),
    state === "preview" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mở Base tại base.suviet.vn để bật thông báo." }),
    devices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mb-1", children: [
        "Thiết bị đã bật (",
        devices.length,
        ")"
      ] }),
      devices.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 py-1 text-xs border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          d.device || "Thiết bị",
          d.endpoint === mine ? " (máy này)" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-destructive", disabled: busy, onClick: () => run(async () => {
          if (d.endpoint === mine) await disablePush();
          else await revokeDevice(d.id);
        }), children: "Tắt" })
      ] }, d.id))
    ] })
  ] });
}
const deadlineLink = (state, sale, group, source) => {
  const q = new URLSearchParams({ deadline: state });
  if (sale) q.set("sale", sale);
  return `/signals?${q}`;
};
function suggestedProgressionStatus(status, selected) {
  if (!status || ["won", "lost", "deposit"].includes(status)) return null;
  if (selected.some((x) => ["Đã gửi báo giá", "Khách đang xem báo giá"].includes(x)) && ["waiting", "contacting", "consulting"].includes(status)) return "quoted";
  if (selected.some((x) => ["Đã kết nối Zalo với khách", "Đang tư vấn sản phẩm", "Đang thiết kế maket", "Đã gửi maket cho khách"].includes(x)) && ["waiting", "contacting"].includes(status)) return "consulting";
  return null;
}
const CHIPI_PLAY_INTERVAL_MS = 45e3;
const CHIPI_PLAY_DURATION_MS = 2400;
function chipiDisplayState(business, decoration) {
  return business === "idle" ? decoration ?? "idle" : business;
}
function chipiNoticeCategory(kind) {
  if (chipiState({ kind, read_at: null }) === "success") return "success";
  if (kind.startsWith("signal_")) return "signal";
  if (/^(order_|content_|oq_|ot_)/.test(kind)) return "job";
  return "general";
}
function chipiState(n) {
  if (!n || n.read_at) return "idle";
  if (["order_new", "order_assigned"].includes(n.kind)) return "new_job";
  if (["signal_assigned", "content_assigned", "oq_assigned"].includes(n.kind)) return "assigned";
  if (["order_approved", "order_delivered", "content_approved", "content_published", "oq_done"].includes(n.kind)) return "success";
  return "notification";
}
function newChipiNotice(notices, seen) {
  return notices.find((n) => !n.read_at && !seen.has(n.id));
}
function currentChipiNotice(notices, previousId) {
  return notices.find((n) => n.id === previousId && !n.read_at) ?? notices.find((n) => !n.read_at);
}
function ChipiNoticeIcon({ kind, className }) {
  const category = chipiNoticeCategory(kind);
  const Icon = category === "signal" ? Radar : category === "job" ? ClipboardList : category === "success" ? Check : Bell;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className, "aria-hidden": "true" });
}
const Card = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("rounded-2xl border border-border/70 bg-card text-card-foreground shadow-soft", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const TooltipProvider = Provider;
const Tooltip = Root3;
const TooltipTrigger = Trigger$2;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2$2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = Content2$2.displayName;
const PasswordInput = reactExports.forwardRef(
  ({ className, disabled, allowReveal = true, ...props }, forwardedRef) => {
    const [visible, setVisible] = reactExports.useState(false);
    const inputRef = reactExports.useRef(null);
    const selection = reactExports.useRef(null);
    const revealed = visible && allowReveal;
    const label = revealed ? "Ẩn mật khẩu" : "Hiện mật khẩu";
    reactExports.useLayoutEffect(() => {
      const input = inputRef.current;
      const saved = selection.current;
      let frame;
      if (input && saved && saved.start !== null && saved.end !== null) {
        const { start, end, direction } = saved;
        input.setSelectionRange(start, end, direction ?? "none");
        frame = requestAnimationFrame(() => input.setSelectionRange(start, end, direction ?? "none"));
      }
      selection.current = null;
      return () => {
        if (frame !== void 0) cancelAnimationFrame(frame);
      };
    }, [visible]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          ...props,
          ref: (input) => {
            inputRef.current = input;
            if (typeof forwardedRef === "function") forwardedRef(input);
            else if (forwardedRef) forwardedRef.current = input;
          },
          type: revealed ? "text" : "password",
          disabled,
          className: cn("h-11 pr-12", className)
        }
      ),
      allowReveal && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 250, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            disabled,
            className: "absolute right-0 top-0 h-full min-h-11 w-11 rounded-md text-muted-foreground hover:bg-accent/60 hover:text-primary",
            "aria-label": label,
            "aria-pressed": revealed,
            "aria-controls": props.id,
            onPointerDown: (event) => {
              const input = inputRef.current;
              if (input) selection.current = { start: input.selectionStart, end: input.selectionEnd, direction: input.selectionDirection };
              event.preventDefault();
            },
            onMouseDown: (event) => event.preventDefault(),
            onClick: (event) => {
              event.stopPropagation();
              const input = inputRef.current;
              if (input && !selection.current) selection.current = { start: input.selectionStart, end: input.selectionEnd, direction: input.selectionDirection };
              setVisible((value) => !value);
            },
            children: revealed ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { "aria-hidden": "true" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: label })
      ] }) })
    ] });
  }
);
PasswordInput.displayName = "PasswordInput";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root$2, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root$2.displayName;
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root$1.displayName;
const Popover = Root2$1;
const PopoverTrigger = Trigger$1;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2$1,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = Content2$1.displayName;
const zaloAdminStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f9613bbc5984a8a3673102e07570014ad20a076e575a5e582c7effafe36b5b70"));
const zaloConnectUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("e999d3a4df0a97eaced3cbf44c32291c306ba2c26fae06b86b8c8c0569212c5e"));
const zaloCheck = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("eca19a8db00e51b2fd646cb07888c38407844df44252379f4ff08377b69439e8"));
const zaloSendTest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("51443d20085427e049939d0ded8ea9d9643b63a1da3ffff6ace0f32e534222e8"));
const zaloDisconnect = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8be822aaa1dbdd9a386505b2bc972edecc9c728644c848a5fc555a275b1532e2"));
const zaloSetAuto = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  on: booleanType()
}).parse(d)).handler(createSsrRpc("16de56824ea7268e1f76e54ca69ff2587db3a32e7cb453d35dde652edd166f63"));
const zaloRetryFailed = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d4be283b27aea2cec8578b29c2869ce211d10eafcded78001badacb5c09f0eb6"));
const zaloMyLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6c8389ee6c13ff0df59b18afb7ac0e77e9164a78fa9628f71810c20f908a2012"));
const zaloReminderHealth = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f67fe2bec1fc0f4033cb868922c196a52dd6269fa4253b8bcff160c4c8396340"));
const zaloCreateLinkCode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("fc252f009930dd2f052adbdf13b908fe3fa763f25fcb5a32fc157726149716c9"));
const zaloUnlink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("12b464f21a04a62630aac68a95fc0d3c2eb17e8878b5e5b797f1a228e6e178e2"));
const zaloDispatch = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("e4a87921327b8165a8b41b55ffbc7e8329ccee77221917746c4703999d3de5d3"));
const zaloSaveAppConfig = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  appId: stringType().trim().regex(/^\d{5,30}$/, "App ID chỉ gồm chữ số"),
  appSecret: stringType().trim().max(200).optional()
}).parse(d)).handler(createSsrRpc("c5e478e75ebc77a794a5a210f33462cc02bce3513ef659184a30faf6c3bf51eb"));
const zaloSaveWebhookSecret = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  secret: stringType().trim().min(8).max(200)
}).parse(d)).handler(createSsrRpc("93c164297f62ab1e48c3396f0993ad980f295fba749620026bcfa2d2143b9f0e"));
const zaloSaveBaseUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  url: stringType().max(200)
}).parse(d)).handler(createSsrRpc("6585719a9c9b751c149303c3a714264737b14291b4be3eccd19b58db4e3cbb15"));
const zaloCareGet = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("234e9b6a814fe9ec34c9ed25f50d7d4fa92f0ed2195e7d121c29da9f799a6995"));
const zaloCareSave = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  enabled: booleanType(),
  waitHours: numberType().int().min(1).max(240),
  staleDays: numberType().int().min(1).max(60),
  hour: numberType().int().min(0).max(23)
}).parse(d)).handler(createSsrRpc("4ea97a7d6d57e103a328d8386c4bd690b747fd2406e2a2f421c2f1ae79b8cba3"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("bd48348bad073d72b86e3e7a038dff9251ac3532fe050d7350d4e20b49a88395"));
const NOTIFICATION_LABEL = {
  fin_pending: "Tiền Về: có giao dịch chờ đối soát.",
  fin_needs_info: "Tiền Về: Kế toán yêu cầu chỉnh sửa thông tin.",
  signal_new: "Có tín hiệu mới đang cần xử lý.",
  signal_assigned: "Bạn vừa được giao một tín hiệu cơ hội mới.",
  signal_care: "Nhắc chăm sóc: có tín hiệu cần kiểm tra.",
  leave_pending: "Có đơn từ cần bạn duyệt.",
  leave_result: "Đơn từ của bạn có kết quả mới.",
  leave_cancel_request: "Có yêu cầu hủy đơn cần bạn duyệt.",
  leave_remind: "Nhắc duyệt: có đơn đang chờ bạn.",
  leave_cc: "Có đơn từ vừa được phê duyệt/hủy (thông báo CC).",
  att_witness: "Bạn được chọn làm người làm chứng cho một giải trình chấm công.",
  att_new: "Có giải trình chấm công mới cần đối chiếu.",
  att_changed: "Một giải trình chấm công vừa được sửa ngày/giờ.",
  att_result: "Người làm chứng đã phản hồi giải trình chấm công của bạn.",
  att_submitted: "Giải trình chấm công của bạn đã được ghi nhận.",
  ...CONTENT_LABEL,
  ...ORDER_LABEL,
  ...OQ_LABEL,
  ot_reschedule: "Có đề xuất điều chỉnh ngày khách nhận cần bạn phản hồi.",
  ot_reschedule_result: "Đề xuất điều chỉnh ngày khách nhận của bạn đã có phản hồi.",
  shift_open: "Đã mở đăng ký lịch trực tuần tới.",
  shift_deadline: "Sắp hết hạn đăng ký ca trực.",
  shift_published: "Lịch trực đã được công bố.",
  shift_peer: "Có yêu cầu đổi ca đang chờ bạn.",
  shift_manager: "Có lịch trực đang chờ duyệt.",
  shift_result: "Có kết quả đổi ca mới."
};
const notificationText = (n) => (n.kind.startsWith("biz_") || n.kind.startsWith("shift_") || n.kind === "signal_care" && n.payload?.progression === true) && typeof n.payload?.message === "string" ? n.payload.message : NOTIFICATION_LABEL[n.kind] ?? "Thông báo mới";
const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 6e4);
  return m < 1 ? "vừa xong" : m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.round(m / 60)} giờ trước` : `${Math.round(m / 1440)} ngày trước`;
};
function NotificationBell({ trigger, onNotifications } = {}) {
  const uid2 = useAuth((st) => st.currentUserId) || void 0;
  const qc = useQueryClient();
  useNavigate();
  const [open, setOpen] = reactExports.useState(false);
  const [showLink, setShowLink] = reactExports.useState(false);
  const [showPush, setShowPush] = reactExports.useState(false);
  const { data: notifications } = useQuery({
    queryKey: ["notifications", uid2],
    enabled: !!uid2,
    // Đốm observes the same cache; existing header/sidebar bells own polling.
    refetchInterval: onNotifications ? false : 6e4,
    staleTime: onNotifications ? 6e4 : 0,
    queryFn: async () => {
      const [regular, shifts] = await Promise.all([
        supabase.from("notifications").select("id,kind,signal_id,leave_request_id,attendance_id,content_id,order_id,oq_flow_id,ot_order_id,bank_tx_id,payload,read_at,created_at").eq("recipient_id", uid2).order("created_at", { ascending: false }).limit(30),
        supabase.from("showroom_shift_alerts").select("id,kind,store_id,week_start,message,read_at,created_at").eq("recipient_id", uid2).order("created_at", { ascending: false }).limit(30)
      ]);
      const base = regular.data ?? [];
      const roster = (shifts.data ?? []).map((item) => ({
        id: "shift:" + item.id,
        kind: item.kind,
        source: "shift",
        signal_id: null,
        leave_request_id: null,
        attendance_id: null,
        content_id: null,
        order_id: null,
        oq_flow_id: null,
        ot_order_id: null,
        bank_tx_id: null,
        payload: { message: item.message, store_id: item.store_id, week_start: item.week_start },
        read_at: item.read_at,
        created_at: item.created_at
      }));
      return [...base, ...roster].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 30);
    }
  });
  const data = notifications ?? [];
  reactExports.useEffect(() => {
    if (uid2 && onNotifications && notifications) onNotifications(notifications);
  }, [notifications, uid2, onNotifications]);
  if (!uid2) return null;
  const unread = data.filter((n) => !n.read_at).length;
  const openOne = async (n) => {
    setOpen(false);
    if (!n.read_at) {
      if (n.source === "shift") await supabase.from("showroom_shift_alerts").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", n.id.slice(6));
      else await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", n.id);
      qc.invalidateQueries({ queryKey: ["notifications", uid2] });
    }
    if (n.source === "shift") {
      window.location.href = "/showroom/shifts";
      return;
    }
    if (n.kind.startsWith("biz_")) {
      if (n.payload?.module === "crm") {
        window.location.href = "/biz/crm";
        return;
      }
      if (n.payload?.module === "k3") {
        window.location.href = "/biz/3k";
        return;
      }
      if (n.payload?.approval_run_id) {
        window.location.href = "/biz/approvals";
        return;
      }
      const params = new URLSearchParams({ year: String(n.payload?.year ?? ""), period: String(n.payload?.period ?? ""), period_kind: String(n.payload?.period_kind ?? ""), user: String(n.payload?.user_id ?? "") });
      window.location.href = `/biz/${n.payload?.kind === "plan" ? "plans" : "reports"}?${params}`;
      return;
    }
    window.location.href = n.kind === "signal_care" && n.payload?.progression === true ? deadlineLink(n.payload.deadline, n.payload.sale_id) : n.kind.startsWith("fin_") ? `/finance/incoming/${n.bank_tx_id ?? ""}` : n.kind.startsWith("ot_") ? `/order-tracking/${n.ot_order_id ?? ""}` : n.kind.startsWith("oq_") ? oqLink(n.payload?.request_id ?? "", n.payload?.both ? null : n.oq_flow_id) : n.kind.startsWith("order_") ? orderLink(n.order_id ?? "") : n.kind.startsWith("content_") ? contentLink(n.content_id ?? "") : n.kind.startsWith("att_") ? `/attendance?att=${n.attendance_id}` : n.kind === "leave_remind" ? "/leave?tab=approve" : n.kind.startsWith("leave_") ? `/leave?open=${n.leave_request_id}` : n.kind === "signal_care" || !n.signal_id ? "/signals?care=1" : `/signals?open=${n.signal_id}`;
  };
  const readAll = async () => {
    await Promise.all([
      supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("recipient_id", uid2).is("read_at", null),
      supabase.from("showroom_shift_alerts").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("recipient_id", uid2).is("read_at", null)
    ]);
    qc.invalidateQueries({ queryKey: ["notifications", uid2] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: trigger ? "chipi-trigger relative h-auto p-0 hover:bg-transparent" : "relative h-auto p-2", "aria-label": trigger ? "Đốm — mở thông báo" : "Thông báo", children: [
      trigger ?? /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
      unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-4 text-center", children: unread > 9 ? "9+" : unread })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { align: "end", collisionPadding: 12, className: trigger ? "chipi-notifications w-80 max-w-[calc(100vw-24px)] max-h-[70dvh] overflow-auto p-0" : "w-80 max-w-[calc(100vw-24px)] max-h-[70dvh] overflow-auto p-0", children: trigger ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chipi-panel-header flex items-center gap-2 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-chipi-orange" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm flex-1", children: "Đốm nhắc bạn" }),
        unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Đánh dấu tất cả đã đọc", "aria-label": "Đánh dấu tất cả đã đọc", onClick: readAll, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Đóng bảng thông báo Đốm", onClick: () => setOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-96 overflow-auto p-3 space-y-2", children: [
        data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-6 w-6 mx-auto mb-3 text-chipi-orange" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Bạn đã xem hết rồi!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Đốm sẽ nhắc khi có thông báo mới." })
        ] }),
        data.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => openOne(n), className: `chipi-notice-card ${n.read_at ? "" : "chipi-unread"} h-auto w-full items-start justify-start whitespace-normal text-left p-3 gap-3`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "chipi-notice-icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipiNoticeIcon, { kind: n.kind, className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `block text-sm break-words ${n.read_at ? "font-normal" : "font-semibold"}`, children: notificationText(n) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground mt-1.5", children: ago(n.created_at) })
          ] }),
          !n.read_at && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 shrink-0 rounded-full bg-chipi-orange mt-1.5" })
        ] }, n.id))
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Thông báo" }),
        unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-primary", onClick: readAll, children: "Đánh dấu đã đọc" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-96 overflow-auto", children: [
        data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-sm text-muted-foreground", children: "Chưa có thông báo." }),
        data.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => openOne(n), className: `w-full text-left px-3 py-2.5 border-b last:border-0 hover:bg-accent ${n.read_at ? "" : "bg-primary/5"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: notificationText(n) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: ago(n.created_at) })
        ] }, n.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t p-2", children: [
        showPush ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PushSettings, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full text-xs text-primary py-1", onClick: () => setShowPush(true), children: "Thông báo trên thiết bị" }),
        showLink ? /* @__PURE__ */ jsxRuntimeExports.jsx(ZaloLinkCard, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full text-xs text-primary py-1", onClick: () => setShowLink(true), children: "Nhận thông báo qua Zalo" })
      ] })
    ] }) })
  ] });
}
function ZaloLinkCard() {
  const my = useServerFn(zaloMyLink);
  const create2 = useServerFn(zaloCreateLinkCode);
  const unlink = useServerFn(zaloUnlink);
  const [link, setLink] = reactExports.useState(void 0);
  const [code, setCode] = reactExports.useState(null);
  const load = () => my().then(setLink).catch(() => setLink(null));
  reactExports.useEffect(() => {
    load();
  }, []);
  reactExports.useEffect(() => {
    if (!code) return;
    const iv = setInterval(load, 5e3);
    return () => clearInterval(iv);
  }, [code]);
  reactExports.useEffect(() => {
    if (link && code) setCode(null);
  }, [link]);
  const st = link === void 0 ? "…" : !link ? "Chưa liên kết" : link.status === "active" ? "Đã liên kết" : "Không còn hiệu lực";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Thông báo Zalo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: link?.status === "active" ? "default" : "secondary", children: st })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nhận thông báo tín hiệu cơ hội qua Zalo OA Sứ Việt. Tin nhắn chỉ có lời nhắc và nút mở Base, không chứa thông tin khách hàng." }),
    code ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "1. Mở Zalo, tìm và ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Quan tâm" }),
        " OA ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Sứ Việt" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "2. Nhắn cho OA đúng mã sau:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-mono font-semibold tracking-wider select-all", children: code.code }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Mã hết hạn lúc ",
        new Date(code.expiresAt).toLocaleTimeString("vi-VN"),
        ". Trang này tự cập nhật khi liên kết xong."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Lưu ý: Zalo chỉ cho OA gửi tin trong một khoảng thời gian sau lần bạn nhắn OA gần nhất. Thỉnh thoảng nhắn OA để tiếp tục nhận thông báo." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => create2().then(setCode).catch((e) => toast.error(e.message)), children: link ? "Liên kết lại" : "Liên kết Zalo" }),
      link && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => unlink().then(load), children: "Hủy liên kết" })
    ] })
  ] }) });
}
function CopyRow({ label, value, hint }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value, className: "font-mono text-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: () => navigator.clipboard.writeText(value).then(() => toast.success("Đã sao chép")), children: "Sao chép" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: hint })
  ] });
}
const STATE = {
  unconfigured: { label: "Chưa cấu hình", tone: "secondary" },
  disconnected: { label: "Chưa kết nối", tone: "secondary" },
  connected: { label: "Đã kết nối", tone: "default" },
  refresh_review: { label: "Gia hạn cần kiểm tra", tone: "destructive" },
  reconnect: { label: "Cần kết nối lại", tone: "destructive" }
};
function ZaloAdminCard() {
  const status = useServerFn(zaloAdminStatus);
  const connect = useServerFn(zaloConnectUrl);
  const check = useServerFn(zaloCheck);
  const test = useServerFn(zaloSendTest);
  const disc = useServerFn(zaloDisconnect);
  const setAuto = useServerFn(zaloSetAuto);
  const retry = useServerFn(zaloRetryFailed);
  const saveApp = useServerFn(zaloSaveAppConfig);
  const saveBase = useServerFn(zaloSaveBaseUrl);
  const saveHook = useServerFn(zaloSaveWebhookSecret);
  const [s, setS] = reactExports.useState(null);
  const [err, setErr] = reactExports.useState(null);
  const [appId, setAppId] = reactExports.useState("");
  const [secret, setSecret] = reactExports.useState("");
  const [base, setBase] = reactExports.useState("");
  const [hook, setHook] = reactExports.useState("");
  const load = () => status().then((r) => {
    setS(r);
    setAppId(r.appId);
    setBase(r.baseUrl);
  }).catch((e) => setErr(e.message));
  reactExports.useEffect(() => {
    load();
    const r = new URLSearchParams(window.location.search).get("zalo");
    if (r === "connected") toast.success("Đã kết nối Zalo OA");
    if (r === "error") toast.error("Kết nối Zalo OA thất bại — thử lại");
    const timer = setInterval(load, 3e4);
    return () => clearInterval(timer);
  }, []);
  if (err || !s) return null;
  const run = (p) => p.then((r) => {
    if (r?.message) (r.ok ? toast.success : toast.error)(r.message);
    load();
  }).catch((e) => {
    const m = String(e?.message ?? e);
    const zod = m.match(/"message":\s*"([^"]+)"/);
    toast.error(zod ? zod[1] : m);
  });
  const st = STATE[s.state] ?? STATE.disconnected;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Cấu hình ứng dụng Zalo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s.configured ? "default" : "secondary", children: s.configured ? "Đã cấu hình" : "Chưa cấu hình" })
      ] }),
      !s.dbReady && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Chưa lưu được từ giao diện: cơ sở dữ liệu cần một cập nhật nhỏ đang chờ phê duyệt. Trong lúc chờ, có thể nhập App ID / App Secret qua mục Bí mật (Secrets) của hệ thống." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Zalo App ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: appId, onChange: (e) => setAppId(e.target.value), inputMode: "numeric" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "App Secret" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { autoComplete: "new-password", value: secret, onChange: (e) => setSecret(e.target.value), placeholder: s.appSecretSet ? `Đã lưu (${s.appSecretHint}) — để trống nếu không đổi` : "Nhập App Secret" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "App Secret không bao giờ hiển thị lại. Đổi App ID/Secret sẽ yêu cầu kết nối lại OA." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !s.dbReady, onClick: () => {
        if (!/^\d{5,30}$/.test(appId.trim())) {
          toast.error("App ID chỉ gồm chữ số (5–30 ký tự)");
          return;
        }
        run(saveApp({ data: { appId: appId.trim(), appSecret: secret || void 0 } }).then((r) => {
          setSecret("");
          return r;
        }));
      }, children: "Lưu cấu hình" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Đường dẫn ứng dụng Base" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: base, onChange: (e) => setBase(e.target.value), placeholder: "https://base.suviet.vn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: !s.dbReady, onClick: () => run(saveBase({ data: { url: base } })), children: "Lưu" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: 'Mọi nút "Xem tín hiệu" trong Zalo mở trên tên miền này. Đổi tên miền không làm mất kết nối OA.' })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Kết nối Zalo OA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: st.tone, children: st.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Tên OA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.oaName ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Kết nối OAuth" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.oauthActive ? "Hoạt động" : "Mất kết nối hoặc cần kiểm tra" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Gửi thông báo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.sendState === "active" ? "Hoạt động" : s.sendState === "error" ? "Có lỗi" : "Chưa xác minh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Mã lỗi gửi gần nhất" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          s.sendErrorCode ?? "—",
          s.sendErrorGroup && ` · ${{ token: "Token", recipient: "Điều kiện tương tác", format: "Loại tin không hỗ trợ", quota: "Hạn mức", permission: "Quyền OA", network: "Mạng / cần đối soát", unknown: "Cần kiểm tra" }[s.sendErrorGroup]}`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Gửi thành công gần nhất" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.lastSendSuccess ? new Date(s.lastSendSuccess).toLocaleString("vi-VN") : "Chưa ghi nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Nhân viên đã liên kết" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.linkedCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Gia hạn thành công" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.refreshLast ? new Date(s.refreshLast).toLocaleString("vi-VN") : "Chưa ghi nhận" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Dự kiến gia hạn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.refreshNext ? new Date(s.refreshNext).toLocaleString("vi-VN") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Lịch chạy nền" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.schedulerHealthy ? "Đang hoạt động · mỗi giờ" : "Chưa ghi nhận hoặc gián đoạn" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Xử lý hàng đợi gần nhất" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.queueLast ? new Date(s.queueLast).toLocaleString("vi-VN") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Gửi tự động" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.autoSend ? "Đã bật" : "Chưa bật" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Gửi thử" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: s.testOk ? "Đã thành công" : "Chưa thành công" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "7 ngày qua" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Đã gửi ",
          s.stats7d.sent ?? 0,
          " · Thất bại ",
          s.stats7d.failed ?? 0,
          " · Không đủ ĐK ",
          s.stats7d.ineligible ?? 0,
          " · Chưa gửi ",
          s.stats7d.pending ?? 0
        ] })
      ] }),
      s.refreshError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: s.refreshError }),
      s.lastError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: s.lastError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !s.configured, onClick: () => connect().then((r) => {
          window.location.href = r.url;
        }).catch((e) => toast.error(e.message)), children: s.status === "disconnected" ? "Kết nối OA" : "Kết nối lại" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => run(check()), children: "Kiểm tra kết nối" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => run(test()), children: "Gửi thử" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: s.sendState !== "active", onClick: () => run(retry().then((r) => ({ ok: true, message: `Đã xử lý ${r.processed} thông báo đủ điều kiện; không gửi lại hàng loạt tin lỗi cũ` }))), children: "Kiểm tra hàng đợi" }),
        s.status !== "disconnected" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => confirm("Ngắt kết nối Zalo OA?") && run(disc()), children: "Ngắt kết nối" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Gửi tự động" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.testOk ? "Có thể bật." : "Chỉ bật được sau khi Gửi thử thành công." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.autoSend, disabled: s.status !== "connected" || !s.testOk && !s.autoSend, onCheckedChange: (on) => run(setAuto({ data: { on } })) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Khai báo trên Zalo for Developers" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyRow, { label: "OAuth Callback URL", value: s.callbackUrl, hint: "Dán vào mục Official Account → Callback URL. Cố định, không đổi khi đổi tên miền Base." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyRow, { label: "Webhook URL", value: s.webhookUrl, hint: "Dùng để nhân viên liên kết Zalo bằng mã. Bật sự kiện “Người dùng gửi tin nhắn văn bản”." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Khóa Webhook (OA Secret Key)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordInput, { autoComplete: "new-password", value: hook, onChange: (e) => setHook(e.target.value), placeholder: s.webhookReady ? "Đã lưu — để trống nếu không đổi" : "Chỉ cần để nhân viên liên kết Zalo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", disabled: !s.dbReady || !hook, onClick: () => run(saveHook({ data: { secret: hook } }).then((r) => {
            setHook("");
            return r;
          })), children: "Lưu" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CareCard, {})
  ] });
}
function CareCard() {
  const get = useServerFn(zaloCareGet);
  const save = useServerFn(zaloCareSave);
  const [c, setC] = reactExports.useState(null);
  reactExports.useEffect(() => {
    get().then(setC).catch(() => {
    });
  }, []);
  if (!c) return null;
  const num = (k) => (e) => setC({ ...c, [k]: Number(e.target.value) || 0 });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Nhắc chăm sóc tín hiệu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mỗi Sale nhận tối đa 1 tin tổng hợp/ngày nếu có tín hiệu cần chú ý. Công tắc riêng, không ảnh hưởng 2 thông báo hiện có." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: c.enabled, onCheckedChange: (enabled) => setC({ ...c, enabled }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chưa tiếp nhận (giờ)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: c.waitHours, onChange: num("waitHours") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lâu chưa cập nhật (ngày)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: c.staleDays, onChange: num("staleDays") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Giờ gửi (0–23)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 23, value: c.hour, onChange: num("hour") })
      ] })
    ] }),
    c.lastRun && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Lần chạy gần nhất: ",
      c.lastRun
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save({ data: { enabled: c.enabled, waitHours: c.waitHours, staleDays: c.staleDays, hour: c.hour } }).then((r) => toast.success(r.message)).catch((e) => toast.error(String(e?.message ?? e))), children: "Lưu cài đặt nhắc" })
  ] }) });
}
function ZaloSettingsTab({ isAdmin }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-w-2xl", children: [
    isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(ZaloAdminCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ZaloLinkCard, {})
  ] });
}
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
const ChatPanel = reactExports.lazy(() => import("./ChatPanel-v6Zo4_z7.mjs").then((mod) => ({ default: mod.ChatPanel })));
const ZaloInteractionReminder = reactExports.lazy(() => import("./ZaloInteractionReminder-nIF3umZX.mjs").then((m) => ({ default: m.ZaloInteractionReminder })));
const ChipiAssistant = reactExports.lazy(() => import("./ChipiAssistant-2DHm8NZ1.mjs").then((m) => ({ default: m.ChipiAssistant })));
const RewardPopup = reactExports.lazy(() => import("./RewardPopup-DQJOWGB7.mjs").then((m) => ({ default: m.RewardPopup })));
function AppShell({ children }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const search = useRouterState({ select: (r) => r.location.search });
  const mobile = useIsMobile();
  const [viewportReady, setViewportReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setViewportReady(true);
  }, []);
  const launcher = mobile && path === "/" && search.view !== "dashboard";
  const [open, setOpen] = reactExports.useState(false);
  const [collapsed, setCollapsed] = reactExports.useState(false);
  const [chatOpen, setChatOpen] = reactExports.useState(false);
  const navigate = useNavigate();
  const { user, role, can, isSuperAdmin } = useCurrentUser();
  const [backgroundReadyFor, setBackgroundReadyFor] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!user?.id) return;
    let timer;
    const schedule = () => {
      if (document.visibilityState !== "visible") return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible") setBackgroundReadyFor(user.id);
      }, 1200);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [user?.id]);
  const backgroundReady = !!user && backgroundReadyFor === user.id;
  const approvalAccessByPermission = isSuperAdmin || [
    "leave.approve",
    "leave.cancel_handle",
    "biz.approval_view",
    "biz.goal_approve",
    "biz.report_approve",
    "fr.advance.approve",
    "fr.payment.approve",
    "fr.salary.approve",
    "att.witness",
    "ot.reschedule_reply",
    "task.approve_completion"
  ].some(can);
  const approvals = useQuery({ ...approvalsQuery(user?.id ?? ""), enabled: !!user?.id, staleTime: 6e4, refetchInterval: 12e4, retry: 1, refetchOnWindowFocus: false });
  const approvalCenter = useQuery({ ...approvalCenterQuery(user?.id ?? ""), enabled: !!user?.id && !approvalAccessByPermission, staleTime: 6e4, refetchInterval: 12e4, retry: 1, refetchOnWindowFocus: false });
  const approvalsEligible = approvalAccessByPermission || !!approvalCenter.data?.eligible;
  const approvalBadge = badgeText(approvalCenter.data?.todo.length ?? 0);
  const bizAccess = useAuth((s) => s.bizAccess);
  const baseAccess = useAuth((s) => s.baseAccess);
  reactExports.useEffect(() => {
    if (!user?.id) return;
    const refresh = () => {
      if (document.visibilityState === "visible") void useAuth.getState().refreshBaseAccess();
    };
    const timer = setInterval(refresh, 12e4);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    const boundary = baseAccess?.next_transition_at ? Math.max(0, new Date(baseAccess.next_transition_at).getTime() - Date.now() + 100) : null;
    const transition = boundary !== null && boundary < 2147483647 ? setTimeout(() => void useAuth.getState().refreshBaseAccess(true), boundary) : null;
    return () => {
      clearInterval(timer);
      if (transition !== null) clearTimeout(transition);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user?.id, baseAccess?.next_transition_at]);
  const launcherAccessReady = !!user && (isSuperAdmin || bizAccess?.user_id === user.id && baseAccess?.user_id === user.id) && approvals.isSuccess && !!approvals.data;
  const logout = useAuth((s) => s.logout);
  const brand = useBranding();
  const pendingCount = useAuth((s) => s.users.filter((u) => u.status === "Chờ duyệt").length);
  const isKpiAdmin = isSuperAdmin || user?.roleId === "role-admin";
  const isKpiManager = isKpiAdmin || ["kpi.view_all", "kpi.goal_create", "kpi.kr_assign", "kpi.kr_adjust", "kpi.period_manage"].some((k) => can(k));
  const canApprove = isSuperAdmin || can("settings.account_approve");
  const designTeamQuery = useQuery({
    queryKey: ["design-team-access", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("design_team_access");
      if (error) throw error;
      return !!data;
    },
    staleTime: 6e4,
    retry: 1
  });
  const visibleGroups = visibleNavigation({
    can,
    isSuperAdmin,
    designTeam: isSuperAdmin || !!designTeamQuery.data,
    isKpiAdmin,
    isKpiManager,
    kpiEnabled: isKpiV2Enabled(),
    hasAssignedApprovals: !!approvals.data?.has_assigned,
    canApprove,
    pendingCount,
    approvalsEligible
  });
  const onLogout = () => {
    logout();
    navigate({ to: "/login" });
  };
  const UserMenu = user && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuTrigger, { className: "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-sidebar-accent text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-semibold", children: user.fullName.slice(0, 1).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: user.fullName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-sidebar-foreground/60", children: role?.name || "—" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuLabel, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-normal text-muted-foreground", children: "Đăng nhập với" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: user.username })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate({ to: "/profile" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 mr-2" }),
        "Hồ sơ cá nhân"
      ] }),
      can("settings.view") && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate({ to: "/settings" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 mr-2" }),
        "Tài khoản & Cài đặt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: onLogout, className: "text-destructive focus:text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 mr-2" }),
        "Đăng xuất"
      ] })
    ] })
  ] });
  const Sidebar = (mini) => /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", mini ? "w-16" : "w-72"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2 py-5 border-b border-sidebar-border", mini ? "px-3" : "px-5"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { b: brand, className: "h-9 w-9 shrink-0 rounded-lg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("min-w-0", mini && "hidden"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold tracking-tight truncate", children: brand.app_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-sidebar-foreground/60 truncate", children: brand.description })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppNavigation, { groups: visibleGroups, path, userId: user?.id, collapsed: mini, onNavigate: () => setOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-2 border-t border-sidebar-border flex items-center gap-1", children: [
      !mini && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: UserMenu }),
        approvalsEligible && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "hidden md:inline-flex relative shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/approvals", "aria-label": `Phê duyệt${approvalBadge ? ` (${approvalBadge} chờ)` : ""}`, title: "Trung tâm Phê duyệt", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-5 w-5" }),
          approvalBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center", children: approvalBadge })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChatShortcut, { onClick: () => setChatOpen(true) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "hidden md:inline-flex shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", onClick: () => setCollapsed((v) => !v), title: mini ? "Mở rộng menu" : "Thu gọn menu", "aria-label": mini ? "Mở rộng menu" : "Thu gọn menu", children: mini ? /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeftOpen, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(PanelLeftClose, {}) })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "base-app-shell flex min-h-screen w-full bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block sticky top-0 h-screen", children: Sidebar(collapsed) }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-40 md:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/50", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 h-full", children: Sidebar(false) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MobileAppChrome, { groups: visibleGroups, userId: user?.id, name: user?.fullName, brandName: brand.app_name, logo: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandMark, { b: brand, className: "h-9 w-9 shrink-0 rounded-lg" }), notifications: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationBell, {}), approvals: approvalsEligible ? { count: approvalCenter.data?.todo.length ?? 0 } : void 0, onMenu: () => setOpen(true) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "base-app-content min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-[1600px] w-full mx-auto", children: [
        backgroundReady && user && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZaloInteractionReminder, { userId: user.id }, user.id) }),
        path === "/" && !viewportReady ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 animate-pulse rounded-lg bg-muted", "aria-label": "Đang tải trang chủ" }) : launcher && user ? /* @__PURE__ */ jsxRuntimeExports.jsx(MobileLauncher, { groups: visibleGroups, userId: user.id, name: user.fullName, area: search.area, accessReady: launcherAccessReady }) : children
      ] }),
      user && /* @__PURE__ */ jsxRuntimeExports.jsx(AccessSyncNotice, {}),
      backgroundReady && user && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipiAssistant, { userId: user.id }, user.id) }),
      backgroundReady && user && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RewardPopup, { userId: user.id }, `sao-${user.id}`) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: chatOpen, onOpenChange: setChatOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "flex h-full w-[min(94vw,480px)] flex-col gap-3 overflow-y-auto p-3 sm:max-w-[480px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "pr-10 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: "Sứ Việt Chat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Nhắn tin nhanh mà không rời công việc đang mở." })
        ] }),
        chatOpen && user && /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Đang mở trò chuyện…" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { compact: true }) })
      ] }) })
    ] })
  ] });
}
function PageHeader({
  title,
  description,
  actions
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3 mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: description })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: actions })
  ] });
}
function AccessSyncNotice() {
  const failed = useAuth((s) => s.accessSyncFailed);
  const baseFailed = useAuth((s) => s.baseAccessFailed);
  const bizFailed = useAuth((s) => s.bizAccessFailed);
  const uid2 = useAuth((s) => s.currentUserId);
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!failed || !uid2) return;
    const timer = window.setTimeout(() => {
      const state = useAuth.getState();
      if (state.currentUserId !== uid2) return;
      const reads = [];
      if (state.baseAccessFailed) reads.push(state.refreshBaseAccess(true));
      if (state.bizAccessFailed) reads.push(state.refreshBizAccess(true));
      void Promise.allSettled(reads);
    }, 12e3);
    return () => window.clearTimeout(timer);
  }, [failed, baseFailed, bizFailed, uid2]);
  if (!failed) return null;
  const explanation = baseFailed && bizFailed ? "Chưa đồng bộ được quyền hệ thống và kinh doanh" : baseFailed ? "Chưa đồng bộ được quyền hệ thống" : "Chưa đồng bộ được quyền kinh doanh";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "access-sync-notice fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: explanation }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        disabled: busy,
        className: "font-medium text-primary underline-offset-2 hover:underline disabled:opacity-50",
        onClick: async () => {
          setBusy(true);
          try {
            const state = useAuth.getState();
            const reads = [];
            if (state.baseAccessFailed) reads.push(state.refreshBaseAccess(true));
            if (state.bizAccessFailed) reads.push(state.refreshBizAccess(true));
            await Promise.allSettled(reads);
          } finally {
            setBusy(false);
          }
        },
        children: busy ? "Đang đồng bộ…" : "Thử lại"
      }
    )
  ] });
}
const SOCIAL_PLATFORMS = [
  "Facebook Page",
  "Facebook Group",
  "TikTok",
  "YouTube",
  "Instagram",
  "Zalo OA",
  "LinkedIn",
  "Khác"
];
const SOCIAL_CHANNEL_STATUSES = [
  "Đang xây",
  "Đang vận hành",
  "Đang tối ưu",
  "Tạm dừng",
  "Lưu trữ"
];
const TASK_STATUSES = [
  "Mới tạo",
  "Đã giao",
  "Đang làm",
  "Chờ xác nhận",
  "Cần sửa",
  "Hoàn thành",
  "Đã hủy"
];
function normalizeTaskStatus(s) {
  if (!s) return "Mới tạo";
  if (s === "Chưa làm") return "Mới tạo";
  if (TASK_STATUSES.includes(s)) return s;
  return "Mới tạo";
}
const CONTENT_STATUSES = [
  "Kế hoạch",
  "Đã tạo",
  "Đã giao",
  "Đang làm outline",
  "Chờ duyệt outline",
  "Cần sửa outline",
  "Outline đã duyệt",
  "Đang viết bài",
  "Chờ duyệt bài",
  "Cần sửa bài",
  "Bài viết đã duyệt",
  "Đang trình bày nháp web",
  "Chờ duyệt bản nháp web",
  "Cần sửa bản nháp web",
  "Bản nháp web đã duyệt",
  "Chờ đăng web",
  "Đã đăng web",
  "Kiểm tra index",
  "Hoàn thành",
  "Đang tối ưu",
  "Chờ duyệt tối ưu",
  "Cần sửa tối ưu",
  "Đã duyệt tối ưu",
  "Đã hủy"
];
function normalizeContentStatus(s) {
  if (s === "Bài đã duyệt") return "Bài viết đã duyệt";
  return s ?? "Kế hoạch";
}
const CONTENT_TYPES = [
  "Bài SEO",
  "Bài blog",
  "Landing page",
  "Bài danh mục",
  "Bài sản phẩm",
  "Bài tối ưu lại",
  "Bài tin tức",
  "Khác"
];
const SEARCH_INTENTS = ["Thông tin", "So sánh", "Thương mại", "Mua hàng", "Điều hướng", "Khác"];
const INDEX_STATUSES = ["Chưa kiểm tra", "Chưa index", "Đã index", "Cần xử lý"];
const SHARE_SOCIAL_STATUSES = ["Chưa share", "Đã share", "Cần share lại"];
const ENTITY_PLATFORMS = [
  "Facebook",
  "Pinterest",
  "LinkedIn",
  "Twitter/X",
  "YouTube",
  "TikTok",
  "Zalo",
  "Medium",
  "Blogspot",
  "WordPress",
  "Google Site",
  "Reddit",
  "Khác"
];
const ENTITY_STATUSES = ["Đang dùng", "Chưa dùng", "Cần kiểm tra", "Lỗi đăng nhập", "Tạm dừng"];
const KEYWORD_RANK_STATUSES = [
  "Chưa check",
  "Top 3",
  "Top 10",
  "Top 20",
  "Top 50",
  "Ngoài top 50",
  "Tăng hạng",
  "Tụt hạng",
  "Mất top"
];
const BACKLINK_TYPES = [
  "Bài PR báo chí",
  "Guest post",
  "Backlink website ngành",
  "Backlink forum",
  "Backlink social",
  "Khác"
];
const BACKLINK_STATUSES = [
  "Dự kiến",
  "Đã đặt",
  "Đã đăng",
  "Đã kiểm tra link",
  "Lỗi / mất link"
];
const OPTIMIZE_REASONS = [
  "Tối ưu định kỳ",
  "Từ khóa tụt hạng",
  "Từ khóa mất TOP",
  "Cập nhật sản phẩm/dịch vụ",
  "Cập nhật thông tin thương hiệu",
  "Bổ sung internal link",
  "Cải thiện CTA/chuyển đổi",
  "Cập nhật hình ảnh",
  "Khác"
];
const OPTIMIZE_SOURCES = ["Thủ công", "Theo lịch tối ưu", "Từ Check TOP"];
const OPTIMIZE_TARGETS = [
  "Tiêu đề/H1",
  "Nội dung bài viết",
  "Meta title/meta description",
  "Internal link",
  "CTA",
  "Hình ảnh",
  "Sản phẩm/dịch vụ",
  "Bố cục trình bày",
  "Từ khóa",
  "Khác"
];
const OPTIMIZE_RECURRING_PERIODS = [
  "Hàng tháng",
  "Mỗi 3 tháng",
  "Mỗi 6 tháng",
  "Mỗi 1 năm"
];
function periodToMonths(p) {
  switch (p) {
    case "Hàng tháng":
      return 1;
    case "Mỗi 3 tháng":
      return 3;
    case "Mỗi 6 tháng":
      return 6;
    case "Mỗi 1 năm":
      return 12;
  }
}
function computeNextOptimizeDate(baseISO, period) {
  const d = new Date(baseISO);
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + periodToMonths(period));
  return d.toISOString().slice(0, 10);
}
function isActiveKeywordTrack(k, contents) {
  if (!k.contentId) return true;
  const c = contents.find((x) => x.id === k.contentId);
  if (!c) return false;
  if (c.indexStatus !== "Đã index") return false;
  const kw = (k.keyword || "").trim().toLowerCase();
  if (!kw) return false;
  if (k.isMain) {
    return (c.mainKeyword || "").trim().toLowerCase() === kw;
  }
  const subs = (c.subKeywords || "").split(/[,;\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  return subs.includes(kw);
}
const SOCIAL_STATUSES = [
  "Kế hoạch",
  "Đang làm",
  "Chờ duyệt",
  "Cần sửa",
  "Đã duyệt",
  "Chờ đăng",
  "Đã đăng",
  "Hoàn thành",
  "Đã hủy"
];
const SOCIAL_CONTENT_TYPES = [
  "Bài ảnh đơn",
  "Album",
  "Carousel",
  "Text post",
  "Reels",
  "TikTok Video",
  "YouTube Shorts",
  "Story",
  "Livestream",
  "Khác"
];
function normalizeSocialStatus(s) {
  switch (s) {
    case "Ý tưởng":
      return "Kế hoạch";
    case "Đã lên lịch":
      return "Chờ đăng";
    default:
      return SOCIAL_STATUSES.includes(s ?? "") ? s : "Kế hoạch";
  }
}
const VIDEO_STATUSES = [
  "Kế hoạch",
  "Đã giao",
  "Đang làm kịch bản",
  "Chờ duyệt kịch bản",
  "Cần sửa kịch bản",
  "Kịch bản đã duyệt",
  "Đang quay / thu tư liệu",
  "Đang dựng",
  "Chờ duyệt video",
  "Cần sửa video",
  "Video đã duyệt",
  "Đã bàn giao",
  "Đã đăng",
  "Hoàn thành",
  "Đã hủy"
];
const VIDEO_TYPES = [
  "Video TikTok",
  "Facebook Reels",
  "YouTube Shorts",
  "Video dài YouTube",
  "Video sản phẩm",
  "Video quy trình",
  "Video feedback khách hàng",
  "Video thương hiệu",
  "Video quảng cáo",
  "Khác"
];
const VIDEO_USE_CHANNELS = [
  "TikTok",
  "Facebook",
  "YouTube",
  "Website",
  "Landing page",
  "Shopee",
  "Ads",
  "Khác"
];
function normalizeVideoStatus(s) {
  switch (s) {
    case "Ý tưởng":
      return "Kế hoạch";
    case "Đang sản xuất":
      return "Đang dựng";
    case "Chờ duyệt":
      return "Chờ duyệt video";
    case "Cần sửa":
      return "Cần sửa video";
    default:
      return VIDEO_STATUSES.includes(s ?? "") ? s : "Kế hoạch";
  }
}
const ORDER_STATUSES = [
  "Cần giao người",
  "Chờ nhận việc",
  "Đang thực hiện",
  "Chờ duyệt",
  "Cần sửa",
  "Đã duyệt",
  "Đã bàn giao",
  "Hoàn thành",
  "Đã hủy"
];
const ORDER_TYPES = [
  "Banner website",
  "Ảnh bài web",
  "Ảnh social",
  "Thumbnail video",
  "Ảnh sản phẩm",
  "Catalogue / profile",
  "Chụp ảnh",
  "Retouch ảnh",
  "Ảnh Google Map",
  "Khác"
];
const ORDER_SOURCES = ["Web", "Social", "Video", "Local", "Leader", "Task lẻ", "Khác"];
const ORDER_PRIORITIES = ["Thấp", "Trung bình", "Cao", "Gấp"];
function normalizeOrderStatus(s) {
  if (s === "Đang làm") return "Đang thực hiện";
  if (s === "Mới tạo" || s === "Chờ phân công") return "Cần giao người";
  if (ORDER_STATUSES.includes(s)) return s;
  return "Cần giao người";
}
function userToPerson(u, roles) {
  const role = roles.find((r) => r.id === u.roleId);
  return {
    id: u.id,
    name: u.fullName || u.username,
    role: role?.name,
    position: u.desiredPosition,
    email: u.email,
    phone: u.phone,
    status: u.status === "Đang hoạt động" ? "Đang làm" : "Tạm nghỉ",
    accountStatus: u.status,
    isSystem: !!u.system,
    notes: u.notes
  };
}
const GROWTH_PERIOD_TYPES = ["Tuần", "Tháng", "Quý"];
const uid = () => Math.random().toString(36).slice(2, 10);
const SEO_CHECK_TEMPLATE = {
  "Domain": [
    { name: "www & non-www", description: "Kiểm tra website đang sử dụng phiên bản nào và phiên bản còn lại đã tự động redirect về phiên bản sử dụng hay chưa." },
    { name: "http & https", description: "Kiểm tra website đã cài chứng chỉ bảo mật SSL và chuyển hướng đúng sang https hay chưa." }
  ],
  "Cấu trúc web": [
    { name: "Có đầy đủ 6 loại trang đích", description: "Kiểm tra website đã có đầy đủ các loại trang đích quan trọng hay chưa." }
  ],
  "Trải nghiệm người dùng": [
    { name: "Giao diện trang chủ", description: "Cần kiểm tra giao diện và nội dung có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện danh mục cha", description: "Cần kiểm tra giao diện và nội dung danh mục cha có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện danh mục con", description: "Cần kiểm tra giao diện và nội dung danh mục con có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện trang sản phẩm", description: "Cần kiểm tra giao diện và nội dung trang sản phẩm có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện trang bài viết", description: "Cần kiểm tra giao diện và nội dung trang bài viết có phù hợp với bộ từ khóa hay chưa." },
    { name: "Giao diện thương hiệu", description: "Cần kiểm tra giao diện và nội dung trang thương hiệu có phù hợp với bộ từ khóa hay chưa." }
  ],
  "Kiểm tra tính thân thiện và cấu trúc URL": [
    { name: "Home: domain.com", description: "Kiểm tra URL trang chủ đã được tối ưu theo đúng mẫu hay chưa." },
    { name: "Danh mục sản phẩm lớn: domain.com/danh-muc-lon/", description: "Kiểm tra URL danh mục lớn đã được tối ưu theo cấu trúc phân tầng hay chưa." },
    { name: "Danh mục sản phẩm nhỏ: domain.com/danh-muc-lon/danh-muc-nho/", description: "Kiểm tra URL danh mục nhỏ đã được tối ưu theo cấu trúc phân tầng hay chưa." },
    { name: "Trang sản phẩm", description: "Kiểm tra URL trang sản phẩm đã thân thiện, ngắn gọn và dễ đọc hay chưa." },
    { name: "Danh mục tin tức", description: "Kiểm tra URL danh mục tin tức đã được tối ưu hay chưa." },
    { name: "Danh mục nhỏ tin tức", description: "Kiểm tra URL danh mục nhỏ tin tức đã được tối ưu hay chưa." },
    { name: "Bài viết: domain.com/danh-muc-lon/danh-muc-nho/bai-viet.html", description: "Kiểm tra URL bài viết đã được tối ưu theo đúng mẫu hay chưa." },
    { name: "TAG: domain.com/tag", description: "Kiểm tra URL tag đã được tối ưu theo đúng mẫu hay chưa." },
    { name: "Page tĩnh: domain.com/page-tinh.html", description: "Kiểm tra URL page tĩnh đã được tối ưu theo đúng mẫu hay chưa." }
  ],
  "HEADING": [
    { name: "Heading trang chủ", description: "Kiểm tra tình trạng heading trang chủ." },
    { name: "Heading trang dịch vụ / sản phẩm", description: "Kiểm tra heading trang dịch vụ hoặc trang sản phẩm." },
    { name: "Heading trang danh mục con", description: "Kiểm tra heading danh mục con." },
    { name: "Heading trang danh mục bài viết", description: "Kiểm tra heading trang danh mục bài viết." },
    { name: "Heading TAG", description: "Kiểm tra heading trang tag." },
    { name: "Heading Page tĩnh", description: "Kiểm tra heading page tĩnh." }
  ],
  "Kiểm tra robots.txt": [
    { name: "Đã có file robots.txt chưa?", description: "Kiểm tra website đã có file robots.txt hay chưa." },
    { name: "Có link sitemap ở cuối chưa?", description: "Kiểm tra trong robots.txt đã có khai báo sitemap hay chưa." },
    { name: "File robots.txt chặn gì hay sai?", description: "Kiểm tra robots.txt có chặn nhầm trang quan trọng hay không." }
  ],
  "Kiểm tra Sitemap": [
    { name: "Sitemap Google", description: "Kiểm tra website có sitemap XML chưa." },
    { name: "Sitemap Google đã chuẩn chưa?", description: "Kiểm tra sitemap có đúng cấu trúc và gửi lên Google Search Console được hay chưa." },
    { name: "Sitemap người dùng", description: "Kiểm tra website có sitemap người dùng hay chưa." }
  ],
  "Tốc độ tải trang": [
    { name: "PageSpeed Insights", description: "Kiểm tra tốc độ tải trang bằng PageSpeed Insights, bao gồm desktop và mobile." }
  ],
  "Mobile friendly": [
    { name: "Kiểm tra giao diện thiết bị di động", description: "Kiểm tra website có thân thiện với thiết bị di động hay chưa." }
  ],
  "Đường dẫn ngược Breadcrumb": [
    { name: "Đường dẫn ngược đúng mẫu", description: "Kiểm tra website đã có đường dẫn ngược Breadcrumb cho danh mục, bài viết, sản phẩm hay chưa." },
    { name: "Có đường dẫn ngược", description: "Kiểm tra website có hiển thị breadcrumb hay không." },
    { name: "Gắn link đúng", description: "Kiểm tra breadcrumb có gắn đúng link phân cấp hay chưa." },
    { name: "Schema cho đường dẫn ngược", description: "Kiểm tra breadcrumb đã có khai báo schema hay chưa." }
  ],
  "Rich snippet": [
    { name: "Đánh giá sao trên trang sản phẩm", description: "Kiểm tra website đã có đánh giá sao cho bài viết hoặc sản phẩm hay chưa." }
  ],
  "Instant Article": [
    { name: "Table of Content trên trang bài viết", description: "Kiểm tra website đã có table of content trong trang bài viết hay chưa." }
  ],
  "Kiểm tra thẻ ALT": [
    { name: "Toàn website", description: "Kiểm tra thẻ ALT trên toàn bộ website đã đầy đủ hay chưa." }
  ],
  "Favicon": [
    { name: "Favicon", description: "Kiểm tra website đã có favicon chưa." }
  ],
  "Comment": [
    { name: "Comment mặc định / Comment mạng xã hội", description: "Kiểm tra website đã có phần comment cho người dùng hay chưa." }
  ],
  "Kiểm tra Schema": [
    { name: "Cấu trúc dữ liệu trên từng loại trang", description: "Kiểm tra dữ liệu có cấu trúc của website." },
    { name: "Trang chủ", description: "Kiểm tra schema trang chủ." },
    { name: "Trang sản phẩm", description: "Kiểm tra schema trang sản phẩm." },
    { name: "Trang bài viết", description: "Kiểm tra schema trang bài viết." }
  ],
  "Meta Robots": [
    { name: "Indexfollow", description: "Kiểm tra tổng số page index/follow của website." },
    { name: "noindexnofollow", description: "Kiểm tra tổng số page noindex/nofollow và tính hợp lý của các page này." }
  ],
  "Kiểm tra thẻ Canonical": [
    { name: "Trang gốc và phân trang", description: "Kiểm tra các trang phân trang và phiên bản website đã có thẻ canonical hay chưa." },
    { name: "Bộ lọc trong trang sản phẩm", description: "Kiểm tra canonical của các URL bộ lọc trong trang sản phẩm." },
    { name: "Các trang sản phẩm canonical về chính nó", description: "Kiểm tra canonical của các trang sản phẩm có trỏ về chính nó hay chưa." }
  ],
  "Thẻ ngôn ngữ Hreflang": [
    { name: "Hreflang", description: "Kiểm tra website đã có thẻ ngôn ngữ hreflang hay chưa." }
  ],
  "Thiết lập mã cài đặt Tag Manager": [
    { name: "Phân tích số liệu và theo dõi tình trạng website", description: "Kiểm tra website đã thiết lập mã cài đặt Tag Manager hay chưa." }
  ],
  "Kiểm tra quyền admin website": [
    { name: "Chỉnh sửa nội dung trên website", description: "Kiểm tra tài khoản được cấp có đủ quyền chỉnh sửa nội dung hay chưa." }
  ],
  "Kiểm tra giao diện trên nhiều trình duyệt": [
    { name: "Google Chrome, Mozilla Firefox, Internet Explorer, Safari, Cốc Cốc...", description: "Sử dụng website trên các trình duyệt khác nhau để xem có lỗi hiển thị hay không." }
  ],
  "Kiểm tra các nút Social": [
    { name: "Like, Share", description: "Kiểm tra website đã có các nút chia sẻ, nút like của mạng xã hội hay chưa." }
  ],
  "Liên kết với Fanpage": [
    { name: "Fanpage Facebook", description: "Kiểm tra website đã có phần liên kết đến Fanpage chưa." }
  ],
  "Live chat": [
    { name: "Live chat", description: "Kiểm tra website đã có phần live chat cho người dùng hay chưa." }
  ],
  "Điều hướng Sidebar": [
    { name: "Điều hướng sidebar", description: "Kiểm tra website đã có thanh điều hướng sidebar hợp lý hay chưa." }
  ],
  "Kiểm tra chức năng thanh tìm kiếm": [
    { name: "Thanh tìm kiếm trên tất cả các trang", description: "Kiểm tra chức năng tìm kiếm trên toàn trang có trả kết quả đúng theo truy vấn hay không." }
  ],
  "Kiểm tra và xử lý trang 404": [
    { name: "Đẹp mắt", description: "Kiểm tra giao diện trang 404 có dễ nhìn hay không." },
    { name: "Có nút homepage, thanh Search", description: "Kiểm tra trang 404 có nút quay lại trang chủ và thanh tìm kiếm hay không." },
    { name: "Có gợi ý nội dung hấp dẫn", description: "Kiểm tra trang 404 có gợi ý nội dung khác cho người dùng hay không." },
    { name: "Mã phản hồi là 404", description: "Kiểm tra trang lỗi có trả đúng mã HTTP 404 hay không." },
    { name: "URL giữ nguyên", description: "Kiểm tra URL lỗi có giữ nguyên để người dùng nhận biết hay không." },
    { name: "follow", description: "Kiểm tra cấu hình follow/noindex của trang 404 nếu cần." }
  ],
  "Internal Link": [
    { name: "follow", description: "Kiểm tra số lượng internal link trên website và tình trạng link. Kiểm tra tính hợp lý của internal link." }
  ],
  "External Link": [
    { name: "dofollow/nofollow", description: "Kiểm tra số lượng external link trên website và tình trạng link. Kiểm tra tính hợp lý của external link." }
  ],
  "GTmetrix": [
    { name: "Kiểm tra tốc độ tải trang", description: "Kiểm tra tốc độ tải trang bằng GTmetrix." }
  ],
  "Giúp Google tìm thấy các trang trên web": [
    { name: "Liên kết trong code HTML phải để Google đọc được", description: "Link liên kết tới trang đích nên có cấu trúc chuẩn dạng thẻ a href để Google có thể thu thập dữ liệu." }
  ],
  "CMS - Quyền quản trị": [
    { name: "Quản trị table content", description: "Kiểm tra CMS có quản trị được table content hay không." },
    { name: "Cho phép hiển thị content hoặc không", description: "Kiểm tra CMS có cho bật/tắt hiển thị nội dung hay không." },
    { name: "Table content cần phải có đường dẫn đúng chuẩn", description: "Kiểm tra đường dẫn trong table content có đúng chuẩn SEO hay không." }
  ],
  "CMS - Meta title, description, keywords, URL tất cả các trang": [
    { name: "Tất cả dữ liệu bài viết và tin trong bài viết", description: "Kiểm tra có quản trị được Alt, Title, URL ảnh trong bài viết hay không." },
    { name: "Ảnh sản phẩm và ảnh trong bài viết sản phẩm", description: "Kiểm tra có quản trị được Alt, Title, URL ảnh sản phẩm hay không." },
    { name: "Thêm mới, xóa, edit bài viết", description: "Kiểm tra CMS có cho thêm mới, xóa và sửa bài viết hay không." }
  ],
  "CMS - Tính năng trong một bài viết": [
    { name: "Liên kết với fanpage", description: "Kiểm tra bài viết có thể liên kết với fanpage hay không." },
    { name: "Có nút like, share bài đăng lên các mạng xã hội", description: "Kiểm tra bài viết có nút like/share lên mạng xã hội hay không." },
    { name: "Có chỗ để đăng tạo các thẻ Title, Meta Description, Meta Keywords, dẫn URL, các thẻ tiêu đề H1, H2, H3", description: "Kiểm tra CMS có đầy đủ trường nhập SEO cơ bản cho bài viết hay không." },
    { name: "Tự động lưu bài viết", description: "Kiểm tra CMS có chức năng tự động lưu bài viết hay không." },
    { name: "Tính năng xem thử trước khi đăng", description: "Kiểm tra CMS có chức năng xem trước bài viết trước khi đăng hay không." },
    { name: "Mã HTML trong khi đăng bài không bị lỗi", description: "Kiểm tra mã HTML trong khi đăng bài có bị lỗi hiển thị hay không." },
    { name: "Live chat trong bài viết", description: "Kiểm tra live chat có hiển thị trong bài viết nếu cần hay không." }
  ],
  "CMS - Có đầy đủ tính năng soạn thảo văn bản": [
    { name: "Có thể thêm video, hình ảnh", description: "Kiểm tra trình soạn thảo có thể thêm video, hình ảnh hay không." },
    { name: "Định dạng heading", description: "Kiểm tra trình soạn thảo có định dạng heading hay không." },
    { name: "Phông chữ, kích thước", description: "Kiểm tra trình soạn thảo có chỉnh được phông chữ và kích thước hay không." },
    { name: "Trình bôi đậm, in nghiêng, gạch chân", description: "Kiểm tra trình soạn thảo có các định dạng cơ bản hay không." },
    { name: "Tính năng trích dẫn", description: "Kiểm tra trình soạn thảo có tính năng trích dẫn hay không." },
    { name: "Định dạng UL/LI", description: "Kiểm tra trình soạn thảo có tạo danh sách bullet/number hay không." },
    { name: "Căn lề trái, phải, giữa, hai bên", description: "Kiểm tra trình soạn thảo có căn lề đầy đủ hay không." },
    { name: "Màu chữ, màu nền", description: "Kiểm tra trình soạn thảo có chỉnh màu chữ và màu nền hay không." },
    { name: "Thêm, xóa đường dẫn trong bài", description: "Kiểm tra trình soạn thảo có thêm và xóa link trong bài hay không." },
    { name: "Kẻ bảng, chỉnh sửa bảng", description: "Kiểm tra trình soạn thảo có tạo và chỉnh sửa bảng hay không." },
    { name: "Xóa định dạng", description: "Kiểm tra trình soạn thảo có chức năng xóa định dạng hay không." },
    { name: "Mở link trên tab mới", description: "Kiểm tra link trong bài có thể thiết lập mở ở tab mới hay không." }
  ]
};
const SEO_GROUPS = Object.keys(SEO_CHECK_TEMPLATE);
const TABLE_FOR = {
  brands: "brands",
  websites: "websites",
  socials: "socials",
  places: "places",
  tasks: "tasks",
  webContents: "web_contents",
  socialPosts: "social_posts",
  mapPosts: "map_posts",
  reviews: "reviews",
  videos: "videos",
  orders: "orders",
  seoChecks: "seo_checks",
  entities: "entities",
  keywords: "keywords",
  backlinks: "backlinks",
  growth: "growth",
  webTopics: "web_topics"
};
const COLLECTION_KEYS = Object.keys(TABLE_FOR);
const emptyCollections = () => ({
  brands: [],
  websites: [],
  socials: [],
  places: [],
  tasks: [],
  webContents: [],
  socialPosts: [],
  mapPosts: [],
  reviews: [],
  videos: [],
  orders: [],
  people: [],
  seoChecks: [],
  entities: [],
  keywords: [],
  backlinks: [],
  growth: [],
  webTopics: []
});
let storeUser = null;
const storeLoads = createCoalescer((uid2) => useStore.getState()._load(uid2));
async function loadAllFromSupabase(previous) {
  const failures = [];
  const results = await Promise.all(
    COLLECTION_KEYS.map(async (key) => {
      const table = TABLE_FOR[key];
      let data;
      try {
        data = await readAllPages((from, to, signal) => supabase.from(table).select(key === "orders" ? "id, data, created_at, updated_at, created_by, workflow_kind" : "id, data").order("created_at", { ascending: false }).order("id").range(from, to).abortSignal(signal));
      } catch (error) {
        failures.push(table);
        return [key, isTransientStoreRead(error) ? previous[key] : []];
      }
      let items = (data ?? []).map((r) => ({ id: r.id, ...r.data ?? {}, ...key === "orders" ? { workflowKind: r.workflow_kind ?? r.data?.workflowKind, recordCreatedAt: r.created_at, recordUpdatedAt: r.updated_at, recordCreatedBy: r.created_by } : {} }));
      if (key === "socialPosts") {
        items = items.map((p) => ({ ...p, status: normalizeSocialStatus(p.status) }));
      }
      if (key === "videos") {
        items = items.map((v) => ({ ...v, status: normalizeVideoStatus(v.status) }));
      }
      if (key === "orders") {
        items = items.map((o) => ({ ...o, status: normalizeOrderStatus(o.status) }));
      }
      if (key === "webContents") {
        items = items.map((c) => ({ ...c, status: normalizeContentStatus(c.status) }));
      }
      if (key === "tasks") {
        items = items.map((t) => ({ ...t, status: normalizeTaskStatus(t.status) }));
      }
      return [key, items];
    })
  );
  const cat = await readAllPages((from, to, signal) => supabase.from("catalogs").select("scope, items").order("scope").range(from, to).abortSignal(signal)).then((data) => ({ data, error: null })).catch((error) => ({ data: null, error }));
  const retainCatalog = cat.error && isTransientStoreRead(cat.error);
  const catMap = { plans: retainCatalog ? previous.plans : [], topics: retainCatalog ? previous.topics : [] };
  if (cat.error) failures.push("catalogs");
  for (const row of cat.data ?? []) {
    catMap[row.scope] = row.items ?? [];
  }
  const collections = Object.fromEntries(results);
  return { ...collections, plans: catMap.plans ?? [], topics: catMap.topics ?? [], readFailures: failures };
}
async function syncInsert(key, item) {
  if (key === "orders") {
    try {
      const { saveDesignOrder } = await import("./api-Bf_55NQ7.mjs");
      await saveDesignOrder(item.id, item);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không lưu được Order");
      await useStore.getState().reload();
    }
    return;
  }
  const table = TABLE_FOR[key];
  const { id, ...rest } = item;
  const { data: sess } = await supabase.auth.getSession();
  const userId = sess.session?.user?.id;
  const { error } = await supabase.from(table).insert({ id, data: rest, created_by: userId });
  if (error) {
    console.error(`Insert ${table} failed:`, error.message);
    toast.error(`Lưu thất bại: ${error.message}`);
    await useStore.getState().reload();
  }
}
async function syncUpdate(key, id, fullItem, patch, previous) {
  if (key === "orders") {
    try {
      const { saveDesignOrder } = await import("./api-Bf_55NQ7.mjs");
      await saveDesignOrder(id, patch ?? fullItem, previous);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không lưu được Order");
      await useStore.getState().reload();
    }
    return;
  }
  const table = TABLE_FOR[key];
  const { id: _ignored, ...rest } = fullItem;
  const { error } = await supabase.from(table).update({ data: rest }).eq("id", id);
  if (error) {
    console.error(`Update ${table} failed:`, error.message);
    toast.error(`Cập nhật thất bại: ${error.message}`);
    await useStore.getState().reload();
  }
}
async function syncDelete(key, id) {
  const table = TABLE_FOR[key];
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    console.error(`Delete ${table} failed:`, error.message);
    toast.error(`Xóa thất bại: ${error.message}`);
    await useStore.getState().reload();
  }
}
function recomputePeople() {
  const auth = useAuth.getState();
  const people = auth.users.map((u) => userToPerson(u, auth.roles));
  useStore.setState({ people });
}
const useStore = create((set, get) => ({
  ...emptyCollections(),
  plans: [],
  topics: [],
  loaded: false,
  initialized: false,
  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    supabase.auth.onAuthStateChange((event, session2) => {
      const uid2 = session2?.user?.id ?? null;
      if (session2 && uid2) {
        if (uid2 !== storeUser || event === "USER_UPDATED") {
          if (uid2 !== storeUser) set({ ...emptyCollections(), plans: [], topics: [], loaded: false });
          storeUser = uid2;
          setTimeout(() => void storeLoads.join(uid2), 0);
        }
      } else {
        storeUser = null;
        set({ ...emptyCollections(), plans: [], topics: [], loaded: false });
      }
    });
    useAuth.subscribe(() => recomputePeople());
    recomputePeople();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      storeUser = session.user.id;
      await storeLoads.join(session.user.id);
    }
  },
  reload: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await storeLoads.refresh(session.user.id);
  },
  _load: async (uid2) => {
    try {
      const { readFailures, ...next } = await loadAllFromSupabase(get());
      if (storeUser !== uid2) return;
      set({ ...next, loaded: true });
      if (readFailures.length) toast.error(`Không tải được ${readFailures.length} nhóm dữ liệu. Vui lòng tải lại; dữ liệu cũ chỉ được giữ khi lỗi kết nối tạm thời.`);
      recomputePeople();
    } catch (e) {
      if (storeUser !== uid2) return;
      console.error("Reload store failed", e);
      set({ loaded: true });
    }
  },
  add: (key, item) => {
    if (key === "people") {
      toast.error("Tạo nhân sự bằng cách tạo tài khoản mới ở tab Tài khoản & Phân quyền.");
      return;
    }
    set((s) => ({ [key]: [item, ...s[key]] }));
    void syncInsert(key, item);
  },
  update: (key, id, patch) => {
    if (key === "people") {
      const p = patch;
      void useAuth.getState().updateUser(id, {
        fullName: p.name,
        phone: p.phone,
        email: p.email,
        desiredPosition: p.position ?? p.role,
        notes: p.notes
      });
      return;
    }
    let updated = null;
    let previous = null;
    set((s) => {
      const list = s[key].map((i) => {
        if (i.id !== id) return i;
        previous = i;
        updated = { ...i, ...patch };
        return updated;
      });
      return { [key]: list };
    });
    if (updated) void syncUpdate(key, id, updated, patch, previous);
  },
  remove: (key, id) => {
    if (key === "people") {
      toast.error("Để loại bỏ nhân sự, hãy đổi trạng thái tài khoản sang 'Tạm khóa' hoặc 'Lưu trữ' ở tab Tài khoản.");
      return;
    }
    set((s) => ({ [key]: s[key].filter((i) => i.id !== id) }));
    void syncDelete(key, id);
  },
  setCatalog: async (scope, items) => {
    set({ [scope]: items });
    const { error } = await supabase.from("catalogs").upsert({ scope, items }, { onConflict: "scope" });
    if (error) {
      toast.error(`Lưu danh mục thất bại: ${error.message}`);
      await get().reload();
    }
  }
}));
const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const todayISO = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
const isOverdue = (deadline, status) => {
  if (!deadline || status === "Hoàn thành") return false;
  return new Date(deadline) < new Date((/* @__PURE__ */ new Date()).toDateString());
};
const ensureSeoChecks = (existing, websiteId) => {
  const have = new Set(existing.filter((c) => c.websiteId === websiteId).map((c) => `${c.group}::${c.name}`));
  const missing = [];
  SEO_GROUPS.forEach((g) => {
    SEO_CHECK_TEMPLATE[g].forEach((it) => {
      if (!have.has(`${g}::${it.name}`)) {
        missing.push({ id: uid(), websiteId, group: g, name: it.name, description: it.description, done: false });
      }
    });
  });
  return missing;
};
const PRESENCE_HEARTBEAT_MS = 12e4;
function shouldTouchPresence(lastAttemptAt, now2, visible) {
  if (!visible || !Number.isFinite(now2)) return false;
  return lastAttemptAt <= 0 || now2 < lastAttemptAt || now2 - lastAttemptAt >= PRESENCE_HEARTBEAT_MS;
}
const PUBLIC_PATHS$1 = ["/login", "/register", "/chinh-sach-bao-mat", "/reset-password"];
const PENDING_PATH = "/pending";
function AuthGate({ children }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const currentUserId = useAuth((s) => s.currentUserId);
  const initialized = useAuth((s) => s.initialized);
  const loaded = useAuth((s) => s.loaded);
  const init = useAuth((s) => s.init);
  const touchPresence = useAuth((s) => s.touchPresence);
  const refreshBizAccess = useAuth((s) => s.refreshBizAccess);
  const nextBizChange = useAuth((s) => s.bizAccess?.next_change);
  const qc = useQueryClient();
  const currentUser = useAuth(
    (s) => s.currentUserId ? s.users.find((u) => u.id === s.currentUserId) : null
  );
  const initStore = useStore((s) => s.init);
  reactExports.useEffect(() => {
    init();
    initStore();
  }, [init, initStore]);
  reactExports.useEffect(() => {
    if (!currentUserId || currentUser?.status !== "Đang hoạt động") return;
    let lastAttempt = 0;
    const touch = () => {
      const now2 = Date.now();
      if (!shouldTouchPresence(lastAttempt, now2, document.visibilityState === "visible")) return;
      lastAttempt = now2;
      void touchPresence();
    };
    touch();
    const iv = window.setInterval(touch, PRESENCE_HEARTBEAT_MS);
    window.addEventListener("focus", touch);
    document.addEventListener("visibilitychange", touch);
    return () => {
      window.clearInterval(iv);
      window.removeEventListener("focus", touch);
      document.removeEventListener("visibilitychange", touch);
    };
  }, [currentUserId, currentUser?.status, touchPresence]);
  reactExports.useEffect(() => {
    if (!currentUserId) return;
    let active = true;
    const refresh = async (force = false) => {
      const before = useAuth.getState().bizAccess;
      const previous = JSON.stringify([before?.permissions, before?.appointments, before?.legacy_assignments, before?.exceptions]);
      await refreshBizAccess(force);
      if (!active) return;
      const after = useAuth.getState().bizAccess;
      const changed2 = previous !== JSON.stringify([after?.permissions, after?.appointments, after?.legacy_assignments, after?.exceptions]);
      if (changed2) {
        qc.removeQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("biz_") });
        await qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("biz_") });
      }
    };
    const visible = () => {
      if (!document.hidden) void refresh();
    };
    const interval = window.setInterval(visible, 12e4);
    const boundary = nextBizChange ? window.setTimeout(() => void refresh(true), Math.max(0, Math.min(2147483647, Date.parse(nextBizChange) - Date.now() + 100))) : void 0;
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(boundary);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [currentUserId, nextBizChange, refreshBizAccess, qc]);
  const isPublic = PUBLIC_PATHS$1.includes(path);
  const isPending = path === PENDING_PATH;
  reactExports.useEffect(() => {
    if (!initialized) return;
    if (!currentUserId && !isPublic && !isPending) {
      try {
        const back = window.location.pathname + window.location.search;
        if (back !== "/") sessionStorage.setItem("after_login", back);
      } catch {
      }
      navigate({ to: "/login" });
      return;
    }
    if (currentUserId && loaded && currentUser?.status === "Chờ duyệt" && !isPending && !isPublic) {
      navigate({ to: "/pending" });
      return;
    }
    if (currentUserId && loaded && currentUser?.status === "Đang hoạt động" && isPending) {
      navigate({ to: "/" });
    }
  }, [currentUserId, isPublic, isPending, navigate, initialized, loaded, currentUser?.status]);
  if (isPublic) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  if (!initialized) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center text-sm text-muted-foreground", children: "Đang khôi phục phiên đăng nhập…" });
  }
  if (!currentUserId) return null;
  if (!loaded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center text-sm text-muted-foreground", children: "Đang tải dữ liệu hệ thống…" });
  }
  if (currentUser?.status === "Chờ duyệt") {
    if (isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
    return null;
  }
  if (currentUser?.status !== "Đang hoạt động") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md space-y-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "text-sm text-muted-foreground", children: currentUser ? "Tài khoản hiện không được phép truy cập. Vui lòng liên hệ quản trị viên." : "Không kiểm tra được hồ sơ tài khoản. Vui lòng tải lại hoặc liên hệ quản trị viên." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => void useAuth.getState().reload(), children: "Thử lại" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void useAuth.getState().logout(), children: "Đăng xuất" })
    ] })
  ] }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function BasePermissionRefresh() {
  const uid2 = useAuth((s) => s.currentUserId);
  const access = useAuth((s) => s.baseAccess);
  reactExports.useEffect(() => {
    if (!uid2 || access?.user_id !== uid2 || !access.next_transition_at) return;
    const delay = Date.parse(access.next_transition_at) - Date.parse(access.server_now);
    if (!Number.isFinite(delay)) return;
    const timer = window.setTimeout(() => {
      useAuth.setState({ baseAccess: null });
      void useAuth.getState().refreshBaseAccess(true);
    }, Math.min(2147e6, Math.max(0, delay)));
    return () => clearTimeout(timer);
  }, [uid2, access]);
  return null;
}
const PUBLIC_PATHS = ["/login", "/register", "/pending", "/chinh-sach-bao-mat", "/reset-password"];
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$1s = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$1s.useRouteContext();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isPublic = PUBLIC_PATHS.includes(path);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SignalCacheGuard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BasePermissionRefresh, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BrandingSync, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGate, { children: isPublic ? /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] });
}
const Progress = reactExports.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root$3,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = Root$3.displayName;
const getPublicBranding = createServerFn({
  method: "GET"
}).handler(createSsrRpc("03caa914b26cd5697651f3e13df399d71200c4d62bc7d1f969687ba4e1004513"));
const KPI_ENGINE_VERSION = "v2-2";
const empty = () => ({ goals: [], periods: [], items: [], adjustments: [], krs: [] });
let cache = empty();
let queue = Promise.resolve();
const listeners = /* @__PURE__ */ new Set();
const onCloudSync = (fn) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const db = supabase;
const goalRow = (g) => ({
  id: g.id,
  title: g.title,
  description: g.description,
  period_start: g.periodStart,
  period_end: g.periodEnd,
  status: g.status,
  brand_id: g.brandId,
  website_id: g.websiteId,
  social_id: g.socialId,
  metadata: g.metadata,
  created_by: g.createdBy
});
const periodRow = (p) => ({
  id: p.id,
  user_id: p.userId,
  period_type: p.periodType,
  period_start: p.periodStart,
  period_end: p.periodEnd,
  goal_id: p.goalId,
  status: p.status,
  created_by: p.createdBy
});
const krRow = (k) => ({
  id: k.id,
  goal_id: k.goalId,
  metric_key: k.metricKey,
  label: k.label,
  target_value: k.targetValue,
  brand_id: k.brandId,
  website_id: k.websiteId,
  social_id: k.socialId,
  deadline: k.deadline,
  status: k.status,
  metadata: k.metadata,
  created_by: k.createdBy
});
const itemRow = (i) => ({
  id: i.id,
  kpi_period_id: i.kpiPeriodId,
  kr_id: i.krId ?? null,
  metric_key: i.metricKey,
  label: i.label,
  target_value: i.targetValue,
  unit: i.unit,
  target_operator: i.targetOperator,
  brand_id: i.brandId,
  website_id: i.websiteId,
  social_id: i.socialId,
  metadata: i.metadata
});
async function hydrateKpi() {
  const [g, p, i, a, k] = await Promise.all([
    db.from("goals").select("*"),
    db.from("employee_kpi_periods").select("*"),
    db.from("employee_kpi_items").select("*"),
    db.from("employee_kpi_adjustments").select("*"),
    db.from("goal_krs").select("*")
  ]);
  const err = g.error || p.error || i.error || k.error;
  if (err) throw new Error(err.message);
  cache = {
    goals: (g.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      periodStart: r.period_start,
      periodEnd: r.period_end,
      status: r.status,
      brandId: r.brand_id,
      websiteId: r.website_id,
      socialId: r.social_id,
      metadata: r.metadata ?? {},
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    })),
    periods: (p.data ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      periodType: r.period_type,
      periodStart: r.period_start,
      periodEnd: r.period_end,
      goalId: r.goal_id,
      status: r.status,
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    })),
    items: (i.data ?? []).map((r) => ({
      id: r.id,
      kpiPeriodId: r.kpi_period_id,
      krId: r.kr_id ?? null,
      metricKey: r.metric_key,
      label: r.label,
      targetValue: Number(r.target_value),
      unit: r.unit,
      targetOperator: r.target_operator,
      brandId: r.brand_id,
      websiteId: r.website_id,
      socialId: r.social_id,
      metadata: r.metadata ?? {},
      createdAt: r.created_at,
      updatedAt: r.updated_at
    })),
    adjustments: (a.data ?? []).map((r) => ({ id: r.id, itemId: r.item_id, field: "targetValue", from: Number(r.from_value), to: Number(r.to_value), by: r.created_by, at: r.created_at, reason: r.reason })),
    krs: (k.data ?? []).map((r) => ({
      id: r.id,
      goalId: r.goal_id,
      metricKey: r.metric_key,
      label: r.label,
      targetValue: Number(r.target_value),
      brandId: r.brand_id,
      websiteId: r.website_id,
      socialId: r.social_id,
      deadline: r.deadline,
      status: r.status,
      metadata: r.metadata ?? {},
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }))
  };
  return structuredClone(cache);
}
const changed = (prev, next) => {
  const m = new Map(prev.map((x) => [x.id, JSON.stringify(x)]));
  return next.filter((x) => m.get(x.id) !== JSON.stringify(x));
};
const removed = (prev, next) => {
  const s = new Set(next.map((x) => x.id));
  return prev.filter((x) => !s.has(x.id)).map((x) => x.id);
};
const ok$1 = (r) => {
  if (r.error) throw new Error(r.error.message);
};
async function push(prev, next) {
  const { data: u } = await supabase.auth.getUser();
  const me = u.user?.id ?? null;
  const g = changed(prev.goals, next.goals);
  if (g.length) ok$1(await db.from("goals").upsert(g.map(goalRow)));
  const k = changed(prev.krs ?? [], next.krs ?? []);
  if (k.length) ok$1(await db.from("goal_krs").upsert(k.map(krRow)));
  const prevP = new Map(prev.periods.map((p) => [p.id, p]));
  const newP = next.periods.filter((p) => !prevP.has(p.id));
  if (newP.length) ok$1(await db.from("employee_kpi_periods").insert(newP.map(periodRow)));
  const delI = removed(prev.items, next.items);
  if (delI.length) ok$1(await db.from("employee_kpi_items").delete().in("id", delI));
  const it = changed(prev.items, next.items);
  if (it.length) ok$1(await db.from("employee_kpi_items").upsert(it.map(itemRow)));
  const adj = changed(prev.adjustments, next.adjustments);
  if (adj.length) ok$1(await db.from("employee_kpi_adjustments").insert(adj.map((x) => ({ id: x.id, item_id: x.itemId, field: x.field, from_value: x.from, to_value: x.to, reason: x.reason, created_by: me }))));
  for (const p of changed(prev.periods, next.periods).filter((p2) => prevP.has(p2.id))) {
    ok$1(await db.from("employee_kpi_periods").update(periodRow(p)).eq("id", p.id));
    if (p.status === "locked" && prevP.get(p.id).status !== "locked") {
      const items = next.items.filter((i) => i.kpiPeriodId === p.id).map((i) => ({
        itemId: i.id,
        metricKey: i.metricKey,
        unit: i.unit,
        target: i.targetValue,
        brandId: i.brandId,
        websiteId: i.websiteId,
        socialId: i.socialId,
        direction: getKpiMetric(i.metricKey)?.direction ?? "at_least",
        deadline: i.metadata.deadline ?? p.periodEnd,
        actual: i.metadata.lockedActual ?? null,
        achieved: i.metadata.lockedAchieved ?? null,
        evidence: i.metadata.lockedEvidence ?? []
      }));
      ok$1(await db.from("employee_kpi_snapshots").insert({ kpi_period_id: p.id, engine_version: KPI_ENGINE_VERSION, data: { items }, locked_by: me }));
    }
  }
  const delP = removed(prev.periods, next.periods);
  if (delP.length) ok$1(await db.from("employee_kpi_periods").delete().in("id", delP));
  const delK = removed(prev.krs ?? [], next.krs ?? []);
  if (delK.length) ok$1(await db.from("goal_krs").delete().in("id", delK));
  const delG = removed(prev.goals, next.goals);
  if (delG.length) ok$1(await db.from("goals").delete().in("id", delG));
}
let lastSave = Promise.resolve();
const flushKpi = () => lastSave;
const cloudRepository = {
  load: () => structuredClone(cache),
  save(next) {
    const prev = cache;
    cache = structuredClone(next);
    const p = queue.then(() => push(prev, next));
    lastSave = p;
    queue = p.then(
      () => listeners.forEach((f) => f()),
      async (e) => {
        await hydrateKpi().catch(() => {
        });
        listeners.forEach((f) => f(`Không lưu được: ${e.message}`));
      }
    );
  }
};
function findCreditFromHistory(history, submitStatus, approvedStatus) {
  const h = (history ?? []).filter((e) => e && e.at && !Number.isNaN(timeOf(e.at))).slice().sort((a, b) => timeOf(a.at) - timeOf(b.at));
  const approvedIdx = h.findIndex((e) => e.toStatus === approvedStatus);
  if (approvedIdx < 0) return { found: "none" };
  for (let i = approvedIdx - 1; i >= 0; i--) {
    if (h[i].toStatus === submitStatus) return { found: "ok", submittedAt: h[i].at, byId: h[i].byId, byName: h[i].byName };
  }
  return { found: "approved_no_submit" };
}
function submitterMatches(ev, emp) {
  if (ev.byId) return ev.byId === emp.id ? "yes" : "no";
  if (ev.byName) {
    if (!emp.fullName) return matchesEmployee(ev.byName, { id: emp.id, username: emp.username }) ? "yes" : "unknown";
    return matchesEmployee(ev.byName, emp) ? "yes" : "no";
  }
  return "unknown";
}
function scopeOk(item, rec) {
  if (item.brandId && rec.brandId !== item.brandId) return false;
  if (item.websiteId && rec.websiteId !== item.websiteId) return false;
  if (item.socialId && rec.socialId !== item.socialId) return false;
  return true;
}
function onTime$1(deadline, credited) {
  const d = toDateKey(deadline);
  return d ? credited <= d : null;
}
const WEB_POST_APPROVAL = /* @__PURE__ */ new Set([
  "Bài viết đã duyệt",
  "Đang trình bày nháp web",
  "Chờ duyệt bản nháp web",
  "Cần sửa bản nháp web",
  "Bản nháp web đã duyệt",
  "Chờ đăng web",
  "Đã đăng web",
  "Kiểm tra index",
  "Hoàn thành"
]);
const SOCIAL_POST_APPROVAL = /* @__PURE__ */ new Set(["Đã duyệt", "Chờ đăng", "Đã đăng", "Hoàn thành"]);
function calcWebContentCompleted(employee, item, period, data) {
  const evidence = [];
  const warnings = [];
  for (const c of data.webContents) {
    if (c.status === "Đã hủy") continue;
    if (c.type === "Bài tối ưu lại") continue;
    if (!scopeOk(item, { brandId: c.brandId, websiteId: c.websiteId })) continue;
    const isWriter = matchesEmployee(c.writer, employee);
    const r = findCreditFromHistory(c.history, "Chờ duyệt bài", "Bài viết đã duyệt");
    let credited = null;
    const basis = "history";
    if (r.found === "ok") {
      const who = submitterMatches(r, employee);
      if (who === "no") continue;
      if (who === "unknown") {
        if (isWriter) warnings.push({
          sourceType: "web_content",
          sourceId: c.id,
          title: c.title,
          code: "unverified_no_history",
          message: "Không xác định được người gửi bản được duyệt — Chưa xác minh, không tính."
        });
        continue;
      }
      credited = toDateKey(r.submittedAt);
    } else if (isWriter && WEB_POST_APPROVAL.has(c.status)) {
      warnings.push({
        sourceType: "web_content",
        sourceId: c.id,
        title: c.title,
        code: "unverified_no_history",
        message: "Bài đã qua bước duyệt nhưng thiếu lịch sử gửi duyệt — Chưa xác minh, không tính."
      });
    }
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const revisions = c.draftRevisions ?? 0;
    evidence.push({
      sourceType: "web_content",
      sourceId: c.id,
      title: c.title,
      creditedAt: credited,
      brandId: c.brandId ?? null,
      websiteId: c.websiteId ?? null,
      deadline: c.deadline ?? null,
      onTime: onTime$1(c.deadline ?? null, credited),
      revisions,
      firstPass: revisions === 0,
      basis
    });
  }
  return { metricKey: "web_content_completed", actualValue: evidence.length, evidence, warnings, supported: true };
}
function calcSocialPostCompleted(employee, item, period, data) {
  const evidence = [];
  const warnings = [];
  for (const p of data.socialPosts) {
    if (p.status === "Đã hủy") continue;
    if (!scopeOk(item, { brandId: p.brandId, socialId: p.channelId })) continue;
    const isWriter = matchesEmployee(p.writer, employee);
    const r = findCreditFromHistory(p.history, "Chờ duyệt", "Đã duyệt");
    const who = r.found === "ok" ? submitterMatches(r, employee) : "unknown";
    if (who === "no") continue;
    if (r.found !== "ok" || who === "unknown") {
      if (isWriter && SOCIAL_POST_APPROVAL.has(p.status)) {
        warnings.push({
          sourceType: "social_post",
          sourceId: p.id,
          title: p.title,
          code: "unverified_no_history",
          message: "Không xác định được người/ngày gửi bản được duyệt — Chưa xác minh, không tính."
        });
      }
      continue;
    }
    const credited = toDateKey(r.submittedAt);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const revisions = p.revisions ?? 0;
    evidence.push({
      sourceType: "social_post",
      sourceId: p.id,
      title: p.title,
      creditedAt: credited,
      brandId: p.brandId ?? null,
      socialId: p.channelId ?? null,
      deadline: null,
      onTime: null,
      // không invent deadline Writer cho Social
      revisions,
      firstPass: revisions === 0,
      basis: "history"
    });
  }
  return { metricKey: "social_post_completed", actualValue: evidence.length, evidence, warnings, supported: true };
}
function calcTaskCompleted(employee, item, period, data) {
  const evidence = [];
  const warnings = [];
  for (const t of data.tasks) {
    if (t.status !== "Hoàn thành") continue;
    if (!matchesEmployee(t.assignee, employee)) continue;
    if (!scopeOk(item, { brandId: t.brandId })) continue;
    const credited = toDateKey(t.submittedAt);
    if (!credited) {
      warnings.push({
        sourceType: "task",
        sourceId: t.id,
        title: t.title,
        code: "missing_submitted_at",
        message: "Task Hoàn thành nhưng không có ngày gửi hoàn thành — không tính."
      });
      continue;
    }
    if (!isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const revisions = t.revisions ?? 0;
    evidence.push({
      sourceType: "task",
      sourceId: t.id,
      title: t.title,
      creditedAt: credited,
      brandId: t.brandId ?? null,
      deadline: t.deadline ?? null,
      onTime: onTime$1(t.deadline ?? null, credited),
      revisions,
      firstPass: revisions === 0,
      basis: "submittedAt"
    });
  }
  return { metricKey: "task_completed", actualValue: evidence.length, evidence, warnings, supported: true };
}
function calculateKpiItem(employee, item, period, data) {
  switch (item.metricKey) {
    case "web_content_completed":
      return calcWebContentCompleted(employee, item, period, data);
    case "social_post_completed":
      return calcSocialPostCompleted(employee, item, period, data);
    case "task_completed":
      return calcTaskCompleted(employee, item, period, data);
    default:
      return { metricKey: item.metricKey, actualValue: 0, evidence: [], warnings: [], supported: false };
  }
}
function lastSubmitBeforeApproval(history, submit, approved) {
  const h = (history ?? []).filter((e) => e?.at && !Number.isNaN(timeOf(e.at))).slice().sort((a, b) => timeOf(a.at) - timeOf(b.at));
  const ai = h.findIndex((e) => e.toStatus === approved);
  if (ai < 0) return { found: "none" };
  for (let i = ai - 1; i >= 0; i--) if (h[i].toStatus === submit) return { found: "ok", entry: h[i] };
  return { found: "approved_no_submit" };
}
function firstTransition(history, to) {
  const h = (history ?? []).filter((e) => e?.at && e.toStatus === to && !Number.isNaN(timeOf(e.at))).sort((a, b) => timeOf(a.at) - timeOf(b.at));
  return h[0] ?? null;
}
function byMatches(e, emp) {
  if (e.byId) return e.byId === emp.id;
  return !!emp.fullName && matchesEmployee(e.byName, emp);
}
function onTime(deadline, credited) {
  const d = toDateKey(deadline ?? null);
  return d ? credited <= d : null;
}
function finish(metricKey, evidence, warnings, forceInsufficient = false) {
  const insufficient = forceInsufficient || evidence.length === 0 && warnings.length > 0;
  return {
    metricKey,
    evidence,
    warnings,
    supported: true,
    dataStatus: insufficient ? "insufficient_data" : "verified",
    actualValue: insufficient ? null : evidence.length
  };
}
function fromStageEvents(emp, stage, events, period, lookup) {
  const out = [];
  const bySrc = /* @__PURE__ */ new Map();
  for (const e of events ?? []) if (e.stage === stage) bySrc.set(e.sourceId, [...bySrc.get(e.sourceId) ?? [], e]);
  for (const [sid, evs] of bySrc) {
    const approved = evs.filter((e) => e.eventType === "approved" || e.eventType === "published").sort((a, b) => timeOf(a.occurredAt) - timeOf(b.occurredAt))[0];
    if (!approved) continue;
    const submit = stage === "video_publish" || stage === "video_shoot" ? approved : evs.filter((e) => e.eventType === "submitted" && e.version === approved.version).sort((a, b) => timeOf(b.occurredAt) - timeOf(a.occurredAt))[0];
    if (!submit || !matchesEmployee(submit.userId, emp)) continue;
    const credited = toDateKey(submit.occurredAt);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const meta = lookup(sid);
    const revisions = evs.filter((e) => e.eventType === "revision_requested").length;
    out.push({
      sourceType: stage === "design_order" ? "design_order" : "video",
      sourceId: sid,
      title: meta?.title ?? sid,
      stage,
      creditedAt: credited,
      brandId: meta?.brandId ?? null,
      deadline: meta?.deadline ?? null,
      onTime: onTime(meta?.deadline, credited),
      revisions,
      firstPass: revisions === 0,
      basis: "stage_event"
    });
  }
  return out;
}
const videoMeta = (data, dl) => (id) => {
  const v = data.videos.find((x) => x.id === id);
  return v ? { title: v.title, brandId: v.brandId ?? null, deadline: dl(v) } : null;
};
function calcVideoReviewedStage(metricKey, stage, submit, approved, deadlineOf, passedStatuses, emp, item, period, data) {
  const evidence = [];
  const warnings = [];
  const sidecarIds = new Set((data.stageEvents ?? []).filter((e) => e.stage === stage).map((e) => e.sourceId));
  evidence.push(...fromStageEvents(emp, stage, data.stageEvents, period, videoMeta(data, deadlineOf)).filter((e) => !item.brandId || e.brandId === item.brandId));
  for (const v of data.videos) {
    if (v.status === "Đã hủy" || sidecarIds.has(v.id)) continue;
    if (item.brandId && v.brandId !== item.brandId) continue;
    const r = lastSubmitBeforeApproval(v.history, submit, approved);
    if (r.found !== "ok") {
      if (passedStatuses.has(v.status) && matchesEmployee(v.owner, emp)) {
        warnings.push({
          sourceType: "video",
          sourceId: v.id,
          title: v.title,
          code: "unverified_no_history",
          message: "Đã qua duyệt nhưng thiếu lịch sử nộp — không tính, không dùng owner hiện tại."
        });
      }
      continue;
    }
    const e = r.entry;
    if (!e.byId && !e.byName) {
      if (matchesEmployee(v.owner, emp)) warnings.push({
        sourceType: "video",
        sourceId: v.id,
        title: v.title,
        code: "submitter_unknown",
        message: "Không xác định được người nộp bản được duyệt."
      });
      continue;
    }
    if (!byMatches(e, emp)) continue;
    const credited = toDateKey(e.at);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const dl = deadlineOf(v);
    evidence.push({
      sourceType: "video",
      sourceId: v.id,
      title: v.title,
      stage,
      creditedAt: credited,
      brandId: v.brandId ?? null,
      deadline: dl,
      onTime: onTime(dl, credited),
      revisions: null,
      firstPass: null,
      basis: "history_submit"
    });
  }
  return finish(metricKey, evidence, warnings);
}
const SCRIPT_PASSED = /* @__PURE__ */ new Set(["Kịch bản đã duyệt", "Đang quay / thu tư liệu", "Đang dựng", "Chờ duyệt video", "Cần sửa video", "Video đã duyệt", "Đã bàn giao", "Đã đăng", "Hoàn thành"]);
const EDIT_PASSED = /* @__PURE__ */ new Set(["Video đã duyệt", "Đã bàn giao", "Đã đăng", "Hoàn thành"]);
const calcVideoScriptCompleted = (emp, item, period, data) => calcVideoReviewedStage(
  "video_script_completed",
  "video_script",
  "Chờ duyệt kịch bản",
  "Kịch bản đã duyệt",
  (v) => v.scriptDeadline ?? null,
  SCRIPT_PASSED,
  emp,
  item,
  period,
  data
);
const calcVideoEditCompleted = (emp, item, period, data) => calcVideoReviewedStage(
  "video_edit_completed",
  "video_edit",
  "Chờ duyệt video",
  "Video đã duyệt",
  () => null,
  EDIT_PASSED,
  emp,
  item,
  period,
  data
);
function calcVideoShootCompleted(emp, item, period, data) {
  const hasSidecar = (data.stageEvents ?? []).some((e) => e.stage === "video_shoot");
  const evidence = fromStageEvents(emp, "video_shoot", data.stageEvents, period, videoMeta(data, () => null)).filter((e) => !item.brandId || e.brandId === item.brandId);
  const warnings = [];
  if (!hasSidecar) {
    for (const v of data.videos) {
      if (v.status === "Đã hủy" || item.brandId && v.brandId !== item.brandId) continue;
      if (firstTransition(v.history, "Đang dựng") || v.footageLink) {
        warnings.push({
          sourceType: "video",
          sourceId: v.id,
          title: v.title,
          code: "no_stage_event",
          message: "Workflow không ghi người quay & sự kiện hoàn thành quay — không suy từ trạng thái Đang dựng."
        });
      }
    }
  }
  return finish("video_shoot_completed", evidence, warnings, !hasSidecar);
}
function calcVideoPublished(emp, item, period, data) {
  const evidence = [];
  const warnings = [];
  const posts = new Map(data.socialPosts.map((p) => [p.id, p]));
  for (const v of data.videos) {
    if (v.status === "Đã hủy") continue;
    if (item.brandId && v.brandId !== item.brandId) continue;
    const linked = v.socialPostId ? posts.get(v.socialPostId) : void 0;
    if (item.socialId && linked?.channelId !== item.socialId) continue;
    let ev = null;
    let basis = "history_publish";
    if (linked && linked.status !== "Đã hủy") {
      ev = firstTransition(linked.history, "Đã đăng");
      basis = "linked_social_publish";
    }
    if (!ev) {
      ev = firstTransition(v.history, "Đã đăng");
      basis = "history_publish";
    }
    if (!ev) {
      if ((v.status === "Đã đăng" || v.status === "Hoàn thành") && matchesEmployee(v.owner, emp)) {
        warnings.push({
          sourceType: "video",
          sourceId: v.id,
          title: v.title,
          code: "unverified_no_history",
          message: "Đã đăng nhưng không có sự kiện đăng — không xác định người đăng."
        });
      }
      continue;
    }
    if (!ev.byId && !ev.byName) continue;
    if (!byMatches(ev, emp)) continue;
    const credited = toDateKey(ev.at);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    const dl = v.scheduledPublishDate ?? null;
    evidence.push({
      sourceType: "video",
      sourceId: v.id,
      title: v.title,
      stage: "video_publish",
      creditedAt: credited,
      brandId: v.brandId ?? null,
      deadline: dl,
      onTime: onTime(dl, credited),
      revisions: null,
      firstPass: null,
      basis
    });
  }
  return finish("video_published", evidence, warnings);
}
const ORDER_PASSED = /* @__PURE__ */ new Set(["Đã duyệt", "Đã bàn giao", "Hoàn thành"]);
function designEvidence(emp, item, period, data) {
  const evidence = [];
  const warnings = [];
  const seen = /* @__PURE__ */ new Set();
  for (const o of data.designOrders) {
    if (o.status === "Đã hủy" || seen.has(o.id)) continue;
    if (item.brandId && o.brandId !== item.brandId) continue;
    const r = lastSubmitBeforeApproval(o.history, "Chờ duyệt", "Đã duyệt");
    if (r.found !== "ok") {
      if (ORDER_PASSED.has(o.status) && matchesEmployee(o.assignee, emp)) {
        warnings.push({
          sourceType: "design_order",
          sourceId: o.id,
          title: o.title,
          code: "unverified_no_history",
          message: "Order đã duyệt nhưng thiếu lịch sử nộp bản được duyệt — không tính."
        });
      }
      continue;
    }
    const e = r.entry;
    if (!e.byId && !e.byName) continue;
    if (!byMatches(e, emp)) continue;
    const credited = toDateKey(e.at);
    if (!credited || !isWithinPeriod(credited, period.periodStart, period.periodEnd)) continue;
    seen.add(o.id);
    const revisions = o.revisions ?? 0;
    const pts = data.designPoints?.[o.id];
    evidence.push({
      sourceType: "design_order",
      sourceId: o.id,
      title: o.title,
      stage: "design_order",
      creditedAt: credited,
      brandId: o.brandId ?? null,
      deadline: o.deadline ?? null,
      onTime: onTime(o.deadline, credited),
      revisions,
      firstPass: revisions === 0,
      points: typeof pts === "number" && Number.isFinite(pts) ? pts : void 0,
      basis: "history_submit"
    });
  }
  return { evidence, warnings };
}
function calcDesignOrderCompleted(emp, item, period, data) {
  const { evidence, warnings } = designEvidence(emp, item, period, data);
  return finish("design_order_completed", evidence, warnings);
}
function calcDesignPointsCompleted(emp, item, period, data) {
  const { evidence, warnings } = designEvidence(emp, item, period, data);
  for (const e of evidence) if (e.points === void 0) {
    warnings.push({
      sourceType: "design_order",
      sourceId: e.sourceId,
      title: e.title,
      code: "missing_points",
      message: "Order verified nhưng chưa cấu hình điểm — không tự gán theo loại order."
    });
  }
  const missing = evidence.some((e) => e.points === void 0);
  const total = evidence.reduce((s, e) => s + (e.points ?? 0), 0);
  return {
    metricKey: "design_points_completed",
    evidence,
    warnings,
    supported: true,
    dataStatus: missing ? "insufficient_data" : "verified",
    actualValue: missing ? null : Math.round(total * 100) / 100
  };
}
function calculateVideoDesignItem(emp, item, period, data) {
  switch (item.metricKey) {
    case "video_script_completed":
      return calcVideoScriptCompleted(emp, item, period, data);
    case "video_shoot_completed":
      return calcVideoShootCompleted(emp, item, period, data);
    case "video_edit_completed":
      return calcVideoEditCompleted(emp, item, period, data);
    case "video_published":
      return calcVideoPublished(emp, item, period, data);
    case "design_order_completed":
      return calcDesignOrderCompleted(emp, item, period, data);
    case "design_points_completed":
      return calcDesignPointsCompleted(emp, item, period, data);
    default:
      return { metricKey: item.metricKey, actualValue: null, dataStatus: "insufficient_data", evidence: [], warnings: [], supported: false };
  }
}
const RATE_FIELD = { task_on_time_rate: "onTime", task_first_pass_rate: "firstPass" };
function recomputeFiltered(metricKey, unit, evidence) {
  const rf = RATE_FIELD[metricKey];
  if (rf) {
    const den = evidence.filter((e) => e[rf] !== null);
    return den.length ? Math.round(den.filter((e) => e[rf]).length / den.length * 1e3) / 10 : null;
  }
  if (metricKey === "design_points_completed") return evidence.some((e) => e.points === void 0) ? null : evidence.reduce((s, e) => s + (e.points ?? 0), 0);
  const COUNTABLE_KR = ["seo_keyword_top", "custom_task_result", "task_overdue", "map_post_published", "web_post_published", "social_post_published"];
  if (unit === "count" && (!KR_ENGINE_KEYS.has(metricKey) || COUNTABLE_KR.includes(metricKey))) return evidence.length;
  return null;
}
const ratio = (num, den) => ({ num, den, pct: den > 0 ? Math.round(num / den * 1e3) / 10 : null });
function safeEmployee(u, all) {
  const n = (s) => (s ?? "").trim().toLocaleLowerCase("vi");
  const ambiguous = !!u.fullName && all.filter((x) => n(x.fullName) === n(u.fullName)).length > 1;
  return { emp: { id: u.id, username: u.username, fullName: ambiguous ? null : u.fullName }, ambiguous };
}
function filterMatch(f, r) {
  if (f.brandId && r.brandId !== f.brandId) return false;
  if (f.websiteId && r.websiteId !== f.websiteId) return false;
  if (f.socialId && r.socialId !== f.socialId) return false;
  return true;
}
function sourceLookup(d) {
  const web = new Map(d.webContents.map((x) => [x.id, x]));
  const soc = new Map(d.socialPosts.map((x) => [x.id, x]));
  const vid = new Map(d.videos.map((x) => [x.id, x]));
  return (t, id) => {
    if (t === "web_content") return { websiteId: web.get(id)?.websiteId ?? null, socialId: null };
    if (t === "social_post") return { websiteId: null, socialId: soc.get(id)?.channelId ?? null };
    if (t === "video") {
      const v = vid.get(id);
      const p = v?.socialPostId ? soc.get(v.socialPostId) : void 0;
      return { websiteId: null, socialId: p?.channelId ?? null };
    }
    return { websiteId: null, socialId: null };
  };
}
function buildItemReport(emp, item, period, data, f, adjustments, today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
  const m = getKpiMetric(item.metricKey);
  const p = { periodStart: period.periodStart, periodEnd: period.periodEnd };
  const input = { metricKey: item.metricKey, targetValue: item.targetValue, brandId: item.brandId, websiteId: item.websiteId, socialId: item.socialId };
  const look = sourceLookup(data);
  let actual;
  let warnings = 0;
  let supported = true;
  let raw = [];
  if (KR_ENGINE_KEYS.has(item.metricKey)) {
    const r = calculateKrItem(emp, { ...input, metadata: item.metadata }, p, { tasks: data.tasks, keywords: data.keywords, mapPosts: data.mapPosts, websites: data.websites, webContents: data.webContents, socialPosts: data.socialPosts, growth: data.growth });
    warnings = r.warnings.length;
    supported = r.supported;
    actual = r.actualValue;
    raw = r.evidence.map((e) => ({
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      title: e.title,
      creditedAt: e.creditedAt,
      brandId: e.brandId,
      websiteId: e.websiteId,
      socialId: null,
      deadline: e.deadline,
      onTime: e.onTime,
      firstPass: e.firstPass
    }));
  } else if (["web_content_completed", "social_post_completed", "task_completed"].includes(item.metricKey)) {
    const r = calculateKpiItem(emp, input, p, { webContents: data.webContents, socialPosts: data.socialPosts, tasks: data.tasks });
    warnings = r.warnings.length;
    supported = r.supported;
    actual = r.evidence.length === 0 && warnings > 0 ? null : r.actualValue;
    raw = r.evidence.map((e) => ({
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      title: e.title,
      creditedAt: e.creditedAt,
      brandId: e.brandId,
      websiteId: e.websiteId ?? null,
      socialId: e.socialId ?? null,
      deadline: e.deadline,
      onTime: e.onTime,
      firstPass: e.basis === "history" || e.basis === "submittedAt" ? e.firstPass : null
    }));
  } else {
    const r = calculateVideoDesignItem(emp, input, p, { videos: data.videos, designOrders: data.orders, socialPosts: data.socialPosts, designPoints: data.designPoints });
    warnings = r.warnings.length;
    supported = r.supported;
    actual = r.actualValue;
    raw = r.evidence.map((e) => ({
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      title: e.title,
      creditedAt: e.creditedAt,
      brandId: e.brandId,
      ...look(e.sourceType, e.sourceId),
      deadline: e.deadline,
      onTime: e.onTime,
      firstPass: e.firstPass,
      points: e.points
    }));
  }
  if (!supported) actual = null;
  const filtered = !!(f.brandId || f.websiteId || f.socialId);
  const itemWithin = (!f.brandId || item.brandId === f.brandId) && (!f.websiteId || item.websiteId === f.websiteId) && (!f.socialId || item.socialId === f.socialId);
  const contributionOnly = filtered && !itemWithin;
  const evidence = raw.filter((e) => filterMatch(f, e));
  if (contributionOnly && actual !== null) actual = recomputeFiltered(item.metricKey, m?.unit ?? item.unit, evidence);
  const lockedTarget = typeof item.metadata?.lockedTarget === "number" ? item.metadata.lockedTarget : null;
  const target = lockedTarget ?? item.targetValue;
  let lockedSource = null;
  if (isLockedPeriod(period)) {
    const snap = lockedResultOf(item);
    if (snap && !contributionOnly) {
      actual = snap.actual;
      lockedSource = "snapshot";
    } else if (!snap) lockedSource = "live";
  }
  const direction = directionOf(item.metricKey);
  const ev = evaluateKr({
    actual,
    target,
    direction,
    deadline: krDeadline(item, period.periodEnd),
    today,
    unit: m?.unit ?? item.unit,
    evidenceDates: evidence.map((e) => e.creditedAt),
    warnings,
    contributionOnly
  });
  const bmap = /* @__PURE__ */ new Map();
  for (const e of evidence) {
    const key = `${e.brandId}|${e.websiteId}|${e.socialId}`;
    const b = bmap.get(key) ?? { key, brandId: e.brandId, websiteId: e.websiteId, socialId: e.socialId, count: 0 };
    b.count++;
    bmap.set(key, b);
  }
  return {
    item,
    label: item.label || m?.label || item.metricKey,
    unit: m?.unit ?? item.unit,
    category: m?.category ?? "?",
    target,
    lockedTarget,
    adjustments: adjustments.filter((a) => a.itemId === item.id),
    // Coverage: có mục chưa xác minh có thể đổi kết luận → không chấm Chưa đạt chắc chắn.
    actual,
    contributionOnly,
    achieved: ev.achieved,
    evaluation: ev,
    deadline: ev.deadline,
    lockedSource,
    supported,
    evidence,
    warnings,
    breakdown: [...bmap.values()]
  };
}
const WEB_WRITER_OPEN = /* @__PURE__ */ new Set(["Đã giao", "Đang viết", "Cần sửa bài", "Đang làm", "Chưa bắt đầu"]);
const isWaiting = (s) => s.startsWith("Chờ duyệt") || s === "Chờ xác nhận";
function buildWork(emp, d, f, today) {
  const out = [];
  const push2 = (r) => {
    if (!filterMatch(f, r)) return;
    const dl = toDateKey(r.deadline);
    out.push({ ...r, overdue: !isWaiting(r.status) && !!dl && dl < today });
  };
  for (const t of d.tasks) if (matchesEmployee(t.assignee, emp) && ["Mới tạo", "Đã giao", "Đang làm", "Cần sửa", "Chờ xác nhận"].includes(t.status))
    push2({ sourceType: "task", sourceId: t.id, title: t.title, status: t.status, deadline: t.deadline ?? null, brandId: t.brandId ?? null, websiteId: null, socialId: null });
  for (const c of d.webContents) if (matchesEmployee(c.writer, emp) && c.type !== "Bài tối ưu lại" && (WEB_WRITER_OPEN.has(c.status) || c.status === "Chờ duyệt bài"))
    push2({ sourceType: "web_content", sourceId: c.id, title: c.title, status: c.status, deadline: c.deadline ?? null, brandId: c.brandId ?? null, websiteId: c.websiteId ?? null, socialId: null });
  for (const p of d.socialPosts) if (matchesEmployee(p.writer, emp) && ["Kế hoạch", "Đang làm", "Cần sửa", "Chờ duyệt"].includes(p.status))
    push2({ sourceType: "social_post", sourceId: p.id, title: p.title, status: p.status, deadline: null, brandId: p.brandId ?? null, websiteId: null, socialId: p.channelId ?? null });
  for (const v of d.videos) if (matchesEmployee(v.owner, emp) && !["Video đã duyệt", "Đã bàn giao", "Đã đăng", "Hoàn thành", "Đã hủy", "Kế hoạch"].includes(v.status))
    push2({ sourceType: "video", sourceId: v.id, title: v.title, status: v.status, deadline: v.status.includes("kịch bản") ? v.scriptDeadline ?? null : null, brandId: v.brandId ?? null, websiteId: null, socialId: null });
  for (const o of d.orders) if (matchesEmployee(o.assignee, emp) && ["Chờ nhận việc", "Đang thực hiện", "Cần sửa", "Chờ duyệt"].includes(o.status))
    push2({ sourceType: "design_order", sourceId: o.id, title: o.title, status: o.status, deadline: o.deadline ?? null, brandId: o.brandId ?? null, websiteId: null, socialId: null });
  return { backlog: out.filter((r) => !isWaiting(r.status)), overdue: out.filter((r) => r.overdue), waitingReview: out.filter((r) => isWaiting(r.status)) };
}
function buildEmployeeReport(args) {
  const { emp, ambiguous } = safeEmployee(args.user, args.allUsers);
  const periods = args.periods.filter((p) => p.userId === args.user.id);
  const items = [];
  for (const p of periods) for (const it of args.items.filter((i) => i.kpiPeriodId === p.id)) {
    const f = args.filters;
    if (f.brandId && it.brandId && it.brandId !== f.brandId || f.websiteId && it.websiteId && it.websiteId !== f.websiteId || f.socialId && it.socialId && it.socialId !== f.socialId || f.websiteId && it.socialId || f.socialId && it.websiteId) continue;
    const r = buildItemReport(emp, it, p, args.data, args.filters, args.adjustments, args.today);
    if (args.filters.group && r.category !== args.filters.group) continue;
    items.push(r);
  }
  const uniq = /* @__PURE__ */ new Map();
  for (const r of items) for (const e of r.evidence) uniq.set(`${e.sourceType}:${e.sourceId}`, e);
  const ev = [...uniq.values()];
  const withDl = ev.filter((e) => e.onTime !== null);
  const withQ = ev.filter((e) => e.firstPass !== null);
  const work = buildWork(emp, args.data, args.filters, args.today);
  return {
    userId: args.user.id,
    ambiguousName: ambiguous,
    periods,
    items,
    achievedCount: items.filter((i) => i.achieved === true).length,
    assignedCount: items.filter((i) => !i.contributionOnly).length,
    output: ev.length,
    onTime: ratio(withDl.filter((e) => e.onTime).length, withDl.length),
    quality: ratio(withQ.filter((e) => e.firstPass).length, withQ.length),
    ...work
  };
}
const pct = (a, t) => t > 0 ? Math.round(a / t * 1e3) / 10 : null;
const assetKey = (r) => `${r.brandId}|${r.websiteId}|${r.socialId}`;
const NON_ADDITIVE = /* @__PURE__ */ new Set(["seo_keyword_top", "custom_task_result"]);
const aggKey = (it, unit) => unit === "percent" || NON_ADDITIVE.has(it.metricKey) ? `${it.metricKey}#${it.id}` : it.metricKey;
const dedup = (rows) => [...new Map(rows.map((r) => [`${r.sourceType}:${r.sourceId}`, r])).values()];
function buildOverview(args) {
  const f = args.filters;
  const scope = { brandId: f.brandId, websiteId: f.websiteId, socialId: f.socialId, group: f.group || void 0 };
  const periods = args.periods.filter((p) => !f.userId || p.userId === f.userId);
  const byMetric = /* @__PURE__ */ new Map();
  const work = [];
  const itemRes = /* @__PURE__ */ new Map();
  const periodById = new Map(args.periods.map((p) => [p.id, p]));
  for (const u of args.users) {
    if (!periods.some((p) => p.userId === u.id)) continue;
    const r = buildEmployeeReport({ user: u, allUsers: args.users, periods, items: args.items, adjustments: args.adjustments, data: args.data, filters: scope, today: args.today });
    work.push(...r.backlog, ...r.waitingReview);
    const breakdownIds = findNestedItems(r.items.map((x) => x.item), periodById);
    for (const it of r.items) {
      if (f.brandId && it.item.brandId && it.item.brandId !== f.brandId) continue;
      if (f.websiteId && it.item.websiteId && it.item.websiteId !== f.websiteId) continue;
      if (f.socialId && it.item.socialId && it.item.socialId !== f.socialId) continue;
      if (f.metricKey && it.item.metricKey !== f.metricKey) continue;
      itemRes.set(it.item.id, { actual: it.actual, target: it.contributionOnly ? 0 : it.target });
      const key = aggKey(it.item, it.unit);
      const dir = getKpiMetric(it.item.metricKey)?.direction ?? "at_least";
      const m = byMetric.get(key) ?? {
        key,
        metricKey: it.item.metricKey,
        label: it.label,
        unit: it.unit,
        category: it.category,
        direction: dir,
        actual: 0,
        target: 0,
        pct: null,
        achieved: null,
        unverifiedAssignments: 0,
        contributionActual: 0,
        contributionItems: 0,
        uniqueAssets: 0,
        contributions: [],
        assets: [],
        unallocatedTarget: 0,
        evidence: [],
        warnings: 0,
        overlapItems: 0,
        status: "na"
      };
      m.contributions.push({ userId: u.id, userName: u.fullName || u.username || u.id, itemId: it.item.id, actual: it.actual, target: it.target, contributionOnly: it.contributionOnly });
      m.evidence.push(...it.evidence);
      if (!it.contributionOnly && breakdownIds.has(it.item.id)) {
        m.overlapItems++;
        itemRes.delete(it.item.id);
      } else if (it.contributionOnly) {
        m.contributionItems++;
        m.contributionActual += it.actual ?? 0;
      } else {
        m.target += it.target;
        m.warnings += it.warnings;
        if (it.actual === null) m.unverifiedAssignments++;
        else m.actual += it.actual;
        const scoped = it.item.websiteId || it.item.socialId;
        if (!scoped) m.unallocatedTarget += it.target;
        else {
          const k = assetKey(it.item);
          const a = m.assets.find((x) => x.key === k) ?? (m.assets.push({ key: k, brandId: it.item.brandId, websiteId: it.item.websiteId, socialId: it.item.socialId, actual: 0, target: 0, evidence: [] }), m.assets[m.assets.length - 1]);
          a.target = (a.target ?? 0) + it.target;
        }
      }
      byMetric.set(key, m);
    }
  }
  for (const m of byMetric.values()) {
    m.evidence = dedup(m.evidence);
    m.uniqueAssets = m.evidence.length;
    m.status = m.overlapItems > 0 ? "reconciling" : m.target <= 0 ? "na" : m.unverifiedAssignments > 0 || m.warnings > 0 ? "insufficient" : "ok";
    m.achieved = m.status === "ok" ? krAchieved(m.actual, m.target, m.direction) : null;
    m.pct = m.status === "ok" && m.direction !== "at_most" ? pct(m.actual, m.target) : null;
    for (const e of m.evidence) {
      if (!e.websiteId && !e.socialId) continue;
      const k = assetKey(e);
      let a = m.assets.find((x) => x.key === k);
      if (!a) {
        a = { key: k, brandId: e.brandId, websiteId: e.websiteId, socialId: e.socialId, actual: 0, target: null, evidence: [] };
        m.assets.push(a);
      }
      a.evidence.push(e);
      a.actual++;
    }
  }
  const all = dedup(work);
  const metrics = [...byMetric.values()].sort((a, b) => a.category.localeCompare(b.category));
  const goals = args.goals.filter((g) => !f.brandId || g.brandId === f.brandId).map((g) => {
    const goalItems = krsOfGoal(g.id, args.items, periods);
    const gp = periods.filter((p) => goalItems.some((i) => i.kpiPeriodId === p.id));
    const ms = /* @__PURE__ */ new Map();
    for (const it of goalItems) {
      const r = itemRes.get(it.id);
      if (!r) continue;
      const key = aggKey(it, getKpiMetric(it.metricKey)?.unit);
      const m = byMetric.get(key);
      if (!m) continue;
      const row = ms.get(key) ?? { key, direction: m.direction, metricKey: it.metricKey, label: m.label, unit: m.unit, actual: 0, target: 0, unverified: 0 };
      row.target += r.target;
      if (r.actual === null) row.unverified++;
      else row.actual += r.actual;
      ms.set(key, row);
    }
    const list = [...ms.values()];
    return {
      goal: g,
      metrics: list,
      people: new Set(gp.map((p) => p.userId)).size,
      achieved: !list.length || list.some((x) => x.unverified) ? null : list.every((x) => krAchieved(x.actual, x.target, x.direction) === true)
    };
  });
  const videoTouched = new Set(metrics.filter((m) => m.category === "video").flatMap((m) => m.evidence.filter((e) => e.sourceType === "video").map((e) => e.sourceId))).size;
  const videoDelivered = new Set((byMetric.get("video_published")?.evidence ?? []).map((e) => `${e.sourceType}:${e.sourceId}`)).size;
  return {
    metrics,
    goals,
    videoTouched,
    videoDelivered,
    backlog: all.filter((r) => !r.status.startsWith("Chờ duyệt") && r.status !== "Chờ xác nhận"),
    overdue: all.filter((r) => r.overdue),
    waitingReview: all.filter((r) => r.status.startsWith("Chờ duyệt") || r.status === "Chờ xác nhận"),
    unmet: metrics.filter((m) => m.status === "ok" && (m.achieved === false || m.unallocatedTarget > 0))
  };
}
function scopeContains(a, b) {
  const lvl = (x) => x.websiteId || x.socialId ? 2 : x.brandId ? 1 : 0;
  if (lvl(a) >= lvl(b)) return false;
  if (lvl(a) === 0) return true;
  return a.brandId === b.brandId;
}
function findNestedItems(items, periods) {
  const out = /* @__PURE__ */ new Set();
  const overlapDates = (x, y) => {
    const p = periods.get(x.kpiPeriodId), q = periods.get(y.kpiPeriodId);
    return !p || !q || p.periodStart <= q.periodEnd && q.periodStart <= p.periodEnd;
  };
  for (const b of items) for (const a of items)
    if (a.id !== b.id && a.metricKey === b.metricKey && overlapDates(a, b) && scopeContains(a, b)) out.add(b.id);
  return out;
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[\w-]{1,64}$/;
const GROUPS = ["web", "social", "video", "design", "task"];
function validateV2Search(s) {
  const pick = (k, re) => typeof s[k] === "string" && re.test(s[k]) ? s[k] : void 0;
  const out = {
    from: pick("from", DATE),
    to: pick("to", DATE),
    brandId: pick("brandId", ID),
    websiteId: pick("websiteId", ID),
    socialId: pick("socialId", ID),
    metric: pick("metric", ID),
    userId: pick("userId", ID),
    group: GROUPS.includes(String(s.group)) ? String(s.group) : void 0
  };
  if (out.websiteId && out.socialId) out.socialId = void 0;
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v));
}
const $$splitComponentImporter$1c = () => import("./index-BqVNOEGd.mjs").then((n) => n.i);
const Route$1r = createFileRoute()({
  validateSearch: (search) => ({
    area: typeof search.area === "string" ? search.area : void 0,
    view: search.view === "dashboard" ? "dashboard" : void 0
  }),
  loader: () => getPublicBranding(),
  head: ({
    loaderData
  }) => ({
    meta: [{
      title: `Trang chủ — ${loaderData?.app_name ?? "Base Sứ Việt"}`
    }, {
      name: "description",
      content: loaderData?.description ?? "Quản lý công việc"
    }, {
      property: "og:title",
      content: `Trang chủ — ${loaderData?.app_name ?? "Base Sứ Việt"}`
    }, {
      property: "og:description",
      content: loaderData?.description ?? "Quản lý công việc"
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }, {
      name: "twitter:title",
      content: `Trang chủ — ${loaderData?.app_name ?? "Base Sứ Việt"}`
    }, {
      name: "twitter:description",
      content: loaderData?.description ?? "Quản lý công việc"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1c, "component")
});
const $$splitComponentImporter$1b = () => import("./ai-knowledge-PInFsSA3.mjs");
const Route$1q = createFileRoute()({
  validateSearch: (search) => ({
    doc: typeof search.doc === "string" ? search.doc : void 0
  }),
  head: () => ({
    meta: [{
      title: "Kho kiến thức AI Sứ Việt — Base"
    }, {
      name: "robots",
      content: "noindex,nofollow,noarchive"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1b, "component")
});
const $$splitComponentImporter$1a = () => import("./approvals-C6Dc22Nl.mjs");
const Route$1p = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Trung tâm Phê duyệt — Base Marketing"
    }, {
      name: "description",
      content: "Một nơi xem và xử lý toàn bộ hồ sơ đang chờ bạn phê duyệt trên Base Sứ Việt."
    }, {
      property: "og:title",
      content: "Trung tâm Phê duyệt — Base Marketing"
    }, {
      property: "og:description",
      content: "Một nơi xem và xử lý toàn bộ hồ sơ đang chờ bạn phê duyệt trên Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1a, "component")
});
const $$splitComponentImporter$19 = () => import("./attendance-BmDkO1ZZ.mjs");
const Route$1o = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Giải trình chấm công — Base Marketing"
    }, {
      name: "description",
      content: "Gửi và xử lý giải trình quên chấm công nội bộ."
    }, {
      property: "og:title",
      content: "Giải trình chấm công — Base Marketing"
    }, {
      property: "og:description",
      content: "Gửi và xử lý giải trình quên chấm công nội bộ."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
const DESC = "Cách Sứ Việt thu thập, sử dụng, bảo vệ và xử lý dữ liệu khách hàng từ Facebook Lead Ads.";
const $$splitComponentImporter$18 = () => import("./chinh-sach-bao-mat-DBx56u43.mjs");
const URL$1 = "https://base.suviet.vn/chinh-sach-bao-mat";
const TITLE = "Chính sách quyền riêng tư — Base Sứ Việt";
const Route$1n = createFileRoute()({
  head: () => ({
    meta: [{
      title: TITLE
    }, {
      name: "description",
      content: DESC
    }, {
      property: "og:title",
      content: TITLE
    }, {
      property: "og:description",
      content: DESC
    }, {
      property: "og:type",
      content: "article"
    }, {
      property: "og:url",
      content: URL$1
    }, {
      name: "twitter:card",
      content: "summary"
    }],
    links: [{
      rel: "canonical",
      href: URL$1
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
const $$splitComponentImporter$17 = () => import("./community-CvXqHvNg.mjs");
const Route$1m = createFileRoute()({
  validateSearch: (search) => ({
    tab: search.tab === "chat" ? "chat" : "feed",
    thread: typeof search.thread === "string" && /^[0-9a-f-]{36}$/i.test(search.thread) ? search.thread : void 0
  }),
  head: () => ({
    meta: [{
      title: "Cộng đồng & Tin nhắn nội bộ — Base Sứ Việt"
    }, {
      name: "robots",
      content: "noindex,nofollow,noarchive"
    }, {
      name: "description",
      content: "Bảng tin và trò chuyện dành riêng cho nhân viên Sứ Việt."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
const $$splitComponentImporter$16 = () => import("./goals-v2-CL_4GgrU.mjs");
const Route$1l = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Mục tiêu — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Mục tiêu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Mục tiêu — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Mục tiêu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
const $$splitComponentImporter$15 = () => import("./inbox-B6UL6Wmw.mjs");
const Route$1k = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Messenger Fanpage — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
const $$splitComponentImporter$14 = () => import("./k3-center-BrS7IPa8.mjs");
const Route$1j = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Trung tâm 3K — Điều hành Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
const $$splitComponentImporter$13 = () => import("./leave-CYgxuAxg.mjs");
const Route$1i = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Nghỉ phép & Đi sớm muộn — Base Marketing"
    }, {
      name: "description",
      content: "Gửi và phê duyệt đơn nghỉ phép, đi muộn, về sớm nội bộ."
    }, {
      property: "og:title",
      content: "Nghỉ phép & Đi sớm muộn — Base Marketing"
    }, {
      property: "og:description",
      content: "Gửi và phê duyệt đơn nghỉ phép, đi muộn, về sớm nội bộ."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
const $$splitComponentImporter$12 = () => import("./login-DwxibvXK.mjs");
const Route$1h = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Đăng nhập — Base Sứ Việt"
    }, {
      name: "description",
      content: "Đăng nhập Base Sứ Việt — nền tảng quản lý công việc và tín hiệu của Sứ Việt."
    }, {
      property: "og:title",
      content: "Đăng nhập — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Truy cập nền tảng quản lý công việc và tín hiệu Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
const $$splitComponentImporter$11 = () => import("./okrs-Be0bEVLC.mjs");
const Route$1g = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "OKRs — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "OKRs: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "OKRs — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "OKRs: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
const $$splitComponentImporter$10 = () => import("./orders-CUSetRxc.mjs");
const Route$1f = createFileRoute()({
  validateSearch: (s) => typeof s.open === "string" ? {
    open: s.open
  } : {},
  head: () => ({
    meta: [{
      title: "Tất cả công việc Thiết Kế — Base Sứ Việt"
    }, {
      name: "description",
      content: "Theo dõi công việc Chụp ảnh, Ấn phẩm Marketing và Ma-két đơn hàng theo quyền."
    }, {
      property: "og:title",
      content: "Tất cả công việc Thiết Kế — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Công việc Thiết Kế trên một hệ thống Order thống nhất."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
const $$splitComponentImporter$$ = () => import("./organization-BsAAQoLM.mjs").then((n) => n.w);
const Route$1e = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Cơ cấu tổ chức & Phân quyền — Base Sứ Việt"
    }, {
      name: "description",
      content: "Quản lý cơ cấu, quyền mặc định và quyền bổ sung của nhân sự Sứ Việt."
    }, {
      property: "og:title",
      content: "Cơ cấu tổ chức & Phân quyền — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Quyền nhân sự theo nguồn cấp, phạm vi và hiệu lực."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$$, "component")
});
const $$splitComponentImporter$_ = () => import("./overview-v2-Cpm1ZcwS.mjs");
const Route$1d = createFileRoute()({
  validateSearch: validateV2Search,
  head: () => ({
    meta: [{
      "title": "Tổng quan Brand — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Tổng quan mục tiêu theo thương hiệu và kênh."
    }, {
      "property": "og:title",
      "content": "Tổng quan Brand — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Tổng quan mục tiêu theo thương hiệu và kênh."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$_, "component")
});
const $$splitComponentImporter$Z = () => import("./pending-CU_WMQN7.mjs");
const Route$1c = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Tài khoản đang chờ duyệt — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Tài khoản đang chờ duyệt: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Tài khoản đang chờ duyệt — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Tài khoản đang chờ duyệt: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$Z, "component")
});
const $$splitComponentImporter$Y = () => import("./profile-CIn7YylV.mjs");
const Route$1b = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Hồ sơ cá nhân — Base Sứ Việt"
    }, {
      name: "description",
      content: "Bảo mật tài khoản: đổi mật khẩu và email khôi phục trên Base Sứ Việt."
    }, {
      property: "og:title",
      content: "Hồ sơ cá nhân — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Bảo mật tài khoản: đổi mật khẩu và email khôi phục trên Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$Y, "component")
});
const $$splitComponentImporter$X = () => import("./register-_yqcVzsW.mjs");
const Route$1a = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Đăng ký — Base Sứ Việt"
    }, {
      name: "description",
      content: "Đăng ký tài khoản làm việc trên Base Sứ Việt."
    }, {
      property: "og:title",
      content: "Đăng ký — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Đăng ký tài khoản làm việc trên Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$X, "component")
});
const $$splitComponentImporter$W = () => import("./reports-v2-Dld1d7eI.mjs");
const Route$19 = createFileRoute()({
  validateSearch: validateV2Search,
  head: () => ({
    meta: [{
      title: "Báo cáo — Base Marketing"
    }, {
      name: "description",
      content: "Báo cáo tiến độ theo dự án và hiệu suất theo nhân sự."
    }, {
      property: "og:title",
      content: "Báo cáo — Base Marketing"
    }, {
      property: "og:description",
      content: "Báo cáo tiến độ theo dự án và hiệu suất theo nhân sự."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$W, "component")
});
const $$splitComponentImporter$V = () => import("./reset-password-D-DTx3jt.mjs");
const Route$18 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Đặt lại mật khẩu — Base Sứ Việt"
    }, {
      name: "description",
      content: "Đặt lại mật khẩu tài khoản Base Sứ Việt bằng liên kết khôi phục."
    }, {
      property: "og:title",
      content: "Đặt lại mật khẩu — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Đặt lại mật khẩu tài khoản Base Sứ Việt bằng liên kết khôi phục."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$V, "component")
});
const $$splitComponentImporter$U = () => import("./settings-Bf429Sl1.mjs");
const Route$17 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Cài Đặt — Base Marketing Sứ Việt"
    }, {
      name: "description",
      content: "Quản lý vai trò, danh mục và các kết nối của Base Marketing Sứ Việt."
    }, {
      property: "og:title",
      content: "Cài Đặt — Base Marketing Sứ Việt"
    }, {
      property: "og:description",
      content: "Quản lý vai trò, danh mục và các kết nối của Base Marketing Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$U, "component")
});
const $$splitComponentImporter$T = () => import("./showroom-DO3ogc_j.mjs");
const Route$16 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Showroom — Base Sứ Việt"
    }, {
      name: "description",
      content: "Khối Showroom độc lập: cửa hàng, nhân sự, vai trò và cơ cấu bán lẻ."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$T, "component")
});
const $$splitComponentImporter$S = () => import("./tasks-BTA-MCTw.mjs");
const Route$15 = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Task To-do List — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Task To-do List: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Task To-do List — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Task To-do List: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$S, "component")
});
const $$splitComponentImporter$R = () => import("./videos-DxTm8Q_k.mjs");
const Route$14 = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Sản Xuất Video — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Sản Xuất Video: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Sản Xuất Video — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Sản Xuất Video: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$R, "component")
});
const $$splitComponentImporter$Q = () => import("./web-chat-BkP1cELr.mjs");
const Route$13 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Tư vấn Website — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$Q, "component")
});
const $$splitComponentImporter$P = () => import("./web-contents-BftQ-z5P.mjs");
const Route$12 = createFileRoute()({
  validateSearch: (s) => typeof s.open === "string" && s.open ? {
    open: s.open
  } : {},
  head: () => ({
    meta: [{
      "title": "Tất cả Content Web — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Tất cả Content Web: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Tất cả Content Web — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Tất cả Content Web: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$P, "component")
});
const $$splitComponentImporter$O = () => import("./biz.index-DryJS-xO.mjs");
const Route$11 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Tổng quan — Quản trị Kinh doanh"
    }, {
      name: "description",
      content: "Dashboard theo dõi kết quả kinh doanh, KPI, deadline và tình trạng báo cáo của các phòng kinh doanh."
    }, {
      property: "og:title",
      content: "Tổng quan — Quản trị Kinh doanh"
    }, {
      property: "og:description",
      content: "Dashboard theo dõi kết quả kinh doanh, KPI, deadline và tình trạng báo cáo."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$O, "component")
});
const $$splitComponentImporter$N = () => import("./biz.3k-DdgEi8iu.mjs");
const Route$10 = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K của tôi — Base Sứ Việt"
    }, {
      name: "description",
      content: "Quản lý thực thi 3K Ngày, Tuần và Tháng tại Sứ Việt: mục tiêu KG, hành động KF, KPI, công việc và tổng kết."
    }, {
      property: "og:title",
      content: "3K của tôi — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Một công việc xuyên suốt 3K Ngày, Tuần và Tháng của Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$N, "component")
});
const $$splitComponentImporter$M = () => import("./biz.3k-area-CzyyMZoz.mjs");
const Route$$ = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K Kinh doanh — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$M, "component")
});
const $$splitComponentImporter$L = () => import("./biz.approvals-Hfl8A4kG.mjs");
const Route$_ = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Phê duyệt Kinh doanh — Base Sứ Việt"
    }, {
      name: "description",
      content: "Hồ sơ KR và Báo cáo Kinh doanh đến lượt xử lý, các cấp phê duyệt và lịch sử theo phạm vi được giao."
    }, {
      property: "og:title",
      content: "Phê duyệt Kinh doanh — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Trung tâm xử lý hồ sơ KR và Báo cáo Kinh doanh của Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$L, "component")
});
const $$splitComponentImporter$K = () => import("./biz.crm-DXNkEix_.mjs");
const Route$Z = createFileRoute()({
  head: () => ({
    meta: [{
      title: "CRM Khách Hàng — Base Sứ Việt"
    }, {
      name: "description",
      content: "Quản lý khách hàng, lịch chăm sóc và báo cáo CRM theo cơ cấu Kinh doanh Sứ Việt."
    }, {
      property: "og:title",
      content: "CRM Khách Hàng — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Hồ sơ khách hàng và chăm sóc hằng ngày theo phạm vi được phân quyền."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$K, "component")
});
const $$splitComponentImporter$J = () => import("./biz.goals-BJd5janQ.mjs");
const Route$Y = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Mục tiêu KR — Quản trị Kinh doanh"
    }, {
      name: "description",
      content: "Lập mục tiêu KR năm, tự phân bổ theo từng tháng và gửi lãnh đạo phê duyệt."
    }, {
      property: "og:title",
      content: "Mục tiêu KR — Quản trị Kinh doanh"
    }, {
      property: "og:description",
      content: "Lập mục tiêu KR năm, phân bổ theo tháng và gửi phê duyệt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$J, "component")
});
const $$splitComponentImporter$I = () => import("./biz.plans-BWNrnlvJ.mjs");
const Route$X = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Kế hoạch kinh doanh — Quản trị Kinh doanh"
    }, {
      name: "description",
      content: "Nộp và quản lý kế hoạch kinh doanh Tháng / Quý / Năm bằng đường dẫn Google Docs."
    }, {
      property: "og:title",
      content: "Kế hoạch kinh doanh — Quản trị Kinh doanh"
    }, {
      property: "og:description",
      content: "Nộp và quản lý kế hoạch kinh doanh Tháng / Quý / Năm."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$I, "component")
});
const $$splitComponentImporter$H = () => import("./biz.products-CkxK2Vi5.mjs");
const Route$W = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Kho Sản Phẩm — Base Sứ Việt"
    }, {
      name: "description",
      content: "Nền tảng tra cứu và quản lý sản phẩm Sứ Việt đang được chuẩn bị kết nối."
    }, {
      property: "og:title",
      content: "Kho Sản Phẩm — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Kho Sản Phẩm Sứ Việt — sắp ra mắt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$H, "component")
});
const $$splitComponentImporter$G = () => import("./biz.reports-eAxgmS6l.mjs");
const Route$V = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Báo cáo kinh doanh — Quản trị Kinh doanh"
    }, {
      name: "description",
      content: "Báo cáo Sứ Việt theo chu kỳ Ngày, Tuần, Tháng, Quý; cấu hình lịch nộp và xem kết quả kinh doanh."
    }, {
      property: "og:title",
      content: "Báo cáo kinh doanh — Quản trị Kinh doanh"
    }, {
      property: "og:description",
      content: "Nộp báo cáo kinh doanh theo kỳ, lãnh đạo xác nhận kết quả."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$G, "component")
});
const $$splitComponentImporter$F = () => import("./biz.sale-work-DwxNHyjh.mjs");
const Route$U = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Sale Work Zalo — Base Sứ Việt"
    }, {
      name: "description",
      content: "Liên kết truy cập và thông tin đăng nhập Sale Work Zalo được cấp riêng cho từng nhân sự Sứ Việt."
    }, {
      property: "og:title",
      content: "Sale Work Zalo — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Truy cập nhanh Sale Work Zalo với tài khoản được cấp và bảo vệ riêng."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$F, "component")
});
const $$splitComponentImporter$E = () => import("./biz.settings-CFlTlvEN.mjs");
const Route$T = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Cài đặt — Quản trị Kinh doanh"
    }, {
      name: "description",
      content: "Cấu hình quy trình phê duyệt, chỉ số KR và deadline Kinh doanh Base Sứ Việt."
    }, {
      property: "og:title",
      content: "Cài đặt — Quản trị Kinh doanh"
    }, {
      property: "og:description",
      content: "Quy trình phê duyệt, chỉ số KR và deadline Kinh doanh Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$E, "component")
});
const $$splitComponentImporter$D = () => import("./brands.index-CKWV-P7p.mjs");
const Route$S = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Thương Hiệu — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Thương Hiệu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Thương Hiệu — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Thương Hiệu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$D, "component")
});
const $$splitNotFoundComponentImporter = () => import("./brands._id-BLLYNB7k.mjs");
const $$splitComponentImporter$C = () => import("./brands._id-CE6bsJZV.mjs");
const Route$R = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Chi tiết thương hiệu — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Chi tiết thương hiệu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Chi tiết thương hiệu — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Chi tiết thương hiệu: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$C, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const $$splitComponentImporter$B = () => import("./design.marketing-DKKCuJhM.mjs");
const Route$Q = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Ấn phẩm Marketing — Base Sứ Việt"
    }, {
      name: "description",
      content: "Ấn phẩm Marketing: quản lý công việc và báo cáo theo phạm vi được cấp quyền."
    }, {
      property: "og:title",
      content: "Ấn phẩm Marketing — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Ấn phẩm Marketing: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$B, "component")
});
const $$splitComponentImporter$A = () => import("./design.mockups-B3IPWlie.mjs");
const Route$P = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Ma-két đơn hàng — Base Sứ Việt"
    }, {
      name: "description",
      content: "Ma-két đơn hàng: quản lý công việc và báo cáo theo phạm vi được cấp quyền."
    }, {
      property: "og:title",
      content: "Ma-két đơn hàng — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Ma-két đơn hàng: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$A, "component")
});
const $$splitComponentImporter$z = () => import("./design.photo--DNO6lGX.mjs");
const Route$O = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Chụp ảnh — Base Sứ Việt"
    }, {
      name: "description",
      content: "Chụp ảnh: quản lý công việc và báo cáo theo phạm vi được cấp quyền."
    }, {
      property: "og:title",
      content: "Chụp ảnh — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Chụp ảnh: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const $$splitComponentImporter$y = () => import("./design.reports-uNC9MvxJ.mjs");
const Route$N = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Báo cáo & Phân tích Thiết Kế — Base Sứ Việt"
    }, {
      name: "description",
      content: "Báo cáo & Phân tích Thiết Kế: quản lý công việc và báo cáo theo phạm vi được cấp quyền."
    }, {
      property: "og:title",
      content: "Báo cáo & Phân tích Thiết Kế — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Báo cáo & Phân tích Thiết Kế: công việc, tiến độ và số liệu thực tế tại Base Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./distribution.3k-DL-6NwwC.mjs");
const Route$M = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K Phân Phối — Base Sứ Việt"
    }, {
      name: "description",
      content: "KG, KF, KPI và theo dõi nhân sự trong phạm vi Phân Phối trên Base Sứ Việt."
    }, {
      property: "og:title",
      content: "3K Phân Phối — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "3K theo phân công và phạm vi tổ chức Phân Phối."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const $$splitComponentImporter$w = () => import("./finance.advance-DiMk0rGu.mjs");
const Route$L = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Đề Nghị Tạm Ứng — Tài Chính Kế Toán"
    }, {
      name: "description",
      content: "Tạo và theo dõi đề nghị tạm ứng công việc, phê duyệt trực tuyến và quyết toán."
    }, {
      property: "og:title",
      content: "Đề Nghị Tạm Ứng — Tài Chính Kế Toán"
    }, {
      property: "og:description",
      content: "Tạo và theo dõi đề nghị tạm ứng công việc, phê duyệt trực tuyến và quyết toán."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./finance.payment-DfXQstMl.mjs");
const Route$K = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Đề Nghị Thanh Toán — Tài Chính Kế Toán"
    }, {
      name: "description",
      content: "Đề nghị thanh toán nhà cung cấp, hoàn chi phí nhân viên và quyết toán tạm ứng."
    }, {
      property: "og:title",
      content: "Đề Nghị Thanh Toán — Tài Chính Kế Toán"
    }, {
      property: "og:description",
      content: "Đề nghị thanh toán nhà cung cấp, hoàn chi phí nhân viên và quyết toán tạm ứng."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./finance.salary-oW-BLFT6.mjs");
const Route$J = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Tạm Ứng Lương — Tài Chính Kế Toán"
    }, {
      name: "description",
      content: "Đề nghị tạm ứng lương, phê duyệt và theo dõi khấu trừ theo kỳ lương."
    }, {
      property: "og:title",
      content: "Tạm Ứng Lương — Tài Chính Kế Toán"
    }, {
      property: "og:description",
      content: "Đề nghị tạm ứng lương, phê duyệt và theo dõi khấu trừ theo kỳ lương."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./local.index-A5zyrA3A.mjs");
const Route$I = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Local Map — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Local Map: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Local Map — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Local Map: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./local._id-Col8D8E3.mjs");
const Route$H = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Chi tiết địa điểm — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Chi tiết địa điểm: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Chi tiết địa điểm — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Chi tiết địa điểm: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./operations_.3k-B531dO7k.mjs");
const Route$G = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K Vận hành — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./operations_.3k-accounting-ZaGkJNQa.mjs");
const Route$F = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K Kế toán — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./operations_.3k-hr-CYALwHi5.mjs");
const Route$E = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K Hành chính & Nhân sự — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./order-quotes.index-DTZnJi8k.mjs");
const Route$D = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Hỏi Giá & Tiến Độ — Đơn hàng"
    }, {
      "name": "description",
      "content": "Sale gửi yêu cầu hỏi giá, hỏi tiến độ Đơn Sứ Quà Tặng cho Cung ứng và theo dõi phản hồi."
    }, {
      "property": "og:title",
      "content": "Hỏi Giá & Tiến Độ — Đơn hàng"
    }, {
      "property": "og:description",
      "content": "Sale gửi yêu cầu hỏi giá, hỏi tiến độ Đơn Sứ Quà Tặng cho Cung ứng và theo dõi phản hồi."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./order-quotes._id-DZQPcP_U.mjs");
const Route$C = createFileRoute()({
  validateSearch: (s) => ({
    flow: typeof s.flow === "string" ? s.flow : void 0
  }),
  head: () => ({
    meta: [{
      title: "Chi tiết yêu cầu — Hỏi Giá & Tiến Độ"
    }, {
      name: "description",
      content: "Theo dõi và xử lý yêu cầu hỏi giá, hỏi tiến độ theo từng sản phẩm."
    }, {
      property: "og:title",
      content: "Chi tiết yêu cầu — Hỏi Giá & Tiến Độ"
    }, {
      property: "og:description",
      content: "Phản hồi Cung ứng, trao đổi và lịch sử xử lý của yêu cầu."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./order-quotes.new-4d5ZWGB8.mjs");
const Route$B = createFileRoute()({
  validateSearch: (s) => ({
    id: typeof s.id === "string" ? s.id : void 0
  }),
  head: () => ({
    meta: [{
      title: "Tạo yêu cầu Hỏi Giá & Tiến Độ"
    }, {
      name: "description",
      content: "Tạo yêu cầu hỏi giá, kiểm tra khả năng đáp ứng và ngày giao dự kiến trước khi chốt đơn."
    }, {
      property: "og:title",
      content: "Tạo yêu cầu Hỏi Giá & Tiến Độ"
    }, {
      property: "og:description",
      content: "Form 4 bước: thông tin đơn, sản phẩm, nội dung hỏi, kiểm tra và gửi."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./order-quotes.report-BK-G38fx.mjs");
const Route$A = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Báo cáo Hỏi Giá & Tiến Độ — Đơn hàng"
    }, {
      name: "description",
      content: "Thống kê số lượng, tốc độ báo giá và hiệu suất Cung ứng, theo Sale cho Hỏi Giá & Tiến Độ."
    }, {
      property: "og:title",
      content: "Báo cáo Hỏi Giá & Tiến Độ"
    }, {
      property: "og:description",
      content: "Khối lượng công việc và tốc độ xử lý báo giá của từng nhân viên Cung ứng."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./order-tracking.index-xNMAcmv-.mjs");
const Route$z = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Theo Dõi Đơn Hàng — Base"
    }, {
      name: "description",
      content: "Theo dõi hành trình thực hiện đơn hàng giữa Kinh doanh và Cung ứng."
    }, {
      property: "og:title",
      content: "Theo Dõi Đơn Hàng — Base"
    }, {
      property: "og:description",
      content: "Theo dõi hành trình thực hiện đơn hàng giữa Kinh doanh và Cung ứng."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./order-tracking._id-D9du29s9.mjs");
const Route$y = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Hành trình đơn hàng — Base"
    }, {
      name: "description",
      content: "Chi tiết hành trình thực hiện đơn hàng và nhật ký cập nhật."
    }, {
      property: "og:title",
      content: "Hành trình đơn hàng — Base"
    }, {
      property: "og:description",
      content: "Chi tiết hành trình thực hiện đơn hàng và nhật ký cập nhật."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./procurement_.suppliers-D-9Ecyx-.mjs");
const Route$x = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Nhà cung cấp — Mua Hàng & Giao Vận — Base Sứ Việt"
    }, {
      name: "description",
      content: "Trung tâm nhà cung cấp chung toàn công ty: danh mục, sản phẩm, lịch sử hợp tác."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./sao.index-B5XIqThQ.mjs");
const Route$w = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Ví Sao của tôi — Sao Sứ Việt"
    }, {
      name: "description",
      content: "Số dư và lịch sử nhận, sử dụng Sao Sứ Việt của bạn."
    }, {
      property: "og:title",
      content: "Ví Sao của tôi — Sao Sứ Việt"
    }, {
      property: "og:description",
      content: "Số dư và lịch sử nhận, sử dụng Sao Sứ Việt của bạn."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./sao.admin-B_3-m0z2.mjs");
const Route$v = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Quản lý thưởng Sao — Base Sứ Việt"
    }, {
      name: "description",
      content: "Quản lý chương trình thưởng Sao, quà tặng và phát quà."
    }, {
      property: "og:title",
      content: "Quản lý thưởng Sao — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Quản lý chương trình thưởng Sao, quà tặng và phát quà."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./sao.earn-Na_uZ7Mo.mjs");
const Route$u = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Cách kiếm Sao — Sao Sứ Việt"
    }, {
      name: "description",
      content: "Các chương trình thưởng Sao Sứ Việt đang áp dụng và cách nhận Sao."
    }, {
      property: "og:title",
      content: "Cách kiếm Sao — Sao Sứ Việt"
    }, {
      property: "og:description",
      content: "Các chương trình thưởng Sao Sứ Việt đang áp dụng và cách nhận Sao."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./sao.leaderboard-BZRrizIy.mjs");
const Route$t = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Bảng thành tích — Sao Sứ Việt"
    }, {
      name: "description",
      content: "Bảng xếp hạng thành tích Sao Sứ Việt của nhân viên theo tuần, tháng, quý, năm."
    }, {
      property: "og:title",
      content: "Bảng thành tích — Sao Sứ Việt"
    }, {
      property: "og:description",
      content: "Bảng xếp hạng thành tích Sao Sứ Việt của nhân viên theo tuần, tháng, quý, năm."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./sao.shop-BUdogC7n.mjs");
const Route$s = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Gian hàng đổi quà — Sao Sứ Việt"
    }, {
      name: "description",
      content: "Quà tặng và yêu cầu đổi quà bằng Sao Sứ Việt."
    }, {
      property: "og:title",
      content: "Gian hàng đổi quà — Sao Sứ Việt"
    }, {
      property: "og:description",
      content: "Quà tặng và yêu cầu đổi quà bằng Sao Sứ Việt."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./settings_.kpi-v2-BivojGnt.mjs");
const Route$r = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Giao KPI — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Giao KPI: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Giao KPI — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Giao KPI: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./showroom_.3k-uRXy4u2x.mjs");
const Route$q = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K Showroom — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./showroom_.shifts-BrQ08mJf.mjs");
const Route$p = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Lịch trực Showroom — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./showroom_.suppliers-BTU5dmpx.mjs");
const Route$o = createFileRoute()({
  beforeLoad: () => {
    throw redirect({
      to: "/procurement/suppliers"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./signals.index-DB9x8hDQ.mjs");
const Route$n = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Tín hiệu cơ hội — Base Sứ Việt"
    }, {
      name: "description",
      content: "Nhập, phân công và theo dõi tín hiệu khách hàng có khả năng phát sinh đơn hàng."
    }, {
      property: "og:title",
      content: "Tín hiệu cơ hội — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Nhập, phân công và theo dõi tín hiệu khách hàng có khả năng phát sinh đơn hàng."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./signals.report-D64YGMjv.mjs");
const Route$m = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Báo cáo tín hiệu và chăm sóc Sale — Base Sứ Việt"
    }, {
      name: "description",
      content: "Theo dõi hiệu quả nguồn, tỷ lệ chốt và cập nhật diễn biến khách hàng của Sale trong phạm vi được phép."
    }, {
      property: "og:title",
      content: "Báo cáo tín hiệu và chăm sóc Sale — Base Sứ Việt"
    }, {
      property: "og:description",
      content: "Theo dõi hiệu quả nguồn, tỷ lệ chốt và cập nhật diễn biến khách hàng của Sale trong phạm vi được phép."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./social.index-BVl-9sZL.mjs");
const Route$l = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Kênh Social — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Kênh Social: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Kênh Social — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Kênh Social: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./social._id-3xq4OtAN.mjs");
const Route$k = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Workspace kênh social — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Workspace kênh social: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Workspace kênh social — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Workspace kênh social: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./websites.index-CShY3LKp.mjs");
const Route$j = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Dự Án Web — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Dự Án Web: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Dự Án Web — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Dự Án Web: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./websites._id-DnQlzyev.mjs");
const Route$i = createFileRoute()({
  head: () => ({
    meta: [{
      "title": "Chi tiết website — Base Sứ Việt"
    }, {
      "name": "description",
      "content": "Chi tiết website: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:title",
      "content": "Chi tiết website — Base Sứ Việt"
    }, {
      "property": "og:description",
      "content": "Chi tiết website: quản lý và theo dõi dữ liệu công việc tại Base Sứ Việt."
    }, {
      "property": "og:type",
      "content": "website"
    }, {
      "name": "twitter:card",
      "content": "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
function ContentCalendar({
  contents,
  onOpen
}) {
  const [month, setMonth] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const first = new Date(month);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7;
  const days = last.getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  const itemsOn = (date) => {
    const ds = date.toISOString().slice(0, 10);
    return contents.filter((c) => c.publishedAt && c.publishedAt === ds || !c.publishedAt && c.publishDate === ds);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)), children: "‹" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: month.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric"
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)), children: "›" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-7 gap-1 text-xs", children: [
      ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground font-medium py-1", children: d }, d)),
      cells.map((date, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[90px] rounded border bg-card p-1.5", children: date && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mb-1", children: date.getDate() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: itemsOn(date).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onOpen(c), className: "w-full text-left text-[11px] truncate rounded bg-primary/10 text-primary px-1.5 py-1 hover:bg-primary/20", title: c.title, children: c.title }, c.id)) })
      ] }) }, i))
    ] })
  ] }) });
}
const $$splitComponentImporter$2 = () => import("./finance.incoming.index-BNpu6Yw3.mjs");
const str$1 = (v) => typeof v === "string" ? v : "";
const Route$h = createFileRoute()({
  validateSearch: (s) => {
    const o = {};
    for (const k of ["acc", "st", "q", "from", "to", "sale", "history", "rem"]) if (str$1(s[k])) o[k] = str$1(s[k]);
    return o;
  },
  head: () => ({
    meta: [{
      title: "Tiền Về — Tài Chính Kế Toán"
    }, {
      name: "description",
      content: "Giao dịch tiền vào đồng bộ tự động từ ngân hàng và các khoản nhập thủ công."
    }, {
      property: "og:title",
      content: "Tiền Về — Tài Chính Kế Toán"
    }, {
      property: "og:description",
      content: "Giao dịch tiền vào đồng bộ tự động từ ngân hàng và các khoản nhập thủ công."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./finance.incoming._id-yImuO0bl.mjs");
const Route$g = createFileRoute()({
  head: () => ({
    meta: [{
      title: "Chi tiết giao dịch — Tiền Về"
    }, {
      name: "description",
      content: "Xác nhận giao dịch tiền vào và tra cứu lịch sử."
    }, {
      property: "og:title",
      content: "Chi tiết giao dịch — Tiền Về"
    }, {
      property: "og:description",
      content: "Xác nhận giao dịch tiền vào và tra cứu lịch sử."
    }, {
      property: "og:type",
      content: "website"
    }, {
      name: "twitter:card",
      content: "summary"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./k3_.unit._unit-pWSwQGni.mjs");
const Route$f = createFileRoute()({
  head: () => ({
    meta: [{
      title: "3K theo đơn vị — Base Sứ Việt"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const json = (body2, status = 200) => new Response(JSON.stringify(body2), { status, headers: { "content-type": "application/json" } });
const MAX_SKEW_MS = 10 * 60 * 1e3;
function logDbError(stage, error) {
  const identifier = error.message?.match(/(?:schema|table|function|constraint|trigger) "?([a-z_][a-z0-9_]*)/i)?.[1];
  console.error("[casso] db error", {
    stage,
    sqlstate: /^[A-Z0-9]{5}$/.test(error.code ?? "") ? error.code : "unknown",
    ...identifier ? { database_object: identifier } : {}
  });
}
function sortObj(data) {
  const out = {};
  Object.keys(data).sort().forEach((k) => {
    out[k] = data[k] !== null && typeof data[k] === "object" ? sortObj(data[k]) : data[k];
  });
  return out;
}
async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEq(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const digits = (s) => String(s ?? "").replace(/\D/g, "");
const str = (v, max) => {
  const s = v == null ? "" : String(v).trim();
  return s ? s.slice(0, max) : null;
};
function toIso(v) {
  const s = String(v ?? "").trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
  const d = new Date(m ? `${m[1]}T${m[2]}+07:00` : s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
const Route$e = createFileRoute()({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CASSO_WEBHOOK_SECRET"];
        if (!secret) return json({ success: false, error: "not_configured" }, 503);
        const raw = await request.text();
        if (raw.length > 1e5) return json({ success: false }, 413);
        let body2;
        try {
          body2 = JSON.parse(raw);
        } catch {
          return json({ success: false }, 400);
        }
        const header = request.headers.get("x-casso-signature") ?? "";
        const [, tStr, v1] = header.match(/t=(\d+),v1=([a-f0-9]+)/) || [];
        if (!tStr || !v1) return json({ success: false, error: "invalid_signature" }, 401);
        const t = parseInt(tStr, 10);
        const expected = await hmacHex(secret, t + "." + JSON.stringify(sortObj(body2)));
        if (!safeEq(expected, v1)) {
          console.warn("[casso] rejected: invalid signature");
          return json({ success: false, error: "invalid_signature" }, 401);
        }
        if (Math.abs(Date.now() - t) > MAX_SKEW_MS) {
          console.warn("[casso] rejected: stale timestamp");
          return json({ success: false, error: "stale" }, 401);
        }
        if (body2?.error !== 0 || !body2?.data) return json({ success: true, ignored: "no_data" });
        const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
        const { data: accs, error: accErr } = await supabaseAdmin.from("bank_accounts").select("id, bank_name, account_number").eq("active", true);
        if (accErr) {
          logDbError("accounts", accErr);
          return json({ success: false, error: "db_error" }, 500);
        }
        const byNo = new Map((accs ?? []).map((a) => [a.account_number, a]));
        const list = Array.isArray(body2.data) ? body2.data : [body2.data];
        const rows = list.filter((d) => d && d.id != null && Number(d.amount) > 0 && byNo.has(digits(d.accountNumber))).flatMap((d) => {
          const acc = byNo.get(digits(d.accountNumber));
          if (!acc) return [];
          return [{
            provider: "casso",
            provider_transaction_id: String(d.id),
            bank_account_id: acc.id,
            bank_name: acc.bank_name,
            bank_account_identifier: acc.account_number,
            transaction_date: d.transactionDateTime != null ? String(d.transactionDateTime) : null,
            transaction_at: toIso(d.transactionDateTime),
            amount: Math.round(Number(d.amount)),
            description: d.description != null ? String(d.description).slice(0, 1e3) : null,
            reference_number: d.reference != null ? String(d.reference).slice(0, 200) : null,
            // Casso V2: chỉ lưu khi Casso thực sự gửi; không suy diễn từ nội dung CK.
            counter_account_name: str(d.counterAccountName, 200),
            counter_account_number: str(d.counterAccountNumber, 40),
            counter_bank_name: str(d.counterAccountBankName ?? d.counterAccountBankId, 120)
          }];
        });
        if (!rows.length) return json({ success: true, ignored: "filtered" });
        const { data: inserted, error } = await supabaseAdmin.from("bank_transactions").upsert(rows, { onConflict: "provider,provider_transaction_id", ignoreDuplicates: true }).select("id");
        if (error) {
          logDbError("upsert", error);
          return json({ success: false, error: "db_error" }, 500);
        }
        try {
          const { queueAndSend } = await import("./gmf.server-CUA1cOPW.mjs");
          await queueAndSend((inserted ?? []).map((r) => r.id));
        } catch {
          console.warn("[casso] gmf notify failed");
        }
        return json({ success: true });
      }
    }
  }
});
const Route$d = createFileRoute()({
  server: { handlers: { POST: async ({ request }) => {
    const zserver = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
    const cfg = await zserver.getConfig();
    const expected = cfg?.care_cron_token ?? "";
    const got = request.headers.get("x-care-token") ?? "";
    if (!expected || got.length !== expected.length || !timingSafeEqual(Buffer.from(got), Buffer.from(expected))) return new Response("Unauthorized", { status: 401 });
    try {
      objectType({}).strict().parse(await request.json());
    } catch {
      return new Response("Invalid payload", { status: 400 });
    }
    try {
      return Response.json(await (await import("./fb.server-1Ea3ethR.mjs")).dispatchPending());
    } catch {
      return Response.json({ ok: false }, { status: 500 });
    }
  } } }
});
const Route$c = createFileRoute()({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const s = await import("./fb.server-1Ea3ethR.mjs");
        const expected = s.verifyToken();
        if (u.searchParams.get("hub.mode") === "subscribe" && expected && u.searchParams.get("hub.verify_token") === expected) {
          const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
          await supabaseAdmin.from("fbl_state").update({ webhook_verified_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", 1);
          return new Response(u.searchParams.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > 1e6) return new Response("Too large", { status: 413 });
        const s = await import("./fb.server-1Ea3ethR.mjs");
        if (!await s.verifySignature(raw, request.headers.get("x-hub-signature-256"))) return new Response("Invalid signature", { status: 401 });
        let body2;
        try {
          body2 = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        let changes;
        try {
          changes = s.parseWebhook(body2);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }
        try {
          await s.recordEvents(changes, "webhook");
        } catch (e) {
          console.error("[fbl] store failed", e?.message);
          return new Response("Store failed", { status: 500 });
        }
        try {
          await (await import("./inbox.server-WMnjwISy.mjs")).ingestMessenger(body2);
        } catch {
          return new Response("Messenger store failed", { status: 500 });
        }
        return new Response("EVENT_RECEIVED", { status: 200 });
      }
    }
  }
});
const Route$b = createFileRoute()({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const z2 = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
        const cfg = await z2.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        if (!exp || got.length !== exp.length || !timingSafeEqual(Buffer.from(got), Buffer.from(exp))) return new Response("Unauthorized", { status: 401 });
        try {
          return Response.json(await (await import("./fb.server-1Ea3ethR.mjs")).maintain());
        } catch {
          return Response.json({ ok: false }, { status: 500 });
        }
      }
    }
  }
});
const Route$a = createFileRoute()({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const code = u.searchParams.get("code") ?? "";
        const state = u.searchParams.get("state") ?? "";
        const s = await import("./fb.server-1Ea3ethR.mjs");
        const base = await s.baseUrl();
        const back = (q) => new Response(null, { status: 302, headers: { Location: `${base}/settings?tab=fbleads&${q}` } });
        if (!state || state.length > 100) return back("fbl_error=state");
        if (!code || code.length > 2e3) return back(`fbl_error=${encodeURIComponent(u.searchParams.get("error_description") || "Người dùng hủy đăng nhập")}`);
        try {
          await s.exchangeCode(code, state);
          return back(`fbl_state=${encodeURIComponent(state)}`);
        } catch (e) {
          console.error("[fbl] oauth failed", e?.message);
          return back(`fbl_error=${encodeURIComponent(String(e?.message ?? "Kết nối thất bại").slice(0, 300))}`);
        }
      }
    }
  }
});
const Route$9 = createFileRoute()({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const s = await import("./push.server-CALy0v70.mjs");
        const exp = await s.pushToken();
        const got = request.headers.get("x-push-token") ?? "";
        if (!exp || got.length !== exp.length || !timingSafeEqual(Buffer.from(got), Buffer.from(exp))) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          return Response.json(await s.processPush(30));
        } catch {
          return Response.json({ ok: false }, { status: 500 });
        }
      }
    }
  }
});
const Route$8 = createFileRoute()({ server: { handlers: { POST: async ({ request }) => {
  try {
    return await (await import("./chat.server-CM61Y-Ea.mjs")).guest(request);
  } catch {
    return Response.json({ error: "Chưa xử lý được tin nhắn. Vui lòng thử lại." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
} } } });
const Route$7 = createFileRoute()({
  server: { handlers: { POST: async ({ request }) => {
    const raw = await request.text();
    if (raw.length > 64 * 1024) return Response.json({ ok: false, code: "too_large" }, { status: 413 });
    const s = await import("./wf.server-CfVqw8_K.mjs");
    const auth = await s.authenticate(request, raw);
    if (!auth.ok) return Response.json({ ok: false, code: auth.code, message: auth.message }, { status: auth.status });
    const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
    const { count } = await supabaseAdmin.from("wf_forms").select("form_id", { count: "exact", head: true }).eq("website_id", auth.auth.website.id).eq("enabled", true);
    return Response.json({ ok: true, code: "connected", website: { id: auth.auth.website.id, name: auth.auth.website.name, domain: auth.auth.website.domain }, forms_enabled: count ?? 0, server_time: (/* @__PURE__ */ new Date()).toISOString() });
  } } }
});
const Route$6 = createFileRoute()({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const z2 = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
        const cfg = await z2.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        const s = await import("./wf.server-CfVqw8_K.mjs");
        if (!exp || !s.timingSafeEq(got, exp)) return new Response("Unauthorized", { status: 401 });
        let finRemind = null;
        try {
          const f = await import("./gmf.server-CUA1cOPW.mjs");
          finRemind = await f.runAutoReminders();
        } catch (e) {
          console.error("[fin] remind failed", e?.message);
        }
        let bizDeadline = null;
        try {
          const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
          const { data, error } = await supabaseAdmin.rpc("biz_deadline_auto_notify");
          bizDeadline = error ? { error: error.message } : data;
        } catch (e) {
          console.error("[biz] deadline notify failed", e?.message);
        }
        let k3Report = null;
        let crmRemind = null;
        try {
          const { supabaseAdmin } = await import("./client.server-D5ro3rAQ.mjs");
          const { data, error } = await supabaseAdmin.rpc("crm_remind");
          crmRemind = error ? { error: "Chưa tạo được nhắc lịch CRM." } : data;
        } catch {
          crmRemind = { error: "Chưa tạo được nhắc lịch CRM." };
        }
        try {
          const k = await import("./k3Automation.server-DOpWrxj_.mjs");
          k3Report = await k.processK3Reports();
        } catch {
          k3Report = { error: "Báo cáo 3K chưa gửi được; chốt sổ vẫn được giữ." };
        }
        try {
          return Response.json({ ok: true, finRemind, bizDeadline, k3Report, crmRemind, ...await s.recoverEvents(20) });
        } catch (e) {
          console.error("[wf] recover failed", e?.message);
          return Response.json({ ok: false }, { status: 500 });
        }
      }
    }
  }
});
const Route$5 = createFileRoute()({
  server: { handlers: { POST: async ({ request }) => {
    const s = await import("./wf.server-CfVqw8_K.mjs");
    const raw = await request.text();
    if (raw.length > s.MAX_BODY_BYTES) return Response.json({ ok: false, code: "too_large" }, { status: 413 });
    const auth = await s.authenticate(request, raw);
    if (!auth.ok) return Response.json({ ok: false, code: auth.code, message: auth.message }, { status: auth.status });
    let body2;
    try {
      body2 = JSON.parse(raw);
    } catch {
      return Response.json({ ok: false, code: "bad_json" }, { status: 400 });
    }
    const parsed = s.registerSchema.safeParse(body2);
    if (!parsed.success) return Response.json({ ok: false, code: "invalid_payload", message: "Cấu trúc Form không hợp lệ" }, { status: 400 });
    try {
      const r = await s.registerForms(auth.auth.website.id, parsed.data);
      return Response.json({ ok: true, code: "registered", ...r });
    } catch (e) {
      console.error("[wf] register failed", e?.message);
      return Response.json({ ok: false, code: "retry_later", message: "Lỗi tạm thời, thử lại sau" }, { status: 500 });
    }
  } } }
});
const Route$4 = createFileRoute()({
  server: { handlers: { POST: async ({ request }) => {
    const s = await import("./wf.server-CfVqw8_K.mjs");
    const raw = await request.text();
    if (raw.length > s.MAX_BODY_BYTES) return Response.json({ ok: false, code: "too_large" }, { status: 413 });
    const auth = await s.authenticate(request, raw);
    if (!auth.ok) return Response.json({ ok: false, code: auth.code, message: auth.message }, { status: auth.status });
    let body2;
    try {
      body2 = JSON.parse(raw);
    } catch {
      return Response.json({ ok: false, code: "bad_json" }, { status: 400 });
    }
    const parsed = s.submitSchema.safeParse(body2);
    if (!parsed.success) return Response.json({ ok: false, code: "invalid_payload", message: "Dữ liệu submission không hợp lệ" }, { status: 400 });
    try {
      const r = await s.intakeSubmission(auth.auth.website.id, parsed.data);
      const http = r.code === "accepted" ? 200 : r.code === "duplicate" ? 200 : r.code === "form_disabled" ? 202 : r.code === "mapping_invalid" ? 422 : 503;
      return Response.json({ ok: r.code === "accepted" || r.code === "duplicate", code: r.code, event_id: r.eventId, signal_id: r.signalId }, { status: http });
    } catch (e) {
      console.error("[wf] submit failed", e?.message);
      return Response.json({ ok: false, code: "retry_later", message: "Lỗi tạm thời, plugin nên gửi lại" }, { status: 503 });
    }
  } } }
});
const Route$3 = createFileRoute()({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
        const cfg = await s.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        if (!exp || got.length !== exp.length || !timingSafeEqual(Buffer.from(got), Buffer.from(exp))) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          return Response.json({ health: await s.maintainOa(), queue: await s.processPending(30), care: await s.runCareDigest(), leave: await s.runLeaveRemind(), remind: await s.runContentRemind() });
        } catch {
          return Response.json({ ok: false }, { status: 500 });
        }
      }
    }
  }
});
const Route$2 = createFileRoute()({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
        const cfg = await s.getConfig();
        const got = request.headers.get("x-care-token") ?? "";
        const exp = cfg?.care_cron_token ?? "";
        if (!exp || got.length !== exp.length || !timingSafeEqual(Buffer.from(got), Buffer.from(exp))) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const r = await s.processPending(30);
          const g = await import("./zaloGroup.server-Cb0O4Rfl.mjs");
          const lg = await g.processLeaveGroup(10).catch(() => ({ processed: 0 }));
          const f = await import("./zaloGroup.server-CLmZu-NH.mjs");
          const fg = await f.processFrGroup(10).catch(() => ({ processed: 0 }));
          const design = await import("./zaloGroup.server-D0P-IcLK.mjs");
          const dg = await design.processDesignGroup(10).catch(() => ({ processed: 0 }));
          return Response.json({ ...r, leaveGroup: lg, frGroup: fg, designGroup: dg });
        } catch {
          return Response.json({ ok: false }, { status: 500 });
        }
      }
    }
  }
});
const Route$1 = createFileRoute()({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code") ?? "";
        const state = url.searchParams.get("state") ?? "";
        const s0 = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
        const base = await s0.baseUrl().catch(() => s0.DEFAULT_BASE_URL);
        const back = (r) => new Response(null, { status: 302, headers: { Location: `${base}/settings?zalo=${r}` } });
        if (!code || !state || code.length > 2e3 || state.length > 200) return back("error");
        try {
          const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
          await s.exchangeCode(code, state);
          return back("connected");
        } catch (e) {
          console.error("zalo oauth failed:", e?.message);
          return back("error");
        }
      }
    }
  }
});
const ok = () => new Response("ok", { status: 200 });
const Route = createFileRoute()({
  server: {
    handlers: {
      GET: async () => ok(),
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > 2e4) return ok();
        let body2;
        try {
          body2 = JSON.parse(raw);
        } catch {
          return ok();
        }
        const s = await import("./zalo.server-DBQRHLrG.mjs").then((n) => n.z);
        const sig = request.headers.get("x-zevent-signature");
        if (!sig) return ok();
        const valid = await s.verifyWebhook(raw, sig, String(body2?.timestamp ?? ""), String(body2?.app_id ?? ""));
        if (!valid) {
          console.warn("[zalo-webhook] rejected: invalid signature", body2?.event_name ?? "");
          return ok();
        }
        if (body2?.event_name === "user_send_text" && typeof body2?.sender?.id === "string") {
          const result = await s.handleLinkMessage(body2.sender.id, String(body2?.message?.text ?? "").slice(0, 200));
          console.log("[zalo-webhook] link result:", result ?? "no-code");
          if (result === "linked") {
            await s.sendCs(body2.sender.id, "Đã liên kết Zalo với tài khoản Base. Bạn sẽ nhận thông báo tín hiệu tại đây.", `${await s.baseUrl()}/settings`).catch(() => {
            });
          } else if (result === "invalid") {
            await s.sendCs(body2.sender.id, "Mã liên kết không đúng hoặc đã hết hạn. Vui lòng tạo mã mới trong Base.", `${await s.baseUrl()}/settings`).catch(() => {
            });
          }
        }
        return ok();
      }
    }
  }
});
const IndexRoute = Route$1r.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1s
});
const AiKnowledgeRoute = Route$1q.update({
  id: "/ai-knowledge",
  path: "/ai-knowledge",
  getParentRoute: () => Route$1s
});
const ApprovalsRoute = Route$1p.update({
  id: "/approvals",
  path: "/approvals",
  getParentRoute: () => Route$1s
});
const AttendanceRoute = Route$1o.update({
  id: "/attendance",
  path: "/attendance",
  getParentRoute: () => Route$1s
});
const ChinhSachBaoMatRoute = Route$1n.update({
  id: "/chinh-sach-bao-mat",
  path: "/chinh-sach-bao-mat",
  getParentRoute: () => Route$1s
});
const CommunityRoute = Route$1m.update({
  id: "/community",
  path: "/community",
  getParentRoute: () => Route$1s
});
const GoalsV2Route = Route$1l.update({
  id: "/goals-v2",
  path: "/goals-v2",
  getParentRoute: () => Route$1s
});
const InboxRoute = Route$1k.update({
  id: "/inbox",
  path: "/inbox",
  getParentRoute: () => Route$1s
});
const K3CenterRoute = Route$1j.update({
  id: "/k3-center",
  path: "/k3-center",
  getParentRoute: () => Route$1s
});
const LeaveRoute = Route$1i.update({
  id: "/leave",
  path: "/leave",
  getParentRoute: () => Route$1s
});
const LoginRoute = Route$1h.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$1s
});
const OkrsRoute = Route$1g.update({
  id: "/okrs",
  path: "/okrs",
  getParentRoute: () => Route$1s
});
const OrdersRoute = Route$1f.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => Route$1s
});
const OrganizationRoute = Route$1e.update({
  id: "/organization",
  path: "/organization",
  getParentRoute: () => Route$1s
});
const OverviewV2Route = Route$1d.update({
  id: "/overview-v2",
  path: "/overview-v2",
  getParentRoute: () => Route$1s
});
const PendingRoute = Route$1c.update({
  id: "/pending",
  path: "/pending",
  getParentRoute: () => Route$1s
});
const ProfileRoute = Route$1b.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$1s
});
const RegisterRoute = Route$1a.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$1s
});
const ReportsV2Route = Route$19.update({
  id: "/reports-v2",
  path: "/reports-v2",
  getParentRoute: () => Route$1s
});
const ResetPasswordRoute = Route$18.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$1s
});
const SettingsRoute = Route$17.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$1s
});
const ShowroomRoute = Route$16.update({
  id: "/showroom",
  path: "/showroom",
  getParentRoute: () => Route$1s
});
const TasksRoute = Route$15.update({
  id: "/tasks",
  path: "/tasks",
  getParentRoute: () => Route$1s
});
const VideosRoute = Route$14.update({
  id: "/videos",
  path: "/videos",
  getParentRoute: () => Route$1s
});
const WebChatRoute = Route$13.update({
  id: "/web-chat",
  path: "/web-chat",
  getParentRoute: () => Route$1s
});
const WebContentsRoute = Route$12.update({
  id: "/web-contents",
  path: "/web-contents",
  getParentRoute: () => Route$1s
});
const BizIndexRoute = Route$11.update({
  id: "/biz/",
  path: "/biz/",
  getParentRoute: () => Route$1s
});
const Biz3kRoute = Route$10.update({
  id: "/biz/3k",
  path: "/biz/3k",
  getParentRoute: () => Route$1s
});
const Biz3kAreaRoute = Route$$.update({
  id: "/biz/3k-area",
  path: "/biz/3k-area",
  getParentRoute: () => Route$1s
});
const BizApprovalsRoute = Route$_.update({
  id: "/biz/approvals",
  path: "/biz/approvals",
  getParentRoute: () => Route$1s
});
const BizCrmRoute = Route$Z.update({
  id: "/biz/crm",
  path: "/biz/crm",
  getParentRoute: () => Route$1s
});
const BizGoalsRoute = Route$Y.update({
  id: "/biz/goals",
  path: "/biz/goals",
  getParentRoute: () => Route$1s
});
const BizPlansRoute = Route$X.update({
  id: "/biz/plans",
  path: "/biz/plans",
  getParentRoute: () => Route$1s
});
const BizProductsRoute = Route$W.update({
  id: "/biz/products",
  path: "/biz/products",
  getParentRoute: () => Route$1s
});
const BizReportsRoute = Route$V.update({
  id: "/biz/reports",
  path: "/biz/reports",
  getParentRoute: () => Route$1s
});
const BizSaleWorkRoute = Route$U.update({
  id: "/biz/sale-work",
  path: "/biz/sale-work",
  getParentRoute: () => Route$1s
});
const BizSettingsRoute = Route$T.update({
  id: "/biz/settings",
  path: "/biz/settings",
  getParentRoute: () => Route$1s
});
const BrandsIndexRoute = Route$S.update({
  id: "/brands/",
  path: "/brands/",
  getParentRoute: () => Route$1s
});
const BrandsIdRoute = Route$R.update({
  id: "/brands/$id",
  path: "/brands/$id",
  getParentRoute: () => Route$1s
});
const DesignMarketingRoute = Route$Q.update({
  id: "/design/marketing",
  path: "/design/marketing",
  getParentRoute: () => Route$1s
});
const DesignMockupsRoute = Route$P.update({
  id: "/design/mockups",
  path: "/design/mockups",
  getParentRoute: () => Route$1s
});
const DesignPhotoRoute = Route$O.update({
  id: "/design/photo",
  path: "/design/photo",
  getParentRoute: () => Route$1s
});
const DesignReportsRoute = Route$N.update({
  id: "/design/reports",
  path: "/design/reports",
  getParentRoute: () => Route$1s
});
const Distribution3kRoute = Route$M.update({
  id: "/distribution/3k",
  path: "/distribution/3k",
  getParentRoute: () => Route$1s
});
const FinanceAdvanceRoute = Route$L.update({
  id: "/finance/advance",
  path: "/finance/advance",
  getParentRoute: () => Route$1s
});
const FinancePaymentRoute = Route$K.update({
  id: "/finance/payment",
  path: "/finance/payment",
  getParentRoute: () => Route$1s
});
const FinanceSalaryRoute = Route$J.update({
  id: "/finance/salary",
  path: "/finance/salary",
  getParentRoute: () => Route$1s
});
const LocalIndexRoute = Route$I.update({
  id: "/local/",
  path: "/local/",
  getParentRoute: () => Route$1s
});
const LocalIdRoute = Route$H.update({
  id: "/local/$id",
  path: "/local/$id",
  getParentRoute: () => Route$1s
});
const Operations3kRoute = Route$G.update({
  id: "/operations_/3k",
  path: "/operations/3k",
  getParentRoute: () => Route$1s
});
const Operations3kAccountingRoute = Route$F.update({
  id: "/operations_/3k-accounting",
  path: "/operations/3k-accounting",
  getParentRoute: () => Route$1s
});
const Operations3kHrRoute = Route$E.update({
  id: "/operations_/3k-hr",
  path: "/operations/3k-hr",
  getParentRoute: () => Route$1s
});
const OrderQuotesIndexRoute = Route$D.update({
  id: "/order-quotes/",
  path: "/order-quotes/",
  getParentRoute: () => Route$1s
});
const OrderQuotesIdRoute = Route$C.update({
  id: "/order-quotes/$id",
  path: "/order-quotes/$id",
  getParentRoute: () => Route$1s
});
const OrderQuotesNewRoute = Route$B.update({
  id: "/order-quotes/new",
  path: "/order-quotes/new",
  getParentRoute: () => Route$1s
});
const OrderQuotesReportRoute = Route$A.update({
  id: "/order-quotes/report",
  path: "/order-quotes/report",
  getParentRoute: () => Route$1s
});
const OrderTrackingIndexRoute = Route$z.update({
  id: "/order-tracking/",
  path: "/order-tracking/",
  getParentRoute: () => Route$1s
});
const OrderTrackingIdRoute = Route$y.update({
  id: "/order-tracking/$id",
  path: "/order-tracking/$id",
  getParentRoute: () => Route$1s
});
const ProcurementSuppliersRoute = Route$x.update({
  id: "/procurement_/suppliers",
  path: "/procurement/suppliers",
  getParentRoute: () => Route$1s
});
const SaoIndexRoute = Route$w.update({
  id: "/sao/",
  path: "/sao/",
  getParentRoute: () => Route$1s
});
const SaoAdminRoute = Route$v.update({
  id: "/sao/admin",
  path: "/sao/admin",
  getParentRoute: () => Route$1s
});
const SaoEarnRoute = Route$u.update({
  id: "/sao/earn",
  path: "/sao/earn",
  getParentRoute: () => Route$1s
});
const SaoLeaderboardRoute = Route$t.update({
  id: "/sao/leaderboard",
  path: "/sao/leaderboard",
  getParentRoute: () => Route$1s
});
const SaoShopRoute = Route$s.update({
  id: "/sao/shop",
  path: "/sao/shop",
  getParentRoute: () => Route$1s
});
const SettingsKpiV2Route = Route$r.update({
  id: "/settings_/kpi-v2",
  path: "/settings/kpi-v2",
  getParentRoute: () => Route$1s
});
const Showroom3kRoute = Route$q.update({
  id: "/showroom_/3k",
  path: "/showroom/3k",
  getParentRoute: () => Route$1s
});
const ShowroomShiftsRoute = Route$p.update({
  id: "/showroom_/shifts",
  path: "/showroom/shifts",
  getParentRoute: () => Route$1s
});
const ShowroomSuppliersRoute = Route$o.update({
  id: "/showroom_/suppliers",
  path: "/showroom/suppliers",
  getParentRoute: () => Route$1s
});
const SignalsIndexRoute = Route$n.update({
  id: "/signals/",
  path: "/signals/",
  getParentRoute: () => Route$1s
});
const SignalsReportRoute = Route$m.update({
  id: "/signals/report",
  path: "/signals/report",
  getParentRoute: () => Route$1s
});
const SocialIndexRoute = Route$l.update({
  id: "/social/",
  path: "/social/",
  getParentRoute: () => Route$1s
});
const SocialIdRoute = Route$k.update({
  id: "/social/$id",
  path: "/social/$id",
  getParentRoute: () => Route$1s
});
const WebsitesIndexRoute = Route$j.update({
  id: "/websites/",
  path: "/websites/",
  getParentRoute: () => Route$1s
});
const WebsitesIdRoute = Route$i.update({
  id: "/websites/$id",
  path: "/websites/$id",
  getParentRoute: () => Route$1s
});
const FinanceIncomingIndexRoute = Route$h.update({
  id: "/finance/incoming/",
  path: "/finance/incoming/",
  getParentRoute: () => Route$1s
});
const FinanceIncomingIdRoute = Route$g.update({
  id: "/finance/incoming/$id",
  path: "/finance/incoming/$id",
  getParentRoute: () => Route$1s
});
const K3UnitUnitRoute = Route$f.update({
  id: "/k3_/unit/$unit",
  path: "/k3/unit/$unit",
  getParentRoute: () => Route$1s
});
const ApiPublicCassoWebhookRoute = Route$e.update({
  id: "/api/public/casso/webhook",
  path: "/api/public/casso/webhook",
  getParentRoute: () => Route$1s
});
const ApiPublicMetaDispatchRoute = Route$d.update({
  id: "/api/public/meta/dispatch",
  path: "/api/public/meta/dispatch",
  getParentRoute: () => Route$1s
});
const ApiPublicMetaLeadsWebhookRoute = Route$c.update({
  id: "/api/public/meta/leads-webhook",
  path: "/api/public/meta/leads-webhook",
  getParentRoute: () => Route$1s
});
const ApiPublicMetaMaintainCronRoute = Route$b.update({
  id: "/api/public/meta/maintain-cron",
  path: "/api/public/meta/maintain-cron",
  getParentRoute: () => Route$1s
});
const ApiPublicMetaOauthCallbackRoute = Route$a.update({
  id: "/api/public/meta/oauth-callback",
  path: "/api/public/meta/oauth-callback",
  getParentRoute: () => Route$1s
});
const ApiPublicPushDispatchRoute = Route$9.update({
  id: "/api/public/push/dispatch",
  path: "/api/public/push/dispatch",
  getParentRoute: () => Route$1s
});
const ApiPublicWebChatGuestRoute = Route$8.update({
  id: "/api/public/web-chat/guest",
  path: "/api/public/web-chat/guest",
  getParentRoute: () => Route$1s
});
const ApiPublicWfPingRoute = Route$7.update({
  id: "/api/public/wf/ping",
  path: "/api/public/wf/ping",
  getParentRoute: () => Route$1s
});
const ApiPublicWfRecoverCronRoute = Route$6.update({
  id: "/api/public/wf/recover-cron",
  path: "/api/public/wf/recover-cron",
  getParentRoute: () => Route$1s
});
const ApiPublicWfRegisterFormsRoute = Route$5.update({
  id: "/api/public/wf/register-forms",
  path: "/api/public/wf/register-forms",
  getParentRoute: () => Route$1s
});
const ApiPublicWfSubmitRoute = Route$4.update({
  id: "/api/public/wf/submit",
  path: "/api/public/wf/submit",
  getParentRoute: () => Route$1s
});
const ApiPublicZaloCareCronRoute = Route$3.update({
  id: "/api/public/zalo/care-cron",
  path: "/api/public/zalo/care-cron",
  getParentRoute: () => Route$1s
});
const ApiPublicZaloDispatchCronRoute = Route$2.update({
  id: "/api/public/zalo/dispatch-cron",
  path: "/api/public/zalo/dispatch-cron",
  getParentRoute: () => Route$1s
});
const ApiPublicZaloOauthCallbackRoute = Route$1.update({
  id: "/api/public/zalo/oauth-callback",
  path: "/api/public/zalo/oauth-callback",
  getParentRoute: () => Route$1s
});
const ApiPublicZaloWebhookRoute = Route.update({
  id: "/api/public/zalo/webhook",
  path: "/api/public/zalo/webhook",
  getParentRoute: () => Route$1s
});
const rootRouteChildren = {
  IndexRoute,
  AiKnowledgeRoute,
  ApprovalsRoute,
  AttendanceRoute,
  ChinhSachBaoMatRoute,
  CommunityRoute,
  GoalsV2Route,
  InboxRoute,
  K3CenterRoute,
  LeaveRoute,
  LoginRoute,
  OkrsRoute,
  OrdersRoute,
  OrganizationRoute,
  OverviewV2Route,
  PendingRoute,
  ProfileRoute,
  RegisterRoute,
  ReportsV2Route,
  ResetPasswordRoute,
  SettingsRoute,
  ShowroomRoute,
  TasksRoute,
  VideosRoute,
  WebChatRoute,
  WebContentsRoute,
  Biz3kRoute,
  Biz3kAreaRoute,
  BizApprovalsRoute,
  BizCrmRoute,
  BizGoalsRoute,
  BizPlansRoute,
  BizProductsRoute,
  BizReportsRoute,
  BizSaleWorkRoute,
  BizSettingsRoute,
  BrandsIdRoute,
  DesignMarketingRoute,
  DesignMockupsRoute,
  DesignPhotoRoute,
  DesignReportsRoute,
  Distribution3kRoute,
  FinanceAdvanceRoute,
  FinancePaymentRoute,
  FinanceSalaryRoute,
  LocalIdRoute,
  Operations3kRoute,
  Operations3kAccountingRoute,
  Operations3kHrRoute,
  OrderQuotesIdRoute,
  OrderQuotesNewRoute,
  OrderQuotesReportRoute,
  OrderTrackingIdRoute,
  ProcurementSuppliersRoute,
  SaoAdminRoute,
  SaoEarnRoute,
  SaoLeaderboardRoute,
  SaoShopRoute,
  SettingsKpiV2Route,
  Showroom3kRoute,
  ShowroomShiftsRoute,
  ShowroomSuppliersRoute,
  SignalsReportRoute,
  SocialIdRoute,
  WebsitesIdRoute,
  BizIndexRoute,
  BrandsIndexRoute,
  LocalIndexRoute,
  OrderQuotesIndexRoute,
  OrderTrackingIndexRoute,
  SaoIndexRoute,
  SignalsIndexRoute,
  SocialIndexRoute,
  WebsitesIndexRoute,
  FinanceIncomingIdRoute,
  K3UnitUnitRoute,
  FinanceIncomingIndexRoute,
  ApiPublicCassoWebhookRoute,
  ApiPublicMetaDispatchRoute,
  ApiPublicMetaLeadsWebhookRoute,
  ApiPublicMetaMaintainCronRoute,
  ApiPublicMetaOauthCallbackRoute,
  ApiPublicPushDispatchRoute,
  ApiPublicWebChatGuestRoute,
  ApiPublicWfPingRoute,
  ApiPublicWfRecoverCronRoute,
  ApiPublicWfRegisterFormsRoute,
  ApiPublicWfSubmitRoute,
  ApiPublicZaloCareCronRoute,
  ApiPublicZaloDispatchCronRoute,
  ApiPublicZaloOauthCallbackRoute,
  ApiPublicZaloWebhookRoute
};
const routeTree = Route$1s._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  markChatRead as $,
  DialogTitle as A,
  Button as B,
  Card as C,
  Dialog as D,
  DialogFooter as E,
  useAuth as F,
  DESC as G,
  Route$1m as H,
  Input as I,
  chatUnreadTotal as J,
  readRememberChoice as K,
  Label as L,
  PasswordInput as M,
  Checkbox as N,
  CardHeader as O,
  PageHeader as P,
  CardTitle as Q,
  Route$1q as R,
  Sheet as S,
  Switch as T,
  getUserPermissions as U,
  allDependencies as V,
  allDependents as W,
  SUPER_ADMIN_ID as X,
  PERMISSION_BY_KEY as Y,
  CHAT_REFRESH_MS as Z,
  chatInbox as _,
  useServerFn as a,
  buildEmployeeReport as a$,
  chatMessages as a0,
  chatParticipants as a1,
  validateChatAttachment as a2,
  openDirectChat as a3,
  createChatGroup as a4,
  downloadChatAttachment as a5,
  recallChatMessage as a6,
  deleteChatAttachment as a7,
  sendChatMessage as a8,
  KPI_ALL as a9,
  entryStatus as aA,
  BASIC_KR_LIST as aB,
  BASIC_KR_GROUPS as aC,
  MONTHLY_SOURCE as aD,
  monthsIn as aE,
  createKpiService as aF,
  cloudRepository as aG,
  isAssignable as aH,
  isKpiV2Enabled as aI,
  KPI_METRIC_LIST as aJ,
  KR_GROUPS as aK,
  DIRECTION_LABEL as aL,
  findNestedItems as aM,
  ROLE_KPI_TEMPLATES as aN,
  isAchieved as aO,
  onCloudSync as aP,
  buttonVariants as aQ,
  Progress as aR,
  resendConfirmation as aS,
  Route$1f as aT,
  ORDER_PRIORITIES as aU,
  ORDER_SOURCES as aV,
  ORDER_STATUSES as aW,
  uid as aX,
  PERMISSIONS as aY,
  PERMISSION_DEPENDS as aZ,
  Route$1d as a_,
  KPI_PERM_KEYS as aa,
  getKpiMetric as ab,
  hydrateKpi as ac,
  goalCaps as ad,
  goalLocked as ae,
  DropdownMenu as af,
  DropdownMenuTrigger as ag,
  DropdownMenuContent as ah,
  DropdownMenuItem as ai,
  DropdownMenuSeparator as aj,
  AVAILABILITY_LABEL as ak,
  lockedResultOf as al,
  KR_ENGINE_KEYS as am,
  calculateKrItem as an,
  calculateKpiItem as ao,
  calculateVideoDesignItem as ap,
  kpiCan as aq,
  SheetDescription as ar,
  krsOfGoal as as,
  directionOf as at,
  evaluateKr as au,
  krDeadline as av,
  KR_STATE_TONE as aw,
  flushKpi as ax,
  KpiError as ay,
  isManualKr as az,
  useStore as b,
  Route$i as b$,
  buildOverview as b0,
  Route$19 as b1,
  onRecoveryChange as b2,
  hasRecoverySession as b3,
  clearRecoverySession as b4,
  ZaloSettingsTab as b5,
  accountAuthStatus as b6,
  ROLE_PERMISSIONS as b7,
  PERMISSION_GROUPS as b8,
  BIZ_ORG_GROUPS as b9,
  useIsMobile as bA,
  SheetTrigger as bB,
  Route$C as bC,
  Route$B as bD,
  Route$y as bE,
  TooltipProvider as bF,
  Tooltip as bG,
  TooltipTrigger as bH,
  TooltipContent as bI,
  SOCIAL_PLATFORMS as bJ,
  SOCIAL_CHANNEL_STATUSES as bK,
  SOCIAL_STATUSES as bL,
  SOCIAL_CONTENT_TYPES as bM,
  Route$k as bN,
  GROWTH_PERIOD_TYPES as bO,
  ensureSeoChecks as bP,
  OPTIMIZE_SOURCES as bQ,
  OPTIMIZE_TARGETS as bR,
  OPTIMIZE_RECURRING_PERIODS as bS,
  computeNextOptimizeDate as bT,
  ENTITY_PLATFORMS as bU,
  ENTITY_STATUSES as bV,
  KEYWORD_RANK_STATUSES as bW,
  BACKLINK_STATUSES as bX,
  BACKLINK_TYPES as bY,
  isActiveKeywordTrack as bZ,
  SEO_CHECK_TEMPLATE as b_,
  auditDependencies as ba,
  ALL_PERMS as bb,
  DialogDescription as bc,
  suggestedProgressionStatus as bd,
  DialogTrigger as be,
  todayISO as bf,
  VIDEO_STATUSES as bg,
  VIDEO_TYPES as bh,
  VIDEO_USE_CHANNELS as bi,
  Route$12 as bj,
  CONTENT_STATUSES as bk,
  CONTENT_TYPES as bl,
  ContentCalendar as bm,
  SEARCH_INTENTS as bn,
  INDEX_STATUSES as bo,
  OPTIMIZE_REASONS as bp,
  ORDER_TYPES as bq,
  approvalsQuery as br,
  useOrganizationAction as bs,
  Popover as bt,
  PopoverTrigger as bu,
  PopoverContent as bv,
  orgQuery as bw,
  workflowsQuery as bx,
  Route$R as by,
  Route$H as bz,
  createSsrRpc as c,
  SHARE_SOCIAL_STATUSES as c0,
  Route$h as c1,
  Route$g as c2,
  Route$f as c3,
  zaloMyLink as c4,
  zaloReminderHealth as c5,
  ZaloLinkCard as c6,
  chipiState as c7,
  CHIPI_PLAY_DURATION_MS as c8,
  CHIPI_PLAY_INTERVAL_MS as c9,
  newChipiNotice as ca,
  currentChipiNotice as cb,
  ChipiNoticeIcon as cc,
  notificationText as cd,
  NotificationBell as ce,
  chipiDisplayState as cf,
  titleRolesApi as cg,
  auditReasonLabel as ch,
  suggestedRole as ci,
  router as cj,
  approvalCenterQuery as d,
  sortRecent as e,
  fmtDate as f,
  filterItems as g,
  sourceGroup as h,
  isOverdue as i,
  cn as j,
  groupLabel as k,
  Badge as l,
  dateText as m,
  pushDispatch as n,
  CardContent as o,
  parseApprovalUrl as p,
  SheetContent as q,
  SheetHeader as r,
  sortTodo as s,
  SheetTitle as t,
  useCurrentUser as u,
  vnd as v,
  waitingText as w,
  DialogContent as x,
  DialogHeader as y,
  zaloDispatch as z
};
