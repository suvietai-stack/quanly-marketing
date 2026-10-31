# Bản 32 — Fix Dashboard dữ liệu một phần, thay người phụ trách, reset nghiệp vụ

## 1. Biểu đồ hiển thị thực tế một phần
- `BizDashboardCharts.tsx`: `plotActual` chỉ null khi `actual` thật sự null; dữ liệu một phần vẫn vẽ, kèm nhãn "Dữ liệu một phần" dưới biểu đồ. Tooltip hiện "Đã báo cáo X/Y · Còn thiếu N" và ghi chú kết quả tạm thời. Báo cáo chính thức = 0 vẫn hiển thị 0.

## 2. Tỷ trọng / xu hướng / xếp hạng
- `publishedDashboard.ts`: thêm `hasActual()`; `distribution()` trả `{rows, covered, total, partial}` — tính trên doanh số đã ghi nhận, Hệ thiếu dữ liệu không tính là 0; `trend()` cho phép so sánh tạm tính khi cả hai kỳ có thực tế hợp lệ, gắn cờ `provisional`, vẫn từ chối khi thiếu kỳ gốc hoặc kỳ gốc = 0.
- `BizPublishedDashboard.tsx`: nhãn "Tỷ trọng trên doanh số đã ghi nhận · Bao phủ X/Y Hệ"; xu hướng tạm tính có ghi chú; xếp hạng tạm thời các Hệ có dữ liệu, Hệ chưa có dữ liệu hiện "Chưa có dữ liệu" thay vì xếp cuối.

## 3. Thay người phụ trách (Cơ cấu tổ chức)
- `BizAppointments.tsx`: khi mở từ vị trí quản lý (context có `replacesId`/`legacyReplacesId`), form chuyển sang chế độ "Thay người phụ trách": khóa vị trí/đơn vị, hiện người đang phụ trách, ô nhân viên để trống cho người mới, xem trước ai mất/ai nhận chức vụ và quyền cấp/thu hồi. Đổi nhân viên không còn tự chuyển mục tiêu thay thế sang chức vụ cũ của người mới. Ghi vẫn qua `biz_appointment_save` nguyên tử; lịch sử giữ nguyên.

## 4. Reset dữ liệu nghiệp vụ (migration 0149)
- `biz_reset_preview()`: thống kê số bản ghi từng loại + hồ sơ Lê Minh Ngọc; chỉ Super Admin.
- `biz_reset_execute(_confirm)`: yêu cầu đúng chuỗi `RESET KINH DOANH`; một giao dịch: advisory lock + khóa bảng, sao lưu toàn bộ bản ghi vào `private.biz_reset_backups` (không ai đọc được ngoài service), xóa con → cha (thông báo/push → approval events/runs → nộp bù → views/events/versions → documents → goal events/items/versions → goals), trả counts + backup id.
- Xóa: Kế hoạch, Báo cáo, Mục tiêu KR do người dùng lập, nộp bù, luồng duyệt gắn hồ sơ, thông báo `biz_submitted/approved/returned` và `biz-run:*`. Giữ: cơ cấu, chức vụ, bổ nhiệm, Role, danh mục KR, deadline, quy trình, thông báo `biz_deadline`, mọi module khác.
- UI: Cài đặt → Quản trị nâng cao (chỉ Super Admin), component `BizReset.tsx`; sau reset invalidate toàn bộ query cache.

## Kiểm thử
- 207/207 test Biz (9 test publishedDashboard mới, 4 test reset PGlite), tsgo sạch, build OK.
- Playwright Super Admin: Dashboard tổng hợp hiển thị, tab Quản trị nâng cao + preview số liệu, form Thay người phụ trách đúng người đang giữ vị trí.
- Việc reset thật do Admin xác nhận trong UI (nhập RESET KINH DOANH); chưa Publish.
