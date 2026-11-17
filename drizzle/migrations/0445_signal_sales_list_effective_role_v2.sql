-- One authoritative sales directory: EXACT same effective permission resolver
-- as signal_assign(_id,_user) uses. Avoid a second copy of complex V1/V2
-- resolution that could drift or time out. Unauthorized users return no rows.
CREATE OR REPLACE FUNCTION public.signal_sales_list()
RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
  SELECT p.id,coalesce(nullif(p.full_name,''),p.username)
  FROM public.profiles p
  WHERE p.status='Đang hoạt động'
    AND (
      private.sig_can(auth.uid(),'signal.assign')
      OR private.sig_can(auth.uid(),'signal.reassign')
      OR private.sig_can(auth.uid(),'signal.manage')
    )
    AND private.sig_can(p.id,'signal.sale')
  ORDER BY 2,1;
$function$;

-- Do not make the protected RPC public to anonymous clients.
REVOKE EXECUTE ON FUNCTION public.signal_sales_list() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_sales_list() TO authenticated,service_role;
