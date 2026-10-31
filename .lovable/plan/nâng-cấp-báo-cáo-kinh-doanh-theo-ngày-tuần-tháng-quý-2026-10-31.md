# Nâng cấp Báo cáo Kinh doanh theo Ngày / Tuần / Tháng / Quý

## Mục tiêu

Thay cơ chế nộp Báo cáo Tháng/Quý/Năm độc lập bằng **chu kỳ báo cáo bắt buộc duy nhất** do Admin cấu hình theo đơn vị (Phòng → Hệ → Toàn Khối, mặc định Tháng). Kỳ lớn hơn tự tổng hợp; không suy diễn dữ liệu chi tiết; Báo cáo Năm luôn chỉ là tổng hợp để xem. Giữ nguyên KR, deadline 3 mốc, nộp bù, phê duyệt điều chỉnh, phân quyền chức vụ và Dashboard hiện có.

## Nguyên tắc bất biến (theo spec)

- Một nhân viên – một chu kỳ bắt buộc tại một thời điểm; cấu hình có phiên bản + ngày hiệu lực.
- Không tự tạo/suy diễn số liệu: Tháng không sinh ra Ngày/Tuần; Quý không sinh ra Tháng; không chia đều theo số ngày.
- Tuần = Thứ Hai–Chủ Nhật (giờ VN); tuần giao tháng/năm cần phân bổ thực tế, thiếu thì cảnh báo chứ không bịa.
- Không xóa/cộng trùng dữ liệu lịch sử; chưa cấu hình thì mặc định Báo cáo Tháng như hiện nay; không tự tạo nghĩa vụ quá khứ.

## Bước 1 — Nền tảng chu kỳ & deadline (migration + thư viện, chưa đổi nghĩa vụ)

- Bảng `biz_report_cycle_configs`: phạm vi (block/system/department), chu kỳ (day/week/month/quarter), `effective_from`, lịch ngày làm việc cho chế độ Ngày, phiên bản, người sửa. RPC lưu/xóa có kiểm quyền `biz_can`, ghi log.
- RPC `biz_report_cycle_of(user_id, at_date)`: phân giải Phòng → Hệ → Khối theo hiệu lực tại ngày; mặc định `month`.
- Mở rộng deadline: thêm kind `report_day`, `report_week` vào `biz_deadline_config` (3 mốc open/due/late_close như hiện có) + `biz_deadline_at`/`biz_deadline_phase` hiểu kỳ Ngày/Tuần; giờ VN.
- Thư viện kỳ thuần `src/lib/biz/periodCycle.ts` (+ test): khoảng ngày của kỳ Ngày/Tuần/Tháng/Quý, tuần ISO có năm chuẩn, xác định tuần giao tháng/năm.
- `biz_documents` mở rộng: cho phép `period_kind` day/week; thêm cột `period_start`/`period_end` (date, nullable) làm ranh giới chính xác — giữ nguyên `year`/`period` cho tương thích cũ.

## Bước 2 — Nghĩa vụ nộp & form theo chu kỳ

- `biz_my_work('report')` chỉ liệt kê kỳ thuộc chu kỳ được giao (không còn card Quý/Năm quá hạn sai); không tạo nghĩa vụ trùng khi cấu hình đổi; không tạo nghĩa vụ quá khứ.
- `biz_document_save`/`biz_document_start`/`biz_late_request_create` chấp nhận day/week, kiểm pha deadline server-side như hiện hành; nộp bù giữ nguyên quy trình.
- Form nhập KR giữ nguyện nghiệp vụ (thực tế, ghi chú, đính kèm tùy chọn, không bắt buộc Google Docs); lần đầu ghi nhận chính thức ngay, điều chỉnh phải duyệt.
- Tuần giao tháng/năm: form bổ sung phần phân bổ thực tế theo từng đoạn tháng/năm (tổng các phần = tổng tuần, kiểm server-side).

## Bước 3 — Tổng hợp & đối chiếu mục tiêu

- Nguồn chính thức duy nhất cho mỗi KR × khoảng thời gian: ưu tiên dữ liệu kỳ nhỏ nhất đã nộp chính thức; báo cáo Quý/Năm cũ giữ làm hồ sơ lịch sử, không cộng thêm khi đã có dữ liệu tháng.
- RPC tổng hợp theo khoảng ngày: Ngày→Tuần/Tháng/Quý/Năm; Tuần→Tháng/Quý/Năm (qua phân bổ giao tháng); Tháng→Quý/Năm; Quý→Năm. KR không cộng dồn dùng phương pháp đã cấu hình trong `biz_kr_metrics`.
- Đối chiếu mục tiêu: Tháng so mục tiêu tháng; Quý so tổng 3 tháng; Ngày/Tuần chỉ hiển thị mục tiêu tháng liên quan kèm nhãn tham chiếu — không tự chia mục tiêu.
- Điều chỉnh được duyệt → tự tính lại tổng hợp liên quan, cập nhật Dashboard.

## Bước 4 — Giao diện & Dashboard

- Cài đặt chu kỳ ngay trong **Báo cáo → Cài đặt** (quyền cấu hình): đơn vị, chu kỳ, ngày hiệu lực, 3 mốc deadline theo chu kỳ, xem trước kỳ sắp tới, hiển thị cấu hình đang kế thừa, cho phép bỏ cấu hình riêng.
- "Công việc của tôi" chỉ hiện kỳ thực sự phải nộp; bộ lọc xem Ngày/Tuần/Tháng/Quý/Năm tách biệt nghĩa vụ (xem tổng hợp không có nút Nộp).
- Khu vực quản lý: thống kê nghĩa vụ theo chu kỳ thực của từng nhân viên + tỷ lệ hoàn thành (không so sánh số hồ sơ giữa các chu kỳ khác nhau).
- Dashboard giữ nguyên biểu đồ/chức năng, đổi nguồn đọc sang tổng hợp mới; dữ liệu thiếu gắn nhãn "Dữ liệu một phần", không biến thiếu thành 0.
- Mobile 360–430px: công việc cần nộp trước, tab chu kỳ gọn, không cuộn ngang.

## Kiểm thử

- Test thuần: khoảng kỳ, tuần giao tháng/năm (28/12/2026–03/01/2027), phân giải ưu tiên Phòng→Hệ→Khối, deadline 3 mốc từng chu kỳ, tổng hợp không trùng/không suy diễn.
- Test database: RPC phân giải chu kỳ, gate deadline, nộp bù, phân bổ tuần giao tháng (tổng phần = tổng tuần).
- Playwright desktop + mobile 360/375/390/430: cài đặt, công việc của tôi, bộ lọc xem, Dashboard không mất biểu đồ.
- Không tạo dữ liệu DEMO; không đụng dữ liệu thật ngoài giao dịch thử có rollback.

## Trình tự giao

Bước 1 → 2 → 3 → 4, mỗi bước build + test + báo cáo riêng; chưa Publish. Bắt đầu ngay Bước 1 khi duyệt kế hoạch.
