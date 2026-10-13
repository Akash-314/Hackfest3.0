import React from 'react';
import { Sparkles } from 'lucide-react';
import HoloBadge from './ui/HoloBadge';
import './SponsorMarquee.css';

/**
 * Verified inventory of all previous sponsors from public/previous sponsers/
 * Each sponsor is unique with no duplicates in the source data.
 */
export const previousSponsorsList = [
  {
    id: 'gfg',
    name: 'GeeksforGeeks',
    tag: 'CODING & EDTECH',
    logo: '/previous%20sponsers/gfg-image.jpg',
    theme: 'light',
  },
  {
    id: 'virtual-labs',
    name: 'Virtual Labs',
    tag: 'MOE GOVT. OF INDIA',
    logo: '/previous%20sponsers/images.jpg',
    theme: 'light',
  },
  {
    id: 'bilvaleaf',
    name: 'BilvaLeaf',
    tag: 'TECH & CONSULTING',
    logo: '/previous%20sponsers/bilvaleaf_private_limited_logo.jpg',
    theme: 'dark',
  },
  {
    id: 'namespace',
    name: 'Namespace',
    tag: 'DEV COMMUNITY',
    logo: '/previous%20sponsers/namespace.jpg',
    theme: 'dark',
  },
  {
    id: 'second-brain',
    name: 'Second Brain',
    tag: 'PRODUCTIVITY APP',
    logo: '/previous%20sponsers/secondbrainapp_logo.jpg',
    theme: 'light',
  },
  {
    id: 'matiks',
    name: 'MATIKS',
    tag: 'TECH & INNOVATION',
    logo: '/previous%20sponsers/unnamed.png',
    theme: 'dark',
  },
];

function SponsorCard({ sponsor }) {
  return (
    <div className="sponsor-marquee-card">
      <div className={`sponsor-logo-box sponsor-logo-box-${sponsor.theme}`}>
        <img
          src={sponsor.logo}
          alt={`${sponsor.name} logo`}
          className="sponsor-logo-img"
          loading="lazy"
        />
      </div>

      <div className="sponsor-info-wrap">
        <span className="sponsor-marquee-name">{sponsor.name}</span>
        <span className="sponsor-marquee-tag">{sponsor.tag}</span>
      </div>
    </div>
  );
}

export default function SponsorMarquee() {
  // Repeat sequence internally within the group to ensure unbroken coverage on wide screens
  const rowItems = [...previousSponsorsList, ...previousSponsorsList];

  return (
    <div className="previous-sponsors-section" id="previous-sponsors">
      {/* Section Header */}
      <div className="previous-sponsors-header">
        <HoloBadge variant="gold" icon={Sparkles}>
          HISTORIC ALLIANCES // EDITIONS 1.0 & 2.0
        </HoloBadge>
        <h2 className="previous-sponsors-title">PREVIOUS SPONSORS & PARTNERS</h2>
        <p className="previous-sponsors-subtitle">
          Celebrating the organizations that have supported our community and innovation journey.
        </p>
      </div>

      {/* Marquee Viewport — Single Continuous Row */}
      <div className="marquee-container" aria-label="Previous sponsor logos marquee">
        <div className="marquee-row" role="region" aria-label="Previous sponsors marquee">
          <div className="marquee-track marquee-track-left">
            <div className="marquee-group">
              {rowItems.map((sponsor, idx) => (
                <SponsorCard key={`p-grp1-${sponsor.id}-${idx}`} sponsor={sponsor} />
              ))}
            </div>
            <div className="marquee-group" aria-hidden="true">
              {rowItems.map((sponsor, idx) => (
                <SponsorCard key={`p-grp2-${sponsor.id}-${idx}`} sponsor={sponsor} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
