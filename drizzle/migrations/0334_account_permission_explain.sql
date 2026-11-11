-- Giai đoạn 2.5: một nguồn giải thích quyền hiệu lực thống nhất cho backend, frontend và Debug.
-- RPC chỉ đọc; không thay đổi quyền, không ghi dữ liệu. Kết quả 'effective' được tính bằng chính
-- private.has_permission nên Debug luôn khớp backend.

CREATE OR REPLACE FUNCTION public.account_permission_explain(_target uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cfg jsonb; rules jsonb; eff text[]; cand text[];
  ovr_mode text; ovr_perms text[]; has_custom boolean := false;
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

  SELECT o.mode, coalesce(o.permissions, '{}') INTO ovr_mode, ovr_perms
  FROM user_permission_overrides o WHERE o.user_id = _target AND o.use_custom;
  has_custom := FOUND;

  -- Vũ trụ quyền ứng viên: danh mục chuẩn + quyền trong các Role trực tiếp + quyền riêng + quyền từ nguồn (chức vụ/nhiệm vụ).
  SELECT coalesce(array_agg(DISTINCT p), '{}') INTO cand FROM (
    SELECT key AS p FROM base_permission_catalog
    UNION SELECT unnest(coalesce(r.permissions, '{}')) FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = _target
    UNION SELECT unnest(ovr_perms)
    UNION SELECT x->>'permission' FROM jsonb_array_elements(rules) x
  ) s;

  -- Quyền hiệu lực cuối cùng: chính resolver backend quyết định (một câu lệnh để hàm STABLE chỉ tính một lần).
  SELECT coalesce(array_agg(p ORDER BY p), '{}') INTO eff
  FROM unnest(cand) p WHERE private.has_permission(_target, p);

  RETURN jsonb_build_object(
    'user_id', _target,
    'status', (SELECT status::text FROM profiles WHERE id = _target),
    'is_super_admin', private.is_super_admin(_target),
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