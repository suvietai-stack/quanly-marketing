-- Additive, staged only. No defaults, Role assignments, Lead rows or employee data changed.
CREATE TABLE public.inbox_page_capabilities (
 page_id text PRIMARY KEY REFERENCES public.fbl_pages(page_id), enabled boolean NOT NULL DEFAULT false,
 tasks text[] NOT NULL DEFAULT '{}',
 lead_enabled boolean NOT NULL DEFAULT true, lead_enabled_at timestamptz,
 ready boolean NOT NULL DEFAULT false, reason text, checked_at timestamptz, last_event_at timestamptz
);
GRANT SELECT ON public.inbox_page_capabilities TO authenticated;
GRANT ALL ON public.inbox_page_capabilities TO service_role;
ALTER TABLE public.inbox_page_capabilities ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.inbox_page_access (
 page_id text NOT NULL REFERENCES public.fbl_pages(page_id), user_id uuid NOT NULL,
 created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(page_id,user_id)
);
GRANT SELECT ON public.inbox_page_access TO authenticated;
GRANT ALL ON public.inbox_page_access TO service_role;
ALTER TABLE public.inbox_page_access ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.inbox_conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), page_id text NOT NULL REFERENCES public.fbl_pages(page_id),
 customer_id text NOT NULL, customer_name text, last_at timestamptz NOT NULL, last_text text NOT NULL DEFAULT '',
 last_incoming_at timestamptz, last_outgoing_at timestamptz, needs_reply boolean NOT NULL DEFAULT true,
 resolved boolean NOT NULL DEFAULT false, assignee_id uuid, version integer NOT NULL DEFAULT 1,
 delivered_at timestamptz, read_at timestamptz, UNIQUE(page_id,customer_id)
);
GRANT SELECT ON public.inbox_conversations TO authenticated;
GRANT ALL ON public.inbox_conversations TO service_role;
ALTER TABLE public.inbox_conversations ENABLE ROW LEVEL SECURITY;
CREATE INDEX inbox_conversations_page_time ON public.inbox_conversations(page_id,last_at DESC,id DESC);
CREATE TABLE public.inbox_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid NOT NULL REFERENCES public.inbox_conversations(id),
 page_id text NOT NULL REFERENCES public.fbl_pages(page_id), mid text, request_id uuid UNIQUE,
 direction text NOT NULL CHECK(direction IN ('in','out')), text text NOT NULL DEFAULT '', attachments jsonb NOT NULL DEFAULT '[]',
 event_at timestamptz NOT NULL, state text NOT NULL CHECK(state IN ('received','sending','accepted','delivered','read','failed','unknown')),
 failure text, actor_id uuid, claimed_at timestamptz, UNIQUE(page_id,mid)
);
GRANT SELECT ON public.inbox_messages TO authenticated;
GRANT ALL ON public.inbox_messages TO service_role;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX inbox_messages_cursor ON public.inbox_messages(conversation_id,event_at DESC,id DESC);
CREATE TABLE public.inbox_reads (
 conversation_id uuid NOT NULL REFERENCES public.inbox_conversations(id), user_id uuid NOT NULL,
 read_at timestamptz NOT NULL, PRIMARY KEY(conversation_id,user_id)
);
GRANT SELECT ON public.inbox_reads TO authenticated;
GRANT ALL ON public.inbox_reads TO service_role;
ALTER TABLE public.inbox_reads ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.inbox_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_key text NOT NULL UNIQUE, page_id text NOT NULL,
 payload jsonb NOT NULL, received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz
);
GRANT ALL ON public.inbox_events TO service_role;
ALTER TABLE public.inbox_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.inbox_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, page_id text NOT NULL,
 conversation_id uuid, action text NOT NULL, before_data jsonb, after_data jsonb, at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.inbox_audit TO service_role;
