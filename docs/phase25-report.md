# Báo cáo Giai đoạn 2.5 — Phân quyền, Role theo chức vụ, định danh nhân sự

Ngày: 2026-11-11. Phạm vi: Preview, chưa Publish. Không reset quyền, không đổi dữ liệu Kinh doanh.

## 1. Thống nhất cách tính quyền hiệu lực

- Migration `0334_account_permission_explain`: RPC `public.account_permission_explain(_target)` —
  một nguồn giải thích quyền duy nhất. Trả về: trạng thái tài khoản, chế độ quyền riêng
  (replace/additive), Role trực tiếp (nhiều Role), nguồn quyền theo chức vụ/nhiệm vụ Marketing
  (kèm ALLOW/DENY và phạm vi), quyền riêng, và tập `effective` được tính bằng chính
  `private.has_permission` cho từng quyền ứng viên → Debug luôn khớp backend theo cấu trúc.
- Chỉ Super Admin hoặc người có `settings.user_view`/`settings.user_custom_perm` gọi được (42501).
- Tab "Kiểm tra quyền" (Debug) trong Cơ cấu tổ chức → Role & Phân quyền → Nâng cao đã chuyển sang
  đọc RPC này; bỏ hoàn toàn thuật toán tính quyền riêng phía client. Ô test `can(key)` tra trong
  kết quả backend và nêu nguồn cấp/chặn.

## 2. Nhiều Role trên một tài khoản

- `User.roleIds`: toàn bộ Role trực tiếp; `roleId` giữ làm Role chính hiển thị (tương thích legacy).
- `getUserPermissions`/`explainPermission` tổng hợp mọi Role hiệu lực, loại trùng theo ID,
  tôn trọng replace/additive; `explainPermission` nêu đúng tên Role cấp quyền.
- Backend (`private.has_permission`) vốn đã union mọi `user_roles` — frontend giờ khớp backend.

## 3. Định danh nhân sự bằng ID

- `SpecialtyStaffPicker` chọn theo ID tài khoản (không còn `value={p.name}`); `onChange(name, id)`
  trả cả tên hiển thị lẫn ID. Hai người trùng tên chọn riêng biệt, kèm đơn vị/chức vụ.
- `resolvePickerSelection` (src/lib/marketingSpecialties.ts): ID hợp lệ luôn thắng; tên legacy chỉ
  tự gắn ID khi khớp đúng một người; trùng tên/không xác định → giữ trạng thái legacy, không đoán.
- Job mới lưu thêm ID trong payload JSON (schema JSONB sẵn có, không cần đổi bảng):
  Content Web (`writerId`), Social (`writerId`, `designerId`), Video (`ownerId`), Order Thiết kế
  (`assigneeId`). Bản ghi cũ giữ nguyên người phụ trách; `isOwner` của Video chấp nhận cả ID lẫn tên cũ.

## 4. Role theo chức vụ — kiểm chứng và kích hoạt

- Migration `0335_ot_packing_verified_permissions`: kiểm chứng 4 quyền cá nhân `ot.view_own`,
  `ot.task_view`, `ot.task_update`, `ot.stage_update` (bằng chứng backend 0032: xem đơn giới hạn
  sale/supply/người tạo; sửa công việc chỉ người được giao, 4 trường cho phép; công đoạn chỉ đơn
  mình xem được). Thêm vào `private.org_role_permission_ready`.
- Kích hoạt đúng một liên kết: chức vụ "Nhân viên Đóng hàng" → `role-dong-hang` qua
  `enabled_permissions` (scope `own`, chữ ký quyền khớp Role, có sự kiện audit). Hàng rào
  full-Role (`active=false`) giữ nguyên. Bổ nhiệm vào chức vụ → tự có 4 quyền; miễn nhiệm/điều
  chuyển → nguồn cấp kết thúc theo membership; chưa bổ nhiệm → không có quyền.
- 9 liên kết còn lại CHƯA kích hoạt: Role Leader Marketing, Designer/Chụp ảnh, Kế Toán, Cung Ứng,
  Hành Chính Nhân Sự chứa quyền phạm vi rộng (view_all, quản lý, settings.*) chưa có resolver
  scope theo đơn vị an toàn chu kỳ — cần kiểm chứng từng quyền trước khi bật.

## 5. Chuẩn bị reset quyền (chỉ xem trước)

- Báo cáo đối chiếu đã có tại Cơ cấu tổ chức → Role & Phân quyền → Nâng cao → "Chuyển đổi quyền cũ":
  phân loại A/B/C/D, trạng thái Sẵn sàng/Cần xử lý/Được bảo vệ kèm lý do, quyền dự kiến mất,
  nguồn thay thế. Chỉ đọc; execute yêu cầu chọn tài khoản "Sẵn sàng" + fingerprint + chuỗi xác nhận.
  Kinh doanh, Super Admin, tài khoản có quyền riêng đều được bảo vệ. Không chạy chuyển đổi thật.

## 6. Kiểm thử

- `src/lib/permissionExplain.database.test.ts` (9): đa Role, replace/additive, effective khớp
  has_permission tuyệt đối, phân quyền gọi RPC, ot.* ready, liên kết Đóng hàng + chữ ký + audit,
  DENY thắng, Super Admin toàn quyền.
- `src/lib/multiRole.test.ts` (7): union đa Role, legacy một Role, replace/additive, Role đã xóa,
  explain nêu đúng nguồn.
- `src/lib/marketingSpecialties.test.ts` (+5): resolvePickerSelection theo ID, trùng tên, nghỉ việc.
- Hồi quy: 1426 đạt / 1443; 2 lỗi date-dependent đã biết (my-work); 3 file lỗi khi chạy song song
  đều đạt khi chạy riêng (tranh chấp tài nguyên PGlite, không phải hồi quy). Typecheck + build đạt.

## 7. Chưa làm / chờ

- Chưa xác minh giao diện Debug trên preview bằng tài khoản Super Admin thật (cần phiên đăng nhập).
- 9 liên kết Role theo chức vụ còn lại chờ kiểm chứng scope quản lý (cần resolver theo đơn vị an toàn).
- Reset quyền cũ ngoài Kinh doanh: chỉ thực hiện ở giai đoạn cuối khi có xác nhận riêng.
