// Chỉ chạy phía máy chủ. Gửi thông báo Tiền Về vào nhóm Zalo GMF qua OA Access Token đang quản lý.
// Không gửi số dư / số tài khoản đầy đủ. Không log nội dung giao dịch.
import { getAccessToken, getConfig, baseUrl } from "@/lib/zalo.server";

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

type Res = { ok: boolean; code: number; message: string; ambiguous?: boolean };

const HINTS: Record<number, string> = {
  [-216]: "Access token không hợp lệ — kết nối lại OA",
  [-224]: "OA chưa được cấp quyền dùng tính năng nhóm GMF (cần gói GMF / quyền 'Quản lý nhóm' trên ứng dụng Zalo)",
  [-230]: "OA không có quyền gửi vào nhóm này",
};

export async function postGroup(groupId: string, text: string): Promise<Res> {
  const token = await getAccessToken();
  if (!token) return { ok: false, code: -1, message: "Chưa kết nối Zalo OA" };
  try {
    const res = await fetch("https://openapi.zalo.me/v3.0/oa/group/message", {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: token },
      body: JSON.stringify({ recipient: { group_id: groupId }, message: { text } }),
      signal: AbortSignal.timeout(15000),
    });
    const j: any = await res.json().catch(() => ({}));
    if (j.error === 0) return { ok: true, code: 0, message: "" };
    const code = Number(j.error ?? res.status);
    return { ok: false, code, message: (HINTS[code] ?? String(j.message ?? "Lỗi gửi")).slice(0, 200) };
  } catch {
    return { ok: false, code: -9, message: "Mất kết nối khi gửi — không rõ Zalo đã nhận", ambiguous: true };
  }
}

export async function listGroups(): Promise<{ ok: boolean; message: string; groups: { id: string; name: string }[] }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, message: "Chưa kết nối Zalo OA", groups: [] };
  try {
    const res = await fetch("https://openapi.zalo.me/v3.0/oa/group/getgroupsofoa?offset=0&count=50", { headers: { access_token: token }, signal: AbortSignal.timeout(15000) });
    const j: any = await res.json().catch(() => ({}));
    if (j.error !== 0) {
      const code = Number(j.error ?? res.status);
      return { ok: false, message: `Zalo trả lỗi ${code}: ${HINTS[code] ?? j.message ?? ""}`, groups: [] };
    }
    const arr: any[] = j.data?.groups ?? j.data?.items ?? (Array.isArray(j.data) ? j.data : []);
    return { ok: true, message: "", groups: arr.map((g) => ({ id: String(g.group_id ?? g.id ?? ""), name: String(g.name ?? g.group_name ?? g.group_id ?? "") })).filter((g) => g.id) };
  } catch {
    return { ok: false, message: "Mất kết nối tới Zalo", groups: [] };
  }
}

const vnd = (n: number) => "+" + Number(n).toLocaleString("vi-VN") + "đ";

export type AccInfo = { label: string; bank: string; last4: string };
const last4 = (s: unknown) => { const d = String(s ?? "").replace(/\D/g, ""); return d.length >= 4 ? d.slice(-4) : ""; };

export async function txMessage(t: any, acc: AccInfo) {
  const date = t.transaction_at ? new Date(t.transaction_at) : null;
  const parts = date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh", hourCycle: "h23", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).formatToParts(date) : [];
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const when = parts.length ? `${part("hour")}:${part("minute")} ${part("day")}/${part("month")}/${part("year")}` : (t.transaction_date ?? "—");
  // Chưa có mã tham chiếu được tách/xác minh an toàn trên đường gửi: giữ nguyên CK, không suy đoán tiền tố.
  return [
    "🔔 TIỀN VỀ MỚI", "",
    `💰 ${vnd(t.amount)} · Chưa xác nhận`,
    `🏦 TK: ${(acc.label || acc.bank || "—").toLocaleUpperCase("vi-VN")}${acc.last4 ? ` (****${acc.last4})` : ""}`,
    `🕒 ${when}`, "",
    `📝 CK: ${String(t.description ?? "")}`, "",
    "👉 Check note:", `${await baseUrl()}/finance/incoming/${t.id}`,
  ].join("\n");
}

