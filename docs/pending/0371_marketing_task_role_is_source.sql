-- PENDING — CHƯA ÁP DỤNG. Chỉ chạy sau khi Super Admin xác nhận (xem docs/pending/marketing_task_role_review.md).
-- Không đổi dữ liệu, không đổi app_roles.permissions. Chỉ đổi luật đọc quyền.
-- Nguyên tắc: Role nhiệm vụ Marketing là nguồn chuẩn — quyền có hiệu lực = app_roles.permissions đã cấu hình
--   ∩ quyền backend đã kiểm chứng (mkt_specialty_permission_ready / org_role_permission_ready)
--   ∩ nguồn đang hiệu lực ∩ còn thuộc hệ Marketing. KHÔNG có danh sách module cứng trong resolver.

-- B1. Nhiệm vụ Marketing luôn yêu cầu thuộc hệ Marketing, kể cả dòng cũ eligibility_enforced=false.
--     Chuyên môn khác (Thiết kế/Chụp ảnh, role_kind<>'marketing_task') giữ nguyên ràng buộc riêng, không xóa dòng nào.
CREATE OR REPLACE FUNCTION private.mkt_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$ SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','mkt:'||m.specialty_id||':'||p,'permission',p,'effect','ALLOW','scope','own','active',true,'source_kind','marketing_specialty','source_id',m.specialty_id,'source_name',s.name,'role_id',r.id,'legacy',NOT m.eligibility_enforced)),'[]'::jsonb)
 FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id=m.specialty_id AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE m.user_id=u AND m.state='active' AND private.is_active(u) AND private.mkt_specialty_permission_ready(p)
   AND (r.role_kind<>'marketing_task' OR private.org_marketing_eligible(u,c)) $function$;

-- B2. Đường bổ nhiệm (marketing_appointment) cũng phải thuộc hệ Marketing với Role nhiệm vụ
--     (trước đây chỉ cần đơn vị nằm trong công ty/khối bất kỳ).
CREATE OR REPLACE FUNCTION private.org_assignment_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','assignment-specialty:'||(m->>'id')||':'||s.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','marketing_appointment','source_id',m->>'id','source_name',s.name,'role_id',r.id,'unit_id',m->>'unit_id','starts_at',m->>'starts_at','ends_at',m->>'ends_at')),'[]')
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id'
 CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid
 JOIN mkt_specialties s ON s.id=sid AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND m->>'status'='active' AND coalesce((t->>'active')::boolean,false) AND t->>'source' IS DISTINCT FROM 'biz_positions' AND r.id NOT IN ('role-admin','role-super-admin') AND m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) AND private.org_role_permission_ready(p)
   AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) root WHERE root->>'kind' IN ('company','block') AND private.base_role_unit_contains(c,root->>'id',m->>'unit_id'))
   AND (r.role_kind<>'marketing_task' OR private.org_marketing_eligible(u,c)) $function$;

-- A + dedupe. Tài khoản đã reset quyền cũ: nhận lại quyền nhiệm vụ Marketing từ Role chuẩn (không lọc theo module).
-- Nếu cùng Role+quyền đã có từ đường bổ nhiệm (marketing_appointment) thì bỏ bản trùng từ marketing_specialty → một nguồn duy nhất.
CREATE OR REPLACE FUNCTION private.base_rules(u uuid, c jsonb)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
 WITH all_rules AS (SELECT r FROM jsonb_array_elements(private.reset_previous_base_rules(u,c)) r),
 appt AS (SELECT DISTINCT r->>'role_id' role_id, r->>'permission' p FROM all_rules WHERE r->>'source_kind'='marketing_appointment')
 SELECT coalesce(jsonb_agg(r),'[]') FROM all_rules
 WHERE NOT (r->>'source_kind'='marketing_specialty' AND EXISTS(SELECT 1 FROM appt WHERE appt.role_id=r->>'role_id' AND appt.p=r->>'permission'))
   AND (NOT private.legacy_reset_applies(u) OR r->>'effect'='DENY'
     OR (r->>'source_kind' IN ('appointment_role','marketing_appointment') AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard'))
     OR (r->>'source_kind'='marketing_specialty' AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard' AND ar.role_kind='marketing_task')))
$function$;

-- Hiển thị nguồn (Role catalog/hồ sơ) dùng cùng điều kiện B1.
DO $patch$ DECLARE d text; o text := $o$(r.role_kind<>'marketing_task' OR NOT m.eligibility_enforced OR private.org_marketing_eligible(m.user_id,c))$o$; BEGIN
 SELECT pg_get_functiondef('private.slot_previous_source_rows(jsonb)'::regprocedure) INTO d;
 IF position(o IN d)=0 THEN RAISE EXCEPTION 'role source pattern not found; stop'; END IF;
 EXECUTE replace(d,o,$n$(r.role_kind<>'marketing_task' OR private.org_marketing_eligible(m.user_id,c))$n$);
END $patch$;
