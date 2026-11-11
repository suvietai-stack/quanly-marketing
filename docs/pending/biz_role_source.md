# PENDING — Quản trị Kinh doanh nhận quyền từ Role V2 (chưa áp dụng)
Live 11/11/2026: `public.biz_can` cấp 17 key biz.* chỉ từ biz_appointments / biz_manager / biz_all_scope / ngoại lệ; `private.org_role_permission_ready` không chứa key biz.* nào. Tích biz.* trong Role V2 hiện không có tác dụng và editor policy từ chối.
Đề xuất cần duyệt, làm SAU khi lượt "một vị trí nhiều người" xong vì phạm vi team/phòng/khối phải lấy từ đơn vị của bổ nhiệm mới:
1. biz_can: ALLOW key nếu Role của nguồn bổ nhiệm hiệu lực có key VÀ phạm vi đơn vị của chính nguồn đó (nhóm/phòng/khối) chứa dữ liệu; giữ DENY, legacy_business_allowed, nhánh hiện có.
2. Thêm key vào org_role_permission_ready chỉ sau test PGlite từng key own/team/dept/khối, deny sai phạm vi, union nhiều nguồn.
3. Sau đó mới thêm biz.* vào preset sales-staff/team/head/director.

## Cập nhật 16:20 — sau mô hình vị trí (0379–0382 đã áp)
Nguồn đã sẵn: `private.position_role_sources(user)` trả (assignment, role, unit) và `private.position_can(user, key, target_unit)` kiểm phạm vi theo cây đơn vị của chính nguồn.
Còn thiếu trước khi nối vào biz_can (chưa áp):
- biz_can không nhận đơn vị đích; các RPC Kinh doanh tự tính phạm vi qua biz_scope_ok / biz_appointments (bảng biz_* riêng). Cần ánh xạ org_units ↔ biz_departments/biz_teams cho từng RPC trước, nếu không key view_dept/approve sẽ hoặc vô hiệu hoặc lộ phạm vi.
- Key cá nhân (view_own, goal/plan/report_submit) vẫn cần biz_participant (nghĩa vụ nộp theo phòng) — cấp từ Role mà không có phòng Kinh doanh thì không có dữ liệu để nộp.
Đề xuất thứ tự: (1) bảng ánh xạ đơn vị org↔biz có kiểm toán; (2) biz_can thêm nhánh Role chỉ cho key cá nhân khi đã là participant; (3) từng RPC quản lý nhận đơn vị đích + position_can; (4) test PGlite own/team/dept/khối + deny; (5) mở checkbox + preset 4 Role Sales.
