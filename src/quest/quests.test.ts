import { describe, expect, it } from 'vitest';
import { QUESTS } from './quests';

describe('QUESTS', () => {
  it('(a) has 30 days in order 1..30', () => {
    expect(QUESTS).toHaveLength(30);
    expect(QUESTS.map((q) => q.day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it('(b) every day has non-empty vi/ko text, at least one bring item, and viPron', () => {
    for (const q of QUESTS) {
      expect(q.icon).not.toBe('');
      for (const b of [q.title, q.where, ...q.bring, ...(q.tip ? [q.tip] : [])]) {
        expect(b.vi.trim()).not.toBe('');
        expect(b.ko.trim()).not.toBe('');
      }
      expect(q.bring.length).toBeGreaterThanOrEqual(1);
      expect(q.say.ko.trim()).not.toBe('');
      expect(q.say.viPron.trim()).not.toBe('');
      expect(q.say.viMeaning.trim()).not.toBe('');
    }
  });

  it('(b) all 30 days have a tip', () => {
    expect(QUESTS.filter((q) => q.tip !== undefined)).toHaveLength(30);
  });

  it('(c) title.ko matches the plan table', () => {
    expect(QUESTS.map((q) => q.title.ko)).toEqual([
      '유심 개통하기',
      '교통카드 만들기',
      '외국인등록 신청하기',
      '은행 통장 만들기',
      '건강보험 가입 확인하기',
      '가까운 병원·약국 알아두기',
      '쓰레기 버리는 방법 익히기',
      '고향으로 송금하는 방법 알아보기',
      '근로계약서 다시 읽기',
      '첫 급여명세서 확인하기',
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

  it('(d) say.ko is different for all 30 days', () => {
    expect(new Set(QUESTS.map((q) => q.say.ko)).size).toBe(30);
  });

  it('(d) say.ko for days 11..30 matches the plan table', () => {
    expect(QUESTS.slice(10).map((q) => q.say.ko)).toEqual([
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

  it('(e) links follow the plan table for all 30 days', () => {
    const routes = QUESTS.map((q) => q.link?.route ?? null);
    expect(routes).toEqual([
      null, null, 'form', null, null, null, null, null, 'glossary', 'payslip',
      null, 'deadline', 'deadline', null, 'glossary', 'help', 'work', 'help', 'help', null,
      null, null, 'glossary', 'glossary', 'glossary', 'help', 'glossary', null, null, 'tools',
    ]);
    expect(QUESTS[2].link?.label).toEqual({ vi: '📝 Xem hướng dẫn điền đơn', ko: '신청서 작성 도움 보기' });
    expect(QUESTS[8].link?.label).toEqual({ vi: '📖 Tra từ khó', ko: '어려운 말 찾기' });
    expect(QUESTS[9].link?.label).toEqual({ vi: '💰 Kiểm tra bảng lương', ko: '급여 검산하기' });
  });

  it('(f) days 1..3 say.ko are unchanged', () => {
    expect(QUESTS.slice(0, 3).map((q) => q.say.ko)).toEqual([
      '선불 유심 개통하고 싶어요. 여권 여기 있어요.',
      '교통카드 하나 주세요. 만 원 충전해 주세요.',
      '외국인등록 하러 왔어요.',
    ]);
  });
});
