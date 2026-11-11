import type { JSX } from 'react';
import { ABOUT_PACKS } from '../about/i18n';
import { BackupPanel } from '../backup/ui/BackupPanel';
import { Icon, type IconName } from '../components/Icon';
import { vars } from '../components/text';
import { useFeatureStrings } from '../i18n/feature';
import { ROUTE_HASH } from '../routes';
import { TOOLS_PACKS, type ToolsStrings } from '../tools/i18n';
import { UI_PACKS } from '../ui/i18n';
import { requestIntro } from '../ui/intro';
import './tools.css';
import './about.css';

interface ToolCard {
  route: 'work' | 'deadline' | 'passport';
  icon: IconName;
  tone: 'jade' | 'sun' | 'blue';
  title: (s: ToolsStrings) => string;
  desc: (s: ToolsStrings) => string;
  note: (s: ToolsStrings) => string;
}

const CARDS: readonly ToolCard[] = [
  { route: 'work', icon: 'clock', tone: 'jade', title: (s) => s.workTitle, desc: (s) => s.workDesc, note: (s) => s.deviceOnly },
  { route: 'deadline', icon: 'calendar', tone: 'sun', title: (s) => s.deadlineTitle, desc: (s) => s.deadlineDesc, note: (s) => s.deviceOnly },
  {
    route: 'passport',
    icon: 'passport',
    tone: 'blue',
    title: (s) => s.passportTitle,
    desc: (s) => s.passportDesc,
    note: (s) => s.passportDeviceOnly,
  },
];

export function ToolsScreen(): JSX.Element {
  const { t, ko } = useFeatureStrings(TOOLS_PACKS);
  const { t: kit } = useFeatureStrings(UI_PACKS);
  const { t: about } = useFeatureStrings(ABOUT_PACKS);

  return (
    <main data-testid="screen-tools" className="screen tools">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">{t.title}</h1>
          <p className="screen-sub">{t.intro}</p>
        </div>
      </header>
      <ul className="tools-list">
        {CARDS.map((c, i) => (
          <li key={c.route} style={vars({ '--i': i })}>
            <a href={ROUTE_HASH[c.route]} data-testid={`tool-${c.route}`} className={`tools-card tools-tone-${c.tone}`} title={c.title(ko)}>
              <span className="tools-icon" aria-hidden="true">
                <Icon name={c.icon} size={26} />
              </span>
              <span className="tools-body">
                <span className="tools-title">{c.title(t)}</span>
                <span className="tools-desc">{c.desc(t)}</span>
                <span className="tools-note">
                  <Icon name="lock" size={13} />
                  {c.note(t)}
                </span>
              </span>
              <Icon name="chevronRight" size={20} className="tools-go" />
            </a>
          </li>
        ))}
      </ul>
      <BackupPanel />
      <button type="button" data-testid="tools-about" className="link-btn tools-about" onClick={requestIntro}>
        <Icon name="sparkle" size={16} />
        {kit.aboutApp}
      </button>
      <nav className="tools-legal">
        <a href={ROUTE_HASH.privacy} data-testid="tools-privacy-link" className="link-btn">
          {about.linkPrivacy}
        </a>
        <a href={ROUTE_HASH.terms} data-testid="tools-terms-link" className="link-btn">
          {about.linkTerms}
        </a>
      </nav>
    </main>
  );
}
