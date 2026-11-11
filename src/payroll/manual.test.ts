import { describe, expect, it } from 'vitest';
import { checkPayslip } from './check';
import {
  EMPTY_MANUAL_INPUT,
  MANUAL_FIELDS,
  MANUAL_LABELS,
  MAX_WON,
  type ManualInput,
  buildManualPayslip,
  parseWon,
} from './manual';
import { RATES_2026 } from './rates2026';
import { DEDUCTION_ORDER } from './types';

const SAMPLE_A_INPUT: ManualInput = {
  basePay: '2060000',
  overtimePay: '310000',
  otherTaxable: '',
  nonTaxable: '200000',
  nationalPension: '112570',
  healthInsurance: '85200',
  longTermCare: '11190',
  employmentInsurance: '21330',
  incomeTax: '25000',
  localIncomeTax: '2500',
};

describe('parseWon', () => {
  it.each([
    ['23,700', 23700],
    ['2.060.000', 2060000],
    [' 2 060 000원 ', 2060000],
    ['2 060 000', 2060000],
    ['₩1,000', 1000],
    ['1.5', 15],
    ['0', 0],
    ['100000000', 100000000],
  ])('%j → value %d', (raw, value) => {
    expect(parseWon(raw)).toEqual({ kind: 'value', value });
  });

  it.each(['', '   ', '원', ','])('%j → empty', (raw) => {
    expect(parseWon(raw)).toEqual({ kind: 'empty' });
  });

  it.each(['abc', '-5', '12a', '1e5'])('%j → notNumber', (raw) => {
    expect(parseWon(raw)).toEqual({ kind: 'error', error: 'notNumber' });
  });

  it('MAX_WON 초과 → tooLarge', () => {
    expect(MAX_WON).toBe(100_000_000);
    expect(parseWon('100000001')).toEqual({ kind: 'error', error: 'tooLarge' });
  });
});

describe('MANUAL_FIELDS / LABELS / EMPTY', () => {
  it('지급 4개 뒤 DEDUCTION_ORDER 순서로 10개', () => {
    expect(MANUAL_FIELDS).toEqual(['basePay', 'overtimePay', 'otherTaxable', 'nonTaxable', ...DEDUCTION_ORDER]);
  });

  it('라벨', () => {
    expect(MANUAL_LABELS.basePay).toEqual({ ko: '기본급', vi: 'Lương cơ bản' });
    expect(MANUAL_LABELS.overtimePay).toEqual({ ko: '연장·야간·휴일 수당', vi: 'Phụ cấp làm thêm, ca đêm, ngày nghỉ' });
    expect(MANUAL_LABELS.otherTaxable).toEqual({ ko: '기타 과세 수당', vi: 'Phụ cấp khác (chịu thuế)' });
    expect(MANUAL_LABELS.nonTaxable).toEqual({ ko: '비과세 수당 (식대 등)', vi: 'Khoản không chịu thuế (tiền ăn…)' });
    expect(MANUAL_LABELS.employmentInsurance).toEqual({ ko: '고용보험', vi: 'Bảo hiểm việc làm' });
    expect(MANUAL_LABELS.localIncomeTax).toEqual({ ko: '지방소득세', vi: 'Thuế thu nhập địa phương' });
  });

  it('EMPTY_MANUAL_INPUT 는 전부 빈 문자열', () => {
    expect(Object.keys(EMPTY_MANUAL_INPUT).sort()).toEqual([...MANUAL_FIELDS].sort());
    for (const f of MANUAL_FIELDS) expect(EMPTY_MANUAL_INPUT[f]).toBe('');
  });
});

describe('buildManualPayslip', () => {
  it('SAMPLE_A 숫자 → payslip, 검산 mismatch 0', () => {
    const r = buildManualPayslip(SAMPLE_A_INPUT, '2026-10');
    if (!r.ok) throw new Error('expected ok');
    expect(r.payslip.id).toBe('manual');
    expect(r.payslip.yearMonth).toBe('2026-10');
    expect(r.payslip.earnings).toEqual([
      { nameKo: '기본급', nameVi: 'Lương cơ bản', amount: 2_060_000, taxable: true },
      { nameKo: '연장·야간·휴일 수당', nameVi: 'Phụ cấp làm thêm, ca đêm, ngày nghỉ', amount: 310_000, taxable: true },
      { nameKo: '비과세 수당 (식대 등)', nameVi: 'Khoản không chịu thuế (tiền ăn…)', amount: 200_000, taxable: false },
    ]);
    expect(r.payslip.deductions).toEqual({
      nationalPension: 112_570,
      healthInsurance: 85_200,
      longTermCare: 11_190,
      employmentInsurance: 21_330,
      incomeTax: 25_000,
      localIncomeTax: 2_500,
    });
    const c = checkPayslip(r.payslip, RATES_2026);
    expect(c.mismatchCount).toBe(0);
    expect(c.taxableBase).toBe(2_370_000);
  });

  it("고용보험 '23,700' → mismatch 1", () => {
    const r = buildManualPayslip({ ...SAMPLE_A_INPUT, employmentInsurance: '23,700' }, '2026-10');
    if (!r.ok) throw new Error('expected ok');
    const c = checkPayslip(r.payslip, RATES_2026);
    expect(c.mismatchCount).toBe(1);
    expect(c.askKo).toBe('고용보험 공제액 확인 부탁드립니다.');
  });

  it('선택 지급 항목은 값 > 0 일 때만, 정해진 순서', () => {
    const r = buildManualPayslip(
      { ...SAMPLE_A_INPUT, overtimePay: '0', otherTaxable: '50,000', nonTaxable: '' },
      '2026-10',
    );
    if (!r.ok) throw new Error('expected ok');
    expect(r.payslip.earnings.map((e) => [e.nameKo, e.amount, e.taxable])).toEqual([
      ['기본급', 2_060_000, true],
      ['기타 과세 수당', 50_000, true],
    ]);
  });

  it('공제 0 은 허용', () => {
    const r = buildManualPayslip({ ...SAMPLE_A_INPUT, longTermCare: '0' }, '2026-10');
    expect(r.ok).toBe(true);
  });

  it("basePay '' + employmentInsurance 'abc' → 모든 오류를 모은다", () => {
    const r = buildManualPayslip({ ...EMPTY_MANUAL_INPUT, employmentInsurance: 'abc' }, '2026-10');
    expect(r).toEqual({
      ok: false,
      errors: {
        basePay: 'required',
        nationalPension: 'required',
        healthInsurance: 'required',
        longTermCare: 'required',
        employmentInsurance: 'notNumber',
        incomeTax: 'required',
        localIncomeTax: 'required',
      },
    });
  });

  it("basePay '0' → required, 지급 선택 항목 오류도 모은다", () => {
    const r = buildManualPayslip(
      { ...SAMPLE_A_INPUT, basePay: '0', overtimePay: 'x', nonTaxable: '100000001' },
      '2026-10',
    );
    expect(r).toEqual({
      ok: false,
      errors: { basePay: 'required', overtimePay: 'notNumber', nonTaxable: 'tooLarge' },
    });
  });
});
