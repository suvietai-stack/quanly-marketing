# Thông báo Zalo OA cho module Tín hiệu cơ hội

## Hiện trạng đã kiểm tra
- Base chưa có chức năng thông báo nội bộ nào → cần tạo mới một bảng thông báo gọn (không phải hệ thống lớn).
- Chưa có kết nối Zalo, chưa có khóa bí mật Zalo trong backend.
- Quyền nhận đã có sẵn: `signal.assign` (người phân công), `assigned_to` (Sale được giao), RLS tín hiệu đã kiểm tra lại quyền khi mở liên kết.

## Kết luận về chính sách Zalo (cần Admin xác nhận với gói OA thực tế)
- Tin **ZNS** gửi theo SĐT, tính phí, mẫu phải duyệt và dành cho khách hàng → không dùng.
- Tin **Truyền thông/ZBS** tốn phí, không phải mục đích thông báo nội bộ → không mặc định dùng.
- Tin **Tư vấn (CS)** gửi được miễn phí tới người đã quan tâm OA, nhưng chỉ trong **khung thời gian sau lần tương tác gần nhất của người đó với OA** (hiện là 7 ngày; hạn mức phụ thuộc gói OA). Đây là loại phù hợp nhất nhưng có giới hạn: nhân viên không nhắn OA quá khung thời gian sẽ **không nhận được**; khi đó thông báo chuyển trạng thái "Không đủ điều kiện gửi" và vẫn nằm trong Base.
- Nếu gói OA không cho gửi tin Tư vấn → dừng ở thông báo nội bộ và báo lại.

## Liên kết Zalo nhân viên (chính thức, không nhập UID, không đoán theo SĐT)
1. Nhân viên bấm "Liên kết Zalo" trong hồ sơ → Base tạo mã một lần (hết hạn 15 phút).
2. Nhân viên quan tâm OA Sứ Việt và nhắn mã đó cho OA.
3. Webhook Zalo (đã kiểm chữ ký) nhận `user_id` + mã → backend khớp đúng phiên của tài khoản đó → lưu liên kết.
Việc nhắn tin này cũng mở khung gửi tin Tư vấn.

## Phần sẽ xây
- **Cài đặt > Tích hợp Zalo OA** (chỉ Admin): Kết nối OA qua OAuth chính thức, tên OA, trạng thái kết nối/quyền gửi, số nhân viên đã liên kết, Kiểm tra kết nối, Gửi tin thử, Ngắt kết nối, công tắc **Gửi tự động (mặc định TẮT)**.
- **Hồ sơ > Thông báo Zalo**: Chưa liên kết / Đã liên kết / Không còn hiệu lực + nút Liên kết.
- **Chuông thông báo trong Base**: danh sách thông báo của chính người dùng, bấm mở tín hiệu (Base kiểm lại quyền).
- **Hai sự kiện** (tạo trong DB bằng trigger, không phụ thuộc giao diện):
  - Tín hiệu mới → người có `signal.assign` còn hoạt động.
  - Phân công/chuyển Sale → chỉ Sale mới. Sửa thông tin khác không tạo thông báo. Khóa duy nhất (sự kiện, tín hiệu, người nhận, lượt phân công) chống gửi trùng.
- Nội dung tin chỉ: "BASE MARKETING — Có tín hiệu mới đang cần xử lý." / "Bạn vừa được giao một tín hiệu cơ hội mới." + nút Xem tín hiệu. Không SĐT, địa chỉ, nhu cầu, doanh số.
- Gửi Zalo chạy sau, lỗi không ảnh hưởng tạo/giao tín hiệu; tối đa 3 lần thử; log không chứa token/SĐT.

## Cần Admin chuẩn bị / phê duyệt
1. Tạo ứng dụng trên Zalo for Developers, liên kết với OA Sứ Việt, cấp quyền gửi tin OA và nhận webhook; cung cấp **App ID** và **App Secret** (lưu bí mật ở backend) và **OA Secret Key** cho webhook.
2. Callback URL: `https://basemarketing.suviet.vn/api/public/zalo/oauth-callback`; Webhook URL: `https://basemarketing.suviet.vn/api/public/zalo/webhook` (sự kiện "người dùng gửi tin nhắn"). Chỉ chạy sau khi Publish.
3. Migration mới (chỉ thêm, không sửa bảng cũ): `notifications`, `zalo_links`, `zalo_link_codes`, bảng token OA chỉ backend đọc được, trigger tạo thông báo trên `opportunity_signals`. RLS: mỗi người chỉ đọc thông báo/liên kết của mình.
4. Publish để Zalo gọi được callback/webhook; sau đó gửi tin thử tới 1 tài khoản, rồi Admin mới bật gửi tự động.

## Chi tiết kỹ thuật
- Token OA lưu trong bảng riêng không grant cho authenticated/anon; tự làm mới bằng refresh token trước khi hết hạn; hết hiệu lực → trạng thái "Mất kết nối".
- Gửi tin qua server route (không tạo Edge Function mới, theo chuẩn dự án), kích hoạt ngay sau thao tác + nút "Thử lại" cho Admin.
- Endpoint gửi tin Tư vấn: `POST https://openapi.zalo.me/v3.0/oa/message/cs`.
