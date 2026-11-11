import { useState } from 'react';
import type { JSX } from 'react';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { SpeakButton } from '../components/SpeakButton';
import { plain, vars } from '../components/text';
import type { TermCategory } from '../glossary/glossary';
import { termCategoryLabel } from '../i18n/content';
import { useFeatureStrings } from '../i18n/feature';
import { UI_PACKS } from '../ui/i18n';
import { useLang } from '../i18n/LangContext';
import { searchTermViews } from '../i18n/search';
import './glossary.css';

export function GlossaryScreen(props: { initialQuery?: string }): JSX.Element {
  const { lang, ui } = useLang();
  const { t: kit } = useFeatureStrings(UI_PACKS);
  const [query, setQuery] = useState(props.initialQuery ?? '');
  const [cat, setCat] = useState<TermCategory | 'all'>('all');
  const found = searchTermViews(lang, query);
  const results = cat === 'all' ? found : found.filter((t) => t.category === cat);

  return (
    <main data-testid="screen-glossary" className="screen glossary">
      <header className="screen-head">
        <h1 className="screen-title">{ui.glossaryTitle}</h1>
      </header>
      <div className="glossary-search-wrap">
        <label className="glossary-search-box">
          <Icon name="search" size={20} />
          <input
            type="search"
            data-testid="glossary-search"
            className="glossary-search"
            placeholder={ui.glossaryPlaceholder}
            aria-label={ui.glossarySearchAria}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="glossary-filter">
          <div className="segmented glossary-cats" role="group" aria-label={ui.glossaryTitle}>
            {(['all', 'pay', 'insurance', 'admin'] as const).map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
                {c === 'all' ? kit.all : termCategoryLabel(c, lang)}
              </button>
            ))}
          </div>
          <p data-testid="glossary-count" className="glossary-count">
            {ui.glossaryCount(results.length)}
          </p>
        </div>
      </div>
      {results.length === 0 && (
        <div data-testid="glossary-empty" className="glossary-empty">
          <Icon name="search" size={28} />
          <p className="glossary-empty-title">
            {ui.glossaryEmpty} <span lang="ko">· 찾는 말이 없어요.</span>
          </p>
          <p className="muted">{ui.glossaryEmptyTry}</p>
        </div>
      )}
      <div className="glossary-list">
        {results.map((t, i) => (
          <article key={t.id} data-testid={`term-${t.id}`} className="glossary-term" style={vars({ '--i': Math.min(i, 12) })}>
            <div className="glossary-term-head">
              <div className="glossary-term-names">
                <span className="glossary-term-ko" lang="ko">
                  {t.ko}
                </span>
                <span className="glossary-term-vi">{t.name}</span>
              </div>
              <div style={{ display: 'flex', flex: 'none', gap: 'var(--space-2)' }}>
                <SpeakButton text={t.ko} testId={`term-speak-${t.id}`} compact />
                <SpeakButton text={t.name} testId={`term-speak-tr-${t.id}`} lang={lang} compact />
              </div>
            </div>
            <Hint kind="ko" text={t.explainKo} className="glossary-term-explain-wrap">
              <p className="glossary-term-explain">{t.explain}</p>
            </Hint>
            <div className="glossary-term-foot">
              <span className="badge glossary-term-cat">{termCategoryLabel(t.category, lang)}</span>
              {t.askExpert && (
                <a data-testid={`term-expert-${t.id}`} href="#/help" className="badge badge-warn glossary-expert">
                  {plain(ui.askExpert)}
                  <Icon name="chevronRight" size={12} strokeWidth={2.4} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
