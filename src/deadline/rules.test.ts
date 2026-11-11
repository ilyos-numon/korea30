import { describe, expect, it } from 'vitest';
import { addDays, addMonths, format, parseISO, subMonths } from 'date-fns';
import { anyUnverified, legalNumber } from '../legal';
import type { StayProfile } from '../storage/db';
import { buildTimeline, needsBanner, validateStayProfile, type DeadlineItem } from './rules';

type StayInput = Omit<StayProfile, 'id'>;

const EMPTY: StayInput = {
  entryDate: null,
  visaType: null,
  stayExpiry: null,
  arcRegisteredOn: null,
  lastMoveDate: null,
  contractEnd: null,
  leftJobOn: null,
  passportExpiry: null,
};
const TODAY = '2026-12-25';
const iso = (d: Date) => format(d, 'yyyy-MM-dd');
const plus = (days: number) => iso(addDays(parseISO(TODAY), days));
const profile = (p: Partial<StayInput>): StayInput => ({ ...EMPTY, ...p });
const find = (items: DeadlineItem[], kind: DeadlineItem['kind']) => items.find((i) => i.kind === kind);

describe('buildTimeline', () => {
  it('entry 2026-10-01, not registered, today 2026-12-25 → arcRegistration due 2026-12-30 urgent', () => {
    const items = buildTimeline(profile({ entryDate: '2026-10-01' }), TODAY);
    const arc = find(items, 'arcRegistration');
    expect(arc).toBeDefined();
    expect(arc!.due).toBe('2026-12-30');
    expect(arc!.daysLeft).toBe(5);
    expect(arc!.level).toBe('urgent');
    expect(arc!.fineMaxWon).toBe(legalNumber('arcLateFineMaxWon'));
    expect(arc!.legalIds).toEqual(['arcRegistrationDays', 'arcLateFineMaxWon']);
    expect(arc!.unverified).toBe(anyUnverified(arc!.legalIds));
  });

  it('arcRegistration due follows legal arcRegistrationDays', () => {
    const [arc] = buildTimeline(profile({ entryDate: '2026-10-01' }), TODAY);
    expect(arc.due).toBe(iso(addDays(parseISO('2026-10-01'), legalNumber('arcRegistrationDays'))));
  });

  it('no arcRegistration once registered', () => {
    const items = buildTimeline(profile({ entryDate: '2026-10-01', arcRegisteredOn: '2026-11-01' }), TODAY);
    expect(find(items, 'arcRegistration')).toBeUndefined();
  });

  it('no arcRegistration without entryDate', () => {
    expect(buildTimeline(EMPTY, TODAY)).toEqual([]);
  });

  it.each([
    [-1, 'overdue'],
    [0, 'urgent'],
    [7, 'urgent'],
    [8, 'soon'],
    [30, 'soon'],
    [31, 'ok'],
  ] as const)('level boundary: daysLeft %i → %s', (days, level) => {
    const [item] = buildTimeline(profile({ contractEnd: plus(days) }), TODAY);
    expect(item.kind).toBe('contractEnd');
    expect(item.daysLeft).toBe(days);
    expect(item.level).toBe(level);
    expect(item.legalIds).toEqual([]);
    expect(item.unverified).toBe(false);
    expect(item.fineMaxWon).toBeNull();
  });

  it('addressChange from lastMoveDate with fine', () => {
    const items = buildTimeline(profile({ lastMoveDate: '2026-12-20' }), TODAY);
    const a = find(items, 'addressChange')!;
    expect(a.due).toBe(iso(addDays(parseISO('2026-12-20'), legalNumber('addressChangeReportDays'))));
    expect(a.fineMaxWon).toBe(legalNumber('addressLateFineMaxWon'));
  });

  it('stayExpiry produces extensionOpens and stayExpiry items', () => {
    const items = buildTimeline(profile({ stayExpiry: '2027-08-31' }), TODAY);
    const ext = find(items, 'extensionOpens')!;
    const exp = find(items, 'stayExpiry')!;
    expect(ext.due).toBe(iso(subMonths(parseISO('2027-08-31'), legalNumber('extensionOpensMonthsBefore'))));
    expect(exp.due).toBe('2027-08-31');
    expect(exp.legalIds).toEqual(['overstayNote']);
  });

  it('extensionOpens already passed shows level ok (window open)', () => {
    const items = buildTimeline(profile({ stayExpiry: plus(20) }), TODAY);
    const ext = find(items, 'extensionOpens')!;
    expect(ext.daysLeft).toBeLessThan(0);
    expect(ext.level).toBe('ok');
    expect(find(items, 'stayExpiry')!.level).toBe('soon');
  });

  it.each(['E-9', 'H-2'] as const)('%s with leftJobOn → jobChangeApply', (visaType) => {
    const items = buildTimeline(profile({ visaType, leftJobOn: '2026-12-10' }), TODAY);
    const j = find(items, 'jobChangeApply')!;
    expect(j.due).toBe(iso(addMonths(parseISO('2026-12-10'), legalNumber('jobChangeApplyMonths'))));
  });

  it.each(['E-7', 'F-4', 'other'] as const)('%s with leftJobOn → no jobChangeApply', (visaType) => {
    const items = buildTimeline(profile({ visaType, leftJobOn: '2026-12-10' }), TODAY);
    expect(find(items, 'jobChangeApply')).toBeUndefined();
  });

  it('sorted by due ascending', () => {
    const items = buildTimeline(
      profile({ entryDate: '2026-10-01', passportExpiry: '2026-12-26', contractEnd: '2027-03-01', stayExpiry: '2027-12-01' }),
      TODAY,
    );
    const dues = items.map((i) => i.due);
    expect(dues).toEqual([...dues].sort());
    expect(items[0].kind).toBe('passportExpiry');
  });

  it('skips malformed dates', () => {
    expect(buildTimeline(profile({ contractEnd: '2026-02-30' }), TODAY)).toEqual([]);
  });
});

