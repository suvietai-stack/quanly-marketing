# Roadmap — Báo cáo Kinh doanh theo Ngày/Tuần/Tháng/Quý

- [x] Bước 1: Nền tảng chu kỳ & deadline (biz_report_cycle_configs, biz_report_cycle_of, deadline report_day/report_week, period_start/end, periodCycle.ts) — migrations 0155/0156, 17 tests đạt
- [x] Bước 2: Nghĩa vụ nộp & form theo chu kỳ (biz_my_work theo chu kỳ được giao, save/start/late-request nhận day/week, phân bổ tuần giao tháng) — migration 0157, typecheck+build đạt
- [x] Giao diện Cài đặt trong Báo cáo: cấu hình hiện có, kế thừa có ngày hiệu lực/lịch sử, xem trước, deadline Ngày/Tuần và form phân bổ tuần; mở được bằng Admin, kiểm tra mobile không tràn.
- [x] Chặn gửi lần đầu sai deadline tại máy chủ, dùng một lần quyền nộp bù; 59 kiểm thử quy tắc đạt, không tạo dữ liệu vận hành.
- [x] Mở rộng nguồn KR cộng dồn theo khoảng/đoạn phân bổ cho Dashboard hiện có; chặn cộng nguồn chồng lấn, thiếu nguồn trả NULL.
- [ ] Nghiệm thu lưu cấu hình → nhân viên nộp Ngày/Tuần/Tháng/Quý trên dữ liệu thật: chờ đơn vị và ngày áp dụng được người dùng xác nhận; không tự đổi cấu hình vận hành (hiện chưa có cấu hình chu kỳ riêng).
- [ ] Bước 3/4 còn lại: kiểm chứng tổng hợp đa chu kỳ/mục tiêu lịch sử qua luồng thật, thống kê nghĩa vụ Dashboard theo chu kỳ thay vì kỳ xem; cần dữ liệu nguồn và lựa chọn áp dụng thực tế.
