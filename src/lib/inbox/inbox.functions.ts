import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { InboxOverview, Conversation, InboxThread, InboxStaff } from "./model";

const page = z.string().regex(/^\d{1,40}$/);
export const inboxOverview = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<InboxOverview> => {
  const { data, error } = await context.supabase.rpc("inbox_overview" as never);
  if (error?.code === "PGRST202" || error?.code === "42883") return { available: false, can_view: false, can_send: false, can_assign: false, can_resolve: false, can_manage: false, pages: [] };
  if (error) throw new Error("Không tải được Hộp thư; vui lòng thử lại");
  return data as unknown as InboxOverview;
});
export const inboxRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ kind: z.enum(["list", "thread", "staff"]), pageId: page.optional(), conversationId: z.string().uuid().optional(), filter: z.enum(["all", "unread", "reply", "resolved"]).default("all"), before: z.string().datetime().optional(), beforeId: z.string().uuid().optional() }).parse(d)).handler(async ({ context, data }) => {
  const name = data.kind === "list" ? "inbox_list" : data.kind === "thread" ? "inbox_thread" : "inbox_staff";
  if (data.kind === "thread" && !data.conversationId || data.kind === "staff" && !data.pageId) throw new Error("Thiếu hội thoại hoặc Page");
  const args = data.kind === "list" ? { p_page: data.pageId ?? null, p_filter: data.filter, p_before: data.before ?? null, p_id: data.beforeId ?? null } : data.kind === "thread" ? { p_conversation: data.conversationId, p_before: data.before ?? null, p_id: data.beforeId ?? null } : { p_page: data.pageId };
  const { data: result, error } = await context.supabase.rpc(name as never, args as never);
  if (error) throw new Error("Không đọc được Hộp thư; kiểm tra quyền Page và thử lại");
  return result as unknown as Conversation[] | InboxThread | InboxStaff[];
});
export const inboxChange = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ conversationId: z.string().uuid(), action: z.enum(["read", "assign", "resolve", "reopen"]), userId: z.string().uuid().nullable().optional(), version: z.number().int().positive().optional() }).parse(d)).handler(async ({ context, data }) => {
  const { error } = await context.supabase.rpc("inbox_change" as never, { p_conversation: data.conversationId, p_action: data.action, p_user: data.userId ?? null, p_version: data.version ?? null } as never);
  if (error) throw new Error("Không thể cập nhật; quyền hoặc hội thoại đã thay đổi. Hãy tải lại.");
  return { ok: true };
});
export const inboxAccessSave = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ pageId: page, userId: z.string().uuid(), enabled: z.boolean() }).parse(d)).handler(async ({ context, data }) => {
  const { error } = await context.supabase.rpc("inbox_access_save" as never, { p_page: data.pageId, p_user: data.userId, p_enabled: data.enabled } as never);
  if (error) throw new Error("Không có quyền thay đổi truy cập Page");
  return { ok: true };
});
export const inboxSend = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ conversationId: z.string().uuid(), requestId: z.string().uuid(), text: z.string().trim().min(1).max(2000) }).parse(d)).handler(async ({ context, data }) => {
  // Module and per-Page access are checked atomically by this RPC.
  const claim = await context.supabase.rpc("inbox_send_claim" as never, { p_conversation: data.conversationId, p_request: data.requestId, p_text: data.text } as never);
  if (claim.error) throw new Error("Không thể gửi: kiểm tra quyền Page, token và cửa sổ 24 giờ");
  const row = claim.data as unknown as { claimed: boolean; page_id: string; customer_id: string; state: string };
  if (!row.claimed) return { state: row.state === "sending" ? "unknown" : row.state };
  const { sendText } = await import("./inbox.server");
  const result = await sendText(row.page_id, row.customer_id, data.text, data.requestId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const finish = await supabaseAdmin.rpc("inbox_send_finish" as never, { p_request: data.requestId, p_mid: result.mid, p_state: result.state, p_failure: result.failure } as never);
  if (finish.error) return { state: "unknown" };
  return { state: result.state };
});
