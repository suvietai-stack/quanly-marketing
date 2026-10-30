CREATE OR REPLACE FUNCTION public.biz_dashboard_systems()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT CASE WHEN auth.uid() IS NOT NULL AND (public.is_super_admin(auth.uid()) OR public.biz_all_scope(auth.uid()))
  THEN coalesce((SELECT jsonb_agg(jsonb_build_object('id',s.id,'name',s.name) ORDER BY (SELECT count(*) FROM public.biz_departments d WHERE d.system_id=s.id AND d.active) DESC,s.created_at,s.name) FROM public.biz_systems s WHERE s.active),'[]') ELSE '[]'::jsonb END
$$;