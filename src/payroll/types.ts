export type DeductionKind =
  | 'nationalPension'
  | 'healthInsurance'
  | 'longTermCare'
  | 'employmentInsurance'
  | 'incomeTax'
  | 'localIncomeTax';

export const DEDUCTION_ORDER: readonly DeductionKind[] = [
  'nationalPension',
  'healthInsurance',
  'longTermCare',
  'employmentInsurance',
  'incomeTax',
  'localIncomeTax',
];

export interface EarningItem {
  nameKo: string;
  nameVi: string;
  amount: number;
  taxable: boolean;
}

export interface Payslip {
  id: 'sample-a' | 'sample-b' | 'manual';
  /** 'YYYY-MM' */
  yearMonth: string;
  earnings: EarningItem[];
  /** 원, 정수 */
  deductions: Record<DeductionKind, number>;
}

export interface RateTable {
  year: number;
  /** parts per million */
  pensionEmployeePpm: number;
  /** 원 */
  pensionBaseMin: number;
  /** 원 */
  pensionBaseMax: number;
  healthEmployeePpm: number;
  healthTotalPpm: number;
  /** 소득 대비 장기요양 총요율 */
  longTermCarePpm: number;
  employmentEmployeePpm: number;
  localIncomeTaxPpm: number;
  /** 값마다 출처 메모 1줄 */
  sources: string[];
}

export type CheckStatus = 'match' | 'mismatch' | 'skipped';

export interface CheckLine {
  kind: DeductionKind;
  labelKo: string;
  labelVi: string;
  reported: number;
  /** skipped 면 null */
  expected: number | null;
  /** reported - expected, skipped 면 null */
  diff: number | null;
  status: CheckStatus;
}

export interface CheckResult {
  yearMonth: string;
  taxableBase: number;
  /** DEDUCTION_ORDER 순서, 6개 */
  lines: CheckLine[];
  mismatchCount: number;
  /** mismatch 있으면 `${라벨들 ', ' join} 공제액 확인 부탁드립니다.`, 없으면 null */
  askKo: string | null;
}
