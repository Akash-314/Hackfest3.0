-- ============================================================================
-- HACKFEST 3.0 — CONSOLIDATED TEAM REGISTRATION, MEMBER ROSTERS & ADMIN CRUD
-- Student Developer Club, REC Banda
-- Enables:
-- 1. Leader-driven consolidated team registration with member roster fields
-- 2. Registration document attachments (PPTX/PDF/PPT) & metadata
-- 3. Nullable user_id in team_members with full participant details
-- 4. Complete administrative CRUD capabilities & storage policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTEND PUBLIC.TEAM_MEMBERS TABLE
-- Allows storing full details for team members entered by the leader
-- ----------------------------------------------------------------------------
ALTER TABLE public.team_members ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS college TEXT DEFAULT 'Rajkiya Engineering College Banda';
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS year TEXT;

CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_team_email ON public.team_members(team_id, lower(email)) WHERE email IS NOT NULL AND email != '';

-- ----------------------------------------------------------------------------
-- 2. EXTEND PUBLIC.REGISTRATIONS TABLE
-- Adds document upload metadata to registrations
-- ----------------------------------------------------------------------------
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS document_size INT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS document_path TEXT;

-- ----------------------------------------------------------------------------
-- 3. EXTEND PUBLIC.TEAMS TABLE
-- Adds institution and description fields to teams
-- ----------------------------------------------------------------------------
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS college TEXT DEFAULT 'Rajkiya Engineering College Banda';
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;

-- ----------------------------------------------------------------------------
-- 4. UPDATE TRIGGER: ENFORCE SINGLE TEAM MEMBERSHIP BY USER_ID & EMAIL
-- Prevents a user or email from being in multiple teams for the same competition
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_single_team_membership()
RETURNS TRIGGER AS $$
DECLARE
  v_comp_id UUID;
  v_existing_team_name TEXT;
BEGIN
  -- Determine competition of target team
  SELECT competition_id INTO v_comp_id 
  FROM public.teams 
  WHERE id = NEW.team_id;

  IF v_comp_id IS NOT NULL THEN
    -- Check by user_id if present
    IF NEW.user_id IS NOT NULL THEN
      SELECT t.name INTO v_existing_team_name
      FROM public.team_members tm
      JOIN public.teams t ON tm.team_id = t.id
      WHERE t.competition_id = v_comp_id
        AND tm.user_id = NEW.user_id
        AND tm.team_id != NEW.team_id
      LIMIT 1;

      IF v_existing_team_name IS NOT NULL THEN
        RAISE EXCEPTION 'Participant is already a member of team "%" in this competition. One participant / email can only join one team per event.', v_existing_team_name;
      END IF;
    END IF;

    -- Check by email if present
    IF NEW.email IS NOT NULL AND trim(NEW.email) != '' THEN
      SELECT t.name INTO v_existing_team_name
      FROM public.team_members tm
      JOIN public.teams t ON tm.team_id = t.id
      WHERE t.competition_id = v_comp_id
        AND lower(trim(tm.email)) = lower(trim(NEW.email))
        AND tm.team_id != NEW.team_id
      LIMIT 1;

      IF v_existing_team_name IS NOT NULL THEN
        RAISE EXCEPTION 'Participant with email "%" is already a member of team "%" in this competition. One participant / email can only join one team per event.', NEW.email, v_existing_team_name;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_single_team_membership ON public.team_members;
CREATE TRIGGER trg_enforce_single_team_membership
  BEFORE INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_team_membership();

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY POLICIES FOR TEAMS, MEMBERS & REGISTRATIONS
-- ----------------------------------------------------------------------------
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Team Members RLS: Admins have full access, leaders can manage their team's roster
DROP POLICY IF EXISTS "Team leader or self can insert team members" ON public.team_members;
CREATE POLICY "Team leader or self can insert team members"
  ON public.team_members FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Team leader or admins can update team members" ON public.team_members;
CREATE POLICY "Team leader or admins can update team members"
  ON public.team_members FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Team leader or admins can delete team members" ON public.team_members;
