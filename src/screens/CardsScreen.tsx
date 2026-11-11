import { useState } from 'react';
import type { JSX } from 'react';
import type { PhraseCategory } from '../cards/phrases';
import { BigCard } from '../components/BigCard';
import { Icon } from '../components/Icon';
import { vars } from '../components/text';
import { phraseCategoryLabel, phraseViews } from '../i18n/content';
import { useLang } from '../i18n/LangContext';
import './cards.css';

const CATEGORIES: readonly PhraseCategory[] = ['counter', 'daily', 'quest'];

export function CardsScreen(props: { initialOpenId?: string }): JSX.Element {
  const { lang, ui } = useLang();
  const phrases = phraseViews(lang);
  const [openId, setOpenId] = useState<string | null>(props.initialOpenId ?? null);
  const open = openId === null ? undefined : phrases.find((p) => p.id === openId);

  return (
    <main data-testid="screen-cards" className="screen cards">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">{ui.cardsTitle}</h1>
          <p className="screen-sub">{ui.cardsHint}</p>
        </div>
      </header>
      {CATEGORIES.map((category) => {
        const label = phraseCategoryLabel(category, lang);
        return (
          <section key={category} data-testid={`cards-group-${category}`} className="section cards-group">
            <h2 className="section-title cards-group-title">
              {label.text}
              <span lang="ko" className="cards-group-ko">
                {label.ko}
              </span>
            </h2>
            <div className="cards-list">
              {phrases
                .filter((p) => p.category === category)
                .map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    data-testid={`card-${p.id}`}
                    className="cards-item"
                    style={vars({ '--i': i })}
                    onClick={() => setOpenId(p.id)}
                  >
                    <span className="cards-item-text">
                      <span className="cards-item-ko" lang="ko">
                        {p.ko}
                      </span>
                      <span className="cards-item-vi">{p.meaning}</span>
                    </span>
                    <span className="cards-item-go" aria-hidden="true">
                      <Icon name="expand" size={16} />
                    </span>
                  </button>
                ))}
            </div>
          </section>
        );
      })}
      {open && <BigCard ko={open.ko} vi={open.meaning} viPron={open.pron} onClose={() => setOpenId(null)} />}
    </main>
  );
}
