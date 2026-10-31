# Fix bản 32 + Reset sạch dữ liệu nghiệp vụ Quản trị Kinh doanh

## Nhiệm vụ 1 — Ba lỗi đã phát hiện

### A. Biểu đồ ẩn thực tế khi dữ liệu một phần
- `BizDashboardCharts.tsx`: bỏ điều kiện `!r.complete` khiến `plotActual` thành null. Thực tế hợp lệ (kể cả một phần) vẫn vẽ; gắn nhãn "Dữ liệu một phần"; tooltip hiện `received/expected` và số còn thiếu; null thật vẫn là null ("Chưa có dữ liệu"), không biến null thành 0; báo cáo chính thức = 0 hiển thị đúng 0.
- Áp dụng thống nhất: card KR, biểu đồ mục tiêu/thực tế, lũy kế, tooltip.

### B. Tỷ trọng, xu hướng, xếp hạng bị trống
- `publishedDashboard.ts`:
  - `distribution()`: tính trên tổng doanh số **đã ghi nhận** của các Hệ có dữ liệu thực tế hợp lệ; Hệ chưa có dữ liệu không tính là 0; trả kèm độ bao phủ; nhãn "Tỷ trọng trên doanh số đã ghi nhận"; không có Hệ nào có dữ liệu → "Chưa có dữ liệu".
  - Xếp hạng: cho phép xếp hạng tạm thời các Hệ có dữ liệu chính thức; Hệ chưa có dữ liệu hiện "Chưa có dữ liệu", không xếp cuối như 0; ghi chú rõ "xếp hạng tạm thời".
  - `trend()`: cho phép so sánh tạm tính khi hai kỳ có số liệu thực tế hợp lệ (không bắt buộc complete), ghi chú "tạm tính"; vẫn không tính % khi kỳ gốc thiếu hoặc bằng 0.
  - Năm đang diễn ra: chỉ kỳ đã đến hạn mới xét "thiếu dữ liệu quá hạn"; tháng tương lai không đánh dấu chưa hoàn thành nghĩa vụ (đã có `missing_due`/`evaluation_hi`, kiểm tra và dùng đúng).
- `BizPublishedDashboard.tsx`: nhãn/ghi chú tương ứng; không hiển thị số giả.

### C. Thay thế người quản lý chưa thuận tiện
- `BizAppointments.tsx` (+ `positions.ts` nếu cần): thêm luồng "Thay người phụ trách" khi bấm vào vị trí quản lý trong Cơ cấu tổ chức:
  - Tự nhận diện vị trí và **người đang phụ trách** (từ bổ nhiệm hiệu lực tại đúng đơn vị đó).
  - Form: vị trí cần thay · người đang phụ trách · người mới · ngày hiệu lực · xử lý chức vụ hiện tại của người mới (giữ kiêm nhiệm / kết thúc theo điều chuyển — không tự kết thúc khi chưa chọn rõ).
  - Xem trước: ai mất chức vụ nào, ai nhận chức vụ nào, quyền được cấp/thu hồi.
  - Không cho hai người giữ một vị trí quản lý độc quyền cùng thời điểm (trừ cấu hình đồng phụ trách hợp lệ).
  - Tách biệt "thay người phụ trách vị trí" và "xử lý chức vụ khác của người mới"; không bắt Admin tự tìm bổ nhiệm của người cũ trong danh sách chức vụ của người mới.
- Đồng bộ sau thay thế dùng RPC `biz_appointment_save` hiện có (nguyên tử, lịch sử giữ nguyên); không tự duyệt hồ sơ đang chờ, không sửa hồ sơ đã duyệt.

## Nhiệm vụ 2 — Reset sạch dữ liệu nghiệp vụ (một lần, an toàn)

### Phạm vi xóa (dữ liệu nghiệp vụ)
- Mục tiêu KR do người dùng lập: `biz_annual_goals`, `biz_goal_versions`, `biz_goal_items`, `biz_goal_events`.
- Kế hoạch & Báo cáo: `biz_documents`, `biz_document_versions`, `biz_document_events`, `biz_document_views`.
- Nộp bù & phê duyệt gắn hồ sơ trên: `biz_late_requests`, `biz_approval_runs`, `biz_approval_events` (chỉ run gắn hồ sơ bị reset).
- Kiểm tra FK/bảng phụ thực tế trước khi xóa; kiểm tra riêng hồ sơ Lê Minh Ngọc.

### Tuyệt đối giữ
- Cơ cấu tổ chức (Khối/Hệ/Phòng/Nhóm/thành viên/phân công), chức vụ, bổ nhiệm + lịch sử, Role/phân quyền/ngoại lệ, danh mục KR + quy tắc, deadline + lịch sử cấu hình, mẫu quy trình phê duyệt. Không chạm module khác (Marketing, Đơn hàng, Tín hiệu, KPI, Chấm công, Nhân sự, Zalo…).

### Cơ chế an toàn (theo mẫu reset Tiền Về)
1. Migration thêm RPC SECURITY DEFINER, chỉ Super Admin:
   - `biz_reset_preview()`: thống kê số bản ghi từng loại sẽ bị reset (kế hoạch, mục tiêu, báo cáo, nộp bù, hồ sơ chờ duyệt, nháp; riêng hồ sơ Lê Minh Ngọc).
   - `biz_reset_execute(_confirm text)`: yêu cầu chuỗi xác nhận rõ; trong **một giao dịch**: khóa bảng, sao lưu toàn bộ bản ghi trong phạm vi vào bảng backup riêng tư (chỉ Super Admin đọc), xóa theo thứ tự con → cha, ghi nhật ký reset (người thực hiện, thời điểm, phạm vi, số bản ghi).
2. UI: đặt trong Cài đặt → Quản trị nâng cao (chỉ Super Admin thấy), hiển thị preview, yêu cầu xác nhận rõ trước khi chạy.
3. Không tạo migration chứa DELETE/TRUNCATE chạy tự động; không che dữ liệu ở frontend.
4. Sau reset: Dashboard hiển thị "Chưa có dữ liệu" (không phải 0 hay biểu đồ mẫu); invalidate toàn bộ query cache Biz.

### Đối soát sau reset
- Đếm lại từng bảng = 0; cấu hình/cơ cấu/bổ nhiệm/Role/KR/deadline/quy trình không đổi; các module khác không đổi; backup + nhật ký tồn tại.

## Kiểm thử
- Thêm/cập nhật test cho: vẽ thực tế một phần, distribution/ranking/trend tạm tính, thay người phụ trách (đúng vị trí, không nhầm chức vụ cũ, kiêm nhiệm), preview/execute reset (quyền, giao dịch, backup, giữ cấu hình).
- Chạy toàn bộ test Biz + build + Playwright desktop/mobile.
- Chưa Publish.
