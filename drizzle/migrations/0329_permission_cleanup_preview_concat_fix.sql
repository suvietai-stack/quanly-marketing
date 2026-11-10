-- Vá lỗi thứ tự ưu tiên toán tử || trong preview: phải gom (thông tin chung || đánh giá) trước khi nối vào mảng accounts.
CREATE OR REPLACE FUNCTION public.base_perm_cleanup_preview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u record; cfg jsonb; ev jsonb; accounts jsonb := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được xem trước chuyển đổi quyền.'; END IF;
  cfg := private.base_config();
  FOR u IN SELECT p.id, p.full_name FROM profiles p WHERE p.status = 'Đang hoạt động' AND (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id) OR EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = p.id)) ORDER BY p.full_name LOOP
    ev := private.cleanup_account_eval(u.id, cfg);
    accounts := accounts || (jsonb_build_object(
      'user_id', u.id, 'name', u.full_name,
      'unit', (SELECT ou.name FROM org_assignments oa JOIN org_units ou ON ou.id = oa.unit_id WHERE oa.user_id = u.id AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now()) ORDER BY (oa.category = 'primary') DESC, oa.starts_at DESC LIMIT 1),
      'title', (SELECT ot.name FROM org_assignments oa JOIN org_titles ot ON ot.id = oa.title_id WHERE oa.user_id = u.id AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now()) ORDER BY (oa.category = 'primary') DESC, oa.starts_at DESC LIMIT 1)
    ) || ev);
  END LOOP;
  RETURN jsonb_build_object(
    'fingerprint', private.cleanup_fingerprint(),
    'server_now', now(),
    'accounts', accounts,
    'totals', jsonb_build_object(
      'accounts', jsonb_array_length(accounts),
      'ready', (SELECT count(*) FROM jsonb_array_elements(accounts) a WHERE a->>'status' = 'ready'),
      'review', (SELECT count(*) FROM jsonb_array_elements(accounts) a WHERE a->>'status' = 'review'),
      'protected', (SELECT count(*) FROM jsonb_array_elements(accounts) a WHERE a->>'status' = 'protected'),
      'removable_roles', (SELECT coalesce(sum(jsonb_array_length(a->'removable')), 0) FROM jsonb_array_elements(accounts) a WHERE a->>'status' = 'ready')
    )
  );
END $$;
REVOKE ALL ON FUNCTION public.base_perm_cleanup_preview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.base_perm_cleanup_preview() TO authenticated, service_role;