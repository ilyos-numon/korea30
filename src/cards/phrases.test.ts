import { describe, expect, it } from 'vitest';
import { QUESTS } from '../quest/quests';
import { BASIC_PHRASES, CATEGORY_LABEL, allPhrases } from './phrases';

const EXPECTED_BASIC: ReadonlyArray<[string, string, string]> = [
  ['b1', 'counter', '한국어를 잘 못해요. 천천히 말해 주세요.'],
  ['b2', 'counter', '다시 한 번 말해 주세요.'],
  ['b3', 'counter', '여기에 써 주세요.'],
  ['b4', 'counter', '베트남어 통역이 가능한가요?'],
  ['b5', 'counter', '이 서류는 어디에 내요?'],
  ['b6', 'counter', '무엇을 더 가져와야 해요?'],
  ['b7', 'counter', '이 칸에는 무엇을 써야 해요?'],
  ['b8', 'counter', '언제 다시 오면 돼요?'],
  ['b9', 'daily', '이거 얼마예요?'],
  ['b10', 'daily', '화장실이 어디예요?'],
  ['b11', 'daily', '여기가 아파요.'],
  ['b12', 'daily', '도와주셔서 감사합니다.'],
];

describe('BASIC_PHRASES', () => {
  it('matches the 12 contract phrases in order', () => {
    expect(BASIC_PHRASES.map((p) => [p.id, p.category, p.ko])).toEqual(EXPECTED_BASIC);
  });
});

describe('CATEGORY_LABEL', () => {
  it('has bilingual labels for the three categories', () => {
    expect(CATEGORY_LABEL.counter).toEqual({ vi: 'Ở quầy', ko: '창구에서' });
    expect(CATEGORY_LABEL.daily).toEqual({ vi: 'Hằng ngày', ko: '일상' });
    expect(CATEGORY_LABEL.quest).toEqual({ vi: 'Theo nhiệm vụ', ko: '퀘스트 문장' });
  });
});

describe('allPhrases', () => {
  const all = allPhrases();

  it('returns 42 phrases with unique ids', () => {
    expect(all).toHaveLength(42);
    expect(new Set(all.map((p) => p.id)).size).toBe(42);
  });

  it('builds q1..q30 from QUESTS say', () => {
    for (const q of QUESTS) {
      const p = all.find((x) => x.id === `q${q.day}`);
      expect(p).toBeDefined();
      expect(p?.category).toBe('quest');
      expect(p?.ko).toBe(q.say.ko);
      expect(p?.vi).toBe(q.say.viMeaning);
      expect(p?.viPron).toBe(q.say.viPron);
    }
    expect(all.filter((p) => p.category === 'quest')).toHaveLength(QUESTS.length);
  });

  it('has non-empty vi and viPron for every phrase', () => {
    for (const p of all) {
      expect(p.vi.trim().length).toBeGreaterThan(0);
      expect(p.viPron.trim().length).toBeGreaterThan(0);
    }
  });

  it('contains no forbidden word in any ko text', () => {
    for (const p of all) {
      for (const w of ['잘못', '틀렸', '위반', '불법']) {
        expect(p.ko).not.toContain(w);
      }
    }
  });
});
