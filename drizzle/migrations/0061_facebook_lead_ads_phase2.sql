ALTER TABLE public.fbl_events ADD COLUMN IF NOT EXISTS backfill boolean NOT NULL DEFAULT false;
ALTER TABLE public.fbl_events ADD COLUMN IF NOT EXISTS next_retry_at timestamptz;
ALTER TABLE public.fbl_state ADD COLUMN IF NOT EXISTS last_maintain_at timestamptz;
CREATE INDEX IF NOT EXISTS fbl_events_retry_idx ON public.fbl_events (next_retry_at) WHERE status = 'failed';