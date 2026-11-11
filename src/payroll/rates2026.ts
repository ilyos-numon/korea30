import type { RateTable } from './types';

export const RATES_2026: RateTable = {
  year: 2026,
  pensionEmployeePpm: 47_500,
  pensionBaseMin: 400_000,
  pensionBaseMax: 6_370_000,
  healthEmployeePpm: 35_950,
  healthTotalPpm: 71_900,
  longTermCarePpm: 9_448,
  employmentEmployeePpm: 9_000,
  localIncomeTaxPpm: 100_000,
  sources: [
    '국민연금 2026 보험료율 9.5%(근로자 4.75%), 기준소득월액 2025.7~2026.6 하한 40만·상한 637만',
    '건강보험 2026 7.19%(근로자 3.595%)',
    '장기요양 2026 소득 대비 0.9448%',
    '고용보험 실업급여 근로자 0.9%',
    '지방소득세 특별징수 = 소득세의 10%',
    '출처 재확인 필요(§7-1)',
  ],
};
