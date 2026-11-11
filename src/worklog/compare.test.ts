import { describe, expect, it } from 'vitest';
import { checkPayslip } from '../payroll/check';
import { EMPTY_MANUAL_INPUT, type ManualInput, buildManualPayslip } from '../payroll/manual';
import { RATES_2026 } from '../payroll/rates2026';
import type { WorkShift } from '../storage/db';
import { calcMonth } from './calc';
import { GROSS_TOLERANCE_WON, comparePayslip } from './compare';

const WAGE = 20000;

function shift(id: string, date: string, start: string, end: string, breakMinutes: number): WorkShift {
  return { id, date, start, end, breakMinutes, isHoliday: false, memo: '', createdAt: 0 };
}

const CALC = calcMonth({
  shifts: [shift('a', '2026-10-05', '09:00', '18:00', 60), shift('b', '2026-10-06', '14:00', '00:00', 0)],
  hourlyWage: WAGE,
  workplace5Plus: 'yes',
  weekStartsOn: 1,
  yearMonth: '2026-10',
});

function input(basePay: number, overtimePay = 0, extra: Partial<ManualInput> = {}): ManualInput {
  return {
    ...EMPTY_MANUAL_INPUT,
    basePay: String(basePay),
    overtimePay: overtimePay ? String(overtimePay) : '',
    nonTaxable: '200000',
    nationalPension: '0',
    healthInsurance: '0',
    longTermCare: '0',
    employmentInsurance: '0',
    incomeTax: '0',
    localIncomeTax: '0',
    ...extra,
  };
}

describe('comparePayslip', () => {
  it('match when within tolerance; non-taxable is excluded', () => {
    const gross = CALC.expectedGross;
    const r = comparePayslip(CALC, input(gross - GROSS_TOLERANCE_WON));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result.yearMonth).toBe('2026-10');
    expect(r.result.expectedGross).toBe(gross);
    expect(r.result.reportedTaxable).toBe(gross - GROSS_TOLERANCE_WON);
    expect(r.result.diff).toBe(-GROSS_TOLERANCE_WON);
    expect(r.result.status).toBe('match');
    expect(r.result.unpaidEstimate).toBe(GROSS_TOLERANCE_WON);
  });

  it('lower when reported taxable is below expected by more than tolerance', () => {
    const base = CALC.basePay;
    const r = comparePayslip(CALC, input(base));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result.reportedTaxable).toBe(base);
    expect(r.result.status).toBe('lower');
    expect(r.result.diff).toBe(base - CALC.expectedGross);
    expect(r.result.unpaidEstimate).toBe(CALC.expectedGross - base);
  });

  it('higher when reported taxable exceeds expected; unpaidEstimate 0', () => {
    const r = comparePayslip(CALC, input(CALC.basePay, CALC.premiumPay + GROSS_TOLERANCE_WON + 1, { otherTaxable: '5000' }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.result.reportedTaxable).toBe(CALC.expectedGross + GROSS_TOLERANCE_WON + 1 + 5000);
    expect(r.result.status).toBe('higher');
    expect(r.result.unpaidEstimate).toBe(0);
  });

  it('deductions are checked with the existing payroll checker', () => {
    const inp = input(CALC.expectedGross);
    const r = comparePayslip(CALC, inp);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const built = buildManualPayslip(inp, '2026-10');
    if (!built.ok) throw new Error('unexpected');
    expect(r.result.deductions).toEqual(checkPayslip(built.payslip, RATES_2026));
    expect(r.result.deductions.yearMonth).toBe('2026-10');
  });

  it('passes manual input errors through unchanged', () => {
    const r = comparePayslip(CALC, { ...EMPTY_MANUAL_INPUT, basePay: 'abc', overtimePay: '999999999' });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.basePay).toBe('notNumber');
    expect(r.errors.overtimePay).toBe('tooLarge');
    expect(r.errors.nationalPension).toBe('required');
  });
});
