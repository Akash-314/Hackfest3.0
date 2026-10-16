import React from 'react';
import EventWorkflow from './EventWorkflow';

export default function ScheduleSection() {
  return (
    <section id="schedule" className="section schedule-section superhero-timeline-section">
      <div className="section-transition-top" />
      <div className="container">
        {/* Official HackFest 3.0 Event Workflow (Participant 2-Day Journey) */}
        <EventWorkflow />
      </div>
    </section>
  );
}

