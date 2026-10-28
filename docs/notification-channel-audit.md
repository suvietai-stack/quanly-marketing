# Kiểm tra độc lập ba kênh thông báo

Thời điểm đối soát: 28/10/2026, khoảng 06:57–07:10 UTC. Chỉ đọc production; chưa Publish, chưa đổi token, chưa xóa/đổi hàng đợi hay tạo tín hiệu thử trên dữ liệu thật.

## Nguyên nhân đã xác minh

- `src/lib/push.server.ts` chỉ chọn pending tạo trong 30 phút gần nhất. Production có **40 pending thuộc các loại được hỗ trợ đã quá 30 phút**; điều kiện này khiến chúng không được chọn lại. Tổng pending 240 bao gồm nhiều loại vốn không được bật Push, không được coi toàn bộ là tin bị mất.
- Một notification ở `processing` từ **28/09/2026**, cùng một delivery `sending`, attempts 0. Code không có lease hoặc đường phục hồi processing.
- Không có lịch phục hồi Push trong `cron.job` tại thời điểm đọc. Các lịch đang hoạt động: Zalo care hàng giờ, Facebook maintain hàng giờ, Website Forms mỗi 5 phút.
- Delivery unique theo notification + subscription ngăn insert trùng nhưng cũng khiến delivery đã tồn tại ở sending/failed bị bỏ qua; không có cơ chế reclaim có điều kiện.
- Code thử lại HTTP 5xx/429 ngay trong vòng lặp nhưng lưu attempts cố định 1, không phản ánh số lần gửi. Timeout không retry trong cùng lần chạy nhưng bị ghi chung là failed.

## Chưa xác minh là nguyên nhân sự cố thực tế

- Không thấy điều kiện kết nối Zalo chặn Push hoặc chuông/Chipi. API tín hiệu và đơn từ đánh thức hai kênh riêng sau RPC, có catch riêng. Không thể kết luận Zalo -233 trực tiếp gây mất thông báo Base chỉ từ hiện tượng đồng thời.
- `leave_zalo_wake` đọc/cast boolean cấu hình bên ngoài khối bắt lỗi; cấu hình sai có thể làm rollback INSERT notification. Đây là nguy cơ từ code/function hiện hành, **chưa có bằng chứng rollback cụ thể đã xảy ra**.
- `push_wake` cũng chỉ bắt lỗi HTTP wake, chưa bắt toàn bộ phần đọc cấu hình/thiết bị. `zalo_queue_wake` đã có catch toàn hàm.
- Chuông đếm chưa đọc trong 30 dòng hiển thị, không phải tổng chưa đọc toàn bộ. Chipi dùng cùng cache recipient-scoped và không gọi Zalo.

## Trạng thái triển khai

Bản xem trước chính và production dùng chung một backend. Để không thay đổi production khi người dùng yêu cầu chỉ preview, đã tạo bản nháp **Tách ba kênh thông báo** để thực hiện sửa và kiểm thử riêng. Bản nháp phải xác minh backend cô lập trước mọi migration hoặc gửi tin; không gửi đến endpoint thiết bị thật từ dữ liệu sao chép.

Chưa sửa sender/trigger trên main; chỉ thêm tài liệu, yêu cầu được ghi nhớ và task theo dõi. Kết quả sửa, danh sách file và kiểm thử sẽ được bản nháp báo lại khi hoàn tất.

## Kiểm thử còn chờ

- Phiên main đang đăng xuất; tạo phiên của người yêu cầu thất bại vì không có tài khoản khớp. Không chọn tài khoản nhân viên khác để thử.
- Chưa tạo tín hiệu thật hoặc xác nhận điện thoại nhận Web Push/Chipi khi Zalo offline.
- Kiểm thử giả lập timeout/failed/processing và chống trùng cần thực hiện trên bản nháp, không được coi là đã đạt.
- Xác nhận nhận trên điện thoại thật cần bằng chứng thiết bị; phản hồi HTTP thành công từ dịch vụ Push chỉ xác nhận được chấp nhận, không chứng minh hiển thị trên điện thoại.