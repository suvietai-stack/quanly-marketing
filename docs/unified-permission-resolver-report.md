# Báo cáo — Thống nhất logic phân quyền toàn Base (bản 68)

Ngày: 2026-11-11. Phạm vi: sửa tận gốc tính nhất quán của hệ phân quyền đang có. Không làm lại cơ cấu, không tạo Role mới, không reset dữ liệu, không thêm tầng phân quyền, không cải tổ giao diện, chưa Publish.

## 1. Resolver và nghiệp vụ đã sửa

Rà soát toàn bộ: `private.base_decision`, `private.has_permission`, `private.base_legacy`, `private.base_effective`, `base_permissions_effective`, `account_permission_explain`, `getUserPermissions`, `explainPermission`, `useCurrentUser().can/canSee/scopeList`, và các RPC/RLS nghiệp vụ (sig_can, biz_can, k3_can, crm_can, fin_*, leave/att, ot_*).

Năm điểm cho kết quả khác nhau đã được sửa về MỘT ngữ nghĩa duy nhất — ngữ nghĩa của `private.has_permission` (0331):

1. **Debug bỏ sót quyền Role trực tiếp của quyền đã kiểm chứng** (0351): quyền đã kiểm chứng không có rule nguồn bị Debug báo "không có" dù backend cấp qua Role trực tiếp (fallthrough). → Migration 0353 viết lại `account_permission_explain`: quyền đã kiểm chứng bị DENY thì chặn, có ALLOW từ nguồn thì cấp, không có quyết định nguồn thì rơi về Role trực tiếp/quyền riêng — y hệt backend.
2. **Debug bỏ qua chế độ replace của quyền riêng** (0351): Debug luôn cộng quyền Role dù tài khoản ở chế độ thay thế. → 0353 tôn trọng `override_mode`.
3. **`base_permissions_effective` (frontend) bỏ qua chế độ additive** (0293 `base_legacy`): mọi quyền riêng đều bị coi là thay thế Role. → 0353 vá `private.base_legacy`: replace thay thế, additive cộng thêm — khớp backend.
4. **Frontend chặn quyền cha mà backend không chặn**: `can()` và `explainPermission()` yêu cầu quyền cha (PERMISSION_DEPENDS) trong khi `has_permission` không kiểm tra. → Bỏ chặn quyền cha ở đường thực thi; PERMISSION_DEPENDS chỉ còn là gợi ý khi soạn Role (`auditDependencies`, dùng trong Cài đặt tài khoản).
5. **Frontend bypass Super Admin trước khi kiểm tra trạng thái tài khoản**: backend yêu cầu `is_active` trước cả bypass. → `can`/`canSee`/`scopeList` kiểm tra "Đang hoạt động" trước mọi nhánh.

Không sửa các workflow đã thực thi quyền đúng (bổ nhiệm org_change nguyên tử, chuyên môn Marketing, duyệt tài khoản, reset legacy).

## 2. Quyền theo phạm vi đã chuẩn hóa

- Một kết quả quyền hiệu lực duy nhất xuyên backend / frontend / Debug cho mọi permission key, kể cả quyền đã kiểm chứng theo chức vụ/nhiệm vụ, quyền Role trực tiếp, quyền riêng replace/additive, DENY ưu tiên, tài khoản khóa, Super Admin.
- Phạm vi dữ liệu vẫn thực thi tại backend theo từng phân hệ như hiện hành (RLS/RPC): Tín hiệu theo nhóm nhu cầu + người phụ trách; CRM/Kinh doanh/3K theo phạm vi bổ nhiệm (biz_scope); Tài chính theo `fin_can_see`; Nghỉ phép/chấm công/Đơn hàng theo chủ sở hữu + quyền view_all/manage. Không mở rộng phạm vi nào.
- Quyền ALLOW từ bổ nhiệm chỉ kích hoạt cho permission đã kiểm chứng với `scope_kind='own'`; không tự đồng nghĩa toàn Base.

## 3. Kết quả kiểm thử

- 44/44 kiểm thử resolver đạt, gồm kiểm thử parity TUYỆT ĐỐI mới: `account_permission_explain.effective` ≡ `private.has_permission` cho mọi quyền trong danh mục trên 5 dạng tài khoản (nhiều Role, replace, additive, quyền đã kiểm chứng cấp trực tiếp qua Role, bị DENY).
- Thêm kiểm thử `base_legacy` replace/additive.
- Hồi quy toàn dự án: 1508/1510 đạt; 2 lỗi còn lại thuộc `biz/my-work` phụ thuộc ngày chạy (đã ghi nhận từ trước, không liên quan đợt này).
- Typecheck và build đạt. Đã xác nhận database thật đang chạy định nghĩa hàm mới (pg_get_functiondef).
- Kiểm thử dùng dữ liệu cô lập (PGlite); không thử trên quyền nhân sự thật.

## 4. Permission chưa thể kích hoạt an toàn (giữ nguyên chặn)

- Quyền quản lý theo đơn vị (manage/approve/assign/view_all nhiều phân hệ), kế toán, cung ứng: chưa có hợp đồng phạm vi backend được kiểm chứng — không tự cấp từ bổ nhiệm.
- `biz.*`/`k3.*` qua Role chuẩn Kinh doanh: chờ kiểm chứng phạm vi Hệ/Phòng/Nhóm; hiện chặn an toàn.
- Cấu hình toàn hệ thống (settings.*, ngân hàng, Zalo GMF), force_status/delete/restore: chỉ cấp thủ công có kiểm soát.

## 5. Giới hạn còn tồn tại

- **Phạm vi nhóm Tín hiệu** (`signal_scope`/`signal_scope_all`) vẫn suy ra từ Role TRỰC TIẾP (user_roles), không từ nguồn bổ nhiệm: nhân sự nhận quyền tín hiệu qua bổ nhiệm chuẩn sẽ không tự có phạm vi nhóm. Giữ cơ chế an toàn hiện hành theo đúng chỉ đạo "không tự mở rộng quyền"; cần một hợp đồng phạm vi riêng nếu muốn gắn vào bổ nhiệm.
- `getUserPermissions` cục bộ chỉ là dự phòng khi chưa có đọc máy chủ; quyền đã kiểm chứng fail-closed cho tới khi có `base_permissions_effective`.
- Kiểm tra parity trên database thật bằng SQL trực tiếp không khả thi vì `account_permission_explain` yêu cầu phiên đăng nhập; parity được bảo chứng bằng kiểm thử cô lập nạp đúng chuỗi migration.
