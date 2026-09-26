# Nhắc Sale chăm sóc tín hiệu qua Zalo (mỗi sáng 09:00)

## Cách hoạt động
- Mỗi ngày 09:00 giờ Việt Nam, máy chủ tự kiểm tra (không cần ai mở trình duyệt).
- Chỉ xét tín hiệu **đang giao cho Sale hiện tại**, bỏ qua: chưa phân công, Chốt, Trượt, Hủy.
- **Chưa tiếp nhận**: trạng thái "Chờ nhận" và đã giao cho Sale hiện tại quá 24 giờ (tính từ lúc giao).
- **Lâu chưa cập nhật**: Đang liên hệ / Đang tư vấn / Đã báo giá / Chờ cọc, quá 3 ngày không có diễn biến mới **của Sale hiện tại**. Chưa có diễn biến thì tính từ lúc giao. Không dùng ngày tạo tín hiệu.
- Không tự đổi trạng thái tín hiệu.
- Mỗi Sale có tín hiệu cần chú ý nhận **đúng 1 tin tổng hợp/ngày**, gồm: lời chào theo tên, tổng số, Chưa tiếp nhận, Lâu chưa cập nhật (chia Liên hệ/Tư vấn và Báo giá/Chờ cọc), cùng liên kết `https://base.suviet.vn/signals?care=1`. Không kèm tên khách, SĐT hay dữ liệu nhạy cảm.
- Không có tín hiệu cần chú ý thì không gửi. Chạy lại cũng không gửi trùng. Gửi lỗi thì ghi lỗi, không thử lại liên tục (tối đa 3 lần như hiện nay) và không ảnh hưởng module Tín hiệu.

## Giao diện
- **Trang Tín hiệu (Sale):** hộp nhỏ "⚠️ CẦN KIỂM TRA: N". Bấm vào (hoặc mở từ liên kết Zalo) sẽ lọc đúng các tín hiệu đó. Mỗi thẻ hiện tên khách, trạng thái, diễn biến gần nhất, "Chưa cập nhật: X ngày" và nút Xem. Thêm lựa chọn lọc "Lâu chưa cập nhật".
- **Báo cáo (Quản lý):** bảng "Theo dõi chăm sóc" gồm Nhân viên | Chưa tiếp nhận | Lâu chưa cập nhật. Bấm vào số sẽ mở danh sách tương ứng. Dữ liệu trong phạm vi người xem được phép, không gửi qua Zalo.
- **Cài đặt → Thông báo Zalo (Admin):** khu vực "Nhắc chăm sóc tín hiệu" với công tắc riêng (**mặc định TẮT**), số giờ Chưa tiếp nhận (24), số ngày Lâu chưa cập nhật (3), giờ gửi (09:00).
- Hai thông báo cũ (tín hiệu mới, được giao) giữ nguyên.

## Cần bạn duyệt (thay đổi cơ sở dữ liệu, chỉ bổ sung)
1. Cho phép loại thông báo mới `signal_care` trong bảng thông báo hiện có. Loại này không gắn tín hiệu cụ thể, và khóa chống trùng là `care:<ngày>:<sale>`.
2. Thêm 5 trường vào bảng cấu hình Zalo: bật/tắt nhắc, số giờ, số ngày, giờ gửi, ngày chạy gần nhất.
3. Lịch chạy mỗi giờ (24 lần/ngày, rất nhẹ): chỉ gửi khi đúng giờ đã cài và hôm đó chưa chạy. Chạy mỗi giờ là để Admin đổi giờ gửi mà không phải sửa lịch. Nếu bạn muốn cố định 09:00 thì có thể chạy 1 lần/ngày.

Không đổi quyền truy cập hay dữ liệu cũ. Việc tính tín hiệu cần nhắc dùng chung một công thức cho cả tin Zalo, trang Tín hiệu và Báo cáo.

## Chi tiết kỹ thuật
- Migration: `ALTER TABLE notifications DROP CONSTRAINT … CHECK kind` → thêm lại với `'signal_care'`, thêm cột `payload jsonb` (số liệu tổng hợp). `zalo_oa_config` thêm `care_enabled bool default false`, `care_wait_hours int default 24`, `care_stale_days int default 3`, `care_hour int default 9`, `care_last_run date`.
- Server route `/api/public/zalo/care-cron` (POST, kiểm tra token bí mật trong header) gọi `runCareDigest()` trong zalo.server.ts. Hàm này tính theo `assigned_to` + `assigned_at` + nhật ký của Sale hiện tại (`author_id = assigned_to`, sau `assigned_at`), chèn `signal_care` với `ON CONFLICT DO NOTHING`, rồi `processPending` gửi. `processPending` bỏ qua bước kiểm tra lại người được giao với loại `signal_care` và dựng nội dung từ `payload`.
- pg_cron `0 * * * *` gọi route qua pg_net.
- Hàm thuần `careFlags(signal, lastNoteBySale, now, cfg)` trong `src/lib/signals/care.ts` dùng chung cho UI/báo cáo/máy chủ, kèm test cho 12 tình huống trong tài liệu.
- Tham số `?care=1` trên /signals: lọc theo phạm vi quyền (RLS) sẵn có.
