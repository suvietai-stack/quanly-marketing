-- Rollback for migration role_v2_position_roles_model (additive objects only; slots/assignments untouched).
DROP TRIGGER IF EXISTS org_manager_capacity_guard ON public.org_assignments;
DROP FUNCTION IF EXISTS private.org_manager_capacity_guard();
DROP FUNCTION IF EXISTS private.position_can(uuid,text,text);
DROP FUNCTION IF EXISTS private.position_role_sources(uuid,timestamptz);
DROP FUNCTION IF EXISTS private.org_unit_subtree(text);
DROP TABLE IF EXISTS public.org_position_roles;
