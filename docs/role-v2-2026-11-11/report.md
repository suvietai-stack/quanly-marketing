# Role v2 — Bộ Role chuẩn mặc định (11/11/2026)

## Đã làm trên LIVE (không Publish giao diện)
- **Migration 0373**: cột `app_roles.catalog_generation` (1=legacy, 2=chuẩn mới). 0372 là placeholder rỗng do gửi nhầm, vô hại.
- **Migration 0374**: writer `role_catalog_change` hỗ trợ tạo Role chuẩn `role-v2-*` có đối chiếu Role nguồn; nguồn nhiệm vụ Marketing (`org_assignment_specialty_rules`, `mkt_specialty_rules`) đọc Role v2 theo điều kiện Marketing; thu hồi quyền chạy 2 hàm seed Role cũ. Rollback: `docs/rollback/2026-11-11-role-v2.sql` (MD5 định nghĩa cũ đã đối chiếu).
- **Migration 0375**: sửa lỗi thật — `org_effect_signature` nhúng cả `created_at` của ô vị trí khiến MỌI tạo ô qua org_change không bao giờ áp dụng được ("Tác động đã thay đổi"). Chữ ký giờ chỉ gồm trường ổn định.
- **25 Role chuẩn mới** (`role-v2-*`, generation 2) tạo qua RPC preview/apply có kiểm toán: 20 vị trí + 5 nhiệm vụ Marketing. Mọi quyền đều lấy từ Role nguồn đã kiểm chứng backend. 7 Role được tối giản thêm ngay (bỏ export rộng, phê duyệt ngoại module, signal.view_all khỏi Trưởng phòng/nhóm KD). Danh sách đầy đủ: `docs/role-v2-2026-11-11-proposals.json`.
- **5 nhiệm vụ Marketing** (Content Web, SEO, Local SEO, Social, Video) gắn sang Role v2 kèm nhật ký kiểm toán; Thiết kế/Chụp ảnh giữ nguyên.
- **23 ô vị trí** tạo và gắn 23/25 bổ nhiệm đang hiệu lực qua org_change có xem trước tác động; không ai mất quyền trong 23 lượt gắn.
- **Ngọc (P0)**: `web.content_view`, `web.outline_start` hiệu lực THẬT qua nguồn marketing_appointment → Content Web v2 (xác minh bằng account_permission_explain live).

## Ngoại lệ chờ chủ dự án quyết (không tự đoán)
1. **Vũ Văn Đức — Giám Đốc Điều hành**: 16 quyền rộng đang dùng (finance.incoming.*, order.view_all, signal.view_all, leave.view_all/approve, oq.report_all...) đến từ liên kết legacy "Viewer / Ban Giám Đốc". Gắn ô sẽ mất 16 quyền này; editor policy không cho bật chúng vào Role vị trí. Cần chủ chọn: giữ quyền nào cho GĐ ĐH.
2. **Nguyễn Quỳnh Anh — HCNS**: đang có `leave.export` (editor policy từ chối cấp mặc định). Chưa gắn ô.
3. **Lê Minh Ngọc**: trước đây có `leave.approve`, `leave.view_assigned`, `leave.report` đi kèm Role Content Web cũ (90 quyền); Role v2 tối giản không còn. Cô ấy đang là người duyệt của 2 đơn nghỉ phép chờ xử lý. Quyền riêng additive cũng từ chối leave.approve (chưa kiểm chứng phạm vi cá nhân). Cần chủ quyết: cấp lại quyền duyệt đơn cho Ngọc hay chuyển người duyệt.

## Chưa làm (đúng rào an toàn)
- 33 Role cũ (gồm 2 system được bảo vệ) CHƯA xóa: còn 17 liên kết legacy, 2 ngoại lệ chưa gắn ô, và quyết định ngoại lệ của chủ. Xóa chỉ qua role_catalog_change audited khi 0 phụ tham chiếu.
- Chưa Publish giao diện; chưa đụng SQL Tín hiệu 0371; không seed/UPDATE quyền hàng loạt ngoài các RPC có kiểm toán.

## Kiểm thử
- 10 test PGlite mới (roleV2.database.test.ts): tạo Role chuẩn, từ chối quyền ngoài nguồn, nhiệm vụ Marketing chỉ trong khối Marketing, thu hồi khi hết bổ nhiệm, rollback khôi phục đúng định nghĩa cũ.
- 24/24 test Role/mapping/slot đạt sau cập nhật fixture sang role-v2-*.
- Frontend đồng bộ ID mới: defaultRolePresets.ts, canonicalMapping.ts, MarketingSpecialties.tsx, TitleRoleDefaults.tsx.

## Số liệu live cuối lượt
58 Role (33 cũ + 25 mới) · 23 ô vị trí · 23/25 bổ nhiệm gắn ô · 5/5 nhiệm vụ Marketing sang Role v2 · 0 Role cũ bị xóa.
