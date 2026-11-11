-- PENDING P0: NOT APPLIED. No Role/data edits. Admin must approve backend rollout separately.
-- Preserve the existing truth table; evaluate the expensive slot-source path only after
-- the already-existing Admin/Super Admin branch. CASE guarantees short-circuit evaluation.
-- Non-admin slot/title/direct scope branches remain unchanged. No grants or RLS bypass.
CREATE OR REPLACE FUNCTION private.sig_scope_ok(_uid uuid, _groups text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _uid IS NULL THEN false
    WHEN private.is_super_admin(_uid) OR private.is_admin(_uid) THEN true
    ELSE EXISTS(SELECT 1 FROM private.role_source_rows(private.base_config()) source JOIN app_roles role ON role.id=source.role_id WHERE source.user_id=_uid AND source.source_kind='slot' AND EXISTS(SELECT 1 FROM unnest(source.permissions) p WHERE p LIKE 'signal.%') AND (role.signal_scope_all OR EXISTS(SELECT 1 FROM unnest(coalesce(_groups,'{}')) g WHERE g=ANY(role.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác'=ANY(role.signal_scope))))) OR (
    (NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid)
        AND NOT EXISTS (SELECT 1 FROM public.org_assignments a
                          JOIN public.base_title_role_links l ON l.title_id = a.title_id AND a.slot_id IS NULL
                        WHERE a.user_id = _uid AND a.status = 'active'
                          AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())))
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
               WHERE ur.user_id = _uid AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE ur.user_id = _uid
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id AND a.slot_id IS NULL
        JOIN public.app_roles r ON r.id = l.role_id
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id AND a.slot_id IS NULL
        JOIN public.app_roles r ON r.id = l.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
) END;
$function$;
