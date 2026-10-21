-- ============================================================================
-- HACKFEST 3.0 — SDC MEMBERS: ADD DIRECTOR CATEGORY SUPPORT
-- Student Developer Club, REC Banda
-- ============================================================================

-- Update category check constraint to include 'director'
ALTER TABLE public.sdc_members DROP CONSTRAINT IF EXISTS sdc_members_category_check;
ALTER TABLE public.sdc_members ADD CONSTRAINT sdc_members_category_check 
  CHECK (category IN ('director', 'faculty_coordinator', 'mentor', 'coordinator', 'volunteer'));
