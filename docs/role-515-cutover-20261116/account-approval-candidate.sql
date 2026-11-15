-- STAGED: REVIEW + BACKUP before any production execution. 515 permission catalog only.
BEGIN;
LOCK TABLE public.user_roles, public.profiles IN SHARE ROW EXCLUSIVE MODE;
DO $preflight$
BEGIN
 IF (SELECT count(*) FROM public.base_permission_catalog)<>515
 OR (SELECT count(*) FROM private.permission_editor_policy())<>515
 OR NOT EXISTS (SELECT 1 FROM information_schema.columns
   WHERE table_schema='public' AND table_name='user_permission_overrides'
   AND column_name='denied_permissions')
 THEN RAISE EXCEPTION 'STOP: 515 permission resolver drift'; END IF;
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2)<>26
 OR (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2 AND role_kind='common')<>1
 THEN RAISE EXCEPTION 'STOP: canonical Role baseline drift'; END IF;
 IF (SELECT count(*) FROM public.user_roles)<>2
 OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
 THEN RAISE EXCEPTION 'STOP: protected direct assignment count changed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.account_approve(uuid,text)'::regprocedure
 AND md5(pg_get_functiondef(oid))='e374f12498c68c720bdffed4c8289941'
 AND pg_get_userbyid(proowner)='postgres'
 AND proacl::text='{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}')
 THEN RAISE EXCEPTION 'STOP: approval function/owner/ACL drift'; END IF;
 IF to_regclass('private.role_515_approval_backup') IS NOT NULL
 THEN RAISE EXCEPTION 'STOP: backup already exists'; END IF;
END; $preflight$;

CREATE TABLE private.role_515_approval_backup(
 id text PRIMARY KEY,
 old_definition text NOT NULL,
 old_md5 text NOT NULL,
 new_md5 text,
 status text NOT NULL DEFAULT 'applied'
  CHECK (status IN ('applied','rolled_back')),
 captured_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 rolled_back_at timestamptz
);
REVOKE ALL ON TABLE private.role_515_approval_backup FROM PUBLIC, anon, authenticated;
INSERT INTO private.role_515_approval_backup(id,old_definition,old_md5)
SELECT 'role-515-approval-20261116',
 pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure),
 md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure));

CREATE OR REPLACE FUNCTION public.account_approve(_target uuid, _role text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$ DECLARE p profiles;confirmed boolean;has_password boolean;banned boolean;BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT (private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.account_approve')) THEN RAISE EXCEPTION 'Không có quyền duyệt tài khoản.' USING ERRCODE='42501';END IF;
 SELECT * INTO p FROM profiles WHERE id=_target FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hồ sơ.';END IF;
 IF p.status<>'Chờ duyệt' THEN RAISE EXCEPTION 'Tài khoản không còn chờ duyệt. Vui lòng tải lại.';END IF;
 SELECT email_confirmed_at IS NOT NULL,coalesce(encrypted_password,'')<>'',coalesce(banned_until>now(),false) INTO confirmed,has_password,banned FROM auth.users WHERE id=_target;
 IF NOT FOUND OR NOT has_password OR banned THEN RAISE EXCEPTION 'Tài khoản xác thực chưa sẵn sàng. Vui lòng kiểm tra trạng thái xác thực.';END IF;
 IF _role IS NOT NULL THEN
  RAISE EXCEPTION 'Không gán Role trực tiếp khi duyệt tài khoản. Hãy bổ nhiệm qua sơ đồ tổ chức.' USING ERRCODE='42501';
 END IF;
 UPDATE profiles SET status='Đang hoạt động' WHERE id=_target;
 INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(auth.uid(),_target,'approve_account');
 RETURN jsonb_build_object('ok',true,'emailConfirmed',confirmed,'ready',confirmed);END;$function$;


UPDATE private.role_515_approval_backup SET
 new_md5=md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure))
WHERE id='role-515-approval-20261116';
DO $post$
BEGIN
 IF (SELECT count(*) FROM private.role_515_approval_backup
   WHERE id='role-515-approval-20261116' AND old_md5='e374f12498c68c720bdffed4c8289941'
   AND new_md5 IS NOT NULL AND new_md5<>old_md5 AND status='applied')<>1
 OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
 THEN RAISE EXCEPTION 'STOP: post-apply check failed'; END IF;
END; $post$;
COMMIT;
