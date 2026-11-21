import { weddingConfig } from '../config/wedding';
import { LivingBouquet } from './LivingBouquet';

export function CeremonyInfo() {
  const { ceremony, parents, couple } = weddingConfig;

  return (
    <section className="card-section" aria-labelledby="ceremonyHeading">
      <div className="burgundy-card ceremony-card gsap-card">
        <LivingBouquet
          variant="ceremony-right"
          className="gsap-bouquet-reveal"
        />

        <h2 id="ceremonyHeading" className="card-title gsap-stagger">
          {ceremony.sectionTitle}
        </h2>

        <div className="parents-grid">
          <div className="parent-col parent-left gsap-stagger">
            <p className="parent-prefix">{parents.groomPrefix}</p>
            {parents.groomLines.map((line) => (
              <p key={line} className="parent-name-strong">
                {line}
              </p>
            ))}
          </div>

          <div className="parents-divider gsap-divider" aria-hidden="true" />

          <div className="parent-col parent-right gsap-stagger">
            <p className="parent-prefix">{parents.bridePrefix}</p>
            {parents.brideLines.map((line) => (
              <p key={line} className="parent-name-strong">
                {line}
              </p>
            ))}
          </div>
        </div>

        <p className="announce-line gsap-stagger">
          {ceremony.announcementLines[0]}
          <br />
          {ceremony.announcementLines[1]}
        </p>

        <div className="couple-spotlight">
          <div className="gsap-stagger">
            <p className="full-name">{couple.groomFullName}</p>
            <p className="role-label">{couple.groomRoleLabel}</p>
          </div>

          <p className="spotlight-amp gsap-stagger" aria-hidden="true">
            &amp;
          </p>

          <div className="gsap-stagger">
            <p className="full-name">{couple.brideFullName}</p>
            <p className="role-label">{couple.brideRoleLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
