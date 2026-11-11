import {
  type CheckLine,
  type CheckResult,
  DEDUCTION_ORDER,
  type DeductionKind,
  type Payslip,
  type RateTable,
} from './types';

export const TOLERANCE_WON = 10;

const PPM = 1_000_000;

const LABELS: Record<DeductionKind, { ko: string; vi: string }> = {
  nationalPension: { ko: '국민연금', vi: 'Lương hưu quốc dân' },
  healthInsurance: { ko: '건강보험', vi: 'Bảo hiểm y tế' },
  longTermCare: { ko: '장기요양보험', vi: 'Bảo hiểm chăm sóc dài hạn' },
  employmentInsurance: { ko: '고용보험', vi: 'Bảo hiểm việc làm' },
  incomeTax: { ko: '소득세', vi: 'Thuế thu nhập' },
  localIncomeTax: { ko: '지방소득세', vi: 'Thuế thu nhập địa phương' },
};

export function floor10(won: number): number {
  return Math.floor(won / 10) * 10;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** 소득세는 skipped(null). 나머지는 §4.5 계산 규칙. */
function expectedAmounts(p: Payslip, base: number, r: RateTable): Record<DeductionKind, number | null> {
  const pensionBase = clamp(Math.floor(base / 1000) * 1000, r.pensionBaseMin, r.pensionBaseMax);
  const health = floor10(Math.floor((base * r.healthEmployeePpm) / PPM));
  return {
    nationalPension: floor10(Math.floor((pensionBase * r.pensionEmployeePpm) / PPM)),
    healthInsurance: health,
    longTermCare: floor10(Math.floor((health * r.longTermCarePpm) / r.healthTotalPpm)),
    employmentInsurance: floor10(Math.floor((base * r.employmentEmployeePpm) / PPM)),
    incomeTax: null,
    localIncomeTax: floor10(Math.floor((p.deductions.incomeTax * r.localIncomeTaxPpm) / PPM)),
  };
}

export function checkPayslip(p: Payslip, rates: RateTable): CheckResult {
  const taxableBase = p.earnings.reduce((sum, e) => (e.taxable ? sum + e.amount : sum), 0);
  const expected = expectedAmounts(p, taxableBase, rates);

  const lines: CheckLine[] = DEDUCTION_ORDER.map((kind) => {
    const reported = p.deductions[kind];
    const exp = expected[kind];
    const base = { kind, labelKo: LABELS[kind].ko, labelVi: LABELS[kind].vi, reported };
    if (exp === null) return { ...base, expected: null, diff: null, status: 'skipped' };
    const diff = reported - exp;
    return { ...base, expected: exp, diff, status: Math.abs(diff) <= TOLERANCE_WON ? 'match' : 'mismatch' };
  });

  const mismatched = lines.filter((l) => l.status === 'mismatch');
  return {
    yearMonth: p.yearMonth,
    taxableBase,
    lines,
    mismatchCount: mismatched.length,
    askKo:
      mismatched.length > 0
        ? `${mismatched.map((l) => l.labelKo).join(', ')} 공제액 확인 부탁드립니다.`
        : null,
  };
}
