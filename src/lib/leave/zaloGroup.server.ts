// Chỉ chạy phía máy chủ. Gửi thông báo Đơn từ vào nhóm Zalo Nhân sự qua hạ tầng GMF chung (postGroup).
// Độc lập cấu hình với nhóm Tiền Về. Chống gửi trùng bằng dedup_key (trigger) + claim có điều kiện (dispatcher).
import { postGroup } from "@/lib/finance/gmf.server";
import { baseUrl } from "@/lib/zalo.server";
import { groupMessage, groupSummary, type GroupEvent, type GroupMsgData } from "./zaloGroupMessage";

const MAX_ATTEMPTS = 3;

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export async function leaveGroupConfig() {
  const d = await db();
  const { data } = await d.from("leave_zalo_group_config").select("*").eq("id", 1).maybeSingle();
  return data as null | {
    group_id: string | null; group_name: string | null; enabled: boolean;
    on_new: boolean; on_reassign: boolean; on_approved: boolean; on_rejected: boolean;
  };
}

/** Bộ phận hiện tại của nhân viên (cơ cấu Quản trị Kinh doanh) — thiếu thì bỏ dòng, không chặn gửi. */
async function departmentOf(userId: string): Promise<string | null> {
  try {
    const d = await db();
    const { data: m } = await d.from("biz_department_members").select("department_id")
      .eq("user_id", userId).is("ended_at", null).order("effective_from", { ascending: false }).limit(1).maybeSingle();
    if (!m?.department_id) return null;
    const { data: dep } = await d.from("biz_departments").select("name").eq("id", m.department_id).maybeSingle();
    return dep?.name ?? null;
  } catch { return null; }
}

/** Sự kiện còn hiệu lực không: đơn mới/chuyển duyệt chỉ gửi khi đơn còn chờ duyệt; kết quả chỉ khi trạng thái còn đúng. */
function stillValid(event: GroupEvent, r: any): boolean {
  if (!r) return false;
  if (event === "new" || event === "reassign") return r.status === "pending";
  if (event === "approved") return r.status === "approved" || r.status === "cancelled";
  return r.status === "rejected";
}

/** Xử lý hàng đợi sự kiện nhóm Nhân sự. Lỗi Zalo không ảnh hưởng đơn; không retry vô hạn. */
export async function processLeaveGroup(limit = 10) {
  const cfg = await leaveGroupConfig();
  if (!cfg?.enabled || !cfg.group_id) return { processed: 0, skipped: "disabled" };
  const d = await db();
  const { data: rows } = await d.from("leave_zalo_group_events")
    .select("id, request_id, event, attempts").eq("status", "pending").lt("attempts", MAX_ATTEMPTS)
    .order("created_at").limit(limit);
  let processed = 0;
  for (const ev of rows ?? []) {
    // CLAIM nguyên tử: chỉ một tiến trình nhận được bản ghi
    const { data: got } = await d.from("leave_zalo_group_events")
      .update({ attempts: ev.attempts + 1 })
      .eq("id", ev.id).eq("status", "pending").eq("attempts", ev.attempts).select("id");
    if (!got?.length) continue;
    const mark = (patch: Record<string, unknown>) =>
      d.from("leave_zalo_group_events").update(patch).eq("id", ev.id).eq("attempts", ev.attempts + 1);

    const { data: r } = await d.from("leave_requests").select("*").eq("id", ev.request_id).maybeSingle();
    if (!stillValid(ev.event as GroupEvent, r)) {
      await mark({ status: "skipped", error: "Đơn đã được xử lý/đổi trạng thái trước khi gửi" });
      continue;
    }
    const ids = [r.owner_id, r.approver_id, r.decided_by].filter(Boolean);
    const { data: names } = await d.from("profiles").select("id, full_name").in("id", ids);
    const nm = (id: string | null) => (names ?? []).find((x: any) => x.id === id)?.full_name ?? null;
    // Người duyệt cũ cho tin chuyển duyệt: lấy từ lịch sử sự kiện đơn
    let oldApprover: string | null = null;
    if (ev.event === "reassign") {
      const { data: log } = await d.from("leave_request_events").select("detail")
        .eq("request_id", r.id).eq("action", "reassign").order("created_at", { ascending: false }).limit(1).maybeSingle();
      const oldId = log?.detail?.from ?? log?.detail?.old_approver ?? null;
      if (oldId) {
        const { data: p } = await d.from("profiles").select("full_name").eq("id", oldId).maybeSingle();
        oldApprover = p?.full_name ?? null;
      }
    }
    const msgData: GroupMsgData = {
      type: r.type, payload: r.payload, calc: r.calc, is_late: !!r.is_late,
      owner_name: nm(r.owner_id) ?? "Nhân viên",
      department: await departmentOf(r.owner_id),
      approver_name: nm(r.approver_id), old_approver_name: oldApprover, decided_by_name: nm(r.decided_by),
      submitted_at: r.submitted_at,
    };
    const link = `${await baseUrl()}/leave?open=${r.id}`;
    const res = await postGroup(cfg.group_id, groupMessage(ev.event as GroupEvent, msgData, link));
    processed++;
    await mark({
      summary: groupSummary(msgData),
      ...(res.ok
        ? { status: "sent", sent_at: new Date().toISOString(), error: null }
        : res.ambiguous
          ? { status: "unknown", error: `${res.code}: ${res.message}` }
          : { status: "failed", error: `${res.code}: ${res.message}` }),
    });
  }
  return { processed };
}

/** Tin kiểm tra nhóm Nhân sự — không chứa dữ liệu đơn thật. */
export async function sendLeaveGroupTest() {
  const cfg = await leaveGroupConfig();
  if (!cfg?.group_id) return { ok: false, message: "Chưa chọn nhóm Zalo Nhân sự" };
  const { brandHeader } = await import("@/lib/zalo.server");
  const t = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
  const r = await postGroup(cfg.group_id,
    `🧪 ${await brandHeader()} — TIN KIỂM THỬ NHÓM NHÂN SỰ\nĐây là tin kiểm tra kết nối nhóm nhận thông báo Nghỉ phép & Đi sớm muộn, không chứa dữ liệu đơn.\nThời gian: ${t}`);
  return r.ok ? { ok: true, message: "Zalo đã nhận yêu cầu gửi — kiểm tra nhóm" } : { ok: false, message: `Không gửi được (${r.code}: ${r.message})` };
}

/** Gửi lại một sự kiện lỗi/không rõ — đặt về pending rồi xử lý ngay (claim chống trùng vẫn áp dụng). */
export async function retryLeaveGroupEvent(id: string) {
  const d = await db();
  const { data } = await d.from("leave_zalo_group_events")
    .update({ status: "pending", attempts: 0, error: null })
    .eq("id", id).in("status", ["failed", "unknown"]).select("id");
  if (!data?.length) return { ok: false, message: "Sự kiện không ở trạng thái cần gửi lại" };
  await processLeaveGroup(5);
  const { data: ev } = await d.from("leave_zalo_group_events").select("status, error").eq("id", id).maybeSingle();
  if (ev?.status === "sent") return { ok: true, message: "Đã gửi lại thành công" };
  if (ev?.status === "skipped") return { ok: false, message: "Đơn đã được xử lý — không gửi lại tin cũ" };
  return { ok: false, message: ev?.error ? `Chưa gửi được: ${ev.error}` : "Chưa gửi được — thử lại sau" };
}
