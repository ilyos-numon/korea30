import type { JSX } from 'react';
import { HTML_LANG, LANGS, LANG_KO, LANG_NATIVE, LANG_PROMPT, type Lang } from '../i18n/types';
import { Icon } from './Icon';
import { vars } from './text';
import './lang.css';

export function LanguageOptions(props: {
  current: Lang | null;
  suggested: Lang | null;
  onPick: (l: Lang) => void;
}): JSX.Element {
  const { current, suggested, onPick } = props;
  return (
    <ul className="lang-options stagger">
      {LANGS.map((l, i) => (
        <li key={l} style={vars({ '--i': i })}>
          <button
            type="button"
            data-testid={`lang-option-${l}`}
            className="lang-option"
            lang={HTML_LANG[l]}
            aria-pressed={current === l}
            data-suggested={suggested === l ? 'true' : undefined}
            onClick={() => onPick(l)}
          >
            <span className="lang-option-text">
              <span className="lang-option-native">{LANG_NATIVE[l]}</span>
              <span className="lang-option-ko" lang="ko">
                {LANG_KO[l]}
              </span>
            </span>
            {suggested === l && (
              <span className="badge badge-accent lang-option-star" aria-hidden="true">
                ★
              </span>
            )}
            <span className="lang-option-end" aria-hidden="true">
              {current === l ? <Icon name="check" size={20} strokeWidth={2.4} /> : <Icon name="chevronRight" size={18} />}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 첫 실행 화면. 6개 언어의 "언어를 고르세요"가 차례로 바뀌어 보이고, 아래에서 언어를 고른다 */
export function LanguagePicker(props: { suggested: Lang | null; onPick: (l: Lang) => void }): JSX.Element {
  const { suggested, onPick } = props;
  return (
    <main data-testid="lang-picker" className="screen lang-picker">
      <div className="lang-hero">
        <span className="lang-mark" aria-hidden="true">
          <Icon name="globe" size={30} strokeWidth={1.6} />
        </span>
        <p className="app-brand lang-brand">
          Korea<b>30</b>
        </p>
        <h1 className="sr-only">
          <span lang="ko">언어 선택</span> · Choose your language
        </h1>
        <ul className="lang-prompts" aria-hidden="true">
          {LANGS.map((l, i) => (
            <li key={l} lang={HTML_LANG[l]} style={vars({ '--i': i })}>
              {LANG_PROMPT[l]}
            </li>
          ))}
        </ul>
      </div>
      <LanguageOptions current={null} suggested={suggested} onPick={onPick} />
    </main>
  );
}
