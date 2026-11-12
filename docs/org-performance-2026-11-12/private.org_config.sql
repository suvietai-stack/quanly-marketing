CREATE OR REPLACE FUNCTION private.org_config()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.org_role_previous_org_config()||jsonb_build_object('position_slots',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY id),'[]') FROM public.org_position_slots s))||jsonb_build_object('role_links',(SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY title_source,title_id,role_id),'[]') FROM base_title_role_links l)) $function$
