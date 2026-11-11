import { describe, expect, it } from 'vitest';
import type { DeadlineKind } from '../rules';
import { DEADLINE_PACKS } from './index';
import type { DeadlineStrings } from './types';

const LANGS = ['ko', 'en', 'zh', 'vi', 'th', 'uz', 'ru'] as const;
const TRANSLATED = ['zh', 'vi', 'th', 'uz', 'ru'] as const;
const KINDS: readonly DeadlineKind[] = [
  'arcRegistration',
  'addressChange',
  'extensionOpens',
  'stayExpiry',
  'jobChangeApply',
  'contractEnd',
  'passportExpiry',
];

type AnyFn = (...args: (number | string)[]) => string;
const pack = (lang: (typeof LANGS)[number]): DeadlineStrings => {
  const p = DEADLINE_PACKS[lang];
  if (!p) throw new Error(`missing pack ${lang}`);
  return p;
};
const sortedKeys = (p: DeadlineStrings): string[] => Object.keys(p).sort();

describe('DEADLINE_PACKS 무결성 (§4.3)', () => {
  it('7개 언어가 모두 등록돼 있다', () => {
    for (const lang of LANGS) expect(DEADLINE_PACKS[lang], lang).toBeDefined();
  });

  it.each(LANGS)('%s 는 ko 와 키가 같다', (lang) => {
    expect(sortedKeys(pack(lang))).toEqual(sortedKeys(pack('ko')));
  });

  it.each(LANGS)('%s 에 빈 문자열이 없고 값은 string 또는 함수다', (lang) => {
    for (const [key, value] of Object.entries(pack(lang))) {
      expect(['string', 'function'], `${lang}.${key}`).toContain(typeof value);
      if (typeof value === 'string') expect(value.trim(), `${lang}.${key}`).not.toBe('');
    }
  });

  it.each(LANGS)("%s 함수 값은 (3, '2026-10-27') 로 빈 문자열이 아니다", (lang) => {
    for (const [key, value] of Object.entries(pack(lang))) {
      if (typeof value !== 'function') continue;
      const out = (value as AnyFn)(3, '2026-10-27');
      expect(typeof out, `${lang}.${key}`).toBe('string');
      expect(out.trim(), `${lang}.${key}`).not.toBe('');
    }
  });

  it.each(LANGS)('%s kindTitle/alarm 은 모든 kind 에 값을 낸다', (lang) => {
    const p = pack(lang);
    for (const kind of KINDS) {
      expect(p.kindTitle(kind).trim(), `${lang}.kindTitle(${kind})`).not.toBe('');
      expect(p.alarm(kind, 7), `${lang}.alarm(${kind})`).toContain(p.kindTitle(kind));
    }
  });

  it.each(LANGS)('%s daysLeft 는 음수·0·양수에 값을 낸다', (lang) => {
    const p = pack(lang);
    for (const n of [-2, 0, 5]) expect(p.daysLeft(n).trim(), `${lang}.daysLeft(${n})`).not.toBe('');
  });

  it.each(TRANSLATED)('%s 는 en 과 같은 문자열 값이 키의 10% 이하다', (lang) => {
    const p = pack(lang) as unknown as Record<string, unknown>;
    const en = pack('en') as unknown as Record<string, unknown>;
    const keys = Object.keys(en);
    const same = keys.filter((k) => typeof en[k] === 'string' && p[k] === en[k]);
    expect(same.length / keys.length, same.join(', ')).toBeLessThanOrEqual(0.1);
  });
});
