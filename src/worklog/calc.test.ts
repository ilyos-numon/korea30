import { describe, expect, it } from 'vitest';
import { legalNumber } from '../legal';
import type { WorkShift } from '../storage/db';
import { calcMonth, validateShift, type WageCalcInput } from './calc';

const DAY = legalNumber('dailyRegularMinutes');
const WEEK = legalNumber('weeklyRegularMinutes');
const MIN_WAGE = legalNumber('minWageHourly2026');
const OT_PPM = legalNumber('overtimePremiumPpm');
const NIGHT_PPM = legalNumber('nightPremiumPpm');
const HW8_PPM = legalNumber('holidayPremiumWithin8Ppm');
const HO8_PPM = legalNumber('holidayPremiumOver8Ppm');

// 테스트 입력 시급 (법정 수치 아님)
const WAGE = 20000;

let seq = 0;
function shift(date: string, start: string, end: string, breakMinutes = 0, isHoliday = false): WorkShift {
  seq += 1;
  return { id: `s${seq}`, date, start, end, breakMinutes, isHoliday, memo: '', createdAt: 0 };
}

/** start 부터 DAY 분 (휴게 0) 비야간 시프트 */
function dayShift(date: string): WorkShift {
  const end = 9 * 60 + DAY;
  const hh = String(Math.floor(end / 60)).padStart(2, '0');
  const mm = String(end % 60).padStart(2, '0');
  return shift(date, '09:00', `${hh}:${mm}`);
}

function calc(shifts: WorkShift[], over: Partial<WageCalcInput> = {}) {
  return calcMonth({ shifts, hourlyWage: WAGE, workplace5Plus: 'yes', weekStartsOn: 1, yearMonth: '2026-10', ...over });
}

describe('validateShift', () => {
  const today = '2026-10-27';
  const ok = { date: '2026-10-20', start: '09:00', end: '18:00', breakMinutes: 60 };

  it('accepts a normal shift and an overnight shift', () => {
    expect(validateShift(ok, today)).toBeNull();
    expect(validateShift({ ...ok, start: '22:00', end: '06:00' }, today)).toBeNull();
    expect(validateShift({ ...ok, start: '14:00', end: '00:00' }, today)).toBeNull();
  });

  it('badDate for malformed or impossible dates', () => {
    expect(validateShift({ ...ok, date: '2026-1-5' }, today)).toBe('badDate');
    expect(validateShift({ ...ok, date: '2026-02-30' }, today)).toBe('badDate');
  });

  it('badTime for malformed times', () => {
    expect(validateShift({ ...ok, start: '24:00' }, today)).toBe('badTime');
    expect(validateShift({ ...ok, end: '9:00' }, today)).toBe('badTime');
  });

  it('zeroLength when start equals end', () => {
    expect(validateShift({ ...ok, start: '09:00', end: '09:00', breakMinutes: 0 }, today)).toBe('zeroLength');
  });

  it('tooLong when length exceeds 16h', () => {
    expect(validateShift({ ...ok, start: '06:00', end: '22:00', breakMinutes: 0 }, today)).toBeNull();
    expect(validateShift({ ...ok, start: '06:00', end: '22:01', breakMinutes: 0 }, today)).toBe('tooLong');
  });

  it('badBreak for negative or non-integer break', () => {
    expect(validateShift({ ...ok, breakMinutes: -1 }, today)).toBe('badBreak');
    expect(validateShift({ ...ok, breakMinutes: 1.5 }, today)).toBe('badBreak');
  });

  it('breakTooLong when break >= length', () => {
    expect(validateShift({ ...ok, start: '09:00', end: '10:00', breakMinutes: 60 }, today)).toBe('breakTooLong');
  });

  it('future when date is after today', () => {
    expect(validateShift({ ...ok, date: '2026-10-28' }, today)).toBe('future');
    expect(validateShift({ ...ok, date: today }, today)).toBeNull();
  });
});

