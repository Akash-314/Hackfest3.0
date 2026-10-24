import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/dashboard/DashboardNav';
import { registrationService } from '../../services/registrationService';
import {
  Trophy,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  FileText,
  Download,
  Upload,
  ExternalLink,
  Users,
  AlertCircle,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { competitions } from '../../data/eventData';

export default function DashboardRegistrationPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replacingRegId, setReplacingRegId] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });
  const fileInputRef = useRef(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const data = await registrationService.getUserRegistrations(user.id);
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const showBanner = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
  };

  const handleFileChange = async (e, registrationId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      await registrationService.replaceRegistrationDocument(registrationId, file);
      showBanner(`Document "${file.name}" attached successfully!`, 'success');
      await loadData();
    } catch (err) {
      showBanner(err.message || 'Failed to upload document.', 'error');
    } finally {
      setUploadLoading(false);
      setReplacingRegId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <DashboardNav />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="chapter-badge">EVENT REGISTRATION</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              MY REGISTRATIONS & PASSES
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Audit your confirmed participation passes, presentation slide decks, and team affiliations.
            </p>
          </div>

          <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} />
            REGISTER FOR ANOTHER EVENT
          </Link>
        </div>

        {message.text && (
          <div
            style={{
              background: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(53, 248, 172, 0.12)',
              border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(53, 248, 172, 0.4)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: message.type === 'error' ? '#fca5a5' : '#35F8AC',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
            }}
          >
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept=".pptx,.ppt,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => replacingRegId && handleFileChange(e, replacingRegId)}
        />

        {/* Existing Registrations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
              <div>Loading your verified registrations...</div>
            </div>
          ) : registrations.length === 0 ? (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: 'var(--radius-md)', padding: '3rem 1.5rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
              <Trophy size={48} color="var(--color-arc-cyan)" style={{ margin: '0 auto 1.2rem auto' }} />
              <h3 className="heading-display" style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
                NO EVENTS REGISTERED YET
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
                Join Codeathon (Day 1 speed algorithm arena), Ideathon (Day 1 innovation pitch), or the flagship 48-Hour Hackathon.
              </p>
              <Link to="/register" className="btn btn-primary">
                REGISTER FOR AN EVENT
              </Link>
            </div>
          ) : (
            registrations.map((reg) => {
              const isCodeathon =
                reg.competition?.slug?.toLowerCase() === 'codeathon' ||
                reg.competition?.name?.toLowerCase().includes('codeathon') ||
                reg.competition?.id?.toLowerCase() === 'codeathon' ||
                reg.competition_id === 'codeathon';

              return (
                <div key={reg.id} style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.8rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div>
                    <span className="chapter-badge" style={{ margin: '0 0 0.3rem 0' }}>
                      {reg.competition?.format || 'COMPETITION PASS'}
                    </span>
                    <h3 className="heading-display" style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', margin: '0.2rem 0' }}>
                      {reg.competition?.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 217, 255, 0.12)', border: '1px solid var(--color-arc-cyan)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.8rem', color: 'var(--color-arc-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={16} />
                    <span>STATUS: {(reg.registration_status || 'confirmed').toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-sm)', padding: '1.2rem', border: '1px solid rgba(0, 217, 255, 0.15)', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>DURATION</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{reg.competition?.duration || 'Multi-Day'}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>AFFILIATED TEAM</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {reg.team?.name ? `${reg.team.name} (${reg.team.code})` : 'Individual Entry'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>TRACK / CATEGORY</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{reg.problem_category?.theme || 'General / Briefing Selection'}</div>
                  </div>
                </div>

                {/* Team Roster with Full Details */}
                {reg.team && Array.isArray(reg.team.members) && reg.team.members.length > 0 && (
                  <div style={{ background: '#111827', borderRadius: 'var(--radius-sm)', padding: '1.1rem', marginBottom: '1.2rem', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-infinity-gold)', fontWeight: 600 }}>
                        TEAM ROSTER ({reg.team.members.length} CONFIRMED MEMBERS):
                      </div>
                      <Link
                        to="/dashboard/team"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-arc-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        MANAGE ROSTER <ArrowUpRight size={13} />
                      </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                      {reg.team.members.map((m) => {
                        const isLeader = m.role === 'leader' || m.user_id === reg.team?.leader_id;
                        const collegeName = m.college || m.profile?.college || reg.team?.college || 'REC Banda';
                        return (
                          <div
                            key={m.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              border: `1px solid ${isLeader ? 'rgba(245, 196, 81, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                                {m.name || m.profile?.full_name || 'Team Member'}
                              </span>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.68rem',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '3px',
                                  background: isLeader ? 'rgba(245, 196, 81, 0.15)' : 'rgba(0, 217, 255, 0.1)',
                                  color: isLeader ? 'var(--color-infinity-gold)' : 'var(--color-arc-cyan)',
                                  border: `1px solid ${isLeader ? 'rgba(245, 196, 81, 0.35)' : 'rgba(0, 217, 255, 0.25)'}`,
                                  fontWeight: 700,
                                }}
                              >
                                {isLeader ? 'LEADER' : 'MEMBER'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-arc-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '0.3rem' }}>
                              {m.email || m.profile?.email}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              <div>🏛️ {collegeName}</div>
                              {(m.branch || m.year) && (
                                <div style={{ color: '#CBD5E1', marginTop: '0.15rem' }}>
                                  {m.branch ? `Branch: ${m.branch}` : ''} {m.year ? `• Year: ${m.year}` : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Attached Document Section - Not required for Codeathon */}
                {!isCodeathon && (
                  <div style={{ background: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={22} color="var(--color-arc-cyan)" />
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>ATTACHED PRESENTATION / SYNOPSIS</div>
                        {reg.document_url ? (
                          <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                            {reg.document_name || 'Presentation Deck'} {reg.document_type ? `(${reg.document_type})` : ''}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No document attached yet
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      {reg.document_url && (
                        <a
                          href={reg.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                        >
                          <ExternalLink size={14} />
                          VIEW / DOWNLOAD
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={uploadLoading}
                        onClick={() => {
                          setReplacingRegId(reg.id);
                          fileInputRef.current?.click();
                        }}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                      >
                        <Upload size={14} />
                        {reg.document_url ? 'REPLACE DECK' : 'ATTACH DECK'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}
