# Kiểm tra Publish chỉ đọc — kết quả và bước còn lại

## Đã kiểm tra (07:37:52 UTC)
- https://base.suviet.vn/organization: HTTP 200, bản đang chạy `83bb5dfa-681e-42d7-bb18-fa24d5a57aa5`.
- https://quanly-suviet.lovable.app/organization: 302 chuyển sang base.suviet.vn.
- Bản `6b5294aa-6ea2-4fac-82c7-b4c13cd0be0` **chưa thấy live**. Mã này cũng thiếu 1 ký tự so với định dạng chuẩn, nên cần đối chiếu lại mã đầy đủ.
- `83bb5dfa` là bản do lượt Publish lúc 07:35 tạo ra, gồm bản sửa tải theo tab đã đạt 372 kiểm thử.

## Bước còn lại khi được duyệt (chỉ đọc)
1. Kiểm tra lại mã bản đang chạy một lần nữa; không Publish lại.
2. Mở trình duyệt bằng phiên Super Admin: vào Cơ cấu tổ chức, rồi mở hồ sơ một người, rồi mở phần Nguồn quyền. Xác nhận phần quyền thực tế chỉ được tải khi mở tab đó, không bấm lưu hay thay đổi gì.
3. Ghi lại thời gian tải của trang Cơ cấu tổ chức và có lỗi quá thời gian chờ hay không.

## Không làm
Không ghi dữ liệu, không SQL, không sửa Role, không Publish lại. Lỗi chậm từ máy chủ vẫn như cũ vì SQL tối ưu chưa áp.
