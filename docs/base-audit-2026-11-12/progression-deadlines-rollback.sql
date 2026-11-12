BEGIN;
CREATE OR REPLACE FUNCTION public.signal_progression_deadlines()
 RETURNS TABLE(signal_id uuid, sale_id uuid, sequence integer, due_on date, deadline_state text, overdue_days integer, next_due_on date, calculated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 WITH active AS (SELECT a.* FROM public.signal_progression_assignments a JOIN public.opportunity_signals s ON s.id=a.signal_id WHERE a.ended_at IS NULL AND private.progression_visible(auth.uid(),s)),
 cur AS (SELECT a.*,c.sequence,c.due_on,c.starts_at,c.ends_at FROM active a CROSS JOIN LATERAL (SELECT * FROM private.progression_calendar(a.started_at,NULL,now()) ORDER BY sequence DESC LIMIT 1) c),
 state AS (SELECT c.*,EXISTS(SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id=c.signal_id AND n.created_at>=c.starts_at AND n.created_at<c.ends_at AND n.created_at<=now() AND public.signal_note_is_progression(n.note,n.event_type,n.is_progression)) AS done,
 (SELECT min(p.ends_at) FROM private.progression_evaluated() p WHERE p.assignment_id=c.id AND p.ends_at<=now() AND p.outcome='missed' AND NOT EXISTS(SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id=c.signal_id AND n.created_at>=p.ends_at AND n.created_at<=now() AND public.signal_note_is_progression(n.note,n.event_type,n.is_progression))) AS backlog FROM cur c)
 SELECT signal_id,sale_id,sequence,due_on,CASE WHEN backlog IS NOT NULL THEN 'overdue' WHEN done THEN 'updated' WHEN due_on=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN 'today' WHEN due_on=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+1 THEN 'soon' ELSE 'ok' END,CASE WHEN backlog IS NULL THEN 0 ELSE greatest(1,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-(backlog AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+1) END,(private.progression_boundary(started_at,sequence+1) AT TIME ZONE 'Asia/Ho_Chi_Minh')::date-1,now() FROM state;
$function$

COMMIT;
