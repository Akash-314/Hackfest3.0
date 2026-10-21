import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default initial SDC member hierarchy for REC Banda
export const defaultSdcMembers = [
  // ==========================================
  // 0. DIRECTOR & PATRON (1 CARD)
  // ==========================================
  {
    id: 'director-1',
    name: 'Prof. Deependra Singh',
    category: 'director',
    role_title: 'Director, REC Banda',
    status: 'Patron & Director',
    statusColor: '#F5C451',
    backdropColor: '#282015',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Director, Rajkiya Engineering College, Banda. Patronizing academic excellence, technology innovation, and hackathon culture.',
    sort_order: 1,
    is_active: true,
  },

  // ==========================================
  // 1. FACULTY COORDINATOR (2 CARDS)
  // ==========================================
  {
    id: 'faculty-1',
    name: 'Dr. Vibhash Yadav',
    category: 'faculty_coordinator',
    role_title: 'HOD IT',
    status: 'HOD IT',
    statusColor: '#F5C451',
    backdropColor: '#282015',
    avatarUrl: '/images/faculty/dr_vibhash_yadav.png',
    miniAvatarUrl: '/images/faculty/dr_vibhash_yadav_mini.png',
    bio: 'Head of Department, Information Technology, REC Banda. Guiding academic and research excellence across computing disciplines.',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'faculty-2',
    name: 'Dr. Abhijeet Singh',
    category: 'faculty_coordinator',
    role_title: 'Faculty Coordinator',
    status: 'Faculty Coordinator',
    statusColor: '#F5C451',
    backdropColor: '#282015',
    avatarUrl: '/images/faculty/dr_abhijeet_singh.png',
    miniAvatarUrl: '/images/faculty/dr_abhijeet_singh_mini.png',
    bio: 'Faculty Coordinator, Student Developer Club, REC Banda. Leading software development initiatives and hackathon mentorship.',
    sort_order: 2,
    is_active: true,
  },


  // ==========================================
  // 2. MENTORS (7 CARDS) - PLACEHOLDERS
  // ==========================================
  {
    id: 'mentor-1',
    name: 'SDC Mentor 01',
    category: 'mentor',
    role_title: 'Lead Systems Architect & SDC Alum',
    handle: 'sdc_mentor_01',
    status: 'Cloud & Scale',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'SDC Alum & Technical Mentor advising teams on scalable cloud architectures, distributed systems, and hackathon execution.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'mentor-2',
    name: 'SDC Mentor 02',
    category: 'mentor',
    role_title: 'Senior AI / ML Research Mentor',
    handle: 'sdc_mentor_02',
    status: 'AI/ML & Vision',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Technical mentor specializing in machine learning, multimodal architectures, and practical neural model deployment.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'mentor-3',
    name: 'SDC Mentor 03',
    category: 'mentor',
    role_title: 'Distributed Systems & Web3 Lead',
    handle: 'sdc_mentor_03',
    status: 'Web3 & Backend',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Backend infrastructure specialist mentoring teams on distributed consensus, microservices, and high-performance databases.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'mentor-4',
    name: 'SDC Mentor 04',
    category: 'mentor',
    role_title: 'Product Design & Design Systems Mentor',
    handle: 'sdc_mentor_04',
    status: 'Design Systems',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Product designer guiding participants on UI/UX interaction, visual design systems, and rapid prototype validation.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'mentor-5',
    name: 'SDC Mentor 05',
    category: 'mentor',
    role_title: 'DevOps & Cloud Infrastructure Mentor',
    handle: 'sdc_mentor_05',
    status: 'DevOps & SRE',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Cloud and CI/CD practitioner assisting hackathon squads with automated deployment pipelines and live server stability.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'mentor-6',
    name: 'SDC Mentor 06',
    category: 'mentor',
    role_title: 'Cybersecurity & Threat Modeling Mentor',
    handle: 'sdc_mentor_06',
    status: 'AppSec & Defense',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Security advisor mentoring contestants on secure coding guidelines, auth protocols, and defensive application architecture.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'mentor-7',
    name: 'SDC Mentor 07',
    category: 'mentor',
    role_title: 'Competitive Programming & Algorithms Mentor',
    handle: 'sdc_mentor_07',
    status: 'Algorithms & DP',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Competitive programming mentor assisting Codeathon problem tracks, time-complexity analysis, and data structure strategies.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 7,
    is_active: true,
  },

  // ==========================================
  // 3. COORDINATORS (10 CARDS) - PLACEHOLDERS
  // ==========================================
  {
    id: 'coord-1',
    name: 'SDC Coordinator 01',
    category: 'coordinator',
    role_title: 'President & Lead Event Organizer, SDC',
    handle: 'sdc_team_01',
    status: 'President',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Overseeing HackFest 3.0 operations, competition tracks, technical infrastructure, and pan-institutional engagement.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'coord-2',
    name: 'SDC Coordinator 02',
    category: 'coordinator',
    role_title: 'Vice President & Technical Operations',
    handle: 'sdc_team_02',
    status: 'Vice President',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Coordinating judging arena rubrics, evaluation systems, and inter-college team admissions across HackFest 3.0.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'coord-3',
    name: 'SDC Coordinator 03',
    category: 'coordinator',
    role_title: 'Head of Web Systems & DevOps',
    handle: 'sdc_team_03',
    status: 'Web Architect',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Architecting the HackFest 3.0 web application, real-time leaderboard sockets, and submission pipeline.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'coord-4',
    name: 'SDC Coordinator 04',
    category: 'coordinator',
    role_title: 'Flagship 48H Hackathon Coordinator',
    handle: 'sdc_team_04',
    status: 'Hackathon Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Managing the 48-hour prototype sprint, checkpoint reviews, hardware lab stations, and mentor routing.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'coord-5',
    name: 'SDC Coordinator 05',
    category: 'coordinator',
    role_title: 'Codeathon Arena & Problem Track Lead',
    handle: 'sdc_team_05',
    status: 'Codeathon Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Curating algorithmic challenge testcases, automated test runners, and anti-cheat telemetry for the speed coding arena.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'coord-6',
    name: 'SDC Coordinator 06',
    category: 'coordinator',
    role_title: 'Ideathon & Pitch Track Coordinator',
    handle: 'sdc_team_06',
    status: 'Ideathon Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Coordinating concept presentations, pitch deck formatting, prototype vetting, and jury briefing for Ideathon.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'coord-7',
    name: 'SDC Coordinator 07',
    category: 'coordinator',
    role_title: 'Logistics & Campus Arena Manager',
    handle: 'sdc_team_07',
    status: 'Arena Operations',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Managing high-density power distribution, network hardware, hacking hall seating layout, and physical facilities.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 7,
    is_active: true,
  },
  {
    id: 'coord-8',
    name: 'SDC Coordinator 08',
    category: 'coordinator',
    role_title: 'Public Relations & Sponsor Liaison',
    handle: 'sdc_team_08',
    status: 'Sponsor Liaison',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Leading sponsor communications, community partnerships, campus outreach across colleges, and press liaison.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 8,
    is_active: true,
  },
  {
    id: 'coord-9',
    name: 'SDC Coordinator 09',
    category: 'coordinator',
    role_title: 'Creative Media & Motion Design Lead',
    handle: 'sdc_team_09',
    status: 'Creative Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Directing the visual identity, festival trailers, signage branding, and digital media creative assets for HackFest 3.0.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 9,
    is_active: true,
  },
  {
    id: 'coord-10',
    name: 'SDC Coordinator 10',
    category: 'coordinator',
    role_title: 'Participant Registry & Hospitality Lead',
    handle: 'sdc_team_10',
    status: 'Registry Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: '/images/sdc-avatar-placeholder.svg',
    miniAvatarUrl: '/images/sdc-avatar-placeholder.svg',
    bio: 'Managing registration verification, credential badge distribution, outstation team accommodation, and queries.',
    email: 'sdc2021recbanda@gmail.com',
    social_links: {
      linkedin: 'https://www.linkedin.com/company/student-developer-club-rec-banda',
      email: 'sdc2021recbanda@gmail.com',
    },
    sort_order: 10,
    is_active: true,
  },
];

