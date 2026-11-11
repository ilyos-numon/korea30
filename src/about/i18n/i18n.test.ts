import { describe, expect, it } from 'vitest';
import { ABOUT_PACKS } from './index';

const LANGS = ['ko', 'en', 'zh', 'vi', 'th', 'uz', 'ru'] as const;
const TRANSLATED = ['zh', 'vi', 'th', 'uz', 'ru'] as const;

function render(value: unknown): string {
  return typeof value === 'function' ? (value as (...args: (number | string)[]) => string)('2026-10-29') : String(value);
}

describe('ABOUT_PACKS', () => {
  const koKeys = Object.keys(ABOUT_PACKS.ko).sort();

  it.each(LANGS)('%s has a pack with the same keys as ko', (lang) => {
    const pack = ABOUT_PACKS[lang];
    expect(pack).toBeDefined();
    expect(Object.keys(pack!).sort()).toEqual(koKeys);
  });

  it.each(LANGS)('%s has no empty strings, and functions return non-empty text', (lang) => {
    const pack = ABOUT_PACKS[lang]! as unknown as Record<string, unknown>;
    for (const key of koKeys) {
      const value = pack[key];
      expect(['string', 'function']).toContain(typeof value);
      expect(render(value).trim(), `${lang}.${key}`).not.toBe('');
    }
  });

  it.each(TRANSLATED)('%s matches en in at most 10%% of keys', (lang) => {
    const pack = ABOUT_PACKS[lang]! as unknown as Record<string, unknown>;
    const en = ABOUT_PACKS.en as unknown as Record<string, unknown>;
    const same = koKeys.filter((key) => render(pack[key]) === render(en[key]));
    expect(same.length).toBeLessThanOrEqual(Math.floor(koKeys.length * 0.1));
  });

  it.each(LANGS)('%s termsNotAdviceBody mentions 1345 and 1350', (lang) => {
    const body = ABOUT_PACKS[lang]!.termsNotAdviceBody;
    expect(body).toContain('1345');
    expect(body).toContain('1350');
  });

  it.each(LANGS)('%s never mentions cloudflare', (lang) => {
    const pack = ABOUT_PACKS[lang]! as unknown as Record<string, unknown>;
    for (const key of koKeys) {
      expect(render(pack[key]).toLowerCase(), `${lang}.${key}`).not.toContain('cloudflare');
    }
  });
});
