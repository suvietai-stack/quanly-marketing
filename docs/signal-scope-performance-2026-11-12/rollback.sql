BEGIN;
ALTER POLICY sig_select ON public.opportunity_signals USING ((((( SELECT private.sig_can(auth.uid(), 'signal.view_all'::text) AS sig_can) OR ( SELECT private.sig_can(auth.uid(), 'signal.manage'::text) AS sig_can)) AND private.sig_scope_ok(( SELECT auth.uid() AS uid), need_groups)) OR ((created_by = ( SELECT auth.uid() AS uid)) AND ( SELECT private.sig_can(auth.uid(), 'signal.create'::text) AS sig_can)) OR ((assigned_to = ( SELECT auth.uid() AS uid)) AND ( SELECT private.sig_can(auth.uid(), 'signal.sale'::text) AS sig_can))));
DROP FUNCTION private.sig_scope_matches(jsonb,text[]);
DROP FUNCTION private.sig_scope_context(uuid);
COMMIT;
