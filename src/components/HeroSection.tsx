import { weddingConfig } from '../config/wedding';
import { InvitationCardArt } from './InvitationCardArt';
import { LivingBouquet } from './LivingBouquet';

interface HeroSectionProps {
  heroRevealed: boolean;
  skipEntrance: boolean;
  onOpenCardLightbox: () => void;
}

export function HeroSection({
  heroRevealed,
  skipEntrance,
  onOpenCardLightbox,
}: HeroSectionProps) {
  const { hero, couple, assets } = weddingConfig;

  const heroClass = [
    'hero-section',
    heroRevealed ? 'is-hero-revealed' : '',
    skipEntrance ? 'is-hero-instant' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={heroClass}>
      <div className="palace-backdrop" aria-hidden="true">
        <img
          src={assets.palaceBackdrop}
          alt=""
          className="palace-img"
          data-gsap="hero-palace"
        />
      </div>

      <div className="hero-crown" data-gsap="hero-save">
        <p className="hero-bismillah" lang="ar" dir="rtl">
          {hero.bismillahArabic}
        </p>
        <div className="hero-crown-sub">
          <span className="hero-crown-line" aria-hidden="true" />
          <p className="save-the-date">{hero.saveTheDateLabel}</p>
          <span className="hero-crown-line" aria-hidden="true" />
        </div>
      </div>

      {/* Unified 3D Perspective Stationery Stage:
          Envelope, Living 3D Bouquet, Real Reception Card & Wax Seal share ONE
          preserve-3d rig & coordinated GSAP + scroll/pointer timeline */}
      <div className="envelope-stage" data-gsap="hero-envelope">
        <button
          type="button"
          className="envelope-interactive"
          id="openCardModalBtn"
          onClick={onOpenCardLightbox}
          aria-label="Tap to view the full wedding invitation card up close"
          title="Tap to inspect the invitation card"
        >
          <div className="envelope-3d-rig">
            {/* Depth Layer 0 (Z = -18px): Grounded burgundy ambient contact shadow */}
            <div className="env-3d-shadow" aria-hidden="true" />

            {/* Depth Layer 1 (Z = 0px): Open top flap & velvet envelope back */}
            <div className="env-back-flap" aria-hidden="true">
              <div className="env-flap-lace" />
            </div>
            <div className="env-body-back" aria-hidden="true" />

            {/* Coordinated Bouquet + Card Insert Group (moves together in unison!) */}
            <div className="env-insert-group" data-gsap="hero-insert">
              {/* Depth Layer 2 (Z = 14px): Physical Islamic Wedding Card */}
              <InvitationCardArt variant="envelope" />

              {/* Depth Layer 3 (Z = 26px): Living 3D Burgundy & Ivory Floral Bouquet */}
              <LivingBouquet variant="envelope" />
            </div>

            {/* Depth Layer 4 (Z = 36px): Velvet burgundy V-fold front pocket */}
            <div className="env-front-pocket" aria-hidden="true">
              <svg
                viewBox="0 0 360 225"
                preserveAspectRatio="none"
                className="env-pocket-svg"
              >
                <defs>
                  <linearGradient id="envLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5E161E" />
                    <stop offset="100%" stopColor="#450D14" />
                  </linearGradient>
                  <linearGradient id="envRight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#55121A" />
                    <stop offset="100%" stopColor="#3E0B11" />
                  </linearGradient>
                  <linearGradient id="envBottom" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#5B151D" />
                    <stop offset="100%" stopColor="#430C12" />
                  </linearGradient>
                </defs>
                <polygon points="0,0 180,126 0,225" fill="url(#envLeft)" />
                <polygon points="360,0 180,126 360,225" fill="url(#envRight)" />
                <polygon
                  points="0,225 142,102 218,102 360,225"
                  fill="url(#envBottom)"
                />
                <polyline
                  points="0,225 142,102 218,102 360,225"
                  fill="none"
                  stroke="rgba(255,220,210,0.16)"
                  strokeWidth="1.2"
                />
                <line
                  x1="0"
                  y1="0"
                  x2="142"
                  y2="102"
                  stroke="rgba(255,220,210,0.14)"
                  strokeWidth="1.1"
                />
                <line
                  x1="360"
                  y1="0"
                  x2="218"
                  y2="102"
                  stroke="rgba(255,220,210,0.12)"
                  strokeWidth="1.1"
                />
              </svg>
            </div>

            {/* Depth Layer 5 (Z = 48px): Embossed Antique-Gold Heart Wax Seal */}
            <div className="env-wax-seal-wrap" data-gsap="hero-seal">
              <img
                src={assets.waxSeal}
                alt="Embossed gold heart wax seal"
                className="env-wax-seal"
              />
              <span className="env-wax-sheen" aria-hidden="true" />
            </div>
          </div>

          <span className="card-tap-badge">{hero.tapCardHint}</span>
        </button>
      </div>

      {/* Couple Monogram with staggered editorial reveal */}
      <div className="couple-monogram">
        <span className="monogram-amp" data-gsap="hero-amp" aria-hidden="true">
          &amp;
        </span>
        <h1 className="monogram-names">
          <span className="monogram-first" data-gsap="hero-name-first">
            {couple.groomShortName}
          </span>
          <span className="monogram-second" data-gsap="hero-name-second">
            {couple.brideShortName}
          </span>
        </h1>
      </div>
    </header>
  );
}
