import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ID = string;
const uid = () => Math.random().toString(36).slice(2, 10);

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
  // Tổng quan
  { key: "overview.view", label: "Xem Tổng Quan", group: "Tổng Quan" },
  // Task
  { key: "task.view", label: "Xem task", group: "Task" },
  { key: "task.view_all", label: "Xem tất cả task", group: "Task" },
  { key: "task.view_mine", label: "Chỉ xem task liên quan đến mình", group: "Task" },
  { key: "task.create", label: "Tạo task", group: "Task" },
  { key: "task.edit", label: "Sửa task", group: "Task" },
  { key: "task.delete", label: "Xóa task", group: "Task" },
  { key: "task.assign", label: "Giao task", group: "Task" },
  { key: "task.update_status", label: "Cập nhật trạng thái task", group: "Task" },
  // Brand
  { key: "brand.view", label: "Xem thương hiệu", group: "Thương Hiệu" },
  { key: "brand.create", label: "Tạo thương hiệu", group: "Thương Hiệu" },
  { key: "brand.edit", label: "Sửa thương hiệu", group: "Thương Hiệu" },
  { key: "brand.delete", label: "Xóa thương hiệu", group: "Thương Hiệu" },
  { key: "brand.view_channels", label: "Xem kênh liên kết", group: "Thương Hiệu" },
  { key: "brand.docs", label: "Quản lý tài liệu/guideline", group: "Thương Hiệu" },
  // Web
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
  { key: "web.outline_submit", label: "Gửi duyệt outline", group: "Dự Án Web" },
  { key: "web.outline_approve", label: "Duyệt outline", group: "Dự Án Web" },
  { key: "web.outline_reject", label: "Yêu cầu sửa outline", group: "Dự Án Web" },
  { key: "web.post_submit", label: "Gửi duyệt bài", group: "Dự Án Web" },
  { key: "web.post_approve", label: "Duyệt bài", group: "Dự Án Web" },
  { key: "web.post_reject", label: "Yêu cầu sửa bài", group: "Dự Án Web" },
  { key: "web.publish", label: "Đăng bài / cập nhật link bài đã đăng", group: "Dự Án Web" },
  { key: "web.update_index", label: "Cập nhật index", group: "Dự Án Web" },
  { key: "web.update_share", label: "Cập nhật Share Social", group: "Dự Án Web" },
  { key: "web.backlink", label: "Quản lý Backlink / PR", group: "Dự Án Web" },
  { key: "web.checktop", label: "Quản lý Check TOP từ khóa", group: "Dự Án Web" },
  { key: "web.reoptimize", label: "Quản lý Tối ưu lại Content", group: "Dự Án Web" },
  { key: "web.growth_view", label: "Xem Tăng Trưởng Website", group: "Dự Án Web" },
  { key: "web.growth_edit", label: "Cập nhật Tăng Trưởng Website", group: "Dự Án Web" },
  { key: "web.report_view", label: "Xem Báo Cáo Web", group: "Dự Án Web" },
  // Social
  { key: "social.view", label: "Xem kênh social", group: "Social" },
  { key: "social.create", label: "Tạo kênh social", group: "Social" },
  { key: "social.edit", label: "Sửa kênh social", group: "Social" },
  { key: "social.delete", label: "Xóa kênh social", group: "Social" },
  { key: "social.post_create", label: "Tạo bài social", group: "Social" },
  { key: "social.post_edit", label: "Sửa bài social", group: "Social" },
  { key: "social.post_delete", label: "Xóa bài social", group: "Social" },
  { key: "social.post_submit", label: "Gửi duyệt bài social", group: "Social" },
  { key: "social.post_approve", label: "Duyệt bài social", group: "Social" },
  { key: "social.schedule", label: "Lên lịch đăng", group: "Social" },
  { key: "social.publish", label: "Cập nhật link bài đã đăng", group: "Social" },
  { key: "social.report", label: "Xem báo cáo social", group: "Social" },
  // Local
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
  // Video
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
  // Design / Order
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
  // Báo cáo
  { key: "report.view", label: "Xem báo cáo", group: "Báo Cáo" },
  { key: "report.attention", label: "Xem việc cần chú ý", group: "Báo Cáo" },
  { key: "report.attention_all", label: "Xem tất cả việc cần chú ý", group: "Báo Cáo" },
  { key: "report.export", label: "Xuất báo cáo", group: "Báo Cáo" },
  // Cài đặt
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

// ============ Roles ============
export interface Role {
  id: ID;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  system?: boolean; // system roles: cannot delete/rename critical
}

