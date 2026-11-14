-- Sứ Việt Community: authenticated employees only, never a public social feed.
-- No grant to anon. All rows, comments, reactions AND media require active employment.
-- Private Storage downloads require a live JWT/RLS check (no public or bearer signed URL).
CREATE OR REPLACE FUNCTION public.community_active()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS (
   SELECT 1 FROM public.profiles p
   WHERE p.id = auth.uid() AND p.status::text = 'Đang hoạt động'
 );
$$;

CREATE OR REPLACE FUNCTION public.community_moderator()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT public.community_active() AND private.is_super_admin(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.community_active() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.community_moderator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.community_active(), public.community_moderator() TO authenticated;

CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 5000),
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_posts_feed_idx ON public.community_posts (is_pinned DESC, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS community_posts_author_idx ON public.community_posts (author_id, created_at DESC);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_posts FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.community_posts TO authenticated;
GRANT INSERT (body) ON public.community_posts TO authenticated;
GRANT UPDATE (body) ON public.community_posts TO authenticated;
CREATE POLICY community_posts_read ON public.community_posts FOR SELECT TO authenticated
 USING ((SELECT public.community_active()));
CREATE POLICY community_posts_write ON public.community_posts FOR INSERT TO authenticated
 WITH CHECK ((SELECT public.community_active()) AND author_id = (SELECT auth.uid()) AND NOT is_pinned);
CREATE POLICY community_posts_edit ON public.community_posts FOR UPDATE TO authenticated
 USING ((SELECT public.community_active()) AND author_id = (SELECT auth.uid()))
 WITH CHECK ((SELECT public.community_active()) AND author_id = (SELECT auth.uid()));
CREATE POLICY community_posts_delete ON public.community_posts FOR DELETE TO authenticated
 USING ((SELECT public.community_active()) AND (author_id = (SELECT auth.uid()) OR (SELECT public.community_moderator())));

CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_comments_post_idx ON public.community_comments(post_id,created_at,id);
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_comments FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.community_comments TO authenticated;
GRANT INSERT (post_id,body) ON public.community_comments TO authenticated;
GRANT UPDATE (body) ON public.community_comments TO authenticated;
CREATE POLICY community_comments_read ON public.community_comments FOR SELECT TO authenticated
 USING ((SELECT public.community_active()));
CREATE POLICY community_comments_insert ON public.community_comments FOR INSERT TO authenticated
 WITH CHECK ((SELECT public.community_active()) AND author_id=(SELECT auth.uid()));
CREATE POLICY community_comments_edit ON public.community_comments FOR UPDATE TO authenticated
 USING ((SELECT public.community_active()) AND author_id=(SELECT auth.uid()))
 WITH CHECK ((SELECT public.community_active()) AND author_id=(SELECT auth.uid()));
CREATE POLICY community_comments_delete ON public.community_comments FOR DELETE TO authenticated
 USING ((SELECT public.community_active()) AND (author_id=(SELECT auth.uid()) OR (SELECT public.community_moderator())));

CREATE TABLE IF NOT EXISTS public.community_likes (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id,user_id)
);
CREATE INDEX IF NOT EXISTS community_likes_user_idx ON public.community_likes(user_id);
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_likes FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.community_likes TO authenticated;
GRANT INSERT (post_id) ON public.community_likes TO authenticated;
CREATE POLICY community_likes_read ON public.community_likes FOR SELECT TO authenticated
 USING ((SELECT public.community_active()));
CREATE POLICY community_likes_add ON public.community_likes FOR INSERT TO authenticated
 WITH CHECK ((SELECT public.community_active()) AND user_id=(SELECT auth.uid()));
CREATE POLICY community_likes_remove ON public.community_likes FOR DELETE TO authenticated
 USING ((SELECT public.community_active()) AND user_id=(SELECT auth.uid()));

CREATE TABLE IF NOT EXISTS public.community_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  path text NOT NULL UNIQUE CHECK (char_length(path) BETWEEN 40 AND 260),
  kind text NOT NULL CHECK (kind IN ('image','video')),
  position smallint NOT NULL DEFAULT 0 CHECK (position BETWEEN 0 AND 4),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_media_post_idx ON public.community_media(post_id,position);
ALTER TABLE public.community_media ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_media FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.community_media TO authenticated;
GRANT INSERT (post_id,path,kind,position) ON public.community_media TO authenticated;
CREATE POLICY community_media_read ON public.community_media FOR SELECT TO authenticated
 USING ((SELECT public.community_active()));
CREATE POLICY community_media_insert ON public.community_media FOR INSERT TO authenticated
 WITH CHECK (
  (SELECT public.community_active())
  AND split_part(path,'/',1) = (SELECT auth.uid())::text
  AND split_part(path,'/',2) = post_id::text
  AND EXISTS(SELECT 1 FROM public.community_posts p WHERE p.id=post_id AND p.author_id=(SELECT auth.uid()))
 );
CREATE POLICY community_media_delete ON public.community_media FOR DELETE TO authenticated
 USING ((SELECT public.community_active()) AND (
   (SELECT public.community_moderator())
   OR EXISTS(SELECT 1 FROM public.community_posts p WHERE p.id=post_id AND p.author_id=(SELECT auth.uid()))
 ));

-- Only company Super Admin can pin/unpin. Authors can edit body, never pin flags.
CREATE OR REPLACE FUNCTION public.community_set_pin(p_post_id uuid,p_pinned boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
 IF NOT public.community_moderator() THEN RAISE EXCEPTION 'Không có quyền ghim bài.'; END IF;
 UPDATE public.community_posts SET is_pinned=p_pinned WHERE id=p_post_id;
 RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.community_set_pin(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.community_set_pin(uuid,boolean) TO authenticated;

-- No externally readable CDN URL: all media use authenticated storage.download().
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('suviet-community','suviet-community',false,26214400,ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=26214400,
 allowed_mime_types=EXCLUDED.allowed_mime_types;

CREATE POLICY suviet_community_storage_read ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id='suviet-community' AND (SELECT public.community_active()));
CREATE POLICY suviet_community_storage_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (
  bucket_id='suviet-community' AND (SELECT public.community_active())
  AND (storage.foldername(name))[1]=(SELECT auth.uid())::text
  AND EXISTS (SELECT 1 FROM public.community_posts p
    WHERE p.id::text=(storage.foldername(name))[2] AND p.author_id=(SELECT auth.uid()))
 );
CREATE POLICY suviet_community_storage_delete ON storage.objects FOR DELETE TO authenticated
 USING (
  bucket_id='suviet-community' AND (SELECT public.community_active())
  AND ((storage.foldername(name))[1]=(SELECT auth.uid())::text OR (SELECT public.community_moderator()))
);
