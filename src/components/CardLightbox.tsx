import { useEffect, useRef } from 'react';
import { Download, Phone, Printer, X } from 'lucide-react';
import { weddingConfig } from '../config/wedding';
import { InvitationCardArt } from './InvitationCardArt';

interface CardLightboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardLightbox({ isOpen, onClose }: CardLightboxProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { assets, couple, rsvp } = weddingConfig;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Living 3D physical card inspection tilt + gold-foil specular sheen (zero React re-renders)
  useEffect(() => {
    if (!isOpen) return;
    const stage = stageRef.current;
    if (!stage) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let pointerInside = false;
    let rafId = 0;
    let lastNow = performance.now();
    let t = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointerInside = true;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetX = Math.max(-1, Math.min(1, nx));
      targetY = Math.max(-1, Math.min(1, ny));
    };

    const onPointerLeave = () => {
      pointerInside = false;
      targetX = 0;
      targetY = 0;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;
      t += dt;

      // Subtle living ambient float when pointer is resting or on mobile touch
      const idleX = pointerInside ? targetX : Math.sin(t * 0.85) * 0.28;
      const idleY = pointerInside ? targetY : Math.cos(t * 0.65) * 0.22;

      const damp = 1 - Math.exp(-6.0 * dt);
      curX += (idleX - curX) * damp;
      curY += (idleY - curY) * damp;

      const maxDeg = finePointer ? 7.5 : 4.2;
      const rotY = curX * maxDeg;
      const rotX = -curY * maxDeg;
      const sheen = 50 + curX * 36;

      stage.style.setProperty('--lb-rot-x', `${rotX.toFixed(2)}deg`);
      stage.style.setProperty('--lb-rot-y', `${rotY.toFixed(2)}deg`);
      stage.style.setProperty('--hero-sheen', `${sheen.toFixed(1)}%`);

      rafId = window.requestAnimationFrame(tick);
    };

    if (finePointer) {
      stage.addEventListener('pointermove', onPointerMove, { passive: true });
      stage.addEventListener('pointerleave', onPointerLeave);
    }
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (finePointer) {
        stage.removeEventListener('pointermove', onPointerMove);
        stage.removeEventListener('pointerleave', onPointerLeave);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrintCard = () => {
    document.documentElement.classList.add('is-printing-card');
    const cleanup = () => {
      document.documentElement.classList.remove('is-printing-card');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.setTimeout(() => {
      window.print();
      // Fallback cleanup for browsers that do not fire afterprint reliably
      window.setTimeout(cleanup, 1200);
    }, 30);
  };

  return (
    <div
      className="modal-backdrop"
      id="cardLightboxModal"
      role="dialog"
      aria-modal="true"
      aria-label="Full Wedding Invitation Card"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet card-lightbox-sheet">
        <button
          type="button"
          className="modal-close card-lightbox-close"
          onClick={onClose}
          aria-label="Close card preview"
        >
          <X size={18} />
        </button>

        <div className="card-lightbox-slot" ref={stageRef}>
          <div className="lightbox-3d-tilt">
            <InvitationCardArt variant="lightbox" />
          </div>
        </div>

        <div className="lightbox-footer-actions">
          <a
            href={assets.receptionCardDownload}
            download={`${couple.groomShortName}-and-${couple.brideShortName}-Reception-Card.jpg`}
            className="lightbox-print-btn"
          >
            <Download size={15} aria-hidden="true" />
            Save Card
          </a>
          <button
            type="button"
            className="lightbox-print-btn lightbox-print-btn--ghost"
            onClick={handlePrintCard}
          >
            <Printer size={15} aria-hidden="true" />
            Print
          </button>
          <a
            href={`tel:${rsvp.contactPhone.replace(/[^0-9+]/g, '')}`}
            className="lightbox-print-btn lightbox-print-btn--ghost"
          >
            <Phone size={15} aria-hidden="true" />
            RSVP {rsvp.contactPhone}
          </a>
        </div>
      </div>
    </div>
  );
}
