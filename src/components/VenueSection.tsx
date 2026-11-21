import { ExternalLink, Send } from 'lucide-react';
import { weddingConfig } from '../config/wedding';

export function VenueSection() {
  const { venue, assets } = weddingConfig;

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
            loading="eager"
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
      </div>
    </section>
  );
}
