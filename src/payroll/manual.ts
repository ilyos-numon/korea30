import { DEDUCTION_ORDER, type DeductionKind, type EarningItem, type Payslip } from './types';

export type EarningField = 'basePay' | 'overtimePay' | 'otherTaxable' | 'nonTaxable';
export type ManualField = EarningField | DeductionKind;

const EARNING_FIELDS: readonly EarningField[] = ['basePay', 'overtimePay', 'otherTaxable', 'nonTaxable'];

export const MANUAL_FIELDS: readonly ManualField[] = [...EARNING_FIELDS, ...DEDUCTION_ORDER];

export const MANUAL_LABELS: Readonly<Record<ManualField, { ko: string; vi: string }>> = {
  basePay: { ko: '기본급', vi: 'Lương cơ bản' },
  overtimePay: { ko: '연장·야간·휴일 수당', vi: 'Phụ cấp làm thêm, ca đêm, ngày nghỉ' },
  otherTaxable: { ko: '기타 과세 수당', vi: 'Phụ cấp khác (chịu thuế)' },
  nonTaxable: { ko: '비과세 수당 (식대 등)', vi: 'Khoản không chịu thuế (tiền ăn…)' },
  nationalPension: { ko: '국민연금', vi: 'Lương hưu quốc dân' },
  healthInsurance: { ko: '건강보험', vi: 'Bảo hiểm y tế' },
  longTermCare: { ko: '장기요양보험', vi: 'Bảo hiểm chăm sóc dài hạn' },
  employmentInsurance: { ko: '고용보험', vi: 'Bảo hiểm việc làm' },
  incomeTax: { ko: '소득세', vi: 'Thuế thu nhập' },
  localIncomeTax: { ko: '지방소득세', vi: 'Thuế thu nhập địa phương' },
};

export type ManualInput = Record<ManualField, string>;

export const EMPTY_MANUAL_INPUT: ManualInput = {
  basePay: '',
  overtimePay: '',
  otherTaxable: '',
  nonTaxable: '',
  nationalPension: '',
  healthInsurance: '',
  longTermCare: '',
  employmentInsurance: '',
  incomeTax: '',
  localIncomeTax: '',
};

export const MAX_WON = 100_000_000;

export type ParsedWon =
  | { kind: 'empty' }
  | { kind: 'value'; value: number }
  | { kind: 'error'; error: 'notNumber' | 'tooLarge' };

/** trim → ',', '.', 공백(일반·NBSP), '원', '₩' 제거 → '' 이면 empty → /^\d+$/ 아니면 notNumber → Number > MAX_WON 이면 tooLarge.
 *  '.' 은 베트남식 천 단위 구분으로 보고 제거한다('1.5' → 15). '-5' → notNumber. */
export function parseWon(raw: string): ParsedWon {
  const s = raw.trim().replace(/[,.\s 원₩]/g, '');
  if (s === '') return { kind: 'empty' };
  if (!/^\d+$/.test(s)) return { kind: 'error', error: 'notNumber' };
  const value = Number(s);
  if (value > MAX_WON) return { kind: 'error', error: 'tooLarge' };
  return { kind: 'value', value };
}

export type ManualError = 'required' | 'notNumber' | 'tooLarge';

export type ManualResult =
  | { ok: true; payslip: Payslip }
  | { ok: false; errors: Partial<Record<ManualField, ManualError>> };

/** basePay: empty 또는 0 → required. overtimePay/otherTaxable/nonTaxable: empty → 0. 공제 6개: empty → required (0 허용).
 *  오류가 하나라도 있으면 ok:false (모든 필드 오류를 한 번에 모은다). */
export function buildManualPayslip(input: ManualInput, yearMonth: string): ManualResult {
  const errors: Partial<Record<ManualField, ManualError>> = {};
  const values = {} as Record<ManualField, number>;

  for (const field of MANUAL_FIELDS) {
    const parsed = parseWon(input[field]);
    if (parsed.kind === 'error') {
      errors[field] = parsed.error;
      continue;
    }
    const optional = field === 'overtimePay' || field === 'otherTaxable' || field === 'nonTaxable';
    if (parsed.kind === 'empty') {
      if (optional) values[field] = 0;
      else errors[field] = 'required';
      continue;
    }
    if (field === 'basePay' && parsed.value === 0) {
      errors[field] = 'required';
      continue;
    }
    values[field] = parsed.value;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const earnings: EarningItem[] = [];
  for (const field of EARNING_FIELDS) {
    const amount = values[field];
    if (field !== 'basePay' && amount <= 0) continue;
    const label = MANUAL_LABELS[field];
    earnings.push({ nameKo: label.ko, nameVi: label.vi, amount, taxable: field !== 'nonTaxable' });
  }

  const deductions = {} as Record<DeductionKind, number>;
  for (const kind of DEDUCTION_ORDER) deductions[kind] = values[kind];

  return { ok: true, payslip: { id: 'manual', yearMonth, earnings, deductions } };
}
