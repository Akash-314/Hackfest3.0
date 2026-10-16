import React from 'react';

/**
 * Cinematic original superhero-inspired vector art for the 6 Problem Categories.
 * Rendered at low opacity (8-14%) with dark radial gradient overlays to maintain crystal-clear text readability.
 */
export default function SuperheroTrackArt({ trackIndex = 0, variant = 'teal' }) {
  const strokeColor = variant === 'teal' ? '#63E6D1' : variant === 'gold' ? '#F5C451' : '#81C14B';

  switch (trackIndex) {
    // Track 01: Resilient Infrastructure — Fortress Shield & Hex Lattice
    case 0:
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-10%',
            bottom: '-15%',
            width: '85%',
            height: '110%',
            pointerEvents: 'none',
            opacity: 0.12,
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
          className="superhero-track-bg-art"
        >
          {/* Shield Outline */}
          <path
            d="M200 30 L320 80 V170 C320 230 200 280 200 280 C200 280 80 230 80 170 V80 Z"
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray="8 6"
          />
          <path
            d="M200 55 L295 95 V165 C295 210 200 250 200 250 C200 250 105 210 105 165 V95 Z"
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Central Reactor Core */}
          <circle cx="200" cy="150" r="35" stroke={strokeColor} strokeWidth="3" />
          <circle cx="200" cy="150" r="16" fill={strokeColor} fillOpacity="0.4" />
          {/* Cybernetic Grid Beams */}
          <line x1="200" y1="20" x2="200" y2="280" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="40" y1="150" x2="360" y2="150" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.6" />
          <polygon points="200,90 240,150 200,210 160,150" stroke={strokeColor} strokeWidth="2" fill="none" />
          <circle cx="120" cy="80" r="4" fill={strokeColor} />
          <circle cx="280" cy="80" r="4" fill={strokeColor} />
          <circle cx="120" cy="220" r="4" fill={strokeColor} />
          <circle cx="280" cy="220" r="4" fill={strokeColor} />
        </svg>
      );

    // Track 02: Adaptive Healthcare & Triage — Heroic Bio-Pulse & Medical Shield
    case 1:
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-10%',
            bottom: '-15%',
            width: '85%',
            height: '110%',
            pointerEvents: 'none',
            opacity: 0.12,
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
          className="superhero-track-bg-art"
        >
          {/* Medical Cross in Energy Circle */}
          <circle cx="200" cy="150" r="100" stroke={strokeColor} strokeWidth="2" strokeDasharray="12 8" />
          <circle cx="200" cy="150" r="75" stroke={strokeColor} strokeWidth="1.5" />
          {/* Heroic Cross */}
          <rect x="182" y="90" width="36" height="120" rx="4" stroke={strokeColor} strokeWidth="2.5" />
          <rect x="140" y="132" width="120" height="36" rx="4" stroke={strokeColor} strokeWidth="2.5" />
          {/* Heartbeat EKG Pulse */}
          <path
            d="M30 150 H120 L140 110 L160 190 L185 130 L210 170 L235 140 L255 150 H370"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="200" cy="150" r="12" fill={strokeColor} fillOpacity="0.5" />
        </svg>
      );

    // Track 03: Sustainable Energy — Arc Reactor & Kinetic Power Dynamo
    case 2:
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-10%',
            bottom: '-15%',
            width: '85%',
            height: '110%',
            pointerEvents: 'none',
            opacity: 0.12,
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
          className="superhero-track-bg-art"
        >
          {/* Arc Reactor Rings */}
          <circle cx="200" cy="150" r="105" stroke={strokeColor} strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="200" cy="150" r="80" stroke={strokeColor} strokeWidth="3" />
          <circle cx="200" cy="150" r="50" stroke={strokeColor} strokeWidth="2" />
          <circle cx="200" cy="150" r="22" fill={strokeColor} fillOpacity="0.45" stroke={strokeColor} strokeWidth="3" />
          {/* Radial Power Segments */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 200 + Math.cos(rad) * 50;
            const y1 = 150 + Math.sin(rad) * 50;
            const x2 = 200 + Math.cos(rad) * 80;
            const y2 = 150 + Math.sin(rad) * 80;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth="3" />;
          })}
          {/* Lightning Kinetic Bolt */}
          <path
            d="M210 60 L180 140 H215 L185 240 L235 130 H195 Z"
            stroke={strokeColor}
            strokeWidth="2"
            fill={strokeColor}
            fillOpacity="0.15"
          />
        </svg>
      );

    // Track 04: Secure Communications — Cryptographic Sentinel & Radar Mesh
    case 3:
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-10%',
            bottom: '-15%',
            width: '85%',
            height: '110%',
            pointerEvents: 'none',
            opacity: 0.12,
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
          className="superhero-track-bg-art"
        >
          {/* Radar Sweep Concentric Circles */}
          <circle cx="200" cy="150" r="110" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="200" cy="150" r="80" stroke={strokeColor} strokeWidth="2" strokeDasharray="14 10" />
          <circle cx="200" cy="150" r="50" stroke={strokeColor} strokeWidth="2" />
          <circle cx="200" cy="150" r="18" fill={strokeColor} fillOpacity="0.35" />
          {/* Cyber Lock Cryptogram */}
          <rect x="175" y="130" width="50" height="40" rx="6" stroke={strokeColor} strokeWidth="3" fill="none" />
          <path d="M185 130 V110 C185 100 215 100 215 110 V130" stroke={strokeColor} strokeWidth="3" />
          {/* Angular Signal Rays */}
          <line x1="200" y1="40" x2="200" y2="260" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="90" y1="150" x2="310" y2="150" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M140 80 L200 40 L260 80" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // Track 05: Autonomous Logistics & Relief — Drone Vector & Tactical Navigation
    case 4:
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-10%',
            bottom: '-15%',
            width: '85%',
            height: '110%',
            pointerEvents: 'none',
            opacity: 0.12,
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
          className="superhero-track-bg-art"
        >
          {/* Tactical Vector Compass */}
          <polygon
            points="200,40 240,130 330,150 240,170 200,260 160,170 70,150 160,130"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeDasharray="10 6"
          />
          {/* Heroic Winged Falcon Drone Vector */}
          <path
            d="M200 80 L250 150 L290 120 L240 180 L200 230 L160 180 L110 120 L150 150 Z"
            stroke={strokeColor}
            strokeWidth="3"
            fill={strokeColor}
            fillOpacity="0.2"
          />
          <circle cx="200" cy="150" r="14" fill={strokeColor} />
          {/* Orbit waypoint nodes */}
          <circle cx="200" cy="60" r="5" fill={strokeColor} />
          <circle cx="310" cy="150" r="5" fill={strokeColor} />
          <circle cx="90" cy="150" r="5" fill={strokeColor} />
        </svg>
      );

    // Track 06: Civic Tech & Rebuilding — Infinity Architect & Constellation Beacon
    case 5:
    default:
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-10%',
            bottom: '-15%',
            width: '85%',
            height: '110%',
            pointerEvents: 'none',
            opacity: 0.12,
            transition: 'opacity 0.3s ease, transform 0.4s ease',
          }}
          className="superhero-track-bg-art"
        >
          {/* Infinity Loop */}
          <path
            d="M130 150 C90 110 50 110 50 150 C50 190 90 190 130 150 C170 110 230 110 270 150 C310 190 350 190 350 150 C350 110 310 110 270 150 C230 190 170 190 130 150 Z"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeDasharray="12 8"
          />
          {/* Civic Architectural Blueprint */}
          <polygon points="200,50 300,210 100,210" stroke={strokeColor} strokeWidth="2" fill="none" />
          <circle cx="200" cy="150" r="45" stroke={strokeColor} strokeWidth="2" />
          <circle cx="200" cy="150" r="16" fill={strokeColor} fillOpacity="0.35" />
          <line x1="200" y1="50" x2="200" y2="250" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Star nodes */}
          <circle cx="100" cy="210" r="6" fill={strokeColor} />
          <circle cx="300" cy="210" r="6" fill={strokeColor} />
          <circle cx="200" cy="50" r="6" fill={strokeColor} />
        </svg>
      );
  }
}
