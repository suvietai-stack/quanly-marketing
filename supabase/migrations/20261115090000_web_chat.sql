-- Additive web chat. Private data is service-role-only, accessed through guarded server functions.
BEGIN;
CREATE TABLE public.wc_sites (
 id uuid PRIMARY KEY REFERENCES public.wf_websites(id),
 enabled boolean NOT NULL DEFAULT false,
 settings jsonb NOT NULL DEFAULT '{}',
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.wc_access (
 site_id uuid REFERENCES public.wc_sites(id), user_id uuid NOT NULL,
 PRIMARY KEY(site_id,user_id)
);
CREATE TABLE public.wc_conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 site_id uuid NOT NULL REFERENCES public.wc_sites(id), visitor_hash text NOT NULL,
 page_url text NOT NULL DEFAULT '', mode text NOT NULL DEFAULT 'ai' CHECK(mode IN ('ai','human','captured')),
 summary text NOT NULL DEFAULT '', contact jsonb NOT NULL DEFAULT '{}',
 signal_id uuid, lease uuid, lease_until timestamptz, revision integer NOT NULL DEFAULT 0,
 taken_by uuid, read_at timestamptz, error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(site_id,visitor_hash)
);
CREATE TABLE public.wc_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid NOT NULL REFERENCES public.wc_conversations(id),
 request_id uuid NOT NULL, role text NOT NULL CHECK(role IN ('user','assistant','staff')),
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 2500),
 state text NOT NULL DEFAULT 'done' CHECK(state IN ('pending','done','error')),
 attempts integer NOT NULL DEFAULT 0, retry_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(conversation_id,request_id,role)
);
CREATE INDEX wc_messages_thread ON public.wc_messages(conversation_id,created_at,id);
CREATE INDEX wc_conversations_recent ON public.wc_conversations(site_id,updated_at DESC,id);
CREATE TABLE public.wc_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid REFERENCES public.wc_conversations(id),
 actor uuid NOT NULL, action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.wc_requests (
 site_id uuid NOT NULL REFERENCES public.wc_sites(id), nonce uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(site_id,nonce)
);
CREATE TABLE public.wc_rate (
 bucket text PRIMARY KEY, count integer NOT NULL DEFAULT 1, started_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wc_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wc_rate ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wc_sites,public.wc_access,public.wc_conversations,public.wc_messages,public.wc_audit,public.wc_requests,public.wc_rate FROM anon,authenticated;
GRANT ALL ON public.wc_sites,public.wc_access,public.wc_conversations,public.wc_messages,public.wc_audit,public.wc_requests,public.wc_rate TO service_role;

CREATE FUNCTION public.wc_rate_hit(p_bucket text,p_limit integer) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE n integer;
BEGIN
 DELETE FROM public.wc_rate WHERE started_at < now()-interval '1 day';
 INSERT INTO public.wc_rate(bucket) VALUES(p_bucket)
 ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN wc_rate.started_at < now()-interval '1 minute' THEN 1 ELSE wc_rate.count+1 END,
 started_at=CASE WHEN wc_rate.started_at < now()-interval '1 minute' THEN now() ELSE wc_rate.started_at END RETURNING count INTO n;
 RETURN n<=p_limit;
END $$;

CREATE FUNCTION public.wc_receive(p_site uuid,p_hash text,p_request uuid,p_text text,p_page text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE c public.wc_conversations; s public.wc_sites; old public.wc_messages;
BEGIN
 SELECT * INTO s FROM public.wc_sites WHERE id=p_site AND enabled FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Website disabled'; END IF;
 INSERT INTO public.wc_conversations(site_id,visitor_hash,page_url) VALUES(p_site,p_hash,left(p_page,500)) ON CONFLICT(site_id,visitor_hash) DO NOTHING;
 SELECT * INTO c FROM public.wc_conversations WHERE site_id=p_site AND visitor_hash=p_hash FOR UPDATE;
 IF p_text IS NOT NULL THEN
  IF length(p_text) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Invalid message'; END IF;
  SELECT * INTO old FROM public.wc_messages WHERE conversation_id=c.id AND request_id=p_request AND role='user';
  IF FOUND THEN
   IF old.body IS DISTINCT FROM p_text THEN RAISE EXCEPTION 'Request reused'; END IF;
  ELSE
   IF NOT public.wc_rate_hit('message:'||c.id::text,12) THEN RAISE EXCEPTION 'Too many messages'; END IF;
   IF (SELECT count(*) FROM public.wc_messages WHERE conversation_id=c.id) >= 500 THEN RAISE EXCEPTION 'Conversation limit'; END IF;
   INSERT INTO public.wc_messages(conversation_id,request_id,role,body,state) VALUES(c.id,p_request,'user',p_text,CASE WHEN c.mode='human' THEN 'done' ELSE 'pending' END);
   UPDATE public.wc_conversations SET updated_at=now(),page_url=CASE WHEN p_page<>'' THEN left(p_page,500) ELSE page_url END WHERE id=c.id;
  END IF;
 END IF;
 RETURN jsonb_build_object('id',c.id);
END $$;

CREATE FUNCTION public.wc_claim(p_conversation uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE c public.wc_conversations; m public.wc_messages; tok uuid:=gen_random_uuid();
BEGIN
 SELECT * INTO c FROM public.wc_conversations WHERE id=p_conversation FOR UPDATE;
 IF NOT FOUND OR c.mode='human' OR c.lease_until>now() OR NOT EXISTS(SELECT 1 FROM public.wc_sites WHERE id=c.site_id AND enabled) THEN RETURN NULL; END IF;
 SELECT * INTO m FROM public.wc_messages WHERE conversation_id=c.id AND role='user' AND state IN('pending','error') AND attempts<3 AND (retry_at IS NULL OR retry_at<=now()) ORDER BY created_at,id LIMIT 1;
 IF NOT FOUND THEN RETURN NULL; END IF;
 UPDATE public.wc_messages SET attempts=attempts+1 WHERE id=m.id;
 UPDATE public.wc_conversations SET lease=tok,lease_until=now()+interval '90 seconds',error=NULL WHERE id=c.id RETURNING * INTO c;
 RETURN jsonb_build_object('conversation',to_jsonb(c)-'visitor_hash','message',to_jsonb(m),'lease',tok,'revision',c.revision);
END $$;

CREATE FUNCTION public.wc_finish(p_conversation uuid,p_request uuid,p_lease uuid,p_revision integer,p_answer text,p_contact jsonb,p_summary text,p_draft jsonb) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE c public.wc_conversations; e public.wf_events; work jsonb; result text; closing text; sid uuid;
BEGIN
 SELECT * INTO c FROM public.wc_conversations WHERE id=p_conversation FOR UPDATE;
 IF NOT FOUND OR c.mode='human' OR c.lease IS DISTINCT FROM p_lease OR c.lease_until<=now() OR c.revision<>p_revision THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.wc_sites WHERE id=c.site_id AND enabled) THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.wc_messages WHERE conversation_id=c.id AND request_id=p_request AND role='user' AND state IN('pending','error')) THEN RETURN false; END IF;
 IF c.signal_id IS NULL AND p_draft IS NOT NULL THEN
  IF p_draft->>'phone' !~ '^0[35789][0-9]{8}$' OR length(coalesce(p_draft->>'need_detail',''))<3 THEN RAISE EXCEPTION 'Invalid lead'; END IF;
  INSERT INTO public.wf_events(website_id,form_id,submission_id,payload,page_url)
   VALUES(c.site_id,'base-web-chat','wc:'||c.id::text,p_contact,c.page_url) ON CONFLICT(website_id,submission_id) DO NOTHING;
  SELECT * INTO e FROM public.wf_events WHERE website_id=c.site_id AND submission_id='wc:'||c.id::text FOR UPDATE;
  IF e.signal_id IS NULL THEN
   work:=public.wf_claim_event(e.id);
   IF work IS NULL THEN RAISE EXCEPTION 'Lead busy'; END IF;
   result:=public.wf_complete_event(e.id,(work->>'lease_token')::uuid,p_draft);
   IF result<>'success' THEN RAISE EXCEPTION 'Lead not saved'; END IF;
  END IF;
  SELECT signal_id INTO sid FROM public.wf_events WHERE id=e.id;
  -- Distinct system attribution; never create an employee/Auth account or reassign an existing signal.
  UPDATE public.opportunity_signals SET created_by='00000000-0000-0000-0000-00000000dc01' WHERE id=sid AND created_by='00000000-0000-0000-0000-00000000eb01';
  SELECT settings->>'closing' INTO closing FROM public.wc_sites WHERE id=c.site_id;
  p_answer:=left('Em ghi nhận nhu cầu: '||coalesce(p_contact->>'need','')||E'\n'||coalesce(closing,'Bộ phận tư vấn sẽ liên hệ anh chị.'),2500);
 END IF;
 INSERT INTO public.wc_messages(conversation_id,request_id,role,body) VALUES(c.id,p_request,'assistant',left(p_answer,2500)) ON CONFLICT DO NOTHING;
 UPDATE public.wc_messages SET state='done' WHERE conversation_id=c.id AND request_id=p_request AND role='user';
 UPDATE public.wc_conversations SET lease=NULL,lease_until=NULL,contact=p_contact,summary=left(p_summary,2500),
  signal_id=coalesce(c.signal_id,sid),mode=CASE WHEN coalesce(c.signal_id,sid) IS NOT NULL THEN 'captured' ELSE 'ai' END,error=NULL,updated_at=now() WHERE id=c.id;
 RETURN true;
END $$;

CREATE FUNCTION public.wc_fail(p_conversation uuid,p_lease uuid,p_request uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 UPDATE public.wc_conversations SET lease=NULL,lease_until=NULL,error='AI chưa phản hồi được. Có thể thử lại.',updated_at=now() WHERE id=p_conversation AND lease=p_lease;
 IF FOUND THEN UPDATE public.wc_messages SET state='error',retry_at=now()+interval '30 seconds'*power(2,attempts) WHERE conversation_id=p_conversation AND request_id=p_request AND role='user'; END IF;
END $$;

CREATE FUNCTION public.wc_control(p_conversation uuid,p_actor uuid,p_action text,p_request uuid,p_text text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE c public.wc_conversations;
BEGIN
 SELECT * INTO c FROM public.wc_conversations WHERE id=p_conversation FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Missing conversation'; END IF;
 IF p_action='read' THEN UPDATE public.wc_conversations SET read_at=now() WHERE id=c.id; RETURN; END IF;
 IF p_action='takeover' THEN
  UPDATE public.wc_conversations SET mode='human',taken_by=p_actor,revision=revision+1,lease=NULL,lease_until=NULL,error=NULL WHERE id=c.id;
  UPDATE public.wc_messages SET state='done' WHERE conversation_id=c.id AND state IN('pending','error');
 ELSIF p_action='resume' THEN
  UPDATE public.wc_conversations SET mode=CASE WHEN signal_id IS NULL THEN 'ai' ELSE 'captured' END,taken_by=NULL,revision=revision+1 WHERE id=c.id;
 ELSIF p_action='send' THEN
  IF c.mode<>'human' OR c.taken_by IS DISTINCT FROM p_actor THEN RAISE EXCEPTION 'Take over first'; END IF;
  IF length(p_text) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Invalid message'; END IF;
  INSERT INTO public.wc_messages(conversation_id,request_id,role,body) VALUES(c.id,p_request,'staff',p_text) ON CONFLICT DO NOTHING;
  UPDATE public.wc_conversations SET updated_at=now() WHERE id=c.id;
 ELSE RAISE EXCEPTION 'Invalid action'; END IF;
 INSERT INTO public.wc_audit(conversation_id,actor,action) VALUES(c.id,p_actor,p_action);
END $$;
REVOKE ALL ON FUNCTION public.wc_rate_hit(text,integer),public.wc_receive(uuid,text,uuid,text,text),public.wc_claim(uuid),public.wc_finish(uuid,uuid,uuid,integer,text,jsonb,text,jsonb),public.wc_fail(uuid,uuid,uuid),public.wc_control(uuid,uuid,text,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wc_rate_hit(text,integer),public.wc_receive(uuid,text,uuid,text,text),public.wc_claim(uuid),public.wc_finish(uuid,uuid,uuid,integer,text,jsonb,text,jsonb),public.wc_fail(uuid,uuid,uuid),public.wc_control(uuid,uuid,text,uuid,text) TO service_role;
COMMIT;
