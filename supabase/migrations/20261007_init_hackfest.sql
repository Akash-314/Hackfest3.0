-- ============================================================================
-- HACKFEST 3.0 — COMPLETE SUPABASE DATABASE ARCHITECTURE & MIGRATION (AUDITED)
-- Student Developer Club, REC Banda
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college TEXT DEFAULT 'Rajkiya Engineering College Banda',
  branch TEXT,
  year TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'mentor', 'judge', 'organizer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ----------------------------------------------------------------------------
-- 2. COMPETITIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  duration TEXT,
  format TEXT,
  min_team_size INT NOT NULL DEFAULT 1,
  max_team_size INT NOT NULL DEFAULT 4,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. PROBLEM CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problem_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  theme TEXT NOT NULL,
  placeholder_notice TEXT,
  background TEXT,
  challenge TEXT,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_outcome TEXT,
  technical_directions TEXT,
  submission_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. TEAMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_competition ON public.teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams(leader_id);

-- ----------------------------------------------------------------------------
-- 5. TEAM MEMBERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);

-- ----------------------------------------------------------------------------
-- 6. REGISTRATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  problem_category_id UUID REFERENCES public.problem_categories(id) ON DELETE SET NULL,
  registration_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (registration_status IN ('pending', 'confirmed', 'cancelled', 'rejected')),
  experience_level TEXT DEFAULT 'intermediate',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, competition_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_competition ON public.registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_team ON public.registrations(team_id);

