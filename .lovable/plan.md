# Kết quả kiểm tra Publish (chỉ đọc, 12/11/2026 04:29 UTC)

## Bằng chứng
- https://base.suviet.vn trả 200 với header `x-deployment-id` chứa đúng `b03ce5e3-5f4b-4153-89e8-01907fe6ff42`, nên bản deploy mới đang phục vụ production.
- https://quanly-suviet.lovable.app trả 302 về base.suviet.vn (domain chính), nên cả hai địa chỉ đều ra cùng một bản.
- Commit mới nhất là `063d79b4` (04:26:58 UTC). Bản deploy được yêu cầu sau commit này, nên gần như chắc chắn nó nằm trong bản deploy.
- Thử không đăng nhập: /login 200, /organization 200 (trang tải được, cổng đăng nhập chạy phía trình duyệt). Không ghi dữ liệu nào.

## Giới hạn
- Không có công cụ đọc trạng thái deployment theo ID, nên "succeeded" được suy ra từ header đang phục vụ, không lấy từ API.
- Header không ghi mã commit. Việc 063d79b4 có trong deploy được suy ra từ thứ tự thời gian.
- Chưa thử /organization khi đã đăng nhập trên production.
- Cờ "đã publish" của project chỉ cho biết site đang công khai. Bằng chứng có bản mới là header deployment-id, không phải cờ này.

## Bước tiếp theo nếu được duyệt
- Thử trên production với phiên đã được ủy quyền: đăng nhập, rồi mở /organization ở chế độ chỉ đọc, ghi thời gian tải và lỗi console.
