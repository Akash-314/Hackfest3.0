import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Sparkles, Package, IdCard, Award, Code2, Users, RotateCcw } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import './PrizesSection.css';

export default function PrizesSection() {
  const [isRevealed, setIsRevealed] = useState(false);
  const animationFrameRef = useRef(null);

  // Clean up any active confetti animation loop on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const triggerConfettiCannons = useCallback(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Cancel any active animation frame to prevent duplicate animation loops
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const end = Date.now() + 3 * 1000;
    // HackFest Doomsday theme: emerald green, forest green, gold, and white
    const colors = ['#39FF88', '#2E933C', '#ECBA82', '#ffffff'];

    const frame = () => {
      // Left cannon
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: colors,
        zIndex: 9999,
        disableForReducedMotion: true,
      });

      // Right cannon
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: colors,
        zIndex: 9999,
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        animationFrameRef.current = requestAnimationFrame(frame);
      } else {
        animationFrameRef.current = null;
      }
    };

    frame();
  }, []);

  const handleReveal = () => {
    triggerConfettiCannons();
    setIsRevealed(true);
  };

  const participantGoodies = [
    {
      id: 'kit',
      icon: Package,
      title: 'Exclusive Participant Kit',
      desc: 'Official event kit including diary, pen, and ID card.',
    },
    {
      id: 'id-card',
      icon: IdCard,
      title: 'Official Event ID Card',
      desc: 'Personalized hackathon credential with verified event access.',
    },
    {
      id: 'certificate',
      icon: Award,
      title: 'Participation Certificate',
      desc: 'Official physical certificate awarded to all participants.',
    },
    {
      id: 'skills',
      icon: Code2,
      title: 'Showcase Your Skills',
      desc: 'Coding, creativity, and innovative ideas.',
    },
    {
      id: 'community',
      icon: Users,
      title: 'Meet the Community',
      desc: 'Connect with developers and tech enthusiasts.',
    },
  ];

  const podiumTiers = [
    {
      id: 'second',
      place: '2ND PLACE',
      title: '1ST RUNNER UP',
      rankNum: '02',
      color: '#C7CED8',
      colClass: 'podium-col-second',
      icon: Medal,
      badgeText: 'RUNNER UP',
      description: 'Elite runner-up honours, silver laurels, and distinguished recognition for second-place excellence.',
    },
    {
      id: 'first',
      place: '1ST PLACE',
      title: 'CHAMPION',
      rankNum: '01',
      color: '#F5C451',
      colClass: 'podium-col-first',
      icon: Trophy,
      badgeText: 'GRAND CHAMPION',
      description: 'Top championship honours, gold laurels, and premier recognition for the ultimate HackFest 3.0 champions.',
    },
    {
      id: 'third',
      place: '3RD PLACE',
      title: '2ND RUNNER UP',
      rankNum: '03',
      color: '#CD7F32',
      colClass: 'podium-col-third',
      icon: Medal,
      badgeText: '2ND RUNNER UP',
      description: 'Prestigious bronze honours, podium laurels, and recognition for third-place technical distinction.',
    },
  ];

  return (
    <section id="prizes" className="section prizes-section-wrapper">
      <div className="section-transition-top" />
      <div className="prizes-ambient-glow" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div className="section-header center" style={{ marginBottom: '1.25rem' }}>
          <HoloBadge variant="gold" icon={Trophy}>
            AWARDS &amp; RECOGNITION
          </HoloBadge>
          <h2 className="heading-section">
            EXCITING PRIZES AHEAD
          </h2>
          <p className="section-lead" style={{ maxWidth: '720px', margin: '0 auto' }}>
            Rewards, recognition, and exclusive perks for HackFest 3.0.
          </p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE STAGE: TROPHY VIEW OR REVEALED PRIZE & PERKS SHOWCASE */}
        {/* ------------------------------------------------------------------ */}
        <div className="prize-interactive-zone">
          {!isRevealed ? (
            <div className="trophy-stage">
              <div
                className="trophy-interactive-wrap"
                onClick={handleReveal}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleReveal();
                  }
                }}
                aria-label="Click to reveal prize pool"
                title="Click to reveal prize pool"
              >
                <div className="trophy-backlight" aria-hidden="true" />

                {/* Sculpted 3D-Style Vector Trophy */}
                <svg
                  className="trophy-svg-element"
                  viewBox="0 0 160 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="3D Championship Trophy"
                >
                  <defs>
                    {/* Metallic Gold Primary Gradient */}
                    <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF2B2" />
                      <stop offset="25%" stopColor="#F5C451" />
                      <stop offset="55%" stopColor="#D99B26" />
                      <stop offset="85%" stopColor="#FDE68A" />
                      <stop offset="100%" stopColor="#92400E" />
                    </linearGradient>

                    {/* Cup Depth / Shading Gradient */}
                    <linearGradient id="cupDepth" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#92400E" />
                      <stop offset="20%" stopColor="#F5C451" />
                      <stop offset="50%" stopColor="#FFFBEB" />
                      <stop offset="80%" stopColor="#F5C451" />
                      <stop offset="100%" stopColor="#78350F" />
                    </linearGradient>

                    {/* Pedestal Base Gradient */}
                    <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0B1711" />
                      <stop offset="25%" stopColor="#1C382A" />
                      <stop offset="50%" stopColor="#2D5A44" />
                      <stop offset="75%" stopColor="#1C382A" />
                      <stop offset="100%" stopColor="#080A09" />
                    </linearGradient>

                    {/* Emerald Gem Core Glow */}
                    <radialGradient id="emeraldCore" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#39FF88" />
                      <stop offset="60%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#064E3B" />
                    </radialGradient>

                    {/* Specular White Highlight */}
                    <linearGradient id="specularGleam" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>

                    {/* Soft Shadow Filter */}
                    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Pedestal Base (Layered 3D Plinth) */}
                  <ellipse cx="80" cy="170" rx="46" ry="7" fill="#000000" fillOpacity="0.6" />
                  <path d="M38 158 L122 158 L126 168 L34 168 Z" fill="url(#pedestalGrad)" stroke="#1C382A" strokeWidth="1" />
                  <rect x="42" y="148" width="76" height="11" rx="2" fill="url(#pedestalGrad)" stroke="#2D5A44" strokeWidth="1" />
                  {/* Metallic Base Rim */}
                  <rect x="44" y="145" width="72" height="4" rx="1.5" fill="url(#goldSheen)" />

                  {/* Stem & Central Ring */}
                  <path d="M74 124 L86 124 L84 145 L76 145 Z" fill="url(#cupDepth)" />
                  <ellipse cx="80" cy="125" rx="14" ry="4" fill="url(#goldSheen)" />
                  <ellipse cx="80" cy="133" rx="9" ry="3" fill="#39FF88" fillOpacity="0.85" filter="url(#softGlow)" />
                  <ellipse cx="80" cy="133" rx="7" ry="2.5" fill="url(#emeraldCore)" />

                  {/* Trophy Handles (Left and Right) */}
                  {/* Left Handle */}
                  <path
                    d="M48 42 C18 42 16 92 52 98 C50 90 32 84 32 54 C32 46 42 46 48 46 Z"
                    fill="url(#goldSheen)"
                    stroke="#92400E"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M45 44 C24 45 22 84 49 93"
                    stroke="#FFF2B2"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                  />

                  {/* Right Handle */}
                  <path
                    d="M112 42 C142 42 144 92 108 98 C110 90 128 84 128 54 C128 46 118 46 112 46 Z"
                    fill="url(#goldSheen)"
                    stroke="#92400E"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M115 44 C136 45 138 84 111 93"
                    stroke="#FFF2B2"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                  />

                  {/* Main Cup Bowl (Sculpted Vessel) */}
                  <path
                    d="M44 32 C44 76 56 122 80 122 C104 122 116 76 116 32 Z"
                    fill="url(#cupDepth)"
                    stroke="#78350F"
                    strokeWidth="1"
                  />

                  {/* Specular Front Sheen Curved Reflection */}
                  <path
                    d="M68 36 C68 70 74 110 80 110 C86 110 92 70 92 36 Z"
                    fill="url(#specularGleam)"
                    opacity="0.28"
                  />

                  {/* Top Lip & Opening */}
                  <ellipse cx="80" cy="32" rx="36" ry="9" fill="url(#goldSheen)" stroke="#78350F" strokeWidth="1" />
                  <ellipse cx="80" cy="32" rx="31" ry="6.5" fill="#5B2B04" />
                  <ellipse cx="80" cy="32" rx="27" ry="5" fill="#080A09" />

                  {/* Center Emblazoned Crest: Emerald Hex Shield */}
                  <polygon
                    points="80,56 94,64 94,80 80,88 66,80 66,64"
                    fill="#0B1711"
                    stroke="url(#goldSheen)"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="80,60 90,66 90,78 80,84 70,78 70,66"
                    fill="url(#emeraldCore)"
                  />
                  {/* Inner Star */}
                  <polygon
                    points="80,63 82.5,70 89,70.5 83.5,74.5 85.5,81 80,77 74.5,81 76.5,74.5 71,70.5 77.5,70"
                    fill="#FFFFFF"
                    opacity="0.95"
                  />
                </svg>

                {/* Trophy Action Button: Simply "Reveal" */}
                <button
                  type="button"
                  className="trophy-reveal-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReveal();
                  }}
                  aria-label="Reveal prize pool"
                >
                  <Sparkles size={15} />
                  <span>Reveal</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="prize-revealed-showcase" role="region" aria-label="Revealed Prize Pool and Goodies">
              {/* Optional Reset Button to return to Trophy view */}
              <button
                type="button"
                className="prize-showcase-reset-btn"
                onClick={() => setIsRevealed(false)}
                title="View trophy again"
                aria-label="View trophy again"
              >
                <RotateCcw size={13} />
                <span>Reset View</span>
              </button>

              <div className="prize-showcase-aura" aria-hidden="true" />

              {/* Total Prize Pool Hero Showcase */}
              <div className="prize-hero-block">
                <div className="prize-hero-label">
                  <Trophy size={14} />
                  <span>TOTAL PRIZE POOL</span>
                </div>

                <div className="prize-amount-wrap">
                  <span className="prize-amount-value">
                    <span className="prize-currency">₹</span>
                    <span className="prize-digits">25,000+</span>
                  </span>
                </div>

                <p className="prize-amount-sublead">
                  Championship honours, cash awards, and exclusive benefits for HackFest 3.0 victors
                </p>
              </div>

              {/* Participant Goodies Grid */}
              <div className="prize-perks-section">
                <div className="prize-perks-tag">
                  <Sparkles size={13} />
                  <span>PARTICIPANT PERKS &amp; GOODIES</span>
                </div>

                <div className="prize-perks-grid">
                  {participantGoodies.map((goodie) => {
                    const Icon = goodie.icon;
                    return (
                      <div key={goodie.id} className="prize-perk-card">
                        <div className="prize-perk-icon-wrap" aria-hidden="true">
                          <Icon size={18} />
                        </div>
                        <div className="prize-perk-content">
                          <h4 className="prize-perk-title">{goodie.title}</h4>
                          <p className="prize-perk-desc">{goodie.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* THREE-LEVEL PODIUM (2ND ON LEFT, 1ST IN CENTER ELEVATED, 3RD ON RIGHT) */}
        {/* ------------------------------------------------------------------ */}
        <div className="podium-structure-container">
          {podiumTiers.map((tier) => {
            return (
              <div key={tier.id} className={`podium-column ${tier.colClass}`}>
                <div className="podium-block">
                  {/* Top Beveled Edge Surface */}
                  <div className="podium-top-surface" aria-hidden="true" />

                  <div className="podium-body">
                    {/* Rank Numeral Badge */}
                    <div className="podium-rank-badge">
                      <span>{tier.rankNum}</span>
                    </div>

                    {/* Place Tag */}
                    <div className="podium-place-tag">
                      {tier.place}
                    </div>

                    {/* Tier Title */}
                    <h3 className="podium-title">
                      {tier.title}
                    </h3>

                    {/* Description */}
                    <p className="podium-desc">
                      {tier.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Base Floor Line Grounding the Podium */}
        <div className="podium-floor-line" aria-hidden="true" />
      </div>
    </section>
  );
}

