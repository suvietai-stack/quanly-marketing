-- Read-path performance fix only: resolve Role and personal override ONCE per
-- identity instead of executing their two SELECTs for every one of 510 keys.
-- The existing biz/k3 legacy resolvers and all tier-one deny/allow decisions
-- remain authoritative. This function does not grant new permissions.
-- Before enabling, regression compare JSONB output against the old resolver
-- for admin, additive, replace and standard staff accounts.
CREATE OR REPLACE FUNCTION private.base_effective(u uuid, c jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  active_ boolean;
  privileged_ boolean;
  rules_ jsonb;
  result_ jsonb;
BEGIN
  active_ := private.is_active(u);
  privileged_ := private.is_super_admin(u);
  rules_ := private.base_rules(u,c);

  WITH role_context AS MATERIALIZED (
    SELECT
      coalesce((
        SELECT array_agg(DISTINCT perm)
        FROM public.user_roles ur
        JOIN public.app_roles ar ON ar.id=ur.role_id
        CROSS JOIN LATERAL unnest(ar.permissions) perm
        WHERE ur.user_id=u
      ),ARRAY[]::text[]) AS perms,
      coalesce((
        SELECT jsonb_agg(ar.name)
        FROM public.user_roles ur JOIN public.app_roles ar ON ar.id=ur.role_id
        WHERE ur.user_id=u
      ),'[]'::jsonb) AS names
  ), ov AS MATERIALIZED (
    SELECT mode,coalesce(permissions,ARRAY[]::text[]) AS permissions
    FROM public.user_permission_overrides
    WHERE user_id=u AND use_custom=true LIMIT 1
  ), rules AS MATERIALIZED (
    SELECT x->>'permission' AS key,jsonb_agg(x ORDER BY ord) AS sources,
      coalesce(bool_or(x->>'effect'='DENY'),false) AS deny_,
      coalesce(bool_or(x->>'effect'='ALLOW'),false) AS allow_
    FROM jsonb_array_elements(rules_) WITH ORDINALITY AS r(x,ord)
    GROUP BY x->>'permission'
  ), catalog AS MATERIALIZED (
    SELECT cat.*,private.base_supported(cat.key) AS supported,
      privileged_ OR (cat.key LIKE 'biz.crm_%' AND public.biz_admin(u)) AS bypass
    FROM public.base_permission_catalog cat
  ), legacies AS MATERIALIZED (
    SELECT cat.*,
      CASE WHEN cat.key LIKE 'biz.%' OR cat.key LIKE 'k3.%'
        THEN private.base_legacy(u,cat.key)
        ELSE jsonb_build_object(
          'allowed',
          CASE WHEN o.mode='replace' THEN cat.key=ANY(o.permissions)
            ELSE cat.key=ANY(rc.perms) OR
              (coalesce(o.mode,'')='additive' AND cat.key=ANY(o.permissions)) END,
          'source',
          CASE WHEN o.mode='replace' THEN '{"kind":"custom","tier":3}'::jsonb
            WHEN NOT cat.key=ANY(rc.perms) AND coalesce(o.mode,'')='additive'
              AND cat.key=ANY(o.permissions)
              THEN '{"kind":"custom","tier":3,"mode":"additive"}'::jsonb
            ELSE jsonb_build_object('kind','role','tier',3,'names',rc.names)
          END
        )
      END AS legacy
    FROM catalog cat CROSS JOIN role_context rc LEFT JOIN ov o ON true
  ), decisions AS MATERIALIZED (
    SELECT r.*,coalesce(g.sources,'[]'::jsonb) AS sources,
      coalesce(g.deny_,false) AS deny_,coalesce(g.allow_,false) AS allow_,
      CASE WHEN r.supported
        THEN CASE WHEN g.deny_ THEN 'DENY' WHEN g.allow_ THEN 'ALLOW'
          ELSE 'NOT_CONFIGURED' END
        ELSE 'NOT_CONFIGURED' END AS decision
    FROM legacies r LEFT JOIN rules g USING(key)
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'key',key,'label',label,'module',module,
    'allowed',active_ AND (bypass OR
      CASE WHEN decision='DENY' THEN false WHEN decision='ALLOW' THEN true
        ELSE (legacy->>'allowed')::boolean END),
    'decision',decision,'bypass',bypass,
    'tier',CASE WHEN bypass THEN 0 WHEN decision<>'NOT_CONFIGURED' THEN 1
      ELSE (legacy->'source'->>'tier')::int END,
    'legacy',legacy,'sources',sources,'supported',supported,
    'scope',CASE WHEN key LIKE 'biz.crm_%' AND decision='ALLOW' THEN 'own' ELSE 'native' END,
    'conflict',allow_ AND deny_
  ) ORDER BY module,key),'[]'::jsonb)
  INTO result_ FROM decisions;

  RETURN result_;
END
$function$;
