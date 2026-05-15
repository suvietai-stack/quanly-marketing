import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import {
  adminResetPassword,
  adminDeleteUser,
  adminLookupEmailByUsername,
} from "@/lib/accounts.functions";

export type ID = string;

// ============ Permissions registry ============
export type PermissionKey = string;

export interface PermissionDef {
  key: PermissionKey;
  label: string;
  group: PermissionGroup;
}

export type PermissionGroup =
  | "Tổng Quan"
  | "Task"
  | "Thương Hiệu"
  | "Dự Án Web"
  | "Social"
  | "Local"
  | "Video"
  | "Thiết Kế"
  | "Báo Cáo"
  | "Cài Đặt";

export const PERMISSIONS: PermissionDef[] = [
  { key: "overview.view", label: "Xem Tổng Quan", group: "Tổng Quan" },
  { key: "task.view", label: "Xem task", group: "Task" },
  { key: "task.view_all", label: "Xem tất cả task", group: "Task" },
  { key: "task.view_mine", label: "Chỉ xem task liên quan đến mình", group: "Task" },
  { key: "task.create", label: "Tạo task", group: "Task" },
  { key: "task.edit", label: "Sửa task", group: "Task" },
  { key: "task.delete", label: "Xóa task", group: "Task" },
  { key: "task.assign", label: "Giao task", group: "Task" },
  { key: "task.update_status", label: "Cập nhật trạng thái task", group: "Task" },
  { key: "brand.view", label: "Xem thương hiệu", group: "Thương Hiệu" },
  { key: "brand.create", label: "Tạo thương hiệu", group: "Thương Hiệu" },
  { key: "brand.edit", label: "Sửa thương hiệu", group: "Thương Hiệu" },
  { key: "brand.delete", label: "Xóa thương hiệu", group: "Thương Hiệu" },
  { key: "brand.view_channels", label: "Xem kênh liên kết", group: "Thương Hiệu" },
  { key: "brand.docs", label: "Quản lý tài liệu/guideline", group: "Thương Hiệu" },
  { key: "web.view", label: "Xem dự án web", group: "Dự Án Web" },
  { key: "web.create", label: "Tạo dự án web", group: "Dự Án Web" },
  { key: "web.edit", label: "Sửa dự án web", group: "Dự Án Web" },
  { key: "web.delete", label: "Xóa dự án web", group: "Dự Án Web" },
  { key: "web.tech_view", label: "Xem Technical SEO", group: "Dự Án Web" },
  { key: "web.tech_check", label: "Tích checklist Technical SEO", group: "Dự Án Web" },
  { key: "web.entity", label: "Quản lý Entity / Social SEO", group: "Dự Án Web" },
  { key: "web.keyword", label: "Quản lý Nghiên Cứu Keyword", group: "Dự Án Web" },
  { key: "web.content_create", label: "Tạo content web", group: "Dự Án Web" },
  { key: "web.content_edit", label: "Sửa content web", group: "Dự Án Web" },
  { key: "web.content_delete", label: "Xóa content web", group: "Dự Án Web" },
  { key: "web.content_assign", label: "Giao content web", group: "Dự Án Web" },
  { key: "web.outline_start", label: "Bắt đầu làm outline", group: "Dự Án Web" },
  { key: "web.outline_submit", label: "Gửi duyệt outline", group: "Dự Án Web" },
  { key: "web.outline_approve", label: "Duyệt outline", group: "Dự Án Web" },
  { key: "web.outline_reject", label: "Yêu cầu sửa outline", group: "Dự Án Web" },
  { key: "web.outline_resubmit", label: "Gửi duyệt lại outline", group: "Dự Án Web" },
  { key: "web.post_write_start", label: "Bắt đầu viết bài", group: "Dự Án Web" },
  { key: "web.post_submit", label: "Gửi duyệt bài", group: "Dự Án Web" },
  { key: "web.post_approve", label: "Duyệt bài", group: "Dự Án Web" },
  { key: "web.post_reject", label: "Yêu cầu sửa bài", group: "Dự Án Web" },
  { key: "web.post_resubmit", label: "Gửi duyệt lại bài", group: "Dự Án Web" },
  { key: "web.move_pending_publish", label: "Chuyển sang chờ đăng", group: "Dự Án Web" },
  { key: "web.publish", label: "Xác nhận đã đăng web", group: "Dự Án Web" },
  { key: "web.update_index", label: "Cập nhật trạng thái index", group: "Dự Án Web" },
  { key: "web.complete", label: "Hoàn thành content web", group: "Dự Án Web" },
  { key: "web.force_status", label: "Ép chuyển trạng thái content", group: "Dự Án Web" },
  { key: "web.update_share", label: "Cập nhật Share Social", group: "Dự Án Web" },
  { key: "web.backlink", label: "Quản lý Backlink / PR", group: "Dự Án Web" },
  { key: "web.checktop", label: "Quản lý Check TOP từ khóa", group: "Dự Án Web" },
  { key: "web.reoptimize", label: "Quản lý Tối ưu lại Content", group: "Dự Án Web" },
  { key: "web.growth_view", label: "Xem Tăng Trưởng Website", group: "Dự Án Web" },
  { key: "web.growth_edit", label: "Cập nhật Tăng Trưởng Website", group: "Dự Án Web" },
  { key: "web.report_view", label: "Xem Báo Cáo Web", group: "Dự Án Web" },
  { key: "social.view", label: "Xem kênh social", group: "Social" },
  { key: "social.create", label: "Tạo kênh social", group: "Social" },
  { key: "social.edit", label: "Sửa kênh social", group: "Social" },
  { key: "social.delete", label: "Xóa kênh social", group: "Social" },
  { key: "social.post_create", label: "Tạo bài social", group: "Social" },
  { key: "social.post_edit", label: "Sửa bài social", group: "Social" },
  { key: "social.post_delete", label: "Xóa bài social", group: "Social" },
  { key: "social.post_start", label: "Bắt đầu làm bài social", group: "Social" },
  { key: "social.post_submit", label: "Gửi duyệt bài social", group: "Social" },
  { key: "social.post_resubmit", label: "Gửi duyệt lại bài social", group: "Social" },
  { key: "social.post_approve", label: "Duyệt bài social", group: "Social" },
  { key: "social.post_request_changes", label: "Yêu cầu sửa bài social", group: "Social" },
  { key: "social.post_move_pending_publish", label: "Chuyển bài sang chờ đăng", group: "Social" },
  { key: "social.post_confirm_published", label: "Xác nhận đã đăng bài social", group: "Social" },
  { key: "social.post_complete", label: "Hoàn thành bài social", group: "Social" },
  { key: "social.post_cancel", label: "Hủy bài social", group: "Social" },
  { key: "social.post_restore", label: "Khôi phục bài social đã hủy", group: "Social" },
  { key: "social.post_force_status", label: "Ép chuyển trạng thái bài social", group: "Social" },
  { key: "social.growth_update", label: "Cập nhật tăng trưởng social", group: "Social" },
  { key: "social.report", label: "Xem báo cáo social", group: "Social" },
  { key: "local.view", label: "Xem local map", group: "Local" },
  { key: "local.create", label: "Tạo địa điểm", group: "Local" },
  { key: "local.edit", label: "Sửa địa điểm", group: "Local" },
  { key: "local.delete", label: "Xóa địa điểm", group: "Local" },
  { key: "local.post_create", label: "Tạo bài đăng Map", group: "Local" },
  { key: "local.post_edit", label: "Sửa bài đăng Map", group: "Local" },
  { key: "local.post_delete", label: "Xóa bài đăng Map", group: "Local" },
  { key: "local.photo", label: "Cập nhật ảnh địa điểm", group: "Local" },
  { key: "local.review", label: "Quản lý review", group: "Local" },
  { key: "local.review_reply", label: "Phản hồi review", group: "Local" },
  { key: "local.report", label: "Xem báo cáo local", group: "Local" },
  { key: "video.view", label: "Xem video", group: "Video" },
  { key: "video.create", label: "Tạo video", group: "Video" },
  { key: "video.edit", label: "Sửa video", group: "Video" },
  { key: "video.delete", label: "Xóa video", group: "Video" },
  { key: "video.script", label: "Cập nhật kịch bản", group: "Video" },
  { key: "video.footage", label: "Cập nhật footage", group: "Video" },
  { key: "video.edit_cut", label: "Cập nhật bản dựng", group: "Video" },
  { key: "video.submit", label: "Gửi duyệt video", group: "Video" },
  { key: "video.approve", label: "Duyệt video", group: "Video" },
  { key: "video.reject", label: "Yêu cầu sửa video", group: "Video" },
  { key: "video.publish", label: "Cập nhật link video đã đăng", group: "Video" },
  { key: "order.view", label: "Xem order", group: "Thiết Kế" },
  { key: "order.create", label: "Tạo order", group: "Thiết Kế" },
  { key: "order.edit", label: "Sửa order", group: "Thiết Kế" },
  { key: "order.delete", label: "Xóa order", group: "Thiết Kế" },
  { key: "order.take", label: "Nhận order", group: "Thiết Kế" },
  { key: "order.deliver", label: "Cập nhật file bàn giao", group: "Thiết Kế" },
  { key: "order.submit", label: "Gửi duyệt thiết kế", group: "Thiết Kế" },
  { key: "order.approve", label: "Duyệt thiết kế", group: "Thiết Kế" },
  { key: "order.reject", label: "Yêu cầu sửa thiết kế", group: "Thiết Kế" },
  { key: "order.update_status", label: "Cập nhật trạng thái order", group: "Thiết Kế" },
  { key: "report.view", label: "Xem báo cáo", group: "Báo Cáo" },
  { key: "report.attention", label: "Xem việc cần chú ý", group: "Báo Cáo" },
  { key: "report.attention_all", label: "Xem tất cả việc cần chú ý", group: "Báo Cáo" },
  { key: "report.export", label: "Xuất báo cáo", group: "Báo Cáo" },
  { key: "settings.view", label: "Xem cài đặt", group: "Cài Đặt" },
  { key: "settings.people", label: "Quản lý nhân sự", group: "Cài Đặt" },
  { key: "settings.catalog", label: "Quản lý danh mục", group: "Cài Đặt" },
  { key: "settings.plan_topic", label: "Quản lý Plan / Topic", group: "Cài Đặt" },
  { key: "settings.template", label: "Quản lý template checklist", group: "Cài Đặt" },
  { key: "settings.role", label: "Quản lý role", group: "Cài Đặt" },
  { key: "settings.permission", label: "Quản lý phân quyền", group: "Cài Đặt" },
  { key: "settings.account_approve", label: "Duyệt tài khoản", group: "Cài Đặt" },
  { key: "settings.account_lock", label: "Khóa/mở khóa tài khoản", group: "Cài Đặt" },
];

