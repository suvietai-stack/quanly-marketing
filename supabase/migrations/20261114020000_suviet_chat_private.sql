-- Sứ Việt Chat V1. Only active Base employees may read/write, and ONLY
-- members of the specific thread may read its messages or attachments.
-- This chat is unrelated to the public marketing/social publishing features.
-- DDL only; no changes to existing business data, profiles or role grants.

CREATE TABLE IF NOT EXISTS public.sv_chat_threads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 kind text NOT NULL CHECK (kind IN ('direct','group')),
 title text CHECK (title IS NULL OR char_length(btrim(title)) BETWEEN 2 AND 80),
 direct_key text UNIQUE,
 created_by uuid NOT NULL REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 last_message_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((kind='direct' AND direct_key IS NOT NULL AND title IS NULL) OR
        (kind='group' AND direct_key IS NULL AND title IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS sv_chat_threads_recent_idx ON public.sv_chat_threads(last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.sv_chat_members (
 thread_id uuid NOT NULL REFERENCES public.sv_chat_threads(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
 joined_at timestamptz NOT NULL DEFAULT now(),
 last_read_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (thread_id,user_id)
);
CREATE INDEX IF NOT EXISTS sv_chat_members_user_idx ON public.sv_chat_members(user_id,thread_id);

CREATE TABLE IF NOT EXISTS public.sv_chat_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 thread_id uuid NOT NULL REFERENCES public.sv_chat_threads(id) ON DELETE CASCADE,
 sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
 body text NOT NULL DEFAULT '' CHECK (char_length(body)<=4000),
 attachment_path text CHECK (attachment_path IS NULL OR char_length(attachment_path) BETWEEN 70 AND 280),
 attachment_name text CHECK (attachment_name IS NULL OR char_length(attachment_name) BETWEEN 1 AND 180),
 attachment_mime text CHECK (attachment_mime IS NULL OR char_length(attachment_mime)<=150),
 attachment_size integer CHECK (attachment_size IS NULL OR attachment_size BETWEEN 1 AND 20971520),
 recalled_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (char_length(btrim(body))>0 OR attachment_path IS NOT NULL OR recalled_at IS NOT NULL),
 CHECK ((attachment_path IS NULL AND attachment_name IS NULL AND attachment_mime IS NULL AND attachment_size IS NULL)
     OR (attachment_path IS NOT NULL AND attachment_name IS NOT NULL AND attachment_mime IS NOT NULL AND attachment_size IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS sv_chat_messages_thread_idx ON public.sv_chat_messages(thread_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS sv_chat_messages_sender_idx ON public.sv_chat_messages(sender_id,created_at DESC);

-- Member checks run with table-owner rights to avoid RLS recursion.
CREATE OR REPLACE FUNCTION public.sv_chat_is_member(p_thread uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT public.community_active() AND EXISTS(
   SELECT 1 FROM public.sv_chat_members m
   WHERE m.thread_id=p_thread AND m.user_id=auth.uid()
 );
$$;
REVOKE ALL ON FUNCTION public.sv_chat_is_member(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sv_chat_is_member(uuid) TO authenticated;

ALTER TABLE public.sv_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sv_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sv_chat_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sv_chat_threads,public.sv_chat_members,public.sv_chat_messages FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.sv_chat_threads,public.sv_chat_members,public.sv_chat_messages TO authenticated;
GRANT INSERT(body,thread_id,attachment_path,attachment_name,attachment_mime,attachment_size)
  ON public.sv_chat_messages TO authenticated;

CREATE POLICY sv_chat_threads_select ON public.sv_chat_threads FOR SELECT TO authenticated
 USING (public.sv_chat_is_member(id));
CREATE POLICY sv_chat_members_select ON public.sv_chat_members FOR SELECT TO authenticated
 USING (public.sv_chat_is_member(thread_id));
CREATE POLICY sv_chat_messages_select ON public.sv_chat_messages FOR SELECT TO authenticated
 USING (public.sv_chat_is_member(thread_id));
CREATE POLICY sv_chat_messages_insert ON public.sv_chat_messages FOR INSERT TO authenticated
 WITH CHECK (
  public.sv_chat_is_member(thread_id)
  AND sender_id=auth.uid()
  AND recalled_at IS NULL
  AND (attachment_path IS NULL OR (
    split_part(attachment_path,'/',1)=thread_id::text
    AND split_part(attachment_path,'/',2)=auth.uid()::text
  ))
 );

-- Public RPCs have no anon execute grants. They validate active status and
-- own membership on every call, never use the caller-provided sender identity.
CREATE OR REPLACE FUNCTION public.sv_chat_open_direct(p_other uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE me uuid:=auth.uid(); key_ text; tid uuid;
BEGIN
 IF NOT public.community_active() THEN RAISE EXCEPTION 'Tài khoản không còn hoạt động.'; END IF;
 IF p_other IS NULL OR p_other=me OR NOT EXISTS(
    SELECT 1 FROM public.profiles p WHERE p.id=p_other AND p.status::text='Đang hoạt động'
 ) THEN RAISE EXCEPTION 'Hãy chọn đồng nghiệp đang hoạt động.'; END IF;
 key_:=least(me::text,p_other::text)||':'||greatest(me::text,p_other::text);
 INSERT INTO public.sv_chat_threads(kind,direct_key,created_by)
 VALUES ('direct',key_,me) ON CONFLICT(direct_key) DO NOTHING
 RETURNING id INTO tid;
 IF tid IS NULL THEN
   SELECT t.id INTO tid FROM public.sv_chat_threads t WHERE t.direct_key=key_;
 END IF;
 IF tid IS NULL THEN RAISE EXCEPTION 'Không thể mở cuộc trò chuyện.'; END IF;
 INSERT INTO public.sv_chat_members(thread_id,user_id)
 VALUES(tid,me),(tid,p_other) ON CONFLICT DO NOTHING;
 RETURN tid;
END; $$;

CREATE OR REPLACE FUNCTION public.sv_chat_create_group(p_title text,p_users uuid[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE me uuid:=auth.uid(); ids uuid[]; tid uuid;
BEGIN
 IF NOT public.community_active() THEN RAISE EXCEPTION 'Tài khoản không còn hoạt động.'; END IF;
 IF char_length(btrim(coalesce(p_title,''))) NOT BETWEEN 2 AND 80 THEN
   RAISE EXCEPTION 'Tên nhóm cần có 2–80 ký tự.';
 END IF;
 SELECT array_agg(DISTINCT u) INTO ids
 FROM unnest(coalesce(p_users,ARRAY[]::uuid[])||ARRAY[me]) AS u
 WHERE u IS NOT NULL;
 IF coalesce(cardinality(ids),0) NOT BETWEEN 3 AND 30 THEN
   RAISE EXCEPTION 'Một nhóm cần ít nhất 3 và tối đa 30 thành viên.';
 END IF;
 IF EXISTS (
   SELECT 1 FROM unnest(ids) u LEFT JOIN public.profiles p ON p.id=u
   WHERE p.id IS NULL OR p.status::text<>'Đang hoạt động'
 ) THEN RAISE EXCEPTION 'Danh sách có tài khoản không hoạt động.'; END IF;
 INSERT INTO public.sv_chat_threads(kind,title,created_by)
 VALUES ('group',btrim(p_title),me) RETURNING id INTO tid;
 INSERT INTO public.sv_chat_members(thread_id,user_id,role)
 SELECT tid,u,CASE WHEN u=me THEN 'owner' ELSE 'member' END FROM unnest(ids) u;
 RETURN tid;
END; $$;

CREATE OR REPLACE FUNCTION public.sv_chat_mark_read(p_thread uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
BEGIN
 IF NOT public.sv_chat_is_member(p_thread) THEN
   RAISE EXCEPTION 'Bạn không thuộc cuộc trò chuyện này.';
 END IF;
 UPDATE public.sv_chat_members SET last_read_at=now()
 WHERE thread_id=p_thread AND user_id=auth.uid();
END; $$;

CREATE OR REPLACE FUNCTION public.sv_chat_recall(p_message uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE ok boolean;
BEGIN
 IF NOT public.community_active() THEN
   RAISE EXCEPTION 'Tài khoản không còn hoạt động.';
 END IF;
 UPDATE public.sv_chat_messages m
 SET body='',attachment_path=NULL,attachment_name=NULL,attachment_mime=NULL,
     attachment_size=NULL,recalled_at=now()
 WHERE m.id=p_message AND m.sender_id=auth.uid()
   AND public.sv_chat_is_member(m.thread_id) AND m.recalled_at IS NULL
 RETURNING true INTO ok;
 RETURN coalesce(ok,false);
END; $$;

-- One compact inbox read avoids N+1 fetching of messages or unread counters.
CREATE OR REPLACE FUNCTION public.sv_chat_inbox()
RETURNS TABLE(thread_id uuid,kind text,title text,member_ids uuid[],
              last_message text,last_sender uuid,last_at timestamptz,
              unread_count bigint,my_last_read timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE me uuid:=auth.uid();
BEGIN
 IF NOT public.community_active() THEN RAISE EXCEPTION 'Tài khoản không còn hoạt động.'; END IF;
 RETURN QUERY
 SELECT t.id,t.kind,t.title,
   ARRAY(SELECT x.user_id FROM public.sv_chat_members x WHERE x.thread_id=t.id ORDER BY x.user_id),
   CASE WHEN last_msg.recalled_at IS NOT NULL THEN 'Tin nhắn đã thu hồi'
        WHEN last_msg.attachment_path IS NOT NULL AND last_msg.body='' THEN 'Đã gửi tệp đính kèm'
        ELSE last_msg.body END,
   last_msg.sender_id,
   coalesce(last_msg.created_at,t.created_at),
   (SELECT count(*) FROM public.sv_chat_messages msg
    WHERE msg.thread_id=t.id AND msg.created_at>m.last_read_at
      AND msg.sender_id<>me AND msg.recalled_at IS NULL),
   m.last_read_at
 FROM public.sv_chat_members m
 JOIN public.sv_chat_threads t ON t.id=m.thread_id
 LEFT JOIN LATERAL (
   SELECT z.body,z.sender_id,z.created_at,z.attachment_path,z.recalled_at
   FROM public.sv_chat_messages z WHERE z.thread_id=t.id
   ORDER BY z.created_at DESC,z.id DESC LIMIT 1
 ) last_msg ON true
 WHERE m.user_id=me
 ORDER BY t.last_message_at DESC,t.id DESC
 LIMIT 150;
END; $$;

CREATE OR REPLACE FUNCTION public.sv_chat_unread_total()
RETURNS bigint LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE me uuid:=auth.uid(); n bigint;
BEGIN
 IF NOT public.community_active() THEN RETURN 0; END IF;
 SELECT coalesce(sum(unread.num),0) INTO n
 FROM public.sv_chat_members m
 CROSS JOIN LATERAL(
  SELECT count(*) num FROM public.sv_chat_messages z
  WHERE z.thread_id=m.thread_id AND z.created_at>m.last_read_at
    AND z.sender_id<>me AND z.recalled_at IS NULL
 ) unread
 WHERE m.user_id=me;
 RETURN n;
END; $$;

REVOKE ALL ON FUNCTION public.sv_chat_open_direct(uuid),
 public.sv_chat_create_group(text,uuid[]),public.sv_chat_mark_read(uuid),
 public.sv_chat_recall(uuid),public.sv_chat_inbox(),
 public.sv_chat_unread_total() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sv_chat_open_direct(uuid),
 public.sv_chat_create_group(text,uuid[]),public.sv_chat_mark_read(uuid),
 public.sv_chat_recall(uuid),public.sv_chat_inbox(),
 public.sv_chat_unread_total() TO authenticated;

-- Refresh inbox ordering after each message, even when the chat page is closed.
CREATE OR REPLACE FUNCTION public.sv_chat_touch_thread()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
BEGIN
 UPDATE public.sv_chat_threads
 SET last_message_at=NEW.created_at WHERE id=NEW.thread_id;
 RETURN NEW;
END; $$;
CREATE TRIGGER sv_chat_touch_on_message AFTER INSERT ON public.sv_chat_messages
 FOR EACH ROW EXECUTE FUNCTION public.sv_chat_touch_thread();

-- Attachments never expose an unauthenticated URL or bearer-style signed URL.
-- Their download requires live membership AND a non-recalled message
-- referring to the exact object path.
CREATE OR REPLACE FUNCTION public.sv_chat_can_download(p_path text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE id_txt text:=split_part(p_path,'/',1); tid uuid;
BEGIN
 IF id_txt !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 THEN RETURN false; END IF;
 tid:=id_txt::uuid;
 RETURN public.sv_chat_is_member(tid) AND EXISTS(
   SELECT 1 FROM public.sv_chat_messages z
   WHERE z.thread_id=tid AND z.attachment_path=p_path AND z.recalled_at IS NULL
 );
END; $$;
CREATE OR REPLACE FUNCTION public.sv_chat_can_upload(p_path text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE id_txt text:=split_part(p_path,'/',1); tid uuid;
BEGIN
 IF id_txt !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 THEN RETURN false; END IF;
 tid:=id_txt::uuid;
 RETURN public.sv_chat_is_member(tid)
   AND split_part(p_path,'/',2)=auth.uid()::text
   AND char_length(p_path) BETWEEN 70 AND 280;
END; $$;
REVOKE ALL ON FUNCTION public.sv_chat_can_download(text),
 public.sv_chat_can_upload(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sv_chat_can_download(text),
 public.sv_chat_can_upload(text) TO authenticated;

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('suviet-chat','suviet-chat',false,20971520,
ARRAY['image/jpeg','image/png','image/webp','image/gif',
'application/pdf','text/plain','application/msword',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=20971520,
 allowed_mime_types=EXCLUDED.allowed_mime_types;
-- The uploader may read back its own object immediately (Storage upload
-- uses INSERT ... RETURNING before the message row exists). Other members
-- can download only when an unrecalled message references the exact path.
CREATE POLICY sv_chat_storage_read ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id='suviet-chat' AND (
   public.sv_chat_can_upload(name) OR public.sv_chat_can_download(name)
 ));
CREATE POLICY sv_chat_storage_add ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id='suviet-chat' AND public.sv_chat_can_upload(name));
CREATE POLICY sv_chat_storage_remove ON storage.objects FOR DELETE TO authenticated
 USING (bucket_id='suviet-chat' AND public.sv_chat_can_upload(name));

-- Realtime RLS still applies to each change; client also polls as a fallback.
DO $realtime$
BEGIN
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
   IF NOT EXISTS(SELECT 1 FROM pg_publication_tables
                 WHERE pubname='supabase_realtime' AND schemaname='public'
                   AND tablename='sv_chat_messages') THEN
     ALTER PUBLICATION supabase_realtime ADD TABLE public.sv_chat_messages;
   END IF;
   IF NOT EXISTS(SELECT 1 FROM pg_publication_tables
                 WHERE pubname='supabase_realtime' AND schemaname='public'
                   AND tablename='sv_chat_threads') THEN
     ALTER PUBLICATION supabase_realtime ADD TABLE public.sv_chat_threads;
   END IF;
 END IF;
END $realtime$;
