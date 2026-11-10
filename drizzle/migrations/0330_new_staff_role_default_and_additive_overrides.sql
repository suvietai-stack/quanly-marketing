-- Chuẩn hóa phân quyền: Role nền "Nhân sự mới", duyệt tài khoản mặc định gán Role nền,
-- quyền bổ sung cá nhân chạy song song (cộng thêm, không thay thế Role).

-- 1) Role nền: chỉ quyền cơ bản — xem/nhận/cập nhật công việc cá nhân được giao.
INSERT INTO app_roles(id, name, description, permissions, is_system, biz_scope, biz_detail_exception, biz_settings_disabled, signal_scope, signal_scope_all)
VALUES ('role-nhan-su-moi', 'Nhân sự mới', 'Role nền cho tài khoản mới: quyền cơ bản, chưa có quyền nghiệp vụ chuyên môn.',
  ARRAY['task.view_mine', 'task.view_created_by_me', 'task.accept', 'task.update_status', 'task.complete', 'task.add_note'],
  true, 'assigned', false, false, '{}', false)
ON CONFLICT (id) DO NOTHING;

-- 2) Duyệt tài khoản: không chỉ định Role thì mặc định gán "Nhân sự mới".
CREATE OR REPLACE FUNCTION public.account_approve(_target uuid,_role text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$ DECLARE p profiles;confirmed boolean;has_password boolean;banned boolean;BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT (private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.account_approve')) THEN RAISE EXCEPTION 'Không có quyền duyệt tài khoản.' USING ERRCODE='42501';END IF;
 SELECT * INTO p FROM profiles WHERE id=_target FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hồ sơ.';END IF;
 IF p.status<>'Chờ duyệt' THEN RAISE EXCEPTION 'Tài khoản không còn chờ duyệt. Vui lòng tải lại.';END IF;
 SELECT email_confirmed_at IS NOT NULL,coalesce(encrypted_password,'')<>'',coalesce(banned_until>now(),false) INTO confirmed,has_password,banned FROM auth.users WHERE id=_target;
 IF NOT FOUND OR NOT has_password OR banned THEN RAISE EXCEPTION 'Tài khoản xác thực chưa sẵn sàng. Vui lòng kiểm tra trạng thái xác thực.';END IF;
 IF _role IS NOT NULL THEN
  IF NOT(private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.assign_role')) THEN RAISE EXCEPTION 'Không có quyền gán role.' USING ERRCODE='42501';END IF;
  IF _role IN ('role-super-admin','role-admin') AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được gán role quản trị.' USING ERRCODE='42501';END IF;
  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=_role) THEN RAISE EXCEPTION 'Role không tồn tại.';END IF;
  DELETE FROM user_roles WHERE user_id=_target;INSERT INTO user_roles(user_id,role_id) VALUES(_target,_role);
 ELSE
  DELETE FROM user_roles WHERE user_id=_target;INSERT INTO user_roles(user_id,role_id) VALUES(_target,'role-nhan-su-moi');
 END IF;
 UPDATE profiles SET status='Đang hoạt động' WHERE id=_target;
 INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(auth.uid(),_target,'approve_account');
 RETURN jsonb_build_object('ok',true,'emailConfirmed',confirmed,'ready',confirmed);END;$$;
REVOKE ALL ON FUNCTION public.account_approve(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.account_approve(uuid,text) TO authenticated;

-- 3) Quyền bổ sung cá nhân cộng thêm song song với quyền Role, không thay thế.
CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid,_permission text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.is_active(_user_id) AND (private.is_super_admin(_user_id) OR CASE
 WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id,_permission)='DENY' THEN false
 WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id,_permission)='ALLOW' THEN true
 ELSE EXISTS(SELECT 1 FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE ur.user_id=_user_id AND _permission=ANY(r.permissions))
   OR EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=_user_id AND o.use_custom=true AND _permission=ANY(o.permissions)) END) $$;

