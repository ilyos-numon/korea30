import { describe, expect, it } from 'vitest';
import { normalizeFor } from '../normalize';
import { collectStrings, forbiddenHits, packProblems, PRON_RULE, SEARCH_ANCHOR, TEXT_SCRIPT } from '../packCheck';
import { th } from './th';
import { vi } from './vi';

describe('th 팩 (§4.8)', () => {
  const strings = collectStrings(th);
  const texts = strings.filter((s) => s.kind === 'text');
  const prons = strings.filter((s) => s.kind === 'pron');

  it('packProblems 는 []', () => {
    expect(packProblems(th)).toEqual([]);
  });

  it('금지어가 없다', () => {
    expect(forbiddenHits('th', th)).toEqual([]);
  });

  it('text 문자열 95% 이상이 태국 문자를 포함한다', () => {
    const re = TEXT_SCRIPT.th!;
    const misses = texts.filter((s) => !re.test(s.value));
    expect(texts.length).toBeGreaterThan(0);
    expect(1 - misses.length / texts.length, JSON.stringify(misses.map((m) => m.path))).toBeGreaterThanOrEqual(
      0.95,
    );
  });

  it('발음 42개가 모두 PRON_RULE 을 통과한다', () => {
    expect(prons).toHaveLength(42);
    const bad = prons.filter((s) => !PRON_RULE.th(s.value)).map((s) => s.path);
    expect(bad).toEqual([]);
  });

  it('검색 앵커가 건강보험·고용보험 이름에 있다', () => {
    const anchor = normalizeFor('th', SEARCH_ANCHOR.th);
    expect(normalizeFor('th', th.content.terms.health.name)).toContain(anchor);
    expect(normalizeFor('th', th.content.terms.employment.name)).toContain(anchor);
  });

  it('탭 라벨은 12자 이하', () => {
    for (const s of Object.values(th.ui.tabs)) expect(Array.from(s).length).toBeLessThanOrEqual(12);
  });

  it('vi 와 같은 값 비율 5% 이하 (스텁 아님)', () => {
    const viByPath = new Map(collectStrings(vi).map((s) => [s.path, s.value]));
    const same = texts.filter((s) => viByPath.get(s.path) === s.value);
    expect(same.length / texts.length).toBeLessThanOrEqual(0.05);
  });

  it('함수형 키는 숫자를 그대로 넣는다', () => {
    const p = th.ui.questProgress(3, 10);
    expect(p).toContain('3');
    expect(p).toContain('10');
    expect(th.ui.questDotsAria(3, 10)).toContain('10');
    expect(th.ui.glossaryCount(12)).toContain('12');
    expect(th.ui.questDay(7)).toContain('7');
  });

  it('국가별 변형(§4.6)을 번역한다', () => {
    expect(th.content.phrases.b4.meaning).toContain('ภาษาไทย');
    expect(th.content.phrases.b4.pron).toContain('แทกุก');
    expect(th.content.quests[8].sayMeaning).toContain('ไทย');
    expect(th.content.quests[8].sayPron).toContain('แทกุก');
    expect(th.content.form.birth.guide).toContain('พ.ศ.');
    expect(th.content.form.birth.guide).toContain('ค.ศ.');
    expect(th.content.form['address-home'].label).toContain('ไทย');
    expect(th.content.form['address-home'].guide).toContain('ไทย');
  });
});
