DO $patch$ DECLARE d text; needle text; BEGIN
 SELECT pg_get_functiondef('private.org_commands_v2(jsonb)'::regprocedure) INTO d;
 needle:='FOR x IN SELECT value FROM jsonb_array_elements(changes_) LOOP';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Role command contract changed.'; END IF;
 EXECUTE replace(d,needle,needle||' v:=x->''data'';');
 SELECT pg_get_functiondef('private.org_effect_signature(jsonb,jsonb)'::regprocedure) INTO d;
 needle:='''unit_id'',m->>''unit_id''';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Preview assignment signature contract changed.'; END IF;
 d:=replace(d,needle,'''id'',m->>''id'',''slot_id'',m->>''slot_id'','||needle);
 needle:='jsonb_build_object(''units'',c->''units''';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Preview structure signature contract changed.'; END IF;
 EXECUTE replace(d,needle,'jsonb_build_object(''position_slots'',coalesce(c->''position_slots'',''[]''),''units'',c->''units''');
 END $patch$;
-- Reject restoring over status/Role/slot edits, even when appointment dates stayed unchanged.
DO $patch$ DECLARE d text; needle text; BEGIN
 SELECT pg_get_functiondef('private.org_commands(jsonb)'::regprocedure) INTO d;
 needle:='live.slot_id IS DISTINCT FROM a->>''slot_id''';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Restore signature contract changed.'; END IF;
 d:=replace(d,needle,'live.status IS DISTINCT FROM a->>''status'' OR '||needle);
 needle:='UPDATE org_assignments live SET slot_id=NULL';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Restore update contract changed.'; END IF;
 EXECUTE replace(d,needle,$guard$IF EXISTS(SELECT 1 FROM jsonb_array_elements(old_.after_data->'position_slots') saved JOIN org_position_slots live ON live.id=saved->>'id' WHERE live.role_id IS DISTINCT FROM saved->>'role_id' OR live.title_id IS DISTINCT FROM saved->>'title_id' OR live.unit_id IS DISTINCT FROM saved->>'unit_id' OR live.name IS DISTINCT FROM saved->>'name' OR live.active IS DISTINCT FROM (saved->>'active')::boolean) THEN RAISE EXCEPTION 'Ô vị trí đã thay đổi; không khôi phục ghi đè.'; END IF;
 UPDATE org_assignments live SET slot_id=NULL$guard$);
 END $patch$;