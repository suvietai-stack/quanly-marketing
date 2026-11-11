-- Vá 0331: chỉ loại quyền Role khỏi phép tính khi tài khoản THẬT SỰ có quyền riêng chế độ 'replace'.
-- Tài khoản không có quyền riêng vẫn tính quyền Role như trước.
CREATE OR REPLACE FUNCTION private.cleanup_account_eval(_user uuid, _cfg jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  removable text[]; lost text[]; before_p text[]; after_p text[];
  role_p text[]; kept_p text[]; allow_p text[]; deny_p text[]; ovr_p text[];
  roles_json jsonb; rules jsonb; status text; grp text;
  has_custom boolean; is_sa boolean; is_biz boolean; pending int;
  has_org boolean; has_spec boolean; reasons text[] := '{}'; ovr_mode text := 'replace';
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
    IF has_custom THEN SELECT coalesce(permissions, '{}'), mode INTO ovr_p, ovr_mode FROM user_permission_overrides WHERE user_id = _user AND use_custom; END IF;
    SELECT coalesce(array_agg(DISTINCT p), '{}') INTO role_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = _user;
    SELECT coalesce(array_agg(DISTINCT p), '{}') INTO kept_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = _user AND private.cleanup_role_protected(ur.role_id);
    rules := private.base_rules(_user, _cfg);
    SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO allow_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'ALLOW';
    SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO deny_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'DENY';
    allow_p := ARRAY(SELECT p FROM unnest(allow_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
    deny_p := ARRAY(SELECT p FROM unnest(deny_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
    before_p := ARRAY(SELECT DISTINCT p FROM unnest((CASE WHEN has_custom AND ovr_mode='replace' THEN '{}' ELSE role_p END) || ovr_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
    after_p := ARRAY(SELECT DISTINCT p FROM unnest((CASE WHEN has_custom AND ovr_mode='replace' THEN '{}' ELSE kept_p END) || ovr_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
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
    'override_mode', ovr_mode,
    'pending_work', pending
  );
END $$;
REVOKE ALL ON FUNCTION private.cleanup_account_eval(uuid, jsonb) FROM PUBLIC, anon, authenticated, service_role;