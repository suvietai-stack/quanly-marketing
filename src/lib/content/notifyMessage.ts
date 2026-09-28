/** Mẫu thông báo Content Web (Zalo + Web Push) — hàm thuần. Không đưa nội dung ghi chú chỉnh sửa vào tin. */
export const CONTENT_KINDS = ["content_assigned", "content_review", "content_revise", "content_approved", "content_published", "content_remind"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

export const REVIEW_STATUSES = ["Chờ duyệt outline", "Chờ duyệt bài", "Chờ duyệt bản nháp web", "Chờ duyệt tối ưu"];
export const REVISE_STATUSES = ["Cần sửa outline", "Cần sửa bài", "Cần sửa bản nháp web", "Cần sửa tối ưu"];

export type ContentMsgData = {
  title?: string | null; website?: string | null; writer?: string | null; assigner?: string | null;
  reviewer?: string | null; deadline?: string | null; at?: string | null; status?: string | null;
};

const vnDate = (d?: string | null) => { const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null; return m ? `${m[3]}/${m[2]}/${m[1]}` : null; };
const vnDateTime = (d?: string | null) => {
  if (!d) return null; const t = new Date(d); if (isNaN(+t)) return null;
  return t.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
};
const line = (label: string, v?: string | null) => (v && String(v).trim() ? `${label}: ${String(v).trim()}` : null);
const join = (a: (string | null | false | undefined)[]) => a.filter((x) => x !== null && x !== false && x !== undefined).join("\n");

export function contentZaloMessage(kind: ContentKind, d: ContentMsgData, brand = "BASE MARKETING") {
  const base = [line("Tiêu đề", d.title), line("Website", d.website)];
  switch (kind) {
    case "content_assigned":
      return { header: `📝 ${brand}`, button: "XEM VÀ THỰC HIỆN", text: join(["BẠN ĐƯỢC GIAO BÀI VIẾT MỚI", "", ...base, line("Người giao", d.assigner), line("Hạn hoàn thành", vnDate(d.deadline))]) };
    case "content_review":
      return { header: `📋 ${brand}`, button: "XEM VÀ PHÊ DUYỆT", text: join(["CÓ BÀI VIẾT CHỜ PHÊ DUYỆT", "", ...base, line("Người thực hiện", d.writer), line("Thời điểm gửi", vnDateTime(d.at))]) };
    case "content_revise":
      return { header: `🔄 ${brand}`, button: "XEM YÊU CẦU CHỈNH SỬA", text: join(["BÀI VIẾT CẦN CHỈNH SỬA", "", ...base, line("Người yêu cầu", d.reviewer)]) };
    case "content_approved":
      return { header: `✅ ${brand}`, button: "XEM BÀI VIẾT", text: join(["BÀI VIẾT ĐÃ ĐƯỢC DUYỆT", "", ...base, line("Trạng thái", d.status)]) };
    case "content_published":
      return { header: `🌐 ${brand}`, button: "XEM BÀI VIẾT", text: join(["BÀI VIẾT ĐÃ ĐĂNG WEBSITE", "", ...base]) };
    case "content_remind":
      return { header: `⏰ ${brand}`, button: "XEM VÀ PHÊ DUYỆT", text: join(["NHẮC: BÀI VIẾT ĐANG CHỜ BẠN DUYỆT", "", ...base, line("Người thực hiện", d.writer), line("Trạng thái", d.status)]) };
  }
}

export const CONTENT_LABEL: Record<ContentKind, string> = {
  content_assigned: "Bạn được giao bài viết mới.",
  content_review: "Có bài viết chờ bạn phê duyệt.",
  content_revise: "Bài viết của bạn cần chỉnh sửa.",
  content_approved: "Bài viết đã được duyệt.",
  content_published: "Bài viết đã đăng website.",
  content_remind: "Nhắc duyệt: có bài viết đang chờ bạn.",
};

export function contentPushMessage(kind: ContentKind, d: ContentMsgData, brand = "BASE") {
  return { title: brand, body: join([CONTENT_LABEL[kind], line("Tiêu đề", d.title), line("Website", d.website), "Nhấn để mở bài viết."]) };
}

/** Thông báo còn hợp lệ không (bài đã được xử lý / đổi người thì bỏ). */
export function contentStillValid(kind: ContentKind, payloadStatus: string | null | undefined, currentStatus: string | null | undefined) {
  if (!currentStatus || currentStatus === "Đã hủy") return false;
  if (kind === "content_review" || kind === "content_remind" || kind === "content_revise") return currentStatus === payloadStatus;
  return true;
}

export const contentLink = (id: string) => `/web-contents?open=${encodeURIComponent(id)}`;

/** Người đang chịu trách nhiệm hiện tại theo loại tin (tên ghi trên bài). Khớp với cw_reviewer ở backend. */
export function contentReviewerOf(d: Record<string, any>, status: string): string | undefined {
  const nz = (v: any) => (typeof v === "string" && v.trim() ? v : undefined);
  if (status.endsWith("outline")) return nz(d.outlineReviewer);
  if (status.endsWith("tối ưu")) return nz(d.optimizeReviewer) ?? nz(d.draftReviewer);
  if (status.endsWith("bản nháp web")) return nz(d.webDraftReviewer) ?? nz(d.draftReviewer);
  return nz(d.draftReviewer);
}
export function contentCurrentRecipients(kind: ContentKind, d: Record<string, any>): string[] {
  const st = String(d?.status ?? "");
  if (kind === "content_review" || kind === "content_remind") return [contentReviewerOf(d, st)].filter(Boolean) as string[];
  if (kind === "content_approved") return [d.writer, d.publisher].filter(Boolean);
  return [d.writer].filter(Boolean);
}
/** Người nhận (tên/username tài khoản) vẫn là người phụ trách hiện tại. */
export const nameMatches = (names: string[], p: { full_name?: string | null; username?: string | null } | null) =>
  !!p && names.some((n) => { const x = n.trim().toLowerCase(); return x && (x === (p.full_name ?? "").trim().toLowerCase() || x === (p.username ?? "").trim().toLowerCase()); });
