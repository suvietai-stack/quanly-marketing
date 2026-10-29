CREATE OR REPLACE FUNCTION private.progression_outcome(_ends timestamptz,_ended timestamptz,_note timestamptz,_asof timestamptz) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT CASE WHEN _ended IS NOT NULL AND _ended<_ends THEN 'exempt' WHEN _note IS NOT NULL AND _note<_ends AND _note<=coalesce(_ended,_asof) THEN 'on_time' WHEN _ends<=coalesce(_ended,_asof) THEN 'missed' ELSE 'pending' END; $$;
CREATE OR REPLACE FUNCTION private.progression_evaluated() RETURNS TABLE(assignment_id uuid,signal_id uuid,sale_id uuid,sequence integer,starts_at timestamptz,ends_at timestamptz,due_on date,outcome text,note_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT a.id,a.signal_id,a.sale_id,c.sequence,c.starts_at,c.ends_at,c.due_on,
 CASE WHEN a.ended_at IS NOT NULL AND a.ended_at<c.ends_at THEN 'exempt' WHEN p.outcome IN ('on_time','missed') THEN p.outcome ELSE private.progression_outcome(c.ends_at,a.ended_at,n.created_at,now()) END,n.id
 FROM public.signal_progression_assignments a CROSS JOIN LATERAL private.progression_calendar(a.started_at,a.ended_at,now()) c
 LEFT JOIN public.signal_progression_periods p ON p.assignment_id=a.id AND p.sequence=c.sequence
 LEFT JOIN LATERAL (SELECT v.id,v.created_at FROM public.opportunity_signal_notes v WHERE v.signal_id=a.signal_id AND v.created_at>=c.starts_at AND v.created_at<c.ends_at AND v.created_at<=coalesce(a.ended_at,now()) AND public.signal_note_is_progression(v.note,v.event_type,v.is_progression) ORDER BY v.created_at,v.id LIMIT 1) n ON true;
$$;
CREATE OR REPLACE FUNCTION public.signal_progression_activate(_confirm boolean) RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE activation timestamptz; s record;
BEGIN
 IF auth.uid() IS NULL OR NOT coalesce(private.sig_can(auth.uid(),'signal.manage') AND (private.is_admin(auth.uid()) OR private.is_super_admin(auth.uid())),false) OR _confirm IS DISTINCT FROM true THEN RAISE EXCEPTION 'Cần quyền quản lý Admin và xác nhận kích hoạt'; END IF;
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
COMMENT ON FUNCTION private.progression_outcome(timestamptz,timestamptz,timestamptz,timestamptz) IS 'Early closure/handover exempts not-yet-due periods even when notes exist; elapsed periods keep outcomes.';