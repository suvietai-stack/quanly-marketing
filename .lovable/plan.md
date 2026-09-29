# Theo Dõi Đơn Hàng — Giai đoạn 1

Làm theo tài liệu, chia 3 giai đoạn. Đợt này chỉ làm **Giai đoạn 1**, có phân quyền kiểm tra ở backend ngay từ đầu. Xong sẽ báo cáo và chờ anh/chị duyệt trước khi sang Giai đoạn 2.

## Người dùng sẽ thấy gì
- Mục **"Theo Dõi Đơn Hàng"** (bỏ nhãn "Sắp ra mắt") mở ra trang có các tab: **Danh sách đơn** và **Nhà cung cấp** (các tab Tổng quan, Kanban, Lịch, Báo cáo để các giai đoạn sau).
- **Tạo đơn thủ công**: Loại đơn (Mẫu / Sản xuất), tên đơn, ngày khách nhận (bắt buộc, hiển thị nổi bật), giờ nhận, địa chỉ giao, Kinh doanh phụ trách, Cung ứng phụ trách, link CRM, ghi chú. Mã tự sinh **BASE-DH-000001**. Không nhập sản phẩm, giá, thông tin khách.
- **Danh sách đơn**: tìm kiếm, tab trạng thái, bộ lọc thu gọn, thẻ gọn trên điện thoại, cảnh báo sắp đến hạn / quá hạn.
- **Chi tiết đơn**: ngày khách nhận ở đầu trang, nút "Xem trên CRM", thanh hành trình trực quan và từng công đoạn:
  - Tiếp nhận → Đặt phôi → (Đặt hộp, song song) → (In ấn & Gia công) → Đóng gói → Giao hàng.
  - Khi lập kế hoạch, Cung ứng tích "Có đặt hộp" / "Có in ấn / gia công".
  - Đặt phôi / đặt hộp: NCC, người phụ trách, số lượng, ngày dự kiến / thực tế, **ghi nhận hàng về nhiều lần**, tự tính còn thiếu, không cho nhận vượt số đặt.
  - Gia công: "+ Thêm lượt gia công" (NCC, loại In ấn / Kẻ vàng / Khác, số lượng); mỗi lượt có việc **xác nhận đã gửi mail sản xuất**, gửi phôi, nhận hàng nhiều lần.
  - Quy tắc: chưa có phôi thì không gửi gia công được, chưa xác nhận gửi mail thì không nhận gia công, chưa đủ hàng (và hộp nếu cần) thì không đóng gói, đủ số lượng mới được hoàn tất. Có cảnh báo rõ ràng.
  - Sửa thời gian thực tế phải ghi lý do; đổi hạn dự kiến vẫn giữ lại hạn cũ.
  - **Nhật ký** không xóa: ai, lúc nào, giá trị cũ → mới.
- **Nhà cung cấp**: thêm, sửa, ngừng dùng, kích hoạt lại (không xóa hẳn); một NCC có thể thuộc nhiều nhóm (Phôi, Hộp, In ấn, Gia công, Vận chuyển, Khác).
- **Cài đặt → Theo dõi đơn hàng**: công tắc "Cho phép tạo đơn thủ công" (mặc định bật; tắt đi không ảnh hưởng đơn cũ).

## Phân quyền (15 quyền mới trong Vai trò & Phân quyền)
Xem đơn phụ trách, Xem toàn bộ đơn, Tạo đơn thủ công, Tiếp nhận đơn, Phân công, Xem việc được giao, Cập nhật công việc, Cập nhật tiến độ công đoạn, Đề xuất / Phản hồi điều chỉnh lịch, Quản lý NCC, Quản lý đơn, Xem / Xuất báo cáo, Quản lý cài đặt. **Mặc định chưa cấp cho vai trò nào** (Admin tổng vẫn có đủ) — anh/chị tự cấp trong Cài đặt.

## Tác động dữ liệu (cần anh/chị đồng ý)
- Chỉ **thêm bảng mới** cho module này. Không sửa hay xóa dữ liệu của module khác, không đụng Hỏi Giá & Tiến Độ, Task, Order Thiết kế.
- Công việc cung ứng lưu riêng, gắn với đơn và công đoạn — không lẫn vào Task hiện có.
- Không làm API MISA, kho, giá vốn, công nợ. Không Publish.

## Chi tiết kỹ thuật
- Bảng: `ot_settings`, `ot_suppliers`, `ot_orders` (mã từ sequence), `ot_tasks` (stage, kind, supplier_id, assignee, qty, planned/actual dates, status: todo/doing/waiting/done — sẵn cho Kanban GĐ2), `ot_receipts` (lần nhận hàng), `ot_logs` (nhật ký chỉ thêm), `ot_due_history`.
- Client chỉ SELECT (RLS theo `private.sig_can` + phạm vi phụ trách); mọi ghi qua RPC `ot_*` SECURITY DEFINER dùng giờ server, kiểm tra quy tắc phụ thuộc và số lượng dưới `FOR UPDATE`.
- Quy tắc phụ thuộc viết thuần ở `src/lib/orderTracking/logic.ts` (có test) và đồng bộ với `private.ot_check`.
- Cập nhật AGENTS.md: thay luật "Order tracking remains a data-free placeholder".
