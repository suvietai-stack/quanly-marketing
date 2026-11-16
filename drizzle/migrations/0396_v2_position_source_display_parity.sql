-- Match the actual V2 position grants in private.org_slot_rules.
-- Previously the source inspector displayed only legacy org_role_permission_ready
-- keys (34 of the executive's 86), misleading admins into seeing too few rights.
-- This only fixes readback/provenance; effective authorization is unchanged.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='60s';
DO $fix$
DECLARE def text;
  old_expression text:='ARRAY(SELECT p FROM unnest(r.permissions) p WHERE private.org_role_permission_ready(p))';
  next_expression text:='ARRAY(SELECT p FROM unnest(r.permissions) p WHERE (private.org_role_permission_ready(p) OR (private.universal_permission_ready(p) AND NOT private.universal_dormant_fence(r.id,p))))';
BEGIN
  SELECT pg_get_functiondef('private.slot_previous_source_rows(jsonb)'::regprocedure) INTO def;
  IF position(next_expression IN def)=0 THEN
    IF position(old_expression IN def)=0 THEN RAISE EXCEPTION 'V2 role source projection changed'; END IF;
    def:=replace(def,old_expression,next_expression);
  END IF;
  EXECUTE def;
END
$fix$;
COMMIT;
