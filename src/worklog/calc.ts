import { endOfMonth, endOfWeek, format, isValid, parse, startOfWeek } from 'date-fns';
import { legalNumber, legalText } from '../legal';
import type { LegalId } from '../legal/types';
import type { WorkShift, Workplace5Plus } from '../storage/db';

export type ShiftError = 'badDate' | 'badTime' | 'zeroLength' | 'tooLong' | 'breakTooLong' | 'badBreak' | 'future';

export interface MinuteBreakdown {
  regular: number;
  overtime: number;
  night: number;
  holidayWithin8: number;
  holidayOver8: number;
  worked: number;
}
export interface DayLine extends MinuteBreakdown {
  date: string;
  shiftIds: string[];
}
export type WageNoteId = 'smallWorkplaceNoPremium' | 'workplaceSizeUnknown' | 'belowMinWage' | 'weeklyHolidayPayNotIncluded';
export interface WageCalcInput {
  shifts: readonly WorkShift[];
  hourlyWage: number;
  workplace5Plus: Workplace5Plus;
  weekStartsOn: 0 | 1;
  yearMonth: string;
}
export interface WageCalcResult {
  yearMonth: string;
  days: DayLine[];
  totals: MinuteBreakdown;
  /** floor(worked × hourlyWage / 60) */
  basePay: number;
  /** 가산분만. premiumsApplied=false 면 0 */
  premiumPay: number;
  /** basePay + premiumPay */
  expectedGross: number;
  /** workplace5Plus !== 'no' */
  premiumsApplied: boolean;
  minWageHourly: number;
  belowMinWage: boolean;
  notes: WageNoteId[];
  /** 계산에 쓴 법정 항목 */
  legalIds: LegalId[];
}

const DAY_MIN = 24 * 60;
/** 근무 길이 상한 (분). 법정 수치가 아니라 입력 검증용 */
const MAX_SHIFT_MIN = 16 * 60;
const PPM = 1_000_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_FMT = 'yyyy-MM-dd';

const USED_LEGAL_IDS: readonly LegalId[] = [
  'minWageHourly2026',
  'overtimePremiumPpm',
  'nightPremiumPpm',
  'holidayPremiumWithin8Ppm',
  'holidayPremiumOver8Ppm',
  'dailyRegularMinutes',
  'weeklyRegularMinutes',
  'nightStart',
  'nightEnd',
  'premiumMinWorkers',
];

function isValidDate(date: string): boolean {
  return DATE_RE.test(date) && isValid(parse(date, DATE_FMT, new Date(0)));
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

/** end <= start 면 다음날 종료. start === end 는 0 (zeroLength 로 거른다) */
function shiftLength(start: string, end: string): number {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === e) return 0;
  return e > s ? e - s : e + DAY_MIN - s;
}

export function validateShift(
  s: Pick<WorkShift, 'date' | 'start' | 'end' | 'breakMinutes'>,
  today: string,
): ShiftError | null {
  if (!isValidDate(s.date)) return 'badDate';
  if (!TIME_RE.test(s.start) || !TIME_RE.test(s.end)) return 'badTime';
  const len = shiftLength(s.start, s.end);
  if (len === 0) return 'zeroLength';
  if (len > MAX_SHIFT_MIN) return 'tooLong';
  if (!Number.isInteger(s.breakMinutes) || s.breakMinutes < 0) return 'badBreak';
  if (s.breakMinutes >= len) return 'breakTooLong';
  if (s.date > today) return 'future';
  return null;
}

