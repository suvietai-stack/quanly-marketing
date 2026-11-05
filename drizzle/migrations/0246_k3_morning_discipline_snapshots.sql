ALTER TABLE public.k3_settings ADD COLUMN IF NOT EXISTS discipline_from date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+1);
COMMENT ON COLUMN public.k3_settings.discipline_from IS 'Morning discipline starts prospectively; never reconstruct past checkpoints from mutable calendars.';
CREATE TABLE public.k3_plan_checkpoints(user_id uuid NOT NULL,work_date date NOT NULL,department_id uuid,deadline_at timestamptz NOT NULL,observed_at timestamptz NOT NULL DEFAULT now(),obligated boolean NOT NULL,initial_status text NOT NULL,initial_snapshot jsonb NOT NULL,current_status text NOT NULL,source text,first_plan_at timestamptz,excluded_at timestamptz,excluded_by uuid,exclusion_reason text,PRIMARY KEY(user_id,work_date));
GRANT SELECT ON public.k3_plan_checkpoints TO authenticated;
GRANT ALL ON public.k3_plan_checkpoints TO service_role;
ALTER TABLE public.k3_plan_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_checkpoint_read ON public.k3_plan_checkpoints FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.biz_admin(auth.uid()) OR (public.k3_can(auth.uid(),'k3.view_scope') AND public.biz_scope_ok(auth.uid(),user_id,department_id,work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')));
CREATE TABLE public.k3_discipline_events(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,user_id uuid NOT NULL,work_date date NOT NULL,actor_id uuid,action text NOT NULL,detail jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.k3_discipline_events TO authenticated;
GRANT ALL ON public.k3_discipline_events TO service_role;
ALTER TABLE public.k3_discipline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_discipline_events_read ON public.k3_discipline_events FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.biz_admin(auth.uid()) OR (public.k3_can(auth.uid(),'k3.view_scope') AND public.biz_scope_ok(auth.uid(),user_id,public.biz_department_at(user_id,work_date),work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')));
CREATE FUNCTION private.k3_day_obligated(_user uuid,_date date) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE cfg jsonb;h text;available boolean:=false;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM k3_settings WHERE id AND enabled AND effective_from<=_date AND discipline_from<=_date) OR NOT public.k3_can(_user,'k3.use') OR NOT public.biz_participant(_user) OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=_user AND status='Đang hoạt động') THEN RETURN false; END IF;
 SELECT data INTO cfg FROM leave_settings WHERE id=1;
 IF cfg->'schedule' IS NULL OR EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(cfg->'holidays','[]')) x WHERE x->>'date'=_date::text) THEN RETURN false; END IF;
 FOREACH h IN ARRAY ARRAY['am','pm'] LOOP
 IF coalesce((cfg->'schedule'->extract(isodow FROM _date)::int::text->>h)::boolean,false) AND NOT EXISTS(SELECT 1 FROM leave_requests l WHERE l.owner_id=_user AND l.type='leave' AND l.status='approved' AND _date BETWEEN (l.payload->>'start_date')::date AND (l.payload->>'end_date')::date AND (_date>(l.payload->>'start_date')::date OR l.payload->>'start_half'='am' OR h='pm') AND (_date<(l.payload->>'end_date')::date OR l.payload->>'end_half'='pm' OR h='am')) THEN available:=true; END IF;
 END LOOP;
 RETURN available;
END $fn$;
CREATE FUNCTION private.k3_plan_day_source(_user uuid,_date date) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'goal_id',g.id,'revision',a.revision,'source',CASE WHEN g.user_id=_user AND g.period_start=_date AND g.period_end=_date THEN 'self' ELSE 'scheduled' END,'established_at',greatest(a.created_at,g.created_at,a.updated_at,g.updated_at)) ORDER BY a.id),'[]') FROM k3_actions a JOIN k3_goals g ON g.id=a.goal_id WHERE a.deleted_at IS NULL AND g.deleted_at IS NULL AND a.status NOT IN('draft','paused','cancelled','ended_missed') AND g.status NOT IN('draft','paused','cancelled','ended_missed') AND private.k3_action_on_date(a.id,_date) AND private.k3_action_worker_ok(_user,a.id) AND NOT EXISTS(SELECT 1 FROM k3_data_reviews r WHERE r.status='pending' AND r.record_id IN(a.id,g.id));
$fn$;
CREATE FUNCTION private.k3_plan_capture(_user uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE d date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;cut timestamptz;plans jsonb;on_time jsonb;duty boolean;src text;first_at timestamptz;old k3_plan_checkpoints;st text;
BEGIN
 SELECT (d+plan_by) AT TIME ZONE 'Asia/Ho_Chi_Minh' INTO cut FROM k3_settings WHERE id AND enabled AND discipline_from<=d AND effective_from<=d;
 IF cut IS NULL OR now()<cut THEN RETURN; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(_user::text));
 SELECT * INTO old FROM k3_plan_checkpoints WHERE user_id=_user AND work_date=d FOR UPDATE;
 duty:=private.k3_day_obligated(_user,d);plans:=private.k3_plan_day_source(_user,d);
 SELECT coalesce(jsonb_agg(x),'[]') INTO on_time FROM jsonb_array_elements(plans) x WHERE (x->>'established_at')::timestamptz<=cut;
 -- No historical reconstruction: only the scheduled checkpoint may establish on-time status.
 IF old.user_id IS NULL THEN
 st:=CASE WHEN NOT duty THEN 'na' WHEN now()>cut+interval '5 minutes' THEN 'unobserved' WHEN jsonb_array_length(on_time)>0 THEN 'on_time' ELSE 'none' END;
 SELECT CASE WHEN count(DISTINCT x->>'source')>1 THEN 'mixed' ELSE min(x->>'source') END,min((x->>'established_at')::timestamptz) INTO src,first_at FROM jsonb_array_elements(CASE WHEN st='on_time' THEN on_time ELSE plans END) x;
 INSERT INTO k3_plan_checkpoints(user_id,work_date,department_id,deadline_at,obligated,initial_status,initial_snapshot,current_status,source,first_plan_at) VALUES(_user,d,public.biz_department_at(_user,d),cut,duty,st,plans,CASE WHEN st='none' AND jsonb_array_length(plans)>0 THEN 'late' ELSE st END,src,first_at);
 INSERT INTO k3_discipline_events(user_id,work_date,action,detail) VALUES(_user,d,'checkpoint',jsonb_build_object('status',st,'plans',plans,'deadline_at',cut));
 ELSIF old.current_status='none' AND jsonb_array_length(plans)>0 THEN
 SELECT CASE WHEN count(DISTINCT x->>'source')>1 THEN 'mixed' ELSE min(x->>'source') END,min((x->>'established_at')::timestamptz) INTO src,first_at FROM jsonb_array_elements(plans) x;
 UPDATE k3_plan_checkpoints SET current_status='late',source=src,first_plan_at=first_at WHERE user_id=_user AND work_date=d;
 INSERT INTO k3_discipline_events(user_id,work_date,actor_id,action,detail) VALUES(_user,d,auth.uid(),'late_plan',plans);
 END IF;
