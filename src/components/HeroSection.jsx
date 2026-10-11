import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import ParticleText from './ui/ParticleText';
import doomImg from '../assets/doom.png';
import ironImg from '../assets/iron.png';

export default function HeroSection() {
  const heroRef = useRef(null);
  const animFrameRef = useRef(null);
  const touchTimerRef = useRef(null);

  // Fallback image sources
  const [doomSrc, setDoomSrc] = useState(doomImg);
  const [ironSrc, setIronSrc] = useState(ironImg);

  // Smooth cursor tracking coordinates (rAF-driven, zero React re-renders)
  const posRef = useRef({
    targetX: -9999,
    targetY: -9999,
    currentX: -9999,
    currentY: -9999,
    isHovering: false,
    settled: true,
  });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updatePosition = useCallback(() => {
    const p = posRef.current;
    const heroEl = heroRef.current;
    if (!heroEl) return;

    if (prefersReducedMotion) {
      p.currentX = p.targetX;
      p.currentY = p.targetY;
      heroEl.style.setProperty('--mouse-x', `${p.currentX.toFixed(1)}px`);
      heroEl.style.setProperty('--mouse-y', `${p.currentY.toFixed(1)}px`);
      p.settled = true;
      return;
    }

    // Responsive, silky smooth glide damping
    const lerpDamp = 0.28;
    p.currentX += (p.targetX - p.currentX) * lerpDamp;
    p.currentY += (p.targetY - p.currentY) * lerpDamp;

    heroEl.style.setProperty('--mouse-x', `${p.currentX.toFixed(1)}px`);
    heroEl.style.setProperty('--mouse-y', `${p.currentY.toFixed(1)}px`);

    const diffX = Math.abs(p.targetX - p.currentX);
    const diffY = Math.abs(p.targetY - p.currentY);

    if (diffX > 0.1 || diffY > 0.1 || p.isHovering) {
      animFrameRef.current = requestAnimationFrame(updatePosition);
      p.settled = false;
    } else {
      p.currentX = p.targetX;
      p.currentY = p.targetY;
      heroEl.style.setProperty('--mouse-x', `${p.currentX.toFixed(1)}px`);
      heroEl.style.setProperty('--mouse-y', `${p.currentY.toFixed(1)}px`);
      p.settled = true;
    }
  }, [prefersReducedMotion]);

  const wakeLoop = useCallback(() => {
    if (posRef.current.settled) {
      posRef.current.settled = false;
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(updatePosition);
    }
  }, [updatePosition]);

  const setPointerPos = (clientX, clientY, instant = false) => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const p = posRef.current;
    p.targetX = x;
    p.targetY = y;
    if (instant || p.currentX < -5000) {
      p.currentX = x;
      p.currentY = y;
    }
    p.isHovering = true;
    heroEl.style.setProperty('--reveal-opacity', '1');
    wakeLoop();
  };

  const handleMouseMove = (e) => {
    setPointerPos(e.clientX, e.clientY);
  };

  const handleMouseEnter = (e) => {
    setPointerPos(e.clientX, e.clientY, true);
  };

  const handleMouseLeave = () => {
    const p = posRef.current;
    p.isHovering = false;
    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.style.setProperty('--reveal-opacity', '0');
    }
  };

  // Mobile touch handling (reveals circular lens at touch position without blocking scrolling)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      setPointerPos(touch.clientX, touch.clientY, true);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      setPointerPos(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      handleMouseLeave();
    }, 1800);
  };

  useEffect(() => {
    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.style.setProperty('--mouse-x', '-9999px');
      heroEl.style.setProperty('--mouse-y', '-9999px');
      heroEl.style.setProperty('--reveal-opacity', '0');
      heroEl.style.setProperty('--reveal-radius', '320px');
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="doom-iron-hero"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="HackFest 3.0 Hero"
    >
      {/* 1. LAYER 1: Permanent Full-Screen DOOM Background */}
      <div className="hero-doom-layer" aria-hidden="true">
        <img
          src={doomSrc}
          alt="Doctor Doom - Hackfest 3.0"
          className="hero-character-img hero-doom-img"
          loading="eager"
          fetchPriority="high"
          onError={() => setDoomSrc('/doom.png')}
        />
      </div>

      {/* 2. LAYER 2: Localized Circular Reveal of Iron Man (Masked Around Cursor) */}
      <div className="hero-iron-layer" aria-hidden="true">
        <img
          src={ironSrc}
          alt="Iron Man - Hackfest 3.0"
          className="hero-character-img hero-iron-img"
          loading="eager"
          fetchPriority="high"
          onError={() => setIronSrc('/iron.png')}
        />
      </div>

      {/* 3. LAYER 3: Cinematic Atmospheric Vignette (Protects Text Contrast) */}
      <div className="hero-cinematic-atmosphere" aria-hidden="true" />

      {/* 4. LAYER 4: Prominent Centered Title (Futuristic Outlined HACKFEST 3.0 via React Bits ParticleText) */}
      <div className="hero-center-stage">
        <h1 className="hero-particle-h1">
          <ParticleText
            text="HACKFEST 3.0"
            fontFamily="'Orbitron', 'Neo', sans-serif"
            fontWeight={900}
            fontStyle="italic"
            fontSize="clamp(2.4rem, 7.8vw, 7.2rem)"
            letterSpacing="0.06em"
            outlined={true}
            outlineWidth={2.4}
            particleSize={1.9}
            density={2.2}
            color="#F4F7FB"
            highlightColor="#00D9FF"
            scatter={130}
            gatherDuration={1400}
            stagger={300}
            pointerRepel={32}
            repelRadius={120}
            idleDrift={0.3}
            trigger="mount"
            glow={true}
            className="hero-particle-text"
          />
        </h1>
      </div>

      {/* 5. Scroll Indicator Button at Bottom of Hero */}
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById('announcements') || document.getElementById('about');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="hero-scroll-explore-pill"
        aria-label="Scroll to explore event details"
      >
        <span>SCROLL TO EXPLORE</span>
        <ChevronDown size={15} className="scroll-chevron-bounce" />
      </button>
    </section>
  );
}
