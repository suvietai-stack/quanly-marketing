-- A reusable publication channel for the official mascot.
-- author_id keeps the authenticated operator internally; the protected registry
-- identifies Đốm as the public-facing publisher. No employee/login is created.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE OR REPLACE FUNCTION public.community_dom_publish(p_body text,p_request_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
DECLARE inserted_count integer;
BEGIN
 IF NOT public.community_moderator() THEN
  RAISE EXCEPTION 'Chỉ quản trị viên được đăng bài bằng tên Đốm.' USING ERRCODE='42501';
 END IF;
 IF p_body IS NULL OR char_length(btrim(p_body)) NOT BETWEEN 1 AND 5000 OR p_request_id IS NULL THEN
  RAISE EXCEPTION 'Nội dung bài đăng phải có từ 1 đến 5.000 ký tự.' USING ERRCODE='22023';
 END IF;
 INSERT INTO public.community_posts(id,author_id,body)
 VALUES(p_request_id,auth.uid(),btrim(p_body)) ON CONFLICT(id) DO NOTHING;
 GET DIAGNOSTICS inserted_count=ROW_COUNT;
 IF inserted_count=0 THEN
  IF NOT EXISTS(SELECT 1 FROM public.community_posts p JOIN public.community_mascot_posts m ON m.post_id=p.id
   WHERE p.id=p_request_id AND p.author_id=auth.uid() AND p.body=btrim(p_body) AND m.mascot='dom') THEN
   RAISE EXCEPTION 'Mã đăng bài đã được sử dụng. Hãy tạo bài mới.' USING ERRCODE='22023';
  END IF;
  RETURN p_request_id;
 END IF;
 INSERT INTO public.community_mascot_posts(post_id,mascot) VALUES(p_request_id,'dom');
 RETURN p_request_id;
END $function$;
REVOKE ALL ON FUNCTION public.community_dom_publish(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.community_dom_publish(text,uuid) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
