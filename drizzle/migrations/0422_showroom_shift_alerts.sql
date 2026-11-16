-- Isolated in-app shift alerts: no changes to global notifications table.
BEGIN;
SET LOCAL lock_timeout='4s';
CREATE TABLE IF NOT EXISTS public.showroom_shift_alerts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 recipient_id uuid NOT NULL,
 store_id text NOT NULL,
 week_start date NOT NULL,
 kind text NOT NULL CHECK(kind IN('shift_open','shift_deadline','shift_published','shift_peer','shift_manager','shift_result')),
 dedup_key text NOT NULL UNIQUE,
 message text NOT NULL CHECK(length(message) BETWEEN 2 AND 300),
 read_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS showroom_shift_alerts_person_idx
 ON public.showroom_shift_alerts(recipient_id,created_at DESC);
ALTER TABLE public.showroom_shift_alerts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.showroom_shift_alerts FROM PUBLIC,anon,authenticated;
GRANT SELECT,UPDATE(read_at) ON public.showroom_shift_alerts TO authenticated;
DROP POLICY IF EXISTS showroom_shift_alert_self_read ON public.showroom_shift_alerts;
CREATE POLICY showroom_shift_alert_self_read ON public.showroom_shift_alerts
 FOR SELECT TO authenticated USING(recipient_id=auth.uid());
DROP POLICY IF EXISTS showroom_shift_alert_self_mark ON public.showroom_shift_alerts;
CREATE POLICY showroom_shift_alert_self_mark ON public.showroom_shift_alerts
 FOR UPDATE TO authenticated USING(recipient_id=auth.uid()) WITH CHECK(recipient_id=auth.uid());
COMMIT;