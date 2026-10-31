# Sửa nộp Kế hoạch — 31/10/2026

## Nguyên nhân và thay đổi
- DocumentEditor trong BizDocuments.tsx đọc URL từ phiên bản bằng biến cố định nhưng không còn ô nhập/state cập nhật; khu vực tài liệu bổ sung không truyền URL chính thức. Đã khôi phục ô Google Docs riêng, tải URL nháp, giữ URL khi thêm/xóa tài liệu và gửi URL đã trim đúng tham số.
- Backend hiện hành đã yêu cầu Google Docs khi nộp Kế hoạch và cho nháp thiếu URL; Báo cáo KR không bắt buộc Docs. Giữ nguyên các quy tắc này, chuẩn hóa thông báo thiếu link.
- Nhãn “Chưa đến hạn” trước đây được suy từ khoảng cách tới hạn cuối, không từ ngày mở. Kế hoạch nay lấy ba mốc hiện hành và server_now để hiển thị pha kỳ riêng với trạng thái hồ sơ; không sửa cấu hình deadline.
- documentQueries.ts chuẩn hóa object lỗi và chờ refresh sau thành công: biz_my_work, biz_docs, biz_doc_events, biz_metrics, biz_dashboard, biz_dashboard_published, biz_approvals, biz_plans_unviewed, biz_late_requests, notifications. Chỉ báo thành công khi máy chủ xác nhận.
- BizMyWork.tsx/BizPlans.tsx tách kỳ nộp và hồ sơ, ẩn trạng thái xem ở hồ sơ chưa nộp. biz_documents_read trả none cho kế hoạch chưa có Docs hợp lệ đã nộp; biz_document_open không ghi lượt xem bản nháp. Mở link nháp từ form không ghi nhận lãnh đạo đã mở; mở bản đã nộp đi qua RPC theo người/phiên bản.
- Kế hoạch Năm được tạo nháp như Tháng/Quý; Báo cáo Năm giữ nguyên chỉ xem tổng hợp.

## Quy tắc
- Nháp được thiếu URL; nộp Kế hoạch phải là HTTPS docs.google.com/document/d/... hợp lệ. Tài liệu bổ sung và ghi chú không thay thế link chính thức. Validation thất bại giữ nội dung.
- Cổng nộp lần đầu tại máy chủ giữ nguyên: trước mở/đóng kỳ chặn, quá hạn cần quyền nộp bù đã duyệt dùng một lần. Nộp lại hồ sơ cần sửa giữ thời điểm nộp đầu và hạn đã đóng băng.
- Không khẳng định đã kiểm tra quyền chia sẻ hoặc nội dung Google Docs.

## Kết quả kiểm tra
- 94/94 kiểm thử đạt trên 7 file, gồm URL an toàn, nháp thiếu link, chặn nộp thiếu link dù có tài liệu bổ sung, lưu đúng URL nháp, nộp hợp lệ trong cơ sở dữ liệu kiểm thử cách ly, bảo toàn lần nộp đầu khi nộp lại, nộp bù/đóng kỳ, viewer theo phiên bản và hồi quy Báo cáo KR đa chu kỳ.
- Preview đăng nhập Admin Hệ Thống: mở bản nháp Tháng 11 có sẵn từ Công việc của tôi; form hiện Đang mở nộp/Bản nháp, mốc 25/10 00:00 → 03/11 23:59 → 15/11 23:59. Bấm Nộp khi rỗng hiện lỗi rõ ràng; thêm tài liệu không mất URL; không [object Object], không lỗi trình duyệt.
- Desktop 1280px và điện thoại 390px đã kiểm tra ảnh form; form điện thoại không tràn ngang. Build mới nhất OK.
- Xác minh trực tiếp định nghĩa máy chủ: thông báo URL đã cập nhật và chặn ghi view bản nháp đã tồn tại.

## Giới hạn nghiệm thu
- Không lưu URL thử hoặc nộp kế hoạch giả vào dữ liệu vận hành. Chưa nộp thành công hồ sơ thật bằng tài khoản Lê Minh Ngọc; chưa nghiệm thu refresh sau nộp thật qua giao diện tài khoản này. Các thao tác lưu/nộp thành công được kiểm thử trong cơ sở dữ liệu cách ly, không thay thế nghiệm thu hồ sơ thật.
- Không đổi cấu hình deadline, Role, cơ cấu tổ chức, dữ liệu/lịch sử hoặc timestamp cũ; không tạo DEMO. Chưa Publish giao diện. Thay đổi hàm máy chủ áp dụng trên backend dùng chung Preview/published.