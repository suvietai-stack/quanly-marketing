-- PENDING OWNER APPROVAL. No data writes, no changes to 0371 functions.
-- Scope semantics are copied from live 0371, not expanded to new Role sources.
SET LOCAL lock_timeout = '2s';
DO $$ BEGIN
  IF md5(pg_get_functiondef('private.sig_scope_ok(uuid,text[])'::regprocedure)) <> '319bb21470d346ad639a1758ae7e13e4'
  THEN RAISE EXCEPTION 'Signal scope changed since snapshot; re-audit required'; END IF;
  IF (SELECT md5(qual) FROM pg_policies WHERE schemaname='public' AND tablename='opportunity_signals' AND policyname='sig_select') IS DISTINCT FROM 'b40a5cec6cf98a86495a46262d5189a8'
  THEN RAISE EXCEPTION 'Signal read policy changed since snapshot; re-audit required'; END IF;
END $$;

CREATE FUNCTION private.sig_read_scope_context(_uid uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT CASE WHEN _uid IS NULL OR _uid IS DISTINCT FROM auth.uid() THEN jsonb_build_object('all',false,'groups','[]'::jsonb)
WHEN private.is_super_admin(_uid) OR private.is_admin(_uid)
THEN jsonb_build_object('all',true,'groups','[]'::jsonb)
ELSE (
  WITH roles AS MATERIALIZED (
    SELECT role.signal_scope_all,role.signal_scope
    FROM private.role_source_rows(private.base_config()) source
    JOIN public.app_roles role ON role.id=source.role_id
    WHERE source.user_id=_uid AND source.source_kind='slot'
      AND EXISTS(SELECT 1 FROM unnest(source.permissions) p WHERE p LIKE 'signal.%')
    UNION ALL
    SELECT r.signal_scope_all,r.signal_scope
    FROM public.user_roles ur JOIN public.app_roles r ON r.id=ur.role_id
    WHERE ur.user_id=_uid
    UNION ALL
    SELECT r.signal_scope_all,r.signal_scope
    FROM public.org_assignments a
    JOIN public.base_title_role_links l ON l.title_id=a.title_id AND a.slot_id IS NULL
    JOIN public.app_roles r ON r.id=l.role_id
    WHERE a.user_id=_uid AND a.status='active' AND a.starts_at<=now()
      AND (a.ends_at IS NULL OR a.ends_at>now())
      AND l.permission_signature=md5(coalesce(r.permissions,'{}')::text)
  )
  SELECT jsonb_build_object(
    'all',coalesce((SELECT bool_or(signal_scope_all) FROM roles),false) OR (
      NOT EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id=_uid)
      AND NOT EXISTS(SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id=a.title_id AND a.slot_id IS NULL
        WHERE a.user_id=_uid AND a.status='active' AND a.starts_at<=now()
          AND (a.ends_at IS NULL OR a.ends_at>now()))),
    'groups',coalesce((SELECT jsonb_agg(DISTINCT g) FROM roles
      CROSS JOIN LATERAL unnest(signal_scope) g WHERE g IS NOT NULL),'[]'::jsonb))
) END;
$$;
REVOKE ALL ON FUNCTION private.sig_read_scope_context(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.sig_read_scope_context(uuid) TO authenticated;

-- Only the row-dependent comparison stays in the scan. The context is an
-- uncorrelated scalar subquery / InitPlan, scoped to this database statement.
-- Creator/assigned branches, sig_can (DENY/active), restrictive RLS stay intact.
ALTER POLICY sig_select ON public.opportunity_signals USING (
  (((SELECT private.sig_can(auth.uid(),'signal.view_all'))
     OR (SELECT private.sig_can(auth.uid(),'signal.manage')))
    AND EXISTS (
      SELECT 1 FROM (SELECT (SELECT private.sig_read_scope_context(auth.uid())) value OFFSET 0) context
      WHERE (context.value->>'all')::boolean
        OR EXISTS (SELECT 1 FROM unnest(coalesce(need_groups,'{}'::text[])) g
          WHERE context.value->'groups' ? g
             OR (g LIKE 'Khác:%' AND context.value->'groups' ? 'Khác'))))
  OR (created_by=(SELECT auth.uid()) AND (SELECT private.sig_can(auth.uid(),'signal.create')))
  OR (assigned_to=(SELECT auth.uid()) AND (SELECT private.sig_can(auth.uid(),'signal.sale')))
);