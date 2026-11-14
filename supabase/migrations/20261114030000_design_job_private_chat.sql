-- A small private discussion attached to one existing design Job.
-- Only the Job creator/requester/current assignee participates. No groups,
-- no auto-status changes, no role overrides and no public media links.
CREATE OR REPLACE FUNCTION public.sv_design_job_chat_access(p_job_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT public.community_active() AND EXISTS (
   SELECT 1 FROM public.orders o
   WHERE o.id=p_job_id AND (
     o.created_by=auth.uid()
     OR private.design_person(auth.uid(),o.data->>'requester')
     OR private.design_person(auth.uid(),o.data->>'assignee')
   )
 );
$$;
REVOKE ALL ON FUNCTION public.sv_design_job_chat_access(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sv_design_job_chat_access(text) TO authenticated;

CREATE TABLE IF NOT EXISTS public.sv_design_job_chat_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 job_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
 sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id),
 body text NOT NULL DEFAULT '' CHECK(char_length(body)<=3000),
 attachment_path text UNIQUE CHECK(attachment_path IS NULL OR char_length(attachment_path) BETWEEN 35 AND 300),
 attachment_name text CHECK(attachment_name IS NULL OR char_length(attachment_name) BETWEEN 1 AND 180),
 attachment_mime text CHECK(attachment_mime IS NULL OR char_length(attachment_mime)<=150),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(char_length(btrim(body))>0 OR attachment_path IS NOT NULL),
 CHECK((attachment_path IS NULL AND attachment_name IS NULL AND attachment_mime IS NULL)
    OR (attachment_path IS NOT NULL AND attachment_name IS NOT NULL AND attachment_mime IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS sv_design_job_chat_messages_idx
 ON public.sv_design_job_chat_messages(job_id,created_at DESC,id DESC);
ALTER TABLE public.sv_design_job_chat_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sv_design_job_chat_messages FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.sv_design_job_chat_messages TO authenticated;
GRANT INSERT(job_id,body,attachment_path,attachment_name,attachment_mime)
 ON public.sv_design_job_chat_messages TO authenticated;
CREATE POLICY sv_design_job_chat_select ON public.sv_design_job_chat_messages FOR SELECT TO authenticated
 USING (public.sv_design_job_chat_access(job_id));
CREATE POLICY sv_design_job_chat_insert ON public.sv_design_job_chat_messages FOR INSERT TO authenticated
 WITH CHECK (
   public.sv_design_job_chat_access(job_id)
   AND sender_id=auth.uid()
   AND (attachment_path IS NULL OR (
     split_part(attachment_path,'/',1)=job_id
     AND split_part(attachment_path,'/',2)=auth.uid()::text
   ))
 );

CREATE TABLE IF NOT EXISTS public.sv_design_job_chat_reads (
 job_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 last_read_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(job_id,user_id)
);
ALTER TABLE public.sv_design_job_chat_reads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sv_design_job_chat_reads FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.sv_design_job_chat_reads TO authenticated;
CREATE POLICY sv_design_job_chat_reads_select ON public.sv_design_job_chat_reads
 FOR SELECT TO authenticated
 USING(user_id=auth.uid() AND public.sv_design_job_chat_access(job_id));

CREATE OR REPLACE FUNCTION public.sv_design_job_chat_mark_read(p_job_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
BEGIN
 IF NOT public.sv_design_job_chat_access(p_job_id) THEN
   RAISE EXCEPTION 'Bạn không tham gia Job này.';
 END IF;
 INSERT INTO public.sv_design_job_chat_reads(job_id,user_id,last_read_at)
 VALUES(p_job_id,auth.uid(),now())
 ON CONFLICT(job_id,user_id) DO UPDATE SET last_read_at=excluded.last_read_at;
END; $$;
CREATE OR REPLACE FUNCTION public.sv_design_job_chat_unread(p_job_id text)
RETURNS bigint LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE result bigint;
BEGIN
 IF NOT public.sv_design_job_chat_access(p_job_id) THEN RETURN 0; END IF;
 SELECT count(*) INTO result
 FROM public.sv_design_job_chat_messages msg
 LEFT JOIN public.sv_design_job_chat_reads rd
   ON rd.job_id=msg.job_id AND rd.user_id=auth.uid()
 WHERE msg.job_id=p_job_id AND msg.sender_id<>auth.uid()
   AND (rd.last_read_at IS NULL OR msg.created_at>rd.last_read_at);
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.sv_design_job_chat_mark_read(text),
 public.sv_design_job_chat_unread(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sv_design_job_chat_mark_read(text),
 public.sv_design_job_chat_unread(text) TO authenticated;

-- Storage downloads are always checked using a fresh user session & Job access.
-- A path is job-id/author-uuid/random-uuid.extension, never user-supplied.
CREATE OR REPLACE FUNCTION public.sv_design_job_chat_can_upload(p_path text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=''
AS $$
DECLARE job text := split_part(p_path,'/',1);
BEGIN
 RETURN char_length(p_path) BETWEEN 35 AND 300
   AND split_part(p_path,'/',2)=auth.uid()::text
   AND public.sv_design_job_chat_access(job);
END; $$;
CREATE OR REPLACE FUNCTION public.sv_design_job_chat_can_download(p_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT EXISTS(
   SELECT 1 FROM public.sv_design_job_chat_messages msg
   WHERE msg.attachment_path=p_path AND public.sv_design_job_chat_access(msg.job_id)
 );
$$;
REVOKE ALL ON FUNCTION public.sv_design_job_chat_can_upload(text),
 public.sv_design_job_chat_can_download(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sv_design_job_chat_can_upload(text),
 public.sv_design_job_chat_can_download(text) TO authenticated;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('suviet-design-job-chat','suviet-design-job-chat',false,15728640,
 ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=15728640,
 allowed_mime_types=EXCLUDED.allowed_mime_types;
-- Storage insert often needs SELECT for RETURNING. Only the uploader may see
-- their own orphaned upload; other participants need a linked message row.
CREATE POLICY sv_design_job_chat_storage_read ON storage.objects FOR SELECT TO authenticated
 USING(bucket_id='suviet-design-job-chat'
   AND (public.sv_design_job_chat_can_upload(name) OR public.sv_design_job_chat_can_download(name)));
CREATE POLICY sv_design_job_chat_storage_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK(bucket_id='suviet-design-job-chat' AND public.sv_design_job_chat_can_upload(name));
CREATE POLICY sv_design_job_chat_storage_delete ON storage.objects FOR DELETE TO authenticated
 USING(bucket_id='suviet-design-job-chat' AND public.sv_design_job_chat_can_upload(name));
