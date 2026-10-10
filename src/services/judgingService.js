import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const judgingService = {
  // Get all submissions available for evaluation
  async getSubmissionsForJudge() {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          competition:competitions(id, name, slug),
          team:teams(id, name, code, members:team_members(id, profile:profiles(full_name))),
          problem_category:problem_categories(id, title, number, theme),
          scores:scores(*)
        `)
        .in('status', ['submitted', 'under_review', 'evaluated'])
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching judge submissions:', err);
      return [];
    }
  },

  // Get judging criteria for a competition
  async getJudgingCriteria(competitionId) {
    if (!isSupabaseConfigured || !competitionId) return [];

    try {
      const { data, error } = await supabase
        .from('judging_criteria')
        .select('*')
        .eq('competition_id', competitionId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  // Save or update score for a specific submission criterion
  async saveScore({ submissionId, judgeId, criterionId, score, comments }) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    const { data, error } = await supabase
      .from('scores')
      .upsert(
        {
          submission_id: submissionId,
          judge_id: judgeId,
          criterion_id: criterionId,
          score,
          comments,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'submission_id,judge_id,criterion_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Finalize evaluation for a submission
  async finalizeEvaluation(submissionId) {
    if (!isSupabaseConfigured) return;
    await supabase
      .from('submissions')
      .update({ status: 'evaluated' })
      .eq('id', submissionId);
  },
};
