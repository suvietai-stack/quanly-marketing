import { c as createServerRpc } from "./createServerRpc-Dzg1GLux.mjs";
import { c as createServerFn } from "./server-DpZ_OgFb.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B14nd7Va.mjs";
import { p as passwordIssues, a as authErrorMessage } from "./auth-errors-CN_iHaBn.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const SUPER_ADMIN_ROLE = "role-super-admin";
const adminResetPassword_createServerFn_handler = createServerRpc({
  id: "79601276ec2df3b2e9dcad47b4ed7ebfefbefcaa859d127fa88508231536995a",
  name: "adminResetPassword",
  filename: "src/lib/accounts.functions.ts"
}, (opts) => adminResetPassword.__executeServer(opts));
const adminResetPassword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  userId: stringType().uuid(),
  newPassword: stringType().refine((v) => passwordIssues(v).length === 0, {
    message: "Mật khẩu cần 8–200 ký tự, gồm chữ cái và chữ số."
  })
}).parse(input)).handler(adminResetPassword_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    assertAccountPermission,
    authState
  } = await import("./accounts.server-B16Hi9E6.mjs");
  await assertAccountPermission(context.supabase, context.userId, "settings.user_reset_password");
  if (data.userId === context.userId) throw new Error("Vui lòng dùng chức năng Đổi mật khẩu cho tài khoản của bạn.");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const [{
    data: target,
    error: targetError
  }, {
    data: targetRoles,
    error: targetRoleError
  }, {
    data: actorRoles,
    error: actorRoleError
  }, {
    data: actor,
    error: actorError
  }] = await Promise.all([supabaseAdmin.from("profiles").select("is_system_admin").eq("id", data.userId).maybeSingle(), supabaseAdmin.from("user_roles").select("role_id").eq("user_id", data.userId), context.supabase.from("user_roles").select("role_id").eq("user_id", context.userId), context.supabase.from("profiles").select("is_system_admin").eq("id", context.userId).maybeSingle()]);
  if (!target || targetError || targetRoleError || actorRoleError || actorError) throw new Error("Không kiểm tra được hồ sơ và quyền tài khoản.");
  const targetIsSuper = target.is_system_admin || targetRoles?.some((r) => r.role_id === SUPER_ADMIN_ROLE);
  if (targetIsSuper && !actor?.is_system_admin && !actorRoles?.some((r) => r.role_id === SUPER_ADMIN_ROLE)) {
    throw new Error("Chỉ Super Admin mới được reset mật khẩu tài khoản quản trị cấp cao.");
  }
  const state = await authState(supabaseAdmin, data.userId);
  if (!state.authExists || !state.emailMatches) throw new Error("Hồ sơ và tài khoản xác thực cần kiểm tra trước khi đặt lại mật khẩu.");
  const {
    data: reservation,
    error: reserveError
  } = await supabaseAdmin.rpc("account_auth_reserve", {
    _bucket: `reset:${context.userId}`,
    _action: "reset_password",
    _actor: context.userId,
    _target: data.userId
  });
  if (reserveError || !reservation) throw new Error("Bạn đã thao tác quá nhiều lần hoặc nhật ký chưa sẵn sàng. Vui lòng thử lại sau.");
  const {
    error
  } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
    password: data.newPassword
  });
  const {
    error: logError
  } = await supabaseAdmin.rpc("account_auth_finish", {
    _id: reservation,
    _state: error ? "failed" : "completed"
  });
  if (error) throw new Error(authErrorMessage(error, "password"));
  if (logError) throw new Error("Mật khẩu đã cập nhật nhưng chưa xác nhận được nhật ký. Không đặt lại lần nữa; hãy kiểm tra trạng thái.");
  return {
    ok: true,
    emailConfirmed: state.emailConfirmed,
    ready: state.emailConfirmed && state.status === "Đang hoạt động" && !state.banned
  };
});
const adminDeleteUser_createServerFn_handler = createServerRpc({
  id: "31a227d85330f9572db4b774e1502fc43b2d31c80ce0c4b7e182ac4454c451ad",
  name: "adminDeleteUser",
  filename: "src/lib/accounts.functions.ts"
}, (opts) => adminDeleteUser.__executeServer(opts));
const adminDeleteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  userId: stringType().uuid()
}).parse(input)).handler(adminDeleteUser_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    assertAccountPermission
  } = await import("./accounts.server-B16Hi9E6.mjs");
  await assertAccountPermission(context.supabase, context.userId, "settings.user_delete");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const [{
    data: target,
    error: targetError
  }, {
    data: roles,
    error: rolesError
  }] = await Promise.all([supabaseAdmin.from("profiles").select("is_system_admin").eq("id", data.userId).maybeSingle(), supabaseAdmin.from("user_roles").select("role_id").eq("user_id", data.userId)]);
  if (targetError || rolesError || !target) throw new Error("Không kiểm tra được tài khoản được chọn.");
  if (target.is_system_admin || roles?.some((r) => r.role_id === SUPER_ADMIN_ROLE) || data.userId === context.userId) {
    throw new Error("Không thể xóa tài khoản hệ thống.");
  }
  const {
    error
  } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
  if (error) throw new Error(error.message);
  const {
    error: logError
  } = await supabaseAdmin.from("account_security_logs").insert({
    actor_id: context.userId,
    target_id: data.userId,
    action: "delete_user"
  });
  if (logError) throw new Error("Đã xóa tài khoản nhưng chưa lưu được nhật ký.");
  return {
    ok: true
  };
});
const usernameSignIn_createServerFn_handler = createServerRpc({
  id: "1c1631db9b5eddf142368f53bfce1e0be2764a4f225c30be7227d946837ee464",
  name: "usernameSignIn",
  filename: "src/lib/accounts.functions.ts"
}, (opts) => usernameSignIn.__executeServer(opts));
const usernameSignIn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  username: stringType().min(1).max(100),
  password: stringType().min(1).max(1e3)
}).parse(input)).handler(usernameSignIn_createServerFn_handler, async ({
  data
}) => {
  const {
    publicAuthClient
  } = await import("./accounts.server-B16Hi9E6.mjs");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data.username.trim().toLowerCase())))).map((v) => v.toString(16).padStart(2, "0")).join("");
  const {
    error: throttle
  } = await supabaseAdmin.rpc("account_auth_reserve", {
    _bucket: `login:${digest}`,
    _action: "username_login"
  });
  if (throttle) return {
    ok: false,
    error: "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau."
  };
  const {
    data: id,
    error: lookupError
  } = await supabaseAdmin.rpc("account_username_identity", {
    _username: data.username
  });
  if (lookupError || !id) return {
    ok: false,
    error: "Thông tin đăng nhập không chính xác."
  };
  const {
    data: identity,
    error: identityError
  } = await supabaseAdmin.auth.admin.getUserById(id);
  if (identityError || !identity.user?.email) return {
    ok: false,
    error: "Thông tin đăng nhập không chính xác."
  };
  const {
    data: signed,
    error
  } = await publicAuthClient().auth.signInWithPassword({
    email: identity.user.email,
    password: data.password
  });
  if (error || !signed.session) return {
    ok: false,
    error: authErrorMessage(error)
  };
  return {
    ok: true,
    session: {
      access_token: signed.session.access_token,
      refresh_token: signed.session.refresh_token
    }
  };
});
const accountAuthStatus_createServerFn_handler = createServerRpc({
  id: "0113de71819f21b546487ac041152e9ccd682d9020f7a79cc23481e9ead65686",
  name: "accountAuthStatus",
  filename: "src/lib/accounts.functions.ts"
}, (opts) => accountAuthStatus.__executeServer(opts));
const accountAuthStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  userId: stringType().uuid()
}).parse(input)).handler(accountAuthStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    assertAccountPermission,
    authState
  } = await import("./accounts.server-B16Hi9E6.mjs");
  await assertAccountPermission(context.supabase, context.userId, "settings.user_view");
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  return authState(supabaseAdmin, data.userId);
});
const resendConfirmation_createServerFn_handler = createServerRpc({
  id: "0c4a065752acd0ded8809738ee29ab185555dfe4bab2f41c61839887af1be525",
  name: "resendConfirmation",
  filename: "src/lib/accounts.functions.ts"
}, (opts) => resendConfirmation.__executeServer(opts));
const resendConfirmation = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: stringType().email().max(254),
  redirect: stringType().url()
}).parse(input)).handler(resendConfirmation_createServerFn_handler, async ({
  data
}) => {
  const {
    publicAuthClient,
    safeRedirect
  } = await import("./accounts.server-B16Hi9E6.mjs");
  const redirect = safeRedirect(data.redirect);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data.email.trim().toLowerCase())))).map((v) => v.toString(16).padStart(2, "0")).join("");
  const {
    error: throttle
  } = await supabaseAdmin.rpc("account_auth_reserve", {
    _bucket: `confirmation:${digest}`,
    _action: "confirmation"
  });
  if (throttle) throw new Error("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.");
  const {
    error
  } = await publicAuthClient().auth.resend({
    type: "signup",
    email: data.email.trim().toLowerCase(),
    options: {
      emailRedirectTo: redirect
    }
  });
  if (error && !["user_not_found", "email_not_confirmed"].includes(error.code ?? "")) throw new Error(authErrorMessage(error, "send"));
  return {
    ok: true
  };
});
export {
  accountAuthStatus_createServerFn_handler,
  adminDeleteUser_createServerFn_handler,
  adminResetPassword_createServerFn_handler,
  resendConfirmation_createServerFn_handler,
  usernameSignIn_createServerFn_handler
};
