import type { JSX } from 'react';
import { ContactSection } from '../about/ContactSection';
import { ABOUT_PACKS, type AboutStrings } from '../about/i18n';
import { useFeatureStrings } from '../i18n/feature';
import { ROUTE_HASH } from '../routes';
import './about.css';

const SECTIONS: readonly { id: string; title: (s: AboutStrings) => string; body: (s: AboutStrings) => string }[] = [
  { id: 'notadvice', title: (s) => s.termsNotAdviceTitle, body: (s) => s.termsNotAdviceBody },
  { id: 'accuracy', title: (s) => s.termsAccuracyTitle, body: (s) => s.termsAccuracyBody },
  { id: 'docs', title: (s) => s.termsDocsTitle, body: (s) => s.termsDocsBody },
];

export function TermsScreen(): JSX.Element {
  const { t, ko } = useFeatureStrings(ABOUT_PACKS);

  return (
    <main data-testid="screen-terms" className="screen about">
      <header className="screen-head">
        <div>
          <h1 className="screen-title" data-testid="about-title" title={ko.termsTitle}>
            {t.termsTitle}
          </h1>
          <p className="screen-sub">{t.termsIntro}</p>
        </div>
      </header>
      {SECTIONS.map((s) => (
        <section key={s.id} data-testid={`terms-section-${s.id}`} className="card about-section">
          <h2>{s.title(t)}</h2>
          <p>{s.body(t)}</p>
        </section>
      ))}
      <ContactSection />
      <a href={ROUTE_HASH.privacy} data-testid="terms-to-privacy" className="link-btn">
        {t.linkPrivacy}
      </a>
    </main>
  );
}
