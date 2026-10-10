-- ============================================================================
-- HACKFEST 3.0 — DYNAMIC EVENT SCHEDULE & SPONSORS MANAGEMENT (AUDITED)
-- Student Developer Club, REC Banda
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTEND PUBLIC.SCHEDULES TABLE
-- Allows multi-day scheduling, categories, calendar date type, and draft/publish states
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Dynamically drop any check constraint on day_number to allow events beyond Day 2
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.schedules'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%day_number%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Add or alter event_date as a proper DATE type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE public.schedules ADD COLUMN event_date DATE DEFAULT '2026-10-24';
  ELSE
    ALTER TABLE public.schedules ALTER COLUMN event_date TYPE DATE USING (event_date::date);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS day_label TEXT DEFAULT 'DAY 01';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill default values for existing schedule rows to preserve existing published timeline
UPDATE public.schedules
SET
  event_date = COALESCE(event_date, CASE WHEN day_number = 2 THEN '2026-10-25'::date ELSE '2026-10-24'::date END),
  day_label = COALESCE(day_label, 'DAY ' || LPAD(day_number::text, 2, '0')),
  category = COALESCE(category, badge, 'General'),
  is_published = COALESCE(is_published, true),
  updated_at = COALESCE(updated_at, now())
WHERE event_date IS NULL OR day_label IS NULL OR category IS NULL OR is_published IS NULL;

CREATE INDEX IF NOT EXISTS idx_schedules_day_number ON public.schedules(day_number);
CREATE INDEX IF NOT EXISTS idx_schedules_event_date ON public.schedules(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_schedules_sort_order ON public.schedules(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_schedules_is_published ON public.schedules(is_published);

-- RLS for schedules: Public reads only published items; Admins & Super Admins have full access
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view schedules" ON public.schedules;
CREATE POLICY "Public can view schedules"
  ON public.schedules FOR SELECT
  USING (
    is_published = true 
    OR public.check_is_admin() 
    OR public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Organizers manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins manage schedules" ON public.schedules;
CREATE POLICY "Admins manage schedules"
  ON public.schedules FOR ALL
  USING (
    public.check_is_admin() 
    OR public.get_current_role() IN ('admin', 'organizer')
  )
  WITH CHECK (
    public.check_is_admin() 
    OR public.get_current_role() IN ('admin', 'organizer')
  );

-- ----------------------------------------------------------------------------
-- 2. EXTEND PUBLIC.SPONSORS TABLE
-- Supports tiers, published/draft status, display ordering, and descriptions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  tier TEXT NOT NULL DEFAULT 'gold',
  category TEXT NOT NULL DEFAULT 'partner',
  role TEXT,
  tag TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'gold';
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Meticulous data mapping for existing sponsors to avoid corrupting classifications
UPDATE public.sponsors
SET
  tier = CASE
    WHEN tier IN ('title', 'powered_by', 'gold', 'silver', 'bronze', 'community') THEN tier
    WHEN LOWER(COALESCE(role, '')) IN ('title', 'title sponsor', 'principal') THEN 'title'
    WHEN LOWER(COALESCE(role, '')) IN ('powered by', 'powered_by', 'co-sponsor') THEN 'powered_by'
    WHEN LOWER(COALESCE(role, '')) IN ('gold', 'gold sponsor') THEN 'gold'
    WHEN LOWER(COALESCE(role, '')) IN ('silver', 'silver sponsor') THEN 'silver'
    WHEN LOWER(COALESCE(role, '')) IN ('bronze', 'bronze sponsor') THEN 'bronze'
    WHEN LOWER(COALESCE(role, '')) IN ('community', 'community partner', 'ecosystem', 'partner') THEN 'community'
    WHEN LOWER(COALESCE(category, '')) IN ('title', 'title sponsor') THEN 'title'
    WHEN LOWER(COALESCE(category, '')) IN ('powered by', 'powered_by') THEN 'powered_by'
    WHEN LOWER(COALESCE(category, '')) IN ('gold', 'gold sponsor') THEN 'gold'
    WHEN LOWER(COALESCE(category, '')) IN ('silver', 'silver sponsor') THEN 'silver'
    WHEN LOWER(COALESCE(category, '')) IN ('bronze', 'bronze sponsor') THEN 'bronze'
    WHEN LOWER(COALESCE(category, '')) IN ('community', 'community partner', 'partner') THEN 'community'
    ELSE COALESCE(tier, 'gold')
  END,
  is_published = COALESCE(is_published, CASE WHEN tag = 'draft' THEN false ELSE true END),
  updated_at = COALESCE(updated_at, now())
WHERE tier IS NULL OR tier NOT IN ('title', 'powered_by', 'gold', 'silver', 'bronze', 'community') OR is_published IS NULL;

CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON public.sponsors(tier);
CREATE INDEX IF NOT EXISTS idx_sponsors_sort_order ON public.sponsors(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_sponsors_is_published ON public.sponsors(is_published);

-- RLS for sponsors: Public reads only published sponsors; Admins & Super Admins have full access
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view sponsors" ON public.sponsors;
CREATE POLICY "Public can view sponsors"
  ON public.sponsors FOR SELECT
  USING (
    is_published = true 
    OR public.check_is_admin() 
    OR public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Organizers manage sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admins manage sponsors" ON public.sponsors;
CREATE POLICY "Admins manage sponsors"
  ON public.sponsors FOR ALL
  USING (
    public.check_is_admin() 
    OR public.get_current_role() IN ('admin', 'organizer')
  )
  WITH CHECK (
    public.check_is_admin() 
    OR public.get_current_role() IN ('admin', 'organizer')
  );

-- ----------------------------------------------------------------------------
-- 3. STORAGE BUCKET FOR SPONSOR LOGOS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsors', 'sponsors', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can read logos
DROP POLICY IF EXISTS "Sponsor logos are publicly readable" ON storage.objects;
CREATE POLICY "Sponsor logos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sponsors');

-- Admins and Super Admins only can upload, update, and delete
DROP POLICY IF EXISTS "Admins can upload sponsor logos" ON storage.objects;
CREATE POLICY "Admins can upload sponsor logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sponsors' AND (
      public.check_is_admin() 
      OR public.get_current_role() IN ('admin', 'organizer')
    )
  );

DROP POLICY IF EXISTS "Admins can update sponsor logos" ON storage.objects;
CREATE POLICY "Admins can update sponsor logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'sponsors' AND (
      public.check_is_admin() 
      OR public.get_current_role() IN ('admin', 'organizer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete sponsor logos" ON storage.objects;
CREATE POLICY "Admins can delete sponsor logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sponsors' AND (
      public.check_is_admin() 
      OR public.get_current_role() IN ('admin', 'organizer')
    )
  );

-- ----------------------------------------------------------------------------
-- 4. REFRESH POSTGREST SCHEMA CACHE
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
