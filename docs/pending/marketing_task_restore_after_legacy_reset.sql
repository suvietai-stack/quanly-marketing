-- CHƯA ÁP DỤNG — chờ Super Admin xác nhận. Không đổi dữ liệu, chỉ đổi bộ lọc quyền.
-- Lỗi: private.base_rules() bỏ mọi rule source_kind='marketing_specialty' với tài khoản đã reset quyền cũ,
-- nên nhân viên có nhiệm vụ Marketing (vd Content Web) mất web.view/web.content_view/web.outline_start.
-- Sửa: cho lại rule nhiệm vụ Marketing của Role chuẩn, NHƯNG chỉ khi
--   (1) còn bổ nhiệm Marketing hiệu lực (org_marketing_eligible) — miễn nhiệm hết MKT thì mất;
--   (2) quyền thuộc module chính của nhiệm vụ hoặc nhóm cá nhân cơ bản (tổng quan/việc/thương hiệu/KPI/nghỉ phép/chấm công của mình).
-- Quyền ngoài module (social.*, order.* cho Content Web...) vẫn bị chặn tới khi Admin duyệt riêng.
CREATE OR REPLACE FUNCTION private.mkt_task_core_permission(_role text, _p text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT split_part(_p,'.',1) IN ('overview','task','brand','kpi','leave','att','settings')
      OR split_part(_p,'.',1) = CASE _role
           WHEN 'role-content-web' THEN 'web' WHEN 'role-seo' THEN 'web'
           WHEN 'role-local-seo' THEN 'local' WHEN 'role-social' THEN 'social'
           WHEN 'role-video' THEN 'video' WHEN 'role-standard-design-staff' THEN 'order' END
$$;

CREATE OR REPLACE FUNCTION private.base_rules(u uuid, c jsonb)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(r),'[]') FROM jsonb_array_elements(private.reset_previous_base_rules(u,c)) r
 WHERE NOT private.legacy_reset_applies(u) OR r->>'effect'='DENY'
   OR (r->>'source_kind' IN ('appointment_role','marketing_appointment') AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard'))
   OR (r->>'source_kind'='marketing_specialty'
       AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard')
       AND private.org_marketing_eligible(u,c)
       AND private.mkt_task_core_permission(r->>'role_id', r->>'permission'))
$function$;
