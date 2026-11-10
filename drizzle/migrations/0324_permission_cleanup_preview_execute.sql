-- Giai đoạn 3: kiểm kê, xem trước, xác nhận, thực thi và khôi phục làm sạch Role trực tiếp cũ ngoài Kinh doanh.
-- Không tự chạy: thực thi chỉ qua RPC có xác nhận + vân tay dữ liệu của Super Admin.

CREATE TABLE public.base_perm_cleanup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid NOT NULL,
  fingerprint text NOT NULL,
  removed jsonb NOT NULL,
  restored boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  restored_at timestamptz,
  restored_by uuid
);
GRANT SELECT ON public.base_perm_cleanup_runs TO authenticated;
GRANT ALL ON public.base_perm_cleanup_runs TO service_role;
ALTER TABLE public.base_perm_cleanup_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY cleanup_runs_read ON public.base_perm_cleanup_runs FOR SELECT TO authenticated USING (private.is_super_admin(auth.uid()));

-- Role được bảo vệ: quản trị hệ thống, Kinh doanh/3K, hoặc chứa quyền quản trị tài khoản/Role.
CREATE OR REPLACE FUNCTION private.cleanup_role_protected(_role text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _role IN ('role-admin', 'role-super-admin') OR EXISTS (
    SELECT 1 FROM app_roles r CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p
    WHERE r.id = _role AND (p LIKE 'biz.%' OR p LIKE 'k3.%' OR p IN ('settings.role', 'settings.permission', 'settings.user_manage'))
  )
$$;

-- Vân tay toàn bộ nguồn quyền trực tiếp: đổi bất kỳ dòng nào => bắt buộc xem trước lại.
CREATE OR REPLACE FUNCTION private.cleanup_fingerprint() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT md5(coalesce(string_agg(x, ',' ORDER BY x), '')) FROM (
    SELECT ur.user_id::text || ':' || ur.role_id AS x FROM user_roles ur
    UNION ALL
    SELECT 'ovr:' || o.user_id::text || ':' || o.use_custom::text || ':' || md5(coalesce(o.permissions, '{}')::text) FROM user_permission_overrides o
  ) s
$$;

-- Bản mô phỏng has_permission sau khi gỡ các Role trong _removed: giữ nguyên thứ tự DENY > ALLOW > override > Role trực tiếp.
CREATE OR REPLACE FUNCTION private.cleanup_has_permission(_user_id uuid, _permission text, _removed text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_active(_user_id) AND (private.is_super_admin(_user_id) OR CASE
    WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id, _permission) = 'DENY' THEN false
    WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id, _permission) = 'ALLOW' THEN true
    WHEN EXISTS (SELECT 1 FROM user_permission_overrides WHERE user_id = _user_id AND use_custom = true) THEN EXISTS (SELECT 1 FROM user_permission_overrides WHERE user_id = _user_id AND _permission = ANY (permissions))
    ELSE EXISTS (SELECT 1 FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = _user_id AND _permission = ANY (r.permissions) AND NOT (ur.role_id = ANY (_removed)))
  END)
$$;

-- Kiểm kê + xem trước: phân nhóm, Role sẽ gỡ, quyền mất đi, nguồn quyền mới; chỉ Super Admin.
CREATE OR REPLACE FUNCTION public.base_perm_cleanup_preview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u record; r record; k text;
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

-- Thực thi theo batch đã chọn: khóa vân tay, chỉ gỡ Role không được bảo vệ, lưu bản sao khôi phục nguyên tử cùng transaction.
CREATE OR REPLACE FUNCTION public.base_perm_cleanup_execute(_users uuid[], _fingerprint text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  x uuid; removable text[]; removed jsonb := '[]'::jsonb; skipped jsonb := '[]'::jsonb; run_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được thực hiện chuyển đổi quyền.'; END IF;
  IF _fingerprint IS DISTINCT FROM private.cleanup_fingerprint() THEN RAISE EXCEPTION 'Dữ liệu quyền đã thay đổi kể từ lần xem trước — vui lòng xem trước lại.'; END IF;
  IF _users IS NULL OR array_length(_users, 1) IS NULL OR array_length(_users, 1) > 100 THEN RAISE EXCEPTION 'Danh sách tài khoản không hợp lệ.'; END IF;
  FOREACH x IN ARRAY _users LOOP
    IF private.is_super_admin(x) OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = x AND ur.role_id IN ('role-admin', 'role-super-admin')) THEN
      skipped := skipped || jsonb_build_object('user_id', x, 'reason', 'Tài khoản quản trị được bảo vệ'); CONTINUE;
    END IF;
    IF EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = x AND o.use_custom) THEN
      skipped := skipped || jsonb_build_object('user_id', x, 'reason', 'Có quyền tùy chỉnh — cần xác nhận riêng'); CONTINUE;
    END IF;
    SELECT coalesce(array_agg(ur.role_id), '{}') INTO removable FROM user_roles ur WHERE ur.user_id = x AND NOT private.cleanup_role_protected(ur.role_id);
    IF array_length(removable, 1) IS NULL THEN skipped := skipped || jsonb_build_object('user_id', x, 'reason', 'Không có Role nào thuộc diện gỡ'); CONTINUE; END IF;
    removed := removed || coalesce((SELECT jsonb_agg(jsonb_build_object('user_id', x, 'role_id', r.id, 'role_name', r.name)) FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = x AND ur.role_id = ANY (removable)), '[]'::jsonb);
    DELETE FROM user_roles WHERE user_id = x AND role_id = ANY (removable);
  END LOOP;
  INSERT INTO base_perm_cleanup_runs(actor, fingerprint, removed) VALUES (auth.uid(), _fingerprint, removed) RETURNING id INTO run_id;
  RETURN jsonb_build_object('run_id', run_id, 'removed', removed, 'skipped', skipped, 'at', now());
END $$;
REVOKE ALL ON FUNCTION public.base_perm_cleanup_execute(uuid[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.base_perm_cleanup_execute(uuid[], text) TO authenticated, service_role;

-- Khôi phục một lần chạy: trả lại đúng các dòng đã gỡ, không đụng nguồn khác.
CREATE OR REPLACE FUNCTION public.base_perm_cleanup_restore(_run uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE run_row record; n int := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được khôi phục.'; END IF;
  SELECT * INTO run_row FROM base_perm_cleanup_runs WHERE id = _run FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy lần chuyển đổi.'; END IF;
  IF run_row.restored THEN RAISE EXCEPTION 'Lần chuyển đổi này đã được khôi phục trước đó.'; END IF;
  INSERT INTO user_roles(user_id, role_id)
  SELECT (x->>'user_id')::uuid, x->>'role_id' FROM jsonb_array_elements(run_row.removed) x
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS n = ROW_COUNT;
  UPDATE base_perm_cleanup_runs SET restored = true, restored_at = now(), restored_by = auth.uid() WHERE id = _run;
  RETURN jsonb_build_object('restored_rows', n, 'at', now());
END $$;
REVOKE ALL ON FUNCTION public.base_perm_cleanup_restore(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.base_perm_cleanup_restore(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION private.cleanup_role_protected(text), private.cleanup_fingerprint(), private.cleanup_has_permission(uuid, text, text[]) FROM PUBLIC, anon, authenticated, service_role;