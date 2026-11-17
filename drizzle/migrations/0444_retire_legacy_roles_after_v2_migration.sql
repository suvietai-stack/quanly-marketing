-- The V2 catalog is the only place for current position and marketing-task
-- Roles. Preserve old Role data in a protected snapshot before deletion.
-- Admin and Super Admin are system security identities, NOT legacy positions.
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
  IF NOT(private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.assign_role')) THEN RAISE EXCEPTION 'Không có quyền gán role.' USING ERRCODE='42501';END IF;
  IF _role IN ('role-super-admin','role-admin') AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được gán role quản trị.' USING ERRCODE='42501';END IF;
  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=_role AND catalog_state='standard') THEN RAISE EXCEPTION 'Chỉ gán Role thuộc danh mục chuẩn; Role cũ đã ngừng sử dụng.';END IF;
  INSERT INTO user_roles(user_id,role_id) SELECT _target,_role WHERE NOT EXISTS(SELECT 1 FROM user_roles WHERE user_id=_target AND role_id=_role);
 ELSE
  -- New active employees receive V2 common permissions automatically; no legacy role assignment.\n  NULL;
 END IF;
 UPDATE profiles SET status='Đang hoạt động' WHERE id=_target;
 INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(auth.uid(),_target,'approve_account');
 RETURN jsonb_build_object('ok',true,'emailConfirmed',confirmed,'ready',confirmed);END;$function$


DO $$
DECLARE old_count integer; snapshot_count integer;
BEGIN
  PERFORM set_config('app.role_reason','Đã chuyển liên kết và tập quyền sang Role V2; gỡ Role cũ theo yêu cầu quản trị',true);

  SELECT COUNT(*) INTO old_count FROM public.app_roles
  WHERE catalog_generation=1 AND role_kind<>'system'
    AND id NOT IN ('role-admin','role-super-admin');

  IF EXISTS(
    SELECT 1 FROM public.user_roles ur JOIN public.app_roles ar ON ar.id=ur.role_id
    WHERE ar.catalog_generation=1 AND ar.role_kind<>'system'
  ) THEN
    RAISE EXCEPTION 'Still have employee direct Role V1 assignments: migrate first';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.org_position_roles opr JOIN public.app_roles ar ON ar.id=opr.role_id
    WHERE ar.catalog_generation=1 AND ar.role_kind<>'system'
  ) THEN
    RAISE EXCEPTION 'Still have organization position Role V1 mappings: migrate first';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.org_position_slots s JOIN public.app_roles ar ON ar.id=s.role_id
    WHERE ar.catalog_generation=1 AND ar.role_kind<>'system'
  ) THEN
    RAISE EXCEPTION 'Still have active position slots linked to Role V1';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.mkt_specialties s JOIN public.app_roles ar ON ar.id=s.role_id
    WHERE ar.catalog_generation=1 AND ar.role_kind<>'system'
  ) THEN
    RAISE EXCEPTION 'Specialty still linked to Role V1';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.biz_access_exceptions s JOIN public.app_roles ar ON ar.id=s.role_id
    WHERE ar.catalog_generation=1 AND ar.role_kind<>'system'
  ) THEN
    RAISE EXCEPTION 'Business exception still linked to Role V1';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.base_title_role_links s JOIN public.app_roles ar ON ar.id=s.role_id
    WHERE ar.catalog_generation=1 AND ar.role_kind<>'system' AND s.active
  ) THEN
    RAISE EXCEPTION 'Active title-role legacy link found; do not delete';
  END IF;

  CREATE TABLE IF NOT EXISTS private.legacy_role_retirement_20261117 (
    role_id text PRIMARY KEY,
    role_before jsonb NOT NULL,
    links_before jsonb NOT NULL DEFAULT '[]'::jsonb,
    retired_at timestamptz NOT NULL DEFAULT now()
  );
  INSERT INTO private.legacy_role_retirement_20261117(role_id,role_before,links_before)
  SELECT ar.id,to_jsonb(ar),
    COALESCE((SELECT jsonb_agg(to_jsonb(link)) FROM public.base_title_role_links link WHERE link.role_id=ar.id),'[]'::jsonb)
  FROM public.app_roles ar
  WHERE ar.catalog_generation=1 AND ar.role_kind<>'system'
    AND ar.id NOT IN ('role-admin','role-super-admin')
  ON CONFLICT (role_id) DO NOTHING;

  SELECT COUNT(*) INTO snapshot_count FROM private.legacy_role_retirement_20261117;
  IF snapshot_count < old_count THEN
    RAISE EXCEPTION 'Legacy role snapshot incomplete: % of %',snapshot_count,old_count;
  END IF;

  -- Dormant legacy title links have a database constraint active=false.
  DELETE FROM public.base_title_role_links link
  USING public.app_roles ar
  WHERE link.role_id=ar.id AND ar.catalog_generation=1 AND ar.role_kind<>'system'
    AND ar.id NOT IN ('role-admin','role-super-admin')
    AND link.active=false;

  -- Two obsolete starter roles were mislabeled as "system" in generation 1,
  -- but are not security roles; safe to retire after account_approve changes.
  UPDATE public.app_roles SET is_system=false
    WHERE id IN ('role-nhan-su-moi','role-dong-hang') AND is_system;

  DELETE FROM public.app_roles ar
  WHERE ar.catalog_generation=1 AND ar.role_kind<>'system'
    AND ar.id NOT IN ('role-admin','role-super-admin');

  IF EXISTS(SELECT 1 FROM public.app_roles WHERE catalog_generation=1 AND role_kind<>'system') THEN
    RAISE EXCEPTION 'Old operational Role catalog still present';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id='role-super-admin' AND is_system)
    OR NOT EXISTS(SELECT 1 FROM public.app_roles WHERE id='role-admin' AND is_system) THEN
    RAISE EXCEPTION 'Security admin roles must remain intact';
  END IF;
END
$$;
