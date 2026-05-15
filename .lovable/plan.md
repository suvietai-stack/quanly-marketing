## Phạm vi cập nhật module Kênh Social

### 1. Data model (src/lib/store.ts)
- Mở rộng `SocialStatus`: `Kế hoạch | Đang làm | Chờ duyệt | Cần sửa | Đã duyệt | Chờ đăng | Đã đăng | Hoàn thành | Đã hủy`. Map các giá trị cũ (`Ý tưởng`→`Kế hoạch`, `Đã lên lịch`→`Chờ đăng`) khi load.
- Mở rộng `SocialChannel.platform` thêm `LinkedIn`; thêm trạng thái `Lưu trữ`.
- Thêm vào `SocialPost`: `revisions?: number`, `reviewNotes?: string`, `history?: SocialPostHistoryEntry[]` (at, byId, byName, action, fromStatus, toStatus, note, forced).
- Thêm bảng `SocialGrowth` (kỳ, loại kỳ, ngày, follower đầu/cuối, bài đăng, view, tương tác, like/comment/share, inbox, link, người cập nhật, ghi chú) — lưu trên Lovable Cloud (bảng `growth` đã có; tái dùng bằng prefix khóa hoặc thêm bảng mới `social_growth`).

### 2. Permission keys (src/lib/auth.ts)
Thêm nhóm `social.*`:
`social.view, social.channel.create/edit/delete, social.post.create/edit/delete, social.start, social.submit, social.resubmit, social.approve, social.request_changes, social.move_pending_publish, social.confirm_published, social.complete, social.cancel, social.restore, social.force_status, social.growth.update`. Admin/Super Admin tự động full quyền (đã có).

### 3. Màn chính `/social` (src/routes/social.tsx)
- Bỏ tabs hiện tại. Hiển thị danh sách card kênh social.
- Card hiển thị: tên, nền tảng, thương hiệu, link, người PT, tần suất, trạng thái, đếm bài theo nhóm (đang sản xuất / chờ duyệt / chờ đăng / đã đăng).
- Mỗi card có nút **Mở kênh**, **Thêm bài**, **Chỉnh sửa kênh**.
- Nút chung **+ Thêm kênh**. Bộ lọc: tìm, thương hiệu, nền tảng, trạng thái, người PT.
- Empty state đẹp.

### 4. Workspace `/social/$id` (src/routes/social.$id.tsx)
Header gồm thông tin kênh + nút quay lại. 3 tab:
1. **Thông tin dự án**: card thông tin, mục tiêu, ghi chú; cards tổng quan (tổng bài, đang sản xuất, chờ duyệt, cần sửa, chờ đăng, đã đăng, hoàn thành).
2. **Sản xuất nội dung**: chỉ bài của kênh hiện tại, 3 view: **Table / Kanban / Lịch đăng**. Bộ lọc trạng thái, người viết, người duyệt, loại nội dung, ngày, chủ đề, plan. Click bài mở dialog chi tiết.
3. **Theo dõi tăng trưởng**: nút thêm kỳ báo cáo, bảng danh sách kỳ, card so sánh kỳ mới nhất với kỳ trước (badge tăng/giảm/không đổi).

### 5. Dialog chi tiết bài social (component mới `SocialPostDetail`)
- Form đầy đủ trường (caption, media, link bài đã đăng, người viết/duyệt/đăng, ngày dự kiến/thực, plan, topic…).
- Khu vực workflow: hiển thị nút theo trạng thái hiện tại + permission:
  - Kế hoạch → `Bắt đầu làm` (social.start), `Hủy bài` (social.cancel).
  - Đang làm → `Gửi duyệt` (social.submit), `Hủy bài`.
  - Chờ duyệt → `Duyệt bài` (social.approve), `Yêu cầu sửa` (social.request_changes) + ô ghi chú.
  - Cần sửa → `Gửi duyệt lại` (social.resubmit) — tăng `revisions`.
  - Đã duyệt → `Chuyển sang chờ đăng` (social.move_pending_publish).
  - Chờ đăng → `Xác nhận đã đăng` (social.confirm_published) — yêu cầu link/ngày.
  - Đã đăng → `Hoàn thành` (social.complete).
  - Đã hủy → `Khôi phục` (social.restore).
- Khu vực ép trạng thái cho người có `social.force_status` (chọn trạng thái + lý do bắt buộc).
- Tab **Lịch sử xử lý**: list các bước chuyển trạng thái.

### 6. Liên kết thương hiệu
Trang `brands.$id` (tab “Kênh liên kết → Social”) đã đọc từ `s.socials` theo `brandId` — không cần đổi schema, đảm bảo kênh tạo mới hiển thị đúng.

### 7. Migration / dữ liệu
- Không seed thêm dữ liệu demo.
- Trong store, normalize trạng thái cũ khi đọc từ Cloud về để không vỡ giao diện.

### 8. Files dự kiến
- edit `src/lib/store.ts` (types, normalize, growth helpers).
- edit `src/lib/auth.ts` (PERMISSION list + nhóm Social).
- new `src/components/SocialPostDetail.tsx`.
- rewrite `src/routes/social.tsx` (chỉ còn list card).
- rewrite `src/routes/social.$id.tsx` (workspace 3 tab).
- (tuỳ) edit `src/routes/settings.tsx` để hiển thị nhóm permission Social trong ma trận.

### Ngoài phạm vi
- Không tạo bảng DB mới phía Supabase (tái dùng `socials`, `social_posts`, `growth` JSONB).
- Không đụng các module khác (Web/Local/Video/Order/Task).
- Không thêm view “Tất cả bài đăng” toàn cục — bỏ luôn theo yêu cầu.

Xác nhận để mình triển khai theo plan này nhé?
