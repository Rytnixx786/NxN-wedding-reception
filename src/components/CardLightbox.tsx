import { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { InvitationCardArt } from './InvitationCardArt';

interface CardLightboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardLightbox({ isOpen, onClose }: CardLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

        <div className="card-lightbox-slot">
          <InvitationCardArt variant="lightbox" />
        </div>

        <div className="lightbox-footer-actions">
          <button
            type="button"
            className="lightbox-print-btn"
            onClick={() => window.print()}
          >
            <Printer size={15} aria-hidden="true" />
            Print / Save Card
          </button>
        </div>
      </div>
    </div>
  );
}
