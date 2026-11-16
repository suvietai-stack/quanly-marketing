-- Navigation discovery only: area read authorization remains server-side.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';
INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('k3hub.biz','Mở 3K khu vực Kinh doanh','Trung tâm 3K','{}'::text[]),
 ('k3hub.ops','Mở 3K khu vực Vận hành','Trung tâm 3K','{}'::text[])
ON CONFLICT(key) DO UPDATE SET label=excluded.label,module=excluded.module;
WITH RECURSIVE descendants AS (
 SELECT u.id,u.id AS block_id,ARRAY[u.id] AS path FROM public.org_units u
 WHERE u.id=ANY(ARRAY['biz-block','b5e00000-0000-4000-8000-000000000002']) AND u.active
 UNION ALL
 SELECT child.id,par.block_id,par.path||child.id FROM public.org_units child
 JOIN descendants par ON child.parent_id=par.id
 WHERE child.active AND NOT child.id=ANY(par.path)
), grants AS (
 SELECT pr.role_id,
  BOOL_OR(d.block_id='biz-block') biz,
  BOOL_OR(d.block_id='b5e00000-0000-4000-8000-000000000002') ops
 FROM public.org_position_roles pr JOIN descendants d ON d.id=pr.unit_id
 GROUP BY pr.role_id
)
UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT x ORDER BY x) FROM unnest(r.permissions||
   CASE WHEN grants.biz THEN ARRAY['k3hub.biz'] ELSE '{}'::text[] END ||
   CASE WHEN grants.ops THEN ARRAY['k3hub.ops'] ELSE '{}'::text[] END) x),
 updated_at=now()
FROM grants WHERE r.id=grants.role_id AND r.role_kind='position' AND r.catalog_generation=2;
UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT x ORDER BY x)
  FROM unnest(r.permissions||ARRAY['k3hub.biz','k3hub.ops']) x),
 updated_at=now()
WHERE r.id='role-v2-executive' AND r.role_kind='position' AND r.catalog_generation=2;
COMMIT;
