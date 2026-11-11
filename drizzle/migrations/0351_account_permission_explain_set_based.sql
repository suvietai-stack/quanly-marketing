-- Sửa timeout của account_permission_explain: bản cũ gọi private.has_permission cho từng quyền ứng viên,
-- mỗi lần gọi lại tính base_rules/base_config từ đầu (hàng trăm lần). Bản mới vật liệu hóa rules,
-- quyền Role và quyền riêng thành mảng một lần rồi lọc theo tập hợp — ngữ nghĩa giữ nguyên y hệt
-- private.has_permission (0330): quyền đã kiểm chứng theo nguồn thì cần rule và không bị DENY;
-- quyền còn lại theo Role trực tiếp hoặc quyền riêng; tài khoản khóa thì rỗng; Super Admin có tất cả.
CREATE OR REPLACE FUNCTION public.account_permission_explain(_target uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cfg jsonb; rules jsonb; eff text[]; cand text[];
  ovr_mode text; ovr_perms text[]; has_custom boolean := false;
  sa boolean; active boolean;
  rule_p text[]; deny_p text[]; role_p text[];
BEGIN
  IF NOT private.is_active(auth.uid()) OR NOT (
    private.is_super_admin(auth.uid())
    OR private.has_permission(auth.uid(), 'settings.user_view')
    OR private.has_permission(auth.uid(), 'settings.user_custom_perm')
  ) THEN
    RAISE EXCEPTION 'Không có quyền xem giải thích quyền.' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _target) THEN
    RAISE EXCEPTION 'Không tìm thấy tài khoản.';
  END IF;

  cfg := private.base_config();
  rules := private.base_rules(_target, cfg);
  sa := private.is_super_admin(_target);
  active := private.is_active(_target);

  SELECT o.mode, coalesce(o.permissions, '{}') INTO ovr_mode, ovr_perms
  FROM user_permission_overrides o WHERE o.user_id = _target AND o.use_custom;
  has_custom := FOUND;

  SELECT coalesce(array_agg(DISTINCT p), '{}') INTO cand FROM (
    SELECT key AS p FROM base_permission_catalog
    UNION SELECT unnest(coalesce(r.permissions, '{}')) FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = _target
    UNION SELECT unnest(ovr_perms)
    UNION SELECT x->>'permission' FROM jsonb_array_elements(rules) x
  ) s;

  SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO rule_p FROM jsonb_array_elements(rules) x;
  SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO deny_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'DENY';
  SELECT coalesce(array_agg(DISTINCT p), '{}') INTO role_p
  FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p
  WHERE ur.user_id = _target;

  SELECT coalesce(array_agg(p ORDER BY p), '{}') INTO eff
  FROM unnest(cand) p
  WHERE active AND (
    sa
    OR (
      (private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%')
      AND p = ANY(rule_p) AND NOT p = ANY(deny_p)
    )
    OR (
      NOT (private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%')
      AND (p = ANY(role_p) OR (has_custom AND p = ANY(ovr_perms)))
    )
  );

  RETURN jsonb_build_object(
    'user_id', _target,
    'status', (SELECT status::text FROM profiles WHERE id = _target),
    'is_super_admin', sa,
    'use_custom', has_custom,
    'override_mode', coalesce(ovr_mode, 'replace'),
    'custom_permissions', coalesce(to_jsonb(ovr_perms), '[]'::jsonb),
    'direct_roles', (SELECT coalesce(jsonb_agg(jsonb_build_object('role_id', r.id, 'name', r.name, 'permissions', to_jsonb(coalesce(r.permissions, '{}'))) ORDER BY r.name), '[]'::jsonb)
                     FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = _target),
    'rules', (SELECT coalesce(jsonb_agg(jsonb_build_object(
                'permission', x->>'permission', 'effect', x->>'effect',
                'source_kind', x->>'source_kind', 'source_name', x->>'source_name',
                'scope', x->>'scope') ORDER BY x->>'source_kind', x->>'permission'), '[]'::jsonb)
              FROM jsonb_array_elements(rules) x),
    'effective', to_jsonb(eff)
  );
END $$;
REVOKE ALL ON FUNCTION public.account_permission_explain(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.account_permission_explain(uuid) TO authenticated;