END $fn$;
CREATE FUNCTION public.k3_plan_checkpoint_run() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE u record;n int:=0;
BEGIN FOR u IN SELECT id FROM profiles WHERE status='Đang hoạt động' AND public.k3_can(id,'k3.use') AND public.biz_participant(id) LOOP PERFORM private.k3_plan_capture(u.id);n:=n+1; END LOOP; RETURN n; END $fn$;
REVOKE ALL ON FUNCTION public.k3_plan_checkpoint_run() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.k3_plan_checkpoint_run() TO service_role;
CREATE FUNCTION private.k3_plan_changed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE u record;
BEGIN
 -- Include assigned/cooperating employees; do not mint employee confirmations.
 FOR u IN SELECT id FROM profiles WHERE status='Đang hoạt động' AND public.k3_can(id,'k3.use') AND public.biz_participant(id) LOOP PERFORM private.k3_plan_capture(u.id); END LOOP;
 RETURN NULL;
END $fn$;
CREATE TRIGGER k3_plan_change AFTER INSERT OR UPDATE ON public.k3_actions FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
CREATE TRIGGER k3_goal_plan_change AFTER INSERT OR UPDATE ON public.k3_goals FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
CREATE TRIGGER k3_member_plan_change AFTER INSERT OR UPDATE OR DELETE ON public.k3_goal_members FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
CREATE TRIGGER k3_collaborator_plan_change AFTER INSERT OR UPDATE OR DELETE ON public.k3_action_collaborators FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
CREATE FUNCTION private.k3_plan_schedule() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE t time;j record;
BEGIN
 FOR j IN SELECT jobid FROM cron.job WHERE jobname='k3-morning-checkpoint' LOOP PERFORM cron.unschedule(j.jobid); END LOOP;
 SELECT (plan_by-interval '7 hours')::time INTO t FROM k3_settings WHERE id AND enabled;
 IF t IS NOT NULL THEN PERFORM cron.schedule('k3-morning-checkpoint',extract(minute FROM t)::int||' '||extract(hour FROM t)::int||' * * *','SELECT public.k3_plan_checkpoint_run();'); END IF;
