import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Users, Mail, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/registrationService';
import { teamService } from '../services/teamService';
import { eventService } from '../services/eventService';
import { isDeadlineExpired } from '../utils/eventTime';
import { competitions, problemCategories } from '../data/eventData';
import CompetitionDropdown from '../components/ui/CompetitionDropdown';

export default function RegisterPage() {
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 1. Resolve target competition from query params, state, or session storage
  const targetArenaParam = (
    searchParams.get('competition') ||
    searchParams.get('arena') ||
    location.state?.arena ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('hf_selected_arena') : '') ||
    ''
  ).toLowerCase();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: 'Rajkiya Engineering College Banda',
    arena: targetArenaParam && ['hackathon', 'codeathon', 'ideathon'].includes(targetArenaParam) ? targetArenaParam : 'hackathon',
    teamOption: 'create', // 'create', 'join', or 'none'
    teamName: '',
    teamCode: '',
    teammateEmails: ['', ''], // Optional teammates for 'create' mode
    problemCategory: '',
    experience: 'intermediate',
    agreeRules: false,
  });

  const [availableCompetitions, setAvailableCompetitions] = useState(competitions);
  const [availableCategories, setAvailableCategories] = useState(problemCategories);
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

  // Sync arena selection if query parameter is updated or availableCompetitions loads
  useEffect(() => {
    if (targetArenaParam) {
      const matched = availableCompetitions.find(
        (c) => c.id?.toLowerCase() === targetArenaParam || c.dbId === targetArenaParam
      );
      if (matched) {
        setFormData((prev) => ({ ...prev, arena: matched.id }));
        try { sessionStorage.setItem('hf_selected_arena', matched.id); } catch {}
      }
    }
  }, [targetArenaParam, availableCompetitions]);

  // Load user registrations to detect if already registered
  useEffect(() => {
    if (user?.id) {
      registrationService.getUserRegistrations(user.id)
        .then((regs) => {
          if (Array.isArray(regs)) {
            setUserRegistrations(regs);
          }
        })
        .catch((err) => {
          console.warn('Failed to load user registrations:', err);
        });
    }
  }, [user?.id]);

  // Pre-fill profile info if logged in
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.full_name || prev.fullName,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        institution: profile.college || prev.institution,
      }));
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
  }, [user, profile]);

  // Load event settings, competitions and categories from DB if available
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

  // Real-time double-participation check for chosen arena + user / email
  useEffect(() => {
    let isCancelled = false;
    const targetComp = availableCompetitions.find((c) => c.id === formData.arena);
    const compId = targetComp?.dbId || targetComp?.id || formData.arena;

    if (!compId || (!user?.id && !formData.email)) {
      setParticipationStatus({ isChecking: false, isParticipating: false, message: null, teamName: null });
      return;
    }

    const timer = setTimeout(async () => {
      setParticipationStatus((prev) => ({ ...prev, isChecking: true }));
      try {
        const result = await registrationService.checkUserParticipation({
          userId: user?.id,
          email: formData.email,
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
      } catch (err) {
        if (!isCancelled) {
          setParticipationStatus((prev) => ({ ...prev, isChecking: false }));
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formData.arena, formData.email, user?.id, availableCompetitions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'arena') {
      try { sessionStorage.setItem('hf_selected_arena', value); } catch {}
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTeammateEmailChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...(prev.teammateEmails || [])];
      updated[index] = value;
      return { ...prev, teammateEmails: updated };
    });
  };

  const handleAddTeammateField = () => {
    const maxTeammates = formData.arena === 'hackathon' ? 3 : 2;
    if ((formData.teammateEmails?.length || 0) < maxTeammates) {
      setFormData((prev) => ({
        ...prev,
        teammateEmails: [...(prev.teammateEmails || []), ''],
      }));
    }
  };

  const handleRemoveTeammateField = (index) => {
    setFormData((prev) => ({
      ...prev,
      teammateEmails: prev.teammateEmails.filter((_, i) => i !== index),
    }));
  };

  const selectedComp = availableCompetitions.find((c) => c.id === formData.arena) || availableCompetitions[0];
  const requiresTeam = formData.arena === 'hackathon' || formData.arena === 'ideathon';
  const isDeadlinePassed = Boolean(
    eventSettings?.registrationDeadline && isDeadlineExpired(eventSettings.registrationDeadline)
  );
  const isRegistrationClosed = Boolean(
    eventSettings && (eventSettings.registrationOpen === false || eventSettings.registrationStatus === 'CLOSED' || isDeadlinePassed)
  );

  const isSelectedCompClosed = Boolean(
    selectedComp && selectedComp.registrationOpen === false
  );

  const alreadyRegisteredForArena = userRegistrations.find(
    (r) =>
      r.competition_id === selectedComp?.dbId ||
      r.competition_id === selectedComp?.id ||
      r.competition_id === formData.arena ||
      r.competition?.id === formData.arena ||
      r.competition?.slug === formData.arena
  );

  const isAlreadyParticipating = Boolean(alreadyRegisteredForArena || participationStatus.isParticipating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (isRegistrationClosed) {
      setError('Event registration has closed. New submissions are no longer accepted.');
      return;
    }

    if (isSelectedCompClosed) {
      setError(`Registration for ${selectedComp?.title || selectedComp?.name || formData.arena.toUpperCase()} is currently closed.`);
      return;
    }

    if (isAlreadyParticipating) {
      setError(
        participationStatus.message ||
        `You (or this email) are already participating in ${selectedComp?.name || formData.arena.toUpperCase()}. 1 email ID can only participate once per event.`
      );
      return;
    }

    // 1. Validate Full Name
    const cleanFullName = formData.fullName.trim();
    if (!cleanFullName || cleanFullName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    // 2. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Validate Phone Number (10 digits minimum)
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    // 4. Validate College / Institution
    if (!formData.institution.trim()) {
      setError('Please specify your college or institution.');
      return;
    }

    // 5. Code of Conduct agreement
    if (!formData.agreeRules) {
      setError('Please review and agree to the event guidelines.');
      return;
    }

    // 6. Find DB competition id
    const targetComp = availableCompetitions.find((c) => c.id === formData.arena);
    const compId = targetComp?.dbId || targetComp?.id || formData.arena;

    // 7. Team Validations
    let activeTeammates = [];
    if (requiresTeam) {
      if (formData.teamOption === 'create') {
        const cleanTeamName = formData.teamName.trim();
        if (!cleanTeamName || cleanTeamName.length < 2) {
          setError('Please enter a team name (minimum 2 characters).');
          return;
        }
        if (cleanTeamName.length > 50) {
          setError('Team name must not exceed 50 characters.');
          return;
        }

        // Validate optional teammate emails
        activeTeammates = (formData.teammateEmails || [])
          .map((em) => em.trim().toLowerCase())
          .filter(Boolean);

        // Leader email cannot be listed as teammate
        if (activeTeammates.includes(cleanEmail)) {
          setError('Team member email cannot be the same as your leader email.');
          return;
        }

        // Unique teammate emails check
        const uniqueTeammates = new Set(activeTeammates);
        if (uniqueTeammates.size !== activeTeammates.length) {
          setError('Each teammate email must be unique.');
          return;
        }

        // Format and participation check for each teammate
        for (const tEmail of activeTeammates) {
          if (!emailRegex.test(tEmail)) {
            setError(`Invalid teammate email format: "${tEmail}"`);
            return;
          }
          const tCheck = await registrationService.checkUserParticipation({
            email: tEmail,
            competitionId: compId,
          });
          if (tCheck.isParticipating) {
            setError(
              `Teammate "${tEmail}" is already registered or part of a team (${tCheck.teamName || 'another team'}) for this event. 1 email ID can only join 1 team per competition.`
            );
            return;
          }
        }
      } else if (formData.teamOption === 'join') {
        const cleanCode = formData.teamCode.trim().toUpperCase();
        if (!cleanCode) {
          setError('Please enter a valid team invite code.');
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (isConfigured && user) {
        // Final Double Check: Ensure user or email didn't register in parallel
        const finalCheck = await registrationService.checkUserParticipation({
          userId: user.id,
          email: cleanEmail,
          competitionId: compId,
        });
        if (finalCheck.isParticipating) {
          throw new Error(
            finalCheck.message ||
            `You (or email ${cleanEmail}) are already participating in this event.`
          );
        }

        let assignedTeamId = null;
        let createdTeamData = null;

        // If team required, handle create or join
        if (requiresTeam) {
          if (formData.teamOption === 'create') {
            const teamRes = await teamService.createTeam({
              name: formData.teamName.trim(),
              competitionId: compId,
              userId: user.id,
            });
            assignedTeamId = teamRes.team_id;
            createdTeamData = teamRes;

            // Attempt to auto-add registered teammates by email
            for (const tEmail of activeTeammates) {
              try {
                await teamService.addMemberByEmail({
                  teamId: assignedTeamId,
                  email: tEmail,
                  leaderUserId: user.id,
                });
              } catch (memberErr) {
                console.warn(`Could not immediately add teammate ${tEmail}:`, memberErr.message);
              }
            }
          } else if (formData.teamOption === 'join') {
            const joinRes = await teamService.joinTeam({
              code: formData.teamCode.trim().toUpperCase(),
              userId: user.id,
            });
            assignedTeamId = joinRes.team_id;
          }
        }

        // Selected problem category
        const selectedProblem = availableCategories.find(
          (c) => c.slug === formData.problemCategory || c.id === formData.problemCategory
        );
        const probCatId = selectedProblem?.id || null;

        // Create registration record
        const reg = await registrationService.createRegistration({
          userId: user.id,
          competitionId: compId,
          teamId: assignedTeamId,
          problemCategoryId: probCatId,
          experienceLevel: formData.experience,
          notes: `Institution: ${formData.institution.trim()}`,
          email: cleanEmail,
        });

        setConfirmationData({
          ...reg,
          createdTeamCode: createdTeamData?.code || null,
        });
      }

      setSubmitted(true);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Registration error. Please check your data or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warm-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          BACK TO HOME
        </Link>

        <span className="chapter-badge">EVENT REGISTRATION</span>
        <h1 className="heading-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '0.8rem' }}>
          JOIN HACKFEST 3.0
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>
          Register for the event at <strong>Rajkiya Engineering College Banda</strong>.
          There are zero registration fees. <em>Rule: 1 email ID can only participate once per event (as solo, leader, or team member).</em>
        </p>

        {submitted ? (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(53, 248, 172, 0.45)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(53, 248, 172, 0.15)', border: '1px solid #35F8AC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#35F8AC' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 className="heading-display" style={{ fontSize: '2rem', marginBottom: '0.8rem', color: 'var(--color-text-primary)' }}>
              REGISTRATION CONFIRMED
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.02rem', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
              Welcome, <strong>{formData.fullName || 'Participant'}</strong>! Your participation pass for <strong>{selectedComp?.name || formData.arena.toUpperCase()}</strong> has been securely registered with email <strong>{formData.email}</strong>.
            </p>

            {confirmationData?.createdTeamCode && (
              <div style={{ background: 'var(--color-surface-secondary)', border: '1px solid var(--color-infinity-gold)', borderRadius: 'var(--radius-sm)', padding: '1rem', maxWidth: '420px', margin: '0 auto 1.8rem auto' }}>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>
                  YOUR TEAM INVITE CODE:
                </div>
                <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-infinity-gold)', letterSpacing: '0.1em' }}>
                  {confirmationData.createdTeamCode}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                  Share this code with teammates so they can join your team roster.
                </div>
              </div>
            )}

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#35F8AC', marginBottom: '2rem' }}>
              EVENT: {formData.arena.toUpperCase()} • TEAM: {formData.teamName || (formData.teamCode ? `CODE: ${formData.teamCode}` : 'INDIVIDUAL')}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-primary">
                GO TO DASHBOARD
                <ArrowUpRight size={18} />
              </Link>
              <Link to="/" className="btn btn-secondary">
                EXPLORE EVENT DETAILS
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.8rem, 3.5vw, 2.8rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7)' }}>
            {isRegistrationClosed && (
              <div style={{
                background: 'rgba(143, 48, 53, 0.25)',
                border: '1px solid var(--border-accent-crimson)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.2rem 1.4rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                color: '#ffb4b7'
              }}>
                <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', letterSpacing: '0.04em', color: '#ffb4b7', marginBottom: '0.25rem' }}>
                    REGISTRATION CURRENTLY CLOSED
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Event registration for HackFest 3.0 is currently closed by event administration. For queries, contact <strong>{eventSettings?.contactEmail || 'sdc2021recbanda@gmail.com'}</strong>.
                  </div>
                </div>
              </div>
            )}

            {isSelectedCompClosed && !isRegistrationClosed && (
              <div style={{
                background: 'rgba(143, 48, 53, 0.25)',
                border: '1px solid var(--border-accent-crimson)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.2rem 1.4rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                color: '#ffb4b7'
              }}>
                <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', letterSpacing: '0.04em', color: '#ffb4b7', marginBottom: '0.25rem' }}>
                    {selectedComp?.title || selectedComp?.name?.toUpperCase() || formData.arena.toUpperCase()} REGISTRATION CLOSED
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Registration for this specific competition is currently marked as closed. You can select another available competition.
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(143, 48, 53, 0.2)', border: '1px solid var(--border-accent-crimson)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffb4b7', fontSize: '0.88rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Authenticated Participant Badge */}
            {user ? (
              <div style={{ background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.28)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ShieldCheck size={18} color="var(--color-arc-cyan)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    LOGGED IN AS: <strong style={{ color: 'var(--color-text-primary)' }}>{user?.email}</strong>
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-arc-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                  VERIFIED ACCOUNT
                </span>
              </div>
            ) : (
              <div style={{ background: 'rgba(60, 83, 107, 0.25)', border: '1px solid var(--border-accent-steel)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-warm-off-white)' }}>Already have an account?</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Sign in to auto-link your profile and track registrations.</div>
                </div>
                <Link to="/login" state={{ from: location.pathname + location.search }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  SIGN IN FIRST
                </Link>
              </div>
            )}

            {/* Already Participating Warning Banner (Strict 1 Participation per event) */}
            {isAlreadyParticipating && (
              <div style={{
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.45)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <AlertCircle size={20} color="#FBBF24" />
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#FDE047', letterSpacing: '0.04em' }}>
                    ALREADY PARTICIPATING • {selectedComp?.name?.toUpperCase() || formData.arena.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  {participationStatus.message ||
                    `You (or this email) are already participating in ${selectedComp?.name || formData.arena}. Rule: 1 email ID can only participate once per event.`}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <Link to="/dashboard/registration" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                    VIEW IN REGISTRATION DASHBOARD
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Competition Selection */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-warm-amber)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                SELECT COMPETITION *
              </label>
              <CompetitionDropdown
                name="arena"
                value={formData.arena}
                onChange={handleChange}
                availableCompetitions={availableCompetitions}
              />
            </div>

            {/* Team Configuration if required */}
            {requiresTeam && (
              <div style={{ background: 'rgba(28, 32, 38, 0.65)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-warm-amber)', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
                  TEAM MEMBERSHIP * (1 EMAIL ID = 1 TEAM ONLY)
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.92rem' }}>
                    <input
                      type="radio"
                      name="teamOption"
                      value="create"
                      checked={formData.teamOption === 'create'}
                      onChange={handleChange}
                    />
                    <span>Create New Team (As Leader)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.92rem' }}>
                    <input
                      type="radio"
                      name="teamOption"
                      value="join"
                      checked={formData.teamOption === 'join'}
                      onChange={handleChange}
                    />
                    <span>Join with Team Code</span>
                  </label>
                </div>

                {formData.teamOption === 'create' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                        TEAM NAME *
                      </label>
                      <input
                        type="text"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleChange}
                        placeholder="e.g. CyberVanguard"
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                        required={requiresTeam && formData.teamOption === 'create'}
                      />
                    </div>

                    {/* Optional Teammate Email Roster */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px dashed rgba(53, 248, 172, 0.3)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#35F8AC' }}>
                          INVITE TEAMMATES BY EMAIL (OPTIONAL)
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          Team Size: 2 to {formData.arena === 'hackathon' ? '4' : '3'} Members
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {(formData.teammateEmails || []).map((tEmail, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                              <input
                                type="email"
                                value={tEmail}
                                onChange={(e) => handleTeammateEmailChange(idx, e.target.value)}
                                placeholder={`Teammate ${idx + 2} Registered Email`}
                                style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.3rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.86rem' }}
                              />
                            </div>
                            {(formData.teammateEmails?.length || 0) > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTeammateField(idx)}
                                style={{ background: 'none', border: 'none', color: '#ff8b90', cursor: 'pointer', padding: '0.4rem' }}
                                title="Remove teammate slot"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(formData.teammateEmails?.length || 0) < (formData.arena === 'hackathon' ? 3 : 2) && (
                          <button
                            type="button"
                            onClick={handleAddTeammateField}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-arc-cyan)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: 0,
                            }}
                          >
                            <Plus size={14} />
                            ADD ANOTHER TEAMMATE SLOT
                          </button>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          Teammates can also join using your team code later.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                      INVITE TEAM CODE *
                    </label>
                    <input
                      type="text"
                      name="teamCode"
                      value={formData.teamCode}
                      onChange={handleChange}
                      placeholder="e.g. HF3-A4B9F2"
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem', textTransform: 'uppercase' }}
                      required={requiresTeam && formData.teamOption === 'join'}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                      Note: You cannot join multiple teams in the same competition.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Problem Category for Hackathon */}
            {formData.arena === 'hackathon' && (
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-warm-amber)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  PREFERRED PROBLEM CATEGORY (OPTIONAL FOR NOW)
                </label>
                <select
                  name="problemCategory"
                  value={formData.problemCategory}
                  onChange={handleChange}
                  className="stark-select"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: '#0e1420',
                    backgroundColor: '#0e1420',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f4f7fb',
                    colorScheme: 'dark',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  <option
                    value=""
                    style={{ background: '#0e1420', backgroundColor: '#0e1420', color: '#f4f7fb' }}
                  >
                    Decide at Event Opening (Day 2 Briefing)
                  </option>
                  {availableCategories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.slug || cat.id}
                      style={{ background: '#0e1420', backgroundColor: '#0e1420', color: '#f4f7fb' }}
                    >
                      {cat.number}. {cat.theme}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Full Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  FULL NAME *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Arjun Verma"
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  EMAIL ADDRESS * (1 EVENT = 1 REGISTRATION)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@institution.ac.in"
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            {/* Phone & Institution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  PHONE NUMBER * (10 DIGITS)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-soft-gray)', marginBottom: '0.4rem' }}>
                  COLLEGE / INSTITUTION *
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Rajkiya Engineering College Banda"
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            {/* Agreement */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="agreeRules"
                name="agreeRules"
                checked={formData.agreeRules}
                onChange={handleChange}
                style={{ marginTop: '0.3rem', width: '16px', height: '16px', cursor: 'pointer' }}
                required
              />
              <label htmlFor="agreeRules" style={{ fontSize: '0.86rem', color: 'var(--color-soft-gray)', lineHeight: '1.5', cursor: 'pointer' }}>
                I agree to adhere to the HackFest 3.0 Code of Conduct, confirm that this email address is not registered in another team for this event, and verify all details are accurate.
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isRegistrationClosed || isSelectedCompClosed || isAlreadyParticipating}
              style={{
                width: '100%',
                marginTop: '1rem',
                justifyContent: 'center',
                opacity: (isRegistrationClosed || isSelectedCompClosed || isAlreadyParticipating) ? 0.6 : 1,
                cursor: (isRegistrationClosed || isSelectedCompClosed || isAlreadyParticipating) ? 'not-allowed' : 'pointer'
              }}
            >
              {isAlreadyParticipating ? (
                <>
                  <CheckCircle2 size={18} />
                  ALREADY REGISTERED / IN TEAM FOR THIS EVENT
                </>
              ) : isRegistrationClosed ? (
                <>
                  <AlertCircle size={18} />
                  EVENT REGISTRATIONS CLOSED
                </>
              ) : isSelectedCompClosed ? (
                <>
                  <AlertCircle size={18} />
                  REGISTRATION CLOSED FOR {selectedComp?.title || selectedComp?.name || formData.arena.toUpperCase()}
                </>
              ) : loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  VERIFYING & CONFIRMING REGISTRATION...
                </>
              ) : (
                <>
                  CONFIRM REGISTRATION
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
