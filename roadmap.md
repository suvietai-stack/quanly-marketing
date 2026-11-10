# Trung tâm Phê duyệt toàn Base

- [ ] Migration 0301: RPC `approval_center_read()` tổng hợp Chờ tôi / Đang trình / Đã xử lý từ 8 nguồn (biz, fr, leave, hủy đơn, chấm công, thiết kế, đổi lịch OT, duyệt tài khoản) — chỉ đọc, không bảng mới.
- [ ] Client lib `src/lib/approvals/api.ts`: query 30s, kiểu dữ liệu, nhãn, helpers sắp xếp/lọc (pure, testable).
- [ ] Trang `/approvals`: 3 tab, tìm kiếm, chip lọc nguồn, card mobile + bảng desktop, nút Xem & xử lý deep link.
- [ ] Điều hướng: kích hoạt mục Phê duyệt (Điều hành), icon + badge cạnh chuông thông báo desktop, nút Phê duyệt giữa thanh dưới mobile theo quyền.
- [ ] Tests: cập nhật navigation.test.ts, thêm test helpers approvals; chạy vitest + kiểm build.
