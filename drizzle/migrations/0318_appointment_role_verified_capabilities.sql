ALTER TABLE public.base_title_role_links ADD COLUMN enabled_permissions text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.base_title_role_links ADD COLUMN permission_signature text;
COMMENT ON COLUMN public.base_title_role_links.active IS 'Full-Role activation remains fenced; enabled_permissions activates only verified personal capabilities without modifying user_roles.';
CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT p=ANY(ARRAY['leave.create','leave.view_own','leave.edit_own','leave.recall','att.create','att.view_own','att.edit_own','att.witness','order.view','order.view_mine','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery']) $$;
DO $$ DECLARE d text;BEGIN
 SELECT pg_get_functiondef('private.base_supported(text)'::regprocedure) INTO d;EXECUTE replace(d,'FUNCTION private.base_supported(','FUNCTION private.org_role_previous_supported(');
 SELECT pg_get_functiondef('private.base_rules(uuid,jsonb)'::regprocedure) INTO d;EXECUTE replace(d,'FUNCTION private.base_rules(','FUNCTION private.org_role_previous_rules(');
 SELECT pg_get_functiondef('private.base_config()'::regprocedure) INTO d;EXECUTE replace(d,'FUNCTION private.base_config(','FUNCTION private.org_role_previous_config(');
 SELECT pg_get_functiondef('private.org_config()'::regprocedure) INTO d;EXECUTE replace(d,'FUNCTION private.org_config(','FUNCTION private.org_role_previous_org_config(');
END $$;
CREATE OR REPLACE FUNCTION private.base_supported(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT private.org_role_previous_supported(p) OR private.org_role_permission_ready(p) $$;
CREATE OR REPLACE FUNCTION private.org_config() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.org_role_previous_org_config()||jsonb_build_object('role_links',(SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY title_source,title_id,role_id),'[]') FROM base_title_role_links l)) $$;
CREATE OR REPLACE FUNCTION private.base_config() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.org_role_previous_config()||jsonb_build_object('role_links',private.org_config()->'role_links','memberships',private.org_config()->'memberships','units',private.org_config()->'units','titles',private.org_config()->'titles') $$;
CREATE OR REPLACE FUNCTION private.org_role_rules(u uuid,c jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',(m->>'id')||':'||(l->>'role_id')||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','appointment_role','source_id',m->>'id','source_name',r.name,'role_id',r.id,'unit_id',m->>'unit_id','starts_at',m->>'starts_at','ends_at',m->>'ends_at')),'[]')
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m
 JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id'
 JOIN LATERAL jsonb_array_elements(coalesce(c->'role_links','[]')) l ON l->>'title_id'=t->>'id' AND l->>'title_source'='base'
 JOIN app_roles r ON r.id=l->>'role_id'
 CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(l->'enabled_permissions','[]')) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active'
 AND coalesce((t->>'active')::boolean,false) AND t->>'source' IS DISTINCT FROM 'biz_positions'
 AND l->>'scope_kind'='own' AND r.id NOT IN ('role-admin','role-super-admin') AND l->>'permission_signature'=md5(coalesce(r.permissions,'{}')::text)
 AND p=ANY(r.permissions) AND private.org_role_permission_ready(p)
 AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) root WHERE root->>'kind' IN ('company','block') AND private.base_role_unit_contains(c,root->>'id',m->>'unit_id')) $$;
CREATE OR REPLACE FUNCTION private.base_rules(u uuid,c jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.org_role_previous_rules(u,c)||private.org_role_rules(u,c) $$;
CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid,_permission text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.is_active(_user_id) AND (private.is_super_admin(_user_id) OR CASE
 WHEN (private.org_role_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id,_permission)='DENY' THEN false
 WHEN (private.org_role_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id,_permission)='ALLOW' THEN true
 WHEN EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_user_id AND use_custom=true) THEN EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_user_id AND _permission=ANY(permissions))
 ELSE EXISTS(SELECT 1 FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE ur.user_id=_user_id AND _permission=ANY(r.permissions)) END) $$;
