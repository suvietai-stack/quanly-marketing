-- STAGE 2 PENDING HELPERS. Does NOT replace live k3_can/RPCs until complete writer/automation cutover.
CREATE OR REPLACE FUNCTION private.k3_company_denied(u uuid,p text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM jsonb_array_elements(private.base_rules(u,private.base_config())) r WHERE r->>'permission'=p AND r->>'effect'='DENY' AND private.base_valid_at(r))
$$;
CREATE OR REPLACE FUNCTION private.k3_company_can(u uuid,p text,target_unit text DEFAULT NULL) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(u) AND (
 public.biz_admin(u) OR (
 NOT private.k3_company_denied(u,p) AND CASE
 WHEN p='k3.use' THEN true
 WHEN p IN ('k3.view_scope','k3.comment','k3.settings') THEN EXISTS(
  SELECT 1 FROM org_assignments a JOIN org_position_roles b ON b.unit_id=a.unit_id AND b.title_id=a.title_id
  JOIN app_roles r ON r.id=b.role_id AND r.catalog_generation=2 AND r.catalog_state='standard' AND r.role_kind='position' AND NOT r.is_system
  JOIN org_titles t ON t.id=a.title_id AND t.active
  JOIN org_units ou ON ou.id=a.unit_id AND ou.active
  WHERE a.user_id=u AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
  AND p=ANY(r.permissions) AND (p='k3.settings' OR t.kind='manager')
  AND (target_unit IS NULL OR target_unit IN (SELECT id FROM private.org_unit_subtree(a.unit_id)))
 ) ELSE false END))
$$;
CREATE OR REPLACE FUNCTION private.k3_company_scope(u uuid,owner_ uuid,frozen_unit text DEFAULT NULL) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(u) AND (
 (u=owner_ AND private.k3_company_can(u,'k3.use')) OR public.biz_admin(u) OR
 CASE WHEN frozen_unit IS NOT NULL THEN private.k3_company_can(u,'k3.view_scope',frozen_unit)
 ELSE EXISTS(SELECT 1 FROM org_assignments a JOIN org_units ou ON ou.id=a.unit_id AND ou.active
 WHERE a.user_id=owner_ AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
 AND private.k3_company_can(u,'k3.view_scope',a.unit_id)) END)
$$;
CREATE OR REPLACE FUNCTION private.k3_company_obligation_started(d date) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM k3_settings WHERE id AND enabled AND company_effective_from IS NOT NULL AND company_effective_from<=d)
$$;
CREATE OR REPLACE FUNCTION private.k3_company_goal_visible(u uuid,goal_ uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(u) AND EXISTS(SELECT 1 FROM k3_goals g WHERE g.id=goal_ AND (
 private.k3_company_scope(u,g.user_id,coalesce(g.org_unit_id,(SELECT ou.id FROM org_units ou WHERE ou.source='biz_departments' AND ou.source_id=g.department_id::text)))
 OR (private.k3_company_can(u,'k3.use') AND EXISTS(SELECT 1 FROM k3_goal_members m WHERE m.goal_id=g.id AND m.user_id=u AND m.status IN ('invited','accepted')))))
$$;
REVOKE ALL ON FUNCTION private.k3_company_denied(uuid,text),private.k3_company_can(uuid,text,text),private.k3_company_scope(uuid,uuid,text),private.k3_company_obligation_started(date),private.k3_company_goal_visible(uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;
