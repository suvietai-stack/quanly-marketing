# Roadmap — Báo cáo Kinh doanh theo Ngày/Tuần/Tháng/Quý

- [x] Bước 1: Nền tảng chu kỳ & deadline (biz_report_cycle_configs, biz_report_cycle_of, deadline report_day/report_week, period_start/end, periodCycle.ts) — migrations 0155/0156, 17 tests đạt
- [x] Bước 2: Nghĩa vụ nộp & form theo chu kỳ (biz_my_work theo chu kỳ được giao, save/start/late-request nhận day/week, phân bổ tuần giao tháng) — migration 0157, typecheck+build đạt
- [ ] Bước 3: Tổng hợp & đối chiếu mục tiêu (nguồn chính thức duy nhất, tổng hợp theo khoảng ngày, không suy diễn)
- [ ] Bước 4: Giao diện & Dashboard (cài đặt chu kỳ trong Báo cáo, bộ lọc xem 5 cấp, thống kê nghĩa vụ theo chu kỳ thực, mobile)
