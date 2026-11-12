-- STAGED ONLY. Owner must separately approve exact SHA before application.
BEGIN;
DO $guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leave_requests' AND policyname='leave_requests read' AND permissive='PERMISSIVE' AND cmd='SELECT' AND roles=ARRAY['authenticated']::name[] AND md5(qual)='4dc8270f8abbec16f94a004cd9f2a5d2') THEN RAISE EXCEPTION 'Leave SELECT policy drift'; END IF;
 IF EXISTS (SELECT 1 FROM (VALUES
 ('private.org_permission_unit_member(uuid,uuid,text)','45cebe02c12f207b0654a3ae1d424bf3'),
 ('private.base_role_unit_contains(jsonb,text,text)','a70e25df7f15fcc80a4b45f2b7278a61'),
 ('private.org_role_rules(uuid,jsonb)','48f358d8d408b54c2656009cb9ef7eb4'),
 ('private.base_config()','cfed54d4b4fb2edf6b4abdd64314c035'),
 ('private.has_permission(uuid,text)','c57afd7736a787a1cd89d48962f0261e')
 ) expected(signature,hash) WHERE md5(pg_get_functiondef(to_regprocedure(signature))) IS DISTINCT FROM hash OR pg_get_userbyid((SELECT proowner FROM pg_proc WHERE oid=to_regprocedure(signature))) IS DISTINCT FROM 'postgres') THEN RAISE EXCEPTION 'Leave authorization dependency drift'; END IF;
 IF EXISTS(SELECT 1 FROM (VALUES
 ('private.org_permission_unit_member(uuid,uuid,text)','{postgres=X/postgres}'),
 ('private.base_role_unit_contains(jsonb,text,text)','{postgres=X/postgres}'),
 ('private.org_role_rules(uuid,jsonb)','{postgres=X/postgres}'),
 ('private.base_config()','{postgres=X/postgres}'),
 ('private.has_permission(uuid,text)','{postgres=X/postgres,authenticated=X/postgres}')
 ) expected(signature,acl) WHERE (SELECT proacl::text FROM pg_proc WHERE oid=to_regprocedure(signature)) IS DISTINCT FROM acl) THEN RAISE EXCEPTION 'Leave authorization ACL drift'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leave_requests' AND policyname='account_active_guard' AND permissive='RESTRICTIVE' AND cmd='ALL' AND roles=ARRAY['authenticated']::name[] AND qual='private.is_active(auth.uid())' AND with_check='private.is_active(auth.uid())') THEN RAISE EXCEPTION 'Active guard drift'; END IF;
 IF to_regprocedure('public.leave_visible_unit_owners()') IS NOT NULL THEN RAISE EXCEPTION 'New helper already exists'; END IF;
END $guard$;
CREATE FUNCTION public.leave_visible_unit_owners() RETURNS uuid[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public
AS $fn$
DECLARE actor uuid:=auth.uid(); config jsonb; rules jsonb; owners uuid[];
BEGIN
 IF actor IS NULL OR NOT private.is_active(actor) THEN RETURN '{}'::uuid[]; END IF;
 -- Keep the EXACT deployed DENY/ALLOW/fallback contract; evaluated once, not per owner.
 IF NOT private.has_permission(actor,'leave.view_unit') THEN RETURN '{}'::uuid[]; END IF;
 config:=private.base_config();
 rules:=private.org_role_rules(actor,config);
 WITH RECURSIVE roots AS MATERIALIZED (
  SELECT DISTINCT a.unit_id FROM jsonb_array_elements(rules) rule
  JOIN public.org_assignments a ON a.id=rule->>'source_id' AND a.user_id=actor
  WHERE rule->>'permission'='leave.view_unit' AND a.status='active'
    AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
 ), units AS MATERIALIZED (
  SELECT u->>'id' id,u->>'parent_id' parent_id FROM jsonb_array_elements(coalesce(config->'units','[]')) u
  WHERE coalesce((u->>'active')::boolean,false)
 ), tree AS (
  SELECT u.id,ARRAY[u.id] path FROM roots r JOIN units u ON u.id=r.unit_id
  UNION ALL
  SELECT u.id,t.path||u.id FROM tree t JOIN units u ON u.parent_id=t.id WHERE NOT(u.id=ANY(t.path))
 ) SELECT coalesce(array_agg(DISTINCT b.user_id),'{}'::uuid[]) INTO owners
 FROM public.org_assignments b JOIN (SELECT DISTINCT id FROM tree) t ON t.id=b.unit_id
 WHERE b.status='active' AND b.starts_at<=now() AND (b.ends_at IS NULL OR b.ends_at>now());
 RETURN owners;
END $fn$;
ALTER FUNCTION public.leave_visible_unit_owners() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.leave_visible_unit_owners() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.leave_visible_unit_owners() TO authenticated;
ALTER POLICY "leave_requests read" ON public.leave_requests USING (
 (owner_id=(SELECT auth.uid()) AND (SELECT private.sig_can(auth.uid(),'leave.view_own')))
 OR (created_by=(SELECT auth.uid()) AND (SELECT private.sig_can(auth.uid(),'leave.create_for')))
 OR (approver_id=(SELECT auth.uid()) AND ((SELECT private.sig_can(auth.uid(),'leave.view_assigned')) OR (SELECT private.sig_can(auth.uid(),'leave.approve'))))
 OR (SELECT private.sig_can(auth.uid(),'leave.view_all'))
 OR owner_id=ANY((SELECT public.leave_visible_unit_owners())::uuid[])
);
COMMIT;
