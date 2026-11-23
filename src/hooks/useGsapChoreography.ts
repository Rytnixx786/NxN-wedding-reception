import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseGsapChoreographyOptions {
  heroRevealed: boolean;
  introDismissed: boolean;
  skipEntrance: boolean;
}

/**
 * Premium GSAP + ScrollTrigger choreography engine for the invitation.
 * - Orchestrates the Hero 3D envelope, bouquet, printed card & monogram entrance
 * - Drives ScrollTrigger 3D card rises, living bouquet spring blooms,
 *   vertical hairline draws, and staggered editorial typography reveals
 * - Runs smoothly in lockstep with both automatic entry scroll and manual scroll
 */
export function useGsapChoreography({
  heroRevealed,
  introDismissed,
  skipEntrance,
}: UseGsapChoreographyOptions): void {
  // 1. Hero Synchronized 3D Entrance Timeline (useLayoutEffect avoids any 1-frame paint flash)
  useLayoutEffect(() => {
    const root = document.getElementById('invitationMain');
    if (!root || !heroRevealed) return;

    const ctx = gsap.context(() => {
      if (skipEntrance) {
        gsap.set(
          [
            '[data-gsap="hero-palace"]',
            '[data-gsap="hero-save"]',
            '[data-gsap="hero-envelope"]',
            '[data-gsap="hero-insert"]',
            '[data-gsap="hero-seal"]',
            '[data-gsap="hero-amp"]',
            '[data-gsap="hero-name-first"]',
            '[data-gsap="hero-name-second"]',
          ],
          { clearProps: 'all', opacity: 1 }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        '[data-gsap="hero-palace"]',
        { opacity: 0, scale: 1.09 },
        {
          opacity: 0.74,
          scale: 1.02,
          duration: 1.25,
          ease: 'power3.out',
          clearProps: 'transform',
        },
        0
      )
        .fromTo(
          '[data-gsap="hero-save"]',
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            clearProps: 'transform',
          },
          0.06
        )
        .fromTo(
          '[data-gsap="hero-envelope"]',
          { opacity: 0, y: 42, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.05,
            ease: 'power4.out',
            clearProps: 'transform',
          },
          0.14
        )
        .fromTo(
          '[data-gsap="hero-insert"]',
          { yPercent: 18, scale: 0.94 },
          {
            yPercent: 0,
            scale: 1,
            duration: 1.15,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0.32
        )
        .fromTo(
          '[data-gsap="hero-seal"]',
          { scale: 0.65, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.72,
            ease: 'back.out(1.7)',
            clearProps: 'transform',
          },
          0.46
        )
        .fromTo(
          '[data-gsap="hero-amp"]',
          { opacity: 0, scale: 0.78 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.0,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0.48
        )
        .fromTo(
          '[data-gsap="hero-name-first"]',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0.54
        )
        .fromTo(
          '[data-gsap="hero-name-second"]',
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.88,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0.66
        );
    }, root);

    return () => ctx.revert();
  }, [heroRevealed, skipEntrance]);

  // 2. ScrollTrigger Section & Living Bouquet Choreography
  // Initialized together with heroRevealed via useLayoutEffect (NOT delayed until introDismissed)
  // so Ceremony Info never flashes visible during curtain parting and then vanishes!
  useLayoutEffect(() => {
    const root = document.getElementById('invitationMain');
    if (!root || !heroRevealed) return;

    const ctx = gsap.context(() => {
      if (skipEntrance) {
        gsap.set(
          '.gsap-card, .gsap-stagger, .gsap-divider, .gsap-bouquet-reveal, .gsap-venue-item, .gsap-footer-item',
          { clearProps: 'all', opacity: 1 }
        );
        return;
      }

      // Burgundy Cards (Ceremony & Reception)
      const cards = gsap.utils.toArray<HTMLElement>('.gsap-card');
      cards.forEach((card) => {
        const children = card.querySelectorAll<HTMLElement>('.gsap-stagger');
        const dividers = card.querySelectorAll<HTMLElement>('.gsap-divider');
        const bouquet = card.querySelector<HTMLElement>('.gsap-bouquet-reveal');
        const isRightBouquet = bouquet?.classList.contains(
          'living-bouquet--ceremony-right'
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            once: true,
          },
        });

        tl.fromTo(
          card,
          { opacity: 0, y: 40, rotateX: 5, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.95,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0
        );

        if (bouquet) {
          tl.fromTo(
            bouquet,
            {
              opacity: 0,
              scale: 0.72,
              x: isRightBouquet ? 26 : -26,
              rotateY: isRightBouquet ? -26 : 26,
            },
            {
              opacity: 1,
              scale: 1,
              x: 0,
              rotateY: 0,
              duration: 1.12,
              ease: 'back.out(1.45)',
              clearProps: 'transform',
            },
            0.16
          );
        }

        if (children.length > 0) {
          tl.fromTo(
            children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.76,
              stagger: 0.085,
              ease: 'power3.out',
              clearProps: 'transform',
            },
            0.12
          );
        }

        if (dividers.length > 0) {
          tl.fromTo(
            dividers,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.7,
              ease: 'power3.out',
              transformOrigin: 'top center',
              clearProps: 'transform',
            },
            0.22
          );
        }
      });

      // Venue Section Staggered Reveal
      const venueSection = root.querySelector<HTMLElement>('.venue-section');
      if (venueSection) {
        const items = venueSection.querySelectorAll<HTMLElement>('.gsap-venue-item');
        gsap.fromTo(
          items,
          { opacity: 0, y: 28, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.11,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: venueSection,
              start: 'top 92%',
              once: true,
            },
          }
        );
      }

      // Clean Closing Footer Reveal
      const footerEl = root.querySelector<HTMLElement>('.invitation-footer');
      if (footerEl) {
        const items = footerEl.querySelectorAll<HTMLElement>('.gsap-footer-item');
        gsap.fromTo(
          items,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: footerEl,
              start: 'top 94%',
              once: true,
            },
          }
        );
      }
    }, root);

    // Ensure accurate scroll trigger coordinates after web fonts settle
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 220);
    if ('fonts' in document) {
      document.fonts.ready
        .then(() => ScrollTrigger.refresh())
        .catch(() => undefined);
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [heroRevealed, skipEntrance]);

  // Refresh ScrollTrigger measurements cleanly once splash unlocks scrolling (no revert!)
  useEffect(() => {
    if (!introDismissed) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [introDismissed]);
}
