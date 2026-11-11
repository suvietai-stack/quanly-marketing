-- Rollback for migration role_v2_position_roles_model (additive objects only; slots/assignments untouched).
DROP TRIGGER IF EXISTS org_manager_capacity_guard ON public.org_assignments;
DROP FUNCTION IF EXISTS private.org_manager_capacity_guard();
DROP FUNCTION IF EXISTS private.position_can(uuid,text,text);
DROP FUNCTION IF EXISTS private.position_role_sources(uuid,timestamptz);
DROP FUNCTION IF EXISTS private.org_unit_subtree(text);
DROP TABLE IF EXISTS public.org_position_roles;

-- Rollback 0380: restore slot-only resolver.
CREATE OR REPLACE FUNCTION private.org_slot_rules(u uuid, c jsonb)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$ SELECT coalesce(jsonb_agg(jsonb_build_object('id',(m->>'id')||':'||r.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','appointment_role','source_id',m->>'id','source_name',r.name,'role_id',r.id,'unit_id',m->>'unit_id','slot_id',s->>'id','starts_at',m->>'starts_at','ends_at',m->>'ends_at','legacy',false)),'[]'::jsonb) FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'position_slots','[]')) s ON s->>'id'=m->>'slot_id' AND s->>'title_id'=m->>'title_id' AND s->>'unit_id'=m->>'unit_id' JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id' JOIN app_roles r ON r.id=s->>'role_id' AND r.role_kind='position' AND r.catalog_state='standard' AND NOT r.is_system CROSS JOIN LATERAL unnest(r.permissions) p WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((s->>'active')::boolean,false) AND coalesce((t->>'active')::boolean,false) AND private.org_role_permission_ready(p) $function$;

-- Rollback 0381: remove position_role command (re-run pg_get_functiondef snapshot in docs/position-model-2026-11-11/org_commands_v2.before.sql) and drop public.org_position_role_events.
