CREATE INDEX IF NOT EXISTS signal_list_assign_time_idx ON public.opportunity_signal_events (signal_id, created_at DESC, id) WHERE kind = 'assign';
CREATE INDEX IF NOT EXISTS signal_list_wait_transition_idx ON public.opportunity_signal_notes (signal_id, created_at DESC, id) WHERE status_to = 'waiting' AND status_from IS DISTINCT FROM status_to;

CREATE VIEW public.signal_list_priority WITH (security_invoker = true) AS
SELECT s.*,
  CASE WHEN s.cancelled_at IS NOT NULL OR s.status IN ('won','lost') THEN 3
       WHEN s.assigned_to IS NULL AND s.status IS NULL THEN 0
       WHEN s.status = 'waiting' THEN 1 ELSE 2 END AS list_priority,
  CASE WHEN s.cancelled_at IS NOT NULL OR s.status IN ('won','lost') THEN NULL::timestamptz
       WHEN s.assigned_to IS NULL AND s.status IS NULL THEN coalesce(a.unassigned_at, s.created_at)
       WHEN s.status = 'waiting' THEN coalesce(greatest(a.assigned_at, n.waiting_at, s.assigned_at), s.created_at)
       ELSE NULL::timestamptz END AS list_wait_since,
  greatest(s.updated_at, n.activity_at) AS list_activity_at
FROM public.opportunity_signals s
LEFT JOIN LATERAL (
  SELECT max(e.created_at) FILTER (WHERE e.detail ? 'to' AND e.detail->'to' = 'null'::jsonb) AS unassigned_at,
         max(e.created_at) FILTER (WHERE e.detail->>'to' = s.assigned_to::text) AS assigned_at
  FROM public.opportunity_signal_events e
  WHERE e.signal_id = s.id AND e.kind = 'assign'
) a ON true
LEFT JOIN LATERAL (
  SELECT max(j.created_at) FILTER (WHERE j.status_to = 'waiting' AND j.status_from IS DISTINCT FROM j.status_to) AS waiting_at,
         max(j.created_at) AS activity_at
  FROM public.opportunity_signal_notes j WHERE j.signal_id = s.id
) n ON true;
REVOKE ALL ON public.signal_list_priority FROM PUBLIC, anon;
GRANT SELECT ON public.signal_list_priority TO authenticated, service_role;
COMMENT ON VIEW public.signal_list_priority IS 'Read-only RLS-invoker list metadata. Priority, waiting start and activity derive from existing rows/history; no business writes or synthetic timestamps.';