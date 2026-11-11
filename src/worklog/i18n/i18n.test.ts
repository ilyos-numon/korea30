import { describe, expect, it } from 'vitest';
import { FORBIDDEN } from '../../i18n/packCheck';
import { LANGS } from '../../i18n/types';
import { WORKLOG_PACKS } from './index';
import type { WorklogStrings } from './types';

type Fn = (...args: (number | string)[]) => string;
const ALL = ['ko', ...LANGS] as const;
type Key = (typeof ALL)[number];
const TRANSLATED = ['zh', 'vi', 'th', 'uz', 'ru'] as const;

/** 위법·불법·체불 계열 판단 단어. packCheck.FORBIDDEN 에 언어별로 덧붙인다. */
const JUDGE: Readonly<Record<Key, readonly string[]>> = {
  ko: ['위법', '불법', '체불'],
  zh: [...FORBIDDEN.zh, '拖欠'],
  vi: [...FORBIDDEN.vi, 'nợ lương'],
  en: [...FORBIDDEN.en],
  th: [...FORBIDDEN.th, 'ค้างจ่าย'],
  uz: [...FORBIDDEN.uz, 'qonunga zid'],
  ru: [...FORBIDDEN.ru, 'задолженност'],
};

function pack(l: Key): WorklogStrings {
  const p = WORKLOG_PACKS[l];
  if (!p) throw new Error(`missing pack ${l}`);
  return p;
}

/** 문자열은 그대로, 함수는 샘플 인자들로 호출한 결과 전부 */
function rendered(p: WorklogStrings): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  for (const [key, v] of Object.entries(p)) {
    if (typeof v === 'function') {
      const f = v as Fn;
      for (const args of [[3, '2026-10-27'], [10320], ['abc'], ['']] as (number | string)[][]) {
        out.push({ key, value: f(...args) });
      }
    } else {
      out.push({ key, value: v as string });
    }
  }
  return out;
}

describe('WORKLOG_PACKS', () => {
  const koKeys = Object.keys(pack('ko')).sort();

  it('7개 세트가 모두 등록돼 있다', () => {
    for (const l of ALL) expect(WORKLOG_PACKS[l], l).toBeDefined();
  });

  it.each(ALL)('%s 는 ko 와 같은 키를 갖는다', (l) => {
    expect(Object.keys(pack(l)).sort()).toEqual(koKeys);
  });

  it.each(ALL)('%s 의 값은 string 또는 함수이고 같은 종류다', (l) => {
    const ko = pack('ko') as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(pack(l))) {
      expect(['string', 'function'], `${l}.${k}`).toContain(typeof v);
      expect(typeof v, `${l}.${k}`).toBe(typeof ko[k]);
    }
  });

  it.each(ALL)('%s 에 빈 문자열이 없다 (함수는 샘플 인자로 호출)', (l) => {
    for (const { key, value } of rendered(pack(l))) {
      expect(typeof value, `${l}.${key}`).toBe('string');
      expect(value.trim().length, `${l}.${key}`).toBeGreaterThan(0);
    }
  });

  it.each(ALL)('%s 에 판단 단어가 없다', (l) => {
    const words = JUDGE[l];
    const hits = rendered(pack(l))
      .filter(({ value }) => words.some((w) => value.toLowerCase().includes(w)))
      .map(({ key }) => key);
    expect(hits).toEqual([]);
  });

  it.each(TRANSLATED)('%s 는 en 과 같은 값이 키의 10% 이하', (l) => {
    const en = pack('en') as unknown as Record<string, unknown>;
    const p = pack(l) as unknown as Record<string, unknown>;
    const same = Object.keys(p).filter((k) => typeof p[k] === 'string' && p[k] === en[k]);
    expect(same.length).toBeLessThanOrEqual(Math.floor(koKeys.length * 0.1));
  });

  it.each(TRANSLATED)('%s 함수 값은 숫자 인자를 그대로 담는다', (l) => {
    const p = pack(l);
    expect(p.breakMinutes(37)).toContain('37');
    expect(p.size(5)).toContain('5');
    expect(p.sizeYes(5)).toContain('5');
    expect(p.sizeNo(5)).toContain('5');
    expect(p.noteSmallWorkplaceNoPremium(5)).toContain('5');
    expect(p.noteWorkplaceSizeUnknown(5)).toContain('5');
    expect(p.deductionMismatch(4)).toContain('4');
    expect(p.hoursMinutes(125)).toContain('2');
    expect(p.hoursMinutes(125)).toContain('5');
    expect(p.won(10320)).toMatch(/10[,.\s  ]?320/);
    expect(p.minWageWarning(10320)).toMatch(/10[,.\s  ]?320/);
  });
});
