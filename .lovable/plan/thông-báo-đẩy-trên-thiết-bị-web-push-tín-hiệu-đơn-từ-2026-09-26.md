# Thông báo đẩy trên thiết bị (Web Push) — Tín hiệu + Đơn từ

## Hiện trạng
Base chưa có service worker, chưa có manifest, chưa có thư viện Push. Không có gì xung đột, phải làm mới toàn bộ hạ tầng.

## Nhân viên sẽ thấy
- Chuông thông báo / Cài đặt → mục **"Thông báo trên thiết bị"**: nút *Bật thông báo trên thiết bị này*, trạng thái (Đã bật / Chưa bật / Trình duyệt đã chặn / Thiết bị chưa hỗ trợ), nút *Tắt trên thiết bị này*, danh sách thiết bị đã bật (tắt từng máy).
- Chỉ xin quyền trình duyệt khi người dùng bấm nút.
- iPhone chưa thêm vào màn hình chính: hiện hướng dẫn "Chia sẻ → Thêm vào MH chính" thay cho nút bật.
- Nhấn thông báo → mở đúng tín hiệu / đơn / giải trình (dùng link sẵn có `/signals?open=`, `/leave?open=`, `/leave?att=`); nếu Base đang mở thì chuyển tab đó; chưa đăng nhập thì đăng nhập xong mở đúng nội dung (cơ chế after_login hiện có).

## Sự kiện được gửi (chỉ dùng người nhận của thông báo Base hiện có)
- Tín hiệu: `signal_new`, `signal_assigned` (kiểm lại: chưa phân công / đúng Sale hiện tại).
- Đơn từ: `leave_pending`, `leave_result` (duyệt/từ chối/hủy/ngoại lệ), `leave_cancel_request`, `leave_cc`.
- Giải trình: `att_witness`, `att_new`.
- Nội dung chỉ gồm tiêu đề thương hiệu + loại + tên khách/nhân viên + sản phẩm/thời gian. Không SĐT, địa chỉ, lý do, chi tiết giải trình, lý do từ chối.

## Nguyên tắc
- Push và Zalo tách hẳn: cột trạng thái riêng, lỗi bên này không chặn bên kia.
- Chống trùng theo (thông báo, thiết bị); tối đa 3 lần thử; không gửi bù thông báo cũ hơn 30 phút.
- Máy chủ báo thiết bị hết hạn (404/410) → tự vô hiệu hóa.
- Đăng xuất → xóa đăng ký của thiết bị đó trước khi thoát.
- Không đụng Auth, Zalo OAuth/Webhook, phân quyền, nghiệp vụ, dữ liệu cũ.

## Thay đổi cần duyệt
1. **Migration (chỉ thêm mới):**
   - Bảng `push_subscriptions` (user_id, endpoint unique, p256dh, auth, thiết bị/trình duyệt, created_at, last_used_at, status active/revoked/expired). RLS: người dùng chỉ xem/xóa của mình; ghi qua RPC `push_subscribe` / `push_unsubscribe` (SECURITY DEFINER).
   - Bảng `push_deliveries` (notification_id, subscription_id, status, attempts, error, sent_at; UNIQUE(notification_id, subscription_id)) — chống trùng.
   - Mở rộng trigger đánh thức hiện có để gọi thêm bộ gửi Push khi có thông báo thuộc 2 module.
2. **Khóa VAPID:** tôi tự tạo cặp khóa; khóa bí mật lưu trong kho bí mật máy chủ, khóa công khai để trong mã.
3. **Tệp mới trong public:** `sw.js` (chỉ nhận push + xử lý nhấn, **không cache trang**), `manifest.webmanifest` + icon (cần cho iPhone). Service worker không đăng ký trong bản xem thử trong khung editor để tránh trang cũ bị kẹt.

## Chi tiết kỹ thuật
- Gửi Push bằng thư viện chạy được trên Cloudflare Worker (mã hóa aes128gcm + ký VAPID bằng WebCrypto), không dùng `web-push` (Node-only).
- `src/lib/push.server.ts` (processPush), `src/lib/push.functions.ts` (subscribe/unsubscribe/list thiết bị/gửi thử cho chính mình), `src/lib/push/message.ts` (dựng nội dung thuần + test), `src/components/PushSettings.tsx`.
- Route `/api/public/push/dispatch` (xác thực bằng token như dispatch-cron) được trigger gọi; gọi thêm sau `zaloDispatch()` phía client làm dự phòng.
- Thiết kế theo bảng ánh xạ kind → (tiêu đề, link, kiểm tra hợp lệ) để sau thêm module khác chỉ cần thêm dòng.

## Kiểm thử
- Tự động: dựng nội dung (không lộ dữ liệu nhạy cảm), chống trùng, xử lý thiết bị hết hạn.
- Thực tế (sau Publish, bạn làm cùng 2 tài khoản): Chrome máy tính, Android, iPhone đã thêm vào MH chính; 14 tình huống trong tài liệu. Không gửi hàng loạt cho nhân viên thật.

## Giới hạn thiết bị
- iPhone/iPad: cần iOS 16.4+ và phải mở Base từ biểu tượng màn hình chính.
- Push chỉ hoạt động trên base.suviet.vn sau Publish, không chạy trong khung xem trước.
- Trình duyệt tiết kiệm pin (một số Android) có thể trễ thông báo.

Không tự Publish.
