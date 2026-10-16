import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Default initial SDC member hierarchy for REC Banda
export const defaultSdcMembers = [
  // ==========================================
  // 1. FACULTY COORDINATOR (2 CARDS)
  // ==========================================
  {
    id: 'faculty-1',
    name: 'Dr. Pushpendra Singh',
    category: 'faculty_coordinator',
    role_title: 'Faculty Advisor & Convener, SDC',
    handle: 'pushpendra_sdc',
    status: 'Faculty Convener',
    statusColor: '#F5C451',
    backdropColor: '#282015',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    bio: 'Associate Professor, Department of Information Technology, REC Banda. Guiding research and student developer initiatives in cutting-edge computing.',
    email: 'pushpendra@recbanda.ac.in',
    social_links: {
      linkedin: 'https://linkedin.com',
      email: 'pushpendra@recbanda.ac.in',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'faculty-2',
    name: 'Dr. Ankita Srivastava',
    category: 'faculty_coordinator',
    role_title: 'Co-Faculty Coordinator, SDC',
    handle: 'ankita_recb',
    status: 'Faculty Co-Convener',
    statusColor: '#F5C451',
    backdropColor: '#282015',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    bio: 'Assistant Professor, REC Banda. Fostering multidisciplinary innovation, research mentorship, and student technical chapters.',
    email: 'ankita@recbanda.ac.in',
    social_links: {
      linkedin: 'https://linkedin.com',
      email: 'ankita@recbanda.ac.in',
    },
    sort_order: 2,
    is_active: true,
  },

  // ==========================================
  // 2. MENTORS (7 CARDS)
  // ==========================================
  {
    id: 'mentor-1',
    name: 'Er. Anurag Verma',
    category: 'mentor',
    role_title: 'Lead Systems Architect & SDC Alum',
    handle: 'anurag_cloud',
    status: 'Cloud & Scale',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    bio: 'Software Engineer & SDC Alum. Advising builders on scalable cloud architectures, high-performance systems, and hackathon execution.',
    email: 'anurag.mentor@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'mentor-2',
    name: 'Er. Priya Sharma',
    category: 'mentor',
    role_title: 'Senior AI / ML Research Mentor',
    handle: 'priya_aiml',
    status: 'AI/ML & Vision',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120',
    bio: 'Machine learning scientist specializing in deep learning, multimodal vision architectures, and practical neural model deployment.',
    email: 'priya.mentor@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'mentor-3',
    name: 'Er. Rohit Patel',
    category: 'mentor',
    role_title: 'Distributed Systems & Web3 Lead',
    handle: 'rohit_distrib',
    status: 'Web3 & Backend',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120',
    bio: 'Backend infrastructure specialist mentoring teams on distributed consensus, microservices, and database tuning under load.',
    email: 'rohit.mentor@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'mentor-4',
    name: 'Er. Shreya Tripathi',
    category: 'mentor',
    role_title: 'Product Design & Design Systems Mentor',
    handle: 'shreya_ux',
    status: 'Design Systems',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=120',
    bio: 'Product designer shaping modern user interaction, typography hierarchy, visual accessibility, and design systems.',
    email: 'shreya.mentor@recbanda.ac.in',
    social_links: {
      linkedin: 'https://linkedin.com',
    },
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'mentor-5',
    name: 'Er. Vivek Kumar',
    category: 'mentor',
    role_title: 'DevOps & Cloud Infrastructure Mentor',
    handle: 'vivek_infra',
    status: 'DevOps & SRE',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    bio: 'Kubernetes and CI/CD practitioner guiding students through automated deployment pipelines and cloud reliability.',
    email: 'vivek.mentor@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'mentor-6',
    name: 'Er. Neha Gupta',
    category: 'mentor',
    role_title: 'Cybersecurity & Threat Modeling Mentor',
    handle: 'neha_sec',
    status: 'AppSec & Defense',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    bio: 'Information security consultant advising builders on secure software development lifecycle, auth mechanisms, and cryptography.',
    email: 'neha.mentor@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'mentor-7',
    name: 'Er. Aman Srivastava',
    category: 'mentor',
    role_title: 'Competitive Programming & Algorithms Mentor',
    handle: 'aman_algo',
    status: 'Algorithms & DP',
    statusColor: '#63E6D1',
    backdropColor: '#10262b',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
    bio: 'Master-level competitive programmer preparing Codeathon contestants on graph theory, dynamic programming, and computational geometry.',
    email: 'aman.mentor@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 7,
    is_active: true,
  },

  // ==========================================
  // 3. COORDINATORS (10 CARDS)
  // ==========================================
  {
    id: 'coord-1',
    name: 'Akash Gupta',
    category: 'coordinator',
    role_title: 'President & Lead Event Organizer, SDC',
    handle: 'akash_lead',
    status: 'President',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    bio: 'Overseeing HackFest 3.0 operations, competition tracks, technical infrastructure, and pan-institutional engagement.',
    email: 'akash@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'coord-2',
    name: 'Ananya Mishra',
    category: 'coordinator',
    role_title: 'Vice President & Technical Operations',
    handle: 'ananya_tech',
    status: 'Vice President',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    bio: 'Coordinating judging arena rubrics, evaluation systems, and inter-college team admissions across HackFest 3.0.',
    email: 'ananya@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'coord-3',
    name: 'Rohan Kumar',
    category: 'coordinator',
    role_title: 'Head of Web Systems & DevOps',
    handle: 'rohan_dev',
    status: 'Web Architect',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120',
    bio: 'Architecting the HackFest 3.0 web application, real-time leaderboard sockets, and submission pipeline.',
    email: 'rohan@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'coord-4',
    name: 'Kavya Singh',
    category: 'coordinator',
    role_title: 'Flagship 48H Hackathon Coordinator',
    handle: 'kavya_hack',
    status: 'Hackathon Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=120',
    bio: 'Managing the 48-hour prototype sprint, checkpoint reviews, hardware lab stations, and mentor routing.',
    email: 'kavya@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'coord-5',
    name: 'Devansh Tiwari',
    category: 'coordinator',
    role_title: 'Codeathon Arena & Problem Track Lead',
    handle: 'devansh_code',
    status: 'Codeathon Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120',
    bio: 'Curating algorithmic challenge testcases, automated test runners, and anti-cheat telemetry for the speed coding arena.',
    email: 'devansh@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'coord-6',
    name: 'Tanvi Saxena',
    category: 'coordinator',
    role_title: 'Ideathon & Pitch Track Coordinator',
    handle: 'tanvi_pitch',
    status: 'Ideathon Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    bio: 'Coordinating concept presentations, pitch deck formatting, prototype vetting, and jury briefing for Ideathon.',
    email: 'tanvi@recbanda.ac.in',
    social_links: {
      linkedin: 'https://linkedin.com',
    },
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'coord-7',
    name: 'Ayush Yadav',
    category: 'coordinator',
    role_title: 'Logistics & Campus Arena Manager',
    handle: 'ayush_ops',
    status: 'Arena Operations',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120',
    bio: 'Managing high-density power distribution, network hardware, hacking hall seating layout, and physical facilities.',
    email: 'ayush@recbanda.ac.in',
    social_links: {
      linkedin: 'https://linkedin.com',
    },
    sort_order: 7,
    is_active: true,
  },
  {
    id: 'coord-8',
    name: 'Rhea Pandey',
    category: 'coordinator',
    role_title: 'Public Relations & Sponsor Liaison',
    handle: 'rhea_pr',
    status: 'Sponsor Liaison',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=120',
    bio: 'Leading sponsor communications, community partnerships, campus outreach across AKTU colleges, and press liaison.',
    email: 'rhea@recbanda.ac.in',
    social_links: {
      linkedin: 'https://linkedin.com',
    },
    sort_order: 8,
    is_active: true,
  },
  {
    id: 'coord-9',
    name: 'Shivam Verma',
    category: 'coordinator',
    role_title: 'Creative Media & Motion Design Lead',
    handle: 'shivam_art',
    status: 'Creative Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    bio: 'Directing the visual identity, festival trailers, signage branding, and digital media creative assets for HackFest 3.0.',
    email: 'shivam@recbanda.ac.in',
    social_links: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
    },
    sort_order: 9,
    is_active: true,
  },
  {
    id: 'coord-10',
    name: 'Pooja Dubey',
    category: 'coordinator',
    role_title: 'Participant Registry & Hospitality Lead',
    handle: 'pooja_reg',
    status: 'Registry Lead',
    statusColor: '#10B981',
    backdropColor: '#1f162b',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
    miniAvatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    bio: 'Managing registration verification, credential badge distribution, outstation team accommodation, and queries.',
    email: 'pooja@recbanda.ac.in',
    social_links: {
      linkedin: 'https://linkedin.com',
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