END $fn$;
DO $patch$ DECLARE def text;BEGIN def:=pg_get_functiondef('public.k3_settings_save(boolean,date,time,time,smallint)'::regprocedure);def:=replace(def,'RETURN public.k3_settings_read();','PERFORM private.k3_plan_schedule(); RETURN public.k3_settings_read();');EXECUTE def; END $patch$;
SELECT private.k3_plan_schedule();
CREATE FUNCTION public.k3_discipline_exclude(_user uuid,_date date,_reason text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được loại dữ liệu khỏi thống kê.'; END IF;
 IF btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần lý do đối soát.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(_user::text));
 UPDATE k3_plan_checkpoints SET excluded_at=now(),excluded_by=auth.uid(),exclusion_reason=_reason WHERE user_id=_user AND work_date=_date;
 IF NOT FOUND THEN RAISE EXCEPTION 'Chưa có dấu mốc ngày này.'; END IF;
 INSERT INTO k3_discipline_events(user_id,work_date,actor_id,action,detail) VALUES(_user,_date,auth.uid(),'exclude',jsonb_build_object('reason',_reason));RETURN true;
END $fn$;
REVOKE ALL ON FUNCTION public.k3_discipline_exclude(uuid,date,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_discipline_exclude(uuid,date,text) TO authenticated;
REVOKE ALL ON FUNCTION private.k3_day_obligated(uuid,date),private.k3_plan_day_source(uuid,date),private.k3_plan_capture(uuid),private.k3_plan_changed(),private.k3_plan_schedule() FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.k3_discipline_read(_start date,_end date,_manage boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid();d date;p record;c k3_plan_checkpoints;s jsonb;rows jsonb:='[]';duty boolean;
BEGIN
 IF uid IS NULL OR NOT public.k3_can(uid,CASE WHEN _manage THEN 'k3.view_scope' ELSE 'k3.use' END) THEN RAISE EXCEPTION 'Bạn không có quyền xem kỷ luật 3K.'; END IF;
 IF _end<_start OR _end-_start>366 THEN RAISE EXCEPTION 'Khoảng xem tối đa một năm.'; END IF;
 FOR d IN SELECT generate_series(_start::timestamp,least(_end,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)::timestamp,interval '1 day')::date LOOP
 FOR p IN SELECT id,full_name FROM profiles WHERE (NOT _manage AND id=uid) OR (_manage AND public.k3_can(id,'k3.use') AND public.biz_participant(id) AND (public.biz_admin(uid) OR public.biz_scope_ok(uid,id,coalesce((SELECT department_id FROM k3_plan_checkpoints WHERE user_id=id AND work_date=d),public.biz_department_at(id,d)),d::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))) LOOP
 SELECT * INTO c FROM k3_plan_checkpoints WHERE user_id=p.id AND work_date=d;
 duty:=coalesce(c.obligated,private.k3_day_obligated(p.id,d));s:=private.k3_employee_review_state(p.id,d);
 rows:=rows||jsonb_build_array(jsonb_build_object('user_id',p.id,'name',p.full_name,'date',d,'department',(SELECT name FROM biz_departments WHERE id=coalesce(c.department_id,public.biz_department_at(p.id,d))),'obligated',duty AND c.excluded_at IS NULL,'plan_status',CASE WHEN c.excluded_at IS NOT NULL OR NOT duty THEN 'na' ELSE coalesce(c.current_status,'unobserved') END,'plan_source',c.source,'deadline_at',c.deadline_at,'initial_status',c.initial_status,'observed_at',c.observed_at,'excluded',c.excluded_at IS NOT NULL,'exclusion_reason',c.exclusion_reason,'manual_status',s->>'manual_status','confirmed_at',s->'confirmed_at','summary_late',coalesce((s->>'confirmed_at')::timestamptz>((d+(SELECT summary_by FROM k3_settings WHERE id)) AT TIME ZONE 'Asia/Ho_Chi_Minh'),false),'system_status',s->>'system_status','action_count',s->'action_count','result_count',s->'result_count'));
 END LOOP; END LOOP;RETURN rows;
END $fn$;
REVOKE ALL ON FUNCTION public.k3_discipline_read(date,date,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_discipline_read(date,date,boolean) TO authenticated;