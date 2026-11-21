const flowName = (p) => p.both ? "Hỏi Giá + Hỏi Tiến Độ" : p.flow === "progress" ? "Hỏi Tiến Độ" : "Hỏi Giá";
const OQ_LABEL = {
  oq_new: "Bạn nhận yêu cầu hỏi giá/tiến độ mới.",
  oq_accepted: "Cung ứng đã xác nhận tiếp nhận yêu cầu của bạn.",
  oq_info: "Cung ứng cần bạn bổ sung thông tin.",
  oq_answered: "Sale đã bổ sung thông tin cho yêu cầu bạn phụ trách.",
  oq_published: "Có kết quả mới cho yêu cầu của bạn.",
  oq_done: "Yêu cầu của bạn đã được trả lời đầy đủ.",
  oq_reask: "Sale gửi yêu cầu hỏi lại.",
  oq_assigned: "Bạn được giao phụ trách một yêu cầu hỏi giá/tiến độ."
};
function oqText(kind, p) {
  const done = kind === "oq_done" ? p.flow === "progress" ? "Đã phản hồi tiến độ" : "Đã báo giá" : null;
  return [done ? `${flowName(p)}: ${done}` : OQ_LABEL[kind], p.code ? `Mã: ${p.code}` : null, p.title ? `Yêu cầu: ${p.title}` : null, `Luồng: ${flowName(p)}`].filter(Boolean).join("\n");
}
function oqZaloMessage(kind, p, brand = "BASE") {
  const button = ["oq_new", "oq_reask", "oq_assigned", "oq_answered"].includes(kind) ? "MỞ VÀ XỬ LÝ" : kind === "oq_info" ? "MỞ VÀ BỔ SUNG" : "XEM KẾT QUẢ";
  return { header: `📦 ${brand}`, button, text: oqText(kind, p) };
}
function oqPushMessage(kind, p, brand = "BASE") {
  return { title: brand, body: `${oqText(kind, p)}
Nhấn để mở.` };
}
const oqLink = (requestId, flowId) => `/order-quotes/${encodeURIComponent(requestId)}${flowId ? `?flow=${encodeURIComponent(flowId)}` : ""}`;
function oqStillValid(kind, recipient, flow, req, payload, siblings) {
  if (!req || req.status === "cancelled") return false;
  if (kind === "oq_new" && payload?.both && siblings?.length) return siblings.some((f) => f.assignee_id === recipient && f.status === "pending");
  if (!flow || flow.status === "cancelled") return false;
  if (kind === "oq_new" || kind === "oq_reask" || kind === "oq_assigned") return flow.assignee_id === recipient && flow.status === "pending";
  if (kind === "oq_answered") return flow.assignee_id === recipient;
  if (kind === "oq_info") return req.creator_id === recipient && flow.waiting_info;
  return req.creator_id === recipient;
}
export {
  OQ_LABEL,
  oqLink,
  oqPushMessage,
  oqStillValid,
  oqText,
  oqZaloMessage
};
