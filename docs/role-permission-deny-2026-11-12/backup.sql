-- Backup: exact live definitions, owner and ACL captured 2026-11-12T12:09:47.149623+00:00 (read-only). Rows are not modified by the candidate (ADD COLUMN with empty default);
-- row fingerprints at capture: app_roles b4b3fd876c5d9d0dac34e554c258aa21, user_permission_overrides 921c3314094973bfaa620fd6f14261f2 (13 rows, 0 active).
-- private.permission_editor_policy() md5=5df07db9d70790a174e3078520314162 owner=postgres acl={postgres=X/postgres}
CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal FROM (VALUES ('k3.use','own',true),('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key) $function$;
-- private.common_permission_ready(text) md5=235e90397d4c9fbb8553a7f92734e37f owner=postgres acl={postgres=X/postgres}
CREATE OR REPLACE FUNCTION private.common_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 -- k3.use stays unavailable from Common until the single block-application gate is activated and verified.
 SELECT p<>'k3.use' AND EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND s.scope='own' AND s.personal AND private.org_role_permission_ready(p));
$function$;
-- private.role_editor_validate(text,text[],text[]) md5=9e5fa1a93890aaa486fe9d1674a4c1c2 owner=postgres acl={postgres=X/postgres}
CREATE OR REPLACE FUNCTION private.role_editor_validate(kind text, next_permissions text[], previous_permissions text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF kind='common' AND EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT private.common_permission_ready(p)) THEN RAISE EXCEPTION 'Quyền chung chỉ hỗ trợ quyền cá nhân cơ bản đã kiểm chứng.' USING ERRCODE='42501'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT p=ANY(coalesce(previous_permissions,'{}')) AND NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND CASE WHEN kind='marketing_task' THEN private.mkt_specialty_permission_ready(p) AND s.scope<>'unit' ELSE private.org_role_permission_ready(p) END)) THEN RAISE EXCEPTION 'Quyền mới chưa có phạm vi an toàn; giữ cấu hình hiện tại hoặc chọn quyền đã kiểm chứng.' USING ERRCODE='42501'; END IF; END $function$;
-- private.org_slot_rules(uuid,jsonb) md5=8378b03b30cbff30004a03f24b77520a owner=postgres acl={postgres=X/postgres}
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
-- private.mkt_specialty_rules(uuid,jsonb) md5=742425e52cf3d746a23b60f505529e85 owner=postgres acl={postgres=X/postgres}
CREATE OR REPLACE FUNCTION private.mkt_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','mkt:'||m.specialty_id||':'||p,'permission',p,'effect','ALLOW','scope','own','active',true,'source_kind','marketing_specialty','source_id',m.specialty_id,'source_name',s.name,'role_id',r.id,'legacy',NOT m.eligibility_enforced)),'[]'::jsonb) FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id=m.specialty_id AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p WHERE m.user_id=u AND m.state='active' AND private.is_active(u) AND private.mkt_specialty_permission_ready(p) AND (r.role_kind<>'marketing_task' OR (NOT m.eligibility_enforced AND r.catalog_generation<2) OR private.org_marketing_eligible(u,c)) $function$;
-- private.org_assignment_specialty_rules(uuid,jsonb) md5=a18e312f3e262c313d9eb208c8144851 owner=postgres acl={postgres=X/postgres}
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
-- permission_editor_read() md5=4d070d87c9511db3f49e448b58dea40d owner=postgres acl={postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}
CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('common_ready',private.common_permission_ready(p.key),'position_ready',private.org_role_permission_ready(p.key),'task_ready',private.mkt_specialty_permission_ready(p.key) AND p.scope<>'unit')),'[]') FROM private.permission_editor_policy() p); END $function$;
-- private.base_rules(uuid,jsonb) md5=b007f5a4af182af9fb99e45ded5a565c owner=postgres acl={postgres=X/postgres}
CREATE OR REPLACE FUNCTION private.base_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(r),'[]') || private.common_role_rules(u) FROM jsonb_array_elements(private.reset_previous_base_rules(u,c)) r WHERE NOT private.legacy_reset_applies(u) OR r->>'effect'='DENY' OR (r->>'source_kind' IN ('appointment_role','marketing_appointment') AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard'))
$function$;
-- account_supplement_read(uuid) md5=bf1ba617a64dc113171c72e46a7d6342 owner=postgres acl={postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}
CREATE OR REPLACE FUNCTION public.account_supplement_read(_target uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE state_ jsonb; BEGIN PERFORM private.supplement_permission_guard(_target);state_:=private.supplement_permission_state(_target); RETURN jsonb_build_object('fingerprint',md5(state_::text),'role_ids',(SELECT coalesce(jsonb_agg(role_id ORDER BY role_id),'[]') FROM user_roles WHERE user_id=_target AND source_kind='supplemental'),'permissions',(SELECT to_jsonb(permissions) FROM user_permission_overrides WHERE user_id=_target AND source_kind='supplemental'),'legacy_override',EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_target AND use_custom AND (source_kind='legacy' OR mode='replace')),'inactive_legacy',EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_target AND NOT use_custom AND mode='replace'),'roles',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'catalog_state',r.catalog_state,'permissions',r.permissions) ORDER BY r.name),'[]') FROM app_roles r WHERE r.catalog_state='standard' AND r.id NOT IN('role-admin','role-super-admin','role-kinh-doanh','role-9h328b84','role-g8qc3q2s','role-u0fzsvsp') AND NOT EXISTS(SELECT 1 FROM unnest(r.permissions)p WHERE p LIKE 'biz.%' OR p LIKE 'k3.%' OR p LIKE 'settings.%')));END $function$;
-- account_supplement_preview(uuid,text[]) md5=9903cd9510d304ae0059293f688fef27 owner=postgres acl={postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}
CREATE OR REPLACE FUNCTION public.account_supplement_preview(_target uuid, _permissions text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE state_ jsonb; old_ text[]; p record; BEGIN PERFORM private.staff_permission_validate(_target,_permissions); state_:=private.supplement_permission_state(_target); SELECT permissions INTO old_ FROM user_permission_overrides WHERE user_id=_target AND use_custom AND source_kind='supplemental' AND mode='additive'; INSERT INTO private.staff_permission_previews(actor_id,target_id,permissions,baseline) VALUES(auth.uid(),_target,ARRAY(SELECT DISTINCT unnest(coalesce(_permissions,'{}')) ORDER BY 1),md5(state_::text)) RETURNING * INTO p; RETURN jsonb_build_object('id',p.id,'fingerprint',p.baseline,'affected_users',jsonb_build_array(_target),'added',to_jsonb(ARRAY(SELECT unnest(p.permissions) EXCEPT SELECT unnest(coalesce(old_,'{}')))),'removed',to_jsonb(ARRAY(SELECT unnest(coalesce(old_,'{}')) EXCEPT SELECT unnest(p.permissions))),'inactive_legacy',EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_target AND NOT use_custom AND mode='replace'),'expires_at',p.expires_at); END $function$;
-- account_supplement_save(uuid,text[],text[],text,text) md5=8533c449cde9ba73989b2541a583c49f owner=postgres acl={postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}
CREATE OR REPLACE FUNCTION public.account_supplement_save(_target uuid, _roles text[], _permissions text[], _fingerprint text, _reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE before_ jsonb; after_ jsonb; p record; roles_ text[]; BEGIN LOCK TABLE user_roles,user_permission_overrides,app_roles,profiles,biz_appointments,biz_department_members,biz_management_assignments,biz_member_affiliations IN SHARE ROW EXCLUSIVE MODE; PERFORM private.staff_permission_validate(_target,_permissions); IF coalesce(length(trim(_reason)),0)=0 OR coalesce(cardinality(_permissions),0)>600 THEN RAISE EXCEPTION 'Cần lý do và danh sách quyền hợp lệ.'; END IF; SELECT coalesce(array_agg(role_id ORDER BY role_id),'{}') INTO roles_ FROM user_roles WHERE user_id=_target AND source_kind='supplemental'; IF roles_ IS DISTINCT FROM ARRAY(SELECT DISTINCT unnest(coalesce(_roles,'{}')) ORDER BY 1) THEN RAISE EXCEPTION 'Không cấp hoặc thu hồi Role trực tiếp tại quyền bổ sung cá nhân.'; END IF; before_:=private.supplement_permission_state(_target); IF md5(before_::text) IS DISTINCT FROM _fingerprint THEN RAISE EXCEPTION 'Quyền đã thay đổi; tải lại trước khi lưu.'; END IF; SELECT * INTO p FROM private.staff_permission_previews WHERE actor_id=auth.uid() AND target_id=_target AND baseline=_fingerprint AND permissions=ARRAY(SELECT DISTINCT unnest(coalesce(_permissions,'{}')) ORDER BY 1) AND applied_at IS NULL AND expires_at>clock_timestamp() ORDER BY created_at DESC LIMIT 1 FOR UPDATE; IF p.id IS NULL THEN RAISE EXCEPTION 'Cần xem trước còn hiệu lực trước khi lưu quyền riêng.'; END IF; INSERT INTO user_permission_overrides(user_id,use_custom,permissions,mode,source_kind) VALUES(_target,cardinality(coalesce(_permissions,'{}'))>0,ARRAY(SELECT DISTINCT unnest(coalesce(_permissions,'{}')) ORDER BY 1),'additive','supplemental') ON CONFLICT(user_id) DO UPDATE SET use_custom=excluded.use_custom,permissions=excluded.permissions,mode='additive',source_kind='supplemental',updated_at=now(); after_:=private.supplement_permission_state(_target); INSERT INTO account_permission_changes(actor_id,target_id,before_data,after_data,reason) VALUES(auth.uid(),_target,before_,after_,_reason); UPDATE private.staff_permission_previews SET applied_at=clock_timestamp() WHERE id=p.id; RETURN jsonb_build_object('fingerprint',md5(after_::text),'saved',true,'affected_users',jsonb_build_array(_target),'mode','additive'); END $function$;
