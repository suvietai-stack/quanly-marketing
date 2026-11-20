-- Base menu fast path: reuse only server-verified, epoch-bound Role snapshots.
-- The existing uncached evaluator remains the mandatory fallback.
-- Source of truth is unchanged. No permission grants or staff rows are modified.
BEGIN;
SET LOCAL lock_timeout='1s';
ALTER TABLE private.base_role_effective_cache
  ADD COLUMN IF NOT EXISTS nav_permissions jsonb;

-- Navigation catalog writes also invalidate previously materialized menu labels.
DROP TRIGGER IF EXISTS base_role_cache_mark ON public.base_permission_catalog;
CREATE TRIGGER base_role_cache_mark
AFTER INSERT OR UPDATE OR DELETE ON public.base_permission_catalog
FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark();

CREATE OR REPLACE FUNCTION private.base_role_cache_refresh(_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  snapshot jsonb;
  next_change timestamptz;
  new_epoch bigint;
  matches jsonb;
  results jsonb;
  nav_snapshot jsonb;
BEGIN
  IF _user IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_user) THEN RETURN; END IF;
  SELECT epoch INTO STRICT new_epoch FROM private.base_role_cache_state WHERE id;
  snapshot := private.base_config();
  next_change := private.base_next_transition(snapshot);
  matches := private.base_rules(_user,snapshot);
  SELECT coalesce(jsonb_object_agg(permission,decision),'{}'::jsonb)
    INTO results
  FROM (
    SELECT x->>'permission' AS permission,
      CASE WHEN bool_or(x->>'effect'='DENY') THEN 'DENY'
        WHEN bool_or(x->>'effect'='ALLOW') THEN 'ALLOW'
        ELSE 'NOT_CONFIGURED' END AS decision
    FROM jsonb_array_elements(coalesce(matches,'[]'::jsonb)) AS r(x)
    WHERE nullif(x->>'permission','') IS NOT NULL
    GROUP BY x->>'permission'
  ) checked;
  -- Precompute the exact navigation payload once per epoch, never on every menu check.
  -- Errors only disable this optional fast path; server authorization stays live.
  BEGIN
    nav_snapshot := private.base_staff_effective(_user,snapshot);
  EXCEPTION WHEN OTHERS THEN
    nav_snapshot := NULL;
  END;
  INSERT INTO private.base_role_effective_cache(user_id,epoch,decisions,computed_at,valid_until,nav_permissions)
  VALUES(_user,new_epoch,results,now(),next_change,nav_snapshot)
  ON CONFLICT(user_id) DO UPDATE SET
    epoch=excluded.epoch,
    decisions=excluded.decisions,
    computed_at=excluded.computed_at,
    valid_until=excluded.valid_until,
    nav_permissions=excluded.nav_permissions;
  -- Successful per-user refreshes must not serialize all logins through
  -- a write lock on the global epoch row. Epoch only changes on source writes.
END
$function$


CREATE OR REPLACE FUNCTION public.base_permissions_navigation()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  u uuid := auth.uid();
  c_ jsonb;
  cached_permissions jsonb;
  cached_until timestamptz;
BEGIN
  IF u IS NULL OR NOT private.is_active(u) THEN
    RAISE EXCEPTION 'Không có quyền xem phân quyền.';
  END IF;
  IF private.is_super_admin(u) THEN
    RETURN public.base_permissions_effective(u);
  END IF;
  -- A cached entry is trusted only at the current global epoch and before
  -- its next transition. NULL/expired snapshots use the original evaluator.
  SELECT c.nav_permissions,c.valid_until INTO cached_permissions,cached_until
  FROM private.base_role_effective_cache c
  JOIN private.base_role_cache_state s ON s.id=true AND s.epoch=c.epoch
  WHERE c.user_id=u AND (c.valid_until IS NULL OR now()<c.valid_until);
  IF cached_permissions IS NOT NULL THEN
    RETURN jsonb_build_object(
      'user_id',u,
      'revision',coalesce((SELECT revision FROM public.base_org_state WHERE id),0),
      'server_now',now(),
      'next_transition_at',cached_until,
      'permissions',cached_permissions
    );
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
$function$


REVOKE ALL ON FUNCTION private.base_role_cache_refresh(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.base_permissions_navigation() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.base_permissions_navigation() TO authenticated;
COMMIT;
