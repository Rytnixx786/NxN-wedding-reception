import { FormEvent, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Gift, X } from 'lucide-react';
import { weddingConfig } from '../config/wedding';
import {
  addGuestbookEntry,
  fetchGuestbookEntries,
  GuestbookEntry,
  isGuestbookBackendConfigured,
} from '../services/guestbookService';

/**
 * Optional modular sections from the ChungDoi Minimalism Dark Red template.
 * Each section renders ONLY when enabled in `src/config/wedding.ts -> features`.
 * Disabled by default so the default site matches the user's recorded video 1:1.
 */
export function OptionalSections() {
  const { features, optionalSections } = weddingConfig;

  return (
    <>
      {features.photoGallery && optionalSections.gallery.photos.length > 0 && (
        <PhotoGallerySection />
      )}
      {features.dressCode && <DressCodeSection />}
      {features.weddingSchedule && optionalSections.schedule.items.length > 0 && (
        <ScheduleSection />
      )}
      {features.guestbook && <GuestbookSection />}
      {features.giftBox && <GiftBoxSection />}
    </>
  );
}

function PhotoGallerySection() {
  const { gallery } = weddingConfig.optionalSections;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const count = gallery.photos.length;
  const goPrev = () =>
    setActiveIndex((idx) => (idx === null ? null : (idx - 1 + count) % count));
  const goNext = () =>
    setActiveIndex((idx) => (idx === null ? null : (idx + 1) % count));

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, count]);

  return (
    <section className="card-section" aria-labelledby="galleryHeading">
      <div className="burgundy-card reveal-item">
        <h2 id="galleryHeading" className="card-title">
          {gallery.title}
        </h2>
        <div className="opt-gallery-grid">
          {gallery.photos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              className="opt-gallery-thumb"
              onClick={() => setActiveIndex(idx)}
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveIndex(null);
          }}
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (dx > 40) goPrev();
            if (dx < -40) goNext();
            setTouchStartX(null);
          }}
        >
          <div className="opt-lightbox">
            <button
              type="button"
              className="modal-close card-lightbox-close"
              onClick={() => setActiveIndex(null)}
              aria-label="Close photo"
            >
              <X size={18} />
            </button>
            <button
              type="button"
              className="opt-lightbox-nav prev"
              onClick={goPrev}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <img
              src={gallery.photos[activeIndex].src}
              alt={gallery.photos[activeIndex].alt}
              className="opt-lightbox-img"
            />
            <button
              type="button"
              className="opt-lightbox-nav next"
              onClick={goNext}
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function DressCodeSection() {
  const { dressCode } = weddingConfig.optionalSections;
  return (
    <section className="card-section" aria-labelledby="dressCodeHeading">
      <div className="burgundy-card reveal-item">
        <h2 id="dressCodeHeading" className="card-title">
          {dressCode.title}
        </h2>
        <p className="announce-line" style={{ marginBottom: 24 }}>
          {dressCode.description}
        </p>
        <div className="opt-palette-row">
          {dressCode.palette.map((swatch) => (
            <div key={swatch.name} className="opt-swatch">
              <span
                className="opt-swatch-dot"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="opt-swatch-label">{swatch.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScheduleSection() {
  const { schedule } = weddingConfig.optionalSections;
  return (
    <section className="card-section" aria-labelledby="scheduleHeading">
      <div className="burgundy-card reveal-item">
        <h2 id="scheduleHeading" className="card-title">
          {schedule.title}
        </h2>
        <ol className="opt-timeline">
          {schedule.items.map((item) => (
            <li key={`${item.time}-${item.title}`} className="opt-timeline-item">
              <span className="opt-timeline-time">{item.time}</span>
              <div>
                <p className="opt-timeline-title">{item.title}</p>
                <p className="opt-timeline-desc">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function GuestbookSection() {
  const { guestbook } = weddingConfig.optionalSections;
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestMsg, setGuestMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const backendReady = isGuestbookBackendConfigured();

  useEffect(() => {
    fetchGuestbookEntries().then((res) => setEntries(res.entries));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMsg.trim()) {
      setError('Please enter both your name and your wish.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const { entry } = await addGuestbookEntry(guestName.trim(), guestMsg.trim());
      setEntries((prev) => [entry, ...prev]);
      setGuestName('');
      setGuestMsg('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post wish.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card-section" aria-labelledby="guestbookHeading">
      <div className="burgundy-card reveal-item">
        <h2 id="guestbookHeading" className="card-title">
          {guestbook.title}
        </h2>
        <p className="reception-subtitle">{guestbook.subtitle}</p>
        <form className="opt-guestbook-form" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your Name"
            aria-label="Your Name"
          />
          <textarea
            rows={3}
            value={guestMsg}
            onChange={(e) => setGuestMsg(e.target.value)}
            placeholder="Write a warm wish..."
            aria-label="Your Wish"
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="confirm-btn" disabled={saving}>
            {saving ? 'POSTING...' : 'SEND WISH'}
          </button>
          {!backendReady && (
            <p className="rsvp-status-note">
              Local preview mode — configure Supabase in .env for shared wishes.
            </p>
          )}
        </form>

        {entries.length > 0 && (
          <ul className="opt-wishes-list">
            {entries.map((entry) => (
              <li key={entry.id} className="opt-wish-card">
                <p className="opt-wish-name">{entry.name}</p>
                <p className="opt-wish-msg">{entry.message}</p>
                <time className="opt-wish-date">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function GiftBoxSection() {
  const { giftBox } = weddingConfig.optionalSections;
  const [open, setOpen] = useState(false);

  return (
    <section className="card-section" aria-labelledby="giftHeading">
      <div className="burgundy-card reveal-item">
        <h2 id="giftHeading" className="card-title">
          {giftBox.title}
        </h2>
        <p className="reception-subtitle">{giftBox.message}</p>
        <button
          type="button"
          className="confirm-btn"
          onClick={() => setOpen(true)}
        >
          <Gift size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {giftBox.buttonLabel}
        </button>
      </div>

      {open && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="giftModalTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal-sheet rsvp-sheet">
            <button
              type="button"
              className="modal-close"
              onClick={() => setOpen(false)}
              aria-label="Close gift modal"
            >
              <X size={18} />
            </button>
            <h3 id="giftModalTitle" className="modal-title">
              {giftBox.title}
            </h3>
            <p className="modal-desc">{giftBox.message}</p>
            {giftBox.accounts.length === 0 ? (
              <p className="modal-desc">
                Add your personal bank or mobile-wallet gift details inside{' '}
                <code>src/config/wedding.ts</code>.
              </p>
            ) : (
              giftBox.accounts.map((acc) => (
                <div key={acc.accountNumber} className="success-details-box">
                  <div>
                    <strong>{acc.label}</strong> ({acc.bankOrProvider})
                  </div>
                  <div>{acc.accountName}</div>
                  <div>{acc.accountNumber}</div>
                  {acc.qrImage && (
                    <div style={{ marginTop: 10, textAlign: 'center' }}>
                      <img
                        src={acc.qrImage}
                        alt={`${acc.label} QR code`}
                        style={{ maxWidth: 180, margin: '0 auto 8px' }}
                      />
                      <a
                        href={acc.qrImage}
                        download={`${acc.label.replace(/\s+/g, '-')}-QR.png`}
                        className="directions-link"
                      >
                        <Download size={14} /> Save QR Code
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
