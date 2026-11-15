-- STAGED rollback: restore only the backed-up V1 Roles and inactive links.
-- Requires elevated migration role and ACCESS EXCLUSIVE table lock.
BEGIN;
LOCK TABLE public.app_roles IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.base_title_role_links,public.user_roles IN SHARE ROW EXCLUSIVE MODE;
DO $preflight$
DECLARE b private.role_515_legacy_backup;
BEGIN
 SELECT * INTO b FROM private.role_515_legacy_backup
  WHERE id='role-515-retirement-20261116' FOR UPDATE;
 IF NOT FOUND OR b.status<>'retired'
 OR b.original_roles_md5<>'6de25f7bbb1f9cbe4df96e5e5944c861'
 OR b.original_links_md5<>'b2ba1d705627b5e25f07927e23107d48'
 OR jsonb_array_length(b.roles_json)<>29
 OR jsonb_array_length(b.title_links_json)<>17
 THEN RAISE EXCEPTION 'STOP: V1 backup missing/corrupt/already restored'; END IF;
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1)<>2
 OR (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2)<>26
 OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
 THEN RAISE EXCEPTION 'STOP: role catalog changed after retirement'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.roles_json) x
     JOIN public.app_roles r ON r.id=x->>'id')
 OR EXISTS(SELECT 1 FROM jsonb_array_elements(b.title_links_json) x
     JOIN public.base_title_role_links l ON l.id=(x->>'id')::uuid)
 THEN RAISE EXCEPTION 'STOP: collision with newly created Roles or title links'; END IF;
END; $preflight$;

SELECT set_config('app.role_reason','Role 515: restore exact old catalog from backup',true);
-- Disable only the NEW-ROLE validation trigger inside this locked transaction.
-- Historical exact Role payload may include admin keys; never grant them on reinsert.
-- All DDL/row writes roll back together if any statement fails.
ALTER TABLE public.app_roles DISABLE TRIGGER role_new_empty_guard;
INSERT INTO public.app_roles
SELECT (jsonb_populate_record(NULL::public.app_roles,x)).*
FROM private.role_515_legacy_backup b,
 LATERAL jsonb_array_elements(b.roles_json) x
WHERE b.id='role-515-retirement-20261116' AND b.status='retired';
ALTER TABLE public.app_roles ENABLE TRIGGER role_new_empty_guard;

INSERT INTO public.base_title_role_links
SELECT (jsonb_populate_record(NULL::public.base_title_role_links,x)).*
FROM private.role_515_legacy_backup b,
 LATERAL jsonb_array_elements(b.title_links_json) x
WHERE b.id='role-515-retirement-20261116' AND b.status='retired';

UPDATE private.role_515_legacy_backup
 SET status='rolled_back', rolled_back_at=clock_timestamp()
WHERE id='role-515-retirement-20261116' AND status='retired';

DO $verify$
BEGIN
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1)<>31
 OR (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2)<>26
 OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
 OR (SELECT md5(coalesce(string_agg(to_jsonb(r)::text,'|' ORDER BY r.id),''))
   FROM public.app_roles r WHERE r.catalog_generation=1
   AND r.id NOT IN ('role-super-admin','role-admin'))<>'6de25f7bbb1f9cbe4df96e5e5944c861'
 OR (SELECT md5(coalesce(string_agg(to_jsonb(l)::text,'|' ORDER BY l.id),''))
   FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id
   WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))<>'b2ba1d705627b5e25f07927e23107d48'
 OR NOT EXISTS(SELECT 1 FROM pg_trigger
   WHERE tgrelid='public.app_roles'::regclass
    AND tgname='role_new_empty_guard' AND tgenabled='O')
 THEN RAISE EXCEPTION 'STOP: V1 rollback validation failed'; END IF;
END; $verify$;
COMMIT;
