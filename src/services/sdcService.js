import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default initial SDC member hierarchy for REC Banda if table not yet populated
export const defaultSdcMembers = [
  {
    id: 'default-faculty-1',
    name: 'Dr. Pushpendra Singh',
    category: 'faculty_coordinator',
    role_title: 'Faculty Advisor & Convener, SDC',
    bio: 'Associate Professor, Department of Information Technology, REC Banda. Guiding research and student developer initiatives in cutting-edge computing.',
    photo_url: '',
    social_links: {
      linkedin: 'https://linkedin.com',
      email: 'sdc@recbanda.ac.in',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'default-mentor-1',
    name: 'Alumni Tech Mentor',
    category: 'mentor',
    role_title: 'Software Development & Architecture Mentor',
    bio: 'Software Engineer & SDC Alum. Advising builders on scalable cloud architectures, high-performance systems, and hackathon project execution.',
    photo_url: '',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'default-mentor-2',
    name: 'Competitive Programming Mentor',
    category: 'mentor',
    role_title: 'Algorithms & Data Structures Mentor',
    bio: 'Guiding Codeathon participants on graph algorithms, dynamic programming optimizations, and high-velocity problem-solving.',
    photo_url: '',
    social_links: {
      github: 'https://github.com',
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'default-coord-1',
    name: 'Lead Student Coordinator',
    category: 'coordinator',
    role_title: 'President & Overall Event Lead, SDC',
    bio: 'Overseeing HackFest 3.0 operations, competition tracks, technical infrastructure, and college coordination.',
    photo_url: '',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'default-coord-2',
    name: 'Technical & Platform Lead',
    category: 'coordinator',
    role_title: 'Head of Web Systems & Operations',
    bio: 'Architecting the HackFest 3.0 digital platform, judging arena pipelines, and live participant communications.',
    photo_url: '',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'default-coord-3',
    name: 'Logistics & Outreach Coordinator',
    category: 'coordinator',
    role_title: 'Public Relations & Sponsor Liaison',
    bio: 'Managing interstate delegate hospitality, arena management, partner outreach, and media communications.',
    photo_url: '',
    social_links: {
      linkedin: 'https://linkedin.com',
    },
    sort_order: 3,
    is_active: true,
  },
];

export const sdcService = {
  /**
   * Fetch active SDC members grouped by category for public page
   */
  async getPublicMembers() {
    if (!isSupabaseConfigured) {
      return this.groupMembers([]);
    }

    try {
      const { data, error } = await supabase
        .from('sdc_members')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('sdc_members table may not be migrated yet:', error.message);
        return this.groupMembers([]);
      }

      return this.groupMembers(data || []);
    } catch {
      return this.groupMembers([]);
    }
  },

  /**
   * Group members into the exact required 3 sections:
   * 1. Faculty Coordinator
   * 2. Mentors
   * 3. Coordinators
   */
  groupMembers(list) {
    const faculty = list
      .filter((m) => m.category === 'faculty_coordinator')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const mentors = list
      .filter((m) => m.category === 'mentor')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const coordinators = list
      .filter((m) => m.category === 'coordinator')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return {
      faculty,
      mentors,
      coordinators,
      all: [...faculty, ...mentors, ...coordinators],
    };
  },

  /**
   * Fetch all members for admin management (including inactive)
   */
  async getAllMembersForAdmin() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('sdc_members')
        .select('*')
        .order('category')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Failed to load sdc_members from Supabase:', err.message);
      return [];
    }
  },

  /**
   * Add a new SDC member
   */
  async createMember(memberData) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('sdc_members')
      .insert([
        {
          name: memberData.name,
          category: memberData.category,
          role_title: memberData.role_title,
          bio: memberData.bio || '',
          photo_url: memberData.photo_url || null,
          social_links: memberData.social_links || {},
          sort_order: memberData.sort_order || 0,
          is_active: memberData.is_active !== undefined ? memberData.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing SDC member
   */
  async updateMember(id, updates) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('sdc_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an SDC member
   */
  async deleteMember(id) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.from('sdc_members').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Upload a photograph to the 'sdc-members' storage bucket
   */
  async uploadPhoto(file) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // Generate safe unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `members/${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('sdc-members')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('sdc-members')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },
};
