-- ============================================================================
-- HACKFEST 3.0 — SDC MEMBERS: ADD VOLUNTEERS CATEGORY & SOCIAL LINKS SUPPORT
-- Student Developer Club, REC Banda
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. UPDATE CATEGORY CHECK CONSTRAINT TO INCLUDE 'volunteer'
-- ----------------------------------------------------------------------------
ALTER TABLE public.sdc_members DROP CONSTRAINT IF EXISTS sdc_members_category_check;
ALTER TABLE public.sdc_members ADD CONSTRAINT sdc_members_category_check 
  CHECK (category IN ('faculty_coordinator', 'mentor', 'coordinator', 'volunteer'));

-- Ensure index exists for category and sort order
CREATE INDEX IF NOT EXISTS idx_sdc_members_category ON public.sdc_members(category);
CREATE INDEX IF NOT EXISTS idx_sdc_members_sort ON public.sdc_members(category, sort_order ASC);

-- ----------------------------------------------------------------------------
-- 2. OPTIONAL COMPATIBILITY COLUMNS FOR DIRECT COLUMN ACCESS
-- (sdc_members uses social_links JSONB for linkedin, github, and email;
-- adding these columns ensures backward and forward compatibility)
-- ----------------------------------------------------------------------------
ALTER TABLE public.sdc_members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.sdc_members ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.sdc_members ADD COLUMN IF NOT EXISTS public_contact_email TEXT;

-- Backfill compatibility columns from existing social_links JSONB if present
UPDATE public.sdc_members
SET
  linkedin_url = COALESCE(linkedin_url, social_links->>'linkedin'),
  github_url = COALESCE(github_url, social_links->>'github'),
  public_contact_email = COALESCE(public_contact_email, social_links->>'email')
WHERE social_links IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. ENSURE RLS POLICIES FOR SDC MEMBERS COVER ALL OPERATIONS FOR ADMINS & PUBLIC
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view active SDC members" ON public.sdc_members;
CREATE POLICY "Anyone can view active SDC members"
  ON public.sdc_members FOR SELECT
  USING (is_active = true OR public.check_is_admin());

DROP POLICY IF EXISTS "Admins can insert SDC members" ON public.sdc_members;
CREATE POLICY "Admins can insert SDC members"
  ON public.sdc_members FOR INSERT
  WITH CHECK (public.check_is_admin());

DROP POLICY IF EXISTS "Admins can update SDC members" ON public.sdc_members;
CREATE POLICY "Admins can update SDC members"
  ON public.sdc_members FOR UPDATE
  USING (public.check_is_admin());

DROP POLICY IF EXISTS "Admins can delete SDC members" ON public.sdc_members;
CREATE POLICY "Admins can delete SDC members"
  ON public.sdc_members FOR DELETE
  USING (public.check_is_admin());
