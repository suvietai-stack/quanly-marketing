ALTER TABLE public.zalo_oa_config
  ADD COLUMN IF NOT EXISTS app_id        text,
  ADD COLUMN IF NOT EXISTS app_secret    text,
  ADD COLUMN IF NOT EXISTS oa_secret_key text,
  ADD COLUMN IF NOT EXISTS base_url      text DEFAULT 'https://base.suviet.vn',
  ADD COLUMN IF NOT EXISTS test_send_at  timestamptz;

COMMENT ON COLUMN public.zalo_oa_config.app_secret IS 'Server-only: never return to frontend; expose only last 3 chars masked.';