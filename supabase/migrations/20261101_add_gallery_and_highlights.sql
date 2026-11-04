-- ============================================================================
-- HACKFEST 3.0 — GALLERY, ANNOUNCEMENT PINNING, AND COMPETITION HIGHLIGHTS
-- ============================================================================

-- 1. ADD PINNED SUPPORT TO ANNOUNCEMENTS
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 2. PHOTO GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT,
  category TEXT NOT NULL DEFAULT 'event',
  image_url TEXT NOT NULL,
  storage_path TEXT,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view gallery photos" ON public.gallery_photos;
CREATE POLICY "Public can view gallery photos"
  ON public.gallery_photos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers manage gallery photos" ON public.gallery_photos;
CREATE POLICY "Organizers manage gallery photos"
  ON public.gallery_photos FOR ALL
  USING (
    public.get_current_role() IN ('admin', 'organizer')
    OR public.check_is_admin()
  );

-- 3. COMPETITION HIGHLIGHTS TABLE (Codeathon & Ideathon)
CREATE TABLE IF NOT EXISTS public.competition_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id TEXT NOT NULL CHECK (competition_id IN ('codeathon', 'ideathon', 'hackathon')),
  title TEXT NOT NULL,
  team_name TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  storage_path TEXT,
  result_badge TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.competition_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view competition highlights" ON public.competition_highlights;
CREATE POLICY "Public can view competition highlights"
  ON public.competition_highlights FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers manage competition highlights" ON public.competition_highlights;
CREATE POLICY "Organizers manage competition highlights"
  ON public.competition_highlights FOR ALL
  USING (
    public.get_current_role() IN ('admin', 'organizer')
    OR public.check_is_admin()
  );