-- ----------------------------------------------------------------------------
-- 7. SCHEDULES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL CHECK (day_number IN (1, 2)),
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT,
  end_time TEXT,
  location TEXT DEFAULT 'Multipurpose Hall, REC Banda',
  speaker TEXT,
  badge TEXT,
  is_highlight BOOLEAN NOT NULL DEFAULT false,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. MENTORS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT,
  organization TEXT,
  expertise TEXT,
  bio TEXT,
  photo_url TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. JUDGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  designation TEXT,
  organization TEXT,
  expertise TEXT,
  bio TEXT,
  photo_url TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 10. JUDGING CRITERIA TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.judging_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  weight NUMERIC NOT NULL DEFAULT 10,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 11. SUBMISSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  problem_category_id UUID REFERENCES public.problem_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  demo_url TEXT,
  video_url TEXT,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'evaluated', 'disqualified')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_competition ON public.submissions(competition_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON public.submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- ----------------------------------------------------------------------------
-- 12. SCORES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, judge_id, criterion_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_submission ON public.scores(submission_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON public.scores(judge_id);

-- ----------------------------------------------------------------------------
-- 13. SPONSORS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  category TEXT NOT NULL DEFAULT 'partner',
  role TEXT,
  tag TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 14. FAQS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 15. EVENT SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL DEFAULT 'HACKFEST 3.0',
  tagline TEXT DEFAULT 'THE WORLD IS CHANGING. BUILD WHAT COMES NEXT.',
  registration_status TEXT DEFAULT 'OPEN',
  registration_deadline TEXT DEFAULT 'REGISTRATION CLOSING SOON',
  event_start TIMESTAMPTZ,
  event_end TIMESTAMPTZ,
  venue TEXT DEFAULT 'Multipurpose Hall, REC Banda Campus, Atarra, Banda (U.P.)',
  contact_email TEXT DEFAULT 'sdc@recbanda.ac.in',
  contact_phone TEXT,
  live_mode_status TEXT DEFAULT 'REGISTRATION OPEN' CHECK (live_mode_status IN ('UPCOMING', 'REGISTRATION OPEN', 'EVENT LIVE', 'SUBMISSIONS OPEN', 'JUDGING', 'RESULTS')),
  leaderboard_published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 16. ANNOUNCEMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- ============================================================================
-- HELPER FUNCTIONS & RPC TRANSACTIONS
-- ============================================================================

-- Helper security function to get user role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Trigger to automatically create or update profile upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, college, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'college', 'Rajkiya Engineering College Banda'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    college = CASE WHEN profiles.college IS NULL OR profiles.college = '' THEN EXCLUDED.college ELSE profiles.college END,
    phone = COALESCE(profiles.phone, EXCLUDED.phone),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic function to create team and assign creator as leader
-- Accepts either a UUID or a slug ('hackathon', 'ideathon') for p_competition_id
CREATE OR REPLACE FUNCTION public.create_team_with_leader(
  p_name TEXT,
  p_competition_id TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_team_code TEXT;
  v_team_id UUID;
  v_competition RECORD;
  v_comp_uuid UUID;
BEGIN
  -- Resolve competition ID whether passed as UUID or slug
  IF p_competition_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    SELECT * INTO v_competition FROM public.competitions WHERE id = p_competition_id::uuid;
  ELSE
    SELECT * INTO v_competition FROM public.competitions WHERE slug = lower(p_competition_id);
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Competition not found for identifier: %', p_competition_id;
  END IF;

  v_comp_uuid := v_competition.id;

  -- Generate readable unique code: HF3-XXXXXX
  v_team_code := 'HF3-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

  -- Insert team
  INSERT INTO public.teams (name, code, leader_id, competition_id)
  VALUES (p_name, v_team_code, p_user_id, v_comp_uuid)
  RETURNING id INTO v_team_id;

  -- Insert team leader membership
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team_id, p_user_id, 'leader');

  RETURN jsonb_build_object(
    'team_id', v_team_id,
    'code', v_team_code,
    'name', p_name,
    'competition_id', v_comp_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic function to join a team safely with max size checking
CREATE OR REPLACE FUNCTION public.join_team_by_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_team RECORD;
  v_competition RECORD;
  v_member_count INT;
BEGIN
  -- Find team
  SELECT * INTO v_team FROM public.teams WHERE upper(code) = upper(trim(p_code));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid team code: %', p_code;
  END IF;

  -- Fetch competition rules
  SELECT * INTO v_competition FROM public.competitions WHERE id = v_team.competition_id;

  -- Count current members
  SELECT count(*) INTO v_member_count FROM public.team_members WHERE team_id = v_team.id;

  IF v_member_count >= v_competition.max_team_size THEN
    RAISE EXCEPTION 'Team is full (Maximum % members)', v_competition.max_team_size;
  END IF;

  -- Check if user is already in this team
  IF EXISTS (SELECT 1 FROM public.team_members WHERE team_id = v_team.id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object(
      'status', 'already_joined',
      'team_id', v_team.id,
      'name', v_team.name,
      'competition_id', v_team.competition_id
    );
  END IF;

  -- Insert member
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team.id, p_user_id, 'member');

  RETURN jsonb_build_object(
    'status', 'success',
    'team_id', v_team.id,
    'name', v_team.name,
    'competition_id', v_team.competition_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for Leaderboard rankings calculation
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  submission_id UUID,
  title TEXT,
  description TEXT,
  team_name TEXT,
  competition_name TEXT,
  average_score NUMERIC,
  evaluations_count BIGINT
) AS $$
BEGIN
  -- Return rankings if leaderboard is published or if caller is organizer/admin
  IF (SELECT leaderboard_published FROM public.event_settings LIMIT 1) IS TRUE OR (public.get_current_role() IN ('admin', 'organizer')) THEN
    RETURN QUERY
    SELECT
      s.id AS submission_id,
      s.title,
      s.description,
      COALESCE(t.name, 'Individual') AS team_name,
      c.name AS competition_name,
      ROUND(COALESCE(AVG(sc.score), 0)::numeric, 1) AS average_score,
      COUNT(sc.id) AS evaluations_count
    FROM public.submissions s
    LEFT JOIN public.teams t ON s.team_id = t.id
    JOIN public.competitions c ON s.competition_id = c.id
    LEFT JOIN public.scores sc ON s.id = sc.submission_id
    WHERE s.status = 'evaluated'
    GROUP BY s.id, s.title, s.description, t.name, c.name
    ORDER BY average_score DESC;
  ELSE
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for live mentors & judges inspection
CREATE OR REPLACE FUNCTION public.get_live_interviewers()
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  designation TEXT,
  organization TEXT,
  expertise TEXT,
  is_live BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, 'mentor'::TEXT AS type, m.name, m.designation, m.organization, m.expertise, m.is_live
  FROM public.mentors m
  UNION ALL
  SELECT j.id, 'judge'::TEXT AS type, j.name, j.designation, j.organization, j.expertise, j.is_live
  FROM public.judges j;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.get_current_role() IN ('admin', 'organizer'));

-- 2. PUBLIC READ TABLES
DROP POLICY IF EXISTS "Public can view active competitions" ON public.competitions;
CREATE POLICY "Public can view active competitions"
  ON public.competitions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage competitions" ON public.competitions;
CREATE POLICY "Organizers manage competitions"
  ON public.competitions FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view active problem categories" ON public.problem_categories;
CREATE POLICY "Public can view active problem categories"
  ON public.problem_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage problem categories" ON public.problem_categories;
CREATE POLICY "Organizers manage problem categories"
  ON public.problem_categories FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view schedules" ON public.schedules;
CREATE POLICY "Public can view schedules"
  ON public.schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage schedules" ON public.schedules;
CREATE POLICY "Organizers manage schedules"
  ON public.schedules FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view mentors" ON public.mentors;
CREATE POLICY "Public can view mentors"
  ON public.mentors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage mentors" ON public.mentors;
CREATE POLICY "Organizers manage mentors"
  ON public.mentors FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view judges" ON public.judges;
CREATE POLICY "Public can view judges"
  ON public.judges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage judges" ON public.judges;
CREATE POLICY "Organizers manage judges"
  ON public.judges FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view judging criteria" ON public.judging_criteria;
CREATE POLICY "Public can view judging criteria"
  ON public.judging_criteria FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage judging criteria" ON public.judging_criteria;
CREATE POLICY "Organizers manage judging criteria"
  ON public.judging_criteria FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view sponsors" ON public.sponsors;
CREATE POLICY "Public can view sponsors"
  ON public.sponsors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage sponsors" ON public.sponsors;
CREATE POLICY "Organizers manage sponsors"
  ON public.sponsors FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view faqs" ON public.faqs;
CREATE POLICY "Public can view faqs"
  ON public.faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage faqs" ON public.faqs;
CREATE POLICY "Organizers manage faqs"
  ON public.faqs FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view event settings" ON public.event_settings;
CREATE POLICY "Public can view event settings"
  ON public.event_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers manage event settings" ON public.event_settings;
CREATE POLICY "Organizers manage event settings"
  ON public.event_settings FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
CREATE POLICY "Public can view announcements"
  ON public.announcements FOR SELECT USING (published = true OR public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Organizers manage announcements" ON public.announcements;
CREATE POLICY "Organizers manage announcements"
  ON public.announcements FOR ALL USING (public.get_current_role() IN ('admin', 'organizer'));

-- 3. TEAMS & TEAM MEMBERS POLICIES
DROP POLICY IF EXISTS "Anyone logged in can view teams" ON public.teams;
CREATE POLICY "Anyone logged in can view teams"
  ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT WITH CHECK (auth.uid() = leader_id OR public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Leaders or organizers can update teams" ON public.teams;
CREATE POLICY "Leaders or organizers can update teams"
  ON public.teams FOR UPDATE USING (
    auth.uid() = leader_id OR public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Anyone logged in can view team members" ON public.team_members;
CREATE POLICY "Anyone logged in can view team members"
  ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team leader or self can insert team members" ON public.team_members;
CREATE POLICY "Team leader or self can insert team members"
  ON public.team_members FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Member or leader can delete membership" ON public.team_members;
CREATE POLICY "Member or leader can delete membership"
  ON public.team_members FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.get_current_role() IN ('admin', 'organizer')
  );

-- 4. REGISTRATIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
CREATE POLICY "Users can view their own registrations"
  ON public.registrations FOR SELECT USING (
    auth.uid() = user_id OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Users can insert their own registration" ON public.registrations;
CREATE POLICY "Users can insert their own registration"
  ON public.registrations FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Users or organizers can update registration" ON public.registrations;
CREATE POLICY "Users or organizers can update registration"
  ON public.registrations FOR UPDATE USING (
    auth.uid() = user_id OR
    public.get_current_role() IN ('admin', 'organizer')
  );

-- 5. SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "Submissions visibility" ON public.submissions;
CREATE POLICY "Submissions visibility"
  ON public.submissions FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = submissions.team_id AND user_id = auth.uid()) OR
    public.get_current_role() IN ('judge', 'admin', 'organizer') OR
    (status = 'evaluated' AND (SELECT leaderboard_published FROM public.event_settings LIMIT 1) IS TRUE)
  );

DROP POLICY IF EXISTS "Team members can insert submissions" ON public.submissions;
CREATE POLICY "Team members can insert submissions"
  ON public.submissions FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = submissions.team_id AND user_id = auth.uid()) OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Team members can update their draft submissions" ON public.submissions;
CREATE POLICY "Team members can update their draft submissions"
  ON public.submissions FOR UPDATE USING (
    (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.team_members WHERE team_id = submissions.team_id AND user_id = auth.uid())) AND
    (status = 'draft' OR public.get_current_role() IN ('admin', 'organizer'))
  );

-- 6. SCORES POLICIES
DROP POLICY IF EXISTS "Scores visibility" ON public.scores;
CREATE POLICY "Scores visibility"
  ON public.scores FOR SELECT USING (
    auth.uid() = judge_id OR
    public.get_current_role() IN ('admin', 'organizer') OR
    (SELECT leaderboard_published FROM public.event_settings LIMIT 1) IS TRUE
  );

DROP POLICY IF EXISTS "Judges can insert their own scores" ON public.scores;
CREATE POLICY "Judges can insert their own scores"
  ON public.scores FOR INSERT WITH CHECK (
    auth.uid() = judge_id AND
    public.get_current_role() IN ('judge', 'admin', 'organizer')
  );

DROP POLICY IF EXISTS "Judges can update their own scores" ON public.scores;
CREATE POLICY "Judges can update their own scores"
  ON public.scores FOR UPDATE USING (
    auth.uid() = judge_id AND
    public.get_current_role() IN ('judge', 'admin', 'organizer')
  );

-- ----------------------------------------------------------------------------
-- 17. STORAGE BUCKET & STORAGE RLS POLICIES
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

DROP POLICY IF EXISTS "Users can update their own submission files" ON storage.objects;
CREATE POLICY "Users can update their own submission files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'submissions' AND auth.uid() = owner);

-- ============================================================================
-- SEED DATA (Synced from eventData.js)
-- ============================================================================

-- Event Settings
INSERT INTO public.event_settings (event_name, tagline, venue, contact_email)
VALUES (
  'HACKFEST 3.0',
  'THE WORLD IS CHANGING. BUILD WHAT COMES NEXT.',
  'Multipurpose Hall, REC Banda Campus, Atarra, Banda (U.P.)',
  'sdc@recbanda.ac.in'
)
ON CONFLICT DO NOTHING;

-- Competitions
INSERT INTO public.competitions (slug, name, short_description, duration, format, min_team_size, max_team_size)
VALUES
  ('codeathon', 'CODEATHON', 'A high-stakes 90-minute algorithmic arena. Test data structures, algorithmic efficiency, and problem-solving velocity.', '1.5 HOURS', 'COMPETITIVE CODING', 1, 1),
  ('ideathon', 'IDEATHON', 'A focused defense of disruptive concepts. Present strategic technical solutions, viability frameworks, and market roadmaps to a critical jury.', 'SINGLE PITCHING ROUND', 'PITCH & DEFENSE', 1, 3),
  ('hackathon', 'HACKATHON', 'The premier centerpiece of HackFest 3.0. Form a team, choose one of six crisis problem categories, build an operational prototype, and demo it live.', '2-DAY IMMERSIVE BUILD', '6 PROBLEM CATEGORIES • TEAM DEVELOPMENT', 2, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  min_team_size = EXCLUDED.min_team_size,
  max_team_size = EXCLUDED.max_team_size,
  format = EXCLUDED.format;

-- Judging Criteria (9 Official Dimensions)
INSERT INTO public.judging_criteria (code, title, description, weight, sort_order)
VALUES
  ('c1', 'Problem Understanding', 'Grasp of the underlying crisis track and core constraints.', 10, 1),
  ('c2', 'Quality of Solution', 'Architecture, algorithmic soundness, and elegance.', 10, 2),
  ('c3', 'Innovation & Novelty', 'Originality of the conceptual approach and creative disruption.', 15, 3),
  ('c4', 'Technical Implementation', 'Depth of code, data structures, APIs, and stack integration.', 15, 4),
  ('c5', 'Functionality & Stability', 'Working prototype validation under live test stress.', 15, 5),
  ('c6', 'Usability & Feasibility', 'User experience ergonomics and real-world deployability.', 10, 6),
  ('c7', 'Impact & Relevance', 'Meaningful societal or industrial utility in a disrupted landscape.', 10, 7),
  ('c8', 'Scalability Potential', 'Capacity to handle concurrency, data volume, and expansion.', 5, 8),
  ('c9', 'Presentation & Live Demo', 'Clarity of the pitch, defense handling, and Q&A composure.', 10, 9)
ON CONFLICT DO NOTHING;

-- Problem Categories (6 Tracks from eventData.js)
INSERT INTO public.problem_categories (number, title, slug, theme, placeholder_notice, background, challenge, requirements, expected_outcome, technical_directions, submission_info, sort_order)
VALUES
  (
    '01',
    '[PROBLEM CATEGORY 01]',
    'resilient-infrastructure',
    'Resilient Infrastructure & Autonomous Systems',
    'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
    'Modern public infrastructure—from power distribution grids to distributed transit and logistics networks—remains vulnerable to severe environmental disruptions, cascading outages, and single points of failure.',
    'Design and implement a decentralized, highly fault-tolerant system capable of monitoring, rerouting, or automatically balancing infrastructure services during catastrophic system failure.',
    '["Real-time or simulated sensory telemetry ingestion.", "Fault-detection algorithms with failover mechanism.", "Intuitive operational dashboard for disaster control teams.", "Low-bandwidth emergency communication fallback protocol."]'::jsonb,
    'A functional working prototype demonstrating automated failure isolation and dynamic rerouting under simulated stress conditions.',
    'Exploration of edge computing, distributed consensus, mesh communication, and lightweight telemetry visualization.',
    'GitHub repository with setup instructions, architectural diagram, and a 3-minute video/live demonstration.',
    1
  ),
  (
    '02',
    '[PROBLEM CATEGORY 02]',
    'adaptive-healthcare',
    'Adaptive Crisis Healthcare & Triage Systems',
    'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
    'During regional crises and sudden population displacement, traditional healthcare centers suffer from severe information bottlenecks, chaotic patient triaging, and supply chain stock-outs.',
    'Build an adaptive triage and resource optimization platform that connects emergency medical teams, matches critical medical supplies, and tracks patient acuity under high latency or offline constraints.',
    '["Rapid patient intake and risk stratification mechanism.", "Offline-first synchronization capabilities for field clinics.", "Dynamic inventory and resource matching engine.", "Privacy-preserving medical record transmission."]'::jsonb,
    'An operational application showcasing offline data capture, peer sync, and intelligent patient triage prioritisation.',
    'PWA/Mobile-first designs, local SQLite/IndexedDB sync engines, lightweight predictive triage logic.',
    'Executable codebase, API documentation, and test scenario walkthrough.',
    2
  ),
  (
    '03',
    '[PROBLEM CATEGORY 03]',
    'sustainable-energy',
    'Sustainable Energy, Grid Balancing & Climate Response',
    'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
    'Disrupted electrical networks require decentralized renewable microgrids capable of self-healing and dynamic load shifting when central power generation ceases.',
    'Develop an intelligent microgrid management software engine that optimizes distributed solar/battery storage usage and prioritizes critical life-support loads across communities.',
    '["Simulated load and supply forecasting logic.", "Automated shedding of non-essential power loads.", "Peer-to-peer virtual energy trading or distribution ledger.", "Participant engagement UI showing carbon and reserve metrics."]'::jsonb,
    'A simulation environment or hardware-in-the-loop dashboard illustrating real-time balancing between erratic supply and shifting demand.',
    'Smart contracts, time-series forecasting, IoT telemetry simulators, WebSockets.',
    'Complete codebase with reproducible test vectors and simulation playback.',
    3
  ),
  (
    '04',
    '[PROBLEM CATEGORY 04]',
    'secure-communications',
    'Secure Communications & Disinformation Defense',
    'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
    'In the wake of major disruption, information channels are inundated with spoofed communications, malicious panic mongering, and breakdown of trusted authorities.',
    'Construct a verifiable emergency communication protocol that authenticates civic alerts, verifies eyewitness reports, and dispels misleading rumors without requiring centralized servers.',
    '["Cryptographic signing and verification of crisis bulletins.", "Crowdsourced anomaly and corroboration engine.", "Tamper-evident public ledger or distributed verification tree.", "Accessible multi-lingual mobile interface for citizens."]'::jsonb,
    'A working proof-of-concept demonstrating verification of incoming distress beacons and defense against spoofed broadcasts.',
    'Zero-knowledge proofs, asymmetric public key infrastructure, decentralized identity (DID).',
    'Code repository with cryptographic verification unit tests and architecture paper.',
    4
  ),
  (
    '05',
    '[PROBLEM CATEGORY 05]',
    'autonomous-logistics',
    'Autonomous Logistics & Disaster Relief Distribution',
    'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
    'Physical delivery of relief provisions, clean water, and tools into blocked or disrupted zones is delayed by fractured transportation links and lack of coordination.',
    'Create an autonomous routing and consignment allocation system that coordinates ground volunteers, drone routes, and depot checkpoints to optimize delivery times and prevent wastage.',
    '["Dynamic shortest-path routing algorithm accounting for hazard zones.", "Consignment tracking with proof-of-delivery validation.", "Volunteer assignment module based on skill and proximity.", "Interactive command & dispatch map."]'::jsonb,
    'An interactive command portal demonstrating routing optimization and dispatch allocation across disrupted zones.',
    'Geospatial indexing (H3, PostGIS), genetic algorithms, real-time dispatch systems.',
    'Repository link, deployment URL, and routing benchmark report.',
    5
  ),
  (
    '06',
    '[PROBLEM CATEGORY 06]',
    'civic-tech-rebuilding',
    'Open Innovation, Economic Rebuilding & Civic Tech',
    'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
    'Post-crisis rebuilding demands grassroots economic tools that allow local artisans, students, and small enterprises to barter skills, organize micro-labor, and restart local economies.',
    'Develop an open-source platform facilitating decentralized skill exchange, mutual aid coordination, and verifiable micro-credentials to empower community restoration.',
    '["Peer-to-peer skill and resource matching engine.", "Verifiable contribution credentials or karma metrics.", "Lightweight accessibility for low-end mobile devices.", "Community governance and dispute settlement mechanisms."]'::jsonb,
    'A fully responsive web platform enabling community task creation, fulfillment verification, and credential issuance.',
    'Modern full-stack web architectures, accessible UI/UX, progressive offline caching.',
    'Live deployed web link, public source repository, and demo account credentials.',
    6
  )
ON CONFLICT (slug) DO NOTHING;

-- FAQs Seed Data
INSERT INTO public.faqs (question, answer, category, sort_order)
VALUES
  ('Who can participate in HackFest 3.0?', 'HackFest 3.0 is open to all students currently enrolled in undergraduate or postgraduate programs across engineering, science, design, and management disciplines.', 'Eligibility', 1),
  ('What is the team size for each event?', 'Hackathon: 2 to 4 members per team. Ideathon: 1 to 3 members per team. Codeathon: strictly individual participation.', 'Teams', 2),
  ('How many problem categories exist for the Hackathon?', 'There are exactly six multi-disciplinary crisis problem categories. Teams select one category at the start of Day 2 to focus their solution.', 'Hackathon', 3),
  ('What is the duration of the Hackathon?', 'The main Hackathon takes place on Day 2, spanning intense development sprints, scheduled mentoring rounds, and live evening presentations.', 'Hackathon', 4),
  ('What is the Codeathon duration and format?', 'The Codeathon is a 1.5-hour (90 minutes) competitive coding contest hosted on a dedicated algorithmic platform with real-time ranking.', 'Codeathon', 5),
  ('How does the Ideathon work?', 'The Ideathon features a single high-impact pitching round where teams present an original tech solution followed by an intense Q&A defense with the jury.', 'Ideathon', 6),
  ('How are projects evaluated?', 'Projects are evaluated by a multidisciplinary jury panel against strict criteria: problem understanding, solution quality, innovation, technical depth, functionality, scalability, and live demo.', 'Evaluation', 7),
  ('What should participants bring to the venue?', 'Participants should bring their laptops, chargers, extension cords, any required hardware components/microcontrollers, student ID cards, and personal essentials.', 'Logistics', 8),
  ('Can participants join more than one competition?', 'Yes! Since Codeathon and Ideathon take place on Day 1 and the Flagship Hackathon takes place on Day 2, eligible participants may participate across different tracks provided their schedules do not directly conflict.', 'Participation', 9),
  ('How do I register for HackFest 3.0?', 'Registrations can be completed through the registration portal by clicking the REGISTER NOW buttons on this website. There are zero registration fees.', 'Registration', 10)
ON CONFLICT DO NOTHING;

-- Mentors Seed Data
INSERT INTO public.mentors (name, designation, organization, expertise, bio, sort_order)
VALUES
  ('[SENIOR TECH MENTOR 01]', 'Systems & Cloud Architect', 'Enterprise Cloud Guild', 'Distributed Systems & Cloud Computing', 'Guiding teams on scalable backend architecture, microservices, and database resilience.', 1),
  ('[SENIOR TECH MENTOR 02]', 'Applied AI Engineer', 'AI Research Lab', 'Machine Learning & Edge Compute', 'Assisting teams with neural model deployment, data preprocessing, and edge inferencing.', 2),
  ('[SENIOR TECH MENTOR 03]', 'Full Stack Lead', 'Modern Web Systems', 'Frontend Architecture & API Design', 'Assisting teams in rapid UI prototyping, WebSockets, and seamless user interaction design.', 3),
  ('[SENIOR TECH MENTOR 04]', 'Hardware & IoT Specialist', 'Robotics Consortium', 'Embedded Systems & Microcontrollers', 'Advising on hardware interfaces, sensor telemetry, and reliable low-power protocols.', 4)
ON CONFLICT DO NOTHING;

-- Judges Seed Data
INSERT INTO public.judges (name, designation, organization, expertise, bio, sort_order)
VALUES
  ('Dr. Abhijeet Singh Sir', 'Coordinator, Student Developer Club', 'REC Banda', 'Software Engineering & Academic Leadership', 'Leading software development and student technological initiatives at REC Banda.', 1),
  ('Dr. Vibhash Yadav Sir', 'Head of Department', 'Department of Information Technology, REC Banda', 'Information Technology & Systems', 'Guiding academic and industrial technology excellence across computing disciplines.', 2),
  ('[INDUSTRY GUEST JURY 01]', 'Engineering Director', 'Enterprise Tech Partner', 'Enterprise Systems & Scalability', 'Evaluating technical depth, practical feasibility, and enterprise readiness.', 3),
  ('[INDUSTRY GUEST JURY 02]', 'Product & Strategy Specialist', 'Global Technology Ecosystem', 'Product Strategy & UX', 'Reviewing usability, scalability potential, and presentation impact.', 4)
ON CONFLICT DO NOTHING;

-- Announcements Initial Seed
INSERT INTO public.announcements (title, message, priority)
VALUES
  ('Welcome to HackFest 3.0', 'Registration is now officially open! Join Codeathon, Ideathon, or the Flagship Hackathon. Check out the problem tracks in the Missions section.', 'high')
ON CONFLICT DO NOTHING;

-- Reload PostgREST schema cache to ensure all newly created tables/RPCs are immediately visible
NOTIFY pgrst, 'reload schema';
