import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const teamService = {
  // Create a team with leader
  async createTeam({ name, competitionId, userId }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // Resolve competition ID if passed as slug (e.g. 'hackathon')
    let resolvedCompId = competitionId;
    if (competitionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(competitionId)) {
      try {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id')
          .eq('slug', competitionId.toLowerCase())
          .maybeSingle();
        if (comp?.id) {
          resolvedCompId = comp.id;
        }
      } catch {
        // Continue with original identifier
      }
    }

    // Try atomic RPC if available
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_team_with_leader', {
        p_name: name,
        p_competition_id: resolvedCompId,
        p_user_id: userId,
      });

      if (!rpcError && rpcData) {
        return rpcData;
      }
    } catch {
      // Fallback to direct table transactions
    }

    // Fallback direct table insertion
    const code = 'HF3-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({
        name,
        code,
        leader_id: userId,
        competition_id: resolvedCompId,
      })
      .select()
      .single();

    if (teamErr) throw teamErr;

    // Insert leader as member
    const { error: memberErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'leader',
      });

    if (memberErr) throw memberErr;

    return {
      team_id: team.id,
      code: team.code,
      name: team.name,
    };
  },

  // Join a team by code
  async joinTeam({ code, userId }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('join_team_by_code', {
        p_code: code.trim(),
        p_user_id: userId,
      });

      if (!rpcError && rpcData) {
        return rpcData;
      }
      if (rpcError) throw rpcError;
    } catch (err) {
      // If RPC is missing, use direct fallback
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .select('*, competition:competitions(*)')
        .ilike('code', code.trim())
        .single();

      if (teamErr || !team) throw new Error('Invalid team code.');

      // Check member count
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id);

      const maxLimit = team.competition?.max_team_size || 4;
      if ((count || 0) >= maxLimit) {
        throw new Error(`Team is already full (maximum ${maxLimit} members).`);
      }

      // Insert member
      const { error: insertErr } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'member',
        });

      if (insertErr) {
        if (insertErr.code === '23505') {
          return { status: 'already_joined', team_id: team.id, name: team.name };
        }
        throw insertErr;
      }

      return {
        status: 'success',
        team_id: team.id,
        name: team.name,
        competition_id: team.competition_id,
      };
    }
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
    return true;
  },
};
