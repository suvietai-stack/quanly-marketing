# Retire Role cũ cho Base 515 — **chưa áp dụng**

Yêu cầu của chủ dự án: nhân viên nhận Role theo sơ đồ tổ chức; không gán thủ công. Bỏ 29 Role thế hệ V1 khỏi catalog hoạt động, bảo vệ Role `role-super-admin` và `role-admin`, không xóa nhân viên, bổ nhiệm hoặc lịch sử.

Snapshot đọc trực tiếp production 16/11/2026:
- 31 V1: 2 protected + **29 sẽ retire**, có hai role cũ `role-nhan-su-moi` và `role-dong-hang` được đánh dấu `is_system=true` dù không có người nhận.
- 17 title links V1, **tất cả inactive**. Không có direct-user, V2-position, V2-task, slot hay business exception nào trỏ vào 29 Role.
- 2 `user_roles` hiện tại đều gắn Super Admin. 26 V2 Roles và policy 515 hiện hoạt động.
- Fingerprint 29 Role `6de25f7bbb1f9cbe4df96e5e5944c861`; 17 links `b2ba1d705627b5e25f07927e23107d48`.

**Thứ tự rollout**: (1) áp và kiểm thử migration account approval 515 không gán direct Role; (2) backup hệ thống/PITR; (3) chạy preflight read-only; (4) duyệt exact candidate này; (5) chạy migration trong cửa sổ giới hạn lưu lượng, (6) nghiệm thu và Publish.

Candidate tạo backup toàn bộ 29 Role + 17 inactive links trong bảng private và chụp dấu hash, xóa links inactive trước, bỏ cờ `is_system` cho đúng **hai Role cũ** rồi để trigger bảo vệ hệ thống kiểm tra delete. Không dùng CASCADE. Role Super Admin/Admin, V2, nhân viên, org/mkt assignment và lịch sử audit không bị xóa.

Rollback khóa `app_roles` ACCESS EXCLUSIVE và tạm tắt **chỉ trigger validate khi tạo Role** trong transaction để phục hồi nguyên vẹn metadata lịch sử (bao gồm quyền privileged không được âm thầm tự kích hoạt). Trigger audit vẫn bật; nếu lỗi transaction tự rollback và trigger trở về trạng thái ban đầu. Rollback so sánh fingerprint full row, từ chối ghi đè ID bị sử dụng lại.

Còn phải rà các RPC/hàm cũ có hardcode ID V1 (`standard_role_catalog_setup`, `final_permission_account`, `account_approve`) trước khi áp. **Không chạy candidate nếu chưa hoàn tất rà soát này hoặc thiếu owner review**.
