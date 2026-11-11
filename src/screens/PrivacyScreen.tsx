import type { JSX } from 'react';
import { ContactSection } from '../about/ContactSection';
import { ABOUT_PACKS, type AboutStrings } from '../about/i18n';
import { POLICY_DATE } from '../about/site';
import { useFeatureStrings } from '../i18n/feature';
import { ROUTE_HASH } from '../routes';
import './about.css';

const SECTIONS: readonly { id: string; title: (s: AboutStrings) => string; body: (s: AboutStrings) => string }[] = [
  { id: 'nocollect', title: (s) => s.privacyNoCollectTitle, body: (s) => s.privacyNoCollectBody },
  { id: 'storage', title: (s) => s.privacyStorageTitle, body: (s) => s.privacyStorageBody },
  { id: 'photo', title: (s) => s.privacyPhotoTitle, body: (s) => s.privacyPhotoBody },
  { id: 'backup', title: (s) => s.privacyBackupTitle, body: (s) => s.privacyBackupBody },
  { id: 'hosting', title: (s) => s.privacyHostingTitle, body: (s) => s.privacyHostingBody },
];

export function PrivacyScreen(): JSX.Element {
  const { t, ko } = useFeatureStrings(ABOUT_PACKS);

  return (
    <main data-testid="screen-privacy" className="screen about">
      <header className="screen-head">
        <div>
          <h1 className="screen-title" data-testid="about-title" title={ko.privacyTitle}>
            {t.privacyTitle}
          </h1>
          <p className="screen-sub">{t.privacyIntro}</p>
        </div>
      </header>
      {SECTIONS.map((s) => (
        <section key={s.id} data-testid={`privacy-section-${s.id}`} className="card about-section">
          <h2>{s.title(t)}</h2>
          <p>{s.body(t)}</p>
        </section>
      ))}
      <p data-testid="privacy-updated">
        {t.privacyUpdated(POLICY_DATE)}
      </p>
      <ContactSection />
      <a href={ROUTE_HASH.terms} data-testid="privacy-to-terms" className="link-btn">
        {t.linkTerms}
      </a>
    </main>
  );
}
