-- The legacy operational Role V1 catalog was already removed.
-- The remaining two user_roles rows are active protected Super Admin grants,
-- but were mislabeled source_kind=legacy, producing a misleading 'Role cũ'
-- notification. Reclassify these as system without touching their role IDs.
-- Keep exactly the security roles; never delete Admin/Super Admin.
DO $migrate$
DECLARE admin_id uuid;
BEGIN
  IF EXISTS(SELECT 1 FROM public.app_roles
    WHERE catalog_generation<2 AND NOT is_system) THEN
    RAISE EXCEPTION 'Legacy operational roles remain: do not reclassify blindly';
  END IF;
  SELECT p.id INTO STRICT admin_id FROM public.profiles p
  WHERE p.username='Admin' AND p.status='Đang hoạt động' AND private.is_super_admin(p.id);
  PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
  UPDATE public.user_roles
    SET source_kind='system'
    WHERE source_kind='legacy' AND role_id IN ('role-super-admin','role-admin');
  IF EXISTS(SELECT 1 FROM public.user_roles
    WHERE source_kind='legacy' AND role_id IN ('role-super-admin','role-admin')) THEN
    RAISE EXCEPTION 'Failed to reclassify system Role sources';
  END IF;
  IF NOT private.is_super_admin(admin_id) THEN
    RAISE EXCEPTION 'Super Admin grant validation failed';
  END IF;
END
$migrate$;

-- A direct protected system Role is not an obsolete legacy grant, regardless
-- of when the user_roles record was originally inserted.
CREATE OR REPLACE FUNCTION private.slot_previous_source_rows(c jsonb)
 RETURNS TABLE(user_id uuid, role_id text, source_kind text, source_id text, unit_id text, legacy boolean, eligible boolean, scope text, permissions text[])
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT (m->>'user_id')::uuid,r.id,'position',m->>'id',m->>'unit_id',false,true,'native',ARRAY(SELECT p FROM unnest(r.permissions) p WHERE (private.org_role_permission_ready(p) OR (private.universal_permission_ready(p) AND NOT private.universal_dormant_fence(r.id,p))))
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m
 JOIN org_position_roles b ON b.unit_id=m->>'unit_id' AND b.title_id=m->>'title_id'
 JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id'
 JOIN app_roles r ON r.id=b.role_id AND r.role_kind='position' AND r.catalog_state='standard' AND r.catalog_generation>=2 AND NOT r.is_system
 WHERE private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((t->>'active')::boolean,false) AND private.is_active((m->>'user_id')::uuid)
 UNION ALL SELECT m.user_id,r.id,CASE WHEN r.role_kind='marketing_task' THEN 'task' ELSE 'specialty' END,m.specialty_id,NULL,NOT m.eligibility_enforced,r.role_kind<>'marketing_task' OR private.org_marketing_eligible(m.user_id,c),'own',ARRAY(SELECT p FROM unnest(r.permissions) p WHERE private.mkt_specialty_permission_ready(p)) FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id=m.specialty_id AND s.active JOIN app_roles r ON r.id=s.role_id WHERE m.state='active' AND private.is_active(m.user_id) AND (r.role_kind<>'marketing_task' OR NOT m.eligibility_enforced OR private.org_marketing_eligible(m.user_id,c)) UNION ALL SELECT ur.user_id,r.id,'direct',r.id,NULL,NOT r.is_system,true,'native',r.permissions FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE private.is_active(ur.user_id) $function$
;

-- Historical appointments should not be rendered as an active legacy Role
-- warning after their end date. They remain available in audit history.
CREATE OR REPLACE FUNCTION public.role_actual_sources(_target uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE c jsonb; e jsonb; BEGIN IF NOT private.is_active(auth.uid()) OR NOT (auth.uid()=_target OR private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.user_view') OR private.has_permission(auth.uid(),'settings.user_custom_perm')) THEN RAISE EXCEPTION 'Không có quyền xem nguồn Role.' USING ERRCODE='42501'; END IF; c:=private.base_config(); e:=private.base_effective(_target,c); RETURN jsonb_build_object('sources',(SELECT coalesce(jsonb_agg(to_jsonb(s)||jsonb_build_object('role_name',r.name,'unit_name',u.name) ORDER BY s.source_kind,s.source_id),'[]') FROM private.role_source_rows(c) s JOIN app_roles r ON r.id=s.role_id LEFT JOIN org_units u ON u.id=s.unit_id WHERE s.user_id=_target),'effective',(SELECT coalesce(jsonb_agg(p->>'key'),'[]') FROM jsonb_array_elements(e) p WHERE (p->>'allowed')::boolean),'legacy_paths',to_jsonb(ARRAY(SELECT DISTINCT source_kind FROM private.role_source_rows(c) WHERE user_id=_target AND legacy)||CASE WHEN EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_target AND use_custom) THEN ARRAY['override'] ELSE ARRAY[]::text[] END||CASE WHEN EXISTS(SELECT 1 FROM biz_appointments WHERE user_id=_target AND status='active' AND started_at<=now() AND (ended_at IS NULL OR ended_at>now())) THEN ARRAY['biz_appointments (workflow riêng)'] ELSE ARRAY[]::text[] END)); END $function$
;
