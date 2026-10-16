CREATE OR REPLACE FUNCTION public.fin_gmf_can_manage()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT COALESCE(private.sig_can(auth.uid(), 'finance.incoming.manage'), false);
$$;

REVOKE ALL ON FUNCTION public.fin_gmf_can_manage() FROM public;
GRANT EXECUTE ON FUNCTION public.fin_gmf_can_manage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fin_gmf_can_manage() TO service_role;