/** 시작일 0시 기준 [0, 2일) 안의 야간 구간 */
function nightWindows(): [number, number][] {
  const ns = toMinutes(legalText('nightStart'));
  const ne = toMinutes(legalText('nightEnd'));
  if (ns > ne) {
    return [
      [0, ne],
      [ns, DAY_MIN + ne],
      [DAY_MIN + ns, 2 * DAY_MIN],
    ];
  }
  return [
    [ns, ne],
    [DAY_MIN + ns, DAY_MIN + ne],
  ];
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

/** 휴게 차감 후 worked·night. 휴게는 비야간 분부터 빼고, 모자라면 야간 분에서 뺀다 */
function shiftMinutes(s: WorkShift): { worked: number; night: number } {
  const start = toMinutes(s.start);
  const len = shiftLength(s.start, s.end);
  const rawNight = nightWindows().reduce((sum, [w0, w1]) => sum + overlap(start, start + len, w0, w1), 0);
  const nonNight = len - rawNight;
  const night = rawNight - Math.max(0, s.breakMinutes - nonNight);
  return { worked: len - s.breakMinutes, night };
}

function emptyBreakdown(): MinuteBreakdown {
  return { regular: 0, overtime: 0, night: 0, holidayWithin8: 0, holidayOver8: 0, worked: 0 };
}

function weekKey(date: string, weekStartsOn: 0 | 1): string {
  return format(startOfWeek(parse(date, DATE_FMT, new Date(0)), { weekStartsOn }), DATE_FMT);
}

export function calcMonth(input: WageCalcInput): WageCalcResult {
  const { hourlyWage, workplace5Plus, weekStartsOn, yearMonth } = input;
  const dailyRegular = legalNumber('dailyRegularMinutes');
  const weeklyRegular = legalNumber('weeklyRegularMinutes');

  // 월 경계 주를 위해 해당 월에 걸친 주 전체 범위의 시프트를 누적한다.
  const monthStart = parse(`${yearMonth}-01`, DATE_FMT, new Date(0));
  const rangeFrom = format(startOfWeek(monthStart, { weekStartsOn }), DATE_FMT);
  const rangeTo = format(endOfWeek(endOfMonth(monthStart), { weekStartsOn }), DATE_FMT);

  // 계산할 수 없는 시프트(형식 오류 등)는 건너뛴다. 미래 날짜는 계산 대상이다.
  const relevant = input.shifts
    .filter((s) => s.date >= rangeFrom && s.date <= rangeTo)
    .filter((s) => {
      const err = validateShift(s, '9999-12-31');
      return err === null;
    })
    .slice()
    .sort((a, b) => (a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date)));

  const dayMap = new Map<string, DayLine>();
  const dayWorked = new Map<string, number>();
  const dayHoliday = new Map<string, number>();
  const weekRegular = new Map<string, number>();

  for (const s of relevant) {
    const { worked, night } = shiftMinutes(s);
    const line: DayLine = dayMap.get(s.date) ?? { date: s.date, shiftIds: [], ...emptyBreakdown() };
    line.shiftIds.push(s.id);
    line.worked += worked;
    line.night += night;

    if (s.isHoliday) {
      const before = dayHoliday.get(s.date) ?? 0;
      const within = Math.min(worked, Math.max(0, dailyRegular - before));
      line.holidayWithin8 += within;
      line.holidayOver8 += worked - within;
      dayHoliday.set(s.date, before + worked);
    } else {
      const before = dayWorked.get(s.date) ?? 0;
      let regular = Math.min(worked, Math.max(0, dailyRegular - before));
      let overtime = worked - regular;
      dayWorked.set(s.date, before + worked);

      const wk = weekKey(s.date, weekStartsOn);
      const weekBefore = weekRegular.get(wk) ?? 0;
      const weekExcess = Math.max(0, weekBefore + regular - weeklyRegular);
      const moved = Math.min(regular, weekExcess);
      regular -= moved;
      overtime += moved;
      weekRegular.set(wk, weekBefore + regular);

      line.regular += regular;
      line.overtime += overtime;
    }
    dayMap.set(s.date, line);
  }

  const days = [...dayMap.values()].filter((d) => d.date.startsWith(`${yearMonth}-`));
  const totals = emptyBreakdown();
  for (const d of days) {
    totals.regular += d.regular;
    totals.overtime += d.overtime;
    totals.night += d.night;
    totals.holidayWithin8 += d.holidayWithin8;
    totals.holidayOver8 += d.holidayOver8;
    totals.worked += d.worked;
  }

  const premiumsApplied = workplace5Plus !== 'no';
  const basePay = Math.floor((totals.worked * hourlyWage) / 60);
  const weighted =
    totals.overtime * legalNumber('overtimePremiumPpm') +
    totals.night * legalNumber('nightPremiumPpm') +
    totals.holidayWithin8 * legalNumber('holidayPremiumWithin8Ppm') +
    totals.holidayOver8 * legalNumber('holidayPremiumOver8Ppm');
  const premiumPay = premiumsApplied ? Math.floor((hourlyWage * weighted) / (60 * PPM)) : 0;

  const minWageHourly = legalNumber('minWageHourly2026');
  const belowMinWage = hourlyWage < minWageHourly;
  const notes: WageNoteId[] = [];
  if (workplace5Plus === 'no') notes.push('smallWorkplaceNoPremium');
  if (workplace5Plus === 'unknown') notes.push('workplaceSizeUnknown');
  if (belowMinWage) notes.push('belowMinWage');
  notes.push('weeklyHolidayPayNotIncluded');

  return {
    yearMonth,
    days,
    totals,
    basePay,
    premiumPay,
    expectedGross: basePay + premiumPay,
    premiumsApplied,
    minWageHourly,
    belowMinWage,
    notes,
    legalIds: [...USED_LEGAL_IDS],
  };
}
