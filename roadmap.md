# Roadmap — Role/personal permissions 510/510
- [x] Tranche 1 staged (not applied): one grant policy + personal Inherit/ALLOW/DENY, 195/510 enforced — docs/role-permission-deny-2026-11-12 (SHA 94f95b4b…). Waiting owner approval.
- [ ] Tranche 2+: route the remaining 315 keys' server gates through the shared resolver, module by module, each with its own staged SQL + actor tests:
  Dự Án Web 92, Thiết Kế 46, Social 20, Tài Chính 18, Quản trị Kinh doanh 17 (biz_can), Cài Đặt 15, Task 15, Tài khoản 14, Video 13, Thương Hiệu 11, KPI 10, Báo Cáo 8, Local 7, Cơ cấu tổ chức 6, Sale Work 5, Tổng Quan 4, 3K 3, Sao 3, Tích hợp 2, Hỏi giá 1, Theo dõi đơn 1.
- [ ] Owner decision: system-only rights (super_admin, settings.role, settings.user_custom_perm, org permission admin) — allow in Roles or keep Super Admin only.
