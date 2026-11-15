-- READ ONLY, production snapshots must match candidate guards.
SELECT
 (SELECT count(*) FROM public.base_permission_catalog) AS keys,
 (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1) AS v1_roles,
 (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2) AS v2_roles,
 (SELECT count(*) FROM public.user_roles) AS direct_users,
 (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin') AS protected,
 (SELECT md5(coalesce(string_agg(to_jsonb(r)::text,'|' ORDER BY r.id),''))
  FROM public.app_roles r WHERE r.catalog_generation=1
  AND r.id NOT IN ('role-super-admin','role-admin')) AS retire_fingerprint,
 (SELECT md5(coalesce(string_agg(to_jsonb(l)::text,'|' ORDER BY l.id),''))
  FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id
  WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')) AS title_link_fingerprint,
 to_regclass('private.role_515_approval_backup') IS NOT NULL AS approval_ready,
 to_regclass('private.role_515_legacy_backup') IS NOT NULL AS retirement_applied;
