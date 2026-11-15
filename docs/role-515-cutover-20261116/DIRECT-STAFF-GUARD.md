# Role 515: khóa quyền gán trực tiếp ở server

**STAGED — chưa áp production.** Cần chạy `account-approval-candidate.sql` trước.

Cơ cấu hiện có: 2 direct `user_roles` đều Super Admin, không có user thường gán direct. `auth.setRole` frontend đã khóa nhưng client cũ/API vẫn có thể gửi yêu cầu ghi bảng nếu được policy cho phép. Candidate thêm BEFORE INSERT OR UPDATE trigger cho bảng `user_roles`, từ chối mọi Role không phải `role-super-admin` hoặc `role-admin`. Hai Role quản trị vẫn đi qua các trigger hierarchy/identity hiện có; trigger này **không tự cấp quyền quản trị**.

Nhân viên nhận Common tự động; Role vị trí/nhiệm vụ theo nguồn bổ nhiệm. Dù là tài khoản Super Admin, cũng không thể cấp Role nhân viên theo cách thủ công qua bảng user_roles.

**Thứ tự duyệt:** Backup/PITR → migrate account_approve → test nhân viên mới không có user_roles → apply guard → test INSERT/UPDATE Role nhân viên bị trả 42501 → Role V1 retirement → dormant reactivation → DELETE RLS. Kèm rollback chính xác gói này.
