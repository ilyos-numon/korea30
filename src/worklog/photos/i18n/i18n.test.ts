import { describe, expect, it } from 'vitest';
import { FORBIDDEN } from '../../../i18n/packCheck';
import { PHOTO_PACKS } from './index';
import type { PhotoStrings } from './types';

type Fn = (...args: (number | string)[]) => string;
const ALL = ['ko', 'en', 'zh', 'vi', 'th', 'uz', 'ru'] as const;
type Key = (typeof ALL)[number];

/** 위법·불법·체불 계열 판단 단어. packCheck.FORBIDDEN 재사용 (src/worklog/i18n/i18n.test.ts 와 같은 방식) */
const JUDGE: Readonly<Record<Key, readonly string[]>> = {
  ko: ['위법', '불법', '체불'],
  en: [...FORBIDDEN.en],
  zh: [...FORBIDDEN.zh, '拖欠'],
  vi: [...FORBIDDEN.vi, 'nợ lương'],
  th: [...FORBIDDEN.th, 'ค้างจ่าย'],
  uz: [...FORBIDDEN.uz, 'qonunga zid'],
  ru: [...FORBIDDEN.ru, 'задолженност'],
};

/** retentionHint 에 있어야 하는 말: 임금(WAGE), 법정 기간이 아님(NOT_LEGAL) */
const WAGE: Readonly<Record<Key, RegExp>> = {
  ko: /임금/,
  en: /wage/i,
  zh: /工资/,
  vi: /lương/i,
  th: /ค่าจ้าง/,
  uz: /ish haqi/i,
  ru: /заработн/i,
};
const NOT_LEGAL: Readonly<Record<Key, RegExp>> = {
  ko: /법정 기간이 아니/,
  en: /not a legal period/i,
  zh: /不是法定期限/,
  vi: /không phải thời hạn theo luật/i,
  th: /ไม่ใช่ระยะเวลาตามกฎหมาย/,
  uz: /qonunda belgilangan muddat emas/i,
  ru: /не срок, установленный законом/i,
};

function pack(l: Key): PhotoStrings {
  const p = PHOTO_PACKS[l];
  if (!p) throw new Error(`missing pack ${l}`);
  return p;
}

/** 문자열은 그대로, 함수는 샘플 인자들로 호출한 결과 전부 */
function rendered(p: PhotoStrings): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  for (const [key, v] of Object.entries(p)) {
    if (typeof v === 'function') {
      const f = v as Fn;
      for (const args of [[3, '2026-10-27'], [3, '2026-10-27', '09:00'], [12], ['abc'], [''], []] as (number | string)[][]) {
        out.push({ key, value: f(...args) });
      }
    } else {
      out.push({ key, value: v as string });
    }
  }
  return out;
}

describe('PHOTO_PACKS', () => {
  const koKeys = Object.keys(pack('ko')).sort();

  it('7개 언어 세트가 모두 등록돼 있다', () => {
    for (const l of ALL) expect(PHOTO_PACKS[l], l).toBeDefined();
  });

  it('en 은 ko 와 같은 키를 갖는다', () => {
    expect(Object.keys(pack('en')).sort()).toEqual(koKeys);
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

  it.each(ALL)('%s 에 빈 문자열이 없다 (함수는 샘플·모르는 인자로 호출)', (l) => {
    for (const { key, value } of rendered(pack(l))) {
      expect(typeof value, `${l}.${key}`).toBe('string');
      expect(value.trim().length, `${l}.${key}`).toBeGreaterThan(0);
      for (const bad of ['undefined', 'NaN', '[object']) expect(value, `${l}.${key}`).not.toContain(bad);
    }
  });

  it.each(ALL)('%s 함수 값은 인자를 그대로 담는다 (3, 2026-10-27)', (l) => {
    for (const [key, v] of Object.entries(pack(l))) {
      if (typeof v !== 'function') continue;
      const out = (v as Fn)(3, '2026-10-27');
      expect(out.trim().length, `${l}.${key}`).toBeGreaterThan(0);
      expect(out, `${l}.${key}`).toContain('3');
    }
    const p = pack(l);
    expect(p.takenOn('2026-10-27')).toContain('2026-10-27');
    expect(p.takenOnSaved('2026-10-27')).toContain('2026-10-27');
    expect(p.expiresOn('2026-10-27')).toContain('2026-10-27');
    expect(p.shiftOption('2026-10-27', '09:00', '18:00')).toMatch(/2026-10-27.*09:00.*18:00/);
    expect(p.errorTooLarge(25)).toContain('25');
    expect(p.retentionError(1, 120)).toMatch(/1.*120/);
    expect(p.months(24)).toContain('24');
    expect(p.purged(7)).toContain('7');
  });

  it.each(ALL)('%s 에 판단 단어가 없다', (l) => {
    const words = JUDGE[l];
    const hits = rendered(pack(l))
      .filter(({ value }) => words.some((w) => value.toLowerCase().includes(w)))
      .map(({ key }) => key);
    expect(hits).toEqual([]);
  });

  it('ko retentionHint 는 법정 기간이 아님을 밝히고 단정하지 않는다', () => {
    const h = pack('ko').retentionHint;
    expect(h).toContain('법정');
    expect(h).toContain('아니');
    expect(h).not.toMatch(/법정 보존|법정 기간입니다|법정 기간이에요/);
  });

  it.each(ALL)('%s retentionHint 는 임금 증거를 더 오래 두거나 PDF 로 보관하라고 안내한다', (l) => {
    const h = pack(l).retentionHint;
    expect(h).toMatch(l === 'ko' ? /임금/ : WAGE[l]);
    expect(h).toContain('PDF');
  });

  it.each(ALL)('%s retentionHint 는 앱 설정값이며 법정 기간이 아님을 밝힌다', (l) => {
    expect(pack(l).retentionHint).toMatch(NOT_LEGAL[l]);
  });
});
