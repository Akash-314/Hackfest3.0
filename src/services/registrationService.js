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
              ? `This participant (${cleanEmail || 'account'}) is already registered for ${compName} under team "${activeReg.team.name}".`
              : `This participant (${cleanEmail || 'account'}) is already registered for ${compName}.`,
          };
        }
      }

      // Check 2: Existing team membership by user_id
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
            message: `This participant (${cleanEmail || 'account'}) is already a ${membership.role} in team "${membership.team.name}" for ${compName}.`,
          };
        }
      }

      // Check 3: Existing team membership by direct email in team_members
      if (cleanEmail) {
        const { data: emailMemberships } = await supabase
          .from('team_members')
          .select(`
            id,
            role,
            email,
            name,
            team:teams!inner (
              id,
              name,
              code,
              competition_id
            )
          `)
          .ilike('email', cleanEmail)
          .eq('team.competition_id', resolvedCompId);

        if (emailMemberships && emailMemberships.length > 0) {
          const membership = emailMemberships[0];
          return {
            isParticipating: true,
            reason: 'already_in_team',
            teamId: membership.team.id,
            teamName: membership.team.name,
            teamRole: membership.role,
            competitionName: compName,
            message: `Participant "${cleanEmail}" is already a member of team "${membership.team.name}" in ${compName}.`,
          };
        }
      }

      return { isParticipating: false, reason: null, message: null };
    } catch (err) {
      console.warn('Error checking user participation:', err);
      return { isParticipating: false, reason: null, message: null };
    }
  },

  // Check multiple participants (leader + teammates) simultaneously
  async checkMultipleParticipants({ emails = [], competitionId }) {
    const results = [];
    for (const rawEmail of emails) {
      const email = (rawEmail || '').trim().toLowerCase();
      if (!email) continue;
      const res = await this.checkUserParticipation({ email, competitionId });
      if (res.isParticipating) {
        results.push({ email, ...res });
      }
    }
    return results;
  },

  // Upload presentation/synopsis document to Supabase storage bucket 'submissions'
  async uploadRegistrationDocument(file, pathPrefix = 'registrations') {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    if (!file) return null;

    const fileName = (file.name || '').toLowerCase();
    const allowedExtensions = ['.pdf', '.pptx', '.ppt'];
    const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (!hasValidExt) {
      throw new Error(`Invalid document format "${file.name}". Please upload a PPT, PPTX, or PDF file.`);
    }

    const maxSizeMb = 25;
    if (file.size > maxSizeMb * 1024 * 1024) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${maxSizeMb}MB.`);
    }

    const cleanExt = fileName.split('.').pop() || 'pdf';
    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);

    const storagePath = `${pathPrefix}/${Date.now()}_${cleanBaseName}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(storagePath);

    return {
      document_url: publicUrl,
      document_name: file.name,
      document_type: cleanExt.toUpperCase(),
      document_size: file.size,
      document_path: storagePath,
    };
  },

  // Consolidated Team Registration (Single-step leader submission with full teammate roster & document)
  async createConsolidatedTeamRegistration({
    userId,
    competitionId,
    teamName,
    teamCollege = 'Rajkiya Engineering College Banda',
    teamDescription = '',
    problemCategoryId = null,
    leaderDetails = {},
    members = [], // array of { name, email, phone, college, branch, year }
    documentFile = null,
    experienceLevel = 'intermediate',
    notes = '',
  }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Mandatory authenticated session check directly from Supabase auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      throw new Error('Authentication required. You must have an active session to register your team. Please log in first.');
    }
    const verifiedUserId = authUser.id;
    const leaderEmail = (leaderDetails.email || authUser.email || '').trim().toLowerCase();

    // 2. Resolve competition ID and status
    let resolvedCompId = competitionId;
    let targetComp = null;
    if (competitionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(competitionId)) {
      const { data: comp } = await supabase
        .from('competitions')
        .select('*')
        .eq('slug', competitionId.toLowerCase())
        .maybeSingle();
      if (comp?.id) {
        resolvedCompId = comp.id;
        targetComp = comp;
      }
    } else if (resolvedCompId) {
      const { data: comp } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', resolvedCompId)
        .maybeSingle();
      if (comp) targetComp = comp;
    }

    if (!targetComp) {
      throw new Error('Target competition could not be identified. Please select a valid event.');
    }

    if (targetComp.registration_open === false || targetComp.status !== 'active') {
      throw new Error(`Registration for ${targetComp.name} is currently closed.`);
    }

    // 3. Check event-wide settings & deadlines
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

    // 4. Validate team size bounds
    const cleanMembers = (members || []).filter((m) => m && (m.name?.trim() || m.email?.trim()));
    const totalTeamSize = 1 + cleanMembers.length; // 1 leader + teammates

    const isTeamComp = targetComp.slug === 'hackathon' || targetComp.slug === 'ideathon';
    const minSize = isTeamComp ? 3 : (targetComp.min_team_size || 1);
    const maxSize = isTeamComp ? 4 : (targetComp.max_team_size || 1);

    if (totalTeamSize < minSize) {
      throw new Error(`${targetComp.name} requires a minimum of ${minSize} members (currently ${totalTeamSize}). Please add teammate details.`);
    }
    if (totalTeamSize > maxSize) {
      throw new Error(`${targetComp.name} allows a maximum of ${maxSize} members (currently ${totalTeamSize}). Please adjust your team roster.`);
    }

    // 5. Validate team name
    const trimmedTeamName = (teamName || '').trim();
    if (!trimmedTeamName || trimmedTeamName.length < 2) {
      throw new Error('Please enter a team name (minimum 2 characters).');
    }
    if (trimmedTeamName.length > 60) {
      throw new Error('Team name must not exceed 60 characters.');
    }

    // 6. Validate member details and check for duplicate emails within the form
    const allEmailsInForm = [leaderEmail];
    cleanMembers.forEach((m, idx) => {
      const mEmail = (m.email || '').trim().toLowerCase();
      const mName = (m.name || '').trim();
      if (!mName) {
        throw new Error(`Teammate #${idx + 1} is missing a full name.`);
      }
      if (!mEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mEmail)) {
        throw new Error(`Teammate "${mName}" has an invalid email address (${mEmail || 'empty'}).`);
      }
      if (allEmailsInForm.includes(mEmail)) {
        throw new Error(`Duplicate email address "${mEmail}" entered for team member "${mName}". Each participant must have a distinct email.`);
      }
      allEmailsInForm.push(mEmail);
    });

    // 7. Check double-participation in DB for EVERY team member (leader + teammates)
    for (const em of allEmailsInForm) {
      const partCheck = await this.checkUserParticipation({
        email: em,
        competitionId: resolvedCompId,
        userId: em === leaderEmail ? verifiedUserId : null,
      });
      if (partCheck.isParticipating) {
        throw new Error(
          partCheck.message ||
          `Participant with email "${em}" is already participating in ${targetComp.name}. 1 email ID can only participate once per event.`
        );
      }
    }

    // 8. Resolve problem category ID if passed as slug
    let resolvedProbCatId = problemCategoryId;
    if (problemCategoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(problemCategoryId)) {
      const { data: cat } = await supabase
        .from('problem_categories')
        .select('id')
        .eq('slug', problemCategoryId.toLowerCase())
        .maybeSingle();
      if (cat?.id) resolvedProbCatId = cat.id;
    }

    // 9. Upload document attachment if provided
    let docMeta = {
      document_url: null,
      document_name: null,
      document_type: null,
      document_size: null,
      document_path: null,
    };

    if (documentFile) {
      try {
        const uploadResult = await this.uploadRegistrationDocument(documentFile, `registrations/${targetComp.slug || 'event'}`);
        if (uploadResult) {
          docMeta = uploadResult;
        }
      } catch (docErr) {
        throw new Error(`Document upload failed: ${docErr.message}`);
      }
    }

    // 10. Generate unique team code and insert team
    const teamCode = 'HF3-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert({
        name: trimmedTeamName,
        code: teamCode,
        leader_id: verifiedUserId,
        competition_id: resolvedCompId,
        college: (teamCollege || leaderDetails.college || 'Rajkiya Engineering College Banda').trim(),
        description: (teamDescription || '').trim(),
      })
      .select()
      .single();

    if (teamErr) {
      throw new Error(`Failed to create team: ${teamErr.message}`);
    }

    // 11. Insert Leader into team_members
    const leaderFullName = (leaderDetails.fullName || authUser.user_metadata?.full_name || 'Team Leader').trim();
    const leaderPhone = (leaderDetails.phone || '').trim();
    const leaderCollege = (leaderDetails.college || teamCollege || 'Rajkiya Engineering College Banda').trim();
    const leaderBranch = (leaderDetails.branch || '').trim();
    const leaderYear = (leaderDetails.year || '').trim();

    const { error: leaderMemberErr } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: verifiedUserId,
        role: 'leader',
        name: leaderFullName,
        email: leaderEmail,
        phone: leaderPhone,
        college: leaderCollege,
        branch: leaderBranch,
        year: leaderYear,
      });

    if (leaderMemberErr) {
      console.warn('Leader team_members insert note:', leaderMemberErr);
    }

    // 12. Insert Teammates into team_members
    for (const mem of cleanMembers) {
      const mEmail = (mem.email || '').trim().toLowerCase();
      const mName = (mem.name || '').trim();
      const mPhone = (mem.phone || '').trim();
      const mCollege = (mem.college || leaderCollege).trim();
      const mBranch = (mem.branch || '').trim();
      const mYear = (mem.year || '').trim();

      // Check if this teammate already has an account in profiles
      let linkedUserId = null;
      try {
        const { data: matchedProfile } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', mEmail)
          .maybeSingle();
        if (matchedProfile?.id) {
          linkedUserId = matchedProfile.id;
        }
      } catch {}

      const { error: memberErr } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: linkedUserId, // linked if exists, null otherwise
          role: 'member',
          name: mName,
          email: mEmail,
          phone: mPhone,
          college: mCollege,
          branch: mBranch,
          year: mYear,
        });

      if (memberErr) {
        console.warn(`Teammate insert note for ${mEmail}:`, memberErr.message);
      }

      // If teammate already has a profile in the app, also register them to link their dashboard
      if (linkedUserId) {
        try {
          await supabase
            .from('registrations')
            .upsert({
              user_id: linkedUserId,
              competition_id: resolvedCompId,
              team_id: team.id,
              problem_category_id: resolvedProbCatId,
              registration_status: 'confirmed',
              experience_level: experienceLevel,
            }, { onConflict: 'user_id,competition_id' });
        } catch {}
      }
    }

    // 13. Insert/Upsert master registration record for the leader
    const { data: registration, error: regErr } = await supabase
      .from('registrations')
      .upsert({
        user_id: verifiedUserId,
        competition_id: resolvedCompId,
        team_id: team.id,
        problem_category_id: resolvedProbCatId,
        registration_status: 'confirmed',
        experience_level: experienceLevel,
        notes: notes,
        document_url: docMeta.document_url,
        document_name: docMeta.document_name,
        document_type: docMeta.document_type,
        document_size: docMeta.document_size,
        document_path: docMeta.document_path,
      }, { onConflict: 'user_id,competition_id' })
      .select(`
        *,
        competition:competitions(id, name, slug),
        team:teams(id, name, code, college),
        problem_category:problem_categories(id, title, number, theme)
      `)
      .single();

    if (regErr) {
      throw new Error(`Registration record creation failed: ${regErr.message}`);
    }

    // 14. Update leader profile if needed
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: leaderFullName,
          phone: leaderPhone || undefined,
          college: leaderCollege || undefined,
          branch: leaderBranch || undefined,
          year: leaderYear || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verifiedUserId);
    } catch {}

    return {
      registration,
      team,
      teamCode: team.code,
      competition: targetComp,
      membersCount: totalTeamSize,
      document: docMeta,
    };
  },

  // Individual registration (Codeathon or solo format)
  async createRegistration({
    userId,
    competitionId,
    teamId = null,
    problemCategoryId = null,
    experienceLevel = 'intermediate',
    notes = '',
    email = null,
    documentFile = null,
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

    // 2. Resolve competition ID
    let resolvedCompId = competitionId;
    let targetComp = null;
    if (competitionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(competitionId)) {
      const { data: comp } = await supabase
        .from('competitions')
        .select('*')
        .eq('slug', competitionId.toLowerCase())
        .maybeSingle();
      if (comp?.id) {
        resolvedCompId = comp.id;
        targetComp = comp;
      }
    } else if (resolvedCompId) {
      const { data: comp } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', resolvedCompId)
        .maybeSingle();
      if (comp) targetComp = comp;
    }

    if (targetComp) {
      if (targetComp.registration_open === false || targetComp.status !== 'active') {
        throw new Error(`Registration for ${targetComp.name || 'this competition'} is currently closed.`);
      }
    }

    // 3. Resolve problem category ID if passed as slug
    let resolvedProbCatId = problemCategoryId;
    if (problemCategoryId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(problemCategoryId)) {
      const { data: cat } = await supabase
        .from('problem_categories')
        .select('id')
        .eq('slug', problemCategoryId.toLowerCase())
        .maybeSingle();
      if (cat?.id) resolvedProbCatId = cat.id;
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

    // 5. Strict Single Participation Check
    const participation = await this.checkUserParticipation({
      userId: verifiedUserId,
      email: cleanEmail,
      competitionId: resolvedCompId,
    });

    if (participation.isParticipating) {
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

    // Upload document if provided
    let docMeta = {
      document_url: null,
      document_name: null,
      document_type: null,
      document_size: null,
      document_path: null,
    };

    if (documentFile) {
      docMeta = await this.uploadRegistrationDocument(documentFile, `registrations/${targetComp?.slug || 'individual'}`);
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
        document_url: docMeta.document_url,
        document_name: docMeta.document_name,
        document_type: docMeta.document_type,
        document_size: docMeta.document_size,
        document_path: docMeta.document_path,
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

  // Replace document on an existing registration
  async replaceRegistrationDocument(registrationId, file) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    // Fetch existing document path to delete old file
    const { data: reg, error: fetchErr } = await supabase
      .from('registrations')
      .select('id, document_path')
      .eq('id', registrationId)
      .single();

    if (fetchErr) throw fetchErr;

    // Upload new document
    const uploadMeta = await this.uploadRegistrationDocument(file, 'registrations');

    // Update registration table
    const { data: updated, error: updateErr } = await supabase
      .from('registrations')
      .update({
        document_url: uploadMeta.document_url,
        document_name: uploadMeta.document_name,
        document_type: uploadMeta.document_type,
        document_size: uploadMeta.document_size,
        document_path: uploadMeta.document_path,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Remove old file from storage if it exists
    if (reg.document_path) {
      await supabase.storage.from('submissions').remove([reg.document_path]).catch(() => {});
    }

    return updated;
  },

  // Delete document from a registration
  async deleteRegistrationDocument(registrationId) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data: reg, error: fetchErr } = await supabase
      .from('registrations')
      .select('id, document_path')
      .eq('id', registrationId)
      .single();

    if (fetchErr) throw fetchErr;

    // Delete from storage
    if (reg?.document_path) {
      await supabase.storage.from('submissions').remove([reg.document_path]).catch(() => {});
    }

    // Clear fields
    const { data: updated, error: updateErr } = await supabase
      .from('registrations')
      .update({
        document_url: null,
        document_name: null,
        document_type: null,
        document_size: null,
        document_path: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return updated;
  },

  // Get all registrations for a user (including attached document & team members)
  async getUserRegistrations(userId) {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          competition:competitions (id, name, slug, duration, format, min_team_size, max_team_size),
          team:teams (
            id,
            name,
            code,
            college,
            leader_id,
            members:team_members(
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
              profile:profiles(id, full_name, email, avatar_url, college)
            )
          ),
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
