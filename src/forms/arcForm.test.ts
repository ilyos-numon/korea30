import { describe, expect, it } from 'vitest';
import { ARC_FORM_FIELDS, ARC_FORM_TITLE, CIRCLED } from './arcForm';

const IDS = [
  'apply-type',
  'surname',
  'given-names',
  'birth',
  'sex',
  'nationality',
  'passport-no',
  'passport-dates',
  'address-kr',
  'phone',
  'address-home',
  'workplace',
  'sign',
];

describe('arcForm', () => {
  it('has a Korean title for the sample form', () => {
    expect(ARC_FORM_TITLE.ko).toBe('외국인등록 신청서 (가상 샘플)');
    expect(ARC_FORM_TITLE.vi.length).toBeGreaterThan(0);
  });

  it('has 13 fields numbered 1..13 in order', () => {
    expect(ARC_FORM_FIELDS).toHaveLength(13);
    ARC_FORM_FIELDS.forEach((f, i) => expect(f.no).toBe(i + 1));
  });

  it('field ids match the contract table', () => {
    expect(ARC_FORM_FIELDS.map((f) => f.id)).toEqual(IDS);
  });

  it('every field has labels, guide vi/ko and example', () => {
    for (const f of ARC_FORM_FIELDS) {
      expect(f.labelKo.length).toBeGreaterThan(0);
      expect(f.labelVi.length).toBeGreaterThan(0);
      expect(f.guide.vi.length).toBeGreaterThan(0);
      expect(f.guide.ko.length).toBeGreaterThan(0);
      expect(f.example.length).toBeGreaterThan(0);
      expect([1, 2]).toContain(f.span);
    }
  });

  it('only field 1 asks the officer', () => {
    expect(ARC_FORM_FIELDS.filter((f) => f.askOfficer).map((f) => f.no)).toEqual([1]);
  });

  it('field 9 is the address in Korea', () => {
    expect(ARC_FORM_FIELDS[8].labelKo).toBe('대한민국 내 주소 (체류지)');
  });

  it('CIRCLED has 13 numbers from ① to ⑬', () => {
    expect(CIRCLED).toHaveLength(13);
    expect(CIRCLED[0]).toBe('①');
    expect(CIRCLED[8]).toBe('⑨');
    expect(CIRCLED[12]).toBe('⑬');
    CIRCLED.forEach((c, i) => expect(c.codePointAt(0)).toBe(0x2460 + i));
  });

  it('contains no judgement words', () => {
    const text = JSON.stringify(ARC_FORM_FIELDS);
    expect(text).not.toMatch(/틀렸|잘못|위반|불법/);
  });
});
