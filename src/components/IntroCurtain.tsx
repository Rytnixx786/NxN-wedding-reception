import { useCallback, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';
import { weddingConfig } from '../config/wedding';
import {
  LivingHeartsCanvas,
  LivingHeartsCanvasHandle,
} from './LivingHeartsCanvas';

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
  const { couple, hero, assets } = weddingConfig;
  const canvasHandleRef = useRef<LivingHeartsCanvasHandle | null>(null);
  const sealRef = useRef<HTMLSpanElement | null>(null);

  const handleOpenGesture = useCallback(() => {
    if (stage !== 'idle') return;
    const rect = sealRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    canvasHandleRef.current?.triggerBurst(cx, cy);
    onTriggerOpen();
  }, [stage, onTriggerOpen]);

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
      {/* Seamless Idle Velvet Backdrop — fades out smoothly as twin silk panels part */}
      <div className="curtain-seamless-bg" aria-hidden="true" />

      {/* Twin Royal Velvet Burgundy Silk Drapes (appear cleanly on unseal/part) */}
      <div className="curtain-panels" aria-hidden="true">
        <div className="curtain-panel curtain-panel--left" />
        <div className="curtain-panel curtain-panel--right" />
      </div>

      {/* Living 3D-Shaded Floating Hearts + Golden Stardust Canvas */}
      {!isDismissed && (
        <LivingHeartsCanvas ref={canvasHandleRef} active={!isDismissed} />
      )}

      {/* Centered Invitation Suite Cover */}
      <div className="intro-content">
        <div className="intro-editorial-frame">
          <div className="intro-ornament-top" aria-hidden="true">
            <span />
            <i>✦</i>
            <span />
          </div>

          <p className="intro-kicker">{hero.introKicker}</p>
          <h1 className="intro-names">
            <span>{couple.groomShortName}</span>
            <span className="intro-amp">&amp;</span>
            <span>{couple.brideShortName}</span>
          </h1>
          <p className="intro-date">{hero.introDateLine}</p>

          <button
            id="openInvitationBtn"
            className="intro-open-btn"
            type="button"
            onClick={handleOpenGesture}
            disabled={stage !== 'idle'}
            aria-busy={!assetsReady && stage === 'idle'}
          >
            <span className="intro-seal-wrap" ref={sealRef}>
              <img src={assets.waxSeal} alt="" className="intro-seal-img" />
              <span className="intro-seal-sheen" aria-hidden="true" />
            </span>
            <span className="intro-btn-label">{hero.openButtonLabel}</span>
            <span className="intro-music-hint">
              <Music size={13} aria-hidden="true" />
              {hero.musicHintLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
