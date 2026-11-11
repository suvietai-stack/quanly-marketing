# UX Role & Quyền cá nhân — 11/11/2026

## Đã triển khai
- Một đường chỉnh Role: `RoleCatalog.tsx`; `AccountsSettings.RolesTab` cũ chỉ dẫn về `/organization`, bỏ RoleEditDialog/ma trận cấp tất cả cũ. MatrixTab nâng cao chỉ đọc và chỉ Super Admin thấy.
- Ba khu vực: Role & Phân quyền, Cơ cấu & Bổ nhiệm, Hồ sơ nhân viên. Chuyển đổi/nguồn cũ nằm phần đóng mở của Admin.
- `PermissionChecklist.tsx`: nhóm chức năng có checkbox Việt hóa (không suy đoán CRUD từ key), tìm kiếm, lọc đã/chưa chọn, số quyền, header sticky, một cột mobile; không chọn tất cả toàn Base. Bulk nhóm chỉ xuất hiện khi toàn nhóm an toàn và không có scope unit.
- Quyền đã có được giữ trong bản nháp; quyền mới chưa kiểm chứng không tích được. Bỏ/thêm quyền truy cập đi kèm được cảnh báo, có nút thêm cha đã kiểm chứng; không âm thầm tích hoặc xóa con.
- `StaffPermissionEditor.tsx`: bỏ menu Role bổ sung; quyền riêng chỉ cộng thêm cho một nhân viên. Preview máy chủ có thêm/bỏ, reason, audit và kiểm tra hết hạn/nguồn thay đổi; giữ các Role trực tiếp cũ, không sửa Role chung. Chặn tự cấp, Super Admin và active replace/legacy.
- 13 cấu hình replace đang tắt không được tự chuyển. Chỉ lần lưu riêng có xác nhận mới thay cấu hình của đúng người sang additive, bản cũ nằm account_permission_changes. Active replace bị chặn.

## Thay đổi database
- **0369_permission_editor_drafts_and_additive_preview**: policy tường minh theo mã tồn tại/allowlist thực thi; Role mới có quyền an toàn qua preview/apply thay cho yêu cầu rỗng cố định; giữ quyền cũ trong edit, chặn thêm quyền chưa an toàn và mở scope tín hiệu. Thêm private staff_permission_previews, sửa account_supplement_save additive-only và bắt buộc preview; không thao tác nhân sự thật.
- **0370_permission_editor_source_capabilities**: policy trả riêng position_ready/task_ready để frontend không gợi ý quyền chuyên môn chưa kích hoạt qua ô vị trí.
- Cả hai migration đã áp dụng; types tự sinh. RPC permission_editor_read đã đọc thành công trong browser: **42 mã, 14 quyền riêng** trước 0370; 0370 chỉ thêm metadata, không đổi tập mã.
- Không INSERT/UPDATE Role hay quyền production, không seed preset, không mapping, reset/cutover hoặc Publish. Chỉ tạo bản nháp preview không cấp quyền.

## Preset nháp (không Role production nào được áp)
| Gợi ý | Mã quyền | Số tối đa đã kiểm chứng |
|---|---|---:|
| Nhân viên | leave.create/view_own; att.create/view_own; order.view/view_mine/take/update_draft/submit/history | 10 |
| Trưởng nhóm | leave.create/view_own; att.create/view_own | 4 |
| Trưởng phòng / Giám đốc | 4 quyền cá nhân trên + leave.view_unit + ot.view_unit | 6 |
| Content Web | web.view/content_view/content_view_mine/outline_start/outline_submit/post_write_start/post_submit | 7 |
| SEO | web.view/keyword_view/keyword_open_sheet | 3 |
| Local SEO | local.view/view_mine/post_create/post_edit | 4 |
| Social | social.view/post_view/post_view_mine/post_create/post_edit/post_start/post_submit | 7 |
| Video | video.view/view_mine/create/script_start/script_submit/submit | 6 |

Preset lọc lại bằng policy backend và đúng loại nguồn; không áp theo tên Role. Không gợi ý quản lý nhóm, duyệt, xóa, admin, xuất rộng, SEO kỹ thuật hay điều hành toàn Base khi chưa có phạm vi đã kiểm chứng. Scope đơn vị chỉ quyền xem, cùng nguồn bổ nhiệm. Marketing vẫn chọn nhiều qua nhiệm vụ, không qua Role trực tiếp; Thiết kế/Chụp ảnh giữ nguyên.

## Kiểm thử thực tế
- **160 test đạt**: 18 mới (14 PGlite + 4 preset), 34 catalog/slot/parity, 108 hồi quy CRM/3K/Marketing/scope/Tín hiệu/Đơn hàng/Tiền Về/Phê duyệt/mapping. PGlite chạy chức năng SQL từ migration; A/B gọi private.has_permission từ 0331 kết nối org_slot_rules, không chỉ union frontend.
- A và B giữ Role A: sửa Role đổi cả hai; Role C không đổi; unit A/B không trộn. Quyền riêng A không sang B; thu hồi quyền riêng không trừ quyền Role; audit giữ trước/sau. Active replace, self/SA, permission system/unit, Role bổ sung, preview thiếu/hết hạn/stale đều bị chặn.
- Preview đăng nhập thật ban đầu: chọn preset Nhân viên, **10 thêm / 0 bỏ / 0 ảnh hưởng**, mở xác nhận Role mới mà không áp dụng; dropdown mobile và không tràn ngang; không pageerror. Ảnh kiểm thử tạm trong /tmp/browser/role-matrix.
- Harness **typecheck/build OK** ở bản cuối kiểm tra. Không chạy build/typecheck tay.
- Kiểm thử browser quyền cá nhân và thử preset Role hiện hữu **chưa hoàn tất**: sau lần đầu, phiên chờ khôi phục và Lovable Cloud báo pooler unavailable khi mint phiên; restart preview không khắc phục dịch vụ kết nối. Không coi phần này đã nghiệm thu; không sửa Auth để vượt rào.
- Apply/save được kiểm chứng trong PGlite, **không thực thi trên dữ liệu nhân viên thật**. Hai kết nối đồng thời/end-to-end mọi module chưa kiểm chứng lượt này.

## Nguồn legacy và xác nhận còn cần
- Giữ title_role_links của bổ nhiệm chưa gắn ô (chỉ enabled_permissions đã đối chiếu), user_roles, quyền replace cũ đang tắt, biz_appointments/native CRM/3K/workflow. Sửa Role legacy không tự mở rộng enabled_permissions; role mới qua ô dùng slot.role_id. Không tuyên bố đã cutover.
- Admin cần xem quyền thêm/bỏ và số người trước khi áp preset cho Role hiện hữu; xác nhận riêng nếu thay cấu hình cá nhân cũ đang tắt. Mapping/legacy cutover vẫn là yêu cầu riêng chưa được phép thực thi.
- Chờ kết nối Cloud phục hồi để nghiệm thu UI quyền riêng và preset Role hiện hữu; không phải chờ Admin cung cấp mật khẩu.

## File ứng dụng/test thay đổi
`RoleCatalog.tsx`, `StaffPermissionEditor.tsx`, `PermissionChecklist.tsx`, `BaseOrganization.tsx`, `AccountsSettings.tsx`; `basePermissions/permissionEditor.ts`, `permissionEditor.test.ts`, `permissionEditor.database.test.ts`; migrations 0369/0370, hướng dẫn basePermissions, roadmap, báo cáo này. Không thêm màn hình Role song song.