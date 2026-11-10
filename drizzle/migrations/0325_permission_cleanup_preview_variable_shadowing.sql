-- Sửa lỗi che biến trong base_perm_cleanup_preview: biến record "r" trùng alias bảng app_roles r
-- khiến PL/pgSQL báo "record r is not assigned yet". Bỏ biến không dùng, giữ nguyên logic.
CREATE OR REPLACE FUNCTION public.base_perm_cleanup_preview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u record; k text;
  removable text[]; lost text[]; cand text[];
  accounts jsonb := '[]'::jsonb; roles_json jsonb; status text; grp text;
  has_custom boolean; is_sa boolean; has_biz boolean;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được xem trước chuyển đổi quyền.'; END IF;
  FOR u IN SELECT p.id, p.full_name, p.status FROM profiles p WHERE p.status = 'Đang hoạt động' AND (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id) OR EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = p.id)) ORDER BY p.full_name LOOP
    is_sa := private.is_super_admin(u.id);
    has_custom := EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = u.id AND o.use_custom);
    has_biz := EXISTS (SELECT 1 FROM biz_appointments a WHERE a.user_id = u.id AND a.status = 'active' AND (a.ended_at IS NULL OR a.ended_at > now()));
    SELECT coalesce(jsonb_agg(jsonb_build_object('role_id', r.id, 'name', r.name, 'protected', private.cleanup_role_protected(r.id)) ORDER BY r.name), '[]'::jsonb),
           coalesce(array_agg(r.id) FILTER (WHERE NOT private.cleanup_role_protected(r.id)), '{}')
    INTO roles_json, removable
    FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = u.id;
    lost := '{}';
    IF NOT is_sa AND NOT has_custom AND array_length(removable, 1) IS NOT NULL THEN
      SELECT coalesce(array_agg(DISTINCT p), '{}') INTO cand FROM app_roles r CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE r.id = ANY (removable);
      FOREACH k IN ARRAY cand LOOP
        IF private.has_permission(u.id, k) AND NOT private.cleanup_has_permission(u.id, k, removable) THEN lost := lost || k; END IF;
      END LOOP;
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
      'appointment_sources', jsonb_array_length(private.org_role_rules(u.id, private.base_config())),
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