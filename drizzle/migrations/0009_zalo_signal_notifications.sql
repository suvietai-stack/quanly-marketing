CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('signal_new','signal_assigned')),
  signal_id uuid REFERENCES public.opportunity_signals(id) ON DELETE CASCADE,
  dedup_key text NOT NULL UNIQUE,
  read_at timestamptz,
  zalo_status text NOT NULL DEFAULT 'pending' CHECK (zalo_status IN ('pending','sent','failed','ineligible')),
  zalo_attempts int NOT NULL DEFAULT 0,
  zalo_sent_at timestamptz,
  zalo_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_recipient_idx ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX notifications_pending_idx ON public.notifications(zalo_status) WHERE zalo_status IN ('pending','failed');
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_select_own ON public.notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY notif_update_own ON public.notifications FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;

CREATE TABLE public.zalo_links (
  user_id uuid PRIMARY KEY,
  zalo_user_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','invalid')),
  linked_at timestamptz NOT NULL DEFAULT now(),
  last_interaction_at timestamptz
);
GRANT SELECT, DELETE ON public.zalo_links TO authenticated;
GRANT ALL ON public.zalo_links TO service_role;
ALTER TABLE public.zalo_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY zl_select_own ON public.zalo_links FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY zl_delete_own ON public.zalo_links FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.zalo_link_codes (
  code text PRIMARY KEY,
  user_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.zalo_link_codes TO service_role;
ALTER TABLE public.zalo_link_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.zalo_oa_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  oa_id text, oa_name text,
  access_token text, refresh_token text, token_expires_at timestamptz,
  status text NOT NULL DEFAULT 'disconnected',
  auto_send boolean NOT NULL DEFAULT false,
  oauth_state text, oauth_verifier text,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.zalo_oa_config TO service_role;
ALTER TABLE public.zalo_oa_config ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.signal_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
    SELECT p.id, 'signal_new', NEW.id, 'new:' || NEW.id || ':' || p.id
    FROM public.profiles p
    WHERE p.status = 'Đang hoạt động' AND p.id IS DISTINCT FROM NEW.created_by
      AND (private.sig_can(p.id,'signal.assign') OR private.sig_can(p.id,'signal.manage'))
    ON CONFLICT (dedup_key) DO NOTHING;
    IF NEW.assigned_to IS NOT NULL THEN
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
END $$;
REVOKE EXECUTE ON FUNCTION public.signal_notify() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER signal_notify_trg AFTER INSERT OR UPDATE OF assigned_to ON public.opportunity_signals
FOR EACH ROW EXECUTE FUNCTION public.signal_notify();