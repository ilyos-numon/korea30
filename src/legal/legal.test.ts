import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ALL_LEGAL, anyUnverified, legalEntry, legalNumber, legalText } from './index';
import { LegalBadge } from './LegalBadge';
import { LEGAL_BADGE_STRINGS } from './i18n';
import type { LegalId, StayLawId, WageLawId } from './types';
import { LangContext, langValue } from '../i18n/LangContext';
import { LANGS } from '../i18n/types';

const WAGE_IDS: readonly WageLawId[] = [
  'minWageHourly2026', 'overtimePremiumPpm', 'nightPremiumPpm', 'holidayPremiumWithin8Ppm',
  'holidayPremiumOver8Ppm', 'dailyRegularMinutes', 'weeklyRegularMinutes', 'nightStart', 'nightEnd',
  'premiumMinWorkers', 'wageClaimYears',
];
const STAY_IDS: readonly StayLawId[] = [
  'arcRegistrationDays', 'addressChangeReportDays', 'extensionOpensMonthsBefore',
  'jobChangeApplyMonths', 'arcLateFineMaxWon', 'addressLateFineMaxWon', 'overstayNote',
];
const ALL_IDS: readonly LegalId[] = [...WAGE_IDS, ...STAY_IDS];
const TEXT_IDS: readonly LegalId[] = ['nightStart', 'nightEnd', 'overstayNote'];

describe('legal data', () => {
  it('has exactly one entry per id', () => {
    expect(ALL_LEGAL).toHaveLength(ALL_IDS.length);
    const ids = ALL_LEGAL.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ALL_IDS) expect(ids).toContain(id);
  });

  it('every entry has source fields and an https url', () => {
    for (const e of ALL_LEGAL) {
      expect(e.labelKo.trim(), e.id).not.toBe('');
      expect(e.source.law.trim(), e.id).not.toBe('');
      expect(e.source.article.trim(), e.id).not.toBe('');
      const url = new URL(e.source.url);
      expect(url.protocol, e.id).toBe('https:');
      expect(e.status === 'verified' || e.status === 'unverified', e.id).toBe(true);
      if (e.status === 'verified') expect(e.source.checkedOn, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      else expect(e.source.checkedOn === null || /^\d{4}-\d{2}-\d{2}$/.test(e.source.checkedOn), e.id).toBe(true);
    }
  });

  it('numeric entries are finite numbers, text entries are non-empty strings with unit time', () => {
    for (const e of ALL_LEGAL) {
      if (TEXT_IDS.includes(e.id)) {
        expect(typeof e.value, e.id).toBe('string');
        expect(e.unit, e.id).toBe('time');
        expect(String(e.value).trim(), e.id).not.toBe('');
      } else {
        expect(typeof e.value, e.id).toBe('number');
        expect(Number.isFinite(e.value), e.id).toBe(true);
      }
    }
    expect(legalText('nightStart')).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    expect(legalText('nightEnd')).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
  });

  it('legalNumber throws for string entries; legalText throws for number entries', () => {
    for (const id of TEXT_IDS) expect(() => legalNumber(id)).toThrow();
    for (const id of ALL_IDS.filter((x) => !TEXT_IDS.includes(x))) {
      expect(legalNumber(id)).toBe(legalEntry(id).value);
      expect(() => legalText(id)).toThrow();
    }
  });

  it('anyUnverified reflects status', () => {
    expect(anyUnverified([])).toBe(false);
    expect(anyUnverified(ALL_IDS)).toBe(ALL_LEGAL.some((e) => e.status === 'unverified'));
    for (const id of ALL_IDS) expect(anyUnverified([id])).toBe(legalEntry(id).status === 'unverified');
  });
});

describe('LegalBadge', () => {
  const unverified = ALL_LEGAL.filter((e) => e.status === 'unverified').map((e) => e.id);

  it('has badge strings for ko and all 6 langs, no judgement wording', () => {
    for (const k of ['ko', ...LANGS] as const) {
      const s = LEGAL_BADGE_STRINGS[k];
      expect(s.label.trim(), k).not.toBe('');
      expect(s.hint.trim(), k).not.toBe('');
    }
    expect(LEGAL_BADGE_STRINGS.ko.label).toBe('공식 대조 전');
    const koAll = `${LEGAL_BADGE_STRINGS.ko.label} ${LEGAL_BADGE_STRINGS.ko.hint}`;
    for (const bad of ['위법', '불법', '체불']) expect(koAll).not.toContain(bad);
  });

  it('renders null for empty ids', () => {
    expect(renderToString(createElement(LegalBadge, { ids: [] }))).toBe('');
  });

  it('renders badge (lang + korean text) iff any id is unverified', () => {
    const verified = ALL_LEGAL.filter((e) => e.status === 'verified').map((e) => e.id);
    if (verified.length > 0) expect(renderToString(createElement(LegalBadge, { ids: verified }))).toBe('');
    for (const lang of LANGS) {
      const html = renderToString(
        createElement(LangContext.Provider, { value: langValue(lang) }, createElement(LegalBadge, { ids: ALL_IDS })),
      );
      if (unverified.length === 0) {
        expect(html).toBe('');
        continue;
      }
      expect(html).toContain('data-testid="legal-badge"');
      expect(html).toContain('lang="ko"');
      expect(html).toContain(LEGAL_BADGE_STRINGS.ko.label);
      expect(html).toContain(LEGAL_BADGE_STRINGS[lang].label.replace(/'/g, '&#x27;'));
    }
  });
});
