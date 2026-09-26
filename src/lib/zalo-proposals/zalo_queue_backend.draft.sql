-- ĐỀ XUẤT — CHƯA ÁP DỤNG. Cần Admin phê duyệt.
-- 1) Không loại người tạo nếu họ có quyền phân công hợp lệ (TEST 4).
CREATE OR REPLACE FUNCTION public.signal_notify()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'private'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.assigned_to IS NULL THEN
      INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
      SELECT p.id, 'signal_new', NEW.id, 'new:' || NEW.id || ':' || p.id
      FROM public.profiles p
      WHERE p.status = 'Đang hoạt động'
        AND (private.sig_can(p.id,'signal.assign') OR private.sig_can(p.id,'signal.manage'))
      ON CONFLICT (dedup_key) DO NOTHING;
    ELSE
      INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
      VALUES (NEW.assigned_to, 'signal_assigned', NEW.id, 'assign:' || NEW.id || ':' || NEW.assigned_to || ':' || coalesce(NEW.assigned_at, now()))
      ON CONFLICT (dedup_key) DO NOTHING;
    END IF;
  ELSIF NEW.assigned_to IS NOT NULL AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
    VALUES (NEW.assigned_to, 'signal_assigned', NEW.id, 'assign:' || NEW.id || ':' || NEW.assigned_to || ':' || coalesce(NEW.assigned_at, now()))
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $function$;

-- 2) Xử lý hàng đợi tại máy chủ mỗi phút, không phụ thuộc trình duyệt (TEST 7).
--    Dùng lại care_cron_token làm khóa bảo vệ; cần thêm route /api/public/zalo/dispatch-cron.
SELECT cron.schedule('zalo-dispatch-minutely', '* * * * *', $$
  SELECT net.http_post(
    url := 'https://base.suviet.vn/api/public/zalo/dispatch-cron',
    headers := jsonb_build_object('Content-Type','application/json','x-care-token', coalesce((SELECT care_cron_token FROM public.zalo_oa_config WHERE id = 1), '')),
    body := '{}'::jsonb
  ) WHERE EXISTS (SELECT 1 FROM public.zalo_oa_config WHERE id = 1 AND auto_send AND care_cron_token IS NOT NULL
                  AND EXISTS (SELECT 1 FROM public.notifications WHERE zalo_status IN ('pending','failed') AND kind <> 'signal_care' AND zalo_attempts < 3));
$$);
