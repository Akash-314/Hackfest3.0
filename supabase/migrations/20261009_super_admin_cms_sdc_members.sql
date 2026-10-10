-- ============================================================================
-- HACKFEST 3.0 — SUPER ADMIN, WEBSITE CMS, SDC MEMBERS & AUDIT SYSTEM
-- Student Developer Club, REC Banda
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTEND PROFILES FOR SUPER ADMIN & ROLE INTEGRITY
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('participant', 'mentor', 'judge', 'organizer', 'admin', 'super_admin'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON public.profiles(is_super_admin);

-- ----------------------------------------------------------------------------
-- 2. PROTECTED APP_ADMINS TABLE
-- Dedicated server-enforced role table to ensure no regular admin can self-promote
-- or modify the protected Super Admin record.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  promoted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. SDC MEMBERS TABLE
-- Public showcases Faculty Coordinator, Mentors, and Coordinators in exact order
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sdc_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('faculty_coordinator', 'mentor', 'coordinator')),
  role_title TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sdc_members_category ON public.sdc_members(category);
CREATE INDEX IF NOT EXISTS idx_sdc_members_sort ON public.sdc_members(category, sort_order ASC);
ALTER TABLE public.sdc_members ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. AUDIT LOGS TABLE
-- Immutable security ledger tracking all administrative and CMS modifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5. STORAGE BUCKET FOR SDC MEMBER PHOTOGRAPHS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('sdc-members', 'sdc-members', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ----------------------------------------------------------------------------
-- 6. SECURITY DEFINER HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Check if a user is Super Admin
CREATE OR REPLACE FUNCTION public.check_is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id AND (is_super_admin = true OR role = 'super_admin')
  ) OR EXISTS (
    SELECT 1 FROM public.app_admins
    WHERE user_id = p_user_id AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if a user is Admin or Super Admin
CREATE OR REPLACE FUNCTION public.check_is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN public.check_is_super_admin(p_user_id) OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id AND role IN ('admin', 'organizer')
  ) OR EXISTS (
    SELECT 1 FROM public.app_admins
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper to record an audit log
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_actor_id UUID;
  v_actor_email TEXT;
  v_actor_role TEXT;
  v_log_id UUID;
BEGIN
  v_actor_id := auth.uid();
  
  IF v_actor_id IS NOT NULL THEN
    SELECT email, role INTO v_actor_email, v_actor_role FROM public.profiles WHERE id = v_actor_id;
  ELSE
    v_actor_email := 'system';
    v_actor_role := 'system';
  END IF;

  INSERT INTO public.audit_logs (actor_id, actor_email, actor_role, action, entity_type, entity_id, details)
  VALUES (v_actor_id, v_actor_email, v_actor_role, p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Super Admin: Promote User to Admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_target_profile RECORD;
BEGIN
  -- 1. Strictly enforce that ONLY Super Admin can promote
  IF NOT public.check_is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Access Denied: Only the verified Super Admin can appoint regular administrators.';
  END IF;

  -- 2. Verify target user exists
  SELECT * INTO v_target_profile FROM public.profiles WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found.';
  END IF;

  -- 3. Update profiles table
  UPDATE public.profiles 
  SET role = 'admin', updated_at = now() 
  WHERE id = target_user_id;

  -- 4. Upsert into app_admins table
  INSERT INTO public.app_admins (user_id, role, is_super_admin, promoted_by, updated_at)
  VALUES (target_user_id, 'admin', false, v_caller, now())
  ON CONFLICT (user_id) DO UPDATE SET 
    role = 'admin',
    is_super_admin = false,
    promoted_by = v_caller,
    updated_at = now();

  -- 5. Record in immutable audit log
  PERFORM public.log_admin_action(
    'PROMOTE_ADMIN',
    'profile',
    target_user_id::text,
    jsonb_build_object(
      'target_email', v_target_profile.email,
      'target_name', v_target_profile.full_name,
      'new_role', 'admin'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User promoted to Admin successfully',
    'user_id', target_user_id,
    'role', 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Super Admin: Demote Admin to Participant
CREATE OR REPLACE FUNCTION public.demote_admin(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_target_profile RECORD;
BEGIN
  -- 1. Strictly enforce that ONLY Super Admin can demote
  IF NOT public.check_is_super_admin(v_caller) THEN
    RAISE EXCEPTION 'Access Denied: Only the verified Super Admin can revoke administrator access.';
  END IF;

  -- 2. Cannot demote self or another Super Admin
  IF public.check_is_super_admin(target_user_id) THEN
    RAISE EXCEPTION 'Action Prohibited: The Super Admin role cannot be demoted or revoked.';
  END IF;

  -- 3. Verify target user exists
  SELECT * INTO v_target_profile FROM public.profiles WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found.';
  END IF;

  -- 4. Update profiles table
  UPDATE public.profiles 
  SET role = 'participant', updated_at = now() 
  WHERE id = target_user_id;

  -- 5. Remove from app_admins table
  DELETE FROM public.app_admins WHERE user_id = target_user_id;

  -- 6. Record in immutable audit log
  PERFORM public.log_admin_action(
    'DEMOTE_ADMIN',
    'profile',
    target_user_id::text,
    jsonb_build_object(
      'target_email', v_target_profile.email,
      'target_name', v_target_profile.full_name,
      'new_role', 'participant'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Admin privileges revoked successfully',
    'user_id', target_user_id,
    'role', 'participant'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- One-Time Database Setup: Designate verified Super Admin by Email
-- To be executed safely in Supabase SQL Editor by project owner
CREATE OR REPLACE FUNCTION public.set_super_admin_by_email(p_email TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT * INTO v_user FROM public.profiles WHERE lower(email) = lower(trim(p_email));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No user account found with email: %', p_email;
  END IF;

  -- Grant super admin in profiles
  UPDATE public.profiles
  SET role = 'super_admin', is_super_admin = true, updated_at = now()
  WHERE id = v_user.id;

  -- Grant super admin in app_admins
  INSERT INTO public.app_admins (user_id, role, is_super_admin, promoted_by, updated_at)
  VALUES (v_user.id, 'super_admin', true, v_user.id, now())
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    is_super_admin = true,
    updated_at = now();

  -- Record audit
  INSERT INTO public.audit_logs (actor_id, actor_email, actor_role, action, entity_type, entity_id, details)
  VALUES (v_user.id, v_user.email, 'super_admin', 'INITIALIZE_SUPER_ADMIN', 'profile', v_user.id::text, jsonb_build_object('method', 'sql_function'));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Super Admin established successfully',
    'user_id', v_user.id,
    'email', v_user.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security Hardening: Revoke execution from public PostgREST API (anon & regular users)
-- This function can ONLY be executed inside the Supabase Dashboard SQL Editor by the project administrator
REVOKE EXECUTE ON FUNCTION public.set_super_admin_by_email(TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION public.set_super_admin_by_email(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_super_admin_by_email(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_super_admin_by_email(TEXT) TO postgres, service_role;

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- SDC MEMBERS POLICIES
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

-- AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.check_is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.check_is_admin() OR auth.role() = 'authenticated');

-- STRICTLY NO UPDATE OR DELETE ON AUDIT LOGS (Immutable ledger)
DROP POLICY IF EXISTS "No updates on audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No deletes on audit logs" ON public.audit_logs;

-- APP_ADMINS POLICIES
DROP POLICY IF EXISTS "Admins can view admin list" ON public.app_admins;
CREATE POLICY "Admins can view admin list"
  ON public.app_admins FOR SELECT
  USING (public.check_is_admin() OR auth.uid() = user_id);

-- STORAGE POLICIES FOR SDC-MEMBERS BUCKET
DROP POLICY IF EXISTS "SDC member photos are publicly readable" ON storage.objects;
CREATE POLICY "SDC member photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sdc-members');

DROP POLICY IF EXISTS "Admins can upload member photos" ON storage.objects;
CREATE POLICY "Admins can upload member photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sdc-members' AND (public.check_is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins can update member photos" ON storage.objects;
CREATE POLICY "Admins can update member photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sdc-members' AND public.check_is_admin());

DROP POLICY IF EXISTS "Admins can delete member photos" ON storage.objects;
CREATE POLICY "Admins can delete member photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sdc-members' AND public.check_is_admin());

-- ----------------------------------------------------------------------------
-- 8. INITIAL SEED FOR SDC MEMBERS (Official hierarchy)
-- ----------------------------------------------------------------------------
INSERT INTO public.sdc_members (name, category, role_title, bio, sort_order, is_active)
VALUES
  ('Faculty Coordinator', 'faculty_coordinator', 'Faculty Advisor & Convener, SDC', 'Guiding student developers at Rajkiya Engineering College, Banda towards excellence in open innovation.', 1, true),
  ('Student Mentor Lead', 'mentor', 'Technical & Systems Architecture Mentor', 'Mentoring HackFest participants in distributed systems, full-stack development, and competitive problem-solving.', 1, true),
  ('Lead Student Coordinator', 'coordinator', 'President & Lead Coordinator, SDC', 'Directing operations, team logistics, and event execution for HackFest 3.0.', 1, true)
ON CONFLICT DO NOTHING;
