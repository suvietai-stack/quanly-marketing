-- STAGED ONLY: 12-Nov-2026. Requires prior, separately approved role-permission-full candidate (510-key)
-- One transactional, explicit deletion of 29 V1 roles and 17 INACTIVE title links.
-- Does NOT alter staff org assignments, Role V2, Marketing specialties, common rights,
-- personal overrides, user_roles (only two Super Admin assignments exist at snapshot), or business records.
-- All deleted rows and exact old account_approve definition are snapshotted in a private, non-client-readable table.
BEGIN;
LOCK TABLE public.app_roles, public.user_roles, public.base_title_role_links,
 public.org_position_roles, public.org_position_slots, public.mkt_specialties,
 public.biz_access_exceptions IN SHARE ROW EXCLUSIVE MODE;

DO $preflight$
DECLARE role_md5 text; links_md5 text; approval_md5 text; n integer;
BEGIN
 IF to_regprocedure('private.universal_permission_ready(text)') IS NULL
    OR NOT EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_permission_overrides' AND column_name='denied_permissions')
 THEN RAISE EXCEPTION 'STOP: 510-key Role migration must be approved and applied BEFORE retiring V1 Roles'; END IF;

 SELECT count(*), md5(coalesce(string_agg(to_jsonb(r)::text,'|' ORDER BY r.id),''))
   INTO n,role_md5 FROM public.app_roles r
   WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin');
 IF n<>29 OR role_md5<>'6de25f7bbb1f9cbe4df96e5e5944c861'
 THEN RAISE EXCEPTION 'STOP: V1 Role snapshot changed (count %, md5 %)',n,role_md5; END IF;

 SELECT count(*), md5(coalesce(string_agg(to_jsonb(l)::text,'|' ORDER BY l.id),''))
 INTO n,links_md5 FROM public.base_title_role_links l
 JOIN public.app_roles r ON r.id=l.role_id
 WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin');
 IF n<>17 OR links_md5<>'b2ba1d705627b5e25f07927e23107d48'
 THEN RAISE EXCEPTION 'STOP: legacy title links changed (count %, md5 %)',n,links_md5; END IF;

 IF EXISTS(SELECT 1 FROM public.base_title_role_links l
     JOIN public.app_roles r ON r.id=l.role_id
     WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin') AND l.active)
 THEN RAISE EXCEPTION 'STOP: some legacy title Role links are active'; END IF;

 IF EXISTS(SELECT 1 FROM public.user_roles u JOIN public.app_roles r ON r.id=u.role_id
     WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.org_position_roles p JOIN public.app_roles r ON r.id=p.role_id
     WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.org_position_slots p JOIN public.app_roles r ON r.id=p.role_id
     WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.mkt_specialties p JOIN public.app_roles r ON r.id=p.role_id
     WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.biz_access_exceptions p JOIN public.app_roles r ON r.id=p.role_id
     WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 THEN RAISE EXCEPTION 'STOP: a legacy Role is referenced by a live assignment or business exception'; END IF;

 IF (SELECT count(*) FROM public.user_roles)<>2
    OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
    OR NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id='role-admin' AND is_system)
    OR NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id='role-super-admin' AND is_system)
 THEN RAISE EXCEPTION 'STOP: protected system and direct-assignment baseline changed'; END IF;
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2 AND role_kind='common')<>1
    OR (SELECT count(*) FROM public.org_position_roles)<>21
    OR (SELECT count(*) FROM public.mkt_specialties WHERE role_id IN
      (SELECT id FROM public.app_roles WHERE catalog_generation=2))<>7
 THEN RAISE EXCEPTION 'STOP: canonical Role or position/task assignment baseline changed'; END IF;

 SELECT md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure)) INTO approval_md5;
 IF approval_md5<>'e374f12498c68c720bdffed4c8289941'
 THEN RAISE EXCEPTION 'STOP: account approval RPC changed (md5 %)',approval_md5; END IF;
END;
$preflight$;

CREATE TABLE IF NOT EXISTS private.role_v1_retirement_backup (
 run_id text PRIMARY KEY,
 snapshot_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 roles_json jsonb NOT NULL,
 title_links_json jsonb NOT NULL,
 account_approve_before text NOT NULL,
 role_md5 text NOT NULL,
 title_links_md5 text NOT NULL,
 status text NOT NULL DEFAULT 'retired',
 rolled_back_at timestamptz,
 CONSTRAINT role_v1_retirement_status CHECK (status IN ('retired','rolled_back'))
);
REVOKE ALL ON TABLE private.role_v1_retirement_backup FROM PUBLIC, anon, authenticated;
INSERT INTO private.role_v1_retirement_backup
 (run_id,roles_json,title_links_json,account_approve_before,role_md5,title_links_md5)
SELECT 'role-v1-retirement-2026-11-12',
 (SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id),'[]'::jsonb) FROM public.app_roles r
  WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')),
 (SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.id),'[]'::jsonb)
  FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id
  WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')),
 pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure),
 '6de25f7bbb1f9cbe4df96e5e5944c861','b2ba1d705627b5e25f07927e23107d48';

-- An approved account starts with COMMON rights only; position and task rights follow real org assignments.
-- Neither the caller nor the old client can force a manual Role during account approval.
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
 IF _role IS NOT NULL THEN RAISE EXCEPTION 'Tài khoản mới không gắn Role trực tiếp; cấp Role vị trí bằng Cơ cấu tổ chức.' USING ERRCODE='42501';END IF;
 UPDATE profiles SET status='Đang hoạt động' WHERE id=_target;
 INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(auth.uid(),_target,'approve_account');
 RETURN jsonb_build_object('ok',true,'emailConfirmed',confirmed,'ready',confirmed);END;$function$;

-- Remove inactive V1 title-link references explicitly, then obsolete V1 catalog.
-- Never CASCADE; FK conflicts fail and roll back all changes and the backup.
DELETE FROM public.base_title_role_links l
USING public.app_roles r
WHERE l.role_id=r.id AND r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')
 AND NOT l.active;
DO $check$ BEGIN
 IF (SELECT count(*) FROM public.base_title_role_links l
  JOIN public.app_roles r ON r.id=l.role_id
  WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))<>0
 THEN RAISE EXCEPTION 'STOP: legacy title link deletion incomplete'; END IF;
END $check$;
DELETE FROM public.app_roles r WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin');

DO $post$
BEGIN
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1)<>2
    OR (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2)<>26
    OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
    OR (SELECT count(*) FROM private.role_v1_retirement_backup
      WHERE run_id='role-v1-retirement-2026-11-12'
        AND jsonb_array_length(roles_json)=29
        AND jsonb_array_length(title_links_json)=17
        AND status='retired')<>1
 THEN RAISE EXCEPTION 'STOP: V1 Role cleanup verification failed'; END IF;
END;
$post$;
COMMIT;
