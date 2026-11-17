-- Fast Role V2 staff directories.
-- Previously each designer/sales candidate ran expensive recursive permission
-- resolution; a two-designer picker took ~6.9 seconds inside PostgreSQL.
-- Read current unit-owned appointment->Role V2 directly (including 'base'\n-- canonical titles), while falling back to
-- authoritative authorization if a person has custom overrides or a nonstandard
-- source. No historical business title can grant a new appointment.
CREATE OR REPLACE FUNCTION public.design_assignable_staff(_flow text)
RETURNS TABLE(user_id uuid, name text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE caller_ uuid:=auth.uid(); take_perm_ text;
BEGIN
  IF _flow IS NULL OR _flow NOT IN ('photo','marketing_design','order_mockup')
     OR caller_ IS NULL OR NOT private.is_active(caller_) THEN RETURN; END IF;
  IF NOT (private.is_admin(caller_)
      OR private.design_team_member(caller_)
      OR public.design_can(caller_,_flow,'create')) THEN RETURN; END IF;
  take_perm_:='order.'||_flow||'.take';
  RETURN QUERY
  SELECT p.id,p.full_name
  FROM public.profiles p
  WHERE p.status='Đang hoạt động'
    AND EXISTS(
      SELECT 1 FROM public.mkt_staff_specialties s
      WHERE s.user_id=p.id AND s.state='active'
        AND s.specialty_id IN ('design','photography')
    )
    AND CASE
      WHEN EXISTS(
        SELECT 1 FROM public.org_assignments a
        JOIN public.org_position_roles pr ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
        JOIN public.org_titles t ON t.id=a.title_id AND t.active AND t.source <> 'biz_positions'
        JOIN public.app_roles r ON r.id=pr.role_id
        WHERE a.user_id=p.id AND a.status='active'
          AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
          AND r.catalog_generation>=2 AND r.catalog_state='standard'
          AND take_perm_=ANY(r.permissions)
      ) AND NOT EXISTS(
        SELECT 1 FROM public.user_permission_overrides o WHERE o.user_id=p.id
          AND (o.use_custom OR take_perm_=ANY(o.denied_permissions))
      )
      THEN true
      ELSE public.design_can(p.id,_flow,'take')
    END
  ORDER BY p.full_name,p.id;
END
$function$;

-- Sales list uses the same active V2 position rights. Candidate IDs granted
-- through supplemental personal permissions or direct V2 roles are also
-- considered, with a full permission fallback when any override is present.
CREATE OR REPLACE FUNCTION public.signal_sales_list()
RETURNS TABLE(id uuid, full_name text)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE caller_ uuid:=auth.uid();
BEGIN
  IF caller_ IS NULL OR NOT private.is_active(caller_) THEN RETURN; END IF;
  IF NOT (private.is_admin(caller_)
       OR private.sig_can(caller_,'signal.assign')
       OR private.sig_can(caller_,'signal.reassign')
       OR private.sig_can(caller_,'signal.manage')) THEN RETURN; END IF;

  RETURN QUERY
  WITH candidate_ids AS (
    SELECT DISTINCT a.user_id
      FROM public.org_assignments a
      JOIN public.org_position_roles pr ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
      JOIN public.org_titles t ON t.id=a.title_id AND t.active AND t.source <> 'biz_positions'
      JOIN public.app_roles r ON r.id=pr.role_id
     WHERE a.status='active' AND a.starts_at<=now()
       AND (a.ends_at IS NULL OR a.ends_at>now())
       AND r.catalog_generation>=2 AND r.catalog_state='standard'
       AND 'signal.sale'=ANY(r.permissions)
    UNION
    SELECT ur.user_id FROM public.user_roles ur JOIN public.app_roles r ON r.id=ur.role_id
     WHERE r.catalog_state='standard' AND 'signal.sale'=ANY(r.permissions)
    UNION
    SELECT o.user_id FROM public.user_permission_overrides o
     WHERE o.use_custom AND 'signal.sale'=ANY(o.permissions)
  )
  SELECT p.id,coalesce(nullif(p.full_name,''),p.username)
  FROM candidate_ids c JOIN public.profiles p ON p.id=c.user_id
  WHERE p.status='Đang hoạt động'
    AND CASE WHEN EXISTS(
      SELECT 1 FROM public.user_permission_overrides o
      WHERE o.user_id=p.id AND (o.use_custom OR 'signal.sale'=ANY(o.denied_permissions))
    ) THEN private.sig_can(p.id,'signal.sale')
    ELSE true END
  ORDER BY 2,1;
END
$function$;

REVOKE EXECUTE ON FUNCTION public.design_assignable_staff(text) FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.signal_sales_list() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.design_assignable_staff(text) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.signal_sales_list() TO authenticated,service_role;
