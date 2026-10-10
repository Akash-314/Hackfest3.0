-- ============================================================================
-- HACKFEST 3.0 — CMS & EVENT SETTINGS SCHEMA SYNC + ROLE ENFORCEMENT
-- Student Developer Club, REC Banda
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SAFELY ADD MISSING COLUMNS TO EVENT_SETTINGS
-- ----------------------------------------------------------------------------
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS event_date TEXT DEFAULT 'OCTOBER 24-25, 2026';
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS registration_open BOOLEAN NOT NULL DEFAULT true;

-- Ensure the existing settings record is populated with canonical defaults
UPDATE public.event_settings
SET
  event_date = COALESCE(event_date, 'OCTOBER 24-25, 2026'),
  registration_open = CASE WHEN registration_status = 'CLOSED' THEN false ELSE true END
WHERE id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. HARDEN get_current_role() SECURITY FUNCTION
-- Ensures users with super_admin or app_admins privileges match existing
-- RLS policies that check get_current_role() IN ('admin', 'organizer')
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
  SELECT CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role IN ('admin', 'super_admin') OR is_super_admin = true)
    ) THEN 'admin'
    WHEN EXISTS (
      SELECT 1 FROM public.app_admins 
      WHERE user_id = auth.uid()
    ) THEN 'admin'
    ELSE (SELECT COALESCE(role, 'participant') FROM public.profiles WHERE id = auth.uid())
  END;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. ENSURE ADMIN & SUPER ADMIN RLS POLICIES ACROSS ALL CMS TABLES
-- ----------------------------------------------------------------------------

-- EVENT SETTINGS
DROP POLICY IF EXISTS "Public can view event settings" ON public.event_settings;
CREATE POLICY "Public can view event settings"
  ON public.event_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers manage event settings" ON public.event_settings;
CREATE POLICY "Organizers manage event settings"
  ON public.event_settings FOR ALL
  USING (public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

-- SCHEDULES
DROP POLICY IF EXISTS "Public can view schedules" ON public.schedules;
CREATE POLICY "Public can view schedules"
  ON public.schedules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers manage schedules" ON public.schedules;
CREATE POLICY "Organizers manage schedules"
  ON public.schedules FOR ALL
  USING (public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
CREATE POLICY "Public can view announcements"
  ON public.announcements FOR SELECT
  USING (published = true OR public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Organizers manage announcements" ON public.announcements;
CREATE POLICY "Organizers manage announcements"
  ON public.announcements FOR ALL
  USING (public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

-- FAQS
DROP POLICY IF EXISTS "Public can view faqs" ON public.faqs;
CREATE POLICY "Public can view faqs"
  ON public.faqs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers manage faqs" ON public.faqs;
CREATE POLICY "Organizers manage faqs"
  ON public.faqs FOR ALL
  USING (public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

-- COMPETITIONS
DROP POLICY IF EXISTS "Public can view competitions" ON public.competitions;
CREATE POLICY "Public can view competitions"
  ON public.competitions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers manage competitions" ON public.competitions;
CREATE POLICY "Organizers manage competitions"
  ON public.competitions FOR ALL
  USING (public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

-- ----------------------------------------------------------------------------
-- 4. SEED INITIAL SCHEDULES IF TABLE IS EMPTY
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.schedules LIMIT 1) THEN
    INSERT INTO public.schedules (day_number, title, description, start_time, end_time, location, badge, is_highlight, sort_order)
    VALUES
      (1, 'OPERATIVE CHECK-IN & REGISTRATION', 'Verification of collegiate credentials, ID badges issued, workspace allocation.', '08:00 AM', '09:30 AM', 'Multipurpose Hall, REC Banda', 'CHECK-IN', false, 1),
      (1, 'OPENING CEREMONY & KEYNOTE ADDRESS', 'Welcome address by Director, REC Banda and Convener, Student Developer Club.', '09:30 AM', '10:45 AM', 'Auditorium, REC Banda', 'KEYNOTE', true, 2),
      (1, 'MISSION BRIEFING & PROBLEM UNVEILING', 'Official challenge track disclosure, submission guidelines, mentoring schedule released.', '11:00 AM', '12:00 PM', 'Multipurpose Hall, REC Banda', 'STAGE', false, 3),
      (1, 'HACKATHON COMMENCES // 48-HOUR TIMER ACTIVATED', 'Hacking begins across all arenas. Servers online, sandbox environments open.', '12:00 PM', '12:00 PM', 'Main Arena', 'HACKATHON', true, 4),
      (1, 'CODEATHON SPEED ROUND 01', 'High-speed algorithmic arena sprint. Competitive coding round opens.', '02:30 PM', '04:00 PM', 'Computing Lab 01', 'CODEATHON', true, 5),
      (1, 'MENTOR CHECKPOINT 01', 'First architectural and technical validation with industry mentors.', '05:00 PM', '07:30 PM', 'Mentorship Booths', 'MENTORING', false, 6),
      (2, 'MID-WAY PROGRESS REVIEW', 'Sprint progress checkpoint and team status verification.', '09:00 AM', '11:00 AM', 'Main Arena', 'CHECKPOINT', false, 1),
      (2, 'IDEATHON PITCH SESSIONS', 'Semi-final problem solution presentations before the judging jury.', '11:30 AM', '01:30 PM', 'Seminar Hall', 'PITCH', true, 2),
      (2, 'CODE FREEZE & SUBMISSIONS CLOSE', 'All GitHub repos and deployment links locked. Final evaluation commences.', '03:00 PM', '03:00 PM', 'Portal', 'SUBMISSION', true, 3),
      (2, 'GRAND VALEDICTORY & WINNERS REVEAL', 'Final score tabulation, jury feedback, cash prize distribution, and concluding honors.', '04:30 PM', '06:00 PM', 'Auditorium, REC Banda', 'CHAMPIONS', true, 4);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. NOTIFY POSTGREST TO RELOAD SCHEMA CACHE IMMEDIATELY
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
