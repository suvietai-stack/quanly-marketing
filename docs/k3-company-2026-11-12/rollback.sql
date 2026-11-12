-- Stage 1/2 rollback is non-destructive: no public resolver was replaced.
-- Keep nullable columns and inert private helpers; never DROP history or stored attribution.
-- Before stage 3, restore every replaced public/private function using live-functions.sql
-- under a transaction after checksum-conflict checks. Do not activate company_effective_from.
COMMENT ON COLUMN public.k3_settings.company_effective_from IS 'Pending company cutover; inert until public resolver/obligation/automation acceptance.';
