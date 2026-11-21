import { useCallback, useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  /** Incremented whenever the guest opens/enters the invitation. */
  autoStartSignal: number;
  /** Pauses whenever splash is still active or any modal is open. */
  blocked: boolean;
  /** Delay after opening before the gentle scroll starts (ms). */
  startDelayMs?: number;
  /** Calm pause after manual scroll / click before auto-scrolling smoothly resumes (ms). */
  resumeDelayMs?: number;
  /** Cruise speed in px/s (~46 px/s ≈ 42s full tour matching Bismillah). */
  cruiseSpeedPxPerSec?: number;
}

export interface AutoScrollController {
  /** Immediately pauses auto-scroll; automatically resumes after calm delay unless blocked. */
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
  startDelayMs = 850,
  resumeDelayMs = 2800,
  cruiseSpeedPxPerSec = 48,
}: UseAutoScrollOptions): AutoScrollController {
  const activeRef = useRef(false);
  const pendingRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const pointerDownRef = useRef(false);
  const blockedRef = useRef(blocked);
  const rafRef = useRef(0);
  const startTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const virtualYRef = useRef(0);
  const lastAppliedYRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastHandledSignalRef = useRef(0);
  const wasBlockedRef = useRef(blocked);

  blockedRef.current = blocked;

  const clearTimers = useCallback(() => {
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const haltLoopOnly = useCallback(() => {
    activeRef.current = false;
    pendingRef.current = false;
    document.documentElement.classList.remove('is-autoscrolling');
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    clearTimers();
  }, [clearTimers]);

  const beginLoopRef = useRef<() => void>(() => undefined);

  // Schedule a gentle automatic resume after the user finishes scrolling/clicking
  const scheduleResume = useCallback(
    (delayMs = resumeDelayMs) => {
      if (!hasEnteredRef.current || blockedRef.current) return;
      if (document.visibilityState === 'hidden') return;

      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = window.setTimeout(() => {
        resumeTimerRef.current = null;
        if (
          !hasEnteredRef.current ||
          blockedRef.current ||
          pointerDownRef.current ||
          document.visibilityState === 'hidden'
        ) {
          return;
        }
        // Only resume if there is still room left to scroll downward
        const remaining = getMaxScroll() - getScrollTop();
        if (remaining > 6) {
          beginLoopRef.current();
        }
      }, delayMs);
    },
    [resumeDelayMs]
  );

  // Pause immediately and automatically resume after a short calm period
  const pauseAndScheduleResume = useCallback(
    (delayMs = resumeDelayMs) => {
      haltLoopOnly();
      scheduleResume(delayMs);
    },
    [haltLoopOnly, scheduleResume, resumeDelayMs]
  );

  const beginLoop = useCallback(() => {
    if (blockedRef.current || pointerDownRef.current) return;

    const maxScroll = getMaxScroll();
    const startY = getScrollTop();
    if (maxScroll - startY <= 4) return;

    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
    }

    clearTimers();
    pendingRef.current = false;
    activeRef.current = true;
    document.documentElement.classList.add('is-autoscrolling');

    virtualYRef.current = startY;
    lastAppliedYRef.current = startY;
    startTimeRef.current = performance.now();
    lastFrameRef.current = performance.now();

    const step = (now: number) => {
      if (!activeRef.current || blockedRef.current) {
        haltLoopOnly();
        return;
      }

      const currentY = getScrollTop();
      // 18px tolerance absorbs Windows DPI scaling (125%/150%) while detecting scrollbar drags
      if (Math.abs(currentY - lastAppliedYRef.current) > 18) {
        pauseAndScheduleResume(resumeDelayMs);
        return;
      }

      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;

      const currentMax = getMaxScroll();
      const remaining = currentMax - virtualYRef.current;

      if (remaining <= 1.5) {
        setScrollTopInstant(currentMax);
        haltLoopOnly();
        return;
      }

      // Smooth cubic ease-in ramp over first 1.25s + velvety deceleration over last 180px
      const elapsedSec = (now - startTimeRef.current) / 1000;
      const tIn = Math.min(1, elapsedSec / 1.25);
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
  }, [
    clearTimers,
    cruiseSpeedPxPerSec,
    haltLoopOnly,
    pauseAndScheduleResume,
    resumeDelayMs,
  ]);

  beginLoopRef.current = beginLoop;

  // Automatically begin smooth guided scroll on entry
  useEffect(() => {
    if (
      autoStartSignal === 0 ||
      autoStartSignal === lastHandledSignalRef.current
    ) {
      return;
    }
    if (blocked) return;

    lastHandledSignalRef.current = autoStartSignal;
    hasEnteredRef.current = true;
    pendingRef.current = true;

    clearTimers();

    const fontsReady =
      'fonts' in document
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    let cancelled = false;
    fontsReady.then(() => {
      if (cancelled || blockedRef.current || !pendingRef.current) return;
      startTimerRef.current = window.setTimeout(() => {
        startTimerRef.current = null;
        if (!cancelled && !blockedRef.current && pendingRef.current) {
          beginLoop();
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
  }, [autoStartSignal, blocked, startDelayMs, beginLoop, clearTimers]);

  // Pause while modals/splash are active; automatically resume calmly once modal closes
  useEffect(() => {
    if (blocked) {
      haltLoopOnly();
    } else if (
      wasBlockedRef.current &&
      hasEnteredRef.current &&
      !pendingRef.current &&
      !activeRef.current
    ) {
      scheduleResume(resumeDelayMs);
    }
    wasBlockedRef.current = blocked;
  }, [blocked, haltLoopOnly, scheduleResume, resumeDelayMs]);

  // Respectful user interaction listeners:
  // Manual scroll, wheel, touch, click, or nav key pauses briefly then auto-resumes!
  useEffect(() => {
    const onUserInteract = () => {
      if (!hasEnteredRef.current || blockedRef.current) return;
      pauseAndScheduleResume(resumeDelayMs);
    };

    const onPointerDown = () => {
      if (!hasEnteredRef.current || blockedRef.current) return;
      pointerDownRef.current = true;
      haltLoopOnly();
    };

    const onPointerUpOrCancel = () => {
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;
      if (hasEnteredRef.current && !blockedRef.current) {
        scheduleResume(resumeDelayMs);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (NAV_KEYS.has(e.key)) {
        onUserInteract();
      }
    };

    const onVisChange = () => {
      if (document.visibilityState === 'hidden') {
        haltLoopOnly();
      } else if (hasEnteredRef.current && !blockedRef.current) {
        scheduleResume(resumeDelayMs);
      }
    };

    window.addEventListener('wheel', onUserInteract, { passive: true });
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onUserInteract, { passive: true });
    window.addEventListener('touchend', onPointerUpOrCancel, { passive: true });
    window.addEventListener('touchcancel', onPointerUpOrCancel, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUpOrCancel, { passive: true });
    window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      window.removeEventListener('wheel', onUserInteract);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onUserInteract);
      window.removeEventListener('touchend', onPointerUpOrCancel);
      window.removeEventListener('touchcancel', onPointerUpOrCancel);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUpOrCancel);
      window.removeEventListener('pointercancel', onPointerUpOrCancel);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [haltLoopOnly, pauseAndScheduleResume, scheduleResume, resumeDelayMs]);

  useEffect(() => {
    return () => haltLoopOnly();
  }, [haltLoopOnly]);

  return { stopAutoScroll: pauseAndScheduleResume };
}
