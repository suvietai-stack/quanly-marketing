/** Mẫu thông báo Order Thiết kế (Zalo + Web Push) — hàm thuần. Không đưa ghi chú chỉnh sửa lên Zalo. */
export const ORDER_KINDS = ["order_new", "order_assigned", "order_taken", "order_review", "order_revise", "order_approved", "order_delivered", "order_remind"] as const;
export type OrderKind = (typeof ORDER_KINDS)[number];

export type OrderMsgData = {
  title?: string | null; brand?: string | null; requester?: string | null; assignee?: string | null; reviewer?: string | null;
  deadline?: string | null; priority?: string | null; actor?: string | null; status?: string | null;
};

const vnDate = (d?: string | null) => { const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null; return m ? `${m[3]}/${m[2]}/${m[1]}` : null; };
const line = (label: string, v?: string | null) => (v && String(v).trim() ? `${label}: ${String(v).trim()}` : null);
const join = (a: (string | null)[]) => a.filter((x) => x !== null).join("\n");

export function orderZaloMessage(kind: OrderKind, d: OrderMsgData, brand = "BASE MARKETING") {
  const order = line("Order", d.title);
  switch (kind) {
    case "order_new":
      return { header: `🆕 ${brand}`, button: "XEM VÀ PHÂN CÔNG", text: join(["ORDER THIẾT KẾ MỚI CHƯA PHÂN CÔNG", "", order, line("Dự án", d.brand), line("Người yêu cầu", d.requester), line("Hạn hoàn thành", vnDate(d.deadline))]) };
    case "order_assigned":
      return { header: `🎨 ${brand}`, button: "XEM VÀ NHẬN VIỆC", text: join(["BẠN ĐƯỢC GIAO THIẾT KẾ MỚI", "", order, line("Dự án", d.brand), line("Người yêu cầu", d.requester), line("Hạn hoàn thành", vnDate(d.deadline)), line("Mức ưu tiên", d.priority)]) };
    case "order_taken":
      return { header: `👍 ${brand}`, button: "XEM ORDER", text: join(["NHÂN VIÊN ĐÃ NHẬN VIỆC THIẾT KẾ", "", order, line("Người thiết kế", d.assignee)]) };
    case "order_review":
      return { header: `📋 ${brand}`, button: "XEM VÀ PHÊ DUYỆT", text: join(["THIẾT KẾ CHỜ PHÊ DUYỆT", "", order, line("Dự án", d.brand), line("Người thiết kế", d.assignee)]) };
    case "order_revise":
      return { header: `🔄 ${brand}`, button: "XEM YÊU CẦU CHỈNH SỬA", text: join(["THIẾT KẾ CẦN CHỈNH SỬA", "", order, line("Người yêu cầu sửa", d.actor)]) };
    case "order_approved":
      return { header: `✅ ${brand}`, button: "XEM ORDER", text: join(["THIẾT KẾ ĐÃ ĐƯỢC DUYỆT", "", order, line("Dự án", d.brand)]) };
    case "order_delivered":
      return { header: `📦 ${brand}`, button: "XEM FILE VÀ XÁC NHẬN", text: join(["CÓ THIẾT KẾ ĐƯỢC BÀN GIAO", "", order, line("Người thiết kế", d.assignee), "Trạng thái: Đã bàn giao"]) };
    case "order_remind":
      return { header: `⏰ ${brand}`, button: "XEM ORDER", text: join(["NHẮC: ORDER THIẾT KẾ ĐANG CHỜ BẠN", "", order, line("Trạng thái", d.status)]) };
  }
}

export const ORDER_LABEL: Record<OrderKind, string> = {
  order_new: "Có order thiết kế mới chưa phân công.",
  order_assigned: "Bạn được giao thiết kế mới.",
  order_taken: "Nhân viên đã nhận việc thiết kế của bạn.",
  order_review: "Có thiết kế chờ bạn phê duyệt.",
  order_revise: "Thiết kế của bạn cần chỉnh sửa.",
  order_approved: "Thiết kế của bạn đã được duyệt.",
  order_delivered: "Có thiết kế được bàn giao, cần xác nhận.",
  order_remind: "Nhắc việc: có order thiết kế đang chờ bạn.",
};

export function orderPushMessage(kind: OrderKind, d: OrderMsgData, brand = "BASE") {
  return { title: brand, body: join([ORDER_LABEL[kind], line("Order", d.title), "Nhấn để mở order."]) };
}

/** Còn hợp lệ: order phải còn đúng trạng thái đã phát sinh sự kiện (với sự kiện cần người nhận xử lý). */
export function orderStillValid(kind: OrderKind, payloadStatus: string | null | undefined, cur: { status?: string | null; assignee?: string | null } | null, payloadAssignee?: string | null) {
  if (!cur?.status || cur.status === "Đã hủy") return false;
  if (kind === "order_assigned") return cur.assignee === payloadAssignee && cur.status !== "Hoàn thành";
  if (kind === "order_new") return cur.status === "Chờ phân công" && !cur.assignee;
  if (["order_review", "order_revise", "order_delivered", "order_remind"].includes(kind)) return cur.status === payloadStatus;
  return true;
}

export const orderLink = (id: string) => `/orders?open=${encodeURIComponent(id)}`;
