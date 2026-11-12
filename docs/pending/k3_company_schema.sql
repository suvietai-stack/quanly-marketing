-- STAGE 1 PENDING ONLY. No permissions, discipline activation or historical remapping.
ALTER TABLE public.k3_goals ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_days ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_period_summaries ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_daily_closes ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_settings ADD COLUMN IF NOT EXISTS company_effective_from date;
COMMENT ON COLUMN public.k3_settings.company_effective_from IS 'Explicit prospective company cutover date. NULL disables company obligations; original effective_from remains historical.';
COMMENT ON COLUMN public.k3_goals.org_unit_id IS 'Frozen organization attribution; NULL retains legacy department_id. No guessed historical backfill.';
CREATE INDEX IF NOT EXISTS k3_goals_org_unit_idx ON public.k3_goals(org_unit_id);
CREATE INDEX IF NOT EXISTS k3_days_org_unit_date_idx ON public.k3_days(org_unit_id,work_date);
-- Existing RLS/GRANTs retained. No seed, UPDATE of Roles or obligation activation.
