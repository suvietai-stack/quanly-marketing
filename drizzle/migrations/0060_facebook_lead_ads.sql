CREATE TABLE public.fbl_pages (
  page_id text PRIMARY KEY,
  name text NOT NULL,
  source text,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected','error','disconnected')),
  status_detail text,
  subscribed boolean NOT NULL DEFAULT false,
  connected_by uuid,
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.fbl_page_tokens (
  page_id text PRIMARY KEY REFERENCES public.fbl_pages(page_id) ON DELETE CASCADE,
  token_enc text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.fbl_forms (
  form_id text PRIMARY KEY,
  page_id text NOT NULL REFERENCES public.fbl_pages(page_id),
  name text NOT NULL,
  meta_status text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  mapping jsonb,
  enabled boolean NOT NULL DEFAULT false,
  enabled_at timestamptz,
  needs_review boolean NOT NULL DEFAULT false,
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fbl_forms_page_idx ON public.fbl_forms(page_id);
CREATE TABLE public.fbl_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leadgen_id text NOT NULL UNIQUE,
  page_id text NOT NULL,
  form_id text,
  ad_id text,
  campaign_id text,
  lead_created_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','skipped','duplicate','needs_action')),
  error text,
  attempts int NOT NULL DEFAULT 0,
  signal_id uuid,
  source text,
  processed_at timestamptz
);
CREATE INDEX fbl_events_received_idx ON public.fbl_events(received_at DESC);
CREATE TABLE public.fbl_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  webhook_verified_at timestamptz,
  last_event_at timestamptz,
  app_subscribed_at timestamptz
);
INSERT INTO public.fbl_state(id) VALUES (1);
CREATE TABLE public.fbl_oauth_sessions (
  state text PRIMARY KEY,
  user_id uuid NOT NULL,
  pages_enc text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.fbl_pages, public.fbl_page_tokens, public.fbl_forms, public.fbl_events, public.fbl_state, public.fbl_oauth_sessions TO service_role;
ALTER TABLE public.fbl_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbl_page_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbl_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbl_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbl_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fbl_oauth_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.fbl_can_manage()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private
AS $$ SELECT COALESCE(private.sig_can(auth.uid(), 'integration.facebook_leads'), false); $$;
REVOKE ALL ON FUNCTION public.fbl_can_manage() FROM public;
GRANT EXECUTE ON FUNCTION public.fbl_can_manage() TO authenticated, service_role;