# FIX TỔNG THỂ QUẢN TRỊ KINH DOANH (SOURCE 35)

Phạm vi: sửa độ chính xác Báo cáo/KR/Dashboard, chuyển chu kỳ, phê duyệt KR cuốn chiếu, tạo sẵn 5 luồng duyệt mẫu, cải tiến giao diện. Không xây lại module, không xóa/reset dữ liệu, không động module khác, không tự khóa Báo cáo 2027, chưa Publish.

## Hiện trạng đã khảo sát
- `biz_approval_workflows` đang trống — chưa có luồng nào; engine đã hỗ trợ cấp duyệt theo chức danh (`type='position'` + `skip_if_submitter`), nhánh Giám Đốc (`director_steps`), xem trước người duyệt (`biz_workflow_preview`).
- Độ phủ tháng hiện chỉ là `actual IS NOT NULL` + kiểm tra phủ ngày; chưa có 3 trạng thái Đầy đủ/Chưa đầy đủ/Chưa có + Không áp dụng; chưa có cơ chế xác nhận số liệu đầu kỳ.
- Dashboard dùng phân bổ gốc 12 tháng của mục tiêu năm; phân bổ cuốn chiếu đã duyệt chưa lên Dashboard.
- `BizDocuments` mặc định tháng hiện tại theo giờ trình duyệt, không theo chu kỳ đang áp dụng; `BizMyWork` mất trắng khi tải lỗi.

## Bước 1 — Độ chính xác Báo cáo (Phần 1)
- Migration: hàm `private.biz_report_month_coverage(user, metric, year, month)` trả `{status: full|partial|none|na, actual, expected, received, missing[]}` dựa trên nghĩa vụ thực tế (kỳ Ngày/Tuần thuộc tháng + phân bổ tuần giao tháng), không dùng `actual IS NOT NULL`.
- Bảng mới `biz_opening_actuals` + `biz_opening_actual_events`: xác nhận số liệu đầu kỳ (nhân viên, KR, khoảng thời gian, giá trị, nguồn/ghi chú, người xác nhận, thời điểm); chỉ người có quyền can thiệp; không tự tạo 0; chặn chồng lấn với báo cáo chính thức (không cộng trùng); không áp dụng hàng loạt.
- `biz_rolling_basis` và nguồn Dashboard dùng coverage: tháng `na` được miễn, tháng `partial` hiển thị số một phần kèm cảnh báo, không coi thiếu = 0.

## Bước 2 — Đồng bộ KR cuốn chiếu (Phần 2)
- Dashboard: tháng tương lai dùng phân bổ mới nhất đã duyệt (lớp "phân bổ đã điều chỉnh" riêng, không thay chỉ tiêu đánh giá cam kết năm); tháng lịch sử giữ chỉ tiêu tại thời điểm chốt; đề xuất chờ duyệt không ảnh hưởng.
- Nhãn rõ ràng: Mục tiêu năm đã duyệt / Chỉ tiêu tháng hiện hành / Phân bổ đã điều chỉnh / Thực tế chính thức / Còn phải đạt — tại KR, Rolling, Dashboard.
- Bản nháp qua tháng mới: phát hiện `first_month` đã qua → cảnh báo, cho cập nhật lại theo tháng còn hợp lệ (giữ bản cũ trong lịch sử), kiểm tra lại tổng, yêu cầu xác nhận trước khi gửi; không khóa chết.
- Thực tế đổi sau chốt: trigger đánh dấu `needs_review` cho kế hoạch hiện hành; chặn duyệt đề xuất hết hiệu lực số liệu (đã có fence 0167/0168, bổ sung cờ và cảnh báo).

## Bước 3 — Chuyển chu kỳ (Phần 3)
- Phát hiện ngày hở khi chuyển chu kỳ (ví dụ 01/11 giữa kỳ Tháng cũ và Tuần mới): cảnh báo Admin trước khi lưu cấu hình, chỉ tạo nghĩa vụ chuyển tiếp khi Admin xác nhận; không hồi tố, không trùng nghĩa vụ (đã có `biz_report_period_matches`).
- Kỳ lịch sử xử lý theo chu kỳ có hiệu lực tại kỳ đó: sửa `BizDocuments` (tạo/xem/xin nộp bù dùng chu kỳ tại kỳ chọn, không dùng chu kỳ hôm nay); kiểm tra backend thống nhất.
- Mở Báo cáo: mặc định đúng chu kỳ đang áp dụng + kỳ hiện tại/gần nhất cần xử lý; không nhảy về Tuần 1; vẫn xem được lịch sử theo chu kỳ cũ.

