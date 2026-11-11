import { describe, expect, it } from 'vitest';
import { BASIC_PHRASES } from '../cards/phrases';
import { phraseViews } from '../i18n/content';
import { QUEST_DAYS_21_30 } from '../i18n/ids';
import { LOCAL } from '../i18n/local';
import { QUEST_TEXT_11_20, type PackLang } from '../i18n/packs/quests11to20';
import { QUEST_TEXT_21_30 } from '../i18n/packs/quests21to30';
import { LANGS, type Lang } from '../i18n/types';
import { questDayProblems } from './contentRules';
import { DAYS_11_20 } from './days11to20';
import { DAYS_21_30 } from './days21to30';
import { QUESTS } from './quests';

const OLD = QUESTS.filter((q) => q.day <= 10);
const takenSayKo = [
  ...OLD.map((q) => q.say.ko),
  ...BASIC_PHRASES.map((p) => p.ko),
  ...LANGS.map((l) => LOCAL[l].remitKo),
  ...LANGS.map((l) => LOCAL[l].interpreterKo),
  ...DAYS_11_20.map((d) => d.say.ko),
];
const isOld = (id: string) => !/^q\d+$/.test(id) || Number(id.slice(1)) <= 10;
const meaning11to20 = (l: Lang): string[] =>
  l === 'vi'
    ? DAYS_11_20.map((d) => d.say.viMeaning)
    : Object.values(QUEST_TEXT_11_20[l as PackLang]).map((t) => t.sayMeaning);
const takenMeaning = Object.fromEntries(
  LANGS.map((l) => [
    l,
    [...phraseViews(l).filter((p) => isOld(p.id)).map((p) => p.meaning), ...meaning11to20(l)],
  ]),
) as Record<Lang, string[]>;

describe('DAYS_21_30', () => {
  it('passes the quest content rules', () => {
    expect(
      questDayProblems({
        days: DAYS_21_30,
        expectedDays: QUEST_DAYS_21_30,
        texts: QUEST_TEXT_21_30,
        takenSayKo,
        takenMeaning,
      }),
    ).toEqual([]);
  });

  it('title.ko matches the plan table', () => {
    expect(DAYS_21_30.map((d) => d.title.ko)).toEqual([
      '우체국에서 국제 택배 보내기',
      '아플 때 회사에 알리기',
      '일하다 다쳤을 때 알아두기',
      '밤·연장 근무 알아두기',
      '출입국 방문 예약하기',
      '여권·등록증을 잃어버렸을 때',
      '소득세·연말정산 알아보기',
      '기숙사·집 생활 규칙 확인하기',
      '무료 한국어 수업 찾기',
      '첫 한 달 기록 백업하기',
    ]);
  });

  it('say.ko matches the plan table', () => {
    expect(DAYS_21_30.map((d) => d.say.ko)).toEqual([
      '국제 택배를 보내고 싶어요. 얼마나 걸려요?',
      '몸이 아파서 오늘 병원에 가야 해요.',
      '일하다가 다쳤어요. 병원에 가고 싶어요.',
      '오늘 몇 시까지 일해요?',
      '출입국 방문 예약을 하고 싶어요.',
      '외국인등록증을 잃어버렸어요. 어떻게 해야 해요?',
      '연말정산은 회사에서 해 주나요?',
      '세탁기는 언제 쓸 수 있어요?',
      '한국어 수업을 듣고 싶어요. 무료예요?',
      '한 달 동안 감사했어요. 앞으로도 잘 부탁드려요.',
    ]);
  });

  it('link routes match the plan table', () => {
    expect(DAYS_21_30.map((d) => d.link?.route ?? null)).toEqual([
      null, null, 'glossary', 'glossary', 'glossary', 'help', 'glossary', null, null, 'tools',
    ]);
  });

  it('icons match the plan table', () => {
    expect(DAYS_21_30.map((d) => d.icon)).toEqual(['📦', '🤒', '🩹', '🌙', '🗓️', '🔎', '🧾', '🏘️', '📚', '💾']);
  });
});
