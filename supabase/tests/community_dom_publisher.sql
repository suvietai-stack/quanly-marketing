-- Production-shaped tests; all posts and schema changes roll back.
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
SELECT set_config('request.jwt.claim.sub','513712ca-d679-41aa-9c68-97c3bb6cd9df',true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE request_id uuid:='69b5a7ae-534b-4c54-b17e-0c2e41659783'; result uuid; n integer;
BEGIN
 result:=public.community_dom_publish('Bài kiểm tra Đốm, sẽ rollback',request_id);
 IF result<>request_id THEN RAISE EXCEPTION 'Wrong post id'; END IF;
 PERFORM public.community_dom_publish('Bài kiểm tra Đốm, sẽ rollback',request_id);
 SELECT count(*) INTO n FROM public.community_posts WHERE id=request_id;
 IF n<>1 OR NOT EXISTS(SELECT 1 FROM public.community_mascot_posts WHERE post_id=request_id AND mascot='dom') THEN RAISE EXCEPTION 'Not idempotent or missing mascot attribution'; END IF;
 BEGIN
  PERFORM public.community_dom_publish('Nội dung khác',request_id);
  RAISE EXCEPTION 'Conflicting retry unexpectedly accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
  PERFORM public.community_dom_publish(' ',gen_random_uuid());
  RAISE EXCEPTION 'Empty post accepted' USING ERRCODE='XX000';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 PERFORM set_config('request.jwt.claim.sub','dc42e189-e2de-4a60-a00a-d5277819ea13',true);
 BEGIN
  PERFORM public.community_dom_publish('Không được giả Đốm',gen_random_uuid());
  RAISE EXCEPTION 'Employee published as mascot' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.community_mascot_posts(post_id,mascot) VALUES(request_id,'dom');
  RAISE EXCEPTION 'Employee forged registry' USING ERRCODE='XX000';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $test$;
DO $test$
DECLARE n integer; own_id uuid:=gen_random_uuid();
BEGIN
 INSERT INTO public.community_posts(body) VALUES('Ordinary employee post') RETURNING id INTO own_id;
 UPDATE public.community_posts SET body='Ordinary edit' WHERE id=own_id;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>1 THEN RAISE EXCEPTION 'Normal post edit regressed'; END IF;
 DELETE FROM public.community_posts WHERE id=own_id;
END $test$;
RESET ROLE;
SELECT 'publisher authorization, replay and normal employee flow passed' result;
ROLLBACK;