describe('calcMonth classification', () => {
  it('14:00–00:00 → regular 480 · overtime 120 · night 120', () => {
    const r = calc([shift('2026-10-05', '14:00', '00:00')]);
    expect(r.totals).toEqual({
      regular: DAY,
      overtime: 600 - DAY,
      night: 120,
      holidayWithin8: 0,
      holidayOver8: 0,
      worked: 600,
    });
    expect(r.days).toHaveLength(1);
    expect(r.days[0].date).toBe('2026-10-05');
  });

  it('overnight shift is attributed to its start date and counts night across midnight', () => {
    const s = shift('2026-10-31', '22:00', '06:00');
    const r = calc([s]);
    expect(r.days.map((d) => d.date)).toEqual(['2026-10-31']);
    expect(r.days[0].shiftIds).toEqual([s.id]);
    expect(r.totals.worked).toBe(480);
    expect(r.totals.night).toBe(480);
  });

  it('break is deducted from non-night minutes first', () => {
    // 20:00–02:00: 비야간 120, 야간 240. 휴게 60 → 비야간에서
    const r = calc([shift('2026-10-05', '20:00', '02:00', 60)]);
    expect(r.totals.worked).toBe(300);
    expect(r.totals.night).toBe(240);
  });

  it('break larger than non-night minutes eats into night minutes', () => {
    // 21:00–03:00: 비야간 60, 야간 300. 휴게 90 → 야간 270
    const r = calc([shift('2026-10-05', '21:00', '03:00', 90)]);
    expect(r.totals.worked).toBe(270);
    expect(r.totals.night).toBe(270);
  });

  it('early-morning minutes before 06:00 count as night', () => {
    const r = calc([shift('2026-10-05', '04:00', '10:00')]);
    expect(r.totals.night).toBe(120);
  });

  it('daily minutes over the daily limit become overtime, summed across shifts of the same day', () => {
    const r = calc([shift('2026-10-05', '08:00', '12:00'), shift('2026-10-05', '13:00', '19:00')]);
    expect(r.totals.worked).toBe(600);
    expect(r.totals.regular).toBe(DAY);
    expect(r.totals.overtime).toBe(600 - DAY);
    expect(r.days[0].shiftIds).toHaveLength(2);
  });

  it('weekly regular over the weekly limit moves to overtime', () => {
    // 2026-10-05(월) ~ 10-10(토) 6일
    const dates = ['05', '06', '07', '08', '09', '10'].map((d) => `2026-10-${d}`);
    const r = calc(dates.map(dayShift));
    expect(r.totals.worked).toBe(6 * DAY);
    expect(r.totals.regular).toBe(WEEK);
    expect(r.totals.overtime).toBe(6 * DAY - WEEK);
  });

  it('month-boundary week accumulates shifts from the previous month but reports only this month', () => {
    // 2026-09-28(월) ~ 10-03(토)
    const prev = ['2026-09-28', '2026-09-29', '2026-09-30'].map(dayShift);
    const cur = ['2026-10-01', '2026-10-02', '2026-10-03'].map(dayShift);
    const r = calc([...cur, ...prev]);
    expect(r.days.map((d) => d.date)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
    const curRegular = Math.max(0, Math.min(3 * DAY, WEEK - 3 * DAY));
    expect(r.totals.worked).toBe(3 * DAY);
    expect(r.totals.regular).toBe(curRegular);
    expect(r.totals.overtime).toBe(3 * DAY - curRegular);
  });

  it('weekStartsOn changes which days share a week', () => {
    // 2026-10-04(일) ~ 10-10(토) 7일
    const dates = ['04', '05', '06', '07', '08', '09', '10'].map((d) => `2026-10-${d}`);
    const mon = calc(dates.map(dayShift), { weekStartsOn: 1 });
    const sun = calc(dates.map(dayShift), { weekStartsOn: 0 });
    expect(mon.totals.overtime).toBe(6 * DAY - WEEK);
    expect(sun.totals.overtime).toBe(7 * DAY - WEEK);
  });

  it('holiday shift within 8h → holidayWithin8, not regular/overtime', () => {
    const r = calc([shift('2026-10-09', '09:00', '15:00', 0, true)]);
    expect(r.totals).toMatchObject({ regular: 0, overtime: 0, holidayWithin8: 360, holidayOver8: 0, worked: 360 });
  });

  it('holiday shift over 8h splits into within8 and over8', () => {
    const r = calc([shift('2026-10-09', '08:00', '19:00', 60, true)]);
    expect(r.totals.worked).toBe(600);
    expect(r.totals.holidayWithin8).toBe(DAY);
    expect(r.totals.holidayOver8).toBe(600 - DAY);
    expect(r.totals.regular + r.totals.overtime).toBe(0);
  });

  it('holiday minutes do not count toward the weekly regular total', () => {
    const dates = ['05', '06', '07', '08', '09'].map((d) => `2026-10-${d}`);
    const hol = shift('2026-10-10', '09:00', '17:00', 0, true);
    const r = calc([...dates.map(dayShift), hol]);
    expect(r.totals.regular).toBe(Math.min(5 * DAY, WEEK));
    expect(r.totals.overtime).toBe(5 * DAY - Math.min(5 * DAY, WEEK));
    expect(r.totals.holidayWithin8).toBe(480);
  });

  it('shifts outside the month are excluded from days', () => {
    const r = calc([shift('2026-11-02', '09:00', '18:00', 60), shift('2026-10-20', '09:00', '18:00', 60)]);
    expect(r.days.map((d) => d.date)).toEqual(['2026-10-20']);
  });
});

describe('calcMonth pay and notes', () => {
  it('basePay and premiumPay follow the formula', () => {
    const r = calc([shift('2026-10-05', '14:00', '00:00'), shift('2026-10-09', '08:00', '19:00', 60, true)]);
    const t = r.totals;
    expect(r.basePay).toBe(Math.floor((t.worked * WAGE) / 60));
    const weighted = t.overtime * OT_PPM + t.night * NIGHT_PPM + t.holidayWithin8 * HW8_PPM + t.holidayOver8 * HO8_PPM;
    expect(r.premiumPay).toBe(Math.floor((WAGE * weighted) / (60 * 1_000_000)));
    expect(r.premiumPay).toBeGreaterThan(0);
    expect(r.expectedGross).toBe(r.basePay + r.premiumPay);
    expect(r.premiumsApplied).toBe(true);
    expect(r.notes).toEqual(['weeklyHolidayPayNotIncluded']);
  });

  it('small workplace (5인 미만) → no premium, note', () => {
    const r = calc([shift('2026-10-05', '14:00', '00:00')], { workplace5Plus: 'no' });
    expect(r.premiumsApplied).toBe(false);
    expect(r.premiumPay).toBe(0);
    expect(r.expectedGross).toBe(r.basePay);
    expect(r.notes).toContain('smallWorkplaceNoPremium');
  });

  it('unknown workplace size → premiums applied with note', () => {
    const r = calc([shift('2026-10-05', '14:00', '00:00')], { workplace5Plus: 'unknown' });
    expect(r.premiumsApplied).toBe(true);
    expect(r.premiumPay).toBeGreaterThan(0);
    expect(r.notes).toEqual(['workplaceSizeUnknown', 'weeklyHolidayPayNotIncluded']);
  });

  it('below minimum wage flag uses the legal accessor', () => {
    const below = calc([], { hourlyWage: MIN_WAGE - 1 });
    expect(below.belowMinWage).toBe(true);
    expect(below.notes).toContain('belowMinWage');
    expect(below.minWageHourly).toBe(MIN_WAGE);
    const at = calc([], { hourlyWage: MIN_WAGE });
    expect(at.belowMinWage).toBe(false);
    expect(at.notes).not.toContain('belowMinWage');
  });

  it('empty month → zero totals, legalIds listed', () => {
    const r = calc([]);
    expect(r.days).toEqual([]);
    expect(r.totals.worked).toBe(0);
    expect(r.expectedGross).toBe(0);
    expect(r.legalIds).toEqual(expect.arrayContaining(['minWageHourly2026', 'dailyRegularMinutes', 'weeklyRegularMinutes', 'nightStart']));
  });
});
