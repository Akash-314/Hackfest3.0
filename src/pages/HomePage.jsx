import React from 'react';
import doomImg from '../assets/doom.png';

export default function HomePage() {
  return (
    <main className="homepage-pure-container">
      {/* 1. Doctor Doom Image */}
      <img
        src={doomImg}
        alt="Doctor Doom - Hackfest"
        className="homepage-pure-image"
      />
      <div className="homepage-pure-overlay" />

      {/* 2. Hackfest text using Neo.ttf font - H in capital only */}
      <div className="homepage-pure-content">
        <h1 className="homepage-pure-title">
          Hackfest 3.0
        </h1>
      </div>
    </main>
  );
}
