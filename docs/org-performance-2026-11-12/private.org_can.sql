CREATE OR REPLACE FUNCTION private.org_can(u uuid, p text, target_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE rules jsonb;BEGIN IF u IS NULL OR NOT private.is_active(u) THEN RETURN false;END IF; IF private.is_super_admin(u) THEN RETURN true; END IF; IF NOT EXISTS(SELECT 1 FROM org_units WHERE id=target_id AND active) THEN RETURN false; END IF; rules:=private.base_rules(u,private.org_config()); RETURN NOT EXISTS(SELECT 1 FROM jsonb_array_elements(rules) r WHERE r->>'permission'=p AND r->>'effect'='DENY' AND (nullif(r->>'unit_id','') IS NULL OR private.org_contains(r->>'unit_id',target_id))) AND EXISTS(SELECT 1 FROM jsonb_array_elements(rules) r WHERE r->>'permission'=p AND r->>'effect'='ALLOW' AND (nullif(r->>'unit_id','') IS NULL OR private.org_contains(r->>'unit_id',target_id))); END $function$
