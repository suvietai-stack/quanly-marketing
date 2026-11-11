-- Existing title links are untouched; new edits enforce the single position Role contract.
DO $patch$ DECLARE d text; needle text; BEGIN
 SELECT pg_get_functiondef('private.org_commands_v2(jsonb)'::regprocedure) INTO d;
 needle:='IF x->>''action''<>''roles'' THEN';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Role command contract changed.'; END IF;
 EXECUTE replace(d,needle,$guard$IF x->>'action'='roles' AND (jsonb_typeof(v->'roles') IS DISTINCT FROM 'array' OR jsonb_array_length(v->'roles')<>1 OR EXISTS(SELECT 1 FROM jsonb_array_elements(v->'roles') l LEFT JOIN app_roles r ON r.id=l->>'role_id' WHERE r.id IS NULL OR r.role_kind<>'position' OR r.catalog_state<>'standard' OR r.id IN ('role-admin','role-super-admin'))) THEN RAISE EXCEPTION 'Chức danh chỉ liên kết đúng một Role vị trí chuẩn.'; END IF;
 IF x->>'action'<>'roles' THEN$guard$);
 END $patch$;
-- Assigning a task must target a Marketing unit, not merely a non-business title.
DO $patch$ DECLARE d text; needle text; BEGIN
 SELECT pg_get_functiondef('private.org_commands(jsonb)'::regprocedure) INTO d;
 needle:='IF coalesce(v->''specialty_ids'',''[]'')<>''[]''::jsonb THEN';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Specialty assignment contract changed.'; END IF;
 EXECUTE replace(d,needle,needle||$guard$
 IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(v->'specialty_ids') sid JOIN mkt_specialties sp ON sp.id=sid JOIN app_roles r ON r.id=sp.role_id WHERE r.role_kind='marketing_task') AND NOT EXISTS(SELECT 1 FROM org_units b WHERE b.kind='block' AND b.name='Khối Marketing' AND private.base_role_unit_contains(private.org_config(),b.id,unit_.id)) THEN RAISE EXCEPTION 'Nhiệm vụ Marketing chỉ gắn với bổ nhiệm trong Khối Marketing.'; END IF;
 $guard$);
 END $patch$;
-- Receivers count actual permission sources, not just assignment links.
DO $patch$ DECLARE d text; old_ text; new_ text; BEGIN
 SELECT pg_get_functiondef('public.role_catalog_read()'::regprocedure) INTO d;
 old_:='SELECT count(DISTINCT a.user_id) FROM org_assignments a JOIN base_title_role_links l ON l.title_id=a.title_id WHERE l.role_id=r.id AND a.status=''active'' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())';
 new_:=$sql$SELECT count(*) FROM profiles p WHERE EXISTS(SELECT 1 FROM jsonb_array_elements(private.base_rules(p.id,c)) rule WHERE rule->>'role_id'=r.id AND rule->>'effect'='ALLOW' AND private.has_permission(p.id,rule->>'permission'))$sql$;
 IF strpos(d,old_)=0 THEN RAISE EXCEPTION 'Role receiver contract changed.'; END IF; EXECUTE replace(d,old_,new_);
 END $patch$;