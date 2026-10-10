import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, Clock, Award, Users, ShieldAlert, CheckCircle2, ChevronDown, Calendar, FileText, Scale } from 'lucide-react';
import { competitions, eventMeta } from '../data/eventData';
import { eventService } from '../services/eventService';

export default function CompetitionDetailPage({ competitionId }) {
  const params = useParams();
  const targetId = competitionId || params.id;
  const [compList, setCompList] = useState(competitions);
  const [meta, setMeta] = useState(eventMeta);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let isMounted = true;
    eventService.getCompetitions().then((res) => {
      if (isMounted && res?.length) setCompList(res);
    });
    eventService.getSettings().then((res) => {
      if (isMounted && res) setMeta(res);
    });
    return () => { isMounted = false; };
  }, []);

  const comp = compList.find((c) => c.id === targetId || c.slug === targetId) || compList[0] || competitions[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [targetId]);

  return (
    <div className="competition-detail-page" style={{ paddingTop: 'calc(var(--nav-height) + 1.5rem)', paddingBottom: '6rem' }}>
      {/* 1. HERO */}
      <section style={{ position: 'relative', minHeight: '62vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '4rem 0' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <img
            src={comp.bgImage}
            alt={comp.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.48) contrast(1.2)' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(17,24,39,0.85) 0%, rgba(17,24,39,0.5) 50%, rgba(17,24,39,0.98) 100%)'
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '960px' }}>
          <Link
            to="/#competitions"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warm-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '1.25rem' }}
          >
            <ArrowLeft size={16} />
            BACK TO ALL COMPETITIONS
          </Link>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span className="chapter-badge" style={{ margin: 0 }}>{comp.badge}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-soft-gray)' }}>{comp.duration}</span>
          </div>

          <h1 className="heading-display" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', marginBottom: '0.8rem', lineHeight: '1' }}>
            {comp.title}
          </h1>

          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', color: 'var(--color-warm-amber)', textTransform: 'uppercase', marginBottom: '1.4rem' }}>
            {comp.tagline}
          </div>

          <p style={{ color: 'var(--color-soft-gray)', fontSize: '1.1rem', maxWidth: '720px', lineHeight: '1.7', marginBottom: '2.2rem' }}>
            {comp.shortDescription}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">
              REGISTER FOR {comp.title}
              <ArrowUpRight size={18} />
            </Link>
            <a href="#rules" className="btn btn-secondary">
              REVIEW EVENT RULES
            </a>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW & FORMAT */}
      <section className="section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '3rem', alignItems: 'start' }}>
            <div>
              <span className="chapter-badge">SPECIFICATION</span>
              <h2 className="heading-section" style={{ fontSize: '2rem' }}>COMPETITION OVERVIEW</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                {comp.fullOverview}
              </p>
            </div>

            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
              <h3 className="heading-display" style={{ fontSize: '1.3rem', marginBottom: '1.2rem', color: 'var(--color-text-primary)' }}>
                EVENT FORMAT & LOGISTICS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>DURATION</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{comp.duration}</div>
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>TEAM FORMAT</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{comp.format}</div>
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>EVALUATION METHOD</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{comp.evaluation}</div>
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-arc-cyan)' }}>VENUE LOCATION</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{meta.venueShort}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TIMELINE */}
      <section className="section" style={{ background: 'var(--color-surface-elevated)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="chapter-badge">CHRONOLOGY</span>
            <h2 className="heading-section" style={{ fontSize: '2rem' }}>EXECUTION TIMELINE</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {comp.timeline.map((item, idx) => (
              <div key={idx} style={{ background: 'var(--color-surface-secondary)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-arc-cyan)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  STEP {item.step}
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--color-text-primary)', marginBottom: '0.4rem' }}>
                  {item.name}
                </h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RULES & REGULATIONS */}
      <section id="rules" className="section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="chapter-badge">GOVERNANCE</span>
            <h2 className="heading-section" style={{ fontSize: '2rem' }}>RULES & CODE OF CONDUCT</h2>
          </div>

          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: 'var(--radius-md)', padding: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)' }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comp.rules.map((rule, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.65' }}>
                  <CheckCircle2 size={18} color="var(--color-arc-cyan)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. JUDGING CRITERIA / RESULT MECHANISM */}
      <section className="section" style={{ background: 'var(--color-surface-elevated)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="chapter-badge">EVALUATION</span>
            <h2 className="heading-section" style={{ fontSize: '2rem' }}>
              {comp.resultCriteria ? 'LEADERBOARD CRITERIA' : 'JUDGING DIMENSIONS'}
            </h2>
          </div>

          {comp.resultCriteria ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {comp.resultCriteria.metrics.map((m, i) => (
                <div key={i} style={{ background: 'rgba(37, 42, 49, 0.7)', border: '1px solid var(--border-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-steel-blue)', fontWeight: 700, marginBottom: '0.35rem' }}>
                    METRIC {String(i + 1).padStart(2, '0')}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-warm-off-white)', marginBottom: '0.4rem' }}>
                    {m.label}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{m.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: '1.5rem' }}>
                Evaluation weightages: <strong style={{ color: 'var(--color-warm-amber)' }}>[TO BE DECIDED]</strong> by jury consensus during official briefing.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {comp.judgingCriteria.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(37, 42, 49, 0.6)', border: '1px solid var(--border-subtle)', padding: '1.2rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-warm-off-white)', fontSize: '0.9rem' }}>{c.criterion}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-warm-amber)', fontSize: '0.82rem' }}>{c.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. ARENA FAQS */}
      <section className="section" style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="section-header center">
            <span className="chapter-badge">INQUIRIES</span>
            <h2 className="heading-section" style={{ fontSize: '2rem' }}>EVENT FAQ</h2>
          </div>

          <div className="accordion-group">
            {comp.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                  <button className="accordion-trigger" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                    <span>{faq.q}</span>
                    <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                  </button>
                  {isOpen && <div className="accordion-content">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="section" style={{ textAlign: 'center', background: 'radial-gradient(ellipse at 50% 50%, rgba(143,48,53,0.12) 0%, transparent 70%)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <h2 className="heading-display" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            READY TO COMPETE IN {comp.title}?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Lock in your team, prepare your tooling, and represent your institution at HackFest 3.0 REC Banda.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>
            REGISTER FOR {comp.title} NOW
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
