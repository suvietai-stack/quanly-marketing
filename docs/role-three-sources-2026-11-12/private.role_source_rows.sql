CREATE OR REPLACE FUNCTION private.role_source_rows(c jsonb)
 RETURNS TABLE(user_id uuid, role_id text, source_kind text, source_id text, unit_id text, legacy boolean, eligible boolean, scope text, permissions text[])
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT * FROM private.slot_previous_source_rows(c)
 UNION ALL
 SELECT (m->>'user_id')::uuid,r.id,'task',m->>'id'||':'||s.id,m->>'unit_id',true,private.org_marketing_eligible((m->>'user_id')::uuid,c),'native',ARRAY(SELECT p FROM unnest(r.permissions) p WHERE private.org_role_permission_ready(p))
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid JOIN mkt_specialties s ON s.id=sid AND s.active JOIN app_roles r ON r.id=s.role_id
 WHERE private.is_active((m->>'user_id')::uuid) AND private.base_valid_at(m) AND m->>'status'='active' AND m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) $function$
;