export const sdcService = {
  /**
   * Fetch active SDC members grouped by category for public page
   */
  async getPublicMembers() {
    if (!isSupabaseConfigured) {
      return this.groupMembers(defaultSdcMembers);
    }

    try {
      const { data, error } = await supabase
        .from('sdc_members')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return this.groupMembers(defaultSdcMembers);
      }

      return this.groupMembers(data);
    } catch {
      return this.groupMembers(defaultSdcMembers);
    }
  },

  /**
   * Group members into sections:
   * 0. Director
   * 1. Faculty Coordinator
   * 2. Mentors
   * 3. Coordinators
   * 4. Volunteers
   */
  groupMembers(list) {
    let director = list
      .filter((m) => m.category === 'director' || m.category === 'patron')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Fallback to default director if none found in active DB list
    if (director.length === 0) {
      director = defaultSdcMembers.filter((m) => m.category === 'director');
    }

    const faculty = list
      .filter((m) => m.category === 'faculty_coordinator')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const mentors = list
      .filter((m) => m.category === 'mentor')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const coordinators = list
      .filter((m) => m.category === 'coordinator')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const volunteers = list
      .filter((m) => m.category === 'volunteer')
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return {
      director,
      faculty,
      mentors,
      coordinators,
      volunteers,
      all: [...director, ...faculty, ...mentors, ...coordinators, ...volunteers],
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
      return (data || []).map((m) => ({
        ...m,
        linkedin_url: m.social_links?.linkedin || m.linkedin_url || '',
        github_url: m.social_links?.github || m.github_url || '',
        public_contact_email: m.social_links?.email || m.public_contact_email || m.email || '',
      }));
    } catch (err) {
      console.warn('Failed to load sdc_members from Supabase:', err.message);
      return [];
    }
  },

  /**
   * Add a new SDC member or volunteer
   */
  async createMember(memberData) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const social_links = {
      ...(memberData.social_links || {}),
    };
    if (memberData.linkedin_url !== undefined) {
      social_links.linkedin = memberData.linkedin_url.trim() || undefined;
    }
    if (memberData.github_url !== undefined) {
      social_links.github = memberData.github_url.trim() || undefined;
    }
    if (memberData.public_contact_email !== undefined) {
      social_links.email = memberData.public_contact_email.trim() || undefined;
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
          social_links,
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
   * Update an existing SDC member or volunteer
   */
  async updateMember(id, updates) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload = { ...updates };

    // Format social_links safely
    if (
      updates.linkedin_url !== undefined ||
      updates.github_url !== undefined ||
      updates.public_contact_email !== undefined
    ) {
      payload.social_links = {
        ...(payload.social_links || {}),
        ...(updates.linkedin_url !== undefined ? { linkedin: updates.linkedin_url.trim() || undefined } : {}),
        ...(updates.github_url !== undefined ? { github: updates.github_url.trim() || undefined } : {}),
        ...(updates.public_contact_email !== undefined ? { email: updates.public_contact_email.trim() || undefined } : {}),
      };
      delete payload.linkedin_url;
      delete payload.github_url;
      delete payload.public_contact_email;
    }

    const { data, error } = await supabase
      .from('sdc_members')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an SDC member or volunteer
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
