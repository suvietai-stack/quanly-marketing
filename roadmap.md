# Trung tâm Phê duyệt toàn Base

- [x] Migration 0301+0302: RPC `approval_center_read()` tổng hợp Chờ tôi / Đang trình / Đã xử lý từ 8 nguồn (biz, fr, leave, hủy đơn, chấm công, thiết kế, đổi lịch OT, duyệt tài khoản) — chỉ đọc, không bảng mới. Đã xác minh trên DB thật (Super Admin: eligible/done=12; Trung Hiếu: todo=2 đơn nghỉ phép đúng deep link).
- [x] Client lib `src/lib/approvals/api.ts`: query 30s, kiểu dữ liệu, nhãn, helpers sắp xếp/lọc (pure, testable).
- [x] Trang `/approvals`: 3 tab, tìm kiếm, chip lọc nguồn, card mobile + bảng desktop, nút Xem & xử lý deep link.
- [x] Điều hướng: mục Phê duyệt (Điều hành), icon + badge cạnh chuông thông báo desktop, nút Phê duyệt giữa thanh dưới mobile theo quyền.
- [x] Tests: navigation.test.ts cập nhật + api.test.ts mới; 26/26 đạt; typecheck + build OK; /approvals signed-out chuyển /login không lỗi JS.
- [ ] Nghiệm thu UI sau đăng nhập (không mint được phiên tự động — cần user đăng nhập preview): kiểm tra badge, 3 tab, nút mobile, deep link. Chưa Publish.