const PRESET = (keys: string[]): PermissionKey[] => keys;

const SUPER_ADMIN_ID = "role-super-admin";
const ADMIN_ROLE_ID = "role-admin";

const DEFAULT_ROLES: Role[] = [
  { id: SUPER_ADMIN_ID, name: "Super Admin", description: "Toàn quyền hệ thống", permissions: ALL_PERMS, system: true },
  { id: ADMIN_ROLE_ID, name: "Admin", description: "Quản trị toàn bộ app, không can thiệp Super Admin", permissions: ALL_PERMS, system: true },
  {
    id: "role-leader",
    name: "Leader Marketing",
    description: "Quản lý thương hiệu, task, web, social, local, video, thiết kế",
    permissions: PRESET([
      "overview.view",
      "task.view","task.view_all","task.create","task.edit","task.assign","task.update_status",
      "brand.view","brand.create","brand.edit","brand.view_channels","brand.docs",
      "web.view","web.create","web.edit","web.tech_view","web.tech_check","web.entity","web.keyword",
      "web.content_create","web.content_edit","web.content_assign","web.outline_approve","web.outline_reject",
      "web.post_approve","web.post_reject","web.publish","web.update_index","web.update_share",
      "web.backlink","web.checktop","web.reoptimize","web.growth_view","web.report_view",
      "social.view","social.create","social.edit","social.post_create","social.post_edit","social.post_approve","social.schedule","social.publish","social.report",
      "local.view","local.create","local.edit","local.post_create","local.post_edit","local.review","local.review_reply","local.report",
      "video.view","video.create","video.edit","video.approve","video.reject","video.publish",
      "order.view","order.create","order.edit","order.approve","order.reject","order.update_status",
      "report.view","report.attention","report.attention_all","report.export",
      "settings.view","settings.people","settings.catalog","settings.plan_topic","settings.template",
    ]),
  },
  {
    id: "role-seo",
    name: "SEO",
    description: "Quản lý phần Dự Án Web liên quan SEO",
    permissions: PRESET([
      "overview.view","task.view","task.view_mine","task.update_status",
      "brand.view","brand.view_channels",
      "web.view","web.tech_view","web.tech_check","web.entity","web.keyword",
      "web.content_create","web.content_edit","web.outline_submit","web.post_submit",
      "web.publish","web.update_index","web.update_share","web.backlink","web.checktop","web.reoptimize",
      "web.growth_view","web.growth_edit","web.report_view",
      "report.view","report.attention",
    ]),
  },
  {
    id: "role-content",
    name: "Content Web",
    description: "Nhận việc và xử lý content web",
    permissions: PRESET([
      "overview.view","task.view","task.view_mine","task.update_status",
      "brand.view","web.view","web.content_create","web.content_edit","web.outline_submit","web.post_submit",
      "report.view","report.attention",
    ]),
  },
  {
    id: "role-social",
    name: "Social",
    description: "Quản lý kênh social và sản xuất bài đăng social",
    permissions: PRESET([
      "overview.view","task.view","task.view_mine","task.update_status",
      "brand.view","social.view","social.post_create","social.post_edit","social.post_submit","social.publish","social.report",
      "report.view","report.attention",
    ]),
  },
  {
    id: "role-local",
    name: "Local SEO",
    description: "Quản lý Local Map, bài đăng Map, ảnh, review",
    permissions: PRESET([
      "overview.view","task.view","task.view_mine","task.update_status",
      "brand.view","local.view","local.create","local.edit","local.post_create","local.post_edit",
      "local.photo","local.review","local.review_reply","local.report",
      "report.view","report.attention",
    ]),
  },
  {
    id: "role-designer",
    name: "Designer / Chụp ảnh",
    description: "Quản lý các order thiết kế/chụp ảnh được giao",
    permissions: PRESET([
      "overview.view","task.view","task.view_mine","task.update_status",
      "order.view","order.take","order.deliver","order.submit","order.update_status",
      "report.view",
    ]),
  },
  {
    id: "role-video",
    name: "Video",
    description: "Quản lý việc sản xuất video",
    permissions: PRESET([
      "overview.view","task.view","task.view_mine","task.update_status",
      "video.view","video.script","video.footage","video.edit_cut","video.submit","video.publish",
      "report.view",
    ]),
  },
  {
    id: "role-viewer",
    name: "Viewer / Ban Giám Đốc",
    description: "Chỉ xem dữ liệu tổng quan, báo cáo, danh sách công việc",
    permissions: PRESET([
      "overview.view","task.view","task.view_all",
      "brand.view","brand.view_channels",
      "web.view","web.report_view","web.growth_view",
      "social.view","social.report","local.view","local.report","video.view","order.view",
      "report.view","report.attention","report.attention_all",
    ]),
  },
];

