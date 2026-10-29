CREATE INDEX IF NOT EXISTS signal_notes_signal_created_idx ON public.opportunity_signal_notes(signal_id, created_at);
CREATE INDEX IF NOT EXISTS signal_events_signal_created_idx ON public.opportunity_signal_events(signal_id, created_at);
WITH ev AS (
  SELECT e.signal_id, e.created_at, (e.detail->>'to')::uuid AS to_sale,
         lead(e.created_at) OVER w AS next_at,
         lead((e.detail->>'to')::uuid) OVER w AS next_to
  FROM public.opportunity_signal_events e
  WHERE e.kind='assign' AND e.detail->>'to' IS NOT NULL
  WINDOW w AS (PARTITION BY e.signal_id ORDER BY e.created_at, e.id)
), chain AS (
  SELECT signal_id, to_sale AS sale_id, created_at AS started_at, next_at AS ended_at
  FROM ev WHERE next_at IS NULL OR next_to IS DISTINCT FROM to_sale
), closed_segments AS (
  INSERT INTO public.signal_progression_assignments(signal_id, sale_id, started_at, ended_at, end_reason)
  SELECT c.signal_id, c.sale_id, c.started_at, coalesce(c.ended_at, s.closed_at, s.cancelled_at),
         CASE WHEN c.ended_at IS NOT NULL THEN 'handover' ELSE 'closed' END
  FROM chain c JOIN public.opportunity_signals s ON s.id=c.signal_id
  WHERE coalesce(c.ended_at, s.closed_at, s.cancelled_at) IS NOT NULL
  ON CONFLICT DO NOTHING
)
INSERT INTO public.signal_progression_assignments(signal_id, sale_id, started_at)
SELECT c.signal_id, c.sale_id, c.started_at
FROM chain c JOIN public.opportunity_signals s ON s.id=c.signal_id
WHERE c.ended_at IS NULL AND s.closed_at IS NULL AND s.cancelled_at IS NULL
  AND s.assigned_to IS NOT NULL AND coalesce(s.status,'') NOT IN ('won','lost')
ON CONFLICT DO NOTHING;
INSERT INTO public.signal_progression_assignments(signal_id, sale_id, started_at)
SELECT s.id, s.assigned_to, now()
FROM public.opportunity_signals s
WHERE s.assigned_to IS NOT NULL AND coalesce(s.status,'') NOT IN ('won','lost') AND s.cancelled_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.signal_progression_assignments a WHERE a.signal_id = s.id)
ON CONFLICT DO NOTHING;
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT DISTINCT signal_id FROM public.signal_progression_assignments LOOP
    PERFORM private.progression_sync(r.signal_id);
  END LOOP;
END $$;
CREATE OR REPLACE FUNCTION private.progression_lifecycle() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE at_time timestamptz:=now();
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR NEW.status IN ('won','lost') OR NEW.cancelled_at IS NOT NULL THEN
   UPDATE public.signal_progression_assignments SET ended_at=at_time,end_reason=CASE WHEN NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN 'handover' ELSE 'closed' END WHERE signal_id=NEW.id AND ended_at IS NULL;
  END IF;
 END IF;
 IF NEW.assigned_to IS NOT NULL AND coalesce(NEW.status,'') NOT IN ('won','lost') AND NEW.cancelled_at IS NULL AND NOT EXISTS(SELECT 1 FROM public.signal_progression_assignments WHERE signal_id=NEW.id AND ended_at IS NULL) THEN
  INSERT INTO public.signal_progression_assignments(signal_id,sale_id,started_at) VALUES(NEW.id,NEW.assigned_to,at_time);
 END IF;
 PERFORM private.progression_sync(NEW.id); RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION private.progression_tick() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a record; cnt integer:=0; r record; day_vn date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date; msg text; original_sub text:=current_setting('request.jwt.claim.sub',true);
