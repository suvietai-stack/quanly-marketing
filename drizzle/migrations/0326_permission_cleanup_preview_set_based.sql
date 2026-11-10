-- Tối ưu base_perm_cleanup_preview: tính quyền trước/sau theo tập hợp với một cấu hình dùng chung,
-- thay vì gọi has_permission (dựng lại base_config) cho từng permission của từng tài khoản.
-- Ngữ nghĩa giữ nguyên: quyền đã kiểm chứng theo DENY > ALLOW > (override tùy chỉnh | Role trực tiếp);
-- quyền còn lại theo override tùy chỉnh hoặc Role trực tiếp.
CREATE OR REPLACE FUNCTION public.base_perm_cleanup_preview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u record;
  cfg jsonb; rules jsonb;
  removable text[]; lost text[]; before_p text[]; after_p text[];
  role_p text[]; kept_p text[]; allow_p text[]; deny_p text[];
  accounts jsonb := '[]'::jsonb; roles_json jsonb; status text; grp text;
  has_custom boolean; is_sa boolean; has_biz boolean;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được xem trước chuyển đổi quyền.'; END IF;
  cfg := private.base_config();
  FOR u IN SELECT p.id, p.full_name, p.status FROM profiles p WHERE p.status = 'Đang hoạt động' AND (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id) OR EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = p.id)) ORDER BY p.full_name LOOP
    is_sa := private.is_super_admin(u.id);
    has_custom := EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = u.id AND o.use_custom);
    has_biz := EXISTS (SELECT 1 FROM biz_appointments a WHERE a.user_id = u.id AND a.status = 'active' AND (a.ended_at IS NULL OR a.ended_at > now()));
    SELECT coalesce(jsonb_agg(jsonb_build_object('role_id', r.id, 'name', r.name, 'protected', private.cleanup_role_protected(r.id)) ORDER BY r.name), '[]'::jsonb),
           coalesce(array_agg(r.id) FILTER (WHERE NOT private.cleanup_role_protected(r.id)), '{}')
    INTO roles_json, removable
    FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = u.id;
    lost := '{}';
    IF NOT is_sa AND array_length(removable, 1) IS NOT NULL THEN
      -- Quyền từ nguồn trực tiếp hiện tại (override tùy chỉnh thay thế hoàn toàn Role trực tiếp)
      IF has_custom THEN
        SELECT coalesce(permissions, '{}') INTO role_p FROM user_permission_overrides WHERE user_id = u.id AND use_custom;
        kept_p := role_p;
      ELSE
        SELECT coalesce(array_agg(DISTINCT p), '{}') INTO role_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = u.id;
        SELECT coalesce(array_agg(DISTINCT p), '{}') INTO kept_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = u.id AND private.cleanup_role_protected(ur.role_id);
      END IF;
      -- Nguồn tự động (bổ nhiệm chức vụ + nhiệm vụ Marketing + quyền nền đã kiểm chứng)
      rules := private.base_rules(u.id, cfg);
      SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO allow_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'ALLOW';
      SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO deny_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'DENY';
      -- Chỉ quyền đã kiểm chứng mới đi qua kênh ALLOW/DENY tự động
      allow_p := ARRAY(SELECT p FROM unnest(allow_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
      deny_p := ARRAY(SELECT p FROM unnest(deny_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
      before_p := ARRAY(SELECT DISTINCT p FROM unnest(role_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
      after_p := ARRAY(SELECT DISTINCT p FROM unnest(kept_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
      lost := ARRAY(SELECT p FROM unnest(before_p) p WHERE NOT (p = ANY (after_p)) ORDER BY 1);
    END IF;
    grp := CASE WHEN is_sa THEN 'A' WHEN has_biz AND array_length(removable, 1) IS NOT NULL THEN 'D' WHEN has_biz THEN 'B' ELSE 'C' END;
    status := CASE
      WHEN is_sa THEN 'protected_super'
      WHEN has_custom THEN 'needs_confirm'
      WHEN array_length(removable, 1) IS NULL THEN 'protected'
      WHEN array_length(lost, 1) IS NULL THEN 'ready'
      ELSE 'review' END;
    accounts := accounts || jsonb_build_object(
      'user_id', u.id, 'name', u.full_name, 'group', grp, 'status', status,
      'unit', (SELECT ou.name FROM org_assignments oa JOIN org_units ou ON ou.id = oa.unit_id WHERE oa.user_id = u.id AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now()) ORDER BY (oa.category = 'primary') DESC, oa.starts_at DESC LIMIT 1),
      'title', (SELECT ot.name FROM org_assignments oa JOIN org_titles ot ON ot.id = oa.title_id WHERE oa.user_id = u.id AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now()) ORDER BY (oa.category = 'primary') DESC, oa.starts_at DESC LIMIT 1),
      'roles', roles_json,
      'removable', coalesce((SELECT jsonb_agg(x ORDER BY x) FROM unnest(removable) x), '[]'::jsonb),
      'lost', coalesce((SELECT jsonb_agg(x ORDER BY x) FROM unnest(lost) x), '[]'::jsonb),
      'appointment_sources', jsonb_array_length(private.org_role_rules(u.id, cfg)),
      'specialty_sources', jsonb_array_length(private.mkt_specialty_rules(u.id, '{}'::jsonb)),
      'has_custom_override', has_custom
    );
  END LOOP;
  RETURN jsonb_build_object(
    'fingerprint', private.cleanup_fingerprint(),
    'server_now', now(),
    'accounts', accounts,
    'totals', jsonb_build_object(
      'accounts', jsonb_array_length(accounts),
      'ready', (SELECT count(*) FROM jsonb_array_elements(accounts) a WHERE a->>'status' = 'ready'),
      'review', (SELECT count(*) FROM jsonb_array_elements(accounts) a WHERE a->>'status' = 'review'),
      'needs_confirm', (SELECT count(*) FROM jsonb_array_elements(accounts) a WHERE a->>'status' = 'needs_confirm'),
      'protected', (SELECT count(*) FROM jsonb_array_elements(accounts) a WHERE a->>'status' IN ('protected', 'protected_super')),
      'removable_roles', (SELECT coalesce(sum(jsonb_array_length(a->'removable')), 0) FROM jsonb_array_elements(accounts) a WHERE a->>'status' IN ('ready', 'review'))
    )
  );
END $$;
REVOKE ALL ON FUNCTION public.base_perm_cleanup_preview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.base_perm_cleanup_preview() TO authenticated, service_role;