ALTER TABLE public.inbox_audit ENABLE ROW LEVEL SECURITY;
INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('inbox.view','Xem Hộp thư theo Page được cấp','Hộp thư','{}'),
 ('inbox.send','Trả lời Messenger trong cửa sổ cho phép','Hộp thư','{inbox.view}'),
 ('inbox.assign','Phân công hội thoại trong Page được cấp','Hộp thư','{inbox.view}'),
 ('inbox.resolve','Đóng và mở lại hội thoại','Hộp thư','{inbox.view}'),
 ('inbox.manage','Quản lý quyền truy cập Page Hộp thư','Hộp thư','{inbox.view}')
 ON CONFLICT(key) DO NOTHING;
-- Native gate consumes canonical Role/common/task/personal rules; DENY wins. No legacy fallback for new module.
CREATE FUNCTION public.inbox_can(u uuid,p text,p_page text DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; allowed_ boolean;
BEGIN
 IF u IS NULL OR NOT private.is_active(u) OR p NOT IN ('inbox.view','inbox.send','inbox.assign','inbox.resolve','inbox.manage') THEN RETURN false; END IF;
 IF private.is_super_admin(u) THEN RETURN true; END IF;
 allowed_:=private.has_permission(u,p);
 RETURN allowed_ AND (p_page IS NULL OR EXISTS(SELECT 1 FROM inbox_page_access WHERE page_id=p_page AND user_id=u));
END $$;
REVOKE ALL ON FUNCTION public.inbox_can(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.inbox_can(uuid,text,text) TO authenticated,service_role;
CREATE POLICY inbox_cap_read ON public.inbox_page_capabilities FOR SELECT TO authenticated USING(public.inbox_can(auth.uid(),'inbox.view',page_id));
CREATE POLICY inbox_access_read ON public.inbox_page_access FOR SELECT TO authenticated USING(user_id=auth.uid() AND public.inbox_can(auth.uid(),'inbox.view',page_id));
CREATE POLICY inbox_conversation_read ON public.inbox_conversations FOR SELECT TO authenticated USING(public.inbox_can(auth.uid(),'inbox.view',page_id));
CREATE POLICY inbox_message_read ON public.inbox_messages FOR SELECT TO authenticated USING(public.inbox_can(auth.uid(),'inbox.view',page_id));
CREATE POLICY inbox_reads_read ON public.inbox_reads FOR SELECT TO authenticated USING(user_id=auth.uid() AND EXISTS(SELECT 1 FROM inbox_conversations c WHERE c.id=conversation_id AND public.inbox_can(auth.uid(),'inbox.view',c.page_id)));
CREATE FUNCTION public.inbox_overview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=auth.uid(); pages_ jsonb;
BEGIN
 IF u IS NULL OR NOT private.is_active(u) THEN RAISE EXCEPTION 'Không có quyền Hộp thư' USING ERRCODE='42501'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('page_id',p.page_id,'name',p.name,'enabled',coalesce(c.enabled,false) AND p.status<>'disconnected','ready',coalesce(c.ready,false) AND p.status<>'disconnected','reason',CASE WHEN p.status='disconnected' THEN 'Page đã ngắt kết nối' ELSE c.reason END,'checked_at',c.checked_at,'last_event_at',c.last_event_at) ORDER BY p.name),'[]') INTO pages_
 FROM fbl_pages p LEFT JOIN inbox_page_capabilities c USING(page_id)
 WHERE inbox_can(u,'inbox.view',p.page_id);
 RETURN jsonb_build_object('available',true,'can_view',inbox_can(u,'inbox.view'),'can_send',inbox_can(u,'inbox.send'),'can_assign',inbox_can(u,'inbox.assign'),'can_resolve',inbox_can(u,'inbox.resolve'),'can_manage',inbox_can(u,'inbox.manage'),'pages',pages_);