export const ALL_PERMS = PERMISSIONS.map((p) => p.key);

export const PERMISSION_GROUPS: PermissionGroup[] = [
  "Tổng Quan", "Task", "Thương Hiệu", "Dự Án Web", "Social", "Local", "Video", "Thiết Kế", "Báo Cáo", "Cài Đặt",
];

export const SUPER_ADMIN_ID = "role-super-admin";
export const ADMIN_ROLE_ID = "role-admin";
export const SYSTEM_ADMIN_USERNAME = "Admin";

// ============ Types ============
export interface Role {
  id: ID;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  system?: boolean;
}

export type AccountStatus = "Chờ duyệt" | "Đang hoạt động" | "Tạm khóa" | "Từ chối" | "Lưu trữ";

export interface User {
  id: ID;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  desiredPosition?: string;
  notes?: string;
  // Legacy fields kept for type compatibility (no longer used — Supabase Auth manages passwords)
  passwordHash: string;
  passwordSalt: string;
  roleId?: ID;
  customPermissions?: PermissionKey[];
  useCustom?: boolean;
  status: AccountStatus;
  createdAt: string;
  system?: boolean;
  mustChangePassword?: boolean;
}

// ============ Store ============
interface AuthState {
  users: User[];
  roles: Role[];
  currentUserId: ID | null;
  loaded: boolean;
  initialized: boolean;

