import type { CSSProperties } from 'react';
import { weddingConfig } from '../config/wedding';

export function CeremonyInfo() {
  const { ceremony, parents, couple, assets } = weddingConfig;

  return (
    <section className="card-section" aria-labelledby="ceremonyHeading">
      <div className="burgundy-card ceremony-card reveal-item">
        <img
          src={assets.floralBouquet}
          alt=""
          className="card-floral card-floral-right"
          aria-hidden="true"
        />

        <h2
          id="ceremonyHeading"
          className="card-title stagger-child"
          style={{ '--i': 0 } as CSSProperties}
        >
          {ceremony.sectionTitle}
        </h2>

        <div className="parents-grid">
          <div
            className="parent-col parent-left stagger-child"
            style={{ '--i': 1 } as CSSProperties}
          >
            <p className="parent-prefix">{parents.groomPrefix}</p>
            <p className="parent-name-soft">{parents.groomFamilyLine}</p>
          </div>

          <div
            className="parents-divider stagger-divider"
            style={{ '--i': 2 } as CSSProperties}
            aria-hidden="true"
          />

          <div
            className="parent-col parent-right stagger-child"
            style={{ '--i': 2 } as CSSProperties}
          >
            <p className="parent-prefix">{parents.bridePrefix}</p>
            {parents.brideLines.map((line) => (
              <p key={line} className="parent-name-strong">
                {line}
              </p>
            ))}
          </div>
        </div>

        <p
          className="announce-line stagger-child"
          style={{ '--i': 3 } as CSSProperties}
        >
          {ceremony.announcementLines[0]}
          <br />
          {ceremony.announcementLines[1]}
        </p>

        <div className="couple-spotlight">
          <div className="stagger-child" style={{ '--i': 4 } as CSSProperties}>
            <p className="full-name">{couple.groomFullName}</p>
            <p className="role-label">{couple.groomRoleLabel}</p>
          </div>

          <p
            className="spotlight-amp stagger-child"
            style={{ '--i': 5 } as CSSProperties}
            aria-hidden="true"
          >
            &amp;
          </p>

          <div className="stagger-child" style={{ '--i': 6 } as CSSProperties}>
            <p className="full-name">{couple.brideFullName}</p>
            <p className="role-label">{couple.brideRoleLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
