import { FormEvent, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { weddingConfig } from '../config/wedding';
import {
  AttendanceStatus,
  isSupabaseConfigured,
  RsvpSubmission,
  submitRsvp,
} from '../services/rsvpService';

interface RsvpModalProps {
  isOpen: boolean;
  savedRsvp: RsvpSubmission | null;
  onClose: () => void;
  onSaved: (record: RsvpSubmission, mode: 'supabase' | 'local-preview') => void;
}

export function RsvpModal({
  isOpen,
  savedRsvp,
  onClose,
  onSaved,
}: RsvpModalProps) {
  const { couple, rsvp } = weddingConfig;
  const backendReady = isSupabaseConfigured();

  const [view, setView] = useState<'form' | 'receipt'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('2');
  const [attendance, setAttendance] = useState<AttendanceStatus>('attending');
  const [side, setSide] = useState(rsvp.guestSides[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMode, setLastMode] = useState<'supabase' | 'local-preview'>(
    backendReady ? 'supabase' : 'local-preview'
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (savedRsvp) {
      setName(savedRsvp.name);
      setPhone(savedRsvp.phone);
      setGuests(savedRsvp.guests);
      setAttendance(savedRsvp.attendance);
      setSide(savedRsvp.side);
      setMessage(savedRsvp.message);
      setView('receipt');
    } else {
      setView('form');
    }
  }, [isOpen, savedRsvp]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your full name to confirm attendance.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await submitRsvp({
        name: trimmedName,
        phone: phone.trim(),
        guests,
        attendance,
        side,
        message: message.trim(),
      });
      setLastMode(result.mode);
      onSaved(result.record, result.mode);
      setView('receipt');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit RSVP right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      id="rsvpModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvpModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet rsvp-sheet">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close RSVP dialog"
        >
          <X size={18} />
        </button>

        {view === 'form' ? (
          <div>
            <p className="modal-kicker">
              {couple.groomShortName.toUpperCase()} &amp;{' '}
              {couple.brideShortName.toUpperCase()} · JANUARY 19, 2027
            </p>
            <h3 id="rsvpModalTitle" className="modal-title">
              {rsvp.modalTitle}
            </h3>
            <p className="modal-desc">
              {rsvp.modalDescription}{' '}
              <span className="modal-rsvp-phone">
                Direct RSVP:{' '}
                <a href={`tel:${rsvp.contactPhone.replace(/[^0-9+]/g, '')}`}>
                  {rsvp.contactPhone}
                </a>
              </span>
            </p>

            <form id="rsvpForm" className="rsvp-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="guestName">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Tanvir Ahmed"
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="guestPhone">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    id="guestPhone"
                    name="guestPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    autoComplete="tel"
                  />
                </div>

                {rsvp.allowGuestCount && (
                  <div className="form-field">
                    <label htmlFor="guestCount">Guests</label>
                    <select
                      id="guestCount"
                      name="guestCount"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5 Guests</option>
                      <option value="6+">6+ Guests</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-field">
                <span className="field-label-text">
                  Will you attend? <span className="req">*</span>
                </span>
                <div className="attendance-radios">
                  <label className="radio-pill">
                    <input
                      type="radio"
                      name="attendance"
                      value="attending"
                      checked={attendance === 'attending'}
                      onChange={() => setAttendance('attending')}
                    />
                    <span>Joyfully Accepts</span>
                  </label>
                  <label className="radio-pill">
                    <input
                      type="radio"
                      name="attendance"
                      value="declined"
                      checked={attendance === 'declined'}
                      onChange={() => setAttendance('declined')}
                    />
                    <span>Regretfully Declines</span>
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="guestSide">Guest Of</label>
                <select
                  id="guestSide"
                  name="guestSide"
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                >
                  {rsvp.guestSides.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {rsvp.allowDietaryOrMessage && (
                <div className="form-field">
                  <label htmlFor="guestMessage">
                    Dietary Notes or Wishes for {couple.groomShortName} &amp;{' '}
                    {couple.brideShortName}
                  </label>
                  <textarea
                    id="guestMessage"
                    name="guestMessage"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a warm dua, message, or dietary note..."
                  />
                </div>
              )}

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="rsvp-submit-btn"
                disabled={submitting}
              >
                {submitting ? 'SENDING...' : 'SEND CONFIRMATION'}
              </button>

              {!backendReady && (
                <p className="dev-storage-hint">
                  Local preview mode: saved on this browser. Configure Supabase in{' '}
                  <code>.env</code> to collect shared guest RSVPs online.
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="rsvp-success">
            <div className="success-heart-badge" aria-hidden="true">
              <Check size={26} strokeWidth={2.2} />
            </div>
            <h3 id="rsvpModalTitle" className="modal-title">
              THANK YOU!
            </h3>
            <p className="success-summary">
              {attendance === 'attending'
                ? `We are overjoyed to welcome you, ${name}! We cannot wait to celebrate this blessed evening with you.`
                : `Thank you for letting us know, ${name}. We will miss you and appreciate your warm prayers for ${couple.groomShortName} & ${couple.brideShortName}.`}
            </p>
            <div className="success-details-box">
              <div>
                <strong>Name:</strong> {name}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                {attendance === 'attending'
                  ? 'Joyfully Attending'
                  : 'Regretfully Unable to Attend'}
              </div>
              {attendance === 'attending' && (
                <div>
                  <strong>Party Size:</strong> {guests}{' '}
                  {guests === '1' ? 'Guest' : 'Guests'}
                </div>
              )}
              <div>
                <strong>Guest Of:</strong> {side}
              </div>
              {phone && (
                <div>
                  <strong>Phone:</strong> {phone}
                </div>
              )}
              {message && (
                <div>
                  <strong>Wishes:</strong> &ldquo;{message}&rdquo;
                </div>
              )}
            </div>

            {lastMode === 'local-preview' && !backendReady && (
              <p className="dev-storage-hint" style={{ marginBottom: 16 }}>
                Saved locally in this browser (development fallback). Connect
                Supabase via <code>.env</code> for live multi-guest storage.
              </p>
            )}

            <div className="success-actions">
              <button
                type="button"
                className="success-btn-primary"
                onClick={onClose}
              >
                RETURN TO INVITATION
              </button>
              <button
                type="button"
                className="success-btn-link"
                onClick={() => setView('form')}
              >
                Edit Response
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
