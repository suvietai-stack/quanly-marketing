-- att.settings: dedicated permission for attendance settings (previously folded into leave.settings).
-- Grant to roles that already manage leave settings so effective access stays identical.
UPDATE public.app_roles
SET permissions = (SELECT array_agg(DISTINCT x) FROM unnest(permissions || ARRAY['att.settings']) x), updated_at = now()
WHERE permissions @> ARRAY['leave.settings'];

-- Allow att.settings holders to save only the attendance section of the shared settings blob.
CREATE OR REPLACE FUNCTION public.leave_settings_save(_data jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE names text[]; cur jsonb;
BEGIN
  IF NOT private.sig_can(auth.uid(), 'leave.settings') THEN
    IF NOT private.sig_can(auth.uid(), 'att.settings') THEN RAISE EXCEPTION 'Bạn không có quyền Quản lý cài đặt đơn từ.'; END IF;
    SELECT data INTO cur FROM public.leave_settings WHERE id = 1;
    IF coalesce(cur, '{}'::jsonb) - 'attendance' IS DISTINCT FROM coalesce(_data, '{}'::jsonb) - 'attendance' THEN
      RAISE EXCEPTION 'Bạn chỉ có quyền thay đổi cài đặt giải trình chấm công.';
    END IF;
  END IF;
  IF jsonb_typeof(_data->'reasons') <> 'array' OR jsonb_typeof(_data->'schedule') <> 'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  SELECT array_agg(lower(btrim(x->>'name'))) INTO names FROM jsonb_array_elements(_data->'reasons') x;
  IF EXISTS (SELECT 1 FROM unnest(names) n WHERE coalesce(n,'') = '') THEN RAISE EXCEPTION 'Tên lý do không được để trống.'; END IF;
  IF (SELECT count(DISTINCT n) FROM unnest(names) n) <> coalesce(array_length(names,1),0) THEN RAISE EXCEPTION 'Danh mục lý do có tên trùng nhau.'; END IF;
  IF EXISTS (SELECT 1 FROM public.leave_requests q WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_data->'reasons') x WHERE x->>'id' = q.reason_id)
             UNION ALL SELECT 1 FROM public.leave_request_submissions q WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_data->'reasons') x WHERE x->>'id' = q.reason_id)) THEN
    RAISE EXCEPTION 'Không thể xóa lý do đã được dùng trong đơn — hãy chọn Ngừng sử dụng.';
  END IF;
  INSERT INTO public.leave_settings(id, data, updated_by, updated_at) VALUES (1, _data, auth.uid(), now())
  ON CONFLICT (id) DO UPDATE SET data = excluded.data, updated_by = excluded.updated_by, updated_at = now();
END $$;