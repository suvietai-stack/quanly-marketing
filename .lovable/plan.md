# Tín hiệu cơ hội — phần cần duyệt (quyền, Sửa/Xóa/Hủy, lý do trượt tùy chỉnh)

## Đã làm xong, không đụng dữ liệu
- Bỏ hết lịch hẹn trên giao diện: không còn ô hẹn trong biểu mẫu, không còn bộ lọc "Cần liên hệ hôm nay" / "Quá lịch hẹn", báo cáo không còn phần lịch hẹn. Lịch hẹn cũ vẫn nằm nguyên trong dữ liệu.
- Lọc nhanh đủ 8 nút: Tất cả + 7 trạng thái, có số lượng bên cạnh. Cuộn ngang trên điện thoại.
- Bộ lọc chi tiết: thời gian, nguồn, sản phẩm, nhóm nhu cầu, lý do trượt, và (chỉ với người xem được toàn bộ) Sale, Người tạo, "Chưa phân công".
- Danh sách xếp theo lần cập nhật gần nhất. Thẻ trên điện thoại hiện ngày cập nhật gần nhất.
- Bảng Sale trong báo cáo: Được giao, Đã tiếp nhận, Đang liên hệ, Đang tư vấn, Đã báo giá, Chờ xác nhận/cọc, Chốt, Trượt, Doanh số.
- 69/69 bài kiểm thử đạt, code không có lỗi.

## Cần duyệt — thay đổi cơ sở dữ liệu (chỉ thêm, không xóa dữ liệu)

1. **Sửa lỗ hổng khi sửa tín hiệu (lỗi bảo mật đang được cảnh báo).** Hiện quy tắc sửa kiểm tra người sửa trước khi sửa, nhưng không kiểm tra lại bản ghi sau khi sửa. Sẽ thêm kiểm tra giống hệt sau khi sửa. Sale vẫn không sửa được thông tin gốc (đã được chặn sẵn).
2. **Quyền riêng biệt.** Thêm 2 quyền mới trong phần Vai trò & Phân quyền:
   - "Sửa thông tin tín hiệu" — người có quyền này sửa được thông tin Marketing nhập sai, kể cả tín hiệu đang tư vấn. Người tạo vẫn sửa được tín hiệu của mình khi còn Chờ nhận / chưa giao như hiện nay.
   - "Xóa tín hiệu".
   - Quyền "Quản lý" hiện có vẫn làm được tất cả. Không đổi vai trò Admin đã chỉnh.
3. **Xóa có điều kiện.** Chỉ xóa được khi tín hiệu chưa có nhật ký tư vấn và chưa Chốt/Trượt. Kiểm tra ngay trong cơ sở dữ liệu, không chỉ ẩn nút. Có hộp xác nhận trước khi xóa.
4. **Hủy tín hiệu (khác Trượt).** Thêm 3 cột có thể bỏ trống: thời điểm hủy, người hủy, lý do hủy. Thêm thao tác "Hủy" chỉ cho người có quyền Quản lý, bắt buộc nhập lý do, ghi vào nhật ký. Tín hiệu đã hủy:
   - không tính vào báo cáo thông thường, không tính là Trượt;
   - vẫn giữ toàn bộ lịch sử, xem được qua bộ lọc "Đã hủy";
   - Sale không cập nhật được nữa. Quản lý có thể bỏ hủy.
5. **Menu ba chấm [...]** trên mỗi tín hiệu: Sửa / Xóa / Hủy, chỉ hiện theo quyền.

## Không cần đổi cấu trúc dữ liệu
6. **Lý do trượt tùy chỉnh:** quản lý thêm/ẩn lý do ngay trên trang Tín hiệu, lưu vào danh mục dùng chung đã có. Lý do cũ đã ghi trong lịch sử vẫn hiện đúng.

## Kiểm thử sau khi áp dụng
- Kiểm thử logic: xóa bị chặn khi đã có nhật ký, hủy không bị tính là Trượt, báo cáo loại tín hiệu đã hủy.
- Kiểm thử quyền trong cơ sở dữ liệu nếu môi trường cho phép, bọc trong giao dịch rồi hủy bỏ, không dùng dữ liệu khách thật. Nếu không chạy được sẽ báo rõ.

**Khôi phục:** trả quy tắc sửa/xóa về bản cũ. Các cột hủy có thể bỏ trống nên để nguyên cũng không ảnh hưởng gì.

## Không làm
Không tích hợp Zalo API, không nhắc lịch, không đụng module khác, không Publish.
