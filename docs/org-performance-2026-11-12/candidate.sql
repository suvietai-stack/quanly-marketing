-- STAGED ONLY: owner must approve exact SHA256 before live execution. No data/RLS/Role writes.
DO $preflight$ BEGIN
 IF md5(pg_get_functiondef('public.org_workspace_read()'::regprocedure)) <> 'cec7b76e1dfb8f4cae00e13a4fd6d0e4' OR pg_get_userbyid((SELECT proowner FROM pg_proc WHERE oid='public.org_workspace_read()'::regprocedure)) <> 'postgres' OR (SELECT proacl::text FROM pg_proc WHERE oid='public.org_workspace_read()'::regprocedure) IS DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}' THEN RAISE EXCEPTION 'Baseline changed: public.org_workspace_read'; END IF;
 IF md5(pg_get_functiondef('private.base_effective(uuid,jsonb)'::regprocedure)) <> '527ea1caab337534d91764ce27671cca' OR pg_get_userbyid((SELECT proowner FROM pg_proc WHERE oid='private.base_effective(uuid,jsonb)'::regprocedure)) <> 'postgres' OR (SELECT proacl::text FROM pg_proc WHERE oid='private.base_effective(uuid,jsonb)'::regprocedure) IS DISTINCT FROM '{postgres=X/postgres}' THEN RAISE EXCEPTION 'Baseline changed: private.base_effective'; END IF;
 IF md5(pg_get_functiondef('public.base_permissions_effective(uuid)'::regprocedure)) <> '296ec39cdb9cb4098e1a7b04329f88bb' OR pg_get_userbyid((SELECT proowner FROM pg_proc WHERE oid='public.base_permissions_effective(uuid)'::regprocedure)) <> 'postgres' OR (SELECT proacl::text FROM pg_proc WHERE oid='public.base_permissions_effective(uuid)'::regprocedure) IS DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}' THEN RAISE EXCEPTION 'Baseline changed: public.base_permissions_effective'; END IF;
END $preflight$;
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
 RETURN jsonb_build_object('revision',(SELECT revision FROM private.org_control WHERE id),'server_now',now(),'config',c,'staff',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',full_name,'status',status)),'[]') FROM profiles WHERE super_ OR cardinality(assign_||appoint_)>0 OR id IN (SELECT user_id FROM org_assignments WHERE unit_id=ANY(visible) AND (ends_at IS NULL OR ends_at>now()) AND (starts_at IS NULL OR starts_at<=now()))),'catalog','[]'::jsonb,'actor',jsonb_build_object('super',super_,'assign_all',super_,'appoint_all',super_,'assign_units',assign_,'appoint_units',appoint_,'structure_units',structure_,'view_history',cardinality(history_)>0,'history_units',history_),'events',(SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]') FROM (SELECT * FROM org_events e WHERE super_ OR (jsonb_array_length(e.unit_ids)>0 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(e.unit_ids) u WHERE NOT u=ANY(history_))) ORDER BY created_at DESC LIMIT 100)e));END $function$
;
CREATE OR REPLACE FUNCTION private.base_effective(u uuid,c jsonb) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $function$
DECLARE active_ boolean; privileged_ boolean; rules_ jsonb; result_ jsonb;
BEGIN
 active_:=private.is_active(u);privileged_:=private.is_super_admin(u);rules_:=private.base_rules(u,c);
 WITH rule_groups AS MATERIALIZED (
  SELECT x->>'permission' key,jsonb_agg(x ORDER BY ord) sources,
   coalesce(bool_or(x->>'effect'='DENY'),false) deny_,coalesce(bool_or(x->>'effect'='ALLOW'),false) allow_
  FROM jsonb_array_elements(rules_) WITH ORDINALITY AS r(x,ord) GROUP BY x->>'permission'
 ), catalog AS MATERIALIZED (
  SELECT r.*,private.base_supported(r.key) supported,private.base_legacy(u,r.key) legacy,
   privileged_ OR (r.key LIKE 'biz.crm_%' AND public.biz_admin(u)) bypass
  FROM base_permission_catalog r
 ), decisions AS MATERIALIZED (
  SELECT r.*,coalesce(g.sources,'[]'::jsonb) sources,coalesce(g.deny_,false) deny_,coalesce(g.allow_,false) allow_,
   CASE WHEN r.supported THEN CASE WHEN g.deny_ THEN 'DENY' WHEN g.allow_ THEN 'ALLOW' ELSE 'NOT_CONFIGURED' END ELSE 'NOT_CONFIGURED' END decision
  FROM catalog r LEFT JOIN rule_groups g USING(key)
 ) SELECT coalesce(jsonb_agg(jsonb_build_object(
  'key',key,'label',label,'module',module,'allowed',active_ AND (bypass OR CASE WHEN decision='DENY' THEN false WHEN decision='ALLOW' THEN true ELSE (legacy->>'allowed')::boolean END),
  'decision',decision,'bypass',bypass,'tier',CASE WHEN bypass THEN 0 WHEN decision<>'NOT_CONFIGURED' THEN 1 ELSE (legacy->'source'->>'tier')::int END,
  'legacy',legacy,'sources',sources,'supported',supported,'scope',CASE WHEN key LIKE 'biz.crm_%' AND decision='ALLOW' THEN 'own' ELSE 'native' END,'conflict',allow_ AND deny_
 ) ORDER BY module,key),'[]'::jsonb) INTO result_ FROM decisions;
 RETURN result_;
END $function$;
CREATE OR REPLACE FUNCTION public.base_permissions_effective(_user uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE c_ jsonb;u uuid:=coalesce(_user,auth.uid());BEGIN IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) OR (u<>auth.uid() AND NOT private.base_org_admin()) THEN RAISE EXCEPTION 'Không có quyền xem phân quyền.';END IF;c_:=private.base_config();RETURN jsonb_build_object('user_id',u,'revision',coalesce((SELECT revision FROM base_org_state WHERE id),0),'server_now',now(),'next_transition_at',private.base_next_transition(c_),'permissions',private.base_effective(u,c_));END $function$
;
