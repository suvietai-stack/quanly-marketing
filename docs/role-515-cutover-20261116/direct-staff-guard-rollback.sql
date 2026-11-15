-- STAGED rollback. Does not alter protected direct Super Admin assignments.
BEGIN;
LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
DO $guard$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger
    WHERE tgrelid='public.user_roles'::regclass
      AND tgname='role_515_direct_staff_guard' AND tgenabled='O')
 OR position('Không gán Role nhân viên trực tiếp' IN
    pg_get_functiondef('private.role_515_direct_staff_guard()'::regprocedure))=0
 THEN RAISE EXCEPTION 'STOP: direct Role guard drift'; END IF;
END; $guard$;
DROP TRIGGER role_515_direct_staff_guard ON public.user_roles;
DROP FUNCTION private.role_515_direct_staff_guard();
COMMIT;
