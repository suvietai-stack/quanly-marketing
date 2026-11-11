-- Trang Tài khoản đọc phân công trực tiếp từ Cơ cấu tổ chức: đơn vị, chức vụ, kiêm nhiệm,
-- nhiệm vụ Marketing và Role hiệu lực. RPC chỉ đọc; không ghi dữ liệu, không tạo đường cấp quyền mới.
CREATE OR REPLACE FUNCTION public.account_org_summary(_target uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.is_active(auth.uid()) OR NOT (
    private.is_super_admin(auth.uid())
    OR private.has_permission(auth.uid(), 'settings.user_view')
    OR private.has_permission(auth.uid(), 'settings.user_custom_perm')
  ) THEN
    RAISE EXCEPTION 'Không có quyền xem phân công tài khoản.' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _target) THEN
    RAISE EXCEPTION 'Không tìm thấy tài khoản.';
  END IF;
  RETURN jsonb_build_object(
    'user_id', _target,
    'assignments', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'unit_id', u.id, 'unit_name', u.name,
        'title_id', t.id, 'title_name', t.name,
        'category', oa.category, 'starts_at', oa.starts_at)
        ORDER BY (t.level IS NULL), t.level DESC, u.name), '[]'::jsonb)
      FROM org_assignments oa
      JOIN org_units u ON u.id = oa.unit_id
      LEFT JOIN org_titles t ON t.id = oa.title_id
      WHERE oa.user_id = _target AND oa.status = 'active'
        AND coalesce(oa.starts_at, '-infinity'::timestamptz) <= now()
        AND (oa.ends_at IS NULL OR oa.ends_at > now())),
    'specialties', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'id', s.id, 'name', s.name, 'is_primary', m.is_primary)
        ORDER BY m.is_primary DESC, s.sort), '[]'::jsonb)
      FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id = m.specialty_id
      WHERE m.user_id = _target AND m.state = 'active'),
    'roles', (SELECT coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'name', r.name) ORDER BY r.name), '[]'::jsonb)
      FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = _target)
  );
END $$;
REVOKE ALL ON FUNCTION public.account_org_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.account_org_summary(uuid) TO authenticated;