# Báo cáo Giai đoạn tiếp theo — Sửa lỗi phân quyền, chuẩn hóa Role

Ngày: 2026-11-11. Làm trực tiếp trên code chính, không Draft, không Publish, không reset dữ liệu.

## 1. Quyền bị mở rộng do migration 0330 và cách xử lý

**Đối chiếu thực tế (dữ liệu live):** chỉ 1 tài khoản có quyền riêng đang bật — Trần Thị Bích Ngọc (69 quyền riêng, Role Video). Trước 0330 quyền riêng *thay thế* Role; sau 0330 quyền riêng *cộng thêm*, khiến tài khoản này tự nhận thêm **29 quyền** từ Role Video (gồm `order.assign`, `social.post_delete`, `settings.view`, `task.update_status`…).

**Xử lý (migration 0331):**
- Thêm cột `mode` vào `user_permission_overrides`: `'replace'` (legacy, **mặc định**) / `'additive'`.
- Tài khoản cũ tự về `'replace'` → quyền hiệu lực khôi phục đúng như trước 0330 (đã xác minh live: `mode=replace`).
- RPC `public.account_override_mode_set(target, mode)`: chỉ Super Admin hoặc `settings.user_custom_perm`; khóa hàng, tính diff trước/sau, ghi `account_security_logs` (`override_mode_set:<mode>`). Phục hồi = chuyển lại `'replace'`.
- Không xóa quyền riêng, không hạ Role, không sửa migration cũ.
- Migration 0333 vá điều kiện tính toán trong công cụ chuyển đổi: chỉ loại quyền Role khi tài khoản thật sự có quyền riêng chế độ replace.

**Việc còn lại:** Admin đối chiếu 69 quyền riêng của Bích Ngọc với Role Video; chỉ sau xác nhận mới gọi RPC chuyển `'additive'`.

## 2. Quy tắc tính quyền hiệu lực cuối cùng (thống nhất backend/frontend/Debug)

1. Tài khoản không hoạt động → không có quyền.
2. Super Admin → toàn quyền.
3. Quyền đã kiểm chứng (bổ nhiệm/chuyên môn/sale_work): Tier-1 DENY thắng, ALLOW áp dụng.
4. Quyền riêng `mode='replace'` → chỉ quyền riêng; `mode='additive'` → Role ∪ quyền riêng; không có quyền riêng → theo Role.

`private.has_permission` (backend), `getUserPermissions`/`explainPermission` (frontend, gồm công cụ Dò quyền) và `cleanup_account_eval` cùng quy tắc này. Frontend nạp `overrideMode` cùng hồ sơ người dùng.

## 3. Chức vụ đã liên kết Role

9 liên kết hiện có (Giám đốc Marketing, Trưởng phòng Marketing → Leader Marketing; HCNS; Kế toán trưởng/kho → Kế Toán; Trưởng phòng/Nhân viên Thiết kế → Designer; Trưởng phòng Mua hàng/Thu mua → Cung Ứng) + liên kết mới **Nhân viên Đóng hàng → role-dong-hang**. Tất cả vẫn `active=false`, `enabled_permissions=[]` — chưa tự cấp quyền cho đến khi kiểm chứng phạm vi từng phân hệ.

## 4. Role Đóng hàng (migration 0332)

`role-dong-hang` — 4 quyền tối thiểu đúng nghiệp vụ: `ot.view_own`, `ot.task_view`, `ot.task_update`, `ot.stage_update`. Không có quyền Mua hàng, Kế toán, Admin; không gán cho ai.

## 5. Nhân viên trùng tên trong giao việc Marketing

`orderBySpecialty` và `SpecialtyStaffPicker` chuyển từ đối chiếu theo tên sang **ID ổn định** (`user_id`): lọc, loại trùng, xếp hạng đều theo ID; mọi mục hiển thị kèm đơn vị/chức vụ để phân biệt. Giá trị lưu vào bản ghi công việc vẫn là tên hiển thị → bản ghi cũ không bị ảnh hưởng, không cần migration hàng loạt.

## 6. Giao diện quản trị tinh gọn

Cài đặt cơ cấu còn 3 nhóm: **Đơn vị tổ chức** (hiển thị theo cây Khối/Hệ/Phòng/Nhóm, bỏ nút "Quyền mặc định" rải rác), **Chức vụ & Nhiệm vụ**, **Role & Phân quyền**. Ma trận quyền, Dò quyền, Role mặc định, quyền tùy chỉnh, chuyển đổi quyền cũ nằm trong **Nâng cao** theo quyền quản trị.

## 7. File/RPC/migration đã sửa

- Migrations: `0331_override_mode_legacy_default`, `0332_packing_staff_role`, `0333_cleanup_eval_replace_mode_fix`.
- RPC mới: `public.account_override_mode_set(uuid,text)`.
- `src/lib/auth.ts` (overrideMode + resolver thống nhất), `src/lib/marketingSpecialties.ts`, `src/components/SpecialtyStaffPicker.tsx`, `src/components/BaseOrganization.tsx`.
- Tests: `src/lib/newStaffRole.database.test.ts` (9), `src/lib/marketingSpecialties.test.ts` (6), `src/lib/permissionCleanup.database.test.ts` (8, nạp thêm 0331/0333).

## 8. Kết quả kiểm thử

- 23/23 test mới/liên quan đạt; hồi quy tổng 1351 đạt — 2 lỗi còn lại là lỗi phụ thuộc ngày đã biết ở Báo cáo Kinh doanh (`my-work`), không liên quan.
- Typecheck sạch, build OK.
- Xác minh live: tài khoản quyền riêng về `mode=replace`, không còn mở rộng quyền.

## 9. Còn thiếu trước giai đoạn reset quyền

- Đối chiếu + xác nhận Admin cho tài khoản quyền riêng trước khi bật additive.
- Ma trận quyền chỉnh trực tiếp (hiện chỉ đọc).
- Tự cấp/thu hồi trọn Role theo chức vụ — chờ kiểm chứng hàng rào phạm vi backend từng phân hệ.
- Nghiệm thu giao diện theo vai trò sau đăng nhập; chưa Publish.
