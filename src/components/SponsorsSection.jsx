import React, { useState, useEffect } from 'react';
import { Mail, Building2, Handshake, ExternalLink, Sparkles, Loader2, Award, Shield, Star } from 'lucide-react';
import { eventService } from '../services/eventService';
import { eventMeta } from '../data/eventData';
import { supabase } from '../lib/supabase';
import HudPanel from './ui/HudPanel';
import HoloBadge from './ui/HoloBadge';

export default function SponsorsSection() {
  const [loading, setLoading] = useState(true);
  const [sponsorData, setSponsorData] = useState({ tiers: [], all: [] });

  useEffect(() => {
    let isMounted = true;
    async function loadSponsors() {
      setLoading(true);
      try {
        const res = await eventService.getSponsors();
        if (isMounted && res) {
          setSponsorData(res);
        }
      } catch (err) {
        console.warn('Failed to load sponsors:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSponsors();

    // Subscribe to realtime database changes for sponsors
    const channel = supabase
      ?.channel('public:sponsors_realtime')
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, () => {
        loadSponsors();
      })
      ?.subscribe();

    return () => {
      isMounted = false;
      if (channel) supabase?.removeChannel(channel);
    };
  }, []);

  const { tiers = [] } = sponsorData;

  const getTierIcon = (id) => {
    switch (id) {
      case 'title':
        return Star;
      case 'powered_by':
        return Award;
      case 'gold':
        return Shield;
      case 'silver':
      case 'bronze':
        return Building2;
      default:
        return Handshake;
    }
  };

  const getGridColumns = (tierId) => {
    if (tierId === 'title') {
      return 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))';
    }
    if (tierId === 'powered_by' || tierId === 'gold') {
      return 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))';
    }
    return 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))';
  };

  const getCardMinHeight = (tierId) => {
    if (tierId === 'title') return '220px';
    if (tierId === 'powered_by' || tierId === 'gold') return '190px';
    return '160px';
  };

  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <section id="sponsors" className="section sponsors-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Header */}
        <div className="section-header center">
          <HoloBadge variant="gold" icon={Handshake}>
            STRATEGIC ALLIANCES & SPONSORS
          </HoloBadge>
          <h2 className="heading-section marvel-section-title">OUR SPONSORS & PARTNERS</h2>
          <p className="section-lead">
            Visionary tech organizations, platforms, and community ecosystems backing student innovation at {eventMeta.name}.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <Loader2 size={36} color="var(--color-arc-cyan)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              LOADING PARTNER ALLIANCES...
            </div>
          </div>
        ) : tiers.length === 0 ? (
          /* Empty State when no sponsors have been added/published yet */
          <div style={{ maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <HudPanel variant="cyan" tag="ALLIANCES // OPEN INVITATION" scan={true}>
              <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                <Handshake size={48} color="var(--color-arc-cyan)" style={{ margin: '0 auto 1.25rem auto', opacity: 0.8 }} />
                <h3 className="heading-display" style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.6rem' }}>
                  BECOME A PIONEERING PARTNER
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.94rem', lineHeight: '1.65', marginBottom: '1.8rem', maxWidth: '580px', margin: '0 auto 1.8rem auto' }}>
                  Official sponsorship partnerships are currently being confirmed for {eventMeta.name}. Partner with REC Banda to mentor, recruit, and showcase your technology stack to hundreds of developers.
                </p>
                <a
                  href={`mailto:${eventMeta.contactEmail}?subject=HackFest%203.0%20Sponsorship%20Inquiry`}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
                >
                  <Mail size={16} />
                  REQUEST SPONSORSHIP DECK
                </a>
              </div>
            </HudPanel>
          </div>
        ) : (
          /* Dynamic Tiered Sponsor Groups */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', marginBottom: '3.5rem' }}>
            {tiers.map((tier) => {
              const TierIcon = getTierIcon(tier.id);
              const gridCols = getGridColumns(tier.id);
              const cardMinHeight = getCardMinHeight(tier.id);

              return (
                <div key={tier.id} className="sponsors-group">
                  {/* Tier Title Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '1.5rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <TierIcon
                        size={20}
                        color={tier.variant === 'gold' ? 'var(--color-infinity-gold)' : 'var(--color-arc-cyan)'}
                      />
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.35rem',
                          color: '#fff',
                          letterSpacing: '0.06em',
                          margin: 0,
                        }}
                      >
                        {tier.label}
                      </h3>
                    </div>

                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: tier.variant === 'gold' ? 'var(--color-infinity-gold)' : 'var(--color-arc-cyan)',
                        background: tier.variant === 'gold' ? 'rgba(245, 196, 81, 0.12)' : 'rgba(0, 217, 255, 0.12)',
                        border: `1px solid ${tier.variant === 'gold' ? 'rgba(245, 196, 81, 0.3)' : 'rgba(0, 217, 255, 0.3)'}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        letterSpacing: '0.08em',
                        fontWeight: 600,
                      }}
                    >
                      {tier.badge || `${tier.sponsors.length} PARTNERS`}
                    </span>
                  </div>

                  {/* Sponsors Responsive Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: gridCols,
                      gap: '1.5rem',
                    }}
                  >
                    {tier.sponsors.map((sponsor) => {
                      const hasValidLink = isValidUrl(sponsor.website_url);

                      const CardContent = (
                        <div
                          style={{
                            background: 'var(--color-surface-elevated)',
                            border: `1px solid ${tier.variant === 'gold' ? 'rgba(245, 196, 81, 0.3)' : 'rgba(0, 217, 255, 0.25)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: cardMinHeight,
                            textAlign: 'center',
                            position: 'relative',
                            transition: 'all var(--transition-fast)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                            height: '100%',
                            boxSizing: 'border-box',
                          }}
                          className="stark-hud-card"
                        >
                          {/* Top corner external link icon */}
                          {hasValidLink && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '0.8rem',
                                right: '0.8rem',
                                color: 'var(--color-text-secondary)',
                                opacity: 0.7,
                                transition: 'opacity 0.2s ease',
                              }}
                              title={`Visit ${sponsor.name}`}
                            >
                              <ExternalLink size={14} />
                            </span>
                          )}

                          {/* Logo or Fallback */}
                          {sponsor.logo_url ? (
                            <div
                              style={{
                                width: '100%',
                                height: tier.id === 'title' ? '90px' : '70px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                padding: '0.5rem',
                              }}
                            >
                              <img
                                src={sponsor.logo_url}
                                alt={`${sponsor.name} logo`}
                                style={{
                                  maxHeight: '100%',
                                  maxWidth: '100%',
                                  objectFit: 'contain',
                                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                                }}
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            /* Text Fallback Emblem */
                            <div
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '8px',
                                background: tier.variant === 'gold' ? 'rgba(245, 196, 81, 0.15)' : 'rgba(0, 217, 255, 0.15)',
                                border: `1px solid ${tier.variant === 'gold' ? 'var(--color-infinity-gold)' : 'var(--color-arc-cyan)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.85rem',
                                color: tier.variant === 'gold' ? 'var(--color-infinity-gold)' : 'var(--color-arc-cyan)',
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                              }}
                            >
                              {sponsor.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Sponsor Name */}
                          <div
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: tier.id === 'title' ? '1.25rem' : '1.05rem',
                              color: '#fff',
                              fontWeight: 600,
                              letterSpacing: '0.04em',
                              marginBottom: sponsor.description ? '0.35rem' : 0,
                            }}
                          >
                            {sponsor.name}
                          </div>

                          {/* Description if present */}
                          {sponsor.description && (
                            <p
                              style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.82rem',
                                lineHeight: '1.5',
                                margin: 0,
                                maxWidth: '320px',
                              }}
                            >
                              {sponsor.description}
                            </p>
                          )}
                        </div>
                      );

                      if (hasValidLink) {
                        return (
                          <a
                            key={sponsor.id}
                            href={sponsor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', display: 'block' }}
                          >
                            {CardContent}
                          </a>
                        );
                      }

                      return <div key={sponsor.id}>{CardContent}</div>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Become a Sponsor Call-To-Action Banner */}
        <HudPanel variant="cyan" tag="STRATEGIC INVITATION" scan={true} className="sponsor-cta-banner">
          <div style={{ textAlign: 'center', padding: '1.2rem 0' }}>
            <h3 className="heading-display" style={{ fontSize: '1.6rem', color: '#F5F7FA', marginBottom: '0.6rem' }}>
              PARTNER WITH HACKFEST 3.0
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.94rem', maxWidth: '620px', margin: '0 auto 1.6rem auto', lineHeight: '1.6' }}>
              Empower student builders from premier technical institutions. Connect your company directly with future engineering talent, showcase developer APIs, and lead keynote workshops.
            </p>
            <a
              href={`mailto:${eventMeta.contactEmail}?subject=HackFest%203.0%20Sponsorship%20Inquiry`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <Mail size={16} />
              BECOME A SPONSOR
            </a>
          </div>
        </HudPanel>
      </div>
    </section>
  );
}
