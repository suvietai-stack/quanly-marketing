-- Read-only: compare the 11 desired roles without changing permissions, people or history.
SELECT id,name,catalog_group,cardinality(permissions) AS permission_count FROM app_roles
WHERE id LIKE 'role-v2-b2b-%' OR id LIKE 'role-v2-distribution-%' OR id='role-v2-btc-director'
OR id IN ('role-v2-showroom-manager','role-v2-showroom-staff') ORDER BY catalog_group,id;
SELECT id,name,parent_id,kind FROM org_units WHERE id IN('org-company','biz-block','showroom-block','624e6e56-eeab-42d5-85af-6af284e72f34','3df93c75-8a46-4c2f-bc09-7583aa672b52','76fcf3a9-8561-4e2a-be3c-c6724a6310fb');
