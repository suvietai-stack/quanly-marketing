// Chỉ chạy phía máy chủ. Gửi thông báo 3 chức năng tài chính vào nhóm Zalo GMF qua hạ tầng chung (postGroup).
// Ba cấu hình độc lập theo kind; chống gửi trùng bằng dedup_key (trigger) + claim có điều kiện (dispatcher).
// Lỗi Zalo không ảnh hưởng nghiệp vụ tài chính; không retry vô hạn.
import { postGroup } from "@/lib/finance/gmf.server";
import { baseUrl } from "@/lib/zalo.server";
import {
  frGroupMessage, frGroupSummary, frGroupTestMessage, type FrZaloEvent, type FrZaloMsgData,
} from "./zaloGroupMessage";
import type { FrKind, FrStatus } from "./logic";

const MAX_ATTEMPTS = 3;
const FR_PATH: Record<FrKind, string> = { advance: "advance", payment: "payment", salary_advance: "salary" };

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export async function frGroupConfig(kind: FrKind) {
  const d = await db();
  const { data } = await d.from("fr_zalo_group_config").select("*").eq("kind", kind).maybeSingle();
  return data as null | {
    kind: FrKind; group_id: string | null; group_name: string | null; enabled: boolean; intro: string | null;
    on_submitted: boolean; on_info: boolean; on_approved: boolean; on_rejected: boolean;
    on_paid: boolean; on_settled: boolean; on_deducted: boolean; on_done: boolean;
  };
}

/** Sự kiện còn hiệu lực không: bỏ qua nếu đề nghị đã hủy hoặc quay về nháp trước khi gửi. */
function stillValid(event: FrZaloEvent, r: any): boolean {
  if (!r) return false;
  if (r.status === "cancelled") return false;
  if (event === "submitted") return r.status !== "draft";
  if (event === "info") return r.status === "info_requested" || r.status !== "draft";
  if (event === "approved") return ["approved", "awaiting_payment", "paid", "settling", "done"].includes(r.status);
  if (event === "rejected") return r.status === "rejected";
  if (event === "paid") return ["paid", "settling", "done", "awaiting_payment"].includes(r.status) && r.paid_amount > 0;
  if (event === "settled") return r.settled_amount > 0;
  if (event === "deducted") return r.deducted_amount > 0;
  if (event === "done") return r.status === "done";
  return true;
}

/** Xử lý hàng đợi sự kiện nhóm của cả ba chức năng. */
export async function processFrGroup(limit = 10) {
  const d = await db();
  const { data: rows } = await d.from("fr_zalo_group_events")
    .select("id, request_id, kind, event, attempts, group_id").eq("status", "pending").lt("attempts", MAX_ATTEMPTS)
    .order("created_at").limit(limit);
  if (!rows?.length) return { processed: 0 };
  const cfgs: Record<string, any> = {};
  for (const k of ["advance", "payment", "salary_advance"]) cfgs[k] = await frGroupConfig(k as FrKind);
  const link = `${await baseUrl()}/finance`;
  let processed = 0;

  for (const ev of rows) {
    const cfg = cfgs[ev.kind];
    if (!cfg?.enabled || !cfg.group_id) {
      await d.from("fr_zalo_group_events").update({ status: "skipped", error: "Cấu hình đã tắt hoặc đổi nhóm" }).eq("id", ev.id);
      continue;
    }
    // CLAIM nguyên tử: chỉ một tiến trình nhận được bản ghi
    const { data: got } = await d.from("fr_zalo_group_events")
      .update({ attempts: ev.attempts + 1 })
      .eq("id", ev.id).eq("status", "pending").eq("attempts", ev.attempts).select("id");
    if (!got?.length) continue;
    const mark = (patch: Record<string, unknown>) =>
      d.from("fr_zalo_group_events").update(patch).eq("id", ev.id).eq("attempts", ev.attempts + 1);

    const { data: r } = await d.from("fr_requests").select("*").eq("id", ev.request_id).maybeSingle();
    if (!stillValid(ev.event as FrZaloEvent, r)) {
      await mark({ status: "skipped", error: "Đề nghị đã đổi trạng thái trước khi gửi" });
      continue;
    }
    const { data: p } = await d.from("profiles").select("full_name").eq("id", r.requester_id).maybeSingle();
    const { count: linesCount } = await d.from("fr_request_lines")
      .select("id", { count: "exact", head: true }).eq("request_id", r.id);
    const msgData: FrZaloMsgData = {
      kind: r.kind, code: r.code, title: r.title, amount: Number(r.amount),
      requester_name: p?.full_name ?? null, status: r.status as FrStatus,
      lines_count: linesCount ?? 0, paid_amount: Number(r.paid_amount ?? 0),
    };
    const url = `${link}/${FR_PATH[r.kind as FrKind]}?open=${r.id}`;
    const res = await postGroup(ev.group_id ?? cfg.group_id, frGroupMessage(ev.event as FrZaloEvent, msgData, url, cfg.intro));
    processed++;
    await mark({
      summary: frGroupSummary(ev.event as FrZaloEvent, msgData),
      ...(res.ok
        ? { status: "sent", sent_at: new Date().toISOString(), error: null }
        : res.ambiguous
          ? { status: "unknown", error: `${res.code}: ${res.message}` }
          : { status: "failed", error: `${res.code}: ${res.message}` }),
    });
  }
  return { processed };
}

/** Tin kiểm tra nhóm của một chức năng — không chứa dữ liệu đề nghị thật. */
export async function sendFrGroupTest(kind: FrKind) {
  const cfg = await frGroupConfig(kind);
  if (!cfg?.group_id) return { ok: false, message: "Chưa chọn nhóm Zalo nhận thông báo" };
  const { brandHeader } = await import("@/lib/zalo.server");
  const t = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
  const r = await postGroup(cfg.group_id, frGroupTestMessage(kind, await brandHeader(), t));
  return r.ok ? { ok: true, message: "Zalo đã nhận yêu cầu gửi — kiểm tra nhóm" } : { ok: false, message: `Không gửi được (${r.code}: ${r.message})` };
}

/** Gửi lại một sự kiện lỗi/không rõ — đặt về pending rồi xử lý ngay (claim chống trùng vẫn áp dụng). */
export async function retryFrGroupEvent(id: string) {
  const d = await db();
  const { data } = await d.from("fr_zalo_group_events")
    .update({ status: "pending", attempts: 0, error: null })
    .eq("id", id).in("status", ["failed", "unknown"]).select("id");
  if (!data?.length) return { ok: false, message: "Sự kiện không ở trạng thái cần gửi lại" };
  await processFrGroup(5);
  const { data: ev } = await d.from("fr_zalo_group_events").select("status, error").eq("id", id).maybeSingle();
  if (ev?.status === "sent") return { ok: true, message: "Đã gửi lại thành công" };
  if (ev?.status === "skipped") return { ok: false, message: "Đề nghị đã đổi trạng thái — không gửi lại tin cũ" };
  return { ok: false, message: ev?.error ? `Chưa gửi được: ${ev.error}` : "Chưa gửi được — thử lại sau" };
}