export async function manualMessage(t: any) {
  const day = t.received_date ? String(t.received_date).split("-").reverse().join("/") : "";
  return [
    "🔔 TIỀN VỀ MỚI", "",
    `💰 ${vnd(t.amount)} · Chưa xác nhận`,
    t.source === "cash" ? "💵 TIỀN MẶT" : "🏦 TK KHÁC",
    `🕒 ${day || "—"}`, "",
    `📝 Ghi chú Kế toán: ${String(t.description ?? "")}`, "",
    "👉 Check note:", `${await baseUrl()}/finance/incoming/${t.id}`,
  ].join("\n");
}

/** Đánh dấu các giao dịch mới cần gửi GMF (theo cài đặt tài khoản) rồi gửi. Lỗi không ảnh hưởng giao dịch. */
export async function queueAndSend(txIds: string[]) {
  if (!txIds.length) return;
  const d = await db();
  const cfg: any = await getConfig();
  if (!cfg?.gmf_enabled || !cfg?.gmf_group_id) return;
  const { data: rows } = await d.from("bank_transactions").select("id, bank_account_id, source").in("id", txIds).eq("gmf_status", "skipped").eq("operation_test", false);
  const { data: accs } = await d.from("bank_accounts").select("id").eq("gmf_notify", true);
  const ok = new Set((accs ?? []).map((a: any) => a.id));
  const ids = (rows ?? []).filter((r: any) => r.source !== "bank" || ok.has(r.bank_account_id)).map((r: any) => r.id);
  if (!ids.length) return;
  await d.from("bank_transactions").update({ gmf_status: "pending" }).in("id", ids).eq("gmf_status", "skipped").eq("gmf_attempts", 0).eq("operation_test", false);
  await sendPending(ids);
}

/** Gửi các giao dịch pending/failed. Giữ chỗ bằng cập nhật có điều kiện → không gửi trùng. */
export async function sendPending(ids?: string[]) {
  const d = await db();
  const cfg: any = await getConfig();
  if (!cfg?.gmf_group_id) return { sent: 0, failed: 0, message: "Chưa chọn nhóm GMF" };
  let q = d.from("bank_transactions").select("id, amount, transaction_at, transaction_date, description, bank_account_id, gmf_status, gmf_attempts, source, received_date, created_by").in("gmf_status", ["pending", "failed"]).eq("operation_test", false).limit(30);
  if (ids) q = q.in("id", ids);
  const { data: rows } = await q;
  const { data: accs } = await d.from("bank_accounts").select("id, bank_name, label, account_number");
  const labels = new Map<string, AccInfo>((accs ?? []).map((a: any) => [a.id, { label: a.label?.trim() || "", bank: a.bank_name, last4: last4(a.account_number) }]));
  let sent = 0, failed = 0, last = "";
  for (const t of rows ?? []) {
    const { data: got } = await d.from("bank_transactions").update({ gmf_status: "sending", gmf_attempts: (t.gmf_attempts ?? 0) + 1 })
      .eq("id", t.id).eq("gmf_status", t.gmf_status).eq("gmf_attempts", t.gmf_attempts).eq("operation_test", false).select("id");
    if (!got?.length) continue;
    const r = await postGroup(cfg.gmf_group_id, t.source !== "bank" ? await manualMessage(t) : await txMessage(t, labels.get(t.bank_account_id) ?? { label: "", bank: "", last4: "" }));
    if (r.ok) sent++; else { failed++; last = `${r.code}: ${r.message}`; }
    await d.from("bank_transactions").update(r.ok
      ? { gmf_status: "sent", gmf_sent_at: new Date().toISOString(), gmf_error: null }
      : { gmf_status: r.ambiguous ? "unknown" : "failed", gmf_error: `${r.code}: ${r.message}` }).eq("id", t.id);
  }
  return { sent, failed, message: last };
}
