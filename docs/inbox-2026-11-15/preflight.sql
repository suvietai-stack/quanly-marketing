-- Read-only checks. Execute in the same transaction as implementation.sql.
DO $$ BEGIN
 IF to_regclass('public.fbl_pages') IS NULL OR to_regclass('public.fbl_page_tokens') IS NULL OR to_regclass('public.base_permission_catalog') IS NULL THEN
  RAISE EXCEPTION 'Missing existing Facebook/permission foundation';
 END IF;
 IF to_regprocedure('private.has_permission(uuid,text)') IS NULL OR to_regprocedure('private.is_active(uuid)') IS NULL OR to_regprocedure('private.is_super_admin(uuid)') IS NULL THEN
  RAISE EXCEPTION 'Missing canonical permission helpers';
 END IF;
 IF to_regclass('public.inbox_conversations') IS NOT NULL OR to_regclass('public.inbox_page_capabilities') IS NOT NULL OR EXISTS(SELECT 1 FROM public.base_permission_catalog WHERE key LIKE 'inbox.%') THEN
  RAISE EXCEPTION 'Inbox already exists: compare version and use a reviewed incremental migration';
 END IF;
END $$;
