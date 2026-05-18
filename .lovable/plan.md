
# Kế hoạch rà soát & thực thi Role/Phân quyền (đợt sâu)

Mục tiêu: ma trận quyền ↔ permissionKey trong code ↔ `can()` ↔ UI ↔ action lưu DB phải khớp 100%. Không còn chuyện không tick quyền mà vẫn dùng được.

## 1. PERMISSION_REGISTRY là nguồn sự thật duy nhất

- Trong `src/lib/auth.ts`, mở rộng `PermissionDef` thêm các trường:
  - `description?: string`
  - `dependsOn?: PermissionKey[]` (quyền cha bắt buộc, ví dụ `web.tech_check` → `web.tech_view`)
- Bổ sung `dependsOn` cho tất cả quyền hành động (create/edit/delete/update/status/approve/...) trỏ về quyền `*_view` tương ứng.
- Xuất `PERMISSIONS` (đã có) làm registry chuẩn. Ma trận phân quyền (`AccountsSettings.tsx`) render checkbox **chỉ** từ registry này.
- Map các key trong tài liệu yêu cầu (`view_technical_seo`, `update_index_status`, ...) sang key chuẩn đang dùng trong code (`web.tech_view`, `web.update_index`, ...). Không đổi tên hàng loạt key đang lưu DB; thay vào đó dùng một bảng alias để chấp nhận cả tên cũ → mới khi đọc, và **chuẩn hóa khi ghi**. (Đổi key trực tiếp sẽ làm mất quyền của role đã lưu trên cloud.)

## 2. Logic dependsOn

- Trong `can(key)`:
  - Nếu `key` có `dependsOn`, mọi parent đều phải `can(parent)` mới trả `true`.
- Trong UI ma trận quyền:
  - Tick con → auto tick toàn bộ cha.
  - Bỏ tick cha → auto bỏ tick toàn bộ con phụ thuộc.
  - Hiển thị badge cảnh báo nếu lưu ra trạng thái không hợp lệ (con bật, cha tắt) — auto sửa khi Save.

## 3. Reset quyền mặc định role Content Web & SEO

- Trong store/migration seed của `app_roles`, cập nhật quyền mặc định **chỉ** cho 2 role hệ thống `role-content-web` và `role-seo` theo đúng danh sách bạn cung cấp ở mục 4 và 5. Không đụng vào role do user tự tạo.
- Thực hiện bằng `supabase--insert` (UPDATE `app_roles` SET permissions = ...).

## 4. `can()` strict + effective permissions

- Refactor `can()`:
  ```ts
  if (!user) return false;
  if (user.status !== "Đang hoạt động") return false;
  if (isSuperAdmin) return true;
  const eff = user.useCustom ? user.customPermissions : rolePermissions;
  if (!eff.includes(key)) return false;
  // check dependsOn
  return (PERMISSION_BY_KEY[key]?.dependsOn ?? []).every((p) => can(p));
  ```
- Bỏ hoàn toàn fallback theo role name (trừ Super Admin).
- Bỏ blanket `isAdmin` bypass đã xóa ở đợt trước — giữ nguyên.

## 5. Gate UI + action ở các module còn lỏng

Tập trung các điểm bạn nêu (Content Web vẫn sửa được vùng không thuộc):

- **TechnicalSeoTab.tsx**:
  - Render tab cha chỉ khi `can("web.tech_view")` (gate ở `websites.$id.tsx`).
  - Checkbox `disabled={!can("web.tech_check")}`; handler chặn + toast.
  - Textarea diễn giải `readOnly` + `disabled` nếu `!can("web.tech_edit_desc")`.
  - Nút Reset ẩn nếu `!can("web.tech_reset")`.
- **BasicReportTab / Index tab** (`web.index_view`, `web.update_index`, `web.update_share`, `web.update_share_date`, `web.edit_published_url`).
- **KeywordsTab (Check TOP)**: nút "Cập nhật TOP chính/phụ", thêm/sửa/xóa từ khóa phụ.
- **KeywordResearchTab**: thêm/sửa/xóa Topic + mở sheet.
- **BacklinksTab**: create/edit/delete/status/open.
- **GrowthTab**: create/edit/delete kỳ báo cáo.
- **EntitySocialTab**: create/edit/delete/open link/reveal password.
- **ContentForm / ContentDetail**: nút approve/reject outline & post, force status, publish, cancel, restore — gate cả nút lẫn handler.

