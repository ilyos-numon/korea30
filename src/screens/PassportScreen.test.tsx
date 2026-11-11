import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { PassportScreen } from './PassportScreen';
import { LangContext, langValue } from '../i18n/LangContext';
import type { Lang } from '../i18n/types';
import { FORM_FIELD_IDS } from '../i18n/ids';
import { PASSPORT_PACKS } from '../passport/i18n';
import { ko } from '../passport/i18n/ko';
import { en } from '../passport/i18n/en';

const NOW = new Date(2026, 9, 27); // 2026-10-27
// ICAO Doc 9303 Part 4 TD3 specimen
const SPECIMEN = 'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C36UTO7408122F1204159ZE184226B<<<<<10';
// 생년월일 검증 숫자(2 → 3)를 틀리게
const BAD_CHECK = 'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C36UTO7408123F1204159ZE184226B<<<<<10';

function render(el: ReactElement, lang: Lang = 'en'): string {
  return renderToString(<LangContext.Provider value={langValue(lang)}>{el}</LangContext.Provider>);
}

function inputValue(html: string, testId: string): string | null {
  const tag = html.match(new RegExp(`<input[^>]*data-testid="${testId}"[^>]*>`))?.[0];
  if (!tag) return null;
  return tag.match(/value="([^"]*)"/)?.[1] ?? '';
}

describe('PassportScreen', () => {
  it('renders the privacy notice and every contract testid', () => {
    const html = render(<PassportScreen now={NOW} />);
    for (const id of [
      'screen-passport', 'passport-privacy', 'passport-file', 'passport-mrz-text', 'passport-parse', 'passport-pdf',
      'passport-extra-addressKr', 'passport-extra-phone', 'passport-extra-addressHome', 'passport-extra-workplace',
      'passport-extra-passportIssueDate',
      ...FORM_FIELD_IDS.map((f) => `passport-field-${f}`),
    ]) {
      expect(html).toContain(`data-testid="${id}"`);
    }
    expect(html).toMatch(/<input[^>]*type="file"[^>]*accept="image\/\*"[^>]*capture="environment"/);
    expect(html).toContain(en.privacyBody);
    // 처음에는 진행률·오류가 없다
    expect(html).not.toContain('data-testid="passport-progress"');
    expect(html).not.toContain('data-testid="passport-error"');
  });

  it('keeps Korean only where it matches the paper form (field labels) and the official notice', () => {
    const html = render(<PassportScreen now={NOW} />, 'vi');
    expect(html).toContain(`<span lang="ko" class="passport-cell-ko">성</span>`);
    expect(html).toContain(ko.officialNotice);
    expect(html).toContain(`<span lang="ko">${ko.privacyBody}</span>`);
    expect(html).not.toContain(`<span lang="ko">${ko.title}</span>`);
    expect(html).toMatch(/<a[^>]*href="tel:1345"/);
  });

  it('fills the 13 form fields from the specimen MRZ', () => {
    const html = render(<PassportScreen now={NOW} initialMrz={SPECIMEN} />);
    expect(inputValue(html, 'passport-field-apply-type')).toBe('외국인 등록');
    expect(inputValue(html, 'passport-field-surname')).toBe('ERIKSSON');
    expect(inputValue(html, 'passport-field-given-names')).toBe('ANNA MARIA');
    expect(inputValue(html, 'passport-field-birth')).toBe('1974.08.12');
    expect(inputValue(html, 'passport-field-sex')).toBe('여(F)');
    expect(inputValue(html, 'passport-field-nationality')).toBe('유토피아(견본)');
    expect(inputValue(html, 'passport-field-passport-no')).toBe('L898902C3');
    expect(inputValue(html, 'passport-field-passport-dates')).toContain('만료 2012.04.15');
    expect(inputValue(html, 'passport-field-sign')).toBe('');
    expect(html).not.toContain('data-testid="passport-error"');
    expect(html).toContain(en.parsed);
  });

  it('shows a checksum error but keeps the read values editable', () => {
    const html = render(<PassportScreen now={NOW} initialMrz={BAD_CHECK} />);
    expect(html).toMatch(/data-testid="passport-error"[^>]*data-error="checksum"/);
    expect(html).toContain(en.errChecksum);
    expect(html).toContain(ko.errChecksum);
    expect(inputValue(html, 'passport-field-surname')).toBe('ERIKSSON');
  });

  it('reports non-passport text as an error with empty fields', () => {
    const html = render(<PassportScreen now={NOW} initialMrz={'hello world'} />);
    expect(html).toContain('data-testid="passport-error"');
    expect(inputValue(html, 'passport-field-surname')).toBe('');
    expect(inputValue(html, 'passport-field-sex')).toBe('');
  });

  it('uses English strings when lang is en', () => {
    const html = render(<PassportScreen now={NOW} />, 'en');
    expect(html).toContain(en.title);
    expect(html).toContain(en.choosePhoto);
    expect(html).toContain(en.parse);
    expect(html).toContain(en.pdf);
    expect(html).toContain(en.fieldLabel('passport-no'));
  });

  it('string packs: same keys, no empty values, functions handle unknown args', () => {
    const packs = [PASSPORT_PACKS.ko, PASSPORT_PACKS.en];
    const keys = Object.keys(en).sort();
    for (const pack of packs) {
      expect(Object.keys(pack).sort()).toEqual(keys);
      for (const [k, v] of Object.entries(pack)) {
        const out = typeof v === 'function' ? (v as (...a: (number | string)[]) => string)(3, '2026-10-27') : v;
        expect(out, k).toBeTypeOf('string');
        expect((out as string).trim(), k).not.toBe('');
      }
    }
  });
});
