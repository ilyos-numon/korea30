import { describe, expect, it } from 'vitest';
import type { CheckResult } from '../payroll/types';
import type { WorkProfile } from '../storage/db';
import { calcMonth } from './calc';
import type { PayslipCompare } from './compare';
import { defaultStatementKo, toComplaintDraft, totalUnpaidEstimate } from './complaint';

const PROFILE: WorkProfile = {
  id: 'me',
  hourlyWage: 20000,
  workplace5Plus: 'yes',
  weekStartsOn: 1,
  workerName: '홍길동',
  workerPhone: '010-0000-0000',
  workerAddress: '서울시 어딘가',
  workerBirth: '1995-01-01',
  companyName: '예시공장',
  employerName: '김대표',
  employerAddress: '경기도 어딘가',
  employerPhone: '031-000-0000',
  startDate: '2026-09-01',
  endDate: null,
};

const DEDUCTIONS: CheckResult = { yearMonth: '2026-10', taxableBase: 0, lines: [], mismatchCount: 0, askKo: null };

function cmp(yearMonth: string, expectedGross: number, reportedTaxable: number, status: PayslipCompare['status']): PayslipCompare {
  const diff = reportedTaxable - expectedGross;
  return { yearMonth, expectedGross, reportedTaxable, diff, status, unpaidEstimate: Math.max(0, -diff), deductions: DEDUCTIONS };
}

const MONTHS = [
  calcMonth({ shifts: [], hourlyWage: 20000, workplace5Plus: 'yes', weekStartsOn: 1, yearMonth: '2026-09' }),
  calcMonth({ shifts: [], hourlyWage: 20000, workplace5Plus: 'yes', weekStartsOn: 1, yearMonth: '2026-10' }),
];

describe('totalUnpaidEstimate', () => {
  it('sums only months where the payslip is lower (tolerance match excluded)', () => {
    const list = [cmp('2026-09', 500000, 400000, 'lower'), cmp('2026-10', 300000, 250000, 'lower'), cmp('2026-11', 1000, 500, 'match')];
    expect(totalUnpaidEstimate(list)).toBe(150000);
    expect(totalUnpaidEstimate([cmp('2026-09', 100, 900, 'higher')])).toBe(0);
    expect(totalUnpaidEstimate([])).toBe(0);
  });
});

describe('defaultStatementKo', () => {
  it('asks to check the difference with total amount, no judgement words', () => {
    const list = [cmp('2026-09', 500000, 400000, 'lower'), cmp('2026-10', 300000, 250000, 'lower')];
    const s = defaultStatementKo(PROFILE, MONTHS, list);
    expect(s).toContain('예시공장');
    expect(s).toContain('2026-09-01');
    expect(s).toContain('근무 기록으로 계산한 금액과 명세서 금액의 차액 150,000원을 확인해 주시기 바랍니다.');
    expect(s).toContain('2026년 9월');
    expect(s).not.toMatch(/위법|불법|체불/);
  });

  it('without differences, asks to check amounts and still has no judgement words', () => {
    const s = defaultStatementKo({ ...PROFILE, startDate: null, endDate: null }, MONTHS, []);
    expect(s).toContain('2026년 9월 ~ 2026년 10월 기간');
    expect(s).toContain('확인해 주시기 바랍니다');
    expect(s).not.toContain('차액');
    expect(s).not.toMatch(/위법|불법|체불/);
  });
});

describe('toComplaintDraft', () => {
  it('copies profile fields, sums unpaid estimate, keeps the given statement', () => {
    const list = [cmp('2026-09', 500000, 400000, 'lower'), cmp('2026-10', 300000, 299500, 'match')];
    const d = toComplaintDraft(PROFILE, list, '직접 고친 문장');
    expect(d).toEqual({
      workerName: '홍길동',
      workerBirth: '1995-01-01',
      workerPhone: '010-0000-0000',
      workerAddress: '서울시 어딘가',
      companyName: '예시공장',
      employerName: '김대표',
      employerAddress: '경기도 어딘가',
      employerPhone: '031-000-0000',
      startDate: '2026-09-01',
      endDate: null,
      unpaidEstimate: 100000,
      statementKo: '직접 고친 문장',
    });
  });
});
