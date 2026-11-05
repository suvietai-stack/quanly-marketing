DO $patch$ DECLARE def text;BEGIN
 def:=pg_get_functiondef('private.k3_plan_capture(uuid)'::regprocedure);
 -- Writers already hold their own owner lock. Cross-person calendar checkpoints must not acquire another owner lock.
 def:=replace(def,'PERFORM pg_advisory_xact_lock(hashtext(''k3owner''),hashtext(_user::text));','');
 def:=replace(def,'cut,duty,st,plans,CASE WHEN st=''none'' AND jsonb_array_length(plans)>0 THEN ''late'' ELSE st END,src,first_at);','cut,duty,st,plans,CASE WHEN st=''none'' AND jsonb_array_length(plans)>0 THEN ''late'' ELSE st END,src,first_at) ON CONFLICT(user_id,work_date) DO NOTHING; IF NOT FOUND THEN RETURN; END IF;');
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_discipline_read(date,date,boolean)'::regprocedure);
 def:=replace(def,'''manual_status'',s->>''manual_status''','''manual_status'',s->>''manual_status'',''summary_due_at'',((d+(SELECT summary_by FROM k3_settings WHERE id)) AT TIME ZONE ''Asia/Ho_Chi_Minh'')');EXECUTE def;
END $patch$;
CREATE FUNCTION private.k3_checkpoint_immutable() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF ROW(NEW.user_id,NEW.work_date,NEW.department_id,NEW.deadline_at,NEW.observed_at,NEW.obligated,NEW.initial_status,NEW.initial_snapshot) IS DISTINCT FROM ROW(OLD.user_id,OLD.work_date,OLD.department_id,OLD.deadline_at,OLD.observed_at,OLD.obligated,OLD.initial_status,OLD.initial_snapshot) THEN RAISE EXCEPTION 'Dấu mốc đầu ngày không được ghi đè.'; END IF;
 RETURN NEW;
END $fn$;
CREATE TRIGGER k3_checkpoint_immutable BEFORE UPDATE ON public.k3_plan_checkpoints FOR EACH ROW EXECUTE FUNCTION private.k3_checkpoint_immutable();
REVOKE ALL ON FUNCTION private.k3_checkpoint_immutable() FROM PUBLIC,anon,authenticated;