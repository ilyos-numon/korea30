import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { LanguageOptions, LanguagePicker } from './LanguagePicker';
import { LangRoot } from './LangRoot';
import { LangSwitch } from './LangSwitch';
import { LangContext, langValue } from '../i18n/LangContext';
import { PACKS } from '../i18n/packs';
import { LANGS, LANG_KEY, LANG_NATIVE, LANG_PROMPT } from '../i18n/types';
import type { ProgressStorage } from '../quest/progress';

function fakeStorage(init: Record<string, string> = {}): ProgressStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(init));
  return {
    data,
    getItem: (k) => (data.has(k) ? (data.get(k) as string) : null),
    setItem: (k, v) => {
      data.set(k, v);
    },
    removeItem: (k) => {
      data.delete(k);
    },
  };
}

const CHILD = '<p data-testid="child">child</p>';
const child = <p data-testid="child">child</p>;

describe('LanguagePicker', () => {
  it('renders 6 lang options in LANGS order with native names', () => {
    const html = renderToString(<LanguagePicker suggested={null} onPick={() => {}} />);
    expect(html).toContain('data-testid="lang-picker"');
    const ids = [...html.matchAll(/data-testid="lang-option-([a-z]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual([...LANGS]);
    for (const l of LANGS) {
      expect(html).toContain(LANG_NATIVE[l]);
      expect(html).toContain(LANG_PROMPT[l]);
    }
  });

  it('marks only the suggested language with data-suggested', () => {
    const html = renderToString(<LanguagePicker suggested="ru" onPick={() => {}} />);
    const marked = [...html.matchAll(/data-testid="lang-option-([a-z]+)"[^>]*data-suggested="true"/g)].map(
      (m) => m[1],
    );
    expect(marked).toEqual(['ru']);
    expect(html.match(/data-suggested=/g)).toHaveLength(1);
    expect(html.match(/★/g)).toHaveLength(1);
  });

  it('marks nothing when there is no suggestion', () => {
    const html = renderToString(<LanguagePicker suggested={null} onPick={() => {}} />);
    expect(html).not.toContain('data-suggested');
    expect(html).not.toContain('★');
  });

  it('LanguageOptions sets aria-pressed only for the current language', () => {
    const html = renderToString(<LanguageOptions current="th" suggested={null} onPick={() => {}} />);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/data-testid="lang-option-th"[^>]*aria-pressed="true"/);
    expect(html).toMatch(/data-testid="lang-option-th"[^>]*lang="th"/);
  });
});

describe('LangRoot', () => {
  it('shows the picker and no children when storage is empty', () => {
    const html = renderToString(
      <LangRoot storage={fakeStorage()} languages={['ru-RU']}>
        {child}
      </LangRoot>,
    );
    expect(html).toContain('data-testid="lang-picker"');
    expect(html).toMatch(/data-testid="lang-option-ru"[^>]*data-suggested="true"/);
    expect(html).not.toContain(CHILD);
  });

  it('renders children and no picker when a saved language exists', () => {
    const html = renderToString(
      <LangRoot storage={fakeStorage({ [LANG_KEY]: 'ru' })} languages={[]}>
        {child}
      </LangRoot>,
    );
    expect(html).toContain(CHILD);
    expect(html).not.toContain('lang-picker');
  });

  it('shows the picker when the saved value is invalid', () => {
    const html = renderToString(
      <LangRoot storage={fakeStorage({ [LANG_KEY]: 'xx' })} languages={[]}>
        {child}
      </LangRoot>,
    );
    expect(html).toContain('data-testid="lang-picker"');
    expect(html).not.toContain(CHILD);
  });

  it('provides the saved language to children', () => {
    const html = renderToString(
      <LangRoot storage={fakeStorage({ [LANG_KEY]: 'ru' })} languages={[]}>
        <LangSwitch />
      </LangRoot>,
    );
    expect(html).toMatch(/data-testid="lang-switch"[\s\S]*?<span>RU<\/span>/);
  });
});

describe('LangSwitch', () => {
  it('renders short code and aria-label of the provided language', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('ru')}>
        <LangSwitch />
      </LangContext.Provider>,
    );
    expect(html).toContain('data-testid="lang-switch"');
    expect(html).toMatch(/data-testid="lang-switch"[\s\S]*?<svg[\s\S]*?<span>RU<\/span>/);
    expect(html).toContain(`aria-label="${PACKS.ru.ui.langSwitchAria}"`);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('lang-sheet');
  });
});
