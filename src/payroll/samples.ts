import type { Payslip } from './types';

/** 가상 명세서. 회사명·이름 없음. */
export const SAMPLE_A: Payslip = {
  id: 'sample-a',
  yearMonth: '2026-10',
  earnings: [
    { nameKo: '기본급', nameVi: 'Lương cơ bản', amount: 2_060_000, taxable: true },
    { nameKo: '연장근로수당', nameVi: 'Phụ cấp làm thêm giờ', amount: 310_000, taxable: true },
    { nameKo: '식대', nameVi: 'Tiền ăn', amount: 200_000, taxable: false },
  ],
  deductions: {
    nationalPension: 112_570,
    healthInsurance: 85_200,
    longTermCare: 11_190,
    employmentInsurance: 21_330,
    incomeTax: 25_000,
    localIncomeTax: 2_500,
  },
};

/** SAMPLE_A 와 같고 고용보험만 다르다. */
export const SAMPLE_B: Payslip = {
  ...SAMPLE_A,
  id: 'sample-b',
  earnings: SAMPLE_A.earnings.map((e) => ({ ...e })),
  deductions: { ...SAMPLE_A.deductions, employmentInsurance: 23_700 },
};
