# Nâng cấp Cài đặt lịch nộp Kế hoạch & Báo cáo (3 mốc + Xin nộp bù)

## Hiện trạng
- `biz_deadline_config.data` (jsonb): mỗi loại chỉ có **1 mốc** `{phase, day, hour, minute, exceptions}`; `biz_deadline_at` tính hạn cuối, `biz_deadline_status` suy ra ontime/late/overdue.
- `biz_document_save` đóng băng deadline lần nộp đầu; **chưa có** chặn nộp trước/sau hạn ở server.
- Trung tâm Phê duyệt (`biz_approval_workflows/runs/events`) đang phục vụ điều chỉnh Báo cáo/Mục tiêu.

## Phạm vi
Kế hoạch & Báo cáo × Tháng/Quý/Năm (6 cấu hình). Mục tiêu KR năm (`goal_year`) giữ nguyên cơ chế cũ.

## Bước 1 — Migration: cấu hình 3 mốc + lịch sử
- Nâng cấp shape jsonb: mỗi loại có `open` / `due` / `late_close` (mỗi mốc `{phase, day, hour, minute}`) + `exceptions` theo kỳ cho cả 3 mốc. **Backfill**: deadline cũ → `due`; `open`/`late_close` để trống (không chặn) — bảo toàn cấu hình hiện có.
- RPC mới `biz_deadline_milestones(kind, year, period)` → 3 mốc (giờ VN, kẹp ngày cuối tháng, năm nhuận, ngoại lệ kỳ) và `biz_deadline_phase(...)` → `not_open | open | overdue | closed`.
- `biz_deadline_save`: validate **mở < hạn cuối < đóng bù** khi đủ 3 mốc; giữ tương thích khóa cũ.
- Bảng `biz_deadline_config_log` (ai đổi, khi nào, giá trị trước/sau) — không xóa lịch sử.

## Bước 2 — Migration: Xin nộp bù + chặn nộp phía server
- Bảng `biz_late_requests` (nhân viên, loại hồ sơ, kỳ, lý do bắt buộc, trạng thái pending/approved/rejected/used/expired, người duyệt); ràng buộc **một yêu cầu đang hoạt động / nghĩa vụ**.
- RPC `biz_late_request_create` (chỉ khi đang `overdue`, chưa có hồ sơ, chưa có yêu cầu hoạt động), `biz_late_request_decide` (duyệt/từ chối/yêu cầu bổ sung — đi qua luồng duyệt tùy chỉnh hiện có, thêm kind `late_submit` vào workflow), `biz_late_requests_read` (cá nhân + phạm vi quản lý).
- `biz_document_save` chặn server-side khi **nộp lần đầu**: `not_open`/`closed` → từ chối; `overdue` → bắt buộc yêu cầu nộp bù đã duyệt còn hiệu lực, đánh dấu `used` nguyên tử và ghi nhận **Nộp muộn**. Nộp lại theo yêu cầu chỉnh sửa (đã nộp lần đầu) không bị chặn.
- Yêu cầu chưa xử lý tự `expired` khi kỳ đóng; Super Admin can thiệp đặc biệt kèm lý do + nhật ký (tái dùng cơ chế intervention hiện có).
- Thông báo in-app: gửi yêu cầu → người duyệt; duyệt/từ chối → nhân viên (idempotent, không Zalo/Push).

## Bước 3 — Giao diện Cài đặt lịch nộp (thay `BizDeadlineEditor`)
- Chọn **Kế hoạch | Báo cáo** → **Tháng | Quý | Năm**; 3 card mốc (Mở nộp / Hạn cuối / Đóng nộp bù) với mô tả tiếng Việt đơn giản; chọn tháng tương đối theo loại kỳ + ngày/giờ/phút.
- **Xem trước lịch nộp** 3 kỳ liên tiếp, định dạng `dd/MM/yyyy HH:mm` giờ VN, cập nhật ngay khi sửa.
- Khu vực thu gọn **Ngoại lệ theo kỳ** (chỉnh riêng 3 mốc cho một kỳ, đánh dấu "lịch đặc biệt", cảnh báo khi kỳ đang mở/đã có hồ sơ).
- Xem **lịch sử thay đổi cấu hình**. Mobile: card dọc, không cuộn ngang (360–430px).

## Bước 4 — Giao diện cá nhân & quản lý
- Trang Kế hoạch/Báo cáo: trạng thái theo pha (Chưa mở nộp + ngày mở / Đang nhận + nút Nộp / Sắp đến hạn / Quá hạn + nút **Xin nộp bù** / Chờ duyệt bù + người xử lý / Được duyệt + nút **Nộp bù** / Đã đóng kỳ / Đã nộp + badge Nộp muộn).
- Form Xin nộp bù (loại, kỳ, deadline đã qua, lý do bắt buộc).
- Trung tâm Phê duyệt: hiển thị yêu cầu nộp bù (nhân viên, loại, kỳ, lý do, thời hạn còn lại, người đang xử lý) với Duyệt/Từ chối/Yêu cầu bổ sung.
- Thống kê quản lý: tổng cần nộp, đúng hạn, chưa nộp, quá hạn, đang xin bù, được duyệt bù, đã nộp bù, đóng kỳ không nộp — không đếm trùng nghĩa vụ.

## Bước 5 — Kiểm thử
- Unit: tính 3 mốc (tháng 2, năm nhuận, chuyển năm, kẹp 29/30/31), validate thứ tự mốc, pha trạng thái, vòng đời yêu cầu bù (tạo/duyệt/dùng/hết hạn), chặn API sau hạn, không đếm trùng.
- Playwright desktop + mobile 360/375/390/430.
- Không seed dữ liệu thử; không sửa timestamp/lịch sử; chưa Publish.

## Ghi chú
- Thông báo tự động theo lịch (mở kỳ, sắp hạn, quá hạn, đóng kỳ) cần scheduler: sẽ tái dùng cron 5 phút hiện có của Base nếu phù hợp, nếu không sẽ nêu rõ phương án trước khi làm.
