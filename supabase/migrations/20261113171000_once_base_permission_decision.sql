-- Avoid repeated evaluation of the same authoritative permission rules.
-- Security contract: active accounts only; Super Admin bypass; DENY precedes
-- ALLOW; then legacy replace Role, Role + additive personal override.
-- Same function signatures, SECURITY DEFINER and search_path as before.
-- No new grant or policy is introduced.

CREATE OR REPLACE FUNCTION private.base_decision(u uuid, p text, c jsonb)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH matches AS MATERIALIZED (
    SELECT r->>'effect' AS effect
    FROM jsonb_array_elements(private.base_rules(u,c)) r
    WHERE r->>'permission' = p
  )
  SELECT CASE
    WHEN EXISTS(SELECT 1 FROM matches WHERE effect='DENY') THEN 'DENY'
    WHEN EXISTS(SELECT 1 FROM matches WHERE effect='ALLOW') THEN 'ALLOW'
    ELSE 'NOT_CONFIGURED'
  END;
$function$;

CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  configured_ boolean;
  decision_ text;
BEGIN
  IF NOT private.is_active(_user_id) THEN RETURN false; END IF;
  IF private.is_super_admin(_user_id) THEN RETURN true; END IF;

  configured_ := private.org_role_permission_ready(_permission)
    OR private.mkt_specialty_permission_ready(_permission)
    OR _permission LIKE 'sale_work.%'
    OR private.permission_configured(_user_id,_permission);

  IF configured_ THEN
    -- Compute tier one once, not again for the ALLOW branch after a non-DENY.
    decision_ := private.base_tier1(_user_id,_permission);
    IF decision_ = 'DENY' THEN RETURN false; END IF;
    IF decision_ = 'ALLOW' THEN RETURN true; END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_permission_overrides o
    WHERE o.user_id=_user_id AND o.use_custom=true AND o.mode='replace'
  ) THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_permission_overrides o
      WHERE o.user_id=_user_id AND o.use_custom=true
        AND _permission=ANY(o.permissions)
    );
  END IF;

  RETURN EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.app_roles r ON r.id=ur.role_id
      WHERE ur.user_id=_user_id AND _permission=ANY(r.permissions)
    )
    OR EXISTS (
      SELECT 1 FROM public.user_permission_overrides o
      WHERE o.user_id=_user_id AND o.use_custom=true AND o.mode='additive'
        AND _permission=ANY(o.permissions)
    );
END
$function$;
