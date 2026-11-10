-- Vá Giai đoạn 3: an toàn chuyển đổi quyền cũ.
-- 1) Bảo vệ toàn bộ nhân sự Kinh doanh theo dữ liệu tổ chức (membership/bổ nhiệm/kiêm nhiệm), không chỉ tên Role.
-- 2) Vân tay mở rộng: Role+permission, quyền cá nhân, bổ nhiệm, liên kết chức vụ-Role, nhiệm vụ Marketing, trạng thái tài khoản.
-- 3) Một hàm đánh giá dùng chung cho preview và execute: execute CHỈ gỡ khi tài khoản đạt "Sẵn sàng".
-- 4) Kiểm tra công việc đang chờ (nghỉ phép, 3K, tài chính) trước khi cho sẵn sàng.
-- 5) Khôi phục không ghi đè quyền mới phát sinh; báo xung đột để đối chiếu thủ công.

CREATE OR REPLACE FUNCTION private.cleanup_is_biz_staff(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM biz_department_members m WHERE m.user_id = _user AND (m.ended_at IS NULL OR m.ended_at > now()))
     OR EXISTS (SELECT 1 FROM biz_appointments a WHERE a.user_id = _user AND a.status = 'active' AND (a.ended_at IS NULL OR a.ended_at > now()))
     OR EXISTS (SELECT 1 FROM biz_management_assignments ma WHERE ma.user_id = _user AND (ma.ended_at IS NULL OR ma.ended_at > now()))
     OR EXISTS (SELECT 1 FROM biz_member_affiliations af WHERE af.user_id = _user AND (af.ended_at IS NULL OR af.ended_at > now()))
$$;

CREATE OR REPLACE FUNCTION private.cleanup_fingerprint() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT md5(coalesce(string_agg(x, ',' ORDER BY x), '')) FROM (
    SELECT 'ur:' || ur.user_id::text || ':' || ur.role_id AS x FROM user_roles ur
    UNION ALL
    SELECT 'role:' || r.id || ':' || md5(coalesce(r.permissions, '{}')::text) FROM app_roles r
    UNION ALL
    SELECT 'ovr:' || o.user_id::text || ':' || o.use_custom::text || ':' || md5(coalesce(o.permissions, '{}')::text) FROM user_permission_overrides o
    UNION ALL
    SELECT 'org:' || oa.id::text || ':' || oa.user_id::text || ':' || coalesce(oa.title_id::text, '-') || ':' || coalesce(oa.unit_id::text, '-') || ':' || oa.status || ':' || oa.starts_at::text || ':' || coalesce(oa.ends_at::text, '-') FROM org_assignments oa
    UNION ALL
    SELECT 'trl:' || l.id::text || ':' || l.title_id::text || ':' || l.role_id || ':' || l.active::text || ':' || md5(coalesce(l.enabled_permissions, '{}')::text) FROM base_title_role_links l
    UNION ALL
    SELECT 'mkt:' || s.user_id::text || ':' || s.specialty_id::text || ':' || s.state FROM mkt_staff_specialties s
    UNION ALL
    SELECT 'pf:' || p.id::text || ':' || p.status FROM profiles p
  ) s
$$;

CREATE OR REPLACE FUNCTION private.cleanup_pending_work(_user uuid) RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT count(*)::int FROM leave_requests l WHERE l.status = 'pending' AND (l.owner_id = _user OR l.approver_id = _user))
       + (SELECT count(*)::int FROM k3_tasks t WHERE t.user_id = _user AND t.status = 'doing')
       + (SELECT count(*)::int FROM fr_requests f WHERE f.requester_id = _user AND f.status NOT IN ('approved', 'rejected', 'cancelled'))
$$;

