-- No customer messages are sent by validation.
DO $$ BEGIN
 IF has_function_privilege('authenticated','public.inbox_ingest(jsonb)','EXECUTE') OR has_function_privilege('authenticated','public.inbox_send_finish(uuid,text,text,text)','EXECUTE') OR has_function_privilege('anon','public.inbox_overview()','EXECUTE') THEN
  RAISE EXCEPTION 'Unsafe Inbox RPC grants';
 END IF;
 IF EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('inbox_messages','inbox_conversations','inbox_page_capabilities','inbox_page_access','inbox_reads','inbox_events','inbox_audit') AND NOT c.relrowsecurity) THEN
  RAISE EXCEPTION 'Missing Inbox RLS';
 END IF;
 IF (SELECT count(*) FROM public.base_permission_catalog WHERE key IN ('inbox.view','inbox.send','inbox.assign','inbox.resolve','inbox.manage'))<>5 THEN RAISE EXCEPTION 'Missing permission keys'; END IF;
END $$;
