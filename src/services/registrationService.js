import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isDeadlineExpired } from '../utils/eventTime';

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

    // Resolve competition ID if passed as slug
    let resolvedCompId = competitionId;
    if (competitionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(competitionId)) {
      try {
        const { data: comp } = await supabase
          .from('competitions')
          .select('id')
          .eq('slug', competitionId.toLowerCase())
          .maybeSingle();
        if (comp?.id) resolvedCompId = comp.id;
      } catch {
        // Fallback
      }
    }

    // Resolve problem category ID if passed as slug
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

    // Check canonical event settings for registration availability & deadline
    const { data: settings } = await supabase
      .from('event_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settings) {
      if (settings.registration_open === false || settings.registration_status === 'CLOSED') {
        throw new Error('Event registration is currently closed by event administration.');
      }
      if (settings.registration_deadline && isDeadlineExpired(settings.registration_deadline)) {
        throw new Error(`Event registration deadline (${settings.registration_deadline}) has passed.`);
      }
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, registration_status')
      .eq('user_id', userId)
      .eq('competition_id', resolvedCompId)
      .maybeSingle();

    if (existing) {
      throw new Error('You have already registered for this competition.');
    }

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        user_id: userId,
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
