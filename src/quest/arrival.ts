import type { ProgressStorage } from './progress';

export const ARRIVAL_KEY = 'korea30.arrival.v1';

export type ArrivalError = 'invalid' | 'future';

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const MIN_ISO = '2000-01-01';
const DAY_MS = 24 * 60 * 60 * 1000;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** 로컬 날짜 'YYYY-MM-DD' */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseParts(s: string): [number, number, number] {
  const [y, m, d] = s.split('-').map(Number);
  return [y, m, d];
}

/** 'YYYY-MM-DD' 형식이면서 실제 달력 날짜인지 */
export function isIsoDate(s: string): boolean {
  if (!ISO_RE.test(s)) return false;
  const [y, m, d] = parseParts(s);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** !isIsoDate || s < '2000-01-01' → 'invalid'; s > todayIso → 'future'; 아니면 null */
export function validateArrival(s: string, todayIso: string): ArrivalError | null {
  if (!isIsoDate(s) || s < MIN_ISO) return 'invalid';
  if (s > todayIso) return 'future';
  return null;
}

/** 저장값이 isIsoDate 아니면 null */
export function loadArrival(s: ProgressStorage): string | null {
  const raw = s.getItem(ARRIVAL_KEY);
  if (raw === null || !isIsoDate(raw)) return null;
  return raw;
}

export function saveArrival(s: ProgressStorage, iso: string): void {
  s.setItem(ARRIVAL_KEY, iso);
}

/** Date.UTC 로 두 날짜를 파싱해 일수 차 + 1. 같은 날 → 1. */
export function dPlus(arrivalIso: string, todayIso: string): number {
  const [ay, am, ad] = parseParts(arrivalIso);
  const [ty, tm, td] = parseParts(todayIso);
  const diff = Date.UTC(ty, tm - 1, td) - Date.UTC(ay, am - 1, ad);
  return Math.round(diff / DAY_MS) + 1;
}
