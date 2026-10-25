-- ============================================================================
-- HACKFEST 3.0 — SDC MEMBERS: ADD IEEE MEMBER CATEGORY SUPPORT
-- Student Developer Club & IEEE Student Branch, REC Banda
-- ============================================================================

-- Update category check constraint to include 'ieee_member' and 'ieee'
ALTER TABLE public.sdc_members DROP CONSTRAINT IF EXISTS sdc_members_category_check;
ALTER TABLE public.sdc_members ADD CONSTRAINT sdc_members_category_check 
  CHECK (category IN ('director', 'faculty_coordinator', 'mentor', 'coordinator', 'ieee_member', 'ieee', 'volunteer'));
