import { weddingConfig } from '../config/wedding';

interface InvitationCardArtProps {
  variant?: 'envelope' | 'lightbox';
}

export function InvitationCardArt({ variant = 'envelope' }: InvitationCardArtProps) {
  const { couple, invitationCard, reception, venue } = weddingConfig;
  const glowId = variant === 'lightbox' ? 'lanternGlowModal' : 'lanternGlowEnv';

  return (
    <article
      className={`physical-card physical-card--${variant}`}
      aria-label="Wedding Invitation Card"
    >
      <div className="card-inner-frame">
        {variant === 'envelope' && (
          <div className="card-specular-sheen" aria-hidden="true" />
        )}
        {/* Top-left cream watercolor floral corner */}
        <svg className="card-corner-floral" viewBox="0 0 110 110" fill="none" aria-hidden="true">
          <g opacity="0.88">
            <path d="M12 72 C22 50, 32 34, 62 16" stroke="#8A7E5E" strokeWidth="1.3" fill="none" />
            <ellipse cx="22" cy="54" rx="11" ry="5" transform="rotate(-38 22 54)" fill="#A29D78" opacity="0.65" />
            <ellipse cx="44" cy="24" rx="11" ry="4.8" transform="rotate(-22 44 24)" fill="#8E8B67" opacity="0.7" />
            <ellipse cx="17" cy="70" rx="9" ry="4" transform="rotate(-62 17 70)" fill="#B5AE88" opacity="0.6" />
            <ellipse cx="58" cy="18" rx="9" ry="4" transform="rotate(8 58 18)" fill="#A69F7C" opacity="0.55" />
            <circle cx="30" cy="28" r="16" fill="#F6ECD8" />
            <circle cx="30" cy="28" r="12" fill="#EEDCB9" />
            <circle cx="30" cy="28" r="8" fill="#F9F1E2" />
            <circle cx="30" cy="28" r="4.5" fill="#DFC394" />
            <path d="M25 27 C27 23, 33 23, 35 28 C33 32, 27 32, 26 28" stroke="#C5A36E" strokeWidth="0.9" fill="none" />
            <circle cx="16" cy="43" r="8.5" fill="#F3E5CA" />
            <circle cx="16" cy="43" r="5" fill="#E5CEAA" />
            <circle cx="48" cy="14" r="6.5" fill="#F4E7CF" />
            <circle cx="28" cy="49" r="1.8" fill="#C9A25B" />
            <circle cx="33" cy="45" r="1.5" fill="#C9A25B" />
            <circle cx="52" cy="29" r="1.6" fill="#C9A25B" />
          </g>
        </svg>

        {/* Top-right hanging golden Islamic lanterns */}
        <svg className="card-corner-lanterns" viewBox="0 0 72 108" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF2B8" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#E8B85C" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#E8B85C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <line x1="22" y1="0" x2="22" y2="18" stroke="#B68B3C" strokeWidth="1.2" />
          <circle cx="22" cy="36" r="18" fill={`url(#${glowId})`} />
          <path d="M16 24 L22 18 L28 24 Z" fill="#C79743" stroke="#9C7228" strokeWidth="0.8" />
          <rect x="15" y="24" width="14" height="21" rx="2" fill="#FFF1BD" stroke="#B68B3C" strokeWidth="1.1" />
          <path d="M18 24 V45 M22 24 V45 M26 24 V45" stroke="#C79743" strokeWidth="0.7" opacity="0.75" />
          <path d="M16 45 L22 50 L28 45 Z" fill="#C79743" />
          <circle cx="22" cy="52" r="1.5" fill="#B68B3C" />

          <line x1="48" y1="0" x2="48" y2="38" stroke="#B68B3C" strokeWidth="1.2" />
          <circle cx="48" cy="58" r="21" fill={`url(#${glowId})`} />
          <path d="M40 44 L48 37 L56 44 Z" fill="#C79743" stroke="#9C7228" strokeWidth="0.8" />
          <rect x="39" y="44" width="18" height="25" rx="2.5" fill="#FFF1BD" stroke="#B68B3C" strokeWidth="1.2" />
          <path d="M43 44 V69 M48 44 V69 M53 44 V69" stroke="#C79743" strokeWidth="0.75" opacity="0.75" />
          <path d="M40 69 L48 75 L56 69 Z" fill="#C79743" />
          <circle cx="48" cy="77.5" r="1.8" fill="#B68B3C" />
        </svg>

        <div className="card-copy">
          <p className="card-bismillah" lang="ar" dir="rtl">
            {invitationCard.bismillahArabic}
          </p>
          <div className="card-mini-ornament" aria-hidden="true">
            <span />
            <i>♦</i>
            <span />
          </div>
          <p className="card-quote">
            {invitationCard.bismillahTranslation[0]}
            <br />
            {invitationCard.bismillahTranslation[1]}
          </p>
          <p className="card-host">
            {invitationCard.hostLines.map((line, idx) => (
              <span key={line}>
                {line}
                {idx < invitationCard.hostLines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <p className="card-script-name">{couple.groomFullName}</p>
          <p className="card-with">
            <span>With</span>
          </p>
          <p className="card-script-name">{couple.brideFullName}</p>
          <p className="card-daughter">
            Daughter of
            <br />
            {invitationCard.brideDaughterOf}
          </p>
          <div className="card-flourish" aria-hidden="true">
            <span />
            <i>✦</i>
            <span />
          </div>
          <div className="card-date-block">
            <span className="card-month">January</span>
            <div className="card-day-line">
              <span>Tuesday</span>
              <span className="card-pipe">|</span>
              <strong className="card-day-num">
                {reception.displayDay}
                <sup>{reception.displayDayOrdinal}</sup>
              </strong>
              <span className="card-pipe">|</span>
              <span>{reception.displayYear}</span>
            </div>
            <span className="card-time">{reception.displayTime12h}</span>
          </div>
          <div className="card-flourish" aria-hidden="true">
            <span />
            <i>✦</i>
            <span />
          </div>
          <div className="card-venue-block">
            <span className="card-venue-label">Venue:</span>
            <strong>{venue.addressLines[0]}</strong>
            <span>{venue.addressLines[1]}</span>
            <span>{venue.addressLines[2]}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
