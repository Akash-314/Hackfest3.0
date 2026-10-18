-- ============================================================================
-- HACKFEST 3.0 — ATOMIC ADMIN TEAM DELETION & UPDATED RLS POLICIES
-- Student Developer Club, REC Banda
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ATOMIC RPC FUNCTION: delete_team_admin
-- Safely deletes a team and its dependent records (scores, submissions,
-- registrations, team members, team) in a single transaction.
-- Returns details of deleted entities and storage paths for file cleanup.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_team_admin(p_team_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_team RECORD;
  v_sub_count INT := 0;
  v_reg_count INT := 0;
  v_mem_count INT := 0;
  v_doc_paths TEXT[];
  v_sub_ids UUID[];
BEGIN
  -- 1. Authorization: caller must be Admin, Organizer, Super Admin, or the Team Leader
  IF NOT (
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer', 'super_admin')
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM public.teams WHERE id = p_team_id AND leader_id = auth.uid()) THEN
      RAISE EXCEPTION 'Access denied. You do not have administrative permission to delete this team.';
    END IF;
  END IF;

  -- 2. Fetch team
  SELECT * INTO v_team FROM public.teams WHERE id = p_team_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found with ID: %', p_team_id;
  END IF;

  -- 3. Collect storage paths for presentation decks before deleting rows
  SELECT array_agg(DISTINCT document_path) INTO v_doc_paths
  FROM public.registrations
  WHERE team_id = p_team_id AND document_path IS NOT NULL AND document_path != '';

  -- 4. Delete scores for this team's submissions
  SELECT array_agg(id) INTO v_sub_ids FROM public.submissions WHERE team_id = p_team_id;
  IF v_sub_ids IS NOT NULL AND array_length(v_sub_ids, 1) > 0 THEN
    DELETE FROM public.scores WHERE submission_id = ANY(v_sub_ids);
  END IF;

  -- 5. Delete submissions
  DELETE FROM public.submissions WHERE team_id = p_team_id;
  GET DIAGNOSTICS v_sub_count = ROW_COUNT;

  -- 6. Delete registrations belonging to this team
  DELETE FROM public.registrations WHERE team_id = p_team_id;
  GET DIAGNOSTICS v_reg_count = ROW_COUNT;

  -- 7. Delete team members
  DELETE FROM public.team_members WHERE team_id = p_team_id;
  GET DIAGNOSTICS v_mem_count = ROW_COUNT;

  -- 8. Delete the team itself
  DELETE FROM public.teams WHERE id = p_team_id;

  -- 9. Log admin audit action if helper function exists
  BEGIN
    PERFORM public.log_admin_action('DELETE_TEAM', 'teams', p_team_id::text, jsonb_build_object(
      'team_name', v_team.name,
      'team_code', v_team.code,
      'deleted_members', v_mem_count,
      'deleted_registrations', v_reg_count,
      'deleted_submissions', v_sub_count
    ));
  EXCEPTION WHEN OTHERS THEN
    -- Continue if log_admin_action is not present
  END;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', p_team_id,
    'team_name', v_team.name,
    'deleted_members', v_mem_count,
    'deleted_registrations', v_reg_count,
    'deleted_submissions', v_sub_count,
    'storage_paths', COALESCE(v_doc_paths, ARRAY[]::TEXT[])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_team_admin(UUID) TO authenticated, anon;

-- ----------------------------------------------------------------------------
-- 2. UPDATE ROW LEVEL SECURITY DELETE POLICIES
-- Ensure check_is_admin() and super_admin are included in all delete policies
-- ----------------------------------------------------------------------------

-- TEAMS
DROP POLICY IF EXISTS "Leaders or organizers can delete teams" ON public.teams;
CREATE POLICY "Leaders or organizers can delete teams"
  ON public.teams FOR DELETE USING (
    auth.uid() = leader_id OR
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer', 'super_admin')
  );

-- TEAM MEMBERS
DROP POLICY IF EXISTS "Team leader or admins can delete team members" ON public.team_members;
CREATE POLICY "Team leader or admins can delete team members"
  ON public.team_members FOR DELETE USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()) OR
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer', 'super_admin')
  );

-- REGISTRATIONS
DROP POLICY IF EXISTS "Users or organizers can delete registration" ON public.registrations;
CREATE POLICY "Users or organizers can delete registration"
  ON public.registrations FOR DELETE USING (
    auth.uid() = user_id OR
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer', 'super_admin')
  );

-- SUBMISSIONS
DROP POLICY IF EXISTS "Organizers can delete submissions" ON public.submissions;
CREATE POLICY "Organizers can delete submissions"
  ON public.submissions FOR DELETE USING (
    auth.uid() = user_id OR
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer', 'super_admin')
  );

-- SCORES
DROP POLICY IF EXISTS "Admins can delete scores" ON public.scores;
CREATE POLICY "Admins can delete scores"
  ON public.scores FOR DELETE USING (
    public.check_is_admin() OR
    public.get_current_role() IN ('admin', 'organizer', 'super_admin')
  );

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
