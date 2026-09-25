# Hoàn thiện module "Tín hiệu cơ hội" — đề xuất chờ duyệt

Bước 1 (kiểm tra) đã xong. Bản này gồm Bước 2 (sửa bằng code) và Bước 3 (thay đổi cơ sở dữ liệu cần duyệt). Khi bạn duyệt, tôi mới áp dụng.

## Hiện trạng
- Cơ sở dữ liệu chỉ cho phép 4 trạng thái (Chờ nhận, Đang tư vấn, Chốt, Trượt). Hiện có đúng 1 tín hiệu, đang ở trạng thái Chốt.
- Lịch sử tư vấn chỉ có ghi chú, trạng thái trước/sau, ngày hẹn. Chưa có diễn biến, phương thức hay giờ hẹn.
- Hàm cập nhật của Sale chặn các bước "quay lại" và chỉ biết 4 trạng thái.
- Danh sách tải tối đa 2.000 dòng và cắt bớt mà không báo.
- Bộ nhớ tạm dùng chung một khóa cho mọi tài khoản và không bị xóa khi đăng xuất.

## Phần 1 — Sửa bằng code (không cần đổi dữ liệu)
- **Bộ nhớ tạm theo tài khoản:** khóa dữ liệu có mã người dùng. Xóa toàn bộ dữ liệu tín hiệu, nhật ký và báo cáo khi đăng xuất hoặc đổi tài khoản, kể cả khi không tải lại trang.
- **Không cắt dữ liệu:** tải theo từng trang 1.000 dòng cho đến hết, thay cho giới hạn 2.000.
- **Tạo rồi mới giao Sale:** nếu tạo được nhưng giao thất bại thì báo "Đã tạo tín hiệu, chưa phân công thành công" và có nút "Thử phân công lại". Bấm lại không tạo tín hiệu trùng.
- **Cảnh báo trùng số điện thoại:** chỉ đối chiếu với những tín hiệu người nhập được phép xem. Có cảnh báo nhưng vẫn cho tạo.
- **Mobile:**
  - Thẻ tín hiệu hiện khách hàng, nhu cầu, trạng thái, diễn biến gần nhất và ngày hẹn.
  - Trang chi tiết có 3 nút: Nhắn Zalo (mở `zalo.me/<số>`, ghi rõ có thể không mở thẳng được cuộc trò chuyện), Gọi điện, Cập nhật diễn biến.
  - Biểu mẫu mở dạng bảng trượt từ dưới lên, nút Lưu cố định ở cuối.
  - Nhật ký hiện 3 mục gần nhất, có nút "Xem toàn bộ nhật ký".
- **Bộ lọc:**
  - Lọc nhanh dạng thanh cuộn ngang: Tất cả, Chờ nhận, Cần liên hệ hôm nay, Quá lịch hẹn, Đã báo giá, Chờ xác nhận/cọc.
  - Nút "Bộ lọc" mở bảng chi tiết: trạng thái, thời gian (Hôm nay / 7 ngày / Tháng này / Tùy chỉnh), nguồn, sản phẩm, nhóm nhu cầu, Sale, người tạo, ngày hẹn, lý do trượt, "Chưa có diễn biến". Có nút Áp dụng và Xóa bộ lọc.
  - Lọc theo Sale và theo người tạo chỉ hiện với người có quyền xem toàn bộ.
- **Lý do trượt:** dùng 9 lý do mặc định. Chọn "Khác" thì hiện ô nhập lý do riêng. Lý do được lưu dạng chữ, nên sau này đổi danh mục thì lịch sử cũ vẫn hiện đúng.
- **Báo cáo:** giữ trang hiện có và bổ sung:
  - Tổng quan đủ 7 trạng thái.
  - Phần theo dõi quá trình: chưa có diễn biến, cần liên hệ hôm nay, quá lịch, đã báo giá, chờ cọc.
  - Phân tích lý do trượt.
  - Bảng Sale có thêm các cột trạng thái mới.
  - Vẫn chọn rõ tính theo ngày tạo hay ngày chốt/trượt. Không dùng số ghi chú làm chỉ tiêu.

## Phần 2 — Thay đổi cơ sở dữ liệu (CHỜ DUYỆT)
Chỉ thêm vào, không xóa cột hay dữ liệu nào.

1. **7 trạng thái:** thay điều kiện trạng thái thành `waiting, contacting, consulting, quoted, deposit, won, lost`. Tín hiệu cũ giữ nguyên mã, vì 4 mã cũ đều nằm trong 7 mã mới. Không suy đoán rằng khách từng được báo giá.
2. **Nhật ký:** thêm vào bảng lịch sử tư vấn các cột có thể bỏ trống: `event_type` (diễn biến), `channel` (mặc định Zalo), `next_contact_at` (ngày + giờ hẹn). Thêm `next_contact_at` vào tín hiệu. Các ghi chú cũ vẫn giữ và vẫn hiển thị.
3. **Hàm cập nhật của Sale:** viết lại `signal_sale_update` và giữ tên hàm cũ. Hàm mới:
   - nhận thêm diễn biến, phương thức và giờ hẹn;
   - cho phép chuyển giữa mọi trạng thái đang mở, không bắt đi đủ các bước;
   - cho phép chỉ thêm diễn biến mà không đổi trạng thái;
   - vẫn bắt nhập doanh số khi Chốt và lý do khi Trượt;
   - vẫn chỉ Sale được giao (hoặc quản lý) mới dùng được.
   
   Cập nhật thêm hàm giao Sale, hàm mở lại và trigger bảo vệ để chúng nhận 7 trạng thái.
4. **Mở lại không mất lịch sử:** doanh số và lý do cũ vẫn nằm trong nhật ký, kèm sự kiện "mở lại". Cách ghi này đã có sẵn và sẽ được giữ.
5. **Quyền xem và sửa:** không đổi. Sale chỉ đọc tín hiệu giao cho mình, không có quyền sửa trực tiếp, và mất quyền ngay khi bị đổi Sale.
6. **Role Kinh doanh:** tạo vai trò mẫu "Kinh doanh" có sẵn quyền `signal.sale`, chỉ khi hệ thống chưa có vai trò này. Không đổi vai trò Admin đã chỉnh.

**Khôi phục:** chỉ cần đưa điều kiện trạng thái và các hàm về bản cũ. Các cột mới có thể bỏ trống nên để nguyên cũng không ảnh hưởng gì.

## Kiểm thử
- Kiểm thử logic: 7 trạng thái, lý do Khác, bộ lọc (trạng thái, thời gian, lịch hẹn, chưa có diễn biến), báo cáo theo ngày tạo và ngày chốt, phân trang không cắt dữ liệu.
- Kiểm thử quyền ngay trong cơ sở dữ liệu với 2 tài khoản giả Julia và Hoa Ngâu, bọc trong một giao dịch rồi hủy bỏ, không dùng dữ liệu khách thật. Nội dung kiểm: mục 10–13 và 16 trong tài liệu.
- Kiểm tra việc chuyển tài khoản không tải lại trang để xác nhận không lộ dữ liệu cũ. Mở trang trên kích thước điện thoại.
- Chạy typecheck, build và 56 bài kiểm thử cũ.

## Không làm
Không tích hợp Zalo API, không làm CRM, không tạo báo cáo thứ hai, không động vào module khác, không Publish.
