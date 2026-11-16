BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='80s';
INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('k3hub.ops_accounting','Mở 3K Kế toán','Trung tâm 3K','{}'::text[]),
 ('k3hub.ops_hr','Mở 3K Hành chính và Nhân sự','Trung tâm 3K','{}'::text[])
ON CONFLICT(key) DO UPDATE SET label=excluded.label,module=excluded.module;

WITH grants AS (
 SELECT pr.role_id,
 BOOL_OR(pr.unit_id='b5e00000-0000-4000-8000-000000000022') accounting,
 BOOL_OR(pr.unit_id='b5e00000-0000-4000-8000-000000000021') hr
 FROM public.org_position_roles pr
 WHERE pr.unit_id=ANY(ARRAY['b5e00000-0000-4000-8000-000000000022','b5e00000-0000-4000-8000-000000000021'])
 GROUP BY pr.role_id
)
UPDATE public.app_roles r SET permissions=(SELECT array_agg(DISTINCT x ORDER BY x)
 FROM unnest(r.permissions ||
  CASE WHEN g.accounting THEN ARRAY['k3hub.ops_accounting'] ELSE '{}'::text[] END ||
  CASE WHEN g.hr THEN ARRAY['k3hub.ops_hr'] ELSE '{}'::text[] END) x),updated_at=now()
FROM grants g WHERE r.id=g.role_id AND r.role_kind='position' AND r.catalog_generation=2;

UPDATE public.app_roles r SET permissions=(SELECT array_agg(DISTINCT x ORDER BY x)
 FROM unnest(r.permissions||ARRAY['k3hub.ops_accounting','k3hub.ops_hr']) x),updated_at=now()
WHERE r.id='role-v2-executive' AND r.role_kind='position' AND r.catalog_generation=2;
COMMIT;
