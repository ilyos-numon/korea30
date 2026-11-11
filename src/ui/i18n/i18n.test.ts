import { describe, expect, it } from 'vitest';
import { FORBIDDEN } from '../../i18n/packCheck';
import { UI_PACKS } from './index';

const LANGS = ['ko', 'en', 'zh', 'vi', 'th', 'uz', 'ru'] as const;
const TRANSLATED = ['zh', 'vi', 'th', 'uz', 'ru'] as const;

function render(value: unknown): string {
  return typeof value === 'function' ? (value as (...args: number[]) => string)(2, 4) : String(value);
}

describe('UI_PACKS', () => {
  const koKeys = Object.keys(UI_PACKS.ko).sort();

  it.each(LANGS)('%s has a pack with the same keys as ko', (lang) => {
    const pack = UI_PACKS[lang];
    expect(pack).toBeDefined();
    expect(Object.keys(pack!).sort()).toEqual(koKeys);
  });

  it.each(LANGS)('%s has no empty strings, and functions return non-empty text', (lang) => {
    const pack = UI_PACKS[lang]! as unknown as Record<string, unknown>;
    for (const key of koKeys) {
      const value = pack[key];
      expect(['string', 'function']).toContain(typeof value);
      expect(render(value).trim(), `${lang}.${key}`).not.toBe('');
    }
  });

  it.each(TRANSLATED)('%s matches en in at most 10%% of keys', (lang) => {
    const pack = UI_PACKS[lang]! as unknown as Record<string, unknown>;
    const en = UI_PACKS.en as unknown as Record<string, unknown>;
    const same = koKeys.filter((key) => render(pack[key]) === render(en[key]));
    expect(same.length).toBeLessThanOrEqual(Math.floor(koKeys.length * 0.1));
  });

  it.each(LANGS)('%s avoids judgement words', (lang) => {
    const pack = UI_PACKS[lang]! as unknown as Record<string, unknown>;
    const bad = lang === 'ko' ? ['위법', '불법', '체불'] : FORBIDDEN[lang];
    for (const key of koKeys) {
      const text = render(pack[key]).toLowerCase();
      for (const b of bad) expect(text, `${lang}.${key}`).not.toContain(b);
    }
  });

  it.each(LANGS)('%s intro titles stay short (two lines at 412px)', (lang) => {
    const pack = UI_PACKS[lang]!;
    for (const t of [pack.intro1Title, pack.intro2Title, pack.intro3Title, pack.intro4Title]) {
      expect(t.length, `${lang}: ${t}`).toBeLessThanOrEqual(52);
    }
  });
});
