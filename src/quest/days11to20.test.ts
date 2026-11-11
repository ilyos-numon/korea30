import { describe, expect, it } from 'vitest';
import { BASIC_PHRASES } from '../cards/phrases';
import { phraseViews } from '../i18n/content';
import { QUEST_DAYS_11_20 } from '../i18n/ids';
import { LOCAL } from '../i18n/local';
import { QUEST_TEXT_11_20 } from '../i18n/packs/quests11to20';
import { LANGS, type Lang } from '../i18n/types';
import { questDayProblems } from './contentRules';
import { DAYS_11_20 } from './days11to20';
import { QUESTS } from './quests';

const OLD = QUESTS.filter((q) => q.day <= 10);
const takenSayKo = [
  ...OLD.map((q) => q.say.ko),
  ...BASIC_PHRASES.map((p) => p.ko),
  ...LANGS.map((l) => LOCAL[l].remitKo),
  ...LANGS.map((l) => LOCAL[l].interpreterKo),
];
const isOld = (id: string) => !/^q\d+$/.test(id) || Number(id.slice(1)) <= 10;
const takenMeaning = Object.fromEntries(
  LANGS.map((l) => [l, phraseViews(l).filter((p) => isOld(p.id)).map((p) => p.meaning)]),
) as Record<Lang, string[]>;

describe('DAYS_11_20', () => {
  it('passes the quest content rules', () => {
    expect(
      questDayProblems({
        days: DAYS_11_20,
        expectedDays: QUEST_DAYS_11_20,
        texts: QUEST_TEXT_11_20,
        takenSayKo,
        takenMeaning,
      }),
    ).toEqual([]);
  });

  it('title.ko matches the plan table', () => {
    expect(DAYS_11_20.map((d) => d.title.ko)).toEqual([
      '외국인등록증 받기',
      '체류기간 만료일 확인하기',
      '이사하면 체류지 변경 신고하기',
      '휴대폰 요금제 다시 보기',
      '체크카드 쓰기',
      '국민연금 가입 확인하기',
      '출퇴근 시간 기록 시작하기',
      '긴급전화 112·119 알아두기',
      '모국어 상담 전화 알아두기',
      '마트에서 장보기',
    ]);
  });

  it('say.ko matches the plan table', () => {
    expect(DAYS_11_20.map((d) => d.say.ko)).toEqual([
      '외국인등록증 받으러 왔어요.',
      '제 체류기간이 언제까지인지 알고 싶어요.',
      '이사했어요. 체류지 변경 신고하러 왔어요.',
      '외국인등록증으로 요금제를 바꾸고 싶어요.',
      '이 통장으로 체크카드를 만들 수 있어요?',
      '제가 국민연금에 가입됐는지 확인하고 싶어요.',
      '출근 시간과 퇴근 시간을 어디에 적어요?',
      '사람이 다쳤어요. 빨리 와 주세요.',
      '통역을 연결해 주실 수 있어요?',
      '봉투 하나 주세요. 카드로 계산할게요.',
    ]);
  });

  it('link routes match the plan table', () => {
    expect(DAYS_11_20.map((d) => d.link?.route ?? null)).toEqual([
      null, 'deadline', 'deadline', null, 'glossary', 'help', 'work', 'help', 'help', null,
    ]);
  });

  it('icons match the plan table', () => {
    expect(DAYS_11_20.map((d) => d.icon)).toEqual(['🪪', '📅', '🏠', '📶', '💳', '🧓', '⏰', '🚨', '☎️', '🛒']);
  });
});
