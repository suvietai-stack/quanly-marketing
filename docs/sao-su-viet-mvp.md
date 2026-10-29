# Sao Sứ Việt — bàn giao MVP

## Đã triển khai
- `/sao`: số dư tổng, đang giữ, khả dụng, lịch sử có nguồn và số dư sau giao dịch; yêu cầu đổi quà riêng người dùng.
- `/sao/shop`: ảnh quà, giá Sao, tồn khả dụng, gửi/hủy yêu cầu. Ảnh nằm trong kho riêng tư, chỉ tài khoản hoạt động đọc bằng liên kết có hạn.
- `/sao/admin`: ba quy tắc, quản lý quà/tồn kho/phát quà, cộng thủ công có lý do, lịch sử thao tác.
- Ba quyền mới: `sao.program_manage`, `sao.shop_manage`, `sao.manual_grant`. Super Admin hiện có quyền theo cơ chế sẵn có. Role khác cần được cấp quyền mới trong Cài đặt; không tự sửa role hiện tại.
- Popup Chipi nguyên bản ở giữa, gộp thưởng chưa xem, claim một lần tại máy chủ, chờ khi có form/dialog khác. Không tạo thông báo Zalo/Push, không thay Chipi Assistant.

## Nguồn thưởng
| Nguồn | Tình trạng |
|---|---|
| Chốt tín hiệu | Đã nối chuyển `won`, doanh thu hợp lệ, Sale được giao. |
| Task | Đã nối Chờ xác nhận → Hoàn thành, quyền phê duyệt thật, lịch sử cũ giữ nguyên và hành động phê duyệt mới đúng người. Người phụ trách trùng tên không rõ danh tính sẽ không tự thưởng. |
| KPI | Tích hợp giới hạn `task_completed` và `custom_task_result`, không gắn website/social, được khóa kỳ và kiểm bằng bảng phê duyệt Task thật mới. Không tin số `lockedActual` client. |
| Các KPI khác | Chưa tự thưởng: chưa có bộ tính máy chủ xác minh mọi nguồn; không coi snapshot client là bằng chứng đủ. |

Chương trình mặc định tắt, không tạo số Sao/quà/giá giả. Mốc thành tích đã xảy ra được đánh dấu để không thưởng hồi tố khi mở lại. Migration backfill chỉ đánh dấu chống thưởng trùng, không cộng Sao hoặc sửa lịch sử nghiệp vụ.

## Dữ liệu và file
Các migration đã áp dụng: `0075_sao_rewards_mvp.sql`, `0076_sao_gift_storage.sql`, `0077_sao_achievement_fences.sql`, `0078_sao_and_progression_read_permissions.sql`.

File giao diện: `src/routes/sao.{index,shop,admin}.tsx`, `src/components/sao/{SaoPages,RewardPopup}.tsx`, `src/components/AppShell.tsx`, `src/lib/auth.ts`, `src/styles.css`.

File API/quy tắc/kiểm thử: `src/lib/sao/{api,logic,logic.test,database.test}.ts`; ghi quy tắc kiến trúc trong `AGENTS.md`.

Mọi ghi số dư/ledger/giữ Sao nằm trong RPC SECURITY DEFINER kiểm quyền và khóa hàng. Trình duyệt không có quyền ghi trực tiếp. Yêu cầu đổi lưu tên/giá quà lúc gửi; phát một lần trừ Sao/tồn, hủy chỉ giải phóng giữ. Các giao dịch thưởng và yêu cầu có khóa idempotency.

## Kiểm thử đã chạy
81 tests đạt: 21 Sao (SQL PGlite và logic), 29 Chipi, 15 diễn biến, 16 KPI liên quan. Bao gồm thưởng đúng Sale/một lần, không thưởng Trượt hoặc thành tích khi tắt, giữ/hủy/phát/retry, không đủ Sao/hết quà, ví riêng, cấm ghi trực tiếp, lời chúc gộp/một lần, Task giả thiếu phê duyệt, KPI nguồn không hỗ trợ không nhận.

Playwright dùng phiên Super Admin thật: mở Ví/Gian hàng/Quản lý, xác minh trạng thái rỗng đúng, mở form thêm quà, desktop và 360/390 không tràn ngang, không lỗi runtime. Popup +30 dùng phản hồi giả chỉ trong trình duyệt để kiểm ảnh/đóng/navigate, không ghi Sao thật.

Chưa xác minh luồng thật có ghi dữ liệu thành tích → thưởng → đổi → phát bằng nhân viên/Admin, hoặc hai phiên đồng thời: Preview đang dùng chung dữ liệu vận hành. Không tự tạo thành tích, bật chương trình hoặc phát quà thử. SQL thực thi kiểm quy tắc không thay thế kiểm end-to-end dữ liệu thật.

## Bảo mật bổ sung
Đã sửa `progression_config_read`: chỉ người hoạt động có quyền Tín hiệu đọc; chặn cả RPC kích hoạt cũ bỏ qua phạm vi. Đã kiểm predicate thực tế và test allow/deny; finding được đánh dấu xử lý.

Cảnh báo bảo vệ mật khẩu đã rò rỉ còn tồn tại, nằm ngoài yêu cầu Sao; chưa thay đổi thiết lập đăng nhập.

Chưa Publish. Backend dùng chung đã nhận phần bổ sung; hiện 0 ví, 0 ledger, 0 quà, 0 quy tắc thưởng.