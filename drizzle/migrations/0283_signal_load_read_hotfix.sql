DO $$ DECLARE definition text; BEGIN
SELECT pg_get_functiondef('public.signal_filtered(jsonb)'::regprocedure) INTO definition;
definition:=replace(replace(replace(definition,'public.signal_filtered(', 'public.signal_base_filtered('),'SETOF signal_list_priority','SETOF opportunity_signals'),'FROM signal_list_priority s','FROM opportunity_signals s');
IF definition NOT LIKE '%public.signal_base_filtered(%' OR definition LIKE '%FROM signal_list_priority s%' THEN RAISE EXCEPTION 'Unexpected signal filter definition'; END IF;
EXECUTE definition;
SELECT pg_get_functiondef('public.signal_list_counts(jsonb)'::regprocedure) INTO definition;
EXECUTE replace(definition,'signal_filtered(', 'signal_base_filtered(');
END $$;
REVOKE ALL ON FUNCTION public.signal_base_filtered(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_base_filtered(jsonb) TO authenticated,service_role;
ALTER POLICY sig_select ON public.opportunity_signals USING (
 (((SELECT private.sig_can(auth.uid(),'signal.view_all')) OR (SELECT private.sig_can(auth.uid(),'signal.manage'))) AND private.sig_scope_ok((SELECT auth.uid()),need_groups))
 OR (created_by=(SELECT auth.uid()) AND (SELECT private.sig_can(auth.uid(),'signal.create')))
 OR (assigned_to=(SELECT auth.uid()) AND (SELECT private.sig_can(auth.uid(),'signal.sale')))
);
ALTER POLICY account_active_guard ON public.opportunity_signals USING ((SELECT private.is_active(auth.uid())));
ALTER POLICY account_active_guard ON public.opportunity_signal_notes USING ((SELECT private.is_active(auth.uid())));
ALTER POLICY account_active_guard ON public.opportunity_signal_events USING ((SELECT private.is_active(auth.uid())));
CREATE INDEX IF NOT EXISTS signal_notes_latest_read_idx ON public.opportunity_signal_notes(signal_id,created_at DESC,id DESC);
COMMENT ON FUNCTION public.signal_base_filtered(jsonb) IS 'Invoker-only identical base filters; status counts do not read assignment or note history. Permission initplans are per statement, never cached across users.';