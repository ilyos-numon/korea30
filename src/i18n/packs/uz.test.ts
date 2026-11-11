import { describe, expect, it } from 'vitest';
import { normalizeFor } from '../normalize';
import { collectStrings, forbiddenHits, packProblems, PRON_RULE, SEARCH_ANCHOR, TEXT_SCRIPT } from '../packCheck';
import { uz } from './uz';
import { vi } from './vi';

const all = collectStrings(uz);
const texts = all.filter((s) => s.kind === 'text');
const prons = all.filter((s) => s.kind === 'pron');

describe('uz 팩 (§4.8)', () => {
  it('packProblems 는 []', () => {
    expect(packProblems(uz)).toEqual([]);
  });

  it('forbiddenHits 는 []', () => {
    expect(forbiddenHits('uz', uz)).toEqual([]);
  });

  it('text 문자열 95% 이상이 라틴 문자를 포함한다', () => {
    const re = TEXT_SCRIPT.uz!;
    const ratio = texts.filter((s) => re.test(s.value)).length / texts.length;
    expect(ratio).toBeGreaterThanOrEqual(0.95);
  });

  it('모든 문자열에 키릴 문자가 0개', () => {
    expect(all.filter((s) => /[Ѐ-ӿ]/.test(s.value)).map((s) => s.path)).toEqual([]);
  });

  it('oʻ·gʻ 는 U+02BB 만 쓴다 (ASCII·다른 따옴표 없음)', () => {
    const bad = all.filter((s) => /[oOgG]['‘’`ʼ]/.test(s.value)).map((s) => s.path);
    expect(bad).toEqual([]);
  });

  it('발음 42개가 모두 PRON_RULE 을 통과한다', () => {
    expect(prons).toHaveLength(42);
    expect(prons.filter((s) => !PRON_RULE.uz(s.value)).map((s) => s.path)).toEqual([]);
  });

  it('SEARCH_ANCHOR 가 health·employment 이름에 들어 있다', () => {
    const anchor = normalizeFor('uz', SEARCH_ANCHOR.uz);
    expect(normalizeFor('uz', uz.content.terms.health.name)).toContain(anchor);
    expect(normalizeFor('uz', uz.content.terms.employment.name)).toContain(anchor);
  });

  it('탭 이름은 12자 이하', () => {
    for (const t of Object.values(uz.ui.tabs)) expect(Array.from(t).length).toBeLessThanOrEqual(12);
  });

  it('vi 팩과 같은 text 값 비율 ≤ 0.05 (스텁 아님)', () => {
    expect(uz).not.toBe(vi);
    const viByPath = new Map(collectStrings(vi).map((s) => [s.path, s.value]));
    const same = texts.filter((s) => viByPath.get(s.path) === s.value).length;
    expect(same / texts.length).toBeLessThanOrEqual(0.05);
  });

  it('함수형 키는 숫자를 그대로 넣는다', () => {
    const p = uz.ui.questProgress(3, 10);
    expect(p).toContain('3');
    expect(p).toContain('10');
    expect(uz.ui.questDay(7)).toContain('7');
    expect(uz.ui.glossaryCount(12)).toContain('12');
  });

  it('국가별 변형: b4·8일 문장·서류 안내가 우즈베크 기준', () => {
    expect(uz.content.phrases.b4.meaning).toContain('Oʻzbek');
    expect(uz.content.quests[8].sayMeaning).toContain('Oʻzbekiston');
    expect(uz.content.form['address-home'].label).toContain('Oʻzbekiston');
    expect(uz.content.form['address-home'].guide).toContain('Oʻzbekiston');
    expect(uz.content.form.birth.guide).toContain('kun.oy.yil');
    expect(uz.content.form.nationality.guide).toContain('UZBEKISTAN');
  });
});
