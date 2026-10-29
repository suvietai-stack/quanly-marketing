CREATE OR REPLACE FUNCTION private.progression_sync(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r record;
BEGIN
 PERFORM 1 FROM public.opportunity_signals WHERE id=_id FOR UPDATE;
 IF NOT FOUND THEN RETURN; END IF;
 FOR r IN SELECT * FROM private.progression_evaluated() WHERE signal_id=_id ORDER BY assignment_id,sequence LOOP
  INSERT INTO public.signal_progression_periods(assignment_id,sequence,starts_at,ends_at,due_on,outcome,note_id,recorded_at)
  VALUES(r.assignment_id,r.sequence,r.starts_at,r.ends_at,r.due_on,r.outcome,r.note_id,CASE WHEN r.outcome<>'pending' THEN now() END)
  ON CONFLICT(assignment_id,sequence) DO UPDATE SET outcome=excluded.outcome,note_id=excluded.note_id,recorded_at=coalesce(signal_progression_periods.recorded_at,excluded.recorded_at)
  WHERE signal_progression_periods.outcome='pending' OR excluded.outcome='exempt';
 END LOOP;
END $$;
COMMENT ON FUNCTION private.progression_sync(uuid) IS 'Uses the same read-time evaluator as list/report/history; missed outcomes cannot become on_time from late notes.';