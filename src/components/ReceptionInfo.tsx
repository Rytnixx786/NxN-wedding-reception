import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { weddingConfig } from '../config/wedding';
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  downloadIcsFile,
} from '../utils/calendar';
import type { RsvpSubmission } from '../services/rsvpService';
import { useCountdown } from '../hooks/useCountdown';

interface ReceptionInfoProps {
  savedRsvp: RsvpSubmission | null;
  onOpenRsvp: () => void;
  onNotify: (msg: string) => void;
  onUserInteract?: () => void;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function ReceptionInfo({
  savedRsvp,
  onOpenRsvp,
  onNotify,
  onUserInteract,
}: ReceptionInfoProps) {
  const { reception, rsvp, assets } = weddingConfig;
  const countdown = useCountdown(reception.dateIsoStart);
  const [calMenuOpen, setCalMenuOpen] = useState(false);
  const popoverWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!calMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverWrapRef.current &&
        !popoverWrapRef.current.contains(e.target as Node)
      ) {
        setCalMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCalMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [calMenuOpen]);

  // Dynamically generate month grid (Monday-first) from config
  const calendarCells = useMemo(() => {
    const firstDay = new Date(
      reception.calendarYear,
      reception.calendarMonthIndex,
      1
    );
    const daysInMonth = new Date(
      reception.calendarYear,
      reception.calendarMonthIndex + 1,
      0
    ).getDate();
    const leadingBlanks = (firstDay.getDay() + 6) % 7;
    const cells: Array<number | null> = Array.from(
      { length: leadingBlanks },
      () => null
    );
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [reception.calendarYear, reception.calendarMonthIndex]);

  const monthHeading = useMemo(() => {
    const date = new Date(
      reception.calendarYear,
      reception.calendarMonthIndex,
      1
    );
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    return `${monthName} ${reception.calendarYear}`;
  }, [reception.calendarYear, reception.calendarMonthIndex]);

  const googleCalUrl = useMemo(() => buildGoogleCalendarUrl(), []);
  const outlookCalUrl = useMemo(() => buildOutlookCalendarUrl(), []);

  const toggleCalendarPopover = () => {
    onUserInteract?.();
    setCalMenuOpen((v) => !v);
  };

  const handleDownloadIcs = () => {
    downloadIcsFile();
    setCalMenuOpen(false);
    onNotify('Calendar invite downloaded (.ics)');
  };

  return (
    <section className="card-section" aria-labelledby="receptionHeading">
      <div className="burgundy-card reception-card reveal-item">
        <img
          src={assets.floralBouquet}
          alt=""
          className="card-floral card-floral-left"
          aria-hidden="true"
        />

        <h2
          id="receptionHeading"
          className="card-title stagger-child"
          style={{ '--i': 0 } as CSSProperties}
        >
          {reception.sectionTitle}
        </h2>

        <p
          className="reception-subtitle stagger-child"
          style={{ '--i': 1 } as CSSProperties}
        >
          {reception.subtitle}
        </p>

        <div
          className="event-datetime stagger-child"
          style={{ '--i': 2 } as CSSProperties}
        >
          <div className="datetime-row-top">
            <span className="dt-meta dt-left">{reception.displayTime}</span>
            <span className="dt-meta dt-right">{reception.displayWeekday}</span>
          </div>
          <div className="datetime-row-main">
            <span className="dt-day-big">{reception.displayDay}</span>
            <span className="dt-divider stagger-divider" aria-hidden="true" />
            <div className="dt-month-year">
              <span className="dt-month">{reception.displayMonth}</span>
              <span className="dt-year">{reception.displayYear}</span>
            </div>
          </div>
        </div>

        <div
          className="countdown-block stagger-child"
          style={{ '--i': 3 } as CSSProperties}
        >
          <p className="countdown-label">Countdown</p>
          <p className="countdown-value" id="countdownTimer" aria-live="polite">
            {countdown.inlineText}
          </p>
        </div>

        {/* January 2027 Calendar Card */}
        <div
          className="calendar-widget stagger-child"
          style={{ '--i': 4 } as CSSProperties}
          aria-label={`${monthHeading} calendar highlighting ${reception.displayWeekday} ${reception.displayDay}`}
        >
          <p className="calendar-month-script">{monthHeading}</p>
          <div className="calendar-weekdays" aria-hidden="true">
            {WEEKDAYS.map((wd) => (
              <span key={wd}>{wd}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <span key={`empty-${idx}`} className="cal-empty" />;
              }
              if (day === reception.calendarHighlightDay) {
                return (
                  <button
                    key={day}
                    type="button"
                    className="cal-special"
                    onClick={toggleCalendarPopover}
                    title={`Wedding Reception: ${monthHeading.split(' ')[0]} ${day}, ${reception.calendarYear} at ${reception.displayTime}`}
                    aria-label={`${monthHeading.split(' ')[0]} ${day}, Wedding Reception Date — tap to add to calendar`}
                  >
                    <svg viewBox="0 0 36 34" className="cal-heart-svg" aria-hidden="true">
                      <path
                        d="M18 31.6C17.4 31.6 16.8 31.4 16.3 31C11.4 26.8 2 19.6 2 11.2C2 5.6 6.3 1.4 11.6 1.4C14.6 1.4 17 2.9 18 4.8C19 2.9 21.4 1.4 24.4 1.4C29.7 1.4 34 5.6 34 11.2C34 19.6 24.6 26.8 19.7 31C19.2 31.4 18.6 31.6 18 31.6Z"
                        fill="#4E1217"
                      />
                    </svg>
                    <strong>{day}</strong>
                  </button>
                );
              }
              return <span key={day}>{day}</span>;
            })}
          </div>
        </div>

        {/* Add to Calendar Popover */}
        <div
          className="calendar-action-wrap stagger-child"
          style={{ '--i': 5 } as CSSProperties}
          ref={popoverWrapRef}
        >
          <button
            type="button"
            className="add-calendar-link"
            id="addToCalendarBtn"
            aria-expanded={calMenuOpen}
            aria-controls="calendarPopover"
            onClick={toggleCalendarPopover}
          >
            Add to Calendar
          </button>

          {calMenuOpen && (
            <div className="calendar-popover" id="calendarPopover" role="menu">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cal-option"
                role="menuitem"
                onClick={() => setCalMenuOpen(false)}
              >
                <Calendar size={15} aria-hidden="true" />
                <span>Google Calendar</span>
              </a>
              <button
                type="button"
                id="downloadIcsBtn"
                className="cal-option"
                role="menuitem"
                onClick={handleDownloadIcs}
              >
                <Download size={15} aria-hidden="true" />
                <span>Apple / Outlook (.ics)</span>
              </button>
              <a
                href={outlookCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cal-option"
                role="menuitem"
                onClick={() => setCalMenuOpen(false)}
              >
                <ExternalLink size={15} aria-hidden="true" />
                <span>Outlook Web</span>
              </a>
            </div>
          )}
        </div>

        {/* Confirm Attendance CTA */}
        <button
          type="button"
          className={`confirm-btn stagger-child${savedRsvp ? ' is-confirmed' : ''}`}
          style={{ '--i': 6 } as CSSProperties}
          id="openRsvpBtn"
          onClick={() => {
            onUserInteract?.();
            onOpenRsvp();
          }}
        >
          {savedRsvp
            ? savedRsvp.attendance === 'attending'
              ? 'ATTENDANCE CONFIRMED ✓'
              : 'RESPONSE SAVED · EDIT'
            : rsvp.buttonLabel}
        </button>

        {savedRsvp && (
          <p className="rsvp-status-note">
            {savedRsvp.attendance === 'attending'
              ? `Registered for ${savedRsvp.name} (${savedRsvp.guests} ${savedRsvp.guests === '1' ? 'guest' : 'guests'}) — tap to view or edit`
              : `Response saved for ${savedRsvp.name} — tap to update`}
          </p>
        )}
      </div>
    </section>
  );
}