-- 4) Đồng bộ ngữ nghĩa cộng thêm vào công cụ chuyển đổi quyền: quyền bổ sung giữ nguyên cả trước lẫn sau.
CREATE OR REPLACE FUNCTION private.cleanup_account_eval(_user uuid, _cfg jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  removable text[]; lost text[]; before_p text[]; after_p text[];
  role_p text[]; kept_p text[]; allow_p text[]; deny_p text[]; ovr_p text[];
  roles_json jsonb; rules jsonb; status text; grp text;
  has_custom boolean; is_sa boolean; is_biz boolean; pending int;
  has_org boolean; has_spec boolean; reasons text[] := '{}';
BEGIN
  is_sa := private.is_super_admin(_user);
  has_custom := EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = _user AND o.use_custom);
  is_biz := private.cleanup_is_biz_staff(_user);
  pending := private.cleanup_pending_work(_user);
  has_org := EXISTS (SELECT 1 FROM org_assignments oa WHERE oa.user_id = _user AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now()));
  has_spec := EXISTS (SELECT 1 FROM mkt_staff_specialties s WHERE s.user_id = _user AND s.state = 'active');
  SELECT coalesce(jsonb_agg(jsonb_build_object('role_id', r.id, 'name', r.name, 'protected', private.cleanup_role_protected(r.id)) ORDER BY r.name), '[]'::jsonb),
         coalesce(array_agg(r.id) FILTER (WHERE NOT private.cleanup_role_protected(r.id)), '{}')
  INTO roles_json, removable
  FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = _user;

  lost := '{}'; role_p := '{}'; kept_p := '{}'; ovr_p := '{}';
  IF NOT is_sa AND array_length(removable, 1) IS NOT NULL THEN
    IF has_custom THEN SELECT coalesce(permissions, '{}') INTO ovr_p FROM user_permission_overrides WHERE user_id = _user AND use_custom; END IF;
    SELECT coalesce(array_agg(DISTINCT p), '{}') INTO role_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = _user;
    SELECT coalesce(array_agg(DISTINCT p), '{}') INTO kept_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = _user AND private.cleanup_role_protected(ur.role_id);
    rules := private.base_rules(_user, _cfg);
    SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO allow_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'ALLOW';
    SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO deny_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'DENY';
    allow_p := ARRAY(SELECT p FROM unnest(allow_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
    deny_p := ARRAY(SELECT p FROM unnest(deny_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
    before_p := ARRAY(SELECT DISTINCT p FROM unnest(role_p || ovr_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
    after_p := ARRAY(SELECT DISTINCT p FROM unnest(kept_p || ovr_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
    lost := ARRAY(SELECT p FROM unnest(before_p) p WHERE NOT (p = ANY (after_p)) ORDER BY 1);
  END IF;

  grp := CASE WHEN is_sa THEN 'A' WHEN is_biz AND array_length(removable, 1) IS NOT NULL THEN 'D' WHEN is_biz THEN 'B' ELSE 'C' END;

  IF is_sa THEN
    status := 'protected'; reasons := ARRAY['Tài khoản quản trị hệ thống luôn được bảo vệ'];
  ELSIF is_biz THEN
    status := 'protected'; reasons := ARRAY['Nhân sự Kinh doanh (membership/bổ nhiệm/kiêm nhiệm còn hiệu lực) — giữ nguyên toàn bộ quyền trong đợt này'];
  ELSIF array_length(removable, 1) IS NULL THEN
    status := 'protected'; reasons := ARRAY['Không có Role trực tiếp nào thuộc diện chuyển đổi'];
  ELSE
    IF has_custom THEN reasons := reasons || ARRAY['Tài khoản có quyền bổ sung riêng — cần Admin xử lý thủ công, hệ thống không tự gỡ']; END IF;
    IF array_length(lost, 1) IS NOT NULL THEN reasons := reasons || ARRAY[format('Còn %s quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng', array_length(lost, 1))]; END IF;
    IF array_length(role_p, 1) IS NOT NULL AND NOT has_org AND NOT has_spec THEN reasons := reasons || ARRAY['Chưa được bổ nhiệm chức vụ hoặc giao nhiệm vụ chuyên môn nào còn hiệu lực']; END IF;
    IF pending > 0 THEN reasons := reasons || ARRAY[format('Có %s công việc đang chờ xử lý phụ thuộc quyền hiện tại', pending)]; END IF;
    status := CASE WHEN array_length(reasons, 1) IS NULL THEN 'ready' ELSE 'review' END;
    IF status = 'ready' THEN reasons := ARRAY['Đủ điều kiện: mọi quyền từ Role cũ đã có nguồn thay thế đã kiểm chứng']; END IF;
  END IF;

  RETURN jsonb_build_object(
    'user_id', _user, 'group', grp, 'status', status, 'reasons', to_jsonb(reasons),
    'roles', roles_json,
    'removable', coalesce((SELECT jsonb_agg(x ORDER BY x) FROM unnest(removable) x), '[]'::jsonb),
    'lost', coalesce((SELECT jsonb_agg(x ORDER BY x) FROM unnest(lost) x), '[]'::jsonb),
    'appointment_sources', jsonb_array_length(private.org_role_rules(_user, _cfg)),
    'specialty_sources', jsonb_array_length(private.mkt_specialty_rules(_user, '{}'::jsonb)),
    'has_custom_override', has_custom,
    'pending_work', pending
  );
END $$;
REVOKE ALL ON FUNCTION private.cleanup_account_eval(uuid, jsonb) FROM PUBLIC, anon, authenticated, service_role;