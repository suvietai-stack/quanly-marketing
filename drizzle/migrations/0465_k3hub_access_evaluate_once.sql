-- 3K access: same grants/area scope, but evaluate permission and policy only once.
-- Production bottleneck: k3hub_access_read historical mean ~3.9 s, max ~7.9 s.
-- Preserve all deny, active assignment, manager, business and configured policy gates.
CREATE OR REPLACE FUNCTION public.k3hub_access_read()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  today_ date := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  super_ boolean;
  center_ boolean;
  config_ boolean;
  denied_ boolean;
  company_ boolean;
  manager_ boolean;
  personal_ boolean;
  enabled_ boolean := false;
  manager_enabled_ boolean := false;
  executive_ boolean := false;
  policy_ text[];
  units_ jsonb;
BEGIN
  IF uid IS NULL OR NOT private.is_active(uid) THEN
    RAISE EXCEPTION 'Cần đăng nhập.' USING ERRCODE='42501';
  END IF;

  -- The former routine called private.has_permission('k3hub.center')
  -- independently in executive, manager and every org-unit predicate.
  -- Both decisions now run just once per access request.
  super_ := private.is_super_admin(uid);
  center_ := CASE WHEN super_ THEN true ELSE private.has_permission(uid,'k3hub.center') END;
  config_ := super_ OR private.has_permission(uid,'k3hub.config');
  denied_ := private.k3_personal_denied(uid,'k3.view_scope');
  policy_ := private.k3hub_policy_at(today_);

  -- Each active appointment is examined once, including temporal boundaries.
  SELECT coalesce(bool_or(x.enabled),false),
         coalesce(bool_or(x.enabled AND x.kind='manager'),false),
         coalesce(bool_or(x.unit_id='org-company' AND x.role_id='role-v2-executive'),false)
  INTO enabled_,manager_enabled_,executive_
  FROM (
    SELECT a.unit_id, t.kind, pr.role_id,
           private.k3hub_is_enabled(a.unit_id,today_) AS enabled
    FROM public.org_assignments a
    LEFT JOIN public.org_titles t ON t.id=a.title_id
    LEFT JOIN public.org_position_roles pr ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
    WHERE a.user_id=uid AND a.status='active'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
  ) x;

  company_ := super_ OR (center_ AND NOT denied_ AND executive_);
  manager_ := company_ OR (center_ AND NOT denied_ AND manager_enabled_);
  personal_ := public.k3_can(uid,'k3.use') AND (super_ OR enabled_);

  -- Keep the original block/path restrictions. Never expose sibling units.
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id',u.id,
      'name',CASE WHEN u.name LIKE 'Showrom %' THEN replace(u.name,'Showrom ','Showroom ') ELSE u.name END,
      'kind',u.kind,'block_id',b.id,'block_name',b.name
    ) ORDER BY b.name,u.kind,u.name
  ),'[]'::jsonb)
  INTO units_
  FROM public.org_units u
  JOIN LATERAL (
    SELECT root.id,root.name
    FROM private.k3hub_path(u.id) p
    JOIN public.org_units root ON root.id=p.id AND root.kind='block'
    WHERE p.id=ANY(policy_)
    LIMIT 1
  ) b ON true
  WHERE u.active
    AND (
      company_
      OR (center_ AND NOT denied_ AND EXISTS(
        SELECT 1
        FROM public.org_assignments a
        JOIN public.org_titles t ON t.id=a.title_id AND t.kind='manager'
        WHERE a.user_id=uid AND a.status='active'
          AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
          AND EXISTS(SELECT 1 FROM private.k3hub_path(u.id) p WHERE p.id=a.unit_id)
      ))
    );

  RETURN jsonb_build_object(
    'can_company',company_,
    'can_config',config_,
    'can_manage',manager_,
    'can_personal',personal_,
    'units',units_
  );
END
$function$;

-- Preserve original callable status; no new client-write function or grant.
