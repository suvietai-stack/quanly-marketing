DO $$DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_task_save(jsonb)'::regprocedure);
 def:=replace(def,'updated_at=now(),updated_by=auth.uid() WHERE id=_id','action_id=CASE WHEN p ? ''action_id'' THEN nullif(p->>''action_id'','''')::uuid ELSE action_id END,updated_at=now(),updated_by=auth.uid() WHERE id=_id');
 EXECUTE def;
END$$;
CREATE FUNCTION private.k3_task_summary_relevant(_before jsonb,_after jsonb) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$SELECT (_before-ARRAY['revision','updated_at','updated_by','note','links','how','place','sort_order']) IS DISTINCT FROM (_after-ARRAY['revision','updated_at','updated_by','note','links','how','place','sort_order'])$$;
REVOKE ALL ON FUNCTION private.k3_task_summary_relevant(jsonb,jsonb) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.k3_task_revision() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
 IF TG_OP='INSERT' OR private.k3_task_summary_relevant(to_jsonb(OLD),to_jsonb(NEW)) THEN
 IF NOT NEW.is_unscheduled THEN UPDATE public.k3_days SET data_revision=data_revision+1,planned_at=coalesce(planned_at,now()) WHERE id=NEW.day_id; END IF;
 IF TG_OP='UPDATE' AND (OLD.day_id<>NEW.day_id OR NEW.is_unscheduled) AND NOT OLD.is_unscheduled THEN UPDATE public.k3_days SET data_revision=data_revision+1 WHERE id=OLD.day_id; END IF;
 END IF; RETURN NEW; END$$;