CREATE OR REPLACE FUNCTION private.org_commands_v2(changes_ jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
 DECLARE x jsonb;v jsonb;r jsonb;n int;before_ jsonb;after_ jsonb;src text;result_ jsonb:='[]';BEGIN
 IF jsonb_typeof(changes_) IS DISTINCT FROM 'array' OR jsonb_array_length(changes_) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Danh sách thay đổi không hợp lệ.';END IF;
 FOR x IN SELECT value FROM jsonb_array_elements(changes_) LOOP
 IF x->>'action'<>'roles' THEN result_:=result_||private.org_commands(jsonb_build_array(x));CONTINUE;END IF;
 v:=x->'data';IF NOT private.org_execution_ok() OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được liên kết Role qua xem trước.';END IF;
 SELECT source INTO src FROM org_titles WHERE id=v->>'id' AND active;IF NOT FOUND OR src='biz_positions' THEN RAISE EXCEPTION 'Giữ nguyên chức vụ và quyền Kinh doanh; chức vụ phải đang hoạt động.';END IF;
 IF jsonb_typeof(v->'roles') IS DISTINCT FROM 'array' OR jsonb_array_length(v->'roles')>20 THEN RAISE EXCEPTION 'Danh sách Role không hợp lệ.';END IF;
 SELECT count(*) INTO n FROM jsonb_array_elements(v->'roles') r WHERE coalesce((r->>'is_primary')::boolean,false);
 IF (jsonb_array_length(v->'roles')>0 AND n<>1) OR EXISTS(SELECT 1 FROM jsonb_array_elements(v->'roles') r GROUP BY r->>'role_id' HAVING count(*)>1) THEN RAISE EXCEPTION 'Chọn đúng một Role chính, không trùng Role.';END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(v->'roles') LOOP
 IF r->>'role_id' IN ('role-admin','role-super-admin') OR NOT EXISTS(SELECT 1 FROM app_roles WHERE id=r->>'role_id') OR coalesce((r->>'active')::boolean,false) OR coalesce(r->>'scope_kind','unit') NOT IN ('own','unit') THEN RAISE EXCEPTION 'Role quản trị hoặc Role không hợp lệ.';END IF;
 IF jsonb_typeof(coalesce(r->'enabled_permissions','[]')) IS DISTINCT FROM 'array' OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(coalesce(r->'enabled_permissions','[]')) p WHERE NOT private.org_role_permission_ready(p) OR NOT EXISTS(SELECT 1 FROM app_roles a WHERE a.id=r->>'role_id' AND p=ANY(a.permissions))) THEN RAISE EXCEPTION 'Chức năng chưa được kiểm chứng an toàn hoặc không thuộc Role.';END IF;
 IF jsonb_array_length(coalesce(r->'enabled_permissions','[]'))>0 AND r->>'scope_kind' IS DISTINCT FROM 'own' THEN RAISE EXCEPTION 'Chưa kiểm chứng quyền quản lý theo đơn vị; chỉ bật chức năng cá nhân.';END IF;
 END LOOP;
 SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY role_id),'[]') INTO before_ FROM base_title_role_links l WHERE title_source='base' AND title_id=v->>'id';
 DELETE FROM base_title_role_links WHERE title_source='base' AND title_id=v->>'id';
 INSERT INTO base_title_role_links(title_source,title_id,role_id,is_primary,scope_kind,active,reason,updated_by,enabled_permissions,permission_signature)
 SELECT 'base',v->>'id',r->>'role_id',coalesce((r->>'is_primary')::boolean,false),coalesce(r->>'scope_kind','unit'),false,coalesce(v->>'reason','Liên kết Role'),auth.uid(),ARRAY(SELECT DISTINCT jsonb_array_elements_text(coalesce(r->'enabled_permissions','[]'))),md5(coalesce(a.permissions,'{}')::text)
 FROM jsonb_array_elements(v->'roles') r JOIN app_roles a ON a.id=r->>'role_id';
 SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY role_id),'[]') INTO after_ FROM base_title_role_links l WHERE title_source='base' AND title_id=v->>'id';
 INSERT INTO base_title_role_events(actor_id,title_source,title_id,reason,before_data,after_data) VALUES(auth.uid(),'base',v->>'id',coalesce(v->>'reason','Liên kết Role'),before_,after_);result_:=result_||jsonb_build_array('org-company');
 END LOOP;RETURN result_;END $$;
