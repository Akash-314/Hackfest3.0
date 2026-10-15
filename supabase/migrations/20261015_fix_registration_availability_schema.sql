-- ============================================================================
-- HACKFEST 3.0 — DATABASE MIGRATION: FIX MISSING REGISTRATION_OPEN COLUMN
-- Student Developer Club, REC Banda
-- Fixes runtime error: column "registration_open" does not exist during registration
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD MISSING registration_open AND event_date COLUMNS TO event_settings
-- ----------------------------------------------------------------------------
ALTER TABLE public.event_settings 
  ADD COLUMN IF NOT EXISTS registration_open BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.event_settings 
  ADD COLUMN IF NOT EXISTS event_date TEXT DEFAULT 'OCTOBER 24-25, 2026';

-- Synchronize registration_open based on existing registration_status
UPDATE public.event_settings
SET 
  registration_open = CASE 
    WHEN UPPER(COALESCE(registration_status, 'OPEN')) = 'CLOSED' THEN false 
    ELSE true 
  END,
  event_date = COALESCE(event_date, 'OCTOBER 24-25, 2026')
WHERE id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. ENSURE competitions TABLE HAS registration_open AND status
-- ----------------------------------------------------------------------------
ALTER TABLE public.competitions 
  ADD COLUMN IF NOT EXISTS registration_open BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.competitions 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Ensure canonical defaults across competitions
UPDATE public.competitions
SET 
  registration_open = COALESCE(registration_open, true),
  status = COALESCE(status, 'active')
WHERE id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. HARDEN enforce_registration_availability() TRIGGER FUNCTION
-- Safely verifies both global event settings and competition-specific status
-- Handles schema resilience and protects against null column lookups
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_registration_availability()
RETURNS TRIGGER AS $$
DECLARE
  v_event_open BOOLEAN := true;
  v_event_status TEXT := 'OPEN';
  v_comp_open BOOLEAN := true;
  v_comp_status TEXT := 'active';
  v_comp_name TEXT := 'selected competition';
BEGIN
  -- Bypass check for administrators/organizers for administrative entry
  IF (SELECT public.check_is_admin()) OR (SELECT public.get_current_role()) IN ('admin', 'organizer') THEN
    RETURN NEW;
  END IF;

  -- 1. Check Global Event Registration Status
  SELECT 
    COALESCE(registration_open, (UPPER(COALESCE(registration_status, 'OPEN')) != 'CLOSED')),
    COALESCE(registration_status, 'OPEN')
  INTO v_event_open, v_event_status 
  FROM public.event_settings 
  LIMIT 1;

  IF v_event_open = false OR UPPER(COALESCE(v_event_status, 'OPEN')) = 'CLOSED' THEN
    RAISE EXCEPTION 'Event registration is currently closed by event administration.';
  END IF;

  -- 2. Check Specific Competition Registration Status (if competition_id is provided)
  IF NEW.competition_id IS NOT NULL THEN
    SELECT 
      COALESCE(registration_open, true),
      COALESCE(status, 'active'),
      COALESCE(name, 'selected competition')
    INTO v_comp_open, v_comp_status, v_comp_name
    FROM public.competitions
    WHERE id = NEW.competition_id;

    IF v_comp_open = false OR LOWER(COALESCE(v_comp_status, 'active')) != 'active' THEN
      RAISE EXCEPTION 'Registration for % is currently closed.', v_comp_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind trigger to registrations table
DROP TRIGGER IF EXISTS trg_enforce_registration_availability ON public.registrations;
CREATE TRIGGER trg_enforce_registration_availability
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_registration_availability();

-- ----------------------------------------------------------------------------
-- 4. PRESERVE STRICT ROW LEVEL SECURITY (RLS) POLICIES ON REGISTRATIONS
-- ----------------------------------------------------------------------------
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
CREATE POLICY "Users can view their own registrations"
  ON public.registrations FOR SELECT USING (
    auth.uid() = user_id OR
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Users can insert their own registration" ON public.registrations;
CREATE POLICY "Users can insert their own registration"
  ON public.registrations FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer')
  );

DROP POLICY IF EXISTS "Users or organizers can update registration" ON public.registrations;
CREATE POLICY "Users or organizers can update registration"
  ON public.registrations FOR UPDATE USING (
    auth.uid() = user_id OR
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer')
  );

-- ----------------------------------------------------------------------------
-- 5. RELOAD POSTGREST SCHEMA CACHE
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
