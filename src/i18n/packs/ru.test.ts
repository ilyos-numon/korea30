import { describe, expect, it } from 'vitest';
import { normalizeFor } from '../normalize';
import { collectStrings, forbiddenHits, packProblems, PRON_RULE, SEARCH_ANCHOR, TEXT_SCRIPT } from '../packCheck';
import { ru } from './ru';
import { vi } from './vi';

describe('ru 팩 (§4.8)', () => {
  const strings = collectStrings(ru);
  const texts = strings.filter((s) => s.kind === 'text');
  const prons = strings.filter((s) => s.kind === 'pron');

  it('packProblems 는 []', () => {
    expect(packProblems(ru)).toEqual([]);
  });

  it('금지어가 없다', () => {
    expect(forbiddenHits('ru', ru)).toEqual([]);
  });

  it('text 문자열의 95% 이상이 키릴 문자를 포함한다', () => {
    const script = TEXT_SCRIPT.ru!;
    const misses = texts.filter((s) => !script.test(s.value));
    expect(texts.length).toBe(collectStrings(vi).filter((s) => s.kind === 'text').length);
    expect(1 - misses.length / texts.length).toBeGreaterThanOrEqual(0.95);
  });

  it('발음 42개가 모두 PRON_RULE 을 통과한다', () => {
    expect(prons).toHaveLength(42);
    const bad = prons.filter((p) => !PRON_RULE.ru(p.value)).map((p) => p.path);
    expect(bad).toEqual([]);
  });

  it('검색 앵커가 health·employment 이름에 있다', () => {
    const anchor = normalizeFor('ru', SEARCH_ANCHOR.ru);
    expect(normalizeFor('ru', ru.content.terms.health.name)).toContain(anchor);
    expect(normalizeFor('ru', ru.content.terms.employment.name)).toContain(anchor);
  });

  it('탭 라벨은 12자 이하', () => {
    for (const s of Object.values(ru.ui.tabs)) expect(Array.from(s).length).toBeLessThanOrEqual(12);
  });

  it('vi 와 같은 text 값 비율이 5% 이하 (스텁 아님)', () => {
    const viByPath = new Map(collectStrings(vi).map((s) => [s.path, s.value]));
    const same = texts.filter((s) => viByPath.get(s.path) === s.value);
    expect(ru).not.toBe(vi);
    expect(same.length / texts.length).toBeLessThanOrEqual(0.05);
  });

  it('함수형 키는 숫자를 그대로 넣는다', () => {
    const p = ru.ui.questProgress(3, 10);
    expect(p).toContain('3');
    expect(p).toContain('10');
    expect(ru.ui.glossaryCount(12)).toContain('12');
  });
});
