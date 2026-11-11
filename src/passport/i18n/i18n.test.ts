import { describe, expect, it } from 'vitest';
import { ARC_FORM_FIELDS } from '../../forms/arcForm';
import { PASSPORT_PACKS } from './index';

const LANGS = ['ko', 'en', 'zh', 'vi', 'th', 'uz', 'ru'] as const;
const TRANSLATED = ['zh', 'vi', 'th', 'uz', 'ru'] as const;

function render(value: unknown): string {
  return typeof value === 'function' ? (value as (...args: (number | string)[]) => string)(3, '2026-10-27') : String(value);
}

describe('PASSPORT_PACKS', () => {
  const koKeys = Object.keys(PASSPORT_PACKS.ko).sort();

  it.each(LANGS)('%s has a pack with the same keys as ko', (lang) => {
    const pack = PASSPORT_PACKS[lang];
    expect(pack).toBeDefined();
    expect(Object.keys(pack!).sort()).toEqual(koKeys);
  });

  it.each(LANGS)('%s has no empty strings, and functions return non-empty text', (lang) => {
    const pack = PASSPORT_PACKS[lang]! as unknown as Record<string, unknown>;
    for (const key of koKeys) {
      const value = pack[key];
      expect(['string', 'function']).toContain(typeof value);
      expect(render(value).trim(), `${lang}.${key}`).not.toBe('');
    }
  });

  it.each(TRANSLATED)('%s matches en in at most 10%% of keys', (lang) => {
    const pack = PASSPORT_PACKS[lang]! as unknown as Record<string, unknown>;
    const en = PASSPORT_PACKS.en as unknown as Record<string, unknown>;
    const same = koKeys.filter((key) => render(pack[key]) === render(en[key]));
    expect(same.length).toBeLessThanOrEqual(Math.floor(koKeys.length * 0.1));
  });

  it.each(LANGS)('%s labels every form field (not the fallback)', (lang) => {
    const pack = PASSPORT_PACKS[lang]!;
    const fallback = pack.fieldLabel('__unknown__');
    for (const field of ARC_FORM_FIELDS) {
      const label = pack.fieldLabel(field.id);
      expect(label.trim(), `${lang}.${field.id}`).not.toBe('');
      expect(label, `${lang}.${field.id}`).not.toBe(fallback);
    }
  });
});