// ============ Users ============
export type AccountStatus = "Chờ duyệt" | "Đang hoạt động" | "Tạm khóa" | "Từ chối" | "Lưu trữ";

export interface User {
  id: ID;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  desiredPosition?: string;
  notes?: string;
  passwordHash: string;
  passwordSalt: string;
  roleId?: ID;
  customPermissions?: PermissionKey[]; // override role
  useCustom?: boolean;
  status: AccountStatus;
  createdAt: string;
  system?: boolean; // system Admin account
}

// ============ Hashing (Web Crypto SHA-256, salted) ============
function toHex(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}

export async function sha256(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return toHex(buf);
  }
  // Fallback (very unlikely)
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return String(h);
}

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const s = salt || uid() + uid();
  const hash = await sha256(s + ":" + password);
  return { hash, salt: s };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computed = await sha256(salt + ":" + password);
  return computed === hash;
}

// ============ Auth Store ============
interface AuthState {
  users: User[];
  roles: Role[];
  currentUserId: ID | null;
  seeded: boolean;
  // actions
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  register: (input: Omit<User, "id" | "passwordHash" | "passwordSalt" | "status" | "createdAt"> & { password: string }) => Promise<{ ok: boolean; error?: string }>;
  approve: (id: ID, roleId?: ID) => void;
  reject: (id: ID) => void;
  setStatus: (id: ID, status: AccountStatus) => void;
  setRole: (id: ID, roleId: ID) => void;
  setUseCustom: (id: ID, useCustom: boolean) => void;
  setCustomPerms: (id: ID, perms: PermissionKey[]) => void;
  updateUser: (id: ID, patch: Partial<User>) => void;
  resetPassword: (id: ID, newPassword: string) => Promise<void>;
  changeOwnPassword: (oldPwd: string, newPwd: string) => Promise<{ ok: boolean; error?: string }>;
  removeUser: (id: ID) => void;
  addRole: (r: Omit<Role, "id">) => void;
  updateRole: (id: ID, patch: Partial<Role>) => void;
  removeRole: (id: ID) => void;
  ensureSeed: () => Promise<void>;
}

