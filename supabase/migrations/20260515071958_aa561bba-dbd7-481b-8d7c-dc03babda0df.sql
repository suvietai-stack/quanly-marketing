-- Helper: create one business table with the same shape (JSONB-based)
-- Tables: brands, websites, socials, places, tasks, web_contents, social_posts,
--         map_posts, reviews, videos, orders, people, seo_checks, entities,
--         keywords, backlinks, growth, web_topics
-- Plus:   catalogs (plans/topics)

-- ========== Generic business tables ==========
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'brands','websites','socials','places','tasks','web_contents',
    'social_posts','map_posts','reviews','videos','orders','people',
    'seo_checks','entities','keywords','backlinks','growth','web_topics'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format($f$
      CREATE TABLE IF NOT EXISTS public.%I (
        id text PRIMARY KEY,
        data jsonb NOT NULL DEFAULT '{}'::jsonb,
        is_demo boolean NOT NULL DEFAULT false,
        created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Active users can read %I"
        ON public.%I FOR SELECT TO authenticated
        USING (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));

      CREATE POLICY "Active users can insert %I"
        ON public.%I FOR INSERT TO authenticated
        WITH CHECK (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));

      CREATE POLICY "Active users can update %I"
        ON public.%I FOR UPDATE TO authenticated
        USING (public.is_active(auth.uid()) OR public.is_admin(auth.uid()))
        WITH CHECK (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));

      CREATE POLICY "Active users can delete %I"
        ON public.%I FOR DELETE TO authenticated
        USING (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));

      CREATE TRIGGER set_updated_at_%I
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

      CREATE INDEX IF NOT EXISTS %I ON public.%I (created_at DESC);
      CREATE INDEX IF NOT EXISTS %I ON public.%I (is_demo);
    $f$,
      t, t,
      t, t,
      t, t,
      t, t,
      t, t,
      t, t,
      t || '_created_at_idx', t,
      t || '_is_demo_idx', t
    );
  END LOOP;
END$$;

-- ========== Catalogs (shared lookup lists: plans, topics) ==========
CREATE TABLE IF NOT EXISTS public.catalogs (
  scope text PRIMARY KEY,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active users can read catalogs"
  ON public.catalogs FOR SELECT TO authenticated
  USING (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Active users can upsert catalogs"
  ON public.catalogs FOR INSERT TO authenticated
  WITH CHECK (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Active users can update catalogs"
  ON public.catalogs FOR UPDATE TO authenticated
  USING (public.is_active(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));

CREATE TRIGGER set_updated_at_catalogs
  BEFORE UPDATE ON public.catalogs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed empty rows for plans and topics
INSERT INTO public.catalogs (scope, items) VALUES
  ('plans', '[]'::jsonb),
  ('topics', '[]'::jsonb)
ON CONFLICT (scope) DO NOTHING;