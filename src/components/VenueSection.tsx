import { ExternalLink, Send } from 'lucide-react';
import { weddingConfig } from '../config/wedding';

export function VenueSection() {
  const { venue, assets } = weddingConfig;

  return (
    <section className="venue-section reveal-item" aria-labelledby="venueHeading">
      <div className="venue-palace-watermark" aria-hidden="true">
        <img src={assets.palaceBackdrop} alt="" className="venue-palace-img" />
      </div>

      <h2 id="venueHeading" className="venue-title">
        {venue.sectionTitle}
      </h2>

      <address className="venue-address">
        {venue.addressLines.map((line, idx) => (
          <span key={line}>
            {line}
            {idx < venue.addressLines.length - 1 && <br />}
          </span>
        ))}
      </address>

      <div className="map-frame-wrap">
        <a
          href={venue.mapsShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="open-maps-pill"
          id="openInMapsLink"
        >
          <span>Open in Maps</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>

        <iframe
          className="venue-map-iframe"
          title={`${venue.hallName} Location Map`}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          src={venue.mapEmbedUrl}
          allowFullScreen
        />
      </div>

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
    </section>
  );
}
