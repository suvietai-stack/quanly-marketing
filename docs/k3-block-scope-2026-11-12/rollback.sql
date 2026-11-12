-- Staged rollback only. No live application; additive columns/history remain.
-- This extension does not replace existing functions, permissions, Role rows or business data.
-- Full activation MUST supply exact original definitions for every writer/automation function changed.
REVOKE EXECUTE ON FUNCTION public.k3_application_scope_read(),public.k3_application_scope_preview(jsonb),public.k3_application_scope_save(jsonb) FROM authenticated;
-- Revert frontend section together with this deactivation; do not drop historical versions.