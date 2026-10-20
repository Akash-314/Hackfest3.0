import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Users, Trophy, RotateCcw } from 'lucide-react';
import TiltedCard from './ui/TiltedCard';
import './EventCard.css';

export default function EventCard({ comp, meta }) {
  const destinationUrl = `/${comp.id}`;

  const backContent = (
    <div className="event-card-back">
      <div className="event-card-back-header">
        <h4 className="event-card-back-title">{comp.title}</h4>
        <p className="event-card-back-desc">
          {comp.shortDescription || meta?.punchline || 'Explore challenge tracks, evaluation rubrics, and submission guidelines.'}
        </p>
      </div>

      <div className="event-card-back-facts">
        {meta?.meta1 && (
          <span className="event-card-fact-badge">
            <Users size={12} color="#8DDBB0" />
            {meta.meta1}
          </span>
        )}
        {(comp.duration || meta?.meta2) && (
          <span className="event-card-fact-badge">
            <Clock size={12} color="#8DDBB0" />
            {comp.duration || meta?.meta2}
          </span>
        )}
        {comp.format && (
          <span className="event-card-fact-badge">
            <Trophy size={12} color="#8DDBB0" />
            {comp.format}
          </span>
        )}
      </div>

      <div>
        <Link
          to={destinationUrl}
          onClick={(e) => {
            // Prevent event bubbling so activating the link does not re-flip the card
            e.stopPropagation();
          }}
          className="event-card-action-btn"
          aria-label={`View full details for ${comp.title}`}
        >
          <span>VIEW FULL DETAILS</span>
          <ArrowUpRight size={15} />
        </Link>
        <div className="event-card-flip-hint" aria-hidden="true">
          <RotateCcw size={11} />
          <span>Click card to flip</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hackfest-event-card-wrapper">
      <TiltedCard
        containerHeight="380px"
        containerWidth="100%"
        imageHeight="380px"
        imageWidth="100%"
        rotateAmplitude={5}
        scaleOnHover={1.015}
        perspective={1000}
        smoothness={0.8}
        glare={0.18}
        shadow={0.25}
        parallax={0}
        floating={false}
        gyroscope={false}
        flipOnClick={true}
        showTooltip={false}
        radius={16}
        backContent={backContent}
        className="hackfest-tilted-event-card"
        captionText={comp.title}
      >
        {/* FRONT FACE — EVENT NAME & FLIP INSTRUCTION */}
        <div className="event-card-front">
          <h3 className="event-card-front-title">
            {comp.title}
          </h3>
          <div className="event-card-front-hint">
            <RotateCcw size={12} className="event-card-hint-icon" />
            <span>CLICK TO EXPLORE</span>
          </div>
        </div>
      </TiltedCard>
    </div>
  );
}
