import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Building2, Handshake, ExternalLink, Sparkles, Award, Shield, Star, Orbit } from 'lucide-react';
import { eventService } from '../services/eventService';
import { eventMeta, currentSponsorsList } from '../data/eventData';
import { supabase } from '../lib/supabase';
import HudPanel from './ui/HudPanel';
import HoloBadge from './ui/HoloBadge';
import SponsorMarquee from './SponsorMarquee';
import InfiniteMenu from './ui/InfiniteMenu';
import GlowCursor from './ui/GlowCursor';

export default function SponsorsSection() {
  const [sponsorData, setSponsorData] = useState(() => ({
    tiers: [
      {
        id: 'gold',
        label: 'OFFICIAL SPONSORS',
        badge: 'CONFIRMED ALLIANCES',
        variant: 'gold',
        sponsors: currentSponsorsList.map((s) => ({
          ...s,
          logo_url: s.cardLogo || s.image,
        })),
      },
    ],
    all: currentSponsorsList,
  }));

  useEffect(() => {
    let isMounted = true;
    async function loadSponsors() {
      try {
        const res = await eventService.getSponsors();
        if (isMounted && res && res.tiers && res.tiers.length > 0) {
          setSponsorData(res);
        }
      } catch (err) {
        console.warn('Failed to load sponsors:', err);
      }
    }
    loadSponsors();

    // Subscribe to realtime database changes for sponsors if Supabase configured
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

  // Prepare carousel items with equal visibility & repetition
  const carouselItems = useMemo(() => {
    const rawList =
      sponsorData.all && sponsorData.all.length > 0
        ? sponsorData.all
        : currentSponsorsList;

    return rawList.map((sponsor) => ({
      image: sponsor.image || sponsor.tile_url || sponsor.cardLogo || sponsor.logo_url,
      title: sponsor.name || sponsor.title,
      description:
        sponsor.subtitle ||
        sponsor.description ||
        sponsor.tagline ||
        'Official HackFest 3.0 Partner Alliance',
      link: sponsor.website_url || sponsor.link || '#sponsors',
    }));
  }, [sponsorData.all]);

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
    if (tierId === 'title') return '240px';
    if (tierId === 'powered_by' || tierId === 'gold') return '210px';
    return '180px';
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
      <div className="glow-cursor-background-layer" aria-hidden="true">
        <GlowCursor
          color="#81C14B"
          secondaryColor="#2E933C"
          intensity={0.8}
          trailWidth={2.5}
          linger={0.9}
          glow={0.8}
          hotspot={0.35}
          followSpeed={0.65}
          grain={0}
          clickBurst={false}
          quality="medium"
          theme="dark"
          maxDevicePixelRatio={1.5}
        />
      </div>
      <div className="section-transition-top" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
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

        {/* 3D SPHERICAL CAROUSEL SHOWCASE (React Bits InfiniteMenu) */}
        {carouselItems.length > 0 && (
          <div className="sponsors-spherical-showcase-wrapper" style={{ marginBottom: '4.5rem' }}>
            {/* Radar Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '0.4rem 0.2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Orbit size={18} color="var(--color-arc-cyan, #63E6D1)" className="animate-spin-slow" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-arc-cyan, #63E6D1)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  INTERACTIVE ALLIANCE SPHERE // 3D SPHERICAL CAROUSEL
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--color-text-secondary)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.75rem',
                  letterSpacing: '0.04em',
                }}
              >
                <span>DRAG SPHERE TO ROTATE • CLICK TILE TO FOCUS • AUTO-ORBIT</span>
              </div>
            </div>

            {/* Canvas Viewport Frame */}
            <div
              className="sponsor-sphere-canvas-box"
              style={{
                height: '580px',
                position: 'relative',
                width: '100%',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at center, rgba(16, 26, 36, 0.75) 0%, rgba(8, 9, 13, 0.95) 75%)',
                border: '1px solid rgba(99, 230, 209, 0.25)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(99, 230, 209, 0.04)',
              }}
            >
              <InfiniteMenu
                items={carouselItems}
                count={160}
                tileSize={0.64}
                roundness={0.22}
                zoom={1.65}
                pullBack={1}
                stretch={0.6}
                inertia={0.65}
                autoplay={3.5}
                grayscale={false}
                dim={0.35}
                intro={true}
                showInfo={true}
                theme="dark"
                accentColor="var(--color-arc-cyan, #63E6D1)"
              />

              {/* HUD corner metadata overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1.25rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'rgba(255, 255, 255, 0.45)',
                  pointerEvents: 'none',
                  letterSpacing: '0.08em',
                  zIndex: 2,
                }}
              >
                SPHERE ALLOCATION // 160 UNIFORM NODES
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1.25rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--color-arc-cyan, #63E6D1)',
                  pointerEvents: 'none',
                  letterSpacing: '0.08em',
                  zIndex: 2,
                }}
              >
                ACTIVE ALLIANCES: {carouselItems.length}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Tiered Sponsor Groups */}
        {tiers.length > 0 && (
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
                        background:
                          tier.variant === 'gold' ? 'rgba(245, 196, 81, 0.12)' : 'rgba(0, 217, 255, 0.12)',
                        border: `1px solid ${
                          tier.variant === 'gold' ? 'rgba(245, 196, 81, 0.3)' : 'rgba(0, 217, 255, 0.3)'
                        }`,
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
                      const logoSrc = sponsor.cardLogo || sponsor.logo_url || sponsor.image;

                      const CardContent = (
                        <div
                          style={{
                            background: 'var(--color-surface-elevated)',
                            border: `1px solid ${
                              tier.variant === 'gold' ? 'rgba(245, 196, 81, 0.3)' : 'rgba(0, 217, 255, 0.25)'
                            }`,
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
                          {logoSrc ? (
                            <div
                              style={{
                                width: '100%',
                                height: tier.id === 'title' ? '104px' : '92px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                padding: '0.5rem',
                                borderRadius: '10px',
                                background:
                                  sponsor.theme === 'light'
                                    ? 'rgba(255, 255, 255, 0.96)'
                                    : 'rgba(12, 16, 24, 0.85)',
                                border:
                                  sponsor.theme === 'light'
                                    ? '1px solid rgba(255, 255, 255, 0.2)'
                                    : '1px solid rgba(99, 230, 209, 0.2)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                              }}
                            >
                              <img
                                src={logoSrc}
                                alt={`${sponsor.name} logo`}
                                style={{
                                  maxHeight: '100%',
                                  maxWidth: '100%',
                                  objectFit: 'contain',
                                  filter:
                                    sponsor.theme === 'light'
                                      ? 'none'
                                      : 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
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
                                background:
                                  tier.variant === 'gold'
                                    ? 'rgba(245, 196, 81, 0.15)'
                                    : 'rgba(0, 217, 255, 0.15)',
                                border: `1px solid ${
                                  tier.variant === 'gold'
                                    ? 'var(--color-infinity-gold)'
                                    : 'var(--color-arc-cyan)'
                                }`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.85rem',
                                color:
                                  tier.variant === 'gold'
                                    ? 'var(--color-infinity-gold)'
                                    : 'var(--color-arc-cyan)',
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
                              marginBottom: sponsor.subtitle || sponsor.description ? '0.35rem' : 0,
                            }}
                          >
                            {sponsor.name}
                          </div>

                          {/* Tagline / Subtitle */}
                          {sponsor.subtitle && (
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.74rem',
                                color: 'var(--color-arc-cyan, #63E6D1)',
                                letterSpacing: '0.05em',
                                marginBottom: '0.45rem',
                              }}
                            >
                              {sponsor.subtitle}
                            </div>
                          )}

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

        {/* Previous Sponsors & Partners Continuous Logo Marquee */}
        <SponsorMarquee />

        {/* Become a Sponsor Call-To-Action Banner */}
        <HudPanel variant="cyan" tag="STRATEGIC INVITATION" scan={true} className="sponsor-cta-banner">
          <div style={{ textAlign: 'center', padding: '1.2rem 0' }}>
            <h3 className="heading-display" style={{ fontSize: '1.6rem', color: '#F5F7FA', marginBottom: '0.6rem' }}>
              PARTNER WITH HACKFEST 3.0
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.94rem',
                maxWidth: '620px',
                margin: '0 auto 1.6rem auto',
                lineHeight: '1.6',
              }}
            >
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