END $$;
CREATE FUNCTION public.inbox_list(p_page text DEFAULT NULL,p_filter text DEFAULT 'all',p_before timestamptz DEFAULT NULL,p_id uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=auth.uid(); out_ jsonb;
BEGIN
 IF NOT inbox_can(u,'inbox.view',p_page) OR p_filter NOT IN ('all','unread','reply','resolved') THEN RAISE EXCEPTION 'Không có quyền Hộp thư' USING ERRCODE='42501'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(q) ORDER BY q.last_at DESC,q.id DESC),'[]') INTO out_ FROM (
 SELECT c.*,coalesce(c.last_incoming_at>r.read_at,c.last_incoming_at IS NOT NULL) unread
 FROM inbox_conversations c LEFT JOIN inbox_reads r ON r.conversation_id=c.id AND r.user_id=u
 WHERE (c.last_incoming_at IS NOT NULL OR c.last_outgoing_at IS NOT NULL) AND (p_page IS NULL OR c.page_id=p_page) AND inbox_can(u,'inbox.view',c.page_id)
 AND (p_before IS NULL OR (c.last_at,c.id)<(p_before,p_id))
 AND CASE p_filter WHEN 'unread' THEN coalesce(c.last_incoming_at>r.read_at,c.last_incoming_at IS NOT NULL) WHEN 'reply' THEN c.needs_reply AND NOT c.resolved WHEN 'resolved' THEN c.resolved ELSE NOT c.resolved END
 ORDER BY c.last_at DESC,c.id DESC LIMIT 50) q;
 RETURN out_;
END $$;
CREATE FUNCTION public.inbox_thread(p_conversation uuid,p_before timestamptz DEFAULT NULL,p_id uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE c inbox_conversations; rows_ jsonb;
BEGIN
 SELECT * INTO c FROM inbox_conversations WHERE id=p_conversation;
 IF c.id IS NULL OR NOT inbox_can(auth.uid(),'inbox.view',c.page_id) THEN RAISE EXCEPTION 'Không có quyền hội thoại' USING ERRCODE='42501'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(q) ORDER BY q.event_at,q.id),'[]') INTO rows_ FROM (
 SELECT id,request_id,direction,text,attachments,event_at,CASE WHEN state='sending' AND claimed_at<now()-interval '1 minute' THEN 'unknown' ELSE state END state,failure FROM inbox_messages
 WHERE conversation_id=c.id AND (p_before IS NULL OR (event_at,id)<(p_before,p_id)) ORDER BY event_at DESC,id DESC LIMIT 50) q;
 RETURN jsonb_build_object('conversation',to_jsonb(c),'messages',rows_,'can_send',inbox_can(auth.uid(),'inbox.send',c.page_id),'can_assign',inbox_can(auth.uid(),'inbox.assign',c.page_id),'can_resolve',inbox_can(auth.uid(),'inbox.resolve',c.page_id),'server_now',now(),'window_open',c.last_incoming_at>now()-interval '24 hours' AND c.last_incoming_at<=now());
END $$;
CREATE FUNCTION public.inbox_staff(p_page text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT inbox_can(auth.uid(),'inbox.assign',p_page) AND NOT inbox_can(auth.uid(),'inbox.manage',p_page) THEN RAISE EXCEPTION 'Không có quyền nhân sự Page' USING ERRCODE='42501'; END IF;
 RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.full_name,'access',EXISTS(SELECT 1 FROM inbox_page_access a WHERE a.user_id=p.id AND a.page_id=p_page)) ORDER BY p.full_name),'[]') FROM profiles p WHERE private.is_active(p.id) AND (inbox_can(auth.uid(),'inbox.manage',p_page) OR inbox_can(p.id,'inbox.view',p_page)));