Mỗi handler: `if (!can(key)) { toast.error("Bạn không có quyền ..."); return; }` trước khi gọi store/Supabase.

## 6. Công cụ Dò quyền (Super Admin)

Trong `AccountsSettings.tsx` (đã có tab "Permission Debug" sơ khai từ đợt trước):
- Chọn user → hiển thị: role, mode (role/custom), danh sách effective permissions (group theo module).
- Ô input key + nút Test → trả về `true/false` + lý do:
  - "Super Admin override" / "Có từ role <name>" / "Có từ quyền riêng" / "Thiếu quyền cha: X" / "Không có quyền".

## 7. Báo cáo audit "Kiểm tra khớp quyền"

Thêm sub-tab cho Super Admin:
- Kiểm 1: key dùng trong code (grep static list của `can(...)` calls) không có trong registry.
- Kiểm 2: key trong registry không xuất hiện trong codebase (cảnh báo có thể chết).
- Kiểm 3: role/user có quyền con bật mà quyền cha tắt (dùng `dependsOn`).
- Kiểm 4: role (không phải Super Admin) có ≥ 95% tổng quyền → cảnh báo "near full".
- Kiểm 5: user `useCustom=true` có quyền không nằm trong role gốc → liệt kê.

Hiển thị bảng warning + nút "Auto-fix dependency" cho từng dòng.

## 8. Đếm số quyền role chính xác

- Trong danh sách role, đếm `permissions.filter(k => registry has k && deps satisfied within set).length`.
- Hiển thị badge "X quyền · Y cảnh báo" nếu có dependency lỗi.

## 9. Test case Content Web (ngoc)

Sau khi xong, test thủ công với user `ngoc`:
- Không thấy tab Technical SEO / Check TOP / Index / Backlink / Growth / Keyword Research nếu role không cấp `*_view`.
- Thấy tab nhưng không tích/sửa được nếu chỉ có view.
- Workflow outline/bài hoạt động bình thường.

## 10. Phạm vi & rủi ro

- File sẽ chạm: `src/lib/auth.ts`, `src/components/AccountsSettings.tsx`, `TechnicalSeoTab.tsx`, `BasicReportTab.tsx`, `KeywordsTab.tsx`, `KeywordResearchTab.tsx`, `BacklinksTab.tsx`, `GrowthTab.tsx`, `EntitySocialTab.tsx`, `ContentDetail.tsx`, `ContentForm.tsx`, `websites.$id.tsx`, `web-contents.tsx` + 1 migration cập nhật permissions mặc định cho 2 role hệ thống.
- Rủi ro lớn nhất: đổi default permissions sẽ làm Content Web/SEO **mất quyền** đang dùng trên cloud nếu Admin đã chỉnh tay. Mình sẽ chỉ reset 2 role hệ thống có id cố định (`role-content-web`, `role-seo`), không đụng custom roles.

## Thứ tự thực thi (đề xuất)

1. Mở rộng registry + `dependsOn` + strict `can()` (foundation).
2. Migration reset permissions Content Web + SEO.
3. Gate UI + action cho TechnicalSeoTab, KeywordsTab, BasicReportTab (3 vùng bạn nêu cụ thể).
4. Gate UI + action cho các tab còn lại (Backlink, Growth, Keyword Research, Entity).
5. UI dependency auto-tick/untick + warning trong ma trận quyền.
6. Permission Debugger nâng cấp + Audit report.
7. Test bằng user ngoc.

---

**Bạn xác nhận plan này để mình triển khai theo thứ tự trên?** Nếu muốn ưu tiên/cắt giảm phần nào (ví dụ chỉ làm bước 1-4 trước, để Debug/Audit sang sau) thì báo mình.
