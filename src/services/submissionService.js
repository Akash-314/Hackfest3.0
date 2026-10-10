import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isDeadlineExpired } from '../utils/eventTime';

export const submissionService = {
  // Get submissions for user's team or user
  async getUserSubmissions(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          competition:competitions(id, name, slug),
          team:teams(id, name, code),
          problem_category:problem_categories(id, title, number, theme),
          scores:scores(id, score, comments, criterion:judging_criteria(title, weight))
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching submissions:', err);
      return [];
    }
  },

  // Save or update draft submission
  async saveSubmission({
    id = null,
    userId,
    teamId = null,
    competitionId,
    problemCategoryId = null,
    title,
    description,
    githubUrl,
    demoUrl,
    videoUrl,
    documentUrl,
    status = 'draft',
  }) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

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

    // Enforce submission settings when submitting final project
    if (status === 'submitted') {
      const { data: settings } = await supabase
        .from('event_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settings) {
        if (settings.ppt_submissions_open === false) {
          throw new Error('Project and PPT submissions are currently closed by event administration.');
        }
        if (settings.submission_deadline && isDeadlineExpired(settings.submission_deadline)) {
          throw new Error(`Project submission deadline (${settings.submission_deadline}) has passed.`);
        }
      }
    }

    const payload = {
      user_id: userId,
      team_id: teamId,
      competition_id: resolvedCompId,
      problem_category_id: resolvedProbCatId,
      title,
      description,
      github_url: githubUrl,
      demo_url: demoUrl,
      video_url: videoUrl,
      document_url: documentUrl,
      status,
      submitted_at: status === 'submitted' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { data, error } = await supabase
        .from('submissions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('submissions')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // Upload file to Supabase storage bucket 'submissions'
  async uploadFile(file, path) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.');

    // Check submission settings before accepting file upload
    const { data: settings } = await supabase
      .from('event_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settings) {
      if (settings.ppt_submissions_open === false) {
        throw new Error('PPT submissions are currently closed by event administration.');
      }
      if (settings.submission_deadline && isDeadlineExpired(settings.submission_deadline)) {
        throw new Error(`PPT submission deadline (${settings.submission_deadline}) has passed.`);
      }
    }

    // Validate accepted file types
    const rawAccepted = settings?.accepted_file_types || '.pdf,.pptx,.ppt';
    const allowedExtensions = rawAccepted
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const fileName = (file.name || '').toLowerCase();
    const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!hasValidExt) {
      throw new Error(`Invalid file type "${file.name}". Allowed formats: ${allowedExtensions.join(', ')}`);
    }

    const maxSizeMb = settings?.max_file_size_mb || 25;
    if (file.size > maxSizeMb * 1024 * 1024) {
      throw new Error(`File size exceeds maximum allowed limit of ${maxSizeMb}MB.`);
    }

    const cleanPath = `${Date.now()}_${path.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(cleanPath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(cleanPath);

    return publicUrl;
  },
};