CREATE POLICY "Team leader or admins can delete team members"
  ON public.team_members FOR DELETE USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.get_current_role() IN ('admin', 'organizer')
  );

-- Teams RLS: Admins can update and delete any team
DROP POLICY IF EXISTS "Leaders or organizers can update teams" ON public.teams;
CREATE POLICY "Leaders or organizers can update teams"
  ON public.teams FOR UPDATE USING (
    auth.uid() = leader_id OR public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Leaders or organizers can delete teams" ON public.teams;
CREATE POLICY "Leaders or organizers can delete teams"
  ON public.teams FOR DELETE USING (
    auth.uid() = leader_id OR public.get_current_role() IN ('admin', 'organizer')
  );

-- Registrations RLS: Admins can delete registrations
DROP POLICY IF EXISTS "Users or organizers can delete registration" ON public.registrations;
CREATE POLICY "Users or organizers can delete registration"
  ON public.registrations FOR DELETE USING (
    auth.uid() = user_id OR
    public.get_current_role() IN ('admin', 'organizer')
  );

-- Submissions RLS: Admins can delete submissions
DROP POLICY IF EXISTS "Organizers can delete submissions" ON public.submissions;
CREATE POLICY "Organizers can delete submissions"
  ON public.submissions FOR DELETE USING (
    auth.uid() = user_id OR
    public.get_current_role() IN ('admin', 'organizer')
  );

-- ----------------------------------------------------------------------------
-- 6. STORAGE POLICIES FOR DOCUMENT MANAGEMENT IN BUCKET 'submissions'
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Submissions files are publicly readable" ON storage.objects;
CREATE POLICY "Submissions files are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submissions');

DROP POLICY IF EXISTS "Authenticated users can upload submission artifacts" ON storage.objects;
CREATE POLICY "Authenticated users can upload submission artifacts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submissions' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users and Admins can update submission files" ON storage.objects;
CREATE POLICY "Users and Admins can update submission files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'submissions' AND (
      auth.uid() = owner OR
      public.get_current_role() IN ('admin', 'organizer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete submission files" ON storage.objects;
CREATE POLICY "Admins can delete submission files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'submissions' AND (
      auth.uid() = owner OR
      public.get_current_role() IN ('admin', 'organizer')
    )
  );

-- ----------------------------------------------------------------------------
-- 7. ENFORCE COMPETITION TEAM SIZES
-- Hackathon: 3 to 4 members
-- Ideathon: 3 to 4 members
-- Codeathon: 1 member
-- ----------------------------------------------------------------------------
UPDATE public.competitions
SET min_team_size = 3, max_team_size = 4
WHERE slug IN ('hackathon', 'ideathon');

UPDATE public.competitions
SET min_team_size = 1, max_team_size = 1
WHERE slug = 'codeathon';

-- ----------------------------------------------------------------------------
-- 8. AUTHORITATIVE SIX PROBLEM CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO public.problem_categories (number, slug, title, theme, sort_order, is_active, is_published)
VALUES
  ('01', 'cat-01', 'Resilient Infrastructure & Autonomous Systems', 'Autonomous Failure Detection & Distributed Failover in Damaged Infrastructure', 1, true, true),
  ('02', 'cat-02', 'Adaptive Crisis Healthcare & Triage Systems', 'Offline-First Disaster Triage & Dynamic Casualty Flow Optimization', 2, true, true),
  ('03', 'cat-03', 'Sustainable Energy, Grid Balancing & Climate Response', 'Decentralized Microgrid Balancing & Priority Energy Allocation', 3, true, true),
  ('04', 'cat-04', 'Secure Communications & Disinformation Defense', 'Cryptographic Emergency Broadcast Verification & Anomaly Corroboration', 4, true, true),
  ('05', 'cat-05', 'Autonomous Logistics & Disaster Relief Distribution', 'Autonomous Fleet Routing & Dynamic Last-Mile Relief Dispatch', 5, true, true),
  ('06', 'cat-06', 'Open Innovation, Economic Rebuilding & Civic Tech', 'Decentralized Community Aid Matching & Local Supply Coordination', 6, true, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  theme = EXCLUDED.theme,
  number = EXCLUDED.number,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  is_published = true;

