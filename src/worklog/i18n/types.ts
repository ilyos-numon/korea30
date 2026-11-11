/** 근무 기록 화면 문자열. 값은 string 또는 함수만 (PLAN §4.3). 함수는 모르는 인자에도 빈 문자열이 아닌 값을 낸다. */
export interface WorklogStrings {
  title: string;
  intro: string;
  month: string;
  // 시프트 입력
  shiftHeading: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  shiftBreak: string;
  shiftHoliday: string;
  shiftMemo: string;
  shiftOvernightHint: string;
  shiftAdd: string;
  errBadDate: string;
  errBadTime: string;
  errZeroLength: string;
  errTooLong: string;
  errBreakTooLong: string;
  errBadBreak: string;
  errFuture: string;
  // 목록
  listHeading: string;
  empty: string;
  breakMinutes: (min: number | string) => string;
  holidayTag: string;
  delete: string;
  // 프로필
  profileHeading: string;
  wage: string;
  wageHint: string;
  size: (workers: number | string) => string;
  sizeYes: (workers: number | string) => string;
  sizeNo: (workers: number | string) => string;
  sizeUnknown: string;
  weekStart: string;
  weekStartMon: string;
  weekStartSun: string;
  detailsHeading: string;
  detailsHint: string;
  workerName: string;
  workerBirth: string;
  workerPhone: string;
  workerAddress: string;
  companyName: string;
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  startDate: string;
  endDate: string;
  profileSave: string;
  profileSaved: string;
  errWage: string;
  // 월 합계
  totalsHeading: string;
  totalWorked: string;
  totalRegular: string;
  totalOvertime: string;
  totalNight: string;
  totalHoliday: string;
  basePay: string;
  premiumPay: string;
  expectedGross: string;
  hoursMinutes: (min: number | string) => string;
  won: (n: number | string) => string;
  wageMissing: string;
  minWageWarning: (minWage: number | string) => string;
  noteSmallWorkplaceNoPremium: (workers: number | string) => string;
  noteWorkplaceSizeUnknown: (workers: number | string) => string;
  noteBelowMinWage: string;
  noteWeeklyHolidayPayNotIncluded: string;
  // 명세서 비교
  compareHeading: string;
  compareHint: string;
  compareEarnings: string;
  compareDeductions: string;
  compareRun: string;
  errRequired: string;
  errNotNumber: string;
  errTooLarge: string;
  compareExpected: string;
  compareReported: string;
  compareDiff: string;
  statusMatch: string;
  statusLower: string;
  statusHigher: string;
  unpaidEstimate: string;
  deductionMismatch: (count: number | string) => string;
  ask1350: string;
  // 진정 내용·PDF
  statementHeading: string;
  statementHint: string;
  statementReset: string;
  pdf: string;
  pdfHint: string;
  pdfBusy: string;
  pdfErrorEmpty: string;
  pdfErrorLibrary: string;
  // 지우기
  wipe: string;
  wipeAsk: string;
  wipeConfirm: string;
  wipeCancel: string;
  wiped: string;
}
