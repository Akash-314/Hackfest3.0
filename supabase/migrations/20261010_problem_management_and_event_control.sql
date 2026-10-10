-- ============================================================================
-- HACKFEST 3.0 — DYNAMIC PROBLEM MANAGEMENT & EVENT REGISTRATION / SUBMISSION CONTROL
-- Student Developer Club, REC Banda
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTEND EVENT_SETTINGS WITH REGISTRATION & PPT SUBMISSION CONTROLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS event_date TEXT DEFAULT 'OCTOBER 24-25, 2026';
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS registration_open BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS registration_start_date TEXT DEFAULT 'OCTOBER 10, 2026';
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS ppt_submissions_open BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS submission_deadline TEXT DEFAULT 'OCTOBER 25, 2026, 12:00 PM';
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS submission_instructions TEXT DEFAULT 'Submit your slide presentation (PDF or PPTX format, under 25MB) and provide your GitHub repository link.';
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS accepted_file_types TEXT DEFAULT '.pdf,.pptx,.ppt';
ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS max_file_size_mb INT DEFAULT 25;

UPDATE public.event_settings
SET
  event_date = COALESCE(event_date, 'OCTOBER 24-25, 2026'),
  registration_open = COALESCE(registration_open, CASE WHEN registration_status = 'CLOSED' THEN false ELSE true END),
  ppt_submissions_open = COALESCE(ppt_submissions_open, true),
  submission_deadline = COALESCE(submission_deadline, 'OCTOBER 25, 2026, 12:00 PM'),
  submission_instructions = COALESCE(submission_instructions, 'Submit your slide presentation (PDF or PPTX format, under 25MB) and provide your GitHub repository link.'),
  accepted_file_types = COALESCE(accepted_file_types, '.pdf,.pptx,.ppt'),
  max_file_size_mb = COALESCE(max_file_size_mb, 25)
WHERE id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. EXTEND PROBLEM_CATEGORIES (COMPATIBILITY COLUMNS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.problem_categories ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.problem_categories ADD COLUMN IF NOT EXISTS description TEXT;

UPDATE public.problem_categories
SET
  is_published = COALESCE(is_active, true),
  description = COALESCE(challenge, background, '')
WHERE id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. CREATE PROBLEM_STATEMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.problem_categories(id) ON DELETE SET NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT,
  track_label TEXT,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints TEXT,
  examples TEXT,
  input_output_specs TEXT,
  reference_file_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_problem_statements_category ON public.problem_statements(category_id);
CREATE INDEX IF NOT EXISTS idx_problem_statements_published ON public.problem_statements(is_published);
CREATE INDEX IF NOT EXISTS idx_problem_statements_sort ON public.problem_statements(sort_order);

-- ----------------------------------------------------------------------------
-- 4. RLS POLICIES FOR PROBLEM_CATEGORIES & PROBLEM_STATEMENTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.problem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;

-- Problem Categories RLS
DROP POLICY IF EXISTS "Public can view active problem categories" ON public.problem_categories;
CREATE POLICY "Public can view active problem categories"
  ON public.problem_categories FOR SELECT
  USING (is_active = true OR is_published = true OR public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Organizers manage problem categories" ON public.problem_categories;
CREATE POLICY "Organizers manage problem categories"
  ON public.problem_categories FOR ALL
  USING (public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

-- Problem Statements RLS
DROP POLICY IF EXISTS "Public can view published problem statements" ON public.problem_statements;
CREATE POLICY "Public can view published problem statements"
  ON public.problem_statements FOR SELECT
  USING (is_published = true OR public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

DROP POLICY IF EXISTS "Organizers manage problem statements" ON public.problem_statements;
CREATE POLICY "Organizers manage problem statements"
  ON public.problem_statements FOR ALL
  USING (public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer'));

-- ----------------------------------------------------------------------------
-- 5. DATABASE LEVEL ENFORCEMENT TRIGGERS (REGISTRATION & SUBMISSION RESTRICTIONS)
-- ----------------------------------------------------------------------------

-- A. Registration Availability Enforcement
CREATE OR REPLACE FUNCTION public.enforce_registration_availability()
RETURNS TRIGGER AS $$
DECLARE
  v_open BOOLEAN;
  v_status TEXT;
BEGIN
  -- Super Admin or Admin role bypass for testing/administrative entries
  IF public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer') THEN
    RETURN NEW;
  END IF;

  SELECT registration_open, registration_status INTO v_open, v_status 
  FROM public.event_settings 
  LIMIT 1;

  IF v_open = false OR v_status = 'CLOSED' THEN
    RAISE EXCEPTION 'Event registration is currently closed by event administration.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_registration_availability ON public.registrations;
CREATE TRIGGER trg_enforce_registration_availability
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_registration_availability();

-- B. PPT / Project Submission Availability Enforcement
CREATE OR REPLACE FUNCTION public.enforce_submission_availability()
RETURNS TRIGGER AS $$
DECLARE
  v_open BOOLEAN;
BEGIN
  -- Super Admin or Admin role bypass for testing/administrative entries
  IF public.check_is_admin() OR public.get_current_role() IN ('admin', 'organizer') THEN
    RETURN NEW;
  END IF;

  SELECT ppt_submissions_open INTO v_open 
  FROM public.event_settings 
  LIMIT 1;

  IF v_open = false AND NEW.status = 'submitted' THEN
    RAISE EXCEPTION 'Project and PPT submissions are currently closed by event administration.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_submission_availability ON public.submissions;
CREATE TRIGGER trg_enforce_submission_availability
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_submission_availability();

-- ----------------------------------------------------------------------------
-- 6. SEED PROBLEM STATEMENTS FROM CATEGORIES IF EMPTY
-- ----------------------------------------------------------------------------
INSERT INTO public.problem_statements (
  category_id,
  title,
  slug,
  track_label,
  description,
  requirements,
  constraints,
  examples,
  input_output_specs,
  status,
  is_published,
  sort_order
)
SELECT
  c.id,
  c.title,
  c.slug,
  c.theme,
  COALESCE(c.challenge, c.background, 'Detailed challenge statement unveiled at HackFest 3.0.'),
  c.requirements,
  'Prototype must be demonstrated live with functional code and clear architectural separation.',
  'Sample deployment scenarios, API integration contracts, and synthetic testing records.',
  'Input: Real-time telemetry, mock sensor feeds, or user directives. Output: Resilient response state, visual alert, or actionable remediation.',
  'published',
  true,
  c.sort_order
FROM public.problem_categories c
WHERE NOT EXISTS (
  SELECT 1 FROM public.problem_statements ps WHERE ps.category_id = c.id
);
