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
