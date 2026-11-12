-- STAGED ONLY. Reverse EXACT role-v1-retirement-2026-11-12, not the 510-permission migration.
-- Refuses if recreated Role IDs, protected admins, or authenticated approver drift.
BEGIN;
LOCK TABLE public.app_roles, public.user_roles, public.base_title_role_links,
 public.org_position_roles, public.org_position_slots, public.mkt_specialties,
 public.biz_access_exceptions IN SHARE ROW EXCLUSIVE MODE;

DO $guard$
DECLARE backup_record private.role_v1_retirement_backup; approval_md5 text;
BEGIN
 SELECT * INTO backup_record FROM private.role_v1_retirement_backup
 WHERE run_id='role-v1-retirement-2026-11-12' FOR UPDATE;
 IF NOT FOUND OR backup_record.status<>'retired' OR jsonb_array_length(backup_record.roles_json)<>29
   OR jsonb_array_length(backup_record.title_links_json)<>17
 THEN RAISE EXCEPTION 'STOP: retirement backup missing, corrupt, or already rolled back'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(backup_record.roles_json) x
    JOIN public.app_roles r ON r.id=x->>'id')
 OR EXISTS(SELECT 1 FROM jsonb_array_elements(backup_record.title_links_json) x
    JOIN public.base_title_role_links l ON l.id=(x->>'id')::uuid)
 THEN RAISE EXCEPTION 'STOP: legacy ID collision; will not overwrite newly edited records'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id='role-super-admin' AND is_system)
    OR NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id='role-admin' AND is_system)
 THEN RAISE EXCEPTION 'STOP: protected Role changed'; END IF;
 SELECT md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure)) INTO approval_md5;
 -- Allow restoring only the original code or the deployed no-direct-Role version.
 IF approval_md5=md5(backup_record.account_approve_before) THEN
   RAISE EXCEPTION 'STOP: approval RPC already rolled back or replaced'; END IF;
 IF position('Tài khoản mới không gắn Role trực tiếp' IN pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure))=0
 THEN RAISE EXCEPTION 'STOP: account approval RPC was edited after retirement; review manually'; END IF;
END;
$guard$;

INSERT INTO public.app_roles
SELECT (jsonb_populate_record(NULL::public.app_roles, x)).*
FROM private.role_v1_retirement_backup b,
     LATERAL jsonb_array_elements(b.roles_json) x
WHERE b.run_id='role-v1-retirement-2026-11-12' AND b.status='retired';
INSERT INTO public.base_title_role_links
SELECT (jsonb_populate_record(NULL::public.base_title_role_links, x)).*
FROM private.role_v1_retirement_backup b,
     LATERAL jsonb_array_elements(b.title_links_json) x
WHERE b.run_id='role-v1-retirement-2026-11-12' AND b.status='retired';
-- Exact prior SECURITY DEFINER function, owner/ACL untouched by CREATE OR REPLACE.
DO $restore$
DECLARE old_def text;
BEGIN
 SELECT account_approve_before INTO old_def
 FROM private.role_v1_retirement_backup
 WHERE run_id='role-v1-retirement-2026-11-12' AND status='retired';
 EXECUTE old_def;
END;
$restore$;
UPDATE private.role_v1_retirement_backup SET status='rolled_back',rolled_back_at=clock_timestamp()
WHERE run_id='role-v1-retirement-2026-11-12' AND status='retired';
DO $post$
BEGIN
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1)<>31
 OR (SELECT count(*) FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id
      WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))<>17
 OR md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure))<>'e374f12498c68c720bdffed4c8289941'
 THEN RAISE EXCEPTION 'STOP: rollback verification failed'; END IF;
END;
$post$;
COMMIT;