CREATE OR REPLACE FUNCTION private.cleanup_account_eval(_user uuid, _cfg jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  removable text[]; lost text[]; before_p text[]; after_p text[];
  role_p text[]; kept_p text[]; allow_p text[]; deny_p text[];
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

  lost := '{}'; role_p := '{}'; kept_p := '{}';
  IF NOT is_sa AND array_length(removable, 1) IS NOT NULL THEN
    IF has_custom THEN
      SELECT coalesce(permissions, '{}') INTO role_p FROM user_permission_overrides WHERE user_id = _user AND use_custom;
      kept_p := role_p;
    ELSE
      SELECT coalesce(array_agg(DISTINCT p), '{}') INTO role_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = _user;
      SELECT coalesce(array_agg(DISTINCT p), '{}') INTO kept_p FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id CROSS JOIN LATERAL unnest(coalesce(r.permissions, '{}')) p WHERE ur.user_id = _user AND private.cleanup_role_protected(ur.role_id);
    END IF;
    rules := private.base_rules(_user, _cfg);
    SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO allow_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'ALLOW';
    SELECT coalesce(array_agg(DISTINCT x->>'permission'), '{}') INTO deny_p FROM jsonb_array_elements(rules) x WHERE x->>'effect' = 'DENY';
    allow_p := ARRAY(SELECT p FROM unnest(allow_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
    deny_p := ARRAY(SELECT p FROM unnest(deny_p) p WHERE private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p) OR p LIKE 'sale_work.%');
    before_p := ARRAY(SELECT DISTINCT p FROM unnest(role_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
    after_p := ARRAY(SELECT DISTINCT p FROM unnest(kept_p || allow_p) p WHERE NOT (p = ANY (deny_p)));
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
    IF has_custom THEN reasons := reasons || 'Tài khoản có quyền tùy chỉnh riêng — cần Admin xử lý thủ công, hệ thống không tự gỡ'; END IF;
    IF array_length(lost, 1) IS NOT NULL THEN reasons := reasons || format('Còn %s quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng', array_length(lost, 1)); END IF;
    IF array_length(role_p, 1) IS NOT NULL AND NOT has_org AND NOT has_spec THEN reasons := reasons || 'Chưa được bổ nhiệm chức vụ hoặc giao nhiệm vụ chuyên môn nào còn hiệu lực'; END IF;
    IF pending > 0 THEN reasons := reasons || format('Có %s công việc đang chờ xử lý phụ thuộc quyền hiện tại', pending); END IF;
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

CREATE OR REPLACE FUNCTION public.base_perm_cleanup_preview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u record; cfg jsonb; ev jsonb; accounts jsonb := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được xem trước chuyển đổi quyền.'; END IF;
  cfg := private.base_config();
  FOR u IN SELECT p.id, p.full_name FROM profiles p WHERE p.status = 'Đang hoạt động' AND (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id) OR EXISTS (SELECT 1 FROM user_permission_overrides o WHERE o.user_id = p.id)) ORDER BY p.full_name LOOP
    ev := private.cleanup_account_eval(u.id, cfg);
    accounts := accounts || jsonb_build_object(
      'user_id', u.id, 'name', u.full_name,
      'unit', (SELECT ou.name FROM org_assignments oa JOIN org_units ou ON ou.id = oa.unit_id WHERE oa.user_id = u.id AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now()) ORDER BY (oa.category = 'primary') DESC, oa.starts_at DESC LIMIT 1),
      'title', (SELECT ot.name FROM org_assignments oa JOIN org_titles ot ON ot.id = oa.title_id WHERE oa.user_id = u.id AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now()) ORDER BY (oa.category = 'primary') DESC, oa.starts_at DESC LIMIT 1)
    ) || ev;
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

CREATE OR REPLACE FUNCTION public.base_perm_cleanup_execute(_users uuid[], _fingerprint text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  x uuid; ev jsonb; removable text[]; removed jsonb := '[]'::jsonb; skipped jsonb := '[]'::jsonb; run_id uuid; cfg jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được thực hiện chuyển đổi quyền.'; END IF;
  IF _fingerprint IS DISTINCT FROM private.cleanup_fingerprint() THEN RAISE EXCEPTION 'Dữ liệu quyền đã thay đổi kể từ lần xem trước — vui lòng xem trước lại.'; END IF;
  IF _users IS NULL OR array_length(_users, 1) IS NULL OR array_length(_users, 1) > 100 THEN RAISE EXCEPTION 'Danh sách tài khoản không hợp lệ.'; END IF;
  cfg := private.base_config();
  FOREACH x IN ARRAY _users LOOP
    ev := private.cleanup_account_eval(x, cfg);
    IF ev->>'status' <> 'ready' THEN
      skipped := skipped || jsonb_build_object('user_id', x, 'reason', coalesce((SELECT string_agg(r, '; ') FROM jsonb_array_elements_text(ev->'reasons') r), 'Tài khoản chưa sẵn sàng')); CONTINUE;
    END IF;
    SELECT coalesce(array_agg(ur.role_id), '{}') INTO removable FROM user_roles ur WHERE ur.user_id = x AND NOT private.cleanup_role_protected(ur.role_id);
    IF array_length(removable, 1) IS NULL THEN skipped := skipped || jsonb_build_object('user_id', x, 'reason', 'Không có Role nào thuộc diện gỡ'); CONTINUE; END IF;
    removed := removed || coalesce((SELECT jsonb_agg(jsonb_build_object('user_id', x, 'role_id', r.id, 'role_name', r.name)) FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = x AND ur.role_id = ANY (removable)), '[]'::jsonb);
    DELETE FROM user_roles WHERE user_id = x AND role_id = ANY (removable);
  END LOOP;
  IF jsonb_array_length(removed) = 0 THEN RAISE EXCEPTION 'Không có tài khoản nào đủ điều kiện chuyển đổi — hủy thao tác, vui lòng xem trước lại.'; END IF;
  INSERT INTO base_perm_cleanup_runs(actor, fingerprint, removed) VALUES (auth.uid(), _fingerprint, removed) RETURNING id INTO run_id;
  RETURN jsonb_build_object('run_id', run_id, 'removed', removed, 'skipped', skipped, 'at', now());
END $$;
REVOKE ALL ON FUNCTION public.base_perm_cleanup_execute(uuid[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.base_perm_cleanup_execute(uuid[], text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.base_perm_cleanup_restore(_run uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE run_row record; n int := 0; conflicts jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được khôi phục.'; END IF;
  SELECT * INTO run_row FROM base_perm_cleanup_runs WHERE id = _run FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy lần chuyển đổi.'; END IF;
  IF run_row.restored THEN RAISE EXCEPTION 'Lần chuyển đổi này đã được khôi phục trước đó.'; END IF;
  SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('user_id', ur.user_id, 'role_id', ur.role_id)), '[]'::jsonb) INTO conflicts
  FROM user_roles ur
  WHERE ur.user_id IN (SELECT (x->>'user_id')::uuid FROM jsonb_array_elements(run_row.removed) x)
    AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(run_row.removed) x WHERE (x->>'user_id')::uuid = ur.user_id AND x->>'role_id' = ur.role_id);
  INSERT INTO user_roles(user_id, role_id)
  SELECT (x->>'user_id')::uuid, x->>'role_id' FROM jsonb_array_elements(run_row.removed) x
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS n = ROW_COUNT;
  UPDATE base_perm_cleanup_runs SET restored = true, restored_at = now(), restored_by = auth.uid() WHERE id = _run;
  RETURN jsonb_build_object('restored_rows', n, 'conflicts', conflicts, 'at', now());
END $$;
REVOKE ALL ON FUNCTION public.base_perm_cleanup_restore(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.base_perm_cleanup_restore(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION private.cleanup_is_biz_staff(uuid), private.cleanup_pending_work(uuid), private.cleanup_account_eval(uuid, jsonb) FROM PUBLIC, anon, authenticated, service_role;