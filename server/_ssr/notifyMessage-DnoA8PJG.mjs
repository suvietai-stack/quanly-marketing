const vnDate = (d) => {
  const m = d ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : null;
};
const vnDateTime = (d) => {
  if (!d) return null;
  const t = new Date(d);
  if (isNaN(+t)) return null;
  return t.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
};
const line = (label, v) => v && String(v).trim() ? `${label}: ${String(v).trim()}` : null;
const join = (a) => a.filter((x) => x !== null && x !== false && x !== void 0).join("\n");
function contentZaloMessage(kind, d, brand = "BASE MARKETING") {
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
const CONTENT_LABEL = {
  content_assigned: "Bạn được giao bài viết mới.",
  content_review: "Có bài viết chờ bạn phê duyệt.",
  content_revise: "Bài viết của bạn cần chỉnh sửa.",
  content_approved: "Bài viết đã được duyệt.",
  content_published: "Bài viết đã đăng website.",
  content_remind: "Nhắc duyệt: có bài viết đang chờ bạn."
};
function contentPushMessage(kind, d, brand = "BASE") {
  return { title: brand, body: join([CONTENT_LABEL[kind], line("Tiêu đề", d.title), line("Website", d.website), "Nhấn để mở bài viết."]) };
}
function contentStillValid(kind, payloadStatus, currentStatus) {
  if (!currentStatus || currentStatus === "Đã hủy") return false;
  if (kind === "content_review" || kind === "content_remind" || kind === "content_revise") return currentStatus === payloadStatus;
  return true;
}
const contentLink = (id) => `/web-contents?open=${encodeURIComponent(id)}`;
function contentReviewerOf(d, status) {
  const nz = (v) => typeof v === "string" && v.trim() ? v : void 0;
  if (status.endsWith("outline")) return nz(d.outlineReviewer);
  if (status.endsWith("tối ưu")) return nz(d.optimizeReviewer) ?? nz(d.draftReviewer);
  if (status.endsWith("bản nháp web")) return nz(d.webDraftReviewer) ?? nz(d.draftReviewer);
  return nz(d.draftReviewer);
}
function contentCurrentRecipients(kind, d) {
  const st = String(d?.status ?? "");
  if (kind === "content_review" || kind === "content_remind") return [contentReviewerOf(d, st)].filter(Boolean);
  if (kind === "content_approved") return [d.writer, d.publisher].filter(Boolean);
  return [d.writer].filter(Boolean);
}
const nameMatches = (names, p) => !!p && names.some((n) => {
  const x = n.trim().toLowerCase();
  return x && (x === (p.full_name ?? "").trim().toLowerCase() || x === (p.username ?? "").trim().toLowerCase());
});
export {
  CONTENT_LABEL,
  contentCurrentRecipients,
  contentLink,
  contentPushMessage,
  contentReviewerOf,
  contentStillValid,
  contentZaloMessage,
  nameMatches
};
