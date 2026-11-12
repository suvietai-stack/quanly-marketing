-- Org effect signature v2 (narrow). Supersedes rejected 759e816f. Only memberships auto-projected by the SAME normalized 'assign' change get a deterministic identity; every other membership keeps its exact UUID.
DO $pre$ BEGIN
IF md5(pg_get_functiondef('private.org_effect_signature(jsonb,jsonb)'::regprocedure))<>'a5b4eead675d66f64472b7553fe48780' THEN RAISE EXCEPTION 'preflight: live org_effect_signature md5 mismatch'; END IF;
IF (SELECT pg_get_userbyid(proowner)||'|'||coalesce(proacl::text,'') FROM pg_proc WHERE oid='private.org_effect_signature(jsonb,jsonb)'::regprocedure)<>'postgres|{postgres=X/postgres}' THEN RAISE EXCEPTION 'preflight: owner/acl mismatch'; END IF;
END $pre$;
CREATE OR REPLACE FUNCTION private.org_effect_signature(c jsonb, changes_ jsonb)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
AS $function$ SELECT jsonb_build_object('position_slots',(SELECT coalesce(jsonb_agg(x ORDER BY x->>'id'),'[]') FROM (SELECT jsonb_build_object('id',s->>'id','title_id',s->>'title_id','unit_id',s->>'unit_id','role_id',s->>'role_id','name',s->>'name','active',s->>'active') x FROM jsonb_array_elements(coalesce(c->'position_slots','[]')) s) q),'units',c->'units','titles',c->'titles','assignments',(SELECT coalesce(jsonb_agg(x ORDER BY x::text),'[]') FROM (SELECT jsonb_build_object('id',CASE WHEN m->>'source' IN ('biz_department_members','biz_team_members','biz_member_affiliations')
 AND m->>'title_id' IS NULL
 AND (m->>'source',m->>'category') IN (('biz_department_members','primary'),('biz_team_members','team'),('biz_member_affiliations','concurrent'))
 AND EXISTS(SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(changes_)='array' THEN changes_ ELSE '[]' END) e WHERE e->>'action'='assign'
   AND e->'data'->>'user_id'=m->>'user_id' AND (e->'data'->>'id') IS DISTINCT FROM (m->>'id')
   AND nullif(e->'data'->>'starts_at','') IS NOT NULL AND nullif(m->>'starts_at','') IS NOT NULL AND (e->'data'->>'starts_at')::timestamptz=(m->>'starts_at')::timestamptz
   AND (m->>'unit_id'=e->'data'->>'unit_id' OR m->>'unit_id' IN (SELECT u->>'parent_id' FROM jsonb_array_elements(coalesce(c->'units','[]')) u WHERE u->>'id'=e->'data'->>'unit_id')))
 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(changes_)='array' THEN changes_ ELSE '[]' END) e WHERE (e->>'action' IS DISTINCT FROM 'assign' OR e->'data'->>'id'=m->>'id')
   AND (m->>'id' IN (e->'data'->>'id',e->'data'->>'assignment_id',e->'data'->>'source_id') OR (m->>'source_id') IN (e->'data'->>'id',e->'data'->>'assignment_id',e->'data'->>'source_id')
     OR (jsonb_typeof(e->'data'->'ids')='array' AND e->'data'->'ids' ? (m->>'id'))))
 THEN 'projected:'||(m->>'source')||'|'||(m->>'user_id')||'|'||(m->>'unit_id')||'|'||(m->>'category')||'|'||(m->>'starts_at') ELSE m->>'id' END,'slot_id',m->>'slot_id','unit_id',m->>'unit_id','title_id',m->>'title_id','user_id',m->>'user_id','category',m->>'category','starts_at',m->>'starts_at','ends_at',m->>'ends_at','status',m->>'status') x FROM jsonb_array_elements(c->'memberships')m)s),'role_links',(SELECT coalesce(jsonb_agg(x ORDER BY x::text),'[]') FROM (SELECT jsonb_build_object('title_source',l->>'title_source','title_id',l->>'title_id','role_id',l->>'role_id','is_primary',l->>'is_primary','scope_kind',l->>'scope_kind','enabled_permissions',l->>'enabled_permissions','permission_signature',l->>'permission_signature') x FROM jsonb_array_elements(coalesce(c->'role_links','[]')) l)s),'permissions',jsonb_build_object('defaults',c->'defaults','bundles',c->'bundles','grants',c->'grants','bindings',c->'bindings')) $function$;
DO $post$ BEGIN
IF (SELECT pg_get_userbyid(proowner)||'|'||coalesce(proacl::text,'') FROM pg_proc WHERE oid='private.org_effect_signature(jsonb,jsonb)'::regprocedure)<>'postgres|{postgres=X/postgres}' THEN RAISE EXCEPTION 'postflight: owner/acl changed'; END IF;
END $post$;
