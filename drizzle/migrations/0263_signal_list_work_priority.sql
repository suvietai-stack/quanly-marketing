CREATE OR REPLACE VIEW public.signal_list_priority WITH (security_invoker = true) AS
SELECT s.*,
  CASE WHEN s.cancelled_at IS NOT NULL OR s.status IN ('won','lost') THEN 3 WHEN s.assigned_to IS NULL AND s.status IS NULL THEN 0 WHEN s.status = 'waiting' THEN 1 ELSE 2 END AS list_priority,
  CASE WHEN s.cancelled_at IS NOT NULL OR s.status IN ('won','lost') THEN NULL::timestamptz WHEN s.assigned_to IS NULL AND s.status IS NULL THEN coalesce(a.unassigned_at,s.created_at) WHEN s.status='waiting' THEN coalesce(greatest(a.assigned_at,n.waiting_at,s.assigned_at),s.created_at) ELSE NULL::timestamptz END AS list_wait_since,
  greatest(s.updated_at,n.activity_at) AS list_activity_at,
  CASE WHEN s.cancelled_at IS NOT NULL OR s.status IN ('won','lost') THEN 6 WHEN s.assigned_to IS NULL AND s.status IS NULL THEN 0 WHEN s.status='waiting' THEN 1 WHEN d.deadline_state='overdue' THEN 2 WHEN d.deadline_state='today' THEN 3 WHEN d.deadline_state='soon' THEN 4 ELSE 5 END AS list_work_priority,
  d.due_on AS list_progression_due_on
FROM public.opportunity_signals s
LEFT JOIN LATERAL (
 SELECT max(e.created_at) FILTER (WHERE e.detail ? 'to' AND e.detail->'to'='null'::jsonb) AS unassigned_at, max(e.created_at) FILTER (WHERE e.detail->>'to'=s.assigned_to::text) AS assigned_at FROM public.opportunity_signal_events e WHERE e.signal_id=s.id AND e.kind='assign'
) a ON true
LEFT JOIN LATERAL (
 SELECT max(j.created_at) FILTER (WHERE j.status_to='waiting' AND j.status_from IS DISTINCT FROM j.status_to) AS waiting_at,max(j.created_at) AS activity_at FROM public.opportunity_signal_notes j WHERE j.signal_id=s.id
) n ON true
LEFT JOIN public.signal_progression_deadlines() d ON d.signal_id=s.id;
REVOKE ALL ON public.signal_list_priority FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT ON public.signal_list_priority TO authenticated,service_role;
COMMENT ON VIEW public.signal_list_priority IS 'SELECT-only RLS-invoker list; additive work rank 0 unassigned,1 waiting,2 overdue,3 today,4 soon,5 active,6 ended. Deadlines reuse caller-scoped authoritative progression RPC; legacy intake columns unchanged.';