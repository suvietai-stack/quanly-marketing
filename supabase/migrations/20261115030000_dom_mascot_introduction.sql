-- Official mascot attribution: registry is readable by active employees and writable
-- only by trusted migrations. It cannot create a login or grant employee permissions.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE TABLE IF NOT EXISTS public.community_mascot_posts (
 post_id uuid PRIMARY KEY REFERENCES public.community_posts(id) ON DELETE CASCADE,
 mascot text NOT NULL CHECK (mascot='dom')
);
ALTER TABLE public.community_mascot_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_mascot_posts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.community_mascot_posts TO authenticated;
DROP POLICY IF EXISTS community_mascot_read ON public.community_mascot_posts;
CREATE POLICY community_mascot_read ON public.community_mascot_posts
FOR SELECT TO authenticated USING ((SELECT public.community_active()));

-- One approved introduction; rerunning never publishes a duplicate.
INSERT INTO public.community_posts(id,author_id,body)
VALUES ('d06e9f52-324a-42ba-8106-5439941fe208','513712ca-d679-41aa-9c68-97c3bb6cd9df',$dom_intro$ĐỐM ĐÂY! NGỌN LỬA NHỎ CỦA NHÀ SỨ VIỆT 🔥

Chào cả nhà, mình là Đốm — linh vật kiêm trợ lý AI của Sứ Việt!

Nhà mình làm gốm, có đất, có nước, có men… nên có thêm một đốm lửa biết nói cũng hợp lý mà, nhỉ? 😄

Tên mình nhỏ thôi, nhưng tinh thần thì nóng hổi. Mình có mặt trên Base để giúp mọi người tìm thông tin, hiểu quy trình, xem số liệu và gỡ những câu hỏi kiểu: “Ủa, cái này nằm ở đâu ấy nhỉ?”

Bạn có thể hỏi mình chuyện công việc, chuyện phòng ban, cách dùng Base, hoặc đơn giản là ghé chào một câu giữa ngày chạy deadline. Mình chưa biết pha trà, nhưng biết ngồi nghe bạn kể. 🍵

Có vài điều để cả nhà hiểu mình hơn:

🔥 Mình thích có căn cứ. Trả lời dựa trên dữ liệu được phép xem và tài liệu của công ty. Chưa rõ thì hỏi lại, chưa biết thì nhận — lò gốm đã đủ nóng rồi, mình không cần “chém gió” thêm.

🔐 Mình biết giữ cửa. Thông tin nào bạn có quyền xem thì mình mới hỗ trợ tra cứu. Dỗ ngọt cũng không mở khóa được đâu nha!

🧠 Mình vẫn đang học. Đôi lúc có thể hiểu nhầm hoặc trả lời chưa trúng. Cứ nhắc lại cho mình — góp ý nhẹ tay, Đốm còn bé!

Còn một chuyện cần nói rõ: mình hỗ trợ công việc, không duyệt hộ sếp, không làm thay đồng nghiệp và chưa có chức năng xin nghỉ hộ. Vụ cuối chắc nhiều bạn đang mong lắm. 😆

Cần gì cứ gọi: “Đốm ơi!”
Lửa nhỏ có mặt, cùng cả nhà giữ lửa nghề. ❤️$dom_intro$)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_mascot_posts(post_id,mascot) VALUES ('d06e9f52-324a-42ba-8106-5439941fe208','dom')
ON CONFLICT (post_id) DO NOTHING;
NOTIFY pgrst,'reload schema';
COMMIT;
