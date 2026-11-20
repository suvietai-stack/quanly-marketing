# Phân quyền Đề nghị Thanh toán / Tạm ứng / Tạm ứng lương — 2026-11-20

## Hiện có
- 16 quyền trong catalog (`src/lib/auth.ts`, nhóm "Tài Chính Kế Toán"):
  - Tạm ứng: `fr.advance.view_scope / approve / pay / report / settings`
  - Thanh toán: `fr.payment.view_scope / approve / pay / report / settings`
  - Tạm ứng lương: `fr.salary.view_scope / approve / pay / deduct / report / settings`
- Máy chủ kiểm tra từng quyền trong RPC `fr_*` bằng `private.sig_can` (cài đặt quy trình, loại thanh toán/tạm ứng, danh mục khoản chi, nhóm Zalo đều cần `fr.<kind>.settings`).
- Tab "Cài đặt" của từng trang chỉ hiện khi có `fr.<kind>.settings`.

## Thiếu
1. Trong chính sách cấp quyền đang chạy (`org_role_permission_ready`, migration 0358) không có khóa `fr.*`, còn các gói trung gian loại mọi khóa `settings`. Vì vậy ô tick của 16 quyền này không bật được trong Role, và có tick cũng không có hiệu lực ⇒ chỉ Super Admin dùng được.
   Gói đang chờ duyệt `docs/role-permission-full-2026-11-12` (candidate SHA256 `4a0eb2cf…`) đã bao gồm cả 16 khóa: Super Admin tick được vào Role; `fr.*.settings` được xếp là quyền quản trị nên chỉ Super Admin thêm được. PR này không tạo SQL song song để tránh xung đột với gói đó.
2. Gợi ý Role chuẩn "Kế toán" / "Kế toán trưởng" chưa có quyền `fr.*` nào.

## Thay đổi trong PR
- `defaultRolePresets.ts`: Kế toán và Kế toán trưởng được gợi ý `view_scope`, `pay`, `report`, `settings` cho cả ba chức năng, cộng `fr.salary.deduct`; riêng Kế toán trưởng thêm `approve`. Gợi ý vẫn được lọc theo chính sách máy chủ, nên trước khi áp gói 510 quyền các khóa này hiện ở mục "chưa thể cấp", không cấp ngầm.
- Test chặn: không Role chuẩn nào ngoài hai Role kế toán nhận khóa `fr.*`.

## Để kế toán cài đặt được (cần chủ dự án duyệt)
1. Duyệt và áp dụng `docs/role-permission-full-2026-11-12/candidate.sql` đúng SHA trong `SHA256SUMS`.
2. Super Admin mở Role "Kế toán" (và "Kế toán trưởng"), áp gợi ý hoặc tick các quyền `fr.*` rồi lưu qua preview/apply có audit.
