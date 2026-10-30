# Chức vụ và DEMO Kinh doanh

## Bổ sung
- Danh mục động bốn chức vụ ban đầu, chỉnh tên/mô tả/cấp/đơn vị/thứ tự/bật tắt, danh sách người giữ chức vụ.
- Quyết định bổ nhiệm riêng có hiệu lực, phạm vi, kiêm nhiệm, thay thế/kết thúc/hủy và snapshot lịch sử; giữ dữ liệu quản lý cũ.
- Luồng chọn chức vụ, người cụ thể/thay thế; xem trước phụ trách, cảnh báo thiếu; tự duyệt bị chặn, chuyển lên cấp trên cần cấu hình hợp lệ.
- Phạm vi Role dùng chung, quyền thao tác riêng; can thiệp Super Admin dùng cơ chế audit hiện có.
- DEMO tại `/biz/demo`: kho JSON riêng mỗi Admin, tạo lại/xóa có xác nhận, không ghi hồ sơ/Role/cơ cấu/thông báo/Sao vận hành.
- Dashboard DEMO dùng `biz_dashboard_aggregate`, lọc Hệ/Phòng/Nhóm/người, số tạm/chính thức; mục tiêu phân bổ 12 tháng; kế hoạch/báo cáo, tài liệu mẫu, thao tác giả lập và lịch sử nhãn DEMO.

## Database
Migrations 0111–0116: biz_positions, biz_appointments, app_roles.biz_scope; guards/RPC chức vụ và xét duyệt; biz_demo_sets/RPC mô phỏng và phép tính numeric. Bốn chức vụ mặc định được thêm riêng, không tự gán người hoặc bật quy trình.

## Xác minh
- 109 tests Biz đạt trước bổ sung regression numeric 0116; quy tắc SQL chạy tách biệt.
- Tài khoản Admin thật: sửa/lưu nguyên cấu hình Giám Đốc và đọc lại, mở bổ nhiệm và chọn chức vụ trong luồng; không gán nhân sự thử.
- DEMO thật: khởi tạo, nộp kế hoạch giả lập, xóa và trở lại /biz; không lỗi trình duyệt; 360/375/390/430px không tràn.
- Chức vụ mobile 360/390/430px không tràn. Build OK.

## Chưa đầy đủ
- DEMO mục tiêu hiện chỉ xem phân bổ; chưa có chỉnh/sửa/gửi mục tiêu thử, hồ sơ Quý/Năm riêng hoặc 2027.
- Góc nhìn DEMO là phạm vi mô phỏng, không thay danh tính/quyền thật; chưa kiểm đầy đủ từng tài khoản quản lý thật.
- Luồng DEMO theo cấu hình hiện có; nếu không có luồng thì chặn duyệt mô phỏng, không tự dựng ba cấp. Chưa đủ tình huống cấp 1/2/3 hoặc can thiệp khi chưa có cấu hình tương ứng.
- Chưa đầy đủ biểu đồ tỷ lệ từng KR/so sánh Hệ/Nhóm và nhãn thiếu dữ liệu Showroom trên tab Dashboard; tab Cơ cấu để Showroom trống.
- Tạo DEMO riêng cho người có quyền nhưng không phải Super Admin chưa có cơ chế chia sẻ bộ DEMO.
- Bổ nhiệm mới không tự thay membership phòng/nhóm; điều chuyển thành viên vẫn thao tác riêng theo cơ chế cũ, chưa có một biểu mẫu hợp nhất có lịch hiệu lực cho cả hai.
- Không Publish. Không ghi dữ liệu demo vào hồ sơ vận hành.