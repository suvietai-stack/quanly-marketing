# Nâng cấp trang Kế hoạch — Quản trị Kinh doanh

Nâng cấp UX trang **Kế hoạch** hiện có (không tạo module mới, không đổi Mục tiêu KR / Báo cáo / Phê duyệt). Chỉ áp dụng cho `kind='plan'`; trang Báo cáo giữ nguyên.

## 1. Database (1 migration)

- Bảng `biz_document_views`: `version_id`, `viewer_id`, `first_opened_at`, `latest_opened_at`, `UNIQUE(version_id, viewer_id)`. Grants + RLS: người xem chỉ đọc dòng của chính mình; không mở RLS tràn lan.
- RPC `biz_document_open(_version_id)` (SECURITY DEFINER): kiểm tra quyền xem hồ sơ theo đúng scope hiện có (chủ hồ sơ hoặc quản lý trong phạm vi / Super Admin), upsert dòng xem, trả về URL để frontend mở. Không ghi nhận khi chỉ xem danh sách/popup.
- Mở rộng `biz_documents_read`: mỗi dòng nghĩa vụ kèm `my_view` của người đang đăng nhập: `none` (chưa có tài liệu) / `unopened` (Chưa mở) / `opened` (Đã mở) / `new_version` (Có bản mới chưa mở — đã mở bản cũ, chưa mở bản mới nhất). Trạng thái lưu riêng theo từng người xem × từng phiên bản.

## 2. Trang Kế hoạch — hai khu vực tự động (thay tab "Của tôi / Trong phạm vi")

**Khu vực 1 — Kế hoạch của tôi** (chỉ hiện khi user có nghĩa vụ nộp):
- Card dạng việc cần làm: tên kỳ, hạn nộp, trạng thái nộp, trạng thái chỉnh sửa, thời gian nộp gần nhất, nút thao tác.
- Sắp xếp ưu tiên: Cần chỉnh sửa → Quá hạn → Sắp đến hạn → Chưa nộp → Đã nộp → Chưa đến hạn.
- Lọc Tháng/Quý/Năm + điều hướng kỳ; ưu tiên kỳ hiện tại/sắp tới, lịch sử mở khi cần.

**Khu vực 2 — Kế hoạch trong phạm vi quản lý** (chỉ hiện khi có quyền xem người khác; ẩn hoàn toàn với nhân viên thường):
- Card thống kê bấm để lọc nhanh: Tổng cần nộp, Đã nộp, Chưa nộp, Đúng hạn, Nộp muộn, Quá hạn chưa nộp, Cần chỉnh sửa, **Kế hoạch mới chưa xem** (tính theo chính người đăng nhập).
- Bộ lọc Hệ/Phòng/Nhóm/Nhân viên/Trạng thái nộp/Trạng thái xem — chỉ hiện bộ lọc có ý nghĩa trong phạm vi (suy ra từ dữ liệu scope trả về, không hardcode chức vụ). Tìm kiếm theo tên.
- Desktop: bảng Nhân sự | Đơn vị | Kỳ | Hạn nộp | Trạng thái nộp | Trạng thái xem | Thao tác. Mobile: card. Sắp xếp mặc định: đã nộp chưa xem → có bản mới → đang yêu cầu chỉnh sửa → quá hạn → còn lại.
- Thao tác: **Xem tài liệu** (gọi `biz_document_open` rồi mở link; xử lý khi trình duyệt chặn tab), Xem lịch sử, Yêu cầu chỉnh sửa (giữ flow hiện có, lý do bắt buộc). Không có nút Duyệt.
- Màu trạng thái theo quy ước: xanh lá đúng hạn, xanh dương đã mở, cam chưa mở/cần sửa/sắp hạn, đỏ quá hạn, xám chưa đến hạn. Trạng thái xem phân biệt rõ với trạng thái nộp.

## 3. Dashboard

- `biz_dashboard_data` obligations bổ sung `my_view`; tab Kỷ luật thêm card **"Kế hoạch chưa mở của tôi"** chỉ cho người có quyền quản lý, bấm dẫn tới trang Kế hoạch kèm lọc. Không đổi logic KR/doanh số.

## 4. Kiểm thử

- Test DB (PGlite): quyền mở tài liệu, upsert không trùng, nộp lại → `new_version`, nhân viên thường không mở được hồ sơ người khác.
- Test logic: sắp xếp ưu tiên, suy ra bộ lọc theo scope, đếm không trùng.
- Build + Playwright desktop/mobile (360–430px): nhân viên chỉ thấy khu vực cá nhân, quản lý thấy đủ hai khu vực, không tràn ngang.

## Giữ nguyên

- Kế hoạch không phê duyệt (chỉ yêu cầu chỉnh sửa), nộp lại giữ trạng thái đúng hạn lần đầu, deadline đóng băng lần nộp đầu, toàn bộ lịch sử và dữ liệu hiện có.
- Chưa Publish.
