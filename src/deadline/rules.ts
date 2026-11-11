import { addDays, addMonths, differenceInCalendarDays, format, isValid, parse, subMonths } from 'date-fns';
import { anyUnverified, legalNumber } from '../legal';
import type { LegalId } from '../legal/types';
import type { StayProfile, VisaType } from '../storage/db';

type StayInput = Omit<StayProfile, 'id'>;

export type ProfileError = 'badDate' | 'expiryBeforeEntry' | 'moveBeforeEntry' | 'futureEntry';

export type DeadlineKind =
  | 'arcRegistration'
  | 'addressChange'
  | 'extensionOpens'
  | 'stayExpiry'
  | 'jobChangeApply'
  | 'contractEnd'
  | 'passportExpiry';

/** daysLeft<0 | ≤7 | ≤30 | >30 */
export type DeadlineLevel = 'overdue' | 'urgent' | 'soon' | 'ok';

export interface DeadlineItem {
  kind: DeadlineKind;
  due: string;
  /** differenceInCalendarDays(due, today) */
  daysLeft: number;
  level: DeadlineLevel;
  legalIds: LegalId[];
  unverified: boolean;
  fineMaxWon: number | null;
}

const ISO = 'yyyy-MM-dd';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FIELDS = [
  'entryDate',
  'stayExpiry',
  'arcRegisteredOn',
  'lastMoveDate',
  'contractEnd',
  'leftJobOn',
  'passportExpiry',
] as const satisfies readonly (keyof StayInput)[];
const JOB_CHANGE_VISAS: readonly VisaType[] = ['E-9', 'H-2'];

function parseDate(s: string | null): Date | null {
  if (s === null || !DATE_RE.test(s)) return null;
  const d = parse(s, ISO, new Date(2000, 0, 1));
  if (!isValid(d) || format(d, ISO) !== s) return null;
  return d;
}

function toIso(d: Date): string {
  return format(d, ISO);
}

export function validateStayProfile(
  p: StayInput,
  today: string,
): Partial<Record<keyof StayInput, ProfileError>> {
  const errors: Partial<Record<keyof StayInput, ProfileError>> = {};
  for (const key of DATE_FIELDS) {
    const v = p[key];
    if (v !== null && parseDate(v) === null) errors[key] = 'badDate';
  }
  const entry = errors.entryDate ? null : parseDate(p.entryDate);
  const now = parseDate(today);
  if (entry && now && differenceInCalendarDays(entry, now) > 0) errors.entryDate = 'futureEntry';
  if (entry) {
    const expiry = errors.stayExpiry ? null : parseDate(p.stayExpiry);
    if (expiry && differenceInCalendarDays(expiry, entry) < 0) errors.stayExpiry = 'expiryBeforeEntry';
    const move = errors.lastMoveDate ? null : parseDate(p.lastMoveDate);
    if (move && differenceInCalendarDays(move, entry) < 0) errors.lastMoveDate = 'moveBeforeEntry';
  }
  return errors;
}

function levelOf(daysLeft: number): DeadlineLevel {
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 7) return 'urgent';
  if (daysLeft <= 30) return 'soon';
  return 'ok';
}

const KIND_ORDER: readonly DeadlineKind[] = [
  'arcRegistration',
  'addressChange',
  'extensionOpens',
  'stayExpiry',
  'jobChangeApply',
  'contractEnd',
  'passportExpiry',
];

/** due 오름차순. PLAN §4.9 규칙. 형식이 잘못된 날짜는 건너뛴다. */
export function buildTimeline(p: StayInput, today: string): DeadlineItem[] {
  const now = parseDate(today);
  if (!now) return [];
  const items: DeadlineItem[] = [];

  const push = (kind: DeadlineKind, due: Date, legalIds: LegalId[], fineMaxWon: number | null) => {
    const daysLeft = differenceInCalendarDays(due, now);
    let level = levelOf(daysLeft);
    if (kind === 'extensionOpens' && daysLeft < 0) level = 'ok';
    items.push({ kind, due: toIso(due), daysLeft, level, legalIds, unverified: anyUnverified(legalIds), fineMaxWon });
  };

  const entry = parseDate(p.entryDate);
  if (p.arcRegisteredOn === null && entry) {
    push('arcRegistration', addDays(entry, legalNumber('arcRegistrationDays')), ['arcRegistrationDays', 'arcLateFineMaxWon'], legalNumber('arcLateFineMaxWon'));
  }
  const move = parseDate(p.lastMoveDate);
  if (move) {
    push('addressChange', addDays(move, legalNumber('addressChangeReportDays')), ['addressChangeReportDays', 'addressLateFineMaxWon'], legalNumber('addressLateFineMaxWon'));
  }
  const expiry = parseDate(p.stayExpiry);
  if (expiry) {
    push('extensionOpens', subMonths(expiry, legalNumber('extensionOpensMonthsBefore')), ['extensionOpensMonthsBefore'], null);
    push('stayExpiry', expiry, ['overstayNote'], null);
  }
  const left = parseDate(p.leftJobOn);
  if (left && p.visaType !== null && JOB_CHANGE_VISAS.includes(p.visaType)) {
    push('jobChangeApply', addMonths(left, legalNumber('jobChangeApplyMonths')), ['jobChangeApplyMonths'], null);
  }
  const contract = parseDate(p.contractEnd);
  if (contract) push('contractEnd', contract, [], null);
  const passport = parseDate(p.passportExpiry);
  if (passport) push('passportExpiry', passport, [], null);

  return items.sort((a, b) =>
    a.due < b.due ? -1 : a.due > b.due ? 1 : KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
  );
}

/** overdue 또는 urgent 가 하나라도 (extensionOpens 제외) */
export function needsBanner(items: readonly DeadlineItem[]): boolean {
  return items.some((i) => i.kind !== 'extensionOpens' && (i.level === 'overdue' || i.level === 'urgent'));
}
