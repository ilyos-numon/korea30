import type { WorklogStrings } from './types';

/** null if not a number */
function toNum(v: number | string): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const cnt = (v: number | string): string => String(toNum(v) ?? (String(v) || '-'));

const won = (v: number | string): string => {
  const n = toNum(v);
  return n === null ? `KRW ${String(v) || '-'}` : `KRW ${n.toLocaleString('en-US')}`;
};

const hoursMinutes = (v: number | string): string => {
  const n = toNum(v);
  if (n === null) return `${String(v) || '-'} min`;
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.abs(n) % 60;
  return `${n < 0 ? '-' : ''}${h} h ${m} min`;
};

export const en: WorklogStrings = {
  title: 'Work log',
  intro: 'Write down your start and end times and we estimate this month’s pay. What you enter stays on this device only.',
  month: 'Month',
  shiftHeading: 'Add a shift',
  shiftDate: 'Date',
  shiftStart: 'Start time',
  shiftEnd: 'End time',
  shiftBreak: 'Break (minutes)',
  shiftHoliday: 'I worked on a holiday',
  shiftMemo: 'Memo',
  shiftOvernightHint: 'If the end time is earlier than the start time, we count it as ending the next day.',
  shiftAdd: 'Add shift',
  errBadDate: 'Please check the date.',
  errBadTime: 'Please check the times.',
  errZeroLength: 'Start and end times are the same.',
  errTooLong: 'One shift is longer than 16 hours. Please check the times.',
  errBreakTooLong: 'The break is longer than the shift.',
  errBadBreak: 'Enter the break as a whole number of minutes (0 or more).',
  errFuture: 'You cannot log a date after today.',
  listHeading: 'Shifts this month',
  empty: 'No shifts this month yet. Add your start and end times above.',
  breakMinutes: (v) => `Break ${toNum(v) ?? (String(v) || '-')} min`,
  holidayTag: 'Holiday',
  delete: 'Delete',
  profileHeading: 'Hourly wage and workplace',
  wage: 'Hourly wage (KRW)',
  wageHint: 'Use the hourly wage written in your contract or payslip.',
  size: (v) => `Workplace has ${cnt(v)} or more workers`,
  sizeYes: (v) => `${cnt(v)} or more`,
  sizeNo: (v) => `Fewer than ${cnt(v)}`,
  sizeUnknown: 'Not sure',
  weekStart: 'Week starts on',
  weekStartMon: 'Monday',
  weekStartSun: 'Sunday',
  detailsHeading: 'You and your employer (for the complaint draft)',
  detailsHint: 'You can leave these empty. They are only used in the complaint draft.',
  workerName: 'Name',
  workerBirth: 'Date of birth',
  workerPhone: 'Phone',
  workerAddress: 'Address',
  companyName: 'Workplace name',
  employerName: 'Employer (representative)',
  employerAddress: 'Workplace address',
  employerPhone: 'Workplace phone',
  startDate: 'First day of work',
  endDate: 'Last day of work',
  profileSave: 'Save',
  profileSaved: 'Saved.',
  errWage: 'Enter the hourly wage using numbers only.',
  totalsHeading: 'This month’s estimate',
  totalWorked: 'Total worked',
  totalRegular: 'Regular hours',
  totalOvertime: 'Overtime',
  totalNight: 'Night work',
  totalHoliday: 'Holiday work',
  basePay: 'Base pay',
  premiumPay: 'Extra (premium) pay',
  expectedGross: 'Estimated pay (before tax)',
  hoursMinutes,
  won,
  wageMissing: 'Save your hourly wage to see amounts.',
  minWageWarning: (v) => `Your hourly wage is lower than this year’s minimum wage (${won(v)}). Please check.`,
  noteSmallWorkplaceNoPremium: (v) => `For workplaces with fewer than ${cnt(v)} workers, overtime, night and holiday premiums are not included.`,
  noteWorkplaceSizeUnknown: (v) => `Workplace size is unknown, so premiums are included. The amount may differ if there are fewer than ${cnt(v)} workers.`,
  noteBelowMinWage: 'Your hourly wage is lower than the minimum wage. Please check.',
  noteWeeklyHolidayPayNotIncluded: 'Weekly holiday pay is not included in this estimate.',
  compareHeading: 'Compare with your payslip',
  compareHint: 'Enter this month’s payslip amounts to see the difference from the estimate.',
  compareEarnings: 'Earnings',
  compareDeductions: 'Deductions',
  compareRun: 'Compare',
  errRequired: 'Enter a number (0 if none)',
  errNotNumber: 'Numbers only',
  errTooLarge: 'Enter KRW 100,000,000 or less',
  compareExpected: 'Estimate from work log',
  compareReported: 'Taxable pay on payslip',
  compareDiff: 'Difference from estimate',
  statusMatch: 'Almost the same as the estimate.',
  statusLower: 'The payslip is lower than the estimate. Please check.',
  statusHigher: 'The payslip is higher than the estimate.',
  unpaidEstimate: 'Estimated unpaid amount',
  deductionMismatch: (v) => `${toNum(v) ?? (String(v) || '-')} deduction item(s) differ from the calculation. Please check.`,
  ask1350: 'If you need a judgement, ask 1350 (Ministry of Employment and Labor call center).',
  statementHeading: 'Complaint text (draft)',
  statementHint: 'This goes into the PDF in Korean. You can edit it.',
  statementReset: 'Restore suggested text',
  pdf: 'Make evidence PDF',
  pdfHint: 'One file with your shift log, monthly estimate, payslip comparison and a complaint draft. Made on this device only.',
  pdfBusy: 'Making the PDF…',
  pdfErrorEmpty: 'There are no shifts, so the PDF cannot be made.',
  pdfErrorLibrary: 'Could not make the PDF. Please try again later.',
  wipe: 'Delete all work records',
  wipeAsk: 'Delete all shifts, wage and workplace details saved on this device?',
  wipeConfirm: 'Delete all',
  wipeCancel: 'Cancel',
  wiped: 'All work records were deleted.',
};
