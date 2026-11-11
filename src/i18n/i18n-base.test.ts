import { describe, expect, it } from 'vitest';
import { LANGS, LANG_KEY, LANG_NATIVE, HTML_LANG, isLang } from './types';
import {
  CONTACT_IDS,
  EARNING_NAMES_KO,
  FORM_FIELD_IDS,
  PHRASE_IDS,
  QUEST_DAYS,
  TERM_IDS,
} from './ids';
import { detectLang, loadLang, saveLang } from './storage';
import { normalizeFor } from './normalize';
import type { ProgressStorage } from '../quest/progress';
import { TERMS } from '../glossary/glossary';
import { ARC_FORM_FIELDS } from '../forms/arcForm';
import { BASIC_PHRASES } from '../cards/phrases';
import { CONTACTS } from '../help/contacts';
import { QUESTS } from '../quest/quests';
import { SAMPLE_A, SAMPLE_B } from '../payroll/samples';
import { MANUAL_LABELS } from '../payroll/manual';

function memoryStorage(initial?: string): ProgressStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(LANG_KEY, initial);
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

const throwing: ProgressStorage = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('denied');
  },
  removeItem: () => {
    throw new Error('denied');
  },
};

describe('types', () => {
  it('LANGS 순서', () => {
    expect(LANGS).toEqual(['zh', 'vi', 'en', 'th', 'uz', 'ru']);
  });
  it('isLang', () => {
    expect(isLang('xx')).toBe(false);
    expect(isLang(undefined)).toBe(false);
    expect(isLang(1)).toBe(false);
    for (const l of LANGS) expect(isLang(l)).toBe(true);
  });
  it('uz 이름은 U+02BB, LANG_KEY·HTML_LANG', () => {
    expect(LANG_NATIVE.uz).toBe('Oʻzbekcha');
    expect(LANG_KEY).toBe('korea30.lang.v1');
    expect(HTML_LANG.zh).toBe('zh-Hans');
    expect(HTML_LANG.uz).toBe('uz-Latn');
  });
});

describe('storage', () => {
  it('저장값 xx → null', () => {
    expect(loadLang(memoryStorage('xx'))).toBeNull();
  });
  it('저장값 없음 → null', () => {
    expect(loadLang(memoryStorage())).toBeNull();
  });
  it('getItem 예외 → null', () => {
    expect(loadLang(throwing)).toBeNull();
  });
  it("저장값 'th' → 'th'", () => {
    expect(loadLang(memoryStorage('th'))).toBe('th');
  });
  it('saveLang 은 LANG_KEY 에 쓰고 예외를 삼킨다', () => {
    const s = memoryStorage();
    saveLang(s, 'ru');
    expect(s.map.get(LANG_KEY)).toBe('ru');
    expect(loadLang(s)).toBe('ru');
    expect(() => saveLang(throwing, 'en')).not.toThrow();
  });
});

describe('detectLang', () => {
  it.each([
    [['ru-RU'], 'ru'],
    [['fil-PH'], 'en'],
    [['tl'], 'en'],
    [['kk'], 'ru'],
    [['ky-KG'], 'ru'],
    [['tg'], 'ru'],
    [['ko-KR', 'zh-CN'], 'zh'],
    [['ko-KR'], null],
    [['VI'], 'vi'],
    [['th-TH'], 'th'],
    [['uz-Latn-UZ'], 'uz'],
    [['en-US', 'ru'], 'en'],
    [[], null],
  ] as const)('%j → %s', (langs, want) => {
    expect(detectLang(langs)).toBe(want);
  });
});

describe('normalizeFor', () => {
  it('uz: 아포스트로피 변형 모두 제거', () => {
    const a = normalizeFor('uz', 'Sugʻurta');
    expect(a).toBe('sugurta');
    expect(normalizeFor('uz', "sug'urta")).toBe(a);
    expect(normalizeFor('uz', 'sugurta')).toBe(a);
    expect(normalizeFor('uz', 'sug’urta')).toBe(a);
    expect(normalizeFor('uz', 'sug‘urta')).toBe(a);
    expect(normalizeFor('uz', 'sug`urta')).toBe(a);
    expect(normalizeFor('uz', 'sugʼurta')).toBe(a);
  });
  it('ru: ё→е, й 보존', () => {
    expect(normalizeFor('ru', 'Ёлка')).toBe('елка');
    expect(normalizeFor('ru', 'й')).toBe('й');
    expect(normalizeFor('ru', '  Пенсия   фонд ')).toBe('пенсия фонд');
  });
  it('zh·th: 공백·U+200B 제거', () => {
    expect(normalizeFor('zh', '保 险')).toBe('保险');
    expect(normalizeFor('th', 'ประกัน​สังคม')).toBe('ประกันสังคม');
    expect(normalizeFor('zh', 'ＡＢＣ')).toBe('abc');
  });
  it('en: 결합 부호 제거·소문자·공백 압축', () => {
    expect(normalizeFor('en', 'Café  Insurance ')).toBe('cafe insurance');
  });
  it('vi: normalizeVi 그대로', () => {
    expect(normalizeFor('vi', 'Bảo hiểm')).toBe('bao hiem');
    expect(normalizeFor('vi', 'Đóng')).toBe('dong');
  });
});

describe('ids 튜플 = 데이터', () => {
  it('QUEST_DAYS', () => {
    expect([...QUEST_DAYS]).toEqual(QUESTS.map((q) => q.day));
  });
  it('TERM_IDS', () => {
    expect([...TERM_IDS]).toEqual(TERMS.map((t) => t.id));
  });
  it('FORM_FIELD_IDS', () => {
    expect([...FORM_FIELD_IDS]).toEqual(ARC_FORM_FIELDS.map((f) => f.id));
  });
  it('PHRASE_IDS', () => {
    expect([...PHRASE_IDS]).toEqual(BASIC_PHRASES.map((p) => p.id));
  });
  it('CONTACT_IDS', () => {
    expect([...CONTACT_IDS]).toEqual(CONTACTS.map((c) => c.id));
  });
  it('EARNING_NAMES_KO 가 샘플·수기 라벨을 모두 포함', () => {
    const names: readonly string[] = EARNING_NAMES_KO;
    const needed = [
      ...SAMPLE_A.earnings.map((e) => e.nameKo),
      ...SAMPLE_B.earnings.map((e) => e.nameKo),
      MANUAL_LABELS.basePay.ko,
      MANUAL_LABELS.overtimePay.ko,
      MANUAL_LABELS.otherTaxable.ko,
      MANUAL_LABELS.nonTaxable.ko,
    ];
    for (const n of needed) expect(names).toContain(n);
  });
});
