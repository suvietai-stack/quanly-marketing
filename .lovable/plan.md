# Kế hoạch hoàn thiện Role & Phân quyền

Đây là thay đổi lớn xuyên suốt app. Mình sẽ chia làm 4 đợt để dễ kiểm soát, mỗi đợt build xong là quyền đã chạy thật, không bị "nửa vời".

---

## Đợt 1 — Nền tảng quyền (bắt buộc làm trước)

**Mục tiêu**: tạo "nguồn sự thật" duy nhất cho toàn bộ permission key + helper `can()`.

1. Viết lại `src/lib/auth.ts`:
   - Định nghĩa lại toàn bộ `PermissionKey` theo đúng danh sách trong yêu cầu (A → K, ~250 quyền), gom theo nhóm module: `overview / task / brand / web (D1–D11) / social (E1–E3) / local / video / order / report / settings / account`.
   - Mỗi quyền có metadata: `{ key, group, subGroup, label, description }` để render ma trận đẹp.
   - `DEFAULT_ROLE_PERMISSIONS` cho 10 role mặc định (Super Admin, Admin, Leader Marketing, SEO, Content Web, Social, Local SEO, Designer, Video, Viewer) đúng theo gợi ý mục 5.
   - Logic `can(key)`:
     - Super Admin → true
     - User có `useCustomPermissions = true` → check trong `customPermissions`
     - Ngược lại → check trong permissions của role
   - Hook `useCurrentUser()` trả về `{ user, role, can, canAny, canAll, isSuperAdmin, isAdmin }`.
   - Hàm scope dữ liệu: `canSeeRecord(record, scopeKey, ownAlternativeKey)` — nếu user chỉ có `view_own_*` thì lọc theo `createdBy / assignee / writer / reviewer / owner...`.

2. Migration map quyền cũ → quyền mới (giữ data role cũ trong Supabase không vỡ).

3. Bổ sung component dùng chung:
   - `<PermissionGate perm="..."><Button/></PermissionGate>` — ẩn/disable + tooltip "Bạn không có quyền…".
   - `<RestrictedAction perm="..." onAction={...}>` cho onClick handlers.

---

## Đợt 2 — UI Cài Đặt: Ma trận phân quyền + Tùy chỉnh quyền theo user

1. `src/components/AccountsSettings.tsx` (hoặc tạo `PermissionMatrix.tsx`):
   - Layout 2 cột: trái chọn Role, phải hiện ma trận.
   - Accordion theo nhóm A–K, mỗi nhóm có sub-group (D1…D11, E1…E3…).
   - Tìm kiếm quyền + filter nhóm.
   - "Chọn tất cả / Bỏ chọn tất cả" cho mỗi nhóm và sub-group.
   - Nút: Lưu, Khôi phục mặc định, Sao chép từ role khác.
   - Khóa hoàn toàn role Super Admin (read-only, mọi checkbox tick + disable).

2. Chi tiết tài khoản:
   - Toggle "Dùng quyền theo role" / "Tùy chỉnh quyền riêng".
   - Khi bật custom: hiện cùng ma trận, có nút "Copy quyền từ role hiện tại", banner cảnh báo ghi đè.
   - Bảo vệ Super Admin hệ thống: không xóa, không khóa, không đổi role, không hạ quyền.

3. Migration Supabase: cột `use_custom` + `permissions` đã có trong `user_permission_overrides` → tận dụng nguyên trạng.

---

## Đợt 3 — Áp quyền vào toàn app (sidebar + route guard + tab + nút)

1. **Sidebar** (`AppShell.tsx`): map lại `perm` cho từng item theo key mới (`view_dashboard, view_tasks, view_brands, view_web_projects, view_social_channels, view_local_maps, view_videos, view_design_orders, view_settings`).

2. **Route guard**: HOC `<RequirePermission perm="...">` bọc các route; nếu thiếu quyền → trang 403 thân thiện.

3. **Tab trong từng module**:
   - Web detail: tab Technical SEO / Entity / Keyword / Content / Index / Backlink / Check TOP / Tăng trưởng / Báo cáo — ẩn nếu thiếu `view_*`.
   - Social detail: tab Thông tin / Sản xuất / Tăng trưởng.
   - Brand detail, Local detail tương tự.

4. **Nút hành động & workflow** (rà từng route):
   - `tasks.tsx`, `brands.tsx`, `websites.*`, `web-contents.tsx`, `ContentDetail.tsx`, `social.*`, `SocialPostDetail.tsx`, `local.*`, `videos.tsx`, `VideoDetail.tsx`, `orders.tsx`, `OrderDetail.tsx`.
   - Mỗi nút Tạo / Sửa / Xóa / Giao / Nhận / Gửi duyệt / Duyệt / Yêu cầu sửa / Bàn giao / Hoàn thành / Hủy / Khôi phục / Ép trạng thái → bọc `PermissionGate` + check trong handler.
   - Form: disable input nếu không có quyền `edit_*`.

5. **Scope dữ liệu**: list trong tasks/web-contents/social posts/videos/orders áp dụng `view_own_*` — chỉ trả record user có vai trò liên quan.

---

## Đợt 4 — Kiểm thử + tinh chỉnh

- Kịch bản test 5 tài khoản theo mục 8 (Admin, SEO Julia, Content ngoc, Designer, Viewer).
- Sửa các chỗ sót (đặc biệt: nút trong Dropdown, Context menu, action ẩn trong dialog).
- Toast/tooltip "Bạn không có quyền thực hiện hành động này" thống nhất.

---

## Chi tiết kỹ thuật

- Tổng số permission key dự kiến: **~250**, gom thành ~30 sub-group.
- Lưu trong Supabase: `app_roles.permissions text[]` + `user_permission_overrides.permissions text[]` (đã có sẵn schema, không cần migration mới).
- Bản đồ quyền cũ → mới giữ trong `auth.ts` để không vỡ role đã lưu.
- Performance: `can()` dùng `Set` trong memo theo user.

---

## Cách triển khai

Mình sẽ làm tuần tự **Đợt 1 → 4**. Mỗi đợt là 1 lượt commit lớn. Đợt 3 là đợt nặng nhất (đụng ~12 file route + dialog).

**Ước tính**: 4 lượt làm việc, mỗi lượt 5–15 phút build/verify.

Bạn duyệt plan này thì mình bắt đầu Đợt 1 ngay (viết lại `auth.ts` + helper). Nếu muốn gộp/đổi thứ tự (ví dụ làm UI ma trận trước), nói mình biết.