## Bước 4 — Phê duyệt KR cuốn chiếu (Phần 4)
- Thêm loại luồng `rolling_plan` (mở rộng CHECK kind); khi chưa có luồng riêng, dùng luồng KR Năm hiện hành một cách rõ ràng (ghi trong snapshot, không giả vờ đã tách).
- Chi tiết hồ sơ điều chỉnh KR: tổng quan (nhân viên, đơn vị, mục tiêu năm, thực tế, còn phải đạt, lý do, tháng áp dụng) + bảng trước/sau theo tháng (hiện hành/đề xuất/chênh lệch, tháng đã khóa) + tổng kế hoạch, dự kiến cả năm, chênh lệch mục tiêu + lịch sử phiên bản. Dữ liệu lấy từ snapshot đã lưu (`basis.items[].current` vs `items[].months`).
- Chuyển phòng: `biz_rolling_save` xác định đơn vị quản lý tại thời điểm gửi (không dùng máy móc phòng cũ), giữ snapshot đơn vị/người duyệt khi đã gửi; không chuyển doanh số lịch sử.

## Bước 5 — Bộ luồng duyệt mẫu Sứ Việt (Phần 5 + 6)
- RPC `biz_workflow_seed_defaults()`: với từng Hệ đang hoạt động, tạo 5 mẫu nếu chưa có (idempotent, không ghi đè luồng đã tùy chỉnh):
  1. KR Năm: Trưởng Nhóm → Trưởng Phòng → Giám Đốc Hệ (cấp theo chức danh, `skip_if_submitter`).
  2. KR – Điều chỉnh phân bổ tháng: Trưởng Phòng → Giám Đốc Hệ.
  3. Báo cáo – Điều chỉnh số liệu: Trưởng Nhóm → Trưởng Phòng (áp dụng Ngày/Tuần/Tháng/Quý).
  4. Báo cáo – Xin nộp bù: Trưởng Nhóm → Trưởng Phòng.
  5. Kế hoạch – Xin nộp bù: Trưởng Phòng.
- Nhánh lãnh đạo cấp cao (`director_steps`): Phó GĐ Điều hành → GĐ Điều hành; GĐ Điều hành nộp thì chặn với cảnh báo cần Super Admin cấu hình (không tự duyệt).
- Kích hoạt an toàn: đủ người duyệt hợp lệ mới kích hoạt; thiếu người → tạo ở trạng thái Cần hoàn thiện (chưa kích hoạt); không đổi người duyệt hồ sơ đã nộp.
- UI Cài đặt → Quy trình phê duyệt: khu vực "Quy trình mẫu Sứ Việt" + nút Khởi tạo quy trình mặc định (chỉ tạo mẫu còn thiếu) + Kiểm tra quy trình (xem trước chuỗi người duyệt thực tế theo nhân viên được chọn).
- An toàn: không có luồng hợp lệ → chặn gửi với thông báo rõ nguyên nhân + lối tới cấu hình; không tự thông qua.

## Bước 6 — Giao diện & hiệu năng (Phần 7 + 8)
- Công việc của tôi: 7 trạng thái rõ ràng; lỗi tải có thông báo + nút Thử lại (không hiển thị trống giả).
- Phê duyệt: bổ sung lọc "Trong phạm vi quản lý", khoảng thời gian; ưu tiên hồ sơ cần xử lý.
- Dashboard: hiển thị độ phủ dữ liệu; không cộng trùng; không lấy số chờ duyệt.
- Hiệu năng: thay `LOCK TABLE biz_documents` (0168) bằng advisory lock theo mục tiêu + khóa hàng nguồn liên quan, giữ kiểm soát đồng thời tương đương.
- Mobile: bảng KR, tiến trình duyệt, form không tràn (kiểm 360–430px).

## Bước 7 — Kiểm thử (Phần 9)
- Test đơn vị + PGlite cho Nhóm A–D trọng tâm: coverage 3 trạng thái, tuần giao tháng, chuyển chu kỳ không sót/trùng, KR giữ cam kết năm, bản nháp qua tháng, seed idempotent/không ghi đè, tự duyệt bị chặn, thiếu người duyệt có cảnh báo, báo cáo/kế hoạch lần đầu không cần duyệt.
- Typecheck, build, kiểm tra UI thật desktop/mobile. Báo cáo theo Phần 10: lỗi đã sửa, file/migration, luồng đã tạo/hoạt động/thiếu người, kết quả test, rủi ro còn lại, phần chưa xác minh được.

## Kỹ thuật
- Migrations 0169+: additive, không drop, tương thích dữ liệu hiện có; mọi bảng public mới có GRANT + RLS.
- Ràng buộc nghiệp vụ đặt ở backend (RPC SECURITY DEFINER); frontend chỉ trình bày.
- Không hardcode UUID Hệ/Phòng/người dùng; chức danh tra theo `code` từ `biz_positions`.
