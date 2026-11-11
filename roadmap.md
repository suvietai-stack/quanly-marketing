# Roadmap — Chuyển đổi quyền cuối cùng

- [x] Snapshot đầy đủ và chuyển đổi thật 9 tài khoản/9 nguồn Role cũ, giữ ngoại lệ và quản trị; mã phục hồi 90717bc1-ae8e-4bed-a162-9ab8c8e61bec.
- [x] Mở thao tác chuyển đổi/khôi phục có xác nhận, giữ nguyên nguồn bổ nhiệm và tập quyền đã kiểm chứng.
- [x] Quyền bổ sung thật tại Nhân sự, dùng Role/permission chung và kiểm tra máy chủ; không giả lập giới hạn đơn vị chưa hỗ trợ.
- [x] 90 kiểm thử cô lập đạt, Preview chuyển đổi thành công và đọc lại; báo cáo docs/final-permission-transition-report.md; không Publish.

## Giai đoạn 3A trước đó

- [x] Kiểm chứng từng quyền của chín liên kết chức vụ còn chờ, gồm đọc/ghi/báo cáo/xuất/workflow.
- [x] Chỉ kích hoạt tập quyền có rào backend an toàn; ghi rõ chức năng quản lý còn chờ.
- [x] Kiểm tra cấp/thu hồi theo nguồn, kiêm nhiệm, thời gian hiệu lực, ngoài phạm vi và chống tự nâng quyền.
- [x] Hiển thị quyền tự nhận và lý do chặn trong quy trình phân công hiện có; không thêm quản trị trùng.
- [x] Cập nhật báo cáo Chuyển đổi quyền cũ và bàn giao kết quả, không thực thi reset.
- [x] Kiểm thử cô lập và Preview; không bổ nhiệm thật, không thay Kinh doanh, chưa Publish.

## Giai đoạn 2.5 đã hoàn thành

- [x] 1. RPC backend `account_permission_explain` (0334) — một nguồn giải thích quyền.
- [x] 2. Debug tab đọc từ RPC backend, bỏ thuật toán tính riêng.
- [x] 3. Frontend hỗ trợ nhiều Role (roleIds, loại trùng, replace/additive); roleId = Role chính hiển thị.
- [x] 4. Picker giao việc theo ID; job mới lưu writerId/designerId/ownerId/assigneeId; job cũ giữ nguyên.
- [x] 5. Kiểm chứng + kích hoạt liên kết Role Đóng hàng (0335); 9 liên kết còn lại chờ kiểm chứng scope.
- [x] 6. Báo cáo đối chiếu reset (A/B/C/D) đã có trong khu vực quản trị nâng cao — chỉ xem trước.
- [x] 7. Kiểm thử: 21 test mới đạt; hồi quy 1426/1443 (2 lỗi date-dependent đã biết); typecheck/build đạt.
- [x] 8. Báo cáo bàn giao docs/phase25-report.md.

Mở (chờ Admin): bổ nhiệm nhân sự thủ công và đối chiếu ngoại lệ Bích Ngọc (69 quyền riêng chứa quyền Tín hiệu) / Viewer chưa rõ nguồn. Quyền quản lý theo đơn vị chưa hỗ trợ ở nhiều phân hệ nên không tự cấp; không giả lập đã hoàn thiện. Không cấp Role nền hàng loạt vì Task legacy chưa có rào máy chủ đầy đủ; Admin chọn khi phù hợp. Báo cáo chi tiết: docs/final-permission-transition-report.md.
Quyết định mới: được chuyển đổi nguồn cũ ngoài Kinh doanh có thể xác định chính xác, có snapshot/khôi phục; không bổ nhiệm tự động, không Publish, Kinh doanh giữ nguyên.
