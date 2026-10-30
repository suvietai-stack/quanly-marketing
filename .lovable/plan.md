# Module Quản trị Kinh doanh — Kế hoạch triển khai

Module mới, độc lập với Tín hiệu/Đơn hàng/Tiền về/Sao. Tái sử dụng: Auth + Role/Permission hiện có (`src/lib/auth.ts`), thông báo nội bộ (`notifications`), biểu đồ Recharts (đã có), UI Soft Modern hiện tại. Chỉ Preview, chưa Publish.

## Khảo sát hiện trạng
- Chưa có khái niệm "phòng ban" trong dữ liệu → tạo bảng phòng ban + thành viên mới, không đụng `profiles`.
- Quyền theo role có sẵn → thêm nhóm quyền `biz.*` vào `PERMISSIONS` + bảng Role chung.
- Recharts đã cài → dùng cho dashboard.
- Thông báo nội bộ Base có sẵn → dùng lại, không tạo kênh mới.

## Bước 1 (đợt này): Nền tảng module
**Migration `0088_biz_management_foundation`:**
- `biz_departments` (tên, mô tả, active) — seed 2 phòng: Kinh doanh Sứ Quà Tặng, Kinh doanh Phân Phối.
- `biz_department_members` (user_id, department_id, is_manager, effective_from/to) — giữ lịch sử chuyển phòng.
- `biz_kr_metrics` (tên, mô tả, đơn vị, phòng áp dụng, cách tổng hợp: cộng dồn/bình quân/tỷ lệ, chiều đánh giá, thứ tự, active) — seed KR mặc định: Doanh số (VNĐ), Số đơn hàng (Đơn) cho cả 2 phòng; Số đại lý mới (Đại lý) cho Phân Phối. Không hardcode vào logic.
- `biz_deadline_config` (hạn nộp theo loại: kế hoạch/báo cáo Tháng/Quý/Năm, mục tiêu năm).
- RLS + GRANT đầy đủ; ghi chỉ qua RPC SECURITY DEFINER.

**Quyền mới (nhóm "Quản trị Kinh doanh"):** `biz.view_own`, `biz.view_dept`, `biz.view_all`, `biz.plan_submit`, `biz.goal_submit`, `biz.report_submit`, `biz.plan_approve`, `biz.goal_approve`, `biz.report_approve`, `biz.kr_manage`, `biz.dept_manage`, `biz.deadline_manage`. Super Admin tự có toàn bộ; cấp mặc định hợp lý cho role kinh doanh/lãnh đạo hiện có.

**UI Bước 1:**
- Menu mới "Quản trị Kinh doanh" với 5 mục: Tổng quan / Kế hoạch / Mục tiêu KR / Báo cáo / Cài đặt (Cài đặt chỉ hiện khi có quyền).
- Trang Cài đặt trong module: Phòng ban & thành viên, Chỉ số KR, Deadline, Phân quyền (đồng bộ Role chung, giống cơ chế Nghỉ phép).
- Các trang Tổng quan/Kế hoạch/Mục tiêu/Báo cáo: khung + trạng thái trống ("Chưa có dữ liệu"), sẵn sàng cho bước sau.

## Bước 2 (đợt sau): Mục tiêu KR năm
- Form lập mục tiêu năm + phân bổ 12 tháng (không chia đều, tự tính Quý/Năm, kiểm tra tổng phân bổ = mục tiêu năm với KR cộng dồn).
- Lưu nháp → Gửi duyệt → Duyệt / Yêu cầu chỉnh sửa; khóa sau duyệt; điều chỉnh qua yêu cầu + lưu phiên bản.

## Bước 3: Kế hoạch & Báo cáo
- Nộp kế hoạch Tháng/Quý/Năm bằng link Google Docs (kiểm tra định dạng, nhắc cấp quyền xem); tách trạng thái thời hạn vs trạng thái duyệt; lưu thời gian nộp đầu tiên.
- Báo cáo Tháng nhập cột Thực tế; Quý/Năm tổng hợp từ tháng (không cộng trùng, không coi tháng thiếu = 0); tách số liệu tạm / đã duyệt.

## Bước 4: Dashboard Tổng quan
- Bộ lọc Năm/Quý/Tháng/Phòng/Nhân viên/KR/Trạng thái; KPI cards; biểu đồ cột Mục tiêu vs Thực tế; đường lũy kế năm; donut nộp đúng hạn; thanh tiến độ KR; so sánh 2 phòng; xếp hạng nhân viên; xem chi tiết từng nhân viên.
- Quy tắc thống kê theo mục 16 của spec (không cộng trùng, không chia 0, "Chưa có dữ liệu" thay vì số giả).

## Bước 5: Kiểm thử & mobile
- Test quy tắc tính (tổng 12 tháng = năm, quý từ 3 tháng, không cộng trùng), phân quyền frontend+backend, deadline, mobile 360–430px, không ảnh hưởng module khác.

## Chi tiết kỹ thuật
- Tiền tệ dùng `numeric(20,0)` (VNĐ nguyên), số lượng `integer` không âm.
- Mọi kỳ tính theo giờ Việt Nam (`Asia/Ho_Chi_Minh`), tái dùng pattern `src/lib/kpi/timeframe.ts`.
- Thông báo deadline: giai đoạn đầu chỉ thông báo nội bộ Base, chống trùng bằng dedupe key; chưa tích hợp Zalo.
- Không sửa logic các module hiện có; không dữ liệu giả.
