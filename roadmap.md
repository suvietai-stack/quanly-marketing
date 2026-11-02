# Roadmap — Báo cáo Kinh doanh theo Ngày/Tuần/Tháng/Quý

## FIX TỔNG THỂ QUẢN TRỊ KINH DOANH (SOURCE 35) — spec 909 dòng, 10 phần
Nguyên tắc: không xây lại module, không xóa/reset dữ liệu thật, không động module khác, không tự khóa Báo cáo 2027, chưa Publish.

- [ ] P1. Độ chính xác Báo cáo: 3 trạng thái độ phủ (Đầy đủ/Chưa đầy đủ/Chưa có) + Không áp dụng; tháng chỉ đủ khi đủ nghĩa vụ bắt buộc (kể cả phân bổ tuần giao tháng); không coi thiếu = 0; cơ chế Xác nhận số liệu thực tế đầu kỳ (có quyền, có nguồn/người xác nhận/lịch sử, không tự tạo 0, không cộng trùng).
- [ ] P2. KR cuốn chiếu: Dashboard dùng phân bổ mới nhất đã duyệt cho tháng tương lai (giữ mục tiêu năm, giữ tháng lịch sử); nhãn phân biệt mục tiêu/chỉ tiêu/phân bổ/thực tế/còn phải đạt; bản nháp qua tháng mới được cảnh báo/cập nhật/hủy; thực tế đổi → tính lại còn phải đạt + đánh dấu rà soát + chặn duyệt đề xuất hết hiệu lực.
- [ ] P3. Chuyển chu kỳ: không bỏ sót ngày, không trùng nghĩa vụ, không hồi tố; kỳ lịch sử xử lý theo chu kỳ có hiệu lực tại kỳ đó (front+back); mở Báo cáo mặc định đúng chu kỳ/kỳ hiện tại.
- [ ] P4. Phê duyệt KR cuốn chiếu: nhận diện rõ "ĐIỀU CHỈNH PHÂN BỔ KR THÁNG"; chi tiết duyệt có tổng quan + bảng trước/sau + lịch sử; xử lý chuyển phòng (snapshot đơn vị/người duyệt, không chuyển doanh số lịch sử).
- [ ] P5. Bộ luồng duyệt mẫu Sứ Việt: 5 mẫu (KR Năm, Điều chỉnh KR Tháng, Điều chỉnh Báo cáo, Nộp bù Báo cáo, Nộp bù Kế hoạch); theo từng Hệ, idempotent, người duyệt theo chức danh bổ nhiệm, trạng thái Cần hoàn thiện khi thiếu người, không ghi đè luồng tùy chỉnh; UI Quy trình mẫu + Khởi tạo + Kiểm tra quy trình; tự nhận cấp người nộp, cấm tự duyệt.
- [ ] P6. An toàn phê duyệt: không luồng hợp lệ → không tự thông qua, hiển thị nguyên nhân + lối tới cấu hình; xác minh người duyệt đúng lượt/quyền/không tự duyệt; thông báo đúng người theo cấp.
- [ ] P7. Giao diện: Công việc của tôi đủ 7 trạng thái + lỗi tải có Thử lại; Dashboard độ phủ dữ liệu; Phê duyệt có bộ lọc (Chờ tôi duyệt/Tôi đã xử lý/Trong phạm vi/Loại/Thời gian); mobile không tràn.
- [ ] P8. Hiệu năng: rà soát khóa bảng biz_documents trong 0168 (cân nhắc khóa theo hồ sơ/advisory), không bỏ kiểm soát đồng thời.
- [ ] P9. Kiểm thử nghiệm thu Nhóm A–D (44 mục) + báo cáo kết quả theo Phần 10.

