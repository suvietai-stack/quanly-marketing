/** Giải trình chấm công — hàm thuần (kiểm tra nhập liệu, nhãn, dựng tin Zalo, báo cáo). Backend (att_*) kiểm tra lại. */
import { fmtDate, todayVn } from "./calc";

export type AttKind = "in" | "out" | "both";
export type WitnessStatus = "pending" | "confirmed" | "unable";
export interface AttReason { id: string; name: string; active: boolean }
export interface AttExplanation {
  id: string; owner_id: string; work_date: string; kind: AttKind; time_in: string | null; time_out: string | null;
  reason_id: string; reason_name: string; detail: string | null; witness_id: string;
  witness_status: WitnessStatus; witness_at: string | null; witness_note: string | null;
  reconciled: boolean; reconciled_by: string | null; reconciled_at: string | null; reconcile_note: string | null;
  recalled: boolean; recalled_at: string | null; submitted_at: string; created_at: string; updated_at: string;
}
export interface AttInput { work_date: string; kind: AttKind; time_in: string; time_out: string; reason_id: string; detail: string; witness_id: string }

export const ATT_TYPE_LABEL = "Giải trình Chấm Công";
export const KIND_LABEL: Record<AttKind, string> = { in: "Quên chấm công vào", out: "Quên chấm công ra", both: "Quên cả hai" };
export const WITNESS_LABEL: Record<WitnessStatus, string> = { pending: "Chờ xác nhận", confirmed: "Đã xác nhận", unable: "Không thể xác nhận" };
export const DEFAULT_ATT_REASONS: AttReason[] = [
  { id: "forgot", name: "Quên thao tác", active: true },
  { id: "device", name: "Thiết bị chấm công gặp sự cố", active: true },
  { id: "network", name: "Sự cố kết nối", active: true },
  { id: "outside", name: "Công tác bên ngoài", active: true },
  { id: "other", name: "Lý do khác", active: true },
];
export const ATT_NOTE = "Giải trình được ghi nhận ngay sau khi gửi và chuyển đến bộ phận phụ trách đối chiếu. Việc gửi giải trình không đồng nghĩa với việc thời gian khai báo đã được xác minh.";

const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
export function validateAtt(f: Partial<AttInput>, ownerId: string, today = todayVn()): string | null {
  if (!f.work_date) return "Vui lòng chọn ngày quên chấm công.";
  if (f.work_date > today) return "Ngày quên chấm công không được ở tương lai.";
  if (!f.kind || !(f.kind in KIND_LABEL)) return "Vui lòng chọn nội dung giải trình.";
  if (f.kind !== "out" && !HM.test(f.time_in || "")) return "Vui lòng nhập Giờ vào hợp lệ.";
  if (f.kind !== "in" && !HM.test(f.time_out || "")) return "Vui lòng nhập Giờ ra hợp lệ.";
  if (f.kind === "both" && f.time_out! <= f.time_in!) return "Giờ ra phải sau Giờ vào.";
  if (!f.reason_id) return "Vui lòng chọn lý do.";
  if (f.reason_id === "other" && !f.detail?.trim()) return "Chọn Lý do khác thì bắt buộc nhập chi tiết giải trình.";
  if (!f.witness_id) return "Vui lòng chọn người làm chứng.";
  if (f.witness_id === ownerId) return "Không thể tự làm chứng cho chính mình.";
  return null;
}

export function declaredTime(a: Pick<AttExplanation, "kind" | "time_in" | "time_out">): string {
  if (a.kind === "in") return `Vào ${a.time_in ?? "—"}`;
  if (a.kind === "out") return `Ra ${a.time_out ?? "—"}`;
  return `Vào ${a.time_in ?? "—"} · Ra ${a.time_out ?? "—"}`;
}
function declaredShort(a: Pick<AttExplanation, "kind" | "time_in" | "time_out">): string {
  if (a.kind === "in") return a.time_in ?? "";
  if (a.kind === "out") return a.time_out ?? "";
  return `vào ${a.time_in ?? ""} – ra ${a.time_out ?? ""}`;
}

/** Tin Zalo — không bao giờ chứa phần chi tiết giải trình. */
export function attMessage(kind: "att_witness" | "att_new", d: { owner_name?: string | null; witness_name?: string | null; work_date: string; kind: AttKind; time_in: string | null; time_out: string | null; reconciled?: boolean; action?: string }, brand = "BASE MARKETING") {
  const base = [
    d.owner_name ? `Nhân viên: ${d.owner_name}` : "",
    `Ngày: ${fmtDate(d.work_date)}`,
    `Nội dung: ${KIND_LABEL[d.kind]}`,
    `Giờ tự khai báo: ${declaredShort(d)}`,
  ];
  if (kind === "att_witness") {
    const again = d.action === "edit";
    return { header: `📋 ${brand} — ${again ? "YÊU CẦU XÁC NHẬN LẠI LÀM CHỨNG" : "YÊU CẦU XÁC NHẬN LÀM CHỨNG"}`, text: [...base, again ? "Giải trình đã được sửa, vui lòng xác nhận lại." : "Bạn được chọn làm người làm chứng."].filter(Boolean).join("\n"), button: "XEM VÀ XÁC NHẬN" };
  }
  return { header: `📋 ${brand} — GIẢI TRÌNH CHẤM CÔNG MỚI`, text: [...base, d.witness_name ? `Người làm chứng: ${d.witness_name}` : "", `Trạng thái: ${d.reconciled ? "Đã đối chiếu" : "Chưa đối chiếu"}`].filter(Boolean).join("\n"), button: "XEM GIẢI TRÌNH" };
}

export interface AttReportRow { owner_id: string; total: number; in: number; out: number; both: number; unreconciled: number; reconciled: number }
/** Kỳ báo cáo tính theo ngày quên chấm công; giải trình đã thu hồi không tính. */
export function attInRange(rows: AttExplanation[], start: string, end: string) {
  return rows.filter((a) => !a.recalled && a.work_date >= start && a.work_date <= end);
}
export function attSummary(rows: AttExplanation[]): AttReportRow[] {
  const m = new Map<string, AttReportRow>();
  for (const a of rows) {
    const r = m.get(a.owner_id) ?? { owner_id: a.owner_id, total: 0, in: 0, out: 0, both: 0, unreconciled: 0, reconciled: 0 };
    r.total++; r[a.kind]++; if (a.reconciled) r.reconciled++; else r.unreconciled++;
    m.set(a.owner_id, r);
  }
  return [...m.values()];
}