export const SYSTEM_ADMIN_USERNAME = "Admin";

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      roles: DEFAULT_ROLES,
      currentUserId: null,
      seeded: false,

      ensureSeed: async () => {
        // Chỉ đảm bảo có tài khoản Admin mặc định và bộ role hệ thống.
        // KHÔNG seed thêm bất kỳ tài khoản demo nào.
        if (get().roles.length === 0) set({ roles: DEFAULT_ROLES });
        const hasAdmin = get().users.some((u) => u.id === "user-admin");
        if (!hasAdmin) {
          const adminPwd = await hashPassword("Suviet888@@@");
          const admin: User = {
            id: "user-admin",
            username: SYSTEM_ADMIN_USERNAME,
            fullName: "Quản trị hệ thống",
            email: "admin@local",
            roleId: SUPER_ADMIN_ID,
            status: "Đang hoạt động",
            system: true,
            passwordHash: adminPwd.hash,
            passwordSalt: adminPwd.salt,
            createdAt: new Date().toISOString(),
          };
          set({ users: [...get().users, admin], seeded: true });
        } else {
          set({ seeded: true });
        }
      },

      login: async (username, password) => {
        const u = get().users.find(
          (x) => x.username.toLowerCase() === username.toLowerCase() || x.email?.toLowerCase() === username.toLowerCase()
        );
        if (!u) return { ok: false, error: "Sai tên đăng nhập hoặc mật khẩu." };
        const ok = await verifyPassword(password, u.passwordHash, u.passwordSalt);
        if (!ok) return { ok: false, error: "Sai tên đăng nhập hoặc mật khẩu." };
        if (u.status === "Chờ duyệt") return { ok: false, error: "Tài khoản của bạn đang chờ Admin duyệt." };
        if (u.status === "Tạm khóa") return { ok: false, error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin." };
        if (u.status === "Từ chối") return { ok: false, error: "Tài khoản đã bị từ chối." };
        if (u.status === "Lưu trữ") return { ok: false, error: "Tài khoản đã được lưu trữ." };
        set({ currentUserId: u.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      register: async (input) => {
        const exists = get().users.some(
          (u) => u.username.toLowerCase() === input.username.toLowerCase() ||
                 (input.email && u.email?.toLowerCase() === input.email.toLowerCase())
        );
        if (exists) return { ok: false, error: "Tên đăng nhập hoặc email đã tồn tại." };
        const { hash, salt } = await hashPassword(input.password);
        const u: User = {
          id: uid(), username: input.username, fullName: input.fullName,
          email: input.email, phone: input.phone, desiredPosition: input.desiredPosition,
          notes: input.notes, passwordHash: hash, passwordSalt: salt,
          status: "Chờ duyệt", createdAt: new Date().toISOString(),
        };
        set({ users: [...get().users, u] });
        return { ok: true };
      },

      approve: (id, roleId) => set({
        users: get().users.map((u) => u.id === id ? { ...u, status: "Đang hoạt động", roleId: roleId || u.roleId } : u),
      }),
      reject: (id) => {
        const u = get().users.find((x) => x.id === id);
        if (u?.system) return;
        set({ users: get().users.map((x) => x.id === id ? { ...x, status: "Từ chối" } : x) });
      },
      setStatus: (id, status) => {
        const u = get().users.find((x) => x.id === id);
        if (u?.system && status !== "Đang hoạt động") return;
        set({ users: get().users.map((x) => x.id === id ? { ...x, status } : x) });
      },
      setRole: (id, roleId) => {
        const u = get().users.find((x) => x.id === id);
        if (u?.system) return;
        set({ users: get().users.map((x) => x.id === id ? { ...x, roleId } : x) });
      },
      setUseCustom: (id, useCustom) => {
        const u = get().users.find((x) => x.id === id);
        if (u?.system) return;
        set({ users: get().users.map((x) => x.id === id ? { ...x, useCustom } : x) });
      },
      setCustomPerms: (id, perms) => {
        const u = get().users.find((x) => x.id === id);
        if (u?.system) return;
        set({ users: get().users.map((x) => x.id === id ? { ...x, customPermissions: perms } : x) });
      },
      updateUser: (id, patch) => {
        const u = get().users.find((x) => x.id === id);
        if (u?.system) {
          // disallow changing username/role/status for system Admin
          const { username: _u, roleId: _r, status: _s, system: _sy, ...safe } = patch as any;
          patch = safe;
        }
        set({ users: get().users.map((x) => x.id === id ? { ...x, ...patch } : x) });
      },
      resetPassword: async (id, newPassword) => {
        const { hash, salt } = await hashPassword(newPassword);
        set({ users: get().users.map((x) => x.id === id ? { ...x, passwordHash: hash, passwordSalt: salt } : x) });
      },
      changeOwnPassword: async (oldPwd, newPwd) => {
        const u = get().users.find((x) => x.id === get().currentUserId);
        if (!u) return { ok: false, error: "Chưa đăng nhập." };
        const ok = await verifyPassword(oldPwd, u.passwordHash, u.passwordSalt);
        if (!ok) return { ok: false, error: "Mật khẩu hiện tại không đúng." };
        const { hash, salt } = await hashPassword(newPwd);
        set({ users: get().users.map((x) => x.id === u.id ? { ...x, passwordHash: hash, passwordSalt: salt } : x) });
        return { ok: true };
      },
      removeUser: (id) => {
        const u = get().users.find((x) => x.id === id);
        if (u?.system) return;
        set({ users: get().users.filter((x) => x.id !== id) });
      },
      addRole: (r) => set({ roles: [...get().roles, { ...r, id: "role-" + uid() }] }),
      updateRole: (id, patch) => {
        const r = get().roles.find((x) => x.id === id);
        if (!r) return;
        if (r.system && patch.name) delete (patch as any).name;
        set({ roles: get().roles.map((x) => x.id === id ? { ...x, ...patch } : x) });
      },
      removeRole: (id) => {
        const r = get().roles.find((x) => x.id === id);
        if (!r || r.system) return;
        const used = get().users.some((u) => u.roleId === id);
        if (used) return;
        set({ roles: get().roles.filter((x) => x.id !== id) });
      },
    }),
    {
      name: "base-marketing-auth-v1",
      version: 1,
    }
  )
);

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
  return {
    user: u,
    role: u ? roles.find((r) => r.id === u.roleId) : undefined,
    perms,
    can: (key: PermissionKey) => perms.has(key),
    isSuperAdmin: u?.roleId === SUPER_ADMIN_ID,
  };
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  "Tổng Quan","Task","Thương Hiệu","Dự Án Web","Social","Local","Video","Thiết Kế","Báo Cáo","Cài Đặt",
];

export { SUPER_ADMIN_ID, ADMIN_ROLE_ID };
