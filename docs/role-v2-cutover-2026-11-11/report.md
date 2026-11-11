# Role V2 — cutover an toàn 11/11/2026

## LIVE đã thực hiện
- 25 Role V2 đã đủ: 20 vị trí + 5 nhiệm vụ. Chưa tạo thêm Role theo tên trùng trách nhiệm.
- Giảm **7 quyền** NV Marketing qua audited preview/apply: order.approve/cancel/assign/edit/complete/request_changes và settings.view. Giữ tác vụ requester/được giao để không cắt workflow chưa nghiệm thu.
- 5 task Roles đã bỏ riêng excess ngoài trách nhiệm: Content −20 (toàn Social/Order/settings), SEO −3 (Order), Local SEO −5, Social −6, Video −19 (Social/Local/Web/Order/settings). Không thêm quyền mới, không hardcode resolver. Full default reductions còn CHƯA apply do workflow/scope cần kiểm chứng.
- Design + Photography chuyển sang role-v2-design-staff qua RPC có preview, audit và guard equality. So sánh effective 26 người trước/sau: **không đổi quyền**; specialty IDs/history giữ nguyên.
- Xóa vật lý **2 Role gen1** không system, không refs, không active code dependency: role-standard-design-team và role-standard-mkt-team qua role_catalog_change. Audit chứa nguyên văn OLD; backup preflight.json.
- Còn **56 Role = 25 V2 + 31 gen1**. Bảo vệ Admin/Super Admin và Nhân sự mới/Đóng hàng. 17 legacy title links chưa tháo; hai ngoại lệ còn phụ thuộc. Các Role khác còn refs hoặc explicit RPC/history references, không xóa mù.

## Sơ đồ và thay đổi đồng thời
- 23 slots, tất cả Role V2. Latest **24 titled appointments hiệu lực, 22 bound**, 36 nguồn hiệu lực tổng; 12 membership không title giữ nguyên. 86 là lịch sử.
- Ngọc bị miễn nhiệm ở **14:50:39 UTC**, sự kiện org_events reason=Miễn nhiệm, actor 513712ca-d679-41aa-9c68-97c3bb6cd9df; trước lần áp quyền đầu 14:54. Lượt này KHÔNG kết thúc/gán bổ nhiệm. Baseline trước áp đã effective=[]; không được tuyên bố việc mất Content là do giảm Role.
- Ngọc hiện eligibility false, web.content_view/outline_start false và quyền excess false. Muốn làm Content tiếp cần Owner xác nhận bổ nhiệm Marketing đúng trách nhiệm; không tự khôi phục nguồn vừa bị miễn nhiệm.
- 2 previews riêng thành công, không apply: Đức mất 16 quyền Viewer legacy; Quỳnh Anh mất leave.export. Chi tiết exception-slot-previews.json. Không tự thêm slot/bỏ quyền hai người.

## Các bản cập nhật / rollback
- 0376: pending approver guard ở Role preview+apply; audited exact restore từ role_catalog_audit BEFORE, actor/expiry/fingerprint/exact AFTER guard. Không cho client cung cấp quyền snapshot tùy ý.
- 0377: sửa lỗi thực tế task edit bị org_projection_guard chặn vì trigger resign cố ghi canonical org_assignments. V2 read Role trực tiếp, bỏ re-sign V2; legacy giữ behavior. Failed task edits rollback atomically trước sửa, sau sửa cả 5 thành công.
- 0378: equal-rights Design/Photography rebind có audit. Không sửa Signals 0371.
- Snapshot compact không chứa events khổng lồ/secrets; dưới giới hạn repository, SHA256SUMS. rollback-writer.sql và rollback-signature-sync.sql; Role rollback dùng role_catalog_restore preview+apply exact audit, không raw UPDATE. Deletion backup trong audit/preflight; restore deleted IDs cần reviewed create vì legacy writer không chấp nhận arbitrary original ID — không tuyên bố đã có automatic delete undo.

## Kiểm thử và phạm vi nghiệm thu
- 140 regression tests/12 files trước lượt cuối; thêm test 0377 bảo đảm không chạm assignment signature. PGlite audited restore sensitive keys, stale/self/non-admin guards, equal-rights specialty, Marketing multi-source/eligibility, own/unit/DENY/additive, onboarding/cache, CRM/3K/Signals regression.
- Authenticated Preview: /organization, /biz/crm, /biz/3k, /signals không alert sau mỗi cửa sổ 10s. Các RPC áp thật đều preview/apply có audit; không fake employee sessions.
- Chưa employee live own/team/all E2E sau full defaults vì full cutover chưa apply, chưa có authorized scoped employee session. Build harness OK; không Publish.

## Cần quyết định cụ thể, không hỏi lại mục tiêu
1. Đức giữ quyền nào trong 16 quyền điều hành đang dùng?
2. Quỳnh Anh giữ leave.export hay dừng xuất?
3. Ngọc sau miễn nhiệm vừa xảy ra có tiếp tục bổ nhiệm Marketing/Content và trách nhiệm duyệt không? Không tự thay người duyệt hoặc cấp leave.approve.
- Full minimal defaults/CRM director còn thiếu verified policy/scoped workflow; dừng riêng phần đó, không cấp bừa hoặc xóa nguồn cũ khi thay thế chưa hoàn chỉnh.
