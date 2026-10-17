import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const teamService = {
  // Create a team with leader
  async createTeam({ name, competitionId, userId }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Verify authenticated session
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      throw new Error('Authentication required. You must be signed in to create a team.');
    }
    const verifiedUserId = authUser.id;

    // 2. Validate team name
    const trimmedName = (name || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error('Please enter a team name (minimum 2 characters).');
    }
    if (trimmedName.length > 50) {
      throw new Error('Team name must not exceed 50 characters.');
    }

    // 3. Resolve competition ID if passed as slug (e.g. 'hackathon')
    let resolvedCompId = competitionId;
    let compName = 'this competition';
    if (competitionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(competitionId)) {
      try {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id, name, registration_open, status')
          .eq('slug', competitionId.toLowerCase())
          .maybeSingle();
        if (comp?.id) {
          resolvedCompId = comp.id;
          compName = comp.name;
          if (comp.registration_open === false || comp.status !== 'active') {
            throw new Error(`Registration for ${comp.name} is currently closed.`);
          }
        }
      } catch (err) {
        if (err.message?.includes('closed')) throw err;
      }
    } else if (resolvedCompId) {
      try {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id, name, registration_open, status')
          .eq('id', resolvedCompId)
          .maybeSingle();
        if (comp?.name) {
          compName = comp.name;
          if (comp.registration_open === false || comp.status !== 'active') {
            throw new Error(`Registration for ${comp.name} is currently closed.`);
          }
        }
      } catch (err) {
        if (err.message?.includes('closed')) throw err;
      }
    }

    // 4. STRICT VALIDATION: Check if user already belongs to ANY team in this competition
    const { data: existingMemberships } = await supabase
      .from('team_members')
      .select('id, role, team:teams!inner(id, name, competition_id)')
      .eq('user_id', verifiedUserId)
      .eq('team.competition_id', resolvedCompId);

    if (existingMemberships && existingMemberships.length > 0) {
      const existingTeam = existingMemberships[0].team;
      throw new Error(
        `You are already participating in ${compName} as a ${existingMemberships[0].role} of team "${existingTeam.name}". A participant can only join or create one team per event.`
      );
    }

    // 5. STRICT VALIDATION: Check if user already holds a confirmed registration for this competition with another team
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id, team_id, team:teams(id, name)')
      .eq('user_id', verifiedUserId)
      .eq('competition_id', resolvedCompId)
      .maybeSingle();

    if (existingReg?.team_id) {
      throw new Error(
        `You are already registered under team "${existingReg.team?.name || 'another team'}" for ${compName}.`
      );
    }

    // 6. Generate readable unique code and insert team
    const code = 'HF3-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({
        name: trimmedName,
        code,
        leader_id: verifiedUserId,
        competition_id: resolvedCompId,
      })
      .select()
      .single();

    if (teamErr) throw teamErr;

    // 7. Insert leader into team_members
    const { error: memberErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: verifiedUserId,
        role: 'leader',
      });

    if (memberErr) throw memberErr;

    // 8. Automatically synchronize/upsert registrations table for the leader
    try {
      await supabase
        .from('registrations')
        .upsert({
          user_id: verifiedUserId,
          competition_id: resolvedCompId,
          team_id: team.id,
          registration_status: 'confirmed',
        }, { onConflict: 'user_id,competition_id' });
    } catch (syncErr) {
      console.warn('Note: registration upsert on team create:', syncErr);
    }

    return {
      team_id: team.id,
      code: team.code,
      name: team.name,
      competition_id: resolvedCompId,
    };
  },

  // Join a team by code
  async joinTeam({ code, userId }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Verify authenticated session
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      throw new Error('Authentication required. You must be signed in to join a team.');
    }
    const verifiedUserId = authUser.id;
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
      throw new Error('Please enter a valid team invite code.');
    }

    // 2. Fetch team by code
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select('*, competition:competitions(*)')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (teamErr || !team) {
      throw new Error(`Invalid team code "${cleanCode}". Please verify the code with your team leader.`);
    }

    // 3. Check competition registration status
    if (team.competition && (team.competition.registration_open === false || team.competition.status !== 'active')) {
      throw new Error(`Registration for ${team.competition.name || 'this competition'} is currently closed.`);
    }

    // 4. Check if user is ALREADY in this exact team
    const { data: existingInThisTeam } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('team_id', team.id)
      .eq('user_id', verifiedUserId)
      .maybeSingle();

    if (existingInThisTeam) {
      return {
        status: 'already_joined',
        team_id: team.id,
        name: team.name,
        competition_id: team.competition_id,
      };
    }

    // 5. STRICT VALIDATION: Check if user is ALREADY in ANY OTHER team for this competition
    const { data: otherTeamMemberships } = await supabase
      .from('team_members')
      .select('id, role, team:teams!inner(id, name, competition_id)')
      .eq('user_id', verifiedUserId)
      .eq('team.competition_id', team.competition_id)
      .neq('team_id', team.id);

    if (otherTeamMemberships && otherTeamMemberships.length > 0) {
      const otherTeam = otherTeamMemberships[0].team;
      throw new Error(
        `You are already a member of team "${otherTeam.name}" in ${team.competition?.name || 'this competition'}. One participant/email cannot join multiple teams in the same event.`
      );
    }

    // 6. Check if user is already registered for this competition under another team
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id, team_id, team:teams(id, name)')
      .eq('user_id', verifiedUserId)
      .eq('competition_id', team.competition_id)
      .maybeSingle();

    if (existingReg?.team_id && existingReg.team_id !== team.id) {
      throw new Error(
        `You are already registered with team "${existingReg.team?.name || 'another team'}" for this competition. Leave that team first if you want to join a new one.`
      );
    }

    // 7. Check team capacity limit
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    const maxLimit = team.competition?.max_team_size || 4;
    if ((count || 0) >= maxLimit) {
      throw new Error(`Team "${team.name}" is already full (maximum ${maxLimit} members).`);
    }

    // 8. Insert member
    const { error: insertErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: verifiedUserId,
        role: 'member',
      });

    if (insertErr) {
      if (insertErr.code === '23505') {
        return { status: 'already_joined', team_id: team.id, name: team.name };
      }
      throw insertErr;
    }

    // 9. Automatically synchronize/upsert registrations table for this user
    try {
      await supabase
        .from('registrations')
        .upsert({
          user_id: verifiedUserId,
          competition_id: team.competition_id,
          team_id: team.id,
          registration_status: 'confirmed',
        }, { onConflict: 'user_id,competition_id' });
    } catch (syncErr) {
      console.warn('Note: registration upsert on join team:', syncErr);
    }

    return {
      status: 'success',
      team_id: team.id,
      name: team.name,
      competition_id: team.competition_id,
    };
  },

  // Add a team member by email (by team leader)
  async addMemberByEmail({ teamId, email, leaderUserId }) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    // 1. Fetch team with competition details
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select('*, competition:competitions(*)')
      .eq('id', teamId)
      .single();

    if (teamErr || !team) throw new Error('Team not found.');

    // Verify leader permission
    if (leaderUserId && team.leader_id !== leaderUserId) {
      throw new Error('Only the team leader can add members.');
    }

    // 2. Check team capacity
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    const maxLimit = team.competition?.max_team_size || 4;
    if ((count || 0) >= maxLimit) {
      throw new Error(`Team is already full (maximum ${maxLimit} members).`);
    }

    // 3. Find user profile with this email
    const { data: targetProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (profileErr || !targetProfile) {
      throw new Error(`No account found with email "${cleanEmail}". Teammate must register/create an account on HackFest first.`);
    }

    // 4. Check if already in this team
    const { data: inThisTeam } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', targetProfile.id)
      .maybeSingle();

    if (inThisTeam) {
      throw new Error(`Participant "${targetProfile.full_name || cleanEmail}" is already in this team.`);
    }

    // 5. STRICT VALIDATION: Check if already in another team for this competition
    const { data: otherTeams } = await supabase
      .from('team_members')
      .select('id, role, team:teams!inner(id, name, competition_id)')
      .eq('user_id', targetProfile.id)
      .eq('team.competition_id', team.competition_id);

    if (otherTeams && otherTeams.length > 0) {
      throw new Error(
        `Participant "${cleanEmail}" is already part of team "${otherTeams[0].team.name}" in this event. 1 email ID can only join one team per event.`
      );
    }

    // 6. Check if already registered under another team or solo
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id, team_id, team:teams(name)')
      .eq('user_id', targetProfile.id)
      .eq('competition_id', team.competition_id)
      .maybeSingle();

    if (existingReg?.team_id && existingReg.team_id !== team.id) {
      throw new Error(`Participant "${cleanEmail}" is already registered with team "${existingReg.team?.name}".`);
    }

    // 7. Insert member
    const { error: insertErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: targetProfile.id,
        role: 'member',
      });

    if (insertErr) throw insertErr;

    // 8. Synchronize registrations
    try {
      await supabase
        .from('registrations')
        .upsert({
          user_id: targetProfile.id,
          competition_id: team.competition_id,
          team_id: team.id,
          registration_status: 'confirmed',
        }, { onConflict: 'user_id,competition_id' });
    } catch {}

    return {
      success: true,
      member: targetProfile,
    };
  },

  // Get user's teams with members and competition details
  async getUserTeams(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data: memberships, error } = await supabase
        .from('team_members')
        .select(`
          role,
          team:teams (
            id,
            name,
            code,
            leader_id,
            competition_id,
            competition:competitions (id, name, slug, max_team_size),
            members:team_members (
              id,
              role,
              joined_at,
              profile:profiles (id, full_name, email, avatar_url, college)
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return (memberships || []).map((m) => ({
        ...m.team,
        userRole: m.role,
      }));
    } catch (err) {
      console.error('Error fetching user teams:', err);
      return [];
    }
  },

  // Leave a team
  async leaveTeam({ teamId, userId }) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;

    // Also remove or unlink registration so user is free to re-join or join another team
    try {
      await supabase
        .from('registrations')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Note: registration delete on leave team:', err);
    }

    return true;
  },
};
