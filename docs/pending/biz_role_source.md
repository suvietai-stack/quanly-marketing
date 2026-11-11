# PENDING — Quản trị Kinh doanh nhận quyền từ Role V2 (chưa áp dụng)
Live 11/11/2026: `public.biz_can` cấp 17 key biz.* chỉ từ biz_appointments / biz_manager / biz_all_scope / ngoại lệ; `private.org_role_permission_ready` không chứa key biz.* nào. Tích biz.* trong Role V2 hiện không có tác dụng và editor policy từ chối.
Đề xuất cần duyệt, làm SAU khi lượt "một vị trí nhiều người" xong vì phạm vi team/phòng/khối phải lấy từ đơn vị của bổ nhiệm mới:
1. biz_can: ALLOW key nếu Role của nguồn bổ nhiệm hiệu lực có key VÀ phạm vi đơn vị của chính nguồn đó (nhóm/phòng/khối) chứa dữ liệu; giữ DENY, legacy_business_allowed, nhánh hiện có.
2. Thêm key vào org_role_permission_ready chỉ sau test PGlite từng key own/team/dept/khối, deny sai phạm vi, union nhiều nguồn.
3. Sau đó mới thêm biz.* vào preset sales-staff/team/head/director.
