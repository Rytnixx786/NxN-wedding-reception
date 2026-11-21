import { weddingConfig } from '../config/wedding';
import { useCountdown } from '../hooks/useCountdown';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function Footer() {
  const { footer, reception } = weddingConfig;
  const countdown = useCountdown(reception.dateIsoStart);

  return (
    <footer className="invitation-footer reveal-item">
      {/* Closing Countdown Finale */}
      <div
        className="closing-countdown"
        id="closingCountdown"
        aria-label="Live Wedding Countdown"
      >
        <div className="closing-countdown-ornament" aria-hidden="true">
          <span />
          <i>✦</i>
          <span />
        </div>
        <p className="closing-countdown-kicker">COUNTING DOWN TO OUR CELEBRATION</p>

        {countdown.isPast ? (
          <p className="closing-countdown-arrived">{countdown.inlineText}</p>
        ) : (
          <div className="closing-countdown-grid" role="timer" aria-live="polite">
            <div className="closing-unit">
              <span className="closing-num">{pad2(countdown.days)}</span>
              <span className="closing-label">
                {countdown.days === 1 ? 'DAY' : 'DAYS'}
              </span>
            </div>
            <span className="closing-sep" aria-hidden="true">:</span>
            <div className="closing-unit">
              <span className="closing-num">{pad2(countdown.hours)}</span>
              <span className="closing-label">
                {countdown.hours === 1 ? 'HOUR' : 'HOURS'}
              </span>
            </div>
            <span className="closing-sep" aria-hidden="true">:</span>
            <div className="closing-unit">
              <span className="closing-num">{pad2(countdown.minutes)}</span>
              <span className="closing-label">MIN</span>
            </div>
            <span className="closing-sep" aria-hidden="true">:</span>
            <div className="closing-unit">
              <span
                key={countdown.seconds}
                className="closing-num closing-num--tick"
              >
                {pad2(countdown.seconds)}
              </span>
              <span className="closing-label">SEC</span>
            </div>
          </div>
        )}
      </div>

      <p className="footer-blessing">{footer.blessingMessage}</p>
      <div className="footer-monogram">{footer.monogramLine}</div>
    </footer>
  );
}
