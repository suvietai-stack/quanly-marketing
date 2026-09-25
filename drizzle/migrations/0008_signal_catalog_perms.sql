ALTER TABLE public.opportunity_signals ADD COLUMN IF NOT EXISTS need_groups text[] NOT NULL DEFAULT '{}';
UPDATE public.opportunity_signals SET need_groups = ARRAY[need_group] WHERE need_group IS NOT NULL AND need_group <> '' AND need_groups = '{}';
COMMENT ON COLUMN public.opportunity_signals.need_group IS 'DEPRECATED: replaced by need_groups (kept = first item for compatibility)';

CREATE OR REPLACE FUNCTION public.can_edit_signal_catalog(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT private.is_super_admin(_uid) OR private.has_permission(_uid,'signal.catalog') OR private.has_permission(_uid,'signal.manage');
$$;

DROP POLICY IF EXISTS "Active users can update catalogs" ON public.catalogs;
DROP POLICY IF EXISTS "Active users can upsert catalogs" ON public.catalogs;
CREATE POLICY "Active users can update catalogs" ON public.catalogs FOR UPDATE TO authenticated
  USING ((private.is_active(auth.uid()) OR private.is_admin(auth.uid())) AND (scope NOT LIKE 'signal\_%' OR public.can_edit_signal_catalog(auth.uid())))
  WITH CHECK ((private.is_active(auth.uid()) OR private.is_admin(auth.uid())) AND (scope NOT LIKE 'signal\_%' OR public.can_edit_signal_catalog(auth.uid())));
CREATE POLICY "Active users can upsert catalogs" ON public.catalogs FOR INSERT TO authenticated
  WITH CHECK ((private.is_active(auth.uid()) OR private.is_admin(auth.uid())) AND (scope NOT LIKE 'signal\_%' OR public.can_edit_signal_catalog(auth.uid())));

CREATE OR REPLACE FUNCTION public.signal_catalog_rename(_scope text, _old text, _new text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_edit_signal_catalog(auth.uid()) THEN RAISE EXCEPTION 'Không có quyền quản lý danh mục'; END IF;
  IF _scope NOT IN ('signal_products','signal_need_groups') THEN RAISE EXCEPTION 'Danh mục không hợp lệ'; END IF;
  _new := btrim(regexp_replace(_new, '\s+', ' ', 'g'));
  IF _new = '' THEN RAISE EXCEPTION 'Tên trống'; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  IF _scope = 'signal_products' THEN
    UPDATE public.opportunity_signals SET products = array_replace(products, _old, _new) WHERE _old = ANY(products);
  ELSE
    UPDATE public.opportunity_signals SET need_groups = array_replace(need_groups, _old, _new),
      need_group = CASE WHEN need_group = _old THEN _new ELSE need_group END
      WHERE _old = ANY(need_groups) OR need_group = _old;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.signal_catalog_rename(text,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.signal_catalog_rename(text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_signal_catalog(uuid) TO authenticated;