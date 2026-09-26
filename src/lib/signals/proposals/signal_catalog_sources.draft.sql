-- CHỜ DUYỆT: danh mục Nguồn tín hiệu + kiểm tra dữ liệu lịch sử trước khi xóa.
-- Chỉ thay/thêm hàm, không đổi bảng hay dữ liệu.

CREATE OR REPLACE FUNCTION public.signal_catalog_rename(_scope text, _old text, _new text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.can_edit_signal_catalog(auth.uid()) THEN RAISE EXCEPTION 'Không có quyền quản lý danh mục'; END IF;
  IF _scope NOT IN ('signal_sources','signal_products','signal_need_groups') THEN RAISE EXCEPTION 'Danh mục không hợp lệ'; END IF;
  _new := btrim(regexp_replace(_new, '\s+', ' ', 'g'));
  IF _new = '' THEN RAISE EXCEPTION 'Tên trống'; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  IF _scope = 'signal_sources' THEN
    UPDATE public.opportunity_signals SET source = _new WHERE source = _old;
  ELSIF _scope = 'signal_products' THEN
    UPDATE public.opportunity_signals SET products = array_replace(products, _old, _new) WHERE _old = ANY(products);
  ELSE
    UPDATE public.opportunity_signals SET need_groups = array_replace(need_groups, _old, _new),
      need_group = CASE WHEN need_group = _old THEN _new ELSE need_group END
      WHERE _old = ANY(need_groups) OR need_group = _old;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.signal_catalog_usage(_scope text, _name text)
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.can_edit_signal_catalog(auth.uid()) THEN RAISE EXCEPTION 'Không có quyền quản lý danh mục'; END IF;
  RETURN (SELECT count(*) FROM public.opportunity_signals s WHERE
    CASE _scope
      WHEN 'signal_sources' THEN s.source = _name
      WHEN 'signal_products' THEN _name = ANY(s.products)
      WHEN 'signal_need_groups' THEN _name = ANY(s.need_groups) OR s.need_group = _name
      ELSE false END);
END $$;
REVOKE ALL ON FUNCTION public.signal_catalog_usage(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.signal_catalog_usage(text, text) TO authenticated;