BEGIN
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
INSERT INTO public.signal_progression_config(id, activated_at, activated_by) VALUES (true, now(), NULL) ON CONFLICT (id) DO NOTHING;
COMMENT ON TABLE public.signal_progression_config IS 'Rule start marker; tracking is always on. Periods due before activated_at are retrospective reference only, excluded from KR.';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname='signal-progression-daily') THEN
  PERFORM cron.schedule('signal-progression-daily','0 1 * * *','SELECT private.progression_tick();');
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.signal_progression_activate(_confirm boolean) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN RETURN (SELECT activated_at FROM public.signal_progression_config WHERE id); END $$;
COMMENT ON FUNCTION public.signal_progression_activate(boolean) IS 'DEPRECATED: tracking is always on; returns the rule start marker.';
CREATE OR REPLACE FUNCTION public.signal_progression_report(_from date DEFAULT NULL,_to date DEFAULT NULL,_sale uuid DEFAULT NULL,_group text DEFAULT NULL,_source text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; rule_start date;
BEGIN
 IF auth.uid() IS NULL OR NOT coalesce(private.sig_can(auth.uid(),'signal.report') OR private.sig_can(auth.uid(),'signal.manage'),false) THEN RAISE EXCEPTION 'Không có quyền xem báo cáo'; END IF;
 SELECT (activated_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date INTO rule_start FROM public.signal_progression_config WHERE id;
 rule_start:=coalesce(rule_start,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date);
 WITH scope AS (SELECT s.* FROM public.opportunity_signals s WHERE private.progression_visible(auth.uid(),s) AND (_group IS NULL OR _group=ANY(s.need_groups)) AND (_source IS NULL OR s.source=_source)),
 hist AS (SELECT p.sale_id,count(*) FILTER(WHERE p.outcome='on_time' AND p.due_on>=rule_start) AS on_time,count(*) FILTER(WHERE p.due_on>=rule_start) AS due,count(*) FILTER(WHERE p.outcome='on_time' AND p.due_on<rule_start) AS retro_on_time,count(*) FILTER(WHERE p.due_on<rule_start) AS retro_due FROM private.progression_evaluated() p JOIN scope s ON s.id=p.signal_id WHERE p.ends_at<=now() AND p.outcome<>'exempt' AND (_sale IS NULL OR p.sale_id=_sale) AND (_from IS NULL OR p.due_on>=_from) AND (_to IS NULL OR p.due_on<=_to) GROUP BY p.sale_id),
 live AS (SELECT d.sale_id,count(*) AS tracking,count(*) FILTER(WHERE d.deadline_state='overdue') AS overdue,count(*) FILTER(WHERE d.deadline_state='today') AS today,count(*) FILTER(WHERE d.deadline_state='soon') AS soon FROM public.signal_progression_deadlines() d JOIN scope s ON s.id=d.signal_id WHERE (_sale IS NULL OR d.sale_id=_sale) GROUP BY d.sale_id),
 sales AS (SELECT coalesce(h.sale_id,l.sale_id) AS sale_id,coalesce(h.on_time,0) AS on_time,coalesce(h.due,0) AS due,CASE WHEN coalesce(h.due,0)>0 THEN h.on_time*100.0/h.due END AS rate,coalesce(h.retro_on_time,0) AS retro_on_time,coalesce(h.retro_due,0) AS retro_due,coalesce(l.tracking,0) AS tracking,coalesce(l.overdue,0) AS overdue,coalesce(l.today,0) AS today,coalesce(l.soon,0) AS soon FROM hist h FULL JOIN live l USING(sale_id))
 SELECT jsonb_build_object('sales',coalesce(jsonb_agg(to_jsonb(sales)),'[]'::jsonb),'total',jsonb_build_object('on_time',coalesce(sum(on_time),0),'due',coalesce(sum(due),0),'rate',CASE WHEN sum(due)>0 THEN sum(on_time)*100.0/sum(due) END,'retro_on_time',coalesce(sum(retro_on_time),0),'retro_due',coalesce(sum(retro_due),0),'tracking',coalesce(sum(tracking),0),'overdue',coalesce(sum(overdue),0),'today',coalesce(sum(today),0),'soon',coalesce(sum(soon),0)),'calculated_at',now(),'activated_at',(SELECT activated_at FROM public.signal_progression_config WHERE id)) INTO result FROM sales;
 RETURN result;
END $$;