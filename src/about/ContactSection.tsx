import type { JSX } from 'react';
import { useFeatureStrings } from '../i18n/feature';
import { ABOUT_PACKS } from './i18n';
import { CONTACT_EMAIL } from './site';

export function ContactSection({ email = CONTACT_EMAIL }: { email?: string | null }): JSX.Element {
  const { t } = useFeatureStrings(ABOUT_PACKS);

  return (
    <section data-testid="about-contact" className="card about-section">
      <h2>{t.contactTitle}</h2>
      <p>{t.contactBody}</p>
      {email ? (
        <a data-testid="about-contact-email" href={`mailto:${email}`}>
          {email}
        </a>
      ) : (
        <p data-testid="about-contact-pending">{t.contactPending}</p>
      )}
    </section>
  );
}
