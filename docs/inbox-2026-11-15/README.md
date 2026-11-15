# Hộp thư đa Page

Dùng chung Meta App, OAuth và Page tokens của Lead. Mỗi Page có lựa chọn Nhận Lead / Nhận tin nhắn độc lập. Sidebar và launcher dùng chung khu vực Hộp thư. Chat Web chỉ hiển thị Sắp ra mắt.

## Kích hoạt

SQL ở đây được đóng gói để duyệt, chưa tự áp dụng production. Trước khi áp dụng, chụp backup/PITR database và ghi nhận source đang chạy. Kiểm tra SHA256SUMS. Chạy preflight.sql, implementation.sql, postflight.sql trong **một transaction** bằng tài khoản migration, dừng ở lỗi đầu tiên. Không chạy qua tài khoản nhân viên. Nếu Inbox đã được cài thì preflight dừng để tránh ghi đè.

Không thay Role hay cấp quyền cho nhân sự trong migration. Quản trị cấu hình quyền inbox.view/send/assign/resolve/manage trong kho Role hiện có, sau đó cấp Page cụ thể ở Hộp thư. Tài khoản hoạt động và quyền phía máy chủ vẫn bắt buộc; Super Admin có quyền quản trị theo quy tắc Base sẵn có.

Kết nối lại Facebook qua nút Kết nối Page, cấp quyền pages_messaging và nhiệm vụ MESSAGING phù hợp. Meta App cần được xét duyệt/quyền truy cập tương ứng cho người dùng thật; kiểm tra trong Meta Dashboard. Webhook Page của App cần bật messages/message_echoes/message_deliveries/message_reads cùng leadgen. Base đăng ký các Page bằng phép hợp các trường, không xóa đăng ký nhận Lead.

## Hành vi

Chỉ nhận tin mới kể từ khi bật Messenger; không tuyên bố đã tải toàn bộ lịch sử cũ. Page/khách được định danh theo Page ID và PSID, không tự hợp khách giữa nhiều Page. Tên khách có thể hiển thị bằng mã nếu Meta chưa cấp thông tin. Trả lời văn bản trong cửa sổ 24 giờ; hiển thị tệp đính kèm nhận được khi URL nằm trong miền Meta được phép. Chưa gửi tệp, tự động trả lời, thu thập bình luận hay gắn CRM.

Tắt Nhận Lead không sửa mapping/switch riêng của Form. Lead chờ xử lý trong thời gian Page tắt hoặc trước lần bật lại được bỏ qua, không tự nhập bù. Tắt Messenger dừng tiếp nhận và gửi, giữ lịch sử. Subscription cũ vẫn giữ nguyên để không ảnh hưởng các chức năng khác. Khi token/quyền bị Meta thu hồi, lỗi gửi hiển thị và cần kết nối lại; trạng thái xác minh chỉ là lần kiểm tra gần nhất.

Realtime dùng Postgres Changes với RLS và đối chiếu khi kết nối lại/định kỳ 30 giây khi hiển thị. Không bảo đảm độ trễ cố định. API gửi dùng khóa request duy nhất, kết quả mơ hồ không tự gửi lại; echo hợp với bản ghi gửi. Không gửi tin thật khi kiểm thử.

## Hoàn nguyên

Dùng rollback.sql để ngừng Inbox mà giữ nguyên dữ liệu, rồi deploy source trước đó. Giữ backup và toàn bộ lịch sử mới; không DROP bảng hay xóa token. Khôi phục toàn database chỉ là phương án có điều phối vì có thể làm mất thay đổi nghiệp vụ khác.
