-- Non-destructive disable. Preserve conversations, events, tokens and audit history.
BEGIN;
UPDATE public.inbox_page_capabilities SET enabled=false,ready=false,reason='Hộp thư tạm dừng';
DO $$ DECLARE f regprocedure; BEGIN
 FOR f IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'inbox_%' LOOP
  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated,anon',f);
 END LOOP;
END $$;
COMMIT;
-- Then deploy the previous source revision. Do not DROP tables or remove tokens.
