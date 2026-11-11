import { checkPayslip } from '../payroll/check';
import { type ManualError, type ManualField, type ManualInput, buildManualPayslip } from '../payroll/manual';
import { RATES_2026 } from '../payroll/rates2026';
import type { CheckResult } from '../payroll/types';
import type { WageCalcResult } from './calc';

export const GROSS_TOLERANCE_WON = 1000;

export interface PayslipCompare {
  yearMonth: string;
  expectedGross: number;
  /** buildManualPayslip 결과의 taxable earnings 합 (basePay+overtimePay+otherTaxable) */
  reportedTaxable: number;
  /** reportedTaxable - expectedGross */
  diff: number;
  /** |diff| ≤ GROSS_TOLERANCE_WON → match */
  status: 'match' | 'lower' | 'higher';
  /** max(0, -diff) */
  unpaidEstimate: number;
  /** checkPayslip(payslip, RATES_2026) */
  deductions: CheckResult;
}

export function comparePayslip(
  calc: WageCalcResult,
  input: ManualInput,
): { ok: true; result: PayslipCompare } | { ok: false; errors: Partial<Record<ManualField, ManualError>> } {
  const built = buildManualPayslip(input, calc.yearMonth);
  if (!built.ok) return { ok: false, errors: built.errors };

  const { payslip } = built;
  const reportedTaxable = payslip.earnings.reduce((sum, e) => (e.taxable ? sum + e.amount : sum), 0);
  const diff = reportedTaxable - calc.expectedGross;
  const status = Math.abs(diff) <= GROSS_TOLERANCE_WON ? 'match' : diff < 0 ? 'lower' : 'higher';

  return {
    ok: true,
    result: {
      yearMonth: calc.yearMonth,
      expectedGross: calc.expectedGross,
      reportedTaxable,
      diff,
      status,
      unpaidEstimate: Math.max(0, -diff),
      deductions: checkPayslip(payslip, RATES_2026),
    },
  };
}
