# Chuẩn hóa cơ cấu tổ chức cấp Khối — 31/10/2026

## Đã triển khai
- Danh mục thêm Giám Đốc Điều hành cấp 5 và Phó Giám Đốc Điều hành cấp 4; giữ Giám Đốc Hệ 3, Trưởng Phòng 2, Trưởng Nhóm 1, Nhân viên 0. Không bổ nhiệm người thật tự động.
- Hai vị trí cấp Khối nằm phía trên ba Hệ; bổ nhiệm trực tiếp theo vị trí, xem trước quyền. Thay đổi tự chọn quyết định cũ để thay thế hoặc giữ kiêm nhiệm; hỗ trợ phân công legacy hiện có.
- Phạm vi cấp Khối không gắn giả vào một Hệ. Người duyệt chức vụ cấp Khối được xác định độc lập với Hệ của hồ sơ; Phó không thay bước bắt buộc của Giám Đốc.
- Quyền Admin đáng tin cậy (`role-admin`) và Super Admin được xử lý riêng trong module Kinh doanh, không thay Role hoặc quyền các module khác. Giám Đốc Điều hành có quyền can thiệp đặc biệt theo yêu cầu, có lý do/nhật ký; Phó không có quyền này.
- Phân quyền thay bảng checkbox bằng bảng quyền tự động chỉ đọc, chọn nhân sự xem quyền thực tế; ngoại lệ nằm trong phần nâng cao, chỉ Admin/Super Admin quản lý.
- Backend cập nhật phạm vi theo thời điểm hiệu lực ở mỗi truy vấn. Sau lưu bổ nhiệm, phiên người thao tác làm mới quyền/cache ngay; phiên người được bổ nhiệm dùng cơ chế focus/visibility/chu kỳ 30 giây và mốc hiệu lực có sẵn, không cần đăng nhập lại. Chưa bổ sung kênh realtime tức thì cho phiên khác.

## Thay đổi kỹ thuật
- Migration `0140_biz_block_leadership_and_appointment_transition.sql`.
- RPC/helper: `biz_admin`, `biz_can`, `biz_all_scope`, `biz_appointment_guard`, `biz_appointment_save`, `biz_resolve_position`, `biz_approval_override`, `biz_approval_adopt`, `biz_exception_save`, `biz_effective_access`; chính sách đọc ngoại lệ giới hạn Admin và người nhận.
- Hai mục danh mục chức vụ được thêm qua thao tác dữ liệu, không chèn dữ liệu trong migration.
- Không thu hồi thêm Role cũ: ngoại lệ Viewer toàn Khối đã được xác nhận ở lượt trước vẫn giữ; Role Giám Đốc không được mở rộng. Quyền cài đặt Kinh doanh cũ không còn bảng tick riêng trong trang Phân quyền Kinh doanh.
- Thay thế một quyết định hoặc phân công legacy trong cùng transaction; nếu bổ nhiệm mới lỗi thì việc kết thúc cũ rollback. Không sửa người duyệt trong snapshot hồ sơ đã gửi.
- Can thiệp hiện áp dụng trên luồng KR/điều chỉnh báo cáo đang chờ. Luồng nộp bù vẫn theo thứ tự; không thêm nút can thiệp nộp bù hoặc sửa trực tiếp phiên bản đã chốt.

## Kiểm thử và dữ liệu
- 164/164 kiểm thử Biz đạt; ứng dụng báo build OK.
- Kiểm thử database tách biệt: cấp 5/4, phạm vi toàn Khối, không nghĩa vụ cá nhân mặc định, Admin riêng Biz, Phó không can thiệp/duyệt trước lượt, không tự duyệt, resolver chức vụ, xung đột nhiệm kỳ, thay người khác và rollback, thay legacy giữ lịch sử.
- Playwright phiên Super Admin thật: cây ba Hệ/danh mục cấp Khối; mở bổ nhiệm không chọn Hệ; thay Giám Đốc Phân Phối chọn đúng phân công của Lê Minh Ngọc; bảng quyền tự động; chỉ một hộp bổ nhiệm theo vị trí. Không nhấn xác nhận ghi bổ nhiệm thật.
- Desktop và mobile 360/375/390/430px không tràn ngang, không lỗi runtime. Chipi hiện có vẫn có thể che một phần nội dung khi bong bóng mở; không thay Chipi trong yêu cầu này.
- Trước/sau: 1 mục tiêu, 3 tài liệu, 0 bổ nhiệm catalog, 5 phân công quản lý legacy giữ nguyên; chỉ thêm 2 mục chức vụ. Không tạo DEMO, nhân sự, Showroom hoặc hồ sơ thử.

## Chưa nghiệm thu
- Chưa bổ nhiệm/thay thế/miễn nhiệm người thật qua UI vì chưa có thông tin bổ nhiệm được xác nhận; quy tắc đã kiểm trong database tách biệt.
- Chưa kiểm UI bằng từng tài khoản Sale/Trưởng Nhóm/Trưởng Phòng/Giám Đốc/Phó điều hành. Phiên hiện tại là Super Admin; hai vị trí cấp Khối đang trống.
- Chưa xác minh can thiệp trên hồ sơ thật đang duyệt. Không sửa lịch sử hoặc quyền ngoài Biz để kiểm thử.
- Chưa Publish; thay đổi dữ liệu/backend dùng chung đã có hiệu lực theo mô hình backend hiện tại.