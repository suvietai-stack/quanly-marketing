- [x] Thêm mục Theo Dõi Đơn Hàng “Sắp ra mắt” và trang giới thiệu trên desktop/mobile.
- [x] Bỏ lựa chọn đơn đang thực hiện và mã đơn cũ khỏi biểu mẫu Hỏi Tiến Độ mới.
- [x] Giữ nguyên khả năng xem các lượt cũ và dữ liệu lịch sử.
- [x] Hiển thị số lượng có nhãn riêng trên thẻ sản phẩm ở biểu mẫu, chi tiết hai luồng và phản hồi Cung ứng.
- [x] Đồng bộ tên và mô tả thẻ liên kết trang Tổng Quan với thông tin hệ thống đã lưu.- [x] Theo Dõi Đơn Hàng — GĐ1: danh sách, tạo thủ công, NCC, hành trình, dự kiến/thực tế, nhật ký, quyền backend.
- [x] Theo Dõi Đơn Hàng GĐ2: Tổng quan nhắc việc, Kanban, Lịch cung ứng, điều chỉnh lịch hai bên
- [ ] Theo Dõi Đơn Hàng — GĐ3: báo cáo, Excel, kiểm thử toàn bộ.

- [x] Kiểm tra tài khoản Trung Hiếu (vai trò, quyền, trạng thái)
- [x] Phân quyền KPI / Giao KPI (11 quyền, RLS, giao diện)

- [x] Tài Chính Kế Toán → Tiền Về (Casso webhook, bảng tài khoản ngân hàng do Admin quản lý)
- [ ] Nhập CASSO_WEBHOOK_SECRET + cấu hình Webhook trên Casso (chờ người dùng)
- [ ] Tiền Về: bảo mật giao dịch theo Sale, tổng theo quyền, tìm chính xác số tiền, giao diện người xác nhận và kiểm thử.
- [x] Tiền Về — loại Khác: rút gọn form, đối soát trực tiếp có quyền, khóa chống xử lý trùng, bảo toàn luồng cũ; 14 kiểm tra đạt.
- [x] Tiền Về — mốc vận hành chỉ Super Admin xác nhận, lịch sử kiểm thử riêng, chặn truy cập và gửi lại thông báo giao dịch cũ; không tự reset.
- [ ] Tiền Về — thử bấm "Bắt đầu vận hành" bằng Super Admin thật (chờ người dùng xác nhận thao tác thật).
- [ ] Tiền Về — loại Khác: kiểm thử 4 tình huống bằng Sale/Kế toán thật (chờ tài khoản đăng nhập trong preview; --self không có tài khoản khớp).
