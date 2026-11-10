-- Giai đoạn 2: nguồn quyền tự động theo chuyên môn Marketing (chỉ quyền cá nhân đã kiểm chứng).
-- Căn cứ an toàn: RLS các bảng tasks/web_contents/social_posts/videos/places/keywords/growth/orders đã cho phép
-- mọi nhân sự đang hoạt động đọc/ghi; các quyền dưới chỉ mở lối vào giao diện/quy trình, không nâng quyền backend.
-- Loại trừ: mọi quyền approve/assign/delete/force_status/*_all/report/manage/publish/complete/cancel/restore,
-- quyền xuất hiện trong approval_center_read, và toàn bộ biz.*/k3.* (rào riêng, không đụng vào).

CREATE OR REPLACE FUNCTION private.mkt_specialty_permission_ready(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT p = ANY (ARRAY[
    'overview.view','overview.alerts','overview.own_only',
    'task.view','task.view_mine','task.view_created_by_me','task.create','task.accept','task.start','task.update_result','task.update_status','task.submit_completion','task.resubmit_completion','task.view_history','task.add_note',
    'brand.view',
    'web.view','web.open_detail','web.keyword_view','web.keyword_open_sheet','web.content_view','web.content_view_mine','web.content_history','web.content_note','web.outline_start','web.outline_submit','web.outline_resubmit','web.post_write_start','web.post_submit','web.post_resubmit','web.view_web_draft_url','web.edit_web_draft_url','web.start_web_draft_layout','web.submit_web_draft_review','web.resubmit_web_draft_review','web.view_web_draft_revision_note','web.index_view','web.open_published_url',
    'social.view','social.view_mine','social.post_view','social.post_view_mine','social.post_create','social.post_edit','social.post_submit','social.post_start','social.post_resubmit','social.post_history','social.growth_view','social.growth_create','social.growth_edit','social.growth_open',
    'video.view','video.view_mine','video.create','video.script_start','video.script_submit','video.script_resubmit','video.submit','video.resubmit','video.deliver','video.history','video.edit_cut','video.move_editing','video.move_shooting','video.footage','video.create_design_order',
    'local.view','local.view_mine','local.create','local.edit','local.post_create','local.post_edit','local.photo','local.products','local.review','local.review_reply','local.review_status','local.growth_view','local.growth_create','local.growth_edit',
    'order.take','order.create',
    'leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','settings.view'
  ])
$$;

DO $$ DECLARE d text; BEGIN
  SELECT pg_get_functiondef('private.base_supported(text)'::regprocedure) INTO d;
  EXECUTE replace(d, 'FUNCTION private.base_supported(', 'FUNCTION private.mkt_prev_supported(');
  SELECT pg_get_functiondef('private.base_rules(uuid,jsonb)'::regprocedure) INTO d;
  EXECUTE replace(d, 'FUNCTION private.base_rules(', 'FUNCTION private.mkt_prev_rules(');
END $$;

CREATE OR REPLACE FUNCTION private.base_supported(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT private.mkt_prev_supported(p) OR private.mkt_specialty_permission_ready(p)
$$;

-- Nguồn quyền từ chuyên môn đang hiệu lực: specialty -> Role gốc -> permission ∩ danh sách đã kiểm chứng.
-- Chỉ sinh ALLOW; DENY (nếu có) đến từ nguồn khác và vẫn được ưu tiên trong base_decision.
CREATE OR REPLACE FUNCTION private.mkt_specialty_rules(u uuid, c jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object(
    'id', 'mkt:' || m.specialty_id || ':' || p,
    'permission', p,
    'effect', 'ALLOW',
    'scope', 'own',
    'active', true,
    'source_kind', 'marketing_specialty',
    'source_id', m.specialty_id,
    'source_name', s.name,
    'role_id', r.id
  )), '[]'::jsonb)
  FROM mkt_staff_specialties m
  JOIN mkt_specialties s ON s.id = m.specialty_id AND s.active
  JOIN app_roles r ON r.id = s.role_id
  CROSS JOIN LATERAL unnest(r.permissions) p
  WHERE m.user_id = u AND m.state = 'active' AND private.is_active(u)
    AND private.mkt_specialty_permission_ready(p)
$$;

CREATE OR REPLACE FUNCTION private.base_rules(u uuid, c jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.mkt_prev_rules(u, c) || private.mkt_specialty_rules(u, c)
$$;

-- Mở rộng nhánh quyền đã kiểm chứng trong resolver trung tâm; giữ nguyên thứ tự DENY > ALLOW > legacy.
CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_active(_user_id) AND (private.is_super_admin(_user_id) OR CASE
    WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id, _permission) = 'DENY' THEN false
    WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id, _permission) = 'ALLOW' THEN true
    WHEN EXISTS (SELECT 1 FROM user_permission_overrides WHERE user_id = _user_id AND use_custom = true) THEN EXISTS (SELECT 1 FROM user_permission_overrides WHERE user_id = _user_id AND _permission = ANY (permissions))
    ELSE EXISTS (SELECT 1 FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = _user_id AND _permission = ANY (r.permissions))
  END)
