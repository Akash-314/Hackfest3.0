import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardNav from '../../components/dashboard/DashboardNav';
import { registrationService } from '../../services/registrationService';
import { Trophy, CheckCircle2, Clock, Plus, ArrowUpRight } from 'lucide-react';
import { competitions } from '../../data/eventData';

export default function DashboardRegistrationPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    registrationService.getUserRegistrations(user.id).then((data) => {
      setRegistrations(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <DashboardNav />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className="chapter-badge">EVENT REGISTRATION</span>
            <h2 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
              MY REGISTRATIONS
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Confirmed participation passes for HackFest 3.0.
            </p>
          </div>

          <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.82rem' }}>
            <Plus size={16} />
            REGISTER FOR AN EVENT
          </Link>
        </div>

        {/* Existing Registrations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
          {registrations.length === 0 ? (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: 'var(--radius-md)', padding: '3rem 1.5rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
              <Trophy size={48} color="var(--color-arc-cyan)" style={{ margin: '0 auto 1.2rem auto' }} />
              <h3 className="heading-display" style={{ fontSize: '1.4rem', marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
                NO EVENTS REGISTERED YET
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
                Join Codeathon (Day 1), Ideathon (Day 1), or the flagship 48-Hour Hackathon.
              </p>
              <Link to="/register" className="btn btn-primary">
                REGISTER FOR AN EVENT
              </Link>
            </div>
          ) : (
            registrations.map((reg) => (
              <div key={reg.id} style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.8rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="chapter-badge" style={{ margin: '0 0 0.3rem 0' }}>
                      {reg.competition?.format || 'COMPETITION'}
                    </span>
                    <h3 className="heading-display" style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>
                      {reg.competition?.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 217, 255, 0.12)', border: '1px solid var(--color-arc-cyan)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.8rem', color: 'var(--color-arc-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={16} />
                    <span>STATUS: {reg.registration_status.toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--color-surface-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid rgba(0, 217, 255, 0.15)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>DURATION</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{reg.competition?.duration}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>AFFILIATED TEAM</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{reg.team?.name || 'Individual Entry'}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>TRACK / CATEGORY</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{reg.problem_category?.theme || 'Briefing Selection'}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
