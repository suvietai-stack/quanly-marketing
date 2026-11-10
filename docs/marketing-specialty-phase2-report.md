# Giai đoạn 2 — Nhiệm vụ Marketing, Role tự động, giao việc theo chuyên môn

Ngày: 2026-11-10. Trạng thái: đã triển khai trên Preview, CHƯA Publish, chưa reset quyền cũ.

## Màn hình giao việc đã kết nối chuyên môn
- `ContentForm.tsx` — Người viết: chuyên môn Content Web (bài thường) hoặc SEO (bài tối ưu lại).
- `VideoDetail.tsx` — Người phụ trách: chuyên môn Video.
- `SocialPostDetail.tsx` — Người viết: Social; Thiết kế/Video: Thiết kế.
- `DesignOrderForm.tsx` — Người phụ trách thiết kế: Thiết kế.
- Component dùng chung: `src/components/SpecialtyStaffPicker.tsx` — nhóm "Chuyên môn phù hợp" (kèm đơn vị/chức vụ) lên đầu, "Nhân sự khác" bên dưới, không tự chọn, hiển thị "Chưa có nhân sự phù hợp" khi rỗng.

## Màn hình chưa tích hợp và lý do
- `OptimizeContentForm.tsx`: không có trường chọn người — việc phân công diễn ra ở ContentForm của bài tối ưu (đã tích hợp, dùng chuyên môn SEO).
- Người duyệt/người đăng trong mọi form: giữ nguyên danh sách đầy đủ — chuyên môn xác định người thực hiện, không mặc nhiên cấp quyền duyệt.

## Role chuyên môn đã liên kết (từ giai đoạn 1, bảng mkt_specialties)
Content Web→role-content-web, SEO→role-seo, Local SEO→role-local-seo, Social→role-social, Video→role-video, Thiết kế/Chụp ảnh→role-designer.

## Permission được tự cấp (migration 0323, `private.mkt_specialty_permission_ready`)
Chỉ quyền cá nhân đã kiểm chứng: overview.view/alerts/own_only; task.* cá nhân (view, view_mine, view_created_by_me, create, accept, start, update_result, update_status, submit/resubmit_completion, view_history, add_note); brand.view; web.* cá nhân (xem, keyword, content_view(_mine), outline_start/submit/resubmit, post_write_start/submit/resubmit, draft url/layout/review cá nhân, index_view, open_published_url); social.* cá nhân (view(_mine), post_view(_mine), create/edit/submit/start/resubmit, history, growth_view/create/edit/open); video.* cá nhân (view(_mine), create, script_start/submit/resubmit, submit, resubmit, deliver, history, edit_cut, move_editing/shooting, footage, create_design_order); local.* cá nhân (view(_mine), create/edit, post_create/edit, photo, products, review(_reply/_status), growth_view/create/edit); order.take, order.create; leave/att/kpi cá nhân; settings.view.

Căn cứ kiểm chứng: RLS các bảng này đã cho phép mọi nhân sự đang hoạt động đọc/ghi — quyền chỉ mở lối vào giao diện/quy trình; không quyền nào nằm trong nhóm duyệt của approval_center_read; biz.*/k3.* giữ rào riêng.

## Quyền chưa kích hoạt (hiển thị "chưa kích hoạt" trong UI)
Mọi quyền approve/assign/delete/force_status/*_all/report/manage/publish/complete/cancel/restore/confirm_published, order.edit, task.edit, web.publish, quyền quản lý theo đơn vị và toàn hệ thống — chờ kiểm chứng phạm vi (giai đoạn 3).

## Cơ chế cấp/thu hồi
- Tích nhiệm vụ → `mkt_specialty_save` ghi active → `private.mkt_specialty_rules` sinh ALLOW (permission ∩ Role ∩ danh sách đã kiểm chứng) vào `base_rules` → `has_permission` trả true.
- Bỏ tích → state=removed → nguồn ALLOW biến mất; quyền từ nguồn khác (Role trực tiếp, bổ nhiệm chức vụ) không bị ảnh hưởng.
- DENY từ bất kỳ nguồn nào vẫn thắng ALLOW chuyên môn (base_decision ưu tiên DENY).
- Đồng bộ lại (`mkt_specialty_sync`) chỉ bổ sung, không ghi đè chỉnh sửa thủ công.

## Kiểm soát phạm vi quản lý
- Đọc: chính mình / Super Admin / settings.user_view|role|permission (0316).
- Sửa: chỉ Super Admin (0315) — chưa mở cho Trưởng phòng vì chưa có bộ phân giải phạm vi đơn vị đã kiểm chứng an toàn chu kỳ; backend chặn mọi lời gọi RPC không phải Super Admin.
- `mkt_specialty_candidates` trả kèm đơn vị/chức vụ hiện tại (org_assignments), tôn trọng cùng ranh giới đọc.

## File và migration
- Migration: `0323_marketing_specialty_verified_permissions.sql`.
- Mới: `src/components/SpecialtyStaffPicker.tsx`, `src/lib/marketingSpecialtyPermissions.database.test.ts`, báo cáo này.
- Sửa: `src/lib/marketingSpecialties.ts` (orderBySpecialty, types), `src/lib/marketingSpecialties.test.ts`, `src/components/MarketingSpecialties.tsx` (mục "Quyền tự nhận theo nhiệm vụ"), `ContentForm.tsx`, `VideoDetail.tsx`, `SocialPostDetail.tsx`, `DesignOrderForm.tsx`.

## Kiểm thử
- 11/11 test DB mới (PGlite, schema thật 0315/0316/0323): gán đa nhiệm vụ, một nhiệm vụ nhiều người, thêm không xóa, bỏ Video giữ SEO/Social, không thu hồi nguồn hợp lệ khác, quyền chưa kiểm chứng không kích hoạt, DENY thắng ALLOW, non-Super-Admin bị chặn, candidates đúng chuyên môn + kiêm nhiệm + đơn vị/chức vụ, sync không ghi đè thủ công, preview granted/blocked.
- Hồi quy: 140/140 (marketingSpecialties, basePermissions, orgStructure, orgChart).
- Typecheck sạch, build OK.
- Preview (Super Admin): picker Video hiển thị nhóm "Chuyên môn phù hợp" đúng người; tab Chuyên môn nhân sự hiển thị "tự cấp 52 chức năng đã kiểm chứng; 30 quyền chưa kích hoạt".

## Cần hoàn thiện trước khi reset quyền cũ (giai đoạn 3)
1. Kiểm chứng phạm vi quản lý theo đơn vị (Tasks/Video/Content/Social còn RLS đọc rộng) để mở các quyền *_all/approve/assign.
2. Bộ phân giải phạm vi đơn vị an toàn chu kỳ để mở sửa chuyên môn cho người quản lý được cấp quyền.
3. Role riêng cho Nhân viên Đóng hàng.
4. Giao việc mới vẫn lưu tên hiển thị (tương thích dữ liệu cũ); chuyển sang định danh tài khoản ổn định cần một đợt di trú riêng có kiểm chứng.
