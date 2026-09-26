/** Mẫu tin Zalo cho Tín hiệu — dùng chung cho luồng gửi thật và gửi thử. Không chứa SĐT/địa chỉ/nhật ký. */
import { STATUS_LABEL, type SignalStatus } from "./catalog";

export type SignalMsgData = {
  customer_name?: string | null; products?: string[] | null; need_groups?: string[] | null; need_group?: string | null;
  source?: string | null; detected_on?: string | null; created_at?: string | null; status?: string | null;
};

const list = (a?: (string | null)[] | null) => (a ?? []).map((x) => (x ?? "").trim()).filter(Boolean).join(", ");
const line = (icon: string, label: string, v?: string | null) => (v && v.trim() ? `${icon} ${label}: ${v.trim()}` : null);
const vnDate = (d?: string | null) => {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
};

export function signalMessage(kind: "signal_new" | "signal_assigned", s: SignalMsgData) {
  const needs = list(s.need_groups?.length ? s.need_groups : s.need_group ? [s.need_group] : []);
  const common = [
    line("🏢", "Khách hàng", s.customer_name), line("📦", "Sản phẩm", list(s.products)),
    line("🎯", "Nhu cầu", needs), line("🌐", "Nguồn", s.source),
  ];
  if (kind === "signal_new") {
    return {
      header: "🔔 BASE MARKETING",
      button: "XEM VÀ PHÂN CÔNG",
      text: ["TÍN HIỆU MỚI CẦN PHÂN CÔNG", "", ...common, line("📅", "Ngày tạo", vnDate(s.detected_on ?? s.created_at)), "👤 Phụ trách: Chưa phân công"]
        .filter((x) => x !== null).join("\n"),
    };
  }
  const st = s.status ? STATUS_LABEL[s.status as SignalStatus] ?? null : null;
  return {
    header: "🎯 BASE MARKETING",
    button: "XEM VÀ TIẾP NHẬN",
    text: ["BẠN ĐƯỢC GIAO TÍN HIỆU MỚI", "", ...common, line("📌", "Trạng thái", st)].filter((x) => x !== null).join("\n"),
  };
}
