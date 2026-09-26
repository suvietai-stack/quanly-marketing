ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind IN ('signal_new','signal_assigned','signal_care'));
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS payload jsonb;
ALTER TABLE public.zalo_oa_config
  ADD COLUMN IF NOT EXISTS care_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS care_wait_hours integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS care_stale_days integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS care_hour integer NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS care_last_run date,
  ADD COLUMN IF NOT EXISTS care_cron_token text;