  init: () => Promise<void>;
  reload: () => Promise<void>;

  login: (usernameOrEmail: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (input: {
    username: string; fullName: string; email?: string; phone?: string;
    desiredPosition?: string; notes?: string; password: string;
  }) => Promise<{ ok: boolean; error?: string }>;

  approve: (id: ID, roleId?: ID) => Promise<void>;
  reject: (id: ID) => Promise<void>;
  setStatus: (id: ID, status: AccountStatus) => Promise<void>;
  setRole: (id: ID, roleId: ID) => Promise<void>;
  setUseCustom: (id: ID, useCustom: boolean) => Promise<void>;
  setCustomPerms: (id: ID, perms: PermissionKey[]) => Promise<void>;
  updateUser: (id: ID, patch: Partial<User>) => Promise<void>;
  resetPassword: (id: ID, newPassword: string) => Promise<void>;
  changeOwnPassword: (oldPwd: string, newPwd: string) => Promise<{ ok: boolean; error?: string }>;
  removeUser: (id: ID) => Promise<void>;

  addRole: (r: Omit<Role, "id">) => Promise<void>;
  updateRole: (id: ID, patch: Partial<Role>) => Promise<void>;
  removeRole: (id: ID) => Promise<void>;

  // Compatibility no-op (used by existing code paths)
  ensureSeed: () => Promise<void>;
}

function genRoleId() {
  return "role-" + Math.random().toString(36).slice(2, 10);
}

function mapProfileToUser(
  p: any,
  userRoles: { user_id: string; role_id: string }[],
  overrides: { user_id: string; use_custom: boolean; permissions: string[] }[],
): User {
  const ur = userRoles.find((x) => x.user_id === p.id);
  const ov = overrides.find((x) => x.user_id === p.id);
  return {
    id: p.id,
    username: p.username || "",
    fullName: p.full_name || "",
    email: p.email || undefined,
    phone: p.phone || undefined,
    desiredPosition: p.desired_position || undefined,
    notes: p.notes || undefined,
    passwordHash: "",
    passwordSalt: "",
    roleId: ur?.role_id,
    useCustom: ov?.use_custom ?? false,
    customPermissions: ov?.permissions ?? [],
    status: p.status,
    createdAt: p.created_at,
    system: !!p.is_system_admin,
    mustChangePassword: !!p.must_change_password,
  };
}

export const useAuth = create<AuthState>((set, get) => ({
  users: [],
  roles: [],
  currentUserId: null,
  loaded: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ currentUserId: session?.user?.id ?? null });
      if (session) {
        get().reload();
      } else {
        set({ users: [], roles: [], loaded: false });
      }
    });
    const { data: { session } } = await supabase.auth.getSession();
    set({ currentUserId: session?.user?.id ?? null });
    if (session) await get().reload();
  },

  reload: async () => {
    const [profilesRes, rolesRes, urRes, ovRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("app_roles").select("*").order("name"),
      supabase.from("user_roles").select("*"),
      supabase.from("user_permission_overrides").select("*"),
    ]);
    const profiles = profilesRes.data ?? [];
    const userRoles = (urRes.data ?? []) as { user_id: string; role_id: string }[];
    const overrides = (ovRes.data ?? []) as { user_id: string; use_custom: boolean; permissions: string[] }[];
    const users = profiles.map((p) => mapProfileToUser(p, userRoles, overrides));
    const roles: Role[] = (rolesRes.data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      permissions: r.permissions ?? [],
      system: !!r.is_system,
    }));
    set({ users, roles, loaded: true });
  },

  ensureSeed: async () => { /* Database is pre-seeded by migration. */ },

  login: async (usernameOrEmail, password) => {
    const input = usernameOrEmail.trim();
    let email = input.includes("@") ? input.toLowerCase() : "";
    if (!email) {
      // Special case for system Admin
      if (input.toLowerCase() === "admin") {
        email = "admin@local";
      } else {
        const res = await adminLookupEmailByUsername({ data: { username: input } });
        if (!res.email) return { ok: false, error: "Sai tên đăng nhập hoặc mật khẩu." };
        email = res.email;
      }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false, error: "Sai tên đăng nhập hoặc mật khẩu." };
    const { data: prof } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", data.user.id)
      .maybeSingle();
    const status = prof?.status as AccountStatus | undefined;
    if (status !== "Đang hoạt động") {
      await supabase.auth.signOut();
      const msg =
        status === "Chờ duyệt" ? "Tài khoản của bạn đang chờ Admin duyệt." :
        status === "Tạm khóa" ? "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin." :
        status === "Từ chối" ? "Tài khoản của bạn đã bị từ chối." :
        status === "Lưu trữ" ? "Tài khoản đã được lưu trữ." :
        "Tài khoản không khả dụng.";
      return { ok: false, error: msg };
    }
    return { ok: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  register: async (input) => {
    const username = input.username.trim();
    if (!username) return { ok: false, error: "Vui lòng nhập tên đăng nhập." };
    if (username.toLowerCase() === "admin") return { ok: false, error: "Tên đăng nhập 'Admin' đã được hệ thống sử dụng." };
    // Check username uniqueness via server function (bypasses RLS)
    const lookup = await adminLookupEmailByUsername({ data: { username } });
    if (lookup.email) return { ok: false, error: "Tên đăng nhập đã tồn tại." };

    const email = input.email?.trim().toLowerCase() || `${username.toLowerCase()}@user.local`;
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          full_name: input.fullName,
          phone: input.phone,
          desired_position: input.desiredPosition,
          notes: input.notes,
        },
      },
    });
    if (error) {
      const msg = error.message?.includes("already") ? "Email hoặc tài khoản đã tồn tại." : error.message;
      return { ok: false, error: msg };
    }
    // Sign out immediately — account must be approved before login
    await supabase.auth.signOut();
    return { ok: true };
  },

  approve: async (id, roleId) => {
    const { error: e1 } = await supabase
      .from("profiles")
      .update({ status: "Đang hoạt động" })
      .eq("id", id);
    if (e1) throw new Error(e1.message);
    if (roleId) {
      await supabase.from("user_roles").delete().eq("user_id", id);
      const { error: e2 } = await supabase.from("user_roles").insert({ user_id: id, role_id: roleId });
      if (e2) throw new Error(e2.message);
    }
    await get().reload();
  },

  reject: async (id) => {
    const { error } = await supabase.from("profiles").update({ status: "Từ chối" }).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setStatus: async (id, status) => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setRole: async (id, roleId) => {
    await supabase.from("user_roles").delete().eq("user_id", id);
    const { error } = await supabase.from("user_roles").insert({ user_id: id, role_id: roleId });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setUseCustom: async (id, useCustom) => {
    const existing = get().users.find((u) => u.id === id);
    const perms = existing?.customPermissions ?? [];
    const { error } = await supabase
      .from("user_permission_overrides")
      .upsert({ user_id: id, use_custom: useCustom, permissions: perms });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  setCustomPerms: async (id, perms) => {
    const { error } = await supabase
      .from("user_permission_overrides")
      .upsert({ user_id: id, use_custom: true, permissions: perms });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  updateUser: async (id, patch) => {
    const dbPatch: {
      full_name?: string;
      email?: string | null;
      phone?: string | null;
      desired_position?: string | null;
      notes?: string | null;
      must_change_password?: boolean;
    } = {};
    if (patch.fullName !== undefined) dbPatch.full_name = patch.fullName;
    if (patch.email !== undefined) dbPatch.email = patch.email || null;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone || null;
    if (patch.desiredPosition !== undefined) dbPatch.desired_position = patch.desiredPosition || null;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes || null;
    if (patch.mustChangePassword !== undefined) dbPatch.must_change_password = patch.mustChangePassword;
    if (Object.keys(dbPatch).length === 0) return;
    const { error } = await supabase.from("profiles").update(dbPatch).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  resetPassword: async (id, newPassword) => {
    await adminResetPassword({ data: { userId: id, newPassword } });
  },

  changeOwnPassword: async (oldPwd, newPwd) => {
    const { data: sess } = await supabase.auth.getSession();
    const email = sess.session?.user?.email;
    const userId = sess.session?.user?.id;
    if (!email || !userId) return { ok: false, error: "Chưa đăng nhập." };
    const { error: e1 } = await supabase.auth.signInWithPassword({ email, password: oldPwd });
    if (e1) return { ok: false, error: "Mật khẩu hiện tại không đúng." };
    const { error: e2 } = await supabase.auth.updateUser({ password: newPwd });
    if (e2) return { ok: false, error: e2.message };
    await supabase.from("profiles").update({ must_change_password: false }).eq("id", userId);
    await get().reload();
    return { ok: true };
  },

  removeUser: async (id) => {
    await adminDeleteUser({ data: { userId: id } });
    await get().reload();
  },

  addRole: async (r) => {
    const { error } = await supabase.from("app_roles").insert({
      id: genRoleId(),
      name: r.name,
      description: r.description ?? null,
      permissions: r.permissions ?? [],
      is_system: false,
    });
    if (error) throw new Error(error.message);
    await get().reload();
  },

  updateRole: async (id, patch) => {
    const dbPatch: {
      name?: string;
      description?: string | null;
      permissions?: string[];
    } = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.permissions !== undefined) dbPatch.permissions = patch.permissions;
    if (Object.keys(dbPatch).length === 0) return;
    const { error } = await supabase.from("app_roles").update(dbPatch).eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },

  removeRole: async (id) => {
    const { error } = await supabase.from("app_roles").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await get().reload();
  },
}));

// ============ Helpers ============
export function getUserPermissions(user: User | null | undefined, roles: Role[]): Set<PermissionKey> {
  if (!user) return new Set();
  if (user.useCustom && user.customPermissions) return new Set(user.customPermissions);
  const role = roles.find((r) => r.id === user.roleId);
  if (!role) return new Set();
  return new Set(role.permissions);
}

export function useCurrentUser() {
  const u = useAuth((s) => s.users.find((x) => x.id === s.currentUserId) || null);
  const roles = useAuth((s) => s.roles);
  const perms = getUserPermissions(u, roles);
  const isSuperAdmin = u?.roleId === SUPER_ADMIN_ID || !!u?.system;
  const isAdmin = isSuperAdmin || u?.roleId === ADMIN_ROLE_ID;
  return {
    user: u,
    role: u ? roles.find((r) => r.id === u.roleId) : undefined,
    perms,
    can: (key: PermissionKey) => isAdmin || perms.has(key),
    isSuperAdmin,
    isAdmin,
  };
}
