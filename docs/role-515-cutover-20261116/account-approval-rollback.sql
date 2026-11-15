-- STAGED rollback; do not execute without approval of this exact version.
BEGIN;
LOCK TABLE public.user_roles,public.profiles IN SHARE ROW EXCLUSIVE MODE;
DO $restore$
DECLARE b private.role_515_approval_backup;
BEGIN
 SELECT * INTO b FROM private.role_515_approval_backup
 WHERE id='role-515-approval-20261116' FOR UPDATE;
 IF NOT FOUND OR b.status<>'applied' OR b.old_md5<>'e374f12498c68c720bdffed4c8289941'
 OR md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure))
 IS DISTINCT FROM b.new_md5
 THEN RAISE EXCEPTION 'STOP: approval function changed or backup missing'; END IF;
 IF (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
 THEN RAISE EXCEPTION 'STOP: protected Super Admin assignments changed'; END IF;
 EXECUTE b.old_definition;
 IF md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure))<>b.old_md5
 THEN RAISE EXCEPTION 'STOP: approval function restore mismatch'; END IF;
 UPDATE private.role_515_approval_backup
 SET status='rolled_back',rolled_back_at=clock_timestamp()
 WHERE id='role-515-approval-20261116';
END; $restore$;
COMMIT;
