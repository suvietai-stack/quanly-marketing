CREATE OR REPLACE FUNCTION private.org_contains(root_id text, target_id text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ WITH RECURSIVE tree AS (SELECT id,ARRAY[id] path FROM org_units WHERE id=root_id AND active UNION ALL SELECT u.id,t.path||u.id FROM org_units u JOIN tree t ON u.parent_id=t.id WHERE u.active AND NOT u.id=ANY(t.path)) SELECT EXISTS(SELECT 1 FROM tree WHERE id=target_id) $function$
