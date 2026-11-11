import { describe, expect, it } from 'vitest';
import { normalizeFor } from '../normalize';
import { collectStrings, forbiddenHits, packProblems, PRON_RULE, SEARCH_ANCHOR, TEXT_SCRIPT } from '../packCheck';
import { vi } from './vi';
import { zh } from './zh';

describe('zh 팩 (§4.8)', () => {
  const strings = collectStrings(zh);
  const texts = strings.filter((s) => s.kind === 'text');
  const prons = strings.filter((s) => s.kind === 'pron');

  it('packProblems 는 []', () => {
    expect(packProblems(zh)).toEqual([]);
  });

  it('금지어가 없다', () => {
    expect(forbiddenHits('zh', zh)).toEqual([]);
  });

  it('text 문자열의 95% 이상이 한자를 포함한다', () => {
    const re = TEXT_SCRIPT.zh!;
    const misses = texts.filter((s) => !re.test(s.value)).map((s) => s.path);
    expect((texts.length - misses.length) / texts.length, misses.join(', ')).toBeGreaterThanOrEqual(0.95);
  });

  it('발음 42개가 모두 PRON_RULE 을 통과한다', () => {
    expect(prons).toHaveLength(42);
    const bad = prons.filter((s) => !PRON_RULE.zh(s.value)).map((s) => `${s.path}=${s.value}`);
    expect(bad).toEqual([]);
  });

  it('SEARCH_ANCHOR 가 health·employment 이름에 들어 있다', () => {
    const anchor = normalizeFor('zh', SEARCH_ANCHOR.zh);
    expect(normalizeFor('zh', zh.content.terms.health.name)).toContain(anchor);
    expect(normalizeFor('zh', zh.content.terms.employment.name)).toContain(anchor);
  });

  it('탭 라벨은 12자 이하', () => {
    for (const t of Object.values(zh.ui.tabs)) expect(Array.from(t).length).toBeLessThanOrEqual(12);
  });

  it('vi 와 같은 text 값 비율이 5% 이하 (스텁 아님)', () => {
    expect(zh).not.toBe(vi);
    const viByPath = new Map(collectStrings(vi).map((s) => [s.path, s.value]));
    const same = texts.filter((s) => viByPath.get(s.path) === s.value).map((s) => s.path);
    expect(same.length / texts.length, same.join(', ')).toBeLessThanOrEqual(0.05);
  });

  it('함수형 키는 숫자를 그대로 넣는다', () => {
    const p = zh.ui.questProgress(3, 10);
    expect(p).toContain('3');
    expect(p).toContain('10');
    expect(zh.ui.glossaryCount(12)).toContain('12');
    expect(zh.ui.questDay(7)).toContain('7');
  });

  it('국가별 변형: 통역·송금 문장은 중국 기준', () => {
    expect(zh.content.phrases.b4.meaning).toContain('中文');
    expect(zh.content.quests[8].sayMeaning).toContain('中国');
    expect(zh.content.form['address-home'].label).toContain('中国');
  });
});
