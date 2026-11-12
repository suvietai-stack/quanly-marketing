CREATE OR REPLACE FUNCTION private.base_config()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.org_role_previous_config()||jsonb_build_object('position_slots',c->'position_slots','role_links',c->'role_links','memberships',c->'memberships','units',c->'units','titles',c->'titles') FROM (SELECT private.org_config() c OFFSET 0) snapshot $function$
