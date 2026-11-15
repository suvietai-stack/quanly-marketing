# Role 515 — chặn DELETE thật tại database

**Staged, chưa chạy production.** RLS trên 9 bảng JSONB đang có policy permissive cho mọi nhân viên hoạt động. Chỉ ẩn nút Xóa hoặc chỉnh Role không ngăn được gọi PostgREST DELETE trực tiếp.

Candidate bổ sung `AS RESTRICTIVE FOR DELETE TO authenticated` trên từng bảng. Với policy permissive hiện hữu, kết quả DELETE phải đồng thời qua `private.has_permission(auth.uid(), key)`. `has_permission` đã được nâng lên policy 515; personal DENY của nhân viên thường thắng Role ALLOW. Super Admin vẫn có bypass hệ thống. Service-role maintenance có cơ chế bypass RLS chuẩn PostgreSQL (không tạo ngoại lệ auth.uid bằng trigger).

| Bảng | Quyền DELETE |
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

### Giới hạn quan trọng
**Gói này mới chặn DELETE.** Các đường SELECT, INSERT và UPDATE trong 9 bảng vẫn có RLS permissive và phải được tách thành quyền/field/ownership/assignment cụ thể. Không thể bảo đảm toàn bộ 515 DENY có hiệu lực API chỉ bằng gói này.

Cần duyệt chính xác SQL, sao lưu, kiểm thử tài khoản nhân viên thật (có grant, thiếu grant, DENY, bị vô hiệu, Super Admin), hành vi nghiệp vụ/trigger và rollback trước khi áp. CI chạy fixture PGlite độc lập, không truy cập production.
