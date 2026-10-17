import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const teamService = {
  // Create a team with leader
  async createTeam({ name, competitionId, userId, college = 'Rajkiya Engineering College Banda', description = '' }) {
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

    // 4. Check if user already belongs to ANY team in this competition
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

    // 5. Check if user already holds a confirmed registration for this competition with another team
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
        college: college.trim(),
        description: description.trim(),
      })
      .select()
      .single();

    if (teamErr) throw teamErr;

    // Fetch leader profile
    let leaderProfile = null;
    try {
      const { data: lp } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', verifiedUserId)
        .maybeSingle();
      leaderProfile = lp;
    } catch {}

    // 7. Insert leader into team_members with full participant details
    const { error: memberErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: verifiedUserId,
        role: 'leader',
        name: leaderProfile?.full_name || authUser.user_metadata?.full_name || 'Leader',
        email: authUser.email,
        phone: leaderProfile?.phone || null,
        college: leaderProfile?.college || college || 'Rajkiya Engineering College Banda',
        branch: leaderProfile?.branch || null,
        year: leaderProfile?.year || null,
      });

    if (memberErr) console.warn('team_members leader insert note:', memberErr);

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
      college: team.college,
    };
  },

  // Add a team member (by leader or admin), supporting direct details without requiring pre-registration
  async addMember({ teamId, name, email, phone = '', college = '', branch = '', year = '', role = 'member', leaderUserId = null }) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid teammate email address.');
    }
    if (!cleanName) {
      throw new Error('Please enter the teammate full name.');
    }

    // 1. Fetch team with competition details
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select('*, competition:competitions(*)')
      .eq('id', teamId)
      .single();

    if (teamErr || !team) throw new Error('Team not found.');

    // Verify leader permission if leaderUserId provided
    if (leaderUserId && team.leader_id !== leaderUserId) {
      throw new Error('Only the team leader or an administrator can add members.');
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

    // 3. Find if user profile with this email exists
    let linkedUserId = null;
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, full_name, email, college, phone, branch, year')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (targetProfile?.id) {
      linkedUserId = targetProfile.id;
    }

    // 4. Check if already in this team (by email or user_id)
    let inThisTeamQuery = supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id);

    if (linkedUserId) {
      inThisTeamQuery = inThisTeamQuery.or(`user_id.eq.${linkedUserId},email.ilike.${cleanEmail}`);
    } else {
      inThisTeamQuery = inThisTeamQuery.ilike('email', cleanEmail);
    }

    const { data: inThisTeam } = await inThisTeamQuery.maybeSingle();
    if (inThisTeam) {
      throw new Error(`Participant "${cleanEmail}" is already a member of this team.`);
    }

    // 5. Check if already in another team for this competition
    let otherTeamsQuery = supabase
      .from('team_members')
      .select('id, role, team:teams!inner(id, name, competition_id)')
      .eq('team.competition_id', team.competition_id)
      .neq('team_id', team.id);

    if (linkedUserId) {
      otherTeamsQuery = otherTeamsQuery.or(`user_id.eq.${linkedUserId},email.ilike.${cleanEmail}`);
    } else {
      otherTeamsQuery = otherTeamsQuery.ilike('email', cleanEmail);
    }

    const { data: otherTeams } = await otherTeamsQuery;
    if (otherTeams && otherTeams.length > 0) {
      throw new Error(
        `Participant "${cleanEmail}" is already part of team "${otherTeams[0].team.name}" in this event. 1 email ID can only join one team per event.`
      );
    }

    // 6. Insert member into team_members
    const { data: newMember, error: insertErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: linkedUserId,
        role: role || 'member',
        name: cleanName || targetProfile?.full_name || 'Member',
        email: cleanEmail,
        phone: phone || targetProfile?.phone || null,
        college: college || targetProfile?.college || team.college || 'Rajkiya Engineering College Banda',
        branch: branch || targetProfile?.branch || null,
        year: year || targetProfile?.year || null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // 7. Synchronize registrations if profile exists
    if (linkedUserId) {
      try {
        await supabase
          .from('registrations')
          .upsert({
            user_id: linkedUserId,
            competition_id: team.competition_id,
            team_id: team.id,
            registration_status: 'confirmed',
          }, { onConflict: 'user_id,competition_id' });
      } catch {}
    }

    return {
      success: true,
      member: newMember,
    };
  },

  // Legacy wrapper for backwards compatibility
  async addMemberByEmail({ teamId, email, leaderUserId, name = '' }) {
    return this.addMember({
      teamId,
      email,
      name: name || email.split('@')[0],
      leaderUserId,
    });
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
            college,
            description,
            leader_id,
            competition_id,
            competition:competitions (id, name, slug, max_team_size, min_team_size),
            members:team_members (
              id,
              user_id,
              role,
              name,
              email,
              phone,
              college,
              branch,
              year,
              joined_at,
              profile:profiles (id, full_name, email, avatar_url, college, phone, branch, year)
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (memberships || [])
        .filter((m) => m.team)
        .map((m) => {
          const rawMembers = m.team.members || [];
          const normalizedMembers = rawMembers.map((mem) => ({
            id: mem.id,
            user_id: mem.user_id,
            role: mem.role || 'member',
            name: mem.name || mem.profile?.full_name || 'Team Member',
            email: mem.email || mem.profile?.email || 'N/A',
            phone: mem.phone || mem.profile?.phone || '',
            college: mem.college || mem.profile?.college || m.team.college || 'Rajkiya Engineering College Banda',
            branch: mem.branch || mem.profile?.branch || '',
            year: mem.year || mem.profile?.year || '',
            joined_at: mem.joined_at,
            profile: mem.profile || null,
          }));

          return {
            ...m.team,
            userRole: m.role,
            members: normalizedMembers,
          };
        });
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

  // Remove a member from team (by leader or admin)
  async removeMember({ teamId, memberId, leaderUserId = null }) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    // Fetch member
    const { data: member, error: memErr } = await supabase
      .from('team_members')
      .select('*, team:teams(*)')
      .eq('id', memberId)
      .single();

    if (memErr || !member) throw new Error('Team member not found.');

    if (leaderUserId && member.team?.leader_id !== leaderUserId) {
      throw new Error('Only the team leader or an administrator can remove members.');
    }

    if (member.role === 'leader') {
      throw new Error('Cannot remove the team leader. Please reassign the team leader first.');
    }

    // Delete member row
    const { error: delErr } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (delErr) throw delErr;

    // If member has linked user_id, remove from registrations
    if (member.user_id) {
      try {
        await supabase
          .from('registrations')
          .delete()
          .eq('team_id', teamId)
          .eq('user_id', member.user_id);
      } catch {}
    }

    return true;
  },

  // --------------------------------------------------------------------------
  // FULL ADMIN CRUD OPERATIONS FOR TEAMS & ROSTERS
  // --------------------------------------------------------------------------
  async getAllTeamsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          competition:competitions (id, name, slug, max_team_size, min_team_size),
          leader:profiles!teams_leader_id_fkey (id, full_name, email, phone, college),
          members:team_members (
            id,
            user_id,
            role,
            name,
            email,
            phone,
            college,
            branch,
            year,
            joined_at,
            profile:profiles (id, full_name, email, phone, college, branch, year)
          ),
          registrations:registrations (
            id,
            registration_status,
            document_url,
            document_name,
            document_type,
            document_size,
            document_path,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Teams with relations query fallback:', error.message);
        const { data: fallbackData } = await supabase
          .from('teams')
          .select(`
            *,
            competition:competitions (id, name, slug),
            members:team_members (*)
          `)
          .order('created_at', { ascending: false });
        return fallbackData || [];
      }

      // Normalize members
      return (data || []).map((t) => {
        const rawMembers = t.members || [];
        const normalizedMembers = rawMembers.map((mem) => ({
          id: mem.id,
          user_id: mem.user_id,
          role: mem.role || 'member',
          name: mem.name || mem.profile?.full_name || 'Member',
          email: mem.email || mem.profile?.email || 'N/A',
          phone: mem.phone || mem.profile?.phone || '',
          college: mem.college || mem.profile?.college || t.college || 'Rajkiya Engineering College Banda',
          branch: mem.branch || mem.profile?.branch || '',
          year: mem.year || mem.profile?.year || '',
          joined_at: mem.joined_at,
        }));

        return {
          ...t,
          members: normalizedMembers,
          registration: t.registrations?.[0] || null,
        };
      });
    } catch (err) {
      console.error('Failed to load teams admin:', err);
      return [];
    }
  },

  async updateTeamAdmin(teamId, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    const payload = {
      name: updates.name?.trim(),
      college: updates.college?.trim(),
      description: updates.description?.trim(),
      competition_id: updates.competition_id || undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('teams')
      .update(payload)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTeamAdmin(teamId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    // 1. Delete associated registrations
    await supabase.from('registrations').delete().eq('team_id', teamId).catch(() => {});

    // 2. Delete team members
    await supabase.from('team_members').delete().eq('team_id', teamId).catch(() => {});

    // 3. Delete submissions
    await supabase.from('submissions').delete().eq('team_id', teamId).catch(() => {});

    // 4. Delete team
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) throw error;

    return true;
  },

  async addTeamMemberAdmin(teamId, memberData) {
    return this.addMember({
      teamId,
      name: memberData.name,
      email: memberData.email,
      phone: memberData.phone || '',
      college: memberData.college || '',
      branch: memberData.branch || '',
      year: memberData.year || '',
      role: memberData.role || 'member',
    });
  },

  async updateTeamMemberAdmin(memberId, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    const payload = {
      name: updates.name ? updates.name.trim() : undefined,
      email: updates.email ? updates.email.trim().toLowerCase() : undefined,
      phone: updates.phone !== undefined ? updates.phone.trim() : undefined,
      college: updates.college !== undefined ? updates.college.trim() : undefined,
      branch: updates.branch !== undefined ? updates.branch.trim() : undefined,
      year: updates.year !== undefined ? updates.year.trim() : undefined,
      role: updates.role || undefined,
    };

    const { data, error } = await supabase
      .from('team_members')
      .update(payload)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeTeamMemberAdmin(memberId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    return true;
  },

  async changeTeamLeaderAdmin(teamId, newLeaderMemberId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    // Fetch the new leader member record
    const { data: newLeaderMem, error: memErr } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', newLeaderMemberId)
      .eq('team_id', teamId)
      .single();

    if (memErr || !newLeaderMem) {
      throw new Error('Selected member not found in this team.');
    }

    // Step 1: Set previous leader(s) role to 'member'
    await supabase
      .from('team_members')
      .update({ role: 'member' })
      .eq('team_id', teamId)
      .eq('role', 'leader');

    // Step 2: Set target member role to 'leader'
    await supabase
      .from('team_members')
      .update({ role: 'leader' })
      .eq('id', newLeaderMemberId);

    // Step 3: Update leader_id on teams table if member has a linked user_id
    if (newLeaderMem.user_id) {
      await supabase
        .from('teams')
        .update({
          leader_id: newLeaderMem.user_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId);
    }

    return true;
  },
};
