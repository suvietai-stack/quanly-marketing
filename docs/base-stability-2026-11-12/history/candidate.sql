-- STAGED ONLY. Requires paired history UI deployment; do not apply alone.
CREATE OR REPLACE FUNCTION public.org_workspace_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE c jsonb;super_ boolean;visible text[];assign_ text[];appoint_ text[];structure_ text[];history_ text[];configured boolean;rules_ jsonb;BEGIN IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Vui lòng đăng nhập lại.';END IF;super_:=private.is_super_admin(auth.uid());c:=private.org_config();
 IF super_ THEN
   SELECT coalesce(array_agg(id),'{}') INTO visible FROM org_units;
   assign_:=visible;appoint_:=visible;structure_:=visible;history_:=visible;
 ELSE
   rules_:=private.base_rules(auth.uid(),c);
   SELECT EXISTS(SELECT 1 FROM jsonb_array_elements(rules_) r WHERE r->>'permission' LIKE 'org.%') INTO configured;
   WITH RECURSIVE units AS MATERIALIZED (SELECT id,parent_id,active FROM org_units),
   closure(root_id,id,path) AS (
     SELECT id,id,ARRAY[id] FROM units WHERE active
     UNION ALL SELECT t.root_id,u.id,t.path||u.id FROM closure t JOIN units u ON u.parent_id=t.id WHERE u.active AND NOT u.id=ANY(t.path)
   ), rules AS MATERIALIZED (SELECT r->>'permission' permission,r->>'effect' effect,nullif(r->>'unit_id','') root FROM jsonb_array_elements(rules_) r WHERE r->>'permission' IN ('org.assign_staff','org.appoint_manager','org.manage_structure','org.view_history','org.view')),
   decisions AS MATERIALIZED (
     SELECT u.id,p.permission,u.active AND coalesce(bool_or(r.effect='ALLOW'),false) AND NOT coalesce(bool_or(r.effect='DENY'),false) allowed
     FROM units u CROSS JOIN (VALUES ('org.assign_staff'),('org.appoint_manager'),('org.manage_structure'),('org.view_history'),('org.view')) p(permission)
     LEFT JOIN rules r ON r.permission=p.permission AND (r.root IS NULL OR EXISTS(SELECT 1 FROM closure t WHERE t.root_id=r.root AND t.id=u.id))
     GROUP BY u.id,u.active,p.permission
   ), folded AS (
     SELECT id,bool_or(allowed) FILTER(WHERE permission='org.assign_staff') a,
       bool_or(allowed) FILTER(WHERE permission='org.appoint_manager') b,
       bool_or(allowed) FILTER(WHERE permission='org.manage_structure') s,
       bool_or(allowed) FILTER(WHERE permission='org.view_history') h,
       bool_or(allowed) FILTER(WHERE permission='org.view') v FROM decisions GROUP BY id
   ) SELECT coalesce(array_agg(id) FILTER(WHERE a),'{}'),coalesce(array_agg(id) FILTER(WHERE b),'{}'),
     coalesce(array_agg(id) FILTER(WHERE s),'{}'),coalesce(array_agg(id) FILTER(WHERE h),'{}'),
     coalesce(array_agg(id) FILTER(WHERE v OR a OR b OR s OR NOT configured),'{}')
     INTO assign_,appoint_,structure_,history_,visible FROM folded;
 END IF;

 c:=c||jsonb_build_object('units',(SELECT coalesce(jsonb_agg(x),'[]') FROM jsonb_array_elements(c->'units') x WHERE x->>'id'=ANY(visible)),'titles',(SELECT coalesce(jsonb_agg(x),'[]') FROM jsonb_array_elements(c->'titles') x WHERE super_ OR x->>'unit_id'=ANY(visible) OR (x->>'unit_id' IS NULL AND EXISTS(SELECT 1 FROM org_units u WHERE u.id=ANY(visible) AND (u.kind=x->>'unit_kind' OR (x->>'unit_kind'='individual' AND u.kind IN ('department','team')))))),'memberships',(SELECT coalesce(jsonb_agg(x),'[]') FROM jsonb_array_elements(c->'memberships') x WHERE x->>'unit_id'=ANY(visible) AND (super_ OR x->>'unit_id'=ANY(history_) OR ((x->>'active')::boolean AND (nullif(x->>'starts_at','') IS NULL OR (x->>'starts_at')::timestamptz<=now())))));
 IF NOT super_ THEN c:=c||jsonb_build_object('defaults','[]'::jsonb,'grants','[]'::jsonb,'bindings','[]'::jsonb,'bundles','[]'::jsonb);END IF;
 RETURN jsonb_build_object('revision',(SELECT revision FROM private.org_control WHERE id),'server_now',now(),'config',c,'staff',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',full_name,'status',status)),'[]') FROM profiles WHERE super_ OR cardinality(assign_||appoint_)>0 OR id IN (SELECT user_id FROM org_assignments WHERE unit_id=ANY(visible) AND (ends_at IS NULL OR ends_at>now()) AND (starts_at IS NULL OR starts_at<=now()))),'catalog','[]'::jsonb,'actor',jsonb_build_object('super',super_,'assign_all',super_,'appoint_all',super_,'assign_units',assign_,'appoint_units',appoint_,'structure_units',structure_,'view_history',cardinality(history_)>0,'history_units',history_),'events',(SELECT coalesce(jsonb_agg(to_jsonb(e)-'before_data'-'after_data' ORDER BY e.created_at DESC,e.id DESC),'[]') FROM (SELECT * FROM org_events e WHERE super_ OR (jsonb_array_length(e.unit_ids)>0 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(e.unit_ids) u WHERE NOT u=ANY(history_))) ORDER BY created_at DESC,id DESC LIMIT 20)e));END $function$;

CREATE OR REPLACE FUNCTION public.org_history_page(_before timestamptz DEFAULT NULL,_before_id uuid DEFAULT NULL,_limit integer DEFAULT 20)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE super_ boolean;history_ text[];result_ jsonb;BEGIN
IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Vui lòng đăng nhập lại.' USING ERRCODE='42501'; END IF;
 super_:=private.is_super_admin(auth.uid());
 SELECT coalesce(array_agg(id),'{}') INTO history_ FROM org_units WHERE super_ OR private.org_can(auth.uid(),'org.view_history',id);
IF _limit NOT BETWEEN 1 AND 50 OR ((_before IS NULL) IS DISTINCT FROM (_before_id IS NULL)) THEN RAISE EXCEPTION 'Phân trang không hợp lệ.'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(e)-'before_data'-'after_data' ORDER BY e.created_at DESC,e.id DESC),'[]') INTO result_
 FROM (SELECT * FROM org_events e WHERE (super_ OR (jsonb_array_length(e.unit_ids)>0 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(e.unit_ids) u WHERE NOT u=ANY(history_)))) AND (_before IS NULL OR (e.created_at,e.id)<(_before,_before_id)) ORDER BY e.created_at DESC,e.id DESC LIMIT _limit) e;
 RETURN result_;END $function$;
REVOKE ALL ON FUNCTION public.org_history_page(timestamptz,uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.org_history_page(timestamptz,uuid,integer) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.org_event_detail(_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE super_ boolean;history_ text[];result_ jsonb;BEGIN
IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Vui lòng đăng nhập lại.' USING ERRCODE='42501'; END IF;
 super_:=private.is_super_admin(auth.uid());
 SELECT coalesce(array_agg(id),'{}') INTO history_ FROM org_units WHERE super_ OR private.org_can(auth.uid(),'org.view_history',id);
SELECT to_jsonb(e) INTO result_ FROM org_events e WHERE e.id=_id AND (super_ OR (jsonb_array_length(e.unit_ids)>0 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(e.unit_ids) u WHERE NOT u=ANY(history_))));
 IF result_ IS NULL THEN RAISE EXCEPTION 'Không tìm thấy sự kiện trong phạm vi.' USING ERRCODE='42501';END IF;
 RETURN result_;END $function$;
REVOKE ALL ON FUNCTION public.org_event_detail(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.org_event_detail(uuid) TO authenticated,service_role;
