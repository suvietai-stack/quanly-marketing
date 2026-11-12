-- Roll back the client commit before removing the new endpoint.
BEGIN;
DROP FUNCTION public.signal_delete(uuid);
COMMIT;
