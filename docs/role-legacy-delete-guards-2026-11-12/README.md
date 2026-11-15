# Bắt buộc kiểm tra DELETE tại backend cho 9 bảng nghiệp vụ legacy

**STAGED, NOT APPLIED.** Các bảng JSONB hiện đang có RLS kiểu `private.is_active(auth.uid())`, vì vậy **đánh dấu DENY trong Role không tự chặn được DELETE** qua PostgREST. Tạo thêm chính sách RLS chỉ với quyền DENY sẽ không an toàn, vì các policy cũ được OR với nhau.

Gói này thêm **BEFORE DELETE trigger** tại database. Trigger gọi `private.has_permission(actor,key)` của gói 510; nếu quyền thiếu, DENY, tài khoản ngừng hoạt động, hoặc actor NULL thì từ chối `42501` trước khi xóa bản ghi. Chỉ service_role JWT đã ký mới có nhánh bảo trì.

| Bảng | Quyền DELETE cần có |
|---|---|
| `brands` | `brand.delete` |
| `map_posts` | `local.post_delete` |
| `social_posts` | `social.post_delete` |
| `socials` | `social.delete` |
| `tasks` | `task.delete` |
| `videos` | `video.delete` |
| `web_contents` | `web.content_delete` |
| `web_topics` | `web.keyword_topic_delete` |
| `websites` | `web.delete` |

### Những gì gói này đạt được

- Role hoặc ALLOW riêng cấp quyền xóa đúng mã permission → qua gate.
- DENY riêng ghi đè Role → không xóa được, kể cả gọi API trực tiếp.
- Một active employee không có permission xóa → không xóa được.
- Không thay đổi dữ liệu, không đụng user profile hoặc Role, không sửa RLS SELECT/INSERT/UPDATE, rollback có thể gỡ 9 triggers theo đúng danh sách.

### Vẫn chưa được coi là "đã an toàn đủ 510 quyền"

- **Đọc dữ liệu, INSERT và UPDATE của 9 bảng vẫn đang cho phép mọi nhân viên active ở backend.** Giữ tình trạng này là lỗ hổng và chưa đáp ứng mục tiêu DENY cho toàn hệ thống. Cần thay các policy theo quyền hiệu lực và giới hạn tài nguyên.
- Với các trường `assignee`, `writer`, `owner` dạng tên/JSON không có UUID chuẩn, phải xác định identity và phạm vi dữ liệu từ server trước khi viết policy theo `own/assigned/unit`. Không được coi một chuỗi tên do client gửi là chứng minh quyền.
- Các RPC và các bảng khác phải có ma trận kiểm thử riêng, không chỉ 9 bảng này.

### Điều kiện triển khai

1. Xin chủ dự án duyệt **đúng file SQL + SHA**, snapshot database trước áp.
2. Chạy preflight trên production; kiểm tra 510 migration đã triển khai.
3. Chạy PGlite `src/lib/basePermissions/legacyDeleteGuards.database.test.ts` và thử âm tính PostgREST với tài khoản test.
4. Áp `candidate.sql` trong cửa sổ deploy có kiểm soát, đo lỗi/truy cập; nếu cần revert, `rollback.sql` có phê duyệt riêng.

Đây là bước xử lý ghi/xóa, **không phải tuyên bố hoàn tất phân quyền của mọi module**.
