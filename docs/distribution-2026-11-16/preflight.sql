-- READ ONLY. Not a cutover migration. Do not reparent before compatibility approval.
SELECT id,parent_id,kind,name,source,source_id,revision
FROM public.org_units WHERE id IN ('biz-block','3df93c75-8a46-4c2f-bc09-7583aa672b52','cef13ee0-73a8-43c4-bfe5-6bef393248fc');
SELECT unit_id,count(*) FROM public.org_assignments
WHERE unit_id IN ('3df93c75-8a46-4c2f-bc09-7583aa672b52','cef13ee0-73a8-43c4-bfe5-6bef393248fc')
AND status='active' AND starts_at<=now() AND (ends_at IS NULL OR ends_at>now()) GROUP BY unit_id;
SELECT n.nspname,p.proname,pg_get_functiondef(p.oid) FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','private')
AND (p.proname IN ('org_commands','org_change','k3hub_path','k3hub_is_enabled','k3hub_access_read','k3hub_read')
OR p.proname LIKE 'biz%scope%' OR p.proname LIKE 'crm%scope%');