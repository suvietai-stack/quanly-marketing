CREATE OR REPLACE FUNCTION private.org_assignment_specialty_rules(u uuid,c jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','assignment-specialty:'||(m->>'id')||':'||s.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','marketing_appointment','source_id',m->>'id','source_name',s.name,'role_id',r.id,'unit_id',m->>'unit_id','starts_at',m->>'starts_at','ends_at',m->>'ends_at')),'[]')
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id'
 CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid
 JOIN mkt_specialties s ON s.id=sid AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND m->>'status'='active' AND coalesce((t->>'active')::boolean,false) AND t->>'source' IS DISTINCT FROM 'biz_positions' AND r.id NOT IN ('role-admin','role-super-admin') AND m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) AND private.org_role_permission_ready(p) AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) root WHERE root->>'kind' IN ('company','block') AND private.base_role_unit_contains(c,root->>'id',m->>'unit_id')) $$;
DO $$ DECLARE d text;BEGIN SELECT pg_get_functiondef('private.base_rules(uuid,jsonb)'::regprocedure) INTO d; EXECUTE replace(d,'FUNCTION private.base_rules(','FUNCTION private.phase3a_previous_rules('); END $$;
CREATE OR REPLACE FUNCTION private.base_rules(u uuid,c jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.phase3a_previous_rules(u,c)||private.org_assignment_specialty_rules(u,c) $$;
DO $$ DECLARE d text;BEGIN
 SELECT pg_get_functiondef('private.org_commands(jsonb)'::regprocedure) INTO d;
 IF d NOT LIKE '%at_:=coalesce(nullif(v->>''starts_at''%' THEN RAISE EXCEPTION 'Unexpected assignment contract';END IF;
 d:=replace(d,$s$at_:=coalesce(nullif(v->>'starts_at','')::timestamptz,clock_timestamp());$s$,$s$IF coalesce(v->'specialty_ids','[]')<>'[]'::jsonb THEN
 IF title_.source='biz_positions' OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Nhiệm vụ theo phân công chỉ cho Super Admin, không thay đổi Kinh doanh.';END IF;
 IF jsonb_typeof(v->'specialty_ids') IS DISTINCT FROM 'array' OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(v->'specialty_ids') x WHERE NOT EXISTS(SELECT 1 FROM mkt_specialties s WHERE s.id=x AND s.active AND s.role_id NOT IN ('role-admin','role-super-admin'))) THEN RAISE EXCEPTION 'Nhiệm vụ Marketing không hợp lệ.';END IF;
 v:=v||jsonb_build_object('specialty_signatures',(SELECT jsonb_object_agg(s.id,md5(coalesce(r.permissions,'{}')::text)) FROM mkt_specialties s JOIN app_roles r ON r.id=s.role_id WHERE s.id IN (SELECT jsonb_array_elements_text(v->'specialty_ids'))));
 ELSE v:=v-'specialty_signatures';END IF;
 at_:=coalesce(nullif(v->>'starts_at','')::timestamptz,clock_timestamp());$s$); EXECUTE d;
 SELECT pg_get_functiondef('private.org_fingerprint()'::regprocedure) INTO d;EXECUTE replace(d,'FUNCTION private.org_fingerprint(','FUNCTION private.phase3a_previous_fingerprint(');
END $$;
CREATE OR REPLACE FUNCTION private.org_fingerprint() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT md5(private.phase3a_previous_fingerprint()||coalesce((SELECT string_agg(to_jsonb(s)::text,'|' ORDER BY s.id) FROM mkt_specialties s),'')) $$;
REVOKE ALL ON FUNCTION private.org_assignment_specialty_rules(uuid,jsonb),private.phase3a_previous_rules(uuid,jsonb),private.phase3a_previous_fingerprint() FROM PUBLIC,anon,authenticated,service_role;