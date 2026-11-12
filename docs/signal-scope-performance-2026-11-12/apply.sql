-- Signal scope: compute actor scope once per SELECT; preserve existing row visibility.
BEGIN;
CREATE OR REPLACE FUNCTION private.sig_scope_context(_uid uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $body$
DECLARE all_ boolean; groups_ text[];
BEGIN
 IF _uid IS NULL THEN RETURN jsonb_build_object('all',false,'groups','[]'::jsonb); END IF;
 IF private.is_super_admin(_uid) OR private.is_admin(_uid) THEN RETURN jsonb_build_object('all',true,'groups','[]'::jsonb); END IF;
 SELECT NOT EXISTS(SELECT 1 FROM user_roles WHERE user_id=_uid)
 AND NOT EXISTS(SELECT 1 FROM org_assignments a JOIN base_title_role_links l ON l.title_id=a.title_id AND a.slot_id IS NULL WHERE a.user_id=_uid AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())) INTO all_;
 IF all_ THEN RETURN jsonb_build_object('all',true,'groups','[]'::jsonb); END IF;
 WITH scopes AS MATERIALIZED (
 SELECT role.signal_scope_all AS all_scope,role.signal_scope AS groups
 FROM private.role_source_rows(private.base_config()) source JOIN app_roles role ON role.id=source.role_id
 WHERE source.user_id=_uid AND source.source_kind='slot' AND EXISTS(SELECT 1 FROM unnest(source.permissions) p WHERE p LIKE 'signal.%')
 UNION ALL
 SELECT r.signal_scope_all,r.signal_scope FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE ur.user_id=_uid
 UNION ALL
 SELECT r.signal_scope_all,r.signal_scope FROM org_assignments a JOIN base_title_role_links l ON l.title_id=a.title_id AND a.slot_id IS NULL JOIN app_roles r ON r.id=l.role_id
 WHERE a.user_id=_uid AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now()) AND l.permission_signature=md5(coalesce(r.permissions,'{}')::text)
 )
 SELECT coalesce((SELECT bool_or(all_scope) FROM scopes),false),ARRAY(SELECT DISTINCT g FROM scopes CROSS JOIN LATERAL unnest(groups) g WHERE g IS NOT NULL) INTO all_,groups_;
 RETURN jsonb_build_object('all',all_,'groups',to_jsonb(groups_));
END $body$;
CREATE OR REPLACE FUNCTION private.sig_scope_matches(context_ jsonb, groups_ text[])
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $body$
 SELECT coalesce((context_->>'all')::boolean,false)
 OR EXISTS(SELECT 1 FROM unnest(coalesce(groups_,'{}')) g WHERE (context_->'groups') ? g OR (g LIKE 'Khác:%' AND (context_->'groups') ? 'Khác'));
$body$;
REVOKE ALL ON FUNCTION private.sig_scope_context(uuid),private.sig_scope_matches(jsonb,text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.sig_scope_context(uuid),private.sig_scope_matches(jsonb,text[]) TO authenticated,service_role;
DO $guard$ BEGIN
 IF (SELECT qual FROM pg_policies WHERE schemaname='public' AND tablename='opportunity_signals' AND policyname='sig_select') IS DISTINCT FROM $baseline$(((( SELECT private.sig_can(auth.uid(), 'signal.view_all'::text) AS sig_can) OR ( SELECT private.sig_can(auth.uid(), 'signal.manage'::text) AS sig_can)) AND private.sig_scope_ok(( SELECT auth.uid() AS uid), need_groups)) OR ((created_by = ( SELECT auth.uid() AS uid)) AND ( SELECT private.sig_can(auth.uid(), 'signal.create'::text) AS sig_can)) OR ((assigned_to = ( SELECT auth.uid() AS uid)) AND ( SELECT private.sig_can(auth.uid(), 'signal.sale'::text) AS sig_can)))$baseline$ THEN RAISE EXCEPTION 'Signal policy changed; re-review required'; END IF;
END $guard$;
ALTER POLICY sig_select ON public.opportunity_signals USING ((((( SELECT private.sig_can(auth.uid(), 'signal.view_all'::text) AS sig_can) OR ( SELECT private.sig_can(auth.uid(), 'signal.manage'::text) AS sig_can)) AND private.sig_scope_matches(( SELECT private.sig_scope_context(auth.uid())), need_groups)) OR ((created_by = ( SELECT auth.uid() AS uid)) AND ( SELECT private.sig_can(auth.uid(), 'signal.create'::text) AS sig_can)) OR ((assigned_to = ( SELECT auth.uid() AS uid)) AND ( SELECT private.sig_can(auth.uid(), 'signal.sale'::text) AS sig_can))));
COMMIT;
