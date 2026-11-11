-- Thống nhất MỘT cơ chế xác định quyền: account_permission_explain (Debug) và
-- base_permissions_effective (frontend, qua base_legacy) phải khớp y hệt private.has_permission (0331).
-- 1) Explain: quyền đã kiểm chứng nhưng KHÔNG có quyết định nguồn vẫn rơi về Role trực tiếp/quyền riêng
--    (đúng fallthrough của has_permission); tôn trọng chế độ replace/additive của quyền riêng.
-- 2) base_legacy: chế độ 'additive' cộng thêm vào Role thay vì thay thế — khớp has_permission.
-- Không đổi dữ liệu, không tự thay đổi quyền hiệu lực của tài khoản nào.

CREATE OR REPLACE FUNCTION public.account_permission_explain(_target uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cfg jsonb; rules jsonb; eff text[]; cand text[];
  ovr_mode text; ovr_perms text[]; has_custom boolean := false;
  sa boolean; active boolean;
  allow_p text[]; deny_p text[]; role_p text[];
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

  SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO allow_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'ALLOW';
  SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO deny_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'DENY';
  SELECT coalesce(array_agg(DISTINCT p), '{}') INTO role_p
  FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p
  WHERE ur.user_id = _target;

  -- Ngữ nghĩa y hệt private.has_permission (0331): quyền đã kiểm chứng bị DENY thì chặn;
  -- có ALLOW từ nguồn thì cấp; không có quyết định nguồn thì rơi về quyền riêng (replace)
  -- hoặc Role trực tiếp (+ quyền riêng additive).
  SELECT coalesce(array_agg(p ORDER BY p), '{}') INTO eff
  FROM unnest(cand) p
  WHERE active AND (sa OR CASE
    WHEN (private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%') AND p = ANY(deny_p) THEN false
    WHEN (private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%') AND p = ANY(allow_p) THEN true
    WHEN has_custom AND ovr_mode = 'replace' THEN p = ANY(ovr_perms)
    ELSE p = ANY(role_p) OR (has_custom AND ovr_mode = 'additive' AND p = ANY(ovr_perms))
  END);

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

-- base_legacy: tôn trọng chế độ quyền riêng như has_permission.
CREATE OR REPLACE FUNCTION private.base_legacy(u uuid, p text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  allowed boolean := false; src jsonb;
  o_mode text; o_perms text[]; o_custom boolean := false;
BEGIN
  IF p LIKE 'biz.crm_%' THEN
    allowed := private.base_crm_legacy(u, p); src := '{"kind":"business","tier":2}';
  ELSIF p LIKE 'biz.%' THEN
    allowed := public.biz_can(u, p); src := '{"kind":"business","tier":2}';
  ELSIF p LIKE 'k3.%' THEN
    allowed := public.k3_can(u, p); src := '{"kind":"business","tier":2}';
  ELSE
    SELECT o.mode, coalesce(o.permissions, '{}') INTO o_mode, o_perms
    FROM user_permission_overrides o WHERE o.user_id = u AND o.use_custom;
    o_custom := FOUND;
    IF o_custom AND o_mode = 'replace' THEN
      allowed := p = ANY(o_perms);
      src := '{"kind":"custom","tier":3}';
    ELSE
      SELECT coalesce(bool_or(p = ANY(r.permissions)), false) INTO allowed
      FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = u;
      SELECT jsonb_build_object('kind', 'role', 'tier', 3, 'names', coalesce(jsonb_agg(r.name), '[]')) INTO src
      FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = u;
      IF NOT allowed AND o_custom AND o_mode = 'additive' AND p = ANY(o_perms) THEN
        allowed := true;
        src := jsonb_build_object('kind', 'custom', 'tier', 3, 'mode', 'additive');
      END IF;
    END IF;
  END IF;
  RETURN jsonb_build_object('allowed', coalesce(allowed, false), 'source', src);
END $$;