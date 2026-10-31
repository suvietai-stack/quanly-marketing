DO $$DECLARE d text;BEGIN
SELECT pg_get_functiondef('public.biz_appointment_scope(uuid,uuid,uuid,timestamptz)'::regprocedure) INTO d;
d:=replace(d, 'EXISTS(SELECT 1 FROM public.biz_team_members', 'EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL)');EXECUTE d;
END $$;