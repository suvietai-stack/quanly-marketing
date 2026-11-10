# Giai đoạn 3 + Vá an toàn — Làm sạch quyền cũ, chuyển sang Role chuẩn

Cập nhật: 2026-11-10 (đợt vá). Trạng thái: công cụ đã vá và kiểm chứng trên Preview; **chưa thực thi chuyển đổi dữ liệu thật** — chờ Admin xác nhận trên màn hình xem trước. Chưa Publish.

## Ba lỗi an toàn đã sửa (migrations 0327, 0328, 0329)

1. **Chặn reset khi chưa có quyền thay thế**: trước đây tài khoản "Cần xem lại" vẫn chọn được và backend không bắt buộc trạng thái sẵn sàng. Nay preview và execute dùng chung một hàm đánh giá `private.cleanup_account_eval` — execute đánh giá lại từng tài khoản tại thời điểm chạy và CHỈ gỡ khi đạt "Sẵn sàng"; nếu không có tài khoản nào đủ điều kiện, toàn bộ thao tác bị hủy. Giao diện chỉ còn 3 trạng thái: Sẵn sàng / Cần xử lý / Được bảo vệ; checkbox chỉ mở cho Sẵn sàng; lý do hiển thị bằng tiếng Việt.
2. **Bảo vệ toàn bộ nhân sự Kinh doanh theo dữ liệu tổ chức**: `private.cleanup_is_biz_staff` kiểm tra membership phòng KD, bổ nhiệm KD còn hiệu lực, phân công quản lý và kiêm nhiệm — không dựa vào tên Role. Nhân sự KD (kể cả kiêm nhiệm Marketing) được đánh dấu Được bảo vệ, không chọn được, không gỡ Role ngoài KD của họ trong đợt này.
3. **Chống chuyển đổi theo bản xem trước đã cũ**: vân tay v2 bao phủ Role trực tiếp, permission của từng Role, quyền cá nhân, bổ nhiệm chức vụ, liên kết chức vụ–Role, nhiệm vụ chuyên môn Marketing và trạng thái tài khoản. Đổi bất kỳ phần nào → execute từ chối và yêu cầu xem trước lại.

## Hoàn thiện khác

- **Kiểm tra quyền thay thế**: chỉ Sẵn sàng khi mọi quyền từ Role cũ đã có nguồn thay thế đã kiểm chứng (kênh tự động chỉ áp dụng quyền trong danh sách đã xác minh), có bổ nhiệm chức vụ hoặc nhiệm vụ chuyên môn còn hiệu lực, không có quyền tùy chỉnh riêng.
- **Bảo toàn công việc đang chạy**: `private.cleanup_pending_work` đếm đơn nghỉ phép đang chờ (xin hoặc duyệt), việc 3K đang làm, yêu cầu tài chính chưa kết thúc — có thì tài khoản về Cần xử lý kèm lý do.
- **Khôi phục an toàn**: chỉ trả lại đúng dòng đã gỡ (không bao giờ xóa/ghi đè quyền mới phát sinh); quyền mới sau reset được báo là xung đột để đối chiếu thủ công; chống khôi phục lặp; mọi thao tác trong một transaction.

## File/RPC thay đổi

- Migrations: 0327 (hardening chính), 0328 (vá nối mảng lý do), 0329 (vá thứ tự nối JSON trong preview).
- RPC: `base_perm_cleanup_preview`, `base_perm_cleanup_execute`, `base_perm_cleanup_restore` (thay thế); private: `cleanup_account_eval`, `cleanup_is_biz_staff`, `cleanup_pending_work`, `cleanup_fingerprint` v2.
- Giao diện: `src/components/PermissionCleanup.tsx`, `src/lib/permissionCleanup.ts` (3 trạng thái, lý do, checkbox khóa).
- Test: `src/lib/permissionCleanup.database.test.ts` (viết lại, 8 tình huống).

## Kiểm thử (môi trường cô lập PGlite, migration thật 0324–0329)

8/8 đạt: phân loại 3 trạng thái; bảo vệ Super Admin / KD / kiêm nhiệm KD; đủ nguồn thay thế ⇒ Sẵn sàng; công việc đang chờ chặn Sẵn sàng; execute từ chối tài khoản Cần xử lý và hủy khi không có tài khoản Sẵn sàng; execute chỉ gỡ tài khoản Sẵn sàng + lưu bản sao; vân tay phát hiện đổi permission Role / bổ nhiệm / nhiệm vụ Marketing / trạng thái tài khoản và trở về giá trị cũ khi hoàn tác; khôi phục đúng, không ghi đè quyền mới, báo xung đột, chống lặp; non-Super-Admin bị chặn cả ba RPC. Hồi quy phân quyền/bổ nhiệm/chuyên môn: 131/131 đạt; typecheck sạch; build OK.

## Kiểm kê database thật (chỉ đọc, chưa thực thi)

23 tài khoản có nguồn quyền trực tiếp: **Được bảo vệ 15** (2 Super Admin; 13 nhân sự KD/kiêm nhiệm theo dữ liệu tổ chức), **Cần xử lý 8** (7 thiếu quyền thay thế — Kế Toán 13, HCNS 41, Cung Ứng 14, Content Web 32, Designer 28 ×2, Leader Marketing 288; 1 có 69 quyền tùy chỉnh riêng), **Sẵn sàng 0**.

## Rủi ro còn tồn tại

- Nhân sự ngoài KD chưa được bổ nhiệm chức vụ nên chưa thể chuyển đổi an toàn.
- Quyền quản lý theo phạm vi (toàn Khối/Phòng/Base) chưa được kiểm chứng nên chưa tự kế thừa — Leader Marketing mất tới 288 quyền nếu gỡ ngay.
- Tài khoản có quyền tùy chỉnh cần đối chiếu thủ công với Role chuẩn.

## Hướng dẫn Admin chuyển đổi an toàn sau này

1. Bổ nhiệm nhân sự vào chức vụ tại Cơ cấu tổ chức (hoặc giao nhiệm vụ chuyên môn Marketing).
2. Mở Cơ cấu tổ chức → Cài đặt → Role & Phân quyền → Nâng cao → Chuyển đổi quyền cũ.
3. Xử lý các tài khoản Cần xử lý theo lý do hiển thị (thiếu bổ nhiệm, quyền chưa có thay thế, công việc đang chờ).
4. Khi tài khoản đạt Sẵn sàng: chọn → Xem trước lại → nhập `CHUYỂN ĐỔI QUYỀN` → thực hiện.
5. Nếu dữ liệu đổi giữa chừng, hệ thống tự hủy và yêu cầu xem trước lại. Sai sót có thể Khôi phục từ lịch sử chuyển đổi.
