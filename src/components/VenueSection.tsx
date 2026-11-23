import { useState } from 'react';
import { Check, Copy, ExternalLink, Send } from 'lucide-react';
import { weddingConfig } from '../config/wedding';

interface VenueSectionProps {
  onNotify?: (msg: string) => void;
}

export function VenueSection({ onNotify }: VenueSectionProps) {
  const { venue, assets } = weddingConfig;
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    const text = venue.fullAddress;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      onNotify?.('Venue address copied');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      onNotify?.('Could not copy automatically — please tap Open in Maps');
    }
  };

  return (
    <section className="venue-section" aria-labelledby="venueHeading">
      <div className="venue-palace-watermark" aria-hidden="true">
        <img src={assets.palaceBackdrop} alt="" className="venue-palace-img" />
      </div>

      <h2 id="venueHeading" className="venue-title gsap-venue-item">
        {venue.sectionTitle}
      </h2>

      <address className="venue-address gsap-venue-item">
        {venue.addressLines.map((line, idx) => (
          <span key={line}>
            {line}
            {idx < venue.addressLines.length - 1 && <br />}
          </span>
        ))}
      </address>

      <div className="map-bezel-outer gsap-venue-item">
        <div className="map-frame-wrap">
          <iframe
            className="venue-map-iframe"
            title={`${venue.hallName} Location Map`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={venue.mapEmbedUrl}
            allowFullScreen
          />
        </div>
      </div>

      <div className="venue-actions gsap-venue-item">
        <a
          href={venue.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="directions-link"
          id="getDirectionsLink"
        >
          <Send size={15} aria-hidden="true" />
          <span>Get directions</span>
        </a>
        <span className="venue-actions-dot" aria-hidden="true">·</span>
        <a
          href={venue.mapsShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="directions-link"
          id="openInMapsLink"
        >
          <ExternalLink size={14} aria-hidden="true" />
          <span>Open in Maps</span>
        </a>
        <span className="venue-actions-dot" aria-hidden="true">·</span>
        <button
          type="button"
          className={`directions-link directions-link--btn${copied ? ' is-copied' : ''}`}
          id="copyAddressBtn"
          onClick={handleCopyAddress}
        >
          {copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          <span>{copied ? 'Copied' : 'Copy address'}</span>
        </button>
      </div>
    </section>
  );
}
