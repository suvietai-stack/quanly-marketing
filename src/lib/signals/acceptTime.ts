/**
 * TG tiếp nhận TB của Sale — chỉ tính thời gian trong khung 08:00–17:00 (giờ Việt Nam).
 * Thứ Hai đến Thứ Bảy; Chủ nhật nghỉ hoàn toàn. Không trừ giờ nghỉ trưa.
 * Mốc bắt đầu: sự kiện phân công (opportunity_signal_events kind=assign, detail.to = Sale).
 * Mốc kết thúc: nhật ký đầu tiên của chính Sale đó với status_from = "waiting" (bấm Tiếp nhận).
 */

const VN_OFFSET = "+07:00";
const WORK_START = "08:00:00";
const WORK_END = "17:00:00";

const vnDateKey = (t: number): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(t));

const addDay = (key: string): string => {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/**
 * Số phút nằm trong khung giờ làm việc giữa hai mốc thời gian (ISO).
 * Trả null khi dữ liệu bất thường (thiếu mốc, tiếp nhận trước khi giao) — không tự điền 0.
 * Trả 0 khi hoàn toàn ngoài giờ — caller phải loại khỏi phép tính trung bình.
 */
export function businessMinutes(startIso: string | null | undefined, endIso: string | null | undefined): number | null {
  if (!startIso || !endIso) return null;
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return null;
  let total = 0;
  const endKey = vnDateKey(e);
  for (let d = vnDateKey(s); d <= endKey; d = addDay(d)) {
    // d is already the Vietnam calendar date; UTC here only determines its weekday.
    if (new Date(`${d}T00:00:00Z`).getUTCDay() === 0) continue;
    const ws = Date.parse(`${d}T${WORK_START}${VN_OFFSET}`);
    const we = Date.parse(`${d}T${WORK_END}${VN_OFFSET}`);
    const a = Math.max(s, ws);
    const b = Math.min(e, we);
    if (b > a) total += (b - a) / 60000;
  }
  return total;
}

/** Chỉ làm tròn lúc hiển thị, đến giây; không làm mất mẫu dương dưới một phút. */
export function fmtMinutes(min: number | null): string {
  if (min == null || !Number.isFinite(min) || min < 0) return "—";
  if (min > 0 && min * 60 < 1) return "<1 giây";
  const seconds = Math.round(min * 60);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [h ? `${h} giờ` : "", m ? `${m} phút` : "", s ? `${s} giây` : ""].filter(Boolean);
  return parts.join(" ") || "0 giây";
}

export interface AssignEventRow { signal_id: string; kind: string; detail: any; created_at: string }
export interface AcceptNoteRow { signal_id: string; author_id: string; status_from: string | null; created_at: string }

const asc = (a: string, b: string) => a.localeCompare(b);

/**
 * Thời gian tiếp nhận (phút trong giờ hành chính) của đúng chu kỳ giao hiện tại cho Sale đang phụ trách.
 * Chuyển Sale A → B: chỉ lấy lần giao gần nhất cho B và lần tiếp nhận của B sau đó.
 * Trả null khi chưa tiếp nhận hoặc thiếu timestamp hợp lệ.
 */
export function acceptMinutes(
  signal: { id: string; assigned_to: string | null },
  events: AssignEventRow[],
  notes: AcceptNoteRow[],
): number | null {
  if (!signal.assigned_to) return null;
  const assigns = events
    .filter((e) => e.signal_id === signal.id && e.kind === "assign" && e.detail?.to === signal.assigned_to)
    .map((e) => e.created_at)
    .sort(asc);
  const lastAssign = assigns[assigns.length - 1];
  if (!lastAssign) return null;
  const accept = notes
    .filter((n) => n.signal_id === signal.id && n.author_id === signal.assigned_to && n.status_from === "waiting" && n.created_at >= lastAssign)
    .map((n) => n.created_at)
    .sort(asc)[0];
  if (!accept) return null;
  return businessMinutes(lastAssign, accept);
}

export interface AcceptStat { avg: number | null; valid: number; accepted: number }

/**
 * Tổng hợp TG tiếp nhận TB cho một nhóm tín hiệu của một Sale.
 * Chỉ tín hiệu có thời gian hợp lệ > 0 tham gia trung bình; tín hiệu hoàn toàn ngoài giờ (0 phút)
 * vẫn đếm vào "đã tiếp nhận" nhưng không chia vào trung bình.
 */
export function acceptStat(
  signals: { id: string; assigned_to: string | null }[],
  events: AssignEventRow[],
  notes: AcceptNoteRow[],
): AcceptStat {
  let sum = 0;
  let valid = 0;
  let accepted = 0;
  for (const s of signals) {
    const m = acceptMinutes(s, events, notes);
    if (m == null) continue;
    accepted++;
    if (m > 0) { sum += m; valid++; }
  }
  return { avg: valid ? sum / valid : null, valid, accepted };
}
