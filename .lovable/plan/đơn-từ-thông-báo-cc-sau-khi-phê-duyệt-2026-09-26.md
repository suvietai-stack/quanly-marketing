# Đơn từ — Thông báo CC sau khi phê duyệt

## Người dùng sẽ thấy
Cài đặt → Đơn từ & Phê duyệt → Thông báo → khu vực mới **"Thông báo sau khi phê duyệt"**:
- Công tắc bật/tắt CC.
- Hai ô: "Đơn được phê duyệt" và "Đơn đã duyệt được chấp thuận hủy".
- Chọn nhiều **vai trò** (lấy từ Vai trò & Phân quyền) và nhiều **nhân viên** đang hoạt động.
- Cảnh báo màu vàng liệt kê người nhận (tính cả người thuộc vai trò) chưa có quyền xem chi tiết đơn ("Xem toàn bộ"). Nhận thông báo không tự cấp quyền xem.

Người nhận CC thấy thông báo trong chuông Base, và nhận Zalo nếu Zalo Đơn từ đã bật và họ đã liên kết Zalo. Nội dung tin: tên nhân viên, loại đơn, ngày giờ đăng ký, tổng ngày nghỉ hoặc số phút, người phê duyệt, kết quả, nút mở đúng đơn.

## Quy tắc
- Người nhận = (tài khoản đang hoạt động thuộc các vai trò đã chọn **ngay lúc duyệt**) + (cá nhân đã chọn), bỏ trùng theo ID. Bỏ qua chủ đơn và người vừa duyệt (họ đã nhận tin riêng).
- Chống trùng: mỗi (sự kiện, người nhận) chỉ một thông báo.
- Chỉ chạy cho các lần duyệt/hủy xảy ra sau khi bật. Không gửi bù đơn cũ.

## Chi tiết kỹ thuật
- Cấu hình lưu trong `leave_settings.data.notify.cc = { enabled, on_approve, on_cancel, role_ids[], user_ids[] }` (lưu qua `leave_settings_save` sẵn có).
- Migration (cần duyệt):
  - Thêm `'leave_cc'` vào `notifications_kind_check`.
  - Cập nhật `leave_notify()`: với action `approve` / `cancel_approve`, nếu cc bật cho sự kiện đó, chèn `leave_cc` cho từng người nhận (user_roles ∪ user_ids, `is_active`, trừ owner/actor), dedup `'leave:'||event_id||':'||uid`, `ON CONFLICT DO NOTHING`. Trigger đánh thức Zalo sẵn có sẽ tự xử lý hàng đợi.
  - RLS đọc đơn giữ nguyên (người nhận CC không có quyền đọc đơn → chỉ có nội dung trong thông báo). Payload thông báo lưu sẵn tóm tắt (tên, loại, thời gian, số ngày/phút, người duyệt, kết quả) để hiện trong chuông.
- `zaloMessage.ts`: thêm kind `leave_cc` + test. `zalo.server.ts`: processPending nhận `leave_cc` khi Zalo đơn từ bật; kiểm lại đơn còn đúng trạng thái trước khi gửi.
- `ZaloUi.tsx`: mô tả + mở `/leave?open=<id>`.
- `LeaveSettings.tsx`: UI chọn vai trò/nhân viên + cảnh báo thiếu quyền (dùng dữ liệu vai trò/quyền sẵn có trong auth).
- Không sửa OAuth, Webhook, Tín hiệu. Không Publish.
