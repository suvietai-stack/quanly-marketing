/** Mẫu thông báo Hỏi Giá & Tiến Độ (Base/Zalo/Web Push) — hàm thuần, không đưa giá/nội dung báo giá lên kênh ngoài. */
export const OQ_KINDS = ["oq_new", "oq_accepted", "oq_info", "oq_answered", "oq_published", "oq_done", "oq_reask", "oq_assigned"] as const;
export type OqKind = (typeof OQ_KINDS)[number];
export type OqPayload = { request_id?: string; code?: string; title?: string; flow?: "price" | "progress"; both?: boolean; round?: number };

const flowName = (p: OqPayload) => (p.both ? "Hỏi Giá + Hỏi Tiến Độ" : p.flow === "progress" ? "Hỏi Tiến Độ" : "Hỏi Giá");

export const OQ_LABEL: Record<OqKind, string> = {
  oq_new: "Bạn nhận yêu cầu hỏi giá/tiến độ mới.",
  oq_accepted: "Cung ứng đã xác nhận tiếp nhận yêu cầu của bạn.",
  oq_info: "Cung ứng cần bạn bổ sung thông tin.",
  oq_answered: "Sale đã bổ sung thông tin cho yêu cầu bạn phụ trách.",
  oq_published: "Có kết quả mới cho yêu cầu của bạn.",
  oq_done: "Yêu cầu của bạn đã được trả lời đầy đủ.",
  oq_reask: "Sale gửi yêu cầu hỏi lại.",
  oq_assigned: "Bạn được giao phụ trách một yêu cầu hỏi giá/tiến độ.",
};

export function oqText(kind: OqKind, p: OqPayload) {
  const done = kind === "oq_done" ? (p.flow === "progress" ? "Đã phản hồi tiến độ" : "Đã báo giá") : null;
  return [done ? `${flowName(p)}: ${done}` : OQ_LABEL[kind], p.code ? `Mã: ${p.code}` : null, p.title ? `Yêu cầu: ${p.title}` : null, `Luồng: ${flowName(p)}`]
    .filter(Boolean).join("\n");
}

export function oqZaloMessage(kind: OqKind, p: OqPayload, brand = "BASE") {
  const button = ["oq_new", "oq_reask", "oq_assigned", "oq_answered"].includes(kind) ? "MỞ VÀ XỬ LÝ" : kind === "oq_info" ? "MỞ VÀ BỔ SUNG" : "XEM KẾT QUẢ";
  return { header: `📦 ${brand}`, button, text: oqText(kind, p) };
}
export function oqPushMessage(kind: OqKind, p: OqPayload, brand = "BASE") {
  return { title: brand, body: `${oqText(kind, p)}\nNhấn để mở.` };
}

export const oqLink = (requestId: string, flowId?: string | null) =>
  `/order-quotes/${encodeURIComponent(requestId)}${flowId ? `?flow=${encodeURIComponent(flowId)}` : ""}`;

/** Người nhận còn hợp lệ? recipient = Cung ứng (tin cần xử lý) hoặc người tạo (tin kết quả). */
type FlowLite = { assignee_id: string; status: string; waiting_info: boolean };
/** Tin gộp (payload.both) xét mọi luồng của yêu cầu: còn luồng nào người nhận phải tiếp nhận thì tin vẫn hợp lệ. */
export function oqStillValid(kind: OqKind, recipient: string, flow: FlowLite | null, req: { creator_id: string; status: string } | null, payload?: OqPayload | null, siblings?: FlowLite[]) {
  if (!req || req.status === "cancelled") return false;
  if (kind === "oq_new" && payload?.both && siblings?.length) return siblings.some((f) => f.assignee_id === recipient && f.status === "pending");
  if (!flow || flow.status === "cancelled") return false;
  if (kind === "oq_new" || kind === "oq_reask" || kind === "oq_assigned") return flow.assignee_id === recipient && flow.status === "pending";
  if (kind === "oq_answered") return flow.assignee_id === recipient;
  if (kind === "oq_info") return req.creator_id === recipient && flow.waiting_info;
  return req.creator_id === recipient;
}
