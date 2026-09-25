# Tùy chỉnh Nhóm sản phẩm và Nhóm nhu cầu (chờ duyệt)

Phần báo cáo đã xong: bỏ bảng "theo người tạo", giữ 3 phần Tổng quan, Hiệu quả Sale, Phân tích tín hiệu. Dữ liệu "Người tạo" vẫn lưu nguyên.

## Hiện trạng
- Hai danh mục đang cố định trong code. Sản phẩm cho chọn nhiều, còn **Nhóm nhu cầu hiện chỉ chọn được 1**.
- Bảng danh mục dùng chung hiện cho **mọi tài khoản đang hoạt động** ghi được. Nếu chỉ ẩn nút thì vẫn có thể sửa qua API, nên chưa đạt yêu cầu "kiểm tra quyền ở tầng dữ liệu".

## Phương án tối thiểu (cần duyệt vì đổi schema và quy tắc quyền)
1. Thêm quyền mới **"Quản lý danh mục tín hiệu"** (`signal.catalog`) trong Vai trò & Phân quyền. Không tự cấp cho vai trò nào, trừ Super Admin.
2. Lưu hai danh mục trong bảng danh mục dùng chung đang có (thêm 2 dòng `signal_products`, `signal_need_groups`), mỗi lựa chọn có dạng `{ name, active }`. Danh sách hiện tại được đưa vào làm giá trị ban đầu.
3. Đổi quy tắc ghi: các dòng có tên bắt đầu `signal_` (gồm cả Lý do trượt) chỉ người có `signal.catalog` hoặc `signal.manage` ghi được. Các danh mục khác của app giữ nguyên quyền cũ.
4. Nhóm nhu cầu chọn nhiều: thêm cột mới `need_groups text[]` (mặc định rỗng), chép giá trị cũ sang. Cột cũ vẫn giữ và được đánh dấu ngừng dùng, không xóa.
5. Tín hiệu lưu **tên** lựa chọn. Khi ngừng dùng, lựa chọn chỉ bị ẩn lúc tạo mới, tín hiệu cũ vẫn hiện đúng. Khi đổi tên, hệ thống cập nhật tên đó trong các tín hiệu cũ qua một hàm phía máy chủ có kiểm tra quyền. Không bao giờ xóa hẳn.
6. "Khác: nội dung riêng" chỉ lưu trong tín hiệu đó, không thêm vào danh mục chung.

## Giao diện
- Ô chọn nhiều có tìm kiếm, hiện các lựa chọn đã chọn dạng nhãn, gọn trên điện thoại.
- Nút "+ Thêm mới" chỉ hiện với người có quyền. Khi thêm, hệ thống chặn tên trùng (không phân biệt chữ hoa/thường, khoảng trắng thừa) và cập nhật ngay, không cần tải lại trang.
- Trang quản lý nhỏ: đổi tên, ngừng dùng hoặc dùng lại.

## Kiểm thử
Kiểm thử chống tên trùng, ngừng dùng vẫn giữ dữ liệu cũ, đếm báo cáo khi một tín hiệu chọn nhiều nhóm, và ghi danh mục bằng tài khoản không có quyền phải bị từ chối.
