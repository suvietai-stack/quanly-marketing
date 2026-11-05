DO $patch$
DECLARE def text;
BEGIN
 def:=pg_get_functiondef('public.k3_purge_expired(integer)'::regprocedure);
 def:=replace(def,'IF private.k3_goal_has_official(g.id) OR','IF private.k3_goal_has_official(g.id) OR private.k3_goal_has_results(g.id) OR');
 def:=replace(def,'IF private.k3_action_has_official(a.id) OR','IF private.k3_action_has_official(a.id) OR private.k3_action_has_results(a.id) OR');EXECUTE def;
 def:=pg_get_functiondef('public.k3_auto_close_run()'::regprocedure);
 def:=replace(def,'IF ((s->>''action_count'')::int=0 AND (s->>''result_count'')::int=0) OR','IF (NOT private.k3_day_obligated(u.id,d) AND (s->>''action_count'')::int=0 AND (s->>''result_count'')::int=0) OR');EXECUTE def;
END $patch$;
CREATE FUNCTION private.k3_close_discipline_snapshot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE c k3_plan_checkpoints; r k3_employee_reviews;due timestamptz;
BEGIN
 SELECT * INTO c FROM k3_plan_checkpoints WHERE user_id=NEW.user_id AND work_date=NEW.work_date;
 SELECT * INTO r FROM k3_employee_reviews WHERE user_id=NEW.user_id AND work_date=NEW.work_date ORDER BY revision DESC LIMIT 1;
 SELECT (NEW.work_date+summary_by) AT TIME ZONE 'Asia/Ho_Chi_Minh' INTO due FROM k3_settings WHERE id;
 NEW.snapshot:=NEW.snapshot||jsonb_build_object('discipline',jsonb_build_object('obligated',coalesce(c.obligated,private.k3_day_obligated(NEW.user_id,NEW.work_date)) AND c.excluded_at IS NULL,'plan_status',CASE WHEN c.excluded_at IS NOT NULL THEN 'na' ELSE coalesce(c.current_status,'unobserved') END,'source',c.source,'observed_at',c.observed_at,'deadline_at',c.deadline_at,'summary_late',coalesce(r.confirmed_at>due,false)));
 RETURN NEW;
END $fn$;
CREATE TRIGGER k3_close_discipline BEFORE INSERT ON public.k3_daily_closes FOR EACH ROW EXECUTE FUNCTION private.k3_close_discipline_snapshot();
REVOKE ALL ON FUNCTION private.k3_close_discipline_snapshot() FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text;BEGIN
 def:=pg_get_functiondef('private.k3_employee_review_state(uuid,date)'::regprocedure);
 def:=replace(def,'''legacy_confirmation'',EXISTS','''summary_late'',coalesce(r.confirmed_at>((_date+(SELECT summary_by FROM k3_settings WHERE id)) AT TIME ZONE ''Asia/Ho_Chi_Minh''),false),''legacy_confirmation'',EXISTS');EXECUTE def;
END $patch$;