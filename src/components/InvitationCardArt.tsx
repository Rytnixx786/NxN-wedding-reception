import { weddingConfig } from '../config/wedding';

interface InvitationCardArtProps {
  variant?: 'envelope' | 'lightbox';
}

export function InvitationCardArt({ variant = 'envelope' }: InvitationCardArtProps) {
  const { couple, assets } = weddingConfig;

  return (
    <article
      className={`physical-card physical-card--${variant}`}
      aria-label={`Wedding Reception Invitation Card for ${couple.groomFullName} and ${couple.brideFullName}`}
    >
      <div className="real-card-surface">
        <img
          src={assets.receptionCard}
          alt={`Wedding Reception Invitation — ${couple.groomFullName} with ${couple.brideFullName}, Tuesday January 19, 2027 at 7:00 PM, Anchor Hall, RAOWA Convention Hall, Mohakhali, Dhaka-1203`}
          className="real-card-img"
          decoding="async"
        />
        <div className="card-specular-sheen" aria-hidden="true" />
        <div className="card-foil-edge" aria-hidden="true" />
      </div>
    </article>
  );
}
