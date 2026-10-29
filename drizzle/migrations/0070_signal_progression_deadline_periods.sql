CREATE TABLE public.signal_progression_config (id boolean PRIMARY KEY DEFAULT true CHECK(id), activated_at timestamptz, activated_by uuid REFERENCES public.profiles(id));
GRANT SELECT ON public.signal_progression_config TO authenticated;
GRANT ALL ON public.signal_progression_config TO service_role;
ALTER TABLE public.signal_progression_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY progression_config_read ON public.signal_progression_config FOR SELECT TO authenticated USING (true);
CREATE TABLE public.signal_progression_assignments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), signal_id uuid NOT NULL REFERENCES public.opportunity_signals(id), sale_id uuid NOT NULL REFERENCES public.profiles(id), started_at timestamptz NOT NULL, ended_at timestamptz, end_reason text);
GRANT SELECT ON public.signal_progression_assignments TO authenticated;
GRANT ALL ON public.signal_progression_assignments TO service_role;
ALTER TABLE public.signal_progression_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY progression_assignments_read ON public.signal_progression_assignments FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.opportunity_signals s WHERE s.id=signal_id));
CREATE UNIQUE INDEX progression_one_active_assignment ON public.signal_progression_assignments(signal_id) WHERE ended_at IS NULL;
CREATE TABLE public.signal_progression_periods (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), assignment_id uuid NOT NULL REFERENCES public.signal_progression_assignments(id), sequence integer NOT NULL CHECK(sequence>0), starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, due_on date NOT NULL, outcome text NOT NULL DEFAULT 'pending' CHECK(outcome IN ('pending','on_time','missed','exempt')), note_id uuid REFERENCES public.opportunity_signal_notes(id), recorded_at timestamptz, UNIQUE(assignment_id,sequence), CHECK(ends_at>starts_at));
GRANT SELECT ON public.signal_progression_periods TO authenticated;
GRANT ALL ON public.signal_progression_periods TO service_role;
ALTER TABLE public.signal_progression_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY progression_periods_read ON public.signal_progression_periods FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.signal_progression_assignments a WHERE a.id=assignment_id));
CREATE INDEX progression_due_index ON public.signal_progression_periods(ends_at) WHERE outcome='pending';
CREATE FUNCTION private.progression_visible(_uid uuid,_s public.opportunity_signals) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT ((private.sig_can(_uid,'signal.view_all') OR private.sig_can(_uid,'signal.manage')) AND private.sig_scope_ok(_uid,_s.need_groups)) OR (_s.created_by=_uid AND private.sig_can(_uid,'signal.create')) OR (_s.assigned_to=_uid AND private.sig_can(_uid,'signal.sale')); $$;
CREATE FUNCTION private.progression_boundary(_start timestamptz,_seq integer) RETURNS timestamptz LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT (((_start AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + CASE _seq WHEN 1 THEN 6 WHEN 2 THEN 13 WHEN 3 THEN 20 WHEN 4 THEN 27 ELSE 27+30*(_seq-4) END)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'); $$;
CREATE FUNCTION private.progression_sync(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.signal_progression_assignments; s public.opportunity_signals; p public.signal_progression_periods; k integer; st timestamptz; en timestamptz; until_at timestamptz; n uuid;
BEGIN
 SELECT * INTO s FROM public.opportunity_signals WHERE id=_id FOR UPDATE;
 IF NOT FOUND THEN RETURN; END IF;
 FOR a IN SELECT * FROM public.signal_progression_assignments WHERE signal_id=_id LOOP
  until_at:=coalesce(a.ended_at,now()); k:=1; st:=a.started_at;
  LOOP
   en:=private.progression_boundary(a.started_at,k);
   INSERT INTO public.signal_progression_periods(assignment_id,sequence,starts_at,ends_at,due_on) VALUES(a.id,k,st,en,(en AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-1) ON CONFLICT(assignment_id,sequence) DO NOTHING;
   SELECT * INTO p FROM public.signal_progression_periods WHERE assignment_id=a.id AND sequence=k FOR UPDATE;
   IF p.outcome='pending' THEN
    SELECT id INTO n FROM public.opportunity_signal_notes WHERE signal_id=_id AND created_at>=st AND created_at<en AND (a.ended_at IS NULL OR created_at<=a.ended_at) AND public.signal_note_is_progression(note,event_type,is_progression) ORDER BY created_at,id LIMIT 1;
    IF n IS NOT NULL THEN UPDATE public.signal_progression_periods SET outcome='on_time',note_id=n,recorded_at=now() WHERE id=p.id;
    ELSIF en<=until_at THEN UPDATE public.signal_progression_periods SET outcome='missed',recorded_at=now() WHERE id=p.id;
    ELSIF a.ended_at IS NOT NULL THEN UPDATE public.signal_progression_periods SET outcome='exempt',recorded_at=now() WHERE id=p.id;
    END IF;
   ELSIF p.outcome='exempt' THEN
    SELECT id INTO n FROM public.opportunity_signal_notes WHERE signal_id=_id AND created_at>=st AND created_at<en AND created_at<=a.ended_at AND public.signal_note_is_progression(note,event_type,is_progression) ORDER BY created_at,id LIMIT 1;
    IF n IS NOT NULL THEN UPDATE public.signal_progression_periods SET outcome='on_time',note_id=n,recorded_at=now() WHERE id=p.id; END IF;
   END IF;
   EXIT WHEN en>until_at; k:=k+1; st:=en;
  END LOOP;
 END LOOP;
END $$;
CREATE FUNCTION private.progression_lifecycle() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE activation timestamptz; at_time timestamptz:=now();
BEGIN
 SELECT activated_at INTO activation FROM public.signal_progression_config WHERE id;
 IF activation IS NULL THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' THEN
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR NEW.status IN ('won','lost') OR NEW.cancelled_at IS NOT NULL THEN
   UPDATE public.signal_progression_assignments SET ended_at=at_time,end_reason=CASE WHEN NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN 'handover' ELSE 'closed' END WHERE signal_id=NEW.id AND ended_at IS NULL;
  END IF;
 END IF;
 IF NEW.assigned_to IS NOT NULL AND coalesce(NEW.status,'') NOT IN ('won','lost') AND NEW.cancelled_at IS NULL AND NOT EXISTS(SELECT 1 FROM public.signal_progression_assignments WHERE signal_id=NEW.id AND ended_at IS NULL) THEN
  INSERT INTO public.signal_progression_assignments(signal_id,sale_id,started_at) VALUES(NEW.id,NEW.assigned_to,greatest(activation,at_time));
 END IF;
 PERFORM private.progression_sync(NEW.id); RETURN NEW;
END $$;
CREATE TRIGGER progression_signal_lifecycle AFTER INSERT OR UPDATE OF assigned_to,status,cancelled_at ON public.opportunity_signals FOR EACH ROW EXECUTE FUNCTION private.progression_lifecycle();
CREATE FUNCTION private.progression_note_added() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF public.signal_note_is_progression(NEW.note,NEW.event_type,NEW.is_progression) THEN PERFORM private.progression_sync(NEW.signal_id); END IF; RETURN NEW; END $$;
CREATE TRIGGER progression_note_insert AFTER INSERT ON public.opportunity_signal_notes FOR EACH ROW EXECUTE FUNCTION private.progression_note_added();
CREATE FUNCTION public.signal_progression_deadlines() RETURNS TABLE(signal_id uuid,sale_id uuid,sequence integer,due_on date,deadline_state text,overdue_days integer,next_due_on date,calculated_at timestamptz) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 WITH active AS (SELECT a.*,s FROM public.signal_progression_assignments a JOIN public.opportunity_signals s ON s.id=a.signal_id WHERE a.ended_at IS NULL AND private.progression_visible(auth.uid(),s)),
 cur AS (SELECT a.*,p.sequence,p.due_on,p.starts_at,p.ends_at FROM active a CROSS JOIN LATERAL (SELECT CASE WHEN (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<=(a.started_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+5 THEN 1 WHEN (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<=(a.started_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+12 THEN 2 WHEN (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<=(a.started_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+19 THEN 3 WHEN (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<=(a.started_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+26 THEN 4 ELSE 5+(((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-(a.started_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-27)/30) END AS seq) q CROSS JOIN LATERAL (SELECT q.seq AS sequence,CASE WHEN q.seq=1 THEN a.started_at ELSE private.progression_boundary(a.started_at,q.seq-1) END AS starts_at,private.progression_boundary(a.started_at,q.seq) AS ends_at,(private.progression_boundary(a.started_at,q.seq) AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-1 AS due_on) p),
 state AS (SELECT c.*,EXISTS(SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id=c.signal_id AND n.created_at>=c.starts_at AND n.created_at<c.ends_at AND public.signal_note_is_progression(n.note,n.event_type,n.is_progression)) AS done,
 (SELECT min(p.ends_at) FROM public.signal_progression_periods p WHERE p.assignment_id=c.id AND p.ends_at<=now() AND p.outcome IN ('pending','missed') AND NOT EXISTS(SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id=c.signal_id AND n.created_at>=p.starts_at AND n.created_at<p.ends_at AND public.signal_note_is_progression(n.note,n.event_type,n.is_progression)) AND NOT EXISTS(SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id=c.signal_id AND n.created_at>=p.ends_at AND n.created_at<=now() AND public.signal_note_is_progression(n.note,n.event_type,n.is_progression))) AS backlog FROM cur c)
 SELECT signal_id,sale_id,sequence,due_on,CASE WHEN backlog IS NOT NULL THEN 'overdue' WHEN done THEN 'updated' WHEN due_on=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN 'today' WHEN due_on=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+1 THEN 'soon' ELSE 'ok' END,CASE WHEN backlog IS NULL THEN 0 ELSE greatest(1,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-(backlog AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+1) END,(private.progression_boundary(started_at,sequence+1) AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-1,now() FROM state;
$$;
REVOKE ALL ON FUNCTION public.signal_progression_deadlines() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_progression_deadlines() TO authenticated;
CREATE FUNCTION public.signal_progression_report(_from date DEFAULT NULL,_to date DEFAULT NULL,_sale uuid DEFAULT NULL,_group text DEFAULT NULL,_source text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT (private.sig_can(auth.uid(),'signal.report') OR private.sig_can(auth.uid(),'signal.manage')) THEN RAISE EXCEPTION 'Không có quyền xem báo cáo'; END IF;
 WITH scope AS (SELECT s.* FROM public.opportunity_signals s WHERE private.progression_visible(auth.uid(),s) AND (_group IS NULL OR _group=ANY(s.need_groups)) AND (_source IS NULL OR s.source=_source)),
 hist AS (SELECT a.sale_id,count(*) FILTER(WHERE p.outcome='on_time') AS on_time,count(*) AS due FROM public.signal_progression_periods p JOIN public.signal_progression_assignments a ON a.id=p.assignment_id JOIN scope s ON s.id=a.signal_id WHERE p.ends_at<=now() AND p.outcome<>'exempt' AND (_sale IS NULL OR a.sale_id=_sale) AND (_from IS NULL OR p.due_on>=_from) AND (_to IS NULL OR p.due_on<=_to) GROUP BY a.sale_id),
 live AS (SELECT d.sale_id,count(*) AS tracking,count(*) FILTER(WHERE d.deadline_state='overdue') AS overdue,count(*) FILTER(WHERE d.deadline_state='today') AS today,count(*) FILTER(WHERE d.deadline_state='soon') AS soon FROM public.signal_progression_deadlines() d JOIN scope s ON s.id=d.signal_id WHERE (_sale IS NULL OR d.sale_id=_sale) GROUP BY d.sale_id),
 sales AS (SELECT coalesce(h.sale_id,l.sale_id) AS sale_id,coalesce(h.on_time,0) AS on_time,coalesce(h.due,0) AS due,CASE WHEN coalesce(h.due,0)>0 THEN h.on_time*100.0/h.due END AS rate,coalesce(l.tracking,0) AS tracking,coalesce(l.overdue,0) AS overdue,coalesce(l.today,0) AS today,coalesce(l.soon,0) AS soon FROM hist h FULL JOIN live l USING(sale_id))
 SELECT jsonb_build_object('sales',coalesce(jsonb_agg(to_jsonb(sales)),'[]'::jsonb),'total',jsonb_build_object('on_time',coalesce(sum(on_time),0),'due',coalesce(sum(due),0),'rate',CASE WHEN sum(due)>0 THEN sum(on_time)*100.0/sum(due) END,'tracking',coalesce(sum(tracking),0),'overdue',coalesce(sum(overdue),0),'today',coalesce(sum(today),0),'soon',coalesce(sum(soon),0)),'calculated_at',now(),'activated_at',(SELECT activated_at FROM public.signal_progression_config WHERE id)) INTO result FROM sales;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.signal_progression_report(date,date,uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_progression_report(date,date,uuid,text,text) TO authenticated;
CREATE FUNCTION private.progression_tick() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a record; cnt integer:=0; r record; day_vn date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date; msg text; original_sub text:=current_setting('request.jwt.claim.sub',true);
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.signal_progression_config WHERE activated_at IS NOT NULL) THEN RETURN 0; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('signal-progression-tick'));
 FOR a IN SELECT DISTINCT signal_id FROM public.signal_progression_assignments WHERE ended_at IS NULL OR EXISTS(SELECT 1 FROM public.signal_progression_periods p WHERE p.assignment_id=signal_progression_assignments.id AND p.outcome='pending') LOOP PERFORM private.progression_sync(a.signal_id); END LOOP;
 FOR a IN SELECT DISTINCT sale_id FROM public.signal_progression_assignments WHERE ended_at IS NULL LOOP
  IF NOT private.sig_can(a.sale_id,'signal.sale') THEN CONTINUE; END IF;
  PERFORM set_config('request.jwt.claim.sub',a.sale_id::text,true);
  FOR r IN SELECT deadline_state,count(*) AS n FROM public.signal_progression_deadlines() WHERE sale_id=a.sale_id AND deadline_state IN ('soon','today','overdue') GROUP BY deadline_state LOOP
   msg:=CASE r.deadline_state WHEN 'soon' THEN 'Bạn có '||r.n||' tín hiệu sắp đến hạn cập nhật diễn biến.' WHEN 'today' THEN 'Hôm nay bạn có '||r.n||' tín hiệu cần cập nhật.' ELSE 'Bạn đang có '||r.n||' tín hiệu quá hạn cập nhật.' END;
   INSERT INTO public.notifications(recipient_id,kind,dedup_key,zalo_status,push_status,payload) VALUES(a.sale_id,'signal_care','progression:'||a.sale_id||':'||r.deadline_state||':'||day_vn,'ineligible','none',jsonb_build_object('progression',true,'deadline',r.deadline_state,'count',r.n,'message',msg,'sale_id',a.sale_id)) ON CONFLICT(dedup_key) DO NOTHING;
   cnt:=cnt+1;
  END LOOP;
 END LOOP;
 PERFORM set_config('request.jwt.claim.sub',coalesce(original_sub,''),true);
 RETURN cnt;
END $$;
CREATE FUNCTION public.signal_progression_activate(_confirm boolean) RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE activation timestamptz; s record;
BEGIN
 IF NOT private.sig_can(auth.uid(),'signal.manage') OR NOT (private.is_admin(auth.uid()) OR private.is_super_admin(auth.uid())) OR NOT _confirm THEN RAISE EXCEPTION 'Cần quyền quản lý Admin và xác nhận kích hoạt'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('signal-progression-activation'));
 SELECT activated_at INTO activation FROM public.signal_progression_config WHERE id;
 IF activation IS NOT NULL THEN RETURN activation; END IF;
 activation:=now();
 INSERT INTO public.signal_progression_config(id,activated_at,activated_by) VALUES(true,activation,auth.uid());
 FOR s IN SELECT * FROM public.opportunity_signals WHERE assigned_to IS NOT NULL AND coalesce(status,'') NOT IN ('won','lost') AND cancelled_at IS NULL FOR UPDATE LOOP
  INSERT INTO public.signal_progression_assignments(signal_id,sale_id,started_at) VALUES(s.id,s.assigned_to,activation); PERFORM private.progression_sync(s.id);
 END LOOP;
 PERFORM cron.schedule('signal-progression-daily','0 1 * * *','SELECT private.progression_tick();');
 RETURN activation;
END $$;
REVOKE ALL ON FUNCTION public.signal_progression_activate(boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_progression_activate(boolean) TO authenticated;
REVOKE ALL ON FUNCTION private.progression_visible(uuid,public.opportunity_signals),private.progression_boundary(timestamptz,integer),private.progression_sync(uuid),private.progression_lifecycle(),private.progression_note_added(),private.progression_tick() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION private.progression_tick() TO service_role;
COMMENT ON TABLE public.signal_progression_config IS 'Inactive until explicit manager confirmation; shared production data must not be activated by deployment.';