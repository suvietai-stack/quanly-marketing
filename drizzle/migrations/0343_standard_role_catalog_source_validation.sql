DO $$ DECLARE d text;BEGIN
 SELECT pg_get_functiondef('public.standard_role_catalog_setup()'::regprocedure) INTO d;
 EXECUTE replace(d,'WHERE id=title_ AND source=''base''','WHERE id=title_ AND source IS DISTINCT FROM ''biz_positions''');
 SELECT pg_get_functiondef('private.phase3a_title_roles_read()'::regprocedure) INTO d;
 IF d NOT LIKE '%''restricted'',r.id%' THEN RAISE EXCEPTION 'Unexpected role read shape';END IF;
 EXECUTE replace(d,'''restricted'',r.id','''catalog_state'',r.catalog_state,''restricted'',r.id');
 SELECT pg_get_functiondef('public.account_supplement_read(uuid)'::regprocedure) INTO d;
 EXECUTE replace(d,'''id'',r.id,''name'',r.name,''permissions'',r.permissions','''id'',r.id,''name'',r.name,''catalog_state'',r.catalog_state,''permissions'',r.permissions');
END $$;