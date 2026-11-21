import { useCallback, useEffect, useRef } from 'react';
import { weddingConfig } from '../config/wedding';
import {
  LivingHeartsCanvas,
  LivingHeartsCanvasHandle,
} from './LivingHeartsCanvas';
import { LivingBouquet } from './LivingBouquet';

export type CurtainStage = 'idle' | 'unsealing' | 'parting' | 'dismissed';

interface IntroCurtainProps {
  stage: CurtainStage;
  assetsReady: boolean;
  onTriggerOpen: () => void;
}

export function IntroCurtain({
  stage,
  assetsReady,
  onTriggerOpen,
}: IntroCurtainProps) {
  const { couple, hero } = weddingConfig;
  const canvasHandleRef = useRef<LivingHeartsCanvasHandle | null>(null);
  const sealRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleOpenGesture = useCallback(() => {
    if (stage !== 'idle') return;
    const rect = sealRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    canvasHandleRef.current?.triggerBurst(cx, cy);
    onTriggerOpen();
  }, [stage, onTriggerOpen]);

  // Smooth 3D physical card pointer tilt on active desktop pointer movement (rests cleanly at 0deg when idle)
  useEffect(() => {
    if (stage !== 'idle') return;
    const card = cardRef.current;
    if (!card) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let rafId = 0;
    let lastNow = performance.now();

    const tick = (now: number) => {
      rafId = 0;
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;

      const damp = 1 - Math.exp(-6.2 * dt);
      curX += (targetX - curX) * damp;
      curY += (targetY - curY) * damp;

      const maxDeg = 4.6;
      card.style.setProperty('--intro-rx', `${(-curY * maxDeg).toFixed(3)}deg`);
      card.style.setProperty('--intro-ry', `${(curX * maxDeg).toFixed(3)}deg`);
      card.style.setProperty('--intro-px', curX.toFixed(3));
      card.style.setProperty('--intro-py', curY.toFixed(3));

      if (
        Math.abs(targetX - curX) > 0.002 ||
        Math.abs(targetY - curY) > 0.002
      ) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const requestTick = () => {
      if (!rafId) {
        lastNow = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      targetY = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      requestTick();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      requestTick();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, [stage]);

  useEffect(() => {
    if (stage === 'parting') {
      canvasHandleRef.current?.sweepOut();
    }
  }, [stage]);

  useEffect(() => {
    if (stage !== 'idle') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpenGesture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, handleOpenGesture]);

  const isDismissed = stage === 'dismissed';
  const isUnsealing = stage === 'unsealing';
  const isParting = stage === 'parting';

  return (
    <div
      id="introCurtain"
      className={[
        'intro-curtain',
        isUnsealing ? 'is-unsealing' : '',
        isParting ? 'is-parting' : '',
        isDismissed ? 'is-dismissed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label="Open Wedding Invitation"
      aria-hidden={isDismissed}
      onClick={(e) => {
        if (stage !== 'idle') return;
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          handleOpenGesture();
        }
      }}
    >
      {/* Seamless Idle Velvet Backdrop */}
      <div className="curtain-seamless-bg" aria-hidden="true" />

      {/* Twin Royal Velvet Burgundy Silk Drapes with Antique Gold Edge */}
      <div className="curtain-panels" aria-hidden="true">
        <div className="curtain-panel curtain-panel--left" />
        <div className="curtain-panel curtain-panel--right" />
      </div>

      {/* Living 3D-Shaded Floating Hearts + Golden Stardust Canvas */}
      {!isDismissed && (
        <LivingHeartsCanvas ref={canvasHandleRef} active={!isDismissed} />
      )}

      {/* Centered ChungDoi Minimalism Dark Red Cream Invitation Card */}
      <div className="intro-card-stage">
        <div className="intro-card-rig" ref={cardRef}>
          {/* Symmetrical Crisp Living 3D Foreground Floral Bouquets */}
          <LivingBouquet variant="intro-left" />
          <LivingBouquet variant="intro-right" />

          {/* Double-Bezel Warm Cream Physical Stationery Card */}
          <div className="intro-card-shell">
            <div className="intro-card-surface">
              {/* Top-Center Live Beating Burgundy Heart Medallion */}
              <div className="intro-heart-medallion" ref={sealRef} aria-hidden="true">
                <span className="intro-heart-ring intro-heart-ring--1" />
                <span className="intro-heart-ring intro-heart-ring--2" />
                <span className="intro-heart-disc">
                  <svg
                    viewBox="0 0 24 22"
                    className="intro-heart-svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 20.4C11.5 20.4 11.1 20.2 10.7 19.9C6.8 16.6 1.5 11.9 1.5 6.8C1.5 3.4 4.2 0.8 7.5 0.8C9.5 0.8 11.2 1.8 12 3.3C12.8 1.8 14.5 0.8 16.5 0.8C19.8 0.8 22.5 3.4 22.5 6.8C22.5 11.9 17.2 16.6 13.3 19.9C12.9 20.2 12.5 20.4 12 20.4Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </div>

              <h1 className="intro-card-names">
                <span>{couple.groomShortName}</span>
                <span className="intro-card-amp">&amp;</span>
                <span>{couple.brideShortName}</span>
              </h1>

              <div className="intro-card-divider" aria-hidden="true">
                <span />
                <svg viewBox="0 0 16 15" className="intro-mini-heart">
                  <path
                    d="M8 14C7.7 14 7.4 13.9 7.2 13.7C4.7 11.5 1 8.4 1 5C1 2.7 2.8 1 5 1C6.3 1 7.4 1.7 8 2.7C8.6 1.7 9.7 1 11 1C13.2 1 15 2.7 15 5C15 8.4 11.3 11.5 8.8 13.7C8.6 13.9 8.3 14 8 14Z"
                    fill="currentColor"
                  />
                </svg>
                <span />
              </div>

              <p className="intro-card-date">{hero.introCardDate}</p>
              <p className="intro-card-sub">{hero.introCordiallyLabel}</p>

              <button
                id="openInvitationBtn"
                className="intro-open-pill"
                type="button"
                onClick={handleOpenGesture}
                disabled={stage !== 'idle'}
                aria-busy={!assetsReady && stage === 'idle'}
              >
                <span className="intro-open-pill__sheen" aria-hidden="true" />
                <span className="intro-open-pill__text">{hero.openButtonLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
