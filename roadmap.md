# Roadmap — Báo cáo Kinh doanh theo Ngày/Tuần/Tháng/Quý

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
