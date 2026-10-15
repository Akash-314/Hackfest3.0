import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { isDeadlineExpired } from '../utils/eventTime.js';

export const registrationService = {
  // Register for a competition
  async createRegistration({
    userId,
    competitionId,
    teamId = null,
    problemCategoryId = null,
    experienceLevel = 'intermediate',
    notes = '',
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

    // 5. Check if already registered
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, registration_status')
      .eq('user_id', verifiedUserId)
      .eq('competition_id', resolvedCompId)
      .maybeSingle();

    if (existing) {
      throw new Error('You have already registered for this competition.');
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

    if (error) throw error;
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
