# Role 515 — không gán trực tiếp khi duyệt nhân viên

**Chưa triển khai production.** Ngày chuẩn bị: 16/11/2026.

Live DB: catalog 515, policy 515, 26 Role V2 (1 Common), 2 direct assignments đều là Super Admin; `account_approve(uuid,text)` có MD5 `e374f12498c68c720bdffed4c8289941`.

Lỗi gốc: dù frontend gọi RPC không có tham số `_role`, backend hiện **tự gắn** `role-nhan-su-moi` vào `user_roles`. Vì vậy chỉ sửa frontend chưa đạt yêu cầu.

Candidate giữ nguyên điều kiện duyệt, Auth password, xác nhận email và audit; từ chối mọi `_role != NULL` và không INSERT vào `user_roles`. Nhân viên nhận Common từ trạng thái tài khoản, Role vị trí và nhiệm vụ từ bổ nhiệm trên sơ đồ. Giữ nguyên 2 Super Admin hiện hữu và các chức năng other.

`candidate.sql` kiểm tra fingerprint hàm, owner/ACL, số catalog/Role và direct Super Admin; sao lưu nguyên function definition vào bảng private trước khi `CREATE OR REPLACE`. `rollback.sql` kiểm tra hash mới, khôi phục function gốc, không ghi đè khi có chỉnh sửa cạnh tranh. Không xóa Role V1 trong gói này.

**Để áp:** phải có bản sao lưu hệ thống, chạy preflight, duyệt đúng SQL, test PGlite và kiểm tra nhân viên thật qua tài khoản thử. Không chạy tự động khi merge GitHub hay Publish Lovable.
