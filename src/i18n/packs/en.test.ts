import { describe, expect, it } from 'vitest';
import { normalizeFor } from '../normalize';
import {
  PRON_RULE,
  SEARCH_ANCHOR,
  TEXT_SCRIPT,
  collectStrings,
  forbiddenHits,
  packProblems,
} from '../packCheck';
import { en } from './en';
import { vi } from './vi';

describe('en pack (§4.8)', () => {
  const strings = collectStrings(en);
  const texts = strings.filter((s) => s.kind === 'text');
  const prons = strings.filter((s) => s.kind === 'pron');

  it('has no structural problems', () => {
    expect(packProblems(en)).toEqual([]);
  });

  it('has no forbidden judgement words', () => {
    expect(forbiddenHits('en', en)).toEqual([]);
  });

  it('text strings are written in Latin script (>= 95%)', () => {
    const re = TEXT_SCRIPT.en!;
    const misses = texts.filter((s) => !re.test(s.value)).map((s) => s.path);
    expect(texts.length).toBeGreaterThan(0);
    expect((texts.length - misses.length) / texts.length).toBeGreaterThanOrEqual(0.95);
  });

  it('all 42 pronunciations follow the hyphenated romanization rule', () => {
    expect(prons).toHaveLength(42);
    const bad = prons.filter((s) => !PRON_RULE.en(s.value)).map((s) => `${s.path}: ${s.value}`);
    expect(bad).toEqual([]);
  });

  it('search anchor appears in health and employment term names', () => {
    const anchor = normalizeFor('en', SEARCH_ANCHOR.en);
    expect(normalizeFor('en', en.content.terms.health.name)).toContain(anchor);
    expect(normalizeFor('en', en.content.terms.employment.name)).toContain(anchor);
  });

  it('tab labels are 12 characters or fewer', () => {
    for (const label of Object.values(en.ui.tabs)) {
      expect(Array.from(label).length).toBeLessThanOrEqual(12);
    }
  });

  it('is not a stub of the vi pack (same text <= 5%)', () => {
    const viByPath = new Map(collectStrings(vi).map((s) => [s.path, s.value]));
    const same = texts.filter((s) => viByPath.get(s.path) === s.value);
    expect(same.length / texts.length).toBeLessThanOrEqual(0.05);
  });

  it('function keys keep the numbers', () => {
    const p = en.ui.questProgress(3, 10);
    expect(p).toContain('3');
    expect(p).toContain('10');
  });

  it('uses the en local variant for interpreter, remittance and form guides (§4.6)', () => {
    expect(en.content.phrases.b4.meaning.toLowerCase()).toContain('english');
    expect(en.content.phrases.b4.pron).toContain('yeong-eo');
    expect(en.content.quests[8].sayPron).toContain('go-hyang');
    expect(en.content.quests[8].sayMeaning.toLowerCase()).not.toContain('vietnam');
    for (const s of strings) expect(s.value.toLowerCase()).not.toContain('vietnam');
  });
});
