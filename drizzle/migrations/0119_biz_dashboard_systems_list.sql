CREATE OR REPLACE FUNCTION public.biz_dashboard_systems()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT CASE WHEN auth.uid() IS NOT NULL AND (public.is_super_admin(auth.uid()) OR public.biz_all_scope(auth.uid()))
  THEN coalesce((SELECT jsonb_agg(jsonb_build_object('id',s.id,'name',s.name) ORDER BY s.created_at,s.name) FROM public.biz_systems s WHERE s.active),'[]') ELSE '[]'::jsonb END
$$;
REVOKE ALL ON FUNCTION public.biz_dashboard_systems() FROM public,anon;
GRANT EXECUTE ON FUNCTION public.biz_dashboard_systems() TO authenticated;