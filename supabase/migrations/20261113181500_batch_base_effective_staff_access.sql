-- Staff/mobile permission snapshot, without the costly business/3K legacy
-- calls (these are separately authoritative via biz_effective_access).
-- Full detail base_permissions_effective remains unchanged for management.
-- No role mutations, data updates, or business-side authorization changes.
-- Read-path performance fix only: resolve Role and personal override ONCE per
-- identity instead of executing their two SELECTs for every one of 510 keys.
-- The existing biz/k3 legacy resolvers and all tier-one deny/allow decisions
-- remain authoritative. This function does not grant new permissions.
-- Before enabling, regression compare JSONB output against the old resolver
-- for admin, additive, replace and standard staff accounts.
CREATE OR REPLACE FUNCTION private.base_staff_effective(u uuid, c jsonb)
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
      privileged_ AS bypass
    FROM public.base_permission_catalog cat
    WHERE cat.key NOT LIKE 'biz.%' AND cat.key NOT LIKE 'k3.%'
  ), legacies AS MATERIALIZED (
    SELECT cat.*,
      jsonb_build_object(
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
        ) AS legacy
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

-- Reuse the full snapshot only for system administrators (already fast).
-- Staff receive a server-verified snapshot for 481 general permissions.
-- Auth remains checked on the database; the client does not grant rights.
CREATE OR REPLACE FUNCTION public.base_permissions_navigation()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  u uuid := auth.uid();
  c_ jsonb;
BEGIN
  IF u IS NULL OR NOT private.is_active(u) THEN
    RAISE EXCEPTION 'Không có quyền xem phân quyền.';
  END IF;
  IF private.is_super_admin(u) THEN
    RETURN public.base_permissions_effective(u);
  END IF;
  c_ := private.base_config();
  RETURN jsonb_build_object(
    'user_id',u,
    'revision',coalesce((SELECT revision FROM public.base_org_state WHERE id),0),
    'server_now',now(),
    'next_transition_at',private.base_next_transition(c_),
    'permissions',private.base_staff_effective(u,c_)
  );
END
$function$;

REVOKE ALL ON FUNCTION private.base_staff_effective(uuid,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.base_permissions_navigation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.base_permissions_navigation() TO authenticated;
