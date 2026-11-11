import type { LegalSource, LegalValue } from '../types';

// S9(2026-10-27) 국가법령정보센터 원문과 대조. 근로기준법은 2026-10-08 시행본, 시행령은 2025-10-23 시행본 기준.
const LSA56 = 'https://www.law.go.kr/법령/근로기준법/제56조';
const LSA50 = 'https://www.law.go.kr/법령/근로기준법/제50조';

const CHECKED_ON = '2026-10-27';

function src(law: string, article: string, url: string): LegalSource {
  return { law, article, url, checkedOn: CHECKED_ON };
}

export const WAGE_LAW: readonly LegalValue<number | string>[] = [
  {
    id: 'minWageHourly2026', value: 10_320, unit: 'won/hour', labelKo: '2026년 최저시급',
    source: src(
      '최저임금법', '제10조제1항, 2026년 적용 최저임금 고시(고용노동부고시 제2025-47호) 1. 최저임금액',
      'https://www.law.go.kr/admRulInfoP.do?admRulSeq=2100000262710',
    ),
    status: 'verified',
  },
  {
    id: 'overtimePremiumPpm', value: 500_000, unit: 'ppm', labelKo: '연장근로 가산율',
    source: src('근로기준법', '제56조①', LSA56), status: 'verified',
  },
  {
    id: 'nightPremiumPpm', value: 500_000, unit: 'ppm', labelKo: '야간근로 가산율',
    source: src('근로기준법', '제56조③', LSA56), status: 'verified',
  },
  {
    id: 'holidayPremiumWithin8Ppm', value: 500_000, unit: 'ppm', labelKo: '휴일근로 가산율(8시간 이내)',
    source: src('근로기준법', '제56조②1', LSA56), status: 'verified',
  },
  {
    id: 'holidayPremiumOver8Ppm', value: 1_000_000, unit: 'ppm', labelKo: '휴일근로 가산율(8시간 초과분)',
    source: src('근로기준법', '제56조②2', LSA56), status: 'verified',
  },
  {
    id: 'dailyRegularMinutes', value: 480, unit: 'minutes', labelKo: '1일 법정 근로시간',
    source: src('근로기준법', '제50조②', LSA50), status: 'verified',
  },
  {
    id: 'weeklyRegularMinutes', value: 2_400, unit: 'minutes', labelKo: '1주 법정 근로시간',
    source: src('근로기준법', '제50조①', LSA50), status: 'verified',
  },
  {
    id: 'nightStart', value: '22:00', unit: 'time', labelKo: '야간근로 시작 시각',
    source: src('근로기준법', '제56조③', LSA56), status: 'verified',
  },
  {
    id: 'nightEnd', value: '06:00', unit: 'time', labelKo: '야간근로 끝 시각',
    source: src('근로기준법', '제56조③', LSA56), status: 'verified',
  },
  {
    id: 'premiumMinWorkers', value: 5, unit: 'workers', labelKo: '가산수당 적용 최소 상시 근로자 수',
    source: src('근로기준법', '제11조①②, 시행령 제7조 별표1(제56조 미포함)', 'https://www.law.go.kr/법령/근로기준법/제11조'), status: 'verified',
  },
  {
    id: 'wageClaimYears', value: 3, unit: 'years', labelKo: '임금채권 소멸시효',
    source: src('근로기준법', '제49조', 'https://www.law.go.kr/법령/근로기준법/제49조'), status: 'verified',
  },
];
