import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/registrationService';
import { teamService } from '../services/teamService';
import { eventService } from '../services/eventService';
import { isDeadlineExpired } from '../utils/eventTime';
import { competitions, problemCategories } from '../data/eventData';

export default function RegisterPage() {
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: 'Rajkiya Engineering College Banda',
    arena: 'hackathon',
    teamOption: 'create', // 'create', 'join', or 'none'
    teamName: '',
    teamCode: '',
    problemCategory: '',
    experience: 'intermediate',
    agreeRules: false,
  });

  const [availableCompetitions, setAvailableCompetitions] = useState(competitions);
  const [availableCategories, setAvailableCategories] = useState(problemCategories);
  const [eventSettings, setEventSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistrationClosed) {
      setError('Event registration has closed. New submissions are no longer accepted.');
      return;
    }

    if (!formData.agreeRules) {
      setError('Please review and agree to the event guidelines.');
      return;
    }

    setLoading(true);

    try {
      if (isConfigured && user) {
        // Find DB competition id
        const targetComp = availableCompetitions.find((c) => c.id === formData.arena);
        const compId = targetComp?.dbId || targetComp?.id;

        let assignedTeamId = null;

        // If team required, handle create or join
        if (requiresTeam) {
          if (formData.teamOption === 'create') {
            if (!formData.teamName.trim()) {
              throw new Error('Please enter a team name.');
            }
            const teamRes = await teamService.createTeam({
              name: formData.teamName.trim(),
              competitionId: compId,
              userId: user.id,
            });
            assignedTeamId = teamRes.team_id;
          } else if (formData.teamOption === 'join') {
            if (!formData.teamCode.trim()) {
              throw new Error('Please enter a valid team join code.');
            }
            const joinRes = await teamService.joinTeam({
              code: formData.teamCode.trim(),
              userId: user.id,
            });
            assignedTeamId = joinRes.team_id;
          }
        }

        // Selected problem category
        const selectedProblem = availableCategories.find((c) => c.slug === formData.problemCategory || c.id === formData.problemCategory);
        const probCatId = selectedProblem?.id || null;

        // Create registration
        const reg = await registrationService.createRegistration({
          userId: user.id,
          competitionId: compId,
          teamId: assignedTeamId,
          problemCategoryId: probCatId,
          experienceLevel: formData.experience,
          notes: `Institution: ${formData.institution}`,
        });

        setConfirmationData(reg);
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
          There are zero registration fees. All registered participants receive event badges, meals during hackathon hours, and verified participation certificates.
        </p>

        {submitted ? (
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.35)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 217, 255, 0.15)', border: '1px solid var(--color-arc-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--color-arc-cyan)' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 className="heading-display" style={{ fontSize: '2rem', marginBottom: '0.8rem', color: 'var(--color-text-primary)' }}>
              REGISTRATION RECEIVED
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.02rem', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
              Welcome, <strong>{formData.fullName || 'Participant'}</strong>! A confirmation email and event details have been sent to <strong>{formData.email}</strong>.
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-arc-cyan)', marginBottom: '2rem' }}>
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
                    REGISTRATION CLOSED // PORTALS SEALED
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Event registration for HackFest 3.0 is currently closed by event administration. New submissions cannot be processed at this time. For queries, contact <strong>{eventSettings?.contactEmail || 'sdc@recbanda.ac.in'}</strong>.
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

            {!user && isConfigured && (
              <div style={{ background: 'rgba(60, 83, 107, 0.25)', border: '1px solid var(--border-accent-steel)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-warm-off-white)' }}>Already have an account?</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Sign in to auto-link your profile and track registrations.</div>
                </div>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  SIGN IN FIRST
                </Link>
              </div>
            )}

            {/* Competition Selection */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-warm-amber)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                SELECT COMPETITION *
              </label>
              <select
                name="arena"
                value={formData.arena}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.85rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
                required
              >
                <option value="hackathon">Main Hackathon (Day 2 • Team 2-4)</option>
                <option value="codeathon">Codeathon (Day 1 • 1.5h • Individual)</option>
                <option value="ideathon">Ideathon (Day 1 • Pitching • Team 1-3)</option>
              </select>
            </div>

            {/* Team Configuration if required */}
            {requiresTeam && (
              <div style={{ background: 'rgba(28, 32, 38, 0.65)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-warm-amber)', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
                  TEAM MEMBERSHIP *
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
                    <span>Create New Team</span>
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
                  style={{ width: '100%', padding: '0.85rem 1rem', background: '#111827', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warm-off-white)', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
                >
                  <option value="">Decide at Event Opening (Day 2 Briefing)</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug || cat.id}>
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
                  EMAIL ADDRESS *
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
                  PHONE NUMBER *
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
                I agree to adhere to the HackFest 3.0 Code of Conduct, confirm all projects will be started afresh during designated hours, and verify that my institution details are accurate.
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isRegistrationClosed}
              style={{
                width: '100%',
                marginTop: '1rem',
                justifyContent: 'center',
                opacity: isRegistrationClosed ? 0.6 : 1,
                cursor: isRegistrationClosed ? 'not-allowed' : 'pointer'
              }}
            >
              {isRegistrationClosed ? (
                <>
                  <AlertCircle size={18} />
                  REGISTRATIONS CLOSED
                </>
              ) : loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  STORING REGISTRATION BEACON...
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
