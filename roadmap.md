# Roadmap — Giai đoạn 2.5: Phân quyền, Role theo chức vụ, định danh nhân sự

- [ ] 1. RPC backend `account_permission_explain` — một nguồn giải thích quyền (roles, nguồn cấp, chế độ override, DENY, quyền hiệu lực), chỉ Super Admin/quản trị quyền.
- [ ] 2. Debug tab đọc từ RPC backend, bỏ thuật toán tính riêng.
- [ ] 3. Frontend hỗ trợ nhiều Role (roleIds, loại trùng, tôn trọng replace/additive); giữ roleId làm Role chính hiển thị.
- [ ] 4. SpecialtyStaffPicker + các form giao việc dùng ID ổn định; lưu ID khi schema cho phép; job cũ giữ nguyên.
- [ ] 5. Kiểm chứng và kích hoạt liên kết Role theo chức vụ đủ an toàn (từng cái một, có kiểm thử backend).
- [ ] 6. Báo cáo đối chiếu reset quyền (A/B/C/D) trong khu vực quản trị nâng cao — chỉ xem trước.
- [ ] 7. Kiểm thử 20 tình huống bắt buộc + hồi quy + build.
- [ ] 8. Báo cáo bàn giao docs/phase25-report.md.

Nguyên tắc: không reset quyền, không Publish, Kinh doanh giữ nguyên.
