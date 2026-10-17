import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const adminService = {
  // --------------------------------------------------------------------------
  // 1. STATS & OVERVIEW METRICS
  // --------------------------------------------------------------------------
  async getStats() {
    if (!isSupabaseConfigured) {
      return {
        participantsCount: 142,
        teamsCount: 38,
        registrationsCount: 142,
        submissionsCount: 29,
        evaluationsCount: 18,
        sdcMembersCount: 6,
        byCompetition: { hackathon: 84, ideathon: 36, codeathon: 22 },
      };
    }

    try {
      const [profiles, teams, registrations, submissions, scores, sdcMembers, comps] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('teams').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        supabase.from('submissions').select('*', { count: 'exact', head: true }),
        supabase.from('scores').select('*', { count: 'exact', head: true }),
        supabase.from('sdc_members').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('registrations').select('competition_id, competitions(slug, name)').catch(() => ({ data: [] })),
      ]);

      // Count by competition
      const byCompetition = {};
      if (comps.data && Array.isArray(comps.data)) {
        comps.data.forEach((r) => {
          const slug = r.competitions?.slug || 'other';
          byCompetition[slug] = (byCompetition[slug] || 0) + 1;
        });
      }

      return {
        participantsCount: profiles.count || 0,
        teamsCount: teams.count || 0,
        registrationsCount: registrations.count || 0,
        submissionsCount: submissions.count || 0,
        evaluationsCount: scores.count || 0,
        sdcMembersCount: sdcMembers?.count || 0,
        byCompetition,
      };
    } catch {
      return {
        participantsCount: 0,
        teamsCount: 0,
        registrationsCount: 0,
        submissionsCount: 0,
        evaluationsCount: 0,
        sdcMembersCount: 0,
        byCompetition: {},
      };
    }
  },

  // --------------------------------------------------------------------------
  // 2. REGISTRATIONS MANAGEMENT
  // --------------------------------------------------------------------------
  async getAllRegistrations() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          profile:profiles!registrations_user_id_fkey(id, full_name, email, phone, college, branch, year),
          competition:competitions(id, slug, name, duration, format),
          problem_category:problem_categories(id, title, number, theme),
          team:teams(
            id,
            name,
            code,
            college,
            description,
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
              profile:profiles(id, full_name, email, phone, college)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to load registrations with fkeys, falling back:', error.message);
        const { data: fallback } = await supabase
          .from('registrations')
          .select(`
            *,
            competition:competitions(id, slug, name),
            team:teams(id, name, code)
          `)
          .order('created_at', { ascending: false });
        return fallback || [];
      }

      // Normalize team members
      return (data || []).map((reg) => {
        if (reg.team && Array.isArray(reg.team.members)) {
          const normMembers = reg.team.members.map((m) => ({
            id: m.id,
            user_id: m.user_id,
            role: m.role || 'member',
            name: m.name || m.profile?.full_name || 'Member',
            email: m.email || m.profile?.email || 'N/A',
            phone: m.phone || m.profile?.phone || '',
            college: m.college || m.profile?.college || reg.team.college || 'Rajkiya Engineering College Banda',
            branch: m.branch || m.profile?.branch || '',
            year: m.year || m.profile?.year || '',
          }));
          return {
            ...reg,
            team: {
              ...reg.team,
              members: normMembers,
            },
          };
        }
        return reg;
      });
    } catch (err) {
      console.warn('Registrations query failed:', err.message);
      return [];
    }
  },

  async updateRegistrationStatus(id, status, notes = '') {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('registrations')
      .update({
        registration_status: status,
        notes: notes || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await this.logAction('UPDATE_REGISTRATION_STATUS', 'registration', id, {
      new_status: status,
      notes,
    }).catch(() => {});

    return data;
  },

  async updateRegistrationAdmin(id, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('registrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await this.logAction('UPDATE_REGISTRATION', 'registration', id, updates).catch(() => {});
    return data;
  },

  async deleteRegistration(id) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;

    await this.logAction('DELETE_REGISTRATION', 'registration', id, {}).catch(() => {});
    return true;
  },

  async deleteRegistrationAndTeamAdmin(registrationId, teamId = null) {
    if (!isSupabaseConfigured) return;
    let targetTeamId = teamId;
    if (!targetTeamId && registrationId) {
      try {
        const { data: reg } = await supabase
          .from('registrations')
          .select('team_id')
          .eq('id', registrationId)
          .maybeSingle();
        if (reg?.team_id) targetTeamId = reg.team_id;
      } catch (err) {
        console.warn('Note: lookup team_id during registration delete:', err);
      }
    }

    if (targetTeamId) {
      await this.deleteTeamAdmin(targetTeamId).catch((err) => console.warn('Note: team delete during registration delete:', err));
    }
    if (registrationId) {
      const { error } = await supabase.from('registrations').delete().eq('id', registrationId);
      if (error && !targetTeamId) throw error;
    }

    await this.logAction('DELETE_REGISTRATION_AND_TEAM', 'registrations', registrationId || targetTeamId, { teamId: targetTeamId }).catch(() => {});
    return true;
  },

  // --------------------------------------------------------------------------
  // 3. ADMIN & USER ROLE MANAGEMENT (SUPER ADMIN ONLY)
  // --------------------------------------------------------------------------
  async getAdminUsers() {
    if (!isSupabaseConfigured) return [];
    try {
      // First try dedicated app_admins table
      const { data: appAdmins, error: appErr } = await supabase
        .from('app_admins')
        .select(`
          *,
          profile:profiles(id, full_name, email, college, role, is_super_admin)
        `)
        .order('created_at', { ascending: true });

      if (!appErr && appAdmins && appAdmins.length > 0) {
        return appAdmins.map((a) => ({
          id: a.user_id,
          full_name: a.profile?.full_name || 'Admin User',
          email: a.profile?.email || 'N/A',
          role: a.role,
          is_super_admin: a.is_super_admin,
          promoted_at: a.created_at,
        }));
      }

      // Fallback to profiles table where role IN ('admin', 'super_admin', 'organizer')
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, is_super_admin, created_at')
        .in('role', ['admin', 'super_admin', 'organizer'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (profiles || []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        role: p.role,
        is_super_admin: p.is_super_admin || p.role === 'super_admin',
        promoted_at: p.created_at,
      }));
    } catch (err) {
      console.warn('Error fetching admin users:', err.message);
      return [];
    }
  },

  async getAllUsersForPromotion() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, college, created_at')
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async promoteUserToAdmin(userId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    // Attempt RPC first (enforced at database level)
    const { data, error } = await supabase.rpc('promote_user_to_admin', {
      target_user_id: userId,
    });

    if (!error) return data;

    // Fallback direct update if function not yet applied in migration
    console.warn('promote_user_to_admin RPC not found or failed, using profile update:', error.message);
    const { data: updData, error: updError } = await supabase
      .from('profiles')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (updError) throw updError;

    await this.logAction('PROMOTE_ADMIN', 'profile', userId, { new_role: 'admin' }).catch(() => {});
    return updData;
  },

  async demoteAdminToParticipant(userId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    // Attempt RPC first (enforced at database level)
    const { data, error } = await supabase.rpc('demote_admin', {
      target_user_id: userId,
    });

    if (!error) return data;

    // Fallback direct update
    console.warn('demote_admin RPC not found or failed, using profile update:', error.message);
    const { data: updData, error: updError } = await supabase
      .from('profiles')
      .update({ role: 'participant', is_super_admin: false, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (updError) throw updError;

    // Remove from app_admins if table exists
    await supabase.from('app_admins').delete().eq('user_id', userId).catch(() => {});

    await this.logAction('DEMOTE_ADMIN', 'profile', userId, { new_role: 'participant' }).catch(() => {});
    return updData;
  },

  // --------------------------------------------------------------------------
  // 4. IMMUTABLE AUDIT LOGS
  // --------------------------------------------------------------------------
  async getAuditLogs(limit = 100) {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async logAction(action, entityType, entityId, details = {}) {
    if (!isSupabaseConfigured) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      await supabase.from('audit_logs').insert([
        {
          actor_id: user?.id || null,
          actor_email: user?.email || 'authenticated-admin',
          actor_role: user?.user_metadata?.role || 'admin',
          action,
          entity_type: entityType,
          entity_id: String(entityId || ''),
          details,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Audit log write skipped or failed:', err.message);
    }
  },

  // --------------------------------------------------------------------------
  // 5. EVENT & WEBSITE CONTENT CMS
  // --------------------------------------------------------------------------
  async updateEventSettings(settings) {
    if (!isSupabaseConfigured) return;

    // 1. Fetch current settings row to get exact ID
    const { data: existingRow } = await supabase
      .from('event_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    const rowId = existingRow?.id;

    // 2. Prepare normalized base payload (columns guaranteed in core schema)
    const isRegOpen = settings.registration_open !== false && settings.registrationOpen !== false;
    const isPptOpen = settings.ppt_submissions_open !== false && settings.pptSubmissionsOpen !== false;

    const corePayload = {
      venue: settings.venue || 'Multipurpose Hall, REC Banda Campus, Atarra, Banda (U.P.)',
      contact_email: settings.contact_email || settings.contactEmail || 'sdc2021recbanda@gmail.com',
      registration_deadline: settings.registration_deadline || settings.registrationDeadline || 'REGISTRATION CLOSING SOON',
      live_mode_status: settings.live_mode_status || settings.liveModeStatus || 'REGISTRATION OPEN',
      leaderboard_published: Boolean(settings.leaderboard_published ?? settings.leaderboardPublished),
      registration_status: isRegOpen ? 'OPEN' : 'CLOSED',
      updated_at: new Date().toISOString(),
    };

    // Columns verified in event_settings table
    const standardPayload = {
      ...corePayload,
      registration_start_date: settings.registration_start_date || settings.registrationStartDate || 'OCTOBER 10, 2026',
      ppt_submissions_open: isPptOpen,
      submission_deadline: settings.submission_deadline || settings.submissionDeadline || 'OCTOBER 25, 2026, 12:00 PM',
      submission_instructions: settings.submission_instructions || settings.submissionInstructions || 'Submit your slide presentation (PDF or PPTX format, under 25MB) and provide your GitHub repository link.',
      accepted_file_types: settings.accepted_file_types || settings.acceptedFileTypes || '.pdf,.pptx,.ppt',
      max_file_size_mb: Number(settings.max_file_size_mb || settings.maxFileSizeMb || 25),
    };

    // Extended payload if event_date or registration_open columns also exist
    const fullPayload = {
      ...standardPayload,
      event_date: settings.event_date || settings.eventDate || 'OCTOBER 24-25, 2026',
      registration_open: isRegOpen,
    };

    let result = null;
    if (rowId) {
      result = await supabase.from('event_settings').update(fullPayload).eq('id', rowId).select();
    } else {
      result = await supabase.from('event_settings').insert([fullPayload]).select();
    }

    // Fallback to standardPayload if event_date or registration_open is missing in schema cache
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column'))) {
      if (rowId) {
        result = await supabase.from('event_settings').update(standardPayload).eq('id', rowId).select();
      } else {
        result = await supabase.from('event_settings').insert([standardPayload]).select();
      }
    }

    // Ultimate fallback to minimal corePayload if other columns fail
    if (result.error && (result.error.code === 'PGRST204' || result.error.message?.includes('column'))) {
      console.warn('PostgREST schema cache missing extended columns, executing fallback to base schema:', result.error.message);
      if (rowId) {
        result = await supabase.from('event_settings').update(corePayload).eq('id', rowId).select();
      } else {
        result = await supabase.from('event_settings').insert([corePayload]).select();
      }
    }

    if (result.error) throw result.error;

    await this.logAction('UPDATE_EVENT_SETTINGS', 'event_settings', rowId || 'global', {
      ...corePayload,
      event_date: settings.event_date || settings.eventDate,
      registration_open: isRegOpen,
      ppt_submissions_open: isPptOpen,
    }).catch(() => {});

    return result.data?.[0] || result.data;
  },

  // Schedules (Add, Edit, Delete, Reorder)
  async getSchedulesAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('day_number', { ascending: true })
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []).map((s) => ({
        ...s,
        category: s.category || s.badge?.replace('[DRAFT]', '').trim() || 'General',
        badge: s.badge?.replace('[DRAFT]', '').trim() || 'STAGE',
        day_label: s.day_label || `DAY ${String(s.day_number || 1).padStart(2, '0')}`,
        event_date: s.event_date || (s.day_number === 2 ? '2026-10-25' : '2026-10-24'),
        is_published: s.is_published !== undefined ? s.is_published : !s.badge?.includes('[DRAFT]'),
      }));
    } catch {
      return [];
    }
  },

  async saveScheduleItem(item) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    
    // Full payload for modern/migrated schema
    const fullPayload = {
      day_number: Number(item.day_number) || 1,
      day_label: item.day_label || `DAY ${String(item.day_number || 1).padStart(2, '0')}`,
      title: item.title,
      description: item.description || '',
      event_date: item.event_date || '2026-10-24',
      start_time: item.start_time || '09:00 AM',
      end_time: item.end_time || '10:00 AM',
      location: item.location || 'Multipurpose Hall, REC Banda',
      speaker: item.speaker || '',
      badge: item.badge || item.category || 'STAGE',
      category: item.category || 'General',
      icon: item.icon || '',
      is_highlight: Boolean(item.is_highlight),
      sort_order: Number(item.sort_order) || 0,
      is_published: item.is_published !== false,
      updated_at: new Date().toISOString(),
    };

    // Safe compatibility payload if database has not yet received column migrations
    const compatPayload = {
      day_number: Math.max(1, Number(item.day_number) || 1),
      title: item.title,
      description: item.description || '',
      start_time: item.start_time || '09:00 AM',
      end_time: item.end_time || '10:00 AM',
      location: item.location || 'Multipurpose Hall, REC Banda',
      speaker: item.speaker || '',
      badge: item.is_published === false
        ? `${item.category || item.badge || 'STAGE'} [DRAFT]`
        : (item.badge || item.category || 'STAGE'),
      is_highlight: Boolean(item.is_highlight),
      sort_order: Number(item.sort_order) || 0,
    };

    let resultData;
    if (item.id) {
      let { data, error } = await supabase
        .from('schedules')
        .update(fullPayload)
        .eq('id', item.id)
        .select()
        .single();

      if (error && (error.message?.includes('column') || error.message?.includes('schema cache') || error.code === '42703' || error.code === 'PGRST204')) {
        console.warn('Falling back to compatibility schema for schedule update:', error.message);
        const retry = await supabase
          .from('schedules')
          .update(compatPayload)
          .eq('id', item.id)
          .select()
          .single();
        if (retry.error) throw retry.error;
        resultData = retry.data;
      } else if (error) {
        throw error;
      } else {
        resultData = data;
      }

      await this.logAction('UPDATE_SCHEDULE', 'schedules', item.id, item).catch(() => {});
      return resultData;
    } else {
      let { data, error } = await supabase
        .from('schedules')
        .insert([{
          ...fullPayload,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error && (error.message?.includes('column') || error.message?.includes('schema cache') || error.code === '42703' || error.code === 'PGRST204')) {
        console.warn('Falling back to compatibility schema for schedule insert:', error.message);
        const retry = await supabase
          .from('schedules')
          .insert([{
            ...compatPayload,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();
        if (retry.error) throw retry.error;
        resultData = retry.data;
      } else if (error) {
        throw error;
      } else {
        resultData = data;
      }

      await this.logAction('CREATE_SCHEDULE', 'schedules', resultData.id, item).catch(() => {});
      return resultData;
    }
  },

  async deleteScheduleItem(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_SCHEDULE', 'schedules', id, {}).catch(() => {});
    return true;
  },

  async reorderSchedules(items) {
    if (!isSupabaseConfigured || !Array.isArray(items)) return false;
    try {
      await Promise.all(
        items.map((item, idx) =>
          supabase
            .from('schedules')
            .update({ sort_order: idx + 1 })
            .eq('id', item.id)
        )
      );
      await this.logAction('REORDER_SCHEDULES', 'schedules', 'batch', { count: items.length }).catch(() => {});
      return true;
    } catch (err) {
      console.error('Failed to reorder schedules:', err);
      return false;
    }
  },

  // Sponsors (Add, Edit, Delete, Reorder, Logo Upload)
  async getSponsorsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((s) => ({
        ...s,
        tier: s.tier || s.role || s.category || 'gold',
        is_published: s.is_published !== undefined ? s.is_published : s.tag !== 'draft',
      }));
    } catch {
      return [];
    }
  },

  async saveSponsorItem(item) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    
    // Full payload for modern/migrated schema
    const fullPayload = {
      name: item.name,
      tier: item.tier || 'gold',
      category: item.category || item.tier || 'partner',
      role: item.tier || 'gold',
      tag: item.is_published === false ? 'draft' : 'published',
      logo_url: item.logo_url || '',
      website_url: item.website_url || '',
      description: item.description || '',
      sort_order: Number(item.sort_order) || 0,
      is_published: item.is_published !== false,
      updated_at: new Date().toISOString(),
    };

    // Safe compatibility payload if database has not yet received column migrations
    const compatPayload = {
      name: item.name,
      category: item.tier || item.category || 'partner',
      role: item.tier || 'gold',
      tag: item.is_published === false ? 'draft' : 'published',
      logo_url: item.logo_url || '',
      website_url: item.website_url || '',
      description: item.description || '',
      sort_order: Number(item.sort_order) || 0,
    };

    let resultData;
    if (item.id) {
      let { data, error } = await supabase
        .from('sponsors')
        .update(fullPayload)
        .eq('id', item.id)
        .select()
        .single();

      if (error && (error.message?.includes('column') || error.message?.includes('schema cache') || error.code === '42703' || error.code === 'PGRST204')) {
        console.warn('Falling back to compatibility schema for sponsor update:', error.message);
        const retry = await supabase
          .from('sponsors')
          .update(compatPayload)
          .eq('id', item.id)
          .select()
          .single();
        if (retry.error) throw retry.error;
        resultData = retry.data;
      } else if (error) {
        throw error;
      } else {
        resultData = data;
      }

      await this.logAction('UPDATE_SPONSOR', 'sponsors', item.id, item).catch(() => {});
      return resultData;
    } else {
      let { data, error } = await supabase
        .from('sponsors')
        .insert([{
          ...fullPayload,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error && (error.message?.includes('column') || error.message?.includes('schema cache') || error.code === '42703' || error.code === 'PGRST204')) {
        console.warn('Falling back to compatibility schema for sponsor insert:', error.message);
        const retry = await supabase
          .from('sponsors')
          .insert([{
            ...compatPayload,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();
        if (retry.error) throw retry.error;
        resultData = retry.data;
      } else if (error) {
        throw error;
      } else {
        resultData = data;
      }

      await this.logAction('CREATE_SPONSOR', 'sponsors', resultData.id, item).catch(() => {});
      return resultData;
    }
  },

  async deleteSponsorItem(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('sponsors').delete().eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_SPONSOR', 'sponsors', id, {}).catch(() => {});
    return true;
  },

  async reorderSponsors(items) {
    if (!isSupabaseConfigured || !Array.isArray(items)) return false;
    try {
      await Promise.all(
        items.map((item, idx) =>
          supabase
            .from('sponsors')
            .update({ sort_order: idx + 1 })
            .eq('id', item.id)
        )
      );
      await this.logAction('REORDER_SPONSORS', 'sponsors', 'batch', { count: items.length }).catch(() => {});
      return true;
    } catch (err) {
      console.error('Failed to reorder sponsors:', err);
      return false;
    }
  },

  async uploadSponsorLogo(file) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const ext = file.name.split('.').pop() || 'png';
    const cleanName = `sponsor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `logos/${cleanName}`;

    // Try primary 'sponsors' bucket, fallback to 'sdc-members' if storage bucket pending
    let uploadBucket = 'sponsors';
    let { error: uploadError } = await supabase.storage
      .from(uploadBucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError && uploadError.message?.toLowerCase().includes('bucket not found')) {
      uploadBucket = 'sdc-members';
      const fallbackResult = await supabase.storage
        .from(uploadBucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      uploadError = fallbackResult.error;
    }

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(uploadBucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  // Announcements (Add, Edit, Delete)
  async getAnnouncementsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async saveAnnouncement(item) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    if (item.id) {
      const { data, error } = await supabase
        .from('announcements')
        .update({
          title: item.title,
          message: item.message,
          priority: item.priority || 'normal',
          published: item.published !== undefined ? item.published : true,
        })
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      await this.logAction('UPDATE_ANNOUNCEMENT', 'announcements', item.id, item).catch(() => {});
      return data;
    } else {
      const { data, error } = await supabase
        .from('announcements')
        .insert([
          {
            title: item.title,
            message: item.message,
            priority: item.priority || 'normal',
            published: item.published !== undefined ? item.published : true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      await this.logAction('CREATE_ANNOUNCEMENT', 'announcements', data.id, item).catch(() => {});
      return data;
    }
  },

  async deleteAnnouncement(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_ANNOUNCEMENT', 'announcements', id, {}).catch(() => {});
    return true;
  },

  // FAQs (Add, Edit, Delete)
  async getFaqsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async saveFaq(item) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    if (item.id) {
      const { data, error } = await supabase
        .from('faqs')
        .update({
          question: item.question,
          answer: item.answer,
          category: item.category || 'General',
          sort_order: item.sort_order || 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
        })
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      await this.logAction('UPDATE_FAQ', 'faqs', item.id, item).catch(() => {});
      return data;
    } else {
      const { data, error } = await supabase
        .from('faqs')
        .insert([
          {
            question: item.question,
            answer: item.answer,
            category: item.category || 'General',
            sort_order: item.sort_order || 0,
            is_active: item.is_active !== undefined ? item.is_active : true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      await this.logAction('CREATE_FAQ', 'faqs', data.id, item).catch(() => {});
      return data;
    }
  },

  async deleteFaq(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_FAQ', 'faqs', id, {}).catch(() => {});
    return true;
  },

  // Competitions (Edit details & settings)
  async getCompetitionsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async updateCompetition(idOrSlug, updates) {
    return this.updateCompetitionAdmin(idOrSlug, updates);
  },

  async updateCompetitionAdmin(id, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));
    let query = supabase.from('competitions').update({
      ...updates,
      updated_at: new Date().toISOString(),
    });
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }
    const { data, error } = await query.select();
    if (error) throw error;
    await this.logAction('UPDATE_COMPETITION', 'competitions', String(id), updates).catch(() => {});
    return data?.[0] || data;
  },

  // --------------------------------------------------------------------------
  // 6. PROBLEM CATEGORIES MANAGEMENT (PARTS 2 & 6)
  // --------------------------------------------------------------------------
  async getProblemCategoriesAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('problem_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching admin problem categories:', err);
      return [];
    }
  },

  async saveProblemCategory(category) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const isPublished = category.is_published !== false && category.is_active !== false;
    const payload = {
      number: String(category.number || '').trim(),
      title: String(category.title || '').trim(),
      slug: String(category.slug || category.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      theme: String(category.theme || '').trim(),
      placeholder_notice: category.placeholder_notice || 'OFFICIAL PROBLEM STATEMENT TO BE UNVEILED AT BRIEFING',
      background: category.background || '',
      challenge: category.challenge || category.description || '',
      description: category.description || category.challenge || '',
      requirements: Array.isArray(category.requirements) ? category.requirements : [],
      expected_outcome: category.expected_outcome || '',
      technical_directions: category.technical_directions || '',
      submission_info: category.submission_info || '',
      is_active: isPublished,
      is_published: isPublished,
      sort_order: Number(category.sort_order || 0),
      updated_at: new Date().toISOString(),
    };

    if (category.id) {
      const { data, error } = await supabase
        .from('problem_categories')
        .update(payload)
        .eq('id', category.id)
        .select()
        .single();

      if (error) throw error;
      await this.logAction('UPDATE_PROBLEM_CATEGORY', 'problem_categories', category.id, payload).catch(() => {});
      return data;
    } else {
      const { data, error } = await supabase
        .from('problem_categories')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      await this.logAction('CREATE_PROBLEM_CATEGORY', 'problem_categories', data.id, payload).catch(() => {});
      return data;
    }
  },

  async toggleProblemCategoryPublish(id, isPublished) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('problem_categories')
      .update({
        is_active: isPublished,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await this.logAction('TOGGLE_PUBLISH_PROBLEM_CATEGORY', 'problem_categories', id, { is_published: isPublished }).catch(() => {});
    return data;
  },

  async checkProblemCategoryDependencies(categoryId) {
    if (!isSupabaseConfigured) return { canDelete: true, message: '' };

    try {
      const [statements, regs, subs] = await Promise.all([
        supabase.from('problem_statements').select('id', { count: 'exact', head: true }).eq('category_id', categoryId),
        supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('problem_category_id', categoryId),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('problem_category_id', categoryId),
      ]);

      const statementCount = statements.count || 0;
      const registrationCount = regs.count || 0;
      const submissionCount = subs.count || 0;

      if (statementCount > 0 || registrationCount > 0 || submissionCount > 0) {
        const issues = [];
        if (statementCount > 0) issues.push(`${statementCount} problem statement(s)`);
        if (registrationCount > 0) issues.push(`${registrationCount} participant registration(s)`);
        if (submissionCount > 0) issues.push(`${submissionCount} project submission(s)`);

        return {
          canDelete: false,
          statementCount,
          registrationCount,
          submissionCount,
          message: `Cannot delete track category: Referenced by ${issues.join(', ')}. Please reassign or remove dependent records before deletion.`,
        };
      }

      return { canDelete: true, statementCount: 0, registrationCount: 0, submissionCount: 0, message: '' };
    } catch {
      return { canDelete: true, message: '' };
    }
  },

  async deleteProblemCategory(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const depCheck = await this.checkProblemCategoryDependencies(id);
    if (!depCheck.canDelete) {
      throw new Error(depCheck.message);
    }

    const { error } = await supabase.from('problem_categories').delete().eq('id', id);
    if (error) throw error;

    await this.logAction('DELETE_PROBLEM_CATEGORY', 'problem_categories', id, {}).catch(() => {});
    return true;
  },

  // --------------------------------------------------------------------------
  // 7. PROBLEM STATEMENTS MANAGEMENT (PARTS 3 & 6)
  // --------------------------------------------------------------------------
  async getProblemStatementsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('problem_statements')
        .select(`
          *,
          category:problem_categories(*)
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching admin problem statements:', err);
      return [];
    }
  },

  async saveProblemStatement(statement) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const isPublished = statement.is_published !== undefined
      ? Boolean(statement.is_published)
      : statement.status === 'published';

    const payload = {
      category_id: statement.category_id || null,
      competition_id: statement.competition_id || null,
      title: String(statement.title || '').trim(),
      slug: String(statement.slug || statement.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      track_label: statement.track_label || '',
      description: String(statement.description || '').trim(),
      requirements: Array.isArray(statement.requirements) ? statement.requirements : [],
      constraints: statement.constraints || '',
      examples: statement.examples || '',
      input_output_specs: statement.input_output_specs || '',
      reference_file_url: statement.reference_file_url || '',
      status: isPublished ? 'published' : (statement.status || 'draft'),
      is_published: isPublished,
      sort_order: Number(statement.sort_order || 0),
      updated_at: new Date().toISOString(),
    };

    if (statement.id) {
      const { data, error } = await supabase
        .from('problem_statements')
        .update(payload)
        .eq('id', statement.id)
        .select(`*, category:problem_categories(*)`)
        .single();

      if (error) throw error;
      await this.logAction('UPDATE_PROBLEM_STATEMENT', 'problem_statements', statement.id, payload).catch(() => {});
      return data;
    } else {
      const { data, error } = await supabase
        .from('problem_statements')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select(`*, category:problem_categories(*)`)
        .single();

      if (error) throw error;
      await this.logAction('CREATE_PROBLEM_STATEMENT', 'problem_statements', data.id, payload).catch(() => {});
      return data;
    }
  },

  async toggleProblemStatementPublish(id, isPublished) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('problem_statements')
      .update({
        is_published: isPublished,
        status: isPublished ? 'published' : 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`*, category:problem_categories(*)`)
      .single();

    if (error) throw error;
    await this.logAction('TOGGLE_PUBLISH_PROBLEM_STATEMENT', 'problem_statements', id, { is_published: isPublished }).catch(() => {});
    return data;
  },

  async checkProblemStatementDependencies(statementId) {
    if (!isSupabaseConfigured) return { canDelete: true, message: '' };

    try {
      const { count } = await supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('problem_category_id', statementId); // check if linked

      if (count && count > 0) {
        return {
          canDelete: false,
          submissionCount: count,
          message: `Cannot delete problem statement: Referenced by ${count} project submission(s).`,
        };
      }
      return { canDelete: true, submissionCount: 0, message: '' };
    } catch {
      return { canDelete: true, message: '' };
    }
  },

  async deleteProblemStatement(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const depCheck = await this.checkProblemStatementDependencies(id);
    if (!depCheck.canDelete) {
      throw new Error(depCheck.message);
    }

    const { error } = await supabase.from('problem_statements').delete().eq('id', id);
    if (error) throw error;

    await this.logAction('DELETE_PROBLEM_STATEMENT', 'problem_statements', id, {}).catch(() => {});
    return true;
  },

  // --------------------------------------------------------------------------
  // 8. DOCUMENT ATTACHMENTS (REGISTRATIONS & SUBMISSIONS)
  // --------------------------------------------------------------------------
  async replaceRegistrationDocumentAdmin(registrationId, file) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const fileName = (file.name || '').toLowerCase();
    const cleanExt = fileName.split('.').pop() || 'pdf';
    const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const storagePath = `registrations/${Date.now()}_${cleanBaseName}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(storagePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(storagePath);

    // Fetch old record to delete old file
    const { data: oldReg } = await supabase
      .from('registrations')
      .select('document_path')
      .eq('id', registrationId)
      .maybeSingle();

    if (oldReg?.document_path) {
      await supabase.storage.from('submissions').remove([oldReg.document_path]).catch(() => {});
    }

    const { data, error } = await supabase
      .from('registrations')
      .update({
        document_url: publicUrl,
        document_name: file.name,
        document_type: cleanExt.toUpperCase(),
        document_size: file.size,
        document_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) throw error;
    await this.logAction('REPLACE_REGISTRATION_DOCUMENT', 'registrations', registrationId, { document_name: file.name }).catch(() => {});
    return data;
  },

  async deleteRegistrationDocumentAdmin(registrationId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data: reg } = await supabase
      .from('registrations')
      .select('document_path')
      .eq('id', registrationId)
      .maybeSingle();

    if (reg?.document_path) {
      await supabase.storage.from('submissions').remove([reg.document_path]).catch(() => {});
    }

    const { data, error } = await supabase
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

    if (error) throw error;
    await this.logAction('DELETE_REGISTRATION_DOCUMENT', 'registrations', registrationId, {}).catch(() => {});
    return data;
  },

  // --------------------------------------------------------------------------
  // 9. PARTICIPANTS MANAGEMENT
  // --------------------------------------------------------------------------
  async getAllParticipants() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          college,
          branch,
          year,
          role,
          created_at,
          registrations:registrations(id, registration_status, competition:competitions(id, name, slug)),
          team_members:team_members(id, role, team:teams(id, name, code, competition:competitions(name)))
        `)
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      // Also fetch unlinked team_members (members entered by leader who don't have user_id yet)
      const { data: unlinkedMembers } = await supabase
        .from('team_members')
        .select(`
          id,
          name,
          email,
          phone,
          college,
          branch,
          year,
          role,
          joined_at,
          team:teams(id, name, code, competition:competitions(name))
        `)
        .is('user_id', null);

      const combined = [...(profiles || [])];

      if (unlinkedMembers && unlinkedMembers.length > 0) {
        unlinkedMembers.forEach((um) => {
          const existing = combined.find((c) => c.email && c.email.toLowerCase() === um.email?.toLowerCase());
          if (!existing) {
            combined.push({
              id: 'unlinked_' + um.id,
              memberId: um.id,
              full_name: um.name || 'Team Member',
              email: um.email,
              phone: um.phone,
              college: um.college || 'Rajkiya Engineering College Banda',
              branch: um.branch,
              year: um.year,
              role: 'participant',
              is_unlinked: true,
              created_at: um.joined_at,
              registrations: [],
              team_members: [um],
            });
          }
        });
      }

      return combined;
    } catch (err) {
      console.error('Failed to load participants:', err);
      return [];
    }
  },

  async updateParticipant(userId, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    if (String(userId).startsWith('unlinked_')) {
      const memberId = userId.replace('unlinked_', '');
      const { data, error } = await supabase
        .from('team_members')
        .update({
          name: updates.full_name || updates.name,
          email: updates.email,
          phone: updates.phone,
          college: updates.college,
          branch: updates.branch,
          year: updates.year,
        })
        .eq('id', memberId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name || updates.name,
        email: updates.email,
        phone: updates.phone,
        college: updates.college,
        branch: updates.branch,
        year: updates.year,
        role: updates.role || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    await this.logAction('UPDATE_PARTICIPANT', 'profile', userId, updates).catch(() => {});
    return data;
  },

  async deleteParticipant(userId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    if (String(userId).startsWith('unlinked_')) {
      const memberId = userId.replace('unlinked_', '');
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;
      return true;
    }

    await supabase.from('registrations').delete().eq('user_id', userId).catch(() => {});
    await supabase.from('team_members').delete().eq('user_id', userId).catch(() => {});

    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;

    await this.logAction('DELETE_PARTICIPANT', 'profile', userId, {}).catch(() => {});
    return true;
  },

  // --------------------------------------------------------------------------
  // 10. TEAMS & ROSTERS MANAGEMENT
  // --------------------------------------------------------------------------
  async getAllTeams() {
    return this.getAllTeamsAdmin();
  },

  async getAllTeamsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          competition:competitions(id, name, slug, max_team_size, min_team_size),
          leader:profiles!teams_leader_id_fkey(id, full_name, email, phone, college),
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
            profile:profiles(id, full_name, email, phone, college)
          ),
          registrations:registrations(
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
        console.warn('Teams relations query fallback:', error.message);
        const { data: fallback } = await supabase
          .from('teams')
          .select(`*, competition:competitions(id, name, slug), members:team_members(*)`)
          .order('created_at', { ascending: false });
        return fallback || [];
      }

      return (data || []).map((t) => {
        const rawMembers = t.members || [];
        const normMembers = rawMembers.map((m) => ({
          id: m.id,
          user_id: m.user_id,
          role: m.role || 'member',
          name: m.name || m.profile?.full_name || 'Member',
          email: m.email || m.profile?.email || 'N/A',
          phone: m.phone || m.profile?.phone || '',
          college: m.college || m.profile?.college || t.college || 'Rajkiya Engineering College Banda',
          branch: m.branch || m.profile?.branch || '',
          year: m.year || m.profile?.year || '',
          joined_at: m.joined_at,
        }));
        return {
          ...t,
          members: normMembers,
          registration: t.registrations?.[0] || null,
        };
      });
    } catch (err) {
      console.error('Failed to load admin teams:', err);
      return [];
    }
  },

  async saveTeamAdmin(team) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    if (team.id) {
      const { data, error } = await supabase
        .from('teams')
        .update({
          name: team.name?.trim(),
          college: team.college?.trim(),
          description: team.description?.trim(),
          competition_id: team.competition_id || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', team.id)
        .select()
        .single();
      if (error) throw error;
      await this.logAction('UPDATE_TEAM', 'teams', team.id, team).catch(() => {});
      return data;
    } else {
      const code = 'HF3-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: team.name?.trim(),
          code,
          competition_id: team.competition_id,
          college: team.college?.trim() || 'Rajkiya Engineering College Banda',
          description: team.description?.trim() || '',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      if (error) throw error;
      await this.logAction('CREATE_TEAM', 'teams', data.id, team).catch(() => {});
      return data;
    }
  },

  async deleteTeamAdmin(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    await supabase.from('registrations').delete().eq('team_id', id).catch(() => {});
    await supabase.from('team_members').delete().eq('team_id', id).catch(() => {});
    await supabase.from('submissions').delete().eq('team_id', id).catch(() => {});
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_TEAM', 'teams', id, {}).catch(() => {});
    return true;
  },

  async addTeamMemberAdmin(teamId, memberData) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        name: memberData.name?.trim(),
        email: memberData.email?.trim().toLowerCase(),
        phone: memberData.phone?.trim() || null,
        college: memberData.college?.trim() || 'Rajkiya Engineering College Banda',
        branch: memberData.branch?.trim() || null,
        year: memberData.year?.trim() || null,
        role: memberData.role || 'member',
      })
      .select()
      .single();
    if (error) throw error;
    await this.logAction('ADD_TEAM_MEMBER', 'team_members', data.id, { teamId, ...memberData }).catch(() => {});
    return data;
  },

  async updateTeamMemberAdmin(memberId, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: updates.name?.trim(),
        email: updates.email?.trim().toLowerCase(),
        phone: updates.phone?.trim(),
        college: updates.college?.trim(),
        branch: updates.branch?.trim(),
        year: updates.year?.trim(),
        role: updates.role || undefined,
      })
      .eq('id', memberId)
      .select()
      .single();
    if (error) throw error;
    await this.logAction('UPDATE_TEAM_MEMBER', 'team_members', memberId, updates).catch(() => {});
    return data;
  },

  async removeTeamMemberAdmin(memberId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('team_members').delete().eq('id', memberId);
    if (error) throw error;
    await this.logAction('REMOVE_TEAM_MEMBER', 'team_members', memberId, {}).catch(() => {});
    return true;
  },

  async changeTeamLeaderAdmin(teamId, newLeaderMemberId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data: targetMem, error: fError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', newLeaderMemberId)
      .single();
    if (fError || !targetMem) throw new Error('Member not found');

    await supabase.from('team_members').update({ role: 'member' }).eq('team_id', teamId).eq('role', 'leader');
    await supabase.from('team_members').update({ role: 'leader' }).eq('id', newLeaderMemberId);

    if (targetMem.user_id) {
      await supabase.from('teams').update({ leader_id: targetMem.user_id }).eq('id', teamId);
    }
    await this.logAction('CHANGE_TEAM_LEADER', 'teams', teamId, { newLeaderMemberId }).catch(() => {});
    return true;
  },

  // --------------------------------------------------------------------------
  // 11. SUBMISSIONS & ARTIFACTS MANAGEMENT
  // --------------------------------------------------------------------------
  async getAllSubmissionsAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          competition:competitions(id, name, slug),
          team:teams(
            id,
            name,
            code,
            college,
            members:team_members(id, name, email, role, phone, college)
          ),
          problem_category:problem_categories(id, title, number, theme),
          scores:scores(id, score, comments, criteria:judging_criteria(title, weight))
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Submissions fallback query:', error.message);
        const { data: fallback } = await supabase
          .from('submissions')
          .select(`*, team:teams(name), competition:competitions(name), problem_category:problem_categories(theme)`)
          .order('created_at', { ascending: false });
        return fallback || [];
      }
      return data || [];
    } catch (err) {
      console.error('Failed to load admin submissions:', err);
      return [];
    }
  },

  async updateSubmissionAdmin(id, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('submissions')
      .update({
        title: updates.title,
        description: updates.description,
        github_url: updates.github_url,
        demo_url: updates.demo_url,
        video_url: updates.video_url,
        document_url: updates.document_url,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await this.logAction('UPDATE_SUBMISSION', 'submissions', id, updates).catch(() => {});
    return data;
  },

  async deleteSubmissionAdmin(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('submissions').delete().eq('id', id);
    if (error) throw error;
    await this.logAction('DELETE_SUBMISSION', 'submissions', id, {}).catch(() => {});
    return true;
  },

  async replaceSubmissionDocumentAdmin(submissionId, file) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const cleanExt = (file.name || '').split('.').pop() || 'pdf';
    const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const storagePath = `submissions/${Date.now()}_${cleanBase}.${cleanExt}`;

    const { error: uploadErr } = await supabase.storage
      .from('submissions')
      .upload(storagePath, file, { cacheControl: '3600', upsert: true });

    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(storagePath);

    const { data, error } = await supabase
      .from('submissions')
      .update({
        document_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    await this.logAction('REPLACE_SUBMISSION_DOCUMENT', 'submissions', submissionId, { document_name: file.name }).catch(() => {});
    return data;
  },

  async deleteSubmissionDocumentAdmin(submissionId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('submissions')
      .update({
        document_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    await this.logAction('DELETE_SUBMISSION_DOCUMENT', 'submissions', submissionId, {}).catch(() => {});
    return data;
  },
};
