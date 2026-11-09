import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
async function rpc<T = any>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export type SwConfig = { display_name: string; url: string | null; description: string | null; enabled: boolean };
export type SwMyCredential = { username: string; status: "active" | "locked"; updated_at: string } | null;
export type SwStaffRow = {
  user_id: string; full_name: string | null; base_username: string | null; position: string | null;
  sw_username: string | null; sw_status: "active" | "locked" | null; granted: boolean;
};
export type SwAuditRow = { id: string; action: string; created_at: string; actor_name: string | null; target_name: string | null };

export const SW_ACTION_LABEL: Record<string, string> = {
  config: "Cập nhật cấu hình", grant: "Cấp tài khoản", update: "Đổi tên tài khoản",
  reset_password: "Thay thế mật khẩu", lock: "Tạm khóa", unlock: "Mở khóa",
  revoke: "Thu hồi thông tin truy cập", view_password: "Nhân viên xem mật khẩu của mình",
};

export const swApi = {
  config: () => rpc<SwConfig | null>("sw_config"),
  saveConfig: (displayName: string, url: string, description: string, enabled: boolean) =>
    rpc("sw_config_save", { _display_name: displayName, _url: url, _description: description, _enabled: enabled }),
  myCredential: () => rpc<SwMyCredential>("sw_my_credential"),
  // Mật khẩu chỉ tồn tại trong bộ nhớ phiên hiện tại — không lưu storage, không cache query.
  revealPassword: () => rpc<string>("sw_reveal_password"),
  staffList: (q: string) => rpc<SwStaffRow[]>("sw_staff_list", { _q: q }),
  saveCredential: (userId: string, username: string, password: string, status: "active" | "locked") =>
    rpc("sw_credential_save", { _user_id: userId, _username: username, _password: password, _status: status }),
  revokeCredential: (userId: string) => rpc("sw_credential_revoke", { _user_id: userId }),
  audit: () => rpc<SwAuditRow[]>("sw_audit", { _limit: 200 }),
};
