import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { isDeadlineExpired } from '../utils/eventTime.js';

export const registrationService = {
  // Check if a user ID or email is already participating in a competition (as individual or in a team)
  async checkUserParticipation({ userId = null, email = null, competitionId }) {
    if (!isSupabaseConfigured || (!userId && !email) || !competitionId) {
      return { isParticipating: false, reason: null, message: null };
    }

    try {
      // 1. Resolve competition UUID & human-readable name
      let resolvedCompId = competitionId;
      let compName = 'this competition';
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(competitionId)) {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id, name')
          .eq('slug', competitionId.toLowerCase())
          .maybeSingle();
        if (comp?.id) {
          resolvedCompId = comp.id;
          compName = comp.name;
        }
      } else {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id, name')
          .eq('id', competitionId)
          .maybeSingle();
        if (comp?.name) compName = comp.name;
      }

      // Collect user IDs to check (both userId and profile IDs matching email)
      const targetUserIds = new Set();
      if (userId) targetUserIds.add(userId);

      const cleanEmail = email ? email.trim().toLowerCase() : null;
      if (cleanEmail) {
        // Query profiles with this email
        const { data: matchedProfiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .ilike('email', cleanEmail);
        if (matchedProfiles?.length > 0) {
          matchedProfiles.forEach((p) => targetUserIds.add(p.id));
        }
      }

      const userIdsList = Array.from(targetUserIds);

      // Check 1: Existing registrations table entry
      if (userIdsList.length > 0) {
        const { data: regList } = await supabase
          .from('registrations')
          .select('id, user_id, team_id, registration_status, team:teams(id, name, code)')
          .eq('competition_id', resolvedCompId)
          .in('user_id', userIdsList);

        if (regList && regList.length > 0) {
          const activeReg = regList.find((r) => r.registration_status !== 'cancelled' && r.registration_status !== 'rejected') || regList[0];
          return {
            isParticipating: true,
            reason: 'already_registered',
            teamId: activeReg.team_id,
            teamName: activeReg.team?.name || null,
            competitionName: compName,
            message: activeReg.team?.name
              ? `This account/email is already registered for ${compName} under team "${activeReg.team.name}". 1 email ID can only participate once per event.`
              : `This account/email is already registered for ${compName}. 1 email ID can only participate once per event.`,
          };
        }
      }

      // Check 2: Existing team membership (leader or member) in teams of this competition
      if (userIdsList.length > 0) {
        const { data: teamMemberships } = await supabase
          .from('team_members')
          .select(`
            id,
            role,
            team:teams!inner (
              id,
              name,
              code,
              competition_id
            )
          `)
          .in('user_id', userIdsList)
          .eq('team.competition_id', resolvedCompId);

        if (teamMemberships && teamMemberships.length > 0) {
          const membership = teamMemberships[0];
          return {
            isParticipating: true,
            reason: 'already_in_team',
            teamId: membership.team.id,
            teamName: membership.team.name,
            teamRole: membership.role,
            competitionName: compName,
            message: `This account/email is already a ${membership.role} in team "${membership.team.name}" for ${compName}. A participant can only join one team per event.`,
          };
        }
      }

      return { isParticipating: false, reason: null, message: null };
    } catch (err) {
      console.warn('Error checking user participation:', err);
      return { isParticipating: false, reason: null, message: null };
    }
  },

  // Register for a competition
  async createRegistration({
    userId,
    competitionId,
    teamId = null,
    problemCategoryId = null,
    experienceLevel = 'intermediate',
    notes = '',
    email = null,
  }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Mandatory authenticated session check directly from Supabase auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      throw new Error('Authentication required. You must have an active, verified account session to register for an event. Please log in first.');
    }
    const verifiedUserId = authUser.id;
    const cleanEmail = (email || authUser.email || '').trim().toLowerCase();

    // 2. Resolve competition ID if passed as slug and verify competition status
    let resolvedCompId = competitionId;
    let targetComp = null;
    if (competitionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(competitionId)) {
      try {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id, name, registration_open, status')
          .eq('slug', competitionId.toLowerCase())
          .maybeSingle();
        if (comp?.id) {
          resolvedCompId = comp.id;
          targetComp = comp;
        }
      } catch {
        // Fallback
      }
    } else if (resolvedCompId) {
      try {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id, name, registration_open, status')
          .eq('id', resolvedCompId)
          .maybeSingle();
        if (comp) targetComp = comp;
      } catch {
        // Fallback
      }
    }

    if (targetComp) {
      if (targetComp.registration_open === false || targetComp.status !== 'active') {
        throw new Error(`Registration for ${targetComp.name || 'this competition'} is currently closed.`);
      }
    }

    // 3. Resolve problem category ID if passed as slug
    let resolvedProbCatId = problemCategoryId;
    if (problemCategoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(problemCategoryId)) {
      try {
        const { data: cat } = await supabase
          .from('problem_categories')
          .select('id')
          .eq('slug', problemCategoryId.toLowerCase())
          .maybeSingle();
        if (cat?.id) resolvedProbCatId = cat.id;
      } catch {
        // Fallback
      }
    }

    // 4. Check canonical event settings for registration availability & deadline
    const { data: settings } = await supabase
      .from('event_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settings) {
      const isRegOpen = settings.registration_open !== undefined
        ? settings.registration_open
        : (settings.registration_status !== 'CLOSED');

      if (!isRegOpen || settings.registration_status === 'CLOSED') {
        throw new Error('Event registration is currently closed by event administration.');
      }
      if (settings.registration_deadline && isDeadlineExpired(settings.registration_deadline)) {
        throw new Error(`Event registration deadline (${settings.registration_deadline}) has passed.`);
      }
    }

    // 5. Strict Single Participation Check (1 Email = 1 Participation per event)
    const participation = await this.checkUserParticipation({
      userId: verifiedUserId,
      email: cleanEmail,
      competitionId: resolvedCompId,
    });

    if (participation.isParticipating) {
      // If user is already registered for this exact teamId, return that registration gracefully
      if (teamId && participation.teamId === teamId) {
        const { data: existingReg } = await supabase
          .from('registrations')
          .select(`
            *,
            competition:competitions(id, name, slug),
            team:teams(id, name, code),
            problem_category:problem_categories(id, title, number, theme)
          `)
          .eq('user_id', verifiedUserId)
          .eq('competition_id', resolvedCompId)
          .maybeSingle();
        if (existingReg) return existingReg;
      }

      throw new Error(
        participation.message ||
        `You (or email ${cleanEmail}) are already participating in ${targetComp?.name || 'this competition'}. 1 email ID can only participate once per event.`
      );
    }

    // 6. Insert verified registration record
    const { data, error } = await supabase
      .from('registrations')
      .insert({
        user_id: verifiedUserId,
        competition_id: resolvedCompId,
        team_id: teamId,
        problem_category_id: resolvedProbCatId,
        registration_status: 'confirmed',
        experience_level: experienceLevel,
        notes: notes,
      })
      .select(`
        *,
        competition:competitions(id, name, slug),
        team:teams(id, name, code),
        problem_category:problem_categories(id, title, number, theme)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('You are already registered for this competition. 1 registration per participant is allowed.');
      }
      throw error;
    }
    return data;
  },

  // Get all registrations for a user
  async getUserRegistrations(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          competition:competitions (id, name, slug, duration, format),
          team:teams (id, name, code, members:team_members(id, user_id)),
          problem_category:problem_categories (id, title, number, theme)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching registrations:', err);
      return [];
    }
  },
};
