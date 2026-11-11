import { describe, expect, it } from 'vitest';
import { CONTACTS } from './contacts';

const EXPECTED: ReadonlyArray<[string, string, string]> = [
  ['police', '112', '경찰'],
  ['fire', '119', '소방·구급'],
  ['immigration', '1345', '외국인종합안내센터'],
  ['labor', '1350', '고용노동부 고객상담센터'],
  ['migrant', '1577-0071', '외국인력상담센터'],
  ['legal', '132', '대한법률구조공단'],
  ['health', '1577-1000', '국민건강보험공단'],
  ['pension', '1355', '국민연금공단'],
  ['disease', '1339', '질병관리청 콜센터'],
];

describe('CONTACTS', () => {
  it('has nine contacts in table order', () => {
    expect(CONTACTS).toHaveLength(9);
    expect(CONTACTS.map((c) => [c.id, c.number, c.nameKo])).toEqual(EXPECTED);
  });

  it('tel is digits of number', () => {
    for (const c of CONTACTS) {
      expect(c.tel).toBe(c.number.replace(/\D/g, ''));
      expect(c.tel).toMatch(/^\d+$/);
    }
    expect(CONTACTS.find((c) => c.id === 'migrant')?.tel).toBe('15770071');
  });

  it('first two are emergency and only those', () => {
    expect(CONTACTS.filter((c) => c.emergency).map((c) => c.id)).toEqual(['police', 'fire']);
    expect(CONTACTS[0].emergency && CONTACTS[1].emergency).toBe(true);
  });

  it('only migrant is unverified', () => {
    expect(CONTACTS.filter((c) => !c.verified).map((c) => c.id)).toEqual(['migrant']);
  });

  it('vietnamese lines are immigration and migrant', () => {
    expect(CONTACTS.filter((c) => c.vietnamese).map((c) => c.id)).toEqual(['immigration', 'migrant']);
  });

  it('only immigration has sayKo', () => {
    expect(CONTACTS.filter((c) => c.sayKo).map((c) => c.id)).toEqual(['immigration']);
    expect(CONTACTS.find((c) => c.id === 'immigration')?.sayKo).toBe('베트남어 상담 부탁드립니다.');
  });

  it('all text fields are filled and free of forbidden words', () => {
    for (const c of CONTACTS) {
      for (const s of [c.nameKo, c.nameVi, c.whenKo, c.whenVi]) {
        expect(s.trim().length).toBeGreaterThan(0);
        expect(s).not.toMatch(/틀렸|잘못|위반|불법/);
      }
    }
  });
});
