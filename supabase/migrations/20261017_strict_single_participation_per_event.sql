-- ============================================================================
-- HACKFEST 3.0 — DATABASE MIGRATION: STRICT SINGLE PARTICIPATION PER EVENT
-- Student Developer Club, REC Banda
-- Enforces: 1 Email / User = At most 1 Participation per Competition
-- (Neither solo, nor leader, nor member in multiple teams for the same event)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TRIGGER: ENFORCE SINGLE TEAM MEMBERSHIP PER COMPETITION
-- Prevents a user from being inserted into multiple teams for the same competition
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
    -- Check if this user is already in another team for the same competition
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_single_team_membership ON public.team_members;
CREATE TRIGGER trg_enforce_single_team_membership
  BEFORE INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_team_membership();

-- ----------------------------------------------------------------------------
-- 2. HARDEN public.create_team_with_leader RPC
-- Validates that the leader is not already in any team or registered elsewhere for this competition
-- ----------------------------------------------------------------------------
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
  v_existing_team_name TEXT;
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

  IF v_competition.registration_open = false OR v_competition.status != 'active' THEN
    RAISE EXCEPTION 'Registration for % is currently closed.', v_competition.name;
  END IF;

  v_comp_uuid := v_competition.id;

  -- Check if user is already leading or a member of ANY team in this competition
  SELECT t.name INTO v_existing_team_name
  FROM public.team_members tm
  JOIN public.teams t ON tm.team_id = t.id
  WHERE t.competition_id = v_comp_uuid
    AND tm.user_id = p_user_id
  LIMIT 1;

  IF v_existing_team_name IS NOT NULL THEN
    RAISE EXCEPTION 'You already belong to team "%" in this competition. A participant can only join or create one team per event.', v_existing_team_name;
  END IF;

  -- Generate readable unique code: HF3-XXXXXX
  v_team_code := 'HF3-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

  -- Insert team
  INSERT INTO public.teams (name, code, leader_id, competition_id)
  VALUES (p_name, v_team_code, p_user_id, v_comp_uuid)
  RETURNING id INTO v_team_id;

  -- Insert team leader membership
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team_id, p_user_id, 'leader');

  -- Upsert registration record for leader
  INSERT INTO public.registrations (user_id, competition_id, team_id, registration_status)
  VALUES (p_user_id, v_comp_uuid, v_team_id, 'confirmed')
  ON CONFLICT (user_id, competition_id) 
  DO UPDATE SET team_id = v_team_id, registration_status = 'confirmed';

  RETURN jsonb_build_object(
    'team_id', v_team_id,
    'code', v_team_code,
    'name', p_name,
    'competition_id', v_comp_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. HARDEN public.join_team_by_code RPC
-- Validates team capacity, existing team memberships, and syncs registration
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_team_by_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_team RECORD;
  v_competition RECORD;
  v_member_count INT;
  v_other_team_name TEXT;
BEGIN
  -- Find team
  SELECT * INTO v_team FROM public.teams WHERE upper(code) = upper(trim(p_code));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid team code: %', p_code;
  END IF;

  -- Fetch competition rules
  SELECT * INTO v_competition FROM public.competitions WHERE id = v_team.competition_id;
  IF v_competition.registration_open = false OR v_competition.status != 'active' THEN
    RAISE EXCEPTION 'Registration for % is currently closed.', v_competition.name;
  END IF;

  -- Check if user is already in THIS team
  IF EXISTS (SELECT 1 FROM public.team_members WHERE team_id = v_team.id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object(
      'status', 'already_joined',
      'team_id', v_team.id,
      'name', v_team.name,
      'competition_id', v_team.competition_id
    );
  END IF;

  -- Check if user is already in ANY OTHER team in this competition
  SELECT t.name INTO v_other_team_name
  FROM public.team_members tm
  JOIN public.teams t ON tm.team_id = t.id
  WHERE t.competition_id = v_team.competition_id
    AND tm.user_id = p_user_id
    AND tm.team_id != v_team.id
  LIMIT 1;

  IF v_other_team_name IS NOT NULL THEN
    RAISE EXCEPTION 'You are already a member of team "%" in this competition. One participant / email can only join one team per event.', v_other_team_name;
  END IF;

  -- Count current members
  SELECT count(*) INTO v_member_count FROM public.team_members WHERE team_id = v_team.id;

  IF v_member_count >= v_competition.max_team_size THEN
    RAISE EXCEPTION 'Team "%" is full (Maximum % members)', v_team.name, v_competition.max_team_size;
  END IF;

  -- Insert member
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team.id, p_user_id, 'member');

  -- Upsert registration record for this user in this competition
  INSERT INTO public.registrations (user_id, competition_id, team_id, registration_status)
  VALUES (p_user_id, v_team.competition_id, v_team.id, 'confirmed')
  ON CONFLICT (user_id, competition_id)
  DO UPDATE SET team_id = v_team.id, registration_status = 'confirmed';

  RETURN jsonb_build_object(
    'status', 'success',
    'team_id', v_team.id,
    'name', v_team.name,
    'competition_id', v_team.competition_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