## Điều chỉnh phân bổ KR (Rolling Plan) — đã xong trước đó
- [x] Hồ sơ phân bổ riêng, tái sử dụng phê duyệt KR, kiểm tra nguồn chính thức/phiên bản và thời điểm khi duyệt; không thay cam kết năm.
- [x] Tính phần còn phải đạt từ tháng đã kết thúc đủ dữ liệu; khóa tháng lịch sử/hiện tại; chia đều/tỷ trọng/tự nhập bằng số nguyên chính xác.
- [x] Giao diện điều chỉnh, lịch sử, cảnh báo nguồn thay đổi và tổng phân bổ hiện hành tại KR; Dashboard đánh giá giữ cam kết chính thức.
- [x] 56 kiểm thử KR/phân bổ/báo cáo/tổ chức đạt, trong đó 19 kiểm thử Rolling; đọc mục tiêu thật trên desktop/mobile không lỗi, không tạo dữ liệu vận hành; chưa Publish.
- [ ] Nghiệm thu biểu mẫu và gửi/duyệt bằng nhân viên thật: phiên hiện tại là Admin không có mục tiêu cá nhân; mục tiêu hiện có thiếu báo cáo lịch sử chính thức. Cần chọn tài khoản và hồ sơ thật đủ nguồn.
- [ ] Lớp biểu đồ phân bổ tương lai riêng trên Dashboard: chưa nối, không dùng phân bổ để thay tỷ lệ cam kết năm hiện tại.

- [x] Đồng bộ mặc định Tuần từ 02/11, giữ ngoại lệ/lịch sử và chặn kích hoạt khi thiếu deadline; không hồi tố.
- [x] Một nơi sửa deadline Báo cáo, xem trước kỳ và cảnh báo cấu hình thiếu/ngắn.
- [x] Bỏ chế độ Tạm tính ở KR/Dashboard và khóa nguồn chính thức phía máy chủ; giữ điều chỉnh và tổng hợp không trùng.
- [x] 122 kiểm thử đạt; mở Cài đặt bằng phiên thật, desktop và 360/375/390/430px không tràn; chưa Publish.
- [ ] Hoàn tất lịch Tuần vận hành: cần người dùng chọn mốc đóng nộp bù và xác nhận khoảng mở–hạn cuối hiện dưới 24 giờ.

- [x] Sửa nộp Kế hoạch: Google Docs chính thức, validation nháp/nộp, pha kỳ và mở tài liệu, lỗi chuẩn hóa; 94 tests đạt, form desktop/mobile bằng nháp có sẵn, không đổi dữ liệu/deadline.
- [ ] Nghiệm thu nộp Kế hoạch thật của Lê Minh Ngọc và refresh sau nộp: cần link kế hoạch thật và xác nhận nộp; không lưu/nộp URL thử vào dữ liệu vận hành.

- [x] Bước 1: Nền tảng chu kỳ & deadline (biz_report_cycle_configs, biz_report_cycle_of, deadline report_day/report_week, period_start/end, periodCycle.ts) — migrations 0155/0156, 17 tests đạt
- [x] Bước 2: Nghĩa vụ nộp & form theo chu kỳ (biz_my_work theo chu kỳ được giao, save/start/late-request nhận day/week, phân bổ tuần giao tháng) — migration 0157, typecheck+build đạt
- [x] Giao diện Cài đặt trong Báo cáo: cấu hình hiện có, kế thừa có ngày hiệu lực/lịch sử, xem trước, deadline Ngày/Tuần và form phân bổ tuần; mở được bằng Admin, kiểm tra mobile không tràn.
- [x] Chặn gửi lần đầu sai deadline tại máy chủ, dùng một lần quyền nộp bù; 59 kiểm thử quy tắc đạt, không tạo dữ liệu vận hành.
- [x] Mở rộng nguồn KR cộng dồn theo khoảng/đoạn phân bổ cho Dashboard hiện có; chặn cộng nguồn chồng lấn, thiếu nguồn trả NULL.
- [ ] Nghiệm thu lưu cấu hình → nhân viên nộp Ngày/Tuần/Tháng/Quý trên dữ liệu thật: cần xác nhận lịch và hồ sơ thật; giữ cấu hình hiện có.
- [x] Thống kê nghĩa vụ Dashboard theo chu kỳ thực thay vì kỳ xem; kiểm thử lịch chuyển chu kỳ và thành viên không tạo nghĩa vụ trùng.
- [ ] Nghiệm thu tổng hợp đa chu kỳ/mục tiêu lịch sử qua luồng thật: cần hồ sơ nguồn thật và xác nhận nộp, không tạo dữ liệu giả.
