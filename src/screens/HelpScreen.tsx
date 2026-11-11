import type { JSX } from 'react';
import { ABOUT_PACKS } from '../about/i18n';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { plain, vars } from '../components/text';
import { contactViews, type ContactView } from '../i18n/content';
import { useFeatureStrings } from '../i18n/feature';
import { useLang } from '../i18n/LangContext';
import type { UiStrings } from '../i18n/types';
import { ROUTE_HASH } from '../routes';
import './help.css';

function EmergencyCard(props: { c: ContactView }): JSX.Element {
  const { c } = props;
  return (
    <article data-testid={`contact-${c.id}`} className="help-sos">
      <a data-testid={`contact-call-${c.id}`} href={`tel:${c.tel}`} className="help-call help-call-emergency">
        <span className="help-sos-icon" aria-hidden="true">
          <Icon name={c.id === 'fire' ? 'siren' : 'guard'} size={22} />
        </span>
        <span className="help-sos-number num">{c.number}</span>
        <span className="help-sos-name">{c.name}</span>
        <span lang="ko" className="help-sos-ko">
          {c.nameKo}
        </span>
      </a>
    </article>
  );
}

function ContactRow(props: { c: ContactView; ui: UiStrings; i: number }): JSX.Element {
  const { c, ui, i } = props;
  return (
    <article data-testid={`contact-${c.id}`} className="help-contact" style={vars({ '--i': i })}>
      <div className="help-contact-main">
        <Hint
          text={
            <>
              {c.when}
              <br />
              <span lang="ko">{c.whenKo}</span>
            </>
          }
        >
          <p className="help-contact-name">{c.name}</p>
        </Hint>
        <p className="help-contact-name-ko" lang="ko">
          {c.nameKo}
        </p>
        {c.native || !c.verified ? (
          <p className="help-contact-badges">
            {c.native && (
              <span data-testid={`contact-vi-${c.id}`} className="badge badge-ok">
                {ui.helpNativeBadge}
              </span>
            )}
            {!c.verified && (
              <span data-testid={`contact-recheck-${c.id}`} className="badge badge-warn">
                {`${ui.helpRecheck} · `}
                <span lang="ko">번호 재확인 필요</span>
              </span>
            )}
          </p>
        ) : null}
        {c.sayKo && (
          <p data-testid={`contact-say-${c.id}`} className="help-contact-say" lang="ko">
            <Icon name="message" size={14} />
            {`"${c.sayKo}"`}
          </p>
        )}
      </div>
      <a data-testid={`contact-call-${c.id}`} href={`tel:${c.tel}`} className="help-call" aria-label={`${c.name} ${c.number}`}>
        <span className="help-call-number num">{c.number}</span>
        <span className="help-call-icon" aria-hidden="true">
          <Icon name="phone" size={18} />
        </span>
      </a>
    </article>
  );
}

export function HelpScreen(): JSX.Element {
  const { lang, ui } = useLang();
  const { t: about } = useFeatureStrings(ABOUT_PACKS);
  const contacts = contactViews(lang);
  const emergency = contacts.filter((c) => c.emergency);
  const lines = contacts.filter((c) => !c.emergency);

  return (
    <main data-testid="screen-help" className="screen help">
      <header className="screen-head">
        <h1 className="screen-title">{ui.helpTitle}</h1>
      </header>
      <div data-testid="help-expert-note" className="note help-expert-note">
        <Icon name="guardCheck" size={18} />
        <Hint kind="ko" text="Korea30은 비자·법률을 판단하지 않아요. 판단이 필요하면 아래 기관에 물어보세요.">
          <p>{ui.helpExpertNote}</p>
          <a href={ROUTE_HASH.terms} data-testid="help-terms-link" className="link-btn">
            {about.linkTerms}
          </a>
        </Hint>
      </div>
      <section data-testid="help-emergency" className="section help-emergency">
        <h2 className="section-title">
          <Icon name="siren" size={18} />
          {plain(ui.helpEmergency)}
        </h2>
        <div className="help-sos-grid">
          {emergency.map((c) => (
            <EmergencyCard key={c.id} c={c} />
          ))}
        </div>
      </section>
      <section data-testid="help-lines" className="section help-lines">
        <h2 className="section-title">
          <Icon name="phone" size={18} />
          {plain(ui.helpLines)}
        </h2>
        <div className="card help-list">
          {lines.map((c, i) => (
            <ContactRow key={c.id} c={c} ui={ui} i={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
