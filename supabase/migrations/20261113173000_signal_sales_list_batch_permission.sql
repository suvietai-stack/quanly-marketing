-- Set-based Sale dropdown eligibility. Previous signal_sales_list evaluated
-- private.sig_can for every profile, causing repeated base_config/base_rules
-- scans. This reuses one configuration snapshot and evaluates per-user rules
-- once, matching private.sig_can(id,'signal.sale') on all 23 currently active
-- accounts (12 eligible) in the read-only regression check on 2026-11-13.
--
-- This function is only used to populate choices. The authoritative
-- signal_assign RPC independently checks both the actor and selected Sale.
-- Do not use this projection to authorize any write.
CREATE OR REPLACE FUNCTION public.signal_sales_list()
RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH actor_gate AS MATERIALIZED (
    SELECT (
      private.sig_can(auth.uid(),'signal.assign')
      OR private.sig_can(auth.uid(),'signal.reassign')
      OR private.sig_can(auth.uid(),'signal.manage')
    ) AS allowed
  ), config AS MATERIALIZED (
    SELECT private.base_config() AS c
  ), rights AS MATERIALIZED (
    SELECT p.id, p.full_name,
      private.is_super_admin(p.id) AS super_,
      (
        private.org_role_permission_ready('signal.sale')
        OR private.mkt_specialty_permission_ready('signal.sale')
        OR private.permission_configured(p.id,'signal.sale')
      ) AS configured_,
      rule.denied, rule.allowed,
      EXISTS (
        SELECT 1 FROM public.user_permission_overrides o
        WHERE o.user_id=p.id AND o.use_custom AND o.mode='replace'
      ) AS replace_,
      EXISTS (
        SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id=ur.role_id
        WHERE ur.user_id=p.id AND 'signal.sale'=ANY(r.permissions)
      ) AS role_sale,
      EXISTS (
        SELECT 1 FROM public.user_permission_overrides o
        WHERE o.user_id=p.id AND o.use_custom
          AND 'signal.sale'=ANY(o.permissions)
      ) AS personal_sale,
      EXISTS (
        SELECT 1 FROM public.user_permission_overrides o
        WHERE o.user_id=p.id AND o.use_custom AND o.mode='additive'
          AND 'signal.sale'=ANY(o.permissions)
      ) AS additive_sale
    FROM public.profiles p CROSS JOIN config
    CROSS JOIN LATERAL (
      SELECT coalesce(bool_or(r->>'effect'='DENY'),false) AS denied,
        coalesce(bool_or(r->>'effect'='ALLOW'),false) AS allowed
      FROM jsonb_array_elements(private.base_rules(p.id,config.c)) r
      WHERE r->>'permission'='signal.sale'
    ) rule
    WHERE p.status='Đang hoạt động'
      AND (SELECT allowed FROM actor_gate)
  )
  SELECT r.id,r.full_name FROM rights r
  WHERE r.super_ OR CASE
    WHEN r.configured_ AND private.base_supported('signal.sale') AND r.denied THEN false
    WHEN r.configured_ AND private.base_supported('signal.sale') AND r.allowed THEN true
    WHEN r.replace_ THEN r.personal_sale
    ELSE r.role_sale OR r.additive_sale
  END
  ORDER BY r.full_name;
$function$;
