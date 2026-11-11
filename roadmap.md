# Roadmap — Giai đoạn 3A: Role chuẩn trước chuyển đổi quyền cũ

- [ ] Kiểm chứng từng quyền của chín liên kết chức vụ còn chờ, gồm đọc/ghi/báo cáo/xuất/workflow.
- [ ] Chỉ kích hoạt tập quyền có rào backend an toàn; ghi rõ chức năng quản lý còn chờ.
- [ ] Kiểm tra cấp/thu hồi theo nguồn, kiêm nhiệm, thời gian hiệu lực, ngoài phạm vi và chống tự nâng quyền.
- [ ] Hiển thị quyền tự nhận và lý do chặn trong quy trình phân công hiện có; không thêm quản trị trùng.
- [ ] Cập nhật báo cáo Chuyển đổi quyền cũ và bàn giao kết quả, không thực thi reset.
- [ ] Kiểm thử cô lập và Preview; không bổ nhiệm thật, không thay Kinh doanh, chưa Publish.

## Giai đoạn 2.5 đã hoàn thành

- [x] 1. RPC backend `account_permission_explain` (0334) — một nguồn giải thích quyền.
- [x] 2. Debug tab đọc từ RPC backend, bỏ thuật toán tính riêng.
- [x] 3. Frontend hỗ trợ nhiều Role (roleIds, loại trùng, replace/additive); roleId = Role chính hiển thị.
- [x] 4. Picker giao việc theo ID; job mới lưu writerId/designerId/ownerId/assigneeId; job cũ giữ nguyên.
- [x] 5. Kiểm chứng + kích hoạt liên kết Role Đóng hàng (0335); 9 liên kết còn lại chờ kiểm chứng scope.
- [x] 6. Báo cáo đối chiếu reset (A/B/C/D) đã có trong khu vực quản trị nâng cao — chỉ xem trước.
- [x] 7. Kiểm thử: 21 test mới đạt; hồi quy 1426/1443 (2 lỗi date-dependent đã biết); typecheck/build đạt.
- [x] 8. Báo cáo bàn giao docs/phase25-report.md.

Mở (chờ): xác minh Debug trên preview bằng tài khoản Super Admin thật (cần người dùng đăng nhập preview);
9 liên kết Role theo chức vụ còn lại chờ resolver scope quản lý; reset quyền cũ chờ giai đoạn cuối.
Nguyên tắc: không reset quyền, không Publish, Kinh doanh giữ nguyên.
