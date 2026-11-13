-- Performance-only replacement of the existing permission detail resolver.
-- The legacy fallback previously queried user_roles and personal overrides once for
-- every catalog key (510 keys in Nov 2026). Snapshot those rows once per actor.
-- The decision order, deny precedence, output JSON fields and RLS boundaries remain unchanged.
-- Verified by read-only JSONB equality checks for Julia (personal additive), a Role
-- account, a replace-mode account and a system administrator before staging.
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
        SELECT array_agg(DISTINCT p)
        FROM public.user_roles ur
        JOIN public.app_roles ar ON ar.id = ur.role_id
        CROSS JOIN LATERAL unnest(ar.permissions) p
        WHERE ur.user_id = u
      ), ARRAY[]::text[]) AS perms,
      coalesce((
        SELECT jsonb_agg(ar.name)
        FROM public.user_roles ur
        JOIN public.app_roles ar ON ar.id = ur.role_id
        WHERE ur.user_id = u
      ), '[]'::jsonb) AS names
  ), override_context AS MATERIALIZED (
    SELECT use_custom, mode, permissions
    FROM public.user_permission_overrides
    WHERE user_id = u
  ), rule_groups AS MATERIALIZED (
    SELECT x->>'permission' AS key, jsonb_agg(x ORDER BY ord) AS sources,
      coalesce(bool_or(x->>'effect'='DENY'),false) AS deny_,
      coalesce(bool_or(x->>'effect'='ALLOW'),false) AS allow_
    FROM jsonb_array_elements(rules_) WITH ORDINALITY AS r(x,ord)
    GROUP BY x->>'permission'
  ), catalog AS MATERIALIZED (
    SELECT r.*, private.base_supported(r.key) AS supported,
      privileged_ OR (r.key LIKE 'biz.crm_%' AND public.biz_admin(u)) AS bypass
    FROM public.base_permission_catalog r
  ), legacies AS MATERIALIZED (
    SELECT c.*,
      CASE
        -- Business access keeps its existing independent, authoritative resolvers.
        WHEN c.key LIKE 'biz.%' OR c.key LIKE 'k3.%'
          THEN private.base_legacy(u,c.key)
        ELSE jsonb_build_object(
          'allowed',
            CASE
              WHEN coalesce(o.use_custom,false) AND o.mode='replace'
                THEN c.key=ANY(coalesce(o.permissions,ARRAY[]::text[]))
              ELSE c.key=ANY(rc.perms) OR
                (coalesce(o.use_custom,false) AND o.mode='additive'
                  AND c.key=ANY(coalesce(o.permissions,ARRAY[]::text[])))
            END,
          'source',
            CASE
              WHEN coalesce(o.use_custom,false) AND o.mode='replace'
                THEN '{"kind":"custom","tier":3}'::jsonb
              WHEN NOT c.key=ANY(rc.perms)
                AND coalesce(o.use_custom,false) AND o.mode='additive'
                AND c.key=ANY(coalesce(o.permissions,ARRAY[]::text[]))
                THEN '{"kind":"custom","tier":3,"mode":"additive"}'::jsonb
              ELSE jsonb_build_object('kind','role','tier',3,'names',rc.names)
            END
        )
      END AS legacy
    FROM catalog c
    CROSS JOIN role_context rc
    LEFT JOIN override_context o ON true
  ), decisions AS MATERIALIZED (
    SELECT r.*, coalesce(g.sources,'[]'::jsonb) AS sources,
      coalesce(g.deny_,false) AS deny_,
      coalesce(g.allow_,false) AS allow_,
      CASE
        WHEN r.supported THEN
          CASE WHEN g.deny_ THEN 'DENY'
            WHEN g.allow_ THEN 'ALLOW' ELSE 'NOT_CONFIGURED' END
        ELSE 'NOT_CONFIGURED'
      END AS decision
    FROM legacies r
    LEFT JOIN rule_groups g USING(key)
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
  INTO result_
  FROM decisions;

  RETURN result_;
END
$function$;
