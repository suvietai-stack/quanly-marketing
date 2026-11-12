CREATE OR REPLACE FUNCTION private.org_role_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.slot_previous_role_rules(u,c)||private.org_slot_rules(u,c) $function$;
