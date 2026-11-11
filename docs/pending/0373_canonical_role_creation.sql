-- PENDING ONLY. No INSERT/UPDATE of old Roles, assignments, title links or specialties.
-- Requires fresh pg_get_functiondef snapshot/MD5 review before an approved application.
-- Adds explicit canonical IDs to the existing audited Role preview/apply, not a new writer.
DO $patch$
DECLARE d text; needle text;
BEGIN
 SELECT pg_get_functiondef('public.role_catalog_change(text,text,text,jsonb,uuid,text,text)'::regprocedure) INTO d;
 needle := $old$id_:=CASE WHEN _action='create' THEN 'role-custom-'||gen_random_uuid()::text ELSE _role_id END;$old$;
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Canonical create contract changed; refresh backup and stop'; END IF;
 d:=replace(d,needle,$new$
 IF _action='create' AND nullif(_proposed->>'canonical_id','') IS NOT NULL THEN
  IF _proposed->>'canonical_id' NOT IN (
   'role-canonical-v1-executive','role-canonical-v1-deputy-executive',
   'role-canonical-v1-sales-director','role-canonical-v1-sales-head','role-canonical-v1-sales-team','role-canonical-v1-sales-staff',
   'role-canonical-v1-showroom','role-canonical-v1-distribution',
   'role-canonical-v1-mkt-director','role-canonical-v1-mkt-head','role-canonical-v1-mkt-team','role-canonical-v1-mkt-staff',
   'role-canonical-v1-design-head','role-canonical-v1-design-team','role-canonical-v1-design-staff',
   'role-canonical-v1-account-chief','role-canonical-v1-account-stock','role-canonical-v1-buyer','role-canonical-v1-proc-head','role-canonical-v1-hr',
   'role-canonical-v1-task-content','role-canonical-v1-task-seo','role-canonical-v1-task-local','role-canonical-v1-task-social','role-canonical-v1-task-video')
   OR (_proposed->>'role_kind') IS DISTINCT FROM (CASE WHEN _proposed->>'canonical_id' IN
    ('role-canonical-v1-task-content','role-canonical-v1-task-seo','role-canonical-v1-task-local','role-canonical-v1-task-social','role-canonical-v1-task-video') THEN 'marketing_task' ELSE 'position' END)
  THEN RAISE EXCEPTION 'Canonical ID/kind not audited'; END IF;
  id_:=_proposed->>'canonical_id';
  IF EXISTS(SELECT 1 FROM app_roles WHERE id=id_ OR role_code=id_) THEN RAISE EXCEPTION 'Canonical Role already exists; edit it, do not seed again'; END IF;
 ELSE
  id_:=CASE WHEN _action='create' THEN 'role-custom-'||gen_random_uuid()::text ELSE _role_id END;
 END IF;
 $new$);
 EXECUTE d;
END $patch$;