DO $$ DECLARE d text;BEGIN
 SELECT pg_get_functiondef('private.org_effect_signature(jsonb,jsonb)'::regprocedure) INTO d;
 d:=replace(d,$s$'permissions',jsonb_build_object($s$,$s$'role_links',(SELECT coalesce(jsonb_agg(x ORDER BY x::text),'[]') FROM (SELECT jsonb_build_object('title_source',l->>'title_source','title_id',l->>'title_id','role_id',l->>'role_id','is_primary',l->'is_primary','scope_kind',l->>'scope_kind','enabled_permissions',l->'enabled_permissions','permission_signature',l->>'permission_signature') x FROM jsonb_array_elements(coalesce(c->'role_links','[]')) l)s),'permissions',jsonb_build_object($s$);
 IF d NOT LIKE '%enabled_permissions%' THEN RAISE EXCEPTION 'Cannot patch effect signature';END IF;EXECUTE d;
END $$;
CREATE OR REPLACE FUNCTION private.org_role_impact(b jsonb,a jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ DECLARE u record;x jsonb;y jsonb;diff jsonb;result jsonb:='[]';BEGIN FOR u IN SELECT id,full_name FROM profiles LOOP x:=private.base_effective(u.id,b);y:=private.base_effective(u.id,a);SELECT coalesce(jsonb_agg(jsonb_build_object('key',n->>'key','label',n->>'label','before',o,'after',n)),'[]') INTO diff FROM jsonb_array_elements(y)n JOIN jsonb_array_elements(x)o ON n->>'key'=o->>'key' WHERE n IS DISTINCT FROM o;IF jsonb_array_length(diff)>0 THEN result:=result||jsonb_build_array(jsonb_build_object('user_id',u.id,'name',u.full_name,'changes',diff));END IF;END LOOP;RETURN result;END $$;
DO $$ DECLARE d text;BEGIN SELECT pg_get_functiondef('public.org_change(text,bigint,jsonb,uuid,text,text)'::regprocedure) INTO d;d:=replace(d,$s$'impact','[]'::jsonb$s$,$s$'impact',private.org_role_impact(before_,after_)$s$);EXECUTE d;END $$;
CREATE OR REPLACE FUNCTION public.base_title_roles_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) OR NOT (private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.role') OR private.has_permission(auth.uid(),'settings.permission')) THEN RAISE EXCEPTION 'Không có quyền xem danh mục Role.';END IF;
 RETURN jsonb_build_object('server_now',now(),'roles',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'restricted',r.id IN ('role-admin','role-super-admin'),'permissions',r.permissions,'checks',(SELECT coalesce(jsonb_agg(jsonb_build_object('key',p,'ready',private.org_role_permission_ready(p),'reason',CASE WHEN private.org_role_permission_ready(p) THEN 'native_personal_verified' WHEN p LIKE 'biz.%' OR p LIKE 'k3.%' THEN 'appointment_only' ELSE 'scope_audit_pending' END)),'[]') FROM unnest(r.permissions)p)) ORDER BY r.name),'[]') FROM app_roles r),'links',private.org_config()->'role_links','titles',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'source',source,'active',active)),'[]') FROM org_titles),'sources',CASE WHEN private.is_super_admin(auth.uid()) THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',p.id,'rules',private.org_role_rules(p.id,private.base_config()))),'[]') FROM profiles p) ELSE '[]'::jsonb END,'events',CASE WHEN private.is_super_admin(auth.uid()) THEN (SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]') FROM (SELECT * FROM base_title_role_events ORDER BY created_at DESC LIMIT 50)e) ELSE '[]'::jsonb END,'direct_roles',CASE WHEN private.is_super_admin(auth.uid()) THEN (SELECT coalesce(jsonb_agg(to_jsonb(u)),'[]') FROM user_roles u) ELSE '[]'::jsonb END,'activation_ready',false);
 END $$;
DO $$ DECLARE r record;BEGIN FOR r IN SELECT p.oid::regprocedure fn FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='private' AND p.proname LIKE 'org_role_%' LOOP EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated,service_role',r.fn);END LOOP;END $$;
REVOKE ALL ON FUNCTION private.org_commands_v2(jsonb),private.org_role_impact(jsonb,jsonb) FROM PUBLIC,anon,authenticated,service_role;