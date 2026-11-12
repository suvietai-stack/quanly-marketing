-- Rollback: restores exact prior definitions; aborts if changed functions were altered after apply.
BEGIN;
DO $guard$ BEGIN
 IF to_regprocedure('private.universal_permission_ready(text)') IS NULL THEN RAISE EXCEPTION 'Rollback conflict: candidate not applied'; END IF;
 IF position('universal_permission_ready' in pg_get_functiondef('private.role_editor_validate(text,text[],text[])'::regprocedure))=0 THEN RAISE EXCEPTION 'Rollback conflict: role_editor_validate changed'; END IF;
END $guard$;
CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal FROM (VALUES ('k3.use','own',true),('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key) $function$;
CREATE OR REPLACE FUNCTION private.common_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 -- k3.use stays unavailable from Common until the single block-application gate is activated and verified.
 SELECT p<>'k3.use' AND EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND s.scope='own' AND s.personal AND private.org_role_permission_ready(p));
$function$;
CREATE OR REPLACE FUNCTION private.role_editor_validate(kind text, next_permissions text[], previous_permissions text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF kind='common' AND EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT private.common_permission_ready(p)) THEN RAISE EXCEPTION 'Quyền chung chỉ hỗ trợ quyền cá nhân cơ bản đã kiểm chứng.' USING ERRCODE='42501'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT p=ANY(coalesce(previous_permissions,'{}')) AND NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND CASE WHEN kind='marketing_task' THEN private.mkt_specialty_permission_ready(p) AND s.scope<>'unit' ELSE private.org_role_permission_ready(p) END)) THEN RAISE EXCEPTION 'Quyền mới chưa có phạm vi an toàn; giữ cấu hình hiện tại hoặc chọn quyền đã kiểm chứng.' USING ERRCODE='42501'; END IF; END $function$;
CREATE OR REPLACE FUNCTION private.org_slot_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(x.rule),'[]'::jsonb) FROM (
 SELECT jsonb_build_object('id',(m->>'id')||':'||r.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','appointment_role','source_id',m->>'id','source_name',r.name,'role_id',r.id,'unit_id',m->>'unit_id','slot_id',NULL,'starts_at',m->>'starts_at','ends_at',m->>'ends_at','legacy',false) rule
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN public.org_position_roles b ON b.unit_id=m->>'unit_id' AND b.title_id=m->>'title_id' JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id' JOIN app_roles r ON r.id=b.role_id AND r.role_kind='position' AND r.catalog_state='standard' AND NOT r.is_system AND r.catalog_generation>=2 CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((t->>'active')::boolean,false) AND private.org_role_permission_ready(p)
) x $function$;
CREATE OR REPLACE FUNCTION private.mkt_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','mkt:'||m.specialty_id||':'||p,'permission',p,'effect','ALLOW','scope','own','active',true,'source_kind','marketing_specialty','source_id',m.specialty_id,'source_name',s.name,'role_id',r.id,'legacy',NOT m.eligibility_enforced)),'[]'::jsonb) FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id=m.specialty_id AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p WHERE m.user_id=u AND m.state='active' AND private.is_active(u) AND private.mkt_specialty_permission_ready(p) AND (r.role_kind<>'marketing_task' OR (NOT m.eligibility_enforced AND r.catalog_generation<2) OR private.org_marketing_eligible(u,c)) $function$;
CREATE OR REPLACE FUNCTION private.org_assignment_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','assignment-specialty:'||(m->>'id')||':'||s.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','marketing_appointment','source_id',m->>'id','source_name',s.name,'role_id',r.id,'unit_id',m->>'unit_id','starts_at',m->>'starts_at','ends_at',m->>'ends_at')),'[]')
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id'
 CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid
 JOIN mkt_specialties s ON s.id=sid AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND m->>'status'='active' AND coalesce((t->>'active')::boolean,false) AND t->>'source' IS DISTINCT FROM 'biz_positions' AND r.id NOT IN ('role-admin','role-super-admin')
 AND (m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) OR r.catalog_generation>=2)
 AND (private.org_role_permission_ready(p) OR (r.catalog_generation>=2 AND r.role_kind='marketing_task' AND private.mkt_specialty_permission_ready(p)))
 AND (r.role_kind<>'marketing_task' OR r.catalog_generation<2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) b WHERE b->>'kind'='block' AND (b->>'id'='b5e00000-0000-4000-8000-000000000001' OR b->>'code'='marketing') AND coalesce((b->>'active')::boolean,true) AND private.base_role_unit_contains(c,b->>'id',m->>'unit_id')))
 AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) root WHERE root->>'kind' IN ('company','block') AND private.base_role_unit_contains(c,root->>'id',m->>'unit_id')) $function$;
CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('common_ready',private.common_permission_ready(p.key),'position_ready',private.org_role_permission_ready(p.key),'task_ready',private.mkt_specialty_permission_ready(p.key) AND p.scope<>'unit')),'[]') FROM private.permission_editor_policy() p); END $function$;
DROP FUNCTION private.universal_dormant_fence(text,text);
DROP FUNCTION private.universal_permission_scope(text);
DROP FUNCTION private.universal_permission_ready(text);
COMMIT;
