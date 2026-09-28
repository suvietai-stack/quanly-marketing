CREATE OR REPLACE FUNCTION public.content_notify_save(_data jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.is_admin(auth.uid()) OR public.has_permission(auth.uid(), 'settings.system_edit')) THEN
    RAISE EXCEPTION 'Bạn không có quyền thay đổi cài đặt thông báo';
  END IF;
  IF jsonb_typeof(_data->'zalo') <> 'object' OR jsonb_typeof(_data->'remind') <> 'object' THEN RAISE EXCEPTION 'Dữ liệu không hợp lệ'; END IF;
  UPDATE public.content_notify_settings SET data = _data, updated_by = auth.uid(), updated_at = now() WHERE id = 1;
END $$;