import type { JSX } from 'react';
import { Hint } from '../components/Hint';
import { useLang } from '../i18n/LangContext';
import { LEGAL_BADGE_STRINGS } from './i18n';
import { anyUnverified } from './index';
import type { LegalId } from './types';

/** anyUnverified 면 data-testid="legal-badge" 배지(+ ? 설명), 아니면 null */
export function LegalBadge(props: { ids: readonly LegalId[] }): JSX.Element | null {
  const { lang } = useLang();
  if (!anyUnverified(props.ids)) return null;
  const t = LEGAL_BADGE_STRINGS[lang];
  const ko = LEGAL_BADGE_STRINGS.ko;
  return (
    <Hint className="legal-hint" text={`${t.hint} ${ko.hint}`}>
      <span data-testid="legal-badge" className="legal-badge badge badge-warn" role="note" title={`${t.hint} ${ko.hint}`}>
        {t.label} · <span lang="ko">{ko.label}</span>
      </span>
    </Hint>
  );
}
