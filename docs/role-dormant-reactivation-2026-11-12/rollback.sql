-- Rollback for staged dormant reactivation. Refuses while any explicitly
-- reactivated permission is still in force; first remove it via audited Role editor.
BEGIN;
LOCK TABLE public.app_roles IN SHARE ROW EXCLUSIVE MODE;
DO $guard$
BEGIN
 IF to_regclass('private.role_permission_reactivation_backup') IS NULL
 OR NOT EXISTS(SELECT 1 FROM private.role_permission_reactivation_backup
   WHERE id='role-dormant-reactivation-2026-11-12')
 THEN RAISE EXCEPTION 'STOP: reactivation backup absent'; END IF;
 IF EXISTS(SELECT 1 FROM private.role_permission_reactivation)
 THEN RAISE EXCEPTION 'STOP: rollback would silently revoke explicitly reactivated Role permissions'; END IF;
END;
$guard$;
DROP TRIGGER app_roles_track_permission_reactivation ON public.app_roles;
DO $restore$
DECLARE d text;
BEGIN
 SELECT original_fence_definition INTO d FROM private.role_permission_reactivation_backup
 WHERE id='role-dormant-reactivation-2026-11-12';
 EXECUTE d;
 IF md5(pg_get_functiondef('private.universal_dormant_fence(text,text)'::regprocedure)) <>
    (SELECT original_fence_sha FROM private.role_permission_reactivation_backup
     WHERE id='role-dormant-reactivation-2026-11-12')
 THEN RAISE EXCEPTION 'STOP: original dormant fence was not restored exactly'; END IF;
END;
$restore$;
DROP FUNCTION private.track_role_permission_reactivation();
DROP TABLE private.role_permission_reactivation;
DROP TABLE private.role_permission_initial_dormant;
DROP TABLE private.role_permission_reactivation_backup;
COMMIT;
