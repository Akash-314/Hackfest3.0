import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollReveal: Lightweight, high-performance viewport reveal system.
 * Strictly excludes the homepage hero (#hero, .homepage-hero-interactive).
 * Respects prefers-reduced-motion: reduce.
 */
export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    // If reduced motion is preferred or IntersectionObserver is unavailable, exit safely
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      // Ensure all elements are immediately visible
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const scanAndObserve = () => {
      const selectors = [
        '.reveal-on-scroll',
        '[data-reveal]',
        '.section-header',
        '.competitions-grid > *',
        '.prizes-podium-grid > *',
        '.rules-faq-grid > *',
        '.superhero-phase-bar',
        '.briefing-hud-grid > *',
        '.briefing-base-overview',
        '.about-overview-grid > *',
        '.highlights-grid > *',
        '.stark-stats-grid > *',
        '.stark-missions-grid > *',
        '.stark-timeline-card',
        '.footer-grid > *',
      ];

      const elements = document.querySelectorAll(selectors.join(', '));

      elements.forEach((el) => {
        // STRICT LOCK: Never touch or animate the homepage hero or its children
        if (el.closest('#hero') || el.closest('.homepage-hero-interactive')) {
          return;
        }

        if (!el.classList.contains('reveal-on-scroll')) {
          el.classList.add('reveal-on-scroll');

          // Apply subtle stagger to grid children
          const parent = el.parentElement;
          if (parent) {
            const isGrid =
              parent.classList.contains('competitions-grid') ||
              parent.classList.contains('prizes-podium-grid') ||
              parent.classList.contains('rules-faq-grid') ||
              parent.classList.contains('briefing-hud-grid') ||
              parent.classList.contains('stark-stats-grid') ||
              parent.classList.contains('highlights-grid') ||
              parent.classList.contains('stark-missions-grid') ||
              parent.classList.contains('footer-grid');

            if (isGrid) {
              const idx = Array.from(parent.children).indexOf(el);
              if (idx >= 0 && idx < 8) {
                el.classList.add(`stagger-${idx + 1}`);
              }
            }
          }
        }

        // If not yet revealed, observe it
        if (!el.classList.contains('is-revealed')) {
          observer.observe(el);
        }
      });
    };

    // Initial scan after render settle
    const timer = setTimeout(scanAndObserve, 60);

    // Mutation observer for dynamically loaded content (e.g., Supabase SDC members or FAQs)
    let mutationTimer = null;
    const mutationObserver = new MutationObserver(() => {
      if (mutationTimer) clearTimeout(mutationTimer);
      mutationTimer = setTimeout(scanAndObserve, 120);
    });

    const root = document.querySelector('.public-content-outlet') || document.body;
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      if (mutationTimer) clearTimeout(mutationTimer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);
}
