import { describe, expect, it } from 'vitest';
import { TOLERANCE_WON, checkPayslip, floor10 } from './check';
import { RATES_2026 } from './rates2026';
import { SAMPLE_A, SAMPLE_B } from './samples';
import { DEDUCTION_ORDER, type DeductionKind, type Payslip } from './types';

function line(p: Payslip, kind: DeductionKind) {
  const found = checkPayslip(p, RATES_2026).lines.find((l) => l.kind === kind);
  if (!found) throw new Error(`no line ${kind}`);
  return found;
}

function withBase(base: number): Payslip {
  return {
    ...SAMPLE_A,
    earnings: [{ nameKo: '기본급', nameVi: 'Lương cơ bản', amount: base, taxable: true }],
  };
}

function withDeductions(patch: Partial<Payslip['deductions']>): Payslip {
  return { ...SAMPLE_A, deductions: { ...SAMPLE_A.deductions, ...patch } };
}

describe('floor10', () => {
  it('drops the last digit', () => {
    expect(floor10(112_575)).toBe(112_570);
    expect(floor10(85_200)).toBe(85_200);
    expect(floor10(9)).toBe(0);
  });
  it('tolerance is 10 won', () => {
    expect(TOLERANCE_WON).toBe(10);
  });
});

describe('SAMPLE_A', () => {
  const r = checkPayslip(SAMPLE_A, RATES_2026);
  it('base 2,370,000', () => {
    expect(r.taxableBase).toBe(2_370_000);
    expect(r.yearMonth).toBe('2026-10');
  });
  it('expected values', () => {
    expect(r.lines.map((l) => l.expected)).toEqual([112_570, 85_200, 11_190, 21_330, null, 2_500]);
  });
  it('all match except skipped income tax', () => {
    expect(r.lines.map((l) => l.status)).toEqual([
      'match', 'match', 'match', 'match', 'skipped', 'match',
    ]);
    const tax = r.lines[4];
    expect(tax.expected).toBeNull();
    expect(tax.diff).toBeNull();
    expect(tax.reported).toBe(25_000);
  });
  it('mismatchCount 0, askKo null', () => {
    expect(r.mismatchCount).toBe(0);
    expect(r.askKo).toBeNull();
  });
});

describe('SAMPLE_B', () => {
  const r = checkPayslip(SAMPLE_B, RATES_2026);
  it('employment insurance mismatch', () => {
    const ei = r.lines.find((l) => l.kind === 'employmentInsurance');
    expect(ei?.expected).toBe(21_330);
    expect(ei?.reported).toBe(23_700);
    expect(ei?.diff).toBe(2_370);
    expect(ei?.status).toBe('mismatch');
  });
  it('mismatchCount 1 and askKo', () => {
    expect(r.mismatchCount).toBe(1);
    expect(r.askKo).toBe('고용보험 공제액 확인 부탁드립니다.');
  });
});

describe('national pension base clamp', () => {
  it('base 7,000,000 → upper limit 302,570', () => {
    expect(line(withBase(7_000_000), 'nationalPension').expected).toBe(302_570);
  });
  it('base 300,000 → lower limit 19,000', () => {
    expect(line(withBase(300_000), 'nationalPension').expected).toBe(19_000);
  });
});

describe('tolerance', () => {
  it('health 85,210 → match', () => {
    expect(line(withDeductions({ healthInsurance: 85_210 }), 'healthInsurance').status).toBe('match');
  });
  it('health 85,211 → mismatch', () => {
    const l = line(withDeductions({ healthInsurance: 85_211 }), 'healthInsurance');
    expect(l.status).toBe('mismatch');
    expect(l.diff).toBe(11);
  });
});

describe('rules', () => {
  it('(i) non-taxable meal allowance is not in base', () => {
    const noMeal: Payslip = { ...SAMPLE_A, earnings: SAMPLE_A.earnings.filter((e) => e.taxable) };
    expect(checkPayslip(noMeal, RATES_2026).taxableBase).toBe(2_370_000);
    const sum = SAMPLE_A.earnings.reduce((s, e) => s + e.amount, 0);
    expect(sum).toBe(2_570_000);
    expect(checkPayslip(SAMPLE_A, RATES_2026).taxableBase).toBe(2_370_000);
  });
  it('(j) income tax 0 → local income tax expected 0', () => {
    const l = line(withDeductions({ incomeTax: 0, localIncomeTax: 0 }), 'localIncomeTax');
    expect(l.expected).toBe(0);
    expect(l.status).toBe('match');
  });
  it('(k) long-term care uses computed health insurance, not reported', () => {
    const l = line(withDeductions({ healthInsurance: 99_990 }), 'longTermCare');
    expect(l.expected).toBe(11_190);
    expect(l.status).toBe('match');
  });
  it('(l) lines follow DEDUCTION_ORDER, length 6', () => {
    const r = checkPayslip(SAMPLE_A, RATES_2026);
    expect(r.lines).toHaveLength(6);
    expect(r.lines.map((l) => l.kind)).toEqual([...DEDUCTION_ORDER]);
    expect(DEDUCTION_ORDER).toEqual([
      'nationalPension', 'healthInsurance', 'longTermCare',
      'employmentInsurance', 'incomeTax', 'localIncomeTax',
    ]);
  });
  it('(m) two mismatches → joined askKo', () => {
    const r = checkPayslip({ ...SAMPLE_B, deductions: { ...SAMPLE_B.deductions, healthInsurance: 90_000 } }, RATES_2026);
    expect(r.mismatchCount).toBe(2);
    expect(r.askKo).toBe('건강보험, 고용보험 공제액 확인 부탁드립니다.');
  });
  it('labels ko / vi', () => {
    const r = checkPayslip(SAMPLE_A, RATES_2026);
    expect(r.lines.map((l) => [l.labelKo, l.labelVi])).toEqual([
      ['국민연금', 'Lương hưu quốc dân'],
      ['건강보험', 'Bảo hiểm y tế'],
      ['장기요양보험', 'Bảo hiểm chăm sóc dài hạn'],
      ['고용보험', 'Bảo hiểm việc làm'],
      ['소득세', 'Thuế thu nhập'],
      ['지방소득세', 'Thuế thu nhập địa phương'],
    ]);
  });
});

describe('RATES_2026', () => {
  it('values and sources', () => {
    expect(RATES_2026).toMatchObject({
      year: 2026,
      pensionEmployeePpm: 47_500,
      pensionBaseMin: 400_000,
      pensionBaseMax: 6_370_000,
      healthEmployeePpm: 35_950,
      healthTotalPpm: 71_900,
      longTermCarePpm: 9_448,
      employmentEmployeePpm: 9_000,
      localIncomeTaxPpm: 100_000,
    });
    expect(RATES_2026.sources.length).toBeGreaterThanOrEqual(6);
    expect(RATES_2026.sources.some((s) => s.includes('§7-1'))).toBe(true);
  });
  it('SAMPLE_B equals SAMPLE_A except id and employment insurance', () => {
    expect(SAMPLE_B.id).toBe('sample-b');
    expect({ ...SAMPLE_B, id: 'sample-a', deductions: { ...SAMPLE_B.deductions, employmentInsurance: 21_330 } }).toEqual(SAMPLE_A);
  });
});
