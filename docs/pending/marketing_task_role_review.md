# Rà soát Role nhiệm vụ Marketing — CHỜ SUPER ADMIN DUYỆT (chưa áp dụng)

Bản chụp chỉ đọc từ dữ liệu thật ngày 11/11/2026. Không có thay đổi nào đã ghi vào database.

## Bước 1 — Luật đọc quyền (docs/pending/0371_marketing_task_role_is_source.sql)
- Quyền nhiệm vụ = đúng các quyền Admin đã chọn trong Role ∩ quyền có cổng backend ∩ nguồn đang hiệu lực ∩ còn thuộc hệ Marketing. Không có danh sách module cứng.
- Nhiệm vụ Marketing luôn cần thuộc hệ Marketing, kể cả dòng cũ (eligibility_enforced=false). Thiết kế/Chụp ảnh giữ ràng buộc riêng, không xóa dòng nào.
- Đường bổ nhiệm (marketing_appointment) cũng phải thuộc hệ Marketing; cùng Role + quyền thì chỉ giữ một nguồn (bổ nhiệm), bỏ bản trùng.
- Sửa ma trận Role có hiệu lực ngay: đường chuyên môn đọc trực tiếp app_roles.permissions; đường bổ nhiệm có chữ ký md5 nên tự đóng khi Role đổi và quyền rơi về đường chuyên môn (không mất quyền).
- Giao diện của mọi người tự cập nhật: lần làm mới quyền kế tiếp (≤ 60–120 giây), người lưu được làm mới ngay.

**Lưu ý quan trọng:** sau Bước 1, mọi quyền có cổng backend trong Role sẽ có tác dụng — kể cả Social/Order trong Role Content Web. Vì vậy nên làm Bước 2 trước hoặc cùng lúc.

## Bước 2 — Quyền ngoài chuyên môn đang nằm trong Role (Admin chọn GIỮ hoặc BỎ)
Áp dụng qua màn "Role & Phân quyền" → xem trước → Super Admin xác nhận (role_catalog_change preview/apply, có lịch sử). Không tự sửa.

### Content Web (`role-content-web`)
- 90 quyền trong Role · 62 có cổng backend (có hiệu lực sau 0371) · 28 chưa có cổng (không tác dụng, hiển thị "Chưa an toàn").
- Quyền ngoài chuyên môn có hiệu lực (19) — Admin chọn GIỮ hoặc BỎ: social.view, social.view_mine, social.post_view, social.post_view_mine, social.post_create, social.post_edit, social.post_submit, social.post_start, social.post_resubmit, social.post_history, social.growth_view, social.growth_create, social.growth_edit, social.growth_open, order.view, order.view_mine, order.create, order.history, order.open_delivery

### Local SEO (`role-local-seo`)
- 46 quyền trong Role · 34 có cổng backend (có hiệu lực sau 0371) · 12 chưa có cổng (không tác dụng, hiển thị "Chưa an toàn").
- Quyền ngoài chuyên môn có hiệu lực (5) — Admin chọn GIỮ hoặc BỎ: order.view, order.view_mine, order.create, order.open_delivery, order.history

### SEO (`role-seo`)
- 95 quyền trong Role · 30 có cổng backend (có hiệu lực sau 0371) · 65 chưa có cổng (không tác dụng, hiển thị "Chưa an toàn").
- Quyền ngoài chuyên môn có hiệu lực (3) — Admin chọn GIỮ hoặc BỎ: order.view, order.create, order.history

### Social (`role-social`)
- 49 quyền trong Role · 35 có cổng backend (có hiệu lực sau 0371) · 14 chưa có cổng (không tác dụng, hiển thị "Chưa an toàn").
- Quyền ngoài chuyên môn có hiệu lực (5) — Admin chọn GIỮ hoặc BỎ: order.view, order.view_mine, order.create, order.history, order.open_delivery

### Nhân viên Thiết kế (`role-standard-design-staff`)
- 15 quyền trong Role · 15 có cổng backend (có hiệu lực sau 0371) · 0 chưa có cổng (không tác dụng, hiển thị "Chưa an toàn").
- Quyền ngoài chuyên môn có hiệu lực (0) — Admin chọn GIỮ hoặc BỎ: —

### Video (`role-video`)
- 82 quyền trong Role · 55 có cổng backend (có hiệu lực sau 0371) · 27 chưa có cổng (không tác dụng, hiển thị "Chưa an toàn").
- Quyền ngoài chuyên môn có hiệu lực (18) — Admin chọn GIỮ hoặc BỎ: order.view, order.view_mine, order.create, order.history, social.view, social.view_mine, social.post_view, social.post_create, social.post_edit, social.post_submit, social.post_resubmit, social.post_history, social.growth_view, social.growth_create, social.growth_edit, social.growth_open, local.view, web.view
Người bị ảnh hưởng ước tính (lượt trước): Lê Minh Ngọc, Mai Loan (Content Web), Trần Thị Bích Ngọc (Video); Thiết kế/Chụp ảnh chưa xác minh hệ Marketing.

## Quyết định cần Super Admin
1. Duyệt chạy 0371 (đổi luật đọc quyền, không đổi dữ liệu).
2. Với từng Role ở Bước 2: giữ hay bỏ các quyền ngoài chuyên môn.
3. Thứ tự đề xuất: Bước 2 (sửa Role) → Bước 1 (luật) → kiểm tra lại Ngọc có web.view / web.content_view / web.outline_start.
