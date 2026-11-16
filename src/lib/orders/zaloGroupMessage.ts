import type { DesignFlow } from "./design";
export const DESIGN_ZALO_EVENTS = {
 created:"Job mới được giao",transferred:"Chuyển người thực hiện",taken:"Đã nhận việc",
 submitted:"Gửi duyệt",changes:"Yêu cầu sửa",approved:"Đã duyệt",
 delivered:"Đã bàn giao",completed:"Hoàn thành",cancelled:"Đã hủy",
} as const;
export type DesignZaloEvent = keyof typeof DESIGN_ZALO_EVENTS;
export const FLOW_LABEL: Record<DesignFlow,string> = {
 photo:"Chụp ảnh",marketing_design:"Ấn phẩm Marketing",order_mockup:"Ma-két đơn hàng"
};
export type DesignGroupSnapshot = {
 title?:string; requester?:string;assignee?:string;old_assignee?:string;reviewer?:string;deadline?:string;status?:string
};
const limit=(v?:string)=>String(v??"").trim().slice(0,150);
export function designGroupMessage(flow:DesignFlow,event:DesignZaloEvent,s:DesignGroupSnapshot,link:string){
 const deadline=s.deadline && /^\d{4}-\d{2}-\d{2}$/.test(s.deadline) ? s.deadline.split("-").reverse().join("/") : "—";
 return [
 "🎨 THÔNG BÁO THIẾT KẾ · "+FLOW_LABEL[flow],
 DESIGN_ZALO_EVENTS[event].toLocaleUpperCase("vi-VN"),"",
 "📌 Job: "+limit(s.title),
 "👤 Người yêu cầu: "+limit(s.requester),
 ...(event==="transferred"?["🔁 Chuyển từ: "+limit(s.old_assignee)]:[]),
 "🎨 Người thực hiện: "+limit(s.assignee),
 "✅ Người duyệt: "+limit(s.reviewer),
 "📅 Deadline: "+deadline,
 "📍 Trạng thái: "+limit(s.status),"",
 "👉 Xem Job trên Base: "+link
 ].join("\n");
}
