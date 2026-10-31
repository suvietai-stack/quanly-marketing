DO $$DECLARE d text;BEGIN
SELECT pg_get_functiondef('private.biz_affiliation_guard()'::regprocedure) INTO d;
d:=replace(d,'NEW.appointment_id IS DISTINCT FROM OLD.appointment_id','(OLD.appointment_id IS NOT NULL AND NEW.appointment_id IS DISTINCT FROM OLD.appointment_id)');EXECUTE d;
SELECT pg_get_functiondef('private.biz_sync_member(uuid,uuid,uuid,timestamptz,text)'::regprocedure) INTO d;
d:=replace(d,'IF _mode=''concurrent'' AND (EXISTS', 'IF (_at>clock_timestamp()+interval ''1 second'') OR (_mode=''concurrent'' AND (EXISTS');
d:=replace(d,'AND team_id IS DISTINCT FROM _team)) THEN SELECT id INTO id_', 'AND team_id IS DISTINCT FROM _team))) THEN SELECT id INTO id_');EXECUTE d;
-- End linked affiliations on replacement, keep non-appointed concurrent memberships independent.
SELECT pg_get_functiondef('public.biz_appointment_save(jsonb)'::regprocedure) INTO d;
d:=replace(d,'id_:=private.biz_appointment_save_before_sync(x);','id_:=private.biz_appointment_save_before_sync(x); UPDATE biz_member_affiliations SET ended_at=ts WHERE appointment_id=nullif(x->>''replaces_id'','''')::uuid AND started_at<ts AND (ended_at IS NULL OR ended_at>ts);');EXECUTE d;
END $$;