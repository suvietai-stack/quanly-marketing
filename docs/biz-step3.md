# Bước 3 — Kế hoạch & Báo cáo Kinh doanh

## Hoàn thành
- Kế hoạch Tháng/Quý/Năm lưu URL HTTPS Google Docs, nháp/gửi/trả lại/duyệt, phiên bản điều chỉnh có lý do; không lưu file, không xác minh quyền Docs hay chốt nội dung bên ngoài.
- Nghĩa vụ từ lịch sử membership giao với kỳ, mỗi người một hồ sơ, phòng gần nhất; danh sách có cả người chưa tạo hồ sơ. Phòng hồ sơ đã tạo được giữ lịch sử, không đổi ngầm sau chuyển phòng.
- Deadline từ biz_deadline_at, trạng thái hạn và duyệt riêng; first_submitted_at giữ lần gửi thành công đầu, deadline đóng băng lúc đó, kể cả chưa cấu hình. Sắp đến hạn = 24 giờ; cho gửi muộn.
- Báo cáo tháng: mục tiêu snapshot đã duyệt, thực tế nguyên không âm/string, NULL khác 0. Không mục tiêu: tài liệu độc lập, không tính %. Có nút gắn mục tiêu chính thức khi bản nháp chưa có mục tiêu; không thay snapshot có sẵn.
- Quý/Năm: số thực tế chỉ tổng hợp từ tháng, một phiên bản/tháng. Chính thức = phiên bản đã duyệt; tạm = pending mới nhất hoặc chính thức, loại nháp/trả lại. Thiếu tháng có nghĩa vụ không coi là 0; tháng không thuộc diện nộp được ghi excluded_months.
- Lũy kế đến kỳ, mục tiêu lũy kế, chênh lệch, % năm và còn cần đạt. Không sửa mục tiêu tháng còn lại. Mục tiêu 0 hoặc lower hiển thị không áp dụng tỷ lệ trực tiếp, không tự tạo công thức đánh giá chưa được xác nhận.
- Mục tiêu/nguồn tháng được giữ tham chiếu phiên bản. Hồ sơ tháng/quý/năm chính thức đối chiếu baseline đã lưu, không bị đổi âm thầm sau mục tiêu năm điều chỉnh.
- Quyền/RLS own/dept/all, current manager để duyệt lịch sử trong phòng hồ sơ; view_all không cấp duyệt, không tự duyệt. Client SELECT-only, RPC khóa/revision; phê duyệt nguyên tử.
- Thông báo Base gửi/duyệt/trả lại chống trùng theo event và recipient. Nhắc hạn thủ công theo quyền deadline_manage, một lần/kỳ/người/trạng thái soon/overdue; không bật cron hoặc Zalo/Push.

## Dữ liệu và RPC
Migrations 0091–0098: biz_documents, biz_document_versions, biz_document_events; biz_period_start/department, biz_doc_access/document_access, biz_docs_url_ok, biz_document_start/save/decide/attach_target, biz_documents_read, biz_report_metrics, biz_deadline_status/remind và bảo vệ target/approved version. Giữ mục tiêu năm Bước 2.

## Kiểm thử
- PostgreSQL tách biệt: nghĩa vụ/chuyển phòng, nháp/gửi/duyệt/trả lại/khóa/điều chỉnh, first submission, URL giả, NULL/0/negative/fraction, revision, RLS/direct write deny, provisional vs official, quý 300+400+500 triệu=1,2 tỷ, năm thiếu 9 tháng, không cộng trùng, baseline cũ/mới và nhắc chống trùng.
- UI đăng nhập Admin thật: menu plans/reports đúng, danh sách người chưa nộp thật. Không tạo hồ sơ, mục tiêu hoặc thông báo thử vận hành.
- Fixture phản hồi chỉ trong trình duyệt: input 0 hợp lệ, URL giả chặn gửi; desktop/mobile 360/375/390/430 không tràn, dialog/Chipi không chồng, không lỗi runtime. Không gửi fixture về backend.
- Luồng lập/gửi/duyệt bằng người lập/người duyệt thật chưa xác minh: cần số liệu và tài liệu thực tế được chỉ định, tài khoản đang dùng không thuộc phòng. Kiểm concurrency trên backend thật chưa thực hiện; khóa/revision và duplicate action được kiểm tách biệt.
- Chưa Publish; schema/quyền đã áp dụng backend dùng chung.

## Bước 4 / tiếp tục
- Dashboard biểu đồ/phòng/nhân viên, xếp hạng và tỷ lệ đúng hạn dùng RPC tổng hợp hiện có.
- Lập lịch nhắc tự động chưa bật; không tự nhắc toàn bộ dữ liệu vận hành. Hiện dùng nhắc thủ công.
- Quy tắc tỷ lệ lower/target=0 cần định nghĩa trước khi chấm đạt; hiện không suy đoán.
- Trang năm có bảng từng quý đạt/chưa đạt/chưa đủ dữ liệu, không kết luận đạt khi thiếu tháng.