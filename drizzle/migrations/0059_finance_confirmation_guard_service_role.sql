-- A service_role INSERT plans the UPDATE-only permission expression too.
-- Execute the existing trigger with its owner's schema privileges; retain every auth.uid() check.
ALTER FUNCTION private.fin_confirmation_guard() SECURITY DEFINER;
ALTER FUNCTION private.fin_confirmation_guard() SET search_path TO pg_catalog, public;
COMMENT ON FUNCTION private.fin_confirmation_guard() IS 'Trigger-only financial confirmation guard. SECURITY DEFINER permits private helper resolution for service_role Casso INSERTs; existing auth.uid() permission and historical read-only checks remain unchanged.';