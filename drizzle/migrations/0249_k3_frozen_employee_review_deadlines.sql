ALTER TABLE public.k3_plan_checkpoints ADD COLUMN summary_deadline_at timestamptz;
ALTER TABLE public.k3_employee_reviews ADD COLUMN summary_deadline_at timestamptz;
COMMENT ON COLUMN public.k3_employee_reviews.summary_deadline_at IS 'Deadline at confirmation time; legacy NULL is not guessed or backfilled.';
CREATE FUNCTION private.k3_capture_summary_deadline() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 SELECT (NEW.work_date+summary_by) AT TIME ZONE 'Asia/Ho_Chi_Minh' INTO NEW.summary_deadline_at FROM k3_settings WHERE id;
 RETURN NEW;
END $fn$;
CREATE TRIGGER k3_checkpoint_summary_deadline BEFORE INSERT ON public.k3_plan_checkpoints FOR EACH ROW EXECUTE FUNCTION private.k3_capture_summary_deadline();
CREATE TRIGGER k3_review_summary_deadline BEFORE INSERT ON public.k3_employee_reviews FOR EACH ROW EXECUTE FUNCTION private.k3_capture_summary_deadline();
REVOKE ALL ON FUNCTION private.k3_capture_summary_deadline() FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text;BEGIN
 def:=pg_get_functiondef('private.k3_checkpoint_immutable()'::regprocedure);
 def:=replace(def,'NEW.initial_snapshot)','NEW.initial_snapshot,NEW.summary_deadline_at)');def:=replace(def,'OLD.initial_snapshot)','OLD.initial_snapshot,OLD.summary_deadline_at)');EXECUTE def;
 def:=pg_get_functiondef('private.k3_employee_review_state(uuid,date)'::regprocedure);
 def:=replace(def,'r.confirmed_at>((_date+(SELECT summary_by FROM k3_settings WHERE id)) AT TIME ZONE ''Asia/Ho_Chi_Minh'')','r.confirmed_at>r.summary_deadline_at');EXECUTE def;
 def:=pg_get_functiondef('public.k3_discipline_read(date,date,boolean)'::regprocedure);
 def:=replace(def,'((d+(SELECT summary_by FROM k3_settings WHERE id)) AT TIME ZONE ''Asia/Ho_Chi_Minh'')','c.summary_deadline_at');
 def:=replace(def,'coalesce((s->>''confirmed_at'')::timestamptz>c.summary_deadline_at,false)','coalesce((s->>''summary_late'')::boolean,false)');EXECUTE def;
 def:=pg_get_functiondef('private.k3_close_discipline_snapshot()'::regprocedure);
 def:=replace(def,$old$SELECT (NEW.work_date+summary_by) AT TIME ZONE 'Asia/Ho_Chi_Minh' INTO due FROM k3_settings WHERE id;$old$,'due:=r.summary_deadline_at;');EXECUTE def;
END $patch$;