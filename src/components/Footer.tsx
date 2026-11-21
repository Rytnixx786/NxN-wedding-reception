import { weddingConfig } from '../config/wedding';

export function Footer() {
  const { footer } = weddingConfig;

  return (
    <footer className="invitation-footer">
      <div className="footer-ornament gsap-footer-item" aria-hidden="true">
        <span />
        <svg viewBox="0 0 16 15" className="footer-heart-icon">
          <path
            d="M8 14C7.7 14 7.4 13.9 7.2 13.7C4.7 11.5 1 8.4 1 5C1 2.7 2.8 1 5 1C6.3 1 7.4 1.7 8 2.7C8.6 1.7 9.7 1 11 1C13.2 1 15 2.7 15 5C15 8.4 11.3 11.5 8.8 13.7C8.6 13.9 8.3 14 8 14Z"
            fill="currentColor"
          />
        </svg>
        <span />
      </div>
      <p className="footer-blessing gsap-footer-item">{footer.blessingMessage}</p>
      <div className="footer-monogram gsap-footer-item">{footer.monogramLine}</div>
    </footer>
  );
}