END $$;
CREATE FUNCTION public.inbox_access_save(p_page text,p_user uuid,p_enabled boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT inbox_can(auth.uid(),'inbox.manage',p_page) OR NOT private.is_active(p_user) OR NOT EXISTS(SELECT 1 FROM fbl_pages WHERE page_id=p_page) THEN RAISE EXCEPTION 'Không có quyền cấp Page' USING ERRCODE='42501'; END IF;
 IF p_enabled THEN INSERT INTO inbox_page_access(page_id,user_id,created_by) VALUES(p_page,p_user,auth.uid()) ON CONFLICT DO NOTHING;
 ELSE DELETE FROM inbox_page_access WHERE page_id=p_page AND user_id=p_user; END IF;
 INSERT INTO inbox_audit(actor_id,page_id,action,after_data) VALUES(auth.uid(),p_page,'page_access',jsonb_build_object('user_id',p_user,'enabled',p_enabled));
END $$;
CREATE FUNCTION public.inbox_change(p_conversation uuid,p_action text,p_user uuid DEFAULT NULL,p_version integer DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c inbox_conversations; old_ jsonb;
BEGIN
 SELECT * INTO c FROM inbox_conversations WHERE id=p_conversation FOR UPDATE;
 IF c.id IS NULL OR NOT inbox_can(auth.uid(),'inbox.view',c.page_id) THEN RAISE EXCEPTION 'Không có quyền hội thoại' USING ERRCODE='42501'; END IF;
 old_:=to_jsonb(c);
 IF p_action='read' THEN
 INSERT INTO inbox_reads VALUES(c.id,auth.uid(),coalesce(c.last_incoming_at,c.last_at)) ON CONFLICT(conversation_id,user_id) DO UPDATE SET read_at=greatest(inbox_reads.read_at,excluded.read_at); RETURN;
 END IF;
 IF p_version IS DISTINCT FROM c.version THEN RAISE EXCEPTION 'Hội thoại đã thay đổi; tải lại trước khi thao tác'; END IF;
 IF p_action='assign' THEN
 IF NOT inbox_can(auth.uid(),'inbox.assign',c.page_id) OR (p_user IS NOT NULL AND NOT inbox_can(p_user,'inbox.view',c.page_id)) THEN RAISE EXCEPTION 'Không có quyền phân công' USING ERRCODE='42501'; END IF;
 UPDATE inbox_conversations SET assignee_id=p_user,version=version+1 WHERE id=c.id;
 ELSIF p_action IN ('resolve','reopen') THEN
 IF NOT inbox_can(auth.uid(),'inbox.resolve',c.page_id) THEN RAISE EXCEPTION 'Không có quyền đóng hội thoại' USING ERRCODE='42501'; END IF;
 UPDATE inbox_conversations SET resolved=(p_action='resolve'),version=version+1 WHERE id=c.id;
 ELSE RAISE EXCEPTION 'Thao tác không hợp lệ'; END IF;
 INSERT INTO inbox_audit(actor_id,page_id,conversation_id,action,before_data,after_data) SELECT auth.uid(),c.page_id,c.id,p_action,old_,to_jsonb(x) FROM inbox_conversations x WHERE id=c.id;
END $$;
-- Reserve and claim exactly once before any external send. Ambiguous outcomes never get another claim.
CREATE FUNCTION public.inbox_send_claim(p_conversation uuid,p_request uuid,p_text text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c inbox_conversations; m inbox_messages;
BEGIN
 SELECT * INTO c FROM inbox_conversations WHERE id=p_conversation FOR UPDATE;
 IF c.id IS NULL OR NOT inbox_can(auth.uid(),'inbox.send',c.page_id) OR NOT inbox_can(auth.uid(),'inbox.view',c.page_id) THEN RAISE EXCEPTION 'Không có quyền trả lời' USING ERRCODE='42501'; END IF;
 SELECT * INTO m FROM inbox_messages WHERE request_id=p_request;
 IF m.id IS NOT NULL THEN
 IF m.conversation_id<>c.id OR m.actor_id<>auth.uid() OR m.text<>btrim(p_text) THEN RAISE EXCEPTION 'Khóa gửi đã được dùng'; END IF;
 RETURN jsonb_build_object('claimed',false,'id',m.id,'state',m.state);
 END IF;
 IF length(btrim(p_text)) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Tin nhắn phải từ 1 đến 2000 ký tự'; END IF;
 IF c.last_incoming_at IS NULL OR c.last_incoming_at<=now()-interval '24 hours' OR c.last_incoming_at>now() THEN RAISE EXCEPTION 'Ngoài cửa sổ 24 giờ; khách cần nhắn lại trước khi trả lời'; END IF;
 IF NOT EXISTS(SELECT 1 FROM inbox_page_capabilities k JOIN fbl_pages p USING(page_id) WHERE k.page_id=c.page_id AND k.enabled AND k.ready AND p.status<>'disconnected' AND k.checked_at>now()-interval '24 hours') THEN RAISE EXCEPTION 'Page cần kiểm tra hoặc kết nối lại Messenger'; END IF;
 INSERT INTO inbox_messages(conversation_id,page_id,request_id,direction,text,event_at,state,actor_id,claimed_at) VALUES(c.id,c.page_id,p_request,'out',btrim(p_text),now(),'sending',auth.uid(),now()) RETURNING * INTO m;
 INSERT INTO inbox_audit(actor_id,page_id,conversation_id,action,after_data) VALUES(auth.uid(),c.page_id,c.id,'send_claim',jsonb_build_object('message_id',m.id,'request_id',p_request));
 RETURN jsonb_build_object('claimed',true,'id',m.id,'page_id',c.page_id,'customer_id',c.customer_id,'state',m.state);
END $$;
CREATE FUNCTION public.inbox_send_finish(p_request uuid,p_mid text,p_state text,p_failure text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m inbox_messages; echo_ inbox_messages;
BEGIN
 IF p_state NOT IN ('accepted','failed','unknown') THEN RAISE EXCEPTION 'Invalid send state'; END IF;
 SELECT * INTO m FROM inbox_messages WHERE request_id=p_request;
 IF m.id IS NULL THEN RAISE EXCEPTION 'Unknown request'; END IF;
 PERFORM 1 FROM inbox_conversations WHERE id=m.conversation_id FOR UPDATE;
 SELECT * INTO m FROM inbox_messages WHERE request_id=p_request FOR UPDATE;
 IF p_mid IS NOT NULL THEN
 SELECT * INTO echo_ FROM inbox_messages WHERE page_id=m.page_id AND mid=p_mid AND id<>m.id FOR UPDATE;
 IF echo_.id IS NOT NULL THEN
 UPDATE inbox_messages SET event_at=echo_.event_at,attachments=echo_.attachments,state=echo_.state WHERE id=m.id;
 DELETE FROM inbox_messages WHERE id=echo_.id;
 END IF;
 END IF;
 UPDATE inbox_messages SET mid=coalesce(p_mid,mid),state=CASE WHEN state IN ('read','delivered','accepted') AND p_state<>'accepted' THEN state WHEN state IN ('read','delivered') THEN state ELSE p_state END,failure=left(p_failure,300) WHERE id=m.id;
 IF p_state='accepted' THEN
 UPDATE inbox_conversations SET last_outgoing_at=greatest(last_outgoing_at,m.event_at),last_text=CASE WHEN m.event_at>=last_at THEN m.text ELSE last_text END,last_at=greatest(last_at,m.event_at),needs_reply=coalesce(last_incoming_at>greatest(last_outgoing_at,m.event_at),false),version=version+1 WHERE id=m.conversation_id;
 END IF;
END $$;
-- Each event is stored and processed atomically; retrying acknowledgment is idempotent.
CREATE FUNCTION public.inbox_ingest(p_event jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c inbox_conversations; page_ text:=p_event->>'page_id'; customer_ text:=p_event->>'customer_id'; at_ timestamptz:=(p_event->>'at')::timestamptz;
 kind_ text:=p_event->>'kind'; key_ text; inserted_ uuid; m inbox_messages; incoming_ boolean:=p_event->>'direction'='in'; request_ uuid:=CASE WHEN p_event->>'direction'='out' THEN nullif(p_event->>'request_id','')::uuid ELSE NULL END;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM inbox_page_capabilities k JOIN fbl_pages p USING(page_id) WHERE k.page_id=page_ AND k.enabled AND p.status<>'disconnected') THEN RETURN; END IF;
 IF page_!~'^\d{1,40}$' OR customer_!~'^\d{1,40}$' OR at_>now()+interval '5 minutes' OR kind_ NOT IN ('message','delivery','read') THEN RAISE EXCEPTION 'Invalid event'; END IF;
 key_:=page_||':'||customer_||':'||kind_||':'||coalesce(p_event->>'mid',p_event->>'watermark')||':'||coalesce((p_event->'mids')::text,'');
 INSERT INTO inbox_events(event_key,page_id,payload) VALUES(key_,page_,p_event) ON CONFLICT DO NOTHING RETURNING id INTO inserted_;
 IF inserted_ IS NULL THEN RETURN; END IF;
 INSERT INTO inbox_conversations(page_id,customer_id,last_at,needs_reply) VALUES(page_,customer_,at_,false) ON CONFLICT DO NOTHING;
 SELECT * INTO c FROM inbox_conversations WHERE page_id=page_ AND customer_id=customer_ FOR UPDATE;
 IF kind_='message' THEN
 IF nullif(p_event->>'mid','') IS NULL THEN RAISE EXCEPTION 'Missing mid'; END IF;
 SELECT * INTO m FROM inbox_messages WHERE request_id=request_ AND page_id=page_ AND conversation_id=c.id AND direction='out' FOR UPDATE;
 IF m.id IS NOT NULL THEN
 UPDATE inbox_messages SET mid=p_event->>'mid',event_at=at_,state=CASE WHEN state='read' OR c.read_at>=at_ THEN 'read' WHEN state='delivered' OR c.delivered_at>=at_ THEN 'delivered' ELSE 'accepted' END WHERE id=m.id;
 ELSE
 INSERT INTO inbox_messages(conversation_id,page_id,mid,direction,text,attachments,event_at,state) VALUES(c.id,page_,p_event->>'mid',CASE WHEN incoming_ THEN 'in' ELSE 'out' END,left(p_event->>'text',20000),coalesce(p_event->'attachments','[]'),at_,CASE WHEN incoming_ THEN 'received' WHEN c.read_at>=at_ THEN 'read' WHEN c.delivered_at>=at_ THEN 'delivered' ELSE 'accepted' END) ON CONFLICT(page_id,mid) DO NOTHING;
 END IF;
 UPDATE inbox_conversations SET last_incoming_at=CASE WHEN incoming_ THEN greatest(last_incoming_at,at_) ELSE last_incoming_at END,last_outgoing_at=CASE WHEN NOT incoming_ THEN greatest(last_outgoing_at,at_) ELSE last_outgoing_at END,
 last_text=CASE WHEN at_>=last_at OR (c.last_incoming_at IS NULL AND c.last_outgoing_at IS NULL) THEN left(p_event->>'text',500) ELSE last_text END,last_at=CASE WHEN c.last_incoming_at IS NULL AND c.last_outgoing_at IS NULL THEN at_ ELSE greatest(last_at,at_) END,resolved=CASE WHEN incoming_ AND (last_incoming_at IS NULL OR at_>last_incoming_at) THEN false ELSE resolved END,version=version+1 WHERE id=c.id;
 UPDATE inbox_conversations SET needs_reply=last_incoming_at IS NOT NULL AND (last_outgoing_at IS NULL OR last_incoming_at>last_outgoing_at) WHERE id=c.id;
 ELSE
 UPDATE inbox_conversations SET delivered_at=CASE WHEN kind_='delivery' THEN greatest(delivered_at,(p_event->>'watermark')::timestamptz) ELSE delivered_at END,read_at=CASE WHEN kind_='read' THEN greatest(read_at,(p_event->>'watermark')::timestamptz) ELSE read_at END WHERE id=c.id;
 UPDATE inbox_messages SET state=CASE WHEN kind_='read' THEN 'read' WHEN state='read' THEN state ELSE 'delivered' END WHERE conversation_id=c.id AND direction='out' AND mid IS NOT NULL AND state IN ('accepted','delivered','read','sending','unknown') AND (event_at<=(p_event->>'watermark')::timestamptz OR mid IN (SELECT jsonb_array_elements_text(p_event->'mids')));
 END IF;
 UPDATE inbox_events SET processed_at=now() WHERE id=inserted_;
 UPDATE inbox_page_capabilities SET last_event_at=greatest(last_event_at,at_) WHERE page_id=page_;
END $$;
CREATE FUNCTION public.inbox_installed() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT true $$;
CREATE FUNCTION public.inbox_capabilities_save(p_page text,p_lead boolean,p_messaging boolean,p_ready boolean,p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO inbox_page_capabilities(page_id,lead_enabled,lead_enabled_at,enabled,ready,reason,checked_at)
 VALUES(p_page,p_lead,CASE WHEN p_lead THEN now() ELSE NULL END,p_messaging,p_ready,left(p_reason,300),now())
 ON CONFLICT(page_id) DO UPDATE SET lead_enabled=excluded.lead_enabled,
 lead_enabled_at=CASE WHEN NOT inbox_page_capabilities.lead_enabled AND p_lead THEN now() ELSE inbox_page_capabilities.lead_enabled_at END,
 enabled=excluded.enabled,ready=excluded.ready,reason=excluded.reason,checked_at=excluded.checked_at;
END $$;
CREATE FUNCTION public.inbox_connection_save(p_page text,p_name text,p_token text,p_lead boolean,p_messaging boolean,p_tasks text[],p_ready boolean,p_reason text,p_actor uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT private.is_active(p_actor) THEN RAISE EXCEPTION 'Inactive actor'; END IF;
 INSERT INTO fbl_pages(page_id,name,status,connected_by,subscribed,checked_at,updated_at) VALUES(p_page,p_name,'connected',p_actor,p_lead,now(),now())
 ON CONFLICT(page_id) DO UPDATE SET name=excluded.name,status='connected',status_detail=NULL,subscribed=excluded.subscribed,checked_at=now(),updated_at=now();
 IF p_token IS NOT NULL THEN
 INSERT INTO fbl_page_tokens(page_id,token_enc,updated_at) VALUES(p_page,p_token,now()) ON CONFLICT(page_id) DO UPDATE SET token_enc=excluded.token_enc,updated_at=now();
 END IF;
 PERFORM inbox_capabilities_save(p_page,p_lead,p_messaging,p_ready,p_reason);
 UPDATE inbox_page_capabilities SET tasks=p_tasks WHERE page_id=p_page;
 INSERT INTO inbox_audit(actor_id,page_id,action,after_data) VALUES(p_actor,p_page,'features',jsonb_build_object('lead',p_lead,'messaging',p_messaging));
END $$;
DO $$ DECLARE f regprocedure; BEGIN
 FOR f IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'inbox_%' LOOP
 EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated',f);
 EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f);
 IF f::text NOT LIKE '%inbox_ingest(%' AND f::text NOT LIKE '%inbox_send_finish(%' AND f::text NOT LIKE '%inbox_capabilities_save(%' AND f::text NOT LIKE '%inbox_connection_save(%' THEN EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f); END IF;
 END LOOP;
END $$;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_conversations,public.inbox_messages,public.inbox_page_capabilities,public.inbox_page_access;
 END IF;
END $$;

