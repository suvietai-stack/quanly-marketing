REVOKE ALL ON public.signal_list_priority FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.signal_list_priority TO authenticated, service_role;
COMMENT ON VIEW public.signal_list_priority IS 'SELECT-only security-invoker projection; explicit revocation also removes platform default write grants. Existing table/history RLS remain authoritative.';