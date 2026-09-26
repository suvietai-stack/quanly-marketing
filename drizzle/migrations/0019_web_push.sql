CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  device text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);
GRANT SELECT ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subs read" ON public.push_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.push_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending','sent','failed','expired')),
  attempts integer NOT NULL DEFAULT 0,
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, subscription_id)
);
GRANT ALL ON public.push_deliveries TO service_role;
ALTER TABLE public.push_deliveries ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS push_status text NOT NULL DEFAULT 'pending';

CREATE TABLE public.push_config (id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24),'hex'));
GRANT ALL ON public.push_config TO service_role;
ALTER TABLE public.push_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.push_config (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.push_subscribe(_endpoint text, _p256dh text, _auth text, _device text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản chưa hoạt động'; END IF;
  IF _endpoint !~ '^https://' OR length(_endpoint) > 1000 OR length(_p256dh) > 200 OR length(_auth) > 100 THEN RAISE EXCEPTION 'Đăng ký không hợp lệ'; END IF;
  INSERT INTO public.push_subscriptions (user_id, endpoint, p256dh, auth, device, status)
  VALUES (auth.uid(), _endpoint, _p256dh, _auth, left(_device, 200), 'active')
  ON CONFLICT (endpoint) DO UPDATE SET user_id = auth.uid(), p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth,
    device = EXCLUDED.device, status = 'active', created_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.push_unsubscribe(_endpoint text, _id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.push_subscriptions SET status = 'revoked'
  WHERE user_id = auth.uid() AND ((_endpoint IS NOT NULL AND endpoint = _endpoint) OR (_id IS NOT NULL AND id = _id));
END $$;
REVOKE ALL ON FUNCTION public.push_subscribe(text,text,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.push_unsubscribe(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.push_subscribe(text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.push_unsubscribe(text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.push_wake()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('signal_new','signal_assigned','leave_pending','leave_result','leave_cancel_request','leave_cc','att_witness','att_new') THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.push_subscriptions WHERE user_id = NEW.recipient_id AND status = 'active') THEN RETURN NEW; END IF;
  SELECT token INTO _tok FROM public.push_config WHERE id = 1;
  BEGIN
    PERFORM net.http_post(url := 'https://base.suviet.vn/api/public/push/dispatch',
      headers := jsonb_build_object('Content-Type','application/json','x-push-token', _tok), body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END $$;
CREATE TRIGGER push_wake AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.push_wake();