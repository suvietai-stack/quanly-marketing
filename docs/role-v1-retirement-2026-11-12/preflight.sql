-- READ ONLY. Run against PRODUCTION to decide whether candidate.sql can be reviewed.
SELECT
 (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1 AND id NOT IN ('role-super-admin','role-admin')) AS v1_retirement_count,
 (SELECT md5(coalesce(string_agg(to_jsonb(r)::text,'|' ORDER BY r.id),''))
  FROM public.app_roles r WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')) AS v1_fingerprint,
 (SELECT count(*) FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id
  WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')) AS inactive_title_links_to_retire,
 (SELECT md5(coalesce(string_agg(to_jsonb(l)::text,'|' ORDER BY l.id),''))
  FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id
  WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')) AS link_fingerprint,
 (SELECT count(*) FROM public.user_roles u WHERE u.role_id NOT IN ('role-super-admin','role-admin')) AS non_admin_direct_roles,
 (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin') AS protected_super_admin_assignments,
 (SELECT count(*) FROM public.org_position_roles) AS v2_position_bindings,
 (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2) AS v2_roles,
 (SELECT to_regprocedure('private.universal_permission_ready(text)') IS NOT NULL) AS permission_510_applied,
 md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure)) AS approval_function_md5;
