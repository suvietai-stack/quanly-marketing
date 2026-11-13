-- Reassignment-only users must be able to choose an eligible Sale.
-- Check actor authority once and retain the authoritative per-recipient signal.sale
-- check; the separate signal_assign RPC still enforces assign vs reassign.
CREATE OR REPLACE FUNCTION public.signal_sales_list()
RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH actor_gate AS MATERIALIZED (
    SELECT private.sig_can(auth.uid(),'signal.assign')
      OR private.sig_can(auth.uid(),'signal.reassign')
      OR private.sig_can(auth.uid(),'signal.manage') AS allowed
  )
  SELECT p.id,p.full_name
  FROM public.profiles p
  CROSS JOIN actor_gate a
  WHERE a.allowed AND private.sig_can(p.id,'signal.sale')
  ORDER BY p.full_name;
$function$;
