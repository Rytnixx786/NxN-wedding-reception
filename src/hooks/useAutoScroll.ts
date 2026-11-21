import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoScrollOptions {
  /** Incremented after the user opens the invitation (not on ?open=1). */
  autoStartSignal: number;
  /** Pauses whenever splash is still active or any modal is open. */
  blocked: boolean;
  /** Delay after opening before the gentle scroll starts (ms). */
  startDelayMs?: number;
  /** Cruise speed in px/s (~46 px/s ≈ 42s full tour matching Bismillah). */
  cruiseSpeedPxPerSec?: number;
}

export interface AutoScrollController {
  isAutoScrolling: boolean;
  toggleAutoScroll: () => void;
  stopAutoScroll: () => void;
}

const NAV_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Space',
  ' ',
  'Home',
  'End',
]);

function getScrollTop(): number {
  return (
    window.scrollY ||
    document.scrollingElement?.scrollTop ||
    document.documentElement.scrollTop ||
    0
  );
}

function getMaxScroll(): number {
  const el = document.scrollingElement || document.documentElement;
  return Math.max(0, el.scrollHeight - window.innerHeight);
}

function setScrollTopInstant(y: number): void {
  const el = document.scrollingElement || document.documentElement;
  el.scrollTop = y;
  if (Math.abs(getScrollTop() - y) > 2) {
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
  }
}

export function useAutoScroll({
  autoStartSignal,
  blocked,
  startDelayMs = 1500,
  cruiseSpeedPxPerSec = 46,
}: UseAutoScrollOptions): AutoScrollController {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const activeRef = useRef(false);
  const blockedRef = useRef(blocked);
  const rafRef = useRef(0);
  const startTimerRef = useRef<number | null>(null);
  const virtualYRef = useRef(0);
  const lastAppliedYRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastHandledSignalRef = useRef(0);

  blockedRef.current = blocked;

  const stopAutoScroll = useCallback(() => {
    activeRef.current = false;
    setIsAutoScrolling(false);
    document.documentElement.classList.remove('is-autoscrolling');
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  }, []);

  const beginLoop = useCallback(
    (forceManual = false) => {
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduced && !forceManual) return;
      if (blockedRef.current) return;

      const maxScroll = getMaxScroll();
      if (maxScroll <= 12) return;

      // If already near bottom when user clicks replay, jump cleanly to top first
      const initialY = getScrollTop();
      if (initialY >= maxScroll - 28) {
        setScrollTopInstant(0);
      }

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }

      activeRef.current = true;
      setIsAutoScrolling(true);
      document.documentElement.classList.add('is-autoscrolling');

      const startY = getScrollTop();
      virtualYRef.current = startY;
      lastAppliedYRef.current = startY;
      startTimeRef.current = performance.now();
      lastFrameRef.current = performance.now();

      const step = (now: number) => {
        if (!activeRef.current || blockedRef.current) {
          stopAutoScroll();
          return;
        }

        const currentY = getScrollTop();
        // Generous 18px tolerance absorbs Windows DPI scaling (125%/150%) rounding
        // while still immediately yielding to manual scrollbar drags or jumps
        if (Math.abs(currentY - lastAppliedYRef.current) > 18) {
          stopAutoScroll();
          return;
        }

        const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
        lastFrameRef.current = now;

        const currentMax = getMaxScroll();
        const remaining = currentMax - virtualYRef.current;

        if (remaining <= 1.5) {
          setScrollTopInstant(currentMax);
          stopAutoScroll();
          return;
        }

        // Smooth cubic ease-in ramp over first 1.6s + velvety deceleration over last 180px
        const elapsedSec = (now - startTimeRef.current) / 1000;
        const tIn = Math.min(1, elapsedSec / 1.6);
        const easeIn = 1 - Math.pow(1 - tIn, 3);
        const decelOut =
          remaining < 180 ? Math.max(0.14, Math.pow(remaining / 180, 1.35)) : 1;

        const speed = cruiseSpeedPxPerSec * easeIn * decelOut;
        virtualYRef.current = Math.min(
          currentMax,
          virtualYRef.current + speed * dt
        );

        const nextY = virtualYRef.current;
        setScrollTopInstant(nextY);
        lastAppliedYRef.current = getScrollTop();

        rafRef.current = window.requestAnimationFrame(step);
      };

      rafRef.current = window.requestAnimationFrame(step);
    },
    [cruiseSpeedPxPerSec, stopAutoScroll]
  );

  const toggleAutoScroll = useCallback(() => {
    if (activeRef.current) {
      stopAutoScroll();
    } else if (!blockedRef.current) {
      beginLoop(true);
    }
  }, [beginLoop, stopAutoScroll]);

  // Trigger guided cinematic tour once per explicit invitation open
  useEffect(() => {
    if (autoStartSignal === 0 || autoStartSignal === lastHandledSignalRef.current) {
      return;
    }
    if (blocked) return;

    lastHandledSignalRef.current = autoStartSignal;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduced) return;

    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
    }

    // Ensure fonts are settled before measuring scrollHeight & starting the glide
    const fontsReady =
      'fonts' in document
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    let cancelled = false;
    fontsReady.then(() => {
      if (cancelled || blockedRef.current) return;
      startTimerRef.current = window.setTimeout(() => {
        startTimerRef.current = null;
        if (!cancelled && !blockedRef.current) {
          beginLoop(false);
        }
      }, startDelayMs);
    });

    return () => {
      cancelled = true;
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
    };
  }, [autoStartSignal, blocked, startDelayMs, beginLoop]);

  // Immediately pause when modals open or curtain is shown
  useEffect(() => {
    if (blocked && activeRef.current) {
      stopAutoScroll();
    }
  }, [blocked, stopAutoScroll]);

  // Respectful user interruption listeners: NEVER fight manual scroll
  useEffect(() => {
    const onWheel = () => {
      if (activeRef.current) stopAutoScroll();
    };
    const onTouchMove = () => {
      if (activeRef.current) stopAutoScroll();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (NAV_KEYS.has(e.key) && activeRef.current) {
        stopAutoScroll();
      }
    };
    const onBlur = () => {
      // Yields immediately when interacting inside cross-origin Google Maps iframe
      if (activeRef.current) stopAutoScroll();
    };
    const onVisChange = () => {
      if (document.visibilityState === 'hidden' && activeRef.current) {
        stopAutoScroll();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [stopAutoScroll]);

  useEffect(() => {
    return () => stopAutoScroll();
  }, [stopAutoScroll]);

  return { isAutoScrolling, toggleAutoScroll, stopAutoScroll };
}
