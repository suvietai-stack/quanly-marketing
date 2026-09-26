# Đơn từ & Phê duyệt — Giai đoạn 1 (Kiến trúc, 3 biểu mẫu, Cài đặt, Phân quyền, Duyệt, Thu hồi & Gửi lại)

Làm theo 3 giai đoạn đúng tài liệu. Kế hoạch này chỉ gồm Giai đoạn 1. Giai đoạn 2 (thông báo Base/Zalo, link mở đơn, nhắc duyệt) và Giai đoạn 3 (báo cáo, xuất Excel) sẽ trình bày riêng khi Giai đoạn 1 xong.

## Dùng lại từ hệ thống hiện có
- Tài khoản, đăng nhập, danh sách nhân viên đang hoạt động.
- Vai trò & Phân quyền hiện có: thêm nhóm quyền "Đơn từ & Phê duyệt" (15 quyền độc lập, đúng Phần 23), tick trong Cài đặt như các nhóm khác. Không tạo hệ thống vai trò riêng.
- Kiểu danh mục (thêm / đổi tên / sắp xếp / ngừng dùng / kích hoạt lại / chỉ xóa khi chưa dùng) giống Danh mục tín hiệu.
- Giao diện: khung menu, trang chi tiết mở toàn màn hình trên điện thoại giống Tín hiệu.
- Không chạm Task, Content, Social, Video, Thiết kế, SEO, KPI, Tín hiệu.

## Người dùng sẽ thấy
Menu mới **QUẢN TRỊ NỘI BỘ → Đơn từ & Phê duyệt** với các tab (chỉ hiện theo quyền):
1. **Đơn của tôi** — nút "Tạo đơn" (Nghỉ phép / Đi muộn / Về sớm), danh sách + trạng thái.
2. **Chờ tôi duyệt** — chỉ đơn đang chỉ định cho mình; Phê duyệt (xác nhận) / Từ chối (bắt buộc lý do).
3. **Quản lý đơn từ** — người có quyền Xem toàn bộ; chuyển người duyệt, xử lý hủy, ngoại lệ, tạo hộ.
4. **Báo cáo** — tạm để chỗ, làm ở Giai đoạn 3.

Biểu mẫu:
- **Nghỉ phép:** ngày/buổi bắt đầu – kết thúc, lý do, chi tiết, người duyệt; tự tính số ngày theo lịch làm việc; xem trước từng ngày ("Thứ Hai: Cả ngày — 1 ngày … TỔNG: 1,5 NGÀY").
- **Đi muộn / Về sớm:** ngày, buổi, nút nhanh 5/10/15/20/25/30/60/Khác; hiển thị "Dự kiến có mặt 08:30" / "Dự kiến ra về 16:30"; thứ Bảy dùng giờ hết buổi sáng.
- Cảnh báo quá hạn cụ thể ngay khi chọn giờ (thời điểm bắt đầu, hạn cuối, lời nhắc liên hệ quản lý).
- Người duyệt: chỉ tài khoản đang hoạt động có quyền Phê duyệt, không chọn chính mình, nhớ người chọn gần nhất.

Quy trình: Chờ duyệt → Đã duyệt / Từ chối; Thu hồi (đơn chờ, trong hạn); Yêu cầu hủy đơn đã duyệt → Đã hủy / Từ chối hủy; Sửa và gửi lại đơn bị từ chối (giữ lịch sử từng lần gửi, vẫn là một đơn); đơn chưa duyệt khi đã qua giờ đăng ký vẫn Chờ duyệt + gắn nhãn "Đã qua thời điểm đăng ký".

Cài đặt → tab **Đơn từ & Phê duyệt** (quyền Quản lý cài đặt đơn từ): Lịch làm việc (ngày, buổi, giờ từng buổi, ngày nghỉ lễ/riêng, quy đổi buổi), Danh mục lý do (14 lý do mặc định), Quy định thời hạn (12 giờ / 5 phút / 5 phút; mốc thu hồi).

## Thay đổi cơ sở dữ liệu cần bạn duyệt (chỉ thêm mới, không sửa/xóa dữ liệu cũ)
- `leave_requests` — đơn gốc: người đứng tên, người tạo hộ, loại, trạng thái, người duyệt hiện tại, số lần gửi, kết quả tính (số ngày/phút), quy định & lịch áp dụng lúc gửi.
- `leave_request_submissions` — từng lần gửi (nội dung, người duyệt, kết quả, lý do).
- `leave_request_events` — nhật ký chỉ-thêm (không ai sửa/xóa).
- `leave_settings` — 1 dòng cấu hình: lịch làm việc, ngày nghỉ, thời hạn, danh mục lý do (giá trị mặc định như tài liệu).
- Các hàm backend tự kiểm tra quyền + giờ máy chủ (Asia/Ho_Chi_Minh): gửi đơn, duyệt, từ chối, thu hồi, yêu cầu hủy, xử lý hủy, chuyển người duyệt, gửi lại, ngoại lệ, danh sách người duyệt. Nhân viên không ghi thẳng vào bảng.
- Quy tắc truy cập: chỉ chủ đơn, người duyệt được chỉ định, hoặc người có "Xem toàn bộ" mới đọc được đơn; không ai tự duyệt đơn đứng tên mình.
- Chỉ thêm quyền mới vào danh sách quyền; không tự bật cho vai trò nào — Admin tự tick (gợi ý theo Phần 26).

## Chi tiết kỹ thuật
- Quyền mới dạng `leave.*` trong `src/lib/auth.ts`; backend dùng `private.has_permission`.
- Tính ngày/giờ và hạn chót viết thành hàm thuần `src/lib/leave/calc.ts` + test (nửa ngày, 1,5 ngày, qua cuối tuần, qua 2 tháng, đi muộn 5/60 phút, về sớm thứ Bảy, giờ không hợp lệ); backend kiểm lại bằng SQL cùng quy tắc.
- Route mới `/leave` (+ tab qua tham số URL `?tab=`, `?open=<id>` sẵn cho Giai đoạn 2).
- Mỗi hành động là RPC SECURITY DEFINER khóa dòng (`FOR UPDATE`) để chống xử lý lặp.

## Kiểm thử sau Giai đoạn 1
Test tự động cho phép tính; thử trên trình duyệt: tạo 3 loại đơn, quá hạn bị chặn, duyệt/từ chối, thu hồi, yêu cầu hủy, gửi lại. Không tạo nhân viên giả, không gửi Zalo, không Publish.