$$;

-- Ứng viên theo chuyên môn: bổ sung đơn vị/chức vụ hiện tại để màn hình giao việc hiển thị đủ ngữ cảnh.
DROP FUNCTION public.mkt_specialty_candidates(text);
CREATE FUNCTION public.mkt_specialty_candidates(_specialty text) RETURNS TABLE(user_id uuid, name text, is_primary boolean, unit_name text, title_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, m.is_primary, ou.name, ot.name
  FROM public.mkt_staff_specialties m
  JOIN public.profiles p ON p.id = m.user_id
  JOIN public.mkt_specialties s ON s.id = m.specialty_id
  LEFT JOIN LATERAL (
    SELECT oa.unit_id, oa.title_id FROM public.org_assignments oa
    WHERE oa.user_id = p.id AND oa.status = 'active' AND oa.starts_at <= now() AND (oa.ends_at IS NULL OR oa.ends_at > now())
    ORDER BY (oa.category = 'primary') DESC, oa.starts_at DESC LIMIT 1
  ) cur ON true
  LEFT JOIN public.org_units ou ON ou.id = cur.unit_id
  LEFT JOIN public.org_titles ot ON ot.id = cur.title_id
  WHERE public.mkt_specialty_can_read(m.user_id) AND s.active AND m.specialty_id = _specialty AND m.state = 'active' AND p.status = 'Đang hoạt động'
  ORDER BY m.is_primary DESC, p.full_name
$$;
REVOKE ALL ON FUNCTION public.mkt_specialty_candidates(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mkt_specialty_candidates(text) TO authenticated, service_role;

-- Xem trước quyền tự nhận theo nhiệm vụ: thông tin danh mục, không chứa dữ liệu cá nhân.
CREATE OR REPLACE FUNCTION public.mkt_specialty_permission_preview() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN jsonb_build_object('error', 'not_active') ELSE coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'role_id', r.id,
    'role_name', r.name,
    'granted', (SELECT coalesce(jsonb_agg(p ORDER BY p), '[]'::jsonb) FROM unnest(coalesce(r.permissions, '{}')) p WHERE private.mkt_specialty_permission_ready(p)),
    'blocked', (SELECT coalesce(jsonb_agg(jsonb_build_object('key', p, 'reason', 'scope_audit_pending') ORDER BY p), '[]'::jsonb) FROM unnest(coalesce(r.permissions, '{}')) p WHERE NOT private.mkt_specialty_permission_ready(p))
  ) ORDER BY s.sort), '[]'::jsonb) END
  FROM mkt_specialties s LEFT JOIN app_roles r ON r.id = s.role_id
  WHERE s.active
$$;
REVOKE ALL ON FUNCTION public.mkt_specialty_permission_preview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mkt_specialty_permission_preview() TO authenticated, service_role;

REVOKE ALL ON FUNCTION private.mkt_specialty_permission_ready(text), private.mkt_specialty_rules(uuid, jsonb), private.mkt_prev_supported(text), private.mkt_prev_rules(uuid, jsonb) FROM PUBLIC, anon, authenticated, service_role;