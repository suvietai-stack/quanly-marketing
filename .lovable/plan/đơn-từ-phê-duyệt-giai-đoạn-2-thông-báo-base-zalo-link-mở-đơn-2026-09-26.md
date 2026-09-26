# Đơn từ & Phê duyệt — Giai đoạn 2 (Thông báo Base/Zalo, link mở đơn, nhắc duyệt)

## Người dùng sẽ thấy
- **Chuông thông báo trong Base** có thêm tin về đơn từ; bấm vào mở thẳng đơn (`/leave?open=<id>`).
- **Tin Zalo OA** (chỉ gửi cho người đã liên kết Zalo, dùng hệ thống gửi hiện có):
  - Người duyệt: "📝 ĐƠN MỚI CẦN DUYỆT" khi có đơn gửi/gửi lại/chuyển người duyệt, và khi có yêu cầu hủy.
  - Người đứng tên: kết quả "Đã duyệt / Từ chối (kèm lý do) / Đã hủy / Từ chối hủy"; khi có người tạo hộ.
  - Nội dung: loại đơn, người đứng tên, thời gian nghỉ/muộn/sớm, tổng ngày/phút, lý do (tên danh mục) + nút "XEM ĐƠN". Không gửi phần chi tiết tự nhập.
- **Link mở đơn:** mở đúng đơn toàn màn hình trên điện thoại; chưa đăng nhập → đăng nhập xong tự mở lại; không có quyền → "Bạn không có quyền xem đơn này".
- **Nhắc duyệt:** đơn chờ quá N giờ (mặc định 4 giờ, chỉnh trong Cài đặt → Đơn từ) được nhắc người duyệt tối đa 1 lần/đơn/ngày; gộp nhiều đơn thành một tin. Đơn sắp tới giờ bắt đầu mà chưa duyệt được nhắc sớm hơn.

## Nguyên tắc
- Dùng lại bảng thông báo, hàng đợi gửi Zalo, chống gửi trùng, OAuth, Webhook hiện có. Không đổi mẫu tin Tín hiệu.
- Chỉ thêm mới, không sửa/xóa dữ liệu cũ. Không tạo tài khoản giả, không gửi Zalo thật khi thử, không Publish.
- Công tắc "Gửi Zalo cho đơn từ" riêng, mặc định TẮT.

## Thay đổi cơ sở dữ liệu cần bạn duyệt
- Bảng thông báo: thêm cột `leave_request_id` (có thể trống) + loại mới `leave_pending`, `leave_result`, `leave_cancel_request`, `leave_remind`.
- Các hàm gửi/duyệt/thu hồi/hủy/chuyển hiện có: thêm bước tạo thông báo (khóa chống trùng theo đơn + lần gửi + người nhận).
- Cài đặt đơn từ thêm: bật Zalo, số giờ nhắc.
- Lịch chạy hằng giờ gọi địa chỉ nhắc duyệt (có mã bảo vệ như nhắc chăm sóc).

## Chi tiết kỹ thuật
- `src/lib/leave/zaloMessage.ts` dựng tin (hàm thuần + test: đủ/thiếu trường, không lộ chi tiết).
- `zalo.server.ts` `processPending`: nhánh cho kind `leave_*`, link `${baseUrl()}/leave?open=<id>`, kiểm lại trạng thái đơn trước khi gửi (đơn đã xử lý thì không gửi tin "cần duyệt").
- Route `/api/public/zalo/leave-remind` (xác thực header token), `runLeaveRemind()`.
- `NotificationBell`: kind `leave_*` → `/leave?open=<id>`; `LeaveUi` đọc `open` giống SignalsUi (denied sheet, full-screen mobile); `AuthGate` đã lưu `after_login`.

## Kiểm thử
Test tự động cho dựng tin + điều kiện nhắc; kiểm tra trình duyệt link mở đơn (đăng xuất → đăng nhập → mở lại, không quyền).
