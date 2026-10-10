import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoadingScreen from './LoadingScreen';
import CinematicScene from './CinematicScene';
import CinematicOverlay from './CinematicOverlay';
import '../../styles/cinematic.css';

/**
 * CinematicIntro:
 * High-end Marvel/superhero-inspired 3D scroll-driven intro sequence.
 * Takes 380vh of scroll track and pins a 100vh canvas while the user scrolls.
 * Progressively drives the timeline:
 * 0-15%: Dormant superhero armor in deep cosmic darkness
 * 15-40%: Arc reactor core ignition & visor protocol online
 * 40-60%: Flight posture & supersonic repulsor lift
 * 60-75%: Forward launch into space
 * 75-90%: Hyperspace warp travel
 * 90-100%: Multiverse portal convergence & HackFest 3.0 reveal
 */
export default function CinematicIntro({ onIntroComplete = () => {} }) {
  const containerRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(20);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const [isPastIntro, setIsPastIntro] = useState(false);

  // Check mobile & reduced motion
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      // Respect user accessibility preference
      setIsReady(true);
      setHasEntered(true);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update loading progress as 3D assets load
  const handleAssetLoaded = useCallback((pct) => {
    setLoadingProgress((prev) => Math.max(prev, Math.round(pct)));
    if (pct >= 100) {
      setTimeout(() => {
        setIsReady(true);
      }, 400);
    }
  }, []);

  // Fallback safety timer so the user is never stuck loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingProgress(100);
      setIsReady(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // User clicks "ENTER HACKFEST UNIVERSE" on the loading screen
  const handleEnter = useCallback(() => {
    setHasEntered(true);
  }, []);

  // Track scroll position inside the 380vh container
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          const totalScrollable = container.offsetHeight - window.innerHeight;

          if (totalScrollable <= 0) {
            setScrollProgress(1);
            setIsPastIntro(false);
            ticking = false;
            return;
          }

          // Top of container relative to viewport scroll
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const currentScroll = Math.max(0, scrollY - container.offsetTop);
          const rawProgress = currentScroll / totalScrollable;
          const clamped = Math.min(1, Math.max(0, rawProgress));
          scrollProgressRef.current = clamped;
          setScrollProgress(clamped);

          const past = currentScroll >= totalScrollable;
          setIsPastIntro(past);

          if (clamped > 0.01) {
            setHasEntered(true);
          }

          if (clamped >= 0.99) {
            onIntroComplete(true);
          } else {
            onIntroComplete(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [onIntroComplete]);

  // "SKIP INTRO" scrolls directly down past the 380vh section
  const handleSkip = useCallback(() => {
    if (!containerRef.current) return;
    const offset = containerRef.current.offsetTop + containerRef.current.offsetHeight;
    window.scrollTo({
      top: offset - 20,
      behavior: 'smooth',
    });
  }, []);

  const viewportStyle = isPastIntro
    ? {
        position: 'absolute',
        bottom: 0,
        top: 'auto',
        left: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }
    : {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 10,
      };

  return (
    <section
      ref={containerRef}
      id="cinematic-intro"
      aria-label="HackFest 3.0 Cinematic Intro"
      className="relative w-full bg-slate-950 text-white"
      style={{
        // 1250vh pinned scroll track: slow, deliberate, movie-trailer pacing so every character reveal is appreciated
        height: isMobile ? '850vh' : '1250vh',
        position: 'relative',
      }}
    >
      {/* PINNED 100VH CINEMATIC VIEWPORT */}
      <div className="cinematic-sticky-viewport" style={viewportStyle}>
        {/* Loading Screen Overlay */}
        {!hasEntered && (
          <LoadingScreen
            progress={loadingProgress}
            isLoaded={isReady}
            onComplete={handleEnter}
          />
        )}

        {/* Master Three.js WebGL Scene */}
        <CinematicScene
          progress={scrollProgress}
          progressRef={scrollProgressRef}
          isPastIntro={isPastIntro}
          onAssetLoaded={handleAssetLoaded}
        />

        {/* Holographic Stark HUD & Title Reveal */}
        <CinematicOverlay
          progress={scrollProgress}
          onSkip={handleSkip}
          isMobile={isMobile}
        />
      </div>
    </section>
  );
}
