CREATE OR REPLACE FUNCTION public.leave_zalo_wake()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('leave_pending','leave_result','leave_cancel_request') THEN RETURN NEW; END IF;
  SELECT care_cron_token INTO _tok FROM public.zalo_oa_config WHERE id = 1 AND auto_send AND status = 'connected';
  IF _tok IS NULL THEN RETURN NEW; END IF;
  BEGIN
    PERFORM net.http_post(
      url := 'https://base.suviet.vn/api/public/zalo/dispatch-cron',
      headers := jsonb_build_object('Content-Type','application/json','x-care-token', _tok),
      body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.leave_zalo_wake() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_leave_zalo_wake ON public.notifications;
CREATE TRIGGER trg_leave_zalo_wake AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.leave_zalo_wake();