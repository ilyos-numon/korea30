import { describe, expect, it } from 'vitest';
import { contactViews, phraseViews } from './content';
import { LOCAL } from './local';
import { PACKS } from './packs';
import { collectStrings, forbiddenHits, packProblems, SEARCH_ANCHOR } from './packCheck';
import { searchTermViews } from './search';
import { LANGS, type Lang } from './types';

const NON_VI = LANGS.filter((l) => l !== 'vi');

describe('language integrity', () => {
  it.each(LANGS)('%s: packProblems is empty', (l) => {
    expect(packProblems(PACKS[l])).toEqual([]);
  });

  it.each(LANGS)('%s: no forbidden judgement words', (l) => {
    expect(forbiddenHits(l, PACKS[l])).toEqual([]);
  });

  it.each(NON_VI)('%s: not a vi stub (same path+value <= 5%)', (l) => {
    const vi = new Map(collectStrings(PACKS.vi).map((s) => [s.path, s.value]));
    const own = collectStrings(PACKS[l]);
    const same = own.filter((s) => vi.get(s.path) === s.value);
    expect(own.length).toBeGreaterThan(0);
    expect(same.length / own.length).toBeLessThanOrEqual(0.05);
  });

  it.each(LANGS)('%s: anchor search hits health in a small result set', (l) => {
    const r = searchTermViews(l as Lang, SEARCH_ANCHOR[l]);
    expect(r.map((v) => v.id)).toContain('health');
    expect(r.length).toBeLessThan(40);
  });

  it.each(LANGS)('%s: phraseViews has 42 entries and b4.ko = interpreterKo', (l) => {
    const v = phraseViews(l);
    expect(v).toHaveLength(42);
    expect(v.find((p) => p.id === 'b4')?.ko).toBe(LOCAL[l].interpreterKo);
  });

  it.each(LANGS)('%s: contactViews has 9 entries and immigration is native', (l) => {
    const v = contactViews(l);
    expect(v).toHaveLength(9);
    expect(v.find((c) => c.id === 'immigration')?.native).toBe(true);
  });

  it.each(["sug'urta", 'sugurta', 'sugʻurta'])('uz: apostrophe variant %s gives same results', (q) => {
    const base = searchTermViews('uz', 'sugʻurta').map((v) => v.id);
    expect(base.length).toBeGreaterThan(0);
    expect(searchTermViews('uz', q).map((v) => v.id)).toEqual(base);
  });
});
