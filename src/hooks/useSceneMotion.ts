import { useEffect } from 'react';

/**
 * Unified 60fps scroll-progress + smooth damped pointer-tilt 3D motion driver.
 * Writes directly to CSS custom properties on `#invitationMain` outside React's
 * render cycle (zero React re-renders during scroll or pointer movement).
 *
 * Drives:
 *  - Hero 3D Envelope + Bouquet + Card synchronized rig (`--hero-p`, `--hero-tilt-x`, `--hero-tilt-y`, `--hero-sheen`)
 *  - Palace watermarks (`--p-hero`, `--p-venue`)
 *  - Bonded 3D depth on Ceremony & Reception cards + florals (`--p-ceremony`, `--p-reception`)
 */
export function useSceneMotion(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const root = document.getElementById('invitationMain');
    if (!root) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;

    let rafId = 0;
    let scrollDirty = true;
    let pointerActive = false;

    // Smooth damped pointer targets [-1, 1]
    let targetPx = 0;
    let targetPy = 0;
    let curPx = 0;
    let curPy = 0;

    // Cached hero scroll progress [0, 1]
    let heroP = 0;

    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v));

    const computeScrollVars = () => {
      const vh = window.innerHeight || 1;
      const heroEl = root.querySelector('.hero-section') as HTMLElement | null;
      const ceremonyEl = root.querySelector(
        '.ceremony-card'
      ) as HTMLElement | null;
      const receptionEl = root.querySelector(
        '.reception-card'
      ) as HTMLElement | null;
      const venueEl = root.querySelector(
        '.venue-section'
      ) as HTMLElement | null;

      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // 0 at page top -> 1 as hero exits top of viewport
        const travel = Math.max(rect.height * 0.85, 320);
        heroP = clamp(-rect.top / travel, 0, 1);
        const centerNorm = clamp(
          (rect.top + rect.height * 0.5 - vh * 0.5) / vh,
          -1,
          1
        );
        root.style.setProperty('--hero-p', heroP.toFixed(4));
        root.style.setProperty('--p-hero', centerNorm.toFixed(4));
      }

      const updateCardVar = (el: HTMLElement | null, name: string) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -160 || rect.top > vh + 160) return;
        const norm = clamp(
          (rect.top + rect.height * 0.5 - vh * 0.5) / vh,
          -1,
          1
        );
        root.style.setProperty(name, norm.toFixed(4));
      };

      updateCardVar(ceremonyEl, '--p-ceremony');
      updateCardVar(receptionEl, '--p-reception');
      updateCardVar(venueEl, '--p-venue');
    };

    let lastNow = performance.now();

    const tick = (now: number) => {
      rafId = 0;
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      if (scrollDirty) {
        computeScrollVars();
        scrollDirty = false;
      }

      // Exponentially smooth pointer tilt (spring-like silky inertia)
      const damp = 1 - Math.exp(-6.5 * dt);
      curPx += (targetPx - curPx) * damp;
      curPy += (targetPy - curPy) * damp;

      // Combine scroll-driven 3D angle + gentle desktop pointer tilt
      const isCompact = window.innerWidth < 768;
      const scrollRotX = heroP * (isCompact ? 2.6 : 4.2);
      const scrollRotY = heroP * (isCompact ? -1.4 : -2.4);

      const pointerRotX = finePointer ? -curPy * 3.8 : 0;
      const pointerRotY = finePointer ? curPx * 4.4 : 0;

      const totalRotX = clamp(scrollRotX + pointerRotX, -5.5, 6.8);
      const totalRotY = clamp(scrollRotY + pointerRotY, -6.2, 6.2);

      // Dynamic light sheen across the cream invitation card surface
      const sheenPct = clamp(50 + totalRotY * 5.5 + heroP * 22, 10, 90);

      root.style.setProperty('--hero-tilt-x', `${totalRotX.toFixed(3)}deg`);
      root.style.setProperty('--hero-tilt-y', `${totalRotY.toFixed(3)}deg`);
      root.style.setProperty('--hero-sheen', `${sheenPct.toFixed(1)}%`);
      root.style.setProperty('--scene-px', curPx.toFixed(3));
      root.style.setProperty('--scene-py', curPy.toFixed(3));

      const stillSettling =
        Math.abs(targetPx - curPx) > 0.004 ||
        Math.abs(targetPy - curPy) > 0.004;

      if (scrollDirty || stillSettling || pointerActive) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const requestTick = () => {
      if (!rafId) {
        lastNow = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      scrollDirty = true;
      requestTick();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!finePointer) return;
      pointerActive = true;
      targetPx = clamp((e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2, -1, 1);
      targetPy = clamp((e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2, -1, 1);
      requestTick();
    };

    const onPointerLeave = () => {
      pointerActive = false;
      targetPx = 0;
      targetPy = 0;
      requestTick();
    };

    // Initial sync frame
    scrollDirty = true;
    requestTick();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (finePointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('mouseleave', onPointerLeave);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (finePointer) {
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('mouseleave', onPointerLeave);
      }
    };
  }, [enabled]);
}
