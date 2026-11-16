-- READ ONLY. Capture privately before any approved operation, never commit personnel rows.
SELECT id,name,role_kind,catalog_generation,catalog_state,permissions FROM public.app_roles
WHERE id LIKE 'role-v2-distribution-%' OR id IN ('role-v2-sales-director','role-v2-sales-head','role-v2-sales-team','role-v2-sales-staff');
SELECT unit_id,title_id,source,category,status,count(*) rows,
 count(*) FILTER(WHERE status='active' AND starts_at<=now() AND (ends_at IS NULL OR ends_at>now())) effective
FROM public.org_assignments WHERE unit_id IN ('3df93c75-8a46-4c2f-bc09-7583aa672b52','cef13ee0-73a8-43c4-bfe5-6bef393248fc') GROUP BY 1,2,3,4,5;
SELECT * FROM public.org_position_roles WHERE unit_id IN ('3df93c75-8a46-4c2f-bc09-7583aa672b52','cef13ee0-73a8-43c4-bfe5-6bef393248fc');
SELECT id,unit_id,title_id,role_id,active FROM public.org_position_slots WHERE unit_id IN ('3df93c75-8a46-4c2f-bc09-7583aa672b52','cef13ee0-73a8-43c4-bfe5-6bef393248fc');