DO $patch$
DECLARE def text;
BEGIN
 SELECT pg_get_functiondef('private.org_commands_v2(jsonb)'::regprocedure) INTO def;
 IF position('retire_legacy_title_roles' IN def)>0 THEN RAISE EXCEPTION 'Retirement command already installed'; END IF;
 def:=replace(def, 'IF x->>''action''=''roles'' AND', $branch$
 IF x->>'action'='retire_legacy_title_roles' THEN
  IF NOT private.org_execution_ok() OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Retirement requires audited Super Admin preview'; END IF;
  IF NOT EXISTS(SELECT 1 FROM org_titles WHERE id=v->>'id') THEN RAISE EXCEPTION 'Unknown title'; END IF;
  IF EXISTS(SELECT 1 FROM org_assignments a LEFT JOIN org_position_slots s ON s.id=a.slot_id LEFT JOIN app_roles r ON r.id=s.role_id WHERE a.title_id=v->>'id' AND a.status='active' AND (a.ends_at IS NULL OR a.ends_at>now()) AND (s.id IS NULL OR NOT s.active OR r.catalog_generation<2 OR r.is_system)) THEN RAISE EXCEPTION 'Title still has current or future noncanonical assignments'; END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY id),'[]') INTO before_ FROM base_title_role_links l WHERE title_id=v->>'id';
  IF EXISTS(SELECT 1 FROM base_title_role_links l JOIN app_roles r ON r.id=l.role_id WHERE l.title_id=v->>'id' AND (r.is_system OR r.catalog_generation>=2)) THEN RAISE EXCEPTION 'Only legacy non-system title links may retire'; END IF;
  SELECT CASE WHEN source='biz_positions' THEN 'biz' ELSE 'base' END INTO src FROM org_titles WHERE id=v->>'id';
  DELETE FROM base_title_role_links WHERE title_id=v->>'id';
  INSERT INTO base_title_role_events(actor_id,title_source,title_id,reason,before_data,after_data) VALUES(auth.uid(),src,v->>'id',coalesce(v->>'reason','Canonical slot cutover'),before_,'[]');
  result_:=result_||jsonb_build_array('org-company'); CONTINUE;
 END IF;
 IF x->>'action'='roles' AND
$branch$);
 EXECUTE def;
END $patch$;
