import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Users,
  User,
  Mail,
  Phone,
  School,
  FileText,
  Upload,
  Plus,
  Trash2,
  FileCheck,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { registrationService } from '../services/registrationService';
import { eventService } from '../services/eventService';
import { isDeadlineExpired } from '../utils/eventTime';
import { competitions } from '../data/eventData';
import CompetitionDropdown from '../components/ui/CompetitionDropdown';
import CustomSelect from '../components/ui/CustomSelect';

export default function RegisterPage() {
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // 1. Target arena selection
  const targetArenaParam = (
    searchParams.get('competition') ||
    searchParams.get('arena') ||
    location.state?.arena ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('hf_selected_arena') : '') ||
    ''
  ).toLowerCase();

  const [arena, setArena] = useState(
    targetArenaParam && ['hackathon', 'codeathon', 'ideathon'].includes(targetArenaParam)
      ? targetArenaParam
      : 'hackathon'
  );

  // Leader / Registrant Details
  const [leaderDetails, setLeaderDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: 'Rajkiya Engineering College Banda',
    branch: '',
    year: '3rd Year',
  });

  // Team Details
  const [teamName, setTeamName] = useState('');
  const [teamCollege, setTeamCollege] = useState('Rajkiya Engineering College Banda');
  const [teamDescription, setTeamDescription] = useState('');

  // Teammates List (Dynamic: 1 to 3 members for Hackathon, 0 to 2 for Ideathon)
  const [members, setMembers] = useState([
    {
      name: '',
      email: '',
      phone: '',
      college: 'Rajkiya Engineering College Banda',
      branch: '',
      year: '3rd Year',
    },
  ]);

  // Document Upload
  const [documentFile, setDocumentFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Meta & Settings
  const [problemCategory, setProblemCategory] = useState('');
  const [experience, setExperience] = useState('intermediate');
  const [agreeRules, setAgreeRules] = useState(false);

  const [availableCompetitions, setAvailableCompetitions] = useState(competitions);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [eventSettings, setEventSettings] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState([]);

  const [participationStatus, setParticipationStatus] = useState({
    isChecking: false,
    isParticipating: false,
    message: null,
    teamName: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  // Determine competition metadata
  const currentComp = availableCompetitions.find((c) => c.id === arena) || availableCompetitions[0];
  const isSoloCompetition = currentComp?.id === 'codeathon' || currentComp?.max_team_size === 1;

  // Min / Max team sizes: strictly 3 to 4 members total (leader + 2 to 3 teammates) for Ideathon & Hackathon
  const minTeamSize = isSoloCompetition ? 1 : 3;
  const maxTeamSize = isSoloCompetition ? 1 : 4;
  const currentTotalSize = 1 + members.length; // Leader + teammates

  // Sync arena selection
  useEffect(() => {
    if (targetArenaParam) {
      const matched = availableCompetitions.find(
        (c) => c.id?.toLowerCase() === targetArenaParam || c.dbId === targetArenaParam
      );
      if (matched) {
        setArena(matched.id);
        try { sessionStorage.setItem('hf_selected_arena', matched.id); } catch {}
      }
    }
  }, [targetArenaParam, availableCompetitions]);

  // Pre-fill leader profile info from auth
  useEffect(() => {
    if (profile) {
      setLeaderDetails((prev) => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        college: profile.college || prev.college,
        branch: profile.branch || prev.branch,
        year: profile.year || prev.year,
      }));
      setTeamCollege(profile.college || 'Rajkiya Engineering College Banda');
    } else if (user) {
      setLeaderDetails((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.user_metadata?.full_name || prev.fullName,
      }));
    }
  }, [user, profile]);

  // Load existing registrations
  useEffect(() => {
    if (user?.id) {
      registrationService.getUserRegistrations(user.id)
        .then((regs) => {
          if (Array.isArray(regs)) setUserRegistrations(regs);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  // Load event settings, competitions and problem categories
  useEffect(() => {
    eventService.getSettings().then((st) => {
      if (st) setEventSettings(st);
    });
    eventService.getCompetitions().then((res) => {
      if (res?.length > 0) setAvailableCompetitions(res);
    });
    eventService.getProblemCategories().then((res) => {
      if (res?.length > 0) setAvailableCategories(res);
    });
  }, []);

  // Set default members count when switching between Hackathon / Ideathon / Codeathon
  useEffect(() => {
    if (isSoloCompetition) {
      setMembers([]);
      setProblemCategory('');
      setDocumentFile(null);
      setFileError('');
    } else if (members.length < 2) {
      // Team registration requires 3 to 4 members total: 1 Leader + 2 to 3 Teammates
      const needed = 2 - members.length;
      const initialTeammates = Array.from({ length: needed }, () => ({
        name: '',
        email: '',
        phone: '',
        college: leaderDetails.college || 'Rajkiya Engineering College Banda',
        branch: '',
        year: '3rd Year',
      }));
      setMembers((prev) => [...prev, ...initialTeammates]);
    }
  }, [arena, isSoloCompetition]);

  // Accessible dropdown option arrays - exclusively authoritative problem categories
  const categoryOptions = availableCategories.map((cat, idx) => {
    const num = cat.number || String(idx + 1).padStart(2, '0');
    return {
      value: cat.id || cat.slug,
      label: `Track ${num} — ${cat.title}`,
      sublabel: cat.theme || null,
    };
  });

  const academicYearOptions = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
    { value: 'Postgraduate', label: 'Postgraduate' },
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Beginner (1st/2nd time in a Hackathon)' },
    { value: 'intermediate', label: 'Intermediate (Built multiple projects)' },
    { value: 'advanced', label: 'Advanced / Seasoned Competitor' },
  ];

  // Double participation check for the leader
  useEffect(() => {
    let isCancelled = false;
    const compId = currentComp?.dbId || currentComp?.id || arena;

    if (!compId || (!user?.id && !leaderDetails.email)) {
      setParticipationStatus({ isChecking: false, isParticipating: false, message: null, teamName: null });
      return;
    }

    const timer = setTimeout(async () => {
      setParticipationStatus((prev) => ({ ...prev, isChecking: true }));
      try {
        const result = await registrationService.checkUserParticipation({
          userId: user?.id,
          email: leaderDetails.email,
          competitionId: compId,
        });
        if (!isCancelled) {
          setParticipationStatus({
            isChecking: false,
            isParticipating: result.isParticipating,
            message: result.message,
            teamName: result.teamName,
          });
        }
      } catch {
        if (!isCancelled) setParticipationStatus((prev) => ({ ...prev, isChecking: false }));
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [arena, user?.id, leaderDetails.email, currentComp]);

  // Teammate management
  const handleAddMember = () => {
    if (currentTotalSize >= maxTeamSize) return;
    setMembers((prev) => [
      ...prev,
      {
        name: '',
        email: '',
        phone: '',
        college: leaderDetails.college || 'Rajkiya Engineering College Banda',
        branch: '',
        year: '3rd Year',
      },
    ]);
  };

  const handleRemoveMember = (index) => {
    if (currentTotalSize <= minTeamSize) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Document file selection & dropzone handling
  const handleFileSelect = (file) => {
    setFileError('');
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const validExts = ['.pptx', '.ppt', '.pdf'];
    const isValid = validExts.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setFileError('Invalid file type. Please upload a Presentation (.pptx, .ppt) or Document (.pdf).');
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSize) {
      setFileError(`File size exceeds 25MB limit (actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    setDocumentFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConfigured) {
      setError('Database connection is not configured.');
      return;
    }

    if (!agreeRules) {
      setError('You must accept the official rules and code of conduct to register.');
      return;
    }

    // Leader / Participant validation
    if (!leaderDetails.fullName.trim()) {
      setError('Please provide the full name for the participant / team leader.');
      return;
    }
    const cleanLeaderEmail = (leaderDetails.email || user?.email || '').trim().toLowerCase();
    if (!cleanLeaderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanLeaderEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!leaderDetails.phone.trim() || !/^\+?[0-9\s-]{10,14}$/.test(leaderDetails.phone.trim())) {
      setError('Please enter a valid 10-digit contact phone number.');
      return;
    }

    // Team validation for Hackathon / Ideathon
    if (!isSoloCompetition) {
      if (!teamName.trim() || teamName.trim().length < 2) {
        setError('Please enter a unique team name (minimum 2 characters).');
        return;
      }

      if (currentTotalSize < minTeamSize) {
        setError(`${currentComp.name} requires at least ${minTeamSize} members. Please add teammate details.`);
        return;
      }
      if (currentTotalSize > maxTeamSize) {
        setError(`${currentComp.name} allows a maximum of ${maxTeamSize} members.`);
        return;
      }

      // Validate all members
      const emailSet = new Set([cleanLeaderEmail]);
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.name.trim()) {
          setError(`Please provide the full name for Teammate #${i + 1}.`);
          return;
        }
        const mEmail = m.email.trim().toLowerCase();
        if (!mEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mEmail)) {
          setError(`Please enter a valid email address for Teammate #${i + 1} (${m.name}).`);
          return;
        }
        if (emailSet.has(mEmail)) {
          setError(`Duplicate email address "${mEmail}". Each team member must have a distinct email address.`);
          return;
        }
        emailSet.add(mEmail);

        if (!m.phone.trim() || !/^\+?[0-9\s-]{10,14}$/.test(m.phone.trim())) {
          setError(`Please provide a valid 10-digit contact phone number for Teammate #${i + 1} (${m.name}).`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      let currentUser = user;
      if (!currentUser) {
        // Seamlessly authenticate participant directly with Supabase Auth
        const participantPassword = `Hackfest3!${cleanLeaderEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanLeaderEmail,
          password: participantPassword,
          options: {
            data: {
              full_name: leaderDetails.fullName.trim(),
              college: leaderDetails.college.trim(),
              branch: leaderDetails.branch.trim(),
              year: leaderDetails.year,
              phone: leaderDetails.phone.trim(),
              role: 'participant',
            },
          },
        });

        if (signUpError) {
          if (signUpError.message?.toLowerCase().includes('already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: cleanLeaderEmail,
              password: participantPassword,
            });
            if (!signInError && signInData?.user) {
              currentUser = signInData.user;
            } else {
              throw new Error(`The email "${cleanLeaderEmail}" is already registered. If this is your account, please verify your details.`);
            }
          } else {
            throw new Error(signUpError.message || 'Failed to initialize participant profile.');
          }
        } else {
          currentUser = signUpData.user;
        }
      }

      if (!currentUser?.id) {
        throw new Error('Unable to establish a secure participant session. Please try again.');
      }

      const compId = currentComp.dbId || currentComp.id;

      if (isSoloCompetition) {
        // Individual Registration (Codeathon) - PPT upload is NOT required and never submitted
        const reg = await registrationService.createRegistration({
          userId: currentUser.id,
          competitionId: compId,
          problemCategoryId: null,
          experienceLevel: experience,
          notes: teamDescription,
          email: cleanLeaderEmail,
          documentFile: null,
        });

        setConfirmationData({
          type: 'individual',
          registration: reg,
          competition: currentComp,
          leader: {
            ...leaderDetails,
            email: cleanLeaderEmail,
          },
          document: null,
        });
        setSubmitted(true);
      } else {
        // Consolidated Team Registration (Hackathon / Ideathon)
        const result = await registrationService.createConsolidatedTeamRegistration({
          userId: currentUser.id,
          competitionId: compId,
          teamName: teamName.trim(),
          teamCollege: teamCollege.trim(),
          teamDescription: teamDescription.trim(),
          problemCategoryId: problemCategory || null,
          leaderDetails: {
            ...leaderDetails,
            email: cleanLeaderEmail,
          },
          members: members.map((m) => ({
            name: m.name.trim(),
            email: m.email.trim().toLowerCase(),
            phone: m.phone.trim(),
            college: m.college.trim(),
            branch: m.branch.trim(),
            year: m.year,
          })),
          documentFile: documentFile,
          experienceLevel: experience,
          notes: teamDescription,
        });

        setConfirmationData({
          type: 'team',
          team: result.team,
          teamCode: result.teamCode,
          registration: result.registration,
          competition: currentComp,
          leader: leaderDetails,
          members: members,
          document: result.document?.document_name ? result.document : (documentFile ? { name: documentFile.name } : null),
        });
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // SUCCESS CONFIRMATION VIEW
  // --------------------------------------------------------------------------
  if (submitted && confirmationData) {
    return (
      <div style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div
            style={{
              background: 'rgba(30, 36, 45, 0.9)',
              border: '1px solid var(--color-arc-cyan)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 217, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--color-arc-cyan), var(--color-warm-amber))',
              }}
            />

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0, 217, 255, 0.15)',
                  border: '1px solid var(--color-arc-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <CheckCircle2 size={36} color="var(--color-arc-cyan)" />
              </div>

              <span className="chapter-badge">REGISTRATION CONFIRMED</span>
              <h2 className="heading-display" style={{ fontSize: '2rem', color: 'var(--color-warm-off-white)', margin: '0.4rem 0' }}>
                YOU'RE OFFICIALLY IN!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
                Your complete team registration has been securely registered in the HackFest 3.0 master ledger.
              </p>
            </div>

            {/* Team Pass Details */}
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>ARENA / EVENT</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-arc-cyan)' }}>
                    {confirmationData.competition?.name}
                  </div>
                </div>

                {confirmationData.type === 'team' && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>TEAM NAME</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-warm-off-white)' }}>
                      {confirmationData.team?.name}
                    </div>
                  </div>
                )}

                {confirmationData.type === 'team' && confirmationData.teamCode && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>TEAM CODE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--color-warm-amber)', fontWeight: 700 }}>
                      {confirmationData.teamCode}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>TEAM LEADER</div>
                  <div style={{ fontSize: '0.92rem', color: '#fff' }}>
                    {confirmationData.leader?.fullName} ({confirmationData.leader?.email})
                  </div>
                </div>
              </div>

              {/* Roster Breakdown */}
              {confirmationData.type === 'team' && confirmationData.members?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-warm-amber)', marginBottom: '0.6rem' }}>
                    REGISTERED TEAM ROSTER ({1 + confirmationData.members.length} MEMBERS):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#fff', background: 'rgba(255, 255, 255, 0.04)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <span><strong>{confirmationData.leader?.fullName}</strong> (Leader)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{confirmationData.leader?.email}</span>
                    </div>
                    {confirmationData.members.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        <span>{m.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{m.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Confirmation */}
              {confirmationData.document && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileCheck size={20} color="var(--color-arc-cyan)" />
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Attached Presentation Deck: </span>
                    <strong style={{ color: '#fff' }}>{confirmationData.document.document_name || confirmationData.document.name}</strong>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard/team" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} />
                VIEW MY TEAM
              </Link>
              <Link to="/dashboard/registration" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                CHECK REGISTRATION STATUS
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MAIN REGISTRATION FORM
  // --------------------------------------------------------------------------
  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Back Link */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-arc-cyan)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          BACK TO HOMEPAGE
        </Link>

        {/* Heading */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="chapter-badge">PARTICIPANT GATEWAY</span>
          <h1 className="heading-display" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--color-warm-off-white)' }}>
            HACKFEST 3.0 REGISTRATION
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '680px', lineHeight: 1.6 }}>
            {isSoloCompetition
              ? 'Register as an individual participant for Codeathon (Day 1 speed algorithm arena).'
              : 'Register your full team in one submission. The team leader completes registration for all members.'}
          </p>
        </div>

        {/* Participation Warning Banner if already participating */}
        {participationStatus.isParticipating && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <AlertCircle size={22} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#f87171', fontSize: '0.95rem', margin: '0 0 0.25rem 0', fontWeight: 600 }}>
                ALREADY REGISTERED IN THIS ARENA
              </h4>
              <p style={{ color: '#fca5a5', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                {participationStatus.message ||
                  `You are already participating in ${currentComp?.name}. One email ID can only join one team per event.`}
              </p>
            </div>
          </div>
        )}

        {/* Error Notification Banner */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <AlertCircle size={22} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ color: '#fca5a5', fontSize: '0.88rem', lineHeight: 1.5 }}>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* ============================================================== */}
          {/* STEP 1: SELECT ARENA / COMPETITION                              */}
          {/* ============================================================== */}
          <div
            style={{
              background: 'rgba(30, 36, 45, 0.75)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--color-arc-cyan)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                1
              </span>
              <h3 className="heading-display" style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
                CHOOSE COMPETITION TRACK
              </h3>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                COMPETITION SELECTOR
              </label>
              <CompetitionDropdown
                value={arena}
                onChange={(e) => {
                  setArena(e.target.value);
                  setError('');
                }}
                availableCompetitions={availableCompetitions}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {availableCompetitions.map((comp) => {
                const isSelected = arena === comp.id || arena === comp.slug;
                const isSolo = comp.id === 'codeathon' || comp.max_team_size === 1;
                const minS = isSolo ? 1 : 3;
                const maxS = isSolo ? 1 : 4;

                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setArena(comp.id);
                      setError('');
                    }}
                    style={{
                      background: isSelected ? 'rgba(0, 217, 255, 0.08)' : 'rgba(17, 24, 39, 0.6)',
                      border: `1.5px solid ${isSelected ? 'var(--color-arc-cyan)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="chapter-badge" style={{ margin: 0, fontSize: '0.68rem' }}>
                        {comp.format || (isSolo ? 'SOLO' : 'TEAM')}
                      </span>
                      {isSelected && <CheckCircle2 size={16} color="var(--color-arc-cyan)" />}
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', margin: '0.3rem 0' }}>
                      {comp.name}
                    </h4>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isSolo
                        ? 'Individual Solo Arena'
                        : `Team Size: ${minS} - ${maxS} Members`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 2: TEAM DETAILS (FOR HACKATHON & IDEATHON)                */}
          {/* ============================================================== */}
          {!isSoloCompetition && (
            <div
              style={{
                background: 'rgba(30, 36, 45, 0.75)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--color-arc-cyan)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  2
                </span>
                <h3 className="heading-display" style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
                  TEAM PROFILE
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-warm-amber)', marginBottom: '0.4rem' }}>
                    TEAM NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., CyberKnights, QuantumByte"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#111827',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-warm-amber)', marginBottom: '0.4rem' }}>
                    COLLEGE / INSTITUTION
                  </label>
                  <input
                    type="text"
                    value={teamCollege}
                    onChange={(e) => setTeamCollege(e.target.value)}
                    placeholder="Rajkiya Engineering College Banda"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#111827',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  TEAM BRIEF / PROJECT SYNOPSIS (OPTIONAL)
                </label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Briefly describe what your team aims to build, special domain interests, or past experience..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: LEADER / PARTICIPANT DETAILS                            */}
          {/* ============================================================== */}
          <div
            style={{
              background: 'rgba(30, 36, 45, 0.75)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--color-arc-cyan)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                {isSoloCompetition ? '2' : '3'}
              </span>
              <h3 className="heading-display" style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
                {isSoloCompetition ? 'PARTICIPANT DETAILS' : 'TEAM LEADER (YOU)'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={leaderDetails.fullName}
                  onChange={(e) => setLeaderDetails({ ...leaderDetails, fullName: e.target.value })}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  {user ? 'EMAIL ADDRESS (LOGGED IN) *' : 'EMAIL ADDRESS *'}
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(user)}
                  value={leaderDetails.email || (user?.email || '')}
                  onChange={(e) => setLeaderDetails({ ...leaderDetails, email: e.target.value })}
                  placeholder="e.g. participant@example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: user ? '#0d131f' : '#111827',
                    border: '1px solid ' + (user ? 'var(--border-subtle)' : 'var(--border-medium)'),
                    borderRadius: 'var(--radius-sm)',
                    color: user ? 'var(--color-arc-cyan)' : '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                    cursor: user ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  PHONE NUMBER (10 DIGITS) *
                </label>
                <input
                  type="tel"
                  required
                  value={leaderDetails.phone}
                  onChange={(e) => setLeaderDetails({ ...leaderDetails, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  COLLEGE / INSTITUTION *
                </label>
                <input
                  type="text"
                  required
                  value={leaderDetails.college}
                  onChange={(e) => setLeaderDetails({ ...leaderDetails, college: e.target.value })}
                  placeholder="Rajkiya Engineering College Banda"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  BRANCH / DEPARTMENT
                </label>
                <input
                  type="text"
                  value={leaderDetails.branch}
                  onChange={(e) => setLeaderDetails({ ...leaderDetails, branch: e.target.value })}
                  placeholder="e.g., Information Technology"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <CustomSelect
                  label="ACADEMIC YEAR"
                  value={leaderDetails.year}
                  onChange={(e) => setLeaderDetails({ ...leaderDetails, year: e.target.value })}
                  options={academicYearOptions}
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 4: TEAMMATES ROSTER (FOR HACKATHON & IDEATHON)             */}
          {/* ============================================================== */}
          {!isSoloCompetition && (
            <div
              style={{
                background: 'rgba(30, 36, 45, 0.75)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--color-arc-cyan)',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    4
                  </span>
                  <div>
                    <h3 className="heading-display" style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
                      TEAMMATES ROSTER
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-warm-amber)' }}>
                      TEAM SIZE: {currentTotalSize} / {maxTeamSize} (MIN: {minTeamSize}, MAX: {maxTeamSize})
                    </div>
                  </div>
                </div>

                {currentTotalSize < maxTeamSize && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Plus size={14} />
                    ADD TEAMMATE
                  </button>
                )}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Enter the details of your teammates below. <strong>Teammates do not need to create an account beforehand</strong>; you register on their behalf.
              </p>

              {members.length === 0 ? (
                <div style={{ background: '#111827', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                  No additional teammates added yet. Click "+ ADD TEAMMATE" above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {members.map((mem, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-arc-cyan)', fontWeight: 600 }}>
                          TEAMMATE #{index + 1}
                        </span>
                        {/* Allow removal if total size stays >= minTeamSize */}
                        {currentTotalSize > minTeamSize && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f87171',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            <Trash2 size={14} />
                            REMOVE
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            FULL NAME *
                          </label>
                          <input
                            type="text"
                            required
                            value={mem.name}
                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            placeholder="Teammate name"
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              background: '#1F2937',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            EMAIL ADDRESS *
                          </label>
                          <input
                            type="email"
                            required
                            value={mem.email}
                            onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                            placeholder="teammate@example.com"
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              background: '#1F2937',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            PHONE NUMBER *
                          </label>
                          <input
                            type="tel"
                            required
                            value={mem.phone}
                            onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                            placeholder="10-digit number"
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              background: '#1F2937',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            COLLEGE / INSTITUTION *
                          </label>
                          <input
                            type="text"
                            required
                            value={mem.college}
                            onChange={(e) => handleMemberChange(index, 'college', e.target.value)}
                            placeholder="College name"
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              background: '#1F2937',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            BRANCH
                          </label>
                          <input
                            type="text"
                            value={mem.branch}
                            onChange={(e) => handleMemberChange(index, 'branch', e.target.value)}
                            placeholder="e.g. CSE / IT"
                            style={{
                              width: '100%',
                              padding: '0.65rem',
                              background: '#1F2937',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#fff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>

                        <div>
                          <CustomSelect
                            label="ACADEMIC YEAR"
                            value={mem.year}
                            onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                            options={academicYearOptions}
                            triggerStyle={{
                              padding: '0.65rem 0.85rem',
                              fontSize: '0.85rem',
                              background: '#1F2937',
                              borderColor: 'var(--border-subtle)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 5: PRESENTATION / PROPOSAL UPLOAD (PPT/PPTX/PDF) - TEAMS  */}
          {/* ============================================================== */}
          {!isSoloCompetition && (
            <div
              style={{
                background: 'rgba(30, 36, 45, 0.75)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--color-arc-cyan)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  5
                </span>
                <h3 className="heading-display" style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
                  IDEA PRESENTATION / SYNOPSIS (PPTX / PDF)
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Attach your preliminary slide deck, abstract, or synopsis (PPT, PPTX, or PDF, maximum 25MB). Per the official rulebook, presentation slide decks must contain a maximum of 6 to 7 pages. You can replace or update this document at any point before judging.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pptx,.ppt,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {!documentFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--color-arc-cyan)' : 'var(--border-medium)'}`,
                    background: isDragging ? 'rgba(0, 217, 255, 0.08)' : 'rgba(17, 24, 39, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Upload size={32} color="var(--color-arc-cyan)" style={{ margin: '0 auto 0.75rem auto' }} />
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Click to browse or drag & drop presentation file
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    SUPPORTED: PPTX, PPT, PDF (MAXIMUM 25MB)
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid var(--color-arc-cyan)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <FileText size={28} color="var(--color-arc-cyan)" />
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all' }}>
                        {documentFile.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(documentFile.size / (1024 * 1024)).toFixed(2)} MB • READY FOR UPLOAD
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                    >
                      CHANGE FILE
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#f87171',
                        padding: '0.4rem 0.65rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={14} />
                  {fileError}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 6: PROBLEM TRACK & RULES AGREEMENT                         */}
          {/* ============================================================== */}
          <div
            style={{
              background: 'rgba(30, 36, 45, 0.75)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--color-arc-cyan)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                {isSoloCompetition ? '3' : '6'}
              </span>
              <h3 className="heading-display" style={{ fontSize: '1.25rem', margin: 0, color: '#fff' }}>
                {isSoloCompetition ? 'PARTICIPANT PREFERENCE & VERIFICATION' : 'TRACK PREFERENCE & VERIFICATION'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {!isSoloCompetition && (
                <div>
                  <CustomSelect
                    label="PREFERRED PROBLEM CATEGORY (OPTIONAL FOR NOW)"
                    value={problemCategory}
                    onChange={(e) => setProblemCategory(e.target.value)}
                    options={categoryOptions}
                    placeholder="Select a problem statement"
                  />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Choose from the 6 crisis tracks. You can refine your implementation during the event.
                  </div>
                </div>
              )}

              <div>
                <CustomSelect
                  label="EXPERIENCE LEVEL"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  options={experienceOptions}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--color-arc-cyan)' }}
                />
                <span>
                  I confirm that all team details provided are accurate and that all registered participants agree to the{' '}
                  <strong style={{ color: '#fff' }}>HackFest 3.0 Code of Conduct</strong>, zero-plagiarism policy, and on-site attendance guidelines at Rajkiya Engineering College Banda.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading || participationStatus.isParticipating}
              className="btn btn-primary"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '1rem 2rem',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                opacity: (loading || participationStatus.isParticipating) ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  CONFIRMING REGISTRATION...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  SUBMIT COMPLETE TEAM REGISTRATION
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
