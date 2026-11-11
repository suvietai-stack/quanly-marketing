CREATE OR REPLACE FUNCTION private.base_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(r),'[]') FROM jsonb_array_elements(private.reset_previous_base_rules(u,c)) r WHERE NOT private.legacy_reset_applies(u) OR r->>'effect'='DENY' OR (r->>'source_kind' IN ('appointment_role','marketing_appointment') AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard'))
$function$
;

CREATE OR REPLACE FUNCTION private.mkt_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','mkt:'||m.specialty_id||':'||p,'permission',p,'effect','ALLOW','scope','own','active',true,'source_kind','marketing_specialty','source_id',m.specialty_id,'source_name',s.name,'role_id',r.id,'legacy',NOT m.eligibility_enforced)),'[]'::jsonb) FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id=m.specialty_id AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p WHERE m.user_id=u AND m.state='active' AND private.is_active(u) AND private.mkt_specialty_permission_ready(p) AND (r.role_kind<>'marketing_task' OR NOT m.eligibility_enforced OR private.org_marketing_eligible(u,c)) $function$
;

CREATE OR REPLACE FUNCTION private.slot_previous_source_rows(c jsonb)
 RETURNS TABLE(user_id uuid, role_id text, source_kind text, source_id text, unit_id text, legacy boolean, eligible boolean, scope text, permissions text[])
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ WITH members AS (SELECT m FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m WHERE private.base_valid_at(m) AND coalesce(m->>'status','active')='active'), links AS (SELECT l FROM jsonb_array_elements(coalesce(c->'role_links','[]')) l), slots AS (SELECT s FROM jsonb_array_elements(coalesce(c->'position_slots','[]')) s) SELECT (m->>'user_id')::uuid,r.id,'slot',m->>'id',m->>'unit_id',false,true,'native',ARRAY(SELECT p FROM unnest(r.permissions) p WHERE private.org_role_permission_ready(p)) FROM members JOIN slots ON s->>'id'=m->>'slot_id' AND s->>'unit_id'=m->>'unit_id' AND s->>'title_id'=m->>'title_id' JOIN app_roles r ON r.id=s->>'role_id' AND r.role_kind='position' AND r.catalog_state='standard' WHERE coalesce((s->>'active')::boolean,false) AND private.is_active((m->>'user_id')::uuid) UNION ALL SELECT (m->>'user_id')::uuid,r.id,'title_legacy',m->>'id',m->>'unit_id',true,true,'native',ARRAY(SELECT p FROM jsonb_array_elements_text(coalesce(l->'enabled_permissions','[]')) p WHERE p=ANY(r.permissions) AND private.org_role_permission_ready(p)) FROM members JOIN links ON l->>'title_id'=m->>'title_id' JOIN app_roles r ON r.id=l->>'role_id' WHERE nullif(m->>'slot_id','') IS NULL AND l->>'scope_kind'='own' AND l->>'permission_signature'=md5(coalesce(r.permissions,'{}')::text) AND private.is_active((m->>'user_id')::uuid) UNION ALL SELECT m.user_id,r.id,CASE WHEN r.role_kind='marketing_task' THEN 'task' ELSE 'specialty' END,m.specialty_id,NULL,NOT m.eligibility_enforced,r.role_kind<>'marketing_task' OR private.org_marketing_eligible(m.user_id,c),'own',ARRAY(SELECT p FROM unnest(r.permissions) p WHERE private.mkt_specialty_permission_ready(p)) FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id=m.specialty_id AND s.active JOIN app_roles r ON r.id=s.role_id WHERE m.state='active' AND private.is_active(m.user_id) AND (r.role_kind<>'marketing_task' OR NOT m.eligibility_enforced OR private.org_marketing_eligible(m.user_id,c)) UNION ALL SELECT ur.user_id,r.id,'direct',r.id,NULL,true,true,'native',r.permissions FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE private.is_active(ur.user_id) $function$
;

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
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND m->>'status'='active' AND coalesce((t->>'active')::boolean,false) AND t->>'source' IS DISTINCT FROM 'biz_positions' AND r.id NOT IN ('role-admin','role-super-admin') AND m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) AND private.org_role_permission_ready(p) AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) root WHERE root->>'kind' IN ('company','block') AND private.base_role_unit_contains(c,root->>'id',m->>'unit_id')) $function$
;