describe('needsBanner', () => {
  it('true when an urgent item exists', () => {
    expect(needsBanner(buildTimeline(profile({ entryDate: '2026-10-01' }), TODAY))).toBe(true);
  });

  it('true when an overdue item exists', () => {
    expect(needsBanner(buildTimeline(profile({ contractEnd: plus(-3) }), TODAY))).toBe(true);
  });

  it('false when all items are soon or ok', () => {
    expect(needsBanner(buildTimeline(profile({ contractEnd: plus(8), passportExpiry: plus(100) }), TODAY))).toBe(false);
  });

  it('ignores extensionOpens even if urgent', () => {
    const ext: DeadlineItem = {
      kind: 'extensionOpens', due: plus(3), daysLeft: 3, level: 'urgent', legalIds: [], unverified: false, fineMaxWon: null,
    };
    expect(needsBanner([ext])).toBe(false);
  });

  it('false for empty list', () => {
    expect(needsBanner([])).toBe(false);
  });
});

describe('validateStayProfile', () => {
  it('valid profile → no errors', () => {
    expect(validateStayProfile(profile({ entryDate: '2026-10-01', stayExpiry: '2027-10-01', lastMoveDate: '2026-11-01' }), TODAY)).toEqual({});
  });

  it('badDate for malformed values', () => {
    const e = validateStayProfile(profile({ entryDate: '2026-13-01', passportExpiry: 'abc', contractEnd: '2026-02-29' }), TODAY);
    expect(e).toEqual({ entryDate: 'badDate', passportExpiry: 'badDate', contractEnd: 'badDate' });
  });

  it('futureEntry when entryDate after today', () => {
    expect(validateStayProfile(profile({ entryDate: '2026-12-26' }), TODAY)).toEqual({ entryDate: 'futureEntry' });
  });

  it('expiryBeforeEntry and moveBeforeEntry', () => {
    const e = validateStayProfile(profile({ entryDate: '2026-10-01', stayExpiry: '2026-09-30', lastMoveDate: '2026-09-01' }), TODAY);
    expect(e).toEqual({ stayExpiry: 'expiryBeforeEntry', lastMoveDate: 'moveBeforeEntry' });
  });
});
