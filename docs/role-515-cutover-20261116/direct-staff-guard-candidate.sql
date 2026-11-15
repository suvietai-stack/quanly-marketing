-- STAGED. Apply AFTER role-515 account approval migration. Direct staff Role grants are retired.
BEGIN;
LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
DO $preflight$
BEGIN
 IF (SELECT count(*) FROM public.base_permission_catalog)<>515
 OR to_regclass('private.role_515_approval_backup') IS NULL
 THEN RAISE EXCEPTION 'STOP: 515 approval migration is not installed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM private.role_515_approval_backup
   WHERE id='role-515-approval-20261116' AND status='applied')
 THEN RAISE EXCEPTION 'STOP: no-direct approval migration not active'; END IF;
 IF (SELECT count(*) FROM public.user_roles WHERE role_id NOT IN ('role-super-admin','role-admin'))<>0
 THEN RAISE EXCEPTION 'STOP: existing direct staff Roles require manual migration'; END IF;
 IF to_regprocedure('private.role_515_direct_staff_guard()') IS NOT NULL
 OR EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.user_roles'::regclass
    AND tgname='role_515_direct_staff_guard' AND NOT tgisinternal)
 THEN RAISE EXCEPTION 'STOP: guard already installed'; END IF;
END; $preflight$;

CREATE OR REPLACE FUNCTION private.role_515_direct_staff_guard()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'public','private'
AS $function$
BEGIN
 -- The two protected administrative bootstrap Role IDs have their own identity,
 -- approval and hierarchy guards, which remain active and unchanged.
 IF NEW.role_id NOT IN ('role-super-admin','role-admin') THEN
   RAISE EXCEPTION 'Không gán Role nhân viên trực tiếp. Cấp Role qua sơ đồ tổ chức.'
     USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION private.role_515_direct_staff_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER role_515_direct_staff_guard
 BEFORE INSERT OR UPDATE ON public.user_roles
 FOR EACH ROW EXECUTE FUNCTION private.role_515_direct_staff_guard();

DO $post$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger
   WHERE tgrelid='public.user_roles'::regclass
     AND tgname='role_515_direct_staff_guard' AND tgenabled='O')
 THEN RAISE EXCEPTION 'STOP: direct staff Role guard missing'; END IF;
END; $post$;
COMMIT;
